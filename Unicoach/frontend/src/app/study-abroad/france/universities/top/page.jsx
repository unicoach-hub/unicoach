import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, MapPin, Building, BookOpen, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, Search, Globe, Sparkles, Coins, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../../../utils/universitySearchMatcher';

const topUnis = [
  {
    rank: 1,
    name: "Université PSL (Paris Sciences & Lettres)",
    qsRank: "#28 Global",
    specializations: "AI, Energy, Life Sciences, Nuclear Science, Fine Arts",
    feesEUR: 3879,
    feesINR: "₹ 3.5 Lakh / year",
    scholarship: "Eiffel Scholarship, Dauphine Foundation Scholarship",
    logo: "https://logo.clearbit.com/hec.edu", // Fallback placeholder
    website: "https://www.psl.eu",
    city: "Paris",
    desc: "A research-intensive powerhouse combining elite institutions such as École Normale Supérieure (ENS) and Mines ParisTech."
  },
  {
    rank: 2,
    name: "Institut Polytechnique de Paris (IP Paris)",
    qsRank: "#41 Global",
    specializations: "Cybersecurity, Aerospace Engineering, Data Science",
    feesEUR: 17350, // Average 13000-21750
    feesINR: "₹ 13.0L - 22.0L / year",
    scholarship: "Charpak Master's, IP Paris Merit Scholarship",
    logo: "https://logo.clearbit.com/polytechnique.edu",
    website: "https://www.polytechnique.edu",
    city: "Palaiseau (Paris)",
    desc: "A cluster of 5 prestigious engineering schools (École Polytechnique, ENSTA, ENSAE, Telecom Paris, Telecom SudParis) targetting advanced high-tech applications."
  },
  {
    rank: 3,
    name: "Université Paris-Saclay",
    qsRank: "#70 Global",
    specializations: "Mathematics, Physics, Natural Sciences, AI",
    feesEUR: 3770,
    feesINR: "₹ 3.4 Lakh / year",
    scholarship: "International Master's IDEX Scholarship (€10,000)",
    logo: "https://logo.clearbit.com/universite-paris-saclay.fr",
    website: "https://www.universite-paris-saclay.fr",
    city: "Orsay (Paris)",
    desc: "Located in the 'Silicon Valley' of Europe, Paris-Saclay represents 13% of all French scientific research, ranking 15th globally for Math."
  },
  {
    rank: 4,
    name: "Sorbonne University",
    qsRank: "#72 Global",
    specializations: "Arts & Humanities, Medicine, Life Sciences",
    feesEUR: 3770,
    feesINR: "₹ 3.4 Lakh / year",
    scholarship: "SMARTS-UP Scholarship (€8,000), Eiffel, Erasmus+",
    logo: "https://logo.clearbit.com/sorbonne-universite.fr",
    website: "https://www.sorbonne-universite.fr",
    city: "Paris",
    desc: "Multidisciplinary global center balancing 13th-century heritage with 21st-century bio-medical innovation."
  },
  {
    rank: 5,
    name: "ENS de Lyon (École Normale Supérieure)",
    qsRank: "#205 Global",
    specializations: "Fundamental Sciences, Mathematics, Chemistry, Arts",
    feesEUR: 243,
    feesINR: "₹ 25,000 / year",
    scholarship: "Ampère Excellence Scholarship (€1,000 / month)",
    logo: "https://logo.clearbit.com/ens-lyon.fr",
    website: "https://www.ens-lyon.fr",
    city: "Lyon",
    desc: "An elite public institution focusing specifically on training researchers, professors, and high-level civil servants."
  },
  {
    rank: 6,
    name: "École des Ponts ParisTech",
    qsRank: "#205 Global",
    specializations: "Civil Engineering, sustainable Construction, Urban Planning",
    feesEUR: 7275,
    feesINR: "₹ 7.5 Lakh / year",
    scholarship: "Fondation des Ponts Scholarships, Bourse d'Excellence",
    logo: "https://logo.clearbit.com/enpc.fr",
    website: "https://www.ecoledesponts.fr",
    city: "Paris",
    desc: "Founded in 1747, it is the world's oldest civil engineering school, famous for blending technical engineering with finance."
  },
  {
    rank: 7,
    name: "Université Paris Cité",
    qsRank: "#300 Global",
    specializations: "Health Sciences, Life Sciences, Medicine, Chemistry",
    feesEUR: 3770,
    feesINR: "₹ 3.4 Lakh / year",
    scholarship: "MIEM Excellence Scholarship (€8,000 - €10,000)",
    logo: "https://logo.clearbit.com/u-paris.fr",
    website: "https://u-paris.fr",
    city: "Paris",
    desc: "A massive clinical research university formed by the merger of Paris Descartes and Paris Diderot."
  },
  {
    rank: 8,
    name: "Université Paris 1 Panthéon-Sorbonne",
    qsRank: "#257 Global",
    specializations: "Law, Economics, Political Science, Management",
    feesEUR: 3770,
    feesINR: "₹ 3.4 Lakh / year",
    scholarship: "Charpak Master's, Eiffel Excellence Scholarship",
    logo: "https://logo.clearbit.com/univ-paris1.fr",
    website: "https://www.pantheonsorbonne.fr",
    city: "Paris",
    desc: "The premier French public university for legal and economic sciences, training the top echelons of public service."
  },
  {
    rank: 9,
    name: "Université Grenoble Alpes (UGA)",
    qsRank: "#321 Global",
    specializations: "Nanotechnology, Microelectronics, Statistics, Physics",
    feesEUR: 3770,
    feesINR: "₹ 3.4 Lakh / year",
    scholarship: "Grenoble INP Foundation (€5,000 / yr), UGA IDEX",
    logo: "https://logo.clearbit.com/univ-grenoble-alpes.fr",
    website: "https://www.univ-grenoble-alpes.fr",
    city: "Grenoble",
    desc: "A major scientific hub in the Alps, widely recognized for high-tech microelectronics and computer systems."
  },
  {
    rank: 10,
    name: "Sciences Po (Paris)",
    qsRank: "#367 Global",
    specializations: "International Security, Public Policy, Politics",
    feesEUR: 17500, // Average 14720-20380
    feesINR: "₹ 13.0L - 18.5L / year",
    scholarship: "Émile Boutmy Scholarship, Mastercard Foundation",
    logo: "https://logo.clearbit.com/sciencespo.fr",
    website: "https://www.sciencespo.fr",
    city: "Paris",
    desc: "France's leading institution for social sciences, public policy, and diplomacy. Known as the 'Nursery of Presidents'."
  }
];

