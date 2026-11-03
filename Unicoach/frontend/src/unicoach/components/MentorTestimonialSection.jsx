// ════════════════════════════════════════════════════════════════════════════════
// MentorTestimonialSection.jsx — The real mentors already guiding students on UniCoach
// Used on /unicoach/for-mentors
// Desi Pop: flat teal section, white ink-bordered cards with hard shadows,
// each photo on a rotating poster-colour tile.
// ════════════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TEAM_MENTORS } from '../../utils/teamMentors';
import { DESI_TONES } from '../../components/desi/desiTokens';

export const MentorTestimonialSection = () => {
  return (
    <section className="bg-[#14837E] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-10 relative overflow-hidden select-none">

      <div className="max-w-[1320px] mx-auto relative z-10 text-center">

        {/* Title */}
        <p className="font-urbanist font-extrabold text-[16px] text-[#F2B705]">Pehle se yahan hain</p>
        <h2 className="mt-1.5 font-urbanist text-[34px] sm:text-[52px] lg:text-[60px] font-black text-white tracking-[-0.04em] leading-[1] mb-8 sm:mb-12 [text-shadow:4px_4px_0_#16130F]">
          Mentors already on UniCoach
        </h2>

        {/* Our team mentors: photo, what they help with, link to their free sessions */}
        <div className="flex flex-wrap justify-center gap-5 sm:gap-6 text-left">
          {TEAM_MENTORS.map((item, index) => {
            const tone = DESI_TONES[index % DESI_TONES.length];
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] bg-white text-[#16130F] rounded-[20px] p-5 sm:p-6 flex flex-col justify-between border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F]"
              >
                {/* What they help with */}
                <div>
                  <span className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#B8285B]">Helps students with</span>
                  <p className="mt-2 text-[15px] sm:text-[16px] font-semibold leading-relaxed">
                    {item.focus}
                  </p>
                  <Link to="/events" className="mt-3 inline-flex items-center gap-1 text-[15px] font-extrabold text-[#16130F] underline decoration-[#DE5C2B] decoration-2 underline-offset-4 hover:text-[#DE5C2B]">
                    Join a free session <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Author Footer */}
                <div className="flex items-center gap-3 pt-4 mt-4 border-t-2 border-dashed border-[#16130F]/25">
                  <span className="w-12 h-12 rounded-[12px] border-2 border-[#16130F] overflow-hidden shrink-0 -rotate-3" style={{ background: tone.c }}>
                    <img
                      src={item.src}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="font-urbanist text-[16px] font-black leading-tight">
                      {item.name}
                    </div>
                    <div className="text-[13px] text-[#5B544A] font-medium">
                      {item.role}
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>

    </section>
  );
};
