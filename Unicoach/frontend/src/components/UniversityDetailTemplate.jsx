import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import StudyAbroadCTA from './StudyAbroadCTA';
import { useLead } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import OverviewSection from './university-sections/OverviewSection';
import AdmissionsSection from './university-sections/AdmissionsSection';
import RankingsSection from './university-sections/RankingsSection';
import CoursesFeesSection from './university-sections/CoursesFeesSection';
import { 
  MapPin, Award, Building, BookOpen, Calendar, Clock, 
  CheckCircle2, ArrowRight, Star, ChevronRight, HelpCircle,
  User, GraduationCap, DollarSign, Wallet, ShieldCheck, Briefcase, 
  Users, Library, Activity, Home as HomeIcon, Compass
} from 'lucide-react';

const FAQAccordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-4 text-left font-extrabold text-slate-800 text-sm cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
              <span>{item.question}</span>
              <ChevronRight 
                size={16} 
                className={`text-slate-400 transition-transform duration-250 ${isOpen ? 'rotate-90 text-indigo-600' : ''}`} 
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 pb-4 pt-1 text-slate-500 text-xs font-semibold leading-relaxed border-t border-slate-100">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

const UniversityDetailTemplate = ({ uniData, sections = {} }) => {
  const { openEligibilityModal } = useLead();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // Set default to overview matching mockup
  const [logoError, setLogoError] = useState(false);
  const [heroError, setHeroError] = useState(false);

  // Derive country from uniData for shortlister pre-filter
  const getCountryParam = () => {
    const loc = (uniData?.location || '').toLowerCase();
    if (loc.includes('usa') || loc.includes('united states') || loc.includes('america')) return 'USA';
    if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('england') || loc.includes('britain')) return 'UK';
    if (loc.includes('canada')) return 'Canada';
    if (loc.includes('australia')) return 'Australia';
    if (loc.includes('germany')) return 'Germany';
    if (loc.includes('ireland')) return 'Ireland';
    if (loc.includes('new zealand')) return 'New Zealand';
    if (loc.includes('france')) return 'France';
    if (loc.includes('singapore')) return 'Singapore';
    if (loc.includes('dubai') || loc.includes('uae')) return 'Dubai/UAE';
    return 'All';
  };

  const handleCheckEligibility = () => {
    if (user) {
      // Logged-in user → go directly to AI shortlister pre-filtered by country
      const country = getCountryParam();
      navigate(`/universities?country=${encodeURIComponent(country)}`);
    } else {
      // Guest → open login modal
      openEligibilityModal(`University Detail: ${uniData?.name || 'University'}`);
    }
  };

  const OverviewComp = sections.overview || OverviewSection;
  const AdmissionsComp = sections.admissions || AdmissionsSection;
  const RankingsComp = sections.rankings || RankingsSection;
  const CoursesComp = sections.courses || CoursesFeesSection;

  const defaultBlogs = [
    {
      title: "Fresher Jobs In USA For Indians In 2024: Top Roles, Salary & More",
      readTime: "11 mins read",
      date: "Mar 15, 2025"
    },
    {
      title: "How to Get Job in USA for Indians in 2024: Easy Job Search Hurdles!",
      readTime: "11 mins read",
      date: "Mar 13, 2025"
    },
    {
      title: "Highest Paying Jobs in USA for Indian Students 2025",
      readTime: "10 mins read",
      date: "Mar 13, 2025"
    },
    {
      title: "How To Work in USA 2024: Tips & Tricks to Find A Good Job",
      readTime: "15 mins read",
      date: "Mar 15, 2025"
    },
    {
      title: "Minimum Wages in USA 2024: State-wise Comparison",
      readTime: "10 mins read",
      date: "Mar 15, 2025"
    }
  ];

  const relatedBlogs = uniData.blogs || defaultBlogs;

  return (
    <div className="min-h-screen bg-[#fafcff] font-sans pb-20 pt-20">
      
      {/* 1. HERO CAMPUS IMAGE & CARD SECTION */}
      <div className="relative w-full h-[280px] md:h-[350px] overflow-hidden select-none">
        {heroError || !uniData.heroImage ? (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 to-indigo-950 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:24px_24px]"></div>
            <Library size={40} className="text-indigo-400 mb-2 opacity-50 animate-pulse" />
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Campus Image Unavailable</span>
          </div>
        ) : (
          <img 
            src={uniData.heroImage}
            alt={`${uniData.name} Campus`} 
            className="w-full h-full object-cover brightness-[0.75]" 
            onError={() => setHeroError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      {/* Floating Header Card */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 -mt-16 md:-mt-20 relative z-10">
        <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-[28px] p-6 md:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center p-2 shadow-sm overflow-hidden relative flex-shrink-0">
              {logoError || !uniData.logo ? (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex flex-col items-center justify-center text-white select-none">
                  <GraduationCap size={22} className="mb-0.5" />
                  <span className="text-[10px] font-black tracking-tighter uppercase leading-none">
                    {uniData.name.split(' ').map(w => w[0]).join('').slice(0, 3)}
                  </span>
                </div>
              ) : (
                <img 
                  src={uniData.logo} 
                  alt={`${uniData.name} Logo`} 
                  className="w-full h-full object-contain" 
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                {uniData.name}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-bold flex items-center justify-center md:justify-start gap-1 mt-1.5">
                <MapPin size={14} className="text-indigo-600" />
                {uniData.location}
              </p>
            </div>
          </div>
          <button
            onClick={handleCheckEligibility}
            className="px-8 py-3.5 bg-[#DE5C2B] hover:bg-[#C04A1D] text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Check Eligibility
          </button>
        </div>
      </div>

      {/* 2. TAB NAVIGATION BAR */}
      <div className="border-b border-slate-200 mt-8 mb-10">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 flex overflow-x-auto gap-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'admissions', label: 'Admissions' },
            { id: 'rankings', label: 'Rankings' },
            { id: 'courses', label: 'Courses and Fees' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-indigo-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CORE TAB CONTENT CONTAINER */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            
            {activeTab === 'overview' && <OverviewComp uniData={uniData} data={uniData} />}
            {activeTab === 'admissions' && <AdmissionsComp uniData={uniData} data={uniData} />}
            {activeTab === 'rankings' && <RankingsComp uniData={uniData} data={uniData} />}
            {activeTab === 'courses' && <CoursesComp uniData={uniData} data={uniData} />}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Breadcrumbs Section */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 mt-16 mb-4">
        <nav className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Study Abroad</Link>
          <ChevronRight size={10} />
          <Link to={`/study-abroad/${(uniData.country || 'usa').toLowerCase()}`} className="hover:text-indigo-600 transition-colors">Study in {uniData.country || 'USA'}</Link>
          <ChevronRight size={10} />
          <span className="hover:text-indigo-600 transition-colors">Universities in {uniData.country || 'USA'}</span>
          <ChevronRight size={10} />
          <span className="text-slate-600 font-extrabold">{uniData.name}</span>
        </nav>
      </div>

      {/* 4. RELEVANT BLOGS FEED SECTION (At bottom of all details page tabs) */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 border-t border-slate-200/65 pt-12">
        <h2 className="text-2xl font-black text-slate-900 mb-8">Related Articles & Guides</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedBlogs.map((blog, idx) => (
            <div 
              key={idx}
              className="bg-white/50 border border-white rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                <span>{blog.readTime}</span>
                <span>{blog.date}</span>
              </div>
              <h3 className="font-extrabold text-slate-850 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                {blog.title}
              </h3>
              <div className="flex items-center gap-1 text-xs font-black text-indigo-600 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Read More</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-[1440px]">
        <StudyAbroadCTA 
          title={`Interested in ${uniData.name}?`}
          description={`Get expert guidance on admissions, scholarships, visa requirements, and application deadlines for ${uniData.name}. Book free counselling with our counsellors.`}
        />
      </div>

    </div>
  );
};

export default UniversityDetailTemplate;
