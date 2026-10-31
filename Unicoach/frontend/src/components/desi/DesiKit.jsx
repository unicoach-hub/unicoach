import { Link } from 'react-router-dom';
import { INK, DESI } from './desiTokens';

/*
 * Desi Pop page kit for content pages (resources, guides), in the look of the career counselling page:
 * flat poster colours, 3px ink borders, hard offset shadows, a Hindi kicker over every heading.
 * Use with BookOkCta for the closing call to action.
 */

// Station-board sign: Hinglish on top, English in caps below
export const StationSign = ({ hi, en, className = '' }) => (
  <div className={`inline-flex flex-col items-center px-4 py-2 bg-[#FFF6D6] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] ${className}`} style={{ borderRadius: 6 }}>
    <span className="font-urbanist font-black text-[16px] leading-none tracking-[-0.01em] text-[#16130F]">{hi}</span>
    <span className="mt-1 font-['Anton',sans-serif] tracking-[0.12em] text-[12.5px] leading-none text-[#16130F]">{en}</span>
  </div>
);

// Small ink-bordered sticker (facts under a hero title)
export const Sticker = ({ children, bg = '#FFFFFF', fg = INK, tilt = 0, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] text-[12.5px] sm:text-[13px] font-bold ${className}`}
    style={{ background: bg, color: fg, borderRadius: 8, transform: tilt ? `rotate(${tilt}deg)` : undefined }}>
    {children}
  </span>
);

// Full-width hero band. `crumbs` = [{ label, to? }], `aside` = right column (infographic etc.)
export const DesiHero = ({ tone = 'mustard', sign, crumbs = [], title, subtitle, stickers, aside, children }) => {
  const t = DESI[tone] || DESI.mustard;
  return (
    <section className="px-4 sm:px-6 pt-[96px] md:pt-[112px] pb-12 sm:pb-16" style={{ background: t.bg, color: t.fg }}>
      <div className="max-w-[1240px] mx-auto">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-[12px] font-semibold overflow-x-auto whitespace-nowrap" style={{ color: t.fg, opacity: 0.8 }}>
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {c.to ? <Link to={c.to} className="hover:underline">{c.label}</Link> : <span className={i === crumbs.length - 1 ? 'font-bold' : ''}>{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <div className={`grid gap-8 lg:gap-12 items-center ${aside ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]' : ''}`}>
          <div className="min-w-0">
            {sign && <StationSign hi={sign.hi} en={sign.en} className="mb-5" />}
            <h1 className="font-urbanist font-black text-[36px] sm:text-[50px] lg:text-[56px] leading-[0.98] tracking-[-0.04em]">{title}</h1>
            {subtitle && <p className="mt-4 text-[15px] sm:text-[17px] font-medium leading-relaxed max-w-[560px]" style={{ opacity: 0.9 }}>{subtitle}</p>}
            {stickers && <div className="mt-6 flex flex-wrap gap-2.5">{stickers}</div>}
            {children}
          </div>
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
      </div>
    </section>
  );
};

// Section heading with a Hindi kicker
export const DesiHeading = ({ hi, children, light = false, className = '' }) => (
  <div className={className}>
    {hi && <p className={`font-urbanist font-extrabold text-[15px] leading-none ${light ? 'text-[#F2B705]' : 'text-[#D0362E]'}`}>{hi}</p>}
    <h2 className={`mt-1.5 font-urbanist font-black text-[26px] sm:text-[34px] leading-[1.05] tracking-[-0.03em] ${light ? 'text-white' : 'text-[#16130F]'}`}>{children}</h2>
  </div>
);

// White card with an ink border and a hard shadow
export const InkCard = ({ children, className = '', shadow = INK, style, as: Tag = 'div', ...rest }) => (
  <Tag className={`bg-white border-[3px] border-[#16130F] ${className}`} style={{ borderRadius: 14, boxShadow: `5px 5px 0 ${shadow}`, ...style }} {...rest}>
    {children}
  </Tag>
);
