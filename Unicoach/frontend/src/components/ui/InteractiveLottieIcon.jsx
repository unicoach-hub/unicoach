import React, { useState, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { 
  Calendar, 
  Bell, 
  Wallet, 
  Video, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Rocket, 
  Heart, 
  Star, 
  Settings, 
  User, 
  TrendingUp, 
  Lock, 
  Share2, 
  Flame,
  Zap,
  Clock,
  Eye,
  Plus,
  GraduationCap,
  Award,
  Calculator,
  Compass,
  FileText,
  Mic,
  Headphones,
  BookOpen,
  Globe
} from 'lucide-react';

/**
 * Curated DotLottie CDN Animations for core platform icons
 */
const LOTTIE_PRESETS = {
  calendar: 'https://lottie.host/96b3a3c9-fb47-4971-8c4d-ea8d0b2f5670/eF1oH0T4q4.lottie',
  bell: 'https://lottie.host/28f9d0c3-c23f-42ae-8db4-f06b6eb2d126/qLhQoP2k4J.lottie',
  wallet: 'https://lottie.host/81a95a89-20f7-4dc5-bfa3-0f7f3f2f8a8e/W4lLet12.lottie',
  sparkles: 'https://lottie.host/4a6e8b2c-9a4d-4d7a-8f5c-d3e2b1a0f9c8/sP4rK1eS.lottie',
  rocket: 'https://lottie.host/6e792c30-f655-4670-87a4-e740d7c0f16e/K1c2A3b4.lottie',
  verified: 'https://lottie.host/d46d0a7a-6bfa-4c4f-b673-c15bce68f6bf/nZz7F9Y1W2.lottie',
  star: 'https://lottie.host/5a2d1e3f-4b6c-4d8e-9f0a-1b2c3d4e5f6a/sT4r88.lottie',
  heart: 'https://lottie.host/1b2c3d4e-5f6a-4b6c-4d8e-9f0a1b2c3d4e/hE4rt99.lottie'
};

const FALLBACK_LUCIDE_MAP = {
  calendar: Calendar,
  bell: Bell,
  wallet: Wallet,
  video: Video,
  message: MessageSquare,
  chat: MessageSquare,
  sparkles: Sparkles,
  verified: CheckCircle2,
  rocket: Rocket,
  heart: Heart,
  star: Star,
  settings: Settings,
  user: User,
  growth: TrendingUp,
  lock: Lock,
  share: Share2,
  flame: Flame,
  zap: Zap,
  clock: Clock,
  eye: Eye,
  plus: Plus,
  graduation: GraduationCap,
  award: Award,
  calculator: Calculator,
  compass: Compass,
  sop: FileText,
  mic: Mic,
  interview: Mic,
  ielts: Sparkles,
  headphones: Headphones,
  consultation: Headphones,
  book: BookOpen,
  globe: Globe
};

/**
 * Micro-animated custom SVG vectors that deliver INSTANT zero-latency Canva delight
 */
const AnimatedCanvaVector = ({ type, isHovered, color, size }) => {
  switch (type) {
    case 'graduation':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="overflow-visible">
          {/* Mortarboard Cap */}
          <path
            d="M2 9.5L12 4L22 9.5L12 15L2 9.5Z"
            fill="currentColor"
            fillOpacity="0.16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 origin-center ${isHovered ? 'scale-105 -rotate-2' : ''}`}
          />
          {/* Cap Lower Base */}
          <path
            d="M6 12V16.5C6 18.5 8.5 20.5 12 20.5C15.5 20.5 18 18.5 18 16.5V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Swinging Tassel with Spring physics */}
          <g className={`transition-transform duration-500 origin-[21px_9.5px] ${isHovered ? 'animate-[tasselSway_1s_ease-in-out_infinite]' : ''}`}>
            <path d="M21 10.5V17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="21" cy="17.5" r="1.5" fill="currentColor" />
          </g>
        </svg>
      );

    case 'award':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="overflow-visible">
          {/* Medal Ribbons */}
          <path
            d="M8.2 13.8L6.5 21L12 18L17.5 21L15.8 13.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 origin-top ${isHovered ? 'scale-y-110' : ''}`}
          />
          {/* Medal Circle */}
          <circle
            cx="12"
            cy="8.5"
            r="6"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-300 origin-center ${isHovered ? 'scale-110 rotate-12' : ''}`}
          />
          {/* Inner Shimmer Star */}
          <path
            d="M12 5.5L13 7.5L15 7.8L13.5 9.2L14 11.2L12 10.2L10 11.2L10.5 9.2L9 7.8L11 7.5L12 5.5Z"
            fill="currentColor"
            className={`transition-all duration-300 origin-center ${isHovered ? 'scale-125 opacity-100 rotate-45' : 'opacity-80'}`}
          />
        </svg>
      );

    case 'calculator':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="overflow-visible">
          {/* Calculator Body */}
          <rect
            x="4"
            y="2"
            width="16"
            height="20"
            rx="4"
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-200 ${isHovered ? 'scale-[1.03]' : ''}`}
          />
          {/* Screen */}
          <rect
            x="7"
            y="5"
            width="10"
            height="4"
            rx="1.5"
            fill="currentColor"
            fillOpacity={isHovered ? "0.4" : "0.2"}
            stroke="currentColor"
            strokeWidth="1.2"
          />
          {/* Pulsing Keypad Buttons */}
          <circle cx="8" cy="13" r="1.3" fill="currentColor" className={`transition-transform ${isHovered ? 'scale-125' : ''}`} />
          <circle cx="12" cy="13" r="1.3" fill="currentColor" className={`transition-transform delay-75 ${isHovered ? 'scale-125' : ''}`} />
          <circle cx="16" cy="13" r="1.3" fill="currentColor" className={`transition-transform delay-150 ${isHovered ? 'scale-125' : ''}`} />
          <circle cx="8" cy="17" r="1.3" fill="currentColor" className={`transition-transform delay-100 ${isHovered ? 'scale-125' : ''}`} />
          <circle cx="12" cy="17" r="1.3" fill="currentColor" className={`transition-transform delay-150 ${isHovered ? 'scale-125' : ''}`} />
          <circle cx="16" cy="17" r="1.3" fill="currentColor" className={`transition-transform delay-200 ${isHovered ? 'scale-125' : ''}`} />
        </svg>
      );

    case 'compass':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="overflow-visible">
          {/* Outer Ring */}
          <circle
            cx="12"
            cy="12"
            r="9.5"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Spinning Magnetic Needle */}
          <g className={`transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-center ${isHovered ? 'rotate-[360deg] scale-110' : 'rotate-0'}`}>
            <polygon points="12,4 14.5,12 12,10.5 9.5,12" fill="#DE5C2B" />
            <polygon points="12,20 14.5,12 12,13.5 9.5,12" fill="currentColor" fillOpacity="0.8" />
            <circle cx="12" cy="12" r="1.8" fill="white" stroke="currentColor" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'sop':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="overflow-visible">
          {/* Document Sheet */}
          <path
            d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Animated Written Text Lines */}
          <line
            x1="8"
            y1="12"
            x2={isHovered ? "16" : "13"}
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <line
            x1="8"
            y1="16"
            x2={isHovered ? "15" : "11"}
            y2="16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-300 delay-100"
          />
        </svg>
      );

    case 'mic':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="overflow-visible">
          {/* Pulsing Acoustic Sound Waves */}
          <path
            d="M2 11C2 7 4.5 4 4.5 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`transition-all duration-300 origin-center ${isHovered ? 'opacity-100 scale-110 -translate-x-1' : 'opacity-0'}`}
          />
          <path
            d="M22 11C22 7 19.5 4 19.5 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`transition-all duration-300 origin-center ${isHovered ? 'opacity-100 scale-110 translate-x-1' : 'opacity-0'}`}
          />
          {/* Microphone Body */}
          <rect
            x="8.5"
            y="2"
            width="7"
            height="12"
            rx="3.5"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-200 ${isHovered ? 'scale-105' : ''}`}
          />
          <path d="M5 10V11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'sparkles':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="overflow-visible">
          {/* Primary Main Star */}
          <path
            d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            className={`transition-transform duration-500 origin-[12px_10px] ${isHovered ? 'scale-125 rotate-45' : 'scale-100 rotate-0'}`}
          />
          {/* Top Right Mini Star */}
          <path
            d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2L19 15Z"
            fill="currentColor"
            className={`transition-all duration-300 origin-[19px_18px] ${isHovered ? 'scale-130 opacity-100 rotate-90' : 'opacity-60 scale-90'}`}
          />
          {/* Bottom Left Mini Star */}
          <path
            d="M5 16L5.5 17.5L7 18L5.5 18.5L5 20L4.5 18.5L3 18L4.5 17.5L5 16Z"
            fill="currentColor"
            className={`transition-all duration-300 origin-[5px_18px] ${isHovered ? 'scale-130 opacity-100 -rotate-45' : 'opacity-60 scale-90'}`}
          />
        </svg>
      );

    case 'headphones':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="overflow-visible">
          {/* Headphone Band */}
          <path
            d="M3 14V11C3 6.02944 7.02944 2 12 2C16.9706 2 21 6.02944 21 11V14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`transition-transform duration-200 ${isHovered ? 'scale-[1.02]' : ''}`}
          />
          {/* Ear Cups */}
          <rect x="2" y="13" width="4.5" height="7.5" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
          <rect x="17.5" y="13" width="4.5" height="7.5" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
          {/* Dancing Audio Equalizer Spectrum Bars */}
          <g className="origin-bottom">
            <line
              x1="9"
              y1={isHovered ? "11" : "14"}
              x2="9"
              y2="17"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="transition-all duration-200"
            />
            <line
              x1="12"
              y1={isHovered ? "8" : "12"}
              x2="12"
              y2="17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="transition-all duration-200 delay-75"
            />
            <line
              x1="15"
              y1={isHovered ? "10" : "13"}
              x2="15"
              y2="17"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="transition-all duration-200 delay-150"
            />
          </g>
        </svg>
      );

    default:
      return null;
  }
};

/**
 * InteractiveLottieIcon
 * Canva-grade interactive icon component powered by @lottiefiles/dotlottie-react.
 * Features:
 * - Plays smoothly on hover (Canva style) or click
 * - Elastic spring physics on hover: tilt, bounce, scale
 * - Fallback with rich interactive SVG micro-interactions with zero network latency
 */
export const InteractiveLottieIcon = ({
  name = 'sparkles',
  src,
  size = 22,
  trigger = 'hover',
  color = '#DE5C2B',
  className = '',
  onClick,
  loop = false,
  autoplay = false,
  canvaSpring = true,
  isParentHovered
}) => {
  const [dotLottie, setDotLottie] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const dotLottieRefCallback = useCallback((instance) => {
    setDotLottie(instance);
  }, []);

  const animationUrl = src || LOTTIE_PRESETS[name];
  const LucideIcon = FALLBACK_LUCIDE_MAP[name] || Sparkles;
  const effectiveHovered = isParentHovered !== undefined ? isParentHovered : isHovered;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (dotLottie && (trigger === 'hover' || trigger === 'loop-on-hover')) {
      dotLottie.stop();
      dotLottie.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);

    if (dotLottie && trigger === 'click') {
      dotLottie.stop();
      dotLottie.play();
    }

    if (onClick) onClick(e);
  };

  const springStyle = canvaSpring
    ? {
        transform: isClicked
          ? 'scale(0.88) rotate(-4deg)'
          : effectiveHovered
            ? 'scale(1.18) translateY(-1.5px) rotate(4deg)'
            : 'scale(1) translateY(0px) rotate(0deg)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.22s ease',
        filter: effectiveHovered ? `drop-shadow(0 4px 10px ${color}44)` : 'none'
      }
    : {};

  const customVector = AnimatedCanvaVector({
    type: name,
    isHovered: effectiveHovered,
    color,
    size: size * 0.95
  });

  return (
    <span
      className={`inline-flex items-center justify-center cursor-pointer select-none relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        color,
        ...springStyle
      }}
    >
      {animationUrl && !hasError ? (
        <DotLottieReact
          src={animationUrl}
          loop={loop || (trigger === 'loop') || (trigger === 'loop-on-hover' && effectiveHovered)}
          autoplay={autoplay || trigger === 'loop'}
          dotLottieRefCallback={dotLottieRefCallback}
          onError={() => setHasError(true)}
          style={{ width: size, height: size }}
          className="w-full h-full pointer-events-none"
        />
      ) : customVector ? (
        customVector
      ) : (
        <LucideIcon
          style={{ width: size * 0.85, height: size * 0.85, color }}
          className={`transition-transform duration-300 ${effectiveHovered ? 'scale-115 rotate-3' : ''}`}
        />
      )}
    </span>
  );
};

/**
 * CanvaIconWrapper
 * Wraps ANY icon or button icon with Canva-grade interactive micro-motion:
 * - Elastic spring bounce
 * - 3D playful tilt on hover
 * - Haptic scale-down on click
 * - Glow ring on focus/hover
 */
export const CanvaIconWrapper = ({
  children,
  size = 20,
  glowColor = 'rgba(222, 92, 43, 0.3)',
  className = '',
  onClick
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-250 cursor-pointer ${className}`}
      style={{
        transform: pressed
          ? 'scale(0.88)'
          : hovered
            ? 'scale(1.18) rotate(4deg)'
            : 'scale(1) rotate(0deg)',
        filter: hovered ? `drop-shadow(0 3px 8px ${glowColor})` : 'none',
        transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease'
      }}
    >
      {children}
    </span>
  );
};

export default InteractiveLottieIcon;
