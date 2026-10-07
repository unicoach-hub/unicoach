import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Play, ArrowRight, Video, Newspaper } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config';

const NewsAndDigestSection = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [digests, setDigests] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, digestRes] = await Promise.all([
          fetch(`${API_URL}/news`),
          fetch(`${API_URL}/digest`)
        ]);

        if (newsRes.ok) {
          const newsData = await newsRes.json();
          setNews(Array.isArray(newsData) ? newsData.slice(0, 3) : []);
        }
        
        if (digestRes.ok) {
          const digestData = await digestRes.json();
          setDigests(Array.isArray(digestData) ? digestData.slice(0, 2) : []);
        }
      } catch (err) {
        console.error("Error loading homepage news and digests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanBase = API_URL.replace('/api', '');
    return `${cleanBase}${url}`;
  };

  if (loading) {
    return null; // Silent load on home page or small loading state
  }

  // Only render section if we have at least one news item or digest item
  if (news.length === 0 && digests.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[#0a0f29] text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-black uppercase tracking-wider mb-4">
              <Newspaper size={12} />
              <span>UniCoach Bulletin</span>
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white">
              Latest <span className="bg-gradient-to-r from-blue-400 via-indigo-350 to-purple-400 bg-clip-text text-transparent">News & Student Updates</span>
            </h2>
            <p className="text-slate-400 text-sm font-semibold mt-3 max-w-xl">
              Stay updated with the latest visa rules, official company announcements, and expert-curated student success reviews.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: News releases (7 Columns) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Newspaper className="text-indigo-400" size={20} />
                <span>Newsroom Updates</span>
              </h3>
              <Link to="/newsroom" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <span>Visit Newsroom</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {news.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-white/5 text-slate-500 text-sm font-semibold">
                No recent news updates.
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => navigate(`/newsroom/${item.slug || item._id}`)}
                    className="p-6 bg-slate-950/40 border border-white/5 rounded-3xl flex flex-col sm:flex-row gap-6 hover:border-white/10 hover:bg-slate-950/70 transition-all duration-300 cursor-pointer group"
                  >
                    {item.imageUrl && (
                      <div className="sm:w-32 aspect-[16/10] sm:aspect-square rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/5">
                        <img 
                          src={getAbsoluteUrl(item.imageUrl)} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex flex-col justify-between flex-grow">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-indigo-300">
                          {item.category && <span>{item.category}</span>}
                          <span className="flex items-center gap-1 text-slate-500 font-bold">
                            <Calendar size={11} />
                            {new Date(item.publishDate || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-slate-400 text-xs font-semibold leading-relaxed line-clamp-2">
                          {item.metaDescription || (item.body ? item.body.replace(/<[^>]*>/g, '').slice(0, 100) + '...' : '')}
                        </p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 group-hover:text-indigo-300 mt-4 flex items-center gap-1">
                        Read details <ArrowRight size={10} />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Digest / Reviews (5 Columns) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Video className="text-indigo-400" size={20} />
                <span>Student Spotlight & Insights</span>
              </h3>
              <Link to="/unicoach-digest" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <span>View Digest</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {digests.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-white/5 text-slate-500 text-sm font-semibold">
                No recent video reviews.
              </div>
            ) : (
              <div className="space-y-6">
                {digests.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    viewport={{ once: true }}
                    onClick={() => navigate('/unicoach-digest')}
                    className="bg-slate-950/40 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 hover:bg-slate-950/70 transition-all duration-300 cursor-pointer group flex flex-col"
                  >
                    {/* Media preview */}
                    <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden border-b border-white/5">
                      <img 
                        src={item.imageUrl ? getAbsoluteUrl(item.imageUrl) : "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80"} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                      />
                      {item.isVideo && (
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-all">
                          <div className="w-12 h-12 rounded-full bg-white/90 text-indigo-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Play size={16} className="fill-indigo-950 ml-0.5" />
                          </div>
                        </div>
                      )}
                      {item.length && (
                        <span className="absolute bottom-3 right-3 bg-black/70 border border-white/10 px-2 py-0.5 rounded text-[10px] font-black text-white">
                          {item.length}
                        </span>
                      )}
                    </div>
                    {/* Text Details */}
                    <div className="p-6 space-y-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                        {item.category === 'reviews' ? 'Student Review' : item.category === 'insights' ? 'Expert Insight' : 'Trending News'}
                      </span>
                      <h4 className="font-bold text-white text-base leading-snug group-hover:text-indigo-400 transition-colors mt-2">
                        {item.title}
                      </h4>
                      <p className="text-slate-400 text-xs font-semibold leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  )
}

export default NewsAndDigestSection
