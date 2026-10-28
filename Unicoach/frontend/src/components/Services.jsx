import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';

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
    subtitle: 'Search 98,000+ programs at 1,300+ universities, then sort them into Dream, Target and Safe with a counsellor who knows how admissions actually go.',
    bullets: [
      '98,000+ programs to search, filter and shortlist for free',
      'Dream, Target and Safe options based on your marks and scores',
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

// ── Image 2 Shortlist Mockup (Used Across All 4 Cards with Matching Color Palettes) ──
const UniversityShortlistMockup = ({
  containerBorder,
  dreamDotColor, dreamBadgeText, dreamBadgeBg, dreamBadgeBorder,
  reachDotColor, reachBadgeText, reachBadgeBg, reachBadgeBorder,
  safeDotColor, safeBadgeText, safeBadgeBg, safeBadgeBorder,
  oddsBg, oddsBorder, oddsText,
  // White rows on a coloured panel (panel colour from the UniCoach feature cards palette)
  panelBg = '#FFFFFF',
  dreamRowBg = '#FFFFFF', dreamRowBorder = '#E2E8F0',
  reachRowBg = '#FFFFFF', reachRowBorder = '#E2E8F0',
  safeRowBg = '#FFFFFF', safeRowBorder = '#E2E8F0',
}) => (
  <div
    className="relative rounded-2xl sm:rounded-3xl w-full min-w-0 p-4 sm:p-6 border shadow-[0_8px_24px_rgba(15,23,42,0.04)] font-['Onest',sans-serif]"
    style={{ borderColor: containerBorder, backgroundColor: panelBg }}
  >
    <div className="space-y-3">
      {/* 1. Columbia University (MS CS) - Dream Tier */}
      <div
        className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow"
        style={{ backgroundColor: dreamRowBg, borderColor: dreamRowBorder }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dreamDotColor }} />
          <span className="text-[13px] sm:text-[14px] font-bold text-slate-900 truncate">Columbia University (MS CS)</span>
        </div>
        <span
          className="shrink-0 whitespace-nowrap text-[10.5px] sm:text-[11.5px] font-bold px-3 py-1 rounded-lg border"
          style={{
            color: dreamBadgeText,
            backgroundColor: dreamBadgeBg,
            borderColor: dreamBadgeBorder
          }}
        >
          Dream Tier
        </span>
      </div>

      {/* 2. TU Munich (Informatics) - Reach Tier */}
      <div
        className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow"
        style={{ backgroundColor: reachRowBg, borderColor: reachRowBorder }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: reachDotColor }} />
          <span className="text-[13px] sm:text-[14px] font-bold text-slate-900 truncate">TU Munich (Informatics)</span>
        </div>
        <span
          className="shrink-0 whitespace-nowrap text-[10.5px] sm:text-[11.5px] font-bold px-3 py-1 rounded-lg border"
          style={{
            color: reachBadgeText,
            backgroundColor: reachBadgeBg,
            borderColor: reachBadgeBorder
          }}
        >
          Reach Tier
        </span>
      </div>

      {/* 3. Univ. of Manchester (MSc Data) - Safe Admit */}
      <div
        className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow"
        style={{ backgroundColor: safeRowBg, borderColor: safeRowBorder }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: safeDotColor }} />
          <span className="text-[13px] sm:text-[14px] font-bold text-slate-900 truncate">Univ. of Manchester (MSc Data)</span>
        </div>
        <span
          className="shrink-0 whitespace-nowrap text-[10.5px] sm:text-[11.5px] font-bold px-3 py-1 rounded-lg border"
          style={{
            color: safeBadgeText,
            backgroundColor: safeBadgeBg,
            borderColor: safeBadgeBorder
          }}
        >
          Safe Admit
        </span>
      </div>

      {/* 4. Admission Success Odds (Image 2 style: two lines stacked) */}
      <div
        className="mt-3.5 sm:mt-4 p-4 rounded-xl sm:rounded-2xl border flex flex-col justify-center text-left"
        style={{ backgroundColor: oddsBg, borderColor: oddsBorder }}
      >
        <span className="text-[12px] sm:text-[13px] font-semibold text-slate-700">
          Admission Success Odds:
        </span>
        <div className="text-[14px] sm:text-[15.5px] font-black mt-1 tracking-tight" style={{ color: oddsText }}>
          Your personalised odds after a free profile review
        </div>
      </div>
    </div>
  </div>
);

