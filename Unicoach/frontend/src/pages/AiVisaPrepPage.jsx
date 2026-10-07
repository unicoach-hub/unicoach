import React, { useEffect } from 'react';
import AiVisaInterviewPrep from '../components/AiVisaInterviewPrep';
import { Sparkles, ShieldCheck, CheckCircle2, Mic, Globe } from 'lucide-react';
import Interactive3DGrid from '../components/Interactive3DGrid';
import { HeroBackButton } from '../components/ui/BackButton';

const AiVisaPrepPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI Mock Visa Interview Simulator & Prep | UniCoach';
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-[76px] pb-20">
      {/* Clean LeapScholar-Style Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFF4EC] via-[#FAF9F6] to-[#F1F5F9] border-b border-slate-200/80 overflow-hidden">
        <HeroBackButton />
        {/* Interactive 3D Background Grid */}
        <Interactive3DGrid gridSize={56} />
        
        {/* Soft Ambient Sky Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-radial from-orange-200/40 via-orange-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white text-[#DE5C2B] border border-orange-200/80 shadow-xs">
            <Mic size={14} className="text-[#DE5C2B]" />
            <span>Real-time Consular Officer Simulation</span>
          </div>

          <h1 className="font-outfit text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-[#0F172A] leading-tight">
            AI Mock Visa Officer{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D]">Interview Simulator</span>
          </h1>

          <p className="text-[14px] sm:text-[15.5px] text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Practice tough US F-1, UK Student Visa, Canada Study Permit, and German Embassy visa questions with instant AI confidence scoring and response feedback.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5 bg-white/95 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs backdrop-blur-xs">
              <ShieldCheck size={13} className="text-emerald-600" /> USA, UK, Canada & Germany Spec
            </span>
            <span className="flex items-center gap-1.5 bg-white/95 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs backdrop-blur-xs">
              <CheckCircle2 size={13} className="text-[#DE5C2B]" /> Instant Confidence & 214(b) Risk Analysis
            </span>
            <span className="flex items-center gap-1.5 bg-white/95 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs backdrop-blur-xs">
              <Globe size={13} className="text-[#DE5C2B]" /> Realistic Visa Officer Scenarios
            </span>
          </div>
        </div>
      </section>

      {/* Main Visa Tool */}
      <main className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20">
        <AiVisaInterviewPrep />
      </main>
    </div>
  );
};

export default AiVisaPrepPage;
