import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Compass, Search, Target, ShieldCheck, Award, 
  GraduationCap, Globe, DollarSign, CheckCircle2, BookOpen, 
  ExternalLink, SlidersHorizontal, RefreshCw, BookmarkCheck, ArrowRight, ArrowLeft, Calendar, Briefcase, X,
  FileSpreadsheet, Download
} from 'lucide-react';
import UniversityLogo from './UniversityLogo';
import PremiumDropdown from './PremiumDropdown';
import OptionIcon from './ui/OptionIcon';
import NumberStepperInput from './ui/NumberStepperInput';
import { matchesUniversitySearch } from '../utils/universitySearchMatcher';
import { getVerifiedRanking } from '../utils/ranking';
import { getOfficialRequirements } from '../utils/requirements';
import UniversityDetailsModal from './UniversityDetailsModal';
import UniversityAiExplainerModal from './UniversityAiExplainerModal';
import CourseFinderCard from './CourseFinderCard';
import CourseFinderFilterBar from './CourseFinderFilterBar';
import CourseFinderComparisonBar from './CourseFinderComparisonBar';
import CourseAndMentorDrawer from './CourseAndMentorDrawer';
import PriorityDmModal from './PriorityDmModal';
import { cleanPortalUrl, getUniversityPortalFallback } from '../utils/urlHelpers';
import ALL_UNIVERSITIES from '../data/universities';
import { useAuth } from '../context/AuthContext';
import { POPULAR_COURSES, ALL_COUNTRY_OPTIONS } from '../utils/shortlistOptions';
import ExcelColumnExportModal from './ExcelColumnExportModal';
import { 
  exportUniversitiesToExcel, 
  exportSelectedProgramsToExcel,
  DEFAULT_PROGRAM_COLUMNS,
  DEFAULT_UNIVERSITY_COLUMNS 
} from '../utils/excelExporter';
import { API_BASE_URL } from '../config';
import { EMPTY_FILTERS, pickProfile, readLocalProfile, writeLocalProfile } from '../utils/shortlistProfile';

const POPULAR_SEARCH_CHIPS = [
  { label: 'Computer Science', query: 'Computer Science', icon: '💻' },
  { label: 'Data Science', query: 'Data Science', icon: '📊' },
  { label: 'MBA', query: 'MBA', icon: '📈' },
  { label: 'AI & ML', query: 'Artificial Intelligence', icon: '🤖' },
  { label: 'Software Eng', query: 'Software Engineering', icon: '⚡' },
  { label: 'Mechanical', query: 'Mechanical Engineering', icon: '⚙️' },
  { label: 'Biotechnology', query: 'Biotechnology', icon: '🧫' },
  { label: 'Finance', query: 'Finance', icon: '💰' },
  { label: 'Cybersecurity', query: 'Cybersecurity', icon: '🛡️' }
];


const API_URL = API_BASE_URL;

const fallbackUniversities = ALL_UNIVERSITIES;

function evaluateLocalShortlist(formData) {
  const parsedGpa = parseFloat(formData.gpaPercent) || 75;
  const parsedIelts = parseFloat(formData.ieltsScore) || 6.5;
  const parsedGre = parseInt(formData.greScore, 10) || 0;
  const parsedBudget = parseFloat(formData.maxBudgetUSD) || 40000;

  const filtered = fallbackUniversities.filter(uni => {
    if (formData.targetCountry && formData.targetCountry !== 'All' && formData.targetCountry !== 'All Destinations' && formData.targetCountry !== 'All Global Destinations') {
      const tc = formData.targetCountry.toLowerCase().trim();
      const uCn = (uni.countryName || '').toLowerCase().trim();
      const uC = (uni.country || '').toLowerCase().trim();

      const isUS = (tc === 'usa' || tc.includes('united states') || tc === 'us' || tc.includes('america')) && (uCn.includes('usa') || uCn.includes('united states') || uC.includes('usa') || uC.includes('us'));
      const isUK = (tc === 'uk' || tc.includes('united kingdom') || tc === 'gb' || tc.includes('england') || tc.includes('britain')) && (uCn.includes('uk') || uCn.includes('united kingdom') || uC.includes('uk') || uC.includes('gb'));
      const isDirect = uCn === tc || uC === tc || uCn.includes(tc) || tc.includes(uCn);

      if (!isUS && !isUK && !isDirect) {
        return false;
      }
    }
    return true;
  });

  const listToUse = filtered.length > 0 ? filtered : fallbackUniversities;

  const categorized = { safe: [], target: [], dream: [] };

  listToUse.forEach((uni, idx) => {
    const rankNum = uni.rankingNum || (uni.rank ? parseInt(String(uni.rank).replace(/\D/g, '')) || 450 : (idx + 1));
    let accRate = uni.acceptanceRate || (rankNum <= 50 ? 12 : rankNum <= 150 ? 25 : rankNum <= 350 ? 45 : 68);

    let reqGpa = uni.minGpaPercent || 65;
    let reqIelts = uni.minIeltsScore || 6.5;
    let reqGre = uni.minGreScore || 0;
    let greReq = uni.greRequired || false;

    if (rankNum <= 50 || accRate <= 15) {
      reqGpa = Math.max(reqGpa, 86);
      reqIelts = Math.max(reqIelts, 7.5);
      if (greReq) reqGre = Math.max(reqGre, 320);
    } else if (rankNum <= 150 || accRate <= 30) {
      reqGpa = Math.max(reqGpa, 78);
      reqIelts = Math.max(reqIelts, 7.0);
      if (greReq) reqGre = Math.max(reqGre, 310);
    } else if (rankNum <= 350 || accRate <= 50) {
      reqGpa = Math.max(reqGpa, 70);
      reqIelts = Math.max(reqIelts, 6.5);
    } else {
      reqGpa = Math.min(reqGpa, 62);
      reqIelts = Math.min(reqIelts, 6.0);
    }

    let score = 0;
    // GPA
    if (parsedGpa >= reqGpa + 8) score += 40;
    else if (parsedGpa >= reqGpa + 2) score += 34;
    else if (parsedGpa >= reqGpa - 3) score += 26;
    else if (parsedGpa >= reqGpa - 8) score += 16;
    else score += 6;

    // IELTS / English Proficiency
    const isWaiverOrNotTaken = (formData.ieltsScore === '0' || formData.ieltsScore === 'Waiver' || !formData.ieltsScore || parsedIelts === 0);
    if (isWaiverOrNotTaken) {
      score += 22; // Standard MOI / English Waiver baseline points
    } else if (parsedIelts >= reqIelts + 0.5) {
      score += 30;
    } else if (parsedIelts >= reqIelts) {
      score += 24;
    } else if (parsedIelts >= reqIelts - 0.5) {
      score += 14;
    } else {
      score += 5;
    }

    // GRE
    if (!greReq || reqGre === 0) score += 15;
    else if (parsedGre >= reqGre + 10) score += 15;
    else if (parsedGre >= reqGre) score += 10;
    else score += 4;

    // Budget (an unknown fee is neutral, never an assumed price)
    const feeUSD = Number(uni.tuitionFeeUSD) || 0;
    if (!feeUSD) score += 10;
    else if (parsedBudget >= feeUSD) score += 15;
    else if (parsedBudget >= feeUSD * 0.85) score += 10;
    else score += 3;

    const matchScore = Math.min(98, Math.max(35, score));
    const isAffordable = !feeUSD || parsedBudget >= feeUSD;

    let category = 'target';
    if (
      rankNum <= 120 || 
      accRate <= 25 || 
      parsedGpa < reqGpa || 
      (feeUSD > 0 && !isAffordable && feeUSD > parsedBudget * 1.15)
    ) {
      category = 'dream';
    } else if (
      rankNum > 300 &&
      accRate >= 48 &&
      parsedGpa >= reqGpa + 4 &&
      isAffordable &&
      matchScore >= 75
    ) {
      category = 'safe';
    } else {
      category = 'target';
    }

    const uniItem = { ...uni, matchScore, categoryTag: category };

    if (category === 'safe') categorized.safe.push(uniItem);
    else if (category === 'target') categorized.target.push(uniItem);
    else categorized.dream.push(uniItem);
  });

  const sortByPrestigeAndFit = (list) => {
    return list.sort((a, b) => {
      const aRank = a.rankingNum && a.rankingNum < 1500 ? a.rankingNum : 2500;
      const bRank = b.rankingNum && b.rankingNum < 1500 ? b.rankingNum : 2500;
      const aQuality = (3000 - aRank) * 0.45 + (a.matchScore || 50) * 0.55;
      const bQuality = (3000 - bRank) * 0.45 + (b.matchScore || 50) * 0.55;
      return bQuality - aQuality;
    });
  };

  categorized.safe = sortByPrestigeAndFit(categorized.safe).slice(0, 20);
  categorized.target = sortByPrestigeAndFit(categorized.target).slice(0, 20);
  categorized.dream = sortByPrestigeAndFit(categorized.dream).slice(0, 20);

  return categorized;
}

