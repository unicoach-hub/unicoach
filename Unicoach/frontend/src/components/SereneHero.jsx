import React, { useRef, useState } from 'react';

export const SereneHero = () => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#0a0608]">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

      {/* Serene Floating Header/Brand Badge */}
      <div className="absolute top-6 left-6 md:top-8 md:left-12 z-30 flex items-center gap-3">
        <span className="font-dancing text-white text-3xl md:text-4xl tracking-wide select-none drop-shadow-md">
          Serene
        </span>
      </div>

      {/* Center Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-5xl -mt-[60px] md:-mt-[100px]">
        <h1 className="font-instrument text-white text-[36px] md:text-7xl lg:text-[110px] leading-[0.9] tracking-tight text-center text-glow">
          Gentle touch. Radiant presence.
        </h1>
        <p className="text-white/70 text-sm md:text-base text-center mt-5 md:mt-7 max-w-xl font-normal">
          Expert beauty and holistic wellness, delivered with warmth and intention.
        </p>
        <button className="mt-6 md:mt-9 bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow cursor-pointer">
          Begin your renewal
        </button>
      </div>

      {/* Sound Indicator (desktop only) */}
      <button
        onClick={toggleSound}
        className="hidden md:flex absolute bottom-8 left-8 z-20 items-center gap-3 group cursor-pointer focus:outline-none"
        aria-label="Toggle Sound"
      >
        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm bg-white/5 group-hover:border-white/40 transition-colors duration-300">
          <div className="flex items-center gap-[3px] h-3">
            <span
              className={`w-[2px] bg-white rounded-full transition-all duration-300 ${
                isMuted ? 'h-1.5 opacity-50' : 'h-3 animate-pulse'
              }`}
            />
            <span
              className={`w-[2px] bg-white rounded-full transition-all duration-300 ${
                isMuted ? 'h-3 opacity-80' : 'h-2 animate-pulse delay-100'
              }`}
            />
            <span
              className={`w-[2px] bg-white rounded-full transition-all duration-300 ${
                isMuted ? 'h-1.5 opacity-50' : 'h-3.5 animate-pulse delay-200'
              }`}
            />
          </div>
        </div>
        <div className="text-left text-white/60 text-xs font-light leading-tight group-hover:text-white/80 transition-colors duration-300">
          <p>Experience</p>
          <p>{isMuted ? 'with sound' : 'sound on'}</p>
        </div>
      </button>
    </section>
  );
};

export default SereneHero;
