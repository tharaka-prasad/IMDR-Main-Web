import { Head, Link } from '@inertiajs/react';
import { fmtDate, fmtDateTime } from '../../lib';

const back = { news: '/news', event: '/events', research: '/research', media: '/media', announcement: '/news' };

export default function Show({ post }) {
    return (
        <>
            <Head title={post.title} />
            <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
                <Link href={back[post.type] || '/'} className="text-sm font-semibold text-brand hover:underline">Back</Link>
                <p className="mt-6 text-sm font-semibold text-brand">
                    {post.type === 'event' && post.event_date ? `${fmtDateTime(post.event_date)}${post.location ? `, ${post.location}` : ''}` : fmtDate(post.published_at)}
                </p>
                <h1 className="display-wide mt-1 text-3xl text-navy sm:text-4xl">{post.title}</h1>
                {post.image_url && <img src={post.image_url} alt="" className="mt-6 w-full rounded-xl" />}
                {post.excerpt && <p className="mt-6 text-lg text-navy-600">{post.excerpt}</p>}
                {post.body && <div className="mt-4 whitespace-pre-line text-navy-700">{post.body}</div>}
            </article>
        </>
    );
}
