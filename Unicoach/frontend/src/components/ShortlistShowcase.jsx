import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, GraduationCap, HandCoins, Search } from 'lucide-react';
import { DesiSticker } from './desi/Desi';

// Homepage showcase for the two shortlist tools, told as a street scene: a student rides an
// auto-rickshaw along the road while the search fills itself, the search is tapped and the results land
// as poster cards. The auto's ride and the shortlisting move together, and the loop runs on its own.

const TICK = 50; // ms
const CYCLE = 7200; // one tool's demo
const T_FORM_END = 2200;
const T_MATCH_END = 3000;

const INK = '#16130F';

const TOOLS = [
  {
    id: 'uni',
    label: 'University & Course Shortlist',
    icon: GraduationCap,
    steps: ['Tell us about you', 'We match you', 'Get your shortlist'],
    cta: { text: 'Build my shortlist', to: '/search-programs' },
    fields: [
      ['Country', 'Ireland'],
      ['Course', 'MSc Data Science'],
      ['Your scores', '8.2 CGPA · 7 IELTS'],
    ],
    button: 'Find universities',
    matching: 'Matching 1,500+ universities…',
    results: [
      { name: 'University of Limerick', meta: 'MSc Data Science', tag: 'Limerick', pct: 91, color: '#1E9E4A', tint: '#DEF5E5' },
      { name: 'Trinity College Dublin', meta: 'MSc Data Science', tag: 'Dublin', pct: 74, color: '#DE5C2B', tint: '#FFEDE4' },
      { name: 'University College Dublin', meta: 'MSc Data & Computational Science', tag: 'Dublin', pct: 58, color: '#2B3FA0', tint: '#E3E7FB' },
    ],
  },
  {
    id: 'sch',
    label: 'Scholarship Shortlist',
    icon: HandCoins,
    steps: ['Share your profile', 'We check eligibility', 'See your matches'],
    cta: { text: 'Find my scholarships', to: '/search-programs?highlight=scholarship' },
    fields: [
      ['Level', "Master's"],
      ['Countries', 'UK · Germany · USA'],
      ['Your profile', '8.2 CGPA · 2y work'],
    ],
    button: 'Find scholarships',
    matching: 'Checking 150+ scholarships…',
    results: [
      { name: 'Chevening Scholarship', meta: 'UK · Fully funded', tag: 'Eligible', pct: 88, color: '#1E9E4A', tint: '#DEF5E5' },
      { name: 'DAAD EPOS', meta: 'Germany · Monthly stipend', tag: 'Eligible', pct: 81, color: '#1E9E4A', tint: '#DEF5E5' },
      { name: 'Fulbright-Nehru Master’s', meta: 'USA · Tuition + living', tag: 'Close', pct: 63, color: '#DE5C2B', tint: '#FFEDE4' },
    ],
  },
];

// Which step (0, 1, 2) the demo is on at time t
const stepAt = (t) => (t < T_FORM_END ? 0 : t < T_MATCH_END ? 1 : 2);

// Auto position along the road (% of road width). Each demo phase gets its own stretch, so the
// auto is a third of the way along when the form is filled, two thirds when matching is done, and
// reaches campus as the results finish landing.
const T_ARRIVE = CYCLE - 900;
const autoX = (t) => {
  let p;
  if (t < T_FORM_END) p = (t / T_FORM_END) / 3;
  else if (t < T_MATCH_END) p = 1 / 3 + ((t - T_FORM_END) / (T_MATCH_END - T_FORM_END)) / 3;
  else p = 2 / 3 + Math.min(1, (t - T_MATCH_END) / (T_ARRIVE - T_MATCH_END)) / 3;
  return -4 + p * 84; // -4% → 80%
};
const autoMoving = (t) => t < T_ARRIVE;

