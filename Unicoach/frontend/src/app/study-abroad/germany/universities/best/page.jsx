import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, MapPin, Building, BookOpen, Star, CheckCircle2, 
  ArrowRight, Search, Globe, Shield, Coins, Sparkles, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../../../utils/universitySearchMatcher';

const bestUniversities = [
  {
    rank: 1,
    qsRank: "22nd Global",
    name: "Technical University of Munich (TUM)",
    type: "Public",
    acceptanceRate: "8% - 15%",
    topCourses: ["Mechanical Engineering", "Informatics (CS)", "Management & Technology", "Aerospace"],
    startingSalary: 70000,
    recruiters: ["BMW", "Siemens", "Audi", "Google"],
    tuition: "Free (Some state fees may apply)",
    highlights: "Consistently ranked as Germany's number 1 university. It features in the Global Top 30 and has deep integration with Munich's high-tech industry.",
    logo: "https://logo.clearbit.com/tum.de",
    website: "https://www.tum.de",
    city: "Munich"
  },
  {
    rank: 2,
    qsRank: "58th Global",
    name: "Ludwig Maximilian University (LMU) Munich",
    type: "Public",
    acceptanceRate: "10% - 18%",
    topCourses: ["Data Science", "Physics", "Medicine", "Business Administration"],
    startingSalary: 65000,
    recruiters: ["McKinsey", "BCG", "Allianz", "BMW"],
    tuition: "Free (€300 semester fee)",
    highlights: "One of Europe's oldest and most prestigious research universities, leading major clusters of excellence in the heart of Bavaria.",
    logo: "https://logo.clearbit.com/lmu.de",
    website: "https://www.lmu.de",
    city: "Munich"
  },
  {
    rank: 3,
    qsRank: "80th Global",
    name: "Heidelberg University",
    type: "Public",
    acceptanceRate: "15% - 25%",
    topCourses: ["Biosciences", "Medicine", "Physics", "International Law"],
    startingSalary: 62000,
    recruiters: ["BASF", "Bayer", "Roche", "Max Planck Institutes"],
    tuition: "€1,500 / semester (non-EU)",
    highlights: "Germany's oldest university (established in 1386) and a world-renowned research powerhouse, highly sought-after for life sciences.",
    logo: "https://logo.clearbit.com/uni-heidelberg.de",
    website: "https://www.uni-heidelberg.de",
    city: "Heidelberg"
  },
  {
    rank: 4,
    qsRank: "88th Global",
    name: "Free University of Berlin (FU Berlin)",
    type: "Public",
    acceptanceRate: "15%",
    topCourses: ["Political Science", "Social Sciences", "Mathematics", "Computer Science"],
    startingSalary: 60000,
    recruiters: ["Zalando", "HelloFresh", "Federal Government", "NGOs"],
    tuition: "Free (€310 semester fee)",
    highlights: "A central pillar of Berlin's academic landscape, known for its international outlook and its prominent role in the Excellence Strategy.",
    logo: "https://logo.clearbit.com/fu-berlin.de",
    website: "https://www.fu-berlin.de",
    city: "Berlin"
  },
  {
    rank: 5,
    qsRank: "105th Global",
    name: "RWTH Aachen University",
    type: "Public",
    acceptanceRate: "10% - 20%",
    topCourses: ["Automotive Engineering", "Production Technology", "Electrical Engineering", "Software Systems"],
    startingSalary: 75000,
    recruiters: ["Bosch", "Volkswagen", "Daimler", "Siemens"],
    tuition: "Free (€300 semester fee)",
    highlights: "Commonly referred to as the 'MIT of Germany', RWTH Aachen is the largest technical university in the country, boasting elite industrial ties.",
    logo: "https://logo.clearbit.com/rwth-aachen.de",
    website: "https://www.rwth-aachen.de",
    city: "Aachen"
  },
  {
    rank: 6,
    qsRank: "98th Global",
    name: "Karlsruhe Institute of Technology (KIT)",
    type: "Public",
    acceptanceRate: "20% - 30%",
    topCourses: ["Mechanical Engineering", "Energy Technology", "Computer Science"],
    startingSalary: 68000,
    recruiters: ["EnBW", "ABB", "Bosch", "Porsche"],
    tuition: "€1,500 / semester (non-EU)",
    highlights: "Unique for being both a university and a national large-scale research center within the Helmholtz Association, dominating energy & mobility.",
    logo: "https://logo.clearbit.com/kit.edu",
    website: "https://www.kit.edu",
    city: "Karlsruhe"
  },
  {
    rank: 7,
    qsRank: "130th Global",
    name: "Humboldt University of Berlin",
    type: "Public",
    acceptanceRate: "18%",
    topCourses: ["Economics", "Quantitative Biology", "Philosophy", "Law"],
    startingSalary: 68000,
    recruiters: ["Deutsche Bank", "Roland Berger", "Berlin Senate", "Think Tanks"],
    tuition: "Free (€315 semester fee)",
    highlights: "Founded by Wilhelm von Humboldt, it offers a rigorous intellectual environment. It has been home to 29 Nobel Laureates including Albert Einstein.",
    logo: "https://logo.clearbit.com/hu-berlin.de",
    website: "https://www.hu-berlin.de",
    city: "Berlin"
  },
  {
    rank: 8,
    qsRank: "145th Global",
    name: "Technical University of Berlin (TU Berlin)",
    type: "Public",
    acceptanceRate: "20% - 40%",
    topCourses: ["Civil Engineering", "Architecture", "Innovation Management", "CS"],
    startingSalary: 66000,
    recruiters: ["Deutsche Bahn", "Siemens", "Vattenfall", "Berlin Startups"],
    tuition: "Free (€300 semester fee)",
    highlights: "Located in the industrial heart of the capital, focusing on providing high-level technical qualifications and modern administrative engineering.",
    logo: "https://logo.clearbit.com/tu.berlin",
    website: "https://www.tu.berlin",
    city: "Berlin"
  },
  {
    rank: 9,
    qsRank: "193rd Global",
    name: "University of Hamburg",
    type: "Public",
    acceptanceRate: "18% - 25%",
    topCourses: ["Marine Biology", "Law", "Business Administration", "Climate Science"],
    startingSalary: 62000,
    recruiters: ["Hapag-Lloyd", "Lufthansa Technik", "Hamburg Sud", "Otto Group"],
    tuition: "Free (€335 semester fee)",
    highlights: "The largest research and training institution in Northern Germany, a leader in sustainability and maritime sciences, leveraging Hamburg's trade port status.",
    logo: "https://logo.clearbit.com/uni-hamburg.de",
    website: "https://www.uni-hamburg.de",
    city: "Hamburg"
  },
  {
    rank: 10,
    qsRank: "201st Global",
    name: "University of Freiburg",
    type: "Public",
    acceptanceRate: "30%",
    topCourses: ["Environmental Science", "Microsystems Engineering", "Medicine", "Biotech"],
    startingSalary: 64000,
    recruiters: ["Fraunhofer Institutes", "Roche", "SICK AG", "Solar Tech Firms"],
    tuition: "€1,500 / semester (non-EU)",
    highlights: "Located in Germany's 'Green City', Freiburg is a global pioneer in renewable energy research and sustainable systems engineering.",
    logo: "https://logo.clearbit.com/uni-freiburg.de",
    website: "https://www.uni-freiburg.de",
    city: "Freiburg"
  }
];