// ── Card 2: AI test-prep score card ──
const PrepScoreMockup = () => (
  <div className="relative rounded-2xl sm:rounded-3xl w-full min-w-0 p-4 sm:p-6 bg-[#E2DCFE] border border-[#CFC5FB] shadow-[0_8px_24px_rgba(15,23,42,0.04)] font-['Onest',sans-serif]">
    <div className="rounded-xl sm:rounded-2xl bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-bold text-slate-900">IELTS Writing · Task 2</span>
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F1F4F8] text-[#3B4963] border border-[#C4D0E1]">AI evaluated</span>
    </div>
    <div className="mt-4 flex items-end gap-3">
      <span className="text-[44px] font-black leading-none text-[#3B4963] tracking-tight">7.5</span>
      <span className="text-[12px] font-semibold text-slate-500 mb-1">Predicted band · target 7.0</span>
    </div>
    <div className="mt-4 space-y-2.5">
      {[['Task Response', 7.5], ['Coherence & Cohesion', 7], ['Lexical Resource', 8], ['Grammar Range & Accuracy', 7]].map(([label, band]) => (
        <div key={label}>
          <div className="flex justify-between text-[12px] font-semibold text-slate-700"><span>{label}</span><span>{band}</span></div>
          <div className="mt-1 h-2 rounded-full bg-[#F1F4F8]"><div className="h-full rounded-full bg-[#485A79]" style={{ width: `${(band / 9) * 100}%` }} /></div>
        </div>
      ))}
    </div>
    </div>
  </div>
);

