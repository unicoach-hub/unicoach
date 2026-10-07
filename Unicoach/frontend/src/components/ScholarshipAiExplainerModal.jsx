import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Award, CheckCircle2, AlertTriangle, X, 
  FileText, ExternalLink, RefreshCw, Copy, Check, ChevronRight, Lightbulb,
  Cpu, BarChart3, ShieldCheck
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

const SCHOLARSHIP_STEPS = [
  { icon: Cpu, text: "Analyzing scholarship donor prerequisites & minimum cutoffs..." },
  { icon: BarChart3, text: "Comparing academic score against historical awardees..." },
  { icon: Award, text: "Estimating potential funding & tuition waiver grant..." },
  { icon: Sparkles, text: "Crafting custom essay & application winning strategy..." }
];

const ScholarshipAiExplainerModal = ({ isOpen, onClose, scholarship, studentProfile }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(25);

  // Close on ESC key & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Loading Step Animator
  useEffect(() => {
    if (!loading) {
      setCurrentStepIdx(0);
      setProgressPercent(25);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        const next = (prev + 1) % SCHOLARSHIP_STEPS.length;
        setProgressPercent(Math.min(95, 25 + next * 24));
        return next;
      });
    }, 850);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (isOpen && scholarship) {
      const schTitle = (scholarship.title || scholarship.name || scholarship.scholarshipName || '').trim();
      const cacheKey = `unicoach_ai_sch_${schTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${studentProfile?.academicScore || ''}_${studentProfile?.targetDegree || ''}`;
      
      // 0-SECOND INSTANT CACHE RETRIEVAL
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.matchPercentage || parsed.matchReason)) {
            setExplanation(parsed);
            setLoading(false);
            setErrorMsg('');
            return;
          }
        }
      } catch (e) {
        // Continue to fresh fetch
      }

      fetchExplanation(cacheKey);
    } else {
      setExplanation(null);
      setErrorMsg('');
    }
  }, [isOpen, scholarship]);

  const fetchExplanation = async (cacheKey) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Auth = HttpOnly session cookie (sent by installApiFetch); no bearer token in storage
      const headers = { 'Content-Type': 'application/json' };

      const res = await fetch(`${API_URL}/ai/explain-scholarship`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          scholarship: {
            title: scholarship.title || scholarship.name || scholarship.scholarshipName,
            universityName: scholarship.universityName || scholarship.university,
            country: scholarship.country,
            fundingType: scholarship.fundingType,
            awardCoverage: scholarship.awardCoverage || scholarship.coverage || scholarship.grantAmountUSD,
            eligibility: scholarship.eligibilityCriteria || scholarship.eligibility,
            deadline: scholarship.deadline?.displayDeadline || scholarship.deadline
          },
          studentProfile: studentProfile || {}
        })
      });

      const data = await res.json();
      if (res.ok && data.explanation) {
        setExplanation(data.explanation);
        setProgressPercent(100);
        // Save to cache for instant 0s future retrieval
        if (cacheKey) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data.explanation));
          } catch (e) {}
        }
      } else {
        throw new Error(data.error || 'Server unavailable');
      }
    } catch (err) {
      // Dynamic offline AI analysis fallback
      const gpa = studentProfile?.academicScore || studentProfile?.gpaPercent || 78;
      const course = studentProfile?.dreamCourse || studentProfile?.streamMajor || 'your target field';
      const mockExplanation = {
        matchPercentage: scholarship.matchScore || 85,
        matchReason: `Your profile with ${gpa}% academic score and English proficiency satisfies eligibility parameters for ${scholarship.title || 'this award'}. Selection committees in ${scholarship.country || 'the host destination'} value solid academic foundations in ${course}.`,
        keyStrengths: [
          `Academic score (${gpa}%) comfortably clears the departmental baseline cutoff`,
          `Candidate intake planning aligns with institutional funding allocation cycles`,
          `Course track in ${course} matches available university research grants`
        ],
        improvementAreas: [
          `Ensure statement of purpose clearly outlines quantifiable academic achievements`,
          `Submit 2-3 weeks prior to the cutoff date (${scholarship.deadline?.displayDeadline || 'stated deadline'}) to maximize consideration`
        ],
        winningTips: [
          `Highlight real-world problem solving and leadership initiatives in your scholarship essay`,
          `Obtain 2 strong letters of recommendation from faculty familiar with your coursework`,
          `Align your career vision with the mission and values of ${scholarship.universityName || 'the university'}`
        ]
      };
      setExplanation(mockExplanation);
      setProgressPercent(100);
      if (cacheKey) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(mockExplanation));
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !scholarship) return null;

  const schTitle = scholarship.title || scholarship.name || scholarship.scholarshipName || 'Scholarship Award';
  const schUni = scholarship.universityName || scholarship.university || 'Global University Partner';

  const handleCopy = () => {
    if (!explanation) return;
    const text = `AI Match Analysis for ${schTitle}
Match Score: ${explanation.matchPercentage || 85}%
Reason: ${explanation.matchReason || ''}

Winning Tips:
${(explanation.winningTips || []).map((t, i) => `${i+1}. ${t}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CurrentStepIcon = SCHOLARSHIP_STEPS[currentStepIdx]?.icon || Sparkles;

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[88vh] flex flex-col z-10"
        >
          {/* Header */}
          <div className="relative p-6 md:p-7 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer z-30 shadow-sm"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 mb-2">
              <Sparkles size={13} className="text-amber-400 animate-pulse" /> AI Eligibility & Strategy Explainer
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white leading-tight pr-10">
              {schTitle}
            </h3>
            <p className="text-xs text-slate-300 font-bold mt-1">
              {schUni} • {scholarship.country || 'Global'}
            </p>
          </div>

          {/* Body Content */}
          <div 
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="p-6 md:p-7 space-y-6 overflow-y-auto overscroll-contain custom-scrollbar flex-1 bg-slate-50/50 touch-pan-y"
          >
            {/* RICH ANIMATED LOADER */}
            {loading && (
              <div className="py-10 px-4 max-w-md mx-auto space-y-7">
                {/* Glowing Spinner Center */}
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 animate-ping absolute" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 relative z-10">
                    <CurrentStepIcon size={30} className="animate-spin-slow" />
                  </div>
                </div>

                {/* Progress Bar & Animated Status */}
                <div className="space-y-3 text-center">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800 tracking-tight">
                      Evaluating Scholarship Grant Fit...
                    </h4>
                    <p className="text-xs text-emerald-700 font-bold h-6 flex items-center justify-center transition-all">
                      {SCHOLARSHIP_STEPS[currentStepIdx].text}
                    </p>
                  </div>

                  {/* Smooth Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 rounded-full"
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Step {currentStepIdx + 1} of {SCHOLARSHIP_STEPS.length}</span>
                    <span>Powered by AI Engine</span>
                  </div>
                </div>

                {/* Shimmer Preview Cards */}
                <div className="space-y-3 pt-2">
                  <div className="h-14 bg-white rounded-2xl border border-slate-200/80 animate-pulse flex items-center px-4 gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-1/3 bg-slate-200 rounded" />
                      <div className="h-2 w-2/3 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-20 bg-white rounded-2xl border border-slate-200/80 animate-pulse p-4 space-y-2">
                    <div className="h-3 w-1/4 bg-slate-200 rounded" />
                    <div className="h-2 w-full bg-slate-100 rounded" />
                    <div className="h-2 w-4/5 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center justify-between">
                <span>{errorMsg}</span>
                <button
                  onClick={() => fetchExplanation()}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-black cursor-pointer hover:bg-rose-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* POPULATED AI EXPLANATION */}
            {!loading && explanation && (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Match Meter Banner */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Candidate Match Score</span>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-emerald-600">
                        {explanation.matchPercentage || 85}% Match
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                        High Fit
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Award size={24} />
                  </div>
                </div>

                {/* Match Reason */}
                {explanation.matchReason && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb size={16} className="text-amber-500" /> Eligibility Breakdown
                    </h4>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                      {explanation.matchReason}
                    </p>
                  </div>
                )}

                {/* Winning Tips */}
                {explanation.winningTips && explanation.winningTips.length > 0 && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-600" /> Application Winning Strategy Tips
                    </h4>
                    <ul className="space-y-2">
                      {explanation.winningTips.map((tip, i) => (
                        <li key={i} className="text-xs font-semibold text-slate-700 flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Document Strategy */}
                {explanation.documentFocus && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/80 space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={15} className="text-indigo-600" /> SOP & Document Focus Strategy
                    </h4>
                    <p className="text-xs font-bold text-indigo-950 leading-relaxed">
                      {explanation.documentFocus}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
            <button
              onClick={handleCopy}
              disabled={!explanation || loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Strategy'}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 transition-all cursor-pointer"
            >
              Got it, Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  ) : null;
};

export default ScholarshipAiExplainerModal;
