import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, Tag, ArrowLeft, ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import PageLoader from '../../../components/PageLoader';
import EventRegistrationModal from '../../../components/EventRegistrationModal';
import { API_BASE_URL, SITE_URL } from '../../../config';
import { toAbsoluteUrl, toRegistrationUrl, hasEventEnded, eventPath, getSpeakerPhoto } from '../../../utils/eventHelpers';
import { socialLinksOf } from '../../../utils/socialLinks';
import SocialIcon from '../../../components/ui/SocialIcon';

const CATEGORY_LABELS = { webinar: 'Webinar', fair: 'Virtual Fair', other: 'Live Session' };
const IST = 'Asia/Kolkata';

const text = (value) => (typeof value === 'string' ? value.trim() : '');

// Admin HTML (event body, rich section text) shown as plain text: parsed in an inert document
// (no scripts run, nothing loads), block ends become line breaks, then only the text is kept.
const htmlToText = (html) => {
  const value = text(html);
  if (!value) return '';
  if (typeof DOMParser === 'undefined') return value.replace(/<[^>]*>/g, ' ').replace(/[ \t]+/g, ' ').trim();
  const doc = new DOMParser().parseFromString(value, 'text/html');
  doc.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  doc.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, tr, blockquote').forEach((el) => el.append('\n'));
  return (doc.body.textContent || '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();
};

const paragraphsOf = (value) => htmlToText(value).split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean);

// Image blocks: only http(s) or site paths
const safeImageSrc = (url) => {
  const value = text(url);
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return toAbsoluteUrl(value);
  return '';
};

// "Sat, 17 Oct 2026" and "7:00 PM – 8:00 PM IST": events are announced in Indian time
const formatIstDate = (date) => new Date(date).toLocaleDateString('en-IN', { timeZone: IST, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const formatIstTime = (date) => new Date(date).toLocaleTimeString('en-IN', { timeZone: IST, hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
const isValidDate = (date) => Boolean(date) && Number.isFinite(new Date(date).getTime());

const isOnline = (location) => /online|zoom|virtual|webinar|google meet|teams|youtube|live stream/i.test(location || '');

// Host cards without personal links yet show UniCoach's official profiles
const PLACEHOLDER_SOCIALS = [
  ['linkedin', 'UniCoach on LinkedIn', 'https://www.linkedin.com/company/unicoachglobal/'],
  ['instagram', 'UniCoach on Instagram', 'https://www.instagram.com/unicoachglobal/'],
];
const roundIcon = 'w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-[#DE5C2B] hover:border-orange-300 flex items-center justify-center transition-colors';

// Live "Starts in 3d 4h 12m" (refreshes every 30 s), "Happening now" or "Event ended"
const useNow = (intervalMs) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};

const Countdown = ({ start, end }) => {
  const now = useNow(30000);
  const startTs = isValidDate(start) ? new Date(start).getTime() : NaN;
  const endTs = isValidDate(end) ? new Date(end).getTime() : startTs;

  if (!Number.isFinite(startTs)) return null;
  if (now >= endTs && now >= startTs) {
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[12px] font-bold text-slate-600">Event ended</span>;
  }
  if (now >= startTs) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[12px] font-bold text-emerald-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Happening now
      </span>
    );
  }
  const mins = Math.max(0, Math.floor((startTs - now) / 60000));
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-[12px] font-bold text-[#B9461C] tabular-nums">
      <Clock size={13} aria-hidden="true" />
      Starts in {d}d {h}h {m}m
    </span>
  );
};

const HostAvatar = ({ photos, name }) => {
  const [failed, setFailed] = useState(0);
  const src = photos[failed];
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width="96"
        height="96"
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 ring-4 ring-orange-50"
        onError={() => setFailed((n) => n + 1)}
      />
    );
  }
  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#111111] text-white flex items-center justify-center text-2xl font-black shrink-0">
      {name.charAt(0) || 'U'}
    </div>
  );
};

