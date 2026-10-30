import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CoverImage from '../../components/CoverImage';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, 
    Tv, 
    BookOpen, 
    Newspaper, 
    X,
    Calendar,
    ArrowRight,
    Heart
} from 'lucide-react';
import PageLoader from '../../components/PageLoader';
import { API_BASE_URL } from '../../config';
import { STUDENT_VIDEOS } from '../../data/studentVideos';
import { RailwayBoard } from '../../components/desi/DesiPop';
import { StationSign, Sticker, DesiHeading, InkCard } from '../../components/desi/DesiKit';
import { BookOkCta } from '../../components/desi/BookOkCta';

// Poster colour per digest category (strip, label, image backdrop)
const CATEGORY_TONES = {
    reviews: { c: '#B8285B', soft: '#FBD9E6', fg: '#FFFFFF', hi: 'कहानी' },
    insights: { c: '#14837E', soft: '#DDF3EF', fg: '#FFFFFF', hi: 'सलाह' },
    news: { c: '#D0362E', soft: '#FCE3DA', fg: '#FFFFFF', hi: 'ख़बर' },
};

// Name plates under the student story videos
const STORY_TONES = [
    { c: '#F2B705', fg: '#16130F' },
    { c: '#D0362E', fg: '#FFFFFF' },
    { c: '#14837E', fg: '#FFFFFF' },
    { c: '#B8285B', fg: '#FFFFFF' },
];

// Real student stories, shaped like digest items so the same player modal can play them
const STUDENT_STORIES = STUDENT_VIDEOS.map((v) => ({
    id: v.id,
    title: `${v.name}'s study abroad story`,
    description: `${v.name}, a UniCoach student, talks about their journey abroad.`,
    image: v.thumbnail,
    videoUrl: v.videoUrl,
    isVideo: true,
    isLocal: true,
    portrait: true,
    name: v.name,
}));

