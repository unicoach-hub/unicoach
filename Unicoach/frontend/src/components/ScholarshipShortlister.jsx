import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Compass, Search, Target, ShieldCheck, Award, 
  GraduationCap, Globe, DollarSign, CheckCircle2, BookOpen, 
  ExternalLink, SlidersHorizontal, RefreshCw, BookmarkCheck, 
  ArrowRight, ArrowLeft, Calendar, Briefcase, Trash2, CalendarPlus,
  Clock, ShieldAlert, HeartHandshake, FileText, ChevronRight, X,
  FileSpreadsheet, Download
} from 'lucide-react';
import UniversityLogo from './UniversityLogo';
import PremiumDropdown from './PremiumDropdown';
import ScholarshipAiExplainerModal from './ScholarshipAiExplainerModal';
import { cleanPortalUrl, getScholarshipPortalFallback } from '../utils/urlHelpers';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import { POPULAR_COURSES, ALL_COUNTRY_OPTIONS } from '../utils/shortlistOptions';
import fallbackScholarships from '../data/scholarships.json';
import { API_BASE_URL } from '../config';
import { exportScholarshipsToExcel } from '../utils/excelExporter';

const API_URL = API_BASE_URL;

// Safe, non-colliding matching helper for saved scholarships
export const isMatchingScholarship = (savedItem, target) => {
  if (!savedItem || !target) return false;

  const targetId = target._id || target.id || target.customId;
  const targetTitle = (target.title || '').trim().toLowerCase();
  const targetUni = (target.universityName || '').trim().toLowerCase();

  // 1. Strict ID comparison only when targetId exists
  if (targetId) {
    const tId = String(targetId);
    if (savedItem.id && String(savedItem.id) === tId) return true;
    if (savedItem._id && String(savedItem._id) === tId) return true;
    if (savedItem.customId && String(savedItem.customId) === tId) return true;

    const nested = savedItem.scholarship;
    if (nested) {
      if (typeof nested === 'object') {
        if (nested.id && String(nested.id) === tId) return true;
        if (nested._id && String(nested._id) === tId) return true;
        if (nested.customId && String(nested.customId) === tId) return true;
      } else if (typeof nested === 'string' && nested === tId) {
        return true;
      }
    }
  }

  // 2. Title & University comparison (fallback for items without strict ID match)
  if (targetTitle) {
    const sTitle = (savedItem.title || savedItem.scholarship?.title || '').trim().toLowerCase();
    if (sTitle && sTitle === targetTitle) {
      const sUni = (savedItem.universityName || savedItem.scholarship?.universityName || '').trim().toLowerCase();
      if (!targetUni || !sUni || targetUni === sUni) {
        return true;
      }
    }
  }

  return false;
};

const getDomainForScholarship = (scholarship) => {
  if (!scholarship) return null;
  if (scholarship.logo) return scholarship.logo;
  if (scholarship.verifiedSource) {
    try {
      const url = new URL(scholarship.verifiedSource);
      return url.hostname.replace('www.', '');
    } catch (e) {}
  }
  if (scholarship.applicationProcess?.applicationPortalUrl) {
    try {
      const url = new URL(scholarship.applicationProcess.applicationPortalUrl);
      return url.hostname.replace('www.', '');
    } catch (e) {}
  }
  return null;
};

