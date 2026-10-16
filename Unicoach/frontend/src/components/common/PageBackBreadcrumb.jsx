import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Reusable on-page breadcrumb navigation header with a dedicated Back button.
 * Placed directly on subpages (never crowding the navbar logo).
 */
// eslint-disable-next-line no-unused-vars
export const PageBackBreadcrumb = ({ items = [], fallbackPath = '/' }) => {
  return (
    <div className="flex items-center flex-wrap gap-2.5 sm:gap-3.5 mb-6">

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
