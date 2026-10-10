import logoStanford from '../../../assets/usa/Stanford/Stanford University.svg';
import logoGeorgiaTech from '../../../assets/usa/Atlanta/Georgia Institute of Technology.png';
import logoChicago from '../../../assets/usa/Chicago/Chicago.png';
import logoUpenn from '../../../assets/usa/Philadelphia/University of Pennsylvania.png';
import logoNortheastern from '../../../assets/usa/Boston/Northeastern University.png';
import logoEmory from '../../../assets/usa/Atlanta/Emory University.png';
import { API_BASE_URL } from '../../../config';

const logoMit = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoCaltech = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoHarvard = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoNorthwestern = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { getOfficialTuition } from '../../../utils/dataSourceLabel';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  DollarSign, MapPin, Award, Building, Globe, ExternalLink, 
  BookOpen, Calendar, HelpCircle, CheckCircle2, ArrowRight, ChevronDown, ChevronRight,
  Search, Filter, Info, Briefcase, GraduationCap, Check,
  Wallet, Percent, Plane, FileText, CreditCard, TrendingUp, X, Sparkles, AlertCircle, Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLead } from '../../../context/LeadContext';
import allCSUniversitiesData from '../../../assets/master_in_cs_us/Top Universities in USA for Masters (MS) in Computer Science (2026).json';
import { getUniversityLogo } from '../../../components/logoResolver';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../utils/universitySearchMatcher';

const API_URL = API_BASE_URL;

// Eagerly import all university logos so Vite resolves them at build time
const logoModules = import.meta.glob(
  '../../../assets/master_in_cs_us/usa_masters_cs_logos/*.webp',
  { eager: true, import: 'default' }
);

// Build a lookup map: "usa_masters_cs_logos/Foo.webp" -> resolved URL
const logoMap = {};
for (const [path, url] of Object.entries(logoModules)) {
  // path looks like "../../../assets/master_in_cs_us/usa_masters_cs_logos/Foo.webp"
  const key = path.split('/master_in_cs_us/')[1]; // -> "usa_masters_cs_logos/Foo.webp"
  if (key) logoMap[key] = url;
}

const getLogoUrl = (logoPath, uniName = '') => {
  if (logoPath && logoMap[logoPath]) return logoMap[logoPath];
  return getUniversityLogo(uniName, logoPath);
};

