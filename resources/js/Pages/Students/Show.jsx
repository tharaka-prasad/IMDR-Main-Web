import { Head, Link, router, useForm } from '@inertiajs/react';
import { Download, FileText, KeyRound, Pencil, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, Field, FormError, Modal, PageHeader, SelectInput, Stat, Status, TableWrap, TextArea, TextInput, Thead } from '../../Components/ui';
import { confirmThen, fmtDate, fmtDateTime, fmtSize, money } from '../../lib';

const Row = ({ k, v }) => (
    <div className="grid grid-cols-[130px_1fr] gap-2 py-1.5 text-sm"><dt className="text-navy-500">{k}</dt><dd className="font-medium text-navy">{v || '-'}</dd></div>
);

export default function Show({ student: s, documents, docTypes, enrollments, invoices, money: m, payments, attendance, results, access, whatsapp, batches }) {
    const [editing, setEditing] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const edit = useForm({
        name: s.name, username: s.username, email: s.email || '', phone: s.phone || '', user_status: s.user_status, whatsapp_number: s.whatsapp_number || '',
        nic: s.nic || '', date_of_birth: s.date_of_birth || '', gender: s.gender || '', address: s.address || '', school: s.school || '',
        guardian_name: s.guardian_name || '', guardian_phone: s.guardian_phone || '', notes: s.notes || '',
    });
    const upload = useForm({ type: 'birth_certificate', title: '', file: null });
    const override = useForm({ until: s.lms_access_override_until || '' });
    const enroll = useForm({ batch_id: '', approve_now: false });
    const set = (k) => (e) => edit.setData(k, e.target.value);

    return (
        <>
            <Head title={s.name} />
            <PageHeader
                title={s.name}
                subtitle={`Student ID ${s.student_no}. Registered ${fmtDate(s.registered_at)}.`}
                actions={
                    <>
                        <Button variant="outline" onClick={() => setEditing(true)}><Pencil size={14} /> Edit details</Button>
                        <Button variant="outline" onClick={() => confirmThen('Create a new password for this student? The old one stops working.', () => router.post(`/portal/students/${s.id}/reset-password`, {}, { preserveScroll: true }))}><KeyRound size={14} /> New password</Button>
                    </>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card className="p-5">
                        <div className="mb-2 flex items-center justify-between"><h2 className="font-bold">Details</h2><Status value={s.user_status} /></div>
                        <dl className="grid gap-x-8 sm:grid-cols-2">
                            <div>
                                <Row k="Username" v={s.username} /><Row k="Phone" v={s.phone} /><Row k="WhatsApp" v={s.whatsapp_number || `${s.phone || ''} (phone)`} /><Row k="Email" v={s.email} />
                                <Row k="NIC" v={s.nic} /><Row k="Date of birth" v={s.date_of_birth && fmtDate(s.date_of_birth)} />
                            </div>
                            <div>
                                <Row k="Gender" v={s.gender} /><Row k="School" v={s.school} /><Row k="Address" v={s.address} />
                                <Row k="Guardian" v={s.guardian_name} /><Row k="Guardian phone" v={s.guardian_phone} />
                            </div>
                        </dl>
                        {s.notes && <p className="mt-3 rounded-lg bg-navy-50 p-3 text-sm text-navy-600"><b>Office notes:</b> {s.notes}</p>}
                    </Card>

                    <Card className="p-5">
                        <h2 className="mb-3 font-bold">Documents</h2>
                        {documents.length === 0 ? <p className="mb-3 text-sm text-navy-500">No documents uploaded yet.</p> : (
                            <ul className="mb-4 divide-y divide-navy-50">
                                {documents.map((d) => (
                                    <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                                        <div className="flex items-center gap-3"><FileText size={18} className="text-brand" /><div><p className="text-sm font-semibold text-navy">{d.title || d.type_label}</p><p className="text-xs text-navy-400">{d.type_label}, {d.file_name} {fmtSize(d.size) && `(${fmtSize(d.size)})`}, uploaded {fmtDate(d.created_at)}</p></div></div>
                                        <div className="flex gap-1">
                                            <Button href={`/portal/documents/${d.id}/download`} native variant="subtle" size="sm"><Download size={14} /> Open</Button>
                                            <Button variant="ghost" size="sm" className="text-red-600" aria-label="Delete document" onClick={() => confirmThen('Delete this document?', () => router.delete(`/portal/documents/${d.id}`, { preserveScroll: true }))}><Trash2 size={14} /></Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <form onSubmit={(e) => { e.preventDefault(); upload.post(`/portal/students/${s.id}/documents`, { forceFormData: true, preserveScroll: true, onSuccess: () => upload.reset('file', 'title') }); }} className="grid gap-3 rounded-lg bg-navy-50 p-4 sm:grid-cols-[180px_1fr_1fr_auto] sm:items-end">
                            <Field label="Type" error={upload.errors.type}><SelectInput value={upload.data.type} onChange={(e) => upload.setData('type', e.target.value)} options={docTypes} placeholder={null} /></Field>
                            <Field label="Title (optional)" error={upload.errors.title}><TextInput value={upload.data.title} onChange={(e) => upload.setData('title', e.target.value)} /></Field>
                            <Field label="File" error={upload.errors.file}><input key={upload.data.file ? 'f' : 'n'} type="file" required onChange={(e) => upload.setData('file', e.target.files[0] || null)} className="input bg-white" /></Field>
                            <Button type="submit" variant="primary" disabled={upload.processing}><Upload size={14} /> Upload</Button>
                        </form>
                    </Card>

                    <Card className="p-5">
                        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Courses</h2><Button variant="subtle" size="sm" onClick={() => setEnrolling(true)}>Register on a batch</Button></div>
                        {enrollments.length === 0 ? <p className="text-sm text-navy-500">Not registered on any batch.</p> : (
                            <ul className="divide-y divide-navy-50">
                                {enrollments.map((e) => (
                                    <li key={e.id} className="flex items-center justify-between py-2.5">
                                        <div><p className="font-semibold text-navy">{e.course}</p><p className="text-sm text-navy-500">{e.batch}{e.remarks ? `, ${e.remarks}` : ''}</p></div>
                                        <div className="flex items-center gap-2"><Status value={e.status} />{e.status === 'pending' && <Button href="/portal/registrations" size="sm" variant="subtle">Review</Button>}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    <div>
                        <h2 className="mb-2 font-bold text-navy">Invoices</h2>
                        {invoices.length === 0 ? <p className="text-sm text-navy-500">No invoices.</p> : (
                            <TableWrap>
                                <Thead><th className="th">Invoice</th><th className="th">For</th><th className="th">Due</th><th className="th text-right">Total</th><th className="th text-right">Balance</th><th className="th">Status</th></Thead>
                                <tbody className="divide-y divide-navy-50">
                                    {invoices.map((i) => (
                                        <tr key={i.id}><td className="td">{i.invoice_no}</td><td className="td">{i.description}</td><td className="td">{fmtDate(i.due_date)}</td><td className="td text-right">{money(i.total)}</td><td className="td text-right font-semibold">{money(i.balance)}</td><td className="td"><Status value={i.status} /></td></tr>
                                    ))}
                                </tbody>
                            </TableWrap>
                        )}
                    </div>

                    <div>
                        <h2 className="mb-2 font-bold text-navy">Recent payments</h2>
                        {payments.length === 0 ? <p className="text-sm text-navy-500">No payments yet.</p> : (
                            <TableWrap>
                                <Thead><th className="th">Receipt</th><th className="th">Date</th><th className="th">Method</th><th className="th text-right">Amount</th></Thead>
                                <tbody className="divide-y divide-navy-50">
                                    {payments.map((p) => <tr key={p.id}><td className="td"><Link className="text-brand hover:underline" href={`/portal/receipts/${p.id}`}>{p.receipt_no}</Link></td><td className="td">{fmtDateTime(p.paid_at)}</td><td className="td"><Status value={p.method} /></td><td className="td text-right font-semibold">{money(p.amount)}</td></tr>)}
                                </tbody>
                            </TableWrap>
                        )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h2 className="mb-2 font-bold text-navy">Attendance {attendance.overall != null && `(${attendance.overall}%)`}</h2>
                            {attendance.subjects.length === 0 ? <p className="text-sm text-navy-500">No attendance marked yet.</p> : (
                                <ul className="divide-y divide-navy-50 rounded-xl border border-navy-100 bg-white">{attendance.subjects.map((a) => <li key={a.subject} className="flex justify-between px-4 py-2.5 text-sm"><span>{a.subject}</span><b>{a.percent}% <span className="font-normal text-navy-400">({a.attended}/{a.total})</span></b></li>)}</ul>
                            )}
                        </div>
                        <div>
                            <h2 className="mb-2 font-bold text-navy">Results</h2>
                            {results.length === 0 ? <p className="text-sm text-navy-500">No results yet.</p> : (
                                <ul className="divide-y divide-navy-50 rounded-xl border border-navy-100 bg-white">{results.map((r) => <li key={r.id} className="flex justify-between px-4 py-2.5 text-sm"><span>{r.subject}: {r.assessment} {!r.published && <Badge tone="amber">Hidden</Badge>}</span><b>{r.marks}/{r.max_marks} ({r.grade})</b></li>)}</ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="p-5">
                        <h2 className="mb-2 font-bold">Learning access</h2>
                        {access.allowed && !access.reason && <Alert tone="green">LMS is open.</Alert>}
                        {access.reason === 'payment_delay' && <Alert tone={access.allowed ? 'amber' : 'red'} title={access.allowed ? 'Payment delayed, kept open by override' : 'Payment delayed, LMS paused'}>{money(access.overdue_total)} overdue.{access.override_until && ` Open until ${fmtDate(access.override_until)}.`}</Alert>}
                        {access.reason === 'pending_approval' && <Alert tone="amber">Waiting for registration approval.</Alert>}
                        {access.reason === 'no_enrollment' && <Alert tone="amber">Not registered on a batch.</Alert>}
                        {access.overdue.length > 0 && <ul className="mt-3 space-y-1 text-sm">{access.overdue.map((i) => <li key={i.id}>{i.description}: <b>{money(i.balance)}</b>, {i.days_late} days late</li>)}</ul>}

                        <form onSubmit={(e) => { e.preventDefault(); override.post(`/portal/students/${s.id}/lms-override`, { preserveScroll: true }); }} className="mt-4 space-y-2 border-t border-navy-100 pt-4">
                            <Field label="Keep the LMS open until" error={override.errors.until} help="For a student who promised to pay. Leave empty and save to remove the override."><TextInput type="date" value={override.data.until} onChange={(e) => override.setData('until', e.target.value)} /></Field>
                            <Button type="submit" variant="outline" size="sm" disabled={override.processing}>Save</Button>
                        </form>
                    </Card>

                    <div className="grid gap-3">
                        <Stat label="Total fees" value={money(m.total)} accent="navy" />
                        <Stat label="Paid" value={money(m.paid)} accent="green" />
                        <Stat label="Still to pay" value={money(m.outstanding)} accent={m.outstanding ? 'gold' : 'green'} />
                    </div>

                    <Card className="p-5">
                        <h2 className="mb-2 font-bold">WhatsApp receipts</h2>
                        {whatsapp.length === 0 ? <p className="text-sm text-navy-500">No receipts sent yet.</p> : <ul className="space-y-1 text-sm">{whatsapp.map((w) => <li key={w.id} className="flex justify-between"><span>{fmtDateTime(w.created_at)}</span><Status value={w.status} /></li>)}</ul>}
                    </Card>
                </div>
            </div>

            <Modal open={editing} onClose={() => setEditing(false)} title="Edit student details" wide
                footer={<><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button><Button variant="gold" disabled={edit.processing} onClick={() => edit.put(`/portal/students/${s.id}`, { preserveScroll: true, onSuccess: () => setEditing(false) })}>Save</Button></>}>
                <FormError errors={edit.errors} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" error={edit.errors.name}><TextInput value={edit.data.name} onChange={set('name')} /></Field>
                    <Field label="Username" error={edit.errors.username}><TextInput value={edit.data.username} onChange={set('username')} /></Field>
                    <Field label="Phone" error={edit.errors.phone}><TextInput value={edit.data.phone} onChange={set('phone')} /></Field>
                    <Field label="WhatsApp number" error={edit.errors.whatsapp_number}><TextInput value={edit.data.whatsapp_number} onChange={set('whatsapp_number')} /></Field>
                    <Field label="Email" error={edit.errors.email}><TextInput type="email" value={edit.data.email} onChange={set('email')} /></Field>
                    <Field label="Account status" error={edit.errors.user_status}><SelectInput value={edit.data.user_status} onChange={set('user_status')} placeholder={null} options={[{ value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'suspended', label: 'Suspended (cannot log in)' }]} /></Field>
                    <Field label="NIC" error={edit.errors.nic}><TextInput value={edit.data.nic} onChange={set('nic')} /></Field>
                    <Field label="Date of birth" error={edit.errors.date_of_birth}><TextInput type="date" value={edit.data.date_of_birth} onChange={set('date_of_birth')} /></Field>
                    <Field label="Gender" error={edit.errors.gender}><SelectInput value={edit.data.gender} onChange={set('gender')} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} /></Field>
                    <Field label="School" error={edit.errors.school}><TextInput value={edit.data.school} onChange={set('school')} /></Field>
                    <Field label="Guardian" error={edit.errors.guardian_name}><TextInput value={edit.data.guardian_name} onChange={set('guardian_name')} /></Field>
                    <Field label="Guardian phone" error={edit.errors.guardian_phone}><TextInput value={edit.data.guardian_phone} onChange={set('guardian_phone')} /></Field>
                </div>
                <div className="mt-4 space-y-4">
                    <Field label="Address" error={edit.errors.address}><TextArea rows={2} value={edit.data.address} onChange={set('address')} /></Field>
                    <Field label="Office notes" error={edit.errors.notes}><TextArea rows={2} value={edit.data.notes} onChange={set('notes')} /></Field>
                </div>
            </Modal>

            <Modal open={enrolling} onClose={() => setEnrolling(false)} title="Register on a batch"
                footer={<><Button variant="outline" onClick={() => setEnrolling(false)}>Cancel</Button><Button variant="gold" disabled={enroll.processing || !enroll.data.batch_id} onClick={() => enroll.post(`/portal/students/${s.id}/enroll`, { preserveScroll: true, onSuccess: () => setEnrolling(false) })}>Register</Button></>}>
                <div className="space-y-4">
                    <Field label="Batch" error={enroll.errors.batch_id} help="The fee invoices are created automatically."><SelectInput value={enroll.data.batch_id} onChange={(e) => enroll.setData('batch_id', e.target.value)} options={batches.map((b) => ({ value: b.value, label: `${b.label} (${b.seats_left} seats left)` }))} /></Field>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enroll.data.approve_now} onChange={(e) => enroll.setData('approve_now', e.target.checked)} /> Approve now</label>
                </div>
            </Modal>
        </>
    );
}
