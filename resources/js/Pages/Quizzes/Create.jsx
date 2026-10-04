import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Check2, Field, FormError, PageHeader, SelectInput, TextArea, TextInput } from '../../Components/ui';

const blankQuestion = () => ({ question: '', options: ['', ''], correct_index: 0, marks: 1 });

export default function Create({ teach }) {
    const form = useForm({ subject_id: '', batch_id: '', title: '', description: '', time_limit_minutes: 20, is_published: false, questions: [blankQuestion()] });
    const e = form.errors;
    const batches = teach.batches.filter((b) => {
        const subject = teach.subjects.find((s) => String(s.id) === String(form.data.subject_id));
        return subject && b.course_id === subject.course_id && (!teach.pairs || teach.pairs.some(([bid, sid]) => bid === b.id && sid === subject.id));
    });

    const setQ = (i, patch) => form.setData('questions', form.data.questions.map((q, k) => (k === i ? { ...q, ...patch } : q)));
    const addQ = () => form.setData('questions', [...form.data.questions, blankQuestion()]);
    const removeQ = (i) => form.setData('questions', form.data.questions.filter((_, k) => k !== i));
    const setOpt = (qi, oi, value) => setQ(qi, { options: form.data.questions[qi].options.map((o, k) => (k === oi ? value : o)) });
    const addOpt = (qi) => setQ(qi, { options: [...form.data.questions[qi].options, ''] });
    const removeOpt = (qi, oi) => setQ(qi, { options: form.data.questions[qi].options.filter((_, k) => k !== oi), correct_index: form.data.questions[qi].correct_index === oi ? 0 : form.data.questions[qi].correct_index });

    return (
        <>
            <Head title="New quiz" />
            <PageHeader title="New quiz" />

            <form onSubmit={(ev) => { ev.preventDefault(); form.post('/portal/quizzes'); }} className="space-y-6">
                <FormError errors={e} />
                <Card className="space-y-4 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Subject" error={e.subject_id}><SelectInput value={form.data.subject_id} onChange={(ev) => form.setData({ ...form.data, subject_id: ev.target.value, batch_id: '' })} options={teach.subjects.map((s) => ({ value: s.id, label: s.name }))} /></Field>
                        <Field label="Batch" error={e.batch_id}><SelectInput value={form.data.batch_id} onChange={(ev) => form.setData('batch_id', ev.target.value)} options={batches.map((b) => ({ value: b.id, label: b.name }))} /></Field>
                        <Field label="Title" error={e.title}><TextInput value={form.data.title} onChange={(ev) => form.setData('title', ev.target.value)} /></Field>
                        <Field label="Time limit (minutes)" error={e.time_limit_minutes}><TextInput type="number" min="1" value={form.data.time_limit_minutes} onChange={(ev) => form.setData('time_limit_minutes', ev.target.value)} /></Field>
                    </div>
                    <Field label="Description (optional)" error={e.description}><TextArea rows={2} value={form.data.description} onChange={(ev) => form.setData('description', ev.target.value)} /></Field>
                    <Check2 label="Publish immediately" checked={form.data.is_published} onChange={(v) => form.setData('is_published', v)} help="Leave unchecked to prepare it first, and publish later." />
                </Card>

                {form.data.questions.map((q, qi) => (
                    <Card key={qi} className="space-y-3 p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold">Question {qi + 1}</h3>
                            {form.data.questions.length > 1 && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => removeQ(qi)}><Trash2 size={14} /> Remove</Button>}
                        </div>
                        <Field label="Question" error={e[`questions.${qi}.question`]}><TextArea rows={2} value={q.question} onChange={(ev) => setQ(qi, { question: ev.target.value })} /></Field>
                        <Field label="Marks" error={e[`questions.${qi}.marks`]}><TextInput type="number" min="0.5" step="0.5" className="max-w-28" value={q.marks} onChange={(ev) => setQ(qi, { marks: ev.target.value })} /></Field>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-navy-700">Options - select the correct one</p>
                            {q.options.map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                    <input type="radio" name={`correct-${qi}`} checked={q.correct_index === oi} onChange={() => setQ(qi, { correct_index: oi })} className="h-4 w-4" aria-label={`Option ${oi + 1} is correct`} />
                                    <TextInput value={opt} onChange={(ev) => setOpt(qi, oi, ev.target.value)} placeholder={`Option ${oi + 1}`} />
                                    {q.options.length > 2 && <Button variant="ghost" size="sm" onClick={() => removeOpt(qi, oi)} aria-label="Remove option"><Trash2 size={14} /></Button>}
                                </div>
                            ))}
                            {e[`questions.${qi}.correct_index`] && <p className="text-xs font-medium text-red-600">{e[`questions.${qi}.correct_index`]}</p>}
                            {q.options.length < 6 && <Button variant="outline" size="sm" onClick={() => addOpt(qi)}><Plus size={14} /> Add option</Button>}
                        </div>
                    </Card>
                ))}

                <Button variant="outline" onClick={addQ}><Plus size={16} /> Add another question</Button>
                <div className="flex gap-2">
                    <Button type="submit" variant="gold" size="lg" disabled={form.processing}>{form.processing ? 'Saving...' : 'Create quiz'}</Button>
                    <Button href="/portal/quizzes" variant="outline" size="lg">Cancel</Button>
                </div>
            </form>
        </>
    );
}
