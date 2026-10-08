import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ArrowLeft, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Tag, 
  Sparkles, 
  Download, 
  MessageSquare, 
  Video, 
  Clock, 
  Star, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { validateCoupon, createPaymentOrder } from '../api/unicoachApi';
import { openRazorpayCheckout } from '../utils/razorpayCheckout';
import SlotPicker from './SlotPicker';

// Resilient Mentor Avatar Component (Guarantees zero broken image icons)
const MentorAvatar = ({ mentor, size = 'lg', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [mentor?.avatarUrl]);

  const initials = useMemo(() => {
    if (!mentor?.name) return 'M';
    const parts = mentor.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [mentor?.name]);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-14 h-14 text-base',
    xl: 'w-16 h-16 text-xl'
  }[size] || 'w-14 h-14 text-base';

  if (!mentor?.avatarUrl || imgError) {
    return (
      <div 
        className={`${sizeClasses} rounded-full bg-gradient-to-tr from-[#DE5C2B] to-[#7C3AED] text-white font-extrabold flex items-center justify-center ring-2 ring-white shadow-md select-none flex-shrink-0 ${className}`}
        title={mentor?.name || 'Mentor'}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={mentor.avatarUrl}
      alt={mentor.name || 'Mentor'}
      onError={() => setImgError(true)}
      className={`${sizeClasses} rounded-full object-cover ring-2 ring-white shadow-md flex-shrink-0 ${className}`}
    />
  );
};

// Country Codes for Phone Input 
const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+353', country: 'IE', flag: '🇮🇪', name: 'Ireland' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' }
];

/**
 * CheckoutModal
 * Multi-Step Booking & Purchase Experience 
 * Step 1: Service Detail View (Image 2)
 * Step 2: Student Details & Order Summary (Image 3) - with 0% Platform Fee
 * Step 3: Payment (Image 4) - Razorpay (UPI, cards, netbanking & international cards) with 0% Platform Fee
 */
