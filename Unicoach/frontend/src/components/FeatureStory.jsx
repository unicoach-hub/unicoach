import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { GraduationCap, IndianRupee, Plane, BookOpen, Landmark, HandCoins, ArrowRight } from 'lucide-react';

// Scroll story: a big headline with floating tags → the tags grow into stacked colour cards →
// the front card turns into a dark panel with a feature wheel → then the University and Scholarship
// panels, each with pills that drift by on their own. Pinned while you scroll through it.

const ORANGE = '#DE5C2B';
const NAVY = '#0E1330';
const flag = (code) => `https://flagcdn.com/w80/${code}.png`;

const WHEEL = [
  { label: 'Find the right universities', icon: Landmark, color: '#DE5C2B' },
  { label: 'Unlock scholarships', icon: HandCoins, color: '#F5A524' },
  { label: 'Plan your education loan', icon: IndianRupee, color: '#22A06B' },
  { label: 'Ace IELTS, GRE & GMAT', icon: BookOpen, color: '#7C6CF2' },
  { label: 'Get visa ready', icon: Plane, color: '#3B82F6' },
  { label: 'Talk to a senior mentor', icon: GraduationCap, color: '#E5484D' },
];

const UNI_ROWS = [
  [['ie', 'Trinity College Dublin'], ['gb', 'University of Manchester'], ['us', 'Northeastern University'], ['de', 'TU Munich'], ['ca', 'University of Toronto']],
  [['au', 'Monash University'], ['us', 'Arizona State University'], ['gb', "King's College London"], ['ie', 'University College Dublin'], ['nz', 'University of Auckland']],
  [['ca', 'University of British Columbia'], ['de', 'RWTH Aachen'], ['gb', 'University of Leeds'], ['au', 'University of Melbourne'], ['fr', 'Sorbonne University']],
];
const SCH_ROWS = [
  [['gb', 'Chevening Scholarship'], ['de', 'DAAD Scholarships'], ['us', 'Fulbright-Nehru'], ['ie', 'Government of Ireland Scholarship']],
  [['au', 'Australia Awards'], ['gb', 'Commonwealth Scholarship'], ['nz', 'Manaaki NZ Scholarships'], ['fr', 'Eiffel Excellence']],
  [['ca', 'Vanier & university awards'], ['gb', 'GREAT Scholarships'], ['de', 'Deutschlandstipendium'], ['us', 'University merit awards']],
];

// A row of pills that drifts sideways forever
const Marquee = ({ items, reverse = false, speed = 28 }) => (
  <div className="relative overflow-hidden">
    <motion.div
      className="flex gap-3 w-max"
      animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
    >
      {[...items, ...items].map(([code, name], i) => (
        <span key={`${name}-${i}`} className="flex items-center gap-2.5 h-12 sm:h-14 pl-1.5 pr-5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_8px_24px_-10px_rgba(14,19,48,0.35)] whitespace-nowrap">
          <img src={flag(code)} alt="" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white" loading="lazy" />
          <span className="text-[13.5px] sm:text-[15px] font-semibold text-[#1B1530]">{name}</span>
        </span>
      ))}
    </motion.div>
  </div>
);

const Tag = ({ children, color, className = '', style }) => (
  <span
    className={`inline-flex items-center gap-2 px-4 sm:px-5 h-11 sm:h-14 text-[13px] sm:text-[18px] font-bold tracking-wide text-[#1B1530] rounded-xl shadow-lg ${className}`}
    style={{ background: color, clipPath: 'polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)', paddingRight: 34, ...style }}
  >
    {children}
  </span>
);

