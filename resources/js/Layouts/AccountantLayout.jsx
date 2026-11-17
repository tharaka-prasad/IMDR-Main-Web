import { Banknote, BarChart3, CreditCard, Landmark, LayoutDashboard, Megaphone, MessageCircle, Receipt, Tags, Wallet, Wallet2 } from 'lucide-react';
import PanelShell from './PanelShell';

/** Accountant panel: invoices, payments, expenses, payroll and finance reports only. */
const theme = {
    sidebar: 'bg-emerald-900 text-emerald-50',
    brand: 'text-white',
    sub: 'text-gold-400',
    heading: 'text-emerald-300',
    item: 'text-emerald-100 hover:bg-white/10 hover:text-white',
    active: 'bg-white/15 text-white',
    bar: 'bg-gold',
    badge: 'bg-gold text-navy',
    footer: 'border-white/10 text-emerald-300',
    topAccent: 'border-emerald-600',
};

const nav = [
    { heading: 'Overview', items: [{ href: '/portal', label: 'Dashboard', icon: LayoutDashboard }] },
    {
        heading: 'Fees and payments',
        items: [
            { href: '/portal/invoices', label: 'Invoices', icon: Receipt },
            { href: '/portal/payments', label: 'Payments and refunds', icon: CreditCard },
            { href: '/portal/transactions', label: 'Online transactions', icon: Landmark, badge: 'transactions' },
            { href: '/portal/whatsapp', label: 'WhatsApp receipts', icon: MessageCircle },
        ],
    },
    {
        heading: 'Spending',
        items: [
            { href: '/portal/expenses', label: 'Expenses', icon: Wallet },
            { href: '/portal/manage/expense-categories', label: 'Expense categories', icon: Tags },
            { href: '/portal/payroll', label: 'Payroll', icon: Banknote },
            { href: '/portal/manage/salary-rules', label: 'Salary rules', icon: Wallet2 },
        ],
    },
    { heading: 'Reports', items: [{ href: '/portal/reports', label: 'Finance reports', icon: BarChart3 }] },
    { heading: 'Updates', items: [{ href: '/portal/announcements', label: 'Announcements', icon: Megaphone }] },
];

export default function AccountantLayout({ children }) {
    return (
        <PanelShell theme={theme} title="Accountant Panel" subtitle="Finance office" nav={nav}>
            {children}
        </PanelShell>
    );
}