const CheckoutModal = ({
  isOpen,
  onClose,
  service,
  slot,
  mentor,
  groupedSlots = {},
  userTimezone = 'UTC',
  mentorTimezone,
  onChangeTimezone,
  slotsLoading = false,
  onSelectSlot,
  reservation,
  isReserving,
  isConfirming,
  onReserve,
  onVerifyPayment,
  onDirectPurchase,
  isDirectPurchasing
}) => {
  // Modal Step State: 'DETAIL' | 'STUDENT_INFO' | 'PAYMENT'
  const [currentStep, setCurrentStep] = useState('DETAIL');

  // Form details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [customAnswers, setCustomAnswers] = useState({});
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(true);
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  // Priority DM query state
  const [priorityDmQuery, setPriorityDmQuery] = useState({
    questionText: '',
    contextText: '',
    referenceUrl: ''
  });

  // Payment state (Razorpay is the only gateway: UPI, cards, netbanking & international cards)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentNotice, setPaymentNotice] = useState(null); // soft, non-error message (e.g. popup closed)
  const [isSandboxNotice, setIsSandboxNotice] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Reset to DETAIL step when opening a new service
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('DETAIL');
      setFormErrors({});
      setPaymentError(null);
      setPaymentNotice(null);
      setIsProcessingPayment(false);
      setIsSandboxNotice(false);
      setShowDiscountInput(false);
    }
  }, [isOpen, service?._id]);

  // Handle ESC key press to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Availability calculations for 1:1 sessions (must be declared before any early returns to respect React Rules of Hooks)
  const totalSlotsCount = useMemo(() => {
    if (!groupedSlots || !Array.isArray(groupedSlots)) return 0;
    return groupedSlots.reduce((acc, g) => acc + (Array.isArray(g.slots) ? g.slots.length : 0), 0);
  }, [groupedSlots]);

  if (!isOpen || !service) return null;

  const isOneOnOne = service.type === 'ONE_ON_ONE';
  const isDirectService = service.type === 'DIGITAL_ASSET' || service.type === 'PRIORITY_DM' || service.type === 'SOP_REVIEW';
  const isDigitalAsset = service.type === 'DIGITAL_ASSET';
  const isPriorityDm = service.type === 'PRIORITY_DM';

  const hasAvailableSlots = totalSlotsCount > 0;

  // Pricing calculations
  const originalPrice = service.originalPriceINR || service.priceInINR * 1.25 || service.priceInINR;
  const basePrice = service.priceInINR;
  const currentPrice = appliedCoupon ? appliedCoupon.finalPrice : basePrice;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);

    try {
      const result = await validateCoupon(mentor.handle, couponInput, service._id);
      setAppliedCoupon(result);
      setCouponInput('');
      setShowDiscountInput(false);
    } catch (err) {
      setCouponError(err.message || 'Invalid or expired discount code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const validateStudentInfo = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email is required';
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 7) {
      errs.phone = 'Valid phone number is required';
    }

    if (isPriorityDm && !priorityDmQuery.questionText.trim()) {
      errs.questionText = 'Please enter your question for the mentor';
    }

    if (service.customQuestions && service.customQuestions.length > 0) {
      for (const q of service.customQuestions) {
        if (q.required && (!customAnswers[q.questionText] || !customAnswers[q.questionText].trim())) {
          errs[`q_${q.questionText}`] = 'This question is required';
        }
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Move from Detail -> Student Info
  const handleProceedToStudentInfo = () => {
    if (isOneOnOne) {
      if (!slotsLoading && !hasAvailableSlots) {
        setFormErrors({ slot: 'This mentor currently has no available time slots. Please check back later.' });
        return;
      }
      if (!slot) {
        setFormErrors({ slot: 'Please select an available date and time slot above to proceed' });
        return;
      }
    }
    setFormErrors({});
    setCurrentStep('STUDENT_INFO');
  };

  // Move from Student Info -> Payment Step
  const handleProceedToPayment = async (e) => {
    e?.preventDefault();
    if (!validateStudentInfo()) return;

    const fullPhone = `${formData.phoneCountryCode} ${formData.phoneNumber}`;
    const formattedAnswers = Object.entries(customAnswers).map(([qText, ans]) => ({
      questionText: qText,
      answerText: ans
    }));

    // If 1:1 call, trigger atomic Redis reservation hold (10 mins)
    if (isOneOnOne && slot && !reservation) {
      try {
        await onReserve({
          name: formData.name,
          email: formData.email,
          phone: fullPhone,
          notes: formData.notes,
          customAnswers: formattedAnswers,
          couponCode: appliedCoupon?.code || null
        });
        setCurrentStep('PAYMENT');
      } catch (err) {
        console.error('Reservation failed:', err);
      }
    } else {
      setCurrentStep('PAYMENT');
    }
  };

  // Execute Final Payment & Order Confirmation
  const handleCompletePayment = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentNotice(null);
    const fullPhone = `${formData.phoneCountryCode} ${formData.phoneNumber}`;
    const formattedAnswers = Object.entries(customAnswers).map(([qText, ans]) => ({
      questionText: qText,
      answerText: ans
    }));

    const checkoutPrefill = {
      name: formData.name,
      email: formData.email,
      contact: `${formData.phoneCountryCode}${formData.phoneNumber}`
    };

    try {
      if (isDirectService) {
        // Direct services (digital products, Priority DM, SOP review):
        // purchase-direct creates a PAYMENT_PENDING booking, then the parent runs
        // create-payment-order -> Razorpay checkout -> verify-payment.
        if (onDirectPurchase) {
          await onDirectPurchase(
            {
              serviceId: service._id,
              studentName: formData.name,
              studentEmail: formData.email,
              studentPhone: fullPhone,
              studentNotes: formData.notes,
              customAnswers: formattedAnswers,
              couponCode: appliedCoupon?.code || null,
              paymentGateway: 'RAZORPAY',
              priorityDmQuery: isPriorityDm ? priorityDmQuery : undefined
            },
            {
              prefill: checkoutPrefill,
              onSimulated: () => setIsSandboxNotice(true)
            }
          );
        }
        return;
      }

      // 1:1 Consultation: create order -> (free / simulated / Razorpay checkout) -> server-side verify
      if (!reservation?.bookingRef) {
        throw new Error('No active slot reservation found. Please select your slot again.');
      }
      const bookingRef = reservation.bookingRef;

      const orderRes = await createPaymentOrder(mentor.handle, {
        bookingRef,
        gateway: 'RAZORPAY'
      });

      let verifyPayload = { bookingRef };

      if (orderRes.free || orderRes.gateway === 'FREE' || orderRes.status === 'ALREADY_CONFIRMED') {
        // Free booking (or already paid): server confirms with just the bookingRef
      } else if (orderRes.simulated) {
        // Local dev without Razorpay keys: server accepts simulated orders only in dev
        setIsSandboxNotice(true);
      } else {
        const rzpResponse = await openRazorpayCheckout(orderRes, {
          name: 'UniCoach',
          description: `Session with ${mentor.name} - ${service.title}`,
          image: mentor.avatarUrl || undefined,
          prefill: checkoutPrefill
        });
        verifyPayload = {
          bookingRef,
          razorpay_order_id: rzpResponse.razorpay_order_id,
          razorpay_payment_id: rzpResponse.razorpay_payment_id,
          razorpay_signature: rzpResponse.razorpay_signature
        };
      }

      if (onVerifyPayment) {
        await onVerifyPayment(verifyPayload);
      }
    } catch (err) {
      if (err?.code === 'DISMISSED') {
        setPaymentNotice(
          isDirectService
            ? 'Payment window closed. No money was taken — click Pay whenever you are ready to try again.'
            : 'Payment window closed. No money was taken — click Pay to try again while your slot is still held.'
        );
      } else {
        console.error('Payment confirmation failed:', err);
        setPaymentError(err?.message || 'Payment failed. Please try again.');
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const modalContent = (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      
      {/* ════════════════════════════════════════════════════════════
          STEP 1: SERVICE DETAIL MODAL (Matching Image 2 Reference)
          ════════════════════════════════════════════════════════════ */}
      {currentStep === 'DETAIL' && (
        <div className="bg-white rounded-[32px] max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
          
          {/* Dedicated Sticky Header with Category Badge & Prominent Close Cross Button */}
          <div className="px-6 py-4 bg-[#FBF7F0] border-b border-slate-200/70 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs">
                {isDigitalAsset ? <Download className="w-3.5 h-3.5 text-emerald-600" /> : isPriorityDm ? <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> : <Video className="w-3.5 h-3.5 text-[#DE5C2B]" />}
                <span>{isDigitalAsset ? 'Digital Product' : isPriorityDm ? 'Priority DM' : '1:1 Video Consultation'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-slate-900 text-xs font-black shadow-2xs border border-slate-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.8</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wide">
                Verified
              </span>
            </div>

            {/* Prominent Circular Close Cross Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-10 h-10 rounded-full bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/90 hover:border-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 flex-shrink-0 ml-3"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Banner with Title & Avatar */}
          <div className="p-6 sm:p-8 bg-[#FBF7F0] border-b border-slate-200/60">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="font-outfit text-2xl sm:text-3xl font-black text-[#0F172A] leading-tight break-words">
                  {service.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Direct session with <strong className="text-slate-800">{mentor.name}</strong> • 100% Escrow Protected
                </p>
              </div>

              {/* Mentor Avatar (With graceful image error fallback) */}
              <div className="flex-shrink-0">
                <MentorAvatar mentor={mentor} size="lg" />
              </div>
            </div>
          </div>

          {/* Body Content (Scrollable) */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm leading-relaxed">
            
            {/* Description */}
            <div className="space-y-3">
              <p className="font-medium text-slate-900 text-base">
                {service.description || 'Comprehensive guidance and curated materials to fast-track your overseas study journey.'}
              </p>
              <p className="text-slate-600 text-xs sm:text-sm">
                How to prepare, what to verify, and how to avoid costly agency pitfalls. Get direct, unbiased insight from seniors who have already achieved what you are aiming for.
              </p>
            </div>

            {/* Feature Bullets (Matching Reference in Image 2) */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                What you will get:
              </h4>
              <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B] mt-1.5 flex-shrink-0" />
                  <span>100% verified, student-tested strategies specific to your dream country</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B] mt-1.5 flex-shrink-0" />
                  <span>Personalized feedback based on your academic profile and target universities</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B] mt-1.5 flex-shrink-0" />
                  <span>Sample templates, checklists, and actionable tips to execute within 45 minutes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B] mt-1.5 flex-shrink-0" />
                  <span>Direct contact with admitted senior with escrow refund protection</span>
                </li>
              </ul>
            </div>

            {/* 1:1 Call Slot Picker (if applicable) */}
            {isOneOnOne && (
              <div className="pt-2">
                <h3 className="font-outfit text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#DE5C2B]" />
                  <span>Select Date & Time for 1:1 Video Session</span>
                </h3>
                <SlotPicker
                  groupedSlots={groupedSlots}
                  userTimezone={userTimezone}
                  mentorTimezone={mentorTimezone || mentor?.ianaTimezone || 'Europe/Dublin'}
                  onChangeTimezone={onChangeTimezone}
                  selectedSlot={slot}
                  onSelectSlot={onSelectSlot}
                  loading={slotsLoading}
                />
                {formErrors.slot && (
                  <p className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.slot}</span>
                  </p>
                )}
              </div>
            )}

            {/* Terms Links */}
            <div className="text-center text-xs text-slate-400 pt-2">
              <span className="hover:underline cursor-pointer">Terms</span> • <span className="hover:underline cursor-pointer">Privacy</span>
            </div>
          </div>

          {/* Sticky Bottom Checkout Action Bar (Image 2) */}
          <div className="p-5 sm:p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-outfit text-2xl sm:text-3xl font-black text-[#0F172A]">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {originalPrice > basePrice && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    ₹{Math.round(originalPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {isOneOnOne && !slotsLoading && !hasAvailableSlots && (
                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>No open slots currently</span>
                </span>
              )}
              {isOneOnOne && slot && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span>✓ {slot.displayDate || 'Slot'} at {slot.startTimeStr}</span>
                </span>
              )}
            </div>

            {/* Dynamic Action Button */}
            {isOneOnOne && !slotsLoading && !hasAvailableSlots ? (
              <button
                type="button"
                disabled
                className="py-3.5 px-6 sm:px-8 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 font-bold text-sm cursor-not-allowed select-none shadow-none flex items-center gap-2"
                title="This mentor has no open slots right now"
              >
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span>No Slots Available</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProceedToStudentInfo}
                className="py-3.5 px-8 sm:px-10 rounded-2xl bg-[#0F172A] hover:bg-[#DE5C2B] text-white font-extrabold text-sm transition-all shadow-md hover:shadow-xl cursor-pointer"
              >
                {isOneOnOne && !slot ? 'Select Slot & Continue' : 'Get this!'}
              </button>
            )}
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          STEP 2: STUDENT DETAILS & ORDER SUMMARY (Matching Image 3)
          ════════════════════════════════════════════════════════════ */}
      {currentStep === 'STUDENT_INFO' && (
        <div className="bg-white rounded-[32px] max-w-4xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
          
          {/* Top Bar with Back Arrow & Mentor Name */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <button
              type="button"
              onClick={() => setCurrentStep('DETAIL')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#DE5C2B] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <MentorAvatar mentor={mentor} size="sm" />
                <span className="font-semibold text-slate-900">{mentor.name}</span>
              </div>
            </button>

            {/* Prominent Circular Close Cross Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 flex-shrink-0"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Two-Column Layout (Image 3) */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Service Details Recap */}
            <div className="lg:col-span-6 space-y-4">
              <h1 className="font-outfit text-2xl sm:text-3xl font-black text-[#0F172A] leading-tight">
                {service.title}
              </h1>

              <div>
                <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-black tracking-wider uppercase border border-indigo-100/80">
                  {isDigitalAsset ? 'DIGITAL RESOURCE' : isPriorityDm ? 'PRIORITY DM' : '1:1 CALL'}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-slate-600 space-y-2.5 pt-2">
                <p>Do you want guidance on your study abroad applications, but don't know where to start?</p>
                <p>Get personalized tips, line-by-line advice, and review tricks in a single focused session.</p>
                
                <ul className="space-y-2 pt-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5" />
                    <span>Information on ATS-friendly SOPs & university requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5" />
                    <span>Whether fresher or experienced, tailored to your exact background</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5" />
                    <span>Actionable steps delivered directly with 100% escrow protection</span>
                  </li>
                </ul>
              </div>

              {/* Slot Confirmation if 1:1 */}
              {isOneOnOne && slot && (
                <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 text-xs text-blue-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-[#DE5C2B]">
                    <Clock className="w-4 h-4" />
                    <span>Confirmed Session Time:</span>
                  </div>
                  <p className="font-semibold text-slate-800">
                    {new Date(slot.startUtc).toLocaleString('en-US', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                      ...(userTimezone && userTimezone !== 'UTC' ? { timeZone: userTimezone } : {})
                    })} ({userTimezone})
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Checkout Input Form */}
            <div className="lg:col-span-6 bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B] transition-all"
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B] transition-all"
                />
                {formErrors.email && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Phone number with Country code selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Phone number
                </label>
                <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#DE5C2B]/20 focus-within:border-[#DE5C2B] transition-all">
                  <select
                    value={formData.phoneCountryCode}
                    onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                    className="bg-slate-50 border-r border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c, i) => (
                      <option key={i} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 text-sm focus:outline-none bg-white"
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Priority DM Question Input */}
              {isPriorityDm && (
                <div className="pt-2 border-t border-slate-200/60 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Your Question for {mentor.name} *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your situation, dilemma, or what specific guidance you need..."
                    value={priorityDmQuery.questionText}
                    onChange={(e) => setPriorityDmQuery({ ...priorityDmQuery, questionText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white resize-none"
                  />
                  {formErrors.questionText && (
                    <p className="text-[11px] text-rose-500 font-medium">{formErrors.questionText}</p>
                  )}
                </div>
              )}

              {/* Creator's Custom Questions */}
              {service.customQuestions && service.customQuestions.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-3">
                  <p className="text-xs font-bold text-slate-900">
                    Questions from {mentor.name}:
                  </p>
                  {service.customQuestions.map((q, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {q.questionText} {q.required && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Your answer..."
                        value={customAnswers[q.questionText] || ''}
                        onChange={(e) => setCustomAnswers({ ...customAnswers, [q.questionText]: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                      {formErrors[`q_${q.questionText}`] && (
                        <p className="text-[11px] text-rose-500 font-medium mt-1">{formErrors[`q_${q.questionText}`]}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Discount Code Section */}
              <div className="pt-2">
                {!showDiscountInput && !appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => setShowDiscountInput(true)}
                    className="text-xs font-bold text-[#DE5C2B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Add Discount Code</span>
                  </button>
                ) : showDiscountInput && !appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase bg-white"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#DE5C2B] text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </form>
                ) : null}

                {couponError && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appliedCoupon.code} Applied (₹{appliedCoupon.discountAmount} OFF)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-rose-600 hover:underline text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Order Summary Dropdown (Image 3) */}
              <div className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-extrabold text-slate-800 hover:bg-slate-50/80 transition-colors"
                >
                  <span>Order Summary</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-outfit font-black text-slate-900 text-sm">
                      ₹{currentPrice.toLocaleString('en-IN')}
                    </span>
                    {isOrderSummaryOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isOrderSummaryOpen && (
                  <div className="px-4 pb-3.5 pt-1 border-t border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Service Price:</span>
                      <span className="font-semibold text-slate-900">₹{basePrice.toLocaleString('en-IN')}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Discount ({appliedCoupon.code}):</span>
                        <span>-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {/* 0% PLATFORM FEE LINE (CRITICAL AS REQUESTED) */}
                    <div className="flex justify-between items-center text-slate-600">
                      <div className="flex items-center gap-1">
                        <span>Platform Fee:</span>
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          0% FREE
                        </span>
                      </div>
                      <span className="font-bold text-emerald-600">₹0</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-slate-100 font-black text-slate-900 text-sm">
                      <span>Total Amount:</span>
                      <span className="text-slate-900">₹{currentPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Sticky Bottom Action Bar (Image 3) */}
          <div className="p-5 sm:p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4 shadow-lg sticky bottom-0">
            <div className="flex items-baseline gap-2">
              <span className="font-outfit text-2xl sm:text-3xl font-black text-[#0F172A]">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {originalPrice > basePrice && (
                <span className="text-sm font-semibold text-slate-400 line-through">
                  ₹{Math.round(originalPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleProceedToPayment}
              disabled={isReserving}
              className="py-3.5 px-8 sm:px-12 rounded-2xl bg-[#0F172A] hover:bg-[#DE5C2B] text-white font-extrabold text-sm transition-all shadow-md hover:shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isReserving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locking Slot...</span>
                </>
              ) : (
                <span>Confirm & Pay</span>
              )}
            </button>
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          STEP 3: PAYMENT GATEWAY SELECTOR (Matching Image 4 Reference)
          ════════════════════════════════════════════════════════════ */}
      {currentStep === 'PAYMENT' && (
        <div className="bg-white rounded-[32px] max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
          
          {/* Top Header Card with Back to Details & Prominent Close Cross Button */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <button
              type="button"
              onClick={() => setCurrentStep('STUDENT_INFO')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#DE5C2B] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2.5">
                <MentorAvatar mentor={mentor} size="md" />
                <div className="text-left">
                  <h4 className="font-outfit text-xs font-black text-slate-900 leading-tight">
                    {mentor.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    Back to Details
                  </p>
                </div>
              </div>
            </button>

            {/* Prominent Circular Close Cross Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 flex-shrink-0"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            
            {/* Heading & Subtitle */}
            <div>
              <h2 className="font-outfit text-2xl font-black text-slate-900 leading-tight mb-1">
                Complete your payment
              </h2>
              <p className="text-xs text-slate-500">
                for {service.title}
              </p>
            </div>

            {/* "To Pay" Box (Image 4) */}
            <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex items-center justify-between">
              <span className="font-outfit text-sm font-bold text-slate-700">
                To Pay
              </span>
              <span className="font-outfit text-2xl sm:text-3xl font-black text-slate-900">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Zero Platform Fee Banner (Crucial Requirement!) */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black text-emerald-950">
                  🎉 0% Platform Fee Guarantee
                </strong>
                <span className="text-[11.5px] text-emerald-800 leading-snug">
                  UniCoach UniCoach charges <strong>₹0 platform commission</strong>. 100% of your booking amount goes directly into your mentor's wallet.
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Note: Prices shown are converted to your currency & may vary slightly at the payment gateway.
            </p>

            {/* Gateway Error Notification */}
            {paymentError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-900">Payment Notice</strong>
                  <span>{paymentError}</span>
                </div>
              </div>
            )}

            {/* Soft notice (e.g. Razorpay popup closed) */}
            {paymentNotice && !paymentError && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <span>{paymentNotice}</span>
              </div>
            )}

            {/* Sandbox Simulation Notice */}
            {isSandboxNotice && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-bold">Sandbox Mode:</span> Simulated payment completed with verified escrow.
              </div>
            )}

            {/* Payment Method (Image 4) — Razorpay is the only gateway */}
            <div className="space-y-3">
              <div className="rounded-2xl p-4 border-2 border-slate-900 bg-slate-900 text-white shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-white px-2 py-1 rounded-md shadow-2xs">
                      <span className="font-outfit font-black text-[#DE5C2B] text-xs tracking-wider">
                        UPI
                      </span>
                    </div>
                    <span className="font-outfit font-black text-sm">
                      Pay with Razorpay
                    </span>
                  </div>

                  {/* Card Brands Icons */}
                  <div className="flex items-center gap-1 opacity-90">
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-[#DE5C2B] text-white font-bold">AMEX</span>
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-orange-600 text-white font-bold">MC</span>
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-blue-700 text-white font-bold">VISA</span>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-400 mt-2">
                  UPI, cards, netbanking & international cards
                </p>
              </div>
            </div>

            {/* Support & Legal Links (Image 4) */}
            <div className="space-y-2 pt-2 text-center text-xs text-slate-500">
              <p>
                Facing Issues? email <a href="mailto:support@unicoach.in" className="font-bold text-slate-800 underline">support@unicoach.in</a>
              </p>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                By clicking Confirm and Pay, I agree to the <span className="underline cursor-pointer">Terms & Refund Policies</span>
              </p>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payments are powered by UniCoach UniCoach and are 100% secure and encrypted</span>
              </div>
            </div>

          </div>

          {/* Sticky Bottom Payment Action Bar */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-100 shadow-lg sticky bottom-0 z-20">
            <button
              type="button"
              onClick={handleCompletePayment}
              disabled={isProcessingPayment || isConfirming || isDirectPurchasing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#DE5C2B] via-orange-600 to-[#C04A1D] hover:from-[#C04A1D] hover:to-[#A73D14] hover:via-[#B8431A] text-white font-black text-sm shadow-xl shadow-[#DE5C2B]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isProcessingPayment || isConfirming || isDirectPurchasing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Razorpay Escrow...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{currentPrice.toLocaleString('en-IN')} with Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default CheckoutModal;
