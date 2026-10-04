import { Head } from '@inertiajs/react';
import { BookOpen, Building2, Target, Rocket, Search, Users, Wrench, GraduationCap, MapPin } from 'lucide-react';
import { Button } from '../Components/ui';
import { CountUp, MotionStyles, Photo, Reveal } from '../Components/motion';

/**
 * IMAGE SLOTS  ->  public/images/about/
 * hero.jpg           landscape ~1400x1000  campus front / students
 * lecture-hall.jpg   landscape ~1000x700
 * lobby.jpg          landscape ~1000x700
 * it-lab.jpg         landscape ~1000x700
 * offices.jpg        landscape ~1000x700
 * cta.jpg            wide      ~1920x800
 *
 * Leader photos (optional, square ~600x600)  ->  public/images/about/team/<slug>.jpg
 * slugs are listed in the `leaders` / `advisors` arrays below.
 * No photo? Their initials are shown instead.
 */
const IMG = '/images/about/';

const philosophy = [
    [BookOpen, 'Educate', 'Structured academic qualifications from Certificate levels to Diplomas and Higher Diplomas.'],
    [Wrench, 'Develop', 'Practical media, technology and IT skills suited for modern industries.'],
    [Search, 'Research', 'Evidence-based knowledge generation, media ethics and AI integration.'],
    [Users, 'Empower', 'Community advancement, digital inclusion and youth empowerment.'],
];

const leaders = [
    { slug: 'nilusha-hapuarachchi', name: 'Mr. Nilusha Hapuarachchi', role: 'Chairman', qual: 'Diploma in Wildlife (Wildlife Trust) & Diploma in Film Direction' },
    { slug: 'gayani-kaushaliya', name: 'Mrs. Gayani Kaushaliya', role: 'Vice Chairman', qual: 'Diploma in Writing and Communication (University of Sri Jayewardenepura)' },
    { slug: 'pvwp-wijesinha', name: 'Mr. P. V. W. P. Wijesinha', role: 'Executive Director (Admin)', qual: 'Master in Media Research (University of Colombo)' },
    { slug: 'prasanna-kumara', name: 'Mr. Prasanna S Kumara', role: 'Executive Director of Academics', qual: 'Master in Media Research (University of Colombo)' },
    { slug: 'nalin-jayaneththi', name: 'Mr. Nalin Jayaneththi', role: 'Chief Financial Director', qual: 'Higher Diploma in Business Management' },
    { slug: 'tharaka-prasad', name: 'Mr. Tharaka Prasad', role: 'IT Executive Officer', qual: 'Bachelor of Information Technology (Hons) in Networking and Mobile Computing (Horizon Campus)' },
];

const advisors = [
    { slug: 'ranjan-hettiarachchi', name: 'Prof. Ranjan Hettiarachchi', role: 'Strategic Advisor / Senior Academic & Media Policy Consultant' },
    { slug: 'tudor-weerasinghe', name: 'Prof. Tudor Weerasinghe', role: 'Academic Advisor / Senior Academic & Media Policy Consultant' },
];

const mandate = [
    ['Quality Assurance', 'Compliance with national higher education accreditation frameworks.'],
    ['Curriculum Integrity', 'Updating course modules for global relevance and current media trends.'],
    ['Higher Ed Alignment', 'Guiding academic progression towards degree-granting status.'],
];

const structure = [
    ['Academy', 'A/L classes, certificate, advanced certificate, diploma and higher diploma programmes.'],
    ['Research Centre', 'Media consumption, social media behaviour, misinformation, AI and media, online safety.'],
    ['Media and Digital Development Centre', 'Practical skills: content, social media, photography, videography, design, AI tools.'],
    ['Media Production Unit', 'Photography, videography, event coverage, editing and livestreaming that give students real experience.'],
    ['Learning and Event Centre', 'Classrooms and multi-purpose halls for training, seminars, workshops and examinations.'],
    ['Community Development Division', 'Media literacy workshops, school programmes, teacher development and digital inclusion.'],
];

const objectives = [
    'Promote media and digital literacy',
    'Develop professional media and communication skills',
    'Offer structured academic pathways in media and digital fields',
    'Support G.C.E. A/L Media and ICT students',
    'Build certificate, diploma and higher diploma programmes',
    'Explore degree-level pathways with suitable partner institutions',
    'Carry out relevant media and digital research',
    'Provide professional and corporate training',
    'Support disadvantaged learners through scholarships and assistance',
];

