import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Alert, Button, Empty, Field, Modal, PageHeader, Pagination, SearchBox, Status, TableWrap, TextArea, Thead } from '../../Components/ui';
import { cx, fmtDateTime, money, useFilters } from '../../lib';

const tabs = [['pending', 'Waiting'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['all', 'All']];

export default function Index({ enrollments, filters, feeRequired }) {
    const [f, setF] = useFilters('/portal/registrations', filters);
    const [rejecting, setRejecting] = useState(null);
    const reject = useForm({ remarks: '' });

    const approve = (e, force = false) =>
        router.post(`/portal/registrations/${e.id}/approve`, { force }, { preserveScroll: true });

    return (
        <>
            <Head title="Registrations" />
            <PageHeader title="Registrations" subtitle={feeRequired ? 'The registration fee must be paid before approval. You can approve anyway for a cleared student.' : 'Approve or reject new registrations.'} />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex gap-1 rounded-lg bg-navy-50 p-1" role="tablist">
                    {tabs.map(([v, t]) => <button key={v} type="button" role="tab" aria-selected={f.status === v} onClick={() => setF({ status: v }, true)} className={cx('rounded-md px-3 py-1.5 text-sm font-medium', f.status === v ? 'bg-white text-navy shadow-sm' : 'text-navy-500 hover:text-navy')}>{t}</button>)}
                </div>
                <SearchBox className="w-full sm:w-72" value={f.search} onChange={(v) => setF({ search: v })} placeholder="Search by name or student ID" />
            </div>

            {enrollments.data.length === 0 ? <Empty title="No registrations here" /> : (
                <TableWrap>
                    <Thead><th className="th">Student</th><th className="th">Course and batch</th><th className="th">Applied</th><th className="th">Registration fee</th><th className="th text-right">Outstanding</th><th className="th">Status</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {enrollments.data.map((e) => (
                            <tr key={e.id} className="hover:bg-navy-50/50">
                                <td className="td"><Link className="font-semibold text-brand hover:underline" href={`/portal/students/${e.student_id}`}>{e.name}</Link><p className="text-xs text-navy-400">{e.student_no}, {e.phone}</p></td>
                                <td className="td">{e.course}<p className="text-xs text-navy-400">{e.batch}</p></td>
                                <td className="td">{fmtDateTime(e.created_at)}</td>
                                <td className="td">{e.registration_invoice ? <><Status value={e.registration_invoice.status} /><p className="text-xs text-navy-400">{money(e.registration_invoice.total)}</p></> : <span className="text-navy-400">No fee</span>}</td>
                                <td className="td text-right">{money(e.outstanding)}</td>
                                <td className="td"><Status value={e.status} />{e.remarks && <p className="mt-1 max-w-48 text-xs text-navy-400">{e.remarks}</p>}</td>
                                <td className="td whitespace-nowrap text-right">
                                    {e.status === 'pending' && (
                                        <>
                                            {(!feeRequired || !e.registration_invoice || e.registration_invoice.status === 'paid')
                                                ? <Button size="sm" variant="gold" onClick={() => approve(e)}>Approve</Button>
                                                : <Button size="sm" variant="outline" onClick={() => window.confirm('The registration fee is unpaid. Approve anyway?') && approve(e, true)}>Approve anyway</Button>}
                                            <Button size="sm" variant="dangerOutline" className="ml-1" onClick={() => { reject.reset(); setRejecting(e); }}>Reject</Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
            <Pagination paginator={enrollments} />

            <Modal open={!!rejecting} onClose={() => setRejecting(null)} title={`Reject ${rejecting?.name ?? ''}`}
                footer={<><Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button><Button variant="danger" disabled={reject.processing} onClick={() => reject.post(`/portal/registrations/${rejecting.id}/reject`, { preserveScroll: true, onSuccess: () => setRejecting(null) })}>Reject registration</Button></>}>
                <Alert tone="amber" className="mb-3">Unpaid invoices for this registration are cancelled. The student is told the reason.</Alert>
                <Field label="Reason (shown to the student)" error={reject.errors.remarks}><TextArea value={reject.data.remarks} onChange={(e) => reject.setData('remarks', e.target.value)} /></Field>
            </Modal>
        </>
    );
}
