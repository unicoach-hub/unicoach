import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { useLead } from '../context/LeadContext';
import { RedPenCircle } from './ui/BrandElements';

// "Your study abroad journey in 4 steps": a timeline rail plus one big panel. Each panel shows a small
// preview of what the student actually gets at that step (a shortlist, an edited SOP, a funding plan,
// a checked visa file). It plays through the steps on its own until the visitor picks one.
const STEPS = [
  {
    key: 'counselling',
    step: '01',
    when: 'Start here',
    title: 'Personalized Counselling',
    short: 'Counselling',
    text: 'One-on-one call about your marks, budget and goals. You leave with a shortlist of universities that fit you, sorted into dream, target and safe.',
    gets: ['1:1 video call, free', 'Dream / target / safe shortlist', 'Course and country advice'],
    cta: 'Book Free Counselling',
    tint: '#FFE7DA',
    dwell: 8000,
  },
  {
    key: 'sop',
    step: '02',
    when: 'Applications',
    title: 'SOP & Documents',
    short: 'SOP & Docs',
    text: 'Your SOP, LORs and resume written and polished by experts who have been through admissions themselves, line by line.',
    gets: ['SOP written with you', 'LORs and resume polished', 'Line-by-line expert edits'],
    cta: 'Get your SOP done by an expert',
    to: '/unicoach',
    tint: '#F3ECFB',
    dwell: 13500,
  },
  {
    key: 'loans',
    step: '03',
    when: 'After your admit',
    title: 'Loans & Funding',
    short: 'Funding',
    text: 'We work out how your total cost gets covered: savings, scholarships and the loan, then compare lenders so you pay the least interest.',
    gets: ['Scholarships you qualify for', 'Public, private and NBFC lenders', 'With or without collateral'],
    cta: 'Check Loan Options',
    to: '/education-loan',
    tint: '#FDF0E1',
    dwell: 9000,
  },
  {
    key: 'visa',
    step: '04',
    when: 'Before you fly',
    title: 'Visa & Mocks',
    short: 'Visa',
    text: 'Every visa document checked before you file, mock interviews till your answers sound natural, and help fixing a file that was refused before.',
    gets: ['Document check before filing', 'AI and counsellor mock interviews', 'Refused before? We fix the file'],
    cta: 'Practice a Visa Mock',
    to: '/ai-tools/visa-prep',
    tint: '#FCE9EC',
    dwell: 10000,
  },
];

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 40, filter: 'blur(8px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
});

// Small floating card used inside the previews
const Chip = ({ children, className = '', delay = 0.4 }) => (
  <motion.div
    className={`bg-white rounded-2xl shadow-[0_18px_40px_-16px_rgba(42,26,18,0.3)] border border-[#EFE7DC] ${className}`}
    initial={{ opacity: 0, y: 18, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 20, delay }}
  >
    {children}
  </motion.div>
);

// ── 1. Counselling: a profile goes in, a sorted shortlist comes out ──
const PROFILE = ['B.Tech CSE', '7.8 CGPA', 'IELTS 7.0', 'Budget ₹30L/yr'];
const SHORTLIST = [
  { tier: 'Dream', img: 'toronto', name: 'University of Toronto', country: 'Canada', fee: '₹38L', match: 64, color: '#DE5C2B' },
  { tier: 'Target', img: 'trinity', name: 'Trinity College Dublin', country: 'Ireland', fee: '₹26L', match: 82, color: '#B48C42' },
  { tier: 'Safe', img: 'coventry', name: 'Coventry University', country: 'UK', fee: '₹20L', match: 93, color: '#558563' },
];
const ShortlistPreview = () => (
  <div className="w-full max-w-[460px] mx-auto">
    <Chip delay={0.1} className="p-3.5 sm:p-4">
      <p className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-[#8A7A6A]">Your profile</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PROFILE.map((p, i) => (
          <motion.span key={p} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.12 }}
            className="px-2.5 py-1 rounded-full bg-[#F6F3EC] border border-[#E6E0D4] text-[12px] font-semibold text-[#2A1A12]">
            {p}
          </motion.span>
        ))}
      </div>
    </Chip>
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
      className="my-2.5 text-center text-[11.5px] font-semibold text-[#8A7A6A]">
      ↓ matched against 1,500+ universities
    </motion.p>
    <Chip delay={1} className="p-2 sm:p-2.5">
      {SHORTLIST.map((u, i) => (
        <motion.div key={u.name} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 1.2 + i * 0.25 }}
          className={`flex items-center gap-3 px-2 py-2 ${i ? 'border-t border-[#F1EBE2]' : ''}`}>
          <img src={`/images/universities/${u.img}.jpg`} alt="" loading="lazy" className="w-11 h-11 rounded-xl object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: u.color }}>{u.tier}</span>
            <p className="text-[13.5px] font-bold text-[#2A1A12] truncate leading-tight">{u.name}</p>
            <p className="text-[11.5px] text-[#8A7A6A]">{u.country} · {u.fee}/yr tuition</p>
          </div>
          <div className="w-[64px] shrink-0 text-right">
            <p className="text-[15px] font-black tabular-nums text-[#2A1A12]">{u.match}%</p>
            <div className="mt-1 h-1.5 rounded-full bg-[#F1EBE2] overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: u.color }} initial={{ width: 0 }} animate={{ width: `${u.match}%` }} transition={{ duration: 0.8, delay: 1.5 + i * 0.25 }} />
            </div>
            <p className="mt-0.5 text-[9.5px] text-[#8A7A6A]">profile fit</p>
          </div>
        </motion.div>
      ))}
    </Chip>
    <p className="mt-2 text-center text-[10.5px] text-[#A3968A]">Example shortlist. Fees are approximate.</p>
  </div>
);

