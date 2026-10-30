import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Brand elements from the UniCoach design reference (askmanavi, JobsMatch, Creative Boom).
 * Small, self-contained pieces: each takes real content through props, none ships numbers of its own.
 */

const INK = '#16130F';
const ORANGE = '#DE5C2B';
const MUSTARD = '#F3C64A';

/* 1. Tape headline: each line sits in its own tilted block (askmanavi hook) */
export const TapeHeadline = ({ lines, as: Tag = 'h2', size = 'md', className = '' }) => {
  const text = size === 'lg' ? 'text-[30px] sm:text-[44px] lg:text-[54px]' : 'text-[24px] sm:text-[32px] lg:text-[38px]';
  return (
    <Tag className={`flex flex-col items-start gap-1.5 ${className}`} style={{ letterSpacing: 0 }}>
      {lines.map((line, i) => {
        const tone = line.tone || (i % 2 ? 'orange' : 'ink');
        const bg = tone === 'orange' ? ORANGE : tone === 'mustard' ? MUSTARD : INK;
        const fg = tone === 'mustard' ? INK : '#fff';
        return (
          <span
            key={i}
            className={`inline-block px-2.5 sm:px-3 py-1 uppercase leading-none ${text}`}
            style={{
              fontFamily: "'Anton', 'Urbanist', Impact, sans-serif",
              fontWeight: 400,
              letterSpacing: '0.01em',
              lineHeight: 1.05,
              background: bg,
              color: fg,
              boxShadow: `4px 4px 0 ${INK}`,
              transform: `rotate(${i % 2 ? 1 : -1.5}deg)`,
            }}
          >
            {line.text}
          </span>
        );
      })}
    </Tag>
  );
};

/* 2. Red pen on a document: one row gets circled with a handwritten note */
export const RedPenDoc = ({ title, rows, note, className = '' }) => (
  <figure
    className={`relative bg-white border border-[#E6DCC8] rounded-md shadow-[0_10px_30px_-12px_rgba(22,19,15,0.25)] px-5 pt-4 pb-7 rotate-[1.5deg] ${className}`}
  >
    {title && <figcaption className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B6458] mb-2">{title}</figcaption>}
    <dl className="text-[13.5px]">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-4 py-2 border-b border-[#F1EBE2] last:border-0">
          <dt className="text-[#6B6458]">{row.label}</dt>
          <dd className="relative font-semibold text-[#16130F] text-right">
            {row.value}
            {row.flag && (
              <svg aria-hidden="true" viewBox="0 0 120 40" preserveAspectRatio="none" className="absolute -inset-x-3 -inset-y-2 w-[calc(100%+24px)] h-[calc(100%+16px)] overflow-visible pointer-events-none">
                <ellipse cx="60" cy="20" rx="58" ry="17" fill="none" stroke="#D0312D" strokeWidth="2.5" transform="rotate(-3 60 20)" vectorEffect="non-scaling-stroke" />
              </svg>
            )}
          </dd>
        </div>
      ))}
    </dl>
    {note && (
      <span
        className="absolute -bottom-3 right-3 text-[22px] leading-none text-[#D0312D] -rotate-6"
        style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive", fontWeight: 700 }}
      >
        {note}
      </span>
    )}
  </figure>
);

/* 2b. Inline red-pen circle around a word, with an optional handwritten note above it */
export const RedPenCircle = ({ children, note, className = '' }) => (
  <span className={`relative inline-block ${className}`}>
    {children}
    <svg aria-hidden="true" viewBox="0 0 120 40" preserveAspectRatio="none" className="absolute -left-1.5 -right-1.5 -top-1 -bottom-1 w-[calc(100%+12px)] h-[calc(100%+8px)] overflow-visible pointer-events-none">
      <ellipse cx="60" cy="20" rx="58" ry="17" fill="none" stroke="#D0312D" strokeWidth="2" transform="rotate(-3 60 20)" vectorEffect="non-scaling-stroke" />
    </svg>
    {note && (
      <span
        className="absolute left-1/2 -top-4 -translate-x-1/2 -rotate-6 whitespace-nowrap text-[14px] leading-none text-[#D0312D]"
        style={{ fontFamily: "'Caveat', 'Comic Sans MS', cursive", fontWeight: 700 }}
      >
        {note}
      </span>
    )}
  </span>
);

