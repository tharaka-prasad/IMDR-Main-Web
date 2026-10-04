<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Course;
use App\Models\CourseType;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\User;
use App\Services\EnrollmentService;
use App\Services\StudentService;

/** Builds the small world every test needs: a course with fees, an open batch and a student. */
trait TestHelpers
{
    protected function makeBatch(): Batch
    {
        $type = CourseType::create(['name' => 'Diploma', 'level' => 3]);
        $course = Course::create([
            'course_type_id' => $type->id, 'code' => 'DMC', 'name' => 'Diploma in Media', 'slug' => 'diploma-in-media',
            'duration' => '12 months', 'is_published' => true,
        ]);
        $course->feeStructure()->create([
            'registration_fee' => 5000, 'course_fee' => 60000,
            'installments' => [
                ['label' => 'Installment 1', 'amount' => 20000, 'due_after_days' => 0],
                ['label' => 'Installment 2', 'amount' => 20000, 'due_after_days' => 30],
                ['label' => 'Installment 3', 'amount' => 20000, 'due_after_days' => 60],
            ],
        ]);

        return Batch::create([
            'course_id' => $course->id, 'name' => 'Test intake', 'code' => 'DMC-T1',
            'start_date' => now()->addDays(30)->toDateString(), 'capacity' => 10, 'status' => 'open',
        ]);
    }

    /** @return array{0: Student, 1: User, 2: \App\Models\Enrollment} */
    protected function makeStudent(Batch $batch, string $username = 'kasun', string $phone = '0771234567', bool $approved = true, string $name = 'Kasun Fernando'): array
    {
        [$student, $user] = app(StudentService::class)->create(
            ['name' => $name, 'username' => $username, 'phone' => $phone, 'password' => 'secret123'],
            ['whatsapp_number' => $phone],
            'active'
        );
        $enrollment = app(EnrollmentService::class)->enroll($student, $batch);

        if ($approved) {
            $enrollment->update(['status' => 'approved', 'approved_at' => now()]);
        }

        return [$student, $user, $enrollment];
    }

    protected function makeStaff(string $role, string $username): User
    {
        return User::create(['name' => ucfirst($role), 'username' => $username, 'password' => 'secret123', 'role' => $role, 'status' => 'active']);
    }

    protected function registrationInvoice(Student $student): Invoice
    {
        return Invoice::where('student_id', $student->id)->where('type', 'registration')->firstOrFail();
    }
}
