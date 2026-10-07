import React from 'react';
import { Calendar, Clock, User, ArrowUpRight, Sparkles, Star, Trophy, Users, Video } from 'lucide-react';
import { useLead } from '../context/LeadContext';
import { PillButton } from './ui/PillButton';

export const GlobalNetwork = ({ onOpenModal }) => {
  const { openEligibilityModal } = useLead();
  const handleOpen = onOpenModal || (() => openEligibilityModal('Global Network Webinar'));
  const metrics = [
    {
      value: '300k+',
      label: 'Attendees',
      color: 'text-[#0F172A]',
      iconColor: 'text-[#DE5C2B]',
      iconBg: 'bg-orange-50 text-[#DE5C2B] border-orange-100/80',
      border: 'border-slate-100 hover:border-orange-200',
      bg: 'bg-white',
      icon: Users,
    },
    {
      value: '500+',
      label: 'Events Organized',
      color: 'text-[#0F172A]',
      iconColor: 'text-[#DE5C2B]',
      iconBg: 'bg-orange-50 text-[#DE5C2B] border-orange-100/80',
      border: 'border-slate-100 hover:border-orange-200',
      bg: 'bg-white',
      icon: Video,
    },
    {
      value: '4.8/5',
      label: 'Student Rating',
      color: 'text-[#0F172A]',
      iconColor: 'text-[#DE5C2B]',
      iconBg: 'bg-orange-50 text-[#DE5C2B] border-orange-100/80',
      border: 'border-slate-100 hover:border-orange-200',
      bg: 'bg-white',
      icon: Star,
    },
    {
      value: '#1',
      label: 'In Study Abroad',
      color: 'text-[#0F172A]',
      iconColor: 'text-[#DE5C2B]',
      iconBg: 'bg-orange-50 text-[#DE5C2B] border-orange-100/80',
      border: 'border-slate-100 hover:border-orange-200',
      bg: 'bg-white',
      icon: Trophy,
    },
  ];

  return (
    <section id="network" className="py-12 sm:py-16 bg-[#F8FAFC] relative overflow-hidden">
      
      {/* ── Soothing Sky Blue & Lavender Watercolor Wash ── */}
      <div className="absolute inset-0 pointer-events-none -z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[650px] h-[550px] bg-radial from-[#DBEAFE]/85 via-[#E0E7FF]/50 to-transparent rounded-full blur-[80px]" />
        <div className="absolute top-[20%] right-[-5%] w-[600px] h-[450px] bg-radial from-[#BAE6FD]/45 via-[#E0F2FE]/40 to-transparent rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[400px] bg-radial from-[#E0F2FE]/80 to-transparent rounded-full blur-[90px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* ════════ HEADER WITH WATERMARK '02' ════════ */}
        <div className="relative mb-6 sm:mb-8 max-w-[700px]">
          {/* Watermark '02' */}
          <div className="font-urbanist text-[90px] sm:text-[115px] font-black text-slate-300/85 leading-none select-none tracking-tighter mb-[-35px] sm:mb-[-45px] -ml-1">
            02
          </div>

          <h2 className="font-outfit text-[32px] sm:text-[38px] lg:text-[42px] font-black text-[#0F172A] leading-[1.08] tracking-tight relative z-10">
            Join Our Global Network
          </h2>

          <p className="text-[13px] sm:text-[14px] text-slate-500 leading-relaxed mt-2.5 font-normal">
            Meet our top experts & university reps
          </p>
        </div>

        {/* ════════ MAIN CONTENT: SOOTHING BLUISH EVENT CARD + METRICS ════════ */}
        <div className="grid lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          
          {/* ──── LEFT / MAIN: FEATURED EVENT CARD (Soothing Ice-Blue Glass) ──── */}
          <div className="lg:col-span-7 xl:col-span-7.5">
            <div className="relative rounded-[28px] bg-gradient-to-br from-[#EFF6FF] via-[#F0F7FF] to-[#E0EFFF] border border-orange-200/90 p-6 sm:p-8 lg:p-9 shadow-lg shadow-blue-900/[0.04] h-full flex flex-col justify-between overflow-hidden group hover:shadow-xl hover:border-blue-300 transition-all duration-300">
              
              {/* Soft Ambient Radial Corner Light */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-blue-400/15 via-indigo-300/10 to-transparent rounded-tr-[28px] pointer-events-none" />

              <div className="relative z-10">
                {/* Featured Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DE5C2B] text-white text-[11.5px] font-bold tracking-wide shadow-sm shadow-orange-500/20 mb-5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Featured Event</span>
                </div>

                {/* Event Headline - Deep Soothing Midnight Slate */}
                <h3 className="font-outfit text-[22px] sm:text-[25px] lg:text-[27px] font-black text-[#0F172A] leading-[1.2] tracking-tight group-hover:text-blue-900 transition-colors">
                  Study in Germany 2027: Complete Roadmap from University Selection to Admission
                </h3>

                {/* Event Metadata Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
                  {/* Date */}
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/90 border border-orange-100 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/70 text-[#DE5C2B] flex items-center justify-center shrink-0">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[10.5px] text-slate-400 font-medium block">Date</span>
                      <span className="text-[13px] font-bold text-slate-800">JUL 7, 2026</span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/90 border border-orange-100 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[10.5px] text-slate-400 font-medium block">Time</span>
                      <span className="text-[13px] font-bold text-slate-800">01:25 PM - 03:25 PM</span>
                    </div>
                  </div>
                </div>

                {/* Keynote Speaker Box */}
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white/95 border border-orange-100 mt-3.5 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-[#DE5C2B] text-white flex items-center justify-center shrink-0 shadow-md font-bold text-[14px]">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10.5px] text-[#DE5C2B] font-bold uppercase tracking-wider block">Keynote Speaker</span>
                    <h4 className="text-[13.5px] font-bold text-slate-900 leading-tight">
                      Joshua Vasudevan <span className="text-[12px] font-normal text-slate-500">(PhD Researcher, UK)</span>
                    </h4>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="relative z-10 mt-8 pt-5 border-t border-orange-100/80 flex items-center justify-between">
                <PillButton
                  variant="blue"
                  size="md"
                  onClick={handleOpen}
                  icon={ArrowUpRight}
                >
                  Register Now For Free
                </PillButton>
                
                <span className="hidden sm:inline text-[12px] text-emerald-700 font-semibold bg-emerald-100/70 px-3.5 py-1.5 rounded-full border border-emerald-200">
                  ● Free Online Access
                </span>
              </div>

            </div>
          </div>

          {/* ──── RIGHT: 4 STATS GRID (Soft Soothing Tinted Cards) ──── */}
          <div className="lg:col-span-5 xl:col-span-4.5">
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4 h-full">
              {metrics.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-[24px] ${item.bg} p-5 sm:p-5.5 border ${item.border} shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                  >
                    {/* Top Icon Circle */}
                    <div className={`w-10 h-10 rounded-full ${item.iconBg} border flex items-center justify-center mb-3 shadow-xs`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    {/* Stat Number & Label */}
                    <div>
                      <div className={`font-urbanist text-[26px] sm:text-[28px] font-extrabold ${item.color} leading-none tracking-tight`}>
                        {item.value}
                      </div>
                      <div className="text-[11.5px] sm:text-[12px] text-slate-600 font-medium leading-tight mt-2">
                        {item.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default GlobalNetwork;
