/**
 * Infographic kit for content pages. Every component takes the page's own numbers
 * through props; none ships data of its own. Brand palette: ink, UniCoach orange,
 * marigold, teal, royal blue, rani pink.
 */

const INK = '#16130F';
const PALETTE = ['#DE5C2B', '#F2B705', '#14837E', '#B8285B', '#E4007C', '#D0362E'];
// Poster tiles for StatStrip: background + text colour
const STAT_TILES = [['#F2B705', INK], ['#14837E', '#FFFFFF'], ['#B8285B', '#FFFFFF'], ['#FFF6E5', INK]];

const Frame = ({ title, kicker, source, children, className = '' }) => (
  <figure className={`not-prose m-0 rounded-2xl border-2 border-[#16130F] bg-white p-5 sm:p-6 shadow-[5px_5px_0_#16130F] ${className}`}>
    {(kicker || title) && (
      <figcaption className="mb-4">
        {kicker && <span className="inline-block mb-1.5 px-2 py-0.5 text-[11px] font-bold tracking-[0.12em] uppercase bg-[#F2B705] text-[#16130F]">{kicker}</span>}
        {title && <span className="block font-urbanist text-[19px] sm:text-[21px] font-extrabold leading-tight text-[#16130F]">{title}</span>}
      </figcaption>
    )}
    {children}
    {source && <p className="mt-4 mb-0 text-[11.5px] text-[#5B544A]">Source: {source}</p>}
  </figure>
);

