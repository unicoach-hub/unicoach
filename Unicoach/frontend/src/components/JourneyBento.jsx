import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronRight, Check, Plane } from 'lucide-react';
import { useLead } from '../context/LeadContext';
import { RedPenCircle } from './ui/BrandElements';

// "Your study abroad journey in 4 steps" as a bento grid: four gradient cards with 3D illustrations
// (3dicons.co, CC0) and real campus photos. Step 1 opens the free counselling form; the others open their tool.
const ICON = (name) => `/images/3d/${name}.webp`;

const STEPS = {
  counselling: {
    step: '01',
    title: 'Personalized Counselling',
    text: 'One-on-one guidance to build a profile that shows your academics, achievements and goals, and a shortlist of universities that fit you.',
    cta: 'Book Free Counselling',
  },
  sop: {
    step: '02',
    title: 'SOP & Documents',
    text: 'Your SOP, LORs and resume written and polished by experts who have been through admissions themselves, line by line.',
    cta: 'Get your SOP done by an expert',
    to: '/unicoach',
  },
  loans: {
    step: '03',
    title: 'Loans & Funding',
    text: 'Compare education loans with or without collateral and find scholarships you qualify for, from first call to sanction letter.',
    cta: 'Check Loan Options',
    to: '/education-loan',
  },
  visa: {
    step: '04',
    title: 'Visa & Mocks',
    text: 'Practise real visa interview questions with our AI officer and counsellors, get documents checked, and sort housing before you fly.',
    cta: 'Practice a Visa Mock',
    to: '/ai-tools/visa-prep',
  },
};

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 40, scale: 0.96, filter: 'blur(8px)' },
  whileInView: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
});

// A 3D piece or chip that pops in after its card has arrived
const Pop = ({ children, delay = 0, from = 'scale', className = '', style }) => {
  const start = from === 'up' ? { opacity: 0, y: 24 } : { opacity: 0, scale: 0.3, rotate: -18 };
  const end = from === 'up' ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, rotate: 0 };
  return (
    <motion.div
      className={className}
      style={style}
      initial={start}
      whileInView={end}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 220, damping: 16, delay }}
    >
      {children}
    </motion.div>
  );
};

// Gentle up-and-down float for the 3D pieces
const Float = ({ children, delay = 0, distance = 8, className = '', style, enter = 0.35 }) => (
  <motion.div
    className={className}
    style={style}
    animate={{ y: [0, -distance, 0] }}
    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay }}
  >
    <Pop delay={enter + delay * 0.25}>{children}</Pop>
  </motion.div>
);

const CardText = ({ s, onAction, dark = false }) => (
  <div className="relative z-10 max-w-[380px]">
    <span className={`inline-flex items-center gap-1.5 mb-2.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wide ${dark ? 'bg-white/20 text-white' : 'bg-white/70 text-[#2A1A12]'}`}>
      STEP {s.step} OF 04
    </span>
    <h3 className={`font-outfit text-[22px] sm:text-[26px] font-bold tracking-[-0.03em] leading-[1.1] ${dark ? 'text-white' : 'text-[#2A1A12]'}`}>
      {s.title}
    </h3>
    <p className={`mt-2 text-[13.5px] sm:text-[14.5px] leading-relaxed ${dark ? 'text-white/85' : 'text-[#5A4636]'}`}>{s.text}</p>
    <button
      type="button"
      onClick={() => onAction(s)}
      className={`group mt-4 inline-flex items-center gap-1.5 text-[14px] sm:text-[15px] font-bold cursor-pointer ${dark ? 'text-white' : 'text-[#2A1A12]'}`}
    >
      {s.cta}
      <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
    </button>
  </div>
);

