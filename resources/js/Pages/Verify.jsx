import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Alert, Button, Field, TextInput } from '../Components/ui';
import { fmtDate } from '../lib';

export default function Verify({ number, result }) {
    const [value, setValue] = useState(number || '');

    return (
        <>
            <Head title="Verify a certificate" />
            <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
                <h1 className="display-wide text-4xl text-navy">Verify a certificate</h1>
                <p className="mt-3 text-navy-600">Enter the number printed on the certificate, for example IMDR-CERT-000123.</p>

                <form className="mt-6 flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); router.get('/verify', { number: value.trim() }); }}>
                    <Field label="Certificate number" className="flex-1"><TextInput value={value} onChange={(e) => setValue(e.target.value)} placeholder="IMDR-CERT-000123" /></Field>
                    <Button type="submit" variant="gold">Check</Button>
                </form>

                {result && result.found && (
                    <div className="mt-8">
                        <Alert tone={result.valid ? 'green' : 'red'} title={result.valid ? 'This certificate is genuine and valid.' : 'This certificate has been revoked.'}>
                            <dl className="mt-2 grid grid-cols-[120px_1fr] gap-y-1">
                                <dt className="text-navy-500">Certificate</dt><dd className="font-semibold">{result.certificate_no}</dd>
                                <dt className="text-navy-500">Awarded to</dt><dd className="font-semibold">{result.student_name}</dd>
                                <dt className="text-navy-500">Student ID</dt><dd>{result.student_no}</dd>
                                <dt className="text-navy-500">Course</dt><dd>{result.course}</dd>
                                <dt className="text-navy-500">Issued</dt><dd>{fmtDate(result.issued_at)}</dd>
                            </dl>
                        </Alert>
                    </div>
                )}
                {result && !result.found && <Alert tone="red" className="mt-8" title="No certificate found">Check the number and try again. If you think this is a mistake, contact the IMDR office.</Alert>}
            </div>
        </>
    );
}
