import { Head, Link, router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Empty, PageHeader, TableWrap, Thead } from '../../Components/ui';
import { confirmThen } from '../../lib';

export default function Index({ items, canManage }) {
    return (
        <>
            <Head title="Quizzes" />
            <PageHeader title="Quizzes" actions={canManage && <Button href="/portal/quizzes/create" variant="gold"><Plus size={16} /> New quiz</Button>} />

            {items.length === 0 ? <Empty title="No quizzes yet" /> : (
                <TableWrap>
                    <Thead><th className="th">Quiz</th><th className="th">Subject</th><th className="th">Batch</th><th className="th">Questions</th><th className="th">Time limit</th><th className="th">{canManage ? 'Status' : 'Result'}</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {items.map((q) => (
                            <tr key={q.id} className="hover:bg-navy-50/50">
                                <td className="td font-semibold"><Link href={`/portal/quizzes/${q.id}`} className="text-brand hover:underline">{q.title}</Link></td>
                                <td className="td">{q.subject}</td><td className="td">{q.batch}</td><td className="td">{q.questions_count}</td><td className="td">{q.time_limit_minutes} min</td>
                                <td className="td">{canManage ? (q.is_published ? <Badge tone="green">Published, {q.attempts_count} attempts</Badge> : <Badge tone="gray">Hidden</Badge>) : (q.mine ? <Badge tone="green">{q.mine.score}/{q.mine.total}</Badge> : <Badge tone="amber">Not attempted</Badge>)}</td>
                                <td className="td text-right">
                                    <Button href={`/portal/quizzes/${q.id}`} size="sm" variant="subtle">{canManage ? 'Open' : q.mine ? 'Review' : 'Attempt'}</Button>
                                    {canManage && <Button variant="ghost" size="sm" className="text-red-600" aria-label="Delete" onClick={() => confirmThen('Delete this quiz?', () => router.delete(`/portal/quizzes/${q.id}`))}><Trash2 size={14} /></Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
        </>
    );
}
