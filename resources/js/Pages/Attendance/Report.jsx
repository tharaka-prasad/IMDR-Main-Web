import { Head, Link, router } from '@inertiajs/react';
import { Empty, Field, PageHeader, SelectInput, TableWrap, Thead } from '../../Components/ui';
import { cx } from '../../lib';

export default function Report({ batches, batchId, report }) {
    return (
        <>
            <Head title="Attendance report" />
            <PageHeader title="Attendance report" subtitle="Percentage of held classes each student attended." />
            <div className="mb-5 max-w-sm"><Field label="Batch"><SelectInput value={batchId ?? ''} onChange={(e) => router.get('/portal/attendance-report', e.target.value ? { batch_id: e.target.value } : {}, { preserveState: true })} options={batches.map((b) => ({ value: b.id, label: b.name }))} placeholder="Choose a batch" /></Field></div>

            {!report ? <Empty title="Choose a batch to see its attendance" /> : report.students.length === 0 ? <Empty title="No approved students in this batch" /> : (
                <>
                    <p className="mb-2 text-sm text-navy-500">{report.classes_held} classes held for {report.batch}.</p>
                    <TableWrap>
                        <Thead><th className="th">Student ID</th><th className="th">Name</th><th className="th text-right">Attended</th><th className="th text-right">Percentage</th></Thead>
                        <tbody className="divide-y divide-navy-50">
                            {report.students.map((s) => (
                                <tr key={s.student_id}><td className="td font-mono text-xs">{s.student_no}</td><td className="td"><Link className="text-brand hover:underline" href={`/portal/students/${s.student_id}`}>{s.name}</Link></td><td className="td text-right">{s.attended} of {s.total}</td>
                                    <td className={cx('td text-right font-bold', s.percent != null && s.percent < 75 ? 'text-red-700' : 'text-emerald-700')}>{s.percent == null ? '-' : `${s.percent}%`}</td></tr>
                            ))}
                        </tbody>
                    </TableWrap>
                </>
            )}
        </>
    );
}
