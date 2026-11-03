import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionValueEvent, useReducedMotion, interpolate } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLead } from '../../context/LeadContext';

// The hero photo split into three depth layers (made from /image.webp): the city plate behind the glass,
// the cabin wall with the window, and the student cut out in front. Each moves at its own speed, so the
// camera really travels through the window instead of zooming one flat picture.
const CITY = '/images/hero-v3/city.jpg';
const FRAME = '/images/hero-v3/frame.jpg';
const STUDENT = '/images/hero-v3/student.png';
// where the student cutout sits in the 1200 x 925 photo
const STUDENT_BOX = { left: '14.17%', top: '26.92%', width: '42.75%', height: '73.08%' };
// window centre in the photo; every layer zooms around it
const ORIGIN = '55.4% 46.3%';
// the window glass, cut out of the cabin layer (even-odd: page rectangle minus the glass)
const GLASS = 'M0 0H1200V925H0Z M977 428 L977 480 L975 513 L973 541 L969 567 L965 590 L960 611 L954 631 L947 650 L938 667 L929 683 L919 698 L909 712 L897 725 L884 737 L870 747 L855 756 L839 765 L822 772 L804 778 L784 783 L762 787 L738 790 L709 791 L665 792 L621 791 L592 790 L568 787 L546 783 L526 778 L508 772 L491 765 L475 756 L460 747 L446 737 L433 725 L421 712 L411 698 L401 683 L392 667 L383 650 L376 631 L370 611 L365 590 L361 567 L357 541 L355 513 L353 480 L353 428 L353 376 L355 343 L357 315 L361 289 L365 266 L370 245 L376 225 L383 206 L392 189 L401 173 L411 158 L421 144 L433 131 L446 119 L460 109 L475 100 L491 91 L508 84 L526 78 L546 73 L568 69 L592 66 L621 65 L665 64 L709 65 L738 66 L762 69 L784 73 L804 78 L822 84 L839 91 L855 100 L870 109 L884 119 L897 131 L909 144 L919 158 L929 173 L938 189 L947 206 L954 225 L960 245 L965 266 L969 289 L973 315 L975 343 L977 376Z';
const GLASS_MASK = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 925' preserveAspectRatio='none'><path fill-rule='evenodd' fill='white' d='${GLASS}'/></svg>`)}")`;

