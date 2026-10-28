// ════════════════════════════════════════════════════════════════════════════════
// StudentFlashSection.jsx — STUDENT-FIRST "How It Works"
// 3-step guide: Browse → Book → Get Guidance
// Accordion on the left drives an interactive, illustrative demo on the right.
// Look: sky-blue ground, white panel, marigold tiles, blue checks, ink progress bar.
// Auto-advances through the steps until the visitor interacts (or hovers),
// and stays still for prefers-reduced-motion users. No API calls — pure mock.
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useInView } from 'framer-motion';
import { TEAM_MENTORS, mentorLook } from '../../utils/teamMentors';
import {
  Check,
  Search,
  ShieldCheck,
  Video,
  FileText,
  MessageSquare,
  CreditCard,
  CalendarCheck,
  GraduationCap,
  Globe,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';

const STEPS = [
  {
    id: 0,
    number: '01',
    title: 'Browse Verified Seniors',
    shortDesc: 'Filter by university, country, degree, or service type — every mentor is admin-verified.',
    fullDesc: 'Explore Prachi, Nitya, and Manan, and find guidance by mentor name, expertise, or destination country.'
  },
  {
    id: 1,
    number: '02',
    title: 'Book a Session',
    shortDesc: 'Pick a service, choose your time slot, and pay securely via Razorpay.',
    fullDesc: 'Select from 1:1 video calls, SOP & resume reviews, priority DM questions, or downloadable guides. Pick a convenient slot from the mentor\'s live calendar, and pay securely — no hidden charges, no platform commission.'
  },
  {
    id: 2,
    number: '03',
    title: 'Get Expert Guidance',
    shortDesc: 'Connect directly with your mentor. Real advice from someone who\'s been through it.',
    fullDesc: 'Get personalized, first-hand advice on university applications, visa interviews, scholarships, SOP writing, and life abroad — from a senior who got admitted to your dream university.'
  }
];

// How long each step stays on screen while auto-playing
const STEP_DURATION_MS = 4800;

const COUNTRIES = [
  { flag: '🇮🇪', label: 'Ireland' },
  { flag: '🇦🇺', label: 'Australia' }
];

const FEATURED_MENTORS = TEAM_MENTORS.map((mentor) => ({
  ...mentor,
  uni: mentor.role,
  course: mentor.country,
  gradient: 'from-[#DE5C2B] to-amber-500',
  photo: mentorLook(mentor.name).cutout || mentor.headshot || mentor.portrait,
  photoBg: mentorLook(mentor.name).gradient,
}));
const PRIMARY_MENTOR = FEATURED_MENTORS[0];

const SERVICES = [
  { id: 'call', icon: Video, label: '1:1 Video Call (30 min)', price: '₹499', iconClass: 'text-[#DE5C2B]' },
  { id: 'sop', icon: FileText, label: 'SOP Review', price: '₹399', iconClass: 'text-amber-600' },
  { id: 'dm', icon: MessageSquare, label: 'Priority DM', price: '₹199', iconClass: 'text-emerald-600' }
];

const DEMO_DATES = [
  { day: 'Mon', date: '12' },
  { day: 'Tue', date: '13' },
  { day: 'Wed', date: '14' },
  { day: 'Thu', date: '15' }
];

const DEMO_TIMES = [
  { label: '10:00 AM' },
  { label: '1:30 PM', taken: true },
  { label: '5:00 PM' },
  { label: '7:30 PM' }
];

const CHAT_LINES = [
  { from: 'student', text: 'Is a 7.8 CGPA enough for TUM Informatics?' },
  { from: 'mentor', text: 'It can be — your projects and SOP matter a lot. Let\'s go through them.' },
  { from: 'student', text: 'Could you review my SOP draft too?' },
  { from: 'mentor', text: 'Sure, share it here and I\'ll mark it up before Friday.' }
];

const INK = '#16130F';
const MARIGOLD = '#FFC93C';
const TILE = '#F2F5F9';
const BLUE = '#2F5BFF';

const panelMotion = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -10 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

const Avatar = ({ mentor, size = 'w-9 h-9 text-sm' }) => (
  <div
    className={`${size} rounded-xl bg-gradient-to-br ${mentor.gradient} text-white font-bold flex items-center justify-center shrink-0 overflow-hidden`}
    style={mentor.photoBg ? { background: mentor.photoBg } : undefined}
    aria-hidden="true"
  >
    {mentor.photo ? (
      <img src={mentor.photo} alt="" className="w-full h-full object-cover object-top rounded-[inherit]" />
    ) : (
      mentor.name.charAt(0)
    )}
  </div>
);

// ── STEP 1 DEMO: search + country chips filtering mentor cards ──
const BrowseDemo = ({ autoPlay, paused, onInteract }) => {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('Ireland');

  // While auto-playing, "type" searches into the box letter by letter so the filter is seen working
  const DEMO_QUERIES = useMemo(() => ['Ireland', 'Manan', 'Australia'], []);
  const [demo, setDemo] = useState({ q: 0, chars: 0, hold: 0 });
  useEffect(() => {
    if (!autoPlay || paused) return undefined;
    const word = DEMO_QUERIES[demo.q];
    const t = setTimeout(() => {
      setDemo((d) => {
        if (d.chars < word.length) return { ...d, chars: d.chars + 1 };
        if (d.hold < 12) return { ...d, hold: d.hold + 1 };
        return { q: (d.q + 1) % DEMO_QUERIES.length, chars: 0, hold: 0 };
      });
    }, demo.chars < word.length ? 70 : 80);
    return () => clearTimeout(t);
  }, [autoPlay, paused, demo, DEMO_QUERIES]);
  const typing = autoPlay && !paused;
  const shownQuery = typing ? DEMO_QUERIES[demo.q].slice(0, demo.chars) : query;

  const results = useMemo(() => {
    const q = shownQuery.trim().toLowerCase();
    if (!q) return FEATURED_MENTORS.filter((m) => m.country === country);
    return FEATURED_MENTORS.filter((m) =>
      [m.name, m.uni, m.course, m.country].some((field) => field.toLowerCase().includes(q))
    ).slice(0, 4);
  }, [shownQuery, country]);

  return (
    <div className="w-full space-y-3">
      {/* Search */}
      <div>
        <label className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border-2 border-transparent focus-within:border-[#16130F] transition-colors" style={{ background: TILE }}>
          <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="sr-only">Search mentors</span>
          <input
            type="text"
            value={shownQuery}
            onChange={(e) => {
              onInteract();
              setQuery(e.target.value);
            }}
            onFocus={onInteract}
            placeholder="Search by university, country..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 font-medium outline-none"
          />
          {typing && <span className="w-[2px] h-4 bg-[#2F5BFF] animate-pulse -ml-2 shrink-0" aria-hidden="true" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </label>
      </div>

      {/* Country chips */}
      <div className="flex items-center gap-2 flex-wrap px-1" role="group" aria-label="Filter mentors by country">
        {COUNTRIES.map((c) => {
          const isOn = !shownQuery && country === c.label;
          return (
            <button
              key={c.label}
              type="button"
              aria-pressed={isOn}
              onClick={() => {
                onInteract();
                setQuery('');
                setCountry(c.label);
              }}
              className={`px-3.5 py-2 rounded-[14px] text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 cursor-pointer no-shine ${
                isOn ? 'text-[#16130F] -rotate-2' : 'text-slate-600 hover:text-[#16130F]'
              }`}
              style={{ background: isOn ? MARIGOLD : TILE }}
            >
              <span aria-hidden="true">{c.flag}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 min-h-[86px]" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {results.map((m) => (
            <motion.div
              key={m.name}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[18px] p-3 sm:p-3.5 min-w-0"
              style={{ background: TILE }}
            >
              <div className="flex items-center gap-2.5 mb-2 min-w-0">
                <Avatar mentor={m} />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{m.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{m.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-white" style={{ background: BLUE }}>
                  <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                  Verified
                </span>
                <span className="text-slate-500 font-medium truncate">{m.country}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {results.length === 0 && (
          <div className="col-span-2 text-center text-xs text-slate-500 rounded-2xl border-2 border-dashed border-slate-200 py-6">
            No featured mentor matches this search.
          </div>
        )}
      </div>
    </div>
  );
};

// ── STEP 2 DEMO: service + slot picker + Book button ──
const BookDemo = ({ autoPlay, onInteract }) => {
  const [service, setService] = useState('call');
  const [dateIdx, setDateIdx] = useState(null);
  const [time, setTime] = useState(null);
  const [bookState, setBookState] = useState('idle'); // idle | booking | booked
  const bookTimer = useRef(null);

  const book = () => {
    setBookState('booking');
    clearTimeout(bookTimer.current);
    bookTimer.current = setTimeout(() => setBookState('booked'), 550);
  };

  useEffect(() => () => clearTimeout(bookTimer.current), []);

  // Scripted walkthrough while auto-playing: pick a date → pick a time → book
  useEffect(() => {
    if (!autoPlay) return undefined;
    const timers = [
      setTimeout(() => setDateIdx(1), 500),
      setTimeout(() => setTime('5:00 PM'), 1100),
      setTimeout(() => book(), 1700)
    ];
    return () => timers.forEach(clearTimeout);
  }, [autoPlay]);

  const resetIfBooked = () => {
    if (bookState !== 'idle') setBookState('idle');
  };

  const canBook = dateIdx !== null && time && bookState === 'idle';

  return (
    <div className="w-full text-left">
      {/* Mentor header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar mentor={PRIMARY_MENTOR} size="w-10 h-10 text-sm" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 truncate">{PRIMARY_MENTOR.name}</div>
            <div className="text-[10px] text-slate-400 font-medium truncate">{PRIMARY_MENTOR.role}</div>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-white px-2 py-0.5 rounded-md" style={{ background: BLUE }}>
          <ShieldCheck className="w-3 h-3" aria-hidden="true" />
          Verified
        </span>
      </div>

      {/* Services */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3.5" role="radiogroup" aria-label="Choose a demo service">
        {SERVICES.map((s) => {
          const isOn = service === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={isOn}
              onClick={() => {
                onInteract();
                resetIfBooked();
                setService(s.id);
              }}
              className="flex flex-col items-start gap-1 p-2.5 sm:p-3 rounded-[16px] text-left transition-colors duration-300 cursor-pointer no-shine"
              style={{ background: isOn ? MARIGOLD : TILE }}
            >
              <s.icon className="w-4 h-4 text-[#16130F]" aria-hidden="true" />
              <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-800 leading-tight">{s.label}</span>
              <span className="text-[11px] font-black text-slate-900">{s.price}</span>
            </button>
          );
        })}
      </div>

      {/* Dates */}
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pick a date</div>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3" role="radiogroup" aria-label="Demo dates">
        {DEMO_DATES.map((d, idx) => {
          const isOn = dateIdx === idx;
          return (
            <button
              key={d.date}
              type="button"
              role="radio"
              aria-checked={isOn}
              onClick={() => {
                onInteract();
                resetIfBooked();
                setDateIdx(idx);
              }}
              className={`relative py-2 rounded-[14px] text-center transition-colors duration-200 cursor-pointer no-shine ${
                isOn ? 'text-[#16130F]' : 'text-slate-600 hover:text-[#16130F]'
              }`}
              style={{ background: TILE }}
            >
              {isOn && (
                <motion.span
                  layoutId="demo-date-pill"
                  className="absolute inset-0 rounded-[14px] bg-[#FFC93C]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative block text-[10px] font-semibold opacity-80">{d.day}</span>
              <span className="relative block text-sm font-black leading-tight">{d.date}</span>
            </button>
          );
        })}
      </div>

      {/* Times */}
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pick a time (IST)</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3.5" role="radiogroup" aria-label="Demo time slots">
        {DEMO_TIMES.map((t) => {
          const isOn = time === t.label;
          return (
            <button
              key={t.label}
              type="button"
              role="radio"
              aria-checked={isOn}
              disabled={t.taken}
              onClick={() => {
                onInteract();
                resetIfBooked();
                setTime(t.label);
              }}
              className={`py-2 rounded-[12px] text-[11px] font-bold transition-colors duration-200 no-shine ${
                t.taken
                  ? 'bg-[#F2F5F9] text-slate-300 line-through cursor-not-allowed'
                  : isOn
                    ? 'bg-[#16130F] text-white cursor-pointer'
                    : 'bg-[#F2F5F9] text-slate-700 hover:text-[#16130F] cursor-pointer'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Book CTA */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-slate-500 font-medium min-w-0">
          <CreditCard className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Secure payment via Razorpay</span>
        </div>
        <motion.button
          type="button"
          onClick={() => {
            onInteract();
            if (canBook) book();
          }}
          disabled={!canBook && bookState === 'idle'}
          whileTap={canBook ? { scale: 0.94 } : undefined}
          animate={bookState === 'booked' ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
          aria-live="polite"
          className={`shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-extrabold transition-colors duration-200 no-shine ${
            bookState === 'booked'
              ? 'bg-[#2F5BFF] text-white'
              : canBook || bookState === 'booking'
                ? 'bg-[#16130F] text-white cursor-pointer'
                : 'bg-[#F2F5F9] text-slate-400 cursor-not-allowed'
          }`}
        >
          {bookState === 'booking' && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
          {bookState === 'booked' && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
          <span>
            {bookState === 'booking' ? 'Booking…' : bookState === 'booked' ? 'Slot reserved' : 'Book'}
          </span>
        </motion.button>
      </div>
    </div>
  );
};

// ── STEP 3 DEMO: confirmed session + chat preview ──
const GuidanceDemo = () => (
  <div className="w-full space-y-3">
    <div className="text-left">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarCheck className="w-5 h-5 text-[#2F5BFF] shrink-0" aria-hidden="true" />
          <span className="text-sm font-bold text-slate-900 truncate">Session with {PRIMARY_MENTOR.name}</span>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      {/* Chat preview */}
      <div className="space-y-2 rounded-[18px] p-3" style={{ background: TILE }}>
        {CHAT_LINES.map((line, idx) => {
          const isMentor = line.from === 'mentor';
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.35, duration: 0.25 }}
              className={`flex ${isMentor ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-[11.5px] leading-snug font-medium ${
                  isMentor
                    ? 'bg-white text-slate-800 rounded-bl-md'
                    : 'bg-[#2F5BFF] text-white rounded-br-md'
                }`}
              >
                {line.text}
              </div>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 + CHAT_LINES.length * 0.65 }}
          className="flex items-center gap-1 pl-1 text-slate-400"
          aria-hidden="true"
        >
          {[0, 1, 2].map((d) => (
            <motion.span
              key={d}
              className="w-1.5 h-1.5 rounded-full bg-slate-300"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.2 }}
            />
          ))}
        </motion.div>
      </div>

      <div className="text-[11px] text-slate-500 font-medium mt-2.5">
        1:1 Video Call • 30 minutes • Meeting link sent to your email ✓
      </div>
    </div>

    {/* What You'll Get */}
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        What You&apos;ll Get
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: GraduationCap, text: 'Application strategy' },
          { icon: FileText, text: 'SOP & resume tips' },
          { icon: Globe, text: 'Visa & interview prep' },
          { icon: CheckCircle2, text: 'Real campus experience' }
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2 rounded-[14px] px-3 py-2.5 text-xs text-[#16130F] font-bold" style={{ background: MARIGOLD }}>
            <item.icon className="w-3.5 h-3.5 text-[#16130F] flex-shrink-0" aria-hidden="true" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const StudentFlashSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovering, setHovering] = useState(false);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { amount: 0.35 });

  // Auto-play only when visible, not hovered and not yet interacted with
  const isAutoPlaying = autoPlay;
  const isRunning = isAutoPlaying && inView && !hovering;

  useEffect(() => {
    if (!isRunning) return undefined;
    const id = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, STEP_DURATION_MS);
    return () => clearTimeout(id);
  }, [isRunning, activeStep]);

  const stopAutoPlay = () => setAutoPlay(false);

  const panelPoints = [
    'Verified seniors from your target universities',
    'Meet link and calendar invite sent to you',
    'Secure Razorpay payment, no hidden charges',
  ];

  return (
    <MotionConfig reducedMotion="never">
      <section
        ref={sectionRef}
        id="how-unicoach-works"
        className="py-14 sm:py-20 px-4 sm:px-6 lg:px-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #8FD3FF 0%, #A6DCFF 100%)' }}
      >
        <div className="max-w-[1320px] mx-auto">
          {/* ── SECTION HEADER ── */}
          <div className="text-center max-w-[760px] mx-auto">
            <h2 className="text-[34px] sm:text-[52px] font-black text-[#16130F] leading-[0.98] tracking-[-0.045em]">
              How UniCoach works
            </h2>
            <p className="mt-3 text-[16px] sm:text-[18px] text-[#16130F]/75">From discovery to expert guidance, in 3 simple steps.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 lg:gap-10 items-center">
            {/* ════════ LEFT: STEPS, THE ACTIVE ONE LIFTED ONTO A WHITE CARD ════════ */}
            <ol className="m-0 p-0 list-none flex flex-col gap-2">
              {STEPS.map((step) => {
                const isActive = activeStep === step.id;
                const isDone = step.id < activeStep;
                return (
                  <li key={step.id}>
                    <h3 className="m-0">
                      <button
                        type="button"
                        id={`how-step-${step.id}`}
                        aria-expanded={isActive}
                        aria-controls="how-it-works-demo"
                        onClick={() => {
                          stopAutoPlay();
                          setActiveStep(step.id);
                        }}
                        className={`relative overflow-hidden w-full text-left flex items-start gap-4 rounded-[22px] px-4 sm:px-5 py-4 transition-all duration-300 cursor-pointer no-shine ${
                          isActive ? 'bg-white shadow-[0_18px_40px_-22px_rgba(16,60,110,0.55)] scale-[1.02]' : 'hover:bg-white/40'
                        }`}
                      >
                        <span
                          className={`shrink-0 grid place-items-center w-11 h-11 rounded-[14px] font-urbanist text-[15px] font-black transition-all ${
                            isActive ? 'text-[#16130F] -rotate-6' : isDone ? 'bg-white text-[#2F5BFF]' : 'bg-white/70 text-[#16130F]'
                          }`}
                          style={isActive ? { background: MARIGOLD } : undefined}
                        >
                          {isDone ? <Check size={18} strokeWidth={3} /> : step.number}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[18px] sm:text-[21px] font-black text-[#16130F] tracking-[-0.02em]">{step.title}</span>
                          <span className={`block mt-0.5 text-[14.5px] leading-snug ${isActive ? 'text-slate-700' : 'text-[#16130F]/60'}`}>{step.shortDesc}</span>
                          {isActive && (
                            <motion.span
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.25 }}
                              className="block mt-1.5 text-[13px] leading-relaxed text-slate-500"
                            >
                              {step.fullDesc}
                            </motion.span>
                          )}
                        </span>

                        {/* Auto-play progress along the bottom of the active card */}
                        {isActive && isAutoPlaying && (
                          <span className="absolute left-5 right-5 bottom-0 h-[3px] rounded-full bg-[#F2F5F9]" aria-hidden="true">
                            <motion.span
                              key={`progress-${step.id}`}
                              className="block h-full rounded-full bg-[#FFC93C] origin-left"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: isRunning ? 1 : 0 }}
                              transition={{ duration: isRunning ? STEP_DURATION_MS / 1000 : 0.2, ease: 'linear' }}
                            />
                          </span>
                        )}
                      </button>
                    </h3>
                  </li>
                );
              })}
            </ol>

            {/* ════════ RIGHT: THE DEMO ON A WHITE PANEL ════════ */}
            <div
              id="how-it-works-demo"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onFocusCapture={() => setHovering(true)}
              onBlurCapture={() => setHovering(false)}
              className="relative overflow-hidden rounded-[34px] bg-white p-5 sm:p-8 shadow-[0_30px_70px_-36px_rgba(16,60,110,0.6)]"
            >
              <div aria-hidden="true" className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,#FFE7A3_0%,transparent_70%)] pointer-events-none" />
              <p className="relative flex items-center gap-2 text-[14px] sm:text-[15px] font-bold text-[#16130F]/80">
                <span className="w-3 h-3 rounded-full bg-[#FFC93C]" /> Interactive preview · Step {STEPS[activeStep].number}
              </p>

              <div className="relative mt-5 min-h-[330px] flex items-center" aria-labelledby={`how-step-${activeStep}`} role="region">
                <AnimatePresence mode="wait">
                  {activeStep === 0 && (
                    <motion.div key="step-0" {...panelMotion} className="w-full">
                      <BrowseDemo autoPlay={isAutoPlaying} paused={!isRunning} onInteract={stopAutoPlay} />
                    </motion.div>
                  )}
                  {activeStep === 1 && (
                    <motion.div key="step-1" {...panelMotion} className="w-full">
                      <BookDemo autoPlay={isAutoPlaying} onInteract={stopAutoPlay} />
                    </motion.div>
                  )}
                  {activeStep === 2 && (
                    <motion.div key="step-2" {...panelMotion} className="w-full">
                      <GuidanceDemo />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ul className="relative mt-6 m-0 p-0 list-none flex flex-col gap-2.5">
                {panelPoints.map((line) => (
                  <li key={line} className="flex items-center gap-3 text-[14.5px] sm:text-[15.5px] font-bold text-[#16130F]">
                    <span className="grid place-items-center w-6 h-6 rounded-full text-white shrink-0" style={{ background: BLUE }}><Check size={14} strokeWidth={3} /></span>
                    {line}
                  </li>
                ))}
              </ul>

              <div className="relative mt-6 rounded-[18px] px-5 py-4 flex items-center justify-between gap-4" style={{ background: INK }}>
                <span className="text-[15px] sm:text-[17px] font-extrabold text-white tabular-nums">Step {activeStep + 1} of {STEPS.length}</span>
                <span className="flex-1 max-w-[200px] h-2 rounded-full bg-white/15 overflow-hidden">
                  <span className="block h-full rounded-full bg-[#FFC93C] transition-[width] duration-500" style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
};
