<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\Classroom;
use App\Models\Course;
use App\Models\ExpenseCategory;
use App\Models\Invoice;
use App\Models\Lecturer;
use App\Models\SalaryRule;
use App\Models\Subject;
use App\Models\TeachingAssignment;
use App\Models\TimetableEntry;
use App\Models\User;
use App\Services\EnrollmentService;
use App\Services\StudentService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Real institute content (expense categories, website posts) comes from the IMDR business plan.
 * All courses (18 specialised + 2 A/L) live in SpecialisedCoursesSeeder.
 * Demo people and demo classes are only created when the app is NOT in production.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => env('ADMIN_USERNAME', 'admin')],
            ['name' => 'Super Admin', 'email' => env('ADMIN_EMAIL', 'admin@imdr.lk'), 'password' => env('ADMIN_PASSWORD', 'ChangeMe@123'), 'role' => 'super_admin', 'status' => 'active']
        );

        $this->expenseCategories();
        $this->call(SpecialisedCoursesSeeder::class);

        if (! app()->isProduction()) {
            $this->demo();
        }
    }

    private function expenseCategories(): void
    {
        foreach (['Rent', 'Electricity', 'Water', 'Internet', 'Marketing', 'Software', 'Equipment', 'Maintenance', 'Transport', 'Events', 'Printing', 'Stationery', 'Salaries', 'Other'] as $name) {
            ExpenseCategory::firstOrCreate(['name' => $name]);
        }
    }

    

    private function demo(): void
    {
        $password = 'Demo@12345';

        User::updateOrCreate(['username' => 'office'], ['name' => 'Office Admin', 'email' => 'office@imdr.lk', 'password' => $password, 'role' => 'admin', 'status' => 'active']);
        $accountant = User::updateOrCreate(['username' => 'accounts'], ['name' => 'Accounts Officer', 'email' => 'accounts@imdr.lk', 'password' => $password, 'role' => 'accountant', 'status' => 'active']);
        SalaryRule::firstOrCreate(['user_id' => $accountant->id], ['pay_type' => 'monthly', 'basic_salary' => 65000, 'allowances' => 5000]);

        $lecturerUser = User::updateOrCreate(['username' => 'lecturer1'], ['name' => 'Nimali Perera', 'email' => 'nimali@imdr.lk', 'phone' => '0712345678', 'password' => $password, 'role' => 'lecturer', 'status' => 'active']);
        $lecturer = Lecturer::firstOrCreate(['user_id' => $lecturerUser->id], ['qualification' => 'MA in Mass Communication', 'specialization' => 'Media studies and digital journalism']);
        SalaryRule::firstOrCreate(['user_id' => $lecturerUser->id], ['pay_type' => 'hourly', 'hourly_rate' => 2000]);

        Classroom::firstOrCreate(['name' => 'Classroom 1'], ['capacity' => 40, 'location' => 'Ground floor']);
        Classroom::firstOrCreate(['name' => 'Computer lab'], ['capacity' => 30, 'location' => 'First floor']);

        // Demo data uses the A/L Media programme (it has fees, subjects and an open batch).
        $course = Course::where('code', 'ALM')->firstOrFail();
        $batch = Batch::where('course_id', $course->id)->first();
        $subjects = Subject::where('course_id', $course->id)->get();

        foreach ($subjects->take(3) as $subject) {
            TeachingAssignment::firstOrCreate(['batch_id' => $batch->id, 'subject_id' => $subject->id, 'lecturer_id' => $lecturer->id]);
        }

        $room = Classroom::first();
        foreach ([0, 7, 14] as $offset) {
            $date = Carbon::parse($batch->start_date)->addDays($offset);
            TimetableEntry::firstOrCreate(['batch_id' => $batch->id, 'subject_id' => $subjects[0]->id, 'date' => $date->toDateString(), 'start_time' => '09:00'], [
                'lecturer_id' => $lecturer->id, 'classroom_id' => $room->id, 'end_time' => '12:00', 'topic' => 'Introduction session', 'status' => 'scheduled', 'hours' => 3,
            ]);
        }

        $students = app(StudentService::class);
        $enroll = app(EnrollmentService::class);

        // Student 1: approved, everything paid up to date -> LMS open.
        if (! User::where('username', 'student1')->exists()) {
            [$s1] = $students->create(
                ['name' => 'Kasun Fernando', 'username' => 'student1', 'phone' => '0771234567', 'password' => $password],
                ['nic' => '200512345678', 'date_of_birth' => '2005-04-12', 'gender' => 'male', 'address' => 'Colombo 07', 'school' => 'Royal College', 'guardian_name' => 'Ruwan Fernando', 'guardian_phone' => '0712223334', 'whatsapp_number' => '0771234567'],
                'active'
            );
            $e1 = $enroll->enroll($s1, $batch);
            $e1->update(['status' => 'approved', 'approved_at' => now()]);
            Invoice::where('enrollment_id', $e1->id)->where('type', 'registration')->get()->each(fn ($i) => $i->update(['paid_amount' => $i->total, 'status' => 'paid']));
        }

        // Student 2: approved but a payment is overdue -> LMS shows "payment delayed".
        if (! User::where('username', 'student2')->exists()) {
            [$s2] = $students->create(
                ['name' => 'Dilani Silva', 'username' => 'student2', 'phone' => '0759876543', 'password' => $password],
                ['nic' => '200623456789', 'date_of_birth' => '2006-09-30', 'gender' => 'female', 'address' => 'Nugegoda', 'school' => 'Visakha Vidyalaya', 'whatsapp_number' => '0759876543'],
                'active'
            );
            $e2 = $enroll->enroll($s2, $batch);
            $e2->update(['status' => 'approved', 'approved_at' => now()]);
            Invoice::where('enrollment_id', $e2->id)->where('type', 'registration')->get()->each(fn ($i) => $i->update(['paid_amount' => $i->total, 'status' => 'paid']));
            Invoice::where('enrollment_id', $e2->id)->where('type', 'installment')->orderBy('id')->first()?->update(['due_date' => now()->subDays(5)->toDateString()]);
        }

        // Student 3: applied online, waiting for approval.
        if (! User::where('username', 'student3')->exists()) {
            [$s3] = $students->create(
                ['name' => 'Tharindu Jayasinghe', 'username' => 'student3', 'phone' => '0701112223', 'password' => $password],
                ['address' => 'Kandy'],
                'pending'
            );
            $enroll->enroll($s3, $batch);
        }
    }
}