// Four scenes: 01 the student at the window, 02 through the glass (alone vs with a senior slider),
// 03 landmarks with country notes, 04 the camera pulls back out at night with the CTA.
// Only transforms and opacity animate, and the scroll is spring-smoothed.

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
        <img src={CITY} alt="" draggable="false" className="absolute inset-0 w-full h-full object-cover object-[72%_48%] [transform:scale(1.9)] origin-[72%_48%] saturate-[1.15]" />
        <span className="absolute top-2 right-2 px-2 py-1 rounded-md bg-[#14837E] text-white text-[10px] sm:text-[11px] font-black tracking-[0.14em] uppercase">Senior ke saath</span>
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
          {['Shortlist ready', 'Loan plan set', 'Visa docs done'].map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-white text-[#16130F] border-[1.5px] border-[#16130F] text-[10px] sm:text-[11px] font-extrabold">{t}</span>
          ))}
        </div>

        {/* foggy side, clipped to the slider position */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src={CITY} alt="" draggable="false" className="absolute inset-0 w-full h-full object-cover object-[72%_48%] [transform:scale(1.9)] origin-[72%_48%] grayscale contrast-[.7] brightness-[1.05]" />
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

// Mouse parallax for one layer: nearer layers (bigger px) slide further
const useDepth = (mx, my, px) => [useTransform(mx, (v) => v * px), useTransform(my, (v) => v * px * 0.6)];

// A headline that tips back in 3D as it leaves (rotateX around its bottom edge)
const Tilt = ({ o, r, y, children, className = '' }) => (
  <motion.div style={{ opacity: o, rotateX: r, y, transformOrigin: '50% 100%', transformPerspective: 900 }} className={className}>
    {children}
  </motion.div>
);

const CinematicHero = () => {
  const { openEligibilityModal } = useLead();
  const openForm = () => openEligibilityModal('Hero Banner');
  const ref = useRef(null);
  const mobile = useIsMobile();
  const still = useReducedMotion();
  const [scene, setScene] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // spring-smoothed scroll: the camera glides and settles instead of stepping with each wheel tick
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.5, restDelta: 0.0005 });
  useMotionValueEvent(p, 'change', (v) => setScene(v < 0.2 ? 0 : v < 0.51 ? 1 : v < 0.8 ? 2 : 3));

  // mouse: the whole scene tilts, and each layer slides by its depth
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });
  const onMove = (e) => {
    if (still || e.pointerType === 'touch') return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };
  const tiltY = useTransform(smx, (v) => v * 7);
  const tiltX = useTransform(smy, (v) => v * -5);
  const [cityMX, cityMY] = useDepth(smx, smy, -10);
  const [frameMX, frameMY] = useDepth(smx, smy, 16);
  const [studMX, studMY] = useDepth(smx, smy, 38);

  // camera path (phones zoom less: the window already fills a tall screen)
  const k = still ? 0 : 1;
  const cz = mobile ? [1, 1.28, 1.34, 1.12, 1.03] : [1, 1.75, 1.85, 1.38, 1.05];
  const at = (v) => 1 + (v - 1) * k;
  const cityS = useRamp(p, [0.03, 0.31, 0.5, 0.62, 0.95], cz.map(at));
  const cityX = useRamp(p, [0.5, 0.62, 0.76, 0.92], [0, mobile ? 0 : -3, mobile ? 0 : -3, 0]);
  const frameS = useRamp(p, [0.04, 0.3, 0.76, 0.94], [1, at(mobile ? 2.8 : 3.4), at(mobile ? 2.8 : 3.4), 1.03]);
  const frameO = useRamp(p, [0.15, 0.26, 0.78, 0.86], [1, 0, 0, 1]);
  const studS = useRamp(p, [0.02, 0.26, 0.78, 0.95], [1, at(3.4), at(3.4), 1.04]);
  const studX = useRamp(p, [0.02, 0.26, 0.78, 0.95], ['0%', `${-38 * k}%`, `${-38 * k}%`, '0%']);
  const studY = useRamp(p, [0.02, 0.26, 0.78, 0.95], ['0%', `${30 * k}%`, `${30 * k}%`, '0%']);
  const studO = useRamp(p, [0.09, 0.17, 0.82, 0.9], [1, 0, 0, 1]);
  const counter = useTransform(cityS, (v) => 1 / v);
  const cityXp = useTransform(cityX, (v) => `${v}%`);
  const ticketRY = useTransform(smx, (v) => -16 + v * 22);
  const ticketRX = useTransform(smy, (v) => 8 - v * 16);

  // scenes
  const s1 = useRamp(p, [0, 0.07, 0.15], [1, 1, 0]);
  const s1r = useRamp(p, [0.05, 0.15], [0, -70]);
  const s1y = useRamp(p, [0.05, 0.15], [0, -60]);
  const ticketZ = useRamp(p, [0, 0.12], [0, 260]);
  const s2 = useRamp(p, [0.27, 0.33, 0.46, 0.51], [0, 1, 1, 0]);
  const s2r = useRamp(p, [0.27, 0.33, 0.46, 0.51], [-28, 0, 0, 24]);
  const s2y = useRamp(p, [0.27, 0.33], [50, 0]);
  const s3 = useRamp(p, [0.56, 0.62, 0.74, 0.79], [0, 1, 1, 0]);
  const s3r = useRamp(p, [0.56, 0.62, 0.74, 0.79], [60, 0, 0, -60]);
  const night = useRamp(p, [0.74, 0.9], [0, 1]);
  const s4 = useRamp(p, [0.87, 0.94], [0, 1]);
  const s4r = useRamp(p, [0.87, 0.94], [55, 0]);
  const s4y = useRamp(p, [0.87, 0.94], [40, 0]);
  const darken = useRamp(p, [0.12, 0.3, 0.74], [0, 1, 1]);

  const layer = 'absolute inset-0 will-change-transform';

  return (
    <section ref={ref} onPointerMove={onMove} className="relative h-[520vh] bg-[#16130F]" aria-label="UniCoach: sapna khidki ke bahar hai">
      <div className="sticky top-0 h-[100svh] overflow-hidden [perspective:1400px]">

        {/* ── 3D stage: sized like object-cover so the hotspots stay on their landmarks ── */}
        <motion.div style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }} className="absolute -inset-[3%] flex items-center justify-center">
          <div className="relative shrink-0 aspect-[1200/925] w-[max(106vw,137.5svh)]" style={{ transform: mobile ? 'translateX(-10%)' : undefined }}>

            {/* back: the city behind the glass */}
            <motion.div style={{ scale: cityS, x: cityMX, y: cityMY, translateX: cityXp, transformOrigin: ORIGIN }} className={layer}>
              <img src={CITY} alt="" width="2400" height="1850" fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full" />
              <motion.div style={{ opacity: night }} className="absolute inset-0 bg-gradient-to-b from-[#141A45]/80 via-[#3A1D4E]/60 to-[#16130F]/55" />
              <motion.div style={{ opacity: night }} className="absolute inset-0 pointer-events-none">
                {LIGHTS.map(([x, y], i) => (
                  <span key={i} className="absolute w-[3px] h-[3px] rounded-full bg-[#FFD36B] shadow-[0_0_6px_2px_rgba(255,200,90,.7)] animate-pulse" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i % 5) * 0.4}s` }} />
                ))}
              </motion.div>
              {/* scene 03 hotspots, counter-scaled so they keep their size */}
              <motion.div style={{ opacity: s3 }} className="absolute inset-0 pointer-events-none">
                {SPOTS.filter((s) => !(mobile && s.desktopOnly)).map((s) => (
                  <motion.div key={s.n} style={{ left: `${s.x}%`, top: `${s.y}%`, scale: counter }} className="absolute w-0 h-0">
                    <span className="absolute -left-[11px] -top-[11px] md:-left-[7px] md:-top-[7px] w-[22px] h-[22px] md:w-[14px] md:h-[14px] rounded-full bg-[#F2B705] md:bg-white border-2 border-[#16130F] flex items-center justify-center text-[11px] font-black text-[#16130F]">
                      <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-60" />
                      <span className="relative md:hidden">{s.n}</span>
                    </span>
                    <div className={`absolute top-0 -translate-y-1/2 hidden md:flex items-center ${s.side === 'left' ? 'right-[10px] flex-row-reverse' : 'left-[10px]'}`}>
                      <span className="w-5 sm:w-8 h-[2px] bg-white" />
                      <span className="flex items-center gap-2 bg-[#16130F]/90 text-white border-[1.5px] border-white/80 rounded-lg px-3 py-2 whitespace-nowrap">
                        <span className="w-5 h-5 rounded-full bg-[#F2B705] text-[#16130F] text-[11px] font-black flex items-center justify-center">{s.n}</span>
                        <span className="leading-tight">
                          <span className="block font-urbanist font-black text-[15px]">{s.title}</span>
                          <span className="block text-[12px] text-white/75">{s.note}</span>
                        </span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* middle: the cabin wall with the window glass cut out; the camera flies through it */}
            <motion.div style={{ scale: frameS, opacity: frameO, x: frameMX, y: frameMY, transformOrigin: ORIGIN, WebkitMaskImage: GLASS_MASK, maskImage: GLASS_MASK, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }} className={layer}>
              <img src={FRAME} alt="" width="1200" height="925" decoding="async" className="absolute inset-0 w-full h-full" />
              <motion.div style={{ opacity: night }} className="absolute inset-0 bg-[#141A45]/70" />
            </motion.div>

            {/* front: the student, closest to the camera, slides out past the lens */}
            <motion.div style={{ ...STUDENT_BOX, scale: studS, opacity: studO, x: studMX, y: studMY, translateX: studX, translateY: studY, transformOrigin: '80% 20%' }} className="absolute will-change-transform">
              <img src={STUDENT} alt="Student looking at the world through a plane window" width="513" height="676" decoding="async" className="w-full h-full" />
              <motion.div style={{ opacity: night, WebkitMaskImage: `url(${STUDENT})`, maskImage: `url(${STUDENT})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }} className="absolute inset-0 bg-[#141A45]/75" />
            </motion.div>
          </div>
        </motion.div>

        {/* ── washes (screen space) ── */}
        <motion.div style={{ opacity: s1 }} className="hidden md:block absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#FFF6E5_0%,rgba(255,246,229,.88)_26%,rgba(255,246,229,0)_52%)]" />
        <motion.div style={{ opacity: s1 }} className="md:hidden absolute inset-x-0 bottom-0 h-[62%] pointer-events-none bg-gradient-to-t from-[#FFF6E5] via-[#FFF6E5]/85 to-transparent" />
        <motion.div style={{ opacity: darken }} className="absolute inset-0 pointer-events-none bg-gradient-to-t md:bg-gradient-to-r from-[#16130F]/80 via-[#16130F]/15 to-transparent" />
        <motion.div style={{ opacity: darken }} className="absolute inset-0 pointer-events-none shadow-[inset_0_0_160px_40px_rgba(22,19,15,.7)]" />
        <div className="absolute inset-x-0 top-0 h-28 pointer-events-none bg-gradient-to-b from-[#16130F]/30 to-transparent" />
        <motion.div style={{ opacity: night }} className="absolute inset-0 pointer-events-none bg-gradient-to-t md:bg-gradient-to-r from-[#16130F]/85 via-[#16130F]/25 to-transparent" />

        {/* ── scene 01 ── */}
        <div className="absolute inset-x-0 bottom-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2 px-5 sm:px-10 lg:px-20" style={{ pointerEvents: scene === 0 ? 'auto' : 'none' }}>
          <div className="max-w-[580px]">
            <Tilt o={s1} r={s1r} y={s1y}>
              <p className="text-[11px] sm:text-[12px] font-black tracking-[0.28em] uppercase text-[#D0362E]">UniCoach / Videsh wala sapna</p>
              <h1 className="mt-3 sm:mt-4 font-urbanist font-black text-[40px] sm:text-[58px] lg:text-[74px] leading-[0.96] tracking-[-0.03em] text-[#16130F]">
                Sapna khidki<br />ke bahar hai.<br /><span className="text-[#DE5C2B]">Rasta hum dikhayenge.</span>
              </h1>
            </Tilt>
            <motion.div style={{ opacity: s1 }}>
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
            </motion.div>
          </div>
        </div>

        {/* scene 01: a boarding pass floating in 3D in front of the window; it flies at the camera on scroll */}
        <motion.div
          style={{ opacity: s1, z: ticketZ, rotateY: ticketRY, rotateX: ticketRX, transformPerspective: 900 }}
          className="hidden lg:block absolute right-[7%] bottom-[12%] pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-[260px] rounded-[16px] bg-[#FFF6E5] border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-[#F2B705] border-b-[3px] border-[#16130F]">
              <span className="font-urbanist font-black text-[13px] text-[#16130F]">Boarding pass</span>
              <span className="text-[10px] font-black tracking-[0.18em] text-[#16130F]">UC 2027</span>
            </div>
            <div className="px-4 pt-3 pb-2 flex items-end justify-between">
              <div><p className="text-[10px] font-black text-[#16130F]/50 tracking-[0.16em]">FROM</p><p className="font-urbanist font-black text-[30px] leading-none text-[#16130F]">DEL</p></div>
              <span className="mb-1 text-[#DE5C2B] font-black text-[18px]">✈</span>
              <div className="text-right"><p className="text-[10px] font-black text-[#16130F]/50 tracking-[0.16em]">TO</p><p className="font-urbanist font-black text-[30px] leading-none text-[#16130F]">LHR</p></div>
            </div>
            <div className="mx-4 mb-3 pt-2 border-t-2 border-dashed border-[#16130F]/30 grid grid-cols-2 gap-1 text-[11px]">
              <span className="text-[#16130F]/60 font-bold">Seat</span><span className="text-right font-black text-[#16130F]">1:1 Senior</span>
              <span className="text-[#16130F]/60 font-bold">Gate</span><span className="text-right font-black text-[#14837E]">Free call</span>
            </div>
          </div>
        </motion.div>

        {/* ── scene 02 ── */}
        <motion.div style={{ opacity: s2, rotateY: s2r, y: s2y, transformPerspective: 1100, transformOrigin: '0% 50%' }} className="absolute inset-x-4 bottom-6 md:inset-x-auto md:left-10 lg:left-20 md:bottom-auto md:top-[calc(50%-260px)] md:w-[440px] lg:w-[480px]">
          <div className="rounded-[20px] bg-[#16130F]/92 border-2 border-white/15 p-5 sm:p-7 text-white shadow-[0_30px_80px_rgba(0,0,0,.45)]" style={{ pointerEvents: scene === 1 ? 'auto' : 'none' }}>
            <p className="text-[11px] font-black tracking-[0.24em] text-[#F2B705]">02 / 04</p>
            <h2 className="mt-2 font-urbanist font-black text-[28px] sm:text-[40px] leading-[1.02] tracking-[-0.02em]">Wahi sheher,<br /><span className="text-[#F2B705]">saaf nazar se.</span></h2>
            <p className="mt-2.5 text-[14px] sm:text-[15px] text-white/75 leading-relaxed">Akele sab dhundhla lagta hai. Senior ke saath har step clear.</p>
            <div className="mt-4 sm:mt-5"><ClaritySlider /></div>
          </div>
        </motion.div>

        {/* ── scene 03 ── */}
        <motion.div style={{ opacity: s3, rotateX: s3r, transformPerspective: 900, transformOrigin: '50% 100%' }} className="absolute inset-x-5 bottom-8 md:inset-x-auto md:left-10 lg:left-20 md:bottom-auto md:top-[calc(50%-120px)] max-w-[400px] text-white pointer-events-none">
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
        <motion.div style={{ opacity: s4, rotateX: s4r, y: s4y, transformPerspective: 900, transformOrigin: '50% 100%' }} className="absolute inset-x-5 bottom-10 md:inset-x-auto md:left-10 lg:left-20 md:bottom-auto md:top-[calc(50%-150px)] max-w-[520px] text-white">
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
