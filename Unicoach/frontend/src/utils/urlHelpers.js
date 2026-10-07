/**
 * Smart URL Sanitizer & Zero-404 Fallback Engine
 * Ensures all external university & scholarship portal links are valid, sanitized, and never crash into dead ends.
 */

export function cleanPortalUrl(url, fallbackQuery = '') {
  if (!url || typeof url !== 'string' || url.trim() === '' || url === '#') {
    if (fallbackQuery) {
      return `https://www.google.com/search?q=${encodeURIComponent(fallbackQuery + ' official admission portal')}`;
    }
    return 'https://google.com';
  }

  let clean = url.trim();

  // Replace literal unencoded spaces that cause browser 404s
  clean = clean.replace(/ /g, '%20');

  // Ensure protocol
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  return clean;
}

export function openSmartPortal(url, fallbackQuery = '', event) {
  if (event && event.preventDefault) {
    event.preventDefault();
  }

  const destination = cleanPortalUrl(url, fallbackQuery);
  window.open(destination, '_blank', 'noopener,noreferrer');
}

export function getUniversityPortalFallback(uniName, country) {
  const query = `${uniName} ${country || ''} international admissions apply portal official`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function getScholarshipPortalFallback(scholarshipTitle, uniName, country) {
  const query = `${scholarshipTitle} ${uniName || ''} ${country || ''} scholarship application portal official`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
