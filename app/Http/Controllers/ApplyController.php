<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Course;
use App\Services\EnrollmentService;
use App\Services\NotificationService;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/** Public "Register now". The applicant chooses a username and password, sees the fee invoices and can pay online. */
class ApplyController extends Controller
{
    public function create(Request $request)
    {
        $courses = Course::with(['courseType:id,name', 'feeStructure'])->where('is_published', true)->orderBy('name')->get()
            ->map(function ($c) {
                $c->setAttribute('batches', Batch::where('course_id', $c->id)->where('status', 'open')->orderBy('start_date')->get()
                    ->map(fn ($b) => [
                        'id' => $b->id, 'name' => $b->name, 'start_date' => $b->start_date?->toDateString(), 'schedule_text' => $b->schedule_text,
                        'seats_left' => max(0, $b->capacity - $b->enrollments()->whereIn('status', ['pending', 'approved'])->count()),
                    ])->values());

                return $c;
            })->filter(fn ($c) => count($c->batches))->values();

        return Inertia::render('Apply', ['courses' => $courses, 'preselected' => (int) $request->query('batch', 0)]);
    }

    public function store(Request $request, StudentService $students, EnrollmentService $enrollments)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'username' => 'required|alpha_dash|max:60|unique:users,username',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:30',
            'whatsapp_number' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:160|unique:users,email',
            'batch_id' => 'required|exists:batches,id',
            'nic' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable|string|max:500',
            'school' => 'nullable|string|max:160',
            'guardian_name' => 'nullable|string|max:120',
            'guardian_phone' => 'nullable|string|max:30',
        ]);

        $batch = Batch::with('course')->findOrFail($data['batch_id']);

        [$student, $user] = DB::transaction(function () use ($data, $batch, $students, $enrollments) {
            [$student, $user] = $students->create(
                collect($data)->only(['name', 'username', 'email', 'phone', 'password'])->all(),
                collect($data)->only(['nic', 'date_of_birth', 'gender', 'address', 'school', 'guardian_name', 'guardian_phone', 'whatsapp_number'])->all(),
                'pending' // becomes "active" when the registration is approved
            );
            $enrollments->enroll($student, $batch);

            return [$student, $user];
        });

        NotificationService::toRoles(['super_admin', 'admin'], 'New registration',
            "{$user->name} applied for {$batch->course->name} ({$batch->name}).", 'info', '/portal/registrations');

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/portal/finance')->with('success', 'Your registration was received. Your student ID is '.$student->student_no.'. Pay the registration fee below to move to approval.');
    }
}
