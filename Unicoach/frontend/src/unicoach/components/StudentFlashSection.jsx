// ════════════════════════════════════════════════════════════════════════════════
// StudentFlashSection.jsx — STUDENT-FIRST "How It Works"
// 3-step guide: Browse → Book → Get Guidance
// Accordion on the left drives an interactive, illustrative demo on the right.
// Auto-advances through the steps until the visitor interacts (or hovers),
// and stays still for prefers-reduced-motion users. No API calls — pure mock.
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useInView } from 'framer-motion';
import { TEAM_MENTORS } from '../../utils/teamMentors';
import {
  ChevronDown,
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
const STEP_DURATION_MS = 7000;

const COUNTRIES = [
  { flag: '🇮🇪', label: 'Ireland' },
  { flag: '🇦🇺', label: 'Australia' }
];

const FEATURED_MENTORS = TEAM_MENTORS.map((mentor) => ({
  ...mentor,
  uni: mentor.role,
  course: mentor.country,
  gradient: 'from-[#DE5C2B] to-amber-500',
  photo: mentor.portrait,
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

const panelMotion = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -10 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

const Avatar = ({ mentor, size = 'w-9 h-9 text-sm' }) => (
  <div
    className={`${size} rounded-xl bg-gradient-to-br ${mentor.gradient} text-white font-bold flex items-center justify-center shrink-0`}
    aria-hidden="true"
  >
    {mentor.photo ? (
      <img src={mentor.photo} alt="" className="w-full h-full object-cover rounded-[inherit]" />
    ) : (
      mentor.name.charAt(0)
    )}
  </div>
);

// ── STEP 1 DEMO: search + country chips filtering mentor cards ──
const BrowseDemo = ({ autoPlay, paused, onInteract }) => {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('Ireland');

  // While auto-playing, gently cycle the country chips to show the filter in action
  useEffect(() => {
    if (!autoPlay || paused || query) return undefined;
    const id = setInterval(() => {
      setCountry((prev) => {
        const idx = COUNTRIES.findIndex((c) => c.label === prev);
        return COUNTRIES[(idx + 1) % COUNTRIES.length].label;
      });
    }, 1700);
    return () => clearInterval(id);
  }, [autoPlay, paused, query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FEATURED_MENTORS.filter((m) => m.country === country);
    return FEATURED_MENTORS.filter((m) =>
      [m.name, m.uni, m.course, m.country].some((field) => field.toLowerCase().includes(q))
    ).slice(0, 4);
  }, [query, country]);

  return (
    <div className="w-full space-y-3">
      {/* Search */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-md border border-orange-100/60">
        <label className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200/80 focus-within:border-[#DE5C2B] focus-within:ring-2 focus-within:ring-orange-100 transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="sr-only">Search mentors</span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              onInteract();
              setQuery(e.target.value);
            }}
            onFocus={onInteract}
            placeholder="Search by university, country..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 font-medium outline-none"
          />
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
          const isOn = !query && country === c.label;
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                isOn
                  ? 'bg-[#DE5C2B] text-white shadow-md'
                  : 'bg-white/90 text-slate-700 border border-slate-200/80 hover:border-orange-300'
              }`}
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
              className="bg-white rounded-2xl p-3 sm:p-3.5 shadow-sm border border-orange-100/60 min-w-0"
            >
              <div className="flex items-center gap-2.5 mb-2 min-w-0">
                <Avatar mentor={m} />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{m.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{m.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-50 text-[#C2410C] border border-orange-200/70">
                  <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                  Verified
                </span>
                <span className="text-slate-400 font-medium truncate">{m.country}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {results.length === 0 && (
          <div className="col-span-2 text-center text-xs text-slate-500 bg-white/70 rounded-2xl border border-dashed border-orange-200 py-6">
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
    bookTimer.current = setTimeout(() => setBookState('booked'), 900);
  };

  useEffect(() => () => clearTimeout(bookTimer.current), []);

  // Scripted walkthrough while auto-playing: pick a date → pick a time → book
  useEffect(() => {
    if (!autoPlay) return undefined;
    const timers = [
      setTimeout(() => setDateIdx(1), 900),
      setTimeout(() => setTime('5:00 PM'), 1900),
      setTimeout(() => book(), 2900)
    ];
    return () => timers.forEach(clearTimeout);
  }, [autoPlay]);

  const resetIfBooked = () => {
    if (bookState !== 'idle') setBookState('idle');
  };

  const canBook = dateIdx !== null && time && bookState === 'idle';

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-orange-100 text-left">
      {/* Mentor header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar mentor={PRIMARY_MENTOR} size="w-10 h-10 text-sm" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 truncate">{PRIMARY_MENTOR.name}</div>
            <div className="text-[10px] text-slate-400 font-medium truncate">{PRIMARY_MENTOR.role}</div>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-[#C2410C] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
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
              className={`flex flex-col items-start gap-1 p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isOn ? 'bg-orange-50/80 border-orange-300 shadow-xs' : 'bg-slate-50 border-slate-100 hover:border-orange-200'
              }`}
            >
              <s.icon className={`w-4 h-4 ${s.iconClass}`} aria-hidden="true" />
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
              className={`relative py-1.5 rounded-xl border text-center transition-colors duration-200 cursor-pointer ${
                isOn ? 'text-white border-[#DE5C2B]' : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
              }`}
            >
              {isOn && (
                <motion.span
                  layoutId="demo-date-pill"
                  className="absolute inset-0 rounded-[11px] bg-[#DE5C2B]"
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
              className={`py-1.5 rounded-lg border text-[11px] font-bold transition-colors duration-200 ${
                t.taken
                  ? 'bg-slate-50 text-slate-300 border-slate-100 line-through cursor-not-allowed'
                  : isOn
                    ? 'bg-[#111111] text-white border-[#111111] cursor-pointer'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 cursor-pointer'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Book CTA */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-slate-400 font-medium min-w-0">
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
          className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors duration-200 ${
            bookState === 'booked'
              ? 'bg-emerald-600 text-white'
              : canBook || bookState === 'booking'
                ? 'bg-[#111111] text-white hover:bg-[#DE5C2B] cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-orange-100 text-left">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarCheck className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
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
      <div className="space-y-2 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
        {CHAT_LINES.map((line, idx) => {
          const isMentor = line.from === 'mentor';
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + idx * 0.65, duration: 0.3 }}
              className={`flex ${isMentor ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-[11.5px] leading-snug font-medium ${
                  isMentor
                    ? 'bg-white text-slate-800 border border-orange-100 rounded-bl-md'
                    : 'bg-[#DE5C2B] text-white rounded-br-md'
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
    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-orange-100/60">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        What You&apos;ll Get
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
        {[
          { icon: GraduationCap, text: 'Application strategy' },
          { icon: FileText, text: 'SOP & resume tips' },
          { icon: Globe, text: 'Visa & interview prep' },
          { icon: CheckCircle2, text: 'Real campus experience' }
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
            <item.icon className="w-3.5 h-3.5 text-[#DE5C2B] flex-shrink-0" aria-hidden="true" />
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

  return (
    <MotionConfig reducedMotion="never">
      <section
        ref={sectionRef}
        id="how-it-works"
        className="bg-white py-14 sm:py-20 px-4 sm:px-6 lg:px-12 relative overflow-hidden border-b border-slate-100"
      >
        <div className="max-w-[1340px] mx-auto">

          {/* ── TWO-COLUMN INTERACTIVE SHOWCASE ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

            {/* ════════ LEFT COLUMN: HEADER + NUMBERED ACCORDION STEPS ════════ */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* ── SECTION HEADER ── */}
              <div className="max-w-xl">
                <h2 className="font-outfit text-3xl sm:text-5xl lg:text-5xl font-black text-[#111111] tracking-tight leading-[1.12] mb-3">
                  How UniCoach <br className="hidden sm:inline" />
                  <span className="text-[#DE5C2B] font-extrabold">Works</span>
                </h2>
                <p className="text-slate-600 text-sm sm:text-base font-normal mb-3">
                  From discovery to expert guidance — in 3 simple steps
                </p>
              </div>

              {/* Accordion Steps */}
              <div className="space-y-1.5 pt-2">
                {STEPS.map((step) => {
                  const isActive = activeStep === step.id;

                  return (
                    <div
                      key={step.id}
                      className={`relative overflow-hidden rounded-2xl transition-all duration-200 border ${
                        isActive
                          ? 'bg-orange-50/70 border-orange-200/80 shadow-xs'
                          : 'bg-transparent border-transparent hover:bg-slate-50'
                      }`}
                    >
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
                          className={`w-full flex items-center justify-between gap-3 text-left cursor-pointer ${
                            isActive ? 'px-3.5 sm:px-4 pt-3.5 sm:pt-4' : 'p-2.5 sm:p-3'
                          }`}
                        >
                          <span className="flex items-center gap-3.5">
                            <span className={`text-xs font-mono font-bold ${isActive ? 'text-[#DE5C2B]' : 'text-slate-400'}`}>
                              {step.number}
                            </span>
                            <span className="font-outfit text-sm sm:text-base font-black text-slate-900">
                              {step.title}
                            </span>
                          </span>

                          <ChevronDown
                            className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                              isActive ? 'rotate-180 text-[#DE5C2B]' : ''
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      </h3>

                      {/* Expanded Description when active */}
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 pl-10 sm:pl-11 pr-4 pb-3.5 sm:pb-4"
                        >
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            {step.shortDesc}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {step.fullDesc}
                          </p>
                        </motion.div>
                      )}

                      {/* Auto-play progress bar */}
                      {isActive && isAutoPlaying && (
                        <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-orange-100/70" aria-hidden="true">
                          <motion.div
                            key={`progress-${step.id}`}
                            className="h-full bg-[#DE5C2B] origin-left"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isRunning ? 1 : 0 }}
                            transition={{ duration: isRunning ? STEP_DURATION_MS / 1000 : 0.2, ease: 'linear' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ════════ RIGHT COLUMN: INTERACTIVE STUDENT-PERSPECTIVE DEMO ════════ */}
            <div className="lg:col-span-6 lg:sticky lg:top-28">
              <div
                id="how-it-works-demo"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onFocusCapture={() => setHovering(true)}
                onBlurCapture={() => setHovering(false)}
                className="bg-[#FAF0EB] rounded-[36px] p-4 sm:p-8 sm:min-h-[460px] flex flex-col justify-center relative shadow-inner shadow-orange-100/50 border border-orange-200/50"
              >
                <span className="absolute top-3.5 right-5 text-[10px] font-semibold uppercase tracking-wider text-orange-900/40 select-none">
                  Interactive preview
                </span>

                <div className="relative min-h-[340px] flex items-center justify-center pt-4 sm:pt-2" aria-labelledby={`how-step-${activeStep}`} role="region">
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
              </div>
            </div>

          </div>

        </div>
      </section>
    </MotionConfig>
  );
};
