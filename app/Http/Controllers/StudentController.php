<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Result;
use App\Models\Student;
use App\Models\StudentDocument;
use App\Models\WhatsAppMessage;
use App\Services\AccessService;
use App\Services\EnrollmentService;
use App\Services\NotificationService;
use App\Services\StudentService;
use App\Services\StudentSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/** Admin side of students: search, register (with login), full profile with documents. */
class StudentController extends Controller
{
    private function openBatches()
    {
        return Batch::with('course:id,name')->where('status', 'open')->orderBy('start_date')->get()
            ->map(fn ($b) => [
                'value' => $b->id,
                'label' => $b->course->name.' - '.$b->name,
                'seats_left' => max(0, $b->capacity - $b->enrollments()->whereIn('status', ['pending', 'approved'])->count()),
            ]);
    }

    public function index(Request $request)
    {
        $q = Student::with(['user:id,name,username,email,phone,status', 'enrollments.batch:id,name,course_id', 'enrollments.batch.course:id,name'])->orderByDesc('id');

        if (($s = trim((string) $request->query('search', ''))) !== '') {
            $q->where(function ($w) use ($s) {
                $w->where('student_no', 'like', "%{$s}%")->orWhere('nic', 'like', "%{$s}%")
                    ->orWhere('whatsapp_number', 'like', "%{$s}%")->orWhere('guardian_name', 'like', "%{$s}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$s}%")->orWhere('username', 'like', "%{$s}%")
                        ->orWhere('email', 'like', "%{$s}%")->orWhere('phone', 'like', "%{$s}%"));
            });
        }

        if ($request->filled('batch_id')) {
            $q->whereHas('enrollments', fn ($e) => $e->where('batch_id', $request->query('batch_id')));
        }

        if ($request->filled('status')) {
            $q->whereHas('user', fn ($u) => $u->where('status', $request->query('status')));
        }

        if ($request->query('payment') === 'delayed') {
            $q->whereIn('id', Invoice::whereIn('status', ['unpaid', 'partial'])->whereNotNull('due_date')->whereDate('due_date', '<', today())->pluck('student_id'));
        }

        $students = $q->paginate(15)->withQueryString()->through(function ($st) {
            $access = AccessService::forStudent($st);

            return [
                'id' => $st->id,
                'student_no' => $st->student_no,
                'name' => $st->user->name,
                'username' => $st->user->username,
                'phone' => $st->user->phone,
                'nic' => $st->nic,
                'user_status' => $st->user->status,
                'enrollments' => $st->enrollments->map(fn ($e) => ['course' => $e->batch->course->name, 'batch' => $e->batch->name, 'status' => $e->status])->values(),
                'lms_reason' => $access['reason'],
                'lms_allowed' => $access['allowed'],
                'overdue_total' => $access['overdue_total'],
            ];
        });

