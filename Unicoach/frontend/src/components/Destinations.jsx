import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLead } from '../context/LeadContext';

import { SKETCH_THEMES } from './destinationSketches';
import './desi/desi.css';


export const Destinations = ({ onOpenModal }) => {
  const { openEligibilityModal } = useLead();
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Editorial cards: a soft colour per country, a 3D miniature of its landmark and three useful facts.
  // Renders: graphics/destination-3d/make_landmarks.py, saved in public/images/destinations-3d
  const destinations = [
    { id: 'usa', ...SKETCH_THEMES.usa, name: 'United States', region: 'North America', universities: '4,500+', visa: '1–3 years', length: '1.5–2 years' },
    { id: 'uk', ...SKETCH_THEMES.uk, name: 'United Kingdom', region: 'Europe', universities: '150+', visa: 'Up to 2 years', length: '1 year' },
    { id: 'canada', ...SKETCH_THEMES.canada, name: 'Canada', region: 'North America', universities: '100+', visa: 'Up to 3 years', length: '1–2 years' },
    { id: 'australia', ...SKETCH_THEMES.australia, name: 'Australia', region: 'Oceania', universities: '40+', visa: '2–4 years', length: '1.5–2 years' },
    { id: 'germany', ...SKETCH_THEMES.germany, name: 'Germany', region: 'Europe', universities: '300+', visa: '18 months', length: '2 years' },
    { id: 'ireland', ...SKETCH_THEMES.ireland, name: 'Ireland', region: 'Europe', universities: '35+', visa: '1–2 years', length: '1 year' },
  ];

  const lockRef = useRef(0);
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  const updateCurrentIndex = () => {
    if (!scrollContainerRef.current || Date.now() < lockRef.current) return;
    const { scrollLeft } = scrollContainerRef.current;
    const cardStep = window.innerWidth >= 1024 ? 243 : (window.innerWidth >= 640 ? 228 : 201);
    const index = Math.round(scrollLeft / cardStep);
    setCurrentIndex(Math.max(0, Math.min(destinations.length - 1, index)));
  };

  const scrollToDestination = (index) => {
    if (!scrollContainerRef.current) return;
    const cardStep = window.innerWidth >= 1024 ? 243 : (window.innerWidth >= 640 ? 228 : 201);
    scrollContainerRef.current.scrollTo({
      left: index * cardStep,
      behavior: 'smooth',
    });
    setCurrentIndex(index);
    lockRef.current = Date.now() + 700;
  };

  const handleScroll = (direction) => {
    const nextIndex = direction === 'left'
      ? Math.max(0, currentIndex - 1)
      : Math.min(destinations.length - 1, currentIndex + 1);
    scrollToDestination(nextIndex);
  };

  return (
    <section
      id="destinations"
      className="pt-2 sm:pt-4 pb-4 sm:pb-6 bg-[#FAF9F6] border-b border-orange-100/60 relative overflow-hidden w-full max-w-full select-none"
    >
      {/* Soft Warm Atmospheric Background Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[-5%] w-[500px] h-[400px] bg-radial from-[#FFE8DF]/40 to-transparent rounded-full blur-[90px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[450px] bg-radial from-[#FED7CE]/30 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4 xl:gap-5 w-full min-w-0">
          
          {/* ════════ LEFT COLUMN: WATERMARK '01', HEADER & NAVIGATION ════════ */}
          <div className="w-full lg:w-[310px] xl:w-[330px] shrink-0 relative">
            
            {/* ── Transparent Watermark Counting ── */}
            <div className="font-urbanist text-[85px] sm:text-[110px] lg:text-[120px] font-black text-slate-300/50 lg:text-slate-300/60 leading-none select-none tracking-tighter mb-[-34px] sm:mb-[-44px] lg:mb-[-48px] -ml-1 pointer-events-none transition-all duration-300">
              0{currentIndex + 1}
            </div>

            {/* Main Heading */}
            <h2 className="font-outfit text-[32px] sm:text-[38px] lg:text-[40px] font-black text-[#111111] leading-[1.12] tracking-[-0.03em] relative z-10">
              Explore Top <br />
              <span className="relative inline-block text-[#DE5C2B] whitespace-nowrap">
                Study Destinations
                <span className="absolute -bottom-1 left-0 w-full h-[6px] bg-[#FED7CE] rounded-full -z-10" />
              </span>
            </h2>

            {/* Old-Bollywood song-caption style line (our own words) */}
            <div className="desi-caption" aria-label="Hum to chale pardes, ab tumhari baari">
              <span className="top">HUM TO CHALE PARDES,</span>
              <span className="bar">अब तुम्हारी बारी ✈️</span>
            </div>

            <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 leading-relaxed mt-2.5 max-w-[290px] font-normal">
              Fees, jobs after study and visa rules differ a lot. <br />
              Compare before you choose.
            </p>

            {/* ── Active Destination Pill & Progress Indicator ── */}
            <div className="mt-4 sm:mt-5 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {destinations.map((dest, i) => (
                  <button
                    key={dest.id}
                    onClick={() => scrollToDestination(i)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentIndex ? 'w-7 bg-[#DE5C2B]' : 'w-2 bg-slate-300/70 hover:bg-orange-300'
                    }`}
                    title={dest.name}
                    aria-label={`Go to ${dest.name}`}
                  />
                ))}
              </div>
              <span className="text-[11.5px] font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full whitespace-nowrap">
                0{currentIndex + 1} · {destinations[currentIndex].name}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center gap-3">
              <Link
                to={`/study-abroad/${destinations[currentIndex].id}`}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-slate-900 hover:bg-[#DE5C2B] text-[14px] font-semibold text-white transition-colors"
              >
                <span>Explore {destinations[currentIndex].name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/study-abroad" className="text-[14px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                All countries
              </Link>
            </div>

          </div>

          {/* ════════ RIGHT COLUMN: HORIZONTAL CARDS TRACK ════════ */}
          <div className="w-full min-w-0 max-w-full flex-1 relative">
            {/* Top Right Navigation Controls */}
            <div className="flex items-center justify-end gap-2 mb-2.5 sm:mb-3 pr-1">
              <button
                onClick={() => handleScroll('left')}
                disabled={currentIndex === 0}
                className="w-9 h-9 rounded-full bg-white border border-orange-200/80 flex items-center justify-center text-slate-700 hover:text-[#DE5C2B] hover:border-orange-300 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
                aria-label="Previous Destination"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                disabled={currentIndex === destinations.length - 1}
                className="w-9 h-9 rounded-full bg-white border border-orange-200/80 flex items-center justify-center text-slate-700 hover:text-[#DE5C2B] hover:border-orange-300 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
                aria-label="Next Destination"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div
              ref={scrollContainerRef}
              onScroll={updateCurrentIndex}
              className="flex items-center gap-4 sm:gap-4.5 pt-3 pb-6 px-1 -mt-2 -mb-5 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory"
            >
              {destinations.map((dest, idx) => {
                const isActive = idx === currentIndex;

                return (
                  <Link
                    key={`${dest.id}-${idx}`}
                    to={`/study-abroad/${dest.id}`}
                    onMouseEnter={() => { if (canHover) { setCurrentIndex(idx); lockRef.current = Date.now() + 400; } }}
                    style={{
                      background: dest.bg,
                      color: dest.ink,
                      boxShadow: isActive ? `0 0 0 2px ${dest.ink}, 0 24px 44px -20px rgba(15,23,42,0.45)` : 'none',
                      transform: isActive ? 'translateY(-6px)' : 'none',
                    }}
                    className={`group relative w-[200px] sm:w-[215px] lg:w-[225px] xl:w-[235px] h-[360px] sm:h-[390px] lg:h-[420px] shrink-0 rounded-[22px] overflow-hidden transition-all duration-300 cursor-pointer flex flex-col p-5 select-none snap-start ${
                      isActive ? '' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[12px] font-medium" style={{ color: dest.soft }}>
                      <span>0{idx + 1} · {dest.region}</span>
                      <span className={`w-7 h-7 rounded-full grid place-items-center transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} style={{ background: dest.ink, color: dest.bg }}><ArrowRight className="w-3.5 h-3.5" /></span>
                    </div>

                    <h3 className="font-outfit text-[26px] lg:text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] mt-3">
                      {dest.name}
                    </h3>

                    {/* 3D miniature of the country's landmark on a soft disc */}
                    <div className="relative flex-1 min-h-0 my-2 grid place-items-center">
                      <span aria-hidden="true" className="absolute w-[86%] max-w-[200px] aspect-square rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.95), rgba(255,255,255,0.3) 72%)' }} />
                      <img
                        src={`/images/destinations-3d/${dest.id}.webp`}
                        alt=""
                        loading="lazy"
                        width="480"
                        height="480"
                        className={`relative w-[96%] max-w-[215px] h-auto drop-shadow-[0_16px_16px_rgba(15,23,42,0.16)] transition-transform duration-500 ${isActive ? 'scale-[1.05] -translate-y-1' : ''} group-hover:-translate-y-1.5`}
                      />
                    </div>

                    <dl className="text-[12px] sm:text-[12.5px] leading-[1.9]">
                      {[
                        ['Universities', dest.universities],
                        ['Stay to work', dest.visa],
                        ["Master's length", dest.length],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between border-t" style={{ borderColor: dest.line }}>
                          <dt className="whitespace-nowrap" style={{ color: dest.soft }}>{k}</dt>
                          <dd className="font-semibold whitespace-nowrap pl-2">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Destinations;
