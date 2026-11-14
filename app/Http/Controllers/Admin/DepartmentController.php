<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Enrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Departments group the courses (for example "Media & Journalism").
 * The public Courses page and the admin Courses list are organised by department.
 * Only admins and the super admin reach these routes (role middleware in routes/web.php).
 */
class DepartmentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Departments/Index', [
            'departments' => Department::withCount('courses')->orderBy('name')->get(),
        ]);
    }

    public function show(Department $department): Response
    {
        $courses = $department->courses()->with('courseType:id,name')->withCount('batches')->orderBy('name')->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'code' => $c->code,
                'name' => $c->name,
                'type' => $c->courseType?->name,
                'duration' => $c->duration,
                'batches_count' => $c->batches_count,
                'is_published' => (bool) $c->is_published,
            ]);

        return Inertia::render('Admin/Departments/Show', [
            'department' => $department,
            'courses' => $courses,
            'students_count' => Enrollment::where('status', 'approved')
                ->whereHas('batch.course', fn ($q) => $q->where('department_id', $department->id))
                ->distinct()->count('student_id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $department = Department::create($this->validated($request));
        AuditLog::record('created', $department, "Created department {$department->name}");

        return back()->with('success', 'Department added.');
    }

    public function update(Request $request, Department $department): RedirectResponse
    {
        $department->update($this->validated($request, $department));
        AuditLog::record('updated', $department, "Updated department {$department->name}");

        return back()->with('success', 'Department saved.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        if ($department->courses()->exists()) {
            return back()->with('error', 'This department still has courses. Move them to another department first.');
        }

        $department->delete();
        AuditLog::record('deleted', $department, "Deleted department {$department->name}");

        return back()->with('success', 'Department deleted.');
    }

    private function validated(Request $request, ?Department $department = null): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'code' => ['required', 'string', 'max:20', Rule::unique('departments', 'code')->ignore($department?->id)],
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $data['is_active'] = $request->boolean('is_active', true);

        return $data;
    }
}