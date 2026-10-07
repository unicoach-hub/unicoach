import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MotionLink = motion.create(Link);

const CtaBanner = () => {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse parallax setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax layers
  const planeX = useTransform(smoothMouseX, [-0.5, 0.5], [-40, 40]);
  const planeY = useTransform(smoothMouseY, [-0.5, 0.5], [-40, 40]);
  const capX = useTransform(smoothMouseX, [-0.5, 0.5], [30, -30]);
  const capY = useTransform(smoothMouseY, [-0.5, 0.5], [30, -30]);
  const glowX = useTransform(smoothMouseX, [-0.5, 0.5], [-100, 100]);
  const glowY = useTransform(smoothMouseY, [-0.5, 0.5], [-100, 100]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <section className="py-20 bg-white px-6 md:px-10">
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          mouseX.set(0);
          mouseY.set(0);
        }}
        className="max-w-[1440px] mx-auto rounded-[40px] relative overflow-hidden bg-[#DE5C2B]"
        style={{
          boxShadow: '0 30px 60px -15px rgba(222, 92, 43, 0.4)',
        }}
      >
        {/* Animated Gradient Background Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#DE5C2B] via-[#4f46e5] to-[#7c3aed] opacity-90"></div>

        {/* Dynamic Glow orb following mouse */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-white/20 blur-[120px] rounded-full pointer-events-none"
          style={{ x: glowX, y: glowY, translateX: '-50%', translateY: '-50%' }}
        />

        <div className="relative z-10 px-10 py-16 md:p-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          
          {/* Text Content */}
          <div className="max-w-xl">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight"
            >
              Ready To Take The Leap?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-blue-100 text-lg md:text-xl leading-relaxed mb-10 font-medium max-w-md"
            >
              Join thousands of successful students who trusted UniCoach for their international education journey.
            </motion.p>
            
            <MotionLink 
              to="/book-consultation"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg inline-flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.3)] transition-all group"
            >
              Request free counselling
              <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
            </MotionLink>
          </div>

          {/* Floating Parallax Elements */}
          <div className="hidden md:block relative h-full min-h-[300px]">
            {/* Plane */}
            <motion.div 
              style={{ x: planeX, y: planeY }}
              className="absolute top-[10%] right-[10%] filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
            >
              <motion.div
                animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="150" height="150" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#93c5fd" />
                    </linearGradient>
                    <linearGradient id="shadowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DE5C2B" />
                      <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                    <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
                    </linearGradient>
                  </defs>
                  <path d="M10 130 Q 50 110 100 120" stroke="url(#trailGrad)" strokeWidth="4" strokeLinecap="round" />
                  <path d="M30 160 Q 80 150 130 155" stroke="url(#trailGrad)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M170 30 L60 110 L100 130 Z" fill="url(#shadowGrad)" />
                  <path d="M170 30 L100 130 L115 155 Z" fill="#DE5C2B" />
                  <path d="M170 30 L60 110 L115 155 Z" fill="url(#planeGrad)" />
                </svg>
              </motion.div>
            </motion.div>

            {/* Graduation Cap */}
            <motion.div 
              style={{ x: capX, y: capY }}
              className="absolute bottom-[10%] left-[20%] filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.3)] z-10"
            >
              <motion.div
                animate={{ y: [10, -10, 10], rotate: [8, -8, 8] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <svg width="130" height="130" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e1b4b" />
                      <stop offset="100%" stopColor="#312e81" />
                    </linearGradient>
                    <linearGradient id="tasselGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                  <path d="M60 105 C 60 130, 140 130, 140 105 L 132 125 C 132 140, 68 140, 68 125 Z" fill="url(#capGrad)" stroke="#4f46e5" strokeWidth="2" />
                  <path d="M100 55 L175 85 L100 115 L25 85 Z" fill="url(#capGrad)" stroke="#4f46e5" strokeWidth="3" strokeLinejoin="round" />
                  <path d="M100 62 L160 85 L100 108 L40 85 Z" fill="#312e81" />
                  <ellipse cx="100" cy="85" rx="6" ry="4" fill="#fbbf24" />
                  <path d="M100 85 Q 120 90 145 105" stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M145 105 L150 135 L140 135 Z" fill="url(#tasselGrad)" />
                </svg>
              </motion.div>
            </motion.div>

            {/* Sparkles / Stars */}
            <motion.div 
              style={{ x: capX, y: planeY }}
              className="absolute top-[40%] right-[40%] text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-60"
            >
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}>
                ✨
              </motion.div>
            </motion.div>
          </div>

        </div>
      </motion.div>
    </section>
  );
};

export default CtaBanner;
