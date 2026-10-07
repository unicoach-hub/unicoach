import React, { useEffect } from 'react';
import ScholarshipShortlister from '../components/ScholarshipShortlister';
import { Award, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import Interactive3DGrid from '../components/Interactive3DGrid';
import { HeroBackButton } from '../components/ui/BackButton';

const ScholarshipsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Global Scholarships & Live Deadline Tracker | UniCoach';
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-[76px] pb-20">
      {/* Clean LeapScholar/AdmitKard-Style Hero Section with depth & contrast */}
      <section className="relative pt-12 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E9F1FE] via-[#F3F6FD] to-[#F1F5F9] border-b border-slate-200/80 overflow-hidden">
        <HeroBackButton />
        {/* Interactive 3D Background Grid */}
        <Interactive3DGrid gridSize={56} />
        
        {/* Soft Ambient Sky Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-radial from-orange-200/40/50 via-indigo-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white text-[#DE5C2B] border border-orange-200/80 shadow-xs">
            <Award size={14} className="text-[#DE5C2B]" />
            <span>100% Verified Merit, Need-Based & Government Grants</span>
          </div>

          {/* Heading */}
          <h1 className="font-outfit text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-[#0F172A] leading-tight">
            Study Abroad Scholarships &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D]">Live Deadline Tracker</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[14px] sm:text-[15.5px] text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Discover thousands of international scholarships with real-time countdown clocks, match fit scoring, eligibility verification, and 1-click Google Calendar sync.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5 bg-white/95 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs backdrop-blur-xs">
              <Clock size={13} className="text-[#DE5C2B]" /> Live Cutoff Countdown Clocks
            </span>
            <span className="flex items-center gap-1.5 bg-white/95 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs backdrop-blur-xs">
              <Calendar size={13} className="text-[#DE5C2B]" /> 1-Click Google Calendar Sync
            </span>
            <span className="flex items-center gap-1.5 bg-white/95 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs backdrop-blur-xs">
              <CheckCircle2 size={13} className="text-emerald-600" /> Safe / Target / Reach Probability
            </span>
          </div>
        </div>
      </section>

      {/* Main Tool Container - floating slightly over hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20">
        <ScholarshipShortlister />
      </main>
    </div>
  );
};

export default ScholarshipsPage;
