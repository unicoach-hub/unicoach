import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, MapPin, Building, BookOpen, Clock, Globe,
  CheckCircle2, ArrowRight, Search, Sparkles, Coins, HelpCircle, ArrowUpDown,
  GraduationCap, AlertTriangle, Wallet, ShieldCheck, FileText, ChevronDown, Check,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import ShortlistWizardWidget from '../../../../../components/ShortlistWizardWidget';
import { useLead } from '../../../../../context/LeadContext';

const SECTIONS = [
  { id: 'why-italy', title: 'Why Study in Italy?' },
  { id: 'top-unis', title: 'Top 6 Universities' },
  { id: 'popular-courses', title: 'Popular Courses' },
  { id: 'scholarships', title: 'Scholarships' },
  { id: 'living-costs', title: 'Cost of Living' },
  { id: 'visa-process', title: 'Visa Process' },
  { id: 'intakes', title: 'Intakes 2026-2027' },
  { id: 'jobs', title: 'Job Opportunities' },
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

const topUnisList = [
  {
    name: "Politecnico di Milano",
    qsRank: "#98",
    logo: "https://logo.clearbit.com/polimi.it",
    city: "Milan",
    tagline: "First Italian University to Enter Global Top 100",
    students: "48,000+ (8,800+ international)",
    highlights: ["#7 Architecture worldwide", "#6 Art & Design worldwide", "#12 Mechanical Engineering"],
    tuitionEUR: { min: 900, max: 3800 },
    employerRep: "90.1/100",
    uniqueProgram: "Master of Science in Food Design",
    courses: [
      { name: "Aerospace Engineering", duration: "2-3 years", focus: "Design, propulsion, systems" },
      { name: "Industrial Engineering", duration: "2-3 years", focus: "Manufacturing, automation" },
      { name: "Architecture", duration: "3-5 years", focus: "Urban design, sustainable building" },
      { name: "Art & Design", duration: "2-3 years", focus: "Product, visual, interior design" }
    ],
    bachelorsReq: "High school diploma; IELTS 6.0 / TOEFL 78",
    mastersReq: "Bachelor's degree; IELTS 6.0 / TOEFL 78",
    scholarships: ["Merit-based scholarships", "Regional DSU grants", "International student awards"],
    notableAlumni: "Giuseppe Di Franco (Director of Lutech Group)"
  },
  {
    name: "Sapienza University of Rome",
    qsRank: "#128",
    logo: "https://logo.clearbit.com/uniroma1.it",
    city: "Rome",
    tagline: "Europe's Largest University by Enrollment",
    students: "115,000+ (1,956+ from 87 countries)",
    highlights: ["#14 Arts & Humanities", "#1 History of Art globally", "Elite Research Medical School"],
    tuitionEUR: { min: 1000, max: 3000 },
    employerRep: "82.5/100",
    uniqueProgram: "Classics and Ancient History",
    courses: [
      { name: "History of Art", duration: "2-3 years", focus: "Renaissance, Baroque, Modern Art" },
      { name: "Aerospace Engineering", duration: "2-3 years", focus: "Satellite design, aerodynamics" },
      { name: "Civil Engineering", duration: "3-5 years", focus: "Infrastructure, urban planning" },
      { name: "Economics", duration: "2-3 years", focus: "Finance, policy, development" }
    ],
    bachelorsReq: "High school diploma; IELTS 5.5 / TOEFL 80; SAT 960",
    mastersReq: "Bachelor's degree; IELTS 5.5 / TOEFL 80",
    scholarships: ["LazioDiSCo Regional Grants", "Sapienza International Welcome Awards"],
    notableAlumni: "Serge Haroche (2012 Nobel Prize in Physics)"
  },
  {
    name: "University of Bologna",
    qsRank: "#138",
    logo: "https://logo.clearbit.com/unibo.it",
    city: "Bologna",
    tagline: "Oldest University in the Western World",
    students: "85,000+ (6,502+ international)",
    highlights: ["Founded in 1088", "#38 Law globally", "Top 50 for Quality Education (UN SDG)"],
    tuitionEUR: { min: 2000, max: 3900 },
    employerRep: "87.9/100",
    uniqueProgram: "Advanced Automotive Engineering",
    courses: [
      { name: "Law", duration: "3-5 years", focus: "International, European, Corporate" },
      { name: "Medicine", duration: "6 years", focus: "Clinical research, surgery" },
      { name: "Art History", duration: "2-3 years", focus: "Renaissance, restoration, curation" },
      { name: "Agriculture", duration: "2-3 years", focus: "Sustainable farming, food science" }
    ],
    bachelorsReq: "High school diploma; IELTS 5.5-6.5 / TOEFL 80-99",
    mastersReq: "Bachelor's degree; IELTS 5.5-6.5 / TOEFL 80-99",
    scholarships: ["International Talents @Unibo (80 grants)", "ER.GO Regional Scholarships"],
    notableAlumni: "Giulia Bosi (Law graduate)"
  },
  {
    name: "University of Padua",
    qsRank: "#233",
    logo: "https://logo.clearbit.com/unipd.it",
    city: "Padua",
    tagline: "Elite Research in Medicine & Sciences",
    students: "65,000+ (4,103+ international)",
    highlights: ["Founded in 1222", "#8 in Europe", "Elite Science and Space research labs"],
    tuitionEUR: { min: 1000, max: 2600 },
    employerRep: "81.4/100",
    uniqueProgram: "Galilean School of Higher Education",
    courses: [
      { name: "Biology", duration: "3 years", focus: "Molecular, environmental, marine" },
      { name: "Chemistry", duration: "3 years", focus: "Organic, inorganic, pharmaceutical" },
      { name: "Law", duration: "5 years", focus: "International, corporate, criminal" },
      { name: "Data Science", duration: "2 years", focus: "Business analytics, AI, machine learning" }
    ],
    bachelorsReq: "High school diploma; IELTS 6.0 / TOEFL 80",
    mastersReq: "Bachelor's degree; IELTS 6.0 / TOEFL 80",
    scholarships: ["Padua International Excellence (€8,000)", "ESU Regional Scholarships"],
    notableAlumni: "Federica Bevilacqua (Pharmacy graduate)"
  },
  {
    name: "University of Milan",
    qsRank: "#276",
    logo: "https://logo.clearbit.com/unimi.it",
    city: "Milan",
    tagline: "'La Statale' - Top Research University",
    students: "60,000+ (3,200+ international)",
    highlights: ["Founded in 1924", "#276 QS 2026", "83 Graduate + 111 Postgraduate programs"],
    tuitionEUR: { min: 150, max: 1100 },
    employerRep: "84.2/100",
    uniqueProgram: "Humanities & Cultural Heritage",
    courses: [
      { name: "Political Science", duration: "3 years", focus: "International relations, policy" },
      { name: "Sociology", duration: "3 years", focus: "Social research, demographics" },
      { name: "Medicine", duration: "6 years", focus: "Clinical research, healthcare" }
    ],
    bachelorsReq: "High school diploma; IELTS 5.5-6.5 / TOEFL 72-94",
    mastersReq: "Bachelor's degree; IELTS 5.5-6.5 / TOEFL 72-94",
    scholarships: ["Excellence Scholarships Program (55 awards of €8,000)", "DSU Lombardia Grants"],
    notableAlumni: "Giuseppe Levi (Anatomist and Professor)"
  },
  {
    name: "University of Pisa",
    qsRank: "#343",
    logo: "https://logo.clearbit.com/unipi.it",
    city: "Pisa",
    tagline: "Best Global Position in a Decade",
    students: "50,000+ (2,500+ international)",
    highlights: ["Founded in 1343", "#142 in Europe", "Physics and Mathematics Excellence"],
    tuitionEUR: { min: 850, max: 2100 },
    employerRep: "79.8/100",
    uniqueProgram: "Theoretical Physics & Computing",
    courses: [
      { name: "Physics", duration: "3 years", focus: "Theoretical, quantum, astrophysics" },
      { name: "Mathematics", duration: "3 years", focus: "Pure, applied, statistics" },
      { name: "Civil Engineering", duration: "3 years", focus: "Structural, geotechnical, transport" },
      { name: "Computer Science", duration: "2 years", focus: "AI, cybersecurity, data sciences" }
    ],
    bachelorsReq: "High school diploma; IELTS 6.5 / TOEFL iBT 80",
    mastersReq: "Bachelor's degree; IELTS 6.5 / TOEFL iBT 80",
    scholarships: ["DSU Toscana Scholarship", "Galileo Galilei Merit Grants"],
    notableAlumni: "Galileo Galilei (Physicist and Astronomer)"
  }
];

const popularMasters = [
  { course: "MSc in Architecture & Landscape Design", uni: "Politecnico di Milano", feeEUR: 3880 },
  { course: "Master in Business Administration (MBA)", uni: "Polimi Graduate School of Management", feeEUR: 33000 },
  { course: "MSc in Management - Fashion & Luxury Goods", uni: "LUISS Business School", feeEUR: 15500 },
  { course: "MSc in Data Science for Business", uni: "University of Padua", feeEUR: 2330 },
  { course: "MA in Art History", uni: "Sapienza University of Rome", feeEUR: 2420 }
];

const popularFields = [
  { field: "Fine Arts", enrollment: "5,356+", topUnis: "Sapienza, Bologna" },
  { field: "Medicine", enrollment: "Top 100 globally", topUnis: "Milan, Bologna, Padua" },
  { field: "Engineering", enrollment: "Top 50 globally", topUnis: "Politecnico Milano, Pisa" },
  { field: "Architecture", enrollment: "#7 globally", topUnis: "Politecnico Milano, Florence" },
  { field: "Law", enrollment: "#38 globally", topUnis: "Bologna, Rome" }
];

const scholarshipsList = [
  {
    name: "Italian Government Scholarship (MAECI)",
    amount: "Up to €9,000 / year (approx. ₹8.1 Lakhs)",
    coverage: "Covers tuition + accommodation + health insurance",
    details: "Paid in 3 instalments. Open for Master's and PhD students. Requires IELTS 5.5-6.5 / TOEFL 80-99."
  },
  {
    name: "International Talents @Unibo",
    amount: "€4,500 stipend + full tuition waiver",
    coverage: "Covers tuition fees and annual living stipend",
    details: "80 scholarships available at University of Bologna. SAT/GRE test scores required. Must be under 30 years old."
  },
  {
    name: "Excellence Scholarships Program",
    amount: "€8,000 cash grant + tuition waiver",
    coverage: "Covers full tuition + living allowance",
    details: "55 awards available at University of Milan. For first-year Master's students based on academic profile."
  },
  {
    name: "Padua International Excellence",
    amount: "€8,000 stipend + full fee waiver",
    coverage: "Covers full tuition + living expenses",
    details: "59 scholarships available at University of Padua. For Bachelor's or Master's taught in English. Valid for 2-3 years."
  }
];

const cityCosts = [
  { city: "Milan", costRangeEUR: { min: 800, max: 1550 }, vibe: "Fashion, business, cosmopolitan" },
  { city: "Rome", costRangeEUR: { min: 700, max: 1250 }, vibe: "History, culture, government" },
  { city: "Bologna", costRangeEUR: { min: 600, max: 970 }, vibe: "Student city, mediaeval charm" },
  { city: "Padua", costRangeEUR: { min: 530, max: 770 }, vibe: "Research, walkable campus" },
  { city: "Pisa", costRangeEUR: { min: 505, max: 700 }, vibe: "Academic, coastal, relaxed" },
  { city: "Turin", costRangeEUR: { min: 500, max: 600 }, vibe: "Affordable, industrial heritage" }
];

const visaSteps = [
  { title: "Valid Passport", detail: "At least 3 months validity beyond the intended stay duration with 2 blank pages." },
  { title: "Acceptance Letter", detail: "Official university admission / enrollment confirmation letter." },
  { title: "Financial Proof", detail: "Minimum of €5,180 (~INR 5.4 Lakhs/year). Supported by 6 months bank statements and 3 years ITR." },
  { title: "Health Insurance", detail: "Minimum €30,000 (~INR 31 Lakhs) coverage, including a repatriation clause." },
  { title: "Visa Application Form", detail: "Fully completed and signed national visa application form." },
  { title: "Passport Photos (2)", detail: "Recent, passport-sized white background photos." },
  { title: "Accommodation Proof", detail: "Lease agreement or hotel booking confirming accommodation for the first 30 days." },
  { title: "Flight Reservation", detail: "Confirmed round-trip ticket or a €2,000 financial buffer in bank." },
  { title: "Pay Visa Fee", detail: "€76 (~INR 7,800) visa application fee paid via VFS." },
  { title: "Await Decision", detail: "National visa (Type D) processing takes between 2 to 8 weeks." }
];

const jobSalaries = [
  { role: "Software Engineer / Developer", avgSalaryEUR: 38000, inDemand: "Very High" },
  { role: "Fashion Brand Specialist", avgSalaryEUR: 35000, inDemand: "High" },
  { role: "Mechanical / Automotive Engineer", avgSalaryEUR: 36000, inDemand: "Very High" },
  { role: "Data Analyst / Scientist", avgSalaryEUR: 40000, inDemand: "Very High" },
  { role: "Architect", avgSalaryEUR: 32000, inDemand: "Moderate" }
];

const faqs = [
  { q: "Which is the best university in Italy for international students?", a: "Politecnico di Milano is the highest-ranked Italian university (QS #98 for 2026), making it excellent for Engineering and Architecture. For law and classics, Sapienza University of Rome and University of Bologna are highly recommended." },
  { q: "Can I study in Italy for free?", a: "Yes. Public universities offer near-zero tuition through the ISEE Parificato indicator, and regional DSU scholarships provide full fee waivers plus €7,200 annual cash stipends to qualifying low-income students." },
  { q: "Do Italian universities teach in English?", a: "Yes. There are over 500 English-taught programs across public and private universities in disciplines like Engineering, Economics, Fashion, Medicine, and Arts." },
  { q: "What is the intake schedule in Italy?", a: "The Fall intake (September/October) is the primary option with 80% of program availability. The Spring intake (February/March) is secondary with limited course selection." },
  { q: "Is IELTS mandatory for Italy?", a: "No. Many public universities accept a Medium of Instruction (MOI) certificate if your previous degree was conducted entirely in English. However, specific scholarships (like IYT) may require IELTS." }
];

const ItalyTopUniversities = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [activeSection, setActiveSection] = useState('why-italy');
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
    return `₹${(minINR / 100000).toFixed(1)}L – ₹${(maxINR / 100000).toFixed(1)}L`;
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
          <span className="text-slate-600 font-black">Top Universities</span>
        </div>

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Award size={14} className="text-indigo-650 animate-pulse" />
            <span>Last Updated: January 14, 2026</span>
            <span className="text-indigo-300">•</span>
            <Clock size={14} className="text-indigo-650" />
            <span>19 Min Read</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Top Universities in Italy 2026:<br />
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Complete Guide for International Students</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto">
            Discover QS rankings, average fees, student visa processes, and scholarship models for elite Italian universities.
          </p>
        </motion.div>

        {/* Academic Journey Introduction Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(16,185,129,0.12),transparent_50%)]" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5">
              <Target size={14} />
              <span>🎯 Your Italian Academic Journey Starts Here</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
              Italy isn't just about pizza, pasta, and espresso.
            </h2>
            <p className="text-slate-350 text-sm md:text-base font-semibold leading-relaxed mb-4">
              It is home to <strong className="text-indigo-300">6 universities ranked in the QS World Top 300</strong> for 2026. It's where the oldest university in the Western world still stands, and right now, over <strong className="text-indigo-300">5,260 Indian students</strong> are pursuing their dreams there.
            </p>
            <p className="text-emerald-400 text-sm md:text-base font-extrabold leading-relaxed">
              Whether you're passionate about engineering, art history, medicine, or fashion—Italy has a program for you.
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

            {/* Section 1: Why Study in Italy */}
            <section id="why-italy" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">01</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🇮🇹 Why Study in Italy?</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Explore the premium benefits of opting for Italian universities for your high-level international studies.
              </p>

              {/* Reasons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">
                    🎓
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">World-Class Education</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    6 Italian universities stand strong in the QS World Top 300 rankings for 2026.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center mb-4 font-black">
                    🌍
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">500+ English Programs</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Complete your studies in English across hundreds of courses.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-black">
                    ✈️
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Gateway to Europe</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Enjoy seamless, visa-free travel across 29 Schengen member countries.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 font-black">
                    💰
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Affordable Education</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Public universities starting from just ~INR 81,000 per academic year.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 font-black">
                    💼
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Thriving Job Market</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Top corporate firms like Accenture, Amazon, and Armani recruit graduates.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 font-black">
                    🏛️
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Rich Culture</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Live amidst world-famous art, history, and classical architecture.
                  </p>
                </div>
              </div>

              {/* Quick Facts Table */}
              <h3 className="text-lg font-black text-slate-900 mb-4">Quick Facts at a Glance</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 font-black text-slate-800 text-xs uppercase tracking-wider">Aspect</th>
                        <th className="p-4 font-black text-slate-800 text-xs uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Top Universities</td>
                        <td className="p-4">Sapienza Rome, Politecnico Milano, University of Milan</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Indian Students</td>
                        <td className="p-4">5,260+ currently enrolled</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">English Programs</td>
                        <td className="p-4">500+ across all disciplines</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Public Universities</td>
                        <td className="p-4">61 public + 30 private</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Tuition (Public)</td>
                        <td className="p-4">INR 81K – INR 4L/year</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Tuition (Private)</td>
                        <td className="p-4">INR 5L – INR 18L/year</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Cost of Living</td>
                        <td className="p-4">INR 73K – INR 1.6L/month</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900 font-bold">Visa Success Rate</td>
                        <td className="p-4">~98.2%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* University shortlist picker widget placed after 1st heading */}
            <section id="shortlist-wizard" className="scroll-mt-24">
              <ShortlistWizardWidget 
                title="Get Your University Shortlist" 
                subtitle="Not sure which university fits your GPA and budget? Let us help you." 
              />
            </section>

            {/* Section 2: Top 6 Universities */}
            <section id="top-unis" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">02</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏛️ Top 6 Universities in Italy (2026 Rankings)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Detailed breakdowns of the six leading institutions in Italy, including location snapshots, academic strengths, and average fees.
              </p>

              {/* Accordion or Tabbed list of Universities */}
              <div className="space-y-12">
                {topUnisList.map((uni, idx) => (
                  <div key={idx} id={uni.name.toLowerCase().replace(/ /g, '-')} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-3xl flex items-center justify-center font-black text-indigo-600 text-xl">
                      {uni.qsRank}
                    </div>

                    <div className="flex gap-4 items-center mb-6 pr-12 sm:pr-24">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1.5 shadow-xs overflow-hidden shrink-0">
                        <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">{uni.name}</h3>
                        <p className="text-xs text-indigo-600 font-extrabold uppercase mt-0.5">{uni.tagline}</p>
                      </div>
                    </div>

                    {/* Snapshot Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl text-xs font-semibold text-slate-600">
                      <div>
                        <span className="text-slate-400 block mb-1">📍 Location</span>
                        <strong className="text-slate-900">{uni.city}, Italy</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">🎓 Student Enrollment</span>
                        <strong className="text-slate-900">{uni.students}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">💼 Employer Reputation</span>
                        <strong className="text-slate-900">{uni.employerRep}</strong>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs font-semibold text-slate-655 mb-6">
                      <div>
                        <strong className="text-slate-900 block mb-2">🏆 Key Highlights:</strong>
                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {uni.highlights.map((h, hIdx) => (
                            <li key={hIdx} className="bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-xl text-[11px] text-indigo-950 flex items-center gap-1.5">
                              <span className="text-indigo-600">✓</span> {h}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <strong className="text-slate-900 block mb-1.5">💰 Tuition Fees:</strong>
                          <span className="text-base font-black text-slate-800">
                            {formatRange(uni.tuitionEUR.min, uni.tuitionEUR.max)} / year
                          </span>
                        </div>
                        <div>
                          <strong className="text-slate-900 block mb-1.5">🌟 Unique Specialized Course:</strong>
                          <span className="text-indigo-650 font-bold block">{uni.uniqueProgram}</span>
                        </div>
                      </div>
                    </div>

                    {/* Courses Sub-table */}
                    <div className="border border-slate-100 rounded-2xl overflow-x-auto mb-6">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 font-black text-slate-700">
                            <th className="p-3">Course</th>
                            <th className="p-3">Duration</th>
                            <th className="p-3">Focus Area</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                          {uni.courses.map((course, cIdx) => (
                            <tr key={cIdx}>
                              <td className="p-3 text-slate-900 font-bold">{course.name}</td>
                              <td className="p-3">{course.duration}</td>
                              <td className="p-3">{course.focus}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Criteria and Scholarships info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold pt-4 border-t border-slate-100/70">
                      <div>
                        <strong className="text-slate-900 block mb-1.5">🎯 Admission Criteria:</strong>
                        <p className="text-slate-550 mb-1"><strong>Bachelor's:</strong> {uni.bachelorsReq}</p>
                        <p className="text-slate-550"><strong>Master's:</strong> {uni.mastersReq}</p>
                      </div>
                      <div>
                        <strong className="text-slate-900 block mb-1.5">🎁 Scholarships:</strong>
                        <div className="flex flex-wrap gap-1.5">
                          {uni.scholarships.map((s, sIdx) => (
                            <span key={sIdx} className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2"><strong>Notable Alumni:</strong> {uni.notableAlumni}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Popular Courses */}
            <section id="popular-courses" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">03</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📊 Popular Master's Courses in Italy</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Italy offers over 700+ premium Master's programs taught entirely in English. Here are some of the most popular courses for international students:
              </p>

              {/* Master Courses list */}
              <div className="space-y-4 mb-8">
                {popularMasters.map((pm, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xs transition-shadow flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-1">{pm.course}</h4>
                      <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider">{pm.uni}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-bold">Avg. Course Fee</span>
                      <strong className="text-slate-900 text-sm">{formatCost(pm.feeEUR)} / year</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fields Table */}
              <h3 className="text-lg font-black text-slate-900 mb-4">Popular Fields for International Students</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 font-black text-slate-800 text-xs uppercase tracking-wider">Field</th>
                        <th className="p-4 font-black text-slate-800 text-xs uppercase tracking-wider">International Enrollments</th>
                        <th className="p-4 font-black text-slate-700 text-xs uppercase tracking-wider">Top Universities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {popularFields.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-4 text-slate-900 font-bold">{row.field}</td>
                          <td className="p-4 text-slate-600">{row.enrollment}</td>
                          <td className="p-4 text-indigo-650">{row.topUnis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 4: Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">04</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💰 Scholarships for Indian Students</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Multiple high-value scholarships are open specifically for Indian students to completely offset tuition and living budgets.
              </p>

              {/* Scholarship Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scholarshipsList.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-lg uppercase tracking-wider block w-fit mb-3">
                        Award: {item.amount}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mb-2">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 font-bold mb-4 uppercase">Coverage: {item.coverage}</p>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Cost of Living */}
            <section id="living-costs" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">05</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💶 Cost of Living in Italy</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Daily expenditure budgets differ depending on the type of city you study in. Here is a typical overview:
              </p>

              {/* Cost of Living highlights */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-6 flex items-center gap-2">
                  <Wallet size={18} className="text-indigo-650" />
                  Monthly Living Costs Breakdown (Average: {formatRange(700, 1550)} / month)
                </h4>

                <div className="space-y-4">
                  {[
                    { item: "Accommodation (Shared Room)", minEUR: 220, maxEUR: 700 },
                    { item: "Food & Groceries", minEUR: 210, maxEUR: 320 },
                    { item: "Transport & Leisure", minEUR: 175, maxEUR: 320 },
                    { item: "Mobile & Internet Plan", minEUR: 9, maxEUR: 30 }
                  ].map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-700 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <span>{row.item}</span>
                      <strong className="text-slate-950 font-bold">{formatRange(row.minEUR, row.maxEUR)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* City Cost Comparison */}
              <h3 className="text-lg font-black text-slate-900 mb-4">City-Wise Cost Comparison</h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 font-black text-slate-800 text-xs uppercase tracking-wider">City</th>
                        <th className="p-4 font-black text-slate-800 text-xs uppercase tracking-wider">Monthly Budget</th>
                        <th className="p-4 font-black text-slate-700 text-xs uppercase tracking-wider">Atmosphere / Vibe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {cityCosts.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-4 text-slate-900 font-bold">{row.city}</td>
                          <td className="p-4 font-bold text-slate-850">{formatRange(row.costRangeEUR.min, row.costRangeEUR.max)}</td>
                          <td className="p-4 text-slate-500 text-xs font-bold">{row.vibe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 6: Visa Process */}
            <section id="visa-process" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">06</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🛂 Student Visa Process</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Securing an Italian student visa is simple if you follow these ten essential steps and maintain complete financial folders:
              </p>

              {/* Visa checklist workflow */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                <ul className="space-y-4">
                  {visaSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-black text-slate-800 text-xs md:text-sm">{step.title}</p>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-relaxed">{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 text-xs text-indigo-900 font-semibold">
                  <p>📊 <strong>Visa Success Rate:</strong> Historically around 98.2% for genuine Indian students.</p>
                  <p className="text-rose-700 font-extrabold mt-1.5">⚠️ 2025 projection predicts stricter scrutiny (85-88% success rate) on bank statements and sponsorship contracts.</p>
                </div>
              </div>
            </section>

            {/* Section 7: Intakes */}
            <section id="intakes" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">07</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📅 Intakes in Italy 2026-2027</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Understand the application timelines for Fall and Spring intakes:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-100 rounded-2xl p-6 bg-white shadow-xs">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-black rounded-lg uppercase tracking-wider block w-fit mb-3">
                    🍁 Fall Intake (Sept/Oct)
                  </span>
                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                    <p>🚀 <strong>Applications Open:</strong> November 2025</p>
                    <p>⏰ <strong>Early Deadlines:</strong> January – February 2026</p>
                    <p>🚫 <strong>Final Deadline:</strong> May 15, 2026 (non-EU)</p>
                    <p className="text-emerald-600 font-bold pt-2 border-t border-slate-50">✓ Default primary choice (80% enrollment and scholarship slots).</p>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl p-6 bg-white shadow-xs">
                  <span className="px-2.5 py-1 bg-orange-50 text-blue-800 text-[10px] font-black rounded-lg uppercase tracking-wider block w-fit mb-3">
                    🌸 Spring Intake (Feb/Mar)
                  </span>
                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                    <p>🚀 <strong>Applications Open:</strong> July 2026</p>
                    <p>⏰ <strong>Application Deadline:</strong> Oct – Dec 2026</p>
                    <p>🚫 <strong>Classes Start:</strong> Late Feb / Early Mar 2027</p>
                    <p className="text-indigo-650 font-bold pt-2 border-t border-slate-50">✓ Secondary choice with limited course and scholarship options.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Jobs */}
            <section id="jobs" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">08</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💼 Job Opportunities & Salaries</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Graduates can apply for a 12-month post-study stay-back permit. Here are top roles and average salaries:
              </p>

              {/* Jobs Table */}
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 font-black text-slate-800 text-xs uppercase tracking-wider">Job Role</th>
                        <th className="p-4 font-black text-slate-800 text-xs uppercase tracking-wider">Average Salary</th>
                        <th className="p-4 font-black text-slate-700 text-xs uppercase tracking-wider">Market Demand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {jobSalaries.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-4 text-slate-900 font-bold">{row.role}</td>
                          <td className="p-4 font-bold text-slate-850">{formatCost(row.avgSalaryEUR)} / year</td>
                          <td className="p-4 text-emerald-650 text-xs font-black uppercase">{row.inDemand}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 9: FAQ */}
            <section id="faq" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">09</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">❓ Frequently Asked Questions</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Common queries regarding the top universities and study process in Italy:
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
              Disclaimer: Fees, rankings, exchange rates, deadlines, and requirements are subject to change. Always verify with official sources and your specific university/consulate.
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
                  Want to shortlist Italian Unis?
                </h5>
                <p className="text-white/80 text-[11px] font-semibold leading-relaxed mb-5">
                  Get absolute clarity on QS rankings, DSU scholarships, and application documentation guides.
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

export default ItalyTopUniversities;
