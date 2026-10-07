import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import CountrySelect from './ui/CountrySelect';
import './PublicBookingPage.css';

const PublicBookingPage = () => {
  const slug = window.location.pathname.split('/book/')[1];

  const [eventData, setEventData] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1 = Date/Slot, 2 = Details

  const [selectedDate, setSelectedDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');

  // Form State
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNum, setPhoneNum] = useState('');
  const [dreamCountry, setDreamCountry] = useState('USA');
  const [preferredIntake, setPreferredIntake] = useState('Fall 2026');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Get Today's Date String YYYY-MM-DD
  const getTodayStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (!slug) return;
    const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
    fetch(`${apiUrl}/api/bookings/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setEventData(data);
        // Default select today or tomorrow
        setSelectedDate(getTodayStr());
      })
      .catch(() => setLoadError(true));
  }, [slug]);

  // Fetch taken slots when selected date changes
  useEffect(() => {
    if (!slug || !selectedDate) return;
    const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
    fetch(`${apiUrl}/api/bookings/${slug}/booked-slots?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => setBookedSlots(data))
      .catch(() => setBookedSlots([]));
  }, [slug, selectedDate]);

  // Filter out past time slots if selected date is today
  const getFilteredTimeSlots = () => {
    if (!eventData || !eventData.availableTimeSlots) return [];

    const isToday = selectedDate === getTodayStr();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return eventData.availableTimeSlots.filter(slot => {
      // Check if slot is already booked in database
      if (bookedSlots.includes(slot)) return false;

      // If today, filter out past time slots
      if (isToday) {
        const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let h = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          const period = match[3].toUpperCase();
          if (period === 'PM' && h !== 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          const slotMinutes = h * 60 + m;
          if (slotMinutes <= currentMinutes) {
            return false; // Slot has already passed today
          }
        }
      }
      return true;
    });
  };

  const handleNextStep = () => {
    setError('');
    if (!selectedDate) return setError('Please select a date.');
    if (!selectedSlot) return setError('Please select an available time slot.');
    setBookingStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!studentName.trim() || !studentEmail.trim() || !phoneNum.trim()) {
      setError('Please fill in your Full Name, Email, and Phone number.');
      return;
    }

    const fullPhone = `${countryCode} ${phoneNum.trim()}`;
    setSubmitting(true);
    try {
      const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
      const res = await fetch(`${apiUrl}/api/bookings/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim(),
          studentPhone: fullPhone,
          dreamCountry,
          preferredIntake,
          bookingDate: selectedDate,
          timeSlot: selectedSlot,
          notes
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Booking failed');
      setSubmitted(true);
      setSuccessMsg(result.message || 'Your booking is confirmed!');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderMedia = () => {
    if (!eventData) return null;
    const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

    // Check Video first
    if (eventData.videoUrl) {
      const isUploadedVideo = eventData.videoUrl.startsWith('/uploads/') || eventData.videoUrl.match(/\.(mp4|webm|mov)$/i);
      if (isUploadedVideo) {
        const fullVideoUrl = eventData.videoUrl.startsWith('http') ? eventData.videoUrl : `${apiUrl}${eventData.videoUrl}`;
        return (
          <div className="pbp-media-container">
            <video controls className="pbp-video-player" src={fullVideoUrl} />
          </div>
        );
      }
      return (
        <div className="pbp-media-container pbp-video-iframe">
          <iframe
            src={eventData.videoUrl}
            title="Event Video Preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Cover Image
    if (eventData.imageUrl) {
      const fullImgUrl = eventData.imageUrl.startsWith('http') ? eventData.imageUrl : `${apiUrl}${eventData.imageUrl}`;
      return (
        <div className="pbp-media-container">
          <img src={fullImgUrl} alt={eventData.title} className="pbp-cover-image" />
        </div>
      );
    }

    return null;
  };

  if (!slug) return <div className="pbp-container"><p>Invalid link</p></div>;
  if (loadError) return (
    <div className="pbp-container">
      <div className="pbp-card pbp-error-card">
        <div className="pbp-error-icon">📅</div>
        <h2>Booking Link Expired or Not Found</h2>
        <p>This scheduling link is invalid or the booking event has ended.</p>
      </div>
    </div>
  );
  if (!eventData) return (
    <div className="pbp-container">
      <div className="pbp-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="pbp-spinner" />
        <p style={{ color: '#64748b', marginTop: 16 }}>Loading booking calendar...</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="pbp-container">
      <div className="pbp-card pbp-success-card">
        <div className="pbp-success-icon">🎉</div>
        <h2>Booking Confirmed!</h2>
        <div className="pbp-success-badge">
          📅 {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} @ ⏰ {selectedSlot}
        </div>
        <p>{successMsg}</p>
        <div style={{ marginTop: 24, fontSize: 13, color: '#64748b' }}>
          A confirmation note has been recorded. Our study abroad counsellor will contact you at <strong>{countryCode} {phoneNum}</strong>.
        </div>
      </div>
    </div>
  );

  const filteredSlots = getFilteredTimeSlots();

  return (
    <div className="pbp-container">
      <div className="pbp-layout-card">
        
        {/* ── LEFT PANEL: Event Content & Media ── */}
        <div className="pbp-left-panel">
          <div className="pbp-brand">
            <span className="pbp-brand-icon">🎓</span>
            <span className="pbp-brand-text">UniCoach Scheduling</span>
          </div>

          <h1 className="pbp-title">{eventData.title}</h1>
          {eventData.subheading && <h3 className="pbp-subheading">{eventData.subheading}</h3>}

          <div className="pbp-badges-row">
            <span className="pbp-duration-tag">⏱️ {eventData.durationMinutes} Mins</span>
            <span className="pbp-type-tag">1-on-1 Counselling</span>
          </div>

          {/* Media Header (Image or Video) */}
          {renderMedia()}

          {eventData.description && (
            <div className="pbp-description-box">
              {eventData.description}
            </div>
          )}

          {/* Stage 2 Summary Badge */}
          {bookingStep === 2 && (
            <div className="pbp-selected-summary">
              <div className="pbp-summary-title">Selected Slot:</div>
              <div className="pbp-summary-slot">
                📅 {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
              <div className="pbp-summary-time">⏰ {selectedSlot}</div>
              <button onClick={() => setBookingStep(1)} className="pbp-change-slot-btn">
                ✏️ Change Date or Slot
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Stage-wise Step 1 or Step 2 ── */}
        <div className="pbp-right-panel">
          
          {/* Step Indicator Header */}
          <div className="pbp-step-indicator">
            <div className={`pbp-step-pill ${bookingStep === 1 ? 'active' : 'completed'}`}>
              1. Date & Time Slot
            </div>
            <div className={`pbp-step-pill ${bookingStep === 2 ? 'active' : ''}`}>
              2. Student Details
            </div>
          </div>

          {/* STAGE 1: Date & Time Slot Selector */}
          {bookingStep === 1 && (
            <div className="pbp-stage-content">
              <h3 className="pbp-stage-header">Select Meeting Date & Available Slot</h3>
              
              <div className="pbp-field">
                <label className="pbp-label">Select Date *</label>
                <input
                  type="date"
                  className="pbp-input"
                  min={getTodayStr()}
                  value={selectedDate}
                  onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                />
              </div>

              <div className="pbp-field">
                <label className="pbp-label">Available Real-Time Slots *</label>
                {filteredSlots.length === 0 ? (
                  <div className="pbp-no-slots">
                    No time slots available for {selectedDate}. All past or booked slots for this date are hidden. Please select another date.
                  </div>
                ) : (
                  <div className="pbp-slots-grid">
                    {filteredSlots.map((slot, idx) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`pbp-slot-btn ${isSelected ? 'pbp-slot-selected' : ''}`}
                        >
                          ⏰ {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {error && <div className="pbp-error">{error}</div>}

              <button
                type="button"
                className="pbp-next-btn"
                disabled={!selectedDate || !selectedSlot}
                onClick={handleNextStep}
              >
                Next: Enter Details ➔
              </button>
            </div>
          )}

          {/* STAGE 2: Student Details Form */}
          {bookingStep === 2 && (
            <form onSubmit={handleSubmit} className="pbp-stage-content">
              <h3 className="pbp-stage-header">Enter Your Information</h3>

              <div className="pbp-field">
                <label className="pbp-label">Full Name *</label>
                <input
                  type="text" className="pbp-input"
                  placeholder="e.g. Sagar Sharma"
                  value={studentName} onChange={e => setStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="pbp-field">
                <label className="pbp-label">Email Address *</label>
                <input
                  type="email" className="pbp-input"
                  placeholder="sagar@example.com"
                  value={studentEmail} onChange={e => setStudentEmail(e.target.value)}
                  required
                />
              </div>

              <div className="pbp-field">
                <label className="pbp-label">Phone / WhatsApp Number *</label>
                <div className="pbp-phone-group">
                  <select className="pbp-country-code" value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+353">🇮🇪 +353</option>
                    <option value="+64">🇳🇿 +64</option>
                  </select>
                  <input
                    type="tel" className="pbp-input"
                    placeholder="98765 43210"
                    value={phoneNum} onChange={e => setPhoneNum(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pbp-field-row">
                <div className="pbp-field">
                  <label className="pbp-label">Dream Country</label>
                  <CountrySelect
                    value={dreamCountry}
                    onChange={(val) => setDreamCountry(val)}
                    placeholder="Select dream country…"
                  />
                </div>
                <div className="pbp-field">
                  <label className="pbp-label">Preferred Intake</label>
                  <select className="pbp-input" value={preferredIntake} onChange={e => setPreferredIntake(e.target.value)}>
                    <option value="Fall 2026">Fall 2026</option>
                    <option value="Spring 2027">Spring 2027</option>
                    <option value="Fall 2027">Fall 2027</option>
                  </select>
                </div>
              </div>

              <div className="pbp-field">
                <label className="pbp-label">Notes / Questions (optional)</label>
                <textarea
                  className="pbp-input pbp-textarea"
                  placeholder="Tell us what you'd like to discuss in this call..."
                  value={notes} onChange={e => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {error && <div className="pbp-error">{error}</div>}

              <div className="pbp-action-buttons">
                <button type="button" className="pbp-back-btn" onClick={() => setBookingStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="pbp-submit-btn" disabled={submitting}>
                  {submitting ? 'Confirming...' : 'Confirm Booking 🚀'}
                </button>
              </div>
            </form>
          )}

          <div className="pbp-footer">
            Powered by <strong>UniCoach Scheduling Engine</strong>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicBookingPage;
