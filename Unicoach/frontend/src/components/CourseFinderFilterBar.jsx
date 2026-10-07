import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Globe, MapPin, GraduationCap, Building2, Trophy, Wallet, Layers,
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

const formatUSD = (n) => `$${Number(n).toLocaleString('en-US')}`;

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
    filters.maxTuitionUSD > 0 && { key: 'maxTuitionUSD', label: `Under ${formatUSD(filters.maxTuitionUSD)}/yr` },
  ].filter(Boolean);

  const activeCount = activeChips.length;
  const set = (key) => (value) => onFilterChange && onFilterChange(key, value);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-6">
      {/* Search row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSearchSubmit) onSearchSubmit(e);
        }}
        className="flex flex-col sm:flex-row gap-2.5"
      >
        <div className="relative flex-1 flex items-center">
          <Search size={16} className="absolute left-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search a university, course or city, e.g. data science, Trinity, Toronto"
            className="w-full pl-10 pr-9 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-[13.5px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-500/10 transition placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-[#DE5C2B] hover:bg-[#C04A1D] active:scale-[0.98] text-white rounded-xl text-[13.5px] font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 cursor-pointer"
        >
          <Search size={15} /> Search
        </button>
      </form>

      {/* Advanced toggle */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-2 text-[13.5px] font-bold text-slate-800 hover:text-[#C04A1D] transition-colors cursor-pointer"
          aria-expanded={showAdvanced}
        >
          <SlidersHorizontal size={15} className="text-[#DE5C2B]" />
          Advanced filters
          {activeCount > 0 && (
            <span className="px-1.5 min-w-[20px] h-5 rounded-full bg-[#DE5C2B] text-white text-[11px] font-bold inline-flex items-center justify-center">
              {activeCount}
            </span>
          )}
          {showAdvanced ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </button>
        <div className="flex items-center gap-3">
          {loading && <Loader2 size={14} className="animate-spin text-slate-400" aria-label="Loading filters" />}
          <button
            type="button"
            onClick={onClearAll}
            className="text-[12.5px] font-semibold text-slate-500 hover:text-[#C04A1D] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw size={13} /> Clear all
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
          {/* Country */}
          <div>
            <FieldLabel icon={Globe} hint={options && !allCountry ? `${options.totalUniversities} universities` : null}>Country</FieldLabel>
            <div className="relative">
              <select
                value={allCountry ? 'All' : country}
                onChange={(e) => onCountryChange && onCountryChange(e.target.value)}
                className={selectClass}
              >
                <option value="All">All countries</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* City / Region (depends on the country) */}
          <div>
            <FieldLabel icon={MapPin} hint={!allCountry && options?.cities?.length ? `${options.cities.length} cities` : null}>
              City / Region
            </FieldLabel>
            <CityCombobox
              cities={allCountry ? [] : options?.cities || []}
              value={filters.city}
              onChange={set('city')}
              disabled={allCountry || !options?.cities?.length}
              placeholder={allCountry ? 'Select a country first' : loading ? 'Loading cities…' : 'Any city'}
            />
          </div>

          {/* Study area */}
          <div>
            <FieldLabel icon={Layers}>Study area</FieldLabel>
            <div className="relative">
              <select value={filters.studyArea} onChange={(e) => set('studyArea')(e.target.value)} className={selectClass}>
                <option value="">Any study area</option>
                {(options?.studyAreas || []).map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label} ({a.count})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Degree level */}
          <div>
            <FieldLabel icon={GraduationCap}>Degree level</FieldLabel>
            <ChipGroup options={options?.degreeLevels || []} value={filters.degreeLevel} onChange={set('degreeLevel')} />
          </div>

          {/* University type */}
          <div>
            <FieldLabel icon={Building2}>University type</FieldLabel>
            <ChipGroup options={options?.universityTypes || []} value={filters.universityType} onChange={set('universityType')} />
          </div>

          {/* World ranking */}
          <div>
            <FieldLabel icon={Trophy}>World ranking</FieldLabel>
            <ChipGroup
              options={options?.rankings || []}
              value={filters.maxRank || ''}
              onChange={(v) => set('maxRank')(Number(v) || 0)}
            />
          </div>

          {/* Max tuition */}
          <div className="sm:col-span-2 lg:col-span-3">
            <FieldLabel
              icon={Wallet}
              hint={options?.tuition ? `Range here: ${formatUSD(options.tuition.min)} – ${formatUSD(options.tuition.max)} / yr` : null}
            >
              Max tuition per year
            </FieldLabel>
            {tuitionSteps.length > 0 ? (
              <ChipGroup
                options={tuitionSteps.map((s) => ({ value: s, label: `Under ${formatUSD(s)}` }))}
                value={filters.maxTuitionUSD || ''}
                onChange={(v) => set('maxTuitionUSD')(Number(v) || 0)}
              />
            ) : (
              <p className="text-[12.5px] text-slate-500">
                {options?.tuition
                  ? `Every university here costs ${formatUSD(options.tuition.max)}/yr or less, so there is nothing to filter.`
                  : 'Loading…'}
              </p>
            )}
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