const Chip = ({ children, className = '', delay = 0.75 }) => (
  <motion.div
    className={`bg-white/95 backdrop-blur rounded-2xl shadow-[0_18px_40px_-12px_rgba(42,26,18,0.35)] border border-white ${className}`}
    initial={{ opacity: 0, y: 22, scale: 0.92 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ type: 'spring', stiffness: 200, damping: 18, delay }}
  >
    {children}
  </motion.div>
);

// Card that leans towards the cursor (3D tilt + a soft light following the mouse)
const TiltCard = ({ children, className = '', style, delay = 0 }) => {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 160, damping: 18 });
  const glow = useTransform([mx, my], ([x, y]) => `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.35), transparent 60%)`);
  return (
    <motion.div
      {...rise(delay)}
      className={className}
      style={{ ...style, rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}
    >
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]" style={{ background: glow }} />
      {children}
    </motion.div>
  );
};

// Counts 0,1,2… every `ms` while the card is on screen (and not hovered), so each card plays a short loop
const useLoop = (ms) => {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-40px' });
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touched, setTouched] = useState(false); // visitor took over: stop auto-play for a while
  useEffect(() => {
    if (!inView || paused || touched) return undefined;
    const t = setInterval(() => setTick((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [inView, paused, touched, ms]);
  useEffect(() => {
    if (!touched) return undefined;
    const t = setTimeout(() => setTouched(false), 8000);
    return () => clearTimeout(t);
  }, [touched, tick]);
  const go = (n) => { setTouched(true); setTick(n); };
  return { ref, tick, go, hover: { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) } };
};

// ── 1. Shortlist: campuses swipe through the middle; each one lands with its country stamp and the dart hits ──
const SHORTLIST = [
  { img: 'monash', name: 'Monash University', fit: 'Australia', color: '#B48C42' },
  { img: 'toronto', name: 'University of Toronto', fit: 'Canada', color: '#C0392B' },
  { img: 'trinity', name: 'Trinity College Dublin', fit: 'Ireland', color: '#558563' },
  { img: 'deakin', name: 'Deakin University', fit: 'Australia', color: '#B48C42' },
  { img: 'northeastern', name: 'Northeastern University', fit: 'USA', color: '#485A79' },
  { img: 'coventry', name: 'Coventry University', fit: 'UK', color: '#2F5BFF' },
];
const ShortlistArt = () => {
  const { ref, tick, go, hover } = useLoop(2400);
  const n = SHORTLIST.length;
  const at = (i) => SHORTLIST[((i % n) + n) % n];
  const cur = at(tick);
  const left = at(tick - 1);
  const right = at(tick + 1);
  return (
    <div ref={ref} {...hover} className="relative h-[200px] sm:h-[235px] w-full max-w-[370px] mx-auto">
      {[{ u: left, rot: -10, x: '4%', to: tick - 1 }, { u: right, rot: 10, x: '58%', to: tick + 1 }].map(({ u, rot, x, to }) => (
        <motion.button
          type="button"
          key={x}
          onClick={() => go(to)}
          aria-label={`Show ${u.name}`}
          whileHover={{ scale: 1.06 }}
          className="absolute top-8 w-[38%] aspect-[3/4] rounded-[22px] overflow-hidden border-[5px] border-white shadow-[0_20px_40px_-14px_rgba(0,0,0,0.35)] cursor-pointer"
          style={{ left: x }}
          initial={{ opacity: 0, rotate: 0, x: rot < 0 ? '55%' : '-55%' }}
          whileInView={{ opacity: 1, rotate: rot, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ type: 'spring', stiffness: 120, damping: 15, delay: 0.45 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img key={u.img} src={`/images/universities/${u.img}.jpg`} alt="" loading="lazy" className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
          </AnimatePresence>
        </motion.button>
      ))}
      <Float className="absolute left-1/2 top-0 -translate-x-1/2 w-[46%] z-10" distance={6}>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 50) go(info.offset.x < 0 ? tick + 1 : tick - 1); }}
          whileTap={{ cursor: 'grabbing', scale: 0.97 }}
          className="relative aspect-[3/4] rounded-[24px] overflow-hidden border-[6px] border-white shadow-[0_28px_50px_-14px_rgba(0,0,0,0.45)] bg-white cursor-grab touch-pan-y"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img
              key={cur.img}
              src={`/images/universities/${cur.img}.jpg`}
              alt={cur.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ x: '110%', rotate: 12, opacity: 0 }}
              animate={{ x: 0, rotate: 0, opacity: 1 }}
              exit={{ x: '-110%', rotate: -12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 170, damping: 20 }}
            />
          </AnimatePresence>
          {/* fit stamp lands on each new campus */}
          <motion.span
            key={`fit-${tick}`}
            initial={{ scale: 2.4, opacity: 0, rotate: -24 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.35 }}
            className="absolute top-3 right-2 px-2 py-0.5 rounded-md border-2 bg-white/90 text-[11px] font-black uppercase tracking-wider"
            style={{ color: cur.color, borderColor: cur.color }}
          >
            {cur.fit}
          </motion.span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/45 text-white text-[9.5px] font-semibold whitespace-nowrap pointer-events-none">← swipe →</span>
        </motion.div>
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1.5 rounded-full bg-[#2A1A12] text-white text-[12px] font-semibold shadow-lg">
          1,500+ Universities
        </span>
        <Chip className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-max px-3.5 py-2.5 flex items-center gap-2.5">
          <img src={ICON('medal')} alt="" className="w-9 h-9 shrink-0" />
          <span className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={cur.name} className="block text-[13px] font-bold text-[#2A1A12] whitespace-nowrap"
                initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.25 }}>
                {cur.name}
              </motion.span>
            </AnimatePresence>
            <span className="block text-[11px] text-slate-500">
              <span className="font-bold" style={{ color: cur.color }}>{cur.fit}</span> · fits your profile
            </span>
          </span>
        </Chip>
      </Float>
      {/* the dart re-hits the target on every match */}
      <motion.div
        key={`dart-${tick}`}
        className="absolute -right-2 bottom-4 w-[22%] z-20"
        initial={{ x: 40, y: -40, rotate: 20, opacity: 0.4 }}
        animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 12, delay: 0.5 }}
      >
        <img src={ICON('target')} alt="" loading="lazy" className="w-full drop-shadow-xl" />
      </motion.div>
    </div>
  );
};

