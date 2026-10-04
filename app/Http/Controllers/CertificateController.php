<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Result;
use App\Models\Setting;
use App\Models\TimetableEntry;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Certificate flow: requirements -> attendance -> academic result -> finance clearance -> certificate with a verification number. */
class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $eligibility = null;
        $selected = $request->query('enrollment_id');

        if ($selected) {
            $enrollment = Enrollment::with(['student.user:id,name', 'batch.course:id,name'])->findOrFail($selected);
            $eligibility = ['enrollment_id' => $enrollment->id, 'student' => $enrollment->student->user->name, 'student_no' => $enrollment->student->student_no,
                'course' => $enrollment->batch->course->name, 'batch' => $enrollment->batch->name, 'checks' => $this->checks($enrollment)];
        }

        $issued = Certificate::whereNotNull('id')->pluck('enrollment_id');

        return Inertia::render('Certificates/Index', [
            'certificates' => Certificate::with(['student.user:id,name', 'enrollment.batch.course:id,name'])->orderByDesc('id')->paginate(15)->withQueryString()
                ->through(fn ($c) => [
                    'id' => $c->id, 'certificate_no' => $c->certificate_no, 'student' => $c->student->user->name, 'student_no' => $c->student->student_no,
                    'course' => $c->enrollment->batch->course->name, 'issued_at' => $c->issued_at, 'status' => $c->status,
                ]),
            'candidates' => Enrollment::with(['student.user:id,name', 'batch.course:id,name'])->where('status', 'approved')->whereNotIn('id', $issued)->get()
                ->map(fn ($e) => ['value' => $e->id, 'label' => $e->student->user->name.' ('.$e->student->student_no.') - '.$e->batch->course->name.' / '.$e->batch->name]),
            'eligibility' => $eligibility,
            'selected' => $selected ? (int) $selected : null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['enrollment_id' => 'required|exists:enrollments,id', 'override' => 'boolean']);
        $enrollment = Enrollment::with('student.user')->findOrFail($data['enrollment_id']);

        if (Certificate::where('enrollment_id', $enrollment->id)->exists()) {
            return back()->with('error', 'A certificate was already issued for this enrollment.');
        }

        $checks = $this->checks($enrollment);
        $failed = collect($checks)->where('pass', false);

        if ($failed->isNotEmpty() && ! ($request->boolean('override') && $request->user()->role === 'super_admin')) {
            return back()->with('error', 'Not eligible yet: '.$failed->pluck('label')->implode(', ').'.');
        }

        $certificate = Certificate::create([
            'student_id' => $enrollment->student_id, 'enrollment_id' => $enrollment->id,
            'issued_at' => now(), 'issued_by' => $request->user()->id, 'status' => 'valid',
        ]);
        $certificate->update(['certificate_no' => 'IMDR-CERT-'.str_pad((string) $certificate->id, 6, '0', STR_PAD_LEFT)]);
        $enrollment->update(['status' => 'completed']);

        AuditLog::record('certificate.issued', $certificate, "Certificate {$certificate->certificate_no} issued", ['override' => $failed->isNotEmpty()]);
        NotificationService::send($enrollment->student->user_id, 'Certificate available', 'Your certificate '.$certificate->certificate_no.' is ready.', 'success', '/portal/my/certificates');

        return redirect('/portal/certificates')->with('success', "Certificate {$certificate->certificate_no} issued.");
    }

    public function revoke(Certificate $certificate)
    {
        $certificate->update(['status' => 'revoked']);
        AuditLog::record('certificate.revoked', $certificate, "Certificate {$certificate->certificate_no} revoked");

        return back()->with('success', 'Certificate revoked. It will show as invalid when verified.');
    }

    /** Student: my certificates. */
    public function mine(Request $request)
    {
        $student = $request->user()->student;
        abort_unless($student, 403);

        return Inertia::render('Student/Certificates', [
            'certificates' => Certificate::with('enrollment.batch.course:id,name')->where('student_id', $student->id)->orderByDesc('id')->get()
                ->map(fn ($c) => ['id' => $c->id, 'certificate_no' => $c->certificate_no, 'course' => $c->enrollment->batch->course->name, 'issued_at' => $c->issued_at, 'status' => $c->status]),
        ]);
    }

    /** Printable certificate. */
    public function show(Request $request, Certificate $certificate)
    {
        $user = $request->user();

        if ($user->role === 'student') {
            abort_unless($user->student && $certificate->student_id === $user->student->id, 403, 'You cannot open this certificate.');
        } else {
            abort_unless(in_array($user->role, ['super_admin', 'admin'], true), 403, 'You do not have permission to open this page.');
        }

        $certificate->load(['student.user:id,name', 'enrollment.batch.course:id,name,duration']);

        return Inertia::render('Certificates/Print', [
            'certificate' => [
                'certificate_no' => $certificate->certificate_no, 'status' => $certificate->status, 'issued_at' => $certificate->issued_at,
                'student' => $certificate->student->user->name, 'student_no' => $certificate->student->student_no,
                'course' => $certificate->enrollment->batch->course->name, 'batch' => $certificate->enrollment->batch->name,
                'verify_url' => url('/verify/'.$certificate->certificate_no),
            ],
        ]);
    }

    private function checks(Enrollment $e): array
    {
        $held = TimetableEntry::where('batch_id', $e->batch_id)->where('status', 'held')->pluck('id');
        $attended = Attendance::whereIn('timetable_entry_id', $held)->where('student_id', $e->student_id)->whereIn('status', ['present', 'late'])->count();
        $percent = $held->count() ? round($attended / $held->count() * 100, 1) : null;
        $min = (float) Setting::get('min_attendance_percent', 75);

        $results = Result::where('student_id', $e->student_id)->where('batch_id', $e->batch_id)->where('published', true)->get();
        $avg = $results->count() ? round($results->avg(fn ($r) => $r->max_marks > 0 ? $r->marks / $r->max_marks * 100 : 0), 1) : null;

        $outstanding = round(Invoice::where('enrollment_id', $e->id)->whereNotIn('status', ['paid', 'cancelled'])->get()->sum('balance'), 2);
        $clearanceNeeded = Setting::bool('certificate_requires_clearance');

        return [
            ['label' => "Attendance at least {$min}%", 'pass' => $percent !== null && $percent >= $min, 'detail' => $percent === null ? 'No classes have been held yet' : "{$percent}% ({$attended} of {$held->count()} classes)"],
            ['label' => 'Published results with an average of 40% or more', 'pass' => $avg !== null && $avg >= 40, 'detail' => $avg === null ? 'No published results' : "Average {$avg}% across {$results->count()} results"],
            ['label' => 'Fees cleared', 'pass' => ! $clearanceNeeded || $outstanding <= 0, 'detail' => $outstanding > 0 ? 'Outstanding Rs. '.number_format($outstanding, 2).($clearanceNeeded ? '' : ' (not required by settings)') : 'No outstanding fees'],
        ];
    }
}
