import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLead } from '../../context/LeadContext';
// Preloaded critical LCP asset from public directory for instant discovery
const heroImg = '/image.webp';
import PriorityDmModal from '../PriorityDmModal';
import { MiniSearchDemo, MiniChatDemo } from '../HeroMiniDemos';
import { TEAM_MENTORS, TEAM_MENTOR_NAMES, mentorLook } from '../../utils/teamMentors';

// Trust stats (same figures as before), one poster colour each
const HERO_STATS = [
  { value: '100%', label: 'Free guidance', bg: '#F2B705', fg: '#16130F' },
  { value: '₹24Cr+', label: 'Scholarships', bg: '#14837E', fg: '#FFFFFF' },
  { value: '98.7%', label: 'Visa success', bg: '#B8285B', fg: '#FFFFFF' },
];

export const Hero = ({ onOpenModal }) => {
  const { openEligibilityModal } = useLead();
  const handleOpen = onOpenModal || (() => openEligibilityModal('Hero Banner'));
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPriorityDmOpen, setIsPriorityDmOpen] = useState(false);
  const [hoverCard, setHoverCard] = useState(null);

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
      className="relative min-h-[540px] lg:h-screen lg:min-h-[520px] lg:max-h-[680px] xl:max-h-[720px] flex flex-col lg:flex-row lg:items-center overflow-hidden bg-[#FFF6E5] pt-16 sm:pt-20 lg:pt-0 pb-10 sm:pb-12 lg:pb-0"
    >

      {/* ── Desi Pop halftone dots on the cream page ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle,rgba(22,19,15,.07)_1.3px,transparent_1.7px)] [background-size:12px_12px]" />

      {/* ── Full-Bleed Right-Side Hero Scene (Zoomed Out Proportions Matching 2nd Image) ── */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 right-0 w-[56%] xl:w-[52%] 2xl:w-[50%] h-full z-0 overflow-hidden pointer-events-none"
        // the photo melts into the cream on its left edge and at the bottom, so the hero reads as one scene
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 6%, black 16%, black 100%), linear-gradient(to bottom, black 82%, transparent 100%)',
          WebkitMaskComposite: 'source-in',
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 6%, black 16%, black 100%), linear-gradient(to bottom, black 82%, transparent 100%)',
          maskComposite: 'intersect',
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

      {/* ── Card 1: Search Programs (auto-typing preview) ── */}
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
          to="/search-programs"
          onMouseEnter={() => setHoverCard('search')}
          onMouseLeave={() => setHoverCard(null)}
          className="group block bg-white border-2 border-[#16130F] rounded-[14px] shadow-[3px_3px_0_#16130F] hover:shadow-[4px_4px_0_#16130F] cursor-pointer overflow-hidden relative transition-all duration-200 hover:-translate-y-1 p-3.5 w-[215px] xl:w-[225px]"
        >
          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-[#16130F]/30">
            <div className="min-w-0">
              <p className="font-urbanist font-extrabold text-[12px] leading-none text-[#D0362E]">Course dhoondho</p>
              <p className="mt-1 font-urbanist text-[14px] font-black text-[#16130F] leading-tight">Search programs</p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#F2B705] text-[#16130F] border-[1.5px] border-[#16130F] text-[11px] font-black group-hover:-translate-y-0.5 transition-transform">Try &rarr;</span>
          </div>
          <MiniSearchDemo paused={hoverCard === 'search'} />
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
          className="group block bg-white border-2 border-[#16130F] rounded-[14px] shadow-[3px_3px_0_#16130F] hover:shadow-[4px_4px_0_#16130F] cursor-pointer overflow-hidden relative transition-all duration-200 hover:-translate-y-1 w-[210px] xl:w-[220px] px-3.5 py-3"
        >
          <p className="font-urbanist font-extrabold text-[12px] leading-none text-[#D0362E] mb-1.5">Seniors se milo</p>
          {/* Top Row: Title + Pill Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="font-urbanist text-[21px] xl:text-[22px] font-extrabold leading-none tracking-[-0.03em] text-[#16130F]">
              Mentors
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#14837E] text-white border-[1.5px] border-[#16130F] text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2B705]" />
              Experts
            </span>
          </div>

          {/* Sub-label with clickable text */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-[12.5px] font-semibold text-[#5B544A] truncate">
              Seniors who&apos;ve done it
            </span>
            <span className="shrink-0 text-[12px] font-black text-[#D0362E] underline decoration-2 underline-offset-2 decoration-transparent group-hover:decoration-[#D0362E] flex items-center gap-0.5">
              Meet &rarr;
            </span>
          </div>

          {/* The mentors themselves */}
          <div className="flex items-center mt-2.5 pt-2.5 border-t border-dashed border-[#16130F]/25 min-w-0">
            <div className="flex -space-x-2 shrink-0">
              {TEAM_MENTORS.map((mentor) => (
                <img
                  key={mentor.src}
                  className="w-7 h-7 rounded-full border-[1.5px] border-[#16130F] object-cover object-top bg-[#FFF1B8]"
                  src={mentorLook(mentor.name).cutout || mentor.src}
                  style={mentorLook(mentor.name).gradient ? { background: mentorLook(mentor.name).gradient } : undefined}
                  alt=""
                  width="32"
                  height="32"
                  loading="lazy"
                />
              ))}
            </div>
            <span className="text-[12px] font-bold text-[#16130F] ml-2 truncate">
              {TEAM_MENTOR_NAMES}
            </span>
          </div>
        </Link>
      </motion.div>

      {/* ── Card 3: Ask a counsellor (auto-playing chat preview, opens Priority DM) ── */}
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
          onMouseEnter={() => setHoverCard('chat')}
          onMouseLeave={() => setHoverCard(null)}
          className="group block bg-white border-2 border-[#16130F] rounded-[14px] shadow-[3px_3px_0_#16130F] hover:shadow-[4px_4px_0_#16130F] cursor-pointer overflow-hidden relative transition-all duration-200 hover:-translate-y-1 w-[225px] xl:w-[240px] p-3.5"
        >
          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-[#16130F]/30">
            <div className="min-w-0">
              <p className="font-urbanist font-extrabold text-[12px] leading-none text-[#D0362E]">Seedha poocho</p>
              <p className="mt-1 font-urbanist text-[14px] font-black text-[#16130F] leading-tight">Ask a counsellor</p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#F2B705] text-[#16130F] border-[1.5px] border-[#16130F] text-[10.5px] font-black uppercase tracking-wider">
              Free
            </span>
          </div>
          <MiniChatDemo paused={hoverCard === 'chat'} />
        </Link>
      </motion.div>

      {/* ── Mobile Frameless Full-Bleed Hero Scene (Edge-to-Edge, Zero Frame/Borders, Seamless Bottom Fade) ── */}
      <div
        className="lg:hidden relative z-10 w-full h-[240px] sm:h-[280px] min-h-[240px] sm:min-h-[280px] aspect-[16/10] overflow-hidden shrink-0 pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, rgba(0,0,0,0.5) 82%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 60%, rgba(0,0,0,0.5) 82%, transparent 100%)',
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
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10 -mt-2 sm:-mt-4 lg:mt-0 pt-0 lg:pt-16 pb-4 overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-0 items-center">

          {/* ════════════════ LEFT COLUMN: TYPOGRAPHY & BLUSH ════════════════ */}
          <div className="lg:col-span-5 xl:col-span-5 z-20 relative pr-0 lg:pr-4">

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
                  stroke="#16130F"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.7"
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

            {/* ── Eyebrow sticker + Hinglish kicker ── */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex max-w-full items-center gap-2 px-3 py-1.5 rounded-[8px] bg-white border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] -rotate-1 mb-5"
            >
              <span className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#DE5C2B] border-2 border-[#16130F]" />
              <span className="text-[12.5px] sm:text-[13px] font-bold text-[#16130F] tracking-tight">
                Study abroad counselling &amp; 1:1 senior mentorship
              </span>
            </motion.div>
            <p className="font-urbanist font-extrabold text-[15px] sm:text-[16px] leading-none text-[#D0362E] mb-3">
              Sapna videsh ka, plan yahin se
            </p>

            {/* ── Main Headline matching Image 1 Typography & Peach Underline ── */}
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-urbanist text-4xl sm:text-5xl lg:text-[54px] xl:text-[62px] font-black leading-[1.04] tracking-[-0.04em] text-[#16130F] mb-6"
            >
              Your Global{' '}
              Future{' '}
              <br />
              <span className="relative inline-block mt-2 px-3 pb-1 bg-[#DE5C2B] text-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] -rotate-1" style={{ borderRadius: 10 }}>
                Starts Here
              </span>
            </motion.h1>

            {/* ── Subtitle matching Image 1 measure, line-height & font weight ── */}
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-[15.5px] sm:text-[17px] text-[#3D3830] leading-[1.6] max-w-[480px] mb-8 font-medium"
            >
              Admissions, scholarships and visas, guided by seniors who&apos;ve already done it.
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
                className="group inline-flex items-center gap-3 bg-[#16130F] text-white pl-5 sm:pl-6 pr-2.5 py-2.5 rounded-full font-bold text-[15px] border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#DE5C2B] active:translate-y-0 active:shadow-[2px_2px_0_#DE5C2B] transition-all duration-200 cursor-pointer"
              >
                <span>Book Free Counselling</span>
                <span className="w-8 h-8 rounded-full bg-[#F2B705] text-[#16130F] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight className="w-4 h-4 text-[#16130F] stroke-[3]" />
                </span>
              </button>

              {/* Secondary White Pill with Orange Border & Down Arrow - goes to Priority DM page */}
              <Link
                to="/priority-dm"
                className="group inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-white text-[#16130F] text-[15px] font-bold border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#16130F] active:translate-y-0 active:shadow-[2px_2px_0_#16130F] transition-all duration-200 cursor-pointer"
              >
                <span>Send Priority DM</span>
                <ArrowRight size={17} strokeWidth={3} className="text-[#D0362E] transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* ── Trust stats as poster-colour stat tiles ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-[440px] pr-1"
            >
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-0 rounded-[12px] border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] px-2.5 sm:px-3.5 py-2.5"
                  style={{ background: stat.bg, color: stat.fg }}
                >
                  <div className="font-urbanist font-black leading-none text-[20px] sm:text-[24px] tracking-[-0.04em]">{stat.value}</div>
                  <div className="mt-1 text-[12px] sm:text-[12.5px] font-bold leading-tight">{stat.label}</div>
                </div>
              ))}
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
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] cursor-pointer ml-4 xl:ml-8 mb-2"
            >
              <div className="w-4 h-4 rounded-full bg-[#DE5C2B] text-white border border-[#16130F] flex items-center justify-center">
                <Play className="w-1.5 h-1.5 fill-current rotate-90 ml-0.5" />
              </div>
              <span className="text-[11px] font-black text-[#16130F] uppercase tracking-wider">
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