// ════════════════════════════════════════════════════════════════════════════════
// Unicoach Module — Barrel Exports
// ════════════════════════════════════════════════════════════════════════════════

// ── Pages ──
export { default as UnicoachMarketplacePage } from './pages/UnicoachMarketplacePage';
export { default as UnicoachApplyPage } from './pages/UnicoachApplyPage';
export { default as UnicoachProfilePage } from './pages/UnicoachProfilePage';
export { default as UnicoachDashboardPage } from './pages/UnicoachDashboardPage';
export { default as MentorLandingPage } from './pages/MentorLandingPage';
export { default as StudentQueryTrackingPage } from './pages/StudentQueryTrackingPage';

// ── Student-Facing Sections ──
export { StudentHeroSection } from './components/StudentHeroSection';
export { StudentFlashSection } from './components/StudentFlashSection';
export { StudentTestimonialSection } from './components/StudentTestimonialSection';

// ── Mentor-Facing Sections ──
export { MentorHeroSection } from './components/MentorHeroSection';
export { MentorFlashSection } from './components/MentorFlashSection';
export { MentorTestimonialSection } from './components/MentorTestimonialSection';

// ── Shared Sections ──
export { CohortSection } from './components/CohortSection';
export { ZeroFeeBanner } from './components/ZeroFeeBanner';
export { BecomeMentorCTA } from './components/BecomeMentorCTA';
export { UnicoachFeatureBentoGrid } from './components/UnicoachFeatureBentoGrid';
export { InteractiveCreatorMasonry } from './components/InteractiveCreatorMasonry';

// ── Booking Flow Components ──
export { default as MentorHero } from './components/MentorHero';
export { default as ServiceCard } from './components/ServiceCard';
export { default as SlotPicker } from './components/SlotPicker';
export { default as CheckoutModal } from './components/CheckoutModal';
export { default as ReservationTimer } from './components/ReservationTimer';
export { default as BookingSuccess } from './components/BookingSuccess';

// ── API & Hooks ──
export * from './api/unicoachApi';
export * from './hooks/useMentorProfile';
export * from './hooks/useAvailableSlots';
export * from './hooks/useReservation';

