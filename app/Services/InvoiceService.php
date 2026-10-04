<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Enrollment;
use App\Models\Invoice;
use Illuminate\Support\Carbon;

class InvoiceService
{
    public function create(int $studentId, ?int $enrollmentId, string $type, string $description, float $amount, ?string $dueDate, float $discount = 0): Invoice
    {
        $invoice = Invoice::create([
            'student_id' => $studentId,
            'enrollment_id' => $enrollmentId,
            'type' => $type,
            'description' => $description,
            'subtotal' => $amount,
            'discount' => $discount,
            'total' => max(0, round($amount - $discount, 2)),
            'paid_amount' => 0,
            'due_date' => $dueDate,
            'status' => 'unpaid',
        ]);

        $invoice->update(['invoice_no' => 'INV-'.str_pad((string) $invoice->id, 6, '0', STR_PAD_LEFT)]);

        return $invoice;
    }

    /** Registration invoice + one invoice per installment (or a single course-fee invoice). */
    public function generateForEnrollment(Enrollment $enrollment): void
    {
        if (Invoice::where('enrollment_id', $enrollment->id)->exists()) {
            return;
        }

        $enrollment->loadMissing('batch.course.feeStructure');
        $batch = $enrollment->batch;
        $course = $batch->course;
        $fee = $course->feeStructure;

        if (! $fee) {
            return;
        }

        $start = $batch->start_date ? $batch->start_date->copy() : Carbon::today();

        if ($fee->registration_fee > 0) {
            $this->create($enrollment->student_id, $enrollment->id, 'registration',
                'Registration fee - '.$course->name, $fee->registration_fee, Carbon::today()->toDateString());
        }

        $plan = $fee->installments ?: [];

        if (! count($plan) && $fee->course_fee > 0) {
            $plan = [['label' => 'Course fee', 'amount' => $fee->course_fee, 'due_after_days' => 0]];
        }

        foreach ($plan as $i => $row) {
            $this->create(
                $enrollment->student_id,
                $enrollment->id,
                'installment',
                ($row['label'] ?? 'Installment '.($i + 1)).' - '.$course->name,
                (float) $row['amount'],
                $start->copy()->addDays((int) ($row['due_after_days'] ?? 0))->toDateString()
            );
        }
    }
}
