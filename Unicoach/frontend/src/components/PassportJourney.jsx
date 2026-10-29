import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { UsVisa, SchengenVisa, AuVisa } from './VisaStickers';

// "Your study-abroad passport": a short pinned section where scrolling turns three passport pages.
// Each page gets a visa sticker (USA, Schengen, Australia) and then its entry stamp. Calm paper palette.
// The passport starts closed on a table; the first bit of scroll swings the cover open, then the
// visas follow. It leans towards the cursor and a real page sweeps over the spine on every turn.
// Arrows, the bars, a tap on the cover or a click on the page also turn it.

const INK = '#16130F';
const MUTED = '#5B544A';
const PAPER = '#F6F3EC';
const PAGE = '#F3F6F1'; // Indian passport visa pages: pale green-blue paper
const NAVY = '#1B2A4A';
const GOLD = '#C9A55A';

// Wavy security lines printed across Indian passport pages
const SecurityLines = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 200 300" aria-hidden="true">
    {Array.from({ length: 22 }, (_, i) => (
      <path key={i} d={`M0 ${8 + i * 13} Q 25 ${2 + i * 13} 50 ${8 + i * 13} T 100 ${8 + i * 13} T 150 ${8 + i * 13} T 200 ${8 + i * 13}`}
        fill="none" stroke={i % 3 === 0 ? '#D9A7B4' : '#9FC3BE'} strokeWidth="0.35" opacity="0.55" />
    ))}
  </svg>
);

// Small bilingual page header, like the top of every passport page
const PageHead = ({ left, right }) => (
  <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[12.5px]" style={{ color: MUTED }}>
    <span className="truncate">{left}</span>
    <span className="font-semibold tracking-[0.18em] text-[10.5px] whitespace-nowrap" style={{ color: '#2E5E5A' }}>भारत · INDIA</span>
    <span className="truncate text-right">{right}</span>
  </div>
);

// Navy cover shown on the left page before the first stamp
const Cover = () => (
  <div className="absolute inset-0 rounded-l-[10px] flex flex-col items-center justify-center text-center" style={{ background: `radial-gradient(120% 90% at 50% 40%, #24365E 0%, ${NAVY} 60%, #131E36 100%)` }}>
    <p className="tracking-[0.35em] text-[13px] font-semibold" style={{ color: GOLD }}>भारत गणराज्य</p>
    <p className="tracking-[0.3em] text-[11px] mt-1" style={{ color: GOLD }}>STUDY ABROAD</p>
    <svg viewBox="0 0 64 48" width="92" height="70" className="my-6" aria-hidden="true">
      <path d="M32 6 2 18l30 12 30-12z" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M14 24v10c0 4 8 8 18 8s18-4 18-8V24" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <path d="M58 20v14" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="58" cy="36" r="2.4" fill={GOLD} />
    </svg>
    <p className="font-outfit text-[30px] font-black tracking-[0.12em]" style={{ color: GOLD }}>पासपोर्ट</p>
    <p className="font-outfit text-[22px] font-bold tracking-[0.42em] mt-1" style={{ color: GOLD }}>PASSPORT</p>
    <svg viewBox="0 0 40 26" width="40" height="26" className="mt-8" aria-hidden="true">
      <rect x="1" y="1" width="38" height="24" rx="4" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <circle cx="20" cy="13" r="6" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <path d="M1 13h13M26 13h13" stroke={GOLD} strokeWidth="1.6" />
    </svg>
    <p className="mt-6 text-[10px] tracking-[0.3em]" style={{ color: 'rgba(201,165,90,0.7)' }}>UNICOACH</p>
  </div>
);

const STEPS = [
  { key: 'us', chapter: 'USA · F-1', title: 'US visa. Stamped.', text: 'DS-160, I-20, funds proof and mock interviews with seniors who cleared theirs.', stamp: 'ADMITTED', sub: 'F-1 · PORT OF ENTRY', color: '#1B2A4A', cta: 'US visa guidance', to: '/book-consultation?service=visa' },
  { key: 'eu', chapter: 'Europe · Schengen', title: 'Schengen visa. Stamped.', text: 'Germany, France, Italy and more: blocked account, insurance and appointment prep.', stamp: 'SCHENGEN', sub: 'ENTRY · STUDIES', color: '#2E4A86', cta: 'Europe visa guidance', to: '/book-consultation?service=visa' },
  { key: 'au', chapter: 'Australia · 500', title: 'Australian visa. Granted.', text: 'Genuine Student answers, OSHC, CoE and funds, prepared step by step.', stamp: 'ARRIVED', sub: 'SUBCLASS 500 · STUDENT', color: '#B3502F', cta: 'Australia visa guidance', to: '/book-consultation?service=visa' },
];

