import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * BackButton — "← Back" pill for tool pages. Returns to the previous page on the site;
 * when the page was opened directly (new tab, shared link) it goes to `fallback` instead,
 * so the button never takes the student off UniCoach.
 */
const BackButton = ({ fallback = '/ai-tools', label = 'Back', className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // React Router gives the first page of a visit the key "default": nothing on the site to go back to
  const hasPreviousPage = location.key !== 'default';

  return (
    <button
      type="button"
      onClick={() => (hasPreviousPage ? navigate(-1) : navigate(fallback))}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200 text-[13px] font-semibold text-slate-700 shadow-2xs hover:border-[#DE5C2B] hover:text-[#DE5C2B] transition-colors cursor-pointer ${className}`}
    >
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      {label}
    </button>
  );
};

// Top-left of a tool page's hero (the hero <section> must be `relative`), lined up with the
// page's main content column. On phones it sits above the hero text instead of over it.
export const HeroBackButton = ({ fallback }) => (
  <div className="relative z-20 mb-4 sm:mb-0 sm:absolute sm:inset-x-0 sm:top-5 sm:pointer-events-none">
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <BackButton fallback={fallback} className="sm:pointer-events-auto" />
    </div>
  </div>
);

export default BackButton;
