import { Head, Link, router, useForm } from '@inertiajs/react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Check2, Empty, Field, FormError, Modal, PageHeader, TableWrap, TextArea, TextInput, Thead } from '../../../Components/ui';
import { confirmThen } from '../../../lib';

/** Departments: the groups the courses belong to. The website and the admin course list are organised by them. */
export default function Index({ departments }) {
    const [modal, setModal] = useState(null); // null | { row }
    const form = useForm({ name: '', code: '', description: '', is_active: true });
    const e = form.errors;

    const open = (row) => {
        form.clearErrors();
        form.setData(row
            ? { name: row.name, code: row.code, description: row.description ?? '', is_active: !!row.is_active }
            : { name: '', code: '', description: '', is_active: true });
        setModal({ row });
    };

    const submit = (ev) => {
        ev.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => setModal(null) };
        modal.row ? form.put(`/portal/departments/${modal.row.id}`, options) : form.post('/portal/departments', options);
    };

    const remove = (d) => confirmThen(`Delete the department "${d.name}"?`, () => router.delete(`/portal/departments/${d.id}`, { preserveScroll: true }));

    return (
        <>
            <Head title="Departments" />
            <PageHeader
                title="Departments"
                subtitle="Every course belongs to one department. The public Courses page and the admin Courses list are grouped by department."
                actions={<Button variant="gold" onClick={() => open(null)}><Plus size={16} /> Add department</Button>}
            />

            {departments.length === 0 ? (
                <Empty title="No departments yet">Add your first department, then choose it when you add a course.</Empty>
            ) : (
                <TableWrap>
                    <Thead>
                        <th className="th">Code</th><th className="th">Department</th><th className="th">Courses</th><th className="th">Status</th><th className="th" />
                    </Thead>
                    <tbody className="divide-y divide-navy-50">
                        {departments.map((d) => (
                            <tr key={d.id} className="hover:bg-navy-50/50">
                                <td className="td font-mono text-xs">{d.code}</td>
                                <td className="td">
                                    <Link href={`/portal/departments/${d.id}`} className="inline-flex items-center gap-2 font-semibold text-brand hover:underline"><Building2 size={15} /> {d.name}</Link>
                                    {d.description && <p className="text-xs text-navy-400">{d.description}</p>}
                                </td>
                                <td className="td">{d.courses_count}</td>
                                <td className="td">{d.is_active ? <Badge tone="green">Active</Badge> : <Badge tone="gray">Hidden on website</Badge>}</td>
                                <td className="td whitespace-nowrap text-right">
                                    <Button href={`/portal/departments/${d.id}`} variant="subtle" size="sm">Open</Button>
                                    <Button variant="ghost" size="sm" onClick={() => open(d)}><Pencil size={14} /> Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-red-600" aria-label="Delete" onClick={() => remove(d)}><Trash2 size={14} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}

            <Modal
                open={!!modal}
                onClose={() => setModal(null)}
                title={modal?.row ? 'Edit department' : 'Add department'}
                footer={(
                    <>
                        <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                        <Button variant="gold" onClick={submit} disabled={form.processing}>{form.processing ? 'Saving...' : 'Save'}</Button>
                    </>
                )}
            >
                <form onSubmit={submit} className="space-y-3">
                    <FormError errors={e} />
                    <Field label="Department name" error={e.name}><TextInput value={form.data.name} onChange={(ev) => form.setData('name', ev.target.value)} required placeholder="Media & Journalism" /></Field>
                    <Field label="Short code" error={e.code} help="Unique, for example MJ or CP."><TextInput value={form.data.code} onChange={(ev) => form.setData('code', ev.target.value)} required maxLength={20} /></Field>
                    <Field label="Description" error={e.description} help="Shown on the website under the department name."><TextArea rows={3} value={form.data.description} onChange={(ev) => form.setData('description', ev.target.value)} maxLength={500} /></Field>
                    <Check2 label="Active (show its courses on the website)" checked={form.data.is_active} onChange={(v) => form.setData('is_active', v)} />
                    <button type="submit" className="hidden" />
                </form>
            </Modal>
        </>
    );
}