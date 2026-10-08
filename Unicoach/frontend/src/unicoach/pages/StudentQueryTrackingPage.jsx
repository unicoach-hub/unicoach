import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentQueryStatus, submitReview, getAssetDownloadUrl } from '../api/unicoachApi';
import { 
  CheckCircle2, Clock, AlertCircle, Download, ExternalLink, 
  ArrowLeft, MessageSquare, Video, FileText, Calendar, 
  ShieldCheck, Copy, Check, Sparkles, Star
} from 'lucide-react';

const StudentQueryTrackingPage = () => {
  const { handle, bookingRef } = useParams();
  const cleanHandle = handle ? handle.replace(/^@/, '') : '';

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStudentQueryStatus(bookingRef);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Unable to find booking details. Please verify your reference number.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingRef) {
      fetchStatus();
    }
  }, [bookingRef]);

  const copyBookingRef = () => {
    if (booking?.bookingRef) {
      navigator.clipboard.writeText(booking.bookingRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const mentorHandle = booking?.mentor?.handle || cleanHandle;
    if (!mentorHandle || !booking?.bookingRef) return;

    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await submitReview(mentorHandle, {
        bookingRef: booking.bookingRef,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      setReviewSuccess(res.review || { rating: reviewRating, comment: reviewComment });
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isPriorityDm = Boolean(booking?.priorityDm?.questionText);
  const isDigitalAsset = Boolean(booking?.digitalAssetDelivery?.downloadToken || booking?.serviceId?.type === 'DIGITAL_ASSET');
  const isVideoCall = !isPriorityDm && !isDigitalAsset;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Brand Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            to={cleanHandle ? `/@${cleanHandle}` : '/'} 
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {cleanHandle ? `@${cleanHandle}` : 'UniCoach'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Verified Order
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium text-sm">Retrieving your order details...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xs">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">Order Not Found</h2>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <Link 
              to={cleanHandle ? `/@${cleanHandle}` : '/'} 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-all shadow-xs"
            >
              Return to Mentor Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Reference Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-600">Order Reference</span>
                    <button 
                      onClick={copyBookingRef}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-mono font-bold text-slate-700 transition-colors"
                      title="Click to copy reference"
                    >
                      <span>{booking.bookingRef}</span>
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 mt-1">
                    {booking.serviceId?.title || 'Mentorship Service'}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-600">Paid Amount</div>
                    <div className="text-lg font-extrabold text-slate-900">
                      ₹{booking.amountPaid?.toLocaleString('en-IN') || 0}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    booking.state === 'COMPLETED' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : booking.state === 'CONFIRMED'
                      ? 'bg-orange-50 text-[#C04A1D] border border-orange-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {booking.state}
                  </span>
                </div>
              </div>

              {/* Creator & Student Info Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">Creator: </span>
                  <span className="font-medium text-slate-900">{booking.mentorId?.name}</span>
                  {booking.mentorId?.handle && (
                    <span className="text-indigo-600 font-semibold ml-1">@{booking.mentorId.handle}</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Student: </span>
                  <span className="font-medium text-slate-900">{booking.studentName}</span> ({booking.studentEmail})
                </div>
              </div>
            </div>

            {/* PRIORITY DM TRACKING SECTION */}
            {isPriorityDm && (
              <div className="space-y-6">
                {/* Status Hero Pill */}
                {booking.priorityDm?.status === 'ANSWERED' ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0 shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-emerald-950">Query Answered!</h3>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Your mentor reviewed your question and submitted a detailed answer on{' '}
                        {booking.priorityDm.answeredAt ? new Date(booking.priorityDm.answeredAt).toLocaleString() : 'recently'}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-amber-950">Awaiting Mentor Response</h3>
                        {booking.slaRemainingText && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                            ⏳ {booking.slaRemainingText} left
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Your query is protected under the 48-hour SLA guarantee. You will see the mentor's answer right here once submitted.
                      </p>
                    </div>
                  </div>
                )}

                {/* Mentor Answer Box (if answered) */}
                {booking.priorityDm?.status === 'ANSWERED' && (
                  <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {booking.mentorId?.name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          Response from {booking.mentorId?.name}
                        </div>
                        <div className="text-xs text-slate-600">
                          {booking.priorityDm.answeredAt ? new Date(booking.priorityDm.answeredAt).toLocaleString() : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {booking.priorityDm.answerText}
                    </div>

                    {booking.priorityDm.attachmentUrl && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">Shared Resource / Attachment:</span>
                        <a 
                          href={booking.priorityDm.attachmentUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Resource</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Student's Original Question Box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      Your Submitted Question
                    </h3>
                  </div>

                  <p className="text-sm text-slate-900 font-medium whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {booking.priorityDm.questionText}
                  </p>

                  {booking.priorityDm.contextText && (
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-slate-600">Additional Context:</span>
                      <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {booking.priorityDm.contextText}
                      </p>
                    </div>
                  )}

                  {booking.priorityDm.referenceUrl && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-600">Reference / Profile Link:</span>
                      <a 
                        href={booking.priorityDm.referenceUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-600 hover:underline flex items-center gap-1 font-mono"
                      >
                        {booking.priorityDm.referenceUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DIGITAL ASSET DOWNLOAD SECTION */}
            {isDigitalAsset && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Your Downloadable Resource</h3>
                    <p className="text-xs text-slate-600">
                      Download this file anytime from this page (up to {booking.digitalAssetDelivery?.maxDownloads || 10} times).
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                      FILE
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {booking.digitalAssetDelivery?.fileName || booking.serviceId?.title}
                      </div>
                      <div className="text-xs text-slate-600">
                        {booking.digitalAssetDelivery?.downloadCount || 0} times downloaded
                      </div>
                    </div>
                  </div>

                  {booking.digitalAssetDelivery?.downloadToken && (
                    <a
                      href={getAssetDownloadUrl(booking.digitalAssetDelivery.downloadToken)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File Now</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 1:1 CALL DETAILS */}
            {isVideoCall && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-orange-50 text-[#DE5C2B]">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">1:1 Video Consultation Details</h3>
                    <p className="text-xs text-slate-600">Your meeting is confirmed and scheduled.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {booking.startUtc ? new Date(booking.startUtc).toLocaleString() : 'Scheduled Session'}
                      </div>
                      <div className="text-xs text-slate-600">
                        Duration: {booking.durationMinutes || 30} minutes
                      </div>
                    </div>
                  </div>

                  {booking.meeting?.joinUrl && (
                    <a
                      href={booking.meeting.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Video Call</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ── VERIFIED SESSION REVIEW & FEEDBACK CARD ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {(booking.review || reviewSuccess) ? 'Your Verified Review' : `Rate Your Session with ${booking.mentor?.name || 'Mentor'}`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verified feedback published directly on @{booking.mentor?.handle || cleanHandle}&apos;s public profile.
                    </p>
                  </div>
                </div>

                <span className="self-start sm:self-auto text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Student
                </span>
              </div>

              {(booking.review || reviewSuccess) ? (
                <div className="mt-5 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-1 text-amber-500 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= ((booking.review?.rating || reviewSuccess?.rating) || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1.5">
                      {(booking.review?.rating || reviewSuccess?.rating) || 5} / 5 Stars
                    </span>
                  </div>
                  {(booking.review?.comment || reviewSuccess?.comment) ? (
                    <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                      &ldquo;{booking.review?.comment || reviewSuccess?.comment}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No written comment provided.</p>
                  )}
                  <div className="mt-3 text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Review verified and published on mentor profile.</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
                  {reviewError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{reviewError}</span>
                    </div>
                  )}

                  {/* Interactive Star Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Rating:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              star <= (hoverRating || reviewRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {reviewRating === 5 ? '5 - Excellent!' : `${reviewRating} / 5 Stars`}
                      </span>
                    </div>
                  </div>

                  {/* Comment Box */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Feedback / Review (Optional):
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={`How was your session with ${booking.mentor?.name || 'your mentor'}? Share helpful insights about admissions roadmap, SOP review, or university advice...`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Publishing Review...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Submit Verified Review</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-600">
        <p>UniCoach Verified Student Order Protection • Powered by UniCoach</p>
      </footer>
    </div>
  );
};

export default StudentQueryTrackingPage;
