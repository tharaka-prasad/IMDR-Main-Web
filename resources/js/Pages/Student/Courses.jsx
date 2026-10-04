import { Head } from '@inertiajs/react';
import { Card, Empty, PageHeader, Status } from '../../Components/ui';
import { fmtDate } from '../../lib';

export default function Courses({ enrollments, documents }) {
    return (
        <>
            <Head title="My courses" />
            <PageHeader title="My courses" />

            {enrollments.length === 0 ? <Empty title="Not registered on a course yet" /> : (
                <div className="space-y-4">
                    {enrollments.map((e) => (
                        <Card key={e.id} className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <h2 className="text-lg font-bold text-navy">{e.course}</h2>
                                    <p className="text-sm text-navy-500">{e.batch}{e.duration ? `, ${e.duration}` : ''}{e.schedule ? `, ${e.schedule}` : ''}{e.starts ? `, starts ${fmtDate(e.starts)}` : ''}</p>
                                </div>
                                <Status value={e.status} />
                            </div>
                            {e.remarks && <p className="mt-1 text-sm text-navy-500">{e.remarks}</p>}
                            {e.subjects.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {e.subjects.map((s) => <span key={s.code} className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600">{s.name}</span>)}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            <h2 className="mb-2 mt-8 text-lg font-bold text-navy">My documents</h2>
            {documents.length === 0 ? <p className="text-sm text-navy-500">The office has not uploaded any documents for you yet.</p> : (
                <ul className="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">
                    {documents.map((d) => (
                        <li key={d.id} className="flex items-center justify-between px-4 py-3">
                            <div><p className="font-semibold text-navy">{d.title || d.type_label}</p><p className="text-xs text-navy-400">{d.type_label}, added {fmtDate(d.created_at)}</p></div>
                            <a href={`/portal/documents/${d.id}/download`} className="text-sm font-semibold text-brand hover:underline">Open</a>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
