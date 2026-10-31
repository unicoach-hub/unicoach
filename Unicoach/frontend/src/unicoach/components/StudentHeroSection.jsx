// ════════════════════════════════════════════════════════════════════════════════
// StudentHeroSection.jsx — STUDENT-FIRST Hero
// "Get Guidance from Verified University Seniors"
// Desi Pop: cream halftone bg, station-board sign, ink borders and hard shadows
// ════════════════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { GraduationCap, Search, ArrowRight, ArrowDown, Users, ShieldCheck } from 'lucide-react';
import { InteractiveCreatorMasonry } from './InteractiveCreatorMasonry';

import { StationSign, Sticker } from '../../components/desi/DesiKit';
export const StudentHeroSection = () => {
  return (
    <section className="relative bg-[#FFF6E5] pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden border-b-[3px] border-[#16130F]">

      {/* Halftone dots, as on the other Desi Pop pages */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,19,15,.07)_1.3px,transparent_1.7px)] [background-size:12px_12px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">

        {/* ── LEFT COLUMN: HEADLINE, COPY & CTAS ── */}
        <div className="lg:col-span-6 xl:col-span-6 text-left">

          {/* Station-board sign: Hinglish on top, English below */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StationSign hi="Seniors se seedhi baat" en="UNICOACH MENTORS" className="mb-6 -rotate-2" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-urbanist text-[40px] sm:text-[54px] xl:text-[64px] font-black text-[#16130F] tracking-[-0.045em] leading-[0.98] mb-5"
          >
            Real People. Real Experiences.{' '}
            <span className="relative inline-block mt-2 px-3 py-1 bg-[#DE5C2B] text-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] -rotate-1" style={{ borderRadius: 10 }}>
              Answers in Minutes.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#3D3830] text-[16px] sm:text-[18px] leading-relaxed max-w-lg mb-8 font-medium"
          >
            Book 1:1 video calls, SOP reviews & visa guidance directly from verified university seniors admitted to TU Munich, Oxford, Harvard & 50+ global campuses.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mb-8"
          >
            <a
              href="#mentors-grid"
              className="group inline-flex items-center gap-3 bg-[#16130F] text-white pl-6 pr-3 py-3 rounded-full font-bold text-[16px] border-[3px] border-[#16130F] shadow-[5px_5px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <Search className="w-[18px] h-[18px] text-white/80" />
              <span>Find a Mentor</span>
              <span className="w-9 h-9 rounded-full bg-[#F2B705] text-[#16130F] flex items-center justify-center transition-transform group-hover:translate-y-0.5">
                <ArrowDown className="w-4 h-4" strokeWidth={3} />
              </span>
            </a>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-[#16130F] text-[16px] font-bold border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <span>How It Works</span>
              <ArrowRight className="w-4 h-4 text-[#DE5C2B]" strokeWidth={3} />
            </a>
          </motion.div>

          {/* Fact stickers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Sticker bg="#F2B705" tilt={-2}><Users className="w-4 h-4" /> Verified seniors from top universities</Sticker>
            <Sticker bg="#14837E" fg="#FFFFFF" tilt={1.5}><GraduationCap className="w-4 h-4" /> 50+ universities worldwide</Sticker>
            <Sticker bg="#FFFFFF" tilt={-1}><ShieldCheck className="w-4 h-4 text-[#14837E]" /> 100% verified admits</Sticker>
          </motion.div>

        </div>

        {/* ── RIGHT COLUMN: MENTOR SHOWCASE ── */}
        <div className="lg:col-span-6 xl:col-span-6 relative">
          <InteractiveCreatorMasonry />
        </div>

      </div>

    </section>
  );
};
