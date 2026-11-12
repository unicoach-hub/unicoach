import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getAttribution } from '../utils/adTracking';
import { useLead } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';

/**
 * Smart lead popup: opens only when a visitor is about to leave (desktop exit-intent), or after they
 * have read half a page / stayed 35 s (mobile). Never on page load, never on form/login/dashboard pages,
 * never for logged-in users or anyone who already sent a form, and at most once every 7 days after
 * it was closed. Leads go to POST /api/leads/submit like every other form (CRM + team mail).
 *
 * Open any page with ?uc_popup=1 to force it open (for checking the design).
 */

const SEEN_KEY = 'uc_popup';
const SNOOZE_DAYS = 7;
const MIN_TIME_MS = 8000; // no exit-intent popup in the first seconds of a visit
const MOBILE_TIME_MS = 35000;
const MOBILE_SCROLL = 0.5;

const HIDDEN_PREFIXES = [
  '/book-consultation', '/contact', '/priority-dm', '/login', '/signin', '/signup', '/register',
  '/dashboard', '/profile', '/f/', '/checkout', '/payment', '/unicoach/apply', '/mentor/dashboard',
  '/unicoach/dashboard', '/admin', '/privacy', '/terms', '/refund-policy', '/cancellation-policy',
];

const COUNTRIES = ['Germany', 'UK', 'USA', 'Canada', 'Ireland', 'Australia', 'Other'];

// The offer changes with the page the visitor is reading
const offerFor = (path) => {
  if (path.startsWith('/blog')) { // /blogs and every blog article
    return {
      kicker: 'Free checklist',
      title: 'Is topic ki poori checklist WhatsApp par lo',
      sub: 'Documents, deadlines aur kharcha, ek hi list mein. Saath mein ek free counselling call bhi.',
      cta: 'Checklist bhejo',
      tone: { bg: '#14837E', fg: '#FFFFFF' },
      source: 'Popup - Blog',
    };
  }
  if (/ielts|course-finder|search-programs|tools|calculator|shortlist|sop|eligibility/.test(path)) {
    return {
      kicker: 'Free expert check',
      title: 'Apna result ek expert se free check karwao',
      sub: 'Tool ne jo bataya, uska next step kya hai? 15 minute ki free call mein samjho.',
      cta: 'Free call book karo',
      tone: { bg: '#B8285B', fg: '#FFFFFF' },
      source: 'Popup - Tool',
    };
  }
  return {
    kicker: 'Free counselling',
    title: 'Kaunsa course, kaunsa desh? 15 minute mein clear karo',
    sub: 'Ek free call mein career aur country shortlist. Koi fees nahi, koi pressure nahi.',
    cta: 'Free call book karo',
    tone: { bg: '#F2B705', fg: '#16130F' },
    source: 'Popup - General',
  };
};

const readSeen = () => {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || 'null') || {}; } catch { return {}; }
};
const writeSeen = (v) => {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify({ ...readSeen(), ...v })); } catch { /* storage blocked */ }
};

const alreadyLead = () => {
  try {
    if (localStorage.getItem('lead_info')) return true;
    const visitor = JSON.parse(localStorage.getItem('uc_visitor') || 'null');
    return Boolean(visitor?.converted);
  } catch { return false; }
};

const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

