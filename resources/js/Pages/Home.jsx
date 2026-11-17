import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Camera, Film, Mic, PenLine, Image as ImageIcon } from 'lucide-react';
import { Button } from '../Components/ui';
import { CourseImage } from '../Components/motion';

/**
 * IMAGE SLOTS  ->  put your photos in:  public/images/home/
 * (Laravel serves them at /images/home/<file>)
 *
 * hero-main.jpg    portrait  ~1000x1250   students filming / studio
 * hero-camera.jpg  square    ~700x700     camera / equipment close-up
 * hero-studio.jpg  square    ~700x700     editing suite / audio desk
 * about.jpg        landscape ~1200x900    classroom / workshop
 * learn.jpg  practise.jpg  create.jpg  develop.jpg   portrait ~800x1000
 * cta.jpg          wide      ~1920x800    campus / team photo
 *
 * Course photos are NOT here: they live in public/images/courses/<course-slug>.jpg
 * (plus course-default.jpg in that same folder for courses without a photo).
 * Missing images fall back to a branded placeholder, so nothing breaks.
 */
const IMG = '/images/home/';

/** How many courses to show on the home page (rest are on /courses). */
const FEATURED = 6;

const ticker = [
    'Cinematography',
    'Photography',
    'News Journalism',
    'AI for Media',
    'Graphic Design',
    'Digital Marketing',
    'Acting',
    'Mobile Journalism',
    'Short Film Production',
    'Content Creation',
];

/* ------------------------------------------------------------------ */
/* Animation helpers                                                   */
/* ------------------------------------------------------------------ */

/** True once the element has scrolled into view (runs once). */
function useInView(threshold = 0.15) {
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
function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
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
function CountUp({ to, duration = 1400 }) {
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

    return <span ref={ref}>{n}</span>;
}

/** Image with graceful fallback so layout never breaks while photos are missing. */
function Photo({ src, alt, className = '', zoom = true, children }) {
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
                    <ImageIcon size={40} aria-hidden="true" />
                </div>
            )}
            {children}
        </div>
    );
}

