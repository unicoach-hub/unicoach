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
    ArrowRight,
    Bookmark
} from 'lucide-react';
import EventRegistrationModal from '@/components/EventRegistrationModal';
import { useLead } from '../../context/LeadContext';
import { API_BASE_URL } from '../../config';
import { eventPath, getSpeakerPhoto, toAbsoluteUrl, toRegistrationUrl } from '../../utils/eventHelpers';
import { BoardingPassCard, DepartureBoard } from './EventsHeroBoard';
import { mentorLook } from '../../utils/teamMentors';
import { FilmPoster } from '../../components/desi/Desi';
import { DesiHero, DesiHeading, Sticker } from '../../components/desi/DesiKit';
import { BookOkCta } from '../../components/desi/BookOkCta';

// Large portraits of our event hosts (cut from their event banners); Admin → Events "Speaker photo" overrides
const SPEAKER_PORTRAITS = {
    nitya: '/images/mentors/headshots/nitya.webp',
    manan: '/images/mentors/headshots/manan.webp',
    prachi: '/images/mentors/headshots/prachi.webp',
    manvi: '/images/mentors/headshots/manvi.webp',
    munish: '/images/mentors/headshots/munish.webp',
    rishi: '/images/mentors/headshots/rishi.webp',
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
            // Admin photo wins; otherwise our cut-out on its gradient, then the plain portrait
            image: ev.speakerPhoto ? toAbsoluteUrl(ev.speakerPhoto) : (mentorLook(firstName).cutout || SPEAKER_PORTRAITS[firstName] || getSpeakerPhoto(raw)),
            imageBg: ev.speakerPhoto ? null : mentorLook(firstName).gradient,
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


// Real sign-ups only (registrationCount is kept by POST /events/:id/register)
// Desi Pop palette: each event ticket takes the next poster colour, so the grid reads like a poster wall
const CARD_TONES = [
    { c: '#F2B705', fg: '#16130F', soft: '#FFF1B8' },
    { c: '#14837E', fg: '#FFFFFF', soft: '#DDF3EF' },
    { c: '#B8285B', fg: '#FFFFFF', soft: '#FBD9E6' },
    { c: '#D0362E', fg: '#FFFFFF', soft: '#FCE3DA' },
];
const toneFor = (idx) => CARD_TONES[idx % CARD_TONES.length];
// Poster button: ink border, hard offset shadow that presses in on click
const POSTER_BTN = 'border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] hover:shadow-[6px_6px_0_#16130F] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[0_0_0_#16130F] transition-all no-shine';
// The departures board (EventsHeroBoard) carries the site-wide .uc-soft wash; on this page it is a cream station board with an ink frame
const BOARD_SKIN = '[&_.uc-soft.uc-soft.uc-soft.uc-soft]:![background:#FFF6D6] [&_.uc-soft.uc-soft.uc-soft.uc-soft]:![border:3px_solid_#16130F] [&_.uc-soft.uc-soft.uc-soft.uc-soft]:![box-shadow:5px_5px_0_#16130F] [&_.uc-soft.uc-soft.uc-soft.uc-soft]:![border-radius:14px]';
// Small Hindi kicker label (Rozha One)
const HI = "font-urbanist font-extrabold leading-none";

const registeredLabel = (item) => (item?.registrationCount > 0 ? `${item.registrationCount} Registered` : '');

// Over once the end time (or the start time, when no end is set) has passed; an undated event is still open
const isEventOver = (item) => {
    const ts = new Date(item?.eventEnd || item?.eventStart || NaN).getTime();
    return Number.isFinite(ts) && ts < Date.now();
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

    // Hero: the next sessions that haven't finished (real events only)
    const upcomingEvents = eventsList.filter((ev) => ev.eventStart && new Date(ev.eventEnd || ev.eventStart) > new Date()).slice(0, 4);
    const hostPhotoFor = (ev) => {
        const raw = String(ev?.speaker || '').trim();
        const first = raw.split('(')[0].trim().toLowerCase().split(/\s+/)[0];
        return ev?.speakerPhoto ? toAbsoluteUrl(ev.speakerPhoto) : (SPEAKER_PORTRAITS[first] || getSpeakerPhoto(raw));
    };

    const filteredEvents = eventsList.filter(e => {
        const itemCategory = e.category || e.type;
        const matchesTab = activeTab === 'all' || activeTab === 'timeline' || itemCategory === activeTab;

        const itemDay = e.day || getWeekday(e.eventStart);
        const matchesDay = selectedDay === 'all' || itemDay === selectedDay;

        return matchesTab && matchesDay;
    });

    // Real hosts of the published events (no sample speakers)
    const speakersList = speakersFromEvents(eventsList);

    // Ticket stub: day, month, year and weekday from the event start (falls back to the stored date text)
    const stubFor = (item) => {
        const label = formatEventDate(item.eventStart);
        if (!label) return null;
        const [day, mon, year] = label.split(' ');
        return { day, mon, year, weekday: getWeekday(item.eventStart) };
    };

    return (
        <main className="min-h-screen bg-[#FFF6E5] text-[#16130F] font-['Onest',sans-serif] pb-20 relative overflow-hidden">

            {/* Floating Toast Notification Box */}
            <div className="fixed top-6 right-4 sm:right-6 z-50 flex flex-col gap-3">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className="bg-[#16130F] text-white px-5 py-3 rounded-[10px] border-[3px] border-[#16130F] shadow-[4px_4px_0_#F2B705] flex items-center gap-3 text-xs font-bold"
                        >
                            <div className={`w-2.5 h-2.5 rounded-full border-2 border-white ${t.type === 'error' ? 'bg-[#D0362E]' : 'bg-[#14837E]'}`}></div>
                            <span>{t.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* ── HERO: mustard poster band with the live departures board and the next boarding pass ── */}
            <DesiHero
                tone="mustard"
                sign={{ hi: 'Mela', en: 'LIVE EVENTS' }}
                title={(
                    <>
                        Your study abroad journey <br className="hidden sm:block" />
                        <span className="relative inline-block mt-1 px-2.5 bg-[#16130F] text-[#F2B705] -rotate-1" style={{ borderRadius: 6 }}>
                            boards here.
                        </span>
                    </>
                )}
                subtitle="Live sessions with seniors who already study and work abroad. Ask your questions on admissions, scholarships, visas and jobs, in real time."
                stickers={(
                    <Sticker tilt={-1.5}>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D0362E] border-2 border-[#16130F] animate-pulse" />
                        Live masterclasses · Free to attend
                    </Sticker>
                )}
                aside={(
                    loadingEvents ? (
                        <div className="bg-white border-[3px] border-[#16130F] rounded-[18px] shadow-[6px_6px_0_#16130F] p-6 space-y-3 animate-pulse" aria-hidden="true">
                            <div className="h-8 bg-[#FFF1B8] rounded-lg" />
                            <div className="h-12 bg-[#F3EBDB] rounded-lg" />
                            <div className="h-5 bg-[#EADFCB] rounded w-11/12" />
                            <div className="h-20 bg-[#F3EBDB] rounded-xl" />
                            <div className="h-12 bg-[#EADFCB] rounded-xl" />
                        </div>
                    ) : featuredEvent ? (
                        <div className="rounded-[26px] border-[3px] border-[#16130F] shadow-[7px_7px_0_#16130F] overflow-hidden lg:rotate-[1deg]">
                            <BoardingPassCard
                                event={featuredEvent}
                                hostPhoto={hostPhotoFor(featuredEvent)}
                                formatDate={formatEventDate}
                                formatTime={formatEventTime}
                                onRegister={() => openRegistration(featuredEvent)}
                                onOpen={() => openDetails(featuredEvent)}
                            />
                        </div>
                    ) : (
                        <div className="bg-white border-[3px] border-[#16130F] rounded-[18px] shadow-[6px_6px_0_#16130F] p-8 text-center">
                            <p className={`${HI} text-[18px] text-[#D0362E]`}>Agli gaadi jaldi</p>
                            <h3 className="mt-2 font-urbanist text-[20px] font-black text-[#16130F] leading-snug">No upcoming events right now</h3>
                            <p className="mt-1.5 text-sm text-[#5B544A]">Check back soon for the next live session.</p>
                        </div>
                    )
                )}
            >
                {speakersList.length > 0 && (
                    <div className="mt-6 flex items-center gap-3">
                        <div className="flex -space-x-3 shrink-0">
                            {speakersList.slice(0, 4).map((sp) => (
                                sp.image ? (
                                    <img key={sp.name} src={sp.image} alt={sp.name} style={sp.imageBg ? { background: sp.imageBg } : { background: '#FFF6D6' }} className="w-11 h-11 rounded-full object-cover object-top border-[3px] border-[#16130F]" />
                                ) : (
                                    <span key={sp.name} className="w-11 h-11 rounded-full border-[3px] border-[#16130F] bg-[#FFF6D6] text-[#D0362E] font-black flex items-center justify-center">{sp.name[0]}</span>
                                )
                            ))}
                        </div>
                        <p className="text-[13px] font-semibold text-[#16130F]/80 min-w-0">
                            Hosted by <span className="font-black text-[#16130F]">{speakersList.slice(0, 3).map((sp) => sp.name).join(', ').replace(/, ([^,]*)$/, ' & $1')}</span>
                        </p>
                    </div>
                )}

                <div className={`mt-6 ${BOARD_SKIN}`}>
                    <DepartureBoard
                        events={upcomingEvents}
                        photoFor={hostPhotoFor}
                        formatDate={formatEventDate}
                        formatTime={formatEventTime}
                        onOpen={openDetails}
                    />
                </div>
            </DesiHero>

            {/* ── Filterable Events Grid Section ── */}
            <section id="events-grid" className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 pt-14 mb-16 z-10 relative scroll-mt-24">

                {/* Visual Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b-[3px] border-dashed border-[#16130F]">
                    <div className="min-w-0">
                        <DesiHeading hi="Ticket window">Explore Live &amp; Scheduled Events</DesiHeading>
                        <p className="text-[#5B544A] text-xs mt-2 font-bold uppercase tracking-wider">
                            Choose between direct interactive webinars or dynamic virtual university fairs
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 self-start lg:self-end">
                        {['all', 'webinar', 'fair', 'timeline'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`px-3.5 sm:px-4 py-2 text-xs font-extrabold rounded-lg border-[3px] border-[#16130F] transition-all duration-200 cursor-pointer capitalize
                                    ${activeTab === type
                                        ? 'bg-[#16130F] text-[#F2B705] shadow-[3px_3px_0_#D0362E]'
                                        : 'bg-white text-[#16130F] hover:bg-[#FFF1B8] shadow-[3px_3px_0_#16130F]'}`}
                            >
                                {type === 'all' ? 'All Events' : type === 'webinar' ? 'Webinars' : type === 'fair' ? 'Virtual Fairs' : 'Timeline / History'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calendar Weekday Slider */}
                {activeTab !== 'timeline' && (
                    <div className="mb-10 text-left">
                        <span className="flex items-center gap-2 mb-3">
                            <span className={`${HI} text-[15px] text-[#D0362E]`}>Din chuno</span>
                            <span className="text-[10px] font-black uppercase text-[#16130F] tracking-widest">Filter by Calendar Timeline</span>
                        </span>
                        <div className="flex overflow-x-auto gap-2.5 pt-1 pb-3 pl-0.5 scrollbar-hide">
                            {weekdays.map((day) => (
                                <button
                                    key={day.key}
                                    onClick={() => setSelectedDay(day.key)}
                                    className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-xs font-extrabold border-2 border-[#16130F] transition-all duration-200 cursor-pointer
                                        ${selectedDay === day.key
                                            ? 'bg-[#14837E] text-white shadow-[3px_3px_0_#16130F]'
                                            : 'bg-[#FFF6D6] text-[#16130F] hover:bg-white shadow-[2px_2px_0_#16130F]'}`}
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
                            <div key={k} className="flex bg-white border-[3px] border-[#16130F] rounded-[14px] shadow-[5px_5px_0_#16130F] overflow-hidden animate-pulse">
                                <div className="w-[74px] sm:w-[84px] shrink-0 bg-[#FFF1B8] border-r-[3px] border-dashed border-[#16130F]" />
                                <div className="flex-1 p-5 space-y-4">
                                    <div className="h-24 bg-[#F3EBDB] rounded-lg" />
                                    <div className="h-5 bg-[#EADFCB] rounded w-3/4" />
                                    <div className="h-4 bg-[#F3EBDB] rounded w-full" />
                                    <div className="h-10 bg-[#FFF1B8] rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'timeline' ? (
                    filteredEvents.length > 0 ? (
                        <div className="max-w-3xl mx-auto mt-10 relative border-l-[3px] border-[#16130F] pl-3 md:pl-6 text-left">
                            {filteredEvents.map((item, idx) => {
                                const isPast = isEventOver(item);
                                const itemCategory = item.category || item.type;
                                const tone = toneFor(idx);
                                return (
                                    <div key={item.id || item._id || idx} className="mb-10 ml-4 md:ml-6 relative group text-left">
                                        {/* Timeline dot */}
                                        <span
                                            className="absolute -left-[40px] md:-left-[60px] top-4 w-5 h-5 rounded-full border-[3px] border-[#16130F] transition-transform group-hover:scale-125"
                                            style={{ background: isPast ? '#EADFCB' : tone.c }}
                                        />

                                        {/* Timeline card */}
                                        <div className="bg-white border-[3px] border-[#16130F] p-5 sm:p-6 rounded-[14px] shadow-[5px_5px_0_#16130F]">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border-2 border-[#16130F]" style={{ background: tone.c, color: tone.fg }}>
                                                    {itemCategory}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border-2 border-[#16130F] ${isPast ? 'bg-[#EADFCB] text-[#5B544A]' : 'bg-[#FFF6D6] text-[#16130F]'}`}>
                                                    {isPast ? 'Completed' : 'Upcoming'}
                                                </span>
                                            </div>
                                            <h4
                                                onClick={() => openDetails(item)}
                                                className="font-urbanist font-black text-[#16130F] text-[18px] leading-snug mb-2 hover:text-[#D0362E] cursor-pointer transition-colors"
                                            >
                                                {item.title}
                                            </h4>
                                            <p className="text-[#5B544A] text-xs font-semibold leading-relaxed mb-4 line-clamp-2">
                                                {item.description || item.body?.replace(/<[^>]*>/g, '').slice(0, 150) || 'No description provided.'}
                                            </p>

                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t-2 border-dashed border-[#16130F]/30 text-xs text-[#16130F] font-bold">
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} className="text-[#D0362E]" />
                                                        {formatEventDate(item.eventStart) || item.date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} className="text-[#D0362E]" />
                                                        {formatEventTime(item.eventStart, item.eventEnd) || item.time}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => openDetails(item)}
                                                        className="px-4 py-2 rounded-lg border-2 border-[#16130F] bg-white text-xs font-extrabold text-[#16130F] hover:bg-[#FFF6D6] transition-colors cursor-pointer"
                                                    >
                                                        View Details
                                                    </button>
                                                    {!isPast && (
                                                        <button
                                                            onClick={() => openRegistration(item)}
                                                            className={`px-4 py-2 rounded-lg text-xs font-extrabold cursor-pointer ${POSTER_BTN}`}
                                                            style={{ background: tone.c, color: tone.fg }}
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
                        <div className="bg-white border-[3px] border-[#16130F] rounded-[14px] shadow-[5px_5px_0_#16130F] p-10 sm:p-12 text-center mt-8">
                            <p className={`${HI} text-[18px] text-[#D0362E] mb-2`}>Platform khaali hai</p>
                            <span className="block font-urbanist text-xl font-black text-[#16130F]">
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
                                {filteredEvents.map((item, idx) => {
                                    const itemCategory = item.category || item.type;
                                    const isPast = isEventOver(item);
                                    const registered = registeredLabel(item);
                                    const tone = toneFor(idx);
                                    const stub = stubFor(item);
                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: idx % 3 === 0 ? -60 : idx % 3 === 2 ? 60 : 0, y: idx % 3 === 1 ? 36 : 0 }}
                                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                                            viewport={{ once: true, margin: '-40px' }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.45, delay: (idx % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                                            key={item.id || item._id}
                                            onClick={() => openDetails(item)}
                                            className="relative flex bg-white border-[3px] border-[#16130F] rounded-[14px] overflow-hidden shadow-[5px_5px_0_#16130F] hover:shadow-[8px_8px_0_#16130F] transition-shadow duration-200 group cursor-pointer"
                                        >
                                            {/* Ticket stub: the date, torn off along the dashed perforation */}
                                            <div
                                                className="w-[74px] sm:w-[84px] shrink-0 flex flex-col items-center justify-center gap-1 text-center py-5 px-1 border-r-[3px] border-dashed border-[#16130F]"
                                                style={{ background: tone.c, color: tone.fg }}
                                            >
                                                {stub ? (
                                                    <>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.18em]">{stub.weekday}</span>
                                                        <span className="font-urbanist font-black text-[38px] sm:text-[42px] leading-none">{stub.day}</span>
                                                        <span className="text-[12px] font-black uppercase tracking-wider">{stub.mon}</span>
                                                        <span className="text-[10px] font-bold opacity-80">{stub.year}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[11px] font-black uppercase leading-tight [writing-mode:vertical-rl] rotate-180">{item.date}</span>
                                                )}
                                                <span className={`${HI} mt-2 text-[14px]`}>Ticket</span>
                                            </div>
                                            {/* Perforation notches */}
                                            <span aria-hidden="true" className="absolute z-10 left-[61px] sm:left-[71px] -top-[13px] w-[22px] h-[22px] rounded-full bg-[#FFF6E5] border-[3px] border-[#16130F]" />
                                            <span aria-hidden="true" className="absolute z-10 left-[61px] sm:left-[71px] -bottom-[13px] w-[22px] h-[22px] rounded-full bg-[#FFF6E5] border-[3px] border-[#16130F]" />

                                            <div className="flex-1 min-w-0 flex flex-col">
                                                <div className="relative overflow-hidden aspect-[16/9] bg-[#16130F] border-b-[3px] border-[#16130F]">
                                                    <img
                                                        src={item.imageUrl ? getAbsoluteUrl(item.imageUrl) : (item.image || '/events_hero.webp')}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                                                    />

                                                    {/* Ribbon Tags */}
                                                    <span
                                                        className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border-2 border-[#16130F] shadow-[2px_2px_0_#16130F]"
                                                        style={itemCategory === 'webinar' ? { background: '#F2B705', color: '#16130F' } : { background: '#14837E', color: '#FFFFFF' }}
                                                    >
                                                        {itemCategory === 'webinar' ? <Video size={9} /> : <MapPin size={9} />}
                                                        <span>{itemCategory}</span>
                                                    </span>

                                                    <button
                                                        onClick={(e) => handleBookmark(e, item.title)}
                                                        className="absolute top-3 right-3 bg-white text-[#16130F] hover:bg-[#FFF1B8] p-2 rounded-md border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] cursor-pointer"
                                                    >
                                                        <Bookmark size={12} />
                                                    </button>

                                                    {registered && (
                                                        <span className="absolute bottom-3 left-3 text-[10px] font-black text-[#16130F] flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border-2 border-[#16130F]">
                                                            {registered}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between text-left">
                                                    <div>
                                                        <h3 className="font-urbanist text-[17px] md:text-[18px] font-black text-[#16130F] tracking-[-0.01em] leading-snug mb-3 group-hover:text-[#D0362E] transition-colors">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                                            {Array.isArray(item.tags) ? item.tags.map((tag, i) => (
                                                                <span key={i} className="text-[10px] font-extrabold px-2 py-0.5 rounded-md border-2 border-[#16130F] text-[#16130F]" style={{ background: tone.soft }}>
                                                                    #{tag}
                                                                </span>
                                                            )) : null}
                                                        </div>
                                                    </div>

                                                    <div className="pt-3 border-t-2 border-dashed border-[#16130F]/30 space-y-3.5">
                                                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-[#16130F] font-bold">
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar size={14} className="text-[#D0362E]" />
                                                                <span>{formatEventDate(item.eventStart) || item.date}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock size={14} className="text-[#D0362E]" />
                                                                <span>{formatEventTime(item.eventStart, item.eventEnd) || item.time}</span>
                                                            </div>
                                                        </div>
                                                        {isPast ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openDetails(item);
                                                                }}
                                                                className="w-full py-3 rounded-lg border-[3px] border-dashed border-[#16130F] bg-[#F3EBDB] text-[#5B544A] font-extrabold text-xs hover:bg-white hover:text-[#16130F] transition-all cursor-pointer text-center block duration-200"
                                                            >
                                                                Event ended · View details
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openRegistration(item);
                                                                }}
                                                                className={`w-full py-3 rounded-lg font-black text-[13px] cursor-pointer text-center block duration-200 ${POSTER_BTN}`}
                                                                style={{ background: tone.c, color: tone.fg }}
                                                            >
                                                                {item.ctaLabel || 'Register Free Seat'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <div className="bg-white border-[3px] border-[#16130F] rounded-[14px] shadow-[5px_5px_0_#16130F] p-10 sm:p-12 text-center text-[#5B544A]">
                            <p className={`${HI} text-[18px] text-[#D0362E] mb-2`}>Platform khaali hai</p>
                            {eventsList.length === 0 ? (
                                <>
                                    <span className="block font-urbanist text-xl font-black text-[#16130F] mb-2">No upcoming events right now — check back soon</span>
                                    <p className="text-xs font-semibold">New live sessions are announced here as soon as they are scheduled.</p>
                                </>
                            ) : (
                                <>
                                    <span className="block font-urbanist text-xl font-black text-[#16130F] mb-2">No Scheduled Sessions found</span>
                                    <p className="text-xs font-semibold">Try selecting another day of the week or clearing the filters.</p>
                                </>
                            )}
                        </div>
                    )
                )}
            </section>

            {/* Retro film-poster banner for our sessions */}
            <FilmPoster />

            {/* ── Why Attend Section ── */}
            <section className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 mb-16 mt-4">
                <div className="bg-[#14837E] border-[3px] border-[#16130F] rounded-[18px] shadow-[6px_6px_0_#16130F] py-12 md:py-16 px-5 sm:px-8 md:px-12">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <Sticker bg="#F2B705" tilt={-2} className="mb-4">Key Benefits</Sticker>
                        <DesiHeading hi="Kyun aana chahiye?" light>Why Attend UniCoach Events?</DesiHeading>
                        <p className="text-white/90 mt-2 text-sm font-medium">
                            Get direct counselling pathways, checklist maps, and expert interactions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                icon: <Star size={22} />,
                                title: "Top Speakers",
                                desc: "Hear from students already living abroad, university admissions representatives, and global preparation mentors."
                            },
                            {
                                icon: <Award size={22} />,
                                title: "Quality Content",
                                desc: "Obtain personalized templates, visa guides, slot booking strategies, and mock tests straight from the speakers."
                            },
                            {
                                icon: <Users size={22} />,
                                title: "Networking",
                                desc: "Join active study cohorts of peer students from India, build review teams, and plan group travel templates."
                            }
                        ].map((card, idx) => {
                            const tone = [CARD_TONES[0], CARD_TONES[2], CARD_TONES[3]][idx];
                            return (
                                <div key={idx} className="bg-[#FFF6E5] border-[3px] border-[#16130F] p-7 rounded-[14px] text-center space-y-3 shadow-[5px_5px_0_#16130F]" style={{ transform: `rotate(${[-1, 0.8, -0.6][idx]}deg)` }}>
                                    <div className="w-12 h-12 rounded-lg border-[3px] border-[#16130F] flex items-center justify-center mx-auto shadow-[2px_2px_0_#16130F]" style={{ background: tone.c, color: tone.fg }}>
                                        {card.icon}
                                    </div>
                                    <h3 className="font-urbanist text-lg font-black text-[#16130F]">{card.title}</h3>
                                    <p className="text-[#5B544A] text-[13px] leading-relaxed font-normal">
                                        {card.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Speakers: the real hosts of our events (hidden when there are none) ── */}
            {speakersList.length > 0 && (
            <section className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8 mb-20 z-10 relative">
                <div className="text-center max-w-xl mx-auto mb-10">
                    <Sticker bg="#FBD9E6" tilt={1.5} className="mb-4">Global Experts Portfolio</Sticker>
                    <DesiHeading hi="Stage pe kaun?">Meet Our Global Mentors &amp; Speakers</DesiHeading>
                    <p className="text-[#5B544A] text-xs mt-2 font-bold uppercase tracking-wider">
                        Learn from students and advisors with verified international acceptances
                    </p>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${speakersList.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3 max-w-[1000px] mx-auto'}`}>
                    {speakersList.map((sp, si) => {
                        const tone = toneFor(si);
                        return (
                        <div
                            key={sp.name}
                            className="bg-white border-[3px] border-[#16130F] rounded-[14px] overflow-hidden shadow-[5px_5px_0_#16130F] flex flex-col group relative hover:shadow-[8px_8px_0_#16130F] transition-shadow duration-200"
                        >
                            {/* Speaker image */}
                            <div className="relative aspect-[10/11] overflow-hidden border-b-[3px] border-[#16130F]" style={{ background: sp.imageBg || tone.soft }}>
                                {sp.image ? (
                                    <img
                                        src={sp.image}
                                        alt={sp.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center font-urbanist text-6xl font-black text-[#16130F]">{sp.name.charAt(0)}</div>
                                )}

                                {/* Quick tags inside image */}
                                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
                                    {sp.tags.map((tag, i) => (
                                        <span key={i} className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border-2 border-[#16130F] shadow-[2px_2px_0_#16130F]" style={{ background: tone.c, color: tone.fg }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Speaker Bio details */}
                            <div className="p-5 space-y-3 flex-grow flex flex-col justify-between text-left">
                                <div>
                                    <h4 className="font-urbanist font-black text-[#16130F] text-[17px] leading-snug group-hover:text-[#D0362E] transition-colors">{sp.name}</h4>
                                    <span className="block text-[10px] text-[#5B544A] font-extrabold uppercase mt-0.5 leading-snug">{sp.role}</span>
                                    <p className="text-[#5B544A] text-[12px] font-medium leading-relaxed mt-2.5 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                                        {sp.bio}
                                    </p>
                                </div>

                                <div className="pt-4 border-t-2 border-dashed border-[#16130F]/30 flex flex-wrap items-center justify-between gap-2 mt-3 select-none">
                                    <button
                                        onClick={() => requestCounselling(sp.name)}
                                        className="text-[10px] font-black uppercase text-[#16130F] bg-[#F2B705] border-2 border-[#16130F] rounded-md px-2.5 py-1 shadow-[2px_2px_0_#16130F] hover:shadow-[3px_3px_0_#16130F] flex items-center gap-1 cursor-pointer transition-shadow"
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
                                                className="text-[10px] font-bold text-[#5B544A] hover:text-[#D0362E] inline-flex items-center gap-1"
                                            >
                                                {key === 'linkedin' ? <LinkedinIcon size={12} /> : label}
                                            </a>
                                        ))}
                                        {sp.eventLink && (
                                            <button
                                                type="button"
                                                onClick={() => navigate(sp.eventLink)}
                                                className="text-[10px] font-bold text-[#16130F] underline decoration-2 decoration-[#D0362E] underline-offset-2 hover:text-[#D0362E] cursor-pointer"
                                            >
                                                View event
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </section>
            )}

            {/* ── FAQs Section ── */}
            <section className="max-w-[840px] mx-auto px-4 sm:px-6 mb-20">
                <div className="text-center mb-8">
                    <DesiHeading hi="Enquiry window">Frequently Asked Questions</DesiHeading>
                </div>

                <div className="space-y-4 text-left">
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
                            <div key={idx} className={`bg-white rounded-[12px] border-[3px] border-[#16130F] overflow-hidden transition-shadow duration-200 ${isOpen ? 'shadow-[5px_5px_0_#14837E]' : 'shadow-[4px_4px_0_#16130F]'}`}>
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left font-urbanist font-extrabold text-[16px] text-[#16130F] hover:bg-[#FFF6D6] transition-colors cursor-pointer"
                                >
                                    <span>{faq.q}</span>
                                    <span className={`shrink-0 w-7 h-7 rounded-md border-2 border-[#16130F] grid place-items-center transition-colors ${isOpen ? 'bg-[#F2B705]' : 'bg-white'}`}>
                                        <ChevronDown
                                            size={16}
                                            className={`text-[#16130F] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="px-4 sm:px-5 pb-5 pt-3 text-[#5B544A] text-[13px] md:text-sm border-t-2 border-dashed border-[#16130F]/30 leading-relaxed font-normal">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Closing CTA: truck-art Book OK Please ── */}
            <section className="max-w-[1240px] mx-auto px-4 sm:px-6 md:px-8">
                <BookOkCta
                    to="/book-consultation"
                    hi="Show ke baad bhi sawaal?"
                    text="Session ke baad bhi sawaal baaki hain? Free call pe senior se seedha poochho. 1:1, ek ghante ki baat."
                    cta="Book Free Counselling"
                />
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
