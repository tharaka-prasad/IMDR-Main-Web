<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Setting;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Registrations: approve or reject students who applied. */
class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');
        $q = Enrollment::with(['student.user:id,name,phone', 'batch.course:id,name'])->orderByDesc('id');

        if ($status !== 'all') {
            $q->where('status', $status);
        }

        if ($s = trim((string) $request->query('search', ''))) {
            $q->whereHas('student', fn ($st) => $st->where('student_no', 'like', "%{$s}%")
                ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$s}%")));
        }

        $page = $q->paginate(15)->withQueryString();
        $ids = $page->getCollection()->pluck('id');
        $reg = Invoice::whereIn('enrollment_id', $ids)->where('type', 'registration')->get()->keyBy('enrollment_id');
        $due = Invoice::whereIn('enrollment_id', $ids)->where('status', '!=', 'cancelled')->get()->groupBy('enrollment_id')
            ->map(fn ($g) => round($g->sum('balance'), 2));

        return Inertia::render('Registrations/Index', [
            'enrollments' => $page->through(fn ($e) => [
                'id' => $e->id,
                'student_id' => $e->student_id,
                'name' => $e->student->user->name,
                'student_no' => $e->student->student_no,
                'phone' => $e->student->user->phone,
                'course' => $e->batch->course->name,
                'batch' => $e->batch->name,
                'status' => $e->status,
                'remarks' => $e->remarks,
                'created_at' => $e->created_at,
                'registration_invoice' => $reg->has($e->id) ? ['invoice_no' => $reg[$e->id]->invoice_no, 'status' => $reg[$e->id]->status, 'total' => $reg[$e->id]->total] : null,
                'outstanding' => $due->get($e->id, 0),
            ]),
            'filters' => ['status' => $status, 'search' => $request->query('search', '')],
            'feeRequired' => Setting::bool('registration_fee_mandatory'),
        ]);
    }

    public function approve(Request $request, Enrollment $enrollment)
    {
        if ($enrollment->status !== 'pending') {
            return back()->with('error', 'Only pending registrations can be approved.');
        }

        $force = $request->boolean('force');

        if (Setting::bool('registration_fee_mandatory') && ! $force) {
            $reg = Invoice::where('enrollment_id', $enrollment->id)->where('type', 'registration')->first();

            if ($reg && $reg->status !== 'paid') {
                return back()->with('error', 'The registration fee has not been paid yet. Wait for the payment, or use "Approve anyway" if the student has been cleared.');
            }
        }

        $enrollment->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'remarks' => $request->input('remarks'),
        ]);

        $enrollment->student->user->update(['status' => 'active']);

        AuditLog::record('enrollment.approved', $enrollment, 'Registration approved', ['forced' => $force]);
        NotificationService::send($enrollment->student->user_id, 'Registration approved',
            'Welcome to IMDR. Your learning portal is now open.', 'success', '/portal');

        return back()->with('success', $enrollment->student->user->name.' was approved.');
    }

    public function reject(Request $request, Enrollment $enrollment)
    {
        $data = $request->validate(['remarks' => 'required|string|max:500']);

        if ($enrollment->status !== 'pending') {
            return back()->with('error', 'Only pending registrations can be rejected.');
        }

        $enrollment->update(['status' => 'rejected', 'remarks' => $data['remarks']]);
        Invoice::where('enrollment_id', $enrollment->id)->where('paid_amount', 0)->update(['status' => 'cancelled']);

        AuditLog::record('enrollment.rejected', $enrollment, 'Registration rejected', $data);
        NotificationService::send($enrollment->student->user_id, 'Registration not approved', $data['remarks'], 'warning', '/portal');

        return back()->with('success', 'Registration rejected.');
    }
}
