import cap from '../../assets/unicoach-cap.png';

// The graduation cap from the UniCoach logo (sits on the "i"), used in place of the 🎓 emoji.
// Sizes with the text around it by default; pass `size` (px width) where an icon size is expected.
const CapIcon = ({ size, className = '' }) => (
  <img
    src={cap}
    alt=""
    aria-hidden="true"
    draggable="false"
    className={`inline-block align-[-0.1em] select-none ${className}`}
    style={size ? { width: size, height: 'auto' } : { width: '1.2em', height: 'auto' }}
  />
);

export default CapIcon;
