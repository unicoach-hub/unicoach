import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, BookOpen, Award, Sparkles, CheckCircle2, 
  ArrowRight, Search, Clock, FileText, Globe, Zap, 
  Calendar, Check, ChevronRight, HelpCircle, PhoneCall 
} from 'lucide-react';
import Interactive3DGrid from '../components/Interactive3DGrid';
import { useLead } from '../context/LeadContext';

const EXAMS_DATA = [
  {
    id: 'ielts',
    name: 'IELTS Academic',
    type: 'English Language Proficiency',
    tag: 'Most Popular Worldwide',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    scoreRange: 'Band 0.0 - 9.0',
    typicalCutoff: 'Band 6.5 - 7.5',
    duration: '2 Hours 45 Mins',
    format: 'Computer / Paper-Based',
    accepted: '140+ Countries (UK, Canada, Australia, USA, Ireland)',
    fee: '~₹17,000 ($200)',
    validity: '2 Years',
    overviewPath: '/exams/ielts',
    syllabusPath: '/exams/ielts/syllabus',
    practicePath: '/exams/ielts/practice-test',
    feesPath: '/exams/ielts/fees',
    features: ['Listening, Reading, Writing, Speaking', '1-on-1 human speaking interview', 'Accepted by 12,500+ institutions'],
    aiTool: {
      name: 'IELTS AI Writing Examiner',
      path: '/ai-tools/ielts-evaluator',
      badge: 'Official Band Scoring'
    }
  },
  {
    id: 'pte',
    name: 'PTE Academic',
    type: 'English Language Proficiency',
    tag: 'Fastest Results (48 Hrs)',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    scoreRange: '10 - 90 Points',
    typicalCutoff: '58 - 68 Points',
    duration: '2 Hours',
    format: '100% Computer-Based (AI Scored)',
    accepted: 'Australia, NZ, UK, Canada & 3,000+ Global Unis',
    fee: '~₹17,000 ($200)',
    validity: '2 Years',
    overviewPath: '/exams/pte',
    syllabusPath: '/exams/pte/syllabus',
    practicePath: '/exams/pte/preparation',
    feesPath: '/exams/pte/fees',
    features: ['Fully automated computer scoring', 'Results delivered within 48 hours', 'Accepted for Australian & NZ PR visas'],
  },
  {
    id: 'toefl',
    name: 'TOEFL iBT',
    type: 'English Language Proficiency',
    tag: 'Top Choice for USA',
    tagColor: 'bg-orange-50 text-[#C04A1D] border-orange-200',
    scoreRange: '0 - 120 Points',
    typicalCutoff: '80 - 100 Points',
    duration: 'Under 2 Hours',
    format: 'Computer-Based (Test Center or Home)',
    accepted: '100% US Universities, Canada, UK, Germany',
    fee: '~₹16,900 ($205)',
    validity: '2 Years',
    overviewPath: '/exams/toefl',
    syllabusPath: '/exams/toefl/syllabus',
    practicePath: '/exams/toefl/preparation',
    feesPath: '/exams/toefl/fees',
    features: ['Shorter 2-hour modern exam format', 'Preferred by Ivy League & top US programs', 'Reading, Listening, Speaking & Writing'],
  },
  {
    id: 'duolingo',
    name: 'Duolingo English Test (DET)',
    type: 'English Language Proficiency',
    tag: 'Take from Home 24/7',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    scoreRange: '10 - 160 Points',
    typicalCutoff: '105 - 125 Points',
    duration: '1 Hour',
    format: 'Adaptive Computer Test (Home)',
    accepted: '4,500+ Universities worldwide',
    fee: '~$59 (Affordable)',
    validity: '2 Years',
    overviewPath: '/exams/duolingo',
    syllabusPath: '/exams/duolingo/syllabus',
    practicePath: '/exams/duolingo/sample-questions',
    feesPath: '/exams/duolingo/fees',
    features: ['Convenient online test from home', 'Results within 48 hours', 'Free score reporting to unlimited institutions'],
  },
  {
    id: 'gre',
    name: 'GRE General Test',
    type: 'Graduate Admissions (STEM / Arts)',
    tag: 'Crucial for MS & PhD',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    scoreRange: '260 - 340 (Quant + Verbal) + AWA 0-6',
    typicalCutoff: '310 - 325+',
    duration: '1 Hour 58 Mins',
    format: 'Computer-Based',
    accepted: 'Top US, Canadian & European Master’s Programs',
    fee: '~$220 (₹18,500)',
    validity: '5 Years',
    overviewPath: '/exams/gre',
    syllabusPath: '/exams/gre/syllabus',
    practicePath: '/exams/gre/practice-test',
    feesPath: '/exams/gre/fees',
    features: ['Quant Reasoning, Verbal & Analytical Writing', 'Score valid for 5 full application years', 'Boosts scholarship & TA/RA eligibility'],
  },
  {
    id: 'gmat',
    name: 'GMAT Focus Edition',
    type: 'Business & Management Admissions',
    tag: 'Gold Standard for MBA',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    scoreRange: '205 - 805 Points',
    typicalCutoff: '625 - 685+ (Focus)',
    duration: '2 Hours 15 Mins',
    format: 'Computer-Adaptive',
    accepted: 'Top 100 Global Business Schools (Harvard, INSEAD, LBS)',
    fee: '~$275 (₹22,800)',
    validity: '5 Years',
    overviewPath: '/exams/gmat',
    syllabusPath: '/exams/gmat/syllabus',
    practicePath: '/exams/gmat/sample-papers',
    feesPath: '/exams/gmat/fees',
    features: ['Quantitative, Verbal & Data Insights', 'Streamlined Focus Edition layout', 'Question review & edit feature'],
  },
  {
    id: 'sat',
    name: 'Digital SAT',
    type: 'Undergraduate Admissions',
    tag: 'US Bachelor’s Degrees',
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
    scoreRange: '400 - 1600 Points',
    typicalCutoff: '1250 - 1450+',
    duration: '2 Hours 14 Mins',
    format: 'Digital on Laptop / Tablet',
    accepted: 'US, Canadian & Global Undergraduate Programs',
    fee: '~$103 (International)',
    validity: '5 Years',
    overviewPath: '/exams/sat',
    syllabusPath: '/exams/sat/syllabus',
    practicePath: '/exams/sat/preparation',
    feesPath: '/exams/sat/fees',
    features: ['Digital adaptive format on Bluebook app', 'Reading & Writing + Math with built-in calculator', 'Essential for merit scholarships in the USA'],
  }
];

