import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Award, Building, Globe, ExternalLink, 
  BookOpen, Calendar, HelpCircle, CheckCircle2, ArrowRight, 
  Search, Filter, Info, Plane, Calculator, ShieldCheck, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../components/StudyAbroadCTA';
import { getUniversityLogo } from '../../../components/logoResolver';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../utils/universitySearchMatcher';
import ausImg from '../../../assets/destinations/australia.jpg';

// ─────────────────────────────────────────────
// Australia Universities Database for Finder
// ─────────────────────────────────────────────
const australiaUniversities = [
  { id: 'aus-1', name: "University of Melbourne", city: "Melbourne", rank: "#19 QS", tuition: 45000, type: "PUBLIC", website: "https://www.unimelb.edu.au", eligibility: "GPA 3.5+, IELTS 6.5+", logo: "https://logo.clearbit.com/unimelb.edu.au", edge: "Melbourne Model, #1 in Australia for Graduate Employability", courses: ["Business Administration", "Computer Science", "Data Science", "Law", "Medicine", "Engineering Science", "Architecture"] },
  { id: 'aus-2', name: "University of Sydney", city: "Sydney", rank: "#25 QS", tuition: 46000, type: "PUBLIC", website: "https://www.sydney.edu.au", eligibility: "GPA 3.5+, IELTS 7.0+", logo: "https://logo.clearbit.com/sydney.edu.au", edge: "#1 in Australia for Sustainability, world-leading focus on Health Sciences & Arts", courses: ["Law", "Medicine", "Business Administration", "Engineering Science", "Computer Science", "Data Science", "Psychology"] },
  { id: 'aus-3', name: "UNSW Sydney", city: "Sydney", rank: "#20 QS", tuition: 47000, type: "PUBLIC", website: "https://www.unsw.edu.au", eligibility: "GPA 3.5+, IELTS 6.5+", logo: "https://logo.clearbit.com/unsw.edu.au", edge: "#1 university in Australia for startup founders & employment outcomes", courses: ["Computer Science", "Business Analytics", "Engineering Science", "Data Science", "Software Engineering", "Finance", "Cyber Security"] },
  { id: 'aus-4', name: "Australian National University", city: "Canberra", rank: "#32 QS", tuition: 44000, type: "PUBLIC", website: "https://www.anu.edu.au", eligibility: "GPA 3.5+, IELTS 6.5+", logo: "https://logo.clearbit.com/anu.edu.au", edge: "Located in the capital, #1 international Go8 university, top research focus", courses: ["International Relations", "Political Science", "Law", "Computer Science", "Economics", "Business Administration", "Data Science"] },
  { id: 'aus-5', name: "Monash University", city: "Melbourne", rank: "#36 QS", tuition: 42000, type: "PUBLIC", website: "https://www.monash.edu", eligibility: "GPA 3.3+, IELTS 6.5+", logo: "https://logo.clearbit.com/monash.edu", edge: "#2 globally for Pharmacy, massive range of dual-degree programs", courses: ["Business Analytics", "Computer Science", "Engineering Science", "Pharmacy", "Business Administration", "Data Science", "Software Engineering"] },
  { id: 'aus-6', name: "University of Queensland", city: "Brisbane", rank: "#43 QS", tuition: 43000, type: "PUBLIC", website: "https://www.uq.edu.au", eligibility: "GPA 3.5+, IELTS 6.5+", logo: "https://logo.clearbit.com/uq.edu.au", edge: "World top-50 research university celebrated for life sciences and agriculture", courses: ["Business Analytics", "Computer Science", "Biological Sciences", "Engineering Science", "Business Administration", "Data Science"] },
  { id: 'aus-7', name: "University of Western Australia", city: "Perth", rank: "#72 QS", tuition: 41000, type: "PUBLIC", website: "https://www.uwa.edu.au", eligibility: "GPA 3.5+, IELTS 6.5+", logo: "https://logo.clearbit.com/uwa.edu.au", edge: "Prestigious Go8 university with regional visa advantages in Western Australia", courses: ["Business Administration", "Computer Science", "Engineering Science", "Law", "Data Science", "Mining Engineering"] },
  { id: 'aus-8', name: "University of Adelaide", city: "Adelaide", rank: "#89 QS", tuition: 40000, type: "PUBLIC", website: "https://www.adelaide.edu.au", eligibility: "GPA 3.5+, IELTS 6.5+", logo: "https://logo.clearbit.com/adelaide.edu.au", edge: "Go8 member in South Australia, extra regional visa stays & lower living costs", courses: ["Engineering Science", "Computer Science", "Business Administration", "Law", "Medicine", "Data Science", "Biomedical Engineering"] },
  { id: 'aus-9', name: "University of Technology Sydney", city: "Sydney", rank: "#90 QS", tuition: 39000, type: "PUBLIC", website: "https://www.uts.edu.au", eligibility: "GPA 3.2+, IELTS 6.5+", logo: "https://logo.clearbit.com/uts.edu.au", edge: "#1 young university in Australia, industry-integrated tech programs", courses: ["Computer Science", "Data Science", "Business Administration", "Software Engineering", "Business Analytics", "Cyber Security"] },
  { id: 'aus-10', name: "Deakin University", city: "Melbourne", rank: "#197 QS", tuition: 35000, type: "PUBLIC", website: "https://www.deakin.edu.au", eligibility: "GPA 3.0+, IELTS 6.0+", logo: "https://logo.clearbit.com/deakin.edu.au", edge: "AACSB/EQUIS/AMBA triple crown accredited business school, very innovative", courses: ["Business Analytics", "Data Science", "Computer Science", "Nursing", "Software Engineering", "Business Administration"] },
  { id: 'aus-11', name: "RMIT University", city: "Melbourne", rank: "#140 QS", tuition: 36000, type: "PUBLIC", website: "https://www.rmit.edu.au", eligibility: "GPA 3.0+, IELTS 6.5+", logo: "https://logo.clearbit.com/rmit.edu.au", edge: "Globally connected tech & design leader in the heart of Melbourne", courses: ["Business Analytics", "Computer Science", "Engineering Science", "Architecture", "Data Science", "Software Engineering", "Design"] }
];

