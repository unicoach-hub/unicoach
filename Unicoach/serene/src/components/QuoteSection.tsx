import React from 'react';
import { motion } from 'framer-motion';

export const QuoteSection: React.FC = () => {
  return (
    <section className="relative py-28 md:py-36 px-6 bg-[#080507] overflow-hidden flex items-center justify-center">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="liquid-glass rounded-3xl p-10 md:p-16 border border-white/10 shadow-2xl"
        >
          <span className="text-4xl md:text-6xl font-instrument text-indigo-400 block mb-4">“</span>
          
          <blockquote className="font-instrument text-white text-2xl sm:text-4xl md:text-5xl leading-tight tracking-tight text-glow">
            Education is the passport to the future, for tomorrow belongs to those who prepare for it today.
          </blockquote>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center">
            <cite className="not-italic text-sm md:text-base font-semibold text-white/90 tracking-wide">
              Malcolm X
            </cite>
            <span className="text-xs text-indigo-300/70 uppercase tracking-widest mt-1 font-medium">
              UniCoach Global Manifesto
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
