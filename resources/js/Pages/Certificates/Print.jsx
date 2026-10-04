import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '../../Components/ui';
import { fmtDate } from '../../lib';

export default function Print({ certificate: c }) {
    return (
        <>
            <Head title={c.certificate_no} />
            <div className="min-h-screen bg-paper px-4 py-8 print:bg-white print:py-0">
                <div className="no-print mx-auto mb-4 flex max-w-3xl justify-between">
                    <Button href="/portal/certificates" variant="outline" size="sm">Back</Button>
                    <Button variant="primary" size="sm" onClick={() => window.print()}><Printer size={14} /> Print or save as PDF</Button>
                </div>

                <div className="mx-auto max-w-3xl border-8 border-double border-gold bg-white p-12 text-center shadow-lift print:border-4 print:shadow-none">
                    <img src="/images/logo.jpg" alt="IMDR" className="mx-auto h-20 w-20 object-contain" />
                    <p className="display-wide mt-3 text-2xl tracking-widest text-navy">IMDR</p>
                    <p className="text-xs uppercase tracking-widest text-navy-400">Institute of Media Development and Research</p>

                    <p className="mt-10 text-sm uppercase tracking-widest text-brand">Certificate of Completion</p>
                    <p className="mt-6 text-sm text-navy-500">This is to certify that</p>
                    <p className="display-wide mt-2 text-4xl text-navy">{c.student}</p>
                    <p className="mt-1 text-sm text-navy-500">Student ID {c.student_no}</p>
                    <p className="mt-6 text-navy-600">has successfully completed the requirements of</p>
                    <p className="mt-2 text-2xl font-bold text-navy">{c.course}</p>
                    <p className="text-navy-500">{c.batch}</p>

                    {c.status === 'revoked' && <p className="mt-6 text-lg font-bold text-red-600">THIS CERTIFICATE HAS BEEN REVOKED</p>}

                    <div className="mt-14 flex items-end justify-between text-left text-sm">
                        <div>
                            <p className="border-t border-navy-300 pt-1 text-navy-500">Issued</p>
                            <p className="font-semibold text-navy">{fmtDate(c.issued_at)}</p>
                        </div>
                        <div className="text-right">
                            <p className="border-t border-navy-300 pt-1 text-navy-500">Certificate number</p>
                            <p className="font-mono font-semibold text-navy">{c.certificate_no}</p>
                        </div>
                    </div>
                    <p className="mt-8 text-xs text-navy-400">Verify this certificate at {c.verify_url}</p>
                </div>
            </div>
        </>
    );
}