// ── 3. Funding: where a ₹45L degree's money comes from, then the cheapest lender for the loan ──
const COST = [
  { label: 'Your savings', amt: 10, color: '#2A1A12' },
  { label: 'Scholarship', amt: 6, color: '#558563' },
  { label: 'Education loan', amt: 29, color: '#DE5C2B' },
];
const TOTAL = COST.reduce((s, c) => s + c.amt, 0);
const LOAN = COST[2].amt;
const LENDERS = [
  { name: 'Public bank', rate: 9.5 },
  { name: 'Private bank', rate: 10.75 },
  { name: 'NBFC', rate: 12.5 },
];
// monthly EMI in ₹ thousands for a 10-year loan
const emi = (lakh, rate) => {
  const r = rate / 1200;
  const n = 120;
  return (lakh * 100 * r * (1 + r) ** n) / ((1 + r) ** n - 1);
};
const FundingPreview = () => (
  <div className="w-full max-w-[460px] mx-auto">
    <Chip delay={0.1} className="p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[13px] font-bold text-[#2A1A12]">MS in Ireland, 2 years</p>
        <p className="text-[12px] text-[#8A7A6A]">Total <b className="text-[#2A1A12] text-[15px]">₹{TOTAL}L</b></p>
      </div>
      <div className="mt-3 flex h-4 rounded-full overflow-hidden bg-[#F1EBE2]">
        {COST.map((c, i) => (
          <motion.div key={c.label} style={{ background: c.color }} initial={{ width: 0 }} animate={{ width: `${(c.amt / TOTAL) * 100}%` }}
            transition={{ duration: 0.7, delay: 0.4 + i * 0.45, ease: 'easeOut' }} className={i ? 'border-l-2 border-white' : ''} />
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {COST.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.45 }}>
            <p className="flex items-center gap-1.5 text-[10.5px] text-[#8A7A6A] whitespace-nowrap"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />{c.label}</p>
            <p className="text-[15px] font-black text-[#2A1A12]">₹{c.amt}L</p>
          </motion.div>
        ))}
      </div>
    </Chip>
    <Chip delay={1.8} className="mt-3 p-2 sm:p-2.5">
      <p className="px-2 pt-1 pb-1.5 text-[10.5px] font-bold tracking-[0.12em] uppercase text-[#8A7A6A]">₹{LOAN}L loan · 10 years · EMI</p>
      {LENDERS.map((l, i) => (
        <motion.div key={l.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2 + i * 0.2 }}
          className={`flex items-center justify-between gap-3 px-2 py-2 ${i ? 'border-t border-[#F1EBE2]' : ''}`}>
          <span className="text-[13px] font-semibold text-[#2A1A12]">{l.name}</span>
          <span className="text-[12px] text-[#8A7A6A] tabular-nums">{l.rate}%</span>
          <span className="w-[110px] text-right text-[14px] font-black tabular-nums text-[#2A1A12]">
            {i === 0 ? <RedPenCircle note="cheapest">₹{emi(LOAN, l.rate).toFixed(1)}k/mo</RedPenCircle> : `₹${emi(LOAN, l.rate).toFixed(1)}k/mo`}
          </span>
        </motion.div>
      ))}
    </Chip>
    <p className="mt-2 text-center text-[10.5px] text-[#A3968A]">Example figures and rates. Your offer depends on the lender.</p>
  </div>
);

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

