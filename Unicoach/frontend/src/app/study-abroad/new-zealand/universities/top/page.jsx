import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, Table, AlertCircle, Sparkles, 
  Building, ListFilter, HelpCircle, ChevronDown, Award, Globe, DollarSign, 
  BookOpen, Compass, ShieldCheck, Check, ShieldAlert, Coins, MapPin, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../../../utils/universitySearchMatcher';

const SECTIONS = [
  { id: 'overview', title: 'Why New Zealand in 2026?' },
  { id: 'rankings', title: 'Top 10 Rankings' },
  { id: 'profiles', title: 'Detailed Profiles' },
  { id: 'scholarships', title: 'Scholarships for Indians' },
  { id: 'deadlines', title: 'Application Deadlines' },
  { id: 'timeline', title: 'Strategic Timeline' },
  { id: 'notes', title: 'Important Notes' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const topNZUnis = [
  {
    rank: 1,
    name: "University of Auckland",
    qsRank: "#65",
    popular: "Engineering, IT, MBA, Data Science, Health Sciences",
    feesTotalNZD: 45000,
    scholarship: "India High Achievers Scholarship (Up to NZ$20,000)",
    logo: "https://logo.clearbit.com/auckland.ac.nz",
    website: "https://www.auckland.ac.nz",
    city: "Auckland",
    desc: "New Zealand's flagship institution, ranked #65 globally. Boasts elite triple-accredited business school and state-of-the-art bioengineering cluster.",
    deadlines: "Feb 2026: Dec 8, 2025 | July 2026: May 1, 2026",
    requirements: "Bachelor's: 75-80% (Best 4 subjects) + IELTS 6.0 | Master's: Relevant Bachelor's (60%+) + IELTS 6.5"
  },
  {
    rank: 2,
    name: "University of Otago",
    qsRank: "#197",
    popular: "Medicine, Dentistry, Finance, Psychology, Data Science",
    feesTotalNZD: 38000,
    scholarship: "Vice-Chancellor's Scholarship for Indians (NZ$10,000)",
    logo: "https://logo.clearbit.com/otago.ac.nz",
    website: "https://www.otago.ac.nz",
    city: "Dunedin",
    desc: "New Zealand's oldest university (est. 1869). Extremely student-centric campus in Dunedin, renowned for health sciences and clinical research.",
    deadlines: "Feb 2026: Nov 15, 2025 | July 2026: April 30, 2026",
    requirements: "Bachelor's: 75%+ + IELTS 6.0 | Master's: Relevant Bachelor's (B avg) + IELTS 6.5"
  },
  {
    rank: 3,
    name: "Massey University",
    qsRank: "#230",
    popular: "Aviation, Veterinary Science, Agribusiness, Creative Arts",
    feesTotalNZD: 32000,
    scholarship: "Massey International Excellence Scholarship (NZ$5,000 - $10,000)",
    logo: "https://logo.clearbit.com/massey.ac.nz",
    website: "https://www.massey.ac.nz",
    city: "Palmerston North & Auckland",
    desc: "Famous for highly practical, hands-on learning across agricultural sciences, aviation, and veterinary medicine. Operates its own flight training academy.",
    deadlines: "Feb 2026: Oct 31, 2025 (Standard) / Dec 15 (MBA) | July 2026: May 1, 2026",
    requirements: "Bachelor's: 75% (Best 4 subjects) + IELTS 6.0 | Master's: Relevant Bachelor's + IELTS 6.5"
  },
  {
    rank: 4,
    name: "Victoria University of Wellington",
    qsRank: "#240",
    popular: "Law, Political Science, Architecture, AI, Design",
    feesTotalNZD: 34000,
    scholarship: "Tongarewa Scholarship (Up to NZ$10,000)",
    logo: "https://logo.clearbit.com/wgtn.ac.nz",
    website: "https://www.wgtn.ac.nz",
    city: "Wellington",
    desc: "Located in the capital city Wellington, offering unparalleled networking opportunities with government ministries, embassies, and film production hubs.",
    deadlines: "Feb 2026: Jan 20, 2026 (General) / Dec 1 (Limited) | July 2026: June 19, 2026",
    requirements: "Bachelor's: 75% overall + IELTS 6.0 | Master's: Bachelor's 60%+ + IELTS 6.5"
  },
  {
    rank: 5,
    name: "University of Canterbury",
    qsRank: "#261",
    popular: "Civil Engineering, Forestry, Fine Arts, Science",
    feesTotalNZD: 35000,
    scholarship: "UC International First Year Scholarship (NZ$15,000)",
    logo: "https://logo.clearbit.com/canterbury.ac.nz",
    website: "https://www.canterbury.ac.nz",
    city: "Christchurch",
    desc: "An engineering powerhouse located on the South Island. Strong industry ties in seismic and civil engineering, connected to rebuild schemes.",
    deadlines: "Feb 2026: Oct-Nov 2025 (Recommended) | July 2026: May 1, 2026",
    requirements: "Bachelor's: 75%+ + IELTS 6.0 | Master's: Relevant Bachelor's + IELTS 6.5"
  },
  {
    rank: 6,
    name: "University of Waikato",
    qsRank: "#281",
    popular: "Computer Science, MBA, Cybersecurity, Management",
    feesTotalNZD: 33000,
    scholarship: "Waikato International Excellence Scholarship (Up to NZ$15,000)",
    logo: "https://logo.clearbit.com/waikato.ac.nz",
    website: "https://www.waikato.ac.nz",
    city: "Hamilton",
    desc: "Triple-Crown accredited business school. Housed the country's first dedicated Cybersecurity Laboratory, making it a tech and IT leader.",
    deadlines: "Feb 2026: Dec 1, 2025 (General) | July 2026: May 1, 2026",
    requirements: "Bachelor's: 70%+ + IELTS 6.0 | Master's: Relevant Bachelor's + IELTS 6.5"
  },
  {
    rank: 7,
    name: "Lincoln University",
    qsRank: "#407",
    popular: "Agribusiness, Viticulture, Food Science, Tourism",
    feesTotalNZD: 31000,
    scholarship: "Lincoln University International Grants (Up to NZ$5,000)",
    logo: "https://logo.clearbit.com/lincoln.ac.nz",
    website: "https://www.lincoln.ac.nz",
    city: "Christchurch",
    desc: "Specialist land-based university leading sustainable agriculture, viticulture (wine science), resource management, and agribusiness research.",
    deadlines: "Feb 2026: Dec 1, 2025 (Recommended) | July 2026: March-April 2026",
    requirements: "Bachelor's: 70%+ + IELTS 6.0 | Master's: Relevant Bachelor's + IELTS 6.5"
  },
  {
    rank: 8,
    name: "Auckland University of Technology (AUT)",
    qsRank: "#410",
    popular: "Hospitality, IT, Creative Technologies, Sports Science",
    feesTotalNZD: 33000,
    scholarship: "AUT International Student Scholarships (Up to NZ$7,500)",
    logo: "https://logo.clearbit.com/aut.ac.nz",
    website: "https://www.aut.ac.nz",
    city: "Auckland",
    desc: "Modern and fast-growing university focused on practical, hands-on, career-oriented learning and strong corporate integration.",
    deadlines: "Feb 2026: Dec 1, 2025 (General) | July 2026: May 1, 2026",
    requirements: "Bachelor's: 70%+ + IELTS 6.0 | Master's: Relevant Bachelor's + IELTS 6.5"
  },
  {
    rank: 9,
    name: "Unitec Institute of Technology",
    qsRank: "Category 1",
    popular: "Construction Management, Nursing, Cybersecurity, Architecture",
    feesTotalNZD: 22050,
    scholarship: "Unitec International Study Grant (Up to NZ$2,500 auto-applied)",
    logo: "https://logo.clearbit.com/unitec.ac.nz",
    website: "https://www.unitec.ac.nz",
    city: "Auckland",
    desc: "New Zealand's largest public polytechnic, delivering day-one ready vocational training and applied degrees alongside industry partners.",
    deadlines: "Rolling Basis (Apply 3-4 months before start)",
    requirements: "Bachelor's: 70% average + IELTS 6.0 | Master's: Relevant Bachelor's 65%+ + IELTS 6.5"
  },
  {
    rank: 10,
    name: "Otago Polytechnic",
    qsRank: "Category 1",
    popular: "Applied Management, Product Design, IT, Horticulture",
    feesTotalNZD: 20000,
    scholarship: "Otago Polytechnic International 2026 (Up to NZ$4,000)",
    logo: "https://logo.clearbit.com/op.ac.nz",
    website: "https://www.op.ac.nz",
    city: "Dunedin",
    desc: "Otago's leading applied training hub. Renowned for very high graduate employment statistics and pathways into Green List jobs.",
    deadlines: "Rolling Basis (Apply 3-4 months before start)",
    requirements: "Bachelor's: 75% average + IELTS 6.0 | Master's: Relevant Bachelor's + IELTS 6.5"
  }
];

const NewZealandTopUniversities = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currency, setCurrency] = useState('INR'); // 'NZD' | 'INR'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 55.0; // Reference 1 NZD ≈ 55 INR

  const formatCost = (valInNZD) => {
    if (currency === 'NZD') {
      return `NZ$ ${valInNZD.toLocaleString()}`;
    }
    const valInINR = valInNZD * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const filteredUnis = topNZUnis.filter(uni => {
    const matchesSearch = matchesUniversitySearch(uni, searchTerm);
    const matchesCity = selectedCity === 'All' || uni.city.includes(selectedCity);
    return matchesSearch && matchesCity;
  });

  const cities = ['All', 'Auckland', 'Dunedin', 'Wellington', 'Christchurch', 'Hamilton'];

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
          <Link to="/study-abroad/new-zealand" className="hover:text-indigo-650 transition-colors">New Zealand</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">Top Universities 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&auto=format&fit=crop&q=80" 
              alt="University in New Zealand" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Building size={14} />
              QS Rankings 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Top 10 Universities in New Zealand 2026: Complete Guide for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Rankings, popular courses, and scholarship updates for public universities and polytechnics. Make an informed decision for your international study pathway.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: December 24, 2025
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                7 min read
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
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Universities Navigator</span>
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
            
            {/* 1. Why New Zealand in 2026 */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={22} />
                  💡 Why New Zealand in 2026?
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  With visa requirements tightening in Canada and the UK, Indian applicants are turning to New Zealand. Choosing a course that aligns with the **Green List** is crucial to avoid PR path hurdles. New Zealand's public research universities all rank in the top 3% globally and offer a safe, high-ROI alternative.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "All 8 public universities in the top 3% globally",
                    "New work rights: 25 hours/week during term time",
                    "Up to 3-year post-study work visa",
                    "Fast-track Green List residency pathways",
                    "Tuition costs 10-20% lower than UK or Australia"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
                      <Check className="text-teal-600 shrink-0" size={16} strokeWidth={3} />
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Top 10 Rankings */}
            <section id="rankings" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Top 10 Universities in New Zealand (2026 Rankings)</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">QS rankings and estimated yearly costs in INR</p>
              </div>

              {/* Dynamic Controls Bar */}
              <div className="bg-white border border-slate-200/60 rounded-[24px] p-5 shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by course (e.g. IT, Data Science, MBA), university..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrency('NZD')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'NZD' ? 'bg-[#DE5C2B] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    NZD ($)
                  </button>
                  <button 
                    onClick={() => setCurrency('INR')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {filteredUnis.map((uni) => {
                  const matchedCourses = getMatchedCoursesForUniversity(uni, searchTerm);
                  return (
                  <div key={uni.name} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
                        <img 
                          src={uni.logo} 
                          alt="" 
                          className="w-full h-full object-contain"
                          onError={(e) => e.target.src = 'https://logo.clearbit.com/auckland.ac.nz'}
                        />
                      </div>
                      <div>
                        {matchedCourses.length > 0 && (
                          <div className="mb-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold inline-flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-600 flex-shrink-0" />
                            <span>Matched Course: <strong className="font-extrabold">{matchedCourses.join(', ')}</strong></span>
                          </div>
                        )}
                        <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider flex items-center gap-1">
                          <Award size={12} />
                          Rank #{uni.rank} · QS Rank: {uni.qsRank}
                        </span>
                        <h3 className="font-black text-slate-800 text-sm md:text-base mt-1">{uni.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-slate-400" />
                          {uni.city}, New Zealand
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 shrink-0">
                      <div>
                        <span className="text-slate-400 font-bold block">Est. Tuition Fee</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{formatCost(uni.feesTotalNZD)} / year</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Popular Fields</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{uni.popular.split(',')[0]}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Action</span>
                        <Link to={`/contact?university=${encodeURIComponent(uni.name)}`} className="text-indigo-650 font-black mt-0.5 flex items-center gap-1 hover:text-indigo-800 transition-colors">
                          Apply Now
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ); })}
              </div>
            </section>

            {/* 3. Detailed University Profiles */}
            <section id="profiles" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📚 Detailed University Profiles</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Entry criteria, deadlines, and scholarships for each school</p>
              </div>

              <div className="space-y-12">
                {topNZUnis.map((uni) => (
                  <div key={uni.name} className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                        <img src={uni.logo} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider">Rank #{uni.rank} · QS Rank: {uni.qsRank}</span>
                        <h3 className="text-lg font-black text-slate-850">{uni.name}</h3>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs font-semibold leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl">
                      {uni.desc}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div>
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">Admission Criteria</h4>
                        <p className="text-slate-500 font-semibold leading-relaxed">{uni.requirements}</p>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">Scholarship Info</h4>
                        <p className="text-indigo-650 font-black leading-relaxed">{uni.scholarship}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
                      <span className="text-slate-450">Location: {uni.city}</span>
                      <span className="text-indigo-600">Deadlines: {uni.deadlines}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Scholarships for Indian Students */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/65 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Award className="text-indigo-650" size={22} />
                  🏆 Scholarships for Indian Students (2026)
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Key funding awards and tuition discount programs</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">University</th>
                        <th className="pb-3 pr-4">Scholarship Name</th>
                        <th className="pb-3 pr-4 text-right">Value (NZD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {topNZUnis.map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-900 font-extrabold">{uni.name}</td>
                          <td className="py-4 text-slate-600 font-medium">{uni.scholarship.split('(')[0]}</td>
                          <td className="py-4 text-right text-indigo-650 font-black">
                            {uni.scholarship.includes('Up to') ? 'Up to ' : ''}
                            {uni.scholarship.match(/NZ\$\d+,?\d*/)?.[0] || 'Varies'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 5. Application Deadlines 2026 */}
            <section id="deadlines" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/65 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Calendar className="text-indigo-650" size={22} />
                  📅 University Application Deadlines 2026
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Cutoffs for February and July academic terms</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">University</th>
                        <th className="pb-3 pr-4 text-right">Deadlines</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {topNZUnis.map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-900 font-extrabold">{uni.name}</td>
                          <td className="py-4 text-right text-slate-655 font-medium">{uni.deadlines}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 6. Strategic Timeline */}
            <section id="timeline" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="text-indigo-650" size={24} />
                  Strategic Application Timeline
                </h2>

                <div className="relative border-l-2 border-indigo-100 pl-6 ml-4 space-y-6">
                  {[
                    { phase: "Phase 1: Research", dates: "10-12 Months Before", desc: "Shortlist Green List courses, verify GPA eligibility, check deadlines." },
                    { phase: "Phase 2: Prep & Tests", dates: "8-10 Months Before", desc: "Take PTE/IELTS tests, obtain transcripts, draft SOPs and LORs." },
                    { phase: "Phase 3: Submit", dates: "6-8 Months Before", desc: "Submit application bundles. Apply early for high-achiever scholarships." },
                    { phase: "Phase 4: Visas", dates: "3-4 Months Before", desc: "Settle first-year tuition fee, open FTS account, submit student visa." },
                    { phase: "Phase 5: Departure", dates: "1 Month Before", desc: "Arrange student housing, book flights, attend pre-departure webinars." }
                  ].map((s, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white" />
                      <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider block mb-0.5">{s.dates}</span>
                      <h4 className="text-xs font-black text-slate-850">{s.phase}</h4>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 7. Important Notes */}
            <section id="notes" className="scroll-mt-24">
              <div className="bg-rose-50/40 border border-rose-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-rose-900 mb-4 flex items-center gap-2">
                  <ShieldAlert className="text-rose-600" size={22} />
                  ⚠️ Important Notes for 2026 Applicants
                </h2>
                <div className="space-y-4 text-xs font-semibold text-slate-700 leading-relaxed">
                  <p>
                    <strong>1. The "Green List" Rule:</strong> Confirm that your course belongs to or maps with New Zealand's Green List for residency. Degrees in construction, nursing, engineering, and cybersecurity offer fast-track PR options.
                  </p>
                  <p>
                    <strong>2. FTS Funds Transfer:</strong> Ensure living expense funds (NZD 20,000) are ready in bank statements showing 3-6 months history, or apply for an education loan from ICICI/SBI.
                  </p>
                  <p>
                    <strong>3. Work rights:</strong> International students now hold **25 hours/week** part-time work rights during active study semesters.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about New Zealand universities</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Is New Zealand safe for Indian students?", a: "Yes, New Zealand is consistently ranked among the top 3 safest and most peaceful countries in the Global Peace Index, featuring a welcoming, multicultural society." },
                  { q: "Are public universities better than polytechnics?", a: "Public universities focus on academic research and degree-level theory. Category 1 polytechnics (Te Pūkenga) specialize in practical, vocational, hands-on training with high industry placement rates." },
                  { q: "What is the Green List?", a: "A list of high-demand, skilled occupations published by Immigration New Zealand. Studying a qualification mapped to this list grants direct fast-track PR pathways." },
                  { q: "Can I work part-time in New Zealand?", a: "Yes, international students are legally allowed to work up to 25 hours per week during term time and full-time during holidays." }
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
          <StudyAbroadCTA country="New Zealand" />
        </div>

      </div>
    </div>
  );
};

export default NewZealandTopUniversities;
