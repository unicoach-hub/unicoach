import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submitMentorApplication, uploadMentorVerificationDoc } from '../api/unicoachApi';
import { PillButton } from '../../components/ui/PillButton';
import CountrySelect from '../../components/ui/CountrySelect';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  GraduationCap, 
  Globe, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  AtSign,
  ExternalLink,
  Link2,
  Lock,
  ArrowRight,
  Check,
  X,
  FileCheck,
  Video,
  MessageSquare,
  IndianRupee,
  Clock,
  Copy,
  Landmark,
  CreditCard,
  Wallet
} from 'lucide-react';

const LinkedinIcon = ({ className = "w-4 h-4 text-[#DE5C2B]" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

// Indian states & union territories (full names) for the payout address
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const UnicoachApplyPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    handle: '',
    country: '',
    university: '',
    course: '',
    graduationYear: '2025',
    linkedinUrl: '',
    headline: '',
    bio: ''
  });

  // ─── Payout & Bank details state (Mandatory — used to open the mentor's Razorpay Route payout account) ───
  const [payoutForm, setPayoutForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    pan: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });

  // ─── Field-level validation errors ───
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validators = {
    name: (v) => {
      if (!v.trim()) return 'Full name is required';
      if (v.trim().length < 3) return 'Name must be at least 3 characters';
      if (!/^[a-zA-Z\s.'-]+$/.test(v.trim())) return 'Name can only contain letters, spaces, dots, hyphens';
      return '';
    },
    email: (v) => {
      if (!v.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address (e.g. you@gmail.com)';
      return '';
    },
    phone: (v) => {
      if (!v.trim()) return 'Phone number is required (needed to set up your payout account)';
      const digits = v.replace(/[\s\-\+\(\)]/g, '');
      if (digits.length < 10) return 'Phone number must be at least 10 digits';
      if (!/^[\d\+\-\s\(\)]+$/.test(v)) return 'Phone can only contain digits, +, -, spaces';
      return '';
    },
    handle: (v) => {
      if (!v.trim()) return 'Handle is required';
      const clean = v.replace(/^@/, '').trim();
      if (clean.length < 3) return 'Handle must be at least 3 characters';
      if (clean.length > 30) return 'Handle cannot exceed 30 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(clean)) return 'Handle can only contain letters, numbers, and underscores';
      if (/^\d/.test(clean)) return 'Handle cannot start with a number';
      return '';
    },
    country: (v) => {
      if (!v || !v.trim()) return 'Please select your destination country';
      return '';
    },
    university: (v) => {
      if (!v.trim()) return 'University name is required';
      if (v.trim().length < 3) return 'Enter the full university name (min 3 characters)';
      return '';
    },
    course: (v) => {
      if (!v.trim()) return ''; // optional but validate if filled
      if (v.trim().length < 2) return 'Course name too short';
      return '';
    },
    graduationYear: (v) => {
      const year = parseInt(v, 10);
      if (!v || isNaN(year)) return 'Enter a valid year';
      if (year < 2015 || year > 2032) return 'Year must be between 2015 and 2032';
      return '';
    },
    linkedinUrl: (v) => {
      if (!v.trim()) return ''; // optional
      if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?$/.test(v.trim())) {
        return 'Enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname)';
      }
      return '';
    }
  };

  const validateField = (field, value) => {
    if (validators[field]) {
      const err = validators[field](value);
      setFieldErrors(prev => ({ ...prev, [field]: err }));
      return err;
    }
    return '';
  };

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Validate on change only if the field was already touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  // Verification proof state (separated into local uploaded file vs cloud link)
  const [uploadedDocUrl, setUploadedDocUrl] = useState('');
  const [externalDocLink, setExternalDocLink] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docFileName, setDocFileName] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Services & Offerings Configuration State (UniCoach-style onboarding)
  const [servicesConfig, setServicesConfig] = useState([
    {
      id: 'one_on_one',
      type: 'ONE_ON_ONE',
      title: '30-Min 1:1 Video Consultation Call',
      description: 'Discuss university shortlisting, application strategy, profile evaluation, documents checklist, and visa process directly over a 1-on-1 video call.',
      durationMinutes: 30,
      priceInINR: 499,
      enabled: true,
      priceOptions: [299, 499, 799, 999, 1499]
    },
    {
      id: 'sop_review',
      type: 'SOP_REVIEW',
      title: 'Statement of Purpose (SOP) & Resume Review',
      description: 'Comprehensive line-by-line review, grammar check, structural improvements, and admission-winning suggestions delivered within 48 hours.',
      durationMinutes: 30,
      maxDeliveryHours: 48,
      priceInINR: 899,
      enabled: true,
      priceOptions: [499, 899, 1299, 1999]
    },
    {
      id: 'priority_dm',
      type: 'PRIORITY_DM',
      title: 'Priority DM / Direct Chat Mentorship',
      description: 'Direct 1-on-1 Q&A for urgent queries on accommodation, blocked account, part-time jobs, and life abroad with guaranteed response in 24h.',
      durationMinutes: 15,
      maxDeliveryHours: 24,
      priceInINR: 199,
      enabled: true,
      priceOptions: [99, 199, 299, 499]
    }
  ]);

  const toggleService = (id) => {
    setServicesConfig(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const updateServicePrice = (id, price) => {
    setServicesConfig(prev => prev.map(s => s.id === id ? { ...s, priceInINR: price } : s));
  };

  const updateServiceField = (id, field, value) => {
    setServicesConfig(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submittedMentor, setSubmittedMentor] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocFile(file);
    setDocFileName(file.name);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingDoc(true);
    try {
      const res = await uploadMentorVerificationDoc(formData);
      setUploadedDocUrl(res.fileUrl);
    } catch (err) {
      console.error('File upload failed:', err);
      setUploadError(err.message || 'File upload failed. You can also paste a Google Drive link below.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleRemoveUploadedDoc = () => {
    setUploadedDocUrl('');
    setDocFileName('');
    setDocFile(null);
    setUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    // Run all validators and mark all fields as touched
    const requiredFields = ['name', 'email', 'phone', 'handle', 'country', 'university'];
    const allFields = ['name', 'email', 'phone', 'handle', 'country', 'university', 'course', 'graduationYear', 'linkedinUrl'];
    
    const newTouched = {};
    const newErrors = {};
    let hasError = false;

    allFields.forEach(field => {
      newTouched[field] = true;
      if (validators[field]) {
        const err = validators[field](form[field]);
        newErrors[field] = err;
        if (err && (requiredFields.includes(field) || form[field].trim())) {
          hasError = true;
        }
      }
    });

    setTouched(newTouched);
    setFieldErrors(newErrors);

    if (hasError) {
      // Find the first error and show it
      const firstError = allFields.find(f => newErrors[f]);
      setFeedback({ type: 'error', text: newErrors[firstError] });
      // Scroll to the first error field
      const el = document.querySelector(`[data-field="${firstError}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Validate Bank / Payout details (mirrors backend rules for Razorpay Route linked accounts)
    const accountNumber = payoutForm.accountNumber.trim();
    const ifscCode = payoutForm.ifscCode.trim().toUpperCase();
    const pan = payoutForm.pan.trim().toUpperCase();
    const postalCode = payoutForm.postalCode.trim();
    const payoutChecks = [
      ['accountHolderName', !payoutForm.accountHolderName.trim(), 'Bank Account Holder Name is required to receive session earnings.'],
      ['accountNumber', !accountNumber, 'Bank Account Number is required.'],
      ['accountNumber', !/^\d{9,18}$/.test(accountNumber), 'Bank Account Number must be 9 to 18 digits.'],
      ['confirmAccountNumber', accountNumber !== payoutForm.confirmAccountNumber.trim(), 'Bank Account Numbers do not match. Please verify.'],
      ['ifscCode', !ifscCode, 'Bank IFSC Code is required.'],
      ['ifscCode', !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode), 'Invalid IFSC Code format (e.g. HDFC0001234 or SBIN0004567).'],
      ['pan', !pan, 'PAN is required by Razorpay to open your payout account.'],
      ['pan', !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan), 'Invalid PAN format (e.g. ABCDE1234F).'],
      ['addressLine1', !payoutForm.addressLine1.trim(), 'Address line 1 is required.'],
      ['city', !payoutForm.city.trim(), 'City is required.'],
      ['state', !payoutForm.state.trim(), 'Please select your state / union territory.'],
      ['postalCode', !/^[1-9][0-9]{5}$/.test(postalCode), 'Enter a valid 6-digit PIN code (e.g. 110001).']
    ];
    const failedPayoutCheck = payoutChecks.find(([, failed]) => failed);
    if (failedPayoutCheck) {
      const [field, , message] = failedPayoutCheck;
      setFeedback({ type: 'error', text: message });
      const el = document.querySelector(`[data-field="${field}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const finalDocUrl = uploadedDocUrl || externalDocLink.trim();

    if (!finalDocUrl && !form.linkedinUrl.trim()) {
      setFeedback({ 
        type: 'error', 
        text: 'Please upload a Student ID / Offer letter proof OR provide your LinkedIn profile URL so admin can verify your credentials.' 
      });
      return;
    }

    // Filter enabled services
    const initialServices = servicesConfig
      .filter(s => s.enabled)
      .map(s => ({
        type: s.type,
        title: s.title.trim(),
        description: s.description.trim(),
        durationMinutes: s.durationMinutes,
        maxDeliveryHours: s.maxDeliveryHours || 48,
        priceInINR: Number(s.priceInINR) || 499
      }));

    if (initialServices.length === 0) {
      setFeedback({ type: 'error', text: 'Please enable at least one service offering (e.g. 1:1 Consultation Call).' });
      return;
    }

    setLoading(true);
    try {
      const res = await submitMentorApplication({
        ...form,
        // Mentor's own time zone, so their slots are created in their local time (changeable later in the dashboard)
        ianaTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        phone: form.phone.trim(),
        payoutMethod: 'BANK_TRANSFER',
        accountHolderName: payoutForm.accountHolderName.trim(),
        accountNumber,
        ifscCode,
        bankName: payoutForm.bankName.trim(),
        pan,
        addressLine1: payoutForm.addressLine1.trim(),
        addressLine2: payoutForm.addressLine2.trim(),
        city: payoutForm.city.trim(),
        state: payoutForm.state,
        postalCode,
        initialServices,
        verificationDocUrl: finalDocUrl,
        handle: form.handle.toLowerCase().replace(/^@/, '').trim()
      });
      const registeredHandle = (res.mentor?.handle || form.handle).toLowerCase().replace(/^@/, '').trim();
      try {
        localStorage.setItem('unicoach_mentor_handle', registeredHandle);
      } catch (e) {}
      setSubmittedMentor({
        ...(res.mentor || { handle: registeredHandle, name: form.name }),
        configuredServices: initialServices
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to submit application. Please check your inputs.' });
    } finally {
      setLoading(false);
    }
  };


  // If application is successfully submitted
  if (submittedMentor) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 py-20 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[450px] bg-radial from-[#DBEAFE]/70 via-[#E0E7FF]/40 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/90 p-8 sm:p-12 max-w-xl w-full text-center shadow-[0_20px_50px_-10px_rgba(15,23,42,0.1)] relative z-10">
          <div className="w-18 h-18 rounded-3xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center mx-auto mb-5 font-bold text-3xl shadow-inner border border-orange-100">
            🎉
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 text-[#DE5C2B] text-xs font-bold mb-4 border border-orange-100 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#DE5C2B]" />
            <span>Application Submitted for Review</span>
          </div>

          <h2 className="font-outfit text-2xl sm:text-3xl font-black text-[#0F172A] mb-3">
            Welcome aboard, {submittedMentor.name}!
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
            Your application for handle <strong className="text-[#DE5C2B] font-bold">@{submittedMentor.handle}</strong> has been transmitted to the UniCoach verification team.
          </p>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                ✓
              </div>
              <span className="text-slate-700"><strong>Document Verification:</strong> Our team checks your university credentials within 24–48 hours.</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-orange-100 text-[#DE5C2B] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                ✓
              </div>
              <span className="text-slate-700"><strong>Blue Tick Activated:</strong> Once approved, your profile receives the official Blue Tick verified badge.</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                ✓
              </div>
              <span className="text-slate-700"><strong>Featured on Marketplace:</strong> You will appear on the public directory for students worldwide to book 1:1 calls.</span>
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-4 mb-6 text-left">
            <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block mb-1.5">
              YOUR SHAREABLE MENTOR LINK
            </span>
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-orange-200/90 shadow-2xs">
              <span className="text-xs font-mono font-bold text-slate-800 flex-1 truncate px-2">
                {window.location.origin}/@{submittedMentor.handle}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/@${submittedMentor.handle}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-[#DE5C2B] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5">
            <a
              href={`${window.location.origin}/@${submittedMentor.handle}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all text-center border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <Link
              to={`/unicoach/dashboard/${submittedMentor.handle}`}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D] text-white font-bold text-xs shadow-md shadow-[#DE5C2B]/25 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Open Creator Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-28 pb-24 px-4 sm:px-6 lg:px-10 relative selection:bg-[#DE5C2B]/20">
      
      {/* Background watercolor blooms */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[10%] w-[600px] h-[480px] bg-radial from-[#DBEAFE]/70 via-[#E0E7FF]/40 to-transparent rounded-full blur-[90px]" />
        <div className="absolute top-[20%] right-[8%] w-[500px] h-[400px] bg-radial from-[#C7D2FE]/40 via-[#E0F2FE]/25 to-transparent rounded-full blur-[80px]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Back Link */}
        <Link
          to="/unicoach"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#DE5C2B] transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Verified Mentors Directory</span>
        </Link>

        {/* Header Title Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/90 p-8 sm:p-10 mb-8 shadow-[0_10px_35px_-8px_rgba(15,23,42,0.05)]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-[#DE5C2B] text-xs font-bold mb-4 border border-orange-100 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#DE5C2B]" />
            <span>Admin-Verified Senior Network</span>
          </div>

          <h1 className="font-outfit text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] mb-3 leading-tight">
            Apply to Become a Verified UniCoach Mentor
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            UniCoach exclusively features verified international students and admitted alumni. Submit your foreign university proof or LinkedIn profile below. Upon admin verification, you'll receive the official <strong>Blue Tick badge</strong> and your creator profile will be published on the global marketplace.
          </p>
        </div>

        {/* ── Step-by-Step Onboarding Roadmap ── */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/90 p-5 sm:p-7 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Mentor Onboarding & Verification Stages
            </span>
            <span className="text-[11px] font-bold text-[#DE5C2B] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
              Quality Escrow Gate
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-200/80">
              <span className="text-[10px] font-black uppercase text-[#DE5C2B] block mb-1">Stage 1</span>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#DE5C2B]" /> Profile & Proof
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">University details, student ID doc & LinkedIn URL</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-200/80">
              <span className="text-[10px] font-black uppercase text-[#DE5C2B] block mb-1">Stage 2</span>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-[#DE5C2B]" /> Bank & Payout
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Bank account, PAN & address for automatic payouts</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-200/80">
              <span className="text-[10px] font-black uppercase text-[#DE5C2B] block mb-1">Stage 3</span>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#DE5C2B]" /> Services & Prices
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">1:1 Call, SOP review and chat mentoring pricing</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
              <span className="text-[10px] font-black uppercase text-emerald-700 block mb-1">Stage 4</span>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Admin Audit
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">Doc verification $\rightarrow$ Blue Tick & live public storefront</p>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{feedback.text}</span>
            </div>
          </div>
        )}

        {/* Application Form with noValidate to stop browser URL popups */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          
          {/* ── SECTION 1: Personal & Contact ── */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <h2 className="font-outfit text-base font-bold text-[#0F172A] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#DE5C2B]" />
              <span>1. Personal & Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div data-field="name">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-4 transition-all ${
                    touched.name && fieldErrors.name
                      ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 bg-rose-50/30'
                      : 'border-slate-200/90 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B]'
                  }`}
                  required
                />
                {touched.name && fieldErrors.name && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.name}
                  </p>
                )}
              </div>

              <div data-field="email">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. priya@tum.de or priya@gmail.com"
                  value={form.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-4 transition-all ${
                    touched.email && fieldErrors.email
                      ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 bg-rose-50/30'
                      : 'border-slate-200/90 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B]'
                  }`}
                  required
                />
                {touched.email && fieldErrors.email && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                  </p>
                )}
              </div>

              <div data-field="phone">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  WhatsApp / Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +49 152 1234567 or +91 9876543210"
                  value={form.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  onBlur={() => handleFieldBlur('phone')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-4 transition-all ${
                    touched.phone && fieldErrors.phone
                      ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 bg-rose-50/30'
                      : 'border-slate-200/90 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B]'
                  }`}
                  required
                />
                {touched.phone && fieldErrors.phone && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div data-field="handle">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Desired Handle <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    placeholder="priya_tum"
                    value={form.handle}
                    onChange={(e) => handleFieldChange('handle', e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''))}
                    onBlur={() => handleFieldBlur('handle')}
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-4 font-mono transition-all ${
                      touched.handle && fieldErrors.handle
                        ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 bg-rose-50/30'
                        : 'border-slate-200/90 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B]'
                    }`}
                    required
                  />
                </div>
                {touched.handle && fieldErrors.handle ? (
                  <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.handle}
                  </p>
                ) : (
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Public profile URL: {window.location.origin}/@{form.handle || 'yourhandle'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Academic Credibility & Destination ── */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <h2 className="font-outfit text-base font-bold text-[#0F172A] mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#DE5C2B]" />
              <span>2. Academic & Destination Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div data-field="country">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Destination Country <span className="text-rose-500">*</span>
                </label>
                <CountrySelect
                  value={form.country}
                  onChange={(val) => { handleFieldChange('country', val); setTouched(p => ({ ...p, country: true })); }}
                  placeholder="Select destination country…"
                  error={touched.country && fieldErrors.country ? fieldErrors.country : ''}
                  required
                />
              </div>

              <div data-field="university">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  University Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technical University of Munich, Oxford"
                  value={form.university}
                  onChange={(e) => handleFieldChange('university', e.target.value)}
                  onBlur={() => handleFieldBlur('university')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-4 transition-all ${
                    touched.university && fieldErrors.university
                      ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 bg-rose-50/30'
                      : 'border-slate-200/90 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B]'
                  }`}
                  required
                />
                {touched.university && fieldErrors.university && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.university}
                  </p>
                )}
              </div>

              <div data-field="course">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Course / Major
                </label>
                <input
                  type="text"
                  placeholder="e.g. M.S. in Computer Science, MBA"
                  value={form.course}
                  onChange={(e) => handleFieldChange('course', e.target.value)}
                  onBlur={() => handleFieldBlur('course')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-4 transition-all ${
                    touched.course && fieldErrors.course
                      ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 bg-rose-50/30'
                      : 'border-slate-200/90 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B]'
                  }`}
                />
                {touched.course && fieldErrors.course && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.course}
                  </p>
                )}
              </div>

              <div data-field="graduationYear">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Graduation Batch / Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024, 2025"
                  value={form.graduationYear}
                  onChange={(e) => handleFieldChange('graduationYear', e.target.value)}
                  onBlur={() => handleFieldBlur('graduationYear')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-4 transition-all ${
                    touched.graduationYear && fieldErrors.graduationYear
                      ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 bg-rose-50/30'
                      : 'border-slate-200/90 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B]'
                  }`}
                />
                {touched.graduationYear && fieldErrors.graduationYear && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.graduationYear}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Verification Proof & Credibility ── */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <h2 className="font-outfit text-base font-bold text-[#0F172A] mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3. Verification Proof (Required for Blue Tick)</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              To keep UniCoach 100% credible for students, attach your foreign student ID, admission letter, or provide your active LinkedIn profile.
            </p>

            <div className="space-y-4">
              
              {/* Document Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Upload Student ID / Offer Letter (Local File: PDF, JPG, PNG)
                </label>
                
                {/* If File is already uploaded, show attached badge */}
                {uploadedDocUrl ? (
                  <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">
                        <FileCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-950 truncate max-w-[280px] sm:max-w-md">
                          {docFileName || 'Verification Document Attached'}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          ✓ Successfully uploaded to secure server
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveUploadedDoc}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 flex-shrink-0 shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Change File</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-[#DE5C2B] rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800 mb-1">
                      Select student verification file from your computer
                    </p>
                    <p className="text-[10px] text-slate-400 mb-3">
                      Max size 10MB • PDF, JPG, PNG, DOCX supported
                    </p>
                    <input
                      type="file"
                      id="doc-file-upload"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="doc-file-upload"
                      className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      {isUploadingDoc ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#DE5C2B]" /> Uploading Document...</>
                      ) : (
                        <><Upload className="w-3.5 h-3.5 text-[#DE5C2B]" /> Choose File From Device</>
                      )}
                    </label>
                    {uploadError && (
                      <span className="text-[11px] text-rose-600 font-semibold block mt-2">
                        {uploadError}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Or Paste Public Link (Optional if local file uploaded) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Or Paste Document Link (Google Drive / Cloud Link)
                  {uploadedDocUrl && (
                    <span className="text-slate-400 font-normal ml-1.5">(Optional — file already attached above)</span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/... (optional if document uploaded above)"
                  value={externalDocLink}
                  onChange={(e) => setExternalDocLink(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] transition-all"
                />
              </div>

              {/* LinkedIn URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  LinkedIn Profile URL
                </label>
                <div className="relative" data-field="linkedinUrl">
                  <div className="absolute left-3.5 top-3">
                    <LinkedinIcon className="w-4 h-4 text-[#DE5C2B]" />
                  </div>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={form.linkedinUrl}
                    onChange={(e) => handleFieldChange('linkedinUrl', e.target.value)}
                    onBlur={() => handleFieldBlur('linkedinUrl')}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-4 transition-all ${
                      touched.linkedinUrl && fieldErrors.linkedinUrl
                        ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-400 bg-rose-50/30'
                        : 'border-slate-200/90 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B]'
                    }`}
                  />
                  {touched.linkedinUrl && fieldErrors.linkedinUrl && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.linkedinUrl}
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── SECTION 4: Bio & Headline ── */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <h2 className="font-outfit text-base font-bold text-[#0F172A] mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#DE5C2B]" />
              <span>4. Headline & Mentorship Bio</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Profile Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. MS CS @ TU Munich | DAAD Scholar | APS & Visa Specialist"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Short Bio / How can you help juniors?
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your experience (e.g. How you prepared your SOP, shortlisted universities, handled blocked account, or adapted to student life)..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 5: Bank Account & Payout Setup (Required to Receive Earnings) ── */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h2 className="font-outfit text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#DE5C2B]" />
                <span>5. Bank Account & Payout Setup (Mandatory)</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
                🔒 Automatic Razorpay Payouts
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2 font-normal leading-relaxed">
              Your earnings are sent automatically to this Indian bank account after each session via Razorpay. UniCoach charges <strong>0% commission</strong> — only Razorpay's payment fee (about 2% + GST) is deducted.
            </p>
            <p className="text-xs text-slate-500 mb-5 font-normal leading-relaxed flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>PAN & address are required by Razorpay to open your payout account. These details are kept private and never shown on your public profile.</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div data-field="accountHolderName" className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Account Holder Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="As listed on bank passbook / statement (e.g. Priya Sharma)"
                    value={payoutForm.accountHolderName}
                    onChange={(e) => setPayoutForm(p => ({ ...p, accountHolderName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] transition-all"
                    required
                  />
                </div>

                <div data-field="accountNumber">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Bank Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter 9 to 18 digit account number"
                    maxLength={18}
                    value={payoutForm.accountNumber}
                    onChange={(e) => setPayoutForm(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] font-mono transition-all"
                    required
                  />
                </div>

                <div data-field="confirmAccountNumber">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Re-enter bank account number"
                    maxLength={18}
                    value={payoutForm.confirmAccountNumber}
                    onChange={(e) => setPayoutForm(p => ({ ...p, confirmAccountNumber: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] font-mono transition-all"
                    required
                  />
                </div>

                <div data-field="ifscCode">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Bank IFSC Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001234 or SBIN0004567"
                    value={payoutForm.ifscCode}
                    onChange={(e) => setPayoutForm(p => ({ ...p, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] uppercase font-mono transition-all"
                    required
                  />
                </div>

                <div data-field="bankName">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Bank Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, State Bank of India, ICICI Bank"
                    value={payoutForm.bankName}
                    onChange={(e) => setPayoutForm(p => ({ ...p, bankName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] transition-all"
                  />
                </div>

                <div data-field="pan" className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    PAN (Permanent Account Number) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    autoComplete="off"
                    value={payoutForm.pan}
                    onChange={(e) => setPayoutForm(p => ({ ...p, pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] uppercase font-mono transition-all"
                    required
                  />
                </div>

                <div data-field="addressLine1" className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Address Line 1 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="House / flat no., street"
                    autoComplete="address-line1"
                    value={payoutForm.addressLine1}
                    onChange={(e) => setPayoutForm(p => ({ ...p, addressLine1: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] transition-all"
                    required
                  />
                </div>

                <div data-field="addressLine2" className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Area, landmark"
                    autoComplete="address-line2"
                    value={payoutForm.addressLine2}
                    onChange={(e) => setPayoutForm(p => ({ ...p, addressLine2: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] transition-all"
                  />
                </div>

                <div data-field="city">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, Bengaluru"
                    autoComplete="address-level2"
                    value={payoutForm.city}
                    onChange={(e) => setPayoutForm(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] transition-all"
                    required
                  />
                </div>

                <div data-field="state">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    State / Union Territory <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={payoutForm.state}
                    autoComplete="address-level1"
                    onChange={(e) => setPayoutForm(p => ({ ...p, state: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] transition-all cursor-pointer ${
                      payoutForm.state ? 'text-slate-900' : 'text-slate-400'
                    }`}
                    required
                  >
                    <option value="" disabled>Select state…</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s} className="text-slate-900">{s}</option>
                    ))}
                  </select>
                </div>

                <div data-field="postalCode">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 110001"
                    maxLength={6}
                    autoComplete="postal-code"
                    value={payoutForm.postalCode}
                    onChange={(e) => setPayoutForm(p => ({ ...p, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/90 text-sm focus:outline-none focus:ring-4 focus:ring-[#DE5C2B]/10 focus:border-[#DE5C2B] font-mono transition-all"
                    required
                  />
                </div>
              </div>
          </div>

          {/* ── SECTION 6: Services & Pricing Setup (What will you offer?) ── */}
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h2 className="font-outfit text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Video className="w-4 h-4 text-[#DE5C2B]" />
                <span>6. Services & Pricing Setup (What will you offer?)</span>
              </h2>
              <span className="text-[11px] font-bold text-[#DE5C2B] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full w-fit">
                ✓ 0% Platform Commission
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-normal">
              Customize what you charge in ₹ (INR) for each service. When students book through your public link, UniCoach takes 0% commission: you get the full price minus only Razorpay's payment fee (about 2% + GST), sent straight to your bank. You can edit prices or add more services anytime from your dashboard.
            </p>

            <div className="space-y-5">
              {servicesConfig.map((svc) => (
                <div
                  key={svc.id}
                  className={`rounded-2xl border transition-all p-5 ${
                    svc.enabled 
                      ? 'bg-orange-50/20 border-orange-200/90 shadow-2xs' 
                      : 'bg-slate-50/60 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs ${
                        svc.type === 'ONE_ON_ONE' ? 'bg-orange-100 text-[#DE5C2B]' :
                        svc.type === 'SOP_REVIEW' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {svc.type === 'ONE_ON_ONE' && <Video className="w-5 h-5" />}
                        {svc.type === 'SOP_REVIEW' && <FileText className="w-5 h-5" />}
                        {svc.type === 'PRIORITY_DM' && <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          {svc.type === 'ONE_ON_ONE' ? '1:1 Video Consultation' : svc.type === 'SOP_REVIEW' ? 'Async Document Review' : 'Priority DM / Direct Chat'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {svc.title}
                        </h3>
                      </div>
                    </div>

                    {/* Enable / Disable Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleService(svc.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        svc.enabled ? 'bg-[#DE5C2B]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          svc.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {svc.enabled && (
                    <div className="space-y-4 mt-3 pt-3.5 border-t border-slate-200/60">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Service Title
                        </label>
                        <input
                          type="text"
                          value={svc.title}
                          onChange={(e) => updateServiceField(svc.id, 'title', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B] bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Description & What you will cover
                        </label>
                        <textarea
                          rows={2}
                          value={svc.description}
                          onChange={(e) => updateServiceField(svc.id, 'description', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B] resize-none bg-white transition-all"
                        />
                      </div>

                      {/* Pricing Row */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-bold text-slate-800">
                            Service Price in ₹ (INR)
                          </label>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {svc.type === 'ONE_ON_ONE' ? 'per 30-min call' : svc.type === 'SOP_REVIEW' ? 'delivered in 48 hrs' : 'guaranteed reply in 24 hrs'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative w-36">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={svc.priceInINR}
                              onChange={(e) => updateServicePrice(svc.id, Math.max(0, Number(e.target.value)))}
                              className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B] bg-white"
                            />
                          </div>

                          {/* Quick Price Chips */}
                          <div className="flex items-center gap-1.5">
                            {svc.priceOptions.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => updateServicePrice(svc.id, opt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  svc.priceInINR === opt
                                    ? 'bg-[#DE5C2B] text-white shadow-2xs'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                ₹{opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isUploadingDoc}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#DE5C2B] via-orange-600 to-[#C04A1D] hover:from-[#C04A1D] hover:to-[#A73D14] hover:via-[#B8431A] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-[0_12px_30px_-6px_rgba(222,92,43,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Application for Verification...</>
            ) : (
              <><ShieldCheck className="w-5 h-5 text-white" /> Submit Application for Blue Tick Verification</>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default UnicoachApplyPage;
