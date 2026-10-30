import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion, animate } from 'framer-motion';

/*
 * Right-hand side of the four homepage service cards (Services.jsx): a deck of infographics that plays like
 * Instagram stories. Each slide draws itself (bars grow, donut fills, numbers count up), then the next one comes in.
 * Pauses off screen and on hover; reduced-motion users get the first slide, drawn and still.
 * Facts carry their source; anything that is advice or an example says so.
 */

const INK = '#16130F';
const SLIDE_MS = 4200;

/* ── small animated pieces ── */

const CountUp = ({ to, decimals = 0, prefix = '', suffix = '', play }) => {
  const [v, setV] = useState(play ? 0 : to);
  useEffect(() => {
    if (!play) return undefined;
    const c = animate(0, to, { duration: 1.1, ease: 'easeOut', onUpdate: setV });
    return () => c.stop();
  }, [to, play]);
  return <>{prefix}{v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
};

const Kicker = ({ children, bg = '#F2B705', fg = INK }) => (
  <span className="inline-block px-2 py-0.5 text-[10.5px] font-bold tracking-[0.12em] uppercase" style={{ background: bg, color: fg }}>{children}</span>
);
const Title = ({ children }) => <h4 className="mt-1.5 font-urbanist text-[16.5px] sm:text-[20px] font-extrabold leading-tight text-[#16130F]">{children}</h4>;
const Source = ({ children }) => <p className="mt-2.5 sm:mt-3 text-[10px] sm:text-[10.5px] leading-snug text-[#5B544A]">{children}</p>;

// Horizontal bars: rows [label, value, display]
const Bars = ({ rows, color, play, unit = '' }) => {
  const max = Math.max(...rows.map((r) => r[1]));
  return (
    <ul className="mt-2.5 sm:mt-3 space-y-1.5 sm:space-y-2">
      {rows.map(([label, value, display], n) => (
        <li key={label} className="grid grid-cols-[88px_1fr] sm:grid-cols-[104px_1fr] items-center gap-2">
          <span className="text-[12.5px] font-semibold text-[#16130F] truncate">{label}</span>
          <span className="flex items-center gap-2 min-w-0">
            <span className="flex-1 min-w-0">
              <motion.span className="block h-5 sm:h-6 rounded-md border-2 border-[#16130F]" style={{ background: n === 0 ? color : '#F2E6CF' }}
                initial={{ width: play ? '4%' : `${(value / max) * 100}%` }} animate={{ width: `${Math.max(6, (value / max) * 100)}%` }}
                transition={{ delay: 0.15 + n * 0.12, duration: 0.7, ease: 'easeOut' }} />
            </span>
            <span className="font-urbanist text-[13px] font-extrabold text-[#16130F] whitespace-nowrap">{display ?? `${value}${unit}`}</span>
          </span>
        </li>
      ))}
    </ul>
  );
};

// Donut: parts [label, value, colour]; centre text
const DonutChart = ({ parts, center, sub, play }) => {
  const total = parts.reduce((a, p) => a + p[1], 0);
  const R = 46; const C = 2 * Math.PI * R;
  // each arc starts where the earlier ones end
  const arcs = parts.map((p, n) => ({ p, len: (p[1] / total) * C, off: parts.slice(0, n).reduce((a, q) => a + (q[1] / total) * C, 0) }));
  return (
    <div className="mt-3 flex flex-col min-[420px]:flex-row items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-[118px] h-[118px] shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#F2E6CF" strokeWidth="20" />
        {arcs.map(({ p: [label, , color], len, off }, n) => {
          return (
            <motion.circle key={label} cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="20" strokeDashoffset={-off}
              initial={{ strokeDasharray: play ? `0 ${C}` : `${len} ${C - len}` }} animate={{ strokeDasharray: `${len} ${C - len}` }}
              transition={{ delay: 0.15 + n * 0.3, duration: 0.6, ease: 'easeOut' }} />
          );
        })}
        <circle cx="60" cy="60" r="35" fill="#fff" stroke={INK} strokeWidth="2" />
        <g className="rotate-90" style={{ transformOrigin: '60px 60px' }}>
          <text x="60" y="62" textAnchor="middle" fontFamily="Urbanist, sans-serif" fontWeight="900" fontSize="20" fill={INK}>{center}</text>
          <text x="60" y="77" textAnchor="middle" fontFamily="Onest, sans-serif" fontSize="8.5" fill="#5B544A">{sub}</text>
        </g>
      </svg>
      <ul className="space-y-1.5 min-w-0 w-full min-[420px]:flex-1">
        {parts.map(([label, value, color, display]) => (
          <li key={label} className="flex items-center justify-between gap-2 text-[12.5px]">
            <span className="flex items-center gap-2 font-semibold text-[#16130F] min-w-0">
              <span className="w-3 h-3 rounded-sm border-2 border-[#16130F] shrink-0" style={{ background: color }} /><span className="truncate">{label}</span>
            </span>
            <span className="font-urbanist font-extrabold text-[#16130F] whitespace-nowrap">{display ?? value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Big-number poster tiles: tiles [value, label, prefix, suffix, bg, fg]; numbers count up, strings show as they are
const Tiles = ({ tiles, play }) => (
  <div className="mt-3 grid grid-cols-2 gap-2.5">
    {tiles.map(([value, label, prefix = '', suffix = '', bg, fg = INK], n) => (
      <motion.div key={label} className={`rounded-xl border-[2.5px] border-[#16130F] shadow-[3px_3px_0_#16130F] px-3 py-2.5 ${tiles.length === 3 && n === 2 ? 'col-span-2' : ''}`} style={{ background: bg, color: fg }}
        initial={play ? { opacity: 0, y: 10, rotate: n % 2 ? 2 : -2 } : false} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.1 + n * 0.15 }}>
        <div className="font-urbanist text-[24px] sm:text-[28px] font-black leading-none tracking-[-0.03em]">
          {typeof value === 'string' ? value : <CountUp to={value} decimals={value % 1 ? 1 : 0} prefix={prefix} suffix={suffix} play={play} />}
        </div>
        <div className="mt-1 text-[11.5px] font-semibold leading-snug opacity-85">{label}</div>
      </motion.div>
    ))}
  </div>
);

// Two-side comparison
const Versus = ({ left, right, play }) => (
  <div className="relative mt-3 grid grid-cols-2 gap-2.5">
    {[left, right].map((side, n) => (
      <motion.div key={side.title} className="rounded-xl border-2 border-[#16130F] p-3" style={{ background: n ? '#E6F7F5' : '#FFF1E6' }}
        initial={play ? { opacity: 0, x: n ? 16 : -16 } : false} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + n * 0.15 }}>
        <span className="font-urbanist text-[15px] font-extrabold text-[#16130F]">{side.title}</span>
        <ul className="mt-1.5 space-y-1">
          {side.points.map((p) => (
            <li key={p} className="flex gap-1.5 text-[12px] leading-snug text-[#16130F]">
              <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: n ? '#14837E' : '#DE5C2B' }} />{p}
            </li>
          ))}
        </ul>
      </motion.div>
    ))}
    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-full bg-[#16130F] text-[#F2B705] font-['Anton',sans-serif] text-[12px]">VS</span>
  </div>
);

// Vertical step track that fills top to bottom
const Steps = ({ steps, color, play }) => (
  <ol className="relative mt-3 space-y-2.5 pl-1">
    <span className="absolute left-[15px] top-3 bottom-3 w-[3px] bg-[#F2E6CF]" aria-hidden="true" />
    <motion.span className="absolute left-[15px] top-3 w-[3px] origin-top" style={{ background: color, bottom: 12 }} aria-hidden="true"
      initial={{ scaleY: play ? 0 : 1 }} animate={{ scaleY: 1 }} transition={{ duration: 0.4 + steps.length * 0.3, ease: 'linear' }} />
    {steps.map(([when, what], n) => (
      <motion.li key={what} className="relative flex items-center gap-3" initial={play ? { opacity: 0, x: 8 } : false} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + n * 0.3 }}>
        <span className="relative z-10 w-[30px] h-[30px] shrink-0 grid place-items-center rounded-full border-[2.5px] border-[#16130F] font-urbanist text-[12px] font-black" style={{ background: n === steps.length - 1 ? color : '#fff', color: n === steps.length - 1 ? '#fff' : INK }}>{n + 1}</span>
        <span className="min-w-0">
          <span className="block text-[10.5px] font-bold tracking-wide uppercase text-[#C04A1D]">{when}</span>
          <span className="block text-[13px] font-semibold leading-snug text-[#16130F]">{what}</span>
        </span>
      </motion.li>
    ))}
  </ol>
);