const values = [
    ['Academic integrity', 'Quality, accuracy and responsible scholarship.'],
    ['Independence', 'Intellectual and institutional independence.'],
    ['Innovation', 'Creativity, technology and new approaches.'],
    ['Critical thinking', 'Evidence-based thinking and informed decisions.'],
    ['Accessibility', 'Learning opportunities for diverse communities.'],
    ['Professionalism', 'High standards in education and professional services.'],
    ['Social responsibility', 'Using institutional resources for positive community impact.'],
    ['Transparency', 'Responsible financial and institutional practices.'],
];

const campusStats = [
    [2776, 'SQFT floor space'],
    [3, 'Lecture halls'],
    [60, 'Student capacity'],
    [357, 'SQFT main lobby'],
];

const facilities = [
    ['Lecture Halls', '3 halls with a total capacity of 60 students: Lecture Hall 1, 2 and 3 with 20 seats each.', 'lecture-hall.jpg'],
    ['Main Lobby & Reception', 'A 357 SQFT welcoming area for students and visitors.', 'lobby.jpg'],
    ['IT Lab', 'A dedicated room for tech and digital practical sessions.', 'it-lab.jpg'],
    ['Offices & GM Suite', '2 administrative offices and a GM suite for executive management and operations.', 'offices.jpg'],
];

const initials = (name) =>
    name
        .replace(/^(Mr|Mrs|Prof|Dr)\.?\s+/i, '')
        .split(/\s+/)
        .filter((w) => /[A-Za-z]/.test(w))
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');

function Avatar({ person, size = 'h-24 w-24' }) {
    return (
        <Photo
            src={`${IMG}team/${person.slug}.jpg`}
            alt={person.name}
            className={`${size} shrink-0 rounded-full border-4 border-white shadow-md`}
            fallback={<span className="text-2xl font-bold text-gold">{initials(person.name)}</span>}
        />
    );
}

