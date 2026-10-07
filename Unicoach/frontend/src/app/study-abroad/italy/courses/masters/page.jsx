import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, BookOpen, Clock, HelpCircle, CheckCircle2, 
  ArrowRight, Award, MapPin, Sparkles, Briefcase, Coins, ShieldCheck, Info,
  AlertTriangle, Wallet, ChevronDown, Check, Target, FileText, GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { useLead } from '../../../../../context/LeadContext';

const SECTIONS = [
  { id: 'benefits', title: 'Key Benefits' },
  { id: 'top-unis', title: 'Top 10 MS Universities' },
  { id: 'roadmap', title: 'Admission & Visa Roadmap' },
  { id: 'specializations', title: 'Popular Specializations' },
  { id: 'tuition-costs', title: 'Tuition Fees' },
  { id: 'living-costs', title: 'Cost of Living' },
  { id: 'scholarships', title: 'Scholarships' },
  { id: 'careers', title: 'Post-Grad Careers' },
  { id: 'faq', title: 'FAQ' }
];

const countryShortlistOptions = [
  { name: 'UK', flag: 'https://flagcdn.com/w40/gb.png' },
  { name: 'USA', flag: 'https://flagcdn.com/w40/us.png' },
  { name: 'Germany', flag: 'https://flagcdn.com/w40/de.png' },
  { name: 'Australia', flag: 'https://flagcdn.com/w40/au.png' },
  { name: 'Ireland', flag: 'https://flagcdn.com/w40/ie.png' },
  { name: 'New Zealand', flag: 'https://flagcdn.com/w40/nz.png' },
  { name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png' },
  { name: 'UAE', flag: 'https://flagcdn.com/w40/ae.png' },
  { name: 'France', flag: 'https://flagcdn.com/w40/fr.png' },
  { name: 'Sweden', flag: 'https://flagcdn.com/w40/se.png' },
  { name: 'Italy', flag: 'https://flagcdn.com/w40/it.png' },
  { name: 'Other', flag: '🌍' }
];

const topTenMsUnis = [
  { 
    rank: "#1",
    name: "Politecnico di Milano", 
    qsRank: "QS #111-123", 
    strength: "Engineering, Design, AI", 
    feesEUR: { min: 3000, max: 3900 },
    highlights: ["World leader: Engineering, Architecture, Design", "Corporate partners: Ferrari, Google, IBM", "DSU Lombardy: Full fees + €7,800 stipend"],
    reqs: "IELTS 6.0 | Min 70% GPA"
  },
  { 
    rank: "#2",
    name: "University of Bologna", 
    qsRank: "QS #133-185", 
    strength: "Data Science, Law", 
    feesEUR: { min: 1500, max: 3000 },
    highlights: ["Oldest university in the Western world (1088)", "Most organised DSU system (ER.GO)", "Action 1 & 2: €11,000 merit grants"],
    reqs: "IELTS 6.5 | CV evaluation"
  },
  { 
    rank: "#3",
    name: "Sapienza University of Rome", 
    qsRank: "QS #132-203", 
    strength: "Physics, Humanities", 
    feesEUR: { min: 1000, max: 2500 },
    highlights: ["Europe's largest university by enrollment", "Research powerhouse: Physics, Aerospace, Classics", "DiscoLazio: Accommodation + cash stipend"],
    reqs: "IELTS 5.5-6.0 | Pre-selection required"
  },
  { 
    rank: "#4",
    name: "University of Padua", 
    qsRank: "QS #216-242", 
    strength: "Psychology, Physics", 
    feesEUR: { min: 1200, max: 3000 },
    highlights: ["Galileo's university | First to award woman a degree", "Top for scientific research & human rights", "ESU Padova + €8,000 Excellence Scholarship"],
    reqs: "IELTS 6.5 | Strong academic credentials"
  },
  { 
    rank: "#5",
    name: "Politecnico di Torino", 
    qsRank: "QS #241-334", 
    strength: "Automotive Tech, ICT", 
    feesEUR: { min: 2800, max: 3500 },
    highlights: ["Italy's automotive heart", "Close partnerships with FIAT, industrial hub of Turin", "EDISU Piemonte + TOPoliTO scholarships"],
    reqs: "IELTS 5.5 | TIL entrance test"
  },
  { 
    rank: "#6",
    name: "University of Milan", 
    qsRank: "QS #276-350", 
    strength: "Life Sciences, Biotech", 
    feesEUR: { min: 1000, max: 3000 },
    highlights: ["'La Statale' | Only Italian LERU member", "Top for Biotechnology, Law, Economics", "DSU Milano + €8,000 Excellence Scholarships"],
    reqs: "IELTS 6.0 | Related Bachelor's degree"
  },
  { 
    rank: "#7",
    name: "University of Pisa", 
    qsRank: "QS #349-422", 
    strength: "Computer Science, Physics", 
    feesEUR: { min: 1200, max: 3000 },
    highlights: ["Elite Scuola Normale Superiore partnership", "Premier scientific centre in Europe", "DSU Toscana + €6,500-8,000 merit grants"],
    reqs: "Academic record + consular interview"
  },
  { 
    rank: "#8",
    name: "University of Turin", 
    qsRank: "QS #371-510", 
    strength: "Biotechnology, Food Science", 
    feesEUR: { min: 900, max: 2800 },
    highlights: ["Strong research focus in biotech & food science", "EDISU Piemonte scholarship support", "Affordable living in Turin"],
    reqs: "IELTS 5.5-6.0 | Bachelor's in related field"
  },
  { 
    rank: "#9",
    name: "Bocconi University", 
    qsRank: "Top 100 (Business)", 
    strength: "Finance, MBA", 
    feesEUR: { min: 14000, max: 18000 },
    highlights: ["Prestigious private business school", "Top-tier global placements & career recruiting", "Strong alumni network globally"],
    reqs: "GMAT 600+ | IELTS 7.0 | Private university"
  },
  { 
    rank: "#10",
    name: "UCSC (Cattolica)", 
    qsRank: "QS #491-560", 
    strength: "Social Sciences, Management", 
    feesEUR: { min: 10000, max: 14000 },
    highlights: ["Largest private university in Europe", "Strong corporate networking & internships", "English-taught business masters"],
    reqs: "IELTS 6.5 | Private university"
  }
];

const keyBenefits = [
  { title: "Subsidized Education", desc: "Public universities are state-funded, with fees determined by family economic status (ISEE). This system can drop tuition to near-zero." },
  { title: "12-Month Stay-Back", desc: "Indian graduates can stay in Italy for a full year post-graduation to search for employment or start a business within the EU." },
  { title: "700+ English Programs", desc: "Over 90 universities offer more than 700 Master’s programs entirely in English, notably in AI, Engineering, and Fashion." },
  { title: "Schengen Mobility", desc: "Your student visa acts as a golden ticket, allowing travel and networking across 29 European Schengen countries." },
  { title: "Rich Culture", desc: "Italy is the global leader in UNESCO World Heritage sites, providing a historically rich backdrop for growth." },
  { title: "Rising Job Quotas", desc: "Italy's Decreto Flussi plans nearly 500,000 work permits (2026-2028), targeting non-EU graduates in IT, Engineering, and Healthcare." }
];

const specializations = [
  { cat: "Engineering", courses: "Mechanical, Automotive, Civil, & Aerospace Engineering", unis: "Politecnico di Milano, Politecnico di Torino, Sapienza", role: "Automotive Engineer, Project Manager, R&D Scientist" },
  { cat: "Tech & Data Science", courses: "Computer Science, AI, Data Science, & Cybersecurity", unis: "Politecnico di Milano, University of Bologna, University of Pisa", role: "AI Specialist, Data Scientist, Systems Architect" },
  { cat: "Business & Mgmt", courses: "MBA, International Management, Finance, & Luxury Brand Management", unis: "SDA Bocconi, LUISS Guido Carli, Università Cattolica", role: "Financial Analyst, Brand Manager, Product Manager" },
  { cat: "Design & Arch", courses: "Fashion Design, Interior Design, Sustainable Architecture", unis: "Politecnico di Milano, Domus Academy, IED Milan, NABA", role: "Fashion Designer, Urban Planner, UX/UI Designer" },
  { cat: "Life Sciences", courses: "Biotechnology, Biomedical Engineering, & Food Science", unis: "University of Milan, University of Padua, University of Bologna", role: "Biotechnologist, Food Safety Expert, Medical Researcher" },
  { cat: "Social Sciences", courses: "International Relations, Global Governance, & Law (LLM)", unis: "LUISS Guido Carli, University of Bologna, Sapienza University", role: "Diplomat, Policy Analyst, Legal Consultant" }
];

const costOfStudy = [
  { type: "Public Universities", feesEUR: { min: 900, max: 4000 }, advantage: "Subsidized based on income (ISEE)" },
  { type: "Private Universities", feesEUR: { min: 6000, max: 25000 }, advantage: "Specialized focus & industry networking" },
  { type: "MBA / Elite Business", feesEUR: { min: 12000, max: 38000 }, advantage: "Global placements & employer reputation" }
];

const costOfLiving = [
  { item: "Accommodation", eur: { min: 300, max: 700 } },
  { item: "Food & Groceries", eur: { min: 150, max: 300 } },
  { item: "Public Transportation", eur: { min: 25, max: 50 } },
  { item: "Health Insurance", eur: { min: 40, max: 70 } },
  { item: "Utilities & Internet", eur: { min: 50, max: 150 } },
  { item: "Total Monthly Budget", eur: { min: 565, max: 1270 } }
];

const scholarships = [
  { name: "Regional DSU Grants", focus: "Based on economic need (ISEE Parificato)", eur: 7200, period: "year" },
  { name: "Invest Your Talent (IYT)", focus: "Engineering, Design, and Management students", eur: 900, period: "month" },
  { name: "MAECI Scholarships", focus: "High merit and academic excellence", eur: 900, period: "month" }
];

const careers = [
  { sector: "Information Tech", employer: "IBM, Leonardo", role: "AI/Data Scientist", eur: { min: 35000, max: 60000 } },
  { sector: "Engineering", employer: "Ferrari, Eni", role: "Automotive Engineer", eur: { min: 32000, max: 45000 } },
  { sector: "Fashion", employer: "Gucci, Prada", role: "Product Designer", eur: { min: 28000, max: 45000 } },
  { sector: "Finance", employer: "UniCredit", role: "Financial Analyst", eur: { min: 30000, max: 50000 } },
  { sector: "Life Sciences", employer: "GSK, Novartis, Menarini", role: "Biotechnologist", eur: { min: 30000, max: 50000 } }
];

const faqs = [
  { q: "Can I study in Italy without IELTS?", a: "Yes, many public universities (Bologna, Padua, Pisa) accept a Medium of Instruction (MOI) certificate if your Bachelor's degree was taught entirely in English." },
  { q: "Is Italy cheaper than other European countries?", a: "Generally, yes. Public university fees are much lower than in the UK or USA, and the cost of living in smaller Italian towns is very affordable." },
  { q: "What is the \"Decreto Flussi\"?", a: "It is a government decree that sets the quota for work visas. For 2026-2028, Italy plans to allow nearly 500,000 work visas, making it an opportune time for Indian graduates." },
  { q: "How much bank balance is required for an Italy student visa?", a: "For 2026, you must show roughly €6,947 (approx. ₹7.26 Lakhs) as proof of subsistence in your account, plus three years of ITR from your sponsor." },
  { q: "Is the Italian Master's degree recognized in Germany?", a: "Yes. Since Italy adheres to the EHEA standards (Bologna Process), your degree is fully recognized in Germany, Scandinavia, and other European regions." }
];

const ItalyMastersCourse = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [activeSection, setActiveSection] = useState('benefits');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Shortlist Wizard State
  const [selectedCountry, setSelectedCountry] = useState('Italy');
  const { openEligibilityModal } = useLead();

  const exchangeRate = 103.0; // Target rate: €1 = ₹103.0

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
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
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€${valInEUR.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹${Math.round(valInINR).toLocaleString('en-IN')}`;
  };

  const formatRange = (minEUR, maxEUR) => {
    if (currency === 'EUR') {
      return `€${minEUR.toLocaleString()} – €${maxEUR.toLocaleString()}`;
    }
    const minINR = minEUR * exchangeRate;
    const maxINR = maxEUR * exchangeRate;
    return `₹${(minINR / 100000).toFixed(2)}L – ₹${(maxINR / 100000).toFixed(2)}L`;
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-x-clip pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-indigo-100/20 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-blue-450/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-emerald-300/5 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-[1440px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/italy" className="hover:text-indigo-650 transition-colors">Italy</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Masters in Italy</span>
        </div>

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <GraduationCap size={14} className="text-indigo-650 animate-pulse" />
            <span>Last Updated: January 5, 2026</span>
            <span className="text-indigo-300">•</span>
            <Clock size={14} className="text-indigo-650" />
            <span>8 Min Read</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Masters in Italy 2026:<br />
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">The Definitive Guide for Indian Students</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto">
            Secure a globally respected, English-taught Master's degree in Italy without the traditional loan trap of US/UK programs.
          </p>
        </motion.div>

        {/* Reality Check Introduction Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(16,185,129,0.12),transparent_50%)]" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-5">
              <Info size={14} />
              <span>💡 The Reality Check</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
              You're looking at UK/USA tuition fees and feeling that sinking feeling.
            </h2>
            <p className="text-slate-350 text-sm md:text-base font-semibold leading-relaxed mb-4">
              Average Master's costs in those countries? ₹30–40 Lakhs. That's a decade of debt for most Indian families.
            </p>
            <p className="text-emerald-400 text-sm md:text-base font-extrabold leading-relaxed">
              But here's what smart students are discovering: A Master's in Italy costs just ₹90,000 – ₹3,60,000 per year (€1,000 – €4,000). And with the ISEE Parificato system, that can drop to near zero.
            </p>
          </div>
        </motion.div>

        {/* Currency Switcher Tool */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-xs inline-flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-3">Currency Tool:</span>
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-655 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-655 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2 Column Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] xl:grid-cols-[1fr_360px] gap-8 xl:gap-12">
          
          {/* Main Content Area */}
          <div className="space-y-16 min-w-0">

            {/* Section 1: Key Benefits */}
            <section id="benefits" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">01</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🇮🇹 Key Benefits for Indian Students</h2>
              </div>
              
              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {keyBenefits.map((b, idx) => (
                  <div key={idx} className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-750 flex items-center justify-center font-black text-xs mb-4">
                      0{idx + 1}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-2">{b.title}</h4>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>

              {/* Quick Facts Table */}
              <h3 className="text-lg font-black text-slate-900 mb-4">Quick Facts at a Glance</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Metric</th>
                        <th className="p-4">Value / Parameter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Annual Tuition (Public)</td>
                        <td className="p-4 text-indigo-650 font-bold">₹90,000 – ₹3,60,000 / year</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Annual Tuition (Private)</td>
                        <td className="p-4">₹6.2L – ₹25.8L+ / year</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">English Programs</td>
                        <td className="p-4 text-emerald-650 font-black">700+ Master's courses</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Stay-Back Visa</td>
                        <td className="p-4">12 months after graduation</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Work Permits (2026-2028)</td>
                        <td className="p-4 text-indigo-700 font-black">500,000 permits (Decreto Flussi)</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Schengen Countries</td>
                        <td className="p-4">29 countries visa-free access</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">UNESCO Sites</td>
                        <td className="p-4 text-amber-600">Global Leader</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Shortlist picker widget placed after 1st section */}
            <section id="shortlist-wizard" className="scroll-mt-24 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Get Your University Shortlist
              </h3>
              <p className="text-slate-500 text-xs font-semibold mb-6">
                Not sure which public university fits your profile? Let us help you.
              </p>

              {/* Wizard Box */}
              <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 border border-slate-150/70 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-150 text-indigo-700 flex items-center justify-center shrink-0">
                      <GraduationCap size={18} />
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs md:text-sm">Get My University Shortlist in 60 Secs</span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-[10px] font-black text-indigo-600">0%</span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 w-0" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs md:text-sm">Choose your dream country:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {countryShortlistOptions.map((country) => (
                      <button
                        key={country.name}
                        onClick={() => {
                          setSelectedCountry(country.name);
                          openEligibilityModal('visa-shortlist');
                        }}
                        className={`py-2.5 px-1.5 sm:py-3 sm:px-2 rounded-xl text-[10px] sm:text-[11px] font-black tracking-wide border transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                          selectedCountry === country.name
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        {country.flag.startsWith('http') ? (
                          <img 
                            src={country.flag} 
                            alt={country.name} 
                            className="w-4.5 h-4.5 rounded-full object-cover shrink-0" 
                          />
                        ) : (
                          <span className="text-sm shrink-0">{country.flag}</span>
                        )}
                        <span>{country.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => openEligibilityModal('visa-shortlist')}
                      className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-750 transition-colors shadow-sm cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Top 10 MS Universities */}
            <section id="top-unis" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">02</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏛️ Top 10 MS Universities in Italy (2026 Rankings)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Detailed breakdowns of the top ten public and private universities in Italy for Master's programs:
              </p>

              <div className="space-y-6 mb-8">
                {topTenMsUnis.map((uni, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500/5 rounded-bl-3xl flex items-center justify-center font-black text-indigo-600 text-sm sm:text-base">
                      {uni.rank}
                    </div>
                    <div className="mb-4 pr-12 sm:pr-20">
                      <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">{uni.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-750 text-[10px] font-black rounded-md uppercase">
                          {uni.qsRank}
                        </span>
                        <span className="text-[10px] text-slate-455 font-bold uppercase">{uni.strength}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-655 mb-6 border-b border-slate-100 pb-4">
                      <div>
                        <strong className="text-slate-900 block mb-1">💰 Tuition Fees:</strong>
                        <span className="text-sm font-black text-slate-800">
                          {formatRange(uni.feesEUR.min, uni.feesEUR.max)} / year
                        </span>
                      </div>
                      <div>
                        <strong className="text-slate-900 block mb-1">🎯 Admission Requirements:</strong>
                        <span className="text-slate-500 font-medium block">{uni.reqs}</span>
                      </div>
                    </div>

                    <div>
                      <strong className="text-slate-900 text-xs block mb-2">🏆 Key Highlights:</strong>
                      <ul className="space-y-1.5">
                        {uni.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                            <span className="text-indigo-600 font-black">✓</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Table */}
              <h3 className="text-lg font-black text-slate-900 mb-4 mt-8">Summary Table</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">University</th>
                        <th className="p-4">QS Rank</th>
                        <th className="p-4">Tuition (EUR)</th>
                        <th className="p-4">Tuition (INR)</th>
                        <th className="p-4">Best For</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-750">
                      {topTenMsUnis.map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{uni.name}</td>
                          <td className="p-4 text-indigo-700 font-bold">{uni.qsRank}</td>
                          <td className="p-4">€{uni.feesEUR.min.toLocaleString()} - €{uni.feesEUR.max.toLocaleString()}</td>
                          <td className="p-4">{formatRange(uni.feesEUR.min, uni.feesEUR.max)}</td>
                          <td className="p-4 text-slate-600">{uni.strength.split(', ')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3: Admission & Visa Roadmap */}
            <section id="roadmap" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">03</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📝 Admission & Visa Roadmap (2026)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Timeline and process mapping from initial profile checks up to VFS visa submissions:
              </p>

              {/* Three Phase Cards */}
              <div className="space-y-6 mb-8">
                {/* Phase 1 */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                  <div className="flex justify-between items-baseline gap-2 mb-4">
                    <h4 className="text-base font-black text-slate-900">Phase 1: University Admission</h4>
                    <span className="text-[10px] font-black text-indigo-600 uppercase">Jan – Apr 2026</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-600">
                    <div>
                      <strong className="text-slate-900 block mb-2">Academic Requirements:</strong>
                      <ul className="space-y-1 text-slate-500">
                        <li>• GPA: 2.5–3.0 / 4.0 (approx. 60–65%)</li>
                        <li>• IELTS: 6.0–6.5 OR TOEFL: 80+ (or MOI)</li>
                        <li>• GRE: 300+ / GMAT: 600+ (Finance/MBA only)</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-slate-900 block mb-2">Key Documents:</strong>
                      <ul className="space-y-1 text-slate-500">
                        <li>• Academic degree & transcripts</li>
                        <li>• Statement of Purpose (SOP)</li>
                        <li>• 2-3 Letters of Recommendation (LORs)</li>
                        <li>• Updated CV</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                  <div className="flex justify-between items-baseline gap-2 mb-4">
                    <h4 className="text-base font-black text-slate-900">Phase 2: Visa Legalization</h4>
                    <span className="text-[10px] font-black text-indigo-600 uppercase">May – Jul 2026</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-4">
                    Getting your degrees validated through state and consular authorities:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-xs font-black text-slate-800 block mb-1">Step 1</span>
                      <span className="text-[10px] font-bold text-slate-500">State HRD Attestation</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-xs font-black text-slate-800 block mb-1">Step 2</span>
                      <span className="text-[10px] font-bold text-slate-500">MEA Apostille</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-xs font-black text-slate-800 block mb-1">Step 3</span>
                      <span className="text-[10px] font-bold text-slate-500">DOV from Consulate</span>
                    </div>
                    <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl">
                      <span className="text-xs font-black text-indigo-700 block mb-1">Step 4</span>
                      <span className="text-[10px] font-extrabold text-indigo-600">Universitaly Portal</span>
                    </div>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                  <div className="flex justify-between items-baseline gap-2 mb-4">
                    <h4 className="text-base font-black text-slate-900">Phase 3: Financial Proof & Logistics</h4>
                    <span className="text-[10px] font-black text-indigo-600 uppercase">Jun – Aug 2026</span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-550">
                    <li>💰 <strong>Bank Balance:</strong> €6,947 minimum reserve (~₹7.26 Lakhs)</li>
                    <li>📊 <strong>Bank Statements:</strong> 6 months stamped logs from sponsors</li>
                    <li>📄 <strong>ITR Filings:</strong> 3 years from applicant or sponsor</li>
                    <li>🏥 <strong>Health Insurance:</strong> €30,000 coverage with repatriation clause</li>
                    <li>🏠 <strong>Accommodation:</strong> First 30 days confirmed stay booking</li>
                    <li>✈️ <strong>Flight Tickets:</strong> Confirmed itinerary or €2,000 buffer</li>
                  </ul>
                </div>
              </div>

              {/* Requirement Summary Table */}
              <h3 className="text-lg font-black text-slate-900 mb-4">Admission Requirements Summary</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Requirement</th>
                        <th className="p-4">Bachelor's to Master's Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">GPA</td>
                        <td className="p-4 text-slate-600">2.5 - 3.0 / 4.0 (approx 60-65%)</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">IELTS</td>
                        <td className="p-4 text-indigo-650 font-bold">6.0 - 6.5</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">TOEFL</td>
                        <td className="p-4">80+</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">GRE</td>
                        <td className="p-4 text-slate-650">300+ (required only for Business/Finance classes)</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">GMAT</td>
                        <td className="p-4 text-slate-650">600+ (required only for Business/Finance classes)</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Work Experience</td>
                        <td className="p-4">Not compulsory (preferred for executive MBA programs)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 4: Top Master's Specializations */}
            <section id="specializations" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">04</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🎯 Top Master's Specializations (2026)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                In-demand disciplines offering robust English-taught syllabi and career networking in Italy:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {specializations.map((spec, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2.5 mb-4">
                      <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-sm font-black">
                        {idx + 1}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm md:text-base">{spec.cat}</h4>
                    </div>
                    <div className="space-y-2 text-xs text-slate-550 font-semibold">
                      <p>🎓 <strong>Courses:</strong> {spec.courses}</p>
                      <p>🏛️ <strong>Top Unis:</strong> <span className="text-indigo-650 font-bold">{spec.unis}</span></p>
                      <p>💼 <strong>Key Roles:</strong> {spec.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Cost of Master's in Italy */}
            <section id="tuition-costs" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">05</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💰 Cost of Master's in Italy (2026)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Tuition comparison by institution model:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {costOfStudy.map((cost, idx) => (
                  <div key={idx} className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-905 text-sm mb-2">{cost.type}</h4>
                      <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider block mb-4">{cost.advantage}</span>
                    </div>
                    <p className="text-base font-black text-slate-800 border-t border-slate-50 pt-3 mt-4">
                      {formatRange(cost.feesEUR.min, cost.feesEUR.max)} / year
                    </p>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Institution Type</th>
                        <th className="p-4">Annual Tuition (EUR)</th>
                        <th className="p-4">Annual Tuition (INR)</th>
                        <th className="p-4">Advantage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {costOfStudy.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-4 text-slate-900 font-bold">{row.type}</td>
                          <td className="p-4">€{row.feesEUR.min.toLocaleString()} – €{row.feesEUR.max.toLocaleString()}</td>
                          <td className="p-4 text-indigo-650 font-bold">{formatRange(row.feesEUR.min, row.feesEUR.max)}</td>
                          <td className="p-4 text-slate-500 font-bold">{row.advantage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                <Sparkles className="text-emerald-600 shrink-0" size={18} />
                <span className="text-xs font-extrabold text-emerald-950">
                  💡 ISEE Parificato can reduce public tuition down to near-zero for eligible low/middle-income Indian families.
                </span>
              </div>
            </section>

            {/* Section 6: Cost of Living */}
            <section id="living-costs" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">06</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💶 Cost of Living (2026)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Average monthly living budget breakdown for international students in Italy:
              </p>

              {/* Monthly living cost table */}
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Monthly Cost Item</th>
                        <th className="p-4">Budget Range (EUR)</th>
                        <th className="p-4">Budget Range (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {costOfLiving.map((row, idx) => (
                        <tr key={idx} className={row.item.includes('Total') ? 'bg-indigo-50/30' : ''}>
                          <td className={`p-4 text-slate-900 ${row.item.includes('Total') ? 'font-black' : 'font-bold'}`}>{row.item}</td>
                          <td className="p-4">€{row.eur.min} – €{row.eur.max}</td>
                          <td className="p-4 text-indigo-650 font-black">{formatRange(row.eur.min, row.eur.max)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-center gap-3">
                <Info className="text-slate-600 shrink-0" size={18} />
                <span className="text-xs font-semibold text-slate-655">
                  💡 <strong>City Variations:</strong> Milan and Rome are premium hotspots. Smaller historic towns like Padua, Pisa, and Turin are significantly cheaper and offer low rents.
                </span>
              </div>
            </section>

            {/* Section 7: Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">07</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏆 Scholarships for Masters in Italy (2026)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Compare regional need-based and national merit-based grants for Master's degrees:
              </p>

              {/* Scholarship Summary Table */}
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Scholarship Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Monthly/Annual Benefits</th>
                        <th className="p-4">Deadline Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {scholarships.map((sch, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{sch.name}</td>
                          <td className="p-4 text-indigo-650 font-bold">{sch.focus.split(' (')[0]}</td>
                          <td className="p-4 text-emerald-650 font-black">
                            {currency === 'EUR' ? `Up to €${sch.eur.toLocaleString()} / ${sch.period}` : `${sch.name.includes('DSU') ? `~₹${(sch.eur * exchangeRate / 100000).toFixed(2)}L` : `~₹${Math.round(sch.eur * exchangeRate).toLocaleString()}`} / ${sch.period}`}
                          </td>
                          <td className="p-4 font-bold">{sch.dateLine || (sch.name.includes('DSU') ? "July – September 2026" : sch.name.includes('Talent') ? "Jan – Feb 2026" : "May – June 2026")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                <span className="text-xs font-extrabold text-amber-950">
                  ⚠️ IMPORTANT: DSU regional grant applications require apostilled and translated family income, property, and bank balance certificates from Indian revenue authorities.
                </span>
              </div>
            </section>

            {/* Section 8: Post-Study Work & Salaries */}
            <section id="careers" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">08</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💼 Post-Study Work & Career Prospects</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Graduates receive a 12-month post-study work visa to find employment or launch startups, which can then be converted directly to regular work permits under the Decreto Flussi quota systems.
              </p>

              {/* Sector salaries table */}
              <h3 className="text-base font-black text-slate-900 mb-4">Average Salaries by Sector (2026)</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Industry Sector</th>
                        <th className="p-4">Top Employers</th>
                        <th className="p-4">Popular MS Career Role</th>
                        <th className="p-4 text-right">Avg Salary Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {careers.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{c.sector}</td>
                          <td className="p-4 text-slate-600">{c.employer}</td>
                          <td className="p-4 text-indigo-700 font-bold">{c.role}</td>
                          <td className="p-4 text-right font-black text-emerald-650">
                            {formatRange(c.eur.min, c.eur.max)} / year
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-center gap-3">
                <Info className="text-indigo-650 shrink-0" size={18} />
                <span className="text-xs font-semibold text-slate-655">
                  💡 <strong>Language Tip:</strong> Technical STEM positions (CS, AI, Automotive Engineering) have minimal language barriers. Non-technical roles (Finance, Brand Management) typically require B2 Italian language skills.
                </span>
              </div>
            </section>

            {/* Section 9: FAQ */}
            <section id="faq" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">09</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">❓ Frequently Asked Questions</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Common queries regarding Master's studies in Italy:
              </p>

              <div className="space-y-4">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className="bg-white border border-slate-150/70 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-200"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-indigo-750 transition-colors gap-4 cursor-pointer"
                      >
                        <span className="text-sm md:text-base font-extrabold leading-snug">{faq.q}</span>
                        <ChevronDown 
                          size={18} 
                          className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} 
                        />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div className="px-5 pb-5 pt-1 text-slate-500 text-xs md:text-sm font-semibold leading-relaxed border-t border-slate-55">
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

            {/* Closing CTA */}
            <div className="mt-12">
              <StudyAbroadCTA country="Italy" />
            </div>

            {/* Disclaimer */}
            <p className="text-slate-455 text-[10px] font-semibold leading-relaxed text-center mt-6">
              Disclaimer: Fees, exchange rates, deadlines, and requirements are subject to change. Always verify with official sources and your specific university/consulate.
            </p>

          </div>

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block relative h-full">
            <div className="sticky top-28 space-y-6">
              
              {/* Navigation list */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-xs">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-5 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-600" />
                  Guide Navigation
                </h4>
                
                <nav className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                  {SECTIONS.map((sec) => {
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 group cursor-pointer ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-extrabold' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${
                          isActive ? 'bg-indigo-600 scale-125' : 'bg-slate-300 group-hover:bg-slate-400'
                        }`} />
                        <span className="truncate">{sec.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Quick Advisor CTA */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-[24px] p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <h5 className="font-black text-sm mb-2 tracking-tight leading-snug">
                  Planning a Master's in Italy?
                </h5>
                <p className="text-white/80 text-[11px] font-semibold leading-relaxed mb-5">
                  Get absolute clarity on pre-enrolment, CIMEA statements, and ISEE regional documents.
                </p>
                <Link
                  to="/book-consultation"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs rounded-xl shadow-xs transition-colors"
                >
                  Consult an Expert
                  <ArrowRight size={12} />
                </Link>
              </div>

            </div>
          </aside>

        </div>

      </div>
    </div>
  );
};

export default ItalyMastersCourse;
