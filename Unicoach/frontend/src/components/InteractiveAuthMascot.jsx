import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls, useReducedMotion } from 'framer-motion';
import explorerOpenImg from '@/assets/auth_explorer.png';
import explorerClosedImg from '@/assets/auth_explorer_closed.png';

/**
 * InteractiveAuthMascot
 *
 * Authentic Hand-Drawn Character Animation:
 * - Two hand-painted animation frames matching the user's exact uploaded illustration:
 *   1) explorerOpenImg: Eyes wide open exploring & looking through magnifying glass.
 *   2) explorerClosedImg: Eyes gently closed in the exact digital painting brush style.
 * - Smooth 60fps frame transition when password is typed (closing eyes) vs shown (peeking).
 * - 3D tilt toward the cursor, leans toward the email field while the student types.
 * - Speech bubble that reacts to every step of the form (email, password, error, success).
 * - Shakes on a failed attempt, celebrates with a sparkle burst on success.
 * - Interactive caterpillar easter egg on the leaf.
 * - 100% real, natural, clean — zero fake stickers.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const BURST_PARTICLES = [
  { x: -70, y: -60, color: 'bg-emerald-400' },
  { x: 70, y: -64, color: 'bg-amber-400' },
  { x: -88, y: 4, color: 'bg-orange-400' },
  { x: 88, y: 0, color: 'bg-emerald-400' },
  { x: -54, y: 66, color: 'bg-amber-400' },
  { x: 58, y: 70, color: 'bg-orange-400' },
  { x: 0, y: -86, color: 'bg-rose-400' },
  { x: 4, y: 88, color: 'bg-emerald-400' },
];

const getMascotMessage = ({
  isSuccess, isSubmitting, hasError, isPeeking, isHiding,
  isEmailFocused, emailLength, isEmailValid, caterpillarClicks,
}) => {
  if (isSuccess) return { text: 'Welcome back! Taking you in…', tone: 'success' };
  if (isSubmitting) return { text: 'Checking your details…', tone: 'neutral' };
  if (hasError) return { text: "Hmm, that didn't work. Try again?", tone: 'error' };
  if (isPeeking) return { text: 'Okay… just a tiny peek.', tone: 'neutral' };
  if (isHiding) return { text: "Not looking, promise!", tone: 'neutral' };
  if (isEmailFocused && emailLength === 0) return { text: "What's your email?", tone: 'neutral' };
  if (isEmailFocused && !isEmailValid) return { text: 'Keep typing, I’m reading…', tone: 'neutral' };
  if (isEmailValid) return { text: 'Found you! Now your password.', tone: 'success' };
  if (caterpillarClicks > 0) return { text: 'He likes you! Now let’s sign in.', tone: 'neutral' };
  return { text: 'Hey explorer! Ready to sign in?', tone: 'neutral' };
};

const BUBBLE_TONES = {
  neutral: 'bg-white text-slate-700 border-orange-200/80',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-600 border-red-200',
};

const InteractiveAuthMascot = ({
  isPasswordFocused = false,
  isPasswordVisible = false,
  passwordLength = 0,
  emailLength = 0,
  emailValue = '',
  isEmailFocused = false,
  isSubmitting = false,
  isSuccess = false,
  errorSignal = '',
  compact = false,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [caterpillarClicks, setCaterpillarClicks] = useState(0);
  const [showBugHeart, setShowBugHeart] = useState(false);
  const containerRef = useRef(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const shakeControls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();

  // Determine state
  const hasPasswordInput = passwordLength > 0;
  const isHiding = (!isPasswordVisible && isPasswordFocused) || (!isPasswordVisible && hasPasswordInput);
  const isPeeking = isPasswordVisible && (isPasswordFocused || hasPasswordInput);
  const isEmailValid = EMAIL_PATTERN.test(emailValue.trim());
  const hasError = Boolean(errorSignal);

  // Natural spontaneous blink cycle when idle
  useEffect(() => {
    if (isHiding) return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4200);
    return () => clearInterval(interval);
  }, [isHiding]);

  // Head-shake whenever a new error comes in
  useEffect(() => {
    if (!errorSignal || prefersReducedMotion) return;
    shakeControls.start({
      x: [0, -9, 9, -6, 6, -3, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    });
  }, [errorSignal, prefersReducedMotion, shakeControls]);

  // Handle caterpillar interaction
  const handleCaterpillarClick = (e) => {
    e.stopPropagation();
    setCaterpillarClicks((c) => c + 1);
    setShowBugHeart(true);
    setTimeout(() => setShowBugHeart(false), 1800);
  };

  // Interactive 3D tilt on mouse move inside the card
  const handleMouseMove = (e) => {
    if (!containerRef.current || prefersReducedMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // While typing the email, lean toward the form (it sits to the right) as if reading along
  const emailLean = isEmailFocused && !prefersReducedMotion ? Math.min(emailLength, 24) * 0.25 : 0;

  // Should show closed eyes
  const showClosedEyes = isHiding || isBlinking;

  const message = getMascotMessage({
    isSuccess, isSubmitting, hasError, isPeeking, isHiding,
    isEmailFocused, emailLength, isEmailValid, caterpillarClicks,
  });

  return (
    <motion.div
      animate={shakeControls}
      className={`relative w-full mx-auto ${compact ? '' : 'max-w-[260px] sm:max-w-[280px] lg:max-w-[275px]'}`}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateY: mouseOffset.x * 0.9 + emailLean,
          rotateX: -mouseOffset.y * 0.9,
          scale: isSuccess && !prefersReducedMotion ? [1, 1.06, 1] : 1,
        }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className={`relative w-full aspect-[597/667] rounded-3xl overflow-hidden select-none border bg-white/40 group transition-[box-shadow,border-color] duration-500 ${
          isSuccess
            ? 'border-emerald-300 shadow-[0_0_0_4px_rgba(52,211,153,0.25),0_20px_45px_rgba(16,185,129,0.18)]'
            : hasError
              ? 'border-red-200 shadow-[0_0_0_4px_rgba(248,113,113,0.18),0_20px_45px_rgba(222,92,43,0.12)]'
              : 'border-orange-200/60 shadow-[0_20px_45px_rgba(222,92,43,0.12),0_4px_16px_rgba(0,0,0,0.06)]'
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ── BASE CHARACTER ILLUSTRATION (Smooth hand-painted 2-frame animation) ── */}
        <motion.div
          className="w-full h-full relative"
          animate={{
            scale: isSubmitting && !prefersReducedMotion ? [1.04, 1.07, 1.04] : 1.04,
            x: mouseOffset.x * 0.35 + emailLean * 0.6,
            y: mouseOffset.y * 0.35,
          }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 22,
            scale: isSubmitting ? { repeat: Infinity, duration: 1.1, ease: 'easeInOut' } : undefined,
          }}
        >
          {/* Open Eyes Frame */}
          <motion.img
            src={explorerOpenImg}
            alt="UniCoach Explorer Open"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
            animate={{ opacity: showClosedEyes ? 0 : 1 }}
            transition={{ duration: 0.14, ease: 'easeInOut' }}
          />

          {/* Closed Eyes Frame (Hand-painted matching artwork) */}
          <motion.img
            src={explorerClosedImg}
            alt="UniCoach Explorer Closed"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
            animate={{ opacity: showClosedEyes ? 1 : 0 }}
            transition={{ duration: 0.14, ease: 'easeInOut' }}
          />

          {/* Magnifying glass aperture gleam when peeking or once the email is recognised */}
          <AnimatePresence>
            {(isPeeking || (isEmailValid && isEmailFocused)) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: [1, 1.04, 1] }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ scale: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' } }}
                className="absolute pointer-events-none rounded-full border-2 border-amber-400/60 shadow-[0_0_24px_rgba(251,191,36,0.4)]"
                style={{
                  left: '31.7%',
                  top: '27.0%',
                  width: '30.0%',
                  height: '26.4%',
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Soft glare that follows the cursor */}
        {!compact && (
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${50 + mouseOffset.x * 4}% ${50 + mouseOffset.y * 4}%, rgba(255,255,255,0.28), transparent 55%)`,
            }}
          />
        )}

        {/* ── INTERACTIVE CATERPILLAR BUDDY (26.6% x, 67.8% y, 18.0% w, 17.8% h) ── */}
        <motion.button
          type="button"
          onClick={handleCaterpillarClick}
          className="absolute cursor-pointer rounded-full z-25 outline-none focus:outline-none"
          style={{
            left: '26.6%',
            top: '67.8%',
            width: '18.0%',
            height: '17.8%',
          }}
          title="Tap the caterpillar!"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={caterpillarClicks > 0 ? {
            y: [0, -10, 0],
            rotate: [0, 8, -8, 0]
          } : {
            scaleY: [1, 0.96, 1],
            x: [0, 1.2, 0]
          }}
          transition={{
            repeat: caterpillarClicks > 0 ? 0 : Infinity,
            duration: 2.2,
            ease: 'easeInOut'
          }}
        >
          <span className="sr-only">Interactive caterpillar</span>

          {/* Floating Heart on click */}
          <AnimatePresence>
            {showBugHeart && (
              <motion.span
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -22, scale: 1 }}
                exit={{ opacity: 0, y: -32, scale: 0.8 }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm drop-shadow pointer-events-none"
              >
                💚
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Floating Ambient Sparkles */}
        <motion.div
          className="absolute top-8 right-6 w-1.5 h-1.5 rounded-full bg-emerald-400/60 shadow-[0_0_8px_#34d399] pointer-events-none"
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-7 w-2 h-2 rounded-full bg-amber-400/60 shadow-[0_0_10px_#fbbf24] pointer-events-none"
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.9, 0.3] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
        />
      </motion.div>

      {/* Celebration burst on successful sign-in */}
      <AnimatePresence>
        {isSuccess && !prefersReducedMotion && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {BURST_PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                className={`absolute w-2 h-2 rounded-full ${p.color}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{ x: p.x * 1.6, y: p.y * 1.6, opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.02 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── REACTIVE SPEECH BUBBLE (sits on the bottom edge of the card) ── */}
      {!compact && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 z-30 w-max max-w-[95%]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={message.text}
              initial={{ opacity: 0, y: 6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={`relative px-3.5 py-1.5 rounded-full border text-[11.5px] font-bold shadow-[0_6px_18px_rgba(15,23,42,0.08)] whitespace-nowrap ${BUBBLE_TONES[message.tone]}`}
            >
              <span
                className={`absolute -top-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border-l border-t ${BUBBLE_TONES[message.tone]}`}
              />
              <span className="relative">{message.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default InteractiveAuthMascot;
