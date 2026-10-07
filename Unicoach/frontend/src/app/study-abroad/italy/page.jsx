import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, MapPin, Award, BookOpen, Clock, Globe,
  CheckCircle2, ArrowRight, Search, Sparkles, Coins, Plane
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../components/StudyAbroadCTA';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../utils/universitySearchMatcher';

const italyUniversities = [
  { id: 'it-1', name: "University of Bologna", city: "Bologna", rank: "#133 Global", type: "Public University", eligibility: "IELTS 6.0+, high school board 75%+, TOLC exam (some)", website: "https://www.unibo.it", logo: "https://logo.clearbit.com/unibo.it", courses: ["Law", "Medicine", "Engineering", "Economics", "Humanities", "Computer Science"] },
  { id: 'it-2', name: "Sapienza University of Rome", city: "Rome", rank: "#115 Global", type: "Public University", eligibility: "IELTS 6.0+, strong GPA, course pre-selection interview", website: "https://www.uniroma1.it", logo: "https://logo.clearbit.com/uniroma1.it", courses: ["Classics", "Physics", "Computer Science", "Artificial Intelligence", "Architecture", "Engineering"] },
  { id: 'it-3', name: "Politecnico di Milano", city: "Milan", rank: "#111 Global", type: "Public / Engineering", eligibility: "IELTS 6.0+, portfolio (Design/Arch), TOLC-I exam", website: "https://www.polimi.it", logo: "https://logo.clearbit.com/polimi.it", courses: ["Architecture", "Design", "Civil Engineering", "Mechanical Engineering", "Computer Science", "Data Science"] },
  { id: 'it-4', name: "University of Padua", city: "Padua", rank: "#200 Global", type: "Public University", eligibility: "IELTS 5.5+, pre-selection assessment", website: "https://www.unipd.it", logo: "https://logo.clearbit.com/unipd.it", courses: ["Physics", "Medicine", "Psychology", "Biotechnology", "Business Administration", "Data Science"] },
  { id: 'it-5', name: "University of Milan", city: "Milan", rank: "#167 Global", type: "Public University", eligibility: "IELTS 6.0+, pre-assessment interview", website: "https://www.unimi.it", logo: "https://logo.clearbit.com/unimi.it", courses: ["Medicine", "Law", "Computer Science", "Finance", "Political Science"] },
  { id: 'it-6', name: "Bocconi University", city: "Milan", rank: "Top Business School", type: "Private / Business", eligibility: "GMAT/GRE/Bocconi Test, IELTS 7.0+, essays", website: "https://www.unibocconi.it", logo: "https://logo.clearbit.com/unibocconi.it", courses: ["Business Administration", "Economics", "Finance", "Management", "Data Analytics", "Marketing"] },
  { id: 'it-7', name: "University of Pisa", city: "Pisa", rank: "#350 Global", type: "Public University", eligibility: "IELTS 5.5+, academic pre-selection", website: "https://www.unipi.it", logo: "https://logo.clearbit.com/unipi.it", courses: ["Computer Science", "Physics", "Engineering", "Mathematics", "Agriculture"] },
  { id: 'it-8', name: "University of Turin", city: "Turin", rank: "#300 Global", type: "Public University", eligibility: "IELTS 5.5+, science background", website: "https://www.unito.it", logo: "https://logo.clearbit.com/unito.it", courses: ["Economics", "Law", "Management", "Medicine", "Biotechnology", "Computer Science"] }
];