// Fine passport-style rosette: many thin rotated ellipses
const Guilloche = ({ size = 360, color = INK, opacity = 0.07 }) => {
  const rings = useMemo(() => Array.from({ length: 36 }, (_, i) => i * 5), []);
  return (
    <svg viewBox="-100 -100 200 200" width={size} height={size} aria-hidden="true" style={{ opacity }}>
      {rings.map((deg) => (
        <ellipse key={deg} cx="0" cy="0" rx="92" ry="34" fill="none" stroke={color} strokeWidth="0.35" transform={`rotate(${deg})`} />
      ))}
      <circle cx="0" cy="0" r="12" fill="none" stroke={color} strokeWidth="0.5" />
    </svg>
  );
};

// Round rubber stamp with text running around the ring
const Stamp = ({ step, id }) => (
  <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden="true">
    <defs>
      <path id={`ring-${id}`} d="M120,120 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
      <filter id={`ink-${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="2.2" />
      </filter>
    </defs>
    <g filter={`url(#ink-${id})`} fill="none" stroke={step.color} opacity="0.92">
      <circle cx="120" cy="120" r="112" strokeWidth="5" />
      <circle cx="120" cy="120" r="74" strokeWidth="2" />
      <text fontFamily="Onest, ui-monospace, monospace" fontSize="13.5" fontWeight="700" letterSpacing="3.2" fill={step.color} stroke="none">
        <textPath href={`#ring-${id}`} startOffset="0">UNICOACH · STUDY ABROAD · {step.chapter.toUpperCase()} · UNICOACH ·</textPath>
      </text>
      <text x="120" y="98" textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="3" fill={step.color} stroke="none">★ IN ★</text>
      <rect x="22" y="104" width="196" height="40" rx="3" strokeWidth="3" transform="rotate(-6 120 124)" fill={PAGE} fillOpacity="0.6" />
      <text x="120" y="136" textAnchor="middle" fontSize={step.stamp.length > 8 ? 25 : 32} fontWeight="900" letterSpacing="1.5" fill={step.color} stroke="none" transform="rotate(-6 120 124)">{step.stamp}</text>
      <text x="120" y="164" textAnchor="middle" fontSize="8.5" fontWeight="700" letterSpacing="2" fill={step.color} stroke="none">{step.sub}</text>
    </g>
  </svg>
);

// Visa stickers: look-alikes of the US, Schengen and Australian labels, not copies.
// Every one carries a SPECIMEN mark and made-up details. Keys match STEPS.
const VISAS = [
  {
    key: 'us', title: 'UNITED STATES OF AMERICA', badge: 'F-1',
    paper: 'linear-gradient(115deg, #F4D9DF 0%, #F3EBD3 28%, #DCEEDF 52%, #D7E5F3 76%, #E7DCF0 100%)',
    band: '#1B2A4A', accent: '#A23B3B',
    fields: [['Issuing Post', 'MUMBAI'], ['Visa Class', 'F1'], ['Surname', 'UNICOACH'], ['Entries', 'M'], ['Given Names', 'STUDENT'], ['Expires', '11 JUN 2032']],
    mrz: ['VNUSAUNICOACH<<STUDENT<<<<<<<<<<<<<<<<<<<<', 'UC2027050<1IND0412067F3206119<<<<<<<<<<<<<<'],
  },
  {
    key: 'eu', title: 'VISA · ÉTATS SCHENGEN', badge: 'D',
    paper: 'linear-gradient(120deg, #DCE8F3 0%, #E6F0E7 40%, #F3EED9 70%, #E1E7F4 100%)',
    band: '#2E4A86', accent: '#2E4A86',
    fields: [['Valid for', 'SCHENGEN'], ['Type', 'D · STUDIES'], ['From', '01-09-27'], ['Until', '31-08-28'], ['Entries', 'MULT'], ['Duration', '365 days']],
    mrz: ['VDD<<UNICOACH<<STUDENT<<<<<<<<<<<<<<<<<<<<', 'UC20270512IND0412067F2808314<<<<<<<<<<<<<<'],
  },
  {
    key: 'au', title: 'AUSTRALIA VISA', badge: '500',
    paper: 'repeating-linear-gradient(135deg, #F7DCCD 0 9px, #FBEEE6 9px 18px)',
    band: '#B3502F', accent: '#9C4426',
    fields: [['Subclass', '500 · STUDENT'], ['Granted', '20 JUN 2027'], ['Arrive by', '30 SEP 2027'], ['Stay until', '31 DEC 2029'], ['Conditions', '8105 · 8202'], ['Entries', 'MULTIPLE']],
    mrz: ['V500<AUSUNICOACH<<STUDENT<<<<<<<<<<<<<<<<', 'UC20270533IND0412067F2912318<<<<<<<<<<<<<<'],
  },
];

// Each visa follows its real label's layout (see VisaStickers.jsx); details are made up and marked SPECIMEN
const STICKER_BY_KEY = { us: UsVisa, eu: SchengenVisa, au: AuVisa };
const VisaSticker = ({ v }) => {
  const Sticker = STICKER_BY_KEY[v.key];
  return (
    <div className="relative w-full rounded-[7px] overflow-hidden border shadow-[0_14px_30px_-14px_rgba(22,19,15,0.45)]" style={{ borderColor: 'rgba(22,19,15,0.12)' }}>
      <Sticker />
    </div>
  );
};

// Wooden rubber stamp: handle, block and inked rubber pad in the visa's colour
const Stamper = ({ color }) => (
  <svg viewBox="0 0 100 150" width="100%" height="100%" aria-hidden="true">
    <defs>
      <linearGradient id="wood" x1="0" x2="1">
        <stop offset="0" stopColor="#7A4A26" /><stop offset="0.5" stopColor="#A9703F" /><stop offset="1" stopColor="#6B3F1F" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="20" r="17" fill="url(#wood)" />
    <rect x="41" y="30" width="18" height="46" rx="6" fill="url(#wood)" />
    <rect x="10" y="74" width="80" height="34" rx="7" fill="url(#wood)" />
    <rect x="10" y="74" width="80" height="6" rx="3" fill="#000" opacity="0.12" />
    <rect x="13" y="108" width="74" height="14" rx="3" fill="#2A2420" />
    <rect x="15" y="121" width="70" height="7" rx="2" fill={color} />
  </svg>
);

// One visa page: the sticker goes on, tilts under the cursor, then a rubber stamp thumps the entry mark onto the corner
const HIT = 1.5; // seconds after the visa appears that the stamp lands
const VisaPage = ({ v, step, reduce }) => {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 180, damping: 18 });
  const rotX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 180, damping: 18 });
  const shine = useTransform(mx, [0, 1], ['-60%', '160%']);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.div className="relative w-[92%] sm:w-full mx-auto max-w-[380px]"
      style={reduce ? undefined : { rotateX: rotX, rotateY: rotY, transformPerspective: 900 }}
      onMouseMove={reduce ? undefined : onMove} onMouseLeave={reduce ? undefined : onLeave}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18, rotate: -3, scale: 1.04 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5, scale: 1 }}
      transition={{ delay: reduce ? 0 : 0.45, type: 'spring', stiffness: 320, damping: 26 }}>
      {/* the thump: the sticker jolts down a touch when the stamp hits */}
      <motion.div initial={false} animate={reduce ? {} : { y: [0, 0, 4, -1, 0], scale: [1, 1, 0.985, 1.003, 1] }}
        transition={{ delay: HIT - 0.02, duration: 0.32, times: [0, 0.05, 0.3, 0.65, 1] }}>
      <VisaSticker v={v} />
      </motion.div>
      {/* holographic sheen that follows the cursor */}
      {!reduce && (
        <span aria-hidden="true" className="absolute inset-0 rounded-[7px] pointer-events-none mix-blend-soft-light overflow-hidden">
          <motion.span className="absolute top-0 bottom-0 w-1/2" style={{ left: shine, background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.75), rgba(190,230,255,0.5), transparent)' }} />
        </span>
      )}
      {/* entry mark: appears the instant the stamp hits */}
      <motion.div className="absolute right-1 -bottom-8 w-[36%] aspect-square pointer-events-none"
        initial={reduce ? { opacity: 0 } : { scale: 1.06, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 0.95, rotate: -10 }}
        transition={{ delay: reduce ? 0 : HIT, duration: 0.12, ease: 'easeOut' }}>
        <Stamp step={step} id={`entry-${step.key}`} />
      </motion.div>
      {/* the rubber stamp itself: drops, presses (squashes), lifts away */}
      {!reduce && (
        <motion.div className="absolute right-[3%] bottom-[-2.2rem] w-[32%] pointer-events-none z-20" style={{ aspectRatio: '100 / 150', transformOrigin: '50% 100%', z: 60 }}
          initial={{ y: '-130%', opacity: 0, rotate: -10 }}
          animate={{ y: ['-130%', '-118%', '0%', '0%', '-150%'], opacity: [0, 1, 1, 1, 0], scaleY: [1, 1, 0.9, 1, 1] }}
          transition={{ delay: HIT - 0.45, duration: 1.05, times: [0, 0.18, 0.43, 0.6, 1], ease: ['easeOut', 'easeIn', 'linear', 'easeIn'] }}>
          <Stamper color={step.color} />
        </motion.div>
      )}
      {/* little ink puff at the moment of impact */}
      {!reduce && (
        <motion.span className="absolute right-[6%] bottom-[-1.4rem] w-[30%] aspect-square rounded-full pointer-events-none"
          style={{ border: `2px solid ${step.color}` }}
          initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: [0.6, 1.25], opacity: [0, 0.35, 0] }}
          transition={{ delay: HIT, duration: 0.45 }} />
      )}
    </motion.div>
  );
};

