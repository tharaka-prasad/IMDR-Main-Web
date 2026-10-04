import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Empty, PageHeader, Pagination, SearchBox, SelectInput, TableWrap, Thead } from '../../Components/ui';
import { confirmThen, money, useFilters } from '../../lib';

export default function Manage({ courses, types, filters }) {
    const [f, setF] = useFilters('/portal/courses', filters);

    return (
        <>
            <Head title="Courses" />
            <PageHeader title="Courses" subtitle="Each course has a registration fee and a course fee split into installments. Students get the invoices automatically." actions={<Button href="/portal/courses/create" variant="gold"><Plus size={16} /> Add course</Button>} />

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <SearchBox className="sm:col-span-2" value={f.search} onChange={(v) => setF({ search: v })} placeholder="Search courses" />
                <SelectInput value={f.type} onChange={(e) => setF({ type: e.target.value }, true)} options={types.map((t) => ({ value: t.id, label: t.name }))} placeholder="All types" />
            </div>

            {courses.data.length === 0 ? <Empty title="No courses found" /> : (
                <TableWrap>
                    <Thead><th className="th">Code</th><th className="th">Course</th><th className="th">Type</th><th className="th text-right">Registration</th><th className="th text-right">Course fee</th><th className="th">Parts</th><th className="th">Batches</th><th className="th">Website</th><th className="th" /></Thead>
                    <tbody className="divide-y divide-navy-50">
                        {courses.data.map((c) => (
                            <tr key={c.id} className="hover:bg-navy-50/50">
                                <td className="td font-mono text-xs">{c.code}</td>
                                <td className="td font-semibold text-navy">{c.name}<p className="text-xs font-normal text-navy-400">{c.duration}</p></td>
                                <td className="td">{c.course_type?.name}</td>
                                <td className="td text-right">{c.fee_structure ? money(c.fee_structure.registration_fee) : '-'}</td>
                                <td className="td text-right">{c.fee_structure ? money(c.fee_structure.course_fee) : '-'}</td>
                                <td className="td">{c.fee_structure?.installments?.length || 1}</td>
                                <td className="td">{c.batches_count}</td>
                                <td className="td">{c.is_published ? <Badge tone="green">Published</Badge> : <Badge tone="gray">Hidden</Badge>}</td>
                                <td className="td whitespace-nowrap text-right">
                                    <Button href={`/portal/courses/${c.id}/edit`} variant="ghost" size="sm"><Pencil size={14} /> Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-red-600" aria-label="Delete" onClick={() => confirmThen(`Delete ${c.name}?`, () => router.delete(`/portal/courses/${c.id}`, { preserveScroll: true }))}><Trash2 size={14} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
            <Pagination paginator={courses} />
        </>
    );
}
