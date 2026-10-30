import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import { ShortlistLoop, PrepLoop, FinanceLoop, VisaLoop } from './ServiceLoops';

gsap.registerPlugin(ScrollTrigger);

// ── 4 Premium Stacking Cards with 4 Distinct Harmonized Brand Themes ──
const stackingCards = [
  {
    id: 'shortlist',
    step: '01',
    badge: 'Admissions Strategy',
    titleBold: 'UniCoach',
    titleLight: 'Shortlist',
    title: 'UniCoach Shortlist',
    highlight: 'The right universities for your profile',
    subtitle: 'Search 98,000+ programs at 1,300+ universities, then build a shortlist that fits your marks and budget with a counsellor who knows how admissions actually go.',
    bullets: [
      '98,000+ programs to search, filter and shortlist for free',
      'A shortlist matched to your marks, scores and budget',
      '1:1 calls with seniors studying at the universities you want',
    ],
    ctaText: 'Build My Shortlist',
    link: '/search-programs',
    accentColor: '#DE5C2B',
    cardBg: '#FFF8F4',
    cardBorder: '#FED7CE',
    badgeBg: '#FFF0EB',
    badgeBorder: '#FED7CE',
    badgeText: '#C04A1D',
    modalTitle: 'University Shortlist & Counseling',
  },
  {
    id: 'prep',
    step: '02',
    badge: 'Test Prep',
    titleBold: 'UniCoach',
    titleLight: 'Prep',
    title: 'UniCoach Prep',
    highlight: 'IELTS, PTE, GRE, GMAT & TOEFL guides',
    subtitle: 'Know what each exam asks, what score your universities need, and get your IELTS essays checked by AI before test day.',
    bullets: [
      'Free AI band score and feedback on IELTS Writing Task 2',
      'Syllabus, fees, dates and prep plans for every major exam',
      'A study plan built around the score your universities ask for',
    ],
    ctaText: 'Start Free AI Diagnostic',
    link: '/ai-tools/ielts-evaluator',
    accentColor: '#485A79',
    cardBg: '#FAF8FF',
    cardBorder: '#9EB0CA',
    badgeBg: '#E2DCFE',
    badgeBorder: '#9EB0CA',
    badgeText: '#303C51',
    modalTitle: 'AI Test Prep & IELTS Evaluator',
  },
  {
    id: 'finance',
    step: '03',
    badge: 'Funding',
    titleBold: 'UniCoach',
    titleLight: 'Finance',
    title: 'UniCoach Finance',
    highlight: 'Scholarships & education loans',
    subtitle: 'Find the scholarships you actually qualify for, and compare education loans, with or without collateral, before you pick a lender.',
    bullets: [
      'Scholarships matched to your study level, country and marks',
      'Loan options from several lenders compared side by side',
      'Help with the paperwork, from application to sanction letter',
    ],
    ctaText: 'Check Loan Eligibility',
    link: '/education-loan',
    public: true, // lead page: never put a login wall in front of it
    accentColor: '#385942',
    cardBg: '#F7FCF5',
    cardBorder: '#A3E689',
    badgeBg: '#E7F7DF',
    badgeBorder: '#83C25F',
    badgeText: '#263B2D',
    modalTitle: 'Scholarships & Education Loans',
  },
  {
    id: 'visa',
    step: '04',
    badge: 'Visa & Pre-Departure',
    titleBold: 'UniCoach',
    titleLight: 'Visa & Care',
    title: 'UniCoach Visa & Care',
    highlight: 'Visa interview practice & landing help',
    subtitle: 'Practise real visa interview questions, get your financial documents checked, and sort housing before you fly.',
    bullets: [
      'Mock visa interviews with an AI officer that tells you what to fix',
      'Visa forms and financial documents checked by counsellors',
      'Pre-departure help with housing, forex and your first week abroad',
    ],
    ctaText: 'Get Visa Assistance',
    link: '/visa-assistance',
    public: true,
    accentColor: '#DC0631',
    cardBg: '#FFF5F6',
    cardBorder: '#EBC5BA',
    badgeBg: '#FFE4E8',
    badgeBorder: '#EBC5BA',
    badgeText: '#64342B',
    modalTitle: 'AI Visa Simulator & Pre-Departure',
  },
];

// Right-hand side of each card: a looping infographic (see ServiceLoops.jsx)
const LOOPS = { shortlist: ShortlistLoop, prep: PrepLoop, finance: FinanceLoop, visa: VisaLoop };

