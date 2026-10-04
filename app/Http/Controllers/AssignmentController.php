<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\AuditLog;
use App\Models\Enrollment;
use App\Models\Student;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    private function scoped(Request $request)
    {
        $user = $request->user();
        $q = Assignment::with(['subject:id,name', 'batch:id,name'])->orderByDesc('due_at');

        if ($user->role === 'student') {
            $q->whereIn('batch_id', Concerns::studentBatchIds($request));
        } elseif ($user->role === 'lecturer') {
            $scope = Concerns::lecturerScope($request);
            $q->where(function ($w) use ($scope, $user) {
                foreach ($scope as $batchId => $subjectIds) {
                    $w->orWhere(fn ($x) => $x->where('batch_id', $batchId)->whereIn('subject_id', $subjectIds));
                }
                $w->orWhere('created_by', $user->id);
            });
        }

        return $q;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $isStudent = $user->role === 'student';
        $q = $this->scoped($request);

        if ($isStudent) {
            $sid = $user->student->id;
            $q->with(['submissions' => fn ($s) => $s->where('student_id', $sid)]);
        } else {
            $q->withCount('submissions');
        }

        return Inertia::render('Assignments/Index', [
            'items' => $q->limit(200)->get()->map(fn ($a) => [
                'id' => $a->id, 'title' => $a->title, 'description' => $a->description, 'subject' => $a->subject->name, 'batch' => $a->batch->name,
                'due_at' => $a->due_at, 'max_marks' => $a->max_marks, 'past_due' => $a->due_at->isPast(),
                'submissions_count' => $a->submissions_count ?? null,
                'mine' => $isStudent ? ($a->submissions->first()?->only(['marks', 'submitted_at', 'marked_at'])) : null,
            ]),
            'canManage' => ! $isStudent,
            'teach' => $isStudent ? null : Concerns::teachable($request),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'batch_id' => 'required|exists:batches,id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'due_at' => 'required|date|after:now',
            'max_marks' => 'required|numeric|min:1',
        ]);

        abort_unless(Concerns::canTeach($request, (int) $data['subject_id'], (int) $data['batch_id']), 403, 'You are not assigned to this subject and batch.');

        $assignment = Assignment::create($data + ['created_by' => $request->user()->id]);
        AuditLog::record('created', $assignment, "Assignment \"{$assignment->title}\" created");

        $studentIds = Enrollment::where('batch_id', $assignment->batch_id)->where('status', 'approved')->pluck('student_id');
        NotificationService::send(Student::whereIn('id', $studentIds)->pluck('user_id'), 'New assignment', $assignment->title, 'info', '/portal/assignments/'.$assignment->id);

        return back()->with('success', 'Assignment created.');
    }

    public function show(Request $request, Assignment $assignment)
    {
        $user = $request->user();
        $assignment->load(['subject:id,name', 'batch:id,name']);

        $base = [
            'id' => $assignment->id, 'title' => $assignment->title, 'description' => $assignment->description,
            'subject' => $assignment->subject->name, 'batch' => $assignment->batch->name,
            'due_at' => $assignment->due_at, 'max_marks' => $assignment->max_marks, 'past_due' => $assignment->due_at->isPast(),
        ];

        if ($user->role === 'student') {
            abort_unless(in_array($assignment->batch_id, Concerns::studentBatchIds($request), true), 403, 'This assignment is not for your batch.');
            $mine = AssignmentSubmission::where('assignment_id', $assignment->id)->where('student_id', $user->student->id)->first();

            return Inertia::render('Assignments/Show', [
                'assignment' => $base,
                'mine' => $mine ? [...$mine->only(['id', 'answer_text', 'file_name', 'marks', 'feedback']), 'submitted_at' => $mine->submitted_at, 'marked_at' => $mine->marked_at] : null,
                'submissions' => null,
            ]);
        }

        abort_unless(Concerns::canTeach($request, $assignment->subject_id, $assignment->batch_id), 403, 'You are not assigned to this subject.');

        return Inertia::render('Assignments/Show', [
            'assignment' => $base,
            'mine' => null,
            'submissions' => $assignment->submissions()->with('student.user:id,name')->orderBy('submitted_at')->get()->map(fn ($s) => [
                'id' => $s->id, 'student' => $s->student->user->name, 'student_no' => $s->student->student_no,
                'answer_text' => $s->answer_text, 'file_name' => $s->file_name, 'submitted_at' => $s->submitted_at,
                'marks' => $s->marks, 'feedback' => $s->feedback, 'marked_at' => $s->marked_at,
            ]),
        ]);
    }

    public function destroy(Request $request, Assignment $assignment)
    {
        abort_unless(Concerns::canTeach($request, $assignment->subject_id, $assignment->batch_id), 403, 'You are not assigned to this subject.');

        if ($assignment->submissions()->exists()) {
            return back()->with('error', 'Students have already submitted work. It cannot be deleted.');
        }

        $assignment->delete();

        return redirect('/portal/assignments')->with('success', 'Assignment deleted.');
    }

    public function submit(Request $request, Assignment $assignment)
    {
        abort_unless(in_array($assignment->batch_id, Concerns::studentBatchIds($request), true), 403, 'This assignment is not for your batch.');

        if ($assignment->due_at->isPast()) {
            return back()->with('error', 'The deadline for this assignment has passed.');
        }

        $data = $request->validate([
            'answer_text' => 'nullable|string|max:20000',
            'file' => 'nullable|file|max:51200',
        ]);

        if (empty($data['answer_text']) && ! $request->hasFile('file')) {
            return back()->withErrors(['answer_text' => 'Write an answer or attach a file.']);
        }

        $student = $request->user()->student;
        $existing = AssignmentSubmission::where('assignment_id', $assignment->id)->where('student_id', $student->id)->first();

        if ($existing && $existing->marked_at) {
            return back()->with('error', 'This submission was already marked and can no longer be changed.');
        }

        $submission = $existing ?? new AssignmentSubmission(['assignment_id' => $assignment->id, 'student_id' => $student->id]);
        $submission->answer_text = $data['answer_text'] ?? null;
        $submission->submitted_at = now();

        if ($request->hasFile('file')) {
            if ($submission->file_path) {
                Storage::disk('local')->delete($submission->file_path);
            }
            [$submission->file_path, $submission->file_name] = Concerns::storeUpload($request->file('file'), 'submissions/'.$assignment->id);
        }

        $submission->save();

        return back()->with('success', 'Your work was submitted.');
    }

    public function mark(Request $request, AssignmentSubmission $submission)
    {
        $assignment = $submission->assignment;
        abort_unless(Concerns::canTeach($request, $assignment->subject_id, $assignment->batch_id), 403, 'You are not assigned to this subject.');

        $data = $request->validate([
            'marks' => 'required|numeric|min:0|max:'.$assignment->max_marks,
            'feedback' => 'nullable|string|max:5000',
        ]);

        $submission->update($data + ['marked_at' => now()]);
        NotificationService::send($submission->student->user_id, 'Assignment marked', $assignment->title, 'success', '/portal/assignments/'.$assignment->id);

        return back()->with('success', 'Marks saved.');
    }

    public function downloadSubmission(Request $request, AssignmentSubmission $submission)
    {
        $user = $request->user();
        $assignment = $submission->assignment;

        $allowed = $user->role === 'student'
            ? $user->student && $submission->student_id === $user->student->id
            : Concerns::canTeach($request, $assignment->subject_id, $assignment->batch_id);

        abort_unless($allowed, 403, 'You cannot open this file.');
        abort_unless($submission->file_path && Storage::disk('local')->exists($submission->file_path), 404, 'No file was attached.');

        return response()->download(Storage::disk('local')->path($submission->file_path), $submission->file_name ?: basename($submission->file_path));
    }
}
