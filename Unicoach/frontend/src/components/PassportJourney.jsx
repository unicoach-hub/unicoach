import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

// "Your study-abroad passport": a pinned section where scrolling turns the pages of a passport and
// each step of the journey gets its stamp (checked first, then stamped). Calm paper palette, UniCoach orange.

const INK = '#16130F';
const MUTED = '#5B544A';
const PAPER = '#F6F3EC';
const PAGE = '#FBF9F4';

const STEPS = [
  { key: 'shortlist', chapter: 'Shortlisted', title: 'The right universities.', text: 'Safe, target and dream picks that match your marks, budget and intake.', stamp: 'SHORTLISTED', sub: 'SAFE · TARGET · DREAM', color: '#DE5C2B', cta: 'Search programs', price: 'Free', to: '/search-programs' },
  { key: 'apply', chapter: 'Applied', title: 'Applications that stand out.', text: 'SOP, LOR and documents checked by seniors who got in.', stamp: 'APPLIED', sub: 'SOP · LOR · DOCUMENTS', color: '#B8912F', cta: 'SOP review', price: '₹500', to: '/book-consultation?service=sop' },
  { key: 'offer', chapter: 'Offer', title: 'An offer in hand.', text: 'Know which offer to accept, what to pay and by when.', stamp: 'OFFER', sub: 'ADMIT RECEIVED', color: '#DE5C2B', cta: 'Talk to a mentor', price: '1:1', to: '/unicoach' },
  { key: 'fund', chapter: 'Funded', title: 'Scholarships and loans sorted.', text: 'Funding you qualify for, and the documents banks ask for.', stamp: 'FUNDED', sub: 'SCHOLARSHIP · LOAN', color: '#1E8A5A', cta: 'Find scholarships', price: 'Free', to: '/search-programs?highlight=scholarship' },
  { key: 'visa', chapter: 'Visa approved', title: 'Visa approved. Bags packed.', text: 'Visa file, funds proof and interview prep, step by step.', stamp: 'VISA', sub: 'APPROVED · BON VOYAGE', color: '#0D2B36', cta: 'Visa guidance', price: '₹500', to: '/book-consultation?service=visa' },
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

  return (
    <section ref={ref} aria-label="Your study-abroad passport" style={{ height: `${STEPS.length * 75 + 25}vh`, background: PAPER }} className="relative w-full">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-14 items-center">
          {/* Left: chapter copy that follows the passport */}
          <div>
            <p className="flex items-center gap-3 text-[13px]" style={{ color: MUTED }}>
              <span className="inline-block w-10 h-[2px] bg-[#DE5C2B]" />
              Your study-abroad passport · Stamp {idx + 1} of {STEPS.length}
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
                  <span className="h-10 px-3.5 rounded-full grid place-items-center text-[15px] font-bold text-white" style={{ background: INK }}>{step.price}</span>
                  <ArrowRight size={16} className="mr-2 transition-transform group-hover:translate-x-0.5" />
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
          <div className="relative" style={{ perspective: 1800 }}>
            <div className="relative grid md:grid-cols-2 rounded-[6px] shadow-[0_40px_80px_-40px_rgba(22,19,15,0.45)]" style={{ background: PAGE }}>
              {/* Left page: the stamp before, checked */}
              <div className="hidden md:flex relative flex-col justify-between p-6 min-h-[520px] border-r" style={{ borderColor: 'rgba(22,19,15,0.10)' }}>
                <div className="flex justify-between text-[13px]" style={{ color: MUTED }}>
                  <span>{prev ? 'Checked' : 'Passport'}</span>
                  <span>{prev ? prev.chapter : 'UniCoach'}</span>
                </div>
                <div className="relative grid place-items-center flex-1">
                  <div className="absolute inset-0 grid place-items-center"><Guilloche size={340} /></div>
                  {prev ? (
                    <motion.div key={`prev-${prev.key}`} initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} className="relative w-[210px] h-[210px] grayscale">
                      <Stamp step={prev} id={`p${idx}`} />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#1E8A5A] shadow-sm"><Check size={12} strokeWidth={3} /> Checked</span>
                    </motion.div>
                  ) : (
                    <div className="relative text-center">
                      <p className="font-outfit text-[28px] font-black tracking-tight" style={{ color: INK }}>Study Abroad</p>
                      <p className="mt-1 text-[12px] tracking-[0.3em]" style={{ color: MUTED }}>PASSPORT · UNICOACH</p>
                    </div>
                  )}
                </div>
                <p className="text-center text-[15px]" style={{ color: INK }}>{prev ? `${prev.chapter}. Done.` : 'Your journey starts here.'}</p>
              </div>

              {/* Right page: turns, gets checked, then stamped */}
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
                  <div className="flex justify-between text-[13px]" style={{ color: MUTED }}>
                    <span>Page 0{idx + 1}</span>
                    <span>{step.chapter}</span>
                  </div>
                  <div className="relative grid place-items-center flex-1 overflow-hidden">
                    <div className="absolute inset-0 grid place-items-center"><Guilloche size={420} color={step.color} opacity={0.09} /></div>
                    {/* "checking" scan line, then the stamp lands */}
                    {!reduce && (
                      <motion.span key={`scan-${step.key}`} className="absolute left-6 right-6 h-[2px] rounded-full" style={{ background: step.color, boxShadow: `0 0 18px ${step.color}` }}
                        initial={{ top: '12%', opacity: 0 }} animate={{ top: ['12%', '88%'], opacity: [0, 0.7, 0] }} transition={{ duration: 0.7, delay: 0.25 }} />
                    )}
                    <motion.div
                      key={`stamp-${step.key}`}
                      className="relative w-[230px] h-[230px] sm:w-[260px] sm:h-[260px]"
                      initial={reduce ? { opacity: 0 } : { scale: 1.9, opacity: 0, rotate: -18 }}
                      animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: -8 }}
                      transition={{ delay: reduce ? 0 : 0.85, type: 'spring', stiffness: 420, damping: 18 }}
                    >
                      <Stamp step={step} id={`s${idx}`} />
                    </motion.div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 1.1 }} className="absolute bottom-3 text-[11px]" style={{ color: MUTED }}>
                      Entered · 2027 · 0{idx + 1}
                    </motion.p>
                  </div>
                  <div>
                    <p className="text-center text-[15px] mb-3" style={{ color: INK }}>{step.title}</p>
                    <div className="border-t border-dashed pt-3" style={{ borderColor: 'rgba(22,19,15,0.2)' }}><Mrz step={step} i={idx} /></div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="mt-4 text-center text-[12px]" style={{ color: MUTED }}>Scroll to turn the page</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PassportJourney;
