import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Award, Building, Globe, ExternalLink, 
  BookOpen, Calendar, HelpCircle, CheckCircle2, ArrowRight, 
  Search, Filter, Info, Briefcase, GraduationCap, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUniversityLogo } from '../../../components/logoResolver';

// Import local UK logo assets
import OxfordLogo from '@/assets/uk/University of Oxford.png';
import CambridgeLogo from '@/assets/uk/University of Cambridge.jpg';
import ImperialLogo from '@/assets/uk/Imperial College London.png';
import ManchesterLogo from '@/assets/uk/University of Manchester.jpg';
import KCLLogo from "@/assets/uk/King's College London.png";
import UOLLogo from '@/assets/uk/University of London.jpg';
import GlasgowLogo from '@/assets/uk/University of Glasgow.jpeg';
import BirminghamLogo from '@/assets/uk/University of Birmingham.jpg';
import EdinburghLogo from '@/assets/uk/University of Edinburgh.jpg';
import UCLLogo from '@/assets/uk/University College London.jpg';
import LeedsLogo from '@/assets/uk/University of Leeds.png';

// ─────────────────────────────────────────────
// Detailed Course Database for UK
// ─────────────────────────────────────────────
const courseDetails = {
  cs: {
    title: "Computer Science & AI",
    salary: 55000, // in GBP
    duration: "1 Year",
    growth: "+18% (High demand across tech clusters)",
    subjects: ["Machine Learning & Deep Learning", "Advanced Computational Theory", "Software Engineering Foundations", "Data Networks & Security", "Human-Computer Interaction"],
    universities: [
      { name: "University of Oxford", city: "Oxford", tuition: 35, rank: "3 QS", logo: OxfordLogo, url: "https://www.ox.ac.uk" },
      { name: "University of Cambridge", city: "Cambridge", tuition: 29, rank: "2 QS", logo: CambridgeLogo, url: "https://www.cam.ac.uk" },
      { name: "Imperial College London", city: "London", tuition: 49, rank: "2 QS", logo: ImperialLogo, url: "https://www.imperial.ac.uk" },
      { name: "University College London", city: "London", tuition: 48, rank: "9 QS", logo: UCLLogo, url: "https://www.ucl.ac.uk" },
      { name: "King's College London", city: "London", tuition: 43, rank: "40 QS", logo: KCLLogo, url: "https://www.kcl.ac.uk" }
    ]
  },
  physiotherapy: {
    title: "Physiotherapy & Rehab",
    salary: 38000,
    duration: "2 Years",
    growth: "+15% (Essential NHS & private sector demand)",
    subjects: ["Clinical Anatomy & Biomechanics", "Neuromuscular Physiotherapy", "Cardiorespiratory Practice", "Rehabilitation & Exercise Therapy", "Clinical Research Methods"],
    universities: [
      { name: "University of Leeds", city: "Leeds", tuition: 29, rank: "75 QS", logo: LeedsLogo, url: "https://www.leeds.ac.uk" },
      { name: "Coventry University", city: "Coventry", tuition: 18, rank: "571 QS", logo: "https://logo.clearbit.com/coventry.ac.uk", url: "https://www.coventry.ac.uk" },
      { name: "University of East London", city: "London", tuition: 15, rank: "900 QS", logo: "https://logo.clearbit.com/uel.ac.uk", url: "https://www.uel.ac.uk" },
      { name: "University of Glasgow", city: "Glasgow", tuition: 32, rank: "76 QS", logo: GlasgowLogo, url: "https://www.gla.ac.uk" },
      { name: "University of Birmingham", city: "Birmingham", tuition: 9, rank: "84 QS", logo: BirminghamLogo, url: "https://www.bham.ac.uk" }
    ]
  },
  data: {
    title: "Data Science & Analytics",
    salary: 52000,
    duration: "1 Year",
    growth: "+25% (Pioneering data hub globally)",
    subjects: ["Big Data Analytics", "Statistical Machine Learning", "Data Mining & Databases", "Data Visualization", "Practical Data Analysis"],
    universities: [
      { name: "University of Edinburgh", city: "Edinburgh", tuition: 42, rank: "22 QS", logo: EdinburghLogo, url: "https://www.ed.ac.uk" },
      { name: "University College London", city: "London", tuition: 48, rank: "9 QS", logo: UCLLogo, url: "https://www.ucl.ac.uk" },
      { name: "Imperial College London", city: "London", tuition: 49, rank: "2 QS", logo: ImperialLogo, url: "https://www.imperial.ac.uk" },
      { name: "University of London", city: "London", tuition: 18, rank: "44 QS", logo: UOLLogo, url: "https://www.london.ac.uk" }
    ]
  },
  management: {
    title: "MBA & Finance Management",
    salary: 70000,
    duration: "1 - 2 Years",
    growth: "+12% (London financial cluster advantage)",
    subjects: ["Corporate Finance Strategy", "Global Supply Chain Management", "Strategic Leadership", "Organizational Behavior", "Business Analytics for Managers"],
    universities: [
      { name: "London Business School", city: "London", tuition: 143, rank: "4 QS", logo: "https://logo.clearbit.com/london.edu", url: "https://www.london.edu" },
      { name: "University of Oxford", city: "Oxford", tuition: 35, rank: "3 QS", logo: OxfordLogo, url: "https://www.ox.ac.uk" },
      { name: "University of Cambridge", city: "Cambridge", tuition: 29, rank: "2 QS", logo: CambridgeLogo, url: "https://www.cam.ac.uk" },
      { name: "University of London", city: "London", tuition: 18, rank: "44 QS", logo: UOLLogo, url: "https://www.london.ac.uk" }
    ]
  },
  engineering: {
    title: "Engineering & Tech",
    salary: 48000,
    duration: "1 Year",
    growth: "+8% (Steady engineering innovation routes)",
    subjects: ["Advanced Mechanical Design", "Systems Engineering Principles", "Electronics & Microgrids", "Robotics & Controls", "Materials Technology"],
    universities: [
      { name: "University of Cambridge", city: "Cambridge", tuition: 29, rank: "2 QS", logo: CambridgeLogo, url: "https://www.cam.ac.uk" },
      { name: "Imperial College London", city: "London", tuition: 49, rank: "2 QS", logo: ImperialLogo, url: "https://www.imperial.ac.uk" },
      { name: "University of Birmingham", city: "Birmingham", tuition: 9, rank: "84 QS", logo: BirminghamLogo, url: "https://www.bham.ac.uk" },
      { name: "Brunel University London", city: "London", tuition: 24, rank: "343 QS", logo: "https://logo.clearbit.com/brunel.ac.uk", url: "https://www.brunel.ac.uk" }
    ]
  }
};

