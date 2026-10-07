import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Phone, Building2 } from 'lucide-react';
import { useLead } from '../context/LeadContext';

const centres = [
  {
    city: 'Delhi',
    slug: 'delhi',
    address: 'UniCoach, 2nd Floor, Building No. 12, Nehru Place, New Delhi, Delhi 110019',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    phone: '+91 88005 67782',
    bgColor: 'bg-emerald-50/70',
    textColor: 'text-emerald-700',
    activeBorder: 'border-emerald-300',
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 52h40M16 52V24M48 52V24M22 24v28M42 24v28" />
        <path d="M22 36a10 10 0 0 1 20 0" />
        <path d="M14 24h36M18 18h28M24 12h16" />
      </svg>
    )
  },
  {
    city: 'Bangalore',
    slug: 'bangalore',
    address: 'UniCoach, No. 45, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    phone: '+91 80412 67782',
    bgColor: 'bg-amber-50/70',
    textColor: 'text-amber-700',
    activeBorder: 'border-amber-300',
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 52h48" />
        <path d="M12 52V28h40v24" />
        <path d="M18 28V18h28v10" />
        <path d="M24 18a8 8 0 0 1 16 0" />
        <path d="M16 52V36M22 52V36M42 52V36M48 52V36" />
      </svg>
    )
  },
  {
    city: 'Ludhiana',
    slug: 'ludhiana',
    address: 'UniCoach, Feroze Gandhi Market, Ludhiana, Punjab 141001',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    phone: '+91 98144 67782',
    bgColor: 'bg-rose-50/70',
    textColor: 'text-rose-700',
    activeBorder: 'border-rose-300',
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 52h32" />
        <path d="M22 52V20h20v32" />
        <path d="M24 20l8-10 8 10" />
        <circle cx="32" cy="28" r="4" />
        <path d="M32 26v2M32 28h2" />
      </svg>
    )
  },
  {
    city: 'Jaipur',
    slug: 'jaipur',
    address: 'UniCoach, 3rd Floor, Tonk Road, Jaipur, Rajasthan 302015',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    phone: '+91 98290 67782',
    bgColor: 'bg-orange-50/70',
    textColor: 'text-orange-700',
    activeBorder: 'border-orange-300',
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 52h48" />
        <path d="M12 52V40h40v12" />
        <path d="M16 40V28h32v12" />
        <path d="M22 28V16h20v12" />
        <path d="M26 46a3 3 0 0 1 6 0M32 46a3 3 0 0 1 6 0" />
        <path d="M20 34a2 2 0 0 1 4 0M28 34a2 2 0 0 1 4 0M36 34a2 2 0 0 1 4 0" />
        <path d="M28 22a1 1 0 0 1 2 0M34 22a1 1 0 0 1 2 0" />
      </svg>
    )
  },
  {
    city: 'Kolkata',
    slug: 'kolkata',
    address: 'UniCoach, Park Street, Elgin, Kolkata, West Bengal 700016',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    phone: '+91 98300 67782',
    bgColor: 'bg-orange-50/70',
    textColor: 'text-[#C04A1D]',
    activeBorder: 'border-blue-300',
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 46h52" />
        <path d="M14 46V18l4-4 4 4v28" />
        <path d="M42 46V18l4-4 4 4v28" />
        <path d="M6 32c10-10 20-10 26 0 6 10 16 10 26 0" />
        <path d="M18 18c14 16 14 16 28 0" />
      </svg>
    )
  },
  {
    city: 'Pune',
    slug: 'pune',
    address: 'UniCoach, FC Road, Shivaji Nagar, Pune, Maharashtra 411005',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    phone: '+91 98220 67782',
    bgColor: 'bg-teal-50/70',
    textColor: 'text-teal-700',
    activeBorder: 'border-teal-300',
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 52h44" />
        <path d="M14 52V20l4-4h6l4 4v32" />
        <path d="M36 52V20l4-4h6l4 4v32" />
        <path d="M28 52V30h8v22" />
        <path d="M28 38c0-3 8-3 8 0" />
      </svg>
    )
  },
  {
    city: 'Panipat',
    slug: 'panipat',
    address: '1st Floor, Gali No. 4, Sahil Colony, Jattal road, Sondhapur Village, Panipat, Haryana, India, 132105',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM',
    phone: '+91 95186 57944',
    bgColor: 'bg-indigo-50/70',
    textColor: 'text-indigo-700',
    activeBorder: 'border-indigo-300',
    icon: (
      <svg viewBox="0 0 64 64" className="w-10 h-10 stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 52h48" />
        <path d="M12 52V32h40v24" />
        <path d="M24 52V38a8 8 0 0 1 16 0v14" />
        <path d="M22 32a10 10 0 0 1 20 0" />
      </svg>
    )
  }
];

