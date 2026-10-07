// ════════════════════════════════════════════════════════════════════════════════
// MentorFlashSection.jsx — Mentor-facing "Create in a Flash" accordion
// Mentor-facing "Create in a Flash" section for /unicoach/for-mentors
// ════════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ChevronDown, 
  Zap, 
  Check, 
  Video, 
  MessageSquare, 
  Calendar, 
  Package, 
  Download,
  Clock,
  Sparkles,
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';

const TABS = [
  {
    id: 0,
    number: '01',
    title: 'Offer 1:1 sessions',
    shortDesc: 'Mentorship sessions, consultations, discovery calls - do what you do best',
    fullDesc: 'Seamlessly connect your Google Calendar or Outlook. Set your availability, price, and custom intake questions in under 2 minutes.'
  },
  {
    id: 1,
    number: '02',
    title: 'Setup Priority DM in seconds',
    shortDesc: 'Answer follower queries without filling your schedule, pay-per-message',
    fullDesc: 'Get paid to answer targeted student queries via text or audio note with a guaranteed 24-hour SLA. Zero calendar fatigue.'
  },
  {
    id: 2,
    number: '03',
    title: 'Smart Lead CRM & Dashboard',
    shortDesc: 'Complete mentor dashboard to manage student inquiries, intake notes, and payouts',
    fullDesc: 'Access your dedicated mentor command center. Track all incoming student leads, review custom intake questionnaires, manage booking statuses, and monitor your monthly payouts in real time.'
  },
  {
    id: 3,
    number: '04',
    title: 'Host a webinar',
    shortDesc: 'Connect with 100s of followers at once. Classes, group calls, workshops - do them all',
    fullDesc: 'Sell tickets for group masterclasses, university admission webinars, and live workshops with automated calendar invites.'
  },
  {
    id: 4,
    number: '05',
    title: 'Bundle your services',
    shortDesc: 'Package your 1:1 calls, SOP reviews, and guides into discounted high-converting bundles',
    fullDesc: 'Increase your average order value by combining multiple offerings into one irresistible package for juniors.'
  },
  {
    id: 5,
    number: '06',
    title: 'Sell courses & products',
    shortDesc: 'SOP templates, blocked account checklists, and eBooks with instant automated delivery',
    fullDesc: 'Upload digital files once and generate passive income while you study. 100% automated delivery with 0% platform fee.'
  }
];

const THEME_COLORS = [
  { id: 'coral', bg: 'bg-[#DE5C2B]', hex: '#DE5C2B' },
  { id: 'yellow', bg: 'bg-[#EAB308]', hex: '#EAB308' },
  { id: 'purple', bg: 'bg-[#8B5CF6]', hex: '#8B5CF6' },
  { id: 'teal', bg: 'bg-[#10B981]', hex: '#10B981' }
];

