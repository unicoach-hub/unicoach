import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Award, Globe, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const UnicoachParallaxQuote = () => {
  const sectionRef = useRef(null);

  const animState = useRef({
    rainbowY: 120,
    leftX: -200,
    rightX: 200,
    cloudY: 0,
    cloudOpacity: 0,
  });

  const [styles, setStyles] = useState({
    rainbowY: 120,
    leftX: -200,
    rightX: 200,
    cloudY: 0,
    cloudOpacity: 0,
  });

  useEffect(() => {
    let animFrameId;

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const lerp = (current, target, factor) => current + (target - current) * factor;

    const updateParallax = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const rawProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const progress = clamp(rawProgress, 0, 1);

        // Rainbow moves vertically +120px to -160px
        const targetRainbowY = 120 + (-160 - 120) * progress;

        // Cloud progress range [0.12, 0.92]
        let inViewFactor = 0;
        if (progress >= 0.12 && progress <= 0.92) {
          const norm = (progress - 0.12) / (0.92 - 0.12);
          inViewFactor = Math.sin(norm * Math.PI);
        }

        const targetLeftX = -200 * (1 - inViewFactor);
        const targetRightX = 200 * (1 - inViewFactor);
        const targetCloudY = progress * -50;
        const targetCloudOpacity = inViewFactor;

        animState.current.rainbowY = lerp(animState.current.rainbowY, targetRainbowY, 0.06);
        animState.current.leftX = lerp(animState.current.leftX, targetLeftX, 0.04);
        animState.current.rightX = lerp(animState.current.rightX, targetRightX, 0.04);
        animState.current.cloudY = lerp(animState.current.cloudY, targetCloudY, 0.04);
        animState.current.cloudOpacity = lerp(animState.current.cloudOpacity, targetCloudOpacity, 0.04);

        setStyles({
          rainbowY: animState.current.rainbowY,
          leftX: animState.current.leftX,
          rightX: animState.current.rightX,
          cloudY: animState.current.cloudY,
          cloudOpacity: animState.current.cloudOpacity,
        });
      }

      animFrameId = requestAnimationFrame(updateParallax);
    };

    animFrameId = requestAnimationFrame(updateParallax);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[90vh] py-20 overflow-hidden flex flex-col items-center justify-center px-6 md:px-12 z-20 select-none"
      style={{
        background: 'linear-gradient(180deg, #010A17 0%, #0A4267 30%, #20658E 60%, #6BADC4 100%)',
      }}
    >
      {/* 1. Rainbow Overlay Layer */}
      <img
        src="https://soft-zoom-63098134.figma.site/_assets/v11/8d520a7515d06cbfc403d0125e3d05b1a7ccd29c.png"
        alt="Rainbow Overlay"
        className="absolute inset-x-0 top-0 z-30 pointer-events-none w-full mix-blend-screen opacity-90 object-cover"
        style={{
          transform: `translate3d(0px, ${styles.rainbowY}px, 0px)`,
          willChange: 'transform',
        }}
      />

      {/* 2. Left Cloud Layer */}
      <img
        src="https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png"
        alt="Left Cloud"
        className="absolute left-0 bottom-[10%] z-10 hidden sm:block pointer-events-none w-[500px] md:w-[650px] max-w-none"
        style={{
          marginLeft: '-50%',
          transform: `translate3d(${styles.leftX}px, ${styles.cloudY}px, 0px)`,
          opacity: styles.cloudOpacity,
          willChange: 'transform, opacity',
        }}
      />

      {/* 3. Right Cloud Layer */}
      <img
        src="https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png"
        alt="Right Cloud"
        className="absolute right-0 bottom-[15%] z-10 hidden sm:block pointer-events-none w-[500px] md:w-[650px] max-w-none scale-x-[-1]"
        style={{
          marginRight: '-75%',
          transform: `scaleX(-1) translate3d(${-styles.rightX}px, ${styles.cloudY}px, 0px)`,
          opacity: styles.cloudOpacity,
          willChange: 'transform, opacity',
        }}
      />

      {/* 4. Main Quote Content */}
      <div className="relative z-20 max-w-4xl text-center flex flex-col items-center justify-center">
        {/* Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase mb-8 shadow-lg">
          <Sparkles size={13} className="text-amber-300 animate-pulse" />
          <span>The UniCoach Promise</span>
        </div>

        <blockquote className="font-instrument text-white text-2xl sm:text-3xl md:text-5xl lg:text-[52px] leading-[1.35] text-glow font-normal tracking-wide">
          “UniCoach was founded on a belief in global education that honors your unique ambition. We engineer bespoke pathways, maximum scholarship aid, and lasting international success. No rushing, no compromise — just dedicated support that empowers you to thrive globally.”
        </blockquote>

        <div className="mt-8 text-white/90 text-sm md:text-base tracking-widest font-inter uppercase font-semibold flex items-center gap-3">
          <span className="w-8 h-[1px] bg-white/40" />
          <span>UniCoach Global Education Council</span>
          <span className="w-8 h-[1px] bg-white/40" />
        </div>

        {/* Feature Highlights Glass Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-3xl">
          <div className="liquid-glass p-5 rounded-2xl border border-white/10 text-center flex flex-col items-center backdrop-blur-md">
            <Globe className="w-7 h-7 text-sky-300 mb-2" />
            <h4 className="text-white font-bold text-sm">15+ Destinations</h4>
            <p className="text-white/70 text-xs mt-1">USA, UK, Canada, Australia & Europe</p>
          </div>
          <div className="liquid-glass p-5 rounded-2xl border border-white/10 text-center flex flex-col items-center backdrop-blur-md">
            <Award className="w-7 h-7 text-amber-300 mb-2" />
            <h4 className="text-white font-bold text-sm">₹50Cr+ Scholarships</h4>
            <p className="text-white/70 text-xs mt-1">Awarded to UniCoach scholars globally</p>
          </div>
          <div className="liquid-glass p-5 rounded-2xl border border-white/10 text-center flex flex-col items-center backdrop-blur-md">
            <ShieldCheck className="w-7 h-7 text-emerald-300 mb-2" />
            <h4 className="text-white font-bold text-sm">99% Visa Success</h4>
            <p className="text-white/70 text-xs mt-1">Certified visa & documentation experts</p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to="/contact"
          className="mt-10 bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow cursor-pointer inline-flex items-center justify-center gap-2"
        >
          Begin Your Global Journey
        </Link>
      </div>
    </section>
  );
};

export default UnicoachParallaxQuote;
