import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, GraduationCap, CheckCircle2, Star, Calendar, Clock, DollarSign, 
  ExternalLink, Sparkles, MessageCircle, ArrowRight, ShieldCheck, 
  Share2, BookmarkCheck, Building, Globe, MapPin, Award, Info,
  Briefcase, Send, ChevronRight, FileCheck, Check
} from 'lucide-react';
import UniversityLogo from './UniversityLogo';
import { getCountryMeta, getUniversityBadges } from '../utils/courseFinderHelper';
import { getVerifiedRanking } from '../utils/ranking';
import { getOfficialRequirements, getGreText, CHECK_SITE } from '../utils/requirements';
import { getMentorsForCourseAndUni } from '../data/courseMentors';
import MentorBookingModal from './MentorBookingModal';

const CourseAndMentorDrawer = ({
  isOpen = false,
  onClose,
  data = null, // { program, university }
  onOpenDmModal,
  onSaveUni,
  isUniSaved = false
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [selectedMentorForChat, setSelectedMentorForChat] = useState(null);
  const [bookingMentor, setBookingMentor] = useState(null);

  const program = data?.program;
  const uni = data?.university;

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!program || !uni) return null;

  const countryMeta = getCountryMeta(uni.countryName || uni.country);
  const badges = getUniversityBadges(uni);
  const ranking = getVerifiedRanking(uni);
  const req = getOfficialRequirements(uni);
  const greText = getGreText(req);
  const mentors = getMentorsForCourseAndUni(uni, program);

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToFullCoursePage = () => {
    onClose();
    const params = new URLSearchParams({
      courseId: program.id,
      uniId: uni._id || uni.id || '',
      title: program.title,
      uniName: uni.name
    });
    navigate(`/course-details?${params.toString()}`);
  };

  const handleStartMentorChat = (mentor) => {
    const message = `Hi ${mentor.name}! I found your profile on UniCoach for ${program.title} at ${uni.name}. I'm planning my application for ${program.intake} intake and would love your guidance!`;
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=919876543210&text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBookMentorCall = (mentor) => {
    setBookingMentor(mentor);
  };

  const drawerContent = (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[999999] flex justify-end w-screen h-screen min-h-[100dvh]">
          {/* Backdrop Blur Overlay covering 100% of viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 w-screen h-screen min-h-[100dvh] bg-slate-900/70 backdrop-blur-xs transition-opacity cursor-pointer"
          />

          {/* Slide-Over Drawer Container */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full sm:max-w-xl md:max-w-2xl bg-[#F8FAFC] h-full shadow-2xl z-10 flex flex-col overflow-hidden border-l border-slate-200"
          >
            {/* 1. STICKY TOP APP BAR */}
            <div className="bg-white px-5 py-4 border-b border-slate-200/90 flex items-center justify-between gap-3 shrink-0 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                  <UniversityLogo logo={uni.logo} name={uni.name} size="w-7 h-7" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                    <span>{countryMeta.name}</span>
                    {countryMeta.flagUrl && (
                      <img src={countryMeta.flagUrl} alt="" className="w-3.5 h-2.5 rounded-[2px] object-cover inline" />
                    )}
                    <span>•</span>
                    <span className="text-blue-600 font-extrabold">{program.degreeLevel || 'PG Degree'}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 truncate leading-snug">
                    {uni.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Share program link"
                >
                  {copied ? <Check size={17} className="text-emerald-600" /> : <Share2 size={17} />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close panel (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 2. SCROLLABLE BODY CONTENT */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {/* COURSE HERO BANNER */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-100 text-[#C04A1D] border border-orange-200">
                    {program.degreeLevel === 'UG' ? "Bachelor's Program" : "Master's Program"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {program.status || 'Admissions Open'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Intake: {program.intake}
                  </span>
                  {ranking && (
                    <span title={ranking.fullLabel} className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {ranking.shortLabel}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {program.title}
                </h1>

                <p className="text-xs text-slate-500 font-medium">
                  {uni.name} • {uni.city || uni.state || countryMeta.name}, {countryMeta.name} {countryMeta.flag}
                </p>

                {/* 4-COLUMN FINANCIAL & TIMELINE STATS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tuition Fee</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900">{program.tuitionPerYear}</span>
                  </div>
                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Duration</span>
                    <span className="text-xs sm:text-sm font-black text-slate-800">{program.durationText}</span>
                  </div>
                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Scholarship</span>
                    <span className="text-xs sm:text-sm font-black text-purple-700 truncate block">{program.avgScholarship || 'Check official site'}</span>
                  </div>
                  <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">App Fee</span>
                    <span className={`text-xs sm:text-sm font-black ${program.applicationFee?.includes('No') ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {program.applicationFee}
                    </span>
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════════
                  STAR COMPONENT: VERIFIED ALUMNI & STUDENT MENTORS
              ══════════════════════════════════════════════════════════ */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#DE5C2B] flex items-center justify-center font-bold">
                      <GraduationCap size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <span>Verified Alumni & Student Mentors</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-orange-500 text-white">
                          {mentors.length} Available
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Connect with seniors who cracked admission into {uni.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mentor Cards List */}
                <div className="space-y-3">
                  {mentors.map((m) => (
                    <div 
                      key={m.id}
                      className="bg-white rounded-2xl border border-orange-200/80 hover:border-orange-300 p-4 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Avatar with active online ring */}
                        <div className="relative shrink-0">
                          <img 
                            src={m.avatar} 
                            alt={m.name} 
                            className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs" 
                          />
                          <span 
                            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" 
                            title="Active & Ready to help"
                          />
                        </div>

                        {/* Mentor Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                                <span>{m.name}</span>
                                <ShieldCheck size={14} className="text-blue-600" title="UniCoach Verified Alumni" />
                              </h4>
                              <p className="text-[11px] font-semibold text-slate-500">
                                {m.batch} • {m.status}
                              </p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-black shrink-0">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              <span>{m.rating}</span>
                              <span className="text-amber-600 font-normal">({m.sessionsCount})</span>
                            </div>
                          </div>

                          {/* Role / Achievement Pill */}
                          <div className="pt-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              <Briefcase size={11} className="text-slate-500" />
                              {m.currentRole}
                            </span>
                          </div>

                          {/* Bio Snippet */}
                          <p className="text-[11px] text-slate-600 font-normal leading-relaxed line-clamp-2 pt-1">
                            "{m.bio}"
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                            {m.badges.map((bg, bIdx) => (
                              <span 
                                key={bIdx}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200"
                              >
                                {bg}
                              </span>
                            ))}
                          </div>

                          {/* Direct Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-2.5">
                            <button
                              type="button"
                              onClick={() => handleStartMentorChat(m)}
                              className="px-3 py-2 rounded-xl text-xs font-bold bg-[#DE5C2B] hover:bg-[#C04A1D] text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <MessageCircle size={14} />
                              <span>Quick Chat</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBookMentorCall(m)}
                              className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <Calendar size={14} className="text-slate-500" />
                              <span>Book 15m Call</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ADMISSION & ELIGIBILITY CRITERIA CARD */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Admission Requirements & Cutoffs</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Minimum Academic Score</span>
                    <span className="font-bold text-slate-900">{req.gpaPercent ? `${req.gpaPercent}%` : (req.minScoreText || CHECK_SITE)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">English Proficiency (IELTS)</span>
                    <span className="font-bold text-slate-900">{req.ielts ? `Overall ${req.ielts}` : (req.ieltsText || CHECK_SITE)}</span>
                  </div>
                  <div className={`flex items-center justify-between py-1.5${req.source ? ' border-b border-slate-100' : ''}`}>
                    <span className="text-slate-500 font-medium">GRE / GMAT Requirement</span>
                    <span className="font-bold text-slate-900">{greText || CHECK_SITE}</span>
                  </div>
                  {req.source && (
                    <p className="pt-1 text-[10.5px] text-slate-400 font-medium">Source: {req.source}</p>
                  )}
                </div>
              </div>

              {/* POST-GRADUATION SALARY & PLACEMENT OUTLOOK */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-100 p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-blue-900">
                  <Award size={16} className="text-blue-600" />
                  <span>Career & Placement Assistance Guarantee</span>
                </div>
                <p className="text-[11.5px] text-blue-800/90 leading-relaxed">
                  UniCoach students get direct resume referral reviews from our alumni working across Google, SAP, BMW, Deloitte UK, and Amazon. Average starter package ranges between <strong>{countryMeta.currency === 'EUR' ? '€52,000 - €70,000' : countryMeta.currency === 'GBP' ? '£36,000 - £48,000' : '$85,000 - $110,000'}</strong>.
                </p>
              </div>
            </div>

            {/* 3. STICKY BOTTOM ACTIONS */}
            <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => onSaveUni && onSaveUni(uni)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isUniSaved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <BookmarkCheck size={14} className={isUniSaved ? 'text-emerald-600' : 'text-slate-400'} />
                <span>{isUniSaved ? 'Shortlisted' : 'Shortlist'}</span>
              </button>

              <button
                type="button"
                onClick={handleGoToFullCoursePage}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>View Full Course Syllabus & Modules</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>

    {/* 1:1 Mentor Booking Modal */}
    {Boolean(bookingMentor) && (
      <MentorBookingModal
        isOpen={Boolean(bookingMentor)}
        onClose={() => setBookingMentor(null)}
        mentor={bookingMentor}
        course={program}
        university={uni}
      />
    )}
  </>
);

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};

export default CourseAndMentorDrawer;
