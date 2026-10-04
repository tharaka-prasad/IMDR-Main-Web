import { useEffect, useMemo, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import {
  ArrowRight,
  Clock,
  Cpu,
  Film,
  Image as ImageIcon,
  LayoutGrid,
  Layers,
  List,
  Newspaper,
} from "lucide-react";
import { Button, SearchBox } from "../../Components/ui";
import { MotionStyles, Reveal } from "../../Components/motion";
import { cx, money, useFilters } from "../../lib";

/**
 * IMAGE SLOTS
 * Per course : public/images/courses/<course-slug>.jpg   landscape ~1200x675
 *              (e.g. storytelling.jpg, ai-for-media.jpg, digital-marketing.jpg)
 * Fallback   : public/images/home/course-default.jpg     landscape ~800x450
 * CTA banner : public/images/about/cta.jpg               (same image as the About page)
 * A course can also carry its own c.image_url / c.image from the database.
 */
const COURSE_IMG = "/images/courses/";
const DEFAULT_IMG = "/images/home/course-default.jpg";
const CTA_IMG = "/images/about/cta.jpg";

/** Filter "reels". `name` must match the courses.category column. */
const CATS = [
  {
    name: "Media & Journalism",
    Icon: Newspaper,
    blurb: "News, reporting, critique and media management.",
    tile: "bg-brand text-white",
    dot: "bg-brand",
  },
  {
    name: "Cinema & Production",
    Icon: Film,
    blurb: "Camera, acting, photography, sound and film-making.",
    tile: "bg-gold text-navy",
    dot: "bg-gold",
  },
  {
    name: "Tech, AI & Digital Business",
    Icon: Cpu,
    blurb: "AI tools, design, marketing and online business.",
    tile: "bg-navy-500 text-white",
    dot: "bg-navy-400",
  },
];

const ALL_TILE = {
  name: "all",
  Icon: Layers,
  blurb: "Every course in one playlist.",
  tile: "bg-navy text-white",
};

const dotFor = (category) =>
  CATS.find((c) => c.name === category)?.dot || "bg-navy-300";
const pad = (n) => String(n).padStart(2, "0");

/** Course image: own image -> /images/courses/<slug>.jpg -> default -> placeholder. */
function CourseImage({ c, className = "", zoom = true, children }) {
  const sources = [
    c.image_url,
    c.image,
    `${COURSE_IMG}${c.slug}.jpg`,
    DEFAULT_IMG,
  ].filter(Boolean);
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
          className={`h-full w-full object-cover transition duration-700 ${zoom ? "group-hover:scale-105" : ""}`}
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

/** Running timecode, like a camera display. */
function Timecode() {
  const [t, setT] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono">{`00:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`}</span>
  );
}

/** Big preview "monitor" for the playlist view. */
function Monitor({ c, index, total }) {
  return (
    <div className="rounded-3xl bg-navy p-4 text-white shadow-2xl sm:p-5">
      <div className="sprockets mb-4 h-2.5" aria-hidden="true" />

      <div key={c.id} className="hero-in" style={{ "--d": "0ms" }}>
        <CourseImage c={c} className="aspect-[16/9] rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/30" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-navy/80 px-3 py-1 text-xs font-bold">
            <span
              className="rec-pulse h-2 w-2 rounded-full bg-red-500"
              aria-hidden="true"
            />
            REC <Timecode />
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-navy">
            SCENE {pad(index + 1)} / {pad(total)}
          </span>
        </CourseImage>

        <div className="px-1 pb-2 pt-6 sm:px-2">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold tracking-wide text-gold">
            <span>
              {(c.level_label || c.course_type?.name || "").toUpperCase()}
            </span>
            {c.duration && (
              <span className="inline-flex items-center gap-1 text-navy-200">
                <Clock size={13} aria-hidden="true" /> {c.duration}
              </span>
            )}
          </p>

          <h3 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
            {c.name}
          </h3>
          <p className="mt-4 text-sm leading-7 text-navy-200">{c.summary}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href={`/courses/${c.slug}`} variant="gold">
              View course
            </Button>
            <Link
              href="/apply"
              className="text-sm font-semibold text-gold hover:underline"
            >
              Apply Now
            </Link>
            {c.fee_structure && (
              <span className="ml-auto text-right text-xs text-navy-300">
                Course fee
                <span className="block text-lg font-bold text-white">
                  {money(c.fee_structure.course_fee)}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="sprockets mt-4 h-2.5" aria-hidden="true" />
    </div>
  );
}

/** Film-frame card for the grid view. */
function FrameCard({ c, index }) {
  return (
    <Link
      href={`/courses/${c.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-navy text-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="sprockets mx-3 mt-3 h-2.5" aria-hidden="true" />

      <CourseImage c={c} className="m-3 aspect-[16/10] rounded-lg">
        <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy">
          {c.level_label || c.course_type?.name}
        </span>
        <span className="absolute bottom-3 right-3 font-mono text-xs font-bold text-white/80">
          SC {pad(index + 1)}
        </span>
      </CourseImage>

      <div className="flex flex-1 flex-col px-6 pb-4 pt-2">
        <p className="flex items-center gap-2 text-xs text-navy-300">
          <span
            className={`h-2 w-2 rounded-full ${dotFor(c.category)}`}
            aria-hidden="true"
          />
          {c.category}
          {c.duration && <span className="ml-auto">{c.duration}</span>}
        </p>
        <h3 className="mt-3 text-xl font-bold leading-snug transition group-hover:text-gold">
          {c.name}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-navy-200">
          {c.summary}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold">
            View course{" "}
            <ArrowRight
              size={16}
              className="transition group-hover:translate-x-1.5"
            />
          </span>
          {c.fee_structure && (
            <span className="text-sm font-bold">
              {money(c.fee_structure.course_fee)}
            </span>
          )}
        </div>
      </div>

      <div className="sprockets mx-3 mb-3 h-2.5" aria-hidden="true" />
    </Link>
  );
}

export default function Index({ courses, types, filters }) {
  const [f, setF] = useFilters("/courses", {
    q: filters.q,
    type: filters.type,
  });
  const [cat, setCat] = useState("all");
  const [view, setView] = useState("playlist");
  const [activeId, setActiveId] = useState(null);

  const levels = (types || []).filter(
    (t) => t.courses_count === undefined || t.courses_count > 0,
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATS.map((k) => [
          k.name,
          courses.filter((c) => c.category === k.name).length,
        ]),
      ),
    [courses],
  );

  const current = cat !== "all" && counts[cat] > 0 ? cat : "all";
  const list = useMemo(
    () =>
      current === "all"
        ? courses
        : courses.filter((c) => c.category === current),
    [courses, current],
  );

  const activeIndex = Math.max(
    0,
    list.findIndex((c) => c.id === activeId),
  );
  const activeCourse = list[activeIndex];

  const tiles = [ALL_TILE, ...CATS.filter((k) => counts[k.name] > 0)];

  return (
    <>
      <Head title="Courses" />
      <MotionStyles />
      <style>{`
                .sprockets { background-image: repeating-linear-gradient(90deg, transparent 0, transparent 10px, rgba(255,255,255,.25) 10px, rgba(255,255,255,.25) 22px); border-radius: 2px; }
                @keyframes sprocketMove { to { background-position-x: 22px; } }
                .sprockets-move { animation: sprocketMove 1.1s linear infinite; }
                .ghost-num { color: transparent; -webkit-text-stroke: 2px rgba(255,255,255,.14); }
                @media (prefers-reduced-motion: reduce) { .sprockets-move { animation: none !important; } }
            `}</style>

      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-navy text-white">
        <span
          className="ghost-num pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 select-none text-[22rem] font-extrabold leading-none lg:block"
          aria-hidden="true"
        >
          18
        </span>

        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-20 sm:px-6 lg:pb-36 lg:pt-28">
          <p
            style={{ "--d": "0ms" }}
            className="hero-in mb-6 inline-flex items-center gap-2 rounded-full border border-navy-400 px-4 py-1.5 text-xs font-bold tracking-widest text-gold"
          >
            <span
              className="rec-pulse h-2 w-2 rounded-full bg-red-500"
              aria-hidden="true"
            />
            NOW SHOWING <span className="text-navy-300">·</span> <Timecode />
          </p>

          <h1
            style={{ "--d": "120ms" }}
            className="hero-in display-wide max-w-3xl text-5xl sm:text-6xl xl:text-7xl"
          >
            Start where you are.
          </h1>

          <p
            style={{ "--d": "240ms" }}
            className="hero-in mt-5 text-xl font-semibold text-gold"
          >
            Every certificate level leads to the next.
          </p>

          <p
            style={{ "--d": "360ms" }}
            className="hero-in mt-8 max-w-2xl text-lg leading-8 text-navy-200"
          >
            At IMDR we combine theory with 100% practical learning. Our 18
            specialised courses help you build a career in media, cinema, IT and
            AI.
          </p>

          <p
            style={{ "--d": "480ms" }}
            className="hero-in mt-8 max-w-xl rounded-xl border border-navy-500 bg-navy-600 px-5 py-4 text-sm leading-6 text-navy-200"
          >
            <span className="font-bold text-white">
              No online account needed.
            </span>{" "}
            Fill in the Application Form to apply for any course, or visit our
            institute directly.
          </p>
        </div>

        <div className="bg-navy-600 py-2" aria-hidden="true">
          <div className="sprockets sprockets-move h-3" />
        </div>
      </section>

      {/* ============================ REEL TILES ============================ */}
      <section className="relative z-10 bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            className="-mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            role="group"
            aria-label="Filter by category"
          >
            {tiles.map((k, i) => {
              const on = current === k.name;
              const total = k.name === "all" ? courses.length : counts[k.name];

              return (
                <Reveal key={k.name} delay={i * 100}>
                  <button
                    type="button"
                    onClick={() => {
                      setCat(k.name);
                      setActiveId(null);
                    }}
                    aria-pressed={on}
                    className={cx(
                      "group relative h-full w-full overflow-hidden rounded-2xl p-6 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
                      on ? `${k.tile} ring-4 ring-gold` : "bg-white text-navy",
                    )}
                  >
                    <span
                      className={cx(
                        "flex h-12 w-12 items-center justify-center rounded-full transition duration-300 group-hover:rotate-12",
                        on ? "bg-white text-navy" : "bg-paper text-brand",
                      )}
                    >
                      <k.Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="mt-5 flex items-baseline gap-3">
                      <span className="text-4xl font-extrabold leading-none">
                        {pad(total)}
                      </span>
                      <span className="text-sm font-bold">
                        {k.name === "all" ? "All Courses" : k.name}
                      </span>
                    </span>
                    <span
                      className={cx(
                        "mt-3 block text-sm leading-6",
                        on ? "opacity-80" : "text-navy-600",
                      )}
                    >
                      {k.blurb}
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ LIST ============================ */}
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal className="flex flex-wrap items-center gap-4">
            <SearchBox
              className="w-full sm:w-80"
              value={f.q}
              onChange={(v) => setF({ q: v })}
              placeholder="Search courses"
            />

            {levels.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-navy-600">
                Level
                <select
                  value={f.type || ""}
                  onChange={(e) => setF({ type: e.target.value }, true)}
                  className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy focus:border-brand focus:outline-none"
                >
                  <option value="">All levels</option>
                  {levels.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div
              className="ml-auto inline-flex rounded-full border border-navy-200 bg-white p-1"
              role="group"
              aria-label="Change layout"
            >
              {[
                ["playlist", List, "Playlist"],
                ["grid", LayoutGrid, "Grid"],
              ].map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition",
                    view === key
                      ? "bg-navy text-white"
                      : "text-navy hover:text-brand",
                  )}
                >
                  <Icon size={15} aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
          </Reveal>

          {list.length === 0 ? (
            <p className="mt-14 rounded-2xl border border-dashed border-navy-200 bg-white p-12 text-center text-navy-500">
              No courses match your search. Try a different word or clear the
              filter.
            </p>
          ) : view === "grid" ? (
            <ul
              key={`g-${current}`}
              className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {list.map((c, i) => (
                <Reveal as="li" key={c.id} delay={(i % 3) * 120}>
                  <FrameCard c={c} index={i} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <div
              key={`p-${current}`}
              className="mt-14 grid gap-12 lg:grid-cols-12"
            >
              <ol className="lg:col-span-6">
                {list.map((c, i) => {
                  const on = i === activeIndex;

                  return (
                    <Reveal
                      as="li"
                      key={c.id}
                      delay={Math.min(i, 6) * 60}
                      className="border-b border-navy-100 first:border-t"
                    >
                      <Link
                        href={`/courses/${c.slug}`}
                        onMouseEnter={() => setActiveId(c.id)}
                        onFocus={() => setActiveId(c.id)}
                        className={cx(
                          "group relative flex items-start gap-5 px-3 py-6 transition-all duration-300 sm:px-5",
                          on
                            ? "bg-navy text-white lg:translate-x-3"
                            : "hover:bg-white",
                        )}
                      >
                        <span
                          className={cx(
                            "absolute inset-y-0 left-0 w-1.5 origin-top bg-gold transition-transform duration-300",
                            on ? "scale-y-100" : "scale-y-0",
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cx(
                            "w-10 shrink-0 font-mono text-lg font-bold",
                            on ? "text-gold" : "text-navy-300",
                          )}
                        >
                          {pad(i + 1)}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
                            <span
                              className={cx(
                                "h-2 w-2 rounded-full",
                                dotFor(c.category),
                              )}
                              aria-hidden="true"
                            />
                            <span className={on ? "text-gold" : "text-brand"}>
                              {c.level_label || c.course_type?.name}
                            </span>
                            {c.duration && (
                              <span
                                className={
                                  on ? "text-navy-200" : "text-navy-500"
                                }
                              >
                                {c.duration}
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-xl font-bold leading-snug">
                            {c.name}
                          </span>
                          <span
                            className={cx(
                              "mt-2 block text-sm leading-6 lg:hidden",
                              on ? "text-navy-200" : "text-navy-600",
                            )}
                          >
                            {c.summary}
                          </span>
                        </span>

                        <ArrowRight
                          size={20}
                          className={cx(
                            "mt-1 shrink-0 transition duration-300",
                            on
                              ? "translate-x-0 text-gold opacity-100"
                              : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                          )}
                          aria-hidden="true"
                        />
                      </Link>
                    </Reveal>
                  );
                })}
              </ol>

              <div className="hidden lg:col-span-6 lg:block">
                <div className="sticky top-8">
                  {activeCourse && (
                    <Monitor
                      c={activeCourse}
                      index={activeIndex}
                      total={list.length}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="relative overflow-hidden bg-brand text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${CTA_IMG})` }}
          aria-hidden="true"
        />
        <div
          className="sprockets sprockets-move relative h-3"
          aria-hidden="true"
        />
        <Reveal className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-20 sm:px-6">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Not sure which course is right for you?
            </h2>
            <p className="mt-3 max-w-xl text-lg leading-8 text-brand-100">
              Call or WhatsApp our office and we will help you choose.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button href="/apply" variant="gold" size="lg">
              Apply Now
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact Us
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}