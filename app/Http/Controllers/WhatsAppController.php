<?php

namespace App\Http\Controllers;

use App\Models\WhatsAppMessage;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Log of every WhatsApp receipt: sent, failed or simulated. Failed ones can be sent again. */
class WhatsAppController extends Controller
{
    public function index(Request $request)
    {
        $q = WhatsAppMessage::with(['payment:id,receipt_no', 'student.user:id,name'])->orderByDesc('id');

        if ($request->filled('status')) {
            $q->where('status', $request->query('status'));
        }

        return Inertia::render('Finance/WhatsApp', [
            'messages' => $q->paginate(20)->withQueryString()->through(fn ($m) => [
                'id' => $m->id, 'student' => $m->student?->user->name, 'phone' => $m->to_phone, 'receipt_no' => $m->payment?->receipt_no,
                'driver' => $m->driver, 'status' => $m->status, 'error' => $m->error, 'created_at' => $m->created_at,
                'manual_link' => WhatsAppService::manualLink($m->to_phone, $m->body),
            ]),
            'filters' => ['status' => $request->query('status', '')],
            'driver' => config('imdr.whatsapp.driver'),
        ]);
    }

    public function resend(WhatsAppMessage $message)
    {
        $new = WhatsAppService::resend($message);

        return back()->with($new->status === 'failed' ? 'error' : 'success', $new->status === 'sent' ? 'Message sent.' : ($new->status === 'simulated' ? 'Driver is "log": nothing was sent. Use the click-to-chat link.' : 'Sending failed: '.$new->error));
    }
}
