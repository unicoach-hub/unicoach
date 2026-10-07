import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { useLead } from '../context/LeadContext';

// ── "How UniCoach works": 4 steps, each button opens the tool for that step ──
const storySteps = [
  {
    id: 'counselling',
    stepNumber: '01',
    tabLabel: 'Counselling',
    title: 'Personalized Counselling',
    subtitle: 'Receive one-on-one guidance to build a compelling profile that showcases your academics, achievements, and aspirations, helping you stand out in competitive applications.',
    pillHeader: 'Get expert guidance on',
    pills: [
      'Profile Building',
      'Shortlisting Universities',
      'Application Submission'
    ],
    studentImage: '/images/counselor_student_meeting.webp',
    ctaText: 'Book Free Counselling',
    // No page of its own: opens the free counselling form
    to: null,
  },
  {
    id: 'sop',
    stepNumber: '02',
    tabLabel: 'SOP & Documents',
    title: 'Strong SOPs, LORs & Resumes',
    subtitle: 'Draft your Statement of Purpose with our AI writer, then polish your SOP, LORs and resume with feedback from experts who have been through admissions.',
    pillHeader: 'Expert review on',
    pills: [
      'Statement of Purpose (SOP)',
      'Letters of Recommendation (LOR)',
      'Resume & Essay Polishing'
    ],
    studentImage: '/images/story_step2_sop.webp',
    ctaText: 'Try the AI SOP Writer',
    to: '/ai-tools/sop-generator',
  },
  {
    id: 'finance',
    stepNumber: '03',
    tabLabel: 'Loans & Funding',
    title: 'Education Loans & Scholarships',
    subtitle: 'Compare education loans from banks and NBFCs, with or without collateral, and find scholarships you qualify for. We guide you from the first call to the sanction letter.',
    pillHeader: 'End-to-end support on',
    pills: [
      'Banks & NBFCs Compared',
      'Collateral-Free Options',
      'Scholarship Matching'
    ],
    studentImage: '/images/story_step3_loans.webp',
    ctaText: 'Check Loan Options',
    to: '/education-loan',
  },
  {
    id: 'visa',
    stepNumber: '04',
    tabLabel: 'Visa & Mocks',
    title: 'AI & Human Visa Mock Interviews',
    subtitle: 'Practise real visa interview questions with our AI mock officer and our counsellors, get your documents checked, and sort out housing and forex before you fly.',
    pillHeader: 'Get ready with',
    pills: [
      '1-on-1 Mock Interviews',
      'Document Checks',
      'Forex & Student Housing'
    ],
    studentImage: '/images/story_step4_visa.webp',
    ctaText: 'Practice a Visa Mock',
    to: '/ai-tools/visa-prep',
  },
];

