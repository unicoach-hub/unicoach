import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion, interpolate } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLead } from '../../context/LeadContext';

const heroImg = '/image.webp';

// Scroll-driven hero in four scenes, like a camera moving through the plane window:
// 01 the student at the window, 02 inside the window (blurry vs clear slider),
// 03 landmarks with country notes, 04 the city turns to night and the CTA comes back.
// Only transforms and opacity animate, so it stays smooth on mid-range phones.

const SCENES = 4;

// Scroll-linked value through a plain function, so framer keeps it in step with the scroll
// (its built-in browser-animation shortcut for opacity lagged behind and left old scenes showing)
const useRamp = (p, input, output) => {
  const map = interpolate(input, output);
  return useTransform(p, (v) => map(v));
};

// Landmark positions as % of the photo (1200 x 925)
const SPOTS = [
  { x: 53.3, y: 45.5, n: 1, title: 'Canada', note: 'Padhai ke saath part-time kaam', side: 'left' },
  { x: 60.7, y: 49.5, n: 2, title: 'USA', note: 'STEM courses, lambi OPT', side: 'left' },
  { x: 67.9, y: 44.3, n: 3, title: 'UK', note: '1 saal ka Masters', side: 'right' },
  { x: 77.6, y: 50.5, n: 4, title: 'Aur bhi', note: 'Germany, Ireland, Australia...', side: 'left', desktopOnly: true },
];

// Little window lights that switch on when the city turns to night (fixed spots in the skyline)
const LIGHTS = [
  [55, 58], [57.5, 61], [59, 56.5], [62, 60], [63.5, 57], [65, 62], [66.5, 58.5], [68.6, 55],
  [70, 60.5], [71.5, 57.5], [73, 61.5], [74.5, 56], [76, 59], [77.8, 62], [79, 57], [52.5, 60],
  [60.5, 63], [69, 63.5], [75, 64], [67.4, 50], [68.2, 47.5], [53.4, 52],
];

const useIsMobile = () => {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const on = () => setMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return mobile;
};

// Before / after: the same skyline seen alone (foggy, full of questions) and with a senior (clear)
const ClaritySlider = () => {
  const [pos, setPos] = useState(50);
  const box = useRef(null);
  const dragging = useRef(false);

  const moveTo = (clientX) => {
    const r = box.current.getBoundingClientRect();
    setPos(Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div>
      <div
        ref={box}
        onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); moveTo(e.clientX); }}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => { dragging.current = false; }}
        className="relative h-[150px] sm:h-[200px] rounded-[14px] overflow-hidden border-2 border-[#F2B705] cursor-ew-resize select-none touch-pan-y"
      >
        {/* clear side */}
        <img src={heroImg} alt="" draggable="false" className="absolute inset-0 w-full h-full object-cover object-[72%_48%] [transform:scale(1.9)] origin-[72%_48%] saturate-[1.15]" />
        <span className="absolute top-2 right-2 px-2 py-1 rounded-md bg-[#14837E] text-white text-[10px] sm:text-[11px] font-black tracking-[0.14em] uppercase">Senior ke saath</span>
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
          {['Shortlist ready', 'Loan plan set', 'Visa docs done'].map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-white text-[#16130F] border-[1.5px] border-[#16130F] text-[10px] sm:text-[11px] font-extrabold">{t}</span>
          ))}
        </div>

        {/* foggy side, clipped to the slider position */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src={heroImg} alt="" draggable="false" className="absolute inset-0 w-full h-full object-cover object-[72%_48%] [transform:scale(1.9)] origin-[72%_48%] grayscale contrast-[.7] brightness-[1.05]" />
          <div className="absolute inset-0 bg-[#E8E2D6]/55" />
          <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-[#16130F] text-white text-[10px] sm:text-[11px] font-black tracking-[0.14em] uppercase">Akele</span>
          {[['Kaunsa course?', 'left-3 top-11'], ['Loan milega?', 'left-12 top-[46%]'], ['Visa reject?', 'left-4 bottom-3']].map(([t, at]) => (
            <span key={t} className={`absolute ${at} px-2 py-0.5 rounded-full bg-white/90 text-[#16130F]/70 text-[10px] sm:text-[11px] font-extrabold whitespace-nowrap`}>{t}</span>
          ))}
        </div>

        {/* handle */}
        <div className="absolute inset-y-0 w-[2px] bg-white pointer-events-none" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#16130F] flex items-center justify-center gap-[3px]">
            <i className="block w-[2px] h-3 bg-[#16130F]" /><i className="block w-[2px] h-3 bg-[#16130F]" />
          </span>
        </div>
      </div>
      <input
        type="range" min="4" max="96" value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare the city alone and with a senior"
        className="mt-3 w-full accent-[#F2B705] h-1.5 cursor-pointer"
      />
      <p className="mt-1.5 text-[12px] text-white/60">Picture ko drag karo, ya slider khiskao.</p>
    </div>
  );
};

