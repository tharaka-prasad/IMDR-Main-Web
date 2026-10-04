import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Empty, Field, FormError, Modal, PageHeader, Pagination, SearchBox, SelectInput, Status, TableWrap, TextInput, Thead } from '../../Components/ui';
import { confirmThen, fmtDate, money, useFilters } from '../../lib';

export default function Invoices({ invoices, filters, students }) {
    const [f, setF] = useFilters('/portal/invoices', filters);
    const [open, setOpen] = useState(false);
    const form = useForm({ student_id: '', description: '', amount: '', discount: '', due_date: '' });

    return (
        <>
            <Head title="Invoices" />
            <PageHeader title="Invoices" actions={<Button variant="gold" onClick={() => { form.clearErrors(); setOpen(true); }}><Plus size={16} /> New invoice</Button>} />

            <div className="mb-4 grid gap-3 md:grid-cols-4">
                <SearchBox className="md:col-span-2" value={f.search} onChange={(v) => setF({ search: v })} placeholder="Search invoices or students" />
                <SelectInput value={f.status} onChange={(e) => setF({ status: e.target.value }, true)} options={[{ value: 'unpaid', label: 'Unpaid' }, { value: 'partial', label: 'Partial' }, { value: 'paid', label: 'Paid' }, { value: 'cancelled', label: 'Cancelled' }]} placeholder="All statuses" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.overdue} onChange={(e) => setF({ overdue: e.target.checked }, true)} /> Overdue only</label>
            </div>

            {invoices.data.length === 0 ? <Empty title="No invoices found" /> : (
                <TableWrap>
                    <Thead><th className="th">Invoice</th><th className="th">Student</th><th className="th">For</th><th className="th">Due</th><th className="th text-right">Total</th><th className="th text-right">Balance</th><th className="th">Status</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {invoices.data.map((i) => (
                            <tr key={i.id} className={i.overdue ? 'bg-red-50/40' : undefined}>
                                <td className="td">{i.invoice_no}</td>
                                <td className="td"><Link className="text-brand hover:underline" href={`/portal/students/${i.student_id}`}>{i.student}</Link><p className="text-xs text-navy-400">{i.student_no}</p></td>
                                <td className="td">{i.description}</td><td className="td">{fmtDate(i.due_date)}{i.overdue && <span className="ml-1 text-xs font-semibold text-red-600">Overdue</span>}</td>
                                <td className="td text-right">{money(i.total)}</td><td className="td text-right font-semibold">{money(i.balance)}</td><td className="td"><Status value={i.status} /></td>
                                <td className="td text-right">{i.paid_amount === 0 && i.status !== 'cancelled' && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => confirmThen('Cancel this invoice?', () => router.post(`/portal/invoices/${i.id}/cancel`, {}, { preserveScroll: true }))}>Cancel</Button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
            <Pagination paginator={invoices} />

            <Modal open={open} onClose={() => setOpen(false)} title="New invoice"
                footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="gold" disabled={form.processing} onClick={() => form.post('/portal/invoices', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })}>Create</Button></>}>
                <FormError errors={form.errors} />
                <div className="space-y-4">
                    <Field label="Student" error={form.errors.student_id}><SelectInput value={form.data.student_id} onChange={(e) => form.setData('student_id', e.target.value)} options={students} /></Field>
                    <Field label="Description" error={form.errors.description}><TextInput value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Late fee, resit fee, material charge..." /></Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Amount (Rs.)" error={form.errors.amount}><TextInput type="number" min="1" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} /></Field>
                        <Field label="Discount (Rs.)" error={form.errors.discount}><TextInput type="number" min="0" step="0.01" value={form.data.discount} onChange={(e) => form.setData('discount', e.target.value)} /></Field>
                    </div>
                    <Field label="Due date" error={form.errors.due_date}><TextInput type="date" value={form.data.due_date} onChange={(e) => form.setData('due_date', e.target.value)} /></Field>
                </div>
            </Modal>
        </>
    );
}
