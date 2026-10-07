// ════════════════════════════════════════════════════════════════════════════════
// BecomeMentorCTA.jsx — Dark CTA section at bottom of student marketplace
// Links to /unicoach/for-mentors
// Dark slate with orange accent CTA banner
// ════════════════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket, Users, Percent, BadgeCheck } from 'lucide-react';

export const BecomeMentorCTA = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF9F6] select-none">
      <div className="max-w-[1340px] mx-auto">
        
        <div className="rounded-[36px] bg-gradient-to-br from-[#111111] via-[#1E293B] to-[#0F172A] p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#DE5C2B]/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 text-left">
              
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DE5C2B]/20 border border-[#DE5C2B]/30 text-orange-300 text-xs font-bold mb-4"
              >
                <Rocket className="w-3.5 h-3.5 text-[#DE5C2B]" />
                <span>EARN FROM YOUR EXPERIENCE</span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4"
              >
                You Got Admitted? <br />
                <span className="text-[#DE5C2B]">Help Others Get There Too.</span>
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal mb-8"
              >
                Share your university experience, review SOPs, host 1:1 video calls, and sell digital guides — 
                all with <strong>0% platform fee</strong>. Set your own prices and keep 100% of your earnings.
              </motion.p>

              {/* Three Advantage Pills */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="font-outfit text-2xl font-black text-[#DE5C2B] mb-0.5">
                    0%
                  </div>
                  <div className="text-xs font-bold text-white">
                    Platform Fee
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Keep 100% of your earnings
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="font-outfit text-2xl font-black text-emerald-400 mb-0.5 flex items-center gap-1.5">
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-white">
                    Open to All Admits
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Any verified university senior
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="font-outfit text-2xl font-black text-amber-400 mb-0.5 flex items-center gap-1.5">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-white">
                    Set Your Own Prices
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    You decide what you charge
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Right CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-4 flex justify-center lg:justify-end"
            >
              <Link
                to="/unicoach/for-mentors"
                className="group inline-flex items-center gap-4 bg-[#DE5C2B] hover:bg-[#c94f24] text-white pl-8 pr-4 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg shadow-[0_16px_40px_-8px_rgba(222,92,43,0.45)] hover:shadow-[0_20px_50px_-8px_rgba(222,92,43,0.55)] transition-all hover:scale-[1.03] cursor-pointer"
              >
                <span>Become a Mentor</span>
                <span className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </span>
              </Link>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
};
