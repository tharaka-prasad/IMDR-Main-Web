<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentTransaction;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $q = Payment::with(['student.user:id,name', 'invoice:id,invoice_no,description'])->orderByDesc('paid_at')->orderByDesc('id');

        if ($request->filled('method')) {
            $q->where('method', $request->query('method'));
        }
        if ($request->filled('from')) {
            $q->whereDate('paid_at', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $q->whereDate('paid_at', '<=', $request->query('to'));
        }
        if ($s = trim((string) $request->query('search', ''))) {
            $q->where(fn ($w) => $w->where('receipt_no', 'like', "%{$s}%")->orWhere('reference', 'like', "%{$s}%")
                ->orWhereHas('student', fn ($st) => $st->where('student_no', 'like', "%{$s}%"))
                ->orWhereHas('student.user', fn ($u) => $u->where('name', 'like', "%{$s}%")));
        }

        return Inertia::render('Finance/Payments', [
            'payments' => $q->paginate(20)->withQueryString()->through(fn ($p) => [
                'id' => $p->id, 'receipt_no' => $p->receipt_no, 'student' => $p->student->user->name, 'student_no' => $p->student->student_no,
                'invoice_no' => $p->invoice->invoice_no, 'description' => $p->invoice->description, 'amount' => $p->amount,
                'refunded_amount' => $p->refunded_amount, 'refundable' => round($p->amount - $p->refunded_amount, 2),
                'method' => $p->method, 'reference' => $p->reference, 'paid_at' => $p->paid_at, 'status' => $p->status,
            ]),
            'filters' => ['search' => $request->query('search', ''), 'method' => $request->query('method', ''), 'from' => $request->query('from', ''), 'to' => $request->query('to', '')],
            'openInvoices' => Invoice::with('student.user:id,name')->whereIn('status', ['unpaid', 'partial'])->orderBy('due_date')->limit(600)->get()
                ->map(fn ($i) => ['value' => $i->id, 'label' => $i->invoice_no.' - '.$i->student->user->name.' - Rs. '.number_format($i->balance, 2), 'balance' => $i->balance]),
        ]);
    }

    public function store(Request $request, PaymentService $service)
    {
        $data = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:1',
            'method' => 'required|in:cash,bank',
            'reference' => 'nullable|string|max:120',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $payment = $service->recordManual(
            Invoice::findOrFail($data['invoice_id']), (float) $data['amount'], $data['method'],
            $data['reference'] ?? null, $data['paid_at'] ?? null, $data['notes'] ?? null, $request->user()
        );

        $wa = \App\Models\WhatsAppMessage::where('payment_id', $payment->id)->latest('id')->first();
        $waText = match ($wa?->status) {
            'sent' => 'The receipt was sent on WhatsApp.',
            'simulated' => 'WhatsApp driver is "log": open the WhatsApp log to send it with the click-to-chat link.',
            'failed' => 'WhatsApp sending failed: '.$wa->error,
            default => 'WhatsApp receipts are switched off.',
        };

        return back()->with('success', "Payment recorded. Receipt {$payment->receipt_no}. {$waText}");
    }

    public function refund(Request $request, Payment $payment, PaymentService $service)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:1',
            'reason' => 'required|string|max:500',
        ]);

        $service->refund($payment, (float) $data['amount'], $data['reason'], $request->user());

        return back()->with('success', 'Refund recorded.');
    }

    /** Every gateway attempt, including failed and pending ones. */
    public function transactions(Request $request)
    {
        $q = PaymentTransaction::with(['student.user:id,name', 'invoice:id,invoice_no'])->orderByDesc('id');

        if ($request->filled('status')) {
            $q->where('status', $request->query('status'));
        }

        return Inertia::render('Finance/Transactions', [
            'transactions' => $q->paginate(20)->withQueryString()->through(fn ($t) => [
                'id' => $t->id, 'order_id' => $t->order_id, 'student' => $t->student->user->name, 'invoice_no' => $t->invoice->invoice_no,
                'gateway' => $t->gateway, 'amount' => $t->amount, 'currency' => $t->currency, 'status' => $t->status,
                'reference' => $t->gateway_reference, 'initiated_at' => $t->initiated_at, 'completed_at' => $t->completed_at,
            ]),
            'filters' => ['status' => $request->query('status', '')],
        ]);
    }
}