const Mrz = ({ step, i }) => (
  <div className="font-mono text-[10px] sm:text-[11px] leading-[1.7] tracking-[0.12em]" style={{ color: 'rgba(22,19,15,0.55)' }}>
    <div className="truncate">{`P<INDYOU<<${step.stamp}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`}</div>
    <div className="truncate">{`UC20270${i + 1}<IND<STUDY<ABROAD<<<<<<<<<<<<<<<<<<<<`}</div>
  </div>
);

const PassportJourney = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [closed, setClosed] = useState(true);
  // slot 0 opens the cover, slots 1..3 are the visas
  const SLOTS = STEPS.length + 1;

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const slot = Math.min(SLOTS - 1, Math.max(0, Math.floor(v * SLOTS * 0.999)));
    setClosed(slot === 0);
    const next = Math.max(0, slot - 1);
    setIdx((cur) => {
      if (next !== cur) setDir(next > cur ? 1 : -1);
      return next;
    });
  });

  // Lying on a table: tilted back, a touch rotated, and it leans towards the cursor
  // phones get a gentler tilt so the whole passport stays on screen
  const narrow = typeof window !== 'undefined' && window.innerWidth < 768;
  const BASE_X = reduce ? 0 : narrow ? 14 : 34;
  const BASE_Z = reduce || narrow ? 0 : -5;
  const tiltX = useSpring(useMotionValue(BASE_X), { stiffness: 120, damping: 18 });
  const tiltZ = useSpring(useMotionValue(BASE_Z), { stiffness: 120, damping: 18 });
  const onTableMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tiltX.set(BASE_X + y * -10);
    tiltZ.set(BASE_Z + x * 6);
  };
  const onTableLeave = () => { tiltX.set(BASE_X); tiltZ.set(BASE_Z); };

  // Cover opening, tied to the first slot of scroll: swings round the spine like a real passport
  const openRaw = useTransform(scrollYProgress, [0.02, 0.8 / SLOTS], [0, 1], { clamp: true });
  const openP = useSpring(openRaw, { stiffness: 140, damping: 24 });
  const coverRot = useTransform(openP, [0, 1], [0, -180]);
  const coverVis = useTransform(openP, (p) => (p > 0.995 ? 'hidden' : 'visible'));
  const coverFade = useTransform(openP, [0.55, 1], [1, narrow ? 0 : 1]);
  // closed, the book sits centred; opening slides it right as the left page appears
  const bookX = useTransform(openP, [0, 1], [narrow ? '0%' : '-25%', '0%']);
  const spreadClip = useTransform(openP, (p) => (narrow || p > 0.97 ? 'inset(-60px)' : 'inset(-60px -60px -60px 50%)'));
  const shadowLeft = useTransform(openP, [0, 1], [narrow ? '-4%' : '46%', '-4%']);

  // Turning by click scrolls the page to that visa, so scroll and clicks always agree
  const goTo = (target) => {
    const el = ref.current;
    if (!el) return;
    const t = Math.max(0, Math.min(STEPS.length - 1, target));
    const span = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + span * ((t + 1.5) / SLOTS);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const step = STEPS[idx];
  const prev = idx > 0 ? STEPS[idx - 1] : null;
  const visaOf = (st) => VISAS.find((x) => x.key === st.key);

  return (
    <section ref={ref} aria-label="Your study-abroad passport" style={{ height: `${(STEPS.length + 1) * 60 + 40}vh`, background: PAPER }} className="relative w-full">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-14 items-center">
          {/* Left: chapter copy that follows the passport */}
          <div className="min-w-0">
            <p className="flex items-center gap-3 text-[13px]" style={{ color: MUTED }}>
              <span className="inline-block w-10 h-[2px] bg-[#DE5C2B]" />
              {closed ? `Your study-abroad passport · ${STEPS.length} visas inside` : `Your study-abroad passport · Visa ${idx + 1} of ${STEPS.length}`}
            </p>
            <AnimatePresence mode="wait">
              {closed ? (
                <motion.div key="closed" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                  <p className="mt-6 text-[14px] font-semibold text-[#DE5C2B]">Ready to fly</p>
                  <h2 className="mt-2 font-outfit text-[30px] sm:text-[54px] lg:text-[64px] font-black leading-[0.98] tracking-[-0.045em]" style={{ color: INK }}>
                    Your passport. Open it.
                  </h2>
                  <p className="mt-4 text-[17px] sm:text-[19px] leading-relaxed max-w-md" style={{ color: MUTED }}>Three visas, three countries. Scroll and we stamp them one by one.</p>
                  <button type="button" onClick={() => goTo(0)} className="no-shine mt-7 inline-flex items-center gap-3 h-14 pl-6 pr-2 rounded-full border-2 bg-transparent text-[16px] font-semibold transition-colors hover:bg-[#16130F] hover:text-white group cursor-pointer" style={{ borderColor: INK, color: INK }}>
                    Open the passport
                    <span className="w-10 h-10 rounded-full grid place-items-center text-white" style={{ background: INK }}>
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                </motion.div>
              ) : (
              <motion.div key={step.key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                <p className="mt-6 text-[14px] font-semibold" style={{ color: step.color }}>{step.chapter}</p>
                <h2 className="mt-2 font-outfit text-[30px] sm:text-[54px] lg:text-[64px] font-black leading-[0.98] tracking-[-0.045em]" style={{ color: INK }}>
                  {step.title}
                </h2>
                <p className="mt-4 text-[17px] sm:text-[19px] leading-relaxed max-w-md" style={{ color: MUTED }}>{step.text}</p>
                <Link to={step.to} className="no-shine mt-7 inline-flex items-center gap-3 h-14 pl-6 pr-2 rounded-full border-2 bg-transparent text-[16px] font-semibold transition-colors hover:bg-[#16130F] hover:text-white group" style={{ borderColor: INK, color: INK }}>
                  {step.cta}
                  <span className="w-10 h-10 rounded-full grid place-items-center text-white" style={{ background: INK }}>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
              )}
            </AnimatePresence>
            {/* Progress: tap a bar or the arrows to turn the passport */}
            <div className="mt-10 flex items-center gap-3">
              <button type="button" onClick={() => goTo(idx - 1)} disabled={closed || idx === 0} aria-label="Previous visa" className="no-shine w-10 h-10 rounded-full border-2 grid place-items-center transition-colors disabled:opacity-30 enabled:hover:bg-[#16130F] enabled:hover:text-white cursor-pointer disabled:cursor-default" style={{ borderColor: INK, color: INK }}>
                <ArrowLeft size={16} />
              </button>
              {STEPS.map((s, i) => (
                <button key={s.key} type="button" onClick={() => goTo(i)} aria-label={`Show ${s.chapter}`} className="no-shine py-3 cursor-pointer">
                  <span className="block h-[3px] w-12 rounded-full overflow-hidden" style={{ background: 'rgba(22,19,15,0.12)' }}>
                    <motion.span className="block h-full" style={{ background: INK }} animate={{ width: !closed && i <= idx ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
                  </span>
                </button>
              ))}
              <button type="button" onClick={() => goTo(closed ? 0 : idx + 1)} disabled={!closed && idx === STEPS.length - 1} aria-label="Next visa" className="no-shine w-10 h-10 rounded-full border-2 grid place-items-center transition-colors disabled:opacity-30 enabled:hover:bg-[#16130F] enabled:hover:text-white cursor-pointer disabled:cursor-default" style={{ borderColor: INK, color: INK }}>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right: the open passport, lying on the table */}
          <div style={{ perspective: 1600 }} onMouseMove={onTableMove} onMouseLeave={onTableLeave} className="py-6 min-w-0 lg:px-10">
            <motion.div className="relative" style={{ x: bookX, rotateX: tiltX, rotateZ: tiltZ, transformStyle: 'preserve-3d', transformOrigin: '50% 60%' }}>
              {/* soft shadow on the table */}
              <motion.div aria-hidden="true" className="absolute right-[-4%] -bottom-10 h-24 rounded-[50%] blur-2xl pointer-events-none" style={{ left: shadowLeft, background: 'rgba(22,19,15,0.28)', transform: 'translateZ(-40px)' }} />
              {/* front cover: swings open round the spine, then the visa pages take over */}
              <motion.button type="button" aria-label="Open the passport" onClick={() => goTo(0)}
                className="no-shine absolute top-0 bottom-0 left-0 w-full md:left-1/2 md:w-1/2 z-30 cursor-pointer"
                style={{ rotateY: coverRot, opacity: coverFade, visibility: coverVis, transformOrigin: 'left center', transformStyle: 'preserve-3d', z: 2 }}>
                <span className="absolute inset-0 rounded-[10px] md:rounded-l-[3px] overflow-hidden shadow-[8px_10px_24px_-10px_rgba(22,19,15,0.5)]" style={{ backfaceVisibility: 'hidden' }}>
                  <Cover />
                  <motion.span animate={closed ? { opacity: [0.45, 1, 0.45] } : { opacity: 0 }} transition={{ duration: 1.8, repeat: Infinity }}
                    className="absolute bottom-5 inset-x-0 text-center text-[11px] tracking-[0.25em]" style={{ color: GOLD }}>SCROLL OR TAP TO OPEN</motion.span>
                </span>
                <span className="absolute inset-0 rounded-[10px] overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <Cover />
                </span>
              </motion.button>
              <motion.div className="relative" style={{ clipPath: spreadClip }}>
              {/* page stack peeking out at the edges, like a thick passport */}
              <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-[10px] border" style={{ background: '#E6EAE3', borderColor: 'rgba(22,19,15,0.08)' }} />
              <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-[10px] border" style={{ background: '#EDF0EA', borderColor: 'rgba(22,19,15,0.08)' }} />
              <div className="relative grid grid-cols-1 md:grid-cols-2 rounded-[10px] overflow-hidden" style={{ background: PAGE, border: `6px solid ${NAVY}` }}>
                {/* spine: shadow + stitching down the middle */}
                <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(22,19,15,0.10) 45%, rgba(22,19,15,0.16) 50%, rgba(22,19,15,0.10) 55%, transparent)' }} />
                <div className="hidden md:block absolute top-4 bottom-4 left-1/2 w-0 z-10 pointer-events-none" style={{ borderLeft: '1.5px dashed rgba(27,42,74,0.35)' }} />
                {/* Left page: the visa before, checked */}
                <div className="hidden md:flex relative flex-col justify-between p-6 min-h-[520px]">
                  <SecurityLines />
                  {!prev && <Cover />}
                  {prev && <PageHead left="Checked" right={prev.chapter} />}
                  <div className="relative grid grid-cols-[minmax(0,1fr)] place-items-center flex-1">
                    <div className="absolute inset-0 grid place-items-center"><Guilloche size={340} color="#2E5E5A" opacity={0.08} /></div>
                    {prev ? (
                      <motion.div key={`prev-${prev.key}`} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="relative w-full max-w-[290px] grayscale -rotate-2">
                        <VisaSticker v={visaOf(prev)} />
                        <div className="absolute right-0 -bottom-7 w-[34%] aspect-square"><Stamp step={prev} id={`p${idx}`} /></div>
                        <span className="absolute -bottom-3 left-4 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#1E8A5A] shadow-sm"><Check size={12} strokeWidth={3} /> Checked</span>
                      </motion.div>
                    ) : null}
                  </div>
                  {prev && (
                    <div className="relative">
                      <p className="text-center text-[15px] mb-3" style={{ color: INK }}>{prev.chapter}. Done.</p>
                      <div className="border-t border-dashed pt-3 opacity-60" style={{ borderColor: 'rgba(22,19,15,0.2)' }}><Mrz step={prev} i={idx - 1} /></div>
                    </div>
                  )}
                </div>

                {/* The page that sweeps over the spine on every turn */}
                {!reduce && (
                  <motion.div
                    key={`sweep-${idx}`}
                    aria-hidden="true"
                    className="hidden md:block absolute top-0 bottom-0 w-1/2 z-20 pointer-events-none"
                    style={{ left: dir > 0 ? '50%' : 0, transformOrigin: dir > 0 ? 'left center' : 'right center', background: `linear-gradient(${dir > 0 ? 90 : 270}deg, rgba(22,19,15,0.10), ${PAGE} 22%, ${PAGE})`, boxShadow: '0 0 30px rgba(22,19,15,0.18)' }}
                    initial={{ rotateY: 0, opacity: idx === 0 ? 0 : 1 }}
                    animate={{ rotateY: dir > 0 ? -180 : 180, opacity: [idx === 0 ? 0 : 1, idx === 0 ? 0 : 1, 0] }}
                    transition={{ duration: 0.75, ease: [0.45, 0.05, 0.25, 1], opacity: { times: [0, 0.85, 1], duration: 0.75 } }}
                  />
                )}

                {/* Right page: turns, gets its visa, then stamped. Click it to turn to the next visa. */}
                <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                  <motion.div
                    key={step.key}
                    custom={dir}
                    initial={reduce ? { opacity: 0 } : { rotateY: dir > 0 ? 70 : -70, opacity: 0 }}
                    animate={reduce ? { opacity: 1 } : { rotateY: 0, opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { rotateY: dir > 0 ? -70 : 70, opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
                    style={{ transformOrigin: 'left center', background: PAGE }}
                    className={`relative flex flex-col justify-between p-6 min-h-[480px] md:min-h-[520px] ${idx < STEPS.length - 1 ? 'cursor-pointer' : ''}`}
                    onClick={() => (closed ? goTo(0) : idx < STEPS.length - 1 && goTo(idx + 1))}
                  >
                    <SecurityLines />
                    <PageHead left={`Page 0${idx + 1}`} right={step.chapter} />
                    <div className="relative grid grid-cols-[minmax(0,1fr)] place-items-center flex-1 overflow-clip">
                      <div className="absolute inset-0 grid place-items-center"><Guilloche size={420} color={step.color} opacity={0.09} /></div>
                      {/* "checking" scan line, then the visa goes on and gets stamped */}
                      {!reduce && !closed && (
                        <motion.span key={`scan-${step.key}`} className="absolute left-6 right-6 h-[2px] rounded-full" style={{ background: step.color, boxShadow: `0 0 18px ${step.color}` }}
                          initial={{ top: '12%', opacity: 0 }} animate={{ top: ['12%', '88%'], opacity: [0, 0.7, 0] }} transition={{ duration: 0.7, delay: 0.25 }} />
                      )}
                      {!closed && <VisaPage key={`visa-${step.key}`} v={visaOf(step)} step={step} reduce={reduce} />}
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 1.1 }} className="absolute bottom-3 text-[11px]" style={{ color: MUTED }}>
                        Entered · 2027 · 0{idx + 1}
                      </motion.p>
                    </div>
                    <div className="relative">
                      <p className="text-center text-[15px] mb-3" style={{ color: INK }}>{step.title}</p>
                      <div className="border-t border-dashed pt-3" style={{ borderColor: 'rgba(22,19,15,0.2)' }}><Mrz step={step} i={idx} /></div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              </motion.div>
            </motion.div>
            <p className="mt-8 text-center text-[12px]" style={{ color: MUTED }}>{closed ? 'Scroll or tap the cover to open it' : 'Scroll, tap the page or use the arrows to turn it'}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PassportJourney;