const UniversityShortlister = ({ user: propUser, verifiedLead }) => {
  const { token, user: authUser, openLoginModal, loading: authLoading } = useAuth();
  const currentUser = propUser || authUser;
  const userId = currentUser?._id || currentUser?.id || null;
  const isSignedIn = Boolean(currentUser || token);
  const [searchParams] = useSearchParams();
  // Everyone starts on step 1 (a signed-in student's saved details are pre-filled); matches come after they submit it
  const [step, setStep] = useState(1);
  // 'checking' → looking for a saved profile, 'none' → must fill step 1, 'saved' → profile known
  const [profileStatus, setProfileStatus] = useState('checking');
  const profileStatusRef = useRef('checking');
  const pendingProfileRef = useRef(null);
  const requestSeqRef = useRef(0);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formData, setFormData] = useState({
    educationLevel: currentUser?.highestEducation || "Bachelor's",
    gpaPercent: 75,
    streamMajor: currentUser?.dreamCourse || 'Computer Science',
    targetCountry: currentUser?.dreamCountry || verifiedLead?.dreamCountry || 'All',
    targetDegree: 'Master\'s',
    maxBudgetUSD: 35000,
    ieltsScore: 6.5,
    greScore: 0,
    intake: currentUser?.preferredIntake || 'Fall 2026',
    workExpYears: 1
  });

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [allUniversities, setAllUniversities] = useState([]);
  const [summary, setSummary] = useState({ totalEvaluated: 0, safeCount: 0, targetCount: 0, dreamCount: 0 });
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalItems: 0, hasMore: false });
  const [results, setResults] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [savedUnis, setSavedUnis] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [selectedUniForModal, setSelectedUniForModal] = useState(null);
  const [explainingUni, setExplainingUni] = useState(null);
  const [activeCourseDrawer, setActiveCourseDrawer] = useState(null);
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);
  const [dmModalData, setDmModalData] = useState(null);
  const [exportModalConfig, setExportModalConfig] = useState(null);

  const [selectedPrograms, setSelectedPrograms] = useState([]);

  const updateProfileStatus = (status) => {
    profileStatusRef.current = status;
    setProfileStatus(status);
  };

  // Read ?country= URL param and pre-fill the destination on mount
  useEffect(() => {
    const countryParam = searchParams.get('country');
    if (countryParam && countryParam !== 'All') {
      setFormData(prev => ({ ...prev, targetCountry: countryParam }));
    }
  }, []);

  // Load saved bookmarks in the background
  useEffect(() => {
    fetchSavedUnis();
  }, [token]);

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = (searchTerm || '').trim();
    setActiveSearch(query);
    fetchShortlist(1, false, query, activeCategoryTab, false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    setFilters(EMPTY_FILTERS);
    fetchShortlist(1, false, '', activeCategoryTab, false, { filters: EMPTY_FILTERS });
  };

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    fetchShortlist(1, false, activeSearch, activeCategoryTab, false, { filters: next });
  };

  // Cities belong to a country, so a new country clears the city
  const handleFilterCountryChange = (country) => {
    const profile = { ...formData, targetCountry: country };
    const next = { ...filters, city: '' };
    setFormData(profile);
    setFilters(next);
    fetchShortlist(1, false, activeSearch, activeCategoryTab, false, { profile, filters: next });
  };

  const handleExportSelectedPrograms = () => {
    if (!selectedPrograms || selectedPrograms.length === 0) {
      showToast('Please select at least one program to export.');
      return;
    }

    setExportModalConfig({
      isOpen: true,
      type: 'programs',
      items: selectedPrograms,
      availableColumns: DEFAULT_PROGRAM_COLUMNS
    });
  };

  const handleToggleProgramSelect = (programObj) => {
    setSelectedPrograms(prev => {
      const exists = prev.some(p => p.id === programObj.id);
      if (exists) {
        return prev.filter(p => p.id !== programObj.id);
      } else {
        return [...prev, programObj];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedPrograms([]);
  };

  const handleSaveSelectedToShortlist = async () => {
    for (const prog of selectedPrograms) {
      if (prog.university) {
        await toggleSaveUni(prog.university);
      }
    }
    showToast(`Saved ${selectedPrograms.length} programs to your profile shortlist! 🔖`);
    setSelectedPrograms([]);
  };

  const fetchSavedUnis = async () => {
    if (!token) {
      const local = localStorage.getItem('unicoach_saved_unis');
      if (local) {
        try { setSavedUnis(JSON.parse(local)); } catch (e) {}
      }
      return;
    }
    try {
      const res = await fetch(`${API_URL}/saved-universities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.savedUniversities) {
        setSavedUnis(data.savedUniversities);
      }
    } catch (err) {
      console.warn('Failed to load saved universities from backend, checking localStorage:', err);
      const local = localStorage.getItem('unicoach_saved_unis');
      if (local) {
        try { setSavedUnis(JSON.parse(local)); } catch (e) {}
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // `opts.profile` / `opts.filters` pass values that were just set (state updates aren't visible in this closure yet)
  const fetchShortlist = async (pageNum = 1, append = false, querySearch = activeSearch, cat = activeCategoryTab, switchToStep2 = true, opts = {}) => {
    const safePage = typeof pageNum === 'number' ? pageNum : 1;
    const safeAppend = typeof append === 'boolean' ? append : false;
    const safeSearch = typeof querySearch === 'string' ? querySearch : activeSearch;
    const safeCat = typeof cat === 'string' ? cat : activeCategoryTab;
    const profile = opts.profile || formData;
    const activeFilters = opts.filters || filters;

    // Quick filter clicks can overlap: only the latest request may update the results
    const seq = ++requestSeqRef.current;
    const isStale = () => seq !== requestSeqRef.current;

    const isInitialEvaluation = safePage === 1 && !safeAppend;
    const startTime = Date.now();

    // Only display full-screen blocking modal when student explicitly requests AI Evaluation (switchToStep2 === true)
    if (isInitialEvaluation && switchToStep2) {
      setLoading(true);
    } else if (!isInitialEvaluation) {
      setLoadingMore(true);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout guard

      const res = await fetch(`${API_URL}/shortlist`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          ...activeFilters,
          search: safeSearch,
          category: safeCat,
          page: safePage,
          limit: 18
        })
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (isStale()) return;
      if (res.ok && data.universities) {
        const newUnis = data.universities;
        if (safeAppend) {
          setAllUniversities(prev => [...prev, ...newUnis]);
        } else {
          setAllUniversities(newUnis);
        }
        setSummary(data.summary || { totalEvaluated: 0, safeCount: 0, targetCount: 0, dreamCount: 0 });
        setPagination(data.pagination || { page: safePage, totalPages: 1, totalItems: 0, hasMore: false });
        const allItems = safeAppend ? [...allUniversities, ...newUnis] : newUnis;
        setResults({
          safe: allItems.filter(u => u.categoryTag === 'safe'),
          target: allItems.filter(u => u.categoryTag === 'target'),
          dream: allItems.filter(u => u.categoryTag === 'dream')
        });

        if (isInitialEvaluation && switchToStep2) {
          const elapsed = Date.now() - startTime;
          if (elapsed < 450) {
            await new Promise(r => setTimeout(r, 450 - elapsed));
          }
        }

        if (switchToStep2) {
          setStep(2);
        }
        return;
      }
    } catch (err) {
      if (isStale()) return;
      console.warn('Backend endpoint delayed or unreachable, using client-side matching engine:', err);
      const localShortlist = evaluateLocalShortlist(profile);
      setResults(localShortlist);
      let allLocal = [...(localShortlist.safe || []).map(u => ({...u, categoryTag: 'safe'})), ...(localShortlist.target || []).map(u => ({...u, categoryTag: 'target'})), ...(localShortlist.dream || []).map(u => ({...u, categoryTag: 'dream'}))];
      if (safeSearch) {
        allLocal = allLocal.filter(u => matchesUniversitySearch(u, safeSearch));
      }
      if (activeFilters.city) {
        const city = activeFilters.city.toLowerCase();
        allLocal = allLocal.filter(u => String(u.city || '').toLowerCase() === city);
      }
      if (safeCat && safeCat !== 'all' && ['safe', 'target', 'dream'].includes(safeCat)) {
        allLocal = allLocal.filter(u => u.categoryTag === safeCat);
      }
      setAllUniversities(allLocal);
      setSummary({ totalEvaluated: allLocal.length, safeCount: localShortlist.safe?.length || 0, targetCount: localShortlist.target?.length || 0, dreamCount: localShortlist.dream?.length || 0 });
      setPagination({ page: 1, totalPages: 1, totalItems: allLocal.length, hasMore: false });

      if (isInitialEvaluation && switchToStep2) {
        const elapsed = Date.now() - startTime;
        if (elapsed < 450) {
          await new Promise(r => setTimeout(r, 450 - elapsed));
        }
      }

      if (switchToStep2) {
        setStep(2);
      }
    } finally {
      if (!isStale()) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  // Remember step 1 so the student isn't asked again: localStorage for an instant next visit,
  // the server so it follows them to other devices
  const persistProfile = (profile, knownUserId) => {
    const clean = pickProfile(profile);
    if (knownUserId) writeLocalProfile(knownUserId, clean);
    else pendingProfileRef.current = clean; // signed in through the modal: the auth effect stores it under the new account
    fetch(`${API_URL}/shortlist/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(clean)
    }).catch(err => console.warn('Could not save shortlist profile:', err));
  };

  const runProfileShortlist = (knownUserId) => {
    const profile = { ...formData };
    persistProfile(profile, knownUserId);
    updateProfileStatus('saved');
    setFilters(EMPTY_FILTERS);
    setActiveCategoryTab('all');
    fetchShortlist(1, false, activeSearch, 'all', true, { profile, filters: EMPTY_FILTERS });
  };

  const handleShortlistSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.streamMajor || !formData.targetCountry) {
      showToast('Please choose your field of study and target destination.');
      return;
    }
    if (!currentUser && !token) {
      if (openLoginModal) {
        openLoginModal({
          title: 'Unlock Your University Matches',
          subtitle: 'Sign in free with Google or email to view personalized Safe, Target & Dream universities',
          preventRedirect: true,
          onSuccess: () => runProfileShortlist(null)
        });
        return;
      }
    }
    runProfileShortlist(userId);
  };

  // Step 1 always comes first. A signed-in student who filled it before (on this device or another)
  // finds their details pre-filled and only has to confirm them to see their matches.
  useEffect(() => {
    if (authLoading && !propUser) return undefined;

    if (!isSignedIn) {
      pendingProfileRef.current = null;
      updateProfileStatus('none');
      setStep(1);
      setResults(null);
      setAllUniversities([]);
      return undefined;
    }

    // Step 1 was just submitted through the login modal: that profile belongs to this account now
    if (pendingProfileRef.current) {
      writeLocalProfile(userId, pendingProfileRef.current);
      pendingProfileRef.current = null;
      return undefined;
    }
    if (profileStatusRef.current === 'saved') return undefined;

    let cancelled = false;
    const countryParam = searchParams.get('country');

    const applySavedProfile = (saved) => {
      const profile = { ...formData, ...pickProfile(saved) };
      if (countryParam && countryParam !== 'All') profile.targetCountry = countryParam;
      setFormData(profile);
      setFilters(EMPTY_FILTERS);
      updateProfileStatus('saved');
      setStep(1);
    };

    updateProfileStatus('checking');
    const local = readLocalProfile(userId);
    if (local) {
      applySavedProfile(local);
      return undefined;
    }

    fetch(`${API_URL}/shortlist/profile`, {
      headers: token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (cancelled || profileStatusRef.current === 'saved') return;
        if (data && data.profile) {
          writeLocalProfile(userId, data.profile);
          applySavedProfile(data.profile);
        } else {
          updateProfileStatus('none');
          setStep(1);
        }
      })
      .catch(() => {
        if (cancelled || profileStatusRef.current === 'saved') return;
        updateProfileStatus('none');
        setStep(1);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isSignedIn, userId]);

  const handleCategoryTabChange = (newCat) => {
    setActiveCategoryTab(newCat);
    if (newCat === 'saved') return;
    fetchShortlist(1, false, activeSearch, newCat);
  };

  const loadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchShortlist(pagination.page + 1, true, activeSearch, activeCategoryTab);
    }
  };

  const isMatchingUni = (u, target) => {
    if (!u || !target) return false;
    const targetId = target._id || target.id;
    const targetName = (target.name || '').trim().toLowerCase();
    if (targetId) {
      const tId = String(targetId);
      if (u._id && String(u._id) === tId) return true;
      if (u.id && String(u.id) === tId) return true;
      if (u.universityId && String(u.universityId) === tId) return true;
    }
    if (targetName && u.name && u.name.trim().toLowerCase() === targetName) return true;
    return false;
  };

  const toggleSaveUni = async (uni) => {
    if (!currentUser && !token && openLoginModal) {
      openLoginModal({
        title: 'Save to Your Shortlist',
        subtitle: 'Sign in free with Google or email to save universities to your profile',
        preventRedirect: true,
        onSuccess: () => {
          // This closure still sees the logged-out user/token; save directly with the new session
          saveUniAfterLogin(uni);
        }
      });
      return;
    }

    return persistUniToggle(uni, { isAuthenticated: Boolean(token), currentSaved: savedUnis });
  };

  // Runs right after the login modal succeeds. The server endpoint is a toggle, so first load the
  // account's real saved list: if the university is already there, don't toggle it off.
  const saveUniAfterLogin = async (uni) => {
    let serverSaved = null;
    try {
      const res = await fetch(`${API_URL}/saved-universities`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.savedUniversities)) {
        serverSaved = data.savedUniversities;
        setSavedUnis(serverSaved);
      }
    } catch (err) {
      console.warn('Failed to load saved universities after login:', err);
    }

    const currentSaved = serverSaved || savedUnis;
    if (currentSaved.some(u => isMatchingUni(u, uni))) {
      showToast(`${uni.name} is already in your shortlist`);
      return;
    }
    return persistUniToggle(uni, { isAuthenticated: true, currentSaved });
  };

  const persistUniToggle = async (uni, { isAuthenticated, currentSaved }) => {
    const isAlreadySaved = currentSaved.some(u => isMatchingUni(u, uni));

    if (isAuthenticated) {
      try {
        // Requirements / acceptance rate only when official (null otherwise, never a default)
        const req = getOfficialRequirements(uni);
        const payload = {
          universityId: uni._id,
          name: uni.name,
          countryName: uni.countryName || uni.country || 'International',
          city: uni.city || '',
          logo: uni.logo || '',
          rank: getVerifiedRanking(uni)?.fullLabel || '',
          tuition: uni.tuition || '',
          tuitionFeeUSD: uni.tuitionFeeUSD || 0,
          minGpaPercent: req.gpaPercent,
          minIeltsScore: req.ielts,
          acceptanceRate: req.acceptanceRate,
          categoryTag: uni.categoryTag || (uni.matchScore >= 80 ? 'safe' : uni.matchScore >= 62 ? 'target' : 'dream'),
          matchScore: uni.matchScore || 80,
          website: uni.website || '',
          eligibility: req.eligibilityText || ''
        };

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/saved-universities/toggle`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.saved) {
            setSavedUnis(prev => [data.savedUniversity, ...prev.filter(u => !isMatchingUni(u, uni))]);
            showToast(`Saved ${uni.name} to your shortlist!`);
            window.dispatchEvent(new CustomEvent('savedUnisUpdated'));
          } else {
            setSavedUnis(prev => prev.filter(u => 
              u.name !== uni.name && u._id !== uni._id && u._id !== data.removedId
            ));
            showToast(`Removed ${uni.name} from shortlist`);
            window.dispatchEvent(new CustomEvent('savedUnisUpdated'));
          }
          return;
        }
      } catch (err) {
        console.error('Backend save error, using client fallback:', err);
      }
    }

    // Guest fallback
    if (isAlreadySaved) {
      const updated = currentSaved.filter(u => u._id !== uni._id && u.name !== uni.name);
      setSavedUnis(updated);
      localStorage.setItem('unicoach_saved_unis', JSON.stringify(updated));
      showToast(`Removed ${uni.name} from shortlist`);
    } else {
      const updated = [...currentSaved, uni];
      setSavedUnis(updated);
      localStorage.setItem('unicoach_saved_unis', JSON.stringify(updated));
      showToast(`Saved ${uni.name} to shortlist!`);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleExportUniversities = (exportAll = false) => {
    let listToExport = [];
    let filterLabel = activeCategoryTab;

    if (exportAll) {
      listToExport = allUniversities && allUniversities.length > 0 ? allUniversities : fallbackUniversities;
      filterLabel = 'All_Evaluated';
    } else if (activeCategoryTab === 'saved') {
      listToExport = savedUnis;
      filterLabel = 'My_Saved_Shortlist';
    } else if (activeCategoryTab === 'safe') {
      listToExport = results?.safe && results.safe.length > 0 ? results.safe : allUniversities.filter(u => u.categoryTag === 'safe');
      filterLabel = 'Safe_Backup_Matches';
    } else if (activeCategoryTab === 'target') {
      listToExport = results?.target && results.target.length > 0 ? results.target : allUniversities.filter(u => u.categoryTag === 'target');
      filterLabel = 'Target_Ideal_Matches';
    } else if (activeCategoryTab === 'dream') {
      listToExport = results?.dream && results.dream.length > 0 ? results.dream : allUniversities.filter(u => u.categoryTag === 'dream');
      filterLabel = 'Dream_Reach_Matches';
    } else {
      listToExport = displayedings && displayedings.length > 0 ? displayedings : fallbackUniversities;
      filterLabel = 'All_Filtered';
    }

    if (!listToExport || listToExport.length === 0) {
      showToast('No universities available to export in this category.');
      return;
    }

    setExportModalConfig({
      isOpen: true,
      type: 'universities',
      filterLabel,
      items: listToExport,
      availableColumns: DEFAULT_UNIVERSITY_COLUMNS
    });
  };

  const handleConfirmColumnExport = (selectedKeys) => {
    if (!exportModalConfig) return;

    if (exportModalConfig.type === 'programs') {
      const filename = `UniCoach_Selected_Programs_${new Date().toISOString().slice(0, 10)}.xlsx`;
      exportSelectedProgramsToExcel(exportModalConfig.items, {
        filename,
        sheetName: 'Selected Programs',
        studentProfile: formData,
        selectedColumnKeys: selectedKeys
      });
      showToast(`Downloaded ${exportModalConfig.items.length} programs (${selectedKeys.length} columns) in Excel! 📊`);
    } else {
      const filterLabel = exportModalConfig.filterLabel || 'Universities';
      const filename = `UniCoach_Universities_${filterLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      exportUniversitiesToExcel(exportModalConfig.items, {
        filename,
        sheetName: 'Universities',
        studentProfile: formData,
        categoryFilter: filterLabel,
        selectedColumnKeys: selectedKeys
      });
      showToast(`Downloaded ${exportModalConfig.items.length} universities (${selectedKeys.length} columns) in Excel! 📊`);
    }
    setExportModalConfig(null);
  };

  const displayedings = activeCategoryTab === 'saved' ? savedUnis : allUniversities;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 z-[9999] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs md:text-sm font-bold border border-slate-800 max-w-md"
          >
            <CheckCircle2 className="text-emerald-400" size={18} />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global AI Evaluation Loading Modal (Uses createPortal to document.body for 100% full-screen coverage) */}
      {loading && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-5"
          >
            <div className="w-16 h-16 bg-[#DE5C2B] rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-orange-500/20">
              <Sparkles size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Evaluating Universities...</h3>
              <p className="text-xs text-slate-500 font-medium">Matching your profile & scores against global admission cutoffs...</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <motion.div 
                initial={{ width: "15%" }}
                animate={{ width: "95%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="bg-[#DE5C2B] h-full rounded-full"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#DE5C2B]">
              <RefreshCw size={12} className="animate-spin" />
              <span>Categorizing Safe, Target & Dream Fit...</span>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

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
          <SlidersHorizontal size={16} /> 1. Enter Your Profile Details
        </button>

        <button
          onClick={() => {
            // Matches only make sense for a known profile: step 1 has to be submitted first
            if (profileStatus !== 'saved') {
              if (profileStatus === 'none') {
                setStep(1);
                showToast('Fill in your profile details first, then tap "Shortlist Universities Now".');
              }
              return;
            }
            if (results) setStep(2);
            else fetchShortlist(1, false, activeSearch, activeCategoryTab, true);
          }}
          aria-disabled={profileStatus !== 'saved'}
          className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            step === 2
              ? 'bg-[#DE5C2B] text-white shadow-md shadow-orange-500/20'
              : profileStatus === 'saved'
              ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              : 'text-slate-400 cursor-not-allowed'
          }`}
        >
          <Compass size={16} /> 2. View Shortlisted Universities
        </button>
      </div>

      {/* Looking up a signed-in student's saved profile */}
      {profileStatus === 'checking' && (
        <div className="bg-white border border-slate-200/90 rounded-[32px] p-10 flex flex-col items-center justify-center gap-3 text-center min-h-[260px]">
          <RefreshCw size={22} className="animate-spin text-[#DE5C2B]" />
          <p className="text-sm font-semibold text-slate-600">Loading your profile…</p>
        </div>
      )}

      {/* STEP 1: STUDENT PROFILE WIZARD FORM */}
      {profileStatus !== 'checking' && step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200/90 p-6 md:p-10 rounded-[32px] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] space-y-8"
        >
          {/* Form Header with Visual Contrast */}
          <div className="bg-gradient-to-r from-blue-50/80 via-slate-50/60 to-transparent p-4 sm:p-5 rounded-2xl border border-orange-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2">
                <GraduationCap className="text-[#DE5C2B]" size={22} />
                Student Academic & Target Profile Inputs
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Please provide your score details so we can accurately match against university eligibility criteria.
              </p>
            </div>
            <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100/80 text-[#DE5C2B] border border-orange-200/60 whitespace-nowrap">
              Step 1 of 2
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Highest Education */}
            <div className="relative">
              <PremiumDropdown
                label="Current Education Level"
                labelIcon={<GraduationCap size={15} className="text-indigo-500" />}
                value={formData.educationLevel}
                onChange={(val) => handleInputChange('educationLevel', val)}
                accent="indigo"
                options={[
                  { value: '12th', label: '12th Standard / High School', icon: '🏫', description: 'Applying for undergraduate' },
                  { value: "Bachelor's", label: "Bachelor's Degree", icon: '🎓', description: 'Most common for Masters applicants' },
                  { value: "Master's", label: "Master's Degree", icon: '📜', description: 'Applying for PhD or second Masters' },
                  { value: 'Diploma', label: 'Diploma / Associate Degree', icon: '📋', description: '2-3 year diploma holders' },
                ]}
              />
            </div>

            {/* Academic Percentage / GPA */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Award size={15} className="text-indigo-500" /> Academic Score (% or GPA)
              </label>
              <NumberStepperInput
                value={formData.gpaPercent}
                onChange={(v) => handleInputChange('gpaPercent', v)}
                min={40}
                max={100}
                step={1}
                suffix="%"
                placeholder="e.g. 75"
                ariaLabel="Academic score percentage"
              />
            </div>

            {/* Stream / Major */}
            <div className="relative">
              <PremiumDropdown
                label="Major / Field of Study"
                labelIcon={<BookOpen size={15} className="text-indigo-500" />}
                value={formData.streamMajor}
                onChange={(val) => handleInputChange('streamMajor', val)}
                accent="indigo"
                searchable={true}
                creatable={true}
                defaultIcon={<BookOpen size={16} className="text-indigo-500" />}
                searchPlaceholder="Search or type custom course..."
                placeholder="Select or enter your course..."
                options={POPULAR_COURSES}
              />
            </div>

            {/* Target Country */}
            <div className="relative">
              <PremiumDropdown
                label="Target Destination"
                labelIcon={<Globe size={15} className="text-indigo-500" />}
                value={formData.targetCountry}
                onChange={(val) => handleInputChange('targetCountry', val)}
                accent="indigo"
                searchable={true}
                searchPlaceholder="Search 160+ countries (e.g. USA, Canada, Germany)..."
                placeholder="Select destination..."
                options={ALL_COUNTRY_OPTIONS}
              />
            </div>

            {/* Max Budget Limit */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <DollarSign size={15} className="text-indigo-500" /> Max Annual Budget ($ USD)
              </label>
              <NumberStepperInput
                value={formData.maxBudgetUSD}
                onChange={(v) => handleInputChange('maxBudgetUSD', v)}
                min={5000}
                max={80000}
                step={5000}
                suffix={`≈ ₹${Math.round(((Number(formData.maxBudgetUSD) || 0) * 85) / 100000)} Lakh/yr`}
                ariaLabel="Maximum annual budget in US dollars"
              />
            </div>

            {/* IELTS Score */}
            <div className="relative">
              <PremiumDropdown
                label="IELTS / TOEFL Score"
                labelIcon={<BookOpen size={15} className="text-indigo-500" />}
                value={formData.ieltsScore}
                onChange={(val) => handleInputChange('ieltsScore', val)}
                accent="indigo"
                options={[
                  { value: '0', label: 'Not Taken Yet / English Waiver', shortLabel: 'Not Taken / Waiver', icon: '🎯', description: 'Planning to appear or seeking MOI English waiver' },
                  { value: '5.5', label: '5.5 Band (Conditional)', shortLabel: '5.5 Band', icon: '⚠️', description: 'May need pre-sessional English' },
                  { value: '6.0', label: '6.0 Band (Moderate)', shortLabel: '6.0 Band', icon: '📝', description: 'Entry for select programmes' },
                  { value: '6.5', label: '6.5 Band (Standard Cutoff)', shortLabel: '6.5 Band', icon: '📊', description: 'Meets most requirements' },
                  { value: '7.0', label: '7.0 Band (Strong Score)', shortLabel: '7.0 Band', icon: '✅', description: 'Meets 95% university cutoffs' },
                  { value: '7.5', label: '7.5+ Band (High Proficiency)', shortLabel: '7.5+ Band', icon: '🏆', description: 'Top tier — all doors open' },
                ]}
              />
            </div>

            {/* GRE Score */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Award size={15} className="text-indigo-500" /> GRE Score (0 if waived)
              </label>
              <NumberStepperInput
                value={formData.greScore}
                onChange={(v) => handleInputChange('greScore', v)}
                min={0}
                max={340}
                step={5}
                placeholder="0 (or e.g. 310)"
                ariaLabel="GRE score"
              />
            </div>

            {/* Work Experience */}
            <div className="relative">
              <PremiumDropdown
                label="Work Experience (Years)"
                labelIcon={<Briefcase size={15} className="text-indigo-500" />}
                value={formData.workExpYears}
                onChange={(val) => handleInputChange('workExpYears', val)}
                accent="indigo"
                options={[
                  { value: '0', label: 'Fresh Graduate (0 years)', icon: '🎒', description: 'Just completed degree' },
                  { value: '1', label: '1 Year Experience', icon: '💼', description: 'Entry-level professional' },
                  { value: '2', label: '2-3 Years Experience', icon: '📈', description: 'Mid-level professional' },
                  { value: '4', label: '4+ Years Experience', icon: '🏅', description: 'Senior professional / MBA ready' },
                ]}
              />
            </div>

            {/* Target Intake */}
            <div className="relative">
              <PremiumDropdown
                label="Preferred Intake"
                labelIcon={<Calendar size={15} className="text-indigo-500" />}
                value={formData.intake}
                onChange={(val) => handleInputChange('intake', val)}
                accent="indigo"
                options={[
                  { value: 'Fall 2026', label: 'Fall 2026 (Sep 2026)', icon: '🍂', description: 'Primary intake season' },
                  { value: 'Spring 2027', label: 'Spring 2027 (Jan 2027)', icon: '🌸', description: 'Secondary intake season' },
                  { value: 'Fall 2027', label: 'Fall 2027 (Sep 2027)', icon: '🍁', description: 'Next year primary intake' },
                ]}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs font-semibold text-slate-500">
              {!currentUser && !token ? (
                <span className="inline-flex items-center gap-1.5 text-[#DE5C2B] font-bold bg-orange-50 px-3.5 py-1.5 rounded-xl border border-orange-200">
                  <Sparkles size={14} className="text-[#DE5C2B]" /> 100% free · Sign in with Google or email to unlock your matches
                </span>
              ) : (
                <span className="text-slate-500">
                  We save these details to your account, so next time they&apos;re already filled in.
                </span>
              )}
            </div>

            <button
              onClick={handleShortlistSubmit}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D] hover:from-[#C04A1D] hover:to-[#A73D14] text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Evaluating Universities...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Shortlist Universities Now <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Saved profile found, first results still loading */}
      {profileStatus !== 'checking' && step === 2 && !results && (
        <div className="bg-white border border-slate-200/90 rounded-[32px] p-10 flex flex-col items-center justify-center gap-3 text-center min-h-[260px]">
          <RefreshCw size={22} className="animate-spin text-[#DE5C2B]" />
          <p className="text-sm font-semibold text-slate-600">Finding universities that match your profile…</p>
        </div>
      )}

      {/* STEP 2: SHORTLIST RESULTS DASHBOARD */}
      {profileStatus !== 'checking' && step === 2 && results && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Badges Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            <button
              onClick={() => handleCategoryTabChange('all')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeCategoryTab === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-wider ${activeCategoryTab === 'all' ? 'text-indigo-200' : 'text-slate-400'}`}>Top Shortlist</p>
              <p className="text-xl md:text-2xl font-black mt-1">{summary.totalEvaluated} Unis</p>
            </button>

            <button
              onClick={() => handleCategoryTabChange('safe')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeCategoryTab === 'safe'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
                  : 'bg-emerald-50/50 text-emerald-900 border-emerald-200/70 hover:bg-emerald-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-black uppercase tracking-wider ${activeCategoryTab === 'safe' ? 'text-emerald-100' : 'text-emerald-700'}`}>🛡️ Safe / Backup</p>
                <ShieldCheck size={16} className={activeCategoryTab === 'safe' ? 'text-emerald-200' : 'text-emerald-600'} />
              </div>
              <p className="text-xl md:text-2xl font-black mt-1">{summary.safeCount} Unis</p>
            </button>

            <button
              onClick={() => handleCategoryTabChange('target')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeCategoryTab === 'target'
                  ? 'bg-[#DE5C2B] text-white border-blue-600 shadow-md shadow-blue-100'
                  : 'bg-orange-50/50 text-blue-900 border-orange-200/70 hover:bg-orange-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-black uppercase tracking-wider ${activeCategoryTab === 'target' ? 'text-blue-100' : 'text-[#C04A1D]'}`}>⚖️ Target / Ideal Match</p>
                <Compass size={16} className={activeCategoryTab === 'target' ? 'text-orange-200' : 'text-[#DE5C2B]'} />
              </div>
              <p className="text-xl md:text-2xl font-black mt-1">{summary.targetCount} Unis</p>
            </button>

            <button
              onClick={() => handleCategoryTabChange('dream')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                activeCategoryTab === 'dream'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100'
                  : 'bg-purple-50/50 text-purple-900 border-purple-200/70 hover:bg-purple-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-black uppercase tracking-wider ${activeCategoryTab === 'dream' ? 'text-purple-100' : 'text-purple-700'}`}>🎯 Dream / Reach</p>
                <Target size={16} className={activeCategoryTab === 'dream' ? 'text-purple-200' : 'text-purple-600'} />
              </div>
              <p className="text-xl md:text-2xl font-black mt-1">{summary.dreamCount} Unis</p>
            </button>

            <button
              onClick={() => handleCategoryTabChange('saved')}
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
              <p className="text-xl md:text-2xl font-black mt-1">{savedUnis.length} Saved</p>
            </button>
          </div>

          {/* Active Profile Evaluation Banner */}
          <div className="bg-gradient-to-r from-indigo-50 via-white to-blue-50 border border-indigo-100/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
              <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Target size={12} /> Evaluated Profile
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800 font-black">
                📚 {formData.streamMajor || 'General Studies'}
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800">
                <OptionIcon icon="🌐" variant="bare" size="sm" className="inline -mt-0.5 mr-1" />{formData.targetCountry || 'All Destinations'}
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-indigo-600 font-black">
                <OptionIcon icon="📊" variant="bare" size="sm" className="inline -mt-0.5 mr-1" />GPA: {formData.gpaPercent}%
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-emerald-600 font-black">
                <OptionIcon icon="🎙" variant="bare" size="sm" className="inline -mt-0.5 mr-1" />IELTS: {formData.ieltsScore} Band
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[#DE5C2B] font-black">
                💰 Budget: ${Number(formData.maxBudgetUSD || 40000).toLocaleString()}/yr
              </span>
            </div>
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <SlidersHorizontal size={13} /> Edit Profile Details
            </button>
          </div>

          {/* Curated Shortlist Context Notice */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              <span>
                Screened across <strong>3,600+ global universities</strong> based on your GPA ({formData.gpaPercent}%), IELTS ({formData.ieltsScore}) & Budget (${Number(formData.maxBudgetUSD || 35000).toLocaleString()}/yr). Showing top curated matches.
              </span>
            </span>
          </div>

          {/* CourseFinder Benchmarked Search & Advanced Filter Bar */}
          <CourseFinderFilterBar
            searchQuery={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              if (!val || val.trim() === '') {
                setActiveSearch('');
                fetchShortlist(1, false, '', activeCategoryTab, false);
              }
            }}
            onSearchSubmit={handleSearchSubmit}
            country={formData.targetCountry}
            onCountryChange={handleFilterCountryChange}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearSearch}
          />

          {/* Quick Course & Program Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="text-[11px] font-black text-slate-400 whitespace-nowrap flex items-center gap-1 pl-1">
              <Sparkles size={12} className="text-amber-500" /> Popular Programs:
            </span>
            {POPULAR_SEARCH_CHIPS.map((chip) => {
              const isCurrent = activeSearch.toLowerCase() === chip.query.toLowerCase();
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setSearchTerm(chip.query);
                    setActiveSearch(chip.query);
                    fetchShortlist(1, false, chip.query, activeCategoryTab, false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer border ${
                    isCurrent
                      ? 'bg-[#DE5C2B] text-white border-[#DE5C2B] shadow-xs'
                      : 'bg-white hover:bg-orange-50 text-slate-700 hover:text-[#C04A1D] border-slate-200'
                  }`}
                >
                  <OptionIcon icon={chip.icon} variant="bare" size="sm" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* EXCEL EXPORT & SHORTLIST DOWNLOAD ACTION BANNER */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-indigo-50/40 border border-emerald-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-200/50 shrink-0">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-black text-slate-800 flex items-center gap-2">
                  <span>Download Universities in Excel</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                    .XLSX Format
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Export university rankings, tuition fees, acceptance rates, and cutoffs to an offline spreadsheet.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => handleExportUniversities(false)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-200/60"
                title="Download top evaluated universities"
              >
                <Download size={14} />
                <span>Export Top ({displayedings.length})</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportUniversities(true)}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                title="Download all shortlisted universities in Excel"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>Export Shortlist ({summary.totalEvaluated || allUniversities.length})</span>
              </button>
            </div>
          </div>

          {/* Empty State */}
          {displayedings.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-500">
                <Search size={28} />
              </div>
              <h4 className="text-lg font-black text-slate-800">No Universities Found</h4>
              <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto font-medium">
                {activeSearch 
                  ? `No university matching "${activeSearch}" was found in our database. Try another search term or clear the filter.`
                  : activeCategoryTab === 'saved' 
                  ? "You haven't saved any universities to your shortlist yet. Click the bookmark icon on any university to save it!"
                  : "No universities match these filters. Try removing a filter or choosing another city."}
              </p>
              {(activeSearch || Object.keys(EMPTY_FILTERS).some(k => filters[k] !== EMPTY_FILTERS[k])) && activeCategoryTab !== 'saved' && (
                <button
                  onClick={handleClearSearch}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition cursor-pointer"
                >
                  Clear Filters & View All
                </button>
              )}
            </div>
          )}

          {/* CourseFinder University + Degree Programs List */}
          <div className="space-y-4">
            {displayedings.map((uni) => {
              const isSaved = savedUnis.some(u => isMatchingUni(u, uni));
              return (
                <CourseFinderCard
                  key={uni._id || uni.name}
                  uni={uni}
                  searchQuery={activeSearch}
                  selectedProgramIds={selectedPrograms.map(p => p.id)}
                  onToggleProgramSelect={handleToggleProgramSelect}
                  onSaveUni={toggleSaveUni}
                  isUniSaved={isSaved}
                  onOpenDetailsModal={(u) => setSelectedUniForModal(u)}
                  onOpenEligibilityModal={(u) => setExplainingUni(u)}
                  onOpenCourseDrawer={(drawerData) => setActiveCourseDrawer(drawerData)}
                />
              );
            })}
          </div>

          {/* Floating CourseFinder Multi-Program Comparison Bar */}
          <CourseFinderComparisonBar
            selectedPrograms={selectedPrograms}
            onClearSelection={handleClearSelection}
            onSaveSelectedToShortlist={handleSaveSelectedToShortlist}
            onExportExcel={handleExportSelectedPrograms}
          />

          {/* See More Button */}
          {activeCategoryTab === 'all' && pagination.hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                {loadingMore ? (
                  <><RefreshCw size={18} className="animate-spin" /> Loading...</>
                ) : (
                  <><Compass size={18} /> See More</>
                )}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Interactive University Details Portal Modal */}
      {selectedUniForModal && (
        <UniversityDetailsModal
          university={selectedUniForModal}
          isOpen={!!selectedUniForModal}
          onClose={() => setSelectedUniForModal(null)}
          onToggleSave={toggleSaveUni}
          isSaved={savedUnis.some(u => (u._id && u._id === selectedUniForModal._id) || u.name === selectedUniForModal.name)}
        />
      )}

      {/* AI University Match Explainer Modal */}
      <UniversityAiExplainerModal
        isOpen={!!explainingUni}
        onClose={() => setExplainingUni(null)}
        university={explainingUni}
        studentProfile={formData}
      />

      {/* Slide-over Course and Alumni Mentors Drawer */}
      <CourseAndMentorDrawer
        isOpen={!!activeCourseDrawer}
        onClose={() => setActiveCourseDrawer(null)}
        data={activeCourseDrawer}
        onOpenDmModal={(data) => {
          setDmModalData(data);
          setIsDmModalOpen(true);
        }}
        onSaveUni={toggleSaveUni}
        isUniSaved={activeCourseDrawer?.university ? savedUnis.some(u => isMatchingUni(u, activeCourseDrawer.university)) : false}
      />

      {/* Priority DM / Consultation Modal for Booking Calls */}
      <PriorityDmModal
        isOpen={isDmModalOpen}
        onClose={() => setIsDmModalOpen(false)}
        initialCategory={dmModalData?.category || '1:1 Mentor Guidance'}
        initialMessage={dmModalData?.prefilledMessage || ''}
      />

      {/* Custom Column Selection Export Modal */}
      <ExcelColumnExportModal
        isOpen={!!exportModalConfig?.isOpen}
        onClose={() => setExportModalConfig(null)}
        onConfirmExport={handleConfirmColumnExport}
        exportType={exportModalConfig?.type || 'programs'}
        itemsCount={exportModalConfig?.items?.length || 0}
        availableColumns={exportModalConfig?.availableColumns || []}
      />
    </div>
  );
};

export default UniversityShortlister;
