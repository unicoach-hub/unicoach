import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe, BookOpen, Sparkles, Phone, ArrowUpRight } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface NavbarProps {
  onOpenModal: (serviceTitle?: string) => void;
}

const DESTINATIONS = [
  { name: 'USA', flag: '🇺🇸', label: '4500+ Universities' },
  { name: 'UK', flag: '🇬🇧', label: '150+ Universities' },
  { name: 'Canada', flag: '🇨🇦', label: '100+ Colleges' },
  { name: 'Australia', flag: '🇦🇺', label: '40+ Universities' },
  { name: 'Germany', flag: '🇩🇪', label: 'Tuition-Free Public Unis' },
  { name: 'Ireland', flag: '🇮🇪', label: 'Silicon Docks Hub' },
  { name: 'France', flag: '🇫🇷', label: 'Grandes Écoles' },
];

const EXAMS = [
  { name: 'IELTS Prep', score: 'Target Band 8.0+' },
  { name: 'GRE General', score: 'Target 325+' },
  { name: 'GMAT Focus', score: 'Target 705+' },
  { name: 'TOEFL iBT', score: 'Target 105+' },
  { name: 'PTE Academic', score: 'Target 79+' },
  { name: 'SAT Prep', score: 'Target 1450+' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 py-3 shadow-md'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Left Logo */}
          <a href="#" className="flex items-center group">
            <img
              src={logoImg}
              alt="UniCoach"
              className="h-10 md:h-11 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </a>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-8 relative">
            <div
              className="relative"
              onMouseEnter={() => setActiveMenu('destinations')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 text-sm font-extrabold tracking-wide py-2 transition-colors cursor-pointer">
                <span>Study Abroad</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === 'destinations' ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>

              <AnimatePresence>
                {activeMenu === 'destinations' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-white backdrop-blur-2xl border border-slate-200 rounded-2xl p-5 shadow-2xl z-50"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe size={14} /> Top Destinations
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">500+ Partner Unis</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {DESTINATIONS.map((dest) => (
                        <a
                          key={dest.name}
                          href="#destinations"
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/80 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{dest.flag}</span>
                            <div>
                              <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Study in {dest.name}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{dest.label}</div>
                            </div>
                          </div>
                          <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setActiveMenu('exams')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 text-sm font-extrabold tracking-wide py-2 transition-colors cursor-pointer">
                <span>Test Prep</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === 'exams' ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>

              <AnimatePresence>
                {activeMenu === 'exams' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] bg-white backdrop-blur-2xl border border-slate-200 rounded-2xl p-5 shadow-2xl z-50"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <span className="text-xs font-black text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen size={14} /> Guaranteed Score Prep
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {EXAMS.map((exam) => (
                        <a
                          key={exam.name}
                          href="#services-section"
                          className="p-2.5 rounded-xl hover:bg-purple-50/80 transition-colors group block"
                        >
                          <div className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{exam.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{exam.score}</div>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#services-section" className="text-slate-700 hover:text-indigo-600 text-sm font-extrabold tracking-wide transition-colors">
              Services
            </a>

            <a href="#hq-tour-section" className="text-slate-700 hover:text-indigo-600 text-sm font-extrabold tracking-wide transition-colors">
              Global Offices
            </a>

            <a href="#testimonials" className="text-slate-700 hover:text-indigo-600 text-sm font-extrabold tracking-wide transition-colors">
              Reviews
            </a>
          </nav>

          {/* Right CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+918800567782"
              className="text-slate-700 hover:text-indigo-600 text-xs font-extrabold flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 hover:border-indigo-300 transition-colors"
            >
              <Phone size={13} className="text-indigo-600" />
              <span>+91 88005 67782</span>
            </a>

            <button
              onClick={() => onOpenModal()}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-extrabold text-xs tracking-wider uppercase hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>Book Consultation</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={toggleMenu}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden relative z-50 w-8 h-8 flex flex-col justify-center items-center gap-[6px] focus:outline-none cursor-pointer"
          >
            <span
              className={`w-6 h-[2px] bg-slate-900 rounded-full transition-all duration-300 ${
                isOpen ? 'rotate-45 translate-y-[8px]' : ''
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-slate-900 rounded-full transition-all duration-300 ${
                isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-slate-900 rounded-full transition-all duration-300 ${
                isOpen ? '-rotate-45 -translate-y-[8px]' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMenu}
      />

      <aside
        className={`fixed top-0 right-0 z-40 h-full w-[85%] max-w-[340px] bg-white border-l border-slate-200 p-6 pt-24 flex flex-col justify-between transition-transform duration-500 lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-5 overflow-y-auto">
          <a href="#destinations" onClick={() => setIsOpen(false)} className="text-slate-900 font-extrabold text-lg">
            Study Destinations 🌍
          </a>
          <a href="#services-section" onClick={() => setIsOpen(false)} className="text-slate-900 font-extrabold text-lg">
            Admissions & Visa Services 🎓
          </a>
          <a href="#hq-tour-section" onClick={() => setIsOpen(false)} className="text-slate-900 font-extrabold text-lg">
            Global Headquarters Tour 🏢
          </a>
          <a href="#stats-section" onClick={() => setIsOpen(false)} className="text-slate-900 font-extrabold text-lg">
            Our Achievements 📊
          </a>
          <a href="#testimonials" onClick={() => setIsOpen(false)} className="text-slate-900 font-extrabold text-lg">
            Student Reviews ⭐
          </a>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
          <a
            href="tel:+918800567782"
            className="w-full bg-slate-100 text-slate-800 py-3 rounded-xl text-center text-sm font-extrabold flex items-center justify-center gap-2"
          >
            <Phone size={16} className="text-indigo-600" />
            <span>Call +91 88005 67782</span>
          </a>
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenModal();
            }}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider text-center cursor-pointer shadow-md"
          >
            Book Free Consultation
          </button>
        </div>
      </aside>
    </>
  );
};