/* 3. Official number with a source tag */
export const SourceStat = ({ value, label, source, href, className = '' }) => (
  <div className={`flex flex-col items-start gap-1.5 ${className}`}>
    <span className="text-[10px] font-bold tracking-[0.14em] uppercase px-2 py-1" style={{ background: MUSTARD, color: INK }}>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">Official source · {source}</a>
      ) : (
        <>Official source · {source}</>
      )}
    </span>
    <span className="font-urbanist text-[40px] sm:text-[48px] font-black leading-none text-[#16130F]" style={{ letterSpacing: '-0.04em' }}>{value}</span>
    {label && <span className="text-[13px] text-[#5B544A]">{label}</span>}
  </div>
);

/* 4. Hazard stripe frame for deadlines and urgent notices */
const stripes = { background: `repeating-linear-gradient(-45deg, ${INK} 0 12px, ${MUSTARD} 12px 24px)` };
export const HazardFrame = ({ children, className = '' }) => (
  <div className={`overflow-hidden rounded-2xl border-2 border-[#16130F] bg-[#FFF8E1] ${className}`}>
    <div aria-hidden="true" className="h-3" style={stripes} />
    <div className="px-5 py-4 sm:px-6">{children}</div>
    <div aria-hidden="true" className="h-3" style={stripes} />
  </div>
);