export const PremiumStory = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const { openEligibilityModal } = useLead();

  // Steps only change when the student picks one (no timer, no scroll-wheel hijacking)
  const selectStep = (idx) => {
    if (idx === activeStep) return;
    setDirection(idx > activeStep ? 1 : -1);
    setActiveStep(idx);
  };

  const nextStep = () => {
    setDirection(1);
    setActiveStep((prev) => (prev + 1) % storySteps.length);
  };

  const prevStep = () => {
    setDirection(-1);
    setActiveStep((prev) => (prev - 1 + storySteps.length) % storySteps.length);
  };

  const handleAction = (step) => {
    if (step.to) {
      navigate(step.to);
      return;
    }
    if (openEligibilityModal) {
      openEligibilityModal(`Homepage Steps - ${step.title}`);
    }
  };

  const current = storySteps[activeStep];
  const following = storySteps[(activeStep + 1) % storySteps.length];
  const isLastStep = activeStep === storySteps.length - 1;

  return (
    <section
      id="premium-story"
      className="pt-6 sm:pt-8 pb-6 sm:pb-8 bg-[#FDFCFB] relative z-10 border-t border-slate-100 overflow-hidden w-full max-w-full"
    >
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">

        {/* Section heading */}
        <div className="mb-4 sm:mb-5 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-200/90 text-[11.5px] font-bold text-slate-800 shadow-2xs mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B]" />
            HOW UNICOACH WORKS
          </span>
          <h2 className="font-outfit text-[24px] sm:text-[30px] lg:text-[34px] font-black text-[#111111] leading-tight tracking-tight">
            Your study abroad journey in <span className="text-[#DE5C2B]">4 steps</span>
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 mt-1">
            From choosing a university to your visa interview: pick a step to see how we help.
          </p>
        </div>

        {/* Step tabs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-200/60 w-full min-w-0"
        >
          <div className="flex flex-wrap gap-2 sm:gap-2.5" role="tablist" aria-label="UniCoach steps">
            {storySteps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectStep(idx)}
                  className={`relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-md'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <span className={`relative z-10 text-[11px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 font-bold'}`}>
                    {step.stepNumber}
                  </span>
                  <span className="relative z-10">{step.tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Previous / Next Arrow Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={prevStep}
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#0F172A] shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#0F172A] shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Next step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[300px] w-full min-w-0">

          {/* ════════ LEFT COLUMN: STEP TEXT + ACTION ════════ */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full min-w-0"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-3.5"
              >
                <span className="inline-flex text-[11px] font-black uppercase tracking-wider text-[#DE5C2B]">
                  Step {current.stepNumber} of 04
                </span>

                {/* Title */}
                <h3 className="font-outfit text-[26px] sm:text-[30px] lg:text-[34px] font-bold text-[#0F172A] leading-[1.18] tracking-tight">
                  {current.title}
                </h3>

                {/* Subtitle */}
                <p className="text-[15px] sm:text-[15.5px] text-slate-600 font-normal leading-[1.6] max-w-lg">
                  {current.subtitle}
                </p>

                {/* Action for this step + way to the next one */}
                <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <button
                    type="button"
                    onClick={() => handleAction(current)}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#111111] hover:bg-[#DE5C2B] text-white font-bold text-[14px] shadow-lg shadow-black/10 hover:shadow-orange-500/20 transition-all duration-200 cursor-pointer group"
                  >
                    <span>{current.ctaText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-[#DE5C2B] transition-colors cursor-pointer"
                  >
                    <span>{isLastStep ? 'Back to step 1' : `Next: ${following.tabLabel}`}</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ════════ RIGHT COLUMN: PHOTO + WHAT THIS STEP COVERS ════════ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex items-center justify-center pt-4 sm:pt-0 w-full min-w-0"
          >
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={activeStep}
                custom={direction}
                variants={{
                  enter: (dir) => ({
                    y: dir >= 0 ? 50 : -50,
                    opacity: 0,
                    scale: 0.96,
                  }),
                  center: {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                  exit: (dir) => ({
                    y: dir >= 0 ? -50 : 50,
                    opacity: 0,
                    scale: 0.96,
                    transition: {
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative w-full max-w-[500px]"
              >
                {/* Clean Rounded Image Frame */}
                <div className="relative w-full h-[290px] sm:h-[320px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200/90 bg-slate-100">
                  <img
                    src={current.studentImage}
                    alt={current.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Bottom Integrated Frosted Glass Card */}
                  <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-xl border border-slate-200/90 p-3 sm:p-3.5 rounded-2xl shadow-xl shadow-slate-950/20">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#DE5C2B] flex items-center justify-center font-bold">
                          <Sparkles className="w-3.5 h-3.5 fill-[#DE5C2B]" />
                        </div>
                        <span className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider">
                          {current.pillHeader}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#DE5C2B] bg-orange-50 px-2 py-0.5 rounded">
                        Step {current.stepNumber} of 04
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {current.pills.map((pill) => (
                        <div
                          key={pill}
                          className="bg-slate-50 border border-slate-200/70 rounded-xl px-2 py-1.5 flex items-center justify-center gap-1.5 text-center"
                        >
                          <Check className="w-3.5 h-3.5 text-[#DE5C2B] shrink-0" aria-hidden="true" />
                          <span className="text-[11px] font-bold text-[#0F172A] leading-snug">
                            {pill}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

        </div>

        {/* ════════ BOTTOM HELPER BANNER ════════ */}
        <div className="mt-7 rounded-2xl bg-[#0F172A] text-white px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-[13.5px] sm:text-[14px] font-medium text-slate-200">
              Unsure about courses or universities? Connect 1:1 with an expert today.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleAction({ title: 'Eligibility Consultation', to: null })}
            className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] font-bold text-[13px] shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95"
          >
            Check Eligibility
          </button>
        </div>

      </div>
    </section>
  );
};

export default PremiumStory;
