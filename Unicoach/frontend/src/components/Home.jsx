import { lazy, Suspense, useEffect } from 'react';
import Hero from './Hero';
import LazySection from './LazySection';

// Below-the-fold sections are code-split and dynamically mounted via IntersectionObserver
const loaders = {
  MentorMarquee: () => import('./MentorMarquee'),
  Services: () => import('./Services'),
  JourneyBento: () => import('./JourneyBento'),
  ShortlistShowcase: () => import('./ShortlistShowcase'),
  StudentStory: () => import('./StudentStory'),
  PassportJourney: () => import('./PassportJourney'),
  Destinations: () => import('./Destinations'),
  UpcomingEvents: () => import('./UpcomingEvents'),
  Testimonials: () => import('./Testimonials'),
  FinalCTA: () => import('./FinalCTA'),
  FitChecker: () => import('./FitChecker'),
};
const MentorMarquee = lazy(loaders.MentorMarquee);
const Services = lazy(loaders.Services);
const JourneyBento = lazy(loaders.JourneyBento);
const ShortlistShowcase = lazy(loaders.ShortlistShowcase);
const StudentStory = lazy(loaders.StudentStory);
const PassportJourney = lazy(loaders.PassportJourney);
const Destinations = lazy(loaders.Destinations);
const UpcomingEvents = lazy(loaders.UpcomingEvents);
const Testimonials = lazy(loaders.Testimonials);
const FinalCTA = lazy(loaders.FinalCTA);
const FitChecker = lazy(loaders.FitChecker);

// Fetch every section's code in the background once the visitor starts scrolling, so a section
// shows up instantly when reached instead of downloading only at that moment
const prefetchSections = () => Object.values(loaders).forEach((load) => load().catch(() => {}));

const SectionPlaceholder = ({ minHeight = '380px' }) => (
  <div style={{ minHeight }} className="w-full bg-[#FAF9F6]" />
);

const Home = () => {
  // Start on the visitor's first scroll or touch (not during page load, where it would slow the first paint)
  useEffect(() => {
    const events = ['scroll', 'pointerdown', 'touchstart', 'keydown'];
    const start = () => {
      events.forEach((e) => window.removeEventListener(e, start));
      prefetchSections();
    };
    events.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, start));
  }, []);

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

      {/* 03. Upcoming Masterclasses & Events (Interactive Sessions with Senior Mentors & Experts) */}
      <LazySection minHeight="420px" rootMargin="900px">
        <Suspense fallback={<SectionPlaceholder minHeight="420px" />}>
          <UpcomingEvents />
        </Suspense>
      </LazySection>

      {/* 04b. Student ki kahani: chat-style journey */}
      <LazySection minHeight="560px" rootMargin="900px">
        <Suspense fallback={<SectionPlaceholder minHeight="560px" />}>
          <StudentStory />
        </Suspense>
      </LazySection>

      {/* 04c. Shortlist finder: the auto drives while the search fills itself */}
      <LazySection minHeight="560px" rootMargin="900px">
        <Suspense fallback={<SectionPlaceholder minHeight="560px" />}>
          <ShortlistShowcase />
        </Suspense>
      </LazySection>

      <LazySection minHeight="640px" rootMargin="900px">
        <Suspense fallback={<SectionPlaceholder minHeight="640px" />}>
          <FitChecker />
        </Suspense>
      </LazySection>

      {/* 06b. Study-abroad passport: scroll turns the pages, each step gets stamped */}
      <LazySection minHeight="100vh" rootMargin="400px">
        <Suspense fallback={<SectionPlaceholder minHeight="100vh" />}>
          <PassportJourney />
        </Suspense>
      </LazySection>

      <LazySection minHeight="480px" rootMargin="900px">
        <Suspense fallback={<SectionPlaceholder minHeight="480px" />}>
          <Destinations />
        </Suspense>
      </LazySection>

      {/* 05. Core Solutions: 4 Stacking Cards */}
      <LazySection minHeight="520px" rootMargin="900px">
        <Suspense fallback={<SectionPlaceholder minHeight="520px" />}>
          <Services />
        </Suspense>
      </LazySection>

      {/* 06. How UniCoach works: 4 steps, each opening its tool */}
      <LazySection minHeight="560px" rootMargin="900px">
        <Suspense fallback={<SectionPlaceholder minHeight="560px" />}>
          <JourneyBento />
        </Suspense>
      </LazySection>

      {/* 07. Loved by Students Worldwide */}
      <LazySection minHeight="500px" rootMargin="900px">
        <Suspense fallback={<SectionPlaceholder minHeight="500px" />}>
          <Testimonials />
        </Suspense>
      </LazySection>

      {/* 07. Ready to Take the Leap Final CTA Capsule Banner */}
      <LazySection minHeight="320px" rootMargin="900px">
        <Suspense fallback={<SectionPlaceholder minHeight="320px" />}>
          <FinalCTA />
        </Suspense>
      </LazySection>
    </main>
  );
};

export default Home;
