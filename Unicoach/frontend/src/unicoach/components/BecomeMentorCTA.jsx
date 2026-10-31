// ════════════════════════════════════════════════════════════════════════════════
// BecomeMentorCTA.jsx — Dark CTA section at bottom of student marketplace
// Links to /unicoach/for-mentors
// Desi Pop: flat ink card with a hard orange shadow and poster-colour fact tiles
// ════════════════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket, Users, BadgeCheck } from 'lucide-react';

export const BecomeMentorCTA = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-[#FFF6E5] select-none">
      <div className="max-w-[1340px] mx-auto">
        
        <div className="rounded-[28px] bg-[#16130F] p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden border-[3px] border-[#16130F] shadow-[10px_10px_0_#DE5C2B]">
          
          {/* Background Ambient Glows */}
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,.07)_1.3px,transparent_1.7px)] [background-size:12px_12px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 text-left">
              
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#F2B705] border-2 border-white text-[#16130F] text-[12.5px] font-extrabold tracking-[0.08em] mb-4 -rotate-1"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>ADMIT MIL GAYA? AB KAMAO</span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-urbanist text-[34px] sm:text-[44px] lg:text-[54px] font-black text-white leading-[1.02] tracking-[-0.04em] mb-4"
              >
                You Got Admitted? <br />
                <span className="text-[#F2B705]">Help Others Get There Too.</span>
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white/80 text-[15px] sm:text-[17px] leading-relaxed max-w-2xl font-medium mb-8"
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
                <div className="bg-[#DE5C2B] rounded-[16px] p-4 border-[3px] border-white">
                  <div className="font-urbanist text-[30px] font-black text-white leading-none mb-1">
                    0%
                  </div>
                  <div className="text-[15px] font-extrabold">
                    Platform Fee
                  </div>
                  <div className="text-[13px] opacity-85 mt-1">
                    Keep 100% of your earnings
                  </div>
                </div>

                <div className="bg-[#14837E] rounded-[16px] p-4 border-[3px] border-white">
                  <div className="font-urbanist text-2xl font-black text-white mb-1 flex items-center gap-1.5">
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                  <div className="text-[15px] font-extrabold">
                    Open to All Admits
                  </div>
                  <div className="text-[13px] opacity-85 mt-1">
                    Any verified university senior
                  </div>
                </div>

                <div className="bg-[#F2B705] text-[#16130F] rounded-[16px] p-4 border-[3px] border-white">
                  <div className="font-urbanist text-2xl font-black mb-1 flex items-center gap-1.5">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-[15px] font-extrabold">
                    Set Your Own Prices
                  </div>
                  <div className="text-[13px] opacity-85 mt-1">
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
                className="group inline-flex items-center gap-4 bg-[#DE5C2B] hover:bg-[#C04A1D] text-white pl-8 pr-4 py-4 sm:py-5 rounded-full font-bold text-[17px] sm:text-lg border-[3px] border-white shadow-[6px_6px_0_#F2B705] transition-transform hover:-translate-y-0.5 cursor-pointer"
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
