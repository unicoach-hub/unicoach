import React, { useState, useMemo } from 'react';
import { getUniversityLogo, getUniversityInitials, getAvatarColor } from './logoResolver';

/**
 * UniversityLogo — High reliability multi-source logo component
 * 
 * 1. Checks local verified asset `/logos/...` via logoResolver (690+ universities)
 * 2. Uses direct provided logo URL if available (and not broken/placeholder)
 * 3. Falls back directly to styled CSS/SVG capital letters initials badge
 */

// Parse size to numeric pixel value
const parseSize = (size) => {
  if (typeof size === 'number') return size;
  if (typeof size === 'string') {
    if (size === 'xs' || size.includes('w-6') || size.includes('w-7')) return 28;
    if (size === 'sm' || size.includes('w-8') || size.includes('w-9')) return 36;
    if (size === 'md' || size.includes('w-10') || size.includes('w-11')) return 44;
    if (size === 'lg' || size.includes('w-12') || size.includes('w-14')) return 52;
    if (size === 'xl' || size.includes('w-16')) return 64;
    const num = parseInt(size, 10);
    if (!isNaN(num)) return num;
  }
  return 44;
};

const UniversityLogo = ({ 
  logo,
  logoUrl,
  domain,
  website,
  name = '',
  universityName = '',
  size = 44,
  className = ''
}) => {
  const [sourceIndex, setSourceIndex] = useState(0);

  const actualName = universityName || name || '';
  const actualLogo = logo || logoUrl || '';
  const pixelSize = parseSize(size);

  // Build waterfall candidate URLs (only real local or verified custom image URLs)
  const candidateUrls = useMemo(() => {
    const list = [];

    // 1. Try Local verified logo mapper
    const localLogo = getUniversityLogo(actualName, actualLogo);
    if (localLogo && localLogo.startsWith('/logos/')) {
      list.push(localLogo);
    }

    // 2. Direct provided logo (if valid custom web image)
    if (
      actualLogo && 
      typeof actualLogo === 'string' &&
      (actualLogo.startsWith('http://') || actualLogo.startsWith('https://')) &&
      !actualLogo.includes('via.placeholder') && 
      !actualLogo.includes('logo.clearbit.com') &&
      !actualLogo.includes('ui-avatars.com') &&
      !list.includes(actualLogo)
    ) {
      list.push(actualLogo);
    }

    return list;
  }, [actualName, actualLogo]);

  const handleImgError = () => {
    if (sourceIndex < candidateUrls.length - 1) {
      setSourceIndex(prev => prev + 1);
    } else {
      setSourceIndex(999); // Force CSS initials fallback
    }
  };

  // Pure CSS Letter Avatar Fallback / Primary monogram when no logo exists
  if (sourceIndex >= candidateUrls.length || candidateUrls.length === 0) {
    const [color1, color2] = getAvatarColor(actualName);
    const initials = getUniversityInitials(actualName);
    const isLong = initials.length > 3;

    return (
      <div 
        className={`flex items-center justify-center text-white select-none rounded-xl font-black shadow-xs flex-shrink-0 tracking-tight transition-transform duration-200 hover:scale-105 ${className}`}
        style={{ 
          width: pixelSize, 
          height: pixelSize, 
          background: `linear-gradient(135deg, ${color1}, ${color2})`,
          fontSize: isLong ? Math.max(pixelSize * 0.22, 8.5) : Math.max(pixelSize * 0.32, 10.5),
          minWidth: pixelSize,
          minHeight: pixelSize,
        }}
        title={actualName}
      >
        <span className="leading-none text-center font-black uppercase px-0.5 drop-shadow-xs">
          {initials}
        </span>
      </div>
    );
  }

  const currentSrc = candidateUrls[sourceIndex];

  return (
    <div 
      className={`rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1.5 flex-shrink-0 shadow-2xs overflow-hidden ${className}`}
      style={{ width: pixelSize, height: pixelSize, minWidth: pixelSize, minHeight: pixelSize }}
    >
      <img
        src={currentSrc}
        alt={actualName}
        className="w-full h-full object-contain rounded-lg transition-transform duration-200 hover:scale-105"
        onError={handleImgError}
        loading="lazy"
        title={actualName}
      />
    </div>
  );
};

export default UniversityLogo;

