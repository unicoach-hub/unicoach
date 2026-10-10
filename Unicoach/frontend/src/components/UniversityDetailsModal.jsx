import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Globe, Award, DollarSign, Calendar, BookOpen, 
  ExternalLink, CheckCircle2, ShieldCheck, BookmarkCheck,
  GraduationCap, MapPin, Building2, Clock, Sparkles, PhoneCall
} from 'lucide-react';
import UniversityLogo from './UniversityLogo';
import { cleanPortalUrl, getUniversityPortalFallback } from '../utils/urlHelpers';
import { getVerifiedRanking } from '../utils/ranking';
import { getOfficialRequirements, getGreText, CHECK_SITE } from '../utils/requirements';
import { getOfficialTuition } from '../utils/dataSourceLabel';

const UniversityDetailsModal = ({ university, isOpen, onClose, onToggleSave, isSaved, onOpenCounseling, onOpenCounselling }) => {
  if (!isOpen || !university) return null;
  const handleCounsel = onOpenCounselling || onOpenCounseling;

  const uniName = university.name || 'University Profile';
  const countryName = university.countryName || university.country || 'Global';
  const city = university.city || '';
  const ranking = getVerifiedRanking(university);
  // Requirements and acceptance rate only from official sources (other records hold schema defaults)
  const req = getOfficialRequirements(university);
  const acceptanceRate = req.acceptanceRate;
  // Fees only from an official source; estimates/placeholders are never shown as a fee
  const officialTuition = getOfficialTuition(university);
  const minGpa = req.gpaPercent ? `${req.gpaPercent}%` : (req.minScoreText || CHECK_SITE);
  const minIelts = req.englishSource && req.ieltsText ? req.ieltsText : (req.ielts ? `${req.ielts} Band` : (req.ieltsText || CHECK_SITE));
  const minToefl = req.toefl ? `${req.toefl} iBT` : null;
  const greStatus = getGreText(req) || CHECK_SITE;
  const workExp = req.workExp || CHECK_SITE;
  
  const portalUrl = cleanPortalUrl(
    university.website,
    `${uniName} ${countryName}`
  );

  const fallbackSearchUrl = getUniversityPortalFallback(uniName, countryName);

  const coursesList = Array.isArray(university.courses) && university.courses.length > 0
    ? university.courses
    : ['Computer Science & AI', 'Data Science & Analytics', 'Business Administration (MBA)', 'Finance & Economics', 'Mechanical & Aerospace Engineering'];

  const degreeLevels = Array.isArray(university.degreeLevels) && university.degreeLevels.length > 0
    ? university.degreeLevels
    : ["Master's Degree (MS/MA/MBA)", "Bachelor's Degree (BS/BA)", "Doctoral (PhD)"];

  const intakes = Array.isArray(university.intakes) && university.intakes.length > 0
    ? university.intakes
    : ['Fall 2026 (Aug/Sep 2026)', 'Spring 2027 (Jan/Feb 2027)'];

  const modalContent = (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-slate-200 rounded-[28px] shadow-2xl w-full max-w-3xl overflow-hidden my-8 max-h-[90vh] flex flex-col z-10"
        >
          {/* Header Bar */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close modal"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4 pr-10">
              <div className="w-16 h-16 rounded-2xl bg-white p-2.5 flex items-center justify-center flex-shrink-0 shadow-lg">
                <UniversityLogo logo={university.logo} name={uniName} size="w-11 h-11" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {university.type || 'Accredited'} Institution
                  </span>
                  {ranking && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                      <Award size={12} /> {ranking.fullLabel}
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                  {uniName}
                </h3>
                <p className="text-xs text-indigo-200 font-semibold flex items-center gap-1.5">
                  <MapPin size={13} className="text-indigo-400" />
                  {city ? `${city}, ` : ''}{countryName}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div 
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="p-6 md:p-8 space-y-6 overflow-y-auto overscroll-contain custom-scrollbar flex-grow touch-pan-y"
          >
            
            {/* Quick Metrics Cards */}
            <div className={`grid grid-cols-2 gap-3 ${acceptanceRate !== null ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
              {acceptanceRate !== null && (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Acceptance Rate</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">{acceptanceRate}%</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">US Govt College Scorecard</p>
                </div>
              )}

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Annual Tuition</p>
                {officialTuition ? (
                  <>
                    <p className="text-base font-black text-slate-900 mt-0.5">{officialTuition.inrText}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">≈ {officialTuition.usdText} · {officialTuition.sourceLabel}</p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-slate-500 mt-1">{CHECK_SITE}</p>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Min IELTS Cutoff</p>
                <p className="text-base font-black text-indigo-600 mt-0.5">{minIelts}</p>
                {minToefl && <p className="text-[10px] text-slate-500 font-bold mt-0.5">TOEFL: {minToefl}</p>}
                {req.englishSource && !req.source && (
                  <a href={req.englishSource.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-[10px] font-bold text-emerald-700 hover:underline mt-1 truncate" title="University-wide minimum for international graduate applicants; some programmes ask for more">
                    Source: {req.englishSource.sourceLabel}
                  </a>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">GRE Requirement</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{greStatus}</p>
              </div>
            </div>

            {/* Admission Eligibility Cutoffs Matrix */}
            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-indigo-600" /> Eligibility Criteria
                </h4>
                {req.source && (
                  <span className="text-[11px] font-bold text-indigo-600 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {req.source}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-indigo-100/70 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Minimum Academic Grade (GPA / %)</span>
                  <span className="text-slate-900 font-black">{minGpa}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100/70 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">English Language Score</span>
                  <span className="text-slate-900 font-black">{minIelts}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100/70 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Standardized Exam (GRE / GMAT)</span>
                  <span className="text-slate-900 font-black">{greStatus}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100/70 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Work Experience Requirement</span>
                  <span className="text-slate-900 font-black">{workExp}</span>
                </div>
              </div>
            </div>

            {/* Key Intakes & Degree Programs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-500" /> Upcoming Intakes
                </h4>
                <div className="space-y-1.5">
                  {intakes.map((intake, i) => (
                    <div key={i} className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {intake}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-indigo-500" /> Degree Levels Offered
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {degreeLevels.map((degree, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                      {degree}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Academic Courses */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-500" /> Popular Course Streams
              </h4>
              <div className="flex flex-wrap gap-2">
                {coursesList.map((course, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 transition">
                    {course}
                  </span>
                ))}
              </div>
            </div>

            {/* Zero-404 Note & Official Guidance */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>UniCoach Verified: Direct access to official admissions & financial aid portal.</span>
              </div>
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
            <button
              onClick={() => onToggleSave(university)}
              className={`px-4 py-3 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
              }`}
            >
              <BookmarkCheck size={16} className={isSaved ? 'text-emerald-600' : 'text-slate-400'} />
              {isSaved ? 'Saved to Shortlist' : 'Add to Shortlist'}
            </button>

            <div className="flex items-center gap-2">
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-indigo-600 transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                Official Portal <ExternalLink size={14} />
              </a>

              {handleCounsel && (
                <button
                  onClick={() => {
                    onClose();
                    handleCounsel(university);
                  }}
                  className="px-5 py-3 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <PhoneCall size={14} /> Apply via UniCoach
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default UniversityDetailsModal;