// Auto-rickshaw with a student in a graduation cap (drawn, no images). Drawn facing left;
// the road mirrors it so it faces the way it drives.
const AutoRickshaw = ({ moving }) => (
  <svg viewBox="0 0 220 140" className="w-full h-auto overflow-visible" aria-hidden="true">
    {/* canopy */}
    <path d="M40 22 Q48 8 92 8 H170 Q186 8 188 26 L190 70 H40 Z" fill="#F2B705" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    <path d="M58 20 H176" stroke={INK} strokeWidth="3" opacity="0.25" />
    {[74, 112, 150].map((x) => <path key={x} d={`M${x} 10 V68`} stroke={INK} strokeWidth="2" opacity="0.15" />)}
    {/* roof rail */}
    <path d="M70 6 H160" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    {/* body */}
    <path d="M28 70 H196 Q206 70 206 82 V102 Q206 110 198 110 H34 Q20 110 20 96 V84 Q20 70 28 70 Z" fill="#1E9E4A" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    {/* lower shading */}
    <path d="M24 100 H202 V102 Q202 108 196 108 H36 Q24 108 24 100 Z" fill={INK} opacity="0.18" />
    {/* front nose + windshield */}
    <path d="M40 70 L26 40 Q24 30 36 28 L48 28" fill="#BFE3F2" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    <circle cx="24" cy="88" r="6" fill="#FFF4CC" stroke={INK} strokeWidth="3" />
    {/* headlight beam while driving */}
    {moving && <path d="M18 84 L-26 74 L-26 102 L18 92 Z" fill="#FFF4CC" opacity="0.45" />}
    {/* side mirror */}
    <path d="M30 34 L18 26" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    <rect x="10" y="20" width="10" height="7" rx="2" fill="#BFE3F2" stroke={INK} strokeWidth="2" />
    {/* side opening with the student */}
    <rect x="96" y="30" width="72" height="42" rx="6" fill="#16130F" opacity="0.9" />
    <circle cx="132" cy="50" r="10" fill="#C98B63" />
    <path d="M118 74 Q132 60 146 74 Z" fill="#2B3FA0" />
    <path d="M118 40 L132 33 L146 40 L132 46 Z" fill={INK} stroke="#F2B705" strokeWidth="1.5" />
    <path d="M144 41 V49" stroke="#F2B705" strokeWidth="2" />
    {/* stripe + plate */}
    <path d="M28 92 H200" stroke="#F2B705" strokeWidth="4" />
    <rect x="160" y="96" width="34" height="10" rx="2" fill="#FFF" stroke={INK} strokeWidth="2" />
    {/* wheels */}
    {[[50, 114], [178, 114]].map(([cx, cy]) => (
      <g key={cx} transform={`translate(${cx} ${cy})`}>
        <g className={moving ? 'animate-spin' : ''} style={{ animationDuration: '0.5s', transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle r="18" fill={INK} />
          <circle r="8" fill="#D9D3C7" />
          <path d="M-8 0 H8 M0 -8 V8" stroke={INK} strokeWidth="2" />
        </g>
      </g>
    ))}
    {/* exhaust puffs while moving, trailing behind */}
    {moving && [0, 1, 2].map((i) => (
      <circle key={i} cx={210 + i * 9} cy={100 - i * 4} r={4 + i * 1.5} fill="#FFFFFF" opacity={0.7 - i * 0.2} />
    ))}
  </svg>
);

// Flat skyline silhouettes: city on the left, campus on the right
const Skyline = ({ side }) => (
  <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMax meet" className="w-full h-full" aria-hidden="true">
    {side === 'left' ? (
      <g fill="#16130F" opacity="0.12">
        <rect x="10" y="60" width="40" height="80" /><rect x="58" y="30" width="34" height="110" />
        <path d="M100 140 V70 Q125 40 150 70 V140 Z" /><rect x="120" y="50" width="10" height="20" />
        <rect x="160" y="80" width="46" height="60" /><rect x="214" y="45" width="28" height="95" />
        <path d="M250 140 V90 L280 60 L310 90 V140 Z" /><rect x="320" y="70" width="36" height="70" />
      </g>
    ) : (
      <g fill="#16130F" opacity="0.12">
        <path d="M30 140 V80 L90 50 L150 80 V140 Z" /><rect x="70" y="90" width="40" height="50" fill="#F2B705" opacity="0.6" />
        <rect x="160" y="40" width="22" height="100" /><path d="M156 40 L171 20 L186 40 Z" />
        <rect x="200" y="70" width="80" height="70" />{[0, 1, 2, 3].map((i) => <rect key={i} x={208 + i * 18} y="80" width="8" height="50" fill="#FAF9F6" opacity="0.5" />)}
        <path d="M290 140 V95 Q330 60 370 95 V140 Z" />
      </g>
    )}
  </svg>
);

const SearchBar = ({ tool, t }) => {
  // Each field types out in its own slice of the form phase
  const slice = T_FORM_END / tool.fields.length;
  const typed = (i, text) => {
    const local = Math.max(0, Math.min(1, (t - i * slice) / (slice * 0.8)));
    return text.slice(0, Math.round(text.length * local));
  };
  const typingIndex = Math.min(tool.fields.length - 1, Math.floor(t / slice));
  const formDone = t >= T_FORM_END - 250;
  const pressed = t >= T_FORM_END && t < T_FORM_END + 260;
  const tapVisible = t >= T_FORM_END - 600 && t < T_FORM_END + 400;

  return (
    <div className="relative rounded-[22px] sm:rounded-full border-[3px] border-[#16130F] bg-white shadow-[6px_6px_0_#16130F] p-2 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
      {tool.fields.map(([label, value], i) => {
        const active = t < T_FORM_END && i === typingIndex;
        return (
          <div key={label} className={`flex-1 min-w-0 rounded-2xl sm:rounded-full px-4 sm:px-5 py-2 transition-colors ${active ? 'bg-[#FFF4CC]' : ''} ${i > 0 ? 'sm:border-l-2 sm:border-[#16130F]/10' : ''}`}>
            <p className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-[0.12em]">{label}</p>
            <p className="text-[14.5px] sm:text-[15.5px] font-bold text-[#16130F] h-6 truncate">
              {typed(i, value)}
              {active && <span className="inline-block w-[2px] h-[16px] bg-[#DE5C2B] ml-0.5 align-middle animate-pulse" />}
            </p>
          </div>
        );
      })}
      <motion.div
        animate={{ scale: pressed ? 0.92 : 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        className={`relative shrink-0 h-12 sm:h-14 px-6 rounded-full flex items-center justify-center gap-2 text-[15px] font-extrabold transition-colors ${formDone ? 'bg-[#DE5C2B] text-white' : 'bg-[#E8E2D6] text-slate-500'}`}
      >
        <Search size={18} /> {tool.button}
        {/* the tap: a finger dot lands on the button and ripples */}
        <AnimatePresence>
          {tapVisible && (
            <motion.span
              key="tap"
              initial={{ opacity: 0, x: 40, y: 34, scale: 1.4 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#16130F]/25 border-2 border-white pointer-events-none"
            >
              {pressed && <span className="absolute inset-0 rounded-full border-2 border-[#16130F] animate-ping" />}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const Results = ({ tool, t }) => {
  const matching = t >= T_FORM_END && t < T_MATCH_END;
  const showResults = t >= T_MATCH_END;
  return (
    <div className="min-h-[136px]">
      <AnimatePresence mode="wait">
        {t < T_FORM_END && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {tool.results.map((r) => (
              <div key={r.name} className="h-[104px] rounded-2xl border-2 border-dashed border-[#16130F]/35 bg-white/35 px-4 py-3 flex flex-col justify-between">
                <span className="self-start text-[11.5px] font-extrabold px-2.5 py-1 rounded-full border-2 border-[#16130F]/30 text-[#16130F]/55">{r.tag}</span>
                <span className="h-2.5 w-2/3 rounded-full bg-[#16130F]/10" />
              </div>
            ))}
            <p className="md:col-span-3 text-center text-[13px] font-bold text-[#16130F]/70">Fill three things. We do the rest.</p>
          </motion.div>
        )}
        {matching && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-[104px] rounded-2xl border-2 border-dashed border-[#16130F]/30 bg-white/50 animate-pulse" />)}
            <p className="md:col-span-3 text-center text-[13px] font-bold text-[#16130F]/70 flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#16130F] border-t-transparent animate-spin" /> {tool.matching}
            </p>
          </motion.div>
        )}
        {showResults && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {tool.results.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 26, rotate: i === 1 ? 0 : i === 0 ? -3 : 3 }}
                animate={{ opacity: 1, y: 0, rotate: i === 1 ? 0 : i === 0 ? -1.2 : 1.2 }}
                transition={{ delay: 0.06 + i * 0.16, type: 'spring', stiffness: 240, damping: 18 }}
                className="rounded-2xl border-[3px] border-[#16130F] bg-white p-4 shadow-[5px_5px_0_#16130F]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-extrabold text-[#16130F] leading-snug">{r.name}</p>
                    <p className="text-[12px] text-slate-600 truncate">{r.meta}</p>
                  </div>
                  <span className="shrink-0 text-[11.5px] font-extrabold px-2.5 py-1 rounded-full border-2 border-[#16130F]" style={{ background: r.tint, color: r.color }}>{r.tag}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-3 rounded-full border-2 border-[#16130F] bg-[#F6F3EC] overflow-hidden">
                    <motion.div className="h-full" style={{ background: r.color }} initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ delay: 0.2 + i * 0.16, duration: 0.6 }} />
                  </div>
                  <span className="font-urbanist text-[16px] font-black text-[#16130F] tabular-nums">{r.pct}%</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ShortlistShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-100px' });
  const reduce = useReducedMotion();
  const [toolIndex, setToolIndex] = useState(0);
  const [t, setT] = useState(reduce ? T_ARRIVE : 0);
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
  const moving = !reduce && autoMoving(t);

  return (
    <section ref={ref} className="relative w-full max-w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFE38A 0%, #FFD45C 100%)' }}>

      <div
        className="relative max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 pb-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Title */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full border-2 border-[#16130F] bg-white text-[12px] font-extrabold text-[#16130F] uppercase tracking-[0.12em]">Free AI tools</span>
          <h2 className="mt-4 text-[32px] sm:text-[46px] lg:text-[54px] font-black text-[#16130F] leading-[1.02] tracking-[-0.035em]">
            Your shortlist, <span className="text-[#C2185B]">in 60 seconds</span><DesiSticker tone="green" tilt={-4}>चुटकी में</DesiSticker>
          </h2>
          <p className="mt-3 text-[15px] sm:text-[17px] font-medium text-[#16130F]/80">Universities, courses and scholarships matched to your profile.</p>
        </div>

        {/* Tool switch + step pills */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
          <div className="flex p-1 rounded-full bg-[#16130F] gap-1">
            {TOOLS.map((tl, i) => {
              const TIcon = tl.icon;
              return (
                <button
                  key={tl.id}
                  type="button"
                  onClick={() => pick(i)}
                  className={`relative h-10 px-4 rounded-full text-[13px] font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors no-shine ${i === toolIndex ? 'text-[#16130F]' : 'text-white/75 hover:text-white'}`}
                >
                  {i === toolIndex && <motion.span layoutId="tool-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <TIcon size={15} className="relative" />
                  <span className="relative">{tl.id === 'uni' ? 'Universities & courses' : 'Scholarships'}</span>
                </button>
              );
            })}
          </div>
          <ol className="flex items-center gap-1.5 list-none p-0 m-0">
            {tool.steps.map((s, i) => (
              <li key={s} className={`px-3 py-1.5 rounded-full border-2 border-[#16130F] text-[12px] font-extrabold transition-colors ${i === step ? 'bg-[#16130F] text-[#F2B705]' : i < step ? 'bg-white text-[#16130F]' : 'bg-transparent text-[#16130F]/60'}`}>
                <span className="tabular-nums">0{i + 1}</span><span className="hidden md:inline"> · {s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* The search bar filling itself */}
        <div className="mt-7 max-w-[1000px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={tool.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <SearchBar tool={tool} t={t} />
              <div className="mt-6"><Results tool={tool} t={t} /></div>
            </motion.div>
          </AnimatePresence>
          <p className="mt-3 text-center text-[11.5px] font-semibold text-[#16130F]/60">Example results. Yours depend on your profile.</p>
        </div>

        <div className="mt-5 flex justify-center">
          <Link to={tool.cta.to} className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[#16130F] hover:bg-[#DE5C2B] text-white text-[15px] font-bold border-2 border-[#16130F] shadow-[4px_4px_0_#FFFFFF] transition-colors no-shine">
            {tool.cta.text} <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      {/* Street: skylines fill the sides, the auto rides along as the shortlist is built */}
      <div className="relative h-[120px] sm:h-[150px] mt-2" aria-hidden="true">
        <div className="absolute left-0 bottom-[34px] w-[45%] h-[110px] sm:h-[130px]"><Skyline side="left" /></div>
        <div className="absolute right-0 bottom-[34px] w-[45%] h-[110px] sm:h-[130px]"><Skyline side="right" /></div>
        <div className="absolute inset-x-0 bottom-0 h-[38px] bg-[#16130F]">
          <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[4px] ${moving ? 'motion-safe:animate-[road_0.6s_linear_infinite]' : ''}`}
            style={{ background: 'repeating-linear-gradient(90deg, #F2B705 0 34px, transparent 34px 64px)' }} />
        </div>
        {/* desi highway milestones; each lights up once the auto has passed it */}
        {[['MATCH', 1 / 3], ['SHORTLIST', 2 / 3], ['CAMPUS', 1]].map(([label, at]) => {
          const x = -4 + at * 84 + 9; // just ahead of where the auto's nose reaches
          const passed = autoX(t) >= -4 + at * 84 - 0.5;
          return (
            <div key={label} className="absolute bottom-[36px] -translate-x-1/2 hidden sm:flex flex-col items-center" style={{ left: `${x}%` }}>
              <div className={`w-[58px] rounded-t-[22px] border-2 border-[#16130F] overflow-hidden transition-colors duration-300 ${passed ? 'shadow-[3px_3px_0_#16130F]' : ''}`}>
                <div className={`h-[16px] transition-colors duration-300 ${passed ? 'bg-[#DE5C2B]' : 'bg-[#F2B705]'}`} />
                <div className="bg-white px-1 pt-0.5 pb-1 text-center">
                  <span className="block text-[8.5px] font-black tracking-[0.06em] text-[#16130F] leading-tight">{label}</span>
                  <span className="block text-[8px] font-bold text-[#16130F]/60">{passed ? '✓' : `${Math.round((1 - at) * 3) + 1} km`}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-[14px] w-[130px] sm:w-[170px] transition-[left] duration-100 ease-linear" style={{ left: `${autoX(t)}%` }}>
          <div className={moving ? 'motion-safe:animate-[auto-bump_0.32s_ease-in-out_infinite]' : ''}>
            <div className="-scale-x-100"><AutoRickshaw moving={moving} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
