import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Header from '../components/Header';
import {
  FileTextOutlined,
  NotificationOutlined,
  CalendarOutlined,
  PlaySquareOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

import { getCachedData, fetchWithCache } from '../utils/cache';

const ContentHub = () => {
  const navigate = useNavigate();
  const cachedStats = getCachedData('/admin/content-hub:stats');
  const [stats, setStats] = useState(cachedStats || {
    blogs: 0,
    news: 0,
    events: 0,
    digest: 0,
  });
  const [loading, setLoading] = useState(!cachedStats);

  useEffect(() => {
    const fetchContentStats = async () => {
      if (!getCachedData('/admin/content-hub:stats')) {
        setLoading(true);
      }
      try {
        const { data } = await fetchWithCache(
          '/admin/content-hub:stats',
          async () => {
            const [blogsRes, newsRes, eventsRes, digestRes] = await Promise.allSettled([
              API.get('/admin/content?type=blog'),
              API.get('/admin/content?type=news'),
              API.get('/admin/content?type=event'),
              API.get('/admin/content?type=digest'),
            ]);
            return {
              blogs: blogsRes.status === 'fulfilled' && Array.isArray(blogsRes.value.data) ? blogsRes.value.data.length : 0,
              news: newsRes.status === 'fulfilled' && Array.isArray(newsRes.value.data) ? newsRes.value.data.length : 0,
              events: eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data) ? eventsRes.value.data.length : 0,
              digest: digestRes.status === 'fulfilled' && Array.isArray(digestRes.value.data) ? digestRes.value.data.length : 0,
            };
          },
          {
            onBackgroundUpdate: (fresh) => {
              setStats(fresh);
            }
          }
        );
        setStats(data);
      } catch (err) {
        console.error('Error fetching content stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContentStats();
  }, []);

  const cards = [
    {
      id: 'blogs',
      title: 'Blogs & Articles',
      count: stats.blogs,
      description: 'Manage educational blog articles, SEO posts, and study abroad guides',
      icon: <FileTextOutlined />,
      path: '/blogs',
      createPath: '/blogs/create',
      btnText: 'Manage Articles',
    },
    {
      id: 'news',
      title: 'News & Press Updates',
      count: stats.news,
      description: 'Publish official university updates, visa policy changes, and news',
      icon: <NotificationOutlined />,
      path: '/news',
      createPath: '/news/create',
      btnText: 'Manage News',
    },
    {
      id: 'events',
      title: 'Events & Webinars',
      count: stats.events,
      description: 'Organize university fairs, live student webinars, and Q&A sessions',
      icon: <CalendarOutlined />,
      path: '/events',
      createPath: '/events/create',
      btnText: 'Manage Events',
    },
    {
      id: 'digest',
      title: 'Video Shorts & Digest',
      count: stats.digest,
      description: 'Upload video reels, student testimonial shorts, and quick summaries',
      icon: <PlaySquareOutlined />,
      path: '/digest',
      createPath: '/digest/create',
      btnText: 'Manage Digest',
    },
  ];

  return (
    <div>
      <Header
        title="Content hub"
        subtitle="Overview of published content"
        extra={
          <button type="button" onClick={() => navigate('/blogs/create')} className="nx-btn nx-btn--dark" aria-label="Create new article">
            <PlusOutlined /> <span className="hidden sm:inline">Create new article</span>
          </button>
        }
      />
      {/* Main Content Area */}
      <div className="dashboard-content">
        <p className="text-[13.5px] leading-relaxed text-[var(--ux-text-2)] max-w-[640px] mt-1 mb-5">
          Publish and maintain blogs, news releases, upcoming webinars, video digests, and email communication templates for UniCoach.
        </p>

        {/* Content Hub Grid with Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading ? (
            [1, 2, 3, 4].map((idx) => (
              <div key={idx} className="nx-card p-5 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#ecebe6]" />
                  <div className="w-10 h-8 rounded-lg bg-[#ecebe6]" />
                </div>
                <div className="h-5 w-36 bg-[#ecebe6] rounded-md mb-3" />
                <div className="h-3.5 w-full bg-[#f1f0eb] rounded mb-2" />
                <div className="h-3.5 w-4/5 bg-[#f1f0eb] rounded mb-8" />
                <div className="flex items-center justify-between pt-4 border-t border-[var(--ux-line-2)]">
                  <div className="h-4 w-24 bg-[#ecebe6] rounded" />
                  <div className="w-9 h-9 rounded-full bg-[#ecebe6]" />
                </div>
              </div>
            ))
          ) : (
            cards.map((card) => (
              <div key={card.id} className="nx-card p-5 flex flex-col group">
                <div className="flex items-center justify-between mb-4">
                  <span className="nx-icon-circle">{card.icon}</span>
                  <span className="text-[30px] leading-none font-semibold tracking-[-0.04em] text-[var(--ux-ink)]">
                    {card.count}
                  </span>
                </div>
                <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-[var(--ux-ink)] mb-1.5">{card.title}</h3>
                <p className="text-[12.5px] leading-relaxed text-[var(--ux-text-2)] flex-1 mb-5">{card.description}</p>

                <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-[var(--ux-line-2)]">
                  <button
                    type="button"
                    onClick={() => navigate(card.path)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ux-ink)] cursor-pointer transition-colors hover:text-[var(--ux-brand-strong)]"
                  >
                    {card.btnText} <ArrowRightOutlined className="text-[11px] transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(card.createPath)}
                    className="nx-round-btn nx-round-btn--sm"
                    title="Quick Add"
                    aria-label={`Add to ${card.title}`}
                  >
                    <PlusOutlined />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Tips Section */}
        <div className="nx-card nx-card--soft p-5 sm:p-6 mt-4 flex items-start gap-4">
          <span className="nx-icon-circle" style={{ background: '#fff' }}>
            <CheckCircleOutlined />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[var(--ux-ink)] mb-1">Industry best practice tip</p>
            <p className="text-[12.5px] leading-relaxed text-[var(--ux-text-2)]">
              Use the top sub-tabs above to switch between Blogs, News, Events, and Templates instantly. All content updates are immediately published live to the public portal and visible across all student recommendation engines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentHub;
