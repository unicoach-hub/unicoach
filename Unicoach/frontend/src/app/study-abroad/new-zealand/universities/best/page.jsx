import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, Table, AlertCircle, Sparkles, 
  Building, ListFilter, HelpCircle, ChevronDown, Award, Globe, DollarSign, 
  BookOpen, Compass, ShieldCheck, Check, ShieldAlert, Coins, MapPin, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Why 2026 is the Best Year' },
  { id: 'rankings', title: 'Top 8 Universities' },
  { id: 'profiles', title: 'Detailed Profiles' },
  { id: 'requirements', title: 'Admission Requirements' },
  { id: 'scholarships', title: 'Scholarships for Indians' },
  { id: 'pathways', title: 'Post-Study & PR Pathways' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const top8Unis = [
  {
    rank: 1,
    name: "University of Auckland",
    qsRank: "#65",
    popular: "Engineering, IT, Data Science",
    feesTotalNZD: 45050,
    tagline: "ONLY NZ UNI IN TOP 100 GLOBALLY",
    logo: "https://logo.clearbit.com/auckland.ac.nz",
    website: "https://www.auckland.ac.nz",
    city: "Auckland",
    founded: "1883",
    students: "10,000+",
    acceptance: "~45%",
    strengths: [
      "Only NZ university in top 100 globally",
      "Auckland Bioengineering Institute",
      "Triple Crown Business School",
      "Global MBA tailored for Asia-Pacific"
    ],
    ugFees: "NZ$40,000 – NZ$58,000",
    pgFees: "NZ$44,000 – NZ$60,000+"
  },
  {
    rank: 2,
    name: "University of Otago",
    qsRank: "#197",
    popular: "Health Sciences, Dentistry, Medicine, Psychology, Finance",
    feesTotalNZD: 38000,
    tagline: "NZ'S ONLY DENTAL SCHOOL",
    logo: "https://logo.clearbit.com/otago.ac.nz",
    website: "https://www.otago.ac.nz",
    city: "Dunedin",
    founded: "1869",
    students: "3,000+",
    acceptance: "65%",
    strengths: [
      "NZ's only dental school",
      "NZ's first medical school",
      "Powerhouse in biomedical & clinical research",
      "Lively student culture"
    ],
    ugFees: "NZ$38,000 – NZ$48,000",
    pgFees: "NZ$41,000 – NZ$58,000"
  },
  {
    rank: 3,
    name: "Massey University",
    qsRank: "#230",
    popular: "Aviation, Veterinary Science, Agribusiness, Creative Arts",
    feesTotalNZD: 32000,
    tagline: "ONLY UNIVERSITY WITH AVIATION DEGREES",
    logo: "https://logo.clearbit.com/massey.ac.nz",
    website: "https://www.massey.ac.nz",
    city: "Palmerston North & Auckland",
    founded: "1927",
    students: "5,000+",
    acceptance: "65%",
    strengths: [
      "Only university with Aviation degrees",
      "Only university with Veterinary Science",
      "'Hands-on' practical approach",
      "Agri-Food research powerhouse"
    ],
    ugFees: "NZ$34,000 – NZ$46,000",
    pgFees: "NZ$39,000 – NZ$52,000"
  },
  {
    rank: 4,
    name: "Victoria University of Wellington",
    qsRank: "#240",
    popular: "Public Policy, Accounting, Law, Architecture, AI",
    feesTotalNZD: 34000,
    tagline: "LOCATED IN CAPITAL CITY - GOVT CONNECTIONS",
    logo: "https://logo.clearbit.com/wgtn.ac.nz",
    website: "https://www.wgtn.ac.nz",
    city: "Wellington",
    founded: "1897",
    students: "3,500+",
    acceptance: "64%",
    strengths: [
      "Front-row seat to government & creative sectors",
      "Strong emphasis on international law & policy",
      "Connection with Wētā Workshop (film industry)",
      "Strongest option for Law & Public Policy"
    ],
    ugFees: "NZ$34,000 – NZ$45,000",
    pgFees: "NZ$36,000 – NZ$50,000"
  },
  {
    rank: 5,
    name: "University of Canterbury",
    qsRank: "#261",
    popular: "Civil Engineering, Environmental Science, Fine Arts",
    feesTotalNZD: 35000,
    tagline: "ENGINEERING HUB - QUAKE CENTRE",
    logo: "https://logo.clearbit.com/canterbury.ac.nz",
    website: "https://www.canterbury.ac.nz",
    city: "Christchurch",
    founded: "1873",
    students: "4,000+",
    acceptance: "50%",
    strengths: [
      "Engineering hub with global industry links",
      "Quake Centre (earthquake engineering research)",
      "HIT Lab (AR/VR technology)",
      "Strong global engineering connections"
    ],
    ugFees: "NZ$35,000 – NZ$48,000",
    pgFees: "NZ$38,000 – NZ$52,000"
  },
  {
    rank: 6,
    name: "University of Waikato",
    qsRank: "#281",
    popular: "Computer Science, MBA, AI, Cybersecurity, Nursing",
    feesTotalNZD: 33000,
    tagline: "TRIPLE CROWN BUSINESS SCHOOL",
    logo: "https://logo.clearbit.com/waikato.ac.nz",
    website: "https://www.waikato.ac.nz",
    city: "Hamilton",
    founded: "1964",
    students: "2,500+",
    acceptance: "70%",
    strengths: [
      "Triple Crown Business School (top 1% globally)",
      "First Cybersecurity Lab in NZ",
      "World leader in digital defence & cloud security",
      "Laid-back, community-oriented atmosphere"
    ],
    ugFees: "NZ$32,000 – NZ$44,000",
    pgFees: "NZ$35,000 – NZ$48,000"
  },
  {
    rank: 7,
    name: "Lincoln University",
    qsRank: "#407",
    popular: "Agribusiness, Food Technology, Wine Science, Viticulture",
    feesTotalNZD: 31000,
    tagline: "SPECIALIST LAND-BASED UNIVERSITY",
    logo: "https://logo.clearbit.com/lincoln.ac.nz",
    website: "https://www.lincoln.ac.nz",
    city: "Lincoln (Christchurch)",
    founded: "1878",
    students: "1,500+",
    acceptance: "60%",
    strengths: [
      "Specialist land-based university",
      "World-class agribusiness & food innovation",
      "Environmental management & climate change adaptation",
      "Billion-dollar agriculture industry connections"
    ],
    ugFees: "NZ$31,000 – NZ$40,000",
    pgFees: "NZ$33,000 – NZ$45,000"
  },
  {
    rank: 8,
    name: "Auckland University of Technology (AUT)",
    qsRank: "#410",
    popular: "Hospitality, IT, Digital Media, Sports Science",
    feesTotalNZD: 33000,
    tagline: "HIGHEST GRADUATE EMPLOYMENT RATE",
    logo: "https://logo.clearbit.com/aut.ac.nz",
    website: "https://www.aut.ac.nz",
    city: "Auckland",
    founded: "2000",
    students: "5,500+",
    acceptance: "50%",
    strengths: [
      "Highest graduate employment rate in NZ",
      "Modern, fast-paced, work-focused environment",
      "Future Work Research Institute (AI & automation)",
      "Sports Performance research (internationally known)"
    ],
    ugFees: "NZ$33,000 – NZ$48,000",
    pgFees: "NZ$38,000 – NZ$55,000"
  }
];

const NewZealandBest = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currency, setCurrency] = useState('INR'); // 'NZD' | 'INR'
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
          <span className="text-slate-600 font-bold">Best Universities 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80" 
              alt="New Zealand Academic Journey" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Building size={14} />
              Best Universities Guide 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Best Universities in New Zealand 2026: Complete Guide for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              The 2025 India-New Zealand Free Trade Agreement has opened unprecedented channels. Explore rankings, eligibility, and PR prospects in top public universities.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 28, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                9 min read
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
            
            {/* 1. Why 2026 is the Best Year */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={22} />
                  💡 Why 2026 is the Best Year for Indian Students
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  The **2025 India-New Zealand Free Trade Agreement (FTA)** has changed everything. The barriers that once made New Zealand feel out of reach—high living costs and complicated degree assessments—have been cleared away.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "25 hours/week work rights (up from 20 hours)",
                    "Fast-track visa processing with local IQA exemptions",
                    "Up to 4 years post-study work visa for PhDs (3 years for UG/PG)",
                    "All 8 public universities in the top 3% globally"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
                      <Check className="text-teal-600 shrink-0" size={16} strokeWidth={3} />
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Top 8 Universities */}
            <section id="rankings" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Top 8 Universities in New Zealand (2026 Rankings & Fees)</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">QS global positions and fee conversions</p>
              </div>

              {/* Currency Selector */}
              <div className="bg-white border border-slate-200/60 rounded-[24px] p-5 shadow-xs mb-8 flex justify-end">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrency('NZD')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'NZD' ? 'bg-[#DE5C2B] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    NZD ($)
                  </button>
                  <button 
                    onClick={() => setCurrency('INR')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-xs' : 'text-slate-550 hover:bg-slate-100'}`}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {top8Unis.map((uni) => (
                  <div key={uni.name} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
                        <img 
                          src={uni.logo} 
                          alt="" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-655 font-black uppercase tracking-wider flex items-center gap-1">
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
                        <span className="text-slate-400 font-bold block">Est. Annual Fee</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{formatCost(uni.feesTotalNZD)} / year</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Key Strength</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{uni.tagline.split('-')[0]}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">Action</span>
                        <Link to={`/contact?university=${encodeURIComponent(uni.name)}`} className="text-indigo-650 font-black mt-0.5 flex items-center gap-1 hover:text-indigo-850 transition-colors">
                          Apply Now
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Detailed University Profiles */}
            <section id="profiles" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📚 Detailed University Profiles</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Detailed stats, tuition fees, and specializations</p>
              </div>

              <div className="space-y-12">
                {top8Unis.map((uni) => (
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

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs mb-6 font-semibold text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">Founded</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{uni.founded}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">Location</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{uni.city}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">International Students</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{uni.students}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">Acceptance Rate</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{uni.acceptance}</strong>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">⭐ Key Strengths</h4>
                      <ul className="space-y-2 text-xs text-slate-655 font-semibold">
                        {uni.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-t border-slate-100 pt-6">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider">Undergraduate Fees</span>
                        <strong className="text-slate-800 text-sm font-extrabold mt-1 block">{uni.ugFees}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider">Postgraduate Fees</span>
                        <strong className="text-slate-800 text-sm font-extrabold mt-1 block">{uni.pgFees}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Admission Requirements */}
            <section id="requirements" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-650" size={24} />
                  📋 Admission Requirements for Indian Students
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs font-semibold">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">📚 Bachelor's Programs</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Minimum **60% – 70%** overall in Class 12. Accepted boards include CBSE, ICSE, and recognized State Boards.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">📚 Master's Programs</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Relevant Bachelor's degree from a recognized Indian university with a minimum of **60% or a CGPA of 6.0**.
                    </p>
                  </div>
                </div>

                <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 flex items-start gap-4 mb-6">
                  <Sparkles className="text-sky-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-extrabold text-sky-905 text-xs uppercase tracking-wider mb-1">🆕 LQEA UPDATE - MAJOR 2026 CHANGE</h4>
                    <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                      India has officially been added to the **LQEA list**. Most Indian graduates are now exempt from the costly and time-consuming International Qualifications Assessment (IQA) during visa processing.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Study Level</th>
                        <th className="pb-3 pr-4">IELTS requirement</th>
                        <th className="pb-3 pr-4 text-right">PTE Academic</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Undergraduate</td>
                        <td className="py-4 text-slate-600">6.0 (no band &lt; 5.5)</td>
                        <td className="py-4 text-right text-indigo-650">50 (no band &lt; 42)</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Postgraduate</td>
                        <td className="py-4 text-slate-600">6.5 (no band &lt; 6.0)</td>
                        <td className="py-4 text-right text-indigo-650">58 (no band &lt; 50)</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Teaching & Nursing</td>
                        <td className="py-4 text-slate-600">7.0 (all bands)</td>
                        <td className="py-4 text-right text-indigo-650">65 (all bands)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 5. Scholarships for Indian Students */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Award className="text-indigo-650" size={24} />
                  🏆 Scholarships for Indian Students
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">🏛️ New Zealand Excellence Scholarships (NZES)</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                      Exclusive partial to full tuition cover awards for high-achieving Indian nationals applying to postgraduate and research degrees.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">🎓 Vice-Chancellor's Merit Scholarships</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                      Awarded automatically by individual universities (Auckland, Otago, Canterbury) based on Class 12 or Bachelor's GPA scores.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">💰 University-Specific Grants</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                      Small-scale travel and tuition waivers ranging from ₹2 Lakhs to ₹5 Lakhs, auto-applied during admission assessment rounds.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">🌟 Manaaki New Zealand Scholarships</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                      Fully-funded NZ government flagship scholarships covering full tuition, living allowances, return air travel, and research grants.
                    </p>
                  </div>
                </div>

                <div className="text-center text-xs font-bold text-slate-400">
                  💡 <em>Mentor's Tip: Gain admission FIRST, then file your separate scholarship application packs!</em>
                </div>
              </div>
            </section>

            {/* 6. Post-Study Work & PR Pathways */}
            <section id="pathways" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                  <Compass className="text-indigo-300" size={24} />
                  Post-Study Work & PR Pathways
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-300 uppercase block mb-2">UG / PG Degree</span>
                    <strong className="text-sm font-extrabold block">3-Year Work Rights</strong>
                    <p className="text-white/80 leading-relaxed font-semibold mt-1">
                      Enjoys a full 3-year open post-study work visa (PSWV) with unrestricted employer options.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-300 uppercase block mb-2">PhD Degree</span>
                    <strong className="text-sm font-extrabold block">4-Year Work Rights</strong>
                    <p className="text-white/80 leading-relaxed font-semibold mt-1">
                      PhD graduates receive a full 4-year Post-Study Work Visa under recent trade agreements.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-300 uppercase block mb-2">PR Fast-Track</span>
                    <strong className="text-sm font-extrabold block">Green List System</strong>
                    <p className="text-white/80 leading-relaxed font-semibold mt-1">
                      Jobs matching the NZ Green List offer straight-to-residence or work-to-residence PR fast-track options.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about studying in New Zealand</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "How does the India-NZ FTA benefit international students in 2026?", a: "The FTA increased weekly work hours to 25 hours, introduced IQA qualifications exemptions for most Indian boards, and granted up to 4 years post-study work visa options for PhD researchers." },
                  { q: "What is the IQA assessment exemption?", a: "Immigration NZ no longer requires Indian students from accredited boards to verify high school or college credentials with the NZQA, saving thousands in processing fees and reducing visa timelines." },
                  { q: "Which NZ university ranks highest globally?", a: "The University of Auckland ranks #65 in the world, making it the highest-ranked and only Top-100 university in New Zealand." },
                  { q: "Is the IELTS test mandatory for a visa?", a: "The visa itself doesn't mandate a specific test score; however, institutions require proof of English proficiency (IELTS 6.0/6.5 or PTE 50/58) for admissions." }
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

export default NewZealandBest;