const PIPELINE_STAGES = [
  { id: 'Shortlisted', label: '📌 Shortlisted', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'Essay Drafting', label: '✍️ Essay Drafting', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Documents Ready', label: '📂 Documents Ready', color: 'bg-orange-50 text-[#C04A1D] border-orange-200' },
  { id: 'Applied', label: '🚀 Applied', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'Awarded', label: '🎉 Awarded / Won', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
];

// Client-side dynamic evaluator matching scholarships into Safe / Target / Dream
function evaluateLocalScholarships(scholarshipsList, formData) {
  const dataset = (scholarshipsList && scholarshipsList.length > 0) ? scholarshipsList : fallbackScholarships;
  const parsedGpa = parseFloat(formData.gpaPercent) || 75;
  const parsedIelts = parseFloat(formData.ieltsScore) || 6.5;
  const targetCountry = (formData.targetCountry || 'All').trim();
  const targetDegree = (formData.targetDegree || 'Masters').trim();
  const familyIncome = parseFloat(formData.familyIncome) || 1200000;
  const major = (formData.streamMajor || '').toLowerCase();

  const filtered = (dataset || []).filter(item => {
    // 1. Country Filter
    if (targetCountry && targetCountry !== 'All' && targetCountry !== 'all' && targetCountry !== 'All Destinations' && targetCountry !== 'All Global Destinations') {
      const itemCountry = String(item.country || '').toLowerCase().trim();
      const tc = targetCountry.toLowerCase().trim();
      const isUS = (tc === 'usa' || tc.includes('united states') || tc === 'us' || tc.includes('america')) && (itemCountry === 'usa' || itemCountry.includes('united states') || itemCountry === 'us');
      const isUK = (tc === 'uk' || tc.includes('united kingdom') || tc === 'gb' || tc.includes('england') || tc.includes('britain')) && (itemCountry === 'uk' || itemCountry.includes('united kingdom') || itemCountry === 'gb');
      const isDirect = itemCountry === tc || itemCountry.includes(tc) || tc.includes(itemCountry);
      const isGlobal = itemCountry === 'global' || itemCountry === 'international';
      if (!isUS && !isUK && !isDirect && !isGlobal) return false;
    }

    // 2. Funding Type Filter
    if (formData.fundingType && formData.fundingType !== 'All' && formData.fundingType !== 'all') {
      const ft = (item.fundingType || '').toLowerCase();
      const cov = (item.awardCoverage || '').toLowerCase();
      if (formData.fundingType === 'Full Ride') {
        if (!(cov.includes('100%') || cov.includes('full') || ft.includes('fellowship') || ft.includes('government'))) return false;
      } else if (formData.fundingType === 'Tuition Waiver') {
        if (!(ft.includes('tuition') || ft.includes('merit') || cov.includes('tuition') || cov.includes('waiver'))) return false;
      } else if (formData.fundingType === 'Living Stipend') {
        if (!(cov.includes('stipend') || cov.includes('living') || ft.includes('fellowship'))) return false;
      } else if (formData.fundingType === 'Need-Based') {
        if (!(ft.includes('need') || item.eligibility?.financialCriteria?.isNeedBased || cov.includes('demonstrated'))) return false;
      } else if (formData.fundingType === 'Fellowship') {
        if (!(ft.includes('fellowship') || ft.includes('research') || ft.includes('endowment'))) return false;
      } else if (item.fundingType !== formData.fundingType) {
        return false;
      }
    }

    // 3. Degree Level Filter
    if (targetDegree && targetDegree !== 'All' && targetDegree !== 'all') {
      const degrees = (item.eligibility?.degreeLevels || []).map(d => String(d).toLowerCase());
      if (degrees.length > 0) {
        const targetDegLower = targetDegree.toLowerCase();
        const matchesDegree = degrees.some(d => 
          d.includes(targetDegLower) || targetDegLower.includes(d) || d === 'all' || d === 'all degrees'
        );
        const isGeneralWaiver = (item.fundingType === 'Tuition Waiver' || item.fundingType === 'Merit Scholarship');
        if (!matchesDegree && !isGeneralWaiver) return false;
      }
    }

    return true;
  });

  const listToUse = filtered.length > 0 
    ? filtered 
    : (dataset || []).filter(item => {
        const c = String(item.country || '').toLowerCase();
        return c === 'global' || c === 'international' || !c;
      });
  const finalList = listToUse.length > 0 ? listToUse : (dataset || []);

  const categorized = { safe: [], target: [], dream: [] };

  finalList.forEach(item => {
    const title = (item.title || '').toLowerCase();
    const coverage = (item.awardCoverage || '').toLowerCase();
    const fType = (item.fundingType || '').toLowerCase();
    const reqIelts = (typeof item.eligibility?.minIelts === 'object' ? item.eligibility?.minIelts?.value : item.eligibility?.minIelts) || 6.5;

    // Prestige & selectivity classification
    const isElite = fType.includes('fellowship') ||
      title.includes('fulbright') || title.includes('chevening') || title.includes('commonwealth') ||
      title.includes('gates') || title.includes('rhodes') || title.includes('knight-hennessy') ||
      title.includes('erasmus') || title.includes('schwarzman') || title.includes('daad') ||
      title.includes('harvard') || title.includes('mit') || title.includes('yale') ||
      title.includes('princeton') || title.includes('stanford') || title.includes('oxford') ||
      title.includes('cambridge') || coverage.includes('100% demonstrated') ||
      fType.includes('government');

    const isHighValue = coverage.includes('100%') || coverage.includes('full tuition') ||
      title.includes('presidential') || title.includes('chancellor') || title.includes('distinction') ||
      title.includes('excellence') || coverage.includes('stipend');

    const isAccessible = title.includes('bursary') || title.includes('automatic') ||
      title.includes('international student scholarship') || coverage.includes('20%') ||
      coverage.includes('25%') || coverage.includes('30%') || coverage.includes('15%') ||
      coverage.includes('5,000') || coverage.includes('10,000') || fType.includes('waiver');

    let baseScore = 65;
    if (isElite) baseScore = 48;
    else if (isHighValue) baseScore = 58;
    else if (isAccessible) baseScore = 76;

    // GPA score
    if (parsedGpa >= 85) baseScore += 16;
    else if (parsedGpa >= 78) baseScore += 10;
    else if (parsedGpa >= 70) baseScore += 4;
    else if (parsedGpa < 62) baseScore -= 12;

    // IELTS score
    if (parsedIelts >= reqIelts + 0.5) baseScore += 10;
    else if (parsedIelts >= reqIelts) baseScore += 6;
    else baseScore -= 10;

    // Financial need match
    const isNeedBased = item.eligibility?.financialCriteria?.isNeedBased || 
      fType.includes('need') || title.includes('need-based') || title.includes('need-blind');
    if (isNeedBased) {
      if (familyIncome <= 800000) baseScore += 12;
      else if (familyIncome <= 1500000) baseScore += 6;
      else baseScore -= 10;
    }

    // Major relevance
    if (major) {
      const descLower = String(item.description || '').toLowerCase();
      const coursesApplicable = (item.eligibility?.coursesApplicable || []).map(c => String(c).toLowerCase());
      if (coursesApplicable.some(c => c.includes(major) || major.includes(c)) || title.includes(major) || descLower.includes(major)) {
        baseScore += 6;
      }
    }

    const matchScore = Math.min(98, Math.max(35, Math.round(baseScore)));
    let categoryTag = 'target';
    if (matchScore >= 80) categoryTag = 'safe';
    else if (matchScore < 65) categoryTag = 'dream';

    const scholarshipItem = { ...item, matchScore, categoryTag };

    if (categoryTag === 'safe') categorized.safe.push(scholarshipItem);
    else if (categoryTag === 'target') categorized.target.push(scholarshipItem);
    else categorized.dream.push(scholarshipItem);
  });

  categorized.safe.sort((a, b) => b.matchScore - a.matchScore);
  categorized.target.sort((a, b) => b.matchScore - a.matchScore);
  categorized.dream.sort((a, b) => b.matchScore - a.matchScore);

  return categorized;
}

const ScholarshipShortlister = () => {
  const { user, token, openLoginModal } = useAuth();
  const { verifiedLead } = useLead() || {};

  // Step 1: Form Wizard | Step 2: Categorized Shortlist Results
  const [step, setStep] = useState(1);

  // Student Profile & Target Filters
  const [formData, setFormData] = useState({
    educationLevel: user?.highestEducation || "Bachelor's",
    gpaPercent: 78,
    streamMajor: user?.dreamCourse || 'Computer Science & Engineering',
    targetCountry: user?.dreamCountry || verifiedLead?.dreamCountry || 'All',
    targetDegree: 'Masters',
    fundingType: 'All',
    ieltsScore: 7.0,
    greScore: 0,
    familyIncome: 1200000, // in INR
    intake: user?.preferredIntake || 'Fall 2026',
    workExpYears: 1
  });

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(18);
  const [allScholarships, setAllScholarships] = useState(fallbackScholarships || []);
  const [results, setResults] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [explainingScholarship, setExplainingScholarship] = useState(null);
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  // Load scholarships & saved list on mount
  useEffect(() => {
    fetchAllScholarships();
    fetchSavedScholarships();
  }, [token]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchAllScholarships = async () => {
    try {
      const res = await fetch(`${API_URL}/scholarships?limit=200`);
      const data = await res.json();
      if (data.success && Array.isArray(data.scholarships) && data.scholarships.length > 0) {
        setAllScholarships(data.scholarships);
      } else {
        setAllScholarships(fallbackScholarships);
      }
    } catch (err) {
      console.warn('Backend unavailable, utilizing verified scholarship dataset.');
      setAllScholarships(fallbackScholarships);
    }
  };

  const fetchSavedScholarships = async () => {
    const sanitizeList = (raw) => {
      if (!Array.isArray(raw)) return [];
      return raw.filter(item => item && (item.id || item._id || item.title || (item.scholarship && (item.scholarship.id || item.scholarship.title))));
    };

    if (!token) {
      const local = localStorage.getItem('unicoach_saved_scholarships');
      if (local) {
        try { 
          const parsed = JSON.parse(local);
          setSavedScholarships(sanitizeList(parsed)); 
        } catch (e) {}
      }
      return;
    }
    try {
      const res = await fetch(`${API_URL}/scholarships/my/shortlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.shortlisted) {
          setSavedScholarships(sanitizeList(data.shortlisted));
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load saved scholarships from backend:', err);
    }
    const local = localStorage.getItem('unicoach_saved_scholarships');
    if (local) {
      try { 
        const parsed = JSON.parse(local);
        setSavedScholarships(sanitizeList(parsed)); 
      } catch (e) {}
    }
  };

  const evaluateShortlist = async () => {
    setLoading(true);
    const startTime = Date.now();
    let list = (allScholarships && allScholarships.length > 0) ? allScholarships : fallbackScholarships;
    if (!list || list.length === 0) {
      try {
        const res = await fetch(`${API_URL}/scholarships?limit=200`);
        const data = await res.json();
        if (data.success && Array.isArray(data.scholarships) && data.scholarships.length > 0) {
          list = data.scholarships;
          setAllScholarships(list);
        }
      } catch (e) {
        list = fallbackScholarships;
      }
    }
    if (!list || list.length === 0) {
      list = fallbackScholarships;
    }

    setTimeout(() => {
      const evaluated = evaluateLocalScholarships(list, formData);
      setResults(evaluated);
      setStep(2);
      setLoading(false);
    }, 450);
  };

  const handleShortlistSubmit = (e) => {
    if (e) e.preventDefault();
    if (!user && !token) {
      if (openLoginModal) {
        openLoginModal({
          title: 'Unlock 150+ Verified Scholarships',
          subtitle: 'Sign in free with Google or email to view personalized Safe, Target & Dream scholarship grants',
          preventRedirect: true,
          onSuccess: () => {
            evaluateShortlist();
          }
        });
        return;
      }
    }
    evaluateShortlist();
  };

  const toggleSaveScholarship = async (scholarship) => {
    if (!scholarship) return;

    if (!user && !token && openLoginModal) {
      openLoginModal({
        title: 'Save to Your Scholarship Tracker',
        subtitle: 'Sign in free with Google or email to save grants and track deadlines on your profile',
        preventRedirect: true,
        onSuccess: () => {
          // This closure still sees the logged-out user/token; save directly with the new session
          saveScholarshipAfterLogin(scholarship);
        }
      });
      return;
    }

    return persistScholarshipToggle(scholarship, { isAuthenticated: Boolean(token), currentSaved: savedScholarships });
  };

  // Runs right after the login modal succeeds. The server endpoint is a toggle, so first load the
  // account's real shortlist: if the grant is already there, don't toggle it off.
  const saveScholarshipAfterLogin = async (scholarship) => {
    let serverSaved = null;
    try {
      const res = await fetch(`${API_URL}/scholarships/my/shortlist`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.shortlisted)) {
          serverSaved = data.shortlisted.filter(item => item && (item.id || item._id || item.title || item.scholarship));
          setSavedScholarships(serverSaved);
        }
      }
    } catch (err) {
      console.warn('Failed to load saved scholarships after login:', err);
    }

    const currentSaved = serverSaved || savedScholarships;
    if (currentSaved.some(s => isMatchingScholarship(s, scholarship))) {
      showToast(`${scholarship.title || 'Scholarship'} is already in your shortlist`);
      return;
    }
    return persistScholarshipToggle(scholarship, { isAuthenticated: true, currentSaved });
  };

  const persistScholarshipToggle = async (scholarship, { isAuthenticated, currentSaved }) => {
    const isAlreadySaved = currentSaved.some(s => isMatchingScholarship(s, scholarship));
    const schId = scholarship._id || scholarship.id || scholarship.customId;
    const authHeaders = { 'Content-Type': 'application/json' };
    if (token) authHeaders.Authorization = `Bearer ${token}`;

    if (isAlreadySaved) {
      // 1. Optimistically remove from state & localStorage
      const updated = currentSaved.filter(s => !isMatchingScholarship(s, scholarship));
      setSavedScholarships(updated);
      try {
        localStorage.setItem('unicoach_saved_scholarships', JSON.stringify(updated));
      } catch (e) {}
      showToast(`Removed ${scholarship.title || 'scholarship'} from shortlist`);

      // 2. Sync removal with backend if user is signed in (session cookie)
      if (isAuthenticated && schId) {
        try {
          await fetch(`${API_URL}/scholarships/toggle`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              scholarshipId: schId,
              scholarshipData: {
                title: scholarship.title,
                universityName: scholarship.universityName,
                country: scholarship.country
              }
            })
          });
        } catch (err) {
          console.warn('Backend removal sync failed:', err);
        }
      }
    } else {
      // 1. Optimistically save to state & localStorage
      const newEntry = {
        _id: scholarship._id || `saved_${Date.now()}`,
        id: scholarship.id || scholarship._id || scholarship.customId,
        customId: scholarship.customId || scholarship.id,
        scholarship: scholarship,
        title: scholarship.title,
        universityName: scholarship.universityName,
        country: scholarship.country,
        fundingType: scholarship.fundingType,
        awardCoverage: scholarship.awardCoverage,
        applicationStage: 'Shortlisted',
        matchScore: scholarship.matchScore || 85,
        studentNotes: ''
      };
      const updated = [newEntry, ...currentSaved.filter(s => !isMatchingScholarship(s, scholarship))];
      setSavedScholarships(updated);
      try {
        localStorage.setItem('unicoach_saved_scholarships', JSON.stringify(updated));
      } catch (e) {}
      showToast(`Saved ${scholarship.title || 'scholarship'} to shortlist!`);

      // 2. Sync save with backend if user is signed in (session cookie)
      if (isAuthenticated && schId) {
        try {
          const res = await fetch(`${API_URL}/scholarships/toggle`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              scholarshipId: schId,
              scholarshipData: {
                title: scholarship.title,
                universityName: scholarship.universityName,
                country: scholarship.country,
                fundingType: scholarship.fundingType,
                awardCoverage: scholarship.awardCoverage
              },
              studentProfile: {
                gpa: (formData.gpaPercent || 78) / 25,
                ielts: formData.ieltsScore || 7.0,
                degree: formData.targetDegree || 'Masters',
                familyIncome: formData.familyIncome || 1200000
              }
            })
          });
          const data = await res.json();
          if (data && data.success && data.userScholarship) {
            setSavedScholarships(prev => prev.some(s => isMatchingScholarship(s, scholarship))
              ? prev.map(s => 
                  isMatchingScholarship(s, scholarship) 
                    ? { ...s, ...data.userScholarship, scholarship: scholarship } 
                    : s
                )
              : [{ ...newEntry, ...data.userScholarship, scholarship: scholarship }, ...prev]
            );
          }
        } catch (err) {
          console.warn('Backend save sync failed:', err);
        }
      }
    }
  };

  const updateStage = async (id, stage) => {
    if (!token) {
      const updated = savedScholarships.map(s => s._id === id ? { ...s, applicationStage: stage } : s);
      setSavedScholarships(updated);
      localStorage.setItem('unicoach_saved_scholarships', JSON.stringify(updated));
      showToast(`Updated to ${stage}`);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/scholarships/stage/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ applicationStage: stage })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Updated to ${stage}`);
        fetchSavedScholarships();
      }
    } catch (err) {
      console.error('Stage update error:', err);
    }
  };

  const getDeadlineBadge = (deadlineDateStr) => {
    if (!deadlineDateStr) return { text: 'Rolling Intake', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    const target = new Date(deadlineDateStr);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Closed for 2026', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    } else if (diffDays <= 15) {
      return { text: `⚡ Urgent: ${diffDays}d Left`, color: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-black' };
    } else if (diffDays <= 35) {
      return { text: `⏳ ${diffDays}d Remaining`, color: 'bg-amber-50 text-amber-700 border-amber-200 font-bold' };
    } else {
      return { text: `🟢 ${diffDays}d Remaining`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' };
    }
  };

  const generateGoogleCalendarUrl = (scholarship) => {
    const title = encodeURIComponent(`[UniCoach Alert] ${scholarship.title} Deadline`);
    const details = encodeURIComponent(
      `University: ${scholarship.universityName}\nAward: ${scholarship.awardCoverage}\n\nOfficial Portal: ${scholarship.applicationProcess?.applicationPortalUrl || ''}\n\nSynced via UniCoach AI Engine.`
    );
    const location = encodeURIComponent(scholarship.universityName);
    const deadline = new Date(scholarship.deadline?.date || '2026-12-01');
    const startStr = deadline.toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 8);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startStr}/${startStr}`;
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveSearch(searchTerm.trim());
    setVisibleCount(18);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    setVisibleCount(18);
  };

  const getAllListings = () => {
    let list = [];
    if (activeCategoryTab === 'saved') {
      list = savedScholarships.map(s => s.scholarship || s);
    } else if (results) {
      if (activeCategoryTab === 'safe') list = results.safe || [];
      else if (activeCategoryTab === 'target') list = results.target || [];
      else if (activeCategoryTab === 'dream') list = results.dream || [];
      else {
        const safeItems = (results.safe || []).map(u => ({ ...u, categoryTag: 'safe' }));
        const targetItems = (results.target || []).map(u => ({ ...u, categoryTag: 'target' }));
        const dreamItems = (results.dream || []).map(u => ({ ...u, categoryTag: 'dream' }));
        list = [...safeItems, ...targetItems, ...dreamItems].sort((a, b) => b.matchScore - a.matchScore);
      }
    }

    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      list = list.filter(s => 
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.universityName && s.universityName.toLowerCase().includes(q)) ||
        (s.country && s.country.toLowerCase().includes(q)) ||
        (s.awardCoverage && s.awardCoverage.toLowerCase().includes(q))
      );
    }

    return list;
  };

  const handleExportScholarships = (exportAll = false) => {
    let listToExport = [];
    let filterLabel = activeCategoryTab;

    if (exportAll) {
      listToExport = allScholarships && allScholarships.length > 0 ? allScholarships : fallbackScholarships;
      filterLabel = 'All_Verified_Grants';
    } else if (activeCategoryTab === 'saved') {
      listToExport = savedScholarships.map(s => s.scholarship || s);
      filterLabel = 'My_Saved_Scholarships';
    } else if (activeCategoryTab === 'safe') {
      listToExport = results?.safe || [];
      filterLabel = 'Safe_Backup_Grants';
    } else if (activeCategoryTab === 'target') {
      listToExport = results?.target || [];
      filterLabel = 'Target_Ideal_Grants';
    } else if (activeCategoryTab === 'dream') {
      listToExport = results?.dream || [];
      filterLabel = 'Dream_Full_Ride_Grants';
    } else {
      listToExport = fullFilteredList && fullFilteredList.length > 0 ? fullFilteredList : (allScholarships || fallbackScholarships);
      filterLabel = 'All_Filtered_Grants';
    }

    if (!listToExport || listToExport.length === 0) {
      showToast('No scholarships found to export.');
      return;
    }

    const filename = `UniCoach_Scholarships_${filterLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    exportScholarshipsToExcel(listToExport, {
      filename,
      sheetName: 'Scholarships',
      studentProfile: formData
    });

    showToast(`Downloaded ${listToExport.length} scholarships in Excel! 📊`);
  };

  const fullFilteredList = getAllListings();
  const displayedList = fullFilteredList.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs md:text-sm font-bold border border-slate-800 backdrop-blur-md"
          >
            <CheckCircle2 className="text-emerald-400" size={18} />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Switcher Navigation */}
      <div className="flex items-center gap-2 bg-slate-200/80 border border-slate-300/80 p-1.5 rounded-2xl shadow-inner backdrop-blur-xs">
        <button
          onClick={() => setStep(1)}
          className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            step === 1 
              ? 'bg-[#DE5C2B] text-white shadow-md shadow-orange-500/20' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <SlidersHorizontal size={16} /> 1. Enter Your Profile & Financial Details
        </button>

        <button
          onClick={() => {
            if (!user && !token) {
              if (openLoginModal) {
                openLoginModal({
                  title: 'Unlock 150+ Verified Scholarships',
                  subtitle: 'Sign in free with Google or email to view personalized Safe, Target & Dream scholarship grants',
                  preventRedirect: true,
                  onSuccess: () => {
                    if (results) setStep(2);
                    else evaluateShortlist();
                  }
                });
                return;
              }
            }
            if (results) setStep(2);
            else evaluateShortlist();
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            step === 2 
              ? 'bg-[#DE5C2B] text-white shadow-md shadow-orange-500/20' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Compass size={16} /> 2. View Shortlisted Scholarships
        </button>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: STUDENT PROFILE & FINANCIAL CRITERIA FORM */}
      {/* ======================================================== */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200/90 p-6 md:p-10 rounded-[32px] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] space-y-8"
        >
          {/* Form Header with Visual Contrast */}
          <div className="bg-gradient-to-r from-blue-50/80 via-slate-50/60 to-transparent p-4 sm:p-5 rounded-2xl border border-orange-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2">
                <Award className="text-[#DE5C2B]" size={22} />
                Student Academic, Test & Financial Profile Inputs
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Please provide your scores so we can accurately match against scholarship eligibility criteria (Zero document uploads required).
              </p>
            </div>
            <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100/80 text-[#DE5C2B] border border-orange-200/60 whitespace-nowrap">
              Step 1 of 2
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Target Degree Level */}
            <div className="relative">
              <PremiumDropdown
                label="Target Degree Level"
                labelIcon={<GraduationCap size={15} className="text-emerald-500" />}
                value={formData.targetDegree}
                onChange={(val) => handleInputChange('targetDegree', val)}
                options={[
                  { value: 'Masters', label: "Master's / Postgraduate (MS / MA / MSc)", icon: '🎓', description: 'Most popular for international students' },
                  { value: 'Bachelors', label: "Bachelor's / Undergraduate (BS / BA / BTech)", icon: '📘', description: '4-year undergraduate programmes' },
                  { value: 'PhD', label: 'Doctorate / PhD / Research Fellow', icon: '🔬', description: 'Full-time research positions' },
                ]}
              />
            </div>

            {/* Academic Percentage / GPA */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Award size={15} className="text-emerald-500" /> Academic Score (% or GPA converted)
              </label>
              <div className="relative">
                <input 
                  type="number"
                  min="40"
                  max="100"
                  value={formData.gpaPercent}
                  onChange={(e) => handleInputChange('gpaPercent', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  placeholder="e.g. 78"
                />
                <span className="absolute right-3.5 top-3 text-xs font-black text-slate-400">%</span>
              </div>
            </div>

            {/* Field of Study / Major */}
            <div className="relative">
              <PremiumDropdown
                label="Major / Field of Study"
                labelIcon={<BookOpen size={15} className="text-emerald-500" />}
                value={formData.streamMajor}
                onChange={(val) => handleInputChange('streamMajor', val)}
                accent="emerald"
                searchable={true}
                creatable={true}
                defaultIcon={<BookOpen size={16} className="text-emerald-500" />}
                searchPlaceholder="Search or type custom course..."
                placeholder="Select or enter your course..."
                options={POPULAR_COURSES}
              />
            </div>

            {/* Target Destination Country */}
            <div className="relative">
              <PremiumDropdown
                label="Target Destination"
                labelIcon={<Globe size={15} className="text-emerald-500" />}
                value={formData.targetCountry}
                onChange={(val) => handleInputChange('targetCountry', val)}
                accent="emerald"
                searchable={true}
                searchPlaceholder="Search 160+ countries (e.g. USA, Canada, Germany)..."
                placeholder="Select destination..."
                options={ALL_COUNTRY_OPTIONS}
              />
            </div>

            {/* Funding Preference */}
            <div className="relative">
              <PremiumDropdown
                label="Preferred Funding Type"
                labelIcon={<DollarSign size={15} className="text-emerald-500" />}
                value={formData.fundingType}
                onChange={(val) => handleInputChange('fundingType', val)}
                options={[
                  { value: 'All', label: 'All Funding Types', icon: '✨', description: 'Show all scholarship types' },
                  { value: 'Full Ride', label: 'Full Ride (100% Tuition + Living)', icon: '👑', description: 'Covers tuition, housing & stipend' },
                  { value: 'Tuition Waiver', label: 'Tuition Fee Waiver / Discount', icon: '🎓', description: 'Partial or full tuition coverage' },
                  { value: 'Living Stipend', label: 'Monthly Living / Research Stipend', icon: '💶', description: 'Monthly allowance for expenses' },
                  { value: 'Need-Based', label: 'Need-Based Financial Aid', icon: '🤝', description: 'Based on family income proof' },
                  { value: 'Fellowship', label: 'Fellowship / Endowment Trust', icon: '🏛️', description: 'Prestigious research fellowships' },
                ]}
              />
            </div>

            {/* IELTS / English Score */}
            <div className="relative">
              <PremiumDropdown
                label="IELTS / TOEFL Score"
                labelIcon={<BookOpen size={15} className="text-emerald-500" />}
                value={formData.ieltsScore}
                onChange={(val) => handleInputChange('ieltsScore', val)}
                options={[
                  { value: '7.5', label: '7.5+ Band (High Distinction / Top Tier)', icon: '🏆', description: 'Qualifies for all scholarships' },
                  { value: '7.0', label: '7.0 Band (Strong / Meets 95% Cutoffs)', icon: '✅', description: 'Meets most university requirements' },
                  { value: '6.5', label: '6.5 Band (Standard Cutoff)', icon: '📊', description: 'Minimum for many programmes' },
                  { value: '6.0', label: '6.0 Band (Moderate)', icon: '📝', description: 'May need conditional offer' },
                ]}
              />
            </div>

            {/* Annual Family Income Bracket (Document-Free) */}
            <div className="relative">
              <PremiumDropdown
                label="Annual Family Income (For Need-Based Aid)"
                labelIcon={<HeartHandshake size={15} className="text-emerald-500" />}
                value={formData.familyIncome}
                onChange={(val) => handleInputChange('familyIncome', val)}
                options={[
                  { value: '600000', label: '< ₹8 Lakhs / year', icon: '💚', description: 'High need-based eligibility' },
                  { value: '1200000', label: '₹8 Lakhs – ₹15 Lakhs / year', icon: '💛', description: 'Moderate need-based eligibility' },
                  { value: '2000000', label: '₹15 Lakhs – ₹25 Lakhs / year', icon: '🧡', description: 'Mixed merit + need based' },
                  { value: '3500000', label: '> ₹25 Lakhs / year', icon: '💎', description: 'Merit-first scholarships' },
                ]}
              />
            </div>

            {/* GRE Score */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Award size={15} className="text-emerald-500" /> GRE Score (0 if not taken)
              </label>
              <input 
                type="number"
                min="0"
                max="340"
                value={formData.greScore}
                onChange={(e) => handleInputChange('greScore', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                placeholder="0 (or e.g. 320)"
              />
            </div>

            {/* Target Intake */}
            <div className="relative">
              <PremiumDropdown
                label="Target Intake"
                labelIcon={<Calendar size={15} className="text-emerald-500" />}
                value={formData.intake}
                onChange={(val) => handleInputChange('intake', val)}
                options={[
                  { value: 'Fall 2026', label: 'Fall 2026 (Aug/Sep 2026)', icon: '🍂', description: 'Primary intake season' },
                  { value: 'Spring 2027', label: 'Spring 2027 (Jan/Feb 2027)', icon: '🌸', description: 'Secondary intake season' },
                  { value: 'Fall 2027', label: 'Fall 2027 (Aug/Sep 2027)', icon: '🍁', description: 'Next year primary intake' },
                ]}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-semibold">
              Instant matching across 100% verified merit, need-based & government grant programs.
            </p>

            <button
              onClick={handleShortlistSubmit}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Evaluating 150+ Verified Scholarships...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Shortlist Scholarships Now <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: CATEGORIZED SHORTLIST DASHBOARD */}
      {/* ======================================================== */}
      {step === 2 && results && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Badges Bar (Identical to University Shortlister) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            
            {/* Total Evaluated */}
            <button
              onClick={() => setActiveCategoryTab('all')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeCategoryTab === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-wider ${activeCategoryTab === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>Total Evaluated</p>
              <p className="text-xl md:text-2xl font-black mt-1">{(results.safe.length + results.target.length + results.dream.length)}</p>
            </button>

            {/* Safe Backup */}
            <button
              onClick={() => setActiveCategoryTab('safe')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeCategoryTab === 'safe'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
                  : 'bg-emerald-50/50 text-emerald-900 border-emerald-200/70 hover:bg-emerald-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-black uppercase tracking-wider ${activeCategoryTab === 'safe' ? 'text-emerald-100' : 'text-emerald-700'}`}>🛡️ Safe Backup</p>
                <ShieldCheck size={16} className={activeCategoryTab === 'safe' ? 'text-emerald-200' : 'text-emerald-600'} />
              </div>
              <p className="text-xl md:text-2xl font-black mt-1">{results.safe.length} Grants</p>
            </button>

            {/* Target Match */}
            <button
              onClick={() => setActiveCategoryTab('target')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeCategoryTab === 'target'
                  ? 'bg-[#DE5C2B] text-white border-blue-600 shadow-md shadow-blue-100'
                  : 'bg-orange-50/50 text-blue-900 border-orange-200/70 hover:bg-orange-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-black uppercase tracking-wider ${activeCategoryTab === 'target' ? 'text-blue-100' : 'text-[#C04A1D]'}`}>⚖️ Target Match</p>
                <Compass size={16} className={activeCategoryTab === 'target' ? 'text-orange-200' : 'text-[#DE5C2B]'} />
              </div>
              <p className="text-xl md:text-2xl font-black mt-1">{results.target.length} Grants</p>
            </button>

            {/* Dream / Reach */}
            <button
              onClick={() => setActiveCategoryTab('dream')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeCategoryTab === 'dream'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100'
                  : 'bg-purple-50/50 text-purple-900 border-purple-200/70 hover:bg-purple-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-black uppercase tracking-wider ${activeCategoryTab === 'dream' ? 'text-purple-100' : 'text-purple-700'}`}>👑 Dream / Full-Ride</p>
                <Target size={16} className={activeCategoryTab === 'dream' ? 'text-purple-200' : 'text-purple-600'} />
              </div>
              <p className="text-xl md:text-2xl font-black mt-1">{results.dream.length} Grants</p>
            </button>

            {/* My Saved List */}
            <button
              onClick={() => setActiveCategoryTab('saved')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeCategoryTab === 'saved'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-100'
                  : 'bg-amber-50/50 text-amber-900 border-amber-200/70 hover:bg-amber-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-black uppercase tracking-wider ${activeCategoryTab === 'saved' ? 'text-amber-100' : 'text-amber-700'}`}>🔖 My Saved List</p>
                <BookmarkCheck size={16} className={activeCategoryTab === 'saved' ? 'text-amber-200' : 'text-amber-600'} />
              </div>
              <p className="text-xl md:text-2xl font-black mt-1">{savedScholarships.length} Saved</p>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 md:p-4 shadow-sm space-y-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search scholarships by grant title, university, or country (e.g. Fulbright, Commonwealth, Harvard)..."
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition placeholder:text-slate-400"
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    onClick={handleClearSearch}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
              <button
                onClick={handleSearchSubmit}
                className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Search size={15} /> Search Grants
              </button>
            </div>
            {activeSearch && (
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1 px-1">
                <span>Showing search results for: <strong className="text-emerald-600">"{activeSearch}"</strong> ({fullFilteredList.length} found)</span>
                <button onClick={handleClearSearch} className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer">
                  <X size={12} /> Clear Filter
                </button>
              </div>
            )}
          </div>

          {/* EXCEL EXPORT & SHORTLIST DOWNLOAD ACTION BANNER */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-indigo-50/40 border border-emerald-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-200/50 shrink-0">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-black text-slate-800 flex items-center gap-2">
                  <span>Download Scholarships in Excel</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                    .XLSX Format
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Export award amounts, coverage terms, eligibility criteria, and cutoff deadlines to an offline spreadsheet.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => handleExportScholarships(false)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-200/60"
                title="Download top matched scholarships"
              >
                <Download size={14} />
                <span>Export Top ({fullFilteredList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportScholarships(true)}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                title="Download all verified scholarships in Excel"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>Export All ({allScholarships.length})</span>
              </button>
            </div>
          </div>

          {/* Empty State */}
          {displayedList.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
                <Search size={28} />
              </div>
              <h4 className="text-lg font-black text-slate-800">No Scholarships Found</h4>
              <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto font-medium">
                {activeSearch 
                  ? `No scholarship grant matching "${activeSearch}" was found. Try searching by country name or university.`
                  : activeCategoryTab === 'saved' 
                  ? "You haven't bookmarked any scholarship grants yet. Click the bookmark icon on any scholarship card to save it!"
                  : "No scholarships matched the selected category criteria."}
              </p>
              {activeSearch && (
                <button
                  onClick={handleClearSearch}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition cursor-pointer"
                >
                  Clear Search & View All
                </button>
              )}
            </div>
          )}

          {/* Cards Grid matching University Shortlister style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedList.map((scholarship, sIdx) => {
              const schKey = scholarship.id || scholarship._id || scholarship.customId || `${scholarship.title}-${sIdx}`;
              const isSaved = savedScholarships.some(s => isMatchingScholarship(s, scholarship));

              const catType = scholarship.categoryTag || (scholarship.matchScore >= 80 ? 'safe' : scholarship.matchScore >= 65 ? 'target' : 'dream');

              const badgeColors = {
                safe: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                target: 'bg-orange-100 text-blue-800 border-orange-200',
                dream: 'bg-purple-100 text-purple-800 border-purple-200'
              };

              const badgeLabels = {
                safe: '🛡️ Safe Backup',
                target: '⚖️ Target Match',
                dream: '👑 Dream / Reach'
              };

              const deadlineInfo = getDeadlineBadge(scholarship.deadline?.date);

              return (
                <motion.div
                  key={schKey}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200/70 hover:border-emerald-300 rounded-[24px] p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Category Badge & Bookmark Icon */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeColors[catType]}`}>
                        {badgeLabels[catType]}
                      </span>

                      <button
                        onClick={() => toggleSaveScholarship(scholarship)}
                        className={`p-2 rounded-full transition-all cursor-pointer ${
                          isSaved 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
                      >
                        <BookmarkCheck size={18} />
                      </button>
                    </div>

                    {/* University & Title Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl border border-slate-100 p-2 bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-xs">
                        <UniversityLogo 
                          domain={getDomainForScholarship(scholarship)} 
                          name={scholarship.universityName} 
                          size={38} 
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-base group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2">
                          {scholarship.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold mt-0.5 flex items-center gap-1">
                          <Globe size={13} className="text-emerald-500" />
                          <span>{scholarship.universityName}</span> • <span>{scholarship.country}</span>
                        </p>
                      </div>
                    </div>

                    {/* Admission Match Meter */}
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-500">Eligibility Match</span>
                        <span className="text-emerald-600">{scholarship.matchScore || 85}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${scholarship.matchScore || 85}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                        />
                      </div>
                    </div>

                    {/* Coverage & Deadline Highlights */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Award Type</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5 truncate">{scholarship.fundingType}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Deadline</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5 truncate">{deadlineInfo.text}</p>
                      </div>
                    </div>

                    {/* Award Coverage Banner */}
                    <div className="p-3 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-100 rounded-2xl">
                      <p className="text-[9px] uppercase font-black tracking-wider text-emerald-700">Coverage Description</p>
                      <p className="text-xs font-black text-emerald-950 mt-0.5 line-clamp-2">
                        {scholarship.awardCoverage}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Cutoff: <strong className="text-slate-800">{scholarship.deadline?.displayDeadline}</strong></span>
                      <a
                        href={generateGoogleCalendarUrl(scholarship)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                        title="Add to Google Calendar"
                      >
                        <CalendarPlus size={13} /> Sync Cal
                      </a>
                    </div>

                    <button
                      onClick={() => {
                        if (!user && !token && openLoginModal) {
                          openLoginModal({
                            title: 'AI Scholarship Match Explainer',
                            subtitle: 'Sign in free with Google or email to view AI eligibility and winning application strategies',
                            preventRedirect: true,
                            onSuccess: () => {
                              setExplainingScholarship(scholarship);
                            }
                          });
                          return;
                        }
                        setExplainingScholarship(scholarship);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 border border-emerald-200/80 font-black text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles size={13} className="text-emerald-600" /> Explain Match (AI 💡)
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedScholarship(scholarship)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Details
                      </button>
                      <a
                        href={cleanPortalUrl(
                          scholarship.applicationProcess?.applicationPortalUrl,
                          `${scholarship.title} ${scholarship.universityName} ${scholarship.country}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        Portal <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* See More Button */}
          {activeCategoryTab === 'all' && fullFilteredList.length > displayedList.length && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setVisibleCount(prev => prev + 18)}
                className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Compass size={18} /> See More
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* SCHOLARSHIP DETAIL MODAL */}
      {/* ======================================================== */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedScholarship && (
            <div className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar p-6 md:p-8 shadow-2xl space-y-6 relative touch-pan-y"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl border border-slate-100 p-2.5 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
                    <UniversityLogo 
                      domain={getDomainForScholarship(selectedScholarship)} 
                      name={selectedScholarship.universityName} 
                      size={44} 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                      <span>{selectedScholarship.country}</span> • <span>{selectedScholarship.institutionType || 'Public'}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                      {selectedScholarship.title}
                    </h2>
                    <p className="text-sm font-bold text-slate-600">
                      {selectedScholarship.universityName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedScholarship(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-black flex-shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Award Amount & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Award Coverage</p>
                  <p className="text-base font-black text-emerald-950 mt-0.5">{selectedScholarship.awardCoverage}</p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">{selectedScholarship.amount?.display}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Application Deadline</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">{selectedScholarship.deadline?.displayDeadline}</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Intake: {selectedScholarship.deadline?.intakeSeason} {selectedScholarship.deadline?.intakeYear}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">About the Award</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedScholarship.description}</p>
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">Eligibility Requirements</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                  <div>• Degree: <strong className="text-slate-900">{selectedScholarship.eligibility?.degreeLevels?.join(', ')}</strong></div>
                  <div>• Min IELTS: <strong className="text-slate-900">{(() => {
                    const val = typeof selectedScholarship.eligibility?.minIelts === 'object' ? selectedScholarship.eligibility?.minIelts?.value : selectedScholarship.eligibility?.minIelts;
                    return val && Number(val) > 0 ? val : 'Standard Cutoff';
                  })()}</strong></div>
                  <div>• Evaluation: <strong className="text-slate-900">{selectedScholarship.eligibility?.evaluationType || 'Competitive Merit'}</strong></div>
                  <div>• Financial Aid: <strong className="text-slate-900">{selectedScholarship.eligibility?.financialCriteria?.isNeedBased ? 'Need-Based Assessment' : 'Open Merit'}</strong></div>
                </div>
                {selectedScholarship.eligibility?.academicRequirementNote && (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    ℹ️ {selectedScholarship.eligibility.academicRequirementNote}
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const isModalSaved = selectedScholarship && savedScholarships.some(s => isMatchingScholarship(s, selectedScholarship));
                    return (
                      <button
                        onClick={() => {
                          toggleSaveScholarship(selectedScholarship);
                        }}
                        className={`px-4 py-2.5 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer ${
                          isModalSaved 
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <BookmarkCheck size={15} /> {isModalSaved ? 'Remove from Shortlist' : 'Save to Shortlist'}
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => {
                      setExplainingScholarship(selectedScholarship);
                    }}
                    className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} className="text-emerald-600" /> Explain Match (AI)
                  </button>
                </div>

                <a
                  href={cleanPortalUrl(
                    selectedScholarship.applicationProcess?.applicationPortalUrl,
                    `${selectedScholarship.title} ${selectedScholarship.universityName} ${selectedScholarship.country}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  Visit Portal <ExternalLink size={15} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* AI Eligibility Explainer Modal */}
      <ScholarshipAiExplainerModal
        isOpen={!!explainingScholarship}
        onClose={() => setExplainingScholarship(null)}
        scholarship={explainingScholarship}
        studentProfile={formData}
      />
    </div>
  );
};

export default ScholarshipShortlister;
