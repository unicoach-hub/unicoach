import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudyAbroadCTA from './StudyAbroadCTA';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useLead } from '../context/LeadContext';
import {
    Search, Filter, X, ChevronDown, ChevronRight,
    ExternalLink, MapPin, DollarSign, Award, Building, Globe, Check, CheckCircle2,
    Sparkles, BookOpen
} from 'lucide-react';
import { getUniversityLogo } from './logoResolver';
import PageLoader from './PageLoader';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../utils/universitySearchMatcher';
import CourseFinderCard from './CourseFinderCard';
import ProgramSelectionTools from './ProgramSelectionTools';
import { useProgramSelection } from '../utils/useProgramSelection';

// Universities are listed 10 at a time so big cities don't render dozens of cards at once
const UNI_PAGE_SIZE = 10;
import { API_BASE_URL } from '../config';
import { getOfficialRequirements, getGreText, CHECK_SITE } from '../utils/requirements';

const API_URL = API_BASE_URL;

// 3D Hover Card Component
const UniversityCard = ({ uni, onKnowMore, onCheckEligibility, searchTerm = '' }) => {
    const cardRef = useRef(null);
    const req = getOfficialRequirements(uni);
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
                            src={getUniversityLogo(uni.name, uni.logo)}
                            alt={uni.name}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
                            }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-[#DE5C2B] transition-colors" title={uni.name}>{uni.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin size={14} className="text-[#DE5C2B]" />
                            {uni.location}
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 flex-grow">
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50 group-hover:bg-orange-50/50 transition-colors">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <Award size={14} className="text-purple-500" />
                            Rank
                        </div>
                        <p className="font-semibold text-gray-900 text-sm truncate">{uni.rank}</p>
                    </div>
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50 group-hover:bg-orange-50/50 transition-colors">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <DollarSign size={14} className="text-green-500" />
                            Tuition Fees
                        </div>
                        <p className="font-semibold text-gray-900 text-sm truncate">{uni.tuition}</p>
                    </div>
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50 group-hover:bg-orange-50/50 transition-colors">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <Building size={14} className="text-[#DE5C2B]" />
                            Type
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                            <span className="px-2.5 py-0.5 bg-orange-100/80 text-[#C04A1D] rounded-full text-xs border border-orange-200">
                                {uni.type}
                            </span>
                        </p>
                    </div>
                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100/50 group-hover:bg-orange-50/50 transition-colors">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <Globe size={14} className="text-indigo-500" />
                            Website
                        </div>
                        <a
                            href={uni.website && uni.website !== '#' ? (uni.website.startsWith('http') ? uni.website : `https://${uni.website}`) : `https://www.google.com/search?q=${encodeURIComponent(uni.name + ' official website')}`}
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

                {/* Structured Eligibility Criteria Parameters */}
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 mb-4 text-xs space-y-2">
                    <p className="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-indigo-600" /> Admission Eligibility Criteria
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className="bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100/60 flex items-center justify-between font-medium">
                            <span className="text-slate-500 font-bold">Min Score</span>
                            <span className="text-slate-900 font-black">
                                {req.minScoreText || (req.gpaPercent ? `${req.gpaPercent}%` : CHECK_SITE)}
                            </span>
                        </div>
                        <div className="bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100/60 flex items-center justify-between font-medium">
                            <span className="text-slate-500 font-bold">IELTS / English</span>
                            <span className="text-slate-900 font-black">
                                {req.ieltsText || (req.ielts ? `IELTS ${req.ielts}+` : CHECK_SITE)}
                            </span>
                        </div>
                        <div className="bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100/60 flex items-center justify-between font-medium">
                            <span className="text-slate-500 font-bold">GRE Exam</span>
                            <span className="text-slate-900 font-black">
                                {getGreText(req) || CHECK_SITE}
                            </span>
                        </div>
                        <div className="bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100/60 flex items-center justify-between font-medium">
                            <span className="text-slate-500 font-bold">Work Exp</span>
                            <span className="text-slate-900 font-black">
                                {req.workExp || CHECK_SITE}
                            </span>
                        </div>
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
                            <BookOpen size={11} className="text-[#DE5C2B]" /> Offered Programs
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

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto" style={{ transform: "translateZ(20px)" }}>
                    <button
                        onClick={() => onKnowMore(uni)}
                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-1 group/btn z-20 relative"
                        data-cursor="pointer"
                    >
                        Know more <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => onCheckEligibility(uni)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:from-[#C04A1D] hover:to-[#A73D14] text-white rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-semibold z-20 relative text-center cursor-pointer"
                        data-cursor="pointer"
                    >
                        Check Eligibility
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// Skeleton Loader Component for University Cards
const UniversityCardSkeleton = () => {
    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col relative overflow-hidden animate-pulse">
            {/* University Logo & Header Skeleton */}
            <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 bg-slate-200/90 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-5 bg-slate-200/90 rounded-md w-4/5" />
                    <div className="h-3.5 bg-slate-200/60 rounded-md w-1/2" />
                </div>
            </div>

            {/* Details Grid (Rank & Tuition) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100/60 space-y-1.5">
                    <div className="h-3 bg-slate-200/70 rounded w-2/5" />
                    <div className="h-4 bg-slate-300/80 rounded w-3/4" />
                </div>
                <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100/60 space-y-1.5">
                    <div className="h-3 bg-slate-200/70 rounded w-2/5" />
                    <div className="h-4 bg-slate-300/80 rounded w-3/4" />
                </div>
            </div>

            {/* Eligibility Parameters Skeleton */}
            <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-xl p-3 mb-4 space-y-2">
                <div className="h-3 bg-indigo-100/80 rounded w-1/2" />
                <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-white/90 h-7 rounded-lg border border-indigo-100/40" />
                    <div className="bg-white/90 h-7 rounded-lg border border-indigo-100/40" />
                    <div className="bg-white/90 h-7 rounded-lg border border-indigo-100/40" />
                    <div className="bg-white/90 h-7 rounded-lg border border-indigo-100/40" />
                </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-2 mt-auto pt-1">
                <div className="flex-1 h-10 bg-slate-100 rounded-xl border border-slate-200/60" />
                <div className="flex-1 h-10 bg-indigo-100/70 rounded-xl" />
            </div>
        </div>
    );
};

const CityUniversitiesTemplate = ({ 
    cityName, 
    universitiesData, 
    filterCategories, 
    allCourses, 
    cityImage,
    title,
    subtitle,
    badgeText 
}) => {
    const navigate = useNavigate();
    const { openEligibilityModal } = useLead();
    const [searchTerm, setSearchTerm] = useState('');
    const [dynamicUniversities, setDynamicUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilters, setSelectedFilters] = useState({
        fees: [],
        degree: [],
        courses: [],
        cities: [cityName],
        intake: []
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('rank');
    const { selectedPrograms, selectedIds, toggleProgram, clearSelection } = useProgramSelection();
    // "See more universities": the count resets whenever the search, filters or sort change
    const listKey = [cityName, searchTerm, sortBy, selectedFilters.courses.join(','), selectedFilters.cities.join(',')].join('|');
    const [uniPaging, setUniPaging] = useState({ key: '', count: UNI_PAGE_SIZE });
    const visibleUniCount = uniPaging.key === listKey ? uniPaging.count : UNI_PAGE_SIZE;
    const showMoreUniversities = () => setUniPaging({ key: listKey, count: visibleUniCount + UNI_PAGE_SIZE });

    // Fetch dynamic universities from DB on mount/city change
    useEffect(() => {
        let isMounted = true;
        const fetchUnis = async () => {
            setLoading(true);
            setDynamicUniversities([]);
            try {
                const res = await fetch(`${API_URL}/public/universities-data/universities?city=${encodeURIComponent(cityName)}`);
                if (res.ok && isMounted) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const mapped = data.map(uni => {
                          // Requirements only when taken from the official site; the raw DB record holds defaults
                          const req = getOfficialRequirements(uni);
                          return {
                            id: uni._id,
                            name: uni.name,
                            location: uni.city ? `${uni.city}, ${uni.country?.name || ''}` : uni.country?.name || '',
                            rank: uni.rank || '--',
                            rankingNum: uni.rankingNum,
                            rankingSource: uni.rankingSource,
                            tuition: uni.tuition || '--',
                            type: uni.type ? uni.type.toUpperCase() : 'PUBLIC',
                            logo: uni.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`,
                            website: uni.website || '#',
                            description: uni.description || '',
                            eligibility: req.eligibilityText || '',
                            requirementsSource: req.source,
                            minScore: req.minScoreText,
                            ieltsScore: req.ieltsText,
                            minGpaPercent: req.gpaPercent,
                            minIeltsScore: req.ielts,
                            minGreScore: req.gre,
                            greRequired: req.greRequired,
                            workExp: req.workExp,
                            acceptanceRate: req.acceptanceRate,
                            courses: Array.isArray(uni.courses) && uni.courses.length > 0 ? uni.courses : ['Computer Science', 'Business Administration', 'Data Science'],
                            degreeLevels: Array.isArray(uni.degreeLevels) && uni.degreeLevels.length > 0 ? uni.degreeLevels : ["Bachelor's", "Master's"],
                            matchedCourses: uni.matchedCourses || []
                          };
                        });
                        setDynamicUniversities(mapped);
                    }
                }
            } catch (err) {
                console.error('Error loading dynamic universities:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchUnis();
        return () => { isMounted = false; };
    }, [cityName]);

    const activeUniversitiesData = dynamicUniversities.length > 0 ? dynamicUniversities : universitiesData;

    // Filter logic with intelligent course and keyword matching
    const filteredUniversities = activeUniversitiesData.filter(uni => {
        if (searchTerm && !matchesUniversitySearch(uni, searchTerm)) {
            return false;
        }
        if (selectedFilters.courses && selectedFilters.courses.length > 0) {
            const hasSelectedCourse = selectedFilters.courses.some(cFilter => 
                (uni.courses || []).some(c => c.toLowerCase().includes(cFilter.toLowerCase()))
            );
            if (!hasSelectedCourse) return false;
        }
        if (!selectedFilters.cities.includes(cityName)) return false;
        return true;
    });

    // Sort logic
    const sortedUniversities = [...filteredUniversities].sort((a, b) => {
        if (sortBy === 'rank') {
            if (a.rank === '--') return 1;
            if (b.rank === '--') return -1;
            return parseInt(a.rank) - parseInt(b.rank);
        }
        if (sortBy === 'tuition') {
            const aVal = parseInt(a.tuition.replace(/[^0-9]/g, ''));
            const bVal = parseInt(b.tuition.replace(/[^0-9]/g, ''));
            return aVal - bVal;
        }
        return a.name.localeCompare(b.name);
    });

    const handleFilterChange = (category, value) => {
        setSelectedFilters(prev => {
            const current = prev[category] || [];
            if (current.includes(value)) {
                return { ...prev, [category]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [category]: [...current, value] };
            }
        });
    };

    const clearAllFilters = () => {
        setSelectedFilters({
            fees: [],
            degree: [],
            courses: [],
            cities: [cityName],
            intake: []
        });
        setSearchTerm('');
    };

    const handleKnowMore = (uni) => {
        let url = uni.website;
        if (!url || url === '#' || url === 'undefined') {
            url = `https://www.google.com/search?q=${encodeURIComponent(uni.name + ' official website')}`;
        } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        window.open(url, '_blank');
    };

    const handleCheckEligibility = (uni) => {
        const uniLabel = uni?.name ? `University Card: ${uni.name} (${cityName})` : 'check-eligibility';
        openEligibilityModal(uniLabel);
    };

    if (loading && (!universitiesData || universitiesData.length === 0)) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-24 pb-20">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none z-0 mix-blend-multiply" />
            <div className="absolute top-40 -left-40 w-[30rem] h-[30rem] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none z-0 mix-blend-multiply" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Page Header */}
                {cityImage ? (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative w-full h-[240px] md:h-[280px] rounded-[32px] overflow-hidden mb-10 shadow-[0_15px_45px_rgba(0,0,0,0.04)] border border-white/60 flex items-end p-8 md:p-12 text-left"
                    >
                        <img 
                            src={cityImage} 
                            alt={cityName} 
                            className="absolute inset-0 w-full h-full object-cover brightness-[0.7] scale-[1.01]" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
                        <div className="relative z-10 text-white">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-black uppercase tracking-wider mb-3.5 shadow-sm">
                                <MapPin size={12} className="text-blue-400" />
                                <span>{badgeText || `Study in ${cityName}`}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white">
                                {title || `Top Universities in ${cityName}`}
                            </h1>
                            <p className="text-xs md:text-sm text-slate-200 font-bold mt-2.5 max-w-xl leading-relaxed">
                                {subtitle || "Explore rankings, fees, admissions criteria, and eligibility for leading institutions in 2026."}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 text-center max-w-3xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/80 border border-orange-200 text-blue-800 text-sm font-semibold mb-4 backdrop-blur-sm shadow-sm">
                            <MapPin size={16} />
                            {badgeText || `Study in ${cityName}`}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                            {title ? (
                                title
                            ) : (
                                <>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">{cityName}</span></>
                            )}
                        </h1>
                        <p className="text-lg text-gray-600 font-medium">
                            {subtitle || "Explore rankings, fees, and eligibility for leading institutions in 2026."}
                        </p>
                    </motion.div>
                )}

                {/* Search and Filter Bar - Glassmorphic */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row gap-4 mb-8 bg-white/60 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#DE5C2B] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search universities by course (e.g. CS, MBA, Data Science), name, or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white/80 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-gray-700"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            data-cursor="hover"
                            className={`flex items-center gap-2 px-8 py-4 rounded-2xl transition-all font-semibold shadow-sm border ${
                                isFilterOpen 
                                ? 'bg-[#DE5C2B] text-white border-blue-600 hover:bg-[#C04A1D] shadow-orange-500/20' 
                                : 'bg-white/80 border-gray-100 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Filter size={20} />
                            Filters
                            {Object.values(selectedFilters).flat().length > 1 && (
                                <span className={`ml-2 px-2.5 py-0.5 text-xs rounded-full ${isFilterOpen ? 'bg-white/20' : 'bg-orange-100 text-[#C04A1D]'}`}>
                                    {Object.values(selectedFilters).flat().length - 1} {/* -1 to ignore default city */}
                                </span>
                            )}
                        </button>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            data-cursor="pointer"
                            className="px-6 py-4 bg-white/80 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm font-semibold text-gray-700 appearance-none cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '3rem' }}
                        >
                            <option value="rank">Sort by Rank</option>
                            <option value="tuition">Sort by Tuition</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>
                </motion.div>

                {/* Sliding Filters Panel */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.06)] border border-white overflow-hidden mb-8"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Filter size={24} className="text-[#DE5C2B]" /> Advanced Filters
                                    </h3>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-semibold"
                                        data-cursor="pointer"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {/* City Filter (Read-only representation) */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Target City</h4>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="w-5 h-5 rounded border border-blue-500 bg-[#DE5C2B] flex items-center justify-center text-white">
                                                    <Check size={14} />
                                                </div>
                                                <span className="text-gray-700 font-medium group-hover:text-[#DE5C2B] transition-colors">{cityName}</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Fees Filter */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">1st Year Fees</h4>
                                        <div className="space-y-3">
                                            {filterCategories.fees.map((fee) => (
                                                <label key={fee.value} className="flex items-center gap-3 cursor-pointer group" data-cursor="pointer">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedFilters.fees.includes(fee.value) ? 'bg-[#DE5C2B] border-blue-600 text-white' : 'border-gray-300 group-hover:border-blue-400 bg-white'}`}>
                                                        {selectedFilters.fees.includes(fee.value) && <Check size={14} />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={selectedFilters.fees.includes(fee.value)}
                                                        onChange={() => handleFilterChange('fees', fee.value)}
                                                    />
                                                    <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{fee.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Degree Filter */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Degree Level</h4>
                                        <div className="space-y-3">
                                            {filterCategories.degree.map((degree) => (
                                                <label key={degree.value} className="flex items-center gap-3 cursor-pointer group" data-cursor="pointer">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedFilters.degree.includes(degree.value) ? 'bg-[#DE5C2B] border-blue-600 text-white' : 'border-gray-300 group-hover:border-blue-400 bg-white'}`}>
                                                        {selectedFilters.degree.includes(degree.value) && <Check size={14} />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={selectedFilters.degree.includes(degree.value)}
                                                        onChange={() => handleFilterChange('degree', degree.value)}
                                                    />
                                                    <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{degree.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Intake Filter */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Intake</h4>
                                        <div className="space-y-3">
                                            {filterCategories.intake.map((intake) => (
                                                <label key={intake.value} className="flex items-center gap-3 cursor-pointer group" data-cursor="pointer">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedFilters.intake.includes(intake.value) ? 'bg-[#DE5C2B] border-blue-600 text-white' : 'border-gray-300 group-hover:border-blue-400 bg-white'}`}>
                                                        {selectedFilters.intake.includes(intake.value) && <Check size={14} />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={selectedFilters.intake.includes(intake.value)}
                                                        onChange={() => handleFilterChange('intake', intake.value)}
                                                    />
                                                    <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{intake.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-semibold shadow-lg shadow-gray-900/20"
                                        data-cursor="pointer"
                                    >
                                        Show {sortedUniversities.length} Results
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Header */}
                <div className="flex justify-between items-center mb-6 px-2">
                    {loading ? (
                        <div className="flex items-center gap-2.5 text-[#DE5C2B] font-semibold text-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DE5C2B]"></span>
                            </span>
                            <span>Loading verified universities in {cityName}...</span>
                        </div>
                    ) : (
                        <p className="text-gray-700 font-bold text-lg">
                            {sortedUniversities.length} Universities Found
                        </p>
                    )}
                </div>

                {/* University Cards Grid or Skeleton Loader */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <UniversityCardSkeleton key={i} />
                        ))}
                    </div>
                ) : sortedUniversities.length > 0 ? (
                    <div className="space-y-4">
                        {sortedUniversities.slice(0, visibleUniCount).map((uni, index) => (
                            <CourseFinderCard
                                key={uni.id || uni._id || uni.name || index}
                                uni={uni}
                                searchQuery={searchTerm}
                                selectedProgramIds={selectedIds}
                                onToggleProgramSelect={toggleProgram}
                                onOpenDetailsModal={handleKnowMore}
                                onOpenEligibilityModal={handleCheckEligibility}
                            />
                        ))}
                        {sortedUniversities.length > visibleUniCount && (
                            <div className="pt-2 text-center">
                                <button
                                  type="button"
                                  onClick={showMoreUniversities}
                                  className="px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                  See {Math.min(UNI_PAGE_SIZE, sortedUniversities.length - visibleUniCount)} more universities
                                </button>
                                <p className="mt-2 text-[11px] font-medium text-slate-400">
                                    Showing {visibleUniCount} of {sortedUniversities.length} universities in {cityName}
                                </p>
                            </div>
                        )}
                        <ProgramSelectionTools selectedPrograms={selectedPrograms} onClearSelection={clearSelection} />
                    </div>
                ) : (
                    /* No Results Empty State (only when not loading) */
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white shadow-sm mt-8"
                    >
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-orange-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Universities Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">We couldn't find any universities matching your current filters. Try adjusting them or clearing the search.</p>
                        <button
                            onClick={clearAllFilters}
                            className="px-8 py-3.5 bg-[#DE5C2B] text-white rounded-xl hover:bg-[#C04A1D] transition-all font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
                            data-cursor="pointer"
                        >
                            Clear All Filters
                        </button>
                    </motion.div>
                )}

            {/* CTA Section */}
            <StudyAbroadCTA country={cityName} />
            </div>
        </div>
    );
};

export default CityUniversitiesTemplate;
