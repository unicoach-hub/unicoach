import { useState } from 'react';
import { getApiUrl } from '../config';

// Uploaded files may come back as a full Cloudinary URL or a local /uploads path on the API server
const assetUrl = (src) => (!src ? '' : /^https?:\/\//i.test(src) ? src : `${getApiUrl().replace(/\/api\/?$/, '')}${src}`);

// Round photo of a staff member, or their initial when there's no photo (or it fails to load)
// `fill` = take the parent's full size and shape (e.g. inside the sidebar's .nx-avatar tile)
const StaffAvatar = ({ name, src, size = 36, className = '', fill = false }) => {
  const [failed, setFailed] = useState(null);
  const url = assetUrl(src);
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const style = fill
    ? { width: '100%', height: '100%', borderRadius: 'inherit', display: 'block' }
    : { width: size, height: size, minWidth: size, borderRadius: 999, fontSize: Math.round(size * 0.42) };

  if (url && failed !== url) {
    return <img src={url} alt="" className={className} style={{ ...style, objectFit: 'cover' }} onError={() => setFailed(url)} />;
  }
  return (
    <span className={`staff-avatar-fallback ${className}`} style={style} aria-hidden="true">
      {initial}
    </span>
  );
};

export default StaffAvatar;
