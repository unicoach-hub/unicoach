import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, FileText, Calculator, Award, Sparkles, 
  ArrowRight, Download, CheckCircle2, Search, ExternalLink, 
  HelpCircle, ShieldCheck, Compass, Users, PhoneCall, Zap
} from 'lucide-react';
import Interactive3DGrid from '../components/Interactive3DGrid';
import { useLead } from '../context/LeadContext';

const RESOURCE_SECTIONS = [
  {
    id: 'sop',
    category: 'Application Toolkits',
    title: 'SOP (Statement of Purpose)',
    icon: FileText,
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
    description: 'Comprehensive guides, paragraph structures, and accepted samples for undergraduate, master’s, MBA, and PhD admissions.',
    items: [
      { name: 'AI SOP Generator (Instant Custom Draft)', path: '/ai-tools/sop-generator', badge: 'AI Tool', highlight: true },
      { name: 'Statement of Purpose Guide', path: '/resources/sop/statement-of-purpose' },
      { name: 'SOP for Master’s Programs', path: '/resources/sop/sop-masters' },
      { name: 'SOP for MBA Admissions', path: '/resources/sop/sop-mba' },
      { name: 'SOP for PhD & Research Fellowships', path: '/resources/sop/sop-phd' },
    ]
  },
  {
    id: 'lor',
    category: 'Application Toolkits',
    title: 'LOR (Letter of Recommendation)',
    icon: Award,
    iconBg: 'bg-orange-50 text-[#DE5C2B] border-orange-200',
    description: 'Academic and professional recommendation guidelines, professor request templates, and committee-proven formats.',
    items: [
      { name: 'Mastering the LOR: Comprehensive Guide', path: '/resources/lor/lor-blog' },
      { name: 'Academic LOR for Master’s', path: '/resources/lor/lor-masters' },
      { name: 'Professional & Academic LOR for PhD', path: '/resources/lor/lor-phd' },
    ]
  },
  {
    id: 'calculators',
    category: 'Calculators & Conversion',
    title: 'Academic & GPA Calculators',
    icon: Calculator,
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    description: 'Standardize your Indian or international grades into official US 4.0 GPA, percentage, and university cutoff equivalents.',
    items: [
      { name: '✨ Admission & Scholarship Profile Predictor', path: '/eligibility-calculator', badge: 'Popular', highlight: true },
      { name: 'CGPA to 4.0 GPA Converter (US Scale)', path: '/resources/calculators/cgpa-to-gpa' },
      { name: 'CGPA to Percentage Calculator', path: '/resources/calculators/cgpa-to-percentage' },
      { name: 'CGPA to Marks Equivalence Calculator', path: '/resources/calculators/cgpa-to-marks' },
    ]
  },
  {
    id: 'books',
    category: 'Exam Prep Materials',
    title: 'Official Exam Books & Study Guides',
    icon: BookOpen,
    iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
    description: 'Curated list of official preparation books, vocabulary banks, and diagnostic question papers for test-takers.',
    items: [
      { name: 'Cambridge IELTS Preparation Books', path: '/resources/books/ielts-books' },
      { name: 'Official Digital SAT Books & Guides', path: '/resources/books/sat-books' },
      { name: 'PTE Academic Official Prep Materials', path: '/resources/books/pte-books' },
      { name: 'ETS Official TOEFL iBT Preparation Guide', path: '/resources/books/toefl-books' },
      { name: 'ETS GRE Official Super Power Pack', path: '/resources/books/gre-books' },
      { name: 'Official GMAT Focus Edition Guide', path: '/resources/books/gmat-books' },
    ]
  },
  {
    id: 'visa-finance',
    category: 'Visa & Financial Guides',
    title: 'Visa & Financial Proof Workflows',
    icon: ShieldCheck,
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
    description: 'Checklists for financial sponsorship, education loans, blocked accounts, and consulate interview prep.',
    items: [
      { name: 'AI Visa Interview Practice Simulator', path: '/ai-tools/visa-prep', badge: 'AI Tool', highlight: true },
      { name: 'US F-1 Visa Appointment & I-20 Checklist', path: '/study-abroad/usa' },
      { name: 'Germany APS & Blocked Account (Expatrio)', path: '/study-abroad/germany' },
      { name: 'Canada SDS Student Direct Stream & GIC', path: '/study-abroad/canada' },
      { name: 'UK CAS Letter & 2-Year Graduate Route', path: '/study-abroad/uk' },
    ]
  },
  {
    id: 'insights',
    category: 'News & Community',
    title: 'Knowledge Hub & Community Updates',
    icon: Compass,
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    description: 'Stay ahead of changing visa rules, university intake deadlines, and upcoming virtual global education fairs.',
    items: [
      { name: 'UniCoach Weekly Student Digest', path: '/unicoach-digest', badge: 'Weekly', highlight: true },
      { name: 'Latest Study Abroad News & Policy Changes', path: '/newsroom' },
      { name: 'Expert Articles & Application Guides', path: '/blogs' },
      { name: 'Upcoming Education Fairs & Webinars', path: '/events' },
    ]
  }
];

