import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

// "Your study-abroad passport": a short pinned section where scrolling turns three passport pages.
// Each page gets a visa sticker (USA, Schengen, Australia) and then its entry stamp. Calm paper palette.

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
      <text fontFamily="Geist, ui-monospace, monospace" fontSize="13.5" fontWeight="700" letterSpacing="3.2" fill={step.color} stroke="none">
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

// Small national-style mark per sticker (stylised, no real seals)
const VisaMark = ({ v }) => {
  if (v.key === 'eu') {
    return (
      <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
        <rect width="40" height="40" rx="4" fill={v.band} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={20 + Math.cos(a) * 11} cy={20 + Math.sin(a) * 11} r="1.9" fill="#E9C46A" />;
        })}
      </svg>
    );
  }
  if (v.key === 'au') {
    return (
      <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
        <rect width="40" height="40" rx="4" fill={v.band} />
        {[[13, 12, 3.2], [27, 10, 2.4], [30, 22, 2.6], [22, 30, 3], [18, 21, 1.6]].map(([x, y, r], i) => (
          <path key={i} fill="#FBEEE6" d={Array.from({ length: 10 }, (_, k) => { const ang = (k * Math.PI) / 5 - Math.PI / 2; const rr = k % 2 ? r * 0.45 : r; return `${k ? 'L' : 'M'}${(x + Math.cos(ang) * rr).toFixed(2)} ${(y + Math.sin(ang) * rr).toFixed(2)}`; }).join(' ') + 'Z'} />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
      <rect width="40" height="40" rx="4" fill={v.band} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="4" y={6 + i * 6} width="32" height="3" rx="1.5" fill={i % 2 ? '#FFFFFF' : v.accent} opacity="0.9" />)}
    </svg>
  );
};

const VisaSticker = ({ v }) => (
  <div className="relative w-full aspect-[1.48/1] rounded-[7px] overflow-hidden border shadow-[0_14px_30px_-14px_rgba(22,19,15,0.45)]" style={{ background: v.paper, borderColor: 'rgba(22,19,15,0.12)' }}>
    {/* fine guilloche + wavy security print */}
    <div className="absolute -right-10 -top-12 opacity-60"><Guilloche size={220} color={v.band} opacity={0.18} /></div>
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 68" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M0 ${6 + i * 7} Q 12 ${3 + i * 7} 25 ${6 + i * 7} T 50 ${6 + i * 7} T 75 ${6 + i * 7} T 100 ${6 + i * 7}`} fill="none" stroke={v.band} strokeWidth="0.15" opacity="0.35" />
      ))}
    </svg>

    {/* header */}
    <div className="relative flex items-center gap-2 px-[5%] pt-[3.5%]">
      <span className="w-[9%] aspect-square shrink-0"><VisaMark v={v} /></span>
      <span className="font-outfit font-black tracking-[0.18em] text-[17px] sm:text-[19px] leading-none" style={{ color: v.band }}>VISA</span>
      <span className="ml-auto text-right font-bold tracking-[0.12em] text-[7.5px] sm:text-[8px] leading-tight max-w-[48%]" style={{ color: v.accent }}>{v.title}</span>
    </div>

    {/* photo + fields */}
    <div className="relative flex gap-[4%] px-[5%] pt-[3%]">
      <div className="w-[22%] aspect-[3/4] shrink-0 rounded-[3px] border overflow-hidden" style={{ background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(22,19,15,0.15)' }}>
        <svg viewBox="0 0 30 40" className="w-full h-full" aria-hidden="true">
          <circle cx="15" cy="15" r="7" fill="rgba(22,19,15,0.22)" />
          <path d="M3 40c0-8 5.5-13 12-13s12 5 12 13z" fill="rgba(22,19,15,0.22)" />
        </svg>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-[3px] flex-1 min-w-0 font-mono">
        {v.fields.map(([k, val]) => (
          <div key={k} className="min-w-0">
            <dt className="text-[6.5px] sm:text-[7px] uppercase tracking-wide truncate" style={{ color: 'rgba(22,19,15,0.5)' }}>{k}</dt>
            <dd className="text-[8.5px] sm:text-[9.5px] font-bold truncate" style={{ color: INK }}>{val}</dd>
          </div>
        ))}
      </dl>
      <span className="absolute right-[5%] -bottom-1 font-outfit font-black text-[18px] opacity-80" style={{ color: v.accent }}>{v.badge}</span>
    </div>

    {/* machine-readable zone */}
    <div className="absolute inset-x-0 bottom-0 px-[5%] pb-[3%] pt-[2%] font-mono text-[7px] sm:text-[7.5px] leading-[1.45] tracking-[0.06em] bg-white/35" style={{ color: 'rgba(22,19,15,0.7)' }}>
      {v.mrz.map((l) => <div key={l} className="truncate">{l}</div>)}
    </div>

    {/* SPECIMEN: this is an illustration, not a document */}
    <span className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] font-outfit font-black tracking-[0.3em] text-[22px] pointer-events-none select-none" style={{ color: 'rgba(179,64,52,0.28)' }}>SPECIMEN</span>
  </div>
);