export default function About() {
    return (
        <>
            <Head title="About IMDR" />
            <MotionStyles />
            <style>{`
                .sprockets { background-image: repeating-linear-gradient(90deg, transparent 0, transparent 10px, rgba(255,255,255,.25) 10px, rgba(255,255,255,.25) 22px); border-radius: 2px; }
                @keyframes sprocketMove { to { background-position-x: 22px; } }
                .sprockets-move { animation: sprocketMove 1.1s linear infinite; }
                @media (prefers-reduced-motion: reduce) { .sprockets-move { animation: none !important; } }
            `}</style>

            {/* ============================ HERO ============================ */}
            <section className="relative overflow-hidden bg-navy text-white">
                <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-32">
                    <div className="lg:col-span-7">
                        <p
                            style={{ '--d': '0ms' }}
                            className="hero-in mb-6 inline-flex items-center gap-2 rounded-full border border-navy-400 px-4 py-1.5 text-xs font-bold tracking-widest text-gold"
                        >
                            <span className="rec-pulse h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                            RESEARCH • EDUCATE • EMPOWER
                        </p>

                        <h1
                            style={{ '--d': '120ms' }}
                            className="hero-in display-wide text-5xl sm:text-6xl xl:text-7xl"
                        >
                            About IMDR
                        </h1>

                        <p style={{ '--d': '220ms' }} className="hero-in mt-4 text-xl font-semibold text-gold">
                            Institute of Media Development and Research
                        </p>

                        <p style={{ '--d': '340ms' }} className="hero-in mt-8 max-w-2xl text-lg leading-8 text-navy-200">
                            The Institute of Media Development and Research (IMDR) is a
                            multidisciplinary higher education and research institution
                            based in Panagoda, Homagama, Sri Lanka. IMDR focuses on media
                            literacy, digital competence, ICT, modern content creation and
                            interdisciplinary research. Guided by a vision to evolve into a
                            recognised private university system, IMDR bridges the gap
                            between academic qualifications and modern industry demands
                            through practical, evidence-based learning.
                        </p>
                    </div>

                    <div style={{ '--d': '300ms' }} className="hero-in relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
                        <Photo
                            src={`${IMG}hero.jpg`}
                            alt="IMDR campus"
                            zoom={false}
                            className="kenburns aspect-[4/5] w-full rounded-3xl shadow-2xl"
                        />
                        <div className="float-slow absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-gold px-5 py-4 text-navy shadow-xl sm:-left-8">
                            <MapPin size={22} aria-hidden="true" />
                            <div>
                                <p className="text-sm font-extrabold leading-tight">Panagoda</p>
                                <p className="text-xs font-semibold">Homagama, Sri Lanka</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================ VISION & GOAL ============================ */}
            <section className="bg-paper">
                <div className="mx-auto grid max-w-6xl gap-8 px-4 py-24 sm:px-6 md:grid-cols-2 lg:py-32">
                    <Reveal className="rounded-3xl border border-navy-100 bg-white p-10 shadow-sm">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
                            <Target size={26} aria-hidden="true" />
                        </span>
                        <h2 className="mt-6 text-2xl font-bold text-navy">Institutional Vision</h2>
                        <p className="mt-4 text-lg leading-8 text-navy-600">
                            To be a recognised centre of excellence in media education,
                            digital skills, research and community empowerment.
                        </p>
                    </Reveal>

                    <Reveal delay={150} className="rounded-3xl bg-navy p-10 text-white shadow-sm">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-navy">
                            <Rocket size={26} aria-hidden="true" />
                        </span>
                        <h2 className="mt-6 text-2xl font-bold">Long-Term Goal</h2>
                        <p className="mt-4 text-lg leading-8 text-navy-200">
                            Evolution toward a premier recognised Private University
                            System in Sri Lanka, offering structured degree pathways and
                            international articulations.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* ============================ PHILOSOPHY ============================ */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
                    <Reveal className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
                            Our core strategic philosophy
                        </h2>
                        <div className="line-grow mx-auto mt-6 h-1 w-24 rounded-full bg-gold" />
                    </Reveal>

                    <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {philosophy.map(([Icon, title, text], i) => (
                            <Reveal
                                as="li"
                                key={title}
                                delay={i * 120}
                                className="group rounded-2xl border border-navy-100 bg-paper p-8 transition-all duration-300 hover:-translate-y-2 hover:border-brand hover:bg-white hover:shadow-xl"
                            >
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-gold transition duration-300 group-hover:rotate-12 group-hover:bg-brand group-hover:text-white">
                                    <Icon size={24} aria-hidden="true" />
                                </span>
                                <h3 className="mt-6 text-xl font-bold text-navy">{title}</h3>
                                <p className="mt-3 text-sm leading-7 text-navy-600">{text}</p>
                            </Reveal>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ============================ LEADERSHIP ============================ */}
            <section className="bg-paper">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
                    <Reveal className="max-w-3xl">
                        <h2 className="text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
                            Organisational leadership
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-navy-600">
                            The governing team guiding IMDR's academic, administrative and
                            financial direction.
                        </p>
                    </Reveal>

                    <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {leaders.map((p, i) => (
                            <Reveal
                                as="li"
                                key={p.slug}
                                delay={(i % 3) * 120}
                                className="flex flex-col items-center rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                            >
                                <Avatar person={p} size="h-28 w-28" />
                                <h3 className="mt-6 text-xl font-bold text-navy">{p.name}</h3>
                                <p className="mt-1 text-sm font-semibold text-brand">{p.role}</p>
                                <p className="mt-4 text-sm leading-6 text-navy-600">{p.qual}</p>
                            </Reveal>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ============================ ADVISORY ============================ */}
            <section className="bg-navy text-white">
                <div className="mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32">
                    <div>
                        <Reveal>
                            <span className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-gold">
                                <GraduationCap size={18} aria-hidden="true" /> ACADEMIC & STRATEGIC ADVISORY PANEL
                            </span>
                            <h2 className="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                                Guided by senior academics
                            </h2>
                            <p className="mt-5 text-lg leading-8 text-navy-200">
                                An advisory panel guiding academic standards, course quality
                                and the journey towards university level.
                            </p>
                        </Reveal>

                        <ul className="mt-12 space-y-6">
                            {advisors.map((p, i) => (
                                <Reveal
                                    as="li"
                                    key={p.slug}
                                    delay={i * 150}
                                    className="flex items-center gap-6 rounded-2xl border border-navy-500 bg-navy-600 p-6"
                                >
                                    <Avatar person={p} />
                                    <div>
                                        <h3 className="text-xl font-bold">{p.name}</h3>
                                        <p className="mt-1 text-sm leading-6 text-navy-200">{p.role}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </ul>
                    </div>

                    <Reveal delay={200} className="self-center">
                        <h3 className="text-xl font-bold text-gold">Advisory scope & mandate</h3>
                        <ol className="mt-8 space-y-8">
                            {mandate.map(([t, d], i) => (
                                <li key={t} className="flex gap-5">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-extrabold text-navy">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className="text-lg font-bold">{t}</p>
                                        <p className="mt-1 text-sm leading-7 text-navy-200">{d}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </Reveal>
                </div>
            </section>

            {/* ============================ ORGANISATION ============================ */}
            <section className="bg-white">
                <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
                    <Reveal className="max-w-3xl">
                        <h2 className="text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
                            How the institute is organised
                        </h2>
                    </Reveal>

                    <ul className="mt-14 grid gap-6 md:grid-cols-2">
                        {structure.map(([t, d], i) => (
                            <Reveal
                                as="li"
                                key={t}
                                delay={(i % 2) * 120}
                                className="flex gap-6 rounded-2xl border border-navy-100 bg-paper p-7 transition-all duration-300 hover:border-brand hover:bg-white hover:shadow-lg"
                            >
                                <span className="text-3xl font-extrabold text-gold">0{i + 1}</span>
                                <div>
                                    <h3 className="text-lg font-bold text-navy">{t}</h3>
                                    <p className="mt-2 text-sm leading-7 text-navy-600">{d}</p>
                                </div>
                            </Reveal>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ============================ AIMS & VALUES ============================ */}
            <section className="bg-paper">
                <div className="mx-auto grid max-w-6xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-32">
                    <Reveal>
                        <h2 className="text-3xl font-bold text-navy sm:text-4xl">What we aim to do</h2>
                        <ul className="mt-8 space-y-4">
                            {objectives.map((o) => (
                                <li key={o} className="flex gap-4 text-navy-600">
                                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                                    <span className="leading-7">{o}</span>
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <Reveal delay={150}>
                        <h2 className="text-3xl font-bold text-navy sm:text-4xl">What we stand for</h2>
                        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                            {values.map(([t, d]) => (
                                <div
                                    key={t}
                                    className="rounded-xl border border-navy-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
                                >
                                    <dt className="font-bold text-navy">{t}</dt>
                                    <dd className="mt-1 text-sm leading-6 text-navy-600">{d}</dd>
                                </div>
                            ))}
                        </dl>
                    </Reveal>
                </div>
            </section>

            {/* ============================ CAMPUS ============================ */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
                    <Reveal className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-brand">
                            <Building2 size={18} aria-hidden="true" /> CAMPUS & INFRASTRUCTURE
                        </span>
                        <h2 className="mt-4 text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
                            Our learning spaces
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-navy-600">
                            Primary campus: No. 774/C, Highlevel Road, Panagoda, Homagama.
                        </p>
                    </Reveal>

                    <dl className="mt-14 grid grid-cols-2 gap-6 rounded-3xl bg-navy p-8 text-center text-white sm:p-12 lg:grid-cols-4">
                        {campusStats.map(([n, label]) => (
                            <div key={label}>
                                <dt className="text-4xl font-extrabold text-gold sm:text-5xl">
                                    <CountUp to={n} />
                                </dt>
                                <dd className="mt-2 text-sm text-navy-200">{label}</dd>
                            </div>
                        ))}
                    </dl>

                    <ul className="mt-14 grid gap-8 sm:grid-cols-2">
                        {facilities.map(([t, d, img], i) => (
                            <Reveal
                                as="li"
                                key={t}
                                delay={(i % 2) * 120}
                                className="group overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                            >
                                <Photo src={`${IMG}${img}`} alt={t} className="aspect-[16/9]" />
                                <div className="p-7">
                                    <h3 className="text-xl font-bold text-navy">{t}</h3>
                                    <p className="mt-2 text-sm leading-7 text-navy-600">{d}</p>
                                </div>
                            </Reveal>
                        ))}
                    </ul>

                    <Reveal className="mt-12 grid gap-6 md:grid-cols-2">
                        <div className="rounded-2xl bg-paper p-7">
                            <h3 className="font-bold text-navy">Student amenities</h3>
                            <p className="mt-2 text-sm leading-7 text-navy-600">
                                Dining room, restrooms and washroom facilities.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-paper p-7">
                            <h3 className="font-bold text-navy">Note</h3>
                            <p className="mt-2 text-sm leading-7 text-navy-600">
                                G.C.E. A/L and specialised certificate classes are supported
                                through dedicated premise extensions.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ============================ CTA ============================ */}
            <section className="relative overflow-hidden bg-brand text-white">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-25"
                    style={{ backgroundImage: `url(${IMG}cta.jpg)` }}
                    aria-hidden="true"
                />
                <div className="sprockets sprockets-move relative h-3" aria-hidden="true" />
                <Reveal className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-24 sm:px-6">
                    <div>
                        <h2 className="text-3xl font-bold sm:text-5xl">Be part of IMDR</h2>
                        <p className="mt-4 max-w-xl text-lg leading-8 text-brand-100">
                            Explore our specialised courses or submit your application
                            online. No student account registration is required.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Button href="/courses" variant="gold" size="lg">
                            See our courses
                        </Button>
                        <Button href="/apply" variant="outline" size="lg">
                            Apply Now
                        </Button>
                    </div>
                </Reveal>
            </section>
        </>
    );
}