/* 5. Takeaway bar: one key line plus an action */
export const TakeawayBar = ({ children, actionLabel, to, onAction, className = '' }) => {
  const action = actionLabel && (to ? (
    <Link to={to} className="shrink-0 inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-[#F3C64A] px-3 py-1.5 text-[12px] font-bold tracking-wide text-[#F3C64A] hover:bg-[#F3C64A] hover:text-[#16130F] transition-colors">
      {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  ) : (
    <button type="button" onClick={onAction} className="shrink-0 inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-[#F3C64A] px-3 py-1.5 text-[12px] font-bold tracking-wide text-[#F3C64A] hover:bg-[#F3C64A] hover:text-[#16130F] transition-colors cursor-pointer">
      {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
    </button>
  ));
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-[#16130F] px-5 py-4 text-white text-[15px] font-semibold leading-snug [&_b]:text-[#F3C64A] ${className}`}>
      <p className="m-0">{children}</p>
      {action}
    </div>
  );
};

/* 6. Numbered counter boxes for durations or steps; highlighted boxes turn mustard */
export const CounterBox = ({ children, highlight = false, className = '' }) => (
  <span
    className={`grid place-items-center w-10 h-12 sm:w-11 sm:h-13 border-2 border-[#16130F] font-urbanist text-[20px] sm:text-[22px] font-black text-[#16130F] ${className}`}
    style={{ background: highlight ? MUSTARD : '#fff', boxShadow: `3px 3px 0 ${INK}` }}
  >
    {children}
  </span>
);

export const StepCounter = ({ items, className = '' }) => (
  <ol className={`flex flex-wrap items-start gap-2 sm:gap-3 list-none p-0 m-0 ${className}`}>
    {items.map((item, i) => (
      <li key={i} className="flex flex-col items-center gap-1.5 w-[64px] sm:w-[76px]">
        <CounterBox highlight={item.highlight}>{item.n ?? i + 1}</CounterBox>
        <span className="text-[11.5px] leading-tight text-center text-[#3D362E] font-medium">{item.label}</span>
      </li>
    ))}
  </ol>
);

/* 7. Dark stat card (JobsMatch) */
export const StatCard = ({ value, label, compact = false, className = '' }) => (
  <div className={`border border-[#2C3249] bg-[#1D2133] text-white ${compact ? 'rounded-xl px-3.5 py-2.5' : 'rounded-2xl px-5 py-4'} ${className}`}>
    <div className={`font-urbanist font-black leading-none ${compact ? 'text-[20px] sm:text-[24px]' : 'text-[30px] sm:text-[36px]'}`} style={{ letterSpacing: '-0.04em' }}>{value}</div>
    <div className={`mt-1 text-[#B7BCCD] ${compact ? 'text-[11.5px]' : 'text-[13px]'}`}>{label}</div>
  </div>
);

/* 8. Journey pills joined by a gradient line; `active` marks the current step */
// Desi Pop step colours: a light tint for upcoming steps, the full colour for the active one
const PILL_TONES = [
  { tint: '#FFF4CC', solid: '#F2B705', solidText: INK },
  { tint: '#DDF7F3', solid: '#14B8A6', solidText: INK },
  { tint: '#FFE0F0', solid: '#E4007C', solidText: '#FFFFFF' },
  { tint: '#E3E7FB', solid: '#2B3FA0', solidText: '#FFFFFF' },
];
// truck-art style dashed connector in orange, marigold and teal
const PILL_CONNECTOR = 'repeating-linear-gradient(90deg, #DE5C2B 0 10px, transparent 10px 14px, #F2B705 14px 24px, transparent 24px 28px, #14B8A6 28px 38px, transparent 38px 42px)';

export const JourneyPills = ({ steps, active = steps.length - 1, className = '' }) => (
  <ol className={`flex items-start overflow-x-auto list-none p-0 m-0 pt-1 pb-2 ${className}`}>
    {steps.map((step, i) => {
      const tone = PILL_TONES[i % PILL_TONES.length];
      const on = i === active;
      return (
        <li key={step.label} className="relative flex flex-col items-center gap-2 shrink-0 w-[86px] sm:w-[128px]">
          {/* connector runs from this pill's centre to the next one, behind both pills */}
          {i < steps.length - 1 && <span aria-hidden="true" className="absolute top-[16px] left-1/2 w-full h-[4px]" style={{ background: PILL_CONNECTOR }} />}
          <span
            className="relative rounded-full border-2 border-[#16130F] px-2.5 sm:px-3.5 py-1.5 text-[11.5px] sm:text-[14px] font-urbanist font-extrabold whitespace-nowrap"
            style={{
              background: on ? tone.solid : tone.tint,
              color: on ? tone.solidText : INK,
              boxShadow: on ? `3px 3px 0 ${INK}` : 'none',
            }}
          >
            {step.label}
          </span>
          {step.sub && <span className="text-[11.5px] leading-tight text-center text-[#6B6458] px-1">{step.sub}</span>}
        </li>
      );
    })}
  </ol>
);

/* 9a. Tilted sticker label */
const LABEL_TONES = {
  white: 'bg-white text-[#16130F]',
  blue: 'bg-[#3B5BDB] text-white',
  orange: 'bg-[#DE5C2B] text-white',
  mustard: 'bg-[#F3C64A] text-[#16130F]',
};
export const StickerLabel = ({ children, tone = 'white', tilt = -5, className = '' }) => (
  <span
    className={`inline-block rounded-full border-2 border-[#16130F] px-3.5 py-1 text-[13px] font-bold whitespace-nowrap ${LABEL_TONES[tone]} ${className}`}
    style={{ transform: `rotate(${tilt}deg)`, boxShadow: `2px 3px 0 ${INK}` }}
  >
    {children}
  </span>
);

/* 9b. Googly eyes mark (Creative Boom) */
export const GooglyEyes = ({ size = 28, className = '' }) => (
  <span aria-hidden="true" className={`inline-flex gap-0.5 ${className}`}>
    {[0, 1].map((i) => (
      <span key={i} className="relative rounded-full bg-white border-[3px] border-[#16130F]" style={{ width: size, height: size }}>
        <span className="absolute rounded-full bg-[#16130F]" style={{ width: size * 0.42, height: size * 0.42, left: size * 0.12, top: size * 0.26 }} />
      </span>
    ))}
  </span>
);
