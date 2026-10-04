import { Head } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { Alert, Button, Card } from '../../Components/ui';
import { fmtDate, money } from '../../lib';

export default function Blocked({ access }) {
    return (
        <>
            <Head title="Learning access paused" />
            <Card className="mx-auto max-w-lg p-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><Lock size={26} /></span>

                {access.reason === 'payment_delay' ? (
                    <>
                        <h1 className="mt-4 text-xl font-bold text-navy">Your payment is delayed</h1>
                        <p className="mt-1 text-navy-600">Learning material, assignments and quizzes are paused until the overdue amount is paid.</p>
                        <ul className="mx-auto mt-4 max-w-xs space-y-1 text-left text-sm">
                            {access.overdue.map((i) => (
                                <li key={i.id} className="flex justify-between border-b border-navy-100 py-1"><span>{i.description}</span><b>{money(i.balance)}</b></li>
                            ))}
                        </ul>
                        <p className="mt-3 text-sm text-navy-500">Total overdue: <b>{money(access.overdue_total)}</b></p>
                        <Button href="/portal/finance" variant="gold" size="lg" className="mt-6">Pay now</Button>
                    </>
                ) : access.reason === 'pending_approval' ? (
                    <>
                        <h1 className="mt-4 text-xl font-bold text-navy">Waiting for approval</h1>
                        <p className="mt-1 text-navy-600">The office is reviewing your registration. Learning content opens as soon as it is approved.</p>
                        <Button href="/portal/finance" variant="outline" size="lg" className="mt-6">Check my fees</Button>
                    </>
                ) : (
                    <>
                        <h1 className="mt-4 text-xl font-bold text-navy">Not registered on a course</h1>
                        <p className="mt-1 text-navy-600">You do not have an approved registration yet. Please contact the IMDR office.</p>
                        <Button href="/apply" variant="gold" size="lg" className="mt-6">Register for a course</Button>
                    </>
                )}
            </Card>
        </>
    );
}
