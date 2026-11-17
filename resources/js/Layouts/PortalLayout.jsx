import { Link, usePage } from '@inertiajs/react';
import { Clock, Globe, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, FlashMessages } from '../Components/ui';
import { cx } from '../lib';

const links = [
    ['/', 'Home'],
    ['/about', 'About IMDR'],
    ['/courses', 'Courses'],
    ['/news', 'News'],
    ['/events', 'Events'],
    ['/research', 'Research'],
    ['/media', 'Media'],
    ['/contact', 'Contact Us'],
];

const quickLinks = [
    ['/about', 'About IMDR'],
    ['/courses', 'Explore 18 Courses'],
    ['/apply', 'Submit Student Application'],
    ['/media', 'Media Showcase'],
    ['/contact', 'Contact Us'],
];

const WA_NUMBER = '94712161381';
const WA = `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent('Hello IMDR, I would like to know more about your courses.');

function WhatsAppIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.1L2 22l5.05-1.55A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .92.98-2.92-.2-.31A8.2 8.2 0 1 1 12.04 20.1Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.42.06-.64.3-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64 1.53.66 2.13.72 2.9.6.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
        </svg>
    );
}

export default function PublicLayout({ children }) {
    const page = usePage();
    const { auth } = page.props;
    const url = page.url;
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const bar = useRef(null);

    const active = (href) => (href === '/' ? url === '/' || url.startsWith('/?') : url === href || url.startsWith(href + '/') || url.startsWith(href + '?'));

    // Shrink the header and fill the progress bar as the page scrolls
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setScrolled((prev) => (prev ? y > 4 : y > 40));
            if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [url]);

    useEffect(() => setOpen(false), [url]);

    useEffect(() => {
        const esc = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, []);

    // Do not let the page scroll behind the open mobile menu
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <div className="flex min-h-screen flex-col">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-gold focus:px-3 focus:py-2">
                Skip to content
            </a>

            {/* Top info strip - normal page content, scrolls away with the page */}
            <div className="hidden bg-navy text-xs text-navy-200 lg:block">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
                    <span className="flex items-center gap-2"><Clock size={13} className="text-gold" /> Mon – Sat, 8:30 AM – 5:00 PM</span>
                    <span className="flex items-center gap-5">
                        <a href="tel:+94112042717" className="flex items-center gap-1.5 hover:text-gold"><Phone size={13} /> +94 11 204 2717</a>
                        <a href="mailto:info@imdr.lk" className="flex items-center gap-1.5 hover:text-gold"><Mail size={13} /> info@imdr.lk</a>
                    </span>
                </div>
            </div>

            <header className={cx('sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md transition-[box-shadow,border-color] duration-500 ease-out', scrolled ? 'border-transparent shadow-[0_8px_24px_-12px_rgba(10,25,60,0.35)]' : 'border-navy-100')}>
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
                    <Link href="/" className="group flex items-center gap-3" aria-label="IMDR home">
                        <img
                            src="/images/logo.jpg"
                            alt="IMDR - Institute of Media Development and Research"
                            className={cx('h-12 w-12 origin-left object-contain transition-transform duration-500 ease-out group-hover:-rotate-3 motion-reduce:transition-none sm:h-14 sm:w-14', scrolled ? 'scale-[0.85]' : 'scale-100')}
                        />
                        <span className="hidden leading-tight sm:block">
                            <span className="display-wide block text-lg text-navy">IMDR</span>
                            <span className={cx('block text-xs text-navy-500 transition-opacity duration-500 motion-reduce:transition-none', scrolled ? 'opacity-0' : 'opacity-100')}>
                                Institute of Media Development and Research
                            </span>
                        </span>
                    </Link>

                    {/* Desktop navigation (menu button is used below 1280px so nothing is squeezed) */}
                    <nav className="hidden items-center xl:flex" aria-label="Main">
                        {links.map(([href, text]) => (
                            <Link
                                key={href}
                                href={href}
                                aria-current={active(href) ? 'page' : undefined}
                                className={cx('group relative whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors duration-200', active(href) ? 'text-brand' : 'text-navy-700 hover:text-navy')}
                            >
                                {text}
                                <span
                                    className={cx(
                                        'absolute inset-x-3 bottom-0.5 h-0.5 origin-left rounded-full bg-gold transition-transform duration-300 ease-out motion-reduce:transition-none',
                                        active(href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                                    )}
                                />
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 xl:flex">
                        {auth?.user ? (
                            <Button href="/portal" variant="primary" size="sm">Open my portal</Button>
                        ) : (
                            <Button href="/apply" variant="gold" size="sm">Apply Now</Button>
                        )}
                        <a
                            href={WA}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-[#06361a] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 motion-reduce:transition-none"
                        >
                            <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden" />
                            <WhatsAppIcon />
                            <span className="relative">WhatsApp us</span>
                        </a>
                    </div>

                    {/* Tablet / phone: Apply + menu button */}
                    <div className="flex items-center gap-2 xl:hidden">
                        {!auth?.user && (
                            <span className="hidden sm:block">
                                <Button href="/apply" variant="gold" size="sm">Apply Now</Button>
                            </span>
                        )}
                        <button type="button" className="relative h-11 w-11 rounded-md text-navy" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
                            <Menu className={cx('absolute inset-0 m-auto transition-all duration-300 motion-reduce:transition-none', open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100')} />
                            <X className={cx('absolute inset-0 m-auto transition-all duration-300 motion-reduce:transition-none', open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0')} />
                        </button>
                    </div>
                </div>

                {/* Mobile menu - slides down, items stagger in */}
                <div className={cx('grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none xl:hidden', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <nav className="overflow-hidden bg-white" aria-label="Mobile" aria-hidden={!open}>
                        <div className="grid max-h-[calc(100vh-5rem)] gap-1 overflow-y-auto border-t border-navy-100 px-4 py-3">
                            {links.map(([href, text], i) => (
                                <Link
                                    key={href}
                                    href={href}
                                    tabIndex={open ? 0 : -1}
                                    style={{ transitionDelay: open ? `${60 + i * 40}ms` : '0ms' }}
                                    className={cx(
                                        'rounded-md border-l-4 px-3 py-3 text-base font-medium transition-all duration-300 motion-reduce:transition-none',
                                        open ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0',
                                        active(href) ? 'border-gold bg-navy-50 text-brand' : 'border-transparent text-navy-700 hover:bg-navy-50',
                                    )}
                                >
                                    {text}
                                </Link>
                            ))}

                            <div className="mt-3 grid gap-3 pb-2 sm:grid-cols-2">
                                <a
                                    href={WA}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    tabIndex={open ? 0 : -1}
                                    className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-[#06361a]"
                                >
                                    <WhatsAppIcon /> WhatsApp us
                                </a>
                                {auth?.user ? (
                                    <Button href="/portal">Open my portal</Button>
                                ) : (
                                    <Button href="/apply" variant="gold">Apply Now</Button>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>

                {/* Scroll progress */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-transparent">
                    <div ref={bar} className="h-full origin-left scale-x-0 bg-gold" />
                </div>
            </header>

            <main id="main" className="flex-1">
                <div className="mx-auto max-w-7xl px-4 pt-4 empty:hidden sm:px-6">
                    <FlashMessages />
                </div>
                {children}
            </main>

            {/* Floating WhatsApp button for phones and tablets */}
            <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with IMDR on WhatsApp"
                className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-[#06361a] shadow-xl transition-transform duration-200 hover:-translate-y-1 xl:hidden"
            >
                <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 motion-reduce:hidden" aria-hidden="true" />
                <span className="relative"><WhatsAppIcon size={28} /></span>
            </a>

            <footer className="bg-navy text-navy-200">
                <div className="h-1 bg-gradient-to-r from-gold via-brand to-gold" aria-hidden="true" />

                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-white p-1"><img src="/images/logo.jpg" alt="" className="h-14 w-14 object-contain" /></span>
                            <div>
                                <p className="display-wide text-xl text-white">IMDR</p>
                                <p className="text-sm">Institute of Media Development and Research</p>
                            </div>
                        </div>
                        <p className="mt-5 font-semibold text-gold">Research. Educate. Empower.</p>
                        <p className="mt-3 max-w-md text-sm leading-7 text-navy-300">
                            Empowering the next generation with practical media literacy, technology, and digital skills.
                        </p>
                    </div>

                    <div className="lg:col-span-3">
                        <p className="mb-4 font-semibold text-white">Quick Links</p>
                        <ul className="space-y-3 text-sm">
                            {quickLinks.map(([h, t]) => (
                                <li key={h}><Link href={h} className="inline-block transition hover:translate-x-1 hover:text-gold">{t}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-4">
                        <p className="mb-4 font-semibold text-white">Connect &amp; Location</p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" /> No. 774/C, Highlevel Road, Panagoda, Homagama</li>
                            <li className="flex items-start gap-3">
                                <Phone size={16} className="mt-0.5 shrink-0 text-gold" />
                                <span>
                                    <a href="tel:+94112042717" className="hover:text-gold">011 204 2717</a>
                                    <span className="mx-2 text-navy-500">|</span>
                                    <a href="tel:+94712161381" className="hover:text-gold">0712 161 381</a>
                                </span>
                            </li>
                            <li>
                                <a href={WA} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-gold">
                                    <span className="mt-0.5 shrink-0 text-gold"><WhatsAppIcon size={16} /></span> WhatsApp: Direct Message (+94 71 216 1381)
                                </a>
                            </li>
                            <li><a href="mailto:info@imdr.lk" className="flex items-start gap-3 hover:text-gold"><Mail size={16} className="mt-0.5 shrink-0 text-gold" /> info@imdr.lk</a></li>
                            <li><a href="https://imdr.lk" className="flex items-start gap-3 hover:text-gold"><Globe size={16} className="mt-0.5 shrink-0 text-gold" /> www.imdr.lk</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-navy-700 px-4 py-5 text-center text-xs text-navy-400">
                    &copy; {new Date().getFullYear()} Institute of Media Development and Research (IMDR). All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
