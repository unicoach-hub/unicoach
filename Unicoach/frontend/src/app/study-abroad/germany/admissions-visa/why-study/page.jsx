import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, BookOpen, GraduationCap, Briefcase, Globe, Heart, Shield, 
  Coins, ArrowRight, ListFilter, MapPin, CheckCircle2, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'benefits', title: 'Why Choose Germany?' },
  { id: 'placements', title: 'Industries & Placements' },
  { id: 'salaries', title: 'Starting Salaries' },
  { id: 'budget', title: 'Monthly Student Budget' }
];

const WhyStudyGermany = () => {
  const [activeSection, setActiveSection] = useState('benefits');
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const exchangeRate = 107.0; // Reference 1 EUR = 107 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    if (valInINR === 0) return 'Free';
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  const formatRawString = (str) => {
    // e.g. "€58,000 – €68,000"
    if (currency === 'EUR') return str;
    const parts = str.split(' – ');
    if (parts.length === 2) {
      const p1 = parseInt(parts[0].replace('€', '').replace(',', ''));
      const p2 = parseInt(parts[1].replace('€', '').replace(',', ''));
      return `${formatCost(p1)} - ${formatCost(p2)}`;
    }
    return str;
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

  const advantages = [
    {
      icon: <GraduationCap className="text-indigo-650" size={24} />,
      title: "Zero Tuition Fees",
      desc: "Almost all public universities in Germany offer free education to international students, charging only a minor semester contribution (€150–€350) which covers administration and public transit."
    },
    {
      icon: <Award className="text-indigo-650" size={24} />,
      title: "Academic Excellence",
      desc: "Home to the prestigious TU9 (alliance of top technical universities) and highly practical Fachhochschulen. German degrees carry immense prestige worldwide."
    },
    {
      icon: <Briefcase className="text-indigo-650" size={24} />,
      title: "18-Month Job Seeker Visa",
      desc: "Graduates are granted an 18-month post-study work permit to find employment related to their degree. Finding a job fast-tracks you to permanent residency (PR) in just 2 years."
    },
    {
      icon: <BookOpen className="text-indigo-650" size={24} />,
      title: "English-Taught Master's",
      desc: "Germany offers over 1,930 English-taught master's programs across STEM, business, humanities, and social sciences, making it highly accessible for Indian students."
    },
    {
      icon: <Globe className="text-indigo-650" size={24} />,
      title: "Travel & Schengen Access",
      desc: "Your German student visa acts as a Schengen visa, permitting you to travel visa-free across 29 European countries for leisure, networking, or internships."
    },
    {
      icon: <Shield className="text-indigo-650" size={24} />,
      title: "Part-Time Work Rights",
      desc: "Students are allowed to work part-time for up to 140 full days (or 280 half days) per calendar year, helping offset living costs through on-campus or corporate roles."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafcff] pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <Link to="/study-abroad/germany" className="hover:text-indigo-650 transition-colors">Germany</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">Why Study in Germany</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&auto=format&fit=crop&q=80" 
              alt="German university campus" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Heart size={14} className="text-indigo-400 animate-pulse" />
              Germany Perks
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Why Study in Germany? Benefits & Careers
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Germany has emerged as one of the world's most popular non-English-speaking study destinations. With world-class public education, free tuition structures, and strong engineering and technology industrial bases, Germany represents a premier return on academic investment.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: June 25, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <GraduationCap size={13} className="text-indigo-400" />
                8 min read
              </span>
            </div>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-xs inline-flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase px-3 tracking-wider">Currency Context:</span>
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2-Column Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Sidebar Navigator */}
          <div className="lg:col-span-3 sticky top-28 hidden lg:block bg-white/70 border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <ListFilter size={16} className="text-indigo-650" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Page Navigator</span>
            </div>
            <div className="space-y-1.5">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer block
                    ${activeSection === sec.id 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-855 hover:bg-slate-50'}`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Content Blocks */}
          <div className="lg:col-span-9 space-y-16">
            
            {/* 1. Core Benefits */}
            <section id="benefits" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🇩🇪 Why Choose Germany for Higher Ed?</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Subsidized education and unmatched career prospects</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advantages.map((adv, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-[28px] p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
                        {adv.icon}
                      </div>
                      <h3 className="font-extrabold text-slate-905 text-xs mb-2">{adv.title}</h3>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{adv.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Placements */}
            <section id="placements" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Post-Graduation Career Opportunities</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Germany holds Europe's strongest economy, offering high-paying opportunities for graduates</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-700 font-semibold">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                  <h4 className="font-black text-indigo-650 text-xs mb-3">Strong Technical Industries</h4>
                  <p className="text-slate-500 font-semibold leading-relaxed mb-4">
                    Germany is globally famous for its automotive, manufacturing, and electrical engineering sectors. Companies like Bosch, Siemens, Daimler, BMW, and Volkswagen represent primary corporate recruiters.
                  </p>
                  <p className="text-slate-500 font-semibold leading-relaxed">
                    Additionally, cities like Berlin and Munich have built booming software, artificial intelligence, and e-commerce startup scenes (e.g. SAP, Zalando, N26, BioNTech).
                  </p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                  <h4 className="font-black text-indigo-650 text-xs mb-3">Fast-Track Route to Permanent Residency (PR)</h4>
                  <p className="text-slate-500 font-semibold leading-relaxed mb-4">
                    Under German immigration law, graduates from recognized German public or private universities are eligible for a fast-track Permanent Residency (Niederlassungserlaubnis) after holding a professional job for just 2 years.
                  </p>
                  <p className="text-slate-500 font-semibold leading-relaxed">
                    Furthermore, Germany's new naturalization laws allow eligible workers to apply for German citizenship (including dual citizenship options) after just 5 years of working in the country.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Starting Salaries */}
            <section id="salaries" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-xs overflow-hidden">
                <h2 className="text-xl md:text-2xl font-black text-slate-905 mb-2">Average Entry-Level Salaries</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Estimated gross starting salaries for international graduates in Germany</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Industry Sector</th>
                        <th className="pb-3 pr-4">Starting Salary (Gross / Yr)</th>
                        <th className="pb-3 pr-4 text-right">Top Locations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-750 font-semibold">
                      {[
                        { s: "Computer Science & IT (Software Engineer)", sal: "€58,000 – €68,000", loc: "Berlin, Munich, Hamburg" },
                        { s: "Automotive & Mechanical Engineering", sal: "€55,000 – €65,000", loc: "Munich, Stuttgart, Wolfsburg" },
                        { s: "Data Science & Analytics", sal: "€58,000 – €66,000", loc: "Frankfurt, Munich, Berlin" },
                        { s: "Business, Finance & Consulting", sal: "€52,000 – €62,000", loc: "Frankfurt, Düsseldorf, Munich" },
                        { s: "Biotechnology & Chemical Engineering", sal: "€50,000 – €58,000", loc: "Ludwigshafen, Leverkusen, Hamburg" }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-808 font-black">{row.s}</td>
                          <td className="py-4 text-indigo-650 text-xs font-black">{formatRawString(row.sal)}</td>
                          <td className="py-4 text-right text-slate-500 font-medium text-xs">{row.loc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 4. Monthly Student Budget */}
            <section id="budget" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💶 Estimated Monthly Student Budget
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Average breakdown of student expenses in mid-sized German cities</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-center text-slate-700">
                  {[
                    { title: "Accommodation", cost: "€350 – €550", note: "Student housing or shared flats (WG)" },
                    { title: "Statutory Insurance", cost: "€110 – €130", note: "TK or AOK health insurance" },
                    { title: "Food & Groceries", cost: "€200 – €250", note: "Discount supermarkets (Aldi, Lidl)" },
                    { title: "Leisure & Utilities", cost: "€100 – €150", note: "Mobile, internet, travel, social" }
                  ].map((p, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{p.title}</span>
                        <p className="text-xs font-black text-indigo-650 leading-snug">{formatRawString(p.cost)}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold block mt-1.5 leading-relaxed">{p.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>

        </div>

        {/* CTA Section */}
        <div className="mt-16">
          <StudyAbroadCTA country="Germany" />
        </div>

      </div>
    </div>
  );
};

export default WhyStudyGermany;
