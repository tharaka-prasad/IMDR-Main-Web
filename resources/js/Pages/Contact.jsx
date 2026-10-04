import { Head, useForm } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button, Field, FormError, TextArea, TextInput } from '../Components/ui';

const WHATSAPP_NUMBER = '94706766651'; // 070 676 6651 in international format, no "+"
const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

function WhatsAppIcon({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.1L2 22l5.05-1.55A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .92.98-2.92-.2-.31A8.2 8.2 0 1 1 12.04 20.1Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.42.06-.64.3-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64 1.53.66 2.13.72 2.9.6.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
        </svg>
    );
}

const details = [
    { icon: MapPin, label: 'Visit us', value: 'No. 774/C, Highlevel Road, Panagoda, Homagama, Sri Lanka', href: 'https://maps.google.com/?q=774/C+Highlevel+Road+Panagoda+Homagama' },
    { icon: Phone, label: 'Call the office', value: '+94 11 204 2717', href: 'tel:+94112042717' },
    { icon: Phone, label: 'Call the office', value: '+94 71 216 1381', href: 'tel:+94712161381' },
    { icon: Mail, label: 'Email', value: 'info@imdr.lk', href: 'mailto:info@imdr.lk' },
];

export default function Contact() {
    const form = useForm({ name: '', email: '', phone: '', subject: '', message: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post('/contact', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    // Opens WhatsApp chat with our number, pre-filled with whatever the visitor has typed so far
    const sendViaWhatsApp = () => {
        const { name, subject, message, phone } = form.data;
        const lines = [
            'Hello IMDR,',
            name && `My name is ${name}.`,
            subject && `Subject: ${subject}`,
            message || 'I would like to know more about your courses.',
            phone && `My number: ${phone}`,
        ].filter(Boolean);
        window.open(waLink(lines.join('\n')), '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <Head title="Contact" />

            {/* Hero */}
            <section className="bg-navy text-white">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                    <p className="text-gold">Get in touch with IMDR</p>
                    <h1 className="display-wide mt-3 max-w-3xl text-4xl leading-tight sm:text-6xl">Contact us</h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
                        Have questions about our 18 specialized courses, G.C.E. A/L programs, or workshop schedules? Reach our
                        administrative team, or message us directly on WhatsApp. We are here to guide your educational journey.
                    </p>

                    <a
                        href={waLink('Hello IMDR, I would like to know more about your courses.')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-8 inline-flex items-center gap-4 rounded-2xl bg-[#25D366] px-6 py-4 text-[#06361a] shadow-lg shadow-black/20 transition hover:bg-[#2fe173] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
                    >
                        <WhatsAppIcon size={34} />
                        <span className="text-left">
                            <span className="block text-lg font-semibold leading-tight">Chat with us on WhatsApp</span>
                            <span className="block text-sm opacity-80">070 676 6651 · replies during office hours</span>
                        </span>
                    </a>
                </div>
            </section>

            {/* Body */}
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5">
                {/* Details */}
                <aside className="lg:col-span-2">
                    <h2 className="display-wide text-2xl text-navy">Reach the office</h2>
                    <ul className="mt-6 divide-y divide-navy-100 border-y border-navy-100">
                        {details.map(({ icon: Icon, label, value, href }) => (
                            <li key={value}>
                                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-start gap-4 py-4 transition hover:bg-navy-50/60">
                                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-gold">
                                        <Icon size={18} />
                                    </span>
                                    <span>
                                        <span className="block text-sm text-navy-600">{label}</span>
                                        <span className="block font-medium text-navy">{value}</span>
                                    </span>
                                </a>
                            </li>
                        ))}
                        <li>
                            <a href={waLink('Hello IMDR')} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 py-4 transition hover:bg-navy-50/60">
                                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-[#06361a]">
                                    <WhatsAppIcon size={20} />
                                </span>
                                <span>
                                    <span className="block text-sm text-navy-600">Official WhatsApp line</span>
                                    <span className="block font-medium text-navy">070 676 6651 / +94 70 676 6651</span>
                                </span>
                            </a>
                        </li>
                    </ul>

                    <div className="mt-6 flex items-start gap-4 rounded-xl bg-navy-50 p-5">
                        <Clock size={20} className="mt-1 shrink-0 text-brand" />
                        <dl className="space-y-2 text-navy-700">
                            <div>
                                <dt className="text-sm text-navy-600">Monday – Saturday</dt>
                                <dd className="font-medium text-navy">8:30 AM – 5:00 PM</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-navy-600">Sunday</dt>
                                <dd className="font-medium text-navy">Special academic sessions and workshops</dd>
                            </div>
                        </dl>
                    </div>
                </aside>

                {/* Form */}
                <form onSubmit={submit} className="space-y-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
                    <div>
                        <h2 className="display-wide text-2xl text-navy">Send us a message</h2>
                        <p className="mt-1 text-navy-600">Ask about a course, fees or registration. The office will reply to you.</p>
                    </div>

                    <FormError errors={form.errors} />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Your name" error={form.errors.name}><TextInput value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required /></Field>
                        <Field label="Email" error={form.errors.email}><TextInput type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required /></Field>
                        <Field label="Phone" error={form.errors.phone}><TextInput value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} /></Field>
                        <Field label="Subject" error={form.errors.subject}><TextInput value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} /></Field>
                    </div>
                    <Field label="Message" error={form.errors.message}><TextArea rows={6} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} required /></Field>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button type="submit" variant="gold" disabled={form.processing}>
                            <Send size={16} className="mr-2 inline" />
                            {form.processing ? 'Sending...' : 'Send message'}
                        </Button>
                        <button
                            type="button"
                            onClick={sendViaWhatsApp}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#25D366] px-5 py-2.5 font-semibold text-[#128C4A] transition hover:bg-[#25D366] hover:text-[#06361a] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
                        >
                            <WhatsAppIcon size={18} />
                            Send on WhatsApp
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}