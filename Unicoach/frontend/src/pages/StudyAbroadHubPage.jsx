import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, ArrowRight, Sparkles, GraduationCap, Coins, Briefcase, 
  CheckCircle2, Compass, Search, Filter, ShieldCheck, Star, 
  MapPin, Clock, Users, ArrowUpRight, PhoneCall, ChevronRight
} from 'lucide-react';
import Interactive3DGrid from '../components/Interactive3DGrid';
import { useLead } from '../context/LeadContext';

import usaImg from '../assets/destinations/usa.webp';
import ukImg from '../assets/destinations/uk.webp';
import canadaImg from '../assets/destinations/canada.webp';
import ausImg from '../assets/destinations/australia.webp';
import germanyImg from '../assets/destinations/germany.webp';
import irelandImg from '../assets/destinations/ireland.webp';

const DESTINATIONS = [
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    slug: 'usa',
    badge: 'World #1 Higher Ed',
    category: 'roi',
    image: usaImg,
    unis: '4,500+ Universities',
    topUnis: ['MIT', 'Stanford', 'Harvard', 'Columbia', 'Northeastern'],
    avgTuition: '$25,000 - $55,000 / yr',
    workPermit: '3-Year STEM OPT Extension',
    avgSalary: '$78,000 - $115,000',
    popularCourses: ['MS Computer Science', 'Data Science', 'MBA', 'Business Analytics'],
    highlights: ['Highest tech starting salaries', 'Silicon Valley & Wall Street networking', 'Massive research funding'],
  },
  {
    id: 'germany',
    name: 'Germany',
    flag: '🇩🇪',
    slug: 'germany',
    badge: 'Zero / Low Tuition',
    category: 'tuition',
    image: germanyImg,
    unis: '380+ Public Unis',
    topUnis: ['TU Munich', 'LMU Munich', 'Heidelberg Univ', 'RWTH Aachen'],
    avgTuition: '€0 - €3,000 / yr (Public)',
    workPermit: '18-Month Job Seeker Visa',
    avgSalary: '€55,000 - €72,000',
    popularCourses: ['Automotive Engineering', 'Data Science', 'Informatics', 'Renewable Energy'],
    highlights: ['Zero tuition at public universities', 'Strong engineering economy', 'English-taught masters'],
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    slug: 'uk',
    badge: '1-Year Fast Masters',
    category: 'roi',
    image: ukImg,
    unis: '160+ Universities',
    topUnis: ['Oxford', 'Cambridge', 'Imperial College', 'UCL', 'Edinburgh'],
    avgTuition: '£15,000 - £32,000 / yr',
    workPermit: '2-Year Graduate Route Visa',
    avgSalary: '£42,000 - £65,000',
    popularCourses: ['MSc Business Analytics', 'Finance & FinTech', 'Computer Science', 'Law (LLM)'],
    highlights: ['Complete masters in 12 months', 'Save 1 full year living cost', 'Global financial capital London'],
  },
  {
    id: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    slug: 'canada',
    badge: 'Streamlined PR Pathway',
    category: 'pr',
    image: canadaImg,
    unis: '100+ Recognized Inst.',
    topUnis: ['Univ of Toronto', 'UBC', 'McGill', 'Waterloo', 'Conestoga'],
    avgTuition: 'CAD 20,000 - 38,000 / yr',
    workPermit: 'Up to 3-Year PGWP',
    avgSalary: 'CAD 60,000 - 85,000',
    popularCourses: ['Cloud Architecture', 'Health Informatics', 'AI & Machine Learning', 'Project Mgmt'],
    highlights: ['Clear post-study PR routes', 'High quality of life & safety', 'Multicultural student cities'],
  },
  {
    id: 'australia',
    name: 'Australia',
    flag: '🇦🇺',
    slug: 'australia',
    badge: 'High Minimum Wage',
    category: 'visa',
    image: ausImg,
    unis: '43 World-Ranked Unis',
    topUnis: ['Univ of Melbourne', 'Univ of Sydney', 'UNSW', 'ANU', 'Monash'],
    avgTuition: 'AUD 30,000 - 46,000 / yr',
    workPermit: '2 to 4-Year Post-Study Visa',
    avgSalary: 'AUD 68,000 - 92,000',
    popularCourses: ['Information Technology', 'Civil Engineering', 'Biotechnology', 'Hospitality Mgmt'],
    highlights: ['World-class Group of Eight institutions', 'Flexible 48-hour fortnightly work rights', 'High minimum wage'],
  },
  {
    id: 'ireland',
    name: 'Ireland',
    flag: '🇮🇪',
    slug: 'ireland',
    badge: 'Silicon Valley of Europe',
    category: 'roi',
    image: irelandImg,
    unis: '30+ Higher Ed Inst.',
    topUnis: ['Trinity College Dublin', 'Univ College Dublin', 'Univ of Galway', 'UCC'],
    avgTuition: '€12,000 - €25,000 / yr',
    workPermit: '2-Year Stamp 1G Visa',
    avgSalary: '€48,000 - €70,000',
    popularCourses: ['Data Analytics', 'Software Engineering', 'Pharmaceutical Sciences', 'Digital Marketing'],
    highlights: ['European HQ of Google, Meta, Apple & Pfizer', '100% English-speaking EU member', 'Rapid tech hiring'],
  },
  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    slug: 'france',
    badge: 'Affordable Grand Écoles',
    category: 'tuition',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    unis: '70+ Public & Private Unis',
    topUnis: ['HEC Paris', 'Sorbonne Univ', 'École Polytechnique', 'INSEAD'],
    avgTuition: '€2,800 - €18,000 / yr',
    workPermit: '2-Year Post-Study Visa',
    avgSalary: '€45,000 - €62,000',
    popularCourses: ['Luxury Brand Management', 'Aerospace Engineering', 'International Business', 'Culinary Arts'],
    highlights: ['Generous housing subsidies (CAF)', 'World #1 business schools', 'Gateway to 27 Schengen countries'],
  },
  {
    id: 'new-zealand',
    name: 'New Zealand',
    flag: '🇳🇿',
    slug: 'new-zealand',
    badge: 'Safe & Serene Campus Life',
    category: 'visa',
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
    unis: '8 State Universities',
    topUnis: ['Univ of Auckland', 'Univ of Otago', 'Victoria Univ Wellington', 'Univ of Canterbury'],
    avgTuition: 'NZD 26,000 - 40,000 / yr',
    workPermit: 'Up to 3-Year Open Work Visa',
    avgSalary: 'NZD 60,000 - 82,000',
    popularCourses: ['Environmental Science', 'Data Analytics', 'Agribusiness', 'Tourism & Hospitality'],
    highlights: ['All 8 universities ranked in Global Top 3%', 'Safe and peaceful lifestyle', 'Skill shortage job visas'],
  },
  {
    id: 'italy',
    name: 'Italy',
    flag: '🇮🇹',
    slug: 'italy',
    badge: '100% DSU Scholarships',
    category: 'tuition',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80',
    unis: '90+ Universities',
    topUnis: ['Politecnico di Milano', 'Univ of Bologna', 'Sapienza Univ of Rome', 'Univ of Padua'],
    avgTuition: '€900 - €4,000 / yr',
    workPermit: '1-Year Permesso di Soggiorno',
    avgSalary: '€38,000 - €52,000',
    popularCourses: ['Fashion & Architecture', 'Industrial Design', 'Mechanical Engineering', 'Economics'],
    highlights: ['DSU regional scholarships cover 100% tuition + €7,000 stipend', 'Cradle of European Renaissance', 'Zero tuition based on ISEE'],
  }
];

