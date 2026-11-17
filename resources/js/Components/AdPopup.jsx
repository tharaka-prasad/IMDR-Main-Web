import { Link } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Pop-up ad for the home page.
 * It opens every time the home page is opened (a short moment after it loads) and the visitor can close it
 * with the X button, the Close button, the Escape key or by clicking outside. The server only sends an ad
 * while it is between its start and end date, so it stops appearing by itself on the end date.
 */
export default function AdPopup({ ad }) {
    const [open, setOpen] = useState(false);
    const [shown, setShown] = useState(false); // drives the fade-in
    const dialog = useRef(null);
    const closeButton = useRef(null);

    // Safety net: never open an ad whose end time has already passed in this browser.
    const expired = ad?.ends_at && new Date(ad.ends_at).getTime() < Date.now();
    const usable = !!ad && !expired;

    useEffect(() => {
        if (!usable) return undefined;

        const timer = setTimeout(() => setOpen(true), 700);
        return () => clearTimeout(timer);
    }, [usable, ad?.id]);

    useEffect(() => {
        if (!open) return undefined;

        const before = document.activeElement;
        const frame = requestAnimationFrame(() => setShown(true));
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeButton.current?.focus();

        const onKey = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
                return;
            }

            if (e.key !== 'Tab' || !dialog.current) return;

            // Keep the keyboard inside the pop-up while it is open.
            const items = [...dialog.current.querySelectorAll('a[href], button:not([disabled])')];
            if (items.length === 0) return;

            const first = items[0];
            const last = items[items.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = previousOverflow;
            setShown(false);
            before?.focus?.();
        };
    }, [open]);

    if (!usable || !open) return null;

    const close = () => setOpen(false);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 bg-navy/75 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${shown ? 'opacity-100' : 'opacity-0'}`}
                onClick={close}
                aria-hidden="true"
            />

            <div
                ref={dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ad-title"
                className={`relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl transition duration-300 motion-reduce:transition-none ${shown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`}
            >
                <button
                    ref={closeButton}
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-navy/80 text-white transition-colors hover:bg-navy focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60"
                >
                    <X size={20} aria-hidden="true" />
                </button>

                {ad.image && <img src={ad.image} alt="" className="max-h-[55vh] w-full bg-navy object-cover" />}

                <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-gold-600">Latest from IMDR</p>
                    <h2 id="ad-title" className="mt-1 text-2xl font-bold leading-snug text-navy">{ad.title}</h2>
                    {ad.excerpt && <p className="mt-3 text-navy-600">{ad.excerpt}</p>}

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link href={`/posts/${ad.slug}`} className="inline-flex items-center rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-400">
                            Read more
                        </Link>
                        <button type="button" onClick={close} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-navy-600 hover:bg-navy-50">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}