// ── Card 3: education loan offer card ──
const LoanOfferMockup = () => (
  <div className="relative rounded-2xl sm:rounded-3xl w-full min-w-0 p-4 sm:p-6 bg-[#9FD368] border border-[#8CC453] shadow-[0_8px_24px_rgba(15,23,42,0.04)] font-['Onest',sans-serif]">
    <div className="flex items-center justify-between px-1">
      <span className="text-[13px] font-bold text-slate-900">Your loan options</span>
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white text-[#385942] border border-white">3 lenders compared</span>
    </div>
    <div className="mt-4 space-y-2.5">
      {[['Public sector bank', 'Secured', '₹40 L'], ['Private bank', 'Collateral-free', '₹35 L'], ['NBFC', 'Collateral-free', '₹50 L']].map(([lender, type, amount]) => (
        <div key={lender} className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-900 truncate">{lender}</p>
            <p className="text-[11.5px] text-slate-500">{type}</p>
          </div>
          <span className="text-[14px] font-black text-[#385942] shrink-0">{amount}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 p-3.5 rounded-xl bg-white border border-white flex items-center justify-between">
      <span className="text-[12.5px] font-semibold text-slate-700">Estimated EMI after moratorium</span>
      <span className="text-[15px] font-black text-[#385942]">₹53,974/mo</span>
    </div>
  </div>
);

// ── Card 4: visa & pre-departure checklist ──
const VisaChecklistMockup = () => (
  <div className="relative rounded-2xl sm:rounded-3xl w-full min-w-0 p-4 sm:p-6 bg-[#9DE3DC] border border-[#86D6CE] shadow-[0_8px_24px_rgba(15,23,42,0.04)] font-['Onest',sans-serif]">
    <div className="flex items-center justify-between px-1">
      <span className="text-[13px] font-bold text-slate-900">Canada study permit · Fall intake</span>
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white text-[#64342B] border border-white">4 / 6 done</span>
    </div>
    <div className="mt-4 space-y-2">
      {[['Offer letter & fee receipt', true], ['Proof of funds / loan sanction', true], ['Statement of purpose reviewed', true], ['Biometrics appointment', true], ['Mock visa interview', false], ['Accommodation & forex card', false]].map(([item, done]) => (
        <div key={item} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-[#DC0631] text-white' : 'border-2 border-[#EBC5BA]'}`}>
            {done && <Check className="w-3 h-3 stroke-[3]" />}
          </span>
          <span className={`text-[13px] font-semibold ${done ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

const cardMockupProps = [
  {
    // Card 1: Orange / Admissions — white rows on the peach panel (#FED7CE, UniCoach feature cards)
    containerBorder: '#FBC2B3',
    panelBg: '#FED7CE',
    dreamDotColor: '#485A79',
    dreamBadgeText: '#303C51', dreamBadgeBg: '#F1F4F8', dreamBadgeBorder: '#C4D0E1',
    dreamRowBorder: '#FFFFFF',
    reachDotColor: '#DE5C2B',
    reachBadgeText: '#C04A1D', reachBadgeBg: '#FDF4EF', reachBadgeBorder: '#F3C9B4',
    reachRowBorder: '#FFFFFF',
    safeDotColor: '#385942',
    safeBadgeText: '#385942', safeBadgeBg: '#F1F6F2', safeBadgeBorder: '#C3D9C8',
    safeRowBorder: '#FFFFFF',
    oddsBg: '#FFFFFF', oddsBorder: '#FFFFFF', oddsText: '#C04A1D',
  },
  {
    // Card 2: Purple / Prep (#E2DCFE)
    containerBorder: '#9EB0CA',
    dreamDotColor: '#485A79',
    dreamBadgeText: '#303C51', dreamBadgeBg: '#E1E7F0', dreamBadgeBorder: '#C4D0E1',
    reachDotColor: '#5A7094',
    reachBadgeText: '#3B4963', reachBadgeBg: '#F1F4F8', reachBadgeBorder: '#9EB0CA',
    safeDotColor: '#446D50',
    safeBadgeText: '#385942', safeBadgeBg: '#F1F6F2', safeBadgeBorder: '#C3D9C8',
    oddsBg: '#F1F4F8', oddsBorder: '#9EB0CA', oddsText: '#3B4963',
  },
  {
    // Card 3: Green / Finance (#83C25F)
    containerBorder: '#A3E689',
    dreamDotColor: '#385942',
    dreamBadgeText: '#263B2D', dreamBadgeBg: '#F1F6F2', dreamBadgeBorder: '#C3D9C8',
    reachDotColor: '#446D50',
    reachBadgeText: '#385942', reachBadgeBg: '#F1F6F2', reachBadgeBorder: '#C3D9C8',
    safeDotColor: '#385942',
    safeBadgeText: '#263B2D', safeBadgeBg: '#E1ECE3', safeBadgeBorder: '#83C25F',
    oddsBg: '#F2FBF0', oddsBorder: '#83C25F', oddsText: '#385942',
  },
  {
    // Card 4: Red / Visa (#DC0631)
    containerBorder: '#EBC5BA',
    dreamDotColor: '#DC0631',
    dreamBadgeText: '#64342B', dreamBadgeBg: '#FBF2EF', dreamBadgeBorder: '#EBC5BA',
    reachDotColor: '#984D3D',
    reachBadgeText: '#64342B', reachBadgeBg: '#FBF2EF', reachBadgeBorder: '#EBC5BA',
    safeDotColor: '#446D50',
    safeBadgeText: '#385942', safeBadgeBg: '#F1F6F2', safeBadgeBorder: '#C3D9C8',
    oddsBg: '#FBF2EF', oddsBorder: '#EBC5BA', oddsText: '#DC0631',
  },
];

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
            const mockup = cardMockupProps[index];
            const icon3d = { shortlist: 'target', prep: 'notebook', finance: 'rupee', visa: 'travel' }[service.id];

            return (
              <div
                key={service.id}
                style={{
                  top: `${topOffset}px`,
                  zIndex: zIndexVal,
                  background: `radial-gradient(120% 120% at 100% 0%, ${service.accentColor}1F 0%, ${service.cardBg} 45%, #FFFFFF 100%)`,
                  borderColor: `${service.accentColor}26`,
                }}
                className="relative lg:sticky min-h-0 sm:min-h-[480px] flex flex-col justify-center rounded-[24px] sm:rounded-[36px] border p-5 sm:p-8 lg:p-10 xl:p-12 shadow-[0_16px_40px_rgba(15,23,42,0.06)] mb-6 sm:mb-10 lg:mb-14 last:mb-0 overflow-hidden w-full min-w-0"
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full min-w-0">

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
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold tracking-wide mb-4 bg-white/80 backdrop-blur shadow-[0_4px_14px_-6px_rgba(15,23,42,0.18)]"
                      style={{ color: service.badgeText }}
                    >
                      <span className="font-mono font-black">{service.step}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      <span>{service.badge}</span>
                    </div>

                    {/* Headline (UniCoach Ultra-Black Display Style: UniCoach is mega-thick like upto 4X, rest is normal) */}
                    <h3 className="font-normal text-[30px] sm:text-[38px] lg:text-[48px] leading-[1.08] tracking-[-0.035em] text-[#111111]">
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
                    <p className="font-['Onest',sans-serif] text-[13px] sm:text-[14px] text-slate-600 mt-2.5 font-normal leading-relaxed max-w-xl">
                      {service.subtitle}
                    </p>

                    {/* Boxy Bullet Cards (UniCoach-inspired modular rows) */}
                    <ul className="mt-5 space-y-3 w-full max-w-xl">
                      {service.bullets.map((bullet, bIdx) => (
                        <motion.li
                          key={bIdx}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.45, delay: 0.25 + bIdx * 0.1 }}
                          className="flex items-start gap-3 text-[13.5px] sm:text-[14.5px] text-slate-800 font-medium font-['Onest',sans-serif]"
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
                      className="mt-7 inline-flex items-center gap-2.5 h-12 px-6 rounded-full bg-[#111111] text-white text-[13.5px] sm:text-[14px] font-bold font-['Onest',sans-serif] tracking-tight shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
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

                  {/* ── RIGHT COLUMN: University Shortlist Mockup (Image 2 style, all 4 cards) ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 40, rotate: 2, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-6 w-full min-w-0 relative"
                  >
                    {icon3d && (
                      <motion.div
                        className="hidden sm:block absolute -top-16 -right-4 lg:-right-10 w-20 lg:w-24 z-20 pointer-events-none"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <motion.img
                          src={`/images/3d/${icon3d}.webp`}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          className="w-full drop-shadow-[0_18px_24px_rgba(15,23,42,0.25)]"
                          initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.5 }}
                        />
                      </motion.div>
                    )}
                    {service.id === 'prep' && <PrepScoreMockup />}
                    {service.id === 'finance' && <LoanOfferMockup />}
                    {service.id === 'visa' && <VisaChecklistMockup />}
                    {service.id === 'shortlist' && <UniversityShortlistMockup {...mockup} />}
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
