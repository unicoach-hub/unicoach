// ════════════════════════════════════════════════════════════════════════════════
// MentorFlashSection.jsx — Mentor-facing "Create in a Flash" showcase for /unicoach/for-mentors
// Left: numbered feature list (auto-advances). Right: a small animated story per feature,
// built only from things the platform really does.
// Desi Pop: flat mustard section, ink-bordered active feature and demo panel (no hover pause).
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

const INK = '#16130F';
const CARD = 'bg-white rounded-[16px] border-2 border-[#16130F] shadow-[3px_3px_0_#16130F]';
const SCENE_MS = 4800; // how long each feature plays before auto-advancing

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
  { id: 'orange', hex: '#DE5C2B' },
  { id: 'rani', hex: '#B8285B' },
  { id: 'teal', hex: '#14837E' },
  { id: 'indigo', hex: '#2B3FA0' },
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
  <span className={`${size} rounded-full text-white font-black flex items-center justify-center shrink-0 border-2 border-[#16130F]`} style={{ backgroundColor: color }}>
    {name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
  </span>
);

// ── 01 · 1:1 session: student picks a slot → pays → gets the meeting link → you earn ──
const SessionScene = ({ accent, running, reduced }) => {
  const step = useSceneStep(5, running, 700);
  const slots = ['Fri · 6:00 PM', 'Sat · 7:00 PM', 'Sun · 11:00 AM'];
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 items-start text-left">
      <div className={`${CARD} p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <Video className="w-4 h-4" style={{ color: accent }} />
          <span className="text-xs font-black text-[#16130F]">45-min Admit Strategy Call</span>
        </div>
        <div className="space-y-1.5">
          {slots.map((s, i) => {
            const picked = step >= 1 && i === 1;
            return (
              <motion.div
                key={s}
                animate={{ scale: picked ? 1.03 : 1 }}
                className="flex items-center justify-between px-3 py-2 rounded-xl border-2 text-[11.5px] font-bold transition-colors"
                style={picked ? { backgroundColor: accent, borderColor: INK, color: '#fff' } : { borderColor: '#16130F26', color: INK }}
              >
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{s}</span>
                {picked && <Check className="w-3.5 h-3.5" />}
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 pt-2.5 border-t-2 border-dashed border-[#16130F]/20 flex items-center justify-between">
          <span className="font-urbanist text-base font-black text-[#16130F]">₹999</span>
          <span className="text-[10px] font-bold text-[#5B544A]">Asia/Kolkata · 15 min buffer</span>
        </div>
      </div>

      <div className="space-y-2">
        <Appear show={step >= 2} className={`${CARD} px-3.5 py-2.5 flex items-center gap-2.5`}>
          <CheckCircle2 className="w-4 h-4 text-[#14837E] shrink-0" />
          <span className="text-[11.5px] font-bold text-[#16130F]">Payment received · <span className="text-[#14837E]">₹999</span></span>
        </Appear>
        <Appear show={step >= 3} className={`${CARD} px-3.5 py-2.5 flex items-center gap-2.5`}>
          <Video className="w-4 h-4 shrink-0" style={{ color: accent }} />
          <span className="text-[11.5px] font-bold text-[#16130F]">Meeting link sent to Ananya</span>
        </Appear>
        <Appear show={step >= 4} className="rounded-[16px] p-3.5 text-white border-2 border-[#16130F] shadow-[3px_3px_0_#16130F]" style={{ backgroundColor: accent }} from={18}>
          <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">Added to your earnings</span>
          <div className="font-urbanist text-2xl font-black leading-tight">
            <CountUp value={999} prefix="+₹" reduced={reduced} />
          </div>
        </Appear>
      </div>
    </div>
  );
};

// ── 02 · Priority DM: question → paid → reply window → your answer ──
const DmScene = ({ accent, running }) => {
  const step = useSceneStep(5, running, 700);
  return (
    <div className={`w-full ${CARD} p-4 sm:p-5 text-left`}>
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16130F] bg-[#FFF1B8] px-2.5 py-1 rounded-md border-2 border-[#16130F]">
          <MessageSquare className="w-3.5 h-3.5" style={{ color: accent }} />
          Priority DM · ₹199
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={step >= 4 ? 'done' : 'due'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border-2 border-[#16130F] ${step >= 4 ? 'text-white bg-[#14837E]' : 'text-[#16130F] bg-[#F2B705]'}`}
          >
            {step >= 4 ? '✓ Answered in 6h' : '⏱ Reply within 24h'}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="space-y-2.5 min-h-[170px]">
        <div className="flex items-end gap-2">
          <Initials name="Rahul Verma" color="#64748B" />
          {step === 0 ? (
            <div className="bg-[#FFF6E5] border-2 border-[#16130F] rounded-2xl rounded-bl-md px-3.5 py-2.5 flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="w-1.5 h-1.5 rounded-full bg-[#16130F]/50" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }} />
              ))}
            </div>
          ) : (
            <Appear show className="bg-[#FFF6E5] border-2 border-[#16130F] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[11.5px] font-medium text-[#16130F] max-w-[85%]">
              Do my 8.2 CGPA and GRE 318 work for TU Munich MSc Informatics?
            </Appear>
          )}
        </div>

        <Appear show={step >= 2} className="flex justify-center">
          <span className="text-[10.5px] font-bold text-white bg-[#14837E] border-2 border-[#16130F] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <IndianRupee className="w-3 h-3" /> 199 paid · question is in your dashboard
          </span>
        </Appear>

        <Appear show={step >= 3} className="flex items-end gap-2 justify-end">
          <div className="rounded-2xl rounded-br-md px-3.5 py-2.5 text-[11.5px] font-medium text-white max-w-[85%] border-2 border-[#16130F]" style={{ backgroundColor: accent }}>
            Yes, 8.2 is competitive. Focus your SOP on your systems projects, and here is how to frame them…
          </div>
          <Initials name="You" color={INK} />
        </Appear>
      </div>
    </div>
  );
};

