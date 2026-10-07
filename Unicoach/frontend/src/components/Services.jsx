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
    highlight: 'Data-Driven Profile & Ivy Matching',
    subtitle: 'Evaluate 1,500+ global universities across USA, UK, Canada & Germany. Calibrate your Dream, Reach, and Safe target tiers with historical admit analytics.',
    bullets: [
      '1,500+ Verified Universities across USA, UK, Canada & Germany',
      'AI-calibrated Dream, Reach, and Safe profile categorization',
      'Direct 1-on-1 mentorship with Ivy & Russell Group alumni',
    ],
    ctaText: 'Build My Shortlist',
    link: '/universities',
    accentColor: '#DE5C2B',
    cardBg: '#FFF8F4',
    cardBorder: '#FED7CE',
    badgeBg: '#FFF0EB',
    badgeBorder: '#FED7CE',
    badgeText: '#C2410C',
    modalTitle: 'University Shortlist & Counseling',
  },
  {
    id: 'prep',
    step: '02',
    badge: 'AI Exam Engine',
    titleBold: 'UniCoach',
    titleLight: 'Prep',
    title: 'UniCoach Prep',
    highlight: 'IELTS, GRE, GMAT & TOEFL Mastery',
    subtitle: 'Adaptive AI diagnostic tests with instant essay band score predictions, speaking pronunciation analyzers, and masterclasses led by 99th-percentile tutors.',
    bullets: [
      'Instant AI band evaluation on IELTS Task 2 essays with grammar breakdown',
      'Full-length adaptive GRE & GMAT mock tests with percentile analytics',
      'Personalized study plans calibrated to your target university cutoff',
    ],
    ctaText: 'Start Free AI Diagnostic',
    link: '/ai-tools/ielts-evaluator',
    accentColor: '#7C3AED',
    cardBg: '#FAF8FF',
    cardBorder: '#C4B5FD',
    badgeBg: '#E2DCFE',
    badgeBorder: '#C4B5FD',
    badgeText: '#5B21B6',
    modalTitle: 'AI Test Prep & IELTS Evaluator',
  },
  {
    id: 'finance',
    step: '03',
    badge: 'Zero-Collateral Capital',
    titleBold: 'UniCoach',
    titleLight: 'Finance',
    title: 'UniCoach Finance',
    highlight: '₹1.5 Cr Pre-Approved Loans & Scholarships',
    subtitle: 'Access ₹24 Cr+ in merit scholarships and fast-track collateral-free education loans from 30+ premier international banking partners in under 48 hours.',
    bullets: [
      '₹24 Cr+ in active international scholarships cataloged and matched',
      'Zero-collateral sanctions up to ₹1.5 Cr for premier global universities',
      'Paperless sanction letter delivered in 48 hours with 0% markup',
    ],
    ctaText: 'Check Loan Eligibility',
    link: '/education-loan',
    public: true, // lead page: never put a login wall in front of it
    accentColor: '#15803D',
    cardBg: '#F7FCF5',
    cardBorder: '#A3E689',
    badgeBg: '#E7F7DF',
    badgeBorder: '#83C25F',
    badgeText: '#14532D',
    modalTitle: 'Scholarships & Education Loans',
  },
  {
    id: 'visa',
    step: '04',
    badge: '98.9% Approval Track',
    titleBold: 'UniCoach',
    titleLight: 'Visa & Care',
    title: 'UniCoach Visa & Care',
    highlight: 'AI Consular Mocks & Smooth Landing',
    subtitle: 'Eliminate visa anxiety with simulated consular interview drills, automated financial audit checks, verified student housing, and zero-forex debit cards.',
    bullets: [
      'Interactive AI consular interview simulator with actual visa questions',
      'DS-160 & financial documentation audit by former consular advisors',
      'Pre-departure housing reservation and international student sim cards',
    ],
    ctaText: 'Get Visa Assistance',
    link: '/visa-assistance',
    public: true,
    accentColor: '#DC0631',
    cardBg: '#FFF5F6',
    cardBorder: '#FECDD3',
    badgeBg: '#FFE4E8',
    badgeBorder: '#FECDD3',
    badgeText: '#9F1239',
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
    className="relative rounded-2xl sm:rounded-3xl w-full min-w-0 p-4 sm:p-6 border shadow-[0_8px_24px_rgba(15,23,42,0.04)] font-['Inter',sans-serif]"
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
  <div className="relative rounded-2xl sm:rounded-3xl w-full min-w-0 p-4 sm:p-6 bg-[#E2DCFE] border border-[#CFC5FB] shadow-[0_8px_24px_rgba(15,23,42,0.04)] font-['Inter',sans-serif]">
    <div className="rounded-xl sm:rounded-2xl bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-bold text-slate-900">IELTS Writing · Task 2</span>
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">AI evaluated</span>
    </div>
    <div className="mt-4 flex items-end gap-3">
      <span className="text-[44px] font-black leading-none text-[#6D28D9] tracking-tight">7.5</span>
      <span className="text-[12px] font-semibold text-slate-500 mb-1">Predicted band · target 7.0</span>
    </div>
    <div className="mt-4 space-y-2.5">
      {[['Task Response', 7.5], ['Coherence & Cohesion', 7], ['Lexical Resource', 8], ['Grammar Range & Accuracy', 7]].map(([label, band]) => (
        <div key={label}>
          <div className="flex justify-between text-[12px] font-semibold text-slate-700"><span>{label}</span><span>{band}</span></div>
          <div className="mt-1 h-2 rounded-full bg-[#F5F3FF]"><div className="h-full rounded-full bg-[#7C3AED]" style={{ width: `${(band / 9) * 100}%` }} /></div>
        </div>
      ))}
    </div>
    </div>
  </div>
);