const COMPARISON_ROWS = [
  { metric: 'Primary Purpose', ielts: 'Study / Work Abroad (Global)', pte: 'Fast Admission & Australian/NZ PR', toefl: 'US & Global Academic Studies', gre: 'MS, PhD & Technical Degrees', gmat: 'MBA & Business Masters' },
  { metric: 'Test Duration', ielts: '2 hrs 45 mins', pte: '2 hrs', toefl: '1 hr 56 mins', gre: '1 hr 58 mins', gmat: '2 hrs 15 mins' },
  { metric: 'Score Scale', ielts: 'Band 0.0 - 9.0', pte: '10 - 90 Points', toefl: '0 - 120 Points', gre: '260 - 340 + AWA', gmat: '205 - 805 Points' },
  { metric: 'Result Turnaround', ielts: '3 - 5 Days (Computer)', pte: 'Within 48 Hours', toefl: '4 - 8 Days', gre: '8 - 10 Days', gmat: 'Within 7 Days' },
  { metric: 'Score Validity', ielts: '2 Years', pte: '2 Years', toefl: '2 Years', gre: '5 Years', gmat: '5 Years' },
];

const ExamsHubPage = () => {
  const { openEligibilityModal } = useLead();
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Study Abroad Exams Hub | IELTS, PTE, TOEFL, GRE, GMAT, SAT | UniCoach';
  }, []);

  const filteredExams = EXAMS_DATA.filter((exam) => {
    const isLang = ['ielts', 'pte', 'toefl', 'duolingo'].includes(exam.id);
    const isGrad = ['gre', 'gmat', 'sat'].includes(exam.id);
    const matchesTab = filterType === 'all' || 
      (filterType === 'lang' && isLang) || 
      (filterType === 'grad' && isGrad);

    const matchesSearch = exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.accepted.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[76px] pb-24 text-slate-900 font-sans">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EBF2FF] via-[#F4F7FD] to-[#F8FAFC] border-b border-slate-200/80 overflow-hidden">
        <Interactive3DGrid gridSize={52} />
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-radial from-orange-200/40 via-amber-100/25 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-orange-200/80 shadow-2xs">
            <Sparkles size={14} className="text-[#DE5C2B]" />
            <span className="text-[12px] font-bold text-[#DE5C2B] tracking-wide uppercase">
              Official Study Abroad Exam Directory & AI Prep Suite
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
            Master Your International Exams <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] via-orange-600 to-amber-600">
              With Verified Prep & AI Scorers
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Detailed syllabus, cutoff scores, registration dates, fees, and test structures for IELTS, PTE, TOEFL, GRE, GMAT, and SAT.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto pt-3">
            <div className="relative flex items-center bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200/90 p-1.5 transition-all focus-within:border-[#DE5C2B] focus-within:ring-3 focus-within:ring-orange-100">
              <Search className="w-5 h-5 text-slate-400 ml-3.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by exam (IELTS, GRE, PTE, TOEFL)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Key Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>50,000+ Mock Tests Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Band 8.0+ Highest IELTS Score</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Free Diagnostic Masterclasses</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. EXAM DIRECTORY SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Filters */}
        <div className="flex items-center justify-center gap-2 pb-8">
          {[
            { id: 'all', label: 'All Exams' },
            { id: 'lang', label: '🗣️ English Proficiency (IELTS/PTE/TOEFL)' },
            { id: 'grad', label: '📊 Graduate & Undergrad (GRE/GMAT/SAT)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#DE5C2B] text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredExams.map((exam) => (
            <motion.div
              key={exam.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                
                {/* Header with tag */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {exam.type}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#DE5C2B] transition-colors">
                      {exam.name}
                    </h2>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${exam.tagColor} flex-shrink-0`}>
                    {exam.tag}
                  </span>
                </div>

                {/* Score & Format Banner */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Target Score</span>
                    <span className="font-extrabold text-[#DE5C2B]">{exam.typicalCutoff}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Duration</span>
                    <span className="font-bold text-slate-800">{exam.duration}</span>
                  </div>
                  <div className="col-span-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-400">Exam Fee:</span>
                    <span className="font-bold text-slate-700">{exam.fee}</span>
                  </div>
                </div>

                {/* Bullet Highlights */}
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {exam.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* AI Feature Callout if available */}
                {exam.aiTool && (
                  <Link
                    to={exam.aiTool.path}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/70 hover:bg-orange-100/80 transition-colors text-xs font-bold text-[#DE5C2B]"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-[#DE5C2B]" />
                      <span>{exam.aiTool.name}</span>
                    </div>
                    <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#DE5C2B] text-white">
                      Try Free
                    </span>
                  </Link>
                )}

              </div>

              {/* Bottom Quick-Action Links */}
              <div className="pt-5 mt-4 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-3 gap-1.5 text-[11.5px] text-center font-bold text-slate-600">
                  <Link
                    to={exam.syllabusPath}
                    className="py-1.5 px-1 rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                  >
                    Syllabus
                  </Link>
                  <Link
                    to={exam.practicePath}
                    className="py-1.5 px-1 rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                  >
                    Practice
                  </Link>
                  <Link
                    to={exam.feesPath}
                    className="py-1.5 px-1 rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                  >
                    Fees & Dates
                  </Link>
                </div>

                <Link
                  to={exam.overviewPath}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#DE5C2B] text-white font-bold text-xs transition-colors"
                >
                  <span>Complete {exam.name} Guide</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

            </motion.div>
          ))}
        </div>

      </section>

      {/* ── 3. EXAM COMPARISON MATRIX ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Which Exam Should You Take?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Side-by-side comparison of the most widely accepted study abroad examinations.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-800">
                <th className="p-4 font-bold text-slate-500 uppercase text-[11px]">Feature</th>
                <th className="p-4 font-extrabold text-[#DE5C2B]">IELTS</th>
                <th className="p-4 font-extrabold text-emerald-700">PTE</th>
                <th className="p-4 font-extrabold text-[#C04A1D]">TOEFL</th>
                <th className="p-4 font-extrabold text-purple-700">GRE</th>
                <th className="p-4 font-extrabold text-indigo-700">GMAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900 bg-slate-50/30 whitespace-nowrap">{row.metric}</td>
                  <td className="p-4">{row.ielts}</td>
                  <td className="p-4">{row.pte}</td>
                  <td className="p-4">{row.toefl}</td>
                  <td className="p-4">{row.gre}</td>
                  <td className="p-4">{row.gmat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 4. FREE DIAGNOSTIC COUNSELING CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0B2068] p-8 sm:p-12 text-white shadow-2xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE5C2B]/20 border border-orange-400/30 text-orange-300 text-xs font-bold">
              <Zap size={14} /> Free Diagnostic & Score Planner
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Get an Instant Exam Roadmap for Your Target Intake
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Not sure whether you should take IELTS vs PTE, or GRE vs GMAT? Speak with our test preparation strategists for free university cutoff mapping.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openEligibilityModal('Exams Hub Free Diagnostic')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <span>Book Free Test Prep Consultation</span>
                <ArrowRight size={16} />
              </button>

              <Link
                to="/ai-tools/ielts-evaluator"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
              >
                <span>Evaluate IELTS Writing with AI</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ExamsHubPage;
