import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingStages = [
  { emoji: '🎓', text: 'Evaluating Academic Profiles & GPAs...' },
  { emoji: '🏛️', text: 'Shortlisting Top Global Universities...' },
  { emoji: '📝', text: 'Drafting SOPs & Recommendation Letters...' },
  { emoji: '💸', text: 'Securing Scholarships & Financial Aid...' },
  { emoji: '🛂', text: 'Processing Express Visa Applications...' },
  { emoji: '✈️', text: 'Arranging Flight & Pre-Departure Logistics...' }
];

const Loader = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Increment progress from 0 to 100 over 4.2 seconds
    const totalDuration = 4200;
    const intervalTime = 30;
    const totalSteps = totalDuration / intervalTime;
    let step = 0;

    const progressInterval = setInterval(() => {
      step++;
      const currentProgress = Math.min((step / totalSteps) * 100, 100);
      setProgress(currentProgress);
      
      // Calculate stage index based on progress percentage
      const newStageIndex = Math.min(
        Math.floor((currentProgress / 100) * loadingStages.length),
        loadingStages.length - 1
      );
      setStageIndex(newStageIndex);

      if (step >= totalSteps) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onLoadingComplete, 1200); // 1.2s blur exit transition
        }, 300);
      }
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [onLoadingComplete]);

  // SVG Flight Path calculations (quadratic bezier path parameters)
  const P0 = { x: 50, y: 130 };   // Departure
  const P1 = { x: 250, y: 15 };   // Peak control point
  const P2 = { x: 450, y: 130 };  // Destination

  const t = progress / 100;
  // Calculate position coordinates (x, y) along the flight path
  const planeX = (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x;
  const planeY = (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y;

  // Tangents for calculating rotation angle to align the airplane along the curve
  const tx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
  const ty = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
  const planeAngle = Math.atan2(ty, tx) * (180 / Math.PI);

  const textVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }
    }),
  };

  const stageVariants = {
    initial: { y: 15, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
    exit: { y: -15, opacity: 0, transition: { duration: 0.35, ease: "easeIn" } }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.05,
            filter: "blur(25px)",
          }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999999] w-screen h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-[#03030d] overflow-hidden select-none"
        >
          {/* Glowing orbital grid overlays in background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/50 via-[#03030d] to-[#03030d]"></div>
          
          {/* Floating glowing stars */}
          {[...Array(25)].map((_, i) => (
             <motion.div
               key={`star-${i}`}
               initial={{ opacity: Math.random(), scale: Math.random() * 0.4 }}
               animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.4, 1.2, 0.4] }}
               transition={{ duration: 2.5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
               className="absolute w-1 h-1 bg-white rounded-full"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 boxShadow: '0 0 8px 1px rgba(255,255,255,0.7)'
               }}
             />
          ))}

          {/* Central Container */}
          <div className="relative z-10 flex flex-col items-center justify-center max-w-lg w-full px-6">
            
            {/* Spinning Neon Globe wireframe */}
            <motion.div 
              initial={{ scale: 0, opacity: 0, rotate: -150 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.3, type: "spring", bounce: 0.35 }}
              className="relative w-28 h-28 rounded-full mb-8 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(222, 92, 43, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                boxShadow: '0 0 50px 8px rgba(79, 70, 229, 0.25), inset 0 0 20px rgba(139, 92, 246, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {/* Rotating orbital rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-6px] rounded-full border-t-2 border-r-2 border-indigo-400/40"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-12px] rounded-full border-b-2 border-l-2 border-orange-400/30"
              />
              
              <span className="text-4xl drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10">🌍</span>
            </motion.div>

            {/* Glowing boarding pass ticket style card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-full bg-white/5 border border-white/10 rounded-[28px] p-6 backdrop-blur-md mb-8 flex flex-col items-center relative overflow-hidden"
              style={{
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Top ticket info */}
              <div className="flex justify-between w-full border-b border-white/10 pb-4 mb-4 text-[10px] tracking-[0.2em] font-bold text-indigo-300 uppercase">
                <span>Unicoach Airways</span>
                <span>Class: Future Scholar</span>
              </div>

              {/* FROM / TO airports */}
              <div className="flex justify-between items-center w-full px-4 mb-3">
                <div className="text-left">
                  <p className="text-2xl font-black text-white">DEL</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">New Delhi</p>
                </div>
                <div className="flex-1 flex flex-col items-center px-4 relative">
                  <span className="text-xs font-black text-indigo-400 mb-1">{Math.floor(progress)}%</span>
                  {/* Dotted progression bar */}
                  <div className="h-[2px] bg-white/15 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">WLD</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">World Class</p>
                </div>
              </div>

              {/* Dynamic Flight Route SVG with sliding plane */}
              <div className="relative w-full h-[150px] flex items-center justify-center">
                <svg className="absolute w-[490px] h-[150px] pointer-events-none overflow-visible" viewBox="0 0 500 150">
                  <defs>
                    <linearGradient id="glow-path" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Flight curve */}
                  <path
                    d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y}, ${P2.x} ${P2.y}`}
                    fill="transparent"
                    stroke="url(#glow-path)"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                  />

                  {/* Highlight animated path line */}
                  <path
                    d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y}, ${P2.x} ${P2.y}`}
                    fill="transparent"
                    stroke="#a78bfa"
                    strokeWidth="3.5"
                    strokeDasharray="500"
                    strokeDashoffset={500 - (500 * progress) / 100}
                    className="opacity-70 transition-all"
                  />

                  {/* Sliding and tilting plane group */}
                  {progress > 0 && (
                    <g transform={`translate(${planeX}, ${planeY}) rotate(${planeAngle})`}>
                      <g transform="translate(-12, -12)">
                        {/* Paper plane SVG icon */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-[0_0_8px_#818cf8]">
                          <path 
                            d="M21 3L3 10.5L10.5 13.5L13.5 21L21 3Z" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            fill="rgba(255, 255, 255, 0.2)"
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                          <path 
                            d="M10.5 13.5L21 3" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        </svg>
                      </g>
                    </g>
                  )}
                </svg>
              </div>
            </motion.div>

            {/* Title Typography reveal */}
            <div className="flex overflow-hidden mb-5">
              {['U','n','i','C','o','a','c','h'].map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow-lg"
                >
                  {letter}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
                className="text-4xl md:text-5xl font-black text-indigo-500"
              >
                .
              </motion.span>
            </div>

            {/* Current journey stages text accordion */}
            <div className="h-10 mt-2 flex items-center justify-center overflow-hidden w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stageIndex}
                  variants={stageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex items-center gap-2.5 text-indigo-150 text-[13px] md:text-sm font-semibold bg-white/5 border border-white/10 px-5 py-2 rounded-full backdrop-blur-sm shadow-md"
                >
                  <span className="text-base">{loadingStages[stageIndex].emoji}</span>
                  <span className="text-slate-200">{loadingStages[stageIndex].text}</span>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
