import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X, Sparkles } from 'lucide-react';
import OptionIcon from './ui/OptionIcon';

/**
 * PremiumDropdown — A beautifully styled custom dropdown replacing native <select>.
 *
 * Props:
 *  - value: current selected value
 *  - onChange: (value) => void
 *  - options: [{ value, label, shortLabel?, icon?, description? }]
 *  - label: field label text
 *  - labelIcon: React node for the label icon
 *  - placeholder: placeholder text when no selection
 *  - accent: 'emerald' | 'indigo' | 'blue' | 'violet' | 'orange' (default: 'emerald')
 *  - searchable: boolean (enables search filter input inside dropdown)
 *  - searchPlaceholder: string
 *  - creatable: boolean (allows user to type and use custom value)
 */

const ACCENT_STYLES = {
  emerald: {
    openBorder: 'border-emerald-500 shadow-md shadow-emerald-100/50 ring-3 ring-emerald-500/10',
    chevron: 'text-emerald-600',
    selectedBg: 'bg-emerald-50 text-emerald-800 border-l-[3px] border-emerald-600 font-bold',
    checkColor: 'text-emerald-600',
  },
  indigo: {
    openBorder: 'border-indigo-500 shadow-md shadow-indigo-100/50 ring-3 ring-indigo-500/10',
    chevron: 'text-indigo-600',
    selectedBg: 'bg-indigo-50/80 text-indigo-900 border-l-[3px] border-indigo-600 font-bold',
    checkColor: 'text-indigo-600',
  },
  blue: {
    openBorder: 'border-blue-500 shadow-md shadow-blue-100/50 ring-3 ring-blue-500/10',
    chevron: 'text-[#DE5C2B]',
    selectedBg: 'bg-orange-50/80 text-blue-900 border-l-[3px] border-blue-600 font-bold',
    checkColor: 'text-[#DE5C2B]',
  },
  violet: {
    openBorder: 'border-violet-500 shadow-md shadow-violet-100/50 ring-3 ring-violet-500/10',
    chevron: 'text-violet-600',
    selectedBg: 'bg-violet-50/80 text-violet-900 border-l-[3px] border-violet-600 font-bold',
    checkColor: 'text-violet-600',
  },
  orange: {
    openBorder: 'border-[#DE5C2B] shadow-md shadow-orange-100/50 ring-3 ring-[#DE5C2B]/10',
    chevron: 'text-[#DE5C2B]',
    selectedBg: 'bg-orange-50 text-[#9A3412] border-l-[3px] border-[#DE5C2B] font-bold',
    checkColor: 'text-[#DE5C2B]',
  },
};

