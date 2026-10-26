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
    mentor: 'Dekho, teen category bana di: Dream, Target, Safe.',
    screen: { title: 'Shortlist · Ireland · MSc Data Science', rows: [['Trinity College Dublin', 'Dream', 54], ['University College Dublin', 'Target', 78], ['University of Galway', 'Safe', 92]] },
  },
  {
    key: 'scholarship', label: 'Scholarships', hi: 'Paisa bachao',
    student: 'Fees bahut zyada hai yaar 😅',
    mentor: 'Tension nahi. Tumhare profile pe ye scholarships ban rahi hain.',
    screen: { title: 'Scholarships you qualify for', big: '₹4,20,000', note: 'Govt. of Ireland + university merit award' },
  },
  {
    key: 'loan', label: 'Loan', hi: 'Fund ka jugaad',
    student: 'Baaki ka paisa? Papa ki FD nahi todni 🙏',
    mentor: 'Bina collateral loan, teen lenders compare kiye.',
    screen: { title: 'Education loan · no collateral', big: '₹22,600 / month', note: '₹20L · 10 years · 3 lenders compared' },
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
    screen: { title: 'SOP_UCD.docx · reviewed', lines: [96, 100, 82, 90], tag: '✓ Strength 62 → 91' },
  },
  {
    key: 'visa', label: 'Visa', hi: 'Visa stamp done',
    student: 'VISA APPROVED!!! 🎉',
    mentor: 'Dublin mein milte hain! Airport pick-up ka bhi plan hai 😄',
    screen: { title: 'Visa status', stamp: 'APPROVED' },
  },
];

const REACTIONS = ['👏', '🎯', '💸', '💪', '✍️', '🎉'];

// how long the student asks, then how long the mentor presents (ms)
const PHASE_MS = [1100, 2300];

// little animated sound bars for whoever is talking
const Wave = ({ on, className = '' }) => (
  <span className={`inline-flex items-end gap-[2px] h-3 ${className}`}>
    {[0, 1, 2, 3].map((i) => (
      <motion.span key={i} className="w-[3px] rounded-full bg-[#8AB4F8]" animate={on ? { height: [3, 12, 5, 10, 3] } : { height: 3 }} transition={on ? { duration: 0.8, repeat: Infinity, delay: i * 0.12 } : { duration: 0.2 }} />
    ))}
  </span>
);

const Tile = ({ who, speaking, live = false, children }) => (
  <div className={`relative rounded-2xl overflow-hidden bg-[#1E3368] transition-shadow duration-300 ${speaking ? 'ring-[3px] ring-[#8AB4F8]' : 'ring-0'}`}>
    {children}
    <span className="absolute left-2 bottom-2 flex items-center gap-1 text-[11px] font-medium text-white bg-black/45 rounded-md px-1.5 py-0.5">
      {speaking || live ? <Wave on /> : <MicOff size={11} className="text-red-400" />} {who}
    </span>
  </div>
);

