import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, BookOpen, Clock, HelpCircle, CheckCircle2, 
  ArrowRight, Coins, ShieldCheck, Sparkles, GraduationCap, MapPin, Globe,
  AlertTriangle, Wallet, ChevronDown, Check, Target, Info, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import ShortlistWizardWidget from '../../../../../components/ShortlistWizardWidget';
import { useLead } from '../../../../../context/LeadContext';

const SECTIONS = [
  { id: 'why-public', title: 'Why Public Universities?' },
  { id: 'top-10', title: 'Top 10 Public Universities' },
  { id: 'affordable-unis', title: 'Other Affordable Universities' },
  { id: 'timeline', title: 'Application Process' },
  { id: 'scholarships', title: 'Scholarships' },
  { id: 'documents', title: 'Document Checklist' },
  { id: 'roi', title: 'Salaries & ROI' },
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

const topTenPublicUnis = [
  {
    rank: "#1",
    name: "Politecnico di Milano",
    qsRank: "QS #98",
    feesEUR: { min: 3500, max: 3900 },
    focus: "Engineering, Design, Architecture",
    highlights: ["World leader: Engineering, Architecture, Design", "Corporate partners: Ferrari, Google, IBM", "DSU Lombardy: Full fees + €7,800 stipend"],
    reqs: "IELTS 6.0 | Min 70% GPA"
  },
  {
    rank: "#2",
    name: "Sapienza University of Rome",
    qsRank: "QS #128",
    feesEUR: { min: 1000, max: 2500 },
    focus: "Physics, Aerospace, Classics",
    highlights: ["Europe's largest university by enrollment", "Research powerhouse: Physics, Aerospace, Classics", "DiscoLazio: Accommodation + cash stipend"],
    reqs: "IELTS 5.5-6.0 | Pre-selection required"
  },
  {
    rank: "#3",
    name: "University of Bologna",
    qsRank: "QS #138",
    feesEUR: { min: 2000, max: 3000 },
    focus: "Law, Medicine, Arts & Humanities",
    highlights: ["Oldest university in the Western world (1088)", "Most organised DSU system (ER.GO)", "Action 1 & 2: €11,000 merit grants"],
    reqs: "IELTS 6.5 | CV evaluation"
  },
  {
    rank: "#4",
    name: "University of Padua",
    qsRank: "QS #233",
    feesEUR: { min: 2500, max: 3000 },
    focus: "Sciences, Scientific Research, Medicine",
    highlights: ["Galileo's university | First to award woman a degree", "Top for scientific research & human rights", "ESU Padova + €8,000 Excellence Scholarship"],
    reqs: "IELTS 6.5 | Strong academic credentials"
  },
  {
    rank: "#5",
    name: "Politecnico di Torino",
    qsRank: "QS #301",
    feesEUR: { min: 2600, max: 3200 },
    focus: "Automotive & Mechanical Engineering",
    highlights: ["Italy's automotive heart", "Close partnerships with FIAT, industrial hub of Turin", "EDISU Piemonte + TOPoliTO scholarships"],
    reqs: "IELTS 5.5 | TIL entrance test"
  },
  {
    rank: "#6",
    name: "University of Milan",
    qsRank: "QS #276",
    feesEUR: { min: 2000, max: 2500 },
    focus: "Biotechnology, Law, Economics",
    highlights: ["'La Statale' | Only Italian LERU member", "Top for Biotechnology, Law, Economics", "DSU Milano + €8,000 Excellence Scholarships"],
    reqs: "IELTS 6.0 | Related Bachelor's degree"
  },
  {
    rank: "#7",
    name: "University of Pisa",
    qsRank: "QS #343",
    feesEUR: { min: 2400, max: 3000 },
    focus: "Physics, Mathematics, Engineering Sciences",
    highlights: ["Elite Scuola Normale Superiore partnership", "Premier scientific centre in Europe", "DSU Toscana + €6,500-8,000 merit grants"],
    reqs: "Academic record + consular interview"
  },
  {
    rank: "#8",
    name: "Tor Vergata University of Rome",
    qsRank: "QS #490",
    feesEUR: { min: 950, max: 3000 },
    focus: "Finance, Economics, Global Governance",
    highlights: ["Modern 'American-style' campus model", "Top for Finance, Global Governance, Economics", "Flexible enrollment options"],
    reqs: "GRE (sometimes) | IELTS 6.5"
  },
  {
    rank: "#9",
    name: "University of Naples Federico II",
    qsRank: "QS #496",
    feesEUR: { min: 1000, max: 2000 },
    focus: "Medicine, Engineering, Sciences",
    highlights: ["Oldest non-sectarian university (1224)", "ADISURC DSU regional scholarship support", "Lowest living costs in Southern Italy"],
    reqs: "IELTS 6.0 | Pre-acceptance letter"
  },
  {
    rank: "#10",
    name: "University of Florence",
    qsRank: "QS #459",
    feesEUR: { min: 2000, max: 2500 },
    focus: "Architecture, Industrial Design, Arts",
    highlights: ["Located in the birthplace of the Renaissance", "Top for Architecture, Design, Social Sciences", "DSU Toscana portfolio evaluations"],
    reqs: "IELTS 6.0 | Portfolio for Design programs"
  }
];

const otherAffordableUnis = [
  { name: "University of Messina", feeEUR: 256, feeNotes: "Fixed for Indian students", location: "Sicily", highlight: "Cheapest fixed tuition in Italy", livingEUR: 450 },
  { name: "University of Calabria", feeEUR: 800, feeNotes: "€0 - €1,600 range", location: "Cosenza", highlight: "Free food + housing for winners", livingEUR: 420 },
  { name: "University of Siena", feeEUR: 455, feeNotes: "€360 - €550 range", location: "Tuscany", highlight: "Peaceful, safe student city", livingEUR: 630 },
  { name: "University of Pavia", feeEUR: 1850, feeNotes: "€400 - €3,300 range", location: "Near Milan", highlight: "Low rent, close to Milan's job market", livingEUR: 730 },
  { name: "University of Catania", feeEUR: 600, feeNotes: "€300 - €900 range", location: "Sicily", highlight: "Extreme affordability for canteens/rooms", livingEUR: 420 },
  { name: "University of Genoa", feeEUR: 1950, feeNotes: "€1,100 - €2,800 range", location: "Genoa", highlight: "Excellent maritime & robotics courses", livingEUR: 680 },
  { name: "University of Cassino", feeEUR: 1200, feeNotes: "€1,000 - €1,400 range", location: "Cassino", highlight: "Flexible admission criteria for MBA", livingEUR: 510 }
];

const deadlinesList = [
  { name: "Politecnico Milano", date: "February 2026", note: "First intake closes early" },
  { name: "Sapienza Rome", date: "Dec 2025 – May 2026", note: "Pre-selection windows open" },
  { name: "Bologna", date: "April 2026", note: "Scholarship priority deadline" },
  { name: "Padua", date: "February 2026", note: "Early intake closing" },
  { name: "Torino", date: "March – April 2026", note: "Non-EU applicants round" },
  { name: "Milan", date: "May 2026", note: "Most English programs finalize" },
  { name: "Pisa", date: "April 30, 2026", note: "Final documentation round" },
  { name: "Tor Vergata", date: "February 2026", note: "Final round closes" },
  { name: "Naples", date: "May 31, 2026", note: "Pre-acceptance required" },
  { name: "Florence", date: "February 2026", note: "First round closes" }
];

const salariesSector = [
  { sector: "IT & Data Science", grossEUR: "€32,000 – €42,000", netINR: "₹2.1L – ₹2.8L / month" },
  { sector: "Engineering", grossEUR: "€30,000 – €38,000", netINR: "₹1.9L – ₹2.5L / month" },
  { sector: "Finance & Management", grossEUR: "€28,000 – €36,000", netINR: "₹1.8L – ₹2.4L / month" },
  { sector: "Fashion & Design", grossEUR: "€25,000 – €34,000", netINR: "₹1.6L – ₹2.2L / month" },
  { sector: "Biotech & Health", grossEUR: "€24,000 – €32,000", netINR: "₹1.5L – ₹2.1L / month" }
];

const faqsList = [
  { q: "Is Italy costly for Indian students?", a: "No. The average annual budget is €8,000 – €12,000 (~₹8.4L – ₹12.6L) which comfortably covers tuition, rent, groceries, public transport, and health insurance." },
  { q: "Is IELTS compulsory for Italy?", a: "Not always. Many public universities accept a Medium of Instruction (MOI) certificate from your previous university. You can skip IELTS/TOEFL if your earlier degree was taught in English." },
  { q: "Does Italy give 100% scholarships?", a: "Yes. DSU Regional is need-based and covers 100% tuition waivers + free dorms + meals + cash stipend. MAECI is merit-based and covers tuition + monthly stipend. Invest Your Talent covers tuition + stipends + guaranteed internships." },
  { q: "Are public universities in Italy free?", a: "Not entirely, but heavily subsidized. Minimum tuition is €500-€800/year, and maximum is €3,000-€4,000/year. With a DSU scholarship, tuition is reduced to €0 for eligible students." },
  { q: "What's the minimum bank balance for a visa?", a: "You need to show at least €7,000 (~₹7.4 Lakhs) in your bank account as a financial reserve for the student visa." },
  { q: "Can I work part-time while studying?", a: "Yes. 20 hours/week during term. Average hourly pay is €8-€12, which easily covers monthly food, transit, and personal expenses." },
  { q: "What is CIMEA?", a: "A digital comparability statement that validates your Indian degree and confirms its equivalent status in the Italian educational framework. It is required for university enrollment and visa processing." }
];

const ItalyPublic = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [activeSection, setActiveSection] = useState('why-public');
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
          <span className="text-slate-600 font-black">Public Universities</span>
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
            <span>Last Updated: January 19, 2026</span>
            <span className="text-indigo-300">•</span>
            <Clock size={14} className="text-indigo-650" />
            <span>11 Min Read</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Top Public Universities in Italy 2026:<br />
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Complete Guide for International Students</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto">
            Discover why studying in Italy's state-funded public institutions offers premium rankings and DSU funding support.
          </p>
        </motion.div>

        {/* Smart Choice Introduction Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(16,185,129,0.12),transparent_50%)]" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5">
              <Info size={14} />
              <span>💡 The Smart Choice for 2026</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
              Want a world-class degree without the US/UK price tag?
            </h2>
            <p className="text-slate-350 text-sm md:text-base font-semibold leading-relaxed mb-4">
              Italy's public universities offer exactly that. With tuition ranging from €500 to €4,000 per year (~₹45,000 – ₹3.6 Lakhs), and DSU scholarships covering 100% of costs plus a €7,800 (~₹8.2 Lakhs) yearly stipend, it's one of Europe's best-kept secrets.
            </p>
            <p className="text-emerald-400 text-sm md:text-base font-extrabold leading-relaxed">
              Degrees recognised worldwide • 500+ programs taught in English • 12-month post-study work visa • Gateway to 29 European countries
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

            {/* Section 1: Why Choose a Public University? */}
            <section id="why-public" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">01</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🇮🇹 Why Choose a Public University in Italy?</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Public universities in Italy are funded by the state, treating education as a public good.
              </p>

              {/* Reasons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">
                    🏆
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Top Rankings</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Politecnico di Milano ranks #98 globally. High research rigor.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center mb-4 font-black">
                    🌍
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">English Programs</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Over 500+ programs taught entirely in English.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-black">
                    💰
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">DSU Scholarships</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Need-based regional support covering tuition and living stipends.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 font-black">
                    🚪
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Low Entry Barrier</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    No GRE/GMAT required for the vast majority of Master's courses.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 font-black">
                    💼
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Part-Time Work</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Work 20 hours/week to fully cover basic monthly expenses.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 font-black">
                    ✈️
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Schengen Travel</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Schengen zone access allows travel across 29 European countries.
                  </p>
                </div>
              </div>
            </section>

            {/* University shortlist picker widget */}
            <section id="shortlist-wizard" className="scroll-mt-24">
              <ShortlistWizardWidget 
                title="Get Your University Shortlist" 
                subtitle="Not sure which public university fits your profile? Let us help you." 
              />
            </section>

            {/* Section 2: Top 10 Public Universities */}
            <section id="top-10" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">02</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏛️ Top 10 Public Universities in Italy (2026)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Detailed breakdowns of the top ten public universities in Italy, highlighting their specializations, tuition ranges, and scholarships.
              </p>

              <div className="space-y-6">
                {topTenPublicUnis.map((uni, idx) => (
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
                        <span className="text-[10px] text-slate-450 font-bold uppercase">{uni.focus}</span>
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
              <h3 className="text-lg font-black text-slate-900 mb-4 mt-12 flex items-center gap-2">
                <FileText className="text-indigo-650" size={18} />
                Summary Table: Top 10 Public Universities
              </h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">University</th>
                        <th className="p-4">QS 2026</th>
                        <th className="p-4">Tuition (EUR)</th>
                        <th className="p-4">Tuition (INR)</th>
                        <th className="p-4">Best For</th>
                        <th className="p-4">IELTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {topTenPublicUnis.map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{uni.name}</td>
                          <td className="p-4 font-bold text-indigo-700">{uni.qsRank}</td>
                          <td className="p-4">€{uni.feesEUR.min} - €{uni.feesEUR.max}</td>
                          <td className="p-4">{formatRange(uni.feesEUR.min, uni.feesEUR.max)}</td>
                          <td className="p-4 text-slate-600">{uni.focus.split(', ')[0]}</td>
                          <td className="p-4 font-black">{uni.reqs.split(' | ')[0].replace('IELTS ', '')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3: Other Affordable Universities */}
            <section id="affordable-unis" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">03</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏛️ Other Affordable Public Universities</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                In addition to the top 10, Italy hosts multiple public universities offering extremely low, fixed-rate tuition fees for developing countries, or free canteens and lodging.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {otherAffordableUnis.map((uni, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-baseline gap-2 mb-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{uni.name}</h4>
                      <span className="text-[10px] text-slate-400 font-black uppercase whitespace-nowrap">{uni.location}</span>
                    </div>
                    <span className="text-xs text-indigo-600 font-black block mb-2">{uni.highlight}</span>
                    <div className="space-y-1.5 text-xs text-slate-550 font-semibold">
                      <p>💰 <strong>Tuition Fee:</strong> {formatCost(uni.feeEUR)} ({uni.feeNotes})</p>
                      <p>🏠 <strong>Living Cost:</strong> {formatCost(uni.livingEUR)} / month</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              <h3 className="text-lg font-black text-slate-900 mb-4">Affordable Universities Comparison</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">University</th>
                        <th className="p-4">Tuition (INR)</th>
                        <th className="p-4">Living Cost (INR/mo)</th>
                        <th className="p-4">Highlight Feature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {otherAffordableUnis.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{row.name}</td>
                          <td className="p-4 font-bold text-slate-805">{formatCost(row.feeEUR)}</td>
                          <td className="p-4">{formatCost(row.livingEUR)}</td>
                          <td className="p-4 text-indigo-650">{row.highlight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                <Sparkles className="text-emerald-600 shrink-0" size={18} />
                <span className="text-xs font-extrabold text-emerald-950">
                  💡 Southern Italy Advantage: Monthly food costs can drop to just ₹8,000 - ₹10,000 using subsidized canteen cards.
                </span>
              </div>
            </section>

            {/* Section 4: Step-by-Step Application Process */}
            <section id="timeline" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">04</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📝 Step-by-Step Application Process</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Strict adherence to the Italian academic timeline is essential to secure admission and regional scholarships.
              </p>

              {/* Timeline Steps */}
              <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 before:pointer-events-none mb-8">
                {[
                  { step: "Step 1: Secure Admission", dates: "Jan – Apr 2026", desc: "Apply directly to 3-5 universities. Review language and GPA requirements, and complete entrance tests (like TOLC or IMAT) if applicable to receive your conditional pre-admission letter." },
                  { step: "Step 2: Universitaly Portal", dates: "Apr – Jun 2026", desc: "Register on the official government Universitaly portal. Upload your passport, photo, academic transcripts, and the admission letter, and select the corresponding Italian Embassy in India to download your validated Summary PDF." },
                  { step: "Step 3: Document Legalization", dates: "May – Jul 2026", desc: "Complete HRD State Attestation, get apostilles from the Ministry of External Affairs (MEA), and apply for a CIMEA digital comparability statement or Declaration of Value (DOV)." },
                  { step: "Step 4: Visa Submission", dates: "Jun – Aug 2026", desc: "Book an appointment at VFS Global. Demonstrate a minimum bank reserve of €7,000, secure a €30,000 health insurance plan, and submit your Type D National Visa application." }
                ].map((phase, idx) => (
                  <div key={idx} className="relative pl-12 flex gap-4">
                    <span className="absolute left-3 w-6.5 h-6.5 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center border-4 border-white shadow-xs">{idx + 1}</span>
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs w-full">
                      <div className="flex justify-between items-baseline gap-2 mb-3">
                        <h4 className="font-black text-slate-900 text-sm md:text-base">{phase.step}</h4>
                        <span className="text-[10px] font-black text-indigo-650 uppercase whitespace-nowrap">{phase.dates}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 leading-relaxed">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deadlines list */}
              <h3 className="text-lg font-black text-slate-900 mb-4">Key Deadlines by University</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">University</th>
                        <th className="p-4">2026 Deadline</th>
                        <th className="p-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {deadlinesList.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-4 text-slate-900 font-bold">{row.name}</td>
                          <td className="p-4 text-indigo-650 font-bold">{row.date}</td>
                          <td className="p-4 text-slate-500 font-bold text-xs">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 5: Scholarships for Indian Students */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">05</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏆 Scholarships for Indian Students (2026)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Italy offers three major scholarship pathways that can cover 100% of your tuition fees and living stipends:
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { title: "DSU Regional Scholarship (Need-Based)", stipend: "₹5.5L – ₹8.4L / year", extra: "Free university hostel or monthly rent subsidy • 1-2 free meals daily at the university canteen • 100% tuition waiver.", renew: "Renewable yearly subject to passing minimum credit requirements (CFUs).", target: "For middle-class families seeking absolute financial coverage." },
                  { title: "MAECI Government Grant (Merit-Based)", stipend: "₹95,800 / month", extra: "100% tuition fee waiver • Full health insurance coverage • Valid for 6 or 9 months duration.", renew: "Extremely prestigious. Deadlines usually close between May – June 2026.", target: "For high GPA students seeking Italian government accolades." },
                  { title: "Invest Your Talent (IYT - Professional Grant)", stipend: "₹1.05 Lakhs / month", extra: "100% tuition waiver • Guaranteed 3-month corporate internship in Italy • 9 months duration.", renew: "Renewable based on academic success. Deadlines close around Jan – Feb 2026.", target: "For Engineering, Design, or Economics Master's students seeking practical work." }
                ].map((s, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-lg uppercase tracking-wider block w-fit mb-3">
                      Stipend: {s.stipend}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-2">{s.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-2"><strong>Benefits:</strong> {s.extra}</p>
                    <p className="text-xs text-indigo-700 font-semibold leading-relaxed"><strong>Renewal/Deadlines:</strong> {s.renew}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-3">✓ Target profile: {s.target}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6: Document Checklist */}
            <section id="documents" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">06</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📂 Document Checklist for DSU & Visa</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Preparing your DSU regional scholarship folder early (by June/July) is essential to secure funding approval.
              </p>

              {/* DSU checklist highlight */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-6 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-650" size={18} />
                  DSU "Indian Income" Folder Requirements
                </h4>

                <div className="space-y-4">
                  {[
                    { doc: "Family Income Certificate", detail: "Issued by Zila Parishad / Tehsildar / SDM for the previous financial year." },
                    { doc: "Property Certificate", detail: "Details of house/land area owned in square meters. (Or a 'No Property Certificate' if renting)." },
                    { doc: "Bank Balance Certificate", detail: "Year-end balances for all family members as of December 31st of the previous calendar year." },
                    { doc: "Family Composition Certificate (Vanshavali)", detail: "Ration Card or municipal certificate detailing all household members." }
                  ].map((row, idx) => (
                    <div key={idx} className="flex gap-4 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        ✓
                      </span>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{row.doc}</p>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{row.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                  <span className="text-xs font-extrabold text-amber-950">
                    ⚠️ TRANSFORMATION RULE: All documents MUST be MEA apostilled in India and translated into Italian by embassy-authorised translators.
                  </span>
                </div>
              </div>

              {/* Visa checklist */}
              <h3 className="text-lg font-black text-slate-900 mb-4">Additional Documents for Student Visa</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Document</th>
                        <th className="p-4">Requirement Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Valid Passport</td>
                        <td className="p-4">10 years max; 3+ months validity beyond stay; 2 blank pages.</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Acceptance Letter</td>
                        <td className="p-4">Official from host Italian university.</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Universitaly Summary</td>
                        <td className="p-4">Validated PDF file copy.</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Academic Records</td>
                        <td className="p-4">HED attested and MEA apostilled.</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">CIMEA Statement</td>
                        <td className="p-4">Digital comparability certificate copy.</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Financial Proof</td>
                        <td className="p-4">€7,000 minimum reserve (~₹7.4 Lakhs).</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Health Insurance</td>
                        <td className="p-4">€30,000 coverage copy (first 90-180 days).</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Accommodation Proof</td>
                        <td className="p-4">Confirmed reservation for first 30 days of stay.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 7: Salaries & ROI */}
            <section id="roi" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">07</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💼 Salaries & ROI for Indian Graduates</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Graduates can apply for a 12-month post-study stay-back permit. Here are top roles and average salaries:
              </p>

              {/* Salaries sector table */}
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Job Sector</th>
                        <th className="p-4">Average Gross Salary</th>
                        <th className="p-4">Average Net Salary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {salariesSector.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{row.sector}</td>
                          <td className="p-4 font-bold text-slate-850">{row.grossEUR} / year</td>
                          <td className="p-4 text-emerald-650 font-black">{row.netINR}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ROI visual breakdown */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-6 flex items-center gap-2">
                  <Wallet size={18} className="text-indigo-650" />
                  Investment vs. Breakeven Period
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-rose-50 border border-rose-100 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] text-rose-800 font-black uppercase block mb-1">Without Scholarship</span>
                      <h5 className="font-black text-slate-900 text-xs">Total Investment: ~₹15L – ₹20L</h5>
                    </div>
                    <span className="text-xs font-black text-rose-700">Breakeven: ~1 year</span>
                  </div>

                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-black uppercase block mb-1">With DSU Scholarship</span>
                      <h5 className="font-black text-slate-900 text-xs">Total Investment: ~₹0 (tuition + rent waived)</h5>
                    </div>
                    <span className="text-xs font-black text-emerald-700">Net earner while studying!</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 font-black uppercase block mb-1">Standard UK/USA Models</span>
                      <h5 className="font-black text-slate-900 text-xs">Total Investment: ~₹40L – ₹80L</h5>
                    </div>
                    <span className="text-xs font-black text-slate-705">Breakeven: 4-6 years</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: FAQ */}
            <section id="faq" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">08</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">❓ Frequently Asked Questions</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Common queries regarding public universities in Italy:
              </p>

              <div className="space-y-4">
                {faqsList.map((faq, idx) => {
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
                  Want to apply to public Unis?
                </h5>
                <p className="text-white/80 text-[11px] font-semibold leading-relaxed mb-5">
                  Get absolute clarity on pre-acceptance, Universitaly summaries, and MEA apostilles.
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

export default ItalyPublic;
