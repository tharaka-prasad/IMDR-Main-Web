import { Head } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/** Sends the browser to the payment gateway (PayHere expects a form POST). */
export default function Redirect({ checkout }) {
    const form = useRef(null);

    useEffect(() => {
        form.current?.submit();
    }, []);

    return (
        <>
            <Head title="Opening the payment page" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
                <img src="/images/logo.jpg" alt="IMDR" className="h-20 w-20 object-contain" />
                <p className="mt-6 text-lg font-bold text-navy">Taking you to the secure payment page...</p>
                <p className="mt-1 text-sm text-navy-500">Please do not close this window.</p>
                <form ref={form} method={checkout.method} action={checkout.action} className="mt-6">
                    {Object.entries(checkout.fields || {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v ?? ''} />)}
                    <noscript><button type="submit" className="rounded-lg bg-gold px-4 py-2 font-semibold text-navy">Continue to payment</button></noscript>
                </form>
            </div>
        </>
    );
}
