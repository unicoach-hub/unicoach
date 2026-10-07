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
  { id: 'overview', title: 'Why Choose Public NZ?' },
  { id: 'rankings', title: 'Top 8 Public Universities' },
  { id: 'profiles', title: 'Detailed Profiles' },
  { id: 'apply', title: 'How to Apply' },
  { id: 'pathways', title: 'Post-Study & PR' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const publicUnisList = [
  {
    rank: 1,
    name: "University of Auckland",
    qs: "#65",
    courses: "Engineering, Data Science, Business",
    ugFees: "₹21.5L - 30.2L",
    pgFees: "₹19.1L - 31.9L",
    tagline: "NZ'S TOP-RANKED UNIVERSITY",
    location: "Auckland (heart of the city)",
    founded: "1883",
    scholarship: "India High Achievers Scholarship: Up to ₹5.2L",
    whyUoA: "UniServices ($114M bridge), speed networking, deep tech/med ties",
    reqUG: "75-80% in XII + IELTS 6.0",
    reqPG: "60-70% in Bachelor's + IELTS 6.5",
    intakes: "February & July",
    logo: "https://logo.clearbit.com/auckland.ac.nz"
  },
  {
    rank: 2,
    name: "University of Otago",
    qs: "#197",
    courses: "Medicine, Dentistry, Psychology, Finance",
    ugFees: "₹21.3L - 25.4L",
    pgFees: "₹21.8L - 36.2L",
    tagline: "NZ'S OLDEST UNIVERSITY - RESIDENTIAL CAMPUS",
    location: "Dunedin (true university city)",
    founded: "1869",
    scholarship: "VC's Excellence: Up to NZ$35,000 (₹18.5L) for UG",
    whyUoA: "UniFlats with Kiwi hosts, bagpipe processions, Gigatown ultra-fast net",
    reqUG: "75% in XII + IELTS 6.0",
    reqPG: "65%+ in Bachelor's + IELTS 6.5",
    intakes: "February (Main) & July",
    logo: "https://logo.clearbit.com/otago.ac.nz"
  },
  {
    rank: 3,
    name: "Massey University",
    qs: "#230",
    courses: "Aviation, Veterinary Science, Agriculture",
    ugFees: "₹18.1L - 24.1L",
    pgFees: "₹20.5L - 32.3L",
    tagline: "ONLY UNIVERSITY WITH AVIATION DEGREES",
    location: "Auckland, Wellington, Palmerston North",
    founded: "1927",
    scholarship: "Massey University Excellence: NZ$5,000 (₹2.6L)",
    whyUoA: "Choose your vibe, state-of-the-art food plants, working farms",
    reqUG: "75% in XII + IELTS 6.0",
    reqPG: "60-65% in Bachelor's + IELTS 6.5",
    intakes: "February & July",
    logo: "https://logo.clearbit.com/massey.ac.nz"
  },
  {
    rank: 4,
    name: "Victoria University of Wellington",
    qs: "#240",
    courses: "Law, Public Policy, Architecture, AI",
    ugFees: "₹17.5L - 23.3L",
    pgFees: "₹18.5L - 24.9L",
    tagline: "#1 IN NZ FOR RESEARCH INTENSITY",
    location: "Wellington (political & creative capital)",
    founded: "1897",
    scholarship: "Tongarewa Scholarship: Up to NZ$10,000 (₹5.3L)",
    whyUoA: "Coolest capital, steps away from Parliament, NGO internships",
    reqUG: "75% in XII + IELTS 6.0",
    reqPG: "65% in Bachelor's + IELTS 6.5",
    intakes: "February, July & November",
    logo: "https://logo.clearbit.com/wgtn.ac.nz"
  },
  {
    rank: 5,
    name: "University of Canterbury",
    qs: "#261",
    courses: "Civil Engineering, Forestry, Disaster Management",
    ugFees: "₹18.0L - 23.5L",
    pgFees: "₹17.8L - 25.4L",
    tagline: "ENGINEERING CAPITAL OF NZ",
    location: "Christchurch (South Island)",
    founded: "1873",
    scholarship: "UC India High Achievers: Up to NZ$15,000 (₹7.9L)",
    whyUoA: "Self-contained green campus, 100+ clubs, alps proximity, STEM careers",
    reqUG: "75-80% in XII + IELTS 6.0",
    reqPG: "65-70% in Bachelor's + IELTS 6.5",
    intakes: "February & July",
    logo: "https://logo.clearbit.com/canterbury.ac.nz"
  },
  {
    rank: 6,
    name: "University of Waikato",
    qs: "#281",
    courses: "Cybersecurity, AI, Management (Triple Crown)",
    ugFees: "₹17.1L - 22.3L",
    pgFees: "₹18.5L - 25.4L",
    tagline: "TECH INNOVATION HUB - NZ'S FIRST INTERNET",
    location: "Hamilton (tech-heavy city)",
    founded: "1964",
    scholarship: "VC's International Excellence: NZ$15,000 (₹7.9L) discount",
    whyUoA: "Relaxed multicultural vibe, Village Green campus, ag-tech ties",
    reqUG: "75% in XII + IELTS 6.0",
    reqPG: "60% in Bachelor's + IELTS 6.5",
    intakes: "February, July & November",
    logo: "https://logo.clearbit.com/waikato.ac.nz"
  },
  {
    rank: 7,
    name: "Lincoln University",
    qs: "#407",
    courses: "Agribusiness, Food Science, Viticulture",
    ugFees: "₹15.7L - 16.7L",
    pgFees: "₹16.9L - 18.8L",
    tagline: "SPECIALIST LAND-BASED UNIVERSITY",
    location: "Lincoln (specialist green campus)",
    founded: "1878",
    scholarship: "International Taught Master Merit: NZ$10,000 (₹5.3L)",
    whyUoA: "Family atmosphere, hands-on vineyard field trips, 6% faster jobs",
    reqUG: "70% in XII + IELTS 6.0",
    reqPG: "60% in Bachelor's + IELTS 6.5",
    intakes: "February, July & November",
    logo: "https://logo.clearbit.com/lincoln.ac.nz"
  },
  {
    rank: 8,
    name: "Auckland University of Technology (AUT)",
    qs: "#410",
    courses: "Sport Science, Nursing, Creative Technologies",
    ugFees: "₹18.1L - 22.6L",
    pgFees: "₹20.0L - 32.9L",
    tagline: "HIGHEST GRADUATE EMPLOYMENT RATE",
    location: "Auckland (downtown urban hub)",
    founded: "2000",
    scholarship: "AUT South Asia International: Up to NZ$7,000 (₹3.7L)",
    whyUoA: "Urban campus, tech startup feel, career labs for Indian students",
    reqUG: "75% in XII + IELTS 6.0",
    reqPG: "60-65% in Bachelor's + IELTS 6.5",
    intakes: "February & July",
    logo: "https://logo.clearbit.com/aut.ac.nz"
  }
];

const NewZealandPublic = () => {
  const [activeSection, setActiveSection] = useState('overview');
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
          <Link to="/study-abroad/new-zealand" className="hover:text-indigo-650 transition-colors">New Zealand</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">Public Universities</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&auto=format&fit=crop&q=80" 
              alt="New Zealand Public Universities" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Building size={14} />
              Public Universities Guide 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Public Universities in New Zealand 2026: Rankings, Fees & PR Guide
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Every single public university in New Zealand is government-funded, ranks in the top 3% globally, and offers fast-track PR options for Indian students.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 20, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                11 min read
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
            
            {/* 1. Why Choose Public NZ */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={22} />
                  💡 Why Choose Public Universities in NZ?
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  New Zealand's 8 public universities offer world-class government-funded education starting at approximately **NZD 26,000 (₹13.5 Lakhs)** per year. PhD students pay the same low rates as domestic candidates.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Globally Ranked", val: "Top 3% globally" },
                    { label: "Affordable", val: "20-30% less than US/UK" },
                    { label: "Work Rights", val: "25 hours/week" },
                    { label: "Government Funded", val: "100% public funding" },
                    { label: "Post-Study Visa", val: "Up to 3 years" },
                    { label: "Green List PR", val: "Fast-track residency" }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block font-bold">{stat.label}</span>
                      <strong className="text-indigo-650 text-xs font-black block mt-1">{stat.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Top 8 Public Universities */}
            <section id="rankings" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Top 8 Public Universities in New Zealand</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rankings, course focus, and yearly fee estimates in INR</p>
              </div>

              <div className="space-y-6">
                {publicUnisList.map((uni) => (
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
                          Rank #{uni.rank} · QS Rank: {uni.qs}
                        </span>
                        <h3 className="font-black text-slate-800 text-sm md:text-base mt-1">{uni.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-slate-400" />
                          {uni.location.split('(')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 shrink-0">
                      <div>
                        <span className="text-slate-400 font-bold block">UG Fee Range</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{uni.ugFees} / year</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">PG Fee Range</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{uni.pgFees} / year</strong>
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
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Comprehensive admissions and student life data</p>
              </div>

              <div className="space-y-12">
                {publicUnisList.map((uni) => (
                  <div key={uni.name} className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                        <img src={uni.logo} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider">Rank #{uni.rank} · QS Rank: {uni.qs}</span>
                        <h3 className="text-lg font-black text-slate-850">{uni.name}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold mb-6">
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <span className="text-slate-405 block text-[10px] font-bold">🏫 Why Choose This School</span>
                        <p className="text-slate-800 leading-relaxed mt-1">{uni.whyUoA}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <span className="text-slate-405 block text-[10px] font-bold">🏆 Scholarship Value</span>
                        <p className="text-indigo-600 leading-relaxed mt-1">{uni.scholarship}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-t border-slate-100 pt-6">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider">UG Criteria</span>
                        <p className="text-slate-700 font-semibold mt-1">{uni.reqUG}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase tracking-wider">PG Criteria</span>
                        <p className="text-slate-700 font-semibold mt-1">{uni.reqPG}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-450 border-t border-slate-50 pt-4 mt-4">
                      <span>Founded: {uni.founded}</span>
                      <span>•</span>
                      <span>Intakes: {uni.intakes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. How to Apply */}
            <section id="apply" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-650" size={24} />
                  📝 How to Apply for Public Universities
                </h2>

                <div className="relative border-l-2 border-indigo-100 pl-6 ml-4 space-y-6 text-xs font-semibold">
                  {[
                    { step: "Step 1: Course & Green List check", desc: "Research courses that map directly to the Green List (engineering, IT, nursing)." },
                    { step: "Step 2: English tests", desc: "Take IELTS (target 6.5) or PTE (target 58+) before applying." },
                    { step: "Step 3: Document compilation", desc: "Acquire transcripts, LORs, SOPs, and resume profiles." },
                    { step: "Step 4: Submit applications", desc: "Submit directly to university portals or licensed partners." },
                    { step: "Step 5: Funding preparation", desc: "Prepare FTS accounts or secure education loans (minimum NZD $20,000 for living costs)." },
                    { step: "Step 6: Student Visa", desc: "Apply online via INZ RealMe portal and book local VFS biometrics." }
                  ].map((s, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white" />
                      <h4 className="text-xs font-black text-slate-850">{s.step}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Post-Study Work & PR Pathways */}
            <section id="pathways" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                  <Compass className="text-indigo-300" size={24} />
                  Post-Study Work & PR Pathways
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold mb-6">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <strong className="text-sm font-extrabold block">3-Year PSWV</strong>
                    <p className="text-white/80 leading-relaxed mt-1">
                      Available for all standard undergraduate and postgraduate Master's degrees.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <strong className="text-sm font-extrabold block">Green List Residency</strong>
                    <p className="text-white/80 leading-relaxed mt-1">
                      Fast-track PR options for construction managers, civil engineers, and IT specialists.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <strong className="text-sm font-extrabold block">LQEA Benefits</strong>
                    <p className="text-white/80 leading-relaxed mt-1">
                      Indian qualifications are largely exempt from expensive IQA assessments under the new agreement.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about New Zealand public universities</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Are all New Zealand public universities government-funded?", a: "Yes. All 8 public research universities are fully government-funded, ensuring highly regulated academic quality and degree credentials." },
                  { q: "What is the Green List PR pathway?", a: "Immigration NZ's registry of skills shortages. Graduate qualifications matching these lists can apply for immediate fast-track residency cards." },
                  { q: "How much are the living expenses for a student visa?", a: "You must demonstrate access to a minimum of NZD $20,000 (approx. ₹10.4 Lakhs) for each year of study." },
                  { q: "Are Indian students exempt from IQA?", a: "Yes, under the 2025/2026 LQEA updates, major Indian high school and college credentials bypass the manual verification phase." }
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

export default NewZealandPublic;
