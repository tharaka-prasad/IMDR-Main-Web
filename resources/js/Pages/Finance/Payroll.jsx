import { Head, router, useForm } from '@inertiajs/react';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Empty, Field, FormError, Modal, PageHeader, SelectInput, TableWrap, Thead } from '../../Components/ui';
import { label, money } from '../../lib';

const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2000, i, 1).toLocaleString('en', { month: 'long' }) }));

export default function Payroll({ periods, missingRules }) {
    const [open, setOpen] = useState(false);
    const now = new Date();
    const form = useForm({ year: now.getFullYear(), month: now.getMonth() + 1 });

    return (
        <>
            <Head title="Payroll" />
            <PageHeader title="Payroll" subtitle="Hourly and per-session pay come from held classes on the timetable." actions={<Button variant="gold" onClick={() => setOpen(true)}><Play size={16} /> Calculate a month</Button>} />

            {missingRules > 0 && <Alert tone="amber" className="mb-4">{missingRules} staff member(s) have no salary rule set. Add one from Salary rules so they are included.</Alert>}

            {periods.length === 0 ? <Empty title="No payroll calculated yet" /> : (
                <TableWrap>
                    <Thead><th className="th">Period</th><th className="th">Status</th><th className="th">Staff</th><th className="th text-right">Total net</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {periods.map((p) => (
                            <tr key={p.id}>
                                <td className="td font-semibold">{label(months[p.month - 1]?.label)} {p.year}</td>
                                <td className="td capitalize">{p.status}</td><td className="td">{p.items_count}</td><td className="td text-right font-semibold">{money(p.total_net)}</td>
                                <td className="td text-right"><Button href={`/portal/payroll/${p.id}`} variant="subtle" size="sm">Open</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}

            <Modal open={open} onClose={() => setOpen(false)} title="Calculate payroll"
                footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="gold" disabled={form.processing} onClick={() => form.post('/portal/payroll/generate', { preserveScroll: true, onSuccess: () => setOpen(false) })}>Calculate</Button></>}>
                <FormError errors={form.errors} />
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Month" error={form.errors.month}><SelectInput value={form.data.month} onChange={(e) => form.setData('month', e.target.value)} placeholder={null} options={months} /></Field>
                    <Field label="Year" error={form.errors.year}><input className="input" type="number" value={form.data.year} onChange={(e) => form.setData('year', e.target.value)} /></Field>
                </div>
            </Modal>
        </>
    );
}
