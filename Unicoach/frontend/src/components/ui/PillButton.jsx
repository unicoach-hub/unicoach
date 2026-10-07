import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

/**
 * Reusable Premium Pill Button Component
 * Matches the signature Hero "Book Free Counselling" gradient pill button design.
 * 
 * @param {'blue' | 'white' | 'dark' | 'glass'} variant - Button theme variant
 * @param {'sm' | 'md' | 'lg'} size - Button sizing preset
 * @param {React.ReactNode} children - Button text / content
 * @param {React.ElementType} icon - Optional Lucide Icon (defaults to ArrowUpRight)
 * @param {boolean} showIcon - Toggle circular action icon badge (default: true)
 * @param {function} onClick - Click event callback
 * @param {string} to - React Router Link destination
 * @param {string} href - External anchor link destination
 * @param {string} className - Additional Tailwind CSS classes
 */
export const PillButton = ({
  variant = 'blue',
  size = 'md',
  children,
  icon: Icon = ArrowUpRight,
  showIcon = true,
  onClick,
  to,
  href,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) => {
  // Size presets
  const sizeStyles = {
    sm: {
      btn: 'pl-4 pr-3 py-2 text-[12px]',
      badge: 'w-5 h-5',
      iconSize: 'w-3 h-3',
    },
    md: {
      btn: 'pl-5 sm:pl-6 pr-3.5 sm:pr-4 py-2.5 sm:py-3 text-[12.5px] sm:text-[13px]',
      badge: 'w-6 h-6',
      iconSize: 'w-3.5 h-3.5',
    },
    lg: {
      btn: 'pl-7 pr-5 py-3.5 text-[14px] sm:text-[15px]',
      badge: 'w-7 h-7',
      iconSize: 'w-4 h-4',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  // Variant presets
  const variantStyles = {
    // 1. Signature Terracotta Brand Gradient (Replaces blue/indigo)
    blue: {
      btn: 'bg-gradient-to-r from-[#DE5C2B] via-[#E86E38] to-[#C84E20] hover:from-[#C84E20] hover:via-[#D45928] hover:to-[#B34117] text-white shadow-[0_10px_26px_-4px_rgba(222,92,43,0.38)] hover:shadow-[0_14px_34px_-4px_rgba(222,92,43,0.52)] border border-white/20',
      badge: 'bg-white/20 backdrop-blur-md text-white group-hover:bg-white group-hover:text-[#DE5C2B]',
      shimmer: 'bg-gradient-to-r from-transparent via-white/25 to-transparent',
      topLine: 'bg-gradient-to-r from-transparent via-white/60 to-transparent',
    },
    // 2. White Glass / Solid (For Dark or Warm backgrounds)
    white: {
      btn: 'bg-white hover:bg-orange-50/50 text-slate-900 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12)] hover:shadow-[0_14px_32px_-5px_rgba(222,92,43,0.18)] border border-white/80',
      badge: 'bg-orange-50 text-[#DE5C2B] group-hover:bg-[#DE5C2B] group-hover:text-white',
      shimmer: 'bg-gradient-to-r from-transparent via-orange-500/10 to-transparent',
      topLine: 'bg-gradient-to-r from-transparent via-slate-200 to-transparent',
    },
    // 3. Glossy Obsidian Dark Pill
    dark: {
      btn: 'bg-gradient-to-r from-[#111111] via-[#1E1E1E] to-[#111111] hover:from-[#000000] hover:to-[#1a1a1a] text-white shadow-[0_10px_25px_-5px_rgba(17,17,17,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(17,17,17,0.6)] border border-white/15',
      badge: 'bg-white/15 text-slate-200 group-hover:bg-white group-hover:text-[#111111]',
      shimmer: 'bg-gradient-to-r from-transparent via-white/20 to-transparent',
      topLine: 'bg-gradient-to-r from-transparent via-white/40 to-transparent',
    },
    // 4. Subtle Clean Glass Pill
    glass: {
      btn: 'bg-white/90 hover:bg-orange-50/60 text-slate-800 backdrop-blur-md shadow-xs hover:shadow-md border border-orange-200/80 hover:border-[#DE5C2B] hover:text-[#DE5C2B]',
      badge: 'bg-slate-100 text-slate-700 group-hover:bg-[#DE5C2B] group-hover:text-white',
      shimmer: 'bg-gradient-to-r from-transparent via-orange-200/30 to-transparent',
      topLine: 'bg-gradient-to-r from-transparent via-orange-100 to-transparent',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.blue;
  const commonClasses = `group relative inline-flex items-center justify-center gap-3 font-extrabold font-outfit tracking-tight rounded-full transition-all duration-300 cursor-pointer overflow-hidden select-none disabled:opacity-50 disabled:cursor-not-allowed ${currentSize.btn} ${currentVariant.btn} ${className}`;

  const content = (
    <>
      {/* Top Subtle Specular Light Highlight */}
      <div className={`absolute inset-x-3 top-0 h-[1px] ${currentVariant.topLine} pointer-events-none`} />

      {/* Shimmer Light Reflection Sweep on Hover */}
      <div className={`absolute inset-0 -translate-x-full group-hover:translate-x-full ${currentVariant.shimmer} transition-transform duration-1000 ease-out pointer-events-none`} />

      <span className="relative z-10">{children}</span>

      {showIcon && Icon && (
        <div className={`relative z-10 ${currentSize.badge} rounded-full flex items-center justify-center group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shadow-2xs shrink-0 ${currentVariant.badge}`}>
          <Icon className={`${currentSize.iconSize} stroke-[2.5]`} />
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.04, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className="inline-block"
      >
        <Link to={to} className={commonClasses} {...props}>
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.04, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className="inline-block"
      >
        <a href={href} className={commonClasses} {...props}>
          {content}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.04, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={commonClasses}
      {...props}
    >
      {content}
    </motion.button>
  );
};

export default PillButton;
