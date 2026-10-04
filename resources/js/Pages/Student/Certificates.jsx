import { Head } from '@inertiajs/react';
import { Award } from 'lucide-react';
import { Button, Empty, PageHeader, Status } from '../../Components/ui';
import { fmtDate } from '../../lib';

export default function Certificates({ certificates }) {
    return (
        <>
            <Head title="My certificates" />
            <PageHeader title="My certificates" />
            {certificates.length === 0 ? <Empty title="No certificates yet">These appear once you complete a course and its requirements are met.</Empty> : (
                <ul className="grid gap-4 sm:grid-cols-2">
                    {certificates.map((c) => (
                        <li key={c.id} className="flex items-center justify-between rounded-xl border border-navy-100 bg-white p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-50 text-gold-600"><Award size={22} /></span>
                                <div><p className="font-bold text-navy">{c.course}</p><p className="text-xs text-navy-400">{c.certificate_no}, issued {fmtDate(c.issued_at)}</p></div>
                            </div>
                            <div className="text-right"><Status value={c.status} /><Button href={`/portal/certificates/${c.id}`} variant="subtle" size="sm" className="mt-2">View</Button></div>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