// ── 03 · Dashboard: counters rise, new bookings slide in ──
const BOOKINGS = [
  { name: 'Ananya Iyer', what: '1:1 Call · Sat 7 PM', status: 'Confirmed', tone: 'text-white bg-[#14837E]' },
  { name: 'Rahul Verma', what: 'Priority DM · TU Munich', status: 'Answer due', tone: 'text-[#16130F] bg-[#F2B705]' },
  { name: 'Sneha Kapoor', what: 'SOP Review · Oxford', status: 'In review', tone: 'text-white bg-[#2B3FA0]' },
];
const DashboardScene = ({ accent, running, reduced }) => {
  const step = useSceneStep(4, running, 850);
  const visible = BOOKINGS.slice(0, step);
  return (
    <div className={`w-full ${CARD} p-4 sm:p-5 text-left space-y-3`}>
      <div className="flex items-center justify-between border-b-2 border-dashed border-[#16130F]/20 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-[#FFF1B8] border-2 border-[#16130F] flex items-center justify-center" style={{ color: accent }}>
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black text-[#16130F] block leading-tight truncate">Your mentor dashboard</span>
            <span className="text-[10px] text-[#5B544A] font-medium block truncate">Bookings, questions & earnings</span>
          </div>
        </div>
        <motion.span
          key={step}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#16130F] bg-[#FFF6E5] px-2.5 py-0.5 rounded-full border-2 border-[#16130F]"
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
          <div key={k.label} className="min-w-0 bg-[#FFF6E5] px-1 py-2 sm:p-2 rounded-xl border-2 border-[#16130F] text-center">
            <span className="text-[8.5px] sm:text-[9px] uppercase font-bold text-[#5B544A] block whitespace-nowrap">{k.label}</span>
            <span className="font-urbanist text-[13px] sm:text-sm font-black text-[#16130F] whitespace-nowrap">
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
              className="flex items-center justify-between p-2 rounded-xl bg-[#FFF6E5] border-2 border-[#16130F]/20"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Initials name={b.name} color={i === 0 ? accent : '#8A8174'} />
                <div className="truncate">
                  <span className="font-bold text-[#16130F] block truncate leading-tight text-[11.5px]">{b.name}</span>
                  <span className="text-[10px] text-[#5B544A] truncate">{b.what}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border-2 border-[#16130F] ${b.tone}`}>{b.status}</span>
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
  const step = useSceneStep(4, running, 950);
  const yourRank = 3 - step; // 3 → 0
  const order = [...OTHERS];
  order.splice(Math.max(0, yourRank), 0, { id: 'you', name: 'Your Name', meta: 'Ireland · Trinity' });
  const reviews = [0, 3, 9, 14][step];
  return (
    <div className={`w-full ${CARD} p-4 text-left`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black text-[#16130F]">UniCoach mentor directory</span>
        <span className="text-[10px] font-bold text-[#5B544A]">Sorted by: Top rated</span>
      </div>
      <div className="space-y-1.5">
        {order.map((m, i) => {
          const you = m.id === 'you';
          return (
            <motion.div
              key={m.id}
              layout
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className={`flex items-center justify-between p-2 rounded-xl border-2 ${you ? 'bg-white shadow-[3px_3px_0_#16130F]' : 'bg-[#FFF6E5] border-[#16130F]/20'}`}
              style={you ? { borderColor: accent } : undefined}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 text-[10px] font-black text-[#5B544A]">#{i + 1}</span>
                <Initials name={m.name} color={you ? accent : '#8A8174'} />
                <div className="truncate">
                  <span className="font-bold text-[#16130F] block truncate leading-tight text-[11.5px]">{m.name}</span>
                  <span className="text-[10px] text-[#5B544A]">{m.meta}</span>
                </div>
              </div>
              {you ? (
                <span className="text-[10.5px] font-bold text-[#16130F] inline-flex items-center gap-1 shrink-0">
                  {reviews > 0 ? (<><Star className="w-3 h-3 fill-[#F2B705] text-[#16130F]" /> 4.9 ({reviews})</>) : (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#F2B705] border-2 border-[#16130F] text-[#16130F]">New</span>
                  )}
                </span>
              ) : (
                <span className="text-[10.5px] font-bold text-[#5B544A] inline-flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 fill-[#F2B705] text-[#F2B705]" /> 4.6
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      <Appear show={step >= 1} className="mt-3 flex items-center gap-2 text-[11px] font-bold text-[#14837E]">
        <TrendingUp className="w-3.5 h-3.5" /> New 5★ review from a verified booking: you move up
      </Appear>
    </div>
  );
};

// ── 05 · Session pack: three sessions bundle into one checkout ──
const BundleScene = ({ accent, running }) => {
  const step = useSceneStep(4, running, 850);
  return (
    <div className={`w-full ${CARD} p-5 text-left`}>
      <div className="inline-flex items-center gap-1 bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] text-[10px] font-bold px-2 py-0.5 rounded-md mb-3 -rotate-2">
        <Package className="w-3 h-3" /> SESSION PACK
      </div>
      <div className="flex items-center gap-2 mb-4 min-h-[58px]">
        {[1, 2, 3].map((n) => (
          <motion.div
            key={n}
            animate={step >= 1 ? { x: (2 - n) * 18, rotate: (n - 2) * 4 } : { x: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: n * 0.05 }}
            className="flex-1 rounded-xl border-2 border-dashed px-2.5 py-2 bg-white text-center"
            style={{ borderColor: step >= 1 ? accent : '#16130F40' }}
          >
            <Video className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: accent }} />
            <span className="text-[10.5px] font-bold text-[#16130F] block">Session {n}</span>
          </motion.div>
        ))}
      </div>
      <h4 className="font-urbanist text-base font-black text-[#16130F] leading-tight mb-1">Germany Admit Mentorship · 3 calls</h4>
      <p className="text-[11px] text-[#5B544A] mb-3">Profile review → SOP strategy → Visa & APS prep</p>
      <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-[#16130F]/20">
        <div className="flex items-baseline gap-1.5">
          <motion.span animate={{ opacity: step >= 2 ? 0.5 : 1 }} className={`text-xs text-[#5B544A] ${step >= 2 ? 'line-through' : ''}`}>₹2,997</motion.span>
          <Appear show={step >= 2} className="font-urbanist text-lg font-black text-[#16130F]">₹2,499</Appear>
        </div>
        <motion.span
          animate={step >= 3 ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.5 }}
          className="px-4 py-2 rounded-full text-white text-xs font-bold border-2 border-[#16130F] shadow-[2px_2px_0_#16130F]"
          style={{ backgroundColor: step >= 3 ? '#14837E' : INK }}
        >
          {step >= 3 ? '✓ Pack booked' : 'Book pack'}
        </motion.span>
      </div>
    </div>
  );
};

// ── 06 · Digital product: locked file → payment → secure download ──
const ProductScene = ({ accent, running }) => {
  const step = useSceneStep(4, running, 850);
  const unlocked = step >= 2;
  return (
    <div className={`w-full ${CARD} p-5 text-left`}>
      <div className="flex items-start gap-3.5 mb-4">
        <motion.div
          animate={unlocked ? { rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white border-2 border-[#16130F]"
          style={{ backgroundColor: unlocked ? '#14837E' : accent }}
        >
          {unlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </motion.div>
        <div>
          <h4 className="font-urbanist text-sm font-black text-[#16130F] leading-tight">Ireland SOP Template Pack 2026</h4>
          <span className="text-[11px] text-[#5B544A] font-medium">PDF · 3 sample SOPs + checklist</span>
        </div>
      </div>
      <div className="space-y-1.5 mb-4 min-h-[76px]">
        <Appear show={step >= 1} className="bg-[#FFF6E5] px-3 py-2 rounded-xl border-2 border-[#16130F]/20 text-[11px] font-bold text-[#16130F] flex items-center gap-2">
          <IndianRupee className="w-3.5 h-3.5 text-[#14837E]" /> Student paid ₹299
        </Appear>
        <Appear show={step >= 2} className="bg-[#DDF3EF] px-3 py-2 rounded-xl border-2 border-[#16130F] text-[11px] font-bold text-[#16130F] flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked for this student only, via a link that expires in minutes
        </Appear>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-urbanist text-base font-black text-[#16130F]">₹299</span>
        <motion.span
          animate={step >= 3 ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 0.6, repeat: step >= 3 ? Infinity : 0 }}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 border-2 border-[#16130F] ${unlocked ? 'text-white shadow-[2px_2px_0_#16130F]' : 'text-[#16130F]/50'}`}
          style={{ backgroundColor: unlocked ? '#14837E' : '#EDE4D3' }}
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
  const [selectedTheme, setSelectedTheme] = useState('orange');
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
    <section ref={sectionRef} className="bg-[#F2B705] py-10 sm:py-14 px-4 sm:px-6 lg:px-10 relative overflow-hidden select-none">
      <div className="max-w-[1320px] mx-auto">
        {/* ════════ HEADER ════════ */}
        <div className="text-center max-w-[760px] mx-auto">
          <p className="font-urbanist font-extrabold text-[16px] text-[#B8285B]">Apna page, jhatpat</p>
          <h2 className="mt-1 font-urbanist text-[32px] sm:text-[44px] font-black text-[#16130F] leading-[0.98] tracking-[-0.045em]">
            Create your UniCoach page in a flash
          </h2>
          <p className="mt-2 text-[16px] sm:text-[17px] font-medium text-[#16130F]/80">
            One link for everything you offer juniors: calls, questions, packs and guides.
          </p>
        </div>

        {/* Mobile order: header → animated preview → feature list. Desktop: list left, preview right. */}
        <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 lg:gap-10 items-center">

          {/* ════════ NUMBERED FEATURE LIST ════════ */}
          <div className="order-2 lg:order-1 min-w-0 text-left">
            <div className="flex flex-col gap-1.5" role="tablist" aria-label="UniCoach mentor features">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectTab(tab.id)}
                    className={`relative w-full text-left rounded-[18px] transition-all duration-200 cursor-pointer overflow-hidden px-3.5 sm:px-4 py-2.5 no-shine ${
                      isActive ? 'bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F]' : 'border-[3px] border-transparent hover:bg-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`shrink-0 grid place-items-center w-9 h-9 rounded-[10px] border-2 border-[#16130F] font-urbanist text-[13px] font-black tabular-nums transition-all ${
                            isActive ? 'bg-[#DE5C2B] text-white -rotate-6' : 'bg-white/70 text-[#16130F]'
                          }`}
                        >
                          {tab.number}
                        </span>
                        <h3 className="font-urbanist text-[17px] sm:text-[19px] font-black text-[#16130F] tracking-[-0.02em] leading-tight">{tab.title}</h3>
                      </div>
                      <ChevronDown className={`w-4 h-4 shrink-0 text-[#16130F] transition-transform duration-300 ${isActive ? 'rotate-180' : 'opacity-60'}`} />
                    </div>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className="mt-1.5 pl-12 pr-1 pb-1"
                      >
                        <p className="text-[15px] font-medium text-[#16130F] leading-snug">{tab.shortDesc}</p>
                        <p className="text-[15px] text-[#5B544A] mt-1 leading-snug">{tab.fullDesc}</p>
                      </motion.div>
                    )}

                    {/* Auto-play progress along the bottom of the active card */}
                    {isActive && cycling && (
                      <span className="absolute left-5 right-5 bottom-0 h-[3px] rounded-full bg-[#FFF6E5]" aria-hidden="true">
                        <motion.span
                          key={`progress-${tab.id}`}
                          className="block h-full rounded-full bg-[#DE5C2B] origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: SCENE_MS / 1000, ease: 'linear' }}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <Link
              to="/unicoach/apply"
              className="mt-5 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#16130F] text-white text-[15px] font-bold border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform"
            >
              <span>Launch your page</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ════════ ANIMATED STORY FOR THE ACTIVE FEATURE ════════ */}
          <div className="order-1 lg:order-2 min-w-0">
            <div className="rounded-[24px] bg-[#FFF6E5] p-4 sm:p-6 border-[3px] border-[#16130F] shadow-[8px_8px_0_#16130F] flex flex-col">

              {/* Your page bar */}
              <div className="bg-white rounded-[16px] p-3 sm:p-3.5 mb-4 flex items-center justify-between gap-3 border-2 border-[#16130F]">
                <div className="flex items-center gap-3 min-w-0">
                  <Initials name="Your Name" color={activeColorHex} size="w-11 h-11 text-sm" />
                  <div className="min-w-0">
                    <div className="font-urbanist text-sm font-black text-[#16130F] leading-tight">Your Name</div>
                    <div className="text-[11px] font-semibold text-[#5B544A] truncate">unicoach.com/@yourname</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {THEME_COLORS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTheme(t.id)}
                      className={`w-6 h-6 rounded-md border-2 border-[#16130F] flex items-center justify-center transition-transform cursor-pointer no-shine ${
                        selectedTheme === t.id ? 'scale-110 -rotate-6 shadow-[2px_2px_0_#16130F]' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: t.hex }}
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
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <Scene accent={activeColorHex} running={playing} reduced={reduced} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <p className="text-center text-[13px] font-semibold text-[#5B544A] mt-3">Illustrative preview of a mentor page</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
