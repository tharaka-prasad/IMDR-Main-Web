import { Head, useForm } from '@inertiajs/react';
import { Button, Card, Field, FormError, PageHeader, TextInput } from '../Components/ui';
import { label } from '../lib';

export default function Profile({ account, student }) {
    const info = useForm({ name: account.name, email: account.email || '', phone: account.phone || '', whatsapp_number: student?.whatsapp_number || '' });
    const pw = useForm({ current_password: '', password: '', password_confirmation: '' });

    return (
        <>
            <Head title="My profile" />
            <PageHeader title="My profile" subtitle={`Username: ${account.username}. Role: ${label(account.role)}${student ? `. Student ID: ${student.student_no}` : ''}`} />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-5">
                    <h2 className="mb-3 font-bold">My details</h2>
                    <form onSubmit={(e) => { e.preventDefault(); info.put('/portal/profile', { preserveScroll: true }); }} className="space-y-4">
                        <FormError errors={info.errors} />
                        <Field label="Full name" error={info.errors.name}><TextInput value={info.data.name} onChange={(e) => info.setData('name', e.target.value)} required /></Field>
                        <Field label="Email" error={info.errors.email}><TextInput type="email" value={info.data.email} onChange={(e) => info.setData('email', e.target.value)} /></Field>
                        <Field label="Phone" error={info.errors.phone}><TextInput value={info.data.phone} onChange={(e) => info.setData('phone', e.target.value)} /></Field>
                        {student && <Field label="WhatsApp number" error={info.errors.whatsapp_number} help="Payment receipts are sent to this number."><TextInput value={info.data.whatsapp_number} onChange={(e) => info.setData('whatsapp_number', e.target.value)} /></Field>}
                        <Button type="submit" variant="primary" disabled={info.processing}>Save details</Button>
                    </form>
                </Card>

                <Card className="p-5">
                    <h2 className="mb-3 font-bold">Change password</h2>
                    <form onSubmit={(e) => { e.preventDefault(); pw.put('/portal/profile/password', { preserveScroll: true, onSuccess: () => pw.reset() }); }} className="space-y-4">
                        <Field label="Current password" error={pw.errors.current_password}><TextInput type="password" value={pw.data.current_password} onChange={(e) => pw.setData('current_password', e.target.value)} autoComplete="current-password" required /></Field>
                        <Field label="New password" error={pw.errors.password} help="At least 8 characters."><TextInput type="password" value={pw.data.password} onChange={(e) => pw.setData('password', e.target.value)} autoComplete="new-password" required /></Field>
                        <Field label="Repeat new password"><TextInput type="password" value={pw.data.password_confirmation} onChange={(e) => pw.setData('password_confirmation', e.target.value)} autoComplete="new-password" required /></Field>
                        <Button type="submit" variant="primary" disabled={pw.processing}>Change password</Button>
                    </form>
                </Card>
            </div>
        </>
    );
}