/* Horizontal bars scaled to the largest value. items: [{ label, value: number, display?: string }] */
export const BarCompare = ({ title, kicker, items, source, highlight, className = '' }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <Frame title={title} kicker={kicker} source={source} className={className}>
      <ul className="m-0 p-0 list-none flex flex-col gap-3">
        {items.map((item, i) => {
          const on = highlight ? item.label === highlight : i === 0;
          return (
            <li key={item.label} className="grid grid-cols-1 sm:grid-cols-[minmax(84px,30%)_1fr] items-center gap-1 sm:gap-3">
              <span className="text-[13.5px] font-semibold text-[#16130F] leading-tight">{item.label}</span>
              <span className="flex items-center gap-2 min-w-0">
                {/* bar track takes the space left after the value, so long values never push it out */}
                <span className="flex-1 min-w-0">
                  <span
                    className="block h-7 rounded-md border-2 border-[#16130F]"
                    style={{ width: `${Math.max(6, (item.value / max) * 100)}%`, background: on ? '#DE5C2B' : '#F2E6CF' }}
                  />
                </span>
                <span className="font-urbanist text-[14px] font-extrabold text-[#16130F] whitespace-nowrap">{item.display ?? item.value}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
};

/* Horizontal timeline. steps: [{ when, what, note?, highlight? }] */
export const TimelineStrip = ({ title, kicker, steps, source, className = '' }) => (
  <Frame title={title} kicker={kicker} source={source} className={className}>
    <ol className="m-0 p-0 list-none flex overflow-x-auto pb-2 -mx-1">
      {steps.map((s, i) => (
        <li key={`${s.when}-${i}`} className="relative flex flex-col items-center text-center shrink-0 w-[140px] sm:w-[160px] lg:w-auto lg:flex-1 lg:min-w-[120px] px-1">
          {i < steps.length - 1 && <span aria-hidden="true" className="absolute top-[15px] left-1/2 w-full h-[3px] bg-[#16130F]" />}
          <span
            className="relative grid place-items-center w-8 h-8 rounded-full border-[3px] border-[#16130F] font-urbanist text-[13px] font-black"
            style={{ background: s.highlight ? '#F2B705' : '#fff', color: INK }}
          >
            {i + 1}
          </span>
          <span className="mt-2 text-[12px] font-bold tracking-wide uppercase text-[#C04A1D]">{s.when}</span>
          <span className="mt-0.5 text-[13.5px] font-semibold leading-snug text-[#16130F]">{s.what}</span>
          {s.note && <span className="mt-0.5 text-[12px] leading-snug text-[#5B544A]">{s.note}</span>}
        </li>
      ))}
    </ol>
  </Frame>
);

/* Row of poster-colour stat tiles. stats: [{ value, label }] */
export const StatStrip = ({ stats, source, className = '' }) => (
  <div className={`not-prose ${className}`}>
    <div className={`grid gap-2.5 sm:gap-3 ${stats.length >= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
      {stats.map((s, i) => (
        <div key={s.label} className="rounded-2xl border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] px-4 py-3.5"
          style={{ background: STAT_TILES[i % STAT_TILES.length][0], color: STAT_TILES[i % STAT_TILES.length][1] }}>
          <div className="font-urbanist text-[24px] sm:text-[30px] font-black leading-none" style={{ letterSpacing: '-0.03em' }}>{s.value}</div>
          <div className="mt-1.5 text-[12.5px] font-semibold leading-snug opacity-85">{s.label}</div>
        </div>
      ))}
    </div>
    {source && <p className="mt-2 mb-0 text-[11.5px] text-[#5B544A]">Source: {source}</p>}
  </div>
);

/* Donut chart for shares. segments: [{ label, value: number, display? }] */
export const Donut = ({ title, kicker, segments, centerValue, centerLabel, source, className = '' }) => {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const R = 54;
  const C = 2 * Math.PI * R;
  // each arc starts where the previous ones end
  const arcs = segments.map((s, i) => {
    const len = (s.value / total) * C;
    const start = segments.slice(0, i).reduce((a, p) => a + (p.value / total) * C, 0);
    return { ...s, len, start };
  });
  return (
    <Frame title={title} kicker={kicker} source={source} className={className}>
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <svg viewBox="0 0 140 140" className="w-[150px] h-[150px] shrink-0 -rotate-90" role="img" aria-label={title}>
          <circle cx="70" cy="70" r={R} fill="none" stroke="#F2E6CF" strokeWidth="22" />
          {arcs.map((a, i) => (
            <circle key={a.label} cx="70" cy="70" r={R} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="22"
              strokeDasharray={`${a.len} ${C - a.len}`} strokeDashoffset={-a.start} />
          ))}
          <circle cx="70" cy="70" r="43" fill="#fff" stroke={INK} strokeWidth="2" />
          {centerValue && (
            <g className="rotate-90" style={{ transformOrigin: '70px 70px' }}>
              <text x="70" y="70" textAnchor="middle" fontFamily="Urbanist, sans-serif" fontWeight="900" fontSize="22" fill={INK}>{centerValue}</text>
              {centerLabel && <text x="70" y="88" textAnchor="middle" fontFamily="Onest, sans-serif" fontSize="10" fill="#5B544A">{centerLabel}</text>}
            </g>
          )}
        </svg>
        <ul className="m-0 p-0 list-none flex flex-col gap-2 w-full">
          {segments.map((s, i) => (
            <li key={s.label} className="flex items-center justify-between gap-3 text-[13.5px]">
              <span className="flex items-center gap-2 font-semibold text-[#16130F]">
                <span className="w-3.5 h-3.5 rounded-sm border-2 border-[#16130F] shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                {s.label}
              </span>
              <span className="font-urbanist font-extrabold text-[#16130F] whitespace-nowrap">{s.display ?? s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
};

/* Two-column "vs" comparison. left/right: { title, tag?, points: string[] } */
export const VersusCard = ({ title, kicker, left, right, className = '' }) => (
  <Frame title={title} kicker={kicker} className={className}>
    <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[left, right].map((side, i) => (
        <div key={side.title} className={`rounded-xl border-2 border-[#16130F] p-4 ${i === 0 ? 'bg-[#FFF1E6]' : 'bg-[#E6F7F5]'}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-urbanist text-[17px] font-extrabold text-[#16130F]">{side.title}</span>
            {side.tag && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border-2 border-[#16130F] bg-white">{side.tag}</span>}
          </div>
          <ul className="mt-2.5 mb-0 pl-0 list-none flex flex-col gap-1.5">
            {side.points.map((p) => (
              <li key={p} className="flex gap-2 text-[13.5px] leading-snug text-[#16130F]">
                <span aria-hidden="true" className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: i === 0 ? '#DE5C2B' : '#14837E' }} />
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <span aria-hidden="true" className="hidden sm:grid absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 place-items-center rounded-full bg-[#16130F] text-[#F2B705] font-['Anton',sans-serif] text-[15px]">VS</span>
    </div>
  </Frame>
);

/* Big hook number band for the top of a page. */
export const HookBand = ({ value, label, hi, className = '' }) => (
  <div className={`not-prose relative overflow-hidden rounded-2xl bg-[#DE5C2B] text-white px-5 py-4 sm:px-7 sm:py-5 flex flex-wrap items-end gap-x-4 gap-y-1 ${className}`}>
    <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,19,15,.18)_1.3px,transparent_1.7px)] [background-size:9px_9px]" />
    <span className="relative font-urbanist text-[40px] sm:text-[52px] font-black leading-none" style={{ letterSpacing: '-0.04em' }}>{value}</span>
    <span className="relative text-[14px] sm:text-[15px] font-semibold leading-snug max-w-md pb-1">{label}</span>
    {hi && <span className="relative ml-auto font-urbanist font-extrabold text-[24px] sm:text-[28px] leading-none text-[#F2B705] [text-shadow:2px_2px_0_#16130F]">{hi}</span>}
  </div>
);
