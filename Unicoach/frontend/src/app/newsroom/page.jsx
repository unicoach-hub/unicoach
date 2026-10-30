import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Newspaper,
    FileText,
    ArrowRight,
    Download,
    ChevronLeft,
    ChevronRight,
    Users,
    Building2,
    Sparkles,
    Globe2,
    Award,
    Search,
    Plane,
    GraduationCap,
    FileCode
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import CoverImage from '../../components/CoverImage';
import { RailwayBoard } from '../../components/desi/DesiPop';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../components/desi/DesiKit';
import { BookOkCta } from '../../components/desi/BookOkCta';

const HI = "font-urbanist font-extrabold leading-none";

// Report cover drawn from the report's own headline number, instead of a stock photo
const StatCover = ({ stat, label, tone, soft }) => (
    <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-7 pt-8" style={{ background: soft }}>
        <span className="font-urbanist font-black leading-none text-[52px] sm:text-[64px] tracking-[-0.03em]" style={{ color: tone }}>{stat}%</span>
        <span className="mt-2 text-[13px] font-semibold text-[#16130F] max-w-[240px] leading-snug">{label}</span>
        <div className="mt-4 h-3.5 w-full max-w-[280px] rounded-full bg-white overflow-hidden border-2 border-[#16130F]">
            <div className="h-full border-r-2 border-[#16130F]" style={{ width: `${stat}%`, background: tone }} />
        </div>
        {/* in the flow under the bar, so it never sits on top of it */}
        <span className="mt-1.5 text-[10px] font-bold text-[#5B544A]">UniCoach student survey, 2026</span>
    </div>
);

// Poster colours that rotate through cards
const TONES = [
    { c: '#D0362E', fg: '#FFFFFF', soft: '#FCE3DA' },
    { c: '#F2B705', fg: '#16130F', soft: '#FFF1B8' },
    { c: '#14837E', fg: '#FFFFFF', soft: '#DDF3EF' },
    { c: '#B8285B', fg: '#FFFFFF', soft: '#FBD9E6' },
];

const NewsroomPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    
    // Dynamic News State
    const [dbNews, setDbNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);

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
            stat: 65, statLabel: 'of students arrive with a university shortlist already in mind', tone: '#D0362E', soft: '#FCE3DA',
            category: "Student Reports"
        },
        {
            id: 'rep-2',
            title: "Scholarships Are Becoming a Bigger Part of How Students Choose",
            description: "Rising living costs in destination countries place scholarship availability as the top deciding factor for 78% of Indian study abroad students this academic cycle.",
            stat: 78, statLabel: 'say scholarships decide where they apply', tone: '#14837E', soft: '#DDF3EF',
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
        <main className="min-h-screen bg-[#FFF6E5] text-[#16130F] font-['Onest',sans-serif] pb-20 relative overflow-hidden select-none">

            {/* ── HERO: teal poster band, railway station board on wide screens ── */}
            <DesiHero
                tone="teal"
                sign={{ hi: 'ताज़ा ख़बर', en: 'PRESS & UPDATES' }}
                title="UniCoach Newsroom"
                subtitle="Official press releases, verified admissions updates, policy insights, and student research indexes."
                stickers={(
                    <Sticker bg="#F2B705" tilt={-1.5}>
                        <Sparkles size={13} />
                        Press &amp; Communications Hub
                    </Sticker>
                )}
                aside={(
                    <div className="hidden lg:flex justify-end pointer-events-none">
                        <div className="w-[300px]">
                            <RailwayBoard hi="समाचार" en="NEWSROOM" codeLeft="PRESS" codeRight="UPDATES" />
                        </div>
                    </div>
                )}
            />

            {/* ── Category Filter & Search Bar ── */}
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 -mt-7 mb-12 relative z-20">
                <InkCard className="p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

                    {/* Category tabs: one swipeable row on phones, wrapping chips on wider screens */}
                    <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto -mx-1 px-1 pt-0.5 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {NEWS_TABS.map((tab) => {
                            const isActive = activeTab === tab.key;
                            const count = tab.key === 'overview' ? dbNews.length : getTabCategoryNews(tab.key).length;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`shrink-0 whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-extrabold border-2 border-[#16130F] transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? 'bg-[#16130F] text-white shadow-[3px_3px_0_#D0362E]'
                                            : 'bg-[#FFF6E5] text-[#16130F] hover:bg-[#FFF1B8] shadow-[2px_2px_0_#16130F]'
                                    }`}
                                >
                                    <span className={isActive ? 'text-[#F2B705]' : 'text-[#D0362E]'}>{tab.icon}</span>
                                    <span>{tab.name}</span>
                                    {count > 0 && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                                            isActive ? 'bg-[#F2B705] text-[#16130F]' : 'bg-white border border-[#16130F] text-[#16130F]'
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="relative sm:min-w-[260px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16130F]" size={15} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search news, topics..."
                            className="w-full bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg pl-10 pr-4 py-2.5 text-xs font-bold text-[#16130F] placeholder:text-[#8A7F70] outline-none focus:bg-white focus:shadow-[3px_3px_0_#14837E] transition-shadow"
                        />
                    </div>
                </InkCard>
            </div>

            {/* ── Content View ── */}
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 space-y-16 z-10 relative">

                {loadingNews ? (
                    <div className="space-y-12">
                        <InkCard className="p-6 md:p-12 animate-pulse flex flex-col lg:flex-row gap-8">
                            <div className="lg:w-1/2 space-y-4">
                                <div className="h-6 w-24 bg-[#FCE3DA] rounded-md" />
                                <div className="h-8 bg-[#EADFCB] rounded w-3/4" />
                                <div className="h-4 bg-[#F3EBDB] rounded w-full" />
                                <div className="h-4 bg-[#F3EBDB] rounded w-5/6" />
                            </div>
                            <div className="lg:w-1/2 h-64 bg-[#EADFCB] rounded-lg" />
                        </InkCard>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((k) => (
                                <InkCard key={k} className="p-5 animate-pulse space-y-4">
                                    <div className="h-44 bg-[#EADFCB] rounded-lg" />
                                    <div className="h-5 bg-[#EADFCB] rounded w-2/3" />
                                    <div className="h-4 bg-[#F3EBDB] rounded w-full" />
                                </InkCard>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'overview' ? (
                    <>
                        {/* Featured news slider: a newspaper front page */}
                        <section className="bg-[#FFFDF6] border-[3px] border-[#16130F] rounded-[14px] overflow-hidden shadow-[7px_7px_0_#16130F] flex flex-col lg:flex-row group relative lg:min-h-[420px]">
                            {/* Left details */}
                            <div className="lg:w-1/2 p-5 sm:p-8 md:p-10 flex flex-col justify-between text-left">
                                <div className="space-y-4">
                                    <div className="flex items-end justify-between gap-3 pb-3 border-b-[5px] border-double border-[#16130F]">
                                        <span className={`${HI} text-[22px] sm:text-[26px] text-[#16130F]`}>Aaj ki headline</span>
                                        <span className="text-[#5B544A] text-[11px] font-extrabold uppercase tracking-wider text-right">
                                            {formatDate(currentHero.createdAt) || currentHero.date || 'Latest'}
                                        </span>
                                    </div>
                                    <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-[#D0362E] text-white px-2.5 py-1 rounded-md border-2 border-[#16130F] -rotate-1">
                                        {currentHero.category || 'News Spotlight'}
                                    </span>
                                    <h2
                                        onClick={() => navigateToNewsDetail(currentHero)}
                                        className="font-urbanist text-[26px] sm:text-[32px] font-black text-[#16130F] tracking-[-0.03em] leading-[1.08] group-hover:text-[#D0362E] transition-colors duration-300 cursor-pointer"
                                    >
                                        {currentHero.title}
                                    </h2>
                                    <p className="text-[#5B544A] text-[13px] md:text-sm font-medium leading-relaxed line-clamp-3">
                                        {currentHero.description || (currentHero.body ? currentHero.body.replace(/<[^>]+>/g, '').slice(0, 180) + '...' : '')}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 mt-8 pt-5 border-t-2 border-dashed border-[#16130F]/30">
                                    <button
                                        onClick={() => navigateToNewsDetail(currentHero)}
                                        className="no-shine inline-flex items-center gap-1.5 px-5 py-3 bg-[#16130F] text-white rounded-lg border-[3px] border-[#16130F] text-xs font-extrabold shadow-[4px_4px_0_#F2B705] hover:shadow-[6px_6px_0_#F2B705] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                                    >
                                        <span>Read Story</span>
                                        <ArrowRight size={14} />
                                    </button>

                                    {/* Slider Controls */}
                                    <div className="flex items-center gap-2 ml-auto">
                                        <button
                                            onClick={prevSlide}
                                            aria-label="Previous story"
                                            className="p-2.5 border-2 border-[#16130F] bg-white hover:bg-[#FFF1B8] text-[#16130F] rounded-lg shadow-[2px_2px_0_#16130F] cursor-pointer"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={nextSlide}
                                            aria-label="Next story"
                                            className="p-2.5 border-2 border-[#16130F] bg-white hover:bg-[#FFF1B8] text-[#16130F] rounded-lg shadow-[2px_2px_0_#16130F] cursor-pointer"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Image Display */}
                            <div
                                onClick={() => navigateToNewsDetail(currentHero)}
                                className="lg:w-1/2 relative bg-[#16130F] overflow-hidden min-h-[240px] sm:min-h-[300px] border-t-[3px] lg:border-t-0 lg:border-l-[3px] border-[#16130F] flex items-center justify-center cursor-pointer"
                            >
                                <div className="absolute inset-0">
                                    <CoverImage
                                        src={currentHero.imageUrl ? getAbsoluteUrl(currentHero.imageUrl) : (currentHero.image || '/newsroom_spotlight.webp')}
                                        alt={currentHero.title}
                                        title={currentHero.title}
                                        category={currentHero.category}
                                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Mid Row Statistics */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                            {[
                                { label: "Visa Approval Ratio", val: "98.6%", Icon: Award, ...TONES[2] },
                                { label: "Partner Universities", val: "500+", Icon: Globe2, ...TONES[0] },
                                { label: "Physical Centers", val: "15+", Icon: Building2, ...TONES[1] },
                                { label: "Global Alumni", val: "1.2L+", Icon: Users, ...TONES[3] }
                            ].map((stat, idx) => (
                                <div key={idx} className="border-[3px] border-[#16130F] rounded-[14px] p-5 flex items-center gap-4 shadow-[5px_5px_0_#16130F]" style={{ background: stat.soft }}>
                                    <div className="p-3 rounded-lg border-[3px] border-[#16130F] shrink-0" style={{ background: stat.c, color: stat.fg }}>
                                        <stat.Icon size={20} />
                                    </div>
                                    <div className="text-left min-w-0">
                                        <span className="block font-urbanist text-[26px] font-black leading-none text-[#16130F]">{stat.val}</span>
                                        <span className="mt-1 block text-[10px] text-[#3D362E] font-extrabold uppercase tracking-wider">{stat.label}</span>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Split Section: Reports Feed & Free Download */}
                        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 text-left">

                            {/* Reports List (8 Columns) */}
                            <div className="lg:col-span-8 space-y-6 min-w-0">
                                <div className="flex flex-wrap items-end justify-between gap-3">
                                    <DesiHeading hi="Research clippings">UniCoach Research Reports</DesiHeading>
                                    <button
                                        onClick={() => setActiveTab('reports')}
                                        className="text-xs font-extrabold text-[#16130F] bg-white border-2 border-[#16130F] rounded-lg px-3 py-1.5 shadow-[2px_2px_0_#16130F] hover:bg-[#FFF1B8] flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>See all Reports</span>
                                        <ArrowRight size={13} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                                    {(getTabCategoryNews('reports').length > 0 ? getTabCategoryNews('reports') : defaultReports).slice(0, 2).map((rep, idx) => (
                                        <div
                                            key={rep._id || rep.id || idx}
                                            onClick={() => navigateToNewsDetail(rep)}
                                            className="bg-white border-[3px] border-[#16130F] rounded-[6px] overflow-hidden shadow-[5px_5px_0_#16130F] hover:shadow-[8px_8px_0_#16130F] flex flex-col justify-between group transition-shadow duration-200 cursor-pointer"
                                            style={{ transform: `rotate(${idx % 2 ? 0.7 : -0.7}deg)` }}
                                        >
                                            <div className="relative aspect-[16/10] bg-[#16130F] overflow-hidden flex items-center justify-center border-b-[3px] border-[#16130F]">
                                                {!rep.imageUrl && rep.stat ? (
                                                    <StatCover stat={rep.stat} label={rep.statLabel} tone={rep.tone} soft={rep.soft} />
                                                ) : (
                                                    <CoverImage
                                                        src={rep.imageUrl ? getAbsoluteUrl(rep.imageUrl) : rep.image}
                                                        alt={rep.title}
                                                        title={rep.title}
                                                        category={rep.category}
                                                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                                    />
                                                )}
                                                <span className="absolute top-3 left-3 text-[9px] font-black uppercase text-[#16130F] bg-[#F2B705] border-2 border-[#16130F] px-2.5 py-0.5 rounded-md shadow-[2px_2px_0_#16130F]">
                                                    {rep.category || 'Student Reports'}
                                                </span>
                                            </div>
                                            <div className="p-5 space-y-2">
                                                <h4 className="font-urbanist font-black text-[#16130F] text-[17px] leading-snug group-hover:text-[#D0362E] transition-colors mb-2">
                                                    {rep.title}
                                                </h4>
                                                <p className="text-[#5B544A] text-[13px] font-medium leading-relaxed line-clamp-3">
                                                    {rep.description || (rep.body ? rep.body.replace(/<[^>]+>/g, '').slice(0, 120) + '...' : '')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Free download for students: a real 2-page PDF in public/downloads, as a ticket */}
                            <div className="lg:col-span-4 space-y-6 min-w-0">
                                <div>
                                    <p className={`${HI} text-[16px] text-[#D0362E]`}>Free ticket</p>
                                    <h3 className="mt-1.5 font-urbanist font-black text-[26px] sm:text-[30px] leading-[1.05] tracking-[-0.03em] text-[#16130F] flex items-center gap-2">
                                        <Download size={22} className="text-[#D0362E]" />
                                        Free Download
                                    </h3>
                                </div>

                                <div className="relative bg-white border-[3px] border-[#16130F] rounded-[14px] shadow-[6px_6px_0_#16130F] overflow-hidden flex flex-col">
                                    {/* Ticket header */}
                                    <div className="relative bg-[#F2B705] px-5 pt-4 pb-5 border-b-[3px] border-dashed border-[#16130F] flex items-center justify-between gap-3">
                                        <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#16130F] bg-white px-2.5 py-1 rounded-md border-2 border-[#16130F]">
                                            Free PDF · 2 pages
                                        </span>
                                        <span className={`${HI} text-[18px] text-[#16130F]`}>Free PDF</span>
                                        {/* Perforation notches */}
                                        <span aria-hidden="true" className="absolute z-10 -left-[15px] -bottom-[11px] w-[24px] h-[24px] rounded-full bg-[#FFF6E5] border-[3px] border-[#16130F]" />
                                        <span aria-hidden="true" className="absolute z-10 -right-[15px] -bottom-[11px] w-[24px] h-[24px] rounded-full bg-[#FFF6E5] border-[3px] border-[#16130F]" />
                                    </div>

                                    <div className="p-5 space-y-3 text-left">
                                        <h3 className="font-urbanist text-[20px] font-black tracking-[-0.02em] leading-snug text-[#16130F]">
                                            Study abroad document checklist
                                        </h3>
                                        <p className="text-[#5B544A] text-[13px] font-medium leading-relaxed">
                                            Every document from applying to boarding your flight. Print it and tick as you go.
                                        </p>
                                        {/* Preview: a little checklist sheet */}
                                        <div className="bg-[#FFFDF6] rounded-lg border-2 border-[#16130F] p-3 space-y-1.5 -rotate-1 shadow-[3px_3px_0_#16130F]">
                                            {[
                                                ['Passport, valid 6+ months', true, '#D0362E'],
                                                ['Statement of Purpose', true, '#D0362E'],
                                                ['Bank statements', true, '#B8285B'],
                                                ['Visa appointment', false, '#14837E'],
                                                ['Forex card', false, '#14837E'],
                                            ].map(([t, done, c]) => (
                                                <div key={t} className="flex items-center gap-2 text-[11.5px]">
                                                    <span className="w-3.5 h-3.5 rounded-[4px] grid place-items-center text-white text-[8px] font-bold flex-shrink-0 border-[1.5px] border-[#16130F]" style={done ? { background: c } : { background: '#FFFFFF' }}>{done ? '✓' : ''}</span>
                                                    <span className={done ? 'text-[#8A8275] line-through decoration-[#C9C2B6]' : 'text-[#16130F] font-semibold'}>{t}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {[['Application', '#FCE3DA'], ['Money proof', '#FFF1B8'], ['Visa', '#DDF3EF'], ['Before you fly', '#FBD9E6']].map(([t, bg]) => (
                                                <span key={t} className="text-[10px] font-extrabold text-[#16130F] border-2 border-[#16130F] px-2 py-0.5 rounded-md" style={{ background: bg }}>{t}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-5 pb-5">
                                        <a
                                            href="/downloads/unicoach-study-abroad-document-checklist.pdf"
                                            download
                                            className="no-shine w-full inline-flex items-center justify-center gap-2 text-white font-extrabold text-xs bg-[#D0362E] p-3.5 rounded-lg border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] hover:shadow-[6px_6px_0_#16130F] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                                        >
                                            <Download size={14} />
                                            <span>Download checklist (PDF, 220 KB)</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Growth Milestones Timeline */}
                        <section className="bg-[#B8285B] border-[3px] border-[#16130F] rounded-[18px] p-6 sm:p-8 md:p-12 shadow-[6px_6px_0_#16130F] relative overflow-hidden">
                            <div className="text-center max-w-xl mx-auto mb-10">
                                <Sticker bg="#FFF6E5" tilt={-1.5} className="mb-4">Company Trajectory</Sticker>
                                <DesiHeading hi="Ab tak ka safar" light>Our Milestones &amp; Growth</DesiHeading>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none relative z-10 text-left">
                                {milestones.map((ms, idx) => {
                                    const tone = [TONES[1], TONES[2], TONES[0], TONES[1]][idx % 4];
                                    return (
                                        <div key={idx} className="bg-[#FFF6E5] border-[3px] border-[#16130F] rounded-[12px] overflow-hidden shadow-[4px_4px_0_#16130F]" style={{ transform: `rotate(${idx % 2 ? 0.8 : -0.8}deg)` }}>
                                            <div className="px-5 py-2.5 border-b-[3px] border-dashed border-[#16130F]" style={{ background: tone.c, color: tone.fg }}>
                                                <span className="font-urbanist text-[30px] font-black leading-none">{ms.year}</span>
                                            </div>
                                            <p className="p-5 text-[#16130F] text-[13px] font-semibold leading-relaxed">{ms.event}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </>
                ) : (
                    <section className="space-y-8 text-left">
                        {/* Section Sub-header */}
                        <div className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b-[5px] border-double border-[#16130F]">
                            <div className="min-w-0">
                                <span className="flex items-center gap-2">
                                    <span className={`${HI} text-[16px] text-[#D0362E]`}>Archive</span>
                                    <span className="text-[10px] font-black text-[#16130F] uppercase tracking-widest">Category Archive</span>
                                </span>
                                <h2 className="mt-1.5 font-urbanist font-black text-[26px] sm:text-[34px] leading-[1.05] tracking-[-0.03em] text-[#16130F]">
                                    {activeTabMeta.name}
                                </h2>
                            </div>
                            <span className="text-xs font-extrabold text-[#16130F] bg-[#F2B705] px-3 py-1.5 rounded-lg border-2 border-[#16130F] shadow-[2px_2px_0_#16130F]">
                                {filteredTabNews.length} {filteredTabNews.length === 1 ? 'Article' : 'Articles'}
                            </span>
                        </div>

                        {filteredTabNews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                                {filteredTabNews.map((item, idx) => {
                                    const tone = TONES[idx % TONES.length];
                                    return (
                                        <div
                                            key={item._id || idx}
                                            onClick={() => navigateToNewsDetail(item)}
                                            className="bg-white border-[3px] border-[#16130F] rounded-[6px] overflow-hidden shadow-[5px_5px_0_#16130F] hover:shadow-[8px_8px_0_#16130F] transition-shadow duration-200 flex flex-col justify-between group cursor-pointer"
                                            style={{ transform: `rotate(${[-0.6, 0.5, -0.3][idx % 3]}deg)` }}
                                        >
                                            <div className="relative aspect-[16/10] bg-[#16130F] overflow-hidden flex items-center justify-center border-b-[3px] border-[#16130F]">
                                                <CoverImage
                                                    src={item.imageUrl ? getAbsoluteUrl(item.imageUrl) : (item.image || '/newsroom_spotlight.webp')}
                                                    alt={item.title}
                                                    title={item.title}
                                                    category={item.category}
                                                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                                />
                                                <span className="absolute bottom-3 left-3 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md border-2 border-[#16130F] shadow-[2px_2px_0_#16130F]" style={{ background: tone.c, color: tone.fg }}>
                                                    {item.category || activeTabMeta.name}
                                                </span>
                                            </div>
                                            <div className="p-5 flex-grow flex flex-col justify-between text-left space-y-4">
                                                <div>
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B544A] block mb-1.5 pb-1.5 border-b-2 border-[#16130F]/15">
                                                        {formatDate(item.createdAt) || item.date || 'Recent Update'}
                                                    </span>
                                                    <h4 className="font-urbanist font-black text-[#16130F] text-[19px] leading-snug tracking-[-0.01em] group-hover:text-[#D0362E] transition-colors">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-[#5B544A] text-[13px] font-medium leading-relaxed line-clamp-3 mt-2">
                                                        {item.description || (item.body ? item.body.replace(/<[^>]+>/g, '').slice(0, 140) + '...' : '')}
                                                    </p>
                                                </div>
                                                <div className="pt-3 border-t-2 border-dashed border-[#16130F]/30 flex items-center justify-between">
                                                    <span className="text-xs font-extrabold text-[#16130F] underline decoration-[3px] underline-offset-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform" style={{ textDecorationColor: tone.c }}>
                                                        <span>Read full story</span>
                                                        <ArrowRight size={13} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <InkCard className="p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
                                <div className="w-16 h-16 rounded-lg bg-[#F2B705] text-[#16130F] flex items-center justify-center mx-auto border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] -rotate-3">
                                    <Newspaper size={28} />
                                </div>
                                <p className={`${HI} text-[16px] text-[#D0362E]`}>Abhi koi khabar nahi</p>
                                <h3 className="font-urbanist text-xl font-black text-[#16130F]">No Articles Yet in {activeTabMeta.name}</h3>
                                <p className="text-[13px] text-[#5B544A] font-medium leading-relaxed">
                                    We haven't published an article under this category yet. Check back soon or browse other updates.
                                </p>
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className="no-shine px-6 py-2.5 bg-[#16130F] text-white rounded-lg border-[3px] border-[#16130F] text-xs font-extrabold shadow-[4px_4px_0_#F2B705] hover:shadow-[6px_6px_0_#F2B705] transition-shadow cursor-pointer"
                                >
                                    Return to Overview
                                </button>
                            </InkCard>
                        )}
                    </section>
                )}

                {/* ── Closing CTA: truck-art Book OK Please ── */}
                <BookOkCta
                    hi="Khabar padh li? Ab baat karo"
                    text="Khabar padh li, ab apna plan banao. Free call pe senior se 1:1 baat, koi card nahi chahiye."
                />
            </div>
        </main>
    );
};

export default NewsroomPage;
