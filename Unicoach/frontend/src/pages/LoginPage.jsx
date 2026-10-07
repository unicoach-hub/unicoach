import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  Sparkles, CheckCircle2, ShieldCheck, HelpCircle, GraduationCap, Users
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import BoardingPassLogin from '../components/BoardingPassLogin';
import brandLogo from '@/assets/blackunicoachlogo.webp';

const LoginPage = () => {
  const { loginWithEmail, loginWithGoogle, forgotPassword, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in — only once /auth/me has confirmed the session; `user` is
  // hydrated from localStorage first, so an expired session would otherwise bounce to /dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const params = new URLSearchParams(location.search);
      const redirectPath = params.get('redirect') || '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  // Google renders a fixed-width iframe button; match it to the form width (Google caps it at 400px)
  const [googleWidth, setGoogleWidth] = useState(360);
  const measureGoogleSlot = useCallback((node) => {
    if (node) setGoogleWidth(Math.min(400, Math.max(200, Math.floor(node.getBoundingClientRect().width))));
  }, []);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Forgot Password View
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Sign In | UniCoach - Global Admissions & Test Prep';
  }, []);

  const handlePostAuthSuccess = () => {
    setIsSuccess(true);
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get('redirect') || '/dashboard';
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 800);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        handlePostAuthSuccess();
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google sign-in was cancelled.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.success) {
        handlePostAuthSuccess();
      } else {
        setError(res.message || 'Google sign-in failed.');
      }
    } catch {
      setError('Network error during Google sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }
    setForgotError('');
    setForgotMsg('');
    setForgotLoading(true);
    try {
      const res = await forgotPassword(forgotEmail);
      if (res.success) {
        setForgotMsg('Password reset link sent to your inbox.');
      } else {
        setForgotError(res.message || 'Unable to send reset email.');
      }
    } catch {
      setForgotError('Network error occurred.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-74px)] pt-[80px] md:pt-[90px] pb-8 px-3.5 sm:px-6 bg-[#F8FAFC] flex flex-col justify-center items-center relative selection:bg-orange-500 selection:text-white">

      {/* ── Background Ambient Light Orbs ── */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none translate-x-1/3" />

      {/* ── TOP UTILITY BAR (Back to Home) ── */}
      <div className="w-full max-w-4xl lg:max-w-5xl mb-3 px-1 flex items-center justify-between relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <div className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
            <ArrowLeft size={13} className="text-slate-700" />
          </div>
          <span>Back to Home</span>
        </Link>
      </div>

      {/* ── MAIN UNICOACH PORTAL CONTAINER ── */}
      <div className="w-full max-w-4xl lg:max-w-5xl my-auto relative z-10">

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.08),0_2px_16px_rgba(222,92,43,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-auto lg:min-h-[560px] relative">

          {/* ════════ LEFT COLUMN: Meaningful UniCoach Platform Showcase (Warm Orange Blush Theme) ════════ */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#FFF9F6] via-[#FFF3EC] to-[#FFEBE0] p-7 flex-col justify-between relative border-r border-orange-100/90 overflow-hidden text-slate-800">

            {/* Ambient Orange Blush Blurry Spheres */}
            <div className="absolute -top-14 -left-14 w-72 h-72 bg-gradient-to-br from-orange-400/25 via-[#DE5C2B]/18 to-amber-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-14 -right-14 w-72 h-72 bg-gradient-to-tl from-[#FF7A45]/20 via-rose-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-400/15 rounded-full blur-2xl pointer-events-none" />

            {/* Top Micro-Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-orange-200/80 text-[#DE5C2B] text-[11px] font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#DE5C2B] animate-pulse" />
                <span>Admissions & Mentorship</span>
              </div>
              <span className="text-[10.5px] font-bold text-orange-950/50 uppercase tracking-wider">
                Scholar Portal
              </span>
            </div>

            {/* Center: Interactive Explorer Mascot Animation */}
            <div className="my-auto py-1 flex flex-col items-center justify-center relative z-10">
              <BoardingPassLogin
                email={email}
                isEmailFocused={isEmailFocused}
                isPasswordFocused={isPasswordFocused}
                passwordLength={password.length}
                isPasswordVisible={showPassword}
                isSubmitting={loading}
                isSuccess={isSuccess}
                errorSignal={error}
              />

              <div className="mt-6 text-center">
                <h3 className="font-outfit font-black text-slate-900 text-[15px] tracking-tight">
                  Your boarding pass to study abroad
                </h3>
                <p className="text-[11.5px] text-slate-600 font-medium max-w-[240px] mx-auto mt-0.5 leading-snug">
                  Sign in and we'll get you cleared for take-off to your dream university.
                </p>
              </div>
            </div>

            {/* Bottom Trust Indicators */}
            <div className="relative z-10 pt-3 border-t border-orange-200/60 flex items-center justify-between text-slate-600 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5">
                <GraduationCap size={14} className="text-[#DE5C2B]" />
                <span className="font-bold text-slate-800">1,200+ Universities</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <Users size={14} className="text-emerald-600" />
                <span>Verified Mentors</span>
              </div>
            </div>
          </div>

          {/* ════════ RIGHT COLUMN: Clean UniCoach Auth Form ════════ */}
          <div className="lg:col-span-7 px-5 py-7 sm:px-10 sm:py-10 flex flex-col justify-center bg-white relative">
            <div className="w-full max-w-[400px] mx-auto">

            {/* Mobile-only slim boarding pass */}
            <div className="lg:hidden mb-6">
              <BoardingPassLogin
                email={email}
                isEmailFocused={isEmailFocused}
                isPasswordFocused={isPasswordFocused}
                passwordLength={password.length}
                isPasswordVisible={showPassword}
                isSubmitting={loading}
                isSuccess={isSuccess}
                errorSignal={error}
                compact
              />
            </div>

            {/* Header with Official UniCoach Logo */}
            <div className="mb-7">
              <img
                src={brandLogo}
                alt="UniCoach"
                className="hidden lg:block h-8 w-auto object-contain mb-6"
              />

              {!isForgotView ? (
                <>
                  <h1 className="font-outfit text-2xl sm:text-[28px] leading-tight font-black text-slate-900 tracking-tight">
                    Welcome back
                  </h1>
                  <p className="text-slate-500 text-sm font-medium mt-1.5">
                    Sign in to access your university shortlist, SOP tools & mentor bookings.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="font-outfit text-2xl sm:text-[28px] leading-tight font-black text-slate-900 tracking-tight">
                    Reset your password
                  </h1>
                  <p className="text-slate-500 text-sm font-medium mt-1.5">
                    Enter your registered email address to receive a recovery link.
                  </p>
                </>
              )}
            </div>

            {!isForgotView ? (
              <>
                {/* ── 1. Fast & Simple Google 1-Click Sign In ── */}
                <div className="mb-5">
                  <div className="flex justify-center w-full">
                    <div ref={measureGoogleSlot} className="w-full flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google sign-in was cancelled or failed.')}
                        shape="pill"
                        size="large"
                        text="continue_with"
                        theme="outline"
                        width={googleWidth}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Divider ── */}
                <div className="relative flex items-center justify-center mb-5">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] uppercase font-bold tracking-wider text-slate-400 absolute">
                    or sign in with email
                  </span>
                </div>

                {/* ── Email & Password Form ── */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-slate-700 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        onFocus={() => {
                          setIsPasswordFocused(false);
                          setIsEmailFocused(true);
                        }}
                        onBlur={() => setIsEmailFocused(false)}
                        placeholder="name@domain.com"
                        required
                        className="w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-semibold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotView(true);
                          setError('');
                        }}
                        className="text-[13px] font-semibold text-[#DE5C2B] hover:text-orange-700 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError('');
                        }}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        placeholder="Enter your password"
                        required
                        className="w-full pl-10 pr-14 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                      />

                      {/* Show / Hide Toggle Button */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-slate-400 hover:text-slate-700 text-[11px] font-bold cursor-pointer rounded hover:bg-slate-100 transition-colors flex items-center gap-1 select-none"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <>
                            <EyeOff size={13} />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye size={13} />
                            <span>Show</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-1.5"
                      >
                        <HelpCircle size={13} className="shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || isSuccess}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 via-[#DE5C2B] to-[#DE5C2B] text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Signed In! Redirecting...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Switch to Signup */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500 font-medium">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-[#DE5C2B] font-bold hover:underline">
                      Create an account
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              /* ── Forgot Password Form ── */
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 block">
                    Registered Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@domain.com"
                      required
                      className="w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                    />
                  </div>
                </div>

                {forgotError && (
                  <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-1.5">
                    <HelpCircle size={13} />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotMsg && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>{forgotMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-[#DE5C2B] text-white font-bold text-sm rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {forgotLoading ? 'Sending Link...' : 'Send Recovery Link'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotView(false);
                      setForgotError('');
                      setForgotMsg('');
                    }}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default LoginPage;
