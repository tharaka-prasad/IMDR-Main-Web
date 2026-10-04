<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PayrollItem;
use App\Models\Refund;
use Illuminate\Support\Facades\DB;

/** Income / expense figures used by the dashboards and the finance report. */
class FinanceReport
{
    public static function range(string $from, string $to): array
    {
        $payments = Payment::whereDate('paid_at', '>=', $from)->whereDate('paid_at', '<=', $to);
        $gross = (float) (clone $payments)->sum('amount');

        $byMethod = (clone $payments)->selectRaw('method, sum(amount) as total, count(*) as count')->groupBy('method')->get()
            ->map(fn ($r) => ['method' => $r->method, 'total' => round((float) $r->total, 2), 'count' => (int) $r->count])->values()->all();

        $refunds = (float) Refund::whereDate('processed_at', '>=', $from)->whereDate('processed_at', '<=', $to)->sum('amount');

        $expenseQuery = Expense::whereDate('date', '>=', $from)->whereDate('date', '<=', $to);
        $expenses = (float) (clone $expenseQuery)->sum('amount');

        $byCategory = Expense::whereDate('date', '>=', $from)->whereDate('date', '<=', $to)
            ->join('expense_categories', 'expense_categories.id', '=', 'expenses.expense_category_id')
            ->selectRaw('expense_categories.name as category, sum(expenses.amount) as total')
            ->groupBy('expense_categories.name')->orderByDesc(DB::raw('sum(expenses.amount)'))->get()
            ->map(fn ($r) => ['category' => $r->category, 'total' => round((float) $r->total, 2)])->values()->all();

        $payroll = (float) PayrollItem::where('status', 'paid')->whereDate('paid_at', '>=', $from)->whereDate('paid_at', '<=', $to)->sum('net');

        return [
            'from' => $from,
            'to' => $to,
            'income_gross' => round($gross, 2),
            'refunds' => round($refunds, 2),
            'income_net' => round($gross - $refunds, 2),
            'expenses' => round($expenses, 2),
            'payroll' => round($payroll, 2),
            'net_result' => round($gross - $refunds - $expenses - $payroll, 2),
            'by_method' => $byMethod,
            'by_category' => $byCategory,
        ];
    }

    /** Money still to be collected: every unpaid / part-paid invoice. */
    public static function outstanding(): array
    {
        $rows = Invoice::whereIn('status', ['unpaid', 'partial'])->get();

        return [
            'total' => round($rows->sum('balance'), 2),
            'count' => $rows->count(),
            'overdue_total' => round($rows->filter(fn ($i) => $i->due_date && $i->due_date->lt(today()))->sum('balance'), 2),
            'overdue_count' => $rows->filter(fn ($i) => $i->due_date && $i->due_date->lt(today()))->count(),
        ];
    }

    /** Income vs spending for the last N months (for the dashboard chart). */
    public static function monthly(int $months = 6): array
    {
        $out = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $start = now()->subMonths($i)->startOfMonth();
            $r = self::range($start->toDateString(), $start->copy()->endOfMonth()->toDateString());
            $out[] = ['label' => $start->format('M'), 'income' => $r['income_net'], 'spending' => round($r['expenses'] + $r['payroll'], 2)];
        }

        return $out;
    }
}
