import React from 'react';

/**
 * Standardized Page Container for UniCoach
 * Enforces unified 1440px max-width and consistent responsive gutters
 */
export const PageContainer = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default PageContainer;
