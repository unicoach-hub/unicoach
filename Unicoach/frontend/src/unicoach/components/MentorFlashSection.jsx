// ════════════════════════════════════════════════════════════════════════════════
// MentorFlashSection.jsx — Mentor-facing "Create in a Flash" showcase for /unicoach/for-mentors
// Left: numbered feature list (auto-advances). Right: a small animated story per feature,
// built only from things the platform really does.
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronDown,
  Check,
  Video,
  MessageSquare,
  Calendar,
  Package,
  Download,
  Lock,
  Unlock,
  Star,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  LayoutDashboard,
  Bell,
} from 'lucide-react';

const SCENE_MS = 7000; // how long each feature plays before auto-advancing

const TABS = [
  {
    id: 0,
    number: '01',
    title: 'Offer 1:1 sessions',
    shortDesc: 'Video consultations, admission strategy calls, mock interviews: do what you do best.',
    fullDesc: 'Set your price, open your slots and add intake questions. Time zones and buffer time between calls are handled for you.',
  },
  {
    id: 1,
    number: '02',
    title: 'Get paid for Priority DMs',
    shortDesc: 'Stop answering "quick questions" for free. Students pay to ask, you reply when it suits you.',
    fullDesc: 'You choose the reply window (24, 48 or 72 hours). No calendar slot needed.',
  },
  {
    id: 2,
    number: '03',
    title: 'Every student in one dashboard',
    shortDesc: 'Bookings, intake answers, pending questions and earnings in one place.',
    fullDesc: 'See who booked, what they need help with, what is due next and how much you have earned.',
  },
  {
    id: 3,
    number: '04',
    title: 'Get discovered by students',
    shortDesc: 'Your page is listed in the UniCoach mentor directory that students browse.',
    fullDesc: 'Mentors are ranked by verified student reviews, so great sessions move you up the list.',
  },
  {
    id: 4,
    number: '05',
    title: 'Sell session packs',
    shortDesc: 'Offer 3 or 5 session packages for students who need ongoing guidance.',
    fullDesc: 'One checkout, multiple sessions: more value for the student and more predictable income for you.',
  },
  {
    id: 5,
    number: '06',
    title: 'Sell guides & templates',
    shortDesc: 'SOP templates, visa checklists, university shortlists: upload once, earn while you study.',
    fullDesc: 'Files stay locked and are unlocked only for paying students, through secure expiring download links.',
  },
];

const THEME_COLORS = [
  { id: 'coral', bg: 'bg-[#DE5C2B]', hex: '#DE5C2B' },
  { id: 'yellow', bg: 'bg-[#EAB308]', hex: '#EAB308' },
  { id: 'purple', bg: 'bg-[#8B5CF6]', hex: '#8B5CF6' },
  { id: 'teal', bg: 'bg-[#10B981]', hex: '#10B981' },
];

// Steps 0..count-1 at a fixed pace while `running`; stays on the last step until the scene changes
const useSceneStep = (count, running, stepMs) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, count - 1)), stepMs);
    return () => clearInterval(t);
  }, [count, running, stepMs]);
  return running ? step : count - 1;
};

// Number that counts up from its previous value (0 on first render) to `value`
const CountUp = ({ value, prefix = '', duration = 1.2, reduced }) => {
  const [shown, setShown] = useState(reduced ? value : 0);
  const fromRef = useRef(0);
  useEffect(() => {
    if (reduced) return undefined;
    const controls = animate(fromRef.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setShown(Math.round(v)),
      onComplete: () => { fromRef.current = value; },
    });
    return () => controls.stop();
  }, [value, duration, reduced]);
  return <>{prefix}{(reduced ? value : shown).toLocaleString('en-IN')}</>;
};

