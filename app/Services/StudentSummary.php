<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Student;

/** Numbers about one student, reused by the dashboard, the "My records" page and the admin student profile. */
class StudentSummary
{
    public static function attendance(Student $student): array
    {
        $rows = Attendance::where('student_id', $student->id)
            ->join('timetable_entries', 'timetable_entries.id', '=', 'attendances.timetable_entry_id')
            ->join('subjects', 'subjects.id', '=', 'timetable_entries.subject_id')
            ->selectRaw('subjects.name as subject, count(*) as total, sum(case when attendances.status in (\'present\',\'late\') then 1 else 0 end) as attended')
            ->groupBy('subjects.name')->get()
            ->map(fn ($r) => [
                'subject' => $r->subject,
                'total' => (int) $r->total,
                'attended' => (int) $r->attended,
                'percent' => $r->total ? round($r->attended / $r->total * 100, 1) : 0,
            ]);

        $total = $rows->sum('total');

        return [
            'overall' => $total ? round($rows->sum('attended') / $total * 100, 1) : null,
            'subjects' => $rows->values()->all(),
        ];
    }

    public static function invoices(Student $student): array
    {
        $invoices = Invoice::where('student_id', $student->id)->where('status', '!=', 'cancelled')->get();
        $next = $invoices->whereIn('status', ['unpaid', 'partial'])->sortBy('due_date')->first();

        return [
            'total' => round($invoices->sum('total'), 2),
            'paid' => round($invoices->sum('paid_amount'), 2),
            'outstanding' => round($invoices->sum('balance'), 2),
            'next_due' => $next ? ['invoice_no' => $next->invoice_no, 'description' => $next->description, 'due_date' => $next->due_date?->toDateString(), 'balance' => $next->balance] : null,
        ];
    }

    /** Announcements this student should see: everyone, all students, or their batch. */
    public static function announcements(Student $student, int $limit = 20)
    {
        $batchIds = Enrollment::where('student_id', $student->id)->where('status', 'approved')->pluck('batch_id');

        return Announcement::with('creator:id,name')
            ->where(function ($q) use ($batchIds) {
                $q->whereIn('audience', ['all', 'students'])
                    ->orWhere(fn ($b) => $b->where('audience', 'batch')->whereIn('batch_id', $batchIds));
            })->latest()->limit($limit)->get();
    }
}
