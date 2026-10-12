import { useEffect, useRef, useState } from 'react';

// Text input with a suggestion list underneath. Typing anything is allowed; picking a suggestion fills it in.
// suggestions: [{ value, hint? }]
const SuggestInput = ({ value, onChange, onBlur, suggestions = [], placeholder, className = '', emptyHint, loading = false, ...rest }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const pick = (v) => {
    onChange(v);
    setOpen(false);
    setActive(-1);
  };

  const list = suggestions.slice(0, 50);

  return (
    <div className="relative" ref={boxRef}>
      <input
        {...rest}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        onFocus={() => setOpen(true)}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (!open || !list.length) return;
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(list.length - 1, i + 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
          if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(list[active].value); }
          if (e.key === 'Escape') setOpen(false);
        }}
        className={className}
      />
      {open && (list.length > 0 || loading || emptyHint) && (
        <ul
          role="listbox"
          data-lenis-prevent
          className="absolute z-50 mt-1 left-0 right-0 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl py-1"
        >
          {loading && <li className="px-4 py-2.5 text-sm text-slate-400">Loading…</li>}
          {!loading && list.length === 0 && emptyHint && <li className="px-4 py-2.5 text-sm text-slate-400">{emptyHint}</li>}
          {list.map((s, i) => (
            <li key={`${s.value}-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s.value)}
                className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer ${i === active ? 'bg-orange-50 text-[#C04A1D]' : 'text-slate-800 hover:bg-slate-50'}`}
              >
                <span className="block font-semibold leading-snug">{s.value}</span>
                {s.hint && <span className="block text-xs text-slate-400">{s.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SuggestInput;
