import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Check2, Empty, Field, FormError, Modal, PageHeader, Pagination, SearchBox, SelectInput, Status, TableWrap, TextArea, TextInput, Thead } from '../../Components/ui';
import { confirmThen, fmtDate, fmtDateTime, money, toLocalInput, useFilters } from '../../lib';

function Cell({ col, row }) {
    const v = row[col.key];

    switch (col.type) {
        case 'money': return money(v);
        case 'date': return fmtDate(v);
        case 'datetime': return fmtDateTime(v);
        case 'badge': return v ? <Status value={v} /> : '-';
        case 'bool': return v ? <Badge tone="green">Yes</Badge> : <Badge tone="gray">No</Badge>;
        case 'limit': return <span title={v}>{v && v.length > 70 ? `${v.slice(0, 70)}...` : v ?? '-'}</span>;
        default: return <span className="whitespace-pre-line">{v ?? '-'}</span>;
    }
}

const initialFor = (fields, row) => {
    const data = {};
    for (const f of fields) {
        let v = row ? row[f.name] : undefined;
        if (f.type === 'checkbox') v = row ? !!v : ['is_published', 'published'].includes(f.name);
        else if (f.type === 'datetime') v = toLocalInput(v);
        else if (f.type === 'password') v = '';
        else if (v === null || v === undefined) v = '';
        data[f.name] = v;
    }
    return data;
};

/** One page for every simple list / add / edit / delete screen. The server sends the columns and fields. */
export default function Index({ resource, items, filters }) {
    const [modal, setModal] = useState(null); // null | { row }
    const [f, setF] = useFilters(`/portal/manage/${resource.key}`, { search: filters.search });
    const form = useForm({});
    const base = `/portal/manage/${resource.key}`;
    const canEdit = resource.canWrite && resource.fields.length > 0;

    const open = (row) => {
        form.clearErrors();
        form.setData(initialFor(resource.fields, row));
        setModal({ row });
    };

    const submit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => setModal(null) };
        modal.row ? form.put(`${base}/${modal.row.id}`, options) : form.post(base, options);
    };

    const remove = (row) => confirmThen(`Delete this ${resource.singular.toLowerCase()}?`, () => router.delete(`${base}/${row.id}`, { preserveScroll: true }));

    const input = (fd) => {
        const value = form.data[fd.name] ?? '';
        const common = { value, onChange: (e) => form.setData(fd.name, e.target.value), required: fd.required };

        if (fd.type === 'checkbox') return <Check2 key={fd.name} label={fd.label} checked={form.data[fd.name]} onChange={(v) => form.setData(fd.name, v)} help={fd.help} />;

        let control;
        if (fd.type === 'select') control = <SelectInput {...common} options={fd.options || []} />;
        else if (fd.type === 'textarea') control = <TextArea {...common} />;
        else if (fd.type === 'datetime') control = <TextInput type="datetime-local" {...common} />;
        else control = <TextInput type={fd.type} step={fd.step} placeholder={fd.placeholder} autoComplete={fd.type === 'password' ? 'new-password' : undefined} {...common} />;

        return <Field key={fd.name} label={fd.label} help={fd.help} error={form.errors[fd.name]}>{control}</Field>;
    };

    return (
        <>
            <Head title={resource.title} />
            <PageHeader
                title={resource.title}
                subtitle={resource.help}
                actions={resource.canWrite && resource.canCreate && <Button variant="gold" onClick={() => open(null)}><Plus size={16} /> Add {resource.singular.toLowerCase()}</Button>}
            />

            <div className="mb-4 max-w-sm"><SearchBox value={f.search} onChange={(v) => setF({ search: v })} placeholder={`Search ${resource.title.toLowerCase()}`} /></div>

            {items.data.length === 0 ? (
                <Empty title={f.search ? 'Nothing matches your search' : `No ${resource.title.toLowerCase()} yet`}>
                    {resource.canWrite && resource.canCreate && !f.search ? `Use "Add ${resource.singular.toLowerCase()}" to create the first one.` : null}
                </Empty>
            ) : (
                <TableWrap>
                    <Thead>
                        {resource.columns.map((c) => <th key={c.key} className="th">{c.label}</th>)}
                        {resource.canWrite && <th className="th" />}
                    </Thead>
                    <tbody className="divide-y divide-navy-50">
                        {items.data.map((row) => (
                            <tr key={row.id} className="hover:bg-navy-50/50">
                                {resource.columns.map((c) => <td key={c.key} className="td"><Cell col={c} row={row} /></td>)}
                                {resource.canWrite && (
                                    <td className="td whitespace-nowrap text-right">
                                        {canEdit && <Button variant="ghost" size="sm" onClick={() => open(row)} aria-label="Edit"><Pencil size={14} /> Edit</Button>}
                                        {resource.canCreate && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => remove(row)} aria-label="Delete"><Trash2 size={14} /></Button>}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </TableWrap>
            )}
            <Pagination paginator={items} />

            <Modal
                open={!!modal}
                onClose={() => setModal(null)}
                title={modal?.row ? `Edit ${resource.singular.toLowerCase()}` : `Add ${resource.singular.toLowerCase()}`}
                wide={resource.fields.length > 6}
                footer={<><Button variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button variant="gold" disabled={form.processing} onClick={submit}>{form.processing ? 'Saving...' : 'Save'}</Button></>}
            >
                <form onSubmit={submit} className="space-y-4">
                    <FormError errors={form.errors} />
                    <div className={resource.fields.length > 6 ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
                        {resource.fields.map(input)}
                    </div>
                    <button type="submit" className="hidden" />
                </form>
            </Modal>
        </>
    );
}
