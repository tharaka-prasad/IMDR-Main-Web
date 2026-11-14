import { Head } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { Badge, Button, Empty, PageHeader, Stat, TableWrap, Thead } from '../../../Components/ui';

/** One department: its courses, with a shortcut to add a course straight into it. */
export default function Show({ department, courses, students_count }) {
    return (
        <>
            <Head title={department.name} />
            <PageHeader
                title={department.name}
                subtitle={department.description || `Department code ${department.code}`}
                actions={(
                    <>
                        <Button href="/portal/departments" variant="outline">All departments</Button>
                        <Button href={`/portal/courses/create?department=${department.id}`} variant="gold"><Plus size={16} /> Add course to this department</Button>
                    </>
                )}
            />

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <Stat label="Courses" value={courses.length} />
                <Stat label="Students studying" value={students_count} accent="green" />
                <Stat label="Status" value={department.is_active ? 'Active' : 'Hidden'} accent={department.is_active ? 'brand' : 'gold'} hint={department.is_active ? 'Shown on the website' : 'Not shown on the website'} />
            </div>

            {courses.length === 0 ? (
                <Empty title="No courses in this department yet">Use "Add course to this department" to create the first one.</Empty>
            ) : (
                <TableWrap>
                    <Thead>
                        <th className="th">Code</th><th className="th">Course</th><th className="th">Category</th><th className="th">Batches</th><th className="th">Website</th><th className="th" />
                    </Thead>
                    <tbody className="divide-y divide-navy-50">
                        {courses.map((c) => (
                            <tr key={c.id} className="hover:bg-navy-50/50">
                                <td className="td font-mono text-xs">{c.code}</td>
                                <td className="td font-semibold text-navy">{c.name}{c.duration && <p className="text-xs font-normal text-navy-400">{c.duration}</p>}</td>
                                <td className="td">{c.type}</td>
                                <td className="td">{c.batches_count}</td>
                                <td className="td">{c.is_published ? <Badge tone="green">Published</Badge> : <Badge tone="gray">Hidden</Badge>}</td>
                                <td className="td text-right"><Button href={`/portal/courses/${c.id}/edit`} variant="ghost" size="sm"><Pencil size={14} /> Edit</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
        </>
    );
}