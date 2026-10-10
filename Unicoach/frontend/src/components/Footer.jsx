import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '@/assets/blackunicoachlogo.webp';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUp,
  ShieldCheck
} from 'lucide-react';

const FacebookLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XTwitterLogo = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LinkedinLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const YoutubeLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);


const BritishCouncilBadge = ({ className = '' }) => (
  <div
    className={`inline-flex items-center gap-2 bg-white/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs ${className}`}
  >
    <span className="w-6.5 h-6.5 rounded-lg bg-orange-50 text-[#DE5C2B] border border-orange-200/60 flex items-center justify-center flex-shrink-0">
      <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
    </span>
    <span className="leading-tight">
      <span className="block text-slate-900 font-extrabold text-[11.5px]">British Council</span>
      <span className="block text-slate-500 text-[10px] font-semibold">Certified Consultant</span>
    </span>
  </div>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: FacebookLogo,
      href: 'https://facebook.com/unicoach.in',
      colorClass: 'bg-[#1877F2] text-white shadow-xs hover:brightness-110'
    },
    {
      name: 'Twitter',
      icon: XTwitterLogo,
      href: 'https://x.com/unicoach_in',
      colorClass: 'bg-[#0F1419] text-white shadow-xs hover:bg-black'
    },
    {
      name: 'Instagram',
      icon: InstagramLogo,
      href: 'https://www.instagram.com/unicoachglobal/',
      colorClass: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-xs hover:brightness-110'
    },
    {
      name: 'LinkedIn',
      icon: LinkedinLogo,
      href: 'https://www.linkedin.com/company/unicoachglobal/',
      colorClass: 'bg-[#0A66C2] text-white shadow-xs hover:brightness-110'
    },
    {
      name: 'YouTube',
      icon: YoutubeLogo,
      href: 'https://youtube.com/@unicoach',
      colorClass: 'bg-[#FF0000] text-white shadow-xs hover:brightness-110'
    }
  ];

  const destinationLinks = [
    { label: 'Study in USA', path: '/study-abroad/usa' },
    { label: 'Study in UK', path: '/study-abroad/uk' },
    { label: 'Study in Canada', path: '/study-abroad/canada' },
    { label: 'Study in Australia', path: '/study-abroad/australia' },
    { label: 'Study in Ireland', path: '/study-abroad/ireland' },
    { label: 'Study in Germany', path: '/study-abroad/germany' },
    { label: 'Study in France', path: '/study-abroad/france' },
    { label: 'Study in Italy', path: '/study-abroad/italy' },
    { label: 'Study in New Zealand', path: '/study-abroad/new-zealand' },
  ];

  const examLinks = [
    { label: 'IELTS Exam', path: '/exams/ielts' },
    { label: 'GRE General', path: '/exams/gre' },
    { label: 'GMAT Focus', path: '/exams/gmat' },
    { label: 'TOEFL iBT', path: '/exams/toefl' },
    { label: 'PTE Academic', path: '/exams/pte' },
    { label: 'SAT Prep', path: '/exams/sat' },
    { label: 'Duolingo DET', path: '/exams/duolingo' },
  ];

  const resourceLinks = [
    { label: 'CGPA to GPA', path: '/resources/calculators/cgpa-to-gpa' },
    { label: 'CGPA to %', path: '/resources/calculators/cgpa-to-percentage' },
    { label: 'CGPA to Marks', path: '/resources/calculators/cgpa-to-marks' },
    { label: 'SOP Guides', path: '/resources/sop/statement-of-purpose' },
    { label: 'LOR Blogs', path: '/resources/lor/lor-blog' },
    { label: 'Student Blogs', path: '/blogs' },
    { label: 'UniCoach Digest', path: '/unicoach-digest' },
    { label: 'Upcoming Events', path: '/events' },
    { label: 'Newsroom', path: '/newsroom' },
  ];

  return (
    <footer className="relative bg-[#ece3d0] text-slate-700 pt-14 sm:pt-16 pb-10 overflow-hidden border-t border-orange-100/80">

      {/* Background Soft Atmospheric Radiance (Warm Peach) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-orange-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-amber-50/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* ════════ DESKTOP VIEW: EXACT 5-COLUMN REFERENCE LAYOUT ════════ */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 mb-12">

          {/* Column 1: Brand / Bio / Destinations Pills / Social Icons */}
          <div className="lg:col-span-4 pr-4">
            <Link to="/" className="inline-flex items-center select-none mb-3.5">
              <img
                src={logo}
                alt="UniCoach Logo"
                className="h-9 sm:h-10 w-auto object-contain"
                width="164"
                height="40"
                loading="lazy"
                decoding="async"
              />
            </Link>

            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed max-w-sm mb-5 font-normal">
              Empowering students globally to identify and navigate world-class education options. Premium study abroad counselling, visa services, and test preparation.
            </p>

            {/* CONNECT WITH US (Social Icons) */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B]" />
                <span>CONNECT WITH US</span>
              </p>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.94 }}
                      aria-label={social.name}
                      className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition-transform cursor-pointer ${social.colorClass}`}
                    >
                      <Icon />
                    </motion.a>
                  );
                })}
              </div>
              <BritishCouncilBadge className="mt-3.5" />
            </div>
          </div>

          {/* Column 2: DESTINATIONS */}
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-slate-900 mb-4 text-[12px] uppercase tracking-wider">
              DESTINATIONS
            </h4>
            <ul className="space-y-2.5 text-[13px] font-medium">
              {destinationLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-slate-600 hover:text-[#DE5C2B] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: EXAMS */}
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-slate-900 mb-4 text-[12px] uppercase tracking-wider">
              EXAMS
            </h4>
            <ul className="space-y-2.5 text-[13px] font-medium">
              {examLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-slate-600 hover:text-[#DE5C2B] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: RESOURCES */}
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-slate-900 mb-4 text-[12px] uppercase tracking-wider">
              RESOURCES
            </h4>
            <ul className="space-y-2.5 text-[13px] font-medium">
              {resourceLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-slate-600 hover:text-[#DE5C2B] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: REACH US */}
          <div className="lg:col-span-2">
            <h4 className="font-extrabold text-slate-900 mb-4 text-[12px] uppercase tracking-wider">
              REACH US
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex gap-2.5 items-start">
                <MapPin className="w-4 h-4 text-[#DE5C2B] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed text-slate-600 font-medium text-[12px]">
                  1st Floor, Gali No. 4, Sahil Colony, Jattal road, Sondhapur Village, Panipat, Haryana, India, 132105
                </span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone className="w-4 h-4 text-[#DE5C2B] flex-shrink-0" />
                <a href="tel:+919518657944" className="text-slate-700 hover:text-[#DE5C2B] transition-colors font-medium text-[12px]">
                  +91 95186 57944
                </a>
              </li>
              <li className="flex gap-2.5 items-center">
                <Mail className="w-4 h-4 text-[#DE5C2B] flex-shrink-0" />
                <a href="mailto:info@unicoach.in" className="text-slate-700 hover:text-[#DE5C2B] transition-colors font-medium text-[12px]">
                  info@unicoach.in
                </a>
              </li>
              <li className="flex gap-2.5 items-center">
                <Clock className="w-4 h-4 text-[#DE5C2B] flex-shrink-0" />
                <span className="text-slate-600 font-medium text-[12px]">
                  Mon - Sat: 9:30 AM - 6:30 PM
                </span>
              </li>
              <li className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-full bg-[#111111] hover:bg-[#DE5C2B] text-white text-[13px] font-bold transition-all shadow-sm hover:shadow-md hover:shadow-orange-500/20 text-center"
                >
                  Book Free Counselling
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ════════ MOBILE VIEW: LENGTH-OPTIMIZED ACCORDIONS & COMPACT REACH US ════════ */}
        <div className="lg:hidden space-y-6 mb-10">

          {/* Mobile Brand / Bio / Country Pills / Social */}
          <div>
            <Link to="/" className="inline-flex items-center select-none mb-3">
              <img
                src={logo}
                alt="UniCoach Logo"
                className="h-9 w-auto object-contain"
                width="150"
                height="36"
                loading="lazy"
                decoding="async"
              />
            </Link>

            <p className="text-slate-600 text-xs leading-relaxed max-w-sm mb-4 font-normal">
              Empowering students globally to identify and navigate world-class education options. Premium study abroad counselling, visa services, and test preparation.
            </p>

            {/* CONNECT WITH US */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B]" />
                <span>CONNECT:</span>
              </span>
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${social.colorClass}`}
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>
            <BritishCouncilBadge className="mt-3" />
          </div>

          {/* Mobile Compact Multi-Column Grid for Destinations, Exams, Resources */}
          <div className="border-t border-b border-orange-100/80 py-5 my-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-6">

              {/* Column 1: DESTINATIONS */}
              <div>
                <h4 className="font-extrabold text-slate-900 mb-3 text-[11.5px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B]" />
                  <span>DESTINATIONS</span>
                </h4>
                <ul className="space-y-2 text-[12px] font-medium">
                  {destinationLinks.map((item) => (
                    <li key={item.path}>
                      <Link to={item.path} className="text-slate-600 hover:text-[#DE5C2B] transition-colors block leading-snug">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: EXAMS */}
              <div>
                <h4 className="font-extrabold text-slate-900 mb-3 text-[11.5px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B]" />
                  <span>EXAMS</span>
                </h4>
                <ul className="space-y-2 text-[12px] font-medium">
                  {examLinks.map((item) => (
                    <li key={item.path}>
                      <Link to={item.path} className="text-slate-600 hover:text-[#DE5C2B] transition-colors block leading-snug">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3 / Spanning: RESOURCES */}
              <div className="col-span-2 sm:col-span-1 pt-3 sm:pt-0 border-t border-slate-200/60 sm:border-t-0">
                <h4 className="font-extrabold text-slate-900 mb-3 text-[11.5px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B]" />
                  <span>RESOURCES</span>
                </h4>
                <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2 text-[12px] font-medium">
                  {resourceLinks.map((item) => (
                    <li key={item.path}>
                      <Link to={item.path} className="text-slate-600 hover:text-[#DE5C2B] transition-colors block leading-snug">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Mobile REACH US */}
          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-slate-900 text-[12px] uppercase tracking-wider">
              REACH US
            </h4>
            <div className="flex gap-2 items-start text-slate-600 font-medium text-[12px]">
              <MapPin className="w-3.5 h-3.5 text-[#DE5C2B] flex-shrink-0 mt-0.5" />
              <span>1st Floor, Gali No. 4, Sahil Colony, Jattal road, Sondhapur Village, Panipat, Haryana, India, 132105</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-slate-600 font-medium">
              <div className="flex gap-1.5 items-center">
                <Phone className="w-3.5 h-3.5 text-[#DE5C2B] flex-shrink-0" />
                <a href="tel:+919518657944" className="text-slate-700 font-semibold">+91 95186 57944</a>
              </div>
              <span>·</span>
              <div className="flex gap-1.5 items-center">
                <Mail className="w-3.5 h-3.5 text-[#DE5C2B] flex-shrink-0" />
                <a href="mailto:info@unicoach.in" className="text-slate-700 font-semibold">info@unicoach.in</a>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-full bg-[#111111] hover:bg-[#DE5C2B] text-white text-[13px] font-bold shadow-xs transition-colors"
              >
                Book Free Counselling
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="border-t border-orange-100/80 pt-6 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs font-semibold">
            © {new Date().getFullYear()} UniCoach Education. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link to="/privacy-policy" className="text-slate-500 hover:text-[#DE5C2B] text-xs font-bold transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-[#DE5C2B] text-xs font-bold transition-colors">Terms of Service</Link>
            <button
              onClick={scrollToTop}
              className="w-8.5 h-8.5 rounded-lg bg-white border border-slate-200 hover:border-[#111111] hover:bg-[#111111] text-slate-600 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
              title="Scroll to Top"
            >
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
