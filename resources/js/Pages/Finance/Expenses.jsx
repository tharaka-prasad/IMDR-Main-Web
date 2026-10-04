import { Head, router, useForm } from '@inertiajs/react';
import { Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Empty, Field, FormError, Modal, PageHeader, Pagination, SearchBox, SelectInput, Stat, TableWrap, TextArea, TextInput, Thead } from '../../Components/ui';
import { confirmThen, fmtDate, money, useFilters } from '../../lib';

const empty = { date: new Date().toISOString().slice(0, 10), expense_category_id: '', description: '', amount: '', payment_method: 'cash', reference: '', attachment: null };

export default function Expenses({ expenses, total, categories, filters }) {
    const [f, setF] = useFilters('/portal/expenses', filters);
    const [modal, setModal] = useState(null); // { row } | null
    const form = useForm(empty);

    const open = (row) => {
        form.clearErrors();
        form.setData(row ? { date: row.date, expense_category_id: row.expense_category_id, description: row.description, amount: row.amount, payment_method: row.payment_method, reference: row.reference || '', attachment: null } : empty);
        setModal({ row });
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { forceFormData: true, preserveScroll: true, onSuccess: () => setModal(null) };
        modal.row ? form.transform((d) => ({ ...d, _method: 'put' })).post(`/portal/expenses/${modal.row.id}`, opts) : form.post('/portal/expenses', opts);
    };

    return (
        <>
            <Head title="Expenses" />
            <PageHeader title="Expenses" actions={<Button variant="gold" onClick={() => open(null)}><Plus size={16} /> Record an expense</Button>} />

            <div className="mb-4 grid gap-3 md:grid-cols-4">
                <SearchBox className="md:col-span-2" value={f.search} onChange={(v) => setF({ search: v })} placeholder="Search description or reference" />
                <SelectInput value={f.expense_category_id} onChange={(e) => setF({ expense_category_id: e.target.value }, true)} options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="All categories" />
                <Stat label="Total (this filter)" value={money(total)} accent="gold" />
            </div>

            {expenses.data.length === 0 ? <Empty title="No expenses recorded" /> : (
                <TableWrap>
                    <Thead><th className="th">Date</th><th className="th">Category</th><th className="th">Description</th><th className="th">Method</th><th className="th text-right">Amount</th><th className="th">Recorded by</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {expenses.data.map((x) => (
                            <tr key={x.id}>
                                <td className="td">{fmtDate(x.date)}</td><td className="td">{x.category}</td><td className="td">{x.description}{x.reference && <p className="text-xs text-navy-400">Ref: {x.reference}</p>}</td>
                                <td className="td capitalize">{x.payment_method}</td><td className="td text-right font-semibold">{money(x.amount)}</td><td className="td">{x.recorder}</td>
                                <td className="td whitespace-nowrap text-right">
                                    {x.attachment_name && <Button native href={`/portal/expenses/${x.id}/download`} variant="ghost" size="sm" aria-label="Download attachment"><Download size={14} /></Button>}
                                    <Button variant="ghost" size="sm" onClick={() => open(x)}><Pencil size={14} /></Button>
                                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => confirmThen('Delete this expense?', () => router.delete(`/portal/expenses/${x.id}`, { preserveScroll: true }))}><Trash2 size={14} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
            <Pagination paginator={expenses} />

            <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.row ? 'Edit expense' : 'Record an expense'}
                footer={<><Button variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button variant="gold" disabled={form.processing} onClick={submit}>Save</Button></>}>
                <form onSubmit={submit} className="space-y-4">
                    <FormError errors={form.errors} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Date" error={form.errors.date}><TextInput type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} /></Field>
                        <Field label="Category" error={form.errors.expense_category_id}><SelectInput value={form.data.expense_category_id} onChange={(e) => form.setData('expense_category_id', e.target.value)} options={categories.map((c) => ({ value: c.id, label: c.name }))} /></Field>
                    </div>
                    <Field label="Description" error={form.errors.description}><TextInput value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Amount (Rs.)" error={form.errors.amount}><TextInput type="number" min="0.01" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} /></Field>
                        <Field label="Payment method" error={form.errors.payment_method}><SelectInput value={form.data.payment_method} onChange={(e) => form.setData('payment_method', e.target.value)} placeholder={null} options={[{ value: 'cash', label: 'Cash' }, { value: 'bank', label: 'Bank' }, { value: 'card', label: 'Card' }, { value: 'online', label: 'Online' }]} /></Field>
                    </div>
                    <Field label="Reference" error={form.errors.reference}><TextInput value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} /></Field>
                    <Field label="Receipt or bill (optional)" error={form.errors.attachment}><input type="file" onChange={(e) => form.setData('attachment', e.target.files[0] || null)} className="input" /></Field>
                </form>
            </Modal>
        </>
    );
}
