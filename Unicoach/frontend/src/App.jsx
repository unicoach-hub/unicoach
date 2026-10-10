import React, { useState, useEffect, lazy, Suspense } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PageLoader from './components/PageLoader'
import NavigationProgress from './components/NavigationProgress'
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger);
// Core Navigation & Context
import Navbar from './components/Navbar'
import Home from './components/Home'
import ScrollToTop from './components/ScrollToTop'
import { LeadProvider, useLead } from './context/LeadContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy-load Global Modals, Footer and Widgets (Non-blocking for initial page load)
const Footer = lazy(() => import('./components/Footer'));
const EligibilityModal = lazy(() => import('./components/EligibilityModal'));
const SuccessModal = lazy(() => import('./components/SuccessModal'));
const LoginModal = lazy(() => import('./components/LoginModal'));
const UniBotChatWidget = lazy(() => import('./components/UniBotChatWidget'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const UnicoachMarketplacePage = lazy(() => import('./unicoach/pages/UnicoachMarketplacePage'));
const MentorsDirectoryPage = lazy(() => import('./unicoach/pages/MentorsDirectoryPage'));
const UnicoachApplyPage = lazy(() => import('./unicoach/pages/UnicoachApplyPage'));
const UnicoachProfilePage = lazy(() => import('./unicoach/pages/UnicoachProfilePage'));
const UnicoachDashboardPage = lazy(() => import('./unicoach/pages/UnicoachDashboardPage'));
const StudentQueryTrackingPage = lazy(() => import('./unicoach/pages/StudentQueryTrackingPage'));
const MentorLandingPage = lazy(() => import('./unicoach/pages/MentorLandingPage'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Import city pages
const Chicago = lazy(() => import('./app/study-abroad/usa/cities/chicago/page'));
const Boston = lazy(() => import('./app/study-abroad/usa/cities/boston/page'));
const Philadelphia = lazy(() => import('./app/study-abroad/usa/cities/philadelphia/page'));
const LosAngeles = lazy(() => import('./app/study-abroad/usa/cities/los-angeles/page'));
const Atlanta = lazy(() => import('./app/study-abroad/usa/cities/atlanta/page'));

// Import UK city pages
const London = lazy(() => import('./app/study-abroad/uk/cities/london/page'));
const Glasgow = lazy(() => import('./app/study-abroad/uk/cities/glasgow/page'));
const Leeds = lazy(() => import('./app/study-abroad/uk/cities/leeds/page'));
const Birmingham = lazy(() => import('./app/study-abroad/uk/cities/birmingham/page'));
const Edinburgh = lazy(() => import('./app/study-abroad/uk/cities/edinburgh/page'));

// Import USA Overview & static Course pages
const USAOverview = lazy(() => import('./app/study-abroad/usa/USAOverview'));
const MastersCourse = lazy(() => import('./app/study-abroad/usa/courses/masters/page'));
const ComputerScienceCourse = lazy(() => import('./app/study-abroad/usa/courses/computer-science/page'));
const DataScienceCourse = lazy(() => import('./app/study-abroad/usa/courses/data-science/page'));

// Import UK Overview & static Course pages
const UKOverview = lazy(() => import('./app/study-abroad/uk/UKOverview'));
const UKMastersCourse = lazy(() => import('./app/study-abroad/uk/courses/masters/page'));
const UKComputerScienceCourse = lazy(() => import('./app/study-abroad/uk/courses/computer-science/page'));
const UKPhysiotherapyCourse = lazy(() => import('./app/study-abroad/uk/courses/physiotherapy/page'));

// Import USA static University pages
const Harvard = lazy(() => import('./app/study-abroad/usa/universities/harvard/page'));
const Stanford = lazy(() => import('./app/study-abroad/usa/universities/stanford/page'));
const Columbia = lazy(() => import('./app/study-abroad/usa/universities/columbia/page'));
const Northeastern = lazy(() => import('./app/study-abroad/usa/universities/northeastern/page'));
const Yale = lazy(() => import('./app/study-abroad/usa/universities/yale/page'));

// Import UK static University pages
const Oxford = lazy(() => import('./app/study-abroad/uk/universities/oxford/page'));
const Cambridge = lazy(() => import('./app/study-abroad/uk/universities/cambridge/page'));
const Coventry = lazy(() => import('./app/study-abroad/uk/universities/coventry/page'));
const UKLeedsUniversity = lazy(() => import('./app/study-abroad/uk/universities/leeds-university/page'));
const EastLondon = lazy(() => import('./app/study-abroad/uk/universities/east-london/page'));

// Import Canada city pages
const Halifax = lazy(() => import('./app/study-abroad/canada/cities/halifax/page'));
const Montreal = lazy(() => import('./app/study-abroad/canada/cities/montreal/page'));
const Toronto = lazy(() => import('./app/study-abroad/canada/cities/toronto/page'));
const Edmonton = lazy(() => import('./app/study-abroad/canada/cities/edmonton/page'));
const LondonCanada = lazy(() => import('./app/study-abroad/canada/cities/london-canada/page'));

// Import Canada Course pages
const CanadaMastersCoursePage = lazy(() => import('./app/study-abroad/canada/courses/masters/page'));
const CanadaPhdCoursePage = lazy(() => import('./app/study-abroad/canada/courses/phd/page'));
const CanadaComputerScienceCoursePage = lazy(() => import('./app/study-abroad/canada/courses/computer-science/page'));

// Import Canada University pages
const ConestogaPage = lazy(() => import('./app/study-abroad/canada/universities/conestoga/page'));
const TorontoPage = lazy(() => import('./app/study-abroad/canada/universities/toronto-university/page'));
const LambtonPage = lazy(() => import('./app/study-abroad/canada/universities/lambton/page'));
const HumberPage = lazy(() => import('./app/study-abroad/canada/universities/humber/page'));
const CentennialPage = lazy(() => import('./app/study-abroad/canada/universities/centennial/page'));

// Import Canada Overview page
const CanadaOverview = lazy(() => import('./app/study-abroad/canada/CanadaOverview'));

// Import Germany Overview & admissions-visa pages
const GermanyOverview = lazy(() => import('./app/study-abroad/germany/page'));
const GermanyIntakes = lazy(() => import('./app/study-abroad/germany/admissions-visa/intakes/page'));
const GermanySummerIntake = lazy(() => import('./app/study-abroad/germany/admissions-visa/summer-intake/page'));
const GermanyWinterIntake = lazy(() => import('./app/study-abroad/germany/admissions-visa/winter-intake/page'));
const GermanyVisa = lazy(() => import('./app/study-abroad/germany/admissions-visa/visa/page'));
const GermanyWhyStudy = lazy(() => import('./app/study-abroad/germany/admissions-visa/why-study/page'));

// Import Germany university category pages
const GermanyBestUniversities = lazy(() => import('./app/study-abroad/germany/universities/best/page'));
const GermanyTopMasters = lazy(() => import('./app/study-abroad/germany/universities/top-masters/page'));
const GermanyAffordable = lazy(() => import('./app/study-abroad/germany/universities/affordable/page'));
const GermanyPublic = lazy(() => import('./app/study-abroad/germany/universities/public/page'));
const GermanyEngineering = lazy(() => import('./app/study-abroad/germany/universities/engineering/page'));

// Import Germany course pages
const GermanyMastersCoursePage = lazy(() => import('./app/study-abroad/germany/courses/masters/page'));
const GermanyMBACoursePage = lazy(() => import('./app/study-abroad/germany/courses/mba/page'));
const GermanyBachelorsCoursePage = lazy(() => import('./app/study-abroad/germany/courses/bachelors/page'));
const GermanyBestCoursesPage = lazy(() => import('./app/study-abroad/germany/courses/best-courses/page'));
const GermanyPhdCoursePage = lazy(() => import('./app/study-abroad/germany/courses/phd/page'));

// Import France pages
const FranceOverview = lazy(() => import('./app/study-abroad/france/page'));
const FranceIntakes = lazy(() => import('./app/study-abroad/france/admissions-visa/intakes/page'));
const FranceVisa = lazy(() => import('./app/study-abroad/france/admissions-visa/visa/page'));
const FranceWhyStudy = lazy(() => import('./app/study-abroad/france/admissions-visa/why-study/page'));

// Import France university pages
const FranceTopUniversities = lazy(() => import('./app/study-abroad/france/universities/top/page'));
const FranceAffordable = lazy(() => import('./app/study-abroad/france/universities/affordable/page'));
const FrancePublic = lazy(() => import('./app/study-abroad/france/universities/public/page'));

// Import France course pages
const FranceMastersCourse = lazy(() => import('./app/study-abroad/france/courses/masters/page'));
const FranceMBACourse = lazy(() => import('./app/study-abroad/france/courses/mba/page'));
const FranceMBBSCourse = lazy(() => import('./app/study-abroad/france/courses/mbbs/page'));
const FranceMIMCourse = lazy(() => import('./app/study-abroad/france/courses/mim/page'));
const FranceMACourse = lazy(() => import('./app/study-abroad/france/courses/ma/page'));

// Import New Zealand pages
const NewZealandOverview = lazy(() => import('./app/study-abroad/new-zealand/page'));
const NewZealandIntakes = lazy(() => import('./app/study-abroad/new-zealand/admissions-visa/intakes/page'));
const NewZealandJulyIntake = lazy(() => import('./app/study-abroad/new-zealand/admissions-visa/july-intake/page'));
const NewZealandVisa = lazy(() => import('./app/study-abroad/new-zealand/admissions-visa/visa/page'));

// Import New Zealand university pages
const NewZealandTopUniversities = lazy(() => import('./app/study-abroad/new-zealand/universities/top/page'));
const NewZealandBest = lazy(() => import('./app/study-abroad/new-zealand/universities/best/page'));
const NewZealandAffordable = lazy(() => import('./app/study-abroad/new-zealand/universities/affordable/page'));
const NewZealandPublic = lazy(() => import('./app/study-abroad/new-zealand/universities/public/page'));

// Import New Zealand course pages
const NewZealandMastersCourse = lazy(() => import('./app/study-abroad/new-zealand/courses/masters/page'));
const NewZealandMBACourse = lazy(() => import('./app/study-abroad/new-zealand/courses/mba/page'));
const NewZealandMBBSCourse = lazy(() => import('./app/study-abroad/new-zealand/courses/mbbs/page'));
const NewZealandMPHCourse = lazy(() => import('./app/study-abroad/new-zealand/courses/mph/page'));
const NewZealandMACourse = lazy(() => import('./app/study-abroad/new-zealand/courses/ma/page'));

// Import Italy pages
const ItalyOverview = lazy(() => import('./app/study-abroad/italy/page'));
const ItalyIntakes = lazy(() => import('./app/study-abroad/italy/admissions-visa/intakes/page'));
const ItalyVisa = lazy(() => import('./app/study-abroad/italy/admissions-visa/visa/page'));
const ItalyFree = lazy(() => import('./app/study-abroad/italy/admissions-visa/free/page'));
const ItalyTopUniversities = lazy(() => import('./app/study-abroad/italy/universities/top/page'));
const ItalyPublic = lazy(() => import('./app/study-abroad/italy/universities/public/page'));

// Import Italy course pages
const ItalyMastersCourse = lazy(() => import('./app/study-abroad/italy/courses/masters/page'));
const ItalyMBACourse = lazy(() => import('./app/study-abroad/italy/courses/mba/page'));
const ItalyMACourse = lazy(() => import('./app/study-abroad/italy/courses/ma/page'));
const ItalyMBBSCourse = lazy(() => import('./app/study-abroad/italy/courses/mbbs/page'));

// Import Ireland pages
const IrelandOverview = lazy(() => import('./app/study-abroad/ireland/page'));

// Import Ireland course pages
const IrelandMastersCourse = lazy(() => import('./app/study-abroad/ireland/courses/masters/page'));
const IrelandPhDCourse = lazy(() => import('./app/study-abroad/ireland/courses/phd/page'));
const IrelandDataScienceCourse = lazy(() => import('./app/study-abroad/ireland/courses/data-science/page'));

// Import Ireland city pages
const IrelandDublinCity = lazy(() => import('./app/study-abroad/ireland/cities/dublin/page'));

// Import Ireland university pages
const IrelandTrinity = lazy(() => import('./app/study-abroad/ireland/universities/trinity/page'));
const IrelandUCD = lazy(() => import('./app/study-abroad/ireland/universities/ucd/page'));
const IrelandDCU = lazy(() => import('./app/study-abroad/ireland/universities/dcu/page'));
const IrelandLimerick = lazy(() => import('./app/study-abroad/ireland/universities/limerick/page'));
const IrelandITCarlow = lazy(() => import('./app/study-abroad/ireland/universities/it-carlow/page'));

const DynamicCountryPage = lazy(() => import('./app/study-abroad/DynamicCountryPage'));
const DynamicCityPage = lazy(() => import('./app/study-abroad/DynamicCityPage'));
const DynamicUniversityPage = lazy(() => import('./app/study-abroad/DynamicUniversityPage'));

const IELTSOverview = lazy(() => import('./app/exams/ielts/IELTSOverview'));
const IELTSMasterclass = lazy(() => import('./app/exams/ielts/IELTSMasterclass'));

// Import IELTS sub-pages
const IELTSOverviewPage = lazy(() => import('./app/exams/ielts/overview/page'));
const IELTSTypesPage = lazy(() => import('./app/exams/ielts/types/page'));
const IELTSSyllabusPage = lazy(() => import('./app/exams/ielts/syllabus/page'));
const IELTSPracticeTestPage = lazy(() => import('./app/exams/ielts/practice-test/page'));
const IELTSEligibilityPage = lazy(() => import('./app/exams/ielts/eligibility/page'));
const IELTSFeesPage = lazy(() => import('./app/exams/ielts/fees/page'));
const IELTSDatesPage = lazy(() => import('./app/exams/ielts/dates/page'));
const IELTSRegistrationPage = lazy(() => import('./app/exams/ielts/registration/page'));
const IELTSSlotBookingPage = lazy(() => import('./app/exams/ielts/slot-booking/page'));
const IELTSCoachingCentresPage = lazy(() => import('./app/exams/ielts/coaching-centres/page'));
const IELTSResultsPage = lazy(() => import('./app/exams/ielts/results/page'));
const IELTSListeningPage = lazy(() => import('./app/exams/ielts/listening/page'));
const IELTSReadingPage = lazy(() => import('./app/exams/ielts/reading/page'));
const IELTSWritingPage = lazy(() => import('./app/exams/ielts/writing/page'));
const IELTSSpeakingPage = lazy(() => import('./app/exams/ielts/speaking/page'));

// Import Resource pages (Books & Calculators)
const IELTSBooksPage = lazy(() => import('./app/resources/books/ielts-books/page'));
const SATBooksPage = lazy(() => import('./app/resources/books/sat-books/page'));
const PTEBooksPage = lazy(() => import('./app/resources/books/pte-books/page'));
const TOEFLBooksPage = lazy(() => import('./app/resources/books/toefl-books/page'));
const GREBooksPage = lazy(() => import('./app/resources/books/gre-books/page'));
const GMATBooksPage = lazy(() => import('./app/resources/books/gmat-books/page'));
const CGPAtoGPACalculator = lazy(() => import('./app/resources/calculators/CGPAtoGPACalculator'));
const CGPAtoPercentage = lazy(() => import('./app/resources/calculators/CGPAtoPercentage'));
const CGPAtoMarks = lazy(() => import('./app/resources/calculators/CGPAtoMarks'));
const EligibilityCalculatorPage = lazy(() => import('./pages/EligibilityCalculatorPage'));
const UnsubscribePage = lazy(() => import('./pages/UnsubscribePage'));
const EducationLoanPage = lazy(() => import('./pages/EducationLoanPage'));
const VisaAssistancePage = lazy(() => import('./pages/VisaAssistancePage'));
const UniversitiesPage = lazy(() => import('./pages/UniversitiesPage'));
const CourseDetailsPage = lazy(() => import('./pages/CourseDetailsPage'));
const ScholarshipsPage = lazy(() => import('./pages/ScholarshipsPage'));
const AiToolsHubPage = lazy(() => import('./pages/AiToolsHubPage'));
const StudyAbroadHubPage = lazy(() => import('./pages/StudyAbroadHubPage'));
const ExamsHubPage = lazy(() => import('./pages/ExamsHubPage'));
const ResourcesHubPage = lazy(() => import('./pages/ResourcesHubPage'));
const AiSopGeneratorPage = lazy(() => import('./pages/AiSopGeneratorPage'));
const AiStudyRoadmapPage = lazy(() => import('./pages/AiStudyRoadmapPage'));
const AiVisaPrepPage = lazy(() => import('./pages/AiVisaPrepPage'));
const IeltsEvaluatorPage = lazy(() => import('./pages/IeltsEvaluatorPage'));

// Import Events & SOP pages
const EventsPage = lazy(() => import('./app/events/page'));
const EventDetailPage = lazy(() => import('./app/events/detail/page'));
const StatementOfPurposePage = lazy(() => import('./app/resources/sop/statement-of-purpose/page'));
const SOPMastersPage = lazy(() => import('./app/resources/sop/sop-masters/page'));
const SOPMbaPage = lazy(() => import('./app/resources/sop/sop-mba/page'));
const SOPPhdPage = lazy(() => import('./app/resources/sop/sop-phd/page'));

// Import LOR pages
const LORBlogPage = lazy(() => import('./app/resources/lor/lor-blog/page'));
const LORMastersPage = lazy(() => import('./app/resources/lor/lor-masters/page'));
const LORPhdPage = lazy(() => import('./app/resources/lor/lor-phd/page'));

// Import Digest, Newsroom, and Blogs pages
const UniCoachDigestPage = lazy(() => import('./app/unicoach-digest/page'));
const NewsroomPage = lazy(() => import('./app/newsroom/page'));
const NewsDetailPage = lazy(() => import('./app/newsroom/detail/page'));
const BlogsPage = lazy(() => import('./app/blogs/page'));
const NotFound = lazy(() => import('./components/NotFound'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const PublicFormPage = lazy(() => import('./components/PublicFormPage'));
const PublicBookingPage = lazy(() => import('./components/PublicBookingPage'));
const PriorityDmPage = lazy(() => import('./pages/PriorityDmPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));

// Import GMAT exam pages
const GMATOverview = lazy(() => import('./app/exams/gmat/GMATOverview'));
const GMATDetailPage = lazy(() => import('./app/exams/gmat/GMATDetailPage'));
const GMATOverviewPage = lazy(() => import('./app/exams/gmat/overview/page'));
const GMATSyllabusPage = lazy(() => import('./app/exams/gmat/syllabus/page'));
const GMATFeesPage = lazy(() => import('./app/exams/gmat/fees/page'));
const GMATDatesPage = lazy(() => import('./app/exams/gmat/dates/page'));
const GMATRegistrationPage = lazy(() => import('./app/exams/gmat/registration/page'));
const GMATResultsPage = lazy(() => import('./app/exams/gmat/results/page'));
const GMATPreparationPage = lazy(() => import('./app/exams/gmat/preparation/page'));
const GMATSamplePapersPage = lazy(() => import('./app/exams/gmat/sample-papers/page'));
const RhodesScholarshipPage = lazy(() => import('./app/blogs/rhodes-scholarship/page'));
const BlogDetailPage = lazy(() => import('./app/blogs/detail/page'));

// Import GRE exam pages
const GREOverview = lazy(() => import('./app/exams/gre/GREOverview'));
const GREDetailPage = lazy(() => import('./app/exams/gre/GREDetailPage'));
const GREOverviewPage = lazy(() => import('./app/exams/gre/overview/page'));
const GRESyllabusPage = lazy(() => import('./app/exams/gre/syllabus/page'));
const GREFeesPage = lazy(() => import('./app/exams/gre/fees/page'));
const GREDatesPage = lazy(() => import('./app/exams/gre/dates/page'));
const GRERegistrationPage = lazy(() => import('./app/exams/gre/registration/page'));
const GREResultsPage = lazy(() => import('./app/exams/gre/results/page'));
const GRESlotBookingPage = lazy(() => import('./app/exams/gre/slot-booking/page'));
const GREPreparationPage = lazy(() => import('./app/exams/gre/preparation/page'));
const GREPracticeTestPage = lazy(() => import('./app/exams/gre/practice-test/page'));

// Import TOEFL exam pages
const TOEFLOverview = lazy(() => import('./app/exams/toefl/TOEFLOverview'));
const TOEFLOverviewPage = lazy(() => import('./app/exams/toefl/overview/page'));
const TOEFLSyllabusPage = lazy(() => import('./app/exams/toefl/syllabus/page'));
const TOEFLFeesPage = lazy(() => import('./app/exams/toefl/fees/page'));
const TOEFLDatesPage = lazy(() => import('./app/exams/toefl/dates/page'));
const TOEFLRegistrationPage = lazy(() => import('./app/exams/toefl/registration/page'));
const TOEFLResultsPage = lazy(() => import('./app/exams/toefl/results/page'));
const TOEFLPreparationPage = lazy(() => import('./app/exams/toefl/preparation/page'));

// Import PTE exam pages
const PTEOverview = lazy(() => import('./app/exams/pte/PTEOverview'));
const PTEOverviewPage = lazy(() => import('./app/exams/pte/overview/page'));
const PTESyllabusPage = lazy(() => import('./app/exams/pte/syllabus/page'));
const PTEFeesPage = lazy(() => import('./app/exams/pte/fees/page'));
const PTEDatesPage = lazy(() => import('./app/exams/pte/dates/page'));
const PTERegistrationPage = lazy(() => import('./app/exams/pte/registration/page'));
const PTECentresPage = lazy(() => import('./app/exams/pte/centres/page'));
const PTEResultsPage = lazy(() => import('./app/exams/pte/results/page'));
const PTESlotBookingPage = lazy(() => import('./app/exams/pte/slot-booking/page'));
const PTEPreparationPage = lazy(() => import('./app/exams/pte/preparation/page'));

// Import SAT exam pages
const SATOverview = lazy(() => import('./app/exams/sat/SATOverview'));
const SATOverviewPage = lazy(() => import('./app/exams/sat/overview/page'));
const SATSyllabusPage = lazy(() => import('./app/exams/sat/syllabus/page'));
const SATFeesPage = lazy(() => import('./app/exams/sat/fees/page'));
const SATDatesPage = lazy(() => import('./app/exams/sat/dates/page'));
const SATRegistrationPage = lazy(() => import('./app/exams/sat/registration/page'));
const SATResultsPage = lazy(() => import('./app/exams/sat/results/page'));
const SATPreparationPage = lazy(() => import('./app/exams/sat/preparation/page'));

// Import Duolingo exam pages
const DuolingoOverview = lazy(() => import('./app/exams/duolingo/DuolingoOverview'));
const DuolingoOverviewPage = lazy(() => import('./app/exams/duolingo/overview/page'));
const DuolingoSyllabusPage = lazy(() => import('./app/exams/duolingo/syllabus/page'));
const DuolingoFeesPage = lazy(() => import('./app/exams/duolingo/fees/page'));
const DuolingoRegistrationPage = lazy(() => import('./app/exams/duolingo/registration/page'));
const DuolingoResultsPage = lazy(() => import('./app/exams/duolingo/results/page'));
const DuolingoPreparationPage = lazy(() => import('./app/exams/duolingo/preparation/page'));
const DuolingoSampleQuestionsPage = lazy(() => import('./app/exams/duolingo/sample-questions/page'));
const DuolingoPracticeTestPage = lazy(() => import('./app/exams/duolingo/practice-test/page'));
const DuolingoAustraliaPage = lazy(() => import('./app/exams/duolingo/australia/page'));
const DuolingoCanadaPage = lazy(() => import('./app/exams/duolingo/canada/page'));
const DuolingoUkPage = lazy(() => import('./app/exams/duolingo/uk/page'));
const DuolingoIrelandPage = lazy(() => import('./app/exams/duolingo/ireland/page'));
const DuolingoGermanyPage = lazy(() => import('./app/exams/duolingo/germany/page'));

// Import Australia pages
const AustraliaOverview = lazy(() => import('./app/study-abroad/australia/page'));

// Import Australia course pages
const AustraliaMastersCoursePage = lazy(() => import('./app/study-abroad/australia/courses/masters/page'));
const AustraliaBusinessAnalyticsCoursePage = lazy(() => import('./app/study-abroad/australia/courses/business-analytics/page'));
const AustraliaPublicHealthCoursePage = lazy(() => import('./app/study-abroad/australia/courses/public-health/page'));

// Import Australia city pages
const AustraliaAdelaidePage = lazy(() => import('./app/study-abroad/australia/cities/adelaide/page'));
const AustraliaBrisbanePage = lazy(() => import('./app/study-abroad/australia/cities/brisbane/page'));
const AustraliaMelbournePage = lazy(() => import('./app/study-abroad/australia/cities/melbourne/page'));
const AustraliaPerthPage = lazy(() => import('./app/study-abroad/australia/cities/perth/page'));
const AustraliaSydneyPage = lazy(() => import('./app/study-abroad/australia/cities/sydney/page'));

// Import Australia university pages
const AustraliaCarnegieMellonPage = lazy(() => import('./app/study-abroad/australia/universities/carnegie-mellon/page'));
const AustraliaDeakinPage = lazy(() => import('./app/study-abroad/australia/universities/deakin/page'));
const AustraliaMonashPage = lazy(() => import('./app/study-abroad/australia/universities/monash/page'));
const AustraliaQueenslandPage = lazy(() => import('./app/study-abroad/australia/universities/queensland/page'));
const AustraliaRMITPage = lazy(() => import('./app/study-abroad/australia/universities/rmit/page'));

// Matches /@:handle (e.g. /@your_sagar) and routes to UnicoachProfilePage, or 404 if not a @handle
const AtHandleOrNotFound = () => {
  const { handle } = useParams();
  if (handle && handle.startsWith('@')) {
    return <UnicoachProfilePage />;
  }
  return <NotFound />;
};

const AtHandleQueryTrackingOrNotFound = () => {
  const { handle } = useParams();
  if (handle && handle.startsWith('@')) {
    return <StudentQueryTrackingPage />;
  }
  return <NotFound />;
};

// Renders modals strictly on-demand when user triggers them (prevents loading ~70KB modal JS on initial load)
const GlobalModals = () => {
  const { isModalOpen, isSubmitted } = useLead() || {};
  const { loginModalOpen } = useAuth() || {};

  return (
    <Suspense fallback={null}>
      {isModalOpen && <EligibilityModal />}
      {isSubmitted && <SuccessModal />}
      {loginModalOpen && <LoginModal />}
    </Suspense>
  );
};

const isAuthRoute = (path) => ['/login', '/signin', '/signup', '/register'].includes(path);

// Defer loading UniBotChatWidget until user interaction or after initial 3.5s idle
const DeferredUniBot = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onInteract = () => {
      setShouldLoad(true);
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };

    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 2800);

    window.addEventListener('scroll', onInteract, { passive: true });
    window.addEventListener('touchstart', onInteract, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
  }, []);

  if (location.pathname.startsWith('/unicoach/dashboard') || isAuthRoute(location.pathname)) return null;
  if (!shouldLoad) return null;

  const isEmbed = new URLSearchParams(location.search).get('embed') === 'true';
  if (isEmbed) return null;
  return (
    <Suspense fallback={null}>
      <UniBotChatWidget />
    </Suspense>
  );
};

const ConditionalNavbar = () => {
  const location = useLocation();
  const isEmbed = new URLSearchParams(location.search).get('embed') === 'true';
  if (isEmbed || location.pathname.startsWith('/unicoach/dashboard')) return null;
  return <Navbar />;
};

const ConditionalFooter = () => {
  const location = useLocation();
  const isEmbed = new URLSearchParams(location.search).get('embed') === 'true';
  if (isEmbed || location.pathname.startsWith('/unicoach/dashboard') || isAuthRoute(location.pathname)) return null;
  return (
    <Suspense fallback={<div className="min-h-[160px] w-full bg-[#0a0a0a]" />}>
      <Footer />
    </Suspense>
  );
};

const App = () => {
  // ── Lenis Smooth Scrolling & GSAP Sync (Desktop Only) ──
  useEffect(() => {
    // Skip on touch/mobile devices for native 120Hz scrolling and 0 CPU main-thread overhead
    if (typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches)) {
      return;
    }

    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      prevent: (node) => {
        if (!node || typeof node.closest !== 'function') return false;
        // Explicitly marked containers or open modals/dialogs
        if (
          node.hasAttribute?.('data-lenis-prevent') ||
          node.closest('[data-lenis-prevent]') ||
          node.closest('[role="dialog"]') ||
          node.closest('[role="listbox"]') ||
          node.closest('.modal-content')
        ) {
          return true;
        }

        // Only prevent if the element is actually vertically scrollable and has scrollable overflow
        const scrollableY = node.closest('.overflow-y-auto, .overflow-y-scroll');
        if (scrollableY && scrollableY.scrollHeight > scrollableY.clientHeight) {
          return true;
        }

        return false;
      }
    });

    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCb = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(tickerCb);
      window.lenis = null;
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <LeadProvider>
        <BrowserRouter>
          <NavigationProgress />
          <ScrollToTop />
          <ConditionalNavbar />
          {/* Global Modals (Mounted strictly on demand) */}
          <GlobalModals />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signin" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/register" element={<SignupPage />} />
              <Route path="/priority-dm" element={<PriorityDmPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />

            {/* USA Overview */}
            <Route path="/study-abroad/usa" element={<USAOverview />} />

            {/* USA Courses */}
            <Route path="/study-abroad/usa/courses/masters" element={<MastersCourse />} />
            <Route path="/study-abroad/usa/courses/computer-science" element={<ComputerScienceCourse />} />
            <Route path="/study-abroad/usa/courses/data-science" element={<DataScienceCourse />} />

            {/* USA Cities */}
            <Route path="/study-abroad/usa/chicago" element={<Chicago />} />
            <Route path="/study-abroad/usa/boston" element={<Boston />} />
            <Route path="/study-abroad/usa/philadelphia" element={<Philadelphia />} />
            <Route path="/study-abroad/usa/los-angeles" element={<LosAngeles />} />
            <Route path="/study-abroad/usa/atlanta" element={<Atlanta />} />

            {/* USA Universities */}
            <Route path="/study-abroad/usa/universities/harvard" element={<Harvard />} />
            <Route path="/study-abroad/usa/universities/stanford" element={<Stanford />} />
            <Route path="/study-abroad/usa/universities/columbia" element={<Columbia />} />
            <Route path="/study-abroad/usa/universities/northeastern" element={<Northeastern />} />
            <Route path="/study-abroad/usa/universities/yale" element={<Yale />} />

            {/* UK Overview */}
            <Route path="/study-abroad/uk" element={<UKOverview />} />

            {/* UK Courses */}
            <Route path="/study-abroad/uk/courses/masters" element={<UKMastersCourse />} />
            <Route path="/study-abroad/uk/courses/computer-science" element={<UKComputerScienceCourse />} />
            <Route path="/study-abroad/uk/courses/physiotherapy" element={<UKPhysiotherapyCourse />} />

            {/* UK Cities */}
            <Route path="/study-abroad/uk/london" element={<London />} />
            <Route path="/study-abroad/uk/glasgow" element={<Glasgow />} />
            <Route path="/study-abroad/uk/leeds" element={<Leeds />} />
            <Route path="/study-abroad/uk/birmingham" element={<Birmingham />} />
            <Route path="/study-abroad/uk/edinburgh" element={<Edinburgh />} />

            {/* UK Universities */}
            <Route path="/study-abroad/uk/universities/oxford" element={<Oxford />} />
            <Route path="/study-abroad/uk/universities/cambridge" element={<Cambridge />} />
            <Route path="/study-abroad/uk/universities/coventry" element={<Coventry />} />
            <Route path="/study-abroad/uk/universities/leeds-university" element={<UKLeedsUniversity />} />
            <Route path="/study-abroad/uk/universities/east-london" element={<EastLondon />} />

            {/* Canada Overview */}
            <Route path="/study-abroad/canada" element={<CanadaOverview />} />

            {/* Canada Cities */}
            <Route path="/study-abroad/canada/halifax" element={<Halifax />} />
            <Route path="/study-abroad/canada/montreal" element={<Montreal />} />
            <Route path="/study-abroad/canada/toronto" element={<Toronto />} />
            <Route path="/study-abroad/canada/edmonton" element={<Edmonton />} />
            <Route path="/study-abroad/canada/london-canada" element={<LondonCanada />} />

            {/* Canada Courses */}
            <Route path="/study-abroad/canada/courses/masters" element={<CanadaMastersCoursePage />} />
            <Route path="/study-abroad/canada/courses/phd" element={<CanadaPhdCoursePage />} />
            <Route path="/study-abroad/canada/courses/computer-science" element={<CanadaComputerScienceCoursePage />} />

            {/* Canada Universities */}
            <Route path="/study-abroad/canada/universities/conestoga" element={<ConestogaPage />} />
            <Route path="/study-abroad/canada/universities/toronto-university" element={<TorontoPage />} />
            <Route path="/study-abroad/canada/universities/lambton" element={<LambtonPage />} />
            <Route path="/study-abroad/canada/universities/humber" element={<HumberPage />} />
            <Route path="/study-abroad/canada/universities/centennial" element={<CentennialPage />} />

            {/* Germany Overview */}
            <Route path="/study-abroad/germany" element={<GermanyOverview />} />

            {/* Germany Admissions & Visa */}
            <Route path="/study-abroad/germany/intakes" element={<GermanyIntakes />} />
            <Route path="/study-abroad/germany/summer-intake" element={<GermanySummerIntake />} />
            <Route path="/study-abroad/germany/winter-intake" element={<GermanyWinterIntake />} />
            <Route path="/study-abroad/germany/visa" element={<GermanyVisa />} />
            <Route path="/study-abroad/germany/why-study" element={<GermanyWhyStudy />} />

            {/* Germany Universities */}
            <Route path="/study-abroad/germany/universities/best" element={<GermanyBestUniversities />} />
            <Route path="/study-abroad/germany/universities/top-masters" element={<GermanyTopMasters />} />
            <Route path="/study-abroad/germany/universities/affordable" element={<GermanyAffordable />} />
            <Route path="/study-abroad/germany/universities/public" element={<GermanyPublic />} />
            <Route path="/study-abroad/germany/universities/engineering" element={<GermanyEngineering />} />

            {/* Germany Courses */}
            <Route path="/study-abroad/germany/courses/masters" element={<GermanyMastersCoursePage />} />
            <Route path="/study-abroad/germany/courses/mba" element={<GermanyMBACoursePage />} />
            <Route path="/study-abroad/germany/courses/bachelors" element={<GermanyBachelorsCoursePage />} />
            <Route path="/study-abroad/germany/courses/best-courses" element={<GermanyBestCoursesPage />} />
            <Route path="/study-abroad/germany/courses/phd" element={<GermanyPhdCoursePage />} />

            {/* France Overview & Admissions */}
            <Route path="/study-abroad/france" element={<FranceOverview />} />
            <Route path="/study-abroad/france/intakes" element={<FranceIntakes />} />
            <Route path="/study-abroad/france/visa" element={<FranceVisa />} />
            <Route path="/study-abroad/france/why-study" element={<FranceWhyStudy />} />

            {/* France Universities */}
            <Route path="/study-abroad/france/universities/top" element={<FranceTopUniversities />} />
            <Route path="/study-abroad/france/universities/affordable" element={<FranceAffordable />} />
            <Route path="/study-abroad/france/universities/public" element={<FrancePublic />} />

            {/* France Courses */}
            <Route path="/study-abroad/france/courses/masters" element={<FranceMastersCourse />} />
            <Route path="/study-abroad/france/courses/mba" element={<FranceMBACourse />} />
            <Route path="/study-abroad/france/courses/mbbs" element={<FranceMBBSCourse />} />
            <Route path="/study-abroad/france/courses/mim" element={<FranceMIMCourse />} />
            <Route path="/study-abroad/france/courses/ma" element={<FranceMACourse />} />

            {/* New Zealand Overview & Admissions */}
            <Route path="/study-abroad/new-zealand" element={<NewZealandOverview />} />
            <Route path="/study-abroad/new-zealand/intakes" element={<NewZealandIntakes />} />
            <Route path="/study-abroad/new-zealand/july-intake" element={<NewZealandJulyIntake />} />
            <Route path="/study-abroad/new-zealand/visa" element={<NewZealandVisa />} />

            {/* New Zealand Universities */}
            <Route path="/study-abroad/new-zealand/universities/top" element={<NewZealandTopUniversities />} />
            <Route path="/study-abroad/new-zealand/universities/best" element={<NewZealandBest />} />
            <Route path="/study-abroad/new-zealand/universities/affordable" element={<NewZealandAffordable />} />
            <Route path="/study-abroad/new-zealand/universities/public" element={<NewZealandPublic />} />

            {/* New Zealand Courses */}
            <Route path="/study-abroad/new-zealand/courses/masters" element={<NewZealandMastersCourse />} />
            <Route path="/study-abroad/new-zealand/courses/mba" element={<NewZealandMBACourse />} />
            <Route path="/study-abroad/new-zealand/courses/mbbs" element={<NewZealandMBBSCourse />} />
            <Route path="/study-abroad/new-zealand/courses/mph" element={<NewZealandMPHCourse />} />
            <Route path="/study-abroad/new-zealand/courses/ma" element={<NewZealandMACourse />} />

            {/* Australia Overview & Pages */}
            <Route path="/study-abroad/australia" element={<AustraliaOverview />} />

            {/* Australia Courses */}
            <Route path="/study-abroad/australia/courses/masters" element={<AustraliaMastersCoursePage />} />
            <Route path="/study-abroad/australia/courses/business-analytics" element={<AustraliaBusinessAnalyticsCoursePage />} />
            <Route path="/study-abroad/australia/courses/public-health" element={<AustraliaPublicHealthCoursePage />} />

            {/* Australia Cities */}
            <Route path="/study-abroad/australia/adelaide" element={<AustraliaAdelaidePage />} />
            <Route path="/study-abroad/australia/brisbane" element={<AustraliaBrisbanePage />} />
            <Route path="/study-abroad/australia/melbourne" element={<AustraliaMelbournePage />} />
            <Route path="/study-abroad/australia/perth" element={<AustraliaPerthPage />} />
            <Route path="/study-abroad/australia/sydney" element={<AustraliaSydneyPage />} />

            {/* Australia Universities */}
            <Route path="/study-abroad/australia/universities/carnegie-mellon" element={<AustraliaCarnegieMellonPage />} />
            <Route path="/study-abroad/australia/universities/deakin" element={<AustraliaDeakinPage />} />
            <Route path="/study-abroad/australia/universities/monash" element={<AustraliaMonashPage />} />
            <Route path="/study-abroad/australia/universities/queensland" element={<AustraliaQueenslandPage />} />
            <Route path="/study-abroad/australia/universities/rmit" element={<AustraliaRMITPage />} />

            {/* Italy Overview & Admissions */}
            <Route path="/study-abroad/italy" element={<ItalyOverview />} />
            <Route path="/study-abroad/italy/intakes" element={<ItalyIntakes />} />
            <Route path="/study-abroad/italy/visa" element={<ItalyVisa />} />
            <Route path="/study-abroad/italy/free" element={<ItalyFree />} />

            {/* Italy Universities */}
            <Route path="/study-abroad/italy/universities/top" element={<ItalyTopUniversities />} />
            <Route path="/study-abroad/italy/universities/public" element={<ItalyPublic />} />

            {/* Italy Courses */}
            <Route path="/study-abroad/italy/courses/masters" element={<ItalyMastersCourse />} />
            <Route path="/study-abroad/italy/courses/mba" element={<ItalyMBACourse />} />
            <Route path="/study-abroad/italy/courses/ma" element={<ItalyMACourse />} />
            <Route path="/study-abroad/italy/courses/mbbs" element={<ItalyMBBSCourse />} />

            {/* Ireland Overview */}
            <Route path="/study-abroad/ireland" element={<IrelandOverview />} />

            {/* Ireland Courses */}
            <Route path="/study-abroad/ireland/courses/masters" element={<IrelandMastersCourse />} />
            <Route path="/study-abroad/ireland/courses/phd" element={<IrelandPhDCourse />} />
            <Route path="/study-abroad/ireland/courses/data-science" element={<IrelandDataScienceCourse />} />

            {/* Ireland Cities */}
            <Route path="/study-abroad/ireland/cities/dublin" element={<IrelandDublinCity />} />

            {/* Ireland Universities */}
            <Route path="/study-abroad/ireland/universities/trinity" element={<IrelandTrinity />} />
            <Route path="/study-abroad/ireland/universities/ucd" element={<IrelandUCD />} />
            <Route path="/study-abroad/ireland/universities/dcu" element={<IrelandDCU />} />
            <Route path="/study-abroad/ireland/universities/limerick" element={<IrelandLimerick />} />
            <Route path="/study-abroad/ireland/universities/it-carlow" element={<IrelandITCarlow />} />

            {/* Dynamic Study Abroad & University Portals */}
            <Route path="/study-abroad" element={<StudyAbroadHubPage />} />
            <Route path="/study-abroad/:countryCode/universities/:slug" element={<DynamicUniversityPage />} />
            <Route path="/study-abroad/:countryCode" element={<DynamicCountryPage />} />
            <Route path="/study-abroad/:countryCode/:city" element={<DynamicCityPage />} />
            <Route path="/universities/:slug" element={<DynamicUniversityPage />} />

            {/* Exams routes */}
            <Route path="/exams" element={<ExamsHubPage />} />
            <Route path="/exams/ielts" element={<IELTSOverview />} />
            <Route path="/exams/ielts/masterclass" element={<IELTSMasterclass />} />
            <Route path="/exams/ielts/overview" element={<IELTSOverview />} />
            <Route path="/exams/ielts/types" element={<IELTSTypesPage />} />
            <Route path="/exams/ielts/syllabus" element={<IELTSSyllabusPage />} />
            <Route path="/exams/ielts/practice-test" element={<IELTSPracticeTestPage />} />
            <Route path="/exams/ielts/eligibility" element={<IELTSEligibilityPage />} />
            <Route path="/exams/ielts/fees" element={<IELTSFeesPage />} />
            <Route path="/exams/ielts/dates" element={<IELTSDatesPage />} />
            <Route path="/exams/ielts/registration" element={<IELTSRegistrationPage />} />
            <Route path="/exams/ielts/slot-booking" element={<IELTSSlotBookingPage />} />
            <Route path="/exams/ielts/coaching-centres" element={<IELTSCoachingCentresPage />} />
            <Route path="/exams/ielts/results" element={<IELTSResultsPage />} />
            <Route path="/exams/ielts/listening" element={<IELTSListeningPage />} />
            <Route path="/exams/ielts/reading" element={<IELTSReadingPage />} />
            <Route path="/exams/ielts/writing" element={<IELTSWritingPage />} />
            <Route path="/exams/ielts/speaking" element={<IELTSSpeakingPage />} />

            {/* GMAT Exam routes */}
            <Route path="/exams/gmat" element={<GMATOverview />} />
            <Route path="/exams/gmat/overview" element={<GMATOverviewPage />} />
            <Route path="/exams/gmat/syllabus" element={<GMATSyllabusPage />} />
            <Route path="/exams/gmat/fees" element={<GMATFeesPage />} />
            <Route path="/exams/gmat/dates" element={<GMATDatesPage />} />
            <Route path="/exams/gmat/registration" element={<GMATRegistrationPage />} />
            <Route path="/exams/gmat/results" element={<GMATResultsPage />} />
            <Route path="/exams/gmat/score-scale" element={<GMATResultsPage />} />
            <Route path="/exams/gmat/preparation" element={<GMATPreparationPage />} />
            <Route path="/exams/gmat/sample-papers" element={<GMATSamplePapersPage />} />

            {/* GRE Exam routes */}
            <Route path="/exams/gre" element={<GREOverview />} />
            <Route path="/exams/gre/overview" element={<GREOverviewPage />} />
            <Route path="/exams/gre/syllabus" element={<GRESyllabusPage />} />
            <Route path="/exams/gre/fees" element={<GREFeesPage />} />
            <Route path="/exams/gre/dates" element={<GREDatesPage />} />
            <Route path="/exams/gre/registration" element={<GRERegistrationPage />} />
            <Route path="/exams/gre/results" element={<GREResultsPage />} />
            <Route path="/exams/gre/slot-booking" element={<GRESlotBookingPage />} />
            <Route path="/exams/gre/preparation" element={<GREPreparationPage />} />
            <Route path="/exams/gre/practice-test" element={<GREPracticeTestPage />} />

            {/* TOEFL Exam routes */}
            <Route path="/exams/toefl" element={<TOEFLOverview />} />
            <Route path="/exams/toefl/overview" element={<TOEFLOverviewPage />} />
            <Route path="/exams/toefl/syllabus" element={<TOEFLSyllabusPage />} />
            <Route path="/exams/toefl/fees" element={<TOEFLFeesPage />} />
            <Route path="/exams/toefl/dates" element={<TOEFLDatesPage />} />
            <Route path="/exams/toefl/registration" element={<TOEFLRegistrationPage />} />
            <Route path="/exams/toefl/results" element={<TOEFLResultsPage />} />
            <Route path="/exams/toefl/preparation" element={<TOEFLPreparationPage />} />

            {/* PTE Exam routes */}
            <Route path="/exams/pte" element={<PTEOverview />} />
            <Route path="/exams/pte/overview" element={<PTEOverviewPage />} />
            <Route path="/exams/pte/syllabus" element={<PTESyllabusPage />} />
            <Route path="/exams/pte/fees" element={<PTEFeesPage />} />
            <Route path="/exams/pte/dates" element={<PTEDatesPage />} />
            <Route path="/exams/pte/registration" element={<PTERegistrationPage />} />
            <Route path="/exams/pte/centres" element={<PTECentresPage />} />
            <Route path="/exams/pte/results" element={<PTEResultsPage />} />
            <Route path="/exams/pte/slot-booking" element={<PTESlotBookingPage />} />
            <Route path="/exams/pte/preparation" element={<PTEPreparationPage />} />

            {/* SAT Exam routes */}
            <Route path="/exams/sat" element={<SATOverview />} />
            <Route path="/exams/sat/overview" element={<SATOverviewPage />} />
            <Route path="/exams/sat/syllabus" element={<SATSyllabusPage />} />
            <Route path="/exams/sat/fees" element={<SATFeesPage />} />
            <Route path="/exams/sat/dates" element={<SATDatesPage />} />
            <Route path="/exams/sat/registration" element={<SATRegistrationPage />} />
            <Route path="/exams/sat/results" element={<SATResultsPage />} />
            <Route path="/exams/sat/preparation" element={<SATPreparationPage />} />

            {/* Duolingo Exam routes */}
            <Route path="/exams/duolingo" element={<DuolingoOverview />} />
            <Route path="/exams/duolingo/overview" element={<DuolingoOverviewPage />} />
            <Route path="/exams/duolingo/syllabus" element={<DuolingoSyllabusPage />} />
            <Route path="/exams/duolingo/fees" element={<DuolingoFeesPage />} />
            <Route path="/exams/duolingo/registration" element={<DuolingoRegistrationPage />} />
            <Route path="/exams/duolingo/results" element={<DuolingoResultsPage />} />
            <Route path="/exams/duolingo/preparation" element={<DuolingoPreparationPage />} />
            <Route path="/exams/duolingo/practice-test" element={<DuolingoPracticeTestPage />} />
            <Route path="/exams/duolingo/sample-questions" element={<DuolingoSampleQuestionsPage />} />
            <Route path="/exams/duolingo/australia" element={<DuolingoAustraliaPage />} />
            <Route path="/exams/duolingo/canada" element={<DuolingoCanadaPage />} />
            <Route path="/exams/duolingo/uk" element={<DuolingoUkPage />} />
            <Route path="/exams/duolingo/ireland" element={<DuolingoIrelandPage />} />
            <Route path="/exams/duolingo/germany" element={<DuolingoGermanyPage />} />

            {/* Resources Hub & Subpages */}
            <Route path="/resources" element={<ResourcesHubPage />} />

            {/* Resources - Books */}
            <Route path="/resources/books/ielts-books" element={<IELTSBooksPage />} />
            <Route path="/resources/books/sat-books" element={<SATBooksPage />} />
            <Route path="/resources/books/pte-books" element={<PTEBooksPage />} />
            <Route path="/resources/books/toefl-books" element={<TOEFLBooksPage />} />
            <Route path="/resources/books/gre-books" element={<GREBooksPage />} />
            <Route path="/resources/books/gmat-books" element={<GMATBooksPage />} />

            {/* Resources - Calculators */}
            <Route path="/resources/calculators/cgpa-to-gpa" element={<CGPAtoGPACalculator />} />
            <Route path="/resources/calculators/cgpa-to-percentage" element={<CGPAtoPercentage />} />
            <Route path="/resources/calculators/cgpa-to-marks" element={<CGPAtoMarks />} />
            <Route path="/resources/calculators/admission-eligibility" element={<EligibilityCalculatorPage />} />
            <Route path="/eligibility-calculator" element={<EligibilityCalculatorPage />} />
            <Route path="/unsubscribe" element={<UnsubscribePage />} />
            <Route path="/education-loan" element={<EducationLoanPage />} />
            <Route path="/visa-assistance" element={<VisaAssistancePage />} />
            <Route path="/scholarship-calculator" element={<EligibilityCalculatorPage />} />

            {/* Events */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />

            {/* Resources - SOP */}
            <Route path="/resources/sop/statement-of-purpose" element={<StatementOfPurposePage />} />
            <Route path="/resources/sop/sop-masters" element={<SOPMastersPage />} />
            <Route path="/resources/sop/sop-mba" element={<SOPMbaPage />} />
            <Route path="/resources/sop/sop-phd" element={<SOPPhdPage />} />

            {/* Resources - LOR */}
            <Route path="/resources/lor/lor-blog" element={<LORBlogPage />} />
            <Route path="/resources/lor/lor-masters" element={<LORMastersPage />} />
            <Route path="/resources/lor/lor-phd" element={<LORPhdPage />} />

            {/* UniCoach Digest, Newsroom & Blogs */}
            <Route path="/unicoach-digest" element={<UniCoachDigestPage />} />
            <Route path="/newsroom" element={<NewsroomPage />} />
            <Route path="/newsroom/:slug" element={<NewsDetailPage />} />
            <Route path="/news/:slug" element={<NewsDetailPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/rhodes-scholarship" element={<RhodesScholarshipPage />} />
            <Route path="/blogs/:slug" element={<BlogDetailPage />} />

            {/* Contact / Book Consultation Portals */}
            <Route path="/book-consultation" element={<ContactPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* User Dashboard */}
            <Route path="/dashboard" element={<UserDashboard />} />

            {/* Public Custom Forms (shareable link) */}
            <Route path="/f/:slug" element={<PublicFormPage />} />

            {/* Public Booking & Scheduling Pages (shareable link) */}
            <Route path="/book/:slug" element={<PublicBookingPage />} />

            {/* UniCoach Verified Mentorship & Marketplace Engine */}
            <Route path="/unicoach" element={<UnicoachMarketplacePage />} />
            <Route path="/unicoach/mentors" element={<MentorsDirectoryPage />} />
            <Route path="/unicoach/for-mentors" element={<MentorLandingPage />} />
            <Route path="/unicoach/apply" element={<UnicoachApplyPage />} />
            <Route path="/unicoach/join" element={<UnicoachApplyPage />} />
            <Route path="/unicoach/:handle" element={<UnicoachProfilePage />} />
            <Route path="/unicoach/track/:bookingRef" element={<StudentQueryTrackingPage />} />
            <Route path="/unicoach/dashboard" element={<UnicoachDashboardPage />} />
            <Route path="/unicoach/dashboard/:handle" element={<UnicoachDashboardPage />} />

            {/* Dedicated AI Tools & Shortlisting Discovery Routes */}
            <Route path="/universities" element={<UniversitiesPage />} />
            <Route path="/course-details" element={<CourseDetailsPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/ai-tools" element={<AiToolsHubPage />} />
            <Route path="/ai-tools/sop-generator" element={<AiSopGeneratorPage />} />
            <Route path="/ai-tools/study-roadmap" element={<AiStudyRoadmapPage />} />
            <Route path="/ai-tools/visa-prep" element={<AiVisaPrepPage />} />
            <Route path="/ai-tools/ielts-evaluator" element={<IeltsEvaluatorPage />} />
            
            {/* Quick Aliases */}
            <Route path="/sop-generator" element={<AiSopGeneratorPage />} />
            <Route path="/study-roadmap" element={<AiStudyRoadmapPage />} />
            <Route path="/visa-prep" element={<AiVisaPrepPage />} />
            <Route path="/ielts-evaluator" element={<IeltsEvaluatorPage />} />

            {/* Legal / Policy Routes */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/terms-of-service" element={<TermsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />

            {/* Support /@:handle routing in React Router v6 */}
            <Route path="/:handle/query/:bookingRef" element={<AtHandleQueryTrackingOrNotFound />} />
            <Route path="/:handle" element={<AtHandleOrNotFound />} />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </Suspense>
          </ErrorBoundary>

          <ConditionalFooter />
          <DeferredUniBot />
        </BrowserRouter>
      </LeadProvider>
    </AuthProvider>
  )
}

export default App