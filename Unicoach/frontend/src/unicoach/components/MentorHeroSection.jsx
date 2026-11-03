// ════════════════════════════════════════════════════════════════════════════════
// MentorHeroSection.jsx — Mentor-facing hero (moved from student page)
// "Your All-in-One Creator Storefront" — Mentor-facing hero section
// Used on /unicoach/for-mentors
// Desi Pop: cream halftone bg, station-board sign, ink borders and hard shadows
// ════════════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, ArrowDown, Zap } from 'lucide-react';
import { InteractiveCreatorMasonry } from './InteractiveCreatorMasonry';
import { StationSign, Sticker } from '../../components/desi/DesiKit';

export const MentorHeroSection = () => {
  return (
    <section className="relative bg-[#FFF6E5] pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden">

      {/* Halftone dots, as on the other Desi Pop pages */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,19,15,.07)_1.3px,transparent_1.7px)] [background-size:12px_12px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">

        {/* ── LEFT COLUMN: HEADLINE, COPY & CTAS ── */}
        <div className="lg:col-span-6 xl:col-span-6 text-left min-w-0">

          {/* Station-board sign + eyebrow line */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <StationSign hi="Apna page, apni kamai" en="FOR MENTORS" className="-rotate-2" />
            <p className="mt-4 flex items-center gap-2 text-[15px] font-bold text-[#16130F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D0362E] border-2 border-[#16130F] shrink-0" />
              The #1 Monetization Platform for Mentors & Creators
            </p>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-urbanist text-[40px] sm:text-[54px] xl:text-[66px] font-black text-[#16130F] tracking-[-0.045em] leading-[0.98] mb-5"
          >
            Your All-in-One <br />
            Creator{' '}
            <span className="relative inline-block mt-2 px-3 py-1 bg-[#F2B705] text-[#16130F] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] -rotate-1" style={{ borderRadius: 10 }}>
              Storefront
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#3D3830] text-[16px] sm:text-[18px] leading-relaxed max-w-xl mb-8 font-medium"
          >
            Make money from your content. Sell products, host sessions, and grow your business — all from a single link.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mb-8"
          >
            <Link
              to="/unicoach/apply"
              className="group inline-flex items-center gap-3 bg-[#16130F] text-white pl-6 pr-3 py-3 rounded-full font-bold text-[16px] border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <span>Start My Page</span>
              <span className="w-9 h-9 rounded-full bg-[#F2B705] text-[#16130F] flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" strokeWidth={3} />
              </span>
            </Link>

            <a
              href="#mentor-features"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-[#16130F] text-[16px] font-bold border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <span>See Features</span>
              <ArrowDown className="w-4 h-4 text-[#DE5C2B]" strokeWidth={3} />
            </a>
          </motion.div>

          {/* Fact stickers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Sticker bg="#F2B705" tilt={-2}>
              <span className="font-black">100k+</span>
              <span className="inline-flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#16130F] text-[#16130F]" />
                ))}
              </span>
              reviews
            </Sticker>
            <Sticker bg="#FFFFFF" tilt={1.5}>
              <span className="font-black">1mn+</span> professionals
            </Sticker>
            <Sticker bg="#14837E" fg="#FFFFFF" tilt={-1}>
              <Zap className="w-4 h-4 fill-white" /> 0% Platform Fee
            </Sticker>
          </motion.div>

        </div>

        {/* ── RIGHT COLUMN: HIGH-INTERACTION CREATOR SHOWCASE ── */}
        <div className="lg:col-span-6 xl:col-span-6 relative min-w-0">
          <InteractiveCreatorMasonry />
        </div>

      </div>

    </section>
  );
};
