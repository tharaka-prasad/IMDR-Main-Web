<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\PayrollItem;
use App\Models\PayrollPeriod;
use App\Models\SalaryRule;
use App\Models\TimetableEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Payroll: monthly salary, hourly (held class hours x rate) or per session (held classes x rate).
 * Hours come from the timetable: a class counts once its attendance register was marked ("held").
 */
class PayrollController extends Controller
{
    public function index()
    {
        return Inertia::render('Finance/Payroll', [
            'periods' => PayrollPeriod::withCount('items')->withSum('items as total_net', 'net')->orderByDesc('year')->orderByDesc('month')->get()
                ->map(fn ($p) => ['id' => $p->id, 'year' => $p->year, 'month' => $p->month, 'status' => $p->status, 'items_count' => $p->items_count, 'total_net' => round((float) $p->total_net, 2)]),
            'missingRules' => \App\Models\User::whereIn('role', ['lecturer', 'admin', 'accountant'])->where('status', '!=', 'suspended')
                ->whereDoesntHave('salaryRule')->count(),
        ]);
    }

    public function generate(Request $request)
    {
        $data = $request->validate(['year' => 'required|integer|between:2020,2100', 'month' => 'required|integer|between:1,12']);

        $period = PayrollPeriod::firstOrCreate(['year' => $data['year'], 'month' => $data['month']]);

        if ($period->status !== 'draft') {
            return back()->with('error', 'This month was already approved. Approved payroll cannot be regenerated.');
        }

        $start = Carbon::create($data['year'], $data['month'], 1)->startOfDay();
        $end = $start->copy()->endOfMonth();

        DB::transaction(function () use ($period, $start, $end) {
            $period->items()->delete();

            foreach (SalaryRule::with('user.lecturer')->get() as $rule) {
                $user = $rule->user;

                if (! $user || $user->status === 'suspended') {
                    continue;
                }

                $hours = 0.0;
                $sessions = 0;

                if ($user->lecturer) {
                    $held = TimetableEntry::where('lecturer_id', $user->lecturer->id)->where('status', 'held')
                        ->whereDate('date', '>=', $start->toDateString())->whereDate('date', '<=', $end->toDateString())->get();
                    $hours = round((float) $held->sum('hours'), 2);
                    $sessions = $held->count();
                }

                $basic = match ($rule->pay_type) {
                    'hourly' => round($hours * $rule->hourly_rate, 2),
                    'session' => round($sessions * $rule->session_rate, 2),
                    default => (float) $rule->basic_salary,
                };

                $net = round($basic + $rule->allowances - $rule->deductions, 2);

                if ($net <= 0) {
                    continue;
                }

                $period->items()->create([
                    'user_id' => $user->id, 'pay_type' => $rule->pay_type, 'hours' => $hours, 'sessions' => $sessions,
                    'basic' => $basic, 'allowances' => $rule->allowances, 'deductions' => $rule->deductions, 'net' => $net,
                ]);
            }
        });

        AuditLog::record('payroll.generated', $period, "Payroll generated for {$data['year']}-{$data['month']}");

        return redirect('/portal/payroll/'.$period->id)->with('success', 'Payroll calculated. Check it, then approve.');
    }

    public function show(PayrollPeriod $period)
    {
        return Inertia::render('Finance/PayrollShow', [
            'period' => $period->only(['id', 'year', 'month', 'status']),
            'items' => $period->items()->with('user:id,name,role')->get()->map(fn ($i) => [
                'id' => $i->id, 'name' => $i->user->name, 'role' => $i->user->role, 'pay_type' => $i->pay_type, 'hours' => $i->hours,
                'sessions' => $i->sessions, 'basic' => $i->basic, 'allowances' => $i->allowances, 'deductions' => $i->deductions,
                'net' => $i->net, 'status' => $i->status, 'paid_at' => $i->paid_at,
            ]),
        ]);
    }

    public function approve(PayrollPeriod $period)
    {
        if ($period->status !== 'draft') {
            return back()->with('error', 'This payroll is already approved.');
        }

        $period->update(['status' => 'approved']);
        AuditLog::record('payroll.approved', $period, "Payroll {$period->year}-{$period->month} approved");

        return back()->with('success', 'Payroll approved. You can now record the salary payments.');
    }

    public function pay(Request $request, PayrollItem $item)
    {
        $data = $request->validate(['payment_method' => 'required|in:cash,bank']);
        $period = $item->period;

        if ($period->status === 'draft') {
            return back()->with('error', 'Approve the payroll before paying salaries.');
        }

        if ($item->status === 'paid') {
            return back()->with('error', 'This salary is already paid.');
        }

        $item->update(['status' => 'paid', 'paid_at' => now(), 'payment_method' => $data['payment_method']]);
        AuditLog::record('payroll.paid', $item, "Salary paid to {$item->user->name}", ['net' => $item->net]);

        if (! $period->items()->where('status', '!=', 'paid')->exists()) {
            $period->update(['status' => 'paid']);
        }

        return back()->with('success', 'Salary payment recorded.');
    }

    public function destroy(PayrollPeriod $period)
    {
        if ($period->status !== 'draft') {
            return back()->with('error', 'Only draft payroll can be deleted.');
        }

        $period->delete();

        return redirect('/portal/payroll')->with('success', 'Draft payroll deleted.');
    }
}
