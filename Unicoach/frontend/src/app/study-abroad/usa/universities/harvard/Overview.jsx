import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, GraduationCap, Clock, ArrowRight, CheckCircle2, 
  Award, ChevronDown, ChevronUp, BookOpen, Trophy, Globe
} from 'lucide-react';

const formatCategory = (cat) => {
  if (!cat) return '';
  const trimmed = cat.trim();
  if (trimmed.toLowerCase().startsWith('in ')) return trimmed;
  return `In ${trimmed}`;
};

const getPublisherBadge = (publisher) => {
  const p = publisher.toLowerCase();
  if (p.includes('times')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shadow-2xs">
        <Star size={20} className="fill-indigo-600 text-indigo-600" />
      </div>
    );
  }
  if (p.includes('us news')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center text-[10px] font-black tracking-tight uppercase shadow-2xs leading-none px-1 text-center">
        US News
      </div>
    );
  }
  if (p.includes('qs')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100/80 flex items-center justify-center shadow-2xs">
        <Trophy size={20} />
      </div>
    );
  }
  if (p.includes('webometrics')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#DE5C2B] border border-orange-100/80 flex items-center justify-center shadow-2xs">
        <Globe size={20} />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shadow-2xs">
      <Award size={20} />
    </div>
  );
};

const Overview = ({ data }) => {
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showMoreIntakes, setShowMoreIntakes] = useState(false);
  const [showMoreRequirements, setShowMoreRequirements] = useState(false);
  const [showMoreRankings, setShowMoreRankings] = useState(false);

  const topCoursesList = data?.topCourses || [
    { name: "Architecture", count: 1 },
    { name: "Data Science", count: 1 },
    { name: "Engineering Science", count: 1 },
    { name: "Political Science", count: 2 },
    { name: "Teaching / Education studies", count: 1 }
  ];

  const intakeList = data?.intakeDeadlines || [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ];

  const requirementsList = data?.requirements || [
    { title: "TOEFL iBT Score", detail: "100+ minimum cutoff required for English proficiency verification." },
    { title: "IELTS Academic Band", detail: "7.5+ minimum band required for admission." },
    { title: "GRE General Score", detail: "Recommended for all engineering and scientific computational streams." },
    { title: "Undergraduate Degree", detail: "16 years of prior education expected with a GPA of 3.8+." }
  ];

  const rankingsData = data?.rankings || {
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "2" },
      { category: "Best University Ranking Schools - 2022", rank: "2" }
    ],
    "US News": [
      { category: "Best National Schools - 2025", rank: "3" },
      { category: "Best World Ranking Schools - 2023", rank: "1" },
      { category: "Best University Ranking Schools - 2022", rank: "2" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "4" },
      { category: "Best World Ranking Schools - 2023", rank: "5" },
      { category: "Best World Ranking Schools - 2022", rank: "5" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "1" }
    ]
  };

  // Filtered lists based on toggle states
  const visibleCourses = showAllCourses ? topCoursesList : topCoursesList.slice(0, 3);
  const visibleIntakes = showMoreIntakes ? intakeList : intakeList.slice(0, 2);
  const visibleRequirements = showMoreRequirements ? requirementsList : requirementsList.slice(0, 2);
  
  const rankingEntries = Object.entries(rankingsData);
  const visibleRankings = showMoreRankings ? rankingEntries : rankingEntries.slice(0, 2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
      
      {/* LEFT CONTENT COLUMN */}
      <div className="space-y-8">
        
        {/* 1. HIGHLIGHTS SECTION */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-[28px] p-6 md:p-8 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Star size={20} className="fill-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Highlights</h2>
              <p className="text-xs text-indigo-100 font-medium">Here are the key details related to studying in USA</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <span className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider block">Established In</span>
              <span className="text-2xl font-black text-white mt-1 block">{data?.established || 1636}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <span className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider block">Total No. of Students</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {data?.totalStudents ? data.totalStudents.toLocaleString() : '57,786'}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <span className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider block">Total International Students</span>
              <span className="text-2xl font-black text-amber-300 mt-1 block">
                {data?.intlStudents ? data.intlStudents.toLocaleString() : '7,274'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. TOP COURSES SECTION */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <GraduationCap size={22} className="text-indigo-600" />
              Top Courses & Programs
            </h2>
            <button 
              onClick={() => setShowAllCourses(!showAllCourses)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showAllCourses ? 'Show less' : 'Show all'}</span>
              {showAllCourses ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {visibleCourses.map((c, i) => (
              <span key={i} className="text-xs font-extrabold px-4 py-2 bg-indigo-50/90 border border-indigo-150 text-indigo-900 rounded-xl hover:bg-indigo-100 transition-colors">
                {c.name} <span className="text-indigo-600 font-black">({c.count})</span>
              </span>
            ))}
          </div>

          {/* Sample Course Preview Card */}
          <div className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
                <BookOpen size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">Master Of Architecture I</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold mt-1">
                  <Clock size={13} className="text-indigo-600" />
                  <span>42 Months</span>
                </div>
              </div>
            </div>
            <Link 
              to="/contact?tab=courses"
              className="px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 font-black text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] whitespace-nowrap"
            >
              See all courses
            </Link>
          </div>
        </div>

        {/* 3. INTAKES & ADMISSION DEADLINES SECTION */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Intakes and Admission Deadlines</h2>
            <button 
              onClick={() => setShowMoreIntakes(!showMoreIntakes)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showMoreIntakes ? 'Show less' : 'Show more'}</span>
              {showMoreIntakes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {visibleIntakes.map((intake, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-indigo-300 transition-colors">
                <span className="font-black text-slate-900 text-sm">{intake.name}</span>
                <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-black rounded-lg uppercase tracking-wider">
                  {intake.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. ADMISSION REQUIREMENTS SECTION */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Admission Requirements</h2>
            <button 
              onClick={() => setShowMoreRequirements(!showMoreRequirements)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showMoreRequirements ? 'Show less' : 'Show more'}</span>
              {showMoreRequirements ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="space-y-4">
            {visibleRequirements.map((req, i) => (
              <div key={i} className="flex items-start gap-3.5 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <CheckCircle2 size={20} className="text-emerald-600 stroke-[2.5] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-black text-slate-900 text-sm">{req.title}</h4>
                  <p className="text-xs text-slate-650 font-bold mt-1 leading-relaxed">{req.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. ACCREDITED RANKINGS SECTION */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-900">Accredited Rankings</h2>
            <button 
              onClick={() => setShowMoreRankings(!showMoreRankings)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showMoreRankings ? 'Show less' : 'Show more'}</span>
              {showMoreRankings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="space-y-8">
            {visibleRankings.map(([publisher, ranks]) => (
              <div key={publisher} className="border-b border-slate-100 last:border-0 pb-8 last:pb-0">
                <div className="flex items-center gap-3 mb-5">
                  {getPublisherBadge(publisher)}
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                    {publisher}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ranks.map((r, i) => (
                    <div 
                      key={i} 
                      className="bg-[#F8FAFC] border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-center transition-all hover:border-indigo-200 hover:shadow-xs"
                    >
                      <span className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                        # {r.rank}
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-slate-600 leading-snug">
                        {formatCategory(r.category)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR CTA CARDS */}
      <div className="space-y-6 sticky top-28">
        
        {/* CTA 1: Shortlist Course */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-[28px] p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <GraduationCap size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">Shortlist The Best Course For You</h3>
          <p className="text-xs text-slate-600 font-bold mb-5 leading-relaxed">Get customized university course recommendations matched to your GPA & budget.</p>
          <Link
            to="/contact?action=shortlist"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <span>Shortlist Courses</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* CTA 2: Find Intake */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 border border-purple-100 rounded-[28px] p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Clock size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">Find Your Best Intake</h3>
          <p className="text-xs text-slate-600 font-bold mb-5 leading-relaxed">Get real-time application timeline updates and deadline reminders for Harvard.</p>
          <Link
            to="/contact?action=intake"
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]"
          >
            <span>Check Intake Deadlines</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* CTA 3: Admission Chances */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-100 rounded-[28px] p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Award size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">Know Your Admission Chances</h3>
          <p className="text-xs text-slate-600 font-bold mb-5 leading-relaxed">Evaluate your academic profile against official Harvard admission cutoffs.</p>
          <Link
            to="/contact?action=chances"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <span>Evaluate Profile</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Overview;
