import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Building, BookOpen, Clock, HelpCircle, CheckCircle2, 
  ArrowRight, Sparkles, Award, MapPin, Briefcase, Coins,
  Search, Filter, Globe, ExternalLink, DollarSign
} from 'lucide-react';
import StudyAbroadCTA from '../../components/StudyAbroadCTA';
import { getUniversityLogo } from '../../components/logoResolver';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../utils/universitySearchMatcher';
import PageBackBreadcrumb from '../../components/common/PageBackBreadcrumb';
import CourseFinderCard from '../../components/CourseFinderCard';
import ProgramSelectionTools from '../../components/ProgramSelectionTools';
import { useProgramSelection } from '../../utils/useProgramSelection';

// Universities are listed 10 at a time so big countries don't render hundreds of cards at once
const UNI_PAGE_SIZE = 10;
import { API_BASE_URL } from '../../config';

const API_URL = API_BASE_URL;

// Reusable 3D Hover Card for Universities
const UniversityCard = ({ uni, onCheckEligibility, searchTerm = '' }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative h-full perspective-1000"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="bg-white/80 border border-white/60 rounded-[24px] p-6 shadow-sm group-hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between" style={{ transform: "translateZ(20px)" }}>
        
        <div>
          {/* Logo & Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-2 flex-shrink-0">
              <img 
                src={getUniversityLogo(uni.name, uni.logo)} 
                alt={uni.name} 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`; }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-650 transition-colors truncate" title={uni.name}>{uni.name}</h3>
              <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
                <MapPin size={12} className="text-slate-400" />
                {uni.city ? `${uni.city}, ${uni.country?.name}` : uni.country?.name}
              </p>
            </div>
          </div>

          {/* Highlights */}
          {uni.description && (
            <p className="text-slate-600 text-xs font-medium leading-relaxed mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
              {uni.description}
            </p>
          )}

          {/* Details list */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-50/30 p-2.5 rounded-lg border border-slate-100/30">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">QS Ranking</span>
              <span className="text-xs font-bold text-slate-700">{uni.rank || '--'}</span>
            </div>
            <div className="bg-slate-50/30 p-2.5 rounded-lg border border-slate-100/30">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">Fees (Annual)</span>
              <span className="text-xs font-bold text-emerald-600 truncate block">{uni.tuition || '--'}</span>
            </div>
          </div>

          {/* Matched Course Highlight Pill */}
          {(() => {
            const matched = uni.matchedCourses && uni.matchedCourses.length > 0
              ? uni.matchedCourses
              : (searchTerm ? getMatchedCoursesForUniversity(uni, searchTerm) : []);
            if (matched.length === 0) return null;
            return (
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl px-3 py-1.5 mb-3 flex items-center gap-2 text-xs">
                <Sparkles size={13} className="text-emerald-600 flex-shrink-0" />
                <div className="truncate">
                  <span className="text-[9px] uppercase font-black tracking-wider text-emerald-700 block">Verified Course Match</span>
                  <span className="font-bold text-emerald-950 truncate block text-xs">{matched.slice(0, 2).join(' • ')}</span>
                </div>
              </div>
            );
          })()}

          {/* Offered Programs Preview */}
          {Array.isArray(uni.courses) && uni.courses.length > 0 && (
            <div className="mb-4 space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <BookOpen size={11} className="text-indigo-500" /> Offered Programs
              </p>
              <div className="flex flex-wrap gap-1.5">
                {uni.courses.slice(0, 3).map((c, i) => (
                  <span key={i} className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                    {c}
                  </span>
                ))}
                {uni.courses.length > 3 && (
                  <span className="text-[10px] font-bold text-slate-400 self-center">
                    +{uni.courses.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="border-t border-slate-100/80 pt-4 mt-auto flex items-center justify-between gap-3">
          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full font-bold px-2.5 py-0.5 text-[10px]">
            {String(uni.type).toUpperCase()}
          </span>
          <div className="flex gap-2">
            {uni.website && (
              <a 
                href={uni.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-all text-[11px] font-bold"
              >
                Website
              </a>
            )}
            <button 
              onClick={() => onCheckEligibility(uni.name)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-[11px] font-bold shadow-xs"
            >
              Eligibility
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default function DynamicCountryPage() {
  const { countryCode } = useParams();
  const navigate = useNavigate();
  const [country, setCountry] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedPrograms, selectedIds, toggleProgram, clearSelection } = useProgramSelection();
  // "See more universities": the count resets whenever the search changes
  const listKey = `${country?.name || ''}|${searchTerm}`;
  const [uniPaging, setUniPaging] = useState({ key: '', count: UNI_PAGE_SIZE });
  const visibleUniCount = uniPaging.key === listKey ? uniPaging.count : UNI_PAGE_SIZE;
  const showMoreUniversities = () => setUniPaging({ key: listKey, count: visibleUniCount + UNI_PAGE_SIZE });

  useEffect(() => {
    const fetchCountryData = async () => {
      setLoading(true);
      try {
        // Fetch country detail
        const countryRes = await fetch(`${API_URL}/public/universities-data/countries/${countryCode}`);
        if (!countryRes.ok) {
          throw new Error('Country not found');
        }
        const countryData = await countryRes.json();
        setCountry(countryData);

        // Fetch country universities
        const uniRes = await fetch(`${API_URL}/public/universities-data/universities?countryCode=${countryCode}`);
        if (uniRes.ok) {
          const uniData = await uniRes.json();
          setUniversities(uniData);
        }
      } catch (err) {
        console.error(err);
        navigate('/'); // Redirect to home if failed
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [countryCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafcff]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!country) return null;

  const filteredUnis = universities.filter(uni => 
    matchesUniversitySearch(uni, searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-indigo-100/30 via-blue-50/10 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-orange-200/40/10 to-indigo-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* On-Page Navigation: Dedicated Back Button & Breadcrumbs */}
        <PageBackBreadcrumb items={[{ label: `Study in ${country.name}` }]} />

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles size={14} className="text-indigo-650 animate-pulse" />
            <span>Destination Guide 2026/27</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Study in <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">{country.name}</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Explore world-class academic institutions, check tuition structures, and start your journey to {country.name} in 2026. Get counselled by expert advisors.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { val: `${universities.length}`, label: "Listed Universities" },
              { val: `${country.cities?.length || 0}`, label: "Top Cities" },
              { val: "English / Native", label: "Languages" },
              { val: "Available", label: "Post-Study Work Visa" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-xs backdrop-blur-md">
                <p className="text-xl font-black text-indigo-650">{stat.val}</p>
                <p className="text-[10px] text-slate-500 font-extrabold mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section: Cities navigation */}
        {country.cities && country.cities.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
              <Building size={20} className="text-indigo-650" />
              Explore Universities by City
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {country.cities.map(city => {
                const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                return (
                  <Link 
                    key={city}
                    to={`/study-abroad/${countryCode}/${citySlug}`}
                    className="px-5 py-3 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <span>{city}</span>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-650" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: University Listings */}
        <div className="border-t border-slate-100 pt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Universities in {country.name}</h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">Browse, filter, and shortlist colleges dynamically</p>
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search university, course (e.g. CS, MBA), or city..."
                className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-400 transition-colors shadow-xs"
              />
            </div>
          </div>

          {/* CourseFinder University + Degree Programs List */}
          <div className="space-y-4">
            {filteredUnis.slice(0, visibleUniCount).map(uni => (
              <CourseFinderCard 
                key={uni._id || uni.name} 
                uni={uni} 
                searchQuery={searchTerm}
                selectedProgramIds={selectedIds}
                onToggleProgramSelect={toggleProgram}
                onOpenDetailsModal={() => {
                  navigate(`/contact?university=${encodeURIComponent(uni.name)}`);
                }}
              />
            ))}
          </div>

          {filteredUnis.length > visibleUniCount && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={showMoreUniversities}
                className="px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
              >
                See {Math.min(UNI_PAGE_SIZE, filteredUnis.length - visibleUniCount)} more universities
              </button>
              <p className="mt-2 text-[11px] font-medium text-slate-400">
                Showing {visibleUniCount} of {filteredUnis.length} universities
              </p>
            </div>
          )}
          <ProgramSelectionTools selectedPrograms={selectedPrograms} onClearSelection={clearSelection} />

          {filteredUnis.length === 0 && (
            <div className="bg-white/50 border border-slate-100 rounded-2xl py-16 text-center text-slate-400 text-xs font-semibold mt-6">
              No universities found under {country.name} matching your search.
            </div>
          )}
        </div>

        {/* CTA section */}
        <div className="mt-16">
          <StudyAbroadCTA country={country.name} />
        </div>

      </div>
    </div>
  );
}
