import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Calendar,
    Clock,
    Users,
    Award,
    Star,
    ChevronDown,
    Video,
    MapPin,
    Sparkles,
    User,
    ArrowRight,
    Play,
    Bookmark
} from 'lucide-react';
import Interactive3DGrid from '@/components/Interactive3DGrid';
import EventRegistrationModal from '@/components/EventRegistrationModal';
import { useLead } from '../../context/LeadContext';
import { API_BASE_URL } from '../../config';
import { eventPath, getSpeakerPhoto, toAbsoluteUrl } from '../../utils/eventHelpers';

// Large portraits of our event hosts (cut from their event banners); Admin → Events "Speaker photo" overrides
const SPEAKER_PORTRAITS = {
    nitya: '/images/mentors/nitya_portrait.webp',
    manan: '/images/mentors/manan_portrait.webp',
    prachi: '/images/mentors/prachi_portrait.webp',
};

// The speakers section shows the real hosts of the published events (one card per person, newest event first)
const speakersFromEvents = (events) => {
    const byName = new Map();
    for (const ev of events) {
        const raw = String(ev.speaker || '').trim();
        const name = raw.split('(')[0].trim();
        if (!name || byName.has(name.toLowerCase())) continue;
        const firstName = name.toLowerCase().split(/\s+/)[0];
        const tags = [ev.country, ...(Array.isArray(ev.tags) ? ev.tags : [])]
            .map((t) => String(t || '').trim())
            .filter(Boolean)
            .filter((t, i, all) => all.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i)
            .slice(0, 2);
        byName.set(name.toLowerCase(), {
            name,
            role: ev.speakerRole || (raw.match(/\((.*?)\)/) || [])[1] || '',
            image: ev.speakerPhoto ? toAbsoluteUrl(ev.speakerPhoto) : (SPEAKER_PORTRAITS[firstName] || getSpeakerPhoto(raw)),
            bio: ev.speakerBio || `Host of “${ev.title}”.`,
            tags,
            links: ev.speakerLinks || {},
            eventLink: eventPath(ev),
        });
    }
    return [...byName.values()];
};

const SPEAKER_LINK_LABELS = [
    ['linkedin', 'LinkedIn'],
    ['instagram', 'Instagram'],
    ['twitter', 'X'],
    ['youtube', 'YouTube'],
    ['website', 'Website'],
];

// Admin uploads (/uploads/...) are served by the API host, not the site
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

// Registration link from Admin → Events: http(s) or a site path; a bare domain gets https://; other schemes are ignored
const toRegistrationUrl = (link) => {
    const value = typeof link === 'string' ? link.trim() : '';
    if (!value || value === '#') return '';
    if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value;
    if (/^[a-z][a-z\d+.-]*:/i.test(value)) return '';
    return `https://${value}`;
};

// Real sign-ups only (registrationCount is kept by POST /events/:id/register)
const registeredLabel = (item) => (item?.registrationCount > 0 ? `${item.registrationCount} Registered` : '');

// Over once the end time (or the start time, when no end is set) has passed; an undated event is still open
const isEventOver = (item) => {
    const ts = new Date(item?.eventEnd || item?.eventStart || NaN).getTime();
    return Number.isFinite(ts) && ts < Date.now();
};

const useNow = (intervalMs = 1000) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
};

