import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Users, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const COHORTS = [
  {
    id: 1,
    title: 'AI Product Builder Roadmap 2026',
    subtitle: 'IIM + IIT PMs who turn rejections into offers.',
    statsTag: '3,800+ mentored',
    durationTag: '12-week live cohort',
    authorName: 'Shailesh Sharma',
    authorRole: 'TechnoManagers Founder',
    authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    brandLogoText: 'TechnoManagers',
    link: '/unicoach/apply'
  },
  {
    id: 2,
    title: 'Building AI Agents in Enterprise',
    subtitle: 'The AI teacher engineers keep coming back to.',
    statsTag: '22K+ bookings',
    durationTag: '6-week live cohort',
    authorName: 'Ajay Shenoy',
    authorRole: 'Senior AI Architect',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    brandLogoText: 'Agentic AI Lab',
    link: '/unicoach/apply'
  },
  {
    id: 3,
    title: 'Antern Data Science Sprint',
    subtitle: 'The AI career roadmap MIT itself recommended.',
    statsTag: '17K followers',
    durationTag: '~8-week sprint',
    authorName: 'Ayush Singh',
    authorRole: 'Data Scientist & Educator',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    brandLogoText: 'Antern Labs',
    link: '/unicoach/apply'
  },
  {
    id: 4,
    title: 'Masters in Germany Admit Sprint',
    subtitle: 'TU Munich & RWTH Aachen seniors who turn rejections into admits.',
    statsTag: '1,450+ admits',
    durationTag: '4-week live sprint',
    authorName: 'Tanisha Verma',
    authorRole: 'TU Munich M.Sc. Scholar',
    authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    brandLogoText: 'TU Munich Alumni',
    link: '/unicoach/apply'
  },
  {
    id: 5,
    title: 'System Design for Tier-1 Tech',
    subtitle: 'How to crack high-concurrency L5/L6 staff architecture rounds.',
    statsTag: '9,200+ mentored',
    durationTag: '8-week live cohort',
    authorName: 'Hardik Patel',
    authorRole: 'Ex-Amazon Principal',
    authorImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&auto=format&fit=crop&q=80',
    brandLogoText: 'SystemMasters',
    link: '/unicoach/apply'
  }
];

export const CohortSection = () => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section className="bg-[#DE5C2B] text-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden select-none">
      
      {/* Background radial warmth */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Row with Title + Navigation Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          
          <div className="max-w-2xl text-left">
            <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
              See what the best creators build on UniCoach
            </h2>
            <p className="text-white/85 text-sm sm:text-base lg:text-lg font-normal">
              Live cohorts and 1:1 programs, run by creators who&apos;ve actually done it.
            </p>
          </div>

          {/* Left / Right Carousel Buttons */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                canScrollLeft
                  ? 'bg-white text-black hover:bg-slate-100 shadow-md'
                  : 'bg-white/30 text-white/50 cursor-not-allowed'
              }`}
              aria-label="Previous cohorts"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                canScrollRight
                  ? 'bg-white text-black hover:bg-slate-100 shadow-md'
                  : 'bg-white/30 text-white/50 cursor-not-allowed'
              }`}
              aria-label="Next cohorts"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

        </div>

        {/* Horizontal Scrollable Carousel of Sleek Black Cards */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
        >
          {COHORTS.map((cohort) => (
            <motion.div
              key={cohort.id}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="flex-shrink-0 w-[300px] sm:w-[340px] lg:w-[360px] snap-start bg-[#121212] rounded-[28px] p-6 sm:p-7 border border-white/10 flex flex-col justify-between text-left shadow-2xl relative overflow-hidden group"
            >
              {/* Subtle top dot grid highlight */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-bl-full pointer-events-none" />

              <div>
                {/* Cohort Title */}
                <h3 className="font-outfit text-xl sm:text-2xl font-black text-white leading-tight mb-2.5">
                  {cohort.title}
                </h3>

                {/* Cohort Pitch */}
                <p className="text-white/60 text-xs sm:text-[13px] leading-relaxed mb-6 font-normal min-h-[38px]">
                  {cohort.subtitle}
                </p>

                {/* Tags Row */}
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  <span className="bg-white/10 text-white/90 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/10">
                    {cohort.statsTag}
                  </span>
                  <span className="bg-white/10 text-white/90 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/10">
                    {cohort.durationTag}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Mentor Avatar & View Cohort Link */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={cohort.authorImage}
                    alt={cohort.authorName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white/20"
                  />
                  <div>
                    <div className="font-outfit text-sm font-bold text-white leading-snug">
                      {cohort.authorName}
                    </div>
                    <div className="text-[10.5px] text-white/50 font-medium">
                      {cohort.brandLogoText}
                    </div>
                  </div>
                </div>

                <Link
                  to={cohort.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-orange-300 transition-colors cursor-pointer group-hover:translate-x-1 duration-200"
                >
                  <span>View cohort</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </motion.div>
          ))}
        </div>

      </div>

    </section>
  );
};