// Rubber-stamp date, like the date stamp on a ticket
const DateStamp = ({ date, className = '' }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-[#D0362E] text-[#D0362E] bg-white/70 text-[10.5px] font-black uppercase tracking-wider whitespace-nowrap ${className}`} style={{ borderRadius: 6 }}>
        <Calendar size={11} />
        {date}
    </span>
);

const UniCoachDigestPage = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'reviews', 'insights', 'news'
    const [selectedVideo, setSelectedVideo] = useState(null); // For custom video player modal
    const [likedCards, setLikedCards] = useState({});
    const [digests, setDigests] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = API_BASE_URL;

    useEffect(() => {
        const fetchDigests = async () => {
            try {
                const res = await fetch(`${API_URL}/digest`);
                if (!res.ok) throw new Error('Failed to fetch digests');
                const data = await res.json();
                setDigests(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error loading digests:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDigests();
    }, []);

    const toggleLike = (id) => {
        setLikedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Only real videos open the player; articles go to the guides
    const handlePlayVideo = (item) => {
        if (!item?.videoUrl) {
            navigate('/blogs');
            return;
        }
        setSelectedVideo(item);
    };

    const getAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const cleanBase = API_URL.replace('/api', '');
        return `${cleanBase}${url}`;
    };

    const getYoutubeEmbedUrl = (url) => {
        if (!url) return '';
        let videoId = '';
        if (url.includes('youtube.com/embed/')) {
            return url;
        }
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    };

    const categories = [
        { key: 'all', name: 'All Content', icon: <Tv size={14} /> },
        { key: 'reviews', name: 'Student Reviews', icon: <Play size={14} /> },
        { key: 'insights', name: 'Expert Insights', icon: <BookOpen size={14} /> },
        { key: 'news', name: 'Trending News', icon: <Newspaper size={14} /> }
    ];

    // Helper to map DB item properties to frontend variables
    const mapItem = (item) => ({
        id: item._id,
        category: item.category,
        categoryLabel: item.category === 'reviews' ? 'Student Reviews' : item.category === 'insights' ? 'Expert Insights' : 'Trending News',
        title: item.title,
        description: item.description,
        image: item.imageUrl ? getAbsoluteUrl(item.imageUrl) : null,
        isVideo: item.isVideo,
        videoUrl: item.videoUrl,
        length: item.length,
        date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    });

    // Sort digests: newest published items first
    const sortedDigests = [...digests].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // 1. Horizontal banner spotlights (newest first)
    const spotlightItems = sortedDigests.filter(d => d.isSpotlight).map(mapItem);

    // 2. Right side sub link recommendations
    const moreInsights = sortedDigests
        .filter(d => d.category !== 'reviews')
        .slice(0, 3)
        .map(mapItem);

    // 3. Main listing grid: under "All", items already in the spotlight row aren't repeated
    const gridItems = sortedDigests.map(mapItem);
    const spotlightIds = new Set(spotlightItems.map((item) => item.id));

    const filteredItems = activeCategory === 'all'
        ? gridItems.filter(item => !spotlightIds.has(item.id))
        : gridItems.filter(item => item.category === activeCategory);
    const showStories = activeCategory === 'all' || activeCategory === 'reviews';

    if (loading) {
        return <PageLoader />;
    }

    // Poster colour per category
    const toneOf = (category) => CATEGORY_TONES[category] || CATEGORY_TONES.news;

    return (
        <main className="min-h-screen bg-[#FFF6E5] text-[#16130F] font-['Onest',sans-serif] pb-16 overflow-x-hidden">

            {/* ── MASTHEAD: newspaper sheet on a mustard poster band ── */}
            <section className="relative bg-[#F2B705] px-4 sm:px-6 pt-[96px] md:pt-[112px] pb-12 sm:pb-14 mb-12">
                {/* Desi Pop: railway station board, wide screens only */}
                <div className="hidden 2xl:block absolute left-8 top-[120px] w-[220px] pointer-events-none">
                    <RailwayBoard hi="डाइजेस्ट" en="DIGEST" codeLeft="TRENDS" codeRight="REVIEWS" />
                </div>
                <div className="relative max-w-[980px] mx-auto">
                    <div className="bg-[#FFFDF6] border-[3px] border-[#16130F] rounded-[14px] shadow-[7px_7px_0_#16130F] px-4 sm:px-10 py-7 sm:py-9 text-center sm:-rotate-[0.6deg]">
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
                            <StationSign hi="अख़बार" en="UNICOACH DIGEST" />
                            <Sticker bg="#16130F" fg="#FFFFFF" tilt={2}>
                                <Newspaper size={13} className="text-[#F2B705]" />
                                UniCoach Digital Press
                            </Sticker>
                        </div>
                        <div className="border-y-[5px] border-double border-[#16130F] py-3 sm:py-4">
                            <h1 className="font-urbanist font-black text-[44px] sm:text-[64px] lg:text-[76px] leading-[0.95] tracking-[-0.045em] text-[#16130F] select-none break-words">
                                Uni<span className="text-[#D0362E]">Coach</span> Digest
                            </h1>
                        </div>
                        <p className="mt-3 text-[#5B544A] text-sm md:text-base font-bold tracking-tight">
                            Study Abroad Trends, Insights and Reviews!
                        </p>
                    </div>

                    {/* Filter Toolbar */}
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mt-8">
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat.key;
                            return (
                                <button
                                    key={cat.key}
                                    onClick={() => setActiveCategory(cat.key)}
                                    className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold border-2 border-[#16130F] transition-all duration-200 cursor-pointer
                                        ${isActive
                                            ? 'bg-[#16130F] text-white shadow-[3px_3px_0_#D0362E] -translate-y-px'
                                            : 'bg-white text-[#16130F] shadow-[2px_2px_0_#16130F] hover:bg-[#FFF1B8]'}`}
                                >
                                    {cat.icon}
                                    <span>{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Content Display */}
            {loading ? (
                <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-10 space-y-10 mb-16">
                    <div className="bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] rounded-[14px] p-6 animate-pulse flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2 h-64 bg-[#FFF1B8] rounded-[10px]" />
                        <div className="md:w-1/2 space-y-4 py-4">
                            <div className="h-6 w-28 bg-[#F3EAD7] rounded-lg" />
                            <div className="h-8 bg-[#F3EAD7] rounded w-3/4" />
                            <div className="h-4 bg-[#F3EAD7] rounded w-full" />
                            <div className="h-4 bg-[#F3EAD7] rounded w-2/3" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((k) => (
                            <div key={k} className="bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] rounded-[14px] p-5 animate-pulse space-y-4">
                                <div className="h-48 bg-[#FFF1B8] rounded-[10px]" />
                                <div className="h-5 bg-[#F3EAD7] rounded w-2/3" />
                                <div className="h-4 bg-[#F3EAD7] rounded w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Real student stories + guides */}
                    {showStories && (
                        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 mb-14">
                            <InkCard className="lg:col-span-8 p-5 sm:p-6 text-left min-w-0">
                                <div className="mb-5">
                                    <Sticker bg="#FBD9E6" tilt={-2}>Student Reviews</Sticker>
                                    <DesiHeading hi="असली कहानियाँ" className="mt-4">Real student stories</DesiHeading>
                                    <p className="text-[#5B544A] text-[13px] md:text-sm font-medium mt-2">Hear it straight from UniCoach students who made the move abroad.</p>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
                                    {STUDENT_STORIES.map((story, si) => (
                                        <button
                                            key={story.id}
                                            type="button"
                                            onClick={() => handlePlayVideo(story)}
                                            className="group relative aspect-[9/16] rounded-[10px] overflow-hidden bg-[#FFF1B8] border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] hover:shadow-[5px_5px_0_#16130F] hover:-translate-y-0.5 transition-all cursor-pointer text-left"
                                            aria-label={`Play ${story.title}`}
                                        >
                                            <img src={story.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#F2B705] border-2 border-[#16130F] flex items-center justify-center shadow-[2px_2px_0_#16130F] group-hover:scale-110 transition-transform">
                                                <Play size={15} className="fill-[#16130F] text-[#16130F] ml-0.5" />
                                            </span>
                                            <span
                                                className="absolute bottom-0 inset-x-0 px-2 py-1.5 border-t-2 border-[#16130F] text-[11px] sm:text-xs font-black truncate"
                                                style={{ background: STORY_TONES[si % STORY_TONES.length].c, color: STORY_TONES[si % STORY_TONES.length].fg }}
                                            >
                                                {story.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </InkCard>

                            <div className="lg:col-span-4 flex flex-col gap-7 min-w-0">
                                <div className="bg-[#14837E] text-white border-[3px] border-[#16130F] rounded-[14px] shadow-[5px_5px_0_#16130F] p-6 flex-grow flex flex-col justify-between min-h-[220px] lg:rotate-[0.8deg]">
                                    <div className="space-y-3 text-left">
                                        <span className="inline-block font-['Rozha_One',serif] text-[15px] leading-none text-[#F2B705]">गाइड</span>
                                        <span className="ml-2 inline-block text-[10px] font-extrabold uppercase tracking-widest bg-white/15 border border-white/40 px-2.5 py-1 rounded-md">
                                            Guides
                                        </span>
                                        <h3 className="font-urbanist text-xl md:text-[22px] font-black tracking-[-0.02em] leading-snug">
                                            Country guides, intakes and admission tips
                                        </h3>
                                        <p className="text-white/85 text-[13px] font-medium leading-relaxed">
                                            Step-by-step articles from the UniCoach team on choosing a country, applying and getting your visa.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/blogs')}
                                        className="mt-6 inline-flex items-center gap-1.5 text-[#16130F] font-bold text-[13px] bg-[#F2B705] hover:bg-[#FFC928] border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] px-4 py-2.5 rounded-full w-fit transition-colors cursor-pointer"
                                    >
                                        <span>Browse guides</span>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>

                                {moreInsights.length > 0 && (
                                    <InkCard className="p-5 space-y-4 text-left">
                                        <div className="border-b-[3px] border-double border-[#16130F] pb-2">
                                            <p className="font-['Rozha_One',serif] text-[14px] leading-none text-[#D0362E]">और ख़बरें</p>
                                            <h4 className="mt-1 text-xs font-black text-[#16130F] uppercase tracking-widest">More Insights</h4>
                                        </div>
                                        <div className="divide-y-2 divide-dashed divide-[#16130F]/20">
                                            {moreInsights.map((insight) => (
                                                <Link
                                                    to="/blogs"
                                                    key={insight.id}
                                                    className="block py-3 first:pt-0 last:pb-0 group text-[13px] text-[#16130F] font-bold leading-snug hover:text-[#D0362E] transition-colors"
                                                >
                                                    <span className="line-clamp-2">{insight.title}</span>
                                                    <span className="block text-[11px] text-[#D0362E] font-bold mt-1 group-hover:translate-x-1 transition-transform">Read article →</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </InkCard>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Spotlight: front-page clippings */}
                    {spotlightItems.length > 0 && (
                        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-10 mb-14">
                            <DesiHeading hi="मुख्य ख़बर" className="mb-6">Spotlight</DesiHeading>
                            <div className={spotlightItems.length <= 2 ? `grid grid-cols-1 ${spotlightItems.length === 2 ? 'lg:grid-cols-2' : ''} gap-7` : 'flex overflow-x-auto gap-6 pt-1 pb-4 pl-1 pr-3 scrollbar-hide snap-x'}>
                                {spotlightItems.map((item) => {
                                    const tone = toneOf(item.category);
                                    return (
                            <div
                                key={item.id}
                                className={`bg-[#FFFDF6] border-[3px] border-[#16130F] rounded-[14px] shadow-[6px_6px_0_#16130F] p-4 sm:p-5 md:p-6 ${spotlightItems.length <= 2 ? 'w-full' : 'w-[85%] md:w-[700px] max-w-[800px] flex-shrink-0'} flex flex-col md:flex-row gap-5 md:gap-6 snap-center group min-w-0`}
                            >
                                <div className="relative md:w-1/2 aspect-[16/10] md:aspect-auto md:min-h-[240px] rounded-[10px] overflow-hidden border-[3px] border-[#16130F]" style={{ background: tone.soft }}>
                                    <CoverImage
                                        src={item.image}
                                        alt={item.title}
                                        title={item.title}
                                        category={item.categoryLabel}
                                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                    />
                                    {item.isVideo && (
                                        <div
                                            onClick={() => handlePlayVideo(item)}
                                            className="absolute inset-0 bg-[#16130F]/15 group-hover:bg-[#16130F]/35 flex items-center justify-center cursor-pointer transition-all"
                                        >
                                            <div className="w-14 h-14 rounded-full bg-[#F2B705] border-[3px] border-[#16130F] text-[#16130F] flex items-center justify-center shadow-[3px_3px_0_#16130F] group-hover:scale-110 transition-transform duration-300">
                                                <Play size={20} className="fill-[#16130F] ml-1" />
                                            </div>
                                        </div>
                                    )}
                                    {item.isVideo && (
                                        <span className="absolute bottom-3 right-3 bg-[#16130F] border-2 border-white px-2 py-0.5 rounded text-[10px] font-black text-white">
                                            {item.length}
                                        </span>
                                    )}
                                </div>

                                <div className="md:w-1/2 min-w-0 flex flex-col justify-between py-1 text-left">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider border-2 border-[#16130F] px-2.5 py-1 rounded-md" style={{ background: tone.c, color: tone.fg }}>
                                                {item.categoryLabel}
                                            </span>
                                            <DateStamp date={item.date} className="-rotate-2" />
                                        </div>
                                        <h2 className="font-urbanist text-xl md:text-[24px] font-black text-[#16130F] tracking-[-0.02em] leading-snug mt-4 group-hover:text-[#D0362E] transition-colors break-words">
                                            {item.title}
                                        </h2>
                                        <p className="text-[#5B544A] text-[13px] md:text-sm font-medium leading-relaxed mt-2.5 line-clamp-3">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t-2 border-dashed border-[#16130F]/25 mt-6 flex items-center justify-end">
                                        <button
                                            onClick={() => handlePlayVideo(item)}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-white bg-[#D0362E] hover:bg-[#B52A23] border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] px-3.5 py-2 rounded-full cursor-pointer transition-colors"
                                        >
                                            <span>{item.isVideo ? 'Play Video' : 'Read Article'}</span>
                                            <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                                    );
                                })}
                    </div>
                </section>
            )}

            {/* Core Listing Grid (under "All", nothing to show once every item is in the spotlight row) */}
            {(filteredItems.length > 0 || activeCategory !== 'all') && (
            <section className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-10 mb-14">
                <DesiHeading hi="ताज़ा अंक" className="mb-7">Latest from the Digest</DesiHeading>
                {filteredItems.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item, idx) => {
                                const tone = toneOf(item.category);
                                return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    key={item.id}
                                    style={{ rotate: idx % 2 ? 0.6 : -0.6 }}
                                    className="bg-[#FFFDF6] border-[3px] border-[#16130F] rounded-[10px] overflow-hidden shadow-[5px_5px_0_#16130F] hover:shadow-[8px_8px_0_#16130F] transition-shadow duration-200 flex flex-col justify-between group min-w-0"
                                >
                                    {/* clipping header: category strip */}
                                    <div className="flex items-center justify-between gap-2 px-4 py-2 border-b-[3px] border-[#16130F]" style={{ background: tone.c, color: tone.fg }}>
                                        <span className="text-[10.5px] font-black uppercase tracking-wider truncate">{item.categoryLabel}</span>
                                        <span className="font-['Rozha_One',serif] text-[13px] leading-none whitespace-nowrap">{tone.hi}</span>
                                    </div>

                                    <div className="relative overflow-hidden aspect-[16/10] border-b-[3px] border-[#16130F]" style={{ background: tone.soft }}>
                                        <CoverImage
                                            src={item.image}
                                            alt={item.title}
                                            title={item.title}
                                            category={item.categoryLabel}
                                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                                        />
                                        {item.isVideo && (
                                            <div
                                                onClick={() => handlePlayVideo(item)}
                                                className="absolute inset-0 bg-[#16130F]/15 group-hover:bg-[#16130F]/35 flex items-center justify-center cursor-pointer transition-all"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-[#F2B705] border-[3px] border-[#16130F] text-[#16130F] flex items-center justify-center shadow-[3px_3px_0_#16130F] group-hover:scale-110 transition-transform duration-300">
                                                    <Play size={18} className="fill-[#16130F] ml-1" />
                                                </div>
                                            </div>
                                        )}
                                        {item.isVideo && (
                                            <span className="absolute bottom-3 right-3 bg-[#16130F] border-2 border-white px-2 py-0.5 rounded text-[10px] font-black text-white">
                                                {item.length}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between text-left">
                                        <div className="space-y-3">
                                            <DateStamp date={item.date} className={idx % 2 ? 'rotate-2' : '-rotate-2'} />
                                            <h3
                                                onClick={() => item.isVideo ? handlePlayVideo(item) : navigate('/blogs')}
                                                className="font-urbanist text-[18px] font-black text-[#16130F] hover:text-[#D0362E] transition-colors tracking-[-0.02em] leading-snug cursor-pointer line-clamp-2"
                                            >
                                                {item.title}
                                            </h3>
                                            <p className="text-[#5B544A] text-[13px] font-medium leading-relaxed line-clamp-3">
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t-2 border-dashed border-[#16130F]/25 mt-6 flex items-center justify-between text-xs">
                                            <button
                                                onClick={() => toggleLike(item.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#16130F] cursor-pointer transition-colors font-bold ${likedCards[item.id] ? 'bg-[#B8285B] text-white shadow-[2px_2px_0_#16130F]' : 'bg-white text-[#16130F] hover:bg-[#FBD9E6]'}`}
                                            >
                                                <Heart size={13} className={likedCards[item.id] ? 'fill-white' : ''} />
                                                {likedCards[item.id] ? 'Liked' : 'Like'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <InkCard className="p-8 sm:p-12 text-center max-w-lg mx-auto">
                        <span className="w-14 h-14 mx-auto mb-4 grid place-items-center rounded-full bg-[#F2B705] border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] -rotate-6">
                            <Newspaper size={24} className="text-[#16130F]" />
                        </span>
                        <p className="font-['Rozha_One',serif] text-[15px] leading-none text-[#D0362E]">अभी कुछ नहीं</p>
                        <p className="mt-2 text-[#5B544A] font-semibold">No digital press content found in this category.</p>
                    </InkCard>
                )}
            </section>
            )}

            </>
            )}

            {/* ── Closing CTA ── */}
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-10 mt-6">
                <BookOkCta
                    hi="ख़बर पढ़ी? अब प्लान बनाओ"
                    text="News se pata chala kya badal raha hai. Ab apne plan pe 1:1 baat karo, free, ek ghante ki."
                />
            </div>

            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <div className="fixed inset-0 bg-[#16130F]/80 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className={`bg-[#16130F] border-[3px] border-[#F2B705] rounded-[16px] overflow-hidden w-full shadow-[6px_6px_0_#D0362E] relative ${selectedVideo.portrait ? 'max-w-sm' : 'max-w-4xl'}`}
                        >
                            {/* Close cross */}
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-4 right-4 bg-[#F2B705] hover:bg-[#FFC928] text-[#16130F] rounded-full p-2.5 cursor-pointer z-50 transition-colors border-2 border-[#16130F]"
                            >
                                <X size={16} />
                            </button>

                            {/* Video Screen Layout */}
                            <div className={`relative bg-black ${selectedVideo.portrait ? 'aspect-[9/16] max-h-[72vh] mx-auto' : 'aspect-[16/9]'}`}>
                                {selectedVideo.videoUrl.includes('youtube.com') || selectedVideo.videoUrl.includes('youtu.be') ? (
                                    <iframe
                                        src={getYoutubeEmbedUrl(selectedVideo.videoUrl)}
                                        title={selectedVideo.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <video
                                        src={selectedVideo.isLocal ? selectedVideo.videoUrl : getAbsoluteUrl(selectedVideo.videoUrl)}
                                        poster={selectedVideo.image || undefined}
                                        controls
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>

                            {/* Video Title Details Panel */}
                            <div className="p-6 bg-[#16130F] text-white border-t-[3px] border-[#F2B705] space-y-2 text-left">
                                <span className="text-[10px] font-black text-[#F2B705] uppercase tracking-widest">Now playing</span>
                                <h3 className="font-urbanist text-base md:text-lg font-black leading-snug">
                                    {selectedVideo.title}
                                </h3>
                                <p className="text-white/70 text-xs leading-relaxed font-medium">
                                    {selectedVideo.description}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
};

export default UniCoachDigestPage;
