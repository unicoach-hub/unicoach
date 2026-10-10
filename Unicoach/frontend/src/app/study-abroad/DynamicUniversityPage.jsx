import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Globe, Award, DollarSign, Calendar, BookOpen, 
  ExternalLink, CheckCircle2, ShieldCheck, BookmarkCheck,
  GraduationCap, MapPin, Building2, Clock, Sparkles, PhoneCall,
  ArrowLeft, Users, ChevronRight, HelpCircle, FileSpreadsheet
} from 'lucide-react';
import ALL_UNIVERSITIES from '../../data/universities';
import UniversityLogo from '../../components/UniversityLogo';
import { cleanPortalUrl, getUniversityPortalFallback } from '../../utils/urlHelpers';
import { useLead } from '../../context/LeadContext';
import { exportUniversitiesToExcel } from '../../utils/excelExporter';
import { getVerifiedRanking } from '../../utils/ranking';
import { getOfficialRequirements, getGreText, CHECK_SITE } from '../../utils/requirements';
import { getOfficialTuition } from '../../utils/dataSourceLabel';

const DynamicUniversityPage = () => {
  const { countryCode, slug } = useParams();
  const { openModal = () => {} } = useLead() || {};

  // Look up university by slug or name
  const university = ALL_UNIVERSITIES.find(u => {
    if (slug && u.slug && u.slug.toLowerCase() === slug.toLowerCase()) return true;
    if (slug && u.name && u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()) return true;
    if (slug && u._id && u._id.toLowerCase() === slug.toLowerCase()) return true;
    return false;
  }) || ALL_UNIVERSITIES.find(u => countryCode && (u.country?.toLowerCase() === countryCode.toLowerCase() || u.countryName?.toLowerCase() === countryCode.toLowerCase()));

  if (!university) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">University Portal</h2>
          <p className="text-sm text-slate-600">
            We are curating specific page details for this university. You can explore all admission requirements via our intelligent shortlister.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md"
            >
              <Sparkles size={16} /> Open Shortlist Engine
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const uniName = university.name || 'University Profile';
  const countryName = university.countryName || university.country || 'Global';
  const city = university.city || '';
  const ranking = getVerifiedRanking(university);
  // Requirements and acceptance rate only from official sources (other records hold default values)
  const req = getOfficialRequirements(university);
  const acceptanceRate = req.acceptanceRate;
  // Fees only from an official source; estimates/placeholders are never shown as a fee
  const officialTuition = getOfficialTuition(university);
  const minGpa = req.gpaPercent ? `${req.gpaPercent}%` : (req.minScoreText || CHECK_SITE);
  const minIelts = req.englishSource && req.ieltsText ? req.ieltsText : (req.ielts ? `${req.ielts} Band` : (req.ieltsText || CHECK_SITE));
  const minToefl = req.toefl ? `${req.toefl} iBT` : null;
  const greStatus = getGreText(req) || CHECK_SITE;
  const workExp = req.workExp || CHECK_SITE;

  const portalUrl = cleanPortalUrl(
    university.website,
    `${uniName} ${countryName}`
  );

  const coursesList = Array.isArray(university.courses) && university.courses.length > 0
    ? university.courses
    : ['Computer Science & AI', 'Data Science & Analytics', 'Business Administration (MBA)', 'Finance & Quantitative Economics', 'Mechanical & Aerospace Engineering'];

  const degreeLevels = Array.isArray(university.degreeLevels) && university.degreeLevels.length > 0
    ? university.degreeLevels
    : ["Master's Degree (MS/MA/MBA)", "Bachelor's Degree (BS/BA)", "Doctoral (PhD)"];

  const intakes = Array.isArray(university.intakes) && university.intakes.length > 0
    ? university.intakes
    : ['Fall 2026 (Aug/Sep 2026)', 'Spring 2027 (Jan/Feb 2027)'];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Top Breadcrumb Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
          <ChevronRight size={13} />
          <Link to={`/study-abroad/${countryCode || 'usa'}`} className="hover:text-indigo-600 transition capitalize">
            {countryName}
          </Link>
          <ChevronRight size={13} />
          <span className="text-slate-700 truncate">{uniName}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white p-3 flex items-center justify-center flex-shrink-0 shadow-lg">
                <UniversityLogo logo={university.logo} name={uniName} size="w-16 h-16" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {university.type || 'Accredited'} Institution
                  </span>
                  {ranking && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                      <Award size={13} /> {ranking.fullLabel}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {uniName}
                </h1>
                <p className="text-sm text-indigo-200 font-semibold flex items-center gap-1.5">
                  <MapPin size={15} className="text-indigo-400" />
                  {city ? `${city}, ` : ''}{countryName}
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <button
                onClick={() => exportUniversitiesToExcel([university], {
                  filename: `${uniName.replace(/[^a-zA-Z0-9]/g, '_')}_Factsheet.xlsx`,
                  sheetName: 'University Details'
                })}
                className="flex-1 md:flex-initial px-5 py-3.5 rounded-2xl text-xs font-black bg-white/10 hover:bg-white/20 border border-white/20 text-white transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                title="Download complete university factsheet and admission cutoffs in Excel (.xlsx)"
              >
                <FileSpreadsheet size={15} className="text-emerald-400" />
                <span>Factsheet (.xlsx)</span>
              </button>

              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl text-xs font-black bg-white text-slate-900 hover:bg-indigo-50 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                Official Portal <ExternalLink size={14} />
              </a>
              <button
                onClick={() => openModal && openModal()}
                className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall size={14} /> Apply via UniCoach
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Snapshot Metrics */}
          <div className={`grid grid-cols-2 gap-3.5 ${acceptanceRate !== null ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
            {acceptanceRate !== null && (
              <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <p className="text-[10px] font-black uppercase text-slate-400">Acceptance Rate</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">{acceptanceRate}%</p>
                <p className="text-[10px] font-bold text-emerald-600 mt-0.5">US Govt College Scorecard</p>
              </div>
            )}

            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <p className="text-[10px] font-black uppercase text-slate-400">Tuition Fee</p>
              {officialTuition ? (
                <>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{officialTuition.inrText}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">≈ {officialTuition.usdText} · {officialTuition.sourceLabel}</p>
                </>
              ) : (
                <p className="text-sm font-bold text-slate-500 mt-1">{CHECK_SITE}</p>
              )}
            </div>

            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <p className="text-[10px] font-black uppercase text-slate-400">Language Cutoff</p>
              <p className="text-lg font-black text-indigo-600 mt-0.5">{minIelts}</p>
              {minToefl && <p className="text-[10px] font-bold text-slate-500 mt-0.5">TOEFL: {minToefl}</p>}
                {req.englishSource && !req.source && (
                  <a href={req.englishSource.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-[10px] font-bold text-emerald-700 hover:underline mt-1 truncate" title="University-wide minimum for international graduate applicants; some programmes ask for more">
                    Source: {req.englishSource.sourceLabel}
                  </a>
                )}
            </div>

            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <p className="text-[10px] font-black uppercase text-slate-400">GRE / GMAT</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{greStatus}</p>
            </div>
          </div>

          {/* Admission Cutoffs Matrix */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-600" /> Admission Requirements & Eligibility
              </h2>
              {req.source && (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {req.source}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-bold">Minimum Academic Grade (GPA / %)</span>
                <span className="text-slate-900 font-black">{minGpa}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-bold">English Language Proficiency</span>
                <span className="text-slate-900 font-black">{minIelts}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-bold">Standardized Testing</span>
                <span className="text-slate-900 font-black">{greStatus}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-bold">Work Experience Requirement</span>
                <span className="text-slate-900 font-black">{workExp}</span>
              </div>
            </div>
          </div>

          {/* Featured Courses & Degree Levels */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" /> Popular Programs & Study Streams
            </h2>
            <div className="flex flex-wrap gap-2">
              {coursesList.map((course, idx) => (
                <span key={idx} className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 transition">
                  {course}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar (1 Col) */}
        <div className="space-y-6">
          
          {/* Intakes & Deadlines Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-indigo-600" /> Upcoming Intakes
            </h3>
            <div className="space-y-2.5">
              {intakes.map((intake, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {intake}
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Admissions Open
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Apply / Counselling Widget */}
          <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-400" /> Dedicated Guidance
            </div>
            <h3 className="text-xl font-black leading-snug">
              Get an Admit into {uniName} with UniCoach
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our alumni coaches and admissions specialists will evaluate your profile, draft your SOPs, and prepare your visa dossier for 100% success.
            </p>
            <button
              onClick={() => openModal && openModal()}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall size={14} /> Book Free 1-on-1 Strategy Call
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DynamicUniversityPage;
