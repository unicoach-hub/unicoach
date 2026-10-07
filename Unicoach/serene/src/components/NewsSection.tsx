import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Calendar, ArrowRight, Video, Play } from 'lucide-react';

interface NewsSectionProps {
  onOpenModal: (newsTitle: string) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ onOpenModal }) => {
  const newsList = [
    {
      id: '1',
      title: 'New Student Visa Rules for UK and Germany: What You Need to Know for Fall 2026',
      category: 'Visa News',
      date: 'Jul 5, 2026',
      desc: 'Stay informed on the latest immigration changes. Learn about the new block account thresholds for Germany and sponsorship checks for the UK.',
    },
    {
      id: '2',
      title: 'UniCoach Announces Expansion of Offline Student Centers with 15 New Hubs in 2026',
      category: 'Corporate Update',
      date: 'Jul 5, 2026',
      desc: 'Study abroad advisor UniCoach is launching 15 new physical mock test and university counselling hubs across India in 2026.',
    },
  ];

  const digestList = [
    {
      id: '1',
      title: 'Ultimate Student Accommodation Guide for Munich: Cost & Location Analysis',
      category: 'Expert Insight',
      length: '5 Min Read',
      isVideo: false,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
      desc: 'An expert breakdown of public student dorms (Studentenwerk), private shared apartments (WG), and cost metrics across popular boroughs in Munich, Germany.',
    },
    {
      id: '2',
      title: 'How I Got a Fully-Funded Scholarship to study Data Science at Stanford University',
      category: 'Student Review',
      length: '8:42',
      isVideo: true,
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80',
      desc: 'Meet Rohit Sen, a UniCoach alumnus who shares his application strategy, Statement of Purpose (SOP) hacks, and tips for matching with assistantships to get a full tuition waiver.',
    },
  ];

  return (
    <section className="py-24 bg-[#0a0f29] text-white relative overflow-hidden select-none">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div className="text-left">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-3 block">
              UniCoach Bulletin
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white font-instrument">
              Latest <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">News & Student Updates</span>
            </h2>
            <p className="text-slate-400 text-sm font-semibold mt-3 max-w-xl">
              Stay updated with the latest visa rules, official company announcements, and expert-curated student success reviews.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Newsroom Updates (7 Columns) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-instrument">
                <Newspaper className="text-indigo-400" size={20} />
                <span>Newsroom Updates</span>
              </h3>
              <button 
                onClick={() => onOpenModal('Newsroom Overview')}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Visit Newsroom</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-4">
              {newsList.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  onClick={() => onOpenModal(`News: ${item.title}`)}
                  className="p-6 bg-slate-950/50 border border-white/10 rounded-3xl flex flex-col sm:flex-row gap-6 hover:border-blue-400/40 hover:bg-slate-950/80 transition-all duration-300 cursor-pointer group shadow-xl"
                >
                  <div className="flex flex-col justify-between flex-grow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase text-indigo-300">
                        <span>{item.category}</span>
                        <span className="flex items-center gap-1 text-slate-500 font-bold">
                          <Calendar size={11} />
                          {item.date}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors leading-snug font-instrument">
                        {item.title}
                      </h4>
                      <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 group-hover:text-indigo-300 mt-4 flex items-center gap-1">
                      Read details <ArrowRight size={10} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Student Digest & Spotlights (5 Columns) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-instrument">
                <Video className="text-indigo-400" size={20} />
                <span>Student Spotlight & Insights</span>
              </h3>
              <button 
                onClick={() => onOpenModal('Digest Overview')}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Digest</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-6">
              {digestList.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  onClick={() => onOpenModal(`Digest: ${item.title}`)}
                  className="bg-slate-950/50 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-400/40 hover:bg-slate-950/80 transition-all duration-300 cursor-pointer group flex flex-col shadow-xl"
                >
                  <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden border-b border-white/5">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {item.isVideo && (
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-all">
                        <div className="w-12 h-12 rounded-full bg-white/90 text-indigo-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Play size={16} className="fill-indigo-950 ml-0.5" />
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-3 right-3 bg-black/70 border border-white/10 px-2 py-0.5 rounded text-[10px] font-black text-white">
                      {item.length}
                    </span>
                  </div>
                  <div className="p-6 space-y-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-white text-base leading-snug group-hover:text-indigo-400 transition-colors mt-2 font-instrument">
                      {item.title}
                    </h4>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};
