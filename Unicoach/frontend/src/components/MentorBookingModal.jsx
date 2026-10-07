import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Video,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';
import {
  getCourseMentorSessions,
  bookCourseMentor,
  verifyPaymentByRef
} from '../unicoach/api/unicoachApi';
import { openRazorpayCheckout } from '../unicoach/utils/razorpayCheckout';

// Descriptive copy/badges only, matched to DB sessions by duration.
// PRICES ALWAYS COME FROM THE API, never from this list.
const SESSION_COPY = [
  {
    duration: 15,
    badge: 'Quick Assessment',
    description: 'Quick evaluation of your academic profile, eligibility criteria, and best intakes.'
  },
  {
    duration: 30,
    badge: 'Most Popular',
    popular: true,
    description: 'Complete 1:1 strategy: SOP review, scholarship odds, campus life, and part-time job roadmap.'
  },
  {
    duration: 45,
    badge: 'Comprehensive',
    description: 'Detailed deep dive: Mock visa interview, visa document checklist, and post-study work visa.'
  }
];

const TIME_SLOTS = [
  '10:30 AM',
  '12:00 PM',
  '02:30 PM',
  '04:30 PM',
  '06:00 PM',
  '07:30 PM',
  '08:45 PM'
];

// Build 'YYYY-MM-DD' from local date parts (avoids the UTC off-by-one of toISOString near midnight).
const toLocalIsoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatINR = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  return n.toLocaleString('en-IN');
};

