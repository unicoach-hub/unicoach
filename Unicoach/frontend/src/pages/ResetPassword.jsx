import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, openLoginModal } = useAuth();

  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !id) {
      setError('Invalid or expired password reset link. Please request a new one.');
    }
  }, [token, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !id) {
      setError('Missing reset token or user ID.');
      return;
    }

    if (newPassword.length !== 6) {
      setError('Password must be exactly 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await resetPassword({ token, id, newPassword });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10 relative overflow-hidden"
      >
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-[#DE5C2B] to-amber-500" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-black tracking-tight text-slate-800">
              Uni<span className="text-[#DE5C2B]">Coach</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {success ? 'Password Reset Complete' : 'Create New Password'}
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1.5">
            {success 
              ? 'Your password has been securely updated' 
              : 'Please enter a strong password for your UniCoach account'}
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              All set! You can now log into your account with your newly configured password.
            </p>

            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => openLoginModal(), 300);
              }}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all text-sm cursor-pointer"
            >
              Sign In to UniCoach →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Exactly 6 characters"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3.5 pr-12 border-2 border-slate-200 rounded-2xl bg-white text-slate-800 font-bold text-sm outline-none focus:border-[#DE5C2B] transition-colors placeholder:font-normal placeholder-slate-400"
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

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3.5 pr-12 border-2 border-slate-200 rounded-2xl bg-white text-slate-800 font-bold text-sm outline-none focus:border-[#DE5C2B] transition-colors placeholder:font-normal placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer select-none"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token || !id}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Password...' : 'Save & Update Password'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/"
                className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
