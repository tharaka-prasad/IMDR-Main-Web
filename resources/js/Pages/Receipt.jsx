import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '../Components/ui';
import { fmtDateTime, label, money } from '../lib';

export default function Receipt({ receipt: r, public: isPublic }) {
    return (
        <>
            <Head title={`Receipt ${r.receipt_no}`} />
            <div className="min-h-screen bg-paper px-4 py-8 print:bg-white print:py-0">
                <div className="no-print mx-auto mb-4 flex max-w-xl justify-between">
                    {isPublic ? <span /> : <Button href="/portal" variant="outline" size="sm">Back to portal</Button>}
                    <Button variant="primary" size="sm" onClick={() => window.print()}><Printer size={14} /> Print or save as PDF</Button>
                </div>

                <div className="mx-auto max-w-xl rounded-xl border border-navy-100 bg-white p-8 shadow-lift print:border-0 print:shadow-none">
                    <div className="flex items-start justify-between border-b border-navy-100 pb-5">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo.jpg" alt="" className="h-16 w-16 object-contain" />
                            <div>
                                <p className="display-wide text-xl text-navy">IMDR</p>
                                <p className="text-xs text-navy-500">{r.institute.name}</p>
                                {r.institute.address && <p className="text-xs text-navy-500">{r.institute.address}</p>}
                                {(r.institute.phone || r.institute.email) && <p className="text-xs text-navy-500">{[r.institute.phone, r.institute.email].filter(Boolean).join(', ')}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-navy-500">Payment receipt</p>
                            <p className="text-lg font-bold text-navy">{r.receipt_no}</p>
                            <p className="text-xs text-navy-500">{fmtDateTime(r.paid_at)}</p>
                        </div>
                    </div>

                    <dl className="mt-5 grid grid-cols-[130px_1fr] gap-y-2 text-sm">
                        <dt className="text-navy-500">Received from</dt><dd className="font-semibold">{r.student.name}</dd>
                        <dt className="text-navy-500">Student ID</dt><dd>{r.student.student_no}</dd>
                        <dt className="text-navy-500">For</dt><dd>{r.invoice.description}</dd>
                        <dt className="text-navy-500">Invoice</dt><dd>{r.invoice.invoice_no}</dd>
                        <dt className="text-navy-500">Method</dt><dd>{label(r.method)}{r.reference ? `, ref ${r.reference}` : ''}</dd>
                    </dl>

                    <div className="mt-6 rounded-lg bg-navy-50 p-4">
                        <div className="flex items-baseline justify-between">
                            <span className="font-semibold text-navy">Amount paid</span>
                            <span className="text-2xl font-bold text-navy">{money(r.amount)}</span>
                        </div>
                        <div className="mt-2 flex justify-between text-sm text-navy-600"><span>Invoice total</span><span>{money(r.invoice.total)}</span></div>
                        <div className="flex justify-between text-sm text-navy-600"><span>Paid so far</span><span>{money(r.invoice.paid_amount)}</span></div>
                        <div className="flex justify-between text-sm font-semibold text-navy"><span>Balance on this invoice</span><span>{money(r.invoice.balance)}</span></div>
                    </div>

                    {r.refunds.length > 0 && (
                        <div className="mt-4 text-sm text-red-700">
                            <p className="font-semibold">Refunds</p>
                            {r.refunds.map((x, i) => <p key={i}>{money(x.amount)} on {fmtDateTime(x.processed_at)}: {x.reason}</p>)}
                        </div>
                    )}

                    <p className="mt-8 text-center text-xs text-navy-400">This is a computer-generated receipt. Thank you for your payment.</p>
                </div>
            </div>
        </>
    );
}
