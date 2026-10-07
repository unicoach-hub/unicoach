import React, { useEffect, useRef } from 'react';

export const SereneQuoteSection = () => {
  const sectionRef = useRef(null);
  const rainbowRef = useRef(null);
  const leftCloudRef = useRef(null);
  const rightCloudRef = useRef(null);

  const currentValues = useRef({
    rainbowY: 120,
    leftCloudX: -200,
    leftCloudY: 0,
    leftCloudOpacity: 0,
    rightCloudX: 200,
    rightCloudY: 0,
    rightCloudOpacity: 0,
  });

  useEffect(() => {
    let animationFrameId;

    const clamp = (min, max, value) => Math.min(max, Math.max(min, value));
    const lerp = (current, target, factor) => current + (target - current) * factor;

    const animate = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const rawProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const progress = clamp(0, 1, rawProgress);

        // 1. Rainbow target calculation (moves from +120px to -160px)
        const targetRainbowY = 120 + progress * (-160 - 120);
        currentValues.current.rainbowY = lerp(
          currentValues.current.rainbowY,
          targetRainbowY,
          0.06
        );

        // 2. Cloud visibility trigger (progress between 0.12 and 0.92)
        const isInView = progress >= 0.12 && progress <= 0.92;

        // Left Cloud Targets
        const targetLeftX = isInView ? 0 : -200;
        const targetLeftY = progress * -50;
        const targetLeftOpacity = isInView ? 1 : 0;

        currentValues.current.leftCloudX = lerp(
          currentValues.current.leftCloudX,
          targetLeftX,
          0.04
        );
        currentValues.current.leftCloudY = lerp(
          currentValues.current.leftCloudY,
          targetLeftY,
          0.04
        );
        currentValues.current.leftCloudOpacity = lerp(
          currentValues.current.leftCloudOpacity,
          targetLeftOpacity,
          0.04
        );

        // Right Cloud Targets
        const targetRightX = isInView ? 0 : 200;
        const targetRightY = progress * -50;
        const targetRightOpacity = isInView ? 1 : 0;

        currentValues.current.rightCloudX = lerp(
          currentValues.current.rightCloudX,
          targetRightX,
          0.04
        );
        currentValues.current.rightCloudY = lerp(
          currentValues.current.rightCloudY,
          targetRightY,
          0.04
        );
        currentValues.current.rightCloudOpacity = lerp(
          currentValues.current.rightCloudOpacity,
          targetRightOpacity,
          0.04
        );

        // Apply direct style transforms with translate3d & GPU acceleration
        if (rainbowRef.current) {
          rainbowRef.current.style.transform = `translate3d(0, ${currentValues.current.rainbowY.toFixed(2)}px, 0)`;
        }

        if (leftCloudRef.current) {
          leftCloudRef.current.style.transform = `translate3d(${currentValues.current.leftCloudX.toFixed(2)}px, ${currentValues.current.leftCloudY.toFixed(2)}px, 0)`;
          leftCloudRef.current.style.opacity = currentValues.current.leftCloudOpacity.toFixed(3);
        }

        if (rightCloudRef.current) {
          rightCloudRef.current.style.transform = `scaleX(-1) translate3d(${-currentValues.current.rightCloudX.toFixed(2)}px, ${currentValues.current.rightCloudY.toFixed(2)}px, 0)`;
          rightCloudRef.current.style.opacity = currentValues.current.rightCloudOpacity.toFixed(3);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center px-6 md:px-12"
      style={{
        background:
          'linear-gradient(180deg, #010A17 0%, #0A4267 30%, #20658E 60%, #6BADC4 100%)',
      }}
    >
      {/* 1. Rainbow Image Layer */}
      <img
        ref={rainbowRef}
        src="https://soft-zoom-63098134.figma.site/_assets/v11/8d520a7515d06cbfc403d0125e3d05b1a7ccd29c.png"
        alt="Serene Rainbow Aura"
        className="absolute inset-x-0 top-0 w-full z-30 pointer-events-none object-cover opacity-85"
        style={{
          willChange: 'transform',
          transform: 'translate3d(0, 120px, 0)',
        }}
      />

      {/* 2. Left Cloud Layer */}
      <img
        ref={leftCloudRef}
        src="https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png"
        alt="Left Cloud Accent"
        className="absolute left-0 bottom-[10%] z-10 hidden sm:block w-[500px] md:w-[650px] pointer-events-none"
        style={{
          marginLeft: '-50%',
          willChange: 'transform, opacity',
          opacity: 0,
          transform: 'translate3d(-200px, 0, 0)',
        }}
      />

      {/* 3. Right Cloud Layer (Flipped horizontally) */}
      <img
        ref={rightCloudRef}
        src="https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png"
        alt="Right Cloud Accent"
        className="absolute right-0 bottom-[15%] z-10 hidden sm:block w-[500px] md:w-[650px] pointer-events-none"
        style={{
          marginRight: '-75%',
          willChange: 'transform, opacity',
          opacity: 0,
          transform: 'scaleX(-1) translate3d(200px, 0, 0)',
        }}
      />

      {/* 4. Quote Content */}
      <div className="relative z-20 max-w-4xl text-center px-4">
        <blockquote className="font-instrument text-white text-xl sm:text-2xl md:text-4xl lg:text-[42px] leading-[1.45] md:leading-[1.5] tracking-tight">
          &ldquo;Serene was founded on a belief in beauty that honors your nature. We pursue refined outcomes, considered approaches, and lasting vitality. We spend time learning what matters to you before deciding what serves you best. No rushing, no excess -- just support that lets you feel radiant.&rdquo;
        </blockquote>
        <p className="mt-6 md:mt-8 text-white/80 text-sm md:text-base tracking-wide font-inter font-light">
          Dr. Mia Callahan &mdash; Founder
        </p>
      </div>
    </section>
  );
};

export default SereneQuoteSection;
