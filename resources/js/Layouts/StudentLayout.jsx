import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Award, BookOpen, CalendarDays, ClipboardList, CreditCard, FileText, FolderOpen, HelpCircle, LayoutDashboard, Megaphone } from 'lucide-react';
import { money } from '../lib';
import PanelShell from './PanelShell';

/** Student panel: my courses, learning, records, fees. Nothing from the office, lecturer or finance panels. */
const theme = {
    sidebar: 'border-r border-navy-100 bg-white text-navy-700',
    brand: 'text-navy',
    sub: 'text-brand',
    heading: 'text-navy-400',
    item: 'text-navy-600 hover:bg-navy-50 hover:text-navy',
    active: 'bg-brand-50 text-brand-700',
    bar: 'bg-brand',
    badge: 'bg-brand text-white',
    footer: 'border-navy-100 text-navy-400',
    topAccent: 'border-brand',
};

const nav = [
    { heading: 'Overview', items: [{ href: '/portal', label: 'Dashboard', icon: LayoutDashboard }] },
    {
        heading: 'Learning',
        items: [
            { href: '/portal/my/courses', label: 'My courses', icon: BookOpen },
            { href: '/portal/lms', label: 'Learning materials', icon: FolderOpen },
            { href: '/portal/assignments', label: 'Assignments', icon: FileText },
            { href: '/portal/quizzes', label: 'Quizzes', icon: HelpCircle },
            { href: '/portal/timetable', label: 'Timetable', icon: CalendarDays },
        ],
    },
    {
        heading: 'My records',
        items: [
            { href: '/portal/my/records', label: 'Attendance and results', icon: ClipboardList },
            { href: '/portal/my/certificates', label: 'Certificates', icon: Award },
            { href: '/portal/finance', label: 'Fees and payments', icon: CreditCard },
        ],
    },
    { heading: 'Updates', items: [{ href: '/portal/announcements', label: 'Announcements', icon: Megaphone }] },
];

/** Shown on every page while the learning area is paused (payment delay, or registration not approved yet). */
function AccessBanner() {
    const page = usePage();
    const { access } = page.props;
    const here = page.url;

    if (!access || access.allowed || here.startsWith('/portal/finance')) return null;

    if (access.reason === 'payment_delay') {
        return (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
                <span className="flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>Learning material, assignments and quizzes are paused because of a delayed payment ({money(access.overdue_total)} overdue).</span>
                </span>
                <Link href="/portal/finance" className="rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-navy hover:bg-gold-400">Pay now</Link>
            </div>
        );
    }

    if (access.reason === 'pending_approval') {
        return (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-gold-400 bg-gold-50 px-4 py-3 text-sm text-navy" role="status">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>Your registration is waiting for approval. The learning area opens as soon as the office approves it.</span>
            </div>
        );
    }

    return null;
}

export default function StudentLayout({ children }) {
    return (
        <PanelShell theme={theme} title="Student Panel" subtitle="My learning" nav={nav} banner={<AccessBanner />}>
            {children}
        </PanelShell>
    );
}
