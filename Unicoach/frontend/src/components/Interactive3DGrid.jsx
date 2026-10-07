import React, { useRef, useState, useEffect } from 'react';

/**
 * Interactive3DGrid
 * Full-bleed interactive 3D perspective grid with real-time cursor spotlight,
 * smooth 3D parallax tilt, and glowing intersection markers.
 * Oversized 130% bleed ensures 100% full edge-to-edge coverage with zero corner cut-offs.
 * Supports both 'light' and 'dark' themes.
 */
const Interactive3DGrid = ({ className = '', gridSize = 56, theme = 'light', fadeBottom = true }) => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const animFrameRef = useRef(null);
  const targetPosRef = useRef({ x: -1000, y: -1000 });
  const currentPosRef = useRef({ x: -1000, y: -1000 });
  const targetTiltRef = useRef({ rotateX: 0, rotateY: 0 });
  const currentTiltRef = useRef({ rotateX: 0, rotateY: 0 });

  const isDark = theme === 'dark';

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 15% bleed compensation so spotlight is pixel-perfect under the cursor
      const bleedX = rect.width * 0.15;
      const bleedY = rect.height * 0.15;

      targetPosRef.current = {
        x: x + bleedX,
        y: y + bleedY
      };
      setIsHovered(true);

      // Subtle, refined 3D tilt: max 2.5 degrees for natural physical depth
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = ((x - centerX) / centerX) * 2.5;
      const rotateX = -((y - centerY) / centerY) * 2.5;
      targetTiltRef.current = { rotateX, rotateY };
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      targetTiltRef.current = { rotateX: 0, rotateY: 0 };
    };

    // Smooth lerp loop for 60-120fps motion
    const updateMotion = () => {
      const lerp = 0.12;
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * lerp;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * lerp;

      const tiltLerp = 0.08;
      currentTiltRef.current.rotateX += (targetTiltRef.current.rotateX - currentTiltRef.current.rotateX) * tiltLerp;
      currentTiltRef.current.rotateY += (targetTiltRef.current.rotateY - currentTiltRef.current.rotateY) * tiltLerp;

      setMousePos({
        x: Math.round(currentPosRef.current.x * 10) / 10,
        y: Math.round(currentPosRef.current.y * 10) / 10
      });

      setTilt({
        rotateX: Math.round(currentTiltRef.current.rotateX * 100) / 100,
        rotateY: Math.round(currentTiltRef.current.rotateY * 100) / 100
      });

      animFrameRef.current = requestAnimationFrame(updateMotion);
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    animFrameRef.current = requestAnimationFrame(updateMotion);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const size = `${gridSize}px ${gridSize}px`;

  // Colors tuned per theme
  const baseLineBg = isDark
    ? 'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)'
    : 'linear-gradient(to right, #CBD5E1 1px, transparent 1px), linear-gradient(to bottom, #CBD5E1 1px, transparent 1px)';

  const spotGlow = isDark
    ? `radial-gradient(circle 420px at ${mousePos.x}px ${mousePos.y}px, rgba(222, 92, 43, 0.28) 0%, rgba(99, 102, 241, 0.14) 45%, transparent 75%)`
    : `radial-gradient(circle 400px at ${mousePos.x}px ${mousePos.y}px, rgba(222, 92, 43, 0.18) 0%, rgba(222, 92, 43, 0.07) 40%, transparent 75%)`;

  const glowLineBg = isDark
    ? 'linear-gradient(to right, rgba(96, 165, 250, 0.75) 1.5px, transparent 1.5px), linear-gradient(to bottom, rgba(96, 165, 250, 0.75) 1.5px, transparent 1.5px)'
    : 'linear-gradient(to right, rgba(222, 92, 43, 0.65) 1.5px, transparent 1.5px), linear-gradient(to bottom, rgba(222, 92, 43, 0.65) 1.5px, transparent 1.5px)';

  const dotBg = isDark
    ? 'radial-gradient(circle 2px at 1px 1px, #60A5FA 100%, transparent 0)'
    : 'radial-gradient(circle 2px at 1px 1px, #DE5C2B 100%, transparent 0)';

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      style={{
        perspective: '1200px',
        ...(fadeBottom ? {
          maskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 98%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 98%)'
        } : {})
      }}
    >
      {/* 3D Tilting Perspective Canvas Wrapper - Oversized 130% for 100% full-bleed coverage */}
      <div
        className="absolute -top-[15%] -left-[15%] w-[130%] h-[130%] transition-transform duration-75 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(1.04) translateZ(0)`,
          transformOrigin: 'center center',
          willChange: 'transform'
        }}
      >
        {/* Layer 1: Base Subtle Architectural Grid (100% Full-Bleed Coverage Across All Corners) */}
        <div
          className={`absolute inset-0 ${isDark ? 'opacity-80' : 'opacity-45'}`}
          style={{
            backgroundImage: baseLineBg,
            backgroundSize: size
          }}
        />

        {/* Layer 2: Dynamic Blue Spotlight Glow Cone */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            background: spotGlow
          }}
        />

        {/* Layer 3: Vibrant Glowing Grid Lines revealed directly under cursor */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? (isDark ? 1 : 0.95) : 0,
            backgroundImage: glowLineBg,
            backgroundSize: size,
            maskImage: `radial-gradient(circle 280px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.5) 45%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle 280px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.5) 45%, transparent 100%)`
          }}
        />

        {/* Layer 4: Intersection Accent Dots / Crosshairs */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? (isDark ? 1 : 0.85) : 0,
            backgroundImage: dotBg,
            backgroundSize: size,
            maskImage: `radial-gradient(circle 240px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle 240px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`
          }}
        />
      </div>
    </div>
  );
};

export default Interactive3DGrid;