const PremiumDropdown = ({ 
  value, 
  onChange, 
  options = [], 
  label, 
  labelIcon, 
  placeholder = 'Select...', 
  accent = 'emerald',
  searchable = false,
  searchPlaceholder = 'Search options...',
  creatable = false,
  defaultIcon = null,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const theme = ACCENT_STYLES[accent] || ACCENT_STYLES.emerald;

  // Auto-focus search input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 60);
      }
    }
  }, [isOpen, searchable]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const selectedOption = options.find(opt => {
    const valStr = String(value || '').toLowerCase().trim();
    const optVal = String(opt.value || '').toLowerCase().trim();
    if (optVal === valStr) return true;
    if (opt.aliases && Array.isArray(opt.aliases) && opt.aliases.some(a => String(a).toLowerCase().trim() === valStr)) return true;
    return false;
  });
  const displayLabel = selectedOption ? (selectedOption.shortLabel || selectedOption.label) : (value || placeholder);
  const displayIcon = selectedOption?.icon || (value && defaultIcon ? defaultIcon : null);

  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter(opt => {
        const q = searchQuery.toLowerCase().trim();
        return (
          (opt.label && opt.label.toLowerCase().includes(q)) ||
          (opt.value && String(opt.value).toLowerCase().includes(q)) ||
          (opt.description && opt.description.toLowerCase().includes(q)) ||
          (opt.aliases && Array.isArray(opt.aliases) && opt.aliases.some(a => String(a).toLowerCase().includes(q)))
        );
      })
    : options;

  return (
    <div className={`relative space-y-1.5 ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="text-[11.5px] font-bold text-slate-700 flex items-center gap-1.5 select-none">
          {labelIcon}
          <span>{label}</span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`
          relative w-full px-3.5 py-2.5 text-left rounded-xl text-xs md:text-sm font-semibold
          transition-all duration-200 cursor-pointer
          flex items-center justify-between gap-2 border
          ${isOpen
            ? `bg-white ${theme.openBorder}`
            : 'bg-slate-50/80 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
          }
        `}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {displayIcon && (
            <span className="flex-shrink-0 flex items-center justify-center">
              <OptionIcon icon={displayIcon} size="sm" />
            </span>
          )}
          <span 
            title={typeof displayLabel === 'string' ? displayLabel : (selectedOption?.label || '')}
            className={`truncate ${selectedOption || value ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'}`}
          >
            {displayLabel}
          </span>
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <ChevronDown size={15} className={isOpen ? theme.chevron : 'text-slate-400'} />
        </motion.span>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="
              absolute z-50 mt-1 left-0 w-full
              bg-white/98 backdrop-blur-xl
              border border-slate-200/90
              rounded-2xl shadow-xl shadow-slate-300/30
              py-1.5 overflow-hidden
            "
          >
            {/* Optional Sticky Search Box */}
            {searchable && (
              <div className="p-2 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        e.preventDefault();
                        e.stopPropagation();
                        const exact = filteredOptions.find(o => 
                          (o.value || o.label).toLowerCase() === searchQuery.trim().toLowerCase()
                        );
                        if (exact) {
                          onChange(exact.value);
                        } else if (creatable) {
                          onChange(searchQuery.trim());
                        } else if (filteredOptions.length > 0) {
                          onChange(filteredOptions[0].value);
                        }
                        setIsOpen(false);
                        setSearchQuery('');
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Creatable custom value shortcut at top if user typed something not matching exactly */}
            {creatable && searchQuery.trim() && !filteredOptions.some(o => (o.value || o.label).toLowerCase() === searchQuery.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => {
                  onChange(searchQuery.trim());
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 border-b border-indigo-100 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Sparkles size={13} className="text-indigo-500 flex-shrink-0" />
                  <span>Use: <strong className="font-black text-indigo-950">"{searchQuery.trim()}"</strong></span>
                </span>
                <span className="text-[10px] font-black uppercase text-indigo-500 bg-white px-2 py-0.5 rounded-md border border-indigo-200 flex-shrink-0">Enter</span>
              </button>
            )}

            <div 
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="max-h-[260px] overflow-y-auto overscroll-contain custom-scrollbar touch-pan-y"
            >
              {filteredOptions.length === 0 ? (
                <div className="py-6 px-4 text-center space-y-2">
                  <p className="text-xs text-slate-400 font-medium">No matches found for "{searchQuery}"</p>
                  {creatable && searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        onChange(searchQuery.trim());
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Sparkles size={12} />
                      <span>Use: <strong className="font-black">"{searchQuery.trim()}"</strong></span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {filteredOptions.slice(0, 80).map((option, idx) => {
                    const isSelected = String(option.value).toLowerCase() === String(value || '').toLowerCase();
                    return (
                      <button
                        key={option.value || idx}
                        type="button"
                        onClick={() => {
                          onChange(option.value);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`
                          w-full text-left px-3.5 py-2.5 text-xs md:text-sm font-semibold
                          flex items-center gap-2.5 transition-all duration-150 cursor-pointer
                          ${isSelected
                            ? theme.selectedBg
                            : 'text-slate-700 hover:bg-slate-50/90 hover:text-slate-900 border-l-[3px] border-transparent'
                          }
                        `}
                      >
                        {/* Option icon */}
                        {option.icon && (
                          <span className="flex-shrink-0 flex items-center justify-center">
                            <OptionIcon icon={option.icon} />
                          </span>
                        )}

                        {/* Option text */}
                        <span className="flex-1 min-w-0">
                          <span className={`block truncate ${isSelected ? 'font-black' : 'font-bold'}`}>
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="block text-[11px] font-medium text-slate-400 truncate mt-0.5">
                              {option.description}
                            </span>
                          )}
                        </span>

                        {/* Checkmark */}
                        {isSelected && (
                          <span className="flex-shrink-0">
                            <Check size={14} className={theme.checkColor} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {filteredOptions.length > 80 && (
                    <div className="py-2 px-3 text-center border-t border-slate-100 bg-slate-50/70 text-[10.5px] font-bold text-slate-400">
                      Showing top 80 of {filteredOptions.length} results • Type to narrow search
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumDropdown;
