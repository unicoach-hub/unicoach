import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Clock, Landmark, Navigation } from 'lucide-react';

// ==========================================
// UNICOACH HEADQUARTERS & GLOBAL REGIONAL OFFICES TOUR
// Includes India & Global SEO locations
// Prominent Visible Header positioned below fixed Navbar (top-24 md:top-28)
// Spacious Right Card (w-[540px]) + Left-side 3D Earth Globe
// ==========================================

const offices = [
  {
    city: 'Panipat',
    name: 'Panipat',
    tag: 'Global Headquarters',
    landmark: 'Historic City & Industrial Heritage of Haryana',
    landmarkTag: 'Kala Amb & War Memorial Heritage',
    address: '1st Floor, Gali No. 4, Sahil Colony, Jattal road, Sondhapur Village, Panipat, Haryana, India, 132105',
    phone: '+91 95186 57944',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    lat: 29.39,
    lon: 76.97,
    accent: 'from-indigo-600 to-blue-600',
    accentColor: '#6366f1',
    bgBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    city: 'Delhi',
    name: 'Delhi',
    tag: 'National Capital Office',
    landmark: 'India Gate & Central Business Hub',
    landmarkTag: 'Nehru Place Financial District',
    address: '2nd Floor, Building No. 12, Nehru Place, New Delhi 110019',
    phone: '+91 88005 67782',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    lat: 28.55,
    lon: 77.21,
    accent: 'from-emerald-600 to-teal-600',
    accentColor: '#10b981',
    bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    city: 'Jaipur',
    name: 'Jaipur',
    tag: 'Rajasthan Regional Office',
    landmark: 'Hawa Mahal & The Pink City Heritage',
    landmarkTag: 'Tonk Road Commercial Center',
    address: '3rd Floor, Tonk Road, Jaipur, Rajasthan 302015',
    phone: '+91 98290 67782',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    lat: 26.91,
    lon: 75.79,
    accent: 'from-orange-500 to-amber-600',
    accentColor: '#f97316',
    bgBadge: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    city: 'Bangalore',
    name: 'Bangalore',
    tag: 'South India Tech Hub',
    landmark: 'Vidhana Soudha & Silicon Valley of India',
    landmarkTag: 'Indiranagar 100ft Road Campus',
    address: 'No. 45, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
    phone: '+91 80412 67782',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    lat: 12.97,
    lon: 77.59,
    accent: 'from-amber-500 to-yellow-600',
    accentColor: '#eab308',
    bgBadge: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    city: 'Kolkata',
    name: 'Kolkata',
    tag: 'East India Regional Center',
    landmark: 'Howrah Bridge & Cultural Capital',
    landmarkTag: 'Park Street Heritage Quarter',
    address: 'Park Street, Elgin, Kolkata, West Bengal 700016',
    phone: '+91 98300 67782',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    lat: 22.57,
    lon: 88.36,
    accent: 'from-blue-600 to-cyan-600',
    accentColor: '#DE5C2B',
    bgBadge: 'bg-orange-50 text-[#C04A1D] border-orange-200',
  },
  {
    city: 'Nepal',
    name: 'Nepal',
    tag: 'International Desk — Nepal',
    landmark: 'Pashupatinath & Mount Everest Gateway',
    landmarkTag: 'Kathmandu Admissions Desk',
    address: 'UniCoach Global Center, Lazimpat, Kathmandu, Nepal 44600',
    phone: '+977 1 4410982',
    hours: 'Mon - Sat: 9:30 AM - 6:00 PM',
    lat: 28.3949,
    lon: 84.124,
    accent: 'from-pink-600 to-rose-600',
    accentColor: '#ec4899',
    bgBadge: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  {
    city: 'Sri Lanka',
    name: 'Sri Lanka',
    tag: 'International Desk — Sri Lanka',
    landmark: 'Lotus Tower & Colombo Port City Hub',
    landmarkTag: 'Galle Road Colombo Campus',
    address: 'UniCoach International, Galle Road, Colombo 03, Sri Lanka',
    phone: '+94 11 257 6782',
    hours: 'Mon - Sat: 9:30 AM - 6:00 PM',
    lat: 7.8731,
    lon: 80.7718,
    accent: 'from-cyan-600 to-teal-600',
    accentColor: '#06b6d4',
    bgBadge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    city: 'Bangladesh',
    name: 'Bangladesh',
    tag: 'International Desk — Bangladesh',
    landmark: 'Dhaka Financial Hub & Heritage City',
    landmarkTag: 'Gulshan Commercial Area',
    address: 'UniCoach South Asia, Gulshan Avenue, Dhaka 1212, Bangladesh',
    phone: '+880 2 988 6782',
    hours: 'Mon - Sat: 9:30 AM - 6:00 PM',
    lat: 23.685,
    lon: 90.3563,
    accent: 'from-emerald-600 to-green-600',
    accentColor: '#10b981',
    bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

const ScrollRevealSection = ({ onActiveOffice }) => {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = rect.height - window.innerHeight;
      if (sectionHeight <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / sectionHeight));
      const idx = Math.min(
        Math.floor(progress * offices.length),
        offices.length - 1
      );
      const newIdx = Math.max(0, idx);
      setActiveIndex(newIdx);
      if (onActiveOffice) onActiveOffice(offices[newIdx]);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onActiveOffice]);

  const activeOffice = offices[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="hq-tour-section"
      className="relative"
      style={{ height: `${offices.length * 100}vh` }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center bg-gradient-to-b from-[#f8fafc] via-[#eef2ff]/30 to-[#f8fafc]">
        
        {/* Subtle background grid */}
        <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(rgba(99,102,241,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.12)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* PROMINENT VISIBLE SECTION HEADER — Positioned cleanly above the Earth globe */}
        <div className="absolute top-16 sm:top-14 left-1/2 -translate-x-1/2 z-30 text-center w-full max-w-3xl px-4 pointer-events-none">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-1 shadow-sm">
            Global Office & Admissions Network
          </span>
          <h2
            className="text-lg sm:text-2xl md:text-4xl font-bold text-slate-900 tracking-tight leading-snug sm:leading-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Explore Our{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Headquarters & International Desks
            </span>
          </h2>
        </div>

        {/* Leftmost Column: Vertical City Navigation Dots (Desktop only) */}
        <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-3">
          {offices.map((office, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i === activeIndex ? activeOffice.accentColor : '#cbd5e1',
                  boxShadow: i === activeIndex ? `0 0 14px ${activeOffice.accentColor}70` : 'none',
                  transform: i === activeIndex ? 'scale(1.4)' : 'scale(1)',
                }}
              />
              <span
                className={`text-[11px] font-black tracking-wide transition-all duration-300 ${
                  i === activeIndex ? 'text-slate-900 translate-x-0 opacity-100' : 'text-slate-400 -translate-x-2 opacity-40'
                }`}
              >
                {office.city}
              </span>
            </div>
          ))}
        </div>

        {/* 3D Earth Globe renders on LEFT side on desktop, background on mobile */}

        {/* Right Side: Spacious Office Card */}
        <div className="absolute left-4 right-4 sm:left-auto sm:right-6 md:right-12 lg:right-16 top-[54%] sm:top-1/2 -translate-y-1/2 z-20 w-[calc(100%-2rem)] sm:w-full sm:max-w-[460px] lg:max-w-[520px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 30, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -20, y: -10 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 lg:p-9 border border-slate-200/80 shadow-2xl shadow-slate-300/50 mt-6 sm:mt-8"
            >
              {/* Tag & Landmark Badge */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 sm:py-1 rounded-full border border-indigo-100">
                  {activeOffice.tag}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 sm:py-1 rounded-full border ${activeOffice.bgBadge}`}>
                  {activeOffice.landmarkTag}
                </span>
              </div>

              {/* City Title */}
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-1.5 sm:mb-2 tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {activeOffice.city}
              </h3>

              {/* Landmark Detail */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4 text-slate-600 text-xs sm:text-sm font-semibold">
                <Landmark size={15} className="text-amber-500 flex-shrink-0" />
                <span className="line-clamp-1">{activeOffice.landmark}</span>
              </div>

              {/* Accent Line */}
              <div
                className="w-16 h-1 rounded-full mb-4 sm:mb-5"
                style={{ background: `linear-gradient(90deg, ${activeOffice.accentColor}, transparent)` }}
              />

              {/* Info Details */}
              <div className="space-y-3 sm:space-y-3.5 mb-5 sm:mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 mt-0.5">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Campus / Office Address</p>
                    <p className="text-slate-800 text-xs sm:text-sm md:text-[15px] font-semibold leading-relaxed">
                      {activeOffice.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                    <Phone size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Direct Helpline</p>
                    <p className="text-slate-900 text-xs sm:text-sm font-extrabold">{activeOffice.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                    <Clock size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Working Hours</p>
                    <p className="text-slate-700 text-xs sm:text-sm font-semibold">{activeOffice.hours}</p>
                  </div>
                </div>
              </div>

              {/* Directions Button */}
              <a
                href={`https://maps.google.com/?q=${activeOffice.lat},${activeOffice.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 sm:py-3.5 bg-gradient-to-r ${activeOffice.accent} text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider rounded-2xl hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group`}
                style={{ boxShadow: `0 8px 25px ${activeOffice.accentColor}35` }}
              >
                <Navigation size={14} className="group-hover:rotate-45 transition-transform" />
                <span>Get Directions & Map</span>
              </a>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Scroll Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">
            Scroll to visit next location
          </p>
        </div>

      </div>
    </section>
  );
};

export { offices };
export default ScrollRevealSection;
