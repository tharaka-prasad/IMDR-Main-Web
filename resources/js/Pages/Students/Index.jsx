import { Head, Link } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { Badge, Button, Empty, PageHeader, Pagination, SearchBox, SelectInput, Status, TableWrap, Thead } from '../../Components/ui';
import { money, useFilters } from '../../lib';

const lmsBadge = (s) => {
    if (s.lms_reason === 'payment_delay') return s.lms_allowed ? <Badge tone="amber">Payment delayed (override)</Badge> : <Badge tone="red">Payment delayed</Badge>;
    if (s.lms_reason === 'pending_approval') return <Badge tone="amber">Awaiting approval</Badge>;
    if (s.lms_reason === 'no_enrollment') return <Badge tone="gray">Not registered</Badge>;
    return <Badge tone="green">LMS open</Badge>;
};

export default function Index({ students, filters, batches }) {
    const [f, setF] = useFilters('/portal/students', filters);

    return (
        <>
            <Head title="Students" />
            <PageHeader title="Students" subtitle="Search by name, student ID, username, NIC, phone or email." actions={<Button href="/portal/students/create" variant="gold"><UserPlus size={16} /> Register a student</Button>} />

            <div className="mb-4 grid gap-3 md:grid-cols-4">
                <SearchBox className="md:col-span-2" value={f.search} onChange={(v) => setF({ search: v })} placeholder="Search students" />
                <SelectInput value={f.batch_id} onChange={(e) => setF({ batch_id: e.target.value }, true)} options={batches} placeholder="All batches" />
                <SelectInput value={f.payment} onChange={(e) => setF({ payment: e.target.value }, true)} options={[{ value: 'delayed', label: 'Payment delayed' }]} placeholder="Any payment status" />
            </div>

            {students.data.length === 0 ? (
                <Empty title="No students found">Try a different word, or clear the filters. Use "Register a student" to add a new one.</Empty>
            ) : (
                <TableWrap>
                    <Thead>
                        <th className="th">Student ID</th><th className="th">Name</th><th className="th">Username</th><th className="th">Phone</th>
                        <th className="th">Course and batch</th><th className="th">Account</th><th className="th">Learning access</th><th className="th" />
                    </Thead>
                    <tbody className="divide-y divide-navy-50">
                        {students.data.map((s) => (
                            <tr key={s.id} className="hover:bg-navy-50/50">
                                <td className="td font-mono text-xs">{s.student_no}</td>
                                <td className="td"><Link href={`/portal/students/${s.id}`} className="font-semibold text-brand hover:underline">{s.name}</Link>{s.nic && <p className="text-xs text-navy-400">NIC {s.nic}</p>}</td>
                                <td className="td">{s.username}</td>
                                <td className="td">{s.phone}</td>
                                <td className="td">{s.enrollments.length ? s.enrollments.map((e, i) => <p key={i} className="text-sm">{e.course}<span className="text-xs text-navy-400"> ({e.batch}, {e.status})</span></p>) : <span className="text-navy-400">None</span>}</td>
                                <td className="td"><Status value={s.user_status} /></td>
                                <td className="td">{lmsBadge(s)}{s.overdue_total > 0 && <p className="mt-1 text-xs text-red-700">{money(s.overdue_total)} overdue</p>}</td>
                                <td className="td text-right"><Button href={`/portal/students/${s.id}`} variant="subtle" size="sm">Open</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
            <Pagination paginator={students} />
        </>
    );
}
