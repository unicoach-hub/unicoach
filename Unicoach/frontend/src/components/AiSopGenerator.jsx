import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, FileText, Download, Copy, Check, RefreshCw, 
  GraduationCap, BookOpen, Briefcase, Award,
  CheckCircle2, AlertCircle, Compass, Building
} from 'lucide-react';
import PremiumDropdown from './PremiumDropdown';
import { POPULAR_COURSES, ALL_COUNTRY_OPTIONS } from '../utils/shortlistOptions';
import { getVerifiedRanking } from '../utils/ranking';
import { ALL_UNIVERSITIES } from '../data/universities';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

// Desi Pop form look (same as the Course Finder search card): ink borders, hard shadows, mustard focus ring
const FIELD = 'w-full h-12 px-3 text-[15px] text-[#16130F] bg-white border-2 border-[#16130F] outline-none focus:ring-4 focus:ring-[#F2B705]/50 transition-shadow placeholder:text-[#8A8173]';
const TEXTAREA = 'w-full px-3 py-2.5 text-[15px] leading-relaxed text-[#16130F] bg-white border-2 border-[#16130F] outline-none focus:ring-4 focus:ring-[#F2B705]/50 transition-shadow placeholder:text-[#8A8173]';
const FIELD_RADIUS = { borderRadius: 10 };
// PremiumDropdown (shared) restyled from outside so its label and trigger match the fields above
const DROPDOWN = '[&>label]:!text-[14px] [&>label]:!font-bold [&>button]:!h-12 [&>button]:!text-[15px] [&>button]:!bg-white [&>button]:!border-2 [&>button]:!border-[#16130F]';
const PRIMARY_BTN = 'h-12 px-6 inline-flex items-center justify-center gap-2 text-white text-[15px] font-bold bg-[#16130F] border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer';

const Field = ({ label, children, className = '' }) => (
  <label className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
    {label && <span className="text-[14px] font-bold text-[#16130F]">{label}</span>}
    {children}
  </label>
);

