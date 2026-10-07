import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Clock, HelpCircle, CheckCircle2, ArrowRight, 
  Award, MapPin, Sparkles, Brain, Search, Briefcase, Coins, Database,
  GraduationCap, Globe, Compass, ShieldCheck, ChevronDown, ListFilter,
  Check, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'why-ma', title: 'Why MA in France?' },
  { id: 'top-schools', title: 'Top MA Colleges' },
  { id: 'disciplines', title: 'Popular Disciplines' },
  { id: 'cost-study', title: 'Tuition Ranges' },
  { id: 'careers', title: 'Stay-Back & Careers' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const topMaSchools = [
  { name: "Sorbonne University", qsRank: "#62 Global", field: "Literature, Philosophy, History, Languages", feesEUR: 3941, location: "Paris", website: "https://www.sorbonne-universite.fr" },
  { name: "Université PSL", qsRank: "#28 Global", field: "Fine Arts, Social Sciences, Cinema, Design", feesEUR: 3941, location: "Paris", website: "https://www.psl.eu" },
  { name: "Sciences Po Paris", qsRank: "#367 Global", field: "International Relations, Political Science, Diplomacy", feesEUR: 17500, location: "Paris", website: "https://www.sciencespo.fr" },
  { name: "IFM (Institut Français de la Mode)", qsRank: "World Class", field: "Fashion Design, Luxury Management", feesEUR: 22000, location: "Paris", website: "https://www.ifmparis.fr" },
  { name: "ENS de Lyon", qsRank: "#205 Global", field: "Humanities, Foreign Languages, Modern Arts", feesEUR: 243, location: "Lyon", website: "https://www.ens-lyon.fr" },
  { name: "ESMOD Paris", qsRank: "Top Fashion School", field: "Fashion Business, Creative Haute Couture", feesEUR: 15500, location: "Paris", website: "https://www.esmod.com" },
  { name: "Université Paris Cité", qsRank: "#300 Global", field: "Art History, Cinema Studies, Sociology", feesEUR: 11000, location: "Paris", website: "https://u-paris.fr" }
];

const maSpecializations = [
  {
    name: "Fashion & Luxury Design",
    colleges: "IFM, ESMOD Paris, LISAA",
    desc: "Unparalleled creative immersion in the fashion capital of the world. Heavy emphasis on design portfolios, draping, and sustainable luxury business models."
  },
  {
    name: "International Relations & Policy",
    colleges: "Sciences Po, PSL, Panthéon-Sorbonne",
    desc: "Deep focus on European studies, diplomatic protocols, international law, and global governance. Prepares students for careers at NGOs and embassies."
  },
  {
    name: "Cinema & Media Studies",
    colleges: "La Fémis, Université PSL, Sorbonne Nouvelle",
    desc: "Combines theory of film history with practical direction, scriptwriting, and editing workshops. Taught in collaboration with national production studios."
  },
  {
    name: "Philosophy & Comparative Literature",
    colleges: "Sorbonne University, ENS de Lyon",
    desc: "Historically prestigious tracks covering continental philosophy, classical studies, and modern literature. Conducted mostly in French."
  }
];

const FranceMACourse = () => {
  const [activeSection, setActiveSection] = useState('why-ma');
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 107.0; // Reference 1 EUR = 107 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = Math.round(valInEUR * exchangeRate);
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

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
          <span className="text-slate-600 font-bold">MA in France Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80" 
              alt="Eiffel Tower Paris" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Sparkles size={14} />
              Master of Arts (MA)
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Master of Arts (MA) in France
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Immerse yourself in Europe's cultural heartland. Pursue an MA in Fashion, Cinema, Diplomacy, or Philosophy at historic public universities and specialized art schools.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 23, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
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
            
            {/* 1. Why MA in France? */}
            <section id="why-ma" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🇫🇷 Why Study MA in France?</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Acquire creative and humanities credentials in Europe's cultural center</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-655">🎨 Creative Capitol</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Unparalleled prestige for fashion (IFM, ESMOD), cinema (La Fémis), and arts.
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-955 text-xs uppercase tracking-wider text-indigo-655">🏛️ Historic Universities</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Study at institutions like the Sorbonne or ENS de Lyon with generations of academic prestige.
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-655">💶 Affordable Public Tuition</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Public universities maintain heavily subsidized tuition fees capped at under **€4,000/year** for non-EU students.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Top MA Colleges */}
            <section id="top-schools" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Award className="text-indigo-655" size={24} />
                  Top Colleges offering MA Programs
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Explore the primary institutions for humanities, policy studies, and fashion design</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                        <th className="pb-3 pr-4">Institution</th>
                        <th className="pb-3 pr-4 text-center">QS Rank 2026</th>
                        <th className="pb-3 pr-4">Focus Disciplines</th>
                        <th className="pb-3 pr-4">Estimated Tuition Fees</th>
                        <th className="pb-3 pr-4 text-right">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-750 font-semibold">
                      {topMaSchools.map((school, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-955 font-black">{school.name}</td>
                          <td className="py-4 text-center">
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 text-[10px] font-black">{school.qsRank}</span>
                          </td>
                          <td className="py-4 text-slate-655 text-xs font-medium max-w-xs">{school.field}</td>
                          <td className="py-4 font-black text-indigo-655">
                            {formatCost(school.feesEUR)} / year
                          </td>
                          <td className="py-4 text-right text-slate-500 text-xs font-medium">{school.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 3. Popular Disciplines */}
            <section id="disciplines" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🎭 Popular MA Disciplines in France</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Key art, fashion, and social science tracks</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {maSpecializations.map((spec, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider block w-fit mb-4">
                        0{idx + 1}
                      </span>
                      <h3 className="text-base font-black text-slate-800 mb-1">{spec.name}</h3>
                      <div className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mb-3">Colleges: {spec.colleges}</div>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">{spec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Tuition Ranges */}
            <section id="cost-study" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Coins className="text-indigo-655" size={24} />
                  💰 Tuition Ranges for MA Studies
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Comparison of public university rates versus private studio and design schools</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">Public Universities</span>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                        Highly subsidized by the state (e.g. Sorbonne, Panthéon-Sorbonne, PSL).
                      </p>
                    </div>
                    <strong className="text-indigo-650 font-black text-sm md:text-base mt-4 block">
                      {formatCost(3941)} / year
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">Private Art & Fashion Schools</span>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                        Elite fashion design and cinema academies charging individual studio fees.
                      </p>
                    </div>
                    <strong className="text-indigo-655 font-black text-sm md:text-base mt-4 block">
                      {formatCost(12000)} - {formatCost(25000)} / year
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Stay-Back & Careers */}
            <section id="careers" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Briefcase className="text-indigo-650" size={24} />
                  📈 APS Stay-Back & Creative Placements
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Stay-back permits and career pipelines inside the EU</p>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-xs text-slate-700 font-semibold leading-relaxed">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">2-Year APS stay-back visa</h4>
                  <p className="text-slate-550 mb-4">
                    International MA graduates qualify for the 12-24 months **APS temporary residence permit** to search for full-time professional contracts or start creative freelance ventures.
                  </p>
                  <p className="text-slate-550">
                    **Placements**: Graduates find roles in design studios, luxury marketing divisions, international relations centers, public think-tanks, and publishing firms.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about MA courses in France</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Are MA courses in France taught in English?", a: "Yes, many specialized MA tracks (especially in international relations, design management, and fashion business) are taught 100% in English. However, traditional arts and literature courses at public universities are predominantly French-taught." },
                  { q: "Is a portfolio required for creative MA courses?", a: "Yes, design, fashion, and cinema schools (like IFM, ESMOD, and La Fémis) require candidates to submit a comprehensive creative portfolio representing their artistic capabilities." },
                  { q: "Can MA graduates work part-time in France?", a: "Yes. Students holding VLS-TS student visas are legally permitted to work up to 964 hours annually (~20 hours per week) during their studies." }
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

export default FranceMACourse;