const ResourcesHubPage = () => {
  const { openEligibilityModal } = useLead();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Study Abroad Resources, Toolkits & Calculators | UniCoach';
  }, []);

  const categories = ['all', 'Application Toolkits', 'Calculators & Conversion', 'Exam Prep Materials', 'Visa & Financial Guides', 'News & Community'];

  const filteredSections = RESOURCE_SECTIONS.filter((section) => {
    const matchesCat = selectedCategory === 'all' || section.category === selectedCategory;
    const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[76px] pb-24 text-slate-900 font-sans">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EBF2FF] via-[#F4F7FD] to-[#F8FAFC] border-b border-slate-200/80 overflow-hidden">
        <Interactive3DGrid gridSize={52} />
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-radial from-orange-200/40 via-amber-100/25 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-orange-200/80 shadow-2xs">
            <BookOpen size={14} className="text-[#DE5C2B]" />
            <span className="text-[12px] font-bold text-[#DE5C2B] tracking-wide uppercase">
              Free Study Abroad Resources, Guides & Calculators
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
            Everything You Need to <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] via-orange-600 to-amber-600">
              Accelerate Your Application
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Free SOP formats, LOR guidelines, GPA calculators, visa checklists, and official exam preparation books curated by certified admissions consultants.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto pt-3">
            <div className="relative flex items-center bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200/90 p-1.5 transition-all focus-within:border-[#DE5C2B] focus-within:ring-3 focus-within:ring-orange-100">
              <Search className="w-5 h-5 text-slate-400 ml-3.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search tools, SOP guides, GPA calculators, books..."
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

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>100% Free Downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Verified by Senior Counselors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Updated for 2026 Admissions</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. RESOURCE CATEGORIES & CARDS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Category Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 pb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#DE5C2B] text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat === 'all' ? 'All Resources' : cat}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  
                  {/* Icon & Title */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${section.iconBg}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        {section.category}
                      </span>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {section.description}
                  </p>

                  <div className="w-full h-[1px] bg-slate-100 my-2" />

                  {/* Resource Links List */}
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx}>
                        <Link
                          to={item.path}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all group ${
                            item.highlight
                              ? 'bg-orange-50/70 border border-orange-200/60 text-[#DE5C2B] hover:bg-orange-100/70'
                              : 'hover:bg-slate-50 text-slate-700 hover:text-[#DE5C2B]'
                          }`}
                        >
                          <span className="truncate group-hover:translate-x-0.5 transition-transform">
                            {item.name}
                          </span>
                          {item.badge ? (
                            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-[#DE5C2B] text-white flex-shrink-0">
                              {item.badge}
                            </span>
                          ) : (
                            <ArrowRight size={13} className="text-slate-400 group-hover:text-[#DE5C2B] flex-shrink-0" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>

                </div>

                {/* Card footer CTA */}
                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEligibilityModal(`Resource Review - ${section.title}`)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Request Counselor Document Review</span>
                    <ExternalLink size={13} className="text-slate-400" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>

      </section>

      {/* ── 3. BOTTOM COUNSELING BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0B2068] p-8 sm:p-12 text-white shadow-2xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE5C2B]/20 border border-orange-400/30 text-orange-300 text-xs font-bold">
              <Zap size={14} /> Expert Document Review
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Have Your SOP & LOR Reviewed by Admissions Officers
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Don't leave your dream university admission to chance. Get a line-by-line editorial review of your drafts with suggestions to maximize committee impact.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openEligibilityModal('Resources Hub Document Review Banner')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <span>Submit Draft for Free Review</span>
                <ArrowRight size={16} />
              </button>

              <Link
                to="/ai-tools/sop-generator"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
              >
                <span>Generate SOP with AI</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ResourcesHubPage;
