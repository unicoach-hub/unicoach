import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Award, ExternalLink, Search, Landmark, Building2, HandCoins, MapPin, X, Info } from 'lucide-react';
import data from '../data/indianScholarships.json';

// Scholarships for students studying in India (central govt, state govt, private/CSR).
// Curated by hand from official pages; `checkedOn` is when every link and amount was last verified.
const { checkedOn, scholarships: ALL } = data;

const LEVELS = [['school', 'Class 9–12'], ['diploma', 'Diploma'], ['ug', 'Undergraduate'], ['pg', 'Postgraduate'], ['phd', 'PhD / research']];
const TYPES = [['central', 'Central govt', Landmark], ['state', 'State govt', MapPin], ['private', 'Companies & trusts', Building2]]; // includes PSUs like LIC and SBI
const CATEGORIES = [['girls', 'Girls'], ['sc', 'SC'], ['st', 'ST'], ['obc', 'OBC'], ['minority', 'Minority'], ['ews', 'EWS'], ['disability', 'Disability'], ['merit', 'Merit'], ['income', 'Low income']];
const TYPE_LABEL = Object.fromEntries(TYPES.map(([k, l]) => [k, l]));
const LEVEL_LABEL = Object.fromEntries(LEVELS);
const STATES = [...new Set(ALL.map((s) => s.state).filter(Boolean))].sort();

