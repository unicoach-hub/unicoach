import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Award, ShieldCheck, GraduationCap, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// STUNNING GSAP SCROLLTRIGGER SHOWCASE
// - Dual Kinetic Marquee text moving in opposite directions on scroll scrub
// - GSAP 3D perspective card entrance with stagger & glow
// - Physics-based cursor spotlight follower using GSAP quickTo
// ==========================================

interface GsapShowcaseSectionProps {
  onOpenModal?: (title?: string) => void;
}

export const GsapShowcaseSection: React.FC<GsapShowcaseSectionProps> = ({ onOpenModal }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const marquee1Ref = useRef<HTMLDivElement>(null);
  const marquee2Ref = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Dual Kinetic Marquee Scroll Scrub
      if (marquee1Ref.current && marquee2Ref.current && sectionRef.current) {
        gsap.to(marquee1Ref.current, {
          xPercent: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });

        gsap.to(marquee2Ref.current, {
          xPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }

      // 2. GSAP Staggered 3D Card Entrance
      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 80,
            rotateX: 25,
            scale: 0.88,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              end: 'top 40%',
              scrub: 0.8,
            },
          }
        );
      }
    }, sectionRef);

    // 3. GSAP Mouse Spotlight Trail
    const xTo = gsap.quickTo(spotlightRef.current, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(spotlightRef.current, 'y', { duration: 0.6, ease: 'power3' });

    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current || !spotlightRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      xTo(e.clientX - rect.left - 250);
      yTo(e.clientY - rect.top - 250);
    };

    const sectionEl = sectionRef.current;
    if (sectionEl) {
      sectionEl.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      ctx.revert();
      if (sectionEl) {
        sectionEl.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 md:py-36 overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg, #070d1e 0%, #0a1a4a 50%, #060b18 100%)' }}
    >
      {/* GSAP Cursor Spotlight */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-500/[0.12] blur-[120px] pointer-events-none z-0"
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.15)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.15)_1.5px,transparent_1.5px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* GSAP Kinetic Marquee Row 1 (Moving Left on Scroll) */}
      <div className="mb-6 overflow-hidden whitespace-nowrap opacity-25 pointer-events-none">
        <div ref={marquee1Ref} className="inline-block text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase font-instrument">
          STUDY ABROAD • GUARANTEED SCHOLARSHIPS • VISA APPROVED • TOP 500 UNIVERSITIES • UNICOACH ADVISORY •
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1340px] mx-auto px-6 md:px-10 relative z-10 my-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-[0.25em] mb-4">
            <Globe size={14} className="text-orange-400" />
            <span>Why 250,000+ Students Choose UniCoach</span>
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-instrument">
            Powered by Tech, Driven by{' '}
            <span className="bg-gradient-to-r from-[#2563eb] via-[#f26522] to-[#3b82f6] bg-clip-text text-transparent">
              Excellence
            </span>
          </h2>
        </div>

        {/* GSAP Animated Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-7 perspective-[1200px]">
          {/* Card 1 */}
          <div
            onClick={() => onOpenModal && onOpenModal('Scholarship Guidance')}
            className="group relative bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/[0.09] hover:border-blue-400/40 transition-all duration-500 cursor-pointer shadow-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-7 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <Award size={26} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-3">
              100% Scholarship Grants
            </h3>
            <p className="text-slate-300 text-sm font-medium leading-relaxed mb-6">
              Our AI algorithm matches your academic profile with over ₹1,000 Cr+ in international university scholarships.
            </p>
            <div className="flex items-center gap-2 text-xs font-black text-orange-400 group-hover:text-orange-300 transition-colors uppercase tracking-wider">
              <span>Explore Grants</span>
              <ArrowUpRight size={16} />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onOpenModal && onOpenModal('Visa Assistance')}
            className="group relative bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/[0.09] hover:border-orange-400/40 transition-all duration-500 cursor-pointer shadow-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white mb-7 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={26} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-3">
              99% Visa Approval Rate
            </h3>
            <p className="text-slate-300 text-sm font-medium leading-relaxed mb-6">
              Certified visa officers conduct 1-on-1 embassy mock interviews & financial document audits.
            </p>
            <div className="flex items-center gap-2 text-xs font-black text-blue-400 group-hover:text-blue-300 transition-colors uppercase tracking-wider">
              <span>Check Visa Process</span>
              <ArrowUpRight size={16} />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onOpenModal && onOpenModal('University Shortlist')}
            className="group relative bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/[0.09] hover:border-emerald-400/40 transition-all duration-500 cursor-pointer shadow-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-7 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap size={26} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-3">
              Top 500 Universities
            </h3>
            <p className="text-slate-300 text-sm font-medium leading-relaxed mb-6">
              Get shortlisted for QS Top 500 universities in USA, UK, Canada, Australia, Germany & Ireland.
            </p>
            <div className="flex items-center gap-2 text-xs font-black text-emerald-400 group-hover:text-emerald-300 transition-colors uppercase tracking-wider">
              <span>View Universities</span>
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* GSAP Kinetic Marquee Row 2 (Moving Right on Scroll) */}
      <div className="mt-6 overflow-hidden whitespace-nowrap opacity-20 pointer-events-none">
        <div ref={marquee2Ref} className="inline-block text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase font-instrument">
          GLOBAL CAREER PROSPECTS • LOW INTEREST LOANS • FREE COUNSELING • 1-ON-1 SESSIONS • UNICOACH •
        </div>
      </div>
    </section>
  );
};
