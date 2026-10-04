<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Certificate;
use App\Models\ContactMessage;
use App\Models\Course;
use App\Models\CourseType;
use App\Models\Lecturer;
use App\Models\Post;
use App\Models\Student;
use App\Models\TeachingAssignment;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function home()
    {
        return Inertia::render('Home', [
            'stats' => [
                'courses' => Course::where('is_published', true)->count(),
                'lecturers' => Lecturer::count(),
                'students' => Student::count(),
            ],
            'types' => CourseType::withCount(['courses as courses_count' => fn ($q) => $q->where('is_published', true)])->orderBy('level')->get(),
            'courses' => Course::with(['courseType:id,name', 'feeStructure'])->where('is_published', true)->latest()->limit(6)->get(),
            'news' => Post::where('type', 'news')->where('is_published', true)->latest('published_at')->limit(3)->get(),
            'events' => Post::where('type', 'event')->where('is_published', true)->orderBy('event_date')->limit(3)->get(),
        ]);
    }

    public function about()
    {
        return Inertia::render('About');
    }

    public function courses(Request $request)
    {
        $q = Course::with(['courseType:id,name', 'feeStructure'])->where('is_published', true);

        if ($request->filled('type')) {
            $q->where('course_type_id', $request->query('type'));
        }

        if ($search = trim((string) $request->query('q', ''))) {
            $q->where(fn ($w) => $w->where('name', 'like', "%{$search}%")->orWhere('summary', 'like', "%{$search}%"));
        }

        return Inertia::render('Courses/Index', [
            'courses' => $q->orderBy('name')->get(),
            'types' => CourseType::orderBy('level')->get(['id', 'name']),
            'filters' => ['type' => $request->query('type', ''), 'q' => $request->query('q', '')],
        ]);
    }

    public function course(string $slug)
    {
        $course = Course::with(['courseType:id,name', 'feeStructure', 'subjects:id,course_id,code,name'])
            ->where('slug', $slug)->where('is_published', true)->firstOrFail();

        $batches = Batch::where('course_id', $course->id)->where('status', 'open')->orderBy('start_date')->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'start_date' => $b->start_date?->toDateString(),
                'schedule_text' => $b->schedule_text,
                'seats_left' => max(0, $b->capacity - $b->enrollments()->whereIn('status', ['pending', 'approved'])->count()),
            ]);

        $lecturers = Lecturer::whereIn('id', TeachingAssignment::whereIn('batch_id', Batch::where('course_id', $course->id)->pluck('id'))->pluck('lecturer_id'))
            ->with('user:id,name')->get()->map(fn ($l) => ['id' => $l->id, 'name' => $l->user->name, 'qualification' => $l->qualification]);

        return Inertia::render('Courses/Show', ['course' => $course, 'batches' => $batches, 'lecturers' => $lecturers]);
    }

    public function posts(Request $request, string $type)
    {
        $q = Post::where('type', $type)->where('is_published', true);
        $q->orderByDesc($type === 'event' ? 'event_date' : 'published_at');

        return Inertia::render('Posts/Index', ['type' => $type, 'posts' => $q->limit(60)->get()]);
    }

    public function post(string $slug)
    {
        return Inertia::render('Posts/Show', ['post' => Post::where('slug', $slug)->where('is_published', true)->firstOrFail()]);
    }

    public function contact()
    {
        return Inertia::render('Contact');
    }

    public function sendContact(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:160',
            'phone' => 'nullable|string|max:30',
            'subject' => 'nullable|string|max:160',
            'message' => 'required|string|max:5000',
        ]);

        ContactMessage::create($data);
        NotificationService::toRoles(['super_admin', 'admin'], 'New website message', $data['name'].': '.($data['subject'] ?: 'No subject'), 'info', '/portal/manage/contact-messages');

        return back()->with('success', 'Thank you. Your message has been sent and we will get back to you soon.');
    }

    public function verify(Request $request, ?string $number = null)
    {
        $number = trim((string) ($number ?: $request->query('number', '')));
        $result = null;

        if ($number !== '') {
            $cert = Certificate::with(['student.user:id,name', 'enrollment.batch.course:id,name'])->where('certificate_no', $number)->first();

            $result = $cert ? [
                'found' => true,
                'valid' => $cert->status === 'valid',
                'certificate_no' => $cert->certificate_no,
                'student_name' => $cert->student->user->name,
                'student_no' => $cert->student->student_no,
                'course' => $cert->enrollment->batch->course->name,
                'issued_at' => $cert->issued_at->toDateString(),
            ] : ['found' => false];
        }

        return Inertia::render('Verify', ['number' => $number, 'result' => $result]);
    }
}
