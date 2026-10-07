import React, { useState } from 'react';
import { Star, ShieldCheck, MessageSquare, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { submitReview } from '../api/unicoachApi';

const ReviewsSection = ({ mentor, reviews = [], ratingStats = { averageRating: 5.0, totalReviews: 0 }, onReviewSubmitted }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!bookingRef.trim()) {
      setError('Please enter your Booking Reference code (e.g. UNM-...)');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await submitReview(mentor.handle, {
        bookingRef: bookingRef.trim().toUpperCase(),
        rating,
        comment: comment.trim()
      });

      setSuccess('Thank you! Your verified review has been published.');
      setBookingRef('');
      setComment('');
      setRating(5);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setError(err.message || 'Failed to submit review. Make sure your booking reference is valid.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900">
              Verified Student Reviews
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              100% Verified
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real feedback from students who booked and attended 1:1 sessions with {mentor?.name}.
          </p>
        </div>

        {/* Aggregate Rating Pill */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80 flex-shrink-0">
          <div className="text-2xl font-black text-slate-900">
            {ratingStats.totalReviews > 0 ? ratingStats.averageRating.toFixed(1) : '5.0'}
          </div>
          <div>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(ratingStats.averageRating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 fill-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
              {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="py-6">
        {reviews.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No reviews yet for @{mentor?.handle}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Be among the first to book a session and share your experience!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/70 p-4.5 flex flex-col justify-between transition-all hover:bg-slate-50"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {rev.studentName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{rev.studentName}</h4>
                        <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          Verified Session
                        </span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.serviceTitle && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Session: {rev.serviceTitle}
                    </span>
                  )}

                  {rev.comment && (
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200/50">
                  {new Date(rev.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* "Have a Completed Booking? Leave a Review" Accordion */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-between w-full py-2"
        >
          <span>Attended a session with {mentor?.name}? Leave your review</span>
          {isFormOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isFormOpen && (
          <form onSubmit={handleSubmitReview} className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-slate-800">Submit Verified Student Feedback</h4>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Booking Reference Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. UNM-174244..."
                  required
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Found on your confirmation receipt or calendar invite
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition-colors focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-transparent text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Review & Experience
              </label>
              <textarea
                rows="3"
                placeholder="How helpful was this call? What key insights or university guidance did you gain?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Verifying Booking...
                </>
              ) : (
                'Post Verified Review'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
