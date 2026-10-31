import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, UserRound } from 'lucide-react';
import { TEAM_MENTORS, CORE_TEAM, mentorLook } from '../utils/teamMentors';
import { HookBand } from '../components/ui/Infographics';

const FLAGS = { Ireland: 'ie', Australia: 'au', Europe: 'eu', USA: 'us', UK: 'gb', Canada: 'ca', Germany: 'de' };

// Shown until real names and photos are added to CORE_TEAM (roles only, no invented people)
const CORE_ROLES = ['Founder & CEO', 'Senior Counsellor', 'Visa & Documentation', 'Student Success'];

const initials = (name) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const TeamPage = () => {
  const core = CORE_TEAM.filter((m) => m.name);
  const mentorRegions = [...new Set(TEAM_MENTORS.map((m) => m.country).filter(Boolean))];

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-28 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-200 text-[11.5px] font-bold text-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B]" /> Our team
          </span>
          <h1 className="font-outfit text-[34px] sm:text-[46px] font-black text-slate-900 tracking-tight leading-[1.08] mt-4">
            The people behind <span className="text-[#DE5C2B]">UniCoach</span>
          </h1>
          <p className="text-slate-600 text-[15px] sm:text-[16px] mt-3 leading-relaxed">
            Mentors who have studied and worked abroad, and a counselling team that stays with you from shortlist to visa.
          </p>
        </header>

        {/* Hook: mentor count and regions, from the mentor list itself */}
        <HookBand
          value={TEAM_MENTORS.length}
          label={`Mentors who have studied and worked abroad${mentorRegions.length ? `: ${mentorRegions.join(', ')}` : ''}.`}
          hi="Guru"
          className="mt-10 max-w-3xl mx-auto"
        />

        {/* Mentors */}
        <section className="mt-14" aria-labelledby="team-mentors">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 id="team-mentors" className="font-outfit text-2xl sm:text-3xl font-black text-slate-900">Mentors</h2>
              <p className="text-slate-500 text-sm mt-1">Country experts who host our free sessions and 1:1 calls.</p>
            </div>
            <Link to="/events" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-[#DE5C2B] hover:text-[#DE5C2B] text-[13px] font-bold text-slate-800 transition-colors">
              Free sessions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {TEAM_MENTORS.map((m) => (
              <article key={m.name} className="group bg-white rounded-[22px] border border-slate-200 p-3 hover:border-orange-200 hover:shadow-[0_14px_30px_-16px_rgba(15,23,42,0.3)] transition-all">
                <div className="aspect-square rounded-[16px] overflow-hidden bg-slate-100" style={mentorLook(m.name).gradient ? { background: mentorLook(m.name).gradient } : undefined}>
                  <img src={mentorLook(m.name).cutout || m.headshot || m.portrait || m.src} alt={m.name} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500 origin-bottom" />
                </div>
                <div className="px-1.5 pt-3 pb-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-outfit font-black text-[16px] text-slate-900 truncate">{m.name}</h3>
                    {FLAGS[m.country] && (
                      <img src={`https://flagcdn.com/w40/${FLAGS[m.country]}.png`} alt={m.country} title={m.country} className="w-5 h-3.5 rounded-[2px] object-cover shrink-0" />
                    )}
                  </div>
                  <p className="text-[12.5px] text-slate-500 mt-0.5 truncate">{m.role}</p>
                  {m.focus && <p className="hidden sm:block text-[13px] text-slate-700 mt-2.5 leading-relaxed line-clamp-3">{m.focus}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Core team */}
        <section className="mt-16" aria-labelledby="team-core">
          <h2 id="team-core" className="font-outfit text-2xl sm:text-3xl font-black text-slate-900">Core team</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">Counsellors and specialists who handle your applications day to day.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {core.length > 0
              ? core.map((p) => (
                <article key={p.name} className="bg-white rounded-[22px] border border-slate-200 p-3 text-center">
                  <div className="aspect-square rounded-[16px] overflow-hidden bg-orange-50 flex items-center justify-center">
                    {p.photo
                      ? <img src={p.photo} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                      : <span className="font-outfit text-3xl font-black text-[#DE5C2B]">{initials(p.name)}</span>}
                  </div>
                  <h3 className="font-outfit font-black text-[15px] text-slate-900 mt-3">{p.name}</h3>
                  <p className="text-[12.5px] text-slate-500">{p.role}</p>
                  {p.linkedin && (
                    <a href={p.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-[12px] font-bold text-[#0A66C2] hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                    </a>
                  )}
                </article>
              ))
              : CORE_ROLES.map((role) => (
                <article key={role} className="bg-white rounded-[22px] border border-dashed border-slate-300 p-3 text-center">
                  <div className="aspect-square rounded-[16px] bg-slate-50 flex items-center justify-center">
                    <UserRound className="w-12 h-12 text-slate-300" />
                  </div>
                  <p className="font-outfit font-black text-[14px] text-slate-800 mt-3">{role}</p>
                  <p className="text-[12px] text-slate-400">Profile coming soon</p>
                </article>
              ))}
          </div>
        </section>

        {/* CTA */}
        <section className="uc-soft mt-16 rounded-[28px] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-outfit text-2xl sm:text-3xl font-black">Talk to the team</h2>
            <p className="text-white/70 text-sm mt-1">Free counselling call, no strings attached.</p>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-[14px] font-bold transition-colors">
            Book free counselling <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default TeamPage;
