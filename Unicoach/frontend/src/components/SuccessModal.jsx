import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLead } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SuccessModal = () => {
  const { isSubmitted, closeModal } = useLead();
  const { user } = useAuth() || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (isSubmitted) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isSubmitted]);

  if (!isSubmitted) return null;

  const handleGotIt = () => {
    closeModal(); // Resets the lead modal states
    // A form submission is not a sign-in: only signed-in students go on to their dashboard
    if (user) navigate('/dashboard');
  };

  const modalContent = (
    <div data-lenis-prevent className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-4">
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] bg-slate-950/75 backdrop-blur-md cursor-pointer" onClick={handleGotIt} />
      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 mx-4 text-center overscroll-contain"
      >
        {/* Checkmark */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set! 🎉</h2>
        <p className="text-gray-500 mb-6">
          Thank you for your interest! Our counsellor will contact you within 24 hours to guide you through your study abroad journey.
        </p>
        <button
          onClick={handleGotIt}
          className="w-full py-3.5 bg-[#4f46e5] text-white font-semibold rounded-xl hover:bg-[#4338ca] transition-all cursor-pointer"
        >
          Got it!
        </button>
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default SuccessModal;
