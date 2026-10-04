import { useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Aperture, Camera, Eye, EyeOff, Film, Mic, Video } from 'lucide-react';
import { Alert, Button, Field, TextInput } from '../../Components/ui';
import { MotionStyles } from '../../Components/motion';

/** Floating objects. `depth` = how far they move with the mouse (negative = opposite way, i.e. further away). */
const layers = [
    { Icon: Camera, pos: 'left-[5%] top-[12%] h-14 w-14 sm:h-20 sm:w-20', depth: 46, tone: 'text-gold', float: 'float-slow', show: '' },
    { Icon: Film, pos: 'right-[6%] top-[9%] h-16 w-16 sm:h-24 sm:w-24', depth: -34, tone: 'text-navy-300', float: 'float-slower', show: '' },
    { Icon: Mic, pos: 'left-[42%] bottom-[16%] h-12 w-12 sm:h-16 sm:w-16', depth: 60, tone: 'text-brand-100', float: 'float-slow', show: 'hidden sm:block' },
    { Icon: Video, pos: 'right-[3%] bottom-[20%] h-14 w-14 sm:h-20 sm:w-20', depth: -56, tone: 'text-gold', float: 'float-slower', show: 'hidden md:block' },
    { Icon: Aperture, pos: 'left-[2%] bottom-[8%] h-16 w-16 sm:h-24 sm:w-24', depth: 28, tone: 'text-navy-400', float: 'float-slow', show: 'hidden md:block' },
];

/** Film reel drawn with SVG (6 holes). */
function Reel({ className = '' }) {
    const holes = [[158, 100], [129, 150.2], [71, 150.2], [42, 100], [71, 49.8], [129, 49.8]];

    return (
        <svg viewBox="0 0 200 200" className={`reel ${className}`} fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
            <circle cx="100" cy="100" r="96" />
            <circle cx="100" cy="100" r="86" strokeOpacity=".5" />
            <circle cx="100" cy="100" r="16" />
            {holes.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="17" />
            ))}
        </svg>
    );
}

