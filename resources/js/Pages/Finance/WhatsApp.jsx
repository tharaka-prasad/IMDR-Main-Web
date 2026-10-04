import { Head, router } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
import { Alert, Button, Empty, PageHeader, Pagination, SelectInput, Status, TableWrap, Thead } from '../../Components/ui';
import { fmtDateTime, useFilters } from '../../lib';

export default function WhatsApp({ messages, filters, driver }) {
    const [f, setF] = useFilters('/portal/whatsapp', filters);

    return (
        <>
            <Head title="WhatsApp receipts" />
            <PageHeader title="WhatsApp receipts" subtitle="Every receipt the system tried to send after a payment." />

            {driver === 'log' && <Alert tone="amber" className="mb-4">The WhatsApp driver is set to "log": nothing is sent automatically. Use the click-to-chat link to send a receipt from your own phone, or set WHATSAPP_DRIVER in the .env file to send automatically.</Alert>}

            <div className="mb-4 max-w-xs"><SelectInput value={f.status} onChange={(e) => setF({ status: e.target.value }, true)} options={[{ value: 'sent', label: 'Sent' }, { value: 'simulated', label: 'Simulated (log driver)' }, { value: 'failed', label: 'Failed' }]} placeholder="All statuses" /></div>

            {messages.data.length === 0 ? <Empty title="No messages yet" /> : (
                <TableWrap>
                    <Thead><th className="th">Student</th><th className="th">Phone</th><th className="th">Receipt</th><th className="th">Status</th><th className="th">Sent</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {messages.data.map((m) => (
                            <tr key={m.id}>
                                <td className="td">{m.student}</td><td className="td font-mono text-xs">{m.phone || '-'}</td><td className="td">{m.receipt_no || '-'}</td>
                                <td className="td"><Status value={m.status} />{m.error && <p className="mt-0.5 max-w-56 text-xs text-red-600">{m.error}</p>}</td>
                                <td className="td">{fmtDateTime(m.created_at)}</td>
                                <td className="td text-right">
                                    {m.manual_link && <Button native href={m.manual_link} target="_blank" rel="noreferrer" variant="subtle" size="sm"><MessageCircle size={14} /> Open in WhatsApp</Button>}
                                    {m.status === 'failed' && <Button size="sm" variant="ghost" onClick={() => router.post(`/portal/whatsapp/${m.id}/resend`, {}, { preserveScroll: true })}>Retry</Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
            <Pagination paginator={messages} />
        </>
    );
}
