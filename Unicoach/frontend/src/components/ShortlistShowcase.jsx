import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, GraduationCap, HandCoins, Search, Check } from 'lucide-react';

// Homepage showcase for the two shortlist tools. The preview on the right plays by itself on a loop:
// the form fills in, the button is pressed, results appear one by one, then it switches tool.
// The steps on the left follow along, so a visitor understands the tool without clicking anything.

const TICK = 100; // ms
const CYCLE = 10500; // one tool's demo
const T_FORM_END = 3000;
const T_MATCH_END = 4600;

const TOOLS = [
  {
    id: 'uni',
    label: 'University & Course Shortlist',
    icon: GraduationCap,
    title: 'Find universities that fit you',
    steps: [
      ['Tell us about you', 'Pick a country and course, and add your marks, test scores and budget.'],
      ['We match you', 'We compare your profile with 1,500+ universities and their past admits.'],
      ['Get your shortlist', 'Dream, Target and Safe options with your chance of getting in.'],
    ],
    cta: { text: 'Build my shortlist', to: '/search-programs' },
    fields: [
      ['Country', 'Ireland'],
      ['Course', 'MSc Data Science'],
      ['Your scores', '8.2 CGPA · 7 IELTS'],
    ],
    button: 'Find universities',
    matching: 'Matching 1,500+ universities…',
    results: [
      { name: 'University of Limerick', meta: 'MSc Data Science', tag: 'Safe', pct: 91, color: '#16a34a' },
      { name: 'Trinity College Dublin', meta: 'MSc Data Science', tag: 'Target', pct: 74, color: '#DE5C2B' },
      { name: 'University College Dublin', meta: 'MSc Data & Computational Science', tag: 'Dream', pct: 58, color: '#7c3aed' },
    ],
  },
  {
    id: 'sch',
    label: 'Scholarship Shortlist',
    icon: HandCoins,
    title: 'Find scholarships you can win',
    steps: [
      ['Share your profile', 'Your study level, target countries, marks and work experience.'],
      ['We check eligibility', 'We go through 150+ scholarships and their rules for you.'],
      ['See your matches', 'Scholarships you qualify for, what they cover and how close you are.'],
    ],
    cta: { text: 'Find my scholarships', to: '/scholarships' },
    fields: [
      ['Level', "Master's"],
      ['Countries', 'UK · Germany · USA'],
      ['Your profile', '8.2 CGPA · 2y work'],
    ],
    button: 'Find scholarships',
    matching: 'Checking 150+ scholarships…',
    results: [
      { name: 'Chevening Scholarship', meta: 'UK · Fully funded', tag: 'Eligible', pct: 88, color: '#16a34a' },
      { name: 'DAAD EPOS', meta: 'Germany · Monthly stipend', tag: 'Eligible', pct: 81, color: '#16a34a' },
      { name: 'Fulbright-Nehru Master’s', meta: 'USA · Tuition + living', tag: 'Close', pct: 63, color: '#DE5C2B' },
    ],
  },
];

// Which step (0, 1, 2) the demo is on at time t
const stepAt = (t) => (t < T_FORM_END ? 0 : t < T_MATCH_END ? 1 : 2);