const Appear = ({ show, children, className = '', style, from = 12 }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: from, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const Initials = ({ name, color = '#DE5C2B', size = 'w-7 h-7 text-[10px]' }) => (
  <span className={`${size} rounded-full text-white font-black flex items-center justify-center shrink-0`} style={{ backgroundColor: color }}>
    {name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
  </span>
);

// ── 01 · 1:1 session: student picks a slot → pays → gets the meeting link → you earn ──
const SessionScene = ({ accent, running, reduced }) => {
  const step = useSceneStep(5, running, 1150);
  const slots = ['Fri · 6:00 PM', 'Sat · 7:00 PM', 'Sun · 11:00 AM'];
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 items-start text-left">
      <div className="bg-white rounded-2xl p-4 shadow-md border border-orange-100">
        <div className="flex items-center gap-2 mb-3">
          <Video className="w-4 h-4" style={{ color: accent }} />
          <span className="text-xs font-black text-slate-900">45-min Admit Strategy Call</span>
        </div>
        <div className="space-y-1.5">
          {slots.map((s, i) => {
            const picked = step >= 1 && i === 1;
            return (
              <motion.div
                key={s}
                animate={{ scale: picked ? 1.03 : 1 }}
                className="flex items-center justify-between px-3 py-2 rounded-xl border text-[11.5px] font-bold transition-colors"
                style={picked ? { backgroundColor: accent, borderColor: accent, color: '#fff' } : { borderColor: '#E2E8F0', color: '#334155' }}
              >
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{s}</span>
                {picked && <Check className="w-3.5 h-3.5" />}
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="font-outfit text-base font-black text-slate-900">₹999</span>
          <span className="text-[10px] font-bold text-slate-400">Asia/Kolkata · 15 min buffer</span>
        </div>
      </div>

      <div className="space-y-2">
        <Appear show={step >= 2} className="bg-white px-3.5 py-2.5 rounded-xl shadow-sm border border-emerald-100 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[11.5px] font-bold text-slate-800">Payment received · <span className="text-emerald-600">₹999</span></span>
        </Appear>
        <Appear show={step >= 3} className="bg-white px-3.5 py-2.5 rounded-xl shadow-sm border border-orange-100 flex items-center gap-2.5">
          <Video className="w-4 h-4 shrink-0" style={{ color: accent }} />
          <span className="text-[11.5px] font-bold text-slate-800">Meeting link sent to Ananya</span>
        </Appear>
        <Appear show={step >= 4} className="rounded-xl p-3.5 text-white shadow-md" style={{ backgroundColor: accent }} from={18}>
          <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">Added to your earnings</span>
          <div className="font-outfit text-2xl font-black leading-tight">
            <CountUp value={999} prefix="+₹" reduced={reduced} />
          </div>
        </Appear>
      </div>
    </div>
  );
};

// ── 02 · Priority DM: question → paid → reply window → your answer ──
const DmScene = ({ accent, running }) => {
  const step = useSceneStep(5, running, 1150);
  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-orange-100 text-left">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
          <MessageSquare className="w-3.5 h-3.5" style={{ color: accent }} />
          Priority DM · ₹199
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={step >= 4 ? 'done' : 'due'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${step >= 4 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}
          >
            {step >= 4 ? '✓ Answered in 6h' : '⏱ Reply within 24h'}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="space-y-2.5 min-h-[170px]">
        <div className="flex items-end gap-2">
          <Initials name="Rahul Verma" color="#64748B" />
          {step === 0 ? (
            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }} />
              ))}
            </div>
          ) : (
            <Appear show className="bg-slate-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[11.5px] font-medium text-slate-700 max-w-[85%]">
              Do my 8.2 CGPA and GRE 318 work for TU Munich MSc Informatics?
            </Appear>
          )}
        </div>

        <Appear show={step >= 2} className="flex justify-center">
          <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <IndianRupee className="w-3 h-3" /> 199 paid · question is in your dashboard
          </span>
        </Appear>

        <Appear show={step >= 3} className="flex items-end gap-2 justify-end">
          <div className="rounded-2xl rounded-br-md px-3.5 py-2.5 text-[11.5px] font-medium text-white max-w-[85%]" style={{ backgroundColor: accent }}>
            Yes, 8.2 is competitive. Focus your SOP on your systems projects, and here is how to frame them…
          </div>
          <Initials name="You" color="#111111" />
        </Appear>
      </div>
    </div>
  );
};