// Live countdown to the featured event's real start time
const FeaturedCountdown = ({ start, end }) => {
    const now = useNow();
    const startTs = new Date(start).getTime();
    const endTs = end ? new Date(end).getTime() : startTs;

    if (now >= startTs) {
        return (
            <div className="my-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-center">
                <span className="text-emerald-600 inline-flex items-center gap-1.5 font-bold text-[12px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {now < endTs ? 'Happening now' : 'This session has started'}
                </span>
            </div>
        );
    }

    const total = Math.floor((startTs - now) / 1000);
    const units = [
        { label: "Days", val: Math.floor(total / 86400) },
        { label: "Hrs", val: Math.floor((total % 86400) / 3600) },
        { label: "Mins", val: Math.floor((total % 3600) / 60) },
        { label: "Secs", val: total % 60 }
    ];

    return (
        <div className="my-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                <span>Starts In:</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
                {units.map((t) => (
                    <div key={t.label} className="bg-white border border-slate-200/70 p-2.5 rounded-xl shadow-xs">
                        <span className="block text-xl font-black text-slate-900 tabular-nums">{t.val.toString().padStart(2, '0')}</span>
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">{t.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Custom LinkedIn SVG Icon
const LinkedinIcon = ({ size = 14 }) => (
    <svg className="w-3.5 h-3.5" style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const EventsPage = () => {
    const navigate = useNavigate();
    const { openEligibilityModal } = useLead() || {};
    const [, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'webinar', 'fair', 'timeline'
    const [selectedDay, setSelectedDay] = useState('all'); // 'all', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'
    const [faqOpen, setFaqOpen] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null); // For registration modal
    const [dbEvents, setDbEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [toasts, setToasts] = useState([]);
    const toastIdRef = useRef(0);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/events`);
                if (res.ok) {
                    const data = await res.json();
                    setDbEvents(Array.isArray(data) ? data : []);
                    // /events?register=<id or slug> opens that event's registration form
                    // (events with an external link, and ended events, open their own page instead)
                    const wanted = new URLSearchParams(window.location.search).get('register');
                    if (wanted && Array.isArray(data)) {
                        const match = data.find((ev) => String(ev._id) === wanted || ev.slug === wanted);
                        if (match && (isEventOver(match) || toRegistrationUrl(match.registrationLink))) {
                            navigate(eventPath(match), { replace: true });
                            return;
                        }
                        if (match) setSelectedEvent(match);
                        setSearchParams((prev) => {
                            const next = new URLSearchParams(prev);
                            next.delete('register');
                            return next;
                        }, { replace: true });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch events from API", err);
            } finally {
                setLoadingEvents(false);
            }
        };
        fetchEvents();
    }, [setSearchParams, navigate]);

    // Prevent background page from scrolling when the registration modal is open
    useEffect(() => {
        if (selectedEvent) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [selectedEvent]);

    // Helper to format URLs to be absolute
    const getAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Only admin uploads live on the API server; /events/*.webp etc. are frontend static files
        if (!url.startsWith('/uploads')) return url;
        return `${API_ORIGIN}${url}`;
    };

    const formatEventDate = (startStr) => {
        if (!startStr) return '';
        const d = new Date(startStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const formatEventTime = (startStr, endStr) => {
        if (!startStr) return '';
        const s = new Date(startStr);
        const formatTime = (dateObj) => {
            let hrs = dateObj.getHours();
            const mins = dateObj.getMinutes().toString().padStart(2, '0');
            const ampm = hrs >= 12 ? 'PM' : 'AM';
            hrs = hrs % 12;
            hrs = hrs ? hrs : 12;
            return `${hrs}:${mins}${ampm}`;
        };
        const startFormatted = formatTime(s);
        if (!endStr) return startFormatted;
        const e = new Date(endStr);
        return `${startFormatted} - ${formatTime(e)}`;
    };

    const getWeekday = (dateStr) => {
        if (!dateStr) return '';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[new Date(dateStr).getDay()];
    };

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const triggerToast = (message, type = 'success') => {
        toastIdRef.current += 1;
        const id = toastIdRef.current;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // Registration link set in Admin → Events opens in a new tab; otherwise register on UniCoach
    // (the registration lands in Admin → Requests → Event Registration)
    const openRegistration = (item) => {
        if (!item || isEventOver(item)) return;
        const link = toRegistrationUrl(item.registrationLink);
        if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        } else {
            setSelectedEvent(item);
        }
    };

    const handleBookmark = (e, eventTitle) => {
        e.stopPropagation();
        triggerToast(`Bookmarked: ${eventTitle}`);
    };

    // Opens the counselling form, so the request really reaches the team
    const requestCounselling = (speakerName) => {
        if (openEligibilityModal) openEligibilityModal(`Events page: advice from ${speakerName}`);
    };

    // Each event has its own page (/events/:slug) with the full details
    const openDetails = (item) => {
        const path = eventPath(item);
        if (path) navigate(path);
    };

    const weekdays = [
        { key: 'all', name: 'All Days' },
        { key: 'Mon', name: 'Mon' },
        { key: 'Tue', name: 'Tue' },
        { key: 'Wed', name: 'Wed' },
        { key: 'Thu', name: 'Thu' },
        { key: 'Fri', name: 'Fri' },
        { key: 'Sat', name: 'Sat' },
        { key: 'Sun', name: 'Sun' }
    ];

    // Only real events from Admin → Events (no demo fallbacks)
    const eventsList = dbEvents;

    // Featured: the next event that hasn't finished yet (the API returns events by start date)
    const featuredEvent = eventsList.find((ev) => ev.eventStart && new Date(ev.eventEnd || ev.eventStart) > new Date()) || null;

    // Hero tiles: plain facts plus the real number of upcoming events (no made-up attendee or success stats)
    const upcomingCount = eventsList.filter((ev) => ev.eventStart && new Date(ev.eventEnd || ev.eventStart) > new Date()).length;
    const heroTiles = [
        ...(upcomingCount > 0 ? [{ label: upcomingCount === 1 ? "Upcoming Event" : "Upcoming Events", val: String(upcomingCount) }] : []),
        { label: "To Attend", val: "Free" },
        { label: "Q&A With Mentors", val: "Live" },
        { label: "Free Counselling", val: "1:1" }
    ];

    const filteredEvents = eventsList.filter(e => {
        const itemCategory = e.category || e.type;
        const matchesTab = activeTab === 'all' || activeTab === 'timeline' || itemCategory === activeTab;

        const itemDay = e.day || getWeekday(e.eventStart);
        const matchesDay = selectedDay === 'all' || itemDay === selectedDay;

        return matchesTab && matchesDay;
    });

    // Real hosts of the published events (no sample speakers)
    const speakersList = speakersFromEvents(eventsList);

    return (
        <main className="min-h-screen bg-[#F1F5F9] text-slate-800 pt-[76px] pb-20 relative overflow-hidden">

            {/* Floating Toast Notification Box */}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border border-slate-800"
                        >
                            <div className={`w-2 h-2 rounded-full ${t.type === 'error' ? 'bg-red-400' : 'bg-emerald-400'} animate-ping`}></div>
                            <span>{t.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Clean LeapScholar-Style Hero Section */}
            <section className="relative pt-12 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E9F1FE] via-[#F3F6FD] to-[#F1F5F9] border-b border-slate-200/80 overflow-hidden mb-12">
                {/* 3D Interactive Spotlight & Tilt Grid Background */}
                <Interactive3DGrid gridSize={56} />

                {/* Soft Ambient Sky Light */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-radial from-orange-200/40/50 via-indigo-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-[1280px] mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* Hero Text */}
                        <div className="lg:col-span-7 space-y-6 text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#DE5C2B] border border-orange-200/80 shadow-xs text-xs font-bold">
                                <Sparkles size={13} className="text-[#DE5C2B]" />
                                <span>Live Masterclasses & Global Fairs 2026</span>
                            </div>

                            <h1 className="font-outfit text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-[#0F172A] leading-[1.1]">
                                Connect in Real-Time <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D]">
                                    With Admissions Advisors
                                </span>
                            </h1>

                            <p className="text-[14px] sm:text-[15.5px] text-slate-600 font-normal max-w-xl leading-relaxed">
                                Join interactive webinars, live Q&A sessions, profile workshops, and connect directly with verified university mentors and education advisors.
                            </p>

                            {/* Elevated Stat Cards */}
                            <div className={`grid gap-3.5 pt-2 ${heroTiles.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
                                {heroTiles.map((stat, i) => (
                                    <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-xs">
                                        <span className="block text-2xl font-black text-[#DE5C2B]">{stat.val}</span>
                                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Countdown & Live Ticker Dashboard */}
                        <div className="lg:col-span-5">
                            <div className="bg-white border border-slate-200/90 text-slate-900 rounded-[28px] p-6 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] relative overflow-hidden group text-left">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="inline-flex items-center gap-1.5 text-[#DE5C2B] text-xs font-black uppercase tracking-wider">
                                        <Play size={10} className="fill-[#DE5C2B]" />
                                        <span>Featured Live Event</span>
                                    </span>
                                    <span className="px-2.5 py-0.5 bg-orange-50 text-[#DE5C2B] border border-orange-200/70 text-[10px] font-extrabold uppercase tracking-wider rounded-full">
                                        Next Session
                                    </span>
                                </div>

                                {loadingEvents ? (
                                    <div className="space-y-3 animate-pulse" aria-hidden="true">
                                        <div className="h-5 bg-slate-200 rounded w-11/12" />
                                        <div className="h-4 bg-slate-100 rounded w-2/3" />
                                        <div className="h-20 bg-slate-100 rounded-2xl" />
                                        <div className="h-12 bg-orange-100 rounded-2xl" />
                                    </div>
                                ) : featuredEvent ? (
                                    <>
                                        <h3
                                            onClick={() => openDetails(featuredEvent)}
                                            className="text-lg font-bold text-slate-900 leading-snug group-hover:text-[#DE5C2B] transition-colors cursor-pointer"
                                        >
                                            {featuredEvent.title}
                                        </h3>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} className="text-slate-400" />
                                                {formatEventDate(featuredEvent.eventStart)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} className="text-slate-400" />
                                                {formatEventTime(featuredEvent.eventStart, featuredEvent.eventEnd)}
                                            </span>
                                            {featuredEvent.speaker && (
                                                <span className="flex items-center gap-1">
                                                    <User size={12} className="text-slate-400" />
                                                    {featuredEvent.speaker}
                                                </span>
                                            )}
                                        </div>

                                        <FeaturedCountdown start={featuredEvent.eventStart} end={featuredEvent.eventEnd} />

                                        <button
                                            onClick={() => openRegistration(featuredEvent)}
                                            className="w-full mt-1 py-3.5 rounded-2xl text-white font-bold text-sm bg-[#DE5C2B] hover:bg-[#C04A1D] shadow-md shadow-orange-500/20 transition-all cursor-pointer text-center block duration-200"
                                        >
                                            {featuredEvent.ctaLabel || 'Register Free Seat'}
                                        </button>
                                    </>
                                ) : (
                                    <div className="py-6 text-center">
                                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                                            No upcoming events right now
                                        </h3>
                                        <p className="mt-1.5 text-sm text-slate-500">Check back soon for the next live session.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filterable Events Grid Section */}
            <section className="max-w-[1240px] mx-auto px-6 md:px-8 mb-16 z-10 relative">

                {/* Visual Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200/80 pb-6">
                    <div>
                        <h2 className="font-outfit text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Explore Live & Scheduled Events
                        </h2>
                        <p className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-wider">
                            Choose between direct interactive webinars or dynamic virtual university fairs
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-white p-1.5 border border-slate-200/80 rounded-2xl self-start md:self-center shadow-xs">
                        {['all', 'webinar', 'fair', 'timeline'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer capitalize
                                    ${activeTab === type
                                        ? 'bg-[#DE5C2B] text-white shadow-sm shadow-orange-500/20'
                                        : 'text-slate-600 hover:text-[#DE5C2B]'}`}
                            >
                                {type === 'all' ? 'All Events' : type === 'webinar' ? 'Webinars' : type === 'fair' ? 'Virtual Fairs' : 'Timeline / History'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calendar Weekday Slider */}
                {activeTab !== 'timeline' && (
                    <div className="mb-10 text-left">
                        <span className="block text-[10px] font-black uppercase text-[#DE5C2B] tracking-widest mb-3">Filter by Calendar Timeline</span>
                        <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide">
                            {weekdays.map((day) => (
                                <button
                                    key={day.key}
                                    onClick={() => setSelectedDay(day.key)}
                                    className={`flex-shrink-0 px-5 py-3 rounded-2xl text-xs font-bold border transition-all duration-250 cursor-pointer
                                        ${selectedDay === day.key
                                            ? 'bg-[#DE5C2B] text-white border-[#DE5C2B] shadow-md shadow-orange-500/20'
                                            : 'bg-white text-slate-700 border-slate-200/80 hover:text-[#DE5C2B] hover:border-orange-200'}`}
                                >
                                    {day.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Grid or Timeline Layout of Events */}
                {loadingEvents ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                        {[1, 2, 3, 4, 5, 6].map((k) => (
                            <div key={k} className="bg-white border border-slate-200/80 rounded-3xl p-6 animate-pulse space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="h-6 w-20 bg-slate-200 rounded-lg" />
                                    <div className="h-4 w-16 bg-slate-200 rounded" />
                                </div>
                                <div className="h-5 bg-slate-200 rounded w-3/4" />
                                <div className="h-4 bg-slate-100 rounded w-full" />
                                <div className="h-4 bg-slate-100 rounded w-2/3" />
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <div className="h-8 w-24 bg-slate-200 rounded-xl" />
                                    <div className="h-8 w-24 bg-orange-100 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'timeline' ? (
                    filteredEvents.length > 0 ? (
                        <div className="max-w-3xl mx-auto mt-10 relative border-l-2 border-slate-200 pl-4 md:pl-6 text-left">
                            {filteredEvents.map((item, idx) => {
                                const isPast = isEventOver(item);
                                const itemCategory = item.category || item.type;
                                return (
                                    <div key={item.id || item._id || idx} className="mb-10 ml-6 relative group text-left">
                                        {/* Timeline dot */}
                                        <span className={`absolute -left-[35px] md:-left-[39px] top-1.5 flex items-center justify-center w-4 h-4 rounded-full border-2 bg-white transition-all group-hover:scale-125
                                            ${isPast ? 'border-slate-400 bg-slate-200' : 'border-[#DE5C2B] bg-orange-50'}`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${isPast ? 'bg-slate-400' : 'bg-[#DE5C2B]'}`}></span>
                                        </span>

                                        {/* Timeline card */}
                                        <div className="bg-white border border-slate-200/70 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                <span className="text-[10px] font-black text-[#DE5C2B] uppercase tracking-widest bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-100/60">
                                                    {itemCategory}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-extrabold uppercase">
                                                    {isPast ? 'Completed' : 'Upcoming'}
                                                </span>
                                            </div>
                                            <h4
                                                onClick={() => openDetails(item)}
                                                className="font-bold text-slate-800 text-base mb-2 hover:text-[#DE5C2B] cursor-pointer transition-colors"
                                            >
                                                {item.title}
                                            </h4>
                                            <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4 line-clamp-2">
                                                {item.description || item.body?.replace(/<[^>]*>/g, '').slice(0, 150) || 'No description provided.'}
                                            </p>

                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-bold">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} className="text-slate-400" />
                                                        {formatEventDate(item.eventStart) || item.date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} className="text-slate-400" />
                                                        {formatEventTime(item.eventStart, item.eventEnd) || item.time}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openDetails(item)}
                                                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                                    >
                                                        View Details
                                                    </button>
                                                    {!isPast && (
                                                        <button
                                                            onClick={() => openRegistration(item)}
                                                            className="px-4 py-2 rounded-xl bg-[#DE5C2B] text-xs font-bold text-white hover:bg-[#C04A1D] transition-colors shadow-xs cursor-pointer"
                                                        >
                                                            Register
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200/60 rounded-[32px] p-12 text-center text-slate-500 shadow-sm mt-8">
                            <span className="block text-xl font-bold mb-2">
                                {eventsList.length === 0 ? 'No upcoming events right now — check back soon' : 'No timeline events found'}
                            </span>
                        </div>
                    )
                ) : (
                    filteredEvents.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredEvents.map((item) => {
                                    const itemCategory = item.category || item.type;
                                    const isPast = isEventOver(item);
                                    const registered = registeredLabel(item);
                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            key={item.id || item._id}
                                            onClick={() => openDetails(item)}
                                            className="bg-white border border-slate-200/70 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                                        >
                                            <div className="relative overflow-hidden aspect-[2/1] bg-slate-900 border-b border-slate-100">
                                                <img
                                                    src={item.imageUrl ? getAbsoluteUrl(item.imageUrl) : (item.image || '/events_hero.webp')}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-40"></div>

                                                {/* Ribbon Tags */}
                                                <span className={`absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-widest border text-white backdrop-blur-md shadow-sm
                                                    ${itemCategory === 'webinar'
                                                        ? 'bg-[#DE5C2B]/90 border-orange-400/30'
                                                        : 'bg-emerald-600/90 border-emerald-400/30'}`}
                                                >
                                                    {itemCategory === 'webinar' ? <Video size={9} /> : <MapPin size={9} />}
                                                    <span>{itemCategory}</span>
                                                </span>

                                                <button
                                                    onClick={(e) => handleBookmark(e, item.title)}
                                                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-md text-slate-600 hover:text-[#DE5C2B] p-2 rounded-xl border border-slate-200/60 cursor-pointer shadow-sm"
                                                >
                                                    <Bookmark size={12} />
                                                </button>

                                                {registered && (
                                                    <span className="absolute bottom-4 left-4 text-[10px] font-bold text-white flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/65 backdrop-blur-sm">
                                                        {registered}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-6 flex-grow flex flex-col justify-between text-left">
                                                <div>
                                                    <h3 className="text-base md:text-lg font-bold text-slate-800 tracking-tight leading-snug mb-3 group-hover:text-[#DE5C2B] transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                                        {Array.isArray(item.tags) ? item.tags.map((tag, i) => (
                                                            <span key={i} className="text-[10px] font-extrabold text-[#DE5C2B] bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-100/60">
                                                                #{tag}
                                                            </span>
                                                        )) : null}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-100 space-y-4">
                                                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={14} className="text-slate-400" />
                                                            <span>{formatEventDate(item.eventStart) || item.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={14} className="text-slate-400" />
                                                            <span>{formatEventTime(item.eventStart, item.eventEnd) || item.time}</span>
                                                        </div>
                                                    </div>
                                                    {isPast ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDetails(item);
                                                            }}
                                                            className="w-full py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer text-center block duration-200"
                                                        >
                                                            Event ended · View details
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openRegistration(item);
                                                            }}
                                                            className="w-full py-3.5 rounded-2xl text-white font-bold text-xs bg-[#DE5C2B] hover:bg-[#C04A1D] shadow-md shadow-orange-500/20 transition-all cursor-pointer text-center block duration-200"
                                                        >
                                                            {item.ctaLabel || 'Register Free Seat'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <div className="bg-white border border-slate-200/60 rounded-[32px] p-12 text-center text-slate-500 shadow-sm">
                            {eventsList.length === 0 ? (
                                <>
                                    <span className="block text-xl font-bold mb-2">No upcoming events right now — check back soon</span>
                                    <p className="text-xs font-semibold">New live sessions are announced here as soon as they are scheduled.</p>
                                </>
                            ) : (
                                <>
                                    <span className="block text-xl font-bold mb-2">No Scheduled Sessions found</span>
                                    <p className="text-xs font-semibold">Try selecting another day of the week or clearing the filters.</p>
                                </>
                            )}
                        </div>
                    )
                )}
            </section>

            {/* Why Attend Section */}
            <section className="bg-white border border-slate-200/80 py-16 px-6 md:px-12 rounded-[32px] max-w-[1240px] mx-auto mb-16 relative overflow-hidden shadow-sm">
                <div className="max-w-[1040px] mx-auto relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/70 text-[#DE5C2B] text-[10px] font-black uppercase tracking-wider mb-2">
                            <span>Key Benefits</span>
                        </div>
                        <h2 className="font-outfit text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-tight">
                            Why Attend UniCoach Events?
                        </h2>
                        <p className="text-slate-600 mt-2 text-sm font-normal">
                            Get direct counselling pathways, checklist maps, and expert interactions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Star size={22} className="text-[#DE5C2B]" />,
                                title: "Top Speakers",
                                desc: "Hear from students already living abroad, university admissions representatives, and global preparation mentors."
                            },
                            {
                                icon: <Award size={22} className="text-[#DE5C2B]" />,
                                title: "Quality Content",
                                desc: "Obtain personalized templates, visa guides, slot booking strategies, and mock tests straight from the speakers."
                            },
                            {
                                icon: <Users size={22} className="text-[#DE5C2B]" />,
                                title: "Networking",
                                desc: "Join active study cohorts of peer students from India, build review teams, and plan group travel templates."
                            }
                        ].map((card, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl text-center space-y-4 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center mx-auto text-[#DE5C2B] shadow-xs">
                                    {card.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                                <p className="text-slate-600 text-xs leading-relaxed font-normal">
                                    {card.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Speakers: the real hosts of our events (hidden when there are none) */}
            {speakersList.length > 0 && (
            <section className="max-w-[1240px] mx-auto px-6 md:px-8 mb-20 z-10 relative">
                <div className="text-center max-w-xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/70 text-[#DE5C2B] text-[10px] font-black uppercase tracking-wider mb-2">
                        <span>Global Experts Portfolio</span>
                    </div>
                    <h2 className="font-outfit text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Meet Our Global Mentors & Speakers
                    </h2>
                    <p className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-wider">
                        Learn from students and advisors with verified international acceptances
                    </p>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${speakersList.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3 max-w-[1000px] mx-auto'}`}>
                    {speakersList.map((sp) => (
                        <div
                            key={sp.name}
                            className="bg-white border border-slate-200/70 rounded-[28px] overflow-hidden shadow-sm flex flex-col group relative hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {/* Speaker image */}
                            <div className="relative aspect-[10/11] bg-[#F6EBD3] overflow-hidden border-b border-slate-100">
                                {sp.image ? (
                                    <img
                                        src={sp.image}
                                        alt={sp.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-5xl font-black text-[#DE5C2B]/60">{sp.name.charAt(0)}</div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60"></div>

                                {/* Quick tags inside image */}
                                <div className="absolute bottom-3 left-4 flex flex-wrap gap-1">
                                    {sp.tags.map((tag, i) => (
                                        <span key={i} className="text-[9px] font-extrabold text-white bg-[#DE5C2B]/90 px-2 py-0.5 rounded border border-blue-400/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Speaker Bio details */}
                            <div className="p-5 space-y-3 flex-grow flex flex-col justify-between text-left">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-base leading-snug group-hover:text-[#DE5C2B] transition-colors">{sp.name}</h4>
                                    <span className="block text-[10px] text-slate-450 font-extrabold uppercase mt-0.5 leading-snug">{sp.role}</span>
                                    <p className="text-slate-500 text-[11px] font-semibold leading-relaxed mt-2.5 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                                        {sp.bio}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3 select-none">
                                    <button
                                        onClick={() => requestCounselling(sp.name)}
                                        className="text-[10px] font-black uppercase text-[#DE5C2B] hover:text-[#C04A1D] flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>Request advice</span>
                                        <ArrowRight size={10} />
                                    </button>
                                    {/* Only the speaker's real links (Admin → Events → speaker links) */}
                                    <div className="flex flex-wrap justify-end gap-x-2.5 gap-y-1">
                                        {SPEAKER_LINK_LABELS.filter(([key]) => /^https?:\/\//i.test(sp.links?.[key] || '')).map(([key, label]) => (
                                            <a
                                                key={key}
                                                href={sp.links[key]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${sp.name} on ${label}`}
                                                className="text-[10px] font-bold text-slate-400 hover:text-[#DE5C2B] inline-flex items-center gap-1"
                                            >
                                                {key === 'linkedin' ? <LinkedinIcon size={12} /> : label}
                                            </a>
                                        ))}
                                        {sp.eventLink && (
                                            <button
                                                type="button"
                                                onClick={() => navigate(sp.eventLink)}
                                                className="text-[10px] font-bold text-slate-500 hover:text-[#DE5C2B] cursor-pointer"
                                            >
                                                View event
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            )}

            {/* FAQs Section */}
            <section className="max-w-[840px] mx-auto px-6 mb-20">
                <div className="text-center mb-10">
                    <h2 className="font-outfit text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-3 text-left">
                    {[
                        {
                            q: "Are the webinars free to attend?",
                            a: "Yes, all UniCoach masterclasses, roadmap webinars, and virtual university fairs are 100% free of charge for student aspirants."
                        },
                        {
                            q: "Can I register for multiple events?",
                            a: "Absolutely. We encourage you to register for all events aligning with your target countries (e.g. UK, Germany, Canada) to gather comprehensive information."
                        },
                        {
                            q: "Will I get a link to the recording if I miss the live slot?",
                            a: "Registered candidates receive a follow-up email containing the recorded webinar stream within 24 hours of the event's completion."
                        },
                        {
                            q: "How can I ask my questions during the event?",
                            a: "Every masterclass webinar features a live chat box and a dedicated Q&A block where mentors address candidate questions individually."
                        }
                    ].map((faq, idx) => {
                        const isOpen = !!faqOpen[idx];
                        return (
                            <div key={idx} className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-xs transition-all duration-200">
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-[#DE5C2B] transition-colors cursor-pointer"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown
                                        size={16}
                                        className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#DE5C2B]' : ''}`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="px-5 pb-5 pt-1 text-slate-600 text-xs md:text-sm border-t border-slate-100 leading-relaxed font-normal">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Bottom CTA Block */}
            <section className="max-w-[1240px] mx-auto px-6 md:px-8">
                <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/40 border border-orange-200/80 rounded-[32px] p-8 md:p-14 text-center relative overflow-hidden shadow-sm">
                    <div className="max-w-xl mx-auto space-y-5 relative z-10">
                        <h2 className="font-outfit text-2xl md:text-[2.2rem] font-black text-[#0F172A] tracking-tight leading-tight">
                            Ready to Take the Leap?
                        </h2>
                        <p className="text-slate-600 text-sm font-normal leading-relaxed">
                            Connect with India's finest counsellors and join the biggest study abroad community to plan your admissions.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-white font-bold text-sm bg-[#DE5C2B] hover:bg-[#C04A1D] shadow-md shadow-orange-500/20 hover:-translate-y-0.5 transition-all cursor-pointer mt-4"
                        >
                            <span>Book Free Counselling</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════ REGISTRATION MODAL ══════════════ */}
            {/* Shared on-site form: saves the attendee and files an "Event Registration" request in Admin → Requests */}
            <EventRegistrationModal
                event={selectedEvent}
                open={Boolean(selectedEvent)}
                onClose={() => setSelectedEvent(null)}
            />

        </main>
    );
};

export default EventsPage;
