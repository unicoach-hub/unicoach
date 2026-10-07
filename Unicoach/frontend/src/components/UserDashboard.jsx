import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Globe, Calendar, GraduationCap, 
  MapPin, Compass, ClipboardList, CheckCircle2, LogOut, 
  LayoutDashboard, Keyboard, History, Award, CheckSquare, 
  Edit3, Trophy, Timer, Flame, Play, RefreshCw, Send, AlertTriangle,
  Zap, ShieldAlert, Volume2, VolumeX, FileText, Calculator, Sparkles,
  BookmarkCheck, Trash2, ExternalLink, ShieldCheck, Target,
  Menu, X, ChevronRight, ChevronDown, Layers, Settings,
  Clock, ArrowRight, ArrowLeft, Check, Plus, MessageCircle, FileCheck, Star, Filter, CheckCircle,
  BookOpen, FileSpreadsheet, Download,
  School, ClipboardCheck, HandCoins, FilePenLine, Mic, Route, Wallet, ListChecks, NotebookPen, CalendarDays, BookOpenCheck
} from 'lucide-react';
import UniversityShortlister from './UniversityShortlister';
import ScholarshipShortlister from './ScholarshipShortlister';
import UniversityLogo from './UniversityLogo';
import PremiumDropdown from './PremiumDropdown';
import IeltsAiEvaluationModal from './IeltsAiEvaluationModal';
import AiSopGenerator from './AiSopGenerator';
import AiVisaInterviewPrep from './AiVisaInterviewPrep';
import AiStudyRoadmap from './AiStudyRoadmap';
import EligibilityCalculatorPage from '../pages/EligibilityCalculatorPage';
import CourseFinderCard from './CourseFinderCard';
import ProgramSelectionTools from './ProgramSelectionTools';
import { useProgramSelection } from '../utils/useProgramSelection';
import { POPULAR_COURSES, ALL_COUNTRY_OPTIONS } from '../utils/shortlistOptions';
import { exportUniversitiesToExcel } from '../utils/excelExporter';
import { API_BASE_URL } from '../config';
import { clearUserStorage } from '../utils/userStorage';

const API_URL = API_BASE_URL;

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
    actionLabel: 'Launch Shortlister',
    actionTarget: 'shortlister',
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
    actionLabel: 'Start IELTS Mock',
    actionTarget: 'ielts-simulator',
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
    actionLabel: 'Calculate Costs',
    actionTarget: 'budget-calculator',
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
    actionTarget: 'scholarship-shortlister',
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

const passages = [
  {
    id: 1,
    title: 'Easy - Study Abroad Journey',
    difficulty: 'Easy',
    text: 'Studying abroad is a transformative journey that extends far beyond academic learning. It challenges your perspectives, builds global networks, and develops vital life skills.'
  },
  {
    id: 2,
    title: 'Medium - Statement of Purpose',
    difficulty: 'Medium',
    text: 'Writing a compelling Statement of Purpose is key to securing admission. It requires clarity of thought, a logical flow of your past achievements, and a strong explanation of your future goals.'
  },
  {
    id: 3,
    title: 'Hard - Standardized Exam Strategy',
    difficulty: 'Hard',
    text: 'Achieving a high score in standardized tests like IELTS, TOEFL, or GRE requires consistent practice and strategy. Focus on managing your time effectively, understanding the section formats, and refining your language skills.'
  }
];