const salaryRanges = [
  { tier: "Top 5 Business Schools (HEC, INSEAD, ESSEC)", eur: "€55,000 - €85,000", inr: "₹ 57.7 Lakh - 89.2 Lakh", potential: "Fast-track to C-suite and strategy consulting" },
  { tier: "Elite Engineering Schools (IP Paris, CentraleSupélec)", eur: "€48,000 - €65,000", inr: "₹ 50.4 Lakh - 68.2 Lakh", potential: "High demand in AI research, aerospace, tech" },
  { tier: "Top Public Universities (PSL, Sorbonne, Saclay)", eur: "€42,000 - €55,000", inr: "₹ 44.1 Lakh - 57.7 Lakh", potential: "Specialized research, corporate management" },
  { tier: "Specialized Design / Fashion Schools", eur: "€38,000 - €50,000", inr: "₹ 39.9 Lakh - 52.5 Lakh", potential: "Management roles in global luxury houses" }
];

const FranceTopUniversities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const exchangeRate = 110.14; // Reference 1 EUR ≈ 110.14 INR

  const formatCost = (valInEUR) => {
    if (valInEUR < 500) {
      // Subsidized public rates
      if (currency === 'EUR') return `€ ${valInEUR}`;
      return `₹ ${Math.round(valInEUR * exchangeRate).toLocaleString()}`;
    }
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  const filteredUnis = topUnis.filter(uni => {
    const matchesSearch = matchesUniversitySearch(uni, searchTerm);
    const matchesCity = selectedCity === 'All' || uni.city.includes(selectedCity);
    return matchesSearch && matchesCity;
  });

  const cities = ['All', 'Paris', 'Lyon', 'Grenoble'];

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/10 to-blue-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/france" className="hover:text-indigo-650 transition-colors">France</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Top Universities</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles size={14} className="text-indigo-650 animate-pulse" />
            <span>France Academic Rankings 2026/27</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Top Universities in{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">France 2026</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Leverage the dual system of state-funded Public Research Universities and highly selective Grandes Écoles. Tripled intake targets for Indian students and extended 5-year stay-back visas.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { val: "PSL #28", label: "Top Rank (QS)" },
              { val: "5-Year Visa", label: "For PG Alumni" },
              { val: "30,000", label: "Indian Target (2030)" },
              { val: "964 Hours", label: "Part-Time Limit" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md">
                <p className="text-xl font-black text-indigo-650">{stat.val}</p>
                <p className="text-[10px] text-slate-500 font-extrabold mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Controls Bar */}
        <div className="bg-white/70 border border-white/80 rounded-[28px] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] backdrop-blur-xl mb-12 flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto flex-1">
            {/* Search */}
            <div className="relative w-full sm:flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course (e.g. AI, Energy, Life Sciences), university..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            {/* City Filters */}
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
              {cities.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap ${selectedCity === c ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-100'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="bg-slate-50 border border-slate-200/50 p-1.5 rounded-2xl shadow-xs flex items-center gap-1 w-full sm:w-auto justify-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase px-2 tracking-wider">Currency:</span>
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 1. UNIVERSITIES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <AnimatePresence>
            {filteredUnis.map((uni, idx) => {
              const matchedCourses = getMatchedCoursesForUniversity(uni, searchTerm);
              return (
              <motion.div
                key={uni.name}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {matchedCourses.length > 0 && (
                    <div className="mb-4 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                      <span>Matched Course: <strong className="font-extrabold">{matchedCourses.join(', ')}</strong></span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm">
                        <img 
                          src={uni.logo} 
                          alt="" 
                          className="w-full h-full object-contain"
                          onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider flex items-center gap-1">
                          <Award size={12} />
                          Rank #{uni.rank} · {uni.qsRank}
                        </span>
                        <h3 className="font-black text-slate-900 text-sm md:text-base leading-tight mt-1 hover:text-indigo-650 transition-colors">
                          {uni.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          {uni.city}, France
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-650 text-xs font-semibold leading-relaxed mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {uni.desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50/40 border border-slate-100/50 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Specializations</span>
                      <span className="font-extrabold text-slate-800 text-[10.5px] mt-0.5 block">{uni.specializations}</span>
                    </div>
                    <div className="bg-slate-50/40 border border-slate-100/50 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Target Scholarship</span>
                      <span className="font-extrabold text-indigo-650 text-[10.5px] mt-0.5 block">{uni.scholarship}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Estimated Master's Fees</span>
                    <span className="text-base font-black text-indigo-650 block mt-0.5">
                      {formatCost(uni.feesEUR)} {uni.feesEUR > 1000 ? '/ year' : 'Subsidized'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <a href={uni.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all text-xs font-black">Visit Site</a>
                    <Link to={`/contact?university=${encodeURIComponent(uni.name)}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all text-xs font-black shadow-xs">Apply</Link>
                  </div>
                </div>
              </motion.div>
            ); })}
          </AnimatePresence>
          {filteredUnis.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-sm">
              No institutions found matching your search.
            </div>
          )}
        </div>

        {/* 2. GRADUATE SALARY OUTLOOK */}
        <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-16 overflow-hidden">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
            <Coins className="text-indigo-650" size={22} />
            Graduate Salary Expectations (2026/27)
          </h2>
          <p className="text-slate-500 text-xs font-semibold mb-6">Attending an elite French institution provides a direct pipeline to Fortune 500 corporate giants.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="pb-3 pr-4">Institution Tier</th>
                  <th className="pb-3 pr-4">Avg. Starting Package (EUR vs INR)</th>
                  <th className="pb-3 pr-4 text-right">Career Potential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                {salaryRanges.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 text-slate-900 font-extrabold">{s.tier}</td>
                    <td className="py-4 font-black text-indigo-655">
                      {currency === 'EUR' ? s.eur : s.inr}
                    </td>
                    <td className="py-4 text-right text-slate-550 text-xs font-bold">{s.potential}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. GRANDES ÉCOLES VS PUBLIC */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-[32px] p-8 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 mb-3">Grandes Écoles (Elite Colleges)</h3>
            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
              Highly selective, specialized public or private institutions focused heavily on Business and Engineering. Admissions require GMAT/GRE, exams, or interviews. They charge higher tuition (€10,000–€30,000/year) but hold exclusive corporate pipelines and guarantee massive ROI with starting salaries exceeding €55,000.
            </p>
          </div>

          <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 mb-3">Public Universities</h3>
            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
              State-funded, broad-based institutions offering general degrees (Arts, Humanities, Law, Pure Sciences, Medicine). Non-EU international student fees are subsidized by taxpayers to just €2,770 (Licence) or €3,770 (Master's) per year. Ideal for research-oriented pathways.
            </p>
          </div>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="France" />

      </div>
    </div>
  );
};

export default FranceTopUniversities;
