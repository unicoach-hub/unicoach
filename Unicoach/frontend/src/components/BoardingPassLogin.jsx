import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimationControls, useReducedMotion } from 'framer-motion';
import { Plane } from 'lucide-react';

/**
 * BoardingPassLogin
 *
 * The login form "issues" a study-abroad boarding pass:
 * - Passenger name is typed onto the ticket live from the email address
 * - Destination keeps cycling through dream countries until the student is recognised, then locks
 * - The plane advances along the route as each step is completed (email → password → sign in)
 * - Password shows only as a secure "gate code" (never the real characters)
 * - Wrong password: the ticket shakes and the status turns red
 * - Success: "BOARDED" stamp lands and the plane takes off
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DESTINATIONS = [
  { code: 'MUC', city: 'Munich, Germany' },
  { code: 'LHR', city: 'London, UK' },
  { code: 'YYZ', city: 'Toronto, Canada' },
  { code: 'BOS', city: 'Boston, USA' },
  { code: 'MEL', city: 'Melbourne, Australia' },
  { code: 'DUB', city: 'Dublin, Ireland' },
];

const STATUS_STYLES = {
  idle: 'bg-slate-100 text-slate-600 border-slate-200',
  progress: 'bg-amber-50 text-amber-700 border-amber-200',
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-600 border-red-200',
};

// "sagar.punia_21@gmail.com" -> "SAGAR PUNIA"
const nameFromEmail = (email) => {
  const local = (email || '').split('@')[0];
  return local
    .replace(/[0-9]+/g, ' ')
    .split(/[._\-+\s]+/)
    .filter(Boolean)
    .join(' ')
    .toUpperCase()
    .slice(0, 20);
};

// Deterministic barcode from a string so it changes as the student types
const barcodeFrom = (seed) => {
  let h = 2166136261;
  const text = seed || 'UNICOACH';
  const bars = [];
  for (let i = 0; i < 38; i += 1) {
    h ^= text.charCodeAt(i % text.length) + i;
    h = Math.imul(h, 16777619) >>> 0;
    bars.push(1 + (h % 3));
  }
  return bars;
};

// Point on the quadratic flight path M2,30 Q50,-6 98,30 (viewBox units = px vertically, % horizontally)
const pathX = (t) => (1 - t) * (1 - t) * 2 + 2 * t * (1 - t) * 50 + t * t * 98;
const pathY = (t) => (1 - t) * (1 - t) * 30 + 2 * t * (1 - t) * -6 + t * t * 30;

const todayLabel = () =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();

const BoardingPassLogin = ({
  email = '',
  isEmailFocused = false,
  isPasswordFocused = false,
  passwordLength = 0,
  isPasswordVisible = false,
  isSubmitting = false,
  isSuccess = false,
  errorSignal = '',
  compact = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shake = useAnimationControls();
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [destIndex, setDestIndex] = useState(0);

  const isEmailValid = EMAIL_PATTERN.test(email.trim());
  const passenger = nameFromEmail(email);
  const hasError = Boolean(errorSignal);
  const destination = DESTINATIONS[destIndex];

  // Cycle dream destinations until the student is recognised
  useEffect(() => {
    if (isEmailValid || prefersReducedMotion) return undefined;
    const id = setInterval(() => setDestIndex((i) => (i + 1) % DESTINATIONS.length), 2200);
    return () => clearInterval(id);
  }, [isEmailValid, prefersReducedMotion]);

  // Wrong credentials: shake the ticket
  useEffect(() => {
    if (!errorSignal || prefersReducedMotion) return;
    shake.start({ x: [0, -10, 10, -7, 7, -3, 0], transition: { duration: 0.5 } });
  }, [errorSignal, prefersReducedMotion, shake]);

  // Journey progress drives the plane along the route
  const progress = isSuccess ? 1 : isSubmitting ? 0.82 : passwordLength > 0 ? 0.62 : isEmailValid ? 0.36 : email ? 0.14 : 0.04;

  const status = (() => {
    if (isSuccess) return { text: 'BOARDED — HAVE A GREAT JOURNEY', tone: 'ok' };
    if (hasError) return { text: 'CHECK YOUR DETAILS', tone: 'error' };
    if (isSubmitting) return { text: 'NOW BOARDING…', tone: 'progress' };
    if (passwordLength > 0) return { text: 'SECURITY CHECK CLEARED', tone: 'ok' };
    if (isPasswordFocused) return { text: 'SECURITY CHECK', tone: 'progress' };
    if (isEmailValid) return { text: 'PASSENGER FOUND', tone: 'ok' };
    if (isEmailFocused || email) return { text: 'CHECKING IN…', tone: 'progress' };
    return { text: 'CHECK-IN OPEN', tone: 'idle' };
  })();

  const gateCode = passwordLength > 0
    ? (isPasswordVisible ? 'VISIBLE' : '•'.repeat(Math.min(passwordLength, 8)))
    : '------';

  const bars = useMemo(() => barcodeFrom(email.trim().toLowerCase()), [email]);

  const handleMouseMove = (e) => {
    if (!cardRef.current || prefersReducedMotion || compact) return;
    const r = cardRef.current.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 10,
      y: ((e.clientY - r.top) / r.height - 0.5) * 10,
    });
  };

  // ── Compact strip for phones ──
  if (compact) {
    return (
      <motion.div animate={shake} className="w-full rounded-2xl border border-orange-200/80 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-[#DE5C2B] text-white">
          <span className="text-[10px] font-black tracking-[0.18em]">UNICOACH AIRLINES</span>
          <span className="text-[10px] font-bold tracking-[0.18em] opacity-90">BOARDING PASS</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="font-black text-slate-900 text-lg leading-none">DEL</span>
          <div className="relative flex-1 h-5">
            <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-slate-200" />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 text-[#DE5C2B]"
              animate={{ left: `calc(${progress * 100}% - 8px)` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              <Plane size={16} className="rotate-45" />
            </motion.div>
          </div>
          <span className="font-black text-slate-900 text-lg leading-none">{destination.code}</span>
        </div>
        <div className="px-4 pb-3">
          <span className={`inline-block px-2.5 py-1 rounded-full border text-[10px] font-black tracking-wider ${STATUS_STYLES[status.tone]}`}>
            {status.text}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div animate={shake} className="w-full max-w-[330px] mx-auto" style={{ perspective: 1000 }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        animate={{
          rotateY: tilt.x,
          rotateX: -tilt.y,
          scale: isSuccess && !prefersReducedMotion ? [1, 1.04, 1] : 1,
        }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        className={`relative rounded-[22px] bg-white overflow-hidden select-none transition-shadow duration-500 ${
          isSuccess
            ? 'shadow-[0_0_0_4px_rgba(52,211,153,0.25),0_24px_50px_rgba(16,185,129,0.18)]'
            : hasError
              ? 'shadow-[0_0_0_4px_rgba(248,113,113,0.2),0_24px_50px_rgba(222,92,43,0.14)]'
              : 'shadow-[0_24px_50px_rgba(222,92,43,0.16),0_4px_14px_rgba(15,23,42,0.06)]'
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#DE5C2B] to-orange-500 text-white">
          <div className="flex items-center gap-1.5">
            <Plane size={14} className="-rotate-45" />
            <span className="text-[10.5px] font-black tracking-[0.18em]">UNICOACH AIRLINES</span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.18em] opacity-90">BOARDING PASS</span>
        </div>

        <div className="px-5 pt-4 pb-4">
          {/* Passenger */}
          <div className="text-[9.5px] font-bold text-slate-400 tracking-[0.16em]">PASSENGER</div>
          <div className="h-7 mt-0.5 flex items-center font-mono font-bold text-[17px] text-slate-900 tracking-wide">
            {passenger ? (
              <span>{passenger}</span>
            ) : (
              <span className="text-slate-300">YOUR NAME</span>
            )}
            {isEmailFocused && (
              <motion.span
                className="inline-block w-[2px] h-5 bg-[#DE5C2B] ml-0.5"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </div>

          {/* Route */}
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-[28px] leading-none font-black text-slate-900">DEL</div>
              <div className="text-[10.5px] font-semibold text-slate-500 mt-1">New Delhi, India</div>
            </div>
            <div className="text-right">
              <AnimatePresence mode="wait">
                <motion.div
                  key={destination.code}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-[28px] leading-none font-black text-slate-900">{destination.code}</div>
                  <div className="text-[10.5px] font-semibold text-slate-500 mt-1">
                    {destination.city}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Flight path */}
          <div className="relative h-9 mt-1">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 36" preserveAspectRatio="none" fill="none">
              <path d="M2,30 Q50,-6 98,30" stroke="#E2E8F0" strokeWidth="1.2" strokeDasharray="2.5 2.5" vectorEffect="non-scaling-stroke" />
              <motion.path
                d="M2,30 Q50,-6 98,30"
                stroke="#DE5C2B"
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress }}
                transition={{ type: 'spring', stiffness: 80, damping: 18 }}
              />
            </svg>
            <motion.div
              className="absolute text-[#DE5C2B]"
              initial={false}
              animate={
                isSuccess && !prefersReducedMotion
                  ? { left: '104%', top: '-120%', rotate: -20, opacity: 0 }
                  : {
                      left: `calc(${pathX(progress)}% - 9px)`,
                      top: `${pathY(progress) - 9}px`,
                      rotate: 45 + (progress - 0.5) * 100,
                      opacity: 1,
                    }
              }
              transition={isSuccess ? { duration: 1.1, ease: 'easeIn', delay: 0.5 } : { type: 'spring', stiffness: 110, damping: 18 }}
            >
              <Plane size={18} fill="currentColor" />
            </motion.div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { label: 'DATE', value: todayLabel() },
              { label: 'GATE CODE', value: gateCode, mono: true },
              { label: 'SEAT', value: '1:1' },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-[9px] font-bold text-slate-400 tracking-[0.16em]">{item.label}</div>
                <div className={`text-[13px] font-black text-slate-900 mt-0.5 truncate ${item.mono ? 'font-mono tracking-wider' : ''}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="mt-4" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.span
                key={status.text}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black tracking-wider ${STATUS_STYLES[status.tone]}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.tone === 'ok' ? 'bg-emerald-500' : status.tone === 'error' ? 'bg-red-500' : status.tone === 'progress' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
                {status.text}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative h-4">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFF1E8]" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFF1E8]" />
          <div className="absolute left-4 right-4 top-1/2 border-t-2 border-dashed border-slate-200" />
        </div>

        {/* Stub with barcode */}
        <div className="px-5 pt-2 pb-4 flex items-center justify-between gap-3">
          <div className="flex items-end h-9 gap-[1.5px]" aria-hidden="true">
            {bars.map((w, i) => (
              <span key={i} className="bg-slate-800 h-full rounded-[1px]" style={{ width: `${w}px` }} />
            ))}
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] font-bold text-slate-400 tracking-[0.16em]">CLASS</div>
            <div className="text-[12px] font-black text-[#DE5C2B]">SCHOLAR</div>
          </div>
        </div>

        {/* Shine following the cursor */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + tilt.x * 5}% ${40 + tilt.y * 5}%, rgba(255,255,255,0.35), transparent 50%)`,
          }}
        />

        {/* BOARDED stamp */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 2.2, rotate: -24 }}
              animate={{ opacity: 1, scale: 1, rotate: -14 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              className="absolute right-6 top-[38%] px-3 py-1.5 border-[3px] border-emerald-500 text-emerald-600 rounded-lg text-xl font-black tracking-[0.2em] bg-white/70 backdrop-blur-[1px] pointer-events-none"
            >
              BOARDED
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default BoardingPassLogin;
