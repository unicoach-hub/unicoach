import React from 'react';
import { JourneyPills } from './BrandElements';

/*
 * Form building blocks in the Course Finder look (SearchProgramsPage), shared by every tool and search page:
 * centred eyebrow + big headline + journey pills, then one white card of plain labelled fields.
 */

// Native inputs and selects: cream fill, warm border, orange on focus
export const FINDER_FIELD = 'w-full h-11 px-3 text-[14px] text-[#16130F] bg-[#F8F5EF] border border-[#E6E0D4] outline-none focus:border-[#DE5C2B] focus:bg-white transition-colors placeholder:text-[#9A9184]';
export const FINDER_TEXTAREA = 'w-full px-3 py-2.5 text-[14px] leading-relaxed text-[#16130F] bg-[#F8F5EF] border border-[#E6E0D4] outline-none focus:border-[#DE5C2B] focus:bg-white transition-colors placeholder:text-[#9A9184]';
export const FINDER_FIELD_ERR = '!border-[#C97C6A] !bg-[#FBF2EF]';
export const FIELD_RADIUS = { borderRadius: 10 };

export const FinderHero = ({ eyebrow, title, subtitle, steps, active = 0, children }) => (
  <div className="text-center pt-4 sm:pt-6">
    {eyebrow && (
      <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#86351A]"><span className="w-6 h-[2px] bg-[#DE5C2B]" /> {eyebrow}</p>
    )}
    <h1 className="mt-3 font-outfit text-[32px] sm:text-[46px] font-black tracking-[-0.035em] leading-[1.05] text-[#16130F]">{title}</h1>
    {subtitle && <p className="mt-3 text-[15px] sm:text-[17px] text-[#5B544A] max-w-2xl mx-auto">{subtitle}</p>}
    {steps && <JourneyPills steps={steps} active={active} className="mt-5 mx-auto w-fit max-w-full" />}
    {children}
  </div>
);

export const FinderCard = ({ children, className = '' }) => (
  <div className={`bg-white border border-[#E6E0D4] shadow-[0_24px_60px_-36px_rgba(22,19,15,0.35)] p-4 sm:p-5 ${className}`} style={{ borderRadius: 18 }}>
    {children}
  </div>
);

export const FinderField = ({ label, children, error, hint, className = '' }) => (
  <label className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
    {label && <span className="text-[12.5px] font-semibold text-[#16130F]">{label}</span>}
    {children}
    {error ? <span className="text-[11.5px] font-medium text-[#984D3D] leading-tight">{error}</span>
      : hint && <span className="text-[11.5px] text-[#5B544A] leading-tight">{hint}</span>}
  </label>
);

// Dark primary action, turns orange on hover (the Course Finder "Search" button)
export const FinderButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`h-11 px-6 inline-flex items-center justify-center gap-2 text-white text-[14px] font-semibold bg-[#16130F] hover:bg-[#DE5C2B] disabled:opacity-60 disabled:hover:bg-[#16130F] transition-colors ${className}`}
    style={{ borderRadius: 10 }}
  >
    {children}
  </button>
);

// Tap-to-pick chips (the Course Finder quick filters)
export const FinderChip = ({ on, children, className = '', ...props }) => (
  <button
    type="button"
    aria-pressed={on}
    {...props}
    className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 border transition-colors hover:border-[#16130F] ${className}`}
    style={{ borderRadius: 999, background: on ? '#16130F' : '#fff', borderColor: on ? '#16130F' : '#E6E0D4', color: on ? '#fff' : '#16130F' }}
  >
    {children}
  </button>
);

// Page shell: the Course Finder background, width and font
export const FinderPage = ({ children, className = '' }) => (
  <div className={`min-h-screen pt-[76px] pb-20 font-['Onest',sans-serif] ${className}`} style={{ background: '#F6F3EC' }}>
    <div className="max-w-6xl mx-auto px-4">{children}</div>
  </div>
);
