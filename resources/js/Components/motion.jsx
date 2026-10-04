import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

/** True once the element has scrolled into view (runs once). */
export function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (
            typeof IntersectionObserver === 'undefined' ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            setInView(true);
            return;
        }

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    io.disconnect();
                }
            },
            { threshold },
        );

        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);

    return [ref, inView];
}

/** Fades + slides children up when scrolled into view. */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
    const [ref, inView] = useInView();

    return (
        <Tag
            ref={ref}
            style={{ '--d': `${delay}ms` }}
            className={`reveal ${inView ? 'in' : ''} ${className}`}
        >
            {children}
        </Tag>
    );
}

/** Counts up to `to` when scrolled into view. */
export function CountUp({ to, duration = 1400 }) {
    const [ref, inView] = useInView(0.4);
    const [n, setN] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let raf;
        const start = performance.now();

        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, to, duration]);

    return <span ref={ref}>{n.toLocaleString()}</span>;
}

/** Image with a branded fallback so layout never breaks while photos are missing. */
export function Photo({ src, alt, className = '', zoom = true, fallback = null, children }) {
    const [failed, setFailed] = useState(false);

    return (
        <div className={`group relative overflow-hidden bg-navy-600 ${className}`}>
            {!failed ? (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onError={() => setFailed(true)}
                    className={`h-full w-full object-cover transition duration-700 ${
                        zoom ? 'group-hover:scale-105' : ''
                    }`}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-500 to-navy text-navy-300">
                    {fallback ?? <ImageIcon size={40} aria-hidden="true" />}
                </div>
            )}
            {children}
        </div>
    );
}

/** Where course photos live: public/images/courses/<course-slug>.jpg  (+ course-default.jpg in the same folder). */
export const COURSE_IMG = '/images/courses/';
export const COURSE_DEFAULT_IMG = `${COURSE_IMG}course-default.jpg`;

/**
 * Course photo. Tries, in order: the course's own image from the database,
 * /images/courses/<slug>.jpg, /images/courses/course-default.jpg, then a placeholder.
 */
export function CourseImage({ c, className = '', zoom = true, children }) {
    const sources = [c.image_url, c.image, `${COURSE_IMG}${c.slug}.jpg`, COURSE_DEFAULT_IMG].filter(Boolean);
    const [i, setI] = useState(0);

    return (
        <div className={`group relative overflow-hidden bg-navy-600 ${className}`}>
            {i < sources.length ? (
                <img
                    key={sources[i]}
                    src={sources[i]}
                    alt={c.name}
                    loading="lazy"
                    onError={() => setI(i + 1)}
                    className={`h-full w-full object-cover transition duration-700 ${zoom ? 'group-hover:scale-105' : ''}`}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-500 to-navy text-navy-300">
                    <ImageIcon size={40} aria-hidden="true" />
                </div>
            )}
            {children}
        </div>
    );
}

/** Drop once at the top of a page: holds all animation CSS (no Tailwind config change needed). */
export function MotionStyles() {
    return (
        <style>{`
            html, body { overflow-x: clip; }
            .reveal { opacity: 0; transform: translateY(32px); transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); transition-delay: var(--d, 0ms); }
            .reveal.in { opacity: 1; transform: none; }

            @keyframes heroIn { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: none; } }
            .hero-in { opacity: 0; animation: heroIn 1s cubic-bezier(.2,.7,.2,1) forwards; animation-delay: var(--d, 0ms); }

            @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
            .float-slow { animation: floatY 6s ease-in-out infinite; }
            .float-slower { animation: floatY 8s ease-in-out infinite; animation-delay: -3s; }

            @keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.1); } }
            .kenburns img { animation: kenburns 14s ease-in-out infinite alternate; }

            @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,.55); } 70%,100% { box-shadow: 0 0 0 12px rgba(239,68,68,0); } }
            .rec-pulse { animation: pulseRing 2s infinite; }

            @keyframes growX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
            .line-grow { transform-origin: left; transform: scaleX(0); }
            .reveal.in .line-grow, .line-grow.in { animation: growX 1s .3s cubic-bezier(.2,.7,.2,1) forwards; }

            @media (prefers-reduced-motion: reduce) {
                .reveal, .hero-in { opacity: 1 !important; transform: none !important; transition: none !important; animation: none !important; }
                .float-slow, .float-slower, .kenburns img, .rec-pulse { animation: none !important; }
                .line-grow { transform: none !important; animation: none !important; }
            }
        `}</style>
    );
}