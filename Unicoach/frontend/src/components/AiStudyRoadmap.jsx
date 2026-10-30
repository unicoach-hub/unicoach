import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Calendar, CheckCircle2, Clock, Sparkles, 
  Target, Award, ArrowRight, RefreshCw, FileText, CheckSquare, 
  Square, Download, AlertCircle, Layers, ChevronRight, Globe,
  GraduationCap, Briefcase, BookOpen
} from 'lucide-react';
import PremiumDropdown from './PremiumDropdown';
import { FinderCard, FinderButton } from './ui/FinderForm';
import { ALL_COUNTRY_OPTIONS, POPULAR_COURSES } from '../utils/shortlistOptions';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

// Upcoming intakes worked out from today (Spring = January, Fall = September), never one that has already started
const upcomingIntakes = (from = new Date()) => {
  const list = [];
  for (let y = from.getFullYear(); y <= from.getFullYear() + 2; y += 1) {
    list.push({ name: `Spring ${y}`, start: new Date(y, 0, 15), months: 'Jan/Feb' });
    list.push({ name: `Fall ${y}`, start: new Date(y, 8, 1), months: 'Aug/Sept' });
  }
  const twoMonths = 60 * 24 * 3600 * 1000;
  return list.filter((i) => i.start - from > twoMonths).slice(0, 4);
};
// Default: the first intake that still leaves about six months to prepare
const defaultIntake = () => {
  const list = upcomingIntakes();
  const sixMonths = 182 * 24 * 3600 * 1000;
  return (list.find((i) => i.start - new Date() >= sixMonths) || list[0]).name;
};

