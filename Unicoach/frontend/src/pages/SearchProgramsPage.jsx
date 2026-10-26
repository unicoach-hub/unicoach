import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, UserCheck, X, Download, FileSpreadsheet, FileText, GitCompare, ChevronDown, ChevronUp, Info, Loader2, CheckCircle2, AlertCircle,
  Gauge, Coins, Languages, PiggyBank, Briefcase, TrendingUp, Banknote, Building2, Landmark, ClipboardCheck, MapPin, FileClock, Wallet, MicOff, GraduationCap, Award, ClipboardList, Users, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSearchConfig, getHighlights, searchCourses, evaluateEligibility, exportSearch, getCourseDetail, getUniversitiesFacet, suggest } from '../utils/searchApi';
// Excel/PDF export libraries are large; load them only when someone exports
const ExcelColumnExportModal = lazy(() => import('../components/ExcelColumnExportModal'));

const PAGE_SIZE = 20;
// UniCoach brand accent (was CourseFinder blue #226CF5). Single source of truth for the portal theme.
const BLUE = '#DE5C2B';

// CourseFinder renders a Material-Symbols icon on every quick-filter pill; map its
// icon keys (from highlights.json) to the nearest lucide equivalent for a 1:1 look.
const QUICK_ICONS = {
  speed: Gauge, paid: Coins, how_to_reg: UserCheck, dictionary: Languages, savings: PiggyBank,
  badge: Briefcase, chart_data: TrendingUp, local_atm: Banknote, attractions: Building2,
  assured_workload: Landmark, assignment_ind: ClipboardCheck, home_pin: MapPin, restore_page: FileClock,
  mintmark: Wallet, voice_over_off: MicOff, school: GraduationCap, workspace_premium: Award,
  assignment_turned_in: ClipboardCheck, assignment: ClipboardList, diversity_3: Users,
};
// CourseFinder shows the first two pills inline, the rest behind "View More".
const QUICK_INLINE = 2;

// ── helpers ──────────────────────────────────────────────────────────────────
const money = (m) => (m && m.amount ? `${m.currency || ''} ${Number(m.amount).toLocaleString()}`.trim() : '—');
const FLAG = { 1: '🇺🇸', 2: '🇦🇺', 3: '🇨🇦', 4: '🇬🇧', 5: '🇳🇿', 6: '🇸🇬', 7: '🇦🇪', 8: '🇮🇪', 9: '🇩🇪', 10: '🇫🇷', 16: '🇮🇹', 19: '🇪🇸', 25: '🇲🇾' };
const toProg = (c) => ({
  title: c.courseName, universityName: c.universityName, degreeLevel: c.degreeLevel, durationText: c.duration,
  tuitionPerYear: money(c.annualFee), applicationFee: c.applicationFee?.isWaived ? 'Waived' : money(c.applicationFee),
  intake: (c.intakes || []).join(', '), minIeltsScore: c.minIeltsScore, isStem: c.isStem,
  university: { name: c.universityName, countryName: c.countryName, city: c.city },
});
const QUALIFICATIONS = [{ value: '8', label: 'Grade 12 / equivalent' }, { value: '13', label: 'Senior Secondary (SSE)' }, { value: '1', label: 'Undergraduate degree' }, { value: '2', label: 'Postgraduate degree' }];
const GRADING = [{ value: 'OutOf100', label: 'Out of 100 (%)' }, { value: 'OutOf10', label: 'Out of 10 (CGPA)' }, { value: 'OutOf4', label: 'Out of 4 (GPA)' }, { value: 'OutOf5', label: 'Out of 5' }, { value: 'OutOf7', label: 'Out of 7' }, { value: 'OutOf45', label: 'Out of 45' }];
const ENGLISH = [{ value: 'later', label: "I'll provide this later" }, { value: 'none', label: "I don't have this yet" }, { value: 'IELTS', label: 'IELTS' }, { value: 'TOEFL', label: 'TOEFL' }, { value: 'PTE', label: 'PTE' }, { value: 'DET', label: 'Duolingo (DET)' }];

// ── small UI atoms (CourseFinder look: blue, 4px radius, Poppins/DM Sans) ─────
const Chip = ({ children, color = '#FAE5DA', text = '#6B2C17' }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium" style={{ background: color, color: text, borderRadius: 2 }}>{children}</span>
);
const Checkbox = ({ checked, onChange, label }) => (
  <label className="flex items-start gap-2 cursor-pointer text-[13px] text-slate-700 py-1">
    <input type="checkbox" checked={!!checked} onChange={onChange} className="mt-0.5 accent-[#DE5C2B] w-4 h-4" />
    <span>{label}</span>
  </label>
);
// Collapsible filter section for the CourseFinder-style left sidebar
const Accordion = ({ title, open, onToggle, children, count }) => (
  <div className="bg-white border border-slate-200" style={{ borderRadius: 4 }}>
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 text-left">
      <span className="font-['Geist',sans-serif] font-semibold text-[13.5px] text-slate-700">{title}{count ? <span className="text-slate-400 font-normal"> ({count})</span> : null}</span>
      <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="px-3 pb-3 pt-0 border-t border-slate-100">{children}</div>}
  </div>
);

const scholarshipText = (c) => (c.avgScholarship ? `${c.annualFee?.currency || ''} ${Number(c.avgScholarship).toLocaleString()}`.trim() : (c.scholarshipAvailable ? 'Available' : '—'));

// Ticket-style award tag shown on each card while browsing scholarships
const AwardTag = ({ c }) => (
  <div className="relative shrink-0 hidden sm:flex items-stretch overflow-hidden border border-[#EAD8AE] bg-[#FBF7EE]" style={{ borderRadius: 8 }}>
    <div className="grid place-items-center px-2.5 border-r border-dashed border-[#DCBF80]"><Award size={16} className="text-[#977435]" /></div>
    <div className="px-3 py-1.5 leading-tight">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#977435]">{c.avgScholarship ? 'Avg. scholarship' : 'Scholarship'}</div>
      <div className="text-[14px] font-bold text-[#4D3C21]">{c.avgScholarship ? scholarshipText(c) : 'Available'}</div>
    </div>
  </div>
);

// One-tap countries on the scholarship band (cf country ids)
const SCHOLARSHIP_COUNTRIES = [[1, 'USA'], [4, 'UK'], [3, 'Canada'], [2, 'Australia'], [8, 'Ireland'], [9, 'Germany'], [5, 'New Zealand']];

