import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Send, Search, Calendar, FileText, Plane, Trophy, Sparkles, ArrowRight, ChevronRight, Check } from 'lucide-react';
import { useLead } from '../context/LeadContext';

// ── Milestone 01: EVALUATE (Admission & ROI Fit Calculator) ──
const EvaluateIcon = ({ isHovered, isHighlighted }) => {
  const [fitScore, setFitScore] = useState(88);

  useEffect(() => {
    let interval;
    if (isHovered) {
      interval = setInterval(() => {
        setFitScore((prev) => (prev >= 98 ? 88 : prev + 3));
      }, 250);
    } else {
      setFitScore(88);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {!isHovered ? (
        <motion.div whileHover={{ scale: 1.1 }}>
          <Calculator className="w-4 h-4" strokeWidth={2.4} />
        </motion.div>
      ) : (
        /* Live Dynamic Match Score Counter */
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center select-none"
        >
          <span className="font-mono text-[9.5px] font-black leading-none text-white tracking-tighter">
            {fitScore}%
          </span>
          <span className="text-[7px] uppercase font-bold text-amber-200 leading-none mt-0.5 tracking-wider">
            FIT
          </span>
        </motion.div>
      )}

      {isHovered && (
        <span className="absolute inset-0 rounded-full border border-amber-300/80 animate-ping opacity-40 pointer-events-none" />
      )}
    </div>
  );
};
const DreamIcon = EvaluateIcon;

// ── Milestone 02: DISCOVER (Realistic Searching & Pinpoint Radar) ──
const DiscoverIcon = ({ isHovered, isHighlighted }) => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
    {/* Animated Map Grid Background when searching */}
    {isHovered && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        className="absolute inset-1 border border-dashed border-white/60 rounded-full"
      />
    )}

    {/* University Discovery Pins popping up as search sweeps */}
    {isHovered && (
      <>
        <motion.span
          animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: 0.1 }}
          className="absolute top-2 left-2.5 w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a]"
        />
        <motion.span
          animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: 0.45 }}
          className="absolute bottom-2.5 right-2 w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_6px_#fef08a]"
        />
      </>
    )}

    {/* Magnifying Glass with Realistic Searching Arc */}
    <motion.div
      animate={isHovered ? {
        x: [-3, 3, -2, 2, 0],
        y: [-3, 2, 3, -1, 0],
        rotate: [0, 22, -18, 12, 0],
        scale: [1, 1.15, 1.08],
      } : {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
      }}
      transition={isHovered ? {
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
      } : { type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Search className="w-4 h-4" strokeWidth={2.5} />
    </motion.div>

    {/* Radar Scan Light Wave */}
    {isHovered && (
      <span className="absolute inset-0 rounded-full border-2 border-amber-300/80 animate-ping opacity-50" />
    )}
  </div>
);

// ── Milestone 03: SCHOLARSHIPS (Live Cutoff Clocks & Grants) ──
const ScholarshipIcon = ({ isHovered, isHighlighted }) => {
  const [days, setDays] = useState(45);

  useEffect(() => {
    let interval;
    if (isHovered) {
      interval = setInterval(() => {
        setDays((prev) => (prev <= 5 ? 45 : prev - 10));
      }, 350);
    } else {
      setDays(45);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {!isHovered ? (
        <motion.div whileHover={{ scale: 1.1 }}>
          <Calendar className="w-4 h-4" strokeWidth={2.4} />
        </motion.div>
      ) : (
        /* Live Dynamic Countdown Display */
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center select-none"
        >
          <span className="font-mono text-[9.5px] font-black leading-none text-white tracking-tighter">
            {days}d
          </span>
          <span className="text-[7px] uppercase font-bold text-amber-200 leading-none mt-0.5 tracking-wider">
            CLOCK
          </span>
        </motion.div>
      )}

      {/* Clockwise rotating progress indicator when hovered */}
      {isHovered && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          className="absolute inset-0.5 rounded-full border-t-2 border-r-2 border-white/90 pointer-events-none"
        />
      )}
    </div>
  );
};
const PlanIcon = ScholarshipIcon;

// ── Milestone 04: APPLY (Real Laser Document Scanning & Checkmarks) ──
const ApplyIcon = ({ isHovered, isHighlighted }) => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
    {/* Base Document Outline */}
    <div className="relative">
      <FileText className="w-4 h-4" strokeWidth={2.4} />

      {/* Scanning Laser Beam that moves across document */}
      {isHovered && (
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
          className="absolute -left-1 -right-1 h-[2px] bg-emerald-300 shadow-[0_0_8px_#6ee7b7]"
        />
      )}
    </div>

    {/* Verification Badge popped after scanning */}
    {isHovered && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center shadow-xs"
      >
        <Check size={8} strokeWidth={3} className="text-white" />
      </motion.div>
    )}
  </div>
);

