import { usePage } from '@inertiajs/react';
import AccountantLayout from './AccountantLayout';
import AdminLayout from './AdminLayout';
import LecturerLayout from './LecturerLayout';
import StudentLayout from './StudentLayout';

/**
 * Every portal page is wrapped by this one component (see app.jsx).
 * It picks the layout that belongs to the signed-in user's panel, so each role gets its own
 * frame and its own menu: Admin, Lecturer, Student or Accountant.
 */
export default function PortalLayout({ children }) {
    const panel = usePage().props.panel?.key;

    switch (panel) {
        case 'student':
            return <StudentLayout>{children}</StudentLayout>;
        case 'lecturer':
            return <LecturerLayout>{children}</LecturerLayout>;
        case 'accountant':
            return <AccountantLayout>{children}</AccountantLayout>;
        case 'admin':
            return <AdminLayout>{children}</AdminLayout>;
        default:
            // Not signed in (should not happen on portal pages): show the page without any menu.
            return <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>;
    }
}