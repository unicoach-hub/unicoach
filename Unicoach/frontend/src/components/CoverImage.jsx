import { useState } from 'react';

// Cover image for blog / digest cards. Without an image, or when the image fails to load, it shows a
// branded cover (UniCoach orange, category + title) instead of a broken-image icon.
const CoverImage = ({ src, alt, title, category, className = '' }) => {
  const [failedSrc, setFailedSrc] = useState(null);

  if (src && failedSrc !== src) {
    return <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className={className} />;
  }

  return (
    <div
      role="img"
      aria-label={alt || title}
      className="w-full h-full flex flex-col justify-between p-5 sm:p-6 text-white bg-gradient-to-br from-[#DE5C2B] via-[#E8743F] to-[#F2A35E] relative overflow-hidden"
    >
      <div className="absolute -right-10 -bottom-12 w-48 h-48 rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute -right-2 top-6 w-24 h-24 rounded-full bg-white/10" aria-hidden="true" />
      {category && (
        <span className="relative self-start text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
          {category}
        </span>
      )}
      <p className="relative font-outfit text-base sm:text-xl font-black leading-snug line-clamp-3 max-w-[90%]">
        {title}
      </p>
      <span className="relative text-[11px] font-bold opacity-85">UniCoach Guide</span>
    </div>
  );
};

export default CoverImage;
