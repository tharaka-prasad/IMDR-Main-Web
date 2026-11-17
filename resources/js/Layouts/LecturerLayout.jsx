import { BookOpen, CalendarDays, CalendarRange, ClipboardCheck, FileText, FolderOpen, HelpCircle, LayoutDashboard, Library, Megaphone, Trophy } from 'lucide-react';
import PanelShell from './PanelShell';

/** Lecturer panel: my classes, registers, learning content, marks. Nothing about money or the office. */
const theme = {
    sidebar: 'bg-brand-700 text-brand-50',
    brand: 'text-white',
    sub: 'text-gold-400',
    heading: 'text-brand-200',
    item: 'text-brand-50 hover:bg-white/10 hover:text-white',
    active: 'bg-white/20 text-white',
    bar: 'bg-gold',
    badge: 'bg-gold text-navy',
    footer: 'border-white/10 text-brand-200',
    topAccent: 'border-brand',
};

const nav = [
    { heading: 'Overview', items: [{ href: '/portal', label: 'Dashboard', icon: LayoutDashboard }] },
    {
        heading: 'My teaching',
        items: [
            { href: '/portal/timetable', label: 'My timetable', icon: CalendarDays },
            { href: '/portal/attendance', label: 'Class registers', icon: ClipboardCheck },
            { href: '/portal/manage/results', label: 'Results and marks', icon: Trophy },
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
        heading: 'Reference',
        items: [
            { href: '/portal/manage/subjects', label: 'Subjects', icon: Library },
            { href: '/portal/manage/batches', label: 'Batches', icon: CalendarRange },
        ],
    },
    { heading: 'Updates', items: [{ href: '/portal/announcements', label: 'Announcements', icon: Megaphone }] },
];

export default function LecturerLayout({ children }) {
    return (
        <PanelShell theme={theme} title="Lecturer Panel" subtitle="Teaching and marking" nav={nav}>
            {children}
        </PanelShell>
    );
}