// ── 3. Finance: coins drop in, eligibility climbs, then the loan gets sanctioned ──
const FUNDING = [
  { pct: 67, label: 'Scholarship eligibility', done: '₹4.5L scholarship found' },
  { pct: 88, label: 'Loan eligibility', done: '₹25L loan sanctioned' },
  { pct: 94, label: 'Collateral-free loan', done: 'Approved in 7 days' },
];
// Counts 0 → pct (remounted each round via key, so it always starts from zero)
const FundingMeter = ({ f }) => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setShown((v) => Math.min(f.pct, v + 1)), 14);
    return () => clearInterval(t);
  }, [f.pct]);
  const done = shown >= f.pct;
  return (
    <>
      <p className="text-[13.5px] font-semibold text-[#2A1A12]">{f.label}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${shown}%`, background: done ? '#558563' : '#5B5BF7' }} />
        </div>
        <span className="text-[17px] font-bold text-[#2A1A12] tabular-nums">{shown}%</span>
      </div>
      <motion.p initial={false} animate={{ opacity: done ? 1 : 0, y: done ? 0 : 6, scale: done ? 1 : 0.9 }}
        className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5">
        <Check size={12} strokeWidth={3} /> {f.done}
      </motion.p>
    </>
  );
};
const FinanceArt = () => {
  const { ref, tick, go, hover } = useLoop(3200);
  const idx = tick % FUNDING.length;
  const f = FUNDING[idx];
  return (
    <div ref={ref} {...hover} className="relative h-[150px] w-full">
      <Float className="absolute left-0 top-2 w-[42%]" distance={7}>
        <motion.img key={`rupee-${tick}`} src={ICON('rupee')} alt="" loading="lazy" className="w-full drop-shadow-2xl"
          initial={{ rotateY: 0 }} animate={{ rotateY: 360, rotate: -6 }} transition={{ duration: 0.9, ease: 'easeOut' }} />
      </Float>
      {/* a coin drops into the stack each round */}
      <motion.div key={`coin-${tick}`} className="absolute left-[22%] w-[26%]"
        initial={{ top: '-30%', opacity: 0, rotate: -40 }} animate={{ top: '52%', opacity: 1, rotate: 12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 11 }}>
        <img src={ICON('3d-coin')} alt="" loading="lazy" className="w-full drop-shadow-xl" />
      </motion.div>
      <Chip className="absolute right-0 top-0 w-[66%] p-3.5">
        <div className="flex gap-1 mb-2.5 p-0.5 rounded-full bg-slate-100">
          {['Scholarship', 'Loan', '0 collateral'].map((t, i) => (
            <button key={t} type="button" onClick={() => go(tick + ((i - idx + FUNDING.length) % FUNDING.length || FUNDING.length))}
              className={`flex-1 rounded-full px-1 py-1 text-[9.5px] font-bold whitespace-nowrap cursor-pointer transition-colors ${i === idx ? 'bg-[#2A1A12] text-white' : 'text-slate-500 hover:text-slate-800'}`}>
              {t}
            </button>
          ))}
        </div>
        <FundingMeter key={tick} f={f} />
      </Chip>
    </div>
  );
};

// ── 2. SOP & documents: an expert writes the SOP live, edits a word, leaves a comment, score climbs ──
const SOP_LINES = [
  'Growing up in Jaipur, I took apart every radio',
  'in our house to see how sound travels.',
  'That curiosity led me to Electronics, and now',
  'to the MSc in Embedded Systems at TU Munich.',
];
// timeline after typing finishes (in ticks of 60 ms)
const EDIT_AT = 12, COMMENT_AT = 30, SCORE_AT = 44, TICK_AT = 70, RESTART_AT = 130;
const SopArt = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-40px' });
  const [chars, setChars] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = SOP_LINES.join('').length;
  const after = Math.max(0, chars - total);
  const typing = chars < total;

  useEffect(() => {
    if (!inView || paused) return undefined;
    const t = setTimeout(() => setChars((c) => (c >= total + RESTART_AT ? 0 : c + 1)), typing ? 34 : 60);
    return () => clearTimeout(t);
  }, [inView, paused, chars, total, typing]);

  const starts = SOP_LINES.map((_, i) => SOP_LINES.slice(0, i).join('').length);
  const shown = SOP_LINES.map((line, i) => line.slice(0, Math.max(0, Math.min(chars, total) - starts[i])));
  const cursorLine = shown.findIndex((l, i) => l.length < SOP_LINES[i].length);
  const edited = after >= EDIT_AT;
  const commented = after >= COMMENT_AT;
  const scoring = after >= SCORE_AT;
  const reviewed = after >= TICK_AT;
  const score = scoring ? Math.min(91, 62 + Math.round((after - SCORE_AT) * 1.3)) : 62;
  const status = typing ? 'Expert writing…' : !edited ? 'Re-reading…' : !reviewed ? 'Polishing…' : 'Final draft ✓';

  return (
    <div
      ref={ref}
      className="relative h-[170px] sm:h-[190px] w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute left-[4%] right-[4%] top-0 bottom-6 rounded-2xl bg-white shadow-[0_18px_40px_-18px_rgba(30,27,75,0.35)] border border-white/70 overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 h-7 border-b border-slate-100 bg-slate-50/80">
          <span className="w-2 h-2 rounded-full bg-[#FF5F57]" /><span className="w-2 h-2 rounded-full bg-[#FEBC2E]" /><span className="w-2 h-2 rounded-full bg-[#28C840]" />
          <span className="ml-2 text-[10.5px] font-semibold text-slate-500 truncate">SOP_TU_Munich.docx</span>
          <span className={`ml-auto text-[10px] font-semibold whitespace-nowrap ${reviewed ? 'text-emerald-600' : 'text-[#485A79]'}`}>{paused ? 'Paused' : status}</span>
        </div>
        <div className="px-3.5 pt-2 relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11.5px] font-bold text-[#2A1A12]">Statement of Purpose</p>
            {/* strength meter climbs as the expert polishes */}
            <span className="flex items-center gap-1.5 text-[9.5px] font-semibold text-slate-500">
              Strength
              <span className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <span className="block h-full rounded-full transition-all duration-300" style={{ width: `${score}%`, background: score > 85 ? '#558563' : '#B48C42' }} />
              </span>
              <span className={score > 85 ? 'text-emerald-600' : 'text-amber-600'}>{score}</span>
            </span>
          </div>
          {shown.map((line, i) => {
            let body = <span className={reviewed && i === 3 ? 'bg-[#F5ECD6] rounded-sm' : ''}>{line}</span>;
            // tracked change on the first line: "took apart" → "dismantled"
            if (i === 0 && line.includes('took apart')) {
              const [pre, post] = line.split('took apart');
              body = (
                <>
                  {pre}
                  {edited ? (
                    <>
                      <RedPenCircle note="weak verb"><span className="line-through text-rose-400">took apart</span></RedPenCircle>{' '}
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-700 bg-emerald-50 rounded-sm">dismantled</motion.span>
                    </>
                  ) : 'took apart'}
                  {post}
                </>
              );
            }
            return (
              <p key={i} className="text-[10.5px] leading-[1.55] text-slate-600 whitespace-nowrap overflow-hidden">
                {body}
                {i === (cursorLine === -1 ? 3 : cursorLine) && typing && <span className="inline-block w-[1.5px] h-[11px] bg-[#485A79] align-middle ml-px animate-pulse" />}
              </p>
            );
          })}
          {/* expert's margin comment */}
          <motion.div
            initial={false}
            animate={{ opacity: commented && !reviewed ? 1 : 0, x: commented && !reviewed ? 0 : 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute right-2 bottom-[-34px] flex items-start gap-1.5 bg-[#F1F4F8] border border-[#C4D0E1] rounded-xl px-2 py-1.5 shadow-sm pointer-events-none"
          >
            <span className="w-4 h-4 rounded-full bg-[#485A79] text-white text-[8px] font-bold grid place-items-center shrink-0">P</span>
            <span className="text-[9.5px] leading-tight text-[#273142]"><b>Prachi</b> · mentor<br />Strong opening, keep it 👌</span>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[88%]"
        initial={false}
        animate={{ opacity: reviewed ? 1 : 0, y: reviewed ? 0 : 10, scale: reviewed ? 1 : 0.96 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Chip className="w-full px-4 py-3 flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-[#485A79] text-white grid place-items-center shrink-0">
            <Check size={18} strokeWidth={3} />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Strength 62 → 91</span>
            <span className="block text-[13.5px] font-bold text-[#2A1A12]">Reviewed by an expert</span>
          </span>
        </Chip>
      </motion.div>
    </div>
  );
};

// ── 4. Visa: a 10-second mock interview. Pick the stronger answer: right → plane flies + APPROVED, wrong → a tip ──
const VISA_QS = [
  { q: 'Why this university?', good: 'Its embedded systems lab matches my final-year project', bad: 'My cousin studies there' },
  { q: 'Who is funding you?', good: 'My father, with a sanctioned ₹25L education loan', bad: 'I will work part-time and manage' },
  { q: 'Plans after your course?', good: 'Work in Ireland on Stamp 1G, then grow my career', bad: "I haven't decided yet" },
];
const VisaArt = () => {
  const { ref, tick, go, hover } = useLoop(6500);
  const qi = tick % VISA_QS.length;
  const v = VISA_QS[qi];
  const [pick, setPick] = useState(null); // null | 'good' | 'bad' (reset when the question changes)
  const [pickedFor, setPickedFor] = useState(-1);
  const answer = pickedFor === tick ? pick : null;
  const approved = answer === 'good';
  const flip = tick % 2 === 0; // swap button order so the right answer isn't always first
  const choose = (k) => { setPick(k); setPickedFor(tick); if (k === 'good') setTimeout(() => go(tick + 1), 3600); };
  return (
    <div ref={ref} {...hover} className="relative h-[215px] sm:h-[240px] w-full max-w-[420px] mx-auto">
      <svg viewBox="0 0 420 215" className="absolute inset-x-0 top-0 w-full h-[215px] pointer-events-none" aria-hidden="true">
        <path d="M70 90 C 150 -20, 290 -20, 360 60" fill="none" stroke="#DE5C2B" strokeWidth="2.5" strokeDasharray="6 8" opacity="0.5" />
      </svg>
      {approved && (
        <motion.div
          className="absolute z-20 text-[#DE5C2B]"
          style={{ offsetPath: "path('M70 90 C 150 -20, 290 -20, 360 60')", offsetRotate: 'auto' }}
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        >
          <Plane size={22} fill="currentColor" className="rotate-45" />
        </motion.div>
      )}
      <Float className="absolute left-[4%] top-3 w-[26%]" distance={7}>
        <img src={ICON('travel')} alt="" loading="lazy" className="w-full drop-shadow-2xl -rotate-3" />
      </Float>
      <Float className="absolute left-[40%] -top-2 w-[19%]" delay={0.5}>
        <motion.img src={ICON('shield')} alt="" loading="lazy" className="w-full drop-shadow-xl" animate={{ scale: approved ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.6, delay: 1.3 }} />
      </Float>
      <Float className="absolute right-[4%] top-6 w-[16%]" delay={1.1} distance={9}>
        <motion.img src={ICON('map-pin')} alt="" loading="lazy" className="w-full drop-shadow-xl" animate={{ y: approved ? [0, -16, 0] : 0 }} transition={{ duration: 0.5, delay: 1.4 }} />
      </Float>
      <AnimatePresence>
        {approved && (
          <motion.div
            key={`stamp-${tick}`}
            className="absolute left-1/2 top-[18%] -translate-x-1/2 z-30 px-3 py-1 rounded-lg border-[3px] border-emerald-600 text-emerald-600 font-black text-[18px] tracking-[0.12em] bg-white/80 pointer-events-none"
            initial={{ scale: 3, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 1.3 }}
          >
            APPROVED
          </motion.div>
        )}
      </AnimatePresence>
      {/* the officer's question, answered by the visitor */}
      <motion.div
        key={`q-${tick}`}
        className="absolute inset-x-[2%] bottom-0 z-20"
        initial={{ opacity: 0, y: 16 }}
        animate={answer === 'bad' ? { opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] } : { opacity: 1, y: 0 }}
        transition={{ duration: answer === 'bad' ? 0.45 : 0.35 }}
      >
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-[0_18px_40px_-12px_rgba(42,26,18,0.35)] border border-white p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12.5px] font-bold text-[#2A1A12]">🛂 Officer: “{v.q}”</p>
            <span className="text-[9.5px] font-semibold text-slate-400 whitespace-nowrap">Q{qi + 1}/3</span>
          </div>
          {approved ? (
            <p className="mt-2 flex items-center gap-2 text-[12.5px] font-semibold text-emerald-700">
              <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white grid place-items-center"><Check size={14} strokeWidth={3} /></span>
              Strong answer. Your student visa is approved!
            </p>
          ) : (
            <div className="mt-2 grid gap-1.5">
              {(flip ? ['good', 'bad'] : ['bad', 'good']).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => choose(k)}
                  className={`text-left rounded-xl border px-2.5 py-1.5 text-[11.5px] leading-snug cursor-pointer transition-colors ${answer === k && k === 'bad' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-[#DE5C2B] hover:bg-orange-50 text-slate-700'}`}
                >
                  {v[k]}
                </button>
              ))}
              {answer === 'bad' && <p className="text-[10.5px] font-semibold text-rose-600">Too vague for an officer. Try the other answer 👆</p>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const JourneyBento = () => {
  const navigate = useNavigate();
  const { openEligibilityModal } = useLead();

  const handleAction = (step) => {
    if (step.to) {
      navigate(step.to);
      return;
    }
    openEligibilityModal?.(`Homepage Steps - ${step.title}`);
  };

  return (
    <section id="how-it-works" className="pt-3 sm:pt-5 pb-8 sm:pb-12 bg-[#FAF9F6] relative z-10 w-full max-w-full">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 w-full min-w-0">

        {/* Header */}
        <motion.div {...rise()} className="max-w-3xl mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-orange-200/90 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#DE5C2B]" />
            <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-800 tracking-wide uppercase">How UniCoach works</span>
          </div>
          <h2 className="font-['Onest',sans-serif] text-[30px] sm:text-[38px] lg:text-[40px] font-black text-[#111111] leading-[1.1] tracking-[-0.035em]">
            Your study abroad journey in <span className="text-[#DE5C2B]">4 steps</span>
          </h2>
          <p className="text-[13.5px] sm:text-[16px] text-slate-600 mt-2.5 leading-relaxed">
            From choosing a university to your visa interview, here is how we help at every step.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
          {/* 01 Counselling: wide, warm orange */}
          <TiltCard
            delay={0.05}
            className="lg:col-span-8 relative overflow-hidden rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 grid md:grid-cols-[1fr_1.05fr] gap-6 items-center"
            style={{ background: 'radial-gradient(120% 120% at 0% 0%, #FFD8C2 0%, #FFB48A 45%, #FF9A62 100%)' }}
          >
            <CardText s={STEPS.counselling} onAction={handleAction} />
            <ShortlistArt />
          </TiltCard>

          {/* 02 SOP: periwinkle */}
          <TiltCard
            delay={0.12}
            className="lg:col-span-4 relative overflow-hidden rounded-[24px] sm:rounded-[30px] p-5 sm:p-6 flex flex-col gap-4"
            style={{ background: 'radial-gradient(120% 110% at 100% 0%, #DCE2FF 0%, #B8C2FF 55%, #A3AEFA 100%)' }}
          >
            <SopArt />
            <CardText s={STEPS.sop} onAction={handleAction} />
          </TiltCard>

          {/* 03 Loans: violet */}
          <TiltCard
            delay={0.08}
            className="lg:col-span-4 relative overflow-hidden rounded-[24px] sm:rounded-[30px] p-5 sm:p-6 flex flex-col gap-4"
            style={{ background: 'radial-gradient(120% 110% at 0% 0%, #F5C9B8 0%, #C9A5E8 50%, #8F7BE8 100%)' }}
          >
            <FinanceArt />
            <CardText s={STEPS.loans} onAction={handleAction} />
          </TiltCard>

          {/* 04 Visa: soft cream, wide */}
          <TiltCard
            delay={0.15}
            className="lg:col-span-8 relative overflow-hidden rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 grid md:grid-cols-[1fr_1.1fr] gap-6 items-center"
            style={{ background: 'radial-gradient(120% 130% at 100% 100%, #FFE3D6 0%, #FDF1EA 55%, #FBF6F2 100%)' }}
          >
            <CardText s={STEPS.visa} onAction={handleAction} />
            <VisaArt />
          </TiltCard>
        </div>
      </div>
    </section>
  );
};

export default JourneyBento;
