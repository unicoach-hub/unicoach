import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, CheckCircle2, Star, GraduationCap, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onOpenModal: (serviceTitle?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenModal }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightBadgesRef = useRef<HTMLDivElement>(null);

  const features = [
    'End-to-end Guidance & Personal Counselors',
    'Guaranteed Scholarships & Financial Support',
    '100% Free Counseling with Certified Experts',
    'Pre-Approved Low Interest Student Loans',
  ];

  const floatingBadges = [
    {
      icon: <GraduationCap className="w-5 h-5 text-amber-500" />,
      title: 'Full Scholarship Granted',
      sub: 'Northeastern University • $45,000',
      pos: 'top-[12%] right-[5%] md:right-[10%]',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      title: 'Visa Approved in 3 Days',
      sub: '99% Embassy Success Rate',
      pos: 'bottom-[25%] right-[2%] md:right-[6%]',
    },
    {
      icon: <Star className="w-5 h-5 text-indigo-500 fill-indigo-500" />,
      title: '4.9 / 5.0 Rating',
      sub: '15,000+ Verified Alumni Reviews',
      pos: 'bottom-[5%] left-[5%] md:left-[12%]',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // GSAP ScrollTrigger 3D Parallax Depth on Scroll
      if (leftContentRef.current && sectionRef.current) {
        gsap.to(leftContentRef.current, {
          y: 80,
          opacity: 0.7,
          scale: 0.96,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (rightBadgesRef.current && sectionRef.current) {
        gsap.to(rightBadgesRef.current, {
          y: -40,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // GSAP 3D Card Hover Tilt Effect
  const handleBadgeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(card, {
      rotateY: x * 0.15,
      rotateX: -y * 0.15,
      scale: 1.08,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleBadgeMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="relative min-h-[92vh] flex items-center bg-gradient-to-b from-[#f8fafc] via-[#eef2ff]/60 to-[#ffffff] pt-28 pb-16 overflow-hidden perspective-[1000px]"
    >
      {/* Background glow accents */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(99,102,241,0.15)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(99,102,241,0.15)_1.5px,transparent_1.5px)] bg-[size:32px_32px] pointer-events-none z-0" />

      <div className="max-w-[1360px] mx-auto px-6 md:px-10 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Content Column — GSAP Scroll Parallax */}
          <div ref={leftContentRef} className="lg:col-span-7 max-w-2xl transform-gpu">
            {/* Category Tag */}
            <div className="inline-flex items-center gap-2 text-white px-4.5 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-md border mb-6 select-none"
              style={{ background: 'linear-gradient(135deg, #0a1a4a 0%, #1e3a8a 100%)', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <Sparkles size={13} className="text-amber-400 fill-amber-400 animate-pulse" />
              <span>Global Admissions Consultants</span>
            </div>

            {/* Title Header */}
            <h1 className="text-4xl md:text-5xl lg:text-[3.6rem] font-black text-slate-900 leading-[1.1] mb-5 tracking-tight">
              Your{' '}
              <span className="bg-gradient-to-r from-[#2563eb] via-[#f26522] to-[#2563eb] bg-clip-text text-transparent">
                Global Future
              </span>
              <br />
              Starts Here
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base md:text-[17px] leading-relaxed max-w-xl mb-7 font-medium">
              Achieve your target SAT / IELTS / TOEFL scores and secure guaranteed admissions & scholarships at top-tier international universities with our expert, end-to-end guidance.
            </p>

            {/* Feature List */}
            <div className="space-y-3 mb-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 text-slate-800 font-bold hover:text-indigo-600 transition-colors group cursor-default"
                >
                  <span className="flex items-center justify-center w-5.5 h-5.5 bg-indigo-500/10 text-indigo-600 rounded-full border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
                    <CheckCircle2 size={13} className="stroke-[3]" />
                  </span>
                  <span className="text-[15px] tracking-wide">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 w-full">
              <button
                onClick={() => onOpenModal('Free Counseling')}
                className="w-full sm:w-auto px-7 py-3.5 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #f26522 0%, #ea580c 100%)' }}
              >
                <span>GET FREE COUNSELING</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => onOpenModal('Talk to Expert')}
                className="w-full sm:w-auto px-7 py-3.5 bg-white text-slate-800 font-extrabold text-sm rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>TALK TO EXPERT</span>
              </button>
            </div>
          </div>

          {/* Right Column: GSAP 3D Floating Tilt Badges */}
          <div ref={rightBadgesRef} className="lg:col-span-5 relative h-[400px] md:h-[480px] perspective-[1000px] transform-gpu">
            {/* Floating GSAP Interactive Badges */}
            {floatingBadges.map((badge, idx) => (
              <div
                key={idx}
                onMouseMove={handleBadgeMouseMove}
                onMouseLeave={handleBadgeMouseLeave}
                className={`absolute ${badge.pos} z-30 hidden sm:flex items-center gap-3.5 bg-white/85 backdrop-blur-xl border border-white/70 p-3.5 pr-5 rounded-2xl shadow-xl shadow-slate-900/10 pointer-events-auto cursor-pointer transform-gpu`}
                onClick={() => onOpenModal(badge.title)}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center flex-shrink-0 shadow-inner">
                  {badge.icon}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 tracking-tight">{badge.title}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
