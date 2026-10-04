<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Enrollment;
use App\Models\Result;
use App\Models\Subject;
use App\Models\StudentDocument;
use App\Services\StudentSummary;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Student pages that are not LMS: my courses, my records, announcements, my documents. */
class StudentPortalController extends Controller
{
    public function courses(Request $request)
    {
        $student = $request->user()->student;
        abort_unless($student, 403);

        return Inertia::render('Student/Courses', [
            'enrollments' => Enrollment::with(['batch.course.feeStructure', 'batch.course.subjects:id,course_id,code,name'])->where('student_id', $student->id)->latest()->get()
                ->map(fn ($e) => [
                    'id' => $e->id, 'status' => $e->status, 'remarks' => $e->remarks,
                    'course' => $e->batch->course->name, 'duration' => $e->batch->course->duration,
                    'batch' => $e->batch->name, 'schedule' => $e->batch->schedule_text, 'starts' => $e->batch->start_date?->toDateString(),
                    'subjects' => $e->batch->course->subjects->map(fn ($s) => ['code' => $s->code, 'name' => $s->name])->values(),
                ]),
            'documents' => $student->documents()->latest()->get()->map(fn ($d) => [
                'id' => $d->id, 'type_label' => StudentDocument::TYPES[$d->type] ?? $d->type, 'title' => $d->title, 'file_name' => $d->file_name, 'created_at' => $d->created_at,
            ]),
        ]);
    }

    public function records(Request $request)
    {
        $student = $request->user()->student;
        abort_unless($student, 403);

        return Inertia::render('Student/Records', [
            'attendance' => StudentSummary::attendance($student),
            'results' => Result::with(['subject:id,name', 'batch:id,name'])->where('student_id', $student->id)->where('published', true)->latest()->get()
                ->map(fn ($r) => ['id' => $r->id, 'subject' => $r->subject->name, 'batch' => $r->batch->name, 'assessment' => $r->assessment, 'marks' => $r->marks, 'max_marks' => $r->max_marks, 'grade' => $r->grade, 'remarks' => $r->remarks]),
        ]);
    }

    public function announcements(Request $request)
    {
        $user = $request->user();

        $items = match ($user->role) {
            'student' => $user->student ? StudentSummary::announcements($user->student, 50) : collect(),
            'lecturer' => Announcement::with('creator:id,name')->whereIn('audience', ['all', 'lecturers'])->latest()->limit(50)->get(),
            default => Announcement::with('creator:id,name')->latest()->limit(50)->get(),
        };

        return Inertia::render('Announcements/Feed', [
            'items' => $items->map(fn ($a) => ['id' => $a->id, 'title' => $a->title, 'body' => $a->body, 'audience' => $a->audience, 'author' => $a->creator?->name, 'created_at' => $a->created_at])->values(),
            'canPost' => in_array($user->role, ['super_admin', 'admin', 'lecturer'], true),
        ]);
    }
}
