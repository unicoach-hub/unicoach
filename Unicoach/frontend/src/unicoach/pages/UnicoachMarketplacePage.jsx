import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useScrollToHash } from '../hooks/useScrollToHash';
import { StudentHeroSection } from '../components/StudentHeroSection';
import { StudentFlashSection } from '../components/StudentFlashSection';
import { StudentTestimonialSection } from '../components/StudentTestimonialSection';
import { BecomeMentorCTA } from '../components/BecomeMentorCTA';
import { MentorDirectoryCard } from '../components/MentorDirectoryCard';
import { getPublicMentorsDirectory } from '../api/unicoachApi';
import { FEATURED_MENTORS } from '../utils/mentorDirectory';
import { Search, ArrowRight } from 'lucide-react';

// How many mentors the landing page shows before "See all mentors"
const PREVIEW_COUNT = 6;

const UnicoachMarketplacePage = () => {
  // /unicoach#mentors-grid (e.g. the homepage "Mentors" card) opens straight at the mentor directory
  useScrollToHash('mentors-grid');
  const navigate = useNavigate();

  const [topMentors, setTopMentors] = useState([]);
  const [totalMentors, setTotalMentors] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getPublicMentorsDirectory({ sort: 'top_rated', limit: PREVIEW_COUNT }, { signal: controller.signal })
      .then((data) => {
        setTopMentors(data.mentors || []);
        setTotalMentors(data.total || 0);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Failed to load top mentors:', err);
      });
    return () => controller.abort();
  }, []);

  // Featured team mentors stay pinned first, then the highest-ranked database mentors
  const previewMentors = [...FEATURED_MENTORS, ...topMentors].slice(0, PREVIEW_COUNT);
  const allMentorsCount = FEATURED_MENTORS.length + totalMentors;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/unicoach/mentors?search=${encodeURIComponent(q)}` : '/unicoach/mentors');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-[#DE5C2B]/20">
      {/* ════════ SECTION 1: STUDENT-FIRST HERO ════════ */}
      <StudentHeroSection />

      {/* ════════ SECTION 2: "HOW IT WORKS" FOR STUDENTS ════════ */}
      <StudentFlashSection />

      {/* ════════ SECTION 3: TOP MENTORS PREVIEW (full list lives at /unicoach/mentors) ════════ */}
      <section id="mentors-grid" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 relative z-20 scroll-mt-20">

        {/* Section Headline */}
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-8">
          <h2 className="font-outfit text-3xl sm:text-4xl lg:text-[44px] font-black text-[#111111] tracking-tight leading-tight mb-3">
            Meet Our Top Mentors
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
            Verified seniors ranked by student ratings and reviews.
          </p>
        </div>

        {/* ════════ SEARCH BAR (opens the full directory) ════════ */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-4.5 h-4.5 text-slate-400" />
            </div>
            <input
              type="search"
              placeholder="Search by mentor name, university, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search mentors"
              className="w-full pl-12 pr-28 py-3 sm:py-3.5 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#DE5C2B] transition-all shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 sm:py-2 rounded-full bg-[#111111] hover:bg-[#DE5C2B] text-white text-[11px] sm:text-xs font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* ════════ TOP MENTORS GRID ════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 max-w-[1000px] mx-auto gap-3.5 sm:gap-4.5 lg:gap-5">
          {previewMentors.map((m) => (
            <MentorDirectoryCard key={m._id} mentor={m} />
          ))}
        </div>

        {/* ════════ SEE ALL ════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <Link
            to="/unicoach/mentors"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] hover:bg-[#DE5C2B] text-white text-sm font-bold transition-colors shadow-sm"
          >
            See all {allMentorsCount > PREVIEW_COUNT ? `${allMentorsCount} ` : ''}mentors
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/unicoach/apply"
            className="px-5 py-3 rounded-full bg-orange-50 text-[#DE5C2B] border border-orange-200 text-sm font-bold hover:bg-orange-100 transition-all"
          >
            Become a mentor
          </Link>
        </div>

      </section>


      {/* ════════ SECTION 4: STUDENT TESTIMONIALS ════════ */}
      <StudentTestimonialSection />

      {/* ════════ SECTION 5: BECOME A MENTOR CTA (BOTTOM) ════════ */}
      <BecomeMentorCTA />

    </div>
  );
};

export default UnicoachMarketplacePage;
