import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Calendar, CheckCircle2, ChevronDown, Loader2, MapPin, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import { countries as dialCountries } from '../utils/countries';
import { API_BASE_URL } from '../config';

// On-site registration for an event that has no external registration link.
// POST /events/:idOrSlug/register saves the attendee and creates a Support Request
// (Admin → Requests → Event Registration), so the team can see who enrolled in which event.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_DIAL_ISO = 'IN';

// Next four Jan / Sep intakes from today, plus "not decided" (intake is optional)
const INTAKE_OPTIONS = (() => {
  const now = new Date();
  const upcoming = [];
  for (let year = now.getFullYear(); upcoming.length < 4; year += 1) {
    [['Jan', 0], ['Sep', 8]].forEach(([label, month]) => {
      if (upcoming.length < 4 && new Date(year, month, 1) > now) upcoming.push(`${label} ${year}`);
    });
  }
  return [...upcoming, 'Not decided yet'];
})();

// "Sat, 18 Oct 2026 · 6:30 PM – 8:00 PM IST" (the team runs events on Indian time)
const formatEventWhen = (start, end) => {
  const s = start ? new Date(start) : null;
  if (!s || Number.isNaN(s.getTime())) return '';
  const day = s.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
  const time = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const e = end ? new Date(end) : null;
  const range = e && !Number.isNaN(e.getTime()) ? `${time(s)} – ${time(e)}` : time(s);
  return `${day} · ${range} IST`;
};

// A number typed with "+" is already international; otherwise prefix the picked dial code
// (drop spaces/dashes and a leading trunk zero) so the team gets WhatsApp-ready numbers.
const buildPhone = (dialCode, raw) => {
  const typed = String(raw || '').trim();
  if (typed.startsWith('+')) return `+${typed.replace(/\D/g, '')}`;
  const digits = typed.replace(/\D/g, '').replace(/^0+/, '');
  return digits ? `${dialCode}${digits}` : '';
};

const validate = (form, dial) => {
  const errors = {};
  const name = form.name.trim();
  if (!name) errors.name = 'Please enter your name';
  else if (name.length > 100) errors.name = 'Please keep your name under 100 characters';

  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Please enter a valid email address';

  const typedPhone = form.phone.trim();
  const digits = buildPhone(dial.code, typedPhone).replace(/\D/g, '');
  if (!typedPhone) errors.phone = 'Please enter your phone number';
  else if (!typedPhone.startsWith('+') && dial.iso === 'IN' && typedPhone.replace(/\D/g, '').replace(/^0+/, '').length !== 10) {
    errors.phone = 'Please enter a 10-digit mobile number';
  } else if (digits.length < 8 || digits.length > 15) errors.phone = 'Please enter a valid phone number';
  return errors;
};

