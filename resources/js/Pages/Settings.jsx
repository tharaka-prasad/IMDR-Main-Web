import { Head, useForm } from '@inertiajs/react';
import { Alert, Button, Card, Check2, Field, FormError, PageHeader, TextInput } from '../Components/ui';

export default function Settings({ settings, gateway, whatsappDriver }) {
    const form = useForm({ ...settings });
    const flag = (k) => form.data[k] === '1' || form.data[k] === 1 || form.data[k] === true;
    const setFlag = (k) => (v) => form.setData(k, v ? '1' : '0');
    const text = (k) => ({ value: form.data[k] ?? '', onChange: (e) => form.setData(k, e.target.value) });

    return (
        <>
            <Head title="Settings" />
            <PageHeader title="Settings" subtitle="Institute details and the rules the system follows." />

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
                <Alert tone={gateway === 'sandbox' ? 'amber' : 'green'} title={`Payment gateway: ${gateway}`}>
                    {gateway === 'sandbox' ? 'Test mode. No real money moves. Set PAYMENT_GATEWAY=payhere in the .env file to accept real payments.' : 'Real payments are switched on.'}
                </Alert>
                <Alert tone={whatsappDriver === 'log' ? 'amber' : 'green'} title={`WhatsApp driver: ${whatsappDriver}`}>
                    {whatsappDriver === 'log' ? 'Receipts are recorded, not sent. Set WHATSAPP_DRIVER=cloud or twilio in the .env file.' : 'Receipts are sent automatically after every payment.'}
                </Alert>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); form.put('/portal/settings', { preserveScroll: true }); }} className="space-y-6">
                <FormError errors={form.errors} />
                <Card className="space-y-4 p-5">
                    <h2 className="font-bold">Institute</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Name" error={form.errors.institute_name}><TextInput {...text('institute_name')} /></Field>
                        <Field label="Email" error={form.errors.institute_email}><TextInput type="email" {...text('institute_email')} /></Field>
                        <Field label="Phone" error={form.errors.institute_phone}><TextInput {...text('institute_phone')} /></Field>
                        <Field label="Address" error={form.errors.institute_address}><TextInput {...text('institute_address')} /></Field>
                    </div>
                    <p className="text-xs text-navy-400">These appear on receipts.</p>
                </Card>

                <Card className="space-y-4 p-5">
                    <h2 className="font-bold">Payments and learning access</h2>
                    <Check2 label="Registration fee must be paid before a registration can be approved" checked={flag('registration_fee_mandatory')} onChange={setFlag('registration_fee_mandatory')} help="An admin can still approve anyway for a cleared student." />
                    <Field label="Grace days after the due date" error={form.errors.payment_grace_days} help="Students lose access to the LMS this many days after an invoice is overdue. 0 = the day after the due date."><TextInput type="number" min="0" max="60" className="max-w-32" {...text('payment_grace_days')} /></Field>
                    <Check2 label="Send payment receipts on WhatsApp" checked={flag('whatsapp_receipts_enabled')} onChange={setFlag('whatsapp_receipts_enabled')} />
                </Card>

                <Card className="space-y-4 p-5">
                    <h2 className="font-bold">Certificates</h2>
                    <Field label="Minimum attendance (%)" error={form.errors.min_attendance_percent}><TextInput type="number" min="0" max="100" className="max-w-32" {...text('min_attendance_percent')} /></Field>
                    <Check2 label="No certificate while fees are outstanding" checked={flag('certificate_requires_clearance')} onChange={setFlag('certificate_requires_clearance')} />
                </Card>

                <Button type="submit" variant="gold" disabled={form.processing}>{form.processing ? 'Saving...' : 'Save settings'}</Button>
            </form>
        </>
    );
}
