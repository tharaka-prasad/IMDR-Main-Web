import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Empty, Field, FormError, Modal, PageHeader, SelectInput, Status, TextInput } from '../../Components/ui';
import { confirmThen, fmtDate, useFilters } from '../../lib';

export default function Index({ entries, filters, canManage, canMark, form: opts, batchFilter }) {
    const [f, setF] = useFilters('/portal/timetable', filters);
    const [open, setOpen] = useState(false);
    const form = useForm({ batch_id: '', subject_id: '', lecturer_id: '', classroom_id: '', date: '', start_time: '09:00', end_time: '12:00', topic: '' });

    const batch = opts?.batches.find((b) => String(b.id) === String(form.data.batch_id));
    const subjects = (opts?.subjects || []).filter((s) => !batch || s.course_id === batch.course_id);

    const grouped = entries.reduce((acc, e) => ((acc[e.date] ||= []).push(e), acc), {});

    return (
        <>
            <Head title="Timetable" />
            <PageHeader title="Timetable" subtitle="Classes for the next few weeks." actions={canManage && <Button variant="gold" onClick={() => { form.clearErrors(); setOpen(true); }}><Plus size={16} /> Add a class</Button>} />

            <div className="mb-5 grid max-w-3xl gap-3 sm:grid-cols-3">
                <Field label="From"><TextInput type="date" value={f.from} onChange={(e) => setF({ from: e.target.value }, true)} /></Field>
                <Field label="To"><TextInput type="date" value={f.to} onChange={(e) => setF({ to: e.target.value }, true)} /></Field>
                {canManage && <Field label="Batch"><SelectInput value={f.batch_id} onChange={(e) => setF({ batch_id: e.target.value }, true)} options={batchFilter.map((b) => ({ value: b.id, label: b.name }))} placeholder="All batches" /></Field>}
            </div>

            {entries.length === 0 ? <Empty title="No classes in this period">{canManage ? 'Use "Add a class" to schedule one.' : 'Your timetable will appear here once classes are scheduled.'}</Empty> : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, list]) => (
                        <section key={date}>
                            <h2 className="mb-2 text-sm font-bold text-brand">{new Date(date + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
                            <ul className="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">
                                {list.map((e) => (
                                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                        <div className="grid min-w-0 grid-cols-[110px_1fr] gap-3">
                                            <p className="font-mono text-sm text-navy-600">{e.start_time} to {e.end_time}</p>
                                            <div>
                                                <p className="font-semibold text-navy">{e.subject}{e.topic ? `: ${e.topic}` : ''}</p>
                                                <p className="text-sm text-navy-500">{e.batch}, {e.lecturer}{e.classroom ? `, ${e.classroom}` : ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Status value={e.status} />
                                            {canMark && e.status !== 'cancelled' && <Button href={`/portal/attendance/${e.id}`} variant="subtle" size="sm">Attendance</Button>}
                                            {canManage && (
                                                <>
                                                    <select aria-label="Change status" value={e.status} onChange={(ev) => router.post(`/portal/timetable/${e.id}/status`, { status: ev.target.value }, { preserveScroll: true })} className="input w-auto py-1 text-xs">
                                                        <option value="scheduled">Scheduled</option><option value="held">Held</option><option value="cancelled">Cancelled</option>
                                                    </select>
                                                    <Button variant="ghost" size="sm" className="text-red-600" aria-label="Delete class" onClick={() => confirmThen('Delete this class?', () => router.delete(`/portal/timetable/${e.id}`, { preserveScroll: true }))}><Trash2 size={14} /></Button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}

            {canManage && (
                <Modal open={open} onClose={() => setOpen(false)} title="Add a class"
                    footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="gold" disabled={form.processing} onClick={() => form.post('/portal/timetable', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })}>Add class</Button></>}>
                    <FormError errors={form.errors} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Batch" error={form.errors.batch_id}><SelectInput value={form.data.batch_id} onChange={(e) => form.setData({ ...form.data, batch_id: e.target.value, subject_id: '' })} options={opts.batches.map((b) => ({ value: b.id, label: b.name }))} /></Field>
                        <Field label="Subject" error={form.errors.subject_id}><SelectInput value={form.data.subject_id} onChange={(e) => form.setData('subject_id', e.target.value)} options={subjects.map((s) => ({ value: s.id, label: s.name }))} /></Field>
                        <Field label="Lecturer" error={form.errors.lecturer_id}><SelectInput value={form.data.lecturer_id} onChange={(e) => form.setData('lecturer_id', e.target.value)} options={opts.lecturers.map((l) => ({ value: l.id, label: l.name }))} /></Field>
                        <Field label="Classroom" error={form.errors.classroom_id}><SelectInput value={form.data.classroom_id} onChange={(e) => form.setData('classroom_id', e.target.value)} options={opts.classrooms.map((c) => ({ value: c.id, label: c.name }))} /></Field>
                        <Field label="Date" error={form.errors.date}><TextInput type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} /></Field>
                        <Field label="Topic" error={form.errors.topic}><TextInput value={form.data.topic} onChange={(e) => form.setData('topic', e.target.value)} /></Field>
                        <Field label="Starts" error={form.errors.start_time}><TextInput type="time" value={form.data.start_time} onChange={(e) => form.setData('start_time', e.target.value)} /></Field>
                        <Field label="Ends" error={form.errors.end_time}><TextInput type="time" value={form.data.end_time} onChange={(e) => form.setData('end_time', e.target.value)} /></Field>
                    </div>
                    <p className="mt-3 text-xs text-navy-400">The system stops double-booking of the lecturer, the room and the batch. Students of the batch are notified.</p>
                </Modal>
            )}
        </>
    );
}
