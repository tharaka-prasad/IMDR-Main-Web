import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';

export const cx = (...parts) => parts.filter(Boolean).join(' ');

export const money = (n) =>
    'Rs. ' + Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parse = (v) => {
    if (!v) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        const [y, m, d] = v.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
};

export const fmtDate = (v) => {
    const d = parse(v);
    return d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
};

export const fmtDateTime = (v) => {
    const d = parse(v);
    return d ? d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
};

export const fmtTime = (t) => (t ? t.slice(0, 5) : '');

/** ISO string -> value for <input type="datetime-local"> */
export const toLocalInput = (iso) => {
    const d = parse(iso);
    if (!d) return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const fmtSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
};

const GOOD = ['paid', 'approved', 'active', 'success', 'sent', 'valid', 'open', 'held', 'present', 'completed', 'true', 'published', 'credited'];
const WARN = ['pending', 'unpaid', 'partial', 'running', 'scheduled', 'simulated', 'draft', 'late', 'pending_approval', 'partially_refunded', 'monthly'];
const BAD = ['failed', 'rejected', 'cancelled', 'suspended', 'overdue', 'revoked', 'absent', 'refunded', 'payment_delay', 'closed'];

export const tone = (value) => {
    const v = String(value ?? '').toLowerCase();
    if (GOOD.includes(v)) return 'green';
    if (WARN.includes(v)) return 'amber';
    if (BAD.includes(v)) return 'red';
    return 'blue';
};

export const label = (value) =>
    String(value ?? '').replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/**
 * Filters kept in sync with the URL. Typing waits 350ms, selects apply at once.
 * Every change becomes a normal Inertia GET visit, so the server does the searching.
 */
export function useFilters(path, initial) {
    const [values, setValues] = useState(initial);
    const timer = useRef(null);

    const update = (patch, immediate = false) => {
        const next = { ...values, ...patch };
        setValues(next);
        clearTimeout(timer.current);

        const go = () =>
            router.get(
                path,
                Object.fromEntries(Object.entries(next).filter(([, v]) => v !== '' && v != null && v !== false)),
                { preserveState: true, replace: true, preserveScroll: true }
            );

        immediate ? go() : (timer.current = setTimeout(go, 350));
    };

    return [values, update];
}

export const confirmThen = (message, fn) => {
    if (window.confirm(message)) fn();
};
