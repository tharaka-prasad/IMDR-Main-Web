import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { Alert, Button, Card } from '../../Components/ui';
import { money } from '../../lib';

/**
 * Where the gateway sends the student back. Nothing here is trusted: the status only changes when the
 * gateway's own signed notification reaches the server, so while it is pending this page keeps checking.
 */
export default function Return({ transaction, cancelled }) {
    const pending = transaction.status === 'pending';

    useEffect(() => {
        if (!pending) return undefined;
        const id = setInterval(() => router.reload({ only: ['transaction', 'unread'] }), 3000);
        return () => clearInterval(id);
    }, [pending]);

    return (
        <>
            <Head title="Payment status" />
            <div className="mx-auto max-w-lg py-6">
                <Card className="p-6">
                    <p className="text-sm text-navy-500">{transaction.invoice.invoice_no}: {transaction.invoice.description}</p>
                    <p className="mt-1 text-3xl font-bold text-navy">{money(transaction.amount)}</p>

                    <div className="mt-5">
                        {transaction.status === 'success' && (
                            <Alert tone="green" title="Payment received">Thank you. Your receipt is in Fees and payments, and we are sending a copy to your WhatsApp.</Alert>
                        )}
                        {pending && !cancelled && (
                            <Alert tone="amber" title="Waiting for the bank to confirm">This usually takes a few seconds. You do not need to pay again.</Alert>
                        )}
                        {pending && cancelled && (
                            <Alert tone="amber" title="Payment cancelled">You left the payment page. Nothing was charged. You can try again from Fees and payments.</Alert>
                        )}
                        {['failed', 'cancelled'].includes(transaction.status) && (
                            <Alert tone="red" title="Payment was not completed">Nothing was charged and your invoice is still unpaid. You can try again.</Alert>
                        )}
                    </div>

                    <div className="mt-6 flex gap-2">
                        <Button href="/portal/finance" variant="primary">Back to fees and payments</Button>
                    </div>
                </Card>
            </div>
        </>
    );
}
