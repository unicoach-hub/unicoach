import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, BookOpen, Clock, HelpCircle, CheckCircle2, 
  ArrowRight, Award, MapPin, Sparkles, Briefcase, Coins, ShieldCheck, FileText,
  AlertTriangle, Wallet, ChevronDown, Check, Target, GraduationCap, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { useLead } from '../../../../../context/LeadContext';

const SECTIONS = [
  { id: 'why-mba', title: 'Why Choose an MBA?' },
  { id: 'top-unis', title: 'Top MBA Universities' },
  { id: 'specializations', title: 'MBA Specializations' },
  { id: 'requirements', title: 'Admission Criteria' },
  { id: 'process', title: 'Application Process' },
  { id: 'costs', title: 'Cost of MBA' },
  { id: 'scholarships', title: 'Scholarships' },
  { id: 'roi', title: 'ROI & Salaries' },
  { id: 'comparison', title: 'Global Comparison' },
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

const topMbaColleges = [
  { 
    rank: "#1",
    name: "SDA Bocconi School of Management", 
    qsRank: "QS #11", 
    feesEUR: { min: 1700, max: 2400 }, 
    deadline: "April 15",
    focus: "Finance, Consulting, Luxury",
    highlights: ["Italy's top MBA - globally ranked", "Close ties with elite fashion houses and consulting firms", "Double degree exchange programs available"]
  },
  { 
    rank: "#2",
    name: "ESCP Europe Business School", 
    qsRank: "QS #21-50", 
    feesEUR: { min: 21500, max: 21500 }, 
    deadline: "March 14 / April 3 / April 18 / May 5",
    focus: "International Business, Strategy",
    highlights: ["Pan-European campuses for multi-country experience", "Excellent career network across major EU capitals", "96% employment rate within 3 months"]
  },
  { 
    rank: "#3",
    name: "Politecnico di Milano (MIP)", 
    qsRank: "QS #111", 
    feesEUR: { min: 170, max: 4000 }, 
    deadline: "May 15",
    focus: "Industrial Management, Business Analytics",
    highlights: ["Most affordable top-tier public MBA option", "Strong engineering and data analytics integration", "Close partnerships with technology leaders"]
  },
  { 
    rank: "#4",
    name: "LUISS Guido Carli", 
    qsRank: "QS #82", 
    feesEUR: { min: 26000, max: 26000 }, 
    deadline: "April 30",
    focus: "Luxury Management, Finance",
    highlights: ["Rome-based boutique corporate network", "Specialized Luxury and Fashion retail partnerships", "Excellent alumni base in consulting"]
  },
  { 
    rank: "#5",
    name: "MIB Trieste School of Management", 
    qsRank: "QS #151", 
    feesEUR: { min: 25000, max: 25000 }, 
    deadline: "August 6",
    focus: "International Business, Marketing",
    highlights: ["AMBA accredited programs", "Highly international student group", "Guaranteed corporate internships"]
  },
  { 
    rank: "#6",
    name: "University of Pisa", 
    qsRank: "QS #382", 
    feesEUR: { min: 2500, max: 2500 }, 
    deadline: "February 28",
    focus: "General Management",
    highlights: ["Subsidized public university fees", "Historic academic heritage", "Generalist business focus"]
  },
  { 
    rank: "#7",
    name: "University of Siena (Economics & Mgmt)", 
    qsRank: "QS #691-700", 
    feesEUR: { min: 1000, max: 3000 }, 
    deadline: "May 6",
    focus: "Economics, Business",
    highlights: ["Affordable living costs in Siena", "Strong theoretical foundation in economics", "Friendly student ecosystem"]
  },
  { 
    rank: "#8",
    name: "I.P.E. Business School", 
    qsRank: "QS #101", 
    feesEUR: { min: 82300, max: 82300 }, 
    deadline: "September 1",
    focus: "Executive Education",
    highlights: ["Corporate executive-focused curriculum", "Excellent regional Italian placements", "Strong industrial linkages"]
  }
];

const specializationsList = [
  { name: "Finance", topUnis: "SDA Bocconi, LUISS", careers: "Investment Banking, Corporate Finance" },
  { name: "Luxury Management", topUnis: "SDA Bocconi, LUISS, Polimi", careers: "Brand Management, Retail Planning" },
  { name: "Consulting & Strategy", topUnis: "SDA Bocconi, ESCP", careers: "Management Consultant, Strategy Director" },
  { name: "Business Analytics", topUnis: "Polimi, LUISS", careers: "Data Analyst, Business Intelligence" },
  { name: "Entrepreneurship", topUnis: "SDA Bocconi, LUISS", careers: "Startup Founder, Venture Capitalist" },
  { name: "Marketing", topUnis: "SDA Bocconi, MIB Trieste", careers: "Brand Manager, Digital Marketer" }
];

const annualCostsList = [
  { cat: "Tuition (Public)", eur: { min: 170, max: 5000 } },
  { cat: "Tuition (Private)", eur: { min: 20000, max: 40000 } },
  { cat: "Accommodation", eur: { min: 3000, max: 10000 } },
  { cat: "Food", eur: { min: 3000, max: 4300 } },
  { cat: "Health Insurance", eur: { min: 700, max: 700 } },
  { cat: "Transport/Leisure", eur: { min: 2400, max: 4300 } },
  { cat: "Residence Permit", eur: { min: 100, max: 100 } }
];

const scholarshipsList = [
  { name: "Italian Government (MAECI)", body: "Ministry of Foreign Affairs", amountEUR: 9000, desc: "Covers tuition + living expenses + health insurance" },
  { name: "International Talents @Unibo", body: "University of Bologna", amountEUR: 4200, desc: "Tuition waiver + cash stipend for top international students" },
  { name: "Excellence Scholarships", body: "University of Milan", amountEUR: 8000, desc: "Tuition waiver + living support" },
  { name: "Padua International Excellence", body: "University of Padua", amountEUR: 8000, desc: "Covers tuition fees and monthly living budget" }
];

const salariesList = [
  { sector: "Finance & Banking", eur: { min: 40000, max: 50000 } },
  { sector: "Luxury & Fashion", eur: { min: 35000, max: 45005 } },
  { sector: "Consulting", eur: { min: 40000, max: 50000 } },
  { sector: "Technology", eur: { min: 38000, max: 48000 } },
  { sector: "Automotive", eur: { min: 35000, max: 45000 } }
];

const globalComparisonList = [
  { country: "Italy", feeEUR: { min: 20000, max: 40000 }, duration: "12 months", recovery: "2 – 3 years" },
  { country: "USA", feeEUR: { min: 55000, max: 92000 }, duration: "18-24 months", recovery: "4 – 6 years" },
  { country: "UK", feeEUR: { min: 35000, max: 138000 }, duration: "12-15 months", recovery: "3 – 5 years" },
  { country: "Germany", feeEUR: { min: 80000, max: 90000 }, duration: "12-18 months", recovery: "3 – 4 years" }
];

const faqsList = [
  { q: "Is Italy good for an MBA?", a: "Yes, Italy hosts triple-accredited elite schools like SDA Bocconi (#11 globally) and Politecnico di Milano. It offers competitive global salaries, particularly in finance, strategy, and luxury management, at a fraction of US or UK costs." },
  { q: "How much does an MBA cost in Italy?", a: "Public MBA programs can range from €170 to €5,000/year (~₹16,000 - ₹5.1 Lakhs). Private top-tier business schools range from €20,000 to €40,000/year (~₹20.6L - ₹41.2L)." },
  { q: "Can I get permanent residency (PR) after an MBA in Italy?", a: "Yes. Graduates receive a 12-month post-study stay-back permit. Once you find a job, your permit can be converted to an EU Blue Card or a standard work permit, paving the path to permanent residency." },
  { q: "What is the average salary after an MBA in Italy?", a: "The average post-MBA salary is around €30,000 – €50,000 (~₹28L - ₹47 Lakhs/year) for mid-level professionals. Senior managers and consultants in fashion/finance can exceed €60,000 - €80,000." },
  { q: "Is GMAT/GRE mandatory for MBA admissions in Italy?", a: "For elite private schools like Bocconi, a GMAT (600+) or GRE (310+) is highly recommended. Some public universities and schools offer test waivers based on relevant professional work experience." }
];

const ItalyMBACourse = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [activeSection, setActiveSection] = useState('why-mba');
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
      return `₹${(minINR / 100000).toFixed(2)}L – ₹${(maxINR / 100050 / 100000 * 100000).toFixed(2)}L`;
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
          <span className="text-slate-600 font-black">MBA in Italy</span>
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
            <span>Last Updated: December 3, 2025</span>
            <span className="text-indigo-300">•</span>
            <Clock size={14} className="text-indigo-650" />
            <span>9 Min Read</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            MBA in Italy 2026:<br />
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Complete Guide for International Students</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto">
            Scale your global business career in elite institutions like SDA Bocconi at a fraction of USA/UK program expenses.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl mx-auto">
            {[
              { val: "12 Months", label: "Average Duration" },
              { val: "₹47 Lakhs/yr", label: "Post-MBA Avg Salary" },
              { val: "EU Blue Card", label: "Work Mobility" },
              { val: "Triple Crown", label: "Elite Accreditation" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-xs backdrop-blur-md">
                <p className="text-xl font-black text-indigo-655">{stat.val}</p>
                <p className="text-[10px] text-slate-505 font-extrabold mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Opportunity Card */}
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
              <span>💡 The MBA Opportunity You've Been Missing</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
              Over 93,000 international students chose Italy in 2023—including 6,100 from India.
            </h2>
            <p className="text-slate-350 text-sm md:text-base font-semibold leading-relaxed mb-4">
              Italy isn't just about pasta and fashion. It's home to SDA Bocconi, ranked #11 globally for MBA programs. It offers affordable tuition, world-class education, and a direct path to Europe's most prestigious business sectors—finance, luxury management, and consulting.
            </p>
            <p className="text-emerald-400 text-sm md:text-base font-extrabold leading-relaxed">
              Globally ranked programs at half the US/UK cost • Average salary of ₹47 Lakhs/year post-MBA • EU Blue Card access = work across Europe • 12-month post-study work permit
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

            {/* Section 1: Why Choose an MBA in Italy */}
            <section id="why-mba" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">01</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🇮🇹 Why Choose an MBA in Italy?</h2>
              </div>
              
              {/* Advantages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-605 flex items-center justify-center mb-4 font-black">
                    💰
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">Affordable Tuition</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Public programs range from ₹0 to ₹4.7L/yr, while elite private options range ₹19L to ₹38L.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center mb-4 font-black">
                    🏆
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">World-Class Ranks</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    SDA Bocconi ranks #11 globally for its MBA. Internationally recognized credentials.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-black">
                    🌍
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">Global Exposure</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Study alongside 93,000+ international students in major European business sectors.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 font-black">
                    💼
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">High ROI</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Avg salary ₹47 Lakhs/yr. Expected salary bump of 22% - 40% over Bachelor's.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 font-black">
                    ✈️
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">Strategic Location</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Direct access to Europe's premium business and commercial hubs.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-650 flex items-center justify-center mb-4 font-black">
                    📈
                  </div>
                  <h4 className="font-extrabold text-slate-905 text-sm mb-2">EU Blue Card</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Convert your post-study visa to a Blue Card to work across 27 EU nations.
                  </p>
                </div>
              </div>

              {/* Quick Facts Table */}
              <h3 className="text-base font-black text-slate-900 mb-4">Quick Facts</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Metric Parameter</th>
                        <th className="p-4">Key Statistics / Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">MBA Graduates (Global)</td>
                        <td className="p-4">250,000+ annually</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">International Students in Italy</td>
                        <td className="p-4 text-indigo-650 font-bold">93,000+ (2023 data)</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Indian Students</td>
                        <td className="p-4">6,100+</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">English-Taught Programs</td>
                        <td className="p-4 text-emerald-650 font-black">500+ programs</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Post-MBA Avg Salary</td>
                        <td className="p-4 font-black">₹47 Lakhs / year</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Average Salary Bump</td>
                        <td className="p-4 text-indigo-700">22-40% over Bachelor's degrees</td>
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
                Not sure which business school fits your GMAT score and budget? Let us help you.
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

            {/* Section 2: Top MBA Universities */}
            <section id="top-unis" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">02</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏛️ Top MBA Universities in Italy (2026)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Detailed breakdowns of the top business schools and public universities offering MBA tracks:
              </p>

              <div className="space-y-6 mb-8">
                {topMbaColleges.map((uni, idx) => (
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
                        <strong className="text-slate-900 block mb-1">💰 Tuition Fees:</strong>
                        <span className="text-sm font-black text-slate-800">
                          {formatRange(uni.feesEUR.min, uni.feesEUR.max)} / year
                        </span>
                      </div>
                      <div>
                        <strong className="text-slate-900 block mb-1">📅 Application Deadline:</strong>
                        <span className="text-slate-500 font-medium block">{uni.deadline}</span>
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

              {/* Comparison Table */}
              <h3 className="text-base font-black text-slate-900 mb-4 mt-8">MBA Universities Summary Table</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">University</th>
                        <th className="p-4">QS Rank</th>
                        <th className="p-4">Annual Fee (EUR)</th>
                        <th className="p-4">Annual Fee (INR)</th>
                        <th className="p-4">2026 Deadline</th>
                        <th className="p-4">Best For</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {topMbaColleges.map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{uni.name}</td>
                          <td className="p-4 font-bold text-indigo-700">{uni.qsRank}</td>
                          <td className="p-4">€{uni.feesEUR.min.toLocaleString()} – €{uni.feesEUR.max.toLocaleString()}</td>
                          <td className="p-4">{formatRange(uni.feesEUR.min, uni.feesEUR.max)}</td>
                          <td className="p-4 text-indigo-650 font-bold">{uni.deadline.split(' / ')[0]}</td>
                          <td className="p-4 text-slate-600">{uni.focus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-3 italic">
                * Note: SDA Bocconi average annual tuition listed reflects highly subsidized public-equivalent program options or specific scholarships. Full-time international MBA base fees may vary up to €65,000.
              </p>
            </section>

            {/* Section 3: MBA Specializations */}
            <section id="specializations" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">03</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🎯 MBA Specializations (2026)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Over 90% of MBA graduates in Italy record massive career trajectory upgrades. Key specializations:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {specializationsList.map((spec, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <h4 className="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-750 font-black text-xs flex items-center justify-center">{idx + 1}</span>
                      {spec.name}
                    </h4>
                    <div className="space-y-1.5 text-xs text-slate-550 font-semibold">
                      <p>🏛️ <strong>Top Unis:</strong> {spec.topUnis}</p>
                      <p>💼 <strong>Outcomes:</strong> <span className="text-indigo-650 font-bold">{spec.careers}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Admission Requirements */}
            <section id="requirements" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">04</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📋 Admission Requirements</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Score requirements */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
                  <h4 className="font-extrabold text-slate-905 text-sm md:text-base mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-indigo-650" size={18} />
                    Academic Score Requirements
                  </h4>
                  <div className="space-y-2.5 text-xs font-semibold text-slate-655">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>GPA Target</span>
                      <span className="text-slate-900 font-black">3.25+ (on 4.0 scale)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>GMAT Range</span>
                      <span className="text-slate-900 font-black">600 – 700</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>GRE Range</span>
                      <span className="text-slate-900 font-black">310 – 320</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>IELTS Target</span>
                      <span className="text-slate-905 font-black">6.5 – 7.0</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>TOEFL Target</span>
                      <span className="text-slate-905 font-black">90 – 100</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span>PTE Range</span>
                      <span className="text-slate-905 font-black">40 – 55</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CILS (Italian - if required)</span>
                      <span className="text-slate-905 font-black">Score 55</span>
                    </div>
                  </div>
                </div>

                {/* Documents dossier */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
                  <h4 className="font-extrabold text-slate-905 text-sm md:text-base mb-4 flex items-center gap-2">
                    <FileText className="text-indigo-650" size={18} />
                    Required Documents Dossier
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-500 font-semibold">
                    <li>☐ Completed MBA application form</li>
                    <li>☐ Transcripts of Bachelor's degree</li>
                    <li>☐ English test scores (IELTS/TOEFL/PTE)</li>
                    <li>☐ Italian CILS score (if applying for Italian-track)</li>
                    <li>☐ GMAT or GRE scorecards</li>
                    <li>☐ 2-3 Letters of Recommendation (LORs)</li>
                    <li>☐ Statement of Purpose (SOP)</li>
                    <li>☐ Updated executive CV/Resume</li>
                    <li>☐ Portfolio (for Art/Design/Fashion MBAs)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: Application Process */}
            <section id="process" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">05</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📝 Application Process (Step-by-Step)</h2>
              </div>
              
              <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pointer-events-none">
                {[
                  { step: "Step 1: Research & Select", desc: "Shortlist universities according to budget and specializations. Verify criteria and document timelines." },
                  { step: "Step 2: Prepare Documents", desc: "Draft your CV and SOP. Obtain transcripts, schedule tests (GMAT/GRE/IELTS), and request LORs from academic or professional sponsors." },
                  { step: "Step 3: Submit Application", desc: "Complete official university portal application forms, pay processing fees, and upload documents before deadlines." },
                  { step: "Step 4: Interview & Decision", desc: "Attend Skype/Zoom interview rounds if requested, retrieve conditional offer, and pay enrollment deposits." },
                  { step: "Step 5: Visa Application", desc: "Organize visa documents, secure a €6,947 bank reserve, book appointments, and apply at VFS Global." }
                ].map((item, idx) => (
                  <div key={idx} className="relative pl-12 flex gap-4">
                    <span className="absolute left-3 w-6.5 h-6.5 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center border-4 border-white shadow-xs">{idx + 1}</span>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs w-full">
                      <h4 className="font-extrabold text-slate-900 text-sm mb-1">{item.step}</h4>
                      <p className="text-xs font-semibold text-slate-500 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6: Cost of MBA in Italy */}
            <section id="costs" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">06</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💰 Cost of MBA in Italy (2026)</h2>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <h4 className="font-extrabold text-slate-905 text-sm md:text-base mb-6 flex items-center gap-2">
                  <Wallet className="text-indigo-650" size={18} />
                  Annual Cost Estimates Breakdown
                </h4>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-baseline gap-2">
                    <div>
                      <strong className="text-xs text-slate-900 block">Public University Tuition</strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Highly subsidized</span>
                    </div>
                    <span className="text-xs font-black text-slate-705">{formatRange(170, 5000)} / year</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-baseline gap-2">
                    <div>
                      <strong className="text-xs text-slate-900 block">Private University Tuition</strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Top-tier corporate connections</span>
                    </div>
                    <span className="text-xs font-black text-slate-705">{formatRange(20000, 40000)} / year</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-baseline gap-2">
                    <div>
                      <strong className="text-xs text-slate-905 block font-black">Estimated Annual Living Budget</strong>
                      <span className="text-[10px] text-slate-450 font-bold uppercase mt-1">Accommodation, food, transit & insurance</span>
                    </div>
                    <span className="text-xs font-black text-indigo-705">{formatRange(9200, 19400)} / year</span>
                  </div>
                </div>
              </div>

              {/* Summary table */}
              <h3 className="text-base font-black text-slate-905 mb-4">Cost Summary Table</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Expense Category</th>
                        <th className="p-4">Annual Cost (EUR)</th>
                        <th className="p-4">Annual Cost (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {annualCostsList.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-4 text-slate-900 font-bold">{row.cat}</td>
                          <td className="p-4">€{row.eur.min.toLocaleString()} – €{row.eur.max.toLocaleString()}</td>
                          <td className="p-4 text-indigo-650 font-black">{formatRange(row.eur.min, row.eur.max)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 7: Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">07</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏆 Top Scholarships for MBA in Italy</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Italy offers multiple dedicated scholarships targeting talented Indian MBA applicants:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {scholarshipsList.map((sch, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-md uppercase tracking-wider block w-fit mb-3">
                      Value: {formatCost(sch.amountEUR)}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-2">{sch.name}</h4>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-1"><strong>Offering Body:</strong> {sch.body}</p>
                    <p className="text-[11px] text-indigo-700 font-semibold leading-normal">{sch.desc}</p>
                  </div>
                ))}
              </div>

              {/* Summary table */}
              <h3 className="text-base font-black text-slate-905 mb-4">Scholarship Summary</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Scholarship</th>
                        <th className="p-4">Offering Body</th>
                        <th className="p-4">Amount (EUR)</th>
                        <th className="p-4">Amount (INR)</th>
                        <th className="p-4">Coverage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {scholarshipsList.map((sch, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{sch.name}</td>
                          <td className="p-4 text-slate-500">{sch.body}</td>
                          <td className="p-4">€{sch.amountEUR.toLocaleString()}</td>
                          <td className="p-4 text-indigo-650 font-bold">~{formatCost(sch.amountEUR)}</td>
                          <td className="p-4 text-slate-655 text-xs">{sch.desc.split(' + ')[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 8: ROI & Career Prospects */}
            <section id="roi" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">08</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📊 ROI & Career Prospects</h2>
              </div>
              <p className="text-slate-605 font-semibold leading-relaxed mb-8">
                Expected recovery times and post-graduate placements in Italy's major industrial networks:
              </p>

              {/* Recover times info card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-6 flex items-center gap-2">
                  <Clock size={18} className="text-indigo-650" />
                  Estimated Time to Recover MBA Investment Costs
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <span className="text-xs text-emerald-950 font-extrabold">🇮🇹 Italy (12-month programs)</span>
                    <span className="text-xs font-black text-emerald-700">2 – 3 years (Fast recovery!)</span>
                  </div>
                  <div className="flex justify-between items-center bg-rose-50 border border-rose-100 p-4 rounded-xl">
                    <span className="text-xs text-rose-950 font-extrabold">🇺🇸 United States (2-year track)</span>
                    <span className="text-xs font-black text-rose-700">4 – 6 years</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-xs text-slate-950 font-semibold">🇬🇧 United Kingdom</span>
                    <span className="text-xs font-black text-slate-700">3 – 5 years</span>
                  </div>
                </div>
              </div>

              {/* Sector salaries table */}
              <h3 className="text-base font-black text-slate-905 mb-4">Salary by Sector</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Business Industry Sector</th>
                        <th className="p-4">Average Salary (EUR)</th>
                        <th className="p-4">Average Salary (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {salariesList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{row.sector}</td>
                          <td className="p-4">€{row.eur.min.toLocaleString()} – €{row.eur.max.toLocaleString()} / year</td>
                          <td className="p-4 text-emerald-650 font-black">{formatRange(row.eur.min, row.eur.max)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 9: MBA Comparison: Italy vs USA/UK/Germany */}
            <section id="comparison" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">09</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🌍 MBA Comparison: Italy vs USA/UK/Germany</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                How Italy compares with other prominent MBA locations in terms of fees, duration, and stay-back permit terms:
              </p>

              {/* Comparison table */}
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase">
                        <th className="p-4">Country</th>
                        <th className="p-4">Annual MBA Fee (EUR)</th>
                        <th className="p-4">Annual MBA Fee (INR)</th>
                        <th className="p-4">Program Duration</th>
                        <th className="p-4">Avg recovery time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {globalComparisonList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-900 font-bold">{row.country}</td>
                          <td className="p-4">€{row.feeEUR.min.toLocaleString()} – €{row.feeEUR.max.toLocaleString()}</td>
                          <td className="p-4 text-indigo-650 font-black">{formatRange(row.feeEUR.min, row.feeEUR.max)}</td>
                          <td className="p-4">{row.duration}</td>
                          <td className="p-4 font-bold text-slate-600">{row.recovery}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Why Italy stands out */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-6 flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-650" />
                  Why Italy Stands Out
                </h4>
                <div className="space-y-4 text-xs font-semibold text-slate-655 leading-relaxed">
                  <p>✓ <strong>Lowest Cost structure:</strong> Elite private schools cost half of standard USA or UK counterparts, with public options being nearly free.</p>
                  <p>✓ <strong>Duration Advantage:</strong> Full 12-month program formats mean you enter the workforce a full year ahead of standard 2-year US MBA tracks.</p>
                  <p>✓ <strong>European Blue Card:</strong> Stay-back permits enable quick conversions to work cards, opening employment pathways across all 27 EU nations.</p>
                </div>
              </div>
            </section>

            {/* Section 10: FAQ */}
            <section id="faq" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">10</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">❓ Frequently Asked Questions</h2>
              </div>
              <p className="text-slate-605 font-semibold leading-relaxed mb-8">
                Common queries regarding MBA programs in Italy:
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
                  Planning an MBA in Italy?
                </h5>
                <p className="text-white/80 text-[11px] font-semibold leading-relaxed mb-5">
                  Get absolute clarity on business school admissions, GMAT cuts, and regional sponsorships.
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

export default ItalyMBACourse;