// ── 03 · Dashboard: counters rise, new bookings slide in ──
const BOOKINGS = [
  { name: 'Ananya Iyer', what: '1:1 Call · Sat 7 PM', status: 'Confirmed', tone: 'text-emerald-700 bg-emerald-100/80' },
  { name: 'Rahul Verma', what: 'Priority DM · TU Munich', status: 'Answer due', tone: 'text-amber-700 bg-amber-100/80' },
  { name: 'Sneha Kapoor', what: 'SOP Review · Oxford', status: 'In review', tone: 'text-indigo-700 bg-indigo-100/80' },
];
const DashboardScene = ({ accent, running, reduced }) => {
  const step = useSceneStep(4, running, 1300);
  const visible = BOOKINGS.slice(0, step);
  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-orange-100 text-left space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100/80 flex items-center justify-center" style={{ color: accent }}>
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 block leading-tight">Your mentor dashboard</span>
            <span className="text-[10px] text-slate-400 font-medium">Bookings, questions & earnings</span>
          </div>
        </div>
        <motion.span
          key={step}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200"
        >
          <Bell className="w-3 h-3" style={{ color: accent }} /> {visible.length} new
        </motion.span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bookings', value: 12 + visible.length, prefix: '' },
          { label: 'This month', value: 18400 + visible.length * 999, prefix: '₹' },
          { label: 'Rating', text: '4.9 ★' },
        ].map((k) => (
          <div key={k.label} className="bg-[#FAF9F6] p-2 rounded-xl border border-slate-100 text-center">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">{k.label}</span>
            <span className="font-outfit text-sm font-black text-slate-900">
              {k.text || <CountUp value={k.value} prefix={k.prefix} duration={0.6} reduced={reduced} />}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 min-h-[132px]">
        <AnimatePresence initial={false}>
          {[...visible].reverse().map((b, i) => (
            <motion.div
              key={b.name}
              layout
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Initials name={b.name} color={i === 0 ? accent : '#94A3B8'} />
                <div className="truncate">
                  <span className="font-bold text-slate-900 block truncate leading-tight text-[11.5px]">{b.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{b.what}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${b.tone}`}>{b.status}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── 04 · Discovery: reviews arrive and your card climbs the directory ──
const OTHERS = [
  { id: 'a', name: 'Karan Mehta', meta: 'UK · LSE' },
  { id: 'b', name: 'Isha Rao', meta: 'Canada · UofT' },
  { id: 'c', name: 'Dev Arora', meta: 'Germany · RWTH' },
];
const DiscoverScene = ({ accent, running }) => {
  const step = useSceneStep(4, running, 1500);
  const yourRank = 3 - step; // 3 → 0
  const order = [...OTHERS];
  order.splice(Math.max(0, yourRank), 0, { id: 'you', name: 'Your Name', meta: 'Ireland · Trinity' });
  const reviews = [0, 3, 9, 14][step];
  return (
    <div className="w-full bg-white rounded-2xl p-4 shadow-md border border-orange-100 text-left">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black text-slate-900">UniCoach mentor directory</span>
        <span className="text-[10px] font-bold text-slate-400">Sorted by: Top rated</span>
      </div>
      <div className="space-y-1.5">
        {order.map((m, i) => {
          const you = m.id === 'you';
          return (
            <motion.div
              key={m.id}
              layout
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className={`flex items-center justify-between p-2 rounded-xl border ${you ? 'bg-white shadow-md' : 'bg-slate-50/80 border-slate-100'}`}
              style={you ? { borderColor: accent } : undefined}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 text-[10px] font-black text-slate-400">#{i + 1}</span>
                <Initials name={m.name} color={you ? accent : '#94A3B8'} />
                <div className="truncate">
                  <span className="font-bold text-slate-900 block truncate leading-tight text-[11.5px]">{m.name}</span>
                  <span className="text-[10px] text-slate-500">{m.meta}</span>
                </div>
              </div>
              {you ? (
                <span className="text-[10.5px] font-bold text-slate-800 inline-flex items-center gap-1 shrink-0">
                  {reviews > 0 ? (<><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9 ({reviews})</>) : (
                    <span className="px-1.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#DE5C2B]">New</span>
                  )}
                </span>
              ) : (
                <span className="text-[10.5px] font-bold text-slate-500 inline-flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> 4.6
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      <Appear show={step >= 1} className="mt-3 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
        <TrendingUp className="w-3.5 h-3.5" /> New 5★ review from a verified booking: you move up
      </Appear>
    </div>
  );
};

// ── 05 · Session pack: three sessions bundle into one checkout ──
const BundleScene = ({ accent, running }) => {
  const step = useSceneStep(4, running, 1300);
  return (
    <div className="w-full bg-white rounded-2xl p-5 shadow-md border border-orange-100 text-left">
      <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md mb-3">
        <Package className="w-3 h-3" /> SESSION PACK
      </div>
      <div className="flex items-center gap-2 mb-4 min-h-[58px]">
        {[1, 2, 3].map((n) => (
          <motion.div
            key={n}
            animate={step >= 1 ? { x: (2 - n) * 18, rotate: (n - 2) * 4 } : { x: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: n * 0.05 }}
            className="flex-1 rounded-xl border-2 border-dashed px-2.5 py-2 bg-white text-center"
            style={{ borderColor: step >= 1 ? accent : '#CBD5E1' }}
          >
            <Video className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: accent }} />
            <span className="text-[10.5px] font-bold text-slate-700 block">Session {n}</span>
          </motion.div>
        ))}
      </div>
      <h4 className="font-outfit text-base font-black text-slate-900 leading-tight mb-1">Germany Admit Mentorship · 3 calls</h4>
      <p className="text-[11px] text-slate-500 mb-3">Profile review → SOP strategy → Visa & APS prep</p>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-baseline gap-1.5">
          <motion.span animate={{ opacity: step >= 2 ? 0.5 : 1 }} className={`text-xs text-slate-500 ${step >= 2 ? 'line-through' : ''}`}>₹2,997</motion.span>
          <Appear show={step >= 2} className="font-outfit text-lg font-black text-slate-900">₹2,499</Appear>
        </div>
        <motion.span
          animate={step >= 3 ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.5 }}
          className="px-4 py-2 rounded-full text-white text-xs font-bold"
          style={{ backgroundColor: step >= 3 ? '#059669' : '#111111' }}
        >
          {step >= 3 ? '✓ Pack booked' : 'Book pack'}
        </motion.span>
      </div>
    </div>
  );
};

// ── 06 · Digital product: locked file → payment → secure download ──
const ProductScene = ({ accent, running }) => {
  const step = useSceneStep(4, running, 1300);
  const unlocked = step >= 2;
  return (
    <div className="w-full bg-white rounded-2xl p-5 shadow-md border border-orange-100 text-left">
      <div className="flex items-start gap-3.5 mb-4">
        <motion.div
          animate={unlocked ? { rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white"
          style={{ backgroundColor: unlocked ? '#059669' : accent }}
        >
          {unlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </motion.div>
        <div>
          <h4 className="font-outfit text-sm font-black text-slate-900 leading-tight">Ireland SOP Template Pack 2026</h4>
          <span className="text-[11px] text-slate-500 font-medium">PDF · 3 sample SOPs + checklist</span>
        </div>
      </div>
      <div className="space-y-1.5 mb-4 min-h-[76px]">
        <Appear show={step >= 1} className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-2">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Student paid ₹299
        </Appear>
        <Appear show={step >= 2} className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 text-[11px] font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked for this student only, via a link that expires in minutes
        </Appear>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-outfit text-base font-black text-slate-900">₹299</span>
        <motion.span
          animate={step >= 3 ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 0.6, repeat: step >= 3 ? Infinity : 0 }}
          className="px-4 py-2 rounded-full text-white text-xs font-bold flex items-center gap-1.5"
          style={{ backgroundColor: unlocked ? '#059669' : '#CBD5E1' }}
        >
          <Download className="w-3.5 h-3.5" /> Download
        </motion.span>
      </div>
    </div>
  );
};

const SCENES = [SessionScene, DmScene, DashboardScene, DiscoverScene, BundleScene, ProductScene];

export const MentorFlashSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('coral');
  const [autoPlay, setAutoPlay] = useState(true);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const reduced = useReducedMotion();

  const activeColorHex = THEME_COLORS.find((c) => c.id === selectedTheme)?.hex || '#DE5C2B';
  const playing = inView && !reduced;
  const cycling = playing && autoPlay;

  // Auto-advance through the features until the visitor picks one themselves
  useEffect(() => {
    if (!cycling) return undefined;
    const t = setTimeout(() => setActiveTab((i) => (i + 1) % TABS.length), SCENE_MS);
    return () => clearTimeout(t);
  }, [activeTab, cycling]);

  const selectTab = (id) => {
    setAutoPlay(false);
    setActiveTab(id);
  };

  const Scene = SCENES[activeTab];

  return (
    <section ref={sectionRef} className="bg-white py-14 sm:py-20 px-4 sm:px-6 lg:px-12 relative overflow-hidden select-none border-b border-slate-100">
      <div className="max-w-[1340px] mx-auto">
        {/* Mobile order: header → animated preview → feature list. Desktop: header + list left, preview right. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-6 lg:gap-y-6 items-start">

          {/* ════════ HEADER ════════ */}
          <div className="order-1 lg:order-none lg:col-span-6 lg:col-start-1 lg:row-start-1 text-left">
            <div className="max-w-xl">
              <h2 className="font-outfit text-3xl sm:text-5xl lg:text-5xl font-black text-[#111111] tracking-tight leading-[1.12] mb-3">
                Create your UniCoach page in a <br className="hidden sm:inline" />
                <span className="text-[#DE5C2B] font-extrabold">flash</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-normal mb-3">
                One link for everything you offer juniors: calls, questions, packs and guides.
              </p>
              <Link
                to="/unicoach/apply"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 hover:text-[#DE5C2B] underline decoration-slate-400 underline-offset-4 transition-colors"
              >
                <span>Launch your page</span>
                <ArrowUpRight className="w-4 h-4 text-[#DE5C2B]" />
              </Link>
            </div>
          </div>

          {/* ════════ NUMBERED FEATURE LIST ════════ */}
          <div className="order-3 lg:order-none lg:col-span-6 lg:col-start-1 lg:row-start-2 text-left">
            <div className="space-y-1.5" role="tablist" aria-label="UniCoach mentor features">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectTab(tab.id)}
                    className={`relative w-full text-left rounded-2xl transition-all duration-200 border cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-orange-50/70 border-orange-200/80 p-3.5 sm:p-4 shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-slate-50 p-2.5 sm:p-3'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <span className={`text-xs font-mono font-bold ${isActive ? 'text-[#DE5C2B]' : 'text-slate-400'}`}>
                          {tab.number}
                        </span>
                        <h3 className="font-outfit text-sm sm:text-base font-black text-slate-900">{tab.title}</h3>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isActive ? 'rotate-180 text-[#DE5C2B]' : ''}`} />
                    </div>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 pl-7 pr-2"
                      >
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">{tab.shortDesc}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{tab.fullDesc}</p>
                      </motion.div>
                    )}

                    {/* Auto-play progress bar */}
                    {isActive && cycling && (
                      <motion.span
                        key={`progress-${tab.id}`}
                        className="absolute left-0 bottom-0 h-[3px] bg-[#DE5C2B]/70"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: SCENE_MS / 1000, ease: 'linear' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ════════ ANIMATED STORY FOR THE ACTIVE FEATURE ════════ */}
          <div className="order-2 lg:order-none lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-28">
            <div className="bg-[#FAF0EB] rounded-[36px] p-5 sm:p-8 sm:min-h-[480px] flex flex-col justify-center relative shadow-inner shadow-orange-100/50 border border-orange-200/50">

              {/* Your page bar */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-5 flex items-center justify-between gap-3 border border-orange-100/60">
                <div className="flex items-center gap-3 min-w-0">
                  <Initials name="Your Name" color={activeColorHex} size="w-11 h-11 text-sm" />
                  <div className="min-w-0">
                    <div className="font-outfit text-sm font-bold text-slate-900 leading-tight">Your Name</div>
                    <div className="text-[11px] font-semibold text-slate-400 truncate">unicoach.com/@yourname</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {THEME_COLORS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTheme(t.id)}
                      className={`w-6 h-6 rounded-md ${t.bg} flex items-center justify-center transition-transform cursor-pointer ${
                        selectedTheme === t.id ? 'scale-110 ring-2 ring-slate-900 shadow-xs' : 'opacity-80 hover:opacity-100'
                      }`}
                      aria-label={`Preview ${t.id} theme`}
                    >
                      {selectedTheme === t.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[300px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <Scene accent={activeColorHex} running={playing} reduced={reduced} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <p className="text-center text-[10px] font-semibold text-slate-400 mt-4">Illustrative preview of a mentor page</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
