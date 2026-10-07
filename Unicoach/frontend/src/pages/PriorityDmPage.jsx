import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Shield, Sparkles, Loader2, User, Mail, Phone, HelpCircle, ArrowLeft, Check, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUPPORT_CATEGORIES } from '../components/PriorityDmModal';
import { API_BASE_URL } from '../config';
import { TEAM_MENTORS } from '../utils/teamMentors';

const PriorityDmPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const API_URL = API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in all required fields marked with *');
      return;
    }
    if (!formData.category) {
      setError('Please select what you would like support with.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_URL}/support-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit request.');
      }

      setSubmitted(true);
    } catch (err) {
      // Keep everything they typed so nothing is lost, and ask them to try again
      setError(err.message || 'We could not send your message. Please try again in a minute.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Warm Atmospheric Background */}
      <div className="absolute top-[-5%] right-[5%] w-[500px] h-[450px] bg-radial from-[#FFE3D1]/50 via-[#FFF0E5]/30 to-transparent rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[450px] h-[400px] bg-radial from-[#FFEDDF]/40 via-[#FFF5ED]/25 to-transparent rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-500 hover:text-[#DE5C2B] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* ════════ Left Context Column ════════ */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FED7CE]/30 border border-[#DE5C2B]/20 text-[#DE5C2B] text-[10.5px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Counsellor Desk</span>
            </div>

            <h1 className="font-outfit text-[32px] sm:text-[38px] font-black text-[#111111] tracking-[-0.02em] leading-[1.12]">
              Send Priority DM to{' '}
              <span className="relative inline-block">
                Senior Advisors
                <span className="absolute -bottom-1 left-0 w-full h-[6px] bg-[#FED7CE] rounded-full -z-10" />
              </span>
            </h1>

            <p className="text-[13.5px] text-slate-600 leading-relaxed max-w-[380px]">
              Skip the queue. Submit your specific visa, admission, or job roadmap inquiry directly to our senior international counsellors and immigration consultants.
            </p>

            {/* Value Points */}
            <div className="space-y-4 pt-1">
              {[
                'Guaranteed response from senior specialists within 2–4 hours',
                'Personalized assessment for University Shortlisting, Scholarships, and Visa Roadmap',
                '100% confidential profile and documentation review',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="text-[12.5px] text-slate-700 font-medium leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            {/* Trust Avatars */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {TEAM_MENTORS.map((mentor) => (
                  <img key={mentor.src} src={mentor.src} alt={mentor.name} title={mentor.name} className="w-8 h-8 rounded-full border-2 border-[#FAF9F6] object-cover shadow-sm" />
                ))}
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#111111]">Senior Advisory Team</p>
                <p className="text-[10px] text-slate-400">Typically responds within 2 hours</p>
              </div>
            </div>
          </div>

          {/* ════════ Right Form Card ════════ */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-xl shadow-black/[0.04] border border-orange-100/50 relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FED7CE] via-[#DE5C2B] to-[#FED7CE]" />

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-14 text-center flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/25">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="font-outfit text-[24px] font-black text-[#111111]">
                    Priority Request Sent!
                  </h3>
                  <p className="text-[13px] text-slate-600 max-w-sm mt-2.5 leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. Your priority DM regarding{' '}
                    <span className="font-bold text-[#DE5C2B]">{formData.category}</span> has been dispatched to our senior advisory queue. We will contact you at <strong>{formData.email}</strong> shortly.
                  </p>
                  <Link
                    to="/"
                    className="mt-7 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#111111] hover:bg-black text-white text-[13px] font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Return to Home
                  </Link>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-semibold">
                      {error}
                    </div>
                  )}

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11.5px] font-bold text-[#111111] mb-1.5">
                        Full name <span className="text-[#DE5C2B]">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-[#FED7CE]/40 text-[13px] text-[#111111] placeholder:text-slate-400 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-bold text-[#111111] mb-1.5">
                        Email address <span className="text-[#DE5C2B]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-[#FED7CE]/40 text-[13px] text-[#111111] placeholder:text-slate-400 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#111111] mb-1.5">
                      Phone number <span className="text-[#DE5C2B]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+91 ... or +1 ..."
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-[#FED7CE]/40 text-[13px] text-[#111111] placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-1.5 pl-1">
                      Please include your country code (e.g. +91 for India, +1 for USA/Canada, +44 for UK).
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#111111] mb-1.5">
                      What would you like support with? <span className="text-[#DE5C2B]">*</span>
                    </label>
                    <div className="relative">
                      <HelpCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-[#FED7CE]/40 text-[13px] text-[#111111] outline-none transition-all cursor-pointer appearance-none"
                      >
                        <option value="" disabled>
                          Choose an option
                        </option>
                        {SUPPORT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#111111] mb-1.5">
                      Please explain your situation
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Share any details that will help us understand your case (e.g. current visa, intake, university, job role). This field is optional."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#DE5C2B] focus:ring-2 focus:ring-[#FED7CE]/40 text-[13px] text-[#111111] placeholder:text-slate-400 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#111111] hover:bg-black text-white font-bold text-[13.5px] shadow-[0_10px_24px_-4px_rgba(0,0,0,0.22)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.30)] hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Sending Priority Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#FED7CE]" />
                          <span>Send my request</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-orange-100/60 flex items-center gap-2 text-[10.5px] text-slate-400">
                    <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Your details are used only to respond to your enquiry. We never share them with third parties.
                    </span>
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

export default PriorityDmPage;
