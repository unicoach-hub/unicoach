import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShieldCheck, ArrowUpRight, ChevronLeft, Loader2, X, GraduationCap } from 'lucide-react';
import { getPublicMentorsDirectory } from '../api/unicoachApi';
import { MentorRating } from '../components/MentorRating';
import { MentorAvatar } from '../components/MentorAvatar';
import {
  FEATURED_MENTORS,
  SERVICE_TYPE_OPTIONS,
  RATING_OPTIONS,
  PRICE_RANGES,
  SORT_OPTIONS,
  formatPrice,
  getCountryFlagCode,
  getCountryLabel,
  mentorHref,
} from '../utils/mentorDirectory';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['country', 'serviceType', 'minRating', 'price'];
const SERVICE_LABELS = Object.fromEntries(SERVICE_TYPE_OPTIONS.map((o) => [o.value, o.label]));

const selectClass =
  'h-10 pl-3.5 pr-8 rounded-full bg-white border border-slate-200 text-xs sm:text-[13px] font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#DE5C2B] cursor-pointer shadow-2xs';

const FilterSelect = ({ label, value, onChange, options }) => (
  <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

const MentorRow = ({ mentor: m }) => {
  const flagCode = getCountryFlagCode(m.country);
  const academic = [m.university, m.course].filter(Boolean).join(' · ');
  const serviceTypes = [...new Set((m.services || []).map((s) => s.type))];

  return (
    <Link
      to={mentorHref(m)}
      className="group flex items-start sm:items-center gap-3.5 sm:gap-5 bg-white rounded-2xl border border-slate-200/80 hover:border-[#DE5C2B]/40 p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_24px_-8px_rgba(222,92,43,0.16)] transition-all"
    >
      {/* Avatar */}
      <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100">
        <MentorAvatar mentor={m} imgClassName="w-full h-full object-cover object-top" letterClassName="text-2xl" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-outfit font-black text-[15px] sm:text-base text-slate-900 group-hover:text-[#DE5C2B] transition-colors truncate">
            {m.name}
          </h3>
          <ShieldCheck className="w-4 h-4 text-[#DE5C2B] shrink-0" aria-label="Verified" />
          {m.isFeatured ? (
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">Featured</span>
          ) : (
            <MentorRating rating={m.rating} reviewCount={m.reviewCount} />
          )}
        </div>

        {m.headline && <p className="text-xs sm:text-[13px] text-slate-600 truncate mt-0.5">{m.headline}</p>}

        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-1.5 text-[11.5px] text-slate-500">
          {flagCode && (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <img src={`https://flagcdn.com/w40/${flagCode}.png`} alt="" className="w-3.5 h-2.5 rounded-2xs object-cover" />
              {getCountryLabel(m.country)}
            </span>
          )}
          {academic && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{academic}</span>
            </span>
          )}
          {m.completedSessions > 0 && <span>{m.completedSessions} sessions done</span>}
        </div>

        {serviceTypes.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap mt-2">
            {serviceTypes.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10.5px] font-semibold text-slate-600">
                {SERVICE_LABELS[t] || t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price & CTA */}
      <div className="shrink-0 flex flex-col items-end gap-2 self-center">
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase text-slate-400 block leading-none">From</span>
          <span className="font-outfit text-sm sm:text-base font-black text-slate-900">{formatPrice(m.startingPriceINR)}</span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#111111] group-hover:bg-[#DE5C2B] text-white text-[11px] font-bold transition-colors">
          View profile
          <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};

const MentorsDirectoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const country = searchParams.get('country') || '';
  const serviceType = searchParams.get('serviceType') || '';
  const minRating = searchParams.get('minRating') || '';
  const price = searchParams.get('price') || '';
  const sort = searchParams.get('sort') || 'top_rated';

  const [searchInput, setSearchInput] = useState(search);
  const [mentors, setMentors] = useState([]);
  const [total, setTotal] = useState(0);
  const [countries, setCountries] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  // Key of the last finished request; anything else means a request is in flight
  const [settled, setSettled] = useState({ key: null, error: '' });

  const updateParam = (key, value) => {
    setPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value && !(key === 'sort' && value === 'top_rated')) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  };

  // Debounce typing into the URL so every keystroke doesn't hit the API
  useEffect(() => {
    if (searchInput.trim() === search) return undefined;
    const t = setTimeout(() => updateParam('search', searchInput.trim()), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const requestKey = [search, country, serviceType, minRating, price, sort, page].join('|');
  const loading = settled.key !== requestKey;
  const error = loading ? '' : settled.error;

  useEffect(() => {
    const controller = new AbortController();
    const [minPrice, maxPrice] = price ? price.split('-') : ['', ''];
    getPublicMentorsDirectory(
      { search, country, serviceType, minRating, minPrice, maxPrice, sort, page, limit: PAGE_SIZE },
      { signal: controller.signal }
    )
      .then((data) => {
        setMentors((prev) => (page === 1 ? data.mentors || [] : [...prev, ...(data.mentors || [])]));
        setTotal(data.total || 0);
        setHasMore(Boolean(data.hasMore));
        if (data.countries) setCountries(data.countries);
        setSettled({ key: requestKey, error: '' });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setSettled({ key: requestKey, error: err.message || 'Could not load mentors.' });
      });
    return () => controller.abort();
    // requestKey changes exactly when one of the inputs below does
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, country, serviceType, minRating, price, sort, page]);

  // Featured team mentors aren't in the database, so they only appear (pinned on top)
  // in the default view or when the search matches them.
  const featured = useMemo(() => {
    if (FILTER_KEYS.some((k) => searchParams.get(k)) || sort !== 'top_rated') return [];
    const q = search.toLowerCase();
    return FEATURED_MENTORS.filter((m) => !q || `${m.name} ${m.headline} ${m.country}`.toLowerCase().includes(q));
  }, [searchParams, search, sort]);

  const countryOptions = useMemo(() => {
    const unique = new Map();
    countries.forEach((c) => {
      const label = getCountryLabel(c);
      if (!unique.has(label)) unique.set(label, c);
    });
    return [{ value: '', label: 'All countries' }, ...[...unique].map(([label, value]) => ({ value, label }))];
  }, [countries]);

  const activeFilterCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length + (search ? 1 : 0);
  const shownTotal = total + featured.length;
  const rows = [...featured, ...mentors];

  const clearAll = () => {
    setPage(1);
    setSearchInput('');
    setSearchParams(sort !== 'top_rated' ? { sort } : {}, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20">

        <Link to="/unicoach#mentors-grid" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#DE5C2B] mb-4">
          <ChevronLeft className="w-4 h-4" />
          Back to UniCoach
        </Link>

        <h1 className="font-outfit text-3xl sm:text-4xl font-black text-[#111111] tracking-tight leading-tight">
          All Mentors
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 mb-6">
          Verified seniors from top universities, ranked by student ratings. Filter by what you need.
        </p>

        {/* ════════ SEARCH + FILTERS ════════ */}
        <div className="sticky top-16 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 bg-[#FAF9F6]/95 backdrop-blur-md">
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, university, course, or expertise..."
              aria-label="Search mentors"
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#DE5C2B] transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 [scrollbar-width:none]">
            <FilterSelect label="Country" value={country} onChange={(v) => updateParam('country', v)} options={countryOptions} />
            <FilterSelect label="Service type" value={serviceType} onChange={(v) => updateParam('serviceType', v)} options={SERVICE_TYPE_OPTIONS} />
            <FilterSelect label="Minimum rating" value={minRating} onChange={(v) => updateParam('minRating', v)} options={RATING_OPTIONS} />
            <FilterSelect label="Price" value={price} onChange={(v) => updateParam('price', v)} options={PRICE_RANGES} />
            <div className="ml-auto shrink-0 flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] font-semibold text-slate-400">Sort</span>
              <FilterSelect label="Sort by" value={sort} onChange={(v) => updateParam('sort', v)} options={SORT_OPTIONS} />
            </div>
          </div>
        </div>

        {/* ════════ RESULT COUNT ════════ */}
        <div className="flex items-center justify-between mt-4 mb-3 text-xs sm:text-[13px]">
          <span className="font-semibold text-slate-600">
            {loading && page === 1 ? 'Loading mentors…' : `${shownTotal} mentor${shownTotal === 1 ? '' : 's'} found`}
          </span>
          {activeFilterCount > 0 && (
            <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 font-bold text-[#DE5C2B] hover:underline cursor-pointer">
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-4 mb-4">{error}</div>
        )}

        {/* ════════ MENTOR LIST ════════ */}
        <div className={`flex flex-col gap-3 transition-opacity ${loading && page === 1 ? 'opacity-50' : ''}`}>
          {rows.map((m) => (
            <MentorRow key={m._id} mentor={m} />
          ))}
        </div>

        {/* Empty State */}
        {!loading && !error && rows.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-10 sm:p-14 text-center shadow-sm">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-outfit text-lg font-bold text-[#0F172A] mb-1.5">No mentors match these filters</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
              Try removing a filter or searching for something broader.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ════════ LOAD MORE ════════ */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-300 hover:border-slate-500 text-sm font-bold text-slate-800 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Load more mentors
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsDirectoryPage;
