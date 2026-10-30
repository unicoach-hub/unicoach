import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Sparkles, Award, ShieldCheck, Target, 
  Compass, CheckCircle2, AlertCircle, ArrowRight, Download, 
  Calendar, DollarSign, Globe, BookOpen, 
  HelpCircle, ExternalLink, RefreshCw, FileText, PhoneCall,
  ChevronRight, BookmarkCheck, SlidersHorizontal, ArrowLeft,
  Check, AlertTriangle, Printer, Eye, X
} from 'lucide-react';
import ALL_UNIVERSITIES from '../data/universities';
import PremiumDropdown from '../components/PremiumDropdown';
import UniversityLogo from '../components/UniversityLogo';
import UniversityAiExplainerModal from '../components/UniversityAiExplainerModal';
import ScholarshipAiExplainerModal from '../components/ScholarshipAiExplainerModal';
import brandLogo from '@/assets/blackunicoachlogo.webp';
import { useLead } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { cleanPortalUrl } from '../utils/urlHelpers';
import { getVerifiedRanking } from '../utils/ranking';
import { getOfficialRequirements } from '../utils/requirements';
import { POPULAR_COURSES, ALL_COUNTRY_OPTIONS } from '../utils/shortlistOptions';
import { API_BASE_URL } from '../config';
import { FinderPage, FinderHero, FinderCard, FinderButton, FinderChip, FIELD_RADIUS } from '../components/ui/FinderForm';

const API_URL = API_BASE_URL;

const COUNTRY_CURRENCIES = {
  USA: { currency: '$', rateToInr: 87, avgTuition: 35000 },
  UK: { currency: '£', rateToInr: 110, avgTuition: 22000 },
  Canada: { currency: 'CAD $', rateToInr: 63, avgTuition: 28000 },
  Germany: { currency: '€', rateToInr: 94, avgTuition: 3000 },
  Australia: { currency: 'AUD $', rateToInr: 56, avgTuition: 36000 },
  Ireland: { currency: '€', rateToInr: 94, avgTuition: 18000 },
  France: { currency: '€', rateToInr: 94, avgTuition: 12000 },
  Italy: { currency: '€', rateToInr: 94, avgTuition: 8000 },
  Singapore: { currency: 'SGD $', rateToInr: 65, avgTuition: 32000 },
  Netherlands: { currency: '€', rateToInr: 94, avgTuition: 16000 },
  Switzerland: { currency: 'CHF', rateToInr: 98, avgTuition: 28000 },
  'New Zealand': { currency: 'NZD $', rateToInr: 52, avgTuition: 30000 },
  'United Arab Emirates': { currency: 'AED', rateToInr: 23, avgTuition: 25000 },
  Spain: { currency: '€', rateToInr: 94, avgTuition: 14000 },
  Sweden: { currency: 'SEK', rateToInr: 8.5, avgTuition: 140000 },
  Japan: { currency: '¥', rateToInr: 0.58, avgTuition: 820000 },
  'South Korea': { currency: '₩', rateToInr: 0.063, avgTuition: 6500000 },
};

const DEFAULT_CURRENCY = { currency: '$ USD', rateToInr: 87, avgTuition: 25000 };

// One-tap presets for the most common student profiles (budget in ₹ lakh / year)
const QUICK_STARTS = [
  { label: "Master's in USA", flag: '🇺🇸', level: "Bachelor's Degree", degree: "Master's", country: 'USA', major: 'Computer Science', budget: 30 },
  { label: "Master's in UK", flag: '🇬🇧', level: "Bachelor's Degree", degree: "Master's", country: 'UK', major: 'Data Science', budget: 25 },
  { label: 'MBA in UK', flag: '🇬🇧', level: "Bachelor's Degree", degree: 'MBA', country: 'UK', major: 'Business Administration', budget: 30 },
  { label: 'Bachelor\'s in Canada', flag: '🇨🇦', level: '12th Grade / High School', degree: "Bachelor's", country: 'Canada', major: 'Business Administration', budget: 20 },
  { label: "Low-cost Master's in Germany", flag: '🇩🇪', level: "Bachelor's Degree", degree: "Master's", country: 'Germany', major: 'Mechanical Engineering', budget: 12 },
  { label: "Master's in Australia", flag: '🇦🇺', level: "Bachelor's Degree", degree: "Master's", country: 'Australia', major: 'Information Technology', budget: 30 },
  { label: "Master's in Ireland", flag: '🇮🇪', level: "Bachelor's Degree", degree: "Master's", country: 'Ireland', major: 'Business Analytics', budget: 22 },
  { label: 'Budget under ₹12L', flag: '💰', level: "Bachelor's Degree", degree: "Master's", country: 'Germany', major: 'Computer Science', budget: 12 },
];

const SCHOLARSHIP_TIERS = [
  {
    minScore: 55,
    maxScore: 65,
    title: 'Standard Entry Tier',
    label: 'Merit awards are less common at this score',
    pctMin: 0, pctMax: 10,
    percentWaiver: 'Up to 10% off tuition',
    color: 'slate',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-800'
  },
  {
    minScore: 65,
    maxScore: 75,
    title: 'Global Merit Tier',
    label: 'Department merit awards',
    pctMin: 10, pctMax: 25,
    percentWaiver: '10% - 25% off tuition',
    color: 'blue',
    bg: 'bg-orange-50',
    border: 'border-blue-300',
    text: 'text-blue-800'
  },
  {
    minScore: 75,
    maxScore: 85,
    title: 'Global Excellence Tier',
    label: 'Higher merit and faculty scholarships',
    pctMin: 20, pctMax: 40,
    percentWaiver: '20% - 40% off tuition',
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    text: 'text-indigo-800'
  },
  {
    minScore: 85,
    maxScore: 100,
    title: 'Top Merit Tier',
    label: 'Top merit awards; full funding is rare and competitive',
    pctMin: 30, pctMax: 50,
    percentWaiver: '30% - 50% off tuition',
    color: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800'
  }
];

