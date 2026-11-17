import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Check, Copy, ExternalLink, KeyRound, LogOut, Menu, UserCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FlashMessages } from '../Components/ui';
import { cx } from '../lib';

/**
 * The frame every portal panel is built on: sidebar (drawer on phones), top bar, flash messages.
 * AdminLayout, LecturerLayout, StudentLayout and AccountantLayout each give it their own
 * menu, colours and name - so every role gets its own layout and sees only its own menu items.
 *
 * nav = [{ heading: 'Students', items: [{ href, label, icon, badge?, exact? }] }]
 */

const pathOf = (url) => (url || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

function isActive(url, item) {
    const here = pathOf(url);
    const target = pathOf(item.href);

    if (item.exact || target === '/portal') return here === target;

    return here === target || here.startsWith(target + '/');
}

function Brand({ theme, title, subtitle }) {
    return (
        <Link href="/portal" className="flex items-center gap-3 px-5 py-4">
            <span className="rounded-lg bg-white p-1">
                <img src="/images/logo.jpg" alt="IMDR" className="h-10 w-10 object-contain" />
            </span>
            <span className="leading-tight">
                <span className={cx('display-wide block text-lg', theme.brand)}>IMDR</span>
                <span className={cx('block text-xs font-semibold', theme.sub)}>{title}</span>
                {subtitle && <span className={cx('block text-[11px]', theme.heading)}>{subtitle}</span>}
            </span>
        </Link>
    );
}

function SideNav({ theme, nav, url, badges, onNavigate }) {
    return (
        <nav className="flex-1 overflow-y-auto px-3 pb-6" aria-label="Panel menu">
            {nav.map((group) => (
                <div key={group.heading} className="mt-4 first:mt-1">
                    <p className={cx('px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider', theme.heading)}>{group.heading}</p>
                    <ul className="space-y-0.5">
                        {group.items.map((item) => {
                            const active = isActive(url, item);
                            const Icon = item.icon;
                            const count = item.badge ? badges?.[item.badge] || 0 : 0;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onNavigate}
                                        aria-current={active ? 'page' : undefined}
                                        className={cx(
                                            'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                            active ? theme.active : theme.item
                                        )}
                                    >
                                        {active && <span className={cx('absolute inset-y-1.5 left-0 w-1 rounded-r-full', theme.bar)} aria-hidden="true" />}
                                        {Icon && <Icon size={17} className="shrink-0" aria-hidden="true" />}
                                        <span className="flex-1 truncate">{item.label}</span>
                                        {count > 0 && (
                                            <span className={cx('min-w-[1.25rem] rounded-full px-1.5 text-center text-[11px] font-bold leading-5', theme.badge)}>{count > 99 ? '99+' : count}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}

/** Username + password of a freshly registered student or a password reset. Shown once, right after the action. */
function Credentials() {
    const { flash } = usePage().props;
    const c = flash?.credentials;
    const [copied, setCopied] = useState(false);

    useEffect(() => setCopied(false), [c?.password]);

    if (!c) return null;

    const text = `IMDR login\nName: ${c.name}\nStudent ID: ${c.student_no}\nUsername: ${c.username}\nPassword: ${c.password}`;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
        } catch {
            window.prompt('Copy the login details:', text);
        }
    };

    return (
        <div className="mb-4 rounded-xl border-2 border-gold bg-gold-50 p-4" role="status">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="flex items-center gap-2 font-bold text-navy"><KeyRound size={16} /> Login details for {c.name}</p>
                    <p className="mt-0.5 text-xs text-navy-500">Give these to the student now. The password is not stored in readable form and will not be shown again.</p>
                </div>
                <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-700">
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                <div><dt className="text-xs text-navy-500">Student ID</dt><dd className="font-mono font-semibold">{c.student_no}</dd></div>
                <div><dt className="text-xs text-navy-500">Username</dt><dd className="font-mono font-semibold">{c.username}</dd></div>
                <div><dt className="text-xs text-navy-500">Password</dt><dd className="font-mono font-semibold">{c.password}</dd></div>
            </dl>
        </div>
    );
}

export default function PanelShell({ theme, title, subtitle, nav, banner, children }) {
    const page = usePage();
    const { auth, unread, badges } = page.props;
    const url = page.url;
    const [open, setOpen] = useState(false);

    useEffect(() => setOpen(false), [url]);

    useEffect(() => {
        const esc = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const logout = () => router.post('/logout');
    const roleText = (auth?.user?.role || '').replace('_', ' ');

    const side = (onNavigate) => (
        <>
            <Brand theme={theme} title={title} subtitle={subtitle} />
            <SideNav theme={theme} nav={nav} url={url} badges={badges} onNavigate={onNavigate} />
            <div className={cx('border-t px-4 py-3 text-[11px]', theme.footer)}>&copy; {new Date().getFullYear()} IMDR</div>
        </>
    );

    return (
        <div className="min-h-screen bg-paper">
            <a href="#panel-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-gold focus:px-3 focus:py-2">Skip to content</a>

            {/* Desktop sidebar */}
            <aside className={cx('no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col lg:flex', theme.sidebar)}>{side(undefined)}</aside>

            {/* Phone / tablet drawer */}
            <div className={cx('no-print fixed inset-0 z-50 lg:hidden', open ? '' : 'pointer-events-none')} aria-hidden={!open}>
                <div className={cx('absolute inset-0 bg-navy/60 transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')} onClick={() => setOpen(false)} />
                <aside className={cx('absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col shadow-xl transition-transform duration-200', theme.sidebar, open ? 'translate-x-0' : '-translate-x-full')}>
                    <button type="button" onClick={() => setOpen(false)} className="absolute right-2 top-2 rounded-md p-2 opacity-80 hover:opacity-100" aria-label="Close menu" tabIndex={open ? 0 : -1}>
                        <X size={18} />
                    </button>
                    {side(() => setOpen(false))}
                </aside>
            </div>

            <div className="flex min-h-screen flex-col lg:pl-64">
                <header className={cx('no-print sticky top-0 z-20 flex items-center gap-3 border-b-2 bg-white/95 px-4 py-2.5 backdrop-blur sm:px-6', theme.topAccent)}>
                    <button type="button" onClick={() => setOpen(true)} className="rounded-md p-2 text-navy hover:bg-navy-50 lg:hidden" aria-label="Open menu" aria-expanded={open}>
                        <Menu size={20} />
                    </button>
                    <p className="flex-1 truncate text-sm font-semibold text-navy">{title}</p>

                    <a href="/" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50 sm:inline-flex">
                        <ExternalLink size={14} /> Website
                    </a>

                    <Link href="/portal/notifications" className="relative rounded-lg p-2 text-navy hover:bg-navy-50" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
                        <Bell size={19} />
                        {unread > 0 && <span className="absolute right-0.5 top-0.5 min-w-[1.1rem] rounded-full bg-red-600 px-1 text-center text-[10px] font-bold leading-[1.1rem] text-white">{unread > 99 ? '99+' : unread}</span>}
                    </Link>

                    <Link href="/portal/profile" className="hidden items-center gap-2 rounded-lg px-2 py-1 hover:bg-navy-50 sm:flex" aria-label="My profile">
                        <UserCircle size={26} className="text-navy-400" />
                        <span className="text-left leading-tight">
                            <span className="block max-w-[10rem] truncate text-sm font-semibold text-navy">{auth?.user?.name}</span>
                            <span className="block text-[11px] capitalize text-navy-400">{roleText}</span>
                        </span>
                    </Link>

                    <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy-50">
                        <LogOut size={14} /> <span className="hidden sm:inline">Log out</span>
                    </button>
                </header>

                <main id="panel-main" className="flex-1 px-4 py-6 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        {banner}
                        <FlashMessages />
                        <Credentials />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
