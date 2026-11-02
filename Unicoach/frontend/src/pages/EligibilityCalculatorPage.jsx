import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, Sparkles, Award, ShieldCheck, Target,
  Compass, ArrowRight, Download,
  BookOpen, ExternalLink, RefreshCw, FileText, PhoneCall,
  BookmarkCheck, Check, AlertTriangle, Printer, Eye, X
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
import { JourneyPills } from '../components/ui/BrandElements';
import { StationSign } from '../components/desi/DesiKit';

// Desi Pop tap chip: white pill with an ink border, mustard when picked
const Chip = ({ on, children, className = '', ...props }) => (
  <button
    type="button"
    aria-pressed={on}
    {...props}
    className={`inline-flex items-center gap-1.5 text-[14px] font-bold px-3.5 py-2 border-2 border-[#16130F] text-[#16130F] transition-transform hover:-translate-y-0.5 cursor-pointer ${on ? 'bg-[#F2B705] shadow-[2px_2px_0_#16130F]' : 'bg-white'} ${className}`}
    style={{ borderRadius: 999 }}
  >
    {children}
  </button>
);

// Numbered section label used inside the form card
const StepLabel = ({ n, tone = '#DE5C2B', children }) => (
  <p className="font-urbanist text-[17px] font-extrabold text-[#16130F] flex items-center">
    <span className="inline-grid place-items-center w-7 h-7 mr-2 rounded-lg text-white border-2 border-[#16130F] text-[14px] shrink-0" style={{ background: tone }}>{n}</span>
    {children}
  </p>
);

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
      <div className="print:hidden min-h-screen pt-[76px] pb-20 font-['Onest',sans-serif] bg-[#FFF6E5] bg-[radial-gradient(circle,rgba(22,19,15,.06)_1.3px,transparent_1.7px)] [background-size:12px_12px]">
      <div className="max-w-6xl mx-auto px-4">
      <div className="text-center pt-4 sm:pt-6">
        <StationSign hi="Admit milega ya nahi?" en="ADMISSION CHANCES" className="-rotate-2" />
        <h1 className="mt-5 font-urbanist text-[34px] sm:text-[50px] font-black tracking-[-0.045em] leading-[1] text-[#16130F]">
          Find scholarships you <span className="inline-block px-2.5 bg-[#F2B705] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] -rotate-1" style={{ borderRadius: 10 }}>qualify for</span>
        </h1>
        <p className="mt-4 text-[16px] sm:text-[18px] font-medium text-[#3D3830] max-w-2xl mx-auto">Add your marks, country and budget. See your admission odds, fees after grants and matching scholarships. Free, sign in only to unlock results.</p>
        <JourneyPills
          steps={[
            { label: 'Marks', sub: 'Your scores' },
            { label: 'Country', sub: 'Where to study' },
            { label: 'Budget', sub: 'Yearly fees' },
            { label: 'Results', sub: 'Odds, fees after grants' },
          ]}
          active={0}
          className="mt-5 mx-auto w-fit max-w-full"
        />
      </div>

      <div className="mt-8 space-y-7">
        {/* Calculator card: ink border + hard shadow, like the Course Finder search card */}
        <div className="bg-white border-[3px] border-[#16130F] shadow-[7px_7px_0_#16130F] p-4 sm:p-6 space-y-6" style={{ borderRadius: 20 }}>
          <div id="scholarship-form" className="flex items-center justify-between flex-wrap gap-3 scroll-mt-24">
            <StepLabel n="1">Apne baare mein batao</StepLabel>
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
              className="text-[14px] font-bold text-[#16130F] px-3.5 py-1.5 bg-white border-2 border-[#16130F] hover:bg-[#FFF1B8] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              style={{ borderRadius: 999 }}
            >
              <RefreshCw size={14} /> Reset
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-bold text-[#16130F]">Highest completed education *</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EDUCATION_LEVELS.map((item) => {
                const isSelected = educationLevel === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleEducationChange(item.id)}
                    className={`p-3.5 border-2 border-[#16130F] text-left transition-transform cursor-pointer hover:-translate-y-0.5 ${isSelected ? 'bg-[#16130F] text-white shadow-[4px_4px_0_#DE5C2B]' : 'bg-[#FFF6E5] text-[#16130F]'}`}
                    style={{ borderRadius: 12 }}
                  >
                    <span className="font-urbanist text-[15px] font-extrabold flex items-center justify-between gap-2">
                      {item.label} {isSelected && <Check size={16} className="shrink-0 text-[#F2B705]" />}
                    </span>
                    <span className={`block text-[13.5px] leading-snug mt-1 ${isSelected ? 'text-white/80' : 'text-[#3D3830]'}`}>{item.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-5 border-t-2 border-dashed border-[#16130F]/25 space-y-3">
            <StepLabel n="2" tone="#14837E">Kahan aur kya padhna hai?</StepLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
              <PremiumDropdown
                label="Country *"
                value={targetCountry}
                onChange={setTargetCountry}
                accent="orange"
                searchable={true}
                searchPlaceholder="Search 160+ countries (e.g. USA, Germany)..."
                options={ALL_COUNTRY_OPTIONS.filter(c => c.value !== 'All')}
              />
              <PremiumDropdown
                label="Degree abroad *"
                value={targetDegree}
                onChange={setTargetDegree}
                accent="orange"
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
                accent="orange"
                searchable={true}
                creatable={true}
                defaultIcon={<BookOpen size={16} className="text-[#DE5C2B]" />}
                searchPlaceholder="Search or type custom course..."
                placeholder="Select or enter your course..."
                options={POPULAR_COURSES}
              />
              <PremiumDropdown
                label="IELTS / English score"
                value={ieltsScore}
                onChange={(val) => setIeltsScore(parseFloat(val))}
                accent="orange"
                options={[
                  { value: 6.0, label: '6.0 Band (Entry Level)', icon: '📝' },
                  { value: 6.5, label: '6.5 Band (Competent)', icon: '📝' },
                  { value: 7.0, label: '7.0 Band (Good User)', icon: '🌟' },
                  { value: 7.5, label: '7.5+ Band (Very Good)', icon: '👑' },
                  { value: 8.0, label: '8.0+ Band (Expert)', icon: '🏆' }
                ]}
              />
            </div>
          </div>

          <div className="pt-5 border-t-2 border-dashed border-[#16130F]/25 space-y-3">
          <StepLabel n="3" tone="#B8285B">Marks aur budget</StepLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Academic score: label and hint follow the education level */}
            <div className="p-4 bg-[#FFF1B8] border-2 border-[#16130F] space-y-3" style={{ borderRadius: 14 }}>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="font-urbanist text-[15px] font-extrabold text-[#16130F]">{scoreCardMeta.title}</p>
                  <p className="text-[14px] text-[#3D3830] leading-snug max-w-sm mt-0.5">{scoreCardMeta.subtitle}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Chip on={scoreType === 'percentage'} onClick={() => setScoreType('percentage')} className="!py-1.5">Percentage</Chip>
                  <Chip on={scoreType === 'cgpa'} onClick={() => setScoreType('cgpa')} className="!py-1.5">CGPA (10)</Chip>
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
                      className="w-full h-2.5 bg-white border border-[#16130F] rounded-full appearance-none cursor-pointer accent-[#DE5C2B]"
                    />
                    <span className="w-20 shrink-0 text-right bg-white px-3 py-1.5 border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] font-urbanist text-[19px] font-black text-[#16130F]" style={{ borderRadius: 10 }}>{percentage}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[60, 68, 75, 82, 90, 95].map(val => (
                      <Chip key={val} on={percentage === val} onClick={() => setPercentage(val)} className="!px-3 !py-1">{val}%</Chip>
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
                      className="w-full h-2.5 bg-white border border-[#16130F] rounded-full appearance-none cursor-pointer accent-[#DE5C2B]"
                    />
                    <span className="w-24 shrink-0 text-right bg-white px-3 py-1.5 border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] font-urbanist text-[19px] font-black text-[#16130F]" style={{ borderRadius: 10 }}>{cgpa} / 10</span>
                  </div>
                  <p className="text-[14px] font-semibold text-[#3D3830] text-right">≈ {normalizedPercentage}% converted percentage</p>
                </>
              )}
            </div>

            {/* Yearly tuition budget */}
            <div className="p-4 bg-[#DDF3EF] border-2 border-[#16130F] space-y-3" style={{ borderRadius: 14 }}>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="font-urbanist text-[15px] font-extrabold text-[#16130F]">Max yearly tuition budget *</p>
                  <p className="text-[14px] text-[#3D3830] leading-snug mt-0.5">How much tuition fees can you afford per year?</p>
                </div>
                <div className="text-right bg-white px-3 py-1.5 border-2 border-[#16130F] shadow-[2px_2px_0_#16130F]" style={{ borderRadius: 10 }}>
                  <span className="font-urbanist text-[19px] font-black text-[#16130F]">₹{annualBudgetInr} Lakhs</span>
                  <span className="text-[13px] font-semibold text-[#3D3830] block">≈ {budgetInNativeCurrency}</span>
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
                className="w-full h-2.5 bg-white border border-[#16130F] rounded-full appearance-none cursor-pointer accent-[#14837E]"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: 'Under ₹12L (Budget)', val: 12 },
                  { label: '₹20L (Standard)', val: 20 },
                  { label: '₹30L (Target)', val: 30 },
                  { label: '₹45L+ (Premium)', val: 45 }
                ].map(b => (
                  <Chip key={b.val} on={annualBudgetInr === b.val} onClick={() => setAnnualBudgetInr(b.val)} className="!px-3 !py-1">{b.label}</Chip>
                ))}
              </div>
            </div>
          </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full sm:w-auto max-w-full h-12 px-6 inline-flex items-center justify-center gap-2 text-white text-[15px] font-bold bg-[#16130F] border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 transition-transform cursor-pointer"
              style={{ borderRadius: 999 }}
            >
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
            </button>
          </div>
        </div>

        {/* Quick starts: one tap fills the form, like Course Finder's quick filters */}
        <div className="bg-[#14837E] border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] p-4 sm:p-5" style={{ borderRadius: 20 }}>
          <p className="font-urbanist text-[18px] font-extrabold text-white mb-0.5">Quick start</p>
          <p className="text-[14px] text-white/85 mb-3">Ek tap karo, form bhar jayega</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_STARTS.map((q) => (
              <Chip key={q.label} on={false}
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
              </Chip>
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
            className="bg-[#16130F] text-white border-[3px] border-[#16130F] shadow-[7px_7px_0_#DE5C2B] p-6 md:p-8 space-y-6"
            style={{ borderRadius: 24 }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[14px] font-bold bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] -rotate-1" style={{ borderRadius: 8 }}>
                  <Sparkles size={15} /> Kitna scholarship mil sakta hai?
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowReportPreview(true)}
                    className="px-4 py-2 bg-transparent hover:bg-white/10 text-[14px] font-bold text-white border-2 border-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    style={{ borderRadius: 999 }}
                  >
                    <Eye size={15} /> Preview Report
                  </button>

                  <button
                    onClick={handlePrintReport}
                    className="px-4 py-2 bg-white text-[#16130F] text-[14px] font-bold border-2 border-white shadow-[3px_3px_0_#F2B705] hover:-translate-y-0.5 transition-transform flex items-center gap-1.5 cursor-pointer"
                    style={{ borderRadius: 999 }}
                  >
                    <Download size={15} /> Download Official PDF
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[14px] font-bold text-[#F2B705]">
                  Based on your {normalizedPercentage}% ({educationLevel}) in {targetMajor} for {countryMeta.label}:
                </p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-urbanist text-[34px] md:text-[52px] font-black text-white tracking-[-0.03em] leading-none">
                    {potentialGrant.formattedUsd}
                  </span>
                  <span className="font-urbanist text-[22px] md:text-[32px] font-black text-[#F2B705] leading-none">
                    ({potentialGrant.formattedInr})
                  </span>
                </div>
              </div>

              <p className="text-[15px] text-white/85 font-medium leading-relaxed max-w-3xl">
                {potentialGrant.lowTuition
                  ? <>Public universities in {countryMeta.label} charge little or no tuition, so there is no merit discount to estimate. For living costs, look at DAAD and other scholarships.</>
                  : <>Students with a similar score usually fall in the <strong className="text-white">{currentTier.title}</strong>, with merit awards of about <strong className="text-white">{potentialGrant.waiverPct}</strong> at {countryMeta.label} universities. This is an estimate; each university decides its own awards.</>}
              </p>
            </div>

            {/* Score scale: which scholarship tier your marks fall in */}
            <div className="pt-5 border-t-2 border-dashed border-white/25 space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2 text-[14px] font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Award size={16} className="text-[#F2B705]" /> Scholarship Unlocking Threshold Scale
                </span>
                <span className="text-[#16130F] font-black bg-white px-3 py-1 border-2 border-white" style={{ borderRadius: 999 }}>
                  Your Score: {normalizedPercentage}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="relative w-full h-5 bg-white rounded-full overflow-hidden flex border-2 border-white">
                <div className="w-[30%] bg-[#FFF6E5] h-full border-r-2 border-[#16130F]" title="50-65%: Entry Tier" />
                <div className="w-[25%] bg-[#DE5C2B] h-full border-r-2 border-[#16130F]" title="65-75%: Merit Tier" />
                <div className="w-[25%] bg-[#B8285B] h-full border-r-2 border-[#16130F]" title="75-85%: Excellence Tier" />
                <div className="w-[20%] bg-[#14837E] h-full" title="85%+: Top Merit Tier" />
              </div>

              {/* Tier Indicator Labels */}
              <div className="grid grid-cols-4 gap-1.5 text-[12px] md:text-[14px] text-center font-bold">
                <div className={normalizedPercentage < 65 ? 'text-[#16130F] font-black bg-[#F2B705] py-1 rounded-md' : 'text-white/70 py-1'}>
                  50-65% (Entry)
                </div>
                <div className={normalizedPercentage >= 65 && normalizedPercentage < 75 ? 'text-[#16130F] font-black bg-[#F2B705] py-1 rounded-md' : 'text-white/70 py-1'}>
                  65-75% (Merit)
                </div>
                <div className={normalizedPercentage >= 75 && normalizedPercentage < 85 ? 'text-[#16130F] font-black bg-[#F2B705] py-1 rounded-md' : 'text-white/70 py-1'}>
                  75-85% (Excellence)
                </div>
                <div className={normalizedPercentage >= 85 ? 'text-[#16130F] font-black bg-[#F2B705] py-1 rounded-md' : 'text-white/70 py-1'}>
                  85%+ (Top Merit)
                </div>
              </div>
            </div>
          </motion.div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* ADMISSION ODDS & SHORTLISTED RESULTS TABS */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="bg-white border-[3px] border-[#16130F] shadow-[7px_7px_0_#16130F] p-5 md:p-7 space-y-6" style={{ borderRadius: 24 }}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-dashed border-[#16130F]/25 pb-4">
              <div className="space-y-1">
                <p className="font-urbanist font-extrabold text-[15px] leading-none text-[#D0362E]">
                  Step 2: Shortlist Results · tumhari list taiyaar
                </p>
                <h3 className="font-urbanist text-[22px] md:text-[28px] font-black tracking-[-0.03em] leading-[1.1] text-[#16130F]">
                  Qualified Universities & Net Fees for {countryMeta.label}
                </h3>
              </div>

              {/* Strict Budget Filter Toggle */}
              <label className="flex items-center gap-2 bg-[#DDF3EF] border-2 border-[#16130F] px-3.5 py-2 text-[14px] font-bold text-[#16130F] cursor-pointer select-none shrink-0" style={{ borderRadius: 999 }}>
                <input
                  type="checkbox"
                  checked={strictBudgetFilter}
                  onChange={(e) => setStrictBudgetFilter(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-[#14837E]"
                />
                <span>Only within ₹{annualBudgetInr}L Budget</span>
              </label>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pr-1.5">
              {[
                { id: 'safe', label: 'Safe Admits', Icon: ShieldCheck, on: 'bg-[#14837E] text-white', count: evaluatedUniversities.safe.length },
                { id: 'target', label: 'Target Admits', Icon: Compass, on: 'bg-[#DE5C2B] text-white', count: evaluatedUniversities.target.length },
                { id: 'dream', label: 'Dream Reach', Icon: Target, on: 'bg-[#B8285B] text-white', count: evaluatedUniversities.dream.length },
                { id: 'scholarships', label: 'Matching Scholarships', Icon: Award, on: 'bg-[#F2B705] text-[#16130F]', count: matchingScholarships.length },
              ].map(({ id, label, Icon, on, count }) => {
                const isOn = activeResultTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveResultTab(id)}
                    className={`px-4 py-2.5 text-[14px] font-bold border-2 border-[#16130F] transition-transform flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      isOn ? `${on} shadow-[3px_3px_0_#16130F]` : 'bg-white text-[#16130F] hover:-translate-y-0.5'
                    }`}
                    style={{ borderRadius: 999 }}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[12px] font-black border ${
                      isOn ? 'bg-white text-[#16130F] border-[#16130F]' : 'bg-[#FFF6E5] text-[#16130F] border-[#16130F]/30'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ──────────────────────────────────────────────────────── */}
            {/* TAB CONTENT: UNIVERSITIES (Safe / Target / Dream) */}
            {/* ──────────────────────────────────────────────────────── */}
            {activeResultTab !== 'scholarships' && (
              <div className="space-y-6">
                {evaluatedUniversities[activeResultTab]?.length === 0 ? (
                  <div className="py-14 px-4 text-center space-y-3 bg-[#FFF6E5] border-2 border-dashed border-[#16130F]/40" style={{ borderRadius: 18 }}>
                    <BookOpen size={40} className="mx-auto text-[#16130F]/40" />
                    <p className="font-urbanist text-[17px] font-extrabold text-[#16130F]">No universities found matching these criteria and budget filter.</p>
                    {strictBudgetFilter && (
                      <button
                        onClick={() => setStrictBudgetFilter(false)}
                        className="px-4 py-2 bg-white text-[#16130F] border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] text-[14px] font-bold hover:-translate-y-0.5 transition-transform cursor-pointer"
                        style={{ borderRadius: 999 }}
                      >
                        Turn off strict budget filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {evaluatedUniversities[activeResultTab].map((uni, idx) => {
                      const isBookmarked = savedUniIds.has(uni._id || uni.name);
                      const ranking = getVerifiedRanking(uni);
                      return (
                        <div
                          key={uni._id || idx}
                          className="p-5 md:p-6 bg-white border-2 border-[#16130F] shadow-[4px_4px_0_#16130F] hover:shadow-[5px_5px_0_#DE5C2B] transition-shadow flex flex-col justify-between space-y-5"
                          style={{ borderRadius: 16 }}
                        >
                          <div className="space-y-4">
                            {/* University Header Row */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3.5 min-w-0">
                                <UniversityLogo 
                                  name={uni.name} 
                                  universityName={uni.name} 
                                  logo={uni.logo} 
                                  domain={uni.website} 
                                  size={52} 
                                  className="border-2 border-[#16130F] rounded-xl"
                                />
                                <div className="space-y-1 min-w-0">
                                  <h4 className="font-urbanist text-[17px] font-black text-[#16130F] leading-snug">
                                    {uni.name}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-wrap text-[14px] text-[#3D3830] font-semibold">
                                    <span>📍 {uni.country}</span>
                                    {ranking && (
                                      <>
                                        <span>•</span>
                                        <span title={ranking.fullLabel} className="bg-[#FFF1B8] text-[#16130F] border border-[#16130F] px-2 py-0.5 rounded-md text-[12px] font-bold">
                                          {ranking.shortLabel}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleSaveUniversity(uni)}
                                className={`p-2.5 border-2 border-[#16130F] transition-transform cursor-pointer flex-shrink-0 hover:-translate-y-0.5 ${
                                  isBookmarked ? 'bg-[#F2B705] text-[#16130F] shadow-[2px_2px_0_#16130F]' : 'bg-white text-[#16130F]'
                                }`}
                                style={{ borderRadius: 12 }}
                                title={isBookmarked ? 'Saved to Shortlist' : 'Save to Shortlist'}
                              >
                                <BookmarkCheck size={18} />
                              </button>
                            </div>

                            {/* Badges Row with plenty of breathing room */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-3 py-1.5 text-[13.5px] font-bold border-2 border-[#16130F] flex items-center gap-1.5 ${
                                activeResultTab === 'safe'
                                  ? 'bg-[#DDF3EF] text-[#16130F]'
                                  : activeResultTab === 'target'
                                  ? 'bg-[#FCE3DA] text-[#16130F]'
                                  : 'bg-[#FBD9E6] text-[#16130F]'
                              }`} style={{ borderRadius: 8 }}>
                                🎯 {uni.acceptanceOdds}% Est. Admission Odds
                              </span>

                              {/* Budget Status Badge */}
                              {uni.isWithinBudget ? (
                                <span className="px-3 py-1.5 text-[13.5px] font-bold bg-[#14837E] text-white border-2 border-[#16130F] flex items-center gap-1.5" style={{ borderRadius: 8 }}>
                                  <Check size={14} /> Fits ₹{annualBudgetInr}L Budget
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 text-[13.5px] font-bold bg-[#D0362E] text-white border-2 border-[#16130F] flex items-center gap-1.5" style={{ borderRadius: 8 }}>
                                  <AlertTriangle size={14} /> +₹{uni.budgetDiff}L Over Budget
                                </span>
                              )}
                            </div>

                            {/* Estimated Annual Fees Breakdown Box */}
                            <div className="p-4 bg-[#FFF6E5] border-2 border-[#16130F] space-y-2" style={{ borderRadius: 12 }}>
                              <div className="flex items-start justify-between gap-3 text-[14px] font-semibold text-[#3D3830]">
                                <span>Standard Base Tuition Fee:</span>
                                <span className="text-right">{countryMeta.currency}{uni.baseTuitionLocal?.toLocaleString()} / yr (₹{uni.baseTuitionInrLakh}L)</span>
                              </div>
                              <div className="flex items-start justify-between gap-3 border-t-2 border-dashed border-[#16130F]/25 pt-2">
                                <span className="text-[14px] font-black text-[#16130F]">Net Fee (After Scholarship):</span>
                                <span className="text-[15px] font-black text-[#14837E] text-right">
                                  {countryMeta.currency}{uni.netTuitionLocal?.toLocaleString()} / yr <span className="text-[13px] font-bold">(₹{uni.netTuitionInrLakh} Lakhs)</span>
                                </span>
                              </div>
                            </div>

                            {/* Scholarship Grant Highlight Banner */}
                            <div className="p-3 bg-[#FFF1B8] border-2 border-[#16130F] text-[14px] font-semibold text-[#16130F] flex items-center gap-2.5" style={{ borderRadius: 12 }}>
                              <Award size={17} className="text-[#16130F] flex-shrink-0" />
                              <span className="leading-snug">{uni.estimatedScholarship}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-dashed border-[#16130F]/20">
                            <button
                              onClick={() => setExplainingUni(uni)}
                              className="py-2.5 px-3 text-[14px] font-bold bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                              style={{ borderRadius: 999 }}
                            >
                              <Sparkles size={15} /> Explain Fit (AI 💡)
                            </button>

                            <a
                              href={cleanPortalUrl(uni.website, `${uni.name} admission portal`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2.5 px-3 text-[14px] font-bold bg-[#16130F] text-white border-2 border-[#16130F] shadow-[2px_2px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-1.5"
                              style={{ borderRadius: 999 }}
                            >
                              Official Portal <ExternalLink size={14} />
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {matchingScholarships.map((sch, sIdx) => (
                    <div
                      key={sch._id || sIdx}
                      className="p-5 md:p-6 bg-white border-2 border-[#16130F] shadow-[4px_4px_0_#F2B705] hover:shadow-[5px_5px_0_#16130F] transition-shadow space-y-4 flex flex-col justify-between"
                      style={{ borderRadius: 16 }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <span className="text-[12px] font-black uppercase tracking-wider px-3 py-1 bg-[#FFF1B8] text-[#16130F] border-2 border-[#16130F]" style={{ borderRadius: 8 }}>
                            {sch.fundingType || 'Merit Waiver'}
                          </span>
                          <span className="text-[14px] font-black text-white bg-[#14837E] px-3 py-1 border-2 border-[#16130F]" style={{ borderRadius: 8 }}>
                            {sch.grantAmountUSD ? `$${sch.grantAmountUSD.toLocaleString()}` : sch.coverage || 'Tuition Waiver'}
                          </span>
                        </div>

                        <h4 className="font-urbanist text-[17px] font-black text-[#16130F] leading-snug">{sch.name || sch.scholarshipName}</h4>
                        <p className="text-[14px] font-medium text-[#3D3830] leading-relaxed">{sch.description || sch.shortDescription}</p>
                      </div>

                      <button
                        onClick={() => setExplainingScholarship(sch)}
                        className="w-full py-2.5 bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] hover:-translate-y-0.5 text-[14px] font-bold transition-transform flex items-center justify-center gap-2 cursor-pointer mt-2"
                        style={{ borderRadius: 999 }}
                      >
                        <Sparkles size={15} /> Explain Eligibility Match (AI 💡)
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
          <div className="p-6 md:p-8 bg-[#DE5C2B] text-white border-[3px] border-[#16130F] shadow-[7px_7px_0_#16130F] flex flex-col sm:flex-row items-center justify-between gap-6" style={{ borderRadius: 24 }}>
            <div className="space-y-1.5 text-center sm:text-left">
              <p className="font-urbanist font-extrabold text-[15px] leading-none text-[#FFF1B8]">Akele mat karo, hum saath hain</p>
              <h4 className="font-urbanist text-[22px] md:text-[26px] font-black tracking-[-0.02em] leading-tight text-white">Need Free 1-on-1 Help with Applications & Grants?</h4>
              <p className="text-[15px] text-white/90 font-medium max-w-xl">
                Our certified counsellors review your profile, verify official university scholarship deadlines, and help you draft winning applications.
              </p>
            </div>

            <button
              onClick={() => openModal({ source: 'Eligibility Calculator Bottom Bar', dreamCountry: targetCountry })}
              className="h-12 px-6 bg-[#16130F] text-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#FFF6E5] hover:-translate-y-0.5 text-[15px] font-bold transition-transform flex items-center gap-2 cursor-pointer whitespace-nowrap"
              style={{ borderRadius: 999 }}
            >
              <PhoneCall size={15} /> Book Free Counselling
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

      </div>
      </div>

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#16130F]/70 print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border-[3px] border-[#16130F] shadow-[7px_7px_0_#DE5C2B]"
              style={{ borderRadius: 20 }}
            >
              {/* Modal Top Bar */}
              <div className="p-4 px-5 sm:px-6 bg-[#16130F] text-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#F2B705] border-2 border-white flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-[#16130F]" />
                  </div>
                  <div>
                    <h3 className="font-urbanist text-[16px] font-black">Official Eligibility Report Preview</h3>
                    <p className="text-[13px] text-white/75 font-medium">Verify your evaluation parameters before downloading or saving</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintReport}
                    className="px-4 py-2 bg-white text-[#16130F] border-2 border-white shadow-[3px_3px_0_#F2B705] hover:-translate-y-0.5 text-[14px] font-bold transition-transform flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    style={{ borderRadius: 999 }}
                  >
                    <Printer size={15} /> Print / Save as PDF
                  </button>
                  <button
                    onClick={() => setShowReportPreview(false)}
                    aria-label="Close report preview"
                    className="w-9 h-9 rounded-full bg-transparent border-2 border-white hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Content Scrollable Area */}
              <div className="p-4 sm:p-6 overflow-y-auto custom-modal-scrollbar bg-[#FFF6E5] flex-1">
                <div className="bg-white p-5 sm:p-8 border-2 border-[#16130F] max-w-3xl mx-auto" style={{ borderRadius: 14 }}>
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
