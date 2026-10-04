import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Alert, Button, Card } from '../../Components/ui';
import { money } from '../../lib';

export default function Sandbox({ transaction }) {
    const [busy, setBusy] = useState(false);
    const go = (result) => {
        setBusy(true);
        router.post(`/payment/sandbox/${transaction.order_id}`, { result }, { onFinish: () => setBusy(false) });
    };

    return (
        <>
            <Head title="Test payment page" />
            <div className="mx-auto max-w-lg py-6">
                <Alert tone="amber" title="Test payment page" className="mb-4">
                    This is the built-in practice gateway. No money moves. In production this page is replaced by PayHere.
                </Alert>
                <Card className="p-6">
                    <p className="text-sm text-navy-500">Paying for</p>
                    <p className="font-bold text-navy">{transaction.invoice.description}</p>
                    <p className="text-sm text-navy-500">{transaction.invoice.invoice_no}</p>
                    <p className="mt-4 text-3xl font-bold text-navy">{money(transaction.amount)}</p>
                    <p className="mt-1 text-xs text-navy-400">Transaction {transaction.order_id}</p>

                    <div className="mt-6 grid gap-2">
                        <Button variant="gold" size="lg" disabled={busy} onClick={() => go('success')}>Pay successfully</Button>
                        <Button variant="outline" disabled={busy} onClick={() => go('failed')}>Simulate a failed payment</Button>
                        <Button variant="ghost" disabled={busy} onClick={() => go('cancelled')}>Cancel</Button>
                    </div>
                </Card>
            </div>
        </>
    );
}
