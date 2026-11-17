import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { router, Link as Link$1, usePage, Head, useForm, createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";
import { Check, AlertTriangle, X, Search, Image, MapPin, Target, Rocket, BookOpen, Wrench, Users, GraduationCap, Building2, Plus, Pencil, Trash2, ClipboardList, UserRound, PhoneCall, CheckCircle2, Phone, MessageCircle, Download, Camera, Film, Mic, Video, Aperture, EyeOff, Eye, Award, Printer, Mail, Clock, Send, Layers, List, LayoutGrid, ArrowRight, Newspaper, Cpu, Play, PenLine, Link2, Presentation, FileText, ExternalLink, Lock, Loader2, KeyRound, UserPlus, Upload, Menu, Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
const cx = (...parts) => parts.filter(Boolean).join(" ");
const money = (n) => "Rs. " + Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const parse = (v) => {
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d2] = v.split("-").map(Number);
    return new Date(y, m - 1, d2);
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const fmtDate = (v) => {
  const d = parse(v);
  return d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
};
const fmtDateTime = (v) => {
  const d = parse(v);
  return d ? d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
};
const toLocalInput = (iso) => {
  const d = parse(iso);
  if (!d) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fmtSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
};
const GOOD = ["paid", "approved", "active", "success", "sent", "valid", "open", "held", "present", "completed", "true", "published", "credited"];
const WARN = ["pending", "unpaid", "partial", "running", "scheduled", "simulated", "draft", "late", "pending_approval", "partially_refunded", "monthly"];
const BAD = ["failed", "rejected", "cancelled", "suspended", "overdue", "revoked", "absent", "refunded", "payment_delay", "closed"];
const tone = (value) => {
  const v = String(value ?? "").toLowerCase();
  if (GOOD.includes(v)) return "green";
  if (WARN.includes(v)) return "amber";
  if (BAD.includes(v)) return "red";
  return "blue";
};
const label = (value) => String(value ?? "").replace(/[_-]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
function useFilters(path, initial) {
  const [values2, setValues] = useState(initial);
  const timer = useRef(null);
  const update = (patch, immediate = false) => {
    const next = { ...values2, ...patch };
    setValues(next);
    clearTimeout(timer.current);
    const go = () => router.get(
      path,
      Object.fromEntries(Object.entries(next).filter(([, v]) => v !== "" && v != null && v !== false)),
      { preserveState: true, replace: true, preserveScroll: true }
    );
    immediate ? go() : timer.current = setTimeout(go, 350);
  };
  return [values2, update];
}
const confirmThen = (message, fn) => {
  if (window.confirm(message)) fn();
};
const buttonVariants = {
  primary: "bg-navy text-white hover:bg-navy-700",
  gold: "bg-gold text-navy hover:bg-gold-400",
  brand: "bg-brand text-white hover:bg-brand-600",
  outline: "border border-navy-200 bg-white text-navy hover:bg-navy-50",
  ghost: "text-navy hover:bg-navy-50",
  subtle: "bg-navy-50 text-navy hover:bg-navy-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  dangerOutline: "border border-red-200 bg-white text-red-700 hover:bg-red-50"
};
const buttonSizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
function Button({ variant = "primary", size = "md", href, native, className, children, ...props }) {
  const cls = cx(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    buttonSizes[size],
    buttonVariants[variant],
    className
  );
  if (href && native) {
    return /* @__PURE__ */ jsx("a", { href, className: cls, ...props, children });
  }
  if (href) {
    return /* @__PURE__ */ jsx(Link$1, { href, className: cls, ...props, children });
  }
  return /* @__PURE__ */ jsx("button", { type: "button", className: cls, ...props, children });
}
function Card({ className, children, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cx("rounded-xl border border-navy-100 bg-white", className), ...props, children });
}
function PageHeader({ title, subtitle, actions }) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap items-end justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-navy sm:text-3xl", children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-2xl text-sm text-navy-500", children: subtitle })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-2", children: actions })
  ] });
}
function Field({ label: text2, error, help, children, className }) {
  return /* @__PURE__ */ jsxs("label", { className: cx("block", className), children: [
    text2 && /* @__PURE__ */ jsx("span", { className: "mb-1 block text-sm font-medium text-navy-700", children: text2 }),
    children,
    help && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs text-navy-400", children: help }),
    error && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs font-medium text-red-600", children: error })
  ] });
}
const TextInput = ({ className, ...props }) => /* @__PURE__ */ jsx("input", { className: cx("input", className), ...props });
const TextArea = ({ className, ...props }) => /* @__PURE__ */ jsx("textarea", { rows: 3, className: cx("input", className), ...props });
function SelectInput({ options: options2 = [], placeholder = "Choose...", className, ...props }) {
  return /* @__PURE__ */ jsxs("select", { className: cx("input", className), ...props, children: [
    placeholder !== null && /* @__PURE__ */ jsx("option", { value: "", children: placeholder }),
    options2.map((o) => /* @__PURE__ */ jsx("option", { value: o.value, children: o.label }, o.value))
  ] });
}
function Check2({ label: text2, checked, onChange, help }) {
  return /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2 text-sm", children: [
    /* @__PURE__ */ jsx("input", { type: "checkbox", checked: !!checked, onChange: (e) => onChange(e.target.checked), className: "mt-0.5 h-4 w-4 rounded border-navy-300 text-brand focus:ring-brand" }),
    /* @__PURE__ */ jsxs("span", { children: [
      /* @__PURE__ */ jsx("span", { className: "font-medium text-navy-700", children: text2 }),
      help && /* @__PURE__ */ jsx("span", { className: "block text-xs text-navy-400", children: help })
    ] })
  ] });
}
function Modal({ open, onClose, title, children, wide, footer }) {
  useEffect(() => {
    if (!open) return void 0;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/60 p-3 sm:p-8", onMouseDown: (e) => e.target === e.currentTarget && onClose(), children: /* @__PURE__ */ jsxs("div", { role: "dialog", "aria-modal": "true", "aria-label": title, className: cx("w-full rounded-xl bg-white shadow-lift", wide ? "max-w-3xl" : "max-w-lg"), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-navy-100 px-5 py-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold", children: title }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "rounded-md p-1 text-navy-400 hover:bg-navy-50 hover:text-navy", "aria-label": "Close", children: /* @__PURE__ */ jsx(X, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-5 py-4", children }),
    footer && /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2 border-t border-navy-100 px-5 py-3", children: footer })
  ] }) });
}
const badgeTones = {
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  amber: "bg-gold-50 text-gold-700 ring-gold-100",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-brand-50 text-brand-700 ring-brand-100",
  gray: "bg-navy-50 text-navy-600 ring-navy-100"
};
function Badge({ tone: t = "gray", children, className }) {
  return /* @__PURE__ */ jsx("span", { className: cx("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", badgeTones[t], className), children });
}
function Status({ value, text: text2 }) {
  return /* @__PURE__ */ jsx(Badge, { tone: tone(value), children: text2 ?? label(value) });
}
function Alert({ tone: t = "blue", title, children, className }) {
  const styles = {
    blue: "border-brand-200 bg-brand-50 text-navy",
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-gold-400 bg-gold-50 text-navy",
    red: "border-red-200 bg-red-50 text-red-900"
  };
  return /* @__PURE__ */ jsxs("div", { className: cx("rounded-lg border px-4 py-3 text-sm", styles[t], className), role: t === "red" ? "alert" : "status", children: [
    title && /* @__PURE__ */ jsx("p", { className: "font-semibold", children: title }),
    /* @__PURE__ */ jsx("div", { children })
  ] });
}
function Stat({ label: text2, value, hint, accent = "brand" }) {
  const border = { brand: "border-brand", gold: "border-gold", navy: "border-navy", red: "border-red-500", green: "border-emerald-500" }[accent];
  return /* @__PURE__ */ jsxs("div", { className: cx("rounded-xl border border-navy-100 border-l-4 bg-white px-4 py-3", border), children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: text2 }),
    /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-2xl font-bold text-navy", children: value }),
    hint && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-navy-400", children: hint })
  ] });
}
function Empty({ title, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-dashed border-navy-200 bg-white px-6 py-10 text-center", children: [
    /* @__PURE__ */ jsx("p", { className: "font-semibold text-navy", children: title }),
    children && /* @__PURE__ */ jsx("div", { className: "mx-auto mt-1 max-w-md text-sm text-navy-500", children })
  ] });
}
function TableWrap({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-navy-100 bg-white", children: /* @__PURE__ */ jsx("table", { className: "min-w-full divide-y divide-navy-100", children }) });
}
const Thead = ({ children }) => /* @__PURE__ */ jsx("thead", { className: "bg-navy-50", children: /* @__PURE__ */ jsx("tr", { children }) });
function Pagination({ paginator }) {
  if (!paginator) return null;
  const { from, to, total, prev_page_url: prev, next_page_url: next } = paginator;
  return /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-navy-500", children: [
    /* @__PURE__ */ jsx("span", { children: total ? `Showing ${from} to ${to} of ${total}` : "Nothing to show" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      prev ? /* @__PURE__ */ jsx(Button, { href: prev, variant: "outline", size: "sm", preserveScroll: true, children: "Previous" }) : /* @__PURE__ */ jsx("span", { className: "rounded-lg border border-navy-100 px-2.5 py-1.5 text-xs text-navy-300", children: "Previous" }),
      next ? /* @__PURE__ */ jsx(Button, { href: next, variant: "outline", size: "sm", preserveScroll: true, children: "Next" }) : /* @__PURE__ */ jsx("span", { className: "rounded-lg border border-navy-100 px-2.5 py-1.5 text-xs text-navy-300", children: "Next" })
    ] })
  ] });
}
function SearchBox({ value, onChange, placeholder = "Search...", className }) {
  return /* @__PURE__ */ jsxs("div", { className: cx("relative", className), children: [
    /* @__PURE__ */ jsx(Search, { size: 16, className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" }),
    /* @__PURE__ */ jsx("input", { type: "search", value, onChange: (e) => onChange(e.target.value), placeholder, "aria-label": placeholder, className: "input pl-9" })
  ] });
}
function FlashMessages() {
  const { flash } = usePage().props;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    (flash == null ? void 0 : flash.success) && /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900", role: "status", children: [
      /* @__PURE__ */ jsx(Check, { size: 16, className: "mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsx("span", { children: flash.success })
    ] }),
    (flash == null ? void 0 : flash.error) && /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900", role: "alert", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { size: 16, className: "mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsx("span", { children: flash.error })
    ] })
  ] });
}
function FormError({ errors }) {
  const list = Object.values(errors || {});
  if (!list.length) return null;
  return /* @__PURE__ */ jsx(Alert, { tone: "red", className: "mb-3", children: list.length === 1 ? list[0] : "Please fix the highlighted fields." });
}
function useInView$1(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}
function Reveal$1({ children, delay = 0, className = "", as: Tag = "div" }) {
  const [ref, inView] = useInView$1();
  return /* @__PURE__ */ jsx(
    Tag,
    {
      ref,
      style: { "--d": `${delay}ms` },
      className: `reveal ${inView ? "in" : ""} ${className}`,
      children
    }
  );
}
function CountUp$1({ to, duration = 1400 }) {
  const [ref, inView] = useInView$1(0.4);
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
  return /* @__PURE__ */ jsx("span", { ref, children: n.toLocaleString() });
}
function Photo$1({ src, alt, className = "", zoom = true, fallback = null, children }) {
  const [failed, setFailed] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: `group relative overflow-hidden bg-navy-600 ${className}`, children: [
    !failed ? /* @__PURE__ */ jsx(
      "img",
      {
        src,
        alt,
        loading: "lazy",
        onError: () => setFailed(true),
        className: `h-full w-full object-cover transition duration-700 ${zoom ? "group-hover:scale-105" : ""}`
      }
    ) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-500 to-navy text-navy-300", children: fallback ?? /* @__PURE__ */ jsx(Image, { size: 40, "aria-hidden": "true" }) }),
    children
  ] });
}
const COURSE_IMG$1 = "/images/courses/";
const COURSE_DEFAULT_IMG = `${COURSE_IMG$1}course-default.jpg`;
function CourseImage$1({ c, className = "", zoom = true, children }) {
  const sources = [c.image_url, c.image, `${COURSE_IMG$1}${c.slug}.jpg`, COURSE_DEFAULT_IMG].filter(Boolean);
  const [i, setI] = useState(0);
  return /* @__PURE__ */ jsxs("div", { className: `group relative overflow-hidden bg-navy-600 ${className}`, children: [
    i < sources.length ? /* @__PURE__ */ jsx(
      "img",
      {
        src: sources[i],
        alt: c.name,
        loading: "lazy",
        onError: () => setI(i + 1),
        className: `h-full w-full object-cover transition duration-700 ${zoom ? "group-hover:scale-105" : ""}`
      },
      sources[i]
    ) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-500 to-navy text-navy-300", children: /* @__PURE__ */ jsx(Image, { size: 40, "aria-hidden": "true" }) }),
    children
  ] });
}
function MotionStyles() {
  return /* @__PURE__ */ jsx("style", { children: `
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
        ` });
}
const IMG$1 = "/images/about/";
const philosophy = [
  [BookOpen, "Educate", "Structured academic qualifications from Certificate levels to Diplomas and Higher Diplomas."],
  [Wrench, "Develop", "Practical media, technology and IT skills suited for modern industries."],
  [Search, "Research", "Evidence-based knowledge generation, media ethics and AI integration."],
  [Users, "Empower", "Community advancement, digital inclusion and youth empowerment."]
];
const leaders = [
  { slug: "nilusha-hapuarachchi", name: "Mr. Nilusha Hapuarachchi", role: "Chairman", qual: "Diploma in Wildlife (Wildlife Trust) & Diploma in Film Direction" },
  { slug: "gayani-kaushaliya", name: "Mrs. Gayani Kaushaliya", role: "Vice Chairman", qual: "Diploma in Writing and Communication (University of Sri Jayewardenepura)" },
  { slug: "pvwp-wijesinha", name: "Mr. P. V. W. P. Wijesinha", role: "Executive Director (Admin)", qual: "Master in Media Research (University of Colombo)" },
  { slug: "nalin-jayaneththi", name: "Mr. Nalin Jayaneththi", role: "Chief Financial Director", qual: "Higher Diploma in Business Management" },
  { slug: "tharaka-prasad", name: "Mr. Tharaka Prasad", role: "IT Executive Officer", qual: "Bachelor of Information Technology (Hons) in Networking and Mobile Computing (Horizon Campus)" }
];
const advisors = [
  { slug: "ranjan-hettiarachchi", name: "Prof. Ranjan Hettiarachchi", role: "Strategic Advisor / Senior Academic & Media Policy Consultant" },
  { slug: "tudor-weerasinghe", name: "Prof. Tudor Weerasinghe", role: "Academic Advisor / Senior Academic & Media Policy Consultant" }
];
const mandate = [
  ["Quality Assurance", "Compliance with national higher education accreditation frameworks."],
  ["Curriculum Integrity", "Updating course modules for global relevance and current media trends."],
  ["Higher Ed Alignment", "Guiding academic progression towards degree-granting status."]
];
const structure = [
  ["Academy", "A/L classes, certificate, advanced certificate, diploma and higher diploma programmes."],
  ["Research Centre", "Media consumption, social media behaviour, misinformation, AI and media, online safety."],
  ["Media and Digital Development Centre", "Practical skills: content, social media, photography, videography, design, AI tools."],
  ["Media Production Unit", "Photography, videography, event coverage, editing and livestreaming that give students real experience."],
  ["Learning and Event Centre", "Classrooms and multi-purpose halls for training, seminars, workshops and examinations."],
  ["Community Development Division", "Media literacy workshops, school programmes, teacher development and digital inclusion."]
];
const objectives = [
  "Promote media and digital literacy",
  "Develop professional media and communication skills",
  "Offer structured academic pathways in media and digital fields",
  "Support G.C.E. A/L Media and ICT students",
  "Build certificate, diploma and higher diploma programmes",
  "Explore degree-level pathways with suitable partner institutions",
  "Carry out relevant media and digital research",
  "Provide professional and corporate training",
  "Support disadvantaged learners through scholarships and assistance"
];
const values = [
  ["Academic integrity", "Quality, accuracy and responsible scholarship."],
  ["Independence", "Intellectual and institutional independence."],
  ["Innovation", "Creativity, technology and new approaches."],
  ["Critical thinking", "Evidence-based thinking and informed decisions."],
  ["Accessibility", "Learning opportunities for diverse communities."],
  ["Professionalism", "High standards in education and professional services."],
  ["Social responsibility", "Using institutional resources for positive community impact."],
  ["Transparency", "Responsible financial and institutional practices."]
];
const campusStats = [
  [2776, "SQFT floor space"],
  [3, "Lecture halls"],
  [60, "Student capacity"],
  [357, "SQFT main lobby"]
];
const facilities = [
  ["Lecture Halls", "3 halls with a total capacity of 60 students: Lecture Hall 1, 2 and 3 with 20 seats each.", "lecture-hall.jpg"],
  ["Main Lobby & Reception", "A 357 SQFT welcoming area for students and visitors.", "lobby.jpg"],
  ["IT Lab", "A dedicated room for tech and digital practical sessions.", "it-lab.jpg"],
  ["Offices & GM Suite", "2 administrative offices and a GM suite for executive management and operations.", "offices.jpg"]
];
const initials = (name) => name.replace(/^(Mr|Mrs|Prof|Dr)\.?\s+/i, "").split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
function Avatar({ person, size = "h-24 w-24" }) {
  return /* @__PURE__ */ jsx(
    Photo$1,
    {
      src: `${IMG$1}team/${person.slug}.jpg`,
      alt: person.name,
      className: `${size} shrink-0 rounded-full border-4 border-white shadow-md`,
      fallback: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-gold", children: initials(person.name) })
    }
  );
}
function About() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "About IMDR" }),
    /* @__PURE__ */ jsx(MotionStyles, {}),
    /* @__PURE__ */ jsx("style", { children: `
                .sprockets { background-image: repeating-linear-gradient(90deg, transparent 0, transparent 10px, rgba(255,255,255,.25) 10px, rgba(255,255,255,.25) 22px); border-radius: 2px; }
                @keyframes sprocketMove { to { background-position-x: 22px; } }
                .sprockets-move { animation: sprocketMove 1.1s linear infinite; }
                @media (prefers-reduced-motion: reduce) { .sprockets-move { animation: none !important; } }
            ` }),
    /* @__PURE__ */ jsx("section", { className: "relative overflow-hidden bg-navy text-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-32", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-7", children: [
        /* @__PURE__ */ jsxs(
          "p",
          {
            style: { "--d": "0ms" },
            className: "hero-in mb-6 inline-flex items-center gap-2 rounded-full border border-navy-400 px-4 py-1.5 text-xs font-bold tracking-widest text-gold",
            children: [
              /* @__PURE__ */ jsx("span", { className: "rec-pulse h-2 w-2 rounded-full bg-red-500", "aria-hidden": "true" }),
              "RESEARCH • EDUCATE • EMPOWER"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "h1",
          {
            style: { "--d": "120ms" },
            className: "hero-in display-wide text-5xl sm:text-6xl xl:text-7xl",
            children: "About IMDR"
          }
        ),
        /* @__PURE__ */ jsx("p", { style: { "--d": "220ms" }, className: "hero-in mt-4 text-xl font-semibold text-gold", children: "Institute of Media Development and Research" }),
        /* @__PURE__ */ jsx("p", { style: { "--d": "340ms" }, className: "hero-in mt-8 max-w-2xl text-lg leading-8 text-navy-200", children: "The Institute of Media Development and Research (IMDR) is a multidisciplinary higher education and research institution based in Panagoda, Homagama, Sri Lanka. IMDR focuses on media literacy, digital competence, ICT, modern content creation and interdisciplinary research. Guided by a vision to evolve into a recognised private university system, IMDR bridges the gap between academic qualifications and modern industry demands through practical, evidence-based learning." })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { "--d": "300ms" }, className: "hero-in relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none", children: [
        /* @__PURE__ */ jsx(
          Photo$1,
          {
            src: `${IMG$1}hero.jpg`,
            alt: "IMDR campus",
            zoom: false,
            className: "kenburns aspect-[4/5] w-full rounded-3xl shadow-2xl"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "float-slow absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-gold px-5 py-4 text-navy shadow-xl sm:-left-8", children: [
          /* @__PURE__ */ jsx(MapPin, { size: 22, "aria-hidden": "true" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-extrabold leading-tight", children: "Panagoda" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold", children: "Homagama, Sri Lanka" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-paper", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-6xl gap-8 px-4 py-24 sm:px-6 md:grid-cols-2 lg:py-32", children: [
      /* @__PURE__ */ jsxs(Reveal$1, { className: "rounded-3xl border border-navy-100 bg-white p-10 shadow-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white", children: /* @__PURE__ */ jsx(Target, { size: 26, "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsx("h2", { className: "mt-6 text-2xl font-bold text-navy", children: "Institutional Vision" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-lg leading-8 text-navy-600", children: "To be a recognised centre of excellence in media education, digital skills, research and community empowerment." })
      ] }),
      /* @__PURE__ */ jsxs(Reveal$1, { delay: 150, className: "rounded-3xl bg-navy p-10 text-white shadow-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-gold text-navy", children: /* @__PURE__ */ jsx(Rocket, { size: 26, "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsx("h2", { className: "mt-6 text-2xl font-bold", children: "Long-Term Goal" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-lg leading-8 text-navy-200", children: "Evolution toward a premier recognised Private University System in Sri Lanka, offering structured degree pathways and international articulations." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32", children: [
      /* @__PURE__ */ jsxs(Reveal$1, { className: "mx-auto max-w-3xl text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-navy sm:text-4xl lg:text-5xl", children: "Our core strategic philosophy" }),
        /* @__PURE__ */ jsx("div", { className: "line-grow mx-auto mt-6 h-1 w-24 rounded-full bg-gold" })
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: philosophy.map(([Icon, title, text2], i) => /* @__PURE__ */ jsxs(
        Reveal$1,
        {
          as: "li",
          delay: i * 120,
          className: "group rounded-2xl border border-navy-100 bg-paper p-8 transition-all duration-300 hover:-translate-y-2 hover:border-brand hover:bg-white hover:shadow-xl",
          children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-navy text-gold transition duration-300 group-hover:rotate-12 group-hover:bg-brand group-hover:text-white", children: /* @__PURE__ */ jsx(Icon, { size: 24, "aria-hidden": "true" }) }),
            /* @__PURE__ */ jsx("h3", { className: "mt-6 text-xl font-bold text-navy", children: title }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-7 text-navy-600", children: text2 })
          ]
        },
        title
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-paper", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32", children: [
      /* @__PURE__ */ jsxs(Reveal$1, { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-navy sm:text-4xl lg:text-5xl", children: "Organisational leadership" }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 text-lg leading-8 text-navy-600", children: "The governing team guiding IMDR's academic, administrative and financial direction." })
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3", children: leaders.map((p, i) => /* @__PURE__ */ jsxs(
        Reveal$1,
        {
          as: "li",
          delay: i % 3 * 120,
          className: "flex flex-col items-center rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
          children: [
            /* @__PURE__ */ jsx(Avatar, { person: p, size: "h-28 w-28" }),
            /* @__PURE__ */ jsx("h3", { className: "mt-6 text-xl font-bold text-navy", children: p.name }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm font-semibold text-brand", children: p.role }),
            /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-6 text-navy-600", children: p.qual })
          ]
        },
        p.slug
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-navy text-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Reveal$1, { children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-bold tracking-widest text-gold", children: [
            /* @__PURE__ */ jsx(GraduationCap, { size: 18, "aria-hidden": "true" }),
            " ACADEMIC & STRATEGIC ADVISORY PANEL"
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl", children: "Guided by senior academics" }),
          /* @__PURE__ */ jsx("p", { className: "mt-5 text-lg leading-8 text-navy-200", children: "An advisory panel guiding academic standards, course quality and the journey towards university level." })
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "mt-12 space-y-6", children: advisors.map((p, i) => /* @__PURE__ */ jsxs(
          Reveal$1,
          {
            as: "li",
            delay: i * 150,
            className: "flex items-center gap-6 rounded-2xl border border-navy-500 bg-navy-600 p-6",
            children: [
              /* @__PURE__ */ jsx(Avatar, { person: p }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", children: p.name }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-6 text-navy-200", children: p.role })
              ] })
            ]
          },
          p.slug
        )) })
      ] }),
      /* @__PURE__ */ jsxs(Reveal$1, { delay: 200, className: "self-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-gold", children: "Advisory scope & mandate" }),
        /* @__PURE__ */ jsx("ol", { className: "mt-8 space-y-8", children: mandate.map(([t, d], i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-5", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-extrabold text-navy", children: i + 1 }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", children: t }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-7 text-navy-200", children: d })
          ] })
        ] }, t)) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32", children: [
      /* @__PURE__ */ jsx(Reveal$1, { className: "max-w-3xl", children: /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-navy sm:text-4xl lg:text-5xl", children: "How the institute is organised" }) }),
      /* @__PURE__ */ jsx("ul", { className: "mt-14 grid gap-6 md:grid-cols-2", children: structure.map(([t, d], i) => /* @__PURE__ */ jsxs(
        Reveal$1,
        {
          as: "li",
          delay: i % 2 * 120,
          className: "flex gap-6 rounded-2xl border border-navy-100 bg-paper p-7 transition-all duration-300 hover:border-brand hover:bg-white hover:shadow-lg",
          children: [
            /* @__PURE__ */ jsxs("span", { className: "text-3xl font-extrabold text-gold", children: [
              "0",
              i + 1
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-navy", children: t }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-7 text-navy-600", children: d })
            ] })
          ]
        },
        t
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-paper", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-6xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-32", children: [
      /* @__PURE__ */ jsxs(Reveal$1, { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-navy sm:text-4xl", children: "What we aim to do" }),
        /* @__PURE__ */ jsx("ul", { className: "mt-8 space-y-4", children: objectives.map((o) => /* @__PURE__ */ jsxs("li", { className: "flex gap-4 text-navy-600", children: [
          /* @__PURE__ */ jsx("span", { className: "mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx("span", { className: "leading-7", children: o })
        ] }, o)) })
      ] }),
      /* @__PURE__ */ jsxs(Reveal$1, { delay: 150, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-navy sm:text-4xl", children: "What we stand for" }),
        /* @__PURE__ */ jsx("dl", { className: "mt-8 grid gap-4 sm:grid-cols-2", children: values.map(([t, d]) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "rounded-xl border border-navy-100 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md",
            children: [
              /* @__PURE__ */ jsx("dt", { className: "font-bold text-navy", children: t }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm leading-6 text-navy-600", children: d })
            ]
          },
          t
        )) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32", children: [
      /* @__PURE__ */ jsxs(Reveal$1, { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-bold tracking-widest text-brand", children: [
          /* @__PURE__ */ jsx(Building2, { size: 18, "aria-hidden": "true" }),
          " CAMPUS & INFRASTRUCTURE"
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "mt-4 text-3xl font-bold text-navy sm:text-4xl lg:text-5xl", children: "Our learning spaces" }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 text-lg leading-8 text-navy-600", children: "Primary campus: No. 774/C, Highlevel Road, Panagoda, Homagama." })
      ] }),
      /* @__PURE__ */ jsx("dl", { className: "mt-14 grid grid-cols-2 gap-6 rounded-3xl bg-navy p-8 text-center text-white sm:p-12 lg:grid-cols-4", children: campusStats.map(([n, label2]) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("dt", { className: "text-4xl font-extrabold text-gold sm:text-5xl", children: /* @__PURE__ */ jsx(CountUp$1, { to: n }) }),
        /* @__PURE__ */ jsx("dd", { className: "mt-2 text-sm text-navy-200", children: label2 })
      ] }, label2)) }),
      /* @__PURE__ */ jsx("ul", { className: "mt-14 grid gap-8 sm:grid-cols-2", children: facilities.map(([t, d, img], i) => /* @__PURE__ */ jsxs(
        Reveal$1,
        {
          as: "li",
          delay: i % 2 * 120,
          className: "group overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
          children: [
            /* @__PURE__ */ jsx(Photo$1, { src: `${IMG$1}${img}`, alt: t, className: "aspect-[16/9]" }),
            /* @__PURE__ */ jsxs("div", { className: "p-7", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-navy", children: t }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-7 text-navy-600", children: d })
            ] })
          ]
        },
        t
      )) }),
      /* @__PURE__ */ jsxs(Reveal$1, { className: "mt-12 grid gap-6 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-paper p-7", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-navy", children: "Student amenities" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-7 text-navy-600", children: "Dining room, restrooms and washroom facilities." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-paper p-7", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-navy", children: "Note" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-7 text-navy-600", children: "G.C.E. A/L and specialised certificate classes are supported through dedicated premise extensions." })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden bg-brand text-white", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-cover bg-center opacity-25",
          style: { backgroundImage: `url(${IMG$1}cta.jpg)` },
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "sprockets sprockets-move relative h-3", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxs(Reveal$1, { className: "relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-24 sm:px-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold sm:text-5xl", children: "Be part of IMDR" }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-xl text-lg leading-8 text-brand-100", children: "Explore our specialised courses or submit your application online. No student account registration is required." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsx(Button, { href: "/courses", variant: "gold", size: "lg", children: "See our courses" }),
          /* @__PURE__ */ jsx(Button, { href: "/apply", variant: "outline", size: "lg", children: "Apply Now" })
        ] })
      ] })
    ] })
  ] });
}
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: About
}, Symbol.toStringTag, { value: "Module" }));
function Index$b({ departments }) {
  const [modal, setModal] = useState(null);
  const form = useForm({ name: "", code: "", description: "", is_active: true });
  const e = form.errors;
  const open = (row) => {
    form.clearErrors();
    form.setData(row ? { name: row.name, code: row.code, description: row.description ?? "", is_active: !!row.is_active } : { name: "", code: "", description: "", is_active: true });
    setModal({ row });
  };
  const submit = (ev) => {
    ev.preventDefault();
    const options2 = { preserveScroll: true, onSuccess: () => setModal(null) };
    modal.row ? form.put(`/portal/departments/${modal.row.id}`, options2) : form.post("/portal/departments", options2);
  };
  const remove = (d) => confirmThen(`Delete the department "${d.name}"?`, () => router.delete(`/portal/departments/${d.id}`, { preserveScroll: true }));
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Departments" }),
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Departments",
        subtitle: "Every course belongs to one department. The public Courses page and the admin Courses list are grouped by department.",
        actions: /* @__PURE__ */ jsxs(Button, { variant: "gold", onClick: () => open(null), children: [
          /* @__PURE__ */ jsx(Plus, { size: 16 }),
          " Add department"
        ] })
      }
    ),
    departments.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No departments yet", children: "Add your first department, then choose it when you add a course." }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Code" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Department" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Courses" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: departments.map((d) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-navy-50/50", children: [
        /* @__PURE__ */ jsx("td", { className: "td font-mono text-xs", children: d.code }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          /* @__PURE__ */ jsxs(Link$1, { href: `/portal/departments/${d.id}`, className: "inline-flex items-center gap-2 font-semibold text-brand hover:underline", children: [
            /* @__PURE__ */ jsx(Building2, { size: 15 }),
            " ",
            d.name
          ] }),
          d.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: d.description })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: d.courses_count }),
        /* @__PURE__ */ jsx("td", { className: "td", children: d.is_active ? /* @__PURE__ */ jsx(Badge, { tone: "green", children: "Active" }) : /* @__PURE__ */ jsx(Badge, { tone: "gray", children: "Hidden on website" }) }),
        /* @__PURE__ */ jsxs("td", { className: "td whitespace-nowrap text-right", children: [
          /* @__PURE__ */ jsx(Button, { href: `/portal/departments/${d.id}`, variant: "subtle", size: "sm", children: "Open" }),
          /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => open(d), children: [
            /* @__PURE__ */ jsx(Pencil, { size: 14 }),
            " Edit"
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", "aria-label": "Delete", onClick: () => remove(d), children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
        ] })
      ] }, d.id)) })
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: !!modal,
        onClose: () => setModal(null),
        title: (modal == null ? void 0 : modal.row) ? "Edit department" : "Add department",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModal(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", onClick: submit, disabled: form.processing, children: form.processing ? "Saving..." : "Save" })
        ] }),
        children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
          /* @__PURE__ */ jsx(FormError, { errors: e }),
          /* @__PURE__ */ jsx(Field, { label: "Department name", error: e.name, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.name, onChange: (ev) => form.setData("name", ev.target.value), required: true, placeholder: "Media & Journalism" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Short code", error: e.code, help: "Unique, for example MJ or CP.", children: /* @__PURE__ */ jsx(TextInput, { value: form.data.code, onChange: (ev) => form.setData("code", ev.target.value), required: true, maxLength: 20 }) }),
          /* @__PURE__ */ jsx(Field, { label: "Description", error: e.description, help: "Shown on the website under the department name.", children: /* @__PURE__ */ jsx(TextArea, { rows: 3, value: form.data.description, onChange: (ev) => form.setData("description", ev.target.value), maxLength: 500 }) }),
          /* @__PURE__ */ jsx(Check2, { label: "Active (show its courses on the website)", checked: form.data.is_active, onChange: (v) => form.setData("is_active", v) }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "hidden" })
        ] })
      }
    )
  ] });
}
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$b
}, Symbol.toStringTag, { value: "Module" }));
function Show$6({ department, courses, students_count }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: department.name }),
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: department.name,
        subtitle: department.description || `Department code ${department.code}`,
        actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { href: "/portal/departments", variant: "outline", children: "All departments" }),
          /* @__PURE__ */ jsxs(Button, { href: `/portal/courses/create?department=${department.id}`, variant: "gold", children: [
            /* @__PURE__ */ jsx(Plus, { size: 16 }),
            " Add course to this department"
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mb-5 grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Courses", value: courses.length }),
      /* @__PURE__ */ jsx(Stat, { label: "Students studying", value: students_count, accent: "green" }),
      /* @__PURE__ */ jsx(Stat, { label: "Status", value: department.is_active ? "Active" : "Hidden", accent: department.is_active ? "brand" : "gold", hint: department.is_active ? "Shown on the website" : "Not shown on the website" })
    ] }),
    courses.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No courses in this department yet", children: 'Use "Add course to this department" to create the first one.' }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Code" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Course" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Category" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Batches" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Website" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: courses.map((c) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-navy-50/50", children: [
        /* @__PURE__ */ jsx("td", { className: "td font-mono text-xs", children: c.code }),
        /* @__PURE__ */ jsxs("td", { className: "td font-semibold text-navy", children: [
          c.name,
          c.duration && /* @__PURE__ */ jsx("p", { className: "text-xs font-normal text-navy-400", children: c.duration })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: c.type }),
        /* @__PURE__ */ jsx("td", { className: "td", children: c.batches_count }),
        /* @__PURE__ */ jsx("td", { className: "td", children: c.is_published ? /* @__PURE__ */ jsx(Badge, { tone: "green", children: "Published" }) : /* @__PURE__ */ jsx(Badge, { tone: "gray", children: "Hidden" }) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: /* @__PURE__ */ jsxs(Button, { href: `/portal/courses/${c.id}/edit`, variant: "ghost", size: "sm", children: [
          /* @__PURE__ */ jsx(Pencil, { size: 14 }),
          " Edit"
        ] }) })
      ] }, c.id)) })
    ] })
  ] });
}
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Show$6
}, Symbol.toStringTag, { value: "Module" }));
function Feed({ items, canPost }) {
  const [open, setOpen] = useState(false);
  const form = useForm({ title: "", body: "", audience: "all", batch_id: "" });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Announcements" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Announcements", actions: canPost && /* @__PURE__ */ jsx(Button, { variant: "gold", onClick: () => setOpen(true), children: "New announcement" }) }),
    items.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No announcements yet" }) : /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: items.map((a) => /* @__PURE__ */ jsxs("li", { className: "rounded-xl border border-navy-100 bg-white p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold text-navy", children: a.title }),
        /* @__PURE__ */ jsx(Badge, { tone: "blue", children: a.audience })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 whitespace-pre-line text-navy-600", children: a.body }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-navy-400", children: [
        a.author ? `${a.author}, ` : "",
        fmtDateTime(a.created_at)
      ] })
    ] }, a.id)) }),
    canPost && /* @__PURE__ */ jsxs(
      Modal,
      {
        open,
        onClose: () => setOpen(false),
        title: "New announcement",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: form.processing, onClick: () => form.post("/portal/manage/announcements", { preserveScroll: true, onSuccess: () => {
            setOpen(false);
            form.reset();
          } }), children: "Post" })
        ] }),
        children: [
          /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(Field, { label: "Title", error: form.errors.title, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.title, onChange: (e) => form.setData("title", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Message", error: form.errors.body, children: /* @__PURE__ */ jsx(TextArea, { rows: 4, value: form.data.body, onChange: (e) => form.setData("body", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Audience", error: form.errors.audience, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.audience, onChange: (e) => form.setData("audience", e.target.value), placeholder: null, options: [{ value: "all", label: "Everyone" }, { value: "students", label: "All students" }, { value: "lecturers", label: "All lecturers" }] }) })
          ] })
        ]
      }
    )
  ] });
}
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Feed
}, Symbol.toStringTag, { value: "Module" }));
const WHATSAPP = "https://wa.me/94712161381?text=Hello%20IMDR";
const steps = [
  [ClipboardList, "Choose your course", "Pick the course you are interested in."],
  [UserRound, "Tell us about you", "Fill in your contact details. Only name and phone are required."],
  [PhoneCall, "We contact you", "Our office calls or messages you on WhatsApp to confirm."]
];
function Apply({ courses, preselected }) {
  var _a;
  const [done, setDone] = useState(false);
  const initialCourse = useMemo(
    () => {
      var _a2;
      return ((_a2 = courses.find((c) => {
        var _a3;
        return (_a3 = c.batches) == null ? void 0 : _a3.some((b) => b.id === preselected);
      })) == null ? void 0 : _a2.id) ?? "";
    },
    [courses, preselected]
  );
  const form = useForm({
    course_id: initialCourse,
    batch_id: preselected || "",
    name: "",
    phone: "",
    whatsapp_number: "",
    email: "",
    nic: "",
    date_of_birth: "",
    gender: "",
    school: "",
    address: "",
    guardian_name: "",
    guardian_phone: ""
  });
  const set = (k) => (e2) => form.setData(k, e2.target.value);
  const course = courses.find((c) => String(c.id) === String(form.data.course_id));
  const batches = (course == null ? void 0 : course.batches) || [];
  const fee = course == null ? void 0 : course.fee_structure;
  const e = form.errors;
  const submit = (ev) => {
    ev.preventDefault();
    form.post("/apply", {
      preserveScroll: false,
      onSuccess: () => {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Apply" }),
    /* @__PURE__ */ jsx(MotionStyles, {}),
    /* @__PURE__ */ jsx("section", { className: "relative overflow-hidden bg-navy text-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28", children: [
      /* @__PURE__ */ jsxs(
        "p",
        {
          style: { "--d": "0ms" },
          className: "hero-in mb-6 inline-flex items-center gap-2 rounded-full border border-navy-400 px-4 py-1.5 text-xs font-bold tracking-widest text-gold",
          children: [
            /* @__PURE__ */ jsx("span", { className: "rec-pulse h-2 w-2 rounded-full bg-red-500", "aria-hidden": "true" }),
            "STUDENT APPLICATION"
          ]
        }
      ),
      /* @__PURE__ */ jsx("h1", { style: { "--d": "120ms" }, className: "hero-in display-wide text-5xl sm:text-6xl xl:text-7xl", children: "Apply to IMDR" }),
      /* @__PURE__ */ jsx("p", { style: { "--d": "240ms" }, className: "hero-in mt-6 max-w-2xl text-lg leading-8 text-navy-200", children: "No online account is needed. Fill in this Application Form and our office will contact you. You can also visit the institute directly." })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "flow-root bg-paper", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: /* @__PURE__ */ jsx("ol", { className: "relative z-10 -mt-10 grid gap-5 md:grid-cols-3", children: steps.map(([Icon, title, text2], i) => /* @__PURE__ */ jsxs(Reveal$1, { as: "li", delay: i * 120, className: "flex gap-4 rounded-2xl bg-white p-6 shadow-lg", children: [
      /* @__PURE__ */ jsx("span", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-navy", children: /* @__PURE__ */ jsx(Icon, { size: 22, "aria-hidden": "true" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs font-bold text-brand", children: [
          "STEP ",
          i + 1
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "font-bold text-navy", children: title }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-6 text-navy-600", children: text2 })
      ] })
    ] }, title)) }) }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-paper", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-24", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-8", children: done ? /* @__PURE__ */ jsxs(Reveal$1, { className: "rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-sm sm:p-16", children: [
        /* @__PURE__ */ jsx("span", { className: "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold text-navy", children: /* @__PURE__ */ jsx(CheckCircle2, { size: 40, "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsx("h2", { className: "mt-8 text-3xl font-bold text-navy", children: "Application received" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-md leading-7 text-navy-600", children: "Thank you for applying to IMDR. Our office will contact you shortly by phone or WhatsApp." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-4", children: [
          /* @__PURE__ */ jsx(Button, { href: "/courses", variant: "gold", children: "Browse more courses" }),
          /* @__PURE__ */ jsx(Button, { href: "/", variant: "outline", children: "Back to home" })
        ] })
      ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-8", children: [
        /* @__PURE__ */ jsx(FormError, { errors: e }),
        /* @__PURE__ */ jsxs(Reveal$1, { as: "section", className: "space-y-5 rounded-2xl border border-navy-100 bg-white p-7 shadow-sm sm:p-9", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-navy", children: "1. Your course" }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Course", error: e.course_id, children: /* @__PURE__ */ jsx(
              SelectInput,
              {
                value: form.data.course_id,
                onChange: (ev) => form.setData({ ...form.data, course_id: ev.target.value, batch_id: "" }),
                options: courses.map((c) => ({ value: c.id, label: c.name })),
                required: true
              }
            ) }),
            batches.length > 0 && /* @__PURE__ */ jsx(Field, { label: "Intake (optional)", error: e.batch_id, children: /* @__PURE__ */ jsx(
              SelectInput,
              {
                value: form.data.batch_id,
                onChange: set("batch_id"),
                options: batches.map((b) => ({
                  value: b.id,
                  label: `${b.name} (starts ${fmtDate(b.start_date)}${b.seats_left != null ? `, ${b.seats_left} seats left` : ""})`
                }))
              }
            ) })
          ] }),
          fee && /* @__PURE__ */ jsxs(Alert, { tone: "blue", title: "Fees for this course", children: [
            "Registration fee ",
            money(fee.registration_fee),
            ", course fee ",
            money(fee.course_fee),
            ((_a = fee.installments) == null ? void 0 : _a.length) ? ` in ${fee.installments.length} parts (${fee.installments.map((p) => money(p.amount)).join(", ")})` : "",
            ". Fees are paid at the institute after the office confirms your application."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Reveal$1, { as: "section", className: "space-y-5 rounded-2xl border border-navy-100 bg-white p-7 shadow-sm sm:p-9", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-navy", children: "2. About you" }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Full name", error: e.name, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.name, onChange: set("name"), required: true }) }),
            /* @__PURE__ */ jsx(Field, { label: "Phone", error: e.phone, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.phone, onChange: set("phone"), required: true }) }),
            /* @__PURE__ */ jsx(Field, { label: "WhatsApp number (optional)", error: e.whatsapp_number, help: "Leave empty to use your phone number.", children: /* @__PURE__ */ jsx(TextInput, { value: form.data.whatsapp_number, onChange: set("whatsapp_number") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Email (optional)", error: e.email, children: /* @__PURE__ */ jsx(TextInput, { type: "email", value: form.data.email, onChange: set("email") }) }),
            /* @__PURE__ */ jsx(Field, { label: "NIC number (optional)", error: e.nic, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.nic, onChange: set("nic") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Date of birth (optional)", error: e.date_of_birth, children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: form.data.date_of_birth, onChange: set("date_of_birth") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Gender (optional)", error: e.gender, children: /* @__PURE__ */ jsx(
              SelectInput,
              {
                value: form.data.gender,
                onChange: set("gender"),
                options: [
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" }
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "School (optional)", error: e.school, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.school, onChange: set("school") }) })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Address (optional)", error: e.address, children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: form.data.address, onChange: set("address") }) })
        ] }),
        /* @__PURE__ */ jsxs(Reveal$1, { as: "section", className: "space-y-5 rounded-2xl border border-navy-100 bg-white p-7 shadow-sm sm:p-9", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-navy", children: "3. Parent or guardian (optional)" }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Name", error: e.guardian_name, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.guardian_name, onChange: set("guardian_name") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Phone", error: e.guardian_phone, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.guardian_phone, onChange: set("guardian_phone") }) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm leading-6 text-navy-500", children: "The office may ask for your birth certificate and result sheets when you visit or send copies." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "[&>*]:w-full sm:[&>*]:w-auto", children: /* @__PURE__ */ jsx(Button, { type: "submit", variant: "gold", size: "lg", disabled: form.processing, children: form.processing ? "Submitting..." : "Submit Application" }) })
      ] }) }),
      /* @__PURE__ */ jsx("aside", { className: "lg:col-span-4", children: /* @__PURE__ */ jsxs(Reveal$1, { delay: 150, className: "space-y-6 lg:sticky lg:top-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-3xl bg-navy p-8 text-white shadow-xl", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: "Prefer to talk first?" }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-7 text-navy-200", children: "Call or message our office, or visit the institute. We are happy to help you choose a course." }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-6 space-y-4 text-sm", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx(Phone, { size: 18, className: "mt-0.5 shrink-0 text-gold", "aria-hidden": "true" }),
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx("a", { href: "tel:+94112042717", className: "hover:underline", children: "+94 11 204 2717" }),
                /* @__PURE__ */ jsx("br", {}),
                /* @__PURE__ */ jsx("a", { href: "tel:+94712161381", className: "hover:underline", children: "+94 71 216 1381" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx(MessageCircle, { size: 18, className: "mt-0.5 shrink-0 text-gold", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx("a", { href: WHATSAPP, target: "_blank", rel: "noreferrer", className: "hover:underline", children: "Message us on WhatsApp" })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx(MapPin, { size: 18, className: "mt-0.5 shrink-0 text-gold", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx("span", { children: "No. 774/C, Highlevel Road, Panagoda, Homagama" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "rounded-2xl border border-navy-100 bg-white p-6 text-sm leading-7 text-navy-600", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-navy", children: "No account, no password." }),
          " IMDR does not use student logins. Submitting this form is all you need to do."
        ] })
      ] }) })
    ] }) })
  ] });
}
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Apply
}, Symbol.toStringTag, { value: "Module" }));
function Index$a({ items, canManage, teach }) {
  const [open, setOpen] = useState(false);
  const form = useForm({ subject_id: "", batch_id: "", title: "", description: "", due_at: "", max_marks: 100 });
  const batches = ((teach == null ? void 0 : teach.batches) || []).filter((b) => {
    const subject = teach.subjects.find((s) => String(s.id) === String(form.data.subject_id));
    return subject && b.course_id === subject.course_id && (!teach.pairs || teach.pairs.some(([bid, sid]) => bid === b.id && sid === subject.id));
  });
  const state = (a) => {
    if (!a.mine) return a.past_due ? /* @__PURE__ */ jsx(Badge, { tone: "red", children: "Missed" }) : /* @__PURE__ */ jsx(Badge, { tone: "amber", children: "To do" });
    if (a.mine.marked_at) return /* @__PURE__ */ jsxs(Badge, { tone: "green", children: [
      "Marked: ",
      a.mine.marks,
      "/",
      a.max_marks
    ] });
    return /* @__PURE__ */ jsx(Badge, { tone: "blue", children: "Submitted" });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Assignments" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Assignments", actions: canManage && /* @__PURE__ */ jsxs(Button, { variant: "gold", onClick: () => {
      form.clearErrors();
      setOpen(true);
    }, children: [
      /* @__PURE__ */ jsx(Plus, { size: 16 }),
      " New assignment"
    ] }) }),
    items.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No assignments yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Assignment" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Subject" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Batch" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Deadline" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: canManage ? "Submissions" : "My work" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: items.map((a) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-navy-50/50", children: [
        /* @__PURE__ */ jsx("td", { className: "td font-semibold", children: /* @__PURE__ */ jsx(Link$1, { href: `/portal/assignments/${a.id}`, className: "text-brand hover:underline", children: a.title }) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: a.subject }),
        /* @__PURE__ */ jsx("td", { className: "td", children: a.batch }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          fmtDateTime(a.due_at),
          " ",
          a.past_due && /* @__PURE__ */ jsx(Status, { value: "closed", text: "Closed" })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: canManage ? a.submissions_count : state(a) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: /* @__PURE__ */ jsx(Button, { href: `/portal/assignments/${a.id}`, size: "sm", variant: "subtle", children: canManage ? "Open" : a.mine ? "View" : "Submit" }) })
      ] }, a.id)) })
    ] }),
    canManage && /* @__PURE__ */ jsxs(
      Modal,
      {
        open,
        onClose: () => setOpen(false),
        title: "New assignment",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: form.processing, onClick: () => form.post("/portal/assignments", { preserveScroll: true, onSuccess: () => {
            setOpen(false);
            form.reset();
          } }), children: "Create" })
        ] }),
        children: [
          /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(Field, { label: "Subject", error: form.errors.subject_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.subject_id, onChange: (e) => form.setData({ ...form.data, subject_id: e.target.value, batch_id: "" }), options: teach.subjects.map((s) => ({ value: s.id, label: s.name })) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Batch", error: form.errors.batch_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.batch_id, onChange: (e) => form.setData("batch_id", e.target.value), options: batches.map((b) => ({ value: b.id, label: b.name })) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Title", error: form.errors.title, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.title, onChange: (e) => form.setData("title", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Instructions", error: form.errors.description, children: /* @__PURE__ */ jsx(TextArea, { rows: 4, value: form.data.description, onChange: (e) => form.setData("description", e.target.value) }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsx(Field, { label: "Deadline", error: form.errors.due_at, children: /* @__PURE__ */ jsx(TextInput, { type: "datetime-local", value: form.data.due_at, onChange: (e) => form.setData("due_at", e.target.value) }) }),
              /* @__PURE__ */ jsx(Field, { label: "Total marks", error: form.errors.max_marks, children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "1", value: form.data.max_marks, onChange: (e) => form.setData("max_marks", e.target.value) }) })
            ] })
          ] })
        ]
      }
    )
  ] });
}
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$a
}, Symbol.toStringTag, { value: "Module" }));
function Show$5({ assignment: a, mine, submissions }) {
  const isStudent = submissions === null;
  const submit = useForm({ answer_text: (mine == null ? void 0 : mine.answer_text) ?? "", file: null });
  const [marking, setMarking] = useState(null);
  const mark = useForm({ marks: "", feedback: "" });
  const locked = a.past_due || !!(mine == null ? void 0 : mine.marked_at);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: a.title }),
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: a.title,
        subtitle: `${a.subject}, ${a.batch}. Deadline ${fmtDateTime(a.due_at)}. Total marks ${a.max_marks}.`,
        actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { href: "/portal/assignments", variant: "outline", children: "Back" }),
          !isStudent && /* @__PURE__ */ jsxs(Button, { variant: "dangerOutline", onClick: () => confirmThen("Delete this assignment?", () => router.delete(`/portal/assignments/${a.id}`)), children: [
            /* @__PURE__ */ jsx(Trash2, { size: 14 }),
            " Delete"
          ] })
        ] })
      }
    ),
    a.description && /* @__PURE__ */ jsx(Card, { className: "mb-6 whitespace-pre-line p-5 text-navy-700", children: a.description }),
    isStudent && /* @__PURE__ */ jsxs(Fragment, { children: [
      (mine == null ? void 0 : mine.marked_at) && /* @__PURE__ */ jsx(Alert, { tone: "green", title: `Marked: ${mine.marks} / ${a.max_marks}`, className: "mb-4", children: mine.feedback || "No written feedback." }),
      mine && !mine.marked_at && /* @__PURE__ */ jsxs(Alert, { tone: "blue", className: "mb-4", children: [
        "Submitted on ",
        fmtDateTime(mine.submitted_at),
        ". You can replace it until the deadline."
      ] }),
      a.past_due && !mine && /* @__PURE__ */ jsx(Alert, { tone: "red", className: "mb-4", children: "The deadline has passed and nothing was submitted." }),
      !locked && /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 font-bold", children: mine ? "Replace your submission" : "Your submission" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          submit.post(`/portal/assignments/${a.id}/submit`, { forceFormData: true, preserveScroll: true });
        }, className: "space-y-4", children: [
          /* @__PURE__ */ jsx(FormError, { errors: submit.errors }),
          /* @__PURE__ */ jsx(Field, { label: "Answer", error: submit.errors.answer_text, children: /* @__PURE__ */ jsx(TextArea, { rows: 6, value: submit.data.answer_text, onChange: (e) => submit.setData("answer_text", e.target.value) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Attach a file (optional)", error: submit.errors.file, help: "Up to 50 MB.", children: /* @__PURE__ */ jsx("input", { type: "file", onChange: (e) => submit.setData("file", e.target.files[0] || null), className: "input" }) }),
          /* @__PURE__ */ jsx(Button, { type: "submit", variant: "gold", disabled: submit.processing, children: submit.processing ? "Submitting..." : "Submit work" })
        ] })
      ] }),
      (mine == null ? void 0 : mine.file_name) && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-navy-500", children: [
        "Your file: ",
        /* @__PURE__ */ jsx("a", { className: "font-semibold text-brand hover:underline", href: `/portal/submissions/${mine.id}/download`, children: mine.file_name })
      ] })
    ] }),
    !isStudent && (submissions.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No submissions yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Submitted" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Work" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Marks" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: submissions.map((s) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsxs("td", { className: "td font-semibold", children: [
          s.student,
          /* @__PURE__ */ jsx("p", { className: "text-xs font-normal text-navy-400", children: s.student_no })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDateTime(s.submitted_at) }),
        /* @__PURE__ */ jsxs("td", { className: "td max-w-xs", children: [
          s.answer_text && /* @__PURE__ */ jsx("p", { className: "line-clamp-3 whitespace-pre-line text-sm", children: s.answer_text }),
          s.file_name && /* @__PURE__ */ jsxs(Button, { native: true, href: `/portal/submissions/${s.id}/download`, variant: "subtle", size: "sm", className: "mt-1", children: [
            /* @__PURE__ */ jsx(Download, { size: 14 }),
            " ",
            s.file_name
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: s.marked_at ? /* @__PURE__ */ jsxs(Badge, { tone: "green", children: [
          s.marks,
          "/",
          a.max_marks
        ] }) : /* @__PURE__ */ jsx(Badge, { tone: "amber", children: "Not marked" }) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "subtle", onClick: () => {
          mark.setData({ marks: s.marks ?? "", feedback: s.feedback ?? "" });
          mark.clearErrors();
          setMarking(s);
        }, children: s.marked_at ? "Change marks" : "Mark" }) })
      ] }, s.id)) })
    ] })),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: !!marking,
        onClose: () => setMarking(null),
        title: `Mark ${(marking == null ? void 0 : marking.student) ?? ""}`,
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setMarking(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: mark.processing, onClick: () => mark.put(`/portal/submissions/${marking.id}/mark`, { preserveScroll: true, onSuccess: () => setMarking(null) }), children: "Save marks" })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(Field, { label: `Marks (out of ${a.max_marks})`, error: mark.errors.marks, children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "0", max: a.max_marks, step: "0.01", value: mark.data.marks, onChange: (e) => mark.setData("marks", e.target.value) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Feedback", error: mark.errors.feedback, children: /* @__PURE__ */ jsx(TextArea, { rows: 4, value: mark.data.feedback, onChange: (e) => mark.setData("feedback", e.target.value) }) })
        ] })
      }
    )
  ] });
}
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Show$5
}, Symbol.toStringTag, { value: "Module" }));
function Index$9({ entries, isAdmin }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Attendance" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Take attendance", subtitle: "Marking a class register also confirms the class was held, which is what lecturer hours and pay are calculated from.", actions: isAdmin && /* @__PURE__ */ jsx(Button, { href: "/portal/attendance-report", variant: "outline", children: "Attendance report" }) }),
    entries.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No classes to mark", children: "Recent and upcoming classes appear here." }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Time" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Subject" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Batch" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Class" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Register" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: entries.map((e) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDate(e.date) }),
        /* @__PURE__ */ jsxs("td", { className: "td font-mono text-xs", children: [
          e.start_time,
          " to ",
          e.end_time
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td font-semibold", children: e.subject }),
        /* @__PURE__ */ jsx("td", { className: "td", children: e.batch }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: e.status }) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: e.marked ? `${e.marked} marked` : /* @__PURE__ */ jsx("span", { className: "text-navy-400", children: "Not marked" }) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: /* @__PURE__ */ jsx(Button, { href: `/portal/attendance/${e.id}`, size: "sm", variant: e.marked ? "subtle" : "gold", children: e.marked ? "Edit register" : "Mark register" }) })
      ] }, e.id)) })
    ] })
  ] });
}
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$9
}, Symbol.toStringTag, { value: "Module" }));
function Report({ batches, batchId, report }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Attendance report" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Attendance report", subtitle: "Percentage of held classes each student attended." }),
    /* @__PURE__ */ jsx("div", { className: "mb-5 max-w-sm", children: /* @__PURE__ */ jsx(Field, { label: "Batch", children: /* @__PURE__ */ jsx(SelectInput, { value: batchId ?? "", onChange: (e) => router.get("/portal/attendance-report", e.target.value ? { batch_id: e.target.value } : {}, { preserveState: true }), options: batches.map((b) => ({ value: b.id, label: b.name })), placeholder: "Choose a batch" }) }) }),
    !report ? /* @__PURE__ */ jsx(Empty, { title: "Choose a batch to see its attendance" }) : report.students.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No approved students in this batch" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("p", { className: "mb-2 text-sm text-navy-500", children: [
        report.classes_held,
        " classes held for ",
        report.batch,
        "."
      ] }),
      /* @__PURE__ */ jsxs(TableWrap, { children: [
        /* @__PURE__ */ jsxs(Thead, { children: [
          /* @__PURE__ */ jsx("th", { className: "th", children: "Student ID" }),
          /* @__PURE__ */ jsx("th", { className: "th", children: "Name" }),
          /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Attended" }),
          /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Percentage" })
        ] }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: report.students.map((s) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { className: "td font-mono text-xs", children: s.student_no }),
          /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Link$1, { className: "text-brand hover:underline", href: `/portal/students/${s.student_id}`, children: s.name }) }),
          /* @__PURE__ */ jsxs("td", { className: "td text-right", children: [
            s.attended,
            " of ",
            s.total
          ] }),
          /* @__PURE__ */ jsx("td", { className: cx("td text-right font-bold", s.percent != null && s.percent < 75 ? "text-red-700" : "text-emerald-700"), children: s.percent == null ? "-" : `${s.percent}%` })
        ] }, s.student_id)) })
      ] })
    ] })
  ] });
}
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Report
}, Symbol.toStringTag, { value: "Module" }));
const options = [["present", "Present", "bg-emerald-600 text-white"], ["late", "Late", "bg-gold text-navy"], ["absent", "Absent", "bg-red-600 text-white"]];
function Show$4({ entry, students }) {
  const form = useForm({ records: students.map((s) => ({ student_id: s.student_id, status: s.status })) });
  const setAll = (status) => form.setData("records", form.data.records.map((r) => ({ ...r, status })));
  const setOne = (i, status) => form.setData("records", form.data.records.map((r, k) => k === i ? { ...r, status } : r));
  const count = (st) => form.data.records.filter((r) => r.status === st).length;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Class register" }),
    /* @__PURE__ */ jsx(PageHeader, { title: `${entry.subject}, ${entry.batch}`, subtitle: `${fmtDate(entry.date)}, ${entry.start_time} to ${entry.end_time}`, actions: /* @__PURE__ */ jsx(Button, { href: "/portal/attendance", variant: "outline", children: "Back" }) }),
    students.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No approved students in this batch yet" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-3 flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "subtle", size: "sm", onClick: () => setAll("present"), children: "Mark everyone present" }),
          /* @__PURE__ */ jsx(Button, { variant: "subtle", size: "sm", onClick: () => setAll("absent"), children: "Mark everyone absent" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-navy-500", children: [
          count("present"),
          " present, ",
          count("late"),
          " late, ",
          count("absent"),
          " absent"
        ] })
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white", children: students.map((s, i) => /* @__PURE__ */ jsxs("li", { className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-navy", children: s.name }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: s.student_no })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1", role: "radiogroup", "aria-label": `Attendance for ${s.name}`, children: options.map(([v, text2, on]) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": form.data.records[i].status === v,
            onClick: () => setOne(i, v),
            className: cx("rounded-md px-3 py-1.5 text-sm font-medium", form.data.records[i].status === v ? on : "bg-navy-50 text-navy-600 hover:bg-navy-100"),
            children: text2
          },
          v
        )) })
      ] }, s.student_id)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsx(Button, { variant: "gold", size: "lg", disabled: form.processing, onClick: () => form.post(`/portal/attendance/${entry.id}`), children: form.processing ? "Saving..." : "Save attendance" }) })
    ] })
  ] });
}
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Show$4
}, Symbol.toStringTag, { value: "Module" }));
const layers = [
  { Icon: Camera, pos: "left-[5%] top-[12%] h-14 w-14 sm:h-20 sm:w-20", depth: 46, tone: "text-gold", float: "float-slow", show: "" },
  { Icon: Film, pos: "right-[6%] top-[9%] h-16 w-16 sm:h-24 sm:w-24", depth: -34, tone: "text-navy-300", float: "float-slower", show: "" },
  { Icon: Mic, pos: "left-[42%] bottom-[16%] h-12 w-12 sm:h-16 sm:w-16", depth: 60, tone: "text-brand-100", float: "float-slow", show: "hidden sm:block" },
  { Icon: Video, pos: "right-[3%] bottom-[20%] h-14 w-14 sm:h-20 sm:w-20", depth: -56, tone: "text-gold", float: "float-slower", show: "hidden md:block" },
  { Icon: Aperture, pos: "left-[2%] bottom-[8%] h-16 w-16 sm:h-24 sm:w-24", depth: 28, tone: "text-navy-400", float: "float-slow", show: "hidden md:block" }
];
function Reel({ className = "" }) {
  const holes = [[158, 100], [129, 150.2], [71, 150.2], [42, 100], [71, 49.8], [129, 49.8]];
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 200 200", className: `reel ${className}`, fill: "none", stroke: "currentColor", strokeWidth: "3", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("circle", { cx: "100", cy: "100", r: "96" }),
    /* @__PURE__ */ jsx("circle", { cx: "100", cy: "100", r: "86", strokeOpacity: ".5" }),
    /* @__PURE__ */ jsx("circle", { cx: "100", cy: "100", r: "16" }),
    holes.map(([x, y]) => /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: "17" }, `${x}-${y}`))
  ] });
}
function Login() {
  const form = useForm({ login: "", password: "", remember: false });
  const [show, setShow] = useState(false);
  const stage = useRef(null);
  const move = (e) => {
    if (e.pointerType === "touch" || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    const s = stage.current.style;
    s.setProperty("--mx", x.toFixed(3));
    s.setProperty("--my", y.toFixed(3));
    s.setProperty("--gx", `${((x + 1) / 2 * 100).toFixed(1)}%`);
    s.setProperty("--gy", `${((y + 1) / 2 * 100).toFixed(1)}%`);
  };
  const reset = () => {
    if (!stage.current) return;
    const s = stage.current.style;
    s.setProperty("--mx", "0");
    s.setProperty("--my", "0");
    s.setProperty("--gx", "50%");
    s.setProperty("--gy", "50%");
  };
  const submit = (e) => {
    e.preventDefault();
    form.post("/login");
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Log in" }),
    /* @__PURE__ */ jsx(MotionStyles, {}),
    /* @__PURE__ */ jsx("style", { children: `
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
            ` }),
    /* @__PURE__ */ jsxs(
      "section",
      {
        ref: stage,
        onPointerMove: move,
        onPointerLeave: reset,
        className: "login-stage relative isolate min-h-[85vh] overflow-hidden bg-gradient-to-br from-navy via-navy-600 to-navy text-white",
        children: [
          /* @__PURE__ */ jsx("div", { className: "orb-a pointer-events-none absolute -left-24 top-10 -z-10 h-96 w-96 rounded-full bg-brand opacity-40 blur-3xl", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx("div", { className: "orb-b pointer-events-none absolute -right-20 bottom-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-gold opacity-25 blur-3xl", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 -z-10", "aria-hidden": "true", children: /* @__PURE__ */ jsx("div", { className: "grid-floor" }) }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "pointer-events-none absolute -right-32 top-1/2 -z-10 hidden md:block",
              style: { transform: "translate3d(calc(var(--mx) * -18px), calc(-50% + var(--my) * -12px), 0)" },
              "aria-hidden": "true",
              children: /* @__PURE__ */ jsx(Reel, { className: "h-[30rem] w-[30rem] text-white/10" })
            }
          ),
          layers.map(({ Icon, pos, depth, tone: tone2, float, show: show2 }, i) => /* @__PURE__ */ jsx(
            "div",
            {
              className: `pointer-events-none absolute -z-10 ${pos} ${show2}`,
              style: { transform: `translate3d(calc(var(--mx) * ${depth}px), calc(var(--my) * ${depth}px), 0)`, transition: "transform .2s ease-out" },
              "aria-hidden": "true",
              children: /* @__PURE__ */ jsx("div", { className: float, style: { animationDelay: `${i * -1.3}s` }, children: /* @__PURE__ */ jsx(Icon, { className: `h-full w-full ${tone2} opacity-60 drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]`, strokeWidth: 1.4 }) })
            },
            i
          )),
          /* @__PURE__ */ jsxs("div", { className: "relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { "--d": "0ms" }, className: "hero-in inline-block rounded-2xl bg-white p-3 shadow-2xl", children: /* @__PURE__ */ jsx("img", { src: "/images/logo.jpg", alt: "IMDR", className: "h-20 w-20 object-contain sm:h-24 sm:w-24" }) }),
              /* @__PURE__ */ jsxs(
                "p",
                {
                  style: { "--d": "120ms" },
                  className: "hero-in mt-8 inline-flex items-center gap-2 rounded-full border border-navy-400 px-4 py-1.5 text-xs font-bold tracking-widest text-gold",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "rec-pulse h-2 w-2 rounded-full bg-red-500", "aria-hidden": "true" }),
                    "SECURE SIGN IN"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("h1", { style: { "--d": "220ms" }, className: "hero-in display-wide mt-5 text-5xl sm:text-6xl", children: [
                "Welcome ",
                /* @__PURE__ */ jsx("span", { className: "text-gold", children: "back." })
              ] }),
              /* @__PURE__ */ jsx("p", { style: { "--d": "340ms" }, className: "hero-in mt-6 max-w-md text-lg leading-8 text-navy-200", children: "Sign in with the username and password given by the IMDR office." }),
              /* @__PURE__ */ jsxs("p", { style: { "--d": "460ms" }, className: "hero-in mt-6 text-sm leading-7 text-navy-300", children: [
                "Want to join IMDR?",
                " ",
                /* @__PURE__ */ jsx(Link$1, { href: "/apply", className: "font-semibold text-gold hover:underline", children: "Apply for a course" }),
                ". Forgot your password? Ask the office to create a new one."
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { "--d": "300ms" }, className: "hero-in mx-auto w-full max-w-md lg:ml-auto lg:mr-0", children: /* @__PURE__ */ jsx("div", { className: "tilt-card", children: /* @__PURE__ */ jsx("div", { className: "glow-border bg-gradient-to-r from-gold via-brand to-gold rounded-[26px] p-[2px] shadow-[0_40px_80px_-20px_rgba(0,0,0,.6)]", children: /* @__PURE__ */ jsxs(
              "form",
              {
                onSubmit: submit,
                className: "relative space-y-5 rounded-3xl bg-white p-7 text-navy sm:p-9",
                style: { transformStyle: "preserve-3d" },
                children: [
                  /* @__PURE__ */ jsx("div", { className: "glare pointer-events-none absolute inset-0 rounded-3xl", "aria-hidden": "true" }),
                  /* @__PURE__ */ jsxs("div", { className: "z-pop-1 relative", children: [
                    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Log in" }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-navy-500", children: "Enter your details to continue." })
                  ] }),
                  form.errors.login && /* @__PURE__ */ jsx(Alert, { tone: "red", children: form.errors.login }),
                  /* @__PURE__ */ jsx("div", { className: "z-pop-1 relative", children: /* @__PURE__ */ jsx(Field, { label: "Username", error: form.errors.username, children: /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      value: form.data.login,
                      onChange: (e) => form.setData("login", e.target.value),
                      autoComplete: "username",
                      autoFocus: true,
                      required: true
                    }
                  ) }) }),
                  /* @__PURE__ */ jsx("div", { className: "z-pop-1 relative", children: /* @__PURE__ */ jsx(Field, { label: "Password", error: form.errors.password, children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        type: show ? "text" : "password",
                        value: form.data.password,
                        onChange: (e) => form.setData("password", e.target.value),
                        autoComplete: "current-password",
                        className: "pr-12",
                        required: true
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShow((v) => !v),
                        className: "absolute inset-y-0 right-0 flex w-12 items-center justify-center text-navy-400 transition hover:text-brand",
                        "aria-label": show ? "Hide password" : "Show password",
                        children: show ? /* @__PURE__ */ jsx(EyeOff, { size: 18 }) : /* @__PURE__ */ jsx(Eye, { size: 18 })
                      }
                    )
                  ] }) }) }),
                  /* @__PURE__ */ jsxs("label", { className: "relative flex items-center gap-2 text-sm text-navy-600", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: form.data.remember,
                        onChange: (e) => form.setData("remember", e.target.checked),
                        className: "h-4 w-4 rounded border-navy-300 text-brand"
                      }
                    ),
                    "Keep me signed in on this device"
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "z-pop-2 relative", children: /* @__PURE__ */ jsx(Button, { type: "submit", variant: "gold", size: "lg", className: "w-full", disabled: form.processing, children: form.processing ? "Signing in..." : "Log in" }) })
                ]
              }
            ) }) }) })
          ] })
        ]
      }
    )
  ] });
}
const __vite_glob_0_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login
}, Symbol.toStringTag, { value: "Module" }));
function Index$8({ certificates, candidates, eligibility, selected }) {
  const form = useForm({ enrollment_id: selected || "", override: false });
  const allPass = eligibility == null ? void 0 : eligibility.checks.every((c) => c.pass);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Certificates" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Certificates", subtitle: "Attendance, published results and fee clearance are checked automatically before a certificate can be issued." }),
    /* @__PURE__ */ jsxs(Card, { className: "mb-8 p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-3 font-bold", children: "Issue a certificate" }),
      /* @__PURE__ */ jsx(Field, { label: "Student and course", className: "max-w-lg", children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.enrollment_id, onChange: (e) => router.get("/portal/certificates", { enrollment_id: e.target.value }, { preserveState: true }), options: candidates, placeholder: "Choose an approved registration" }) }),
      eligibility && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "font-semibold text-navy", children: [
          eligibility.student,
          " (",
          eligibility.student_no,
          "), ",
          eligibility.course,
          ", ",
          eligibility.batch
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1", children: eligibility.checks.map((c, i) => /* @__PURE__ */ jsxs("li", { className: `flex items-center gap-2 text-sm ${c.pass ? "text-emerald-700" : "text-red-700"}`, children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: c.pass ? "✓" : "✗" }),
          " ",
          c.label,
          ": ",
          c.detail
        ] }, i)) }),
        !allPass && /* @__PURE__ */ jsx(Alert, { tone: "amber", className: "mt-3", children: "Not all requirements are met yet. A super admin can override and issue it anyway." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: !allPass, onClick: () => router.post("/portal/certificates", { enrollment_id: eligibility.enrollment_id }), children: "Issue certificate" }),
          !allPass && /* @__PURE__ */ jsx(Button, { variant: "dangerOutline", onClick: () => confirmThen("Issue this certificate even though requirements are not met?", () => router.post("/portal/certificates", { enrollment_id: eligibility.enrollment_id, override: true })), children: "Issue anyway (super admin)" })
        ] })
      ] })
    ] }),
    certificates.data.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No certificates issued yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Certificate" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Course" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Issued" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: certificates.data.map((c) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td font-mono text-xs", children: c.certificate_no }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          c.student,
          /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: c.student_no })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: c.course }),
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDate(c.issued_at) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: c.status }) }),
        /* @__PURE__ */ jsxs("td", { className: "td whitespace-nowrap text-right", children: [
          /* @__PURE__ */ jsxs(Button, { href: `/portal/certificates/${c.id}`, variant: "subtle", size: "sm", children: [
            /* @__PURE__ */ jsx(Award, { size: 14 }),
            " Print"
          ] }),
          c.status === "valid" && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", onClick: () => confirmThen("Revoke this certificate?", () => router.post(`/portal/certificates/${c.id}/revoke`, {}, { preserveScroll: true })), children: "Revoke" })
        ] })
      ] }, c.id)) })
    ] })
  ] });
}
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$8
}, Symbol.toStringTag, { value: "Module" }));
function Print({ certificate: c }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: c.certificate_no }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-paper px-4 py-8 print:bg-white print:py-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "no-print mx-auto mb-4 flex max-w-3xl justify-between", children: [
        /* @__PURE__ */ jsx(Button, { href: "/portal/certificates", variant: "outline", size: "sm", children: "Back" }),
        /* @__PURE__ */ jsxs(Button, { variant: "primary", size: "sm", onClick: () => window.print(), children: [
          /* @__PURE__ */ jsx(Printer, { size: 14 }),
          " Print or save as PDF"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl border-8 border-double border-gold bg-white p-12 text-center shadow-lift print:border-4 print:shadow-none", children: [
        /* @__PURE__ */ jsx("img", { src: "/images/logo.jpg", alt: "IMDR", className: "mx-auto h-20 w-20 object-contain" }),
        /* @__PURE__ */ jsx("p", { className: "display-wide mt-3 text-2xl tracking-widest text-navy", children: "IMDR" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-widest text-navy-400", children: "Institute of Media Development and Research" }),
        /* @__PURE__ */ jsx("p", { className: "mt-10 text-sm uppercase tracking-widest text-brand", children: "Certificate of Completion" }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm text-navy-500", children: "This is to certify that" }),
        /* @__PURE__ */ jsx("p", { className: "display-wide mt-2 text-4xl text-navy", children: c.student }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-navy-500", children: [
          "Student ID ",
          c.student_no
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-navy-600", children: "has successfully completed the requirements of" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-2xl font-bold text-navy", children: c.course }),
        /* @__PURE__ */ jsx("p", { className: "text-navy-500", children: c.batch }),
        c.status === "revoked" && /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg font-bold text-red-600", children: "THIS CERTIFICATE HAS BEEN REVOKED" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-14 flex items-end justify-between text-left text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "border-t border-navy-300 pt-1 text-navy-500", children: "Issued" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-navy", children: fmtDate(c.issued_at) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "border-t border-navy-300 pt-1 text-navy-500", children: "Certificate number" }),
            /* @__PURE__ */ jsx("p", { className: "font-mono font-semibold text-navy", children: c.certificate_no })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-8 text-xs text-navy-400", children: [
          "Verify this certificate at ",
          c.verify_url
        ] })
      ] })
    ] })
  ] });
}
const __vite_glob_0_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Print
}, Symbol.toStringTag, { value: "Module" }));
const WHATSAPP_NUMBER = "94706766651";
const waLink = (text2) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text2)}`;
function WhatsAppIcon$2({ size = 22 }) {
  return /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M12.04 2a9.9 9.9 0 0 0-8.43 15.1L2 22l5.05-1.55A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .92.98-2.92-.2-.31A8.2 8.2 0 1 1 12.04 20.1Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.42.06-.64.3-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64 1.53.66 2.13.72 2.9.6.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" }) });
}
const details = [
  { icon: MapPin, label: "Visit us", value: "No. 774/C, Highlevel Road, Panagoda, Homagama, Sri Lanka", href: "https://maps.google.com/?q=774/C+Highlevel+Road+Panagoda+Homagama" },
  { icon: Phone, label: "Call the office", value: "+94 11 204 2717", href: "tel:+94112042717" },
  { icon: Phone, label: "Call the office", value: "+94 71 216 1381", href: "tel:+94712161381" },
  { icon: Mail, label: "Email", value: "info@imdr.lk", href: "mailto:info@imdr.lk" }
];
function Contact() {
  const form = useForm({ name: "", email: "", phone: "", subject: "", message: "" });
  const submit = (e) => {
    e.preventDefault();
    form.post("/contact", { preserveScroll: true, onSuccess: () => form.reset() });
  };
  const sendViaWhatsApp = () => {
    const { name, subject, message, phone } = form.data;
    const lines2 = [
      "Hello IMDR,",
      name && `My name is ${name}.`,
      subject && `Subject: ${subject}`,
      message || "I would like to know more about your courses.",
      phone && `My number: ${phone}`
    ].filter(Boolean);
    window.open(waLink(lines2.join("\n")), "_blank", "noopener,noreferrer");
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Contact" }),
    /* @__PURE__ */ jsx("section", { className: "bg-navy text-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gold", children: "Get in touch with IMDR" }),
      /* @__PURE__ */ jsx("h1", { className: "display-wide mt-3 max-w-3xl text-4xl leading-tight sm:text-6xl", children: "Contact us" }),
      /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-2xl text-lg leading-relaxed text-white/75", children: "Have questions about our 18 specialized courses, G.C.E. A/L programs, or workshop schedules? Reach our administrative team, or message us directly on WhatsApp. We are here to guide your educational journey." }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: waLink("Hello IMDR, I would like to know more about your courses."),
          target: "_blank",
          rel: "noopener noreferrer",
          className: "group mt-8 inline-flex items-center gap-4 rounded-2xl bg-[#25D366] px-6 py-4 text-[#06361a] shadow-lg shadow-black/20 transition hover:bg-[#2fe173] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60",
          children: [
            /* @__PURE__ */ jsx(WhatsAppIcon$2, { size: 34 }),
            /* @__PURE__ */ jsxs("span", { className: "text-left", children: [
              /* @__PURE__ */ jsx("span", { className: "block text-lg font-semibold leading-tight", children: "Chat with us on WhatsApp" }),
              /* @__PURE__ */ jsx("span", { className: "block text-sm opacity-80", children: "070 676 6651 · replies during office hours" })
            ] })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5", children: [
      /* @__PURE__ */ jsxs("aside", { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx("h2", { className: "display-wide text-2xl text-navy", children: "Reach the office" }),
        /* @__PURE__ */ jsxs("ul", { className: "mt-6 divide-y divide-navy-100 border-y border-navy-100", children: [
          details.map(({ icon: Icon, label: label2, value, href }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href, target: href.startsWith("http") ? "_blank" : void 0, rel: "noopener noreferrer", className: "flex items-start gap-4 py-4 transition hover:bg-navy-50/60", children: [
            /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-gold", children: /* @__PURE__ */ jsx(Icon, { size: 18 }) }),
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("span", { className: "block text-sm text-navy-600", children: label2 }),
              /* @__PURE__ */ jsx("span", { className: "block font-medium text-navy", children: value })
            ] })
          ] }) }, value)),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: waLink("Hello IMDR"), target: "_blank", rel: "noopener noreferrer", className: "flex items-start gap-4 py-4 transition hover:bg-navy-50/60", children: [
            /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-[#06361a]", children: /* @__PURE__ */ jsx(WhatsAppIcon$2, { size: 20 }) }),
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("span", { className: "block text-sm text-navy-600", children: "Official WhatsApp line" }),
              /* @__PURE__ */ jsx("span", { className: "block font-medium text-navy", children: "070 676 6651 / +94 70 676 6651" })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-start gap-4 rounded-xl bg-navy-50 p-5", children: [
          /* @__PURE__ */ jsx(Clock, { size: 20, className: "mt-1 shrink-0 text-brand" }),
          /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-navy-700", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm text-navy-600", children: "Monday – Saturday" }),
              /* @__PURE__ */ jsx("dd", { className: "font-medium text-navy", children: "8:30 AM – 5:00 PM" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm text-navy-600", children: "Sunday" }),
              /* @__PURE__ */ jsx("dd", { className: "font-medium text-navy", children: "Special academic sessions and workshops" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "display-wide text-2xl text-navy", children: "Send us a message" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-navy-600", children: "Ask about a course, fees or registration. The office will reply to you." })
        ] }),
        /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Your name", error: form.errors.name, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.name, onChange: (e) => form.setData("name", e.target.value), required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "Email", error: form.errors.email, children: /* @__PURE__ */ jsx(TextInput, { type: "email", value: form.data.email, onChange: (e) => form.setData("email", e.target.value), required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "Phone", error: form.errors.phone, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.phone, onChange: (e) => form.setData("phone", e.target.value) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Subject", error: form.errors.subject, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.subject, onChange: (e) => form.setData("subject", e.target.value) }) })
        ] }),
        /* @__PURE__ */ jsx(Field, { label: "Message", error: form.errors.message, children: /* @__PURE__ */ jsx(TextArea, { rows: 6, value: form.data.message, onChange: (e) => form.setData("message", e.target.value), required: true }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
          /* @__PURE__ */ jsxs(Button, { type: "submit", variant: "gold", disabled: form.processing, children: [
            /* @__PURE__ */ jsx(Send, { size: 16, className: "mr-2 inline" }),
            form.processing ? "Sending..." : "Send message"
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: sendViaWhatsApp,
              className: "inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#25D366] px-5 py-2.5 font-semibold text-[#128C4A] transition hover:bg-[#25D366] hover:text-[#06361a] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40",
              children: [
                /* @__PURE__ */ jsx(WhatsAppIcon$2, { size: 18 }),
                "Send on WhatsApp"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const __vite_glob_0_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Contact
}, Symbol.toStringTag, { value: "Module" }));
function Form({ course, types: types2 }) {
  const fee = course == null ? void 0 : course.fee_structure;
  const form = useForm({
    course_type_id: (course == null ? void 0 : course.course_type_id) ?? "",
    code: (course == null ? void 0 : course.code) ?? "",
    name: (course == null ? void 0 : course.name) ?? "",
    duration: (course == null ? void 0 : course.duration) ?? "",
    summary: (course == null ? void 0 : course.summary) ?? "",
    description: (course == null ? void 0 : course.description) ?? "",
    entry_requirements: (course == null ? void 0 : course.entry_requirements) ?? "",
    learning_outcomes: (course == null ? void 0 : course.learning_outcomes) ?? "",
    is_published: course ? !!course.is_published : true,
    registration_fee: (fee == null ? void 0 : fee.registration_fee) ?? 0,
    course_fee: (fee == null ? void 0 : fee.course_fee) ?? 0,
    installments: (fee == null ? void 0 : fee.installments) ?? []
  });
  const e = form.errors;
  const set = (k) => (ev) => form.setData(k, ev.target.value);
  const sum = form.data.installments.reduce((t, i) => t + Number(i.amount || 0), 0);
  const balanced = form.data.installments.length === 0 || Math.abs(sum - Number(form.data.course_fee)) < 0.01;
  const setRow = (idx, patch) => form.setData("installments", form.data.installments.map((r, i) => i === idx ? { ...r, ...patch } : r));
  const addRow = () => form.setData("installments", [...form.data.installments, { label: `Installment ${form.data.installments.length + 1}`, amount: "", due_after_days: form.data.installments.length * 30 }]);
  const evenSplit = (n) => {
    const each = Math.floor(Number(form.data.course_fee) / n * 100) / 100;
    form.setData("installments", Array.from({ length: n }, (_, i) => ({ label: `Installment ${i + 1}`, amount: i === n - 1 ? +(Number(form.data.course_fee) - each * (n - 1)).toFixed(2) : each, due_after_days: i * 30 })));
  };
  const submit = (ev) => {
    ev.preventDefault();
    course ? form.put(`/portal/courses/${course.id}`) : form.post("/portal/courses");
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: course ? "Edit course" : "Add course" }),
    /* @__PURE__ */ jsx(PageHeader, { title: course ? `Edit ${course.name}` : "Add a course" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
      /* @__PURE__ */ jsx(FormError, { errors: e }),
      /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Course" }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Course name", error: e.name, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.name, onChange: set("name"), required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "Code", error: e.code, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.code, onChange: set("code"), required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "Category", error: e.course_type_id, help: /* @__PURE__ */ jsxs(Fragment, { children: [
            "Certificate, Advanced Certificate, Diploma and so on. ",
            /* @__PURE__ */ jsx(Link, { href: "/portal/manage/course-types", className: "text-brand hover:underline", children: "Manage categories" })
          ] }), children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.course_type_id, onChange: set("course_type_id"), options: types2.map((t) => ({ value: t.id, label: t.name })), required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "Duration", error: e.duration, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.duration, onChange: set("duration"), placeholder: "12 months" }) })
        ] }),
        /* @__PURE__ */ jsx(Field, { label: "One-line summary (shown in course lists)", error: e.summary, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.summary, onChange: set("summary") }) }),
        /* @__PURE__ */ jsx(Field, { label: "Description", error: e.description, children: /* @__PURE__ */ jsx(TextArea, { rows: 4, value: form.data.description, onChange: set("description") }) }),
        /* @__PURE__ */ jsx(Field, { label: "Entry requirements", error: e.entry_requirements, children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: form.data.entry_requirements, onChange: set("entry_requirements") }) }),
        /* @__PURE__ */ jsx(Field, { label: "Learning outcomes", error: e.learning_outcomes, help: "One outcome per line.", children: /* @__PURE__ */ jsx(TextArea, { rows: 4, value: form.data.learning_outcomes, onChange: set("learning_outcomes") }) }),
        /* @__PURE__ */ jsx(Check2, { label: "Show on the public website", checked: form.data.is_published, onChange: (v) => form.setData("is_published", v) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Fees" }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Registration fee (Rs.)", error: e.registration_fee, help: "Charged first, separately from the course fee.", children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "0", step: "0.01", value: form.data.registration_fee, onChange: set("registration_fee"), required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "Course fee (Rs.)", error: e.course_fee, help: "Split into the installments below.", children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "0", step: "0.01", value: form.data.course_fee, onChange: set("course_fee"), required: true }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex flex-wrap items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Installment plan" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              [2, 3, 4, 6].map((n) => /* @__PURE__ */ jsxs(Button, { variant: "subtle", size: "sm", onClick: () => evenSplit(n), children: [
                "Split in ",
                n
              ] }, n)),
              /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: addRow, children: [
                /* @__PURE__ */ jsx(Plus, { size: 14 }),
                " Add row"
              ] })
            ] })
          ] }),
          form.data.installments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "No plan: students get one invoice for the whole course fee, due when the batch starts." }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            form.data.installments.map((row, i) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-[1fr_160px_160px_auto] sm:items-end", children: [
              /* @__PURE__ */ jsx(Field, { label: i === 0 ? "Label" : null, error: e[`installments.${i}.label`], children: /* @__PURE__ */ jsx(TextInput, { value: row.label, onChange: (ev) => setRow(i, { label: ev.target.value }) }) }),
              /* @__PURE__ */ jsx(Field, { label: i === 0 ? "Amount (Rs.)" : null, error: e[`installments.${i}.amount`], children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "1", step: "0.01", value: row.amount, onChange: (ev) => setRow(i, { amount: ev.target.value }) }) }),
              /* @__PURE__ */ jsx(Field, { label: i === 0 ? "Due after batch start (days)" : null, error: e[`installments.${i}.due_after_days`], children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "0", value: row.due_after_days, onChange: (ev) => setRow(i, { due_after_days: ev.target.value }) }) }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "text-red-600", "aria-label": "Remove row", onClick: () => form.setData("installments", form.data.installments.filter((_, k) => k !== i)), children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
            ] }, i)),
            /* @__PURE__ */ jsxs(Alert, { tone: balanced ? "green" : "red", children: [
              "Installments add up to ",
              money(sum),
              ". Course fee is ",
              money(form.data.course_fee),
              ". ",
              balanced ? "They match." : "They must match before you can save."
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", variant: "gold", size: "lg", disabled: form.processing || !balanced, children: form.processing ? "Saving..." : "Save course" }),
        /* @__PURE__ */ jsx(Button, { href: "/portal/courses", variant: "outline", size: "lg", children: "Cancel" })
      ] })
    ] })
  ] });
}
const __vite_glob_0_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Form
}, Symbol.toStringTag, { value: "Module" }));
const COURSE_IMG = "/images/courses/";
const DEFAULT_IMG = "/images/home/course-default.jpg";
const CTA_IMG = "/images/about/cta.jpg";
const PALETTE = [
  { Icon: Newspaper, tile: "bg-brand text-white", dot: "bg-brand" },
  { Icon: Film, tile: "bg-gold text-navy", dot: "bg-gold" },
  { Icon: Cpu, tile: "bg-navy-500 text-white", dot: "bg-navy-400" },
  { Icon: Layers, tile: "bg-emerald-700 text-white", dot: "bg-emerald-600" },
  { Icon: LayoutGrid, tile: "bg-violet-700 text-white", dot: "bg-violet-600" }
];
let CATS = [];
function buildCats(departments, courses) {
  const names = (departments || []).map((d) => ({
    name: d.name,
    blurb: d.description
  }));
  for (const c of courses) {
    if (c.category && !names.some((n) => n.name === c.category)) {
      names.push({ name: c.category, blurb: null });
    }
  }
  return names.map((n, i) => ({
    name: n.name,
    blurb: n.blurb || `Courses in ${n.name}.`,
    ...PALETTE[i % PALETTE.length]
  }));
}
const ALL_TILE = {
  name: "all",
  Icon: Layers,
  blurb: "Every course in one playlist.",
  tile: "bg-navy text-white"
};
const dotFor = (category) => {
  var _a;
  return ((_a = CATS.find((c) => c.name === category)) == null ? void 0 : _a.dot) || "bg-navy-300";
};
const pad = (n) => String(n).padStart(2, "0");
function CourseImage({ c, className = "", zoom = true, children }) {
  const sources = [
    c.image_url,
    c.image,
    `${COURSE_IMG}${c.slug}.jpg`,
    DEFAULT_IMG
  ].filter(Boolean);
  const [i, setI] = useState(0);
  return /* @__PURE__ */ jsxs("div", { className: `group relative overflow-hidden bg-navy-600 ${className}`, children: [
    i < sources.length ? /* @__PURE__ */ jsx(
      "img",
      {
        src: sources[i],
        alt: c.name,
        loading: "lazy",
        onError: () => setI(i + 1),
        className: `h-full w-full object-cover transition duration-700 ${zoom ? "group-hover:scale-105" : ""}`
      },
      sources[i]
    ) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-500 to-navy text-navy-300", children: /* @__PURE__ */ jsx(Image, { size: 40, "aria-hidden": "true" }) }),
    children
  ] });
}
function Timecode() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 1e3);
    return () => clearInterval(id);
  }, []);
  return /* @__PURE__ */ jsx("span", { className: "font-mono", children: `00:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}` });
}
function Monitor({ c, index, total }) {
  var _a;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-3xl bg-navy p-4 text-white shadow-2xl sm:p-5", children: [
    /* @__PURE__ */ jsx("div", { className: "sprockets mb-4 h-2.5", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs("div", { className: "hero-in", style: { "--d": "0ms" }, children: [
      /* @__PURE__ */ jsxs(CourseImage, { c, className: "aspect-[16/9] rounded-xl", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/30" }),
        /* @__PURE__ */ jsxs("span", { className: "absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-navy/80 px-3 py-1 text-xs font-bold", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "rec-pulse h-2 w-2 rounded-full bg-red-500",
              "aria-hidden": "true"
            }
          ),
          "REC ",
          /* @__PURE__ */ jsx(Timecode, {})
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "absolute right-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-navy", children: [
          "SCENE ",
          pad(index + 1),
          " / ",
          pad(total)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-1 pb-2 pt-6 sm:px-2", children: [
        /* @__PURE__ */ jsxs("p", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold tracking-wide text-gold", children: [
          /* @__PURE__ */ jsx("span", { children: (c.level_label || ((_a = c.course_type) == null ? void 0 : _a.name) || "").toUpperCase() }),
          c.duration && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-navy-200", children: [
            /* @__PURE__ */ jsx(Clock, { size: 13, "aria-hidden": "true" }),
            " ",
            c.duration
          ] })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "mt-3 text-2xl font-bold leading-tight sm:text-3xl", children: c.name }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm leading-7 text-navy-200", children: c.summary }),
        /* @__PURE__ */ jsxs("div", { className: "mt-7 flex flex-wrap items-center gap-x-6 gap-y-3", children: [
          /* @__PURE__ */ jsx(Button, { href: `/courses/${c.slug}`, variant: "gold", children: "View course" }),
          /* @__PURE__ */ jsx(
            Link$1,
            {
              href: "/apply",
              className: "text-sm font-semibold text-gold hover:underline",
              children: "Apply Now"
            }
          ),
          c.fee_structure && /* @__PURE__ */ jsxs("span", { className: "ml-auto text-right text-xs text-navy-300", children: [
            "Course fee",
            /* @__PURE__ */ jsx("span", { className: "block text-lg font-bold text-white", children: money(c.fee_structure.course_fee) })
          ] })
        ] })
      ] })
    ] }, c.id),
    /* @__PURE__ */ jsx("div", { className: "sprockets mt-4 h-2.5", "aria-hidden": "true" })
  ] });
}
function FrameCard({ c, index }) {
  var _a;
  return /* @__PURE__ */ jsxs(
    Link$1,
    {
      href: `/courses/${c.slug}`,
      className: "group flex h-full flex-col overflow-hidden rounded-2xl bg-navy text-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
      children: [
        /* @__PURE__ */ jsx("div", { className: "sprockets mx-3 mt-3 h-2.5", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs(CourseImage, { c, className: "m-3 aspect-[16/10] rounded-lg", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy", children: c.level_label || ((_a = c.course_type) == null ? void 0 : _a.name) }),
          /* @__PURE__ */ jsxs("span", { className: "absolute bottom-3 right-3 font-mono text-xs font-bold text-white/80", children: [
            "SC ",
            pad(index + 1)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col px-6 pb-4 pt-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-xs text-navy-300", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `h-2 w-2 rounded-full ${dotFor(c.category)}`,
                "aria-hidden": "true"
              }
            ),
            c.category,
            c.duration && /* @__PURE__ */ jsx("span", { className: "ml-auto", children: c.duration })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-3 text-xl font-bold leading-snug transition group-hover:text-gold", children: c.name }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 line-clamp-3 flex-1 text-sm leading-6 text-navy-200", children: c.summary }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-semibold text-gold", children: [
              "View course",
              " ",
              /* @__PURE__ */ jsx(
                ArrowRight,
                {
                  size: 16,
                  className: "transition group-hover:translate-x-1.5"
                }
              )
            ] }),
            c.fee_structure && /* @__PURE__ */ jsx("span", { className: "text-sm font-bold", children: money(c.fee_structure.course_fee) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "sprockets mx-3 mb-3 h-2.5", "aria-hidden": "true" })
      ]
    }
  );
}
function Index$7({ courses, types: types2, filters, departments }) {
  const cats = useMemo(
    () => buildCats(departments, courses),
    [departments, courses]
  );
  CATS = cats;
  const [f, setF] = useFilters("/courses", {
    q: filters.q,
    type: filters.type
  });
  const [cat, setCat] = useState(
    () => {
      var _a;
      return ((_a = (departments || []).find(
        (d) => String(d.id) === String(filters.department)
      )) == null ? void 0 : _a.name) ?? "all";
    }
  );
  const [view, setView] = useState("playlist");
  const [activeId, setActiveId] = useState(null);
  const levels = (types2 || []).filter(
    (t) => t.courses_count === void 0 || t.courses_count > 0
  );
  const counts = useMemo(
    () => Object.fromEntries(
      cats.map((k) => [
        k.name,
        courses.filter((c) => c.category === k.name).length
      ])
    ),
    [courses, cats]
  );
  const current = cat !== "all" && counts[cat] > 0 ? cat : "all";
  const list = useMemo(
    () => current === "all" ? courses : courses.filter((c) => c.category === current),
    [courses, current]
  );
  const activeIndex = Math.max(
    0,
    list.findIndex((c) => c.id === activeId)
  );
  const activeCourse = list[activeIndex];
  const tiles = [ALL_TILE, ...cats.filter((k) => counts[k.name] > 0)];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Courses" }),
    /* @__PURE__ */ jsx(MotionStyles, {}),
    /* @__PURE__ */ jsx("style", { children: `
                .sprockets { background-image: repeating-linear-gradient(90deg, transparent 0, transparent 10px, rgba(255,255,255,.25) 10px, rgba(255,255,255,.25) 22px); border-radius: 2px; }
                @keyframes sprocketMove { to { background-position-x: 22px; } }
                .sprockets-move { animation: sprocketMove 1.1s linear infinite; }
                .ghost-num { color: transparent; -webkit-text-stroke: 2px rgba(255,255,255,.14); }
                @media (prefers-reduced-motion: reduce) { .sprockets-move { animation: none !important; } }
            ` }),
    /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden bg-navy text-white", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "ghost-num pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 select-none text-[22rem] font-extrabold leading-none lg:block",
          "aria-hidden": "true",
          children: "18"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-7xl px-4 pb-28 pt-20 sm:px-6 lg:pb-36 lg:pt-28", children: [
        /* @__PURE__ */ jsxs(
          "p",
          {
            style: { "--d": "0ms" },
            className: "hero-in mb-6 inline-flex items-center gap-2 rounded-full border border-navy-400 px-4 py-1.5 text-xs font-bold tracking-widest text-gold",
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "rec-pulse h-2 w-2 rounded-full bg-red-500",
                  "aria-hidden": "true"
                }
              ),
              "NOW SHOWING ",
              /* @__PURE__ */ jsx("span", { className: "text-navy-300", children: "·" }),
              " ",
              /* @__PURE__ */ jsx(Timecode, {})
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "h1",
          {
            style: { "--d": "120ms" },
            className: "hero-in display-wide max-w-3xl text-5xl sm:text-6xl xl:text-7xl",
            children: "Start where you are."
          }
        ),
        /* @__PURE__ */ jsx(
          "p",
          {
            style: { "--d": "240ms" },
            className: "hero-in mt-5 text-xl font-semibold text-gold",
            children: "Every certificate level leads to the next."
          }
        ),
        /* @__PURE__ */ jsx(
          "p",
          {
            style: { "--d": "360ms" },
            className: "hero-in mt-8 max-w-2xl text-lg leading-8 text-navy-200",
            children: "At IMDR we combine theory with 100% practical learning. Our 18 specialised courses help you build a career in media, cinema, IT and AI."
          }
        ),
        /* @__PURE__ */ jsxs(
          "p",
          {
            style: { "--d": "480ms" },
            className: "hero-in mt-8 max-w-xl rounded-xl border border-navy-500 bg-navy-600 px-5 py-4 text-sm leading-6 text-navy-200",
            children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold text-white", children: "No online account needed." }),
              " ",
              "Fill in the Application Form to apply for any course, or visit our institute directly."
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-navy-600 py-2", "aria-hidden": "true", children: /* @__PURE__ */ jsx("div", { className: "sprockets sprockets-move h-3" }) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "relative z-10 bg-paper", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "-mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
        role: "group",
        "aria-label": "Filter by department",
        children: tiles.map((k, i) => {
          const on = current === k.name;
          const total = k.name === "all" ? courses.length : counts[k.name];
          return /* @__PURE__ */ jsx(Reveal$1, { delay: i * 100, children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                setCat(k.name);
                setActiveId(null);
              },
              "aria-pressed": on,
              className: cx(
                "group relative h-full w-full overflow-hidden rounded-2xl p-6 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
                on ? `${k.tile} ring-4 ring-gold` : "bg-white text-navy"
              ),
              children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: cx(
                      "flex h-12 w-12 items-center justify-center rounded-full transition duration-300 group-hover:rotate-12",
                      on ? "bg-white text-navy" : "bg-paper text-brand"
                    ),
                    children: /* @__PURE__ */ jsx(k.Icon, { size: 22, "aria-hidden": "true" })
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "mt-5 flex items-baseline gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-4xl font-extrabold leading-none", children: pad(total) }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-bold", children: k.name === "all" ? "All Courses" : k.name })
                ] }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: cx(
                      "mt-3 block text-sm leading-6",
                      on ? "opacity-80" : "text-navy-600"
                    ),
                    children: k.blurb
                  }
                )
              ]
            }
          ) }, k.name);
        })
      }
    ) }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-paper", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24", children: [
      /* @__PURE__ */ jsxs(Reveal$1, { className: "flex flex-wrap items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          SearchBox,
          {
            className: "w-full sm:w-80",
            value: f.q,
            onChange: (v) => setF({ q: v }),
            placeholder: "Search courses"
          }
        ),
        tiles.length > 1 && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-navy-600", children: [
          "Department",
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: current,
              onChange: (e) => {
                setCat(e.target.value);
                setActiveId(null);
              },
              className: "rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy focus:border-brand focus:outline-none",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All departments" }),
                tiles.slice(1).map((k) => /* @__PURE__ */ jsxs("option", { value: k.name, children: [
                  k.name,
                  " (",
                  counts[k.name],
                  ")"
                ] }, k.name))
              ]
            }
          )
        ] }),
        levels.length > 0 && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-navy-600", children: [
          "Category",
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: f.type || "",
              onChange: (e) => setF({ type: e.target.value }, true),
              className: "rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy focus:border-brand focus:outline-none",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All categories" }),
                levels.map((t) => /* @__PURE__ */ jsx("option", { value: t.id, children: t.name }, t.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "ml-auto inline-flex rounded-full border border-navy-200 bg-white p-1",
            role: "group",
            "aria-label": "Change layout",
            children: [
              ["playlist", List, "Playlist"],
              ["grid", LayoutGrid, "Grid"]
            ].map(([key, Icon, label2]) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setView(key),
                "aria-pressed": view === key,
                className: cx(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition",
                  view === key ? "bg-navy text-white" : "text-navy hover:text-brand"
                ),
                children: [
                  /* @__PURE__ */ jsx(Icon, { size: 15, "aria-hidden": "true" }),
                  " ",
                  label2
                ]
              },
              key
            ))
          }
        )
      ] }),
      list.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-14 rounded-2xl border border-dashed border-navy-200 bg-white p-12 text-center text-navy-500", children: "No courses match your search. Try a different word or clear the filter." }) : view === "grid" ? /* @__PURE__ */ jsx(
        "ul",
        {
          className: "mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
          children: list.map((c, i) => /* @__PURE__ */ jsx(Reveal$1, { as: "li", delay: i % 3 * 120, children: /* @__PURE__ */ jsx(FrameCard, { c, index: i }) }, c.id))
        },
        `g-${current}`
      ) : /* @__PURE__ */ jsxs(
        "div",
        {
          className: "mt-14 grid gap-12 lg:grid-cols-12",
          children: [
            /* @__PURE__ */ jsx("ol", { className: "lg:col-span-6", children: list.map((c, i) => {
              var _a;
              const on = i === activeIndex;
              return /* @__PURE__ */ jsx(
                Reveal$1,
                {
                  as: "li",
                  delay: Math.min(i, 6) * 60,
                  className: "border-b border-navy-100 first:border-t",
                  children: /* @__PURE__ */ jsxs(
                    Link$1,
                    {
                      href: `/courses/${c.slug}`,
                      onMouseEnter: () => setActiveId(c.id),
                      onFocus: () => setActiveId(c.id),
                      className: cx(
                        "group relative flex items-start gap-5 px-3 py-6 transition-all duration-300 sm:px-5",
                        on ? "bg-navy text-white lg:translate-x-3" : "hover:bg-white"
                      ),
                      children: [
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: cx(
                              "absolute inset-y-0 left-0 w-1.5 origin-top bg-gold transition-transform duration-300",
                              on ? "scale-y-100" : "scale-y-0"
                            ),
                            "aria-hidden": "true"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: cx(
                              "w-10 shrink-0 font-mono text-lg font-bold",
                              on ? "text-gold" : "text-navy-300"
                            ),
                            children: pad(i + 1)
                          }
                        ),
                        /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                          /* @__PURE__ */ jsxs("span", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold", children: [
                            /* @__PURE__ */ jsx(
                              "span",
                              {
                                className: cx(
                                  "h-2 w-2 rounded-full",
                                  dotFor(c.category)
                                ),
                                "aria-hidden": "true"
                              }
                            ),
                            /* @__PURE__ */ jsx("span", { className: on ? "text-gold" : "text-brand", children: c.level_label || ((_a = c.course_type) == null ? void 0 : _a.name) }),
                            c.duration && /* @__PURE__ */ jsx(
                              "span",
                              {
                                className: on ? "text-navy-200" : "text-navy-500",
                                children: c.duration
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xl font-bold leading-snug", children: c.name }),
                          /* @__PURE__ */ jsx(
                            "span",
                            {
                              className: cx(
                                "mt-2 block text-sm leading-6 lg:hidden",
                                on ? "text-navy-200" : "text-navy-600"
                              ),
                              children: c.summary
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsx(
                          ArrowRight,
                          {
                            size: 20,
                            className: cx(
                              "mt-1 shrink-0 transition duration-300",
                              on ? "translate-x-0 text-gold opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                            ),
                            "aria-hidden": "true"
                          }
                        )
                      ]
                    }
                  )
                },
                c.id
              );
            }) }),
            /* @__PURE__ */ jsx("div", { className: "hidden lg:col-span-6 lg:block", children: /* @__PURE__ */ jsx("div", { className: "sticky top-8", children: activeCourse && /* @__PURE__ */ jsx(
              Monitor,
              {
                c: activeCourse,
                index: activeIndex,
                total: list.length
              }
            ) }) })
          ]
        },
        `p-${current}`
      )
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden bg-brand text-white", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-cover bg-center opacity-25",
          style: { backgroundImage: `url(${CTA_IMG})` },
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "sprockets sprockets-move relative h-3",
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxs(Reveal$1, { className: "relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-20 sm:px-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold sm:text-4xl", children: "Not sure which course is right for you?" }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-xl text-lg leading-8 text-brand-100", children: "Call or WhatsApp our office and we will help you choose." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsx(Button, { href: "/apply", variant: "gold", size: "lg", children: "Apply Now" }),
          /* @__PURE__ */ jsx(Button, { href: "/contact", variant: "outline", size: "lg", children: "Contact Us" })
        ] })
      ] })
    ] })
  ] });
}
const __vite_glob_0_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$7
}, Symbol.toStringTag, { value: "Module" }));
function Manage({ courses, types: types2, filters }) {
  const [f, setF] = useFilters("/portal/courses", filters);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Courses" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Courses", subtitle: "Each course has a registration fee and a course fee split into installments. Students get the invoices automatically.", actions: /* @__PURE__ */ jsxs(Button, { href: "/portal/courses/create", variant: "gold", children: [
      /* @__PURE__ */ jsx(Plus, { size: 16 }),
      " Add course"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(SearchBox, { className: "sm:col-span-2", value: f.search, onChange: (v) => setF({ search: v }), placeholder: "Search courses" }),
      /* @__PURE__ */ jsx(SelectInput, { value: f.type, onChange: (e) => setF({ type: e.target.value }, true), options: types2.map((t) => ({ value: t.id, label: t.name })), placeholder: "All categories" })
    ] }),
    courses.data.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No courses found" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Code" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Course" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Category" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Registration" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Course fee" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Parts" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Batches" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Website" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: courses.data.map((c) => {
        var _a, _b, _c;
        return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-navy-50/50", children: [
          /* @__PURE__ */ jsx("td", { className: "td font-mono text-xs", children: c.code }),
          /* @__PURE__ */ jsxs("td", { className: "td font-semibold text-navy", children: [
            c.name,
            /* @__PURE__ */ jsx("p", { className: "text-xs font-normal text-navy-400", children: c.duration })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "td", children: (_a = c.course_type) == null ? void 0 : _a.name }),
          /* @__PURE__ */ jsx("td", { className: "td text-right", children: c.fee_structure ? money(c.fee_structure.registration_fee) : "-" }),
          /* @__PURE__ */ jsx("td", { className: "td text-right", children: c.fee_structure ? money(c.fee_structure.course_fee) : "-" }),
          /* @__PURE__ */ jsx("td", { className: "td", children: ((_c = (_b = c.fee_structure) == null ? void 0 : _b.installments) == null ? void 0 : _c.length) || 1 }),
          /* @__PURE__ */ jsx("td", { className: "td", children: c.batches_count }),
          /* @__PURE__ */ jsx("td", { className: "td", children: c.is_published ? /* @__PURE__ */ jsx(Badge, { tone: "green", children: "Published" }) : /* @__PURE__ */ jsx(Badge, { tone: "gray", children: "Hidden" }) }),
          /* @__PURE__ */ jsxs("td", { className: "td whitespace-nowrap text-right", children: [
            /* @__PURE__ */ jsxs(Button, { href: `/portal/courses/${c.id}/edit`, variant: "ghost", size: "sm", children: [
              /* @__PURE__ */ jsx(Pencil, { size: 14 }),
              " Edit"
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", "aria-label": "Delete", onClick: () => confirmThen(`Delete ${c.name}?`, () => router.delete(`/portal/courses/${c.id}`, { preserveScroll: true })), children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
          ] })
        ] }, c.id);
      }) })
    ] }),
    /* @__PURE__ */ jsx(Pagination, { paginator: courses })
  ] });
}
const __vite_glob_0_16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Manage
}, Symbol.toStringTag, { value: "Module" }));
const lines = (text2) => (text2 || "").split("\n").map((s) => s.trim()).filter(Boolean);
function Show$3({ course, batches, lecturers }) {
  var _a, _b;
  const fee = course.fee_structure;
  const plan = (fee == null ? void 0 : fee.installments) || [];
  const outcomes = lines(course.learning_outcomes);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: course.name }),
    /* @__PURE__ */ jsx("section", { className: "border-b border-navy-100 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-10 sm:px-6", children: [
      /* @__PURE__ */ jsx(Link$1, { href: "/courses", className: "text-sm font-semibold text-brand hover:underline", children: "All courses" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-4 text-sm font-semibold text-brand", children: [
        (_a = course.course_type) == null ? void 0 : _a.name,
        course.duration ? `, ${course.duration}` : ""
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "display-wide mt-1 max-w-3xl text-3xl text-navy sm:text-5xl", children: course.name }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-2xl text-lg text-navy-600", children: course.summary })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-10 lg:col-span-2", children: [
        course.description && /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-navy", children: "About this course" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 whitespace-pre-line text-navy-600", children: course.description })
        ] }),
        course.entry_requirements && /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-navy", children: "Who can join" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-navy-600", children: course.entry_requirements })
        ] }),
        outcomes.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-navy", children: "What you will be able to do" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-2 list-disc space-y-1 pl-5 text-navy-600", children: outcomes.map((o) => /* @__PURE__ */ jsx("li", { children: o }, o)) })
        ] }),
        ((_b = course.subjects) == null ? void 0 : _b.length) > 0 && /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-navy", children: "Subjects" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2", children: course.subjects.map((s) => /* @__PURE__ */ jsx("li", { className: "border-b border-navy-100 py-2 text-navy-700", children: s.name }, s.id)) })
        ] }),
        lecturers.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-navy", children: "Lecturers" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-1 text-navy-700", children: lecturers.map((l) => /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("b", { children: l.name }),
            l.qualification ? `, ${l.qualification}` : ""
          ] }, l.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("aside", { className: "lg:sticky lg:top-24 lg:self-start", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-navy-100 bg-white p-5 shadow-lift", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-navy", children: "Fees" }),
        fee ? /* @__PURE__ */ jsxs("dl", { className: "mt-3 space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Registration fee" }),
            /* @__PURE__ */ jsx("dd", { className: "font-semibold", children: money(fee.registration_fee) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Course fee" }),
            /* @__PURE__ */ jsx("dd", { className: "font-semibold", children: money(fee.course_fee) })
          ] }),
          plan.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-t border-navy-100 pt-2", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-1 font-semibold text-navy", children: "Pay in parts" }),
            plan.map((p, i) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-navy-600", children: [
              /* @__PURE__ */ jsx("span", { children: p.label }),
              /* @__PURE__ */ jsx("span", { children: money(p.amount) })
            ] }, i))
          ] })
        ] }) : /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-navy-500", children: "Ask the office for fee details." }),
        /* @__PURE__ */ jsx("h2", { className: "mt-6 text-lg font-bold text-navy", children: "Open batches" }),
        batches.length === 0 && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-navy-500", children: "No batch is open right now. Contact us to join the waiting list." }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-3", children: batches.map((b) => /* @__PURE__ */ jsxs("li", { className: "rounded-lg bg-navy-50 p-3 text-sm", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-navy", children: b.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-navy-600", children: [
            "Starts ",
            fmtDate(b.start_date)
          ] }),
          b.schedule_text && /* @__PURE__ */ jsx("p", { className: "text-navy-600", children: b.schedule_text }),
          /* @__PURE__ */ jsxs("p", { className: "text-navy-500", children: [
            b.seats_left,
            " seats left"
          ] }),
          /* @__PURE__ */ jsx(Button, { href: `/apply?batch=${b.id}`, variant: "gold", size: "sm", className: "mt-2 w-full", disabled: b.seats_left === 0, children: "Register for this batch" })
        ] }, b.id)) })
      ] }) })
    ] })
  ] });
}
const __vite_glob_0_17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Show$3
}, Symbol.toStringTag, { value: "Module" }));
function Chart({ data }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.spending]));
  return /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-bold text-navy", children: "Income and spending, last 6 months" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4 text-xs text-navy-500", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-sm bg-brand" }),
          " Income"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-sm bg-gold" }),
          " Spending"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex h-44 items-end gap-3", role: "img", "aria-label": "Bar chart of monthly income and spending", children: data.map((d) => /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center gap-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex h-36 w-full items-end justify-center gap-1", children: [
        /* @__PURE__ */ jsx("div", { className: "w-1/3 rounded-t bg-brand", style: { height: `${d.income / max * 100}%` }, title: `Income ${money(d.income)}` }),
        /* @__PURE__ */ jsx("div", { className: "w-1/3 rounded-t bg-gold", style: { height: `${d.spending / max * 100}%` }, title: `Spending ${money(d.spending)}` })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-navy-500", children: d.label })
    ] }, d.label)) })
  ] });
}
function Money({ f }) {
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
    /* @__PURE__ */ jsx(Stat, { label: "Income today", value: money(f.today_income), accent: "green" }),
    /* @__PURE__ */ jsx(Stat, { label: "Income this month", value: money(f.month_income), accent: "brand" }),
    /* @__PURE__ */ jsx(Stat, { label: "Spending this month", value: money(f.month_spending), hint: "Expenses and salaries paid", accent: "gold" }),
    /* @__PURE__ */ jsx(Stat, { label: "Still to collect", value: money(f.outstanding.total), hint: f.outstanding.overdue_count ? `${money(f.outstanding.overdue_total)} overdue on ${f.outstanding.overdue_count} invoices` : "Nothing overdue", accent: f.outstanding.overdue_count ? "red" : "navy" })
  ] });
}
function AdminDash({ d, isSuper }) {
  const todo = [
    [d.pending_registrations, "registrations waiting for approval", "/portal/registrations"],
    [d.delayed_students, "students with a delayed payment (LMS paused)", "/portal/students?payment=delayed"],
    [d.pending_payments, "online payments waiting for the bank", isSuper ? "/portal/transactions" : null],
    [d.unread_messages, "unread website messages", "/portal/manage/contact-messages"],
    [d.todays_classes, "classes scheduled today", "/portal/timetable"]
  ].filter(([n]) => n > 0);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Students", value: d.counts.students }),
      /* @__PURE__ */ jsx(Stat, { label: "Courses", value: d.counts.courses, accent: "gold" }),
      /* @__PURE__ */ jsx(Stat, { label: "Open and running batches", value: d.counts.batches, accent: "navy" }),
      /* @__PURE__ */ jsx(Stat, { label: "Lecturers", value: d.counts.lecturers, accent: "green" })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-8 text-lg font-bold text-navy", children: "Needs attention" }),
    todo.length === 0 ? /* @__PURE__ */ jsx(Alert, { tone: "green", children: "Nothing is waiting. Well done." }) : /* @__PURE__ */ jsx("ul", { className: "grid gap-2 sm:grid-cols-2", children: todo.map(([n, text2, href]) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between rounded-lg border border-navy-100 bg-white px-4 py-3", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        /* @__PURE__ */ jsx("b", { className: "text-lg text-navy", children: n }),
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-navy-600", children: text2 })
      ] }),
      href && /* @__PURE__ */ jsx(Button, { href, variant: "subtle", size: "sm", children: "Open" })
    ] }, text2)) }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-8 text-lg font-bold text-navy", children: "Money" }),
    /* @__PURE__ */ jsx(Money, { f: d.finance }),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(Chart, { data: d.finance.chart }) }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-8 text-lg font-bold text-navy", children: "Newest registrations" }),
    d.recent_registrations.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No pending registrations" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Course" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Applied" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: d.recent_registrations.map((r) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          /* @__PURE__ */ jsx(Link$1, { className: "font-semibold text-brand hover:underline", href: `/portal/students/${r.student_id}`, children: r.name }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-navy-400", children: r.student_no })
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          r.course,
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-navy-400", children: r.batch })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDateTime(r.created_at) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: /* @__PURE__ */ jsx(Button, { href: "/portal/registrations", size: "sm", variant: "subtle", children: "Review" }) })
      ] }, r.id)) })
    ] })
  ] });
}
function AccountantDash({ d }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Money, { f: d.finance }),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(Chart, { data: d.finance.chart }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Online payments waiting", value: d.pending_payments, accent: "gold" }),
      /* @__PURE__ */ jsx(Stat, { label: "Payroll not fully paid", value: d.pending_payroll, accent: "navy" }),
      /* @__PURE__ */ jsx(Stat, { label: "WhatsApp receipts failed (7 days)", value: d.failed_whatsapp, accent: d.failed_whatsapp ? "red" : "green" })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-8 text-lg font-bold text-navy", children: "Overdue invoices" }),
    d.overdue.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "Nothing overdue" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Invoice" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Due" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Balance" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: d.overdue.map((i) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: i.invoice_no }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          i.student,
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-navy-400", children: i.student_no })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDate(i.due_date) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(i.balance) })
      ] }, i.id)) })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-8 text-lg font-bold text-navy", children: "Latest payments" }),
    d.recent_payments.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No payments yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Receipt" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Method" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Amount" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: d.recent_payments.map((p) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Link$1, { className: "text-brand hover:underline", href: `/portal/receipts/${p.id}`, children: p.receipt_no }) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: p.student }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: p.method }) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDateTime(p.paid_at) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(p.amount) })
      ] }, p.id)) })
    ] })
  ] });
}
const ClassRow = ({ e }) => {
  var _a, _b, _c;
  return /* @__PURE__ */ jsxs("li", { className: "flex flex-wrap items-center justify-between gap-2 border-b border-navy-50 py-3 last:border-0", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold text-navy", children: e.subject.name }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-navy-500", children: [
        ((_a = e.batch) == null ? void 0 : _a.name) ? `${e.batch.name}, ` : "",
        fmtDate(e.date),
        ", ",
        (_b = e.start_time) == null ? void 0 : _b.slice(0, 5),
        " to ",
        (_c = e.end_time) == null ? void 0 : _c.slice(0, 5),
        e.classroom ? `, ${e.classroom.name}` : ""
      ] })
    ] }),
    /* @__PURE__ */ jsx(Status, { value: e.status })
  ] });
};
function LecturerDash({ d }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Classes today", value: d.todays.length }),
      /* @__PURE__ */ jsx(Stat, { label: "Submissions to mark", value: d.to_mark, accent: d.to_mark ? "gold" : "green" }),
      /* @__PURE__ */ jsx(Stat, { label: "Batches you teach", value: d.batches, accent: "navy" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-bold text-navy", children: "Today" }),
          /* @__PURE__ */ jsx(Button, { href: "/portal/attendance", size: "sm", variant: "subtle", children: "Take attendance" })
        ] }),
        d.todays.length ? /* @__PURE__ */ jsx("ul", { children: d.todays.map((e) => /* @__PURE__ */ jsx(ClassRow, { e }, e.id)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "No classes today." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-2 font-bold text-navy", children: "Coming up" }),
        d.upcoming.length ? /* @__PURE__ */ jsx("ul", { children: d.upcoming.map((e) => /* @__PURE__ */ jsx(ClassRow, { e }, e.id)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "Nothing scheduled." })
      ] })
    ] })
  ] });
}
function StudentDash({ d }) {
  const { access } = usePage().props;
  const m = d.money;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("p", { className: "-mt-4 mb-6 text-sm text-navy-500", children: [
      "Your student ID is ",
      /* @__PURE__ */ jsx("b", { className: "text-navy", children: d.student_no })
    ] }),
    access && !access.allowed && access.reason === "payment_delay" && /* @__PURE__ */ jsx(Card, { className: "mb-6 border-2 border-red-300 p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 text-red-600" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-red-800", children: "Payment delayed" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-600", children: "Your learning access is paused. Please pay the overdue amount to reopen it straight away." }),
        /* @__PURE__ */ jsx("ul", { className: "mt-2 text-sm", children: access.overdue.map((i) => /* @__PURE__ */ jsxs("li", { children: [
          i.description,
          ": ",
          /* @__PURE__ */ jsx("b", { children: money(i.balance) }),
          ", ",
          i.days_late,
          " days late"
        ] }, i.id)) })
      ] }),
      /* @__PURE__ */ jsxs(Button, { href: "/portal/finance", variant: "danger", children: [
        "Pay ",
        money(access.overdue_total)
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Total fees", value: money(m.total), accent: "navy" }),
      /* @__PURE__ */ jsx(Stat, { label: "Paid", value: money(m.paid), accent: "green" }),
      /* @__PURE__ */ jsx(Stat, { label: "Still to pay", value: money(m.outstanding), accent: m.outstanding ? "gold" : "green", hint: m.next_due ? `Next: ${fmtDate(m.next_due.due_date)}` : "All clear" }),
      /* @__PURE__ */ jsx(Stat, { label: "Attendance", value: d.attendance == null ? "No classes yet" : `${d.attendance}%` })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-2 font-bold text-navy", children: "My registrations" }),
        d.enrollments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "You are not registered on a course yet." }) : /* @__PURE__ */ jsx("ul", { children: d.enrollments.map((e) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-2 border-b border-navy-50 py-3 last:border-0", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-navy", children: e.course }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: e.batch }),
            e.remarks && /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: e.remarks })
          ] }),
          /* @__PURE__ */ jsx(Status, { value: e.status })
        ] }, e.id)) }),
        m.next_due && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between rounded-lg bg-gold-50 p-3 text-sm", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx(Clock, { size: 14, className: "mr-1 inline" }),
            " ",
            m.next_due.description,
            " due ",
            fmtDate(m.next_due.due_date),
            ": ",
            /* @__PURE__ */ jsx("b", { children: money(m.next_due.balance) })
          ] }),
          /* @__PURE__ */ jsx(Button, { href: "/portal/finance", variant: "gold", size: "sm", children: "Pay" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-bold text-navy", children: "Next classes" }),
          /* @__PURE__ */ jsx(Link$1, { href: "/portal/timetable", className: "text-sm font-semibold text-brand hover:underline", children: "Full timetable" })
        ] }),
        d.upcoming.length ? /* @__PURE__ */ jsx("ul", { children: d.upcoming.map((e) => /* @__PURE__ */ jsx(ClassRow, { e }, e.id)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "No upcoming classes." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "mt-6 p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold text-navy", children: "Announcements" }),
        /* @__PURE__ */ jsx(Link$1, { href: "/portal/announcements", className: "text-sm font-semibold text-brand hover:underline", children: "All" })
      ] }),
      d.announcements.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "Nothing new." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-navy-50", children: d.announcements.map((a) => /* @__PURE__ */ jsxs("li", { className: "py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-navy", children: a.title }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-600 line-clamp-2", children: a.body })
      ] }, a.id)) })
    ] })
  ] });
}
function Dashboard({ role, data }) {
  const { auth } = usePage().props;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
    /* @__PURE__ */ jsx(PageHeader, { title: `Hello, ${auth.user.name.split(" ")[0]}`, subtitle: role === "student" ? "Here is where you stand today." : "Here is how the institute is doing today." }),
    ["super_admin", "admin"].includes(role) && /* @__PURE__ */ jsx(AdminDash, { d: data, isSuper: role === "super_admin" }),
    role === "accountant" && /* @__PURE__ */ jsx(AccountantDash, { d: data }),
    role === "lecturer" && /* @__PURE__ */ jsx(LecturerDash, { d: data }),
    role === "student" && /* @__PURE__ */ jsx(StudentDash, { d: data })
  ] });
}
const __vite_glob_0_18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dashboard
}, Symbol.toStringTag, { value: "Module" }));
const text = {
  403: ["You do not have access to this page", "Your account does not have permission to open it. If you think this is wrong, contact the office."],
  404: ["We could not find that page", "The link may be old or mistyped."],
  500: ["Something went wrong on our side", "Please try again in a moment."],
  503: ["We are doing maintenance", "Please try again shortly."]
};
function Error$1({ status, message }) {
  const [title, body] = text[status] || text[500];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-xl px-4 py-24 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "display-wide text-6xl text-brand", children: status }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-2xl font-bold text-navy", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-navy-600", children: message || body }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex justify-center gap-3", children: [
        /* @__PURE__ */ jsx(Button, { href: "/portal", variant: "primary", children: "Go to my portal" }),
        /* @__PURE__ */ jsx(Button, { href: "/", variant: "outline", children: "Home page" })
      ] })
    ] })
  ] });
}
const __vite_glob_0_19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Error$1
}, Symbol.toStringTag, { value: "Module" }));
const empty = { date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), expense_category_id: "", description: "", amount: "", payment_method: "cash", reference: "", attachment: null };
function Expenses({ expenses, total, categories, filters }) {
  const [f, setF] = useFilters("/portal/expenses", filters);
  const [modal, setModal] = useState(null);
  const form = useForm(empty);
  const open = (row) => {
    form.clearErrors();
    form.setData(row ? { date: row.date, expense_category_id: row.expense_category_id, description: row.description, amount: row.amount, payment_method: row.payment_method, reference: row.reference || "", attachment: null } : empty);
    setModal({ row });
  };
  const submit = (e) => {
    e.preventDefault();
    const opts = { forceFormData: true, preserveScroll: true, onSuccess: () => setModal(null) };
    modal.row ? form.transform((d) => ({ ...d, _method: "put" })).post(`/portal/expenses/${modal.row.id}`, opts) : form.post("/portal/expenses", opts);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Expenses" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Expenses", actions: /* @__PURE__ */ jsxs(Button, { variant: "gold", onClick: () => open(null), children: [
      /* @__PURE__ */ jsx(Plus, { size: 16 }),
      " Record an expense"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 grid gap-3 md:grid-cols-4", children: [
      /* @__PURE__ */ jsx(SearchBox, { className: "md:col-span-2", value: f.search, onChange: (v) => setF({ search: v }), placeholder: "Search description or reference" }),
      /* @__PURE__ */ jsx(SelectInput, { value: f.expense_category_id, onChange: (e) => setF({ expense_category_id: e.target.value }, true), options: categories.map((c) => ({ value: c.id, label: c.name })), placeholder: "All categories" }),
      /* @__PURE__ */ jsx(Stat, { label: "Total (this filter)", value: money(total), accent: "gold" })
    ] }),
    expenses.data.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No expenses recorded" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Category" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Description" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Method" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Recorded by" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: expenses.data.map((x) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDate(x.date) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: x.category }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          x.description,
          x.reference && /* @__PURE__ */ jsxs("p", { className: "text-xs text-navy-400", children: [
            "Ref: ",
            x.reference
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td capitalize", children: x.payment_method }),
        /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(x.amount) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: x.recorder }),
        /* @__PURE__ */ jsxs("td", { className: "td whitespace-nowrap text-right", children: [
          x.attachment_name && /* @__PURE__ */ jsx(Button, { native: true, href: `/portal/expenses/${x.id}/download`, variant: "ghost", size: "sm", "aria-label": "Download attachment", children: /* @__PURE__ */ jsx(Download, { size: 14 }) }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => open(x), children: /* @__PURE__ */ jsx(Pencil, { size: 14 }) }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", onClick: () => confirmThen("Delete this expense?", () => router.delete(`/portal/expenses/${x.id}`, { preserveScroll: true })), children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
        ] })
      ] }, x.id)) })
    ] }),
    /* @__PURE__ */ jsx(Pagination, { paginator: expenses }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: !!modal,
        onClose: () => setModal(null),
        title: (modal == null ? void 0 : modal.row) ? "Edit expense" : "Record an expense",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModal(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: form.processing, onClick: submit, children: "Save" })
        ] }),
        children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
          /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Date", error: form.errors.date, children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: form.data.date, onChange: (e) => form.setData("date", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Category", error: form.errors.expense_category_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.expense_category_id, onChange: (e) => form.setData("expense_category_id", e.target.value), options: categories.map((c) => ({ value: c.id, label: c.name })) }) })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Description", error: form.errors.description, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.description, onChange: (e) => form.setData("description", e.target.value) }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Amount (Rs.)", error: form.errors.amount, children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "0.01", step: "0.01", value: form.data.amount, onChange: (e) => form.setData("amount", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Payment method", error: form.errors.payment_method, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.payment_method, onChange: (e) => form.setData("payment_method", e.target.value), placeholder: null, options: [{ value: "cash", label: "Cash" }, { value: "bank", label: "Bank" }, { value: "card", label: "Card" }, { value: "online", label: "Online" }] }) })
          ] }),
          /* @__PURE__ */ jsx(Field, { label: "Reference", error: form.errors.reference, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.reference, onChange: (e) => form.setData("reference", e.target.value) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Receipt or bill (optional)", error: form.errors.attachment, children: /* @__PURE__ */ jsx("input", { type: "file", onChange: (e) => form.setData("attachment", e.target.files[0] || null), className: "input" }) })
        ] })
      }
    )
  ] });
}
const __vite_glob_0_20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Expenses
}, Symbol.toStringTag, { value: "Module" }));
function Invoices({ invoices, filters, students }) {
  const [f, setF] = useFilters("/portal/invoices", filters);
  const [open, setOpen] = useState(false);
  const form = useForm({ student_id: "", description: "", amount: "", discount: "", due_date: "" });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Invoices" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Invoices", actions: /* @__PURE__ */ jsxs(Button, { variant: "gold", onClick: () => {
      form.clearErrors();
      setOpen(true);
    }, children: [
      /* @__PURE__ */ jsx(Plus, { size: 16 }),
      " New invoice"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 grid gap-3 md:grid-cols-4", children: [
      /* @__PURE__ */ jsx(SearchBox, { className: "md:col-span-2", value: f.search, onChange: (v) => setF({ search: v }), placeholder: "Search invoices or students" }),
      /* @__PURE__ */ jsx(SelectInput, { value: f.status, onChange: (e) => setF({ status: e.target.value }, true), options: [{ value: "unpaid", label: "Unpaid" }, { value: "partial", label: "Partial" }, { value: "paid", label: "Paid" }, { value: "cancelled", label: "Cancelled" }], placeholder: "All statuses" }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: f.overdue, onChange: (e) => setF({ overdue: e.target.checked }, true) }),
        " Overdue only"
      ] })
    ] }),
    invoices.data.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No invoices found" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Invoice" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "For" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Due" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Total" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Balance" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: invoices.data.map((i) => /* @__PURE__ */ jsxs("tr", { className: i.overdue ? "bg-red-50/40" : void 0, children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: i.invoice_no }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          /* @__PURE__ */ jsx(Link$1, { className: "text-brand hover:underline", href: `/portal/students/${i.student_id}`, children: i.student }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: i.student_no })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: i.description }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          fmtDate(i.due_date),
          i.overdue && /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs font-semibold text-red-600", children: "Overdue" })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: money(i.total) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(i.balance) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: i.status }) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: i.paid_amount === 0 && i.status !== "cancelled" && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", onClick: () => confirmThen("Cancel this invoice?", () => router.post(`/portal/invoices/${i.id}/cancel`, {}, { preserveScroll: true })), children: "Cancel" }) })
      ] }, i.id)) })
    ] }),
    /* @__PURE__ */ jsx(Pagination, { paginator: invoices }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        open,
        onClose: () => setOpen(false),
        title: "New invoice",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: form.processing, onClick: () => form.post("/portal/invoices", { preserveScroll: true, onSuccess: () => {
            setOpen(false);
            form.reset();
          } }), children: "Create" })
        ] }),
        children: [
          /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(Field, { label: "Student", error: form.errors.student_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.student_id, onChange: (e) => form.setData("student_id", e.target.value), options: students }) }),
            /* @__PURE__ */ jsx(Field, { label: "Description", error: form.errors.description, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.description, onChange: (e) => form.setData("description", e.target.value), placeholder: "Late fee, resit fee, material charge..." }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsx(Field, { label: "Amount (Rs.)", error: form.errors.amount, children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "1", step: "0.01", value: form.data.amount, onChange: (e) => form.setData("amount", e.target.value) }) }),
              /* @__PURE__ */ jsx(Field, { label: "Discount (Rs.)", error: form.errors.discount, children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "0", step: "0.01", value: form.data.discount, onChange: (e) => form.setData("discount", e.target.value) }) })
            ] }),
            /* @__PURE__ */ jsx(Field, { label: "Due date", error: form.errors.due_date, children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: form.data.due_date, onChange: (e) => form.setData("due_date", e.target.value) }) })
          ] })
        ]
      }
    )
  ] });
}
const __vite_glob_0_21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Invoices
}, Symbol.toStringTag, { value: "Module" }));
function Payments({ payments, filters, openInvoices }) {
  const [f, setF] = useFilters("/portal/payments", filters);
  const [open, setOpen] = useState(false);
  const [refunding, setRefunding] = useState(null);
  const form = useForm({ invoice_id: "", amount: "", method: "cash", reference: "", paid_at: "", notes: "" });
  const refund = useForm({ amount: "", reason: "" });
  const invoice = openInvoices.find((i) => String(i.value) === String(form.data.invoice_id));
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Payments and receipts" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Payments and receipts", subtitle: "Record a cash or bank payment. Online payments are added automatically once the gateway confirms them, and a receipt is sent on WhatsApp.", actions: /* @__PURE__ */ jsxs(Button, { variant: "gold", onClick: () => {
      form.clearErrors();
      setOpen(true);
    }, children: [
      /* @__PURE__ */ jsx(Plus, { size: 16 }),
      " Record a payment"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 grid gap-3 md:grid-cols-4", children: [
      /* @__PURE__ */ jsx(SearchBox, { className: "md:col-span-2", value: f.search, onChange: (v) => setF({ search: v }), placeholder: "Search receipt, reference or student" }),
      /* @__PURE__ */ jsx(SelectInput, { value: f.method, onChange: (e) => setF({ method: e.target.value }, true), options: [{ value: "online", label: "Online" }, { value: "cash", label: "Cash" }, { value: "bank", label: "Bank" }], placeholder: "All methods" })
    ] }),
    payments.data.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No payments found" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Receipt" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Invoice" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Method" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: payments.data.map((p) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Link$1, { href: `/portal/receipts/${p.id}`, className: "text-brand hover:underline", children: p.receipt_no }) }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          p.student,
          /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: p.student_no })
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          p.invoice_no,
          /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: p.description })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: p.method }) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDateTime(p.paid_at) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(p.amount) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: p.status }) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: p.refundable > 0 && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "text-red-600", onClick: () => {
          refund.setData({ amount: p.refundable, reason: "" });
          refund.clearErrors();
          setRefunding(p);
        }, children: "Refund" }) })
      ] }, p.id)) })
    ] }),
    /* @__PURE__ */ jsx(Pagination, { paginator: payments }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        open,
        onClose: () => setOpen(false),
        title: "Record a cash or bank payment",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: form.processing, onClick: () => form.post("/portal/payments", { preserveScroll: true, onSuccess: () => {
            setOpen(false);
            form.reset();
          } }), children: "Record" })
        ] }),
        children: [
          /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(Field, { label: "Invoice", error: form.errors.invoice_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.invoice_id, onChange: (e) => form.setData("invoice_id", e.target.value), options: openInvoices }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsx(Field, { label: "Amount (Rs.)", error: form.errors.amount, help: invoice ? `Balance: Rs. ${invoice.balance.toLocaleString()}` : void 0, children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "1", step: "0.01", value: form.data.amount, onChange: (e) => form.setData("amount", e.target.value) }) }),
              /* @__PURE__ */ jsx(Field, { label: "Method", error: form.errors.method, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.method, onChange: (e) => form.setData("method", e.target.value), placeholder: null, options: [{ value: "cash", label: "Cash" }, { value: "bank", label: "Bank transfer" }] }) })
            ] }),
            /* @__PURE__ */ jsx(Field, { label: "Reference (optional)", error: form.errors.reference, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.reference, onChange: (e) => form.setData("reference", e.target.value), placeholder: "Bank slip number" }) }),
            /* @__PURE__ */ jsx(Field, { label: "Date paid", error: form.errors.paid_at, help: "Leave empty to use now.", children: /* @__PURE__ */ jsx(TextInput, { type: "datetime-local", value: form.data.paid_at, onChange: (e) => form.setData("paid_at", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Notes", error: form.errors.notes, children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: form.data.notes, onChange: (e) => form.setData("notes", e.target.value) }) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        open: !!refunding,
        onClose: () => setRefunding(null),
        title: `Refund ${(refunding == null ? void 0 : refunding.receipt_no) ?? ""}`,
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setRefunding(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "danger", disabled: refund.processing, onClick: () => refund.post(`/portal/payments/${refunding.id}/refund`, { preserveScroll: true, onSuccess: () => setRefunding(null) }), children: "Refund" })
        ] }),
        children: [
          /* @__PURE__ */ jsx(Alert, { tone: "amber", className: "mb-3", children: "This does not delete the payment. It records a reversal and reduces the invoice's paid amount." }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(Field, { label: "Refund amount (Rs.)", error: refund.errors.amount, help: refunding ? `Up to Rs. ${refunding.refundable.toLocaleString()}` : void 0, children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "1", step: "0.01", value: refund.data.amount, onChange: (e) => refund.setData("amount", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Reason", error: refund.errors.reason, children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: refund.data.reason, onChange: (e) => refund.setData("reason", e.target.value) }) })
          ] })
        ]
      }
    )
  ] });
}
const __vite_glob_0_22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Payments
}, Symbol.toStringTag, { value: "Module" }));
const months$1 = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2e3, i, 1).toLocaleString("en", { month: "long" }) }));
function Payroll({ periods, missingRules }) {
  const [open, setOpen] = useState(false);
  const now = /* @__PURE__ */ new Date();
  const form = useForm({ year: now.getFullYear(), month: now.getMonth() + 1 });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Payroll" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Payroll", subtitle: "Hourly and per-session pay come from held classes on the timetable.", actions: /* @__PURE__ */ jsxs(Button, { variant: "gold", onClick: () => setOpen(true), children: [
      /* @__PURE__ */ jsx(Play, { size: 16 }),
      " Calculate a month"
    ] }) }),
    missingRules > 0 && /* @__PURE__ */ jsxs(Alert, { tone: "amber", className: "mb-4", children: [
      missingRules,
      " staff member(s) have no salary rule set. Add one from Salary rules so they are included."
    ] }),
    periods.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No payroll calculated yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Period" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Staff" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Total net" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: periods.map((p) => {
        var _a;
        return /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsxs("td", { className: "td font-semibold", children: [
            label((_a = months$1[p.month - 1]) == null ? void 0 : _a.label),
            " ",
            p.year
          ] }),
          /* @__PURE__ */ jsx("td", { className: "td capitalize", children: p.status }),
          /* @__PURE__ */ jsx("td", { className: "td", children: p.items_count }),
          /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(p.total_net) }),
          /* @__PURE__ */ jsx("td", { className: "td text-right", children: /* @__PURE__ */ jsx(Button, { href: `/portal/payroll/${p.id}`, variant: "subtle", size: "sm", children: "Open" }) })
        ] }, p.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        open,
        onClose: () => setOpen(false),
        title: "Calculate payroll",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: form.processing, onClick: () => form.post("/portal/payroll/generate", { preserveScroll: true, onSuccess: () => setOpen(false) }), children: "Calculate" })
        ] }),
        children: [
          /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsx(Field, { label: "Month", error: form.errors.month, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.month, onChange: (e) => form.setData("month", e.target.value), placeholder: null, options: months$1 }) }),
            /* @__PURE__ */ jsx(Field, { label: "Year", error: form.errors.year, children: /* @__PURE__ */ jsx("input", { className: "input", type: "number", value: form.data.year, onChange: (e) => form.setData("year", e.target.value) }) })
          ] })
        ]
      }
    )
  ] });
}
const __vite_glob_0_23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Payroll
}, Symbol.toStringTag, { value: "Module" }));
const months = Array.from({ length: 12 }, (_, i) => new Date(2e3, i, 1).toLocaleString("en", { month: "long" }));
function PayrollShow({ period, items }) {
  const [paying, setPaying] = useState(null);
  const form = useForm({ payment_method: "bank" });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Payroll" }),
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: `${months[period.month - 1]} ${period.year} payroll`,
        actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          period.status === "draft" && /* @__PURE__ */ jsx(Button, { variant: "gold", onClick: () => confirmThen("Approve this payroll? Salaries can then be paid.", () => router.post(`/portal/payroll/${period.id}/approve`)), children: "Approve" }),
          period.status === "draft" && /* @__PURE__ */ jsx(Button, { variant: "dangerOutline", onClick: () => confirmThen("Delete this draft payroll?", () => router.delete(`/portal/payroll/${period.id}`)), children: "Delete draft" }),
          /* @__PURE__ */ jsx(Button, { href: "/portal/payroll", variant: "outline", children: "Back" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Person" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Role" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Pay type" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Hours" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Sessions" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Basic" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Net" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: items.map((i) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td font-semibold", children: i.name }),
        /* @__PURE__ */ jsx("td", { className: "td", children: label(i.role) }),
        /* @__PURE__ */ jsx("td", { className: "td capitalize", children: i.pay_type }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: i.hours || "-" }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: i.sessions || "-" }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: money(i.basic) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right font-bold", children: money(i.net) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: i.status }) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: i.status !== "paid" && period.status !== "draft" && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "gold", onClick: () => {
          form.clearErrors();
          setPaying(i);
        }, children: "Pay" }) })
      ] }, i.id)) })
    ] }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        open: !!paying,
        onClose: () => setPaying(null),
        title: `Pay ${(paying == null ? void 0 : paying.name) ?? ""}`,
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setPaying(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: form.processing, onClick: () => form.post(`/portal/payroll/items/${paying.id}/pay`, { preserveScroll: true, onSuccess: () => setPaying(null) }), children: "Confirm paid" })
        ] }),
        children: [
          /* @__PURE__ */ jsxs("p", { className: "mb-3 text-sm text-navy-600", children: [
            "Net salary: ",
            /* @__PURE__ */ jsx("b", { children: paying && money(paying.net) })
          ] }),
          /* @__PURE__ */ jsx(SelectInput, { value: form.data.payment_method, onChange: (e) => form.setData("payment_method", e.target.value), placeholder: null, options: [{ value: "bank", label: "Bank transfer" }, { value: "cash", label: "Cash" }] })
        ]
      }
    )
  ] });
}
const __vite_glob_0_24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PayrollShow
}, Symbol.toStringTag, { value: "Module" }));
function Bars({ rows, keyName, labelName = keyName, valueName = "total" }) {
  const max = Math.max(1, ...rows.map((r) => r[valueName]));
  return /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: rows.map((r) => /* @__PURE__ */ jsxs("li", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "text-navy-700", children: r[labelName] }),
      /* @__PURE__ */ jsx("span", { className: "font-semibold", children: money(r[valueName]) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 h-2 rounded-full bg-navy-50", children: /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-brand", style: { width: `${r[valueName] / max * 100}%` } }) })
  ] }, r[labelName])) });
}
function Reports({ report, outstanding, outstandingTotals, chart }) {
  const [f, setF] = useFilters("/portal/reports", { from: report.from, to: report.to });
  const max = Math.max(1, ...chart.flatMap((d) => [d.income, d.spending]));
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Reports" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Financial report" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap items-end gap-3", children: [
      /* @__PURE__ */ jsx(Field, { label: "From", children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: f.from, onChange: (e) => setF({ from: e.target.value }, true) }) }),
      /* @__PURE__ */ jsx(Field, { label: "To", children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: f.to, onChange: (e) => setF({ to: e.target.value }, true) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Income received", value: money(report.income_net), hint: report.refunds ? `After ${money(report.refunds)} in refunds` : void 0, accent: "green" }),
      /* @__PURE__ */ jsx(Stat, { label: "Expenses", value: money(report.expenses), accent: "gold" }),
      /* @__PURE__ */ jsx(Stat, { label: "Payroll paid", value: money(report.payroll), accent: "navy" }),
      /* @__PURE__ */ jsx(Stat, { label: "Net result", value: money(report.net_result), accent: report.net_result >= 0 ? "green" : "red" })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "mt-6 p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-4 font-bold text-navy", children: "Income vs spending, last 6 months" }),
      /* @__PURE__ */ jsx("div", { className: "flex h-40 items-end gap-3", children: chart.map((d) => /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center gap-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex h-32 w-full items-end justify-center gap-1", children: [
          /* @__PURE__ */ jsx("div", { className: "w-1/3 rounded-t bg-brand", style: { height: `${d.income / max * 100}%` } }),
          /* @__PURE__ */ jsx("div", { className: "w-1/3 rounded-t bg-gold", style: { height: `${d.spending / max * 100}%` } })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-navy-500", children: d.label })
      ] }, d.label)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 font-bold text-navy", children: "Income by method" }),
        report.by_method.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "No payments in this period." }) : /* @__PURE__ */ jsx(Bars, { rows: report.by_method.map((r) => ({ method: r.method, total: r.total })), keyName: "method", labelName: "method" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 font-bold text-navy", children: "Expenses by category" }),
        report.by_category.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "No expenses in this period." }) : /* @__PURE__ */ jsx(Bars, { rows: report.by_category, keyName: "category", labelName: "category" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("h2", { className: "mb-2 mt-8 text-lg font-bold text-navy", children: [
      "Outstanding fees (",
      money(outstandingTotals.total),
      " across ",
      outstandingTotals.count,
      " invoices, ",
      money(outstandingTotals.overdue_total),
      " overdue)"
    ] }),
    outstanding.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "Nothing outstanding" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Invoice" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Phone" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Due" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Balance" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: outstanding.map((i) => /* @__PURE__ */ jsxs("tr", { className: i.overdue ? "bg-red-50/40" : void 0, children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: i.invoice_no }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          i.student,
          /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: i.student_no })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: i.phone }),
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDate(i.due_date) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(i.balance) })
      ] }, i.id)) })
    ] })
  ] });
}
const __vite_glob_0_25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Reports
}, Symbol.toStringTag, { value: "Module" }));
function Transactions({ transactions, filters }) {
  const [f, setF] = useFilters("/portal/transactions", filters);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Online payments" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Online payments", subtitle: "Every attempt at the gateway, including failed and pending ones. Only a verified 'success' notification ever credits an invoice." }),
    /* @__PURE__ */ jsx("div", { className: "mb-4 max-w-xs", children: /* @__PURE__ */ jsx(SelectInput, { value: f.status, onChange: (e) => setF({ status: e.target.value }, true), options: [{ value: "success", label: "Success" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }, { value: "cancelled", label: "Cancelled" }, { value: "refunded", label: "Refunded" }], placeholder: "All statuses" }) }),
    transactions.data.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No transactions found" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Order" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Invoice" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Gateway" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Started" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: transactions.data.map((t) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td font-mono text-xs", children: t.order_id }),
        /* @__PURE__ */ jsx("td", { className: "td", children: t.student }),
        /* @__PURE__ */ jsx("td", { className: "td", children: t.invoice_no }),
        /* @__PURE__ */ jsx("td", { className: "td", children: t.gateway }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: money(t.amount) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: t.status }) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDateTime(t.initiated_at) })
      ] }, t.id)) })
    ] }),
    /* @__PURE__ */ jsx(Pagination, { paginator: transactions })
  ] });
}
const __vite_glob_0_26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Transactions
}, Symbol.toStringTag, { value: "Module" }));
function WhatsApp({ messages, filters, driver }) {
  const [f, setF] = useFilters("/portal/whatsapp", filters);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "WhatsApp receipts" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "WhatsApp receipts", subtitle: "Every receipt the system tried to send after a payment." }),
    driver === "log" && /* @__PURE__ */ jsx(Alert, { tone: "amber", className: "mb-4", children: 'The WhatsApp driver is set to "log": nothing is sent automatically. Use the click-to-chat link to send a receipt from your own phone, or set WHATSAPP_DRIVER in the .env file to send automatically.' }),
    /* @__PURE__ */ jsx("div", { className: "mb-4 max-w-xs", children: /* @__PURE__ */ jsx(SelectInput, { value: f.status, onChange: (e) => setF({ status: e.target.value }, true), options: [{ value: "sent", label: "Sent" }, { value: "simulated", label: "Simulated (log driver)" }, { value: "failed", label: "Failed" }], placeholder: "All statuses" }) }),
    messages.data.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No messages yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Phone" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Receipt" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Sent" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: messages.data.map((m) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: m.student }),
        /* @__PURE__ */ jsx("td", { className: "td font-mono text-xs", children: m.phone || "-" }),
        /* @__PURE__ */ jsx("td", { className: "td", children: m.receipt_no || "-" }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          /* @__PURE__ */ jsx(Status, { value: m.status }),
          m.error && /* @__PURE__ */ jsx("p", { className: "mt-0.5 max-w-56 text-xs text-red-600", children: m.error })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDateTime(m.created_at) }),
        /* @__PURE__ */ jsxs("td", { className: "td text-right", children: [
          m.manual_link && /* @__PURE__ */ jsxs(Button, { native: true, href: m.manual_link, target: "_blank", rel: "noreferrer", variant: "subtle", size: "sm", children: [
            /* @__PURE__ */ jsx(MessageCircle, { size: 14 }),
            " Open in WhatsApp"
          ] }),
          m.status === "failed" && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => router.post(`/portal/whatsapp/${m.id}/resend`, {}, { preserveScroll: true }), children: "Retry" })
        ] })
      ] }, m.id)) })
    ] }),
    /* @__PURE__ */ jsx(Pagination, { paginator: messages })
  ] });
}
const __vite_glob_0_27 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: WhatsApp
}, Symbol.toStringTag, { value: "Module" }));
const IMG = "/images/home/";
const FEATURED = 6;
const ticker = [
  "Cinematography",
  "Photography",
  "News Journalism",
  "AI for Media",
  "Graphic Design",
  "Digital Marketing",
  "Acting",
  "Mobile Journalism",
  "Short Film Production",
  "Content Creation"
];
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const [ref, inView] = useInView();
  return /* @__PURE__ */ jsx(
    Tag,
    {
      ref,
      style: { "--d": `${delay}ms` },
      className: `reveal ${inView ? "in" : ""} ${className}`,
      children
    }
  );
}
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
  return /* @__PURE__ */ jsx("span", { ref, children: n });
}
function Photo({ src, alt, className = "", zoom = true, children }) {
  const [failed, setFailed] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: `group relative overflow-hidden bg-navy-600 ${className}`, children: [
    !failed ? /* @__PURE__ */ jsx(
      "img",
      {
        src,
        alt,
        loading: "lazy",
        onError: () => setFailed(true),
        className: `h-full w-full object-cover transition duration-700 ${zoom ? "group-hover:scale-105" : ""}`
      }
    ) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-500 to-navy text-navy-300", children: /* @__PURE__ */ jsx(Image, { size: 40, "aria-hidden": "true" }) }),
    children
  ] });
}
function Timeline() {
  const [ref, inView] = useInView(0.3);
  const track = "flex h-12 gap-1.5";
  const clip = `tl-clip ${inView ? "in" : ""} flex items-center overflow-hidden rounded-md px-3 text-xs font-semibold leading-tight sm:text-sm`;
  const d = (i) => ({ "--d": `${i * 120}ms` });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      className: "relative rounded-2xl bg-navy p-5 pt-12 text-white shadow-2xl sm:p-8 sm:pt-14",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "absolute left-5 top-4 flex items-center gap-2 text-xs font-semibold sm:left-8 sm:top-5", children: [
          /* @__PURE__ */ jsx("span", { className: "rec-dot h-2.5 w-2.5 rounded-full bg-red-500", "aria-hidden": "true" }),
          "Learning pathway"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "-mx-1 overflow-x-auto px-1 pb-2", children: /* @__PURE__ */ jsxs("div", { className: "relative min-w-[640px]", children: [
          /* @__PURE__ */ jsx("div", { className: "ruler mb-4 h-3 border-b border-navy-500", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[70px_1fr] items-center gap-x-4 gap-y-4 text-xs sm:grid-cols-[110px_1fr] sm:text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-navy-300", children: "Pathway" }),
            /* @__PURE__ */ jsxs("div", { className: track, children: [
              /* @__PURE__ */ jsx("div", { style: d(0), className: `${clip} basis-[16%] bg-brand`, children: "Certificate" }),
              /* @__PURE__ */ jsx("div", { style: d(1), className: `${clip} basis-[22%] bg-brand-600`, children: "Advanced Certificate" }),
              /* @__PURE__ */ jsx("div", { style: d(2), className: `${clip} basis-[22%] bg-brand-700`, children: "Diploma" }),
              /* @__PURE__ */ jsx("div", { style: d(3), className: `${clip} basis-[24%] bg-gold text-navy`, children: "Higher Diploma" }),
              /* @__PURE__ */ jsx("div", { style: d(4), className: `${clip} flex-1 border border-dashed border-gold text-gold`, children: "Professional Development" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-navy-300", children: "A/L support" }),
            /* @__PURE__ */ jsxs("div", { className: track, children: [
              /* @__PURE__ */ jsx("div", { style: d(2), className: `${clip} basis-[48%] bg-navy-500`, children: "Media & Communication" }),
              /* @__PURE__ */ jsx("div", { style: d(3), className: `${clip} flex-1 bg-navy-600`, children: "ICT & Digital Skills" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-navy-300", children: "Practical" }),
            /* @__PURE__ */ jsxs("div", { className: track, children: [
              /* @__PURE__ */ jsx("div", { style: d(3), className: `${clip} basis-[34%] bg-navy-600`, children: "Content Creation" }),
              /* @__PURE__ */ jsx("div", { style: d(4), className: `${clip} basis-[26%] bg-navy-500`, children: "Photography & Video" }),
              /* @__PURE__ */ jsx("div", { style: d(5), className: `${clip} flex-1 border border-dashed border-navy-400 text-navy-300`, children: "AI, Design & Digital Media" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "playhead", "aria-hidden": "true" })
        ] }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-center text-xs text-navy-300 sm:hidden", children: "Swipe sideways to see the full pathway" })
      ]
    }
  );
}
const highlights = [
  [18, "Specialised courses"],
  [5, "Pathway levels"],
  ["A/L", "Support programmes"],
  ["MPU", "Media Production Unit"]
];
const pillars = [
  ["Education", "Accessible, high-quality and practical-driven education in media, communication, digital skills and modern technology."],
  ["Development", "Hands-on development in content creation, cinematography, photography, graphic design, AI tools and digital media."],
  ["Research", "Research focused on media literacy, social media trends, AI integration, media ethics, digital safety and youth behaviour."],
  ["Community", "Media literacy workshops, school programmes and teacher development initiatives designed to empower communities."]
];
const loop = [
  [Film, "Learn", "Practical classes and workshops", "learn.jpg"],
  [Camera, "Practise", "Hands-on work with real equipment", "practise.jpg"],
  [Mic, "Create", "Produce real media and digital content", "create.jpg"],
  [PenLine, "Develop", "Build professional skills and experience", "develop.jpg"]
];
const soon = [
  {
    heading: "Latest News",
    href: "/news",
    link: "All news",
    title: "IMDR Newsroom",
    text: "Our newsroom portal is under preparation. Official announcements regarding student intakes, workshop schedules and campus news will be published here shortly."
  },
  {
    heading: "Upcoming Events & Workshops",
    href: "/events",
    link: "All events",
    title: "Workshops & Community Programmes",
    text: "We are organizing hands-on workshops, school empowerment seminars and open campus days. Event registration forms will be updated soon."
  }
];
function Home({ stats, types: types2, courses }) {
  const shown = courses == null ? void 0 : courses.slice(0, FEATURED);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Institute of Media Development and Research" }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
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
            ` } }),
    /* @__PURE__ */ jsx("section", { className: "relative overflow-hidden bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-7xl items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-28", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-6", children: [
        /* @__PURE__ */ jsxs(
          "p",
          {
            style: { "--d": "0ms" },
            className: "hero-in mb-6 inline-flex items-center gap-2 rounded-full bg-paper px-4 py-1.5 text-xs font-semibold text-navy-600",
            children: [
              /* @__PURE__ */ jsx("span", { className: "rec-pulse h-2 w-2 rounded-full bg-red-500", "aria-hidden": "true" }),
              "Sri Lanka's media education institute"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "h1",
          {
            style: { "--d": "120ms" },
            className: "hero-in display-wide text-5xl text-navy sm:text-6xl xl:text-7xl",
            children: [
              "Research.",
              /* @__PURE__ */ jsx("br", {}),
              "Educate.",
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "text-brand", children: "Empower." })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "p",
          {
            style: { "--d": "260ms" },
            className: "hero-in mt-8 max-w-lg text-lg leading-8 text-navy-600",
            children: "The Institute of Media Development and Research (IMDR) is a multidisciplinary institution for education, research, professional development and community empowerment in Sri Lanka, focused on media literacy, content creation, digital competence, journalism and AI for media."
          }
        ),
        /* @__PURE__ */ jsxs("div", { style: { "--d": "400ms" }, className: "hero-in mt-10 flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsx(Button, { href: "/courses", variant: "gold", size: "lg", children: "Explore Courses" }),
          /* @__PURE__ */ jsx(Button, { href: "/apply", variant: "outline", size: "lg", children: "Apply Now" })
        ] }),
        /* @__PURE__ */ jsx(
          "p",
          {
            style: { "--d": "520ms" },
            className: "hero-in mt-8 max-w-md text-sm leading-6 text-navy-500",
            children: "No online student account is needed. Submit an Application Form online or visit our institute directly."
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { style: { "--d": "300ms" }, className: "hero-in relative mx-auto w-full max-w-md lg:col-span-6 lg:max-w-none", children: /* @__PURE__ */ jsxs("div", { className: "relative mx-auto aspect-[4/5] w-full max-w-md lg:ml-auto lg:mr-0", children: [
        /* @__PURE__ */ jsx(
          Photo,
          {
            src: `${IMG}hero-main.jpg`,
            alt: "IMDR students filming",
            zoom: false,
            className: "kenburns h-full w-full rounded-3xl shadow-2xl"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "float-slow absolute -right-2 top-10 rounded-2xl bg-gold px-5 py-4 text-navy shadow-xl sm:-right-6 xl:-right-8", children: [
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-extrabold leading-none", children: "18" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs font-semibold", children: "Practical courses" })
        ] }),
        /* @__PURE__ */ jsx(
          Photo,
          {
            src: `${IMG}hero-camera.jpg`,
            alt: "Camera equipment",
            className: "float-slower absolute -bottom-8 -left-4 h-36 w-36 rounded-2xl border-4 border-white shadow-xl sm:-left-10 sm:h-44 sm:w-44"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-navy/80 px-3 py-1.5 text-xs font-bold text-white", children: [
          /* @__PURE__ */ jsx("span", { className: "rec-pulse h-2 w-2 rounded-full bg-red-500", "aria-hidden": "true" }),
          "REC"
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "marquee overflow-hidden bg-gold py-5 text-navy", "aria-hidden": "true", children: /* @__PURE__ */ jsx("div", { className: "marquee-track flex w-max gap-12 whitespace-nowrap text-lg font-bold", children: [...ticker, ...ticker].map((t, i) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-12", children: [
      t,
      /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-navy" })
    ] }, i)) }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-navy text-white", children: /* @__PURE__ */ jsx("dl", { className: "mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4", children: highlights.map(([value, label2], i) => /* @__PURE__ */ jsxs(Reveal, { delay: i * 100, className: "px-4 py-12 text-center", children: [
      /* @__PURE__ */ jsx("dt", { className: "text-4xl font-extrabold text-gold sm:text-5xl", children: typeof value === "number" ? /* @__PURE__ */ jsx(CountUp, { to: value }) : value }),
      /* @__PURE__ */ jsx("dd", { className: "mt-2 text-sm text-navy-200", children: label2 })
    ] }, label2)) }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-paper", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-7xl items-center gap-20 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-36", children: [
      /* @__PURE__ */ jsxs(Reveal, { className: "relative pb-12 pr-6 sm:pr-12", children: [
        /* @__PURE__ */ jsx(
          Photo,
          {
            src: `${IMG}about.jpg`,
            alt: "IMDR workshop",
            className: "aspect-[4/3] rounded-3xl shadow-xl"
          }
        ),
        /* @__PURE__ */ jsx(
          Photo,
          {
            src: `${IMG}hero-studio.jpg`,
            alt: "IMDR editing studio",
            className: "float-slow absolute bottom-0 right-0 h-32 w-32 rounded-2xl border-4 border-paper shadow-xl sm:h-44 sm:w-44"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Reveal, { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold leading-tight text-navy sm:text-4xl lg:text-5xl", children: "Building informed, skilled and empowered people." }),
          /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg leading-8 text-navy-600", children: "Social media, smartphones, digital platforms and AI are changing the way people learn, communicate and create. IMDR provides practical education that helps learners understand media, develop digital skills, think critically and create responsible content." })
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "mt-12 grid gap-5 sm:grid-cols-2", children: pillars.map(([name, text2], i) => /* @__PURE__ */ jsxs(
          Reveal,
          {
            as: "li",
            delay: i * 120,
            className: "rounded-2xl border border-navy-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand hover:shadow-xl",
            children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-gold", children: [
                "0",
                i + 1
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-2 text-xl font-bold text-navy", children: name }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-navy-600", children: text2 })
            ]
          },
          name
        )) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:py-32", children: [
      /* @__PURE__ */ jsxs(Reveal, { className: "mb-14 text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-navy sm:text-4xl lg:text-5xl", children: "Your path, frame by frame" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-5 max-w-2xl text-lg leading-8 text-navy-600", children: "IMDR combines structured education with practical media, digital, communication and technology-based learning." })
      ] }),
      /* @__PURE__ */ jsx(Reveal, { delay: 150, children: /* @__PURE__ */ jsx(Timeline, {}) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-paper", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32", children: [
      /* @__PURE__ */ jsxs(Reveal, { className: "mb-12 flex flex-wrap items-end justify-between gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-navy sm:text-4xl lg:text-5xl", children: "18 Specialised Courses" }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-2xl text-lg leading-8 text-navy-600", children: "Practical-focused courses covering media, communication, cinema, digital technology, AI and modern content creation." })
        ] }),
        /* @__PURE__ */ jsxs(
          Link$1,
          {
            href: "/courses",
            className: "inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline",
            children: [
              "Explore all courses ",
              /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(Reveal, { className: "mb-12 flex flex-wrap gap-3", children: types2 == null ? void 0 : types2.filter((t) => t.courses_count > 0).map((t) => /* @__PURE__ */ jsxs(
        Link$1,
        {
          href: `/courses?type=${t.id}`,
          className: "rounded-full border border-navy-200 bg-white px-5 py-2 text-sm font-medium text-navy transition hover:border-brand hover:bg-brand hover:text-white",
          children: [
            t.name,
            " ",
            /* @__PURE__ */ jsxs("span", { className: "opacity-60", children: [
              "(",
              t.courses_count,
              ")"
            ] })
          ]
        },
        t.id
      )) }),
      /* @__PURE__ */ jsx("ul", { className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-3", children: shown == null ? void 0 : shown.map((c, i) => {
        var _a;
        return /* @__PURE__ */ jsx(Reveal, { as: "li", delay: i % 3 * 120, children: /* @__PURE__ */ jsxs(
          Link$1,
          {
            href: `/courses/${c.slug}`,
            className: "group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
            children: [
              /* @__PURE__ */ jsx(CourseImage$1, { c, className: "aspect-[16/9]", children: /* @__PURE__ */ jsx("span", { className: "absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy", children: c.level_label || ((_a = c.course_type) == null ? void 0 : _a.name) }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-7", children: [
                c.duration && /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-brand", children: c.duration }),
                /* @__PURE__ */ jsx("h3", { className: "mt-1 text-xl font-bold text-navy transition group-hover:text-brand", children: c.name }),
                /* @__PURE__ */ jsx("p", { className: "mt-3 line-clamp-3 flex-1 text-sm leading-6 text-navy-600", children: c.summary }),
                /* @__PURE__ */ jsxs("span", { className: "mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand", children: [
                  "View course",
                  /* @__PURE__ */ jsx(ArrowRight, { size: 16, className: "transition group-hover:translate-x-1.5" })
                ] })
              ] })
            ]
          }
        ) }, c.id);
      }) }),
      /* @__PURE__ */ jsxs(Reveal, { className: "mt-14 text-center", children: [
        /* @__PURE__ */ jsx(Button, { href: "/courses", variant: "gold", size: "lg", children: "View all 18 courses" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-6 max-w-xl text-sm leading-6 text-navy-500", children: "Online account registration is not required. Submit an Application Form online or visit the institute directly." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-navy text-white", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32", children: [
      /* @__PURE__ */ jsxs(Reveal, { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold sm:text-4xl lg:text-5xl", children: "Learn. Practise. Create. Develop." }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 text-lg leading-8 text-navy-200", children: "IMDR's Media Production Unit and practical learning environment help students develop real-world skills in video production, photography, audio, digital content and modern media technologies." })
      ] }),
      /* @__PURE__ */ jsx("ol", { className: "mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: loop.map(([Icon, title, text2, img], i) => /* @__PURE__ */ jsx(Reveal, { as: "li", delay: i * 130, children: /* @__PURE__ */ jsxs(
        Photo,
        {
          src: `${IMG}${img}`,
          alt: title,
          className: "aspect-[4/5] rounded-2xl",
          children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" }),
            /* @__PURE__ */ jsx("span", { className: "absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-navy shadow-lg transition duration-300 group-hover:rotate-12 group-hover:scale-110", children: /* @__PURE__ */ jsx(Icon, { size: 22 }) }),
            /* @__PURE__ */ jsxs("span", { className: "absolute right-5 top-5 text-sm font-bold text-white/70", children: [
              "0",
              i + 1
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 bottom-0 p-6 transition duration-300 group-hover:-translate-y-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: title }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-navy-200", children: text2 })
            ] })
          ]
        }
      ) }, title)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-paper", children: /* @__PURE__ */ jsx("div", { className: "mx-auto grid max-w-7xl gap-8 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32", children: soon.map((b, i) => /* @__PURE__ */ jsxs(
      Reveal,
      {
        delay: i * 150,
        className: "rounded-2xl border border-navy-100 bg-white p-8 shadow-sm sm:p-10",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-8 flex items-end justify-between gap-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-navy", children: b.heading }),
            /* @__PURE__ */ jsxs(
              Link$1,
              {
                href: b.href,
                className: "inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline",
                children: [
                  b.link,
                  " ",
                  /* @__PURE__ */ jsx(ArrowRight, { size: 14 })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-dashed border-navy-200 bg-paper p-7", children: [
            /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-sm font-bold tracking-wide text-brand", children: [
              /* @__PURE__ */ jsx("span", { className: "rec-pulse h-2 w-2 rounded-full bg-red-500", "aria-hidden": "true" }),
              "COMING SOON"
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "mt-3 text-xl font-bold text-navy", children: b.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-7 text-navy-600", children: b.text })
          ] })
        ]
      },
      b.heading
    )) }) }),
    /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden bg-brand text-white", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-cover bg-center opacity-25",
          style: { backgroundImage: `url(${IMG}cta.jpg)` },
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxs(Reveal, { className: "relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-24 sm:px-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold sm:text-5xl", children: "Ready to start?" }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-xl text-lg leading-8 text-brand-100", children: "Complete the official Student Application Form online. No online student account registration is required." })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "shine inline-block rounded-lg", children: /* @__PURE__ */ jsx(Button, { href: "/apply", variant: "gold", size: "lg", children: "Apply Now" }) })
      ] })
    ] })
  ] });
}
const __vite_glob_0_28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
const icons = { note: FileText, pdf: FileText, slides: Presentation, video: Film, image: Image, link: Link2 };
const types = [["note", "Note"], ["pdf", "PDF"], ["slides", "Slides"], ["video", "Video"], ["image", "Image"], ["link", "Link"]].map(([value, label2]) => ({ value, label: label2 }));
function Index$6({ items, subjects, filters, canManage, teach }) {
  const [open, setOpen] = useState(false);
  const form = useForm({ subject_id: "", batch_id: "", title: "", type: "note", description: "", external_url: "", is_published: true, file: null });
  const batches = ((teach == null ? void 0 : teach.batches) || []).filter((b) => {
    const subject = teach.subjects.find((s) => String(s.id) === String(form.data.subject_id));
    if (!subject || b.course_id !== subject.course_id) return false;
    return !teach.pairs || teach.pairs.some(([bid, sid]) => bid === b.id && sid === subject.id);
  });
  const grouped = items.reduce((acc, c) => {
    var _a;
    return (acc[_a = c.subject] || (acc[_a] = [])).push(c), acc;
  }, {});
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Learning material" }),
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Learning material",
        subtitle: canManage ? "Notes, PDFs, slides and videos for your subjects. Files are private: only enrolled students can open them." : "Notes, slides and videos from your lecturers.",
        actions: canManage && /* @__PURE__ */ jsxs(Button, { variant: "gold", onClick: () => {
          form.clearErrors();
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsx(Plus, { size: 16 }),
          " Add material"
        ] })
      }
    ),
    subjects.length > 1 && /* @__PURE__ */ jsx("div", { className: "mb-5 max-w-xs", children: /* @__PURE__ */ jsx(SelectInput, { value: filters.subject_id, onChange: (e) => router.get("/portal/lms", e.target.value ? { subject_id: e.target.value } : {}, { preserveState: true }), options: subjects.map((s) => ({ value: s.id, label: s.name })), placeholder: "All subjects" }) }),
    items.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "Nothing here yet", children: canManage ? 'Use "Add material" to upload the first item.' : "Your lecturers will add material soon." }) : /* @__PURE__ */ jsx("div", { className: "space-y-8", children: Object.entries(grouped).map(([subject, list]) => /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-2 text-lg font-bold text-navy", children: subject }),
      /* @__PURE__ */ jsx("ul", { className: "divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white", children: list.map((c) => {
        const Icon = icons[c.type] || FileText;
        return /* @__PURE__ */ jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
            /* @__PURE__ */ jsx(Icon, { size: 20, className: "mt-0.5 shrink-0 text-brand" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "font-semibold text-navy", children: [
                c.title,
                " ",
                !c.is_published && /* @__PURE__ */ jsx(Badge, { tone: "amber", children: "Hidden" })
              ] }),
              c.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-600", children: c.description }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-navy-400", children: [
                c.batch ? `${c.batch}, ` : "All batches, ",
                "added ",
                fmtDate(c.created_at),
                c.author ? ` by ${c.author}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            c.has_file && /* @__PURE__ */ jsxs(Button, { native: true, href: `/portal/lms/${c.id}/download`, variant: "subtle", size: "sm", children: [
              /* @__PURE__ */ jsx(Download, { size: 14 }),
              " ",
              c.file_name ? "Download" : "Open"
            ] }),
            c.external_url && /* @__PURE__ */ jsxs(Button, { native: true, href: c.external_url, target: "_blank", rel: "noreferrer", variant: "subtle", size: "sm", children: [
              /* @__PURE__ */ jsx(ExternalLink, { size: 14 }),
              " Open link"
            ] }),
            canManage && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => router.put(`/portal/lms/${c.id}`, { title: c.title, description: c.description ?? "", external_url: c.external_url ?? "", is_published: !c.is_published }, { preserveScroll: true }), children: c.is_published ? "Hide" : "Publish" }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", "aria-label": "Delete", onClick: () => confirmThen("Delete this material and its file?", () => router.delete(`/portal/lms/${c.id}`, { preserveScroll: true })), children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
            ] })
          ] })
        ] }, c.id);
      }) })
    ] }, subject)) }),
    canManage && /* @__PURE__ */ jsxs(
      Modal,
      {
        open,
        onClose: () => setOpen(false),
        title: "Add learning material",
        wide: true,
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: form.processing, onClick: () => form.post("/portal/lms", { forceFormData: true, preserveScroll: true, onSuccess: () => {
            setOpen(false);
            form.reset();
          } }), children: form.processing ? "Uploading..." : "Add" })
        ] }),
        children: [
          /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Subject", error: form.errors.subject_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.subject_id, onChange: (e) => form.setData({ ...form.data, subject_id: e.target.value, batch_id: "" }), options: teach.subjects.map((s) => ({ value: s.id, label: s.name })) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Batch", error: form.errors.batch_id, help: "Empty = every batch of the course.", children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.batch_id, onChange: (e) => form.setData("batch_id", e.target.value), options: batches.map((b) => ({ value: b.id, label: b.name })), placeholder: "All batches" }) }),
            /* @__PURE__ */ jsx(Field, { label: "Title", error: form.errors.title, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.title, onChange: (e) => form.setData("title", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Type", error: form.errors.type, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.type, onChange: (e) => form.setData("type", e.target.value), options: types, placeholder: null }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4", children: [
            /* @__PURE__ */ jsx(Field, { label: "Description", error: form.errors.description, children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: form.data.description, onChange: (e) => form.setData("description", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "File", error: form.errors.file, help: "Up to 200 MB. For very large videos paste a YouTube or Vimeo link below instead.", children: /* @__PURE__ */ jsx("input", { type: "file", onChange: (e) => form.setData("file", e.target.files[0] || null), className: "input" }) }),
            /* @__PURE__ */ jsx(Field, { label: "Or a link", error: form.errors.external_url, children: /* @__PURE__ */ jsx(TextInput, { type: "url", placeholder: "https://", value: form.data.external_url, onChange: (e) => form.setData("external_url", e.target.value) }) }),
            /* @__PURE__ */ jsx(Check2, { label: "Visible to students now", checked: form.data.is_published, onChange: (v) => form.setData("is_published", v) })
          ] })
        ]
      }
    )
  ] });
}
const __vite_glob_0_29 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$6
}, Symbol.toStringTag, { value: "Module" }));
function Cell({ col, row }) {
  const v = row[col.key];
  switch (col.type) {
    case "money":
      return money(v);
    case "date":
      return fmtDate(v);
    case "datetime":
      return fmtDateTime(v);
    case "badge":
      return v ? /* @__PURE__ */ jsx(Status, { value: v }) : "-";
    case "bool":
      return v ? /* @__PURE__ */ jsx(Badge, { tone: "green", children: "Yes" }) : /* @__PURE__ */ jsx(Badge, { tone: "gray", children: "No" });
    case "limit":
      return /* @__PURE__ */ jsx("span", { title: v, children: v && v.length > 70 ? `${v.slice(0, 70)}...` : v ?? "-" });
    default:
      return /* @__PURE__ */ jsx("span", { className: "whitespace-pre-line", children: v ?? "-" });
  }
}
const initialFor = (fields, row) => {
  const data = {};
  for (const f of fields) {
    let v = row ? row[f.name] : void 0;
    if (f.type === "checkbox") v = row ? !!v : ["is_published", "published"].includes(f.name);
    else if (f.type === "datetime") v = toLocalInput(v);
    else if (f.type === "password") v = "";
    else if (v === null || v === void 0) v = "";
    data[f.name] = v;
  }
  return data;
};
function Index$5({ resource, items, filters }) {
  const [modal, setModal] = useState(null);
  const [f, setF] = useFilters(`/portal/manage/${resource.key}`, { search: filters.search });
  const form = useForm({});
  const base = `/portal/manage/${resource.key}`;
  const canEdit = resource.canWrite && resource.fields.length > 0;
  const open = (row) => {
    form.clearErrors();
    form.setData(initialFor(resource.fields, row));
    setModal({ row });
  };
  const submit = (e) => {
    e.preventDefault();
    const options2 = { preserveScroll: true, onSuccess: () => setModal(null) };
    modal.row ? form.put(`${base}/${modal.row.id}`, options2) : form.post(base, options2);
  };
  const remove = (row) => confirmThen(`Delete this ${resource.singular.toLowerCase()}?`, () => router.delete(`${base}/${row.id}`, { preserveScroll: true }));
  const input = (fd) => {
    const value = form.data[fd.name] ?? "";
    const common = { value, onChange: (e) => form.setData(fd.name, e.target.value), required: fd.required };
    if (fd.type === "checkbox") return /* @__PURE__ */ jsx(Check2, { label: fd.label, checked: form.data[fd.name], onChange: (v) => form.setData(fd.name, v), help: fd.help }, fd.name);
    let control;
    if (fd.type === "select") control = /* @__PURE__ */ jsx(SelectInput, { ...common, options: fd.options || [] });
    else if (fd.type === "textarea") control = /* @__PURE__ */ jsx(TextArea, { ...common });
    else if (fd.type === "datetime") control = /* @__PURE__ */ jsx(TextInput, { type: "datetime-local", ...common });
    else control = /* @__PURE__ */ jsx(TextInput, { type: fd.type, step: fd.step, placeholder: fd.placeholder, autoComplete: fd.type === "password" ? "new-password" : void 0, ...common });
    return /* @__PURE__ */ jsx(Field, { label: fd.label, help: fd.help, error: form.errors[fd.name], children: control }, fd.name);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: resource.title }),
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: resource.title,
        subtitle: resource.help,
        actions: resource.canWrite && resource.canCreate && /* @__PURE__ */ jsxs(Button, { variant: "gold", onClick: () => open(null), children: [
          /* @__PURE__ */ jsx(Plus, { size: 16 }),
          " Add ",
          resource.singular.toLowerCase()
        ] })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mb-4 max-w-sm", children: /* @__PURE__ */ jsx(SearchBox, { value: f.search, onChange: (v) => setF({ search: v }), placeholder: `Search ${resource.title.toLowerCase()}` }) }),
    items.data.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: f.search ? "Nothing matches your search" : `No ${resource.title.toLowerCase()} yet`, children: resource.canWrite && resource.canCreate && !f.search ? `Use "Add ${resource.singular.toLowerCase()}" to create the first one.` : null }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        resource.columns.map((c) => /* @__PURE__ */ jsx("th", { className: "th", children: c.label }, c.key)),
        resource.canWrite && /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: items.data.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-navy-50/50", children: [
        resource.columns.map((c) => /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Cell, { col: c, row }) }, c.key)),
        resource.canWrite && /* @__PURE__ */ jsxs("td", { className: "td whitespace-nowrap text-right", children: [
          canEdit && /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => open(row), "aria-label": "Edit", children: [
            /* @__PURE__ */ jsx(Pencil, { size: 14 }),
            " Edit"
          ] }),
          resource.canCreate && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", onClick: () => remove(row), "aria-label": "Delete", children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
        ] })
      ] }, row.id)) })
    ] }),
    /* @__PURE__ */ jsx(Pagination, { paginator: items }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: !!modal,
        onClose: () => setModal(null),
        title: (modal == null ? void 0 : modal.row) ? `Edit ${resource.singular.toLowerCase()}` : `Add ${resource.singular.toLowerCase()}`,
        wide: resource.fields.length > 6,
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setModal(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: form.processing, onClick: submit, children: form.processing ? "Saving..." : "Save" })
        ] }),
        children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
          /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
          /* @__PURE__ */ jsx("div", { className: resource.fields.length > 6 ? "grid gap-4 sm:grid-cols-2" : "space-y-4", children: resource.fields.map(input) }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "hidden" })
        ] })
      }
    )
  ] });
}
const __vite_glob_0_30 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$5
}, Symbol.toStringTag, { value: "Module" }));
function Notifications({ items }) {
  const unread = items.filter((n) => !n.read_at).length;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Notifications" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Notifications", actions: unread > 0 && /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => router.post("/portal/notifications/read-all"), children: "Mark all as read" }) }),
    items.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "You have no notifications" }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white", children: items.map((n) => /* @__PURE__ */ jsxs("li", { className: cx("flex items-start justify-between gap-3 px-4 py-3", !n.read_at && "bg-brand-50/50"), children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: cx("text-navy", !n.read_at && "font-bold"), children: n.title }),
        n.body && /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-600", children: n.body }),
        /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-navy-400", children: fmtDateTime(n.created_at) })
      ] }),
      n.link ? /* @__PURE__ */ jsx(Button, { variant: "subtle", size: "sm", onClick: () => router.post(`/portal/notifications/${n.id}/read`), children: "Open" }) : !n.read_at && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => router.post(`/portal/notifications/${n.id}/read`), children: "Mark read" })
    ] }, n.id)) })
  ] });
}
const __vite_glob_0_31 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Notifications
}, Symbol.toStringTag, { value: "Module" }));
function Redirect({ checkout }) {
  const form = useRef(null);
  useEffect(() => {
    var _a;
    (_a = form.current) == null ? void 0 : _a.submit();
  }, []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Opening the payment page" }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center", children: [
      /* @__PURE__ */ jsx("img", { src: "/images/logo.jpg", alt: "IMDR", className: "h-20 w-20 object-contain" }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg font-bold text-navy", children: "Taking you to the secure payment page..." }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-navy-500", children: "Please do not close this window." }),
      /* @__PURE__ */ jsxs("form", { ref: form, method: checkout.method, action: checkout.action, className: "mt-6", children: [
        Object.entries(checkout.fields || {}).map(([k, v]) => /* @__PURE__ */ jsx("input", { type: "hidden", name: k, value: v ?? "" }, k)),
        /* @__PURE__ */ jsx("noscript", { children: /* @__PURE__ */ jsx("button", { type: "submit", className: "rounded-lg bg-gold px-4 py-2 font-semibold text-navy", children: "Continue to payment" }) })
      ] })
    ] })
  ] });
}
const __vite_glob_0_32 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Redirect
}, Symbol.toStringTag, { value: "Module" }));
function Return({ transaction, cancelled }) {
  const pending = transaction.status === "pending";
  useEffect(() => {
    if (!pending) return void 0;
    const id = setInterval(() => router.reload({ only: ["transaction", "unread"] }), 3e3);
    return () => clearInterval(id);
  }, [pending]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Payment status" }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-lg py-6", children: /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-navy-500", children: [
        transaction.invoice.invoice_no,
        ": ",
        transaction.invoice.description
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-3xl font-bold text-navy", children: money(transaction.amount) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5", children: [
        transaction.status === "success" && /* @__PURE__ */ jsx(Alert, { tone: "green", title: "Payment received", children: "Thank you. Your receipt is in Fees and payments, and we are sending a copy to your WhatsApp." }),
        pending && !cancelled && /* @__PURE__ */ jsx(Alert, { tone: "amber", title: "Waiting for the bank to confirm", children: "This usually takes a few seconds. You do not need to pay again." }),
        pending && cancelled && /* @__PURE__ */ jsx(Alert, { tone: "amber", title: "Payment cancelled", children: "You left the payment page. Nothing was charged. You can try again from Fees and payments." }),
        ["failed", "cancelled"].includes(transaction.status) && /* @__PURE__ */ jsx(Alert, { tone: "red", title: "Payment was not completed", children: "Nothing was charged and your invoice is still unpaid. You can try again." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 flex gap-2", children: /* @__PURE__ */ jsx(Button, { href: "/portal/finance", variant: "primary", children: "Back to fees and payments" }) })
    ] }) })
  ] });
}
const __vite_glob_0_33 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Return
}, Symbol.toStringTag, { value: "Module" }));
function Sandbox({ transaction }) {
  const [busy, setBusy] = useState(false);
  const go = (result) => {
    setBusy(true);
    router.post(`/payment/sandbox/${transaction.order_id}`, { result }, { onFinish: () => setBusy(false) });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Test payment page" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-lg py-6", children: [
      /* @__PURE__ */ jsx(Alert, { tone: "amber", title: "Test payment page", className: "mb-4", children: "This is the built-in practice gateway. No money moves. In production this page is replaced by PayHere." }),
      /* @__PURE__ */ jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "Paying for" }),
        /* @__PURE__ */ jsx("p", { className: "font-bold text-navy", children: transaction.invoice.description }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: transaction.invoice.invoice_no }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-3xl font-bold text-navy", children: money(transaction.amount) }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-navy-400", children: [
          "Transaction ",
          transaction.order_id
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "gold", size: "lg", disabled: busy, onClick: () => go("success"), children: "Pay successfully" }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", disabled: busy, onClick: () => go("failed"), children: "Simulate a failed payment" }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", disabled: busy, onClick: () => go("cancelled"), children: "Cancel" })
        ] })
      ] })
    ] })
  ] });
}
const __vite_glob_0_34 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Sandbox
}, Symbol.toStringTag, { value: "Module" }));
const titles = { news: "News", event: "Events", research: "Research", media: "Media" };
const blurbs = {
  news: "What is happening at IMDR.",
  event: "Workshops, open days and seminars.",
  research: "Studies and reports from the IMDR Research Centre.",
  media: "Student work and educational media from IMDR."
};
function Index$4({ type, posts }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: titles[type] }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl px-4 py-12 sm:px-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "display-wide text-4xl text-navy sm:text-5xl", children: titles[type] }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-navy-600", children: blurbs[type] }),
      posts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-10 rounded-xl border border-dashed border-navy-200 p-8 text-center text-navy-500", children: "Nothing has been published here yet. Please check back soon." }) : /* @__PURE__ */ jsx("ul", { className: "mt-8 divide-y divide-navy-100 border-y border-navy-100", children: posts.map((p) => /* @__PURE__ */ jsxs("li", { className: "py-5", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-brand", children: [
          type === "event" ? fmtDate(p.event_date) : fmtDate(p.published_at),
          p.location ? `, ${p.location}` : ""
        ] }),
        /* @__PURE__ */ jsx(Link$1, { href: `/posts/${p.slug}`, className: "text-xl font-bold text-navy hover:text-brand", children: p.title }),
        p.excerpt && /* @__PURE__ */ jsx("p", { className: "mt-1 text-navy-600", children: p.excerpt })
      ] }, p.id)) })
    ] })
  ] });
}
const __vite_glob_0_35 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$4
}, Symbol.toStringTag, { value: "Module" }));
const back = { news: "/news", event: "/events", research: "/research", media: "/media", announcement: "/news" };
function Show$2({ post }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: post.title }),
    /* @__PURE__ */ jsxs("article", { className: "mx-auto max-w-3xl px-4 py-12 sm:px-6", children: [
      /* @__PURE__ */ jsx(Link$1, { href: back[post.type] || "/", className: "text-sm font-semibold text-brand hover:underline", children: "Back" }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm font-semibold text-brand", children: post.type === "event" && post.event_date ? `${fmtDateTime(post.event_date)}${post.location ? `, ${post.location}` : ""}` : fmtDate(post.published_at) }),
      /* @__PURE__ */ jsx("h1", { className: "display-wide mt-1 text-3xl text-navy sm:text-4xl", children: post.title }),
      post.image_url && /* @__PURE__ */ jsx("img", { src: post.image_url, alt: "", className: "mt-6 w-full rounded-xl" }),
      post.excerpt && /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg text-navy-600", children: post.excerpt }),
      post.body && /* @__PURE__ */ jsx("div", { className: "mt-4 whitespace-pre-line text-navy-700", children: post.body })
    ] })
  ] });
}
const __vite_glob_0_36 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Show$2
}, Symbol.toStringTag, { value: "Module" }));
function Profile({ account, student }) {
  const info = useForm({ name: account.name, email: account.email || "", phone: account.phone || "", whatsapp_number: (student == null ? void 0 : student.whatsapp_number) || "" });
  const pw = useForm({ current_password: "", password: "", password_confirmation: "" });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "My profile" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "My profile", subtitle: `Username: ${account.username}. Role: ${label(account.role)}${student ? `. Student ID: ${student.student_no}` : ""}` }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 font-bold", children: "My details" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          info.put("/portal/profile", { preserveScroll: true });
        }, className: "space-y-4", children: [
          /* @__PURE__ */ jsx(FormError, { errors: info.errors }),
          /* @__PURE__ */ jsx(Field, { label: "Full name", error: info.errors.name, children: /* @__PURE__ */ jsx(TextInput, { value: info.data.name, onChange: (e) => info.setData("name", e.target.value), required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "Email", error: info.errors.email, children: /* @__PURE__ */ jsx(TextInput, { type: "email", value: info.data.email, onChange: (e) => info.setData("email", e.target.value) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Phone", error: info.errors.phone, children: /* @__PURE__ */ jsx(TextInput, { value: info.data.phone, onChange: (e) => info.setData("phone", e.target.value) }) }),
          student && /* @__PURE__ */ jsx(Field, { label: "WhatsApp number", error: info.errors.whatsapp_number, help: "Payment receipts are sent to this number.", children: /* @__PURE__ */ jsx(TextInput, { value: info.data.whatsapp_number, onChange: (e) => info.setData("whatsapp_number", e.target.value) }) }),
          /* @__PURE__ */ jsx(Button, { type: "submit", variant: "primary", disabled: info.processing, children: "Save details" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 font-bold", children: "Change password" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          pw.put("/portal/profile/password", { preserveScroll: true, onSuccess: () => pw.reset() });
        }, className: "space-y-4", children: [
          /* @__PURE__ */ jsx(Field, { label: "Current password", error: pw.errors.current_password, children: /* @__PURE__ */ jsx(TextInput, { type: "password", value: pw.data.current_password, onChange: (e) => pw.setData("current_password", e.target.value), autoComplete: "current-password", required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "New password", error: pw.errors.password, help: "At least 8 characters.", children: /* @__PURE__ */ jsx(TextInput, { type: "password", value: pw.data.password, onChange: (e) => pw.setData("password", e.target.value), autoComplete: "new-password", required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "Repeat new password", children: /* @__PURE__ */ jsx(TextInput, { type: "password", value: pw.data.password_confirmation, onChange: (e) => pw.setData("password_confirmation", e.target.value), autoComplete: "new-password", required: true }) }),
          /* @__PURE__ */ jsx(Button, { type: "submit", variant: "primary", disabled: pw.processing, children: "Change password" })
        ] })
      ] })
    ] })
  ] });
}
const __vite_glob_0_37 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Profile
}, Symbol.toStringTag, { value: "Module" }));
const blankQuestion = () => ({ question: "", options: ["", ""], correct_index: 0, marks: 1 });
function Create$1({ teach }) {
  const form = useForm({ subject_id: "", batch_id: "", title: "", description: "", time_limit_minutes: 20, is_published: false, questions: [blankQuestion()] });
  const e = form.errors;
  const batches = teach.batches.filter((b) => {
    const subject = teach.subjects.find((s) => String(s.id) === String(form.data.subject_id));
    return subject && b.course_id === subject.course_id && (!teach.pairs || teach.pairs.some(([bid, sid]) => bid === b.id && sid === subject.id));
  });
  const setQ = (i, patch) => form.setData("questions", form.data.questions.map((q, k) => k === i ? { ...q, ...patch } : q));
  const addQ = () => form.setData("questions", [...form.data.questions, blankQuestion()]);
  const removeQ = (i) => form.setData("questions", form.data.questions.filter((_, k) => k !== i));
  const setOpt = (qi, oi, value) => setQ(qi, { options: form.data.questions[qi].options.map((o, k) => k === oi ? value : o) });
  const addOpt = (qi) => setQ(qi, { options: [...form.data.questions[qi].options, ""] });
  const removeOpt = (qi, oi) => setQ(qi, { options: form.data.questions[qi].options.filter((_, k) => k !== oi), correct_index: form.data.questions[qi].correct_index === oi ? 0 : form.data.questions[qi].correct_index });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "New quiz" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "New quiz" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: (ev) => {
      ev.preventDefault();
      form.post("/portal/quizzes");
    }, className: "space-y-6", children: [
      /* @__PURE__ */ jsx(FormError, { errors: e }),
      /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Subject", error: e.subject_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.subject_id, onChange: (ev) => form.setData({ ...form.data, subject_id: ev.target.value, batch_id: "" }), options: teach.subjects.map((s) => ({ value: s.id, label: s.name })) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Batch", error: e.batch_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.batch_id, onChange: (ev) => form.setData("batch_id", ev.target.value), options: batches.map((b) => ({ value: b.id, label: b.name })) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Title", error: e.title, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.title, onChange: (ev) => form.setData("title", ev.target.value) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Time limit (minutes)", error: e.time_limit_minutes, children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "1", value: form.data.time_limit_minutes, onChange: (ev) => form.setData("time_limit_minutes", ev.target.value) }) })
        ] }),
        /* @__PURE__ */ jsx(Field, { label: "Description (optional)", error: e.description, children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: form.data.description, onChange: (ev) => form.setData("description", ev.target.value) }) }),
        /* @__PURE__ */ jsx(Check2, { label: "Publish immediately", checked: form.data.is_published, onChange: (v) => form.setData("is_published", v), help: "Leave unchecked to prepare it first, and publish later." })
      ] }),
      form.data.questions.map((q, qi) => /* @__PURE__ */ jsxs(Card, { className: "space-y-3 p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-bold", children: [
            "Question ",
            qi + 1
          ] }),
          form.data.questions.length > 1 && /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "text-red-600", onClick: () => removeQ(qi), children: [
            /* @__PURE__ */ jsx(Trash2, { size: 14 }),
            " Remove"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Field, { label: "Question", error: e[`questions.${qi}.question`], children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: q.question, onChange: (ev) => setQ(qi, { question: ev.target.value }) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Marks", error: e[`questions.${qi}.marks`], children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "0.5", step: "0.5", className: "max-w-28", value: q.marks, onChange: (ev) => setQ(qi, { marks: ev.target.value }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-navy-700", children: "Options - select the correct one" }),
          q.options.map((opt, oi) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("input", { type: "radio", name: `correct-${qi}`, checked: q.correct_index === oi, onChange: () => setQ(qi, { correct_index: oi }), className: "h-4 w-4", "aria-label": `Option ${oi + 1} is correct` }),
            /* @__PURE__ */ jsx(TextInput, { value: opt, onChange: (ev) => setOpt(qi, oi, ev.target.value), placeholder: `Option ${oi + 1}` }),
            q.options.length > 2 && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeOpt(qi, oi), "aria-label": "Remove option", children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
          ] }, oi)),
          e[`questions.${qi}.correct_index`] && /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-red-600", children: e[`questions.${qi}.correct_index`] }),
          q.options.length < 6 && /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => addOpt(qi), children: [
            /* @__PURE__ */ jsx(Plus, { size: 14 }),
            " Add option"
          ] })
        ] })
      ] }, qi)),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: addQ, children: [
        /* @__PURE__ */ jsx(Plus, { size: 16 }),
        " Add another question"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", variant: "gold", size: "lg", disabled: form.processing, children: form.processing ? "Saving..." : "Create quiz" }),
        /* @__PURE__ */ jsx(Button, { href: "/portal/quizzes", variant: "outline", size: "lg", children: "Cancel" })
      ] })
    ] })
  ] });
}
const __vite_glob_0_38 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Create$1
}, Symbol.toStringTag, { value: "Module" }));
function Index$3({ items, canManage }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Quizzes" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Quizzes", actions: canManage && /* @__PURE__ */ jsxs(Button, { href: "/portal/quizzes/create", variant: "gold", children: [
      /* @__PURE__ */ jsx(Plus, { size: 16 }),
      " New quiz"
    ] }) }),
    items.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No quizzes yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Quiz" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Subject" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Batch" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Questions" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Time limit" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: canManage ? "Status" : "Result" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: items.map((q) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-navy-50/50", children: [
        /* @__PURE__ */ jsx("td", { className: "td font-semibold", children: /* @__PURE__ */ jsx(Link$1, { href: `/portal/quizzes/${q.id}`, className: "text-brand hover:underline", children: q.title }) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: q.subject }),
        /* @__PURE__ */ jsx("td", { className: "td", children: q.batch }),
        /* @__PURE__ */ jsx("td", { className: "td", children: q.questions_count }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          q.time_limit_minutes,
          " min"
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: canManage ? q.is_published ? /* @__PURE__ */ jsxs(Badge, { tone: "green", children: [
          "Published, ",
          q.attempts_count,
          " attempts"
        ] }) : /* @__PURE__ */ jsx(Badge, { tone: "gray", children: "Hidden" }) : q.mine ? /* @__PURE__ */ jsxs(Badge, { tone: "green", children: [
          q.mine.score,
          "/",
          q.mine.total
        ] }) : /* @__PURE__ */ jsx(Badge, { tone: "amber", children: "Not attempted" }) }),
        /* @__PURE__ */ jsxs("td", { className: "td text-right", children: [
          /* @__PURE__ */ jsx(Button, { href: `/portal/quizzes/${q.id}`, size: "sm", variant: "subtle", children: canManage ? "Open" : q.mine ? "Review" : "Attempt" }),
          canManage && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", "aria-label": "Delete", onClick: () => confirmThen("Delete this quiz?", () => router.delete(`/portal/quizzes/${q.id}`)), children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
        ] })
      ] }, q.id)) })
    ] })
  ] });
}
const __vite_glob_0_39 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$3
}, Symbol.toStringTag, { value: "Module" }));
function Show$1({ quiz, questions, attempt, review, attempts, canManage }) {
  const submit = useForm({ answers: {}, started_at: (/* @__PURE__ */ new Date()).toISOString() });
  const [seconds, setSeconds] = useState(quiz.time_limit_minutes * 60);
  const active = !canManage && !attempt;
  useEffect(() => {
    if (!active) return void 0;
    const id = setInterval(() => setSeconds((s) => s <= 1 ? (clearInterval(id), submit.post(`/portal/quizzes/${quiz.id}/attempt`), 0) : s - 1), 1e3);
    return () => clearInterval(id);
  }, [active]);
  const pick = (qid, idx) => submit.setData("answers", { ...submit.data.answers, [qid]: idx });
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: quiz.title }),
    /* @__PURE__ */ jsx(PageHeader, { title: quiz.title, subtitle: `${quiz.subject}, ${quiz.batch}`, actions: /* @__PURE__ */ jsx(Button, { href: "/portal/quizzes", variant: "outline", children: "Back" }) }),
    quiz.description && /* @__PURE__ */ jsx("p", { className: "mb-4 text-navy-600", children: quiz.description }),
    canManage ? /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 font-bold", children: "Questions" }),
        /* @__PURE__ */ jsx("ol", { className: "space-y-4", children: questions.map((q, i) => /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsxs("p", { className: "font-semibold text-navy", children: [
            i + 1,
            ". ",
            q.question,
            " ",
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-normal text-navy-400", children: [
              "(",
              q.marks,
              " marks)"
            ] })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "mt-1 space-y-1 pl-4 text-sm", children: q.options.map((o, oi) => /* @__PURE__ */ jsxs("li", { className: cx(oi === q.correct_index && "font-semibold text-emerald-700"), children: [
            oi === q.correct_index && /* @__PURE__ */ jsx(Check, { size: 14, className: "mr-1 inline" }),
            o
          ] }, oi)) })
        ] }, q.id)) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Attempts" }),
          /* @__PURE__ */ jsx(Badge, { tone: quiz.is_published ? "green" : "gray", children: quiz.is_published ? "Published" : "Hidden" })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "mb-3", onClick: () => router.put(`/portal/quizzes/${quiz.id}`, { is_published: !quiz.is_published }, { preserveScroll: true }), children: quiz.is_published ? "Hide from students" : "Publish to students" }),
        attempts.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No attempts yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
          /* @__PURE__ */ jsxs(Thead, { children: [
            /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
            /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Score" })
          ] }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: attempts.map((a) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsxs("td", { className: "td", children: [
              a.student,
              /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: a.student_no })
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "td text-right font-semibold", children: [
              a.score,
              "/",
              a.total
            ] })
          ] }, a.id)) })
        ] })
      ] })
    ] }) : attempt ? /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsx(Alert, { tone: "green", title: `Your score: ${attempt.score} / ${attempt.total}`, className: "mb-5", children: "Correct answers are shown below." }),
      /* @__PURE__ */ jsx("ol", { className: "space-y-4", children: questions.map((q, i) => /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsxs("p", { className: "font-semibold text-navy", children: [
          i + 1,
          ". ",
          q.question
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "mt-1 space-y-1 pl-4 text-sm", children: q.options.map((o, oi) => {
          const isCorrect = oi === review[q.id];
          const wasPicked = attempt.answers[q.id] === oi;
          return /* @__PURE__ */ jsxs("li", { className: cx("flex items-center gap-1", isCorrect && "font-semibold text-emerald-700", wasPicked && !isCorrect && "text-red-700 line-through"), children: [
            isCorrect ? /* @__PURE__ */ jsx(Check, { size: 14 }) : wasPicked ? /* @__PURE__ */ jsx(X, { size: 14 }) : /* @__PURE__ */ jsx("span", { className: "w-3.5" }),
            " ",
            o
          ] }, oi);
        }) })
      ] }, q.id)) })
    ] }) : /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between rounded-lg bg-navy-50 px-4 py-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-600", children: "One attempt only. Submitted automatically when time runs out." }),
        /* @__PURE__ */ jsxs("p", { className: "font-mono text-lg font-bold text-navy", children: [
          mm,
          ":",
          ss
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        submit.post(`/portal/quizzes/${quiz.id}/attempt`);
      }, children: [
        /* @__PURE__ */ jsx("ol", { className: "space-y-5", children: questions.map((q, i) => /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsxs("p", { className: "font-semibold text-navy", children: [
            i + 1,
            ". ",
            q.question
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1", role: "radiogroup", "aria-label": `Question ${i + 1}`, children: q.options.map((o, oi) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-navy-50", children: [
            /* @__PURE__ */ jsx("input", { type: "radio", name: `q-${q.id}`, checked: submit.data.answers[q.id] === oi, onChange: () => pick(q.id, oi) }),
            " ",
            o
          ] }, oi)) })
        ] }, q.id)) }),
        /* @__PURE__ */ jsx(Button, { type: "submit", variant: "gold", size: "lg", className: "mt-6", disabled: submit.processing, children: submit.processing ? "Submitting..." : "Submit quiz" })
      ] })
    ] })
  ] });
}
const __vite_glob_0_40 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Show$1
}, Symbol.toStringTag, { value: "Module" }));
function Receipt({ receipt: r, public: isPublic }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Receipt ${r.receipt_no}` }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-paper px-4 py-8 print:bg-white print:py-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "no-print mx-auto mb-4 flex max-w-xl justify-between", children: [
        isPublic ? /* @__PURE__ */ jsx("span", {}) : /* @__PURE__ */ jsx(Button, { href: "/portal", variant: "outline", size: "sm", children: "Back to portal" }),
        /* @__PURE__ */ jsxs(Button, { variant: "primary", size: "sm", onClick: () => window.print(), children: [
          /* @__PURE__ */ jsx(Printer, { size: 14 }),
          " Print or save as PDF"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-xl rounded-xl border border-navy-100 bg-white p-8 shadow-lift print:border-0 print:shadow-none", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between border-b border-navy-100 pb-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("img", { src: "/images/logo.jpg", alt: "", className: "h-16 w-16 object-contain" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "display-wide text-xl text-navy", children: "IMDR" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-500", children: r.institute.name }),
              r.institute.address && /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-500", children: r.institute.address }),
              (r.institute.phone || r.institute.email) && /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-500", children: [r.institute.phone, r.institute.email].filter(Boolean).join(", ") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-500", children: "Payment receipt" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-navy", children: r.receipt_no }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-500", children: fmtDateTime(r.paid_at) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("dl", { className: "mt-5 grid grid-cols-[130px_1fr] gap-y-2 text-sm", children: [
          /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Received from" }),
          /* @__PURE__ */ jsx("dd", { className: "font-semibold", children: r.student.name }),
          /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Student ID" }),
          /* @__PURE__ */ jsx("dd", { children: r.student.student_no }),
          /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "For" }),
          /* @__PURE__ */ jsx("dd", { children: r.invoice.description }),
          /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Invoice" }),
          /* @__PURE__ */ jsx("dd", { children: r.invoice.invoice_no }),
          /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Method" }),
          /* @__PURE__ */ jsxs("dd", { children: [
            label(r.method),
            r.reference ? `, ref ${r.reference}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-lg bg-navy-50 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-navy", children: "Amount paid" }),
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-navy", children: money(r.amount) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between text-sm text-navy-600", children: [
            /* @__PURE__ */ jsx("span", { children: "Invoice total" }),
            /* @__PURE__ */ jsx("span", { children: money(r.invoice.total) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm text-navy-600", children: [
            /* @__PURE__ */ jsx("span", { children: "Paid so far" }),
            /* @__PURE__ */ jsx("span", { children: money(r.invoice.paid_amount) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm font-semibold text-navy", children: [
            /* @__PURE__ */ jsx("span", { children: "Balance on this invoice" }),
            /* @__PURE__ */ jsx("span", { children: money(r.invoice.balance) })
          ] })
        ] }),
        r.refunds.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 text-sm text-red-700", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Refunds" }),
          r.refunds.map((x, i) => /* @__PURE__ */ jsxs("p", { children: [
            money(x.amount),
            " on ",
            fmtDateTime(x.processed_at),
            ": ",
            x.reason
          ] }, i))
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-8 text-center text-xs text-navy-400", children: "This is a computer-generated receipt. Thank you for your payment." })
      ] })
    ] })
  ] });
}
const __vite_glob_0_41 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Receipt
}, Symbol.toStringTag, { value: "Module" }));
const tabs = [["pending", "Waiting"], ["approved", "Approved"], ["rejected", "Rejected"], ["all", "All"]];
function Index$2({ enrollments, filters, feeRequired }) {
  const [f, setF] = useFilters("/portal/registrations", filters);
  const [rejecting, setRejecting] = useState(null);
  const reject = useForm({ remarks: "" });
  const approve = (e, force = false) => router.post(`/portal/registrations/${e.id}/approve`, { force }, { preserveScroll: true });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Registrations" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Registrations", subtitle: feeRequired ? "The registration fee must be paid before approval. You can approve anyway for a cleared student." : "Approve or reject new registrations." }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "flex gap-1 rounded-lg bg-navy-50 p-1", role: "tablist", children: tabs.map(([v, t]) => /* @__PURE__ */ jsx("button", { type: "button", role: "tab", "aria-selected": f.status === v, onClick: () => setF({ status: v }, true), className: cx("rounded-md px-3 py-1.5 text-sm font-medium", f.status === v ? "bg-white text-navy shadow-sm" : "text-navy-500 hover:text-navy"), children: t }, v)) }),
      /* @__PURE__ */ jsx(SearchBox, { className: "w-full sm:w-72", value: f.search, onChange: (v) => setF({ search: v }), placeholder: "Search by name or student ID" })
    ] }),
    enrollments.data.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No registrations here" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Course and batch" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Applied" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Registration fee" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Outstanding" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: enrollments.data.map((e) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-navy-50/50", children: [
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          /* @__PURE__ */ jsx(Link$1, { className: "font-semibold text-brand hover:underline", href: `/portal/students/${e.student_id}`, children: e.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-navy-400", children: [
            e.student_no,
            ", ",
            e.phone
          ] })
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          e.course,
          /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: e.batch })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDateTime(e.created_at) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: e.registration_invoice ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Status, { value: e.registration_invoice.status }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: money(e.registration_invoice.total) })
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-navy-400", children: "No fee" }) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: money(e.outstanding) }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          /* @__PURE__ */ jsx(Status, { value: e.status }),
          e.remarks && /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-48 text-xs text-navy-400", children: e.remarks })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td whitespace-nowrap text-right", children: e.status === "pending" && /* @__PURE__ */ jsxs(Fragment, { children: [
          !feeRequired || !e.registration_invoice || e.registration_invoice.status === "paid" ? /* @__PURE__ */ jsx(Button, { size: "sm", variant: "gold", onClick: () => approve(e), children: "Approve" }) : /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => window.confirm("The registration fee is unpaid. Approve anyway?") && approve(e, true), children: "Approve anyway" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "dangerOutline", className: "ml-1", onClick: () => {
            reject.reset();
            setRejecting(e);
          }, children: "Reject" })
        ] }) })
      ] }, e.id)) })
    ] }),
    /* @__PURE__ */ jsx(Pagination, { paginator: enrollments }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        open: !!rejecting,
        onClose: () => setRejecting(null),
        title: `Reject ${(rejecting == null ? void 0 : rejecting.name) ?? ""}`,
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setRejecting(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "danger", disabled: reject.processing, onClick: () => reject.post(`/portal/registrations/${rejecting.id}/reject`, { preserveScroll: true, onSuccess: () => setRejecting(null) }), children: "Reject registration" })
        ] }),
        children: [
          /* @__PURE__ */ jsx(Alert, { tone: "amber", className: "mb-3", children: "Unpaid invoices for this registration are cancelled. The student is told the reason." }),
          /* @__PURE__ */ jsx(Field, { label: "Reason (shown to the student)", error: reject.errors.remarks, children: /* @__PURE__ */ jsx(TextArea, { value: reject.data.remarks, onChange: (e) => reject.setData("remarks", e.target.value) }) })
        ]
      }
    )
  ] });
}
const __vite_glob_0_42 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$2
}, Symbol.toStringTag, { value: "Module" }));
function Settings({ settings, gateway, whatsappDriver }) {
  const form = useForm({ ...settings });
  const flag = (k) => form.data[k] === "1" || form.data[k] === 1 || form.data[k] === true;
  const setFlag = (k) => (v) => form.setData(k, v ? "1" : "0");
  const text2 = (k) => ({ value: form.data[k] ?? "", onChange: (e) => form.setData(k, e.target.value) });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Settings" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Settings", subtitle: "Institute details and the rules the system follows." }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsx(Alert, { tone: gateway === "sandbox" ? "amber" : "green", title: `Payment gateway: ${gateway}`, children: gateway === "sandbox" ? "Test mode. No real money moves. Set PAYMENT_GATEWAY=payhere in the .env file to accept real payments." : "Real payments are switched on." }),
      /* @__PURE__ */ jsx(Alert, { tone: whatsappDriver === "log" ? "amber" : "green", title: `WhatsApp driver: ${whatsappDriver}`, children: whatsappDriver === "log" ? "Receipts are recorded, not sent. Set WHATSAPP_DRIVER=cloud or twilio in the .env file." : "Receipts are sent automatically after every payment." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      form.put("/portal/settings", { preserveScroll: true });
    }, className: "space-y-6", children: [
      /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
      /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Institute" }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Name", error: form.errors.institute_name, children: /* @__PURE__ */ jsx(TextInput, { ...text2("institute_name") }) }),
          /* @__PURE__ */ jsx(Field, { label: "Email", error: form.errors.institute_email, children: /* @__PURE__ */ jsx(TextInput, { type: "email", ...text2("institute_email") }) }),
          /* @__PURE__ */ jsx(Field, { label: "Phone", error: form.errors.institute_phone, children: /* @__PURE__ */ jsx(TextInput, { ...text2("institute_phone") }) }),
          /* @__PURE__ */ jsx(Field, { label: "Address", error: form.errors.institute_address, children: /* @__PURE__ */ jsx(TextInput, { ...text2("institute_address") }) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: "These appear on receipts." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Payments and learning access" }),
        /* @__PURE__ */ jsx(Check2, { label: "Registration fee must be paid before a registration can be approved", checked: flag("registration_fee_mandatory"), onChange: setFlag("registration_fee_mandatory"), help: "An admin can still approve anyway for a cleared student." }),
        /* @__PURE__ */ jsx(Field, { label: "Grace days after the due date", error: form.errors.payment_grace_days, help: "Students lose access to the LMS this many days after an invoice is overdue. 0 = the day after the due date.", children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "0", max: "60", className: "max-w-32", ...text2("payment_grace_days") }) }),
        /* @__PURE__ */ jsx(Check2, { label: "Send payment receipts on WhatsApp", checked: flag("whatsapp_receipts_enabled"), onChange: setFlag("whatsapp_receipts_enabled") })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Certificates" }),
        /* @__PURE__ */ jsx(Field, { label: "Minimum attendance (%)", error: form.errors.min_attendance_percent, children: /* @__PURE__ */ jsx(TextInput, { type: "number", min: "0", max: "100", className: "max-w-32", ...text2("min_attendance_percent") }) }),
        /* @__PURE__ */ jsx(Check2, { label: "No certificate while fees are outstanding", checked: flag("certificate_requires_clearance"), onChange: setFlag("certificate_requires_clearance") })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", variant: "gold", disabled: form.processing, children: form.processing ? "Saving..." : "Save settings" })
    ] })
  ] });
}
const __vite_glob_0_43 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Settings
}, Symbol.toStringTag, { value: "Module" }));
function Blocked({ access }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Learning access paused" }),
    /* @__PURE__ */ jsxs(Card, { className: "mx-auto max-w-lg p-8 text-center", children: [
      /* @__PURE__ */ jsx("span", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600", children: /* @__PURE__ */ jsx(Lock, { size: 26 }) }),
      access.reason === "payment_delay" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h1", { className: "mt-4 text-xl font-bold text-navy", children: "Your payment is delayed" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-navy-600", children: "Learning material, assignments and quizzes are paused until the overdue amount is paid." }),
        /* @__PURE__ */ jsx("ul", { className: "mx-auto mt-4 max-w-xs space-y-1 text-left text-sm", children: access.overdue.map((i) => /* @__PURE__ */ jsxs("li", { className: "flex justify-between border-b border-navy-100 py-1", children: [
          /* @__PURE__ */ jsx("span", { children: i.description }),
          /* @__PURE__ */ jsx("b", { children: money(i.balance) })
        ] }, i.id)) }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-navy-500", children: [
          "Total overdue: ",
          /* @__PURE__ */ jsx("b", { children: money(access.overdue_total) })
        ] }),
        /* @__PURE__ */ jsx(Button, { href: "/portal/finance", variant: "gold", size: "lg", className: "mt-6", children: "Pay now" })
      ] }) : access.reason === "pending_approval" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h1", { className: "mt-4 text-xl font-bold text-navy", children: "Waiting for approval" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-navy-600", children: "The office is reviewing your registration. Learning content opens as soon as it is approved." }),
        /* @__PURE__ */ jsx(Button, { href: "/portal/finance", variant: "outline", size: "lg", className: "mt-6", children: "Check my fees" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h1", { className: "mt-4 text-xl font-bold text-navy", children: "Not registered on a course" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-navy-600", children: "You do not have an approved registration yet. Please contact the IMDR office." }),
        /* @__PURE__ */ jsx(Button, { href: "/apply", variant: "gold", size: "lg", className: "mt-6", children: "Register for a course" })
      ] })
    ] })
  ] });
}
const __vite_glob_0_44 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Blocked
}, Symbol.toStringTag, { value: "Module" }));
function Certificates({ certificates }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "My certificates" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "My certificates" }),
    certificates.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No certificates yet", children: "These appear once you complete a course and its requirements are met." }) : /* @__PURE__ */ jsx("ul", { className: "grid gap-4 sm:grid-cols-2", children: certificates.map((c) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between rounded-xl border border-navy-100 bg-white p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-11 w-11 items-center justify-center rounded-full bg-gold-50 text-gold-600", children: /* @__PURE__ */ jsx(Award, { size: 22 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-bold text-navy", children: c.course }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-navy-400", children: [
            c.certificate_no,
            ", issued ",
            fmtDate(c.issued_at)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx(Status, { value: c.status }),
        /* @__PURE__ */ jsx(Button, { href: `/portal/certificates/${c.id}`, variant: "subtle", size: "sm", className: "mt-2", children: "View" })
      ] })
    ] }, c.id)) })
  ] });
}
const __vite_glob_0_45 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Certificates
}, Symbol.toStringTag, { value: "Module" }));
function Courses({ enrollments, documents }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "My courses" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "My courses" }),
    enrollments.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "Not registered on a course yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: enrollments.map((e) => /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-navy", children: e.course }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-navy-500", children: [
            e.batch,
            e.duration ? `, ${e.duration}` : "",
            e.schedule ? `, ${e.schedule}` : "",
            e.starts ? `, starts ${fmtDate(e.starts)}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsx(Status, { value: e.status })
      ] }),
      e.remarks && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-navy-500", children: e.remarks }),
      e.subjects.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: e.subjects.map((s) => /* @__PURE__ */ jsx("span", { className: "rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600", children: s.name }, s.code)) })
    ] }, e.id)) }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-8 text-lg font-bold text-navy", children: "My documents" }),
    documents.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "The office has not uploaded any documents for you yet." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white", children: documents.map((d) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between px-4 py-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-navy", children: d.title || d.type_label }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-navy-400", children: [
          d.type_label,
          ", added ",
          fmtDate(d.created_at)
        ] })
      ] }),
      /* @__PURE__ */ jsx("a", { href: `/portal/documents/${d.id}/download`, className: "text-sm font-semibold text-brand hover:underline", children: "Open" })
    ] }, d.id)) })
  ] });
}
const __vite_glob_0_46 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Courses
}, Symbol.toStringTag, { value: "Module" }));
function Finance({ summary, invoices, payments, waiting }) {
  const [payingId, setPayingId] = useState(null);
  useForm({ amount: "" });
  const start = (invoice) => {
    setPayingId(invoice.id);
    router.post(`/portal/finance/invoices/${invoice.id}/pay`, {}, { onFinish: () => setPayingId(null) });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Fees and payments" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Fees and payments" }),
    waiting > 0 && /* @__PURE__ */ jsx(Alert, { tone: "amber", className: "mb-4", children: "A payment is being confirmed by the bank. It can take a moment to update below." }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Total fees", value: money(summary.total), accent: "navy" }),
      /* @__PURE__ */ jsx(Stat, { label: "Paid", value: money(summary.paid), accent: "green" }),
      /* @__PURE__ */ jsx(Stat, { label: "Outstanding", value: money(summary.outstanding), accent: summary.outstanding ? "gold" : "green", hint: summary.next_due ? `Next due ${fmtDate(summary.next_due.due_date)}` : "Nothing due" })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 text-lg font-bold text-navy", children: "My invoices" }),
    invoices.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No invoices yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Invoice" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "For" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Due" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Total" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Balance" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: invoices.map((i) => /* @__PURE__ */ jsxs("tr", { className: i.overdue ? "bg-red-50/50" : void 0, children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: i.invoice_no }),
        /* @__PURE__ */ jsx("td", { className: "td", children: i.description }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          fmtDate(i.due_date),
          i.overdue && /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs font-semibold text-red-600", children: "Overdue" })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: money(i.total) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(i.balance) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: i.status }) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: i.status !== "paid" && /* @__PURE__ */ jsx(Button, { variant: "gold", size: "sm", disabled: payingId === i.id, onClick: () => start(i), children: payingId === i.id ? /* @__PURE__ */ jsx(Loader2, { size: 14, className: "animate-spin" }) : "Pay now" }) })
      ] }, i.id)) })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-8 text-lg font-bold text-navy", children: "Payment history" }),
    payments.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No payments yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "For" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Method" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: payments.map((p) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: fmtDateTime(p.paid_at) }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          p.description,
          /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: p.invoice })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: p.method }) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(p.amount) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: p.status }) }),
        /* @__PURE__ */ jsx("td", { className: "td text-right", children: /* @__PURE__ */ jsx(Button, { href: `/portal/receipts/${p.id}`, variant: "subtle", size: "sm", children: "Receipt" }) })
      ] }, p.id)) })
    ] })
  ] });
}
const __vite_glob_0_47 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Finance
}, Symbol.toStringTag, { value: "Module" }));
function Records({ attendance, results }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Attendance and results" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Attendance and results" }),
    /* @__PURE__ */ jsx("div", { className: "mb-6 grid gap-3 sm:grid-cols-3", children: /* @__PURE__ */ jsx(Stat, { label: "Overall attendance", value: attendance.overall == null ? "No classes yet" : `${attendance.overall}%`, accent: attendance.overall != null && attendance.overall < 75 ? "red" : "green" }) }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 text-lg font-bold text-navy", children: "By subject" }),
    attendance.subjects.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No attendance recorded yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Subject" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Attended" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Percentage" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: attendance.subjects.map((a) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: a.subject }),
        /* @__PURE__ */ jsxs("td", { className: "td text-right", children: [
          a.attended,
          " of ",
          a.total
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "td text-right font-semibold", children: [
          a.percent,
          "%"
        ] })
      ] }, a.subject)) })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-8 text-lg font-bold text-navy", children: "Results" }),
    results.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No published results yet" }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Subject" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Batch" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Assessment" }),
        /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Marks" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Grade" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: results.map((r) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "td", children: r.subject }),
        /* @__PURE__ */ jsx("td", { className: "td", children: r.batch }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          r.assessment,
          r.remarks && /* @__PURE__ */ jsx("p", { className: "text-xs text-navy-400", children: r.remarks })
        ] }),
        /* @__PURE__ */ jsxs("td", { className: "td text-right", children: [
          r.marks,
          "/",
          r.max_marks
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td font-bold", children: r.grade })
      ] }, r.id)) })
    ] })
  ] });
}
const __vite_glob_0_48 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Records
}, Symbol.toStringTag, { value: "Module" }));
const makePassword = () => {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint32Array(8)), (n) => chars[n % chars.length]).join("");
};
function Create({ batches }) {
  const form = useForm({
    name: "",
    username: "",
    password: "",
    phone: "",
    whatsapp_number: "",
    email: "",
    nic: "",
    date_of_birth: "",
    gender: "",
    school: "",
    address: "",
    guardian_name: "",
    guardian_phone: "",
    notes: "",
    batch_id: "",
    approve_now: true,
    birth_certificate: null,
    result_sheet: null,
    nic_copy: null,
    other_document: null,
    other_title: ""
  });
  const e = form.errors;
  const set = (k) => (ev) => form.setData(k, ev.target.value);
  const file = (k) => (ev) => form.setData(k, ev.target.files[0] || null);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Register a student" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Register a student", subtitle: "The student ID is created automatically. You choose the login (or leave it blank and the system creates one)." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: (ev) => {
      ev.preventDefault();
      form.post("/portal/students", { forceFormData: true });
    }, className: "space-y-6", children: [
      /* @__PURE__ */ jsx(FormError, { errors: e }),
      /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Login details" }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Username", error: e.username, help: "Leave empty to use the student ID (for example imdr20260001).", children: /* @__PURE__ */ jsx(TextInput, { value: form.data.username, onChange: set("username"), autoComplete: "off" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Password", error: e.password, help: "At least 8 characters. Leave empty and one will be created for you.", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(TextInput, { value: form.data.password, onChange: set("password"), autoComplete: "off" }),
            /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => form.setData("password", makePassword()), children: [
              /* @__PURE__ */ jsx(KeyRound, { size: 14 }),
              " Generate"
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(Alert, { tone: "blue", children: "After you save, the login details are shown once so you can hand them to the student." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Student details" }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Full name", error: e.name, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.name, onChange: set("name"), required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "Phone", error: e.phone, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.phone, onChange: set("phone"), required: true }) }),
          /* @__PURE__ */ jsx(Field, { label: "WhatsApp number", error: e.whatsapp_number, help: "Payment receipts are sent here. Empty = phone number.", children: /* @__PURE__ */ jsx(TextInput, { value: form.data.whatsapp_number, onChange: set("whatsapp_number") }) }),
          /* @__PURE__ */ jsx(Field, { label: "Email (optional)", error: e.email, children: /* @__PURE__ */ jsx(TextInput, { type: "email", value: form.data.email, onChange: set("email") }) }),
          /* @__PURE__ */ jsx(Field, { label: "NIC number", error: e.nic, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.nic, onChange: set("nic") }) }),
          /* @__PURE__ */ jsx(Field, { label: "Date of birth", error: e.date_of_birth, children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: form.data.date_of_birth, onChange: set("date_of_birth") }) }),
          /* @__PURE__ */ jsx(Field, { label: "Gender", error: e.gender, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.gender, onChange: set("gender"), options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }] }) }),
          /* @__PURE__ */ jsx(Field, { label: "School", error: e.school, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.school, onChange: set("school") }) }),
          /* @__PURE__ */ jsx(Field, { label: "Parent or guardian name", error: e.guardian_name, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.guardian_name, onChange: set("guardian_name") }) }),
          /* @__PURE__ */ jsx(Field, { label: "Parent or guardian phone", error: e.guardian_phone, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.guardian_phone, onChange: set("guardian_phone") }) })
        ] }),
        /* @__PURE__ */ jsx(Field, { label: "Address", error: e.address, children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: form.data.address, onChange: set("address") }) }),
        /* @__PURE__ */ jsx(Field, { label: "Office notes", error: e.notes, children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: form.data.notes, onChange: set("notes") }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Course" }),
        /* @__PURE__ */ jsx(Field, { label: "Batch", error: e.batch_id, help: "Creates the registration fee and installment invoices automatically.", children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.batch_id, onChange: set("batch_id"), options: batches.map((b) => ({ value: b.value, label: `${b.label} (${b.seats_left} seats left)` })), placeholder: "Do not register on a batch yet" }) }),
        form.data.batch_id && /* @__PURE__ */ jsx(Check2, { label: "Approve the registration now", checked: form.data.approve_now, onChange: (v) => form.setData("approve_now", v), help: "Use this when the student has paid at the office or has already been cleared. Learning access still stops if a later payment is delayed." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "space-y-4 p-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Documents" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "PDF or photo, up to 10 MB each. You can add more later on the student's page. Documents are private: only admins and the student can open them." }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Field, { label: "Birth certificate", error: e.birth_certificate, children: /* @__PURE__ */ jsx("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png,.webp", onChange: file("birth_certificate"), className: "input" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Result sheet", error: e.result_sheet, children: /* @__PURE__ */ jsx("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png,.webp", onChange: file("result_sheet"), className: "input" }) }),
          /* @__PURE__ */ jsx(Field, { label: "NIC copy", error: e.nic_copy, children: /* @__PURE__ */ jsx("input", { type: "file", accept: ".pdf,.jpg,.jpeg,.png,.webp", onChange: file("nic_copy"), className: "input" }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Other document", error: e.other_document, children: /* @__PURE__ */ jsx("input", { type: "file", onChange: file("other_document"), className: "input" }) }),
            /* @__PURE__ */ jsx(TextInput, { placeholder: "What is it? (for example O/L certificate)", value: form.data.other_title, onChange: set("other_title") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", variant: "gold", size: "lg", disabled: form.processing, children: form.processing ? "Saving..." : "Register student" }),
        /* @__PURE__ */ jsx(Button, { href: "/portal/students", variant: "outline", size: "lg", children: "Cancel" })
      ] })
    ] })
  ] });
}
const __vite_glob_0_49 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Create
}, Symbol.toStringTag, { value: "Module" }));
const lmsBadge = (s) => {
  if (s.lms_reason === "payment_delay") return s.lms_allowed ? /* @__PURE__ */ jsx(Badge, { tone: "amber", children: "Payment delayed (override)" }) : /* @__PURE__ */ jsx(Badge, { tone: "red", children: "Payment delayed" });
  if (s.lms_reason === "pending_approval") return /* @__PURE__ */ jsx(Badge, { tone: "amber", children: "Awaiting approval" });
  if (s.lms_reason === "no_enrollment") return /* @__PURE__ */ jsx(Badge, { tone: "gray", children: "Not registered" });
  return /* @__PURE__ */ jsx(Badge, { tone: "green", children: "LMS open" });
};
function Index$1({ students, filters, batches }) {
  const [f, setF] = useFilters("/portal/students", filters);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Students" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Students", subtitle: "Search by name, student ID, username, NIC, phone or email.", actions: /* @__PURE__ */ jsxs(Button, { href: "/portal/students/create", variant: "gold", children: [
      /* @__PURE__ */ jsx(UserPlus, { size: 16 }),
      " Register a student"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 grid gap-3 md:grid-cols-4", children: [
      /* @__PURE__ */ jsx(SearchBox, { className: "md:col-span-2", value: f.search, onChange: (v) => setF({ search: v }), placeholder: "Search students" }),
      /* @__PURE__ */ jsx(SelectInput, { value: f.batch_id, onChange: (e) => setF({ batch_id: e.target.value }, true), options: batches, placeholder: "All batches" }),
      /* @__PURE__ */ jsx(SelectInput, { value: f.payment, onChange: (e) => setF({ payment: e.target.value }, true), options: [{ value: "delayed", label: "Payment delayed" }], placeholder: "Any payment status" })
    ] }),
    students.data.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No students found", children: 'Try a different word, or clear the filters. Use "Register a student" to add a new one.' }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
      /* @__PURE__ */ jsxs(Thead, { children: [
        /* @__PURE__ */ jsx("th", { className: "th", children: "Student ID" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Name" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Username" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Phone" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Course and batch" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Account" }),
        /* @__PURE__ */ jsx("th", { className: "th", children: "Learning access" }),
        /* @__PURE__ */ jsx("th", { className: "th" })
      ] }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: students.data.map((s) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-navy-50/50", children: [
        /* @__PURE__ */ jsx("td", { className: "td font-mono text-xs", children: s.student_no }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          /* @__PURE__ */ jsx(Link$1, { href: `/portal/students/${s.id}`, className: "font-semibold text-brand hover:underline", children: s.name }),
          s.nic && /* @__PURE__ */ jsxs("p", { className: "text-xs text-navy-400", children: [
            "NIC ",
            s.nic
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: s.username }),
        /* @__PURE__ */ jsx("td", { className: "td", children: s.phone }),
        /* @__PURE__ */ jsx("td", { className: "td", children: s.enrollments.length ? s.enrollments.map((e, i) => /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
          e.course,
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-navy-400", children: [
            " (",
            e.batch,
            ", ",
            e.status,
            ")"
          ] })
        ] }, i)) : /* @__PURE__ */ jsx("span", { className: "text-navy-400", children: "None" }) }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: s.user_status }) }),
        /* @__PURE__ */ jsxs("td", { className: "td", children: [
          lmsBadge(s),
          s.overdue_total > 0 && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-red-700", children: [
            money(s.overdue_total),
            " overdue"
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { href: `/portal/messages?student=${s.id}`, variant: "outline", size: "sm", title: `Send a message to ${s.name}`, children: [
            /* @__PURE__ */ jsx(Send, { size: 13 }),
            " Message"
          ] }),
          /* @__PURE__ */ jsx(Button, { href: `/portal/students/${s.id}`, variant: "subtle", size: "sm", children: "Open" })
        ] }) })
      ] }, s.id)) })
    ] }),
    /* @__PURE__ */ jsx(Pagination, { paginator: students })
  ] });
}
const __vite_glob_0_50 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$1
}, Symbol.toStringTag, { value: "Module" }));
const Row = ({ k, v }) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[130px_1fr] gap-2 py-1.5 text-sm", children: [
  /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: k }),
  /* @__PURE__ */ jsx("dd", { className: "font-medium text-navy", children: v || "-" })
] });
function Show({ student: s, documents, docTypes, enrollments, invoices, money: m, payments, attendance, results, access, whatsapp, batches }) {
  const [editing, setEditing] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const edit = useForm({
    name: s.name,
    username: s.username,
    email: s.email || "",
    phone: s.phone || "",
    user_status: s.user_status,
    whatsapp_number: s.whatsapp_number || "",
    nic: s.nic || "",
    date_of_birth: s.date_of_birth || "",
    gender: s.gender || "",
    address: s.address || "",
    school: s.school || "",
    guardian_name: s.guardian_name || "",
    guardian_phone: s.guardian_phone || "",
    notes: s.notes || ""
  });
  const upload = useForm({ type: "birth_certificate", title: "", file: null });
  const override = useForm({ until: s.lms_access_override_until || "" });
  const enroll = useForm({ batch_id: "", approve_now: false });
  const set = (k) => (e) => edit.setData(k, e.target.value);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: s.name }),
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: s.name,
        subtitle: `Student ID ${s.student_no}. Registered ${fmtDate(s.registered_at)}.`,
        actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => setEditing(true), children: [
            /* @__PURE__ */ jsx(Pencil, { size: 14 }),
            " Edit details"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => confirmThen("Create a new password for this student? The old one stops working.", () => router.post(`/portal/students/${s.id}/reset-password`, {}, { preserveScroll: true })), children: [
            /* @__PURE__ */ jsx(KeyRound, { size: 14 }),
            " New password"
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6 lg:col-span-2", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Details" }),
            /* @__PURE__ */ jsx(Status, { value: s.user_status })
          ] }),
          /* @__PURE__ */ jsxs("dl", { className: "grid gap-x-8 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Row, { k: "Username", v: s.username }),
              /* @__PURE__ */ jsx(Row, { k: "Phone", v: s.phone }),
              /* @__PURE__ */ jsx(Row, { k: "WhatsApp", v: s.whatsapp_number || `${s.phone || ""} (phone)` }),
              /* @__PURE__ */ jsx(Row, { k: "Email", v: s.email }),
              /* @__PURE__ */ jsx(Row, { k: "NIC", v: s.nic }),
              /* @__PURE__ */ jsx(Row, { k: "Date of birth", v: s.date_of_birth && fmtDate(s.date_of_birth) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Row, { k: "Gender", v: s.gender }),
              /* @__PURE__ */ jsx(Row, { k: "School", v: s.school }),
              /* @__PURE__ */ jsx(Row, { k: "Address", v: s.address }),
              /* @__PURE__ */ jsx(Row, { k: "Guardian", v: s.guardian_name }),
              /* @__PURE__ */ jsx(Row, { k: "Guardian phone", v: s.guardian_phone })
            ] })
          ] }),
          s.notes && /* @__PURE__ */ jsxs("p", { className: "mt-3 rounded-lg bg-navy-50 p-3 text-sm text-navy-600", children: [
            /* @__PURE__ */ jsx("b", { children: "Office notes:" }),
            " ",
            s.notes
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-3 font-bold", children: "Documents" }),
          documents.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm text-navy-500", children: "No documents uploaded yet." }) : /* @__PURE__ */ jsx("ul", { className: "mb-4 divide-y divide-navy-50", children: documents.map((d) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-3 py-2.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(FileText, { size: 18, className: "text-brand" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-navy", children: d.title || d.type_label }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-navy-400", children: [
                  d.type_label,
                  ", ",
                  d.file_name,
                  " ",
                  fmtSize(d.size) && `(${fmtSize(d.size)})`,
                  ", uploaded ",
                  fmtDate(d.created_at)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxs(Button, { href: `/portal/documents/${d.id}/download`, native: true, variant: "subtle", size: "sm", children: [
                /* @__PURE__ */ jsx(Download, { size: 14 }),
                " Open"
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", "aria-label": "Delete document", onClick: () => confirmThen("Delete this document?", () => router.delete(`/portal/documents/${d.id}`, { preserveScroll: true })), children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
            ] })
          ] }, d.id)) }),
          /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            upload.post(`/portal/students/${s.id}/documents`, { forceFormData: true, preserveScroll: true, onSuccess: () => upload.reset("file", "title") });
          }, className: "grid gap-3 rounded-lg bg-navy-50 p-4 sm:grid-cols-[180px_1fr_1fr_auto] sm:items-end", children: [
            /* @__PURE__ */ jsx(Field, { label: "Type", error: upload.errors.type, children: /* @__PURE__ */ jsx(SelectInput, { value: upload.data.type, onChange: (e) => upload.setData("type", e.target.value), options: docTypes, placeholder: null }) }),
            /* @__PURE__ */ jsx(Field, { label: "Title (optional)", error: upload.errors.title, children: /* @__PURE__ */ jsx(TextInput, { value: upload.data.title, onChange: (e) => upload.setData("title", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "File", error: upload.errors.file, children: /* @__PURE__ */ jsx("input", { type: "file", required: true, onChange: (e) => upload.setData("file", e.target.files[0] || null), className: "input bg-white" }, upload.data.file ? "f" : "n") }),
            /* @__PURE__ */ jsxs(Button, { type: "submit", variant: "primary", disabled: upload.processing, children: [
              /* @__PURE__ */ jsx(Upload, { size: 14 }),
              " Upload"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("h2", { className: "font-bold", children: "Courses" }),
            /* @__PURE__ */ jsx(Button, { variant: "subtle", size: "sm", onClick: () => setEnrolling(true), children: "Register on a batch" })
          ] }),
          enrollments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "Not registered on any batch." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-navy-50", children: enrollments.map((e) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between py-2.5", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-navy", children: e.course }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-navy-500", children: [
                e.batch,
                e.remarks ? `, ${e.remarks}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Status, { value: e.status }),
              e.status === "pending" && /* @__PURE__ */ jsx(Button, { href: "/portal/registrations", size: "sm", variant: "subtle", children: "Review" })
            ] })
          ] }, e.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-2 font-bold text-navy", children: "Invoices" }),
          invoices.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "No invoices." }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
            /* @__PURE__ */ jsxs(Thead, { children: [
              /* @__PURE__ */ jsx("th", { className: "th", children: "Invoice" }),
              /* @__PURE__ */ jsx("th", { className: "th", children: "For" }),
              /* @__PURE__ */ jsx("th", { className: "th", children: "Due" }),
              /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Total" }),
              /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Balance" }),
              /* @__PURE__ */ jsx("th", { className: "th", children: "Status" })
            ] }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: invoices.map((i) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "td", children: i.invoice_no }),
              /* @__PURE__ */ jsx("td", { className: "td", children: i.description }),
              /* @__PURE__ */ jsx("td", { className: "td", children: fmtDate(i.due_date) }),
              /* @__PURE__ */ jsx("td", { className: "td text-right", children: money(i.total) }),
              /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(i.balance) }),
              /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: i.status }) })
            ] }, i.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-2 font-bold text-navy", children: "Recent payments" }),
          payments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "No payments yet." }) : /* @__PURE__ */ jsxs(TableWrap, { children: [
            /* @__PURE__ */ jsxs(Thead, { children: [
              /* @__PURE__ */ jsx("th", { className: "th", children: "Receipt" }),
              /* @__PURE__ */ jsx("th", { className: "th", children: "Date" }),
              /* @__PURE__ */ jsx("th", { className: "th", children: "Method" }),
              /* @__PURE__ */ jsx("th", { className: "th text-right", children: "Amount" })
            ] }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-navy-50", children: payments.map((p) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Link$1, { className: "text-brand hover:underline", href: `/portal/receipts/${p.id}`, children: p.receipt_no }) }),
              /* @__PURE__ */ jsx("td", { className: "td", children: fmtDateTime(p.paid_at) }),
              /* @__PURE__ */ jsx("td", { className: "td", children: /* @__PURE__ */ jsx(Status, { value: p.method }) }),
              /* @__PURE__ */ jsx("td", { className: "td text-right font-semibold", children: money(p.amount) })
            ] }, p.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "mb-2 font-bold text-navy", children: [
              "Attendance ",
              attendance.overall != null && `(${attendance.overall}%)`
            ] }),
            attendance.subjects.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "No attendance marked yet." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-navy-50 rounded-xl border border-navy-100 bg-white", children: attendance.subjects.map((a) => /* @__PURE__ */ jsxs("li", { className: "flex justify-between px-4 py-2.5 text-sm", children: [
              /* @__PURE__ */ jsx("span", { children: a.subject }),
              /* @__PURE__ */ jsxs("b", { children: [
                a.percent,
                "% ",
                /* @__PURE__ */ jsxs("span", { className: "font-normal text-navy-400", children: [
                  "(",
                  a.attended,
                  "/",
                  a.total,
                  ")"
                ] })
              ] })
            ] }, a.subject)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "mb-2 font-bold text-navy", children: "Results" }),
            results.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "No results yet." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-navy-50 rounded-xl border border-navy-100 bg-white", children: results.map((r) => /* @__PURE__ */ jsxs("li", { className: "flex justify-between px-4 py-2.5 text-sm", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                r.subject,
                ": ",
                r.assessment,
                " ",
                !r.published && /* @__PURE__ */ jsx(Badge, { tone: "amber", children: "Hidden" })
              ] }),
              /* @__PURE__ */ jsxs("b", { children: [
                r.marks,
                "/",
                r.max_marks,
                " (",
                r.grade,
                ")"
              ] })
            ] }, r.id)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-2 font-bold", children: "Learning access" }),
          access.allowed && !access.reason && /* @__PURE__ */ jsx(Alert, { tone: "green", children: "LMS is open." }),
          access.reason === "payment_delay" && /* @__PURE__ */ jsxs(Alert, { tone: access.allowed ? "amber" : "red", title: access.allowed ? "Payment delayed, kept open by override" : "Payment delayed, LMS paused", children: [
            money(access.overdue_total),
            " overdue.",
            access.override_until && ` Open until ${fmtDate(access.override_until)}.`
          ] }),
          access.reason === "pending_approval" && /* @__PURE__ */ jsx(Alert, { tone: "amber", children: "Waiting for registration approval." }),
          access.reason === "no_enrollment" && /* @__PURE__ */ jsx(Alert, { tone: "amber", children: "Not registered on a batch." }),
          access.overdue.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-1 text-sm", children: access.overdue.map((i) => /* @__PURE__ */ jsxs("li", { children: [
            i.description,
            ": ",
            /* @__PURE__ */ jsx("b", { children: money(i.balance) }),
            ", ",
            i.days_late,
            " days late"
          ] }, i.id)) }),
          /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            override.post(`/portal/students/${s.id}/lms-override`, { preserveScroll: true });
          }, className: "mt-4 space-y-2 border-t border-navy-100 pt-4", children: [
            /* @__PURE__ */ jsx(Field, { label: "Keep the LMS open until", error: override.errors.until, help: "For a student who promised to pay. Leave empty and save to remove the override.", children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: override.data.until, onChange: (e) => override.setData("until", e.target.value) }) }),
            /* @__PURE__ */ jsx(Button, { type: "submit", variant: "outline", size: "sm", disabled: override.processing, children: "Save" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3", children: [
          /* @__PURE__ */ jsx(Stat, { label: "Total fees", value: money(m.total), accent: "navy" }),
          /* @__PURE__ */ jsx(Stat, { label: "Paid", value: money(m.paid), accent: "green" }),
          /* @__PURE__ */ jsx(Stat, { label: "Still to pay", value: money(m.outstanding), accent: m.outstanding ? "gold" : "green" })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-2 font-bold", children: "WhatsApp receipts" }),
          whatsapp.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-navy-500", children: "No receipts sent yet." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-1 text-sm", children: whatsapp.map((w) => /* @__PURE__ */ jsxs("li", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: fmtDateTime(w.created_at) }),
            /* @__PURE__ */ jsx(Status, { value: w.status })
          ] }, w.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        open: editing,
        onClose: () => setEditing(false),
        title: "Edit student details",
        wide: true,
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setEditing(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: edit.processing, onClick: () => edit.put(`/portal/students/${s.id}`, { preserveScroll: true, onSuccess: () => setEditing(false) }), children: "Save" })
        ] }),
        children: [
          /* @__PURE__ */ jsx(FormError, { errors: edit.errors }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Full name", error: edit.errors.name, children: /* @__PURE__ */ jsx(TextInput, { value: edit.data.name, onChange: set("name") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Username", error: edit.errors.username, children: /* @__PURE__ */ jsx(TextInput, { value: edit.data.username, onChange: set("username") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Phone", error: edit.errors.phone, children: /* @__PURE__ */ jsx(TextInput, { value: edit.data.phone, onChange: set("phone") }) }),
            /* @__PURE__ */ jsx(Field, { label: "WhatsApp number", error: edit.errors.whatsapp_number, children: /* @__PURE__ */ jsx(TextInput, { value: edit.data.whatsapp_number, onChange: set("whatsapp_number") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Email", error: edit.errors.email, children: /* @__PURE__ */ jsx(TextInput, { type: "email", value: edit.data.email, onChange: set("email") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Account status", error: edit.errors.user_status, children: /* @__PURE__ */ jsx(SelectInput, { value: edit.data.user_status, onChange: set("user_status"), placeholder: null, options: [{ value: "active", label: "Active" }, { value: "pending", label: "Pending" }, { value: "suspended", label: "Suspended (cannot log in)" }] }) }),
            /* @__PURE__ */ jsx(Field, { label: "NIC", error: edit.errors.nic, children: /* @__PURE__ */ jsx(TextInput, { value: edit.data.nic, onChange: set("nic") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Date of birth", error: edit.errors.date_of_birth, children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: edit.data.date_of_birth, onChange: set("date_of_birth") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Gender", error: edit.errors.gender, children: /* @__PURE__ */ jsx(SelectInput, { value: edit.data.gender, onChange: set("gender"), options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }] }) }),
            /* @__PURE__ */ jsx(Field, { label: "School", error: edit.errors.school, children: /* @__PURE__ */ jsx(TextInput, { value: edit.data.school, onChange: set("school") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Guardian", error: edit.errors.guardian_name, children: /* @__PURE__ */ jsx(TextInput, { value: edit.data.guardian_name, onChange: set("guardian_name") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Guardian phone", error: edit.errors.guardian_phone, children: /* @__PURE__ */ jsx(TextInput, { value: edit.data.guardian_phone, onChange: set("guardian_phone") }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4", children: [
            /* @__PURE__ */ jsx(Field, { label: "Address", error: edit.errors.address, children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: edit.data.address, onChange: set("address") }) }),
            /* @__PURE__ */ jsx(Field, { label: "Office notes", error: edit.errors.notes, children: /* @__PURE__ */ jsx(TextArea, { rows: 2, value: edit.data.notes, onChange: set("notes") }) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      Modal,
      {
        open: enrolling,
        onClose: () => setEnrolling(false),
        title: "Register on a batch",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setEnrolling(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: enroll.processing || !enroll.data.batch_id, onClick: () => enroll.post(`/portal/students/${s.id}/enroll`, { preserveScroll: true, onSuccess: () => setEnrolling(false) }), children: "Register" })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(Field, { label: "Batch", error: enroll.errors.batch_id, help: "The fee invoices are created automatically.", children: /* @__PURE__ */ jsx(SelectInput, { value: enroll.data.batch_id, onChange: (e) => enroll.setData("batch_id", e.target.value), options: batches.map((b) => ({ value: b.value, label: `${b.label} (${b.seats_left} seats left)` })) }) }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: enroll.data.approve_now, onChange: (e) => enroll.setData("approve_now", e.target.checked) }),
            " Approve now"
          ] })
        ] })
      }
    )
  ] });
}
const __vite_glob_0_51 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Show
}, Symbol.toStringTag, { value: "Module" }));
function Index({ entries, filters, canManage, canMark, form: opts, batchFilter }) {
  const [f, setF] = useFilters("/portal/timetable", filters);
  const [open, setOpen] = useState(false);
  const form = useForm({ batch_id: "", subject_id: "", lecturer_id: "", classroom_id: "", date: "", start_time: "09:00", end_time: "12:00", topic: "" });
  const batch = opts == null ? void 0 : opts.batches.find((b) => String(b.id) === String(form.data.batch_id));
  const subjects = ((opts == null ? void 0 : opts.subjects) || []).filter((s) => !batch || s.course_id === batch.course_id);
  const grouped = entries.reduce((acc, e) => {
    var _a;
    return (acc[_a = e.date] || (acc[_a] = [])).push(e), acc;
  }, {});
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Timetable" }),
    /* @__PURE__ */ jsx(PageHeader, { title: "Timetable", subtitle: "Classes for the next few weeks.", actions: canManage && /* @__PURE__ */ jsxs(Button, { variant: "gold", onClick: () => {
      form.clearErrors();
      setOpen(true);
    }, children: [
      /* @__PURE__ */ jsx(Plus, { size: 16 }),
      " Add a class"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5 grid max-w-3xl gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(Field, { label: "From", children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: f.from, onChange: (e) => setF({ from: e.target.value }, true) }) }),
      /* @__PURE__ */ jsx(Field, { label: "To", children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: f.to, onChange: (e) => setF({ to: e.target.value }, true) }) }),
      canManage && /* @__PURE__ */ jsx(Field, { label: "Batch", children: /* @__PURE__ */ jsx(SelectInput, { value: f.batch_id, onChange: (e) => setF({ batch_id: e.target.value }, true), options: batchFilter.map((b) => ({ value: b.id, label: b.name })), placeholder: "All batches" }) })
    ] }),
    entries.length === 0 ? /* @__PURE__ */ jsx(Empty, { title: "No classes in this period", children: canManage ? 'Use "Add a class" to schedule one.' : "Your timetable will appear here once classes are scheduled." }) : /* @__PURE__ */ jsx("div", { className: "space-y-6", children: Object.entries(grouped).map(([date, list]) => /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-2 text-sm font-bold text-brand", children: (/* @__PURE__ */ new Date(date + "T00:00")).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) }),
      /* @__PURE__ */ jsx("ul", { className: "divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white", children: list.map((e) => /* @__PURE__ */ jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid min-w-0 grid-cols-[110px_1fr] gap-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "font-mono text-sm text-navy-600", children: [
            e.start_time,
            " to ",
            e.end_time
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("p", { className: "font-semibold text-navy", children: [
              e.subject,
              e.topic ? `: ${e.topic}` : ""
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-navy-500", children: [
              e.batch,
              ", ",
              e.lecturer,
              e.classroom ? `, ${e.classroom}` : ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Status, { value: e.status }),
          canMark && e.status !== "cancelled" && /* @__PURE__ */ jsx(Button, { href: `/portal/attendance/${e.id}`, variant: "subtle", size: "sm", children: "Attendance" }),
          canManage && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("select", { "aria-label": "Change status", value: e.status, onChange: (ev) => router.post(`/portal/timetable/${e.id}/status`, { status: ev.target.value }, { preserveScroll: true }), className: "input w-auto py-1 text-xs", children: [
              /* @__PURE__ */ jsx("option", { value: "scheduled", children: "Scheduled" }),
              /* @__PURE__ */ jsx("option", { value: "held", children: "Held" }),
              /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Cancelled" })
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600", "aria-label": "Delete class", onClick: () => confirmThen("Delete this class?", () => router.delete(`/portal/timetable/${e.id}`, { preserveScroll: true })), children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
          ] })
        ] })
      ] }, e.id)) })
    ] }, date)) }),
    canManage && /* @__PURE__ */ jsxs(
      Modal,
      {
        open,
        onClose: () => setOpen(false),
        title: "Add a class",
        footer: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { variant: "gold", disabled: form.processing, onClick: () => form.post("/portal/timetable", { preserveScroll: true, onSuccess: () => {
            setOpen(false);
            form.reset();
          } }), children: "Add class" })
        ] }),
        children: [
          /* @__PURE__ */ jsx(FormError, { errors: form.errors }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Field, { label: "Batch", error: form.errors.batch_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.batch_id, onChange: (e) => form.setData({ ...form.data, batch_id: e.target.value, subject_id: "" }), options: opts.batches.map((b) => ({ value: b.id, label: b.name })) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Subject", error: form.errors.subject_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.subject_id, onChange: (e) => form.setData("subject_id", e.target.value), options: subjects.map((s) => ({ value: s.id, label: s.name })) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Lecturer", error: form.errors.lecturer_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.lecturer_id, onChange: (e) => form.setData("lecturer_id", e.target.value), options: opts.lecturers.map((l) => ({ value: l.id, label: l.name })) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Classroom", error: form.errors.classroom_id, children: /* @__PURE__ */ jsx(SelectInput, { value: form.data.classroom_id, onChange: (e) => form.setData("classroom_id", e.target.value), options: opts.classrooms.map((c) => ({ value: c.id, label: c.name })) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Date", error: form.errors.date, children: /* @__PURE__ */ jsx(TextInput, { type: "date", value: form.data.date, onChange: (e) => form.setData("date", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Topic", error: form.errors.topic, children: /* @__PURE__ */ jsx(TextInput, { value: form.data.topic, onChange: (e) => form.setData("topic", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Starts", error: form.errors.start_time, children: /* @__PURE__ */ jsx(TextInput, { type: "time", value: form.data.start_time, onChange: (e) => form.setData("start_time", e.target.value) }) }),
            /* @__PURE__ */ jsx(Field, { label: "Ends", error: form.errors.end_time, children: /* @__PURE__ */ jsx(TextInput, { type: "time", value: form.data.end_time, onChange: (e) => form.setData("end_time", e.target.value) }) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-navy-400", children: "The system stops double-booking of the lecturer, the room and the batch. Students of the batch are notified." })
        ]
      }
    )
  ] });
}
const __vite_glob_0_52 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
function Verify({ number, result }) {
  const [value, setValue] = useState(number || "");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Verify a certificate" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-xl px-4 py-14 sm:px-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "display-wide text-4xl text-navy", children: "Verify a certificate" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-navy-600", children: "Enter the number printed on the certificate, for example IMDR-CERT-000123." }),
      /* @__PURE__ */ jsxs("form", { className: "mt-6 flex items-end gap-2", onSubmit: (e) => {
        e.preventDefault();
        router.get("/verify", { number: value.trim() });
      }, children: [
        /* @__PURE__ */ jsx(Field, { label: "Certificate number", className: "flex-1", children: /* @__PURE__ */ jsx(TextInput, { value, onChange: (e) => setValue(e.target.value), placeholder: "IMDR-CERT-000123" }) }),
        /* @__PURE__ */ jsx(Button, { type: "submit", variant: "gold", children: "Check" })
      ] }),
      result && result.found && /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx(Alert, { tone: result.valid ? "green" : "red", title: result.valid ? "This certificate is genuine and valid." : "This certificate has been revoked.", children: /* @__PURE__ */ jsxs("dl", { className: "mt-2 grid grid-cols-[120px_1fr] gap-y-1", children: [
        /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Certificate" }),
        /* @__PURE__ */ jsx("dd", { className: "font-semibold", children: result.certificate_no }),
        /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Awarded to" }),
        /* @__PURE__ */ jsx("dd", { className: "font-semibold", children: result.student_name }),
        /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Student ID" }),
        /* @__PURE__ */ jsx("dd", { children: result.student_no }),
        /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Course" }),
        /* @__PURE__ */ jsx("dd", { children: result.course }),
        /* @__PURE__ */ jsx("dt", { className: "text-navy-500", children: "Issued" }),
        /* @__PURE__ */ jsx("dd", { children: fmtDate(result.issued_at) })
      ] }) }) }),
      result && !result.found && /* @__PURE__ */ jsx(Alert, { tone: "red", className: "mt-8", title: "No certificate found", children: "Check the number and try again. If you think this is a mistake, contact the IMDR office." })
    ] })
  ] });
}
const __vite_glob_0_53 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Verify
}, Symbol.toStringTag, { value: "Module" }));
const links$1 = [
  ["/", "Home"],
  ["/about", "About IMDR"],
  ["/courses", "Courses"],
  ["/news", "News"],
  ["/events", "Events"],
  ["/research", "Research"],
  ["/media", "Media"],
  ["/contact", "Contact Us"]
];
const quickLinks = [
  ["/about", "About IMDR"],
  ["/courses", "Explore 18 Courses"],
  ["/apply", "Submit Student Application"],
  ["/media", "Media Showcase"],
  ["/contact", "Contact Us"]
];
const WA_NUMBER = "94712161381";
const WA$1 = `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent("Hello IMDR, I would like to know more about your courses.");
function WhatsAppIcon$1({ size = 18 }) {
  return /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M12.04 2a9.9 9.9 0 0 0-8.43 15.1L2 22l5.05-1.55A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .92.98-2.92-.2-.31A8.2 8.2 0 1 1 12.04 20.1Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.42.06-.64.3-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64 1.53.66 2.13.72 2.9.6.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" }) });
}
function PublicLayout$1({ children }) {
  const page = usePage();
  const { auth } = page.props;
  const url = page.url;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef(null);
  const active = (href) => href === "/" ? url === "/" || url.startsWith("/?") : url === href || url.startsWith(href + "/") || url.startsWith(href + "?");
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled((prev) => prev ? y > 4 : y > 40);
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [url]);
  useEffect(() => setOpen(false), [url]);
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col", children: [
    /* @__PURE__ */ jsx("a", { href: "#main", className: "sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-gold focus:px-3 focus:py-2", children: "Skip to content" }),
    /* @__PURE__ */ jsx("div", { className: "hidden bg-navy text-xs text-navy-200 lg:block", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-2", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Clock, { size: 13, className: "text-gold" }),
        " Mon – Sat, 8:30 AM – 5:00 PM"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-5", children: [
        /* @__PURE__ */ jsxs("a", { href: "tel:+94112042717", className: "flex items-center gap-1.5 hover:text-gold", children: [
          /* @__PURE__ */ jsx(Phone, { size: 13 }),
          " +94 11 204 2717"
        ] }),
        /* @__PURE__ */ jsxs("a", { href: "mailto:info@imdr.lk", className: "flex items-center gap-1.5 hover:text-gold", children: [
          /* @__PURE__ */ jsx(Mail, { size: 13 }),
          " info@imdr.lk"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("header", { className: cx("sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md transition-[box-shadow,border-color] duration-500 ease-out", scrolled ? "border-transparent shadow-[0_8px_24px_-12px_rgba(10,25,60,0.35)]" : "border-navy-100"), children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6", children: [
        /* @__PURE__ */ jsxs(Link$1, { href: "/", className: "group flex items-center gap-3", "aria-label": "IMDR home", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "/images/logo.jpg",
              alt: "IMDR - Institute of Media Development and Research",
              className: cx("h-12 w-12 origin-left object-contain transition-transform duration-500 ease-out group-hover:-rotate-3 motion-reduce:transition-none sm:h-14 sm:w-14", scrolled ? "scale-[0.85]" : "scale-100")
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "hidden leading-tight sm:block", children: [
            /* @__PURE__ */ jsx("span", { className: "display-wide block text-lg text-navy", children: "IMDR" }),
            /* @__PURE__ */ jsx("span", { className: cx("block text-xs text-navy-500 transition-opacity duration-500 motion-reduce:transition-none", scrolled ? "opacity-0" : "opacity-100"), children: "Institute of Media Development and Research" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("nav", { className: "hidden items-center xl:flex", "aria-label": "Main", children: links$1.map(([href, text2]) => /* @__PURE__ */ jsxs(
          Link$1,
          {
            href,
            "aria-current": active(href) ? "page" : void 0,
            className: cx("group relative whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors duration-200", active(href) ? "text-brand" : "text-navy-700 hover:text-navy"),
            children: [
              text2,
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: cx(
                    "absolute inset-x-3 bottom-0.5 h-0.5 origin-left rounded-full bg-gold transition-transform duration-300 ease-out motion-reduce:transition-none",
                    active(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )
                }
              )
            ]
          },
          href
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "hidden items-center gap-3 xl:flex", children: [
          (auth == null ? void 0 : auth.user) ? /* @__PURE__ */ jsx(Button, { href: "/portal", variant: "primary", size: "sm", children: "Open my portal" }) : /* @__PURE__ */ jsx(Button, { href: "/apply", variant: "gold", size: "sm", children: "Apply Now" }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: WA$1,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "group relative flex items-center gap-2 overflow-hidden rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-[#06361a] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 motion-reduce:transition-none",
              children: [
                /* @__PURE__ */ jsx("span", { className: "absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden" }),
                /* @__PURE__ */ jsx(WhatsAppIcon$1, {}),
                /* @__PURE__ */ jsx("span", { className: "relative", children: "WhatsApp us" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 xl:hidden", children: [
          !(auth == null ? void 0 : auth.user) && /* @__PURE__ */ jsx("span", { className: "hidden sm:block", children: /* @__PURE__ */ jsx(Button, { href: "/apply", variant: "gold", size: "sm", children: "Apply Now" }) }),
          /* @__PURE__ */ jsxs("button", { type: "button", className: "relative h-11 w-11 rounded-md text-navy", onClick: () => setOpen(!open), "aria-label": "Menu", "aria-expanded": open, children: [
            /* @__PURE__ */ jsx(Menu, { className: cx("absolute inset-0 m-auto transition-all duration-300 motion-reduce:transition-none", open ? "rotate-90 opacity-0" : "rotate-0 opacity-100") }),
            /* @__PURE__ */ jsx(X, { className: cx("absolute inset-0 m-auto transition-all duration-300 motion-reduce:transition-none", open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: cx("grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none xl:hidden", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"), children: /* @__PURE__ */ jsx("nav", { className: "overflow-hidden bg-white", "aria-label": "Mobile", "aria-hidden": !open, children: /* @__PURE__ */ jsxs("div", { className: "grid max-h-[calc(100vh-5rem)] gap-1 overflow-y-auto border-t border-navy-100 px-4 py-3", children: [
        links$1.map(([href, text2], i) => /* @__PURE__ */ jsx(
          Link$1,
          {
            href,
            tabIndex: open ? 0 : -1,
            style: { transitionDelay: open ? `${60 + i * 40}ms` : "0ms" },
            className: cx(
              "rounded-md border-l-4 px-3 py-3 text-base font-medium transition-all duration-300 motion-reduce:transition-none",
              open ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0",
              active(href) ? "border-gold bg-navy-50 text-brand" : "border-transparent text-navy-700 hover:bg-navy-50"
            ),
            children: text2
          },
          href
        )),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-3 pb-2 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: WA$1,
              target: "_blank",
              rel: "noopener noreferrer",
              tabIndex: open ? 0 : -1,
              className: "flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-[#06361a]",
              children: [
                /* @__PURE__ */ jsx(WhatsAppIcon$1, {}),
                " WhatsApp us"
              ]
            }
          ),
          (auth == null ? void 0 : auth.user) ? /* @__PURE__ */ jsx(Button, { href: "/portal", children: "Open my portal" }) : /* @__PURE__ */ jsx(Button, { href: "/apply", variant: "gold", children: "Apply Now" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 h-0.5 bg-transparent", children: /* @__PURE__ */ jsx("div", { ref: bar, className: "h-full origin-left scale-x-0 bg-gold" }) })
    ] }),
    /* @__PURE__ */ jsxs("main", { id: "main", className: "flex-1", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 pt-4 empty:hidden sm:px-6", children: /* @__PURE__ */ jsx(FlashMessages, {}) }),
      children
    ] }),
    /* @__PURE__ */ jsxs(
      "a",
      {
        href: WA$1,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": "Chat with IMDR on WhatsApp",
        className: "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-[#06361a] shadow-xl transition-transform duration-200 hover:-translate-y-1 xl:hidden",
        children: [
          /* @__PURE__ */ jsx("span", { className: "absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 motion-reduce:hidden", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx("span", { className: "relative", children: /* @__PURE__ */ jsx(WhatsAppIcon$1, { size: 28 }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("footer", { className: "bg-navy text-navy-200", children: [
      /* @__PURE__ */ jsx("div", { className: "h-1 bg-gradient-to-r from-gold via-brand to-gold", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "rounded-lg bg-white p-1", children: /* @__PURE__ */ jsx("img", { src: "/images/logo.jpg", alt: "", className: "h-14 w-14 object-contain" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "display-wide text-xl text-white", children: "IMDR" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Institute of Media Development and Research" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-5 font-semibold text-gold", children: "Research. Educate. Empower." }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-md text-sm leading-7 text-navy-300", children: "Empowering the next generation with practical media literacy, technology, and digital skills." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-4 font-semibold text-white", children: "Quick Links" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-3 text-sm", children: quickLinks.map(([h, t]) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link$1, { href: h, className: "inline-block transition hover:translate-x-1 hover:text-gold", children: t }) }, h)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-4 font-semibold text-white", children: "Connect & Location" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx(MapPin, { size: 16, className: "mt-0.5 shrink-0 text-gold" }),
              " No. 774/C, Highlevel Road, Panagoda, Homagama"
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx(Phone, { size: 16, className: "mt-0.5 shrink-0 text-gold" }),
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx("a", { href: "tel:+94112042717", className: "hover:text-gold", children: "011 204 2717" }),
                /* @__PURE__ */ jsx("span", { className: "mx-2 text-navy-500", children: "|" }),
                /* @__PURE__ */ jsx("a", { href: "tel:+94712161381", className: "hover:text-gold", children: "0712 161 381" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: WA$1, target: "_blank", rel: "noopener noreferrer", className: "flex items-start gap-3 hover:text-gold", children: [
              /* @__PURE__ */ jsx("span", { className: "mt-0.5 shrink-0 text-gold", children: /* @__PURE__ */ jsx(WhatsAppIcon$1, { size: 16 }) }),
              " WhatsApp: Direct Message (+94 71 216 1381)"
            ] }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "mailto:info@imdr.lk", className: "flex items-start gap-3 hover:text-gold", children: [
              /* @__PURE__ */ jsx(Mail, { size: 16, className: "mt-0.5 shrink-0 text-gold" }),
              " info@imdr.lk"
            ] }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "https://www.imdr.lk", className: "flex items-start gap-3 hover:text-gold", children: [
              /* @__PURE__ */ jsx(Globe, { size: 16, className: "mt-0.5 shrink-0 text-gold" }),
              " www.imdr.lk"
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-navy-700 px-4 py-5 text-center text-xs text-navy-400", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Institute of Media Development and Research (IMDR). All Rights Reserved."
      ] })
    ] })
  ] });
}
const links = [
  ["/about", "About"],
  ["/courses", "Courses"],
  ["/news", "News"],
  ["/events", "Events"],
  ["/research", "Research"],
  // ['/media', 'Media'],
  ["/contact", "Contact"]
];
const WA = "https://wa.me/94706766651?text=" + encodeURIComponent("Hello IMDR, I would like to know more about your courses.");
function WhatsAppIcon({ size = 18 }) {
  return /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M12.04 2a9.9 9.9 0 0 0-8.43 15.1L2 22l5.05-1.55A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .92.98-2.92-.2-.31A8.2 8.2 0 1 1 12.04 20.1Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.42.06-.64.3-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64 1.53.66 2.13.72 2.9.6.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" }) });
}
function CoursesMenu({ href, text: text2, isActive, menu }) {
  const column = (title, list, param) => /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-bold uppercase tracking-wider text-navy-400", children: title }),
    /* @__PURE__ */ jsx("ul", { className: "space-y-0.5", children: list.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link$1, { href: `/courses?${param}=${item.id}`, className: "block rounded-md px-2 py-1.5 text-sm text-navy-700 transition-colors hover:bg-navy-50 hover:text-brand", children: item.name }) }, item.id)) })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "group relative", children: [
    /* @__PURE__ */ jsxs(
      Link$1,
      {
        href,
        "aria-haspopup": "true",
        "aria-current": isActive ? "page" : void 0,
        className: cx("relative inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium transition-colors duration-200", isActive ? "text-brand" : "text-navy-700 hover:text-navy"),
        children: [
          text2,
          /* @__PURE__ */ jsx(ChevronDown, { size: 14, "aria-hidden": "true", className: "transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180 motion-reduce:transition-none" }),
          /* @__PURE__ */ jsx("span", { className: cx("absolute inset-x-3.5 bottom-0.5 h-0.5 origin-left rounded-full bg-gold transition-transform duration-300 ease-out motion-reduce:transition-none", isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100") })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "invisible absolute left-0 top-full z-50 w-[30rem] translate-y-1 opacity-0 transition duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6 rounded-xl border border-navy-100 bg-white p-5 shadow-xl", children: [
      column("By department", menu.departments, "department"),
      column("By category", menu.categories, "type"),
      /* @__PURE__ */ jsx(Link$1, { href, className: "col-span-2 border-t border-navy-100 pt-3 text-sm font-semibold text-brand hover:underline", children: "View all courses" })
    ] }) })
  ] });
}
function PublicLayout({ children }) {
  const page = usePage();
  const { auth, courseMenu } = page.props;
  const url = page.url;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef(null);
  const active = (href) => url === href || url.startsWith(href + "/") || url.startsWith(href + "?");
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 12);
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [url]);
  useEffect(() => setOpen(false), [url]);
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col", children: [
    /* @__PURE__ */ jsx("a", { href: "#main", className: "sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-gold focus:px-3 focus:py-2", children: "Skip to content" }),
    /* @__PURE__ */ jsxs("header", { className: cx("sticky top-0 z-40 bg-white/90 backdrop-blur-md transition-shadow duration-300", scrolled ? "shadow-[0_8px_24px_-12px_rgba(10,25,60,0.35)]" : "border-b border-navy-100"), children: [
      /* @__PURE__ */ jsx("div", { className: cx("hidden grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none lg:grid", scrolled ? "grid-rows-[0fr]" : "grid-rows-[1fr]"), children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden bg-navy text-xs text-navy-200", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { size: 13, className: "text-gold" }),
          " Mon – Sat, 8:30 AM – 5:00 PM"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-5", children: [
          /* @__PURE__ */ jsxs("a", { href: "tel:+94112042717", className: "flex items-center gap-1.5 hover:text-gold", children: [
            /* @__PURE__ */ jsx(Phone, { size: 13 }),
            " +94 11 204 2717"
          ] }),
          /* @__PURE__ */ jsxs("a", { href: "mailto:info@imdr.lk", className: "flex items-center gap-1.5 hover:text-gold", children: [
            /* @__PURE__ */ jsx(Mail, { size: 13 }),
            " info@imdr.lk"
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxs("div", { className: cx("mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[padding] duration-300 motion-reduce:transition-none sm:px-6", scrolled ? "py-1.5" : "py-3"), children: [
        /* @__PURE__ */ jsxs(Link$1, { href: "/", className: "group flex items-center gap-3", "aria-label": "IMDR home", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "/images/logo.jpg",
              alt: "IMDR - Institute of Media Development and Research",
              className: cx("object-contain transition-all duration-300 group-hover:rotate-[-4deg] group-hover:scale-105 motion-reduce:transition-none", scrolled ? "h-10 w-10" : "h-14 w-14")
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "hidden leading-tight sm:block", children: [
            /* @__PURE__ */ jsx("span", { className: "display-wide block text-lg text-navy", children: "IMDR" }),
            /* @__PURE__ */ jsx("span", { className: cx("block overflow-hidden text-xs text-navy-500 transition-all duration-300 motion-reduce:transition-none", scrolled ? "max-h-0 opacity-0" : "max-h-5 opacity-100"), children: "Institute of Media Development and Research" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("nav", { className: "hidden items-center lg:flex", "aria-label": "Main", children: links.map(([href, text2]) => href === "/courses" && courseMenu && (courseMenu.departments.length > 0 || courseMenu.categories.length > 0) ? /* @__PURE__ */ jsx(CoursesMenu, { href, text: text2, isActive: active(href), menu: courseMenu }, href) : /* @__PURE__ */ jsxs(
          Link$1,
          {
            href,
            "aria-current": active(href) ? "page" : void 0,
            className: cx("group relative px-3.5 py-2 text-sm font-medium transition-colors duration-200", active(href) ? "text-brand" : "text-navy-700 hover:text-navy"),
            children: [
              text2,
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: cx(
                    "absolute inset-x-3.5 bottom-0.5 h-0.5 origin-left rounded-full bg-gold transition-transform duration-300 ease-out motion-reduce:transition-none",
                    active(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )
                }
              )
            ]
          },
          href
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "hidden items-center gap-3 lg:flex", children: [
          (auth == null ? void 0 : auth.user) ? /* @__PURE__ */ jsx(Button, { href: "/portal", variant: "primary", size: "sm", children: "Open my portal" }) : (
            // Login is for registered students and staff only, so it stays a quiet link
            /* @__PURE__ */ jsxs(Link$1, { href: "/login", className: "flex items-center gap-1.5 text-sm text-navy-500 transition-colors hover:text-navy", children: [
              /* @__PURE__ */ jsx(Lock, { size: 14 }),
              " Student login"
            ] })
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: WA,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "group relative flex items-center gap-2 overflow-hidden rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-[#06361a] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 motion-reduce:transition-none",
              children: [
                /* @__PURE__ */ jsx("span", { className: "absolute inset-0 -translate-x-full bg-white/30 skew-x-12 transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden" }),
                /* @__PURE__ */ jsx(WhatsAppIcon, {}),
                /* @__PURE__ */ jsx("span", { className: "relative", children: "WhatsApp us" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", className: "relative h-10 w-10 rounded-md text-navy lg:hidden", onClick: () => setOpen(!open), "aria-label": "Menu", "aria-expanded": open, children: [
          /* @__PURE__ */ jsx(Menu, { className: cx("absolute inset-0 m-auto transition-all duration-300 motion-reduce:transition-none", open ? "rotate-90 opacity-0" : "rotate-0 opacity-100") }),
          /* @__PURE__ */ jsx(X, { className: cx("absolute inset-0 m-auto transition-all duration-300 motion-reduce:transition-none", open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0") })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: cx("grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none lg:hidden", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"), children: /* @__PURE__ */ jsx("nav", { className: "overflow-hidden bg-white", "aria-label": "Mobile", "aria-hidden": !open, children: /* @__PURE__ */ jsxs("div", { className: "grid gap-1 border-t border-navy-100 px-4 py-3", children: [
        links.map(([href, text2], i) => /* @__PURE__ */ jsx(
          Link$1,
          {
            href,
            tabIndex: open ? 0 : -1,
            style: { transitionDelay: open ? `${60 + i * 40}ms` : "0ms" },
            className: cx(
              "rounded-md border-l-4 px-3 py-2.5 text-sm font-medium transition-all duration-300 motion-reduce:transition-none",
              open ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0",
              active(href) ? "border-gold bg-navy-50 text-brand" : "border-transparent text-navy-700 hover:bg-navy-50"
            ),
            children: text2
          },
          href
        )),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("a", { href: WA, target: "_blank", rel: "noopener noreferrer", tabIndex: open ? 0 : -1, className: "flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-[#06361a]", children: [
            /* @__PURE__ */ jsx(WhatsAppIcon, {}),
            " WhatsApp us"
          ] }),
          (auth == null ? void 0 : auth.user) ? /* @__PURE__ */ jsx(Button, { href: "/portal", size: "sm", children: "Open my portal" }) : /* @__PURE__ */ jsxs(Link$1, { href: "/login", tabIndex: open ? 0 : -1, className: "flex items-center gap-1.5 px-2 text-sm text-navy-500", children: [
            /* @__PURE__ */ jsx(Lock, { size: 14 }),
            " Student login"
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 bottom-0 h-0.5 bg-transparent", children: /* @__PURE__ */ jsx("div", { ref: bar, className: "h-full origin-left scale-x-0 bg-gold" }) })
    ] }),
    /* @__PURE__ */ jsxs("main", { id: "main", className: "flex-1", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 pt-4 sm:px-6 empty:hidden", children: /* @__PURE__ */ jsx(FlashMessages, {}) }),
      children
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "bg-navy text-navy-200", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "rounded-lg bg-white p-1", children: /* @__PURE__ */ jsx("img", { src: "/images/logo.jpg", alt: "", className: "h-14 w-14 object-contain" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "display-wide text-xl text-white", children: "IMDR" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Research. Educate. Empower." })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-md text-sm text-navy-300", children: "Media education, digital skills, research and community development. Building knowledge, developing skills and empowering society." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-3 font-semibold text-white", children: "Explore" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-sm", children: [["/courses", "All courses"], ["/about", "About IMDR"], ["/verify", "Verify a certificate"], ["/login", "Student and staff login"]].map(([h, t]) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link$1, { href: h, className: "transition-colors hover:text-gold", children: t }) }, h)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "mb-3 font-semibold text-white", children: "Contact" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "mailto:info@imdr.lk", className: "flex items-center gap-2 hover:text-gold", children: [
              /* @__PURE__ */ jsx(Mail, { size: 14 }),
              " info@imdr.lk"
            ] }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "tel:+94112042717", className: "flex items-center gap-2 hover:text-gold", children: [
              /* @__PURE__ */ jsx(Phone, { size: 14 }),
              " +94 11 204 2717"
            ] }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: WA, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 hover:text-gold", children: [
              /* @__PURE__ */ jsx(WhatsAppIcon, { size: 14 }),
              " 070 676 6651"
            ] }) }),
            /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(MapPin, { size: 14, className: "mt-0.5 shrink-0" }),
              " No. 774/C, Highlevel Road, Panagoda, Homagama"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-navy-700 py-4 text-center text-xs text-navy-400", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Institute of Media Development and Research"
      ] })
    ] })
  ] });
}
function SeoHead() {
  const { seo } = usePage().props;
  if (!seo) return null;
  return /* @__PURE__ */ jsxs(Head, { children: [
    /* @__PURE__ */ jsx("meta", { "head-key": "description", name: "description", content: seo.description }),
    /* @__PURE__ */ jsx("meta", { "head-key": "robots", name: "robots", content: seo.robots }),
    seo.canonical && /* @__PURE__ */ jsx("link", { "head-key": "canonical", rel: "canonical", href: seo.canonical }),
    seo.canonical && /* @__PURE__ */ jsx("meta", { "head-key": "og:type", property: "og:type", content: seo.type }),
    seo.canonical && /* @__PURE__ */ jsx("meta", { "head-key": "og:url", property: "og:url", content: seo.canonical }),
    seo.canonical && /* @__PURE__ */ jsx("meta", { "head-key": "og:title", property: "og:title", content: seo.title }),
    seo.canonical && /* @__PURE__ */ jsx("meta", { "head-key": "og:description", property: "og:description", content: seo.description }),
    seo.canonical && /* @__PURE__ */ jsx("meta", { "head-key": "og:site_name", property: "og:site_name", content: "IMDR" })
  ] });
}
const pages = /* @__PURE__ */ Object.assign({ "./Pages/About.jsx": __vite_glob_0_0, "./Pages/Admin/Departments/Index.jsx": __vite_glob_0_1, "./Pages/Admin/Departments/Show.jsx": __vite_glob_0_2, "./Pages/Announcements/Feed.jsx": __vite_glob_0_3, "./Pages/Apply.jsx": __vite_glob_0_4, "./Pages/Assignments/Index.jsx": __vite_glob_0_5, "./Pages/Assignments/Show.jsx": __vite_glob_0_6, "./Pages/Attendance/Index.jsx": __vite_glob_0_7, "./Pages/Attendance/Report.jsx": __vite_glob_0_8, "./Pages/Attendance/Show.jsx": __vite_glob_0_9, "./Pages/Auth/Login.jsx": __vite_glob_0_10, "./Pages/Certificates/Index.jsx": __vite_glob_0_11, "./Pages/Certificates/Print.jsx": __vite_glob_0_12, "./Pages/Contact.jsx": __vite_glob_0_13, "./Pages/Courses/Form.jsx": __vite_glob_0_14, "./Pages/Courses/Index.jsx": __vite_glob_0_15, "./Pages/Courses/Manage.jsx": __vite_glob_0_16, "./Pages/Courses/Show.jsx": __vite_glob_0_17, "./Pages/Dashboard.jsx": __vite_glob_0_18, "./Pages/Error.jsx": __vite_glob_0_19, "./Pages/Finance/Expenses.jsx": __vite_glob_0_20, "./Pages/Finance/Invoices.jsx": __vite_glob_0_21, "./Pages/Finance/Payments.jsx": __vite_glob_0_22, "./Pages/Finance/Payroll.jsx": __vite_glob_0_23, "./Pages/Finance/PayrollShow.jsx": __vite_glob_0_24, "./Pages/Finance/Reports.jsx": __vite_glob_0_25, "./Pages/Finance/Transactions.jsx": __vite_glob_0_26, "./Pages/Finance/WhatsApp.jsx": __vite_glob_0_27, "./Pages/Home.jsx": __vite_glob_0_28, "./Pages/Lms/Index.jsx": __vite_glob_0_29, "./Pages/Manage/Index.jsx": __vite_glob_0_30, "./Pages/Notifications.jsx": __vite_glob_0_31, "./Pages/Payment/Redirect.jsx": __vite_glob_0_32, "./Pages/Payment/Return.jsx": __vite_glob_0_33, "./Pages/Payment/Sandbox.jsx": __vite_glob_0_34, "./Pages/Posts/Index.jsx": __vite_glob_0_35, "./Pages/Posts/Show.jsx": __vite_glob_0_36, "./Pages/Profile.jsx": __vite_glob_0_37, "./Pages/Quizzes/Create.jsx": __vite_glob_0_38, "./Pages/Quizzes/Index.jsx": __vite_glob_0_39, "./Pages/Quizzes/Show.jsx": __vite_glob_0_40, "./Pages/Receipt.jsx": __vite_glob_0_41, "./Pages/Registrations/Index.jsx": __vite_glob_0_42, "./Pages/Settings.jsx": __vite_glob_0_43, "./Pages/Student/Blocked.jsx": __vite_glob_0_44, "./Pages/Student/Certificates.jsx": __vite_glob_0_45, "./Pages/Student/Courses.jsx": __vite_glob_0_46, "./Pages/Student/Finance.jsx": __vite_glob_0_47, "./Pages/Student/Records.jsx": __vite_glob_0_48, "./Pages/Students/Create.jsx": __vite_glob_0_49, "./Pages/Students/Index.jsx": __vite_glob_0_50, "./Pages/Students/Show.jsx": __vite_glob_0_51, "./Pages/Timetable/Index.jsx": __vite_glob_0_52, "./Pages/Verify.jsx": __vite_glob_0_53 });
const publicPages = /* @__PURE__ */ new Set(["Home", "About", "Courses/Index", "Courses/Show", "Posts/Index", "Posts/Show", "Contact", "Apply", "Verify", "Auth/Login", "Error"]);
const barePages = /* @__PURE__ */ new Set(["Receipt", "Payment/Redirect", "Certificates/Print"]);
const formatTitle = (title) => title ? `${title} | IMDR` : "IMDR | Institute of Media Development and Research";
function resolvePage(name) {
  var _a;
  const page = pages[`./Pages/${name}.jsx`];
  if (!page) throw new Error(`Page not found: ${name}`);
  (_a = page.default).layout ?? (_a.layout = (node) => /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SeoHead, {}),
    barePages.has(name) ? node : publicPages.has(name) ? /* @__PURE__ */ jsx(PublicLayout, { children: node }) : /* @__PURE__ */ jsx(PublicLayout$1, { children: node })
  ] }));
  return page;
}
createServer((page) => createInertiaApp({
  page,
  render: renderToString,
  title: formatTitle,
  resolve: resolvePage,
  setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
}));
