import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, UserCheck, X, Download, FileSpreadsheet, FileText, GitCompare, ChevronDown, ChevronUp, Info, Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSearchConfig, getHighlights, searchCourses, evaluateEligibility, exportSearch, getCourseDetail, getUniversitiesFacet } from '../utils/searchApi';
import { exportSelectedProgramsToExcel } from '../utils/excelExporter';
import { exportSelectedProgramsToPdf } from '../utils/pdfExporter';
import ExcelColumnExportModal from '../components/ExcelColumnExportModal';
import CfSidebar from '../components/CfSidebar';

const PAGE_SIZE = 20;
const BLUE = '#226CF5';

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
const Chip = ({ children, color = '#dbeafe', text = '#1e3a8a' }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium" style={{ background: color, color: text, borderRadius: 2 }}>{children}</span>
);
const Checkbox = ({ checked, onChange, label }) => (
  <label className="flex items-start gap-2 cursor-pointer text-[13px] text-slate-700 py-1">
    <input type="checkbox" checked={!!checked} onChange={onChange} className="mt-0.5 accent-[#226CF5] w-4 h-4" />
    <span>{label}</span>
  </label>
);
// Collapsible filter section for the CourseFinder-style left sidebar
const Accordion = ({ title, open, onToggle, children, count }) => (
  <div className="bg-white border border-slate-200" style={{ borderRadius: 4 }}>
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 text-left">
      <span className="font-['DM_Sans'] font-semibold text-[13.5px] text-slate-700">{title}{count ? <span className="text-slate-400 font-normal"> ({count})</span> : null}</span>
      <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="px-3 pb-3 pt-0 border-t border-slate-100">{children}</div>}
  </div>
);

