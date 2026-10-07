import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Newspaper, 
    FileText, 
    ArrowRight, 
    ChevronDown, 
    Calendar, 
    Download, 
    Mail, 
    ChevronLeft, 
    ChevronRight,
    Users,
    Building2,
    CheckCircle2,
    Sparkles,
    Briefcase,
    Globe2,
    Award,
    Volume2,
    Search,
    Tag,
    Plane,
    GraduationCap,
    FileCode,
    TrendingUp
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const NewsroomPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mediaForm, setMediaForm] = useState({ name: '', organization: '', email: '', query: '' });
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    // Dynamic News State
    const [dbNews, setDbNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);

    // Media Kit Download State Simulation
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const API_URL = API_BASE_URL;

    // Fetch dynamic news from API
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`${API_URL}/news`);
                if (res.ok) {
                    const data = await res.json();
                    setDbNews(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Error fetching news:", err);
            } finally {
                setLoadingNews(false);
            }
        };
        fetchNews();
    }, []);

    const getAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const cleanBase = API_URL.replace('/api', '');
        return `${cleanBase}${url}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    // Category Tabs Synchronized with Admin portal
    const NEWS_TABS = [
        { key: 'overview', name: 'Overview', icon: <Sparkles size={13} /> },
        { key: 'news', name: 'News Releases', icon: <Newspaper size={13} /> },
        { key: 'reports', name: 'Student Reports', icon: <FileText size={13} /> },
        { key: 'press', name: 'In the Press', icon: <Globe2 size={13} /> },
        { key: 'corporate', name: 'Corporate Updates', icon: <Building2 size={13} /> },
        { key: 'immigration', name: 'Immigration & Visa', icon: <Plane size={13} /> },
        { key: 'university', name: 'University News', icon: <GraduationCap size={13} /> },
        { key: 'policy', name: 'Policy Changes', icon: <FileCode size={13} /> }
    ];

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setTimeout(() => {
            setFormSubmitted(false);
            setMediaForm({ name: '', organization: '', email: '', query: '' });
        }, 2500);
    };

    const handleDownloadMediaKit = () => {
        if (isDownloading) return;
        setIsDownloading(true);
        setDownloadProgress(0);
    };

    useEffect(() => {
        if (!isDownloading) return;
        const interval = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsDownloading(false);
                        alert("Mock Media Kit ZIP Download Complete!");
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 150);
        return () => clearInterval(interval);
    }, [isDownloading]);

    // Fallbacks
    const defaultNewsSlides = [
        {
            title: "UniCoach Announces Expansion of Offline Student Centers with 15 New Hubs in 2026",
            date: "24 Mar 2026",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
            category: "Corporate Update",
            description: "With physical student engagement growing by 180%, UniCoach is expanding its physical presence into Tier 2 and Tier 3 cities, offering in-person IELTS preparation and physical university fairs."
        },
        {
            title: "How UniCoach Is Helping Millions Build Global Careers | Arnav Kumar, Co-Founder & CEO",
            date: "26 Nov 2025",
            image: "/newsroom_spotlight.webp",
            category: "News Releases",
            description: "Co-Founder & CEO Arnav Kumar sits down to discuss the massive shift in corporate expectations and how Indian graduates are bypassing standard domestic limitations to build premium global careers."
        }
    ];

    const defaultReports = [
        {
            id: 'rep-1',
            title: "More Students Are Walking In With a Shortlist Already Made",
            description: "Our 2026 student intent index reveals a massive rise in student preparation; over 65% of applicants initiate counselling with specific university targets already in mind.",
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
            category: "Student Reports"
        },
        {
            id: 'rep-2',
            title: "Scholarships Are Becoming a Bigger Part of How Students Choose",
            description: "Rising living costs in destination countries place scholarship availability as the top deciding factor for 78% of Indian study abroad students this academic cycle.",
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
            category: "Student Reports"
        }
    ];

    // Helper to get news for any active tab
    const getTabCategoryNews = (key) => {
        if (key === 'news') {
            return dbNews.filter(n => !n.category || n.category === 'News Releases' || n.category === 'General');
        }
        if (key === 'reports') {
            return dbNews.filter(n => n.category === 'Student Reports');
        }
        if (key === 'press') {
            return dbNews.filter(n => n.category === 'In the Press');
        }
        if (key === 'corporate') {
            return dbNews.filter(n => n.category === 'Corporate Update');
        }
        if (key === 'immigration') {
            return dbNews.filter(n => n.category === 'Immigration Updates' || (n.category && (n.category.toLowerCase().includes('immigration') || n.category.toLowerCase().includes('visa'))));
        }
        if (key === 'university') {
            return dbNews.filter(n => n.category === 'University News' || (n.category && n.category.toLowerCase().includes('university')));
        }
        if (key === 'policy') {
            return dbNews.filter(n => n.category === 'Policy Changes' || (n.category && n.category.toLowerCase().includes('policy')));
        }
        return dbNews;
    };

    const currentTabNews = getTabCategoryNews(activeTab);

    // Apply Search Filter
    const filteredTabNews = currentTabNews.filter(n => 
        !searchTerm || 
        (n.title && n.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (n.description && n.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (n.category && n.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Featured Slides on Overview
    const allOverviewSlides = dbNews.length > 0 ? dbNews.slice(0, 5) : defaultNewsSlides;

    const milestones = [
        { year: "2021", event: "UniCoach Founded in Bengaluru with 5 mentors" },
        { year: "2023", event: "Launched collateral-free study abroad loans, funded 10,000+ students" },
        { year: "2025", event: "Reached 300,000+ webinar attendees and partnered with top EU institutions" },
        { year: "2026", event: "Expanding offline network to 15 Tier 2 cities across India" }
    ];

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % (allOverviewSlides.length || 1));
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + (allOverviewSlides.length || 1)) % (allOverviewSlides.length || 1));
    };

    const currentHero = allOverviewSlides[currentSlide] || defaultNewsSlides[0];
    const activeTabMeta = NEWS_TABS.find(t => t.key === activeTab) || NEWS_TABS[0];

    const navigateToNewsDetail = (item) => {
        if (item && (item.slug || item._id)) {
            navigate(`/newsroom/${item.slug || item._id}`);
        } else {
            setActiveTab('news');
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20 relative overflow-hidden select-none">
            
            {/* Background glows */}
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#DE5C2B]/5 blur-[130px] pointer-events-none"></div>

            {/* Header Masthead */}
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 mb-8 text-left z-10 relative">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 border border-indigo-150 rounded-full text-indigo-700 text-xs font-black uppercase tracking-wider mb-3">
                    <Sparkles size={13} className="text-indigo-600" />
                    <span>Press & Communications Hub</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900">
                    UniCoach Newsroom
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1 max-w-2xl leading-relaxed">
                    Official press releases, verified admissions updates, policy insights, and student research indexes.
                </p>
            </div>

            {/* Category Filter & Search Bar */}
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 mb-10 relative z-20">
                <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    
                    {/* Category Filter Tabs - Wrapping Pills without ugly scrollbars */}
                    <div className="flex flex-wrap items-center gap-2">
                        {NEWS_TABS.map((tab) => {
                            const isActive = activeTab === tab.key;
                            const count = tab.key === 'overview' ? dbNews.length : getTabCategoryNews(tab.key).length;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                        isActive 
                                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 border border-slate-900' 
                                            : 'bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100 hover:text-indigo-600'
                                    }`}
                                >
                                    <span className={isActive ? 'text-indigo-300' : 'text-slate-500'}>{tab.icon}</span>
                                    <span>{tab.name}</span>
                                    {count > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[220px] sm:min-w-[260px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search news, topics..."
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                        />
                    </div>
                </div>
            </div>

            {/* Content View */}
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 space-y-16 z-10 relative">
                
                {loadingNews ? (
                    <div className="space-y-12">
                        <div className="bg-white border border-slate-200/60 rounded-[40px] p-8 md:p-12 animate-pulse flex flex-col lg:flex-row gap-8">
                            <div className="lg:w-1/2 space-y-4">
                                <div className="h-6 w-24 bg-slate-200 rounded-lg" />
                                <div className="h-8 bg-slate-200 rounded w-3/4" />
                                <div className="h-4 bg-slate-100 rounded w-full" />
                                <div className="h-4 bg-slate-100 rounded w-5/6" />
                            </div>
                            <div className="lg:w-1/2 h-64 bg-slate-200 rounded-3xl" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((k) => (
                                <div key={k} className="bg-white border border-slate-200/60 rounded-3xl p-6 animate-pulse space-y-4">
                                    <div className="h-44 bg-slate-200 rounded-2xl" />
                                    <div className="h-5 bg-slate-200 rounded w-2/3" />
                                    <div className="h-4 bg-slate-100 rounded w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'overview' ? (
                    <>
                        {/* Featured news Slider */}
                        <section className="bg-white border border-slate-200/60 rounded-[40px] overflow-hidden shadow-sm flex flex-col lg:flex-row group relative min-h-[420px]">
                            {/* Left details */}
                            <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-between text-left">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl border border-indigo-100/40">
                                            {currentHero.category || 'News Spotlight'}
                                        </span>
                                        <span className="text-slate-450 text-xs font-bold">
                                            {formatDate(currentHero.createdAt) || currentHero.date || 'Latest'}
                                        </span>
                                    </div>
                                    <h2 
                                        onClick={() => navigateToNewsDetail(currentHero)}
                                        className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors duration-300 cursor-pointer"
                                    >
                                        {currentHero.title}
                                    </h2>
                                    <p className="text-slate-500 text-xs md:text-sm font-semibold leading-relaxed line-clamp-3">
                                        {currentHero.description || (currentHero.body ? currentHero.body.replace(/<[^>]+>/g, '').slice(0, 180) + '...' : '')}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                                    <button 
                                        onClick={() => navigateToNewsDetail(currentHero)}
                                        className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-indigo-600 transition-all cursor-pointer shadow-sm hover:scale-102"
                                    >
                                        <span>Read Story</span>
                                        <ArrowRight size={14} />
                                    </button>

                                    {/* Slider Controls */}
                                    <div className="flex items-center gap-1.5 ml-auto">
                                        <button 
                                            onClick={prevSlide}
                                            className="p-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl cursor-pointer"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button 
                                            onClick={nextSlide}
                                            className="p-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl cursor-pointer"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Image Display */}
                            <div 
                                onClick={() => navigateToNewsDetail(currentHero)}
                                className="lg:w-1/2 relative bg-slate-950 overflow-hidden min-h-[300px] lg:min-h-auto border-l border-slate-100 flex items-center justify-center cursor-pointer"
                            >
                                <img 
                                    src={currentHero.imageUrl ? getAbsoluteUrl(currentHero.imageUrl) : (currentHero.image || '/newsroom_spotlight.webp')} 
                                    alt={currentHero.title} 
                                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 absolute inset-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-transparent"></div>
                            </div>
                        </section>

                        {/* Mid Row Statistics Dashboard */}
                        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: "Visa Approval Ratio", val: "98.6%", icon: <Award size={20} className="text-emerald-600" /> },
                                { label: "Partner Universities", val: "500+", icon: <Globe2 size={20} className="text-[#DE5C2B]" /> },
                                { label: "Physical Centers", val: "15+", icon: <Building2 size={20} className="text-indigo-600" /> },
                                { label: "Global Alumni", val: "1.2L+", icon: <Users size={20} className="text-purple-600" /> }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white border border-slate-200/60 rounded-[28px] p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-3 bg-indigo-50/80 border border-indigo-100/30 rounded-2xl">
                                        {stat.icon}
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-2xl font-black text-slate-800">{stat.val}</span>
                                        <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider">{stat.label}</span>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Split Section: Reports Feed & Interactive Media Kit Download */}
                        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                            
                            {/* Reports List (8 Columns) */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="text-indigo-600 animate-pulse" size={20} />
                                        <h3 className="text-xl font-bold tracking-tight text-slate-800">
                                            UniCoach Research Reports
                                        </h3>
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab('reports')}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>See all Reports</span>
                                        <ArrowRight size={13} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(getTabCategoryNews('reports').length > 0 ? getTabCategoryNews('reports') : defaultReports).slice(0, 2).map((rep, idx) => (
                                        <div 
                                            key={rep._id || rep.id || idx} 
                                            onClick={() => navigateToNewsDetail(rep)}
                                            className="bg-white border border-slate-200/60 rounded-[32px] overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        >
                                            <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden flex items-center justify-center">
                                                <img 
                                                    src={rep.imageUrl ? getAbsoluteUrl(rep.imageUrl) : (rep.image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80')} 
                                                    alt={rep.title} 
                                                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-50"></div>
                                                <span className="absolute bottom-4 left-4 text-[9px] font-extrabold uppercase text-indigo-650 bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 rounded-lg backdrop-blur-sm">
                                                    {rep.category || 'Student Reports'}
                                                </span>
                                            </div>
                                            <div className="p-6 space-y-2">
                                                <h4 className="font-bold text-slate-800 text-base leading-snug group-hover:text-indigo-600 transition-colors mb-2">
                                                    {rep.title}
                                                </h4>
                                                <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-3">
                                                    {rep.description || (rep.body ? rep.body.replace(/<[^>]+>/g, '').slice(0, 120) + '...' : '')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Graphics Panel / Media Kit (4 Columns) */}
                            <div className="lg:col-span-4 space-y-6">
                                <h3 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                                    <Download size={20} className="text-indigo-600" />
                                    Media Resources
                                </h3>

                                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-[32px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px] text-white">
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
                                        style={{ backgroundImage: `url('/newsroom_hero.webp')` }}
                                    />
                                    
                                    <div className="space-y-3 relative z-10 text-left">
                                        <span className="text-[9px] font-black uppercase text-indigo-300 bg-indigo-950/40 w-fit px-2.5 py-1 rounded-md border border-indigo-700/30">
                                            Press Kit v2.6
                                        </span>
                                        <h3 className="text-lg font-bold tracking-tight leading-snug">
                                            Download Corporate Assets & Guidelines
                                        </h3>
                                        <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                                            Access our high-resolution vector logos, executive headshots, brand color guidelines, and founder biographies.
                                        </p>
                                    </div>

                                    <div className="relative z-10 pt-6">
                                        {isDownloading ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                                                    <span>Downloading assets...</span>
                                                    <span>{downloadProgress}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handleDownloadMediaKit}
                                                className="w-full inline-flex items-center justify-center gap-2 text-slate-950 font-bold text-xs bg-white hover:bg-indigo-400 hover:text-white p-3.5 rounded-2xl transition-all cursor-pointer shadow-md"
                                            >
                                                <Download size={14} />
                                                <span>Download Media Kit (32MB)</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Interactive Growth Milestones Timeline */}
                        <section className="bg-white border border-slate-200/60 rounded-[40px] p-8 md:p-12 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-72 h-72 bg-[#DE5C2B]/5 rounded-full blur-[90px] pointer-events-none"></div>
                            
                            <div className="text-center max-w-xl mx-auto mb-10">
                                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest block mb-1">Company Trajectory</span>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                                    Our Milestones & Growth
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none relative z-10 text-left">
                                {milestones.map((ms, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 relative group hover:border-indigo-650/30 transition-colors">
                                        <div className="text-3xl font-black text-indigo-600 mb-2">{ms.year}</div>
                                        <p className="text-slate-650 text-xs font-semibold leading-relaxed">{ms.event}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    <section className="space-y-8 text-left">
                        {/* Section Sub-header */}
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                            <div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-0.5">
                                    Category Archive
                                </span>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                    {activeTabMeta.name}
                                </h2>
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
                                {filteredTabNews.length} {filteredTabNews.length === 1 ? 'Article' : 'Articles'}
                            </span>
                        </div>

                        {filteredTabNews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTabNews.map((item, idx) => (
                                    <div 
                                        key={item._id || idx} 
                                        onClick={() => navigateToNewsDetail(item)}
                                        className="bg-white border border-slate-200/60 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
                                    >
                                        <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden flex items-center justify-center">
                                            <img 
                                                src={item.imageUrl ? getAbsoluteUrl(item.imageUrl) : (item.image || '/newsroom_spotlight.webp')} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                                            />
                                            <span className="absolute bottom-3 left-3 text-[9px] font-black uppercase text-indigo-700 bg-indigo-50/95 border border-indigo-200/60 px-2.5 py-0.5 rounded-lg backdrop-blur-sm shadow-sm">
                                                {item.category || activeTabMeta.name}
                                            </span>
                                        </div>
                                        <div className="p-6 flex-grow flex flex-col justify-between text-left space-y-4">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                                                    {formatDate(item.createdAt) || item.date || 'Recent Update'}
                                                </span>
                                                <h4 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-indigo-600 transition-colors">
                                                    {item.title}
                                                </h4>
                                                <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-3 mt-2">
                                                    {item.description || (item.body ? item.body.replace(/<[^>]+>/g, '').slice(0, 140) + '...' : '')}
                                                </p>
                                            </div>
                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                                    <span>Read full story</span>
                                                    <ArrowRight size={13} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200/80 rounded-[32px] p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100/60">
                                    <Newspaper size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">No Articles Yet in {activeTabMeta.name}</h3>
                                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                    We haven't published an article under this category yet. Check back soon or browse other updates.
                                </p>
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                                >
                                    Return to Overview
                                </button>
                            </div>
                        )}
                    </section>
                )}

            </div>
        </main>
    );
};

export default NewsroomPage;