const Preview = ({ tool, t }) => {
  const Icon = tool.icon;
  // Each field types out in its own slice of the first 3 seconds
  const slice = T_FORM_END / tool.fields.length;
  const typed = (i, text) => {
    const local = Math.max(0, Math.min(1, (t - i * slice) / (slice * 0.8)));
    return text.slice(0, Math.round(text.length * local));
  };
  const typingIndex = Math.min(tool.fields.length - 1, Math.floor(t / slice));
  const pressed = t >= T_FORM_END && t < T_FORM_END + 350;
  const matching = t >= T_FORM_END && t < T_MATCH_END;
  const showResults = t >= T_MATCH_END;

  return (
    <div className="bg-white rounded-[28px] shadow-[0_30px_80px_-30px_rgba(42,26,18,0.28)] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-[#FFF0EB] text-[#DE5C2B] grid place-items-center"><Icon size={19} /></span>
          <p className="font-outfit text-[17px] font-bold text-[#111]">{tool.label}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500 whitespace-nowrap shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live demo
        </span>
      </div>

      {/* Form filling itself */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-[0.9fr_1.2fr_1.15fr] gap-2.5">
        {tool.fields.map(([label, value], i) => {
          const text = typed(i, value);
          const active = !showResults && !matching && i === typingIndex;
          return (
            <div key={label} className={`rounded-2xl px-3.5 py-3 transition-all ${active ? 'bg-[#FFF3EC] ring-2 ring-[#DE5C2B]/40' : 'bg-[#F7F5F2]'}`}>
              <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
              <p className="text-[13.5px] font-semibold text-[#111] h-5 truncate">
                {text}
                {active && <span className="inline-block w-[2px] h-[14px] bg-[#DE5C2B] ml-0.5 align-middle animate-pulse" />}
              </p>
            </div>
          );
        })}
      </div>

      <motion.div
        animate={{ scale: pressed ? 0.95 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`mt-3 h-12 rounded-full flex items-center justify-center gap-2 text-[14.5px] font-bold text-white transition-colors ${t >= T_FORM_END - 400 ? 'bg-[#111]' : 'bg-slate-300'}`}
      >
        <Search size={16} /> {tool.button}
      </motion.div>

      {/* Matching, then results */}
      <div className="mt-4 min-h-[206px]">
        <AnimatePresence mode="wait">
          {matching && (
            <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
              <p className="text-[12.5px] font-semibold text-slate-500 flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-[#DE5C2B] border-t-transparent animate-spin" />
                {tool.matching}
              </p>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[52px] rounded-2xl bg-[#F7F5F2] animate-pulse" />
              ))}
            </motion.div>
          )}
          {showResults && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
              <p className="text-[12.5px] font-semibold text-emerald-700 flex items-center gap-1.5"><Check size={14} /> {tool.results.length} best matches found</p>
              {tool.results.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.35, type: 'spring', stiffness: 220, damping: 20 }}
                  className="flex items-center gap-3 px-1 py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-[#111] truncate">{r.name}</p>
                    <p className="text-[11.5px] text-slate-500 truncate">{r.meta}</p>
                  </div>
                  <div className="w-24 hidden sm:block">
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: r.color }} initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ delay: 0.3 + i * 0.35, duration: 0.8 }} />
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-1 text-right">{r.pct}% match</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ color: r.color, background: `${r.color}14` }}>{r.tag}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-[10.5px] text-slate-400 mt-2">Example results. Yours depend on your profile.</p>
    </div>
  );
};

