import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { TEAM_MENTORS, mentorLook } from '../../utils/teamMentors';

const FLAGS = { Europe: 'eu', Ireland: 'ie', Australia: 'au', USA: 'us', UK: 'gb', Canada: 'ca', Germany: 'de' };

/**
 * Mentor sign-up page: the mentors already on UniCoach, so a new mentor sees
 * they are joining a real group of people, not an empty platform.
 */
export const MentorPeersSection = () => (
  <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-100">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <p className="text-[13px] font-semibold text-[#DE5C2B]">You won't be starting alone</p>
          <h2 className="mt-2 font-outfit text-[30px] sm:text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-slate-900">
            Mentors already guiding students on UniCoach
          </h2>
          <p className="mt-3 text-[15px] text-slate-600 max-w-xl">
            Students, graduates and working professionals across Ireland, Australia, Europe and the USA. Join them and get your own page next to theirs.
          </p>
        </div>
        <Link
          to="/unicoach/apply"
          className="inline-flex items-center gap-2 self-start sm:self-auto h-11 px-5 rounded-full bg-slate-900 hover:bg-[#DE5C2B] text-white text-[14px] font-semibold transition-colors whitespace-nowrap"
        >
          Apply as a mentor <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {TEAM_MENTORS.map((m, i) => {
          const look = mentorLook(m.name);
          const photo = look.cutout || m.headshot || m.portrait || m.src;
          return (
            <motion.article
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-white rounded-[20px] border border-slate-200 p-2.5"
            >
              <div className="relative aspect-[4/5] rounded-[14px] overflow-hidden bg-slate-100" style={look.gradient ? { background: look.gradient } : undefined}>
                <img src={photo} alt={m.name} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-500 origin-bottom" />
                {FLAGS[m.country] && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-800">
                    <img src={`https://flagcdn.com/w40/${FLAGS[m.country]}.png`} alt="" className="w-3.5 h-2.5 rounded-[2px] object-cover" />
                    {m.country}
                  </span>
                )}
                <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white grid place-items-center text-[#DE5C2B]" title="Verified mentor">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="mt-2.5 px-1 font-outfit font-bold text-[15px] text-slate-900 truncate">{m.name}</p>
              <p className="px-1 pb-1 text-[12.5px] text-slate-500 truncate">{m.role}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  </section>
);
