import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Clock,
  Compass,
  ArrowRight,
  Award,
  ChevronRight,
  FileEdit,
  CheckCircle2,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const SATOverview = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const keyFacts = [
    { title: "Test Organizer", value: "College Board" },
    { title: "Score Range", value: "400 – 1600" },
    { title: "Exam Duration", value: "2 Hours 14 Minutes" },
    { title: "Exam Mode", value: "Digital & Adaptive" },
    { title: "Base International Fee", value: "$103 + regional fee" },
    { title: "Valid for", value: "5 Years" }
  ];

  const exploreLinks = [
    { name: 'SAT Overview', path: '/exams/sat/overview', icon: Compass, desc: 'Core guide, test structure, eligibility requirements.' },
    { name: 'SAT Syllabus', path: '/exams/sat/syllabus', icon: BookOpen, desc: 'Section-by-section breakdown for Math & Reading/Writing.' },
    { name: 'SAT Exam Fees', path: '/exams/sat/fees', icon: DollarSign, desc: 'International pricing details, cancellations, rescheduling fees.' },
    { name: 'SAT Exam Dates', path: '/exams/sat/dates', icon: Calendar, desc: 'International digital SAT test window timelines.' },
    { name: 'SAT Registration', path: '/exams/sat/registration', icon: FileEdit, desc: 'Step-by-step account configuration and center selection.' },
    { name: 'SAT Results & Scoring', path: '/exams/sat/results', icon: Award, desc: 'Score scales, target benchmarks, and reports release times.' }
  ];

  const digitalChanges = [
    "Adaptive Format: The test adapts to your performance — second stage questions depend on your score in stage one.",
    "Integrated Desmos Calculator: A powerful graphing calculator is built directly into the Bluebook testing app.",
    "Shorter Passages: Reading sections feature shorter, more focused passages with one question per passage.",
    "Fast Score Delivery: Scores are typically returned within days instead of weeks."
  ];

  const faqs = [
    { q: "What is a good SAT score for top US universities?", a: "A score of 1500+ puts you in the top tier for Ivy League and elite schools (MIT, Stanford). For top 50 public universities, a score of 1350-1450 is highly competitive." },
    { q: "How many times can I take the SAT?", a: "There are no official restrictions. You can take the SAT as many times as you like. Most students take it twice: once in the spring of 11th grade, and once in the fall of 12th grade." },
    { q: "Is the SAT digital now?", a: "Yes, starting in 2023 for international students and 2024 for US students, the SAT is exclusively digital and adaptive. You take it on a laptop or tablet using College Board's official Bluebook application." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span>Exams</span>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-bold">SAT</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          {/* Backdrop photo for rich aesthetics */}
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1516534775068-ba3e84589d90?w=1200&auto=format&fit=crop&q=80" 
              alt="SAT Student Studying" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Compass size={14} />
              Comprehensive SAT Guide 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Digital SAT Exam: The Ultimate Roadmap for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Secure admissions to elite undergraduate programs in the USA, Canada, UK, and leading Indian universities. Get verified details on dates, registration steps, adaptive syllabus, and starting prep methods.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Adaptive Format Active
              </span>
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Globe size={13} className="text-indigo-400" />
                Organized by College Board
              </span>
            </div>
          </div>
        </div>

        {/* Latest Updates Info Box */}
        <div className="flex items-center gap-4 bg-indigo-50/50 border border-indigo-100 p-5 rounded-3xl mb-12">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Info className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-850 text-sm">Key Digital SAT Update</h4>
            <p className="text-xs text-slate-655 font-semibold mt-0.5 leading-relaxed">
              The SAT is now 100% digital. It uses a multistage adaptive model where the difficulty of the second module depends on your accuracy in the first module. You must download the **Bluebook app** prior to testing.
            </p>
          </div>
        </div>

        {/* Grid of Key Facts */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {keyFacts.map((fact, idx) => (
            <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl text-center shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">{fact.title}</span>
              <span className="text-sm font-black text-slate-800">{fact.value}</span>
            </div>
          ))}
        </div>

        {/* Explorer Hub links */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={20} />
            <span>SAT Information Center</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exploreLinks.map((link, idx) => {
              const IconComp = link.icon;
              return (
                <div 
                  key={idx} 
                  onClick={() => navigate(link.path)}
                  className="bg-white border border-slate-200/60 p-6 rounded-3xl hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 group-hover:scale-105 transition-transform">
                      <IconComp size={18} />
                    </div>
                    <h3 className="text-base font-black text-slate-800 mt-4 group-hover:text-indigo-650 transition-colors">{link.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-2">{link.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-black text-indigo-650 mt-6 group-hover:gap-2 transition-all">
                    <span>Learn More</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Digital SAT key features section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Award className="text-indigo-650" size={18} />
              <span>Digital SAT Structural Enhancements</span>
            </h3>
            <div className="space-y-4">
              {digitalChanges.map((change, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-slate-655 leading-relaxed">{change}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-900 to-slate-950 text-white rounded-[2rem] p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black mb-3">Ready to Start Preparing?</h3>
              <p className="text-white/80 text-xs font-medium leading-relaxed">
                Connect with our expert SAT test prep mentors. We provide curated mock testing pipelines, diagnostic evaluations, and structured feedback sessions using official College Board patterns.
              </p>
            </div>
            <div className="mt-8">
              <Link 
                to="/exams/sat/preparation"
                className="inline-flex items-center gap-2 bg-white text-indigo-950 font-black text-xs px-6 py-3.5 rounded-2xl hover:bg-slate-50 transition-colors shadow-lg"
              >
                <span>Explore Prep Plans</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-black text-xs text-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {faqOpen[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {faqOpen[idx] && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="p-5 text-xs text-slate-500 font-semibold border-t border-slate-100 leading-relaxed bg-slate-50/30">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SATOverview;
