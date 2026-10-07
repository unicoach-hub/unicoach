import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Calendar, 
    Clock, 
    User, 
    ArrowLeft, 
    ArrowRight, 
    Sparkles, 
    CheckCircle2, 
    Share2, 
    Newspaper,
    Tag,
    Globe2,
    Building2,
    Plane,
    GraduationCap,
    FileCode,
    FileText,
    TrendingUp,
    Bookmark,
    Check
} from 'lucide-react';
import PageLoader from '../../../components/PageLoader';
import { API_BASE_URL } from '../../../config';

const NewsDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const API_URL = API_BASE_URL;

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchNewsDetails = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/news/${slug}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('News release not found');
                    }
                    throw new Error('Failed to fetch news article');
                }
                const data = await res.json();
                setNews(data);
                
                // Set SEO metadata
                if (data.title) {
                    document.title = `${data.title} | UniCoach Newsroom`;
                }
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc && data.description) {
                    metaDesc.setAttribute('content', data.description);
                }

                // Fetch other news for related section
                try {
                    const allRes = await fetch(`${API_URL}/news`);
                    if (allRes.ok) {
                        const allData = await allRes.json();
                        if (Array.isArray(allData)) {
                            setRelatedNews(allData.filter(item => item._id !== data._id).slice(0, 4));
                        }
                    }
                } catch (e) {
                    console.error("Failed to load related news", e);
                }

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchNewsDetails();
        }
    }, [slug]);

    const getAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const cleanBase = API_URL.replace('/api', '');
        return `${cleanBase}${url}`;
    };

    const formatHtmlBody = (html) => {
        if (!html) return '';
        const base = API_URL.replace('/api', '');
        return html
            .replace(/src="\/uploads\//g, `src="${base}/uploads/`)
            .replace(/src='\/uploads\//g, `src='${base}/uploads/`);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: news?.title || 'UniCoach Newsroom',
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (error || !news) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Newspaper size={28} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">News Article Not Found</h2>
                <p className="text-slate-500 mb-6 font-semibold max-w-md">
                    The news release or report you are looking for does not exist or has been removed from the Newsroom.
                </p>
                <button 
                    onClick={() => navigate('/newsroom')}
                    className="px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-colors cursor-pointer"
                >
                    Return to Newsroom
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-24 relative overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-100/60 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-[130px] pointer-events-none" />

            {/* Standard Global Width Container */}
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
                
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
                    <button 
                        onClick={() => navigate('/newsroom')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={14} />
                        <span>Back to Newsroom</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                        >
                            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                            <span>{copied ? 'Link Copied!' : 'Share Release'}</span>
                        </button>
                    </div>
                </div>

                {/* 12-Column Responsive Layout to Fill Width */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Main Story Column (8 Columns) */}
                    <article className="lg:col-span-8 space-y-8">
                        
                        {/* Article Header */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-black px-3.5 py-1.5 rounded-xl border border-indigo-200/60 shadow-xs">
                                    <Sparkles size={12} className="text-indigo-600" />
                                    <span>{news.category || 'News Release'}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-xl border border-emerald-200/60">
                                    <CheckCircle2 size={12} /> Official Release
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                {news.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-semibold pt-2 pb-4 border-b border-slate-200">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-indigo-600" />
                                    {formatDate(news.createdAt)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-indigo-600" />
                                    3 Min Read
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <User size={14} className="text-indigo-600" />
                                    UniCoach Press & Communications
                                </span>
                            </div>
                        </div>

                        {/* Summary Lead Box */}
                        {news.description && (
                            <div className="p-6 bg-slate-100/90 border border-slate-200 rounded-3xl">
                                <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed">
                                    {news.description}
                                </p>
                            </div>
                        )}

                        {/* Cover Image Banner */}
                        {news.imageUrl && (
                            <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-md flex items-center justify-center">
                                <img 
                                    src={getAbsoluteUrl(news.imageUrl)} 
                                    alt={news.title} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Rich HTML Body */}
                        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
                            {news.body ? (
                                <div 
                                    className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal space-y-6 prose max-w-none article-body-content"
                                    dangerouslySetInnerHTML={{ __html: formatHtmlBody(news.body) }}
                                />
                            ) : (
                                <div className="text-slate-400 italic">
                                    No additional body text available for this release.
                                </div>
                            )}
                        </div>

                        {/* Free Counselling CTA Card */}
                        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-center text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                            
                            <h3 className="text-2xl sm:text-3xl font-black mb-3">Looking to Study at a Top Global University?</h3>
                            <p className="text-slate-300 text-sm sm:text-base font-medium max-w-lg mx-auto mb-6">
                                Get end-to-end support with university shortlisting, collateral-free education loans, verified scholarships, and visa processing.
                            </p>
                            <button 
                                onClick={() => navigate('/priority-dm')}
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-2xl hover:bg-indigo-50 transition-all shadow-lg cursor-pointer hover:scale-102"
                            >
                                <span>Connect with Admissions Advisor</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </article>

                    {/* Right Sticky Sidebar (4 Columns) */}
                    <aside className="lg:col-span-4 space-y-6">
                        
                        {/* Article Meta Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                Release Metadata
                            </h4>
                            
                            <div className="space-y-3 text-xs font-bold text-slate-600">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <span className="text-slate-400">Category</span>
                                    <span className="text-indigo-600">{news.category || 'General'}</span>
                                </div>
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <span className="text-slate-400">Published On</span>
                                    <span>{formatDate(news.createdAt)}</span>
                                </div>
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <span className="text-slate-400">Verified Press</span>
                                    <span className="text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Yes
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Publisher</span>
                                    <span>UniCoach Media</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Releases List */}
                        {relatedNews.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-slate-900">
                                        More Updates
                                    </h4>
                                    <Link to="/newsroom" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                                        View All
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {relatedNews.map((item) => (
                                        <Link 
                                            key={item._id}
                                            to={`/newsroom/${item.slug || item._id}`}
                                            className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/60 transition-colors group"
                                        >
                                            <span className="text-[9px] font-black uppercase text-indigo-600 block mb-1">
                                                {item.category || 'News'}
                                            </span>
                                            <h5 className="font-bold text-slate-800 text-xs leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                {item.title}
                                            </h5>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fast Support Box */}
                        <div className="bg-indigo-50 border border-indigo-150 rounded-3xl p-6 text-left space-y-3">
                            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                                <Sparkles size={16} />
                                <span>Media & Press Inquiries</span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                For press kits, interview requests with our founders, or academic reports, contact our media relations desk.
                            </p>
                            <a 
                                href="mailto:press@unicoach.com" 
                                className="inline-block text-xs font-bold text-indigo-600 hover:underline"
                            >
                                press@unicoach.com →
                            </a>
                        </div>
                    </aside>

                </div>

            </div>
        </main>
    );
};

export default NewsDetailPage;
