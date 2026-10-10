import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Phone } from 'lucide-react';
import { useLead } from '../context/LeadContext';
import ctaBgImg from '../assets/cta_bg.webp';
import planeImg from '../assets/plane_perfect.webp';
import { PillButton } from './ui/PillButton';
import PriorityDmModal from './PriorityDmModal';

// ── Exact Custom Glowing Teardrop Pin matching 2nd reference image ──
const CustomMapPin = ({ bgColor, glowColor, dotColor = '#0A0E1A', size = 'w-3.5 h-4.5 sm:w-4 sm:h-5' }) => (
  <motion.div
    animate={{ y: [0, -2.5, 0] }}
    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    whileHover={{ scale: 1.3 }}
    className="relative flex items-center justify-center cursor-pointer"
  >
    <svg
      className={`${size} overflow-visible`}
      viewBox="0 0 24 30"
      fill="none"
      style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
    >
      {/* Outer Teardrop Pin Shape */}
      <path
        d="M 12 0 C 5.37 0 0 5.37 0 12 C 0 18.5 12 30 12 30 C 12 30 24 18.5 24 12 C 24 5.37 18.63 0 12 0 Z"
        fill={bgColor}
      />
      {/* Inner Pin Center Dot */}
      <circle cx="12" cy="11.5" r="4.5" fill={dotColor} opacity="0.9" />
    </svg>
  </motion.div>
);

