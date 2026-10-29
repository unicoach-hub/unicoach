import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

// "Your whole journey" as a one-screen bento: six cards, each with a small live animation.
// Animations start when the grid scrolls into view and keep looping gently.

const useLoop = (inView, ms) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    const t = setInterval(() => setTick((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [inView, ms]);
  return tick;
};

const Count = ({ to, prefix = '', suffix = '', inView, tick, duration = 1.4 }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    const c = animate(0, to, { duration, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, tick, to, duration]);
  return <>{prefix}{v.toLocaleString('en-IN')}{suffix}</>;
};

const Card = ({ to, tone, className = '', children, title, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`group relative rounded-[24px] overflow-hidden ${className}`}
    style={{ background: tone }}
  >
    <Link to={to} className="absolute inset-0 z-20" aria-label={title} />
    <div className="relative z-10 h-full flex flex-col p-5 sm:p-6">
      <div className="flex-1 min-h-0">{children}</div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-[19px] sm:text-[21px] font-bold text-[#111] tracking-[-0.02em] leading-tight">{title}</h3>
          <p className="text-[13.5px] text-slate-600 mt-0.5">{sub}</p>
        </div>
        <span className="w-9 h-9 rounded-full bg-white/80 grid place-items-center shrink-0 transition-transform group-hover:rotate-45">
          <ArrowUpRight size={17} />
        </span>
      </div>
    </div>
  </motion.div>
);

const JourneyRoute = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-80px' });
  const t5 = useLoop(inView, 5000);
  const t4 = useLoop(inView, 4000);
  const t3 = useLoop(inView, 3200);
  const [emi, setEmi] = useState(5);
  useEffect(() => {
    if (!inView) return undefined;
    const c = animate(5, 10, { duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse', onUpdate: (x) => setEmi(x) });
    return () => c.stop();
  }, [inView]);
  const loan = 3000000;
  const emiAmt = Math.round((loan * 0.0085 * (1.0085 ** (emi * 12))) / ((1.0085 ** (emi * 12)) - 1));
  const unis = [['TU Munich', 'Germany', '#DE5C2B'], ['Trinity Dublin', 'Ireland', '#446D50'], ['Univ. of Leeds', 'UK', '#2F5BFF']];
  const shownUni = unis[t5 % unis.length];
  const bands = [6, 6.5, 7, 7.5];

  return (
    <section ref={ref} className="py-14 sm:py-20 bg-[#FAF9F6] w-full max-w-full">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-9 sm:mb-11">
          <span className="text-[13px] font-semibold text-[#DE5C2B]">Why UniCoach</span>
          <h2 className="mt-2 font-outfit text-[32px] sm:text-[46px] font-bold text-[#111] leading-[1.05] tracking-[-0.035em]">
            Ghar se campus tak, <span className="text-[#DE5C2B]">sab ek jagah</span>
          </h2>
          <p className="mt-3 text-[15px] sm:text-[17px] text-slate-600">Six things every student needs, handled by one team.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:auto-rows-[230px]">
          {/* Universities: match card cycling, percentage counts up */}
          <Card to="/search-programs" tone="linear-gradient(150deg,#FFE7DA,#FFC9AE)" className="lg:col-span-2 lg:row-span-2" title="Find the right universities" sub="1,500+ universities, matched to your profile" delay={0}>
            <div className="h-full flex flex-col justify-center gap-3">
              <motion.div key={t5} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 shadow-[0_14px_30px_-16px_rgba(42,26,18,0.35)] max-w-[340px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[16px]">{shownUni[0]}</span>
                  <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full text-white" style={{ background: shownUni[2] }}>{shownUni[1]}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div key={`b${t5}`} className="h-full rounded-full" style={{ background: shownUni[2] }} initial={{ width: 0 }} animate={{ width: `${[78, 54, 92][t5 % 3]}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
                  </div>
                  <span className="text-[15px] font-bold"><Count to={[78, 54, 92][t5 % 3]} suffix="%" inView={inView} tick={t5} duration={1.2} /></span>
                </div>
                <p className="text-[12px] text-slate-500 mt-1.5">chance of admission</p>
              </motion.div>
              <div className="flex gap-2 flex-wrap">
                {['Marks', 'Scores', 'Budget'].map((x) => (
                  <span key={x} className="text-[12px] font-semibold px-3 py-1 rounded-full bg-white/70 text-slate-600">✓ {x}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* Scholarships: rupee amount counts up */}
          <Card to="/search-programs?highlight=scholarship" tone="linear-gradient(150deg,#FFF5D6,#FFE08A)" className="lg:col-span-2" title="Unlock scholarships" sub="150+ checked against your profile" delay={0.05}>
            <div className="flex items-center gap-4 h-full">
              <div>
                <p className="text-[12px] font-semibold text-amber-800">You could save up to</p>
                <p className="text-[34px] sm:text-[40px] font-bold text-[#111] leading-none mt-1 tracking-[-0.03em]"><Count to={1850000} prefix="₹" inView={inView} tick={t5} duration={1.6} /></p>
              </div>
              <div className="ml-auto hidden sm:flex flex-col gap-1.5">
                {['Merit', 'Need-based', 'Women in STEM'].map((x, i) => (
                  <motion.span key={x + t5} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.2 }} className="text-[11.5px] font-semibold bg-white rounded-full px-3 py-1 shadow-sm">✓ {x}</motion.span>
                ))}
              </div>
            </div>
          </Card>

          {/* Loan: EMI slider moves, EMI updates */}
          <Card to="/education-loan" tone="linear-gradient(150deg,#DFF7EC,#AEE8CF)" title="Plan your loan" sub="Banks and NBFCs compared" delay={0.1}>
            <div className="h-full flex flex-col justify-center">
              <p className="text-[12px] text-emerald-800 font-semibold">₹30L · {emi.toFixed(0)} years</p>
              <p className="text-[26px] font-bold text-[#111] leading-tight">₹{emiAmt.toLocaleString('en-IN')}<span className="text-[13px] font-semibold text-slate-500">/mo</span></p>
              <div className="relative mt-2 h-1.5 rounded-full bg-white/80">
                <span className="absolute inset-y-0 left-0 rounded-full bg-emerald-600" style={{ width: `${((emi - 5) / 5) * 100}%` }} />
                <span className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-white border-2 border-emerald-600 shadow" style={{ left: `${((emi - 5) / 5) * 100}%` }} />
              </div>
            </div>
          </Card>

          {/* IELTS: band score climbs */}
          <Card to="/ai-tools/ielts-evaluator" tone="linear-gradient(150deg,#E3EBFF,#B9CBFF)" title="Ace IELTS & tests" sub="Band scoring with feedback" delay={0.15}>
            <div className="h-full flex items-center gap-3">
              <motion.div key={t3} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="w-[74px] h-[74px] rounded-full bg-white grid place-items-center shadow-md shrink-0">
                <span className="text-[26px] font-bold text-[#C04A1D]">{bands[t3 % bands.length]}</span>
              </motion.div>
              <div className="text-[12px] text-blue-900 font-semibold leading-snug">Band<br /><span className="text-slate-500 font-medium">Task 2 essay</span></div>
            </div>
          </Card>

          {/* SOP: lines writing */}
          <Card to="/unicoach" tone="linear-gradient(150deg,#EFE7FF,#D4C2FF)" className="lg:col-span-2" title="SOP by experts" sub="Written and polished by seniors who got in" delay={0.2}>
            <div className="h-full flex items-center">
              <div className="w-full max-w-[380px] bg-white rounded-xl p-3 shadow-[0_12px_26px_-14px_rgba(76,29,149,0.4)]">
                {[92, 100, 70, 84].map((w, i) => (
                  <motion.div key={`${t4}-${i}`} className="h-2 rounded-full bg-[#E9E1FF] mb-2 last:mb-0" initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 0.6, delay: i * 0.45, ease: 'easeOut' }} />
                ))}
                <motion.p key={`c${t4}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="text-[11.5px] font-semibold text-[#3B4963] mt-2">✓ Reviewed by Prachi, mentor</motion.p>
              </div>
            </div>
          </Card>

          {/* Visa: stamp drops onto a passport */}
          <Card to="/visa-assistance" tone="linear-gradient(150deg,#FFE3EE,#FFB8D2)" className="lg:col-span-2" title="Get your visa" sub="Documents, mock interview, filing" delay={0.25}>
            <div className="h-full flex items-center gap-5">
              <div className="relative w-[96px] h-[120px] rounded-lg bg-[#1E3A5F] shadow-lg shrink-0 grid place-items-center">
                <span className="text-[9px] font-bold text-amber-200 tracking-[0.2em]">PASSPORT</span>
                <motion.span
                  key={t3}
                  initial={{ scale: 2.4, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: -14 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 380, damping: 16 }}
                  className="absolute -right-6 bottom-3 px-2.5 py-1 rounded-md border-[3px] border-[#7C3F33] text-[#7C3F33] bg-white/90 text-[12px] font-extrabold tracking-wider"
                >
                  APPROVED
                </motion.span>
              </div>
              <p className="text-[13px] text-rose-900 font-semibold leading-snug">Country-wise checklists and<br />one advisor till the stamp</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default JourneyRoute;
