import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, GraduationCap, Clock, Wallet, FileText, Bookmark, ArrowRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import { HeroBackButton } from '../components/ui/BackButton';
import { getSearchConfig, getHighlights, searchCourses } from '../utils/searchApi';

const PAGE_SIZE = 20;

// ---- helpers ----
const fmtMoney = (m) => {
  if (!m || !m.amount) return '—';
  const n = Number(m.amount);
  if (!n) return '—';
  return `${m.currency || ''} ${n.toLocaleString()}`.trim();
};
const FLAG = { 1: '🇺🇸', 2: '🇦🇺', 3: '🇨🇦', 4: '🇬🇧', 5: '🇳🇿', 6: '🇸🇬', 7: '🇦🇪', 8: '🇮🇪', 9: '🇩🇪', 10: '🇫🇷', 25: '🇲🇾', 16: '🇮🇹', 19: '🇪🇸' };

// ---- Program result card (course-level, UniCoach design language) ----
const ProgramCard = ({ c, highlightMap, onView }) => {
  const tags = (c.highlightIds || []).map((id) => highlightMap[id]).filter(Boolean).slice(0, 3);
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <button onClick={() => onView(c)} className="text-left">
          <h3 className="font-outfit text-[15px] sm:text-base font-bold text-[#0F172A] leading-snug hover:text-[#DE5C2B] transition-colors">
            {c.courseName}
          </h3>
        </button>
        <button className="shrink-0 w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#DE5C2B] hover:border-orange-200 transition-colors" title="Save">
          <Bookmark size={15} />
        </button>
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

  const runSearch = (toPage = 1) => {
    setLoading(true);
    setPage(toPage);
    searchCourses(filters, { sort, page: toPage, pageSize: PAGE_SIZE })
      .then((r) => setResult(r))
      .catch(() => setResult({ data: [], total: 0, totalPages: 0, highlightCounts: {} }))
      .finally(() => setLoading(false));
  };

  // re-run when refinements change (after an initial search exists)
  useEffect(() => {
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
          <div className="ml-auto flex items-center gap-2 text-[13px] text-slate-500">
            <SlidersHorizontal size={15} />
            {result ? <span><b className="text-[#0F172A]">{result.total?.toLocaleString()}</b> programs · {result.universitiesCount} universities</span> : <span>Start a search</span>}
          </div>
        </div>

        {/* Results */}
        <div className="mt-5">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={20} /> Searching…</div>
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
              {/* Pagination */}
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
    </div>
  );
}
