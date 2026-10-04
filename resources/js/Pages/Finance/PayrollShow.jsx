import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button, Modal, PageHeader, SelectInput, Status, TableWrap, Thead } from '../../Components/ui';
import { confirmThen, label, money } from '../../lib';

const months = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString('en', { month: 'long' }));

export default function PayrollShow({ period, items }) {
    const [paying, setPaying] = useState(null);
    const form = useForm({ payment_method: 'bank' });

    return (
        <>
            <Head title="Payroll" />
            <PageHeader title={`${months[period.month - 1]} ${period.year} payroll`}
                actions={<>
                    {period.status === 'draft' && <Button variant="gold" onClick={() => confirmThen('Approve this payroll? Salaries can then be paid.', () => router.post(`/portal/payroll/${period.id}/approve`))}>Approve</Button>}
                    {period.status === 'draft' && <Button variant="dangerOutline" onClick={() => confirmThen('Delete this draft payroll?', () => router.delete(`/portal/payroll/${period.id}`))}>Delete draft</Button>}
                    <Button href="/portal/payroll" variant="outline">Back</Button>
                </>} />

            <TableWrap>
                <Thead><th className="th">Person</th><th className="th">Role</th><th className="th">Pay type</th><th className="th text-right">Hours</th><th className="th text-right">Sessions</th><th className="th text-right">Basic</th><th className="th text-right">Net</th><th className="th">Status</th><th className="th" /></Thead>
                <tbody className="divide-y divide-navy-50">
                    {items.map((i) => (
                        <tr key={i.id}>
                            <td className="td font-semibold">{i.name}</td><td className="td">{label(i.role)}</td><td className="td capitalize">{i.pay_type}</td>
                            <td className="td text-right">{i.hours || '-'}</td><td className="td text-right">{i.sessions || '-'}</td>
                            <td className="td text-right">{money(i.basic)}</td><td className="td text-right font-bold">{money(i.net)}</td>
                            <td className="td"><Status value={i.status} /></td>
                            <td className="td text-right">{i.status !== 'paid' && period.status !== 'draft' && <Button size="sm" variant="gold" onClick={() => { form.clearErrors(); setPaying(i); }}>Pay</Button>}</td>
                        </tr>
                    ))}
                </tbody>
            </TableWrap>

            <Modal open={!!paying} onClose={() => setPaying(null)} title={`Pay ${paying?.name ?? ''}`}
                footer={<><Button variant="outline" onClick={() => setPaying(null)}>Cancel</Button><Button variant="gold" disabled={form.processing} onClick={() => form.post(`/portal/payroll/items/${paying.id}/pay`, { preserveScroll: true, onSuccess: () => setPaying(null) })}>Confirm paid</Button></>}>
                <p className="mb-3 text-sm text-navy-600">Net salary: <b>{paying && money(paying.net)}</b></p>
                <SelectInput value={form.data.payment_method} onChange={(e) => form.setData('payment_method', e.target.value)} placeholder={null} options={[{ value: 'bank', label: 'Bank transfer' }, { value: 'cash', label: 'Cash' }]} />
            </Modal>
        </>
    );
}