const describeApiError = (status, data) => {
  if (status === 404) return 'This event is no longer open for registration.';
  if (status === 410) return 'This event has already ended, so registration is closed.';
  if (status === 400) return data.error || 'Please check your details and try again.';
  if (status === 429) return data.error || data.message || 'Too many attempts. Please wait a minute and try again.';
  return 'Something went wrong on our side. Please try again in a moment.';
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const inputClass = (hasError) =>
  `w-full h-11 rounded-xl border bg-white px-3.5 text-[16px] sm:text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-4 ${hasError
    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
    : 'border-slate-200 focus:border-[#DE5C2B] focus:ring-orange-100'
  }`;

const RegistrationDialog = ({ event, onClose }) => {
  const { user } = useAuth() || {};
  const { verifiedLead } = useLead() || {};
  const reduceMotion = useReducedMotion();

  const [form, setForm] = useState(() => ({
    name: user?.name || verifiedLead?.name || '',
    email: user?.email || verifiedLead?.email || '',
    phone: user?.phone || verifiedLead?.phone || '',
    intake: '',
  }));
  const [dialIso, setDialIso] = useState(DEFAULT_DIAL_ISO);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { alreadyRegistered, event } once the API confirmed

  const panelRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const successHeadingRef = useRef(null);

  const ids = { title: useId(), name: useId(), email: useId(), phone: useId(), intake: useId() };
  const dial = dialCountries.find((c) => c.iso === dialIso) || dialCountries[0];
  const eventKey = event._id || event.slug;
  const shownEvent = result?.event || event;
  const when = formatEventWhen(shownEvent.eventStart, shownEvent.eventEnd);

  // Focus the first field on open, give focus back to the button that opened us on close
  useEffect(() => {
    const opener = document.activeElement;
    nameRef.current?.focus({ preventScroll: true });
    return () => {
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, []);

  // Lock the page behind the dialog
  useEffect(() => {
    const { body, documentElement: html } = document;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (result) successHeadingRef.current?.focus({ preventScroll: true });
  }, [result]);

  // Keep Tab / Shift+Tab inside the dialog
  const trapFocus = (e) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll(FOCUSABLE));
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);
    if (e.shiftKey && index <= 0) {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (!e.shiftKey && index === items.length - 1) {
      e.preventDefault();
      items[0].focus();
    }
  };

  const updateField = (field) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setApiError('');

    const found = validate(form, dial);
    setErrors(found);
    if (found.name) return nameRef.current?.focus();
    if (found.email) return emailRef.current?.focus();
    if (found.phone) return phoneRef.current?.focus();

    if (!eventKey) {
      setApiError('Registration is not available for this event right now.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/events/${encodeURIComponent(eventKey)}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: buildPhone(dial.code, form.phone),
          intake: form.intake || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      // Only a confirmed save counts as registered
      if (res.ok && data.success) {
        setResult({ alreadyRegistered: Boolean(data.alreadyRegistered), event: data.event || null });
        return;
      }
      setApiError(describeApiError(res.status, data));
    } catch {
      setApiError('We could not reach UniCoach. Check your internet connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center sm:p-4">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ids.title}
        onKeyDown={trapFocus}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full sm:max-w-[440px] max-h-[92dvh] overflow-y-auto overscroll-contain bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl text-left"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {result ? (
          /* ──── Confirmation ──── */
          <div className="px-6 pt-10 pb-6 sm:px-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 stroke-[2.25]" />
            </div>
            <h2
              id={ids.title}
              ref={successHeadingRef}
              tabIndex={-1}
              className="font-outfit text-[19px] sm:text-[21px] font-bold text-[#111111] leading-snug outline-none"
            >
              {result.alreadyRegistered ? "You're already registered for " : "You're registered for "}
              <span className="text-[#DE5C2B]">{shownEvent.title}</span>
            </h2>
            {when && (
              <p className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[12.5px] font-semibold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-[#DE5C2B] shrink-0" />
                {when}
              </p>
            )}
            <p className="mt-4 text-[14px] text-slate-600 leading-relaxed max-w-[320px] mx-auto">
              Our team will share the joining details with you before the event.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full h-12 rounded-full bg-[#111111] hover:bg-[#DE5C2B] text-white text-[14px] font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* ──── Registration form ──── */
          <div className="px-5 pt-6 pb-6 sm:px-7 sm:pt-7">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#DE5C2B] text-[10.5px] font-extrabold uppercase tracking-wider">
              Free registration
            </span>
            <h2 id={ids.title} className="mt-2.5 pr-8 font-outfit text-[18px] sm:text-[20px] font-bold text-[#111111] leading-snug">
              {event.title}
            </h2>
            {(when || event.location) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-medium text-slate-600">
                {when && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#DE5C2B] shrink-0" />
                    {when}
                  </span>
                )}
                {event.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#DE5C2B] shrink-0" />
                    {event.location}
                  </span>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3.5">
              <div>
                <label htmlFor={ids.name} className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Full name</label>
                <input
                  ref={nameRef}
                  id={ids.name}
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder="e.g. Amit Patel"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? `${ids.name}-error` : undefined}
                  className={inputClass(errors.name)}
                />
                {errors.name && <p id={`${ids.name}-error`} className="mt-1 text-[12px] font-medium text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor={ids.email} className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  ref={emailRef}
                  id={ids.email}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? `${ids.email}-error` : undefined}
                  className={inputClass(errors.email)}
                />
                {errors.email && <p id={`${ids.email}-error`} className="mt-1 text-[12px] font-medium text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor={ids.phone} className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Phone (WhatsApp preferred)</label>
                <div className="flex gap-2">
                  {/* Native select laid over a compact "+91" label */}
                  <div className="relative shrink-0">
                    <select
                      value={dialIso}
                      onChange={(e) => setDialIso(e.target.value)}
                      aria-label="Country code"
                      className="peer absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                    >
                      {dialCountries.map((c) => (
                        <option key={c.iso} value={c.iso}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                    <span
                      aria-hidden="true"
                      className="h-11 px-3 flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-semibold text-slate-800 transition peer-focus-visible:border-[#DE5C2B] peer-focus-visible:ring-4 peer-focus-visible:ring-orange-100"
                    >
                      {dial.code}
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  </div>
                  <input
                    ref={phoneRef}
                    id={ids.phone}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    maxLength={20}
                    value={form.phone}
                    onChange={updateField('phone')}
                    placeholder="98765 43210"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? `${ids.phone}-error` : undefined}
                    className={`${inputClass(errors.phone)} min-w-0`}
                  />
                </div>
                {errors.phone && <p id={`${ids.phone}-error`} className="mt-1 text-[12px] font-medium text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor={ids.intake} className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                  Planned intake <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <select
                  id={ids.intake}
                  value={form.intake}
                  onChange={updateField('intake')}
                  className={`${inputClass(false)} cursor-pointer`}
                >
                  <option value="">Select intake</option>
                  {INTAKE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {apiError && (
                <p role="alert" className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] font-medium text-red-700">
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="w-full h-12 mt-1 rounded-full bg-[#111111] hover:bg-[#DE5C2B] disabled:hover:bg-[#111111] disabled:opacity-75 text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-wait"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Registering…' : 'Register for free'}
              </button>

              <p className="text-[11.5px] text-slate-500 leading-relaxed text-center">
                By registering, you agree that UniCoach may contact you by call, email or WhatsApp about this event and related study-abroad guidance.{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">Privacy Policy</a>
              </p>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const EventRegistrationModal = ({ event, open, onClose }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && event && (
        <RegistrationDialog key={event._id || event.slug || event.title} event={event} onClose={onClose} />
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EventRegistrationModal;