// 3D Hover Card Component for Universities
const UniversityCard = ({ uni, currency, exchangeRate, getTuitionDisplay, onKnowMore, onCheckEligibility, searchTerm }) => {
    const cardRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const matchedCourses = searchTerm ? getMatchedCoursesForUniversity(uni, searchTerm) : [];

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
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative h-full perspective-1000"
            data-cursor="hover"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] transition-all duration-300 h-full flex flex-col relative z-10" style={{ transform: "translateZ(30px)" }}>
                {/* University Logo & Header */}
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                        <img
                            src={getLogoUrl(uni.logo, uni.name)}
                            alt={uni.name}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name || 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
                            }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-900 text-sm leading-tight group-hover:text-[#DE5C2B] transition-colors" title={uni.name}>
                            {["Harvard University", "Stanford University", "Columbia University in the City of New York", "Northeastern University", "Yale University"].includes(uni.name) ? (
                              <Link 
                                to={`/study-abroad/usa/universities/${
                                  uni.name.includes("Harvard") ? "harvard" :
                                  uni.name.includes("Stanford") ? "stanford" :
                                  uni.name.includes("Columbia") ? "columbia" :
                                  uni.name.includes("Northeastern") ? "northeastern" :
                                  "yale"
                                }`} 
                                className="hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {uni.name}
                              </Link>
                            ) : (
                              uni.name
                            )}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-bold">
                            <MapPin size={12} className="text-[#DE5C2B]" />
                            {uni.location}
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 flex-grow">
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50 group-hover:bg-orange-50/50 transition-colors">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">
                            <Award size={14} className="text-purple-500" />
                            Rank
                        </div>
                        <p className="font-semibold text-gray-900 text-sm truncate">{uni.rank || '--'}</p>
                    </div>
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50 group-hover:bg-orange-50/50 transition-colors">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">
                            <DollarSign size={14} className="text-green-500" />
                            Tuition Fees
                        </div>
                        <p className="font-semibold text-indigo-600 text-sm truncate">{getTuitionDisplay(uni.tuition, currency)}</p>
                    </div>
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50 group-hover:bg-orange-50/50 transition-colors">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">
                            <Building size={14} className="text-[#DE5C2B]" />
                            Type
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                            <span className="px-2.5 py-0.5 bg-orange-100/80 text-[#C04A1D] rounded-full text-[10px] border border-orange-200 uppercase font-black tracking-wider">
                                {uni.type}
                            </span>
                        </p>
                    </div>
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50 group-hover:bg-orange-50/50 transition-colors">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">
                            <Globe size={14} className="text-indigo-500" />
                            Website
                        </div>
                        <a
                            href={uni.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#DE5C2B] hover:text-[#C04A1D] text-sm font-semibold flex items-center gap-1 z-20 relative"
                            onClick={(e) => e.stopPropagation()}
                            data-cursor="pointer"
                        >
                            Visit <ExternalLink size={12} />
                        </a>
                    </div>
                </div>

                {/* Dynamic Syllabus Tags */}
                <div className="mb-5">
                  {matchedCourses.length > 0 && (
                    <div className="mb-2.5 flex flex-wrap items-center gap-1.5 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1.5 rounded-xl">
                      <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wide">✓ Matched Course:</span>
                      {matchedCourses.slice(0, 3).map((mc, idx) => (
                        <span key={idx} className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                          {mc}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {uni.courses.slice(0, 3).map((c, i) => (
                      <span 
                        key={i} 
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-50 border border-slate-150 text-slate-500"
                      >
                        {c}
                      </span>
                    ))}
                    {uni.courses.length > 3 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-150 text-indigo-600">
                        +{uni.courses.length - 3} More
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto" style={{ transform: "translateZ(20px)" }}>
                    <button
                        onClick={() => onKnowMore(uni)}
                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-1 group/btn z-20 relative cursor-pointer"
                        data-cursor="pointer"
                    >
                        Know more <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => onCheckEligibility(uni)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white rounded-xl hover:shadow-[0_4px_15px_rgba(222,92,43,0.25)] transition-all text-xs font-bold z-20 relative text-center cursor-pointer"
                        data-cursor="pointer"
                    >
                        Check Eligibility
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────
// Course Specialization Details for Computer Science
// ─────────────────────────────────────────────
const courseDetails = {
  ai: {
    title: "Artificial Intelligence & ML",
    salary: 135000,
    duration: "1.5 - 2 Years",
    growth: "+37% (Extremely High Demand)",
    subjects: ["Deep Learning Models", "Natural Language Processing", "Reinforcement Learning", "Computer Vision", "AI Ethics & Robotics"],
    universities: [
      { name: "Stanford University", city: "Stanford", tuition: 58000, rank: "3 QS", logo: logoStanford, url: "https://www.stanford.edu" },
      { name: "Massachusetts Institute of Technology (MIT)", city: "Boston", tuition: 59750, rank: "1 QS", logo: logoMit, url: "https://www.mit.edu" },
      { name: "Carnegie Mellon University", city: "Pittsburgh", tuition: 59000, rank: "52 QS", logo: "https://logo.clearbit.com/cmu.edu", url: "https://www.cmu.edu" }
    ]
  },
  se: {
    title: "Software Engineering & Systems",
    salary: 128000,
    duration: "1.5 - 2 Years",
    growth: "+25% (Fastest Growing)",
    subjects: ["Distributed Systems", "Advanced Compiler Design", "Cloud Infrastructure", "System Security & Cryptography", "Agile DevOps"],
    universities: [
      { name: "University of California, Berkeley", city: "Berkeley", tuition: 43000, rank: "6 QS", logo: "https://logo.clearbit.com/berkeley.edu", url: "https://www.berkeley.edu" },
      { name: "Georgia Institute of Technology", city: "Atlanta", tuition: 31000, rank: "88 QS", logo: logoGeorgiaTech, url: "https://www.gatech.edu" },
      { name: "University of Illinois Urbana-Champaign", city: "Urbana", tuition: 38000, rank: "64 QS", logo: "https://logo.clearbit.com/illinois.edu", url: "https://www.illinois.edu" }
    ]
  },
  ds: {
    title: "Data Science & Analytics",
    salary: 129331,
    duration: "1.5 - 2 Years",
    growth: "+35% (Top emerging field)",
    subjects: ["Big Data Infrastructure", "Statistical Modelling", "Predictive Analytics", "Data Visualization", "Natural Language Processing"],
    universities: [
      { name: "Harvard University", city: "Boston", tuition: 56200, rank: "5 QS", logo: logoHarvard, url: "https://www.harvard.edu" },
      { name: "University of Chicago", city: "Chicago", tuition: 61500, rank: "13 QS", logo: logoChicago, url: "https://www.uchicago.edu" },
      { name: "University of Pennsylvania (UPenn)", city: "Philadelphia", tuition: 56000, rank: "15 QS", logo: logoUpenn, url: "https://www.upenn.edu" }
    ]
  }
};

const USACSMastersPage = () => {
  const [activeSpec, setActiveSpec] = useState('ai'); 
  const [currency, setCurrency] = useState('INR'); // 'USD' | 'INR'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'costs' | 'admissions' | 'jobs'
  
  const exchangeRate = 88.22;
  const currentDetails = courseDetails[activeSpec] || courseDetails.ai;

  // Price formatting helper (input: USD)
  const formatPrice = (valInUSD) => {
    if (currency === 'USD') {
      return `$${valInUSD.toLocaleString()}`;
    }
    const valInINR = valInUSD * exchangeRate;
    if (valInINR >= 100000) {
      return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${Math.round(valInINR).toLocaleString()}`;
  };

  // Price formatting helper (input: INR)
  const formatINRPrice = (valInINR) => {
    if (currency === 'INR') {
      if (valInINR >= 100000) {
        return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
      }
      return `₹ ${valInINR.toLocaleString()}`;
    }
    const valInUSD = valInINR / exchangeRate;
    return `$${Math.round(valInUSD).toLocaleString()}`;
  };

  const { openEligibilityModal } = useLead();

  const [rawUniversities, setRawUniversities] = useState(allCSUniversitiesData);

  useEffect(() => {
    const loadLiveCSUnis = async () => {
      try {
        const res = await fetch(`${API_URL}/public/universities-data/universities?countryCode=usa`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map(u => ({
              id: u._id,
              name: u.name,
              location: (u.city ? `${u.city}, ` : '') + (u.state || 'USA'),
              city: u.city || 'Central City',
              state: u.state || 'USA',
              // Only official values: fee from an official source (Master's fee preferred), rank from an
              // imported ranking file, acceptance rate from College Scorecard. Unknown stays empty.
              tuition: (() => { const t = getOfficialTuition(u, { preferGraduate: true }); return t ? `₹ ${(Math.round((t.usd * 85) / 10000) / 10).toFixed(1)} Lakh / yr` : 'N/A'; })(),
              tuitionFeeUSD: getOfficialTuition(u, { preferGraduate: true })?.usd || null,
              rank: u.rankingSource && u.rankingNum > 0 ? u.rankingNum : null,
              degrees: Array.isArray(u.degreeLevels) ? u.degreeLevels : [],
              courses: Array.isArray(u.courses) ? u.courses : [],
              acceptanceRate: u.dataSource?.provider === 'College Scorecard' && typeof u.acceptanceRate === 'number' ? u.acceptanceRate : null,
              logo: u.logo || '',
              website: u.website || '',
              type: u.type || 'PUBLIC'
            }));
            setRawUniversities(mapped);
          }
        }
      } catch (e) {
        console.warn('Failed to load live CS universities from API, using fallback:', e);
      }
    };
    loadLiveCSUnis();
  }, []);

  const enrichedUniversities = useMemo(() => {
    return rawUniversities.map((uni, index) => {
      let parsedTuition = null;
      if (uni.tuition && uni.tuition !== 'N/A') {
        const match = uni.tuition.match(/([\d.]+)\s*Lakh/i);
        if (match) {
          parsedTuition = parseFloat(match[1]); // e.g. 49
        }
      }
      if (parsedTuition === null && uni.tuitionFeeUSD) {
        parsedTuition = (uni.tuitionFeeUSD * 85) / 100000;
      }

      // Determine dynamic degrees
      const nameLower = uni.name.toLowerCase();
      const rawDegrees = Array.isArray(uni.degrees) ? uni.degrees : ['Masters'];
      const degrees = ['Postgraduate']; // Always include Postgraduate since this is Masters in USA page
      if (rawDegrees.some(d => String(d).toLowerCase().includes('master') || String(d).toLowerCase().includes('postgrad'))) {
        if (!degrees.includes('Postgraduate')) degrees.push('Postgraduate');
      }
      if (rawDegrees.some(d => String(d).toLowerCase().includes('bach') || String(d).toLowerCase().includes('undergrad'))) {
        if (!degrees.includes('Undergraduate')) degrees.push('Undergraduate');
      }
      if (rawDegrees.some(d => String(d).toLowerCase().includes('ph') || String(d).toLowerCase().includes('doctor'))) {
        if (!degrees.includes('Ph.D.')) degrees.push('Ph.D.');
      }

      // Determine dynamic courses specifically for Computer Science
      const courses = ['Computer Science'];
      if (nameLower.includes('ai') || nameLower.includes('intel') || nameLower.includes('machine') || nameLower.includes('learning')) {
        courses.push('Artificial Intelligence / Machine Learning');
      }
      if (nameLower.includes('data') || nameLower.includes('analyt')) {
        courses.push('Data Science');
      }
      if (nameLower.includes('secur') || nameLower.includes('cyber')) {
        courses.push('Cyber Security');
      }
      if (nameLower.includes('soft') || nameLower.includes('program')) {
        courses.push('Software Engineering');
      }
      if (nameLower.includes('comput') && (nameLower.includes('engin') || nameLower.includes('ece'))) {
        courses.push('Computer Engineering');
      }

      // Extract city & state from location
      const parts = (uni.location || uni.city || 'Boston, Massachusetts').split(', ');
      const city = uni.city || parts[0] || 'Boston';
      const state = uni.state || parts[1] || 'USA';

      return {
        ...uni,
        parsedTuition,
        degrees,
        courses,
        city,
        state
      };
    });
  }, [rawUniversities]);

  // Listing states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFees, setSelectedFees] = useState([]);
  const [selectedDegrees, setSelectedDegrees] = useState(['Postgraduate']);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [sortBy, setSortBy] = useState('rank');
  const [visibleCount, setVisibleCount] = useState(18);
  const [selectedUniDetails, setSelectedUniDetails] = useState(null);
  const [citySearch, setCitySearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(18);
  }, [searchTerm, selectedDegrees, selectedCourses, selectedCities, selectedFees]);

  const loaderRef = useRef(null);

  // Accordion toggle states
  const [openAccordions, setOpenAccordions] = useState({
    fees: true,
    degree: true,
    courses: true,
    cities: true
  });

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Static Categories
  const degreeCategories = [
    "Postgraduate", "Ph.D.", "PG Diploma /Certificate", "Undergraduate", "UG Diploma /Certificate /Associate Degree"
  ];

  const courseCategories = [
    "Computer Science", "Artificial Intelligence / Machine Learning", "Data Science", 
    "Cyber Security", "Software Engineering", "Computer Engineering"
  ];

  const cityCategories = [
    "New York", "Boston", "Chicago", "Los Angeles", "San Francisco", "Seattle", 
    "Philadelphia", "Atlanta", "San Diego", "Stanford", "Berkeley", "Pasadena", 
    "Ann Arbor", "Columbus", "Newark", "West Lafayette", "Ithaca", "New Haven", 
    "Princeton", "Baltimore", "Dayton", "Minneapolis", "Dallas", "Houston", "Austin"
  ];

  const feeRanges = [
    { id: "max10", label: "Max ₹10 Lacs", max: 10 },
    { id: "max20", label: "Max ₹20 Lacs", max: 20 },
    { id: "max30", label: "Max ₹30 Lacs", max: 30 },
    { id: "max40", label: "Max ₹40 Lacs", max: 40 },
    { id: "above40", label: "₹40 Lacs +", min: 40 }
  ];

  // Helper to format tuition in card display
  const getTuitionDisplay = (feeStr, curr) => {
    if (!feeStr || feeStr === 'N/A' || feeStr === '-/-') {
      return '-/-';
    }
    const match = feeStr.match(/([\d.]+)\s*Lakh/i);
    if (match) {
      const lakhVal = parseFloat(match[1]);
      const inrVal = lakhVal * 100000;
      if (curr === 'INR') {
        return `₹ ${lakhVal.toFixed(1)} Lakh`;
      } else {
        const usdVal = inrVal / exchangeRate;
        return `$${Math.round(usdVal).toLocaleString()}`;
      }
    }
    return feeStr;
  };

  // Filter core logic
  const filteredUniversities = useMemo(() => {
    return enrichedUniversities.filter(uni => {
      // 1. Search term filter
      if (searchTerm && !matchesUniversitySearch(uni, searchTerm)) {
        return false;
      }

      // 2. Degree filter (flexible matching)
      if (selectedDegrees.length > 0) {
        const hasMatch = selectedDegrees.some(sel => {
          if (sel === 'Postgraduate') {
            return uni.degrees.some(d => String(d).toLowerCase().includes('postgrad') || String(d).toLowerCase().includes('master'));
          }
          if (sel === 'Undergraduate') {
            return uni.degrees.some(d => String(d).toLowerCase().includes('undergrad') || String(d).toLowerCase().includes('bach'));
          }
          if (sel === 'Ph.D.') {
            return uni.degrees.some(d => String(d).toLowerCase().includes('ph') || String(d).toLowerCase().includes('doctor'));
          }
          return uni.degrees.includes(sel);
        });
        if (!hasMatch) return false;
      }

      // 3. Courses filter
      if (selectedCourses.length > 0) {
        const hasMatch = uni.courses.some(c => selectedCourses.includes(c));
        if (!hasMatch) return false;
      }

      // 4. Cities filter
      if (selectedCities.length > 0) {
        if (!selectedCities.includes(uni.city)) return false;
      }

      // 5. Fees filter
      if (selectedFees.length > 0) {
        let matchFee = false;
        for (const rangeId of selectedFees) {
          if (uni.parsedTuition === null) continue;
          if (rangeId === 'max10' && uni.parsedTuition <= 10) matchFee = true;
          if (rangeId === 'max20' && uni.parsedTuition <= 20) matchFee = true;
          if (rangeId === 'max30' && uni.parsedTuition <= 30) matchFee = true;
          if (rangeId === 'max40' && uni.parsedTuition <= 40) matchFee = true;
          if (rangeId === 'above40' && uni.parsedTuition > 40) matchFee = true;
        }
        if (!matchFee) return false;
      }

      return true;
    });
  }, [enrichedUniversities, searchTerm, selectedDegrees, selectedCourses, selectedCities, selectedFees]);

  // Sort logic
  const sortedUniversities = useMemo(() => {
    const unis = [...filteredUniversities];
    if (sortBy === 'rank') {
      unis.sort((a, b) => {
        const rA = a.rank || 999999;
        const rB = b.rank || 999999;
        return rA - rB;
      });
    } else if (sortBy === 'fees') {
      unis.sort((a, b) => {
        const fA = a.parsedTuition === null ? 999999 : a.parsedTuition;
        const fB = b.parsedTuition === null ? 999999 : b.parsedTuition;
        return fA - fB;
      });
    } else if (sortBy === 'name') {
      unis.sort((a, b) => a.name.localeCompare(b.name));
    }
    return unis;
  }, [filteredUniversities, sortBy]);

  // Lazy loading helper
  const currentUniversities = useMemo(() => {
    return sortedUniversities.slice(0, visibleCount);
  }, [sortedUniversities, visibleCount]);

  const handleFilterToggle = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleClearAll = () => {
    setSelectedDegrees([]);
    setSelectedCourses([]);
    setSelectedCities([]);
    setSelectedFees([]);
    setSearchTerm('');
  };

  const activeChips = [];
  selectedDegrees.forEach(d => activeChips.push({ category: 'degree', label: d, val: d }));
  selectedCourses.forEach(c => activeChips.push({ category: 'courses', label: c, val: c }));
  selectedCities.forEach(ci => activeChips.push({ category: 'cities', label: ci, val: ci }));
  selectedFees.forEach(f => {
    const matchedRange = feeRanges.find(r => r.id === f);
    if (matchedRange) activeChips.push({ category: 'fees', label: matchedRange.label, val: f });
  });

  const handleRemoveChip = (chip) => {
    if (chip.category === 'degree') setSelectedDegrees(selectedDegrees.filter(d => d !== chip.val));
    if (chip.category === 'courses') setSelectedCourses(selectedCourses.filter(c => c !== chip.val));
    if (chip.category === 'cities') setSelectedCities(selectedCities.filter(ci => ci !== chip.val));
    if (chip.category === 'fees') setSelectedFees(selectedFees.filter(f => f !== chip.val));
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Visual background ambient details */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-100/40 via-indigo-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">

        {/* 1. HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto mb-8"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
            <GraduationCap size={14} className="animate-pulse" />
            <span>Master's Program Guide & Finder 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            MS in Computer Science in USA: Ranking &{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Fees (2026)</span>
          </h1>
          <p className="text-slate-650 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Launch your career at the epicenter of global tech innovation. From Silicon Valley giants to Wall Street systems, a U.S. MS in CS is the ultimate catalyst for software engineers, AI researchers, and tech leaders.
          </p>
        </motion.div>

        {/* Global Controls: Tabs & Currency Switcher */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 border-b border-slate-200 pb-6">
          {/* Main Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'overview', label: 'Overview & Universities', icon: GraduationCap },
              { id: 'costs', label: 'Cost & Scholarships', icon: Wallet },
              { id: 'admissions', label: 'Admissions & F-1 Visa', icon: FileText },
              { id: 'jobs', label: 'Careers & ROI Analysis', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/60'}`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Currency Toggle */}
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-md inline-flex items-center gap-1">
            <button 
              onClick={() => setCurrency('USD')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'USD' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              USD ($)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-16"
            >
              {/* Introduction & Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 border border-slate-100 p-6 rounded-[28px] shadow-sm">
                  <h4 className="font-extrabold text-slate-900 text-lg mb-2">3-Year STEM OPT</h4>
                  <p className="text-slate-505 text-xs font-semibold leading-relaxed">
                    Graduating with an MS in Computer Science grants you up to 36 months of legal work authorization in the USA.
                  </p>
                </div>
                <div className="bg-white/80 border border-slate-100 p-6 rounded-[28px] shadow-sm">
                  <h4 className="font-extrabold text-slate-900 text-lg mb-2">Silicon Valley Giants</h4>
                  <p className="text-slate-505 text-xs font-semibold leading-relaxed">
                    USA universities offer direct pipelines to recruitment at Google, Meta, Apple, Nvidia, Amazon, and Microsoft.
                  </p>
                </div>
                <div className="bg-white/80 border border-slate-100 p-6 rounded-[28px] shadow-sm">
                  <h4 className="font-extrabold text-slate-900 text-lg mb-2">Starting Salaries</h4>
                  <p className="text-slate-505 text-xs font-semibold leading-relaxed">
                    CS Master's graduates regularly pull in starting offers ranging from $100,000 to $160,000+ base salary plus equity.
                  </p>
                </div>
              </div>

              {/* Specialization Explorer */}
              <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-sm backdrop-blur-xl">
                <div className="text-left mb-6 max-w-xl">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Best Universities by Spec</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Select a CS subfield to view career stats, core topics, and matching colleges.</p>
                </div>

                <div className="flex overflow-x-auto gap-2 border-b border-slate-100 pb-4 mb-6">
                  {Object.entries(courseDetails).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setActiveSpec(key)}
                      className={`py-2 px-5 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeSpec === key ? 'bg-indigo-50 border border-indigo-150 text-indigo-700' : 'text-slate-500 hover:text-indigo-500'}`}
                    >
                      {value.title}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8">
                  {/* Left stats */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-black text-slate-805">{currentDetails.title} Overview</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-3">Average Starting Salary</p>
                      <p className="text-3xl font-black text-emerald-600 mt-1">{formatPrice(currentDetails.salary)}/yr</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Duration</span>
                        <span className="block font-bold text-xs text-slate-700 mt-0.5">{currentDetails.duration}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Job Growth</span>
                        <span className="block font-bold text-xs text-slate-700 mt-0.5">{currentDetails.growth.split(' ')[0]}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Core Modules</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentDetails.subjects.map((sub, i) => (
                          <span key={i} className="text-[10px] font-bold px-3 py-1 bg-white border border-slate-200/60 rounded-lg text-slate-600">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right matching list */}
                  <div className="space-y-3">
                    <span className="text-xs text-slate-400 font-black flex items-center gap-1 uppercase tracking-wider mb-2">
                      <Building size={14} /> Matching Institutions
                    </span>
                    <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
                      {currentDetails.universities.map((uni, idx) => (
                        <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-indigo-400 transition-colors shadow-sm">
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                              <img src={uni.logo} alt={uni.name} className="w-6 h-6 object-contain" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`} />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-805 text-xs leading-tight">{uni.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-0.5">
                                <MapPin size={9} />
                                {uni.city}, USA • <Award size={9} className="ml-1 text-indigo-500" /> {uni.rank}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Tuition Fee</p>
                            <p className="text-xs font-black text-indigo-650 mt-0.5">{formatPrice(uni.tuition)}/yr</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* QS World CS Rankings 2026 Table */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Award size={22} className="text-indigo-600" />
                  Top U.S. CS Universities: QS Rankings 2026
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="pb-3 text-center w-16">QS CS Rank</th>
                        <th className="pb-3 pl-4">University Name</th>
                        <th className="pb-3">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {[
                        { rank: 1, name: "Massachusetts Institute of Technology (MIT)", loc: "Cambridge, Massachusetts" },
                        { rank: 2, name: "Carnegie Mellon University", loc: "Pittsburgh, Pennsylvania" },
                        { rank: 3, name: "Stanford University", loc: "Stanford, California" },
                        { rank: 4, name: "University of California, Berkeley (UCB)", loc: "Berkeley, California" },
                        { rank: 10, name: "California Institute of Technology (Caltech)", loc: "Pasadena, California" },
                        { rank: 12, name: "Cornell University", loc: "Ithaca, New York" },
                        { rank: 15, name: "University of Washington", loc: "Seattle, Washington" },
                        { rank: 18, name: "Princeton University", loc: "Princeton, New Jersey" },
                      ].map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 text-center">
                            <span className="inline-block px-2.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-lg font-black text-[10px]">
                              #{uni.rank}
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-slate-900">{uni.name}</td>
                          <td className="py-3 text-slate-500 font-semibold">{uni.loc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* University & College Finder Section */}
              <div id="university-finder-section" className="scroll-mt-32 pt-4">
                <div className="text-left mb-8 max-w-xl">
                  <h3 className="text-3xl font-black text-slate-900 mb-2">CS University & College Finder (2026)</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Use our interactive directory to find and filter through 980+ top U.S. institutions by fees, specializations, cities, and rankings.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                  
                  {/* Left Sidebar: Filters Checklist */}
                  <aside className="bg-white border border-slate-100 rounded-[32px] p-6 space-y-6 shadow-sm sticky top-28 z-20">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                        <Filter size={16} className="text-indigo-600" />
                        <span>Filters</span>
                      </div>
                      {activeChips.length > 0 && (
                        <button 
                          onClick={handleClearAll}
                          className="text-xs font-black text-indigo-650 hover:underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Fees Accordion */}
                    <div className="border-b border-slate-100 pb-5">
                      <button 
                        onClick={() => toggleAccordion('fees')}
                        className="w-full flex items-center justify-between font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-3 cursor-pointer text-left"
                      >
                        <span>1st Year Fees</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openAccordions.fees ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {openAccordions.fees && (
                        <div className="space-y-2.5">
                          {feeRanges.map((range) => (
                            <label key={range.id} className="flex items-center gap-2.5 cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={selectedFees.includes(range.id)}
                                onChange={() => handleFilterToggle(range.id, selectedFees, setSelectedFees)}
                                className="w-4.5 h-4.5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors">
                                {range.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Degree Accordion */}
                    <div className="border-b border-slate-100 pb-5">
                      <button 
                        onClick={() => toggleAccordion('degree')}
                        className="w-full flex items-center justify-between font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-3 cursor-pointer text-left"
                      >
                        <span>Degree</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openAccordions.degree ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {openAccordions.degree && (
                        <div className="space-y-2.5">
                          {degreeCategories.map((degree) => (
                            <label key={degree} className="flex items-center gap-2.5 cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={selectedDegrees.includes(degree)}
                                onChange={() => handleFilterToggle(degree, selectedDegrees, setSelectedDegrees)}
                                className="w-4.5 h-4.5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors">
                                {degree}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Courses Accordion */}
                    <div className="border-b border-slate-100 pb-5">
                      <button 
                        onClick={() => toggleAccordion('courses')}
                        className="w-full flex items-center justify-between font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-3 cursor-pointer text-left"
                      >
                        <span>Specializations</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openAccordions.courses ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {openAccordions.courses && (
                        <div className="space-y-3">
                          {/* Search Courses inside filter */}
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
                            <input 
                              type="text"
                              value={courseSearch}
                              onChange={(e) => setCourseSearch(e.target.value)}
                              placeholder="Search modules..."
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-3 py-1.5 text-[11px] font-semibold outline-none focus:border-indigo-400 transition-colors"
                            />
                          </div>

                          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                            {courseCategories
                              .filter(c => c.toLowerCase().includes(courseSearch.toLowerCase()))
                              .slice(0, showAllCourses ? undefined : 8)
                              .map((course) => (
                                <label key={course} className="flex items-center gap-2.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox"
                                    checked={selectedCourses.includes(course)}
                                    onChange={() => handleFilterToggle(course, selectedCourses, setSelectedCourses)}
                                    className="w-4.5 h-4.5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <span className="text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors line-clamp-1">
                                    {course}
                                  </span>
                                </label>
                              ))}
                          </div>
                          
                          {courseCategories.filter(c => c.toLowerCase().includes(courseSearch.toLowerCase())).length > 8 && (
                            <button
                              onClick={() => setShowAllCourses(!showAllCourses)}
                              className="text-[11px] font-black text-indigo-650 hover:underline cursor-pointer"
                            >
                              {showAllCourses ? 'Show Less' : `+${courseCategories.length - 8} More`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cities Accordion */}
                    <div className="pb-2">
                      <button 
                        onClick={() => toggleAccordion('cities')}
                        className="w-full flex items-center justify-between font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-3 cursor-pointer text-left"
                      >
                        <span>Cities</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openAccordions.cities ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {openAccordions.cities && (
                        <div className="space-y-3">
                          {/* Search Cities inside filter */}
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
                            <input 
                              type="text"
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                              placeholder="Search cities..."
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-3 py-1.5 text-[11px] font-semibold outline-none focus:border-indigo-400 transition-colors"
                            />
                          </div>

                          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                            {cityCategories
                              .filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
                              .map((city) => (
                                <label key={city} className="flex items-center gap-2.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox"
                                    checked={selectedCities.includes(city)}
                                    onChange={() => handleFilterToggle(city, selectedCities, setSelectedCities)}
                                    className="w-4.5 h-4.5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <span className="text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors">
                                    {city}
                                  </span>
                                </label>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </aside>

                  {/* Right Column: Listing Header, Cards, and Pagination */}
                  <main className="space-y-6">
                    
                    {/* Search bar & Sort Controls */}
                    <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                        <input 
                          type="text"
                          value={searchTerm}
                          onChange={(e) => { setSearchTerm(e.target.value); }}
                          placeholder="Search by course (e.g. AI, Software, Robotics), university, city, or state..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-400 transition-colors"
                        />
                      </div>

                      <div className="flex items-center justify-between w-full md:w-auto gap-6 flex-shrink-0">
                        <p className="text-xs font-bold text-slate-505 font-bold">
                          <span className="text-slate-800 font-black text-sm">{sortedUniversities.length}</span> Universities
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-bold">Sort By:</span>
                          <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer text-slate-700 focus:border-indigo-400 transition-colors"
                          >
                            <option value="rank">QS / US News Rank</option>
                            <option value="fees">Tuition Fee: Low to High</option>
                            <option value="name">Alphabetical (A-Z)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Active Filter Chips bar */}
                    {activeChips.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center bg-indigo-50/20 border border-indigo-100/50 p-4 rounded-2xl">
                        <span className="text-[10px] text-indigo-500 font-black uppercase tracking-wider mr-1.5">Active Filters:</span>
                        {activeChips.map((chip, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-100/60 rounded-full text-xs font-bold text-indigo-650 shadow-sm"
                          >
                            <span>{chip.label}</span>
                            <button 
                              onClick={() => handleRemoveChip(chip)}
                              className="text-slate-400 hover:text-indigo-655 transition-colors cursor-pointer"
                            >
                              <X size={12} className="stroke-[2.5]" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={handleClearAll}
                          className="text-[11px] font-black text-indigo-650 hover:underline ml-2 cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                    )}

                    {/* University Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 relative">
                      <AnimatePresence mode="popLayout">
                        {currentUniversities.map((uni, idx) => (
                          <UniversityCard
                            key={uni.id || uni._id || uni.name || `cs-uni-card-${idx}`}
                            uni={uni}
                            currency={currency}
                            exchangeRate={exchangeRate}
                            getTuitionDisplay={getTuitionDisplay}
                            searchTerm={searchTerm}
                            onKnowMore={(u) => {
                              let url = u.website || u.url;
                              if (!url || url === '#' || url === 'undefined') {
                                url = `https://www.google.com/search?q=${encodeURIComponent(u.name + ' official website')}`;
                              } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                url = 'https://' + url;
                              }
                              window.open(url, '_blank');
                            }}
                            onCheckEligibility={(u) => openEligibilityModal('university-finder')}
                          />
                        ))}
                      </AnimatePresence>

                      {sortedUniversities.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white/40 border border-white/60 rounded-[32px] backdrop-blur-md">
                          <AlertCircle className="mx-auto text-slate-300 mb-3" size={36} />
                          <p className="text-slate-505 font-extrabold text-sm">No universities match the selected filters.</p>
                          <p className="text-slate-400 text-xs mt-1">Try resetting the search or checkboxes to expand options.</p>
                          <button 
                            onClick={handleClearAll}
                            className="mt-4 px-5 py-2 bg-indigo-650 text-white text-xs font-bold rounded-xl hover:bg-indigo-750 transition-colors cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      )}
                    </div>

                    {/* See More Button */}
                    {visibleCount < sortedUniversities.length && (
                      <div className="flex justify-center mt-10">
                        <button
                          onClick={() => setVisibleCount(prev => prev + 18)}
                          className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <Compass size={18} /> See More
                        </button>
                      </div>
                    )}

                  </main>

                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'costs' && (
            <motion.div
              key="costs-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-16"
            >
              {/* Cost Overview Alert */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl flex items-center gap-3.5">
                <Info size={22} className="text-indigo-655 flex-shrink-0" />
                <p className="text-xs text-slate-650 font-semibold leading-relaxed">
                  Budget planning is crucial. A CS Master's degree in the U.S. typically runs between <strong>₹20 Lakh to ₹80 Lakh</strong> depending on public vs private status, program ranking, and destination cities. Exchange rate calculation: <strong>1 USD = ~₹88.22</strong>.
                </p>
              </div>

              {/* Tuition Fees Breakdown By Tier */}
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-6">CS Tuition Fees Breakdown by Tier</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { tier: "Tier 1 CS Programs", desc: "Top Ranked & Ivy Leagues (MIT, Stanford, CMU, Berkeley)", min: 45000, max: 65000 },
                    { tier: "Tier 2 CS Programs", desc: "High Ranking State & Public Research Universities", min: 28000, max: 45000 },
                    { tier: "Tier 3 CS Programs", desc: "Affordable Public Colleges & Mid-Tier State Universities", min: 18000, max: 28000 }
                  ].map((t, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-xl text-[10px] font-black uppercase mb-3">
                          {t.tier}
                        </span>
                        <p className="text-slate-505 text-xs font-semibold leading-relaxed mb-4">{t.desc}</p>
                      </div>
                      <div className="border-t border-slate-100 pt-4">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Annual Fees Guide</span>
                        <span className="text-xl font-black text-indigo-650 mt-1 block">
                          {formatPrice(t.min)} - {formatPrice(t.max)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pre-arrival hidden costs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Living Costs details */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-2">Cost of Living (States Guide)</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Estimated monthly living expenses including rent and food</p>
                  <div className="space-y-3.5">
                    {[
                      { state: "California (Silicon Valley / SF)", avg: 2200 },
                      { state: "New York (NYC area)", avg: 2400 },
                      { state: "Washington (Seattle area)", avg: 2000 },
                      { state: "Texas (Austin / Dallas)", avg: 1400 },
                      { state: "Georgia (Atlanta area)", avg: 1500 },
                      { state: "Illinois (Chicago area)", avg: 1600 }
                    ].map((st, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <span className="text-xs font-bold text-slate-700">
                          {st.state}
                        </span>
                        <span className="text-xs font-black text-slate-900">{formatPrice(st.avg)}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pre-arrival hidden costs */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-2">Pre-Arrival Costs & Hidden Fees</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Upfront expenses before landing in the United States</p>
                  <div className="space-y-4">
                    {[
                      { name: "Student Visa (F-1) Fee", usd: 185 },
                      { name: "SEVIS I-901 Fee", usd: 350 },
                      { name: "Flight Tickets (One Way)", usd: 1150, isRange: true, min: 800, max: 1500 },
                      { name: "Health Insurance (Mandatory)", usd: 1000, isRange: true, min: 500, max: 1500 },
                      { name: "University Deposit / Enrollment", usd: 600, isRange: true, min: 200, max: 1000 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-indigo-500" />
                          <span className="text-xs font-bold text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">
                          {item.isRange ? `${formatPrice(item.min)} - ${formatPrice(item.max)}` : formatPrice(item.usd)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scholarships Grid */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Sparkles size={22} className="text-yellow-500" />
                  Top Tech & CS Scholarships for MS in USA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "Generation Google Scholarship", award: "Funding of $10,000 for computer science students based on diversity and leadership", deadline: "May-Jun 2026" },
                    { name: "Fulbright-Nehru Master's Fellowships", award: "Full tuition, living stipend, visa fees, travel, health insurance", deadline: "Sep-Oct 2026" },
                    { name: "Inlaks Scholarships", award: "Tuition, living expenses, one-way travel, health allowance up to $100,000", deadline: "Mar 31, 2026" },
                    { name: "Narotam Sekhsaria Scholarship", award: "Interest-free loan up to ₹20,00,000 for postgraduate studies", deadline: "Mar 17, 2026" }
                  ].map((sc, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-400 transition-colors">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm mb-2">{sc.name}</h4>
                        <p className="text-slate-505 text-xs font-semibold leading-relaxed">{sc.award}</p>
                      </div>
                      <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-xs font-black">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Deadline</span>
                        <span className="text-indigo-650">{sc.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'admissions' && (
            <motion.div
              key="admissions-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-16"
            >
              {/* Admission score table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Score requirements */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-2">CS Admission Requirements</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Cutoffs for top U.S. computer science departments</p>
                  <div className="space-y-4">
                    {[
                      { item: "GRE Quantitative Score", score: "162 - 170 Score Preferred", detail: "Crucial for top-tier computer science and systems programs." },
                      { item: "TOEFL iBT (English Proof)", score: "90 - 100 Minimum Score", detail: "Or IELTS Academic Band of 7.0+ for top universities." },
                      { item: "GPA Cutoff", score: "3.2 - 3.8 / 4.0 Scale Preferred", detail: "Undergraduate degree in CS, Math, Engineering or related quantitative fields." },
                      { item: "Programming Pre-requisites", score: "C++, Java, Python, Algorithms", detail: "Must show basic coursework or industry experience in systems." }
                    ].map((row, i) => (
                      <div key={i} className="flex items-start gap-3 border-b border-slate-50 pb-3.5 last:border-0 last:pb-0">
                        <CheckCircle2 size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-black text-slate-905">{row.item}</p>
                          <p className="text-xs font-black text-indigo-650 mt-0.5">{row.score}</p>
                          <p className="text-[11px] text-slate-400 font-semibold mt-1 leading-relaxed">{row.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents checklist */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-2">Documents Checklist</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Essential files for your application package</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "Statement of Purpose (SOP)",
                      "Letters of Recommendation (LORs)",
                      "Technical Resume / GitHub link",
                      "Transcripts & Degree Certificates",
                      "Standardized Test Scores (GRE/TOEFL)",
                      "Financial Proof Documents"
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <CheckCircle2 size={16} className="text-indigo-600 stroke-[2.5]" />
                        <span className="text-xs font-black text-slate-800">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* How to Apply Step-by-Step */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-6">How to Apply for CS in USA from India</h3>
                <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-8">
                  {[
                    { step: 1, title: "Shortlist Universities", desc: "Select 8-10 target colleges matching your GPA, budget, and specialization (AI, security, data) preference." },
                    { step: 2, title: "Check Entry Requirements", desc: "Verify if your course requires GRE, specific credit hours, or coding portfolio checks." },
                    { step: 3, title: "Schedule Tests", desc: "Take standardized tests (GRE, TOEFL/IELTS) early enough to allow official scores to reach portals." },
                    { step: 4, title: "Prepare Documents", desc: "Draft a solid Statement of Purpose (SOP), secure LORs from professors, and highlight projects in your resume." },
                    { step: 5, title: "Apply Online & Secure I-20", desc: "Fill out admission applications. Once accepted, verify financial documents to obtain your I-20." },
                    { step: 6, title: "Apply for Visa (F-1)", desc: "Pay the SEVIS fee, submit DS-160 online, and book visa biometric and interview slots." }
                  ].map((s, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-10 top-0.5 bg-indigo-600 text-white font-black text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#fafcff]">
                        {s.step}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{s.title}</h4>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div
              key="jobs-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-16"
            >
              {/* Post-graduation info: CPT/OPT/STEM-OPT */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-6">Work Authorization (OPT, CPT & STEM OPT)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: "Curricular Practical Training (CPT)", detail: "Enables international students to gain off-campus internships or co-ops directly related to their field while studying." },
                    { name: "Optional Practical Training (OPT)", detail: "12-month post-graduation full-time work authorization in the U.S. for graduates to gain professional industry experience." },
                    { name: "STEM-OPT Extension", detail: "Graduates from STEM-designated programs get a 24-month extension, allowing up to 36 months (3 years) of U.S. work authorization." }
                  ].map((opt, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-400 transition-colors">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm mb-2">{opt.name}</h4>
                        <p className="text-slate-555 text-xs font-semibold leading-relaxed">{opt.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jobs salaries and recruiters table */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-6">CS Salaries and Roles (Post-Graduation)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="pb-3">Job Title</th>
                        <th className="pb-3">Average Salary</th>
                        <th className="pb-3 pl-4">Top Recruiters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {[
                        { title: "Machine Learning Engineer", salary: 143000, recruiters: "Google, Meta, OpenAI, Tesla, Nvidia, Apple" },
                        { title: "Distributed Systems Architect", salary: 138000, recruiters: "AWS, Microsoft Azure, Google Cloud, Oracle" },
                        { title: "Software Engineer III", salary: 128200, recruiters: "Netflix, Uber, Salesforce, Stripe, Airbnb" },
                        { title: "Security Engineer", salary: 122500, recruiters: "Palantir, CrowdStrike, Cloudflare, FireEye" },
                        { title: "Data Scientist", salary: 129331, recruiters: "Amazon, IBM, Deloitte, Bloomberg, Snowflake" }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 text-slate-900">{row.title}</td>
                          <td className="py-3 text-indigo-650 font-black">{formatPrice(row.salary)}/yr</td>
                          <td className="py-3 pl-4 text-slate-505 font-semibold">{row.recruiters}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ROI Analysis & Payback timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ROI Analysis */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-4">Is MS in CS in USA Worth It?</h3>
                  <div className="space-y-4 text-xs text-slate-600 font-semibold leading-relaxed">
                    <p>
                      Studying Computer Science in the U.S. is a major investment, but it often pays off. CS graduates regularly earn high starting salaries (frequently ranging from <strong>$100,000 to $150,000+ per year</strong>).
                    </p>
                    <p>
                      With 3 years of work authorization through STEM OPT, most international graduates recover their tuition and living expenditures within <strong>1.5 to 3 years</strong> of post-grad employment.
                    </p>
                  </div>
                </div>

                {/* H-1B Pathway & Residency */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-4">Pathway to H-1B and Green Card</h3>
                  <div className="space-y-4 text-xs text-slate-600 font-semibold leading-relaxed">
                    <p>
                      Transitioning from student status (F-1) to professional status (H-1B work visa) requires employer sponsorship. The H-1B visa is granted via a lottery system and is valid for up to 6 years.
                    </p>
                    <p>
                      During the H-1B visa term, sponsored professionals can begin the Green Card process for permanent U.S. residency. Planning early and leveraging the 3-year STEM OPT window significantly increases your lottery opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. TICKET BANNER CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white rounded-[36px] p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 mt-16">
          <div className="absolute right-[-10%] top-[-25%] w-[450px] h-[450px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-xl">
            <h3 className="text-2xl md:text-3xl font-black mb-3">Begin Your U.S. CS Masters Journey Today</h3>
            <p className="text-white/80 text-sm font-semibold leading-relaxed">
              UniCoach offers end-to-end guidance—from profile shortlisting, SOP formulation, to visa counselling. Connect with expert U.S. tech mentors today.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              to="/book-consultation"
              className="px-8 py-4 bg-white text-[#DE5C2B] hover:text-orange-700 font-extrabold text-sm rounded-2xl hover:bg-orange-50/90 shadow-md transition-all hover:-translate-y-0.5 duration-300 inline-flex items-center gap-2 group cursor-pointer"
            >
              <span>Book Free Counselling</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

      {/* Detailed Modal Overlay for University Details */}
      <AnimatePresence>
        {selectedUniDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUniDetails(null)}
              className="absolute inset-0 bg-slate-900"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] w-full max-w-lg p-7 relative z-10"
            >
              <button 
                onClick={() => setSelectedUniDetails(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X size={20} className="stroke-[2.5]" />
              </button>

              <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-6">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={getLogoUrl(selectedUniDetails.logo) || `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128` + encodeURIComponent(selectedUniDetails.name.charAt(0))} 
                    alt={selectedUniDetails.name} 
                    className="w-10 h-10 object-contain" 
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`; }}
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{selectedUniDetails.name}</h3>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    {selectedUniDetails.location}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Overview</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    A premier higher education institution in the United States offering leading research, global career networks, and postgraduate programs.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">QS / US News Rank</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 inline-flex items-center gap-1">
                      <Award size={13} className="text-indigo-655" />
                      #{selectedUniDetails.rank || 'N/A'}
                    </span>
                  </div>
                  <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tuition Fee / Year</span>
                    <span className="text-xs font-black text-indigo-650 mt-0.5 block">
                      {getTuitionDisplay(selectedUniDetails.tuition, currency)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3">
                    <BookOpen size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Eligibility Requirements</h5>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">GPA 3.0+ or equivalent, IELTS 6.5+ or TOEFL 85+ (standard for U.S. Masters)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-black text-slate-805">Application Deadline (2026)</h5>
                      <p className="text-xs text-slate-505 font-bold mt-0.5">Priority deadline: Jan-Feb 2026. General deadline: April-June 2026.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-5 mt-6">
                <button
                  onClick={() => {
                    let url = selectedUniDetails?.website || selectedUniDetails?.url;
                    if (!url || url === '#' || url === 'undefined') {
                      url = `https://www.google.com/search?q=${encodeURIComponent(selectedUniDetails?.name + ' official website')}`;
                    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
                      url = 'https://' + url;
                    }
                    window.open(url, '_blank');
                  }}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-colors text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Visit Website 🌐
                </button>
                <button
                  onClick={() => setSelectedUniDetails(null)}
                  className="px-4 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl transition-colors text-xs font-extrabold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedUniDetails(null);
                    openEligibilityModal('university-detail-modal');
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-colors text-xs font-extrabold cursor-pointer"
                >
                  Check Eligibility
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
};

export default USACSMastersPage;