// Confetti particle effect canvas component for victory celebration
const ConfettiCanvas = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId;
    let particles = [];
    const colors = ['#f43f5e', '#DE5C2B', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.08 + 0.02,
        tiltAngle: 0,
        vy: Math.random() * 2.5 + 1.5,
        vx: Math.random() * 2 - 1
      });
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.tiltAngle) * 0.4;
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 10;
        
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });
      
      particles.forEach(p => {
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full z-10" />;
};

const UserDashboard = () => {
  const { user, token, updateUser, logout, openLoginModal } = useAuth();
  // Only accounts with a mentor profile see the Mentor Studio switch; students see one dashboard
  const isMentorAccount = Boolean(user?.isMentor || user?.mentorHandle || user?.role === 'mentor');
  const { verifiedLead, clearLead } = useLead();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
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

  // Budget Calculator State
  const [calculatorCountry, setCalculatorCountry] = useState('USA');
  const [calculatorDegree, setCalculatorDegree] = useState('Masters');
  const [calculatorAccommodation, setCalculatorAccommodation] = useState('Off-Campus Shared');

  // IELTS Simulator State
  const [ieltsTopic, setIeltsTopic] = useState('');
  const [ieltsEssay, setIeltsEssay] = useState('');
  const [ieltsTimeRemaining, setIeltsTimeRemaining] = useState(2400); // 40 mins
  const [ieltsActive, setIeltsActive] = useState(false);
  const [ieltsHistory, setIeltsHistory] = useState([]);
  const [savingIelts, setSavingIelts] = useState(false);
  const [ieltsMsg, setIeltsMsg] = useState({ type: '', text: '' });
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const ieltsTimerRef = useRef(null);

  const ieltsTopics = [
    'Some people believe that university education should be free for everyone, while others argue that students should pay for their tuition. Discuss both views and give your opinion.',
    'Many countries now face major problems with high levels of waste. What are the causes of this problem, and what measures can be taken to reduce waste?',
    'In many cities, the number of private cars is increasing rapidly, causing traffic congestion and air pollution. What are the effects of this trend, and what are the solutions?',
    'With the development of technology, online learning is becoming more popular. Do the advantages of this trend outweigh the disadvantages?',
    'International travel has become cheaper and more common. Some people believe that tourism has positive effects on countries, while others think it has negative impacts. Discuss both views.'
  ];

  const costDatabase = {
    USA: {
      currency: 'USD',
      symbol: '$',
      inrRate: 85,
      tuition: { Masters: 35000, Bachelors: 45000 },
      living: {
        rent: { 'On-Campus Dorm': 12000, 'Off-Campus Shared': 7200, 'Private Studio': 16000 },
        food: 3600,
        insurance: 1500,
        transport: 1200,
        misc: 2000
      },
      scholarships: [
        { name: 'Fulbright-Nehru Master\'s Fellowship', coverage: 'Full Tuition & Living stipend', eligibility: 'Graduate applicants with 3+ years work exp' },
        { name: 'Inlaks Shivdasani Foundation Scholarship', coverage: 'Up to $100,000', eligibility: 'Indian citizens under 30 with outstanding records' },
        { name: 'University Merit-Based Waivers', coverage: '10% - 50% tuition waiver', eligibility: 'Auto-considered based on high GPA & GRE/IELTS' }
      ]
    },
    UK: {
      currency: 'GBP',
      symbol: '£',
      inrRate: 110,
      tuition: { Masters: 22000, Bachelors: 26000 },
      living: {
        rent: { 'On-Campus Dorm': 8000, 'Off-Campus Shared': 5400, 'Private Studio': 11000 },
        food: 3000,
        insurance: 900,
        transport: 1000,
        misc: 1800
      },
      scholarships: [
        { name: 'Chevening Scholarship (UK Govt)', coverage: 'Full Tuition, Flight & living allowance', eligibility: 'Masters applicants with leadership potential' },
        { name: 'Commonwealth Scholarship', coverage: 'Full tuition & stipend', eligibility: 'Indian citizens applying for Masters/PhD' },
        { name: 'Great Scholarships', coverage: 'Minimum £10,000 tuition fee contribution', eligibility: 'Indian passport holders holding UK admission offer' }
      ]
    },
    Canada: {
      currency: 'CAD',
      symbol: 'C$',
      inrRate: 63,
      tuition: { Masters: 28000, Bachelors: 34000 },
      living: {
        rent: { 'On-Campus Dorm': 10000, 'Off-Campus Shared': 6600, 'Private Studio': 14000 },
        food: 3200,
        insurance: 1100,
        transport: 950,
        misc: 1700
      },
      scholarships: [
        { name: 'Vanier Canada Graduate Scholarships', coverage: 'C$50,000 per year (3 years)', eligibility: 'PhD candidates with stellar academic achievements' },
        { name: 'Lester B. Pearson International Scholarship', coverage: 'Full Tuition, books, residence & incidental fees', eligibility: 'Outstanding international undergrad applicants' },
        { name: 'Ontario Graduate Scholarship (OGS)', coverage: 'C$15,000 per year', eligibility: 'Meritorious Masters & PhD applicants in Ontario' }
      ]
    },
    Australia: {
      currency: 'AUD',
      symbol: 'A$',
      inrRate: 56,
      tuition: { Masters: 38000, Bachelors: 42000 },
      living: {
        rent: { 'On-Campus Dorm': 14000, 'Off-Campus Shared': 8400, 'Private Studio': 18000 },
        food: 4000,
        insurance: 800,
        transport: 1100,
        misc: 2200
      },
      scholarships: [
        { name: 'Australia Awards Scholarships', coverage: 'Full Tuition, air travel & living allowance', eligibility: 'Indo-Pacific graduate students' },
        { name: 'Destination Australia Scholarship', coverage: 'Up to A$15,000 per year', eligibility: 'Students enrolling in regional university campuses' },
        { name: 'Vice-Chancellor\'s International Scholarships', coverage: '10% to 50% tuition discount', eligibility: 'Awarded dynamically on admission GPA merit' }
      ]
    }
  };

  // Typing Game state
  const [selectedPassage, setSelectedPassage] = useState(passages[0]);
  const [userInput, setUserInput] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  
  // Driving animations state
  const [streak, setStreak] = useState(0);
  const [isBoosted, setIsBoosted] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [crashesCount, setCrashesCount] = useState(0);

  // Time Limit and Multi-lap Game Loop states
  const [timeLimit, setTimeLimit] = useState(0); // 0 = Unlimited/Free, 120 = 2m, 180 = 3m, 300 = 5m
  const [completedLapsChars, setCompletedLapsChars] = useState(0);
  const [completedLapsErrors, setCompletedLapsErrors] = useState(0);

  // Game loop refs
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const prevErrorsRef = useRef(0);

  // High-Speed Racing Game Revamp States & Refs
  const [countdown, setCountdown] = useState(null);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('typing_game_muted') === 'true';
    }
    return false;
  });

  const audioCtxRef = useRef(null);
  const engineOscRef = useRef(null);
  const engineGainRef = useRef(null);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtxRef.current = new AudioContext();
    } catch (err) {
      console.error('Failed to initialize AudioContext', err);
    }
  };

  const playSound = (type) => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    try {
      const now = ctx.currentTime;
      if (type === 'countdown-tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'countdown-go') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const frequency = Math.min(1000, 600 + (streak * 12));
        osc.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(800, now);
        osc2.frequency.exponentialRampToValueAtTime(250, now + 0.18);
        gain2.gain.setValueAtTime(0.03, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.18);
      } else if (type === 'boost') {
        const notes = [440, 554, 659, 880, 1109];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.04);
          gain.gain.setValueAtTime(0.03, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.12);
        });
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.05, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.25);
        });
      }
    } catch (err) {
      console.error('Audio playback failed', err);
    }
  };

  const startEngineSound = () => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      stopEngineSound();

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      engineOscRef.current = osc;
      engineGainRef.current = gain;
    } catch (err) {
      console.error('Failed to start engine hum', err);
    }
  };

  const updateEnginePitch = (currentWpm, currentGear) => {
    if (isMuted || !engineOscRef.current || !engineGainRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    try {
      const now = ctx.currentTime;
      let baseFreq = 40;
      if (currentGear === '1') baseFreq = 45 + currentWpm * 1.5;
      else if (currentGear === '2') baseFreq = 50 + (currentWpm - 25) * 1.8;
      else if (currentGear === '3') baseFreq = 55 + (currentWpm - 45) * 2.0;
      else if (currentGear === '4') baseFreq = 60 + (currentWpm - 65) * 2.2;
      else if (currentGear === '5') baseFreq = 65 + (currentWpm - 85) * 2.5;

      const targetFreq = Math.min(220, Math.max(40, baseFreq));
      engineOscRef.current.frequency.setTargetAtTime(targetFreq, now, 0.1);
      
      const targetVol = Math.min(0.04, 0.01 + (currentWpm / 150) * 0.03);
      engineGainRef.current.gain.setTargetAtTime(targetVol, now, 0.1);
    } catch (err) {
      console.error('Failed to update engine pitch', err);
    }
  };

  const stopEngineSound = () => {
    try {
      if (engineOscRef.current) {
        engineOscRef.current.stop();
        engineOscRef.current.disconnect();
        engineOscRef.current = null;
      }
      if (engineGainRef.current) {
        engineGainRef.current.disconnect();
        engineGainRef.current = null;
      }
    } catch (err) {
      console.error('Failed to stop engine sound', err);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const nextVal = !prev;
      localStorage.setItem('typing_game_muted', String(nextVal));
      if (nextVal) {
        stopEngineSound();
      } else if (testStarted && !testFinished) {
        setTimeout(() => startEngineSound(), 50);
      }
      return nextVal;
    });
  };

  // Update engine hum pitch in real-time based on typing parameters
  useEffect(() => {
    if (testStarted && !testFinished && !isMuted) {
      updateEnginePitch(wpm, getGear());
    }
  }, [wpm, testStarted, testFinished, isMuted]);

  // History & Statistics state
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    avgWpm: 0,
    bestWpm: 0,
    avgAccuracy: 0,
    bestScore: 0
  });
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  // Fetch writing history and statistics (with LocalStorage deduplicated backup)
  const fetchHistoryAndStats = async () => {
    setLoadingHistory(true);
    let apiHistory = [];
    
    // 1. Fetch from Local Storage (Backup)
    const localHistoryStr = localStorage.getItem('local_writing_history');
    let localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : [];
    
    // 2. Fetch from Backend (If logged in as full User)
    if (user && token) {
      try {
        const historyRes = await fetch(`${API_URL}/writing/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (historyRes.ok) {
          apiHistory = await historyRes.json();
        }

        const statsRes = await fetch(`${API_URL}/writing/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error('Failed to load stats/history from backend:', err);
      }
    }

    // Combine history, deduplicating entries by createdAt or id
    const combinedHistory = [...apiHistory];
    localHistory.forEach(localItem => {
      const exists = combinedHistory.some(apiItem => 
        new Date(apiItem.createdAt).getTime() === new Date(localItem.createdAt).getTime()
      );
      if (!exists) {
        combinedHistory.push(localItem);
      }
    });

    // Sort by date desc
    combinedHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setHistory(combinedHistory);

    // Calculate guest stats if not logged in
    if (!user || stats.totalTests === 0) {
      const sessions = combinedHistory;
      if (sessions.length > 0) {
        let totalWpm = 0;
        let totalAccuracy = 0;
        let bestWpm = 0;
        let bestScore = 0;

        sessions.forEach(s => {
          totalWpm += s.wpm;
          totalAccuracy += s.accuracy;
          if (s.wpm > bestWpm) bestWpm = s.wpm;
          if (s.score > bestScore) bestScore = s.score;
        });

        setStats({
          totalTests: sessions.length,
          avgWpm: Math.round(totalWpm / sessions.length),
          bestWpm,
          avgAccuracy: Math.round(totalAccuracy / sessions.length),
          bestScore
        });
      }
    }

    setLoadingHistory(false);
  };

  // Delete individual writing session
  const handleDeleteHistoryItem = async (session) => {
    if (!window.confirm('Are you sure you want to delete this test record?')) return;
    
    // 1. Delete from backend if logged in & has _id
    if (session._id && token) {
      try {
        await fetch(`${API_URL}/writing/session/${session._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to delete session from server:', err);
      }
    }

    // 2. Delete from local storage
    const localHistoryStr = localStorage.getItem('local_writing_history');
    if (localHistoryStr) {
      try {
        const localList = JSON.parse(localHistoryStr);
        const filtered = localList.filter(item => 
          (session._id && item._id === session._id) ? false :
          new Date(item.createdAt).getTime() !== new Date(session.createdAt).getTime()
        );
        localStorage.setItem('local_writing_history', JSON.stringify(filtered));
      } catch (e) {}
    }

    // 3. Update state
    const updated = history.filter(item => 
      item !== session && 
      (session._id ? item._id !== session._id : new Date(item.createdAt).getTime() !== new Date(session.createdAt).getTime())
    );
    setHistory(updated);

    // 4. Recalculate stats
    if (updated.length > 0) {
      let totalWpm = 0;
      let totalAccuracy = 0;
      let bestWpm = 0;
      let bestScore = 0;

      updated.forEach(s => {
        totalWpm += s.wpm;
        totalAccuracy += s.accuracy;
        if (s.wpm > bestWpm) bestWpm = s.wpm;
        if (s.score > bestScore) bestScore = s.score;
      });

      setStats({
        totalTests: updated.length,
        avgWpm: Math.round(totalWpm / updated.length),
        bestWpm,
        avgAccuracy: Math.round(totalAccuracy / updated.length),
        bestScore
      });
    } else {
      setStats({
        totalTests: 0,
        avgWpm: 0,
        bestWpm: 0,
        avgAccuracy: 0,
        bestScore: 0
      });
    }
  };

  // Clear all writing history
  const handleClearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all test records and history? This cannot be undone.')) return;

    if (token) {
      try {
        await fetch(`${API_URL}/writing/history`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to clear history on server:', err);
      }
    }

    localStorage.removeItem('local_writing_history');
    setHistory([]);
    setStats({
      totalTests: 0,
      avgWpm: 0,
      bestWpm: 0,
      avgAccuracy: 0,
      bestScore: 0
    });
  };

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

  // IELTS Simulator Helpers
  const handleStartIelts = () => {
    if (!ieltsTopic) {
      const randomTopic = ieltsTopics[Math.floor(Math.random() * ieltsTopics.length)];
      setIeltsTopic(randomTopic);
    }
    setIeltsEssay('');
    setIeltsTimeRemaining(2400);
    setIeltsActive(true);
    setIeltsMsg({ type: '', text: '' });
  };

  const handleSaveIeltsAttempt = async () => {
    if (!ieltsEssay.trim()) {
      setIeltsMsg({ type: 'error', text: 'Cannot evaluate an empty essay!' });
      return;
    }
    setSavingIelts(true);
    setIeltsMsg({ type: '', text: '' });
    try {
      const words = ieltsEssay.trim().split(/\s+/).filter(Boolean).length;
      const timeSpent = 2400 - ieltsTimeRemaining;
      
      const payload = {
        prompt: ieltsTopic,
        essay: ieltsEssay,
        wordCount: words,
        timeSpent: timeSpent
      };

      const res = await fetch(`${API_URL}/ai/grade-ielts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok && data.evaluation) {
        setIeltsMsg({ type: 'success', text: `Essay evaluated! Overall Band: ${data.evaluation.overallBand}` });
        setIeltsActive(false);
        setSelectedEvaluation({
          ...data.evaluation,
          prompt: ieltsTopic,
          essay: ieltsEssay,
          wordCount: words
        });
        setIsEvaluationModalOpen(true);
        fetchIeltsHistory();
      } else {
        setIeltsMsg({ type: 'error', text: data.error || 'Failed to evaluate essay with AI.' });
      }
    } catch (err) {
      console.error(err);
      setIeltsMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setSavingIelts(false);
    }
  };

  const fetchIeltsHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/writing/ielts/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIeltsHistory(data);
      }
    } catch (err) {
      console.error('Failed to load IELTS history:', err);
    }
  };

  // IELTS Timer effect
  useEffect(() => {
    if (ieltsActive && ieltsTimeRemaining > 0) {
      ieltsTimerRef.current = setTimeout(() => {
        setIeltsTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (ieltsTimeRemaining === 0 && ieltsActive) {
      setIeltsActive(false);
      setIeltsMsg({ type: 'warning', text: 'Time is up! Please submit your essay now.' });
    }
    return () => {
      if (ieltsTimerRef.current) clearTimeout(ieltsTimerRef.current);
    };
  }, [ieltsActive, ieltsTimeRemaining]);

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

  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'game') {
      fetchHistoryAndStats();
    }
    if (activeTab === 'ielts-simulator') {
      fetchIeltsHistory();
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
    setActiveTab(task.actionTarget);
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

  // Typing Game logic
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeSpent(0);
    timerRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
      stopEngineSound();
    };
  }, []);

  const handleStartRace = () => {
    stopTimer();
    stopEngineSound();
    
    // Play initial sound to unlock AudioContext
    initAudio();
    playSound('countdown-tick');

    setUserInput('');
    setTestStarted(false);
    setTestFinished(false);
    setTimeSpent(0);
    setWpm(0);
    setAccuracy(100);
    setScore(0);
    setErrors(0);
    setStreak(0);
    setIsBoosted(false);
    setIsCrashed(false);
    setSpinAngle(0);
    setCrashesCount(0);
    setCompletedLapsChars(0);
    setCompletedLapsErrors(0);

    setCountdown(3);
    
    let currentCount = 3;
    const interval = setInterval(() => {
      currentCount--;
      if (currentCount > 0) {
        setCountdown(currentCount);
        playSound('countdown-tick');
      } else if (currentCount === 0) {
        setCountdown('GO!');
        playSound('countdown-go');
        
        setTestStarted(true);
        startTimer();
        startEngineSound();
        
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 50);
      } else {
        setCountdown(null);
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Stop typing if test is finished or not started (countdown is active)
    if (testFinished || !testStarted || countdown !== null) return;

    const targetText = selectedPassage.text;
    const typedLength = Math.min(value.length, targetText.length);
    const sanitizedVal = value.substring(0, typedLength);
    setUserInput(sanitizedVal);

    // Calculate errors
    let errCount = 0;
    for (let i = 0; i < sanitizedVal.length; i++) {
      if (sanitizedVal[i] !== targetText[i]) {
        errCount++;
      }
    }

    // Play feedback audio
    if (sanitizedVal.length > userInput.length) {
      const typedChar = sanitizedVal[sanitizedVal.length - 1];
      const targetChar = targetText[sanitizedVal.length - 1];
      if (typedChar === targetChar) {
        playSound('correct');
        setStreak(prev => {
          const nextStreak = prev + 1;
          if (nextStreak === 12) {
            playSound('boost');
            setIsBoosted(true);
          }
          return nextStreak;
        });
        setIsCrashed(false);
      } else {
        playSound('error');
        setStreak(0);
        setIsBoosted(false);
        setIsCrashed(true);
        setSpinAngle(prev => prev + 360);
        setCrashesCount(prev => prev + 1);
      }
    }

    setErrors(errCount);
    prevErrorsRef.current = errCount;

    const totalTypedCount = completedLapsChars + sanitizedVal.length;
    const totalErrorCount = completedLapsErrors + errCount;

    // Live accuracy
    const currentAccuracy = totalTypedCount > 0 
      ? Math.max(0, Math.round(((totalTypedCount - totalErrorCount) / totalTypedCount) * 100))
      : 100;
    setAccuracy(currentAccuracy);

    // Live WPM
    const elapsedMinutes = timeSpent > 0 ? timeSpent / 60 : 1 / 60;
    const calculatedWpm = Math.round((totalTypedCount / 5) / elapsedMinutes);
    setWpm(calculatedWpm);

    // Check if completed
    if (sanitizedVal.length === targetText.length) {
      if (timeLimit > 0) {
        // Multi-lap loop: save stats for this lap, clear field, keep typing!
        setCompletedLapsChars(prev => prev + targetText.length);
        setCompletedLapsErrors(prev => prev + errCount);
        setUserInput('');
        playSound('boost'); // Sound representing lap cross!
      } else {
        // Finish test immediately if Unlimited/Free mode
        handleTestComplete(calculatedWpm, currentAccuracy, totalTypedCount);
      }
    }
  };

  const handleTestComplete = async (finalWpm, finalAccuracy, textLength) => {
    stopTimer();
    stopEngineSound();
    setTestFinished(true);
    setIsBoosted(false);
    setIsCrashed(false);
    playSound('win');

    const calculatedScore = Math.max(0, Math.round(finalWpm * (finalAccuracy / 100) - (crashesCount * 5)));
    setScore(calculatedScore);

    const sessionPayload = {
      type: 'typing-test',
      wpm: finalWpm,
      accuracy: finalAccuracy,
      score: calculatedScore,
      textTitle: selectedPassage.title,
      charactersTyped: textLength,
      timeSpent: timeSpent || 1,
      createdAt: new Date().toISOString()
    };

    // 1. Save locally to LocalStorage
    try {
      const localHistoryStr = localStorage.getItem('local_writing_history');
      const localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : [];
      localHistory.unshift(sessionPayload);
      localStorage.setItem('local_writing_history', JSON.stringify(localHistory));
    } catch (err) {
      console.error('LocalStorage write failed:', err);
    }

    // 2. Save session to backend if user is fully registered
    if (user && token) {
      try {
        await fetch(`${API_URL}/writing/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(sessionPayload)
        });
      } catch (err) {
        console.error('Failed to log session data to backend:', err);
      }
    }

    fetchHistoryAndStats();
  };

  const resetGame = () => {
    stopTimer();
    stopEngineSound();
    setCountdown(null);
    setUserInput('');
    setTestStarted(false);
    setTestFinished(false);
    setTimeSpent(0);
    setWpm(0);
    setAccuracy(100);
    setScore(0);
    setErrors(0);
    setStreak(0);
    setIsBoosted(false);
    setIsCrashed(false);
    setSpinAngle(0);
    setCrashesCount(0);
    setCompletedLapsChars(0);
    setCompletedLapsErrors(0);
  };

  // Handle time limit expiration
  useEffect(() => {
    if (testStarted && !testFinished && timeLimit > 0 && timeSpent >= timeLimit) {
      const totalTypedCount = completedLapsChars + userInput.length;
      const totalErrorCount = completedLapsErrors + errors;
      const currentAccuracy = totalTypedCount > 0 
        ? Math.max(0, Math.round(((totalTypedCount - totalErrorCount) / totalTypedCount) * 100))
        : 100;
      
      const elapsedMinutes = timeSpent / 60;
      const calculatedWpm = Math.round((totalTypedCount / 5) / elapsedMinutes);

      handleTestComplete(calculatedWpm, currentAccuracy, totalTypedCount);
    }
  }, [timeSpent, testStarted, testFinished, timeLimit, completedLapsChars, userInput.length, errors]);

  // When changing passage
  useEffect(() => {
    resetGame();
  }, [selectedPassage]);

  // Determine display info
  const name = user?.name || verifiedLead?.name || 'Guest User';
  const email = user?.email || verifiedLead?.email || 'N/A';
  const displayPhone = user?.phone || verifiedLead?.phone || 'N/A';

  // Calculate game race completion percentage
  const racePercentage = selectedPassage.text.length > 0 
    ? Math.min(100, Math.round((userInput.length / selectedPassage.text.length) * 100))
    : 0;

  // Determine gear shift based on WPM speed
  const getGear = () => {
    if (wpm === 0) return 'N';
    if (wpm < 25) return '1';
    if (wpm < 45) return '2';
    if (wpm < 65) return '3';
    if (wpm < 85) return '4';
    return '5';
  };

  // Helper to format seconds as MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // Helper to render colored characters
  const renderTextCharacters = () => {
    const targetText = selectedPassage.text;
    return targetText.split('').map((char, index) => {
      let colorClass = 'text-slate-400';
      let bgClass = '';
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          colorClass = 'text-emerald-400 font-bold';
        } else {
          colorClass = 'text-rose-500 font-bold underline';
          bgClass = 'bg-rose-500/20';
        }
      } else if (index === userInput.length) {
        bgClass = 'bg-indigo-500/25 border-b-2 border-indigo-400 animate-pulse';
      }

      return (
        <span key={index} className={`${colorClass} ${bgClass} transition-colors duration-75 text-sm md:text-[17px] leading-relaxed font-mono`}>
          {char}
        </span>
      );
    });
  };

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
        { id: 'saved-unis', label: 'Saved Shortlist', icon: <BookmarkCheck size={16} />, badge: dbSavedUnis.length > 0 ? `${dbSavedUnis.length}` : null, badgeColor: 'bg-orange-50 text-[#C04A1D] border border-orange-200/60' }
      ]
    },
    {
      groupTitle: 'AI ADMISSION TOOLS',
      items: [
        { id: 'shortlister', label: 'University Shortlister', icon: <School size={16} />, badge: 'AI', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'eligibility-calculator', label: 'Eligibility Calculator', icon: <ClipboardCheck size={16} />, badge: 'AI', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'scholarship-shortlister', label: 'Scholarship Finder', icon: <HandCoins size={16} />, badge: '150+', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'sop-builder', label: 'SOP & Essay Generator', icon: <FilePenLine size={16} />, badge: 'PRO', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'visa-mock', label: 'Visa Mock Interview', icon: <Mic size={16} />, badge: 'VOICE', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'study-roadmap', label: 'Study Planner & Roadmap', icon: <Route size={16} />, badge: 'AI', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'budget-calculator', label: 'Cost & Budget Estimator', icon: <Wallet size={16} /> }
      ]
    },
    {
      groupTitle: 'EXAMS & UTILITIES',
      items: [
        { id: 'ielts-simulator', label: 'IELTS Writing AI Mock', icon: <NotebookPen size={16} />, badge: 'MOCK', badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200/70' },
        { id: 'game', label: 'Speed Typing Test', icon: <Keyboard size={16} /> },
        { id: 'history', label: 'Performance & History', icon: <History size={16} /> }
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
    <div className="min-h-screen bg-[#f8fafc] pt-20 md:pt-24 pb-36 lg:pb-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* DESKTOP TOP COMMAND HEADER (Hidden on mobile) */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:flex bg-white border border-slate-200/80 p-5 md:p-6 rounded-[28px] shadow-sm flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          {/* Left Student Profile */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black flex items-center justify-center text-2xl shadow-md shadow-indigo-200 flex-shrink-0 select-none">
              {name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                  Welcome back, {name}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Registered Student
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                <span>{email}</span> • <span>{displayPhone}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                <Globe size={16} />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Destination</p>
                <p className="text-xs font-black text-slate-800">{profileForm.dreamCountry || user?.dreamCountry || 'Global'}</p>
              </div>
            </div>

            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                <BookmarkCheck size={16} />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Shortlisted</p>
                <p className="text-xs font-black text-slate-800">{dbSavedUnis.length} Saved</p>
              </div>
            </div>

            {isMentorAccount && (
              <button
                onClick={handleOpenMentorStudio}
                className="px-4 py-2.5 rounded-2xl border border-orange-200 bg-orange-50/90 hover:bg-orange-100 text-[#DE5C2B] transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                title="Switch to UniCoach Mentor Studio Dashboard"
              >
                <Zap size={14} className="fill-[#DE5C2B]" />
                <span>Mentor Studio</span>
              </button>
            )}

            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/50 hover:bg-rose-100/60 text-rose-600 transition-all font-bold text-xs flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <LogOut size={15} /> Logout
            </button>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* SIDEBAR NAVIGATION PANEL (Desktop only) */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">

            {/* Desktop Sidebar Container (Hidden on mobile, uses native bottom navigation instead) */}
            <div className="bg-white border border-slate-200/80 p-3.5 rounded-[24px] shadow-sm space-y-4">
              
              {/* Dual Mode Switcher Pill (Student Tools vs Mentor Studio) — only when the account is also a mentor */}
              {isMentorAccount && (
              <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60">
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
                          onClick={() => {
                            if (item.id === 'mentor-studio') {
                              handleOpenMentorStudio();
                              return;
                            }
                            setActiveTab(item.id);
                            if (item.id === 'saved-unis') fetchDbSavedUniversities();
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer group ${
                            isActive 
                              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-sm shadow-indigo-200' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-1.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              isActive 
                                ? 'bg-white/20 text-white' 
                                : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
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
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-extrabold text-xs">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>Need Guidance?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Get free expert university shortlisting & visa counselling.
                  </p>
                  <button 
                    onClick={() => navigate('/contact')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer"
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

            
            {/* SHORTLISTER TAB */}
            {activeTab === 'shortlister' && (
              <motion.div
                key="shortlister"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <UniversityShortlister user={user} verifiedLead={verifiedLead} />
              </motion.div>
            )}

            {/* SCHOLARSHIP SHORTLISTER TAB */}
            {activeTab === 'scholarship-shortlister' && (
              <motion.div
                key="scholarship-shortlister"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <ScholarshipShortlister />
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
                {/* Header Studio Card */}
                <div className="bg-white border border-slate-200/70 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600" /> Admissions Action Studio
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {profileForm.preferredIntake || 'Fall 2027'} Cycle
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <CheckSquare className="text-indigo-600" size={28} />
                        Daily Study Abroad Roadmap & Tasks
                      </h2>
                      <p className="text-xs md:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Follow your step-by-step master application roadmap. Complete daily tasks, practice IELTS, build your SOP, and stay on track for your university deadlines.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                      <button
                        onClick={() => setIsAddingTask(prev => !prev)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs cursor-pointer ${
                          isAddingTask
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isAddingTask ? <X size={15} /> : <Plus size={15} />}
                        <span>{isAddingTask ? 'Close Form' : 'Add Custom Task'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Overall Progress & Stats Pill Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total Milestones</p>
                      <p className="text-xl font-black text-slate-800 mt-0.5">{checklist.length}</p>
                    </div>
                    <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] uppercase font-black tracking-wider text-emerald-600">Completed</p>
                      <p className="text-xl font-black text-emerald-700 mt-0.5">{checklist.filter(t => t.done).length}</p>
                    </div>
                    <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100">
                      <p className="text-[10px] uppercase font-black tracking-wider text-rose-600">P0 Urgent</p>
                      <p className="text-xl font-black text-rose-700 mt-0.5">
                        {checklist.filter(t => t.priority === 'P0' && !t.done).length}
                      </p>
                    </div>
                    <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100">
                      <p className="text-[10px] uppercase font-black tracking-wider text-indigo-600">Readiness</p>
                      <p className="text-xl font-black text-indigo-700 mt-0.5">
                        {checklist.length > 0 ? Math.round((checklist.filter(t => t.done).length / checklist.length) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Flame size={14} className="text-amber-500" /> Admissions Readiness Engine
                      </span>
                      <span className="text-indigo-600 font-black">
                        {checklist.filter(t => t.done).length} of {checklist.length} Completed ({checklist.length > 0 ? Math.round((checklist.filter(t => t.done).length / checklist.length) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                      <div 
                        className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{ width: `${checklist.length > 0 ? Math.round((checklist.filter(t => t.done).length / checklist.length) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

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
                        className="bg-white border-2 border-indigo-200 p-6 rounded-[28px] shadow-sm space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                            <Plus size={16} className="text-indigo-600" /> Create Custom Study Abroad Task
                          </h3>
                          <span className="text-[11px] text-slate-400 font-bold">Personal Milestone</span>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="e.g. Schedule GRE exam date at test center, or Request LOR from Prof. Roy"
                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold focus:border-indigo-500 focus:outline-none"
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
                              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                            >
                              Save Task
                            </button>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {[
                    { id: 'all', label: 'All Tasks', count: checklist.length },
                    { id: 'today', label: '🔥 Urgent Focus', count: checklist.filter(t => t.priority === 'P0' && !t.done).length },
                    { id: 'admissions', label: '🎓 Admissions', count: checklist.filter(t => t.category === 'admissions').length },
                    { id: 'prep', label: '📝 Test Prep', count: checklist.filter(t => t.category === 'prep').length },
                    { id: 'documents', label: '📁 Documents', count: checklist.filter(t => t.category === 'documents').length },
                    { id: 'visa', label: '🛂 Visa Prep', count: checklist.filter(t => t.category === 'visa').length },
                    { id: 'completed', label: '✅ Completed', count: checklist.filter(t => t.done).length }
                  ].map((f) => {
                    const isActive = dailyTaskFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setDailyTaskFilter(f.id)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                          isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
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
                        P0: 'bg-rose-50 text-rose-700 border-rose-200/80',
                        P1: 'bg-amber-50 text-amber-700 border-amber-200/80',
                        P2: 'bg-slate-100 text-slate-600 border-slate-200'
                      }[task.priority || 'P1'];

                      const categoryBadges = {
                        admissions: 'bg-orange-50 text-[#C04A1D] border-orange-200/60',
                        prep: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                        documents: 'bg-purple-50 text-purple-700 border-purple-200/60',
                        visa: 'bg-rose-50 text-rose-700 border-rose-200/60'
                      }[task.category || 'admissions'];

                      return (
                        <div
                          key={task.id}
                          className={`bg-white border rounded-[24px] p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${
                            task.done 
                              ? 'border-slate-200/70 bg-slate-50/50 opacity-80' 
                              : 'border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <button
                              onClick={() => toggleChecklistItem(task.id)}
                              className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                                task.done
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'border-2 border-slate-300 hover:border-indigo-600 text-transparent'
                              }`}
                              title={task.done ? 'Mark as pending' : 'Mark as complete'}
                            >
                              <Check size={16} className={task.done ? 'opacity-100' : 'opacity-0'} />
                            </button>

                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${priorityStyles}`}>
                                  {task.priority || 'P1'}
                                </span>
                                {task.category && (
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${categoryBadges}`}>
                                    {task.category}
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

                              <h3 className={`text-sm sm:text-base font-black leading-snug ${
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
                                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-indigo-200/80 cursor-pointer shadow-2xs"
                              >
                                <span>{task.actionLabel}</span>
                                <ArrowRight size={13} />
                              </button>
                            )}

                            {task.isCustom && (
                              <button
                                onClick={(e) => handleDeleteCustomTask(task.id, e)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
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
                        <BookmarkCheck className="text-indigo-600" size={26} /> 
                        My Saved Universities
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black">
                          {dbSavedUnis.length} Saved
                        </span>
                      </h2>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1">
                        Universities you bookmark during shortlisting are saved safely to your profile.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleExportSavedUniversities}
                        disabled={dbSavedUnis.length === 0}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-200"
                        title="Download your shortlisted universities in Excel (.xlsx)"
                      >
                        <FileSpreadsheet size={15} />
                        <span>Download Excel (.xlsx)</span>
                      </button>
                      <button
                        onClick={fetchDbSavedUniversities}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw size={14} className={loadingSavedUnis ? 'animate-spin' : ''} /> Refresh List
                      </button>
                      <button
                        onClick={() => setActiveTab('shortlister')}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-100"
                      >
                        <Sparkles size={14} /> Find More Unis
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
                        onClick={() => setActiveTab('shortlister')}
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
                className="space-y-8"
              >
                {/* ── 01. STUDY ABROAD PARAMETERS (Full Width 4-Col Grid) ── */}
                <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Compass className="text-indigo-600" size={22} /> Your Study Abroad Parameters
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        Target destinations and academic criteria driving your university matches
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('profile')}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Edit3 size={13} /> Edit Parameters
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <div className="p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100/80 flex items-center gap-4 transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#DE5C2B] ring-1 ring-orange-100 flex items-center justify-center flex-shrink-0">
                        <Globe size={20} strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dream Country</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 truncate">{profileForm.dreamCountry || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100/80 flex items-center gap-4 transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#DE5C2B] ring-1 ring-orange-100 flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={20} strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dream Course</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 truncate">{profileForm.dreamCourse || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100/80 flex items-center gap-4 transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#DE5C2B] ring-1 ring-orange-100 flex items-center justify-center flex-shrink-0">
                        <BookOpenCheck size={20} strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Exam & Score</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 truncate">
                          {profileForm.targetExam ? `${profileForm.targetExam} (${profileForm.targetScore || 'Target TBD'})` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-100/80 flex items-center gap-4 transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#DE5C2B] ring-1 ring-orange-100 flex items-center justify-center flex-shrink-0">
                        <CalendarDays size={20} strokeWidth={1.9} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preferred Intake</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 truncate">{profileForm.preferredIntake || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                        {dbSavedUnis.length}
                      </div>
                      <p className="text-xs font-bold text-slate-600">Saved Universities in Your Profile</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {dbSavedUnis.length > 0 && (
                        <button
                          onClick={handleExportSavedUniversities}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Download shortlisted universities in Excel (.xlsx)"
                        >
                          <FileSpreadsheet size={14} className="text-emerald-600" />
                          <span>Download Excel</span>
                        </button>
                      )}
                      <button
                        onClick={() => setActiveTab('saved-unis')}
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookmarkCheck size={14} className="text-indigo-600" /> View Saved ({dbSavedUnis.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('shortlister')}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-black hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles size={14} /> Shortlist Universities
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── 02. DAILY STUDY ABROAD ROADMAP (Full Width 2-Col Task Grid) ── */}
                <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <CheckSquare className="text-indigo-600" size={22} /> Daily Study Abroad Roadmap
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        Prioritized milestones for your upcoming application cycle
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {checklist.filter(t => t.done).length}/{checklist.length} Completed
                      </span>
                      <button
                        onClick={() => setActiveTab('daily-tasks')}
                        className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        View Studio <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Completion Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Milestone Readiness</span>
                      <span className="text-indigo-600 font-black">
                        {checklist.length > 0 ? Math.round((checklist.filter(t => t.done).length / checklist.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{ width: `${checklist.length > 0 ? Math.round((checklist.filter(t => t.done).length / checklist.length) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Balanced 2-Column Task Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {checklist.slice(0, 6).map((item) => {
                      const priorityBadge = {
                        P0: 'bg-rose-50 text-rose-700 border-rose-200/80',
                        P1: 'bg-amber-50 text-amber-700 border-amber-200/80',
                        P2: 'bg-slate-100 text-slate-600 border-slate-200'
                      }[item.priority || 'P1'];

                      return (
                        <div 
                          key={item.id} 
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 select-none ${
                            item.done 
                              ? 'bg-slate-50/70 border-slate-200/60 opacity-75' 
                              : 'bg-white hover:bg-indigo-50/30 border-slate-200/90 hover:border-indigo-200 shadow-2xs'
                          }`}
                        >
                          <div 
                            onClick={() => toggleChecklistItem(item.id)}
                            className="flex items-start gap-3.5 min-w-0 flex-1 cursor-pointer"
                          >
                            <div className={`mt-0.5 sm:mt-0 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                              item.done 
                                ? 'bg-emerald-500 text-white shadow-xs' 
                                : 'border-2 border-slate-300 hover:border-indigo-500 text-transparent'
                            }`}>
                              <Check size={14} className={item.done ? 'opacity-100' : 'opacity-0'} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                                  item.done ? 'text-slate-400 line-through' : 'text-slate-800'
                                }`}>
                                  {item.title || item.text}
                                </p>
                                {item.priority && (
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${priorityBadge}`}>
                                    {item.priority}
                                  </span>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {item.actionLabel && !item.done && (
                            <button
                              onClick={(e) => handleTaskAction(item, e)}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/80 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-2xs"
                            >
                              <span>{item.actionLabel}</span>
                              <ArrowRight size={11} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-slate-400 font-semibold text-[11px]">
                      Showing top {Math.min(checklist.length, 6)} priority tasks • {checklist.length} total roadmap tasks
                    </span>
                    <button
                      onClick={() => setActiveTab('daily-tasks')}
                      className="text-indigo-600 hover:text-indigo-800 font-black text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      Manage Full Roadmap <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* ── 04. MENTOR STUDIO PROMOTION & QUICK SWITCH BANNER ── */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 p-6 md:p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden">
                  {/* Atmospheric Glows */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-orange-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-radial from-blue-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[11px] font-black uppercase tracking-wider">
                        <Zap size={13} className="text-orange-400 fill-orange-400" />
                        <span>UniCoach Creator & Senior Mentorship</span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full font-bold ml-1 border border-emerald-500/30">
                          0% Platform Commission
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                        Studying abroad or a top university alum?
                      </h3>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                        Launch your personalized mentor storefront in 2 minutes. Host 1:1 consultation calls, answer student priority queries, and review SOPs. UniCoach takes 0% commission; you get your full fee minus only Razorpay's payment charge.
                      </p>
                    </div>

                    <div className="flex items-center flex-wrap sm:flex-nowrap gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={isMentorAccount ? handleOpenMentorStudio : () => navigate('/unicoach/apply')}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Zap size={14} className="fill-white" />
                        <span>{isMentorAccount ? 'Open Mentor Studio' : 'Become a Mentor'}</span>
                        <ArrowRight size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/unicoach/apply')}
                        className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Apply as Mentor</span>
                      </button>
                    </div>
                  </div>
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
                <AiSopGenerator initialProfile={profileForm} />
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
                <AiVisaInterviewPrep studentProfile={profileForm} />
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
                <AiStudyRoadmap studentProfile={profileForm} />
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
                <EligibilityCalculatorPage />
              </motion.div>
            )}

            {/* BUDGET & COST CALCULATOR TAB */}
            {activeTab === 'budget-calculator' && (() => {
              const countryData = costDatabase[calculatorCountry];
              const tuitionFee = countryData.tuition[calculatorDegree];
              const accommodationFee = countryData.living.rent[calculatorAccommodation];
              const otherExpenses = countryData.living.food + countryData.living.insurance + countryData.living.transport + countryData.living.misc;
              const totalNative = tuitionFee + accommodationFee + otherExpenses;
              const totalINR = totalNative * countryData.inrRate;

              return (
                <motion.div 
                  key="budget-calculator"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
                >
                  {/* Estimator Settings */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                          <Calculator className="text-indigo-500" size={20} /> Study Abroad Cost Estimator
                        </h2>
                        <p className="text-xs text-slate-400 font-semibold">Estimate your tuition and living costs dynamically based on target metrics.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                          <PremiumDropdown
                            label="Dream Destination"
                            value={calculatorCountry}
                            onChange={(val) => setCalculatorCountry(val)}
                            accent="indigo"
                            options={Object.keys(costDatabase).map(c => ({
                              value: c,
                              label: c,
                              icon: {
                                'USA': <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-6 h-4 rounded-sm object-cover" />,
                                'UK': <img src="https://flagcdn.com/w40/gb.png" alt="UK" className="w-6 h-4 rounded-sm object-cover" />,
                                'Canada': <img src="https://flagcdn.com/w40/ca.png" alt="CA" className="w-6 h-4 rounded-sm object-cover" />,
                                'Australia': <img src="https://flagcdn.com/w40/au.png" alt="AU" className="w-6 h-4 rounded-sm object-cover" />,
                                'Germany': <img src="https://flagcdn.com/w40/de.png" alt="DE" className="w-6 h-4 rounded-sm object-cover" />,
                                'Ireland': <img src="https://flagcdn.com/w40/ie.png" alt="IE" className="w-6 h-4 rounded-sm object-cover" />,
                                'New Zealand': <img src="https://flagcdn.com/w40/nz.png" alt="NZ" className="w-6 h-4 rounded-sm object-cover" />,
                                'France': <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-6 h-4 rounded-sm object-cover" />,
                              }[c] || <Globe size={18} className="text-indigo-500" />,
                            }))}
                          />
                        </div>

                        <div className="relative">
                          <PremiumDropdown
                            label="Degree Type"
                            value={calculatorDegree}
                            onChange={(val) => setCalculatorDegree(val)}
                            accent="indigo"
                            options={[
                              { value: 'Masters', label: 'Masters / Graduate', icon: '🎓', description: 'Postgraduate programmes' },
                              { value: 'Bachelors', label: 'Bachelors / Undergrad', icon: '📚', description: 'Undergraduate programmes' },
                            ]}
                          />
                        </div>

                        <div className="relative">
                          <PremiumDropdown
                            label="Housing Style"
                            value={calculatorAccommodation}
                            onChange={(val) => setCalculatorAccommodation(val)}
                            accent="indigo"
                            options={[
                              { value: 'On-Campus Dorm', label: 'On-Campus Dorm', icon: '🏫', description: 'University managed housing' },
                              { value: 'Off-Campus Shared', label: 'Off-Campus Shared Room', icon: '🏠', description: 'Shared apartment with roommates' },
                              { value: 'Private Studio', label: 'Private Studio Apartment', icon: '🏙️', description: 'Independent living' },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cost breakdown items list */}
                    <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm space-y-4">
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Annual Cost Breakdown</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl">
                          <span className="text-xs md:text-sm font-semibold text-slate-600">Average Tuition Fees</span>
                          <span className="text-xs md:text-sm font-black text-slate-700">{countryData.symbol}{tuitionFee.toLocaleString()} / year</span>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl">
                          <span className="text-xs md:text-sm font-semibold text-slate-600">Rent & Accommodation</span>
                          <span className="text-xs md:text-sm font-black text-slate-700">{accommodationFee.toLocaleString()} / year</span>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl">
                          <span className="text-xs md:text-sm font-semibold text-slate-600">Groceries & Food</span>
                          <span className="text-xs md:text-sm font-black text-slate-700">{countryData.symbol}{countryData.living.food.toLocaleString()} / year</span>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl">
                          <span className="text-xs md:text-sm font-semibold text-slate-600">Mandatory Health Insurance</span>
                          <span className="text-xs md:text-sm font-black text-slate-700">{countryData.symbol}{countryData.living.insurance.toLocaleString()} / year</span>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl">
                          <span className="text-xs md:text-sm font-semibold text-slate-600">Local Transport & Commute</span>
                          <span className="text-xs md:text-sm font-black text-slate-700">{countryData.symbol}{countryData.living.transport.toLocaleString()} / year</span>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl">
                          <span className="text-xs md:text-sm font-semibold text-slate-600">Miscellaneous Books & Supplies</span>
                          <span className="text-xs md:text-sm font-black text-slate-700">{countryData.symbol}{countryData.living.misc.toLocaleString()} / year</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary / Scholarships Card */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 md:p-8 rounded-[32px] shadow-lg shadow-indigo-100 space-y-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-indigo-100 tracking-wider">Estimated Total Cost</span>
                        <h3 className="text-xl md:text-2xl font-black">{countryData.symbol}{totalNative.toLocaleString()} <span className="text-xs font-semibold text-indigo-150">/ Year</span></h3>
                      </div>
                      <div className="border-t border-white/10 pt-4 space-y-1">
                        <span className="text-[10px] font-black uppercase text-indigo-150 tracking-wider">Approximate INR Equivalent</span>
                        <h4 className="text-lg md:text-xl font-black">₹{totalINR.toLocaleString()} <span className="text-xs font-semibold text-indigo-150">/ Year</span></h4>
                        <p className="text-[10px] text-indigo-100 font-semibold mt-1">Calculated at live conversions: 1 {countryData.currency} = ₹{countryData.inrRate}</p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm space-y-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Recommended Scholarships ({calculatorCountry})</h3>
                      <div className="space-y-4">
                        {countryData.scholarships.map((s, idx) => (
                          <div key={idx} className="space-y-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                            <h4 className="text-xs font-black text-slate-700">{s.name}</h4>
                            <p className="text-[11px] text-indigo-600 font-bold">Coverage: {s.coverage}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{s.eligibility}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* IELTS EXAM WRITING SIMULATOR TAB */}
            {activeTab === 'ielts-simulator' && (
              <motion.div 
                key="ielts-simulator"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 max-w-4xl mx-auto"
              >
                {!ieltsActive ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Launch Practice Panel */}
                    <div className="md:col-span-2 bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                          <Timer className="text-indigo-500" size={20} /> IELTS Writing Mock Test Simulator
                        </h2>
                        <p className="text-xs text-slate-400 font-semibold">Simulate a computer-delivered IELTS Academic Writing Task 2 exam with a live timer.</p>
                      </div>

                      {ieltsMsg.text && (
                        <div className={`p-4 rounded-xl text-xs md:text-sm font-bold ${ieltsMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                          {ieltsMsg.text}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">Select Essay Topic Prompt</label>
                          <select 
                            value={ieltsTopic} 
                            onChange={(e) => setIeltsTopic(e.target.value)}
                            className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm font-bold bg-white text-slate-700 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">-- Random Selection (Auto-choose) --</option>
                            {ieltsTopics.map((t, i) => (
                              <option key={i} value={t}>Topic {i+1}: {t.substring(0, 50)}...</option>
                            ))}
                          </select>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 leading-relaxed font-semibold">
                          📝 <strong>IELTS Rules Checklist:</strong> You must write an essay response of at least <strong>250 words</strong> inside the <strong>40-minute</strong> limit. Write in structured paragraphs (Introduction, Body Paragraphs, Conclusion) using appropriate academic style.
                        </div>

                        <button 
                          onClick={handleStartIelts}
                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-150 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Start 40-Min Simulation Writing 🚀
                        </button>
                      </div>
                    </div>

                    {/* Attempt History logs */}
                    <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Your Practice Logs</h3>
                      
                      <div className="space-y-4 max-h-[350px] overflow-y-auto scrollbar-hide">
                        {ieltsHistory.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 font-bold text-xs">
                            No mock attempts saved yet.
                          </div>
                        ) : (
                          ieltsHistory.map((h, i) => (
                            <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                              <p className="text-[11px] text-slate-600 font-bold line-clamp-2">Topic: "{h.prompt}"</p>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                                <span>📝 {h.wordCount} words</span>
                                <span>⏱️ {formatTime(h.timeSpent)}</span>
                              </div>
                              <span className="text-[9px] text-slate-400 block font-semibold">{new Date(h.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                    {/* Active Exam Header */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-red-500 animate-pulse">● Active Writing Simulation</span>
                        <h3 className="text-base font-black text-slate-800">IELTS Task 2 Academic Essay</h3>
                      </div>
                      <div className="px-4 py-2 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-mono font-black text-lg">
                        ⏱️ {formatTime(ieltsTimeRemaining)}
                      </div>
                    </div>

                    {/* Essay Topic Prompt */}
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100/70 rounded-2xl">
                      <span className="text-[9px] text-indigo-500 font-black uppercase tracking-wider">Question Prompt</span>
                      <p className="text-xs md:text-sm font-black text-slate-700 mt-1 leading-relaxed">{ieltsTopic}</p>
                    </div>

                    {/* Essay writing board */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Write your response essay below:</label>
                        <span className={`text-xs font-black ${ieltsEssay.trim().split(/\s+/).filter(Boolean).length >= 250 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          Word Count: {ieltsEssay.trim().split(/\s+/).filter(Boolean).length} / 250+
                        </span>
                      </div>
                      <textarea
                        value={ieltsEssay}
                        onChange={(e) => setIeltsEssay(e.target.value)}
                        rows={12}
                        className="w-full p-4 border border-slate-200 rounded-3xl text-sm md:text-base font-mono focus:outline-none focus:border-indigo-500 leading-relaxed bg-[#fcfdff]"
                        placeholder="Type your essay response here. Make sure to structure it using appropriate paragraphs and formal academic style..."
                      />
                    </div>

                    {/* Submit Options */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleSaveIeltsAttempt}
                        disabled={savingIelts}
                        className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        {savingIelts ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" /> Evaluating with AI Examiner...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} className="text-amber-300" /> Submit Essay & Get AI Band Score 🤖
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to cancel the writing test? Your progress will be lost.")) {
                            setIeltsActive(false);
                          }
                        }}
                        className="px-6 py-4 border border-slate-200 hover:bg-slate-50 text-slate-500 font-black text-sm rounded-2xl cursor-pointer"
                      >
                        Cancel Practice
                      </button>
                    </div>
                  </div>
                )}

                {/* Attempt History logs with AI Evaluation Viewer */}
                {!ieltsActive && (
                  <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Award size={16} className="text-indigo-600" /> IELTS Practice & AI Evaluation History
                      </h3>
                      <span className="text-xs font-bold text-slate-400">{ieltsHistory.length} Total Attempts</span>
                    </div>
                    
                    <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                      {ieltsHistory.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 font-bold text-xs">
                          No mock attempts saved yet. Start your first 40-minute simulation above!
                        </div>
                      ) : (
                        ieltsHistory.map((h, i) => {
                          const evalData = h.aiEvaluation;
                          return (
                            <div key={i} className="p-4 bg-slate-50 border border-slate-100 hover:border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                              <div className="space-y-1">
                                <p className="text-xs text-slate-800 font-black line-clamp-1">Topic: "{h.prompt}"</p>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-semibold">
                                  <span>📝 {h.wordCount} words</span>
                                  <span>⏱️ {formatTime(h.timeSpent)}</span>
                                  <span>📅 {new Date(h.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {evalData?.overallBand && (
                                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Band {evalData.overallBand}
                                  </span>
                                )}
                                {evalData && (
                                  <button
                                    onClick={() => {
                                      setSelectedEvaluation({
                                        ...evalData,
                                        prompt: h.prompt,
                                        essay: h.essay,
                                        wordCount: h.wordCount
                                      });
                                      setIsEvaluationModalOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Sparkles size={12} /> View Report
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TYPING GAME TAB */}
            {activeTab === 'game' && (
              <motion.div 
                key="game"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 max-w-4xl mx-auto"
              >
                <style>{`
                  @keyframes scrollTrack {
                    0% { background-position-x: 0px; }
                    100% { background-position-x: -80px; }
                  }
                  .track-scrolling {
                    background-image: repeating-linear-gradient(90deg, 
                      transparent, transparent 40px, 
                      rgba(245, 158, 11, 0.4) 40px, rgba(245, 158, 11, 0.4) 80px
                    );
                    background-size: 80px 100%;
                    animation: scrollTrack var(--scroll-speed, 0s) linear infinite;
                  }
                  
                  @keyframes scrollCurb {
                    0% { background-position-x: 0px; }
                    100% { background-position-x: -30px; }
                  }
                  .curb-scrolling {
                    background: repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 15px, #f8fafc 15px, #f8fafc 30px);
                    background-size: 30px 100%;
                    animation: scrollCurb var(--scroll-speed, 0s) linear infinite;
                  }
                `}</style>

                {/* Passage & Duration Select */}
                <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-md md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                      <Keyboard className="text-indigo-500" size={18} /> High-Speed Typing Race
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">Type correctly to activate Turbo Boost. Mistakes will cause your car to drift or crash!</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Time limit select */}
                    <div className="flex items-center gap-1 border border-slate-100 bg-slate-50 p-1.5 rounded-2xl">
                      {[
                        { label: 'Free Run', val: 0 },
                        { label: '2 Min', val: 120 },
                        { label: '3 Min', val: 180 },
                        { label: '5 Min', val: 300 }
                      ].map(t => (
                        <button
                          key={t.val}
                          onClick={() => {
                            setTimeLimit(t.val);
                            resetGame();
                          }}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all cursor-pointer ${
                            timeLimit === t.val 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Volume Mute Toggle */}
                    <button
                      onClick={toggleMute}
                      className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
                    >
                      {isMuted ? (
                        <>
                          <VolumeX size={14} className="text-rose-500" />
                          <span className="text-[10px] font-black uppercase text-rose-500">Muted</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} className="text-indigo-500" />
                          <span className="text-[10px] font-black uppercase text-indigo-500">Sound On</span>
                        </>
                      )}
                    </button>

                    <div className="flex gap-2">
                      {passages.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPassage(p)}
                          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                            selectedPassage.id === p.id 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {p.difficulty}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Game Canvas Box */}
                <div className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[32px] shadow-sm space-y-8 relative overflow-hidden">
                  
                  {/* TALLER ENHANCED RACING TRACK */}
                  <div 
                    className="relative h-48 border-2 border-slate-700/80 rounded-3xl overflow-hidden flex flex-col justify-between p-2 shadow-inner"
                    style={{ 
                      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                      boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.9)'
                    }}
                  >
                    {/* START RACE OVERLAY */}
                    {!testStarted && !testFinished && countdown === null && (
                      <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center z-25 backdrop-blur-sm rounded-3xl">
                        <button
                          onClick={handleStartRace}
                          className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 tracking-wider uppercase transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                        >
                          <Play size={16} fill="white" /> Start Admissions Race 🏎️
                        </button>
                        <p className="text-[10px] text-slate-300 font-bold mt-2.5">
                          Beat the "Admissions Deadline" by typing the passage below!
                        </p>
                      </div>
                    )}

                    {/* COUNTDOWN OVERLAY */}
                    {countdown !== null && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-30 backdrop-blur-sm rounded-3xl"
                      >
                        <motion.div
                          key={countdown}
                          initial={{ scale: 0.3, opacity: 0 }}
                          animate={{ scale: [1, 1.25, 1], opacity: 1 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`text-6xl md:text-7xl font-black italic tracking-wider ${
                            countdown === 'GO!' ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                          }`}
                        >
                          {countdown}
                        </motion.div>
                        <p className="text-[10px] font-black text-slate-400 mt-2 tracking-widest uppercase">
                          {countdown === 'GO!' ? 'START TYPING NOW!' : 'PREPARE TO ACCELERATE'}
                        </p>
                      </motion.div>
                    )}

                    {/* Upper curb track boundary */}
                    <div 
                      className="h-3 w-full rounded-full curb-scrolling"
                      style={{ 
                        '--scroll-speed': wpm > 0 && testStarted && !testFinished ? `${Math.max(0.15, 2 - (wpm / 60))}s` : '0s'
                      }}
                    />

                    {/* Milestone Decorators (Study Abroad Admission Journey steps) */}
                    <div className="absolute inset-x-0 top-6 flex justify-between px-10 text-[10px] md:text-xs select-none opacity-50 font-black text-slate-400">
                      <span className="flex flex-col items-center">🎒 <span className="hidden sm:inline">Profile</span></span>
                      <span className="flex flex-col items-center">📝 <span className="hidden sm:inline">Exams</span></span>
                      <span className="flex flex-col items-center">✉️ <span className="hidden sm:inline">Offers</span></span>
                      <span className="flex flex-col items-center">🛂 <span className="hidden sm:inline">Visa</span></span>
                      <span className="flex flex-col items-center">🎓 <span className="hidden sm:inline">Campus!</span></span>
                    </div>

                    {/* Middle dashed lane marker */}
                    <div 
                      className="w-full h-1 my-auto relative track-scrolling"
                      style={{
                        '--scroll-speed': wpm > 0 && testStarted && !testFinished ? `${Math.max(0.15, 2 - (wpm / 60))}s` : '0s'
                      }}
                    >
                      {/* Opponent Car driving at constant target speed */}
                      {testStarted && !testFinished && (
                        <motion.div 
                          className="absolute z-5 select-none flex flex-col items-center"
                          style={{ top: '-34px', originX: 0.5 }}
                          animate={{ 
                            left: `${Math.min(94, Math.round((timeSpent / (timeLimit > 0 ? timeLimit : 22)) * 100))}%` 
                          }}
                          transition={{ ease: 'linear' }}
                        >
                          <span className="px-1.5 py-0.5 text-[7px] font-black uppercase text-white bg-rose-500 rounded-md shadow-md animate-bounce mb-0.5">⏰ Deadline</span>
                          <span className="text-xl md:text-2xl drop-shadow-md">🚘</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Player's Car Area */}
                    <div className="relative h-14 w-full flex items-center">
                      
                      {/* Interactive Player Car */}
                      <motion.div 
                        className="absolute z-10 flex items-center gap-1.5"
                        style={{ y: -7 }}
                        animate={{ 
                          left: `${Math.max(2, Math.min(92, racePercentage))}%`,
                          rotate: spinAngle,
                          x: isCrashed ? [0, -4, 4, -2, 2, 0] : 0 // Shakes car on crash
                        }}
                        transition={{ 
                          rotate: { type: 'spring', stiffness: 60, damping: 10 },
                          left: { type: 'spring', stiffness: 90, damping: 15 }
                        }}
                      >
                        {/* Floating Combo Bubble */}
                        {streak > 5 && (
                          <motion.div 
                            initial={{ scale: 0.5, y: 10, opacity: 0 }}
                            animate={{ scale: 1, y: -26, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`absolute left-1/2 transform -translate-x-1/2 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md text-white whitespace-nowrap select-none shadow-sm z-20 ${
                              streak >= 40 ? 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse' :
                              streak >= 25 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                              streak >= 15 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                              'bg-indigo-600'
                            }`}
                          >
                            {streak >= 40 ? '🚀 LIGHTSPEED' :
                             streak >= 25 ? '⚡ HYPER DRIVE' :
                             streak >= 15 ? '🔥 SUPER STREAK' :
                             `🎯 STREAK ${streak}`}
                          </motion.div>
                        )}

                        {/* Speed Turbo flames */}
                        {isBoosted && (
                          <motion.span 
                            animate={{ scale: [1, 1.4, 1] }} 
                            transition={{ repeat: Infinity, duration: 0.15 }}
                            className="text-xl select-none"
                          >
                            🔥
                          </motion.span>
                        )}
                        {/* Crash smoke cloud */}
                        {isCrashed && (
                          <motion.span 
                            animate={{ opacity: [1, 0.5, 0] }}
                            className="text-lg select-none"
                          >
                            💨💥
                          </motion.span>
                        )}
                        
                        <span 
                          className="text-4xl md:text-5xl drop-shadow-lg select-none"
                          style={{
                            filter: isBoosted 
                              ? 'drop-shadow(0 0 10px #f97316) drop-shadow(0 0 20px #ef4444)' 
                              : isCrashed 
                              ? 'grayscale(0.8) sepia(0.3)' 
                              : 'none',
                            transition: 'filter 0.2s ease'
                          }}
                        >
                          🏎️
                        </span>
                      </motion.div>
                    </div>

                    {/* Lower curb track boundary */}
                    <div 
                      className="h-3 w-full rounded-full curb-scrolling"
                      style={{ 
                        '--scroll-speed': wpm > 0 && testStarted && !testFinished ? `${Math.max(0.15, 2 - (wpm / 60))}s` : '0s'
                      }}
                    />
                  </div>

                  {/* Dashboard HUD Controls */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center flex flex-col items-center justify-center">
                      <p className="text-xl font-black text-slate-700 mt-1">
                        {timeLimit > 0 ? formatTime(Math.max(0, timeLimit - timeSpent)) : formatTime(timeSpent)}
                      </p>
                      <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
                        <Timer size={10} className="text-indigo-500" /> {timeLimit > 0 ? 'Time Left' : 'Lap Time'}
                      </div>
                    </div>

                    {/* Circular Speedometer */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="transparent" 
                            stroke="#e2e8f0" 
                            strokeWidth="8"
                          />
                          <motion.circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="transparent" 
                            stroke={wpm > 80 ? '#f43f5e' : wpm > 50 ? '#f59e0b' : '#4f46e5'} 
                            strokeWidth="8"
                            strokeDasharray="251.2"
                            animate={{ strokeDashoffset: 251.2 - (251.2 * Math.min(120, wpm)) / 120 }}
                            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
                          />
                        </svg>
                        <div className="text-center z-10">
                          <p className="text-lg font-black text-slate-800 leading-none">{wpm}</p>
                          <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">WPM</p>
                        </div>
                      </div>
                      <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
                        <Flame size={10} className="text-orange-500" /> Speed (WPM)
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center flex flex-col items-center justify-center">
                      <p className="text-xl font-black text-slate-700 mt-1">{accuracy}%</p>
                      <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
                        <Award size={10} className="text-emerald-500" /> Driving (ACC)
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center flex flex-col items-center justify-center relative overflow-hidden">
                      <motion.p 
                        key={getGear()}
                        animate={{ scale: [1, 1.3, 1] }}
                        className="text-xl font-black text-indigo-600 mt-1"
                      >
                        {getGear()}
                      </motion.p>
                      <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
                        <Zap size={10} className="text-indigo-500" /> Transmission
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center col-span-2 md:col-span-1 flex flex-col items-center justify-center">
                      <p className="text-xl font-black text-slate-700 mt-1">
                        {testFinished ? score : Math.max(0, Math.round(wpm * (accuracy / 100) - (crashesCount * 5)))}
                      </p>
                      <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
                        <Trophy size={10} className="text-amber-500" /> Score Rating
                      </div>
                    </div>
                  </div>

                  {/* Warning Danger Zone HUD */}
                  {accuracy < 90 && !testFinished && (
                    <motion.div 
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex items-center justify-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black rounded-xl"
                    >
                      <ShieldAlert size={16} /> Warning: Dangerous Driving! Keep Accuracy above 90% to avoid drifting!
                    </motion.div>
                  )}

                  {/* Target Text Box */}
                  <div className="p-5 md:p-6 bg-slate-900 border border-slate-800 rounded-3xl min-h-[140px] flex items-center leading-relaxed">
                    <div className="w-full text-justify select-none">
                      {renderTextCharacters()}
                    </div>
                  </div>

                  {/* Input area */}
                  <div className="space-y-4">
                    <textarea
                      ref={inputRef}
                      value={userInput}
                      onChange={handleInputChange}
                      disabled={testFinished || countdown !== null || !testStarted}
                      placeholder={
                        countdown !== null 
                          ? "Race starting... Get ready! 🏁" 
                          : testStarted 
                          ? "Type matching characters correctly..." 
                          : "Click 'Start Admissions Race' above to drive! 🏎️"
                      }
                      className="w-full p-4 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl font-mono text-sm leading-relaxed focus:outline-none transition-all resize-none h-28 disabled:bg-slate-50 disabled:text-slate-400"
                    />

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold">
                        <p className="flex items-center gap-1">
                          💥 Spins / Drift Crashes: <span className="text-rose-500 font-black">{crashesCount}</span>
                        </p>
                        <p className="flex items-center gap-1">
                          🔥 Perfect Streak: <span className="text-indigo-500 font-black">{streak}</span>
                        </p>
                      </div>
                      <button
                        onClick={handleStartRace}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        <RefreshCw size={12} /> Restart Race
                      </button>
                    </div>
                  </div>

                  {/* Completion overlay popup */}
                  <AnimatePresence>
                    {testFinished && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-900/90 flex items-center justify-center p-6 backdrop-blur-sm z-20"
                      >
                        {/* Render client-side particle rain */}
                        <ConfettiCanvas />

                        <motion.div 
                          initial={{ scale: 0.9, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          className="bg-white p-6 md:p-8 rounded-[32px] max-w-md w-full border border-slate-100 text-center space-y-6 shadow-2xl z-20 relative"
                        >
                          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto shadow-md select-none">
                            🏆
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">Race Completed! 🏁</h4>
                            <p className="text-xs text-slate-400 font-semibold mt-1">Excellent driving parameters. Your record has been logged.</p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">Avg Speed</p>
                              <p className="text-md font-black text-slate-750">{wpm} WPM</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">Safe Accuracy</p>
                              <p className="text-md font-black text-slate-750">{accuracy}%</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">Drifts/Crashes</p>
                              <p className="text-md font-black text-rose-500">{crashesCount}</p>
                            </div>
                          </div>

                          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-800">
                            🏁 Final Score: {score} Points
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={handleStartRace}
                              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
                            >
                              Drive Again
                            </button>
                            <button
                              onClick={() => setActiveTab('history')}
                              className="flex-1 py-3 border border-slate-200 text-slate-600 font-black text-xs rounded-xl cursor-pointer hover:bg-slate-50 transition-all"
                            >
                              Check Leaderboard
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            )}

            {/* HISTORY & STATS TAB */}
            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* Stats Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Races', value: stats.totalTests, icon: <Play className="text-indigo-500" />, color: 'from-indigo-500 to-indigo-600' },
                    { label: 'Average Speed', value: `${stats.avgWpm} WPM`, icon: <Flame className="text-orange-500" />, color: 'from-orange-500 to-orange-600' },
                    { label: 'Peak Speed', value: `${stats.bestWpm} WPM`, icon: <Award className="text-emerald-500" />, color: 'from-emerald-500 to-emerald-600' },
                    { label: 'Highest Score', value: stats.bestScore, icon: <Trophy className="text-amber-500" />, color: 'from-amber-500 to-amber-600' }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-800 mt-1">{stat.value}</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {stat.icon}
                      </div>
                    </div>
                  ))}
                </div>

                {/* History Table */}
                <div className="bg-white border border-slate-200/60 rounded-[32px] overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <h3 className="text-md md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <History className="text-indigo-500" size={18} /> Driving Performance Logs
                      </h3>
                      <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                        {history.length} {history.length === 1 ? 'Record' : 'Records'}
                      </span>
                    </div>

                    {history.length > 0 && (
                      <button
                        onClick={handleClearAllHistory}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/80 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Clear all recorded test history"
                      >
                        <Trash2 size={13} />
                        <span>Clear All History</span>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    {loadingHistory ? (
                      <div className="p-6 space-y-4 animate-pulse">
                        <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
                        <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
                        <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
                        <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
                        <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
                      </div>
                    ) : history.length === 0 ? (
                      <div className="p-12 text-center space-y-2">
                        <p className="text-sm font-black text-slate-400">No attempts logged yet!</p>
                        <p className="text-xs text-slate-400">Complete a typing test under the <strong className="text-slate-600 font-bold">Speed Typing Test</strong> tab to log your first statistics.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Speed</th>
                            <th className="px-6 py-4">Accuracy</th>
                            <th className="px-6 py-4">Final Score</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {history.map((session, idx) => (
                            <tr key={session._id || idx} className="text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50/40 group transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-800">{session.textTitle}</td>
                              <td className="px-6 py-4 text-slate-400 text-xs">
                                {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 text-orange-500 font-black">{session.wpm} WPM</td>
                              <td className="px-6 py-4 text-emerald-500 font-black">{session.accuracy}%</td>
                              <td className="px-6 py-4 font-black">
                                <span className="bg-amber-50 border border-amber-200/50 text-amber-600 px-2.5 py-1 rounded-xl text-xs">
                                  {session.score} pts
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteHistoryItem(session)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                                  title="Delete this record"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* IELTS AI Assessment Report Modal */}
      <IeltsAiEvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        evaluation={selectedEvaluation}
        essayPrompt={selectedEvaluation?.prompt || ieltsTopic}
        studentEssay={selectedEvaluation?.essay || ieltsEssay}
        wordCount={selectedEvaluation?.wordCount}
        onPracticeAgain={() => {
          setIsEvaluationModalOpen(false);
          handleStartIelts();
        }}
      />
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
