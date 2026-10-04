<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Invoice;
use App\Models\Student;
use App\Services\InvoiceService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $q = Invoice::with(['student.user:id,name'])->orderByDesc('id');

        foreach (['status', 'type'] as $f) {
            if ($request->filled($f)) {
                $q->where($f, $request->query($f));
            }
        }

        if ($request->boolean('overdue')) {
            $q->whereIn('status', ['unpaid', 'partial'])->whereNotNull('due_date')->whereDate('due_date', '<', today());
        }

        if ($s = trim((string) $request->query('search', ''))) {
            $q->where(fn ($w) => $w->where('invoice_no', 'like', "%{$s}%")
                ->orWhereHas('student', fn ($st) => $st->where('student_no', 'like', "%{$s}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$s}%")->orWhere('phone', 'like', "%{$s}%"))));
        }

        return Inertia::render('Finance/Invoices', [
            'invoices' => $q->paginate(20)->withQueryString()->through(fn ($i) => [
                'id' => $i->id, 'invoice_no' => $i->invoice_no, 'student' => $i->student->user->name, 'student_no' => $i->student->student_no,
                'student_id' => $i->student_id, 'description' => $i->description, 'total' => $i->total, 'paid_amount' => $i->paid_amount,
                'balance' => $i->balance, 'due_date' => $i->due_date?->toDateString(), 'status' => $i->status, 'overdue' => $i->isOverdue(),
            ]),
            'filters' => ['search' => $request->query('search', ''), 'status' => $request->query('status', ''), 'overdue' => $request->boolean('overdue')],
            'students' => Student::with('user:id,name')->orderByDesc('id')->limit(800)->get()->map(fn ($s) => ['value' => $s->id, 'label' => $s->user->name.' ('.$s->student_no.')']),
        ]);
    }

    public function store(Request $request, InvoiceService $service)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:students,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
            'discount' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
        ]);

        if (($data['discount'] ?? 0) > $data['amount']) {
            return back()->withErrors(['discount' => 'The discount cannot be more than the amount.']);
        }

        $invoice = $service->create($data['student_id'], null, 'other', $data['description'], (float) $data['amount'], $data['due_date'] ?? null, (float) ($data['discount'] ?? 0));
        AuditLog::record('created', $invoice, "Invoice {$invoice->invoice_no} created");
        NotificationService::send($invoice->student->user_id, 'New invoice', "{$invoice->invoice_no}: {$invoice->description}", 'payment', '/portal/finance');

        return back()->with('success', "Invoice {$invoice->invoice_no} created.");
    }

    public function cancel(Invoice $invoice)
    {
        if ($invoice->paid_amount > 0) {
            return back()->with('error', 'Payments were received on this invoice. Refund them first.');
        }

        $invoice->update(['status' => 'cancelled']);
        AuditLog::record('invoice.cancelled', $invoice, "Invoice {$invoice->invoice_no} cancelled");

        return back()->with('success', 'Invoice cancelled.');
    }
}