const FILTER_TABS = [
  { id: 'all', label: 'All Destinations' },
  { id: 'roi', label: '🚀 High Career ROI' },
  { id: 'tuition', label: '💰 Zero / Low Tuition' },
  { id: 'pr', label: '🍁 Fast PR Pathways' },
  { id: 'visa', label: '🛡️ Long Post-Study Visas' },
];

const JOURNEY_STEPS = [
  { step: '01', title: 'Profile Evaluation', desc: 'Detailed assessment of your GPA, test scores, work experience, and financial budget by senior mentors.' },
  { step: '02', title: 'Smart Shortlisting', desc: 'AI-assisted Safe, Target & Dream categorization across 1,500+ global partner universities.' },
  { step: '03', title: 'Test Prep & Polish', desc: 'Targeted coaching & AI scoring for IELTS, TOEFL, PTE, GRE, and GMAT.' },
  { step: '04', title: 'SOP & LOR Crafting', desc: 'Review and tailoring of university-specific Statements of Purpose that bypass committee cutoffs.' },
  { step: '05', title: 'Visa Filing & Mock Interviews', desc: 'Consular interview simulations, loan sanction guidance, and complete visa dossier checks.' },
  { step: '06', title: 'Fly & Settle', desc: 'Pre-departure briefing, student housing booking, Forex card setup, and local alumni network connect.' },
];