const AiStudyRoadmap = ({ studentProfile = {} }) => {
  const { user, token, openLoginModal } = useAuth();

  const [formData, setFormData] = useState({
    targetIntake: (upcomingIntakes().some((i) => i.name === studentProfile.preferredIntake) && studentProfile.preferredIntake) || defaultIntake(),
    targetCountry: studentProfile.dreamCountry || 'USA',
    targetDegree: studentProfile.highestEducation || "Master's",
    targetMajor: studentProfile.dreamCourse || 'Computer Science',
    currentStage: 'Exploring & Profile Building',
    targetExam: studentProfile.targetExam || 'IELTS',
    currentGpa: studentProfile.targetScore || ''
  });

  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('unicoach_roadmap_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [errorMsg, setErrorMsg] = useState('');

  // The roadmap is a paid AI call: generate only when the student clicks "Generate"
  // (or once right after the login that click opened) — never automatically on mount/auth change.
  const handleGenerateRoadmap = async () => {
    if (!user && !token) {
      if (openLoginModal) {
        openLoginModal({
          title: 'Unlock Your 6-Month AI Roadmap',
          subtitle: 'Sign in free with Google or email to generate a customized intake timeline & milestone planner',
          preventRedirect: true,
          onSuccess: () => {
            executeRoadmapGeneration();
          }
        });
        return;
      }
    }
    executeRoadmapGeneration();
  };

  const executeRoadmapGeneration = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Auth = HttpOnly session cookie (sent by installApiFetch); no bearer token in storage
      const res = await fetch(`${API_URL}/ai/generate-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      const rawRoadmap = data.roadmap || data.data;
      if (res.ok && rawRoadmap) {
        const phases = rawRoadmap.phases || rawRoadmap.timeline || [];
        setRoadmap({
          ...rawRoadmap,
          phases
        });
      } else {
        throw new Error(data.error || 'Failed to generate roadmap');
      }
    } catch (err) {
      // No sample roadmap on failure: a generic plan with wrong dates would mislead the student
      setErrorMsg(err.message && !/fetch/i.test(err.message) ? err.message : 'Our AI planner is busy right now. Please try again in a minute.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem('unicoach_roadmap_tasks', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const getProgressStats = () => {
    const phases = roadmap?.phases || roadmap?.timeline;
    if (!phases || !Array.isArray(phases)) return { completed: 0, total: 0, percent: 0 };
    const allTasks = phases.flatMap(p => (p.tasks || []).map((_, idx) => `${p.month}_${idx}`));
    const total = allTasks.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = allTasks.filter(id => completedTasks[id]).length;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  };

  return (
    <div className="space-y-8">
      {/* Parameters card, in the Course Finder look: labelled fields in one row, dark action at the end */}
      <FinderCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr_1.2fr_auto] gap-3 items-start">
          <div>
            <PremiumDropdown
              label="Intake"
              labelIcon={<Calendar size={14} className="text-indigo-600" />}
              value={formData.targetIntake}
              onChange={(val) => setFormData(prev => ({ ...prev, targetIntake: val }))}
              accent="indigo"
              options={upcomingIntakes().map((i) => ({ value: i.name, label: `${i.name} (${i.months})`, shortLabel: i.name, icon: <Calendar size={14} className="text-indigo-600" /> }))}
            />
          </div>

          <div>
            <PremiumDropdown
              label="Country"
              labelIcon={<Globe size={14} className="text-indigo-600" />}
              value={formData.targetCountry}
              onChange={(val) => setFormData(prev => ({ ...prev, targetCountry: val }))}
              accent="indigo"
              searchable={true}
              searchPlaceholder="Search 160+ countries..."
              options={ALL_COUNTRY_OPTIONS.filter(c => c.value !== 'All')}
            />
          </div>

          <div>
            <PremiumDropdown
              label="Degree"
              labelIcon={<GraduationCap size={14} className="text-indigo-600" />}
              value={formData.targetDegree}
              onChange={(val) => setFormData(prev => ({ ...prev, targetDegree: val }))}
              accent="indigo"
              options={[
                { value: "Master's", label: "Master's (MS/MSc)", shortLabel: "Master's", icon: <GraduationCap size={14} className="text-indigo-600" /> },
                { value: 'MBA', label: 'MBA / Management', shortLabel: 'MBA', icon: <Briefcase size={14} className="text-indigo-600" /> },
                { value: "Bachelor's", label: "Bachelor's (BS/BA)", shortLabel: "Bachelor's", icon: <BookOpen size={14} className="text-indigo-600" /> }
              ]}
            />
          </div>

          <div>
            <PremiumDropdown
              label="Program or major"
              labelIcon={<BookOpen size={14} className="text-indigo-600 flex-shrink-0" />}
              value={formData.targetMajor}
              onChange={(val) => setFormData(prev => ({ ...prev, targetMajor: val }))}
              accent="indigo"
              searchable={true}
              creatable={true}
              defaultIcon={<BookOpen size={14} className="text-indigo-600" />}
              searchPlaceholder="Search or enter major..."
              placeholder="e.g. Computer Science"
              options={POPULAR_COURSES}
            />
          </div>

          <div>
            <PremiumDropdown
              label="Where you are now"
              labelIcon={<Target size={14} className="text-indigo-600" />}
              value={formData.currentStage}
              onChange={(val) => setFormData(prev => ({ ...prev, currentStage: val }))}
              accent="indigo"
              options={[
                { value: 'Exploring & Profile Building', label: 'Exploring & Profile Building', shortLabel: 'Exploring', icon: <Compass size={14} className="text-indigo-600" /> },
                { value: 'IELTS / GRE Preparation', label: 'IELTS / GRE Preparation', shortLabel: 'Exam Prep', icon: <BookOpen size={14} className="text-indigo-600" /> },
                { value: 'Shortlisting & SOP Writing', label: 'Shortlisting & SOP Writing', shortLabel: 'Shortlisting & SOP', icon: <FileText size={14} className="text-indigo-600" /> },
                { value: 'Submitting Applications', label: 'Submitting Applications', shortLabel: 'Submitting Apps', icon: <Award size={14} className="text-indigo-600" /> }
              ]}
            />
          </div>
          <FinderButton type="button" onClick={handleGenerateRoadmap} disabled={loading} className="w-full lg:w-auto self-start lg:mt-[26px]">
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Generating…</> : <><Sparkles size={16} /> Generate</>}
          </FinderButton>
        </div>
        <p className="mt-4 pt-4 border-t border-[#ECE6DA] flex items-center justify-center gap-2 text-[13px] text-[#5B544A] text-center">
          <Sparkles size={14} className="text-[#DE5C2B] shrink-0" />
          Pick your intake, country and stage, then press Generate for deadlines, exam milestones and visa windows.
        </p>
      </FinderCard>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {loading && (
        <div className="bg-white border border-slate-200 p-12 rounded-[32px] text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles size={28} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-black text-slate-800">Generating Your Strategic 6-Month Roadmap...</h4>
            <p className="text-xs text-slate-400 font-semibold">Aligning admissions cycles, scholarship priority dates, and visa appointment windows.</p>
          </div>
        </div>
      )}

      {!loading && !roadmap && (
        <div className="bg-white border border-slate-200/90 rounded-[32px] p-8 md:p-12 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
            <Compass size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-xl font-black text-slate-900">Ready to Map Your Study Abroad Journey?</h4>
            <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
              Generate an intelligent, month-by-month timeline synchronized with priority scholarship cutoffs, university application portals, and visa interview slots.
            </p>
          </div>
          <button
            onClick={handleGenerateRoadmap}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-100 inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={16} /> Generate Strategic 6-Month Roadmap <ArrowRight size={16} />
          </button>
        </div>
      )}

      {!loading && roadmap && (() => {
        const progressStats = getProgressStats();
        const activePhases = roadmap.phases || roadmap.timeline || [];

        return (
          <div className="space-y-8">
            {/* Top Highlights Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Plan Horizon</span>
                <p className="text-base font-black text-slate-800">{roadmap.intakeTitle || `${formData.targetIntake} in ${formData.targetCountry}`}</p>
                <p className="text-[11px] font-semibold text-slate-400">Customized for {formData.targetMajor || 'Target Degree'}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Profile Readiness Rating</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-emerald-600">{roadmap.readinessRating || '78% Profile Maturity'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">On Track</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-400">Targeting {formData.targetExam || 'IELTS'} + {formData.targetDegree}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Task Completion</span>
                  <span className="text-xs font-black text-indigo-600">{progressStats.percent}% Done</span>
                </div>
                <p className="text-base font-black text-indigo-700">
                  {progressStats.completed} of {progressStats.total} Action Items Completed
                </p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressStats.percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Critical Deadlines Banner (if available) */}
            {roadmap.criticalDeadlines && roadmap.criticalDeadlines.length > 0 && (
              <div className="p-5 rounded-3xl bg-indigo-50/50 border border-indigo-100/80 space-y-3">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-600" /> Key Admissions Deadlines & Milestone Cutoffs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {roadmap.criticalDeadlines.map((item, dIdx) => (
                    <div key={dIdx} className="p-3.5 bg-white rounded-2xl border border-indigo-100 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.milestone}</span>
                      <p className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                        <Calendar size={13} className="text-indigo-600 flex-shrink-0" />
                        <span>{item.deadline}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Urgent Action Items Alert */}
            {roadmap.urgentActionItems && roadmap.urgentActionItems.length > 0 && (
              <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" /> Immediate Top 3 Action Items for This Week:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {roadmap.urgentActionItems.map((act, i) => (
                    <div key={i} className="p-3.5 bg-white/95 rounded-2xl text-xs font-bold text-amber-950 border border-amber-200/60 flex items-start gap-2.5 shadow-2xs">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-200 text-amber-900 text-[10px] font-black flex-shrink-0">{i+1}</span>
                      <span className="leading-snug">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6-Month Timeline Phase Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-indigo-600" /> Month-by-Month Strategic Roadmap ({activePhases.length} Months)
                </h3>
                <span className="text-xs font-semibold text-slate-400">Click any task to check off progress</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {activePhases.map((phase, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-7 shadow-sm space-y-4 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200/70 whitespace-nowrap flex-shrink-0 shadow-2xs tracking-wide">
                          {phase.month}
                        </span>
                        <h4 className="text-base font-black text-slate-800 tracking-tight">{phase.title}</h4>
                      </div>
                      {phase.focus && (
                        <span className="text-xs font-semibold text-slate-500 italic sm:text-right flex-shrink-0 max-w-md">
                          <strong className="text-slate-400 not-italic font-bold">Focus:</strong> {phase.focus}
                        </span>
                      )}
                    </div>

                    {/* Tasks Checklist */}
                    <div className="space-y-2">
                      {phase.tasks?.map((task, tIdx) => {
                        const key = `${phase.month}_${tIdx}`;
                        const isDone = !!completedTasks[key];
                        return (
                          <div
                            key={tIdx}
                            onClick={() => toggleTask(key)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              isDone
                                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 shadow-2xs'
                                : 'bg-slate-50/70 hover:bg-white border-slate-100 hover:border-indigo-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-indigo-600 flex-shrink-0">
                                {isDone ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Square size={18} className="text-slate-400" />}
                              </span>
                              <span className={`text-xs font-bold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {task}
                              </span>
                            </div>

                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0 ${
                              isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/70 text-slate-600'
                            }`}>
                              {isDone ? '✓ Completed' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AiStudyRoadmap;
