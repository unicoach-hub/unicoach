import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, CheckCircle2, AlertTriangle, Sparkles, X, 
  BookOpen, Layers, Check, Copy, ArrowRight, TrendingUp, RefreshCw, FileText
} from 'lucide-react';

const getBandColor = (band) => {
  const num = parseFloat(band) || 0;
  if (num >= 8.0) return { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 border-emerald-200 text-emerald-800', gradient: 'from-emerald-500 to-teal-600' };
  if (num >= 7.0) return { bg: 'bg-indigo-500', text: 'text-indigo-700', badge: 'bg-indigo-50 border-indigo-200 text-indigo-800', gradient: 'from-indigo-600 to-blue-600' };
  if (num >= 6.0) return { bg: 'bg-[#DE5C2B]', text: 'text-[#C04A1D]', badge: 'bg-orange-50 border-orange-200 text-blue-800', gradient: 'from-blue-600 to-cyan-600' };
  if (num >= 5.0) return { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 border-amber-200 text-amber-800', gradient: 'from-amber-500 to-orange-600' };
  return { bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 border-rose-200 text-rose-800', gradient: 'from-rose-500 to-red-600' };
};

const getBandDescriptor = (band) => {
  const num = parseFloat(band) || 0;
  if (num >= 8.5) return 'Expert / Native-level Academic User';
  if (num >= 7.5) return 'Very Good User — Meets 95%+ Top Global University Cutoffs';
  if (num >= 6.5) return 'Competent Academic User — Meets Standard University Requirements';
  if (num >= 5.5) return 'Modest User — Meets Select Foundation & Pathway Programs';
  return 'Limited User — Requires Pre-sessional English Language Prep';
};

const IeltsAiEvaluationModal = ({ isOpen, onClose, evaluation, essayPrompt, studentEssay, wordCount, onPracticeAgain }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !evaluation) return null;

  const band = evaluation.overallBand || 6.0;
  const colors = getBandColor(band);
  const descriptor = getBandDescriptor(band);

  const criteria = evaluation.criteria || {};
  const criteriaList = [
    {
      title: 'Task Achievement',
      key: 'taskAchievement',
      icon: <Award size={18} className="text-indigo-500" />,
      score: criteria.taskAchievement?.score ?? band,
      feedback: criteria.taskAchievement?.feedback || 'Evaluates prompt coverage and position.'
    },
    {
      title: 'Coherence & Cohesion',
      key: 'coherenceCohesion',
      icon: <Layers size={18} className="text-[#DE5C2B]" />,
      score: criteria.coherenceCohesion?.score ?? band,
      feedback: criteria.coherenceCohesion?.feedback || 'Evaluates logical flow and paragraph organization.'
    },
    {
      title: 'Lexical Resource',
      key: 'lexicalResource',
      icon: <BookOpen size={18} className="text-emerald-500" />,
      score: criteria.lexicalResource?.score ?? band,
      feedback: criteria.lexicalResource?.feedback || 'Evaluates vocabulary range and academic collocations.'
    },
    {
      title: 'Grammar & Accuracy',
      key: 'grammaticalAccuracy',
      icon: <TrendingUp size={18} className="text-purple-500" />,
      score: criteria.grammaticalAccuracy?.score ?? band,
      feedback: criteria.grammaticalAccuracy?.feedback || 'Evaluates sentence complexity and grammatical precision.'
    }
  ];

  const handleCopy = () => {
    const text = `IELTS Writing Evaluation
Overall Band: ${band} (${descriptor})
Task Achievement: ${criteria.taskAchievement?.score}
Coherence & Cohesion: ${criteria.coherenceCohesion?.score}
Lexical Resource: ${criteria.lexicalResource?.score}
Grammar & Accuracy: ${criteria.grammaticalAccuracy?.score}

Examiner Summary:
${evaluation.examinerSummary || ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-4 md:p-6 bg-slate-900/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="relative p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" /> Certified AI Examiner Assessment
              </span>
              <span className="text-xs font-bold text-slate-400">
                Word Count: {wordCount || evaluation.wordCountAnalysis?.count || 0} words
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              IELTS Writing Task 2 Evaluation
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium mt-1 line-clamp-1">
              {essayPrompt || 'Academic Writing Simulation'}
            </p>
          </div>

          {/* Body Content (Scrollable) */}
          <div 
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="p-6 md:p-8 space-y-8 overflow-y-auto overscroll-contain custom-scrollbar flex-1 bg-slate-50/50 touch-pan-y"
          >
            
            {/* Overall Band Banner */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Estimated Band Score</span>
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <span className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                    Band {band}
                  </span>
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-black border ${colors.badge}`}>
                    {band >= 7.0 ? '🌟 Highly Competitive' : band >= 6.0 ? '✅ Target Met' : '⚠️ Needs Practice'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600 mt-1">{descriptor}</p>
              </div>

              {evaluation.examinerSummary && (
                <div className="max-w-md p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 leading-relaxed">
                  <span className="font-black text-slate-900 block mb-1">👨‍🏫 Examiner Advice:</span>
                  {evaluation.examinerSummary}
                </div>
              )}
            </div>

            {/* 4 Official IELTS Criteria Cards */}
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Award size={16} className="text-indigo-600" /> Criteria Breakdown (Official Rubric)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criteriaList.map((item, idx) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-black text-sm text-slate-800">
                        {item.icon}
                        {item.title}
                      </div>
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Band {item.score}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      {item.feedback}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strengths & Actionable Improvements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                  <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.strengths.map((str, i) => (
                      <li key={i} className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100 space-y-3">
                  <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={16} className="text-amber-600" /> Actionable Fixes
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i} className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Vocabulary Power-Up Upgrades Table */}
            {evaluation.vocabularyUpgrades && evaluation.vocabularyUpgrades.length > 0 && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600" /> Band 8+ Vocabulary Upgrades
                </h4>
                <div className="space-y-2.5">
                  {evaluation.vocabularyUpgrades.map((vocab, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <span className="line-through text-rose-500 font-bold">{vocab.original}</span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span className="text-emerald-700 font-black">{vocab.improved}</span>
                      </div>
                      {vocab.context && (
                        <span className="text-[11px] font-medium text-slate-400 italic">
                          ({vocab.context})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Enhanced Model Rewrite */}
            {evaluation.enhancedSampleParagraph && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-100 space-y-3">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={15} className="text-indigo-600" /> Band 8.5+ Model Rewrite Sample
                </h4>
                <p className="text-xs font-medium text-slate-700 leading-relaxed italic bg-white/80 p-4 rounded-2xl border border-indigo-50">
                  "{evaluation.enhancedSampleParagraph}"
                </p>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-6 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
              {copied ? 'Copied Summary!' : 'Copy Evaluation'}
            </button>

            <div className="flex items-center gap-3">
              {onPracticeAgain && (
                <button
                  onClick={() => {
                    onClose();
                    onPracticeAgain();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} /> Practice Another Topic
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  ) : null;
};

export default IeltsAiEvaluationModal;
