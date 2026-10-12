import { formatInCountryCurrency, getCountryMeta } from '../utils/courseFinderHelper';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, MapPin, Trophy, Wallet, Layers,
  SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp, X, Check, Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { EMPTY_FILTERS } from '../utils/shortlistProfile';

/**
 * Search + advanced filters for the university shortlist.
 * Every option comes from GET /shortlist/filter-options for the chosen country, so each one
 * is backed by real data and returns results (e.g. Ireland → Dublin, Cork, Galway…).
 */

const TUITION_STEPS = [5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000];

const COUNTRY_LABELS = {
  USA: 'United States',
  UK: 'United Kingdom',
};

const optionsCache = new Map();

// Amounts are stored in USD; labels show the selected country's currency (€ for Ireland)
const formatUSD = (n, meta) => formatInCountryCurrency(n, meta);

const isAllCountry = (c) => !c || ['all', 'all destinations', 'all global destinations'].includes(String(c).toLowerCase());

// Countries with data are the same for every response; kept so the country list doesn't blink while a new country loads
let knownCountries = [];

const useFilterOptions = (country) => {
  const key = isAllCountry(country) ? 'All' : country;
  const [result, setResult] = useState({ key: null, data: null });

  useEffect(() => {
    if (optionsCache.has(key)) return undefined;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/shortlist/filter-options?country=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const ok = Boolean(data && data.success);
        if (ok) {
          optionsCache.set(key, data);
          knownCountries = data.countries || knownCountries;
        }
        setResult({ key, data: ok ? data : null });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setResult({ key, data: null });
      });
    return () => controller.abort();
  }, [key]);

  if (optionsCache.has(key)) return { data: optionsCache.get(key), loading: false, countries: knownCountries };
  return { data: result.key === key ? result.data : null, loading: result.key !== key, countries: knownCountries };
};

const FieldLabel = ({ icon: Icon, children, hint }) => (
  <div className="flex items-center justify-between mb-1.5">
    <span className="text-[12px] font-semibold text-slate-700 flex items-center gap-1.5">
      <Icon size={14} className="text-[#DE5C2B]" /> {children}
    </span>
    {hint && <span className="text-[10.5px] font-medium text-slate-400">{hint}</span>}
  </div>
);

const selectClass =
  'w-full pl-3 pr-8 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-500/10 transition appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

