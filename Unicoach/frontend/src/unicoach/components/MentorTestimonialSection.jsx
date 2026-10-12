// ════════════════════════════════════════════════════════════════════════════════
// MentorTestimonialSection.jsx — The real mentors already guiding students on UniCoach
// Used on /unicoach/for-mentors
// ════════════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TEAM_MENTORS } from '../../utils/teamMentors';

export const MentorTestimonialSection = () => {
  return (
    <section className="bg-[#182B30] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-12 relative overflow-hidden select-none">
      
      {/* Background glow highlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-teal-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1340px] mx-auto relative z-10 text-center">
        
        {/* Title */}
        <h2 className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-14 sm:mb-16">
          Mentors already on UniCoach
        </h2>

        {/* Our team mentors: photo, what they help with, link to their free sessions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 text-left">
          {TEAM_MENTORS.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#F1F4F5] rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[220px] sm:min-h-[240px] shadow-xl hover:shadow-2xl transition-all"
            >
              {/* What they help with */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#DE5C2B]">Helps students with</span>
                <p className="mt-2 text-slate-900 text-sm sm:text-base font-semibold leading-relaxed">
                  {item.focus}
                </p>
                <Link to="/events" className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-[#DE5C2B] hover:underline">
                  Join a free session <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Author Footer */}
              <div className="flex items-center gap-3 pt-6 mt-4 border-t border-slate-200/60">
                <img
                  src={item.src}
                  alt={item.name}
                  loading="lazy"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs"
                />
                <div>
                  <div className="font-outfit text-sm font-bold text-slate-950 leading-tight">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {item.role}
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>

    </section>
  );
};
