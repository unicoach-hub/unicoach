import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Sparkles, Send, Phone, Mail, User } from 'lucide-react';

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle?: string;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({ isOpen, onClose, serviceTitle }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: 'USA',
    degree: 'Masters',
    intake: 'Fall 2026',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // Reset state after closing delay
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-[#0f0d15] border border-white/15 rounded-3xl p-6 md:p-8 text-white shadow-2xl z-10 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {submitted ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle2 size={42} />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Application Received!</h3>
                <p className="text-white/70 max-w-md text-sm leading-relaxed mb-4">
                  Thank you, <span className="text-white font-semibold">{formData.name}</span>. An expert UniCoach counsellor will reach out to you within 24 hours.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Free Shortlisting Assessment Unlocked</span>
                </div>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
                    <Sparkles size={13} />
                    <span>Free Profile Evaluation</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold font-instrument tracking-wide">
                    {serviceTitle ? `Check Eligibility: ${serviceTitle}` : 'Check Your Study Abroad Eligibility'}
                  </h3>
                  <p className="text-white/60 text-xs md:text-sm mt-1">
                    Get an instant AI profile match & 1-on-1 expert consultation at zero cost.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1.5">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="ananya@gmail.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1.5">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1.5">Target Country</label>
                      <select
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        className="w-full bg-[#16121f] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="USA">USA 🇺🇸</option>
                        <option value="UK">UK 🇬🇧</option>
                        <option value="Canada">Canada 🇨🇦</option>
                        <option value="Australia">Australia 🇦🇺</option>
                        <option value="Germany">Germany 🇩🇪</option>
                        <option value="Ireland">Ireland 🇮🇪</option>
                        <option value="France">France 🇫🇷</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1.5">Degree Level</label>
                      <select
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full bg-[#16121f] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="Masters">Masters (MS/MBA)</option>
                        <option value="Bachelors">Bachelors (BS/BA)</option>
                        <option value="PhD">PhD / Doctorate</option>
                        <option value="Diploma">PG Diploma</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1.5">Target Intake</label>
                      <select
                        value={formData.intake}
                        onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                        className="w-full bg-[#16121f] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="Fall 2026">Fall 2026</option>
                        <option value="Spring 2027">Spring 2027</option>
                        <option value="Fall 2027">Fall 2027</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm tracking-wide button-glow cursor-pointer"
                  >
                    <span>Submit & Get Free Assessment</span>
                    <Send size={16} />
                  </button>

                  <p className="text-[11px] text-center text-white/40">
                    🔒 Your details are 100% confidential. No spam guaranteed.
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