// ── Program row (CourseFinder program card) ───────────────────────────────────
const ProgramRow = ({ c, selected, onToggleSelect, onView, eligible, reasons, highlightMap = {} }) => (
  <div className="bg-white border border-slate-200" style={{ borderRadius: 4 }}>
    <div className="p-4">
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={!!selected} onChange={() => onToggleSelect(c)} className="mt-1 accent-[#226CF5] w-4 h-4" />
        <div className="flex-1 min-w-0">
          <button onClick={() => onView(c)} className="text-left">
            <h3 className="font-['DM_Sans'] text-[15px] font-semibold text-[#226CF5] hover:underline leading-snug">{c.courseName}</h3>
          </button>
          <div className="text-[13px] text-slate-500 mt-0.5">{c.universityName} · {FLAG[c.cfCountryId] || ''} {c.countryName}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {eligible === true && <Chip color="#dcfce7" text="#166534"><CheckCircle2 size={11} /> Eligible</Chip>}
            {eligible === false && <Chip color="#fee2e2" text="#b91c1c"><AlertCircle size={11} /> Non-Eligible</Chip>}
            {(c.highlightIds || []).slice(0, 3).map((id) => { const h = highlightMap[id]; return h ? <span key={id} className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-white" style={{ background: h.color || BLUE, borderRadius: 2 }}>{h.name}</span> : null; })}
          </div>
          {eligible === false && reasons?.length > 0 && (
            <ul className="mt-2 text-[12px] text-rose-700 list-disc pl-4">{reasons.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}</ul>
          )}
        </div>
        <button onClick={() => onView(c)} className="shrink-0 text-white text-[13px] font-medium px-4 py-1.5" style={{ background: BLUE, borderRadius: 4 }}>View</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100 text-[13px]">
        <div><div className="text-[11px] text-slate-400">Status</div><Chip color="#ddffe5" text="#166534">Open</Chip></div>
        <div><div className="text-[11px] text-slate-400">Duration</div><div className="font-medium text-slate-700">{c.duration || '—'}</div></div>
        <div><div className="text-[11px] text-slate-400">Tuition / yr</div><div className="font-semibold text-[#226CF5]">{money(c.annualFee)}</div></div>
        <div><div className="text-[11px] text-slate-400">Application Fee</div><div className="font-medium text-slate-700">{c.applicationFee?.isWaived ? 'Waived' : money(c.applicationFee)}</div></div>
      </div>
      {(c.intakes || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {(c.intakes || []).slice(0, 8).map((i) => <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px]" style={{ borderRadius: 2 }}>{i}</span>)}
        </div>
      )}
    </div>
  </div>
);

export default function SearchProgramsPage() {
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth() || {};

  const [config, setConfig] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [searchText, setSearchText] = useState('');
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
  const [activeHighlights, setActiveHighlights] = useState([]);
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
  const [selected, setSelected] = useState({});       // cfId -> course
  const [showCompare, setShowCompare] = useState(false);
  const [compareDetails, setCompareDetails] = useState({}); // cfId -> full detail (for CF-parity rows)
  const [exporting, setExporting] = useState(false);
  const [exportMenu, setExportMenu] = useState(false);
  const [columnModal, setColumnModal] = useState(null); // { format: 'excel'|'pdf', scope: 'all'|'top25'|'selected' } | null

  // eligibility
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState({ nationalityId: '', highestQualificationId: '', gradingSystem: 'OutOf100', score: '', englishExam: 'later', backlogs: '', workExperience: '' });
  const [eligResult, setEligResult] = useState(null);
  const [eligBucket, setEligBucket] = useState('eligible');
  const [eligLoading, setEligLoading] = useState(false);

  // open the eligibility modal when arriving from the sidebar (?check=eligibility)
  useEffect(() => {
    if (user && searchParams.get('check') === 'eligibility') {
      setEligOpen(true);
      searchParams.delete('check');
      setSearchParams(searchParams, { replace: true });
    }
  }, [user, searchParams, setSearchParams]);

  // faceted Universities list for the sidebar (re-facets as other filters change)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const t = setTimeout(() => {
      getUniversitiesFacet({ ...filters, university: undefined }, uniSearch)
        .then((rows) => { if (!cancelled) setUniList(rows); }).catch(() => {});
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, uniSearch, searchText, country, programLevels, requirements, intakeArr, studyAreas, activeHighlights, tuitionMax]);

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
    document.title = 'Search Programs | UniCoach';
    window.scrollTo(0, 0);
    // load CourseFinder-style fonts for this portal
    if (!document.getElementById('cf-portal-fonts')) {
      const l = document.createElement('link'); l.id = 'cf-portal-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap';
      document.head.appendChild(l);
    }
    getSearchConfig().then(setConfig).catch(() => {});
    getHighlights().then(setHighlights).catch(() => {});
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
  }), [searchText, country, programLevels, requirements, intakeArr, activeHighlights, studyAreas, universities, tuitionMax]);

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
  }, [country, programLevels, requirements, intakeArr, activeHighlights, studyAreas, universities, tuitionMax, sort]);

  // show all programs by default on first load (CourseFinder shows the full catalogue)
  useEffect(() => {
    if (user && !result && !eligResult) runSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleHighlight = (id) => setActiveHighlights((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const toggleArr = (setter) => (val) => setter((a) => (a.includes(val) ? a.filter((x) => x !== val) : [...a, val]));
  const toggleSelect = (c) => setSelected((s) => { const n = { ...s }; if (n[c.cfId]) delete n[c.cfId]; else n[c.cfId] = c; return n; });
  const selectedList = Object.values(selected);
  const openCourse = (c) => navigate(`/program/${c.cfId}`);
  const clearAll = () => {
    setSearchText(''); setCountry(''); setProgramLevels([]); setRequirements([]); setStudyAreas([]);
    setIntakeArr([]); setYear(''); setUniversities([]); setUniSearch(''); setTuitionMax(0);
    setActiveHighlights([]); setEligResult(null);
  };

  // Open the column-checklist modal for a given format + scope; the actual export runs on confirm.
  const openExport = (format, scope) => { setExportMenu(false); setColumnModal({ format, scope }); };

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
        await exportSelectedProgramsToPdf(data, { filename: `UniCoach_${base}_${stamp}.pdf`, title, selectedColumnKeys: selectedKeys });
      } else {
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

  // ── LOGIN GATE ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-[76px] flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 p-8 max-w-md w-full text-center" style={{ borderRadius: 6 }}>
          <div className="w-14 h-14 mx-auto flex items-center justify-center" style={{ background: '#eef4ff', borderRadius: 999 }}><Lock size={24} color={BLUE} /></div>
          <h1 className="font-['DM_Sans'] text-xl font-bold text-slate-800 mt-4">Sign in to search programs</h1>
          <p className="text-[14px] text-slate-500 mt-2">Create a free account or sign in to search 98,000+ programs, check eligibility, and download results to Excel.</p>
          <button onClick={() => openLoginModal && openLoginModal()} className="mt-5 w-full text-white text-[14px] font-semibold py-3" style={{ background: BLUE, borderRadius: 4 }}>Sign in / Create account</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-[76px] pb-28 font-['Poppins'] lg:pl-16">
      <CfSidebar active="search" />
      {/* Top search bar (CourseFinder: search • intake • year • nationality • state) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 border border-slate-200 px-3 bg-white" style={{ borderRadius: 4 }}>
              <Search size={18} className="text-slate-400" />
              <input value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch(1)}
                placeholder="Search Program / University" className="flex-1 py-2.5 text-[14px] outline-none bg-transparent" />
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
            <button onClick={clearAll} className="text-[14px] font-medium px-4 py-2.5 border text-slate-600 border-slate-200" style={{ borderRadius: 4 }}>Clear All</button>
          </div>
        </div>
      </div>

      {/* Body: left filter sidebar + results */}
      <div className="max-w-7xl mx-auto px-4 mt-4 flex gap-5 items-start">
        <aside className={`${mobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-[290px] shrink-0 space-y-3`}>
          <div className="bg-white border border-slate-200 px-3 py-2.5 flex items-center gap-2 font-['DM_Sans'] font-semibold text-[14px] text-slate-700" style={{ borderRadius: 4 }}>
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
              <input type="range" min={0} max={100000} step={1000} value={tuitionMax} onChange={(e) => setTuitionMax(Number(e.target.value))} className="w-full accent-[#226CF5]" />
              <div className="text-[12.5px] text-slate-600 mt-1">{tuitionMax === 0 ? 'Any' : tuitionMax >= 100000 ? 'Above 100,000' : `Up to ${tuitionMax.toLocaleString()}`}</div>
            </div>
          </Accordion>
        </aside>

        {/* Right: results */}
        <main className="flex-1 min-w-0">
        {/* Quick filter pills */}
        {highlights.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[13px] font-semibold text-slate-500 shrink-0">Quick Filters:</span>
            {highlights.map((h) => {
              const active = activeHighlights.includes(h.id);
              const count = result?.highlightCounts?.[h.id];
              return (
                <button key={h.id} onClick={() => toggleHighlight(h.id)} className="shrink-0 text-[13px] font-medium px-3 py-1.5 border transition-colors"
                  style={{ borderRadius: 4, background: active ? BLUE : '#fff', color: active ? '#fff' : '#334155', borderColor: active ? BLUE : '#e2e8f0' }}>
                  {h.name}{count != null && ` (${count})`}
                </button>
              );
            })}
          </div>
        )}

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <button onClick={() => setMobileFilters((v) => !v)} className="lg:hidden text-[14px] font-medium px-4 py-2 border flex items-center gap-1.5" style={{ color: BLUE, borderColor: BLUE, borderRadius: 4 }}><SlidersHorizontal size={15} /> Filters</button>
          <div className="text-[14px] text-slate-600">
            {eligActive ? <span><b>{eligResult.counts.eligible?.toLocaleString()}</b> eligible · {eligResult.counts.nonEligible?.toLocaleString()} non-eligible</span>
              : result ? <span><b>{result.total?.toLocaleString()}</b> Programs in {result.universitiesCount} Universities · Page {page} of {result.totalPages}</span>
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
            <button onClick={() => setEligResult(null)} className="ml-auto text-[13px] text-slate-500 hover:text-[#226CF5]">Clear eligibility ✕</button>
          </div>
        )}

        {/* Results */}
        <div className="mt-4 space-y-3">
          {(loading || eligLoading) ? (
            <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={20} /> Loading…</div>
          ) : eligActive ? (
            eligResult.data?.length === 0 ? <div className="text-center py-16 text-slate-500">No {eligBucket} programs for this profile.</div>
            : eligResult.data.map((c) => <ProgramRow key={c.cfId} c={c} selected={selected[c.cfId]} onToggleSelect={toggleSelect} onView={openCourse} eligible={c.eligible} reasons={c.reasons} highlightMap={highlightMap} />)
          ) : !result ? (
            <div className="text-center py-20 text-slate-400">Search for a program to see results.</div>
          ) : result.data?.length === 0 ? (
            <div className="text-center py-16 text-slate-500">No programs match your filters.</div>
          ) : view === 'universities' ? (
            Object.values(result.data.reduce((acc, c) => { (acc[c.cfUniversityId] = acc[c.cfUniversityId] || { uni: c, items: [] }).items.push(c); return acc; }, {})).map((g) => (
              <div key={g.uni.cfUniversityId} className="bg-white border border-slate-200" style={{ borderRadius: 4 }}>
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="font-['DM_Sans'] text-[15px] font-semibold text-[#226CF5]">{g.uni.universityName}</div>
                  <div className="text-[13px] text-slate-500">{FLAG[g.uni.cfCountryId] || ''} {g.uni.countryName} · {g.items.length} program{g.items.length > 1 ? 's' : ''}</div>
                </div>
                <div className="p-3 space-y-2">{g.items.map((c) => <ProgramRow key={c.cfId} c={c} selected={selected[c.cfId]} onToggleSelect={toggleSelect} onView={openCourse} highlightMap={highlightMap} />)}</div>
              </div>
            ))
          ) : (
            result.data.map((c) => <ProgramRow key={c.cfId} c={c} selected={selected[c.cfId]} onToggleSelect={toggleSelect} onView={openCourse} highlightMap={highlightMap} />)
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
      <ExcelColumnExportModal
        isOpen={!!columnModal}
        onClose={() => setColumnModal(null)}
        onConfirmExport={runColumnExport}
        exportType="programs"
        itemsCount={columnModal?.scope === 'selected' ? selectedList.length : (result?.total || 0)}
        formatLabel={columnModal?.format === 'pdf' ? 'PDF' : 'Excel'}
      />

      {/* Compare modal */}
      {showCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" onClick={() => setShowCompare(false)}>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto" style={{ borderRadius: 6 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <h2 className="font-['DM_Sans'] text-lg font-bold text-slate-800">Program Comparison</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => { setShowCompare(false); openExport('excel', 'selected'); }} className="text-[13px] text-[#226CF5] font-medium flex items-center gap-1"><FileSpreadsheet size={14} /> Export to Excel…</button>
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
                    ['Website', (c, d) => { const w = d?.university?.['website-url']; return w ? <a href={w.startsWith('http') ? w : `https://${w}`} target="_blank" rel="noreferrer" className="text-[#226CF5] break-all">{w}</a> : '—'; }],
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