// One section block from Admin → Events, as plain text (headings, paragraphs, images, FAQs)
const SectionBlock = ({ section }) => {
  if (!section || typeof section !== 'object') return null;
  switch (section.type) {
    case 'heading': {
      const content = htmlToText(section.content);
      return content ? <h3 className="font-outfit text-lg sm:text-xl font-bold text-slate-900 pt-2">{content}</h3> : null;
    }
    case 'paragraph':
      return paragraphsOf(section.content).map((p, i) => (
        <p key={i} className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-line">{p}</p>
      ));
    case 'image': {
      const src = safeImageSrc(section.url);
      if (!src) return null;
      const caption = htmlToText(section.caption);
      return (
        <figure className="my-2">
          <img src={src} alt={caption || 'Event image'} loading="lazy" className="w-full rounded-2xl border border-slate-200" />
          {caption && <figcaption className="mt-2 text-xs text-slate-500 text-center">{caption}</figcaption>}
        </figure>
      );
    }
    case 'faq': {
      const question = htmlToText(section.question);
      if (!question) return null;
      return (
        <details className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <summary className="cursor-pointer font-bold text-slate-900 text-[15px]">{question}</summary>
          <p className="mt-2 text-[14px] text-slate-700 leading-relaxed whitespace-pre-line">{htmlToText(section.answer)}</p>
        </details>
      );
    }
    default:
      return null;
  }
};