export default function ShortlistShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-100px' });
  const reduce = useReducedMotion();
  const [toolIndex, setToolIndex] = useState(0);
  const [t, setT] = useState(reduce ? CYCLE : 0);
  const [paused, setPaused] = useState(false);
  const tRef = useRef(t);

  // The demo clock: runs while the section is on screen, moves to the other tool at the end
  useEffect(() => {
    if (reduce || !inView || paused) return undefined;
    const id = setInterval(() => {
      const next = tRef.current + TICK;
      if (next >= CYCLE) {
        tRef.current = 0;
        setT(0);
        setToolIndex((i) => (i + 1) % TOOLS.length);
      } else {
        tRef.current = next;
        setT(next);
      }
    }, TICK);
    return () => clearInterval(id);
  }, [inView, paused, reduce]);

  const tool = TOOLS[toolIndex];
  const step = reduce ? 2 : stepAt(t);
  const pick = (i) => { setToolIndex(i); tRef.current = 0; setT(0); };

  return (
    <section ref={ref} className="py-10 sm:py-14 bg-[#FAF9F6] w-full max-w-full">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-center">
        {/* Left: title, tool switch, steps that follow the demo */}
        <div>
          <span className="text-[12.5px] font-bold text-[#DE5C2B] uppercase tracking-[0.12em]">Free AI tools</span>
          <h2 className="mt-4 font-['Inter',sans-serif] text-[32px] sm:text-[42px] font-black text-[#111] leading-[1.05] tracking-[-0.035em]">
            Your shortlist,<br /><span className="text-[#DE5C2B]">in 60 seconds</span>
          </h2>
          <p className="mt-3 text-[15px] sm:text-[17px] text-slate-600">Universities, courses and scholarships matched to your profile.</p>

          <div className="mt-6 inline-flex p-1 rounded-full bg-[#F1EEEA] gap-1 max-w-full overflow-x-auto">
            {TOOLS.map((tl, i) => {
              const TIcon = tl.icon;
              return (
                <button
                  key={tl.id}
                  type="button"
                  onClick={() => pick(i)}
                  className={`relative h-10 px-4 rounded-full text-[13px] font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors ${i === toolIndex ? 'text-white' : 'text-slate-600 hover:text-[#111]'}`}
                >
                  {i === toolIndex && <motion.span layoutId="tool-pill" className="absolute inset-0 rounded-full bg-[#111]" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <TIcon size={15} className="relative" />
                  <span className="relative">{tl.id === 'uni' ? 'Universities & courses' : 'Scholarships'}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-7 space-y-1 hidden lg:block">
            {tool.steps.map(([title, text], i) => {
              const open = i === step;
              return (
                <div key={title} className="relative pl-5 border-l-2 border-slate-200">
                  {open && <motion.span layoutId={`step-bar-${tool.id}`} className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-[#DE5C2B]" />}
                  <div className="flex items-center gap-3 py-3">
                    <span className={`text-[13px] font-bold tabular-nums ${open ? 'text-[#DE5C2B]' : 'text-slate-300'}`}>0{i + 1}</span>
                    <span className={`flex-1 font-outfit text-[18px] sm:text-[20px] font-bold transition-colors ${open ? 'text-[#111]' : 'text-slate-400'}`}>{title}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <p className="pl-8 pb-3 -mt-1 text-[14.5px] text-slate-600 leading-relaxed max-w-[440px]">{text}</p>
                        <div className="ml-8 mb-3 h-[2px] max-w-[440px] rounded-full bg-[#F3E2D9] overflow-hidden">
                          <div className="h-full bg-[#DE5C2B] transition-[width] duration-100 ease-linear" style={{ width: `${step === 0 ? (t / T_FORM_END) * 100 : step === 1 ? ((t - T_FORM_END) / (T_MATCH_END - T_FORM_END)) * 100 : ((t - T_MATCH_END) / (CYCLE - T_MATCH_END)) * 100}%` }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <Link to={tool.cta.to} className="mt-6 hidden lg:inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#111] hover:bg-[#DE5C2B] text-white text-[15px] font-bold transition-colors">
            {tool.cta.text} <ArrowRight size={17} />
          </Link>
        </div>

        {/* Right: the demo playing on its own */}
        <div
          className="relative rounded-[28px] sm:rounded-[36px] p-3 sm:p-10" style={{ background: 'radial-gradient(120% 120% at 100% 0%, #FFE2D3 0%, #FDF1EA 45%, #FAF9F6 100%)' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Phones: one line saying which step the demo is on, instead of the full list */}
          <div className="lg:hidden mb-3 flex items-center gap-2 text-[13px]">
            <span className="font-bold text-[#DE5C2B] tabular-nums">0{step + 1} / 03</span>
            <span className="font-semibold text-[#111]">{tool.steps[step][0]}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tool.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}>
              <Preview tool={tool} t={t} />
            </motion.div>
          </AnimatePresence>
          <Link to={tool.cta.to} className="lg:hidden mt-4 flex items-center justify-center gap-2 h-12 rounded-full bg-[#111] text-white text-[15px] font-bold">
            {tool.cta.text} <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
