import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import brandLogo from '@/assets/blackunicoachlogo.webp';

const LoginModal = () => {
  const {
    loginModalOpen,
    loginModalOptions,
    closeLoginModal,
    loginWithEmail,
    registerWithEmail,
    forgotPassword,
    loginWithGoogle
  } = useAuth();

  const navigate = useNavigate();

  // Modes: 'signin' | 'signup' | 'forgot' (no phone/OTP sign-in: email + password or Google only)
  const [mode, setMode] = useState('signin');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  // Status
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loginModalOpen) {
      setMode('signin');
      setName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setError('');
      setSuccessMsg('');
      setLoading(false);
    }
  }, [loginModalOpen]);

  const handlePostAuthSuccess = (user) => {
    if (loginModalOptions?.onSuccess) {
      loginModalOptions.onSuccess(user);
    } else if (!loginModalOptions?.preventRedirect && window.location.pathname !== '/universities') {
      navigate('/dashboard');
    }
  };

  // 1. Handle Email Login
  const handleEmailLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }
    setError('');
    setLoading(true);

    const result = await loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      handlePostAuthSuccess(result.user);
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  // 2. Handle Email Registration
  const handleEmailRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length !== 6) {
      setError('Password must be exactly 6 characters');
      return;
    }
    setError('');
    setLoading(true);

    const result = await registerWithEmail({ name, email, password });
    setLoading(false);

    if (result.success) {
      handlePostAuthSuccess(result.user);
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  // 3. Handle Forgot Password
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Reset link sent! Please check your inbox (and spam folder) for instructions to reset your password.');
    } else {
      setError(result.message || 'Failed to dispatch reset link');
    }
  };

  // 4. Handle Google OAuth Success
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google did not return credentials. Please try again.');
      return;
    }
    setError('');
    setLoading(true);

    const result = await loginWithGoogle(credentialResponse.credential);
    setLoading(false);

    if (result.success) {
      handlePostAuthSuccess(result.user);
    } else {
      setError(result.message || 'Google sign-in failed');
    }
  };

  // Google renders its button in a fixed-width iframe; match it to the form width (Google caps it at 400px)
  const [googleWidth, setGoogleWidth] = useState(360);
  const measureGoogleSlot = useCallback((node) => {
    if (node) setGoogleWidth(Math.min(400, Math.max(200, Math.floor(node.getBoundingClientRect().width))));
  }, []);

  if (!loginModalOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold z-10"
        >
          ✕
        </button>

        <AnimatePresence mode="wait">
          {/* ========================================================= */}
          {/* VIEW 1: SIGN IN                                           */}
          {/* ========================================================= */}
          {mode === 'signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="text-center pt-2">
                <img src={brandLogo} alt="UniCoach" className="h-7 w-auto mx-auto object-contain" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-4">
                  {loginModalOptions?.title || 'Welcome Back'}
                </h2>
                <p className="text-[13px] text-slate-500 font-medium mt-1">
                  {loginModalOptions?.subtitle || 'Sign in to access shortlists, SOP tools & applications'}
                </p>
              </div>

              {/* 1-Click Social Sign-in Options */}
              <div className="space-y-2.5 pt-1">
                {/* Google 1-Click Button */}
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

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] uppercase font-black tracking-widest text-slate-400 absolute">
                  or sign in with email
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailLoginSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setMode('forgot');
                      }}
                      className="text-[11px] font-bold text-[#DE5C2B] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer select-none"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-bold bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white font-bold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer text-sm tracking-wide"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Bottom Switcher */}
              <div className="text-center pt-2 space-y-2">
                <p className="text-xs text-slate-500 font-semibold">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setMode('signup');
                    }}
                    className="text-[#DE5C2B] font-bold hover:underline cursor-pointer"
                  >
                    Sign up free
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: SIGN UP (REGISTRATION)                            */}
          {/* ========================================================= */}
          {mode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="text-center pt-2">
                <img src={brandLogo} alt="UniCoach" className="h-7 w-auto mx-auto object-contain" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-4">
                  Create Your Account
                </h2>
                <p className="text-[13px] text-slate-500 font-medium mt-1">
                  Join 25,000+ students planning their international degrees
                </p>
              </div>

              {/* 1-Click Google Sign-up */}
              <div className="flex justify-center w-full pt-1">
                <div ref={measureGoogleSlot} className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google sign-up failed.')}
                    shape="pill"
                    size="large"
                    text="signup_with"
                    theme="outline"
                    width={googleWidth}
                  />
                </div>
              </div>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] uppercase font-black tracking-widest text-slate-400 absolute">
                  or sign up with email
                </span>
              </div>

              <form onSubmit={handleEmailRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Exactly 6 characters"
                      maxLength={6}
                      required
                      className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer select-none"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-bold bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white font-bold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer text-sm tracking-wide"
                >
                  {loading ? 'Creating Account...' : 'Create Free Account'}
                </button>
              </form>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500 font-semibold">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setMode('signin');
                    }}
                    className="text-[#DE5C2B] font-bold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: FORGOT PASSWORD                                   */}
          {/* ========================================================= */}
          {mode === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="text-center pt-2">
                <div className="w-12 h-12 bg-orange-50 text-[#DE5C2B] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Reset Password
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">
                  Enter your registered email address and we'll send you a secure link to create a new password.
                </p>
              </div>

              {successMsg ? (
                <div className="space-y-5 text-center">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-semibold leading-relaxed">
                    <p className="font-bold text-sm text-emerald-900 mb-1">Check your inbox 📬</p>
                    {successMsg}
                  </div>

                  <button
                    onClick={() => {
                      setSuccessMsg('');
                      setError('');
                      setMode('signin');
                    }}
                    className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all text-xs cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:font-normal placeholder-slate-400"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-bold bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white font-bold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer text-sm tracking-wide"
                  >
                    {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setMode('signin');
                      }}
                      className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default LoginModal;
