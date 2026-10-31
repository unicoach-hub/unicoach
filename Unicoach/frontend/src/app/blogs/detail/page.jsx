import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, CheckCircle2, Share2, Check, BookOpen, ListOrdered } from 'lucide-react';
import PageLoader from '../../../components/PageLoader';
import { API_BASE_URL } from '../../../config';
import { DesiHeading, InkCard, Sticker, StationSign } from '../../../components/desi/DesiKit';
import { BookOkCta } from '../../../components/desi/BookOkCta';

// Text of an HTML snippet, for headings and word counts
const stripTags = (html) => (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const slugifyHeading = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

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

    // Body with ids on every h2 (for the contents list), the h2 list itself, and a real reading time
    const { bodyHtml, toc, readMinutes } = useMemo(() => {
        const html = formatHtmlBody(blog?.body || '');
        const items = [];
        const withIds = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, attrs, inner) => {
            const text = stripTags(inner);
            const id = `${slugifyHeading(text) || 'section'}-${items.length + 1}`;
            items.push({ id, text });
            return `<h2${attrs} id="${id}">${inner}</h2>`;
        });
        const words = stripTags(html).split(' ').filter(Boolean).length;
        return { bodyHtml: withIds, toc: items, readMinutes: Math.max(3, Math.round(words / 220)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blog]);

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
            <div className="min-h-screen bg-[#FFF6E5] text-[#16130F] flex flex-col items-center justify-center p-6 text-center">
                <span className="w-16 h-16 rounded-full bg-[#F2B705] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] flex items-center justify-center mb-5">
                    <BookOpen size={28} />
                </span>
                <h2 className="font-urbanist text-3xl font-black mb-2">Blog post not found</h2>
                <p className="text-[#5B544A] mb-6 font-semibold max-w-md">The article you are looking for does not exist or has been unpublished.</p>
                <button
                    onClick={() => navigate('/blogs')}
                    className="no-shine px-6 py-3 bg-[#16130F] text-white font-bold rounded-full border-2 border-[#16130F] shadow-[4px_4px_0_#D0362E] cursor-pointer"
                >
                    Back to all blogs
                </button>
            </div>
        );
    }

    const dateLabel = new Date(blog.publishDate || blog.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <main className="min-h-screen bg-[#FFF6E5] text-[#16130F] pb-20 font-['Onest',sans-serif]">

            {/* Header band */}
            <section className="bg-[#F2B705] px-4 sm:px-6 pt-[96px] md:pt-[112px] pb-10 sm:pb-14 border-b-[3px] border-[#16130F]">
                <div className="max-w-[1480px] mx-auto">
                    {/* the site's floating Back button already sits top-left, so only Share here */}
                    <div className="flex items-center justify-end gap-3 mb-4">
                        <button
                            onClick={handleShare}
                            className="no-shine inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] text-[13px] font-bold cursor-pointer transition-transform hover:-translate-y-0.5"
                        >
                            {copied ? <Check size={14} className="text-[#14837E]" /> : <Share2 size={14} />}
                            <span>{copied ? 'Link copied' : 'Share'}</span>
                        </button>
                    </div>
                    <StationSign hi="पढ़ाई की बातें" en="BLOG ADDA" className="mb-5" />
                    <h1 className="font-urbanist font-black text-[32px] sm:text-[46px] lg:text-[56px] leading-[1.02] tracking-[-0.04em] max-w-[1100px]">
                        {blog.title}
                    </h1>
                    <div className="mt-6 flex flex-wrap items-center gap-2.5">
                        <Sticker bg="#16130F" fg="#FFFFFF" tilt={-1.5}>{blog.category || 'Guide'}</Sticker>
                        <Sticker tilt={1}><CheckCircle2 size={14} className="text-[#14837E]" />Facts checked</Sticker>
                        <Sticker tilt={-1}><Calendar size={14} />{dateLabel}</Sticker>
                        <Sticker bg="#FCE38A" tilt={1.5}><Clock size={14} />{readMinutes} min read</Sticker>
                    </div>
                </div>
            </section>

            <div className="max-w-[1480px] mx-auto px-4 sm:px-6 pt-10 sm:pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[250px_minmax(0,1fr)_330px] gap-8 xl:gap-10 items-start">

                    {/* Left: contents list (wide screens) */}
                    {toc.length > 2 && (
                        <nav aria-label="In this blog" className="hidden xl:block sticky top-28">
                            <InkCard className="p-4">
                                <p className="flex items-center gap-2 font-urbanist font-extrabold text-[14px] text-[#D0362E]"><ListOrdered size={15} />Is blog mein</p>
                                <ol className="mt-3 space-y-1">
                                    {toc.map((t, i) => (
                                        <li key={t.id}>
                                            <a href={`#${t.id}`} className="flex gap-2 -mx-1.5 px-1.5 py-1.5 rounded-md text-[13px] font-semibold leading-snug text-[#3D362E] hover:bg-[#FFF6E5] hover:text-[#16130F]">
                                                <span className="font-urbanist font-black text-[#D0362E] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                                                <span>{t.text}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ol>
                            </InkCard>
                        </nav>
                    )}

                    {/* Main story */}
                    <article className="min-w-0 space-y-8">
                        {blog.metaDescription && (
                            <div className="relative p-5 sm:p-6 bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#F2B705]" style={{ borderRadius: 14 }}>
                                <p className="font-urbanist font-extrabold text-[13px] text-[#D0362E]">Short mein</p>
                                <p className="mt-1.5 text-[15px] sm:text-[17px] font-semibold leading-relaxed">{blog.metaDescription}</p>
                            </div>
                        )}

                        {blog.imageUrl && (
                            <div className="w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-white border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F]" style={{ borderRadius: 18 }}>
                                <img src={getAbsoluteUrl(blog.imageUrl)} alt={blog.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <InkCard className="p-5 sm:p-8 lg:p-10">
                            {blog.body ? (
                                <div
                                    className="max-w-[760px] mx-auto text-[#3D362E] text-base sm:text-lg leading-relaxed article-body-content"
                                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                                />
                            ) : (
                                <p className="text-[#8A7F70] italic">This blog post has no content yet.</p>
                            )}
                        </InkCard>

                        <BookOkCta
                            hi="Padh liya? Ab pooch lo"
                            text="Apne case pe seedhi baat: course, country, visa. Free 1:1 call, ek ghante ki."
                        />
                    </article>

                    {/* Right sidebar */}
                    <aside className="space-y-6 min-w-0">
                        <InkCard className="p-5">
                            <div className="flex items-center gap-3">
                                <span className="w-12 h-12 rounded-xl bg-[#D0362E] text-white border-2 border-[#16130F] font-urbanist font-black text-[15px] grid place-items-center flex-shrink-0">UC</span>
                                <div>
                                    <p className="font-urbanist font-black text-[16px] leading-tight">UniCoach Team</p>
                                    <p className="text-[12.5px] text-[#5B544A] font-semibold">Counsellors and mentors who studied abroad</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t-2 border-dashed border-[#16130F33] grid grid-cols-2 gap-2 text-[12.5px] font-bold">
                                <span className="text-[#8A7F70]">Category</span>
                                <span className="text-right text-[#D0362E]">{blog.category || 'Guide'}</span>
                                <span className="text-[#8A7F70]">Reading time</span>
                                <span className="text-right">{readMinutes} min</span>
                            </div>
                        </InkCard>

                        {relatedBlogs.length > 0 && (
                            <InkCard className="p-5" shadow="#14837E">
                                <div className="flex items-end justify-between gap-2">
                                    <DesiHeading hi="Aage padho" className="[&_h2]:text-[20px] [&_h2]:sm:text-[20px]">Related guides</DesiHeading>
                                    <Link to="/blogs" className="text-[12.5px] font-bold underline decoration-[#D0362E] decoration-2 underline-offset-4 whitespace-nowrap">View all</Link>
                                </div>
                                <div className="mt-4 space-y-2.5">
                                    {relatedBlogs.map((item) => (
                                        <Link
                                            key={item._id}
                                            to={`/blogs/${item.slug || item._id}`}
                                            className="group block p-3 rounded-xl bg-[#FFF6E5] border-2 border-transparent hover:border-[#16130F] hover:bg-white transition-colors"
                                        >
                                            <span className="text-[10.5px] font-black uppercase tracking-wider text-[#14837E] block mb-1">{item.category || 'Guide'}</span>
                                            <span className="flex items-start justify-between gap-2">
                                                <span className="font-bold text-[13px] leading-snug line-clamp-2">{item.title}</span>
                                                <ArrowRight size={14} className="mt-0.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </InkCard>
                        )}

                        <div className="p-5 bg-[#14837E] text-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F]" style={{ borderRadius: 14 }}>
                            <p className="font-urbanist font-extrabold text-[14px] text-[#F2B705]">Free counselling</p>
                            <p className="mt-1 font-urbanist font-black text-[20px] leading-tight">Confused? Ask a senior who has done it.</p>
                            <button
                                onClick={() => navigate('/book-consultation')}
                                className="no-shine mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] font-bold text-[14px] cursor-pointer transition-transform hover:-translate-y-0.5"
                            >
                                Book a free call <ArrowRight size={15} />
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default BlogDetailPage;