export const FinalCTA = ({ onOpenModal }) => {
  const { openEligibilityModal } = useLead();
  const handleOpen = onOpenModal || (() => openEligibilityModal('Final CTA Banner'));
  const [isPriorityDmOpen, setIsPriorityDmOpen] = useState(false);
  return (
    <section className="pt-2 sm:pt-4 pb-12 sm:pb-16 bg-[#FAF9F6] select-none w-full max-w-full overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 w-full min-w-0">

        {/* ── 1:1 Exact Replicated Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden p-6 sm:p-8 lg:p-12 shadow-2xl shadow-orange-500/15 text-white min-h-[240px] sm:min-h-[260px] flex items-center border border-orange-200/40 w-full min-w-0"
        >

          {/* ════════ ELEGANT VIBRANT TERRACOTTA WARM GRADIENT BACKGROUND ════════ */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{
              background: 'linear-gradient(135deg, #DE5C2B 0%, #E25F2E 35%, #EA580C 70%, #F97316 100%)',
            }}
          />
          {/* Subtle world coordinates texture */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 1.2px, transparent 1.2px)',
              backgroundSize: '22px 22px',
            }}
          />

          {/* ════════ FLIGHT PATH ARCS & ASSETS OVERLAY ════════ */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">

            {/* Glowing Dotted Flight Arcs SVG spreading from Hub */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1200 300"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="arcGlow2nd" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FED7CE" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#FFEDDF" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Arc 1: Left Plane to Top-Center Hub */}
              <path
                d="M 370 180 Q 480 60 580 90"
                stroke="url(#arcGlow2nd)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Arc 2: Top-Center to Middle-Top UK */}
              <path
                d="M 580 90 Q 660 65 745 80"
                stroke="url(#arcGlow2nd)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Arc 3: Center to Top-Right Asia */}
              <path
                d="M 745 80 Q 840 50 915 65"
                stroke="url(#arcGlow2nd)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Arc 4: Top-Right to Far-Right */}
              <path
                d="M 915 65 Q 1010 100 1080 150"
                stroke="url(#arcGlow2nd)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Arc 5: Center Hub to Bottom-Right */}
              <path
                d="M 580 90 Q 720 180 880 210"
                stroke="url(#arcGlow2nd)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Arc 6: Low sweep curve */}
              <path
                d="M 450 190 Q 650 250 880 210"
                stroke="url(#arcGlow2nd)"
                strokeWidth="1.3"
                strokeDasharray="3 3"
              />
              {/* Arc 7: Far-Right connecting arc */}
              <path
                d="M 880 210 Q 980 210 1080 150"
                stroke="url(#arcGlow2nd)"
                strokeWidth="1.3"
                strokeDasharray="3 3"
              />
            </svg>

            {/* ── 3D WHITE COMMERCIAL AIRLINER (Hidden on mobile to prevent text clash) ── */}
            <motion.div
              animate={{
                x: [0, 4, 0],
                y: [0, -3, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[29%] sm:left-[30%] top-[55%] -translate-y-1/2 drop-shadow-2xl hidden md:block"
            >
              <img
                src={planeImg}
                alt="Commercial Airplane"
                className="w-22 h-14 sm:w-26 sm:h-17 lg:w-28 lg:h-18 object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] -rotate-[2deg]"
                loading="lazy"
              />
            </motion.div>

            {/* ── GLOWING STUDENT AVATARS ── */}

            {/* 1. Top-Center Hub Avatar (Sky-White Halo, hidden on mobile to avoid overlapping the headline) */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="absolute left-[48%] top-[24%] -translate-x-1/2 -translate-y-1/2 hidden md:block"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full p-[2px] bg-gradient-to-r from-white to-sky-200 shadow-[0_0_16px_rgba(255,255,255,0.95)]">
                <img
                  src="/images/mentors/thumbs/mentor_blue_shirt.webp"
                  alt="UniCoach mentor"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </motion.div>

            {/* 2. Top-Center Avatar (Hidden on mobile to avoid overlapping 'the Leap?') */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
              className="absolute left-[70%] sm:left-[62%] top-[22%] sm:top-[25%] -translate-x-1/2 -translate-y-1/2 hidden md:block"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full p-[2px] bg-white shadow-[0_0_16px_rgba(255,255,255,0.95)]">
                <img
                  src="/images/mentors/thumbs/prachi_cybersecurity.webp"
                  alt="Prachi, Cyber Security Expert (Ireland)"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </motion.div>

            {/* 3. Top-Right Avatar (Golden Halo) */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2.0 }}
              className="absolute left-[86%] sm:left-[76%] top-[18%] sm:top-[20%] -translate-x-1/2 -translate-y-1/2 hidden md:block"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full p-[2px] bg-gradient-to-r from-amber-300 to-yellow-400 shadow-[0_0_16px_rgba(251,191,36,0.95)]">
                <img
                  src="/images/mentors/thumbs/manan_australia.webp"
                  alt="Manan, Australia Expert"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </motion.div>

            {/* 4. Lower-Right Avatar (Magenta Halo) */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2.6 }}
              className="absolute left-[78%] sm:left-[73%] top-[72%] sm:top-[70%] -translate-x-1/2 -translate-y-1/2 hidden md:block"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full p-[2px] bg-gradient-to-r from-fuchsia-400 to-pink-500 shadow-[0_0_16px_rgba(232,121,249,0.95)]">
                <img
                  src="/images/mentors/thumbs/nitya_ireland_career.webp"
                  alt="Nitya, Ireland Career Guide Expert"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </motion.div>

            {/* 5. Far-Right Avatar (Rose Halo) */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 3.0 }}
              className="absolute left-[92%] sm:left-[90%] top-[50%] -translate-x-1/2 -translate-y-1/2 hidden md:block"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full p-[2px] bg-gradient-to-r from-rose-400 to-pink-500 shadow-[0_0_16px_rgba(244,63,94,0.95)]">
                <img
                  src="/images/mentors/thumbs/mentor_smile_blue.webp"
                  alt="UniCoach mentor"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </motion.div>

            {/* 6. Lower-Center Avatar (Emerald Halo) */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute left-[58%] top-[74%] -translate-x-1/2 -translate-y-1/2 hidden md:block"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full p-[2px] bg-gradient-to-r from-emerald-300 to-teal-400 shadow-[0_0_16px_rgba(52,211,153,0.95)]">
                <img
                  src="/images/mentors/thumbs/manvi.webp"
                  alt="Manvi, UniCoach mentor"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </motion.div>

            {/* ── GLOWING MAP PINS (Overlapping center pins hidden on mobile) ── */}

            {/* 1. Coral Pin near Plane */}
            <div className="absolute left-[39%] top-[49%] hidden md:block">
              <CustomMapPin bgColor="#FB923C" glowColor="rgba(251,146,60,0.9)" />
            </div>

            {/* 2. Soft Pink Pin Center */}
            <div className="absolute left-[49%] top-[49%] hidden md:block">
              <CustomMapPin bgColor="#F472B6" glowColor="rgba(244,114,182,0.9)" />
            </div>

            {/* 3. Golden Pin South */}
            <div className="absolute left-[54%] top-[76%] hidden md:block">
              <CustomMapPin bgColor="#FDE047" glowColor="rgba(253,224,71,0.9)" />
            </div>

            {/* 4. White Pin North */}
            <div className="absolute left-[66%] sm:left-[62%] top-[54%] hidden md:block">
              <CustomMapPin bgColor="#FFFFFF" glowColor="rgba(255,255,255,0.9)" />
            </div>

            {/* 5. Warm Gold Pin East */}
            <div className="absolute left-[80%] sm:left-[77%] top-[48%] hidden md:block">
              <CustomMapPin bgColor="#FBBF24" glowColor="rgba(251,191,36,0.9)" />
            </div>

            {/* 6. Subtle Amber Pin Far South-East */}
            <div className="absolute left-[89%] sm:left-[87%] top-[80%] hidden md:block">
              <CustomMapPin bgColor="#F97316" glowColor="rgba(249,115,22,0.8)" size="w-3 h-4" />
            </div>

          </div>

          {/* ════════ FOREGROUND CONTENT: LEFT HEADLINE + TEXT + 2 BUTTONS (Slides from Left) ════════ */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 max-w-[270px] xs:max-w-[320px] sm:max-w-[380px] lg:max-w-[420px]"
          >

            {/* Headline matching exact scale of 2nd screenshot */}
            <h2 className="font-outfit text-[22px] xs:text-[25px] sm:text-[32px] lg:text-[38px] font-black text-white leading-[1.12] tracking-tight">
              Ready to Take <br className="hidden xs:inline sm:inline" />
              the Unicoach?
            </h2>

            {/* Subtitle */}
            <p className="text-[11px] xs:text-[12px] sm:text-[12.5px] text-white/90 mt-2 sm:mt-2.5 max-w-[240px] xs:max-w-[280px] sm:max-w-[310px] font-normal leading-relaxed">
              Join thousands of successful students who trusted UniCoach for their international education journey.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mt-5 sm:mt-6">
              <button
                type="button"
                onClick={handleOpen}
                className="group inline-flex items-center gap-3 bg-[#111111] hover:bg-black text-white pl-5 pr-2.5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-xl shadow-black/40 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Book Free Counselling</span>
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsPriorityDmOpen(true)}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-white hover:bg-orange-50/80 text-slate-900 text-xs sm:text-sm font-bold border border-orange-200/90 shadow-sm hover:border-[#DE5C2B] hover:text-[#DE5C2B] transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#DE5C2B]" />
                <span>Talk To Expert</span>
              </button>
            </div>

          </motion.div>

        </motion.div>

        {/* Priority DM Modal */}
        <PriorityDmModal
          isOpen={isPriorityDmOpen}
          onClose={() => setIsPriorityDmOpen(false)}
        />

      </div>
    </section>
  );
};

export default FinalCTA;
