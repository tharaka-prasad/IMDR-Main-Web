import { Head, router, useForm } from '@inertiajs/react';
import { Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, Empty, Field, FormError, Modal, PageHeader, TableWrap, TextArea, TextInput, Thead } from '../../Components/ui';
import { confirmThen, fmtDateTime } from '../../lib';

export default function Show({ assignment: a, mine, submissions }) {
    const isStudent = submissions === null;
    const submit = useForm({ answer_text: mine?.answer_text ?? '', file: null });
    const [marking, setMarking] = useState(null);
    const mark = useForm({ marks: '', feedback: '' });
    const locked = a.past_due || !!mine?.marked_at;

    return (
        <>
            <Head title={a.title} />
            <PageHeader title={a.title} subtitle={`${a.subject}, ${a.batch}. Deadline ${fmtDateTime(a.due_at)}. Total marks ${a.max_marks}.`}
                actions={<><Button href="/portal/assignments" variant="outline">Back</Button>{!isStudent && <Button variant="dangerOutline" onClick={() => confirmThen('Delete this assignment?', () => router.delete(`/portal/assignments/${a.id}`))}><Trash2 size={14} /> Delete</Button>}</>} />

            {a.description && <Card className="mb-6 whitespace-pre-line p-5 text-navy-700">{a.description}</Card>}

            {isStudent && (
                <>
                    {mine?.marked_at && (
                        <Alert tone="green" title={`Marked: ${mine.marks} / ${a.max_marks}`} className="mb-4">{mine.feedback || 'No written feedback.'}</Alert>
                    )}
                    {mine && !mine.marked_at && <Alert tone="blue" className="mb-4">Submitted on {fmtDateTime(mine.submitted_at)}. You can replace it until the deadline.</Alert>}
                    {a.past_due && !mine && <Alert tone="red" className="mb-4">The deadline has passed and nothing was submitted.</Alert>}

                    {!locked && (
                        <Card className="p-5">
                            <h2 className="mb-3 font-bold">{mine ? 'Replace your submission' : 'Your submission'}</h2>
                            <form onSubmit={(e) => { e.preventDefault(); submit.post(`/portal/assignments/${a.id}/submit`, { forceFormData: true, preserveScroll: true }); }} className="space-y-4">
                                <FormError errors={submit.errors} />
                                <Field label="Answer" error={submit.errors.answer_text}><TextArea rows={6} value={submit.data.answer_text} onChange={(e) => submit.setData('answer_text', e.target.value)} /></Field>
                                <Field label="Attach a file (optional)" error={submit.errors.file} help="Up to 50 MB."><input type="file" onChange={(e) => submit.setData('file', e.target.files[0] || null)} className="input" /></Field>
                                <Button type="submit" variant="gold" disabled={submit.processing}>{submit.processing ? 'Submitting...' : 'Submit work'}</Button>
                            </form>
                        </Card>
                    )}
                    {mine?.file_name && <p className="mt-3 text-sm text-navy-500">Your file: <a className="font-semibold text-brand hover:underline" href={`/portal/submissions/${mine.id}/download`}>{mine.file_name}</a></p>}
                </>
            )}

            {!isStudent && (
                submissions.length === 0 ? <Empty title="No submissions yet" /> : (
                    <TableWrap>
                        <Thead><th className="th">Student</th><th className="th">Submitted</th><th className="th">Work</th><th className="th">Marks</th><th className="th" /></Thead>
                        <tbody className="divide-y divide-navy-50">
                            {submissions.map((s) => (
                                <tr key={s.id}>
                                    <td className="td font-semibold">{s.student}<p className="text-xs font-normal text-navy-400">{s.student_no}</p></td>
                                    <td className="td">{fmtDateTime(s.submitted_at)}</td>
                                    <td className="td max-w-xs">{s.answer_text && <p className="line-clamp-3 whitespace-pre-line text-sm">{s.answer_text}</p>}{s.file_name && <Button native href={`/portal/submissions/${s.id}/download`} variant="subtle" size="sm" className="mt-1"><Download size={14} /> {s.file_name}</Button>}</td>
                                    <td className="td">{s.marked_at ? <Badge tone="green">{s.marks}/{a.max_marks}</Badge> : <Badge tone="amber">Not marked</Badge>}</td>
                                    <td className="td text-right"><Button size="sm" variant="subtle" onClick={() => { mark.setData({ marks: s.marks ?? '', feedback: s.feedback ?? '' }); mark.clearErrors(); setMarking(s); }}>{s.marked_at ? 'Change marks' : 'Mark'}</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </TableWrap>
                )
            )}

            <Modal open={!!marking} onClose={() => setMarking(null)} title={`Mark ${marking?.student ?? ''}`}
                footer={<><Button variant="outline" onClick={() => setMarking(null)}>Cancel</Button><Button variant="gold" disabled={mark.processing} onClick={() => mark.put(`/portal/submissions/${marking.id}/mark`, { preserveScroll: true, onSuccess: () => setMarking(null) })}>Save marks</Button></>}>
                <div className="space-y-4">
                    <Field label={`Marks (out of ${a.max_marks})`} error={mark.errors.marks}><TextInput type="number" min="0" max={a.max_marks} step="0.01" value={mark.data.marks} onChange={(e) => mark.setData('marks', e.target.value)} /></Field>
                    <Field label="Feedback" error={mark.errors.feedback}><TextArea rows={4} value={mark.data.feedback} onChange={(e) => mark.setData('feedback', e.target.value)} /></Field>
                </div>
            </Modal>
        </>
    );
}