// ── Card 3: education loan offer card ──
const LoanOfferMockup = () => (
  <div className="relative rounded-2xl sm:rounded-3xl w-full min-w-0 p-4 sm:p-6 bg-[#9FD368] border border-[#8CC453] shadow-[0_8px_24px_rgba(15,23,42,0.04)] font-['Inter',sans-serif]">
    <div className="flex items-center justify-between px-1">
      <span className="text-[13px] font-bold text-slate-900">Your loan options</span>
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white text-[#15803D] border border-white">3 lenders compared</span>
    </div>
    <div className="mt-4 space-y-2.5">
      {[['Public sector bank', 'Secured', '₹40 L'], ['Private bank', 'Collateral-free', '₹35 L'], ['NBFC', 'Collateral-free', '₹50 L']].map(([lender, type, amount]) => (
        <div key={lender} className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-900 truncate">{lender}</p>
            <p className="text-[11.5px] text-slate-500">{type}</p>
          </div>
          <span className="text-[14px] font-black text-[#15803D] shrink-0">{amount}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 p-3.5 rounded-xl bg-white border border-white flex items-center justify-between">
      <span className="text-[12.5px] font-semibold text-slate-700">Estimated EMI after moratorium</span>
      <span className="text-[15px] font-black text-[#15803D]">₹53,974/mo</span>
    </div>
  </div>
);

// ── Card 4: visa & pre-departure checklist ──
const VisaChecklistMockup = () => (
  <div className="relative rounded-2xl sm:rounded-3xl w-full min-w-0 p-4 sm:p-6 bg-[#9DE3DC] border border-[#86D6CE] shadow-[0_8px_24px_rgba(15,23,42,0.04)] font-['Inter',sans-serif]">
    <div className="flex items-center justify-between px-1">
      <span className="text-[13px] font-bold text-slate-900">Canada study permit · Fall intake</span>
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white text-[#9F1239] border border-white">4 / 6 done</span>
    </div>
    <div className="mt-4 space-y-2">
      {[['Offer letter & fee receipt', true], ['Proof of funds / loan sanction', true], ['Statement of purpose reviewed', true], ['Biometrics appointment', true], ['Mock visa interview', false], ['Accommodation & forex card', false]].map(([item, done]) => (
        <div key={item} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-[#DC0631] text-white' : 'border-2 border-[#FECDD3]'}`}>
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
    dreamDotColor: '#7C3AED',
    dreamBadgeText: '#5B21B6', dreamBadgeBg: '#F5F3FF', dreamBadgeBorder: '#DDD6FE',
    dreamRowBorder: '#FFFFFF',
    reachDotColor: '#DE5C2B',
    reachBadgeText: '#C2410C', reachBadgeBg: '#FFF7ED', reachBadgeBorder: '#FED7AA',
    reachRowBorder: '#FFFFFF',
    safeDotColor: '#15803D',
    safeBadgeText: '#15803D', safeBadgeBg: '#F0FDF4', safeBadgeBorder: '#BBF7D0',
    safeRowBorder: '#FFFFFF',
    oddsBg: '#FFFFFF', oddsBorder: '#FFFFFF', oddsText: '#C2410C',
  },
  {
    // Card 2: Purple / Prep (#E2DCFE)
    containerBorder: '#C4B5FD',
    dreamDotColor: '#7C3AED',
    dreamBadgeText: '#5B21B6', dreamBadgeBg: '#EDE9FE', dreamBadgeBorder: '#DDD6FE',
    reachDotColor: '#8B5CF6',
    reachBadgeText: '#6D28D9', reachBadgeBg: '#F5F3FF', reachBadgeBorder: '#C4B5FD',
    safeDotColor: '#059669',
    safeBadgeText: '#047857', safeBadgeBg: '#ECFDF5', safeBadgeBorder: '#A7F3D0',
    oddsBg: '#F5F3FF', oddsBorder: '#C4B5FD', oddsText: '#6D28D9',
  },
  {
    // Card 3: Green / Finance (#83C25F)
    containerBorder: '#A3E689',
    dreamDotColor: '#15803D',
    dreamBadgeText: '#14532D', dreamBadgeBg: '#F0FDF4', dreamBadgeBorder: '#BBF7D0',
    reachDotColor: '#16A34A',
    reachBadgeText: '#15803D', reachBadgeBg: '#F0FDF4', reachBadgeBorder: '#BBF7D0',
    safeDotColor: '#15803D',
    safeBadgeText: '#14532D', safeBadgeBg: '#DCFCE7', safeBadgeBorder: '#83C25F',
    oddsBg: '#F2FBF0', oddsBorder: '#83C25F', oddsText: '#15803D',
  },
  {
    // Card 4: Red / Visa (#DC0631)
    containerBorder: '#FECDD3',
    dreamDotColor: '#DC0631',
    dreamBadgeText: '#9F1239', dreamBadgeBg: '#FFF1F2', dreamBadgeBorder: '#FECDD3',
    reachDotColor: '#E11D48',
    reachBadgeText: '#9F1239', reachBadgeBg: '#FFF1F2', reachBadgeBorder: '#FECDD3',
    safeDotColor: '#059669',
    safeBadgeText: '#047857', safeBadgeBg: '#ECFDF5', safeBadgeBorder: '#A7F3D0',
    oddsBg: '#FFF1F2', oddsBorder: '#FECDD3', oddsText: '#DC0631',
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
              Complete End-to-End Study Abroad Ecosystem
            </span>
          </div>

          <h2 className="font-['Inter',sans-serif] text-[30px] sm:text-[38px] lg:text-[44px] font-black text-[#111111] leading-[1.12] tracking-[-0.035em]">
            Comprehensive Solutions,{' '}
            <span className="relative inline-block text-[#DE5C2B]">
              For Every Ambition
              <span className="absolute -bottom-1 left-0 w-full h-[6px] bg-[#FED7CE] rounded-full -z-10" />
            </span>
          </h2>

          <p className="text-[13.5px] sm:text-[15px] text-slate-600 mt-2.5 font-normal leading-relaxed max-w-2xl mx-auto">
            From discovering dream universities to acing exams, securing collateral-free loans, and landing on campus with full visa support.
          </p>
        </motion.div>

        {/* ════════ STICKY STACKING CARDS DECK ════════ */}
        <div className="relative pb-6 sm:pb-8 w-full min-w-0">
          {stackingCards.map((service, index) => {
            const topOffset = 96 + index * 20;
            const zIndexVal = 10 + index;
            const mockup = cardMockupProps[index];

            return (
              <div
                key={service.id}
                style={{
                  top: `${topOffset}px`,
                  zIndex: zIndexVal,
                  backgroundColor: service.cardBg,
                  borderColor: service.cardBorder,
                }}
                className="relative lg:sticky min-h-0 sm:min-h-[480px] flex flex-col justify-center rounded-[24px] sm:rounded-[36px] border p-5 sm:p-8 lg:p-10 xl:p-12 shadow-[0_16px_40px_rgba(15,23,42,0.06)] mb-6 sm:mb-10 lg:mb-14 last:mb-0 overflow-hidden w-full min-w-0"
              >
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
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[11.5px] font-bold tracking-wide border shadow-2xs mb-4"
                      style={{
                        backgroundColor: service.badgeBg,
                        borderColor: service.badgeBorder,
                        color: service.badgeText
                      }}
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
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 800,
                          WebkitTextStroke: '0.5px #000000',
                          paintOrder: 'stroke fill',
                        }}
                      >
                        UniCoach&nbsp;
                      </span>
                      <span
                        className="text-slate-800 font-normal tracking-[-0.02em]"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
                      >
                        {service.titleLight}
                      </span>
                    </h3>
                    <p className="font-['Inter',sans-serif] text-[15px] sm:text-[16.5px] font-normal text-slate-600 tracking-[-0.01em] mt-2">
                      {service.highlight}
                    </p>

                    {/* Description Paragraph */}
                    <p className="font-['Inter',sans-serif] text-[13px] sm:text-[14px] text-slate-600 mt-2.5 font-normal leading-relaxed max-w-xl">
                      {service.subtitle}
                    </p>

                    {/* Boxy Bullet Cards (UniCoach-inspired modular rows) */}
                    <div className="mt-5 space-y-2.5 w-full max-w-xl">
                      {service.bullets.map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-[12.5px] sm:text-[13px] text-slate-800 font-medium font-['Inter',sans-serif]"
                        >
                          <span
                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border text-[11px]"
                            style={{
                              backgroundColor: service.accentColor + '15',
                              borderColor: service.accentColor + '35',
                              color: service.accentColor
                            }}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                          <span className="leading-snug">{bullet}</span>
                        </div>
                      ))}
                    </div>

                    {/* Boxy CTA Action Button */}
                    <button
                      onClick={() => handleAction(service)}
                      className="mt-6 inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#111111] text-white text-[13.5px] sm:text-[14px] font-bold font-['Inter',sans-serif] tracking-tight shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
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
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-6 w-full min-w-0"
                  >
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
