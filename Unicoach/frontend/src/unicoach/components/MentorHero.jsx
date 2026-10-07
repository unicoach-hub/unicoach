import React from 'react';
import { CheckCircle2, Globe, Clock, ShieldCheck, ExternalLink, Star } from 'lucide-react';

const LinkedinIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TwitterIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const MentorHero = ({ mentor, ratingStats }) => {
  if (!mentor) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar / Placeholder */}
        <div className="relative">
          {mentor.avatarUrl ? (
            <img
              src={mentor.avatarUrl}
              alt={mentor.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {mentor.name.charAt(0)}
            </div>
          )}
          {mentor.isVerified && (
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm" title="Verified Mentor">
              <CheckCircle2 className="w-6 h-6 text-[#DE5C2B] fill-blue-50" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {mentor.name}
            </h1>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              @{mentor.handle}
            </span>
          </div>

          {mentor.headline && (
            <p className="text-base sm:text-lg text-slate-700 font-medium mb-3">
              {mentor.headline}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {ratingStats && ratingStats.totalReviews > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{ratingStats.averageRating.toFixed(1)}</span>
                <span className="text-amber-700/80 font-medium">({ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                <span>Top Rated Creator</span>
              </span>
            )}

            {mentor.badges?.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/60"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {badge}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {mentor.ianaTimezone}
            </span>
          </div>

          {/* Bio snippet */}
          {mentor.bio && (
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              {mentor.bio}
            </p>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
            {mentor.socialLinks?.linkedin && (
              <a
                href={mentor.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-[#DE5C2B] transition-colors"
                title="LinkedIn Profile"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {mentor.socialLinks?.twitter && (
              <a
                href={mentor.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-sky-500 transition-colors"
                title="Twitter / X"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            )}
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              UniCoach Verified Creator
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorHero;
