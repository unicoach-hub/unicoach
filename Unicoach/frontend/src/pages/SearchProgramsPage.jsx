import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, GraduationCap, Clock, Wallet, FileText, Bookmark, ArrowRight, SlidersHorizontal, Loader2, UserCheck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { HeroBackButton } from '../components/ui/BackButton';
import { getSearchConfig, getHighlights, searchCourses, evaluateEligibility } from '../utils/searchApi';

const PAGE_SIZE = 20;

// ---- helpers ----
const fmtMoney = (m) => {
  if (!m || !m.amount) return '—';
  const n = Number(m.amount);
  if (!n) return '—';
  return `${m.currency || ''} ${n.toLocaleString()}`.trim();
};
const FLAG = { 1: '🇺🇸', 2: '🇦🇺', 3: '🇨🇦', 4: '🇬🇧', 5: '🇳🇿', 6: '🇸🇬', 7: '🇦🇪', 8: '🇮🇪', 9: '🇩🇪', 10: '🇫🇷', 25: '🇲🇾', 16: '🇮🇹', 19: '🇪🇸' };

const QUALIFICATIONS = [
  { value: '8', label: 'Grade 12 / equivalent' },
  { value: '13', label: 'Senior Secondary (SSE)' },
  { value: '1', label: 'Undergraduate degree' },
  { value: '2', label: 'Postgraduate degree' },
];
const GRADING = [
  { value: 'OutOf100', label: 'Percentage (out of 100)' },
  { value: 'OutOf10', label: 'CGPA (out of 10)' },
  { value: 'OutOf4', label: 'GPA (out of 4)' },
  { value: 'OutOf5', label: 'Out of 5' },
  { value: 'OutOf7', label: 'Out of 7' },
  { value: 'OutOf45', label: 'Out of 45' },
];
const ENGLISH = [
  { value: 'later', label: "I'll provide this later" },
  { value: 'none', label: "I don't have this yet" },
  { value: 'IELTS', label: 'IELTS' },
  { value: 'TOEFL', label: 'TOEFL' },
  { value: 'PTE', label: 'PTE' },
  { value: 'DET', label: 'Duolingo (DET)' },
];

