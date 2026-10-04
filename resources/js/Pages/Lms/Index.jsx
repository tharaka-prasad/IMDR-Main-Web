import { Head, router, useForm } from '@inertiajs/react';
import { Download, ExternalLink, Film, FileText, Image, Link2, Plus, Presentation, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Check2, Empty, Field, FormError, Modal, PageHeader, SelectInput, TextArea, TextInput } from '../../Components/ui';
import { confirmThen, fmtDate } from '../../lib';

const icons = { note: FileText, pdf: FileText, slides: Presentation, video: Film, image: Image, link: Link2 };
const types = [['note', 'Note'], ['pdf', 'PDF'], ['slides', 'Slides'], ['video', 'Video'], ['image', 'Image'], ['link', 'Link']].map(([value, label]) => ({ value, label }));

export default function Index({ items, subjects, filters, canManage, teach }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ subject_id: '', batch_id: '', title: '', type: 'note', description: '', external_url: '', is_published: true, file: null });

    const batches = (teach?.batches || []).filter((b) => {
        const subject = teach.subjects.find((s) => String(s.id) === String(form.data.subject_id));
        if (!subject || b.course_id !== subject.course_id) return false;
        return !teach.pairs || teach.pairs.some(([bid, sid]) => bid === b.id && sid === subject.id);
    });

    const grouped = items.reduce((acc, c) => ((acc[c.subject] ||= []).push(c), acc), {});

    return (
        <>
            <Head title="Learning material" />
            <PageHeader title="Learning material" subtitle={canManage ? 'Notes, PDFs, slides and videos for your subjects. Files are private: only enrolled students can open them.' : 'Notes, slides and videos from your lecturers.'}
                actions={canManage && <Button variant="gold" onClick={() => { form.clearErrors(); setOpen(true); }}><Plus size={16} /> Add material</Button>} />

            {subjects.length > 1 && (
                <div className="mb-5 max-w-xs"><SelectInput value={filters.subject_id} onChange={(e) => router.get('/portal/lms', e.target.value ? { subject_id: e.target.value } : {}, { preserveState: true })} options={subjects.map((s) => ({ value: s.id, label: s.name }))} placeholder="All subjects" /></div>
            )}

            {items.length === 0 ? <Empty title="Nothing here yet">{canManage ? 'Use "Add material" to upload the first item.' : 'Your lecturers will add material soon.'}</Empty> : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([subject, list]) => (
                        <section key={subject}>
                            <h2 className="mb-2 text-lg font-bold text-navy">{subject}</h2>
                            <ul className="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">
                                {list.map((c) => {
                                    const Icon = icons[c.type] || FileText;
                                    return (
                                        <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <Icon size={20} className="mt-0.5 shrink-0 text-brand" />
                                                <div>
                                                    <p className="font-semibold text-navy">{c.title} {!c.is_published && <Badge tone="amber">Hidden</Badge>}</p>
                                                    {c.description && <p className="text-sm text-navy-600">{c.description}</p>}
                                                    <p className="text-xs text-navy-400">{c.batch ? `${c.batch}, ` : 'All batches, '}added {fmtDate(c.created_at)}{c.author ? ` by ${c.author}` : ''}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {c.has_file && <Button native href={`/portal/lms/${c.id}/download`} variant="subtle" size="sm"><Download size={14} /> {c.file_name ? 'Download' : 'Open'}</Button>}
                                                {c.external_url && <Button native href={c.external_url} target="_blank" rel="noreferrer" variant="subtle" size="sm"><ExternalLink size={14} /> Open link</Button>}
                                                {canManage && (
                                                    <>
                                                        <Button variant="ghost" size="sm" onClick={() => router.put(`/portal/lms/${c.id}`, { title: c.title, description: c.description ?? '', external_url: c.external_url ?? '', is_published: !c.is_published }, { preserveScroll: true })}>{c.is_published ? 'Hide' : 'Publish'}</Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600" aria-label="Delete" onClick={() => confirmThen('Delete this material and its file?', () => router.delete(`/portal/lms/${c.id}`, { preserveScroll: true }))}><Trash2 size={14} /></Button>
                                                    </>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            )}

            {canManage && (
                <Modal open={open} onClose={() => setOpen(false)} title="Add learning material" wide
                    footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="gold" disabled={form.processing} onClick={() => form.post('/portal/lms', { forceFormData: true, preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })}>{form.processing ? 'Uploading...' : 'Add'}</Button></>}>
                    <FormError errors={form.errors} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Subject" error={form.errors.subject_id}><SelectInput value={form.data.subject_id} onChange={(e) => form.setData({ ...form.data, subject_id: e.target.value, batch_id: '' })} options={teach.subjects.map((s) => ({ value: s.id, label: s.name }))} /></Field>
                        <Field label="Batch" error={form.errors.batch_id} help="Empty = every batch of the course."><SelectInput value={form.data.batch_id} onChange={(e) => form.setData('batch_id', e.target.value)} options={batches.map((b) => ({ value: b.id, label: b.name }))} placeholder="All batches" /></Field>
                        <Field label="Title" error={form.errors.title}><TextInput value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} /></Field>
                        <Field label="Type" error={form.errors.type}><SelectInput value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={types} placeholder={null} /></Field>
                    </div>
                    <div className="mt-4 space-y-4">
                        <Field label="Description" error={form.errors.description}><TextArea rows={2} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} /></Field>
                        <Field label="File" error={form.errors.file} help="Up to 200 MB. For very large videos paste a YouTube or Vimeo link below instead."><input type="file" onChange={(e) => form.setData('file', e.target.files[0] || null)} className="input" /></Field>
                        <Field label="Or a link" error={form.errors.external_url}><TextInput type="url" placeholder="https://" value={form.data.external_url} onChange={(e) => form.setData('external_url', e.target.value)} /></Field>
                        <Check2 label="Visible to students now" checked={form.data.is_published} onChange={(v) => form.setData('is_published', v)} />
                    </div>
                </Modal>
            )}
        </>
    );
}
