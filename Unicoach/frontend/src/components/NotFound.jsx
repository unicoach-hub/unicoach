import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        // Calculate coordinate offsets relative to center
        const { clientWidth, clientHeight } = document.documentElement;
        const x = (e.clientX - clientWidth / 2) / (clientWidth / 2);
        const y = (e.clientY - clientHeight / 2) / (clientHeight / 2);
        setMousePos({ x, y });
    };

    // Parallax values based on offsets
    const rotateX = mousePos.y * 12; // Rotate card up to 12 degrees
    const rotateY = mousePos.x * -12;
    const shiftX = mousePos.x * 20;   // Shift background layers up to 20px
    const shiftY = mousePos.y * 20;

    return (
        <div 
            onMouseMove={handleMouseMove}
            className="min-h-screen w-full bg-slate-950 text-white overflow-hidden relative flex flex-col items-center justify-center py-20 px-6 select-none"
        >
            {/* Retro Dot-Grid Backdrop */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none"></div>

            {/* Glowing Nebulas / Particle Orbs simulating ThreeJS fields */}
            <motion.div 
                style={{ x: shiftX * -0.8, y: shiftY * -0.8 }}
                className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none"
            />
            <motion.div 
                style={{ x: shiftX * 0.8, y: shiftY * 0.8 }}
                className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-[#DE5C2B]/15 blur-[130px] pointer-events-none"
            />

            {/* 3D Interactive Card (Using mouse offsets) */}
            <motion.div 
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="relative max-w-lg w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[40px] shadow-2xl flex flex-col items-center text-center space-y-8 z-10"
            >
                {/* Floating Astronaut graphic */}
                <motion.div 
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="w-32 h-32 text-indigo-400 relative"
                >
                    {/* SVG astronaut floating space */}
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full stroke-[1.2]" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" fill="rgba(99, 102, 241, 0.05)" />
                        <path d="M7 16c0-2.2 2.2-4 5-4s5 1.8 5 4v3H7v-3z" stroke="currentColor" />
                        <path d="M12 2v2M4 12H2M22 12h-2M12 20v2" stroke="currentColor" strokeLinecap="round" />
                        {/* Helmet reflection */}
                        <path d="M11 6.5a2 2 0 0 1 2 0" stroke="currentColor" strokeLinecap="round" />
                    </svg>
                </motion.div>

                {/* Glowing Pulsing neon 404 */}
                <div className="space-y-2 relative">
                    <h1 className="text-8xl md:text-9xl font-black tracking-widest bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_10px_35px_rgba(99,102,241,0.45)]">
                        404
                    </h1>
                    <span className="block text-slate-400 text-xs font-extrabold uppercase tracking-widest">
                        Navigation Beacon Offline
                    </span>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
                        Looks like you're lost in orbit
                    </h3>
                    <p className="text-slate-400 text-xs md:text-sm font-semibold max-w-sm mx-auto leading-relaxed">
                        The study abroad pathway you requested doesn't exist on our servers. Let's redirect you back to base.
                    </p>
                </div>

                {/* Interactive CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-1/2 py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={14} />
                        <span>Go Back</span>
                    </button>
                    
                    <button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-1/2 py-4 rounded-2xl text-slate-900 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 hover:shadow-lg hover:shadow-indigo-500/20 transition-all font-bold text-xs flex items-center justify-center gap-2 cursor-pointer duration-200"
                    >
                        <Home size={14} className="text-slate-900" />
                        <span>Return to Base</span>
                    </button>
                </div>
            </motion.div>

            {/* Simulated scroll guidelines info footer */}
            <div className="absolute bottom-6 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                UniCoach Interactive Console v8.16
            </div>
        </div>
    );
};

export default NotFound;
