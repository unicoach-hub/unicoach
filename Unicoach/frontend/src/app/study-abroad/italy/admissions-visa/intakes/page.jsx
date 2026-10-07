import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, 
  HelpCircle, GraduationCap, ChevronDown, Check, BookOpen, Info, 
  FileText, DollarSign, Award, Target, Landmark, ListFilter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Italy Intakes at a Glance' },
  { id: 'september', title: 'September 2026 Intake' },
  { id: 'february', title: 'February 2026 Intake' },
  { id: 'requirements', title: 'Admission Requirements' },
  { id: 'fees-scholarships', title: 'Tuition Fees & Scholarships' },
  { id: 'steps', title: 'Application Timeline & Steps' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const intakeComparison = [
  {
    feature: "Start Date",
    september: "Mid-September to Early October",
    february: "Mid-February to Early March"
  },
  {
    feature: "Program Availability",
    september: "~80% of all courses",
    february: "~30% of courses (limited selection)"
  },
  {
    feature: "Competition",
    september: "Higher volume",
    february: "Lower volume"
  },
  {
    feature: "Scholarships",
    september: "Maximum opportunities",
    february: "Limited availability"
  },
  {
    feature: "Visa Processing",
    september: "Can be slower due to demand",
    february: "Often quicker"
  }
];

const septemberTimeline = [
  { action: "Entrance Exams (IELTS/GRE/GMAT/SAT)", timeframe: "Jan–Aug 2025", why: "Score early to meet deadlines" },
  { action: "Applications Open", timeframe: "Nov 2025 – Mar 2026", why: "Early rounds (Nov–Jan) = best scholarship chances" },
  { action: "Application Deadlines", timeframe: "May–Jun 2026", why: "Final dates for most programs" },
  { action: "Visa Application", timeframe: "May–Jul 2026", why: "Start immediately after acceptance" },
  { action: "Classes Begin", timeframe: "Sep–Oct 2026", why: "Final enrollment" }
];

const februaryTimeline = [
  { action: "Applications Open", timeframe: "Sep–Nov 2025", why: "Shorter window than September" },
  { action: "Application Deadlines", timeframe: "Nov–Dec 2025", why: "Rigid deadlines—no extensions" },
  { action: "Visa Application", timeframe: "Dec 2025 – Jan 2026", why: "Must be executed quickly" },
  { action: "Classes Begin", timeframe: "Late Feb – Early Mar 2026", why: "Final enrollment" }
];

const eligibilityCriteria = [
  { criteria: "Academic Standing", bachelors: "12th grade with 75% or GPA 3.0", masters: "Bachelor's with 7.5/10 or equivalent" },
  { criteria: "English Proficiency", bachelors: "IELTS 5.5 / TOEFL 80 (for English-taught)", masters: "IELTS 5.5 / TOEFL 80 (for English-taught)" },
  { criteria: "Italian Proficiency", bachelors: "CILS A2 / CELI B2 (for Italian-taught)", masters: "CILS A2 / CELI B2 (for Italian-taught)" }
];

const requiredDocuments = [
  { title: "Academic Transcripts & Certificates", desc: "Official school marksheets, final Bachelor's degree and transcripts." },
  { title: "Statement of Purpose (SOP)", desc: "A compelling summary of your academic background and career goals." },
  { title: "Letters of Recommendation (LORs)", desc: "1-2 letters from academic professors or professional supervisors." },
  { title: "Standardized Test Scorecards", desc: "Proof of exam scores (IELTS/TOEFL/GRE/GMAT/SAT)." },
  { title: "Valid Passport & Photos", desc: "Ensure passport has at least 1-2 years of validity left." },
  { title: "Financial Proof", desc: "Evidence of sufficient funds for tuition fees and living costs." },
  { title: "Program-Specific Requirements", desc: "Portfolio for design courses or work experience for specific Master's." }
];

const tuitionFees = [
  { type: "Public University", eur: "€500 – €4,000", inr: "₹51,790 – ₹4,14,320" },
  { type: "Private University", eur: "€6,000 – €20,000", inr: "₹6,21,480 – ₹20,71,600" }
];

const scholarshipsList = [
  { name: "Italian Government Scholarship", offeredBy: "MAECI (Ministry of Foreign Affairs)", amount: "~€9,000 (₹9,32,220)" },
  { name: "International Talents @Unibo", offeredBy: "University of Bologna", amount: "€4,500 + tuition waiver" },
  { name: "Excellence Scholarships", offeredBy: "University of Milan", amount: "~€8,000 (₹8,28,640)" },
  { name: "Padua International Excellence", offeredBy: "University of Padua", amount: "~€8,000 (₹8,28,640) per year" }
];

const applicationSteps = [
  { number: "1", title: "Research Programs", desc: "Identify universities and courses that match your goals. Check language requirements and GPA expectations." },
  { number: "2", title: "Verify Requirements", desc: "Review admission criteria for your specific programs. Requirements vary by university." },
  { number: "3", title: "Gather Documents", desc: "Collect all academic records, test scores, SOPs, LORs, and financial proof." },
  { number: "4", title: "Submit Application", desc: "Apply through the university portal. Pay the required fees." },
  { number: "5", title: "Await Decision", desc: "Track your application status closely via the portals." },
  { number: "6", title: "Apply for Visa", desc: "Secure your student visa at the Italian embassy/consulate immediately after acceptance." }
];

const faqsList = [
  { q: "How many intakes does Italy have?", a: "Italy has two main intakes: September and February. September is the primary intake with 80% of programs. February is a secondary option with fewer courses." },
  { q: "Which intake is best for Italy?", a: "September is best for most students—it offers the widest program selection, the most scholarships, and aligns with the full academic year. February works well if you need a mid-year start." },
  { q: "Does Italy have a February intake?", a: "Yes, select universities offer a February intake. The course list is smaller than September, but it's a valid option to avoid delaying your studies." },
  { q: "Is IELTS compulsory in Italy?", a: "Only if your program is English-taught. Many universities accept TOEFL, PTE, or Duolingo as alternatives. Italian-taught programs require Italian language certification instead." },
  { q: "When should I apply for a Master's in Italy?", a: "For September intake: November to March. For February intake: September to November of the previous year. Always check specific university deadlines." },
  { q: "What month does college start in Italy?", a: "September intake: late September to early October. February intake: late February to early March. Some specialized programs may have different dates—verify with your university." }
];

const ItalyIntakes = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

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

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-x-clip pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-indigo-100/20 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-emerald-300/5 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-[1440px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/italy" className="hover:text-indigo-600 transition-colors">Italy</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Intakes</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50/80 backdrop-blur-xs border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Calendar size={14} className="text-indigo-650" />
            <span>Last Updated: December 3, 2025</span>
            <span className="text-indigo-300">•</span>
            <Clock size={14} className="text-indigo-650" />
            <span>7 Min Read</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Italy Intakes 2026:{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Complete Guide</span> for International Students
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto">
            Plan your timeline accurately, unlock scholarship opportunities, and ensure academic success with our definitive intake analysis.
          </p>
        </motion.div>

        {/* Stop Guessing. Start Planning Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(16,185,129,0.15),transparent_50%)]" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-5">
              <Target size={14} />
              <span>Critical Planning Alert</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-6 tracking-tight">
              Stop Guessing. Start Planning.
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-semibold leading-relaxed mb-4">
              If you're applying to Italy for 2026, the biggest risk isn't your GPA—it's losing an entire year because of a calendar mistake.
            </p>
            <p className="text-slate-300 text-sm md:text-base font-semibold leading-relaxed mb-4">
              Here's what most guides won't tell you: the intake you choose determines everything—from program availability to scholarship access to visa success.
            </p>
            <p className="text-emerald-400 text-sm md:text-base font-extrabold leading-relaxed">
              Let's cut through the confusion and get you on the right track.
            </p>
          </div>
        </motion.div>

        {/* 2 Column Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] xl:grid-cols-[1fr_360px] gap-8 xl:gap-12">
          
          {/* Main Content Area */}
          <div className="space-y-16 min-w-0">
            
            {/* Section 1: Italy Intakes at a Glance */}
            <section id="overview" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">01</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Italy Intakes at a Glance</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Italy offers two main annual intakes. But here's the truth—they are not equal.
              </p>

              {/* Comparison Table */}
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Feature</th>
                        <th className="p-5 font-black text-indigo-700 text-xs uppercase tracking-wider bg-indigo-50/30">Fall/Autumn Intake (September)</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">Spring/Winter Intake (February)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {intakeComparison.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-slate-900 font-bold">{row.feature}</td>
                          <td className="p-5 text-indigo-900 bg-indigo-50/10 font-bold">{row.september}</td>
                          <td className="p-5 text-slate-600">{row.february}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Insight Info Card */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                <Info className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-indigo-950 font-black text-sm mb-1">Key Insight</h4>
                  <p className="text-indigo-900 text-xs md:text-sm font-semibold leading-relaxed">
                    The Fall intake holds the majority of courses and nearly all major scholarship slots. For competitive students, it's the default choice. The Spring intake is a strategic alternative—not a backup.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: September 2026 Intake */}
            <section id="september" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">02</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">September 2026 Intake: The Primary Choice</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                The September intake is Italy's main academic start date. It aligns with the traditional academic calendar and offers the widest range of options.
              </p>

              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Award className="text-indigo-600" size={18} />
                Why Choose September?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Check size={20} className="stroke-[3]" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">80% Courses Available</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Includes competitive programs like Engineering, Architecture, and specialized Master's degrees.
                  </p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center mb-4">
                    <GraduationCap size={20} />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Best Scholarship Access</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Most institutional and regional funding is allocated in the early rounds of the Fall intake.
                  </p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Target size={20} />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Better Job Alignment</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Perfectly matches summer internship cycles and post-graduation recruitment schedules.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={18} />
                Application Timeline for September 2026 Start
              </h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Action</th>
                        <th className="p-5 font-black text-indigo-700 text-xs uppercase tracking-wider bg-indigo-50/30">Timeframe</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">Why It Matters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {septemberTimeline.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-slate-900 font-bold">{row.action}</td>
                          <td className="p-5 text-indigo-900 bg-indigo-50/10 font-bold whitespace-nowrap">{row.timeframe}</td>
                          <td className="p-5 text-slate-500">{row.why}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Critical Tip Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-amber-950 font-black text-sm mb-1">Critical Tip</h4>
                  <p className="text-amber-900 text-xs md:text-sm font-semibold leading-relaxed">
                    For competitive Master's programs, apply in the earliest rounds (November–January). Most scholarships are allocated during this window.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: February 2026 Intake */}
            <section id="february" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">03</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">February 2026 Intake: The Strategic Alternative</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                The Spring intake offers a second entry point. It's ideal if you missed September deadlines or need extra preparation time.
              </p>

              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Award className="text-indigo-600" size={18} />
                Why Choose February?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center mb-4">
                    <Clock size={20} />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Quicker Visa Processing</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Lower application volumes mean faster visa turnaround and less wait time at the embassy.
                  </p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Target size={20} />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Less Competition</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Fewer candidates apply in Spring, yielding higher acceptance probabilities for selected programs.
                  </p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Calendar size={20} />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">No Year Lost</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Avoid waiting a whole calendar year if you miss the Autumn deadlines. Start your studies mid-year.
                  </p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Smoother Transition</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Smaller cohorts allow more focused attention from advisors and administrative offices.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={18} />
                Application Timeline for February 2026 Start
              </h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Action</th>
                        <th className="p-5 font-black text-indigo-700 text-xs uppercase tracking-wider bg-indigo-50/30">Timeframe</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">Why It Matters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {februaryTimeline.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-slate-900 font-bold">{row.action}</td>
                          <td className="p-5 text-indigo-900 bg-indigo-50/10 font-bold whitespace-nowrap">{row.timeframe}</td>
                          <td className="p-5 text-slate-500">{row.why}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 4: Admission Requirements */}
            <section id="requirements" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">04</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Admission Requirements for Indian Students</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Before you apply, ensure you meet the minimum eligibility requirements and gather all mandatory document dossiers.
              </p>

              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="text-indigo-600" size={18} />
                Eligibility Criteria
              </h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Criteria</th>
                        <th className="p-5 font-black text-slate-850 text-xs uppercase tracking-wider">Bachelor's Programs</th>
                        <th className="p-5 font-black text-slate-850 text-xs uppercase tracking-wider">Master's Programs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {eligibilityCriteria.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-slate-900 font-bold">{row.criteria}</td>
                          <td className="p-5 text-slate-600">{row.bachelors}</td>
                          <td className="p-5 text-slate-600">{row.masters}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="text-indigo-600" size={18} />
                Required Documents
              </h3>
              <p className="text-slate-550 text-xs font-semibold mb-6">
                Submit these carefully—missing one can derail your entire application:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
                    <span className="w-6 h-6 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs mb-1">{doc.title}</h4>
                      <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">{doc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Tuition Fees & Scholarships */}
            <section id="fees-scholarships" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">05</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Tuition Fees & Scholarships</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Italy remains one of Europe's more affordable study destinations. Costs vary significantly between public and private universities.
              </p>

              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="text-indigo-600" size={18} />
                Average Annual Tuition Fees
              </h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">University Type</th>
                        <th className="p-5 font-black text-indigo-700 text-xs uppercase tracking-wider bg-indigo-50/30">Tuition Fees (EUR)</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">Tuition Fees (INR approx.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {tuitionFees.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-slate-900 font-bold">{row.type}</td>
                          <td className="p-5 text-indigo-900 bg-indigo-50/10 font-bold">{row.eur}</td>
                          <td className="p-5 text-slate-600">{row.inr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-8">
                Note: INR values approximate (1 EUR ≈ 103.58 INR). Check current rates when planning.
              </p>

              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Landmark className="text-indigo-600" size={18} />
                Top Scholarships for Indian Students
              </h3>
              <p className="text-slate-550 text-xs font-semibold mb-6">
                Apply early—most scholarships are awarded in the first application rounds.
              </p>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Scholarship</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">Offered By</th>
                        <th className="p-5 font-black text-emerald-700 text-xs uppercase tracking-wider bg-emerald-50/30">Award Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {scholarshipsList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-slate-900 font-bold">{row.name}</td>
                          <td className="p-5 text-slate-600">{row.offeredBy}</td>
                          <td className="p-5 text-emerald-900 bg-emerald-50/10 font-bold">{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 6: Steps & Tips */}
            <section id="steps" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">06</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Application Steps & Strategic Tips</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Follow these structured steps to stay organized and avoid registration or visa-processing bottlenecks.
              </p>

              {/* Numbered Steps Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {applicationSteps.map((step, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-[20px] p-6 hover:shadow-md transition-shadow relative">
                    <span className="absolute top-4 right-6 text-4xl font-black text-slate-100/80 pointer-events-none select-none">
                      0{step.number}
                    </span>
                    <h4 className="font-extrabold text-indigo-700 text-xs uppercase tracking-wider mb-2">
                      Step {step.number}
                    </h4>
                    <h5 className="font-black text-slate-900 text-sm mb-3">
                      {step.title}
                    </h5>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Strategic Tips for both Intakes */}
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={18} />
                Strategic Tips for Both Intakes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50/20 border border-indigo-100 rounded-2xl p-6">
                  <h4 className="font-black text-indigo-950 text-sm mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    For September Applicants
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="text-indigo-600 shrink-0 font-black">✓</span>
                      <span>Apply in November–January rounds for maximum scholarship access</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="text-indigo-600 shrink-0 font-black">✓</span>
                      <span>Complete English/Italian certifications by July 31</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="text-indigo-600 shrink-0 font-black">✓</span>
                      <span>Treat the Universitaly Pre-Enrollment and visa process as your biggest bottleneck</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-emerald-50/80 to-blue-50/20 border border-emerald-100 rounded-2xl p-6">
                  <h4 className="font-black text-emerald-950 text-sm mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    For February Applicants
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="text-emerald-600 shrink-0 font-black">✓</span>
                      <span>Use it strategically—not as a fallback but as a smart alternative</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="text-emerald-600 shrink-0 font-black">✓</span>
                      <span>Enjoy faster visa processing with reduced applicant load</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                      <span className="text-emerald-600 shrink-0 font-black">✓</span>
                      <span>Target specific programs that explicitly accept Spring entry</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 7: FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">07</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Find swift answers to the most common queries regarding Italy study intakes, IELTS requirements, and timelines.
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
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-indigo-750 transition-colors gap-4"
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
                            <div className="px-5 pb-5 pt-1 text-slate-500 text-xs md:text-sm font-semibold leading-relaxed border-t border-slate-50">
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

            {/* Custom CTA Widget within article */}
            <div className="mt-12">
              <StudyAbroadCTA country="Italy" />
            </div>

            {/* Disclaimer */}
            <p className="text-slate-400 text-[10px] font-semibold leading-relaxed text-center mt-6">
              Disclaimer: Dates, fees, and scholarship amounts are approximate and subject to change. Always verify with official university sources.
            </p>

          </div>

          {/* Sticky Sidebar (Table of Contents) */}
          <aside className="hidden lg:block relative h-full">
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-xs">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-5 flex items-center gap-2">
                  <ListFilter size={14} className="text-indigo-600" />
                  Table of Contents
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
                  Need Help Navigating Timelines?
                </h5>
                <p className="text-white/80 text-[11px] font-semibold leading-relaxed mb-5">
                  Our team at UniCoach can guide you through every application, document preparation, and visa step.
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

export default ItalyIntakes;