const StudyAbroadHubPage = () => {
  const { openEligibilityModal } = useLead();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Explore Study Abroad Destinations | Universities, Visas & Courses | UniCoach';
  }, []);

  const filteredDestinations = DESTINATIONS.filter((item) => {
    const matchesFilter = selectedFilter === 'all' || item.category === selectedFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.popularCourses.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.topUnis.some(u => u.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[76px] pb-24 text-slate-900 font-sans">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EBF2FF] via-[#F4F7FD] to-[#F8FAFC] border-b border-slate-200/80 overflow-hidden">
        <Interactive3DGrid gridSize={52} />
        
        {/* Soft Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-radial from-orange-200/40 via-amber-100/25 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-orange-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#DE5C2B] animate-ping" />
            <span className="text-[12px] font-bold text-[#DE5C2B] tracking-wide uppercase">
              Global Study Abroad Directory 2026 Intake
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
            Choose Your Dream <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] via-orange-600 to-amber-600">
              International Study Destination
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Compare post-study work visas, tuition fees, starting salaries, and top universities across 9 major countries. Get 100% free personalized counseling.
          </p>

          {/* Search Bar & Fast Filter */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative flex items-center bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200/90 p-1.5 transition-all focus-within:border-[#DE5C2B] focus-within:ring-3 focus-within:ring-orange-100">
              <Search className="w-5 h-5 text-slate-400 ml-3.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by country, university, or course (e.g. Data Science, Germany)..."
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

          {/* Trust Metrics Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>1,500+ Partner Universities</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>98.7% Visa Approval Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>100% Free Expert Counseling</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. DESTINATIONS DIRECTORY SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Category Filters */}
        <div className="flex items-center justify-center flex-wrap gap-2 pb-8">
          {FILTER_TABS.map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#DE5C2B] text-white shadow-md shadow-orange-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDestinations.map((dest) => (
            <motion.div
              key={dest.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Card Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={dest.image}
                  alt={`Study in ${dest.name}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                
                {/* Badge Tag */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] sm:text-xs font-bold text-slate-800 shadow-2xs">
                  {dest.badge}
                </div>

                {/* Country Name & Flag */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <span className="text-2xl mr-2">{dest.flag}</span>
                    <span className="text-lg font-black tracking-tight">{dest.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-orange-200 bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-400/30">
                    {dest.unis}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Avg Tuition</span>
                    <span className="font-bold text-slate-800">{dest.avgTuition}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Post-Study Visa</span>
                    <span className="font-bold text-emerald-700">{dest.workPermit}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-500">Avg Graduate Salary:</span>
                    <span className="font-extrabold text-[#DE5C2B]">{dest.avgSalary}</span>
                  </div>
                </div>

                {/* Top Universities */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Top Institutions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dest.topUnis.map((uni, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
                      >
                        {uni}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Popular Courses */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Popular In-Demand Courses
                  </p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {dest.popularCourses.join(' • ')}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                  <Link
                    to={`/study-abroad/${dest.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>Explore {dest.name}</span>
                    <ArrowRight size={13} />
                  </Link>

                  <button
                    onClick={() => openEligibilityModal(`Study in ${dest.name}`)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    title="Book free counseling for this country"
                  >
                    <PhoneCall size={14} className="text-[#DE5C2B]" />
                  </button>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-base font-bold text-slate-700 mb-2">No destinations match your search.</p>
            <p className="text-xs text-slate-500 mb-4">Try clearing your search query or changing filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }}
              className="px-4 py-2 bg-[#DE5C2B] text-white font-bold text-xs rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}

      </section>

      {/* ── 3. SIX-STEP APPLICATION JOURNEY ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#DE5C2B] text-xs font-bold mb-3">
            <Compass size={14} />
            <span>Proven Success Blueprint</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Your 6-Step Pathway to a Top Global Degree
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            From shortlisting to airport departure, UniCoach guides you every single week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {JOURNEY_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-orange-200 hover:shadow-md transition-all duration-200 relative group"
            >
              <span className="text-3xl font-black text-slate-200 group-hover:text-orange-100 transition-colors">
                {step.step}
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-2 mb-1.5">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. HIGH-CONVERTING BOTTOM CTA BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0B2068] p-8 sm:p-12 text-white shadow-2xl border border-slate-800">
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE5C2B]/20 border border-orange-400/30 text-orange-300 text-xs font-bold">
              <Sparkles size={13} />
              <span>100% Free Consultation</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Unsure which country matches your GPA and budget?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Speak directly to our senior international educational counselors. We analyze your academic transcripts, budget, post-study work goals, and university application deadlines for 2026.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openEligibilityModal('Study Abroad Hub Bottom CTA')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <span>Book Free 1-on-1 Counseling</span>
                <ArrowRight size={16} />
              </button>

              <Link
                to="/eligibility-calculator"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
              >
                <span>Check Admission Fit with AI</span>
              </Link>
            </div>
          </div>

          <div className="absolute right-[-40px] bottom-[-40px] w-96 h-96 bg-[#DE5C2B]/15 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

    </div>
  );
};

export default StudyAbroadHubPage;