/** Learning pathway drawn like a video editing timeline. Clips grow in when visible. */
function Timeline() {
    const [ref, inView] = useInView(0.3);

    const track = 'flex h-12 gap-1.5';
    const clip = `tl-clip ${inView ? 'in' : ''} flex items-center overflow-hidden rounded-md px-3 text-xs font-semibold leading-tight sm:text-sm`;
    const d = (i) => ({ '--d': `${i * 120}ms` });

    return (
        <div
            ref={ref}
            className="relative rounded-2xl bg-navy p-5 pt-12 text-white shadow-2xl sm:p-8 sm:pt-14"
        >
            <div className="absolute left-5 top-4 flex items-center gap-2 text-xs font-semibold sm:left-8 sm:top-5">
                <span className="rec-dot h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                Learning pathway
            </div>

            <div className="-mx-1 overflow-x-auto px-1 pb-2">
              <div className="relative min-w-[640px]">
            <div className="ruler mb-4 h-3 border-b border-navy-500" aria-hidden="true" />

            <div className="grid grid-cols-[70px_1fr] items-center gap-x-4 gap-y-4 text-xs sm:grid-cols-[110px_1fr] sm:text-sm">
                <span className="text-navy-300">Pathway</span>
                <div className={track}>
                    <div style={d(0)} className={`${clip} basis-[16%] bg-brand`}>Certificate</div>
                    <div style={d(1)} className={`${clip} basis-[22%] bg-brand-600`}>Advanced Certificate</div>
                    <div style={d(2)} className={`${clip} basis-[22%] bg-brand-700`}>Diploma</div>
                    <div style={d(3)} className={`${clip} basis-[24%] bg-gold text-navy`}>Higher Diploma</div>
                    <div style={d(4)} className={`${clip} flex-1 border border-dashed border-gold text-gold`}>
                        Professional Development
                    </div>
                </div>

                <span className="text-navy-300">A/L support</span>
                <div className={track}>
                    <div style={d(2)} className={`${clip} basis-[48%] bg-navy-500`}>Media & Communication</div>
                    <div style={d(3)} className={`${clip} flex-1 bg-navy-600`}>ICT & Digital Skills</div>
                </div>

                <span className="text-navy-300">Practical</span>
                <div className={track}>
                    <div style={d(3)} className={`${clip} basis-[34%] bg-navy-600`}>Content Creation</div>
                    <div style={d(4)} className={`${clip} basis-[26%] bg-navy-500`}>Photography & Video</div>
                    <div style={d(5)} className={`${clip} flex-1 border border-dashed border-navy-400 text-navy-300`}>
                        AI, Design & Digital Media
                    </div>
                </div>
            </div>

            <div className="playhead" aria-hidden="true" />
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-navy-300 sm:hidden">Swipe sideways to see the full pathway</p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const highlights = [
    [18, 'Specialised courses'],
    [5, 'Pathway levels'],
    ['A/L', 'Support programmes'],
    ['MPU', 'Media Production Unit'],
];

const pillars = [
    ['Education', 'Accessible, high-quality and practical-driven education in media, communication, digital skills and modern technology.'],
    ['Development', 'Hands-on development in content creation, cinematography, photography, graphic design, AI tools and digital media.'],
    ['Research', 'Research focused on media literacy, social media trends, AI integration, media ethics, digital safety and youth behaviour.'],
    ['Community', 'Media literacy workshops, school programmes and teacher development initiatives designed to empower communities.'],
];

const loop = [
    [Film, 'Learn', 'Practical classes and workshops', 'learn.jpg'],
    [Camera, 'Practise', 'Hands-on work with real equipment', 'practise.jpg'],
    [Mic, 'Create', 'Produce real media and digital content', 'create.jpg'],
    [PenLine, 'Develop', 'Build professional skills and experience', 'develop.jpg'],
];

const soon = [
    {
        heading: 'Latest News',
        href: '/news',
        link: 'All news',
        title: 'IMDR Newsroom',
        text: 'Our newsroom portal is under preparation. Official announcements regarding student intakes, workshop schedules and campus news will be published here shortly.',
    },
    {
        heading: 'Upcoming Events & Workshops',
        href: '/events',
        link: 'All events',
        title: 'Workshops & Community Programmes',
        text: 'We are organizing hands-on workshops, school empowerment seminars and open campus days. Event registration forms will be updated soon.',
    },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home({ stats, types, courses }) {
    const shown = courses?.slice(0, FEATURED);

    return (
        <>
            <Head title="Institute of Media Development and Research" />

            {/* Animations live here so no Tailwind config change is needed */}
            <style dangerouslySetInnerHTML={{ __html: `
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

                @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                .marquee-track { animation: marquee 38s linear infinite; }
                .marquee:hover .marquee-track { animation-play-state: paused; }

                .tl-clip { transform: scaleX(0); transform-origin: left; opacity: 0; transition: transform .7s cubic-bezier(.2,.7,.2,1), opacity .7s; transition-delay: var(--d, 0ms); }
                .tl-clip.in { transform: scaleX(1); opacity: 1; }

                @keyframes playhead { from { left: 6%; } to { left: 94%; } }
                .playhead { position: absolute; top: 0; bottom: 0; width: 2px; background: #ef4444; opacity: .85; animation: playhead 7s ease-in-out infinite alternate; pointer-events: none; }

                @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,.55); } 70%,100% { box-shadow: 0 0 0 12px rgba(239,68,68,0); } }
                .rec-pulse { animation: pulseRing 2s infinite; }

                @keyframes shine { to { transform: translateX(220%); } }
                .shine { position: relative; overflow: hidden; }
                .shine::after { content: ''; position: absolute; inset: 0; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent); transform: translateX(-120%); }
                .shine:hover::after { animation: shine .9s ease; }

                @media (prefers-reduced-motion: reduce) {
                    .reveal, .hero-in, .tl-clip { opacity: 1 !important; transform: none !important; transition: none !important; animation: none !important; }
                    .float-slow, .float-slower, .kenburns img, .marquee-track, .playhead, .rec-pulse { animation: none !important; }
                }
            ` }} />

            {/* ============================ HERO ============================ */}
            <section className="relative overflow-hidden bg-white">
                <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-28">
                    <div className="lg:col-span-6">
                        <p
                            style={{ '--d': '0ms' }}
                            className="hero-in mb-6 inline-flex items-center gap-2 rounded-full bg-paper px-4 py-1.5 text-xs font-semibold text-navy-600"
                        >
                            <span className="rec-pulse h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                            Sri Lanka's media education institute
                        </p>

                        <h1
                            style={{ '--d': '120ms' }}
                            className="hero-in display-wide text-5xl text-navy sm:text-6xl xl:text-7xl"
                        >
                            Research.
                            <br />
                            Educate.
                            <br />
                            <span className="text-brand">Empower.</span>
                        </h1>

                        <p
                            style={{ '--d': '260ms' }}
                            className="hero-in mt-8 max-w-lg text-lg leading-8 text-navy-600"
                        >
                            The Institute of Media Development and Research (IMDR)
                            is a multidisciplinary institution for education,
                            research, professional development and community
                            empowerment in Sri Lanka, focused on media literacy,
                            content creation, digital competence, journalism and
                            AI for media.
                        </p>

                        <div style={{ '--d': '400ms' }} className="hero-in mt-10 flex flex-wrap gap-4">
                            <Button href="/courses" variant="gold" size="lg">
                                Explore Courses
                            </Button>
                            <Button href="/apply" variant="outline" size="lg">
                                Apply Now
                            </Button>
                        </div>

                        <p
                            style={{ '--d': '520ms' }}
                            className="hero-in mt-8 max-w-md text-sm leading-6 text-navy-500"
                        >
                            No online student account is needed. Submit an
                            Application Form online or visit our institute directly.
                        </p>
                    </div>

                    {/* Photo composition */}
                    <div style={{ '--d': '300ms' }} className="hero-in relative mx-auto w-full max-w-md lg:col-span-6 lg:max-w-none">
                        <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:ml-auto lg:mr-0">
                            <Photo
                                src={`${IMG}hero-main.jpg`}
                                alt="IMDR students filming"
                                zoom={false}
                                className="kenburns h-full w-full rounded-3xl shadow-2xl"
                            />

                            {/* floating badge */}
                            <div className="float-slow absolute -right-2 top-10 rounded-2xl bg-gold px-5 py-4 text-navy shadow-xl sm:-right-6 xl:-right-8">
                                <p className="text-3xl font-extrabold leading-none">18</p>
                                <p className="mt-1 text-xs font-semibold">Practical courses</p>
                            </div>

                            {/* floating photo */}
                            <Photo
                                src={`${IMG}hero-camera.jpg`}
                                alt="Camera equipment"
                                className="float-slower absolute -bottom-8 -left-4 h-36 w-36 rounded-2xl border-4 border-white shadow-xl sm:-left-10 sm:h-44 sm:w-44"
                            />

                            {/* REC chip */}
                            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-navy/80 px-3 py-1.5 text-xs font-bold text-white">
                                <span className="rec-pulse h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                                REC
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================ TICKER ============================ */}
            <section className="marquee overflow-hidden bg-gold py-5 text-navy" aria-hidden="true">
                <div className="marquee-track flex w-max gap-12 whitespace-nowrap text-lg font-bold">
                    {[...ticker, ...ticker].map((t, i) => (
                        <span key={i} className="flex items-center gap-12">
                            {t}
                            <span className="h-2 w-2 rounded-full bg-navy" />
                        </span>
                    ))}
                </div>
            </section>

            {/* ============================ HIGHLIGHTS ============================ */}
            <section className="bg-navy text-white">
                <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
                    {highlights.map(([value, label], i) => (
                        <Reveal key={label} delay={i * 100} className="px-4 py-12 text-center">
                            <dt className="text-4xl font-extrabold text-gold sm:text-5xl">
                                {typeof value === 'number' ? <CountUp to={value} /> : value}
                            </dt>
                            <dd className="mt-2 text-sm text-navy-200">{label}</dd>
                        </Reveal>
                    ))}
                </dl>
            </section>

            {/* ============================ PURPOSE ============================ */}
            <section className="bg-paper">
                <div className="mx-auto grid max-w-7xl items-center gap-20 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-36">
                    <Reveal className="relative pb-12 pr-6 sm:pr-12">
                        <Photo
                            src={`${IMG}about.jpg`}
                            alt="IMDR workshop"
                            className="aspect-[4/3] rounded-3xl shadow-xl"
                        />
                        <Photo
                            src={`${IMG}hero-studio.jpg`}
                            alt="IMDR editing studio"
                            className="float-slow absolute bottom-0 right-0 h-32 w-32 rounded-2xl border-4 border-paper shadow-xl sm:h-44 sm:w-44"
                        />
                    </Reveal>

                    <div>
                        <Reveal>
                            <h2 className="text-3xl font-bold leading-tight text-navy sm:text-4xl lg:text-5xl">
                                Building informed, skilled and empowered people.
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-navy-600">
                                Social media, smartphones, digital platforms and AI
                                are changing the way people learn, communicate and
                                create. IMDR provides practical education that helps
                                learners understand media, develop digital skills,
                                think critically and create responsible content.
                            </p>
                        </Reveal>

                        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
                            {pillars.map(([name, text], i) => (
                                <Reveal
                                    as="li"
                                    key={name}
                                    delay={i * 120}
                                    className="rounded-2xl border border-navy-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand hover:shadow-xl"
                                >
                                    <span className="text-sm font-bold text-gold">0{i + 1}</span>
                                    <h3 className="mt-2 text-xl font-bold text-navy">{name}</h3>
                                    <p className="mt-3 text-sm leading-6 text-navy-600">{text}</p>
                                </Reveal>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================ PATHWAY ============================ */}
            <section className="bg-white">
                <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:py-32">
                    <Reveal className="mb-14 text-center">
                        <h2 className="text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
                            Your path, frame by frame
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-navy-600">
                            IMDR combines structured education with practical media,
                            digital, communication and technology-based learning.
                        </p>
                    </Reveal>

                    <Reveal delay={150}>
                        <Timeline />
                    </Reveal>
                </div>
            </section>

            {/* ============================ COURSES ============================ */}
            <section className="bg-paper">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
                    <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
                                18 Specialised Courses
                            </h2>
                            <p className="mt-4 max-w-2xl text-lg leading-8 text-navy-600">
                                Practical-focused courses covering media,
                                communication, cinema, digital technology,
                                AI and modern content creation.
                            </p>
                        </div>

                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
                        >
                            Explore all courses <ArrowRight size={16} />
                        </Link>
                    </Reveal>

                    <Reveal className="mb-12 flex flex-wrap gap-3">
                        {types
                            ?.filter((t) => t.courses_count > 0)
                            .map((t) => (
                                <Link
                                    key={t.id}
                                    href={`/courses?type=${t.id}`}
                                    className="rounded-full border border-navy-200 bg-white px-5 py-2 text-sm font-medium text-navy transition hover:border-brand hover:bg-brand hover:text-white"
                                >
                                    {t.name} <span className="opacity-60">({t.courses_count})</span>
                                </Link>
                            ))}
                    </Reveal>

                    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {shown?.map((c, i) => (
                            <Reveal as="li" key={c.id} delay={(i % 3) * 120}>
                                <Link
                                    href={`/courses/${c.slug}`}
                                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                                >
                                    <CourseImage c={c} className="aspect-[16/9]">
                                        <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy">
                                            {c.level_label || c.course_type?.name}
                                        </span>
                                    </CourseImage>

                                    <div className="flex flex-1 flex-col p-7">
                                        {c.duration && (
                                            <p className="text-xs font-semibold text-brand">{c.duration}</p>
                                        )}
                                        <h3 className="mt-1 text-xl font-bold text-navy transition group-hover:text-brand">
                                            {c.name}
                                        </h3>
                                        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-navy-600">
                                            {c.summary}
                                        </p>
                                        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                                            View course
                                            <ArrowRight size={16} className="transition group-hover:translate-x-1.5" />
                                        </span>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </ul>

                    <Reveal className="mt-14 text-center">
                        <Button href="/courses" variant="gold" size="lg">
                            View all 18 courses
                        </Button>
                        <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-navy-500">
                            Online account registration is not required. Submit an
                            Application Form online or visit the institute directly.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* ============================ LEARN / PRACTISE / CREATE / DEVELOP ============================ */}
            <section className="bg-navy text-white">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
                    <Reveal className="max-w-3xl">
                        <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                            Learn. Practise. Create. Develop.
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-navy-200">
                            IMDR's Media Production Unit and practical learning
                            environment help students develop real-world skills in
                            video production, photography, audio, digital content
                            and modern media technologies.
                        </p>
                    </Reveal>

                    <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {loop.map(([Icon, title, text, img], i) => (
                            <Reveal as="li" key={title} delay={i * 130}>
                                <Photo
                                    src={`${IMG}${img}`}
                                    alt={title}
                                    className="aspect-[4/5] rounded-2xl"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
                                    <span className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-navy shadow-lg transition duration-300 group-hover:rotate-12 group-hover:scale-110">
                                        <Icon size={22} />
                                    </span>
                                    <span className="absolute right-5 top-5 text-sm font-bold text-white/70">
                                        0{i + 1}
                                    </span>
                                    <div className="absolute inset-x-0 bottom-0 p-6 transition duration-300 group-hover:-translate-y-1">
                                        <p className="text-2xl font-bold">{title}</p>
                                        <p className="mt-2 text-sm leading-6 text-navy-200">{text}</p>
                                    </div>
                                </Photo>
                            </Reveal>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ============================ NEWS & EVENTS ============================ */}
            <section className="bg-paper">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32">
                    {soon.map((b, i) => (
                        <Reveal
                            key={b.heading}
                            delay={i * 150}
                            className="rounded-2xl border border-navy-100 bg-white p-8 shadow-sm sm:p-10"
                        >
                            <div className="mb-8 flex items-end justify-between gap-4">
                                <h2 className="text-2xl font-bold text-navy">{b.heading}</h2>
                                <Link
                                    href={b.href}
                                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline"
                                >
                                    {b.link} <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="rounded-xl border border-dashed border-navy-200 bg-paper p-7">
                                <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-brand">
                                    <span className="rec-pulse h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                                    COMING SOON
                                </p>
                                <h3 className="mt-3 text-xl font-bold text-navy">{b.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-navy-600">{b.text}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ============================ CTA ============================ */}
            <section className="relative overflow-hidden bg-brand text-white">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-25"
                    style={{ backgroundImage: `url(${IMG}cta.jpg)` }}
                    aria-hidden="true"
                />
                <Reveal className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-24 sm:px-6">
                    <div>
                        <h2 className="text-3xl font-bold sm:text-5xl">Ready to start?</h2>
                        <p className="mt-4 max-w-xl text-lg leading-8 text-brand-100">
                            Complete the official Student Application Form online.
                            No online student account registration is required.
                        </p>
                    </div>

                    <span className="shine inline-block rounded-lg">
                        <Button href="/apply" variant="gold" size="lg">
                            Apply Now
                        </Button>
                    </span>
                </Reveal>
            </section>
        </>
    );
}
