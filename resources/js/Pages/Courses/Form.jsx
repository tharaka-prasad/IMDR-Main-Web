import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Card, Check2, Field, FormError, PageHeader, SelectInput, TextArea, TextInput } from '../../Components/ui';
import { money } from '../../lib';

export default function Form({ course, types }) {
    const fee = course?.fee_structure;
    const form = useForm({
        course_type_id: course?.course_type_id ?? '', code: course?.code ?? '', name: course?.name ?? '', duration: course?.duration ?? '',
        summary: course?.summary ?? '', description: course?.description ?? '', entry_requirements: course?.entry_requirements ?? '',
        learning_outcomes: course?.learning_outcomes ?? '', is_published: course ? !!course.is_published : true,
        registration_fee: fee?.registration_fee ?? 0, course_fee: fee?.course_fee ?? 0, installments: fee?.installments ?? [],
    });
    const e = form.errors;
    const set = (k) => (ev) => form.setData(k, ev.target.value);
    const sum = form.data.installments.reduce((t, i) => t + Number(i.amount || 0), 0);
    const balanced = form.data.installments.length === 0 || Math.abs(sum - Number(form.data.course_fee)) < 0.01;

    const setRow = (idx, patch) => form.setData('installments', form.data.installments.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    const addRow = () => form.setData('installments', [...form.data.installments, { label: `Installment ${form.data.installments.length + 1}`, amount: '', due_after_days: form.data.installments.length * 30 }]);
    const evenSplit = (n) => {
        const each = Math.floor((Number(form.data.course_fee) / n) * 100) / 100;
        form.setData('installments', Array.from({ length: n }, (_, i) => ({ label: `Installment ${i + 1}`, amount: i === n - 1 ? +(Number(form.data.course_fee) - each * (n - 1)).toFixed(2) : each, due_after_days: i * 30 })));
    };

    const submit = (ev) => {
        ev.preventDefault();
        course ? form.put(`/portal/courses/${course.id}`) : form.post('/portal/courses');
    };

    return (
        <>
            <Head title={course ? 'Edit course' : 'Add course'} />
            <PageHeader title={course ? `Edit ${course.name}` : 'Add a course'} />

            <form onSubmit={submit} className="space-y-6">
                <FormError errors={e} />

                <Card className="space-y-4 p-5">
                    <h2 className="font-bold">Course</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Course name" error={e.name}><TextInput value={form.data.name} onChange={set('name')} required /></Field>
                        <Field label="Code" error={e.code}><TextInput value={form.data.code} onChange={set('code')} required /></Field>
                        <Field label="Type" error={e.course_type_id}><SelectInput value={form.data.course_type_id} onChange={set('course_type_id')} options={types.map((t) => ({ value: t.id, label: t.name }))} required /></Field>
                        <Field label="Duration" error={e.duration}><TextInput value={form.data.duration} onChange={set('duration')} placeholder="12 months" /></Field>
                    </div>
                    <Field label="One-line summary (shown in course lists)" error={e.summary}><TextInput value={form.data.summary} onChange={set('summary')} /></Field>
                    <Field label="Description" error={e.description}><TextArea rows={4} value={form.data.description} onChange={set('description')} /></Field>
                    <Field label="Entry requirements" error={e.entry_requirements}><TextArea rows={2} value={form.data.entry_requirements} onChange={set('entry_requirements')} /></Field>
                    <Field label="Learning outcomes" error={e.learning_outcomes} help="One outcome per line."><TextArea rows={4} value={form.data.learning_outcomes} onChange={set('learning_outcomes')} /></Field>
                    <Check2 label="Show on the public website" checked={form.data.is_published} onChange={(v) => form.setData('is_published', v)} />
                </Card>

                <Card className="space-y-4 p-5">
                    <h2 className="font-bold">Fees</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Registration fee (Rs.)" error={e.registration_fee} help="Charged first, separately from the course fee."><TextInput type="number" min="0" step="0.01" value={form.data.registration_fee} onChange={set('registration_fee')} required /></Field>
                        <Field label="Course fee (Rs.)" error={e.course_fee} help="Split into the installments below."><TextInput type="number" min="0" step="0.01" value={form.data.course_fee} onChange={set('course_fee')} required /></Field>
                    </div>

                    <div>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-semibold">Installment plan</h3>
                            <div className="flex flex-wrap gap-2">
                                {[2, 3, 4, 6].map((n) => <Button key={n} variant="subtle" size="sm" onClick={() => evenSplit(n)}>Split in {n}</Button>)}
                                <Button variant="outline" size="sm" onClick={addRow}><Plus size={14} /> Add row</Button>
                            </div>
                        </div>
                        {form.data.installments.length === 0 ? <p className="text-sm text-navy-500">No plan: students get one invoice for the whole course fee, due when the batch starts.</p> : (
                            <div className="space-y-2">
                                {form.data.installments.map((row, i) => (
                                    <div key={i} className="grid gap-2 sm:grid-cols-[1fr_160px_160px_auto] sm:items-end">
                                        <Field label={i === 0 ? 'Label' : null} error={e[`installments.${i}.label`]}><TextInput value={row.label} onChange={(ev) => setRow(i, { label: ev.target.value })} /></Field>
                                        <Field label={i === 0 ? 'Amount (Rs.)' : null} error={e[`installments.${i}.amount`]}><TextInput type="number" min="1" step="0.01" value={row.amount} onChange={(ev) => setRow(i, { amount: ev.target.value })} /></Field>
                                        <Field label={i === 0 ? 'Due after batch start (days)' : null} error={e[`installments.${i}.due_after_days`]}><TextInput type="number" min="0" value={row.due_after_days} onChange={(ev) => setRow(i, { due_after_days: ev.target.value })} /></Field>
                                        <Button variant="ghost" className="text-red-600" aria-label="Remove row" onClick={() => form.setData('installments', form.data.installments.filter((_, k) => k !== i))}><Trash2 size={14} /></Button>
                                    </div>
                                ))}
                                <Alert tone={balanced ? 'green' : 'red'}>Installments add up to {money(sum)}. Course fee is {money(form.data.course_fee)}. {balanced ? 'They match.' : 'They must match before you can save.'}</Alert>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="flex gap-2">
                    <Button type="submit" variant="gold" size="lg" disabled={form.processing || !balanced}>{form.processing ? 'Saving...' : 'Save course'}</Button>
                    <Button href="/portal/courses" variant="outline" size="lg">Cancel</Button>
                </div>
            </form>
        </>
    );
}
