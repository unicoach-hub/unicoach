import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building, Globe, Award, CheckCircle2, Info, ArrowLeft, ArrowRight, ArrowUpRight,
  ExternalLink, BookmarkCheck, Calendar, Clock, DollarSign,
  GraduationCap, AlertCircle, FileText, Check, Sparkles, MessageCircle, HelpCircle, Star, ShieldCheck
} from 'lucide-react';
import ALL_UNIVERSITIES from '../data/universities';
import { getCountryMeta, generateUniversityPrograms, getUniversityBadges } from '../utils/courseFinderHelper';
import { getVerifiedRanking } from '../utils/ranking';
import { getDataSourceLabel } from '../utils/dataSourceLabel';
import { getOfficialRequirements, getGreText, CHECK_SITE } from '../utils/requirements';
import { getMentorsForCourseAndUni } from '../data/courseMentors';
import UniversityLogo from '../components/UniversityLogo';
import PriorityDmModal from '../components/PriorityDmModal';
import MentorBookingModal from '../components/MentorBookingModal';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

/**
 * Exact Match to UniCoach Mentors Marketplace Card (Image 1 Benchmark)
 * Matches layout, badges, typography, aspect-square photo, and black pill "Book ↗" button
 */
const CourseMentorCard = ({ mentor, onBook }) => {
  const displayCountry = mentor.country === 'United Kingdom' 
    ? 'UK' 
    : mentor.country === 'United States' 
      ? 'USA' 
      : mentor.country;

  const flagCode = mentor.flagCode || (
    mentor.country?.toLowerCase().includes('uk') || mentor.country?.toLowerCase().includes('united kingdom') ? 'gb' :
    mentor.country?.toLowerCase().includes('germany') ? 'de' :
    mentor.country?.toLowerCase().includes('canada') ? 'ca' :
    mentor.country?.toLowerCase().includes('united states') || mentor.country?.toLowerCase().includes('usa') ? 'us' :
    mentor.country?.toLowerCase().includes('australia') ? 'au' : 'in'
  );

  const ratingDisplay = mentor.rating 
    ? (Math.round(mentor.rating) === mentor.rating ? mentor.rating : mentor.rating.toFixed(1))
    : '5';

  return (
    <div
      onClick={() => onBook(mentor)}
      className="group bg-white rounded-[22px] border border-slate-200/80 hover:border-[#DE5C2B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(222,92,43,0.14)] transition-all duration-300 hover:-translate-y-1 p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden cursor-pointer select-none"
    >
      {/* 1. Square Portrait Photo Container with Badges */}
      <div className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-slate-100 mb-2.5 sm:mb-3 shrink-0">
        <img
          src={mentor.avatar}
          alt={mentor.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
          }}
        />

        {/* Country Flag Pill (Top-Left) */}
        {mentor.country && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-800 border border-black/5 shadow-2xs">
            <img
              src={`https://flagcdn.com/w40/${flagCode}.png`}
              alt={displayCountry}
              className="w-3.5 h-2.5 rounded-2xs object-cover"
            />
            <span className="leading-none">{displayCountry}</span>
          </div>
        )}

        {/* Rating Pill (Top-Right) */}
        <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/95 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[10px] font-black text-slate-800 border border-black/5 shadow-2xs">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span>{ratingDisplay}</span>
        </div>

        {/* Verified Orange Shield Badge (Bottom-Right of Photo) */}
        <div
          className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#DE5C2B] text-white flex items-center justify-center shadow-md ring-2 ring-white"
          title="100% Verified Senior"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* 2. Mentor Details Below Photo */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Mentor Name */}
          <h3 className="font-outfit font-black text-[14px] sm:text-[15px] text-slate-900 group-hover:text-[#DE5C2B] transition-colors truncate leading-snug">
            {mentor.name}
          </h3>

          {/* Subtitle / Headline */}
          <p className="text-[11.5px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
            {mentor.headline || mentor.currentRole}
          </p>

          {/* University / Institute with graduation cap */}
          {(mentor.university || mentor.uniShort) && (
            <div className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold truncate mt-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#DE5C2B] shrink-0" />
              <span className="truncate">{mentor.uniShort || mentor.university}</span>
            </div>
          )}
        </div>

        {/* 3. Bottom Row: SESSIONS FROM on Left, Black "Book ↗" Pill on Right */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block leading-none tracking-wider">
              SESSIONS FROM
            </span>
            <div className="font-outfit text-xs sm:text-[13px] font-black text-slate-900 leading-tight mt-0.5">
              ₹{mentor.startingPriceINR || 499}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBook(mentor);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#111111] group-hover:bg-[#DE5C2B] hover:bg-[#DE5C2B] text-white text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>Book</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CourseDetailsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token, openLoginModal } = useAuth();

  const courseId = searchParams.get('courseId') || '';
  const uniId = searchParams.get('uniId') || '';
  const paramTitle = searchParams.get('title') || '';
  const paramUniName = searchParams.get('uniName') || '';

  const [uni, setUni] = useState(null);
  const [program, setProgram] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);
  const [dmModalData, setDmModalData] = useState(null);
  const [selectedBookingMentor, setSelectedBookingMentor] = useState(null);
  const [isMentorBookingOpen, setIsMentorBookingOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    const load = async () => {
      // 1. Locate the university: live database first, the bundled list only as a fallback.
      //    Never substitute a different university when it isn't found.
      let foundUni = null;
      if (/^[a-f0-9]{24}$/i.test(uniId)) {
        try {
          const res = await fetch(`${API_BASE_URL}/public/universities-data/universities/${uniId}`);
          if (res.ok) foundUni = await res.json();
        } catch {
          // offline: try the bundled list below
        }
      }
      if (!foundUni && uniId) {
        foundUni = ALL_UNIVERSITIES.find(u => String(u._id) === String(uniId) || String(u.id) === String(uniId) || String(u.slug) === String(uniId));
      }
      if (!foundUni && paramUniName) {
        foundUni = ALL_UNIVERSITIES.find(u => u.name.toLowerCase() === paramUniName.toLowerCase());
      }
      if (cancelled) return;
      if (!foundUni) {
        setNotFound(true);
        return;
      }
      setNotFound(false);
      setUni(foundUni);

      // 2. Locate the program among the university's real courses
      const programs = generateUniversityPrograms(foundUni, { searchQuery: paramTitle });
      let foundProg = null;
      if (courseId) {
        foundProg = programs.find(p => p.id === courseId);
      }
      if (!foundProg && paramTitle) {
        foundProg = programs.find(p => p.title.toLowerCase() === paramTitle.toLowerCase())
          || programs.find(p => p.title.toLowerCase().includes(paramTitle.toLowerCase()));
      }
      if (!foundProg) {
        // Keep the course the student clicked, with no invented details
        foundProg = {
          id: courseId || 'course',
          title: paramTitle || 'Program details',
          degreeLevel: null,
          intakesList: [],
          intake: 'Check official site',
          durationText: 'Varies by program',
          tuitionPerYear: programs[0]?.tuitionPerYear || 'Check official site',
          applicationFee: null,
          avgScholarship: null,
          initialDeposit: null,
          officialUrl: foundUni.website || null,
          isRealData: false,
        };
      }
      setProgram(foundProg);
      document.title = `${foundProg.title} | ${foundUni.name} | UniCoach`;
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [courseId, uniId, paramTitle, paramUniName]);

  // Check saved state
  useEffect(() => {
    const savedLocal = localStorage.getItem('unicoach_saved_unis');
    if (savedLocal && uni) {
      try {
        const parsed = JSON.parse(savedLocal);
        setIsSaved(parsed.some(u => u.name === uni.name || u._id === uni._id));
      } catch (e) {}
    }
  }, [uni]);

  const handleToggleSave = () => {
    if (!uni) return;
    const savedLocal = localStorage.getItem('unicoach_saved_unis') || '[]';
    try {
      let list = JSON.parse(savedLocal);
      const exists = list.some(u => u.name === uni.name || u._id === uni._id);
      if (exists) {
        list = list.filter(u => u.name !== uni.name && u._id !== uni._id);
        setIsSaved(false);
        setToastMsg(`Removed ${uni.name} from shortlist`);
      } else {
        list = [...list, { ...uni, savedProgram: program?.title }];
        setIsSaved(true);
        setToastMsg(`Saved ${program?.title} to your shortlist! 🔖`);
      }
      localStorage.setItem('unicoach_saved_unis', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('savedUnisUpdated'));
      setTimeout(() => setToastMsg(''), 3000);
    } catch (e) {}
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] pt-28 pb-16 flex items-center justify-center px-4">
        <div className="text-center space-y-3 max-w-md">
          <p className="text-lg font-bold text-slate-800">We couldn't find this course</p>
          <p className="text-sm text-slate-500">The university may have been updated. Search again to see its current programs.</p>
          <Link to="/universities" className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#DE5C2B] text-white text-sm font-semibold">
            Back to universities
          </Link>
        </div>
      </div>
    );
  }

  if (!uni || !program) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] pt-28 pb-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading course curriculum & requirements...</p>
        </div>
      </div>
    );
  }

  const countryMeta = getCountryMeta(uni.countryName || uni.country);
  const isUK = countryMeta.currency === 'GBP';
  const isUG = program.degreeLevel === 'UG' || program.title.toLowerCase().includes('bsc') || program.title.toLowerCase().includes('beng');
  // Rank only when it was imported from an official ranking file
  const ranking = getVerifiedRanking(uni);
  const mentors = getMentorsForCourseAndUni(uni, program);

  const handleQuickChat = (mentor) => {
    const message = `Hi ${mentor.name}! I found your profile on UniCoach for ${program?.title} at ${uni?.name}. I'm planning my application for ${program?.intake} intake and would love your guidance!`;
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=919876543210&text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBookCall = (mentor) => {
    setSelectedBookingMentor(mentor);
    setIsMentorBookingOpen(true);
  };

  // Only real values; anything we don't hold for this course points the student to the official site.
  // (These used to be fixed figures copied from one Birmingham City University screenshot for EVERY course.)
  const displayTuition = program.tuitionPerYear || CHECK_SITE;
  const displayScholarship = program.avgScholarship || CHECK_SITE;
  const displayDuration = program.durationMonths ? `${program.durationMonths} Month(s)` : (program.durationText || 'Varies by program');
  const displayAppFee = program.applicationFee === 'No Application Fee' ? 'No fee' : (program.applicationFee || CHECK_SITE);
  const displayCampus = uni.city || CHECK_SITE;
  const displayIntakes = Array.isArray(program.intakesList) && program.intakesList.length ? program.intakesList.join(', ') : CHECK_SITE;
  const displayDeadline = CHECK_SITE;

  // English test requirements: only when the course record has a real value
  const pteOverall = CHECK_SITE;
  const pteNoBandLess = '—';
  const toeflOverall = CHECK_SITE;
  const toeflNoBandLess = '—';
  // University-level requirements only when taken from the university's official page (other records hold defaults)
  const req = getOfficialRequirements(uni);
  const ieltsOverall = program.minIeltsScore ? String(program.minIeltsScore) : (req.ielts ? String(req.ielts) : (req.ieltsText || CHECK_SITE));
  const ieltsNoBandLess = '—';
  const greText = getGreText(req);
  const entryRequirement = req.eligibilityText || req.minScoreText || (req.gpaPercent ? `Minimum academic score: ${req.gpaPercent}%` : null);

  // URLs: the real course page when we have one, otherwise the university's own website (never a guessed path)
  const siteUrl = uni.website ? (/^https?:\/\//i.test(uni.website) ? uni.website : `https://${uni.website}`) : null;
  const courseUrl = program.officialUrl && /^https?:\/\//i.test(program.officialUrl) ? program.officialUrl : siteUrl;
  const scholarshipUrl = siteUrl;
  const uniWebDisplay = uni.website ? uni.website.replace(/^https?:\/\//, '').replace(/\/$/, '') : null;

  return (
    <div className="min-h-screen bg-[#F0F2F5] pt-20 pb-20 font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP SUB-NAV BAR (Back Link & Quick Shortlist) */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>Back<span className="hidden sm:inline"> to Search Programs</span></span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSave}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BookmarkCheck size={14} className={isSaved ? 'text-emerald-600' : 'text-slate-400'} />
              <span>{isSaved ? 'Shortlisted ✓' : 'Shortlist'}</span>
            </button>

            <Link
              to={`/contact?university=${encodeURIComponent(uni.name)}&course=${encodeURIComponent(program.title)}`}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1E40AF] hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95"
            >
              <Sparkles size={13} />
              <span><span className="hidden sm:inline">Free </span>Application Support</span>
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTAINER (Exact CourseFinder Screenshot Layout) */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ══════════════════════════════════════════════════════════
              LEFT COLUMN: UNIVERSITY CARD (Matches Screenshot 1)
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              
              {/* University Header Banner with Crest Logo & Verified Badge (No duplicate name!) */}
              <div className="bg-gradient-to-r from-[#4C1D95] via-[#581c87] to-[#3B0764] rounded-xl p-4 sm:p-5 text-white flex items-center gap-3.5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />
                {/* University Crest / Logo */}
                <div className="w-14 h-14 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                  <UniversityLogo logo={uni.logo} name={uni.name} size="w-10 h-10" />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/15 text-purple-100 border border-white/20 mb-1">
                    <ShieldCheck size={11} className="text-emerald-400" />
                    <span>Verified Institution</span>
                  </div>
                  <p className="text-xs text-purple-200 font-medium truncate">
                    {countryMeta.flag} {uni.city || 'Campus'} • {countryMeta.name}
                  </p>
                </div>
              </div>

              {/* University Title & Location Info (Rendered clearly only once!) */}
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                    {uni.name}
                  </h3>
                  <p className="text-slate-500 font-medium mt-1 flex items-center gap-1">
                    <span>{uni.city || 'Campus'}</span>
                    {uni.state && <span>• {uni.state}</span>}
                    <span>• {countryMeta.name}</span>
                  </p>
                </div>

                <div className="space-y-2.5 font-normal pt-2 border-t border-slate-100">
                  {uni.state && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">State / Region</span>
                      <span className="font-semibold text-slate-800">{uni.state}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Country</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>{countryMeta.flag}</span>
                      <span>{countryMeta.name}</span>
                    </span>
                  </div>
                </div>

                {/* Ranking pill: only when the rank was imported from an official ranking file */}
                {ranking ? (
                  <div className="bg-[#EBF3FE] rounded-xl p-3 flex items-center gap-3 border border-blue-100">
                    <span className="px-3 py-1 rounded-lg bg-[#1E3A8A] text-white font-black text-xs shadow-xs">
                      {ranking.label}
                    </span>
                    <span className="font-semibold text-slate-700 text-xs">
                      {ranking.source}
                    </span>
                  </div>
                ) : null}

                {/* Official Website Link */}
                {siteUrl && (
                  <div className="pt-1 text-center">
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition inline-flex items-center gap-1"
                    >
                      <span>{uniWebDisplay}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                VERIFIED ALUMNI & STUDENT MENTORS SECTION (DESKTOP SIDEBAR)
                Hidden on mobile (hidden lg:block) so mobile users aren't flooded
                with double mentors before even reading the course details!
            ══════════════════════════════════════════════════════════ */}
            <div id="mentors" className="hidden lg:block bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#DE5C2B] flex items-center justify-center font-bold shadow-2xs">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <span>COURSE MENTORS</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#DE5C2B] text-white">
                        {mentors.length}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Alumni & Seniors who cracked this course
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Online
                </span>
              </div>

              {/* Exact Marketplace Style Mentor Cards */}
              <div className="space-y-4">
                {mentors.map((m) => (
                  <CourseMentorCard
                    key={m.id}
                    mentor={m}
                    onBook={handleBookCall}
                  />
                ))}
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/unicoach/mentors"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                >
                  <span>Browse All Verified Mentors</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Something's not right? Report update link */}
            <div className="text-center pt-1">
              <a
                href="mailto:support@unicoach.com?subject=Program%20Details%20Update%20Request"
                className="text-xs font-normal text-slate-500 hover:text-slate-700 underline underline-offset-2"
              >
                Something's not right?
              </a>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT COLUMN: FULL GRANULAR COURSE DETAILS (Screenshots 1, 2, 3)
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* 1. TOP HEADER ROW (Program Details & Last Updated) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="text-sm font-semibold text-slate-800">
                Program Details
              </h2>
              {uni.dataSource?.syncedAt ? (
                <span className="text-xs font-normal text-slate-400">
                  {getDataSourceLabel(uni.dataSource.provider)}, updated{' '}
                  {new Date(uni.dataSource.syncedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              ) : (
                <span className="text-xs font-normal text-slate-400">Verify details on the official website</span>
              )}
            </div>

            {/* Program Name & Blue Official URL */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {program.title}
              </h1>
              <div className="pt-1">
                {courseUrl ? (
                  <a
                    href={courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-normal text-blue-600 hover:underline hover:text-blue-800 transition break-all"
                  >
                    {courseUrl}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Official course link not available yet</span>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                FEATURED COURSE MENTORS GALLERY (EXACT IMAGE 1 MATCH)
            ══════════════════════════════════════════════════════════ */}
            <div className="bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-white rounded-2xl border border-orange-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-100/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#DE5C2B] text-white flex items-center justify-center font-bold shadow-xs">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-tight flex items-center gap-2">
                      <span>Connect with Course Alumni Mentors</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#DE5C2B] text-white">
                        {mentors.length} Verified
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Talk directly with seniors who cleared admission for {program.title} at {uni.name}.
                    </p>
                  </div>
                </div>

                <Link
                  to="/unicoach/mentors"
                  className="text-xs font-bold text-[#DE5C2B] hover:text-[#C04A1D] hover:underline flex items-center gap-1 self-start sm:self-center"
                >
                  <span>View All Mentors</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {/* 3-Column Responsive Grid of Exact Marketplace Cards (Image 1 Benchmark) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {mentors.map((m) => (
                  <CourseMentorCard
                    key={`gallery-${m.id}`}
                    mentor={m}
                    onBook={handleBookCall}
                  />
                ))}
              </div>
            </div>

            {/* 2. BOX: PROGRAM DETAILS (Screenshot 1) */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-[#EBF3FE] px-5 py-3 border-b border-blue-100">
                <h3 className="text-xs font-semibold text-slate-800">
                  Program Details
                </h3>
              </div>
              <div className="p-5 text-xs space-y-3 font-normal">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-slate-900">{displayDuration}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500">Campus</span>
                  <span className="font-semibold text-slate-900">{displayCampus}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500">Intakes</span>
                  <span className="font-semibold text-slate-900">{displayIntakes}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500">Application Deadline</span>
                  <span className="font-semibold text-slate-900">{displayDeadline}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500">Application Fee</span>
                  <span className="font-semibold text-slate-900">{displayAppFee}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500">Yearly Tuition Fee</span>
                  <span className="font-semibold text-slate-900">{displayTuition}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500">Average Scholarship</span>
                  <span className="font-semibold text-slate-900">{displayScholarship}</span>
                </div>
              </div>
            </div>

            {/* 3. BOX: ENGLISH PROFICIENCY TEST REQUIREMENTS (Screenshot 1) */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-[#EBF3FE] px-5 py-3 border-b border-blue-100">
                <h3 className="text-xs font-semibold text-slate-800">
                  English Proficiency Test Requirements
                </h3>
              </div>
              <div className="p-5 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">PTE Overall</span>
                      <span className="font-semibold text-slate-900">{pteOverall}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">TOEFL iBT Overall</span>
                      <span className="font-semibold text-slate-900">{toeflOverall}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">IELTS Overall</span>
                      <span className="font-semibold text-slate-900">{ieltsOverall}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">PTE No Bands Less Than</span>
                      <span className="font-semibold text-slate-900">{pteNoBandLess}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">TOEFL iBT no Bands Less Than</span>
                      <span className="font-semibold text-slate-900">{toeflNoBandLess}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">IELTS no Band Less Than</span>
                      <span className="font-semibold text-slate-900">{ieltsNoBandLess}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. BOX: STANDARDIZED TEST REQUIREMENTS (Screenshot 3) */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-[#EBF3FE] px-5 py-3 border-b border-blue-100">
                <h3 className="text-xs font-semibold text-slate-800">
                  Standardized Test Requirements
                </h3>
              </div>
              <div className="p-6 text-center text-xs font-normal text-slate-500">
                {greText ? `GRE: ${greText}` : CHECK_SITE}
              </div>
            </div>

            {/* 5. BOX: ENTRY REQUIREMENTS (Screenshots 2 & 3) */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-[#EBF3FE] px-5 py-3 border-b border-blue-100">
                <h3 className="text-xs font-semibold text-slate-800">
                  Entry Requirements
                </h3>
              </div>
              <div className="p-5 text-xs text-slate-700 leading-relaxed font-normal space-y-2">
                {entryRequirement ? (
                  <>
                    <p>{entryRequirement}</p>
                    <p className="text-slate-400">Source: {req.source}</p>
                  </>
                ) : courseUrl ? (
                  <>
                    <p className="text-slate-500 mb-1">Entry requirements are listed on the university's official website:</p>
                    <a
                      href={courseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-normal text-blue-600 hover:underline hover:text-blue-800 transition break-all"
                    >
                      {courseUrl}
                    </a>
                  </>
                ) : (
                  <span className="text-slate-400">Check the university's official website for entry requirements.</span>
                )}
              </div>
            </div>

            {/* 6. BOX: SCHOLARSHIP DETAILS (Screenshots 2 & 3) */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-[#EBF3FE] px-5 py-3 border-b border-blue-100">
                <h3 className="text-xs font-semibold text-slate-800">
                  Scholarship Details
                </h3>
              </div>
              <div className="p-5 text-xs">
                {scholarshipUrl ? (
                  <>
                    <p className="text-slate-500 mb-1">Scholarships are listed on the university's official website:</p>
                    <a
                      href={scholarshipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-normal text-blue-600 hover:underline hover:text-blue-800 transition break-all"
                    >
                      {scholarshipUrl}
                    </a>
                  </>
                ) : (
                  <span className="text-slate-400">Check the university's official website for scholarships.</span>
                )}
              </div>
            </div>

            {/* 8. ADVISORY & PATHWAYS FOOTER NOTES (Screenshot 2) */}
            <div className="text-xs text-slate-500 leading-relaxed space-y-2 pt-2 pb-6">
              <p className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>The Tuition Fee is subject to change Semester wise, as such for exact Tuition Fee kindly see the Website of the respective University.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Pathways : Students who want to pursue a Graduate Degree through a particular University but are unable to meet the university requirements for the GPA, GRE/GMAT or English Language scores, have to take up an additional academic and language support i.e. pathways in order to ensure the admit and study at the desired University.</span>
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Priority DM / Consultation Modal for Booking Calls */}
      <PriorityDmModal
        isOpen={isDmModalOpen}
        onClose={() => setIsDmModalOpen(false)}
        initialCategory={dmModalData?.category || '1:1 Mentor Guidance'}
        initialMessage={dmModalData?.prefilledMessage || ''}
      />

      {/* Interactive 1:1 Mentor Booking & Checkout Modal with Dual Email Dispatch */}
      <MentorBookingModal
        isOpen={isMentorBookingOpen}
        onClose={() => setIsMentorBookingOpen(false)}
        mentor={selectedBookingMentor}
        course={program}
        university={uni}
      />
    </div>
  );
};

export default CourseDetailsPage;
