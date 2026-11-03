import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ShortlistLoop, PrepLoop, FinanceLoop, VisaLoop } from './ServiceLoops';
import { StationSign } from '../desi/DesiKit';

gsap.registerPlugin(ScrollTrigger);

// ── 4 stacking service cards, each an opaque Desi Pop poster card (accent = solid colour, soft = card colour) ──
const stackingCards = [
  {
    id: 'shortlist',
    step: '01',
    kicker: 'Sahi university, sahi fit',
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
    accent: '#DE5C2B',
    accentFg: '#FFFFFF',
    soft: '#FCE3DA',
    modalTitle: 'University Shortlist & Counseling',
  },
  {
    id: 'prep',
    step: '02',
    kicker: 'Exam ki tayyari',
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
    accent: '#14837E',
    accentFg: '#FFFFFF',
    soft: '#DDF3EF',
    modalTitle: 'AI Test Prep & IELTS Evaluator',
  },
  {
    id: 'finance',
    step: '03',
    kicker: 'Paise ka plan',
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
    accent: '#F2B705',
    accentFg: '#16130F',
    soft: '#FFF1B8',
    modalTitle: 'Scholarships & Education Loans',
  },
  {
    id: 'visa',
    step: '04',
    kicker: 'Visa aur udaan',
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
    accent: '#B8285B',
    accentFg: '#FFFFFF',
    soft: '#FBD9E6',
    modalTitle: 'AI Visa Simulator & Pre-Departure',
  },
];

// Right-hand side of each card: a looping infographic (see ServiceLoops.jsx)
const LOOPS = { shortlist: ShortlistLoop, prep: PrepLoop, finance: FinanceLoop, visa: VisaLoop };

export const Services = () => {
  const navigate = useNavigate();
  const { user, token, openLoginModal } = useAuth();
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
      className="pt-8 sm:pt-12 pb-4 sm:pb-6 bg-[#FFF6E5] relative z-10 w-full max-w-full"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 w-full min-w-0">

        {/* ════════ SECTION HEADER ════════ */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-7 sm:mb-10"
        >
          <StationSign hi="Sab kuch ek jagah" en="EVERYTHING IN ONE PLACE" className="mb-5" />

          <h2 className="font-urbanist font-black text-[32px] sm:text-[42px] lg:text-[50px] text-[#16130F] leading-[1.02] tracking-[-0.04em]">
            From shortlist to visa,{' '}
            <span className="inline-block px-2 -rotate-1 bg-[#F2B705] border-[3px] border-[#16130F] rounded-lg shadow-[3px_3px_0_#16130F]">
              we&apos;ve got you
            </span>
          </h2>

          <p className="text-[15px] sm:text-[16.5px] text-[#3D372F] mt-4 font-medium leading-relaxed max-w-2xl mx-auto">
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
                  // opaque flat colour, so the cards stacked underneath never show through
                  background: service.soft,
                }}
                className="relative lg:sticky lg:top-[var(--stick-top)] [contain:paint] min-h-0 sm:min-h-[480px] flex flex-col justify-center rounded-[22px] sm:rounded-[32px] border-[3px] border-[#16130F] p-4 sm:p-8 lg:p-10 xl:p-12 shadow-[5px_5px_0_#16130F] sm:shadow-[7px_7px_0_#16130F] mb-5 sm:mb-10 lg:mb-14 last:mb-0 overflow-hidden w-full min-w-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center w-full min-w-0">

                  {/* ── LEFT COLUMN ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-6 flex flex-col items-start text-left w-full min-w-0"
                  >
                    {/* Step sticker */}
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] text-[12px] sm:text-[12.5px] font-extrabold tracking-[0.08em] uppercase mb-3 sm:mb-4"
                      style={{ background: service.accent, color: service.accentFg }}
                    >
                      <span className="font-urbanist font-black">{service.step}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{service.badge}</span>
                    </div>

                    {/* Roman-Hinglish kicker over the English headline */}
                    <p className="font-urbanist font-extrabold text-[15px] sm:text-[16px] leading-none text-[#D0362E]">{service.kicker}</p>
                    <h3 className="mt-2 font-urbanist font-black text-[30px] sm:text-[42px] lg:text-[50px] leading-[1.02] tracking-[-0.04em] text-[#16130F]">
                      {service.titleBold}{' '}
                      <span
                        className="inline-block px-2 border-[3px] border-[#16130F] rounded-lg"
                        style={{ background: service.accent, color: service.accentFg }}
                      >
                        {service.titleLight}
                      </span>
                    </h3>
                    <p className="text-[16px] sm:text-[18px] font-bold text-[#16130F] tracking-[-0.01em] mt-3">
                      {service.highlight}
                    </p>

                    {/* Description Paragraph */}
                    <p className="hidden sm:block text-[15px] text-[#3D372F] mt-2 font-medium leading-relaxed max-w-xl">
                      {service.subtitle}
                    </p>

                    {/* Bullets with ink-bordered tick tiles */}
                    <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3 w-full max-w-xl">
                      {service.bullets.map((bullet, bIdx) => (
                        <motion.li
                          key={bIdx}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.45, delay: 0.25 + bIdx * 0.1 }}
                          className="flex items-start gap-2.5 sm:gap-3 text-[14.5px] sm:text-[15.5px] text-[#16130F] font-semibold"
                        >
                          <span
                            className="mt-0.5 w-5 h-5 rounded-md border-2 border-[#16130F] flex items-center justify-center shrink-0"
                            style={{ background: service.accent, color: service.accentFg }}
                          >
                            <Check className="w-3 h-3 stroke-[3.5]" />
                          </span>
                          <span className="leading-snug">{bullet}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => handleAction(service)}
                      className="no-shine mt-5 sm:mt-7 inline-flex items-center gap-2.5 h-11 sm:h-12 px-5 sm:px-6 rounded-full bg-[#16130F] text-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#DE5C2B] text-[14px] sm:text-[15px] font-bold tracking-tight transition-all duration-200 cursor-pointer group"
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
