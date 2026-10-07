import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Reusable on-page breadcrumb navigation header with a dedicated Back button.
 * Placed directly on subpages (never crowding the navbar logo).
 */
export const PageBackBreadcrumb = ({ items = [], fallbackPath = '/' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <div className="flex items-center flex-wrap gap-2.5 sm:gap-3.5 mb-6">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-[#DE5C2B] border border-slate-200/90 shadow-2xs text-[12px] font-bold transition-all cursor-pointer group shrink-0"
        title="Go back to previous page"
        aria-label="Go back to previous page"
      >
        <ArrowLeft size={13} className="text-slate-500 group-hover:text-[#DE5C2B] group-hover:-translate-x-0.5 transition-transform" />
        <span>Back</span>
      </button>

      <span className="text-slate-300 font-light select-none">/</span>

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-wrap select-none">
        <Link to="/" className="hover:text-[#DE5C2B] transition-colors">
          Home
        </Link>
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <ArrowRight size={10} className="text-slate-400 shrink-0" />
            {item.path ? (
              <Link to={item.path} className="hover:text-[#DE5C2B] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-700 font-black">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};

export default PageBackBreadcrumb;
