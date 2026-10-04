<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Course;
use App\Models\CourseType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $q = Course::with(['courseType:id,name', 'feeStructure'])->withCount('batches');

        if ($request->filled('type')) {
            $q->where('course_type_id', $request->query('type'));
        }

        if ($s = trim((string) $request->query('search', ''))) {
            $q->where(fn ($w) => $w->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"));
        }

        return Inertia::render('Courses/Manage', [
            'courses' => $q->orderBy('name')->paginate(15)->withQueryString(),
            'types' => CourseType::orderBy('level')->get(['id', 'name']),
            'filters' => ['search' => $request->query('search', ''), 'type' => $request->query('type', '')],
        ]);
    }

    public function create()
    {
        return Inertia::render('Courses/Form', ['course' => null, 'types' => CourseType::orderBy('level')->get(['id', 'name'])]);
    }

    public function edit(Course $course)
    {
        return Inertia::render('Courses/Form', [
            'course' => $course->load('feeStructure'),
            'types' => CourseType::orderBy('level')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request, null);

        $course = DB::transaction(function () use ($data) {
            $course = Course::create($data['course'] + ['slug' => Str::slug($data['course']['name']).'-'.Str::lower(Str::random(4))]);
            $course->feeStructure()->create($data['fee']);

            return $course;
        });

        AuditLog::record('created', $course, "Created course {$course->name}");

        return redirect('/portal/courses')->with('success', 'Course added.');
    }

    public function update(Request $request, Course $course)
    {
        $data = $this->validated($request, $course->id);

        DB::transaction(function () use ($course, $data) {
            $course->update($data['course']);
            $course->feeStructure()->updateOrCreate(['course_id' => $course->id], $data['fee']);
        });

        AuditLog::record('updated', $course, "Updated course {$course->name}");

        return redirect('/portal/courses')->with('success', 'Course saved.');
    }

    public function destroy(Course $course)
    {
        if ($course->batches()->exists()) {
            return back()->with('error', 'This course has batches. Close the batches instead of deleting the course.');
        }

        $course->delete();
        AuditLog::record('deleted', $course, "Deleted course {$course->name}");

        return back()->with('success', 'Course deleted.');
    }

    private function validated(Request $request, ?int $id): array
    {
        $v = $request->validate([
            'course_type_id' => 'required|exists:course_types,id',
            'code' => ['required', 'string', 'max:30', Rule::unique('courses', 'code')->ignore($id)],
            'name' => 'required|string|max:200',
            'duration' => 'nullable|string|max:80',
            'summary' => 'nullable|string|max:600',
            'description' => 'nullable|string',
            'entry_requirements' => 'nullable|string',
            'learning_outcomes' => 'nullable|string',
            'is_published' => 'boolean',
            'registration_fee' => 'required|numeric|min:0',
            'course_fee' => 'required|numeric|min:0',
            'installments' => 'nullable|array|max:12',
            'installments.*.label' => 'required|string|max:80',
            'installments.*.amount' => 'required|numeric|min:1',
            'installments.*.due_after_days' => 'required|integer|min:0|max:730',
        ]);

        $installments = array_values($v['installments'] ?? []);
        $sum = round((float) collect($installments)->sum('amount'), 2);

        // The system works out the balance for the student, so the plan must add up exactly.
        if (count($installments) && abs($sum - round((float) $v['course_fee'], 2)) > 0.009) {
            throw ValidationException::withMessages([
                'installments' => 'The installments add up to Rs. '.number_format($sum, 2).' but the course fee is Rs. '.number_format((float) $v['course_fee'], 2).'.',
            ]);
        }

        return [
            'course' => collect($v)->only(['course_type_id', 'code', 'name', 'duration', 'summary', 'description', 'entry_requirements', 'learning_outcomes', 'is_published'])->all(),
            'fee' => [
                'registration_fee' => $v['registration_fee'],
                'course_fee' => $v['course_fee'],
                'installments' => $installments ?: null,
            ],
        ];
    }
}
