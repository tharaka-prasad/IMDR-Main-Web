<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedTinyInteger('level')->nullable(); // position on the pathway (1 = Certificate ... 4 = Higher Diploma)
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_type_id')->constrained()->restrictOnDelete();
            $table->string('code', 30)->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('duration', 80)->nullable();
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->text('entry_requirements')->nullable();
            $table->text('learning_outcomes')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('registration_fee', 12, 2)->default(0);
            // Course fee is charged in addition to the registration fee and is split by the installment plan.
            $table->decimal('course_fee', 12, 2)->default(0);
            $table->json('installments')->nullable(); // [{label, amount, due_after_days}]
            $table->timestamps();
        });

        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('code', 30);
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code', 30)->unique();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('schedule_text')->nullable();
            $table->unsignedInteger('capacity')->default(30);
            $table->string('status', 20)->default('open'); // open | running | completed | closed
            $table->timestamps();
        });

        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('student_no', 30)->nullable()->unique();
            $table->string('nic', 20)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 10)->nullable();
            $table->text('address')->nullable();
            $table->string('school')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone', 30)->nullable();
            $table->string('whatsapp_number', 30)->nullable(); // receipts are sent here (falls back to the phone number)
            $table->date('lms_access_override_until')->nullable(); // admin can keep LMS open for a delayed payer
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Birth certificate, result sheets, NIC copy, photos ... (private storage)
        Schema::create('student_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30); // birth_certificate | result_sheet | nic | ol_certificate | al_certificate | photo | other
            $table->string('title')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime', 100)->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20)->default('pending'); // pending | approved | rejected | completed | cancelled
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'batch_id']);
        });

        Schema::create('lecturers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('qualification')->nullable();
            $table->string('specialization')->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();
        });

        Schema::create('teaching_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lecturer_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['batch_id', 'subject_id', 'lecturer_id']);
        });

        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('capacity')->nullable();
            $table->string('location')->nullable();
            $table->timestamps();
        });

        Schema::create('timetable_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lecturer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('classroom_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date')->index();
            $table->time('start_time');
            $table->time('end_time');
            $table->string('topic')->nullable();
            $table->string('status', 20)->default('scheduled'); // scheduled | held | cancelled
            $table->decimal('hours', 5, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('timetable_entry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('status', 10); // present | absent | late
            $table->timestamps();
            $table->unique(['timetable_entry_id', 'student_id']);
        });

        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('batch_id')->constrained()->cascadeOnDelete();
            $table->string('assessment');
            $table->decimal('marks', 6, 2);
            $table->decimal('max_marks', 6, 2)->default(100);
            $table->string('grade', 5)->nullable();
            $table->text('remarks')->nullable();
            $table->boolean('published')->default(false);
            $table->timestamps();
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('audience', 20)->default('all'); // all | students | lecturers | batch
            $table->foreignId('batch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['announcements', 'results', 'attendances', 'timetable_entries', 'classrooms', 'teaching_assignments', 'lecturers', 'enrollments', 'student_documents', 'students', 'batches', 'subjects', 'fee_structures', 'courses', 'course_types'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
