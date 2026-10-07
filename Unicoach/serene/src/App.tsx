import React, { useState, useCallback } from 'react';
import Loader from './components/Loader';
import EarthGlobe, { type OfficeLocation } from './components/EarthGlobe';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { GsapShowcaseSection } from './components/GsapShowcaseSection';
import { ScrollRevealSection } from './components/ScrollRevealSection';
import { DestinationsSection } from './components/DestinationsSection';
import { StatsSection } from './components/StatsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { EventsSection } from './components/EventsSection';
import { NewsSection } from './components/NewsSection';
import { CentreLocatorSection } from './components/CentreLocatorSection';
import { CtaBannerSection } from './components/CtaBannerSection';
import { Footer } from './components/Footer';
import { EligibilityModal } from './components/EligibilityModal';
import { CustomCursor } from './components/CustomCursor';

export const App: React.FC = () => {
  const [activeOffice, setActiveOffice] = useState<OfficeLocation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalServiceTitle, setModalServiceTitle] = useState<string | undefined>(undefined);
  const [loadingFinished, setLoadingFinished] = useState(false);

  const handleActiveOffice = useCallback((office: OfficeLocation) => {
    setActiveOffice(office);
  }, []);

  const handleOpenModal = (serviceTitle?: string) => {
    setModalServiceTitle(serviceTitle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalServiceTitle(undefined);
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Interactive Floating Graduation Cap Custom Cursor */}
      <CustomCursor />

      {/* Intro Loader */}
      {!loadingFinished && <Loader onLoadingComplete={() => setLoadingFinished(true)} />}

      {/* Canvas background for 3D Earth Globe */}
      <EarthGlobe activeOffice={activeOffice} />

      {/* Header & Sticky Navigation */}
      <Navbar onOpenModal={handleOpenModal} />

      {/* Main Content Layout */}
      <main className="relative z-10">
        <Hero onOpenModal={handleOpenModal} />
        <ServicesSection onOpenModal={handleOpenModal} />
        <GsapShowcaseSection onOpenModal={handleOpenModal} />
        <ScrollRevealSection onActiveOffice={handleActiveOffice} />
        <DestinationsSection onOpenModal={handleOpenModal} />
        <StatsSection />
        <TestimonialsSection />
        <EventsSection onOpenModal={handleOpenModal} />
        <NewsSection onOpenModal={handleOpenModal} />
        <CentreLocatorSection onOpenModal={handleOpenModal} />
        <CtaBannerSection onOpenModal={handleOpenModal} />
      </main>

      {/* Global Footer */}
      <Footer onOpenModal={handleOpenModal} />

      {/* Global Eligibility & Free Counseling Modal */}
      <EligibilityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        serviceTitle={modalServiceTitle}
      />
    </div>
  );
};

export default App;
