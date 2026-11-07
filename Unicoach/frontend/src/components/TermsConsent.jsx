// "I agree to the Terms & Refund Policy" checkbox used on sign-up, login and the login modal.
// The backend stores the acceptance (date, version, IP) on the user, so a later refund dispute has a record.

export function TermsConsent({ checked, onChange, className = '' }) {
  return (
    <label className={`flex items-start gap-2 text-left text-[11.5px] leading-snug text-slate-600 cursor-pointer select-none ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-[1px] w-4 h-4 shrink-0 accent-slate-900 cursor-pointer"
      />
      <span>
        I agree to the{' '}
        <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-800 underline">Terms &amp; Conditions</a>
        {' '}and{' '}
        <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-800 underline">Refund Policy</a>.
        {' '}Payments on UniCoach are non-refundable.
      </span>
    </label>
  );
}

// Wraps the Google button: until the box is ticked the button is greyed out and a click shows a hint.
export function TermsGate({ agreed, onBlocked, children, className = '' }) {
  return (
    <div
      className={className}
      onClick={agreed ? undefined : onBlocked}
      title={agreed ? undefined : 'Please agree to the Terms & Refund Policy first'}
    >
      <div className={`w-full ${agreed ? '' : 'pointer-events-none opacity-50'}`}>{children}</div>
    </div>
  );
}

export const TERMS_REQUIRED_MESSAGE = 'Please tick the box to agree to the Terms & Refund Policy.';
