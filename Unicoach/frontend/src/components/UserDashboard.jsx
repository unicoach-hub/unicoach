import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Globe, Calendar, GraduationCap, 
  MapPin, Compass, ClipboardList, CheckCircle2, LogOut, 
  LayoutDashboard, Award, CheckSquare, 
  Edit3, RefreshCw, Send, AlertTriangle,
  Zap, FileText, Calculator, Sparkles,
  BookmarkCheck, Trash2, ExternalLink, ShieldCheck, Target,
  Menu, X, ChevronRight, ChevronDown, Layers, Settings,
  Clock, ArrowRight, ArrowLeft, Check, Plus, MessageCircle, FileCheck, Star, Filter, CheckCircle,
  BookOpen, FileSpreadsheet, Download,
  Mic, Route, ListChecks, CalendarDays, BookOpenCheck,
  Landmark, Plane, Headphones
} from 'lucide-react';
import UniversityLogo from './UniversityLogo';
import PremiumDropdown from './PremiumDropdown';
import StudentMessages from './StudentMessages';
import ProductTour from './ProductTour';
import useFirstVisitTour from '../hooks/useFirstVisitTour';
import CourseFinderCard from './CourseFinderCard';
import ProgramSelectionTools from './ProgramSelectionTools';
import { useProgramSelection } from '../utils/useProgramSelection';
import { POPULAR_COURSES, ALL_COUNTRY_OPTIONS } from '../utils/shortlistOptions';
import { exportUniversitiesToExcel } from '../utils/excelExporter';

// Tools that live in their own tabs load when the tab is opened, so the dashboard itself opens fast
// Same tools as the site's Toolkit menu (components/Navbar.jsx aiToolsNavData), so the dashboard and the site never drift apart
const SearchProgramsPage = lazy(() => import('../pages/SearchProgramsPage'));
const EducationLoanPage = lazy(() => import('../pages/EducationLoanPage'));
const IeltsEvaluatorPage = lazy(() => import('../pages/IeltsEvaluatorPage'));
const VisaAssistancePage = lazy(() => import('../pages/VisaAssistancePage'));
const AiSopGenerator = lazy(() => import('./AiSopGenerator'));
const AiVisaInterviewPrep = lazy(() => import('./AiVisaInterviewPrep'));
const AiStudyRoadmap = lazy(() => import('./AiStudyRoadmap'));
const EligibilityCalculatorPage = lazy(() => import('../pages/EligibilityCalculatorPage'));
const TabLoading = () => <div className="py-16 flex justify-center"><span className="w-6 h-6 rounded-full border-2 border-[#DE5C2B] border-t-transparent animate-spin" /></div>;
import { API_BASE_URL } from '../config';
import JourneyTracker from './JourneyTracker';
import TutorialVideo from './ui/TutorialVideo';
import { clearUserStorage } from '../utils/userStorage';

const API_URL = API_BASE_URL;

// Tool tabs that were replaced by the Toolkit tools; tasks saved before the change still use these ids
const OLD_TOOL_TABS = {
  shortlister: 'course-finder',
  'scholarship-shortlister': 'scholarships',
  'budget-calculator': 'eligibility-calculator',
  'ielts-simulator': 'ielts-checker',
  game: 'overview',
  history: 'overview',
};

export const DEFAULT_DAILY_TASKS = [
  {
    id: 'dt-1',
    title: 'Confirm target country & study destination',
    subtitle: 'Evaluate tuition fees, post-study work visa (PSW) tenure, and job markets across USA, UK, Canada, Australia, and Germany.',
    category: 'admissions',
    priority: 'P0',
    stage: 'Phase 1: Foundation',
    done: true,
    actionLabel: 'Explore Destinations',
    actionTarget: 'overview',
    estimatedTime: '10 mins'
  },
  {
    id: 'dt-2',
    title: 'Shortlist 5 Target, Reach & Safe Universities',
    subtitle: 'Use AI Shortlister to match your GPA, test scores, and budget against 1,500+ top global universities.',
    category: 'admissions',
    priority: 'P0',
    stage: 'Phase 1: Foundation',
    done: false,
    actionLabel: 'Open Course Finder',
    actionTarget: 'course-finder',
    estimatedTime: '15 mins'
  },
  {
    id: 'dt-3',
    title: 'Complete 40-Minute IELTS Writing AI Mock Simulation',
    subtitle: 'Simulate computer-delivered Task 2 essay with real-time countdown timer, word counter, and instant AI band evaluation.',
    category: 'prep',
    priority: 'P1',
    stage: 'Phase 2: Standardized Tests',
    done: false,
    actionLabel: 'Check an Essay',
    actionTarget: 'ielts-checker',
    estimatedTime: '40 mins'
  },
  {
    id: 'dt-4',
    title: 'Draft a Tailored Statement of Purpose (SOP)',
    subtitle: 'Generate a structured 5-paragraph academic SOP highlighting projects, research interests, and future career goals.',
    category: 'documents',
    priority: 'P0',
    stage: 'Phase 3: Documentation',
    done: false,
    actionLabel: 'Generate SOP',
    actionTarget: 'sop-builder',
    estimatedTime: '20 mins'
  },
  {
    id: 'dt-5',
    title: 'Calculate Estimated 1st Year Living & Tuition Expenses',
    subtitle: 'Get realistic estimates for university tuition, on/off-campus rent, health insurance, and monthly living costs.',
    category: 'admissions',
    priority: 'P2',
    stage: 'Phase 1: Foundation',
    done: false,
    actionLabel: 'Check Costs',
    actionTarget: 'eligibility-calculator',
    estimatedTime: '10 mins'
  },
  {
    id: 'dt-6',
    title: 'Find Matching Scholarships & Set Deadline Alerts',
    subtitle: 'Discover merit and need-based international student scholarships and track deadlines with 1-click sync.',
    category: 'admissions',
    priority: 'P1',
    stage: 'Phase 2: Funding',
    done: false,
    actionLabel: 'Find Scholarships',
    actionTarget: 'scholarships',
    estimatedTime: '15 mins'
  },
  {
    id: 'dt-7',
    title: 'Simulate AI Mock Visa Interview (F-1 / SDS / Student Route)',
    subtitle: 'Practice high-pressure consular questions on proof of funds, intent to return, and university selection.',
    category: 'visa',
    priority: 'P0',
    stage: 'Phase 4: Visa & Arrival',
    done: false,
    actionLabel: 'Start Visa Mock',
    actionTarget: 'visa-mock',
    estimatedTime: '20 mins'
  },
  {
    id: 'dt-8',
    title: 'Connect with Admissions Desk for 1-on-1 Guidance',
    subtitle: 'Verify document checklist, explore university fee waivers, and plan your application submission timeline.',
    category: 'admissions',
    priority: 'P0',
    stage: 'Phase 3: Documentation',
    done: false,
    actionLabel: 'Book Counselling',
    actionTarget: 'counselling',
    estimatedTime: '5 mins'
  }
];