const UKMastersPage = () => {
  const [activeSpec, setActiveSpec] = useState('cs');
  const [currency, setCurrency] = useState('INR'); // 'GBP' | 'INR'
  
  const exchangeRate = 105.50; // 1 GBP ≈ 105.50 INR
  const currentDetails = courseDetails[activeSpec];

  // Price formatting helper
  const formatPrice = (valInGBP) => {
    if (currency === 'GBP') {
      return `£${valInGBP.toLocaleString()}`;
    }
    const valInINR = valInGBP * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  // Tuition formatting helper (it's already in INR Lakhs in our universities list)
  const formatTuition = (valInINRLakh) => {
    if (currency === 'INR') {
      return `₹ ${valInINRLakh} Lakh`;
    }
    const valInGBP = (valInINRLakh * 100000) / exchangeRate;
    return `£${Math.round(valInGBP).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Background Ambience */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-100/40 via-indigo-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
            <GraduationCap size={14} className="animate-pulse" />
            <span>Master's Program Finder 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Masters in UK: Course Guide &{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Specializations</span>
          </h1>
          <p className="text-slate-655 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto mb-8">
            Explore postgraduate degrees (MS, MSc, MA, MBA) in the UK. Find universities, tuition fees, starting salaries, and entry requirements across major streams.
          </p>
        </motion.div>

        {/* Currency Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-md inline-flex items-center gap-1">
            <button 
              onClick={() => setCurrency('GBP')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'GBP' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-605 hover:bg-slate-50'}`}
            >
              GBP (£)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-605 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* Dynamic Specialization Explorer */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-xl">
            <h2 className="text-3xl font-black text-slate-900 mb-2.5 tracking-tight">Interactive Course Explorer</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Select a field to view career stats, syllabus topics, and UK universities.</p>
          </div>

          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            {Object.entries(courseDetails).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveSpec(key)}
                className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeSpec === key ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-slate-550 hover:text-indigo-500'}`}
              >
                {value.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeSpec}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8"
            >
              {/* Left Side: Stats */}
              <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-sm backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-indigo-500 font-black uppercase tracking-wider">Stream Overview</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1 mb-6">{currentDetails.title}</h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Starting Salary</p>
                      <p className="text-2xl font-black text-emerald-605 mt-0.5">{formatPrice(currentDetails.salary)}/yr</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Program Duration</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{currentDetails.duration}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">UK Job Growth Demand</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{currentDetails.growth}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Core Course Modules</p>
                  <ul className="space-y-2">
                    {currentDetails.subjects.map((sub, i) => (
                      <li key={i} className="text-xs text-slate-655 font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Side: University matches */}
              <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-sm backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Building size={20} className="text-indigo-650" />
                    Top Matching UK Universities
                  </h4>

                  <div className="space-y-4 overflow-y-auto max-h-[360px] pr-2">
                    {currentDetails.universities.map((uni, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-indigo-400 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            <img src={getUniversityLogo(uni.name, uni.logo)} alt={uni.name} className="w-7 h-7 object-contain" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm leading-tight">{uni.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-0.5">
                              <MapPin size={10} />
                              {uni.city}, UK • <Award size={10} className="ml-1 text-indigo-500" /> {uni.rank}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Tuition Fee</p>
                          <p className="text-xs font-black text-indigo-655 mt-0.5">{formatTuition(uni.tuition)}/yr</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 mt-6 flex justify-end">
                  <Link
                    to="/contact?postgrad=masters-uk"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/10 flex items-center gap-2"
                  >
                    <span>Check Eligibility for Masters</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Admission and Eligibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          
          <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Eligibility & Exam Score Requirements</h3>
            <div className="space-y-4">
              {[
                { test: "IELTS Academic Band", score: "6.5 Minimum Band Overall", detail: "Required for English language verification at almost all UK institutions (with no band less than 6.0)." },
                { test: "TOEFL iBT Score", score: "88 - 92 Minimum Cutoff", detail: "Widely accepted alternative for verifying English proficiency." },
                { test: "PTE Academic Score", score: "58 - 65 Minimum Cutoff", detail: "An increasingly popular computer-based test approved by UK Visas and Immigration (UKVI)." },
                { test: "Undergraduate Degree", score: "15-16 Years of Education", detail: "Most UK universities accept 3-year bachelor's degrees directly for admissions." }
              ].map((item, i) => (
                <div key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0 flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-805 text-sm">{item.test} • <span className="text-indigo-650 font-black">{item.score}</span></p>
                    <p className="text-xs text-slate-500 font-semibold mt-1 leading-normal">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">UK Masters Application Package Checklist</h3>
              <p className="text-slate-505 text-xs font-semibold leading-relaxed mb-6">
                UK universities look at academic background, professional references, and a compelling personal statement. Having structured documents speeds up processing.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Personal Statement / SOP",
                  "2 Letters of Reference (LOR)",
                  "Curriculum Vitae / Resume",
                  "Academic Transcripts & Certificates",
                  "IELTS / TOEFL / PTE Scorecard",
                  "Copy of Passport (Identity pages)",
                  "Work Experience Letters (if any)",
                  "Portfolio (for arts/design courses)"
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-850 font-bold text-xs bg-slate-50 border border-slate-100 p-3.5 rounded-xl hover:border-indigo-400 transition-colors">
                    <CheckCircle2 size={16} className="text-indigo-500 stroke-[2.5]" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 mt-6 flex flex-wrap gap-4 items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Need help drafting your SOP & LOR?</span>
              <Link
                to="/contact?service=sop-drafting-uk"
                className="inline-flex items-center gap-1.5 text-indigo-650 font-black hover:text-indigo-800 transition-colors text-xs"
              >
                <span>Talk to Consultant</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white rounded-[36px] p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute right-[-10%] top-[-25%] w-[450px] h-[450px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-black mb-3">Begin Your UK Masters Journey Today</h3>
            <p className="text-white/80 text-sm font-semibold leading-relaxed">
              Our expert consultants offer end-to-end support—from university shortlist, SOP guidance, CAS letter support to visa processing. 100% free counselling.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to="/book-consultation"
              className="px-8 py-4 bg-white text-[#DE5C2B] hover:text-orange-700 font-extrabold text-sm rounded-2xl hover:bg-orange-50/90 shadow-md transition-all hover:-translate-y-0.5 duration-300 inline-flex items-center gap-2 group cursor-pointer"
            >
              <span>Book Free Counselling</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UKMastersPage;
