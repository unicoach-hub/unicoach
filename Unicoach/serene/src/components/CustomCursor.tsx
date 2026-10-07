import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { GraduationCap, Send } from 'lucide-react';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'visa' | 'study'>('default');

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth trailing spring physics for the cursor
  const springConfig = { damping: 28, stiffness: 280, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Motion values for rotations
  const tasselRotation = useSpring(0, { damping: 15, stiffness: 100 });
  const planeRotation = useSpring(-45, { damping: 18, stiffness: 120 });

  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      cursorX.set(x);
      cursorY.set(y);

      if (!isVisible) setIsVisible(true);

      const now = Date.now();
      const dt = now - lastMousePos.current.time;
      if (dt > 10) {
        const dx = x - lastMousePos.current.x;
        const dy = y - lastMousePos.current.y;
        
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          planeRotation.set(angle);
        } else {
          planeRotation.set(-45);
        }

        const targetTasselRot = Math.max(Math.min(dx * -1.8, 30), -30);
        tasselRotation.set(targetTasselRot);

        lastMousePos.current = { x, y, time: now };
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorAttrEl = target.closest('[data-cursor]');
      const linkEl = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"]');

      if (cursorAttrEl) {
        const type = cursorAttrEl.getAttribute('data-cursor') as 'default' | 'pointer' | 'visa' | 'study';
        setCursorType(type || 'default');
      } else if (linkEl) {
        const href = linkEl.getAttribute('href') || '';
        const text = linkEl.textContent?.toLowerCase() || '';
        if (href.includes('study-abroad') || href.includes('destinations') || text.includes('university') || text.includes('counseling')) {
          setCursorType('study');
        } else if (href.includes('visa') || href.includes('contact') || href.includes('book')) {
          setCursorType('visa');
        } else {
          setCursorType('pointer');
        }
      } else {
        setCursorType('default');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible, tasselRotation, planeRotation]);

  if (typeof window === 'undefined') return null;

  const cursorStyles = {
    default: {
      scale: 1.0,
      color: '#4f46e5', // Indigo
    },
    pointer: {
      scale: 1.25,
      color: '#2563eb', // Blue
    },
    visa: {
      scale: 1.25,
      color: '#f43f5e', // Rose
    },
    study: {
      scale: 1.3,
      color: '#4f46e5', // Indigo
    }
  };

  const activeStyle = cursorStyles[cursorType] || cursorStyles.default;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center overflow-visible drop-shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
      animate={{
        scale: activeStyle.scale,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      style={{
        x: smoothX,
        y: smoothY,
        translateX: '-50%',
        translateY: '-50%',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <AnimatePresence mode="wait">
        {(cursorType === 'default' || cursorType === 'pointer' || cursorType === 'study') && (
          <motion.div
            key="study-cap"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{ color: activeStyle.color }}
            className="relative flex items-center justify-center pointer-events-none"
          >
            <motion.div
              style={{
                originX: '50%',
                originY: '50%',
                rotate: tasselRotation
              }}
              className="flex items-center justify-center"
            >
              <GraduationCap size={32} strokeWidth={2.2} />
            </motion.div>
          </motion.div>
        )}

        {cursorType === 'visa' && (
          <motion.div
            key="visa-airplane"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{ color: activeStyle.color }}
            className="relative flex items-center justify-center pointer-events-none"
          >
            <motion.div
              style={{ rotate: planeRotation }}
              className="flex items-center justify-center"
            >
              <Send size={26} strokeWidth={2.2} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