export default function MentorBookingModal({
  isOpen,
  onClose,
  mentor,
  course,
  university
}) {
  const mentorHandle = mentor?.handle ? String(mentor.handle).replace(/^@/, '').trim() : '';
  const resetKey = `${isOpen ? 'open' : 'closed'}:${mentorHandle}`;

  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Default to tomorrow
  const [selectedTime, setSelectedTime] = useState('06:00 PM');
  
  // Student inputs
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentNotes, setStudentNotes] = useState('');

  // Sessions fetched from the DB for this mentor: { handle, status: 'ok' | 'error', data }
  const [sessionsState, setSessionsState] = useState({ handle: null, status: null, data: null });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Reset per-mentor / per-open state when the mentor changes or the modal opens/closes.
  // Done by adjusting state during render (React-recommended) rather than a sync setState in an effect.
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setSelectedServiceId(null);
    setErrorMessage('');
    setBookingSuccess(null);
    setIsSubmitting(false);
    if (sessionsState.handle !== mentorHandle) {
      setSessionsState({ handle: null, status: null, data: null });
    }
  }

  // Guard against setting state after unmount during the async payment flow.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch the real (DB-priced) sessions for this mentor whenever the modal opens.
  useEffect(() => {
    if (!isOpen || !mentorHandle) return undefined;
    let cancelled = false;
    getCourseMentorSessions(mentorHandle)
      .then((data) => {
        if (!cancelled) setSessionsState({ handle: mentorHandle, status: 'ok', data });
      })
      .catch((err) => {
        console.error('Failed to load mentor sessions:', err);
        if (!cancelled) setSessionsState({ handle: mentorHandle, status: 'error', data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, mentorHandle]);

  const sessionsReady = sessionsState.handle === mentorHandle && sessionsState.status !== null;
  const sessionsLoading = Boolean(isOpen && mentorHandle) && !sessionsReady;
  const sessions = useMemo(() => {
    const raw = sessionsReady && sessionsState.status === 'ok' ? sessionsState.data?.sessions : null;
    if (!Array.isArray(raw)) return [];
    return raw.map((s) => {
      const copy = SESSION_COPY.find((c) => c.duration === Number(s.durationMinutes)) || {};
      return {
        ...s,
        id: s.serviceId || `${s.durationMinutes}-${s.title}`,
        duration: Number(s.durationMinutes),
        price: Number(s.priceInINR) || 0,
        description: s.description || copy.description || '',
        badge: copy.badge,
        popular: Boolean(copy.popular)
      };
    });
  }, [sessionsReady, sessionsState]);

  // Not bookable: no handle, fetch failed, bookable=false, or no sessions configured.
  const isBookable = Boolean(mentorHandle)
    && sessionsReady
    && sessionsState.status === 'ok'
    && sessionsState.data?.bookable !== false
    && sessions.length > 0;

  const defaultSession = sessions.find((s) => s.duration === 30) || sessions[0] || null;
  const selectedSession = sessions.find((s) => s.id === selectedServiceId) || defaultSession;

  // Generate next 6 dates
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        dateObj: d,
        isoDate: toLocalIsoDate(d),
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return dates;
  }, []);

  if (!isOpen || !mentor) return null;

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setHasCopied(true);
    setTimeout(() => {
      if (mountedRef.current) setHasCopied(false);
    }, 2500);
  };

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    if (!isBookable || !selectedSession) {
      setErrorMessage('This mentor isn’t taking paid bookings yet. Please book a free consultation instead.');
      return;
    }
    if (!studentName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!studentEmail.trim() || !studentEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address so we can send the meeting link.');
      return;
    }
    if (!studentPhone.trim() || studentPhone.length < 8) {
      setErrorMessage('Please enter a valid phone or WhatsApp number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDate = availableDates[selectedDateIndex]?.isoDate || toLocalIsoDate(new Date());
      const trimmedName = studentName.trim();
      const trimmedEmail = studentEmail.trim().toLowerCase();
      const trimmedPhone = studentPhone.trim();

      const result = await bookCourseMentor({
        mentorHandle,
        durationMinutes: selectedSession.duration,
        selectedDate,
        selectedTime,
        studentName: trimmedName,
        studentEmail: trimmedEmail,
        studentPhone: trimmedPhone,
        studentNotes: studentNotes.trim() || `Advisory discussion regarding ${course?.title || course || 'Course'} at ${university?.name || university || 'University'}.`,
        courseName: course?.title || (typeof course === 'string' ? course : 'M.Sc. Program'),
        universityName: university?.name || (typeof university === 'string' ? university : 'Target University')
      });

      // Free session: confirmed immediately by the server.
      if (result?.status === 'CONFIRMED' || result?.free) {
        if (mountedRef.current) setBookingSuccess(result.booking);
        return;
      }

      if (!result?.bookingRef || !result?.payment) {
        throw new Error('Could not start payment. Please try again.');
      }

      let verifyResult;
      if (result.payment.simulated) {
        // Dev/simulated order: server verifies by booking reference only.
        verifyResult = await verifyPaymentByRef({ bookingRef: result.bookingRef });
      } else {
        const razorpayResponse = await openRazorpayCheckout(result.payment, {
          name: 'UniCoach',
          description: `${result.serviceTitle || selectedSession.title} with ${mentor.name}`,
          image: mentor.avatar,
          prefill: result.payment.prefill || {
            name: trimmedName,
            email: trimmedEmail,
            contact: trimmedPhone
          }
        });
        verifyResult = await verifyPaymentByRef({
          bookingRef: result.bookingRef,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        });
      }

      if (!verifyResult?.booking) {
        throw new Error(`We couldn’t confirm your booking (ref ${result.bookingRef}). If you were charged, please contact support with this reference.`);
      }
      if (mountedRef.current) setBookingSuccess(verifyResult.booking);
    } catch (err) {
      if (!mountedRef.current) return;
      if (err?.code === 'DISMISSED') {
        setErrorMessage('Payment cancelled. Your slot isn’t booked yet; you can try again whenever you’re ready.');
        return;
      }
      console.error('Booking submission error:', err);
      if (err?.code === 'MENTOR_NOT_BOOKABLE') {
        setSessionsState((prev) => ({
          handle: mentorHandle,
          status: 'ok',
          data: { ...(prev.data || {}), bookable: false }
        }));
      }
      setErrorMessage(err?.message || 'Something went wrong while processing your booking.');
    } finally {
      if (mountedRef.current) setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000002] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-[#1e140d] text-white p-4 sm:p-6">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <img
                src={mentor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={mentor.name}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-orange-500/50 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white flex items-center gap-0.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Online
              </span>
            </div>

            <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-8 sm:pr-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-[#DE5C2B] text-white uppercase tracking-wider">
                  Verified Alumni Mentor
                </span>
                <span className="text-xs text-amber-300 font-semibold flex items-center gap-0.5">
                  ★ {mentor.rating || '4.9'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight truncate">
                {mentor.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium truncate">
                {mentor.currentRole || mentor.headline || 'Senior Alumni & Admission Specialist'}
              </p>
              <p className="text-[11px] text-slate-300 font-medium truncate">
                🎓 {mentor.university || mentor.uniShort || university?.name} • {mentor.country || 'Global'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[78vh] overflow-y-auto space-y-6">
          {bookingSuccess ? (
            /* ══════════════════════════════════════════════════════════
               SUCCESS STATE - CONFIRMED WITH GOOGLE MEET & EMAIL NOTICE
            ══════════════════════════════════════════════════════════ */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  🎉 Session 100% Confirmed
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  You’re Scheduled with {bookingSuccess.mentorName}!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  A calendar invite and joining instructions have been automatically sent to <strong>{bookingSuccess.studentEmail}</strong> and your mentor <strong>{bookingSuccess.mentorEmail}</strong>.
                </p>
              </div>

              {/* Booking Snapshot Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-left space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Booking Reference</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300">
                    {bookingSuccess.bookingRef}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Service</span>
                  <span className="font-semibold text-slate-900">{bookingSuccess.serviceTitle}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Scheduled Time</span>
                  <span className="font-bold text-emerald-700">
                    {new Date(bookingSuccess.startUtc).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })} at {selectedTime} IST
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Amount Paid</span>
                  <span className="font-black text-slate-900">₹{bookingSuccess.amountPaid}</span>
                </div>
              </div>

              {/* Google Meet Link Action Box */}
              {bookingSuccess.meetingUrl && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-blue-900 font-bold text-sm">
                    <Video size={18} className="text-blue-600" />
                    <span>Your Secure Google Meet Room</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-blue-100 shadow-2xs">
                    <input
                      type="text"
                      readOnly
                      value={bookingSuccess.meetingUrl}
                      className="w-full text-xs font-mono text-slate-700 bg-transparent px-2 outline-none"
                    />
                    <button
                      onClick={() => handleCopyLink(bookingSuccess.meetingUrl)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition shrink-0"
                    >
                      {hasCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <a
                      href={bookingSuccess.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <span>Join Google Meet</span>
                      <ExternalLink size={14} />
                    </a>

                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`UniCoach 1:1 with ${bookingSuccess.mentorName}`)}&details=${encodeURIComponent(`Join Google Meet: ${bookingSuccess.meetingUrl}\n\nCandidate: ${bookingSuccess.studentName}`)}&location=${encodeURIComponent(bookingSuccess.meetingUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition"
                    >
                      <span>Add to Google Calendar</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : !sessionsLoading && !isBookable ? (
            /* ══════════════════════════════════════════════════════════
               NOT BOOKABLE - MENTOR HAS NO PAID SESSIONS YET
            ══════════════════════════════════════════════════════════ */
            <div className="space-y-5 text-center py-6">
              <div className="w-14 h-14 rounded-full bg-orange-50 text-[#DE5C2B] flex items-center justify-center mx-auto shadow-inner">
                <Calendar size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {mentor.name} isn’t taking paid bookings yet
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
                  {sessionsState.status === 'error'
                    ? 'We couldn’t load this mentor’s session options right now. '
                    : 'This mentor’s 1:1 sessions aren’t open for booking just yet. '}
                  In the meantime, book a free consultation and our team will connect you with the right alumni mentor.
                </p>
              </div>
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                <a
                  href="/book-consultation"
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D] hover:from-[#C04A1D] hover:to-[#A73D14] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 transition"
                >
                  <span>Book a Free Consultation</span>
                  <ArrowRight size={14} />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* ══════════════════════════════════════════════════════════
               ACTIVE BOOKING & PAYMENT FORM
            ══════════════════════════════════════════════════════════ */
            <form onSubmit={handleConfirmAndPay} className="space-y-6">
              {/* 1. SELECT SESSION TYPE */}
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#DE5C2B]" />
                  <span>1. Choose Advisory Session</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" aria-busy={sessionsLoading}>
                  {sessionsLoading && [0, 1, 2].map((i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="rounded-2xl p-3.5 border border-slate-200 bg-white animate-pulse space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-14 rounded bg-slate-200" />
                        <div className="h-3.5 w-10 rounded bg-slate-200" />
                      </div>
                      <div className="h-3 w-full rounded bg-slate-200" />
                      <div className="h-2.5 w-4/5 rounded bg-slate-100" />
                    </div>
                  ))}
                  {!sessionsLoading && sessions.map((sess) => {
                    const isSelected = selectedSession?.id === sess.id;
                    return (
                      <div
                        key={sess.id}
                        onClick={() => setSelectedServiceId(sess.id)}
                        className={`relative cursor-pointer rounded-2xl p-3.5 border transition-all ${
                          isSelected
                            ? 'bg-orange-50/60 border-[#DE5C2B] ring-2 ring-[#DE5C2B]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {sess.popular && (
                          <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-[#DE5C2B] text-white uppercase shadow-2xs">
                            Popular
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-800">
                            {sess.duration} Mins
                          </span>
                          <span className="text-sm font-black text-[#DE5C2B]">
                            {sess.price > 0 ? `₹${formatINR(sess.price)}` : 'Free'}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-900 leading-tight">
                          {sess.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {sess.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. PICK DATE & TIME */}
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#DE5C2B]" />
                  <span>2. Pick Available Date & Time Slot (IST)</span>
                </label>

                {/* Day selector pills */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {availableDates.map((item, idx) => {
                    const isSelected = selectedDateIndex === idx;
                    return (
                      <button
                        type="button"
                        key={item.isoDate}
                        onClick={() => setSelectedDateIndex(idx)}
                        className={`py-2 px-2 rounded-xl border text-center transition ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold opacity-80">{item.dayName}</div>
                        <div className="text-sm font-black">{item.dayNum} {item.month}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Time slot chips */}
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((t) => {
                    const isSelected = selectedTime === t;
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#DE5C2B] text-white border-[#DE5C2B] shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <Clock size={12} />
                        <span>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. STUDENT CONTACT DETAILS */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-[#DE5C2B]" />
                  <span>3. Your Information (For Meeting Invitation)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#DE5C2B] focus:ring-1 focus:ring-[#DE5C2B] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Email Address * (Meet link will be sent here)
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#DE5C2B] focus:ring-1 focus:ring-[#DE5C2B] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#DE5C2B] focus:ring-1 focus:ring-[#DE5C2B] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    What would you like to discuss with {mentor.name}? (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare size={14} className="absolute left-3 top-3 text-slate-400" />
                    <textarea
                      rows={2}
                      placeholder={`e.g. Planning my application for ${course?.title || 'the program'} at ${university?.name || 'this uni'}, need guidance on SOP and living costs.`}
                      value={studentNotes}
                      onChange={(e) => setStudentNotes(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#DE5C2B] focus:ring-1 focus:ring-[#DE5C2B] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. BILLING SUMMARY & GUARANTEE */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    {selectedSession ? selectedSession.title : 'Loading session options…'}
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedSession ? `₹${formatINR(selectedSession.price)}` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1">
                    <span>UniCoach Platform Fee</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      100% Waived
                    </span>
                  </span>
                  <span className="font-semibold text-emerald-600">₹0</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Total Payable</span>
                  <span className="text-base font-black text-[#DE5C2B]">
                    {selectedSession ? `₹${formatINR(selectedSession.price)}` : '—'}
                  </span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 text-slate-500 text-[11px] bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-xl">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>100% Satisfaction Guarantee:</strong> If your mentor fails to join the call, you get a full instant refund.
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ACTION BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || sessionsLoading || !selectedSession}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D] hover:from-[#C04A1D] hover:to-[#A73D14] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Payment & Confirming Your Session...</span>
                  ) : sessionsLoading || !selectedSession ? (
                    <span>Loading Session Options...</span>
                  ) : (
                    <>
                      <span>
                        {selectedSession.price > 0
                          ? `Pay ₹${formatINR(selectedSession.price)} & Book Session`
                          : 'Book Free Session'}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Secure payment via Razorpay • Session confirmed after successful payment • Google Meet link emailed to you & your mentor
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
