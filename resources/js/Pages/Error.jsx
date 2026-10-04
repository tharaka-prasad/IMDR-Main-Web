import { Head } from '@inertiajs/react';
import { Button } from '../Components/ui';

const text = {
    403: ['You do not have access to this page', 'Your account does not have permission to open it. If you think this is wrong, contact the office.'],
    404: ['We could not find that page', 'The link may be old or mistyped.'],
    500: ['Something went wrong on our side', 'Please try again in a moment.'],
    503: ['We are doing maintenance', 'Please try again shortly.'],
};

export default function Error({ status, message }) {
    const [title, body] = text[status] || text[500];

    return (
        <>
            <Head title={title} />
            <div className="mx-auto max-w-xl px-4 py-24 text-center">
                <p className="display-wide text-6xl text-brand">{status}</p>
                <h1 className="mt-4 text-2xl font-bold text-navy">{title}</h1>
                <p className="mt-2 text-navy-600">{message || body}</p>
                <div className="mt-6 flex justify-center gap-3">
                    <Button href="/portal" variant="primary">Go to my portal</Button>
                    <Button href="/" variant="outline">Home page</Button>
                </div>
            </div>
        </>
    );
}
