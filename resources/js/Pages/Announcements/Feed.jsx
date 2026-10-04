import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Badge, Button, Empty, Field, FormError, Modal, PageHeader, SelectInput, TextArea, TextInput } from '../../Components/ui';
import { fmtDateTime } from '../../lib';

export default function Feed({ items, canPost }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ title: '', body: '', audience: 'all', batch_id: '' });

    return (
        <>
            <Head title="Announcements" />
            <PageHeader title="Announcements" actions={canPost && <Button variant="gold" onClick={() => setOpen(true)}>New announcement</Button>} />

            {items.length === 0 ? <Empty title="No announcements yet" /> : (
                <ul className="space-y-3">
                    {items.map((a) => (
                        <li key={a.id} className="rounded-xl border border-navy-100 bg-white p-4">
                            <div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-navy">{a.title}</h2><Badge tone="blue">{a.audience}</Badge></div>
                            <p className="mt-1 whitespace-pre-line text-navy-600">{a.body}</p>
                            <p className="mt-2 text-xs text-navy-400">{a.author ? `${a.author}, ` : ''}{fmtDateTime(a.created_at)}</p>
                        </li>
                    ))}
                </ul>
            )}

            {canPost && (
                <Modal open={open} onClose={() => setOpen(false)} title="New announcement"
                    footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="gold" disabled={form.processing} onClick={() => form.post('/portal/manage/announcements', { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset(); } })}>Post</Button></>}>
                    <FormError errors={form.errors} />
                    <div className="space-y-4">
                        <Field label="Title" error={form.errors.title}><TextInput value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} /></Field>
                        <Field label="Message" error={form.errors.body}><TextArea rows={4} value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} /></Field>
                        <Field label="Audience" error={form.errors.audience}><SelectInput value={form.data.audience} onChange={(e) => form.setData('audience', e.target.value)} placeholder={null} options={[{ value: 'all', label: 'Everyone' }, { value: 'students', label: 'All students' }, { value: 'lecturers', label: 'All lecturers' }]} /></Field>
                    </div>
                </Modal>
            )}
        </>
    );
}