/* ── the deck: story-style progress bars + slides ── */

const Deck = ({ slides, accent, bg }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-80px' });
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const running = inView && !reduced && !paused;
  useEffect(() => {
    if (!running) return undefined;
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [running, i, slides.length]);
  const Slide = slides[i];
  return (
    <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      className="relative rounded-2xl sm:rounded-3xl w-full min-w-0 p-2.5 sm:p-5 font-['Onest',sans-serif]" style={{ background: bg }}>
      {/* story progress */}
      <div className="flex gap-1.5 mb-2.5 sm:mb-3">
        {slides.map((_, n) => (
          <button key={n} type="button" aria-label={`Show infographic ${n + 1}`} onClick={() => setI(n)} className="no-shine flex-1 h-[5px] rounded-full bg-white/70 overflow-hidden cursor-pointer">
            <motion.span key={`${n}-${i}`} className="block h-full rounded-full" style={{ background: accent }}
              initial={{ width: n < i ? '100%' : '0%' }} animate={{ width: n < i || (n === i && !running) ? '100%' : n === i ? '100%' : '0%' }}
              transition={n === i && running ? { duration: SLIDE_MS / 1000, ease: 'linear' } : { duration: 0 }} />
          </button>
        ))}
      </div>
      <div className="relative sm:min-h-[320px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={i} initial={{ opacity: 0, x: 40, rotate: 1.5 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -40, rotate: -1.5 }} transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-2xl border-[2.5px] border-[#16130F] bg-white p-3.5 sm:p-5 shadow-[4px_4px_0_#16130F] sm:shadow-[5px_5px_0_#16130F]">
            <Slide play={!reduced} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ── 1. Shortlist ── */
const SHORTLIST_SLIDES = [
  ({ play }) => (<>
    <Kicker>Where Indians study</Kicker><Title>Indian students abroad, by country</Title>
    <Bars play={play} color="#DE5C2B" rows={[['Canada', 4.27, '4.27 L'], ['USA', 3.37, '3.37 L'], ['UK', 1.85, '1.85 L'], ['Australia', 1.22, '1.22 L'], ['Germany', 0.43, '0.43 L']]} />
    <Source>Source: Ministry of External Affairs, Rajya Sabha reply, 2024</Source>
  </>),
  ({ play }) => (<>
    <Kicker>How we build it</Kicker><Title>A balanced shortlist of 7</Title>
    <DonutChart play={play} center="7" sub="universities" parts={[['Dream: a stretch', 2, '#DE5C2B'], ['Target: good odds', 3, '#F2B705'], ['Safe: near-certain', 2, '#14837E']]} />
    <Source>Our usual split. Your counsellor tunes it to your profile.</Source>
  </>),
  ({ play }) => (<>
    <Kicker bg="#14837E" fg="#fff">Course Finder</Kicker><Title>Search before you shortlist</Title>
    <Tiles play={play} tiles={[[98000, 'programs to search', '', '+', '#F2B705'], [1300, 'universities', '', '+', '#14837E', '#fff'], [10, 'countries, one search', '', '', '#FFF6E5']]} />
    <Source>Free on UniCoach. No sign-up to search.</Source>
  </>),
];

/* ── 2. Prep ── */
const PREP_SLIDES = [
  ({ play }) => (<>
    <Kicker>The usual ask</Kicker><Title>English score most Masters ask for</Title>
    <Tiles play={play} tiles={[[6.5, 'IELTS overall', '', '', '#F2B705'], [90, 'TOEFL iBT', '', '', '#14837E', '#fff'], [115, 'Duolingo English Test', '', '+', '#FFF6E5']]} />
    <Source>Typical minimum. Top programs and some courses ask for more.</Source>
  </>),
  ({ play }) => (<>
    <Kicker>Pick your test</Kicker><Title>IELTS or PTE?</Title>
    <Versus play={play} left={{ title: 'IELTS', points: ['Paper or computer', 'Speaking face to face with an examiner', 'Accepted almost everywhere'] }} right={{ title: 'PTE', points: ['Computer only', 'Speaking recorded and AI-scored', 'Results usually within 2 days'] }} />
    <Source>Check which tests your universities and visa accept.</Source>
  </>),
  ({ play }) => (<>
    <Kicker>6-week plan</Kicker><Title>From first mock to test day</Title>
    <Steps play={play} color="#485A79" steps={[['Week 1', 'Diagnostic mock, find weak sections'], ['Weeks 2–3', 'Writing and speaking drills'], ['Week 4', 'Free AI band score on your essays'], ['Week 5', 'Full timed mocks'], ['Week 6', 'Test day']]} />
  </>),
];

/* ── 3. Finance ── */
const emi = (lakh) => { const P = lakh * 1e5; const r = 0.105 / 12; const n = 120; return Math.round((P * r * (1 + r) ** n) / ((1 + r) ** n - 1)); };
const FINANCE_SLIDES = [
  ({ play }) => (<>
    <Kicker>Example plan</Kicker><Title>Paying for a ₹48 L Masters in Canada</Title>
    <DonutChart play={play} center="₹48L" sub="2 years, total" parts={[['Education loan', 35, '#385942', '₹35 L'], ['Family savings', 9, '#F2B705', '₹9 L'], ['Scholarship', 4, '#DE5C2B', '₹4 L']]} />
    <Source>Example only. Tuition + living, approximate.</Source>
  </>),
  ({ play }) => (<>
    <Kicker>Loan types</Kicker><Title>With or without collateral</Title>
    <Versus play={play} left={{ title: 'Secured', points: ['Property or FD as security', 'Lower interest', 'Larger amounts'] }} right={{ title: 'Unsecured', points: ['No collateral', 'Higher interest', 'Depends on university and course'] }} />
    <Source>We compare several lenders side by side for you.</Source>
  </>),
  ({ play }) => (<>
    <Kicker bg="#385942" fg="#fff">Know this</Kicker><Title>Numbers worth knowing</Title>
    <Tiles play={play} tiles={[[8, 'years of tax deduction on loan interest (Section 80E)', '', ' yrs', '#F2B705'], [emi(35), 'EMI on ₹35 L at 10.5% over 10 years', '₹', '', '#14837E', '#fff']]} />
    <Source>Income Tax Act, Section 80E. EMI is an example.</Source>
  </>),
];

/* ── 4. Visa ── */
const VISA_SLIDES = [
  ({ play }) => (<>
    <Kicker>After you graduate</Kicker><Title>How long you can stay to work</Title>
    <Bars play={play} color="#DC0631" rows={[['USA (STEM)', 36, 'up to 3 yrs'], ['Canada', 36, 'up to 3 yrs'], ['Australia', 24, '2 yrs'], ['Ireland', 24, '2 yrs'], ['Germany', 18, '18 months'], ['UK', 18, '18 months']]} />
    <Source>Masters graduates. UK: 18 months for applications from Jan 2027. Official immigration sites.</Source>
  </>),
  ({ play }) => (<>
    <Kicker>The visa path</Kicker><Title>Admit to boarding pass</Title>
    <Steps play={play} color="#DC0631" steps={[['Step 1', 'Offer letter and fee deposit'], ['Step 2', 'Proof of funds or loan sanction'], ['Step 3', 'Visa form and documents checked'], ['Step 4', 'Biometrics or interview, with a mock first'], ['Step 5', 'Visa, flight, housing, forex']]} />
  </>),
  ({ play }) => (<>
    <Kicker bg="#DC0631" fg="#fff">One country, one rule</Kicker><Title>The document people miss</Title>
    <Tiles play={play} tiles={[[28, 'UK: funds held for 28 days in a row', '', ' days', '#F2B705'], ['APS', 'Germany: certificate needed before the visa', '', '', '#14837E', '#fff'], ['DS-160', 'USA: form filled before the interview', '', '', '#FFF6E5']]} />
    <Source>Your counsellor checks the full list for your country.</Source>
  </>),
];

export const ShortlistLoop = () => <Deck slides={SHORTLIST_SLIDES} accent="#DE5C2B" bg="#FED7CE" />;
export const PrepLoop = () => <Deck slides={PREP_SLIDES} accent="#485A79" bg="#E2DCFE" />;
export const FinanceLoop = () => <Deck slides={FINANCE_SLIDES} accent="#385942" bg="#9FD368" />;
export const VisaLoop = () => <Deck slides={VISA_SLIDES} accent="#DC0631" bg="#9DE3DC" />;
