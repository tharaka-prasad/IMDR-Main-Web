import { Head, Link, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Empty, Field, FormError, Modal, PageHeader, Pagination, SearchBox, SelectInput, Status, TableWrap, TextArea, TextInput, Thead } from '../../Components/ui';
import { fmtDateTime, money, useFilters } from '../../lib';

export default function Payments({ payments, filters, openInvoices }) {
    const [f, setF] = useFilters('/portal/payments', filters);
    const [open, setOpen] = useState(false);
    const [refunding, setRefunding] = useState(null);
    const form = useForm({ invoice_id: '', amount: '', method: 'cash', reference: '', paid_at: '', notes: '' });
    const refund = useForm({ amount: '', reason: '' });

    const invoice = openInvoices.find((i) => String(i.value) === String(form.data.invoice_id));

    return (
        <>
            <Head title="Payments and receipts" />
            <PageHeader title="Payments and receipts" subtitle="Record a cash or bank payment. Online payments are added automatically once the gateway confirms them, and a receipt is sent on WhatsApp." actions={<Button variant="gold" onClick={() => { form.clearErrors(); setOpen(true); }}><Plus size={16} /> Record a payment</Button>} />

            <div className="mb-4 grid gap-3 md:grid-cols-4">
                <SearchBox className="md:col-span-2" value={f.search} onChange={(v) => setF({ search: v })} placeholder="Search receipt, reference or student" />
                <SelectInput value={f.method} onChange={(e) => setF({ method: e.target.value }, true)} options={[{ value: 'online', label: 'Online' }, { value: 'cash', label: 'Cash' }, { value: 'bank', label: 'Bank' }]} placeholder="All methods" />
            </div>

            {payments.data.length === 0 ? <Empty title="No payments found" /> : (
                <TableWrap>
                    <Thead><th className="th">Receipt</th><th className="th">Student</th><th className="th">Invoice</th><th className="th">Method</th><th className="th">Date</th><th className="th text-right">Amount</th><th className="th">Status</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {payments.data.map((p) => (
                            <tr key={p.id}>
                                <td className="td"><Link href={`/portal/receipts/${p.id}`} className="text-brand hover:underline">{p.receipt_no}</Link></td>
                                <td className="td">{p.student}<p className="text-xs text-navy-400">{p.student_no}</p></td>
                                <td className="td">{p.invoice_no}<p className="text-xs text-navy-400">{p.description}</p></td>
                                <td className="td"><Status value={p.method} /></td><td className="td">{fmtDateTime(p.paid_at)}</td>
                                <td className="td text-right font-semibold">{money(p.amount)}</td><td className="td"><Status value={p.status} /></td>
                                <td className="td text-right">{p.refundable > 0 && <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { refund.setData({ amount: p.refundable, reason: '' }); refund.clearErrors(); setRefunding(p); }}>Refund</Button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
            <Pagination paginator={payments} />

            <Modal open={open} onClose={() => setOpen(false)} title="Record a cash or bank payment"
                footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="gold" disabled={form.processing} onClick={() => form.post('/portal/payments', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })}>Record</Button></>}>
                <FormError errors={form.errors} />
                <div className="space-y-4">
                    <Field label="Invoice" error={form.errors.invoice_id}><SelectInput value={form.data.invoice_id} onChange={(e) => form.setData('invoice_id', e.target.value)} options={openInvoices} /></Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Amount (Rs.)" error={form.errors.amount} help={invoice ? `Balance: Rs. ${invoice.balance.toLocaleString()}` : undefined}><TextInput type="number" min="1" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} /></Field>
                        <Field label="Method" error={form.errors.method}><SelectInput value={form.data.method} onChange={(e) => form.setData('method', e.target.value)} placeholder={null} options={[{ value: 'cash', label: 'Cash' }, { value: 'bank', label: 'Bank transfer' }]} /></Field>
                    </div>
                    <Field label="Reference (optional)" error={form.errors.reference}><TextInput value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} placeholder="Bank slip number" /></Field>
                    <Field label="Date paid" error={form.errors.paid_at} help="Leave empty to use now."><TextInput type="datetime-local" value={form.data.paid_at} onChange={(e) => form.setData('paid_at', e.target.value)} /></Field>
                    <Field label="Notes" error={form.errors.notes}><TextArea rows={2} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} /></Field>
                </div>
            </Modal>

            <Modal open={!!refunding} onClose={() => setRefunding(null)} title={`Refund ${refunding?.receipt_no ?? ''}`}
                footer={<><Button variant="outline" onClick={() => setRefunding(null)}>Cancel</Button><Button variant="danger" disabled={refund.processing} onClick={() => refund.post(`/portal/payments/${refunding.id}/refund`, { preserveScroll: true, onSuccess: () => setRefunding(null) })}>Refund</Button></>}>
                <Alert tone="amber" className="mb-3">This does not delete the payment. It records a reversal and reduces the invoice's paid amount.</Alert>
                <div className="space-y-4">
                    <Field label="Refund amount (Rs.)" error={refund.errors.amount} help={refunding ? `Up to Rs. ${refunding.refundable.toLocaleString()}` : undefined}><TextInput type="number" min="1" step="0.01" value={refund.data.amount} onChange={(e) => refund.setData('amount', e.target.value)} /></Field>
                    <Field label="Reason" error={refund.errors.reason}><TextArea rows={2} value={refund.data.reason} onChange={(e) => refund.setData('reason', e.target.value)} /></Field>
                </div>
            </Modal>
        </>
    );
}
