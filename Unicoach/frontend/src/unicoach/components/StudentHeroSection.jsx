// ════════════════════════════════════════════════════════════════════════════════
// StudentHeroSection.jsx — STUDENT-FIRST Hero
// "Get Guidance from Verified University Seniors"
// Warm peach bg, font-outfit, orange accent, framer-motion
// ════════════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Search, ArrowRight, Users, ShieldCheck } from 'lucide-react';
import { InteractiveCreatorMasonry } from './InteractiveCreatorMasonry';

export const StudentHeroSection = () => {
  return (
    <section className="relative bg-[#FDF6EE] pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-orange-100/70">
      
      {/* Subtle organic warmth glows in background */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#FFE3D1]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-[480px] h-[480px] bg-[#FFE8D6]/70 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
        
        {/* ── LEFT COLUMN: STUDENT-FIRST HEADLINE, COPY & CTAS ── */}
        <div className="lg:col-span-6 xl:col-span-6 text-left">
          
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-orange-200/80 shadow-xs mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-[#DE5C2B] animate-pulse" />
            <span className="text-[12px] font-bold text-slate-800 tracking-tight">
              🎓 Guidance from Verified University Seniors
            </span>
          </motion.div>

          {/* Main Headline — Clean, punchy 2-line editorial punch */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-outfit text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-black text-[#111111] tracking-tight leading-[1.12] mb-5"
          >
            Real People. Real Experiences. <br />
            <span className="text-[#DE5C2B]">Answers in Minutes.</span>
          </motion.h1>

          {/* Subtitle — concise & scannable */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 text-sm sm:text-base lg:text-[17px] leading-relaxed max-w-lg mb-8 font-normal"
          >
            Book 1:1 video calls, SOP reviews & visa guidance directly from verified university seniors admitted to TU Munich, Oxford, Harvard & 50+ global campuses.
          </motion.p>

          {/* CTA & Trust Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 sm:gap-5 mb-8"
          >
            {/* Find a Mentor — scrolls to directory */}
            <a
              href="#mentors-grid"
              className="group inline-flex items-center gap-4 bg-[#111111] hover:bg-black text-white pl-7 pr-3.5 py-3.5 rounded-full font-bold text-base shadow-[0_12px_28px_-6px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.35)] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 text-white/80" />
              <span>Find a Mentor</span>
              <span className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:translate-y-0.5">
                <span className="text-sm font-extrabold text-[#DE5C2B]">↓</span>
              </span>
            </a>

            {/* How It Works — scrolls to steps section */}
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-orange-50/60 text-slate-900 text-base font-bold border border-orange-200/90 shadow-xs hover:border-[#DE5C2B] hover:text-[#DE5C2B] transition-all cursor-pointer"
            >
              <span>How It Works</span>
              <ArrowRight className="w-4 h-4 text-[#DE5C2B]" />
            </a>
          </motion.div>

          {/* Social Proof Badges — student-perspective */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            {/* Verified Seniors Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F6EADB] border border-[#E9DAC8] px-3.5 py-2 rounded-full text-xs font-bold text-slate-800 shadow-2xs">
              <Users className="w-4 h-4 text-[#DE5C2B]" />
              <span className="font-extrabold text-slate-900">Verified Seniors</span>
              <span className="text-slate-600 font-medium">from Top Universities</span>
            </div>

            {/* Universities Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F6EADB] border border-[#E9DAC8] px-3.5 py-2 rounded-full text-xs font-bold text-slate-800 shadow-2xs">
              <GraduationCap className="w-4 h-4 text-[#DE5C2B]" />
              <span className="font-extrabold text-slate-900">50+</span>
              <span className="text-slate-600 font-medium">Universities Worldwide</span>
            </div>

            {/* 100% Verified Admits Badge */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-full text-xs font-bold text-emerald-800 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Verified Admits</span>
            </div>
          </motion.div>

        </div>

        {/* ── RIGHT COLUMN: HIGH-INTERACTION CREATOR SHOWCASE ── */}
        <div className="lg:col-span-6 xl:col-span-6 relative">
          <InteractiveCreatorMasonry />
        </div>

      </div>

    </section>
  );
};
