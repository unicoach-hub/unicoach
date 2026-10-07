import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, 
    Calendar, 
    Clock, 
    ArrowRight, 
    GraduationCap, 
    BookCheck, 
    Calculator, 
    Search,
    Bookmark,
    Sparkles,
    User,
    ChevronRight,
    TrendingUp,
    Award,
    Plane,
    Globe,
    FileText,
    CheckCircle2
} from 'lucide-react';
import Interactive3DGrid from '@/components/Interactive3DGrid';
import { API_BASE_URL } from '../../config';

const BLOG_TABS = [
    { key: 'popular', name: 'Popular Blogs', icon: <Sparkles size={14} className="text-amber-500" /> },
    { key: 'colleges', name: 'Colleges', icon: <GraduationCap size={14} className="text-indigo-600" /> },
    { key: 'courses', name: 'Courses', icon: <BookOpen size={14} className="text-[#DE5C2B]" /> },
    { key: 'exams', name: 'Exams', icon: <BookCheck size={14} className="text-emerald-600" /> },
    { key: 'expense', name: 'Expense Calculator', icon: <Calculator size={14} className="text-purple-600" /> },
    { key: 'scholarships', name: 'Scholarships', icon: <Award size={14} className="text-amber-600" /> },
    { key: 'visa', name: 'Visa Guidance', icon: <Plane size={14} className="text-teal-600" /> }
];

const BlogsPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTab, setSelectedTab] = useState('popular');
    const [bookmarkedBlogs, setBookmarkedBlogs] = useState({});
    const [dbBlogs, setDbBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = API_BASE_URL;

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Study Abroad Blog, Intakes & Admission Guides | UniCoach';

        const fetchBlogs = async () => {
            try {
                const res = await fetch(`${API_URL}/blogs`);
                if (res.ok) {
                    const data = await res.json();
                    setDbBlogs(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to fetch blogs from API", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const getAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const cleanBase = API_URL.replace('/api', '');
        return `${cleanBase}${url}`;
    };

    const toggleBookmark = (e, title) => {
        e.preventDefault();
        e.stopPropagation();
        setBookmarkedBlogs(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const formattedDbBlogs = dbBlogs.map(blog => ({
        title: blog.title,
        slug: (blog.slug || '').replace(/^\/+/, '') || blog._id,
        date: blog.publishDate ? new Date(blog.publishDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: "5 Min Read",
        description: blog.metaDescription || (blog.body ? blog.body.replace(/<[^>]*>/g, '').slice(0, 140) + "..." : "Read the latest update and admissions guidance from UniCoach."),
        image: blog.imageUrl ? getAbsoluteUrl(blog.imageUrl) : "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
        author: blog.author?.name || "UniCoach Advisor",
        category: blog.category || 'General',
        isDbBlog: true
    }));

    // Filter by tab
    const filterBlogsByTab = (blogs, tabKey) => {
        if (tabKey === 'popular') return blogs;
        return blogs.filter(b => {
            const cat = (b.category || '').toLowerCase();
            if (tabKey === 'colleges') return cat.includes('college') || cat.includes('universit') || cat.includes('study abroad');
            if (tabKey === 'courses') return cat.includes('course') || cat.includes('master') || cat.includes('guide');
            if (tabKey === 'exams') return cat.includes('exam') || cat.includes('ielts') || cat.includes('toefl') || cat.includes('gre') || cat.includes('pte');
            if (tabKey === 'expense') return cat.includes('expense') || cat.includes('cost') || cat.includes('calculator') || cat.includes('living');
            if (tabKey === 'scholarships') return cat.includes('scholarship') || cat.includes('grant') || cat.includes('funding');
            if (tabKey === 'visa') return cat.includes('visa') || cat.includes('immigration') || cat.includes('permit');
            return true;
        });
    };

    const currentTabBlogs = filterBlogsByTab(formattedDbBlogs, selectedTab);

    const filteredBlogs = currentTabBlogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.category && blog.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const featuredBlog = formattedDbBlogs[0];

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-20 pb-24 relative overflow-hidden">
            
            {/* Soft Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -right-24 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Clean LeapScholar-Style Hero Section with Interactive 3D Grid */}
            <section className="relative pt-12 pb-24 sm:pt-14 sm:pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E9F1FE] via-[#F3F6FD] to-[#F8FAFC] overflow-hidden">
                {/* Interactive 3D Background Grid */}
                <Interactive3DGrid gridSize={56} />
                
                {/* Soft Ambient Sky Light */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-radial from-orange-200/40/50 via-indigo-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white text-[#DE5C2B] border border-orange-200/80 shadow-xs">
                        <Sparkles size={14} className="text-[#DE5C2B]" /> UniCoach Press, Guides & Editorial Hub
                    </div>

                    <h1 className="font-outfit text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-[#0F172A] max-w-4xl mx-auto leading-tight">
                        Study Abroad Insights <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D]">& Expert Guides</span>
                    </h1>

                    <p className="text-[14px] sm:text-[15.5px] text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
                        Curated advice on overseas university admissions, verified scholarships, exam prep tips, visa checklists, and post-study work regulations.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-600 font-semibold">
                        <span className="flex items-center gap-1.5 bg-white text-slate-700 px-3.5 py-1 rounded-full border border-slate-200/80 shadow-xs">
                            <CheckCircle2 size={13} className="text-emerald-500" /> 100% Free Resources
                        </span>
                        <span className="flex items-center gap-1.5 bg-white text-slate-700 px-3.5 py-1 rounded-full border border-slate-200/80 shadow-xs">
                            <CheckCircle2 size={13} className="text-emerald-500" /> Written by Senior Counselors
                        </span>
                        <span className="flex items-center gap-1.5 bg-white text-slate-700 px-3.5 py-1 rounded-full border border-slate-200/80 shadow-xs">
                            <CheckCircle2 size={13} className="text-emerald-500" /> Updated for 2026–27 Intakes
                        </span>
                    </div>
                </div>
            </section>

            {/* Featured Article Card (Overlap Hero) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-14">
                {featuredBlog && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 flex flex-col lg:flex-row gap-8 group hover:border-indigo-300 transition-all duration-300"
                    >
                        {/* Featured Image */}
                        <div className="lg:w-1/2 relative aspect-[16/10] lg:aspect-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                            <img 
                                src={featuredBlog.image} 
                                alt={featuredBlog.title} 
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md">
                                <TrendingUp size={12} />
                                <span>Featured Story</span>
                            </span>
                        </div>

                        {/* Featured Text */}
                        <div className="lg:w-1/2 flex flex-col justify-between py-1 text-left">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-3 py-1 rounded-full text-xs font-black">
                                        {featuredBlog.category}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={13} className="text-slate-400" />
                                        {featuredBlog.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={13} className="text-slate-400" />
                                        {featuredBlog.readTime}
                                    </span>
                                </div>

                                <Link 
                                    to={`/blogs/${featuredBlog.slug}`}
                                    className="block text-2xl sm:text-3xl font-black text-slate-900 hover:text-indigo-600 transition-colors tracking-tight leading-snug"
                                >
                                    {featuredBlog.title}
                                </Link>

                                <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                                    {featuredBlog.description}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
                                        {featuredBlog.author ? featuredBlog.author.split(' ').map(n=>n[0]).join('') : 'UC'}
                                    </div>
                                    <div>
                                        <span className="block text-slate-900 font-bold text-sm leading-tight">{featuredBlog.author || 'UniCoach Expert'}</span>
                                        <span className="text-slate-400 text-xs font-semibold">Global Admissions Advisor</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                    <button 
                                        onClick={(e) => toggleBookmark(e, featuredBlog.title)}
                                        className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                        title="Bookmark story"
                                    >
                                        <Bookmark size={16} className={bookmarkedBlogs[featuredBlog.title] ? 'fill-indigo-600 text-indigo-600' : ''} />
                                    </button>
                                    
                                    <Link 
                                        to={`/blogs/${featuredBlog.slug}`}
                                        className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                                    >
                                        <span>Read Full Guide</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Core Blog Directory Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                
                {/* Filter Tabs & Search Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {BLOG_TABS.map((tab) => {
                            const isActive = selectedTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setSelectedTab(tab.key)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                        isActive 
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 border border-indigo-600' 
                                            : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[260px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search articles, exams, topics..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Blog Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
                                <div className="w-full aspect-[16/10] bg-slate-100 rounded-2xl" />
                                <div className="h-4 bg-slate-100 rounded w-1/3" />
                                <div className="h-6 bg-slate-100 rounded w-full" />
                                <div className="h-4 bg-slate-100 rounded w-4/5" />
                            </div>
                        ))}
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/blogs/${blog.slug}`)}
                                className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                            >
                                {/* Card Thumbnail */}
                                <div className="relative overflow-hidden aspect-[16/10] bg-slate-100">
                                    <img 
                                        src={blog.image} 
                                        alt={blog.title} 
                                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                                    />
                                    <button 
                                        onClick={(e) => toggleBookmark(e, blog.title)}
                                        className="absolute top-3.5 right-3.5 bg-white/80 backdrop-blur-md text-slate-500 hover:text-indigo-600 p-2 rounded-xl border border-slate-200/80 shadow-sm cursor-pointer"
                                        title="Bookmark"
                                    >
                                        <Bookmark size={13} className={bookmarkedBlogs[blog.title] ? 'fill-indigo-600 text-indigo-600' : ''} />
                                    </button>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex-grow flex flex-col justify-between text-left space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-black">
                                                {blog.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-slate-400 text-xs">
                                                <Calendar size={12} />
                                                {blog.date}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight leading-snug">
                                            {blog.title}
                                        </h3>
                                        
                                        <p className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-2">
                                            {blog.description}
                                        </p>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black text-[10px] flex items-center justify-center">
                                                {blog.author ? blog.author.split(' ').map(n=>n[0]).join('') : 'UC'}
                                            </div>
                                            <span className="text-xs text-slate-700 font-bold">{blog.author || 'UniCoach'}</span>
                                        </div>

                                        <span className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                                            Read Article <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-600 max-w-md mx-auto shadow-sm">
                        <FileText size={36} className="text-indigo-400 mx-auto mb-3" />
                        <h3 className="text-lg font-black text-slate-900 mb-1">No Articles in This Category</h3>
                        <p className="text-xs text-slate-500 font-medium mb-4">Try selecting another topic or refine your search keywords.</p>
                        <button 
                            onClick={() => { setSelectedTab('popular'); setSearchTerm(''); }} 
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                            View All Articles
                        </button>
                    </div>
                )}
            </div>

        </main>
    );
};

export default BlogsPage;