const CinematicHero = () => {
  const { openEligibilityModal } = useLead();
  const openForm = () => openEligibilityModal('Hero Banner');
  const ref = useRef(null);
  const mobile = useIsMobile();
  const still = useReducedMotion();
  const [scene, setScene] = useState(0);

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(p, 'change', (v) => setScene(Math.min(SCENES - 1, Math.floor(v * SCENES * 0.999 + 0.12))));

  // Camera: phone screens are narrow, so they zoom less and centre on the skyline
  const focusX = mobile ? 62 : 60;
  const [z2, z3] = mobile ? [2, 1.3] : [2.3, 1.85];
  const scale = useRamp(p, [0, 0.07, 0.3, 0.5, 0.6, 0.76, 0.95], still ? [1, 1, 1, 1, 1, 1, 1] : [1, 1, z2, z2, z3, z3, 1.12]);
  const counter = useTransform(scale, (s) => 1 / s);

  const s1 = useRamp(p, [0, 0.1, 0.16], [1, 1, 0]);
  const s1y = useRamp(p, [0, 0.16], [0, -40]);
  const s2 = useRamp(p, [0.24, 0.3, 0.47, 0.53], [0, 1, 1, 0]);
  const s2y = useRamp(p, [0.24, 0.3], [30, 0]);
  const s3 = useRamp(p, [0.56, 0.62, 0.74, 0.79], [0, 1, 1, 0]);
  const night = useRamp(p, [0.76, 0.9], [0, 1]);
  const s4 = useRamp(p, [0.86, 0.93], [0, 1]);
  const s4y = useRamp(p, [0.86, 0.93], [30, 0]);
  const darken = useRamp(p, [0.08, 0.28, 0.76], [0, 1, 1]);

  return (
    <section ref={ref} className="relative h-[480vh] bg-[#16130F]" aria-label="UniCoach: sapna khidki ke bahar hai">
      <div className="sticky top-0 h-[100svh] overflow-hidden">

        {/* ── the photo, sized like object-cover so the hotspots stay on their landmarks ── */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: mobile ? `translateX(${50 - focusX}%)` : undefined }}>
          <motion.div
            style={{ scale, transformOrigin: `${focusX}% 47%` }}
            className="relative shrink-0 aspect-[1200/925] w-[max(100vw,129.73svh)] will-change-transform"
          >
            <img src={heroImg} alt="Student looking at the world through a plane window" fetchPriority="high" decoding="async" width="1200" height="925" className="absolute inset-0 w-full h-full" />

            {/* night: city lights switch on */}
            <motion.div style={{ opacity: night }} className="absolute inset-0 pointer-events-none">
              {LIGHTS.map(([x, y], i) => (
                <span key={i} className="absolute w-[3px] h-[3px] rounded-full bg-[#FFD36B] shadow-[0_0_6px_2px_rgba(255,200,90,.7)] animate-pulse" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i % 5) * 0.4}s` }} />
              ))}
            </motion.div>

            {/* scene 03 hotspots; counter-scaled so they keep their size while the photo zooms */}
            <motion.div style={{ opacity: s3 }} className="absolute inset-0 pointer-events-none">
              {SPOTS.filter((s) => !(mobile && s.desktopOnly)).map((s) => (
                <motion.div key={s.n} style={{ left: `${s.x}%`, top: `${s.y}%`, scale: counter }} className="absolute w-0 h-0">
                  <span className="absolute -left-[11px] -top-[11px] md:-left-[7px] md:-top-[7px] w-[22px] h-[22px] md:w-[14px] md:h-[14px] rounded-full bg-[#F2B705] md:bg-white border-2 border-[#16130F] flex items-center justify-center text-[11px] font-black text-[#16130F]">
                    <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-60" />
                    <span className="relative md:hidden">{s.n}</span>
                  </span>
                  <div className={`absolute top-0 -translate-y-1/2 hidden md:flex items-center ${s.side === 'left' ? 'right-[10px] flex-row-reverse' : 'left-[10px]'}`}>
                    <span className="w-5 sm:w-8 h-[2px] bg-white" />
                    <span className="flex items-center gap-2 bg-[#16130F]/90 text-white border-[1.5px] border-white/80 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap">
                      <span className="w-5 h-5 rounded-full bg-[#F2B705] text-[#16130F] text-[11px] font-black flex items-center justify-center">{s.n}</span>
                      <span className="leading-tight">
                        <span className="block font-urbanist font-black text-[13px] sm:text-[15px]">{s.title}</span>
                        <span className="block text-[10.5px] sm:text-[12px] text-white/75">{s.note}</span>
                      </span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* ── light washes (not scaled) ── */}
        {/* scene 01: the wall on the left melts to cream so the headline reads */}
        <motion.div style={{ opacity: s1 }} className="hidden md:block absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#FFF6E5_0%,rgba(255,246,229,.88)_28%,rgba(255,246,229,0)_56%)]" />
        <motion.div style={{ opacity: s1 }} className="md:hidden absolute inset-x-0 bottom-0 h-[62%] pointer-events-none bg-gradient-to-t from-[#FFF6E5] via-[#FFF6E5]/85 to-transparent" />
        {/* scenes 02-03: dark edges behind the cards */}
        <motion.div style={{ opacity: darken }} className="absolute inset-0 pointer-events-none bg-gradient-to-t md:bg-gradient-to-r from-[#16130F]/80 via-[#16130F]/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 pointer-events-none bg-gradient-to-b from-[#16130F]/35 to-transparent" />
        {/* scene 04: dusk */}
        <motion.div style={{ opacity: night }} className="absolute inset-0 pointer-events-none mix-blend-multiply bg-gradient-to-b from-[#1B2150] via-[#5B2A5E] to-[#B8285B]/70" />
        <motion.div style={{ opacity: night }} className="absolute inset-0 pointer-events-none bg-gradient-to-t md:bg-gradient-to-r from-[#16130F]/85 via-[#16130F]/30 to-transparent" />

        {/* ── scene 01 ── */}
        <motion.div style={{ opacity: s1, y: s1y }} className="absolute inset-x-0 bottom-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2 px-5 sm:px-10 lg:px-20">
          <div className="max-w-[560px]">
            <p className="text-[11px] sm:text-[12px] font-black tracking-[0.28em] uppercase text-[#D0362E]">UniCoach / Videsh wala sapna</p>
            <h1 className="mt-3 sm:mt-4 font-urbanist font-black text-[40px] sm:text-[58px] lg:text-[72px] leading-[0.98] tracking-[-0.03em] text-[#16130F]">
              Sapna khidki<br />ke bahar hai.<br /><span className="text-[#DE5C2B]">Rasta hum dikhayenge.</span>
            </h1>
            <p className="mt-4 sm:mt-5 max-w-[420px] text-[15px] sm:text-[17px] leading-relaxed text-[#16130F]/75">
              Free career counselling aur study-abroad guidance, un seniors se jo khud ye raasta chal chuke hain.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={openForm} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#16130F] text-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] font-urbanist font-black text-[15px] hover:-translate-y-0.5 transition-transform">
                Free call book karo <ArrowRight size={18} />
              </button>
              <Link to="/search-programs" className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white text-[#16130F] border-[3px] border-[#16130F] font-urbanist font-black text-[15px] hover:-translate-y-0.5 transition-transform">
                Course dhoondho
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── scene 02 ── */}
        <motion.div style={{ opacity: s2, y: s2y }} className="absolute inset-x-4 bottom-6 md:inset-x-auto md:left-10 lg:left-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-[440px] lg:w-[480px]" >
          <div className="rounded-[20px] bg-[#16130F]/92 border-2 border-white/15 p-5 sm:p-7 text-white" style={{ pointerEvents: scene === 1 ? 'auto' : 'none' }}>
            <p className="text-[11px] font-black tracking-[0.24em] text-[#F2B705]">02 / 04</p>
            <h2 className="mt-2 font-urbanist font-black text-[28px] sm:text-[40px] leading-[1.02] tracking-[-0.02em]">Wahi sheher,<br /><span className="text-[#F2B705]">saaf nazar se.</span></h2>
            <p className="mt-2.5 text-[14px] sm:text-[15px] text-white/75 leading-relaxed">Akele sab dhundhla lagta hai. Senior ke saath har step clear.</p>
            <div className="mt-4 sm:mt-5"><ClaritySlider /></div>
          </div>
        </motion.div>

        {/* ── scene 03 ── */}
        <motion.div style={{ opacity: s3 }} className="absolute inset-x-5 bottom-8 md:inset-x-auto md:left-10 lg:left-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 max-w-[400px] text-white pointer-events-none">
          <p className="text-[11px] font-black tracking-[0.24em] text-[#F2B705]">03 / 04</p>
          <h2 className="mt-2 font-urbanist font-black text-[36px] sm:text-[56px] leading-[1] tracking-[-0.02em]">Gaur se<br />dekho.</h2>
          <p className="mt-3 text-[14px] sm:text-[16px] text-white/80 leading-relaxed">Har desh ka apna rasta hai. Hum aapke course, budget aur career ke hisaab se sahi wala chunte hain.</p>
          {/* phones: the landmark notes as a list, the dots on the photo carry the numbers */}
          <ul className="md:hidden mt-4 space-y-1.5">
            {SPOTS.filter((s) => !s.desktopOnly).map((s) => (
              <li key={s.n} className="flex items-center gap-2 text-[13px]">
                <span className="w-5 h-5 shrink-0 rounded-full bg-[#F2B705] text-[#16130F] text-[11px] font-black flex items-center justify-center">{s.n}</span>
                <span><b className="font-urbanist font-black">{s.title}</b> <span className="text-white/75">· {s.note}</span></span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── scene 04 ── */}
        <motion.div style={{ opacity: s4, y: s4y }} className="absolute inset-x-5 bottom-10 md:inset-x-auto md:left-10 lg:left-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 max-w-[520px] text-white">
          <div style={{ pointerEvents: scene === 3 ? 'auto' : 'none' }}>
            <p className="text-[11px] font-black tracking-[0.24em] text-[#F2B705]">04 / 04</p>
            <h2 className="mt-2 font-urbanist font-black text-[42px] sm:text-[64px] leading-[0.98] tracking-[-0.03em]">Ab aapki<br /><span className="text-[#F2B705]">baari.</span></h2>
            <p className="mt-3 max-w-[400px] text-[15px] sm:text-[17px] text-white/80 leading-relaxed">Pehli call free hai. Ek senior, aapke saare sawaal, koi pressure nahi.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={openForm} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#F2B705] text-[#16130F] border-[3px] border-[#16130F] shadow-[4px_4px_0_#FFF6E5] font-urbanist font-black text-[15px] hover:-translate-y-0.5 transition-transform">
                Free call book karo <ArrowRight size={18} />
              </button>
              <Link to="/unicoach" className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-white border-[3px] border-white font-urbanist font-black text-[15px] hover:-translate-y-0.5 transition-transform">
                Seniors se milo
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── scene counter + progress ── */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5" aria-hidden="true">
          {Array.from({ length: SCENES }, (_, i) => (
            <span key={i} className={`block w-1.5 rounded-full transition-all duration-300 ${i === scene ? 'h-8 bg-[#F2B705]' : 'h-1.5 bg-white/60'}`} />
          ))}
        </div>
        <div className="absolute top-20 sm:top-24 right-4 sm:right-8 px-3 py-1.5 rounded-full bg-[#16130F]/70 text-white text-[11px] font-black tracking-[0.2em]" aria-hidden="true">
          0{scene + 1} / 0{SCENES}
        </div>
        <motion.div style={{ opacity: s1 }} className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center text-[#16130F]/70 text-[11px] font-black tracking-[0.2em] uppercase" aria-hidden="true">
          Scroll karo, khidki ke paar chalo
          <ChevronDown size={18} className="mt-1 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
};

export default CinematicHero;
