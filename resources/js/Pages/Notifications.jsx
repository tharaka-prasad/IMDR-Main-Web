import { Head, Link, router } from '@inertiajs/react';
import { Button, Empty, PageHeader } from '../Components/ui';
import { cx, fmtDateTime } from '../lib';

export default function Notifications({ items }) {
    const unread = items.filter((n) => !n.read_at).length;

    return (
        <>
            <Head title="Notifications" />
            <PageHeader title="Notifications" actions={unread > 0 && <Button variant="outline" onClick={() => router.post('/portal/notifications/read-all')}>Mark all as read</Button>} />
            {items.length === 0 ? <Empty title="You have no notifications" /> : (
                <ul className="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">
                    {items.map((n) => (
                        <li key={n.id} className={cx('flex items-start justify-between gap-3 px-4 py-3', !n.read_at && 'bg-brand-50/50')}>
                            <div>
                                <p className={cx('text-navy', !n.read_at && 'font-bold')}>{n.title}</p>
                                {n.body && <p className="text-sm text-navy-600">{n.body}</p>}
                                <p className="mt-0.5 text-xs text-navy-400">{fmtDateTime(n.created_at)}</p>
                            </div>
                            {n.link ? (
                                <Button variant="subtle" size="sm" onClick={() => router.post(`/portal/notifications/${n.id}/read`)}>Open</Button>
                            ) : !n.read_at && (
                                <Button variant="ghost" size="sm" onClick={() => router.post(`/portal/notifications/${n.id}/read`)}>Mark read</Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
