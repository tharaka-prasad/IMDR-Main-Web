import { Head, Link } from '@inertiajs/react';
import { fmtDate } from '../../lib';

const titles = { news: 'News', event: 'Events', research: 'Research', media: 'Media' };
const blurbs = {
    news: 'What is happening at IMDR.',
    event: 'Workshops, open days and seminars.',
    research: 'Studies and reports from the IMDR Research Centre.',
    media: 'Student work and educational media from IMDR.',
};

export default function Index({ type, posts }) {
    return (
        <>
            <Head title={titles[type]} />
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
                <h1 className="display-wide text-4xl text-navy sm:text-5xl">{titles[type]}</h1>
                <p className="mt-3 text-navy-600">{blurbs[type]}</p>

                {posts.length === 0 ? (
                    <p className="mt-10 rounded-xl border border-dashed border-navy-200 p-8 text-center text-navy-500">Nothing has been published here yet. Please check back soon.</p>
                ) : (
                    <ul className="mt-8 divide-y divide-navy-100 border-y border-navy-100">
                        {posts.map((p) => (
                            <li key={p.id} className="py-5">
                                <p className="text-xs font-semibold text-brand">{type === 'event' ? fmtDate(p.event_date) : fmtDate(p.published_at)}{p.location ? `, ${p.location}` : ''}</p>
                                <Link href={`/posts/${p.slug}`} className="text-xl font-bold text-navy hover:text-brand">{p.title}</Link>
                                {p.excerpt && <p className="mt-1 text-navy-600">{p.excerpt}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
