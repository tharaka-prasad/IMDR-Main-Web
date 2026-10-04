<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\TimetableEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    private function authorizeEntry(Request $request, TimetableEntry $entry): void
    {
        $user = $request->user();

        if ($user->role === 'lecturer') {
            abort_unless($user->lecturer && $entry->lecturer_id === $user->lecturer->id, 403, 'This class belongs to another lecturer.');
        }
    }

    /** Classes waiting for a class register (recent + upcoming). */
    public function index(Request $request)
    {
        $user = $request->user();
        $q = TimetableEntry::with(['batch:id,name', 'subject:id,name'])
            ->where('status', '!=', 'cancelled')
            ->whereDate('date', '>=', now()->subDays(14)->toDateString())->whereDate('date', '<=', now()->addDays(2)->toDateString())
            ->orderByDesc('date')->orderBy('start_time');

        if ($user->role === 'lecturer') {
            $q->where('lecturer_id', $user->lecturer?->id ?? 0);
        }

        return Inertia::render('Attendance/Index', [
            'entries' => $q->get()->map(fn ($e) => [
                'id' => $e->id, 'date' => $e->date->toDateString(), 'start_time' => substr($e->start_time, 0, 5), 'end_time' => substr($e->end_time, 0, 5),
                'batch' => $e->batch->name, 'subject' => $e->subject->name, 'status' => $e->status,
                'marked' => $e->attendances()->count(),
            ]),
            'isAdmin' => in_array($user->role, ['super_admin', 'admin'], true),
        ]);
    }

    /** Class register: every approved student in the batch with their current mark. */
    public function show(Request $request, TimetableEntry $entry)
    {
        $this->authorizeEntry($request, $entry);

        $marks = Attendance::where('timetable_entry_id', $entry->id)->pluck('status', 'student_id');

        $students = Enrollment::where('batch_id', $entry->batch_id)->where('status', 'approved')
            ->with('student.user:id,name')->get()
            ->map(fn ($e) => [
                'student_id' => $e->student_id,
                'student_no' => $e->student->student_no,
                'name' => $e->student->user->name,
                'status' => $marks[$e->student_id] ?? 'present',
                'marked' => isset($marks[$e->student_id]),
            ])->sortBy('name')->values();

        return Inertia::render('Attendance/Show', [
            'entry' => [
                'id' => $entry->id, 'date' => $entry->date->toDateString(), 'start_time' => substr($entry->start_time, 0, 5), 'end_time' => substr($entry->end_time, 0, 5),
                'batch' => $entry->batch->name, 'subject' => $entry->subject->name, 'status' => $entry->status,
            ],
            'students' => $students,
        ]);
    }

    public function store(Request $request, TimetableEntry $entry)
    {
        $this->authorizeEntry($request, $entry);

        if ($entry->status === 'cancelled') {
            return back()->with('error', 'This class was cancelled.');
        }

        $data = $request->validate([
            'records' => 'required|array|min:1',
            'records.*.student_id' => 'required|integer',
            'records.*.status' => 'required|in:present,absent,late',
        ]);

        $allowed = Enrollment::where('batch_id', $entry->batch_id)->where('status', 'approved')->pluck('student_id')->all();

        foreach ($data['records'] as $r) {
            if (! in_array((int) $r['student_id'], $allowed, true)) {
                continue;
            }

            Attendance::updateOrCreate(
                ['timetable_entry_id' => $entry->id, 'student_id' => $r['student_id']],
                ['status' => $r['status']]
            );
        }

        // Marking the register confirms the class took place (this drives lecturer payroll hours).
        if ($entry->status === 'scheduled') {
            $entry->update(['status' => 'held']);
        }

        return redirect('/portal/attendance')->with('success', 'Attendance saved.');
    }

    /** Admin report: attendance percentage of every student in a batch. */
    public function report(Request $request)
    {
        $batchId = $request->query('batch_id');
        $report = null;

        if ($batchId) {
            $batch = Batch::findOrFail($batchId);
            $held = TimetableEntry::where('batch_id', $batch->id)->where('status', 'held')->pluck('id');

            $students = Enrollment::where('batch_id', $batch->id)->where('status', 'approved')->with('student.user:id,name')->get()
                ->map(function ($e) use ($held) {
                    $attended = Attendance::whereIn('timetable_entry_id', $held)->where('student_id', $e->student_id)->whereIn('status', ['present', 'late'])->count();

                    return [
                        'student_id' => $e->student_id, 'student_no' => $e->student->student_no, 'name' => $e->student->user->name,
                        'attended' => $attended, 'total' => $held->count(),
                        'percent' => $held->count() ? round($attended / $held->count() * 100, 1) : null,
                    ];
                })->sortBy('name')->values();

            $report = ['batch' => $batch->name, 'classes_held' => $held->count(), 'students' => $students];
        }

        return Inertia::render('Attendance/Report', [
            'batches' => Batch::orderByDesc('start_date')->get(['id', 'name']),
            'batchId' => $batchId ? (int) $batchId : null,
            'report' => $report,
        ]);
    }
}
