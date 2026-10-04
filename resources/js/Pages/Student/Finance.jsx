import { Head, router, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Card, Empty, PageHeader, Stat, Status, TableWrap, Thead } from '../../Components/ui';
import { fmtDate, fmtDateTime, money } from '../../lib';

export default function Finance({ summary, invoices, payments, waiting }) {
    const [payingId, setPayingId] = useState(null);
    const pay = useForm({ amount: '' });

    const start = (invoice) => {
        setPayingId(invoice.id);
        router.post(`/portal/finance/invoices/${invoice.id}/pay`, {}, { onFinish: () => setPayingId(null) });
    };

    return (
        <>
            <Head title="Fees and payments" />
            <PageHeader title="Fees and payments" />

            {waiting > 0 && <Alert tone="amber" className="mb-4">A payment is being confirmed by the bank. It can take a moment to update below.</Alert>}

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <Stat label="Total fees" value={money(summary.total)} accent="navy" />
                <Stat label="Paid" value={money(summary.paid)} accent="green" />
                <Stat label="Outstanding" value={money(summary.outstanding)} accent={summary.outstanding ? 'gold' : 'green'} hint={summary.next_due ? `Next due ${fmtDate(summary.next_due.due_date)}` : 'Nothing due'} />
            </div>

            <h2 className="mb-2 text-lg font-bold text-navy">My invoices</h2>
            {invoices.length === 0 ? <Empty title="No invoices yet" /> : (
                <TableWrap>
                    <Thead><th className="th">Invoice</th><th className="th">For</th><th className="th">Due</th><th className="th text-right">Total</th><th className="th text-right">Balance</th><th className="th">Status</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {invoices.map((i) => (
                            <tr key={i.id} className={i.overdue ? 'bg-red-50/50' : undefined}>
                                <td className="td">{i.invoice_no}</td><td className="td">{i.description}</td>
                                <td className="td">{fmtDate(i.due_date)}{i.overdue && <span className="ml-1 text-xs font-semibold text-red-600">Overdue</span>}</td>
                                <td className="td text-right">{money(i.total)}</td><td className="td text-right font-semibold">{money(i.balance)}</td>
                                <td className="td"><Status value={i.status} /></td>
                                <td className="td text-right">{i.status !== 'paid' && (
                                    <Button variant="gold" size="sm" disabled={payingId === i.id} onClick={() => start(i)}>{payingId === i.id ? <Loader2 size={14} className="animate-spin" /> : 'Pay now'}</Button>
                                )}</td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}

            <h2 className="mb-2 mt-8 text-lg font-bold text-navy">Payment history</h2>
            {payments.length === 0 ? <Empty title="No payments yet" /> : (
                <TableWrap>
                    <Thead><th className="th">Date</th><th className="th">For</th><th className="th">Method</th><th className="th text-right">Amount</th><th className="th">Status</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {payments.map((p) => (
                            <tr key={p.id}>
                                <td className="td">{fmtDateTime(p.paid_at)}</td><td className="td">{p.description}<p className="text-xs text-navy-400">{p.invoice}</p></td>
                                <td className="td"><Status value={p.method} /></td><td className="td text-right font-semibold">{money(p.amount)}</td><td className="td"><Status value={p.status} /></td>
                                <td className="td text-right"><Button href={`/portal/receipts/${p.id}`} variant="subtle" size="sm">Receipt</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
        </>
    );
}
