import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass, Calendar, CheckCircle2, Clock, Sparkles,
  Target, Award, ArrowRight, RefreshCw, FileText,
  Square, AlertCircle, Layers, Globe,
  GraduationCap, Briefcase, BookOpen
} from 'lucide-react';
import PremiumDropdown from './PremiumDropdown';
import { ALL_COUNTRY_OPTIONS, POPULAR_COURSES } from '../utils/shortlistOptions';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

// Desi Pop look (same as the Course Finder search card): PremiumDropdown (shared) restyled from outside
const DROPDOWN = '[&>label]:!text-[14px] [&>label]:!font-bold [&>button]:!h-12 [&>button]:!text-[15px] [&>button]:!bg-white [&>button]:!border-2 [&>button]:!border-[#16130F]';
const PRIMARY_BTN = 'h-12 px-6 inline-flex items-center justify-center gap-2 text-white text-[15px] font-bold bg-[#16130F] border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer';

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
      {/* Parameters card in the Desi Pop look: labelled fields in one row, dark action at the end */}
      <div className="bg-white border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] p-4 sm:p-6" style={{ borderRadius: 20 }}>
        <p className="mb-4 font-urbanist text-[17px] font-extrabold text-[#16130F]">
          <span className="inline-grid place-items-center w-7 h-7 mr-2 rounded-lg bg-[#DE5C2B] text-white border-2 border-[#16130F] text-[14px]">1</span>Kab aur kahan jaana hai?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr_1.2fr_auto] gap-3 items-start">
          <div>
            <PremiumDropdown
              label="Intake"
              labelIcon={<Calendar size={14} className="text-[#DE5C2B]" />}
              value={formData.targetIntake}
              onChange={(val) => setFormData(prev => ({ ...prev, targetIntake: val }))}
              accent="orange"
              className={DROPDOWN}
              options={upcomingIntakes().map((i) => ({ value: i.name, label: `${i.name} (${i.months})`, shortLabel: i.name, icon: <Calendar size={14} className="text-[#DE5C2B]" /> }))}
            />
          </div>

          <div>
            <PremiumDropdown
              label="Country"
              labelIcon={<Globe size={14} className="text-[#DE5C2B]" />}
              value={formData.targetCountry}
              onChange={(val) => setFormData(prev => ({ ...prev, targetCountry: val }))}
              accent="orange"
              className={DROPDOWN}
              searchable={true}
              searchPlaceholder="Search 160+ countries..."
              options={ALL_COUNTRY_OPTIONS.filter(c => c.value !== 'All')}
            />
          </div>

          <div>
            <PremiumDropdown
              label="Degree"
              labelIcon={<GraduationCap size={14} className="text-[#DE5C2B]" />}
              value={formData.targetDegree}
              onChange={(val) => setFormData(prev => ({ ...prev, targetDegree: val }))}
              accent="orange"
              className={DROPDOWN}
              options={[
                { value: "Master's", label: "Master's (MS/MSc)", shortLabel: "Master's", icon: <GraduationCap size={14} className="text-[#DE5C2B]" /> },
                { value: 'MBA', label: 'MBA / Management', shortLabel: 'MBA', icon: <Briefcase size={14} className="text-[#DE5C2B]" /> },
                { value: "Bachelor's", label: "Bachelor's (BS/BA)", shortLabel: "Bachelor's", icon: <BookOpen size={14} className="text-[#DE5C2B]" /> }
              ]}
            />
          </div>

          <div>
            <PremiumDropdown
              label="Program or major"
              labelIcon={<BookOpen size={14} className="text-[#DE5C2B] flex-shrink-0" />}
              value={formData.targetMajor}
              onChange={(val) => setFormData(prev => ({ ...prev, targetMajor: val }))}
              accent="orange"
              className={DROPDOWN}
              searchable={true}
              creatable={true}
              defaultIcon={<BookOpen size={14} className="text-[#DE5C2B]" />}
              searchPlaceholder="Search or enter major..."
              placeholder="e.g. Computer Science"
              options={POPULAR_COURSES}
            />
          </div>

          <div>
            <PremiumDropdown
              label="Where you are now"
              labelIcon={<Target size={14} className="text-[#DE5C2B]" />}
              value={formData.currentStage}
              onChange={(val) => setFormData(prev => ({ ...prev, currentStage: val }))}
              accent="orange"
              className={DROPDOWN}
              options={[
                { value: 'Exploring & Profile Building', label: 'Exploring & Profile Building', shortLabel: 'Exploring', icon: <Compass size={14} className="text-[#DE5C2B]" /> },
                { value: 'IELTS / GRE Preparation', label: 'IELTS / GRE Preparation', shortLabel: 'Exam Prep', icon: <BookOpen size={14} className="text-[#DE5C2B]" /> },
                { value: 'Shortlisting & SOP Writing', label: 'Shortlisting & SOP Writing', shortLabel: 'Shortlisting & SOP', icon: <FileText size={14} className="text-[#DE5C2B]" /> },
                { value: 'Submitting Applications', label: 'Submitting Applications', shortLabel: 'Submitting Apps', icon: <Award size={14} className="text-[#DE5C2B]" /> }
              ]}
            />
          </div>
          <button type="button" onClick={handleGenerateRoadmap} disabled={loading} className={`${PRIMARY_BTN} w-full lg:w-auto self-start lg:mt-[29px]`} style={{ borderRadius: 999 }}>
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Generating…</> : <><Sparkles size={16} /> Generate</>}
          </button>
        </div>
        <p className="mt-5 pt-4 border-t-2 border-dashed border-[#16130F]/20 flex items-center justify-center gap-2 text-[14px] font-medium text-[#3D3830] text-center">
          <Sparkles size={15} className="text-[#DE5C2B] shrink-0" />
          Pick your intake, country and stage, then press Generate for deadlines, exam milestones and visa windows.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#FCE3DA] border-2 border-[#16130F] text-[14px] font-bold text-[#16130F] flex items-center gap-2" style={{ borderRadius: 14 }}>
          <AlertCircle size={18} className="text-[#D0362E] flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {loading && (
        <div className="bg-white border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] p-8 sm:p-12 text-center space-y-4" style={{ borderRadius: 20 }}>
          <div className="w-14 h-14 rounded-2xl bg-[#F2B705] border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] text-[#16130F] flex items-center justify-center mx-auto animate-pulse">
            <Sparkles size={26} />
          </div>
          <div className="space-y-1.5">
            <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E]">Plan ban raha hai</p>
            <h4 className="font-urbanist text-[22px] font-black tracking-[-0.02em] text-[#16130F]">Generating Your Strategic 6-Month Roadmap...</h4>
            <p className="text-[14px] text-[#5B544A] font-medium">Aligning admissions cycles, scholarship priority dates, and visa appointment windows.</p>
          </div>
        </div>
      )}

      {!loading && !roadmap && (
        <div className="bg-[#DDF3EF] border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] p-8 md:p-12 text-center space-y-5" style={{ borderRadius: 20 }}>
          <div className="w-16 h-16 rounded-2xl bg-white border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] flex items-center justify-center mx-auto text-[#14837E] -rotate-3">
            <Compass size={30} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E]">Chalo, raasta banate hain</p>
            <h4 className="font-urbanist text-[24px] sm:text-[28px] font-black tracking-[-0.03em] leading-tight text-[#16130F]">Ready to Map Your Study Abroad Journey?</h4>
            <p className="text-[15px] text-[#3D3830] font-medium leading-relaxed">
              Generate an intelligent, month-by-month timeline synchronized with priority scholarship cutoffs, university application portals, and visa interview slots.
            </p>
          </div>
          <button
            onClick={handleGenerateRoadmap}
            className="min-h-12 px-6 py-3 inline-flex items-center justify-center gap-2 text-center text-white text-[15px] font-bold bg-[#16130F] border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform cursor-pointer"
            style={{ borderRadius: 999 }}
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
              <div className="p-5 bg-[#F2B705] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] space-y-1" style={{ borderRadius: 16 }}>
                <span className="font-urbanist text-[13px] font-extrabold text-[#16130F]/75">Plan Horizon</span>
                <p className="font-urbanist text-[19px] font-black leading-tight text-[#16130F]">{roadmap.intakeTitle || `${formData.targetIntake} in ${formData.targetCountry}`}</p>
                <p className="text-[14px] font-semibold text-[#16130F]/80">Customized for {formData.targetMajor || 'Target Degree'}</p>
              </div>

              <div className="p-5 bg-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] space-y-1" style={{ borderRadius: 16 }}>
                <span className="font-urbanist text-[13px] font-extrabold text-[#5B544A]">Profile Readiness Rating</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-urbanist text-[19px] font-black leading-tight text-[#14837E]">{roadmap.readinessRating || '78% Profile Maturity'}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[12px] font-black bg-[#DDF3EF] text-[#16130F] border-2 border-[#16130F]">On Track</span>
                </div>
                <p className="text-[14px] font-semibold text-[#5B544A]">Targeting {formData.targetExam || 'IELTS'} + {formData.targetDegree}</p>
              </div>

              <div className="p-5 bg-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] space-y-1.5" style={{ borderRadius: 16 }}>
                <div className="flex items-center justify-between">
                  <span className="font-urbanist text-[13px] font-extrabold text-[#5B544A]">Task Completion</span>
                  <span className="text-[13px] font-black text-[#DE5C2B]">{progressStats.percent}% Done</span>
                </div>
                <p className="font-urbanist text-[17px] font-black leading-tight text-[#16130F]">
                  {progressStats.completed} of {progressStats.total} Action Items Completed
                </p>
                <div className="w-full bg-[#FFF6E5] border-2 border-[#16130F] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#DE5C2B] h-full transition-all duration-300"
                    style={{ width: `${progressStats.percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Critical Deadlines Banner (if available) */}
            {roadmap.criticalDeadlines && roadmap.criticalDeadlines.length > 0 && (
              <div className="p-5 bg-[#14837E] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] space-y-3" style={{ borderRadius: 20 }}>
                <p className="font-urbanist font-extrabold text-[14px] text-[#F2B705]">Ye tareekhen mat bhoolna</p>
                <h4 className="font-urbanist text-[18px] font-black text-white flex items-center gap-1.5">
                  <Clock size={17} className="text-[#F2B705]" /> Key Admissions Deadlines & Milestone Cutoffs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {roadmap.criticalDeadlines.map((item, dIdx) => (
                    <div key={dIdx} className="p-3.5 bg-white border-2 border-[#16130F] space-y-1" style={{ borderRadius: 12 }}>
                      <span className="text-[13px] font-bold text-[#5B544A] block">{item.milestone}</span>
                      <p className="text-[15px] font-black text-[#16130F] flex items-center gap-1.5">
                        <Calendar size={15} className="text-[#DE5C2B] flex-shrink-0" />
                        <span>{item.deadline}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Urgent Action Items Alert */}
            {roadmap.urgentActionItems && roadmap.urgentActionItems.length > 0 && (
              <div className="p-5 bg-[#FFF1B8] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] space-y-3" style={{ borderRadius: 20 }}>
                <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E]">Is hafte ka kaam</p>
                <h4 className="font-urbanist text-[18px] font-black text-[#16130F] flex items-center gap-1.5">
                  <Sparkles size={17} className="text-[#DE5C2B]" /> Immediate Top 3 Action Items for This Week:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {roadmap.urgentActionItems.map((act, i) => (
                    <div key={i} className="p-3.5 bg-white text-[14px] font-bold text-[#16130F] border-2 border-[#16130F] flex items-start gap-2.5" style={{ borderRadius: 12 }}>
                      <span className="w-6 h-6 inline-grid place-items-center rounded-md bg-[#DE5C2B] text-white border-2 border-[#16130F] text-[12px] font-black flex-shrink-0">{i+1}</span>
                      <span className="leading-snug">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6-Month Timeline Phase Cards */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E]">Mahine-dar-mahine</p>
                  <h3 className="font-urbanist text-[22px] sm:text-[26px] font-black tracking-[-0.03em] leading-tight text-[#16130F] flex items-center gap-2">
                    <Layers size={20} className="text-[#DE5C2B]" /> Month-by-Month Strategic Roadmap ({activePhases.length} Months)
                  </h3>
                </div>
                <span className="text-[14px] font-semibold text-[#5B544A]">Click any task to check off progress</span>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {activePhases.map((phase, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] p-5 md:p-7 space-y-4"
                    style={{ borderRadius: 20 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#16130F] pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`px-3.5 py-1.5 rounded-lg text-[13px] font-black border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] whitespace-nowrap flex-shrink-0 ${['bg-[#F2B705] text-[#16130F]', 'bg-[#14837E] text-white', 'bg-[#B8285B] text-white', 'bg-[#DE5C2B] text-white'][idx % 4]}`}>
                          {phase.month}
                        </span>
                        <h4 className="font-urbanist text-[18px] font-black tracking-[-0.01em] text-[#16130F]">{phase.title}</h4>
                      </div>
                      {phase.focus && (
                        <span className="text-[14px] font-medium text-[#3D3830] sm:text-right flex-shrink-0 max-w-md">
                          <strong className="text-[#16130F] font-bold">Focus:</strong> {phase.focus}
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
                            className={`p-3.5 border-2 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                              isDone
                                ? 'bg-[#DDF3EF] border-[#16130F]'
                                : 'bg-[#FFF6E5] hover:bg-white border-[#16130F]/20 hover:border-[#16130F]'
                            }`}
                            style={{ borderRadius: 12 }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex-shrink-0">
                                {isDone ? <CheckCircle2 size={20} className="text-[#14837E]" /> : <Square size={20} className="text-[#16130F]/50" />}
                              </span>
                              <span className={`text-[14px] font-semibold leading-snug ${isDone ? 'line-through text-[#5B544A]' : 'text-[#16130F]'}`}>
                                {task}
                              </span>
                            </div>

                            <span className={`text-[12px] font-black px-2.5 py-1 rounded-full border-2 whitespace-nowrap flex-shrink-0 ${
                              isDone ? 'bg-[#14837E] text-white border-[#16130F]' : 'bg-white text-[#5B544A] border-[#16130F]/25'
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
