import { useEffect, useState } from 'react';

// Fast loads finish before this and never flash a loader
const SHOW_DELAY_MS = 300;
// Pun lines shown while a page loads (one picked per loader)
const LOADING_LINES = [
  'Universities dhundh rahe hain, chai pi lo ☕',
  'Visa ki file khul rahi hai…',
  'Sapne load ho rahe hain, thoda sabar 🎓',
  'Boarding pass print ho raha hai ✈️',
];

/**
 * PageLoader — small inline loader for page content that is still loading
 * (a lazily loaded page or data fetched by the page). It sits in the page
 * itself; nothing is blurred or blocked.
 */
const PageLoader = ({ label, minHeight = '60vh' }) => {
  const [visible, setVisible] = useState(false);
  const [line] = useState(() => label || LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="w-full flex items-center justify-center px-4"
      style={{ minHeight }}
    >
      <div
        className={`flex flex-col items-center gap-3 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="w-8 h-8 rounded-full border-[3px] border-orange-100 border-t-[#DE5C2B] animate-spin" />
        <span className="text-[14px] font-semibold text-slate-500 text-center">{line}</span>
      </div>
    </div>
  );
};

export default PageLoader;
