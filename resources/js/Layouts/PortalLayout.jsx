import { usePage } from '@inertiajs/react';
import {
    Award, BookOpen, CalendarDays, ClipboardList, CreditCard, FileText, FolderOpen, HelpCircle,
    Landmark, LayoutDashboard, Megaphone, MessageCircle, Receipt, BarChart3, Wallet, Banknote, Wallet2, UserCircle,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import PanelShell from './PanelShell';

/**
 * Portal layout = a switch. It looks at the logged-in user's role and shows that role's panel.
 *   super_admin / admin -> AdminLayout
 *   accountant / lecturer / student -> their own layout file if it exists
 *   (AccountantLayout.jsx, LecturerLayout.jsx, StudentLayout.jsx), otherwise the simple panel below.
 */

// Picks up the other role layouts only if those files exist (so a missing file never breaks the build).
const found = import.meta.glob(
    ['./*Layout.jsx', '!./PortalLayout.jsx', '!./AdminLayout.jsx', '!./PublicLayout.jsx'],
    { eager: true },
);
const pick = (name) => found[`./${name}.jsx`]?.default;

const theme = {
    sidebar: 'bg-navy text-navy-100',
    brand: 'text-white',
    sub: 'text-gold',
    heading: 'text-navy-300',
    item: 'text-navy-100 hover:bg-white/10 hover:text-white',
    active: 'bg-white/15 text-white',
    bar: 'bg-gold',
    badge: 'bg-gold text-navy',
    footer: 'border-white/10 text-navy-300',
    topAccent: 'border-gold',
};

const overview = { heading: 'Overview', items: [{ href: '/portal', label: 'Dashboard', icon: LayoutDashboard, exact: true }] };
const account = { heading: 'Account', items: [{ href: '/portal/profile', label: 'My profile', icon: UserCircle }] };

// Fallback menus (built from routes/web.php) for roles that do not have their own layout file yet.
const fallback = {
    accountant: {
        title: 'Accountant Panel',
        nav: [
            overview,
            {
                heading: 'Finance',
                items: [
                    { href: '/portal/invoices', label: 'Invoices', icon: Receipt },
                    { href: '/portal/payments', label: 'Payments', icon: CreditCard },
                    { href: '/portal/transactions', label: 'Online transactions', icon: Landmark },
                    { href: '/portal/whatsapp', label: 'WhatsApp receipts', icon: MessageCircle },
                    { href: '/portal/expenses', label: 'Expenses', icon: Wallet },
                    { href: '/portal/payroll', label: 'Payroll', icon: Banknote },
                    { href: '/portal/reports', label: 'Finance reports', icon: BarChart3 },
                ],
            },
            account,
        ],
    },
    lecturer: {
        title: 'Lecturer Panel',
        nav: [
            overview,
            {
                heading: 'Teaching',
                items: [
                    { href: '/portal/timetable', label: 'Timetable', icon: CalendarDays },
                    { href: '/portal/attendance', label: 'Attendance', icon: ClipboardList },
                    { href: '/portal/lms', label: 'Learning materials', icon: FolderOpen },
                    { href: '/portal/assignments', label: 'Assignments', icon: FileText },
                    { href: '/portal/quizzes', label: 'Quizzes', icon: HelpCircle },
                    { href: '/portal/announcements', label: 'Announcements', icon: Megaphone },
                ],
            },
            account,
        ],
    },
    student: {
        title: 'Student Panel',
        nav: [
            overview,
            {
                heading: 'My studies',
                items: [
                    { href: '/portal/my/courses', label: 'My courses', icon: BookOpen },
                    { href: '/portal/timetable', label: 'Timetable', icon: CalendarDays },
                    { href: '/portal/lms', label: 'Learning materials', icon: FolderOpen },
                    { href: '/portal/assignments', label: 'Assignments', icon: FileText },
                    { href: '/portal/quizzes', label: 'Quizzes', icon: HelpCircle },
                    { href: '/portal/my/records', label: 'My records', icon: ClipboardList },
                    { href: '/portal/my/certificates', label: 'My certificates', icon: Award },
                    { href: '/portal/announcements', label: 'Announcements', icon: Megaphone },
                ],
            },
            { heading: 'Payments', items: [{ href: '/portal/finance', label: 'Fees and payments', icon: Wallet2 }] },
            account,
        ],
    },
};

function FallbackLayout({ role, children }) {
    const cfg = fallback[role] ?? fallback.student;
    return (
        <PanelShell theme={theme} title={cfg.title} subtitle="IMDR portal" nav={cfg.nav}>
            {children}
        </PanelShell>
    );
}

const byRole = {
    super_admin: AdminLayout,
    admin: AdminLayout,
    accountant: pick('AccountantLayout'),
    lecturer: pick('LecturerLayout'),
    student: pick('StudentLayout'),
};

export default function PortalLayout({ children }) {
    const role = usePage().props.auth?.user?.role;
    const Layout = byRole[role];

    if (Layout) return <Layout>{children}</Layout>;
    return <FallbackLayout role={role}>{children}</FallbackLayout>;
}