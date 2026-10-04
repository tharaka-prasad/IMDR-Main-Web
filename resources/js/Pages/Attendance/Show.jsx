import { Head, useForm } from '@inertiajs/react';
import { Button, Empty, PageHeader } from '../../Components/ui';
import { cx, fmtDate } from '../../lib';

const options = [['present', 'Present', 'bg-emerald-600 text-white'], ['late', 'Late', 'bg-gold text-navy'], ['absent', 'Absent', 'bg-red-600 text-white']];

export default function Show({ entry, students }) {
    const form = useForm({ records: students.map((s) => ({ student_id: s.student_id, status: s.status })) });
    const setAll = (status) => form.setData('records', form.data.records.map((r) => ({ ...r, status })));
    const setOne = (i, status) => form.setData('records', form.data.records.map((r, k) => (k === i ? { ...r, status } : r)));
    const count = (st) => form.data.records.filter((r) => r.status === st).length;

    return (
        <>
            <Head title="Class register" />
            <PageHeader title={`${entry.subject}, ${entry.batch}`} subtitle={`${fmtDate(entry.date)}, ${entry.start_time} to ${entry.end_time}`} actions={<Button href="/portal/attendance" variant="outline">Back</Button>} />

            {students.length === 0 ? <Empty title="No approved students in this batch yet" /> : (
                <>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex gap-2"><Button variant="subtle" size="sm" onClick={() => setAll('present')}>Mark everyone present</Button><Button variant="subtle" size="sm" onClick={() => setAll('absent')}>Mark everyone absent</Button></div>
                        <p className="text-sm text-navy-500">{count('present')} present, {count('late')} late, {count('absent')} absent</p>
                    </div>

                    <ul className="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">
                        {students.map((s, i) => (
                            <li key={s.student_id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                                <div><p className="font-semibold text-navy">{s.name}</p><p className="text-xs text-navy-400">{s.student_no}</p></div>
                                <div className="flex gap-1" role="radiogroup" aria-label={`Attendance for ${s.name}`}>
                                    {options.map(([v, text, on]) => (
                                        <button key={v} type="button" role="radio" aria-checked={form.data.records[i].status === v} onClick={() => setOne(i, v)}
                                            className={cx('rounded-md px-3 py-1.5 text-sm font-medium', form.data.records[i].status === v ? on : 'bg-navy-50 text-navy-600 hover:bg-navy-100')}>{text}</button>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-5"><Button variant="gold" size="lg" disabled={form.processing} onClick={() => form.post(`/portal/attendance/${entry.id}`)}>{form.processing ? 'Saving...' : 'Save attendance'}</Button></div>
                </>
            )}
        </>
    );
}
