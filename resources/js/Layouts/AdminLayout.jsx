import { usePage } from '@inertiajs/react';
import {
    Award, BarChart3, BookOpen, CalendarCheck, CalendarDays, ClipboardCheck, ClipboardList, CreditCard, DoorOpen, FileText, FolderOpen, GraduationCap,
    HelpCircle, Inbox, LayoutDashboard, Layers, Library, Link2, Megaphone, Newspaper, Receipt, ScrollText, Send, Settings, ShieldCheck, Tags, Trophy,
    UserPlus, Users, Wallet, Wallet2, Banknote, MessageCircle, CalendarRange, Landmark,
} from 'lucide-react';
import PanelShell from './PanelShell';

/** Admin panel (admins and the super admin). The super admin also gets Finance and System. */
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

const base = [
    { heading: 'Overview', items: [{ href: '/portal', label: 'Dashboard', icon: LayoutDashboard }] },
    {
        heading: 'Students',
        items: [
            { href: '/portal/students/create', label: 'Register a student', icon: UserPlus, exact: true },
            { href: '/portal/students', label: 'All students', icon: Users },
            { href: '/portal/registrations', label: 'Registrations', icon: ClipboardCheck, badge: 'registrations' },
            { href: '/portal/messages', label: 'Messages to students', icon: Send },
            { href: '/portal/certificates', label: 'Certificates', icon: Award },
        ],
    },
    {
        heading: 'Academic',
        items: [
            { href: '/portal/courses', label: 'Courses', icon: BookOpen },
            { href: '/portal/manage/course-types', label: 'Course types', icon: Layers },
            { href: '/portal/manage/subjects', label: 'Subjects', icon: Library },
            { href: '/portal/manage/batches', label: 'Batches', icon: CalendarRange },
            { href: '/portal/manage/classrooms', label: 'Classrooms', icon: DoorOpen },
            { href: '/portal/timetable', label: 'Timetable', icon: CalendarDays },
            { href: '/portal/attendance-report', label: 'Attendance report', icon: ClipboardList },
            { href: '/portal/manage/results', label: 'Results', icon: Trophy },
        ],
    },
    {
        heading: 'Lecturers',
        items: [
            { href: '/portal/manage/lecturers', label: 'Lecturers', icon: GraduationCap },
            { href: '/portal/manage/teaching-assignments', label: 'Teaching assignments', icon: Link2 },
        ],
    },
    {
        heading: 'Learning (LMS)',
        items: [
            { href: '/portal/lms', label: 'Learning materials', icon: FolderOpen },
            { href: '/portal/assignments', label: 'Assignments', icon: FileText },
            { href: '/portal/quizzes', label: 'Quizzes', icon: HelpCircle },
        ],
    },
    {
        heading: 'Communication and website',
        items: [
            { href: '/portal/manage/announcements', label: 'Announcements', icon: Megaphone },
            { href: '/portal/manage/contact-messages', label: 'Website messages', icon: Inbox, badge: 'website_messages' },
            { href: '/portal/manage/posts', label: 'News, events and media', icon: Newspaper },
        ],
    },
    { heading: 'Reports', items: [{ href: '/portal/reports', label: 'Finance reports', icon: BarChart3 }] },
];

const finance = {
    heading: 'Finance (super admin)',
    items: [
        { href: '/portal/invoices', label: 'Invoices', icon: Receipt },
        { href: '/portal/payments', label: 'Payments', icon: CreditCard },
        { href: '/portal/transactions', label: 'Online transactions', icon: Landmark },
        { href: '/portal/whatsapp', label: 'WhatsApp receipts', icon: MessageCircle },
        { href: '/portal/expenses', label: 'Expenses', icon: Wallet },
        { href: '/portal/manage/expense-categories', label: 'Expense categories', icon: Tags },
        { href: '/portal/payroll', label: 'Payroll', icon: Banknote },
        { href: '/portal/manage/salary-rules', label: 'Salary rules', icon: Wallet2 },
    ],
};

const system = {
    heading: 'System (super admin)',
    items: [
        { href: '/portal/manage/users', label: 'Staff accounts', icon: ShieldCheck },
        { href: '/portal/settings', label: 'Settings', icon: Settings },
        { href: '/portal/manage/audit-logs', label: 'Audit log', icon: ScrollText },
    ],
};

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const isSuper = auth?.user?.role === 'super_admin';
    const nav = isSuper ? [...base, finance, system] : base;

    return (
        <PanelShell theme={theme} title="Admin Panel" subtitle={isSuper ? 'Super admin' : 'Institute office'} nav={nav}>
            {children}
        </PanelShell>
    );
}
