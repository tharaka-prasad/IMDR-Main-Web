import { Head, Link, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Empty, Field, FormError, Modal, PageHeader, SelectInput, Status, TableWrap, TextArea, TextInput, Thead } from '../../Components/ui';
import { fmtDateTime } from '../../lib';

export default function Index({ items, canManage, teach }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ subject_id: '', batch_id: '', title: '', description: '', due_at: '', max_marks: 100 });

    const batches = (teach?.batches || []).filter((b) => {
        const subject = teach.subjects.find((s) => String(s.id) === String(form.data.subject_id));
        return subject && b.course_id === subject.course_id && (!teach.pairs || teach.pairs.some(([bid, sid]) => bid === b.id && sid === subject.id));
    });

    const state = (a) => {
        if (!a.mine) return a.past_due ? <Badge tone="red">Missed</Badge> : <Badge tone="amber">To do</Badge>;
        if (a.mine.marked_at) return <Badge tone="green">Marked: {a.mine.marks}/{a.max_marks}</Badge>;
        return <Badge tone="blue">Submitted</Badge>;
    };

    return (
        <>
            <Head title="Assignments" />
            <PageHeader title="Assignments" actions={canManage && <Button variant="gold" onClick={() => { form.clearErrors(); setOpen(true); }}><Plus size={16} /> New assignment</Button>} />

            {items.length === 0 ? <Empty title="No assignments yet" /> : (
                <TableWrap>
                    <Thead><th className="th">Assignment</th><th className="th">Subject</th><th className="th">Batch</th><th className="th">Deadline</th><th className="th">{canManage ? 'Submissions' : 'My work'}</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {items.map((a) => (
                            <tr key={a.id} className="hover:bg-navy-50/50">
                                <td className="td font-semibold"><Link href={`/portal/assignments/${a.id}`} className="text-brand hover:underline">{a.title}</Link></td>
                                <td className="td">{a.subject}</td><td className="td">{a.batch}</td>
                                <td className="td">{fmtDateTime(a.due_at)} {a.past_due && <Status value="closed" text="Closed" />}</td>
                                <td className="td">{canManage ? a.submissions_count : state(a)}</td>
                                <td className="td text-right"><Button href={`/portal/assignments/${a.id}`} size="sm" variant="subtle">{canManage ? 'Open' : a.mine ? 'View' : 'Submit'}</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}

            {canManage && (
                <Modal open={open} onClose={() => setOpen(false)} title="New assignment"
                    footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="gold" disabled={form.processing} onClick={() => form.post('/portal/assignments', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })}>Create</Button></>}>
                    <FormError errors={form.errors} />
                    <div className="space-y-4">
                        <Field label="Subject" error={form.errors.subject_id}><SelectInput value={form.data.subject_id} onChange={(e) => form.setData({ ...form.data, subject_id: e.target.value, batch_id: '' })} options={teach.subjects.map((s) => ({ value: s.id, label: s.name }))} /></Field>
                        <Field label="Batch" error={form.errors.batch_id}><SelectInput value={form.data.batch_id} onChange={(e) => form.setData('batch_id', e.target.value)} options={batches.map((b) => ({ value: b.id, label: b.name }))} /></Field>
                        <Field label="Title" error={form.errors.title}><TextInput value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} /></Field>
                        <Field label="Instructions" error={form.errors.description}><TextArea rows={4} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Deadline" error={form.errors.due_at}><TextInput type="datetime-local" value={form.data.due_at} onChange={(e) => form.setData('due_at', e.target.value)} /></Field>
                            <Field label="Total marks" error={form.errors.max_marks}><TextInput type="number" min="1" value={form.data.max_marks} onChange={(e) => form.setData('max_marks', e.target.value)} /></Field>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}
