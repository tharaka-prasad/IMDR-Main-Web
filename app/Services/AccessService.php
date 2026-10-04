<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Setting;
use App\Models\Student;

/**
 * Decides whether a student may use the LMS (materials, assignments, quizzes).
 *
 *  - No approved registration  -> blocked (pending_approval / no_enrollment)
 *  - Any invoice past its due date (plus grace days) that is still unpaid -> blocked (payment_delay)
 *  - An admin can grant a temporary override for a delayed payer.
 */
class AccessService
{
    public static function forStudent(Student $student): array
    {
        $statuses = $student->enrollments()->pluck('status');
        $approved = $statuses->contains('approved');
        $pending = $statuses->contains('pending');

        $grace = (int) Setting::get('payment_grace_days', 0);
        $cutoff = today()->subDays($grace)->toDateString();

        $overdue = Invoice::where('student_id', $student->id)
            ->whereIn('status', ['unpaid', 'partial'])
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', $cutoff)
            ->orderBy('due_date')
            ->get();

        $until = $student->lms_access_override_until;
        $overrideActive = $until && $until->gte(today());

        $reason = null;

        if (! $approved) {
            $reason = $pending ? 'pending_approval' : 'no_enrollment';
        } elseif ($overdue->isNotEmpty()) {
            $reason = 'payment_delay';
        }

        return [
            'allowed' => $reason === null || ($reason === 'payment_delay' && $overrideActive),
            'reason' => $reason,
            'overdue_total' => round($overdue->sum('balance'), 2),
            'overdue' => $overdue->map(fn ($i) => [
                'id' => $i->id,
                'invoice_no' => $i->invoice_no,
                'description' => $i->description,
                'balance' => $i->balance,
                'due_date' => $i->due_date?->toDateString(),
                'days_late' => (int) $i->due_date?->diffInDays(today()),
            ])->values()->all(),
            'override_until' => $overrideActive ? $until->toDateString() : null,
        ];
    }
}
