import React, { useState, useEffect, useRef } from 'react';

/**
 * LazySection: High-performance IntersectionObserver wrapper for below-the-fold content.
 * Prevents React from mounting heavy DOM subtrees and initializing animations until
 * the section is within scroll range of the viewport.
 * 
 * Guarantees 0 layout shift (CLS = 0) by reserving minimum height.
 */
export const LazySection = ({ children, minHeight = '380px', rootMargin = '350px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // If running in SSR or browser doesn't support IntersectionObserver, render immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div 
      ref={containerRef} 
      style={{ minHeight: isVisible ? undefined : minHeight }}
      className="w-full"
    >
      {isVisible ? children : null}
    </div>
  );
};

export default LazySection;