export const MentorFlashSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('coral');

  const activeColorHex = THEME_COLORS.find(c => c.id === selectedTheme)?.hex || '#DE5C2B';

  return (
    <section className="bg-white py-14 sm:py-20 px-4 sm:px-6 lg:px-12 relative overflow-hidden select-none border-b border-slate-100">
      <div className="max-w-[1340px] mx-auto">
        
        {/* ── TWO-COLUMN INTERACTIVE SHOWCASE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* ════════ LEFT COLUMN: HEADER + NUMBERED ACCORDION TABS ════════ */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* ── SECTION HEADER ── */}
            <div className="max-w-xl">
              <h2 className="font-outfit text-3xl sm:text-5xl lg:text-5xl font-black text-[#111111] tracking-tight leading-[1.12] mb-3">
                Create your UniCoach page in a <br className="hidden sm:inline" />
                <span className="text-[#DE5C2B] font-extrabold">flash</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-normal mb-3">
                Start earning $$ by the time you finish reading our website
              </p>
              <Link
                to="/unicoach/apply"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 hover:text-[#DE5C2B] underline decoration-slate-400 underline-offset-4 transition-colors"
              >
                <span>Launch your page</span>
                <ArrowUpRight className="w-4 h-4 text-[#DE5C2B]" />
              </Link>
            </div>

            {/* Accordion Tabs */}
            <div className="space-y-1.5 pt-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-2xl transition-all duration-200 border cursor-pointer ${
                      isActive
                        ? 'bg-orange-50/70 border-orange-200/80 p-3.5 sm:p-4 shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-slate-50 p-2.5 sm:p-3'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <span className={`text-xs font-mono font-bold ${isActive ? 'text-[#DE5C2B]' : 'text-slate-400'}`}>
                          {tab.number}
                        </span>
                        <h3 className="font-outfit text-sm sm:text-base font-black text-slate-900">
                          {tab.title}
                        </h3>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                          isActive ? 'rotate-180 text-[#DE5C2B]' : ''
                        }`}
                      />
                    </div>

                    {/* Expanded Description when active */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 pl-7 pr-2"
                      >
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {tab.shortDesc}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {tab.fullDesc}
                        </p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════════ RIGHT COLUMN: DYNAMIC FLOATING MOCKUP GRAPHIC ════════ */}
          <div className="lg:col-span-6 lg:sticky lg:top-28">
            <div className="bg-[#FAF0EB] rounded-[36px] p-6 sm:p-8 sm:min-h-[460px] flex flex-col justify-center relative shadow-inner shadow-orange-100/50 border border-orange-200/50">
              
              {/* Profile Bar Card */}
              <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-5 flex items-center justify-between gap-3 border border-orange-100/60">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
                    alt="Vivianne"
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-200"
                  />
                  <div>
                    <div className="font-outfit text-sm font-bold text-slate-900 leading-tight">
                      Vivianne Miedema
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400">
                      unicoach.com/@vivianne
                    </div>
                  </div>
                </div>

                {/* Theme Selector Dots */}
                <div className="flex items-center gap-1.5">
                  {THEME_COLORS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTheme(t.id)}
                      className={`w-6 h-6 rounded-md ${t.bg} flex items-center justify-center transition-transform cursor-pointer ${
                        selectedTheme === t.id ? 'scale-110 ring-2 ring-slate-900 shadow-xs' : 'opacity-80 hover:opacity-100'
                      }`}
                      aria-label={`Select ${t.id} theme`}
                    >
                      {selectedTheme === t.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Feature Canvas that switches based on activeTab */}
              <div className="relative min-h-[220px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  
                  {/* TAB 0: 1:1 Sessions */}
                  {activeTab === 0 && (
                    <motion.div
                      key="tab-0"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 items-center"
                    >
                      <div 
                        className="rounded-2xl p-6 sm:p-8 flex items-center justify-center shadow-lg transition-colors"
                        style={{ backgroundColor: activeColorHex }}
                      >
                        <Zap className="w-16 h-16 sm:w-20 sm:h-20 text-white fill-white animate-pulse" />
                      </div>
                      <div className="space-y-2.5">
                        <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xs border border-orange-100 flex items-center gap-2.5 text-left">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                          <span className="text-xs font-bold text-slate-800">
                            New sale | <span className="text-emerald-600 font-black">$30</span>
                          </span>
                        </div>
                        <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xs border border-orange-100 flex items-center gap-2.5 text-left">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-xs font-bold text-slate-800">
                            A new testimonial ★★★★★
                          </span>
                        </div>
                        <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xs border border-orange-100 flex items-center gap-2.5 text-left">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span className="text-xs font-bold text-slate-800">
                            New booking | <span className="text-emerald-600 font-black">$100</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 1: Priority DM */}
                  {activeTab === 1 && (
                    <motion.div
                      key="tab-1"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-white rounded-2xl p-5 shadow-md border border-orange-100 text-left"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                          <MessageSquare className="w-3.5 h-3.5 text-[#DE5C2B]" />
                          Priority Query
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          ⚡ Responds in 24h
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        &ldquo;Hey Vivianne! Can you check if my 8.2 CGPA and GRE 318 qualify for TU Munich Master in Informatics?&rdquo;
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-base font-black text-slate-900">$15 / answer</span>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors"
                        >
                          Ask Question
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: Smart Lead CRM & Dashboard */}
                  {activeTab === 2 && (
                    <motion.div
                      key="tab-leads"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-orange-100 text-left space-y-3"
                    >
                      {/* Dashboard Header Bar */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-100/80 text-[#DE5C2B] flex items-center justify-center font-bold">
                            <LayoutDashboard className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 block leading-tight">
                              Mentor CRM Dashboard
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Live Student Inquiries & Pipeline
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          14 Active Leads
                        </span>
                      </div>

                      {/* 3 Metric Summary Chips */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#FAF9F6] p-2 rounded-xl border border-slate-100 text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Leads</span>
                          <span className="font-outfit text-sm font-black text-slate-900">148</span>
                        </div>
                        <div className="bg-[#FAF9F6] p-2 rounded-xl border border-slate-100 text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Confirmed</span>
                          <span className="font-outfit text-sm font-black text-emerald-600">42 Calls</span>
                        </div>
                        <div className="bg-[#FAF9F6] p-2 rounded-xl border border-slate-100 text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Payout (0% Fee)</span>
                          <span className="font-outfit text-sm font-black text-[#DE5C2B]">₹54,200</span>
                        </div>
                      </div>

                      {/* Lead Table Rows */}
                      <div className="space-y-1.5 pt-1">
                        {/* Lead 1 */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-orange-50/50 border border-slate-100 text-xs transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                              alt="Student"
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-white flex-shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-bold text-slate-900 block truncate leading-tight text-[11.5px]">Aarav Mehta</span>
                              <span className="text-[10px] text-slate-500 truncate">TU Munich • M.Sc. CS</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#DE5C2B] bg-orange-100/80 px-2 py-0.5 rounded-md flex-shrink-0">
                            1:1 Confirmed
                          </span>
                        </div>

                        {/* Lead 2 */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-orange-50/50 border border-slate-100 text-xs transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                              alt="Student"
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-white flex-shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-bold text-slate-900 block truncate leading-tight text-[11.5px]">Priya Sharma</span>
                              <span className="text-[10px] text-slate-500 truncate">Oxford MPP • SOP Review</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md flex-shrink-0">
                            In Review
                          </span>
                        </div>

                        {/* Lead 3 */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-orange-50/50 border border-slate-100 text-xs transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
                              alt="Student"
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-white flex-shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-bold text-slate-900 block truncate leading-tight text-[11.5px]">Rohan Verma</span>
                              <span className="text-[10px] text-slate-500 truncate">Visa Query • Priority DM</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md flex-shrink-0">
                            New Lead
                          </span>
                        </div>
                      </div>

                      {/* Card Footer status info */}
                      <div className="pt-1.5 flex items-center justify-between text-[10.5px] text-slate-400 border-t border-slate-100">
                        <span>Custom intake forms & WhatsApp alerts</span>
                        <span className="text-[#DE5C2B] font-bold flex items-center gap-1">
                          Live Sync <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: Host a Webinar */}
                  {activeTab === 3 && (
                    <motion.div
                      key="tab-3"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-[320px] bg-pink-100/80 rounded-3xl p-4 shadow-md text-left"
                    >
                      <div className="bg-pink-400 rounded-2xl p-4 text-center mb-3 flex items-center justify-center h-28 relative overflow-hidden">
                        <div className="w-16 h-16 rounded-full bg-white/20 absolute -top-4 -left-4" />
                        <div className="bg-white/95 rounded-xl px-4 py-2 shadow-sm text-center">
                          <span className="text-xl">🎓</span>
                          <span className="text-[11px] font-bold text-slate-800 block">Live Cohort</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <h4 className="font-outfit text-sm font-black text-slate-900 leading-snug mb-1">
                          Personal branding workshop
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-400 mb-3 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Tomorrow | 5:00pm
                        </p>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                          <span className="font-outfit text-sm font-black text-slate-900">$5</span>
                          <button
                            type="button"
                            className="px-5 py-1.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors"
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: Bundle Services */}
                  {activeTab === 4 && (
                    <motion.div
                      key="tab-4"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-white rounded-2xl p-5 shadow-md border border-orange-100 text-left"
                    >
                      <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md mb-2">
                        <Package className="w-3 h-3" />
                        BEST VALUE BUNDLE
                      </div>
                      <h4 className="font-outfit text-base font-black text-slate-900 leading-tight mb-2">
                        Complete Germany Admit Package
                      </h4>
                      <ul className="text-[11.5px] text-slate-600 space-y-1 mb-4 font-medium">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          1:1 Video Consultation (45m)
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          SOP Line-by-Line Document Review
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          German Visa & APS Checklist PDF
                        </li>
                      </ul>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs text-slate-400 line-through">$149</span>
                          <span className="font-outfit text-lg font-black text-slate-900">$89</span>
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors"
                        >
                          Get Bundle
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 5: Sell Courses & Products */}
                  {activeTab === 5 && (
                    <motion.div
                      key="tab-5"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-white rounded-2xl p-5 shadow-md border border-orange-100 text-left"
                    >
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#DE5C2B] flex items-center justify-center font-bold text-xl flex-shrink-0">
                          📄
                        </div>
                        <div>
                          <h4 className="font-outfit text-sm font-black text-slate-900 leading-tight">
                            German Visa & APS Toolkit 2026
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium">
                            48-page PDF Guide + Notion Tracker
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 mb-3 flex items-center justify-between">
                        <span>⚡ Instant Automated Download</span>
                        <span className="font-bold text-emerald-600">4.9 ★ (340+)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-outfit text-base font-black text-slate-900">$19</span>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
