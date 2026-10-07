import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Award, BookOpen, PlaneTakeoff, Sparkles, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface ServicesSectionProps {
  onOpenModal: (serviceTitle?: string) => void;
}

const SERVICES = [
  {
    icon: <Target className="w-6 h-6 text-blue-600" />,
    tag: 'Step 01',
    title: 'University Shortlisting',
    description: 'Get personalized university shortlists based on your academic profile, budget, career goals, and acceptance odds.',
    highlights: ['AI Profile Match', 'Top 500 Uni Database', 'Budget Tailored'],
    accentColor: '#2563eb',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  {
    icon: <Award className="w-6 h-6 text-orange-600" />,
    tag: 'Step 02',
    title: 'Scholarships & Loans',
    description: 'Access exclusive global scholarship grants and collateral-free education loans with competitive low interest rates.',
    highlights: ['Up to 100% Grants', 'No Collateral Loans', 'Pre-Approved Terms'],
    accentColor: '#f26522',
    badgeBg: 'bg-orange-50 text-orange-800 border-orange-200/80',
  },
  {
    icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
    tag: 'Step 03',
    title: 'Test Preparation',
    description: 'Expert-led online & offline masterclasses for IELTS, TOEFL, GRE, GMAT, and PTE with guaranteed target score band.',
    highlights: ['Certified Mentors', 'Unlimited Mock Tests', 'Target Score Guarantee'],
    accentColor: '#059669',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  {
    icon: <PlaneTakeoff className="w-6 h-6 text-purple-600" />,
    tag: 'Step 04',
    title: 'Visa Assistance',
    description: 'End-to-end visa filing, document verification, SOP review, and 1-on-1 embassy mock interviews for 99% success rate.',
    highlights: ['99% Success Rate', '1-on-1 Mock Interviews', 'Financial Audit Support'],
    accentColor: '#7c3aed',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenModal }) => {
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  return (
    <section
      id="services-section"
      className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9]/60 to-[#f8fafc]"
      onMouseLeave={() => setHoveredCardIndex(null)}
    >
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-100/30 via-blue-100/20 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-[1340px] mx-auto px-6 md:px-10 relative z-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black uppercase tracking-[0.25em] mb-4 shadow-sm">
            <Sparkles size={14} className="text-blue-600" />
            <span>End-To-End Global Admissions Roadmap</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-5 tracking-tight leading-tight font-instrument">
            Expert Guidance at{' '}
            <span className="bg-gradient-to-r from-[#2563eb] via-[#f26522] to-[#2563eb] bg-clip-text text-transparent">
              Every Single Step
            </span>
          </h2>

          <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg font-medium leading-relaxed">
            Personalized, tech-enabled support from planning your study abroad journey to arriving at your dream university.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 relative">
          {SERVICES.map((service, index) => {
            const isHovered = hoveredCardIndex === index;

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                onMouseEnter={() => setHoveredCardIndex(index)}
                onClick={() => onOpenModal(service.title)}
                className="relative bg-white/90 backdrop-blur-md rounded-3xl p-7 md:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 flex flex-col justify-between cursor-pointer group hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                {/* Top Accent Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-500"
                  style={{
                    background: service.accentColor,
                    opacity: isHovered ? 1 : 0.4,
                  }}
                />

                <div>
                  {/* Top Bar: Icon + Step Tag */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      {service.icon}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${service.badgeBg}`}>
                      {service.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div>
                  <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                    {service.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Learn More Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-black tracking-wider uppercase text-slate-400 group-hover:text-slate-900 transition-colors">
                      Learn More
                    </span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform duration-300 group-hover:translate-x-1"
                      style={{ background: service.accentColor }}
                    >
                      <ArrowUpRight size={16} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
