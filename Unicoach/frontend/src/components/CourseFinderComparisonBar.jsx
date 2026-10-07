import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Scale, Download, BookmarkCheck, CheckCircle2, 
  ArrowRight, Globe, Sparkles, Building, Info
} from 'lucide-react';

const CourseFinderComparisonBar = ({
  selectedPrograms = [],
  onClearSelection,
  onSaveSelectedToShortlist,
  onExportExcel
}) => {
  const [showCompareModal, setShowCompareModal] = useState(false);

  if (!selectedPrograms || selectedPrograms.length === 0) return null;

  return (
    <>
      {/* FLOATING ACTION PILL (CourseFinder Benchmark) */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl"
      >
        <div className="bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 backdrop-blur-md">
          {/* Selected Count */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
              {selectedPrograms.length}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              {selectedPrograms.length} {selectedPrograms.length === 1 ? 'Program' : 'Programs'} selected
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <X size={13} />
              <span className="hidden sm:inline">Deselect All</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Scale size={14} />
              <span>Compare</span>
            </button>

            {onSaveSelectedToShortlist && (
              <button
                type="button"
                onClick={onSaveSelectedToShortlist}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Save all selected to your profile shortlist"
              >
                <BookmarkCheck size={14} />
                <span className="hidden md:inline">Shortlist</span>
              </button>
            )}

            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm"
                title={`Download ${selectedPrograms.length} selected programs in Excel`}
              >
                <Download size={13} className="text-emerald-400" />
                <span>Export ({selectedPrograms.length})</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* COMPARISON MODAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showCompareModal && (
            <div className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Scale className="text-blue-600" size={22} />
                      Direct Program Comparison
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Compare duration, tuition fee per year, scholarships, and initial visa deposits side-by-side.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCompareModal(false)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-black">
                        <th className="p-3">Program & University</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Tuition / yr</th>
                        <th className="p-3">Application Fee</th>
                        <th className="p-3">Avg. Scholarship</th>
                        <th className="p-3">Initial Deposit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPrograms.map((prog, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 text-sm">{prog.title}</div>
                            <div className="text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                              <Building size={12} className="text-slate-400" />
                              {prog.university?.name || 'Partner University'}
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{prog.durationText}</td>
                          <td className="p-3 font-black text-slate-900">{prog.tuitionPerYear}</td>
                          <td className="p-3 font-semibold text-emerald-600">{prog.applicationFee || 'Check official site'}</td>
                          <td className="p-3 font-bold text-purple-700">{prog.avgScholarship || 'Check official site'}</td>
                          <td className="p-3 font-bold text-slate-800">{prog.initialDeposit || 'Check official site'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedPrograms.length} programs selected
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCompareModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Close
                    </button>
                    {onExportExcel && (
                      <button
                        type="button"
                        onClick={onExportExcel}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                        title="Export comparison table to Excel"
                      >
                        <Download size={13} className="text-emerald-600" />
                        <span>Export to Excel</span>
                      </button>
                    )}
                    {onSaveSelectedToShortlist && (
                    <button
                      type="button"
                      onClick={() => {
                        onSaveSelectedToShortlist();
                        setShowCompareModal(false);
                      }}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <BookmarkCheck size={14} />
                      <span>Save All to Profile Shortlist</span>
                    </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default CourseFinderComparisonBar;
