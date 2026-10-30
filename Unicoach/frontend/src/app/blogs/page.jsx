import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CoverImage from '../../components/CoverImage';
import { motion } from 'framer-motion';
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
    TrendingUp,
    Award,
    Plane,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { StdSign } from '../../components/desi/DesiPop';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../components/desi/DesiKit';
import { BookOkCta } from '../../components/desi/BookOkCta';

// Poster colours for tabs and cards
const CARD_TONES = [
    { c: '#D0362E', soft: '#FCE3DA', fg: '#FFFFFF' },
    { c: '#F2B705', soft: '#FFF1B8', fg: '#16130F' },
    { c: '#14837E', soft: '#DDF3EF', fg: '#FFFFFF' },
    { c: '#B8285B', soft: '#FBD9E6', fg: '#FFFFFF' },
];

const BLOG_TABS = [
    { key: 'popular', name: 'Popular Blogs', icon: <Sparkles size={14} /> },
    { key: 'colleges', name: 'Colleges', icon: <GraduationCap size={14} /> },
    { key: 'courses', name: 'Courses', icon: <BookOpen size={14} /> },
    { key: 'exams', name: 'Exams', icon: <BookCheck size={14} /> },
    { key: 'expense', name: 'Expense Calculator', icon: <Calculator size={14} /> },
    { key: 'scholarships', name: 'Scholarships', icon: <Award size={14} /> },
    { key: 'visa', name: 'Visa Guidance', icon: <Plane size={14} /> }
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
        image: blog.imageUrl ? getAbsoluteUrl(blog.imageUrl) : null,
        author: "UniCoach Team",
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

    // Card colour per position (poster colours only)
    const toneFor = (i) => CARD_TONES[i % CARD_TONES.length];
    const initials = (author) => (author ? author.split(' ').map(n => n[0]).join('') : 'UC');

    return (
        <main className="min-h-screen bg-[#FFF6E5] text-[#16130F] font-['Onest',sans-serif] pb-24 relative overflow-x-hidden">

            {/* ── HERO: mustard poster band ── */}
            <DesiHero
                tone="mustard"
                sign={{ hi: 'पढ़ाई की बातें', en: 'BLOG ADDA' }}
                title={<>Study Abroad Insights <span className="text-[#D0362E]">& Expert Guides</span></>}
                subtitle="Curated advice on overseas university admissions, verified scholarships, exam prep tips, visa checklists, and post-study work regulations."
                stickers={(
                    <>
                        <Sticker bg="#16130F" fg="#FFFFFF" tilt={-2}><Sparkles size={13} className="text-[#F2B705]" /> UniCoach Press, Guides & Editorial Hub</Sticker>
                        <Sticker tilt={1.5}><CheckCircle2 size={13} className="text-[#14837E]" /> 100% Free Resources</Sticker>
                        <Sticker bg="#DDF3EF" tilt={-1}><CheckCircle2 size={13} className="text-[#14837E]" /> Written by Senior Counselors</Sticker>
                        <Sticker bg="#FBD9E6" tilt={1}><CheckCircle2 size={13} className="text-[#B8285B]" /> Updated for 2026–27 Intakes</Sticker>
                    </>
                )}
                aside={(
                    <div className="hidden lg:flex justify-center">
                        <div className="-rotate-6">
                            <StdSign words={['VISA', 'EXAMS', 'COURSES']} hi="पढ़ो" className="w-[220px]" />
                        </div>
                    </div>
                )}
            />

            {/* ── FEATURED: big poster card overlapping the hero ── */}
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 -mt-8 relative z-20 mb-14">
                {featuredBlog && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-[3px] border-[#16130F] rounded-[18px] shadow-[7px_7px_0_#16130F] p-4 sm:p-6 lg:p-7 flex flex-col lg:flex-row gap-6 lg:gap-8 group"
                    >
                        {/* Featured Image */}
                        <div className="lg:w-1/2 relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px] rounded-[12px] overflow-hidden bg-[#FFF1B8] border-[3px] border-[#16130F]">
                            <CoverImage
                                src={featuredBlog.image}
                                alt={featuredBlog.title}
                                title={featuredBlog.title}
                                category={featuredBlog.category}
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                            />
                            <span className="absolute top-3 left-3 -rotate-3 inline-flex items-center gap-1.5 bg-[#D0362E] text-white text-xs font-black px-3 py-1.5 border-2 border-[#16130F] shadow-[3px_3px_0_#16130F]" style={{ borderRadius: 8 }}>
                                <TrendingUp size={12} />
                                <span>Featured Story</span>
                            </span>
                        </div>

                        {/* Featured Text */}
                        <div className="lg:w-1/2 min-w-0 flex flex-col justify-between py-1 text-left">
                            <div className="space-y-4">
                                <p className="font-urbanist font-extrabold text-[16px] leading-none text-[#D0362E]">Aaj ki khaas</p>
                                <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-[#5B544A]">
                                    <span className="bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] px-3 py-1 rounded-full text-xs font-black">
                                        {featuredBlog.category}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={13} />
                                        {featuredBlog.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={13} />
                                        {featuredBlog.readTime}
                                    </span>
                                </div>

                                <Link
                                    to={`/blogs/${featuredBlog.slug}`}
                                    className="block font-urbanist text-[26px] sm:text-[34px] font-black text-[#16130F] hover:text-[#D0362E] transition-colors tracking-[-0.03em] leading-[1.05] break-words"
                                >
                                    {featuredBlog.title}
                                </Link>

                                <p className="text-[#5B544A] text-sm sm:text-base font-medium leading-relaxed">
                                    {featuredBlog.description}
                                </p>
                            </div>

                            <div className="pt-5 border-t-[3px] border-dotted border-[#16130F]/30 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-[#14837E] text-white font-black text-sm flex items-center justify-center border-2 border-[#16130F] shadow-[2px_2px_0_#16130F]">
                                        {initials(featuredBlog.author)}
                                    </div>
                                    <div>
                                        <span className="block text-[#16130F] font-bold text-sm leading-tight">{featuredBlog.author || 'UniCoach Expert'}</span>
                                        <span className="text-[#5B544A] text-xs font-semibold">Global Admissions Advisor</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                    <button
                                        onClick={(e) => toggleBookmark(e, featuredBlog.title)}
                                        className="p-3 bg-[#FFF6E5] hover:bg-[#FFF1B8] border-2 border-[#16130F] rounded-xl text-[#16130F] shadow-[2px_2px_0_#16130F] transition-colors cursor-pointer"
                                        title="Bookmark story"
                                    >
                                        <Bookmark size={16} className={bookmarkedBlogs[featuredBlog.title] ? 'fill-[#D0362E] text-[#D0362E]' : ''} />
                                    </button>

                                    <Link
                                        to={`/blogs/${featuredBlog.slug}`}
                                        className="inline-flex items-center gap-2 px-5 py-3 bg-[#D0362E] hover:bg-[#B52A23] text-white rounded-full text-[13px] font-bold border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] transition-colors whitespace-nowrap"
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

            {/* ── BLOG DIRECTORY ── */}
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-20">

                <DesiHeading hi="Saare articles" className="mb-6">Browse by topic</DesiHeading>

                {/* Filter Tabs & Search Bar */}
                <div className="bg-white p-4 sm:p-5 border-[3px] border-[#16130F] rounded-[14px] shadow-[5px_5px_0_#16130F] mb-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {BLOG_TABS.map((tab, ti) => {
                            const isActive = selectedTab === tab.key;
                            const tone = toneFor(ti);
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setSelectedTab(tab.key)}
                                    style={isActive ? { background: tone.c, color: tone.fg } : undefined}
                                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border-2 border-[#16130F] text-xs font-bold transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? 'shadow-[3px_3px_0_#16130F] -translate-y-px'
                                            : 'bg-[#FFF6E5] text-[#16130F] hover:bg-[#FFF1B8]'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full lg:w-auto lg:min-w-[260px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B544A]" size={15} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search articles, exams, topics..."
                            className="w-full bg-[#FFF6E5] border-2 border-[#16130F] rounded-full pl-10 pr-4 py-2.5 text-[13px] font-semibold text-[#16130F] placeholder:text-[#8A7F70] outline-none focus:bg-white focus:shadow-[3px_3px_0_#14837E] transition-shadow"
                        />
                    </div>
                </div>

                {/* Blog Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <div key={n} className="bg-white rounded-[14px] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] overflow-hidden animate-pulse">
                                <div className="h-3 bg-[#F2B705]" />
                                <div className="p-5 space-y-4">
                                    <div className="w-full aspect-[16/10] bg-[#FFF1B8] rounded-[10px]" />
                                    <div className="h-4 bg-[#F3EAD7] rounded w-1/3" />
                                    <div className="h-6 bg-[#F3EAD7] rounded w-full" />
                                    <div className="h-4 bg-[#F3EAD7] rounded w-4/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
                        {filteredBlogs.map((blog, idx) => {
                            const tone = toneFor(idx);
                            return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/blogs/${blog.slug}`)}
                                className="bg-white border-[3px] border-[#16130F] rounded-[14px] overflow-hidden shadow-[5px_5px_0_#16130F] hover:shadow-[8px_8px_0_#16130F] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group cursor-pointer min-w-0"
                            >
                                {/* Category strip */}
                                <div className="flex items-center justify-between gap-2 px-4 py-2 border-b-[3px] border-[#16130F]" style={{ background: tone.c, color: tone.fg }}>
                                    <span className="text-[11px] font-black uppercase tracking-wider truncate">{blog.category}</span>
                                    <span className="flex items-center gap-1 text-[11px] font-bold whitespace-nowrap opacity-90">
                                        <Calendar size={12} />
                                        {blog.date}
                                    </span>
                                </div>

                                {/* Card Thumbnail */}
                                <div className="relative overflow-hidden aspect-[16/10] border-b-[3px] border-[#16130F]" style={{ background: tone.soft }}>
                                    <CoverImage
                                        src={blog.image}
                                        alt={blog.title}
                                        title={blog.title}
                                        category={blog.category}
                                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                                    />
                                    <button
                                        onClick={(e) => toggleBookmark(e, blog.title)}
                                        className="absolute top-3 right-3 bg-white text-[#16130F] p-2 rounded-lg border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] cursor-pointer"
                                        title="Bookmark"
                                    >
                                        <Bookmark size={13} className={bookmarkedBlogs[blog.title] ? 'fill-[#D0362E] text-[#D0362E]' : ''} />
                                    </button>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between text-left space-y-4">
                                    <div className="space-y-2.5">
                                        <h3 className="font-urbanist text-[19px] font-black text-[#16130F] group-hover:text-[#D0362E] transition-colors tracking-[-0.02em] leading-snug break-words">
                                            {blog.title}
                                        </h3>

                                        <p className="text-[#5B544A] text-[13px] font-medium leading-relaxed line-clamp-2">
                                            {blog.description}
                                        </p>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="pt-4 border-t-2 border-dashed border-[#16130F]/25 flex items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 flex-shrink-0 rounded-full font-black text-[10px] flex items-center justify-center border-2 border-[#16130F]" style={{ background: tone.soft }}>
                                                {initials(blog.author)}
                                            </div>
                                            <span className="text-xs text-[#16130F] font-bold truncate">{blog.author || 'UniCoach'}</span>
                                        </div>

                                        <span className="inline-flex items-center gap-1 text-xs font-black text-[#D0362E] whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
                                            Read Article <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <InkCard className="p-8 sm:p-12 text-center max-w-md mx-auto">
                        <span className="w-14 h-14 mx-auto mb-4 grid place-items-center rounded-full bg-[#F2B705] border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] -rotate-6">
                            <FileText size={24} className="text-[#16130F]" />
                        </span>
                        <p className="font-urbanist font-extrabold text-[15px] leading-none text-[#D0362E]">Kuch nahi mila</p>
                        <h3 className="mt-1.5 font-urbanist text-xl font-black text-[#16130F] mb-1">No Articles in This Category</h3>
                        <p className="text-[13px] text-[#5B544A] font-medium mb-5">Try selecting another topic or refine your search keywords.</p>
                        <button
                            onClick={() => { setSelectedTab('popular'); setSearchTerm(''); }}
                            className="px-5 py-2.5 bg-[#14837E] hover:bg-[#0F6C68] text-white rounded-full text-[13px] font-bold border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] transition-colors cursor-pointer"
                        >
                            View All Articles
                        </button>
                    </InkCard>
                )}

                {/* ── Closing CTA ── */}
                <div className="mt-16 sm:mt-20">
                    <BookOkCta
                        hi="Padh liya? Ab pooch lo"
                        text="Blog se idea mil gaya, ab apne case pe baat karo. Free call, 1:1, ek ghante ki."
                    />
                </div>
            </div>

        </main>
    );
};

export default BlogsPage;
