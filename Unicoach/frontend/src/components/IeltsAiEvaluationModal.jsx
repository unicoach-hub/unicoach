import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, CheckCircle2, AlertTriangle, Sparkles, X,
  BookOpen, Layers, Check, Copy, ArrowRight, TrendingUp, RefreshCw
} from 'lucide-react';

// Flat Desi Pop colour per band: chip background + text that reads on it
const getBandColor = (band) => {
  const num = parseFloat(band) || 0;
  if (num >= 8.0) return { bg: '#14837E', fg: '#FFFFFF' };
  if (num >= 7.0) return { bg: '#2B3FA0', fg: '#FFFFFF' };
  if (num >= 6.0) return { bg: '#DE5C2B', fg: '#FFFFFF' };
  if (num >= 5.0) return { bg: '#F2B705', fg: '#16130F' };
  return { bg: '#D0362E', fg: '#FFFFFF' };
};

const getBandDescriptor = (band) => {
  const num = parseFloat(band) || 0;
  // IELTS's own band names; the score is a practice estimate, not an official result
  if (num >= 9) return 'Expert user';
  if (num >= 8) return 'Very good user';
  if (num >= 7) return 'Good user';
  if (num >= 6) return 'Competent user';
  if (num >= 5) return 'Modest user';
  return 'Limited user';
};

