import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Opens the page scrolled to the section named in the URL hash (e.g. /unicoach#mentors-grid);
 * React Router does not do this on its own. Give the section a scroll-mt-* class so it clears
 * the fixed navbar.
 */
export const useScrollToHash = (sectionId) => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash !== `#${sectionId}`) return undefined;

    const scrollToSection = (attempt = 0) => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      if (!window.lenis) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      // Lenis honours scroll-margin-top, so the section should end up exactly that far from the top
      const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
      window.lenis.scrollTo(section, {
        onComplete: () => {
          // Images above can finish loading mid-scroll and push the section down
          const drift = Math.abs(section.getBoundingClientRect().top - margin);
          if (drift > 8 && attempt < 2) scrollToSection(attempt + 1);
        },
      });
    };

    // Runs after ScrollToTop has reset the page for the new route
    const timer = setTimeout(scrollToSection, 150);
    return () => clearTimeout(timer);
  }, [hash, sectionId]);
};
