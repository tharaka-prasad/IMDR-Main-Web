import { Head, router, useForm } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Empty, PageHeader, Status, TableWrap, Thead } from '../../Components/ui';
import { cx } from '../../lib';

export default function Show({ quiz, questions, attempt, review, attempts, canManage }) {
    const submit = useForm({ answers: {}, started_at: new Date().toISOString() });
    const [seconds, setSeconds] = useState(quiz.time_limit_minutes * 60);
    const active = !canManage && !attempt;

    useEffect(() => {
        if (!active) return undefined;
        const id = setInterval(() => setSeconds((s) => (s <= 1 ? (clearInterval(id), submit.post(`/portal/quizzes/${quiz.id}/attempt`), 0) : s - 1)), 1000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    const pick = (qid, idx) => submit.setData('answers', { ...submit.data.answers, [qid]: idx });
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');

    return (
        <>
            <Head title={quiz.title} />
            <PageHeader title={quiz.title} subtitle={`${quiz.subject}, ${quiz.batch}`} actions={<Button href="/portal/quizzes" variant="outline">Back</Button>} />
            {quiz.description && <p className="mb-4 text-navy-600">{quiz.description}</p>}

            {canManage ? (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="p-5">
                        <h2 className="mb-3 font-bold">Questions</h2>
                        <ol className="space-y-4">
                            {questions.map((q, i) => (
                                <li key={q.id}>
                                    <p className="font-semibold text-navy">{i + 1}. {q.question} <span className="text-xs font-normal text-navy-400">({q.marks} marks)</span></p>
                                    <ul className="mt-1 space-y-1 pl-4 text-sm">
                                        {q.options.map((o, oi) => <li key={oi} className={cx(oi === q.correct_index && 'font-semibold text-emerald-700')}>{oi === q.correct_index && <Check size={14} className="mr-1 inline" />}{o}</li>)}
                                    </ul>
                                </li>
                            ))}
                        </ol>
                    </Card>
                    <Card className="p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-bold">Attempts</h2>
                            <Badge tone={quiz.is_published ? 'green' : 'gray'}>{quiz.is_published ? 'Published' : 'Hidden'}</Badge>
                        </div>
                        <Button variant="outline" size="sm" className="mb-3" onClick={() => router.put(`/portal/quizzes/${quiz.id}`, { is_published: !quiz.is_published }, { preserveScroll: true })}>{quiz.is_published ? 'Hide from students' : 'Publish to students'}</Button>
                        {attempts.length === 0 ? <Empty title="No attempts yet" /> : (
                            <TableWrap>
                                <Thead><th className="th">Student</th><th className="th text-right">Score</th></Thead>
                                <tbody className="divide-y divide-navy-50">{attempts.map((a) => <tr key={a.id}><td className="td">{a.student}<p className="text-xs text-navy-400">{a.student_no}</p></td><td className="td text-right font-semibold">{a.score}/{a.total}</td></tr>)}</tbody>
                            </TableWrap>
                        )}
                    </Card>
                </div>
            ) : attempt ? (
                <Card className="p-5">
                    <Alert tone="green" title={`Your score: ${attempt.score} / ${attempt.total}`} className="mb-5">Correct answers are shown below.</Alert>
                    <ol className="space-y-4">
                        {questions.map((q, i) => (
                            <li key={q.id}>
                                <p className="font-semibold text-navy">{i + 1}. {q.question}</p>
                                <ul className="mt-1 space-y-1 pl-4 text-sm">
                                    {q.options.map((o, oi) => {
                                        const isCorrect = oi === review[q.id];
                                        const wasPicked = attempt.answers[q.id] === oi;
                                        return (
                                            <li key={oi} className={cx('flex items-center gap-1', isCorrect && 'font-semibold text-emerald-700', wasPicked && !isCorrect && 'text-red-700 line-through')}>
                                                {isCorrect ? <Check size={14} /> : wasPicked ? <X size={14} /> : <span className="w-3.5" />} {o}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}
                    </ol>
                </Card>
            ) : (
                <Card className="p-5">
                    <div className="mb-4 flex items-center justify-between rounded-lg bg-navy-50 px-4 py-2">
                        <p className="text-sm text-navy-600">One attempt only. Submitted automatically when time runs out.</p>
                        <p className="font-mono text-lg font-bold text-navy">{mm}:{ss}</p>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); submit.post(`/portal/quizzes/${quiz.id}/attempt`); }}>
                        <ol className="space-y-5">
                            {questions.map((q, i) => (
                                <li key={q.id}>
                                    <p className="font-semibold text-navy">{i + 1}. {q.question}</p>
                                    <div className="mt-2 space-y-1" role="radiogroup" aria-label={`Question ${i + 1}`}>
                                        {q.options.map((o, oi) => (
                                            <label key={oi} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-navy-50">
                                                <input type="radio" name={`q-${q.id}`} checked={submit.data.answers[q.id] === oi} onChange={() => pick(q.id, oi)} /> {o}
                                            </label>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ol>
                        <Button type="submit" variant="gold" size="lg" className="mt-6" disabled={submit.processing}>{submit.processing ? 'Submitting...' : 'Submit quiz'}</Button>
                    </form>
                </Card>
            )}
        </>
    );
}
