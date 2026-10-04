import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Alert, Button, Card, Empty, PageHeader, Stat, Status, TableWrap, Thead } from '../Components/ui';
import { fmtDate, fmtDateTime, money } from '../lib';

function Chart({ data }) {
    const max = Math.max(1, ...data.flatMap((d) => [d.income, d.spending]));

    return (
        <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-navy">Income and spending, last 6 months</h2>
                <div className="flex gap-4 text-xs text-navy-500">
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-brand" /> Income</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-gold" /> Spending</span>
                </div>
            </div>
            <div className="flex h-44 items-end gap-3" role="img" aria-label="Bar chart of monthly income and spending">
                {data.map((d) => (
                    <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                        <div className="flex h-36 w-full items-end justify-center gap-1">
                            <div className="w-1/3 rounded-t bg-brand" style={{ height: `${(d.income / max) * 100}%` }} title={`Income ${money(d.income)}`} />
                            <div className="w-1/3 rounded-t bg-gold" style={{ height: `${(d.spending / max) * 100}%` }} title={`Spending ${money(d.spending)}`} />
                        </div>
                        <span className="text-xs text-navy-500">{d.label}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function Money({ f }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Income today" value={money(f.today_income)} accent="green" />
            <Stat label="Income this month" value={money(f.month_income)} accent="brand" />
            <Stat label="Spending this month" value={money(f.month_spending)} hint="Expenses and salaries paid" accent="gold" />
            <Stat label="Still to collect" value={money(f.outstanding.total)} hint={f.outstanding.overdue_count ? `${money(f.outstanding.overdue_total)} overdue on ${f.outstanding.overdue_count} invoices` : 'Nothing overdue'} accent={f.outstanding.overdue_count ? 'red' : 'navy'} />
        </div>
    );
}

function AdminDash({ d, isSuper }) {
    const todo = [
        [d.pending_registrations, 'registrations waiting for approval', '/portal/registrations'],
        [d.delayed_students, 'students with a delayed payment (LMS paused)', '/portal/students?payment=delayed'],
        [d.pending_payments, 'online payments waiting for the bank', isSuper ? '/portal/transactions' : null],
        [d.unread_messages, 'unread website messages', '/portal/manage/contact-messages'],
        [d.todays_classes, "classes scheduled today", '/portal/timetable'],
    ].filter(([n]) => n > 0);

    return (
        <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Students" value={d.counts.students} />
                <Stat label="Courses" value={d.counts.courses} accent="gold" />
                <Stat label="Open and running batches" value={d.counts.batches} accent="navy" />
                <Stat label="Lecturers" value={d.counts.lecturers} accent="green" />
            </div>

            <h2 className="mb-2 mt-8 text-lg font-bold text-navy">Needs attention</h2>
            {todo.length === 0 ? <Alert tone="green">Nothing is waiting. Well done.</Alert> : (
                <ul className="grid gap-2 sm:grid-cols-2">
                    {todo.map(([n, text, href]) => (
                        <li key={text} className="flex items-center justify-between rounded-lg border border-navy-100 bg-white px-4 py-3">
                            <span><b className="text-lg text-navy">{n}</b> <span className="text-navy-600">{text}</span></span>
                            {href && <Button href={href} variant="subtle" size="sm">Open</Button>}
                        </li>
                    ))}
                </ul>
            )}

            <h2 className="mb-2 mt-8 text-lg font-bold text-navy">Money</h2>
            <Money f={d.finance} />
            <div className="mt-4"><Chart data={d.finance.chart} /></div>

            <h2 className="mb-2 mt-8 text-lg font-bold text-navy">Newest registrations</h2>
            {d.recent_registrations.length === 0 ? <Empty title="No pending registrations" /> : (
                <TableWrap>
                    <Thead><th className="th">Student</th><th className="th">Course</th><th className="th">Applied</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {d.recent_registrations.map((r) => (
                            <tr key={r.id}>
                                <td className="td"><Link className="font-semibold text-brand hover:underline" href={`/portal/students/${r.student_id}`}>{r.name}</Link><br /><span className="text-xs text-navy-400">{r.student_no}</span></td>
                                <td className="td">{r.course}<br /><span className="text-xs text-navy-400">{r.batch}</span></td>
                                <td className="td">{fmtDateTime(r.created_at)}</td>
                                <td className="td text-right"><Button href="/portal/registrations" size="sm" variant="subtle">Review</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
        </>
    );
}

function AccountantDash({ d }) {
    return (
        <>
            <Money f={d.finance} />
            <div className="mt-4"><Chart data={d.finance.chart} /></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Stat label="Online payments waiting" value={d.pending_payments} accent="gold" />
                <Stat label="Payroll not fully paid" value={d.pending_payroll} accent="navy" />
                <Stat label="WhatsApp receipts failed (7 days)" value={d.failed_whatsapp} accent={d.failed_whatsapp ? 'red' : 'green'} />
            </div>

            <h2 className="mb-2 mt-8 text-lg font-bold text-navy">Overdue invoices</h2>
            {d.overdue.length === 0 ? <Empty title="Nothing overdue" /> : (
                <TableWrap>
                    <Thead><th className="th">Invoice</th><th className="th">Student</th><th className="th">Due</th><th className="th text-right">Balance</th></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {d.overdue.map((i) => (
                            <tr key={i.id}><td className="td">{i.invoice_no}</td><td className="td">{i.student}<br /><span className="text-xs text-navy-400">{i.student_no}</span></td><td className="td">{fmtDate(i.due_date)}</td><td className="td text-right font-semibold">{money(i.balance)}</td></tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}

            <h2 className="mb-2 mt-8 text-lg font-bold text-navy">Latest payments</h2>
            {d.recent_payments.length === 0 ? <Empty title="No payments yet" /> : (
                <TableWrap>
                    <Thead><th className="th">Receipt</th><th className="th">Student</th><th className="th">Method</th><th className="th">Date</th><th className="th text-right">Amount</th></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {d.recent_payments.map((p) => (
                            <tr key={p.id}><td className="td"><Link className="text-brand hover:underline" href={`/portal/receipts/${p.id}`}>{p.receipt_no}</Link></td><td className="td">{p.student}</td><td className="td"><Status value={p.method} /></td><td className="td">{fmtDateTime(p.paid_at)}</td><td className="td text-right font-semibold">{money(p.amount)}</td></tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
        </>
    );
}

const ClassRow = ({ e }) => (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-50 py-3 last:border-0">
        <div>
            <p className="font-semibold text-navy">{e.subject.name}</p>
            <p className="text-sm text-navy-500">{e.batch?.name ? `${e.batch.name}, ` : ''}{fmtDate(e.date)}, {e.start_time?.slice(0, 5)} to {e.end_time?.slice(0, 5)}{e.classroom ? `, ${e.classroom.name}` : ''}</p>
        </div>
        <Status value={e.status} />
    </li>
);

function LecturerDash({ d }) {
    return (
        <>
            <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Classes today" value={d.todays.length} />
                <Stat label="Submissions to mark" value={d.to_mark} accent={d.to_mark ? 'gold' : 'green'} />
                <Stat label="Batches you teach" value={d.batches} accent="navy" />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card className="p-5">
                    <div className="mb-2 flex items-center justify-between"><h2 className="font-bold text-navy">Today</h2><Button href="/portal/attendance" size="sm" variant="subtle">Take attendance</Button></div>
                    {d.todays.length ? <ul>{d.todays.map((e) => <ClassRow key={e.id} e={e} />)}</ul> : <p className="text-sm text-navy-500">No classes today.</p>}
                </Card>
                <Card className="p-5">
                    <h2 className="mb-2 font-bold text-navy">Coming up</h2>
                    {d.upcoming.length ? <ul>{d.upcoming.map((e) => <ClassRow key={e.id} e={e} />)}</ul> : <p className="text-sm text-navy-500">Nothing scheduled.</p>}
                </Card>
            </div>
        </>
    );
}

function StudentDash({ d }) {
    const { access } = usePage().props;
    const m = d.money;

    return (
        <>
            <p className="-mt-4 mb-6 text-sm text-navy-500">Your student ID is <b className="text-navy">{d.student_no}</b></p>

            {access && !access.allowed && access.reason === 'payment_delay' && (
                <Card className="mb-6 border-2 border-red-300 p-5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 text-red-600" />
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-red-800">Payment delayed</h2>
                            <p className="text-sm text-navy-600">Your learning access is paused. Please pay the overdue amount to reopen it straight away.</p>
                            <ul className="mt-2 text-sm">
                                {access.overdue.map((i) => <li key={i.id}>{i.description}: <b>{money(i.balance)}</b>, {i.days_late} days late</li>)}
                            </ul>
                        </div>
                        <Button href="/portal/finance" variant="danger">Pay {money(access.overdue_total)}</Button>
                    </div>
                </Card>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Total fees" value={money(m.total)} accent="navy" />
                <Stat label="Paid" value={money(m.paid)} accent="green" />
                <Stat label="Still to pay" value={money(m.outstanding)} accent={m.outstanding ? 'gold' : 'green'} hint={m.next_due ? `Next: ${fmtDate(m.next_due.due_date)}` : 'All clear'} />
                <Stat label="Attendance" value={d.attendance == null ? 'No classes yet' : `${d.attendance}%`} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card className="p-5">
                    <h2 className="mb-2 font-bold text-navy">My registrations</h2>
                    {d.enrollments.length === 0 ? <p className="text-sm text-navy-500">You are not registered on a course yet.</p> : (
                        <ul>
                            {d.enrollments.map((e) => (
                                <li key={e.id} className="flex items-center justify-between gap-2 border-b border-navy-50 py-3 last:border-0">
                                    <div><p className="font-semibold text-navy">{e.course}</p><p className="text-sm text-navy-500">{e.batch}</p>{e.remarks && <p className="text-xs text-navy-400">{e.remarks}</p>}</div>
                                    <Status value={e.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                    {m.next_due && (
                        <div className="mt-3 flex items-center justify-between rounded-lg bg-gold-50 p-3 text-sm">
                            <span><Clock size={14} className="mr-1 inline" /> {m.next_due.description} due {fmtDate(m.next_due.due_date)}: <b>{money(m.next_due.balance)}</b></span>
                            <Button href="/portal/finance" variant="gold" size="sm">Pay</Button>
                        </div>
                    )}
                </Card>

                <Card className="p-5">
                    <div className="mb-2 flex items-center justify-between"><h2 className="font-bold text-navy">Next classes</h2><Link href="/portal/timetable" className="text-sm font-semibold text-brand hover:underline">Full timetable</Link></div>
                    {d.upcoming.length ? <ul>{d.upcoming.map((e) => <ClassRow key={e.id} e={e} />)}</ul> : <p className="text-sm text-navy-500">No upcoming classes.</p>}
                </Card>
            </div>

            <Card className="mt-6 p-5">
                <div className="mb-2 flex items-center justify-between"><h2 className="font-bold text-navy">Announcements</h2><Link href="/portal/announcements" className="text-sm font-semibold text-brand hover:underline">All</Link></div>
                {d.announcements.length === 0 ? <p className="text-sm text-navy-500">Nothing new.</p> : (
                    <ul className="divide-y divide-navy-50">{d.announcements.map((a) => <li key={a.id} className="py-3"><p className="font-semibold text-navy">{a.title}</p><p className="text-sm text-navy-600 line-clamp-2">{a.body}</p></li>)}</ul>
                )}
            </Card>
        </>
    );
}

export default function Dashboard({ role, data }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard" />
            <PageHeader title={`Hello, ${auth.user.name.split(' ')[0]}`} subtitle={role === 'student' ? 'Here is where you stand today.' : 'Here is how the institute is doing today.'} />
            {['super_admin', 'admin'].includes(role) && <AdminDash d={data} isSuper={role === 'super_admin'} />}
            {role === 'accountant' && <AccountantDash d={data} />}
            {role === 'lecturer' && <LecturerDash d={data} />}
            {role === 'student' && <StudentDash d={data} />}
        </>
    );
}
