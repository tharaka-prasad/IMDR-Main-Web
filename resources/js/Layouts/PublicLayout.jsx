import { Link, usePage } from '@inertiajs/react';
import { Clock, Lock, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, FlashMessages } from '../Components/ui';
import { cx } from '../lib';

const links = [
    ['/about', 'About'],
    ['/courses', 'Courses'],
    ['/news', 'News'],
    ['/events', 'Events'],
    ['/research', 'Research'],
    ['/media', 'Media'],
    ['/contact', 'Contact'],
];

const WA = 'https://wa.me/94706766651?text=' + encodeURIComponent('Hello IMDR, I would like to know more about your courses.');

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
    const active = (href) => url === href || url.startsWith(href + '/') || url.startsWith(href + '?');

    // Shrink the header and fill the progress bar as the page scrolls
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setScrolled(y > 12);
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

    return (
        <div className="flex min-h-screen flex-col">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-gold focus:px-3 focus:py-2">
                Skip to content
            </a>

            <header className={cx('sticky top-0 z-40 bg-white/90 backdrop-blur-md transition-shadow duration-300', scrolled ? 'shadow-[0_8px_24px_-12px_rgba(10,25,60,0.35)]' : 'border-b border-navy-100')}>
                {/* Top info strip - folds away on scroll */}
                <div className={cx('hidden grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none lg:grid', scrolled ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]')}>
                    <div className="overflow-hidden bg-navy text-xs text-navy-200">
                        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
                            <span className="flex items-center gap-2"><Clock size={13} className="text-gold" /> Mon – Sat, 8:30 AM – 5:00 PM</span>
                            <span className="flex items-center gap-5">
                                <a href="tel:+94112042717" className="flex items-center gap-1.5 hover:text-gold"><Phone size={13} /> +94 11 204 2717</a>
                                <a href="mailto:info@imdr.lk" className="flex items-center gap-1.5 hover:text-gold"><Mail size={13} /> info@imdr.lk</a>
                            </span>
                        </div>
                    </div>
                </div>

                <div className={cx('mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[padding] duration-300 motion-reduce:transition-none sm:px-6', scrolled ? 'py-1.5' : 'py-3')}>
                    <Link href="/" className="group flex items-center gap-3" aria-label="IMDR home">
                        <img
                            src="/images/logo.jpg"
                            alt="IMDR - Institute of Media Development and Research"
                            className={cx('object-contain transition-all duration-300 group-hover:rotate-[-4deg] group-hover:scale-105 motion-reduce:transition-none', scrolled ? 'h-10 w-10' : 'h-14 w-14')}
                        />
                        <span className="hidden leading-tight sm:block">
                            <span className="display-wide block text-lg text-navy">IMDR</span>
                            <span className={cx('block overflow-hidden text-xs text-navy-500 transition-all duration-300 motion-reduce:transition-none', scrolled ? 'max-h-0 opacity-0' : 'max-h-5 opacity-100')}>
                                Institute of Media Development and Research
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden items-center lg:flex" aria-label="Main">
                        {links.map(([href, text]) => (
                            <Link
                                key={href}
                                href={href}
                                aria-current={active(href) ? 'page' : undefined}
                                className={cx('group relative px-3.5 py-2 text-sm font-medium transition-colors duration-200', active(href) ? 'text-brand' : 'text-navy-700 hover:text-navy')}
                            >
                                {text}
                                <span
                                    className={cx(
                                        'absolute inset-x-3.5 bottom-0.5 h-0.5 origin-left rounded-full bg-gold transition-transform duration-300 ease-out motion-reduce:transition-none',
                                        active(href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                                    )}
                                />
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        {auth?.user ? (
                            <Button href="/portal" variant="primary" size="sm">Open my portal</Button>
                        ) : (
                            // Login is for registered students and staff only, so it stays a quiet link
                            <Link href="/login" className="flex items-center gap-1.5 text-sm text-navy-500 transition-colors hover:text-navy">
                                <Lock size={14} /> Student login
                            </Link>
                        )}
                        <a
                            href={WA}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-[#06361a] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 motion-reduce:transition-none"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-white/30 skew-x-12 transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden" />
                            <WhatsAppIcon />
                            <span className="relative">WhatsApp us</span>
                        </a>
                    </div>

                    <button type="button" className="relative h-10 w-10 rounded-md text-navy lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
                        <Menu className={cx('absolute inset-0 m-auto transition-all duration-300 motion-reduce:transition-none', open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100')} />
                        <X className={cx('absolute inset-0 m-auto transition-all duration-300 motion-reduce:transition-none', open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0')} />
                    </button>
                </div>

                {/* Mobile menu - slides down, items stagger in */}
                <div className={cx('grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none lg:hidden', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <nav className="overflow-hidden bg-white" aria-label="Mobile" aria-hidden={!open}>
                        <div className="grid gap-1 border-t border-navy-100 px-4 py-3">
                            {links.map(([href, text], i) => (
                                <Link
                                    key={href}
                                    href={href}
                                    tabIndex={open ? 0 : -1}
                                    style={{ transitionDelay: open ? `${60 + i * 40}ms` : '0ms' }}
                                    className={cx(
                                        'rounded-md border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-300 motion-reduce:transition-none',
                                        open ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0',
                                        active(href) ? 'border-gold bg-navy-50 text-brand' : 'border-transparent text-navy-700 hover:bg-navy-50',
                                    )}
                                >
                                    {text}
                                </Link>
                            ))}
                            <div className="mt-2 flex items-center gap-3">
                                <a href={WA} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-[#06361a]">
                                    <WhatsAppIcon /> WhatsApp us
                                </a>
                                {auth?.user ? (
                                    <Button href="/portal" size="sm">Open my portal</Button>
                                ) : (
                                    <Link href="/login" tabIndex={open ? 0 : -1} className="flex items-center gap-1.5 px-2 text-sm text-navy-500">
                                        <Lock size={14} /> Student login
                                    </Link>
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
                <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 empty:hidden">
                    <FlashMessages />
                </div>
                {children}
            </main>

            <footer className="bg-navy text-navy-200">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-white p-1"><img src="/images/logo.jpg" alt="" className="h-14 w-14 object-contain" /></span>
                            <div>
                                <p className="display-wide text-xl text-white">IMDR</p>
                                <p className="text-sm">Research. Educate. Empower.</p>
                            </div>
                        </div>
                        <p className="mt-4 max-w-md text-sm text-navy-300">
                            Media education, digital skills, research and community development. Building knowledge, developing skills and empowering society.
                        </p>
                    </div>
                    <div>
                        <p className="mb-3 font-semibold text-white">Explore</p>
                        <ul className="space-y-2 text-sm">
                            {[['/courses', 'All courses'], ['/about', 'About IMDR'], ['/verify', 'Verify a certificate'], ['/login', 'Student and staff login']].map(([h, t]) => (
                                <li key={h}><Link href={h} className="transition-colors hover:text-gold">{t}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="mb-3 font-semibold text-white">Contact</p>
                        <ul className="space-y-2 text-sm">
                            <li><a href="mailto:info@imdr.lk" className="flex items-center gap-2 hover:text-gold"><Mail size={14} /> info@imdr.lk</a></li>
                            <li><a href="tel:+94112042717" className="flex items-center gap-2 hover:text-gold"><Phone size={14} /> +94 11 204 2717</a></li>
                            <li><a href={WA} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold"><WhatsAppIcon size={14} /> 070 676 6651</a></li>
                            <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> No. 774/C, Highlevel Road, Panagoda, Homagama</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-navy-700 py-4 text-center text-xs text-navy-400">
                    &copy; {new Date().getFullYear()} Institute of Media Development and Research
                </div>
            </footer>
        </div>
    );
}