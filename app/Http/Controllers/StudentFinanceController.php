<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentTransaction;
use App\Services\PaymentService;
use App\Services\StudentSummary;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** The student's own money screen: invoices, "Pay now", payment history and receipts. */
class StudentFinanceController extends Controller
{
    public function index(Request $request)
    {
        $student = $request->user()->student;
        abort_unless($student, 403, 'No student profile is linked to this account.');

        return Inertia::render('Student/Finance', [
            'summary' => StudentSummary::invoices($student),
            'invoices' => Invoice::where('student_id', $student->id)->where('status', '!=', 'cancelled')
                ->orderByRaw("case when status = 'paid' then 1 else 0 end")->orderBy('due_date')->get()
                ->map(fn ($i) => [
                    'id' => $i->id, 'invoice_no' => $i->invoice_no, 'description' => $i->description, 'type' => $i->type,
                    'total' => $i->total, 'paid_amount' => $i->paid_amount, 'balance' => $i->balance,
                    'due_date' => $i->due_date?->toDateString(), 'status' => $i->status, 'overdue' => $i->isOverdue(),
                ]),
            'payments' => Payment::with('invoice:id,invoice_no,description')->where('student_id', $student->id)->orderByDesc('paid_at')->limit(50)->get()
                ->map(fn ($p) => [
                    'id' => $p->id, 'receipt_no' => $p->receipt_no, 'amount' => $p->amount, 'method' => $p->method, 'paid_at' => $p->paid_at,
                    'invoice' => $p->invoice->invoice_no, 'description' => $p->invoice->description, 'status' => $p->status,
                ]),
            'waiting' => PaymentTransaction::where('student_id', $student->id)->where('status', 'pending')->where('initiated_at', '>=', now()->subHours(6))->count(),
        ]);
    }

    /** "Pay now": creates the gateway transaction and sends the browser to the gateway. */
    public function pay(Request $request, Invoice $invoice, PaymentService $service)
    {
        $student = $request->user()->student;
        abort_unless($student && $invoice->student_id === $student->id, 403, 'This invoice belongs to another student.');

        $data = $request->validate(['amount' => 'nullable|numeric|min:1']);
        $result = $service->initiate($invoice, $request->user(), isset($data['amount']) ? (float) $data['amount'] : null);

        return Inertia::render('Payment/Redirect', ['checkout' => $result['checkout'], 'order_id' => $result['order_id']]);
    }
}