// ---- Program result card (course-level, UniCoach design language) ----
const ProgramCard = ({ c, highlightMap, onView }) => {
  const tags = (c.highlightIds || []).map((id) => highlightMap[id]).filter(Boolean).slice(0, 3);
  const notEligible = c.eligible === false;
  return (
    <div className={`bg-white rounded-2xl border shadow-xs hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 ${notEligible ? 'border-rose-200/80' : 'border-slate-200/80'}`}>
      <div className="flex items-start justify-between gap-3">
        <button onClick={() => onView(c)} className="text-left">
          <h3 className="font-outfit text-[15px] sm:text-base font-bold text-[#0F172A] leading-snug hover:text-[#DE5C2B] transition-colors">
            {c.courseName}
          </h3>
        </button>
        {c.eligible === true && (
          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-[#059669] text-[11px] font-bold"><CheckCircle2 size={12} /> Eligible</span>
        )}
        {notEligible && (
          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-bold"><AlertCircle size={12} /> Not eligible</span>
        )}
        {c.eligible === undefined && (
          <button className="shrink-0 w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#DE5C2B] hover:border-orange-200 transition-colors" title="Save">
            <Bookmark size={15} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1.5 text-[13px] text-slate-500">
        <GraduationCap size={14} className="text-slate-400" />
        <span className="font-medium text-slate-700">{c.universityName}</span>
        <span className="text-slate-300">·</span>
        <span>{FLAG[c.cfCountryId] || ''} {c.countryName}</span>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-white" style={{ backgroundColor: t.color || '#DE5C2B' }}>
              {t.name}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold flex items-center gap-1"><Clock size={11} />Duration</div>
          <div className="text-[13px] font-semibold text-slate-700 mt-0.5">{c.duration || '—'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold flex items-center gap-1"><Wallet size={11} />Tuition / yr</div>
          <div className="text-[13px] font-bold text-[#DE5C2B] mt-0.5">{fmtMoney(c.annualFee)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold flex items-center gap-1"><FileText size={11} />App. Fee</div>
          <div className="text-[13px] font-semibold text-slate-700 mt-0.5">{c.applicationFee?.isWaived ? 'Waived' : fmtMoney(c.applicationFee)}</div>
        </div>
      </div>

      {notEligible && c.reasons?.length > 0 && (
        <div className="mt-3 rounded-xl bg-rose-50/70 border border-rose-100 px-3 py-2">
          <ul className="list-disc pl-4 text-[12px] text-rose-700 space-y-0.5">
            {c.reasons.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mt-3.5">
        <div className="flex flex-wrap gap-1">
          {(c.intakes || []).slice(0, 4).map((i) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">{i}</span>
          ))}
        </div>
        <button onClick={() => onView(c)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#DE5C2B] text-white text-[12px] font-bold hover:bg-[#c04a1d] transition-colors shadow-xs">
          View <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

const SelectField = ({ label, value, onChange, options, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 rounded-xl border border-slate-200/90 bg-white px-3 text-[13px] text-slate-700 focus:border-[#DE5C2B] focus:ring-2 focus:ring-orange-200/60 outline-none">
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ---- Eligibility modal ----
const EligibilityModal = ({ open, onClose, onApply, profile, setProfile, nationalities, loading }) => {
  if (!open) return null;
  const set = (k) => (v) => setProfile((p) => ({ ...p, [k]: v }));
  const valid = profile.nationalityId && profile.highestQualificationId && profile.gradingSystem && profile.score !== '' && profile.englishExam;
  const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{label}</label>
      {children}
    </div>
  );
  const cls = 'h-10 rounded-xl border border-slate-200/90 bg-white px-3 text-[13px] text-slate-700 focus:border-[#DE5C2B] focus:ring-2 focus:ring-orange-200/60 outline-none';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40" onClick={onClose}>
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-outfit text-xl font-black text-[#0F172A]">Check Eligibility</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">Tell us about the student — we'll split results into eligible &amp; non-eligible programs.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <Field label="Student's Nationality *">
            <select value={profile.nationalityId} onChange={(e) => set('nationalityId')(e.target.value)} className={cls}>
              <option value="">Select</option>
              {nationalities.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
          </Field>
          <Field label="Highest Qualification *">
            <select value={profile.highestQualificationId} onChange={(e) => set('highestQualificationId')(e.target.value)} className={cls}>
              <option value="">Select</option>
              {QUALIFICATIONS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </Field>
          <Field label="Grading System *">
            <select value={profile.gradingSystem} onChange={(e) => set('gradingSystem')(e.target.value)} className={cls}>
              {GRADING.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </Field>
          <Field label="Score *">
            <input type="number" value={profile.score} onChange={(e) => set('score')(e.target.value)} placeholder="e.g. 75" className={cls} />
          </Field>
          <Field label="English Proficiency *">
            <select value={profile.englishExam} onChange={(e) => set('englishExam')(e.target.value)} className={cls}>
              {ENGLISH.map((e2) => <option key={e2.value} value={e2.value}>{e2.label}</option>)}
            </select>
          </Field>
          <Field label="Backlogs">
            <input type="number" value={profile.backlogs} onChange={(e) => set('backlogs')(e.target.value)} placeholder="0" className={cls} />
          </Field>
          <Field label="Work Experience (yrs)">
            <input type="number" value={profile.workExperience} onChange={(e) => set('workExperience')(e.target.value)} placeholder="0" className={cls} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-600 hover:border-slate-300">Cancel</button>
          <button disabled={!valid || loading} onClick={onApply} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#DE5C2B] text-white text-[13px] font-bold hover:bg-[#c04a1d] transition-colors disabled:opacity-40">
            {loading ? <Loader2 className="animate-spin" size={15} /> : <UserCheck size={15} />} Check Eligibility
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SearchProgramsPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [country, setCountry] = useState('');
  const [programLevel, setProgramLevel] = useState('');
  const [activeHighlights, setActiveHighlights] = useState([]);
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // eligibility
  const [showElig, setShowElig] = useState(false);
  const [profile, setProfile] = useState({ nationalityId: '', highestQualificationId: '', gradingSystem: 'OutOf100', score: '', englishExam: 'later', backlogs: '', workExperience: '' });
  const [eligResult, setEligResult] = useState(null);
  const [eligBucket, setEligBucket] = useState('eligible');
  const [eligPage, setEligPage] = useState(1);
  const [eligLoading, setEligLoading] = useState(false);

  useEffect(() => {
    document.title = 'Search Programs | UniCoach';
    window.scrollTo(0, 0);
    getSearchConfig().then(setConfig).catch(() => {});
    getHighlights().then(setHighlights).catch(() => {});
  }, []);

  const highlightMap = useMemo(() => Object.fromEntries((highlights || []).map((h) => [h.id, h])), [highlights]);

  const filters = useMemo(() => ({
    searchText: searchText || undefined,
    country: country ? [Number(country)] : undefined,
    programLevel: programLevel ? [Number(programLevel)] : undefined,
    highlights: activeHighlights.length ? activeHighlights : undefined,
  }), [searchText, country, programLevel, activeHighlights]);

  const profilePayload = useMemo(() => ({
    nationalityId: Number(profile.nationalityId) || undefined,
    highestQualificationId: profile.highestQualificationId || undefined,
    gradingSystem: profile.gradingSystem,
    score: profile.score === '' ? undefined : Number(profile.score),
    englishExam: profile.englishExam,
    backlogs: profile.backlogs === '' ? undefined : Number(profile.backlogs),
    workExperience: profile.workExperience === '' ? undefined : Number(profile.workExperience),
  }), [profile]);

  const runSearch = (toPage = 1) => {
    setEligResult(null);
    setLoading(true);
    setPage(toPage);
    searchCourses(filters, { sort, page: toPage, pageSize: PAGE_SIZE })
      .then((r) => setResult(r))
      .catch(() => setResult({ data: [], total: 0, totalPages: 0, highlightCounts: {} }))
      .finally(() => setLoading(false));
  };

  const runEligibility = (bucket = 'eligible', toPage = 1) => {
    setEligLoading(true);
    setEligBucket(bucket);
    setEligPage(toPage);
    evaluateEligibility(filters, profilePayload, { bucket, page: toPage, pageSize: PAGE_SIZE })
      .then((r) => setEligResult(r))
      .catch(() => setEligResult({ counts: { eligible: 0, nonEligible: 0 }, data: [], total: 0 }))
      .finally(() => setEligLoading(false));
  };

  const applyEligibility = () => { setShowElig(false); runEligibility('eligible', 1); };

  // re-run when refinements change (after an initial search exists)
  useEffect(() => {
    if (eligResult) { runEligibility(eligBucket, 1); return; }
    if (result) runSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, programLevel, activeHighlights, sort]);

  const toggleHighlight = (id) => setActiveHighlights((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const openCourse = (c) => {
    const p = new URLSearchParams({ courseId: String(c.cfId), title: c.courseName, uniName: c.universityName });
    navigate(`/course-details?${p.toString()}`);
  };

  const countryOpts = (config?.countries || []).map((c) => ({ value: c.value, label: c.label }));
  const levelOpts = (config?.programLevels || []).map((l) => ({ value: l.value, label: l.label }));
  const nationalities = (config?.studentCountries || []).map((n) => ({ value: n.value, label: n.label }));
  const eligActive = !!eligResult;

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-[76px] pb-12">
      {/* Hero */}
      <section className="relative pt-12 pb-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFF4EE] via-[#FBF6F2] to-[#F1F5F9] border-b border-slate-200/80">
        <HeroBackButton />
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white text-[#DE5C2B] border border-orange-200/80 shadow-xs">
            <Sparkles size={14} className="text-[#DE5C2B]" />
            <span>Explore 98,000+ Verified Programs Worldwide</span>
          </div>
          <h1 className="font-outfit text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-[#0F172A] leading-tight">
            Find Your Perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D]">Program</span>
          </h1>
          <p className="text-[14px] sm:text-[15.5px] text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Search real courses across 49 destinations — compare tuition, intakes, scholarships and entry requirements, then check your eligibility.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto flex items-center gap-2 bg-white rounded-full border border-slate-200/90 shadow-sm pl-5 pr-2 py-2">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(1); }}
              placeholder="Search by program or university (e.g. Data Science, Oxford)…"
              className="flex-1 bg-transparent outline-none text-[14px] text-slate-700 placeholder:text-slate-400"
            />
            <button onClick={() => runSearch(1)} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#DE5C2B] text-white text-[13px] font-bold hover:bg-[#c04a1d] transition-colors">
              Search
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Quick filter pills */}
        {highlights.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {highlights.map((h) => {
              const active = activeHighlights.includes(h.id);
              const count = result?.highlightCounts?.[h.id];
              return (
                <button
                  key={h.id}
                  onClick={() => toggleHighlight(h.id)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold border transition-all ${active ? 'bg-[#DE5C2B] text-white border-transparent shadow-xs' : 'bg-white text-slate-600 border-slate-200/90 hover:border-slate-300'}`}
                >
                  {h.name}{count != null && <span className={active ? 'text-white/80' : 'text-slate-400'}>({count})</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Refine row */}
        <div className="flex flex-wrap items-end gap-3 mt-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <SelectField label="Country" value={country} onChange={setCountry} options={countryOpts} placeholder="All destinations" />
          <SelectField label="Program Level" value={programLevel} onChange={setProgramLevel} options={levelOpts} placeholder="All levels" />
          <SelectField label="Sort by" value={sort} onChange={setSort} placeholder="Featured" options={[
            { value: 'featured', label: 'Featured' },
            { value: 'ranking', label: 'Ranking' },
            { value: 'tuition-low', label: 'Tuition: Low to High' },
            { value: 'tuition-high', label: 'Tuition: High to Low' },
          ]} />
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">&nbsp;</label>
            <button onClick={() => setShowElig(true)} className="h-10 inline-flex items-center gap-1.5 px-4 rounded-xl border border-[#DE5C2B]/40 bg-orange-50 text-[#DE5C2B] text-[13px] font-bold hover:bg-orange-100 transition-colors">
              <UserCheck size={15} /> Check Eligibility
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[13px] text-slate-500">
            <SlidersHorizontal size={15} />
            {eligActive ? (
              <span><b className="text-[#0F172A]">{eligResult.counts.eligible?.toLocaleString()}</b> eligible · {eligResult.counts.nonEligible?.toLocaleString()} non-eligible</span>
            ) : result ? (
              <span><b className="text-[#0F172A]">{result.total?.toLocaleString()}</b> programs · {result.universitiesCount} universities</span>
            ) : <span>Start a search</span>}
          </div>
        </div>

        {/* Eligibility tabs */}
        {eligActive && (
          <div className="flex items-center gap-2 mt-4">
            {[['eligible', 'Eligible', eligResult.counts.eligible], ['non-eligible', 'Non-Eligible', eligResult.counts.nonEligible]].map(([b, label, n]) => (
              <button key={b} onClick={() => runEligibility(b, 1)} className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-all ${eligBucket === b ? 'bg-[#DE5C2B] text-white border-transparent' : 'bg-white text-slate-600 border-slate-200/90 hover:border-slate-300'}`}>
                {label} ({(n || 0).toLocaleString()})
              </button>
            ))}
            <button onClick={() => setEligResult(null)} className="ml-auto text-[13px] font-semibold text-slate-500 hover:text-[#DE5C2B]">Clear eligibility ✕</button>
          </div>
        )}

        {/* Results */}
        <div className="mt-5">
          {(loading || eligLoading) ? (
            <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={20} /> {eligLoading ? 'Checking eligibility…' : 'Searching…'}</div>
          ) : eligActive ? (
            eligResult.data?.length === 0 ? (
              <div className="text-center py-20 text-slate-500">No {eligBucket === 'eligible' ? 'eligible' : 'non-eligible'} programs for this profile &amp; filters.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eligResult.data.map((c) => <ProgramCard key={c.cfId} c={c} highlightMap={highlightMap} onView={openCourse} />)}
                </div>
                {Math.ceil(eligResult.total / PAGE_SIZE) > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button disabled={eligPage <= 1} onClick={() => runEligibility(eligBucket, eligPage - 1)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 disabled:opacity-40 hover:border-slate-300">Previous</button>
                    <span className="text-[13px] text-slate-500 px-3">Page {eligPage} of {Math.ceil(eligResult.total / PAGE_SIZE)}</span>
                    <button disabled={eligPage >= Math.ceil(eligResult.total / PAGE_SIZE)} onClick={() => runEligibility(eligBucket, eligPage + 1)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 disabled:opacity-40 hover:border-slate-300">Next</button>
                  </div>
                )}
              </>
            )
          ) : !result ? (
            <div className="text-center py-20 text-slate-400">Search for a program to see results.</div>
          ) : result.data?.length === 0 ? (
            <div className="text-center py-20 text-slate-500">No programs match your filters. Try broadening them.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.data.map((c) => (
                  <ProgramCard key={c.cfId} c={c} highlightMap={highlightMap} onView={openCourse} />
                ))}
              </div>
              {result.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button disabled={page <= 1} onClick={() => runSearch(page - 1)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 disabled:opacity-40 hover:border-slate-300">Previous</button>
                  <span className="text-[13px] text-slate-500 px-3">Page {page} of {result.totalPages}</span>
                  <button disabled={page >= result.totalPages} onClick={() => runSearch(page + 1)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 disabled:opacity-40 hover:border-slate-300">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <EligibilityModal open={showElig} onClose={() => setShowElig(false)} onApply={applyEligibility} profile={profile} setProfile={setProfile} nationalities={nationalities} loading={eligLoading} />
    </div>
  );
}
