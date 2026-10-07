import { Minus, Plus } from 'lucide-react';

/**
 * Number input with its own −/+ buttons and an optional suffix (e.g. "%", "≈ ₹30 Lakh/yr").
 * The browser's native spinner is hidden so it can never overlap the suffix text.
 * onChange receives the new value as a string, like a native input event's target.value.
 */
const NumberStepperInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  placeholder,
  ariaLabel,
  className = '',
}) => {
  const numeric = Number(value);
  const clamp = (n) => {
    let next = n;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  };
  const stepBy = (direction) => {
    const base = Number.isFinite(numeric) && value !== '' ? numeric : (min ?? 0);
    onChange(String(clamp(base + direction * step)));
  };
  const atMin = min !== undefined && Number.isFinite(numeric) && numeric <= min;
  const atMax = max !== undefined && Number.isFinite(numeric) && numeric >= max;

  const buttonClass = 'w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-[#DE5C2B] hover:bg-orange-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors cursor-pointer disabled:cursor-not-allowed';

  return (
    <div
      className={`group flex items-center gap-1 w-full pl-4 pr-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm focus-within:border-indigo-500 focus-within:bg-white ${className}`}
    >
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (value !== '' && Number.isFinite(numeric)) onChange(String(clamp(numeric)));
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="flex-1 min-w-0 py-1.5 bg-transparent text-sm font-bold text-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {suffix && (
        <span className="shrink-0 text-[11px] font-bold text-slate-400 whitespace-nowrap pr-1">{suffix}</span>
      )}
      <div className="shrink-0 flex items-center gap-0.5 pl-1 border-l border-slate-200">
        <button type="button" aria-label="Decrease" onClick={() => stepBy(-1)} disabled={atMin} className={buttonClass}>
          <Minus size={13} strokeWidth={2.5} />
        </button>
        <button type="button" aria-label="Increase" onClick={() => stepBy(1)} disabled={atMax} className={buttonClass}>
          <Plus size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default NumberStepperInput;