const setMetaTag = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const EventDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setLoadError(false);
      try {
        const res = await fetch(`${API_BASE_URL}/events/${encodeURIComponent(slug || '')}`);
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
          setEvent(null);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setEvent(data);
      } catch (err) {
        console.warn('Could not load event:', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  // SEO: the page's own title, description and canonical (by slug, even when opened by id).
  // Runs after ScrollToTop has set the route defaults, because it waits for the event to load.
  useEffect(() => {
    if (!event) return;
    const title = text(event.metaTitle) || `${text(event.title)} | UniCoach Events`;
    const description = (text(event.metaDescription) || text(event.description) || htmlToText(event.body)).slice(0, 160);
    document.title = title;
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    const image = toAbsoluteUrl(text(event.imageUrl));
    if (image) setMetaTag('property', 'og:image', image.startsWith('/') ? `${SITE_URL}${image}` : image);
    const canonicalPath = eventPath(event);
    if (canonicalPath) {
      const canonicalUrl = `${SITE_URL}${canonicalPath}`;
      const link = document.head.querySelector('link[rel="canonical"]');
      if (link) link.setAttribute('href', canonicalUrl);
      setMetaTag('property', 'og:url', canonicalUrl);
    }
  }, [event]);

  if (loading) return <PageLoader />;

  if (notFound || loadError || !event) {
    return (
      <main className="min-h-[70vh] bg-[#FAF9F6] flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h1 className="font-outfit text-2xl font-black text-slate-900">
            {notFound ? 'Event not found' : 'Could not load this event'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {notFound
              ? 'This event may have been removed or is not published yet.'
              : 'Please check your connection and try again.'}
          </p>
          <Link to="/events" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111111] hover:bg-[#DE5C2B] px-5 py-2.5 text-sm font-bold text-white transition-colors">
            <ArrowLeft size={15} aria-hidden="true" />
            See all events
          </Link>
        </div>
      </main>
    );
  }

  const title = text(event.title);
  const isPast = hasEventEnded(event);
  const hasStart = isValidDate(event.eventStart);
  const hasEnd = isValidDate(event.eventEnd);
  const dateLabel = hasStart ? formatIstDate(event.eventStart) : 'Date to be announced';
  const timeLabel = hasStart
    ? `${formatIstTime(event.eventStart)}${hasEnd ? ` – ${formatIstTime(event.eventEnd)}` : ''} IST`
    : 'Time to be announced';
  const location = text(event.location);
  const online = isOnline(location);
  const categoryLabel = CATEGORY_LABELS[event.category] || 'Live Session';
  const banner = toAbsoluteUrl(text(event.imageUrl)) || '/events_hero.webp';

  const summary = text(event.description);
  const sections = Array.isArray(event.sections) ? event.sections.filter((s) => s && typeof s === 'object') : [];
  const bodyParagraphs = sections.length === 0 ? paragraphsOf(event.body) : [];
  const audience = (Array.isArray(event.whoShouldAttend) ? event.whoShouldAttend : []).map(text).filter(Boolean);

  // Host: name before the brackets; role from Admin's Role field, else the text in brackets
  const speaker = text(event.speaker);
  const hostName = speaker.split('(')[0].trim();
  const hostRole = text(event.speakerRole) || speaker.match(/\((.*?)\)/)?.[1]?.trim() || '';
  const hostPhotos = [text(event.speakerPhoto) ? toAbsoluteUrl(text(event.speakerPhoto)) : '', getSpeakerPhoto(speaker)].filter(Boolean);
  const hostBio = text(event.speakerBio);
  const socialLinks = socialLinksOf(event.speakerLinks);

  const registered = event.registrationCount > 0 ? `${event.registrationCount} registered` : '';
  const ctaLabel = text(event.ctaLabel) || 'Register for free';

  const handleRegister = () => {
    if (isPast) return;
    const link = toRegistrationUrl(event.registrationLink);
    if (link) {
      if (link.startsWith('/')) navigate(link);
      else window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      setRegistering(true);
    }
  };

  const registerCard = (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)]">
      <div className="mb-4"><Countdown start={event.eventStart} end={event.eventEnd} /></div>
      <ul className="space-y-3 text-[14px] text-slate-700">
        <li className="flex items-start gap-2.5">
          <Calendar size={17} className="text-[#DE5C2B] mt-0.5 shrink-0" aria-hidden="true" />
          <span className="font-semibold">{dateLabel}</span>
        </li>
        <li className="flex items-start gap-2.5">
          <Clock size={17} className="text-[#DE5C2B] mt-0.5 shrink-0" aria-hidden="true" />
          <span className="font-semibold">{timeLabel}</span>
        </li>
        <li className="flex items-start gap-2.5">
          {online
            ? <Video size={17} className="text-[#DE5C2B] mt-0.5 shrink-0" aria-hidden="true" />
            : <MapPin size={17} className="text-[#DE5C2B] mt-0.5 shrink-0" aria-hidden="true" />}
          <span className="font-semibold">
            {online ? 'Online' : 'In person'}
            {location && <span className="block text-[13px] font-medium text-slate-500">{location}</span>}
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Tag size={17} className="text-[#DE5C2B] mt-0.5 shrink-0" aria-hidden="true" />
          <span className="font-semibold">{categoryLabel}</span>
        </li>
        {registered && (
          <li className="flex items-start gap-2.5">
            <Users size={17} className="text-[#DE5C2B] mt-0.5 shrink-0" aria-hidden="true" />
            <span className="font-semibold">{registered}</span>
          </li>
        )}
      </ul>
      {isPast ? (
        <p className="mt-5 rounded-2xl bg-slate-100 border border-slate-200 px-4 py-3 text-center text-[13px] font-bold text-slate-600">
          This event has ended
        </p>
      ) : (
        <button
          type="button"
          onClick={handleRegister}
          className="mt-5 w-full min-h-12 flex items-center justify-center gap-2 rounded-full bg-[#111111] hover:bg-[#DE5C2B] px-5 py-3 text-[14px] font-bold text-white shadow-sm transition-colors cursor-pointer"
        >
          {ctaLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}
      {!isPast && <p className="mt-2.5 text-center text-[12px] text-slate-500">Free to attend · Live Q&amp;A</p>}
    </div>
  );

  return (
    <main className="bg-[#FAF9F6] min-h-screen pt-24 sm:pt-28 pb-16">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/events" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-600 hover:text-[#DE5C2B] transition-colors mb-5">
          <ArrowLeft size={15} aria-hidden="true" />
          All events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 lg:gap-10 items-start">
          <div className="min-w-0">
            {/* Banner (event covers are 2:1, so the whole artwork stays visible) */}
            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 mb-6">
              <img
                src={banner}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/events/global.webp'; }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-[#DE5C2B] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">{categoryLabel}</span>
              <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {online ? 'Online' : 'In person'}
              </span>
            </div>
            <h1 className="font-outfit text-[28px] sm:text-[36px] lg:text-[42px] font-black text-[#111111] leading-[1.15] tracking-[-0.02em]">
              {title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5"><Calendar size={15} aria-hidden="true" />{dateLabel}</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={15} aria-hidden="true" />{timeLabel}</span>
            </p>

            {/* Register card sits right under the title on phones, in the sidebar on desktop */}
            <div className="mt-6 lg:hidden">{registerCard}</div>

            {/* About the event */}
            {(summary || sections.length > 0 || bodyParagraphs.length > 0) && (
              <section className="mt-8 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7" aria-labelledby="about-event">
                <h2 id="about-event" className="font-outfit text-xl sm:text-2xl font-black text-slate-900 mb-4">About the event</h2>
                <div className="space-y-4">
                  {summary && <p className="text-[15px] text-slate-800 font-medium leading-relaxed whitespace-pre-line">{summary}</p>}
                  {sections.map((section, i) => <SectionBlock key={i} section={section} />)}
                  {bodyParagraphs.map((p, i) => (
                    <p key={`b${i}`} className="text-[15px] text-slate-700 leading-relaxed">{p}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Who should attend */}
            {audience.length > 0 && (
              <section className="mt-6 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7" aria-labelledby="who-should-attend">
                <h2 id="who-should-attend" className="font-outfit text-xl sm:text-2xl font-black text-slate-900 mb-4">Who should attend</h2>
                <ul className="space-y-2.5">
                  {audience.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[15px] text-slate-700">
                      <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Host */}
            {hostName && (
              <section className="mt-6 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7" aria-labelledby="event-host">
                <h2 id="event-host" className="font-outfit text-xl sm:text-2xl font-black text-slate-900 mb-5">Your host</h2>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  <HostAvatar key={hostPhotos.join('|')} photos={hostPhotos} name={hostName} />
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-slate-900">{hostName}</p>
                    {hostRole && <p className="text-[14px] font-semibold text-[#B9461C]">{hostRole}</p>}
                    {hostBio && <p className="mt-2.5 text-[14.5px] text-slate-700 leading-relaxed whitespace-pre-line">{hostBio}</p>}
                    {socialLinks.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-[13px] font-bold text-slate-900 mb-2">Connect with {hostName}</p>
                        <ul className="flex flex-wrap gap-2" aria-label={`${hostName} on social media`}>
                          {socialLinks.map(([key, label, url]) => (
                            <li key={key}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                aria-label={`${hostName} on ${label}`}
                                title={label}
                                className={roundIcon}
                              >
                                <SocialIcon name={key} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      // Until the host's own profiles are added in Admin → Events
                      <div className="mt-4">
                        <p className="text-[13px] font-bold text-slate-900 mb-2">Connect with {hostName}</p>
                        <ul className="flex flex-wrap gap-2" aria-label="Social media">
                          {PLACEHOLDER_SOCIALS.map(([key, label, url]) => (
                            <li key={key}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                title={label}
                                className={roundIcon}
                              >
                                <SocialIcon name={key} />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

          </div>

          <aside className="hidden lg:block lg:sticky lg:top-28">{registerCard}</aside>
        </div>
      </div>

      {/* On-site registration (name, email, phone, optional intake) when no external link is set */}
      <EventRegistrationModal
        event={registering ? event : null}
        open={registering}
        onClose={() => setRegistering(false)}
      />
    </main>
  );
};

export default EventDetailPage;