const AiSopGenerator = ({ initialProfile = {} }) => {
  const { user, token, openLoginModal } = useAuth();

  const [formData, setFormData] = useState({
    fullName: initialProfile.name || '',
    targetCountry: initialProfile.dreamCountry || 'USA',
    targetUniversity: '',
    targetDegree: "Master's",
    // Start empty (the inputs show examples): pre-filled sample details would end up in a real SOP
    targetMajor: initialProfile.dreamCourse || '',
    academicBackground: '',
    gpaOrScore: '',
    workExperience: '',
    keyProjects: '',
    careerGoals: '',
    specialInterests: '',
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
          icon: <GraduationCap size={14} className="text-[#DE5C2B] flex-shrink-0" />,
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
        icon: <GraduationCap size={14} className="text-[#DE5C2B] flex-shrink-0" />,
        aliases: [u.city, u.countryName, u.initials].filter(Boolean)
      }));
    }

    // If country selected has no pre-indexed universities, return empty array so user can type any university custom
    return [];
  }, [formData.targetCountry, selectedCountryObj, selectedCountryLabel]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    const missing = [['targetMajor', 'target program'], ['academicBackground', 'academic background'], ['careerGoals', 'career goal']]
      .filter(([k]) => (formData[k] || '').trim().length < 3).map(([, label]) => label);
    if (!formData.targetCountry || missing.length) {
      setErrorMsg(`Please add your ${[...(!formData.targetCountry ? ['destination country'] : []), ...missing].join(', ')}. The SOP is built only from what you write here.`);
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
      // No sample SOP on failure: a made-up essay is worse than none
      setErrorMsg(err.message && !/fetch/i.test(err.message) ? err.message : 'Our AI writer is busy right now. Please try again in a minute.');
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Form card in the Desi Pop look (ink border, hard shadow) */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] p-4 sm:p-6" style={{ borderRadius: 20 }}>
          <p className="mb-4 font-urbanist text-[17px] font-extrabold text-[#16130F]">
            <span className="inline-grid place-items-center w-7 h-7 mr-2 rounded-lg bg-[#DE5C2B] text-white border-2 border-[#16130F] text-[14px]">1</span>Apne baare mein batao
          </p>
          <form onSubmit={handleGenerate} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-[#FCE3DA] border-2 border-[#16130F] text-[14px] font-bold text-[#16130F] flex items-center gap-2" style={{ borderRadius: 12 }}>
                <AlertCircle size={18} className="text-[#D0362E] flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PremiumDropdown
                label="Country *"
                value={formData.targetCountry}
                onChange={(val) => handleInputChange('targetCountry', val)}
                accent="orange"
                className={DROPDOWN}
                searchable={true}
                searchPlaceholder="Search 160+ countries..."
                options={ALL_COUNTRY_OPTIONS.filter(c => c.value !== 'All')}
              />

              <PremiumDropdown
                label="Degree"
                value={formData.targetDegree}
                onChange={(val) => handleInputChange('targetDegree', val)}
                accent="orange"
                className={DROPDOWN}
                options={[
                  { value: "Master's", label: "Master's (MS / MA / MSc)", shortLabel: "Master's", icon: <GraduationCap size={14} className="text-[#DE5C2B]" /> },
                  { value: 'MBA', label: 'MBA / Business Master', shortLabel: 'MBA', icon: <Briefcase size={14} className="text-[#DE5C2B]" /> },
                  { value: "Bachelor's", label: "Bachelor's (BS / BA / BEng)", shortLabel: "Bachelor's", icon: <BookOpen size={14} className="text-[#DE5C2B]" /> },
                  { value: 'PhD', label: 'PhD / Doctorate', shortLabel: 'PhD / Doctorate', icon: <Award size={14} className="text-[#DE5C2B]" /> },
                ]}
              />

              <div className="sm:col-span-2">
                <PremiumDropdown
                  label="Program or major *"
                  value={formData.targetMajor}
                  onChange={(val) => handleInputChange('targetMajor', val)}
                  accent="orange"
                  className={DROPDOWN}
                  searchable={true}
                  creatable={true}
                  defaultIcon={<BookOpen size={14} className="text-[#DE5C2B]" />}
                  searchPlaceholder="Search or enter major..."
                  placeholder="e.g. Computer Science"
                  options={POPULAR_COURSES}
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <PremiumDropdown
                  label="University"
                  value={formData.targetUniversity}
                  onChange={(val) => handleInputChange('targetUniversity', val)}
                  accent="orange"
                  className={DROPDOWN}
                  searchable={true}
                  creatable={true}
                  defaultIcon={<GraduationCap size={14} className="text-[#DE5C2B] flex-shrink-0" />}
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
                {universityOptions.length > 0 && (
                  <span className="text-[13px] font-medium text-[#5B544A] leading-tight">{universityOptions.length} universities in {selectedCountryLabel}</span>
                )}
              </div>

              <div className="sm:col-span-2">
                <PremiumDropdown
                  label="Essay tone"
                  value={formData.tone}
                  onChange={(val) => handleInputChange('tone', val)}
                  accent="orange"
                  className={DROPDOWN}
                  options={[
                    { value: 'Academic & Professional', label: 'Academic & Professional', shortLabel: 'Academic & Professional', icon: <Building size={14} className="text-[#DE5C2B]" /> },
                    { value: 'Visionary & Ambitious', label: 'Visionary & Ambitious', shortLabel: 'Visionary & Ambitious', icon: <Compass size={14} className="text-[#DE5C2B]" /> },
                    { value: 'Research & Technical', label: 'Research & Technical', shortLabel: 'Research & Technical', icon: <Sparkles size={14} className="text-[#DE5C2B]" /> },
                    { value: 'Leadership & Storytelling', label: 'Leadership & Storytelling', shortLabel: 'Leadership & Storytelling', icon: <Award size={14} className="text-[#DE5C2B]" /> },
                  ]}
                />
              </div>

              <Field label="Academic background and GPA *" className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science, 8.2 CGPA from Anna University"
                  value={formData.academicBackground}
                  onChange={(e) => handleInputChange('academicBackground', e.target.value)}
                  className={FIELD}
                  style={FIELD_RADIUS}
                />
              </Field>

              <Field label="Work or internship experience">
                <textarea
                  rows={3}
                  placeholder="e.g. 2 years as Software Engineer at Infosys working on microservices"
                  value={formData.workExperience}
                  onChange={(e) => handleInputChange('workExperience', e.target.value)}
                  className={`${TEXTAREA} resize-none`}
                  style={FIELD_RADIUS}
                />
              </Field>

              <Field label="Key projects and achievements">
                <textarea
                  rows={3}
                  placeholder="e.g. Published IEEE paper on NLP, built AI healthcare prediction app"
                  value={formData.keyProjects}
                  onChange={(e) => handleInputChange('keyProjects', e.target.value)}
                  className={`${TEXTAREA} resize-none`}
                  style={FIELD_RADIUS}
                />
              </Field>

              <Field label="Career goal *" className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="e.g. Become Senior ML Architect driving healthcare AI automation"
                  value={formData.careerGoals}
                  onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                  className={FIELD}
                  style={FIELD_RADIUS}
                />
              </Field>
            </div>

            <button type="submit" disabled={loading} className={`${PRIMARY_BTN} w-full`} style={{ borderRadius: 999 }}>
              {loading ? (
                <><RefreshCw size={16} className="animate-spin" /> Drafting your SOP…</>
              ) : (
                <><Sparkles size={16} /> Generate SOP</>
              )}
            </button>
          </form>
        </div>

        {/* Right Pane: Generated Result / Empty State (6 Cols on lg, 7 on xl) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-6">
          {loading && (
            <div className="bg-white border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] p-6 sm:p-10 text-center space-y-6" style={{ borderRadius: 20 }}>
              <div className="w-16 h-16 rounded-2xl bg-[#F2B705] border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] text-[#16130F] flex items-center justify-center mx-auto animate-pulse">
                <Sparkles size={30} />
              </div>
              <div className="space-y-2">
                <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E]">Likh rahe hain, ruko zara</p>
                <h3 className="font-urbanist text-[22px] font-black tracking-[-0.02em] text-[#16130F]">Drafting Your Bespoke SOP</h3>
                <p className="text-[14px] text-[#5B544A] font-medium">Our AI consultant is weaving your profile into a persuasive academic narrative</p>
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
                    className={`flex items-center gap-3 p-3 text-[14px] font-bold border-2 transition-all ${
                      generationStep > idx
                        ? 'bg-[#DDF3EF] text-[#16130F] border-[#16130F]'
                        : generationStep === idx + 1
                        ? 'bg-[#FFF1B8] text-[#16130F] border-[#16130F] animate-pulse'
                        : 'bg-[#FFF6E5] text-[#8A8173] border-[#16130F]/15'
                    }`}
                    style={{ borderRadius: 12 }}
                  >
                    {generationStep > idx ? (
                      <CheckCircle2 size={18} className="text-[#14837E] flex-shrink-0" />
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
            <div className="bg-[#FFF1B8] border-[3px] border-dashed border-[#16130F] p-8 sm:p-12 text-center space-y-4" style={{ borderRadius: 20 }}>
              <div className="w-16 h-16 rounded-2xl bg-white border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] text-[#DE5C2B] flex items-center justify-center mx-auto -rotate-3">
                <FileText size={28} />
              </div>
              <div className="space-y-1.5">
                <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E]">Abhi kuch nahi likha</p>
                <h3 className="font-urbanist text-[22px] font-black tracking-[-0.02em] text-[#16130F]">No SOP Generated Yet</h3>
                <p className="text-[15px] text-[#3D3830] font-medium max-w-sm mx-auto">
                  Fill in your target university and academic parameters on the left, then click <strong>"Generate SOP"</strong>.
                </p>
              </div>
            </div>
          )}

          {!loading && sopResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] overflow-hidden space-y-6 p-5 md:p-8"
              style={{ borderRadius: 20 }}
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#16130F] pb-5">
                <div className="space-y-2">
                  <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E]">Tumhara SOP taiyaar hai</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[13px] font-black bg-[#F2B705] text-[#16130F] border-2 border-[#16130F]">
                      {sopResult.wordCount || '850'} Words
                    </span>
                    <span className="px-3 py-1 rounded-full text-[13px] font-bold bg-white text-[#16130F] border-2 border-[#16130F]">
                      {sopResult.suggestedTone || formData.tone}
                    </span>
                  </div>
                  <h3 className="font-urbanist text-[22px] font-black tracking-[-0.02em] text-[#16130F] leading-tight">
                    {sopResult.title || 'Statement of Purpose'}
                  </h3>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    onClick={handleCopy}
                    className="h-10 px-4 rounded-full text-[14px] font-bold text-[#16130F] bg-white border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] hover:-translate-y-0.5 transition-transform flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check size={15} className="text-[#14837E]" /> : <Copy size={15} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="h-10 px-4 rounded-full text-[14px] font-bold text-white bg-[#16130F] border-2 border-[#16130F] shadow-[3px_3px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={15} /> Download (.txt)
                  </button>
                </div>
              </div>

              {/* View Toggle Tabs */}
              {sopResult.sections && sopResult.sections.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('full')}
                    className={`px-4 py-2 rounded-full text-[14px] font-bold border-2 border-[#16130F] transition-colors cursor-pointer ${
                      activeTab === 'full'
                        ? 'bg-[#16130F] text-white'
                        : 'bg-white text-[#16130F] hover:bg-[#FFF1B8]'
                    }`}
                  >
                    Complete Formatted Essay
                  </button>
                  <button
                    onClick={() => setActiveTab('sections')}
                    className={`px-4 py-2 rounded-full text-[14px] font-bold border-2 border-[#16130F] transition-colors cursor-pointer ${
                      activeTab === 'sections'
                        ? 'bg-[#16130F] text-white'
                        : 'bg-white text-[#16130F] hover:bg-[#FFF1B8]'
                    }`}
                  >
                    Section-by-Section Breakdown ({sopResult.sections.length})
                  </button>
                </div>
              )}

              {/* Tab 1: Full Formatted Text */}
              {activeTab === 'full' && (
                <div className="p-5 sm:p-6 bg-[#FFF6E5] border-2 border-[#16130F] text-[15px] font-medium text-[#16130F] leading-relaxed space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar whitespace-pre-line" style={{ borderRadius: 14 }}>
                  {sopResult.sopText}
                </div>
              )}

              {/* Tab 2: Section-by-Section */}
              {activeTab === 'sections' && (
                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {sopResult.sections.map((sec, i) => (
                    <div key={i} className="p-4 bg-[#FFF6E5] border-2 border-[#16130F] space-y-1.5" style={{ borderRadius: 14 }}>
                      <h4 className="font-urbanist text-[16px] font-black text-[#B8285B]">{sec.heading}</h4>
                      <p className="text-[15px] font-medium text-[#16130F] leading-relaxed">{sec.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Customization Advice Checklist */}
              {sopResult.customizationAdvice && sopResult.customizationAdvice.length > 0 && (
                <div className="p-5 bg-[#FFF1B8] border-2 border-[#16130F] shadow-[4px_4px_0_#16130F] space-y-2.5" style={{ borderRadius: 14 }}>
                  <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E]">Bhejne se pehle ye check karo</p>
                  <h4 className="font-urbanist text-[17px] font-black text-[#16130F] flex items-center gap-1.5">
                    <Sparkles size={16} className="text-[#DE5C2B]" /> Admissions Counsellor Tailoring Checklist
                  </h4>
                  <ul className="space-y-1.5">
                    {sopResult.customizationAdvice.map((tip, i) => (
                      <li key={i} className="text-[14px] font-semibold text-[#16130F] flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#DE5C2B] border border-[#16130F] mt-1.5 flex-shrink-0" />
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