// ── Program row (CourseFinder program card) ───────────────────────────────────
const ProgramRow = ({ c, selected, onToggleSelect, onView, eligible, reasons, highlightMap = {}, scholarshipFocus = false }) => (
  <div className="bg-white border border-slate-200" style={{ borderRadius: 4 }}>
    <div className="p-4">
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={!!selected} onChange={() => onToggleSelect(c)} className="mt-1 accent-[#DE5C2B] w-4 h-4" />
        <div className="flex-1 min-w-0">
          <button onClick={() => onView(c)} className="text-left">
            <h3 className="font-['Geist',sans-serif] text-[15px] font-semibold text-[#DE5C2B] hover:underline leading-snug">{c.courseName}</h3>
          </button>
          <div className="text-[13px] text-slate-500 mt-0.5">{c.universityName} · {FLAG[c.cfCountryId] || ''} {c.countryName}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {eligible === true && <Chip color="#E1ECE3" text="#2E4836"><CheckCircle2 size={11} /> Eligible</Chip>}
            {eligible === false && <Chip color="#fee2e2" text="#b91c1c"><AlertCircle size={11} /> Non-Eligible</Chip>}
            {(c.highlightIds || []).slice(0, 3).map((id) => { const h = highlightMap[id]; return h ? <span key={id} className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-white" style={{ background: h.color || BLUE, borderRadius: 2 }}>{h.name}</span> : null; })}
          </div>
          {eligible === false && reasons?.length > 0 && (
            <ul className="mt-2 text-[12px] text-rose-700 list-disc pl-4">{reasons.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}</ul>
          )}
        </div>
        {scholarshipFocus && <AwardTag c={c} />}
        <button onClick={() => onView(c)} className="shrink-0 text-white text-[13px] font-medium px-4 py-1.5" style={{ background: BLUE, borderRadius: 4 }}>View</button>
      </div>
      {/* CourseFinder: a green "Open" status chip leads the intake chips */}
      <div className="flex flex-wrap items-center gap-1 mt-3">
        <Chip color="#ddffe5" text="#2E4836">Open</Chip>
        {(c.intakes || []).slice(0, 8).map((i) => <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px]" style={{ borderRadius: 2 }}>{i}</span>)}
      </div>
      {/* CourseFinder stat row: Duration · Tuition/yr · Application Fee · Avg. Scholarship */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100 text-[13px]">
        <div><div className="text-[11px] text-slate-400">Duration</div><div className="font-medium text-slate-700">{c.duration || '—'}</div></div>
        <div><div className="text-[11px] text-slate-400">Tuition / yr</div><div className="font-semibold text-[#DE5C2B]">{money(c.annualFee)}</div></div>
        <div><div className="text-[11px] text-slate-400">Application Fee</div><div className="font-medium text-slate-700">{c.applicationFee?.isWaived ? 'Waived' : money(c.applicationFee)}</div></div>
        <div><div className="text-[11px] text-slate-400">Avg. Scholarship</div><div className="font-medium text-slate-700">{scholarshipText(c)}</div></div>
      </div>
    </div>
  </div>
);

const SHORTLIST_KEY = 'uc_course_shortlist';

// Back pill for the details steps (Course Finder hides the site-wide floating one)
const PageBack = ({ onClick }) => (
  <button type="button" onClick={onClick} aria-label="Go back"
    className="no-shine inline-flex items-center gap-1.5 h-9 pl-3 pr-4 rounded-full bg-white border border-[#E6E0D4] text-[13.5px] font-semibold text-[#16130F] hover:border-[#16130F] transition-colors">
    <ArrowLeft size={16} strokeWidth={2.2} /> Back
  </button>
);
const INDIA_ID = '99';
// Student's state (asked like the rest of the profile; not used as a search filter yet)
const INDIA_STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'];

// Field shell for the details-first search card
const Field = ({ label, children, error }) => (
  <label className="flex flex-col gap-1.5 min-w-0">
    <span className="text-[12.5px] font-semibold text-[#16130F]">{label}</span>
    {children}
    {error && <span className="text-[11.5px] font-medium text-[#984D3D] leading-tight">{error}</span>}
  </label>
);
const FIELD_ERR = '!border-[#C97C6A] !bg-[#FBF2EF]';

// Search input with type-ahead suggestions (courses + universities) from /api/search/suggest
const SuggestBox = ({ value, onChange, onEnter, placeholder, className = '' }) => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const q = value.trim();

  useEffect(() => {
    if (q.length < 2) return undefined;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      suggest(q, ctrl.signal).then((rows) => {
        const lq = q.toLowerCase();
        // universities first, then names that start with what was typed
        const rank = (r) => (r.type === 'university' ? 0 : 2) + ((r.name || '').toLowerCase().startsWith(lq) ? 0 : 1);
        setItems([...(rows || [])].sort((a, b) => rank(a) - rank(b)).slice(0, 8));
        setHi(-1);
      }).catch(() => {});
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  const shown = open && q.length >= 2 ? items : [];
  const pick = (name) => { onChange(name); setOpen(false); };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' && shown.length) { e.preventDefault(); setHi((i) => (i + 1) % shown.length); }
    else if (e.key === 'ArrowUp' && shown.length) { e.preventDefault(); setHi((i) => (i <= 0 ? shown.length - 1 : i - 1)); }
    else if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'Enter') {
      if (hi >= 0 && shown[hi]) { e.preventDefault(); pick(shown[hi].name); }
      else { setOpen(false); onEnter && onEnter(); }
    }
  };
  const bold = (name) => {
    const i = name.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return name;
    return <>{name.slice(0, i)}<b className="font-semibold text-[#16130F]">{name.slice(i, i + q.length)}</b>{name.slice(i + q.length)}</>;
  };

  return (
    <div className="relative flex-1 min-w-0">
      <input value={value} placeholder={placeholder} autoComplete="off" role="combobox" aria-expanded={shown.length > 0} aria-autocomplete="list"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown} className={`w-full bg-transparent outline-none ${className}`} />
      {shown.length > 0 && (
        <ul role="listbox" className="absolute z-50 left-[-34px] top-[calc(100%+12px)] w-[min(460px,86vw)] bg-white border border-[#E6E0D4] shadow-[0_18px_40px_-20px_rgba(22,19,15,0.35)] py-1.5 max-h-80 overflow-y-auto" style={{ borderRadius: 12 }}>
          {shown.map((r, i) => {
            const Icon = r.type === 'university' ? Building2 : GraduationCap;
            return (
              <li key={`${r.type}-${r.name}`} role="option" aria-selected={i === hi}>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); pick(r.name); }} onMouseEnter={() => setHi(i)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13.5px] text-[#5B544A]" style={{ background: i === hi ? '#F8F5EF' : 'transparent' }}>
                  <span className="w-7 h-7 shrink-0 grid place-items-center bg-[#F8F5EF] border border-[#ECE6DA]" style={{ borderRadius: 8 }}><Icon size={14} className="text-[#16130F]" /></span>
                  <span className="flex-1 min-w-0 truncate">{bold(r.name)}</span>
                  <span className="text-[11px] uppercase tracking-wide text-[#9E9384] shrink-0">{r.type === 'university' ? 'University' : 'Course'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
const FIELD = 'w-full h-11 px-3 text-[14px] text-[#16130F] bg-[#F8F5EF] border border-[#E6E0D4] outline-none focus:border-[#DE5C2B] focus:bg-white transition-colors';

export default function SearchProgramsPage() {
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth() || {};

  const [config, setConfig] = useState(null);
  const [highlights, setHighlights] = useState([]);
  // links from the rest of the site land here with ?q=… (search text) or ?highlight=scholarship
  const [searchText, setSearchText] = useState(() => new URLSearchParams(window.location.search).get('q') || '');
  const [country, setCountry] = useState('');
  const [programLevels, setProgramLevels] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [studyAreas, setStudyAreas] = useState([]);
  const [intakeArr, setIntakeArr] = useState([]);
  const [year, setYear] = useState('');
  const [universities, setUniversities] = useState([]);  // selected cfUniversityId[]
  const [uniSearch, setUniSearch] = useState('');
  const [uniList, setUniList] = useState([]);             // faceted [{id,name,count}]
  const [tuitionMax, setTuitionMax] = useState(0);        // 0 = no cap
  const [durations, setDurations] = useState([]);
  // Details first: the landing card collects search + student details, results show after "Search".
  // Links that already carry a search (?q, ?highlight, ?check) go straight to results.
  const [started, setStarted] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return !!(p.get('q') || p.get('check'));
  });
  const [advOpen, setAdvOpen] = useState(false);
  const [tried, setTried] = useState(false); // Search pressed with required details missing
  const [startMode, setStartMode] = useState('search'); // 'search' | 'elig' (scholarship details step)
  // a ?highlight= link must wait for the quick-filter list, or the first search runs without it
  const [hlReady, setHlReady] = useState(() => !new URLSearchParams(window.location.search).get('highlight'));
  const [activeHighlights, setActiveHighlights] = useState([]);
  const [showAllQuick, setShowAllQuick] = useState(false); // "View More" quick-filter toggle (CF shows 2 inline)
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState('universities');
  const [eligOpen, setEligOpen] = useState(false);        // inline eligibility section (left sidebar)
  const [intakeOpen, setIntakeOpen] = useState(false);    // intake multi-select popover
  const [mobileFilters, setMobileFilters] = useState(false);
  const [openSec, setOpenSec] = useState({ universities: true, level: true, studyArea: false, requirements: false, tuition: true });
  const toggleSec = (k) => setOpenSec((s) => ({ ...s, [k]: !s[k] }));
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  // shortlist (cfId -> course); kept for the session so it survives the sign-in before export
  const [selected, setSelected] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SHORTLIST_KEY) || '{}') || {}; } catch { return {}; }
  });
  const [showCompare, setShowCompare] = useState(false);
  const [compareDetails, setCompareDetails] = useState({}); // cfId -> full detail (for CF-parity rows)
  const [exporting, setExporting] = useState(false);
  const [exportMenu, setExportMenu] = useState(false);
  const [columnModal, setColumnModal] = useState(null); // { format: 'excel'|'pdf', scope: 'all'|'top25'|'selected' } | null

  useEffect(() => {
    try { sessionStorage.setItem(SHORTLIST_KEY, JSON.stringify(selected)); } catch { /* private mode */ }
  }, [selected]);

  // eligibility
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState({ nationalityId: INDIA_ID, stateName: '', highestQualificationId: '', gradingSystem: 'OutOf100', score: '', englishExam: 'later', backlogs: '', workExperience: '' });
  const [eligResult, setEligResult] = useState(null);
  const [eligBucket, setEligBucket] = useState('eligible');
  const [eligLoading, setEligLoading] = useState(false);

  // open the eligibility modal when arriving from the sidebar (?check=eligibility)
  useEffect(() => {
    if (searchParams.get('check') === 'eligibility') {
      setEligOpen(true);
      searchParams.delete('check');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // faceted Universities list for the sidebar (re-facets as other filters change)
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      getUniversitiesFacet({ ...filters, university: undefined }, uniSearch)
        .then((rows) => { if (!cancelled) setUniList(rows); }).catch(() => {});
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniSearch, searchText, country, programLevels, requirements, intakeArr, studyAreas, activeHighlights, tuitionMax]);

  // when Compare opens, pull full detail for each selected program (deposit, website,
  // test scores, deadline, scholarship, ranking) so the table matches CourseFinder 1:1
  useEffect(() => {
    if (!showCompare) return;
    const ids = Object.keys(selected).filter((id) => !compareDetails[id]);
    if (!ids.length) return;
    let cancelled = false;
    Promise.all(ids.map((id) => getCourseDetail(id).then((d) => [id, d]).catch(() => [id, null])))
      .then((pairs) => { if (!cancelled) setCompareDetails((prev) => ({ ...prev, ...Object.fromEntries(pairs) })); });
    return () => { cancelled = true; };
  }, [showCompare, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = 'Course Finder | UniCoach';
    window.scrollTo(0, 0);
    // load CourseFinder-style fonts for this portal
    getSearchConfig().then(setConfig).catch(() => {});
    getHighlights().then((all) => {
      // drop filters that name another company's own service (e.g. "GS approval with KC")
      const hs = (all || []).filter((h) => !/\bKC\b/.test(h.name || ''));
      setHighlights(hs);
      const want = new URLSearchParams(window.location.search).get('highlight');
      const match = want && (hs || []).find((h) => new RegExp(want, 'i').test(h.name));
      if (match) setActiveHighlights([match.id]);
    }).catch(() => {}).finally(() => setHlReady(true));
  }, []);

  const highlightMap = useMemo(() => Object.fromEntries((highlights || []).map((h) => [h.id, h])), [highlights]);
  const filters = useMemo(() => ({
    searchText: searchText || undefined,
    country: country ? [Number(country)] : undefined,
    programLevel: programLevels.length ? programLevels : undefined,
    requirements: requirements.length ? requirements : undefined,
    intake: intakeArr.length ? intakeArr : undefined,
    highlights: activeHighlights.length ? activeHighlights : undefined,
    studyArea: studyAreas.length ? studyAreas : undefined,
    university: universities.length ? universities : undefined,
    tuitionMax: tuitionMax > 0 ? tuitionMax : undefined,
    duration: durations.length ? durations : undefined,
  }), [searchText, country, programLevels, requirements, intakeArr, activeHighlights, studyAreas, universities, tuitionMax, durations]);

  const profilePayload = useMemo(() => ({
    nationalityId: Number(profile.nationalityId) || undefined, highestQualificationId: profile.highestQualificationId || undefined,
    gradingSystem: profile.gradingSystem, score: profile.score === '' ? undefined : Number(profile.score),
    englishExam: profile.englishExam, backlogs: profile.backlogs === '' ? undefined : Number(profile.backlogs),
    workExperience: profile.workExperience === '' ? undefined : Number(profile.workExperience),
  }), [profile]);

  const runSearch = (toPage = 1) => {
    setEligResult(null); setLoading(true); setPage(toPage);
    searchCourses(filters, { sort, page: toPage, pageSize: PAGE_SIZE })
      .then(setResult).catch(() => setResult({ data: [], total: 0, totalPages: 0, highlightCounts: {} })).finally(() => setLoading(false));
  };
  const runEligibility = (bucket = 'eligible', toPage = 1) => {
    setEligLoading(true); setEligBucket(bucket);
    evaluateEligibility(filters, profilePayload, { bucket, page: toPage, pageSize: PAGE_SIZE })
      .then(setEligResult).catch(() => setEligResult({ counts: { eligible: 0, nonEligible: 0 }, data: [], total: 0 })).finally(() => setEligLoading(false));
  };
  useEffect(() => {
    if (eligResult) { runEligibility(eligBucket, 1); return; }
    if (result) runSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, programLevels, requirements, intakeArr, activeHighlights, studyAreas, universities, tuitionMax, durations, sort]);

  // First search runs when the page moves to results: links that already carry a search,
  // "Search" on the details card, or a quick filter tap (no sign-in needed to browse)
  useEffect(() => {
    if (!started || !hlReady || result || eligResult) return;
    if (startMode === 'elig') runEligibility('eligible', 1);
    else runSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, hlReady]);

  const leavePage = () => {
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate('/');
  };
  // results -> back to the details step, keeping everything they picked
  const backToDetails = () => { setStarted(false); setResult(null); setEligResult(null); window.scrollTo(0, 0); };

  const startSearch = () => {
    setIntakeOpen(false);
    setStarted(true);
    window.scrollTo(0, 0);
  };

  const toggleHighlight = (id) => setActiveHighlights((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const toggleArr = (setter) => (val) => setter((a) => (a.includes(val) ? a.filter((x) => x !== val) : [...a, val]));
  const toggleSelect = (c) => setSelected((s) => { const n = { ...s }; if (n[c.cfId]) delete n[c.cfId]; else n[c.cfId] = c; return n; });
  const selectedList = Object.values(selected);
  const openCourse = (c) => navigate(`/program/${c.cfId}`);
  const clearAll = () => {
    setSearchText(''); setCountry(''); setProgramLevels([]); setRequirements([]); setStudyAreas([]);
    setIntakeArr([]); setYear(''); setUniversities([]); setUniSearch(''); setTuitionMax(0); setDurations([]);
    setActiveHighlights([]); setEligResult(null);
  };

  // Open the column-checklist modal for a given format + scope; the actual export runs on confirm.
  // Searching and shortlisting are free; downloading needs a free account. After sign-in the picker opens straight away.
  const openExport = (format, scope) => {
    setExportMenu(false);
    if (!user) {
      if (openLoginModal) openLoginModal({ onSuccess: () => setColumnModal({ format, scope }) });
      return;
    }
    setColumnModal({ format, scope });
  };

  const fetchScopeData = async (scope) => {
    if (scope === 'selected') return selectedList.map(toProg);
    const r = await exportSearch(filters);
    const data = r.data || [];
    return scope === 'top25' ? data.slice(0, 25) : data;
  };

  // Called by the checklist modal with the user's chosen column keys.
  const runColumnExport = async (selectedKeys) => {
    if (!columnModal) return;
    const { format, scope } = columnModal;
    setExporting(true);
    try {
      const data = await fetchScopeData(scope);
      if (!data || data.length === 0) { alert('No programs to export.'); return; }
      const stamp = Date.now();
      const base = scope === 'top25' ? 'Top25' : scope === 'selected' ? 'Selected' : 'Programs';
      if (format === 'pdf') {
        const title = base === 'Top25' ? 'Top 25 Programs' : base === 'Selected' ? 'Selected Programs' : 'Program Shortlist';
        const { exportSelectedProgramsToPdf } = await import('../utils/pdfExporter');
        await exportSelectedProgramsToPdf(data, { filename: `UniCoach_${base}_${stamp}.pdf`, title, selectedColumnKeys: selectedKeys });
      } else {
        const { exportSelectedProgramsToExcel } = await import('../utils/excelExporter');
        exportSelectedProgramsToExcel(data, { filename: `UniCoach_${base}_${stamp}.xlsx`, selectedColumnKeys: selectedKeys });
      }
    } catch { alert('Export failed. Please try again.'); }
    finally { setExporting(false); }
  };

  const countryOpts = (config?.countries || []);
  const levelOpts = (config?.programLevels || []);
  const reqOpts = (config?.requirements || []);
  const studyAreaOpts = (config?.studyAreas || []);
  const intakeOpts = (config?.intakes || []);
  const nationalities = (config?.studentCountries || []);
  const eligActive = !!eligResult;
  const durationOpts = (config?.durations || []);
  const advCount = programLevels.length + requirements.length + studyAreas.length + durations.length + (country ? 1 : 0) + (tuitionMax ? 1 : 0);

  // Advanced search panel: shared by the details step and the results bar (results refresh as filters change)
  const advancedPanel = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div>
      <h3 className="text-[14px] font-semibold text-[#16130F] mb-2">Program level</h3>
      <div className="max-h-[320px] overflow-y-auto pr-1">
        {levelOpts.map((l) => <Checkbox key={l.value} checked={programLevels.includes(Number(l.value))} onChange={() => toggleArr(setProgramLevels)(Number(l.value))} label={l.label} />)}
      </div>
    </div>
    <div className="space-y-4 md:border-x md:border-[#ECE6DA] md:px-6">
      <h3 className="text-[14px] font-semibold text-[#16130F]">Other filters</h3>
      <Field label="Country">
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={FIELD} style={{ borderRadius: 10 }}>
          <option value="">All countries</option>
          {countryOpts.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </Field>
      <div>
        <span className="text-[12.5px] font-semibold text-[#16130F]">Study area</span>
        <div className="mt-1.5 max-h-40 overflow-y-auto pr-1 border border-[#E6E0D4] px-2" style={{ borderRadius: 10 }}>
          {studyAreaOpts.map((a) => <Checkbox key={a.value} checked={studyAreas.includes(Number(a.value))} onChange={() => toggleArr(setStudyAreas)(Number(a.value))} label={a.label} />)}
        </div>
      </div>
      <div>
        <span className="text-[12.5px] font-semibold text-[#16130F]">Duration</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {durationOpts.map((d) => {
            const on = durations.includes(Number(d.value));
            return <button key={d.value} type="button" onClick={() => toggleArr(setDurations)(Number(d.value))} className="px-3 py-1.5 text-[12.5px] border transition-colors" style={{ borderRadius: 999, background: on ? '#16130F' : '#fff', color: on ? '#fff' : '#5B544A', borderColor: on ? '#16130F' : '#E6E0D4' }}>{d.label}</button>;
          })}
        </div>
      </div>
      <div>
        <span className="text-[12.5px] font-semibold text-[#16130F]">Max tuition / year (country currency)</span>
        <input type="range" min={0} max={100000} step={1000} value={tuitionMax} onChange={(e) => setTuitionMax(Number(e.target.value))} className="w-full accent-[#DE5C2B] mt-2" />
        <div className="text-[12.5px] text-[#5B544A]">{tuitionMax === 0 ? 'Any' : `Up to ${tuitionMax.toLocaleString()}`}</div>
      </div>
    </div>
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-semibold text-[#16130F]">Requirements</h3>
        {advCount > 0 && <button onClick={clearAll} className="text-[12.5px] font-semibold text-[#DE5C2B]">Clear all</button>}
      </div>
      <div className="max-h-[320px] overflow-y-auto pr-1">
        {reqOpts.map((r) => <Checkbox key={r.value} checked={requirements.includes(Number(r.value))} onChange={() => toggleArr(setRequirements)(Number(r.value))} label={r.label} />)}
      </div>
    </div>
  </div>
  );
  const scholarshipId = highlights.find((h) => /scholarship/i.test(h.name))?.id;
  const schMode = !!scholarshipId && activeHighlights.includes(scholarshipId);

  // ── STEP 1 (scholarships): ask what decides eligibility, then show only awards they qualify for ──
  const wantsScholarship = schMode || /scholar/i.test(searchParams.get('highlight') || '');
  const profileReady = !!(profile.nationalityId && profile.highestQualificationId && profile.score !== '');
  if (!started && wantsScholarship) {
    const findScholarships = () => {
      if (scholarshipId && !activeHighlights.includes(scholarshipId)) setActiveHighlights((a) => [...a, scholarshipId]);
      setStartMode(profileReady ? 'elig' : 'search');
      setIntakeOpen(false);
      setStarted(true);
      window.scrollTo(0, 0);
    };
    const showAll = () => { setStartMode('search'); setStarted(true); window.scrollTo(0, 0); };
    const set = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }));
    return (
      <div className="min-h-screen pt-[76px] pb-20 font-['Geist',sans-serif]" style={{ background: '#F6F3EC' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="pt-5"><PageBack onClick={leavePage} /></div>
          <div className="text-center pt-4 sm:pt-6">
            <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#977435]"><Award size={15} /> Scholarships</p>
            <h1 className="mt-3 font-outfit text-[30px] sm:text-[44px] font-black tracking-[-0.035em] leading-[1.05] text-[#16130F]">Find scholarships you qualify for</h1>
            <p className="mt-3 text-[15px] sm:text-[17px] text-[#5B544A]">30,000+ programs offer an award. Tell us about you and we&apos;ll show only the ones you can get.</p>
          </div>

          <div className="mt-8 bg-white border border-[#EAD8AE] shadow-[0_24px_60px_-36px_rgba(77,60,33,0.4)] overflow-hidden" style={{ borderRadius: 18 }}>
            {/* 1. what they want */}
            <div className="p-5 sm:p-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#977435]">1 · What you want to study</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Country">
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className={FIELD} style={{ borderRadius: 10 }}>
                    <option value="">Any country</option>
                    {countryOpts.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Program level">
                  <select value={programLevels[0] ?? ''} onChange={(e) => setProgramLevels(e.target.value ? [Number(e.target.value)] : [])} className={FIELD} style={{ borderRadius: 10 }}>
                    <option value="">Any level</option>
                    {levelOpts.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </Field>
                <Field label="Intake">
                  <div className="relative">
                    <button type="button" onClick={() => setIntakeOpen((v) => !v)} className={`${FIELD} flex items-center justify-between gap-2 text-left`} style={{ borderRadius: 10 }}>
                      <span className="truncate">{intakeArr.length ? intakeArr.join(', ') : 'Any intake'}</span><ChevronDown size={15} className="text-[#5B544A] shrink-0" />
                    </button>
                    {intakeOpen && (
                      <div className="absolute z-30 mt-1 w-full min-w-[200px] bg-white border border-[#E6E0D4] shadow-lg p-2 max-h-64 overflow-y-auto" style={{ borderRadius: 10 }}>
                        {intakeOpts.map((i) => <Checkbox key={i.value} checked={intakeArr.includes(i.value)} onChange={() => toggleArr(setIntakeArr)(i.value)} label={i.label} />)}
                      </div>
                    )}
                  </div>
                </Field>
                <Field label="Subject or program (optional)">
                  <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="e.g. Data Science" className={FIELD} style={{ borderRadius: 10 }} />
                </Field>
              </div>
            </div>

            {/* 2. their profile (what scholarship eligibility is checked against) */}
            <div className="p-5 sm:p-6 border-t border-dashed border-[#EAD8AE]" style={{ background: '#FBF7EE' }}>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#977435]">2 · About you</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Nationality *">
                  <select value={profile.nationalityId} onChange={(e) => setProfile((p) => ({ ...p, nationalityId: e.target.value, stateName: '' }))} className={FIELD} style={{ borderRadius: 10 }}>
                    <option value="">Select</option>
                    {nationalities.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                </Field>
                <Field label="State">
                  <select value={profile.stateName} disabled={String(profile.nationalityId) !== INDIA_ID} onChange={set('stateName')} className={`${FIELD} disabled:opacity-50`} style={{ borderRadius: 10 }}>
                    <option value="">{String(profile.nationalityId) === INDIA_ID ? 'Select state' : 'Not needed'}</option>
                    {INDIA_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </Field>
                <Field label="Highest qualification *">
                  <select value={profile.highestQualificationId} onChange={set('highestQualificationId')} className={FIELD} style={{ borderRadius: 10 }}>
                    <option value="">Select</option>
                    {QUALIFICATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="English test">
                  <select value={profile.englishExam} onChange={set('englishExam')} className={FIELD} style={{ borderRadius: 10 }}>
                    {ENGLISH.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Grading system">
                  <select value={profile.gradingSystem} onChange={set('gradingSystem')} className={FIELD} style={{ borderRadius: 10 }}>
                    {GRADING.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Your score *">
                  <input type="number" inputMode="decimal" value={profile.score} onChange={set('score')} placeholder="e.g. 72" className={FIELD} style={{ borderRadius: 10 }} />
                </Field>
                <Field label="Backlogs">
                  <input type="number" inputMode="numeric" value={profile.backlogs} onChange={set('backlogs')} placeholder="0" className={FIELD} style={{ borderRadius: 10 }} />
                </Field>
                <Field label="Work experience (years)">
                  <input type="number" inputMode="numeric" value={profile.workExperience} onChange={set('workExperience')} placeholder="0" className={FIELD} style={{ borderRadius: 10 }} />
                </Field>
              </div>
            </div>

            <div className="p-5 sm:p-6 border-t border-[#EAD8AE] flex flex-col sm:flex-row items-center gap-3">
              <p className="text-[12.5px] text-[#614A26] sm:mr-auto">{profileReady ? "We'll check every award against your profile." : 'Fill the * fields to see only awards you qualify for.'}</p>
              <button onClick={showAll} className="text-[13.5px] font-semibold text-[#977435] hover:underline">Skip, show all scholarships</button>
              <button onClick={findScholarships} className="h-11 px-6 inline-flex items-center justify-center gap-2 text-white text-[14px] font-semibold bg-[#16130F] hover:bg-[#DE5C2B] transition-colors" style={{ borderRadius: 10 }}>
                <Award size={16} /> Find my scholarships
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 1: details first (search + student details, advanced filters, quick filters) ──
  if (!started) {
    // Required before searching: something to search for, nationality, and state for Indian students
    const needsState = String(profile.nationalityId) === INDIA_ID;
    const missing = {
      query: !(searchText.trim() || intakeArr.length || advCount || activeHighlights.length),
      nationality: !profile.nationalityId,
      state: needsState && !profile.stateName,
    };
    const blocked = missing.query || missing.nationality || missing.state;
    const trySearch = () => { if (blocked) { setTried(true); return; } setTried(false); startSearch(); };
    const err = (k) => tried && missing[k];
    return (
      <div className="min-h-screen pt-[76px] pb-20 font-['Geist',sans-serif]" style={{ background: '#F6F3EC' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="pt-5"><PageBack onClick={leavePage} /></div>
          <div className="text-center pt-4 sm:pt-6">
            <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#86351A]"><span className="w-6 h-[2px] bg-[#DE5C2B]" /> Course Finder</p>
            <h1 className="mt-3 font-outfit text-[32px] sm:text-[46px] font-black tracking-[-0.035em] leading-[1.05] text-[#16130F]">Explore 98,000+ programs</h1>
            <p className="mt-3 text-[15px] sm:text-[17px] text-[#5B544A]">Tell us a little about you, then search. Free to search and shortlist, sign in only to download.</p>
          </div>

          {/* Search card */}
          <div className="mt-8 bg-white border border-[#E6E0D4] shadow-[0_24px_60px_-36px_rgba(22,19,15,0.35)] p-4 sm:p-5" style={{ borderRadius: 18 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1.2fr_0.7fr_1.1fr_1.1fr_auto] gap-3 items-start">
              <Field label="Search programs *" error={err('query') && 'Type a program or university, or pick a filter below'}>
                <div className={`${FIELD} ${err('query') ? FIELD_ERR : ''} flex items-center gap-2`} style={{ borderRadius: 10 }}>
                  <Search size={16} className="text-[#5B544A] shrink-0" />
                  <SuggestBox value={searchText} onChange={setSearchText} onEnter={trySearch} placeholder="Program or university" />
                </div>
              </Field>
              <Field label="Intake">
                <div className="relative">
                  <button type="button" onClick={() => setIntakeOpen((v) => !v)} className={`${FIELD} flex items-center justify-between gap-2 text-left`} style={{ borderRadius: 10 }}>
                    <span className="truncate">{intakeArr.length ? intakeArr.join(', ') : 'All intakes'}</span><ChevronDown size={15} className="text-[#5B544A] shrink-0" />
                  </button>
                  {intakeOpen && (
                    <div className="absolute z-30 mt-1 w-full min-w-[200px] bg-white border border-[#E6E0D4] shadow-lg p-2 max-h-64 overflow-y-auto" style={{ borderRadius: 10 }}>
                      {intakeOpts.map((i) => <Checkbox key={i.value} checked={intakeArr.includes(i.value)} onChange={() => toggleArr(setIntakeArr)(i.value)} label={i.label} />)}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Year">
                <select value={year} onChange={(e) => setYear(e.target.value)} className={FIELD} style={{ borderRadius: 10 }}>
                  <option value="">Any</option>
                  {(config?.years || []).map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
                </select>
              </Field>
              <Field label="Your nationality *" error={err('nationality') && 'Required'}>
                <select value={profile.nationalityId} onChange={(e) => setProfile((p) => ({ ...p, nationalityId: e.target.value, stateName: '' }))} className={`${FIELD} ${err('nationality') ? FIELD_ERR : ''}`} style={{ borderRadius: 10 }}>
                  <option value="">Select</option>
                  {nationalities.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </Field>
              <Field label={needsState ? 'Your state *' : 'Your state'} error={err('state') && 'Required'}>
                <select value={profile.stateName} disabled={!needsState} onChange={(e) => setProfile((p) => ({ ...p, stateName: e.target.value }))} className={`${FIELD} ${err('state') ? FIELD_ERR : ''} disabled:opacity-50`} style={{ borderRadius: 10 }}>
                  <option value="">{String(profile.nationalityId) === INDIA_ID ? 'Select state' : 'Not needed'}</option>
                  {INDIA_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </Field>
              <button onClick={trySearch} className="h-11 px-6 inline-flex items-center justify-center gap-2 text-white text-[14px] font-semibold bg-[#16130F] hover:bg-[#DE5C2B] transition-colors self-start lg:mt-[26px]" style={{ borderRadius: 10 }}>
                <Search size={16} /> Search
              </button>
            </div>

            {/* Advanced search */}
            <div className="flex items-center justify-center mt-4">
              <button onClick={() => setAdvOpen((v) => !v)} className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#DE5C2B] px-4 py-2 border border-[#F3C9B4] hover:bg-[#FDF4EF]" style={{ borderRadius: 999 }}>
                Advanced search{advCount ? ` · ${advCount}` : ''} {advOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>
            {advOpen && <div className="mt-4 pt-5 border-t border-[#ECE6DA]">{advancedPanel}</div>}
          </div>

          {/* Quick filters: tap to add, then Search */}
          {highlights.length > 0 && (
            <div className="mt-6 bg-white/70 border border-[#E6E0D4] p-4 sm:p-5" style={{ borderRadius: 18 }}>
              <p className="text-[13.5px] font-semibold text-[#16130F] mb-3">Quick filters <span className="font-normal text-[#5B544A]">· tap to add, then press Search</span></p>
              <div className="flex flex-wrap gap-2">
                {highlights.map((h) => {
                  const Icon = QUICK_ICONS[h.icon] || Tag;
                  const on = activeHighlights.includes(h.id);
                  return (
                    <button key={h.id} type="button" title={h.description}
                      aria-pressed={on} onClick={() => toggleHighlight(h.id)}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 border transition-colors hover:border-[#16130F]"
                      style={{ borderRadius: 999, background: on ? '#16130F' : '#fff', borderColor: on ? '#16130F' : '#E6E0D4', color: on ? '#fff' : '#16130F' }}>
                      <Icon size={14} /> {h.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-[76px] pb-28 font-['Geist',sans-serif]">
      {/* Top search bar (CourseFinder: search • intake • year • nationality • state) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row gap-2">
            <button type="button" onClick={backToDetails} aria-label="Back to your details"
              className="no-shine self-start lg:self-auto inline-flex items-center gap-1.5 h-[42px] pl-3 pr-4 rounded-full bg-white border border-[#E6E0D4] text-[13.5px] font-semibold text-[#16130F] hover:border-[#16130F] transition-colors shrink-0">
              <ArrowLeft size={16} strokeWidth={2.2} /> Back
            </button>
            <div className="flex-1 flex items-center gap-2 border border-slate-200 px-3 bg-white" style={{ borderRadius: 4 }}>
              <Search size={18} className="text-slate-400" />
              <SuggestBox value={searchText} onChange={setSearchText} onEnter={() => runSearch(1)} placeholder="Search Program / University" className="py-2.5 text-[14px]" />
            </div>
            {/* Intake (multi) */}
            <div className="relative">
              <button onClick={() => setIntakeOpen((v) => !v)} className="w-full lg:w-auto border border-slate-200 px-3 py-2.5 text-[14px] text-slate-700 bg-white flex items-center gap-2 justify-between" style={{ borderRadius: 4, minWidth: 130 }}>
                {intakeArr.length ? `${intakeArr.length} Intake${intakeArr.length > 1 ? 's' : ''}` : 'All Intakes'} <ChevronDown size={15} className="text-slate-400" />
              </button>
              {intakeOpen && (
                <div className="absolute z-30 mt-1 bg-white border border-slate-200 shadow-lg p-2 max-h-64 overflow-y-auto" style={{ borderRadius: 4, minWidth: 180 }}>
                  {intakeOpts.map((i) => <Checkbox key={i.value} checked={intakeArr.includes(i.value)} onChange={() => toggleArr(setIntakeArr)(i.value)} label={i.label} />)}
                </div>
              )}
            </div>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="border border-slate-200 px-3 py-2.5 text-[14px] text-slate-700 bg-white" style={{ borderRadius: 4 }}>
              <option value="">Year</option>
              {(config?.years || []).map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
            <select value={profile.nationalityId} onChange={(e) => setProfile((p) => ({ ...p, nationalityId: e.target.value }))} className="border border-slate-200 px-3 py-2.5 text-[14px] text-slate-700 bg-white max-w-[180px]" style={{ borderRadius: 4 }}>
              <option value="">Student's Nationality</option>
              {nationalities.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
            <button onClick={() => runSearch(1)} className="text-white text-[14px] font-semibold px-6 py-2.5" style={{ background: BLUE, borderRadius: 4 }}>Search</button>
            <button onClick={clearAll} className="text-[14px] font-medium px-4 py-2.5 border text-slate-600 border-slate-200 whitespace-nowrap" style={{ borderRadius: 4 }}>Clear All</button>
          </div>
          <div className="flex justify-center mt-2.5">
            <button onClick={() => setAdvOpen((v) => !v)} aria-expanded={advOpen} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#DE5C2B] px-4 py-1.5 border border-[#F3C9B4] hover:bg-[#FDF4EF]" style={{ borderRadius: 999 }}>
              Advanced search{advCount ? ` · ${advCount}` : ''} {advOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
          {advOpen && <div className="mt-3 pt-4 pb-2 border-t border-[#ECE6DA]">{advancedPanel}</div>}
        </div>
      </div>

      {/* Body: left filter sidebar + results */}
      <div className="max-w-7xl mx-auto px-4 mt-4 flex gap-5 items-start">
        <aside className={`${mobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-[290px] shrink-0 space-y-3`}>
          <div className="bg-white border border-slate-200 px-3 py-2.5 flex items-center gap-2 font-['Geist',sans-serif] font-semibold text-[14px] text-slate-700" style={{ borderRadius: 4 }}>
            <SlidersHorizontal size={16} color={BLUE} /> Filter
          </div>

          {/* Eligibility (inline) */}
          <Accordion title="Eligibility" open={eligOpen} onToggle={() => setEligOpen((v) => !v)}>
            <div className="space-y-2 pt-2 text-[13px]">
              {[["Student's Nationality *", 'nationalityId', nationalities], ['Highest Qualification *', 'highestQualificationId', QUALIFICATIONS], ['Grading System *', 'gradingSystem', GRADING], ['English Proficiency *', 'englishExam', ENGLISH]].map(([label, key, opts]) => (
                <label key={key} className="flex flex-col gap-1"><span className="text-slate-500">{label}</span>
                  <select value={profile[key]} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} className="border border-slate-200 px-2 py-2 bg-white" style={{ borderRadius: 4 }}>
                    {!['gradingSystem', 'englishExam'].includes(key) && <option value="">Select</option>}
                    {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select></label>
              ))}
              {[['Score *', 'score'], ['Backlogs', 'backlogs'], ['Work Experience (Years)', 'workExperience']].map(([label, key]) => (
                <label key={key} className="flex flex-col gap-1"><span className="text-slate-500">{label}</span>
                  <input type="number" value={profile[key]} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} className="border border-slate-200 px-2 py-2" style={{ borderRadius: 4 }} /></label>
              ))}
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setProfile({ nationalityId: '', highestQualificationId: '', gradingSystem: 'OutOf100', score: '', englishExam: 'later', backlogs: '', workExperience: '' }); setEligResult(null); }} className="flex-1 px-3 py-2 text-[13px] text-slate-600 border border-slate-200" style={{ borderRadius: 4 }}>Reset</button>
                <button disabled={!profile.nationalityId || !profile.highestQualificationId || profile.score === ''} onClick={() => runEligibility('eligible', 1)} className="flex-1 px-3 py-2 text-[13px] font-semibold text-white disabled:opacity-40" style={{ background: BLUE, borderRadius: 4 }}>Apply</button>
              </div>
            </div>
          </Accordion>

          {/* Universities (searchable, with counts) */}
          <Accordion title="Universities" open={openSec.universities} onToggle={() => toggleSec('universities')} count={universities.length || null}>
            <div className="pt-2">
              <input value={uniSearch} onChange={(e) => setUniSearch(e.target.value)} placeholder="Search university…" className="w-full border border-slate-200 px-2 py-1.5 text-[13px] mb-2" style={{ borderRadius: 4 }} />
              <div className="max-h-64 overflow-y-auto pr-1">
                {uniList.length === 0 ? <div className="text-[12px] text-slate-400 py-2">No universities.</div>
                  : uniList.map((u) => <Checkbox key={u.id} checked={universities.includes(u.id)} onChange={() => toggleArr(setUniversities)(u.id)} label={`${u.name} (${u.count})`} />)}
              </div>
            </div>
          </Accordion>

          {/* Program Level */}
          <Accordion title="Program Level" open={openSec.level} onToggle={() => toggleSec('level')} count={programLevels.length || null}>
            <div className="max-h-64 overflow-y-auto pr-1 pt-2">
              {levelOpts.map((l) => <Checkbox key={l.value} checked={programLevels.includes(Number(l.value))} onChange={() => toggleArr(setProgramLevels)(Number(l.value))} label={l.label} />)}
            </div>
          </Accordion>

          {/* Study Area */}
          <Accordion title="Study Area" open={openSec.studyArea} onToggle={() => toggleSec('studyArea')} count={studyAreas.length || null}>
            <div className="max-h-64 overflow-y-auto pr-1 pt-2">
              {studyAreaOpts.map((s) => <Checkbox key={s.value} checked={studyAreas.includes(Number(s.value))} onChange={() => toggleArr(setStudyAreas)(Number(s.value))} label={s.label} />)}
            </div>
          </Accordion>

          {/* Requirements */}
          <Accordion title="Requirements" open={openSec.requirements} onToggle={() => toggleSec('requirements')} count={requirements.length || null}>
            <div className="max-h-64 overflow-y-auto pr-1 pt-2">
              {reqOpts.map((r) => <Checkbox key={r.value} checked={requirements.includes(Number(r.value))} onChange={() => toggleArr(setRequirements)(Number(r.value))} label={r.label} />)}
            </div>
          </Accordion>

          {/* Tuition Fees slider */}
          <Accordion title="Tuition Fees (as per Country's Currency)" open={openSec.tuition} onToggle={() => toggleSec('tuition')}>
            <div className="pt-3">
              <input type="range" min={0} max={100000} step={1000} value={tuitionMax} onChange={(e) => setTuitionMax(Number(e.target.value))} className="w-full accent-[#DE5C2B]" />
              <div className="text-[12.5px] text-slate-600 mt-1">{tuitionMax === 0 ? 'Any' : tuitionMax >= 100000 ? 'Above 100,000' : `Up to ${tuitionMax.toLocaleString()}`}</div>
            </div>
          </Accordion>
        </aside>

        {/* Right: results */}
        <main className="flex-1 min-w-0">
        {/* Scholarship band: shown while browsing scholarship programs */}
        {schMode && (
          <section className="relative overflow-hidden mb-4 border border-[#EAD8AE] p-5 sm:p-6" style={{ borderRadius: 16, background: 'linear-gradient(120deg, #FBF7EE 0%, #F5ECD6 100%)' }}>
            {/* certificate-style inner border and seal */}
            <div className="absolute inset-2 border border-dashed border-[#DCBF80]/70 pointer-events-none" style={{ borderRadius: 12 }} />
            <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full border-[6px] border-[#DCBF80]/40 grid place-items-center pointer-events-none">
              <Award size={46} className="text-[#CBA55B]/50" />
            </div>
            <div className="relative">
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#977435]">Scholarships</p>
              <h2 className="mt-1 font-outfit text-[22px] sm:text-[28px] font-black tracking-[-0.02em] text-[#2A2011] leading-tight">
                {eligActive ? <>{eligResult.counts.eligible?.toLocaleString()} scholarship programs you qualify for</>
                  : result ? <>{result.total?.toLocaleString()} programs offer a scholarship</> : 'Programs that offer a scholarship'}
              </h2>
              <p className="mt-1.5 text-[13.5px] text-[#614A26] max-w-xl">Merit, early-bird and bursary awards. The average award is shown on each program, so you can compare before you apply.</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] font-semibold text-[#614A26] mr-1">Country:</span>
                <button onClick={() => setCountry('')} className="px-3 py-1.5 text-[12.5px] font-medium border transition-colors" style={{ borderRadius: 999, background: !country ? '#4D3C21' : '#fff', color: !country ? '#fff' : '#4D3C21', borderColor: !country ? '#4D3C21' : '#EAD8AE' }}>All</button>
                {SCHOLARSHIP_COUNTRIES.map(([id, name]) => {
                  const on = String(country) === String(id);
                  return <button key={id} onClick={() => setCountry(on ? '' : String(id))} className="px-3 py-1.5 text-[12.5px] font-medium border transition-colors" style={{ borderRadius: 999, background: on ? '#4D3C21' : '#fff', color: on ? '#fff' : '#4D3C21', borderColor: on ? '#4D3C21' : '#EAD8AE' }}>{FLAG[id]} {name}</button>;
                })}
                <button onClick={() => { setEligOpen(true); setMobileFilters(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#16130F] hover:bg-[#DE5C2B] transition-colors" style={{ borderRadius: 999 }}>
                  <UserCheck size={15} /> Check what I qualify for
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Quick filter pills — CourseFinder shows "Quick Filters:" + 2 inline pills + "View More" */}
        {highlights.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 pb-1">
            <span className="text-[13px] font-semibold shrink-0" style={{ color: BLUE }}>Quick Filters:</span>
            {(showAllQuick ? highlights : highlights.slice(0, QUICK_INLINE)).map((h) => {
              const active = activeHighlights.includes(h.id);
              const count = result?.highlightCounts?.[h.id];
              const Icon = QUICK_ICONS[h.icon] || Tag;
              return (
                <button key={h.id} onClick={() => toggleHighlight(h.id)} className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 border transition-colors"
                  style={{ borderRadius: 4, background: active ? BLUE : '#fff', color: active ? '#fff' : '#334155', borderColor: active ? BLUE : '#e2e8f0' }}>
                  <Icon size={14} /> {h.name}{count != null && ` (${count})`}
                </button>
              );
            })}
            {highlights.length > QUICK_INLINE && (
              <button onClick={() => setShowAllQuick((v) => !v)} className="shrink-0 text-[13px] font-semibold hover:underline" style={{ color: BLUE }}>
                {showAllQuick ? 'View Less' : 'View More'}
              </button>
            )}
          </div>
        )}

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <button onClick={() => setMobileFilters((v) => !v)} className="lg:hidden text-[14px] font-medium px-4 py-2 border flex items-center gap-1.5" style={{ color: BLUE, borderColor: BLUE, borderRadius: 4 }}><SlidersHorizontal size={15} /> Filters</button>
          <div className="text-[14px] text-slate-600">
            {eligActive ? <span><b>{eligResult.counts.eligible?.toLocaleString()}</b> eligible · {eligResult.counts.nonEligible?.toLocaleString()} non-eligible</span>
              : result ? <span><b>{result.total?.toLocaleString()}</b> Programs in {result.universitiesCount} {result.universitiesCount === 1 ? 'University' : 'Universities'} · Page {page} of {result.totalPages}</span>
              : <span>Search to see programs</span>}
          </div>
          {!eligActive && result && (
            <div className="ml-auto flex items-center gap-3">
              {/* view toggle */}
              <div className="flex" style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e1e5e9' }}>
                {['universities', 'programs'].map((v) => (
                  <button key={v} onClick={() => setView(v)} className="text-[14px] px-3 py-1.5 capitalize" style={{ background: view === v ? BLUE : '#fff', color: view === v ? '#fff' : '#666' }}>{v}</button>
                ))}
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-slate-200 px-2 py-1.5 text-[13px] bg-white" style={{ borderRadius: 4 }}>
                <option value="featured">Sort: Featured</option><option value="ranking">Sort: Ranking</option>
                <option value="tuition-low">Tuition ↑</option><option value="tuition-high">Tuition ↓</option>
              </select>

              {/* Prominent Export dropdown (Excel + PDF) */}
              <div className="relative">
                <button
                  onClick={() => setExportMenu((v) => !v)}
                  disabled={exporting}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-white px-3.5 py-1.5 shadow-sm hover:brightness-110 transition disabled:opacity-60"
                  style={{ background: BLUE, borderRadius: 4 }}
                >
                  {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Export
                  <ChevronDown size={14} className={exportMenu ? 'rotate-180 transition' : 'transition'} />
                </button>
                {exportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setExportMenu(false)} />
                    <div className="absolute right-0 mt-1.5 z-50 w-56 bg-white border border-slate-200 shadow-lg py-1" style={{ borderRadius: 6 }}>
                      {!user && <p className="mx-3 mt-1 mb-1.5 px-2.5 py-2 text-[11.5px] leading-snug text-[#7C3F33] bg-[#FBF2EF]" style={{ borderRadius: 4 }}>Search and shortlist free. Sign in (free) to download.</p>}
                      <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5"><FileSpreadsheet size={12} /> Excel (.xlsx)</div>
                      <button onClick={() => openExport('excel', 'all')} className="w-full text-left px-3 py-1.5 text-[13px] text-slate-700 hover:bg-sky-50">All results…</button>
                      <button onClick={() => openExport('excel', 'top25')} className="w-full text-left px-3 py-1.5 text-[13px] text-slate-700 hover:bg-sky-50">Top 25…</button>
                      {selectedList.length > 0 && <button onClick={() => openExport('excel', 'selected')} className="w-full text-left px-3 py-1.5 text-[13px] text-slate-700 hover:bg-sky-50">Selected ({selectedList.length})…</button>}
                      <div className="my-1 border-t border-slate-100" />
                      <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1.5"><FileText size={12} /> PDF (.pdf)</div>
                      <button onClick={() => openExport('pdf', 'all')} className="w-full text-left px-3 py-1.5 text-[13px] text-slate-700 hover:bg-sky-50">All results…</button>
                      <button onClick={() => openExport('pdf', 'top25')} className="w-full text-left px-3 py-1.5 text-[13px] text-slate-700 hover:bg-sky-50">Top 25…</button>
                      {selectedList.length > 0 && <button onClick={() => openExport('pdf', 'selected')} className="w-full text-left px-3 py-1.5 text-[13px] text-slate-700 hover:bg-sky-50">Selected ({selectedList.length})…</button>}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Eligibility tabs */}
        {eligActive && (
          <div className="flex items-center gap-2 mt-3">
            {[['eligible', 'Eligible', eligResult.counts.eligible], ['non-eligible', 'Non-Eligible', eligResult.counts.nonEligible]].map(([b, label, n]) => (
              <button key={b} onClick={() => runEligibility(b, 1)} className="text-[14px] font-medium px-4 py-1.5 border" style={{ borderRadius: 4, background: eligBucket === b ? BLUE : '#fff', color: eligBucket === b ? '#fff' : '#334155', borderColor: eligBucket === b ? BLUE : '#e2e8f0' }}>{label} ({(n || 0).toLocaleString()})</button>
            ))}
            <button onClick={() => setEligResult(null)} className="ml-auto text-[13px] text-slate-500 hover:text-[#DE5C2B]">Clear eligibility ✕</button>
          </div>
        )}

        {/* Results */}
        <div className="mt-4 space-y-3">
          {(loading || eligLoading) ? (
            <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={20} /> Loading…</div>
          ) : eligActive ? (
            eligResult.data?.length === 0 ? <div className="text-center py-16 text-slate-500">No {eligBucket} programs for this profile.</div>
            : eligResult.data.map((c) => <ProgramRow key={c.cfId} c={c} selected={selected[c.cfId]} onToggleSelect={toggleSelect} onView={openCourse} eligible={c.eligible} reasons={c.reasons} highlightMap={highlightMap} scholarshipFocus={schMode} />)
          ) : !result ? (
            <div className="text-center py-20 text-slate-400">Search for a program to see results.</div>
          ) : result.data?.length === 0 ? (
            <div className="text-center py-16 text-slate-500">No programs match your filters.</div>
          ) : view === 'universities' ? (
            Object.values(result.data.reduce((acc, c) => { (acc[c.cfUniversityId] = acc[c.cfUniversityId] || { uni: c, items: [] }).items.push(c); return acc; }, {})).map((g) => (
              <div key={g.uni.cfUniversityId} className="bg-white border border-slate-200" style={{ borderRadius: 4 }}>
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="font-['Geist',sans-serif] text-[15px] font-semibold text-[#DE5C2B]">{g.uni.universityName}</div>
                  <div className="text-[13px] text-slate-500">{FLAG[g.uni.cfCountryId] || ''} {g.uni.countryName} · {g.items.length} program{g.items.length > 1 ? 's' : ''}</div>
                </div>
                <div className="p-3 space-y-2">{g.items.map((c) => <ProgramRow key={c.cfId} c={c} selected={selected[c.cfId]} onToggleSelect={toggleSelect} onView={openCourse} highlightMap={highlightMap} scholarshipFocus={schMode} />)}</div>
              </div>
            ))
          ) : (
            result.data.map((c) => <ProgramRow key={c.cfId} c={c} selected={selected[c.cfId]} onToggleSelect={toggleSelect} onView={openCourse} highlightMap={highlightMap} scholarshipFocus={schMode} />)
          )}
        </div>

        {/* Pagination */}
        {!eligActive && result?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => runSearch(page - 1)} className="px-3 py-1.5 border border-slate-200 bg-white text-[13px] disabled:opacity-40" style={{ borderRadius: 4 }}>‹ Prev</button>
            <span className="text-[13px] text-slate-500 px-2">Page {page} of {result.totalPages}</span>
            <button disabled={page >= result.totalPages} onClick={() => runSearch(page + 1)} className="px-3 py-1.5 border border-slate-200 bg-white text-[13px] disabled:opacity-40" style={{ borderRadius: 4 }}>Next ›</button>
          </div>
        )}
        </main>
      </div>

      {/* Bulk action bar (fixed) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#1e293b] text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 text-[13px]">
          <span className="font-semibold">{selectedList.length} Program{selectedList.length !== 1 ? 's' : ''} selected</span>
          {selectedList.length > 0 && <button onClick={() => setSelected({})} className="text-slate-300 hover:text-white flex items-center gap-1"><X size={14} /> Deselect All</button>}
          <div className="ml-auto flex items-center gap-4">
            <button disabled={selectedList.length < 2} onClick={() => setShowCompare(true)} className="flex items-center gap-1.5 disabled:opacity-40 hover:text-sky-300"><GitCompare size={15} /> Compare</button>
            <button disabled={selectedList.length === 0} onClick={() => openExport('excel', 'selected')} className="flex items-center gap-1.5 disabled:opacity-40 hover:text-sky-300"><Download size={15} /> Export Selected…</button>
            <button disabled={!result || exporting} onClick={() => openExport('excel', 'all')} className="flex items-center gap-1.5 disabled:opacity-40 hover:text-sky-300">{exporting ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />} Excel…</button>
            <button disabled={!result || exporting} onClick={() => openExport('pdf', 'all')} className="flex items-center gap-1.5 disabled:opacity-40 hover:text-sky-300"><FileText size={15} /> PDF…</button>
          </div>
        </div>
      </div>

      {/* Column-picker checklist (Excel + PDF) */}
      {columnModal && <Suspense fallback={null}><ExcelColumnExportModal
        isOpen={!!columnModal}
        onClose={() => setColumnModal(null)}
        onConfirmExport={runColumnExport}
        exportType="programs"
        itemsCount={columnModal?.scope === 'selected' ? selectedList.length : (result?.total || 0)}
        formatLabel={columnModal?.format === 'pdf' ? 'PDF' : 'Excel'}
      /></Suspense>}

      {/* Compare modal */}
      {showCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" onClick={() => setShowCompare(false)}>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto" style={{ borderRadius: 6 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <h2 className="font-['Geist',sans-serif] text-lg font-bold text-slate-800">Program Comparison</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => { setShowCompare(false); openExport('excel', 'selected'); }} className="text-[13px] text-[#DE5C2B] font-medium flex items-center gap-1"><FileSpreadsheet size={14} /> Export to Excel…</button>
                <button onClick={() => setShowCompare(false)} className="text-slate-400"><X size={18} /></button>
              </div>
            </div>
            <table className="w-full text-[13px] border-collapse">
              <tbody>
                {(() => {
                  // merge list item + fetched detail; detail wins where present
                  const engStr = (d) => (d?.testRequirements?.english || []).map((t) => `${t.test} ${t.score}`).join(', ');
                  const stdStr = (d) => { const s = (d?.testRequirements?.standardized || []); return s.length ? s.map((t) => `${t.test} ${t.score}`).join(', ') : 'No Test Requirement'; };
                  const rows = [
                    ['Program Name', (c, d) => d?.name || c.courseName],
                    ['University', (c, d) => d?.university?.name || c.universityName],
                    ['Website', (c, d) => { const w = d?.university?.['website-url']; return w ? <a href={w.startsWith('http') ? w : `https://${w}`} target="_blank" rel="noreferrer" className="text-[#DE5C2B] break-all">{w}</a> : '—'; }],
                    ['Country', (c, d) => [d?.university?.city, d?.university?.countryName].filter(Boolean).join(', ') || c.countryName],
                    ['Program Level', (c, d) => d?.degreeLevel || c.degreeLevel],
                    ['Duration', (c, d) => d?.duration || c.duration],
                    ['Intakes', (c, d) => (d?.intakesList || c.intakes || []).join?.(', ') || '—'],
                    ['English Requirements', (c, d) => engStr(d) || '—'],
                    ['Standardized Requirements', (c, d) => stdStr(d)],
                    ['Application Deadline', (c, d) => d?.applicationDeadline || '—'],
                    ['Application Fee', (c, d) => (d?.applicationFee?.isWaived ? 'Waived' : (money(d?.applicationFee) !== '—' ? money(d?.applicationFee) : (c.applicationFee?.isWaived ? 'Waived' : money(c.applicationFee))))],
                    ['Yearly Tuition Fee', (c, d) => (money(d?.tuitionFee) !== '—' ? money(d?.tuitionFee) : money(c.annualFee))],
                    ['Deposit', (c, d) => money(d?.deposit)],
                    ['Average Scholarship', (c, d) => (d?.averageScholarship ? `${d?.tuitionFee?.currency || ''} ${Number(d.averageScholarship).toLocaleString()}`.trim() : '—')],
                    ['QS Ranking', (c, d) => (d?.university?.rankings?.qs ? `#${d.university.rankings.qs}` : '—')],
                  ];
                  return rows.map(([label, fn]) => (
                    <tr key={label} className="border-b border-slate-100 align-top">
                      <td className="px-4 py-2 font-medium text-slate-500 bg-slate-50 whitespace-nowrap sticky left-0">{label}</td>
                      {selectedList.slice(0, 5).map((c) => <td key={c.cfId} className="px-4 py-2 text-slate-700 min-w-[180px]">{fn(c, compareDetails[c.cfId]) || '—'}</td>)}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