const CentreLocator = () => {
  const [activeCity, setActiveCity] = useState(centres[0]); // Default to Delhi
  const { openEligibilityModal } = useLead();

  const handleGetDirections = () => {
    const query = encodeURIComponent(`${activeCity.city} Branch, ${activeCity.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <section className="py-24 bg-slate-50/50 relative overflow-hidden select-none font-sans">
      {/* Decorative Cartoon Cloud left */}
      <motion.div 
        className="absolute left-[-40px] top-[15%] opacity-[0.22] pointer-events-none select-none hidden lg:block"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="120" height="80" viewBox="0 0 120 80">
          <path d="M30 40a20 20 0 0 1 30-17 15 15 0 0 1 25-5 25 25 0 0 1 15 47H30a20 20 0 0 1 0-25z" fill="#818cf8" />
        </svg>
      </motion.div>

      {/* Decorative Cartoon Paper Plane right */}
      <motion.div 
        className="absolute right-[4%] top-[8%] opacity-[0.18] pointer-events-none select-none hidden lg:block"
        animate={{ 
          y: [0, -20, 0],
          x: [0, 10, 0],
          rotate: [15, 22, 15]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L2 9.07l7.73 3.2L19 6l-6.27 9.27L16 22l6-20z" />
        </svg>
      </motion.div>

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 relative z-10">
        
        {/* Header Block with soft purple theme */}
        <div className="bg-indigo-50/70 rounded-t-[2.5rem] pt-14 pb-20 px-8 text-center border-t border-x border-indigo-100/50">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-650 mb-3 shadow-sm">
            <MapPin size={18} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-2">
            Find Our Centre Near You
          </h2>
          <p className="text-gray-500 text-sm font-semibold">
            Visit our branch for personalized one on one consultation.
          </p>
        </div>

        {/* City Tabs Grid overlaying the header */}
        <div className="bg-white rounded-3xl p-5 md:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-slate-100 -mt-10 mx-4 md:mx-10 relative z-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 justify-center">
            {centres.map((centre) => {
              const isActive = activeCity.slug === centre.slug;
              return (
                <motion.button
                  key={centre.slug}
                  onClick={() => setActiveCity(centre)}
                  whileHover={{ 
                    y: -6, 
                    scale: 1.04,
                    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.08)"
                  }}
                  whileTap={{ scale: 0.96 }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border text-center cursor-pointer group
                    ${isActive 
                      ? `border-2 ${centre.activeBorder} ${centre.bgColor} shadow-md shadow-indigo-100/50` 
                      : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'}`}
                >
                  {/* Icon Box */}
                  <motion.div 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-colors ${centre.textColor}`}
                    animate={isActive ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : {}}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {centre.icon}
                  </motion.div>
                  <span className={`text-xs font-extrabold ${isActive ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    {centre.city}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected City Details Card */}
        <div className="mt-8 mx-4 md:mx-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCity.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row gap-10"
            >
              {/* Left Details */}
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${activeCity.bgColor} ${activeCity.textColor} text-[10px] font-bold uppercase tracking-widest rounded mb-6`}>
                  <MapPin size={12} strokeWidth={2.5} /> {activeCity.city} Branch
                </div>
                
                <h3 className="text-3xl font-extrabold text-[#0f172a] mb-8 pb-6 border-b border-gray-100/60">
                  {activeCity.city} Centre
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50/80 flex items-center justify-center text-gray-500 shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed max-w-sm">{activeCity.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50/80 flex items-center justify-center text-gray-500 shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Working Hours</p>
                      <p className="text-sm font-semibold text-slate-700">{activeCity.hours}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50/80 flex items-center justify-center text-gray-500 shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Number</p>
                      <p className="text-sm font-semibold text-slate-700">{activeCity.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right CTA / Action Area */}
              <div className="md:w-[240px] flex flex-col justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-100/60 pt-8 md:pt-0 md:pl-10">
                <button 
                  onClick={handleGetDirections}
                  className="w-full bg-white text-slate-700 px-6 py-4 rounded-xl font-bold text-sm shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Get Directions
                </button>
                <button 
                  onClick={() => openEligibilityModal(`Centre - ${activeCity.city}`)}
                  className="w-full bg-[#5b51e5] hover:bg-[#4a42c2] text-white px-6 py-4 rounded-xl font-bold text-sm shadow-[0_4px_14px_rgba(91,81,229,0.3)] transition-all cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default CentreLocator;