const Screen = ({ s }) => (
  <motion.div key={s.key} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="absolute inset-0 p-4 sm:p-5 bg-white flex flex-col">
    <p className="text-[11px] sm:text-[12px] font-semibold text-slate-500">{s.screen.title}</p>
    <div className="flex-1 flex flex-col justify-center">
      {s.screen.rows && s.screen.rows.map(([u, t, p], i) => (
        <motion.div key={u} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.14 }} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
          <span className="flex-1 text-[13px] sm:text-[14px] font-semibold text-[#111] truncate">{u}</span>
          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${t === 'Dream' ? 'bg-orange-100 text-orange-700' : t === 'Target' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{t}</span>
          <span className="w-10 text-right text-[13px] font-bold">{p}%</span>
        </motion.div>
      ))}
      {s.screen.big && (
        <>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="text-[30px] sm:text-[38px] font-bold text-[#111] tracking-[-0.03em] leading-none">{s.screen.big}</motion.p>
          <p className="text-[12.5px] text-slate-500 mt-2">{s.screen.note}</p>
        </>
      )}
      {s.screen.bands && (
        <div className="flex items-end gap-4 h-[110px]">
          {s.screen.bands.map(([l, b], i) => (
            <div key={l} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[13px] font-bold text-[#C04A1D]">{b}</span>
              <motion.div className="w-full rounded-t-lg bg-[#93B4FF]" initial={{ height: 0 }} animate={{ height: `${(b - 5) * 34}px` }} transition={{ delay: 0.1 + i * 0.16, duration: 0.35 }} />
              <span className="text-[11px] text-slate-500">{l}</span>
            </div>
          ))}
        </div>
      )}
      {s.screen.lines && (
        <div>
          {s.screen.lines.map((w, i) => (
            <motion.div key={i} className="h-2.5 rounded-full bg-[#E9E1FF] mb-2.5" initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ delay: 0.08 + i * 0.16, duration: 0.35 }} />
          ))}
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} className="inline-block mt-1 text-[12px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5">{s.screen.tag}</motion.span>
        </div>
      )}
      {s.screen.stamp && (
        <div className="relative mx-auto w-[120px] h-[150px] rounded-lg bg-[#1E3A5F] grid place-items-center">
          <span className="text-[10px] font-bold text-amber-200 tracking-[0.2em]">PASSPORT</span>
          <motion.span initial={{ scale: 2.4, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: -14 }} transition={{ delay: 0.3, type: 'spring', stiffness: 380, damping: 16 }} className="absolute -right-8 bottom-5 px-3 py-1 rounded-md border-[3px] border-[#7C3F33] text-[#7C3F33] bg-white/95 text-[14px] font-extrabold tracking-wider">{s.screen.stamp}</motion.span>
        </div>
      )}
    </div>
  </motion.div>
);

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
    <section ref={ref} className="w-full max-w-full overflow-hidden bg-[#D9ECFF]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-center">
        <div>
          <span className="text-[13px] font-semibold text-[#86351A]">Student ki kahani</span>
          <h2 className="mt-2 font-outfit text-[32px] sm:text-[44px] font-bold text-[#111] leading-[1.05] tracking-[-0.035em]">
            Ek call se <RotatingCity />
          </h2>
          <p className="mt-3 text-[15px] sm:text-[17px] text-slate-600 max-w-[460px]">Aarav ne apne senior ke saath 1:1 video session liya. Har sawaal pe screen share, har step pe plan.</p>

          <ol className="mt-7 grid grid-cols-3 gap-2.5 max-w-[460px]">
            {STEPS.map((x, i) => {
              const done = i < step;
              const now = i === step;
              return (
                <li key={x.key}>
                  <button type="button" onClick={() => { setStep(i); setPhase(0); }} className={`no-shine w-full text-left rounded-xl px-3 py-2.5 border transition-all duration-300 cursor-pointer ${now ? 'bg-white border-[#DE5C2B] shadow-[0_8px_20px_-12px_rgba(222,92,43,0.6)]' : done ? 'bg-white border-slate-200' : 'bg-transparent border-slate-200/70 hover:bg-white'}`}>
                    <span className={`block text-[13.5px] font-semibold leading-tight ${now || done ? 'text-[#111]' : 'text-slate-600'}`}>{done ? '✓ ' : ''}{x.label}</span>
                    <span className="block text-[11.5px] leading-tight mt-0.5" style={{ fontFamily: "'Yatra One', sans-serif", color: now || done ? '#B8451A' : '#57534E' }}>{x.hi}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-7">
            <Link to="/unicoach" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-slate-900 hover:bg-[#DE5C2B] text-white text-[14px] font-semibold transition-colors">
              Book a 1:1 session <ArrowRight size={16} />
            </Link>
            <p className="mt-3 text-[12.5px] text-slate-600">Calls happen inside UniCoach. No phone numbers shared. Story is illustrative.</p>
          </div>
        </div>

        {/* Video call window */}
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="relative rounded-[22px] bg-[#3A150A] p-3 sm:p-4 shadow-[0_40px_80px_-30px_rgba(15,23,42,0.6)]">
          <div className="flex items-center justify-between text-white/85 text-[12px] px-1 pb-3">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> UniCoach 1:1 session · {clock}</span>
            <span className="hidden sm:inline text-white/60">Aarav × Prachi</span>
          </div>

          <div className="grid grid-cols-[1fr_120px] sm:grid-cols-[1fr_150px] gap-3">
            {/* shared screen */}
            <div className="relative rounded-2xl overflow-hidden bg-[#1E3368] aspect-[4/3] sm:aspect-[16/11]">
              <AnimatePresence mode="wait">
                {mentorTalking ? (
                  <Screen key={s.key} s={s} />
                ) : (
                  <motion.div key={`ask-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#3B2A6B] via-[#2B2D31] to-[#4A2618]">
                    <motion.span animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#485A79] to-[#DE5C2B] grid place-items-center text-white text-[32px] font-bold ring-4 ring-[#8AB4F8]/60">A</motion.span>
                    <span className="flex items-center gap-2 text-white/85 text-[13px]"><Wave on /> Aarav is asking…</span>
                    <span className="flex items-center gap-1.5 text-white/45 text-[11.5px]"><MonitorUp size={13} /> Prachi will share her screen next</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {bursts.map((b) => (
                  <motion.span key={b.id} initial={{ opacity: 0, y: 10, scale: 0.6 }} animate={{ opacity: [0, 1, 1, 0], y: [10, -30, -90, -140], scale: [0.6, 1.25, 1, 1] }} transition={{ duration: 1.5 }}
                    className="absolute bottom-4 z-20 text-[28px] pointer-events-none" style={{ left: `${b.x}%` }}>{b.emoji}</motion.span>
                ))}
              </AnimatePresence>
              {mentorTalking && <span className="absolute top-2 right-2 z-10 text-[10.5px] font-semibold text-white bg-[#1A73E8] rounded-md px-2 py-0.5">Prachi is presenting</span>}
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
                <div className={`aspect-square grid place-items-center ${camOn ? 'bg-gradient-to-br from-[#485A79] to-[#DE5C2B]' : 'bg-[#2A4480]'}`}>
                  <span className="w-12 h-12 rounded-full bg-white/20 grid place-items-center text-white text-[20px] font-bold">A</span>
                  {!camOn && <span className="absolute top-2 right-2 text-[10px] text-white/70">Camera off</span>}
                </div>
              </Tile>
            </div>
          </div>

          {/* live captions */}
          {captions && <div className="mt-3 min-h-[48px] rounded-xl bg-[#0F1D45]/80 px-3 py-2 text-[13px] sm:text-[14px] text-white leading-snug">
            <AnimatePresence mode="wait">
              <motion.p key={`${step}-${phase}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <span className="font-semibold text-[#8AB4F8]">{mentorTalking ? 'Prachi' : 'Aarav'}:</span> {mentorTalking ? s.mentor : s.student}
              </motion.p>
            </AnimatePresence>
          </div>}

          {/* session progress (click a segment to jump) */}
          <div className="mt-3 flex gap-1.5">
            {STEPS.map((x, i) => (
              <button type="button" key={x.key} aria-label={`Go to ${x.label}`} onClick={() => { setStep(i); setPhase(0); setEnded(false); }} className="no-shine flex-1 h-1 rounded-full bg-white/10 overflow-hidden cursor-pointer hover:bg-white/25">
                <motion.span className="block h-full bg-[#DE5C2B]" animate={{ width: i < step ? '100%' : i === step ? (mentorTalking ? '100%' : '35%') : '0%' }} transition={{ duration: i === step ? (mentorTalking ? PHASE_MS[1] / 1000 : PHASE_MS[0] / 1000) : 0.3, ease: 'linear' }} />
              </button>
            ))}
          </div>

          {/* controls */}
          <div className="mt-3 flex items-center justify-center gap-2.5">
            {[
              { I: muted ? MicOff : Mic, label: muted ? 'Unmute' : 'Mute', on: !muted, act: () => setMuted((m) => !m) },
              { I: camOn ? Video : VideoOff, label: camOn ? 'Turn camera off' : 'Turn camera on', on: false, act: () => setCamOn((c) => !c) },
              { I: MonitorUp, label: 'Next screen', on: mentorTalking, act: nextScreen },
              { I: Hand, label: 'Raise hand', on: false, act: () => react('✋') },
              { I: MessageSquare, label: captions ? 'Hide captions' : 'Show captions', on: captions, act: () => setCaptions((c) => !c) },
            ].map(({ I, label, on, act }) => (
              <motion.button type="button" key={label} title={label} aria-label={label} onClick={act} whileTap={{ scale: 0.88 }}
                className={`no-shine w-10 h-10 rounded-full grid place-items-center cursor-pointer transition-colors ${on ? 'bg-[#8AB4F8] text-[#202124]' : 'bg-[#2A4480] text-white hover:bg-[#35529A]'}`}><I size={17} /></motion.button>
            ))}
            <motion.button type="button" title="End call" aria-label="End call" onClick={() => setEnded(true)} whileTap={{ scale: 0.9 }} className="no-shine w-14 h-10 rounded-full grid place-items-center bg-[#EA4335] hover:bg-[#d33426] text-white cursor-pointer"><PhoneOff size={17} /></motion.button>
          </div>
          {/* quick reactions */}
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {['👍', '❤️', '😂', '🔥', '🙏'].map((e) => (
              <button type="button" key={e} onClick={() => react(e)} aria-label={`React ${e}`} className="no-shine w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-[16px] cursor-pointer transition-transform hover:scale-110">{e}</button>
            ))}
          </div>
          <AnimatePresence>
            {ended && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 rounded-[22px] bg-[#3A150A]/95 flex flex-col items-center justify-center gap-3 text-white">
                <p className="text-[16px] font-semibold">You left the session</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEnded(false)} className="no-shine px-4 h-10 rounded-full bg-[#8AB4F8] text-[#202124] font-semibold text-[13.5px] cursor-pointer">Rejoin</button>
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