function DesktopStory() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  // Scroll progress through the section (0 → 1), measured live: sections above load lazily and change
  // the page height, so a position measured once would drift
  const raw = useMotionValue(0);
  // Spring-smoothed so every piece glides instead of jumping with each scroll tick
  const p = useSpring(raw, { stiffness: 90, damping: 26, mass: 0.6, restDelta: 0.0005 });
  useEffect(() => {
    let raf = 0;
    // Development only: ?story=0.5 freezes the story at that point (for screenshots)
    const forced = import.meta.env.DEV ? parseFloat(new URLSearchParams(window.location.search).get('story')) : NaN;
    const update = () => {
      raf = 0;
      if (!Number.isNaN(forced)) { raw.set(forced); return; }
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      raw.set(range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [raw]);

  // ── Phase A: headline (0 → 0.16)
  const headOpacity = useTransform(p, [0, 0.12, 0.18], [1, 1, 0]);
  const headY = useTransform(p, [0, 0.18], [0, -120]);
  const tagSpread = useTransform(p, [0, 0.14], [0, 1]);
  const tagOpacity = useTransform(p, [0.1, 0.17], [1, 0]);

  // ── Phase B: three cards grow from the tag spots and stack (0.12 → 0.32)
  const grow = useTransform(p, [0.12, 0.32], [0, 1]);
  const backL = { x: useTransform(grow, [0, 1], ['-38%', '-2%']), y: useTransform(grow, [0, 1], ['-18%', '2%']), scale: useTransform(grow, [0, 1], [0.22, 1]), rotate: useTransform(grow, [0, 1], [-4, -3]) };
  const backR = { x: useTransform(grow, [0, 1], ['34%', '1.5%']), y: useTransform(grow, [0, 1], ['-14%', '3.5%']), scale: useTransform(grow, [0, 1], [0.2, 1]), rotate: useTransform(grow, [0, 1], [5, 3]) };
  const front = { y: useTransform(grow, [0, 1], ['32%', '0%']), scale: useTransform(grow, [0, 1], [0.25, 1]) };
  const cardsOpacity = useTransform(p, [0.12, 0.16], [0, 1]);

  // Front card colour: amber → navy (wheel) → white (feature panels)
  const frontBg = useTransform(p, [0.28, 0.36, 0.6, 0.66], ['#F5B22A', NAVY, NAVY, '#FFFFFF']);

  // ── Phase C: wheel panel (0.34 → 0.62)
  const wheelOpacity = useTransform(p, [0.33, 0.38, 0.58, 0.63], [0, 1, 1, 0]);
  const wheelPos = useTransform(p, [0.36, 0.6], [0, WHEEL.length - 1]);
  const wheelY = useTransform(wheelPos, (v) => `${-v * 76}px`);

  // ── Phase D / E: universities (0.64 → 0.82), scholarships (0.82 → 1)
  const uniOpacity = useTransform(p, [0.62, 0.67, 0.8, 0.84], [0, 1, 1, 0]);
  const schOpacity = useTransform(p, [0.82, 0.87, 1], [0, 1, 1]);

  return (
    <section ref={ref} className="relative bg-[#FAF9F6]" style={{ height: reduce ? 'auto' : '520vh' }}>
      <div className={reduce ? 'py-16' : 'sticky top-0 h-screen overflow-hidden flex items-center'}>
        <div className="relative w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 mt-16 sm:mt-20 h-[74vh] min-h-[500px] max-h-[720px]">

          {/* Phase A: headline + floating tags */}
          <motion.div style={{ opacity: headOpacity, y: headY }} className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-0">
            <span className="inline-flex items-center gap-2 text-[13px] sm:text-[15px] font-black tracking-[0.08em] uppercase" style={{ color: ORANGE }}>
              <span className="w-5 h-4 rounded-sm" style={{ background: ORANGE, clipPath: 'polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%)' }} /> Why UniCoach
            </span>
            <h2 className="mt-5 font-outfit font-black text-[#1B1530] tracking-[-0.045em] leading-[0.95] text-[46px] sm:text-[84px] lg:text-[112px]">
              Your whole journey.<br />One place.
            </h2>
          </motion.div>
          <motion.div style={{ opacity: tagOpacity }} className="absolute inset-0 z-20 pointer-events-none hidden sm:block">
            {[
              { key: 'uni', pos: 'left-[8%] top-[27%]', color: '#FF8A3D', rot: -4, dx: -50, dy: -30, float: 0, content: 'UNIVERSITIES' },
              { key: 'inr', pos: 'right-[9%] top-[25%]', color: '#9DB6FF', rot: 7, dx: 50, dy: -40, float: 0.8, content: <IndianRupee size={26} /> },
              { key: 'sch', pos: 'left-[44%] top-[57%]', color: '#F5B22A', rot: -2, dx: 40, dy: 30, float: 1.4, content: 'SCHOLARSHIPS' },
              { key: 'cap', pos: 'left-[22%] top-[66%]', color: '#7C6CF2', rot: 3, dx: -40, dy: 40, float: 2.1, content: <GraduationCap size={24} color="#fff" /> },
            ].map((t) => (
              <TagLayer key={t.key} t={t} spread={tagSpread} />
            ))}
          </motion.div>

          {/* Phase B+: stacked cards */}
          <motion.div style={{ opacity: cardsOpacity }} className="absolute inset-0 z-10">
            <motion.div style={backR} className="absolute inset-[4%_2%_2%_4%] rounded-[30px] bg-[#9DB6FF]" />
            <motion.div style={backL} className="absolute inset-[3%_4%_3%_1%] rounded-[30px] bg-[#FF8A3D]" />
            <motion.div style={{ ...front, backgroundColor: frontBg }} className="absolute inset-[2%_3%_5%_3%] rounded-[30px] overflow-hidden shadow-[0_40px_80px_-40px_rgba(14,19,48,0.45)]">

              {/* Phase C: feature wheel */}
              <motion.div style={{ opacity: wheelOpacity }} className="absolute inset-0 grid md:grid-cols-[1fr_1.1fr] items-center gap-6 px-7 sm:px-14">
                <div>
                  <h3 className="font-outfit text-white font-bold tracking-[-0.03em] leading-[1.05] text-[32px] sm:text-[52px]">Where your goals<br />take you</h3>
                  <p className="mt-4 text-white/75 text-[15px] sm:text-[18px] max-w-[420px] leading-relaxed">Every student starts with a dream. UniCoach helps with every step that turns it into a visa stamp.</p>
                </div>
                <div className="relative h-[300px] sm:h-[380px] overflow-hidden [mask-image:linear-gradient(transparent,black_25%,black_75%,transparent)]">
                  <motion.div style={{ y: wheelY }} className="absolute left-0 right-0 top-1/2 -mt-[38px]">
                    {WHEEL.map((w, i) => (
                      <WheelItem key={w.label} item={w} index={i} pos={wheelPos} />
                    ))}
                  </motion.div>
                </div>
              </motion.div>

              {/* Phase D: universities */}
              <motion.div style={{ opacity: uniOpacity }} className="absolute inset-0 grid md:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col justify-center px-7 sm:px-14 py-8">
                  <h3 className="font-outfit font-bold text-[#1B1530] tracking-[-0.03em] leading-[1.05] text-[30px] sm:text-[50px]">Find the right<br />university for you</h3>
                  <p className="mt-4 text-[#5A4E66] text-[15px] sm:text-[18px] max-w-[400px] leading-relaxed">A shortlist with your chances of getting in, from 1,500+ universities.</p>
                  <Link to="/search-programs" className="mt-6 inline-flex w-max items-center gap-2 h-12 px-6 rounded-full bg-[#1B1530] hover:bg-[#DE5C2B] text-white font-bold text-[15px] transition-colors">
                    Build my shortlist <ArrowRight size={17} />
                  </Link>
                </div>
                <div className="relative overflow-hidden hidden md:block rounded-l-[26px]">
                  <img src="/images/universities/monash.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1330]/45 via-transparent to-transparent" />
                  <div className="absolute left-0 right-0 bottom-8 space-y-3">
                    <Marquee items={UNI_ROWS[0]} speed={30} />
                    <Marquee items={UNI_ROWS[1]} reverse speed={34} />
                    <Marquee items={UNI_ROWS[2]} speed={38} />
                  </div>
                </div>
              </motion.div>

              {/* Phase E: scholarships */}
              <motion.div style={{ opacity: schOpacity }} className="absolute inset-0 grid md:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col justify-center px-7 sm:px-14 py-8">
                  <h3 className="font-outfit font-bold text-[#1B1530] tracking-[-0.03em] leading-[1.05] text-[30px] sm:text-[50px]">Unlock scholarships<br />you qualify for</h3>
                  <p className="mt-4 text-[#5A4E66] text-[15px] sm:text-[18px] max-w-[400px] leading-relaxed">We check 150+ scholarships against your profile and show what each one covers.</p>
                  <Link to="/scholarships" className="mt-6 inline-flex w-max items-center gap-2 h-12 px-6 rounded-full bg-[#1B1530] hover:bg-[#DE5C2B] text-white font-bold text-[15px] transition-colors">
                    Find my scholarships <ArrowRight size={17} />
                  </Link>
                </div>
                <div className="relative overflow-hidden hidden md:block rounded-l-[26px]" style={{ background: 'radial-gradient(120% 120% at 100% 0%, #DCE2FF 0%, #B8C2FF 55%, #A3AEFA 100%)' }}>
                  <motion.img src="/images/3d/rupee.webp" alt="" className="absolute right-[12%] top-[10%] w-[34%] drop-shadow-2xl" animate={{ y: [0, -12, 0], rotate: [-6, -2, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
                  <motion.img src="/images/3d/3d-coin.webp" alt="" className="absolute left-[14%] top-[16%] w-[20%] drop-shadow-xl" animate={{ y: [0, 10, 0], rotate: [10, 16, 10] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }} />
                  <div className="absolute left-0 right-0 bottom-8 space-y-3">
                    <Marquee items={SCH_ROWS[0]} speed={30} />
                    <Marquee items={SCH_ROWS[1]} reverse speed={34} />
                    <Marquee items={SCH_ROWS[2]} speed={38} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// A tag that floats gently and drifts outward as the headline leaves
function TagLayer({ t, spread }) {
  const x = useTransform(spread, [0, 1], [0, t.dx]);
  const y = useTransform(spread, [0, 1], [0, t.dy]);
  return (
    <motion.div className="absolute inset-0" style={{ x, y }}>
      <motion.div
        className={`absolute ${t.pos}`}
        initial={{ opacity: 0, scale: 0.6, rotate: t.rot - 10 }}
        whileInView={{ opacity: 1, scale: 1, rotate: t.rot }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.15 + t.float * 0.12 }}
      >
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4 + t.float, repeat: Infinity, ease: 'easeInOut', delay: t.float }}>
          <Tag color={t.color} className="relative">{t.content}</Tag>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// One line of the wheel: bright when centred, faded and smaller away from the centre
function WheelItem({ item, index, pos }) {
  const Icon = item.icon;
  const dist = useTransform(pos, (v) => Math.abs(v - index));
  const opacity = useTransform(dist, [0, 1, 2.5], [1, 0.4, 0.08]);
  const scale = useTransform(dist, [0, 1.5], [1, 0.86]);
  return (
    <motion.div style={{ opacity, scale }} className="h-[76px] flex items-center justify-end gap-4 sm:gap-5 origin-right">
      <span className="font-outfit text-white text-[22px] sm:text-[36px] font-medium tracking-[-0.02em] text-right">{item.label}</span>
      <span className="w-12 h-12 sm:w-16 sm:h-16 rounded-full grid place-items-center shrink-0" style={{ background: item.color }}>
        <Icon size={24} color="#fff" />
      </span>
    </motion.div>
  );
}

// Phones: no pinned scroll story (it needs a wide screen). A short, plain version instead:
// headline, what UniCoach helps with, then the two feature cards with their moving pills.
const RISE = { initial: { opacity: 0, y: 32 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-30px' } };

function MobileStory() {
  return (
    <section className="bg-[#FAF9F6] py-12 px-4">
      <span className="inline-flex items-center gap-2 text-[12px] font-black tracking-[0.1em] uppercase" style={{ color: ORANGE }}>
        <span className="w-4 h-3 rounded-sm" style={{ background: ORANGE, clipPath: 'polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%)' }} /> Why UniCoach
      </span>
      <motion.h2 {...RISE} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mt-3 font-outfit font-black text-[#1B1530] tracking-[-0.04em] leading-[1] text-[40px]">Your whole journey. One place.</motion.h2>

      <motion.div {...RISE} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mt-6 rounded-[24px] p-5" style={{ background: NAVY }}>
        <p className="text-white/70 text-[13.5px]">Every step, from shortlist to visa stamp:</p>
        <ul className="mt-4 space-y-3">
          {WHEEL.map((w, i) => {
            const Icon = w.icon;
            return (
              <motion.li key={w.label} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: 'easeOut' }} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{ background: w.color }}><Icon size={17} color="#fff" /></span>
                <span className="text-white text-[16px] font-semibold">{w.label}</span>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>

      {[
        { title: 'Find the right university for you', text: 'A shortlist with your chances of getting in, from 1,500+ universities.', cta: 'Build my shortlist', to: '/search-programs', rows: UNI_ROWS, bg: 'linear-gradient(160deg, #FFE1CF 0%, #FFB48A 100%)' },
        { title: 'Unlock scholarships you qualify for', text: 'We check 150+ scholarships against your profile.', cta: 'Find my scholarships', to: '/scholarships', rows: SCH_ROWS, bg: 'linear-gradient(160deg, #E3E8FF 0%, #A9B5FA 100%)' },
      ].map((c) => (
        <motion.div key={c.title} initial={{ opacity: 0, y: 48, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="mt-4 rounded-[24px] overflow-hidden" style={{ background: c.bg }}>
          <div className="p-5">
            <h3 className="font-outfit font-bold text-[#1B1530] text-[24px] leading-[1.1] tracking-[-0.02em]">{c.title}</h3>
            <p className="mt-2 text-[#3D3350] text-[14px] leading-relaxed">{c.text}</p>
          </div>
          <div className="space-y-2.5 pb-5">
            <Marquee items={c.rows[0]} speed={26} />
            <Marquee items={c.rows[1]} reverse speed={30} />
          </div>
          <div className="px-5 pb-5">
            <Link to={c.to} className="flex items-center justify-center gap-2 h-12 rounded-full bg-[#1B1530] text-white font-bold text-[15px]">
              {c.cta} <ArrowRight size={17} />
            </Link>
          </div>
        </motion.div>
      ))}
    </section>
  );
}

// Chooses the version by screen width (and switches if the window is resized)
function useIsPhone() {
  const query = '(max-width: 767px)';
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setPhone(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return phone;
}

export default function FeatureStory() {
  const phone = useIsPhone();
  return phone ? <MobileStory /> : <DesktopStory />;
}
