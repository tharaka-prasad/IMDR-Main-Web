import { Head, useForm } from '@inertiajs/react';
import { ImagePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Check2, Field, FormError, PageHeader, TextArea, TextInput } from '../../../Components/ui';

const MAX_MB = 4;

/** Add or edit one news item: text, picture upload, start and end date, and the home page ad switch. */
export default function Form({ post }) {
    const editing = !!post;
    const form = useForm({
        ...(editing ? { _method: 'put' } : {}),
        title: post?.title ?? '',
        excerpt: post?.excerpt ?? '',
        body: post?.body ?? '',
        image: null,
        remove_image: false,
        starts_at: post?.starts_at ?? '',
        ends_at: post?.ends_at ?? '',
        show_as_ad: post?.show_as_ad ?? false,
        is_published: post?.is_published ?? true,
    });
    const e = form.errors;
    const [preview, setPreview] = useState(null);
    const [pictureProblem, setPictureProblem] = useState('');

    // Preview of the chosen file; the temporary address is released when it changes.
    useEffect(() => {
        if (!form.data.image) {
            setPreview(null);
            return undefined;
        }

        const url = URL.createObjectURL(form.data.image);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.image]);

    const choose = (ev) => {
        const file = ev.target.files?.[0] ?? null;
        setPictureProblem('');

        if (file && file.size > MAX_MB * 1024 * 1024) {
            setPictureProblem(`That picture is larger than ${MAX_MB} MB. Please choose a smaller one.`);
            ev.target.value = '';
            return;
        }

        form.setData((d) => ({ ...d, image: file, remove_image: false }));
    };

    const submit = (ev) => {
        ev.preventDefault();
        form.post(editing ? `/portal/news/${post.id}` : '/portal/news', { forceFormData: true, preserveScroll: true });
    };

    const current = preview || (!form.data.remove_image ? post?.image : null);

    return (
        <>
            <Head title={editing ? 'Edit news' : 'Add news'} />
            <PageHeader title={editing ? 'Edit news' : 'Add news'} actions={<Button href="/portal/news" variant="outline">Back to news</Button>} />

            <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-3">
                <Card className="space-y-4 p-5 lg:col-span-2">
                    <FormError errors={e} />

                    <Field label="Title" error={e.title}>
                        <TextInput value={form.data.title} onChange={(ev) => form.setData('title', ev.target.value)} maxLength={200} required />
                    </Field>

                    <Field label="Short summary" error={e.excerpt} help="One or two sentences. Shown in the news list and in the pop-up ad.">
                        <TextArea rows={3} value={form.data.excerpt} onChange={(ev) => form.setData('excerpt', ev.target.value)} maxLength={500} />
                    </Field>

                    <Field label="Full text" error={e.body}>
                        <TextArea rows={9} value={form.data.body} onChange={(ev) => form.setData('body', ev.target.value)} />
                    </Field>
                </Card>

                <div className="space-y-6">
                    <Card className="p-5">
                        <p className="mb-2 text-sm font-medium text-navy-700">Picture</p>

                        {current ? (
                            <img src={current} alt="Chosen picture" className="mb-3 max-h-56 w-full rounded-lg border border-navy-100 object-cover" />
                        ) : (
                            <div className="mb-3 flex h-32 items-center justify-center rounded-lg border border-dashed border-navy-200 text-navy-300"><ImagePlus size={28} aria-hidden="true" /></div>
                        )}

                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} aria-label="Choose a picture" className="block w-full text-sm text-navy-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100" />
                        <p className="mt-1 text-xs text-navy-400">JPG, PNG or WebP, up to {MAX_MB} MB. A wide picture (for example 1200 x 675) looks best.</p>
                        {pictureProblem && <p className="mt-1 text-xs font-medium text-red-600">{pictureProblem}</p>}
                        {e.image && <p className="mt-1 text-xs font-medium text-red-600">{e.image}</p>}

                        {editing && post.image && !form.data.image && (
                            <div className="mt-3">
                                <Check2 label="Remove the current picture" checked={form.data.remove_image} onChange={(v) => form.setData('remove_image', v)} />
                            </div>
                        )}

                        {form.progress && <progress value={form.progress.percentage} max="100" className="mt-3 w-full" aria-label="Upload progress">{form.progress.percentage}%</progress>}
                    </Card>

                    <Card className="space-y-4 p-5">
                        <Field label="Start date and time" error={e.starts_at} help="The news appears on the website from this moment.">
                            <TextInput type="datetime-local" value={form.data.starts_at} onChange={(ev) => form.setData('starts_at', ev.target.value)} required />
                        </Field>
                        <Field label="End date and time" error={e.ends_at} help="After this moment the news (and its ad) disappears by itself.">
                            <TextInput type="datetime-local" value={form.data.ends_at} onChange={(ev) => form.setData('ends_at', ev.target.value)} required />
                        </Field>

                        <Check2 label="Show as an ad on the home page" help="Opens as a pop-up every time someone visits the home page. They can close it." checked={form.data.show_as_ad} onChange={(v) => form.setData('show_as_ad', v)} />
                        <Check2 label="Published" help="Untick to hide it without deleting." checked={form.data.is_published} onChange={(v) => form.setData('is_published', v)} />
                    </Card>

                    {form.data.show_as_ad && <Alert tone="amber">If several ads are live at the same time, the one that started most recently is shown.</Alert>}

                    <Button type="submit" variant="gold" className="w-full" disabled={form.processing}>{form.processing ? 'Saving...' : editing ? 'Save news' : 'Publish news'}</Button>
                </div>
            </form>
        </>
    );
}