const UserDashboard = () => {
  const { user, token, updateUser, logout, openLoginModal } = useAuth();
  // First-visit tour of the student dashboard (skippable; "Take a tour" replays it)
  const studentTour = useFirstVisitTour(user?._id || user?.id ? `student:${user._id || user.id}` : null, !!user);
  const STUDENT_TOUR = [
    { target: null, title: 'Welcome to your UniCoach dashboard 👋', body: 'A quick 1-minute look at what you can do here. Skip any time, and replay it later from "Take a tour".', onEnter: () => setActiveTab('overview') },
    { target: '[data-tour="my-tasks"]', title: 'Your study-abroad tasks', body: 'A step-by-step checklist from shortlisting universities to your visa. Tick things off as you go.' },
    { target: '[data-tour="nav-saved-unis"]', title: 'Saved shortlist', body: 'Universities and courses you save while browsing land here, so you can compare them later.' },
    { target: '[data-tour="nav-messages"]', title: 'Messages & documents', body: 'Chat with the UniCoach team and upload your documents (marksheets, passport, SOP) in one place.' },
    { target: '[data-tour="nav-course-finder"]', title: 'Course Finder', body: 'Search programmes worldwide and shortlist the ones that fit your marks and budget.' },
    { target: '[data-tour="nav-scholarships"]', title: 'Scholarships', body: 'Programmes that come with a scholarship, in the same Course Finder.' },
    { target: '[data-tour="nav-sop-builder"]', title: 'SOP Writer', body: 'Draft your Statement of Purpose with AI, then polish it with a mentor.' },
    { target: '[data-tour="nav-visa-mock"]', title: 'AI Mock Visa Interview', body: 'Practise real visa interview questions by voice and get feedback before the actual interview.' },
    { target: '[data-tour="nav-ielts-checker"]', title: 'IELTS Essay Checker', body: 'Paste an IELTS essay and get a band score with tips to improve.' },
    { target: '[data-tour="nav-profile"]', title: 'Your profile', body: 'Keep your country, intake and education up to date so suggestions stay accurate. That\'s it, all the best! 🎓' },
  ];
  // Only accounts with a mentor profile see the Mentor Studio switch; students see one dashboard
  const isMentorAccount = Boolean(user?.isMentor || user?.mentorHandle || user?.role === 'mentor');
  const { verifiedLead, clearLead } = useLead();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  // Unread counselor messages (badge on the Messages tab)
  const [chatUnread, setChatUnread] = useState(0);
  const [chatLast, setChatLast] = useState(null); // latest counselor message, for the notification popup
  const [chatPopupOpen, setChatPopupOpen] = useState(false);
  useEffect(() => {
    if (!token) return undefined;
    const check = () => fetch(`${API_URL}/student-chat/unread`, {
      credentials: 'include',
      headers: token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      setChatUnread(d.unread);
      setChatLast(d.last || null);
    }).catch(() => {});
    const first = setTimeout(check, 0);
    const t = setInterval(() => { if (!document.hidden) check(); }, 15000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [token]);

  // "(1) UniCoach…" in the browser tab while a counselor message is unread
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = chatUnread > 0 ? `(${chatUnread}) ${base}` : base;
  }, [chatUnread]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileToolsSheetOpen, setMobileToolsSheetOpen] = useState(false);


  // Profile Editor state
  const [profileForm, setProfileForm] = useState({
    dreamCountry: '',
    dreamCourse: '',
    targetExam: '',
    targetScore: '',
    highestEducation: '',
    currentCity: '',
    preferredIntake: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Saved Universities DB State
  const [dbSavedUnis, setDbSavedUnis] = useState([]);
  const savedProgramSelection = useProgramSelection();
  const [loadingSavedUnis, setLoadingSavedUnis] = useState(false);
  const [savedFilterCategory, setSavedFilterCategory] = useState('all');

  useEffect(() => {
    fetchDbSavedUniversities();

    const handleSavedUpdate = () => {
      fetchDbSavedUniversities();
    };
    window.addEventListener('savedUnisUpdated', handleSavedUpdate);
    return () => window.removeEventListener('savedUnisUpdated', handleSavedUpdate);
  }, [token]);

  const fetchDbSavedUniversities = async () => {
    setLoadingSavedUnis(true);
    if (!token) {
      const local = localStorage.getItem('unicoach_saved_unis');
      if (local) {
        try { setDbSavedUnis(JSON.parse(local)); } catch (e) {}
      }
      setLoadingSavedUnis(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/saved-universities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.savedUniversities) {
          setDbSavedUnis(data.savedUniversities);
        }
      } else {
        // Fallback to local storage on 401 or non-200
        const local = localStorage.getItem('unicoach_saved_unis');
        if (local) {
          try { setDbSavedUnis(JSON.parse(local)); } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Error fetching DB saved universities:', err);
      const local = localStorage.getItem('unicoach_saved_unis');
      if (local) {
        try { setDbSavedUnis(JSON.parse(local)); } catch (e) {}
      }
    } finally {
      setLoadingSavedUnis(false);
    }
  };

  const handleExportSavedUniversities = () => {
    if (!dbSavedUnis || dbSavedUnis.length === 0) {
      alert('You have no saved universities in your shortlist yet.');
      return;
    }
    const filteredToExport = savedFilterCategory === 'all'
      ? dbSavedUnis
      : dbSavedUnis.filter(u => u.categoryTag === savedFilterCategory);

    exportUniversitiesToExcel(filteredToExport, {
      filename: `UniCoach_My_Saved_Universities_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: 'My Shortlist',
      studentProfile: profileForm,
      categoryFilter: savedFilterCategory
    });
  };

  const handleDeleteSavedUni = async (uniId, uniName) => {
    if (token) {
      try {
        const res = await fetch(`${API_URL}/saved-universities/${uniId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setDbSavedUnis(prev => prev.filter(u => u._id !== uniId));
          return;
        }
      } catch (err) {
        console.error('Failed to delete saved university from DB:', err);
      }
    }

    // Fallback for local
    const updated = dbSavedUnis.filter(u => u._id !== uniId && u.name !== uniName);
    setDbSavedUnis(updated);
    localStorage.setItem('unicoach_saved_unis', JSON.stringify(updated));
  };


  // Interactive Daily Tasks & Roadmap state
  const [checklist, setChecklist] = useState([]);
  const [dailyTaskFilter, setDailyTaskFilter] = useState('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('admissions');
  const [newTaskPriority, setNewTaskPriority] = useState('P0');
  const [isWhatsModalOpen, setIsWhatsModalOpen] = useState(false);
  const [counselorQuestion, setCounselorQuestion] = useState('');

  // SOP Builder State
  const [sopForm, setSopForm] = useState({
    name: user?.name || verifiedLead?.name || '',
    targetUni: '',
    targetCourse: '',
    undergradDegree: '',
    gpa: '',
    experience: '',
    keyProject: '',
    whyUni: '',
    careerGoal: ''
  });
  const [generatedSop, setGeneratedSop] = useState('');
  const [sopStep, setSopStep] = useState(1); // 1: Profile/Target, 2: Academics/Project, 3: Goals, 4: Preview

  // Redirect if not authenticated, or promote verifiedLead to user
  useEffect(() => {
    if (!user && !verifiedLead) {
      navigate('/');
    } else if (!user && verifiedLead && updateUser) {
      const synchedUser = {
        name: verifiedLead.name,
        email: verifiedLead.email,
        phone: verifiedLead.phone,
        role: 'user',
        dreamCountry: verifiedLead.dreamCountry || '',
        highestEducation: verifiedLead.highestEducation || '',
        currentCity: verifiedLead.currentCity || '',
        preferredIntake: verifiedLead.preferredIntake || ''
      };
      updateUser(synchedUser);
    }
  }, [user, verifiedLead, navigate, updateUser]);

  // Sync profile form and checklist state on load
  useEffect(() => {
    let initialTasks = DEFAULT_DAILY_TASKS;
    const localTasksStr = localStorage.getItem('unicoach_daily_tasks');
    if (localTasksStr) {
      try {
        const parsed = JSON.parse(localTasksStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialTasks = parsed;
        }
      } catch (e) {}
    } else if (user?.checklistState && Array.isArray(user.checklistState) && user.checklistState.length > 0) {
      if (user.checklistState[0]?.category) {
        initialTasks = user.checklistState;
      } else {
        // Map done state from legacy items into modern rich schema
        initialTasks = DEFAULT_DAILY_TASKS.map((t, idx) => {
          const oldMatch = user.checklistState[idx];
          return oldMatch ? { ...t, done: !!oldMatch.done } : t;
        });
      }
    }

    if (user) {
      setProfileForm({
        dreamCountry: user.dreamCountry || '',
        dreamCourse: user.dreamCourse || '',
        targetExam: user.targetExam || '',
        targetScore: user.targetScore || '',
        highestEducation: user.highestEducation || '',
        currentCity: user.currentCity || '',
        preferredIntake: user.preferredIntake || ''
      });
      setChecklist(initialTasks);
    } else if (verifiedLead) {
      setProfileForm({
        dreamCountry: verifiedLead.dreamCountry || '',
        dreamCourse: '',
        targetExam: '',
        targetScore: '',
        highestEducation: verifiedLead.highestEducation || '',
        currentCity: verifiedLead.currentCity || '',
        preferredIntake: verifiedLead.preferredIntake || ''
      });
      setChecklist(initialTasks);
    } else {
      setChecklist(initialTasks);
    }
  }, [user, verifiedLead]);

  // SOP Builder Helpers
  const handleGenerateSOP = () => {
    const { name, targetUni, targetCourse, undergradDegree, gpa, experience, keyProject, whyUni, careerGoal } = sopForm;
    if (!targetUni || !targetCourse || !undergradDegree) {
      setProfileMsg({ type: 'error', text: 'Please fill in Target University, Course, and Undergrad Degree!' });
      return;
    }

    const compiledSop = `STATEMENT OF PURPOSE

Dear Admissions Committee,

I, ${name || 'Candidate'}, am writing to express my eager interest in joining the ${targetCourse} program at ${targetUni}. My academic aspiration has always been to study at an elite global level, and I believe this program is the perfect crucible to refine my knowledge and propel my career to new horizons.

My academic journey is anchored by my undergraduate education in ${undergradDegree}${gpa ? ` (where I secured a GPA/academic score of ${gpa})` : ''}. During my undergraduate study, I worked extensively on multiple technical challenges. Most notably, I spearheaded a project: "${keyProject || 'Academic Capstone Research'}". This experience taught me how to tackle complex technical design parameters and gave me a firm foundation in analytical problem-solving.

${experience ? `Following my academic study, I joined the professional workforce, accumulating valuable industry experience: "${experience}". Working in collaborative industrial settings allowed me to apply theoretical concepts to real-world deployment challenges, refining my capability to work under tight constraints and deliver high-impact results.` : 'In addition to my coursework, I actively pursued independent academic research and case studies, expanding my boundary of knowledge and mastering key tools and methodologies relevant to my target domain.'}

I am specifically attracted to ${targetUni} for its outstanding curriculum in ${targetCourse}. In particular, I am highly motivated by ${whyUni || 'the world-class research infrastructure, expert faculty members, and collaborative student ecosystem'}. Leveraging these facilities will allow me to master cutting-edge paradigms and contribute housing quality innovations.

Upon graduation, my long-term career ambition is to work as a ${careerGoal || 'Specialist Professional'} in global industrial setups. I am confident that the rigorous academic environment at ${targetUni} will equip me with the specialized skillsets needed to realize my goals and make a meaningful impact. Thank you for considering my candidacy.

Sincerely,
${name || 'Candidate'}`;

    setGeneratedSop(compiledSop);
    setSopStep(4);
  };

  const handleDownloadSOP = () => {
    if (!generatedSop) return;
    const element = document.createElement("a");
    const file = new Blob([generatedSop], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${sopForm.name.replace(/\s+/g, '_')}_Statement_of_Purpose.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Always scroll to top immediately whenever activeTab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const resetScroll = () => {
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true });
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };

      resetScroll();
      const rafId = requestAnimationFrame(resetScroll);
      const timerId = setTimeout(resetScroll, 20);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
      };
    }
  }, [activeTab]);

  // Handle logout
  const handleLogout = async () => {
    if (logout) {
      try { await logout(); } catch (e) {}
    }
    if (clearLead) clearLead();
    clearUserStorage();
    navigate('/');
  };

  // Submit Profile Form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });

    // 1. If registered user with token, save to backend
    if (user && token) {
      try {
        const res = await fetch(`${API_URL}/writing/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(profileForm)
        });
        
        if (res.ok) {
          const data = await res.json();
          updateUser(data.user);
          setProfileMsg({ type: 'success', text: 'Profile parameters updated successfully!' });
        } else if (res.status === 401) {
          // Token expired or invalid
          setProfileMsg({ 
            type: 'error', 
            text: 'Your login session has expired. Please log in again to sync changes with the cloud.',
            showLogin: true 
          });
        } else {
          const data = await res.json().catch(() => ({}));
          setProfileMsg({ type: 'error', text: data.message || 'Failed to update profile settings.' });
        }
      } catch (err) {
        setProfileMsg({ type: 'error', text: 'Connection issue with backend server. Please try again.' });
      } finally {
        setSavingProfile(false);
      }
      return;
    }

    // 2. If guest lead or not logged in, save preferences locally
    try {
      const savedLeadStr = localStorage.getItem('lead_info');
      const leadObj = savedLeadStr ? JSON.parse(savedLeadStr) : {};
      const updatedLead = { ...leadObj, ...profileForm };
      localStorage.setItem('lead_info', JSON.stringify(updatedLead));
      setProfileMsg({ type: 'success', text: 'Preferences saved locally! Register to sync across all devices.' });
    } catch (e) {
      setProfileMsg({ type: 'error', text: 'Could not save preferences locally.' });
    } finally {
      setSavingProfile(false);
    }
  };

  // Toggle daily task / checklist item status
  const toggleChecklistItem = async (id) => {
    const updatedChecklist = checklist.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updatedChecklist);
    try {
      localStorage.setItem('unicoach_daily_tasks', JSON.stringify(updatedChecklist));
    } catch (e) {}

    if (user && token) {
      try {
        const res = await fetch(`${API_URL}/writing/checklist`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ checklistState: updatedChecklist })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          updateUser(data.user);
        }
      } catch (err) {
        console.error('Failed to sync checklist changes with database:', err);
      }
    }
  };

  // Add custom student task to roadmap
  const handleAddCustomTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `custom-${Date.now()}`,
      title: newTaskTitle.trim(),
      subtitle: 'Custom personal study abroad milestone created by student.',
      category: newTaskCategory,
      priority: newTaskPriority,
      stage: 'Personal Milestone',
      done: false,
      isCustom: true,
      actionLabel: 'Mark Done',
      actionTarget: null,
      estimatedTime: 'Self-paced'
    };
    const updated = [newTask, ...checklist];
    setChecklist(updated);
    setNewTaskTitle('');
    setIsAddingTask(false);
    try {
      localStorage.setItem('unicoach_daily_tasks', JSON.stringify(updated));
    } catch (e) {}

    if (user && token) {
      fetch(`${API_URL}/writing/checklist`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ checklistState: updated })
      }).catch(err => console.error(err));
    }
  };

  // Delete custom student task
  const handleDeleteCustomTask = (taskId, e) => {
    if (e) e.stopPropagation();
    const updated = checklist.filter(t => t.id !== taskId);
    setChecklist(updated);
    try {
      localStorage.setItem('unicoach_daily_tasks', JSON.stringify(updated));
    } catch (e) {}
    if (user && token) {
      fetch(`${API_URL}/writing/checklist`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ checklistState: updated })
      }).catch(err => console.error(err));
    }
  };

  // Trigger task shortcut action
  const handleTaskAction = (task, e) => {
    if (e) e.stopPropagation();
    if (!task.actionTarget) {
      toggleChecklistItem(task.id);
      return;
    }
    if (task.actionTarget === 'whatsapp') {
      setIsWhatsModalOpen(true);
      return;
    }
    if (task.actionTarget === 'overview') {
      setActiveTab('overview');
      return;
    }
    if (task.actionTarget === 'counselling' || task.actionTarget === 'talk-expert') {
      navigate('/book-consultation');
      return;
    }
    setActiveTab(OLD_TOOL_TABS[task.actionTarget] || task.actionTarget);
  };

  // Open 1-Click WhatsApp consultation
  const handleOpenWhatsAppChat = () => {
    const counselorPhone = '919876543210';
    const studentCountry = profileForm.dreamCountry || user?.dreamCountry || 'USA / UK / Canada';
    const studentCourse = profileForm.dreamCourse || user?.dreamCourse || 'Masters Program';
    const studentName = name || 'Student';
    const query = counselorQuestion.trim() || 'I need guidance regarding my target universities and application timeline.';
    const text = encodeURIComponent(
      `Hello UniCoach Support! 👋 My name is ${studentName}.\n\n` +
      `🎯 Dream Country: ${studentCountry}\n` +
      `🎓 Target Program: ${studentCourse}\n` +
      `💬 Query: ${query}\n\n` +
      `Please assist me with my study abroad questions. Thank you!`
    );
    window.open(`https://wa.me/${counselorPhone}?text=${text}`, '_blank');
    setIsWhatsModalOpen(false);
  };

  // Determine display info
  const name = user?.name || verifiedLead?.name || 'Guest User';
  const email = user?.email || verifiedLead?.email || 'N/A';
  const displayPhone = user?.phone || verifiedLead?.phone || 'N/A';

  const navigationGroups = [
    {
      groupTitle: 'MAIN DASHBOARD',
      items: [
        { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard size={16} /> },
        { 
          id: 'daily-tasks', 
          label: 'Daily Tasks & Roadmap', 
          icon: <ListChecks size={16} />, 
          badge: checklist.filter(t => !t.done).length > 0 ? `${checklist.filter(t => !t.done).length} Focus` : 'All Done', 
          badgeColor: checklist.filter(t => !t.done).length > 0 ? 'bg-orange-50 text-[#C04A1D] border border-orange-200/60' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
        },
        { id: 'saved-unis', label: 'Saved Shortlist', icon: <BookmarkCheck size={16} />, badge: dbSavedUnis.length > 0 ? `${dbSavedUnis.length}` : null, badgeColor: 'bg-orange-50 text-[#C04A1D] border border-orange-200/60' },
        { id: 'messages', label: 'Messages & Documents', icon: <MessageCircle size={16} />, badge: chatUnread > 0 ? `${chatUnread} new` : null, badgeColor: 'bg-[#DE5C2B] text-white' }
      ]
    },
    {
      groupTitle: 'SHORTLIST & PLAN',
      items: [
        { id: 'course-finder', label: 'Course Finder', icon: <GraduationCap size={16} />, badge: '98K+', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'scholarships', label: 'Scholarships', icon: <Award size={16} />, badge: 'FUNDING', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'eligibility-calculator', label: 'Admission Chances', icon: <Calculator size={16} />, badge: 'POPULAR', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'study-roadmap', label: 'AI 6-Month Roadmap', icon: <Compass size={16} />, badge: 'AI', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'education-loan', label: 'Education Loan', icon: <Landmark size={16} /> }
      ]
    },
    {
      groupTitle: 'WRITE & PRACTISE',
      items: [
        { id: 'sop-builder', label: 'SOP Writer', icon: <FileText size={16} />, badge: 'AI', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'visa-mock', label: 'AI Mock Visa Interview', icon: <Mic size={16} />, badge: 'VOICE', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'ielts-checker', label: 'IELTS Essay Checker', icon: <Sparkles size={16} />, badge: '0-9', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'visa-departure', label: 'Visa & Pre-Departure', icon: <Plane size={16} /> },
        { id: 'talk-expert', label: 'Talk to an Expert', icon: <Headphones size={16} />, badge: 'FREE', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' }
      ]
    },
    // Mentor Studio entry only for accounts that have a mentor profile
    ...(isMentorAccount ? [{
      groupTitle: 'CREATOR & MENTORSHIP',
      items: [
        { 
          id: 'mentor-studio', 
          label: 'Mentor Creator Studio', 
          icon: <Zap size={16} className="text-[#DE5C2B]" />, 
          badge: 'STUDIO', 
          badgeColor: 'bg-orange-50 text-[#DE5C2B] border border-orange-200' 
        }
      ]
    }] : []),
    {
      groupTitle: 'STUDENT ACCOUNT',
      items: [
        { id: 'profile', label: 'Profile Settings', icon: <Settings size={16} /> }
      ]
    }
  ];

  const handleOpenMentorStudio = () => {
    try {
      const saved = localStorage.getItem('unicoach_mentor_handle');
      if (saved) {
        navigate(`/unicoach/dashboard/${saved}`);
        return;
      }
    } catch (e) {}
    navigate('/unicoach/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#ECEAE6] pt-20 md:pt-24 pb-36 lg:pb-16 px-3 sm:px-6 lg:px-8">
      {studentTour.open && <ProductTour steps={STUDENT_TOUR} open onClose={studentTour.close} />}
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-0 lg:bg-white lg:rounded-[40px] lg:overflow-hidden lg:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]">

        {/* DESKTOP TOP COMMAND HEADER (Hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:block bg-[#F6F5F2] px-8 pt-7 pb-8"
        >
          {/* Row 1: identity, quick actions, account */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#111] text-white font-black flex items-center justify-center text-xl select-none">
                {name[0].toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-xl font-semibold text-slate-900">Student</p>
                <p className="text-xl text-slate-400">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isMentorAccount && (
                <button
                  onClick={handleOpenMentorStudio}
                  className="h-12 px-5 rounded-full border border-slate-200 bg-white hover:border-orange-200 text-slate-800 font-semibold text-sm flex items-center gap-2 cursor-pointer"
                  title="Switch to Mentor Studio"
                >
                  <Zap size={15} className="text-[#DE5C2B] fill-[#DE5C2B]" /> Mentor Studio
                </button>
              )}
              <div className="flex items-center gap-3 pl-1 pr-2">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-[#C04A1D] font-black flex items-center justify-center select-none">
                  {name[0].toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">{email || displayPhone}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="w-12 h-12 rounded-full border border-slate-200 bg-white hover:border-rose-200 hover:text-rose-600 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>

          {/* Row 2: today, tasks CTA and greeting on the left; the 1-min tour video on the right */}
          <div className="mt-8 grid grid-cols-1 xl:grid-cols-[auto_minmax(0,1fr)] gap-10 items-center">
          <div className="flex flex-col gap-6 min-w-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-[92px] h-[92px] rounded-full border border-slate-200 bg-[#F6F5F2] flex items-center justify-center text-4xl font-medium text-slate-900">
                {new Date().getDate()}
              </div>
              <div className="leading-tight pr-5 border-r border-slate-200">
                <p className="text-lg text-slate-900">{new Date().toLocaleDateString('en-US', { weekday: 'short' })},</p>
                <p className="text-lg text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
              </div>
              <button
                data-tour="my-tasks"
                onClick={() => setActiveTab('daily-tasks')}
                className="h-14 pl-7 pr-6 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-semibold text-sm whitespace-nowrap flex items-center gap-6 transition-colors cursor-pointer"
              >
                Show my tasks <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setActiveTab('daily-tasks')}
                aria-label="Open roadmap"
                className="relative w-14 h-14 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <CalendarDays size={19} />
                {checklist.some((t) => !t.done) && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DE5C2B]" />}
              </button>
              <button
                type="button"
                onClick={studentTour.start}
                className="h-14 px-5 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-[#DE5C2B] hover:text-[#DE5C2B] font-semibold text-sm whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles size={16} /> Take a tour
              </button>
            </div>

            <div className="relative w-fit">
            <button
              type="button"
              onClick={() => (chatUnread > 0 ? setChatPopupOpen((v) => !v) : setActiveTab('messages'))}
              aria-expanded={chatUnread > 0 ? chatPopupOpen : undefined}
              className="flex items-center gap-6 text-left cursor-pointer group"
            >
              <span className="leading-[1.1]">
                <span className="block text-[24px] xl:text-[28px] font-semibold tracking-tight text-slate-900 whitespace-nowrap">Hey {name.split(' ')[0]}, need help?</span>
                <span className="block text-[24px] xl:text-[28px] tracking-tight text-slate-400 group-hover:text-slate-500 whitespace-nowrap">Ask your counselor anything</span>
              </span>
              <span className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0 transition-colors ${
                chatUnread > 0 ? 'bg-[#DE5C2B] text-white' : 'bg-white text-slate-900 group-hover:text-[#DE5C2B]'
              }`}>
                {chatUnread > 0 && <span className="absolute inset-0 rounded-full bg-[#DE5C2B] animate-ping opacity-30" aria-hidden="true" />}
                <MessageCircle size={24} className="relative" />
                {chatUnread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 rounded-full bg-[#111] text-white text-xs font-bold flex items-center justify-center ring-4 ring-[#F6F5F2]">{chatUnread}</span>
                )}
              </span>
            </button>

            {/* New message popup */}
            {chatPopupOpen && chatUnread > 0 && (
              <div className="absolute right-0 top-full mt-3 w-[340px] bg-white rounded-[24px] shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] border border-slate-100 p-4 z-30 text-left">
                <p className="text-xs text-slate-500">{chatUnread} new message{chatUnread === 1 ? '' : 's'}</p>
                {chatLast && (
                  <div className="mt-2 p-3 rounded-2xl bg-[#F6F5F2]">
                    <p className="text-sm font-semibold text-slate-900">{chatLast.from}</p>
                    <p className="text-sm text-slate-600 mt-0.5 line-clamp-3">{chatLast.text}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{new Date(chatLast.at).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => { setChatPopupOpen(false); setActiveTab('messages'); }} className="flex-1 h-10 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-sm font-semibold cursor-pointer">Open chat</button>
                  <button type="button" onClick={() => setChatPopupOpen(false)} className="h-10 px-4 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 cursor-pointer">Later</button>
                </div>
              </div>
            )}
            </div>
          </div>
          <TutorialVideo
            src="/videos/tutorials/student-dashboard.mp4"
            poster="/videos/tutorials/student-dashboard-poster.jpg"
            title="Your first steps on UniCoach"
            duration="1 min"
            sound
            className="w-full max-w-[420px] xl:max-w-[560px] xl:justify-self-end"
          />
          </div>
        </motion.div>

        {/* MOBILE LIGHTWEIGHT HEADER (Only on Home/Overview tab) */}
        {activeTab === 'overview' ? (
          <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black flex items-center justify-center text-base shadow-sm shadow-indigo-200 flex-shrink-0 select-none">
                {name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black text-slate-900 truncate">
                    Hi, {name}!
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Active Student" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('messages')}
                aria-label={chatUnread > 0 ? `${chatUnread} new messages` : 'Messages'}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer ${chatUnread > 0 ? 'bg-[#DE5C2B] text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                <MessageCircle size={16} />
                {chatUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#111] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">{chatUnread}</span>
                )}
              </button>
              <button 
                onClick={() => {
                  setActiveTab('saved-unis');
                  fetchDbSavedUniversities();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                title="Saved Universities"
              >
                <BookmarkCheck size={13} />
                <span>{dbSavedUnis.length}</span>
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* MOBILE SUB-PAGE TOP BREADCRUMB BAR (When inside Shortlist, Roadmap, Profile, etc.) */
          <div className="lg:hidden flex items-center justify-between bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('overview');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft size={14} />
              <span>Dashboard</span>
            </button>

            <span className="text-xs font-black text-slate-800 truncate max-w-[150px]">
              {navigationGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Tool'}
            </span>

            <button
              type="button"
              onClick={() => setMobileToolsSheetOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              <Sparkles size={12} className="text-amber-500" />
              <span>Tools</span>
            </button>
          </div>
        )}

        {/* MAIN COMMAND CENTER GRID (Sidebar + Content Workspace) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:p-6">

          {/* SIDEBAR NAVIGATION PANEL (Desktop only) */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">

            {/* Desktop Sidebar Container (Hidden on mobile, uses native bottom navigation instead) */}
            <div className="bg-[#F6F5F2] p-3.5 rounded-[28px] space-y-4">
              
              {/* Dual Mode Switcher Pill (Student Tools vs Mentor Studio) — only when the account is also a mentor */}
              {isMentorAccount && (
              <div className="bg-white p-1 rounded-full flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <GraduationCap size={13} className="text-indigo-600" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenMentorStudio}
                  className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white/70 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap size={12} className="text-[#DE5C2B] fill-[#DE5C2B]" />
                  <span>Mentor Studio</span>
                </button>
              </div>
              )}

              {navigationGroups.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-2.5 py-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {group.groupTitle}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          data-tour={`nav-${item.id}`}
                          onClick={() => {
                            if (item.id === 'mentor-studio') {
                              handleOpenMentorStudio();
                              return;
                            }
                            if (item.id === 'talk-expert') {
                              navigate('/book-consultation');
                              return;
                            }
                            setActiveTab(item.id);
                            if (item.id === 'saved-unis') fetchDbSavedUniversities();
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer group ${
                            isActive 
                              ? 'bg-[#111] text-white font-semibold' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                              isActive 
                                ? 'bg-white/15 text-white' 
                                : 'bg-white text-slate-500 group-hover:text-[#DE5C2B]'
                            }`}>
                              {item.icon}
                            </div>
                            <span className="truncate text-left">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider flex-shrink-0 whitespace-nowrap ${
                              isActive 
                                ? 'bg-white/20 text-white' 
                                : item.badgeColor || 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Sidebar Footer Callout */}
              <div className="pt-2 border-t border-slate-100">
                <div className="p-4 rounded-[22px] bg-white space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <Sparkles size={14} className="text-[#DE5C2B]" />
                    <span>Need Guidance?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Get free expert university shortlisting & visa counselling.
                  </p>
                  <button 
                    onClick={() => navigate('/contact')}
                    className="w-full py-2.5 bg-[#DE5C2B] hover:bg-[#C04A1D] text-white rounded-full text-[11px] font-bold transition-all cursor-pointer"
                  >
                    Book Free Counselling
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT CANVAS */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">

            
            {/* COURSE FINDER (same as Toolkit: Course Finder) */}
            {activeTab === 'course-finder' && (
              <motion.div
                key="course-finder"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Suspense fallback={<TabLoading />}><SearchProgramsPage /></Suspense>
              </motion.div>
            )}

            {/* SCHOLARSHIPS (Course Finder with the scholarship view on) */}
            {activeTab === 'scholarships' && (
              <motion.div
                key="scholarships"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Suspense fallback={<TabLoading />}><SearchProgramsPage key="scholarships" highlight="scholarship" /></Suspense>
              </motion.div>
            )}

            {/* EDUCATION LOAN */}
            {activeTab === 'education-loan' && (
              <motion.div
                key="education-loan"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Suspense fallback={<TabLoading />}><EducationLoanPage /></Suspense>
              </motion.div>
            )}

            {/* IELTS ESSAY CHECKER */}
            {activeTab === 'ielts-checker' && (
              <motion.div
                key="ielts-checker"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Suspense fallback={<TabLoading />}><IeltsEvaluatorPage /></Suspense>
              </motion.div>
            )}

            {/* VISA & PRE-DEPARTURE */}
            {activeTab === 'visa-departure' && (
              <motion.div
                key="visa-departure"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Suspense fallback={<TabLoading />}><VisaAssistancePage /></Suspense>
              </motion.div>
            )}

            {/* DAILY TASKS & ROADMAP TAB */}
            {activeTab === 'daily-tasks' && (
              <motion.div
                key="daily-tasks"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Header card */}
                {(() => {
                  const done = checklist.filter((t) => t.done).length;
                  const pct = checklist.length ? Math.round((done / checklist.length) * 100) : 0;
                  const urgent = checklist.filter((t) => t.priority === 'P0' && !t.done).length;
                  return (
                    <div className="bg-white border border-slate-100 rounded-[28px] p-6 md:p-7 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-500">{profileForm.preferredIntake || 'Fall 2027'} cycle · Your roadmap</p>
                          <h2 className="text-2xl md:text-[28px] font-semibold text-slate-900 tracking-tight mt-1">Roadmap and tasks</h2>
                          <p className="text-sm text-slate-500 mt-1 max-w-2xl">Step-by-step tasks for your application: tests, SOP, documents and deadlines.</p>
                        </div>
                        <button
                          onClick={() => setIsAddingTask((prev) => !prev)}
                          className={`h-11 px-5 rounded-full text-sm font-semibold flex items-center gap-2 shrink-0 self-start transition-colors cursor-pointer ${
                            isAddingTask ? 'border border-slate-200 bg-white text-slate-700' : 'bg-[#DE5C2B] hover:bg-[#C04A1D] text-white'
                          }`}
                        >
                          {isAddingTask ? <X size={16} /> : <Plus size={16} />}
                          {isAddingTask ? 'Close' : 'Add my own task'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          ['Total steps', checklist.length, 'text-slate-900'],
                          ['Done', done, 'text-slate-900'],
                          ['Urgent', urgent, urgent ? 'text-[#C04A1D]' : 'text-slate-900'],
                          ['Ready', `${pct}%`, 'text-[#DE5C2B]'],
                        ].map(([label, value, cls]) => (
                          <div key={label} className="bg-[#F6F5F2] rounded-[22px] px-5 py-4">
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className={`text-3xl font-semibold mt-1 ${cls}`}>{value}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span>Readiness</span>
                          <span className="font-semibold text-slate-800">{done} of {checklist.length} done</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#ECEAE6] overflow-hidden">
                          <div className="h-full rounded-full bg-[#DE5C2B] transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Add Custom Task Inline Drawer */}
                <AnimatePresence>
                  {isAddingTask && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <form 
                        onSubmit={handleAddCustomTask}
                        className="bg-[#F6F5F2] p-6 rounded-[28px] space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                            <Plus size={16} className="text-[#DE5C2B]" /> Add your own task
                          </h3>
                          <span className="text-[11px] text-slate-400 font-bold">Personal Milestone</span>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="e.g. Schedule GRE exam date at test center, or Request LOR from Prof. Roy"
                            className="w-full h-12 px-5 bg-white border border-slate-200 rounded-full text-sm font-medium focus:border-[#DE5C2B] focus:outline-none"
                            required
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Category:</span>
                            <select
                              value={newTaskCategory}
                              onChange={(e) => setNewTaskCategory(e.target.value)}
                              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                            >
                              <option value="admissions">Admissions</option>
                              <option value="prep">Test Prep</option>
                              <option value="documents">Documents</option>
                              <option value="visa">Visa Prep</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Priority:</span>
                            <select
                              value={newTaskPriority}
                              onChange={(e) => setNewTaskPriority(e.target.value)}
                              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                            >
                              <option value="P0">P0 - Urgent</option>
                              <option value="P1">P1 - High</option>
                              <option value="P2">P2 - Routine</option>
                            </select>
                          </div>

                          <div className="ml-auto flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsAddingTask(false)}
                              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="h-10 px-6 bg-[#DE5C2B] hover:bg-[#C04A1D] text-white rounded-full text-sm font-semibold cursor-pointer"
                            >
                              Save task
                            </button>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide bg-[#F6F5F2] p-1.5 rounded-full">
                  {[
                    { id: 'all', label: 'All', count: checklist.length },
                    { id: 'today', label: 'Urgent', count: checklist.filter(t => t.priority === 'P0' && !t.done).length },
                    { id: 'admissions', label: 'Admissions', count: checklist.filter(t => t.category === 'admissions').length },
                    { id: 'prep', label: 'Test prep', count: checklist.filter(t => t.category === 'prep').length },
                    { id: 'documents', label: 'Documents', count: checklist.filter(t => t.category === 'documents').length },
                    { id: 'visa', label: 'Visa', count: checklist.filter(t => t.category === 'visa').length },
                    { id: 'completed', label: 'Done', count: checklist.filter(t => t.done).length }
                  ].map((f) => {
                    const isActive = dailyTaskFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setDailyTaskFilter(f.id)}
                        className={`h-10 px-4 rounded-full text-sm font-semibold transition-colors flex-shrink-0 flex items-center gap-2 cursor-pointer ${
                          isActive
                            ? 'bg-[#111] text-white'
                            : 'text-slate-600 hover:bg-white'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`min-w-6 h-6 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center ${
                          isActive ? 'bg-white/15 text-white' : 'bg-white text-slate-500'
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  {checklist
                    .filter((item) => {
                      if (dailyTaskFilter === 'all') return true;
                      if (dailyTaskFilter === 'today') return item.priority === 'P0' && !item.done;
                      if (dailyTaskFilter === 'completed') return item.done;
                      return item.category === dailyTaskFilter;
                    })
                    .map((task) => {
                      const priorityStyles = {
                        P0: 'bg-[#DE5C2B] text-white border-transparent',
                        P1: 'bg-orange-50 text-[#C04A1D] border-orange-100',
                        P2: 'bg-[#F6F5F2] text-slate-600 border-transparent'
                      }[task.priority || 'P1'];
                      const priorityLabel = { P0: 'Urgent', P1: 'High', P2: 'Routine' }[task.priority || 'P1'];
                      const categoryLabel = { admissions: 'Admissions', prep: 'Test prep', documents: 'Documents', visa: 'Visa' }[task.category] || task.category;
                      const categoryBadges = 'bg-[#F6F5F2] text-slate-600 border-transparent';

                      return (
                        <div
                          key={task.id}
                          className={`rounded-[24px] p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${
                            task.done
                              ? 'bg-[#F6F5F2] opacity-70'
                              : 'bg-white border border-slate-100 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <button
                              onClick={() => toggleChecklistItem(task.id)}
                              className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                                task.done
                                  ? 'bg-[#DE5C2B] text-white'
                                  : 'bg-[#F6F5F2] border border-slate-200 hover:border-[#DE5C2B] text-transparent hover:text-[#DE5C2B]'
                              }`}
                              title={task.done ? 'Mark as pending' : 'Mark as complete'}
                            >
                              <Check size={16} className={task.done ? 'opacity-100' : 'opacity-0'} />
                            </button>

                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${priorityStyles}`}>
                                  {priorityLabel}
                                </span>
                                {task.category && (
                                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${categoryBadges}`}>
                                    {categoryLabel}
                                  </span>
                                )}
                                {task.stage && (
                                  <span className="text-[11px] font-bold text-slate-400">
                                    • {task.stage}
                                  </span>
                                )}
                                {task.estimatedTime && (
                                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                    <Clock size={11} /> {task.estimatedTime}
                                  </span>
                                )}
                              </div>

                              <h3 className={`text-base font-semibold leading-snug ${
                                task.done ? 'text-slate-400 line-through' : 'text-slate-800'
                              }`}>
                                {task.title || task.text}
                              </h3>

                              {task.subtitle && (
                                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-3xl">
                                  {task.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                            {task.actionLabel && !task.done && (
                              <button
                                onClick={(e) => handleTaskAction(task, e)}
                                className="h-10 px-5 rounded-full bg-[#111] hover:bg-[#DE5C2B] text-white text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              >
                                <span>{task.actionLabel}</span>
                                <ArrowRight size={13} />
                              </button>
                            )}

                            {task.isCustom && (
                              <button
                                onClick={(e) => handleDeleteCustomTask(task.id, e)}
                                className="w-10 h-10 rounded-full border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer"
                                title="Delete custom task"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {checklist.filter((item) => {
                    if (dailyTaskFilter === 'all') return true;
                    if (dailyTaskFilter === 'today') return item.priority === 'P0' && !item.done;
                    if (dailyTaskFilter === 'completed') return item.done;
                    return item.category === dailyTaskFilter;
                  }).length === 0 && (
                    <div className="text-center py-12 px-4 bg-white border border-dashed border-slate-200 rounded-3xl space-y-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 size={24} />
                      </div>
                      <h4 className="text-sm font-black text-slate-700">No tasks in this category!</h4>
                      <p className="text-xs text-slate-400 font-medium">All clear for this filter. Check "All Tasks" to view full roadmap.</p>
                      <button
                        onClick={() => setDailyTaskFilter('all')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* MESSAGES & DOCUMENTS TAB (chat with the counselor) */}
            {activeTab === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <StudentMessages token={token} onUnreadChange={setChatUnread} />
              </motion.div>
            )}

            {/* SAVED UNIVERSITIES TAB */}
            {activeTab === 'saved-unis' && (
              <motion.div
                key="saved-unis"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200/70 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <BookmarkCheck className="text-[#DE5C2B]" size={26} /> 
                        My Saved Universities
                        <span className="px-3 py-1 bg-orange-50 text-[#C04A1D] rounded-full text-xs font-black">
                          {dbSavedUnis.length} Saved
                        </span>
                      </h2>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1">
                        Universities you bookmark during shortlisting are saved safely to your profile.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={fetchDbSavedUniversities}
                        aria-label="Refresh list"
                        title="Refresh list"
                        className="w-11 h-11 rounded-full border border-slate-200 bg-white hover:border-orange-200 text-slate-600 hover:text-[#DE5C2B] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <RefreshCw size={16} className={loadingSavedUnis ? 'animate-spin' : ''} />
                      </button>
                      <button
                        onClick={handleExportSavedUniversities}
                        disabled={dbSavedUnis.length === 0}
                        className="h-11 px-5 rounded-full border border-slate-200 bg-white hover:border-orange-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                        title="Download your shortlisted universities in Excel (.xlsx)"
                      >
                        <FileSpreadsheet size={16} className="text-emerald-600" />
                        <span>Excel</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('course-finder')}
                        className="h-11 px-6 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles size={15} /> Find more universities
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Tabs */}
                  {dbSavedUnis.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {['all', 'safe', 'target', 'dream'].map(cat => {
                        const counts = {
                          all: dbSavedUnis.length,
                          safe: dbSavedUnis.filter(u => u.categoryTag === 'safe').length,
                          target: dbSavedUnis.filter(u => u.categoryTag === 'target').length,
                          dream: dbSavedUnis.filter(u => u.categoryTag === 'dream').length
                        };
                        const labels = {
                          all: 'All Saved',
                          safe: '🛡️ Safe Backup',
                          target: '⚖️ Target Match',
                          dream: '🎯 Dream Reach'
                        };
                        return (
                          <button
                            key={cat}
                            onClick={() => setSavedFilterCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              savedFilterCategory === cat
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                            }`}
                          >
                            {labels[cat]} ({counts[cat]})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty State */}
                  {dbSavedUnis.length === 0 && !loadingSavedUnis && (
                    <div className="text-center py-16 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                        <BookmarkCheck size={32} />
                      </div>
                      <div className="max-w-md mx-auto space-y-1">
                        <h3 className="text-lg font-black text-slate-800">No Universities Saved Yet</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Use the AI University Shortlister tool to evaluate target universities and save your top recommendations to your profile!
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('course-finder')}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-indigo-150 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles size={16} /> Open University Shortlister
                      </button>
                    </div>
                  )}

                  {/* Loading Skeleton */}
                  {loadingSavedUnis && dbSavedUnis.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map(n => (
                        <div key={n} className="bg-slate-50 border border-slate-200 p-6 rounded-3xl animate-pulse space-y-4">
                          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                          <div className="h-10 bg-slate-200 rounded-2xl w-full"></div>
                          <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Saved Universities Cards Grid */}
                  {dbSavedUnis.length > 0 && (
                    <div className="space-y-4">
                      {dbSavedUnis
                        .filter(u => savedFilterCategory === 'all' || u.categoryTag === savedFilterCategory)
                        .map((uni) => (
                          <CourseFinderCard
                            key={uni._id || uni.name}
                            uni={uni}
                            isUniSaved={true}
                            onSaveUni={() => handleDeleteSavedUni(uni._id, uni.name)}
                            selectedProgramIds={savedProgramSelection.selectedIds}
                            onToggleProgramSelect={savedProgramSelection.toggleProgram}
                          />
                        ))}
                      <ProgramSelectionTools
                        selectedPrograms={savedProgramSelection.selectedPrograms}
                        onClearSelection={savedProgramSelection.clearSelection}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {user && user.role !== 'admin' && user.profileCompleted === false && !user.profileCompletedAt && (
                  <Link
                    to="/onboarding?next=/dashboard"
                    className="flex items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50/70 hover:bg-orange-50 p-4 sm:p-5 transition-colors"
                  >
                    <span className="w-10 h-10 rounded-xl bg-[#DE5C2B] text-white grid place-items-center text-lg shrink-0">✍️</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-bold text-slate-900">Complete your profile</span>
                      <span className="block text-xs text-slate-600">Dream country, course, intake and marks. 1 minute, and your shortlist and counsellor advice get much better.</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5">Complete</span>
                  </Link>
                )}
                <JourneyTracker />
                {(() => {
                  const doneCount = checklist.filter((t) => t.done).length;
                  const readiness = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0;
                  const ring = 2 * Math.PI * 52;
                  const tile = 'bg-[#F6F5F2] rounded-[28px] p-5';
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
                      {/* Target profile (the "card" tile) */}
                      <div className="xl:col-span-5 bg-white border border-slate-100 rounded-[28px] p-6 flex flex-col justify-between gap-6">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-slate-400">Target destination</p>
                            <p className="text-2xl font-semibold text-slate-900 mt-1">{profileForm.dreamCountry || 'Not set yet'}</p>
                          </div>
                          <button onClick={() => setActiveTab('profile')} className="h-9 px-4 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:border-orange-200 flex items-center gap-1.5 cursor-pointer">
                            <Edit3 size={12} /> Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          {[
                            ['Course', profileForm.dreamCourse],
                            ['Intake', profileForm.preferredIntake],
                            ['Exam', profileForm.targetExam ? `${profileForm.targetExam}${profileForm.targetScore ? ` ${profileForm.targetScore}` : ''}` : ''],
                          ].map(([k, v]) => (
                            <div key={k} className="min-w-0">
                              <p className="text-xs text-slate-400">{k}</p>
                              <p className="font-semibold text-slate-900 truncate" title={v || ''}>{v || '—'}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setActiveTab('course-finder')} className="h-11 px-6 rounded-full bg-[#111] hover:bg-black text-white text-sm font-semibold cursor-pointer">Find universities</button>
                          <button onClick={() => { setActiveTab('saved-unis'); fetchDbSavedUniversities(); }} className="h-11 px-6 rounded-full bg-[#F1F0EC] hover:bg-[#E9E7E2] text-slate-800 text-sm font-semibold cursor-pointer">Saved ({dbSavedUnis.length})</button>
                        </div>
                      </div>

                      {/* Readiness ring */}
                      <button onClick={() => setActiveTab('daily-tasks')} className="xl:col-span-3 bg-[#F6F5F2] rounded-[28px] p-5 flex flex-col items-center justify-center gap-3 cursor-pointer">
                        <span className="relative w-[148px] h-[148px] rounded-full bg-[#111] flex items-center justify-center">
                          <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
                            <circle cx="60" cy="60" r="52" fill="none" stroke="#DE5C2B" strokeWidth="6" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - readiness / 100)} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                          </svg>
                          <span className="text-center text-white">
                            <span className="block text-3xl font-semibold">{readiness}%</span>
                            <span className="block text-[11px] text-slate-400">Ready to apply</span>
                          </span>
                        </span>
                        <span className="text-xs text-slate-500">{doneCount} of {checklist.length} roadmap steps done</span>
                      </button>

                      {/* Messages */}
                      <button onClick={() => setActiveTab('messages')} className={`xl:col-span-4 ${tile} text-left flex flex-col justify-between gap-6 cursor-pointer hover:bg-[#F1F0EC] transition-colors`}>
                        <span className="flex items-center justify-between">
                          <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-800"><MessageCircle size={18} /></span>
                          {chatUnread > 0 && <span className="h-8 px-3 rounded-full bg-[#DE5C2B] text-white text-xs font-semibold flex items-center">{chatUnread} new</span>}
                        </span>
                        <span>
                          <span className="block text-2xl font-semibold text-slate-900">{chatUnread > 0 ? `${chatUnread} new message${chatUnread === 1 ? '' : 's'}` : 'Your counselor'}</span>
                          <span className="block text-sm text-slate-500 mt-1">Chat and share documents in one place</span>
                        </span>
                        <span className="text-sm font-semibold text-[#DE5C2B] inline-flex items-center gap-1">Open messages <ArrowRight size={14} /></span>
                      </button>

                      {/* Roadmap dots */}
                      <div className={`xl:col-span-4 ${tile}`}>
                        <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-800"><ListChecks size={18} /></span>
                        <p className="text-2xl font-semibold text-slate-900 mt-4">{checklist.length - doneCount} steps left</p>
                        <p className="text-xs text-slate-500">on your study abroad roadmap</p>
                        <div className="flex flex-wrap gap-1.5 mt-4" aria-hidden="true">
                          {checklist.slice(0, 30).map((t) => (
                            <span key={t.id} className={`w-3.5 h-3.5 rounded-full ${t.done ? 'bg-[#DE5C2B]' : 'bg-[#E4E2DD]'}`} />
                          ))}
                        </div>
                      </div>

                      {/* Saved universities */}
                      <div className={`xl:col-span-4 ${tile} flex flex-col justify-between`}>
                        <span className="flex items-center justify-between">
                          <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-800"><BookmarkCheck size={18} /></span>
                          {dbSavedUnis.length > 0 && (
                            <button onClick={handleExportSavedUniversities} className="h-8 px-3 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer" title="Download as Excel">
                              <FileSpreadsheet size={13} /> Excel
                            </button>
                          )}
                        </span>
                        <div className="mt-4">
                          <p className="text-4xl font-semibold text-slate-900">{dbSavedUnis.length}</p>
                          <p className="text-xs text-slate-500">universities shortlisted</p>
                        </div>
                        <button onClick={() => { setActiveTab('saved-unis'); fetchDbSavedUniversities(); }} className="mt-4 text-sm font-semibold text-[#DE5C2B] inline-flex items-center gap-1 cursor-pointer">View shortlist <ArrowRight size={14} /></button>
                      </div>

                      {/* Quick AI tools */}
                      <div className={`xl:col-span-4 ${tile}`}>
                        <p className="text-sm font-semibold text-slate-900 mb-3">Quick tools</p>
                        <div className="space-y-2">
                          {[
                            ['eligibility-calculator', 'Admission chances', <Calculator key="i" size={15} />],
                            ['course-finder', 'Course finder', <GraduationCap key="i" size={15} />],
                            ['daily-tasks', 'Roadmap and tasks', <Route key="i" size={15} />],
                          ].map(([id, label, icon]) => (
                            <button key={id} onClick={() => setActiveTab(id)} className="w-full h-11 px-2 rounded-full bg-white hover:bg-[#FDF3EE] flex items-center gap-3 text-sm text-slate-800 cursor-pointer">
                              <span className="w-8 h-8 rounded-full bg-orange-50 text-[#DE5C2B] flex items-center justify-center">{icon}</span>
                              <span className="flex-1 text-left">{label}</span>
                              <ChevronRight size={15} className="text-slate-400 mr-2" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Roadmap list */}
                      <div className="md:col-span-2 xl:col-span-12 bg-white border border-slate-100 rounded-[28px] p-6">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div>
                            <p className="text-lg font-semibold text-slate-900">Next steps</p>
                            <p className="text-xs text-slate-500">Your top priorities for this application cycle</p>
                          </div>
                          <button onClick={() => setActiveTab('daily-tasks')} className="h-10 px-5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:border-orange-200 flex items-center gap-1.5 cursor-pointer">
                            All tasks <ArrowRight size={13} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {checklist.filter((t) => !t.done).slice(0, 6).map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-full bg-[#F6F5F2]">
                              <button
                                onClick={() => toggleChecklistItem(item.id)}
                                aria-label={`Mark ${item.title || item.text} done`}
                                className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-[#DE5C2B] flex items-center justify-center shrink-0 cursor-pointer text-transparent hover:text-[#DE5C2B]"
                              >
                                <Check size={15} />
                              </button>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-slate-900 truncate">{item.title || item.text}</span>
                                {item.subtitle && <span className="block text-xs text-slate-500 truncate">{item.subtitle}</span>}
                              </span>
                              {item.actionLabel && (
                                <button onClick={(e) => handleTaskAction(item, e)} className="h-9 px-4 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-xs font-semibold shrink-0 cursor-pointer">
                                  {item.actionLabel}
                                </button>
                              )}
                            </div>
                          ))}
                          {checklist.length > 0 && checklist.every((t) => t.done) && (
                            <p className="text-sm text-slate-500">All steps done. Great work.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── MENTOR STUDIO PROMOTION ── */}
                <div className="bg-[#F6F5F2] rounded-[28px] p-6 md:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="max-w-2xl">
                    <p className="text-xs text-slate-500">UniCoach mentorship · 0% platform commission</p>
                    <p className="text-xl md:text-2xl font-semibold text-slate-900 mt-1">Studying abroad already? Guide others and earn.</p>
                    <p className="text-sm text-slate-500 mt-1">Host 1:1 calls, answer questions and review SOPs. You keep your full fee minus only Razorpay's charge.</p>
                  </div>
                  <button
                    type="button"
                    onClick={isMentorAccount ? handleOpenMentorStudio : () => navigate('/unicoach/apply')}
                    className="h-12 px-7 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-sm font-semibold flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    {isMentorAccount ? 'Open Mentor Studio' : 'Become a mentor'} <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PROFILE SETTINGS TAB */}
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm max-w-3xl mx-auto"
              >
                <div className="space-y-2 mb-6">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <Edit3 className="text-indigo-500" size={20} /> Update Student Profile Settings
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold">Customize your dream destination details to help our counsellors shortlist target colleges.</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {profileMsg.text && (
                    <div className={`p-4 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-between gap-3 flex-wrap ${
                      profileMsg.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80' 
                        : 'bg-rose-50 text-rose-800 border border-rose-200/80'
                    }`}>
                      <div className="flex items-center gap-2">
                        {profileMsg.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" /> : <AlertTriangle size={16} className="text-rose-600 flex-shrink-0" />}
                        <span>{profileMsg.text}</span>
                      </div>
                      {profileMsg.showLogin && (
                        <button
                          type="button"
                          onClick={() => openLoginModal && openLoginModal()}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all shadow-xs flex-shrink-0"
                        >
                          Log In Again
                        </button>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <PremiumDropdown
                        label="Dream Country"
                        labelIcon={<Globe size={14} className="text-indigo-600" />}
                        value={profileForm.dreamCountry}
                        onChange={(val) => setProfileForm({ ...profileForm, dreamCountry: val })}
                        accent="indigo"
                        searchable={true}
                        searchPlaceholder="Search 160+ countries..."
                        placeholder="Select Dream Country"
                        options={ALL_COUNTRY_OPTIONS.filter(c => c.value !== 'All')}
                      />
                    </div>

                    <div className="relative">
                      <PremiumDropdown
                        label="Dream Course / Field"
                        labelIcon={<BookOpen size={14} className="text-indigo-600" />}
                        value={profileForm.dreamCourse}
                        onChange={(val) => setProfileForm({ ...profileForm, dreamCourse: val })}
                        accent="indigo"
                        searchable={true}
                        creatable={true}
                        defaultIcon={<BookOpen size={14} className="text-indigo-600" />}
                        searchPlaceholder="Search or type custom course..."
                        placeholder="e.g. MS in Computer Science"
                        options={POPULAR_COURSES}
                      />
                    </div>

                    <div className="relative">
                      <PremiumDropdown
                        label="Target Exam"
                        value={profileForm.targetExam}
                        onChange={(val) => setProfileForm({ ...profileForm, targetExam: val })}
                        accent="indigo"
                        placeholder="Select Exam"
                        options={[
                          { value: 'IELTS', label: 'IELTS', icon: '📝', description: 'International English Language Testing System' },
                          { value: 'GRE', label: 'GRE', icon: '🎯', description: 'Graduate Record Examination' },
                          { value: 'TOEFL', label: 'TOEFL', icon: '🌐', description: 'Test of English as a Foreign Language' },
                          { value: 'PTE', label: 'PTE', icon: '💻', description: 'Pearson Test of English' },
                          { value: 'GMAT', label: 'GMAT', icon: '📈', description: 'Graduate Management Admission Test' },
                          { value: 'SAT', label: 'SAT', icon: '📚', description: 'Scholastic Assessment Test' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">Target Score</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 7.5 or 320" 
                        value={profileForm.targetScore}
                        onChange={(e) => setProfileForm({ ...profileForm, targetScore: e.target.value })}
                        className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">Highest Education</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Bachelor of Technology" 
                        value={profileForm.highestEducation}
                        onChange={(e) => setProfileForm({ ...profileForm, highestEducation: e.target.value })}
                        className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">Current City</label>
                      <input 
                        type="text" 
                        placeholder="e.g. New Delhi" 
                        value={profileForm.currentCity}
                        onChange={(e) => setProfileForm({ ...profileForm, currentCity: e.target.value })}
                        className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">Preferred Intake</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Fall 2027" 
                        value={profileForm.preferredIntake}
                        onChange={(e) => setProfileForm({ ...profileForm, preferredIntake: e.target.value })}
                        className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={savingProfile}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={16} />
                    {savingProfile ? 'Saving Parameters...' : 'Save Profile Details'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* AI SOP BUILDER TAB */}
            {activeTab === 'sop-builder' && (
              <motion.div 
                key="sop-builder"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Suspense fallback={<TabLoading />}><AiSopGenerator initialProfile={profileForm} /></Suspense>
              </motion.div>
            )}

            {/* AI MOCK VISA INTERVIEW STUDIO TAB */}
            {activeTab === 'visa-mock' && (
              <motion.div 
                key="visa-mock"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Suspense fallback={<TabLoading />}><AiVisaInterviewPrep studentProfile={profileForm} /></Suspense>
              </motion.div>
            )}

            {/* AI 6-MONTH STRATEGIC ROADMAP TAB */}
            {activeTab === 'study-roadmap' && (
              <motion.div 
                key="study-roadmap"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Suspense fallback={<TabLoading />}><AiStudyRoadmap studentProfile={profileForm} /></Suspense>
              </motion.div>
            )}

            {/* ADMISSION & SCHOLARSHIP ELIGIBILITY CALCULATOR TAB */}
            {activeTab === 'eligibility-calculator' && (
              <motion.div 
                key="eligibility-calculator"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <Suspense fallback={<TabLoading />}><EligibilityCalculatorPage /></Suspense>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>

    {/* NATIVE MOBILE APP BOTTOM NAVIGATION BAR */}
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(15,23,42,0.08)] px-2 py-1.5 flex items-center justify-around select-none">
      {/* 1. Home / Overview */}
      <button
        type="button"
        onClick={() => {
          setActiveTab('overview');
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'overview' ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800 font-semibold'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600 scale-110' : ''}`}>
          <LayoutDashboard size={20} />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Home</span>
      </button>

      {/* 2. Saved Shortlist */}
      <button
        type="button"
        onClick={() => {
          setActiveTab('saved-unis');
          fetchDbSavedUniversities();
        }}
        className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'saved-unis' ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800 font-semibold'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'saved-unis' ? 'bg-indigo-50 text-indigo-600 scale-110' : ''}`}>
          <BookmarkCheck size={20} />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Shortlist</span>
        {dbSavedUnis.length > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
            {dbSavedUnis.length}
          </span>
        )}
      </button>

      {/* 3. CENTER ACTION BUTTON: AI Suite & All Tools */}
      <button
        type="button"
        onClick={() => setMobileToolsSheetOpen(true)}
        className="relative -mt-5 flex flex-col items-center justify-center cursor-pointer group"
        aria-label="Open AI Tools and Suite"
      >
        <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 ring-4 ring-white group-hover:scale-105 active:scale-95 transition-all">
          <Sparkles size={22} className="animate-pulse text-amber-300" />
        </div>
        <span className="text-[10px] font-black text-indigo-600 tracking-tight mt-1">AI Tools</span>
      </button>

      {/* 4. Daily Tasks / Roadmap */}
      <button
        type="button"
        onClick={() => {
          setActiveTab('daily-tasks');
        }}
        className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'daily-tasks' ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800 font-semibold'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'daily-tasks' ? 'bg-indigo-50 text-indigo-600 scale-110' : ''}`}>
          <CheckSquare size={20} />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Roadmap</span>
        {checklist.filter(t => !t.done).length > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
            {checklist.filter(t => !t.done).length}
          </span>
        )}
      </button>

      {/* 5. Account / Profile */}
      <button
        type="button"
        onClick={() => {
          setActiveTab('profile');
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
          activeTab === 'profile' ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800 font-semibold'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600 scale-110' : ''}`}>
          <Settings size={20} />
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Account</span>
      </button>
    </nav>

    {/* NATIVE MOBILE TOOLS BOTTOM SHEET (Drawer) */}
    <AnimatePresence>
      {mobileToolsSheetOpen && (
        <div className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileToolsSheetOpen(false)}
            className="fixed inset-0 w-screen h-screen min-h-[100dvh] bg-slate-900/70 backdrop-blur-xs cursor-pointer"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 bg-white rounded-t-[32px] max-h-[85vh] overflow-y-auto p-5 pb-8 shadow-2xl border-t border-slate-100 space-y-5"
          >
            {/* Drag handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Sparkles size={16} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">UniCoach Suite</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Select any tool to switch instantly</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileToolsSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Categorized Groups */}
            {navigationGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                  {group.groupTitle}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === 'mentor-studio') {
                            handleOpenMentorStudio();
                            setMobileToolsSheetOpen(false);
                            return;
                          }
                          if (item.id === 'talk-expert') {
                            setMobileToolsSheetOpen(false);
                            navigate('/book-consultation');
                            return;
                          }
                          setActiveTab(item.id);
                          if (item.id === 'saved-unis') fetchDbSavedUniversities();
                          setMobileToolsSheetOpen(false);
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl text-xs transition-all duration-150 text-left cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-md shadow-indigo-200'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-white text-indigo-600 shadow-xs border border-slate-100'
                          }`}>
                            {item.icon}
                          </div>
                          <span className="font-bold truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider flex-shrink-0 ml-2 ${
                            isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-200 text-slate-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
);
};

export default UserDashboard;
