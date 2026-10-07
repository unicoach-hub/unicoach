import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUp,
  ShieldCheck,
  Award,
  Globe,
} from 'lucide-react';

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

interface FooterProps {
  onOpenModal?: (serviceTitle?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModalClick = (title: string) => {
    if (onOpenModal) {
      onOpenModal(title);
    }
  };

  return (
    <footer className="relative text-slate-200 border-t border-white/15 pt-12 md:pt-16 pb-10 overflow-hidden bg-[#06040a]">
      {/* 3D Rotating Earth Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute -top-[10%] md:-top-[20%] left-0 w-full h-[140%] md:h-[155%] object-cover object-top z-0 opacity-95 pointer-events-none filter brightness-125 contrast-110"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* Vignette Overlay for maximum contrast and legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06040a]/80 via-black/35 to-[#06040a]/90 z-0 pointer-events-none" />

      {/* Ambient Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(rgba(255,255,255,0.15)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.15)_1.5px,transparent_1.5px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* Main Footer Content Container */}
      <div className="relative max-w-[1320px] mx-auto px-6 md:px-10 z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">
          
          {/* Brand/Bio Column */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-flex items-center select-none mb-5">
              <img 
                src={logoImg} 
                alt="UniCoach Logo" 
                className="h-10 md:h-12 w-auto object-contain brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              />
            </a>
            <p className="text-white/90 text-sm leading-relaxed max-w-sm mb-7 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              Empowering students globally to identify and navigate world-class education options. Premium study abroad counselling, visa services, and test preparation.
            </p>
            
            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: FacebookIcon, name: 'Facebook', href: '#' },
                { icon: TwitterIcon, name: 'Twitter', href: '#' },
                { icon: InstagramIcon, name: 'Instagram', href: '#' },
                { icon: LinkedinIcon, name: 'LinkedIn', href: '#' },
                { icon: YoutubeIcon, name: 'YouTube', href: '#' }
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ y: -3, scale: 1.05 }}
                    className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 hover:border-cyan-300 hover:bg-cyan-500/25 flex items-center justify-center text-white transition-all shadow-lg"
                  >
                    <span className="sr-only">{social.name}</span>
                    <Icon />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="font-extrabold text-white mb-5 text-sm md:text-base uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">Destinations</h4>
            <ul className="space-y-3 text-sm font-medium">
              {['Study in USA', 'Study in UK', 'Study in Canada', 'Study in Australia', 'Study in Ireland', 'Study in Germany', 'Study in France', 'Study in Italy', 'Study in New Zealand'].map((item) => (
                <li key={item}>
                  <button onClick={() => handleModalClick(item)} className="text-white/90 hover:text-cyan-300 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-left cursor-pointer">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Exams */}
          <div>
            <h4 className="font-extrabold text-white mb-5 text-sm md:text-base uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">Exams</h4>
            <ul className="space-y-3 text-sm font-medium">
              {['IELTS Exam', 'GRE General', 'GMAT Focus', 'TOEFL iBT', 'PTE Academic', 'SAT Prep', 'Duolingo DET'].map((item) => (
                <li key={item}>
                  <button onClick={() => handleModalClick(item)} className="text-white/90 hover:text-cyan-300 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-left cursor-pointer">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-extrabold text-white mb-5 text-sm md:text-base uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">Resources</h4>
            <ul className="space-y-3 text-sm font-medium">
              {['CGPA to GPA', 'CGPA to %', 'CGPA to Marks', 'SOP Guides', 'LOR Blogs', 'Student Blogs', 'UniCoach Digest', 'Upcoming Events', 'Newsroom'].map((item) => (
                <li key={item}>
                  <button onClick={() => handleModalClick(item)} className="text-white/90 hover:text-cyan-300 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] text-left cursor-pointer">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-extrabold text-white mb-5 text-sm md:text-base uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">Reach Us</h4>
            <ul className="space-y-3.5 text-xs font-semibold">
              <li className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                 <span className="leading-relaxed text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                   1st Floor, Gali No. 4, Sahil Colony, Jattal road, Sondhapur Village, Panipat, Haryana, India, 132105
                 </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-4 h-4 text-cyan-300 flex-shrink-0 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                <a href="tel:+919518657944" className="text-white/90 hover:text-white transition-colors font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                   +91 95186 57944
                 </a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="w-4 h-4 text-cyan-300 flex-shrink-0 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                <a href="mailto:info@unicoach.in" className="text-white/90 hover:text-white transition-colors font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                   info@unicoach.in
                 </a>
              </li>
              <li className="flex gap-3 items-center">
                <Clock className="w-4 h-4 text-cyan-300 flex-shrink-0 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                <span className="text-white/90 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  Mon - Sat: 9:30 AM - 6:30 PM
                </span>
              </li>
              <li className="pt-2">
                <button onClick={() => handleModalClick('Free Consultation')} className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 text-center cursor-pointer">
                  Book Free Consultation
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Accreditations & Partnerships */}
        <div className="border-t border-white/15 pt-10 pb-8">
          <p className="text-center text-xs uppercase font-extrabold tracking-widest text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] mb-6">
            AUTHORIZED ADMISSIONS CONSULTANT & GLOBAL PARTNER
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1000px] mx-auto">
            {[
              { title: 'British Council', desc: 'Certified Consultant', icon: ShieldCheck },
              { title: 'ICEF Agency', desc: 'Registered Member', icon: Award },
              { title: 'AIRC Network', desc: 'Certified Placement', icon: Globe },
              { title: 'PTE Academic', desc: 'Authorized Partner', icon: ShieldCheck }
            ].map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/20 hover:border-cyan-300 p-4 rounded-2xl transition-all group cursor-default shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white group-hover:bg-cyan-400 group-hover:text-slate-900 transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-sm leading-none mb-1 group-hover:text-cyan-200 transition-colors duration-300">
                      {badge.title}
                    </p>
                    <p className="text-white/60 text-xs font-semibold leading-none">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/15 pt-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/70 text-sm font-semibold">
            © {new Date().getFullYear()} UniCoach Education. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <button onClick={() => handleModalClick('Privacy Policy')} className="text-white/70 hover:text-white text-xs font-bold transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => handleModalClick('Terms of Service')} className="text-white/70 hover:text-white text-xs font-bold transition-colors cursor-pointer">Terms of Service</button>
            <button
              onClick={scrollToTop}
              className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 hover:border-white/60 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 group"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
