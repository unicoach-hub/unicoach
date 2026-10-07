import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, ArrowDown, Play, ShieldCheck, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLead } from '../context/LeadContext';
// Preloaded critical LCP asset from public directory for instant discovery
const heroImg = '/image.webp';
import PriorityDmModal from './PriorityDmModal';
import { PillButton } from './ui/PillButton';
import LordIcon from './ui/LordIcon';
import arrowRightIcon from '../assets/lordicons/arrow-right.json';
import sparkleIcon from '../assets/lordicons/sparkle.json';
import { TEAM_MENTORS, TEAM_MENTOR_NAMES } from '../utils/teamMentors';

// Fit groups of the University Shortlister (same colours as its results page)
const SHORTLIST_FITS = [
  { label: 'Safe', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { label: 'Target', className: 'bg-orange-50 text-[#C2410C] border-orange-100' },
  { label: 'Dream', className: 'bg-purple-50 text-purple-700 border-purple-100' },
];

export const Hero = ({ onOpenModal }) => {
  const { openEligibilityModal } = useLead();
  const handleOpen = onOpenModal || (() => openEligibilityModal('Hero Banner'));
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPriorityDmOpen, setIsPriorityDmOpen] = useState(false);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-[540px] lg:h-screen lg:min-h-[520px] lg:max-h-[680px] xl:max-h-[720px] flex flex-col lg:flex-row lg:items-center overflow-hidden bg-[#F8FAFC] pt-16 sm:pt-20 lg:pt-0 pb-10 sm:pb-12 lg:pb-0"
    >

      {/* ── Soft Warm Atmospheric Peach Blush Background on Left ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-[-5%] left-[5%] w-[600px] h-[500px] bg-radial from-[#FFE3D1]/70 via-[#FFF0E5]/40 to-transparent rounded-full blur-[80px] opacity-80"
        />
        <div className="absolute top-[10%] left-[30%] w-[400px] h-[350px] bg-radial from-[#FFEDDF]/50 via-[#FFF5ED]/40 to-transparent rounded-full blur-[70px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[400px] bg-radial from-[#FFE3D1]/60 via-[#FFF0E5]/30 to-transparent rounded-full blur-[90px]" />
      </div>

      {/* ── Full-Bleed Right-Side Hero Scene (Zoomed Out Proportions Matching 2nd Image) ── */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 right-0 w-[56%] xl:w-[52%] 2xl:w-[50%] h-full z-0 overflow-hidden pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 5%, black 12%, black 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 5%, black 12%, black 100%)',
        }}
      >
        <img
          src={heroImg}
          alt="Student looking through airplane window"
          className="w-full h-full object-cover object-[15%_center]"
          fetchPriority="high"
          decoding="async"
          width="1200"
          height="925"
        />
      </div>

      {/* ── White Dot Matrix Grid Pattern on Lower-Right Dark Cabin Area ── */}
      {/* <div
        className="hidden lg:block absolute top-[34%] bottom-4 right-0 w-[180px] xl:w-[220px] pointer-events-none z-10"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 1.5px, transparent 1.5px)',
          backgroundSize: '18px 18px',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)',
        }}
      /> */}

      {/* ════════════════ FLOATING OVERLAY CARDS (Framer Motion & Parallax Physics) ════════════════ */}

      {/* ── Card 1: University Shortlister ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          transform: `translate3d(${mousePos.x * -18}px, ${mousePos.y * -18}px, 0)`,
        }}
        className="hidden lg:block absolute top-[14%] xl:top-[16%] right-4 sm:right-8 xl:right-12 z-30 transition-transform duration-200 ease-out"
      >
        <Link
          to="/universities"
          className="group block bg-white rounded-[20px] p-3.5 sm:p-4 border border-slate-200 hover:border-orange-200 shadow-[0_10px_28px_-12px_rgba(15,23,42,0.22)] hover:shadow-[0_16px_36px_-12px_rgba(15,23,42,0.28)] w-[165px] sm:w-[185px] cursor-pointer overflow-hidden relative transition-all duration-200 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-extrabold text-black block leading-tight">
              Shortlist
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[8.5px] font-black uppercase tracking-wider">
              Free
            </span>
          </div>

          <div className="font-urbanist text-[26px] sm:text-[30px] font-black text-black leading-none mt-1.5 tracking-tight">
            1,500+
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[9.5px] text-slate-500 font-medium">
              Universities to match
            </span>
            <span className="text-[9.5px] font-extrabold text-[#DE5C2B] group-hover:underline flex items-center gap-0.5">
              Start &rarr;
            </span>
          </div>

          {/* The three groups the shortlister sorts universities into */}
          <div className="mt-2.5 flex items-center gap-1">
            {SHORTLIST_FITS.map((fit) => (
              <span
                key={fit.label}
                className={`flex-1 text-center py-1 rounded-md border text-[8.5px] font-black uppercase tracking-wide ${fit.className}`}
              >
                {fit.label}
              </span>
            ))}
          </div>
        </Link>
      </motion.div>

      {/* ── Card 2: Mentors (opens the mentor directory on /unicoach) ── */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 24}px, 0)`,
        }}
        className="hidden lg:block absolute top-[22%] xl:top-[24%] left-[44%] xl:left-[46%] 2xl:left-[48%] z-30 transition-transform duration-200 ease-out"
      >
        <Link
          to="/unicoach#mentors-grid"
          className="group block w-[215px] sm:w-[235px] p-4 sm:p-4.5 rounded-[22px] bg-white border border-slate-200 hover:border-orange-200 shadow-[0_10px_28px_-12px_rgba(15,23,42,0.22)] hover:shadow-[0_16px_36px_-12px_rgba(15,23,42,0.28)] transition-all duration-200 hover:-translate-y-1 overflow-hidden relative cursor-pointer"
        >
          {/* Top Row: Title + Pill Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="font-urbanist text-[26px] sm:text-[29px] font-black leading-none tracking-tight text-black">
              Mentors
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Experts
            </span>
          </div>

          {/* Sub-label with clickable text */}
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] font-semibold text-slate-600">
              Seniors who&apos;ve done it
            </span>
            <span className="text-[10px] font-extrabold text-[#DE5C2B] group-hover:underline flex items-center gap-0.5">
              Meet &rarr;
            </span>
          </div>

          {/* The mentors themselves */}
          <div className="flex items-center mt-3 min-w-0">
            <div className="flex -space-x-2 shrink-0">
              {TEAM_MENTORS.map((mentor) => (
                <img
                  key={mentor.src}
                  className="w-7 h-7 rounded-full ring-2 ring-white object-cover bg-slate-100"
                  src={mentor.src}
                  alt=""
                  width="28"
                  height="28"
                  loading="lazy"
                />
              ))}
            </div>
            <span className="text-[10.5px] font-bold text-slate-700 ml-2 truncate">
              {TEAM_MENTOR_NAMES}
            </span>
          </div>
        </Link>
      </motion.div>

      {/* ── Card 3: 12K+ Students (opens the Priority DM / query page) ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={{
          transform: `translate3d(${mousePos.x * -14}px, ${mousePos.y * -14}px, 0)`,
        }}
        className="hidden lg:block absolute top-[74%] xl:top-[75%] right-4 sm:right-8 xl:right-12 z-30 transition-transform duration-200 ease-out"
      >
        <Link
          to="/priority-dm"
          className="group block w-[215px] sm:w-[235px] p-4 sm:p-4.5 rounded-[22px] bg-white border border-slate-200 hover:border-orange-200 shadow-[0_10px_28px_-12px_rgba(15,23,42,0.22)] hover:shadow-[0_16px_36px_-12px_rgba(15,23,42,0.28)] cursor-pointer overflow-hidden relative transition-all duration-200 hover:-translate-y-1"
        >
          {/* Main Stat + Pill */}
          <div className="flex items-center justify-between">
            <div className="font-urbanist text-[28px] sm:text-[32px] font-black text-black leading-none tracking-tight">
              12K+
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Free
            </span>
          </div>

          {/* Sub-label with clickable text */}
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] font-semibold text-slate-600">
              Students Counselled
            </span>
            <span className="text-[10px] font-extrabold text-[#DE5C2B] group-hover:underline flex items-center gap-0.5">
              Ask a query &rarr;
            </span>
          </div>

          {/* What happens when you ask */}
          <div className="flex items-center gap-2 mt-3">
            <span className="w-7 h-7 rounded-full bg-orange-50 border border-orange-100 text-[#DE5C2B] flex items-center justify-center shrink-0">
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span className="text-[10.5px] font-bold text-slate-700 leading-tight">
              Get a personal reply from our counsellors
            </span>
          </div>
        </Link>
      </motion.div>

      {/* ── Mobile Frameless Full-Bleed Hero Scene (Edge-to-Edge, Zero Frame/Borders, Seamless Bottom Fade) ── */}
      <div
        className="lg:hidden relative w-full h-[240px] sm:h-[280px] min-h-[240px] sm:min-h-[280px] aspect-[16/10] overflow-hidden shrink-0 pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, rgba(0,0,0,0.5) 80%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 55%, rgba(0,0,0,0.5) 80%, transparent 100%)',
        }}
      >
        <img
          src={heroImg}
          alt="Student looking through airplane window"
          className="w-full h-full object-cover object-[20%_center] block"
          fetchPriority="high"
          decoding="async"
          width="700"
          height="450"
        />

        {/* Soft gradient blend into #F8FAFC page background */}
        <div
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #F8FAFC 0%, rgba(248, 250, 252, 0.9) 35%, transparent 100%)',
          }}
        />
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10 -mt-8 sm:-mt-10 lg:mt-0 pt-0 lg:pt-16 pb-4 overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-0 items-center">

          {/* ════════════════ LEFT COLUMN: TYPOGRAPHY & BLUSH ════════════════ */}
          <div className="lg:col-span-5 xl:col-span-5 z-20 relative pr-0 lg:pr-4">

            {/* Localized soft glow behind the text */}
            <div className="absolute -top-10 left-0 w-full h-[120%] bg-gradient-to-br from-orange-100/30 via-amber-50/20 to-transparent rounded-3xl blur-2xl pointer-events-none -z-10" />

            {/* ── Flying Airplane with Smooth Curved Contrail (Hidden on mobile to prevent text clash) ── */}
            <motion.div
              animate={{
                x: [0, 8, 0],
                y: [0, -6, 0],
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="hidden sm:block absolute -top-3 sm:-top-4 right-4 sm:right-10 lg:right-[-10px] xl:right-0 w-[130px] sm:w-[140px] h-[90px] pointer-events-none z-30"
            >
              <svg className="w-full h-full overflow-visible" viewBox="0 0 140 90" fill="none">
                <path
                  d="M 12 70 C 32 66, 52 56, 68 40"
                  stroke="#DE5C2B"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  opacity="0.6"
                  strokeDasharray="3 3"
                  fill="none"
                />

                <g transform="translate(68, 40) rotate(38) scale(0.95)">
                  <path
                    d="M 0 -12 
                       C 0.8 -12, 1.4 -10, 1.4 -6 
                       L 1.4 -2 
                       L 12 5 
                       L 12 7.2 
                       L 1.4 4.2 
                       L 1.4 11 
                       L 5.5 14 
                       L 5.5 15.5 
                       L 0 14.5 
                       L -5.5 15.5 
                       L -5.5 14 
                       L -1.4 11 
                       L -1.4 4.2 
                       L -12 7.2 
                       L -12 5 
                       L -1.4 -2 
                       L -1.4 -6 
                       C -1.4 -10, -0.8 -12, 0 -12 Z"
                    fill="#DE5C2B"
                  />
                </g>
              </svg>
            </motion.div>

            {/* ── Eyebrow Pill matching Image 1 ── */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-orange-200/90 shadow-2xs mb-5"
            >
              <span className="w-2 h-2 rounded-full bg-[#DE5C2B]" />
              <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-800 tracking-tight">
                The #1 Study Abroad &amp; Senior Mentorship Platform
              </span>
            </motion.div>

            {/* ── Main Headline matching Image 1 Typography & Peach Underline ── */}
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-outfit text-4xl sm:text-5xl lg:text-[54px] xl:text-[62px] font-black leading-[1.08] tracking-[-0.035em] text-[#111111] mb-5"
            >
              Your Global Future <br />
              <span className="relative inline-block">
                Starts Here
                <span className="absolute -bottom-1 left-0 w-full h-[7px] bg-[#FED7CE] rounded-full -z-10" />
              </span>
            </motion.h1>

            {/* ── Subtitle matching Image 1 measure, line-height & font weight ── */}
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-[15px] sm:text-[16.5px] text-slate-600 leading-[1.65] max-w-[480px] mb-8 font-normal"
            >
              Achieve top test scores, secure admissions &amp; high-value scholarships at world-class universities, and connect 1:1 with seniors who&apos;ve actually done it.
            </motion.p>

            {/* ── CTA Buttons matching Image 1 Pixel Perfection ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 mb-7"
            >
              {/* Primary Black Pill with White Circle Arrow - matching 'Start My Page ->' */}
              <button
                type="button"
                onClick={handleOpen}
                className="group inline-flex items-center gap-3.5 bg-[#111111] hover:bg-black text-white pl-6 sm:pl-7 pr-3 sm:pr-3.5 py-3 sm:py-3.5 rounded-full font-bold text-[14.5px] sm:text-[15px] shadow-[0_10px_24px_-4px_rgba(0,0,0,0.28)] hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>Book Free Counselling</span>
                <span className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-white text-black flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[2.5]" />
                </span>
              </button>

              {/* Secondary White Pill with Orange Border & Down Arrow - goes to Priority DM page */}
              <Link
                to="/priority-dm"
                data-lordicon-group
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white hover:bg-orange-50/50 text-slate-900 text-[14.5px] sm:text-[15px] font-bold border border-orange-200/90 shadow-2xs hover:border-[#DE5C2B] hover:text-[#DE5C2B] hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>Send Priority DM</span>
                <LordIcon icon={arrowRightIcon} trigger="group-hover" size={18} />
              </Link>
            </motion.div>

            {/* ── Sleek Glassmorphic Trust Pills ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-2 sm:gap-2.5 max-w-[480px]"
            >
              {/* Pill 1 */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-orange-200/80 shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse shrink-0" />
                <span className="text-[12px] font-bold text-slate-800 tracking-tight">
                  100% Free Guidance
                </span>
              </div>

              {/* Pill 2 */}
              <div
                data-lordicon-group
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-orange-200/80 shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <LordIcon icon={sparkleIcon} trigger="group-hover" size={16} />
                <span className="text-[12px] font-bold text-slate-800 tracking-tight">
                  ₹24Cr+ Scholarships
                </span>
              </div>

              {/* Pill 3 */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-orange-200/80 shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[12px] font-bold text-slate-800 tracking-tight">
                  98.7% Visa Success
                </span>
              </div>
            </motion.div>

            {/* ── Priority DM Modal Instance (Uses createPortal to body z-[999999]) ── */}
            <PriorityDmModal
              isOpen={isPriorityDmOpen}
              onClose={() => setIsPriorityDmOpen(false)}
            />

          </div>

          {/* ════════════════ RIGHT COLUMN: DESKTOP SCROLL PILL ════════════════ */}
          <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 relative h-[500px] flex-row items-end justify-start">

            {/* ── Scroll to Explore pill ── */}
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 cursor-pointer hover:border-orange-300 transition-colors ml-4 xl:ml-8 mb-2"
            >
              <div className="w-4 h-4 rounded-full bg-[#DE5C2B] text-white flex items-center justify-center">
                <Play className="w-1.5 h-1.5 fill-current rotate-90 ml-0.5" />
              </div>
              <span className="text-[9.5px] font-semibold text-slate-700 uppercase tracking-wider">
                Scroll to explore
              </span>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;