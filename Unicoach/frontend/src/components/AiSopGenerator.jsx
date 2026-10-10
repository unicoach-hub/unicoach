import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, FileText, Download, Copy, Check, RefreshCw, 
  GraduationCap, Globe, BookOpen, Briefcase, Target, Award,
  CheckCircle2, ChevronRight, AlertCircle, Compass, Building
} from 'lucide-react';
import PremiumDropdown from './PremiumDropdown';
import { POPULAR_COURSES, ALL_COUNTRY_OPTIONS } from '../utils/shortlistOptions';
import { getVerifiedRanking } from '../utils/ranking';
import { ALL_UNIVERSITIES } from '../data/universities';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

const AiSopGenerator = ({ initialProfile = {} }) => {
  const { user, token, openLoginModal } = useAuth();

  const [formData, setFormData] = useState({
    fullName: initialProfile.name || '',
    targetCountry: initialProfile.dreamCountry || 'USA',
    targetUniversity: '',
    targetDegree: "Master's",
    targetMajor: initialProfile.dreamCourse || 'Computer Science',
    academicBackground: initialProfile.highestEducation ? `${initialProfile.highestEducation} in Engineering/Science` : '',
    gpaOrScore: initialProfile.targetScore || '8.0 CGPA / 75%',
    workExperience: '1-2 years relevant technical/business experience',
    keyProjects: 'Developed scalable application and led research project in final year',
    careerGoals: 'Lead AI innovation and product architecture in global technology companies',
    specialInterests: 'Machine Learning, Cloud Infrastructure, Sustainable Engineering',
    tone: 'Academic & Professional'
  });

  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [sopResult, setSopResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('full'); // 'full' | 'sections'

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      if (field === 'targetCountry') {
        return {
          ...prev,
          targetCountry: value,
          targetUniversity: '' // Reset selected university when destination country changes
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Resolve readable metadata of selected target country
  const selectedCountryObj = useMemo(() => {
    const raw = String(formData.targetCountry || '').trim().toLowerCase();
    if (!raw) return null;
    return ALL_COUNTRY_OPTIONS.find(c => 
      c.value?.toLowerCase() === raw ||
      c.shortLabel?.toLowerCase() === raw ||
      c.label?.toLowerCase() === raw ||
      (Array.isArray(c.aliases) && c.aliases.some(a => String(a).toLowerCase() === raw))
    );
  }, [formData.targetCountry]);

  const selectedCountryLabel = selectedCountryObj?.shortLabel || selectedCountryObj?.label || formData.targetCountry || 'Selected Destination';

  // Universities filtered specifically by target destination country
  const universityOptions = useMemo(() => {
    const countryRaw = String(formData.targetCountry || '').trim().toLowerCase();
    
    // Country alias mapping for comprehensive matching
    const countryAliases = {
      'usa': ['usa', 'united states', 'us', 'america'],
      'united states': ['usa', 'united states', 'us', 'america'],
      'uk': ['uk', 'united kingdom', 'gb', 'england', 'britain', 'scotland', 'wales'],
      'united kingdom': ['uk', 'united kingdom', 'gb', 'england', 'britain', 'scotland', 'wales'],
      'canada': ['canada', 'ca'],
      'australia': ['australia', 'au'],
      'germany': ['germany', 'de', 'deutschland'],
      'ireland': ['ireland', 'ie'],
      'italy': ['italy', 'it', 'italia'],
      'france': ['france', 'fr'],
      'new zealand': ['new zealand', 'nz', 'new-zealand'],
      'new-zealand': ['new zealand', 'nz', 'new-zealand'],
      'singapore': ['singapore', 'sg'],
      'netherlands': ['netherlands', 'nl', 'holland'],
      'sweden': ['sweden', 'se'],
      'switzerland': ['switzerland', 'ch', 'swiss'],
      'spain': ['spain', 'es', 'espana'],
      'japan': ['japan', 'jp'],
      'south korea': ['south korea', 'korea', 'kr'],
      'china': ['china', 'cn'],
      'india': ['india', 'in'],
      'uae': ['uae', 'united arab emirates', 'dubai', 'ae']
    };

    const aliasList = new Set();
    if (countryRaw) {
      aliasList.add(countryRaw);
      if (countryAliases[countryRaw]) {
        countryAliases[countryRaw].forEach(a => aliasList.add(a.toLowerCase()));
      }
      if (selectedCountryObj) {
        if (selectedCountryObj.value) aliasList.add(selectedCountryObj.value.toLowerCase());
        if (selectedCountryObj.shortLabel) aliasList.add(selectedCountryObj.shortLabel.toLowerCase());
        if (selectedCountryObj.label) aliasList.add(selectedCountryObj.label.toLowerCase());
        if (Array.isArray(selectedCountryObj.aliases)) {
          selectedCountryObj.aliases.forEach(a => aliasList.add(String(a).toLowerCase()));
        }
      }
    }

    const countryMatched = [];
    const seen = new Set();

    for (const u of ALL_UNIVERSITIES) {
      if (!u || !u.name || seen.has(u.name)) continue;

      const uCountry = String(u.country || '').toLowerCase();
      const uCountryName = String(u.countryName || '').toLowerCase();
      const uLocation = String(u.location || '').toLowerCase();

      // Check match against target country aliases
      const isMatch = Array.from(aliasList).some(alias => {
        if (!alias) return false;
        return (
          uCountry === alias ||
          uCountryName === alias ||
          uCountryName.includes(alias) ||
          alias.includes(uCountryName) ||
          uCountry.includes(alias) ||
          uLocation.includes(alias)
        );
      });

      if (isMatch) {
        seen.add(u.name);
        countryMatched.push({
          value: u.name,
          label: u.name,
          shortLabel: u.name,
          description: [`${u.city ? u.city + ', ' : ''}${u.countryName || selectedCountryLabel}`, getVerifiedRanking(u)?.shortLabel].filter(Boolean).join(' • '),
          icon: <GraduationCap size={14} className="text-indigo-600 flex-shrink-0" />,
          aliases: [
            u.city, 
            u.countryName, 
            u.initials, 
            u.name.replace(/University|Institute of Technology|College/gi, '').trim()
          ].filter(Boolean)
        });
      }
    }

    // If destination has indexed universities, return ONLY those universities!
    if (countryMatched.length > 0) {
      return countryMatched;
    }

    // If no destination country selected, show top global universities
    if (!countryRaw) {
      return ALL_UNIVERSITIES.slice(0, 100).map(u => ({
        value: u.name,
        label: u.name,
        shortLabel: u.name,
        description: [`${u.city ? u.city + ', ' : ''}${u.countryName || ''}`, getVerifiedRanking(u)?.shortLabel].filter(Boolean).join(' • '),
        icon: <GraduationCap size={14} className="text-indigo-600 flex-shrink-0" />,
        aliases: [u.city, u.countryName, u.initials].filter(Boolean)
      }));
    }

    // If country selected has no pre-indexed universities, return empty array so user can type any university custom
    return [];
  }, [formData.targetCountry, selectedCountryObj, selectedCountryLabel]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!formData.targetMajor || !formData.targetCountry) {
      setErrorMsg('Please specify your Target Major and Destination Country.');
      return;
    }

    if (!user && !token) {
      if (openLoginModal) {
        openLoginModal({
          title: 'AI Statement of Purpose (SOP) Writer',
          subtitle: 'Sign in free with Google or email to generate customized, Ivy-caliber SOP essays',
          preventRedirect: true,
          onSuccess: () => {
            executeGenerate();
          }
        });
        return;
      }
    }

    executeGenerate();
  };

  const executeGenerate = async () => {
    setLoading(true);
    setErrorMsg('');
    setSopResult(null);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      // Auth = HttpOnly session cookie (sent by installApiFetch); no bearer token in storage
      const headers = { 'Content-Type': 'application/json' };

      const res = await fetch(`${API_URL}/ai/generate-sop`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      clearInterval(stepInterval);

      const data = await res.json();
      if (res.ok && data.data) {
        setSopResult(data.data);
        try {
          const sops = JSON.parse(localStorage.getItem('unicoach_saved_sops') || '[]');
          localStorage.setItem('unicoach_saved_sops', JSON.stringify([{ ...data.data, createdAt: new Date().toISOString(), title: `${formData.targetDegree} in ${formData.targetMajor} (${formData.targetCountry})` }, ...sops.slice(0, 9)]));
        } catch (e) {}
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (err) {
      clearInterval(stepInterval);
      // High-quality offline fallback SOP
      const mockSop = {
        sopText: `STATEMENT OF PURPOSE\n\nTarget Program: ${formData.targetDegree} in ${formData.targetMajor}\nDestination: ${formData.targetCountry}\nCandidate: ${formData.fullName || user?.name || 'Prospective Scholar'}\n\n1. ACADEMIC FOUNDATION & PASSION\nGrowing up with an avid fascination for technical problem-solving, I have continually sought to understand how modern computing and engineering systems operate and scale. During my academic studies in ${formData.academicBackground || 'Engineering & Applied Sciences'}, I maintained an academic record of ${formData.gpaOrScore}, with a focused emphasis on algorithmic foundations, mathematical modeling, and practical laboratory implementations.\n\n2. TECHNICAL EXPERTISE & PROJECTS\nTo bridge academic theory with real-world applications, I actively spearheaded specialized initiatives including: "${formData.keyProjects}". Working on these systems exposed me to core industry development pipelines, scalability constraints, and agile cross-functional collaboration.\n\n3. WHY THIS UNIVERSITY & DESTINATION\nSelecting ${formData.targetUniversity || 'a top-tier research institution'} in ${formData.targetCountry} represents a strategic milestone in my academic development. The department's distinguished faculty, world-class research laboratories, and rigorous graduate curriculum in ${formData.targetMajor} provide the exact ecosystem necessary to pursue cutting-edge research in ${formData.specialInterests}.\n\n4. LONG-TERM CAREER ASPIRATIONS\nFollowing graduation, my objective is to ${formData.careerGoals}. I am confident that the knowledge, mentorship, and global network acquired during this program will empower me to make significant contributions to the technology ecosystem.`,
        sections: [
          { title: "Introduction & Academic Foundation", content: `Having developed a deep conviction for ${formData.targetMajor} during my undergraduate years, I have continuously pursued rigorous coursework and analytical projects.` },
          { title: "Technical Projects & Experience", content: `My hands-on experience includes: ${formData.keyProjects}. These endeavors solidified my engineering intuition and problem-solving velocity.` },
          { title: "Target University Motivation", content: `The faculty research and state-of-the-art facilities at ${formData.targetUniversity || 'your institution'} in ${formData.targetCountry} uniquely align with my interest in ${formData.specialInterests}.` },
          { title: "Future Vision & Career Goals", content: `Post-completion, I plan to: ${formData.careerGoals}, utilizing advanced knowledge gained during this postgraduate tenure.` }
        ]
      };
      setSopResult(mockSop);
      try {
        const sops = JSON.parse(localStorage.getItem('unicoach_saved_sops') || '[]');
        localStorage.setItem('unicoach_saved_sops', JSON.stringify([{ ...mockSop, createdAt: new Date().toISOString(), title: `${formData.targetDegree} in ${formData.targetMajor} (${formData.targetCountry})` }, ...sops.slice(0, 9)]));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!sopResult) return;
    navigator.clipboard.writeText(sopResult.sopText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!sopResult) return;
    const blob = new Blob([sopResult.sopText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SOP_${formData.targetMajor.replace(/\s+/g, '_')}_${formData.targetCountry}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-[32px] bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
            <Sparkles size={14} className="text-amber-400" /> Ivy League & Russell Group AI Standard
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            AI Statement of Purpose (SOP) Generator
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
            Generate high-conviction, personalized admission essays tailored for top global universities in USA, UK, Canada, Australia & Germany with zero cliché openings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Form: Profile Inputs (Expanded 6 Cols on lg, 5 on xl) */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white border border-slate-200/80 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" /> Essay Parameters
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Customize your background and target program</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Destination & Degree Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <PremiumDropdown
                  label="Target Destination"
                  labelIcon={<Globe size={14} className="text-indigo-600" />}
                  value={formData.targetCountry}
                  onChange={(val) => handleInputChange('targetCountry', val)}
                  accent="indigo"
                  searchable={true}
                  searchPlaceholder="Search 160+ countries..."
                  options={ALL_COUNTRY_OPTIONS.filter(c => c.value !== 'All')}
                />
              </div>

              <div>
                <PremiumDropdown
                  label="Target Degree"
                  labelIcon={<GraduationCap size={14} className="text-indigo-600 flex-shrink-0" />}
                  value={formData.targetDegree}
                  onChange={(val) => handleInputChange('targetDegree', val)}
                  accent="indigo"
                  options={[
                    { value: "Master's", label: "Master's (MS / MA / MSc)", shortLabel: "Master's", icon: <GraduationCap size={14} className="text-indigo-600" /> },
                    { value: 'MBA', label: 'MBA / Business Master', shortLabel: 'MBA', icon: <Briefcase size={14} className="text-indigo-600" /> },
                    { value: "Bachelor's", label: "Bachelor's (BS / BA / BEng)", shortLabel: "Bachelor's", icon: <BookOpen size={14} className="text-indigo-600" /> },
                    { value: 'PhD', label: 'PhD / Doctorate', shortLabel: 'PhD / Doctorate', icon: <Award size={14} className="text-indigo-600" /> },
                  ]}
                />
              </div>
            </div>

            {/* Target Major / Program - Full Width */}
            <div>
              <PremiumDropdown
                label="Target Major / Program"
                labelIcon={<BookOpen size={14} className="text-indigo-600 flex-shrink-0" />}
                value={formData.targetMajor}
                onChange={(val) => handleInputChange('targetMajor', val)}
                accent="indigo"
                searchable={true}
                creatable={true}
                defaultIcon={<BookOpen size={14} className="text-indigo-600" />}
                searchPlaceholder="Search or enter major..."
                placeholder="e.g. Computer Science"
                options={POPULAR_COURSES}
              />
            </div>

            {/* Target University & Tone: full width each, so long names and the count badge fit */}
            <div className="grid grid-cols-1 gap-5">
              <div>
                <PremiumDropdown
                  label={
                    <span className="flex items-center justify-between gap-2 w-full">
                      <span className="whitespace-nowrap">Target University</span>
                      {universityOptions.length > 0 && (
                        <span
                          className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60 whitespace-nowrap"
                          title={`${universityOptions.length} universities in ${selectedCountryLabel}`}
                        >
                          {universityOptions.length} universities
                        </span>
                      )}
                    </span>
                  }
                  labelIcon={<GraduationCap size={14} className="text-indigo-600 flex-shrink-0" />}
                  value={formData.targetUniversity}
                  onChange={(val) => handleInputChange('targetUniversity', val)}
                  accent="indigo"
                  searchable={true}
                  creatable={true}
                  defaultIcon={<GraduationCap size={14} className="text-indigo-600 flex-shrink-0" />}
                  searchPlaceholder={
                    universityOptions.length > 0
                      ? `Search ${universityOptions.length} universities in ${selectedCountryLabel} or enter custom...`
                      : `Search or enter university in ${selectedCountryLabel}...`
                  }
                  placeholder={
                    universityOptions.length > 0
                      ? `Select university in ${selectedCountryLabel}...`
                      : `Enter university in ${selectedCountryLabel}...`
                  }
                  options={universityOptions}
                />
              </div>

              <div>
                <PremiumDropdown
                  label="Essay Tone"
                  labelIcon={<Building size={14} className="text-indigo-600 flex-shrink-0" />}
                  value={formData.tone}
                  onChange={(val) => handleInputChange('tone', val)}
                  accent="indigo"
                  options={[
                    { value: 'Academic & Professional', label: 'Academic & Professional', shortLabel: 'Academic & Professional', icon: <Building size={14} className="text-indigo-600" /> },
                    { value: 'Visionary & Ambitious', label: 'Visionary & Ambitious', shortLabel: 'Visionary & Ambitious', icon: <Compass size={14} className="text-indigo-600" /> },
                    { value: 'Research & Technical', label: 'Research & Technical', shortLabel: 'Research & Technical', icon: <Sparkles size={14} className="text-indigo-600" /> },
                    { value: 'Leadership & Storytelling', label: 'Leadership & Storytelling', shortLabel: 'Leadership & Storytelling', icon: <Award size={14} className="text-indigo-600" /> },
                  ]}
                />
              </div>
            </div>

            {/* Academic Background & GPA */}
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-bold text-slate-700 flex items-center gap-1.5">
                <Award size={14} className="text-indigo-600 flex-shrink-0" />
                <span>Academic Background & GPA</span>
              </label>
              <input
                type="text"
                placeholder="e.g. B.Tech Computer Science, 8.2 CGPA from Anna University"
                value={formData.academicBackground}
                onChange={(e) => handleInputChange('academicBackground', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Work Experience */}
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-bold text-slate-700 flex items-center gap-1.5">
                <Briefcase size={14} className="text-indigo-600 flex-shrink-0" />
                <span>Work / Internship Experience</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 2 years as Software Engineer at Infosys working on microservices"
                value={formData.workExperience}
                onChange={(e) => handleInputChange('workExperience', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Key Projects */}
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-bold text-slate-700 flex items-center gap-1.5">
                <Target size={14} className="text-indigo-600 flex-shrink-0" />
                <span>Key Projects & Achievements</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Published IEEE paper on NLP, built AI healthcare prediction app"
                value={formData.keyProjects}
                onChange={(e) => handleInputChange('keyProjects', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Career Goals */}
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-bold text-slate-700 flex items-center gap-1.5">
                <Compass size={14} className="text-indigo-600 flex-shrink-0" />
                <span>Future Career Vision</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Become Senior ML Architect driving healthcare AI automation"
                value={formData.careerGoals}
                onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-xs md:text-sm font-bold transition-all shadow-md shadow-indigo-200/60 hover:shadow-lg hover:shadow-indigo-300/60 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Drafting Statement of Purpose...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Bespoke SOP <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Pane: Generated Result / Empty State (6 Cols on lg, 7 on xl) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          {loading && (
            <div className="bg-white border border-slate-200/70 p-10 rounded-[32px] shadow-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800">Drafting Your Bespoke SOP</h3>
                <p className="text-xs text-slate-400 font-semibold">Our AI consultant is weaving your profile into a persuasive academic narrative</p>
              </div>

              {/* Progress Steps */}
              <div className="max-w-md mx-auto space-y-2.5 text-left">
                {[
                  '1. Analyzing university admissions expectations...',
                  '2. Crafting strong intellectual hook & motivation...',
                  '3. Aligning coursework, projects & work experience...',
                  '4. Polishing academic rhetoric & final tone...'
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${
                      generationStep > idx
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : generationStep === idx + 1
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {generationStep > idx ? (
                      <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0" />
                    )}
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !sopResult && (
            <div className="bg-white border border-dashed border-slate-200 p-12 rounded-[32px] text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <FileText size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-700">No SOP Generated Yet</h3>
                <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                  Fill in your target university and academic parameters on the left, then click <strong>"Generate Bespoke SOP"</strong>.
                </p>
              </div>
            </div>
          )}

          {!loading && sopResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200/80 rounded-[32px] shadow-sm overflow-hidden space-y-6 p-6 md:p-8"
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {sopResult.wordCount || '850'} Words
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700">
                      {sopResult.suggestedTone || formData.tone}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {sopResult.title || 'Statement of Purpose'}
                  </h3>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100"
                  >
                    <Download size={14} /> Download (.txt)
                  </button>
                </div>
              </div>

              {/* View Toggle Tabs */}
              {sopResult.sections && sopResult.sections.length > 0 && (
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <button
                    onClick={() => setActiveTab('full')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeTab === 'full'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Complete Formatted Essay
                  </button>
                  <button
                    onClick={() => setActiveTab('sections')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeTab === 'sections'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Section-by-Section Breakdown ({sopResult.sections.length})
                  </button>
                </div>
              )}

              {/* Tab 1: Full Formatted Text */}
              {activeTab === 'full' && (
                <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs md:text-sm font-medium text-slate-800 leading-relaxed space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar whitespace-pre-line">
                  {sopResult.sopText}
                </div>
              )}

              {/* Tab 2: Section-by-Section */}
              {activeTab === 'sections' && (
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {sopResult.sections.map((sec, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                      <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider">{sec.heading}</h4>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">{sec.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Customization Advice Checklist */}
              {sopResult.customizationAdvice && sopResult.customizationAdvice.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2.5">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" /> Admissions Counsellor Tailoring Checklist
                  </h4>
                  <ul className="space-y-1.5">
                    {sopResult.customizationAdvice.map((tip, i) => (
                      <li key={i} className="text-xs font-semibold text-amber-950 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiSopGenerator;
