import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { TEAM_MENTORS, mentorLook } from '../../utils/teamMentors';

const FLAGS = { Europe: 'eu', Ireland: 'ie', Australia: 'au', USA: 'us', UK: 'gb', Canada: 'ca', Germany: 'de' };

// One Desi Pop shadow colour per card: sindoor, mustard, teal, rani, orange, indigo
const TONES = ['#D0362E', '#F2B705', '#14837E', '#B8285B', '#DE5C2B', '#2B3FA0'];

/**
 * Mentor sign-up page: the mentors already on UniCoach, so a new mentor sees
 * they are joining a real group of people, not an empty platform.
 * Desi Pop: white ground, ink-bordered photo cards with poster-colour hard shadows.
 */
export const MentorPeersSection = () => (
  <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8 sm:mb-10">
        <div className="min-w-0">
          <p className="font-urbanist font-extrabold text-[16px] leading-none text-[#D0362E]">Ek se bhale do, ab tum bhi aao</p>
          <h2 className="mt-2 font-urbanist font-black text-[32px] sm:text-[42px] leading-[1.02] tracking-[-0.04em] text-[#16130F]">
            Mentors already guiding students on UniCoach
          </h2>
          <p className="mt-2 text-[13px] font-extrabold uppercase tracking-[0.1em] text-[#5B544A]">You won't be starting alone</p>
          <p className="mt-3 text-[15.5px] leading-relaxed text-[#3D3830] max-w-xl">
            Students, graduates and working professionals across Ireland, Australia, Europe and the USA. Join them and get your own page next to theirs.
          </p>
        </div>
        <Link
          to="/unicoach/apply"
          className="inline-flex items-center gap-2 self-start sm:self-auto h-12 px-6 rounded-full bg-[#16130F] text-white text-[15px] font-bold border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform whitespace-nowrap"
        >
          Apply as a mentor <ArrowRight className="w-4 h-4" strokeWidth={3} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        {TEAM_MENTORS.map((m, i) => {
          const look = mentorLook(m.name);
          const photo = look.cutout || m.headshot || m.portrait || m.src;
          const tone = TONES[i % TONES.length];
          return (
            <motion.article
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group min-w-0 bg-white rounded-[18px] border-[3px] border-[#16130F] p-2.5 transition-transform duration-300 hover:-translate-y-1"
              style={{ boxShadow: `5px 5px 0 ${tone}` }}
            >
              <div className="relative aspect-[4/5] rounded-[12px] border-2 border-[#16130F] overflow-hidden bg-[#FFF6E5]" style={look.gradient ? { background: look.gradient } : undefined}>
                <img src={photo} alt={m.name} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-500 origin-bottom" />
                {FLAGS[m.country] && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border-2 border-[#16130F] text-[11px] font-extrabold text-[#16130F]">
                    <img src={`https://flagcdn.com/w40/${FLAGS[m.country]}.png`} alt="" className="w-3.5 h-2.5 rounded-[2px] object-cover" />
                    {m.country}
                  </span>
                )}
                <span className="absolute bottom-2 right-2 w-7 h-7 rounded-full border-2 border-[#16130F] grid place-items-center bg-white text-[#16130F]" title="Verified mentor">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="mt-2.5 px-1 font-urbanist font-black text-[16px] text-[#16130F] truncate">{m.name}</p>
              <p className="px-1 pb-1 text-[13px] font-semibold text-[#5B544A] truncate">{m.role}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  </section>
);