const EligibilityCalculatorPage = () => {
  // Inside the student dashboard the page sits in a narrow column, so the side sign would cover the title
  const { openModal } = useLead();
  const { user, token, openLoginModal } = useAuth();
  const resultsRef = useRef(null);

  // Form State
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree"); // "12th Grade", "Bachelor's Degree", "Master's Degree"
  const [scoreType, setScoreType] = useState('percentage'); // 'percentage' or 'cgpa'
  const [percentage, setPercentage] = useState(76);
  const [cgpa, setCgpa] = useState(7.8);
  const [targetCountry, setTargetCountry] = useState('USA');
  const [targetDegree, setTargetDegree] = useState("Master's");
  const [targetMajor, setTargetMajor] = useState('Computer Science');
  const [ieltsScore, setIeltsScore] = useState(6.5);
  const [annualBudgetInr, setAnnualBudgetInr] = useState(25); // In Lakhs INR
  const [strictBudgetFilter, setStrictBudgetFilter] = useState(false);
  
  // Execution & UI State
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0);
  const [activeResultTab, setActiveResultTab] = useState('safe'); // 'safe', 'target', 'dream', 'scholarships'
  const [savedUniIds, setSavedUniIds] = useState(new Set());

  // AI Modal States
  const [explainingUni, setExplainingUni] = useState(null);
  const [explainingScholarship, setExplainingScholarship] = useState(null);
  const [allScholarships, setAllScholarships] = useState([]);

  // Auto-sync target degree when education level changes
  const handleEducationChange = (lvl) => {
    setEducationLevel(lvl);
    if (lvl === '12th Grade / High School') {
      setTargetDegree("Bachelor's");
    } else if (lvl === "Bachelor's Degree") {
      setTargetDegree("Master's");
    } else if (lvl === "Master's Degree") {
      setTargetDegree("MBA");
    }
  };

  // Dynamic contextual score label based on education level
  const scoreCardMeta = useMemo(() => {
    if (educationLevel === '12th Grade / High School') {
      return {
        badge: '12TH STANDARD SCORE',
        title: '12th Board Exam Aggregate Score *',
        subtitle: 'Enter your Class 12th Board aggregate % (CBSE / ICSE / State Board best 4/5 subjects) for Bachelor degree cutoffs.'
      };
    } else if (educationLevel === "Master's Degree") {
      return {
        badge: 'POST-GRADUATION SCORE',
        title: "Master's / Post-Grad Degree Score *",
        subtitle: "Enter your Master's degree aggregate % or CGPA (M.Tech / M.Sc / MBA / MA) for PhD or executive cutoffs."
      };
    }
    return {
      badge: 'UNDERGRADUATE / GRADUATION SCORE',
      title: "Bachelor's / Graduation Aggregate Score *",
      subtitle: 'Enter your College/Degree aggregate percentage or CGPA (B.Tech / B.Sc / B.Com / BBA / BA) for Master/MBA cutoffs.'
    };
  }, [educationLevel]);

  // Calculate normalized percentage (0-100)
  const normalizedPercentage = useMemo(() => {
    if (scoreType === 'cgpa') {
      return Math.min(100, Math.max(0, Math.round(cgpa * 9.5 * 10) / 10));
    }
    return Math.min(100, Math.max(0, parseFloat(percentage) || 70));
  }, [scoreType, percentage, cgpa]);

  // Fetch Scholarships from backend or use fallback
  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const res = await fetch(`${API_URL}/scholarships?limit=200`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllScholarships(data);
        } else if (data.scholarships && Array.isArray(data.scholarships)) {
          setAllScholarships(data.scholarships);
        }
      } catch (e) {
        console.warn('Could not fetch scholarships API, using defaults');
      }
    };
    fetchScholarships();
  }, []);

  const countryMeta = useMemo(() => {
    const selectedOpt = ALL_COUNTRY_OPTIONS.find(c => 
      c.value.toLowerCase() === targetCountry.toLowerCase() || 
      (c.aliases && c.aliases.includes(targetCountry.toLowerCase()))
    );
    const curMeta = COUNTRY_CURRENCIES[targetCountry] || DEFAULT_CURRENCY;
    return {
      value: targetCountry,
      label: selectedOpt?.label || targetCountry,
      flag: selectedOpt?.icon,
      ...curMeta
    };
  }, [targetCountry]);

  // Converted Annual Budget in Target Country's Currency
  const budgetInNativeCurrency = useMemo(() => {
    const inrTotal = annualBudgetInr * 100000;
    const nativeVal = Math.round(inrTotal / countryMeta.rateToInr);
    return `${countryMeta.currency}${nativeVal.toLocaleString()}`;
  }, [annualBudgetInr, countryMeta]);

  // Determine current scholarship tier
  const currentTier = useMemo(() => {
    return SCHOLARSHIP_TIERS.find(t => normalizedPercentage >= t.minScore && normalizedPercentage < t.maxScore) 
      || (normalizedPercentage >= 85 ? SCHOLARSHIP_TIERS[3] : SCHOLARSHIP_TIERS[0]);
  }, [normalizedPercentage]);

  // Estimated scholarship range: same tier as the scale, in the destination's own currency
  const potentialGrant = useMemo(() => {
    const t = currentTier;
    const minLocal = Math.round(countryMeta.avgTuition * t.pctMin / 100);
    const maxLocal = Math.round(countryMeta.avgTuition * t.pctMax / 100);
    const lakh = (v) => Math.round((v * countryMeta.rateToInr) / 100000 * 10) / 10;
    if (targetCountry === 'Germany') {
      return { minUsd: 0, maxUsd: 0, minInrLakh: 0, maxInrLakh: 0, lowTuition: true,
        waiverPct: 'Low or no tuition', formattedUsd: 'Low or no tuition', formattedInr: 'public universities' };
    }
    return {
      minUsd: minLocal,
      maxUsd: maxLocal,
      minInrLakh: lakh(minLocal),
      maxInrLakh: lakh(maxLocal),
      waiverPct: t.percentWaiver,
      formattedUsd: `${countryMeta.currency}${minLocal.toLocaleString()} – ${countryMeta.currency}${maxLocal.toLocaleString()}`,
      formattedInr: `₹${lakh(minLocal)}L – ₹${lakh(maxLocal)} Lakh`
    };
  }, [currentTier, countryMeta, targetCountry]);

  // Evaluate Universities into Safe / Target / Dream with Financial Affordability Modeling
  const evaluatedUniversities = useMemo(() => {
    const unisForCountry = ALL_UNIVERSITIES.filter(u => {
      if (!u.country) return false;
      const c = (u.countryName || u.country || '').toLowerCase();
      const target = targetCountry.toLowerCase();
      if (target === 'usa' || target.includes('united states') || target === 'us' || target.includes('america')) {
        return c.includes('usa') || c.includes('united states') || c === 'us';
      }
      if (target === 'uk' || target.includes('united kingdom') || target === 'gb' || target.includes('england') || target.includes('britain')) {
        return c.includes('uk') || c.includes('united kingdom') || c === 'gb';
      }
      return c.includes(target) || target.includes(c);
    });

    const safe = [];
    const target = [];
    const dream = [];

    const unisToUse = unisForCountry.length > 0 ? unisForCountry : ALL_UNIVERSITIES.slice(0, 20);

    unisToUse.forEach(uni => {
      // No published cut-off: estimate from the QS rank (unranked counts as the lowest band)
      const rankNum = uni.rankingNum || Infinity;
      const minGpa = parseFloat(uni.minGpaPercent) || (rankNum < 50 ? 82 : rankNum < 150 ? 72 : 62);
      const minIelts = parseFloat(uni.minIeltsScore) || 6.0;

      // Score comparison
      const scoreDiff = normalizedPercentage - minGpa;
      const ieltsDiff = ieltsScore - minIelts;

      // Approximate Base Annual Tuition in Local Currency & INR
      let baseTuitionLocal = countryMeta.avgTuition;
      if (rankNum < 30) baseTuitionLocal = Math.round(countryMeta.avgTuition * 1.35);
      else if (rankNum > 100) baseTuitionLocal = Math.round(countryMeta.avgTuition * 0.75);

      // Germany: public universities charge little or no tuition, so there is no merit discount to estimate
      const lowTuitionCountry = targetCountry === 'Germany';
      if (lowTuitionCountry) baseTuitionLocal = countryMeta.avgTuition;

      // Estimated merit discount from the same tier as the banner (a range, not a named award)
      const midPct = (currentTier.pctMin + currentTier.pctMax) / 2;
      const scholarshipDiscountLocal = lowTuitionCountry ? 0 : Math.round(baseTuitionLocal * midPct / 100);
      const uniScholarship = lowTuitionCountry
        ? 'Low or no tuition at public universities; see DAAD scholarships'
        : currentTier.pctMax <= 10
          ? 'Merit scholarships are less common at this score'
          : `Est. ${currentTier.percentWaiver} (about ${countryMeta.currency}${scholarshipDiscountLocal.toLocaleString()})`;

      const netTuitionLocal = Math.max(0, baseTuitionLocal - scholarshipDiscountLocal);
      const netTuitionInrLakh = Math.round((netTuitionLocal * countryMeta.rateToInr) / 100000 * 10) / 10;
      const baseTuitionInrLakh = Math.round((baseTuitionLocal * countryMeta.rateToInr) / 100000 * 10) / 10;

      // Budget Fit Check
      const isWithinBudget = netTuitionInrLakh <= annualBudgetInr;
      const budgetDiff = Math.round(Math.abs(annualBudgetInr - netTuitionInrLakh) * 10) / 10;

      const itemWithMeta = {
        ...uni,
        scoreDiff,
        baseTuitionLocal,
        baseTuitionInrLakh,
        netTuitionLocal,
        netTuitionInrLakh,
        isWithinBudget,
        budgetDiff,
        estimatedScholarship: uniScholarship,
        // Typical cutoffs, not official data: keep the estimate away from near-certain numbers
        acceptanceOdds: Math.min(85, Math.max(10, Math.round(50 + scoreDiff * 1.8 + ieltsDiff * 6)))
      };

      if (strictBudgetFilter && !isWithinBudget) {
        return;
      }

      if (scoreDiff >= 5 && ieltsDiff >= 0) {
        safe.push(itemWithMeta);
      } else if (scoreDiff >= -5 && ieltsDiff >= -0.5) {
        target.push(itemWithMeta);
      } else {
        dream.push(itemWithMeta);
      }
    });

    return {
      safe: safe.slice(0, 16),
      target: target.slice(0, 16),
      dream: dream.slice(0, 16)
    };
  }, [normalizedPercentage, targetCountry, ieltsScore, annualBudgetInr, strictBudgetFilter, countryMeta, currentTier]);

  // Matching Scholarships List
  const matchingScholarships = useMemo(() => {
    return allScholarships.filter(s => {
      const c = (s.country || '').toLowerCase();
      const target = targetCountry.toLowerCase();
      const countryMatches = c.includes('global') || c.includes(target) || 
        (target === 'usa' && (c.includes('usa') || c.includes('united states'))) ||
        (target === 'uk' && (c.includes('uk') || c.includes('united kingdom')));
      
      const minScoreReq = parseFloat(s.eligibility?.minGpaPercentage) || 65;
      const scoreMatches = normalizedPercentage >= minScoreReq - 8;

      return countryMatches && scoreMatches;
    }).slice(0, 12);
  }, [allScholarships, targetCountry, normalizedPercentage]);

  // Handle Calculate Trigger with dynamic loading simulation
  const handleCalculate = () => {
    if (!user && !token) {
      if (openLoginModal) {
        openLoginModal({
          title: 'Calculate Admission & Scholarship Odds',
          subtitle: 'Sign in free with Google or email to unlock your acceptance odds, scholarship grants & post-study salary ROI',
          preventRedirect: true,
          onSuccess: () => {
            triggerCalculationProcess();
          }
        });
        return;
      }
    }
    triggerCalculationProcess();
  };

  const triggerCalculationProcess = () => {
    setIsCalculating(true);
    setCalcStep(1);

    setTimeout(() => {
      setCalcStep(2);
    }, 450);

    setTimeout(() => {
      setCalcStep(3);
    }, 900);

    setTimeout(() => {
      setIsCalculating(false);
      setHasCalculated(true);
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1350);
  };

  // Bookmark / Save University
  const handleSaveUniversity = async (uni) => {
    if (!user && !token && openLoginModal) {
      openLoginModal({
        title: 'Save University to Shortlist',
        subtitle: 'Sign in free with Google or email to save colleges to your profile',
        preventRedirect: true,
        onSuccess: () => {
          // This closure still sees the logged-out user/token; save directly with the new session
          persistSaveUniversity(uni, true);
        }
      });
      return;
    }

    return persistSaveUniversity(uni, Boolean(user || token));
  };

  const persistSaveUniversity = async (uni, isAuthenticated) => {
    const uniId = uni._id || uni.name;
    const isSaved = savedUniIds.has(uniId);

    setSavedUniIds(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.delete(uniId);
      } else {
        newSet.add(uniId);
      }
      return newSet;
    });

    if (!isAuthenticated || !uni.name) return;

    // Auth = HttpOnly session cookie (sent by installApiFetch). The backend endpoint is a toggle keyed
    // by university name, so when saving, skip the call if the account already has it saved.
    try {
      if (!isSaved) {
        const listRes = await fetch(`${API_URL}/saved-universities`);
        if (listRes.ok) {
          const listData = await listRes.json();
          const alreadySaved = (listData.savedUniversities || []).some(s => s.name === String(uni.name).trim());
          if (alreadySaved) return;
        }
      }

      // Requirements / acceptance rate only when official (null otherwise, never a default)
      const req = getOfficialRequirements(uni);
      await fetch(`${API_URL}/saved-universities/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityId: uni._id || uni.id,
          name: uni.name,
          countryName: uni.countryName || uni.country || 'International',
          city: uni.city || '',
          logo: uni.logo || '',
          rank: getVerifiedRanking(uni)?.fullLabel || '',
          minGpaPercent: req.gpaPercent,
          minIeltsScore: req.ielts,
          acceptanceRate: req.acceptanceRate,
          website: uni.website || ''
        })
      });
    } catch {
      console.warn('Could not sync bookmark to backend');
    }
  };

  const [showReportPreview, setShowReportPreview] = useState(false);
  const reportId = useMemo(() => `UC-ELIG-2026-${Math.floor(1000 + Math.random() * 9000)}`, []);
  const reportDate = useMemo(() => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), []);

  // Top shortlisted universities specifically for the official 2-page print report
  const topPrintUniversities = useMemo(() => {
    const list = [
      ...(evaluatedUniversities?.target || []).map(u => ({ ...u, fitTag: 'Target Match', tagBg: '#FAE5DA', tagColor: '#86351A' })),
      ...(evaluatedUniversities?.safe || []).map(u => ({ ...u, fitTag: 'Safe Backup', tagBg: '#E1ECE3', tagColor: '#2E4836' })),
      ...(evaluatedUniversities?.dream || []).map(u => ({ ...u, fitTag: 'Dream Reach', tagBg: '#E1E7F0', tagColor: '#303C51' }))
    ];
    return list.slice(0, 8);
  }, [evaluatedUniversities]);

  const handlePrintReport = () => {
    window.print();
  };

  const renderReportContent = () => (
    <div className="text-slate-900 bg-white font-sans text-xs space-y-4">
      {/* Report Header */}
      <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
        <div className="flex items-center gap-3">
          <img 
            src={brandLogo} 
            alt="UniCoach" 
            className="h-9 w-auto object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#111111] leading-none">UNICOACH</h1>
            <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">
              Global Admissions & Scholarship Advisory Desk
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-0.5 rounded bg-orange-50 text-[#111111] font-black text-[9px] uppercase border border-orange-200 mb-1">
            Official Evaluation
          </span>
          <p className="text-slate-500 font-semibold text-[10px]">Reference: <strong className="text-slate-800">{reportId}</strong></p>
          <p className="text-slate-500 font-semibold text-[10px]">Issued On: <strong className="text-slate-800">{reportDate}</strong></p>
        </div>
      </div>

      {/* Document Title Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900">Academic & Financial Eligibility Assessment Report</h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Automated profile evaluation & scholarship projection for 2026/2027 international intakes.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Target Country</span>
          <span className="text-xs font-black text-[#111111]">{countryMeta.label}</span>
        </div>
      </div>

      {/* Section 1: Candidate Evaluation Parameters */}
      <div className="space-y-1.5 avoid-break">
        <h3 className="text-[11px] font-black uppercase text-[#111111] tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-[#111111] rounded-full inline-block"></span>
          1. Candidate Academic Profile & Evaluation Parameters
        </h3>
        <table className="w-full text-[11px] border-collapse border border-slate-200 rounded-lg overflow-hidden">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="p-2 bg-slate-50 font-bold text-slate-600 w-1/4">Education Completed:</td>
              <td className="p-2 font-semibold text-slate-800 w-1/4">{educationLevel}</td>
              <td className="p-2 bg-slate-50 font-bold text-slate-600 w-1/4">Academic Standing:</td>
              <td className="p-2 font-bold text-slate-900 w-1/4">{scoreType === 'cgpa' ? `${cgpa} CGPA` : `${percentage}%`} (Normalized: {normalizedPercentage}%)</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="p-2 bg-slate-50 font-bold text-slate-600">Target Destination:</td>
              <td className="p-2 font-bold text-[#111111]">{countryMeta.label}</td>
              <td className="p-2 bg-slate-50 font-bold text-slate-600">Target Degree:</td>
              <td className="p-2 font-semibold text-slate-800">{targetDegree}</td>
            </tr>
            <tr>
              <td className="p-2 bg-slate-50 font-bold text-slate-600">Field of Study / Major:</td>
              <td className="p-2 font-semibold text-slate-800">{targetMajor}</td>
              <td className="p-2 bg-slate-50 font-bold text-slate-600">Max Annual Tuition Budget:</td>
              <td className="p-2 font-bold text-emerald-700">₹{annualBudgetInr} Lakhs / yr ({budgetInNativeCurrency})</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2: Scholarship & Tuition Grant Forecast */}
      <div className="space-y-1.5 avoid-break">
        <h3 className="text-[11px] font-black uppercase text-[#111111] tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-[#111111] rounded-full inline-block"></span>
          2. Scholarship Eligibility & Tuition Waiver Forecast
        </h3>
        <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
              {currentTier.title}
            </span>
            <p className="text-xs text-emerald-950 font-bold pt-1">
              Estimated Tuition Fee Waiver: <span className="text-emerald-700 font-black">{potentialGrant.waiverPct}</span>
            </p>
            <p className="text-[11px] text-emerald-800 font-medium">
              Based on your academic standing, you meet qualification standards for regional and merit grants.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Estimated Grant Entitlement</span>
            <span className="text-2xl font-black text-emerald-900 leading-tight block">{potentialGrant.formattedUsd}</span>
            <span className="text-xs font-bold text-emerald-700">({potentialGrant.formattedInr})</span>
          </div>
        </div>
      </div>

      {/* Section 3: Evaluated University Shortlist Table */}
      <div className="space-y-1.5 avoid-break">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase text-[#111111] tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#111111] rounded-full inline-block"></span>
            3. Recommended Universities & Net Payable Tuition
          </h3>
          <span className="text-[9px] text-slate-500 font-semibold">Estimates only; verify requirements on each official site</span>
        </div>

        <table className="w-full text-[10px] border-collapse border border-slate-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#111111] text-white font-bold text-left">
              <th className="p-2 border border-slate-300">University</th>
              <th className="p-2 border border-slate-300">Classification</th>
              <th className="p-2 border border-slate-300 text-center">Est. Admission Odds</th>
              <th className="p-2 border border-slate-300 text-right">Standard Tuition / yr</th>
              <th className="p-2 border border-slate-300 text-right">Estimated Grant</th>
              <th className="p-2 border border-slate-300 text-right">Net Tuition / yr</th>
              <th className="p-2 border border-slate-300 text-center">Budget Fit</th>
            </tr>
          </thead>
          <tbody>
            {topPrintUniversities.map((uni, idx) => (
              <tr key={idx} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                <td className="p-2 border border-slate-200 font-bold text-slate-900">
                  {uni.name}
                  <span className="block text-[9px] text-slate-500 font-medium">{[getVerifiedRanking(uni)?.shortLabel, countryMeta.label].filter(Boolean).join(' • ')}</span>
                </td>
                <td className="p-2 border border-slate-200">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: uni.tagBg, color: uni.tagColor }}>
                    {uni.fitTag}
                  </span>
                </td>
                <td className="p-2 border border-slate-200 text-center font-black text-slate-800">
                  {uni.acceptanceOdds}%
                </td>
                <td className="p-2 border border-slate-200 text-right text-slate-600 font-medium">
                  {countryMeta.currency}{uni.baseTuitionLocal?.toLocaleString()}
                  <span className="block text-[8px] text-slate-400">(₹{uni.baseTuitionInrLakh}L)</span>
                </td>
                <td className="p-2 border border-slate-200 text-right text-emerald-700 font-semibold">
                  -{countryMeta.currency}{(uni.baseTuitionLocal - uni.netTuitionLocal)?.toLocaleString()}
                </td>
                <td className="p-2 border border-slate-200 text-right font-black text-[#111111]">
                  {countryMeta.currency}{uni.netTuitionLocal?.toLocaleString()}
                  <span className="block text-[8px] text-emerald-700 font-bold">(₹{uni.netTuitionInrLakh}L)</span>
                </td>
                <td className="p-2 border border-slate-200 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                    uni.isWithinBudget ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {uni.isWithinBudget ? '✓ In Budget' : 'Exceeds'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 4: Admissions Guidance & Next Steps */}
      <div className="space-y-1.5 avoid-break pt-1">
        <h3 className="text-[11px] font-black uppercase text-[#111111] tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-[#111111] rounded-full inline-block"></span>
          4. Recommended Advisory Next Steps
        </h3>
        <div className="grid grid-cols-3 gap-2.5 text-[10px]">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-black text-[#111111] uppercase block mb-0.5">Step 1: Document Audit</span>
            <p className="text-slate-600 leading-snug">Verify academic transcripts, GPA conversion and draft course-tailored SOP & LORs.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-black text-[#111111] uppercase block mb-0.5">Step 2: Priority Deadlines</span>
            <p className="text-slate-600 leading-snug">File applications 4-6 months before intake to guarantee maximum scholarship consideration.</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-black text-[#111111] uppercase block mb-0.5">Step 3: Visa & Finances</span>
            <p className="text-slate-600 leading-snug">Prepare blocked account / financial solvency proof and schedule visa biometric slots.</p>
          </div>
        </div>
      </div>

      {/* Official Footer with Updated Address & Phone */}
      <div className="border-t-2 border-slate-200 pt-2.5 mt-3 text-[9px] text-slate-500 flex justify-between items-end avoid-break">
        <div>
          <p className="font-black text-slate-900 text-[10px] text-[#111111]">UniCoach Overseas Education Advisory Desk</p>
          <p className="font-medium text-slate-600 mt-0.5">1st Floor, Gali No. 4, Sahil Colony, Jattal road, Sondhapur Village, Panipat, Haryana, India, 132105</p>
          <p className="font-medium text-slate-600">Helpline: <strong className="text-slate-800">+91 95186 57944</strong> | Email: <strong className="text-slate-800">info@unicoach.in</strong> | Web: <strong className="text-slate-800">www.unicoach.com</strong></p>
        </div>
        <div className="text-right">
          <p className="italic text-slate-400 text-[8px]">Confidential Student Advisory Document</p>
          <p className="font-bold text-slate-600">Generated via UniCoach AI Engine</p>
        </div>
      </div>
    </div>
  );

  const EDUCATION_LEVELS = [
    { id: "Bachelor's Degree", label: "Bachelor's Degree", sub: "B.Tech, B.Sc, B.Com, BBA (Applying for Master's/MBA)" },
    { id: "12th Grade / High School", label: "12th Grade / High School", sub: "CBSE / ICSE / State Board (Applying for Undergrad)" },
    { id: "Master's Degree", label: "Master's Degree", sub: "M.Tech, M.Sc, MBA (Applying for PhD / Exec)" },
  ];

  return (
    <>
      <FinderPage className="print:hidden">
      <FinderHero
        eyebrow="Scholarship Calculator"
        title="Find scholarships you qualify for"
        subtitle="Add your marks, country and budget. See your admission odds, fees after grants and matching scholarships. Free, sign in only to unlock results."
        steps={[
          { label: 'Marks', sub: 'Your scores' },
          { label: 'Country', sub: 'Where to study' },
          { label: 'Budget', sub: 'Yearly fees' },
          { label: 'Results', sub: 'Odds, fees after grants' },
        ]}
        active={0}
      />

      <div className="mt-8 space-y-6">
        {/* Calculator card: same field look as the Course Finder search card */}
        <FinderCard className="space-y-5">
          <div id="scholarship-form" className="flex items-center justify-between flex-wrap gap-3 scroll-mt-24">
            <p className="text-[15px] font-semibold text-[#16130F]">Your details</p>
            <button
              type="button"
              onClick={() => {
                setEducationLevel("Bachelor's Degree");
                setPercentage(76);
                setCgpa(7.8);
                setAnnualBudgetInr(25);
                setStrictBudgetFilter(false);
                setTargetCountry('USA');
                setTargetDegree("Master's");
                setTargetMajor('Computer Science');
                setIeltsScore(6.5);
                setHasCalculated(false);
              }}
              className="text-[12.5px] font-medium text-[#5B544A] hover:text-[#DE5C2B] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} /> Reset
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[#16130F]">Highest completed education *</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EDUCATION_LEVELS.map((item) => {
                const isSelected = educationLevel === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleEducationChange(item.id)}
                    className={`p-3.5 border text-left transition-colors cursor-pointer ${isSelected ? 'bg-[#16130F] border-[#16130F] text-white' : 'bg-[#F8F5EF] border-[#E6E0D4] text-[#16130F] hover:border-[#16130F]'}`}
                    style={FIELD_RADIUS}
                  >
                    <span className="text-[13.5px] font-semibold flex items-center justify-between gap-2">
                      {item.label} {isSelected && <Check size={15} className="shrink-0" />}
                    </span>
                    <span className={`block text-[12px] leading-snug mt-0.5 ${isSelected ? 'text-white/75' : 'text-[#5B544A]'}`}>{item.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
            <PremiumDropdown
              label="Country *"
              value={targetCountry}
              onChange={setTargetCountry}
              accent="indigo"
              searchable={true}
              searchPlaceholder="Search 160+ countries (e.g. USA, Germany)..."
              options={ALL_COUNTRY_OPTIONS.filter(c => c.value !== 'All')}
            />
            <PremiumDropdown
              label="Degree abroad *"
              value={targetDegree}
              onChange={setTargetDegree}
              accent="indigo"
              options={[
                { value: "Master's", label: "Master's (MS / MSc / MA)", shortLabel: "Master's", icon: '🎓' },
                { value: 'MBA', label: 'MBA / Business Management', shortLabel: 'MBA', icon: '💼' },
                { value: "Bachelor's", label: "Bachelor's (BS / BA / BEng)", shortLabel: "Bachelor's", icon: '🏫' }
              ]}
            />
            <PremiumDropdown
              label="Field of study *"
              value={targetMajor}
              onChange={setTargetMajor}
              accent="indigo"
              searchable={true}
              creatable={true}
              defaultIcon={<BookOpen size={16} className="text-indigo-500" />}
              searchPlaceholder="Search or type custom course..."
              placeholder="Select or enter your course..."
              options={POPULAR_COURSES}
            />
            <PremiumDropdown
              label="IELTS / English score"
              value={ieltsScore}
              onChange={(val) => setIeltsScore(parseFloat(val))}
              accent="indigo"
              options={[
                { value: 6.0, label: '6.0 Band (Entry Level)', icon: '📝' },
                { value: 6.5, label: '6.5 Band (Competent)', icon: '📝' },
                { value: 7.0, label: '7.0 Band (Good User)', icon: '🌟' },
                { value: 7.5, label: '7.5+ Band (Very Good)', icon: '👑' },
                { value: 8.0, label: '8.0+ Band (Expert)', icon: '🏆' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Academic score: label and hint follow the education level */}
            <div className="p-4 bg-[#F8F5EF] border border-[#E6E0D4] space-y-3" style={{ borderRadius: 14 }}>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-[#16130F]">{scoreCardMeta.title}</p>
                  <p className="text-[11.5px] text-[#5B544A] leading-snug max-w-sm mt-0.5">{scoreCardMeta.subtitle}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <FinderChip on={scoreType === 'percentage'} onClick={() => setScoreType('percentage')} className="!py-1.5">Percentage</FinderChip>
                  <FinderChip on={scoreType === 'cgpa'} onClick={() => setScoreType('cgpa')} className="!py-1.5">CGPA (10)</FinderChip>
                </div>
              </div>

              {scoreType === 'percentage' ? (
                <>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="50"
                      max="98"
                      step="1"
                      value={percentage}
                      onChange={(e) => setPercentage(parseFloat(e.target.value))}
                      aria-label="Percentage"
                      className="w-full h-2 bg-[#E6E0D4] rounded-lg appearance-none cursor-pointer accent-[#DE5C2B]"
                    />
                    <span className="w-20 shrink-0 text-right bg-white px-3 py-1.5 border border-[#E6E0D4] text-[18px] font-bold text-[#16130F]" style={FIELD_RADIUS}>{percentage}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[60, 68, 75, 82, 90, 95].map(val => (
                      <FinderChip key={val} on={percentage === val} onClick={() => setPercentage(val)} className="!px-2.5 !py-1 !text-[12px]">{val}%</FinderChip>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5.0"
                      max="10.0"
                      step="0.1"
                      value={cgpa}
                      onChange={(e) => setCgpa(parseFloat(e.target.value))}
                      aria-label="CGPA"
                      className="w-full h-2 bg-[#E6E0D4] rounded-lg appearance-none cursor-pointer accent-[#DE5C2B]"
                    />
                    <span className="w-24 shrink-0 text-right bg-white px-3 py-1.5 border border-[#E6E0D4] text-[18px] font-bold text-[#16130F]" style={FIELD_RADIUS}>{cgpa} / 10</span>
                  </div>
                  <p className="text-[12px] font-medium text-[#5B544A] text-right">≈ {normalizedPercentage}% converted percentage</p>
                </>
              )}
            </div>

            {/* Yearly tuition budget */}
            <div className="p-4 bg-[#F8F5EF] border border-[#E6E0D4] space-y-3" style={{ borderRadius: 14 }}>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-[#16130F]">Max yearly tuition budget *</p>
                  <p className="text-[11.5px] text-[#5B544A] leading-snug mt-0.5">How much tuition fees can you afford per year?</p>
                </div>
                <div className="text-right bg-white px-3 py-1.5 border border-[#E6E0D4]" style={FIELD_RADIUS}>
                  <span className="text-[18px] font-bold text-[#16130F]">₹{annualBudgetInr} Lakhs</span>
                  <span className="text-[11px] text-[#5B544A] block">≈ {budgetInNativeCurrency}</span>
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={annualBudgetInr}
                onChange={(e) => setAnnualBudgetInr(parseFloat(e.target.value))}
                aria-label="Yearly tuition budget in lakhs"
                className="w-full h-2 bg-[#E6E0D4] rounded-lg appearance-none cursor-pointer accent-[#DE5C2B]"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: 'Under ₹12L (Budget)', val: 12 },
                  { label: '₹20L (Standard)', val: 20 },
                  { label: '₹30L (Target)', val: 30 },
                  { label: '₹45L+ (Premium)', val: 45 }
                ].map(b => (
                  <FinderChip key={b.val} on={annualBudgetInr === b.val} onClick={() => setAnnualBudgetInr(b.val)} className="!px-2.5 !py-1 !text-[12px]">{b.label}</FinderChip>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <FinderButton onClick={handleCalculate} disabled={isCalculating} className="w-full sm:w-auto">
              {isCalculating ? (
                <>
                  <RefreshCw className="animate-spin shrink-0" size={16} />
                  <span className="truncate">
                    {calcStep === 1 && 'Scanning 800+ university cutoffs & tuition fees...'}
                    {calcStep === 2 && `Matching ${normalizedPercentage}% (${educationLevel}) with scholarship grants...`}
                    {calcStep === 3 && `Filtering colleges within ₹${annualBudgetInr} Lakhs budget...`}
                  </span>
                </>
              ) : (
                <>
                  <Calculator size={16} /> Check eligibility <ArrowRight size={16} />
                </>
              )}
            </FinderButton>
          </div>
        </FinderCard>

        {/* Quick starts: one tap fills the form, like Course Finder's quick filters */}
        <div className="bg-white/70 border border-[#E6E0D4] p-4 sm:p-5" style={{ borderRadius: 18 }}>
          <p className="text-[13.5px] font-semibold text-[#16130F] mb-3">Quick start <span className="font-normal text-[#5B544A]">· tap one to fill the form</span></p>
          <div className="flex flex-wrap gap-2">
            {QUICK_STARTS.map((q) => (
              <FinderChip key={q.label} on={false}
                onClick={() => {
                  handleEducationChange(q.level);
                  setTargetDegree(q.degree);
                  setTargetCountry(q.country);
                  setTargetMajor(q.major);
                  setAnnualBudgetInr(q.budget);
                  setHasCalculated(false);
                  document.getElementById('scholarship-form')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                <span aria-hidden>{q.flag}</span> {q.label}
              </FinderChip>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RESULTS SECTION */}
        {/* ======================================================== */}
        <div ref={resultsRef} className="space-y-8">
          
          {/* ──────────────────────────────────────────────────────── */}
          {/* POTENTIAL SCHOLARSHIP AMOUNT BANNER */}
          {/* ──────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="uc-clean p-7 md:p-9 rounded-[32px] shadow-2xl space-y-6 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Sparkles size={14} className="text-amber-400" /> Instant Potential Grant Estimate
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowReportPreview(true)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={14} className="text-emerald-300" /> Preview Report
                  </button>

                  <button
                    onClick={handlePrintReport}
                    className="px-4 py-2 rounded-xl bg-white text-[#111111] hover:bg-slate-100 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download size={14} className="text-[#111111]" /> Download Official PDF
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                  Based on your {normalizedPercentage}% ({educationLevel}) in {targetMajor} for {countryMeta.label}:
                </p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    {potentialGrant.formattedUsd}
                  </span>
                  <span className="text-xl md:text-3xl font-black text-emerald-400">
                    ({potentialGrant.formattedInr})
                  </span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-300 font-semibold leading-relaxed max-w-3xl">
                {potentialGrant.lowTuition
                  ? <>Public universities in {countryMeta.label} charge little or no tuition, so there is no merit discount to estimate. For living costs, look at DAAD and other scholarships.</>
                  : <>Students with a similar score usually fall in the <strong>{currentTier.title}</strong>, with merit awards of about <strong>{potentialGrant.waiverPct}</strong> at {countryMeta.label} universities. This is an estimate; each university decides its own awards.</>}
              </p>
            </div>

            {/* ──────────────────────────────────────────────────────── */}
            {/* ASKMAMAVI-INSPIRED MINIMUM THRESHOLD PROGRESS BAR */}
            {/* ──────────────────────────────────────────────────────── */}
            <div className="pt-5 border-t border-white/10 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-black text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Award size={14} className="text-amber-400" /> Scholarship Unlocking Threshold Scale
                </span>
                <span className="text-emerald-400 font-black bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                  Your Score: {normalizedPercentage}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="relative w-full h-4 bg-white/10 rounded-full overflow-hidden flex border border-white/10 shadow-inner">
                <div className="w-[30%] bg-slate-500/50 h-full border-r border-slate-900" title="50-65%: Entry Tier" />
                <div className="w-[25%] bg-[#DE5C2B]/70 h-full border-r border-slate-900" title="65-75%: Merit Tier" />
                <div className="w-[25%] bg-indigo-500/80 h-full border-r border-slate-900" title="75-85%: Excellence Tier" />
                <div className="w-[20%] bg-emerald-500 h-full" title="85%+: Top Merit Tier" />
              </div>

              {/* Tier Indicator Labels */}
              <div className="grid grid-cols-4 gap-1 text-[10px] md:text-xs text-center font-bold">
                <div className={normalizedPercentage < 65 ? 'text-white font-black bg-white/10 py-1 rounded-md' : 'text-slate-400'}>
                  50-65% (Entry)
                </div>
                <div className={normalizedPercentage >= 65 && normalizedPercentage < 75 ? 'text-white font-black bg-white/10 py-1 rounded-md' : 'text-slate-400'}>
                  65-75% (Merit)
                </div>
                <div className={normalizedPercentage >= 75 && normalizedPercentage < 85 ? 'text-white font-black bg-white/10 py-1 rounded-md' : 'text-slate-400'}>
                  75-85% (Excellence)
                </div>
                <div className={normalizedPercentage >= 85 ? 'text-emerald-400 font-black bg-emerald-900/40 py-1 rounded-md' : 'text-slate-400'}>
                  85%+ (Top Merit)
                </div>
              </div>
            </div>
          </motion.div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* ADMISSION ODDS & SHORTLISTED RESULTS TABS */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
                  Step 2: Shortlist Results
                </span>
                <h3 className="text-lg md:text-xl font-black text-slate-900">
                  Qualified Universities & Net Fees for {countryMeta.label}
                </h3>
              </div>

              {/* Strict Budget Filter Toggle */}
              <label className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-black text-emerald-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={strictBudgetFilter}
                  onChange={(e) => setStrictBudgetFilter(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Only within ₹{annualBudgetInr}L Budget</span>
              </label>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl overflow-x-auto border border-slate-200/60">
              <button
                onClick={() => setActiveResultTab('safe')}
                className={`px-5 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeResultTab === 'safe'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200/50 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck size={16} /> 
                <span>Safe Admits</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeResultTab === 'safe' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {evaluatedUniversities.safe.length}
                </span>
              </button>

              <button
                onClick={() => setActiveResultTab('target')}
                className={`px-5 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeResultTab === 'target'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Compass size={16} /> 
                <span>Target Admits</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeResultTab === 'target' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {evaluatedUniversities.target.length}
                </span>
              </button>

              <button
                onClick={() => setActiveResultTab('dream')}
                className={`px-5 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeResultTab === 'dream'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200/50 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Target size={16} /> 
                <span>Dream Reach</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeResultTab === 'dream' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {evaluatedUniversities.dream.length}
                </span>
              </button>

              <button
                onClick={() => setActiveResultTab('scholarships')}
                className={`px-5 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeResultTab === 'scholarships'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-200/50 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Award size={16} /> 
                <span>Matching Scholarships</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeResultTab === 'scholarships' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {matchingScholarships.length}
                </span>
              </button>
            </div>

            {/* ──────────────────────────────────────────────────────── */}
            {/* TAB CONTENT: UNIVERSITIES (Safe / Target / Dream) */}
            {/* ──────────────────────────────────────────────────────── */}
            {activeResultTab !== 'scholarships' && (
              <div className="space-y-6">
                {evaluatedUniversities[activeResultTab]?.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <BookOpen size={42} className="mx-auto text-slate-300" />
                    <p className="text-base font-bold text-slate-700">No universities found matching these criteria and budget filter.</p>
                    {strictBudgetFilter && (
                      <button
                        onClick={() => setStrictBudgetFilter(false)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        Turn off strict budget filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {evaluatedUniversities[activeResultTab].map((uni, idx) => {
                      const isBookmarked = savedUniIds.has(uni._id || uni.name);
                      const ranking = getVerifiedRanking(uni);
                      return (
                        <div
                          key={uni._id || idx}
                          className="p-6 md:p-7 rounded-[28px] bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/70 transition-all duration-200 flex flex-col justify-between space-y-5 group"
                        >
                          <div className="space-y-4">
                            {/* University Header Row */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <UniversityLogo 
                                  name={uni.name} 
                                  universityName={uni.name} 
                                  logo={uni.logo} 
                                  domain={uni.website} 
                                  size={52} 
                                  className="shadow-xs border border-slate-200/80 rounded-2xl"
                                />
                                <div className="space-y-1">
                                  <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                                    {uni.name}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-bold">
                                    <span>📍 {uni.country}</span>
                                    {ranking && (
                                      <>
                                        <span>•</span>
                                        <span title={ranking.fullLabel} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-black">
                                          {ranking.shortLabel}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleSaveUniversity(uni)}
                                className={`p-2.5 rounded-2xl transition-all cursor-pointer flex-shrink-0 ${
                                  isBookmarked ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-300' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-amber-500'
                                }`}
                                title={isBookmarked ? 'Saved to Shortlist' : 'Save to Shortlist'}
                              >
                                <BookmarkCheck size={18} />
                              </button>
                            </div>

                            {/* Badges Row with plenty of breathing room */}
                            <div className="flex items-center gap-2.5 flex-wrap pt-1">
                              <span className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 ${
                                activeResultTab === 'safe'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : activeResultTab === 'target'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  : 'bg-purple-50 text-purple-800 border-purple-200'
                              }`}>
                                🎯 {uni.acceptanceOdds}% Est. Admission Odds
                              </span>

                              {/* Budget Status Badge */}
                              {uni.isWithinBudget ? (
                                <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                                  <Check size={13} className="text-emerald-600" /> Fits ₹{annualBudgetInr}L Budget
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                                  <AlertTriangle size={13} className="text-rose-500" /> +₹{uni.budgetDiff}L Over Budget
                                </span>
                              )}
                            </div>

                            {/* Estimated Annual Fees Breakdown Box */}
                            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                <span>Standard Base Tuition Fee:</span>
                                <span>{countryMeta.currency}{uni.baseTuitionLocal?.toLocaleString()} / yr (₹{uni.baseTuitionInrLakh}L)</span>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                                <span className="text-xs font-black text-slate-800">Net Fee (After Scholarship):</span>
                                <span className="text-sm font-black text-emerald-700">
                                  {countryMeta.currency}{uni.netTuitionLocal?.toLocaleString()} / yr <span className="text-xs font-bold text-emerald-600">(₹{uni.netTuitionInrLakh} Lakhs)</span>
                                </span>
                              </div>
                            </div>

                            {/* Scholarship Grant Highlight Banner */}
                            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/70 text-xs font-bold text-amber-950 flex items-center gap-2.5 shadow-2xs">
                              <Award size={16} className="text-amber-600 flex-shrink-0" />
                              <span className="leading-snug">{uni.estimatedScholarship}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => setExplainingUni(uni)}
                              className="py-3 px-4 rounded-xl text-xs font-black bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                            >
                              <Sparkles size={14} /> Explain Fit (AI 💡)
                            </button>

                            <a
                              href={cleanPortalUrl(uni.website, `${uni.name} admission portal`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-indigo-600 text-white transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              Official Portal <ExternalLink size={13} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ──────────────────────────────────────────────────────── */}
            {/* TAB CONTENT: SCHOLARSHIPS */}
            {/* ──────────────────────────────────────────────────────── */}
            {activeResultTab === 'scholarships' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {matchingScholarships.map((sch, sIdx) => (
                    <div
                      key={sch._id || sIdx}
                      className="p-6 md:p-7 rounded-[28px] bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 border border-amber-200/90 hover:border-amber-400 hover:shadow-xl transition-all space-y-4 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                            {sch.fundingType || 'Merit Waiver'}
                          </span>
                          <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                            {sch.grantAmountUSD ? `$${sch.grantAmountUSD.toLocaleString()}` : sch.coverage || 'Tuition Waiver'}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-slate-900 leading-snug">{sch.name || sch.scholarshipName}</h4>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">{sch.description || sch.shortDescription}</p>
                      </div>

                      <button
                        onClick={() => setExplainingScholarship(sch)}
                        className="w-full py-3 bg-white hover:bg-amber-600 text-amber-900 hover:text-white border border-amber-200 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs mt-2"
                      >
                        <Sparkles size={14} className="text-amber-500 group-hover:text-white" /> Explain Eligibility Match (AI 💡)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* BOTTOM CONSULTATION BAR */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="p-7 md:p-8 rounded-[32px] bg-gradient-to-r from-[#DE5C2B] via-orange-600 to-[#C04A1D] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-lg md:text-xl font-black text-white">Need Free 1-on-1 Help with Applications & Grants?</h4>
              <p className="text-xs text-blue-100 font-medium max-w-xl">
                Our certified counsellors review your profile, verify official university scholarship deadlines, and help you draft winning applications.
              </p>
            </div>

            <button
              onClick={() => openModal({ source: 'Eligibility Calculator Bottom Bar', dreamCountry: targetCountry })}
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <PhoneCall size={14} /> Book Free Counselling
            </button>
          </div>

        </div>

      </div>

      {/* AI Modals */}
      <UniversityAiExplainerModal
        isOpen={!!explainingUni}
        onClose={() => setExplainingUni(null)}
        university={explainingUni}
        studentProfile={{ gpaPercent: normalizedPercentage, targetCountry, dreamCourse: targetMajor }}
      />

      <ScholarshipAiExplainerModal
        isOpen={!!explainingScholarship}
        onClose={() => setExplainingScholarship(null)}
        scholarship={explainingScholarship}
        studentProfile={{ gpaPercent: normalizedPercentage, targetCountry, targetScore: normalizedPercentage }}
      />

      </FinderPage>

      {/* ──────────────────────────────────────────────────────── */}
      {/* DEDICATED OFFICIAL PRINTABLE REPORT (Visible only on print) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="hidden print:block w-full bg-white text-slate-900 p-2 font-sans" id="official-print-report">
        {renderReportContent()}
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* ON-SCREEN REPORT PREVIEW MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showReportPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Modal Top Bar */}
              <div className="p-4 px-6 bg-[#111111] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <FileText size={18} className="text-orange-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Official Eligibility Report Preview</h3>
                    <p className="text-[10px] text-orange-200 font-medium">Verify your evaluation parameters before downloading or saving</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintReport}
                    className="px-4 py-2 rounded-xl bg-white text-[#111111] hover:bg-orange-50 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer size={14} /> Print / Save as PDF
                  </button>
                  <button
                    onClick={() => setShowReportPreview(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Content Scrollable Area */}
              <div className="p-4 sm:p-6 overflow-y-auto custom-modal-scrollbar bg-slate-100/70 flex-1">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
                  {renderReportContent()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EligibilityCalculatorPage;
