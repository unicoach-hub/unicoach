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
import StudyAbroadCTA from '../../../components/StudyAbroadCTA';

const DuolingoOverview = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState({});
  const [activeSlider, setActiveSlider] = useState(0);

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const keyFacts = [
    { title: "Test Cost (INR)", value: "Rs. 6,499 ($70)" },
    { title: "Score Scale", value: "10 – 160" },
    { title: "Exam Duration", value: "~60 Minutes" },
    { title: "Test Mode", value: "Online from home" },
    { title: "Score Sending", value: "Unlimited, Free" },
    { title: "Results turnaround", value: "48 Hours" }
  ];

  const exploreLinks = [
    { name: 'Duolingo Overview', path: '/exams/duolingo/overview', icon: Compass, desc: 'DET overview, basic requirements, and score structure.' },
    { name: 'Duolingo Syllabus', path: '/exams/duolingo/syllabus', icon: BookOpen, desc: 'DET section breakdowns: Adaptive test, Writing & Speaking samples.' },
    { name: 'Duolingo Exam Fees', path: '/exams/duolingo/fees', icon: DollarSign, desc: 'Exam fees in INR, bundles, and score sharing savings.' },
    { name: 'Duolingo Registration', path: '/exams/duolingo/registration', icon: FileEdit, desc: 'Aadhaar / Passport validation checklist and phone camera setup.' },
    { name: 'Duolingo Results', path: '/exams/duolingo/results', icon: Award, desc: 'IELTS score comparison bands and DET subscores.' }
  ];

  const sliders = [
    {
      title: "1. What is DET & Why Choose It?",
      desc: "DET is an online English proficiency test evaluating Reading, Writing, Listening, and Speaking in 60 minutes. Indian students choose it for its Rs. 6,499 ($70) low cost, 48-hour results, and the comfort of testing from home.",
      insight: "India is now the largest test-taking population globally. Over 6,000 institutions accept DET for undergraduate and postgraduate entries."
    },
    {
      title: "2. Duolingo English Test Fees",
      desc: "DET fee is $70 (~Rs. 6,499). Alternatively, you can purchase a 2-test bundle for $118 (~Rs. 10,955) which brings sittings down to Rs. 5,478 each. Score reports can be shared with unlimited universities for free.",
      insight: "Unlike IELTS, payment must be processed by credit/debit card with international transaction rights enabled. UPI is not supported."
    },
    {
      title: "3. Test Format & July 2025 Update",
      desc: "Comprises onboarding checks (5 mins), an Adaptive Test (45 mins), and a Writing & Speaking sample (10 mins). The July 2025 update removed 'Read Aloud' and 'Listen, Then Speak', replacing them with 'Interactive Speaking' (6 conversational prompts with 35 secs each).",
      insight: "Interactive Speaking provides zero preparation time. You must practice speaking on random prompts without pausing."
    },
    {
      title: "4. Scoring Scales & Subscores",
      desc: "DET reports a total score of 10-160, plus 8 subscores (Comprehension, Literacy, Conversation, Production, etc.). In early 2025, Duolingo revised its scoring conversion table: a DET 120 now equates to IELTS 6.5, not 7.0 as older guides state.",
      insight: "Production (Speaking + Writing) is consistently the lowest subscore for Indian test-takers. Practice typing speed to hit 40-60 WPM."
    },
    {
      title: "5. Visa & Country Acceptance",
      desc: "DET is highly accepted for admissions in the US, Canada, and Ireland. However, it is not accepted for UK student visas (requires UKVI SELT) or Australian immigration.",
      insight: "A university may accept DET for admission, but the visa center might reject it. Verify your visa pathway before registering."
    }
  ];

  const faqs = [
    { q: "Is the Duolingo English Test accepted for US F-1 student visas?", a: "Yes. While the US visa office does not evaluate your English test scores directly, your university must issue you an I-20 based on DET. Once you have the I-20, your visa route is secure." },
    { q: "Can I use DET for a UK student visa in 2026?", a: "No. UK Visas and Immigration (UKVI) requires a Secure English Language Test (SELT) like IELTS UKVI or PTE Academic UKVI. DET is not currently accepted." },
    { q: "What is a good DET score for top universities?", a: "A score of 120+ is equivalent to IELTS 6.5 and is sufficient for most universities. Elite departments or Ivy League colleges expect 130+." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-655 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-slate-400" />
          <span>Exams</span>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-black">Duolingo</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          {/* Backdrop photo for rich aesthetics */}
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80" 
              alt="Duolingo Home Study" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Compass size={14} />
              Duolingo English Test (DET) 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Duolingo English Test (DET) 2026: Fees, Dates, Test Format & Results
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Save up to Rs. 15,000 on registration and scoring. Complete guide on DET fee in rupees, July 2025 interactive upgrades, and 4-week preparation guidelines.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: June 19, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Globe size={13} className="text-indigo-400" />
                6,000+ Accepted Institutions
              </span>
            </div>
            <Link
              to="/exams/duolingo/practice-test"
              className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 hover:bg-orange-50 text-sm font-bold transition-colors"
            >
              Take the free practice test
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {keyFacts.map((fact, idx) => (
            <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl text-center shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">{fact.title}</span>
              <span className="text-sm font-black text-slate-800">{fact.value}</span>
            </div>
          ))}
        </div>

        {/* Interactive Guide Slider */}
        <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 mb-16 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">Duolingo Exam Key Highlights</h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">Scroll through the slider to explore essential requirements and updates.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveSlider(prev => Math.max(0, prev - 1))}
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-250/60 text-slate-700 transition-all cursor-pointer font-bold disabled:opacity-50"
                disabled={activeSlider === 0}
              >
                ←
              </button>
              <button 
                onClick={() => setActiveSlider(prev => Math.min(sliders.length - 1, prev + 1))}
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center border border-slate-250/60 text-slate-700 transition-all cursor-pointer font-bold disabled:opacity-50"
                disabled={activeSlider === sliders.length - 1}
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-black text-slate-800">{sliders[activeSlider].title}</h3>
              <p className="text-slate-655 text-xs md:text-sm leading-relaxed font-semibold">{sliders[activeSlider].desc}</p>
            </div>
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-indigo-700 font-black uppercase tracking-wider block mb-2">Mentor Strategy</span>
                <p className="text-slate-600 text-xs font-semibold leading-relaxed">{sliders[activeSlider].insight}</p>
              </div>
              <div className="text-[11px] text-slate-400 font-bold mt-4">
                Section {activeSlider + 1} of {sliders.length}
              </div>
            </div>
          </div>
        </div>

        {/* Links to Info Hub */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={20} />
            <span>Duolingo Detailed Resources</span>
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
                    <span>Read Details</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Week Prep Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xs">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="text-indigo-650" size={18} />
              <span>4-Week Action Study Plan</span>
            </h3>
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 font-black text-indigo-750">1</span>
                <div>
                  <h4 className="font-bold text-slate-800">Week 1: Format & Diagnostic Practice</h4>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">Take the official practice test on englishtest.duolingo.com to find your baseline. Familiarize yourself with the 19 question types.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 font-black text-indigo-750">2</span>
                <div>
                  <h4 className="font-bold text-slate-800">Week 2: Target Weak Subscores</h4>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">Focus on writing and speaking modules (Production score is typically the lowest). Practise typing to reach 40+ WPM on your laptop keyboard.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 font-black text-indigo-750">3</span>
                <div>
                  <h4 className="font-bold text-slate-800">Week 3: Full Length Mocks</h4>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">Attempt 2 to 3 full practice mock sittings under real testing conditions (silent room, strict timing, closed background apps).</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 font-black text-indigo-750">4</span>
                <div>
                  <h4 className="font-bold text-slate-800">Week 4: Pacing & Technical Dry-run</h4>
                  <p className="text-slate-500 mt-0.5 leading-relaxed">Run a complete system check (webcam calibration, secondary phone camera propping, and background tool checks). Sit the exam.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-900 to-slate-950 text-white rounded-[2rem] p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black mb-3">Duolingo Masterclass</h3>
              <p className="text-white/80 text-xs font-semibold leading-relaxed">
                Connect with our test prep coaches. We provide downloadable mock tests, specialized grammar/vocabulary drill files, and feedback loops on timed speaking prompts.
              </p>
            </div>
            <div className="mt-8">
              <Link 
                to="/exams/duolingo/preparation"
                className="inline-flex items-center gap-2 bg-white text-indigo-950 font-black text-xs px-6 py-3.5 rounded-2xl hover:bg-slate-50 transition-colors shadow-lg"
              >
                <span>Join Free Masterclass</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs">
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

        {/* Study Abroad CTA */}
        <StudyAbroadCTA country="Duolingo" />

      </div>
    </div>
  );
};

export default DuolingoOverview;
