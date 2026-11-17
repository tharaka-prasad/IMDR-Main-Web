<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\StudentMessage;
use App\Models\WhatsAppMessage;
use App\Services\NotificationService;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Admin -> students messages.
 *  - In-app: shows in the student's notification bell and Notifications page.
 *  - WhatsApp: sent through the configured driver. With the default "log" driver nothing is really sent;
 *    the attempt is recorded and a click-to-chat link is shown so the office can send it by hand.
 */
class MessageController extends Controller
{
    /** At most this many WhatsApp messages per send, so one click never ties the server up. */
    private const WHATSAPP_LIMIT = 150;

    public function index(Request $request)
    {
        $preselected = [];

        if ($request->filled('student')) {
            $student = Student::with('user:id,name,phone')->find($request->query('student'));

            if ($student) {
                $preselected[] = $this->studentOption($student);
            }
        }

        $delayedIds = $this->delayedStudentIds();

        return Inertia::render('Messages/Index', [
            'history' => StudentMessage::with(['sender:id,name', 'batch:id,name'])->latest()->paginate(8)->withQueryString()
                ->through(fn ($m) => [
                    'id' => $m->id, 'title' => $m->title, 'body' => $m->body, 'audience' => $m->audience,
                    'batch' => $m->batch?->name, 'sender' => $m->sender?->name, 'in_app' => $m->in_app, 'whatsapp' => $m->whatsapp,
                    'recipient_count' => $m->recipient_count, 'whatsapp_sent' => $m->whatsapp_sent,
                    'whatsapp_prepared' => $m->whatsapp_prepared, 'whatsapp_failed' => $m->whatsapp_failed,
                    'created_at' => $m->created_at,
                ]),
            'batches' => Batch::with('course:id,name')->orderByDesc('start_date')->get()
                ->map(fn ($b) => ['value' => $b->id, 'label' => $b->course->name.' - '.$b->name]),
            'preselected' => $preselected,
            'delayedCount' => count($delayedIds),
            'whatsappDriver' => config('imdr.whatsapp.driver'),
            'whatsappLimit' => self::WHATSAPP_LIMIT,
            'whatsappLog' => WhatsAppMessage::with('student.user:id,name')->whereNull('payment_id')->whereNotNull('student_id')
                ->latest('id')->limit(15)->get()
                ->map(fn ($w) => [
                    'id' => $w->id, 'student' => $w->student?->user->name, 'phone' => $w->to_phone, 'status' => $w->status,
                    'error' => $w->error, 'created_at' => $w->created_at,
                    'manual_link' => WhatsAppService::manualLink($w->to_phone, $w->body),
                ]),
        ]);
    }

    /** Small JSON search used by the "pick students" box. */
    public function search(Request $request)
    {
        $s = trim((string) $request->query('q', ''));

        if (mb_strlen($s) < 2) {
            return response()->json([]);
        }

        $students = Student::with('user:id,name,phone,status')
            ->where(function ($w) use ($s) {
                $w->where('student_no', 'like', "%{$s}%")
                    ->orWhere('whatsapp_number', 'like', "%{$s}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$s}%")->orWhere('username', 'like', "%{$s}%")->orWhere('phone', 'like', "%{$s}%"));
            })
            ->orderByDesc('id')->limit(10)->get();

        return response()->json($students->map(fn ($st) => $this->studentOption($st))->values());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:150',
            'body' => 'required|string|max:2000',
            'audience' => 'required|in:students,batch,delayed,all',
            'student_ids' => 'required_if:audience,students|nullable|array',
            'student_ids.*' => 'integer|exists:students,id',
            'batch_id' => 'required_if:audience,batch|nullable|exists:batches,id',
            'in_app' => 'boolean',
            'whatsapp' => 'boolean',
        ], [
            'student_ids.required_if' => 'Choose at least one student.',
            'batch_id.required_if' => 'Choose a batch.',
        ]);

        $inApp = $request->boolean('in_app');
        $whatsapp = $request->boolean('whatsapp');

        if (! $inApp && ! $whatsapp) {
            throw ValidationException::withMessages(['in_app' => 'Choose at least one way to send: in the portal, on WhatsApp, or both.']);
        }

        $query = match ($data['audience']) {
            'students' => Student::whereIn('id', $data['student_ids'] ?? []),
            'batch' => Student::whereIn('id', Enrollment::where('batch_id', $data['batch_id'])->where('status', 'approved')->pluck('student_id')),
            'delayed' => Student::whereIn('id', $this->delayedStudentIds()),
            default => Student::query(),
        };

        $students = $query->with('user:id,name,phone,status')
            ->whereHas('user', fn ($u) => $u->where('status', '!=', 'suspended'))
            ->get();

        if ($students->isEmpty()) {
            return back()->with('error', 'No active students matched, so nothing was sent.');
        }

        if ($inApp) {
            NotificationService::send($students->pluck('user_id'), $data['title'], $data['body'], 'message', '/portal/notifications');
        }

        $sent = $prepared = $failed = 0;

        if ($whatsapp) {
            foreach ($students->take(self::WHATSAPP_LIMIT) as $student) {
                $phone = WhatsAppService::normalizePhone($student->whatsapp_number ?: $student->user->phone);
                $text = "*IMDR - {$data['title']}*\n\n{$data['body']}";

                $row = WhatsAppService::deliver($phone, $text, ['student_id' => $student->id], [$student->user->name, $data['title'], $data['body']]);

                match ($row->status) {
                    'sent' => $sent++,
                    'simulated' => $prepared++,
                    default => $failed++,
                };
            }
        }

        $message = StudentMessage::create([
            'sent_by' => $request->user()->id,
            'title' => $data['title'],
            'body' => $data['body'],
            'audience' => $data['audience'],
            'batch_id' => $data['audience'] === 'batch' ? $data['batch_id'] : null,
            'in_app' => $inApp,
            'whatsapp' => $whatsapp,
            'recipient_count' => $students->count(),
            'whatsapp_sent' => $sent,
            'whatsapp_prepared' => $prepared,
            'whatsapp_failed' => $failed,
        ]);

        AuditLog::record('message.sent', $message, 'Message "'.Str::limit($data['title'], 60).'" sent to '.$students->count().' student(s)');

        $summary = 'Message sent to '.$students->count().' student'.($students->count() === 1 ? '' : 's').($inApp ? ' (portal notification)' : '').'.';

        if ($whatsapp) {
            $parts = [];
            $skipped = max(0, $students->count() - self::WHATSAPP_LIMIT);

            if ($sent > 0) {
                $parts[] = "{$sent} sent";
            }
            if ($prepared > 0) {
                $parts[] = "{$prepared} prepared (driver is \"log\": use the click-to-chat links below)";
            }
            if ($failed > 0) {
                $parts[] = "{$failed} failed";
            }
            if ($skipped > 0) {
                $parts[] = "{$skipped} skipped (limit of ".self::WHATSAPP_LIMIT.' WhatsApp messages per send)';
            }

            $summary .= ' WhatsApp: '.implode(', ', $parts).'.';
        }

        return redirect('/portal/messages')->with($failed > 0 ? 'error' : 'success', $summary);
    }

    private function delayedStudentIds(): array
    {
        return Invoice::whereIn('status', ['unpaid', 'partial'])->whereNotNull('due_date')->whereDate('due_date', '<', today())
            ->pluck('student_id')->unique()->values()->all();
    }

    private function studentOption(Student $student): array
    {
        return [
            'id' => $student->id,
            'name' => $student->user->name,
            'student_no' => $student->student_no,
            'phone' => $student->whatsapp_number ?: $student->user->phone,
        ];
    }
}