const LeadPopup = () => {
  const { pathname, search } = useLocation();
  const { isModalOpen, isSubmitted } = useLead() || {};
  const { user, loginModalOpen } = useAuth() || {};
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('uc_popup') === '1');
  const [form, setForm] = useState({ name: '', phone: '', email: '', country: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');
  const startedAt = useRef(0);
  const offer = offerFor(pathname);

  const forced = new URLSearchParams(search).get('uc_popup') === '1';
  const hiddenPage = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
  const blocked = !forced && (hiddenPage || user || isModalOpen || isSubmitted || loginModalOpen);

  const close = useCallback(() => {
    setOpen(false);
    if (status !== 'done') writeSeen({ closedAt: Date.now() });
  }, [status]);

  useEffect(() => { startedAt.current = Date.now(); }, []);

  // Arm the triggers for this page
  useEffect(() => {
    if (forced || blocked || open) return undefined;
    const seen = readSeen();
    if (seen.done || alreadyLead()) return undefined;
    if (seen.closedAt && Date.now() - seen.closedAt < SNOOZE_DAYS * 864e5) return undefined;

    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      setOpen(true);
      writeSeen({ shownAt: Date.now() });
    };
    const cleanups = [];

    if (isMobile()) {
      const t = setTimeout(fire, MOBILE_TIME_MS);
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 400 && window.scrollY / max >= MOBILE_SCROLL) fire();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => { clearTimeout(t); window.removeEventListener('scroll', onScroll); });
    } else {
      const onOut = (e) => {
        if (e.relatedTarget || e.clientY > 8) return;
        if (Date.now() - startedAt.current < MIN_TIME_MS) return;
        fire();
      };
      document.addEventListener('mouseout', onOut);
      cleanups.push(() => document.removeEventListener('mouseout', onOut));
    }
    return () => cleanups.forEach((c) => c());
  }, [pathname, blocked, forced, open]);

  // Esc closes; page scroll is locked while open
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, close]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    let phone = form.phone.replace(/[^\d+]/g, '');
    if (!phone.startsWith('+')) phone = `+91${phone.replace(/^0/, '')}`;
    if (name.length < 2) return setError('Apna naam likho');
    if (!/^\+?[0-9]{10,15}$/.test(phone) || (phone.startsWith('+91') && phone.length !== 13)) return setError('Sahi WhatsApp number likho (10 digit)');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Sahi email likho');

    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE_URL}/leads/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone,
          dreamCountry: form.country || undefined,
          source: offer.source,
          attribution: getAttribution(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = Array.isArray(data.details) && data.details[0]?.message;
        setStatus('idle');
        return setError(detail || data.message || 'Abhi bhej nahi paaye, thodi der mein try karo');
      }
      setStatus('done');
      writeSeen({ done: true });
    } catch {
      setStatus('idle');
      setError('Internet check karke dobara try karo');
    }
    return undefined;
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="uc-lead-popup"
          className="fixed inset-0 z-[99990] flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <button type="button" aria-label="Band karo" onClick={close} className="absolute inset-0 bg-[#16130F]/55 backdrop-blur-[2px] cursor-default" />

          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="uc-popup-title"
            className="relative w-full md:w-[760px] md:max-w-[calc(100vw-48px)] bg-[#FFFBF3] text-[#16130F] rounded-t-[28px] md:rounded-[28px] shadow-[0_30px_80px_-20px_rgba(22,19,15,0.55)] overflow-hidden md:grid md:grid-cols-[300px_1fr] max-h-[92vh] overflow-y-auto"
            initial={isMobile() ? { y: '100%' } : { y: 24, scale: 0.97, opacity: 0 }}
            animate={isMobile() ? { y: 0 } : { y: 0, scale: 1, opacity: 1 }}
            exit={isMobile() ? { y: '100%' } : { y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            {/* Colour panel (desktop side / mobile top strip) */}
            <div className="relative px-6 pt-6 pb-5 md:p-8 flex md:flex-col justify-between gap-4" style={{ background: offer.tone.bg, color: offer.tone.fg }}>
              <div>
                <span className="inline-block rounded-full border-2 border-current px-3 py-1 text-[11px] font-urbanist font-extrabold uppercase tracking-wider">{offer.kicker}</span>
                <div className="hidden md:block mt-6 font-urbanist font-black text-[44px] leading-[0.95]" style={{ letterSpacing: '-0.04em' }}>
                  15 min.<br />Free.<br />Clear.
                </div>
              </div>
              <ul className="hidden md:flex flex-col gap-2 text-[13.5px] font-medium opacity-90">
                {['Koi fees nahi', 'Expert counsellor se baat', 'WhatsApp par follow-up'].map((t) => (
                  <li key={t} className="flex items-center gap-2"><Check size={16} strokeWidth={3} />{t}</li>
                ))}
              </ul>
              <span className="md:hidden absolute left-1/2 top-2 -translate-x-1/2 h-1.5 w-10 rounded-full bg-current opacity-40" aria-hidden="true" />
            </div>

            <div className="relative px-6 pt-5 pb-7 md:p-8">
              <button type="button" onClick={close} aria-label="Band karo" className="absolute right-4 top-4 h-9 w-9 rounded-full bg-[#16130F]/5 hover:bg-[#16130F]/10 flex items-center justify-center">
                <X size={18} />
              </button>

              {status === 'done' ? (
                <div className="py-6 pr-8">
                  <div className="h-12 w-12 rounded-full bg-[#14837E] text-white flex items-center justify-center"><Check size={24} strokeWidth={3} /></div>
                  <h2 className="mt-4 font-urbanist font-black text-[26px] leading-tight" style={{ letterSpacing: '-0.03em' }}>Ho gaya, {form.name.split(' ')[0]}!</h2>
                  <p className="mt-2 text-[15px] text-[#16130F]/70">Hamari team jaldi WhatsApp par message karegi. Tab tak site dekhte raho.</p>
                  <button type="button" onClick={() => setOpen(false)} className="mt-6 rounded-full bg-[#16130F] text-white px-6 py-3 font-urbanist font-bold">Theek hai</button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <h2 id="uc-popup-title" className="pr-10 font-urbanist font-black text-[24px] md:text-[28px] leading-[1.1]" style={{ letterSpacing: '-0.03em' }}>{offer.title}</h2>
                  <p className="mt-2 text-[14px] text-[#16130F]/65">{offer.sub}</p>

                  <div className="mt-5 grid gap-2.5">
                    <input value={form.name} onChange={set('name')} placeholder="Tumhara naam" autoComplete="name" maxLength={60}
                      className="h-12 rounded-xl border-2 border-[#16130F]/10 bg-white px-4 text-[15px] outline-none focus:border-[#16130F]" />
                    <div className="flex h-12 rounded-xl border-2 border-[#16130F]/10 bg-white focus-within:border-[#16130F] overflow-hidden">
                      <span className="flex items-center pl-4 pr-2 text-[15px] text-[#16130F]/60">+91</span>
                      <input value={form.phone} onChange={set('phone')} placeholder="WhatsApp number" inputMode="tel" autoComplete="tel-national" maxLength={16}
                        className="flex-1 min-w-0 bg-transparent pr-4 text-[15px] outline-none" />
                    </div>
                    <input value={form.email} onChange={set('email')} placeholder="Email" type="email" autoComplete="email" maxLength={100}
                      className="h-12 rounded-xl border-2 border-[#16130F]/10 bg-white px-4 text-[15px] outline-none focus:border-[#16130F]" />
                  </div>

                  <p className="mt-4 text-[12.5px] font-semibold text-[#16130F]/60">Kaunsa desh soch rahe ho?</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {COUNTRIES.map((c) => {
                      const on = form.country === c;
                      return (
                        <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, country: on ? '' : c }))}
                          className={`rounded-full border-2 px-3 py-1.5 text-[13px] font-semibold transition ${on ? 'border-[#16130F] bg-[#16130F] text-white' : 'border-[#16130F]/12 bg-white hover:border-[#16130F]/40'}`}>
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  {error && <p className="mt-3 text-[13px] font-semibold text-[#B8285B]">{error}</p>}

                  <button type="submit" disabled={status === 'sending'}
                    className="mt-5 w-full h-[52px] rounded-full bg-[#16130F] text-white font-urbanist font-extrabold text-[16px] flex items-center justify-center gap-2 disabled:opacity-60">
                    {status === 'sending' ? 'Bhej rahe hain…' : offer.cta}
                    {status !== 'sending' && <span className="h-7 w-7 rounded-full bg-white text-[#16130F] flex items-center justify-center"><ArrowRight size={15} strokeWidth={2.6} /></span>}
                  </button>
                  <button type="button" onClick={close} className="mt-3 w-full text-center text-[13px] text-[#16130F]/50 hover:text-[#16130F]/80">Abhi nahi</button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default LeadPopup;
