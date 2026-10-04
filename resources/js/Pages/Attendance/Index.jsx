import { Head } from '@inertiajs/react';
import { Button, Empty, PageHeader, Status, TableWrap, Thead } from '../../Components/ui';
import { fmtDate } from '../../lib';

export default function Index({ entries, isAdmin }) {
    return (
        <>
            <Head title="Attendance" />
            <PageHeader title="Take attendance" subtitle="Marking a class register also confirms the class was held, which is what lecturer hours and pay are calculated from." actions={isAdmin && <Button href="/portal/attendance-report" variant="outline">Attendance report</Button>} />
            {entries.length === 0 ? <Empty title="No classes to mark">Recent and upcoming classes appear here.</Empty> : (
                <TableWrap>
                    <Thead><th className="th">Date</th><th className="th">Time</th><th className="th">Subject</th><th className="th">Batch</th><th className="th">Class</th><th className="th">Register</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {entries.map((e) => (
                            <tr key={e.id}>
                                <td className="td">{fmtDate(e.date)}</td><td className="td font-mono text-xs">{e.start_time} to {e.end_time}</td>
                                <td className="td font-semibold">{e.subject}</td><td className="td">{e.batch}</td><td className="td"><Status value={e.status} /></td>
                                <td className="td">{e.marked ? `${e.marked} marked` : <span className="text-navy-400">Not marked</span>}</td>
                                <td className="td text-right"><Button href={`/portal/attendance/${e.id}`} size="sm" variant={e.marked ? 'subtle' : 'gold'}>{e.marked ? 'Edit register' : 'Mark register'}</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
        </>
    );
}
