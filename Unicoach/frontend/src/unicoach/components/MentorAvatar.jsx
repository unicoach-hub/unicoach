import { useState } from 'react';
import { toAbsoluteUrl } from '../../utils/eventHelpers';
import { TEAM_MENTORS, mentorLook } from '../../utils/teamMentors';

const TEAM_NAMES = new Set(TEAM_MENTORS.map((m) => m.name.toLowerCase()));

// Mentor photo (uploads live on the API server) with an initial-letter fallback when missing or broken.
// Our team mentors show their cut-out photo on a soft gradient, the same look as the homepage cards.
export const MentorAvatar = ({ mentor, imgClassName = '', letterClassName = '' }) => {
  const src = toAbsoluteUrl(mentor.avatarUrl || mentor.coverImageUrl);
  const [failedSrc, setFailedSrc] = useState(null);
  const look = TEAM_NAMES.has(String(mentor.name || '').trim().toLowerCase()) ? mentorLook(mentor.name) : {};

  if (look.cutout) {
    return (
      <div className="w-full h-full" style={{ background: look.gradient }}>
        <img src={look.cutout} alt={mentor.name} loading="lazy" className={`${imgClassName} origin-bottom`} />
      </div>
    );
  }
  if (src && failedSrc !== src) {
    return <img src={src} alt={mentor.name} loading="lazy" onError={() => setFailedSrc(src)} className={imgClassName} />;
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br from-[#DE5C2B] to-[#B48C42] text-white font-black flex items-center justify-center ${letterClassName}`}>
      {mentor.name?.charAt(0) || 'M'}
    </div>
  );
};
