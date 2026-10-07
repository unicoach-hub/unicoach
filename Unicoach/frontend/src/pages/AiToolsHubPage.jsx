import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Compass, Award, FileText, Mic, 
  GraduationCap, Calculator, ArrowRight, ShieldCheck, 
  Clock, CheckCircle2, Zap, Target, Volume2, 
  ArrowUpRight, Play, Check, ChevronRight, BarChart3,
  Sliders, Search, Layers, RefreshCw, Star
} from 'lucide-react';
import Interactive3DGrid from '../components/Interactive3DGrid';
import { useLead } from '../context/LeadContext';
import { HeroBackButton } from '../components/ui/BackButton';

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All AI Tools' },
  { id: 'admissions', label: '🎓 University & Scholarships' },
  { id: 'documents', label: '📝 SOP & Roadmap' },
  { id: 'interview-exams', label: '🎙️ Visa & IELTS Prep' },
];

const AiToolsHubPage = () => {
  const { openEligibilityModal } = useLead();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sopTopic, setSopTopic] = useState('cs');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI Study Abroad Suite | SOP Writer, Visa Prep, University Radar | UniCoach';
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[76px] pb-24 text-slate-900 font-sans selection:bg-orange-100 selection:text-blue-900">
      
      {/* ── 1. CINEMATIC HERO SECTION ── */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EBF2FF] via-[#F4F7FD] to-[#F8FAFC] border-b border-slate-200/80 overflow-hidden">
        <HeroBackButton fallback="/" />
        <Interactive3DGrid gridSize={52} />
        
        {/* Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[380px] bg-radial from-orange-200/40 via-amber-100/25 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-orange-200/90 shadow-2xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DE5C2B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DE5C2B]"></span>
            </span>
            <span className="text-[12px] font-bold text-[#DE5C2B] tracking-wide uppercase">
              Next-Gen AI Study Abroad Suite
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.12]">
            Intelligent Tools Built for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] via-orange-600 to-amber-600">
              Global University Aspirants
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Replace guesswork with algorithmic accuracy. From university shortlists and live scholarship radars to AI SOP drafting and voice-powered consular visa simulations.
          </p>

          {/* Key Metrics Pill */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <Sparkles size={14} className="text-[#DE5C2B]" />
              <span>7 Specialized AI Tools</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>50,000+ Profiles Processed</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <ShieldCheck size={14} className="text-indigo-500" />
              <span>100% Free Access</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="pt-6 flex items-center justify-center flex-wrap gap-2">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#DE5C2B] text-white shadow-md shadow-orange-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── 2. VISUAL BENTO GRID WITH IMAGES & INTERACTIVE PREVIEWS ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">

          {/* ════ CARD 1: AI SOP WRITER (Bento 2-Col Wide with Split Image) ════ */}
          {(activeCategory === 'all' || activeCategory === 'documents') && (
            <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              
              {/* Subtle Ambient Card Gradient */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left content (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/70 flex items-center justify-center shadow-2xs">
                        <FileText size={24} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                          Admissions Committee Standard
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          AI Statement of Purpose (SOP) Writer
                        </h2>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Generates committee-ready, university-tailored Statements of Purpose with precise academic hooks, project research alignments, and career trajectory mapping.
                  </p>

                  {/* Interactive Simulated UI Preview */}
                  <div className="bg-slate-900 rounded-2xl p-4 sm:p-4.5 text-slate-100 border border-slate-800 shadow-inner space-y-2.5 font-mono">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                        <span className="text-[11px] text-slate-400 ml-1.5 font-sans font-medium">Prompt Draft</span>
                      </div>
                      <div className="flex gap-1.5 font-sans">
                        <button 
                          onClick={() => setSopTopic('cs')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${sopTopic === 'cs' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          MS CS
                        </button>
                        <button 
                          onClick={() => setSopTopic('mba')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${sopTopic === 'mba' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          Global MBA
                        </button>
                      </div>
                    </div>

                    <div className="text-[11.5px] sm:text-[12.5px] text-slate-300 leading-relaxed font-sans">
                      {sopTopic === 'cs' ? (
                        <>
                          <p className="text-purple-300 font-semibold mb-0.5">
                            "Bridging Distributed Systems & Scalable Machine Learning Architectures"
                          </p>
                          <p className="text-slate-400 text-xs line-clamp-2">
                            Having engineered streaming pipelines processing 1.4M events/sec, my aspiration at 
                            <span className="text-white font-medium"> Northeastern University</span> is to deepen research under Dr. Walker's Distributed AI Lab...
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-purple-300 font-semibold mb-0.5">
                            "Strategic Scaling & Venture Capital in Cross-Border Tech"
                          </p>
                          <p className="text-slate-400 text-xs line-clamp-2">
                            Leading product operations across 4 Southeast Asian markets exposed the critical gap in tech unit economics. My goal at 
                            <span className="text-white font-medium"> INSEAD</span> is to synthesize venture valuation models...
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-1 font-sans border-t border-slate-800/80">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 size={12} /> 100% Unique • Plagiarism Free
                      </span>
                      <span className="text-slate-500">Output: 850 Words</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      ✓ Instant Word & PDF Copy
                    </span>
                    <Link
                      to="/ai-tools/sop-generator"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all"
                    >
                      <span>Launch AI SOP Writer</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                </div>

                {/* Right Visual Image (5 cols) */}
                <div className="lg:col-span-5 relative h-64 sm:h-72 lg:h-full min-h-[250px] rounded-2xl overflow-hidden border border-purple-100 shadow-md">
                  <img
                    src="/images/story_step2_sop.webp"
                    alt="Student Writing Statement of Purpose with AI"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10.5px] font-extrabold text-purple-700 shadow-2xs border border-purple-200">
                    ✨ Ivy-League Standard
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-white space-y-1">
                    <div className="flex items-center justify-between text-[10.5px] text-purple-300 font-bold">
                      <span>Committee Acceptance</span>
                      <span className="text-emerald-400 font-extrabold">99.2% Rate</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-200 leading-snug">
                      Tailored for Harvard, Stanford, Northeastern, Oxford & TU Munich
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ════ CARD 2: AI VISA MOCK INTERVIEW SIMULATOR (1-Col with Photo Header) ════ */}
          {(activeCategory === 'all' || activeCategory === 'interview-exams') && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
              
              <div className="space-y-3.5">
                
                {/* Visual Header Image Banner */}
                <div className="relative h-40 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden bg-slate-100">
                  <img
                    src="/images/story_step4_visa.webp"
                    alt="AI Visa Mock Interview Session"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <Mic size={16} />
                    </div>
                    <span className="text-xs font-black text-white drop-shadow">US F-1 & Consular Simulator</span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                    <span className="bg-emerald-500/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold">
                      VO Question Bank
                    </span>
                    <span className="text-emerald-300 font-bold">Speech & Risk Scorer</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    AI Visa Mock Interview
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Practice real consular questions with instant scoring on confidence, financial proof, and return-intent.
                  </p>
                </div>

                {/* Simulated Consular Voice UI */}
                <div className="bg-slate-900 rounded-2xl p-3.5 text-white border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10.5px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Consular Officer Prompt
                    </span>
                    <span className="text-[10.5px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">USA F-1</span>
                  </div>

                  <p className="text-[11.5px] font-medium text-slate-200 leading-snug">
                    "Why did you choose this university, and what are your exact career plans upon graduation?"
                  </p>

                  {/* Simulated Metrics Card */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-800/80 p-2 rounded-xl text-center text-[10px]">
                    <div>
                      <span className="block text-slate-400 text-[8.5px] uppercase font-bold">Confidence</span>
                      <span className="font-extrabold text-emerald-400 text-xs">94%</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[8.5px] uppercase font-bold">Risk Level</span>
                      <span className="font-extrabold text-emerald-400 text-xs">Low (0.1)</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[8.5px] uppercase font-bold">Return Intent</span>
                      <span className="font-extrabold text-blue-400 text-xs">Strong</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/ai-tools/visa-prep"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                >
                  <span>Start Mock Interview</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 3: IELTS AI EXAMINER (1-Col with Photo Header) ════ */}
          {(activeCategory === 'all' || activeCategory === 'interview-exams') && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
              
              <div className="space-y-3.5">
                
                {/* Visual Header Image Banner */}
                <div className="relative h-40 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
                    alt="IELTS Preparation and AI Writing Evaluation"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-md">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-xs font-black text-white drop-shadow">Cambridge Criteria Examiner</span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                    <span className="bg-teal-500/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold">
                      Task 1 & Task 2
                    </span>
                    <span className="text-teal-300 font-bold">Instant Scoring</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    IELTS Writing AI Examiner
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Evaluate essays instantly against official Cambridge descriptors: Task Response, Cohesion, Lexical Resource & Grammar.
                  </p>
                </div>

                {/* Simulated Band Score Card */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Predicted Score:</span>
                    <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                      Band 7.5
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[10.5px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Task Response</span>
                      <span className="font-bold text-slate-800">8.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full w-[88%]" />
                    </div>

                    <div className="flex justify-between text-slate-600 pt-0.5">
                      <span>Lexical Resource</span>
                      <span className="font-bold text-slate-800">7.5</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full w-[78%]" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/ai-tools/ielts-evaluator"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
                >
                  <span>Evaluate Essay Instantly</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 4: UNIVERSITY RADAR & SHORTLISTER (2-Col Wide with Split Image) ════ */}
          {(activeCategory === 'all' || activeCategory === 'admissions') && (
            <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left Content (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#DE5C2B] border border-orange-200/70 flex items-center justify-center shadow-2xs">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#DE5C2B] uppercase tracking-wider block">
                        Algorithmic Admissions Engine
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        University Finder & Shortlister
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Map your GPA, budget, and test scores across 1,500+ universities in USA, UK, Canada, Germany & Australia. Auto-categorize universities into Safe, Target, and Dream institutions.
                  </p>

                  {/* Simulated 3-Tier Admission Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    
                    <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 text-left space-y-0.5">
                      <span className="text-[10px] font-black text-emerald-800 uppercase block">🟢 Safe (92% Fit)</span>
                      <p className="text-xs font-bold text-slate-800">ASU • SUNY Buffalo</p>
                      <p className="text-[10px] text-slate-500">GPA 7.5+ | No GRE</p>
                    </div>

                    <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-200/80 text-left space-y-0.5">
                      <span className="text-[10px] font-black text-blue-800 uppercase block">🟡 Target (68% Fit)</span>
                      <p className="text-xs font-bold text-slate-800">Northeastern • NYU</p>
                      <p className="text-[10px] text-slate-500">GRE 312+ | High Co-op</p>
                    </div>

                    <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-200/80 text-left space-y-0.5">
                      <span className="text-[10px] font-black text-purple-800 uppercase block">🔴 Dream (34% Fit)</span>
                      <p className="text-xs font-bold text-slate-800">Georgia Tech • CMU</p>
                      <p className="text-[10px] text-slate-500">Top 10 Global Rank</p>
                    </div>

                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Filters: Tuition, QS Rank, GPA, STEM OPT, Co-op
                    </span>
                    <Link
                      to="/universities"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
                    >
                      <span>Launch University Radar</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                </div>

                {/* Right Visual Image (5 cols) */}
                <div className="lg:col-span-5 relative h-64 sm:h-72 lg:h-full min-h-[250px] rounded-2xl overflow-hidden border border-orange-100 shadow-md">
                  <img
                    src="/images/story_step1_shortlisting.webp"
                    alt="University Shortlisting and Campus Matching"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                  
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10.5px] font-extrabold text-[#DE5C2B] shadow-2xs border border-orange-200">
                    1,500+ Global Unis
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-white space-y-1">
                    <div className="flex items-center justify-between text-[10.5px] text-orange-300 font-bold">
                      <span>Live Shortlisting</span>
                      <span className="text-emerald-400 font-extrabold">Instant Match</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-200 leading-snug">
                      Filter by post-study work permits, fee waivers & starting salaries
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ════ CARD 5: SCHOLARSHIPS TRACKER (1-Col with Photo Header) ════ */}
          {(activeCategory === 'all' || activeCategory === 'admissions') && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
              
              <div className="space-y-3.5">
                
                {/* Visual Header Image Banner */}
                <div className="relative h-40 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden bg-slate-100">
                  <img
                    src="/images/story_step3_loans.webp"
                    alt="Scholarship & Aid Radar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                      <Award size={16} />
                    </div>
                    <span className="text-xs font-black text-white drop-shadow">Live Cutoff Clocks</span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                    <span className="bg-amber-500/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold">
                      450+ Active Grants
                    </span>
                    <span className="text-amber-300 font-bold">100% Fee Waivers</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Scholarships Tracker
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Discover merit and need-based international scholarships with live countdown timers and Google Calendar sync.
                  </p>
                </div>

                {/* Simulated Live Scholarship Card */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-amber-800">DAAD Helmut-Schmidt</span>
                    <span className="text-rose-600 font-extrabold flex items-center gap-1">
                      <Clock size={11} /> 14d : 08h left
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">100% Tuition Fee Waiver + €934/mo</p>
                  <p className="text-[10px] text-slate-500">For Master’s in Public Policy & Tech Governance</p>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/scholarships"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all"
                >
                  <span>Track 450+ Scholarships</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 6: 6-MONTH STRATEGIC ROADMAP (1-Col with Photo Header) ════ */}
          {(activeCategory === 'all' || activeCategory === 'documents') && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
              
              <div className="space-y-3.5">
                
                {/* Visual Header Image Banner */}
                <div className="relative h-40 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                    alt="Study Abroad Journey Roadmap"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#DE5C2B] text-white flex items-center justify-center shadow-md">
                      <Compass size={16} />
                    </div>
                    <span className="text-xs font-black text-white drop-shadow">Milestone Engine</span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                    <span className="bg-[#DE5C2B]/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold">
                      Intake 2026 Ready
                    </span>
                    <span className="text-orange-300 font-bold">Week-by-Week</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    AI 6-Month Roadmap
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Personalized month-by-month timeline synchronizing test bookings, priority deadlines & embassy slots.
                  </p>
                </div>

                {/* Simulated Milestone Timeline */}
                <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9.5px] font-bold">1</span>
                    <span>Month 1: Diagnostic & Shortlisting</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#DE5C2B] font-bold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-orange-100 text-[#DE5C2B] flex items-center justify-center text-[9.5px] font-bold">2</span>
                    <span>Month 2-3: SOP & LOR Drafts (Active)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9.5px] font-bold">3</span>
                    <span>Month 4: Visa Prep & Financials</span>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/ai-tools/study-roadmap"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
                >
                  <span>Build Custom Timeline</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 7: ADMISSION & SCHOLARSHIP CALCULATOR (1-Col with Photo Header) ════ */}
          {(activeCategory === 'all' || activeCategory === 'admissions') && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
              
              <div className="space-y-3.5">
                
                {/* Visual Header Image Banner */}
                <div className="relative h-40 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden bg-slate-100">
                  <img
                    src="/images/counselor_student_meeting.webp"
                    alt="Admission Calculator and Profile Review"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                      <Calculator size={16} />
                    </div>
                    <span className="text-xs font-black text-white drop-shadow">Admit & Aid Calculator</span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                    <span className="bg-rose-500/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold">
                      Instant ROI
                    </span>
                    <span className="text-rose-300 font-bold">60-Sec Evaluation</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Profile Fit Calculator
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Calculate your exact admission probability, expected scholarship aid percentage, and post-graduation ROI.
                  </p>
                </div>

                {/* Simulated Metric Sliders */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-slate-600 font-semibold">Admit Probability:</span>
                    <span className="text-emerald-700 font-extrabold">86% (High)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[86%]" />
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] pt-0.5 text-slate-600">
                    <span>Expected Aid:</span>
                    <span className="font-extrabold text-[#DE5C2B]">₹18.5 Lakhs ($22k)</span>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/eligibility-calculator"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all"
                >
                  <span>Check Admission Fit</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* ── 3. BOTTOM COUNSELING STRIP ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0B2068] p-8 sm:p-12 text-white shadow-2xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE5C2B]/20 border border-orange-400/30 text-orange-300 text-xs font-bold">
              <Sparkles size={14} /> AI Analysis + Human Expertise
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Combine AI Intelligence with Certified Counselor Guidance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Use our AI tools to draft and analyze, then book a 1-on-1 session with our senior advisors to verify university shortlists, deadlines, and visa interview strategies.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openEligibilityModal('AI Tools Hub Bottom Banner')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <span>Book Free 1-on-1 Strategy Call</span>
                <ArrowRight size={16} />
              </button>

              <Link
                to="/universities"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
              >
                <span>Explore 1,500+ Universities</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AiToolsHubPage;
