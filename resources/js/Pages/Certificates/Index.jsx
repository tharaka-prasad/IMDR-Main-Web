import { Head, Link, router, useForm } from '@inertiajs/react';
import { Award } from 'lucide-react';
import { Alert, Button, Card, Empty, Field, PageHeader, SelectInput, Status, TableWrap, Thead } from '../../Components/ui';
import { confirmThen, fmtDate } from '../../lib';

export default function Index({ certificates, candidates, eligibility, selected }) {
    const form = useForm({ enrollment_id: selected || '', override: false });
    const allPass = eligibility?.checks.every((c) => c.pass);

    return (
        <>
            <Head title="Certificates" />
            <PageHeader title="Certificates" subtitle="Attendance, published results and fee clearance are checked automatically before a certificate can be issued." />

            <Card className="mb-8 p-5">
                <h2 className="mb-3 font-bold">Issue a certificate</h2>
                <Field label="Student and course" className="max-w-lg"><SelectInput value={form.data.enrollment_id} onChange={(e) => router.get('/portal/certificates', { enrollment_id: e.target.value }, { preserveState: true })} options={candidates} placeholder="Choose an approved registration" /></Field>

                {eligibility && (
                    <div className="mt-4">
                        <p className="font-semibold text-navy">{eligibility.student} ({eligibility.student_no}), {eligibility.course}, {eligibility.batch}</p>
                        <ul className="mt-2 space-y-1">
                            {eligibility.checks.map((c, i) => (
                                <li key={i} className={`flex items-center gap-2 text-sm ${c.pass ? 'text-emerald-700' : 'text-red-700'}`}>
                                    <span className="font-bold">{c.pass ? '✓' : '✗'}</span> {c.label}: {c.detail}
                                </li>
                            ))}
                        </ul>

                        {!allPass && <Alert tone="amber" className="mt-3">Not all requirements are met yet. A super admin can override and issue it anyway.</Alert>}

                        <div className="mt-4 flex items-center gap-3">
                            <Button variant="gold" disabled={!allPass} onClick={() => router.post('/portal/certificates', { enrollment_id: eligibility.enrollment_id })}>Issue certificate</Button>
                            {!allPass && <Button variant="dangerOutline" onClick={() => confirmThen('Issue this certificate even though requirements are not met?', () => router.post('/portal/certificates', { enrollment_id: eligibility.enrollment_id, override: true }))}>Issue anyway (super admin)</Button>}
                        </div>
                    </div>
                )}
            </Card>

            {certificates.data.length === 0 ? <Empty title="No certificates issued yet" /> : (
                <TableWrap>
                    <Thead><th className="th">Certificate</th><th className="th">Student</th><th className="th">Course</th><th className="th">Issued</th><th className="th">Status</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {certificates.data.map((c) => (
                            <tr key={c.id}>
                                <td className="td font-mono text-xs">{c.certificate_no}</td><td className="td">{c.student}<p className="text-xs text-navy-400">{c.student_no}</p></td><td className="td">{c.course}</td><td className="td">{fmtDate(c.issued_at)}</td><td className="td"><Status value={c.status} /></td>
                                <td className="td whitespace-nowrap text-right">
                                    <Button href={`/portal/certificates/${c.id}`} variant="subtle" size="sm"><Award size={14} /> Print</Button>
                                    {c.status === 'valid' && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => confirmThen('Revoke this certificate?', () => router.post(`/portal/certificates/${c.id}/revoke`, {}, { preserveScroll: true }))}>Revoke</Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
        </>
    );
}
