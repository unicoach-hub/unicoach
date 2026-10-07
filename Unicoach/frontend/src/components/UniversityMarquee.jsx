import React from 'react';

const UNIVERSITIES = [
  { name: 'Arizona State University', country: 'USA', rank: '#1 Innovation' },
  { name: 'University of Toronto', country: 'Canada', rank: 'Top 25 Global' },
  { name: "King's College London", country: 'UK', rank: 'Russell Group' },
  { name: 'Monash University', country: 'Australia', rank: 'Group of Eight' },
  { name: 'Technical University of Munich', country: 'Germany', rank: '#1 in Germany' },
  { name: 'New York University', country: 'USA', rank: 'Top 35 Global' },
  { name: 'Trinity College Dublin', country: 'Ireland', rank: '#1 in Ireland' },
  { name: 'Cranfield University', country: 'UK', rank: 'Top Specialist' },
  { name: 'University of Melbourne', country: 'Australia', rank: '#1 in Australia' },
  { name: 'TU Berlin', country: 'Germany', rank: 'TU9 Excellence' },
];

export const UniversityMarquee = () => {
  // Duplicate for seamless infinite loop
  const list = [...UNIVERSITIES, ...UNIVERSITIES];

  return (
    <section className="py-7 bg-white border-y border-slate-100/90 overflow-hidden relative select-none">
      {/* Subtle edge fades for smooth infinite look */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 mb-3.5 text-center">
        <p className="text-[11px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-[0.18em]">
          Our Students Study at 800+ Top Global Universities
        </p>
      </div>

      <div className="flex overflow-hidden">
        <div className="flex items-center gap-4 sm:gap-6 animate-marquee whitespace-nowrap will-change-transform">
          {list.map((uni, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50/70 hover:bg-orange-50/50 border border-slate-100 hover:border-orange-200 transition-all duration-200 group cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-[#DE5C2B]/70 group-hover:scale-125 transition-transform" />
              <span className="text-[13px] sm:text-[13.5px] font-bold text-slate-700 group-hover:text-[#DE5C2B] transition-colors">
                {uni.name}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-slate-500 border border-slate-200/60 group-hover:text-[#DE5C2B] group-hover:border-orange-200 transition-colors">
                {uni.country}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UniversityMarquee;
