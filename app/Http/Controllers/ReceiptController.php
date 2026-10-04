<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReceiptController extends Controller
{
    private function data(Payment $payment): array
    {
        $payment->load(['invoice', 'student.user:id,name,phone', 'refunds']);

        return [
            'receipt_no' => $payment->receipt_no,
            'paid_at' => $payment->paid_at,
            'amount' => $payment->amount,
            'refunded_amount' => $payment->refunded_amount,
            'method' => $payment->method,
            'reference' => $payment->reference,
            'status' => $payment->status,
            'student' => ['name' => $payment->student->user->name, 'student_no' => $payment->student->student_no],
            'invoice' => [
                'invoice_no' => $payment->invoice->invoice_no, 'description' => $payment->invoice->description,
                'total' => $payment->invoice->total, 'paid_amount' => $payment->invoice->paid_amount, 'balance' => $payment->invoice->balance,
            ],
            'refunds' => $payment->refunds->map(fn ($r) => ['amount' => $r->amount, 'reason' => $r->reason, 'processed_at' => $r->processed_at]),
            'institute' => [
                'name' => Setting::get('institute_name'), 'phone' => Setting::get('institute_phone'),
                'email' => Setting::get('institute_email'), 'address' => Setting::get('institute_address'),
            ],
        ];
    }

    /** Logged-in view: staff (finance / admin) or the student who paid. */
    public function show(Request $request, Payment $payment)
    {
        $user = $request->user();

        if ($user->role === 'student') {
            abort_unless($user->student && $payment->student_id === $user->student->id, 403, 'You cannot open this receipt.');
        } else {
            abort_unless(in_array($user->role, ['super_admin', 'admin', 'accountant'], true), 403, 'You do not have permission to open this page.');
        }

        return Inertia::render('Receipt', ['receipt' => $this->data($payment), 'public' => false]);
    }

    /** The link sent on WhatsApp. Works without logging in, but only with a valid signature (and expires). */
    public function publicShow(Payment $payment)
    {
        return Inertia::render('Receipt', ['receipt' => $this->data($payment), 'public' => true]);
    }
}