const IeltsAiEvaluationModal = ({ isOpen, onClose, evaluation, essayPrompt, studentEssay, wordCount, onPracticeAgain }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !evaluation) return null;

  const band = Number(evaluation.overallBand) || 0;
  const colors = getBandColor(band);
  const descriptor = getBandDescriptor(band);

  const criteria = evaluation.criteria || {};
  const criteriaList = [
    {
      title: 'Task Achievement',
      tone: '#F2B705',
      key: 'taskAchievement',
      icon: <Award size={18} />,
      score: criteria.taskAchievement?.score ?? band,
      feedback: criteria.taskAchievement?.feedback || 'Evaluates prompt coverage and position.'
    },
    {
      title: 'Coherence & Cohesion',
      tone: '#14837E',
      key: 'coherenceCohesion',
      icon: <Layers size={18} />,
      score: criteria.coherenceCohesion?.score ?? band,
      feedback: criteria.coherenceCohesion?.feedback || 'Evaluates logical flow and paragraph organization.'
    },
    {
      title: 'Lexical Resource',
      tone: '#B8285B',
      key: 'lexicalResource',
      icon: <BookOpen size={18} />,
      score: criteria.lexicalResource?.score ?? band,
      feedback: criteria.lexicalResource?.feedback || 'Evaluates vocabulary range and academic collocations.'
    },
    {
      title: 'Grammar & Accuracy',
      tone: '#DE5C2B',
      key: 'grammaticalAccuracy',
      icon: <TrendingUp size={18} />,
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

Summary:
${evaluation.examinerSummary || ''}

Practice estimate from unicoach.com, not an official IELTS score.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return typeof document !== 'undefined' ? createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-4 md:p-6 bg-[#16130F]/75 overflow-y-auto font-['Onest',sans-serif]">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ielts-eval-title"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#FFF6E5] border-[3px] border-[#16130F] shadow-[8px_8px_0_#F2B705] overflow-hidden my-auto max-h-[92vh] flex flex-col"
          style={{ borderRadius: 24 }}
        >
          {/* Header */}
          <div className="relative p-6 md:p-8 bg-[#16130F] text-white flex-shrink-0 border-b-[3px] border-[#16130F]">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close report"
              className="no-shine absolute top-5 right-5 w-10 h-10 grid place-items-center rounded-full bg-white text-[#16130F] border-2 border-white hover:bg-[#F2B705] hover:border-[#F2B705] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-wrap items-center gap-3 mb-3 pr-12">
              <span className="px-3 py-1 rounded-full text-[13px] font-bold bg-[#F2B705] text-[#16130F] border-2 border-[#F2B705] flex items-center gap-1.5">
                <Sparkles size={14} /> Practice band estimate
              </span>
              <span className="text-[14px] font-semibold text-white/75">
                Word Count: {wordCount || evaluation.wordCountAnalysis?.count || 0} words
              </span>
            </div>

            <p className="font-urbanist font-extrabold text-[15px] text-[#F2B705]">Tumhara result</p>
            <h2 id="ielts-eval-title" className="mt-1 font-urbanist text-[26px] md:text-[32px] font-black text-white tracking-[-0.03em] leading-[1.1]">
              IELTS Writing Task 2 Evaluation
            </h2>
            <p className="text-[14px] text-white/75 font-medium mt-1.5 line-clamp-1">
              {essayPrompt || 'Academic Writing Simulation'}
            </p>
          </div>

          {/* Body Content (Scrollable) */}
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="p-5 md:p-8 space-y-8 overflow-y-auto overscroll-contain custom-scrollbar flex-1 touch-pan-y"
          >

            {/* Overall Band Banner */}
            <div className="p-5 md:p-6 bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderRadius: 18 }}>
              <div className="space-y-2 text-center md:text-left">
                <span className="font-urbanist font-extrabold text-[15px] text-[#D0362E]">Estimated Band Score</span>
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  <span
                    className="inline-block px-3.5 py-1 font-urbanist text-[38px] md:text-[48px] font-black leading-none tracking-[-0.03em] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] -rotate-1"
                    style={{ background: colors.bg, color: colors.fg, borderRadius: 12 }}
                  >
                    Band {band}
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full text-[14px] font-bold bg-white text-[#16130F] border-2 border-[#16130F]">
                    {band >= 7.0 ? '🌟 Highly Competitive' : band >= 6.0 ? '✅ Target Met' : '⚠️ Needs Practice'}
                  </span>
                </div>
                <p className="text-[14px] font-semibold text-[#3D3830]">{descriptor}</p>
              </div>

              {evaluation.examinerSummary && (
                <div className="max-w-md p-4 bg-[#FFF1B8] border-2 border-[#16130F] text-[14px] text-[#16130F] leading-relaxed" style={{ borderRadius: 12 }}>
                  <span className="font-urbanist font-black text-[#16130F] block mb-1">👨‍🏫 Summary:</span>
                  {evaluation.examinerSummary}
                </div>
              )}
            </div>

            {/* 4 Official IELTS Criteria Cards */}
            <div>
              <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E]">Chaar criteria, ek ek karke</p>
              <h3 className="mt-1 mb-4 font-urbanist text-[20px] md:text-[22px] font-black text-[#16130F] tracking-[-0.02em] flex items-center gap-2">
                <Award size={20} /> Criteria breakdown (public IELTS band descriptors)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criteriaList.map((item, idx) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 bg-white border-2 border-[#16130F] shadow-[4px_4px_0_#16130F] space-y-2.5"
                    style={{ borderRadius: 14 }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 font-urbanist font-black text-[16px] text-[#16130F]">
                        <span
                          className="w-9 h-9 grid place-items-center border-2 border-[#16130F] flex-shrink-0"
                          style={{ background: item.tone, color: item.tone === '#F2B705' ? '#16130F' : '#FFFFFF', borderRadius: 9 }}
                        >
                          {item.icon}
                        </span>
                        {item.title}
                      </div>
                      <span className="px-3 py-1 text-[14px] font-black bg-[#16130F] text-white border-2 border-[#16130F] whitespace-nowrap" style={{ borderRadius: 8 }}>
                        Band {item.score}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#3D3830] leading-relaxed">
                      {item.feedback}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strengths & Actionable Improvements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strengths */}
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="p-5 md:p-6 bg-[#DDF3EF] border-2 border-[#16130F] shadow-[4px_4px_0_#14837E] space-y-3" style={{ borderRadius: 16 }}>
                  <h4 className="font-urbanist text-[17px] font-black text-[#16130F] flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-[#14837E]" /> Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.strengths.map((str, i) => (
                      <li key={i} className="text-[14px] text-[#16130F] flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#14837E] mt-2 flex-shrink-0" />
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div className="p-5 md:p-6 bg-[#FFF1B8] border-2 border-[#16130F] shadow-[4px_4px_0_#F2B705] space-y-3" style={{ borderRadius: 16 }}>
                  <h4 className="font-urbanist text-[17px] font-black text-[#16130F] flex items-center gap-2">
                    <AlertTriangle size={18} className="text-[#D0362E]" /> Actionable Fixes
                  </h4>
                  <ul className="space-y-2">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i} className="text-[14px] text-[#16130F] flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#D0362E] mt-2 flex-shrink-0" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Vocabulary Power-Up Upgrades Table */}
            {evaluation.vocabularyUpgrades && evaluation.vocabularyUpgrades.length > 0 && (
              <div className="p-5 md:p-6 bg-white border-2 border-[#16130F] shadow-[4px_4px_0_#16130F] space-y-4" style={{ borderRadius: 16 }}>
                <div>
                  <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E]">Behtar shabd, behtar band</p>
                  <h4 className="mt-1 font-urbanist text-[18px] font-black text-[#16130F] flex items-center gap-2">
                    <Sparkles size={18} className="text-[#B8285B]" /> Band 8+ Vocabulary Upgrades
                  </h4>
                </div>
                <div className="space-y-2.5">
                  {evaluation.vocabularyUpgrades.map((vocab, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#FFF6E5] border-2 border-dashed border-[#16130F]/40 text-[14px] gap-2" style={{ borderRadius: 10 }}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="line-through text-[#D0362E] font-bold">{vocab.original}</span>
                        <ArrowRight size={15} className="text-[#16130F]" />
                        <span className="text-[#14837E] font-black">{vocab.improved}</span>
                      </div>
                      {vocab.context && (
                        <span className="text-[13px] text-[#5B544A] italic">
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
              <div className="p-5 md:p-6 bg-[#FBD9E6] border-2 border-[#16130F] shadow-[4px_4px_0_#B8285B] space-y-3" style={{ borderRadius: 16 }}>
                <h4 className="font-urbanist text-[17px] font-black text-[#16130F] flex items-center gap-2">
                  <Sparkles size={17} className="text-[#B8285B]" /> Band 8.5+ Model Rewrite Sample
                </h4>
                <p className="text-[14px] text-[#16130F] leading-relaxed italic bg-white p-4 border-2 border-[#16130F]" style={{ borderRadius: 12 }}>
                  "{evaluation.enhancedSampleParagraph}"
                </p>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-5 bg-white border-t-[3px] border-[#16130F] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="no-shine px-5 py-2.5 rounded-full text-[14px] font-bold text-[#16130F] bg-white border-2 border-[#16130F] hover:-translate-y-0.5 transition-transform flex items-center gap-2 cursor-pointer"
            >
              {copied ? <Check size={15} className="text-[#14837E]" /> : <Copy size={15} />}
              {copied ? 'Copied Summary!' : 'Copy Evaluation'}
            </button>

            <div className="flex flex-wrap items-center gap-3">
              {onPracticeAgain && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onPracticeAgain();
                  }}
                  className="no-shine px-5 py-2.5 rounded-full text-[14px] font-bold text-[#16130F] bg-[#F2B705] border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] hover:-translate-y-0.5 transition-transform flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} /> Practice Another Topic
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full text-[14px] font-bold bg-[#16130F] text-white border-2 border-[#16130F] shadow-[3px_3px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform cursor-pointer"
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
