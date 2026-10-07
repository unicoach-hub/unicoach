import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, 
  Sparkles, CheckCircle2, ShieldCheck, HelpCircle, GraduationCap, Users 
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import InteractiveAuthMascot from '../components/InteractiveAuthMascot';
import brandLogo from '@/assets/blackunicoachlogo.webp';

const SignupPage = () => {
  const { registerWithEmail, loginWithGoogle, user, loading: authLoading } = useAuth();
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

  // Form State - Fast & Simple: Just Name, Email, Password
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Create Free Account | UniCoach - Global Admissions & Test Prep';
  }, []);

  const handlePostAuthSuccess = () => {
    setIsSuccess(true);
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get('redirect') || '/dashboard';
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 800);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please provide your name, email and password.');
      return;
    }
    if (password.length !== 6) {
      setError('Password must be exactly 6 characters.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await registerWithEmail({ name, email, password });
      if (res.success) {
        handlePostAuthSuccess();
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google sign-up was cancelled.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.success) {
        handlePostAuthSuccess();
      } else {
        setError(res.message || 'Google account setup failed.');
      }
    } catch {
      setError('Network error during Google sign-up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-74px)] pt-[80px] md:pt-[90px] pb-8 px-3.5 sm:px-6 bg-[#F8FAFC] flex flex-col justify-center items-center relative selection:bg-orange-500 selection:text-white">
      
      {/* Background Ambient Orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none translate-x-1/3" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />

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
        
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.08),0_2px_16px_rgba(222,92,43,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-auto lg:h-[540px] relative">

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

            {/* Center: Interactive Mascot Character Animation */}
            <div className="my-auto py-1 flex flex-col items-center justify-center relative z-10">
              <InteractiveAuthMascot
                isPasswordFocused={isPasswordFocused}
                isPasswordVisible={showPassword}
                passwordLength={password.length}
                emailLength={email.length}
                isSubmitting={loading}
                isSuccess={isSuccess}
              />

              <div className="mt-2 text-center">
                <h3 className="font-outfit font-black text-slate-900 text-[15px] tracking-tight">
                  Your Global Admissions Scout
                </h3>
                <p className="text-[11.5px] text-slate-600 font-medium max-w-[220px] mx-auto mt-0.5 leading-snug">
                  Guiding you to top-ranked universities & verified student mentors worldwide.
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

          {/* ════════ RIGHT COLUMN: Fast & Clean Signup Form ════════ */}
          <div className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-center bg-white relative overflow-y-auto">

            {/* Mobile-Only Mascot Animation (Visible on phones) */}
            <div className="lg:hidden flex flex-col items-center justify-center mb-1.5">
              <div className="w-16 sm:w-20">
                <InteractiveAuthMascot
                  isPasswordFocused={isPasswordFocused}
                  isPasswordVisible={showPassword}
                  passwordLength={password.length}
                  emailLength={email.length}
                  isSubmitting={loading}
                  isSuccess={isSuccess}
                />
              </div>
            </div>

            {/* Header */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <img 
                  src={brandLogo} 
                  alt="UniCoach" 
                  className="h-7 w-auto object-contain" 
                />
                <span className="text-[11px] font-bold text-[#DE5C2B] bg-orange-50 border border-orange-200/70 px-2.5 py-0.5 rounded-full">
                  Scholar Registration
                </span>
              </div>
              <h1 className="font-outfit text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Create Scholar Account
              </h1>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Get full access to AI university shortlisting, eligibility & SOP tools.
              </p>
            </div>

            {/* ── 1. Google 1-Click Fast Signup ── */}
            <div className="mb-3">
              <div className="flex justify-center w-full">
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google sign-up was cancelled or failed.')}
                    shape="pill"
                    size="medium"
                    text="signup_with"
                    theme="outline"
                    width="320"
                  />
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="relative flex items-center justify-center mb-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[9.5px] uppercase font-black tracking-wider text-slate-400 absolute">
                or sign up with email
              </span>
            </div>

            {/* ── Fast & Simple Registration Form (Name, Email, Password Only) ── */}
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setIsPasswordFocused(false)}
                    placeholder="Your Full Name"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsPasswordFocused(false)}
                    placeholder="name@domain.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Create Password (6+ chars)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="Exactly 6 characters"
                    maxLength={6}
                    required
                    className="w-full pl-9 pr-14 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                  />
                  
                  {/* Show / Hide Toggle */}
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

              {/* Error Alert */}
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
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 via-[#DE5C2B] to-[#DE5C2B] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5 mt-1"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Account Created! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="mt-3 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Already registered?{' '}
                <Link to="/login" className="text-[#DE5C2B] font-bold hover:underline">
                  Sign in to your account
                </Link>
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default SignupPage;
