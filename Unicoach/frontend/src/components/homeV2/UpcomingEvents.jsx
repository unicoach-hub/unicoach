import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { useLead } from '../../context/LeadContext';
import { API_BASE_URL } from '../../config';
import { toAbsoluteUrl, toRegistrationUrl, hasEventEnded, eventPath, getSpeakerPhoto } from '../../utils/eventHelpers';
import EventRegistrationModal from '../EventRegistrationModal';
import { Sticker } from '../desi/DesiKit';

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

// Our own banners in /public/events also come as an 800px-wide copy (name-800.webp): cards are ~420px wide,
// so phones and laptops download that instead of the 1672px original
const smallBanner = (url) => {
  const m = /^(.*\/events\/[\w-]+)\.webp$/.exec(url || '');
  return m && !m[1].endsWith('-800') ? `${m[1]}-800.webp 800w, ${url} 1672w` : undefined;
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
        className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-[#16130F] bg-white"
        loading="lazy"
        width="36"
        height="36"
        onError={() => setFailed((n) => n + 1)}
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-[#14837E] text-white border-2 border-[#16130F] flex items-center justify-center font-urbanist font-black text-[13px] shrink-0">
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

  // Up to 8 events from Admin → Events, at most 2 rows across the full width:
  // 4 per row when that fills the rows (4, 7, 8 events), else 3 per row (3, 5, 6)
  const displayedEvents = events
    .filter((ev) => currentTab === 'All' || ev.category === currentTab)
    .slice(0, 8);
  const n = displayedEvents.length;
  const gridLayout = loading || n === 4 || n >= 7
    ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : n >= 3
      ? 'sm:grid-cols-2 lg:grid-cols-3'
      : n === 2
        ? 'sm:grid-cols-2 max-w-[900px] mx-auto'
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
    <section id="upcoming-events" className="pt-10 sm:pt-12 pb-10 sm:pb-12 bg-[#FFF6E5] relative overflow-hidden w-full max-w-full">

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full min-w-0">

        {/* ════════ EXPANSIVE PROFESSIONAL CENTERED HEADER ════════ */}
        <div className="text-center max-w-5xl xl:max-w-6xl mx-auto mb-6 sm:mb-7 w-full min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-urbanist font-extrabold text-[16px] leading-none text-[#D0362E]">Live sessions, seedha seniors se</p>
            <p className="mt-1.5 text-[12px] sm:text-[12.5px] font-black text-[#16130F] uppercase tracking-[0.12em]">Live admissions masterclasses</p>

            <h2 className="mt-3 font-urbanist text-[30px] sm:text-[38px] lg:text-[42px] xl:text-[46px] font-black text-[#16130F] leading-[1.08] tracking-[-0.035em]">
              Interactive Sessions with{' '}
              <span className="text-[#D0362E]">Senior Mentors &amp; Experts</span>
            </h2>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <Sticker bg="#F2B705" tilt={-3}>Muft hai bhai!</Sticker>
              <Sticker tilt={2}>Seats limited, jaldi register karo.</Sticker>
            </div>

            <p className="text-[15px] sm:text-[17px] text-[#5B544A] mt-3 font-medium leading-relaxed max-w-2xl lg:max-w-3xl mx-auto">
              Free live sessions with seniors and counsellors on shortlisting, SOPs, scholarships and visas. Ask your questions live.
            </p>
          </motion.div>

          {/* Category Filter Pills (Centered & Generously Spaced) */}
          {categories.length > 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-5"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveTab(cat)}
                  aria-pressed={currentTab === cat}
                  className={`no-shine px-4 sm:px-5 py-2 rounded-full text-[13.5px] sm:text-[14px] font-bold border-2 border-[#16130F] transition-[transform,background-color] cursor-pointer ${currentTab === cat
                    ? 'bg-[#16130F] text-white shadow-[3px_3px_0_#F2B705]'
                    : 'bg-white text-[#16130F] shadow-[3px_3px_0_#16130F] hover:bg-[#FFF1B8] hover:-translate-y-0.5'
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
          <div className="max-w-[560px] mx-auto mb-6 rounded-2xl border-[3px] border-dashed border-[#16130F] bg-white px-6 py-7 text-center">
            <p className="font-urbanist text-[19px] font-black text-[#16130F]">New events coming soon</p>
            <p className="mt-1.5 text-[15px] text-[#5B544A] leading-relaxed">
              We&apos;re lining up the next live sessions. Check back shortly.
            </p>
          </div>
        )}

        {/* ════════ GRID: up to 2 rows across the full width (phones: one swipeable row) ════════ */}
        {!noEvents && <div className={`flex overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pt-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pt-0 sm:pb-0 sm:overflow-visible sm:grid ${gridLayout} gap-4 sm:gap-6 w-full min-w-0`}>
          {loading && [0, 1, 2, 3].map((k) => (
            <div key={k} className="w-[84%] shrink-0 sm:w-auto bg-white rounded-[16px] overflow-hidden border-[3px] border-[#16130F]/25 animate-pulse" aria-hidden="true">
              <div className="aspect-[16/9] w-full bg-[#EFE7D6]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[#EFE7D6] rounded w-11/12" />
                <div className="h-4 bg-[#F5EFE2] rounded w-2/3" />
                <div className="h-11 bg-[#F5EFE2] rounded-xl" />
                <div className="h-10 bg-[#EFE7D6] rounded-full" />
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

            // Cards rise in one after another (no sideways movement, so phones never get a horizontal scrollbar)
            const initialPos = { opacity: 0, y: 36 };
            const enterDelay = Math.min(idx, 7) * 0.05;

            return (
              <motion.div
                key={ev.id || idx}
                initial="hidden"
                whileInView="shown"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                  hidden: initialPos,
                  shown: { opacity: 1, x: 0, y: 0, transition: { duration: 0.45, delay: enterDelay, ease: [0.22, 1, 0.36, 1] } },
                }}
                whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                // The rest of the card opens the event page; the CTA button keeps its own action
                onClick={ev.detailPath ? () => navigate(ev.detailPath) : undefined}
                className={`bg-white rounded-[16px] overflow-hidden border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] hover:shadow-[7px_7px_0_#DE5C2B] transition-shadow duration-200 flex flex-col group w-[84%] shrink-0 snap-start sm:w-auto sm:shrink ${ev.detailPath ? 'cursor-pointer' : ''}`}
              >
                {/* ──── TOP COMPACT 2:1 COVER IMAGE (Zero Cropping - Full Text & Expert Visible) ──── */}
                <motion.div
                  className="relative aspect-[16/9] w-full overflow-hidden bg-[#16130F] border-b-[3px] border-[#16130F]"
                  // Follows the card's own in-view trigger (a fully clipped element is never "in view" by itself)
                  variants={{
                    hidden: { clipPath: 'inset(0 0 100% 0)' },
                    shown: { clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.5, delay: enterDelay + 0.08, ease: [0.65, 0, 0.35, 1] } },
                  }}
                >
                  <motion.img
                    src={eventImg}
                    srcSet={smallBanner(eventImg)}
                    sizes="(min-width: 1024px) 420px, 92vw"
                    alt={ev.title}
                    variants={{
                      hidden: { scale: 1.18 },
                      shown: { scale: 1, transition: { duration: 0.8, delay: enterDelay + 0.08, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="w-full h-full object-cover object-center group-hover:!scale-[1.05] transition-transform duration-700 ease-out"
                    onError={(e) => {
                      // a banner without its -800 copy (or a broken link) falls back to the plain original, then the default
                      if (e.target.srcset) { e.target.removeAttribute('srcset'); return; }
                      e.target.src = '/events/global.webp';
                    }}
                  />

                  {/* Bottom strip: date on the left, category on the right.
                      (The category used to sit top-right, right on top of the expert's face in the banner.) */}
                  <motion.div
                    className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10"
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      shown: { opacity: 1, y: 0, transition: { duration: 0.3, delay: enterDelay + 0.35, ease: 'easeOut' } },
                    }}
                  >
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white text-[11.5px] font-bold text-[#16130F] border-2 border-[#16130F] min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-[#D0362E] shrink-0" />
                      <span className="truncate">{ev.date} • {ev.time}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] text-[10.5px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap">
                      {ev.badge || 'Masterclass'}
                    </span>
                  </motion.div>
                </motion.div>

                {/* ──── BOTTOM COMPACT CONTENT BODY ──── */}
                <div className="p-4 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    {/* Title */}
                    <h3 className="font-urbanist text-[16px] font-extrabold text-[#16130F] leading-snug group-hover:text-[#D0362E] transition-colors mb-3 line-clamp-2 min-h-[42px]" title={ev.title}>
                      {ev.detailPath ? (
                        <Link to={ev.detailPath} onClick={(e) => e.stopPropagation()} className="focus-visible:outline-none focus-visible:underline">
                          {ev.title}
                        </Link>
                      ) : ev.title}
                    </h3>

                    {/* Speaker with Avatar (only when Admin → Events names one) */}
                    {speakerName && (
                      <div className="flex items-center gap-2.5 mb-3 p-2 rounded-xl bg-[#FFF6E5] border-2 border-[#16130F]">
                        <SpeakerAvatar key={speakerPhotos.join('|')} photos={speakerPhotos} name={speakerName} />
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-bold text-[#16130F] truncate">
                            {speakerName}
                          </p>
                          {speakerRole && (
                            <p className="text-[12px] text-[#5B544A] font-medium truncate">
                              {speakerRole}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Registered Count & Live Indicator */}
                    <div className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-[#FFF1B8] border-2 border-dashed border-[#16130F]/40 mb-4 text-[12.5px]">
                      <span className="font-bold text-[#16130F] flex items-center gap-1.5 min-w-0">
                        <Users className="w-3.5 h-3.5 text-[#D0362E] shrink-0" />
                        {ev.attendees || (ev.isPast ? 'Session completed' : 'Limited seats')}
                      </span>
                      {ev.isPast ? (
                        <span className="text-[#5B544A] font-bold flex items-center gap-1 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-[#5B544A]" />
                          Ended
                        </span>
                      ) : (
                        <span className="text-[#14837E] font-bold flex items-center gap-1 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-[#14837E] animate-pulse" />
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
                        className="w-full min-h-11 flex items-center justify-center py-2.5 px-4 rounded-full bg-[#EFE7D6] border-2 border-[#16130F]/30 text-[#5B544A] text-[14px] font-bold cursor-not-allowed"
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
                        className="w-full min-h-11 flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#16130F] text-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#DE5C2B] text-[14px] font-bold transition-[transform,box-shadow] duration-200 cursor-pointer group/btn"
                      >
                        <span className="truncate">{ev.ctaLabel || 'Claim Free VIP Seat'}</span>
                        <span className="w-6 h-6 rounded-full bg-[#F2B705] text-[#16130F] flex items-center justify-center transition-transform group-hover/btn:translate-x-0.5 shrink-0">
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      </button>
                    )}
                    {ev.detailPath && (
                      <Link
                        to={ev.detailPath}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 flex items-center justify-center gap-1 text-[13.5px] font-bold text-[#16130F] underline decoration-[#D0362E] decoration-2 underline-offset-4 hover:text-[#D0362E] transition-colors"
                      >
                        View details
                        <ArrowRight className="w-3.5 h-3.5" />
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
