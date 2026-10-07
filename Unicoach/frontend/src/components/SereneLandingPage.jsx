import React from 'react';
import SereneHero from './SereneHero';
import SereneQuoteSection from './SereneQuoteSection';

export const SereneLandingPage = () => {
  return (
    <div className="bg-[#0a0608] min-h-screen text-white relative">
      <SereneHero />
      <SereneQuoteSection />
    </div>
  );
};

export default SereneLandingPage;
