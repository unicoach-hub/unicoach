import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

// ─── Complete list of world countries with ISO codes ───
const ALL_COUNTRIES = [
  { name: 'Afghanistan', iso: 'af' },
  { name: 'Albania', iso: 'al' },
  { name: 'Algeria', iso: 'dz' },
  { name: 'Andorra', iso: 'ad' },
  { name: 'Angola', iso: 'ao' },
  { name: 'Antigua and Barbuda', iso: 'ag' },
  { name: 'Argentina', iso: 'ar' },
  { name: 'Armenia', iso: 'am' },
  { name: 'Australia', iso: 'au' },
  { name: 'Austria', iso: 'at' },
  { name: 'Azerbaijan', iso: 'az' },
  { name: 'Bahamas', iso: 'bs' },
  { name: 'Bahrain', iso: 'bh' },
  { name: 'Bangladesh', iso: 'bd' },
  { name: 'Barbados', iso: 'bb' },
  { name: 'Belarus', iso: 'by' },
  { name: 'Belgium', iso: 'be' },
  { name: 'Belize', iso: 'bz' },
  { name: 'Benin', iso: 'bj' },
  { name: 'Bhutan', iso: 'bt' },
  { name: 'Bolivia', iso: 'bo' },
  { name: 'Bosnia and Herzegovina', iso: 'ba' },
  { name: 'Botswana', iso: 'bw' },
  { name: 'Brazil', iso: 'br' },
  { name: 'Brunei', iso: 'bn' },
  { name: 'Bulgaria', iso: 'bg' },
  { name: 'Burkina Faso', iso: 'bf' },
  { name: 'Burundi', iso: 'bi' },
  { name: 'Cabo Verde', iso: 'cv' },
  { name: 'Cambodia', iso: 'kh' },
  { name: 'Cameroon', iso: 'cm' },
  { name: 'Canada', iso: 'ca' },
  { name: 'Central African Republic', iso: 'cf' },
  { name: 'Chad', iso: 'td' },
  { name: 'Chile', iso: 'cl' },
  { name: 'China', iso: 'cn' },
  { name: 'Colombia', iso: 'co' },
  { name: 'Comoros', iso: 'km' },
  { name: 'Congo (DRC)', iso: 'cd' },
  { name: 'Congo (Republic)', iso: 'cg' },
  { name: 'Costa Rica', iso: 'cr' },
  { name: 'Croatia', iso: 'hr' },
  { name: 'Cuba', iso: 'cu' },
  { name: 'Cyprus', iso: 'cy' },
  { name: 'Czech Republic', iso: 'cz' },
  { name: 'Denmark', iso: 'dk' },
  { name: 'Djibouti', iso: 'dj' },
  { name: 'Dominica', iso: 'dm' },
  { name: 'Dominican Republic', iso: 'do' },
  { name: 'Ecuador', iso: 'ec' },
  { name: 'Egypt', iso: 'eg' },
  { name: 'El Salvador', iso: 'sv' },
  { name: 'Equatorial Guinea', iso: 'gq' },
  { name: 'Eritrea', iso: 'er' },
  { name: 'Estonia', iso: 'ee' },
  { name: 'Eswatini', iso: 'sz' },
  { name: 'Ethiopia', iso: 'et' },
  { name: 'Fiji', iso: 'fj' },
  { name: 'Finland', iso: 'fi' },
  { name: 'France', iso: 'fr' },
  { name: 'Gabon', iso: 'ga' },
  { name: 'Gambia', iso: 'gm' },
  { name: 'Georgia', iso: 'ge' },
  { name: 'Germany', iso: 'de' },
  { name: 'Ghana', iso: 'gh' },
  { name: 'Greece', iso: 'gr' },
  { name: 'Grenada', iso: 'gd' },
  { name: 'Guatemala', iso: 'gt' },
  { name: 'Guinea', iso: 'gn' },
  { name: 'Guinea-Bissau', iso: 'gw' },
  { name: 'Guyana', iso: 'gy' },
  { name: 'Haiti', iso: 'ht' },
  { name: 'Honduras', iso: 'hn' },
  { name: 'Hong Kong', iso: 'hk' },
  { name: 'Hungary', iso: 'hu' },
  { name: 'Iceland', iso: 'is' },
  { name: 'India', iso: 'in' },
  { name: 'Indonesia', iso: 'id' },
  { name: 'Iran', iso: 'ir' },
  { name: 'Iraq', iso: 'iq' },
  { name: 'Ireland', iso: 'ie' },
  { name: 'Israel', iso: 'il' },
  { name: 'Italy', iso: 'it' },
  { name: 'Ivory Coast', iso: 'ci' },
  { name: 'Jamaica', iso: 'jm' },
  { name: 'Japan', iso: 'jp' },
  { name: 'Jordan', iso: 'jo' },
  { name: 'Kazakhstan', iso: 'kz' },
  { name: 'Kenya', iso: 'ke' },
  { name: 'Kiribati', iso: 'ki' },
  { name: 'Kosovo', iso: 'xk' },
  { name: 'Kuwait', iso: 'kw' },
  { name: 'Kyrgyzstan', iso: 'kg' },
  { name: 'Laos', iso: 'la' },
  { name: 'Latvia', iso: 'lv' },
  { name: 'Lebanon', iso: 'lb' },
  { name: 'Lesotho', iso: 'ls' },
  { name: 'Liberia', iso: 'lr' },
  { name: 'Libya', iso: 'ly' },
  { name: 'Liechtenstein', iso: 'li' },
  { name: 'Lithuania', iso: 'lt' },
  { name: 'Luxembourg', iso: 'lu' },
  { name: 'Madagascar', iso: 'mg' },
  { name: 'Malawi', iso: 'mw' },
  { name: 'Malaysia', iso: 'my' },
  { name: 'Maldives', iso: 'mv' },
  { name: 'Mali', iso: 'ml' },
  { name: 'Malta', iso: 'mt' },
  { name: 'Marshall Islands', iso: 'mh' },
  { name: 'Mauritania', iso: 'mr' },
  { name: 'Mauritius', iso: 'mu' },
  { name: 'Mexico', iso: 'mx' },
  { name: 'Micronesia', iso: 'fm' },
  { name: 'Moldova', iso: 'md' },
  { name: 'Monaco', iso: 'mc' },
  { name: 'Mongolia', iso: 'mn' },
  { name: 'Montenegro', iso: 'me' },
  { name: 'Morocco', iso: 'ma' },
  { name: 'Mozambique', iso: 'mz' },
  { name: 'Myanmar', iso: 'mm' },
  { name: 'Namibia', iso: 'na' },
  { name: 'Nauru', iso: 'nr' },
  { name: 'Nepal', iso: 'np' },
  { name: 'Netherlands', iso: 'nl' },
  { name: 'New Zealand', iso: 'nz' },
  { name: 'Nicaragua', iso: 'ni' },
  { name: 'Niger', iso: 'ne' },
  { name: 'Nigeria', iso: 'ng' },
  { name: 'North Korea', iso: 'kp' },
  { name: 'North Macedonia', iso: 'mk' },
  { name: 'Norway', iso: 'no' },
  { name: 'Oman', iso: 'om' },
  { name: 'Pakistan', iso: 'pk' },
  { name: 'Palau', iso: 'pw' },
  { name: 'Palestine', iso: 'ps' },
  { name: 'Panama', iso: 'pa' },
  { name: 'Papua New Guinea', iso: 'pg' },
  { name: 'Paraguay', iso: 'py' },
  { name: 'Peru', iso: 'pe' },
  { name: 'Philippines', iso: 'ph' },
  { name: 'Poland', iso: 'pl' },
  { name: 'Portugal', iso: 'pt' },
  { name: 'Qatar', iso: 'qa' },
  { name: 'Romania', iso: 'ro' },
  { name: 'Russia', iso: 'ru' },
  { name: 'Rwanda', iso: 'rw' },
  { name: 'Saint Kitts and Nevis', iso: 'kn' },
  { name: 'Saint Lucia', iso: 'lc' },
  { name: 'Saint Vincent', iso: 'vc' },
  { name: 'Samoa', iso: 'ws' },
  { name: 'San Marino', iso: 'sm' },
  { name: 'Sao Tome and Principe', iso: 'st' },
  { name: 'Saudi Arabia', iso: 'sa' },
  { name: 'Senegal', iso: 'sn' },
  { name: 'Serbia', iso: 'rs' },
  { name: 'Seychelles', iso: 'sc' },
  { name: 'Sierra Leone', iso: 'sl' },
  { name: 'Singapore', iso: 'sg' },
  { name: 'Slovakia', iso: 'sk' },
  { name: 'Slovenia', iso: 'si' },
  { name: 'Solomon Islands', iso: 'sb' },
  { name: 'Somalia', iso: 'so' },
  { name: 'South Africa', iso: 'za' },
  { name: 'South Korea', iso: 'kr' },
  { name: 'South Sudan', iso: 'ss' },
  { name: 'Spain', iso: 'es' },
  { name: 'Sri Lanka', iso: 'lk' },
  { name: 'Sudan', iso: 'sd' },
  { name: 'Suriname', iso: 'sr' },
  { name: 'Sweden', iso: 'se' },
  { name: 'Switzerland', iso: 'ch' },
  { name: 'Syria', iso: 'sy' },
  { name: 'Taiwan', iso: 'tw' },
  { name: 'Tajikistan', iso: 'tj' },
  { name: 'Tanzania', iso: 'tz' },
  { name: 'Thailand', iso: 'th' },
  { name: 'Timor-Leste', iso: 'tl' },
  { name: 'Togo', iso: 'tg' },
  { name: 'Tonga', iso: 'to' },
  { name: 'Trinidad and Tobago', iso: 'tt' },
  { name: 'Tunisia', iso: 'tn' },
  { name: 'Turkey', iso: 'tr' },
  { name: 'Turkmenistan', iso: 'tm' },
  { name: 'Tuvalu', iso: 'tv' },
  { name: 'Uganda', iso: 'ug' },
  { name: 'Ukraine', iso: 'ua' },
  { name: 'United Arab Emirates', iso: 'ae' },
  { name: 'United Kingdom', iso: 'gb' },
  { name: 'United States', iso: 'us' },
  { name: 'Uruguay', iso: 'uy' },
  { name: 'Uzbekistan', iso: 'uz' },
  { name: 'Vanuatu', iso: 'vu' },
  { name: 'Vatican City', iso: 'va' },
  { name: 'Venezuela', iso: 've' },
  { name: 'Vietnam', iso: 'vn' },
  { name: 'Yemen', iso: 'ye' },
  { name: 'Zambia', iso: 'zm' },
  { name: 'Zimbabwe', iso: 'zw' },
];

