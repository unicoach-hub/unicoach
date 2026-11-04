import { api } from './api';

// Live masterclasses and blog posts from the website's CMS (/api/events, /api/blogs), shown in the Feed.
export type EventItem = {
  _id: string;
  title: string;
  slug: string;
  imageUrl?: string;
  eventStart?: string;
  location?: string;
  speaker?: string;
  description?: string;
};

export type BlogItem = { _id: string; title: string; slug: string; imageUrl?: string; category?: string; publishDate?: string };

export const SITE = 'https://www.unicoach.com';

export function absolute(url?: string) {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${SITE}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function upcomingEvents() {
  const all = await api<EventItem[]>('/events', { auth: false });
  const now = Date.now();
  return all
    .filter((e) => e.eventStart && new Date(e.eventStart).getTime() > now)
    .sort((a, b) => new Date(a.eventStart!).getTime() - new Date(b.eventStart!).getTime());
}

export async function latestBlogs() {
  const all = await api<(BlogItem & { body?: string })[]>('/blogs', { auth: false });
  // The list endpoint sends whole articles; keep only what a card needs.
  return all.slice(0, 6).map(({ _id, title, slug, imageUrl, category, publishDate }) => ({ _id, title, slug, imageUrl, category, publishDate }));
}

export function eventWhen(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}
