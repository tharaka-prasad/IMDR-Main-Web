<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\AssignmentSubmission;
use App\Models\Batch;
use App\Models\ContactMessage;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Lecturer;
use App\Models\Payment;
use App\Models\PaymentTransaction;
use App\Models\PayrollPeriod;
use App\Models\Student;
use App\Models\TimetableEntry;
use App\Models\WhatsAppMessage;
use App\Services\FinanceReport;
use App\Services\StudentSummary;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $data = match ($user->role) {
            'super_admin', 'admin' => $this->admin(),
            'accountant' => $this->accountant(),
            'lecturer' => $this->lecturer($request),
            default => $this->student($request),
        };

        return Inertia::render('Dashboard', ['role' => $user->role, 'data' => $data]);
    }

    private function money(): array
    {
        $today = today();
        $month = FinanceReport::range($today->copy()->startOfMonth()->toDateString(), $today->toDateString());
        $day = FinanceReport::range($today->toDateString(), $today->toDateString());

        return [
            'today_income' => $day['income_net'],
            'month_income' => $month['income_net'],
            'month_spending' => round($month['expenses'] + $month['payroll'], 2),
            'outstanding' => FinanceReport::outstanding(),
            'chart' => FinanceReport::monthly(6),
        ];
    }

    private function admin(): array
    {
        $delayed = Invoice::whereIn('status', ['unpaid', 'partial'])->whereNotNull('due_date')->whereDate('due_date', '<', today())
            ->distinct()->count('student_id');

        return [
            'counts' => [
                'students' => Student::count(),
                'courses' => Course::count(),
                'batches' => Batch::whereIn('status', ['open', 'running'])->count(),
                'lecturers' => Lecturer::count(),
            ],
            'pending_registrations' => Enrollment::where('status', 'pending')->count(),
            'pending_payments' => PaymentTransaction::where('status', 'pending')->count(),
            'todays_classes' => TimetableEntry::whereDate('date', today())->where('status', '!=', 'cancelled')->count(),
            'unread_messages' => ContactMessage::where('is_read', false)->count(),
            'delayed_students' => $delayed,
            'finance' => $this->money(),
            'recent_registrations' => Enrollment::with(['student.user:id,name', 'batch.course:id,name'])->where('status', 'pending')->latest()->limit(6)->get()
                ->map(fn ($e) => [
                    'id' => $e->id, 'student_id' => $e->student_id, 'name' => $e->student->user->name, 'student_no' => $e->student->student_no,
                    'course' => $e->batch->course->name, 'batch' => $e->batch->name, 'created_at' => $e->created_at,
                ]),
        ];
    }

    private function accountant(): array
    {
        return [
            'finance' => $this->money(),
            'pending_payments' => PaymentTransaction::where('status', 'pending')->count(),
            'pending_payroll' => PayrollPeriod::where('status', '!=', 'paid')->count(),
            'failed_whatsapp' => WhatsAppMessage::where('status', 'failed')->whereDate('created_at', '>=', now()->subDays(7))->count(),
            'overdue' => Invoice::with('student.user:id,name')->whereIn('status', ['unpaid', 'partial'])->whereNotNull('due_date')
                ->whereDate('due_date', '<', today())->orderBy('due_date')->limit(8)->get()
                ->map(fn ($i) => [
                    'id' => $i->id, 'invoice_no' => $i->invoice_no, 'student' => $i->student->user->name, 'student_no' => $i->student->student_no,
                    'balance' => $i->balance, 'due_date' => $i->due_date->toDateString(),
                ]),
            'recent_payments' => Payment::with('student.user:id,name')->latest('paid_at')->limit(6)->get()
                ->map(fn ($p) => ['id' => $p->id, 'receipt_no' => $p->receipt_no, 'student' => $p->student->user->name, 'amount' => $p->amount, 'method' => $p->method, 'paid_at' => $p->paid_at]),
        ];
    }

    private function lecturer(Request $request): array
    {
        $lecturer = $request->user()->lecturer;
        $mine = fn () => TimetableEntry::with(['batch:id,name', 'subject:id,name', 'classroom:id,name'])->where('lecturer_id', $lecturer?->id ?? 0)->where('status', '!=', 'cancelled');

        return [
            'todays' => $mine()->whereDate('date', today())->orderBy('start_time')->get(),
            'upcoming' => $mine()->whereDate('date', '>', today())->orderBy('date')->orderBy('start_time')->limit(6)->get(),
            'to_mark' => AssignmentSubmission::whereNull('marked_at')
                ->whereIn('assignment_id', \App\Models\Assignment::where('created_by', $request->user()->id)->pluck('id'))->count(),
            'batches' => $lecturer ? $lecturer->assignments()->distinct()->count('batch_id') : 0,
            'announcements' => Announcement::latest()->limit(4)->get(['id', 'title', 'created_at']),
        ];
    }

    private function student(Request $request): array
    {
        $student = $request->user()->student;
        abort_unless($student, 403, 'No student profile is linked to this account.');

        $batchIds = Enrollment::where('student_id', $student->id)->where('status', 'approved')->pluck('batch_id');

        return [
            'student_no' => $student->student_no,
            'enrollments' => Enrollment::with('batch.course:id,name')->where('student_id', $student->id)->latest()->get()
                ->map(fn ($e) => ['id' => $e->id, 'course' => $e->batch->course->name, 'batch' => $e->batch->name, 'status' => $e->status, 'remarks' => $e->remarks]),
            'money' => StudentSummary::invoices($student),
            'attendance' => StudentSummary::attendance($student)['overall'],
            'upcoming' => TimetableEntry::with(['subject:id,name', 'classroom:id,name'])->whereIn('batch_id', $batchIds)
                ->where('status', '!=', 'cancelled')->whereDate('date', '>=', today())->orderBy('date')->orderBy('start_time')->limit(5)->get(),
            'announcements' => StudentSummary::announcements($student, 4),
        ];
    }
}
