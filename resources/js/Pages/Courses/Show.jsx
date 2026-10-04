import { Head, Link } from '@inertiajs/react';
import { Button } from '../../Components/ui';
import { fmtDate, money } from '../../lib';

const lines = (text) => (text || '').split('\n').map((s) => s.trim()).filter(Boolean);

export default function Show({ course, batches, lecturers }) {
    const fee = course.fee_structure;
    const plan = fee?.installments || [];
    const outcomes = lines(course.learning_outcomes);

    return (
        <>
            <Head title={course.name} />
            <section className="border-b border-navy-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                    <Link href="/courses" className="text-sm font-semibold text-brand hover:underline">All courses</Link>
                    <p className="mt-4 text-sm font-semibold text-brand">{course.course_type?.name}{course.duration ? `, ${course.duration}` : ''}</p>
                    <h1 className="display-wide mt-1 max-w-3xl text-3xl text-navy sm:text-5xl">{course.name}</h1>
                    <p className="mt-4 max-w-2xl text-lg text-navy-600">{course.summary}</p>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3">
                <div className="space-y-10 lg:col-span-2">
                    {course.description && (
                        <section>
                            <h2 className="text-2xl font-bold text-navy">About this course</h2>
                            <p className="mt-2 whitespace-pre-line text-navy-600">{course.description}</p>
                        </section>
                    )}

                    {course.entry_requirements && (
                        <section>
                            <h2 className="text-2xl font-bold text-navy">Who can join</h2>
                            <p className="mt-2 text-navy-600">{course.entry_requirements}</p>
                        </section>
                    )}

                    {outcomes.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-navy">What you will be able to do</h2>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-navy-600">{outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
                        </section>
                    )}

                    {course.subjects?.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-navy">Subjects</h2>
                            <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2">
                                {course.subjects.map((s) => <li key={s.id} className="border-b border-navy-100 py-2 text-navy-700">{s.name}</li>)}
                            </ul>
                        </section>
                    )}

                    {lecturers.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-navy">Lecturers</h2>
                            <ul className="mt-3 space-y-1 text-navy-700">
                                {lecturers.map((l) => <li key={l.id}><b>{l.name}</b>{l.qualification ? `, ${l.qualification}` : ''}</li>)}
                            </ul>
                        </section>
                    )}
                </div>

                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-lift">
                        <h2 className="text-lg font-bold text-navy">Fees</h2>
                        {fee ? (
                            <dl className="mt-3 space-y-2 text-sm">
                                <div className="flex justify-between"><dt className="text-navy-500">Registration fee</dt><dd className="font-semibold">{money(fee.registration_fee)}</dd></div>
                                <div className="flex justify-between"><dt className="text-navy-500">Course fee</dt><dd className="font-semibold">{money(fee.course_fee)}</dd></div>
                                {plan.length > 0 && (
                                    <div className="border-t border-navy-100 pt-2">
                                        <p className="mb-1 font-semibold text-navy">Pay in parts</p>
                                        {plan.map((p, i) => (
                                            <div key={i} className="flex justify-between text-navy-600"><span>{p.label}</span><span>{money(p.amount)}</span></div>
                                        ))}
                                    </div>
                                )}
                            </dl>
                        ) : <p className="mt-2 text-sm text-navy-500">Ask the office for fee details.</p>}

                        <h2 className="mt-6 text-lg font-bold text-navy">Open batches</h2>
                        {batches.length === 0 && <p className="mt-2 text-sm text-navy-500">No batch is open right now. Contact us to join the waiting list.</p>}
                        <ul className="mt-2 space-y-3">
                            {batches.map((b) => (
                                <li key={b.id} className="rounded-lg bg-navy-50 p-3 text-sm">
                                    <p className="font-semibold text-navy">{b.name}</p>
                                    <p className="text-navy-600">Starts {fmtDate(b.start_date)}</p>
                                    {b.schedule_text && <p className="text-navy-600">{b.schedule_text}</p>}
                                    <p className="text-navy-500">{b.seats_left} seats left</p>
                                    <Button href={`/apply?batch=${b.id}`} variant="gold" size="sm" className="mt-2 w-full" disabled={b.seats_left === 0}>Register for this batch</Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </>
    );
}
