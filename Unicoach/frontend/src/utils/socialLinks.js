// Social profiles shown for mentors and event hosts, in display order
export const SOCIAL_LABELS = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  github: 'GitHub',
  website: 'Website',
};

// [key, label, url] for every filled-in http(s) link, in display order
export const socialLinksOf = (links) => {
  if (!links || typeof links !== 'object') return [];
  return Object.entries(SOCIAL_LABELS)
    .map(([key, label]) => [key, label, typeof links[key] === 'string' ? links[key].trim() : ''])
    .filter(([, , url]) => /^https?:\/\//i.test(url));
};
