import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useScrollToHash } from '../hooks/useScrollToHash';
import { StudentHeroSection } from '../components/StudentHeroSection';
import { HowItWorksSteps } from '../components/HowItWorksSteps';
import { StudentFlashSection } from '../components/StudentFlashSection';
import { StudentTestimonialSection } from '../components/StudentTestimonialSection';
import { BecomeMentorCTA } from '../components/BecomeMentorCTA';
import { MentorDirectoryCard } from '../components/MentorDirectoryCard';
import { getPublicMentorsDirectory } from '../api/unicoachApi';
import { FEATURED_MENTORS } from '../utils/mentorDirectory';
import { Search, ArrowRight } from 'lucide-react';
import '../../components/desi/desi.css';

import CapIcon from '../../components/ui/CapIcon';
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
    <div className="min-h-screen bg-[#FFF6E5] text-slate-900">
      {/* ════════ SECTION 1: STUDENT-FIRST HERO ════════ */}
      <StudentHeroSection />

      {/* ════════ SECTION 2: "HOW IT WORKS" (students / mentors), then the 3-step interactive demo ════════ */}
      <HowItWorksSteps />
      <StudentFlashSection />

      {/* ════════ SECTION 3: TOP MENTORS PREVIEW (full list lives at /unicoach/mentors) ════════ */}
      <section id="mentors-grid" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 relative z-20 scroll-mt-20">

        {/* Section Headline */}
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-8">
          <p className="font-urbanist font-extrabold text-[16px] text-[#D0362E]">Gyaan bhi, guidance bhi, seniors wali <CapIcon /></p>
          <h2 className="mt-1.5 font-urbanist text-[34px] sm:text-[44px] lg:text-[52px] font-black text-[#16130F] tracking-[-0.04em] leading-tight mb-3">
            Meet Our Top Mentors
          </h2>
          <p className="text-[#3D3830] text-[15px] sm:text-[17px] font-medium max-w-xl mx-auto leading-relaxed">
            Verified seniors ranked by student ratings and reviews.
          </p>
        </div>

        {/* ════════ SEARCH BAR (opens the full directory) ════════ */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-[18px] h-[18px] text-[#16130F]" />
            </div>
            <input
              type="search"
              placeholder="Search by mentor name, university, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search mentors"
              className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-full bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] text-[14px] sm:text-[15px] font-medium text-[#16130F] placeholder:text-[#8A8275] focus:outline-none focus:ring-4 focus:ring-[#F2B705]/50 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] border-2 border-[#16130F] text-white text-[13px] font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* ════════ TOP MENTORS GRID ════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 max-w-[1000px] mx-auto gap-3.5 sm:gap-4.5 lg:gap-5">
          {previewMentors.map((m, i) => (
            <MentorDirectoryCard key={m._id} mentor={m} index={i} />
          ))}
        </div>

        {/* ════════ SEE ALL ════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <Link
            to="/unicoach/mentors"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#16130F] text-white text-[15px] font-bold border-[3px] border-[#16130F] shadow-[5px_5px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform"
          >
            See all {allMentorsCount > PREVIEW_COUNT ? `${allMentorsCount} ` : ''}mentors
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/unicoach/apply"
            className="px-6 py-3.5 rounded-full bg-[#F2B705] text-[#16130F] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] text-[15px] font-bold hover:-translate-y-0.5 transition-transform"
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
