import { Head } from '@inertiajs/react';
import { Card, Empty, PageHeader, Stat, TableWrap, Thead } from '../../Components/ui';

export default function Records({ attendance, results }) {
    return (
        <>
            <Head title="Attendance and results" />
            <PageHeader title="Attendance and results" />

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <Stat label="Overall attendance" value={attendance.overall == null ? 'No classes yet' : `${attendance.overall}%`} accent={attendance.overall != null && attendance.overall < 75 ? 'red' : 'green'} />
            </div>

            <h2 className="mb-2 text-lg font-bold text-navy">By subject</h2>
            {attendance.subjects.length === 0 ? <Empty title="No attendance recorded yet" /> : (
                <TableWrap>
                    <Thead><th className="th">Subject</th><th className="th text-right">Attended</th><th className="th text-right">Percentage</th></Thead>
                    <tbody className="divide-y divide-navy-50">{attendance.subjects.map((a) => <tr key={a.subject}><td className="td">{a.subject}</td><td className="td text-right">{a.attended} of {a.total}</td><td className="td text-right font-semibold">{a.percent}%</td></tr>)}</tbody>
                </TableWrap>
            )}

            <h2 className="mb-2 mt-8 text-lg font-bold text-navy">Results</h2>
            {results.length === 0 ? <Empty title="No published results yet" /> : (
                <TableWrap>
                    <Thead><th className="th">Subject</th><th className="th">Batch</th><th className="th">Assessment</th><th className="th text-right">Marks</th><th className="th">Grade</th></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {results.map((r) => (
                            <tr key={r.id}><td className="td">{r.subject}</td><td className="td">{r.batch}</td><td className="td">{r.assessment}{r.remarks && <p className="text-xs text-navy-400">{r.remarks}</p>}</td><td className="td text-right">{r.marks}/{r.max_marks}</td><td className="td font-bold">{r.grade}</td></tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
        </>
    );
}
