// Social profiles a mentor can show on their public storefront (also the order they appear in)
const SOCIAL_LINK_LABELS = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  github: 'GitHub',
  website: 'Website'
};

const MAX_LINK_LENGTH = 300;

/**
 * Validates the socialLinks object sent from the mentor dashboard.
 * Only known keys are kept; each value must be empty or a full http(s) link, so nothing like
 * `javascript:` can reach the public profile's <a href>.
 * Returns { links } on success or { error } with a message for the mentor.
 */
const cleanSocialLinks = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Social links must be sent as an object.' };
  }
  const links = {};
  for (const [key, label] of Object.entries(SOCIAL_LINK_LABELS)) {
    const value = typeof input[key] === 'string' ? input[key].trim() : '';
    if (value && (value.length > MAX_LINK_LENGTH || !/^https?:\/\/[^\s<>"']+$/i.test(value))) {
      return { error: `Please enter your full ${label} link, starting with https://` };
    }
    links[key] = value;
  }
  return { links };
};

module.exports = { SOCIAL_LINK_LABELS, cleanSocialLinks };