export default function Login() {
    const form = useForm({ login: '', password: '', remember: false });
    const [show, setShow] = useState(false);
    const stage = useRef(null);

    // Mouse position -> CSS variables (no React re-render, so it stays smooth).
    const move = (e) => {
        if (e.pointerType === 'touch' || !stage.current) return;
        const r = stage.current.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        const s = stage.current.style;
        s.setProperty('--mx', x.toFixed(3));
        s.setProperty('--my', y.toFixed(3));
        s.setProperty('--gx', `${(((x + 1) / 2) * 100).toFixed(1)}%`);
        s.setProperty('--gy', `${(((y + 1) / 2) * 100).toFixed(1)}%`);
    };

    const reset = () => {
        if (!stage.current) return;
        const s = stage.current.style;
        s.setProperty('--mx', '0');
        s.setProperty('--my', '0');
        s.setProperty('--gx', '50%');
        s.setProperty('--gy', '50%');
    };

    const submit = (e) => {
        e.preventDefault();
        form.post('/login');
    };

    return (
        <>
            <Head title="Log in" />
            <MotionStyles />
            <style>{`
                .login-stage { --mx: 0; --my: 0; --gx: 50%; --gy: 50%; }

                @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,40px) scale(1.15); } }
                @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-70px,-30px) scale(1.1); } }
                .orb-a { animation: drift1 14s ease-in-out infinite; }
                .orb-b { animation: drift2 17s ease-in-out infinite; }

                @keyframes spin { to { transform: rotate(360deg); } }
                .reel { animation: spin 45s linear infinite; }

                .grid-floor {
                    position: absolute; left: -25%; right: -25%; bottom: -8%; height: 60%;
                    transform: perspective(520px) rotateX(64deg); transform-origin: center bottom;
                    background-image:
                        linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px);
                    background-size: 60px 60px;
                    -webkit-mask-image: linear-gradient(to top, #000 5%, transparent 85%);
                    mask-image: linear-gradient(to top, #000 5%, transparent 85%);
                    animation: gridMove 2.4s linear infinite;
                }
                @keyframes gridMove { to { background-position: 0 60px, 0 0; } }

                .tilt-card {
                    transform: perspective(1400px) rotateY(calc(var(--mx) * 9deg)) rotateX(calc(var(--my) * -7deg));
                    transform-style: preserve-3d; transition: transform .25s ease-out; will-change: transform;
                }
                .z-pop-1 { transform: translateZ(26px); }
                .z-pop-2 { transform: translateZ(44px); }
                .glare { background: radial-gradient(420px circle at var(--gx) var(--gy), rgba(250,176,20,.22), transparent 55%); }

                @keyframes borderFlow { to { background-position: 200% 0; } }
                .glow-border { background-size: 200% 100%; animation: borderFlow 6s linear infinite; }

                @media (hover: none), (max-width: 1023px) { .tilt-card { transform: none !important; } }
                @media (prefers-reduced-motion: reduce) {
                    .orb-a, .orb-b, .reel, .grid-floor, .glow-border { animation: none !important; }
                    .tilt-card { transform: none !important; }
                }
            `}</style>

            <section
                ref={stage}
                onPointerMove={move}
                onPointerLeave={reset}
                className="login-stage relative isolate min-h-[85vh] overflow-hidden bg-gradient-to-br from-navy via-navy-600 to-navy text-white"
            >
                {/* ---------- background depth layers ---------- */}
                <div className="orb-a pointer-events-none absolute -left-24 top-10 -z-10 h-96 w-96 rounded-full bg-brand opacity-40 blur-3xl" aria-hidden="true" />
                <div className="orb-b pointer-events-none absolute -right-20 bottom-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-gold opacity-25 blur-3xl" aria-hidden="true" />

                <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
                    <div className="grid-floor" />
                </div>

                <div
                    className="pointer-events-none absolute -right-32 top-1/2 -z-10 hidden md:block"
                    style={{ transform: 'translate3d(calc(var(--mx) * -18px), calc(-50% + var(--my) * -12px), 0)' }}
                    aria-hidden="true"
                >
                    <Reel className="h-[30rem] w-[30rem] text-white/10" />
                </div>

                {layers.map(({ Icon, pos, depth, tone, float, show }, i) => (
                    <div
                        key={i}
                        className={`pointer-events-none absolute -z-10 ${pos} ${show}`}
                        style={{ transform: `translate3d(calc(var(--mx) * ${depth}px), calc(var(--my) * ${depth}px), 0)`, transition: 'transform .2s ease-out' }}
                        aria-hidden="true"
                    >
                        <div className={float} style={{ animationDelay: `${i * -1.3}s` }}>
                            <Icon className={`h-full w-full ${tone} opacity-60 drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]`} strokeWidth={1.4} />
                        </div>
                    </div>
                ))}

                {/* ---------- content ---------- */}
                <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
                    <div>
                        <div style={{ '--d': '0ms' }} className="hero-in inline-block rounded-2xl bg-white p-3 shadow-2xl">
                            <img src="/images/logo.jpg" alt="IMDR" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
                        </div>

                        <p
                            style={{ '--d': '120ms' }}
                            className="hero-in mt-8 inline-flex items-center gap-2 rounded-full border border-navy-400 px-4 py-1.5 text-xs font-bold tracking-widest text-gold"
                        >
                            <span className="rec-pulse h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                            SECURE SIGN IN
                        </p>

                        <h1 style={{ '--d': '220ms' }} className="hero-in display-wide mt-5 text-5xl sm:text-6xl">
                            Welcome <span className="text-gold">back.</span>
                        </h1>

                        <p style={{ '--d': '340ms' }} className="hero-in mt-6 max-w-md text-lg leading-8 text-navy-200">
                            Sign in with the username and password given by the IMDR office.
                        </p>

                        <p style={{ '--d': '460ms' }} className="hero-in mt-6 text-sm leading-7 text-navy-300">
                            Want to join IMDR?{' '}
                            <Link href="/apply" className="font-semibold text-gold hover:underline">
                                Apply for a course
                            </Link>
                            . Forgot your password? Ask the office to create a new one.
                        </p>
                    </div>

                    {/* 3D tilting card */}
                    <div style={{ '--d': '300ms' }} className="hero-in mx-auto w-full max-w-md lg:ml-auto lg:mr-0">
                        <div className="tilt-card">
                            <div className="glow-border bg-gradient-to-r from-gold via-brand to-gold rounded-[26px] p-[2px] shadow-[0_40px_80px_-20px_rgba(0,0,0,.6)]">
                                <form
                                    onSubmit={submit}
                                    className="relative space-y-5 rounded-3xl bg-white p-7 text-navy sm:p-9"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div className="glare pointer-events-none absolute inset-0 rounded-3xl" aria-hidden="true" />

                                    <div className="z-pop-1 relative">
                                        <h2 className="text-2xl font-bold">Log in</h2>
                                        <p className="mt-1 text-sm text-navy-500">Enter your details to continue.</p>
                                    </div>

                                    {form.errors.login && <Alert tone="red">{form.errors.login}</Alert>}

                                    <div className="z-pop-1 relative">
                                        <Field label="Username" error={form.errors.username}>
                                            <TextInput
                                                value={form.data.login}
                                                onChange={(e) => form.setData('login', e.target.value)}
                                                autoComplete="username"
                                                autoFocus
                                                required
                                            />
                                        </Field>
                                    </div>

                                    <div className="z-pop-1 relative">
                                        <Field label="Password" error={form.errors.password}>
                                            <div className="relative">
                                                <TextInput
                                                    type={show ? 'text' : 'password'}
                                                    value={form.data.password}
                                                    onChange={(e) => form.setData('password', e.target.value)}
                                                    autoComplete="current-password"
                                                    className="pr-12"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShow((v) => !v)}
                                                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-navy-400 transition hover:text-brand"
                                                    aria-label={show ? 'Hide password' : 'Show password'}
                                                >
                                                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </Field>
                                    </div>

                                    <label className="relative flex items-center gap-2 text-sm text-navy-600">
                                        <input
                                            type="checkbox"
                                            checked={form.data.remember}
                                            onChange={(e) => form.setData('remember', e.target.checked)}
                                            className="h-4 w-4 rounded border-navy-300 text-brand"
                                        />
                                        Keep me signed in on this device
                                    </label>

                                    <div className="z-pop-2 relative">
                                        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={form.processing}>
                                            {form.processing ? 'Signing in...' : 'Log in'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}