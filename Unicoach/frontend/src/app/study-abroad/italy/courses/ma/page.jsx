import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, BookOpen, Clock, HelpCircle, CheckCircle2, 
  ArrowRight, Award, MapPin, Sparkles, Briefcase, Coins, ShieldCheck, FileText,
  AlertTriangle, Wallet, ChevronDown, Check, Target, Info, GraduationCap, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { useLead } from '../../../../../context/LeadContext';

const SECTIONS = [
  { id: 'why-ma', title: 'Why Study MA?' },
  { id: 'top-unis', title: 'Top MA Universities' },
  { id: 'specializations', title: 'Popular Specializations' },
  { id: 'curriculum', title: 'Curriculum & Structure' },
  { id: 'undergrad-majors', title: 'Recommended Majors' },
  { id: 'requirements', title: 'Admission Criteria' },
  { id: 'tuition-costs', title: 'Tuition Fees' },
  { id: 'living-costs', title: 'Cost of Living' },
  { id: 'scholarships', title: 'Scholarships' },
  { id: 'careers', title: 'Careers & Recruiters' },
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

const topTenMaUnis = [
  {
    rank: "#1",
    name: "University of Bologna",
    qsRank: "QS #160",
    feesEUR: 6800,
    focus: "Cultural Heritage, History, Law",
    highlights: ["Oldest university in the Western world (1088)", "World-class archive libraries and preservation labs", "Highly organized Erasmus exchange linkages"]
  },
  {
    rank: "#2",
    name: "Sapienza University of Rome",
    qsRank: "QS #171",
    feesEUR: 5800,
    focus: "Art History, Classics, Humanities",
    highlights: ["Europe's largest university by student base", "Direct partnerships with Rome's state museums", "Unrivalled research collections in classic studies"]
  },
  {
    rank: "#3",
    name: "University of Milan",
    qsRank: "QS #302",
    feesEUR: 5300,
    focus: "Economics, Political Science, Sociology",
    highlights: ["'La Statale' - member of LERU research guild", "Located in Italy's financial and commercial capital", "Strong placement linkages in social research"]
  },
  {
    rank: "#4",
    name: "Scuola Normale Superiore di Pisa",
    qsRank: "QS #204",
    feesEUR: 7800,
    focus: "Humanities, Sciences, Research",
    highlights: ["Highly selective elite university status", "Historical connection with Galileo Galilei", "Intense, fully funded research fellowships"]
  },
  {
    rank: "#5",
    name: "University of Padua",
    qsRank: "QS #243",
    feesEUR: 6300,
    focus: "Psychology, Sciences, Humanities",
    highlights: ["Established in 1222; Galileo taught here", "Leading human rights and social psychology programs", "Excellent global academic reputation"]
  },
  {
    rank: "#6",
    name: "Bocconi University",
    qsRank: "#7 Business",
    feesEUR: 13500,
    focus: "Economics, Finance, Management",
    highlights: ["Top-tier global business and economics programs", "Strong consulting and financial employer ties", "State-of-the-art urban campus in Milan"]
  },
  {
    rank: "#7",
    name: "Polimoda (Fashion School)",
    qsRank: "N/A",
    feesEUR: 11600,
    focus: "Fashion Design, Marketing, Management",
    highlights: ["Florence-based premier fashion institute", "Direct internship programs with Gucci, Prada, Ferragamo", "Industry-led courses taught by active directors"]
  },
  {
    rank: "#8",
    name: "University of Florence",
    qsRank: "QS #440",
    feesEUR: 4800,
    focus: "Art History, Architecture, Design",
    highlights: ["Located in the historic Renaissance capital", "Direct museum linkages with the Uffizi Gallery", "Excellent heritage conservation studies"]
  },
  {
    rank: "#9",
    name: "LUISS Guido Carli",
    qsRank: "QS #601-650",
    feesEUR: 12500,
    focus: "International Relations, Political Science",
    highlights: ["Boutique private campus in Rome", "Strong linkages with European diplomatic circles", "Elite corporate advisory boards for networking"]
  },
  {
    rank: "#10",
    name: "University of Turin",
    qsRank: "QS #521-530",
    feesEUR: 4800,
    focus: "Humanities, Law, Political Science",
    highlights: ["Industrial heritage background in Turin", "Rich library archives and media study courses", "Affordable regional student living setup"]
  }
];

const maSpecializations = [
  { name: "Art History", focus: "Italian Renaissance, Baroque, Modern Art", careers: "Art Historian, Museum Curator, Art Critic", topUnis: "Bologna, Florence, Sapienza", salaryEUR: { min: 21000, max: 30000 } },
  { name: "International Relations", focus: "Global Politics, Diplomacy, Conflict Resolution", careers: "Diplomat, Policy Analyst, UN Consultant", topUnis: "LUISS, Bologna, Sapienza", salaryEUR: { min: 27000, max: 44000 } },
  { name: "Fashion Studies", focus: "Design, Marketing, Management, Sustainability", careers: "Fashion Designer, Brand Manager, Retail Buyer", topUnis: "Polimoda, IED, NABA", salaryEUR: { min: 23000, max: 36000 } },
  { name: "Economics", focus: "Micro/Macroeconomics, Econometrics, Global Finance", careers: "Economic Analyst, Financial Consultant, Policy Advisor", topUnis: "Bocconi, Milan, Bologna", salaryEUR: { min: 26000, max: 39000 } },
  { name: "Cultural Heritage Management", focus: "Conservation, Museum Management, Cultural Policy", careers: "Heritage Manager, Museum Director, Policy Advisor", topUnis: "Bologna, Florence, Sapienza", salaryEUR: { min: 24000, max: 34000 } }
];

const costOfLivingBreakdown = [
  { item: "Accommodation", eur: { min: 380, max: 770 } },
  { item: "Food & Groceries", eur: { min: 190, max: 290 } },
  { item: "Public Transportation", eur: { min: 50, max: 100 } },
  { item: "Utilities", eur: { min: 50, max: 80 } },
  { item: "Leisure & Entertainment", eur: { min: 50, max: 150 } },
  { item: "Miscellaneous Expenses", eur: { min: 50, max: 100 } },
  { item: "Total Monthly Budget", eur: { min: 680, max: 1350 } }
];

const cityLivingCosts = [
  { city: "Milan (Fashion Capital)", costEUR: { min: 900, max: 1400 }, rentEUR: "€500 – €900" },
  { city: "Rome (Historic Capital)", costEUR: { min: 800, max: 1200 }, rentEUR: "€450 – €800" },
  { city: "Florence (Art Capital)", costEUR: { min: 750, max: 1100 }, rentEUR: "€400 – €750" },
  { city: "Turin (Industrial Hub)", costEUR: { min: 600, max: 900 }, rentEUR: "€300 – €600" }
];

const faqsList = [
  { q: "What is the typical duration of an MA in Italy?", a: "Most Master of Arts (MA) programs in Italy span 2 years, structured into 4 semesters. Curation, fashion management, and specialized diplomas are sometimes offered as 1-year intensive courses." },
  { q: "Is IELTS compulsory for MA programs in Italy?", a: "Not always. If your Bachelor's degree was taught entirely in English, you can obtain a Medium of Instruction (MOI) certificate from your college. However, elite design schools or competitive public universities might still request IELTS (6.0 - 6.5) or TOEFL (80+)." },
  { q: "Can I work part-time while studying an MA?", a: "Yes. International students on a Type D student visa are legally allowed to work up to 20 hours per week during academic semesters, earning average hourly wages of €8 – €12." },
  { q: "Which city is the cheapest for art students in Italy?", a: "Turin, Padua, and Perugia offer significantly lower rents (€300 - €450/month for single rooms) and living budgets compared to premium hubs like Milan or Rome." },
  { q: "What is the likelihood of getting the DSU regional scholarship?", a: "High. DSU regional scholarships are need-based, evaluated using family income dossiers (ISEE Parificato). If your family income is under the threshold (approx. €23,000 - €25,500), you have a very high probability of securing 100% tuition waivers + cash stipends." }
];

const ItalyMACourse = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [activeSection, setActiveSection] = useState('why-ma');
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
    if (minINR >= 100000) {
      return `₹${(minINR / 100000).toFixed(2)}L – ₹${(maxINR / 100000).toFixed(2)}L`;
    }
    return `₹${Math.round(minINR).toLocaleString()} – ₹${Math.round(maxINR).toLocaleString()}`;
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
          <span className="text-slate-600 font-black">MA in Italy</span>
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
            <span>Last Updated: August 9, 2024</span>
            <span className="text-indigo-300">•</span>
            <Clock size={14} className="text-indigo-650" />
            <span>17 Min Read</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            MA in Italy 2026:<br />
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Complete Guide for International Students</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto">
            Pursue a Master of Arts (MA) at the global birthplace of fine arts, fashion, and archeology in elite public universities or design academies.
          </p>
        </motion.div>

        {/* Arts Destination Card */}
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
              <span>💡 The Arts & Humanities Destination</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
              Italy isn't just pizza and pasta—it's the birthplace of the Renaissance.
            </h2>
            <p className="text-slate-350 text-sm md:text-base font-semibold leading-relaxed mb-4">
              From the University of Bologna (founded in 1088) to the fashion houses of Milan, Italy offers an unparalleled environment for Master of Arts (MA) students. Whether you're passionate about Art History, International Relations, Fashion Studies, or Cultural Heritage, Italy's unique blend of tradition and innovation makes it an ideal destination.
            </p>
            <p className="text-emerald-400 text-sm md:text-base font-extrabold leading-relaxed">
              World's oldest universities • Global leader in Fashion & Art • Affordable compared to US/UK • Rich cultural immersion
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

            {/* Section 1: Why Choose MA in Italy */}
            <section id="why-ma" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">01</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🇮🇹 Why Study MA in Italy?</h2>
              </div>
              
              {/* Advantages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">
                    🏛️
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">World-Class Programs</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    University of Bologna founded in 1088. Deep traditional roots in research.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center mb-4 font-black">
                    🎨
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">Industry Focus</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Hands-on internships in major Italian fashion, art, and automotive brands.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-black">
                    🌍
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">Cultural Experience</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Renaissance masterpieces, historic structures, and rich museum archives.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 font-black">
                    💼
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">Career Prospects</h4>
                  <p className="text-slate-505 text-xs font-semibold leading-relaxed">
                    Strong linkages with EU institutions. High global employability for graduates.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 font-black">
                    💰
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">Affordable Tuition</h4>
                  <p className="text-slate-505 text-xs font-semibold leading-relaxed">
                    Average range of ₹4L – ₹15L/year. Extensive funding and stipends.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-650 flex items-center justify-center mb-4 font-black">
                    🗣️
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">Language & Networking</h4>
                  <p className="text-slate-505 text-xs font-semibold leading-relaxed">
                    Learn Italian while studying alongside global student cohorts.
                  </p>
                </div>
              </div>

              {/* Key Highlights Table */}
              <h3 className="text-base font-black text-slate-900 mb-4">Key Highlights</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Key Metric</th>
                        <th className="p-4">Value / Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Universities Offering MA</td>
                        <td className="p-4">~50 universities</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Course Duration</td>
                        <td className="p-4">1 – 2 years</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Annual Tuition Fees</td>
                        <td className="p-4 text-indigo-650 font-bold">₹4,00,000 – ₹15,00,000</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Annual Living Cost</td>
                        <td className="p-4">₹6,00,000 – ₹12,00,000</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Average Starting Salary</td>
                        <td className="p-4 text-emerald-650 font-black">₹20,00,000 – ₹40,00,000 / year</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Academic Intakes</td>
                        <td className="p-4">Fall (Sept/Oct) & Spring (Feb/March)</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Medium of Instruction</td>
                        <td className="p-4 text-indigo-705 font-bold">English (TOEFL/IELTS required if not MOI)</td>
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
              <p className="text-slate-505 text-xs font-semibold mb-6">
                Unsure which Italian art academy or public university fits your profile? Let us guide you.
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
                            : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
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

            {/* Section 2: Top 10 MA Universities */}
            <section id="top-unis" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">02</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏛️ Top 10 MA Universities in Italy</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Detailed breakdowns of the top public universities and private creative academies offering Master of Arts tracks:
              </p>

              <div className="space-y-6 mb-8">
                {topTenMaUnis.map((uni, idx) => (
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
                        <span className="text-[10px] text-slate-455 font-bold uppercase">{uni.focus}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-655 mb-6 border-b border-slate-100 pb-4">
                      <div>
                        <strong className="text-slate-900 block mb-1">💰 Tuition Fee Estimate:</strong>
                        <span className="text-sm font-black text-slate-800">
                          {formatCost(uni.feesEUR)} / year
                        </span>
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

              {/* Comparison table */}
              <h3 className="text-base font-black text-slate-905 mb-4">Summary Table</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">University</th>
                        <th className="p-4">QS Rank</th>
                        <th className="p-4">Annual Fee (INR)</th>
                        <th className="p-4">Best For</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {topTenMaUnis.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{row.name}</td>
                          <td className="p-4 font-bold text-indigo-700">{row.qsRank}</td>
                          <td className="p-4 font-black text-emerald-650">{formatCost(row.feesEUR)}</td>
                          <td className="p-4 text-slate-655">{row.focus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3: MA Specializations */}
            <section id="specializations" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">03</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🎯 Top MA Specializations in Italy</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Key career fields, top universities, and expected salaries by specialization:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {maSpecializations.map((spec, idx) => (
                  <div key={idx} className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-md uppercase tracking-wider block w-fit mb-3">
                      Est. Salary: {formatRange(spec.salaryEUR.min, spec.salaryEUR.max)} / year
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-2">{spec.name}</h4>
                    <div className="space-y-1.5 text-xs text-slate-550 font-semibold">
                      <p>📖 <strong>Focus Topics:</strong> {spec.focus}</p>
                      <p>💼 <strong>Career Paths:</strong> {spec.careers}</p>
                      <p>🏛️ <strong>Top Unis:</strong> <span className="text-indigo-650 font-bold">{spec.topUnis}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Curriculum & Structure */}
            <section id="curriculum" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">04</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📚 Curriculum & Course Details</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                MA courses span 1 to 2 years, blending theoretical research with direct museum/studio internships:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Course structure */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
                  <h4 className="font-extrabold text-slate-905 text-sm md:text-base mb-4">Typical Program Structure</h4>
                  <ul className="space-y-3.5 text-xs font-semibold text-slate-600">
                    <li>📖 <strong>Core Courses (Foundation):</strong> Foundational historical, theoretical, or sociological methods.</li>
                    <li>📚 <strong>Electives (Specialization):</strong> Tailored modules (e.g. Contemporary Art, Curation, Urban Design).</li>
                    <li>💼 <strong>Internships (Practical):</strong> Real-world training at Gucci/Prada (Fashion) or national galleries (Art).</li>
                    <li>📝 <strong>Thesis/Project:</strong> Comprehensive research dissertation or creative project.</li>
                  </ul>
                </div>

                {/* Unique elements */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
                  <h4 className="font-extrabold text-slate-905 text-sm md:text-base mb-4">Unique Program Elements</h4>
                  <ul className="space-y-3.5 text-xs font-semibold text-slate-600">
                    <li>🏛️ <strong>Study Tours:</strong> Curated site visits to ruins, classical monuments, and design studios.</li>
                    <li>💼 <strong>Industry Workshops:</strong> Masterclasses taught by active fashion designers, curators, and policy developers.</li>
                    <li>🤝 <strong>Collaborative Projects:</strong> Joint research programs alongside regional Italian museums and municipal archives.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: Recommended Undergrad Majors */}
            <section id="undergrad-majors" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">05</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📖 Recommended Undergraduate Courses</h2>
              </div>
              <p className="text-slate-605 font-semibold leading-relaxed mb-8">
                Undergrad majors that transition smoothly into Italian MA pathways:
              </p>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-550">
                <li className="p-3 bg-slate-50 border border-slate-100 rounded-xl">🎨 <strong>MA in Art History:</strong> Bachelor's in Art History, Fine Arts, History, or Cultural Studies.</li>
                <li className="p-3 bg-slate-50 border border-slate-100 rounded-xl">🌍 <strong>MA in International Relations:</strong> Bachelor's in Political Science, History, Sociology, or Economics.</li>
                <li className="p-3 bg-slate-50 border border-slate-100 rounded-xl">👗 <strong>MA in Fashion Studies:</strong> Bachelor's in Fashion Design, Business, Marketing, or Visual Art.</li>
                <li className="p-3 bg-slate-50 border border-slate-100 rounded-xl">💰 <strong>MA in Economics:</strong> Bachelor's in Economics, Finance, Mathematics, or Statistics.</li>
                <li className="p-3 bg-slate-50 border border-slate-100 rounded-xl">🏛️ <strong>MA in Heritage Management:</strong> Bachelor's in Archaeology, Anthropology, History, or Museum Studies.</li>
                <li className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">🧠 <strong>MA in Psychology:</strong> Bachelor's in Psychology, Neuroscience, or Social Work.</li>
              </ul>
            </section>

            {/* Section 6: Admission Requirements */}
            <section id="requirements" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">06</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📋 Admission Requirements</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* General/Dossier */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
                  <h4 className="font-extrabold text-slate-905 text-sm md:text-base mb-4 flex items-center gap-2">
                    <FileText className="text-indigo-650" size={18} />
                    General Application Dossier
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-500 font-semibold">
                    <li>☐ Valid passport copy</li>
                    <li>☐ Completed application form</li>
                    <li>☐ Official Bachelor's degree & transcripts</li>
                    <li>☐ Statement of Purpose (SOP)</li>
                    <li>☐ Letters of Recommendation (LORs)</li>
                    <li>☐ Standardized test scores (GRE/GMAT - if required)</li>
                    <li>☐ Updated CV / Resume</li>
                    <li>☐ Creative Portfolio (for design & arts)</li>
                    <li>☐ Research proposal (for thesis-based MA)</li>
                  </ul>
                </div>

                {/* Scores & Visa */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                  <div>
                    <h4 className="font-extrabold text-slate-905 text-sm md:text-base mb-3 flex items-center gap-2">
                      <Globe className="text-indigo-650" size={18} />
                      Language Proficiency
                    </h4>
                    <div className="space-y-1 text-xs text-slate-500 font-semibold">
                      <p>🇬🇧 <strong>IELTS:</strong> 6.0 – 7.0 score range</p>
                      <p>🇺🇸 <strong>TOEFL:</strong> 80 – 100 score range</p>
                      <p>🇮🇹 <strong>CILS/PLIDA:</strong> B2 level (for Italian-taught courses)</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-50 pt-4">
                    <h4 className="font-extrabold text-slate-905 text-sm md:text-base mb-3 flex items-center gap-2">
                      <ShieldCheck className="text-indigo-650" size={18} />
                      Student Visa Mandates
                    </h4>
                    <div className="space-y-1 text-xs text-slate-500 font-semibold">
                      <p>✓ Acceptance letter from Italian host university</p>
                      <p>✓ Financial proof (€6,947 minimum reserve)</p>
                      <p>✓ International health insurance plan</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Cost of Studying */}
            <section id="tuition-costs" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">07</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💰 Cost of Studying MA in Italy (2026)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Average annual tuition fee structures by university type:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider block mb-1">Public Universities</span>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-3">Subsidized state-run institutions</h4>
                  <p className="text-sm font-black text-slate-800">{formatRange(1000, 4500)} / year</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <span className="text-[10px] text-rose-600 font-black uppercase tracking-wider block mb-1">Private Academies</span>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-3">Specialized fashion & design schools</h4>
                  <p className="text-sm font-black text-slate-800">{formatRange(10000, 22000)} / year</p>
                </div>
              </div>
            </section>

            {/* Section 8: Cost of Living */}
            <section id="living-costs" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">08</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💶 Cost of Living (2026)</h2>
              </div>
              <p className="text-slate-605 font-semibold leading-relaxed mb-8">
                Monthly living costs and city-wise breakdowns for MA students:
              </p>

              {/* Cost breakdown table */}
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Monthly Cost Item</th>
                        <th className="p-4">Range (EUR)</th>
                        <th className="p-4">Range (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {costOfLivingBreakdown.map((row, idx) => (
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

              {/* City wise costs table */}
              <h3 className="text-base font-black text-slate-905 mb-4">City-Wise Cost Comparison</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">City Location</th>
                        <th className="p-4">Avg Monthly Expenses (EUR)</th>
                        <th className="p-4">Avg Monthly Expenses (INR)</th>
                        <th className="p-4">Avg Rent Range (EUR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {cityLivingCosts.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-4 text-slate-900 font-bold">{row.city}</td>
                          <td className="p-4">€{row.costEUR.min} – €{row.costEUR.max}</td>
                          <td className="p-4 text-indigo-650 font-black">{formatRange(row.costEUR.min, row.costEUR.max)}</td>
                          <td className="p-4 font-bold text-slate-500">{row.rentEUR}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 9: Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">09</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏆 Scholarships</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                MA students are eligible for both regional economic-need scholarships and merit-based institutional grants.
              </p>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                <h4 className="font-extrabold text-slate-905 text-sm md:text-base mb-6 flex items-center gap-2">
                  <Sparkles className="text-indigo-650" size={18} />
                  Top Curation and Art Scholarships
                </h4>

                <div className="space-y-4 text-xs font-semibold text-slate-550 leading-relaxed">
                  <p>✓ <strong>DSU Regional Grants:</strong> Covers 100% of public tuition fees, provides free canteen card tokens, and drops up to €7,200 annual stipend directly to eligible candidates based on ISEE Parificato economic check.</p>
                  <p>✓ <strong>MAECI Ministry Grants:</strong> Government-supported monthly stipend of €900 + health insurance for elite candidates.</p>
                  <p>✓ <strong>Academy Merit Waivers:</strong> Design schools like Polimoda, IED, and NABA offer 20% to 50% tuition waiver awards based on portfolio evaluations.</p>
                </div>
              </div>
            </section>

            {/* Section 10: Jobs & Career Prospects */}
            <section id="careers" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">10</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💼 Jobs & Career Prospects</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Average starting salary ranges for MA graduates reside between €20,000 and €40,000 (~₹20.6L - ₹41.2L per year), depending on the sector and city.
              </p>

              {/* Recruiters card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-4 flex items-center gap-2">
                  <Briefcase size={18} className="text-indigo-655" />
                  Top Recruiting Partners
                </h4>
                <div className="flex flex-wrap gap-2 pt-2">
                  {["Gucci", "Prada Group", "UniCredit Bank", "Leonardo Aerospace", "Ferrero", "Giorgio Armani", "United Nations Agencies", "UNESCO Regional Centers"].map((rec, rIdx) => (
                    <span key={rIdx} className="bg-indigo-50 text-indigo-805 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-100/50">
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 11: FAQ */}
            <section id="faq" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">11</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">❓ Frequently Asked Questions</h2>
              </div>
              <p className="text-slate-605 font-semibold leading-relaxed mb-8">
                Common queries regarding Master of Arts (MA) courses in Italy:
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
                            <div className="px-5 pb-5 pt-1 text-slate-505 text-xs md:text-sm font-semibold leading-relaxed border-t border-slate-55">
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
                  Planning an MA in Italy?
                </h5>
                <p className="text-white/80 text-[11px] font-semibold leading-relaxed mb-5">
                  Get absolute clarity on art academy admissions, portfolio reviews, and regional scholarships.
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

export default ItalyMACourse;
