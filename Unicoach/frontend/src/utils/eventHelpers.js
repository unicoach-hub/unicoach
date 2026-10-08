// Shared helpers for event cards (homepage, /events) and the event detail page (/events/:slug)
import { API_BASE_URL } from '../config';

// Admin uploads (/uploads/...) live on the API server; everything else is a full URL or a frontend static file
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
export const toAbsoluteUrl = (url) => (typeof url === 'string' && url.startsWith('/uploads') ? `${API_ORIGIN}${url}` : url);

// Registration link from Admin → Events: http(s) or a site path; a bare domain gets https://; other schemes are ignored
export const toRegistrationUrl = (link) => {
  const value = typeof link === 'string' ? link.trim() : '';
  if (!value || value === '#') return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value;
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return '';
  return `https://${value}`;
};

// Over once the end time (or the start time, when no end is set) has passed; an undated event is still open
export const hasEventEnded = (ev, now = Date.now()) => {
  const ts = new Date(ev?.eventEnd || ev?.eventStart || NaN).getTime();
  return Number.isFinite(ts) && ts < now;
};

// The event's own page: by slug, else by id (GET /api/events/:idOrSlug accepts both). '' = no page.
export const eventPath = (ev) => {
  const key = (typeof ev?.slug === 'string' && ev.slug.trim().replace(/^\/+|\/+$/g, '')) || (ev?._id ? String(ev._id) : '');
  return key ? `/events/${encodeURIComponent(key)}` : '';
};

// Speaker face photos, matched by first name (falls back to the initial when there's no photo)
const SPEAKER_PHOTOS = {
  nitya: '/images/mentors/thumbs/nitya_ireland_career.webp',
  manan: '/images/mentors/thumbs/manan_australia.webp',
  prachi: '/images/mentors/thumbs/prachi_cybersecurity.webp',
  joshua: '/images/mentors/thumbs/speaker_joshua.webp',
  prateek: '/images/mentors/thumbs/speaker_prateek.webp',
  hardik: '/images/mentors/thumbs/speaker_hardik.webp',
  tanisha: '/images/mentors/thumbs/speaker_tanisha.webp',
};

export const getSpeakerPhoto = (speaker = '') => SPEAKER_PHOTOS[String(speaker || '').trim().split(/[\s(]/)[0].toLowerCase()] || null;
