import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, GraduationCap, Phone } from 'lucide-react';
import { PillButton } from './ui/PillButton';
import ctaBgImg from '../assets/cta_bg.webp';

/**
 * StudyAbroadCTA — Reusable inline CTA banner for all Study Abroad pages.
 * 
 * Props:
 * @param {string} [country] - Country name for contextual messaging (e.g., "Germany", "UK")
 * @param {string} [title] - Custom title override
 * @param {string} [description] - Custom description override
 */
const StudyAbroadCTA = ({ 
  country = '', 
  title, 
  description 
}) => {
  const defaultTitle = country 
    ? `Start Your ${country} Study Journey Today` 
    : 'Start Your Study Abroad Journey Today';
  
  const defaultDescription = country
    ? `Get personalized guidance from our expert counsellors on admissions, scholarships, visa processes, and more for studying in ${country}. Book free counselling now.`
    : 'Get personalized guidance from our expert counsellors on admissions, scholarships, visa processes, and more. Book free counselling now.';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true }}
      className="mt-14 mb-4 rounded-[28px] sm:rounded-[32px] relative overflow-hidden border border-orange-200/30"
      style={{
        background: 'linear-gradient(135deg, #DE5C2B 0%, #E25F2E 35%, #EA580C 70%, #F97316 100%)',
        boxShadow: '0 20px 50px -12px rgba(222, 92, 43, 0.35)',
      }}
    >
      {/* Local Backdrop photo for rich aesthetics - alt="" to prevent broken text leak */}
      <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
        <img 
          src={ctaBgImg} 
          alt="" 
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Subtle world coordinates texture */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
        }}
      />

      {/* Decorative ambient glows */}
      <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-30%] left-[-5%] w-[300px] h-[300px] bg-orange-400/15 rounded-full blur-[80px] pointer-events-none z-0" />

      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 md:px-14 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          {/* Text Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white/95 text-[10.5px] font-extrabold uppercase tracking-wider mb-4 shadow-xs">
              <GraduationCap size={14} className="text-orange-200" />
              <span>Free Expert Consultation</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 sm:mb-4 leading-tight tracking-tight font-outfit">
              {title || defaultTitle}
            </h2>
            
            <p className="text-white/85 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
              {description || defaultDescription}
            </p>
          </div>

          {/* CTA Button */}
          <div className="shrink-0">
            <PillButton 
              to="/book-consultation"
              variant="white"
              size="md"
              icon={ArrowUpRight}
            >
              Book Free Counselling
            </PillButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudyAbroadCTA;
