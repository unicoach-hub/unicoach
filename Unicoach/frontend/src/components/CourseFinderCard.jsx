import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, Globe, Award, CheckCircle2, Info, ChevronDown, 
  ChevronUp, BookmarkCheck, ExternalLink, Sparkles, GraduationCap,
  Calendar, Clock, DollarSign, FileCheck, Layers, ArrowRight
} from 'lucide-react';
import { getCountryMeta, getUniversityBadges, generateUniversityPrograms } from '../utils/courseFinderHelper';
import { getVerifiedRanking } from '../utils/ranking';
import { getMentorsForCourseAndUni } from '../data/courseMentors';
import UniversityLogo from './UniversityLogo';

// Programs: a short preview, then pages of 16 so universities with 60+ programs stay fast
const PREVIEW_COUNT = 3;
const PAGE_SIZE = 16;

const CourseFinderCard = ({
  uni,
  searchQuery = '',
  selectedProgramIds = [],
  onToggleProgramSelect,
  onSaveUni,
  isUniSaved = false,
  onOpenDetailsModal,
  onOpenEligibilityModal,
  onOpenCourseDrawer
}) => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(PREVIEW_COUNT);
  const countryMeta = getCountryMeta(uni.countryName || uni.country);
  const badges = getUniversityBadges(uni);
  const ranking = getVerifiedRanking(uni);
  const allPrograms = useMemo(() => generateUniversityPrograms(uni, { searchQuery }), [uni, searchQuery]);

  const handleCourseClick = (prog, isMentorTarget = false) => {
    const params = new URLSearchParams({
      courseId: prog.id,
      uniId: uni._id || uni.id || '',
      title: prog.title,
      uniName: uni.name
    });
    const hash = isMentorTarget ? '#mentors' : '';
    navigate(`/course-details?${params.toString()}${hash}`);
  };

  // 3 -> 16 -> 32 -> 48 ... (never everything at once)
  const displayedPrograms = allPrograms.slice(0, visibleCount);
  const remainingCount = allPrograms.length - displayedPrograms.length;
  const nextVisibleCount = Math.min(allPrograms.length, visibleCount < PAGE_SIZE ? PAGE_SIZE : visibleCount + PAGE_SIZE);
  const nextBatch = nextVisibleCount - displayedPrograms.length;

  return (
    <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all duration-200 overflow-hidden mb-6 p-4 sm:p-5 space-y-3.5">
      {/* 1. UNIVERSITY PROFILE CARD (CourseFinder Benchmark) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* University Logo */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-xs">
              <UniversityLogo logo={uni.logo} name={uni.name} size="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            {/* University Name & Location */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                  University / College
                </span>
                <h3 
                  onClick={() => onOpenDetailsModal && onOpenDetailsModal(uni)}
                  className="text-lg sm:text-xl font-black text-[#1E3A8A] hover:text-[#2563EB] cursor-pointer transition-colors leading-tight"
                >
                  {uni.name}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span>{uni.state ? `${uni.state}, ` : (uni.city ? `${uni.city}, ` : '')}{countryMeta.name}</span>
                {countryMeta.flagUrl && (
                  <img 
                    src={countryMeta.flagUrl} 
                    alt={countryMeta.name} 
                    className="w-4 h-2.5 rounded-[2px] object-cover inline-block shadow-2xs border border-slate-200" 
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions (Rank, Bookmark & Portal) */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {ranking && (
              <span title={ranking.fullLabel} className="px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80">
                {ranking.shortLabel}
              </span>
            )}
            {onSaveUni && (
            <button
              type="button"
              onClick={() => onSaveUni(uni)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                isUniSaved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title={isUniSaved ? 'Saved to shortlist' : 'Save to shortlist'}
            >
              <BookmarkCheck size={14} className={isUniSaved ? 'text-emerald-600' : 'text-slate-400'} />
              <span>{isUniSaved ? 'Shortlisted' : 'Shortlist'}</span>
            </button>
            )}

            {uni.website && (
              <a
                href={uni.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                title="Visit University Official Website"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Feature Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100/80">
          {badges.map((b, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight shadow-2xs ${b.color}`}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* 2. DEGREE PROGRAMS SECTION HEADER */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block shadow-xs" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <GraduationCap size={15} className="text-blue-600" />
            Available Degree Programs ({allPrograms.length})
          </h4>
        </div>
        <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
          Select checkboxes to compare or export
        </span>
      </div>

      {/* 3. INDEPENDENT ELEVATED DEGREE PROGRAM CARDS */}
      <div className="space-y-2.5">
        {displayedPrograms.map((prog) => {
          const isSelected = selectedProgramIds.includes(prog.id);
          const matchedMentors = getMentorsForCourseAndUni(uni, prog);

          return (
            <div 
              key={prog.id}
              className={`bg-white rounded-xl border p-4 sm:p-5 transition-all duration-150 shadow-2xs ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-xs' 
                  : 'border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              {/* Program Top Header with Checkbox & Intake Badges */}
              <div className="flex items-start gap-3">
                {/* Multi-select Checkbox */}
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleProgramSelect && onToggleProgramSelect({ ...prog, university: uni })}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Program Title & Status Tags */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 
                      onClick={() => handleCourseClick(prog)}
                      className="text-sm sm:text-[15px] font-black text-slate-900 hover:text-blue-600 cursor-pointer transition-colors leading-snug group/title flex items-center gap-1.5"
                      title="Click to view full course details, requirements & mentors"
                    >
                      <span className="hover:underline underline-offset-2">{prog.title}</span>
                      <ArrowRight size={13} className="text-blue-500 opacity-0 group-hover/title:opacity-100 group-hover/title:translate-x-0.5 transition-all" />
                    </h4>

                    {/* Status, Intake & Mentor Pills */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      {prog.status && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          {prog.status}
                        </span>
                      )}
                      {Array.isArray(prog.intakesList) && prog.intakesList.length > 0 ? (
                        prog.intakesList.map((item, iIdx) => (
                          <span 
                            key={iIdx} 
                            className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 inline-flex items-center gap-1"
                          >
                            <span>{item}</span>
                            <Info size={11} className="text-blue-500 opacity-70" />
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 inline-flex items-center gap-1">
                          <span>{prog.intake}</span>
                          <Info size={11} className="text-blue-500 opacity-70" />
                        </span>
                      )}

                      {/* Mentor Trigger Badge Button */}
                      <button
                        type="button"
                        onClick={() => handleCourseClick(prog, true)}
                        className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-50 hover:bg-[#DE5C2B] text-[#C04A1D] hover:text-white border border-orange-200/90 transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs group/mentor"
                        title="Meet verified alumni mentors who studied this course"
                      >
                        <GraduationCap size={12} className="text-[#DE5C2B] group-hover/mentor:text-white transition-colors" />
                        <span>{matchedMentors.length} Mentors</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCourseClick(prog)}
                        className="ml-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200/80 hover:border-blue-600 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="View complete course details & mentors"
                      >
                        <span>Details</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>

                  {/* METRICS ROW (Adapts cleanly: 3-column CourseFinder parity or 5-column extended) */}
                  {Boolean(prog.avgScholarship || prog.initialDeposit) ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
                      {/* 1. Duration */}
                      <div>
                        <span className="block text-slate-400 font-medium text-[11px] mb-0.5">Duration</span>
                        <span className="font-bold text-slate-700">{prog.durationText}</span>
                      </div>

                      {/* 2. Tuition / yr */}
                      <div>
                        <span className="block text-slate-400 font-medium text-[11px] mb-0.5 flex items-center gap-1">
                          Tuition/yr <Info size={11} className="text-slate-300" />
                        </span>
                        <span className="font-black text-slate-900">{prog.tuitionPerYear}</span>
                      </div>

                      {/* 3. Application Fee */}
                      <div>
                        <span className="block text-slate-400 font-medium text-[11px] mb-0.5">Application Fee</span>
                        <span className={`font-bold ${prog.applicationFee?.includes('No') ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {prog.applicationFee}
                        </span>
                      </div>

                      {/* 4. Avg. Scholarship */}
                      <div>
                        <span className="block text-slate-400 font-medium text-[11px] mb-0.5">Avg. Scholarship</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-purple-700">{prog.avgScholarship}</span>
                          {prog.hasNewScholarship && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-600 text-white tracking-wider">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 5. Initial Deposit */}
                      <div className="col-span-2 sm:col-span-1">
                        <span className="block text-slate-400 font-medium text-[11px] mb-0.5 flex items-center gap-1">
                          Initial Deposit <Info size={11} className="text-slate-300" />
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-800">{prog.initialDeposit}</span>
                          {prog.hasNewDeposit && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-600 text-white tracking-wider">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 max-w-xl gap-4 pt-2 text-xs">
                      {/* 1. Duration */}
                      <div>
                        <span className="block text-slate-400 font-medium text-[11px] mb-0.5">Duration</span>
                        <span className="font-bold text-slate-700">{prog.durationText}</span>
                      </div>

                      {/* 2. Tuition / yr */}
                      <div>
                        <span className="block text-slate-400 font-medium text-[11px] mb-0.5 flex items-center gap-1">
                          Tuition/yr <Info size={11} className="text-slate-300" />
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="font-black text-slate-900">{prog.tuitionPerYear}</span>
                          <Info size={11} className="text-blue-500 opacity-70" />
                        </div>
                      </div>

                      {/* 3. Application fee when known, otherwise where the numbers come from */}
                      {prog.applicationFee ? (
                        <div>
                          <span className="block text-slate-400 font-medium text-[11px] mb-0.5 flex items-center gap-1">
                            Application Fee <Info size={11} className="text-slate-300" />
                          </span>
                          <span className={`font-bold ${prog.applicationFee.includes('No') ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {prog.applicationFee}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="block text-slate-400 font-medium text-[11px] mb-0.5">Data source</span>
                          <span className={`font-semibold ${prog.isRealData ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {prog.sourceLabel || 'Verify on official site'}
                          </span>
                          {prog.officialUrl && (
                            <a
                              href={/^https?:\/\//i.test(prog.officialUrl) ? prog.officialUrl : `https://${prog.officialUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mt-0.5 text-[11px] font-semibold text-[#DE5C2B] hover:text-[#C04A1D]"
                            >
                              Official site ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. SEE MORE PROGRAMS (pages of 16) */}
      {allPrograms.length > PREVIEW_COUNT && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          {remainingCount > 0 && (
            <button
              type="button"
              onClick={() => setVisibleCount(nextVisibleCount)}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-blue-600 transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              See {nextBatch} more {nextBatch === 1 ? 'program' : 'programs'} <ChevronDown size={14} />
            </button>
          )}
          {visibleCount > PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setVisibleCount(PREVIEW_COUNT)}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              Show less <ChevronUp size={14} />
            </button>
          )}
          <span className="w-full text-center text-[11px] font-medium text-slate-400">
            Showing {displayedPrograms.length} of {allPrograms.length} programs at {uni.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default CourseFinderCard;
