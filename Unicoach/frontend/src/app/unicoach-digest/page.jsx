import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, 
    Tv, 
    BookOpen, 
    TrendingUp, 
    Newspaper, 
    Flame, 
    Clock, 
    Share2, 
    Heart, 
    X,
    Volume2,
    VolumeX,
    Maximize2,
    Sparkles,
    Calendar,
    ArrowRight
} from 'lucide-react';
import PageLoader from '../../components/PageLoader';
import { API_BASE_URL } from '../../config';

const UniCoachDigestPage = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'reviews', 'insights', 'news'
    const [selectedVideo, setSelectedVideo] = useState(null); // For custom video player modal
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
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

    const handlePlayVideo = (video) => {
        setSelectedVideo(video);
        setIsPlaying(true);
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
        image: item.imageUrl ? getAbsoluteUrl(item.imageUrl) : "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
        isVideo: item.isVideo,
        videoUrl: item.videoUrl,
        length: item.length,
        date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    });

    // Sort digests: newest published items first
    const sortedDigests = [...digests].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // 1. Horizontal banner spotlights (newest first)
    const spotlightItems = sortedDigests.filter(d => d.isSpotlight).map(mapItem);

    // 2. Large left video player card (newest video review or video item)
    const featuredReviewItem = sortedDigests.find(d => d.isVideo) || sortedDigests[0];
    const featuredReview = featuredReviewItem ? mapItem(featuredReviewItem) : null;

    // 3. Right side sub link recommendations (Expert Insights posts)
    const moreInsights = sortedDigests
        .filter(d => d._id !== featuredReviewItem?._id)
        .slice(0, 3)
        .map(mapItem);

    // 4. Main listing grid content cards
    const gridItems = sortedDigests.map(mapItem);

    const filteredItems = activeCategory === 'all' 
        ? gridItems 
        : gridItems.filter(item => item.category === activeCategory);

    if (loading) {
        return <PageLoader />;
    }

    return (
        <main className="min-h-screen bg-slate-50/50 pt-24 pb-16">
            
            {/* dynamic Publication Masthead */}
            <div className="max-w-[1240px] mx-auto px-6 md:px-10 text-center mb-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-650 text-xs font-bold uppercase tracking-wider mb-4 animate-bounce">
                    <Sparkles size={12} className="text-indigo-500" />
                    <span>UniCoach Digital Press</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 select-none">
                    Uni<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Coach</span> Digest
                </h1>
                <p className="text-slate-500 text-sm md:text-base mt-2 font-bold tracking-tight">
                    Study Abroad Trends, Insights and Reviews!
                </p>

                {/* Filter Toolbar */}
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-300 cursor-pointer
                                ${activeCategory === cat.key 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' 
                                    : 'bg-white text-slate-655 border-slate-200/60 hover:text-indigo-600 hover:border-indigo-100'}`}
                        >
                            {cat.icon}
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Display */}
            {loading ? (
                <div className="max-w-[1280px] mx-auto px-4 md:px-8 space-y-10 mb-16">
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-6 animate-pulse flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2 h-64 bg-slate-200 rounded-2xl" />
                        <div className="md:w-1/2 space-y-4 py-4">
                            <div className="h-6 w-28 bg-slate-200 rounded-lg" />
                            <div className="h-8 bg-slate-200 rounded w-3/4" />
                            <div className="h-4 bg-slate-100 rounded w-full" />
                            <div className="h-4 bg-slate-100 rounded w-2/3" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((k) => (
                            <div key={k} className="bg-white border border-slate-200/60 rounded-3xl p-5 animate-pulse space-y-4">
                                <div className="h-48 bg-slate-200 rounded-2xl" />
                                <div className="h-5 bg-slate-200 rounded w-2/3" />
                                <div className="h-4 bg-slate-100 rounded w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Spotlight Sliding Horizontal Carousel */}
                    {spotlightItems.length > 0 && (
                        <section className="max-w-[1280px] mx-auto px-4 md:px-8 mb-12">
                            <div className="flex overflow-x-auto gap-6 pb-6 px-2 scrollbar-hide snap-x">
                                {spotlightItems.map((item) => (
                            <div 
                                key={item.id}
                                className="bg-white border border-slate-200/50 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 min-w-[320px] sm:min-w-[450px] md:min-w-[700px] max-w-[800px] flex-shrink-0 flex flex-col md:flex-row gap-6 snap-center group"
                            >
                                <div className="relative md:w-1/2 aspect-[16/10] md:aspect-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-100/50">
                                    <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                    />
                                    {item.isVideo && (
                                        <div 
                                            onClick={() => handlePlayVideo(item)}
                                            className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 flex items-center justify-center cursor-pointer transition-all"
                                        >
                                            <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm text-indigo-650 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <Play size={20} className="fill-indigo-650 ml-1" />
                                            </div>
                                        </div>
                                    )}
                                    {item.isVideo && (
                                        <span className="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[10px] font-black text-white">
                                            {item.length}
                                        </span>
                                    )}
                                </div>

                                <div className="md:w-1/2 flex flex-col justify-between py-1 text-left">
                                    <div>
                                        <span className="text-[10px] font-extrabold uppercase text-indigo-650 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                                            {item.categoryLabel}
                                        </span>
                                        <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-snug mt-4 group-hover:text-indigo-600 transition-colors">
                                            {item.title}
                                        </h2>
                                        <p className="text-slate-500 text-xs md:text-sm font-semibold leading-relaxed mt-2.5 line-clamp-3">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs text-slate-400 font-bold">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={13} className="text-indigo-500" />
                                            {item.date}
                                        </span>
                                        <button 
                                            onClick={() => handlePlayVideo(item)}
                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 cursor-pointer border-none bg-transparent"
                                        >
                                            <span>{item.isVideo ? 'Play Video' : 'Read Article'}</span>
                                            <ArrowRight size={11} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Core Listing Grid */}
            <section className="max-w-[1240px] mx-auto px-6 md:px-10 mb-12">
                {filteredItems.length > 0 ? (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    key={item.id}
                                    className="bg-white border border-slate-200/60 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between group"
                                >
                                    <div className="relative overflow-hidden aspect-[16/10] bg-slate-100 border-b border-slate-100">
                                        <img 
                                            src={item.image} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                                        />
                                        {item.isVideo && (
                                            <div 
                                                onClick={() => handlePlayVideo(item)}
                                                className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 flex items-center justify-center cursor-pointer transition-all"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm text-indigo-650 flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform duration-300">
                                                    <Play size={18} className="fill-indigo-650 ml-1" />
                                                </div>
                                            </div>
                                        )}
                                        {item.isVideo && (
                                            <span className="absolute bottom-3 right-3 bg-slate-900/85 border border-white/5 px-2 py-0.5 rounded text-[10px] font-black text-white">
                                                {item.length}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-6 flex-grow flex flex-col justify-between text-left">
                                        <div className="space-y-3.5">
                                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                <span>{item.categoryLabel}</span>
                                                <span className="flex items-center gap-1 font-bold">
                                                    <Clock size={10} />
                                                    {item.date}
                                                </span>
                                            </div>
                                            <h3 
                                                onClick={() => item.isVideo ? handlePlayVideo(item) : navigate('/blogs')}
                                                className="text-base font-black text-slate-800 hover:text-indigo-650 transition-colors tracking-tight leading-snug cursor-pointer line-clamp-2"
                                            >
                                                {item.title}
                                            </h3>
                                            <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-3">
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                                            <button 
                                                onClick={() => toggleLike(item.id)}
                                                className={`cursor-pointer transition-colors border-none bg-transparent font-bold text-slate-400 ${likedCards[item.id] ? 'text-rose-600 font-extrabold' : 'hover:text-rose-600'}`}
                                            >
                                                {likedCards[item.id] ? '❤️ Liked' : '🤍 Like'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="bg-white border border-slate-200/60 rounded-[32px] p-12 text-center text-slate-500 font-semibold shadow-sm">
                        No digital press content found in this category.
                    </div>
                )}
            </section>

            {/* Split Section: Featured Reviews & Expert Insights */}
            <section className="max-w-[1240px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                
                {/* Left Side: Large Student Review Player Card (8 Columns) */}
                {featuredReview ? (
                    <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[32px] overflow-hidden shadow-sm flex flex-col justify-between group">
                        <div className="relative aspect-[16/9] bg-slate-100 border-b border-slate-100 overflow-hidden">
                            <img 
                                src={featuredReview.image} 
                                alt={featuredReview.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-slate-950/25 flex items-center justify-center">
                                <div 
                                    onClick={() => handlePlayVideo(featuredReview)}
                                    className="w-16 h-16 rounded-full bg-white/95 text-indigo-650 flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform duration-300"
                                >
                                    <Play size={24} className="fill-indigo-650 ml-1" />
                                </div>
                            </div>
                            <span className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-md text-xs font-black text-white">
                                {featuredReview.length}
                            </span>
                        </div>

                        <div className="p-6 md:p-8 space-y-4 text-left">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100/30">
                                    Student Reviews
                                </span>
                                <span className="text-slate-400 text-xs font-bold">Published {featuredReview.date}</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-snug">
                                {featuredReview.title}
                            </h3>
                            <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                                {featuredReview.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[32px] p-12 text-center text-slate-400 font-semibold shadow-sm flex items-center justify-center">
                        Create a Student Review video in the admin panel to display here.
                    </div>
                )}

                {/* Right Side: Expert Insights Panel (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-6">
                    <div className="bg-indigo-900 text-white rounded-[32px] p-6 shadow-md relative overflow-hidden flex-grow flex flex-col justify-between min-h-[300px]">
                        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-indigo-600/30 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div className="space-y-4 relative z-10 text-left">
                            <span className="text-[9px] font-extrabold uppercase text-indigo-300 tracking-widest block bg-indigo-950/40 w-fit px-2.5 py-1 rounded-md">
                                Hot Report
                            </span>
                            <h3 className="text-lg md:text-xl font-bold tracking-tight leading-snug">
                                Where Indian Students Are Going in 2026-2027
                            </h3>
                            <p className="text-slate-200 text-xs font-semibold leading-relaxed">
                                Our counsellors review the latest migration shifts and country-specific scholarship ratios for undergraduate and master's applicants.
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => navigate('/blogs')}
                            className="mt-6 inline-flex items-center gap-1 text-white font-bold text-xs hover:text-indigo-200 tracking-wide bg-indigo-950/40 hover:bg-indigo-950/60 p-3 rounded-2xl w-fit transition-colors cursor-pointer border border-indigo-700/30"
                        >
                            <span>Read Report</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Sub Links List */}
                    {moreInsights.length > 0 && (
                        <div className="bg-white border border-slate-200/60 rounded-[32px] p-5 shadow-sm space-y-4 text-left">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">More Insights</h4>
                            <div className="space-y-3.5">
                                {moreInsights.map((insight) => (
                                    <Link 
                                        to="/blogs" 
                                        key={insight.id}
                                        className="block group text-xs text-slate-700 font-semibold leading-snug hover:text-indigo-600 transition-colors"
                                    >
                                        <span className="line-clamp-2">{insight.title}</span>
                                        <span className="block text-[10px] text-slate-400 font-bold mt-1 group-hover:translate-x-1 transition-transform">Read article →</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
            </>
            )}

            {/* Custom Simulated Video Player Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden max-w-4xl w-full shadow-2xl relative"
                        >
                            {/* Close cross */}
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 cursor-pointer z-50 transition-colors border border-white/5"
                            >
                                <X size={16} />
                            </button>

                            {/* Video Screen Layout */}
                            <div className="relative aspect-[16/9] bg-black">
                                {selectedVideo.videoUrl ? (
                                    selectedVideo.videoUrl.includes('youtube.com') || selectedVideo.videoUrl.includes('youtu.be') ? (
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
                                            src={getAbsoluteUrl(selectedVideo.videoUrl)}
                                            controls
                                            autoPlay
                                            className="w-full h-full object-contain"
                                        />
                                    )
                                ) : (
                                    <>
                                        <img 
                                            src={selectedVideo.image} 
                                            alt="Video Player Background" 
                                            className={`w-full h-full object-cover transition-opacity duration-500 ${isPlaying ? 'opacity-90' : 'opacity-50'}`}
                                        />
                                        
                                        {/* Overlay Play State */}
                                        {!isPlaying && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <button 
                                                    onClick={() => setIsPlaying(true)}
                                                    className="w-16 h-16 rounded-full bg-indigo-650/90 text-white flex items-center justify-center shadow-lg transform scale-110 animate-pulse cursor-pointer"
                                                >
                                                    <Play size={24} className="fill-white ml-1" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Simulating Scrolling Subtitles */}
                                        {isPlaying && (
                                            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/75 px-4 py-1.5 rounded-lg border border-white/5 text-[11px] md:text-xs text-white text-center font-bold max-w-lg select-none">
                                                "...this structured assistance model made a substantial difference in our final visa approvals..."
                                            </div>
                                        )}

                                        {/* Media Controls overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col gap-3 select-none">
                                            {/* Timeline progress line */}
                                            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative group">
                                                <div className={`h-full bg-indigo-500 ${isPlaying ? 'w-[42%] animate-pulse' : 'w-[42%]'}`} />
                                                <div className="absolute top-1/2 -translate-y-1/2 left-[42%] w-3 h-3 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center justify-between text-white text-xs">
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => setIsPlaying(!isPlaying)}
                                                        className="hover:text-indigo-400 cursor-pointer font-bold border-none bg-transparent text-white"
                                                    >
                                                        {isPlaying ? 'Pause' : 'Play'}
                                                    </button>
                                                    <span className="text-[11px] text-slate-400">03:45 / {selectedVideo.length || '12:00'}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => setIsMuted(!isMuted)}
                                                        className="hover:text-indigo-400 cursor-pointer border-none bg-transparent text-white"
                                                    >
                                                        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                                    </button>
                                                    <Maximize2 size={14} className="text-slate-400 hover:text-white cursor-pointer" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Video Title Details Panel */}
                            <div className="p-6 bg-slate-950 text-white border-t border-slate-800 space-y-2 text-left">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Currently Playing Student Interview</span>
                                <h3 className="text-base md:text-lg font-bold leading-snug">
                                    {selectedVideo.title}
                                </h3>
                                <p className="text-slate-400 text-xs leading-relaxed font-semibold">
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