// eslint-disable-next-line no-unused-vars
const ChipGroup = ({ options, value, onChange, anyLabel = 'Any' }) => (
  <div className="flex flex-wrap gap-1.5">
    {[{ value: '', label: anyLabel }, ...options].map((o) => {
      const active = String(value || '') === String(o.value || '');
      return (
        <button
          key={o.value || 'any'}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={active}
          className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all cursor-pointer ${
            active
              ? 'bg-[#DE5C2B] border-[#DE5C2B] text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:text-[#C04A1D]'
          }`}
        >
          {o.label}
          {typeof o.count === 'number' && (
            <span className={`ml-1 text-[10.5px] ${active ? 'text-orange-100' : 'text-slate-400'}`}>{o.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

// Searchable city picker: the USA alone has 1,000+ cities, so a plain <select> isn't usable
const CityCombobox = ({ cities, value, onChange, disabled, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? cities.filter((c) => c.name.toLowerCase().includes(q)) : cities;
    return list.slice(0, 80);
  }, [cities, query]);

  const pick = (name) => {
    onChange(name);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`${selectClass} text-left flex items-center`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}>{value || placeholder}</span>
      </button>
      {value && !disabled ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
          aria-label="Clear city"
        >
          <X size={14} />
        </button>
      ) : (
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      )}

      {open && !disabled && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)] overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (matches[0]) pick(matches[0].name);
                }
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder={`Search ${cities.length} cities…`}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#DE5C2B] focus:bg-white"
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {matches.length === 0 && <li className="px-3 py-2.5 text-[12.5px] text-slate-400">No city matches “{query}”</li>}
            {matches.map((c) => {
              const active = c.name === value;
              return (
                <li key={c.name}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => pick(c.name)}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left text-[13px] cursor-pointer ${
                      active ? 'bg-orange-50 text-[#C04A1D] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {active && <Check size={13} />} {c.name}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                      {c.count} {c.count === 1 ? 'uni' : 'unis'}
                    </span>
                  </button>
                </li>
              );
            })}
            {cities.length > matches.length && !query && (
              <li className="px-3 py-2 text-[11px] text-slate-400 border-t border-slate-100">Type to search all {cities.length} cities</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const SelectBox = ({ value, onChange: change, children, label, disabled }) => (
  <div className="relative">
    <select aria-label={label} value={value} onChange={(e) => change(e.target.value)} className={selectClass} disabled={disabled}>
      {children}
    </select>
    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

const CourseFinderFilterBar = ({
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  country = 'All',
  onCountryChange,
  filters = EMPTY_FILTERS,
  onFilterChange,
  onClearAll,
}) => {
  // Open on desktop; collapsed on phones so the results stay in view
  const [showAdvanced, setShowAdvanced] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768);
  const { data: options, loading, countries: knownCountryList } = useFilterOptions(country);
  const allCountry = isAllCountry(country);
  const money = getCountryMeta(allCountry ? '' : country);

  const countries = useMemo(() => {
    const source = options?.countries || knownCountryList;
    const list = source.map((c) => ({ value: c.name, label: COUNTRY_LABELS[c.name] || c.name, count: c.count }));
    // Keep the student's chosen destination selectable even if we have no universities there yet
    if (!allCountry && !list.some((c) => c.value.toLowerCase() === String(country).toLowerCase())) {
      const noData = source.length > 0;
      list.push({ value: country, label: `${COUNTRY_LABELS[country] || country}${noData ? ' (no universities yet)' : ''}`, count: 0 });
    }
    return list;
  }, [options, knownCountryList, country, allCountry]);

  const tuitionSteps = useMemo(() => {
    const t = options?.tuition;
    if (!t) return [];
    return TUITION_STEPS.filter((s) => s >= t.min && s < t.max);
  }, [options]);

  const activeChips = [
    filters.city && { key: 'city', label: filters.city },
    filters.studyArea && { key: 'studyArea', label: options?.studyAreas?.find((a) => a.value === filters.studyArea)?.label || 'Study area' },
    filters.degreeLevel && { key: 'degreeLevel', label: options?.degreeLevels?.find((d) => d.value === filters.degreeLevel)?.label || 'Degree' },
    filters.universityType && { key: 'universityType', label: options?.universityTypes?.find((t) => t.value === filters.universityType)?.label || 'Type' },
    filters.maxRank > 0 && { key: 'maxRank', label: `Top ${filters.maxRank}` },
    filters.maxTuitionUSD > 0 && { key: 'maxTuitionUSD', label: `Under ${formatUSD(filters.maxTuitionUSD, money)}/yr` },
  ].filter(Boolean);

  const activeCount = activeChips.length;
  const set = (key) => (value) => onFilterChange && onFilterChange(key, value);

  const degreeOptions = options?.degreeLevels || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-6">
      {/* Top row: what, where, which level */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSearchSubmit) onSearchSubmit(e);
        }}
        className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 items-end"
      >
        <div>
          <span className="block text-[12px] font-semibold text-slate-700 mb-1.5">Search programs</span>
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Course, university or city, e.g. Cyber, Trinity"
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-[13.5px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-500/10 transition placeholder:text-slate-400"
            />
            {searchQuery && (
              <button type="button" onClick={() => onSearchChange('')} className="absolute right-3 text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
        <div>
          <span className="block text-[12px] font-semibold text-slate-700 mb-1.5">Country</span>
          <SelectBox label="Country" value={allCountry ? 'All' : country} onChange={(v) => onCountryChange && onCountryChange(v)}>
            <option value="All">All countries</option>
            {countries.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </SelectBox>
        </div>
        <div>
          <span className="block text-[12px] font-semibold text-slate-700 mb-1.5">Program level</span>
          <SelectBox label="Program level" value={filters.degreeLevel || ''} onChange={set('degreeLevel')}>
            <option value="">All levels</option>
            {degreeOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </SelectBox>
        </div>
        <button
          type="submit"
          className="h-[42px] px-6 bg-[#DE5C2B] hover:bg-[#C04A1D] active:scale-[0.98] text-white rounded-xl text-[13.5px] font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 cursor-pointer"
        >
          Search <Search size={15} />
        </button>
      </form>

      {/* Advanced search toggle */}
      <div className="relative flex items-center justify-center mt-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-2 text-[15px] font-bold text-[#C04A1D] hover:text-[#DE5C2B] transition-colors cursor-pointer"
          aria-expanded={showAdvanced}
        >
          <SlidersHorizontal size={16} />
          Advanced search
          {activeCount > 0 && (
            <span className="px-1.5 min-w-[20px] h-5 rounded-full bg-[#DE5C2B] text-white text-[11px] font-bold inline-flex items-center justify-center">{activeCount}</span>
          )}
          {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        <div className="absolute right-0 flex items-center gap-3">
          {loading && <Loader2 size={14} className="animate-spin text-slate-400" aria-label="Loading filters" />}
          <button type="button" onClick={onClearAll} className="text-[12.5px] font-semibold text-slate-500 hover:text-[#C04A1D] flex items-center gap-1 cursor-pointer transition-colors">
            Clear all <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">
          {/* Column 1: program level */}
          <div className="lg:pr-6 pb-5 lg:pb-0">
            <h4 className="text-[14px] font-bold text-slate-900 mb-3">Program level</h4>
            <div className="space-y-2.5">
              {[{ value: '', label: 'All levels' }, ...degreeOptions].map((d) => {
                const on = String(filters.degreeLevel || '') === String(d.value);
                return (
                  <label key={d.value || 'all'} className="flex items-center gap-2.5 text-[13.5px] text-slate-700 cursor-pointer">
                    <input type="radio" name="cf-level" checked={on} onChange={() => set('degreeLevel')(d.value)} className="w-4 h-4 accent-[#DE5C2B] cursor-pointer" />
                    <span className={on ? 'font-semibold text-slate-900' : ''}>{d.label}</span>
                    {typeof d.count === 'number' && <span className="text-[11.5px] text-slate-400">{d.count}</span>}
                  </label>
                );
              })}
            </div>

            <h4 className="text-[14px] font-bold text-slate-900 mt-6 mb-3">University type</h4>
            <div className="space-y-2.5">
              {[{ value: '', label: 'Any type' }, ...(options?.universityTypes || [])].map((t) => {
                const on = String(filters.universityType || '') === String(t.value);
                return (
                  <label key={t.value || 'any'} className="flex items-center gap-2.5 text-[13.5px] text-slate-700 cursor-pointer">
                    <input type="radio" name="cf-type" checked={on} onChange={() => set('universityType')(t.value)} className="w-4 h-4 accent-[#DE5C2B] cursor-pointer" />
                    <span className={on ? 'font-semibold text-slate-900' : ''}>{t.label}</span>
                    {typeof t.count === 'number' && <span className="text-[11.5px] text-slate-400">{t.count}</span>}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Column 2: other filters */}
          <div className="lg:px-6 py-5 lg:py-0 border-t lg:border-t-0 border-slate-100 space-y-4">
            <h4 className="text-[14px] font-bold text-slate-900">Other filters</h4>
            <div>
              <FieldLabel icon={MapPin} hint={!allCountry && options?.cities?.length ? `${options.cities.length} cities` : null}>City / Region</FieldLabel>
              <CityCombobox
                cities={allCountry ? [] : options?.cities || []}
                value={filters.city}
                onChange={set('city')}
                disabled={allCountry || !options?.cities?.length}
                placeholder={allCountry ? 'Select a country first' : loading ? 'Loading cities…' : 'Any city'}
              />
            </div>
            <div>
              <FieldLabel icon={Layers}>Study area</FieldLabel>
              <SelectBox label="Study area" value={filters.studyArea} onChange={set('studyArea')}>
                <option value="">Any study area</option>
                {(options?.studyAreas || []).map((a) => <option key={a.value} value={a.value}>{a.label} ({a.count})</option>)}
              </SelectBox>
            </div>
            <div>
              <FieldLabel icon={Trophy}>World ranking</FieldLabel>
              <SelectBox label="World ranking" value={filters.maxRank || ''} onChange={(v) => set('maxRank')(Number(v) || 0)}>
                <option value="">Any ranking</option>
                {(options?.rankings || []).map((r) => <option key={r.value} value={r.value}>{r.label}{typeof r.count === 'number' ? ` (${r.count})` : ''}</option>)}
              </SelectBox>
            </div>
            <div>
              <FieldLabel icon={Wallet} hint={options?.tuition ? `Here: ${formatUSD(options.tuition.min, money)} – ${formatUSD(options.tuition.max, money)}` : null}>
                Max tuition per year
              </FieldLabel>
              <SelectBox label="Max tuition per year" value={filters.maxTuitionUSD || ''} onChange={(v) => set('maxTuitionUSD')(Number(v) || 0)} disabled={!tuitionSteps.length}>
                <option value="">Any fee</option>
                {tuitionSteps.map((s) => <option key={s} value={s}>Under {formatUSD(s, money)}</option>)}
              </SelectBox>
            </div>
          </div>

          {/* Column 3: requirements (course-level data still being added) */}
          <div className="lg:pl-6 pt-5 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <h4 className="text-[14px] font-bold text-slate-900 mb-1">Requirements</h4>
            <p className="text-[11.5px] text-slate-400 mb-3">Being added country by country from official course pages. These switch on as the data comes in.</p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-2.5">
              {['IELTS', 'PTE', 'TOEFL iBT', 'Duolingo (DET)', 'GRE', 'GMAT', 'Without English test', 'Without GRE', 'Without GMAT', 'Scholarship available', 'Application fee waiver', 'STEM programs', 'With 15 years of education', 'Intake and duration'].map((r) => (
                <label key={r} className="flex items-center gap-2.5 text-[13px] text-slate-400 cursor-not-allowed" title="Coming soon: course-level data is being added">
                  <input type="checkbox" disabled className="w-4 h-4" />
                  {r}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filters */}
      {activeChips.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11.5px] font-semibold text-slate-400 mr-1">Active:</span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => set(chip.key)(EMPTY_FILTERS[chip.key])}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[12px] font-semibold text-[#C04A1D] hover:bg-orange-100 cursor-pointer"
              aria-label={`Remove ${chip.label}`}
            >
              {chip.label} <X size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseFinderFilterBar;
