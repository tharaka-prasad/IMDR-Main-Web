<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\FinanceReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function finance(Request $request)
    {
        $from = $request->query('from', now()->startOfMonth()->toDateString());
        $to = $request->query('to', now()->toDateString());

        $outstanding = Invoice::with('student.user:id,name,phone')->whereIn('status', ['unpaid', 'partial'])->orderBy('due_date')->limit(150)->get()
            ->map(fn ($i) => [
                'id' => $i->id, 'invoice_no' => $i->invoice_no, 'student' => $i->student->user->name, 'student_no' => $i->student->student_no,
                'phone' => $i->student->user->phone, 'description' => $i->description, 'balance' => $i->balance,
                'due_date' => $i->due_date?->toDateString(), 'overdue' => $i->isOverdue(),
            ]);

        return Inertia::render('Finance/Reports', [
            'report' => FinanceReport::range($from, $to),
            'outstanding' => $outstanding,
            'outstandingTotals' => FinanceReport::outstanding(),
            'chart' => FinanceReport::monthly(6),
        ]);
    }
}
