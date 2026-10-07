import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLead } from '../context/LeadContext';

import usaImg from '../assets/destinations/usa.webp';
import ukImg from '../assets/destinations/uk.webp';
import canadaImg from '../assets/destinations/canada.webp';
import ausImg from '../assets/destinations/australia.webp';
import germanyImg from '../assets/destinations/germany.webp';
import irelandImg from '../assets/destinations/ireland.webp';

export const Destinations = ({ onOpenModal }) => {
  const { openEligibilityModal } = useLead();
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const destinations = [
    {
      id: 'usa',
      name: 'United States',
      flagCode: 'us',
      universities: '4,500+ Universities',
      salary: 'Avg. Salary: $75K+',
      image: usaImg,
    },
    {
      id: 'uk',
      name: 'United Kingdom',
      flagCode: 'gb',
      universities: '150+ Universities',
      salary: 'Avg. Salary: £45K+',
      image: ukImg,
    },
    {
      id: 'canada',
      name: 'Canada',
      flagCode: 'ca',
      universities: '100+ Colleges',
      salary: 'Avg. Salary: C$65K+',
      image: canadaImg,
    },
    {
      id: 'australia',
      name: 'Australia',
      flagCode: 'au',
      universities: '40+ Universities',
      salary: 'Avg. Salary: A$70K+',
      image: ausImg,
    },
    {
      id: 'germany',
      name: 'Germany',
      flagCode: 'de',
      universities: '300+ Universities',
      salary: 'Avg. Salary: €55K+',
      image: germanyImg,
    },
    {
      id: 'ireland',
      name: 'Ireland',
      flagCode: 'ie',
      universities: '35+ Universities',
      salary: 'Avg. Salary: €45K+',
      image: irelandImg,
    },
  ];

  const updateCurrentIndex = () => {
    if (!scrollContainerRef.current) return;
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

            <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 leading-relaxed mt-2.5 max-w-[290px] font-normal">
              World-class education. Global exposure. <br />
              Your pick, your future.
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
              <span className="text-[11.5px] font-extrabold text-[#DE5C2B] bg-orange-50 border border-orange-200/70 px-2.5 py-0.5 rounded-full font-mono">
                0{currentIndex + 1} / 06
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center gap-3">
              <Link
                to="/study-abroad/usa"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-orange-200/90 bg-white hover:bg-orange-50/60 text-[12.5px] font-bold text-[#DE5C2B] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <span>View All Countries</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
              className="flex items-center gap-4 sm:gap-4.5 py-1 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory"
            >
              {destinations.map((dest, idx) => {
                const isActive = idx === currentIndex;

                return (
                  <Link
                    key={`${dest.id}-${idx}`}
                    to={`/study-abroad/${dest.id}`}
                    className={`group relative w-[185px] sm:w-[210px] lg:w-[225px] xl:w-[235px] h-[290px] sm:h-[330px] lg:h-[350px] shrink-0 rounded-[22px] overflow-hidden bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between p-4 sm:p-5 select-none snap-start ${
                      isActive ? 'ring-2 ring-[#DE5C2B]/60 shadow-md' : ''
                    }`}
                  >
                    {/* Landmark Background Photo */}
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                      loading="lazy"
                    />

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 via-55% to-transparent pointer-events-none" />

                    {/* Top Row: Country Number Badge & Flag */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
                        <img 
                          src={`https://flagcdn.com/w40/${dest.flagCode}.png`} 
                          alt={`${dest.name} Flag`} 
                          className="w-4.5 h-3 rounded-xs object-cover shadow-2xs"
                        />
                        <span>0{idx + 1}</span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Bottom Text Content */}
                    <div className="relative z-10">
                      <h3 className="font-outfit text-[17px] sm:text-[19px] font-bold text-white leading-tight">
                        {dest.name}
                      </h3>
                      <p className="text-[11.5px] text-slate-200/90 font-medium mt-1 leading-tight">
                        {dest.universities}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between">
                        <span className="text-[11px] text-slate-300 font-medium leading-tight">
                          {dest.salary}
                        </span>
                        <span className="text-[10.5px] font-bold text-[#FED7CE] group-hover:text-white transition-colors">
                          Explore →
                        </span>
                      </div>
                    </div>
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