export const Services = () => {
  const navigate = useNavigate();
  const { user, token, openLoginModal } = useAuth();
  const { openEligibilityModal } = useLead();
  const containerRef = useRef(null);

  const handleAction = (service) => {
    if (!service.public && !user && !token) {
      if (openLoginModal) {
        openLoginModal({
          title: `Access ${service.modalTitle}`,
          subtitle: 'Sign in free with Google or email to continue',
          preventRedirect: true,
          onSuccess: () => {
            navigate(service.link);
          },
        });
        return;
      }
    }
    navigate(service.link);
  };

  return (
    <section
      ref={containerRef}
      id="services"
      className="pt-3 sm:pt-5 pb-4 sm:pb-6 bg-[#FAF9F6] relative z-10 w-full max-w-full"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 w-full min-w-0">

        {/* ════════ SECTION HEADER ════════ */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/95 border border-orange-200/90 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#DE5C2B]" />
            <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-800 tracking-tight">
              Everything in one place
            </span>
          </div>

          <h2 className="font-['Onest',sans-serif] text-[30px] sm:text-[38px] lg:text-[44px] font-black text-[#111111] leading-[1.12] tracking-[-0.035em]">
            From shortlist to visa,{' '}
            <span className="relative inline-block text-[#DE5C2B]">
              we&apos;ve got you
              <span className="absolute -bottom-1 left-0 w-full h-[6px] bg-[#FED7CE] rounded-full -z-10" />
            </span>
          </h2>

          <p className="text-[13.5px] sm:text-[15px] text-slate-600 mt-2.5 font-normal leading-relaxed max-w-2xl mx-auto">
            Pick the right universities, clear your exams, fund your degree and get your visa, with seniors and counsellors at every step.
          </p>
        </motion.div>

        {/* ════════ STICKY STACKING CARDS DECK ════════ */}
        <div className="relative pb-6 sm:pb-8 w-full min-w-0">
          {stackingCards.map((service, index) => {
            const topOffset = 96 + index * 20;
            const zIndexVal = 10 + index;
            const Loop = LOOPS[service.id];

            return (
              <div
                key={service.id}
                style={{
                  // only the desktop sticky stack uses this; on phones a `top` on a relative card shifts it into the next one
                  '--stick-top': `${topOffset}px`,
                  zIndex: zIndexVal,
                  background: `radial-gradient(120% 120% at 100% 0%, ${service.accentColor}1F 0%, ${service.cardBg} 45%, #FFFFFF 100%)`,
                  borderColor: `${service.accentColor}26`,
                }}
                className="relative lg:sticky lg:top-[var(--stick-top)] min-h-0 sm:min-h-[480px] flex flex-col justify-center rounded-[24px] sm:rounded-[36px] border p-4 sm:p-8 lg:p-10 xl:p-12 shadow-[0_16px_40px_rgba(15,23,42,0.06)] mb-4 sm:mb-10 lg:mb-14 last:mb-0 overflow-hidden w-full min-w-0"
              >
                {/* Soft accent glow in the corner */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
                  style={{ background: service.accentColor + '33' }}
                />
                {/* Top Subtle Brand Highlight Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${service.accentColor} 50%, transparent 100%)`
                  }}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center w-full min-w-0">

                  {/* ── LEFT COLUMN (Boxy Grotesque UniCoach Style) ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-6 flex flex-col items-start text-left w-full min-w-0"
                  >
                    {/* Step Badge */}
                    <div
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold tracking-wide mb-3 sm:mb-4 bg-white/80 backdrop-blur shadow-[0_4px_14px_-6px_rgba(15,23,42,0.18)]"
                      style={{ color: service.badgeText }}
                    >
                      <span className="font-mono font-black">{service.step}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      <span>{service.badge}</span>
                    </div>

                    {/* Headline (UniCoach Ultra-Black Display Style: UniCoach is mega-thick like upto 4X, rest is normal) */}
                    <h3 className="font-normal text-[27px] sm:text-[38px] lg:text-[48px] leading-[1.08] tracking-[-0.035em] text-[#111111]">
                      <span
                        className="text-black inline-block tracking-[-0.04em]"
                        style={{
                          fontFamily: "'Onest', sans-serif",
                          fontWeight: 800,
                          WebkitTextStroke: '0.5px #000000',
                          paintOrder: 'stroke fill',
                        }}
                      >
                        UniCoach&nbsp;
                      </span>
                      <span
                        className="text-slate-800 font-normal tracking-[-0.02em]"
                        style={{ fontFamily: "'Onest', sans-serif", fontWeight: 400 }}
                      >
                        {service.titleLight}
                      </span>
                    </h3>
                    <p className="font-['Onest',sans-serif] text-[15px] sm:text-[16.5px] font-normal text-slate-600 tracking-[-0.01em] mt-2">
                      {service.highlight}
                    </p>

                    {/* Description Paragraph */}
                    <p className="hidden sm:block font-['Onest',sans-serif] text-[13px] sm:text-[14px] text-slate-600 mt-2.5 font-normal leading-relaxed max-w-xl">
                      {service.subtitle}
                    </p>

                    {/* Boxy Bullet Cards (UniCoach-inspired modular rows) */}
                    <ul className="mt-3.5 sm:mt-5 space-y-2 sm:space-y-3 w-full max-w-xl">
                      {service.bullets.map((bullet, bIdx) => (
                        <motion.li
                          key={bIdx}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.45, delay: 0.25 + bIdx * 0.1 }}
                          className="flex items-start gap-2.5 sm:gap-3 text-[13px] sm:text-[14.5px] text-slate-800 font-medium font-['Onest',sans-serif]"
                        >
                          <span
                            className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: service.accentColor }}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                          <span className="leading-snug">{bullet}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Boxy CTA Action Button */}
                    <button
                      onClick={() => handleAction(service)}
                      className="mt-5 sm:mt-7 inline-flex items-center gap-2.5 h-11 sm:h-12 px-5 sm:px-6 rounded-full bg-[#111111] text-white text-[13.5px] sm:text-[14px] font-bold font-['Onest',sans-serif] tracking-tight shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = service.accentColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#111111';
                      }}
                    >
                      <span>{service.ctaText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </motion.div>

                  {/* ── RIGHT COLUMN: looping infographic for this service ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 40, rotate: 2, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-6 w-full min-w-0 relative"
                  >
                    {Loop && <Loop />}
                  </motion.div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Services;
