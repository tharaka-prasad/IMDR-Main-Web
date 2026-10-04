<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\LmsContent;
use App\Models\Student;
use App\Models\Subject;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/** Notes, PDFs, slides, videos. Files are private: they are only served after a permission check. */
class LmsContentController extends Controller
{
    /** Everything the current user is allowed to see. Used by the list and by the download. */
    private function visible(Request $request)
    {
        $user = $request->user();
        $q = LmsContent::with(['subject:id,name,course_id', 'batch:id,name', 'creator:id,name'])->orderByDesc('id');

        if ($user->role === 'student') {
            $batchIds = Concerns::studentBatchIds($request);
            $subjectIds = Subject::whereIn('course_id', Batch::whereIn('id', $batchIds)->pluck('course_id'))->pluck('id');
            $q->where('is_published', true)->whereIn('subject_id', $subjectIds)
                ->where(fn ($w) => $w->whereNull('batch_id')->orWhereIn('batch_id', $batchIds));
        } elseif ($user->role === 'lecturer') {
            $subjectIds = collect(Concerns::lecturerScope($request))->flatten()->unique()->values();
            $q->where(fn ($w) => $w->whereIn('subject_id', $subjectIds)->orWhere('created_by', $user->id));
        }

        return $q;
    }

    public function index(Request $request)
    {
        $q = $this->visible($request);

        if ($request->filled('subject_id')) {
            $q->where('subject_id', $request->query('subject_id'));
        }

        $items = $q->limit(300)->get();
        $isStaff = $request->user()->role !== 'student';

        return Inertia::render('Lms/Index', [
            'items' => $items->map(fn ($c) => [
                'id' => $c->id, 'title' => $c->title, 'type' => $c->type, 'description' => $c->description,
                'subject' => $c->subject->name, 'subject_id' => $c->subject_id,
                'batch' => $c->batch?->name, 'batch_id' => $c->batch_id,
                'external_url' => $c->external_url, 'has_file' => (bool) $c->file_path, 'file_name' => $c->file_name,
                'is_published' => $c->is_published, 'created_at' => $c->created_at, 'author' => $c->creator?->name,
            ]),
            'subjects' => Subject::whereIn('id', $this->visible($request)->pluck('subject_id')->unique())->orderBy('name')->get(['id', 'name']),
            'filters' => ['subject_id' => $request->query('subject_id', '')],
            'canManage' => $isStaff,
            'teach' => $isStaff ? Concerns::teachable($request) : null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'batch_id' => 'nullable|exists:batches,id',
            'title' => 'required|string|max:200',
            'type' => 'required|in:note,pdf,slides,video,image,link',
            'description' => 'nullable|string',
            'external_url' => 'nullable|url|max:500',
            'is_published' => 'nullable|boolean',
            'file' => 'nullable|file|max:204800', // 200 MB (also raise upload_max_filesize / post_max_size in php.ini)
        ]);

        abort_unless(Concerns::canTeach($request, (int) $data['subject_id'], isset($data['batch_id']) ? (int) $data['batch_id'] : null), 403, 'You are not assigned to this subject.');

        if (! $request->hasFile('file') && empty($data['external_url'])) {
            return back()->withErrors(['file' => 'Upload a file or paste a link.']);
        }

        $content = new LmsContent(collect($data)->only(['subject_id', 'batch_id', 'title', 'type', 'description', 'external_url'])->all());
        $content->is_published = (bool) ($data['is_published'] ?? true);
        $content->created_by = $request->user()->id;

        if ($request->hasFile('file')) {
            [$content->file_path, $content->file_name] = Concerns::storeUpload($request->file('file'), 'lms/'.date('Y/m'));
        }

        $content->save();
        AuditLog::record('created', $content, "LMS content \"{$content->title}\" added");

        if ($content->is_published) {
            $batchIds = $content->batch_id ? [$content->batch_id] : Batch::where('course_id', $content->subject->course_id)->pluck('id')->all();
            $studentIds = Enrollment::where('status', 'approved')->whereIn('batch_id', $batchIds)->pluck('student_id');
            NotificationService::send(Student::whereIn('id', $studentIds)->pluck('user_id'), 'New learning material', $content->title, 'info', '/portal/lms');
        }

        return back()->with('success', 'Content added.');
    }

    public function update(Request $request, LmsContent $content)
    {
        abort_unless(Concerns::canTeach($request, $content->subject_id, $content->batch_id), 403, 'You are not assigned to this subject.');

        $data = $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'external_url' => 'nullable|url|max:500',
            'is_published' => 'required|boolean',
        ]);

        $content->update($data);

        return back()->with('success', 'Content saved.');
    }

    public function destroy(Request $request, LmsContent $content)
    {
        abort_unless(Concerns::canTeach($request, $content->subject_id, $content->batch_id), 403, 'You are not assigned to this subject.');

        if ($content->file_path) {
            Storage::disk('local')->delete($content->file_path);
        }

        $content->delete();

        return back()->with('success', 'Content deleted.');
    }

    public function download(Request $request, int $id)
    {
        $content = $this->visible($request)->findOrFail($id);
        abort_unless($content->file_path && Storage::disk('local')->exists($content->file_path), 404, 'This item has no downloadable file.');

        return response()->download(Storage::disk('local')->path($content->file_path), $content->file_name ?: basename($content->file_path));
    }
}
