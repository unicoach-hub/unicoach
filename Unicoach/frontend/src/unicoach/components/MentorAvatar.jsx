import { useState } from 'react';
import { toAbsoluteUrl } from '../../utils/eventHelpers';

// Mentor photo (uploads live on the API server) with an initial-letter fallback when missing or broken
export const MentorAvatar = ({ mentor, imgClassName = '', letterClassName = '' }) => {
  const src = toAbsoluteUrl(mentor.avatarUrl || mentor.coverImageUrl);
  const [failedSrc, setFailedSrc] = useState(null);

  if (src && failedSrc !== src) {
    return <img src={src} alt={mentor.name} loading="lazy" onError={() => setFailedSrc(src)} className={imgClassName} />;
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br from-[#DE5C2B] to-[#EAB308] text-white font-black flex items-center justify-center ${letterClassName}`}>
      {mentor.name?.charAt(0) || 'M'}
    </div>
  );
};
