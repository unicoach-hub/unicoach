import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollToHash } from '../hooks/useScrollToHash';
import { StudentHeroSection } from '../components/StudentHeroSection';
import { StudentFlashSection } from '../components/StudentFlashSection';
import { StudentTestimonialSection } from '../components/StudentTestimonialSection';
import { BecomeMentorCTA } from '../components/BecomeMentorCTA';
import { TEAM_MENTORS } from '../../utils/teamMentors';
import { 
  Search,
  ShieldCheck, 
  ArrowUpRight
} from 'lucide-react';

const FEATURED_MENTORS = TEAM_MENTORS.map((mentor) => ({
  _id: mentor.name,
  name: mentor.name,
  headline: mentor.role,
  country: mentor.country,
  avatarUrl: mentor.portrait,
  startingPriceINR: 0,
}));

const EXPERT_CATEGORIES = [
  { id: 'top_cohorts', label: 'Top Cohorts' },
  { id: 'career', label: 'Career' },
  { id: 'data_ai', label: 'Data & AI' },
  { id: 'study_abroad', label: 'Study Abroad' },
  { id: 'software', label: 'Software' },
  { id: 'hr', label: 'HR' },
  { id: 'finance', label: 'Finance' },
  { id: 'startup_mentor', label: 'Startup Mentor' },
  { id: 'astrology', label: 'Astrology' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'product_design', label: 'Product & Design' },
  { id: 'others', label: 'Others' }
];

const getCountryFlagCode = (country) => {
  if (!country) return null;
  const c = country.toLowerCase().trim();
  if (c.includes('germany') || c === 'de') return 'de';
  if (c.includes('usa') || c.includes('united states') || c.includes('america') || c === 'us') return 'us';
  if (c.includes('uk') || c.includes('united kingdom') || c.includes('oxford') || c.includes('england') || c === 'gb') return 'gb';
  if (c.includes('canada') || c === 'ca') return 'ca';
  if (c.includes('australia') || c === 'au') return 'au';
  if (c.includes('ireland') || c === 'ie') return 'ie';
  if (c.includes('france') || c === 'fr') return 'fr';
  if (c.includes('netherlands') || c === 'nl') return 'nl';
  return null;
};

