import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, Table, AlertCircle, Sparkles, 
  Building, ListFilter, HelpCircle, ChevronDown, Award, Globe, DollarSign, 
  BookOpen, Compass, ShieldCheck, Check, ShieldAlert, Coins, Users, FileText,
  Briefcase, HeartPulse
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'benefits', title: 'Why Choose France?' },
  { id: 'academic-excellence', title: 'Grandes Écoles System' },
  { id: 'career-outlook', title: 'Career & Salary Outcomes' },
  { id: 'schengen-visa', title: '5-Year Schengen Grant' },
  { id: 'housing-healthcare', title: 'Living Support' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const keyBenefits = [
  {
    title: "Taxpayer-Subsidized Public Education",
    desc: "The French government heavily funds state universities, capping annual fees for non-EU students at €2,770 for Bachelor's and €3,770 for Master's. A highly strategic, low-tuition option compared to the US, UK, or Canada.",
    icon: Coins
  },
  {
    title: "Elite Grandes Écoles System",
    desc: "Study at top-tier business schools (INSEAD, HEC Paris, ESSEC, EDHEC) or engineering universities (École Polytechnique, CentraleSupélec) that are consistently placed in global Top 10 lists and maintain close corporate ties.",
    icon: Award
  },
  {
    title: "5-Year Short-Stay Alumni Visa",
    desc: "Unique bilateral agreements grant Indian postgraduate alumni (who have obtained a Master's degree from a French institution) a 5-year short-stay Schengen visa, enabling seamless travel and networking access across Europe.",
    icon: ShieldCheck
  },
  {
    title: "Schengen Mobility (29 Countries)",
    desc: "Your student visa acts as an entry pass to travel freely (up to 90 days in any 180-day cycle) across the entire Schengen Area (including Germany, Italy, Spain, Switzerland, and Sweden) without additional visas.",
    icon: Globe
  },
  {
    title: "CAF Housing Subsidy & Allowances",
    desc: "All international students are eligible to apply for CAF housing assistance (Caisse d’Allocations Familiales), which subsidizes monthly rent by 30% to 50% directly to your landlord.",
    icon: Building
  },
  {
    title: "Free Healthcare Registration",
    desc: "Once enrolled, international students register for French social security (Sécurité Sociale) for free, covering up to 70% of standard doctor consultations and prescription medicines.",
    icon: HeartPulse
  }
];

const salaryOutcomes = [
  { sector: "Data Science, AI & Applied Math", avgSal: "€35,000 - €45,000 / yr", companies: "Consulting firms, Airbus, Peugeot, French tech start-ups" },
  { sector: "Business, Finance & Consulting", avgSal: "€32,000 - €40,000 / yr", companies: "Top banks, L'Oreal, BCG, Capgemini, ESSEC partner networks" },
  { sector: "Engineering & Advanced Systems", avgSal: "€36,000 - €43,000 / yr", companies: "Renault Group, Dassault Systems, Safran, Alstom" }
];

const FranceWhyStudy = () => {
  const [activeSection, setActiveSection] = useState('benefits');
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcff] pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <Link to="/study-abroad/france" className="hover:text-indigo-650 transition-colors">France</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">Why Study in France</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&auto=format&fit=crop&q=80" 
              alt="France Overview" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Sparkles size={14} />
              Study in France
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Why Study in France: Subsidized Tuition, Elite Grandes Écoles & 5-Year Visa
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              From top business management institutes to world-class public engineering schools, France offers exceptional academic credentials and strong post-study opportunities for Indian scholars.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: March 11, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                8 min read
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Sidebar Navigator */}
          <div className="lg:col-span-3 sticky top-28 hidden lg:block bg-white/70 border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <ListFilter size={16} className="text-indigo-650" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Benefits Navigator</span>
            </div>
            <div className="space-y-1.5">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer block
                    ${activeSection === sec.id 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'}`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Content Blocks */}
          <div className="lg:col-span-9 space-y-16">
            
            {/* 1. Why Choose France? (Benefits Grid) */}
            <section id="benefits" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">💡 Key Benefits of Choosing France</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Understand how France supports international student cohorts</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {keyBenefits.map((b, idx) => {
                  const Icon = b.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                          <Icon size={18} />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-2 group-hover:text-indigo-650 transition-colors">{b.title}</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{b.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 2. Elite Grandes Écoles System */}
            <section id="academic-excellence" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Building className="text-indigo-650" size={24} />
                  🏛️ The Grandes Écoles System
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  Unlike traditional academic structures, France has a highly selective parallel network called **Grandes Écoles**. These elite institutes focus on engineering and business management, maintaining massive recruiter links and top global rankings.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Business & Management Elite</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Institutions like **HEC Paris, INSEAD, ESSEC, and EDHEC** consistently place in the global Top 10 business rankings (Financial Times) for Masters in Management and MBA programs.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Engineering & Science Powerhouses</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Institutions like **École Polytechnique and CentraleSupélec** train elite engineering talent, supported by state research partnerships and global industrial linkages.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Career & Salary Outcomes */}
            <section id="career-outlook" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/65 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Briefcase className="text-indigo-650" size={22} />
                  💼 Professional Career Outcomes
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Explore starting salary ranges and recruiting networks in France</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Professional Sector</th>
                        <th className="pb-3 pr-4">Starting Salary Range (Avg)</th>
                        <th className="pb-3 pr-4 text-right">Recruiter Network</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      {salaryOutcomes.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-900 font-extrabold">{row.sector}</td>
                          <td className="py-4 text-indigo-650 font-black">{row.avgSal}</td>
                          <td className="py-4 text-right text-slate-500 font-medium text-xs max-w-xs">{row.companies}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 4. 5-Year Schengen Grant */}
            <section id="schengen-visa" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8">
                <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                  <Globe className="text-indigo-300" size={24} />
                  🇪🇺 5-Year Schengen Visa for Indian Alumni
                </h2>
                <p className="text-indigo-200/90 text-sm font-semibold leading-relaxed mb-6">
                  Under unique bilateral agreements, Indian postgraduate alumni who have completed a Master's degree (or equivalent postgraduate qualification) from any recognized French Higher Education Institution are eligible to receive a **5-year short-stay Schengen visa**.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block mb-2">Step 1</span>
                    <h4 className="font-extrabold text-xs mb-2">Graduate</h4>
                    <p className="text-white/80 text-[11px] leading-relaxed font-medium">
                      Successfully complete your Master's or MBA from a certified French institution.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block mb-2">Step 2</span>
                    <h4 className="font-extrabold text-xs mb-2">Apply on Return</h4>
                    <p className="text-white/80 text-[11px] leading-relaxed font-medium">
                      Apply through VFS in India to convert your residency into a 5-year Schengen visa grant.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block mb-2">Step 3</span>
                    <h4 className="font-extrabold text-xs mb-2">Easy Travel</h4>
                    <p className="text-white/80 text-[11px] leading-relaxed font-medium">
                      Travel and network freely across all 29 Schengen countries for up to 90 days per trip.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Living Support (CAF & Healthcare) */}
            <section id="housing-healthcare" className="scroll-mt-24">
              <div className="bg-sky-50/50 border border-sky-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-905 mb-2 flex items-center gap-2">
                  <Compass className="text-sky-600" size={24} />
                  🛡️ Exceptional Welfare & Living Support
                </h2>
                <p className="text-slate-650 text-sm font-semibold leading-relaxed mb-6">
                  France is unique in extending identical social security and welfare benefits to international students as it does to local French citizens.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Building size={14} className="text-sky-600" />
                      CAF Housing Subsidies
                    </h4>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                      All international students can register with the Caisse d'Allocations Familiales (CAF). CAF subsidizes student accommodation rent by **30% to 50%**, paid directly to your housing landlord.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <HeartPulse size={14} className="text-rose-500" />
                      Free Healthcare Coverage
                    </h4>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                      Register for free with French statutory social security (Sécurité Sociale). The state covers up to **70%** of standard consultation fees, and up to **100%** for major treatments.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about studying in France</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Is studying in France free for international students?", a: "While not entirely free, tuition fees at French public universities are heavily subsidized by the government. Annual fees for non-EU students are capped at €2,770 for Bachelor's and €3,770 for Master's programs." },
                  { q: "Can I study in France in English?", a: "Yes, there are over 1,500 programs taught entirely in English in France, especially in business management, engineering, and data science sectors." },
                  { q: "What is the CAF subsidy in France?", a: "CAF stands for Caisse d'Allocations Familiales. It is a government welfare system that pays international students a monthly subsidy to offset the cost of renting accommodation, typically covering 30% to 50% of the rent." },
                  { q: "What are the benefits of the 5-Year Schengen alumni visa?", a: "Indian graduates of French Master's programs receive a 5-year short-stay visa. This enables multiple entries and free travel across the entire Schengen Area (29 countries) for up to 90 days per semester, facilitating networking and business meetings." },
                  { q: "Do I need to learn French to find a job in France?", a: "For technical roles in engineering or data science, English can be sufficient, but learning basic conversational French (B1/B2 level) significantly boosts your integration and job prospects in local corporate firms." }
                ].map((faq, idx) => {
                  const isOpen = !!faqOpen[idx];
                  return (
                    <div key={idx} className="bg-white border border-slate-150 rounded-2xl overflow-hidden transition-all duration-300">
                      <button 
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 text-xs md:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <div className="p-5 pt-0 border-t border-slate-50 text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

        </div>

        {/* CTA Section */}
        <div className="mt-16">
          <StudyAbroadCTA country="France" />
        </div>

      </div>
    </div>
  );
};

export default FranceWhyStudy;
