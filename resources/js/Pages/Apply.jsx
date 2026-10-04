import { useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, ClipboardList, MapPin, MessageCircle, Phone, PhoneCall, UserRound } from 'lucide-react';
import { Alert, Button, Field, FormError, SelectInput, TextArea, TextInput } from '../Components/ui';
import { MotionStyles, Reveal } from '../Components/motion';
import { fmtDate, money } from '../lib';

const WHATSAPP = 'https://wa.me/94712161381?text=Hello%20IMDR';

const steps = [
    [ClipboardList, 'Choose your course', 'Pick the course you are interested in.'],
    [UserRound, 'Tell us about you', 'Fill in your contact details. Only name and phone are required.'],
    [PhoneCall, 'We contact you', 'Our office calls or messages you on WhatsApp to confirm.'],
];

export default function Apply({ courses, preselected }) {
    const [done, setDone] = useState(false);

    const initialCourse = useMemo(
        () => courses.find((c) => c.batches?.some((b) => b.id === preselected))?.id ?? '',
        [courses, preselected],
    );

    const form = useForm({
        course_id: initialCourse,
        batch_id: preselected || '',
        name: '',
        phone: '',
        whatsapp_number: '',
        email: '',
        nic: '',
        date_of_birth: '',
        gender: '',
        school: '',
        address: '',
        guardian_name: '',
        guardian_phone: '',
    });

    const set = (k) => (e) => form.setData(k, e.target.value);
    const course = courses.find((c) => String(c.id) === String(form.data.course_id));
    const batches = course?.batches || [];
    const fee = course?.fee_structure;
    const e = form.errors;

    const submit = (ev) => {
        ev.preventDefault();
        form.post('/apply', {
            preserveScroll: false,
            onSuccess: () => {
                setDone(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    return (
        <>
            <Head title="Apply" />
            <MotionStyles />

            {/* ============================ HERO ============================ */}
            <section className="relative overflow-hidden bg-navy text-white">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
                    <p
                        style={{ '--d': '0ms' }}
                        className="hero-in mb-6 inline-flex items-center gap-2 rounded-full border border-navy-400 px-4 py-1.5 text-xs font-bold tracking-widest text-gold"
                    >
                        <span className="rec-pulse h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                        STUDENT APPLICATION
                    </p>

                    <h1 style={{ '--d': '120ms' }} className="hero-in display-wide text-5xl sm:text-6xl xl:text-7xl">
                        Apply to IMDR
                    </h1>

                    <p style={{ '--d': '240ms' }} className="hero-in mt-6 max-w-2xl text-lg leading-8 text-navy-200">
                        No online account is needed. Fill in this Application Form and our office will
                        contact you. You can also visit the institute directly.
                    </p>
                </div>
            </section>

            {/* ============================ STEPS ============================ */}
            <section className="flow-root bg-paper">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <ol className="relative z-10 -mt-10 grid gap-5 md:grid-cols-3">
                        {steps.map(([Icon, title, text], i) => (
                            <Reveal as="li" key={title} delay={i * 120} className="flex gap-4 rounded-2xl bg-white p-6 shadow-lg">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-navy">
                                    <Icon size={22} aria-hidden="true" />
                                </span>
                                <div>
                                    <p className="text-xs font-bold text-brand">STEP {i + 1}</p>
                                    <h2 className="font-bold text-navy">{title}</h2>
                                    <p className="mt-1 text-sm leading-6 text-navy-600">{text}</p>
                                </div>
                            </Reveal>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ============================ FORM ============================ */}
            <section className="bg-paper">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-24">
                    <div className="lg:col-span-8">
                        {done ? (
                            <Reveal className="rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-sm sm:p-16">
                                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold text-navy">
                                    <CheckCircle2 size={40} aria-hidden="true" />
                                </span>
                                <h2 className="mt-8 text-3xl font-bold text-navy">Application received</h2>
                                <p className="mx-auto mt-4 max-w-md leading-7 text-navy-600">
                                    Thank you for applying to IMDR. Our office will contact you shortly by phone
                                    or WhatsApp.
                                </p>
                                <div className="mt-8 flex flex-wrap justify-center gap-4">
                                    <Button href="/courses" variant="gold">
                                        Browse more courses
                                    </Button>
                                    <Button href="/" variant="outline">
                                        Back to home
                                    </Button>
                                </div>
                            </Reveal>
                        ) : (
                            <form onSubmit={submit} className="space-y-8">
                                <FormError errors={e} />

                                <Reveal as="section" className="space-y-5 rounded-2xl border border-navy-100 bg-white p-7 shadow-sm sm:p-9">
                                    <h2 className="text-xl font-bold text-navy">1. Your course</h2>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field label="Course" error={e.course_id}>
                                            <SelectInput
                                                value={form.data.course_id}
                                                onChange={(ev) => form.setData({ ...form.data, course_id: ev.target.value, batch_id: '' })}
                                                options={courses.map((c) => ({ value: c.id, label: c.name }))}
                                                required
                                            />
                                        </Field>

                                        {batches.length > 0 && (
                                            <Field label="Intake (optional)" error={e.batch_id}>
                                                <SelectInput
                                                    value={form.data.batch_id}
                                                    onChange={set('batch_id')}
                                                    options={batches.map((b) => ({
                                                        value: b.id,
                                                        label: `${b.name} (starts ${fmtDate(b.start_date)}${b.seats_left != null ? `, ${b.seats_left} seats left` : ''})`,
                                                    }))}
                                                />
                                            </Field>
                                        )}
                                    </div>

                                    {fee && (
                                        <Alert tone="blue" title="Fees for this course">
                                            Registration fee {money(fee.registration_fee)}, course fee {money(fee.course_fee)}
                                            {fee.installments?.length
                                                ? ` in ${fee.installments.length} parts (${fee.installments.map((p) => money(p.amount)).join(', ')})`
                                                : ''}
                                            . Fees are paid at the institute after the office confirms your application.
                                        </Alert>
                                    )}
                                </Reveal>

                                <Reveal as="section" className="space-y-5 rounded-2xl border border-navy-100 bg-white p-7 shadow-sm sm:p-9">
                                    <h2 className="text-xl font-bold text-navy">2. About you</h2>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field label="Full name" error={e.name}>
                                            <TextInput value={form.data.name} onChange={set('name')} required />
                                        </Field>
                                        <Field label="Phone" error={e.phone}>
                                            <TextInput value={form.data.phone} onChange={set('phone')} required />
                                        </Field>
                                        <Field label="WhatsApp number (optional)" error={e.whatsapp_number} help="Leave empty to use your phone number.">
                                            <TextInput value={form.data.whatsapp_number} onChange={set('whatsapp_number')} />
                                        </Field>
                                        <Field label="Email (optional)" error={e.email}>
                                            <TextInput type="email" value={form.data.email} onChange={set('email')} />
                                        </Field>
                                        <Field label="NIC number (optional)" error={e.nic}>
                                            <TextInput value={form.data.nic} onChange={set('nic')} />
                                        </Field>
                                        <Field label="Date of birth (optional)" error={e.date_of_birth}>
                                            <TextInput type="date" value={form.data.date_of_birth} onChange={set('date_of_birth')} />
                                        </Field>
                                        <Field label="Gender (optional)" error={e.gender}>
                                            <SelectInput
                                                value={form.data.gender}
                                                onChange={set('gender')}
                                                options={[
                                                    { value: 'male', label: 'Male' },
                                                    { value: 'female', label: 'Female' },
                                                    { value: 'other', label: 'Other' },
                                                ]}
                                            />
                                        </Field>
                                        <Field label="School (optional)" error={e.school}>
                                            <TextInput value={form.data.school} onChange={set('school')} />
                                        </Field>
                                    </div>
                                    <Field label="Address (optional)" error={e.address}>
                                        <TextArea rows={2} value={form.data.address} onChange={set('address')} />
                                    </Field>
                                </Reveal>

                                <Reveal as="section" className="space-y-5 rounded-2xl border border-navy-100 bg-white p-7 shadow-sm sm:p-9">
                                    <h2 className="text-xl font-bold text-navy">3. Parent or guardian (optional)</h2>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field label="Name" error={e.guardian_name}>
                                            <TextInput value={form.data.guardian_name} onChange={set('guardian_name')} />
                                        </Field>
                                        <Field label="Phone" error={e.guardian_phone}>
                                            <TextInput value={form.data.guardian_phone} onChange={set('guardian_phone')} />
                                        </Field>
                                    </div>
                                    <p className="text-sm leading-6 text-navy-500">
                                        The office may ask for your birth certificate and result sheets when you visit or send copies.
                                    </p>
                                </Reveal>

                                <div className="[&>*]:w-full sm:[&>*]:w-auto">
                                    <Button type="submit" variant="gold" size="lg" disabled={form.processing}>
                                        {form.processing ? 'Submitting...' : 'Submit Application'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Contact side card */}
                    <aside className="lg:col-span-4">
                        <Reveal delay={150} className="space-y-6 lg:sticky lg:top-8">
                            <div className="rounded-3xl bg-navy p-8 text-white shadow-xl">
                                <h2 className="text-xl font-bold">Prefer to talk first?</h2>
                                <p className="mt-3 text-sm leading-7 text-navy-200">
                                    Call or message our office, or visit the institute. We are happy to help you choose a course.
                                </p>

                                <ul className="mt-6 space-y-4 text-sm">
                                    <li className="flex gap-3">
                                        <Phone size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                                        <span>
                                            <a href="tel:+94112042717" className="hover:underline">+94 11 204 2717</a>
                                            <br />
                                            <a href="tel:+94712161381" className="hover:underline">+94 71 216 1381</a>
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <MessageCircle size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                                        <a href={WHATSAPP} target="_blank" rel="noreferrer" className="hover:underline">
                                            Message us on WhatsApp
                                        </a>
                                    </li>
                                    <li className="flex gap-3">
                                        <MapPin size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                                        <span>No. 774/C, Highlevel Road, Panagoda, Homagama</span>
                                    </li>
                                </ul>
                            </div>

                            <p className="rounded-2xl border border-navy-100 bg-white p-6 text-sm leading-7 text-navy-600">
                                <span className="font-bold text-navy">No account, no password.</span> IMDR does not use
                                student logins. Submitting this form is all you need to do.
                            </p>
                        </Reveal>
                    </aside>
                </div>
            </section>
        </>
    );
}