const StudyInAustralia = () => {
  const [currency, setCurrency] = useState('INR'); // 'AUD' | 'INR'
  const [activeTab, setActiveTab] = useState('intro'); // 'intro' | 'why' | 'education' | 'courses' | 'costs' | 'visa' | 'work' | 'scholarships' | 'faqs'
  const [finderSearch, setFinderSearch] = useState('');
  const [finderCity, setFinderCity] = useState('All');
  const [finderTuition, setFinderTuition] = useState('All'); // 'All' | 'under40k' | 'under45k'
  const [faqOpen, setFaqOpen] = useState({});

  const exchangeRate = 56.0; // 1 AUD ≈ 56.00 INR (2026 Reference Rate)

  // Formatting Helper
  const formatCost = (valInAUD) => {
    if (currency === 'AUD') {
      return `AUD ${valInAUD.toLocaleString()}`;
    }
    const valInINR = valInAUD * exchangeRate;
    if (valInINR === 0) return 'Free (₹ 0)';
    if (valInINR >= 10000000) {
      return `₹ ${(valInINR / 10000000).toFixed(2)} Cr`;
    }
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  // Filter Universities for Finder
  const filteredUniversities = australiaUniversities.filter(uni => {
    if (finderCity !== 'All' && uni.city !== finderCity) return false;
    if (finderTuition !== 'All') {
      if (finderTuition === 'under40k' && uni.tuition >= 40000) return false;
      if (finderTuition === 'under45k' && uni.tuition >= 45000) return false;
    }
    if (finderSearch && !matchesUniversitySearch(uni, finderSearch)) return false;
    return true;
  });

  // Toggle FAQ Accordion
  const toggleFaq = (idx) => {
    setFaqOpen(p => ({ ...p, [idx]: !p[idx] }));
  };

  // Static FAQ database
  const faqs = [
    { question: "How much does it cost to study in Australia for Indian students?", answer: "Tuition fees range from AUD 20,000 to AUD 50,000 per year (~INR 11 Lakhs – INR 28 Lakhs). The Australian government recommends budgeting AUD 29,710 per year (~INR 16.5 Lakhs) for living costs." },
    { question: "Which course is best for study in Australia?", answer: "Engineering & Technology, Computer Science & IT (Cloud, AI, Cybersecurity), Healthcare (Nursing, Physiotherapy), and Business Analytics are highly recommended for high returns and migration pathways." },
    { question: "Is Australia good for Indian students?", answer: "Yes, it is highly safe, hosts a massive Indian diaspora in Sydney and Melbourne, offers up to 4 years of stay rights via the AI-ECTA, and holds excellent academic credentials (9 universities in the global top 100)." },
    { question: "Can you work while studying in Australia?", answer: "Yes, student visa holders can work up to 48 hours per fortnight during university terms, and unlimited hours during breaks. Minimum wages typically range between AUD 24 and AUD 40 per hour." },
    { question: "What jobs are in high demand in Australia?", answer: "Key sectors with critical shortages include Healthcare (aged care, nurses), Information and Communication Tech (ICT developers, cybersecurity experts), Civil and Electrical Engineering, and Secondary Education." }
  ];

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-amber-100/35 via-orange-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-amber-200/10 to-orange-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[25%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-amber-150/10 to-orange-200/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Study in Australia</span>
        </div>

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 text-left"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
              <Plane size={14} className="text-amber-600 animate-pulse" />
              <span>Australia Study Guide 2026/2027</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Study in Australia for{' '}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Indian Students</span>
            </h1>
            <p className="text-slate-655 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mb-8">
              Explore globally-recognized degrees, updated 2026 visa regulations, living costs, and favorable post-study stay rights structured under the Australia-India agreement.
            </p>

            <a 
              href="#university-finder" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-2xl shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
            >
              <span>Find Your Preferred University</span>
              <ArrowRight size={16} />
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className="w-full h-[320px] md:h-[380px] rounded-[36px] overflow-hidden shadow-xl border border-white/60 relative">
              <img 
                src={ausImg} 
                alt="Sydney Opera House, Australia" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">Sydney Harbor</p>
                <h3 className="text-xl font-black mt-1">Gateway to World-Class Careers</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: "9 Universities", label: "QS Global Top 100" },
            { val: "Up to 4 Years", label: "Post-Study PSWV Stay" },
            { val: "AUD 29,710", label: "Min. Annual Living Proof" },
            { val: "48 Hrs / Fnight", label: "Session Work Limits" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-xs backdrop-blur-md">
              <p className="text-xl md:text-2xl font-black text-amber-600">{stat.val}</p>
              <p className="text-[10px] text-slate-500 font-extrabold mt-1 uppercase tracking-wider leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* INTEGRITY RESET / WARNING BOX */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/50 border border-red-100 rounded-[32px] p-8 mb-16 relative overflow-hidden"
        >
          <div className="absolute right-[-5%] top-[-10%] w-[250px] h-[250px] bg-red-100/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <div className="p-3.5 bg-red-100 text-red-650 rounded-2xl flex-shrink-0">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-red-955">The 2026 Australian "Integrity Reset"</h3>
              <p className="text-slate-655 text-sm font-semibold mt-2.5 leading-relaxed">
                What if one wrong university choice in Australia costs you <strong>₹25 lakhs</strong> and two years of your life? For most Indian students, the stakes are higher than ever in 2026. A significant <strong>Integrity Reset</strong> has changed the picture: the visa price has increased to <strong>AUD 2,000</strong>, financial proof requirements stand at <strong>AUD 29,710</strong>, and the new <strong>Genuine Student (GS)</strong> test has replaced GTE, making precision non-negotiable.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Global Currency Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-md inline-flex items-center gap-1">
            <button 
              onClick={() => setCurrency('AUD')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'AUD' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-655 hover:bg-slate-50'}`}
            >
              AUD ($)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-655 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* SECTION TABS SYSTEM */}
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-start mb-20">
          {/* Sidebar Tabs */}
          <aside className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[28px] p-5 shadow-sm sticky top-28 z-20">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 pl-3">GUIDE SECTIONS</p>
            <div className="space-y-1.5">
              {[
                { id: 'intro', label: '1. Why Australia?' },
                { id: 'education', label: '2. Education System' },
                { id: 'courses', label: '3. Popular Courses' },
                { id: 'costs', label: '4. Cost of Studying' },
                { id: 'visa', label: '5. Student Visa 500' },
                { id: 'work', label: '6. Work & Visas' },
                { id: 'scholarships', label: '7. Scholarships' },
                { id: 'faqs', label: '8. FAQs' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); }}
                  className={`w-full text-left py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer ${activeTab === tab.id ? 'bg-amber-50 text-amber-705 border-l-4 border-amber-600 font-black shadow-2xs' : 'text-slate-650 hover:bg-slate-50'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Section Panel */}
          <div className="min-h-[480px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/60 border border-white rounded-[32px] p-8 shadow-xs backdrop-blur-xl"
              >
                {/* 1. WHY AUSTRALIA */}
                {activeTab === 'intro' && (
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Why Should Indian Students Study in Australia?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                      <div className="space-y-5">
                        <div className="flex gap-3">
                          <CheckCircle2 className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Elite Academic Reputation</h4>
                            <p className="text-xs text-slate-550 font-semibold mt-1">9 Australian universities are ranked in the top 100 worldwide (QS 2026 Rankings), providing cutting-edge research and premium international standards.</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <CheckCircle2 className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Global Practical Degrees</h4>
                            <p className="text-xs text-slate-550 font-semibold mt-1">The Australian Qualifications Framework (AQF) ensures focus on practical industry skills. Masters programs typically span 1.5 to 2 years.</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <CheckCircle2 className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Favorable PSW Work Rights</h4>
                            <p className="text-xs text-slate-550 font-semibold mt-1">Subclass 485 Temporary Graduate Visa offers extended stays via the bilateral Australia-India agreement (AI-ECTA).</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="flex gap-3">
                          <CheckCircle2 className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">High Earnings & Part-Time Work</h4>
                            <p className="text-xs text-slate-550 font-semibold mt-1">Work up to 48 hours per fortnight during session and unlimited during breaks. Minimum wages range from AUD 24 to 40 per hour.</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <CheckCircle2 className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Skill Shortage Pathways</h4>
                            <p className="text-xs text-slate-550 font-semibold mt-1">High demand in sectors like Healthcare, civil/electrical Engineering, cybersecurity, software dev, and early-childhood Education.</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <CheckCircle2 className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Safety and Comfort</h4>
                            <p className="text-xs text-slate-550 font-semibold mt-1">Low crime rates, high student safety (cities like Adelaide, Canberra, Hobart), and an active Indian diaspora.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. EDUCATION SYSTEM */}
                {activeTab === 'education' && (
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Understanding the Australian Educational System</h2>
                    <p className="text-slate-550 text-sm font-semibold mb-6">
                      The Australian Qualifications Framework (AQF) is divided into 10 levels, connecting schools, vocational providers, and universities.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <span className="text-[10px] text-amber-605 font-bold uppercase tracking-wider">Level 7</span>
                        <h4 className="font-black text-slate-800 text-sm mt-1 mb-2">Bachelor's Degree</h4>
                        <p className="text-xs text-slate-500 font-semibold">Typically 3-4 years. Core areas: Business, Engineering, Computer Science.</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <span className="text-[10px] text-amber-605 font-bold uppercase tracking-wider">Level 9</span>
                        <h4 className="font-black text-slate-800 text-sm mt-1 mb-2">Master's Degree</h4>
                        <p className="text-xs text-slate-500 font-semibold">Typically 1.5-2 years. Focuses on specialized knowledge and job-readiness.</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <span className="text-[10px] text-amber-605 font-bold uppercase tracking-wider">Level 10</span>
                        <h4 className="font-black text-slate-800 text-sm mt-1 mb-2">Doctoral Degree (PhD)</h4>
                        <p className="text-xs text-slate-500 font-semibold">Typically 3-4 years. Built on intensive and highly academic research.</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 mb-4">Major Intakes in Australian Universities</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">February Intake (Primary / Gold Standard)</h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1">Offers 100% course availability, peak government scholarship access, and aligns with Australian hiring cycles.</p>
                        </div>
                        <span className="self-start md:self-center px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black rounded-lg uppercase tracking-wider">FEB START</span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">July Intake (Secondary / Preparing Buffer)</h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1">Ideal for Indian students finished with board/university exams in April-May. Faster turnaround and less seat competition.</p>
                        </div>
                        <span className="self-start md:self-center px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-black rounded-lg uppercase tracking-wider">JUL START</span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">November Intake (Summer / Trimester Cycle)</h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1">Limited courses. Ideal for business, IT courses, or specific trimester schedules.</p>
                        </div>
                        <span className="self-start md:self-center px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black rounded-lg uppercase tracking-wider">NOV START</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. POPULAR COURSES */}
                {activeTab === 'courses' && (
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Popular Course Clusters & Industry Salaries</h2>
                    <div className="space-y-4">
                      {[
                        { title: "Engineering & Technology", desc: "Mandatory Work-Integrated Learning (WIL) industrial placements, accredited by Engineers Australia. High demand for civil, electrical and environmental designs.", sal: "AUD 70,000 – 95,000 / yr" },
                        { title: "Computer Science & Information Technology (IT)", desc: "Focuses on AI, cloud computing, cybersecurity, and data sciences. Huge career scope across tech clusters in Sydney and Melbourne.", sal: "AUD 65,000 – 90,000 / yr" },
                        { title: "Healthcare & Life Sciences", desc: "Instant job stability and direct PR nomination pathways. Covers nursing, physiotherapy, aged care, and public health.", sal: "AUD 68,000 – 88,000 / yr" },
                        { title: "Business & Management", desc: "Move towards technical business programs like supply chain management and business analytics, outpacing general MBA programs.", sal: "AUD 60,000 – 85,000 / yr" },
                        { title: "Arts, Design & Humanities", desc: "Driven by massive population growth and urban developments. High demand for architects and regional planning professionals.", sal: "AUD 58,000 – 80,000 / yr" }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{item.title}</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-1 max-w-xl">{item.desc}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Starting Salary</span>
                            <span className="text-xs font-black text-amber-700">{item.sal}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. COST OF STUDYING */}
                {activeTab === 'costs' && (
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Estimated Costs (Tuition & Living)</h2>
                    <p className="text-slate-500 text-xs font-bold mb-6 uppercase tracking-wider">Toggled Live Exchange Rate: 1 AUD = 56.00 INR</p>
                    
                    <div className="overflow-x-auto mb-8">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                            <th className="pb-3 pr-4">Expense Type</th>
                            <th className="pb-3 pr-4">Australian Dollar (AUD)</th>
                            <th className="pb-3 pr-4 text-right">INR Equivalent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                          {[
                            { item: "Annual Tuition Fees (Avg.)", aud: 35000, inrStr: "₹ 11 Lakhs – 28 Lakhs" },
                            { item: "Mandatory Visa Proof (Living Cost)", aud: 29710, inrStr: "₹ 16.63 Lakhs" },
                            { item: "Visa Fee (Subclass 500)", aud: 2000, inrStr: "₹ 1.12 Lakhs" },
                            { item: "Health Cover (OSHC) / year", aud: 800, inrStr: "₹ 45,000" },
                            { item: "Return Airfare (Estimated)", aud: 2000, inrStr: "₹ 1.12 Lakhs" }
                          ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 text-slate-800 font-extrabold">{row.item}</td>
                              <td className="py-3.5 text-amber-700 font-black">
                                {currency === 'AUD' ? `AUD ${row.aud.toLocaleString()}` : `AUD ${row.aud.toLocaleString()}`}
                              </td>
                              <td className="py-3.5 text-right font-black text-slate-900">
                                {currency === 'INR' ? row.inrStr : `₹ ${(row.aud * exchangeRate / 100000).toFixed(2)} Lakh`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-3">
                      <Info className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-slate-655 font-semibold leading-relaxed">
                        <strong>Regional Advantage:</strong> Costs vary significantly by location. Major cities like Sydney and Melbourne are premium, while regional cities like Perth, Adelaide, and Gold Coast feature lower rentals and additional visa stay rights.
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. VISA REQUIREMENTS */}
                {activeTab === 'visa' && (
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Student Visa Subclass 500 Overview</h2>
                    <p className="text-slate-550 text-sm font-semibold mb-6">
                      The Australian visa process has become more structured and documentation-heavy. Follow this VFS-ready framework:
                    </p>

                    <div className="space-y-5 mb-6">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-705 font-black flex items-center justify-center text-xs flex-shrink-0">GS</div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">Genuine Student (GS) Requirement</h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1">Replaced GTE. Focuses on academic logic, previous study paths, course relevance, and connection to your career in India.</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-705 font-black flex items-center justify-center text-xs flex-shrink-0">$</div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">Financial Scrutiny & Funding Checks</h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1">Visa officers contact banks directly. Requires 3-month consistent history. Deposits must cover tuition + AUD 29,710 living + AUD 2,000 airfare.</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-705 font-black flex items-center justify-center text-xs flex-shrink-0">EN</div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">English Proficiency & OSHC</h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1">Direct entry requires IELTS 6.0 / PTE 50. Health cover (OSHC) must be active for the entire visa duration.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-red-955 font-semibold">
                        <strong>Rejection Risk:</strong> Study plans must have clear academic progression. Sudden large fund deposits or failing to declare previous UK/Canada visa refusals are leading causes of rejection.
                      </p>
                    </div>
                  </div>
                )}

                {/* 6. WORK & VISAS */}
                {activeTab === 'work' && (
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Work Rights & Post-Study Visas (AI-ECTA)</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                        <h4 className="font-black text-slate-900 text-sm mb-3">Bilateral Stays (AI-ECTA Agreement)</h4>
                        <ul className="space-y-2 text-xs text-slate-650 font-semibold">
                          <li className="flex justify-between border-b border-slate-200 pb-1.5"><span>Bachelor's Degree</span> <strong className="text-amber-700">Up to 2 Years</strong></li>
                          <li className="flex justify-between border-b border-slate-200 pb-1.5"><span>STEM First-Class Honours</span> <strong className="text-amber-700">Up to 3 Years</strong></li>
                          <li className="flex justify-between border-b border-slate-200 pb-1.5"><span>Master's (Course/Research)</span> <strong className="text-amber-700">Up to 3 Years</strong></li>
                          <li className="flex justify-between"><span>Doctoral (PhD) Graduates</span> <strong className="text-amber-700">Up to 4 Years</strong></li>
                        </ul>
                      </div>

                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                        <h4 className="font-black text-slate-900 text-sm mb-3">Regional Visa Extends</h4>
                        <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                          Completing studies in designated regional areas (like Adelaide, Perth, Hobart, Wollongong) grants eligibility for a Second Post-Higher Education Work Visa, providing an extra <strong>1 to 2 years</strong> of stay.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Fortnightly Work Hours Limit</h4>
                        <p className="text-xs text-slate-500 font-semibold">48 hours per fortnight during study; unlimited during breaks.</p>
                      </div>
                      <span className="px-4 py-1.5 bg-green-50 text-green-700 border border-green-150 text-[10px] font-black rounded-lg">48H LIMIT</span>
                    </div>
                  </div>
                )}

                {/* 7. SCHOLARSHIPS */}
                {activeTab === 'scholarships' && (
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Top Australia Scholarships 2026</h2>
                    <p className="text-slate-550 text-sm font-semibold mb-6">
                      Scholarships range from merit-based university fee reductions to full government-funded rides.
                    </p>

                    <div className="space-y-4">
                      {[
                        { title: "Australia Awards (Government-Funded)", detail: "Full tuition, return airfare, establishment grant, and living stipend.", type: "100% FUNDING" },
                        { title: "Maitri Scholarships (STEM PhD)", detail: "Initiative for Indian citizens pursuing clean energy, agribusiness, or healthcare PhDs. Ranges AUD 220,000 – 439,000.", type: "INR 1.2 - 2.4 CR" },
                        { title: "Research Training Program (RTP)", detail: "Masters by Research and PhD students cover full fees and receive AUD 35,000/yr living stipend.", type: "FULL FEES" },
                        { title: "UNSW International Student Award", detail: "Automatic 20% tuition fee reduction for eligible Indian students for every year.", type: "20% SAVINGS" },
                        { title: "Monash Merit & Leadership Awards", detail: "Leadership covers 100% course fees; Merit offers AUD 10,000 - 15,000 annually.", type: "VARIES" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{item.title}</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-1">{item.detail}</p>
                          </div>
                          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black rounded-lg uppercase tracking-wider">{item.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. FAQs */}
                {activeTab === 'faqs' && (
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-3.5">
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="border-b border-slate-100 pb-3.5">
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full flex items-center justify-between text-left font-extrabold text-sm text-slate-800 hover:text-amber-705 transition-colors cursor-pointer py-1"
                          >
                            <span>{faq.question}</span>
                            <HelpCircle size={16} className={`text-slate-400 transition-transform ${faqOpen[idx] ? 'rotate-180 text-amber-600' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {faqOpen[idx] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-2 text-xs text-slate-550 font-semibold leading-relaxed"
                              >
                                {faq.answer}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* INTERACTIVE UNIVERSITY FINDER */}
        <div className="mb-20" id="university-finder">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Australia University Finder</h2>
            <p className="text-slate-500 text-sm font-bold">Filter top institutions, check rankings, and compare tuition fees instantly.</p>
          </div>

          <div className="bg-white/50 border border-white rounded-[28px] p-6 backdrop-blur-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={finderSearch}
                onChange={(e) => setFinderSearch(e.target.value)}
                placeholder="Search by course (e.g. CS, MBA, Data Science), university, city..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* City Selector */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {['All', 'Melbourne', 'Sydney', 'Canberra', 'Brisbane', 'Perth', 'Adelaide'].map(city => (
                <button
                  key={city}
                  onClick={() => setFinderCity(city)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${finderCity === city ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-50 text-slate-655 hover:bg-slate-100 border border-slate-100'}`}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Tuition filter */}
            <div className="w-full md:w-auto">
                              <select
                value={finderTuition}
                onChange={(e) => setFinderTuition(e.target.value)}
                className="w-full md:w-auto bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Tuition Ranges</option>
                <option value="under40k">Under AUD 40,000 / year</option>
                <option value="under45k">Under AUD 45,000 / year</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredUniversities.map((uni) => {
                const matchedCourses = finderSearch ? getMatchedCoursesForUniversity(uni, finderSearch) : [];
                return (
                  <motion.div
                    key={uni.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/60 border border-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img 
                            src={getUniversityLogo(uni.name, uni.logo)} 
                            alt={uni.name} 
                            className="w-9 h-9 object-contain" 
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`; }} 
                          />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight hover:text-amber-705 transition-colors">{uni.name}</h4>
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                            <MapPin size={10} />
                            {uni.city}, Australia
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">QS World Rank</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{uni.rank}</p>
                        </div>
                        <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tuition Fees</p>
                          <p className="text-xs font-black text-amber-750 mt-0.5">{formatCost(uni.tuition)}</p>
                        </div>
                      </div>

                      {matchedCourses.length > 0 && (
                        <div className="mb-3 flex flex-wrap items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-xl">
                          <span className="text-[9px] font-black text-amber-700 uppercase tracking-wide">✓ Matched Course:</span>
                          {matchedCourses.slice(0, 2).map((mc, idx) => (
                            <span key={idx} className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-md shadow-xs">
                              {mc}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-slate-555 font-semibold mb-4 leading-normal bg-slate-50/20 p-2.5 rounded-xl border border-slate-100/20">
                        <strong>Edge:</strong> {uni.edge}
                      </p>
                    </div>

                    <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                      <a
                        href={uni.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors text-xs font-bold cursor-pointer"
                      >
                        Visit School
                      </a>
                      <Link
                        to={`/contact?university=${encodeURIComponent(uni.name)}`}
                        className="flex-1 text-center py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold cursor-pointer"
                      >
                        Check Eligibility
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredUniversities.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-sm">
                No universities match the current search or filters.
              </div>
            )}
          </div>
        </div>

        {/* CTA SECTION */}
        <StudyAbroadCTA country="Australia" />

      </div>
    </div>
  );
};

export default StudyInAustralia;