        return Inertia::render('Students/Index', [
            'students' => $students,
            'filters' => [
                'search' => $s,
                'batch_id' => $request->query('batch_id', ''),
                'status' => $request->query('status', ''),
                'payment' => $request->query('payment', ''),
            ],
            'batches' => Batch::with('course:id,name')->orderByDesc('start_date')->get()->map(fn ($b) => ['value' => $b->id, 'label' => $b->course->name.' - '.$b->name]),
        ]);
    }

    public function create()
    {
        return Inertia::render('Students/Create', ['batches' => $this->openBatches()]);
    }

    public function store(Request $request, StudentService $students, EnrollmentService $enrollments)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'username' => 'nullable|alpha_dash|max:60|unique:users,username',
            'password' => 'nullable|string|min:8',
            'phone' => 'required|string|max:30',
            'whatsapp_number' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:160|unique:users,email',
            'nic' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable|string|max:500',
            'school' => 'nullable|string|max:160',
            'guardian_name' => 'nullable|string|max:120',
            'guardian_phone' => 'nullable|string|max:30',
            'notes' => 'nullable|string|max:2000',
            'batch_id' => 'nullable|exists:batches,id',
            'approve_now' => 'boolean',
            'birth_certificate' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,webp',
            'result_sheet' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,webp',
            'nic_copy' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,webp',
            'other_document' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,webp,doc,docx',
            'other_title' => 'nullable|string|max:120',
        ]);

        [$student, $user, $password] = DB::transaction(function () use ($data, $request, $students, $enrollments) {
            [$student, $user, $password] = $students->create(
                collect($data)->only(['name', 'username', 'email', 'phone', 'password'])->all(),
                collect($data)->only(['nic', 'date_of_birth', 'gender', 'address', 'school', 'guardian_name', 'guardian_phone', 'whatsapp_number', 'notes'])->all(),
                'active'
            );

            if (! empty($data['batch_id'])) {
                $enrollment = $enrollments->enroll($student, Batch::findOrFail($data['batch_id']));

                if (! empty($data['approve_now'])) {
                    $enrollment->update(['status' => 'approved', 'approved_by' => $request->user()->id, 'approved_at' => now()]);
                }
            }

            foreach (['birth_certificate' => 'birth_certificate', 'result_sheet' => 'result_sheet', 'nic_copy' => 'nic', 'other_document' => 'other'] as $input => $type) {
                if ($request->hasFile($input)) {
                    $this->saveDocument($student, $request->file($input), $type, $type === 'other' ? ($data['other_title'] ?? null) : null, $request->user()->id);
                }
            }

            return [$student, $user, $password];
        });

        AuditLog::record('created', $student, "Student {$student->student_no} registered by staff");

        return redirect("/portal/students/{$student->id}")
            ->with('success', "Student registered. Student ID: {$student->student_no}")
            ->with('credentials', ['name' => $user->name, 'username' => $user->username, 'password' => $password, 'student_no' => $student->student_no]);
    }

    public function show(Request $request, Student $student)
    {
        $student->load(['user', 'documents', 'enrollments.batch.course:id,name']);

        $invoices = Invoice::where('student_id', $student->id)->where('status', '!=', 'cancelled')->orderBy('due_date')->get();

        return Inertia::render('Students/Show', [
            'student' => [
                ...Arr::only($student->attributesToArray(), ['id', 'student_no', 'nic', 'date_of_birth', 'gender', 'address', 'school', 'guardian_name', 'guardian_phone', 'whatsapp_number', 'notes', 'lms_access_override_until']),
                'name' => $student->user->name,
                'username' => $student->user->username,
                'email' => $student->user->email,
                'phone' => $student->user->phone,
                'user_status' => $student->user->status,
                'registered_at' => $student->created_at,
            ],
            'documents' => $student->documents->sortByDesc('id')->values()->map(fn ($d) => [
                'id' => $d->id, 'type' => $d->type, 'type_label' => StudentDocument::TYPES[$d->type] ?? $d->type, 'title' => $d->title,
                'file_name' => $d->file_name, 'mime' => $d->mime, 'size' => $d->size, 'created_at' => $d->created_at,
            ]),
            'docTypes' => collect(StudentDocument::TYPES)->map(fn ($l, $v) => ['value' => $v, 'label' => $l])->values(),
            'enrollments' => $student->enrollments->map(fn ($e) => [
                'id' => $e->id, 'course' => $e->batch->course->name, 'batch' => $e->batch->name, 'status' => $e->status,
                'approved_at' => $e->approved_at, 'remarks' => $e->remarks,
            ])->values(),
            'invoices' => $invoices,
            'money' => StudentSummary::invoices($student),
            'payments' => Payment::where('student_id', $student->id)->latest('paid_at')->limit(15)->get(['id', 'receipt_no', 'amount', 'method', 'paid_at', 'status']),
            'attendance' => StudentSummary::attendance($student),
            'results' => Result::with(['subject:id,name'])->where('student_id', $student->id)->latest()->get()
                ->map(fn ($r) => ['id' => $r->id, 'subject' => $r->subject->name, 'assessment' => $r->assessment, 'marks' => $r->marks, 'max_marks' => $r->max_marks, 'grade' => $r->grade, 'published' => $r->published]),
            'access' => AccessService::forStudent($student),
            'whatsapp' => WhatsAppMessage::where('student_id', $student->id)->latest()->limit(5)->get(['id', 'status', 'created_at', 'error']),
            'batches' => $this->openBatches(),
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'username' => ['required', 'alpha_dash', 'max:60', Rule::unique('users', 'username')->ignore($student->user_id)],
            'email' => ['nullable', 'email', 'max:160', Rule::unique('users', 'email')->ignore($student->user_id)],
            'phone' => 'required|string|max:30',
            'user_status' => 'required|in:active,pending,suspended',
            'whatsapp_number' => 'nullable|string|max:30',
            'nic' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable|string|max:500',
            'school' => 'nullable|string|max:160',
            'guardian_name' => 'nullable|string|max:120',
            'guardian_phone' => 'nullable|string|max:30',
            'notes' => 'nullable|string|max:2000',
        ]);

        DB::transaction(function () use ($student, $data) {
            $student->user->update([
                'name' => $data['name'], 'username' => $data['username'], 'email' => $data['email'] ?? null,
                'phone' => $data['phone'], 'status' => $data['user_status'],
            ]);
            $student->update(collect($data)->only(['nic', 'date_of_birth', 'gender', 'address', 'school', 'guardian_name', 'guardian_phone', 'whatsapp_number', 'notes'])->all());
        });

        AuditLog::record('updated', $student, "Student {$student->student_no} updated");

        return back()->with('success', 'Student details saved.');
    }

    /** Generates a new password and shows it once. */
    public function resetPassword(Student $student)
    {
        $password = Str::random(8);
        $student->user->update(['password' => $password]);
        AuditLog::record('student.password_reset', $student, "Password reset for {$student->student_no}");

        return back()
            ->with('success', 'A new password was created. Give it to the student now - it is not stored in readable form.')
            ->with('credentials', ['name' => $student->user->name, 'username' => $student->user->username, 'password' => $password, 'student_no' => $student->student_no]);
    }

    /** Keep the LMS open for a student who is late with a payment, until a chosen date (or remove the override). */
    public function lmsOverride(Request $request, Student $student)
    {
        $data = $request->validate(['until' => 'nullable|date|after_or_equal:today']);

        $student->update(['lms_access_override_until' => $data['until'] ?? null]);
        AuditLog::record('student.lms_override', $student, 'LMS override '.($data['until'] ?? 'removed'));

        return back()->with('success', $data['until'] ? 'LMS access will stay open until '.$data['until'].'.' : 'LMS override removed.');
    }

    public function enroll(Request $request, Student $student, EnrollmentService $enrollments)
    {
        $data = $request->validate(['batch_id' => 'required|exists:batches,id', 'approve_now' => 'boolean']);

        $enrollment = $enrollments->enroll($student, Batch::findOrFail($data['batch_id']));

        if (! empty($data['approve_now'])) {
            $enrollment->update(['status' => 'approved', 'approved_by' => $request->user()->id, 'approved_at' => now()]);
            $student->user->update(['status' => 'active']);
        }

        AuditLog::record('created', $enrollment, "Student {$student->student_no} enrolled");

        return back()->with('success', 'Student registered on the batch and the fee invoices were created.');
    }

    private function saveDocument(Student $student, $file, string $type, ?string $title, int $userId): void
    {
        [$path, $name, $mime, $size] = Concerns::storeUpload($file, 'students/'.$student->id);

        StudentDocument::create([
            'student_id' => $student->id, 'type' => $type, 'title' => $title, 'file_path' => $path,
            'file_name' => $name, 'mime' => $mime, 'size' => $size, 'uploaded_by' => $userId,
        ]);
    }
}