const GermanyBestUniversities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const exchangeRate = 110.14; // Reference 1 EUR ≈ 110.14 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  const filteredUnis = bestUniversities.filter(uni => {
    const matchesSearch = matchesUniversitySearch(uni, searchTerm);
    const matchesCity = selectedCity === 'All' || uni.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const cities = ['All', 'Munich', 'Berlin', 'Heidelberg', 'Aachen', 'Karlsruhe', 'Hamburg', 'Freiburg'];

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-indigo-100/50 via-blue-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/germany" className="hover:text-indigo-650 transition-colors">Germany</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Best Universities</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles size={14} className="animate-spin text-indigo-500" style={{ animationDuration: '4s' }} />
            <span>QS World Rankings 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Best Universities in{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Germany 2026</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto">
            Explore Germany's highest-ranked public institutions. Combining world-class research facilities, minimal study fees, and outstanding career ROI.
          </p>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { val: "Top 30 Global", label: "TUM Ranking" },
              { val: "€0 - €3,000", label: "Nominal Fees" },
              { val: "€75,000+", label: "Top Starting Salary" },
              { val: "18 Months", label: "Job-Seeker Visa" }
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
                placeholder="Search by course (e.g. CS, Mechanical, Data Science), university..."
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
            <span className="text-[10px] text-slate-400 font-extrabold uppercase px-2 tracking-wider">Starting Salary:</span>
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

        {/* Universities Cards Grid */}
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
                  {/* Rank badge and clear logo */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2.5 shadow-sm">
                        <img 
                          src={uni.logo} 
                          alt={`${uni.name} logo`} 
                          className="w-full h-full object-contain"
                          onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider flex items-center gap-1">
                          <Award size={12} />
                          Rank #{uni.rank} · {uni.qsRank}
                        </span>
                        <h3 className="font-black text-slate-900 text-base md:text-lg leading-tight mt-1 hover:text-indigo-600 transition-colors">
                          {uni.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          {uni.city}, Germany
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights snippet */}
                  <p className="text-slate-650 text-xs font-semibold leading-relaxed mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {uni.highlights}
                  </p>

                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50/40 border border-slate-100/50 p-3 rounded-2xl">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Tuition Status</span>
                      <span className="font-extrabold text-slate-800 text-xs mt-0.5 block">{uni.tuition}</span>
                    </div>
                    <div className="bg-slate-50/40 border border-slate-100/50 p-3 rounded-2xl">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Acceptance Rate</span>
                      <span className="font-extrabold text-slate-800 text-xs mt-0.5 block">{uni.acceptanceRate}</span>
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="mb-6">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Popular Programs</span>
                    <div className="flex flex-wrap gap-1.5">
                      {uni.topCourses.map((c, i) => (
                        <span key={i} className="text-[11px] font-bold px-2.5 py-1 bg-indigo-50/50 border border-indigo-100/50 text-indigo-650 rounded-lg">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Avg. Starting Salary</span>
                    <span className="text-lg font-black text-indigo-650 block mt-0.5">
                      {formatCost(uni.startingSalary)}
                    </span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none text-center px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all text-xs font-black"
                    >
                      Official site
                    </a>
                    <Link
                      to={`/contact?university=${encodeURIComponent(uni.name)}`}
                      className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all text-xs font-black shadow-xs"
                    >
                      Check Eligibility
                    </Link>
                  </div>
                </div>
              </motion.div>
            ); })}
          </AnimatePresence>
          {filteredUnis.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-sm">
              No universities found matching your search.
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-black mb-8 text-center md:text-left">Why Study at Germany's Best Universities?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Zero Tuition Fees", detail: "Public universities offer world-class education for free or for small admin semester contributions (€150 - €350)." },
              { title: "Dual Education System", detail: "Deep integration between theoretical studies and practical industrial training (hands-on internship semesters)." },
              { title: "Post-Study Work Visa", detail: "International graduates get an 18-month job-seeker visa to secure high-paying employment in Europe's hub." },
              { title: "Strong STEM Demand", detail: "As Europe's largest economy, Germany has a massive demand for STEM, engineering, and healthcare professionals." }
            ].map((p, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
                <h4 className="text-base font-black mb-2 text-indigo-100">{p.title}</h4>
                <p className="text-xs text-white/80 font-semibold leading-relaxed mt-2">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-white/50 border border-white rounded-[32px] p-8 md:p-10 shadow-sm text-center max-w-3xl mx-auto">
          <Building className="mx-auto text-indigo-600 mb-4" size={32} />
          <h3 className="text-2xl font-black text-slate-900 mb-2">Need Help Shortlisting?</h3>
          <p className="text-slate-500 text-sm font-semibold mb-6 max-w-md mx-auto">
            Get personalized suggestions matching your ECTS credits, language scores, budget, and future career plans.
          </p>
          <Link
            to="/contact?destination=germany"
            className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl font-black text-sm transition-all shadow-sm"
          >
            <span>Talk to a Counsellor</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      {/* CTA Section */}
      <StudyAbroadCTA country="Germany" />

      </div>
    </div>
  );
};

export default GermanyBestUniversities;
