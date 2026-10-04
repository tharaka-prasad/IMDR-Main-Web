<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Enrollment;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Student;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isStudent = $user->role === 'student';
        $q = Quiz::with(['subject:id,name', 'batch:id,name'])->withCount('questions')->orderByDesc('id');

        if ($isStudent) {
            $sid = $user->student->id;
            $q->where('is_published', true)->whereIn('batch_id', Concerns::studentBatchIds($request))
                ->with(['attempts' => fn ($a) => $a->where('student_id', $sid)]);
        } else {
            $q->withCount('attempts');

            if ($user->role === 'lecturer') {
                $scope = Concerns::lecturerScope($request);
                $q->where(function ($w) use ($scope, $user) {
                    foreach ($scope as $batchId => $subjectIds) {
                        $w->orWhere(fn ($x) => $x->where('batch_id', $batchId)->whereIn('subject_id', $subjectIds));
                    }
                    $w->orWhere('created_by', $user->id);
                });
            }
        }

        return Inertia::render('Quizzes/Index', [
            'items' => $q->limit(200)->get()->map(fn ($z) => [
                'id' => $z->id, 'title' => $z->title, 'subject' => $z->subject->name, 'batch' => $z->batch->name,
                'time_limit_minutes' => $z->time_limit_minutes, 'is_published' => $z->is_published,
                'questions_count' => $z->questions_count, 'attempts_count' => $z->attempts_count ?? null,
                'mine' => $isStudent ? $z->attempts->first()?->only(['score', 'total']) : null,
            ]),
            'canManage' => ! $isStudent,
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Quizzes/Create', ['teach' => Concerns::teachable($request)]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'batch_id' => 'required|exists:batches,id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'time_limit_minutes' => 'required|integer|min:1|max:300',
            'is_published' => 'nullable|boolean',
            'questions' => 'required|array|min:1|max:100',
            'questions.*.question' => 'required|string|max:2000',
            'questions.*.options' => 'required|array|min:2|max:6',
            'questions.*.options.*' => 'required|string|max:500',
            'questions.*.correct_index' => 'required|integer|min:0',
            'questions.*.marks' => 'nullable|numeric|min:0.5|max:100',
        ]);

        abort_unless(Concerns::canTeach($request, (int) $data['subject_id'], (int) $data['batch_id']), 403, 'You are not assigned to this subject and batch.');

        foreach ($data['questions'] as $i => $qn) {
            if ($qn['correct_index'] >= count($qn['options'])) {
                return back()->withErrors(["questions.$i.correct_index" => 'Choose the correct answer from the options.']);
            }
        }

        $quiz = DB::transaction(function () use ($data, $request) {
            $quiz = Quiz::create([
                'subject_id' => $data['subject_id'], 'batch_id' => $data['batch_id'], 'title' => $data['title'],
                'description' => $data['description'] ?? null, 'time_limit_minutes' => $data['time_limit_minutes'],
                'is_published' => (bool) ($data['is_published'] ?? false), 'created_by' => $request->user()->id,
            ]);

            foreach ($data['questions'] as $qn) {
                $quiz->questions()->create([
                    'question' => $qn['question'],
                    'options' => array_values($qn['options']),
                    'correct_index' => $qn['correct_index'],
                    'marks' => $qn['marks'] ?? 1,
                ]);
            }

            return $quiz;
        });

        AuditLog::record('created', $quiz, "Quiz \"{$quiz->title}\" created");

        if ($quiz->is_published) {
            $this->announce($quiz);
        }

        return redirect('/portal/quizzes/'.$quiz->id)->with('success', 'Quiz created.');
    }

    public function show(Request $request, Quiz $quiz)
    {
        $user = $request->user();
        $quiz->load(['questions', 'subject:id,name', 'batch:id,name']);
        $meta = ['id' => $quiz->id, 'title' => $quiz->title, 'description' => $quiz->description, 'subject' => $quiz->subject->name, 'batch' => $quiz->batch->name, 'time_limit_minutes' => $quiz->time_limit_minutes, 'is_published' => $quiz->is_published];

        if ($user->role === 'student') {
            abort_unless($quiz->is_published && in_array($quiz->batch_id, Concerns::studentBatchIds($request), true), 403, 'This quiz is not available to you.');
            $attempt = QuizAttempt::where('quiz_id', $quiz->id)->where('student_id', $user->student->id)->first();

            return Inertia::render('Quizzes/Show', [
                'quiz' => $meta,
                // Correct answers are only sent after the student has submitted.
                'questions' => $quiz->questions->map(fn ($qn) => ['id' => $qn->id, 'question' => $qn->question, 'options' => $qn->options, 'marks' => $qn->marks]),
                'attempt' => $attempt ? ['score' => $attempt->score, 'total' => $attempt->total, 'answers' => $attempt->answers, 'submitted_at' => $attempt->submitted_at] : null,
                'review' => $attempt ? $quiz->questions->mapWithKeys(fn ($qn) => [$qn->id => $qn->correct_index]) : null,
                'attempts' => null,
                'canManage' => false,
            ]);
        }

        abort_unless(Concerns::canTeach($request, $quiz->subject_id, $quiz->batch_id), 403, 'You are not assigned to this subject.');

        return Inertia::render('Quizzes/Show', [
            'quiz' => $meta,
            'questions' => $quiz->questions->map(fn ($qn) => ['id' => $qn->id, 'question' => $qn->question, 'options' => $qn->options, 'marks' => $qn->marks, 'correct_index' => $qn->correct_index]),
            'attempt' => null,
            'review' => null,
            'attempts' => $quiz->attempts()->with('student.user:id,name')->orderByDesc('score')->get()->map(fn ($a) => [
                'id' => $a->id, 'student' => $a->student->user->name, 'student_no' => $a->student->student_no, 'score' => $a->score, 'total' => $a->total, 'submitted_at' => $a->submitted_at,
            ]),
            'canManage' => true,
        ]);
    }

    public function update(Request $request, Quiz $quiz)
    {
        abort_unless(Concerns::canTeach($request, $quiz->subject_id, $quiz->batch_id), 403, 'You are not assigned to this subject.');

        $data = $request->validate(['is_published' => 'required|boolean']);
        $was = $quiz->is_published;
        $quiz->update($data);

        if (! $was && $quiz->is_published) {
            $this->announce($quiz);
        }

        return back()->with('success', $quiz->is_published ? 'Quiz published.' : 'Quiz hidden from students.');
    }

    public function destroy(Request $request, Quiz $quiz)
    {
        abort_unless(Concerns::canTeach($request, $quiz->subject_id, $quiz->batch_id), 403, 'You are not assigned to this subject.');

        if ($quiz->attempts()->exists()) {
            return back()->with('error', 'Students have attempted this quiz. Hide it instead of deleting it.');
        }

        $quiz->delete();

        return redirect('/portal/quizzes')->with('success', 'Quiz deleted.');
    }

    /** { answers: { "<question id>": <option index> } } - marked automatically, one attempt per student. */
    public function attempt(Request $request, Quiz $quiz)
    {
        abort_unless($quiz->is_published && in_array($quiz->batch_id, Concerns::studentBatchIds($request), true), 403, 'This quiz is not available to you.');

        $data = $request->validate(['answers' => 'present|array', 'started_at' => 'nullable|date']);
        $student = $request->user()->student;

        if (QuizAttempt::where('quiz_id', $quiz->id)->where('student_id', $student->id)->exists()) {
            return back()->with('error', 'You have already attempted this quiz.');
        }

        $score = 0.0;
        $total = 0.0;

        foreach ($quiz->questions()->get() as $qn) {
            $total += $qn->marks;
            $given = $data['answers'][$qn->id] ?? null;

            if ($given !== null && (int) $given === (int) $qn->correct_index) {
                $score += $qn->marks;
            }
        }

        QuizAttempt::create([
            'quiz_id' => $quiz->id, 'student_id' => $student->id, 'answers' => $data['answers'],
            'score' => $score, 'total' => $total,
            'started_at' => $data['started_at'] ?? now(), 'submitted_at' => now(),
        ]);

        return back()->with('success', 'Quiz submitted. Your score is '.rtrim(rtrim(number_format($score, 2), '0'), '.').' / '.rtrim(rtrim(number_format($total, 2), '0'), '.').'.');
    }

    private function announce(Quiz $quiz): void
    {
        $studentIds = Enrollment::where('batch_id', $quiz->batch_id)->where('status', 'approved')->pluck('student_id');
        NotificationService::send(Student::whereIn('id', $studentIds)->pluck('user_id'), 'New quiz available', $quiz->title, 'info', '/portal/quizzes/'.$quiz->id);
    }
}