const ItalyOverview = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  const exchangeRate = 103.58; // Reference 1 EUR ≈ 103.58 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  const filteredUnis = italyUniversities.filter(uni => {
    const matchesSearch = matchesUniversitySearch(uni, searchTerm);
    const matchesType = selectedType === 'All' || uni.type === selectedType;
    const matchesCity = selectedCity === 'All' || uni.city.includes(selectedCity);
    return matchesSearch && matchesType && matchesCity;
  });

  const cities = ['All', 'Rome', 'Milan', 'Bologna', 'Padua', 'Turin'];

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/30 via-indigo-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/10 to-blue-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-655 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Study in Italy</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 text-left"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
              <Plane size={14} className="text-indigo-650 animate-pulse" />
              <span>Italy Study Guide 2026/27</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Study in Italy for an{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-655 bg-clip-text text-transparent">Affordable Career</span>
            </h1>
            <p className="text-slate-655 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mb-8">
              Experience world-class European education. Italy combines historically prestigious public universities with full tuition waivers and stipends under regional <strong>DSU scholarships</strong>, making quality degrees highly accessible.
            </p>
            <a 
              href="#university-finder" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#DE5C2B] hover:bg-blue-650 text-white font-bold text-sm rounded-2xl shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
            >
              <span>Find Your Preferred University</span>
              <ArrowRight size={16} />
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className="w-full h-[320px] md:h-[380px] rounded-[36px] overflow-hidden shadow-xl border border-white/60 relative">
              <img 
                src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200" 
                alt="Colosseum, Rome" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Colosseum, Rome</p>
                <h3 className="text-xl font-black mt-1">Academic Heritage & Rich Culture</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: "€500 - €4,000", label: "Public Tuition / Year" },
            { val: "DSU Scholarship", label: "100% Free Option" },
            { val: "20 Hours", label: "Part-Time Work Limit" },
            { val: "12 Months", label: "Post-Study Stay-Back" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-xs backdrop-blur-md text-left">
              <p className="text-xl font-black text-indigo-655">{stat.val}</p>
              <p className="text-[10px] text-slate-500 font-extrabold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-sm inline-flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-black uppercase px-3 tracking-wider">Currency Tool:</span>
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* QUICK NAVIGATION SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          {[
            { title: "Italy Intakes", path: "/study-abroad/italy/intakes", desc: "Compare September vs February timelines and prepare ahead." },
            { title: "Student Visa Guide", path: "/study-abroad/italy/visa", desc: "Understand Type D National Visa rules and checklist requirements." },
            { title: "Study for Free (DSU)", path: "/study-abroad/italy/free", desc: "Learn about the ISEE Parificato and 100% regional tuition waivers." }
          ].map((nav, i) => (
            <Link 
              key={i} 
              to={nav.path}
              className="bg-white/60 border border-slate-100 p-6 rounded-2xl shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <h3 className="font-black text-slate-900 text-sm mb-2 group-hover:text-indigo-650 transition-colors flex items-center justify-between">
                  <span>{nav.title}</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">{nav.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* SECTION 1: UNIVERSITY FINDER */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Italy University Finder</h2>
            <p className="text-slate-500 text-xs font-semibold">Search top public universities, engineering schools, and business colleges in Italy.</p>
          </div>

          <div className="bg-white/50 border border-white rounded-[28px] p-6 backdrop-blur-xl shadow-xs mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course (e.g. CS, Medicine, Architecture), university..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-xs font-semibold outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full lg:w-auto scrollbar-none py-1">
              {cities.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-3.5 py-2 text-[10px] font-black rounded-xl transition-all cursor-pointer whitespace-nowrap ${selectedCity === c ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredUnis.map((uni) => {
                const matchedCourses = getMatchedCoursesForUniversity(uni, searchTerm);
                return (
                <motion.div
                  key={uni.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/60 border border-white rounded-[24px] p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {matchedCourses.length > 0 && (
                      <div className="mb-3 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                        <span>Matched Course: <strong className="font-extrabold">{matchedCourses.join(', ')}</strong></span>
                      </div>
                    )}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0 p-1">
                        <img src={uni.logo} alt={uni.name} className="w-9 h-9 object-contain" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs md:text-sm leading-tight hover:text-indigo-650 transition-colors">{uni.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                          <MapPin size={10} />
                          {uni.city}, Italy
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">QS Rank</p>
                        <p className="text-[10px] font-black text-slate-800 mt-0.5">{uni.rank}</p>
                      </div>
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Institution Type</p>
                        <p className="text-[10px] font-black text-indigo-650 mt-0.5">{uni.type}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-550 font-semibold mb-4 leading-normal bg-slate-50/20 p-2.5 rounded-xl border border-slate-100/20">
                      <strong>Prerequisites:</strong> {uni.eligibility}
                    </p>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-xs font-bold"
                    >
                      Visit School
                    </a>
                    <Link
                      to={`/contact?university=${encodeURIComponent(uni.name)}`}
                      className="flex-1 text-center py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold"
                    >
                      Apply Now
                    </Link>
                  </div>
                </motion.div>
              ); })}
            </AnimatePresence>

            {filteredUnis.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-xs">
                No institutions match the current search filters.
              </div>
            )}
          </div>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="Italy" />

      </div>
    </div>
  );
};

export default ItalyOverview;
