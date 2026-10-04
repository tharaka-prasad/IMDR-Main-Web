import { Head, useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { Alert, Button, Card, Check2, Field, FormError, PageHeader, SelectInput, TextArea, TextInput } from '../../Components/ui';

const makePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from(crypto.getRandomValues(new Uint32Array(8)), (n) => chars[n % chars.length]).join('');
};

export default function Create({ batches }) {
    const form = useForm({
        name: '', username: '', password: '', phone: '', whatsapp_number: '', email: '', nic: '', date_of_birth: '', gender: '',
        school: '', address: '', guardian_name: '', guardian_phone: '', notes: '', batch_id: '', approve_now: true,
        birth_certificate: null, result_sheet: null, nic_copy: null, other_document: null, other_title: '',
    });
    const e = form.errors;
    const set = (k) => (ev) => form.setData(k, ev.target.value);
    const file = (k) => (ev) => form.setData(k, ev.target.files[0] || null);

    return (
        <>
            <Head title="Register a student" />
            <PageHeader title="Register a student" subtitle="The student ID is created automatically. You choose the login (or leave it blank and the system creates one)." />

            <form onSubmit={(ev) => { ev.preventDefault(); form.post('/portal/students', { forceFormData: true }); }} className="space-y-6">
                <FormError errors={e} />

                <Card className="space-y-4 p-5">
                    <h2 className="font-bold">Login details</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Username" error={e.username} help="Leave empty to use the student ID (for example imdr20260001)."><TextInput value={form.data.username} onChange={set('username')} autoComplete="off" /></Field>
                        <Field label="Password" error={e.password} help="At least 8 characters. Leave empty and one will be created for you.">
                            <div className="flex gap-2">
                                <TextInput value={form.data.password} onChange={set('password')} autoComplete="off" />
                                <Button variant="outline" onClick={() => form.setData('password', makePassword())}><KeyRound size={14} /> Generate</Button>
                            </div>
                        </Field>
                    </div>
                    <Alert tone="blue">After you save, the login details are shown once so you can hand them to the student.</Alert>
                </Card>

                <Card className="space-y-4 p-5">
                    <h2 className="font-bold">Student details</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Full name" error={e.name}><TextInput value={form.data.name} onChange={set('name')} required /></Field>
                        <Field label="Phone" error={e.phone}><TextInput value={form.data.phone} onChange={set('phone')} required /></Field>
                        <Field label="WhatsApp number" error={e.whatsapp_number} help="Payment receipts are sent here. Empty = phone number."><TextInput value={form.data.whatsapp_number} onChange={set('whatsapp_number')} /></Field>
                        <Field label="Email (optional)" error={e.email}><TextInput type="email" value={form.data.email} onChange={set('email')} /></Field>
                        <Field label="NIC number" error={e.nic}><TextInput value={form.data.nic} onChange={set('nic')} /></Field>
                        <Field label="Date of birth" error={e.date_of_birth}><TextInput type="date" value={form.data.date_of_birth} onChange={set('date_of_birth')} /></Field>
                        <Field label="Gender" error={e.gender}><SelectInput value={form.data.gender} onChange={set('gender')} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} /></Field>
                        <Field label="School" error={e.school}><TextInput value={form.data.school} onChange={set('school')} /></Field>
                        <Field label="Parent or guardian name" error={e.guardian_name}><TextInput value={form.data.guardian_name} onChange={set('guardian_name')} /></Field>
                        <Field label="Parent or guardian phone" error={e.guardian_phone}><TextInput value={form.data.guardian_phone} onChange={set('guardian_phone')} /></Field>
                    </div>
                    <Field label="Address" error={e.address}><TextArea rows={2} value={form.data.address} onChange={set('address')} /></Field>
                    <Field label="Office notes" error={e.notes}><TextArea rows={2} value={form.data.notes} onChange={set('notes')} /></Field>
                </Card>

                <Card className="space-y-4 p-5">
                    <h2 className="font-bold">Course</h2>
                    <Field label="Batch" error={e.batch_id} help="Creates the registration fee and installment invoices automatically."><SelectInput value={form.data.batch_id} onChange={set('batch_id')} options={batches.map((b) => ({ value: b.value, label: `${b.label} (${b.seats_left} seats left)` }))} placeholder="Do not register on a batch yet" /></Field>
                    {form.data.batch_id && <Check2 label="Approve the registration now" checked={form.data.approve_now} onChange={(v) => form.setData('approve_now', v)} help="Use this when the student has paid at the office or has already been cleared. Learning access still stops if a later payment is delayed." />}
                </Card>

                <Card className="space-y-4 p-5">
                    <h2 className="font-bold">Documents</h2>
                    <p className="text-sm text-navy-500">PDF or photo, up to 10 MB each. You can add more later on the student's page. Documents are private: only admins and the student can open them.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Birth certificate" error={e.birth_certificate}><input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={file('birth_certificate')} className="input" /></Field>
                        <Field label="Result sheet" error={e.result_sheet}><input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={file('result_sheet')} className="input" /></Field>
                        <Field label="NIC copy" error={e.nic_copy}><input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={file('nic_copy')} className="input" /></Field>
                        <div className="space-y-2">
                            <Field label="Other document" error={e.other_document}><input type="file" onChange={file('other_document')} className="input" /></Field>
                            <TextInput placeholder="What is it? (for example O/L certificate)" value={form.data.other_title} onChange={set('other_title')} />
                        </div>
                    </div>
                </Card>

                <div className="flex gap-2">
                    <Button type="submit" variant="gold" size="lg" disabled={form.processing}>{form.processing ? 'Saving...' : 'Register student'}</Button>
                    <Button href="/portal/students" variant="outline" size="lg">Cancel</Button>
                </div>
            </form>
        </>
    );
}
