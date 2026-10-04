import { Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { AlertTriangle, Check, Search, X } from 'lucide-react';
import { cx, label, tone } from '../lib';

const buttonVariants = {
    primary: 'bg-navy text-white hover:bg-navy-700',
    gold: 'bg-gold text-navy hover:bg-gold-400',
    brand: 'bg-brand text-white hover:bg-brand-600',
    outline: 'border border-navy-200 bg-white text-navy hover:bg-navy-50',
    ghost: 'text-navy hover:bg-navy-50',
    subtle: 'bg-navy-50 text-navy hover:bg-navy-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    dangerOutline: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
};

const buttonSizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

export function Button({ variant = 'primary', size = 'md', href, native, className, children, ...props }) {
    const cls = cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        buttonSizes[size],
        buttonVariants[variant],
        className
    );

    // "native" = a plain link (needed for file downloads, which must not become Inertia visits).
    if (href && native) {
        return (
            <a href={href} className={cls} {...props}>
                {children}
            </a>
        );
    }

    if (href) {
        return (
            <Link href={href} className={cls} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={cls} {...props}>
            {children}
        </button>
    );
}

export function Card({ className, children, ...props }) {
    return (
        <div className={cx('rounded-xl border border-navy-100 bg-white', className)} {...props}>
            {children}
        </div>
    );
}

export function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
                {subtitle && <p className="mt-1 max-w-2xl text-sm text-navy-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export function Field({ label: text, error, help, children, className }) {
    return (
        <label className={cx('block', className)}>
            {text && <span className="mb-1 block text-sm font-medium text-navy-700">{text}</span>}
            {children}
            {help && <span className="mt-1 block text-xs text-navy-400">{help}</span>}
            {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
        </label>
    );
}

export const TextInput = ({ className, ...props }) => <input className={cx('input', className)} {...props} />;
export const TextArea = ({ className, ...props }) => <textarea rows={3} className={cx('input', className)} {...props} />;

export function SelectInput({ options = [], placeholder = 'Choose...', className, ...props }) {
    return (
        <select className={cx('input', className)} {...props}>
            {placeholder !== null && <option value="">{placeholder}</option>}
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}

export function Check2({ label: text, checked, onChange, help }) {
    return (
        <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-navy-300 text-brand focus:ring-brand" />
            <span>
                <span className="font-medium text-navy-700">{text}</span>
                {help && <span className="block text-xs text-navy-400">{help}</span>}
            </span>
        </label>
    );
}

export function Modal({ open, onClose, title, children, wide, footer }) {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/60 p-3 sm:p-8" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div role="dialog" aria-modal="true" aria-label={title} className={cx('w-full rounded-xl bg-white shadow-lift', wide ? 'max-w-3xl' : 'max-w-lg')}>
                <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button type="button" onClick={onClose} className="rounded-md p-1 text-navy-400 hover:bg-navy-50 hover:text-navy" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                <div className="px-5 py-4">{children}</div>
                {footer && <div className="flex justify-end gap-2 border-t border-navy-100 px-5 py-3">{footer}</div>}
            </div>
        </div>
    );
}

const badgeTones = {
    green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    amber: 'bg-gold-50 text-gold-700 ring-gold-100',
    red: 'bg-red-50 text-red-700 ring-red-200',
    blue: 'bg-brand-50 text-brand-700 ring-brand-100',
    gray: 'bg-navy-50 text-navy-600 ring-navy-100',
};

export function Badge({ tone: t = 'gray', children, className }) {
    return <span className={cx('inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset', badgeTones[t], className)}>{children}</span>;
}

export function Status({ value, text }) {
    return <Badge tone={tone(value)}>{text ?? label(value)}</Badge>;
}

export function Alert({ tone: t = 'blue', title, children, className }) {
    const styles = {
        blue: 'border-brand-200 bg-brand-50 text-navy',
        green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        amber: 'border-gold-400 bg-gold-50 text-navy',
        red: 'border-red-200 bg-red-50 text-red-900',
    };

    return (
        <div className={cx('rounded-lg border px-4 py-3 text-sm', styles[t], className)} role={t === 'red' ? 'alert' : 'status'}>
            {title && <p className="font-semibold">{title}</p>}
            <div>{children}</div>
        </div>
    );
}

export function Stat({ label: text, value, hint, accent = 'brand' }) {
    const border = { brand: 'border-brand', gold: 'border-gold', navy: 'border-navy', red: 'border-red-500', green: 'border-emerald-500' }[accent];

    return (
        <div className={cx('rounded-xl border border-navy-100 border-l-4 bg-white px-4 py-3', border)}>
            <p className="text-sm text-navy-500">{text}</p>
            <p className="mt-0.5 text-2xl font-bold text-navy">{value}</p>
            {hint && <p className="mt-0.5 text-xs text-navy-400">{hint}</p>}
        </div>
    );
}

export function Empty({ title, children }) {
    return (
        <div className="rounded-xl border border-dashed border-navy-200 bg-white px-6 py-10 text-center">
            <p className="font-semibold text-navy">{title}</p>
            {children && <div className="mx-auto mt-1 max-w-md text-sm text-navy-500">{children}</div>}
        </div>
    );
}

export function TableWrap({ children }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white">
            <table className="min-w-full divide-y divide-navy-100">{children}</table>
        </div>
    );
}

export const Thead = ({ children }) => (
    <thead className="bg-navy-50">
        <tr>{children}</tr>
    </thead>
);

export function Pagination({ paginator }) {
    if (!paginator) return null;
    const { from, to, total, prev_page_url: prev, next_page_url: next } = paginator;

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-navy-500">
            <span>{total ? `Showing ${from} to ${to} of ${total}` : 'Nothing to show'}</span>
            <div className="flex gap-2">
                {prev ? <Button href={prev} variant="outline" size="sm" preserveScroll>Previous</Button> : <span className="rounded-lg border border-navy-100 px-2.5 py-1.5 text-xs text-navy-300">Previous</span>}
                {next ? <Button href={next} variant="outline" size="sm" preserveScroll>Next</Button> : <span className="rounded-lg border border-navy-100 px-2.5 py-1.5 text-xs text-navy-300">Next</span>}
            </div>
        </div>
    );
}

export function SearchBox({ value, onChange, placeholder = 'Search...', className }) {
    return (
        <div className={cx('relative', className)}>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="input pl-9" />
        </div>
    );
}

export function FlashMessages() {
    const { flash } = usePage().props;

    return (
        <>
            {flash?.success && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
                    <Check size={16} className="mt-0.5 shrink-0" />
                    <span>{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>{flash.error}</span>
                </div>
            )}
        </>
    );
}

export function FormError({ errors }) {
    const list = Object.values(errors || {});
    if (!list.length) return null;

    return (
        <Alert tone="red" className="mb-3">
            {list.length === 1 ? list[0] : 'Please fix the highlighted fields.'}
        </Alert>
    );
}
