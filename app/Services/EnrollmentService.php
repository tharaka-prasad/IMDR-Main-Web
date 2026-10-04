<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

class EnrollmentService
{
    public function __construct(private InvoiceService $invoices)
    {
    }

    /** Register a student on a batch and raise the fee invoices. Status starts as "pending". */
    public function enroll(Student $student, Batch $batch): Enrollment
    {
        throw_unless($batch->status === 'open', BusinessException::class, 'This batch is not open for registration.');

        $existing = Enrollment::where('student_id', $student->id)->where('batch_id', $batch->id)->first();

        if ($existing && ! in_array($existing->status, ['cancelled', 'rejected'], true)) {
            throw new BusinessException('This student is already registered for the batch.');
        }

        $taken = Enrollment::where('batch_id', $batch->id)->whereIn('status', ['pending', 'approved'])->count();
        throw_if($taken >= $batch->capacity, BusinessException::class, 'This batch is full.');

        return DB::transaction(function () use ($student, $batch, $existing) {
            if ($existing) {
                $existing->update(['status' => 'pending', 'remarks' => null, 'approved_by' => null, 'approved_at' => null]);
                $enrollment = $existing;
            } else {
                $enrollment = Enrollment::create([
                    'student_id' => $student->id,
                    'batch_id' => $batch->id,
                    'status' => 'pending',
                ]);
            }

            $this->invoices->generateForEnrollment($enrollment);

            return $enrollment;
        });
    }
}
