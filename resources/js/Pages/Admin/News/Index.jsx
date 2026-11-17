import { Head, Link, router } from '@inertiajs/react';
import { Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Empty, PageHeader, Pagination, SearchBox, SelectInput, TableWrap, Thead } from '../../../Components/ui';
import { confirmThen, fmtDateTime, useFilters } from '../../../lib';

const statusTone = { live: 'green', scheduled: 'blue', ended: 'gray', hidden: 'amber' };
const statusText = { live: 'Live now', scheduled: 'Scheduled', ended: 'Ended', hidden: 'Hidden' };

/** News list: picture, start/end dates, whether it is a home page ad, and whether it is live right now. */
export default function Index({ posts, filters }) {
    const [f, setF] = useFilters('/portal/news', { search: filters.search, status: filters.status });

    const remove = (p) => confirmThen(`Delete the news "${p.title}"?`, () => router.delete(`/portal/news/${p.id}`, { preserveScroll: true }));

    return (
        <>
            <Head title="News and ads" />
            <PageHeader
                title="News and ads"
                subtitle={'News is shown on the website News page between its start date and end date. Switch on "Show as ad" to also open it as a pop-up every time someone visits the home page.'}
                actions={<Button href="/portal/news/create" variant="gold"><Plus size={16} /> Add news</Button>}
            />

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <SearchBox className="sm:col-span-2" value={f.search} onChange={(v) => setF({ search: v })} placeholder="Search news" />
                <SelectInput
                    value={f.status}
                    onChange={(e) => setF({ status: e.target.value }, true)}
                    options={[
                        { value: 'live', label: 'Live now' },
                        { value: 'scheduled', label: 'Scheduled' },
                        { value: 'ended', label: 'Ended' },
                        { value: 'hidden', label: 'Hidden' },
                    ]}
                    placeholder="All news"
                />
            </div>

            {posts.data.length === 0 ? (
                <Empty title="No news yet">Use "Add news" to publish the first one.</Empty>
            ) : (
                <>
                    <TableWrap>
                        <Thead>
                            <th className="th">Picture</th><th className="th">News</th><th className="th">Starts</th><th className="th">Ends</th><th className="th">Status</th><th className="th" />
                        </Thead>
                        <tbody className="divide-y divide-navy-50">
                            {posts.data.map((p) => (
                                <tr key={p.id} className="hover:bg-navy-50/50">
                                    <td className="td">
                                        {p.image ? <img src={p.image} alt="" className="h-14 w-20 rounded-md object-cover" /> : <span className="flex h-14 w-20 items-center justify-center rounded-md bg-navy-50 text-xs text-navy-300">No picture</span>}
                                    </td>
                                    <td className="td">
                                        <Link href={`/portal/news/${p.id}/edit`} className="font-semibold text-navy hover:text-brand">{p.title}</Link>
                                        {p.show_as_ad && <p className="mt-1"><Badge tone="amber"><Megaphone size={11} className="mr-1" /> Home page ad</Badge></p>}
                                    </td>
                                    <td className="td whitespace-nowrap text-xs text-navy-500">{fmtDateTime(p.starts_at)}</td>
                                    <td className="td whitespace-nowrap text-xs text-navy-500">{fmtDateTime(p.ends_at)}</td>
                                    <td className="td"><Badge tone={statusTone[p.status]}>{statusText[p.status]}</Badge></td>
                                    <td className="td whitespace-nowrap text-right">
                                        <Button href={`/portal/news/${p.id}/edit`} variant="subtle" size="sm"><Pencil size={14} /> Edit</Button>
                                        <Button variant="ghost" size="sm" className="text-red-600" aria-label="Delete" onClick={() => remove(p)}><Trash2 size={14} /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </TableWrap>
                    <Pagination paginator={posts} />
                </>
            )}
        </>
    );
}