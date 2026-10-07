import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLead } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { countries as phoneCountries } from '../utils/countries';
import { API_BASE_URL } from '../config';

const countries = [
  { name: 'USA', flag: 'https://flagcdn.com/w40/us.png' },
  { name: 'UK', flag: 'https://flagcdn.com/w40/gb.png' },
  { name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png' },
  { name: 'Ireland', flag: 'https://flagcdn.com/w40/ie.png' },
  { name: 'Australia', flag: 'https://flagcdn.com/w40/au.png' },
  { name: 'Germany', flag: 'https://flagcdn.com/w40/de.png' },
  { name: 'France', flag: 'https://flagcdn.com/w40/fr.png' },
  { name: 'New Zealand', flag: 'https://flagcdn.com/w40/nz.png' },
  { name: 'Italy', flag: 'https://flagcdn.com/w40/it.png' },
  { name: 'Dubai/UAE', flag: 'https://flagcdn.com/w40/ae.png' },
  { name: 'Singapore', flag: 'https://flagcdn.com/w40/sg.png' },
  { name: 'Other', flag: '🌍' },
];

const otherCountries = phoneCountries
  .filter(c => !['United States', 'United Kingdom', 'Canada', 'Ireland', 'Australia', 'Germany', 'France', 'New Zealand', 'Italy', 'United Arab Emirates', 'Singapore'].includes(c.name))
  .map(c => ({
    name: c.name,
    code: c.iso ? c.iso.toLowerCase() : 'us',
    flag: c.flag
  }));

const intakes = [
  { label: 'Sep 2026', recommended: true },
  { label: 'Jan 2027', recommended: false },
  { label: 'Sep 2027', recommended: false },
  { label: '2028 or later', recommended: false },
];

const educationLevels = ['10th', '12th', "Bachelor's", "Master's", 'MBBS / MD', 'Diploma'];


const cities = [
  'Bengaluru, Karnataka', 'Chennai, Tamil Nadu', 'Delhi, Delhi',
  'Hyderabad, Telangana', 'Kolkata, West Bengal', 'Ludhiana, Punjab',
  'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh', 'Chandigarh, Punjab',
  'Kochi, Kerala', 'Indore, Madhya Pradesh', 'Nagpur, Maharashtra',
  'Bhopal, Madhya Pradesh', 'Patna, Bihar', 'Coimbatore, Tamil Nadu',
  'Visakhapatnam, Andhra Pradesh', 'Noida, Uttar Pradesh',
];

// Normalize a typed phone number to E.164 using the selected dial code (strip spaces/non-digits,
// drop a leading trunk zero, fix the common "+910..." typo)
const normalizePhoneInput = (rawPhone, dialCode) => {
  let phoneClean = String(rawPhone || '').replace(/[^\d+]/g, '');
  if (!phoneClean.startsWith('+')) {
    if (phoneClean.startsWith('0')) {
      phoneClean = phoneClean.slice(1);
    }
    phoneClean = `${dialCode}${phoneClean}`;
  } else if (phoneClean.startsWith('+910')) {
    phoneClean = '+91' + phoneClean.slice(4);
  }
  return phoneClean;
};

const EligibilityModal = () => {
  const { user } = useAuth();
  const { isModalOpen, closeModal, submitLead, modalSource, verifiedLead } = useLead();
  const isAlreadyLoggedIn = Boolean(user || verifiedLead || (typeof window !== 'undefined' && localStorage.getItem('user_info')));
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  // Logged-in one-click booking: only asks for contact details the profile is missing
  const [confirmPhone, setConfirmPhone] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    dreamCountry: '', preferredIntake: '', highestEducation: '',
    currentCity: '', name: '', email: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [isOtherDropdownOpen, setIsOtherDropdownOpen] = useState(false);
  const [otherCountrySearch, setOtherCountrySearch] = useState('');
  const otherDropdownRef = useRef(null);

  // Phone country selection state
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState(phoneCountries[0]);
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const phoneDropdownRef = useRef(null);

  useEffect(() => {
    if (isModalOpen) {
      setBookingConfirmed(false);
      setConfirmError('');
      setIsOtherDropdownOpen(false);
      setIsPhoneDropdownOpen(false);
      setSelectedPhoneCountry(phoneCountries[0]);
      if (!formData.currentCity) {
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            if (data && data.city) {
              const cityVal = data.region ? `${data.city}, ${data.region}` : data.city;
              setFormData(prev => ({ ...prev, currentCity: cityVal }));
              setCitySearch(cityVal);
            }
          })
          .catch(err => console.error('Location fetch failed:', err));
      }
    }
  }, [isModalOpen]);

  // Click outside to close custom country dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (otherDropdownRef.current && !otherDropdownRef.current.contains(event.target)) {
        setIsOtherDropdownOpen(false);
      }
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) {
        setIsPhoneDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock background body scroll when modal is active
  useEffect(() => {
    if (isModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  if (isAlreadyLoggedIn) {
    const studentName = user?.name || verifiedLead?.name || 'Student';
    const knownEmail = user?.email || verifiedLead?.email || '';
    const knownPhone = user?.phone || verifiedLead?.phone || '';
    const contactInfo = knownEmail || knownPhone || confirmPhone || 'your registered contact';

    // Book straight into the CRM (no OTP anywhere; the student is already signed in).
    // /leads/book-consultation requires name, email and phone, so ask only for what's missing
    // and show "Confirmed" only after the backend accepted the booking.
    const handleConfirmCounselling = async () => {
      setConfirmError('');
      const email = (knownEmail || confirmEmail).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setConfirmError('Please enter a valid email address');
        return;
      }
      const phone = knownPhone || normalizePhoneInput(confirmPhone, selectedPhoneCountry.code);
      if (phone.replace(/\D/g, '').length < 10) {
        setConfirmError('Please enter a valid phone number so our advisor can call you');
        return;
      }

      setConfirmLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/leads/book-consultation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: studentName,
            email,
            phone,
            destination: user?.dreamCountry || verifiedLead?.dreamCountry || 'Undecided',
            intake: user?.preferredIntake || verifiedLead?.preferredIntake || undefined,
            query: `One-click counselling request (${modalSource || 'website'})`,
            source: 'Logged In One-Click Counselling',
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setConfirmError(data.error || data.message || 'We could not book your call. Please try again.');
          return;
        }
        setBookingConfirmed(true);
      } catch {
        setConfirmError('Network error. Please check your connection and try again.');
      } finally {
        setConfirmLoading(false);
      }
    };

    return typeof document !== 'undefined' ? createPortal(
      <AnimatePresence>
        <div data-lenis-prevent className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md">
          <motion.div 
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl space-y-6 text-center border border-slate-100 relative"
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-3xl font-black">
              {bookingConfirmed ? '🎉' : '🎯'}
            </div>
            
            {bookingConfirmed ? (
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Counselling Session Confirmed!</h3>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  Thank you, <strong className="text-indigo-600">{studentName}</strong>! Our senior international education advisor will connect with you at <span className="font-bold text-slate-800">{contactInfo}</span> shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Welcome Back, {studentName}!</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Your profile is active. You can book an instant 1-on-1 expert counselling call or manage your shortlist from your Dashboard.
                </p>
              </div>
            )}

            {!bookingConfirmed && (!knownEmail || !knownPhone) && (
              <div className="space-y-2.5 text-left">
                {!knownEmail && (
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => { setConfirmEmail(e.target.value); setConfirmError(''); }}
                    placeholder="Your email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-800 focus:border-[#4f46e5] outline-none transition-all"
                  />
                )}
                {!knownPhone && (
                  <div>
                    <input
                      type="tel"
                      value={confirmPhone}
                      onChange={(e) => { setConfirmPhone(e.target.value.replace(/[^\d+\s-]/g, '')); setConfirmError(''); }}
                      placeholder={`Phone number (${selectedPhoneCountry.code} assumed)`}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-800 focus:border-[#4f46e5] outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      Our advisor will call you on this number. Add your country code if you're outside India.
                    </p>
                  </div>
                )}
              </div>
            )}

            {confirmError && (
              <p className="text-red-500 text-xs font-semibold bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 text-left">{confirmError}</p>
            )}

            <div className="flex flex-col gap-3 pt-2">
              {!bookingConfirmed && (
                <button
                  onClick={handleConfirmCounselling}
                  disabled={confirmLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:from-[#C04A1D] hover:to-[#A73D14] text-white rounded-2xl font-black text-xs md:text-sm shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {confirmLoading ? 'Booking your call...' : '📅 Confirm Free Counselling Call'}
                </button>
              )}
              <button
                onClick={() => {
                  closeModal();
                  window.location.href = '/dashboard';
                }}
                className={`w-full py-3.5 ${bookingConfirmed ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} rounded-2xl font-bold text-xs md:text-sm cursor-pointer transition-all`}
              >
                Go to My Dashboard 🎯
              </button>
              <button
                onClick={closeModal}
                className="w-full py-2.5 border border-slate-200 text-slate-500 rounded-2xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>,
      document.body
    ) : null;
  }

  const filteredCities = cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!formData.dreamCountry) { setError('Please select a country'); return; }
      if (!formData.preferredIntake) { setError('Please select an intake'); return; }
    }
    if (step === 2) {
      if (!formData.highestEducation) { setError('Please select education level'); return; }
      if (!formData.currentCity) { setError('Please select your city'); return; }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError('');
    if (!formData.name) { setError('Please enter your name'); return; }
    if (!formData.email) { setError('Please enter your email'); return; }
    if (!formData.phone) { setError('Please enter your phone number'); return; }
    
    // Normalize phone number (strip spaces/non-digits, remove leading zero, ensure E.164 country code)
    const phoneClean = normalizePhoneInput(formData.phone, selectedPhoneCountry.code);

    if (phoneClean.replace(/\D/g, '').length < 10) { 
      setError('Please enter a valid phone number'); 
      return; 
    }

    setLoading(true);
    const result = await submitLead({ ...formData, phone: phoneClean });
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    } else {
      // Reset for next time
      setStep(1);
      setFormData({ dreamCountry: '', preferredIntake: '', highestEducation: '', currentCity: '', name: '', email: '', phone: '' });
    }
  };


  const stepTitles = [
    'Start your study abroad journey',
    'Are you ready for your study abroad journey?',
    'Just one last step!',
  ];

  const progressWidth = `${(step / 3) * 100}%`;

  const modalContent = (
    <div 
      data-lenis-prevent
      className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] bg-slate-950/75 backdrop-blur-md cursor-pointer" onClick={closeModal} />

      {/* Modal */}
      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-[850px] max-h-[92vh] flex flex-col md:flex-row overflow-hidden mx-auto overscroll-contain z-10"
      >
        {/* Close */}
        <button 
          onClick={closeModal} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 z-30 cursor-pointer text-lg font-bold transition-colors"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Left Panel */}
        <div className="md:w-[38%] bg-gray-50 p-5 sm:p-6 md:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100 flex-shrink-0">
          {/* Progress */}
          <div className="flex gap-2 mb-3 sm:mb-6 md:mb-8 pr-8 md:pr-0">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#1a1a2e]' : 'bg-gray-200'}`} />
            ))}
          </div>
          {step > 1 && (
            <button onClick={handleBack} className="mb-2 sm:mb-4 text-gray-500 hover:text-gray-800 text-xs sm:text-sm flex items-center gap-1 cursor-pointer font-semibold">
              ← Back
            </button>
          )}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1a1a2e] leading-tight">
            {stepTitles[step - 1]}
          </h2>
        </div>

        {/* Right Panel */}
        <div 
          data-lenis-prevent
          className="md:w-[62%] flex flex-col flex-1 min-h-0 overflow-hidden bg-white"
        >
          {/* Scrollable Form Content */}
          <div 
            data-lenis-prevent
            className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 overscroll-contain space-y-6"
          >
            <AnimatePresence mode="wait">
              {/* STEP 1: Country + Intake */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Choose your dream country</p>
                    <div className="grid grid-cols-3 gap-2">
                      {countries.map(c => {
                        const isOtherSelected = c.name === 'Other' && formData.dreamCountry !== '' && !countries.filter(x => x.name !== 'Other').some(country => country.name === formData.dreamCountry);
                        const isSelected = formData.dreamCountry === c.name || isOtherSelected;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, dreamCountry: c.name === 'Other' ? '' : c.name })}
                            className={`flex items-center gap-2.5 px-3.5 py-3.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#4f46e5] bg-indigo-50/50 text-[#4f46e5]'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <span className="w-5 h-3.5 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-sm select-none">
                              {c.flag.startsWith('http') ? (
                                <img src={c.flag} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm leading-none">{c.flag}</span>
                              )}
                            </span>
                            <span>{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Other Country Dropdown selector */}
                  {((formData.dreamCountry === '' || !countries.map(c => c.name).includes(formData.dreamCountry))) && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-1 relative" ref={otherDropdownRef}>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Please specify country</p>
                      
                      {/* Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setIsOtherDropdownOpen(!isOtherDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-750 font-bold text-sm outline-none focus:border-[#4f46e5] cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {formData.dreamCountry ? (
                            <>
                              <img
                                src={`https://flagcdn.com/w40/${otherCountries.find(oc => oc.name === formData.dreamCountry)?.code || 'us'}.png`}
                                alt={formData.dreamCountry}
                                className="w-5 h-3.5 object-cover rounded-sm border border-slate-100 flex-shrink-0"
                              />
                              <span>{formData.dreamCountry}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 font-medium">Select dream country...</span>
                          )}
                        </div>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOtherDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown Options Panel */}
                      {isOtherDropdownOpen && (
                        <div 
                          data-lenis-prevent
                          onWheel={(e) => e.stopPropagation()}
                          className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl py-2 max-h-60 overflow-y-auto z-20 animate-in fade-in slide-in-from-top-1.5 duration-100 scrollbar-thin overscroll-contain"
                        >
                          {/* Sticky search input for 160+ countries */}
                          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <input
                              type="text"
                              value={otherCountrySearch}
                              onChange={(e) => setOtherCountrySearch(e.target.value)}
                              placeholder="Search 160+ countries..."
                              className="w-full px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#4f46e5] focus:bg-white transition-all"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {otherCountries
                            .filter(oc => !otherCountrySearch.trim() || oc.name.toLowerCase().includes(otherCountrySearch.toLowerCase().trim()))
                            .map((oc) => (
                            <button
                              key={oc.name}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, dreamCountry: oc.name });
                                setIsOtherDropdownOpen(false);
                                setOtherCountrySearch('');
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-slate-50 transition-colors cursor-pointer ${
                                formData.dreamCountry === oc.name ? 'bg-indigo-50/50 text-[#4f46e5]' : ''
                              }`}
                            >
                              <img
                                src={`https://flagcdn.com/w40/${oc.code}.png`}
                                alt={oc.name}
                                className="w-5 h-3.5 object-cover rounded-sm border border-slate-200 flex-shrink-0"
                              />
                              <span className="flex-1">{oc.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {formData.dreamCountry && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="text-sm font-medium text-gray-700 mb-3">What's your preferred intake?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {intakes.map(i => (
                          <button
                            key={i.label}
                            type="button"
                            onClick={() => setFormData({ ...formData, preferredIntake: i.label })}
                            className={`relative px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                              formData.preferredIntake === i.label
                                ? 'border-[#4f46e5] bg-indigo-50 text-[#4f46e5]'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            {i.label}
                            {i.recommended && (
                              <span className="block text-xs text-emerald-500 font-medium mt-0.5">Recommended</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: Education + City */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">What's the highest education you've completed (or are currently pursuing)?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {educationLevels.map(e => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setFormData({ ...formData, highestEducation: e })}
                          className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                            formData.highestEducation === e
                              ? 'border-[#4f46e5] bg-indigo-50 text-[#4f46e5]'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <p className="text-sm font-medium text-gray-700 mb-3">Select your current city</p>
                    <div className="relative">
                      <input
                        type="text"
                        value={citySearch !== '' ? citySearch : formData.currentCity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCitySearch(val);
                          setFormData({ ...formData, currentCity: val });
                          setShowCityDropdown(true);
                        }}
                        onFocus={() => setShowCityDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                        placeholder="Eg. Delhi"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-[#4f46e5] outline-none transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                    </div>
                    {showCityDropdown && filteredCities.length > 0 && (
                      <div 
                        data-lenis-prevent
                        onWheel={(e) => e.stopPropagation()}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-20 overscroll-contain"
                      >
                        {filteredCities.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => { setFormData({ ...formData, currentCity: c }); setCitySearch(c); setShowCityDropdown(false); }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-[#4f46e5] transition-colors cursor-pointer"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Name, Email, Phone */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Your name</p>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-[#4f46e5] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Your email</p>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-[#4f46e5] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Your Phone</p>
                    <div className="flex gap-2 w-full relative" ref={phoneDropdownRef}>
                      {/* Custom Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setIsPhoneDropdownOpen(!isPhoneDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-3 border-2 border-gray-200 rounded-xl bg-gray-50/50 text-gray-850 font-medium text-sm outline-none focus:border-[#4f46e5] min-w-[110px] justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <img
                            src={`https://flagcdn.com/w40/${selectedPhoneCountry.iso.toLowerCase()}.png`}
                            alt={selectedPhoneCountry.name}
                            className="w-5 h-3.5 object-cover rounded-sm border border-gray-200 flex-shrink-0"
                          />
                          <span>{selectedPhoneCountry.code}</span>
                        </div>
                        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isPhoneDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Custom Options Panel */}
                      {isPhoneDropdownOpen && (
                        <div 
                          data-lenis-prevent
                          onWheel={(e) => e.stopPropagation()}
                          className="absolute top-full left-0 mt-1.5 w-[250px] bg-white border border-gray-200 rounded-xl shadow-xl py-2 max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-1.5 duration-100 scrollbar-thin overscroll-contain"
                        >
                          {phoneCountries.map((c) => (
                            <button
                              key={`${c.iso}-${c.code}`}
                              type="button"
                              onClick={() => {
                                setSelectedPhoneCountry(c);
                                setIsPhoneDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer ${
                                selectedPhoneCountry.iso === c.iso ? 'bg-indigo-50/50 text-[#4f46e5]' : ''
                              }`}
                            >
                              <img
                                src={`https://flagcdn.com/w40/${c.iso.toLowerCase()}.png`}
                                alt={c.name}
                                className="w-5 h-3.5 object-cover rounded-sm border border-gray-200 flex-shrink-0"
                              />
                              <span className="flex-1">{c.name}</span>
                              <span className="text-gray-400">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.startsWith('0')) {
                            val = val.slice(1);
                          }
                          setFormData({ ...formData, phone: val });
                        }}
                        placeholder="Phone Number"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-[#4f46e5] outline-none transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <p className="mt-4 text-red-500 text-xs sm:text-sm bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 font-semibold">{error}</p>
            )}
          </div>

          {/* Sticky Bottom Action Button Footer */}
          <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex-shrink-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 sm:py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl transition-all cursor-pointer text-sm sm:text-base shadow-sm hover:shadow-md"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 sm:py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-xl transition-all cursor-pointer text-sm sm:text-base disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default EligibilityModal;
