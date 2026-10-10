import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMentorProfile } from '../hooks/useMentorProfile';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import { useReservation } from '../hooks/useReservation';
import { purchaseDirectService, createPaymentOrder, verifyPayment, submitReview } from '../api/unicoachApi';
import { openRazorpayCheckout } from '../utils/razorpayCheckout';
import ServiceCard from '../components/ServiceCard';
import CheckoutModal from '../components/CheckoutModal';
import ReservationTimer from '../components/ReservationTimer';
import BookingSuccess from '../components/BookingSuccess';
import BackButton from '../../components/ui/BackButton';
import SocialIcon from '../../components/ui/SocialIcon';
import { socialLinksOf } from '../../utils/socialLinks';
import { 
  ArrowLeft, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sparkles,
  Quote,
  LayoutDashboard,
  Star,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'ONE_ON_ONE', label: '1:1 Call' },
  { id: 'PRIORITY_DM', label: 'Priority DM' },
  { id: 'DIGITAL_ASSET', label: 'Digital Product' },
  { id: 'COURSES', label: 'Courses' },
  { id: 'PACKAGE', label: 'Package' }
];

// Colours for the badges the UniCoach team gives a mentor
const BADGE_STYLES = [
  'bg-amber-100/90 text-amber-900 border-amber-200',
  'bg-rose-100/90 text-rose-900 border-rose-200',
  'bg-indigo-100/90 text-indigo-900 border-indigo-200'
];