// Popular study-abroad destinations shown at top
const POPULAR_NAMES = [
  'Germany', 'United States', 'United Kingdom', 'Canada',
  'Australia', 'Ireland', 'France', 'Netherlands',
  'Sweden', 'Italy', 'New Zealand', 'Singapore',
  'Switzerland', 'Japan', 'South Korea',
];

export { ALL_COUNTRIES };

/**
 * SearchableCountrySelect – a premium, accessible country picker with search & flags.
 *
 * Props:
 *  - value        : currently selected country name string
 *  - onChange(name): callback receiving the selected country name
 *  - placeholder   : text shown when nothing is selected
 *  - label         : optional label rendered above the trigger
 *  - required      : show asterisk next to label
 *  - className     : extra classes on outer wrapper
 *  - error         : error message string
 */
export default function CountrySelect({
  value = '',
  onChange,
  placeholder = 'Select country…',
  label,
  required = false,
  className = '',
  error = '',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  // Filtered + grouped list
  const { popular, rest } = useMemo(() => {
    const q = search.toLowerCase().trim();
    const matchAll = q === '';

    const popularSet = new Set(POPULAR_NAMES);
    const popularList = [];
    const restList = [];

    for (const c of ALL_COUNTRIES) {
      if (!matchAll && !c.name.toLowerCase().includes(q)) continue;
      if (popularSet.has(c.name)) popularList.push(c);
      else restList.push(c);
    }

    // Keep popular list in defined order
    const orderedPopular = POPULAR_NAMES
      .map((n) => popularList.find((p) => p.name === n))
      .filter(Boolean);

    return { popular: orderedPopular, rest: restList };
  }, [search]);

  const selectedCountry = ALL_COUNTRIES.find(
    (c) => c.name === value || c.name.toLowerCase() === (value || '').toLowerCase()
  );

  const handleSelect = (country) => {
    onChange(country.name);
    setOpen(false);
    setSearch('');
  };

  const CountryRow = ({ country, isActive }) => (
    <button
      type="button"
      onClick={() => handleSelect(country)}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
        isActive
          ? 'bg-[#DE5C2B]/8 text-[#DE5C2B] font-semibold'
          : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      <img
        src={`https://flagcdn.com/w40/${country.iso}.png`}
        alt=""
        className="w-5 h-3.5 object-cover rounded-[2px] border border-black/8 shadow-sm flex-shrink-0"
        loading="lazy"
      />
      <span className="truncate">{country.name}</span>
    </button>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* ─── Trigger Button ─── */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
          open
            ? 'border-[#DE5C2B] ring-4 ring-[#DE5C2B]/10 bg-white'
            : error
            ? 'border-rose-300 bg-white'
            : 'border-slate-200/90 bg-white hover:border-slate-300'
        }`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {selectedCountry ? (
            <>
              <img
                src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`}
                alt=""
                className="w-5 h-3.5 object-cover rounded-[2px] border border-black/8 shadow-sm flex-shrink-0"
              />
              <span className="text-slate-900 font-medium truncate">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

      {/* ─── Dropdown Panel ─── */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-[0_12px_40px_-10px_rgba(15,23,42,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Input */}
          <div className="p-2.5 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search countries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg bg-slate-50 border border-slate-200/80 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/15 focus:border-[#DE5C2B]/50 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Country List */}
          <div className="max-h-[280px] overflow-y-auto overscroll-contain">
            {popular.length === 0 && rest.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No countries match "{search}"
              </div>
            ) : (
              <>
                {popular.length > 0 && (
                  <>
                    <div className="px-3.5 pt-2.5 pb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Popular Destinations
                      </span>
                    </div>
                    {popular.map((c) => (
                      <CountryRow key={c.iso} country={c} isActive={value === c.name} />
                    ))}
                  </>
                )}
                {rest.length > 0 && (
                  <>
                    <div className="px-3.5 pt-3 pb-1 border-t border-slate-100">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        All Countries
                      </span>
                    </div>
                    {rest.map((c) => (
                      <CountryRow key={c.iso} country={c} isActive={value === c.name} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
