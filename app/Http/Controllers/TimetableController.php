<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\Classroom;
use App\Models\Enrollment;
use App\Models\Lecturer;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TimetableEntry;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TimetableController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $from = $request->query('from', now()->subDays(3)->toDateString());
        $to = $request->query('to', now()->addDays(45)->toDateString());

        $q = TimetableEntry::with(['batch:id,name,course_id', 'subject:id,name', 'lecturer.user:id,name', 'classroom:id,name'])
            ->whereDate('date', '>=', $from)->whereDate('date', '<=', $to)
            ->orderBy('date')->orderBy('start_time');

        if ($user->role === 'student') {
            $q->whereIn('batch_id', Concerns::studentBatchIds($request));
        } elseif ($user->role === 'lecturer') {
            $q->where('lecturer_id', $user->lecturer?->id ?? 0);
        } elseif ($request->filled('batch_id')) {
            $q->where('batch_id', $request->query('batch_id'));
        }

        $isAdmin = in_array($user->role, ['super_admin', 'admin'], true);

        return Inertia::render('Timetable/Index', [
            'entries' => $q->limit(500)->get()->map(fn ($e) => [
                'id' => $e->id,
                'date' => $e->date->toDateString(),
                'start_time' => substr($e->start_time, 0, 5),
                'end_time' => substr($e->end_time, 0, 5),
                'topic' => $e->topic,
                'status' => $e->status,
                'hours' => $e->hours,
                'batch_id' => $e->batch_id,
                'batch' => $e->batch->name,
                'subject' => $e->subject->name,
                'lecturer' => $e->lecturer->user->name,
                'classroom' => $e->classroom?->name,
            ]),
            'filters' => ['from' => $from, 'to' => $to, 'batch_id' => $request->query('batch_id', '')],
            'canManage' => $isAdmin,
            'canMark' => in_array($user->role, ['super_admin', 'admin', 'lecturer'], true),
            'form' => $isAdmin ? [
                'batches' => Batch::whereIn('status', ['open', 'running'])->orderBy('name')->get(['id', 'name', 'course_id']),
                'subjects' => Subject::orderBy('name')->get(['id', 'name', 'course_id']),
                'lecturers' => Lecturer::with('user:id,name')->get()->map(fn ($l) => ['id' => $l->id, 'name' => $l->user->name]),
                'classrooms' => Classroom::orderBy('name')->get(['id', 'name']),
            ] : null,
            'batchFilter' => $isAdmin ? Batch::orderByDesc('start_date')->get(['id', 'name']) : [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $entry = TimetableEntry::create($data + ['hours' => $this->hours($data['start_time'], $data['end_time'])]);

        AuditLog::record('created', $entry, 'Timetable entry created');
        $this->notifyBatch($entry, 'New class scheduled');

        return back()->with('success', 'Class added to the timetable.');
    }

    public function update(Request $request, TimetableEntry $entry)
    {
        $data = $this->validated($request, $entry);
        $entry->update($data + ['hours' => $this->hours($data['start_time'], $data['end_time'])]);

        if ($entry->wasChanged('status') && $entry->status === 'cancelled') {
            $this->notifyBatch($entry, 'Class cancelled');
        }

        return back()->with('success', 'Class updated.');
    }

    /** Quick status change: scheduled / held / cancelled. */
    public function status(Request $request, TimetableEntry $entry)
    {
        $data = $request->validate(['status' => 'required|in:scheduled,held,cancelled']);
        $entry->update($data);

        if ($entry->status === 'cancelled') {
            $this->notifyBatch($entry, 'Class cancelled');
        }

        return back()->with('success', 'Class marked as '.$data['status'].'.');
    }

    public function destroy(TimetableEntry $entry)
    {
        if ($entry->attendances()->exists()) {
            return back()->with('error', 'Attendance was already marked for this class. Cancel it instead of deleting it.');
        }

        $entry->delete();

        return back()->with('success', 'Class deleted.');
    }

    private function validated(Request $request, ?TimetableEntry $current = null): array
    {
        $data = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'subject_id' => 'required|exists:subjects,id',
            'lecturer_id' => 'required|exists:lecturers,id',
            'classroom_id' => 'nullable|exists:classrooms,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'topic' => 'nullable|string|max:255',
            'status' => 'nullable|in:scheduled,held,cancelled',
        ]);

        $data['status'] = $data['status'] ?? 'scheduled';

        // No double-booking of the lecturer, the room or the batch.
        foreach (['lecturer_id' => 'lecturer', 'classroom_id' => 'classroom', 'batch_id' => 'batch'] as $field => $label) {
            if (empty($data[$field]) || $data['status'] === 'cancelled') {
                continue;
            }

            $clash = TimetableEntry::where($field, $data[$field])
                ->whereDate('date', $data['date'])
                ->where('status', '!=', 'cancelled')
                ->where('start_time', '<', $data['end_time'].':00')
                ->where('end_time', '>', $data['start_time'].':00')
                ->when($current, fn ($q) => $q->where('id', '!=', $current->id))
                ->exists();

            if ($clash) {
                throw ValidationException::withMessages([$field => "That {$label} already has a class at this time."]);
            }
        }

        return $data;
    }

    private function hours(string $start, string $end): float
    {
        $a = Carbon::createFromFormat('H:i', $start);
        $b = Carbon::createFromFormat('H:i', $end);

        return round(abs($b->diffInMinutes($a)) / 60, 2);
    }

    private function notifyBatch(TimetableEntry $entry, string $title): void
    {
        $studentIds = Enrollment::where('batch_id', $entry->batch_id)->where('status', 'approved')->pluck('student_id');
        $userIds = Student::whereIn('id', $studentIds)->pluck('user_id');

        NotificationService::send($userIds, $title, $entry->date->format('D d M').' '.substr($entry->start_time, 0, 5), 'info', '/portal/timetable');
    }
}
