// ════════════════════════════════════════════════════════════════════════════════
// MentorHeroSection.jsx — Mentor-facing hero (moved from student page)
// "Your All-in-One Creator Storefront" — Mentor-facing hero section
// Used on /unicoach/for-mentors
// ════════════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, Zap } from 'lucide-react';
import { InteractiveCreatorMasonry } from './InteractiveCreatorMasonry';

export const MentorHeroSection = () => {
  return (
    <section className="relative bg-[#FDF6EE] pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden border-b border-orange-100/70">
      
      {/* Subtle organic warmth glows in background */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#FFE3D1]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-[480px] h-[480px] bg-[#FFE8D6]/70 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
        
        {/* ── LEFT COLUMN: HEADLINE, COPY & CTAS ── */}
        <div className="lg:col-span-6 xl:col-span-6 text-left">
          
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-orange-200/80 shadow-xs mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#DE5C2B] animate-pulse" />
            <span className="text-[12px] font-bold text-slate-800 tracking-tight">
              The #1 Monetization Platform for Mentors & Creators
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-outfit text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-black text-[#111111] tracking-tight leading-[1.08] mb-6"
          >
            Your All-in-One <br />
            Creator <span className="font-extrabold text-[#111111] relative inline-block">
              Storefront
              <span className="absolute -bottom-1 left-0 w-full h-[6px] bg-[#DE5C2B]/30 rounded-full" />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-700 text-base sm:text-lg lg:text-[19px] leading-relaxed max-w-xl mb-8 font-normal"
          >
            Make money from your content. Sell products, host sessions, and grow your business — all from a single link.
          </motion.p>

          {/* CTA & Trust Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 sm:gap-5 mb-8"
          >
            {/* Start My Page Pill Button */}
            <Link
              to="/unicoach/apply"
              className="group inline-flex items-center gap-4 bg-[#111111] hover:bg-black text-white pl-7 pr-3.5 py-3.5 rounded-full font-bold text-base shadow-[0_12px_28px_-6px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.35)] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Start My Page</span>
              <span className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
              </span>
            </Link>

            {/* Learn More */}
            <a
              href="#mentor-features"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-orange-50/60 text-slate-900 text-base font-bold border border-orange-200/90 shadow-xs hover:border-[#DE5C2B] hover:text-[#DE5C2B] transition-all cursor-pointer"
            >
              <span>See Features</span>
              <span className="text-sm font-extrabold text-[#DE5C2B]">↓</span>
            </a>
          </motion.div>

          {/* Social Proof Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            {/* Reviews Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F6EADB] border border-[#E9DAC8] px-4 py-2 rounded-full text-xs font-bold text-slate-800 shadow-2xs">
              <span className="font-extrabold text-slate-900">100k+</span>
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-slate-600 font-medium">reviews</span>
            </div>

            {/* Professionals / Students Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F6EADB] border border-[#E9DAC8] px-4 py-2 rounded-full text-xs font-bold text-slate-800 shadow-2xs">
              <span className="font-extrabold text-slate-900">1mn+</span>
              <span className="text-slate-600 font-medium">professionals</span>
            </div>

            {/* 0% Platform Fee Badge */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-full text-xs font-bold text-emerald-800 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>0% Platform Fee</span>
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
