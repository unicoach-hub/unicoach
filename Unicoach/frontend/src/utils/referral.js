// Mentor referral links: www.unicoach.com/r/<handle> (or any page with ?ref=<handle>).
// The handle is remembered for 60 days and sent with sign-up, so the student is linked to that mentor.
const KEY = 'unicoach_ref';
const TTL_MS = 60 * 24 * 60 * 60 * 1000;
const clean = (v) => String(v || '').trim().toLowerCase().replace(/^@/, '').slice(0, 60);
const valid = (h) => /^[a-z0-9._-]+$/.test(h);

export const saveReferral = (handle) => {
  const h = clean(handle);
  if (!h || !valid(h)) return;
  try {
    // The first mentor who brought the student keeps the credit
    const current = getReferral();
    if (current && current !== h) return;
    localStorage.setItem(KEY, JSON.stringify({ handle: h, at: Date.now() }));
  } catch {
    /* storage blocked: referral just isn't remembered */
  }
};

export const getReferral = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!raw?.handle || Date.now() - raw.at > TTL_MS) return undefined;
    return raw.handle;
  } catch {
    return undefined;
  }
};

export const captureReferral = () => {
  try {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) saveReferral(ref);
  } catch {
    /* ignore */
  }
};