const UnicoachMarketplacePage = () => {
  // /unicoach#mentors-grid (e.g. the homepage "Mentors" card) opens straight at the mentor directory
  useScrollToHash('mentors-grid');

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('top_cohorts');
  const [searchQuery, setSearchQuery] = useState('');

  // Client-side category matching for instant responsiveness
  const filteredMentors = FEATURED_MENTORS.filter((m) => {
    const query = searchQuery.trim().toLowerCase();
    const text = `${m.name} ${m.headline || ''} ${m.country || ''}`.toLowerCase();
    if (query && !text.includes(query)) return false;

    if (selectedCategory === 'top_cohorts' || selectedCategory === 'others') {
      return true;
    }

    switch (selectedCategory) {
      case 'career':
        return /career|coach|transition|resume|interview|job|co-op|fellowship|move|pm|hr|sds|pr strategy/i.test(text);
      case 'data_ai':
        return /data|ai|agent|informatics|machine learning|analytics|spark|python/i.test(text);
      case 'study_abroad':
        return /ireland|australia|germany|usa|uk|canada|harvard|tum|munich|toronto|oxford|berlin|visa|sop|admit|master|study abroad|scholarship/i.test(text);
      case 'software':
        return /software|cs|computer|engineer|tech|code|system|data|informatics|distributed/i.test(text);
      case 'hr':
        return /hr|recruiter|hiring|talent|salary|interview|resume/i.test(text);
      case 'finance':
        return /finance|goldman|investment|banking|economics|mba|fintech/i.test(text);
      case 'startup_mentor':
        return /startup|founder|growth|d2c|venture|scaling|marketing|entrepreneur/i.test(text);
      case 'astrology':
        return /astrology|astro|vedic|kundali|horoscope|timing/i.test(text);
      case 'marketing':
        return /marketing|growth|d2c|brand|acquisition|performance/i.test(text);
      case 'product_design':
        return /product|pm|design|ui|ux|case interview/i.test(text);
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-[#DE5C2B]/20">
      {/* ════════ SECTION 1: STUDENT-FIRST HERO ════════ */}
      <StudentHeroSection />

      {/* ════════ SECTION 2: "HOW IT WORKS" FOR STUDENTS ════════ */}
      <StudentFlashSection />

      {/* ════════ SECTION 3: THE GO-TO PLATFORM FOR EXPERTS (DIRECTORY) ════════ */}
      <section id="mentors-grid" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 relative z-20 scroll-mt-20">
        
        {/* Section Headline */}
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-8">
          <h2 className="font-outfit text-3xl sm:text-4xl lg:text-[44px] font-black text-[#111111] tracking-tight leading-tight mb-3">
            Meet Our Featured Mentors
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
            Get guidance from Prachi, Rishi, and Manan — our featured UniCoach mentors.
          </p>
        </div>

        {/* ════════ CATEGORY PILLS (EXACT REFERENCE CLUSTER) ════════ */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl mx-auto mb-8 select-none">
          {EXPERT_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 sm:px-5.5 sm:py-2.5 rounded-full text-xs sm:text-[13.5px] font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-sm border border-[#111111]'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-500 shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ════════ SEARCH BAR ════════ */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-4.5 h-4.5 text-slate-400" />
            </div>

            <input
              type="text"
              placeholder="Search by mentor name, expertise, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-3 sm:py-3.5 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#DE5C2B] transition-all shadow-xs"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10.5px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
                <span>{filteredMentors.length} Experts</span>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 sm:p-16 text-center my-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-inner border border-orange-200">
              🔍
            </div>
            <h3 className="font-outfit text-xl font-bold text-[#0F172A] mb-2">
              No mentors found in this category
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
              Try resetting your search or selecting <strong>&ldquo;Top Cohorts&rdquo;</strong> to view our featured mentors.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('top_cohorts');
                }}
                className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                View Top Cohorts
              </button>
              <Link
                to="/unicoach/apply"
                className="px-5 py-2.5 rounded-full bg-orange-50 text-[#DE5C2B] border border-orange-200 text-xs font-bold hover:bg-orange-100 transition-all"
              >
                Apply to Mentor in this Niche
              </Link>
            </div>
          </div>
        )}

        {/* ════════ COMPACT 5-COLUMN MENTORS CARDS GRID (REFERENCE ALIGNED) ════════ */}
        {filteredMentors.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 max-w-[1000px] mx-auto gap-3.5 sm:gap-4.5 lg:gap-5">
            {filteredMentors.map((m) => {
              const flagCode = getCountryFlagCode(m.country);
              const avatarSrc = m.avatarUrl || m.coverImageUrl;

              return (
                <Link
                  key={m._id}
                  to="/events"
                  className="bg-white rounded-[22px] p-3 sm:p-3.5 border border-slate-200/80 hover:border-[#DE5C2B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(222,92,43,0.14)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group cursor-pointer select-none"
                >
                  {/* Portrait Photo Container */}
                  <div className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-slate-100 mb-2.5 sm:mb-3">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={m.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#DE5C2B] to-[#EAB308] text-white font-black text-2xl sm:text-3xl flex items-center justify-center">
                        {m.name?.charAt(0) || 'M'}
                      </div>
                    )}

                    {/* Country Flag Badge (Top-Left) */}
                    {flagCode && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-800 border border-black/5 shadow-2xs">
                        <img
                          src={`https://flagcdn.com/w40/${flagCode}.png`}
                          alt={m.country}
                          className="w-3.5 h-2.5 rounded-2xs object-cover"
                        />
                        <span className="leading-none">{m.country}</span>
                      </div>
                    )}

                    {/* Verified Blue Checkmark (Bottom-Right) */}
                    <div
                      className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#DE5C2B] text-white flex items-center justify-center shadow-md ring-2 ring-white"
                      title="100% Verified Senior"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Mentor Details Below Photo */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Mentor Name */}
                      <h3 className="font-outfit font-black text-[14px] sm:text-[15px] text-slate-900 group-hover:text-[#DE5C2B] transition-colors truncate leading-snug">
                        {m.name}
                      </h3>

                      {/* Mentor Tagline / Role (Reference: "Your Europe Move Mentor") */}
                      <p className="text-[11.5px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
                        {m.headline}
                      </p>

                    </div>

                    {/* Bottom Pricing & CTA Strip */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block leading-none">
                          Sessions from
                        </span>
                        <div className="font-outfit text-xs sm:text-[13px] font-black text-slate-900 leading-tight mt-0.5">
                          {m.startingPriceINR > 0 ? `₹${m.startingPriceINR}` : 'Free'}
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#111111] group-hover:bg-[#DE5C2B] text-white text-[11px] font-bold transition-all shadow-2xs">
                        <span>View Sessions</span>
                        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </section>


      {/* ════════ SECTION 4: STUDENT TESTIMONIALS ════════ */}
      <StudentTestimonialSection />

      {/* ════════ SECTION 5: BECOME A MENTOR CTA (BOTTOM) ════════ */}
      <BecomeMentorCTA />

    </div>
  );
};

export default UnicoachMarketplacePage;
