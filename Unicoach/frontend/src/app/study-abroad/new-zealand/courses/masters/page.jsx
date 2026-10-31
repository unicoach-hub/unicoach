import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, Table, AlertCircle, Sparkles, 
  Building, ListFilter, HelpCircle, ChevronDown, Award, Globe, DollarSign, 
  BookOpen, Compass, ShieldCheck, Check, ShieldAlert, Coins, MapPin, Search,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { StatStrip, BarCompare } from '../../../../../components/ui/Infographics';

const SECTIONS = [
  { id: 'overview', title: 'Why Study MS in NZ?' },
  { id: 'rankings', title: 'Top 8 MS Universities' },
  { id: 'specialisations', title: 'Top Specialisations' },
  { id: 'types', title: 'Types of MS Programs' },
  { id: 'curriculum', title: 'Course Curriculum' },
  { id: 'admission', title: 'Admission Criteria' },
  { id: 'costs', title: 'Tuition & Living Costs' },
  { id: 'scholarships', title: 'Available Scholarships' },
  { id: 'careers', title: 'Jobs & Career Scope' },
  { id: 'recruiters', title: 'Top Recruiters' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const topMsUnisList = [
  { rank: 1, name: "University of Auckland", qs: "#67", feeNZD: 45857, feeINR: "₹25.7L", spec: "Data Science, Engineering, Computer Science", tagline: "NZ'S TOP-RANKED UNIVERSITY", logo: "/logos/verified-University of Auckland.png" },
  { rank: 2, name: "University of Otago", qs: "#198", feeNZD: 32499, feeINR: "₹18.2L", spec: "Health Sciences, Biotechnology, Psychology", tagline: "NZ'S OLDEST UNIVERSITY", logo: "/logos/verified-University of Otago.png" },
  { rank: 3, name: "Massey University", qs: "#215", feeNZD: 37000, feeINR: "₹20.7L", spec: "Agriculture, Veterinary Science, Food Technology", tagline: "APPLIED LEARNING", logo: "/logos/verified-Massey University.png" },
  { rank: 4, name: "Victoria Univ. Wellington", qs: "#241", feeNZD: 40124, feeINR: "₹22.5L", spec: "Environmental Science, Public Policy", tagline: "IN THE CAPITAL CITY", logo: "/logos/verified-Victoria University of Wellington.png" },
  { rank: 5, name: "University of Canterbury", qs: "#257", feeNZD: 36000, feeINR: "₹20.2L", spec: "Engineering, Environmental Science", tagline: "STRONG ENGINEERING SCHOOL", logo: "/logos/verified-University of Canterbury.png" },
  { rank: 6, name: "University of Waikato", qs: "#293", feeNZD: 39580, feeINR: "₹22.2L", spec: "Computer Science, Cybersecurity, AI", tagline: "NZ'S FIRST CYBER SECURITY LAB", logo: "/logos/verified-University of Waikato.png" },
  { rank: 7, name: "Lincoln University", qs: "#419", feeNZD: 39300, feeINR: "₹22.0L", spec: "Agribusiness, Food Science, Viticulture", tagline: "SPECIALIST LAND-BASED UNIVERSITY", logo: "/logos/verified-Lincoln University.png" },
  { rank: 8, name: "AUT (Auckland)", qs: "#431", feeNZD: 39022, feeINR: "₹21.9L", spec: "IT, Sport Science, Creative Technologies", tagline: "CAREER-FOCUSED CITY UNIVERSITY", logo: "/logos/verified-Auckland University of Technology.png" }
];

const NewZealandMastersCourse = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currency, setCurrency] = useState('INR'); // 'NZD' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 56.0; // 1 NZD = 56 INR (Aug 2026)

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
          <span className="text-slate-600 font-bold">MS Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="uc-soft relative rounded-[2.5rem] p-8 md:p-14 overflow-hidden mb-12">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80" 
              alt="MS Students in New Zealand" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <BookOpen size={14} />
              Master of Science (MS) Guide 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              MS in New Zealand 2026: Complete Guide for International Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Explore 1-2 year coursework and research MS options. Get global rankings, salary scope, and cost schedules across New Zealand's 8 universities.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 27, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                16 min read
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
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">MS Navigation</span>
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

            <StatStrip
              stats={[
                { value: '8th', label: 'Safest country in the world' },
                { value: '95%', label: 'MS graduates employed within 6 months' },
                { value: '3 yrs', label: 'Open post-study work visa' },
                { value: '1-2 yrs', label: 'Typical MS duration' },
              ]}
            />
            
            {/* 1. Why Study MS in NZ */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={22} />
                  💡 Why Study MS in New Zealand?
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  New Zealand is ranked as the **8th safest country** in the world. Its MS programs (1-2 years) are highly research-intensive, offering tuition advantages compared to US or UK and providing a robust path to global tech careers.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "All 8 universities in the QS 2027 top 500",
                    "95% of MS graduates employed within 6 months",
                    "3-year open post-study work visa rights",
                    "Flexible coursework vs research-focused structures"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
                      <Check className="text-teal-600 shrink-0" size={16} strokeWidth={3} />
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Top 8 MS Universities */}
            <section id="rankings" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Top 8 Universities for MS (QS 2027 Rankings & Fees)</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">QS 2027 rankings and typical starting Master's fee per year (120 points)</p>
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
                {topMsUnisList.map((uni) => (
                  <div key={uni.name} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
                        <img 
                          src={uni.logo} 
                          alt="" 
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name)}&background=4F46E5&color=ffffff&bold=true&size=128`; }}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-655 font-black uppercase tracking-wider flex items-center gap-1">
                          <Award size={12} />
                          Rank #{uni.rank} · QS: {uni.qs}
                        </span>
                        <h3 className="font-black text-slate-800 text-sm md:text-base mt-1">{uni.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-slate-400" />
                          {uni.spec.split(',')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 shrink-0">
                      <div>
                        <span className="text-slate-400 font-bold block">Tuition From</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{formatCost(uni.feeNZD)} / year</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">QS Position</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{uni.qs}</strong>
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

            {/* 3. Top Specialisations */}
            <section id="specialisations" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">💻 Top MS Specialisations in New Zealand</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">High demand study sectors for Indian students</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Computer Science & IT", bestFor: "Software Development, Data Analytics, AI", highlights: "Strong industry links, high employment rates, Green List PR options." },
                  { name: "Engineering Tracks", bestFor: "Civil, Mechanical, Environmental", highlights: "Heavy focus on structural design, practical labs, and local rebuild schemes." },
                  { name: "Environmental Science", bestFor: "Sustainability, Conservation, Policy", highlights: "Fieldwork inside unique NZ ecosystems with research grants." },
                  { name: "Biotechnology & Health", bestFor: "Genetic Engineering, Public Health", highlights: "Advanced labs, clinical trial linkages, and healthcare internships." }
                ].map((s, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider block mb-1">In-Demand</span>
                      <h3 className="font-black text-slate-850 text-base">{s.name}</h3>
                      <p className="text-slate-500 text-xs mt-2">Subjects: <strong>{s.bestFor}</strong></p>
                      <p className="text-slate-600 text-xs font-semibold leading-relaxed mt-3 bg-slate-50 p-4 rounded-xl">{s.highlights}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Types of MS Programs */}
            <section id="types" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6">📚 Types of MS Programs in New Zealand</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">🔬 Research-based MS</h3>
                    <p className="text-slate-505 leading-relaxed">
                      Independent research + thesis. Ideal for academia, R&D labs, and PhD pathways. Collaboration with faculty advisors.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">📖 Coursework-based MS</h3>
                    <p className="text-slate-505 leading-relaxed">
                      Structured coursework + practical components. Direct preparation for corporate career tracks and internships.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">💼 Professional MS</h3>
                    <p className="text-slate-505 leading-relaxed">
                      Designed for working professionals looking for career advancement or industry switches. Flexible schedules.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">🤝 Joint / Dual MS</h3>
                    <p className="text-slate-505 leading-relaxed">
                      Collaborative degrees with international partner universities offering global exposure and dual qualification cards.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Course Curriculum */}
            <section id="curriculum" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6">📖 Course Curriculum of MS in New Zealand</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block uppercase tracking-wider mb-1">Core Modules</span>
                    <p className="text-slate-700 leading-relaxed">Advanced theories, core research methodologies, and domain fundamentals.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block uppercase tracking-wider mb-1">Electives</span>
                    <p className="text-slate-700 leading-relaxed">Tailored options in specialized domains to match individual student research targets.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block uppercase tracking-wider mb-1">Practical Labs</span>
                    <p className="text-slate-700 leading-relaxed">Capstone projects, corporate placements, R&D internships, and thesis writing modules.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Admission Requirements */}
            <section id="admission" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-650" size={24} />
                  📋 Admission Requirements for MS in New Zealand
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">General Criteria</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Relevant Bachelor's degree from a recognized college, transcripts, 2-3 LORs, SOP essay, and updated resume profile.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">English Standards</h4>
                    <p className="text-slate-550 leading-relaxed">
                      <strong>IELTS:</strong> 6.5 overall (no band &lt; 6.0) or <strong>TOEFL:</strong> 90 minimum.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Costs */}
            <section id="costs" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  Tuition & Monthly Living Costs
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold mb-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-3">Est. Monthly Costs by City</h4>
                    <div className="space-y-3">
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Auckland:</span> <strong>NZ$1,200 - $1,600 (₹60K - ₹80K)</strong></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Wellington:</span> <strong>NZ$1,100 - $1,500 (₹55K - ₹75K)</strong></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Christchurch:</span> <strong>NZ$1,000 - $1,400 (₹50K - ₹70K)</strong></p>
                      <p className="flex justify-between"><span>Dunedin:</span> <strong>NZ$900 - $1,300 (₹45K - ₹65K)</strong></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-3">Monthly Expense Items</h4>
                    <div className="space-y-3">
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Accommodation:</span> <strong>NZ$500 – $800</strong></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Food:</span> <strong>NZ$300 – $400</strong></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Transport:</span> <strong>NZ$100 – $150</strong></p>
                      <p className="flex justify-between"><span>Utilities:</span> <strong>NZ$100 – $200</strong></p>
                    </div>
                  </div>
                </div>

                <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100 text-xs text-sky-950 font-semibold leading-relaxed">
                  <strong>💡 Annual Budget Summary:</strong> Typical Master's tuition ranges from about **₹18L – ₹33L** per year (NZ$32,500 – NZ$58,300). Average living budget requirements show **₹8L – ₹10.5L** per year.
                </div>
              </div>
            </section>

            {/* 8. Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Award className="text-indigo-650" size={24} />
                  Available Scholarships for MS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-2">Manaaki NZ Scholarships</h4>
                    <p className="text-slate-500">Fully funded government scheme covering tuition, allowance, airfare, and insurance costs.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-2">University Excellence Awards</h4>
                    <p className="text-slate-500">Merit scholarships (NZD 5,000 - 15,000) offered by individual public universities.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-2">Subject Specific Grants</h4>
                    <p className="text-slate-500">Targeted support grants for agricultural, IT, and biotechnology research candidates.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Jobs & Career Scope */}
            <section id="careers" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase className="text-indigo-650" size={24} />
                  Jobs & Career Scope (Average MS Salaries)
                </h2>

                <BarCompare
                  className="mb-6"
                  kicker="Average salary (NZD)"
                  title="Top of the pay range by MS role"
                  items={[
                    { label: 'Data Scientist', value: 120000, display: 'NZ$ 90,000 - $120,000' },
                    { label: 'Project Manager', value: 115000, display: 'NZ$ 80,000 - $115,000' },
                    { label: 'Software Engineer', value: 110000, display: 'NZ$ 85,000 - $110,000' },
                    { label: 'Biotechnologist', value: 100000, display: 'NZ$ 75,000 - $100,000' },
                    { label: 'Environmental Consultant', value: 95000, display: 'NZ$ 70,000 - $95,000' },
                  ]}
                />

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">MS Occupation</th>
                        <th className="pb-3 pr-4">Avg. Salary (NZD)</th>
                        <th className="pb-3 pr-4 text-right">Avg. Salary (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Data Scientist</td>
                        <td className="py-4 text-slate-600">NZ$ 90,000 - $120,000</td>
                        <td className="py-4 text-right text-indigo-650">₹ 48.3L - ₹ 64.4 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Software Engineer</td>
                        <td className="py-4 text-slate-600">NZ$ 85,000 - $110,000</td>
                        <td className="py-4 text-right text-indigo-650">₹ 45.6L - ₹ 59.0 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Project Manager</td>
                        <td className="py-4 text-slate-600">NZ$ 80,000 - $115,000</td>
                        <td className="py-4 text-right text-indigo-650">₹ 42.9L - ₹ 61.7 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Environmental Consultant</td>
                        <td className="py-4 text-slate-600">NZ$ 70,000 - $95,000</td>
                        <td className="py-4 text-right text-indigo-650">₹ 37.5L - ₹ 51.0 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Biotechnologist</td>
                        <td className="py-4 text-slate-600">NZ$ 75,000 - $100,000</td>
                        <td className="py-4 text-right text-indigo-650">₹ 40.2L - ₹ 53.7 Lakh</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 10. Top Recruiters */}
            <section id="recruiters" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm text-center">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center justify-center gap-2">
                  <Building className="text-indigo-650" size={24} />
                  Top Recruiters in New Zealand
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {["Fonterra", "Xero", "Spark New Zealand", "Fisher & Paykel Healthcare", "Beca Group", "Datacom", "NIWA Research", "GNS Science"].map((rec, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center text-xs font-black text-slate-700 shadow-xs">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 11. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about MS studies in New Zealand</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "What is the duration of an MS in New Zealand?", a: "MS programs in New Zealand typically last 1 to 2 years, depending on whether it is coursework-based or research-based." },
                  { q: "What are the language proficiency requirements?", a: "Most universities require an IELTS score of 6.5 overall (with no band below 6.0) or TOEFL (90 overall)." },
                  { q: "Can I work part-time during my MS?", a: "Yes, standard student visas allow you to work up to 25 hours per week during academic terms (recently increased from 20 hours) and unlimited hours during scheduled breaks." },
                  { q: "What is the post-study work visa eligibility?", a: "Level 9 Master's graduates are eligible for a 3-year open post-study work visa, giving you ample time to transition to a high-paying job." }
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

export default NewZealandMastersCourse;
