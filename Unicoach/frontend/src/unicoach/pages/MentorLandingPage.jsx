// ════════════════════════════════════════════════════════════════════════════════
// MentorLandingPage.jsx — /unicoach/for-mentors
// Dedicated mentor onboarding page. Reuses original mentor-version components.
// Desi Pop: flat poster colours per section, sections meet without rules between them.
// ════════════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MentorHeroSection } from '../components/MentorHeroSection';
import { CohortSection } from '../components/CohortSection';
import { MentorPeersSection } from '../components/MentorPeersSection';
import { MentorFlashSection } from '../components/MentorFlashSection';
import { MentorDashboardPreview } from '../components/MentorDashboardPreview';
import { UnicoachFeatureBentoGrid } from '../components/UnicoachFeatureBentoGrid';
import { ZeroFeeBanner } from '../components/ZeroFeeBanner';
import { MentorTestimonialSection } from '../components/MentorTestimonialSection';
import { StationSign } from '../../components/desi/DesiKit';

const MentorLandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FFF6E5] text-[#16130F]">
      
      {/* ════════ SECTION 1: MENTOR HERO (Original Creator Storefront) ════════ */}
      <MentorHeroSection />

      {/* ════════ SECTION 1B: MENTORS ALREADY HERE ════════ */}
      <MentorPeersSection />

      {/* ════════ SECTION 2: COHORTS WALL (Mentor Programs) ════════ */}
      <CohortSection />

      {/* ════════ SECTION 3: CREATE IN A FLASH (Mentor Setup Guide) ════════ */}
      <MentorFlashSection />

      {/* ════════ SECTION 3B: DASHBOARD PREVIEW (what mentors get after joining) ════════ */}
      <MentorDashboardPreview />

      {/* ════════ SECTION 4: 6-PILLAR CREATOR BENTO GRAPHICS ════════ */}
      <section id="mentor-features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-[1340px] mx-auto text-center mb-12">
          <p className="font-urbanist font-extrabold text-[16px] leading-none text-[#D0362E]">Sab kuch ek jagah</p>
          <p className="mt-2 text-[13px] font-extrabold uppercase tracking-[0.1em] text-[#5B544A]">Built for conversion</p>
          <h2 className="mt-2 font-urbanist text-[32px] sm:text-[44px] lg:text-[52px] font-black text-[#16130F] tracking-[-0.04em] leading-[1.04]">
            Infrastructure to scale your earnings
          </h2>
          <p className="text-[#3D3830] text-[15.5px] sm:text-[17px] font-medium leading-relaxed max-w-xl mx-auto mt-3">
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
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-[#F2B705] overflow-hidden select-none">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,19,15,.09)_1.3px,transparent_1.7px)] [background-size:12px_12px] pointer-events-none" />
        <div className="relative max-w-[800px] mx-auto text-center">
          <StationSign hi="Chalo, shuru karein" en="START TODAY" className="-rotate-2 mb-6" />
          <h2 className="font-urbanist text-[34px] sm:text-[48px] lg:text-[56px] font-black text-[#16130F] tracking-[-0.045em] leading-[1] mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-[#2A251E] text-[16px] sm:text-[18px] font-medium leading-relaxed max-w-lg mx-auto mb-8">
            Create your public storefront in under 2 minutes. Set your services, connect your calendar, and start accepting bookings today.
          </p>
          <Link
            to="/unicoach/apply"
            className="group inline-flex items-center gap-3 sm:gap-4 bg-[#16130F] text-white pl-6 sm:pl-8 pr-3 sm:pr-4 py-3 sm:py-3.5 rounded-full font-bold text-[16px] sm:text-lg border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            <span>Start My Page — It&apos;s Free</span>
            <span className="w-10 h-10 rounded-full bg-white text-[#16130F] flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1">
              <ArrowRight className="w-4.5 h-4.5" strokeWidth={3} />
            </span>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default MentorLandingPage;