// ── Milestone 05: FLY (Live Flight Trajectory with Passing Clouds) ──
const FlyIcon = ({ isHovered, isHighlighted }) => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
    {/* Passing Drift Clouds in sky */}
    {isHovered && (
      <>
        <motion.div
          animate={{ x: [24, -24] }}
          transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
          className="absolute top-2 w-3.5 h-1 bg-white/70 rounded-full blur-[0.5px]"
        />
        <motion.div
          animate={{ x: [20, -26] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0.3, ease: 'linear' }}
          className="absolute bottom-2.5 w-4 h-1.5 bg-white/60 rounded-full blur-[0.5px]"
        />
      </>
    )}

    {/* Banking Jet Aircraft */}
    <motion.div
      animate={isHovered ? {
        x: [0, 2, -1, 3],
        y: [0, -3, 1, -4],
        rotate: [0, 24, 16, 28],
        scale: [1, 1.15, 1.1],
      } : {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
      }}
      transition={isHovered ? {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      } : { type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Plane className="w-4 h-4" strokeWidth={2.4} />
    </motion.div>

    {/* Jet Vapor Contrail behind engines */}
    {isHovered && (
      <motion.span
        animate={{ scaleX: [0.6, 1.4, 0.6], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 0.4 }}
        className="absolute -bottom-0.5 -left-1 w-3 h-1 bg-white/90 rounded-full blur-[0.5px]"
      />
    )}
  </div>
);

// ── Milestone 06: THRIVE (Achievement Confetti & Golden Trophy Burst) ──
const ThriveIcon = ({ isHovered, isHighlighted }) => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
    {/* Trophy with celebratory victory lift */}
    <motion.div
      animate={isHovered ? {
        y: [-1, -4, -2],
        scale: [1, 1.2, 1.12],
        rotate: [0, -8, 8, 0],
      } : {
        y: 0,
        scale: 1,
        rotate: 0,
      }}
      transition={isHovered ? {
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      } : { type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Trophy className="w-4 h-4" strokeWidth={2.4} />
    </motion.div>

    {/* Exploding Colorful Confetti Bits */}
    {isHovered && (
      <>
        {/* Top-right golden star */}
        <motion.div
          animate={{ x: [0, 8], y: [0, -9], scale: [0, 1.3, 0], opacity: [1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.7, ease: 'easeOut' }}
          className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-[0_0_6px_#fde047]"
        />
        {/* Top-left emerald confetti */}
        <motion.div
          animate={{ x: [0, -8], y: [0, -8], scale: [0, 1.2, 0], opacity: [1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="absolute w-1.5 h-1.5 bg-emerald-300 rounded-sm"
        />
        {/* Bottom-right orange spark */}
        <motion.div
          animate={{ x: [0, 7], y: [0, 7], scale: [0, 1.1, 0], opacity: [1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.65, delay: 0.2, ease: 'easeOut' }}
          className="absolute w-1.5 h-1.5 bg-orange-300 rounded-full"
        />
        {/* Spinning Golden Sparkle */}
        <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-200 animate-spin" style={{ animationDuration: '2.5s' }} />
      </>
    )}
  </div>
);

export const Journey = () => {
  const navigate = useNavigate();
  const { openEligibilityModal } = useLead();
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      num: '01',
      title: 'EVALUATE',
      desc: 'Predict admission & ROI fit',
      badge: 'AI Acceptance Fit',
      cta: 'Check Fit',
      iconComponent: EvaluateIcon,
      actionType: 'link',
      actionPayload: '/eligibility-calculator',
    },
    {
      num: '02',
      title: 'SHORTLIST',
      desc: 'Filter 1,500+ global unis',
      badge: '1,500+ Global Unis',
      cta: 'Explore Unis',
      iconComponent: DiscoverIcon,
      actionType: 'link',
      actionPayload: '/universities',
    },
    {
      num: '03',
      title: 'SCHOLARSHIPS',
      desc: 'Live ₹24Cr+ cutoff clocks',
      badge: '₹24Cr+ Funding Clocks',
      cta: 'Track Grants',
      iconComponent: ScholarshipIcon,
      actionType: 'link',
      actionPayload: '/scholarships',
    },
    {
      num: '04',
      title: 'AI SOP',
      desc: 'Ivy-grade tailored essays',
      badge: 'Ivy-Caliber SOP Writer',
      cta: 'Draft SOP',
      iconComponent: ApplyIcon,
      actionType: 'link',
      actionPayload: '/ai-tools/sop-generator',
    },
    {
      num: '05',
      title: 'VISA PREP',
      desc: 'Consular VO mock simulator',
      badge: '98.7% Visa Approval',
      cta: 'Practice VO',
      iconComponent: FlyIcon,
      actionType: 'link',
      actionPayload: '/ai-tools/visa-prep',
    },
    {
      num: '06',
      title: '1:1 MENTORS',
      desc: 'Top admits & campus guides',
      badge: '500+ Verified Mentors',
      cta: 'Book Mentor',
      iconComponent: ThriveIcon,
      actionType: 'link',
      actionPayload: '/unicoach',
    },
  ];

  const currentActive = hoveredStep !== null ? hoveredStep : activeStep;

  const handleStepClick = (step, idx) => {
    setActiveStep(idx);
    if (step.actionType === 'modal') {
      if (openEligibilityModal) {
        openEligibilityModal(`Journey Milestone - ${step.title}: ${step.actionPayload}`);
      }
    } else if (step.actionType === 'link') {
      // Reset scroll to top, then navigate (the top progress bar shows itself only if the page is slow)
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      navigate(step.actionPayload);
    }
  };

  return (
    <section 
      id="journey-roadmap"
      className="relative z-30 -mt-6 sm:-mt-8 lg:-mt-12 mb-3 sm:mb-4 lg:mb-5 w-full max-w-full"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 w-full min-w-0">
        
        {/* ── Light Warm Cream & White Capsule Bar ── */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[24px] sm:rounded-[28px] bg-white/95 backdrop-blur-xl border border-orange-200/90 shadow-[0_20px_48px_-10px_rgba(222,92,43,0.1),0_4px_16px_-2px_rgba(15,23,42,0.04)] px-4 py-4 sm:px-6 sm:py-5 lg:py-5 lg:px-8 transition-all duration-300 w-full min-w-0 overflow-visible"
        >
          {/* Top Delicate Terracotta Edge Highlight with Subtle Shimmer */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#DE5C2B]/60 to-transparent pointer-events-none" />

          {/* Subtle Warm Atmospheric Glows inside card */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[24px] sm:rounded-[28px]">
            <div className="absolute -top-12 -right-12 w-64 h-32 bg-[#FFE3D1]/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-64 h-32 bg-[#FED7CE]/20 rounded-full blur-2xl" />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8 relative z-10 w-full min-w-0">
            
            {/* ════════ LEFT SECTION: Heading + Live Interactive Indicator ════════ */}
            <div className="w-full lg:w-[220px] shrink-0 border-b border-orange-100/90 pb-3 lg:pb-0 lg:border-b-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100/80 border border-orange-200/70 text-[#DE5C2B] text-[10px] font-bold uppercase tracking-wider mb-1.5 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DE5C2B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DE5C2B]" />
                </span>
                Step-by-Step Guidance
              </div>
              <h2 className="font-outfit text-[18px] sm:text-[19px] font-black text-[#111111] leading-[1.2] tracking-tight">
                Your Journey <br className="hidden sm:inline lg:inline" />
                <span className="text-[#DE5C2B] relative inline-block">
                  Abroad, Simplified.
                  <svg className="absolute -bottom-1 left-0 w-full h-1 text-[#DE5C2B]/35" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M0,5 Q50,0 100,5" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  </svg>
                </span>
              </h2>
              <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">
                6 milestones to your dream admit
              </span>
            </div>

            {/* ════════ RIGHT SECTION: 6 Interactive Horizontal Steps ════════ */}
            <div className="flex-1 w-full min-w-0 relative">

              {/* ── Background Dotted Flight Line (Desktop) ── */}
              <div className="hidden lg:block absolute top-[28px] left-[32px] right-[32px] h-[2px] pointer-events-none -z-0">
                {/* Gray Base Dotted Track */}
                <div className="w-full h-full border-b-2 border-dashed border-orange-200/80" />
                
                {/* Active Dynamic Glowing Track that stretches to current hovered milestone */}
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#DE5C2B] via-orange-400 to-[#DE5C2B] rounded-full shadow-[0_0_8px_rgba(222,92,43,0.6)]"
                  animate={{
                    width: `${(currentActive / (steps.length - 1)) * 100}%`
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />

                {/* Flying Mini Glider at the head of the progress beam */}
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#DE5C2B] shadow-md shadow-orange-500/30 flex items-center justify-center pointer-events-none"
                  animate={{
                    left: `${(currentActive / (steps.length - 1)) * 100}%`,
                    rotate: [0, 8, -8, 0]
                  }}
                  transition={{ 
                    left: { type: 'spring', stiffness: 350, damping: 28 },
                    rotate: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B] animate-ping" />
                </motion.div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-0 w-full min-w-0 relative z-10">
                {steps.map((step, idx) => {
                  const IconComponent = step.iconComponent;
                  const isHovered = hoveredStep === idx;
                  const isHighlighted = currentActive === idx;

                  return (
                    <React.Fragment key={step.num}>
                      {/* Step Item with Spring Micro-interaction */}
                      <Link
                        to={step.actionType === 'link' ? step.actionPayload : '#'}
                        onClick={(e) => {
                          if (step.actionType === 'link') {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                          }
                          e.preventDefault();
                          handleStepClick(step, idx);
                        }}
                        onMouseEnter={() => setHoveredStep(idx)}
                        onMouseLeave={() => setHoveredStep(null)}
                        className="no-underline text-inherit block outline-none"
                      >
                        <motion.div
                          whileHover={{ y: -6 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                          className="relative flex flex-col items-start cursor-pointer group py-2.5 px-3 sm:px-3.5 lg:px-3 rounded-2xl select-none"
                        >
                        {/* ── Fluid Sliding Magnetic Spotlight Pill (Traversing from step to step) ── */}
                        {isHighlighted && (
                          <motion.div 
                            layoutId="journeyHoverSpotlight"
                            className="absolute inset-0 bg-gradient-to-b from-orange-50/95 via-amber-50/40 to-white/90 rounded-2xl border border-orange-200/90 shadow-[0_12px_24px_-6px_rgba(222,92,43,0.16)] -z-10"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}

                        {/* ── Floating Micro-Tooltip Chip with Live Pointer (Desktop) ── */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.88 }}
                              animate={{ opacity: 1, y: -10, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.92 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                              className="hidden lg:flex absolute -top-8 left-1/2 -translate-x-1/2 items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] text-white text-[10.5px] font-bold shadow-xl shadow-black/20 z-40 whitespace-nowrap pointer-events-none"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B] animate-pulse" />
                              <span className="text-[#DE5C2B] font-extrabold font-mono">0{idx + 1}</span>
                              <span className="font-outfit">{step.badge}</span>
                              <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                              >
                                <ChevronRight size={11} className="text-orange-400" />
                              </motion.div>
                              {/* Bottom Mini Triangle Pointer */}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#111111] rotate-45" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Top Accent Flare */}
                        {isHighlighted && (
                          <motion.div 
                            layoutId="activeMilestoneFlare"
                            className="hidden lg:block absolute -top-[21px] left-3 w-8 h-[3px] bg-[#DE5C2B] rounded-full shadow-[0_0_12px_#DE5C2B]" 
                          />
                        )}

                        {/* Icon Container with Dedicated Interactive Animations */}
                        <div className="mb-2 relative">
                          <div
                            className={`w-[42px] h-[42px] sm:w-[44px] sm:h-[44px] rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                              isHighlighted
                                ? 'bg-gradient-to-tr from-[#DE5C2B] via-[#E76C3E] to-[#F17A4D] text-white shadow-md shadow-orange-500/35 ring-4 ring-orange-200/90'
                                : 'bg-white border-2 border-orange-200/80 text-[#DE5C2B] group-hover:bg-[#DE5C2B] group-hover:text-white group-hover:border-[#DE5C2B] shadow-2xs'
                            }`}
                          >
                            <IconComponent isHovered={isHovered} isHighlighted={isHighlighted} />
                          </div>

                          {/* Pulsing Light Aura behind active icon */}
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1.35 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                className="absolute inset-0 bg-[#DE5C2B]/25 rounded-full blur-md -z-0 pointer-events-none"
                              />
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Step Number + Animated Pill */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] sm:text-[11px] font-mono font-black leading-none block transition-colors duration-200 ${
                            isHighlighted ? 'text-[#DE5C2B]' : 'text-slate-400'
                          }`}>
                            {step.num}
                          </span>
                          <motion.span 
                            animate={isHighlighted ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                              isHighlighted ? 'bg-[#DE5C2B] shadow-[0_0_6px_#DE5C2B]' : 'bg-slate-300'
                            }`} 
                          />
                        </div>

                        {/* Step Title + Interactive Sliding Arrow */}
                        <div className="flex items-center gap-1 w-full">
                          <h3 className={`font-outfit text-[12px] sm:text-[12.5px] font-black uppercase tracking-wider leading-tight transition-colors duration-200 truncate ${
                            isHighlighted ? 'text-[#DE5C2B]' : 'text-[#111111] group-hover:text-[#DE5C2B]'
                          }`}>
                            {step.title}
                          </h3>
                          <motion.div
                            animate={isHovered ? { x: [0, 4, 0] } : { x: 0 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                          >
                            <ArrowRight 
                              size={11} 
                              className={`text-[#DE5C2B] transition-opacity duration-200 ${
                                isHovered ? 'opacity-100' : 'opacity-0'
                              }`} 
                            />
                          </motion.div>
                        </div>

                        {/* Step Description */}
                        <p className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium leading-[1.3] mt-1 max-w-[115px] line-clamp-2 group-hover:text-slate-700 transition-colors">
                          {step.desc}
                        </p>

                        {/* Mobile Action Pill */}
                        <div className="mt-1.5 flex sm:hidden items-center gap-1 text-[9px] font-bold text-[#DE5C2B]">
                          <span>{step.cta}</span>
                          <ChevronRight size={10} />
                        </div>

                        {/* Bottom Terracotta Flare on Active/Hover (Desktop Only) */}
                        {isHighlighted && (
                          <div className="hidden lg:block absolute -bottom-[21px] left-3 w-8 h-[3px] bg-[#DE5C2B] rounded-full shadow-[0_0_10px_#DE5C2B]" />
                        )}
                      </motion.div>
                    </Link>

                      {/* Animated Progression Arrow Separator between steps */}
                      {idx < steps.length - 1 && (
                        <div className="hidden xl:flex items-center justify-center px-1 select-none text-slate-300 relative">
                          <div className="relative flex items-center justify-center w-5">
                            <motion.div
                              animate={currentActive > idx ? {
                                x: [0, 2, 0],
                              } : {}}
                              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                            >
                              <ChevronRight 
                                size={15} 
                                className={`transition-all duration-300 ${
                                  currentActive > idx 
                                    ? 'text-[#DE5C2B] scale-110 drop-shadow-xs' 
                                    : 'text-orange-200/90'
                                }`} 
                                strokeWidth={2.6} 
                              />
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default Journey;
