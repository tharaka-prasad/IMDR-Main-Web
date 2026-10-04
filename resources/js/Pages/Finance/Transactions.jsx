import { Head } from '@inertiajs/react';
import { Empty, PageHeader, Pagination, SelectInput, Status, TableWrap, Thead } from '../../Components/ui';
import { fmtDateTime, money, useFilters } from '../../lib';

export default function Transactions({ transactions, filters }) {
    const [f, setF] = useFilters('/portal/transactions', filters);

    return (
        <>
            <Head title="Online payments" />
            <PageHeader title="Online payments" subtitle="Every attempt at the gateway, including failed and pending ones. Only a verified 'success' notification ever credits an invoice." />

            <div className="mb-4 max-w-xs"><SelectInput value={f.status} onChange={(e) => setF({ status: e.target.value }, true)} options={[{ value: 'success', label: 'Success' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'refunded', label: 'Refunded' }]} placeholder="All statuses" /></div>

            {transactions.data.length === 0 ? <Empty title="No transactions found" /> : (
                <TableWrap>
                    <Thead><th className="th">Order</th><th className="th">Student</th><th className="th">Invoice</th><th className="th">Gateway</th><th className="th text-right">Amount</th><th className="th">Status</th><th className="th">Started</th></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {transactions.data.map((t) => (
                            <tr key={t.id}><td className="td font-mono text-xs">{t.order_id}</td><td className="td">{t.student}</td><td className="td">{t.invoice_no}</td><td className="td">{t.gateway}</td><td className="td text-right">{money(t.amount)}</td><td className="td"><Status value={t.status} /></td><td className="td">{fmtDateTime(t.initiated_at)}</td></tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
            <Pagination paginator={transactions} />
        </>
    );
}