const checkedLabel = new Date(checkedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const Pill = ({ on, onClick, children }) => (
  <button type="button" onClick={onClick} aria-pressed={on}
    className="px-3 py-1.5 text-[12.5px] font-medium border transition-colors whitespace-nowrap"
    style={{ borderRadius: 999, background: on ? '#4D3C21' : '#fff', color: on ? '#fff' : '#4D3C21', borderColor: on ? '#4D3C21' : '#EAD8AE' }}>
    {children}
  </button>
);

const ScholarshipCard = ({ s }) => {
  const TypeIcon = (TYPES.find(([k]) => k === s.providerType) || [])[2] || HandCoins;
  return (
    <article className="bg-white border border-[#E6E0D4] p-4 sm:p-5 flex flex-col gap-3" style={{ borderRadius: 14 }}>
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 shrink-0 grid place-items-center bg-[#FBF7EE] border border-[#EAD8AE]" style={{ borderRadius: 10 }}><TypeIcon size={16} className="text-[#977435]" /></span>
        <div className="min-w-0">
          <h3 className="text-[15.5px] font-semibold text-[#16130F] leading-snug">{s.name}</h3>
          <p className="text-[12.5px] text-[#5B544A] mt-0.5">{s.provider}{s.state ? ` · ${s.state}` : ''}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#FBF7EE] text-[#977435] border border-[#EAD8AE]" style={{ borderRadius: 999 }}>{TYPE_LABEL[s.providerType]}</span>
        {(s.levels || []).map((l) => <span key={l} className="px-2 py-0.5 text-[11px] font-medium bg-[#F6F3EC] text-[#5B544A]" style={{ borderRadius: 999 }}>{LEVEL_LABEL[l] || l}</span>)}
      </div>
      <p className="text-[13.5px] text-[#16130F] leading-relaxed">{s.forWhom}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
        <div><dt className="text-[11px] uppercase tracking-wide text-[#9E9384]">Amount</dt>
          <dd className="font-semibold text-[#16130F]">{s.amountVerified && s.amount ? s.amount : 'See official page'}</dd></div>
        {s.incomeLimit && <div><dt className="text-[11px] uppercase tracking-wide text-[#9E9384]">Income limit</dt><dd className="text-[#16130F]">{s.incomeLimit}</dd></div>}
        {s.deadline && <div><dt className="text-[11px] uppercase tracking-wide text-[#9E9384]">When to apply</dt><dd className="text-[#16130F]">{s.deadline}</dd></div>}
        {s.applyVia && <div><dt className="text-[11px] uppercase tracking-wide text-[#9E9384]">Apply via</dt><dd className="text-[#16130F]">{s.applyVia}</dd></div>}
      </dl>
      {s.notes && <p className="text-[12.5px] text-[#614A26] bg-[#FBF7EE] px-3 py-2" style={{ borderRadius: 8 }}>{s.notes}</p>}
      <a href={s.officialUrl} target="_blank" rel="noopener noreferrer"
        className="mt-auto self-start inline-flex items-center gap-1.5 h-10 px-4 text-[13.5px] font-semibold text-white bg-[#16130F] hover:bg-[#DE5C2B] transition-colors" style={{ borderRadius: 10 }}>
        Official page <ExternalLink size={14} />
      </a>
    </article>
  );
};

export default function IndianScholarshipsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState('');
  const [level, setLevel] = useState(params.get('level') || '');
  const [type, setType] = useState('');
  const [state, setState] = useState('');
  const [cats, setCats] = useState([]);

  useEffect(() => { document.title = 'Scholarships to study in India | UniCoach'; window.scrollTo(0, 0); }, []);

  const toggleCat = (c) => setCats((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]));
  const clear = () => { setQ(''); setLevel(''); setType(''); setState(''); setCats([]); };
  const active = !!(q || level || type || state || cats.length);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return ALL.filter((s) => {
      if (level && !(s.levels || []).includes(level)) return false;
      if (type && s.providerType !== type) return false;
      // picking a state keeps central + private schemes (open across India) and that state's own schemes
      if (state && s.providerType === 'state' && s.state !== state) return false;
      if (cats.length && !cats.some((c) => (s.categories || []).includes(c))) return false;
      if (t && ![s.name, s.provider, s.forWhom, s.state, s.notes].filter(Boolean).join(' ').toLowerCase().includes(t)) return false;
      return true;
    });
  }, [q, level, type, state, cats]);

  const leave = () => { if (window.history.state && window.history.state.idx > 0) navigate(-1); else navigate('/'); };

  return (
    <div className="min-h-screen pt-[76px] pb-20 font-['Onest',sans-serif]" style={{ background: '#F6F3EC' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="pt-5">
          <button type="button" onClick={leave} aria-label="Go back"
            className="no-shine inline-flex items-center gap-1.5 h-9 pl-3 pr-4 rounded-full bg-white border border-[#E6E0D4] text-[13.5px] font-semibold text-[#16130F] hover:border-[#16130F] transition-colors">
            <ArrowLeft size={16} strokeWidth={2.2} /> Back
          </button>
        </div>

        <div className="text-center pt-4 sm:pt-6">
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#977435]"><Award size={15} /> Scholarships · Study in India</p>
          <h1 className="mt-3 font-outfit text-[30px] sm:text-[44px] font-black tracking-[-0.035em] leading-[1.05] text-[#16130F]">Scholarships to study in India</h1>
          <p className="mt-3 text-[15px] sm:text-[17px] text-[#5B544A] max-w-2xl mx-auto">Central government, state government and private scholarships for school, college and research. Each one links to its official page.</p>
          <div className="mt-5 inline-flex p-1 bg-white border border-[#E6E0D4]" style={{ borderRadius: 999 }}>
            <button type="button" onClick={() => navigate('/search-programs?highlight=scholarship')} className="px-4 py-1.5 text-[13px] font-semibold text-[#5B544A]" style={{ borderRadius: 999 }}>Study abroad</button>
            <span className="px-4 py-1.5 text-[13px] font-semibold text-white bg-[#16130F]" style={{ borderRadius: 999 }}>Study in India</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 bg-white border border-[#EAD8AE] p-4 sm:p-5 space-y-4" style={{ borderRadius: 18 }}>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3">
            <label className="flex items-center gap-2 h-11 px-3 bg-[#F8F5EF] border border-[#E6E0D4] focus-within:border-[#DE5C2B] focus-within:bg-white" style={{ borderRadius: 10 }}>
              <Search size={16} className="text-[#5B544A] shrink-0" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, e.g. NSP, Reliance, Kanyashree" className="w-full bg-transparent outline-none text-[14px] text-[#16130F]" />
            </label>
            <select value={state} onChange={(e) => setState(e.target.value)} aria-label="Your state" className="h-11 px-3 text-[14px] text-[#16130F] bg-[#F8F5EF] border border-[#E6E0D4] outline-none focus:border-[#DE5C2B]" style={{ borderRadius: 10 }}>
              <option value="">All states</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] font-semibold text-[#614A26] mr-1 w-full sm:w-auto">Studying:</span>
            <Pill on={!level} onClick={() => setLevel('')}>All levels</Pill>
            {LEVELS.map(([k, l]) => <Pill key={k} on={level === k} onClick={() => setLevel(level === k ? '' : k)}>{l}</Pill>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] font-semibold text-[#614A26] mr-1 w-full sm:w-auto">Given by:</span>
            <Pill on={!type} onClick={() => setType('')}>Everyone</Pill>
            {TYPES.map(([k, l]) => <Pill key={k} on={type === k} onClick={() => setType(type === k ? '' : k)}>{l}</Pill>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] font-semibold text-[#614A26] mr-1 w-full sm:w-auto">For:</span>
            {CATEGORIES.map(([k, l]) => <Pill key={k} on={cats.includes(k)} onClick={() => toggleCat(k)}>{l}</Pill>)}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="text-[14px] text-[#5B544A]"><b className="text-[#16130F]">{list.length}</b> of {ALL.length} scholarships</p>
          {active && <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#DE5C2B]"><X size={14} /> Clear filters</button>}
        </div>

        {list.length ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">{list.map((s) => <ScholarshipCard key={s.id} s={s} />)}</div>
        ) : (
          <div className="mt-4 bg-white border border-[#E6E0D4] p-8 text-center text-[14px] text-[#5B544A]" style={{ borderRadius: 14 }}>
            No scholarship matches these filters. Try fewer filters, or check the <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#DE5C2B] hover:underline">National Scholarship Portal</a>.
          </div>
        )}

        <p className="mt-8 flex items-start gap-2 text-[12.5px] text-[#614A26] max-w-3xl">
          <Info size={15} className="shrink-0 mt-0.5" />
          Details were checked against official pages on {checkedLabel}. Amounts, income limits and dates change every year, so confirm on the official page before you apply. UniCoach is not part of any scholarship&apos;s selection.
        </p>
      </div>
    </div>
  );
}
