import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Star, Award, ArrowUpRight } from 'lucide-react';

interface EventsSectionProps {
  onOpenModal: (eventTitle: string) => void;
}

const speakers = [
  { name: 'Joshua Vasudevan', desc: 'PhD Researcher at Loughborough University, UK', initials: 'JV' },
  { name: 'Tanisha Mandre', desc: 'Engineer @ Google, MSc from Imperial College, London', initials: 'TM' },
  { name: 'Hardik Khetrapal', desc: 'International Business Management from Seneca College, Canada', initials: 'HK' },
  { name: 'Prateek Uniyal', desc: 'Global Business Management from Humber College, Canada', initials: 'PU' },
];

const whyAttend = [
  { icon: <Star size={24} />, title: 'Top Speakers', desc: 'Hear from Indian students living abroad, university reps, counsellors & experts' },
  { icon: <Award size={24} />, title: 'Quality Content', desc: 'You get personal insights & guidance straight from the best speakers' },
  { icon: <Users size={24} />, title: 'Networking', desc: 'Meet fellow study abroad aspirants and seniors' },
];

export const EventsSection: React.FC<EventsSectionProps> = ({ onOpenModal }) => {
  return (
    <section id="events" className="py-24 bg-[#f8fafc] overflow-hidden relative select-none">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 space-y-24 relative z-10">
        
        {/* 1. Featured Event & Stats */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-gray-500 text-sm md:text-base font-medium uppercase tracking-widest mb-4">
              Join Our Global Network
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-instrument">
              Meet Our Top Experts & University Reps
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Featured Event Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-3 bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-center relative overflow-hidden group hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.15)] transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-3xl transform origin-top group-hover:scale-y-110 transition-transform duration-500" />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] group-hover:bg-indigo-100 transition-colors duration-500 pointer-events-none" />

              <div className="relative z-10 text-left">
                <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-full mb-8 border border-indigo-100">
                  Featured Event
                </span>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-[1.15] tracking-tight font-instrument">
                  Study in Germany 2027: Complete Roadmap from University Selection to Admission
                </h3>
                
                <div className="flex flex-wrap gap-4 mb-10">
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                    <Calendar size={18} className="text-indigo-500" /> JUL 7, 2026
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                    <Clock size={18} className="text-indigo-500" /> 01:25 PM - 03:25 PM
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                    <Users size={18} /> Speaker: Joshua Vasudevan (PhD Researcher, UK)
                  </div>
                </div>

                <button
                  onClick={() => onOpenModal('Event: Study in Germany 2027')}
                  className="w-fit bg-[#4f46e5] hover:bg-[#4338ca] text-white px-10 py-4 rounded-2xl font-bold text-base shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  Register Now For Free
                </button>
              </div>
            </motion.div>

            {/* 4 Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
              {[
                { icon: <Users size={28} className="text-blue-500" />, val: '300k+', label: 'Attendees' },
                { icon: <Calendar size={28} className="text-indigo-500" />, val: '500+', label: 'Events Organized' },
                { icon: <Star size={28} className="text-purple-500" />, val: '4.8/5', label: 'Student Rating' },
                { icon: <Award size={28} className="text-emerald-500" />, val: '#1', label: 'In Study Abroad' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col justify-center gap-4 group hover:-translate-y-1.5 transition-transform duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg transition-all duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Upcoming Events */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-slate-900 mb-12 text-center font-instrument"
          >
            Upcoming Events
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 group flex flex-col"
            >
              <div className="h-[180px] bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] p-6 relative flex items-center justify-center overflow-hidden">
                <div className="absolute top-5 left-5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                  ROADMAP MASTERCLASS
                </div>
                <h2 className="text-white text-6xl font-black tracking-tighter opacity-90 group-hover:scale-110 transition-transform duration-500 drop-shadow-xl">UK</h2>
              </div>
              <div className="p-8 flex flex-col flex-1 relative bg-white text-left">
                <div className="flex items-center justify-between text-[11px] font-black text-indigo-600 mb-4 tracking-wider uppercase">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> JUL 10, 2026 • 01:25 PM - 02:25 PM</span>
                </div>
                <h4 className="text-slate-900 font-bold text-lg leading-snug mb-6 flex-1 group-hover:text-indigo-600 transition-colors duration-300 font-instrument">
                  UK 2026 Masters Roadmap: Scholarships, Jobs & Visa Guidelines
                </h4>
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-lg">Speaker: Tanisha Mandre</span>
                  <button
                    onClick={() => onOpenModal('Event: UK 2026 Masters Roadmap')}
                    className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-[0_5px_15px_rgba(79,70,229,0.3)] hover:bg-[#4338ca] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Register Now</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 3. Why should you attend */}
        <div className="bg-white rounded-[40px] p-12 border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative">
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-16 font-instrument"
          >
            Why Should You Attend Our Events?
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {whyAttend.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="text-center flex flex-col items-center relative z-10 group"
              >
                <div className="w-20 h-20 bg-white border-4 border-gray-50 shadow-xl text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-indigo-50 transition-all duration-500">
                  {item.icon}
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3">{item.title}</h4>
                <p className="text-[15px] text-gray-500 leading-relaxed px-4 font-semibold">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 4. Our Previous Speakers */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-12 font-instrument"
          >
            Our Previous Speakers
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {speakers.map((speaker, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 35, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-[32px] p-8 text-center border border-gray-100 shadow-sm hover:-translate-y-3 transition-all duration-500 group h-full"
              >
                <div className="w-20 h-20 mx-auto border-2 border-indigo-100 rounded-full flex items-center justify-center mb-6 bg-indigo-50 text-indigo-700 font-black text-2xl group-hover:scale-105 transition-transform">
                  {speaker.initials}
                </div>
                <h4 className="font-black text-slate-900 text-[17px] mb-2">{speaker.name}</h4>
                <p className="text-[13px] font-semibold text-gray-500 leading-relaxed">{speaker.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
