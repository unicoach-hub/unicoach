// ════════════════════════════════════════════════════════════════════════════════
// MentorLandingPage.jsx — /unicoach/for-mentors
// Dedicated mentor onboarding page. Reuses original mentor-version components.
// ════════════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MentorHeroSection } from '../components/MentorHeroSection';
import { CohortSection } from '../components/CohortSection';
import { MentorFlashSection } from '../components/MentorFlashSection';
import { MentorDashboardPreview } from '../components/MentorDashboardPreview';
import { UnicoachFeatureBentoGrid } from '../components/UnicoachFeatureBentoGrid';
import { ZeroFeeBanner } from '../components/ZeroFeeBanner';
import { MentorTestimonialSection } from '../components/MentorTestimonialSection';
import { Sparkles } from 'lucide-react';

const MentorLandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 selection:bg-[#DE5C2B]/20">
      
      {/* ════════ SECTION 1: MENTOR HERO (Original Creator Storefront) ════════ */}
      <MentorHeroSection />

      {/* ════════ SECTION 2: COHORTS WALL (Mentor Programs) ════════ */}
      <CohortSection />

      {/* ════════ SECTION 3: CREATE IN A FLASH (Mentor Setup Guide) ════════ */}
      <MentorFlashSection />

      {/* ════════ SECTION 3B: DASHBOARD PREVIEW (what mentors get after joining) ════════ */}
      <MentorDashboardPreview />

      {/* ════════ SECTION 4: 6-PILLAR CREATOR BENTO GRAPHICS ════════ */}
      <section id="mentor-features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-white border-b border-slate-100">
        <div className="max-w-[1340px] mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-[#DE5C2B] text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#DE5C2B]" />
            <span>BUILT FOR CONVERSION</span>
          </div>
          <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight leading-tight">
            Infrastructure to scale your earnings
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-normal max-w-xl mx-auto mt-2">
            Features engineered to double your conversion rate and eliminate checkout drop-offs.
          </p>
        </div>
        <UnicoachFeatureBentoGrid />
      </section>

      {/* ════════ SECTION 5: 0% PLATFORM FEE COMMITMENT ════════ */}
      <ZeroFeeBanner />

      {/* ════════ SECTION 6: MENTOR TESTIMONIALS ════════ */}
      <MentorTestimonialSection />

      {/* ════════ SECTION 7: FINAL CTA ════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-[#FAF9F6] select-none">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight leading-tight mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-normal max-w-lg mx-auto mb-8">
            Create your public storefront in under 2 minutes. Set your services, connect your calendar, and start accepting bookings today.
          </p>
          <Link
            to="/unicoach/apply"
            className="group inline-flex items-center gap-4 bg-[#111111] hover:bg-black text-white pl-8 pr-4 py-4 rounded-full font-bold text-base sm:text-lg shadow-[0_12px_28px_-6px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.35)] transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Start My Page — It&apos;s Free</span>
            <span className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:translate-x-1">
              <ArrowRight className="w-4.5 h-4.5 text-black stroke-[2.5]" />
            </span>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default MentorLandingPage;
