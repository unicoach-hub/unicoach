import React, { lazy, Suspense } from 'react';
import Hero from './Hero';
import LazySection from './LazySection';

// Below-the-fold sections are code-split and dynamically mounted via IntersectionObserver
const MentorMarquee = lazy(() => import('./MentorMarquee'));
const Services = lazy(() => import('./Services'));
const PremiumStory = lazy(() => import('./PremiumStory'));
const Destinations = lazy(() => import('./Destinations'));
const UpcomingEvents = lazy(() => import('./UpcomingEvents'));
const Testimonials = lazy(() => import('./Testimonials'));
const FinalCTA = lazy(() => import('./FinalCTA'));

const SectionPlaceholder = ({ minHeight = '380px' }) => (
  <div style={{ minHeight }} className="w-full bg-[#FAF9F6]" />
);

const Home = () => {
  return (
    <main id="main-content" className="flex flex-col min-h-screen w-full max-w-full overflow-x-clip bg-[#FAF9F6]">
      {/* 01. Hero Section (Airplane Window Scene, Obsidian & White Stat Cards, Parallax, Terracotta Palette) */}
      <Hero />

      {/* 02. Real mentors (event hosts + approved mentors from the UniCoach directory) */}
      <LazySection minHeight="460px" rootMargin="200px">
        <Suspense fallback={<SectionPlaceholder minHeight="460px" />}>
          <MentorMarquee />
        </Suspense>
      </LazySection>

      {/* 03. Upcoming Masterclasses & Events (Interactive Sessions with Ivy Mentors & Experts) */}
      <LazySection minHeight="420px" rootMargin="350px">
        <Suspense fallback={<SectionPlaceholder minHeight="420px" />}>
          <UpcomingEvents />
        </Suspense>
      </LazySection>

      {/* 04. Explore Top Study Destinations (Country Section) */}
      <LazySection minHeight="480px" rootMargin="350px">
        <Suspense fallback={<SectionPlaceholder minHeight="480px" />}>
          <Destinations />
        </Suspense>
      </LazySection>

      {/* 05. Core Solutions: 4 Stacking Cards */}
      <LazySection minHeight="520px" rootMargin="350px">
        <Suspense fallback={<SectionPlaceholder minHeight="520px" />}>
          <Services />
        </Suspense>
      </LazySection>

      {/* 06. How UniCoach works: 4 steps, each opening its tool */}
      <LazySection minHeight="560px" rootMargin="350px">
        <Suspense fallback={<SectionPlaceholder minHeight="560px" />}>
          <PremiumStory />
        </Suspense>
      </LazySection>

      {/* 07. Loved by Students Worldwide */}
      <LazySection minHeight="500px" rootMargin="350px">
        <Suspense fallback={<SectionPlaceholder minHeight="500px" />}>
          <Testimonials />
        </Suspense>
      </LazySection>

      {/* 07. Ready to Take the Leap Final CTA Capsule Banner */}
      <LazySection minHeight="320px" rootMargin="350px">
        <Suspense fallback={<SectionPlaceholder minHeight="320px" />}>
          <FinalCTA />
        </Suspense>
      </LazySection>
    </main>
  );
};

export default Home;
