<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $q = Expense::with(['category:id,name', 'recorder:id,name'])->orderByDesc('date')->orderByDesc('id');

        if ($request->filled('expense_category_id')) {
            $q->where('expense_category_id', $request->query('expense_category_id'));
        }
        if ($request->filled('from')) {
            $q->whereDate('date', '>=', $request->query('from'));
        }
        if ($request->filled('to')) {
            $q->whereDate('date', '<=', $request->query('to'));
        }
        if ($s = trim((string) $request->query('search', ''))) {
            $q->where(fn ($w) => $w->where('description', 'like', "%{$s}%")->orWhere('reference', 'like', "%{$s}%"));
        }

        $total = (clone $q)->reorder()->sum('amount');

        return Inertia::render('Finance/Expenses', [
            'expenses' => $q->paginate(20)->withQueryString()->through(fn ($e) => [
                'id' => $e->id, 'date' => $e->date->toDateString(), 'expense_category_id' => $e->expense_category_id, 'category' => $e->category->name,
                'description' => $e->description, 'amount' => $e->amount, 'payment_method' => $e->payment_method, 'reference' => $e->reference,
                'attachment_name' => $e->attachment_name, 'recorder' => $e->recorder?->name,
            ]),
            'total' => round((float) $total, 2),
            'categories' => ExpenseCategory::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'search' => $request->query('search', ''), 'expense_category_id' => $request->query('expense_category_id', ''),
                'from' => $request->query('from', ''), 'to' => $request->query('to', ''),
            ],
        ]);
    }

    private function rules(): array
    {
        return [
            'date' => 'required|date',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,bank,card,online',
            'reference' => 'nullable|string|max:120',
            'attachment' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,webp',
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $expense = new Expense(collect($data)->except('attachment')->all());
        $expense->recorded_by = $request->user()->id;

        if ($request->hasFile('attachment')) {
            [$expense->attachment_path, $expense->attachment_name] = Concerns::storeUpload($request->file('attachment'), 'finance/expenses');
        }

        $expense->save();
        AuditLog::record('created', $expense, "Expense recorded: {$expense->description}", ['amount' => $expense->amount]);

        return back()->with('success', 'Expense recorded.');
    }

    /** Sent as POST with _method=PUT so a bill or receipt can be replaced. */
    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate($this->rules());
        $expense->fill(collect($data)->except('attachment')->all());

        if ($request->hasFile('attachment')) {
            if ($expense->attachment_path) {
                Storage::disk('local')->delete($expense->attachment_path);
            }
            [$expense->attachment_path, $expense->attachment_name] = Concerns::storeUpload($request->file('attachment'), 'finance/expenses');
        }

        $expense->save();
        AuditLog::record('updated', $expense, "Expense updated: {$expense->description}");

        return back()->with('success', 'Expense saved.');
    }

    public function destroy(Expense $expense)
    {
        AuditLog::record('deleted', $expense, "Expense deleted: {$expense->description}", $expense->only(['date', 'amount', 'description']));

        if ($expense->attachment_path) {
            Storage::disk('local')->delete($expense->attachment_path);
        }

        $expense->delete();

        return back()->with('success', 'Expense deleted.');
    }

    public function download(Expense $expense)
    {
        abort_unless($expense->attachment_path && Storage::disk('local')->exists($expense->attachment_path), 404, 'No attachment on this expense.');

        return response()->download(Storage::disk('local')->path($expense->attachment_path), $expense->attachment_name ?: basename($expense->attachment_path));
    }
}