// One visa page: the sticker goes on, tilts under the cursor, then its entry stamp lands on the corner
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
    <motion.div className="relative w-full max-w-[330px]"
      style={reduce ? undefined : { rotateX: rotX, rotateY: rotY, transformPerspective: 900 }}
      onMouseMove={reduce ? undefined : onMove} onMouseLeave={reduce ? undefined : onLeave}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18, rotate: -3, scale: 1.04 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5, scale: 1 }}
      transition={{ delay: reduce ? 0 : 0.45, type: 'spring', stiffness: 320, damping: 26 }}>
      <VisaSticker v={v} />
      {/* holographic sheen that follows the cursor */}
      {!reduce && (
        <span aria-hidden="true" className="absolute inset-0 rounded-[7px] pointer-events-none mix-blend-soft-light overflow-hidden">
          <motion.span className="absolute top-0 bottom-0 w-1/2" style={{ left: shine, background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.75), rgba(190,230,255,0.5), transparent)' }} />
        </span>
      )}
      {/* entry stamp lands on the corner of the sticker */}
      <motion.div className="absolute right-1 -bottom-8 w-[36%] aspect-square pointer-events-none"
        initial={reduce ? { opacity: 0 } : { scale: 1.9, opacity: 0, rotate: -26 }}
        animate={{ scale: 1, opacity: 0.95, rotate: -10 }}
        transition={{ delay: reduce ? 0 : 1.05, type: 'spring', stiffness: 420, damping: 16 }}>
        <Stamp step={step} id={`entry-${step.key}`} />
      </motion.div>
    </motion.div>
  );
};

const Mrz = ({ step, i }) => (
  <div className="font-mono text-[10px] sm:text-[11px] leading-[1.7] tracking-[0.12em]" style={{ color: 'rgba(22,19,15,0.55)' }}>
    <div className="truncate">{`P<INDUNICOACH<<${step.stamp}<<<<<<<<<<<<<<<<<<<<<<<<<`}</div>
    <div className="truncate">{`UC20270${i + 1}<IND<STUDY<ABROAD<<<<<<<<<<<<<<<<<<<<`}</div>
  </div>
);

const PassportJourney = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length * 0.999)));
    setIdx((cur) => {
      if (next !== cur) setDir(next > cur ? 1 : -1);
      return next;
    });
  });

  const step = STEPS[idx];
  const prev = idx > 0 ? STEPS[idx - 1] : null;
  const visaOf = (st) => VISAS.find((x) => x.key === st.key);

  return (
    <section ref={ref} aria-label="Your study-abroad passport" style={{ height: `${STEPS.length * 60 + 40}vh`, background: PAPER }} className="relative w-full">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-14 items-center">
          {/* Left: chapter copy that follows the passport */}
          <div>
            <p className="flex items-center gap-3 text-[13px]" style={{ color: MUTED }}>
              <span className="inline-block w-10 h-[2px] bg-[#DE5C2B]" />
              Your study-abroad passport · Visa {idx + 1} of {STEPS.length}
            </p>
            <AnimatePresence mode="wait">
              <motion.div key={step.key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                <p className="mt-6 text-[14px] font-semibold" style={{ color: step.color }}>{step.chapter}</p>
                <h2 className="mt-2 font-outfit text-[38px] sm:text-[54px] lg:text-[64px] font-black leading-[0.98] tracking-[-0.045em]" style={{ color: INK }}>
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
            </AnimatePresence>
            {/* Progress */}
            <div className="mt-10 flex gap-2">
              {STEPS.map((s, i) => (
                <span key={s.key} className="h-[3px] w-12 rounded-full overflow-hidden" style={{ background: 'rgba(22,19,15,0.12)' }}>
                  <motion.span className="block h-full" style={{ background: INK }} animate={{ width: i <= idx ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
                </span>
              ))}
            </div>
          </div>

          {/* Right: the open passport */}
          <div style={{ perspective: 1800 }}>
            <div className="relative">
              {/* page stack peeking out at the edges, like a thick passport */}
              <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-[10px] border" style={{ background: '#E6EAE3', borderColor: 'rgba(22,19,15,0.08)' }} />
              <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-[10px] border" style={{ background: '#EDF0EA', borderColor: 'rgba(22,19,15,0.08)' }} />
              <div className="relative grid md:grid-cols-2 rounded-[10px] overflow-hidden shadow-[0_40px_80px_-40px_rgba(22,19,15,0.5)]" style={{ background: PAGE, border: `6px solid ${NAVY}` }}>
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

                {/* Right page: turns, gets its visa, then stamped */}
                <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                  <motion.div
                    key={step.key}
                    custom={dir}
                    initial={reduce ? { opacity: 0 } : { rotateY: dir > 0 ? 70 : -70, opacity: 0 }}
                    animate={reduce ? { opacity: 1 } : { rotateY: 0, opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { rotateY: dir > 0 ? -70 : 70, opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
                    style={{ transformOrigin: 'left center', background: PAGE }}
                    className="relative flex flex-col justify-between p-6 min-h-[480px] md:min-h-[520px]"
                  >
                    <SecurityLines />
                    <PageHead left={`Page 0${idx + 1}`} right={step.chapter} />
                    <div className="relative grid grid-cols-[minmax(0,1fr)] place-items-center flex-1 overflow-clip">
                      <div className="absolute inset-0 grid place-items-center"><Guilloche size={420} color={step.color} opacity={0.09} /></div>
                      {/* "checking" scan line, then the visa goes on and gets stamped */}
                      {!reduce && (
                        <motion.span key={`scan-${step.key}`} className="absolute left-6 right-6 h-[2px] rounded-full" style={{ background: step.color, boxShadow: `0 0 18px ${step.color}` }}
                          initial={{ top: '12%', opacity: 0 }} animate={{ top: ['12%', '88%'], opacity: [0, 0.7, 0] }} transition={{ duration: 0.7, delay: 0.25 }} />
                      )}
                      <VisaPage key={`visa-${step.key}`} v={visaOf(step)} step={step} reduce={reduce} />
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
            </div>
            <p className="mt-5 text-center text-[12px]" style={{ color: MUTED }}>Scroll to turn the page</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PassportJourney;
