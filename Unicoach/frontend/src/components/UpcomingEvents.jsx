import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { useLead } from '../context/LeadContext';
import { API_BASE_URL } from '../config';
import { toAbsoluteUrl, toRegistrationUrl, hasEventEnded, eventPath, getSpeakerPhoto } from '../utils/eventHelpers';
import EventRegistrationModal from './EventRegistrationModal';

// Keys are the card's country codes; the Admin → Events "Country" values match them uppercased
const COUNTRY_MAP = {
  USA: { name: 'United States', flag: 'https://flagcdn.com/w40/us.png', image: '/events/usa.webp' },
  GER: { name: 'Germany', flag: 'https://flagcdn.com/w40/de.png', image: '/events/germany.webp' },
  GERMANY: { name: 'Germany', flag: 'https://flagcdn.com/w40/de.png', image: '/events/germany.webp' },
  CAN: { name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png', image: '/events/global.webp' },
  CANADA: { name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png', image: '/events/global.webp' },
  AUS: { name: 'Australia', flag: 'https://flagcdn.com/w40/au.png', image: '/events/australia.webp?v=5' },
  AUSTRALIA: { name: 'Australia', flag: 'https://flagcdn.com/w40/au.png', image: '/events/australia.webp?v=5' },
  IRE: { name: 'Ireland', flag: 'https://flagcdn.com/w40/ie.png', image: '/events/cyber-security-ireland.webp?v=5' },
  IRELAND: { name: 'Ireland', flag: 'https://flagcdn.com/w40/ie.png', image: '/events/cyber-security-ireland.webp?v=5' },
  UK: { name: 'United Kingdom', flag: 'https://flagcdn.com/w40/gb.png', image: '/events/uk.webp?v=5' },
  FRANCE: { name: 'France', flag: 'https://flagcdn.com/w40/fr.png', image: '/events/global.webp' },
  NETHERLANDS: { name: 'Netherlands', flag: 'https://flagcdn.com/w40/nl.png', image: '/events/global.webp' },
  ITALY: { name: 'Italy', flag: 'https://flagcdn.com/w40/it.png', image: '/events/global.webp' },
  'NEW ZEALAND': { name: 'New Zealand', flag: 'https://flagcdn.com/w40/nz.png', image: '/events/global.webp' },
  SINGAPORE: { name: 'Singapore', flag: 'https://flagcdn.com/w40/sg.png', image: '/events/global.webp' },
  DUBAI: { name: 'Dubai', flag: 'https://flagcdn.com/w40/ae.png', image: '/events/global.webp' },
  EUROPE: { name: 'Europe', flag: 'https://flagcdn.com/w40/eu.png', image: '/events/europe-scholarships.webp' },
  GLOBAL: { name: 'Global', flag: 'https://flagcdn.com/w40/un.png', image: '/events/global.webp' },
};

// Filter pills in display order; a pill only shows when at least one card has that country
const TAB_ORDER = ['UK', 'USA', 'GERMANY', 'CANADA', 'AUSTRALIA', 'IRELAND', 'FRANCE', 'NETHERLANDS', 'ITALY', 'NEW ZEALAND', 'SINGAPORE', 'DUBAI', 'EUROPE'];

// Used only when no country is set in Admin → Events. Whole words only, so "Campus" is not the US,
// "Ukraine" is not the UK and "maps" is not APS. A country or city named in the title wins; the topic
// hints kept for older events (cyber → Ireland, jobs → UK, ...) only apply when no place is named.
const TITLE_PLACES = [
  ['IRELAND', /\b(ireland|irish|dublin)\b/i],
  ['UK', /\b(uk|united kingdom|britain|british|london)\b/i],
  ['GERMANY', /\b(germany|german)\b/i],
  ['USA', /\b(usa|america|american)\b/i],
  ['USA', /\bU\.?S\b/], // capitals only: "join us" is not the US
  ['CANADA', /\b(canada|canadian|toronto)\b/i],
  ['AUSTRALIA', /\b(australia|australian|sydney|melbourne)\b/i],
  ['EUROPE', /\b(europe|european|schengen)\b/i], // after the single countries, so "Germany" still wins
];
const TITLE_TOPICS = [
  ['IRELAND', /\bcyber/i],
  ['UK', /\bjobs?\b/i],
  ['GERMANY', /\broi\b/i],
  ['GERMANY', /\bAPS\b/],
  ['USA', /\bstem\b/i],
  ['CANADA', /\bpgwp\b/i],
];
const guessCategoryFromTitle = (title = '') => {
  const text = String(title || '');
  const hit = TITLE_PLACES.find(([, re]) => re.test(text)) || TITLE_TOPICS.find(([, re]) => re.test(text));
  return hit ? hit[0] : 'GLOBAL';
};

const BADGE_MAP = {
  webinar: 'Masterclass',
  fair: 'Virtual Expo',
  other: 'Admit Session',
};

// Turns an event from GET /api/events into a card. Title and speaker are shown exactly as set in
// Admin → Events; the only fallbacks are the country guess (and its banner when no cover is set),
// the role in brackets and the photo by first name.
const formatBackendEvent = (ev, index) => {
  const startDate = ev.eventStart ? new Date(ev.eventStart) : null;
  const startStr = startDate
    ? startDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()
    : 'DATE TBA';

  let timeStr = 'Time TBA';
  if (startDate) {
    timeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (ev.eventEnd) {
      timeStr += ' - ' + new Date(ev.eventEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  }

  // Country: the Admin → Events dropdown wins; otherwise guess from the title
  const adminCountry = typeof ev.country === 'string' ? ev.country.trim().toUpperCase() : '';
  const category = COUNTRY_MAP[adminCountry] ? adminCountry : guessCategoryFromTitle(ev.title);
  const meta = COUNTRY_MAP[category] || COUNTRY_MAP.GLOBAL;

  // The event's own banner (set in admin) always wins; country photo is only a fallback
  let eventImg = toAbsoluteUrl(ev.imageUrl || ev.image);
  if (!eventImg || eventImg.includes('masterclass_')) {
    eventImg = meta.image;
  }

  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const eventTitle = text(ev.title);

  return {
    id: ev._id || `backend-ev-${index}`,
    country: category,
    countryName: meta.name,
    flag: meta.flag,
    image: eventImg,
    badge: BADGE_MAP[ev.category] || 'Masterclass',
    // Real sign-ups only (registrationCount is kept by POST /events/:id/register)
    attendees: ev.registrationCount > 0 ? `${ev.registrationCount} Registered` : null,
    date: startStr,
    time: timeStr,
    title: eventTitle,
    // Empty = no speaker row on the card (never a made-up name)
    speaker: text(ev.speaker),
    speakerRole: text(ev.speakerRole),
    speakerPhoto: text(ev.speakerPhoto) ? toAbsoluteUrl(text(ev.speakerPhoto)) : '',
    ctaLabel: text(ev.ctaLabel),
    category,
    registrationLink: ev.registrationLink || '',
    homepageOrder: typeof ev.homepageOrder === 'number' && Number.isFinite(ev.homepageOrder) ? ev.homepageOrder : null,
    startTs: startDate ? startDate.getTime() : 0,
    // Ended events keep their card but can no longer be registered for
    isPast: hasEventEnded(ev),
    // The event's own page (/events/:slug); '' when the event has neither slug nor id
    detailPath: eventPath(ev),
    // What the on-site registration modal needs
    registration: { _id: ev._id, slug: ev.slug, title: eventTitle, eventStart: ev.eventStart, eventEnd: ev.eventEnd, location: ev.location },
  };
};

// Admin photo → known speaker photo by first name → initial
const SpeakerAvatar = ({ photos, name }) => {
  const [failed, setFailed] = useState(0);
  const src = photos[failed];
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Speaker'}
        className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
        loading="lazy"
        width="32"
        height="32"
        onError={() => setFailed((n) => n + 1)}
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
      {name?.charAt(0) || 'U'}
    </div>
  );
};

export const UpcomingEvents = ({ onOpenModal }) => {
  const { openEligibilityModal } = useLead();
  const navigate = useNavigate();
  const handleOpen = onOpenModal || ((title) => openEligibilityModal(`Event: ${title || 'Masterclass'}`));

  const [activeTab, setActiveTab] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  // Real event without a registration link: registered right here on the homepage
  const [registrationEvent, setRegistrationEvent] = useState(null);

  // ── Fetch and format events from Backend API ──
  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      try {
        // Retry twice: the API host can be waking up or redeploying on the first request
        let res;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            res = await fetch(`${API_BASE_URL}/events`);
            if (res.ok) break;
          } catch (networkErr) {
            res = null;
            if (attempt === 2) throw networkErr;
          }
          if (cancelled) return;
          if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 4000 * (attempt + 1)));
        }
        if (!res || !res.ok) throw new Error(`HTTP ${res ? res.status : 'network error'}`);
        const data = await res.json();
        if (cancelled) return;

        // Admin → Events "Show on homepage" switch (missing = shown)
        const formatted = (Array.isArray(data) ? data : [])
          .filter((ev) => ev && ev.showOnHomepage !== false)
          .map(formatBackendEvent);

        // Events with a homepage position come first (1 = first card); the rest: not yet ended
        // soonest first (undated ones after dated ones), then ended ones most recent first
        const openKey = (ev) => ev.startTs || Number.MAX_SAFE_INTEGER;
        formatted.sort((a, b) => {
          const aPinned = a.homepageOrder !== null;
          const bPinned = b.homepageOrder !== null;
          if (aPinned !== bPinned) return aPinned ? -1 : 1;
          if (aPinned && a.homepageOrder !== b.homepageOrder) return a.homepageOrder - b.homepageOrder;
          if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
          return a.isPast ? b.startTs - a.startTs : openKey(a) - openKey(b);
        });

        // Empty (none published / all switched off for the homepage) shows the "coming soon" note
        setEvents(formatted);
      } catch (err) {
        // No made-up sample cards: an unreachable API also shows the "coming soon" note
        console.warn('Could not load events:', err);
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvents();
    return () => { cancelled = true; };
  }, []);

  const noEvents = !loading && events.length === 0;
  const categories = ['All', ...TAB_ORDER.filter((cat) => events.some((ev) => ev.category === cat))];
  const currentTab = categories.includes(activeTab) ? activeTab : 'All';

  // Up to 6 cards in a 3-column grid: 2 rows of 3 when there are 6, all from Admin → Events
  const displayedEvents = events
    .filter((ev) => currentTab === 'All' || ev.category === currentTab)
    .slice(0, 6);

  const gridLayout = loading || displayedEvents.length >= 4
    ? 'sm:grid-cols-2 lg:grid-cols-3'
    : displayedEvents.length === 3
      ? 'md:grid-cols-2 lg:grid-cols-3'
    : displayedEvents.length === 2
      ? 'md:grid-cols-2 max-w-[900px] mx-auto'
      : 'max-w-[440px] mx-auto';

  const handleCta = (ev) => {
    // Ended events show "Event ended" instead of a button; never register for one
    if (ev.isPast) return;
    // 1. A registration link set in Admin → Events wins
    const link = toRegistrationUrl(ev.registrationLink);
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    // 2. No link: register on the spot (lands in Admin → Requests → Event Registration)
    } else if (ev.registration._id || ev.registration.slug) {
      setRegistrationEvent(ev.registration);
    // 3. Safety net for an event without an id or slug: general enquiry form
    } else {
      handleOpen(ev.title);
    }
  };

  return (
    <section id="upcoming-events" className="pt-0 sm:pt-1 pb-3 sm:pb-4 bg-[#FAF9F6] relative overflow-hidden w-full max-w-full border-b border-orange-100/60">

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full min-w-0">

        {/* ════════ EXPANSIVE PROFESSIONAL CENTERED HEADER ════════ */}
        <div className="text-center max-w-4xl xl:max-w-5xl mx-auto mb-10 sm:mb-12 w-full min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-orange-200/90 shadow-2xs mb-3.5">
              <span className="w-2 h-2 rounded-full bg-[#DE5C2B] animate-pulse" />
              <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-800 tracking-wider uppercase">
                LIVE ADMISSIONS MASTERCLASSES
              </span>
            </div>

            <h2 className="font-outfit text-[32px] sm:text-[42px] lg:text-[48px] xl:text-[52px] font-black text-[#111111] leading-[1.12] tracking-[-0.03em]">
              Interactive Sessions with{' '}
              <span className="relative inline-block text-[#DE5C2B]">
                Ivy Mentors &amp; Experts
                <span className="absolute -bottom-1.5 left-0 w-full h-[7px] bg-[#FED7CE] rounded-full -z-10" />
              </span>
            </h2>

            <p className="text-[14px] sm:text-[16px] text-slate-600 mt-3 font-normal leading-relaxed max-w-2xl lg:max-w-3xl mx-auto">
              Learn insider admissions strategies, profile evaluation hacks, and visa prep directly from top alumni.
            </p>
          </motion.div>

          {/* Category Filter Pills (Centered & Generously Spaced) */}
          {categories.length > 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-6 sm:mt-7"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveTab(cat)}
                  aria-pressed={currentTab === cat}
                  className={`px-4.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer ${currentTab === cat
                    ? 'bg-[#111111] text-white shadow-md shadow-black/10 scale-[1.02]'
                    : 'bg-white hover:bg-orange-50/80 text-slate-600 hover:text-slate-900 border border-slate-200/90 hover:border-orange-300 shadow-2xs'
                    }`}
                >
                  {cat === 'All' ? 'All' : cat}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* No published homepage events (or the API is down): an honest note instead of cards */}
        {noEvents && (
          <div className="max-w-[560px] mx-auto mb-6 rounded-2xl border border-dashed border-orange-200 bg-white/80 px-6 py-7 text-center">
            <p className="font-outfit text-[17px] font-bold text-[#111111]">New events coming soon</p>
            <p className="mt-1.5 text-[13.5px] text-slate-600 leading-relaxed">
              We&apos;re lining up the next live sessions. Check back shortly.
            </p>
          </div>
        )}

        {/* ════════ 3-CARD COMPACT BALANCED GRID (Overflow Safe) ════════ */}
        {!noEvents && <div className={`grid grid-cols-1 ${gridLayout} gap-4 w-full min-w-0`}>
          {loading && [0, 1, 2].map((k) => (
            <div key={k} className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 animate-pulse" aria-hidden="true">
              <div className="aspect-[16/9] w-full bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-11/12" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-11 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}

          {!loading && displayedEvents.map((ev, idx) => {
            const countryMeta = COUNTRY_MAP[ev.country] || COUNTRY_MAP[ev.category] || COUNTRY_MAP.GLOBAL;
            const eventImg = ev.image || countryMeta.image || '/events/global.webp';

            // Speaker as set in Admin → Events: role from the Role field, else the text in brackets;
            // photo from the Photo field, else the known photo for that first name, else the initial
            const speakerName = ev.speaker.split('(')[0].trim();
            const speakerRole = ev.speakerRole || ev.speaker.match(/\((.*?)\)/)?.[1]?.trim() || '';
            const speakerPhotos = [ev.speakerPhoto, getSpeakerPhoto(ev.speaker)].filter(Boolean);

            // Safe vertical entrance to prevent mobile horizontal scrollbar expansion
            const initialPos = { opacity: 0, y: 30 };

            return (
              <motion.div
                key={ev.id || idx}
                initial={initialPos}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                // The rest of the card opens the event page; the CTA button keeps its own action
                onClick={ev.detailPath ? () => navigate(ev.detailPath) : undefined}
                className={`bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-[0_3px_14px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_32px_-4px_rgba(15,23,42,0.12)] hover:border-orange-300 transition-all duration-300 flex flex-col group w-full ${ev.detailPath ? 'cursor-pointer' : ''}`}
              >
                {/* ──── TOP COMPACT 2:1 COVER IMAGE (Zero Cropping - Full Text & Expert Visible) ──── */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 border-b border-slate-100">
                  <img
                    src={eventImg}
                    alt={ev.title}
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      e.target.src = '/events/global.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Top Flag & Category Badges */}
                  {/* Centered Country Badge (leaves top-left clear so UniCoach graphic in banner is fully visible) */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-md whitespace-nowrap pointer-events-auto">
                      {ev.flag && (typeof ev.flag === 'string' && (ev.flag.startsWith('http') || ev.flag.startsWith('/'))) ? (
                        <img
                          src={ev.flag}
                          alt={ev.countryName}
                          className="w-4 h-2.5 object-cover rounded-[2px] shadow-2xs shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-[11px]">{ev.flag || '🌍'}</span>
                      )}
                      <span className="tracking-tight">{ev.countryName}</span>
                    </div>
                  </div>

                  {/* Bottom strip: date on the left, category on the right.
                      (The category used to sit top-right, right on top of the expert's face in the banner.) */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 text-white z-10">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md text-[10px] font-semibold text-white/95 border border-white/15 shadow-sm min-w-0">
                      <Calendar className="w-3 h-3 text-[#FED7CE] shrink-0" />
                      <span className="truncate">{ev.date} • {ev.time}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#DE5C2B] text-white text-[9px] font-extrabold uppercase tracking-wider shadow-sm shrink-0 whitespace-nowrap">
                      {ev.badge || 'Masterclass'}
                    </span>
                  </div>
                </div>

                {/* ──── BOTTOM COMPACT CONTENT BODY ──── */}
                <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    {/* Title */}
                    <h3 className="font-outfit text-[14px] font-bold text-[#111111] leading-snug group-hover:text-[#DE5C2B] transition-colors mb-2 line-clamp-2 min-h-[38px]" title={ev.title}>
                      {ev.detailPath ? (
                        <Link to={ev.detailPath} onClick={(e) => e.stopPropagation()} className="focus-visible:outline-none focus-visible:underline">
                          {ev.title}
                        </Link>
                      ) : ev.title}
                    </h3>

                    {/* Speaker with Avatar (only when Admin → Events names one) */}
                    {speakerName && (
                      <div className="flex items-center gap-2.5 mb-2.5 p-2 rounded-xl bg-orange-50/40 border border-orange-100/70">
                        <SpeakerAvatar key={speakerPhotos.join('|')} photos={speakerPhotos} name={speakerName} />
                        <div className="min-w-0">
                          <p className="text-[11.5px] font-bold text-[#111111] truncate">
                            {speakerName}
                          </p>
                          {speakerRole && (
                            <p className="text-[10px] text-slate-500 font-medium truncate">
                              {speakerRole}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Registered Count & Live Indicator */}
                    <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-50 border border-slate-200/80 mb-3 text-[11px]">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-[#DE5C2B]" />
                        {ev.attendees || (ev.isPast ? 'Session completed' : 'Limited seats')}
                      </span>
                      {ev.isPast ? (
                        <span className="text-slate-500 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Ended
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Free VIP Pass
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Register For Free Button - Matching Image 1 Black Pill (an ended event shows a muted, inactive pill) */}
                  <div>
                    {ev.isPast ? (
                      <button
                        type="button"
                        disabled
                        className="w-full min-h-11 flex items-center justify-center py-2.5 px-4 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[13px] font-bold cursor-not-allowed"
                      >
                        Event ended
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCta(ev);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#111111] hover:bg-[#DE5C2B] text-white text-[12.5px] font-bold shadow-xs hover:shadow-md hover:shadow-orange-500/20 transition-all duration-200 cursor-pointer group/btn"
                      >
                        <span className="truncate">{ev.ctaLabel || 'Claim Free VIP Seat'}</span>
                        <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover/btn:translate-x-0.5 shrink-0">
                          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                        </span>
                      </button>
                    )}
                    {ev.detailPath && (
                      <Link
                        to={ev.detailPath}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 flex items-center justify-center gap-1 text-[12px] font-bold text-slate-600 hover:text-[#DE5C2B] transition-colors"
                      >
                        View details
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                </div>

              </motion.div>
            );
          })}
        </div>}

      </div>

      <EventRegistrationModal
        event={registrationEvent}
        open={Boolean(registrationEvent)}
        onClose={() => setRegistrationEvent(null)}
      />
    </section>
  );
};

export default UpcomingEvents;