const UnicoachProfilePage = () => {
  const { handle } = useParams();
  const cleanHandle = handle ? handle.replace(/^@/, '') : '';
  const { user } = useAuth() || {};

  // Data Hooks
  const { 
    mentor, 
    services, 
    recentReviews, 
    ratingStats,
    loading: mentorLoading, 
    error: mentorError, 
    refreshProfile 
  } = useMentorProfile(cleanHandle);

  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';

  const isOwner = Boolean(
    !isEmbed && user && (
      (user.unicoachHandle && user.unicoachHandle.toLowerCase() === cleanHandle.toLowerCase()) ||
      (user._id && mentor?.userId && String(user._id) === String(mentor.userId)) ||
      (user.email && mentor?.email && user.email.toLowerCase() === mentor.email.toLowerCase())
    )
  );
  
  // Local UI State
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const { 
    groupedSlots, 
    userTimezone, 
    setUserTimezone, 
    mentorTimezone: fetchedMentorTz, 
    loading: slotsLoading, 
    refreshSlots 
  } = useAvailableSlots(cleanHandle, selectedService?._id);
  const {
    reservation,
    secondsLeft,
    formattedTime,
    isReserving,
    isConfirming,
    confirmedBooking,
    reserveSlot,
    verifyPaymentBooking,
    cancelReservation,
    resetConfirmation
  } = useReservation(cleanHandle);

  // Reviews Carousel Page
  const [reviewIndex, setReviewIndex] = useState(0);

  // Direct Purchase State
  const [directBookingSuccess, setDirectBookingSuccess] = useState(null);
  const [isDirectPurchasing, setIsDirectPurchasing] = useState(false);

  // Filter services by active category
  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (selectedCategory === 'ALL') return services;
    if (selectedCategory === 'COURSES' || selectedCategory === 'PACKAGE') {
      return services.filter(s => s.type === 'DIGITAL_ASSET' || s.category === selectedCategory);
    }
    return services.filter(s => s.type === selectedCategory);
  }, [services, selectedCategory]);

  const displayedReviews = useMemo(() => {
    if (recentReviews && recentReviews.length > 0) return recentReviews;
    return [];
  }, [recentReviews]);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [writeBookingRef, setWriteBookingRef] = useState('');
  const [writeRating, setWriteRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [writeComment, setWriteComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState(null);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  const handleWriteReview = async (e) => {
    e.preventDefault();
    if (!writeBookingRef.trim()) {
      setReviewSubmitError('Please enter your Booking Reference code (e.g. UM-...)');
      return;
    }
    setIsSubmittingReview(true);
    setReviewSubmitError(null);
    try {
      await submitReview(cleanHandle, {
        bookingRef: writeBookingRef.trim().toUpperCase(),
        rating: writeRating,
        comment: writeComment.trim()
      });
      setReviewSubmitSuccess(true);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSubmitSuccess(false);
        setWriteBookingRef('');
        setWriteComment('');
        refreshProfile();
      }, 1500);
    } catch (err) {
      setReviewSubmitError(err.message || 'Failed to submit review. Make sure your booking reference is valid.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOpenService = (service) => {
    setSelectedService(service);
    setSelectedSlot(null);
    setIsCheckoutOpen(true);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleReserveTrigger = async (studentDetails) => {
    if (!selectedSlot || !selectedService) return;
    await reserveSlot(selectedSlot.id, selectedService._id, studentDetails);
  };

  const handleVerifyPaymentTrigger = async (paymentPayload) => {
    await verifyPaymentBooking(paymentPayload);
    setIsCheckoutOpen(false);
    refreshSlots();
  };

  // Direct services (digital products, Priority DM, SOP review):
  // purchase-direct -> (paid) create-payment-order -> Razorpay checkout -> verify-payment -> directResult.
  // Errors (incl. err.code === 'DISMISSED') are re-thrown so CheckoutModal can show them.
  const handleDirectPurchaseTrigger = async (payload, { prefill, onSimulated } = {}) => {
    setIsDirectPurchasing(true);
    try {
      let result = await purchaseDirectService(cleanHandle, payload);

      if (result?.status === 'PAYMENT_PENDING' && result.bookingRef) {
        const { bookingRef } = result;
        const order = await createPaymentOrder(cleanHandle, { bookingRef, gateway: 'RAZORPAY' });

        let verifyPayload = { bookingRef };
        if (order.free || order.gateway === 'FREE' || order.status === 'ALREADY_CONFIRMED') {
          // Nothing to charge — server finalizes with just the bookingRef
        } else if (order.simulated) {
          // Local dev without Razorpay keys
          onSimulated?.();
        } else {
          const rzpResponse = await openRazorpayCheckout(order, {
            name: 'UniCoach',
            description: `${result.serviceTitle || 'Purchase'} - ${result.mentorName || mentor?.name || ''}`,
            image: mentor?.avatarUrl || undefined,
            prefill
          });
          verifyPayload = {
            bookingRef,
            razorpay_order_id: rzpResponse.razorpay_order_id,
            razorpay_payment_id: rzpResponse.razorpay_payment_id,
            razorpay_signature: rzpResponse.razorpay_signature
          };
        }

        const verified = await verifyPayment(cleanHandle, verifyPayload);
        result = verified.directResult || result;
      }

      setDirectBookingSuccess(result);
      setIsCheckoutOpen(false);
      refreshProfile();
    } catch (err) {
      if (err?.code !== 'DISMISSED') console.error('Direct purchase failed:', err);
      throw err;
    } finally {
      setIsDirectPurchasing(false);
    }
  };

  if (mentorLoading) {
    return (
      <div className={`min-h-screen bg-[#FBF7F0] flex items-center justify-center p-6 ${isEmbed ? 'pt-4' : 'pt-[74px] md:pt-[80px]'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#8561E5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Loading creator storefront...</p>
        </div>
      </div>
    );
  }

  if (mentorError || !mentor) {
    return (
      <div className={`min-h-screen bg-[#FBF7F0] flex items-center justify-center p-6 ${isEmbed ? 'pt-4' : 'pt-[74px] md:pt-[80px]'}`}>
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 max-w-md w-full text-center shadow-md">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h2 className="font-outfit text-2xl font-black text-slate-900 mb-2">Mentor Not Found</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            We couldn't find a mentor profile for <strong className="text-slate-800">@{cleanHandle}</strong>. The handle might have been changed or deactivated.
          </p>
          {!isEmbed && (
            <Link
              to="/unicoach"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-[#DE5C2B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore All Mentors</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const mentorSocials = socialLinksOf(mentor.socialLinks);
  const mentorBadges = Array.isArray(mentor.badges) ? mentor.badges.filter(Boolean).slice(0, 4) : [];
  const isVerifiedMentor = mentor.applicationStatus === 'APPROVED' && Boolean(mentor.isVerified);

  return (
    <div className={`min-h-screen bg-[#FAF7F2] text-slate-900 font-sans ${isEmbed ? 'pt-2 px-2 sm:px-4' : 'pt-[74px] md:pt-[80px]'}`}>
      
      {/* ── Owner Storefront Preview Banner ── */}
      {isOwner && !isEmbed && (
        <div className="bg-slate-900 text-white text-xs py-2.5 px-4 sticky top-[74px] md:top-[80px] z-30 shadow-md border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-200">
                You are viewing your public student storefront (Preview Mode)
              </span>
            </div>
            <Link
              to={`/unicoach/dashboard/${cleanHandle}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all text-[11px] shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#8561E5]" />
              <span>Creator Studio</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── Under Review Banner if not yet approved by admin ── */}
      {mentor?.applicationStatus !== 'APPROVED' && (
        <div className="bg-amber-400 text-slate-950 text-xs py-2.5 px-4 sticky top-[74px] md:top-[80px] z-30 shadow-md font-semibold border-b border-amber-500">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
              <span>
                <strong>Profile Under Verification:</strong> This mentor's credentials & documents are currently being reviewed by UniCoach Admin. Public student bookings will open upon approval.
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              {mentor?.applicationStatus || 'PENDING'}
            </span>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          PAGE CONTAINER (Balances Desktop Two-Column & Mobile Flow)
          ════════════════════════════════════════════════════════════ */}
      <div className={`max-w-[1440px] mx-auto ${isEmbed ? 'px-2 py-4' : 'px-4 sm:px-6 lg:px-8 py-6 lg:py-10'}`}>
        {!isEmbed && (
          <div className="mb-4 lg:mb-5">
            <BackButton fallback="/unicoach#mentors-grid" />
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-10 items-start">
          
          {/* ════════════════════════════════════════════════════════════
              LEFT SIDEBAR: CREATOR PROFILE CREATOR CARD (Image 1)
              ════════════════════════════════════════════════════════════ */}
          <aside className="w-full lg:w-[380px] xl:w-[410px] bg-[#8561E5] text-white rounded-[32px] p-6 sm:p-8 lg:p-9 shadow-xl lg:sticky lg:top-[100px] flex flex-col justify-between flex-shrink-0 z-10 overflow-hidden relative">
            
            {/* Optional Storefront Cover Banner */}
            {mentor.coverImageUrl && (
              <div className="-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 lg:-mx-9 lg:-mt-9 mb-6 h-36 sm:h-44 overflow-hidden relative shadow-inner">
                <img
                  src={mentor.coverImageUrl}
                  alt={`${mentor.name}'s Banner`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#8561E5] via-[#8561E5]/20 to-black/30" />
              </div>
            )}

            <div>
              {/* Creator Avatar with Golden Verified Badge */}
              <div className={`relative w-fit mb-5 ${mentor.coverImageUrl ? '-mt-14 z-10' : ''}`}>
                {mentor.avatarUrl && !avatarError ? (
                  <img
                    src={mentor.avatarUrl}
                    alt={mentor.name || 'Mentor'}
                    onError={() => setAvatarError(true)}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-2xl bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#DE5C2B] to-[#7C3AED] text-white font-black text-3xl flex items-center justify-center ring-4 ring-white/30 shadow-2xl select-none">
                    {(mentor.name || 'M').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'M'}
                  </div>
                )}

                {/* Gold tick only once the UniCoach team has verified the mentor */}
                {isVerifiedMentor && (
                <div
                  className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center ring-3 ring-[#8561E5] shadow-md font-black"
                  title="Verified UniCoach Mentor"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                )}
              </div>

              {/* Mentor Name & Headline */}
              <h1 className="font-outfit text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {mentor.name}
              </h1>

              <p className="text-sm sm:text-[14.5px] text-white/90 font-medium leading-relaxed mt-2.5">
                {mentor.headline || mentor.bio || 'Admitted Foreign University Senior • SOP & Visa Advisor'}
              </p>

              {/* The mentor's own social profiles (added from their dashboard) */}
              {mentorSocials.length > 0 && (
                <ul className="flex flex-wrap gap-2 mt-4" aria-label={`${mentor.name} on social media`}>
                  {mentorSocials.map(([key, label, url]) => (
                    <li key={key}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        aria-label={`${mentor.name} on ${label}`}
                        title={label}
                        className="w-9 h-9 rounded-full bg-white/15 hover:bg-white text-white hover:text-[#8561E5] border border-white/25 flex items-center justify-center transition-colors"
                      >
                        <SocialIcon name={key} />
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {/* Rating from real student reviews (hidden until the first one) */}
              {ratingStats?.totalReviews > 0 && (
                <div className="mt-4 pt-4 border-t border-white/15 text-xs text-white/85 font-medium flex items-center gap-1.5 flex-wrap">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" aria-hidden="true" />
                  <span className="font-extrabold text-white">{ratingStats.averageRating}/5</span>
                  <span>{ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'rating' : 'ratings'}</span>
                </div>
              )}

              {/* Badges given by the UniCoach team */}
              {mentorBadges.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-5">
                  {mentorBadges.map((badge, i) => (
                    <span
                      key={badge}
                      className={`text-[11px] font-black px-3 py-1 rounded-full shadow-2xs border ${BADGE_STYLES[i % BADGE_STYLES.length]}`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Branding & Action Button */}
            <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white text-[#8561E5] flex items-center justify-center font-black text-xs shadow-md">
                  U
                </div>
                <span className="font-outfit font-black text-base tracking-tight text-white">
                  unicoach
                </span>
              </div>

              {isOwner ? (
                <Link
                  to={`/unicoach/dashboard/${cleanHandle}`}
                  className="px-4 py-2 rounded-full bg-white text-slate-950 hover:bg-slate-100 text-xs font-black shadow-lg transition-all hover:scale-105 flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#8561E5]" />
                  <span>Dashboard</span>
                </Link>
              ) : isVerifiedMentor ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Verified Mentor</span>
                </div>
              ) : null}
            </div>

          </aside>

          {/* ════════════════════════════════════════════════════════════
              RIGHT MAIN CONTENT AREA: WARM SAND STOREFRONT (Image 1)
              ════════════════════════════════════════════════════════════ */}
          <main className="flex-1 w-full min-w-0">
        
        {/* Success Screens (1:1 Call or Direct Purchase) */}
        {directBookingSuccess ? (
          <BookingSuccess
            booking={directBookingSuccess}
            onClose={() => setDirectBookingSuccess(null)}
          />
        ) : confirmedBooking ? (
          <BookingSuccess
            booking={confirmedBooking}
            onClose={() => {
              resetConfirmation();
              setSelectedSlot(null);
            }}
          />
        ) : (
          <>
            {/* ── TOP SECTION: PINNED TESTIMONIALS CAROUSEL (Image 1) ── */}
            <section className="mb-10 sm:mb-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Verified Student Reviews
                  </span>
                  {/* Only a real average: no stars before the first review */}
                  {ratingStats?.totalReviews > 0 && (
                    <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{ratingStats.averageRating} ({ratingStats.totalReviews})</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {displayedReviews.length > 3 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setReviewIndex((prev) => (prev > 0 ? prev - 1 : displayedReviews.length - 1))}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewIndex((prev) => (prev < displayedReviews.length - 1 ? prev + 1 : 0))}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Write a Review</span>
                  </button>
                </div>
              </div>

              {/* Review Cards or Empty State */}
              {displayedReviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200/70 text-center shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  </div>
                  <h3 className="font-outfit text-base font-bold text-slate-900 mb-1">
                    No Reviews Yet for @{cleanHandle}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
                    Have you attended a 1:1 consultation or ordered an SOP review from {mentor?.name}? Share your genuine feedback!
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Write a Verified Review</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedReviews.slice(reviewIndex, reviewIndex + 3).map((review, i) => (
                    <div
                      key={review._id || review.id || i}
                      className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-2xs flex flex-col justify-between min-h-[170px]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(review.rating || 5)].map((_, idx) => (
                              <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        </div>
                        <p className="text-xs sm:text-[12.5px] text-slate-700 line-clamp-3 leading-relaxed font-normal mt-1.5">
                          &ldquo;{review.comment || review.text}&rdquo;
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <strong className="block text-slate-900 font-extrabold leading-none">
                            {review.studentName || review.author || 'Verified Student'}
                          </strong>
                          <span className="text-[10.5px] text-slate-400 mt-1 block">
                            {review.serviceTitle || (review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '1:1 Session')}
                          </span>
                        </div>
                        <span className="text-[10.5px] text-slate-400 font-mono">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── MIDDLE SECTION: CATEGORY FILTER PILLS (Image 1) ── */}
            <section className="mb-6">
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = selectedCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-md'
                          : 'bg-white text-slate-700 border border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── SERVICES BENTO GRID (Matching Image 1) ── */}
            <section>
              {filteredServices.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/70">
                  <p className="text-sm font-semibold text-slate-500">
                    No offerings found under this category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {filteredServices.map((svc) => (
                    <ServiceCard
                      key={svc._id}
                      service={svc}
                      isSelected={selectedService?._id === svc._id}
                      onSelect={handleOpenService}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* 0% Platform Fee Banner at Footer */}
            <div className="mt-14 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block font-black text-slate-900 text-sm">
                    UniCoach 0% Platform Fee Policy
                  </strong>
                  <span>We take ₹0 platform commission. 100% of student booking payments go directly to the mentor.</span>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 text-xs whitespace-nowrap">
                ✓ 100% Escrow Protected
              </span>
            </div>
          </>
        )}

      </main>

        </div>
      </div>

      {/* Floating 10-Minute Cart Hold Timer (For 1:1 Video Calls) */}
      <ReservationTimer
        reservation={reservation}
        formattedTime={formattedTime}
        secondsLeft={secondsLeft}
        onCancel={cancelReservation}
      />

      {/* 4-Step Checkout & Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        service={selectedService}
        slot={selectedSlot}
        mentor={mentor}
        mentorTimezone={mentor?.ianaTimezone || fetchedMentorTz || 'Europe/Dublin'}
        groupedSlots={groupedSlots}
        userTimezone={userTimezone}
        onChangeTimezone={setUserTimezone}
        slotsLoading={slotsLoading}
        onSelectSlot={handleSlotSelect}
        reservation={reservation}
        isReserving={isReserving}
        isConfirming={isConfirming}
        onReserve={handleReserveTrigger}
        onVerifyPayment={handleVerifyPaymentTrigger}
        onDirectPurchase={handleDirectPurchaseTrigger}
        isDirectPurchasing={isDirectPurchasing}
      />

      {/* ── WRITE A VERIFIED REVIEW MODAL ── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-outfit text-base font-bold text-slate-900">
                    Write a Verified Review
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Review your session with {mentor?.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewSubmitSuccess ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-outfit text-base font-bold text-slate-900 mb-1">
                  Thank You!
                </h4>
                <p className="text-xs text-slate-600">
                  Your verified review has been published on @{cleanHandle}&apos;s profile.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWriteReview} className="mt-4 space-y-4">
                {reviewSubmitError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewSubmitError}</span>
                  </div>
                )}

                {/* Booking Reference */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Booking Reference ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={writeBookingRef}
                    onChange={(e) => setWriteBookingRef(e.target.value)}
                    placeholder="e.g. UM-MUEB741H-B514C1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/20 focus:border-slate-950"
                  />
                  <span className="text-[10.5px] text-slate-400 mt-1 block">
                    Found in your booking confirmation screen or email.
                  </span>
                </div>

                {/* Star Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rating <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setWriteRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= (hoverRating || writeRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {writeRating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Comment Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Review & Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={writeComment}
                    onChange={(e) => setWriteComment(e.target.value)}
                    placeholder="Share how helpful the mentor was with your university application, visa questions, or profile review..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/20 focus:border-slate-950 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default UnicoachProfilePage;
