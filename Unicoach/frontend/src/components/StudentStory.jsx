import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Hand, MessageSquare } from 'lucide-react';

// "Student ki kahani" as a live 1:1 video session inside UniCoach (a video-call layout, our own design,
// not any other company's branding). The mentor shares her screen step by step while live captions run.
// Names and numbers are illustrative; no phone numbers are ever shared between students and mentors.

const MENTOR = { name: 'Prachi', src: '/images/mentors/cutouts/prachi.webp', bg: 'radial-gradient(120% 110% at 15% 0%, #FFF1EC 0%, #FFD3C6 55%, #F7AE9A 100%)' };

// Destination in the heading keeps changing: "Ek call se Dublin tak", "... Toronto tak", ...
const CITIES = ['Dublin', 'Toronto', 'London', 'Sydney', 'Boston', 'Berlin', 'Melbourne'];

const RotatingCity = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % CITIES.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-flex overflow-hidden align-bottom pb-[0.08em]" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={CITIES[i]} className="inline-block text-[#DE5C2B] whitespace-nowrap"
          initial={{ y: '70%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-70%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}>
          {CITIES[i]} tak
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const STEPS = [
  {
    key: 'shortlist', label: 'Shortlist', hi: 'Sahi university',
    student: '7.8 CGPA hai, Ireland mein Data Science. Kaunsi uni?',
    mentor: 'Dekho, tumhare marks aur budget pe ye shortlist bani hai.',
    screen: { title: 'Shortlist · Ireland · MSc Data Science', rows: [['Trinity College Dublin', 'Dublin', 54], ['University College Dublin', 'Dublin', 78], ['University of Galway', 'Galway', 92]] },
  },
  {
    key: 'scholarship', label: 'Scholarships', hi: 'Paisa bachao',
    student: 'Fees bahut zyada hai yaar 😅',
    mentor: 'Tension nahi. Tumhare profile pe ye scholarships ban rahi hain.',
    screen: { title: 'Scholarships you qualify for', big: '₹4,20,000', note: 'of ₹18L first-year fees', pct: 23, chips: ['Govt. of Ireland', 'UCD merit award'] },
  },
  {
    key: 'loan', label: 'Loan', hi: 'Fund ka jugaad',
    student: 'Baaki ka paisa? Papa ki FD nahi todni 🙏',
    mentor: 'Bina collateral loan, teen lenders compare kiye.',
    screen: { title: 'Education loan · no collateral · ₹20L', lenders: [['Lender A', 10.5], ['Lender B', 11.2], ['Lender C', 9.8]], emi: '₹22,600 / month' },
  },
  {
    key: 'ielts', label: 'IELTS', hi: 'Score pakka',
    student: 'Mock mein 6 aaya tha...',
    mentor: 'Writing pe kaam karenge. Do hafte, roz ek essay.',
    screen: { title: 'IELTS plan · 14 days', bands: [['Mock 1', 6], ['Day 7', 6.5], ['Day 14', 7]] },
  },
  {
    key: 'sop', label: 'SOP', hi: 'Kahani dumdaar',
    student: 'SOP likhna nahi aata 😬',
    mentor: 'Apni kahani sunao, main likhwati hoon. Radio wala kissa daalna!',
    screen: { title: 'SOP_UCD.docx · reviewed', from: 62, to: 91, checks: ['Opening hook', 'Why this course', 'Career goal'] },
  },
  {
    key: 'visa', label: 'Visa', hi: 'Visa stamp done',
    student: 'VISA APPROVED!!! 🎉',
    mentor: 'Dublin mein milte hain! Airport pick-up ka bhi plan hai 😄',
    screen: { title: 'Visa status · Ireland Stamp 2', track: ['Documents', 'Biometrics', 'Decision'], stamp: 'APPROVED' },
  },
];

const REACTIONS = ['👏', '🎯', '💸', '💪', '✍️', '🎉'];

// Warm terracotta-to-salmon palette (cocoa, terracotta, salmon, peach, blush)
const C = { cocoa: '#5C2E2A', terra: '#A9543F', salmon: '#E39A86', peach: '#F4C7B8', blush: '#FBEAE3', good: '#2F8F6A' };

// how long the student asks, then how long the mentor presents (ms)
const PHASE_MS = [1100, 2300];

// little animated sound bars for whoever is talking
const Wave = ({ on, className = '' }) => (
  <span className={`inline-flex items-end gap-[2px] h-3 ${className}`}>
    {[0, 1, 2, 3].map((i) => (
      <motion.span key={i} className="w-[3px] rounded-full bg-[#F4C7B8]" animate={on ? { height: [3, 12, 5, 10, 3] } : { height: 3 }} transition={on ? { duration: 0.8, repeat: Infinity, delay: i * 0.12 } : { duration: 0.2 }} />
    ))}
  </span>
);

const Tile = ({ who, speaking, live = false, children }) => (
  <div className={`relative rounded-2xl overflow-hidden bg-[#F7F1EC] transition-shadow duration-300 ${speaking ? 'ring-[3px] ring-[#C9705F]' : 'ring-0'}`}>
    {children}
    <span className="absolute left-2 bottom-2 flex items-center gap-1 text-[11px] font-medium text-white bg-black/45 rounded-md px-1.5 py-0.5">
      {speaking || live ? <Wave on /> : <MicOff size={11} className="text-red-400" />} {who}
    </span>
  </div>
);

// Each shared screen is a small infographic of that step
const Screen = ({ s }) => {
  const sc = s.screen;
  return (
    <motion.div key={s.key} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="absolute inset-0 p-3 sm:p-5 bg-white flex flex-col">
      <p className="text-[10.5px] sm:text-[12px] font-semibold text-slate-500 truncate pr-1 sm:pr-28">{sc.title}</p>
      <div className="flex-1 flex flex-col justify-center min-h-0">

        {/* Shortlist: chance of getting in, as bars */}
        {sc.rows && (
          <div className="space-y-2.5">
            {sc.rows.map(([u, t, p], i) => {
              const col = p >= 80 ? C.good : p >= 65 ? C.terra : C.salmon;
              return (
                <motion.div key={u} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.14 }}>
                  <div className="flex items-center gap-2 text-[12.5px] sm:text-[13.5px]">
                    <span className="flex-1 font-semibold text-[#111] truncate">{u}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.blush, color: C.terra }}>{t}</span>
                    <span className="w-9 text-right font-bold" style={{ color: col }}>{p}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-[#F3ECE7] overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: col }} initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ delay: 0.2 + i * 0.14, duration: 0.5 }} />
                  </div>
                </motion.div>
              );
            })}
            <p className="text-[10.5px] text-slate-500 pt-0.5">Chance of getting in, from your marks and budget</p>
          </div>
        )}

        {/* Scholarship: how much of the fees it covers */}
        {sc.pct && (
          <div className="flex items-center gap-2.5 sm:gap-4">
            <svg viewBox="0 0 80 80" className="w-[62px] sm:w-[100px] shrink-0 -rotate-90" aria-hidden="true">
              <circle cx="40" cy="40" r="32" fill="none" stroke={C.blush} strokeWidth="12" />
              <motion.circle cx="40" cy="40" r="32" fill="none" stroke={C.terra} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32} initial={{ strokeDashoffset: 2 * Math.PI * 32 }} animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - sc.pct / 100) }} transition={{ delay: 0.15, duration: 0.7 }} />
              <text x="40" y="45" textAnchor="middle" transform="rotate(90 40 40)" fontFamily="Urbanist, sans-serif" fontWeight="800" fontSize="16" fill={C.cocoa}>{sc.pct}%</text>
            </svg>
            <div className="min-w-0">
              <p className="text-[19px] sm:text-[30px] font-bold text-[#111] tracking-[-0.03em] leading-none whitespace-nowrap">{sc.big}</p>
              <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 mt-1">{sc.note}</p>
              <div className="mt-2 hidden sm:flex flex-wrap gap-1.5">
                {sc.chips.map((c) => <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.blush, color: C.terra }}>{c}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* Loan: three lenders' rates compared, best one picked */}
        {sc.lenders && (() => {
          const best = Math.min(...sc.lenders.map((l) => l[1]));
          return (
            <div className="space-y-1.5 sm:space-y-2">
              {sc.lenders.map(([n, r], i) => {
                const on = r === best;
                return (
                  <div key={n} className="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-[12.5px]">
                    <span className={`w-[52px] sm:w-16 shrink-0 whitespace-nowrap font-semibold ${on ? 'text-[#111]' : 'text-slate-500'}`}>{n}</span>
                    <div className="flex-1 h-4 sm:h-5 rounded-md bg-[#F3ECE7] overflow-hidden">
                      <motion.div className="h-full rounded-md" style={{ background: on ? C.good : C.peach }} initial={{ width: 0 }} animate={{ width: `${(r / 12) * 100}%` }} transition={{ delay: 0.1 + i * 0.14, duration: 0.45 }} />
                    </div>
                    <span className="w-10 sm:w-12 text-right font-bold" style={{ color: on ? C.good : C.cocoa }}>{r}%</span>
                  </div>
                );
              })}
              <p className="pt-1 text-[11px] sm:text-[12.5px] font-semibold text-[#111] leading-snug">Lowest rate · EMI <span className="whitespace-nowrap" style={{ color: C.good }}>{sc.emi}</span></p>
            </div>
          );
        })()}

        {/* IELTS: band climbing to the target line */}
        {sc.bands && (
          <div className="relative flex items-end gap-4 h-[110px]">
            <span className="absolute left-0 right-0 border-t-2 border-dashed" style={{ bottom: `${(7 - 5) * 34 + 18}px`, borderColor: C.good }} />
            <span className="absolute right-0 text-[10px] font-bold" style={{ bottom: `${(7 - 5) * 34 + 21}px`, color: C.good }}>Target 7</span>
            {sc.bands.map(([l, b], i) => (
              <div key={l} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[13px] font-bold" style={{ color: C.cocoa }}>{b}</span>
                <motion.div className="w-full rounded-t-lg" style={{ background: b >= 7 ? C.good : i === 0 ? C.peach : C.salmon }} initial={{ height: 0 }} animate={{ height: `${(b - 5) * 34}px` }} transition={{ delay: 0.1 + i * 0.16, duration: 0.35 }} />
                <span className="text-[11px] text-slate-500">{l}</span>
              </div>
            ))}
          </div>
        )}

        {/* SOP: strength meter from before to after, and what got fixed */}
        {sc.checks && (
          <div className="flex items-center gap-2 sm:gap-4">
            <svg viewBox="0 0 110 66" className="w-[78px] sm:w-[130px] shrink-0" aria-hidden="true">
              <path d="M9 58 A46 46 0 0 1 101 58" fill="none" stroke={C.blush} strokeWidth="11" strokeLinecap="round" />
              <motion.path d="M9 58 A46 46 0 0 1 101 58" fill="none" stroke={C.good} strokeWidth="11" strokeLinecap="round" pathLength="100"
                strokeDasharray="100" initial={{ strokeDashoffset: 100 - sc.from }} animate={{ strokeDashoffset: 100 - sc.to }} transition={{ delay: 0.2, duration: 0.8 }} />
              <text x="55" y="52" textAnchor="middle" fontFamily="Urbanist, sans-serif" fontWeight="800" fontSize="20" fill={C.cocoa}>{sc.to}</text>
              <text x="55" y="64" textAnchor="middle" fontFamily="Onest, sans-serif" fontSize="8" fill="#64748B">was {sc.from}</text>
            </svg>
            <ul className="space-y-1 sm:space-y-1.5 min-w-0">
              {sc.checks.map((c, i) => (
                <motion.li key={c} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }} className="flex items-start gap-1.5 text-[10.5px] sm:text-[12.5px] leading-tight font-semibold text-[#111] sm:whitespace-nowrap">
                  <span className="w-4 h-4 shrink-0 rounded-full grid place-items-center text-white text-[9px]" style={{ background: C.good }}>✓</span>{c}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Visa: every stage ticked, then the stamp */}
        {sc.track && (
          <div>
            <div className="relative flex items-start justify-between">
              <span className="absolute left-4 right-4 top-[13px] h-[3px] rounded-full" style={{ background: C.good }} />
              {[...sc.track, 'Approved'].map((t, i) => (
                <motion.div key={t} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 + i * 0.15 }} className="relative flex flex-col items-center gap-1 w-16">
                  <span className="w-7 h-7 rounded-full grid place-items-center text-white text-[12px] font-bold" style={{ background: i === sc.track.length ? C.terra : C.good }}>{i === sc.track.length ? '★' : '✓'}</span>
                  <span className="text-[10.5px] font-semibold text-center text-[#111] leading-tight">{t}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <motion.span initial={{ scale: 2.4, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: -8 }} transition={{ delay: 0.75, type: 'spring', stiffness: 380, damping: 16 }}
                className="px-4 py-1.5 rounded-md border-[3px] bg-white/95 text-[16px] font-extrabold tracking-wider" style={{ borderColor: C.terra, color: C.terra }}>{sc.stamp}</motion.span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StudentStory = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-120px' });
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState(0); // 0 = student speaks, 1 = mentor speaks + shares screen
  const [secs, setSecs] = useState(754);
  // the call controls actually work: mute, camera, captions, raise hand, next screen, end/rejoin
  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [ended, setEnded] = useState(false);
  const [bursts, setBursts] = useState([]); // floating reactions the visitor sent
  const react = (emoji) => {
    setBursts((b) => {
      const id = (b.length ? b[b.length - 1].id : 0) + 1;
      return [...b, { id, emoji, x: 10 + ((id * 37) % 60) }];
    });
  };
  // each reaction removes itself once it has floated away
  useEffect(() => {
    if (!bursts.length) return undefined;
    const t = setTimeout(() => setBursts((b) => b.slice(1)), 1500);
    return () => clearTimeout(t);
  }, [bursts]);
  const nextScreen = () => {
    if (phase === 0) setPhase(1);
    else { setPhase(0); setStep((x) => (x + 1) % STEPS.length); }
  };

  useEffect(() => {
    if (!inView || hovered || ended) return undefined;
    const t = setTimeout(() => {
      if (phase === 0) setPhase(1);
      else { setPhase(0); setStep((x) => (x + 1) % STEPS.length); }
    }, phase === 0 ? PHASE_MS[0] : PHASE_MS[1]);
    return () => clearTimeout(t);
  }, [inView, phase, step, hovered, ended]);

  useEffect(() => {
    if (!inView) return undefined;
    const t = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [inView]);

  const s = STEPS[step];
  const mentorTalking = phase === 1;
  const clock = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <section ref={ref} className="w-full max-w-full overflow-hidden bg-white">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 py-20 sm:py-28 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
        <div>
          <span className="flex items-center gap-3 text-[14px] font-semibold text-[#86351A]"><span className="inline-block w-10 h-[2px] bg-[#DE5C2B]" />Student ki kahani</span>
          {/* city on its own line, so the heading never jumps as the city changes */}
          <h2 className="mt-4 font-outfit text-[38px] sm:text-[54px] xl:text-[62px] font-bold text-[#111] leading-[1.02] tracking-[-0.035em]">
            Ek call se<br /><RotatingCity />
          </h2>
          <p className="mt-5 text-[16px] sm:text-[19px] leading-relaxed text-slate-600 max-w-[540px]">Aarav ne apne senior ke saath 1:1 video session liya. Har sawaal pe screen share, har step pe plan.</p>

          <ol className="mt-9 grid grid-cols-3 gap-3 max-w-[580px]">
            {STEPS.map((x, i) => {
              const done = i < step;
              const now = i === step;
              return (
                <li key={x.key}>
                  <button type="button" onClick={() => { setStep(i); setPhase(0); }} className={`no-shine w-full text-left rounded-2xl px-3.5 sm:px-4 py-3 sm:py-3.5 border transition-all duration-300 cursor-pointer ${now ? 'bg-white border-[#DE5C2B] shadow-[0_10px_24px_-14px_rgba(222,92,43,0.65)]' : done ? 'bg-white border-slate-200' : 'bg-[#FAF8F4] border-[#EEE8DE] hover:bg-white'}`}>
                    <span className={`block text-[14px] sm:text-[16px] font-semibold leading-tight ${now || done ? 'text-[#111]' : 'text-slate-600'}`}>{done ? '✓ ' : ''}{x.label}</span>
                    <span className="block text-[12px] sm:text-[13px] leading-tight mt-1" style={{ fontFamily: "'Yatra One', sans-serif", color: now || done ? '#B8451A' : '#57534E' }}>{x.hi}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-9">
            <Link to="/unicoach" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-slate-900 hover:bg-[#DE5C2B] text-white text-[15px] font-semibold transition-colors">
              Book a 1:1 session <ArrowRight size={16} />
            </Link>
            <p className="mt-4 text-[13px] text-slate-500">Calls happen inside UniCoach. No phone numbers shared. Story is illustrative.</p>
          </div>
        </div>

        {/* Video call window */}
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="relative rounded-[26px] bg-white border border-[#ECE6DA] p-3 sm:p-5 shadow-[0_40px_90px_-40px_rgba(15,23,42,0.32)]">
          <div className="flex items-center justify-between text-slate-700 text-[12px] sm:text-[13px] px-1 pb-3 sm:pb-4">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> UniCoach 1:1 session · {clock}</span>
            <span className="hidden sm:inline text-slate-400">Aarav × Prachi</span>
          </div>

          <div className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_170px] xl:grid-cols-[1fr_190px] gap-3 sm:gap-4">
            {/* shared screen */}
            <div className="relative rounded-2xl overflow-hidden bg-[#FBF7F3] border border-[#EFE6DD] aspect-[4/3] sm:aspect-auto sm:min-h-[300px]">
              <AnimatePresence mode="wait">
                {mentorTalking ? (
                  <Screen key={s.key} s={s} />
                ) : (
                  <motion.div key={`ask-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#FDF8F4] via-[#FAF1EA] to-[#F5E6DC]">
                    <motion.span animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#485A79] to-[#DE5C2B] grid place-items-center text-white text-[32px] font-bold ring-4 ring-[#C9705F]/60">A</motion.span>
                    <span className="flex items-center gap-2 text-slate-700 text-[13px]"><Wave on /> Aarav is asking…</span>
                    <span className="flex items-center gap-1.5 text-slate-500 text-[11.5px]"><MonitorUp size={13} /> Prachi will share her screen next</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {bursts.map((b) => (
                  <motion.span key={b.id} initial={{ opacity: 0, y: 10, scale: 0.6 }} animate={{ opacity: [0, 1, 1, 0], y: [10, -30, -90, -140], scale: [0.6, 1.25, 1, 1] }} transition={{ duration: 1.5 }}
                    className="absolute bottom-4 z-20 text-[28px] pointer-events-none" style={{ left: `${b.x}%` }}>{b.emoji}</motion.span>
                ))}
              </AnimatePresence>
              {mentorTalking && <span className="hidden sm:inline absolute top-2 right-2 z-10 text-[10.5px] font-semibold text-white bg-[#A9543F] rounded-md px-2 py-0.5">Prachi is presenting</span>}
              <AnimatePresence>
                {mentorTalking && (
                  <motion.span
                    key={`r-${step}`}
                    initial={{ opacity: 0, y: 20, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [20, -10, -60, -110], scale: [0.6, 1.2, 1, 1] }}
                    transition={{ duration: 1.6, delay: 0.6 }}
                    className="absolute left-4 bottom-4 z-10 text-[30px] pointer-events-none"
                  >
                    {REACTIONS[step]}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* participants */}
            <div className="flex flex-col gap-3">
              <Tile who="Prachi" speaking={mentorTalking}>
                <div className="aspect-square" style={{ background: MENTOR.bg }}>
                  <img src={MENTOR.src} alt="" className="w-full h-full object-cover object-top" />
                </div>
              </Tile>
              <Tile who="Aarav (you)" speaking={!mentorTalking} live={!muted}>
                <div className={`aspect-square grid place-items-center ${camOn ? 'bg-gradient-to-br from-[#F8ECE4] to-[#EFD8CB]' : 'bg-[#EEE8E2]'}`}>
                  <span className="w-12 h-12 rounded-full bg-white/70 grid place-items-center text-[#1B2A4A] text-[20px] font-bold">A</span>
                  {!camOn && <span className="absolute top-2 right-2 text-[10px] text-slate-500">Camera off</span>}
                </div>
              </Tile>
            </div>
          </div>

          {/* live captions */}
          {captions && <div className="mt-3 min-h-[48px] rounded-xl bg-[#FAF6F1] border border-[#F0E8DF] px-3 py-2 text-[13px] sm:text-[14px] text-slate-800 leading-snug">
            <AnimatePresence mode="wait">
              <motion.p key={`${step}-${phase}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <span className="font-semibold text-[#A9543F]">{mentorTalking ? 'Prachi' : 'Aarav'}:</span> {mentorTalking ? s.mentor : s.student}
              </motion.p>
            </AnimatePresence>
          </div>}

          {/* session progress (click a segment to jump) */}
          <div className="mt-3 flex gap-1.5">
            {STEPS.map((x, i) => (
              <button type="button" key={x.key} aria-label={`Go to ${x.label}`} onClick={() => { setStep(i); setPhase(0); setEnded(false); }} className="no-shine flex-1 h-1 rounded-full bg-slate-200 overflow-hidden cursor-pointer hover:bg-slate-300">
                <motion.span className="block h-full bg-[#DE5C2B]" animate={{ width: i < step ? '100%' : i === step ? (mentorTalking ? '100%' : '35%') : '0%' }} transition={{ duration: i === step ? (mentorTalking ? PHASE_MS[1] / 1000 : PHASE_MS[0] / 1000) : 0.3, ease: 'linear' }} />
              </button>
            ))}
          </div>

          {/* controls */}
          <div className="mt-3 flex items-center justify-center gap-1.5 sm:gap-2.5">
            {[
              { I: muted ? MicOff : Mic, label: muted ? 'Unmute' : 'Mute', on: !muted, act: () => setMuted((m) => !m) },
              { I: camOn ? Video : VideoOff, label: camOn ? 'Turn camera off' : 'Turn camera on', on: false, act: () => setCamOn((c) => !c) },
              { I: MonitorUp, label: 'Next screen', on: mentorTalking, act: nextScreen },
              { I: Hand, label: 'Raise hand', on: false, act: () => react('✋') },
              { I: MessageSquare, label: captions ? 'Hide captions' : 'Show captions', on: captions, act: () => setCaptions((c) => !c) },
            ].map(({ I, label, on, act }) => (
              <motion.button type="button" key={label} title={label} aria-label={label} onClick={act} whileTap={{ scale: 0.88 }}
                className={`no-shine w-9 h-9 sm:w-10 sm:h-10 rounded-full grid place-items-center cursor-pointer transition-colors ${on ? 'bg-[#DE5C2B] text-white' : 'bg-[#F5F1EC] text-slate-700 hover:bg-[#ECE5DD]'}`}><I size={17} /></motion.button>
            ))}
            <motion.button type="button" title="End call" aria-label="End call" onClick={() => setEnded(true)} whileTap={{ scale: 0.9 }} className="no-shine w-12 h-9 sm:w-14 sm:h-10 rounded-full grid place-items-center bg-[#EA4335] hover:bg-[#d33426] text-white cursor-pointer"><PhoneOff size={17} /></motion.button>
          </div>
          {/* quick reactions */}
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {['👍', '❤️', '😂', '🔥', '🙏'].map((e) => (
              <button type="button" key={e} onClick={() => react(e)} aria-label={`React ${e}`} className="no-shine w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[16px] cursor-pointer transition-transform hover:scale-110">{e}</button>
            ))}
          </div>
          <AnimatePresence>
            {ended && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 rounded-[22px] bg-white/95 flex flex-col items-center justify-center gap-3 text-slate-900">
                <p className="text-[16px] font-semibold">You left the session</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEnded(false)} className="no-shine px-4 h-10 rounded-full bg-[#DE5C2B] text-white font-semibold text-[13.5px] cursor-pointer">Rejoin</button>
                  <Link to="/unicoach#mentors-grid" className="px-4 h-10 rounded-full bg-[#DE5C2B] text-white font-semibold text-[13.5px] grid place-items-center">Book a real one</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default StudentStory;