// ── 4. Visa: the file is checked, then a quick mock question. Pick the stronger answer. ──
const VISA_DOCS = ['Admission letter (I-20 / CoE)', 'Funds proof and loan sanction', 'SOP / GS answers'];
const VISA_QS = [
  { q: 'Why this university?', good: 'Its embedded systems lab matches my final-year project', bad: 'My cousin studies there' },
  { q: 'Who is funding you?', good: 'My father, with a sanctioned ₹25L education loan', bad: 'I will work part-time and manage' },
  { q: 'Plans after your course?', good: 'Work in Ireland on Stamp 1G, then grow my career', bad: "I haven't decided yet" },
];
const VisaPreview = () => {
  const [qi, setQi] = useState(0);
  const [answer, setAnswer] = useState(null); // null | 'good' | 'bad'
  const v = VISA_QS[qi];
  const approved = answer === 'good';
  const flip = qi % 2 === 0; // swap the order so the right answer isn't always first
  useEffect(() => {
    if (!approved) return undefined;
    const t = setTimeout(() => { setAnswer(null); setQi((n) => (n + 1) % VISA_QS.length); }, 2600);
    return () => clearTimeout(t);
  }, [approved]);
  return (
    <div className="relative w-full max-w-[460px] mx-auto">
      <Chip delay={0.1} className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-bold text-[#2A1A12]">Visa file check</p>
          <span className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.1em]">
            <span className="px-1.5 py-0.5 rounded border-2 border-[#C0392B] text-[#C0392B] -rotate-3">REFUSED</span>
            <ArrowRight size={12} className="text-[#8A7A6A]" />
            <span className="px-1.5 py-0.5 rounded bg-[#558563] text-white">FIXED</span>
          </span>
        </div>
        <div className="mt-2.5 grid gap-1.5">
          {VISA_DOCS.map((d, i) => (
            <motion.p key={d} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.3 }}
              className="flex items-center gap-2 text-[12.5px] text-[#2A1A12]">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.55 + i * 0.3 }}
                className="w-5 h-5 rounded-md bg-[#558563] text-white grid place-items-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </motion.span>
              {d}
            </motion.p>
          ))}
        </div>
      </Chip>
      <Chip delay={1.4} className="mt-3 p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-bold text-[#2A1A12]">Officer: “{v.q}”</p>
          <span className="text-[10px] font-semibold text-[#A3968A] whitespace-nowrap">Mock Q{qi + 1}/3</span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {approved ? (
            <motion.p key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-2.5 flex items-center gap-2 text-[13px] font-semibold text-[#3F6B4C]">
              <span className="w-6 h-6 rounded-lg bg-[#558563] text-white grid place-items-center"><Check size={14} strokeWidth={3} /></span>
              Strong answer. That is what an officer wants to hear.
            </motion.p>
          ) : (
            <motion.div key={`q-${qi}`} initial={{ opacity: 0, y: 6 }} animate={answer === 'bad' ? { opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] } : { opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-2.5 grid gap-1.5">
              <p className="text-[10.5px] font-semibold text-[#8A7A6A]">Pick the stronger answer</p>
              {(flip ? ['good', 'bad'] : ['bad', 'good']).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setAnswer(k)}
                  className={`no-shine text-left rounded-xl border px-3 py-2 text-[12.5px] leading-snug cursor-pointer transition-colors ${answer === 'bad' && k === 'bad' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-[#E6E0D4] hover:border-[#DE5C2B] hover:bg-[#FFF4EE] text-[#2A1A12]'}`}
                >
                  {answer === 'bad' && k === 'bad' && <X size={12} strokeWidth={3} className="inline mr-1 -mt-0.5" />}
                  {v[k]}
                </button>
              ))}
              {answer === 'bad' && <p className="text-[11px] font-semibold text-rose-600">Too vague for an officer. Try the other one.</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </Chip>
      <AnimatePresence>
        {approved && (
          <motion.span
            key={`stamp-${qi}`}
            className="absolute right-3 top-[38%] z-30 px-3 py-1 rounded-lg border-[3px] border-[#558563] text-[#558563] font-black text-[18px] tracking-[0.12em] bg-white/90 pointer-events-none"
            initial={{ scale: 3, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
          >
            APPROVED
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

const PREVIEW = { counselling: ShortlistPreview, sop: SopArt, loans: FundingPreview, visa: VisaPreview };

export const JourneyBento = () => {
  const navigate = useNavigate();
  const { openEligibilityModal } = useLead();
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-120px' });
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [picked, setPicked] = useState(false); // the visitor chose a step: stop playing through on our own
  // plays through on its own only on wide screens; on a phone the panel changing height while you read would jump the page
  const [wide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);
  const running = wide && inView && !hovered && !picked;

  useEffect(() => {
    if (!running) return undefined;
    const t = setTimeout(() => setActive((n) => (n + 1) % STEPS.length), STEPS[active].dwell);
    return () => clearTimeout(t);
  }, [running, active]);

  const handleAction = (step) => {
    if (step.to) {
      navigate(step.to);
      return;
    }
    openEligibilityModal?.(`Homepage Steps - ${step.title}`);
  };

  const s = STEPS[active];
  const Preview = PREVIEW[s.key];

  return (
    <section id="how-it-works" className="pt-3 sm:pt-5 pb-8 sm:pb-12 bg-[#FAF9F6] relative z-10 w-full max-w-full">
      <div ref={ref} className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 w-full min-w-0">

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
            From choosing a university to your visa interview, here is what you get at every step.
          </p>
        </motion.div>

        <motion.div {...rise(0.1)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          {/* Timeline rail */}
          <div className="relative grid grid-cols-4 gap-1 sm:gap-3" role="tablist" aria-label="UniCoach steps">
            <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[17px] sm:top-[21px] border-t-2 border-dashed border-[#E3D8CA]" />
            <motion.div aria-hidden="true" className="absolute left-[12.5%] top-[16px] sm:top-[20px] h-[4px] rounded-full bg-[#DE5C2B]"
              animate={{ width: `${(active / (STEPS.length - 1)) * 75}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
            {STEPS.map((st, i) => {
              const on = i === active;
              const done = i < active;
              return (
                <button
                  key={st.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => { setActive(i); setPicked(true); }}
                  className="no-shine group relative z-10 flex flex-col items-center text-center cursor-pointer"
                >
                  <span className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-full grid place-items-center text-[13px] sm:text-[15px] font-black border-2 transition-colors ${on ? 'bg-[#DE5C2B] border-[#2A1A12] text-white shadow-[3px_3px_0_#2A1A12]' : done ? 'bg-[#2A1A12] border-[#2A1A12] text-white' : 'bg-white border-[#E3D8CA] text-[#8A7A6A] group-hover:border-[#DE5C2B]'}`}>
                    {done ? <Check size={16} strokeWidth={3} /> : st.step}
                  </span>
                  <span className={`mt-2 text-[11.5px] sm:text-[15px] font-bold leading-tight ${on ? 'text-[#2A1A12]' : 'text-[#6B5E52]'}`}>
                    <span className="sm:hidden">{st.short}</span>
                    <span className="hidden sm:inline">{st.title}</span>
                  </span>
                  <span className="hidden sm:block mt-0.5 text-[12px] text-[#A3968A]">{st.when}</span>
                  {/* how long until the next step plays */}
                  <span className="mt-2 h-[3px] w-12 sm:w-20 rounded-full bg-[#EFE7DC] overflow-hidden">
                    {on && (
                      <span key={`${active}-${running}`} className="block h-full bg-[#DE5C2B] origin-left"
                        style={{ animation: running ? `jb-fill ${st.dwell}ms linear forwards` : 'none', transform: running ? undefined : 'scaleX(1)' }} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stage */}
          <div className="mt-5 sm:mt-7 rounded-[24px] sm:rounded-[32px] border border-[#EFE7DC] bg-white overflow-hidden transition-colors duration-500"
            style={{ background: `radial-gradient(120% 120% at 100% 0%, ${s.tint} 0%, #FFFFFF 62%)` }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={s.key}
                role="tabpanel"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="grid lg:grid-cols-[1fr_1.1fr] gap-7 lg:gap-10 items-center p-5 sm:p-8 lg:p-11 lg:min-h-[460px]"
              >
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-[12px] font-bold tracking-[0.14em] uppercase text-[#DE5C2B]">Step {s.step} · {s.when}</p>
                  <h3 className="mt-2 font-outfit text-[26px] sm:text-[34px] font-bold tracking-[-0.035em] leading-[1.05] text-[#2A1A12]">{s.title}</h3>
                  <p className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[#5A4636] max-w-[460px]">{s.text}</p>
                  <p className="mt-5 text-[11px] font-bold tracking-[0.14em] uppercase text-[#8A7A6A]">What you get</p>
                  <ul className="mt-2 grid gap-2">
                    {s.gets.map((g) => (
                      <li key={g} className="flex items-center gap-2.5 text-[14px] sm:text-[15px] font-semibold text-[#2A1A12]">
                        <span className="w-5 h-5 rounded-full bg-[#FFE7DA] text-[#DE5C2B] grid place-items-center shrink-0"><Check size={12} strokeWidth={3} /></span>
                        {g}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleAction(s)}
                    className="no-shine group mt-6 inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full bg-[#2A1A12] text-white text-[14px] sm:text-[15px] font-bold cursor-pointer"
                  >
                    {s.cta}
                    <span className="w-9 h-9 rounded-full bg-[#DE5C2B] grid place-items-center transition-transform group-hover:translate-x-0.5">
                      <ArrowRight size={17} />
                    </span>
                  </button>
                </div>
                <div className="min-w-0 rounded-[20px] sm:rounded-[24px] p-4 sm:p-6" style={{ background: s.tint }}>
                  <Preview />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      <style>{'@keyframes jb-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }'}</style>
    </section>
  );
};

export default JourneyBento;
