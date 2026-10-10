import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Sparkles, CheckCircle2, Bookmark, Share2, Check, BookOpen } from 'lucide-react';
import PageLoader from '../../../components/PageLoader';
import { API_BASE_URL } from '../../../config';

const BlogDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const API_URL = API_BASE_URL;

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchBlogDetails = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/blogs/${slug}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('Blog not found');
                    }
                    throw new Error('Failed to fetch blog details');
                }
                const data = await res.json();
                setBlog(data);
                
                // SEO settings
                if (data.title) {
                    document.title = data.metaTitle || `${data.title} | UniCoach Blog`;
                }
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc && data.metaDescription) {
                    metaDesc.setAttribute('content', data.metaDescription);
                }

                // Related blogs
                try {
                    const allRes = await fetch(`${API_URL}/blogs`);
                    if (allRes.ok) {
                        const allData = await allRes.json();
                        if (Array.isArray(allData)) {
                            setRelatedBlogs(allData.filter(b => b._id !== data._id).slice(0, 4));
                        }
                    }
                } catch (e) {
                    console.error("Failed to load related blogs", e);
                }

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (slug) {
            fetchBlogDetails();
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

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blog?.title || 'UniCoach Guide',
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

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <BookOpen size={28} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Blog Post Not Found</h2>
                <p className="text-slate-500 mb-6 font-semibold max-w-md">The article you are looking for does not exist or has been unpublished.</p>
                <button 
                    onClick={() => navigate('/blogs')}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                    Back to All Blogs
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-24 relative overflow-x-clip">
            
            {/* Ambient Background Blur */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-100/60 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-[130px] pointer-events-none" />

            {/* Standard Global Width Container */}
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
                
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
                    <button 
                        onClick={() => navigate('/blogs')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={14} />
                        <span>Back to all articles</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                        >
                            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                            <span>{copied ? 'Link Copied!' : 'Share Guide'}</span>
                        </button>
                    </div>
                </div>

                {/* 12-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Main Story Column (8 Columns) */}
                    <article className="lg:col-span-8 space-y-8">
                        
                        {/* Article Header Details */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-black px-3.5 py-1.5 rounded-xl border border-indigo-200/60 shadow-xs">
                                    <Sparkles size={12} className="text-indigo-600" />
                                    <span>{blog.category || 'General'}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-xl border border-emerald-200/60">
                                    <CheckCircle2 size={12} /> Verified Guide
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                {blog.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-semibold pt-2 pb-4 border-b border-slate-200">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-indigo-600" />
                                    {blog.publishDate ? new Date(blog.publishDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-indigo-600" />
                                    5 Min Read
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <User size={14} className="text-indigo-600" />
                                    By UniCoach Team
                                </span>
                            </div>
                        </div>

                        {/* Summary Lead Box */}
                        {blog.metaDescription && (
                            <div className="p-6 bg-slate-100/90 border border-slate-200 rounded-3xl">
                                <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed">
                                    {blog.metaDescription}
                                </p>
                            </div>
                        )}

                        {/* Cover Image */}
                        {blog.imageUrl && (
                            <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
                                <img 
                                    src={getAbsoluteUrl(blog.imageUrl)} 
                                    alt={blog.title} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Rich Story Content */}
                        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
                            {blog.body ? (
                                <div 
                                    className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal space-y-6 prose max-w-none article-body-content"
                                    dangerouslySetInnerHTML={{ __html: formatHtmlBody(blog.body) }}
                                />
                            ) : (
                                <div className="text-slate-400 italic">
                                    This blog post has no content blocks defined.
                                </div>
                            )}
                        </div>

                        {/* Free Counselling CTA Card */}
                        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-10 text-center text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                            
                            <h3 className="text-2xl sm:text-3xl font-black mb-3">Planning to Study Abroad?</h3>
                            <p className="text-slate-300 text-sm sm:text-base font-medium max-w-lg mx-auto mb-6">
                                Speak with our senior admissions advisors for profile evaluation, scholarship shortlisting, and step-by-step visa guidance.
                            </p>
                            <button 
                                onClick={() => navigate('/priority-dm')}
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-2xl hover:bg-orange-50 transition-all shadow-lg cursor-pointer hover:scale-102"
                            >
                                <span>Book Free Profile Evaluation</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </article>

                    {/* Right Sticky Sidebar (4 Columns) */}
                    <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 lg:self-start">
                        
                        {/* Author & Editorial Info */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                Editorial Team
                            </h4>
                            
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-sm flex items-center justify-center shadow-sm flex-shrink-0">
                                    UC
                                </div>
                                <div>
                                    <span className="block text-slate-900 font-bold text-sm leading-tight">UniCoach Team</span>
                                    <span className="text-slate-400 text-xs font-semibold">Global Admissions Expert</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-bold text-slate-600">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Category</span>
                                    <span className="text-indigo-600">{blog.category || 'Study Abroad'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Reading Time</span>
                                    <span>5 Min Read</span>
                                </div>
                            </div>
                        </div>

                        {/* Related Articles */}
                        {relatedBlogs.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-slate-900">
                                        Related Guides
                                    </h4>
                                    <Link to="/blogs" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                                        View All
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {relatedBlogs.map((item) => (
                                        <Link 
                                            key={item._id}
                                            to={`/blogs/${item.slug || item._id}`}
                                            className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/60 transition-colors group"
                                        >
                                            <span className="text-[9px] font-black uppercase text-indigo-600 block mb-1">
                                                {item.category || 'Guide'}
                                            </span>
                                            <h5 className="font-bold text-slate-800 text-xs leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                {item.title}
                                            </h5>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Counselling Card */}
                        <div className="bg-indigo-50 border border-indigo-150 rounded-3xl p-6 text-left space-y-3">
                            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                                <Sparkles size={16} />
                                <span>Free Admissions Assistance</span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                Get your profile evaluated by university alumni and certified study abroad counselors.
                            </p>
                            <button 
                                onClick={() => navigate('/priority-dm')}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                                Start 1:1 Consultation
                            </button>
                        </div>
                    </aside>

                </div>

            </div>
        </main>
    );
};

export default BlogDetailPage;
