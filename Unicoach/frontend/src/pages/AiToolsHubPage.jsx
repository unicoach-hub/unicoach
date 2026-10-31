import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, GraduationCap, ArrowRight, ShieldCheck, Clock, CheckCircle2, Check,
} from 'lucide-react';
import { useLead } from '../context/LeadContext';
import { HeroBackButton } from '../components/ui/BackButton';
import { StdSign } from '../components/desi/DesiPop';
import { HookBand } from '../components/ui/Infographics';

// Small previews of what each tool actually gives you (sample data, labelled as a sample)
const INK = '#16130F';
const Sample = () => <span className="absolute top-2 right-3 text-[10px] font-semibold text-[#8A8275]">Sample</span>;

// SOP: the sections a good SOP needs, each one tagged as the AI fills it in
const SopSheet = () => {
  const parts = [
    { tag: 'Opening hook', c: '#D9573F', soft: '#FCE9E4', w: ['92%', '70%'] },
    { tag: 'Why this course', c: '#2F5BFF', soft: '#E7EDFF', w: ['88%', '60%'] },
    { tag: 'Projects & skills', c: '#6D3FE0', soft: '#EEE8FD', w: ['95%', '78%'] },
    { tag: 'Career goal', c: '#0F9F8F', soft: '#DDF5F1', w: ['84%', '52%'] },
  ];
  return (
    <div className="absolute inset-0 grid place-items-center p-5">
      <div className="w-full max-w-[300px] bg-white rounded-xl border border-[#E6E0D4] shadow-[0_18px_40px_-20px_rgba(22,19,15,0.35)] p-4 -rotate-[1.5deg] group-hover:rotate-0 transition-transform duration-500">
        <p className="text-[12px] font-bold" style={{ color: INK }}>Statement of Purpose</p>
        <p className="text-[10px] text-[#8A8275] mb-3">MS Computer Science · Northeastern</p>
        <div className="space-y-2.5">
          {parts.map((p) => (
            <div key={p.tag} className="pl-2.5 border-l-[3px]" style={{ borderColor: p.c }}>
              <span className="inline-block text-[9.5px] font-bold px-1.5 py-0.5 rounded mb-1" style={{ background: p.soft, color: p.c }}>{p.tag}</span>
              {p.w.map((w, i) => <span key={i} className="block h-[5px] rounded-full bg-[#ECE7DE] mb-1" style={{ width: w }} />)}
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2.5 border-t border-dashed border-[#E6E0D4] flex items-center justify-between text-[10px]">
          <span className="font-semibold text-[#5B544A]">820 / 1000 words</span>
          <span className="inline-flex items-center gap-1 font-bold text-[#0F9F8F]"><CheckCircle2 size={11} /> Original</span>
        </div>
      </div>
    </div>
  );
};

// Visa mock: the officer asks, you answer, the answer gets feedback
const VisaChat = () => (
  <div className="absolute inset-0 px-4 pt-7 pb-3 flex flex-col gap-2 justify-center" style={{ background: '#EEF2FF' }}>
    <Sample />
    <div className="self-start max-w-[82%] bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm border border-[#DCE3FA]">
      <p className="text-[9.5px] font-bold text-[#2F5BFF] mb-0.5">Visa officer</p>
      <p className="text-[11.5px] leading-snug" style={{ color: INK }}>Why this university?</p>
    </div>
    <div className="self-end max-w-[82%] rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm" style={{ background: '#2F5BFF' }}>
      <p className="text-[11.5px] leading-snug text-white">Its co-op term fits my plan to work in data at home.</p>
    </div>
    <div className="self-end inline-flex items-center gap-1.5 bg-white rounded-full px-2.5 py-1 text-[10px] font-bold border border-[#DCE3FA]" style={{ color: '#0F9F8F' }}>
      <Check size={11} strokeWidth={3} /> Clear and specific · add one career detail
    </div>
  </div>
);

// IELTS: the essay comes back with marked fixes
const EssayMarks = () => (
  <div className="absolute inset-0 px-4 pt-7 pb-3 flex flex-col justify-center" style={{ background: '#E9F7F4' }}>
    <Sample />
    <div className="bg-white rounded-xl border border-[#CDEDE6] p-3 shadow-sm">
      <p className="text-[9.5px] font-bold text-[#0F9F8F] mb-1.5">Task 2 · your essay</p>
      <p className="text-[11.5px] leading-[1.7]" style={{ color: INK }}>
        Many people believe <span className="line-through decoration-[#D9573F] text-[#8A8275]">alot</span>{' '}
        <span className="font-semibold text-[#0F9F8F]">a lot</span> of cities are{' '}
        <span className="underline decoration-wavy decoration-[#E8A400] underline-offset-2">very good</span> for students.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[9.5px] font-bold">
        <span className="px-1.5 py-0.5 rounded bg-[#FCE9E4] text-[#D9573F]">Spelling fix</span>
        <span className="px-1.5 py-0.5 rounded bg-[#FFF3D1] text-[#9A6B00]">Try: "well suited"</span>
      </div>
    </div>
  </div>
);

// Shortlist: real-looking result rows with how well each fits
const ShortlistRows = () => {
  const rows = [
    { u: 'University of Limerick', c: 'Ireland', fit: 91, col: '#0F9F8F' },
    { u: 'Trinity College Dublin', c: 'Ireland', fit: 74, col: '#2F5BFF' },
    { u: 'University College Dublin', c: 'Ireland', fit: 58, col: '#6D3FE0' },
  ];
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2.5 p-5" style={{ background: '#FDF1EA' }}>
      <Sample />
      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
        {['MSc Data Science', 'CGPA 8.2', 'IELTS 7', 'Budget ₹25L'].map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-white border border-[#F1D9CC]" style={{ color: INK }}>{t}</span>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.u} className="bg-white rounded-xl border border-[#F1E2D8] px-3 py-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-2 text-[11.5px]">
            <span className="font-bold truncate" style={{ color: INK }}>{r.u}</span>
            <span className="font-extrabold" style={{ color: r.col }}>{r.fit}% fit</span>
          </div>
          <div className="mt-1.5 h-[6px] rounded-full bg-[#F1ECE4] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 w-0 group-hover:w-[var(--w)]" style={{ '--w': `${r.fit}%`, width: `${r.fit}%`, background: r.col }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Scholarships: deadlines lined up like tickets
const ScholarshipTickets = () => {
  const list = [
    { n: 'DAAD', c: 'Germany', v: '€934 / month', d: '14 days', col: '#D9573F' },
    { n: 'Chevening', c: 'UK', v: 'Full fees', d: '41 days', col: '#6D3FE0' },
    { n: 'Fulbright-Nehru', c: 'USA', v: 'Full funding', d: '62 days', col: '#2F5BFF' },
  ];
  return (
    <div className="absolute inset-0 px-4 pt-7 pb-3 flex flex-col justify-center gap-1.5" style={{ background: '#FFF6DE' }}>
      <Sample />
      {list.map((x) => (
        <div key={x.n} className="flex items-center gap-2.5 bg-white rounded-lg border border-[#F2E3B8] pl-0 pr-2.5 py-1.5 overflow-hidden">
          <span className="w-1.5 self-stretch" style={{ background: x.col }} />
          <span className="min-w-0 flex-1">
            <span className="block text-[11.5px] font-bold truncate" style={{ color: INK }}>{x.n} · {x.c}</span>
            <span className="block text-[10px] text-[#5B544A]">{x.v}</span>
          </span>
          <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: x.col }}>{x.d} left</span>
        </div>
      ))}
    </div>
  );
};

// Roadmap: six months, one job each, "you are here" on month 3
const MonthTrack = () => {
  const m = ['Shortlist', 'IELTS', 'SOP', 'Apply', 'Offer', 'Visa'];
  return (
    <div className="absolute inset-0 px-4 flex flex-col justify-center" style={{ background: '#F1ECFD' }}>
      <Sample />
      <div className="relative">
        <div className="absolute left-3 right-3 top-[11px] h-[3px] rounded-full bg-[#DCD2F7]" />
        <div className="absolute left-3 top-[11px] h-[3px] rounded-full bg-[#6D3FE0]" style={{ width: '40%' }} />
        <div className="relative grid grid-cols-6">
          {m.map((x, i) => (
            <div key={x} className="flex flex-col items-center gap-1.5">
              <span className={`w-[25px] h-[25px] rounded-full grid place-items-center text-[10px] font-bold border-2 ${i < 2 ? 'bg-[#6D3FE0] border-[#6D3FE0] text-white' : i === 2 ? 'bg-white border-[#6D3FE0] text-[#6D3FE0]' : 'bg-white border-[#DCD2F7] text-[#8A8275]'}`}>
                {i < 2 ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-[9.5px] font-semibold text-center leading-tight ${i === 2 ? 'text-[#6D3FE0]' : 'text-[#5B544A]'}`}>{x}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-[10.5px] font-semibold text-[#6D3FE0]">You are here: month 3, SOP drafts</p>
    </div>
  );
};

// Fit calculator: your inputs in, one clear chance meter out
const FitGauge = () => {
  const pct = 72;
  const R = 46; const C = Math.PI * R;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-4 px-4" style={{ background: '#E7EDFF' }}>
      <Sample />
      <div className="flex flex-col gap-1 text-[10px] font-bold">
        {['CGPA 8.2', 'IELTS 7.0', 'Budget ₹25L'].map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-white border border-[#D3DCFB]" style={{ color: INK }}>{t}</span>
        ))}
      </div>
      <svg viewBox="0 0 110 66" className="w-[130px] h-auto" aria-hidden="true">
        <path d="M9 58 A46 46 0 0 1 101 58" fill="none" stroke="#D3DCFB" strokeWidth="11" strokeLinecap="round" />
        <path d="M9 58 A46 46 0 0 1 101 58" fill="none" stroke="#2F5BFF" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${(pct / 100) * C} ${C}`} />
        <text x="55" y="50" textAnchor="middle" fontFamily="Urbanist, sans-serif" fontWeight="800" fontSize="20" fill={INK}>{pct}%</text>
        <text x="55" y="63" textAnchor="middle" fontFamily="Onest, sans-serif" fontSize="8" fill="#5B544A">admit chance</text>
      </svg>
    </div>
  );
};

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All AI Tools' },
  { id: 'admissions', label: '🎓 University & Scholarships' },
  { id: 'documents', label: '📝 SOP & Roadmap' },
  { id: 'interview-exams', label: '🎙️ Visa & IELTS Prep' },
];

const AiToolsHubPage = () => {
  const { openEligibilityModal } = useLead();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sopTopic, setSopTopic] = useState('cs');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI Study Abroad Suite | SOP Writer, Visa Prep, University Radar | UniCoach';
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F3EC] pt-[76px] pb-24 text-slate-900 font-sans">
      
      {/* ── 1. CINEMATIC HERO SECTION ── */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 px-4 sm:px-6 lg:px-8 bg-[#F6F3EC] border-b border-[#E6E0D4] overflow-hidden">
        <HeroBackButton fallback="/" />
        {/* Desi Pop: STD booth style sign, wide screens only */}
        <div className="hidden 2xl:block absolute left-8 2xl:left-20 top-1/2 -translate-y-1/2 -rotate-6 z-0 pointer-events-none">
          <StdSign words={['SOP', 'VISA', 'IELTS']} hi="Auzaar" className="w-[180px]" />
        </div>
        

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-orange-200/90 shadow-2xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DE5C2B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DE5C2B]"></span>
            </span>
            <span className="text-[12px] font-bold text-[#DE5C2B] tracking-wide uppercase">
              Next-Gen AI Study Abroad Suite
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.12]">
            Intelligent Tools Built for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] via-orange-600 to-amber-600">
              Global University Aspirants
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Replace guesswork with algorithmic accuracy. From university shortlists and live scholarship radars to AI SOP drafting and voice-powered consular visa simulations.
          </p>

          {/* Key Metrics Pill */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <Sparkles size={14} className="text-[#DE5C2B]" />
              <span>7 Specialized AI Tools</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>50,000+ Profiles Processed</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <ShieldCheck size={14} className="text-indigo-500" />
              <span>100% Free Access</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="pt-6 flex items-center justify-center flex-wrap gap-2">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#DE5C2B] text-white shadow-md shadow-orange-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── 2. VISUAL BENTO GRID WITH IMAGES & INTERACTIVE PREVIEWS ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <HookBand
          value="7"
          label="Specialized AI tools, from university shortlists to SOP drafts and visa interview practice. 100% free access."
          hi="Muft"
          className="mb-8"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">

          {/* ════ CARD 1: AI SOP WRITER (Bento 2-Col Wide with Split Image) ════ */}
          {(activeCategory === 'all' || activeCategory === 'documents') && (
            <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left content (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/70 flex items-center justify-center shadow-2xs">
                        <FileText size={24} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                          Admissions Committee Standard
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          AI Statement of Purpose (SOP) Writer
                        </h2>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Generates committee-ready, university-tailored Statements of Purpose with precise academic hooks, project research alignments, and career trajectory mapping.
                  </p>

                  {/* Interactive Simulated UI Preview */}
                  <div className="bg-[#FBF7F0] rounded-2xl p-4 sm:p-4.5 text-[#16130F] border border-[#ECE6DA] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#ECE6DA] pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                        <span className="text-[11px] text-[#5B544A] ml-1.5 font-sans font-semibold">Opening, drafted for you</span>
                      </div>
                      <div className="flex gap-1.5 font-sans">
                        <button 
                          onClick={() => setSopTopic('cs')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${sopTopic === 'cs' ? 'bg-[#6D3FE0] text-white' : 'bg-white border border-[#E6E0D4] text-[#5B544A] hover:text-[#16130F]'}`}
                        >
                          MS CS
                        </button>
                        <button 
                          onClick={() => setSopTopic('mba')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${sopTopic === 'mba' ? 'bg-[#6D3FE0] text-white' : 'bg-white border border-[#E6E0D4] text-[#5B544A] hover:text-[#16130F]'}`}
                        >
                          Global MBA
                        </button>
                      </div>
                    </div>

                    <div className="text-[11.5px] sm:text-[12.5px] text-[#16130F] leading-relaxed font-sans">
                      {sopTopic === 'cs' ? (
                        <>
                          <p className="text-[#6D3FE0] font-semibold mb-0.5">
                            "Bridging Distributed Systems & Scalable Machine Learning Architectures"
                          </p>
                          <p className="text-[#5B544A] text-xs line-clamp-2">
                            Having engineered streaming pipelines processing 1.4M events/sec, my aspiration at 
                            <span className="text-[#16130F] font-semibold"> Northeastern University</span> is to deepen research under Dr. Walker's Distributed AI Lab...
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[#6D3FE0] font-semibold mb-0.5">
                            "Strategic Scaling & Venture Capital in Cross-Border Tech"
                          </p>
                          <p className="text-[#5B544A] text-xs line-clamp-2">
                            Leading product operations across 4 Southeast Asian markets exposed the critical gap in tech unit economics. My goal at 
                            <span className="text-[#16130F] font-semibold"> INSEAD</span> is to synthesize venture valuation models...
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] text-[#5B544A] pt-1 font-sans border-t border-[#ECE6DA]">
                      <span className="flex items-center gap-1.5 text-[#0F9F8F] font-semibold">
                        <CheckCircle2 size={12} /> 100% Unique • Plagiarism Free
                      </span>
                      <span className="text-[#8A8275]">About 850 words</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      ✓ Instant Word & PDF Copy
                    </span>
                    <Link
                      to="/ai-tools/sop-generator"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16130F] hover:bg-[#DE5C2B] text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <span>Launch AI SOP Writer</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                </div>

                {/* Right visual: paper panel (5 cols) */}
                <div className="lg:col-span-5 relative h-[350px] lg:h-full min-h-[330px] rounded-2xl overflow-hidden border border-[#ECE6DA]">
                  <SopSheet />
                </div>

              </div>

            </div>
          )}

          {/* ════ CARD 2: AI VISA MOCK INTERVIEW SIMULATOR (1-Col with Photo Header) ════ */}
          {(activeCategory === 'all' || activeCategory === 'interview-exams') && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
              
              <div className="space-y-3.5">
                
                {/* What the tool gives you */}
                <div className="relative h-44 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden border-b border-[#ECE6DA]">
                  <VisaChat />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    AI Visa Mock Interview
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Practice real consular questions with instant scoring on confidence, financial proof, and return-intent.
                  </p>
                </div>

                {/* Simulated Consular Voice UI */}
                <div className="bg-[#F4F6FE] rounded-2xl p-3.5 text-[#16130F] border border-[#DCE3FA] space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-[#5B544A]">
                    <span className="flex items-center gap-1.5 text-[#2F5BFF] font-bold text-[10.5px]">
                      <span className="w-2 h-2 rounded-full bg-[#2F5BFF]" /> After each answer you get
                    </span>
                    <span className="text-[10.5px] bg-white border border-[#DCE3FA] px-1.5 py-0.5 rounded text-[#16130F]">USA F-1</span>
                  </div>


                  {/* Simulated Metrics Card */}
                  <div className="grid grid-cols-3 gap-1.5 bg-white border border-[#DCE3FA] p-2 rounded-xl text-center text-[10px]">
                    <div>
                      <span className="block text-[#5B544A] text-[9px] font-bold">Clarity</span>
                      <span className="font-extrabold text-[#0F9F8F] text-xs">Score</span>
                    </div>
                    <div>
                      <span className="block text-[#5B544A] text-[9px] font-bold">Red flags</span>
                      <span className="font-extrabold text-[#D9573F] text-xs">Spotted</span>
                    </div>
                    <div>
                      <span className="block text-[#5B544A] text-[9px] font-bold">Better answer</span>
                      <span className="font-extrabold text-[#2F5BFF] text-xs">Suggested</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/ai-tools/visa-prep"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#16130F] hover:bg-[#DE5C2B] text-white font-bold text-xs shadow-sm transition-all"
                >
                  <span>Start Mock Interview</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 3: IELTS AI EXAMINER (1-Col with Photo Header) ════ */}
          {(activeCategory === 'all' || activeCategory === 'interview-exams') && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
              
              <div className="space-y-3.5">
                
                {/* What the tool gives you */}
                <div className="relative h-44 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden border-b border-[#ECE6DA]">
                  <EssayMarks />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    IELTS Writing AI Examiner
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Evaluate essays instantly against official Cambridge descriptors: Task Response, Cohesion, Lexical Resource & Grammar.
                  </p>
                </div>

                {/* Simulated Band Score Card */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Predicted Score:</span>
                    <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                      Band 7.5
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[10.5px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Task Response</span>
                      <span className="font-bold text-slate-800">8.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full w-[88%]" />
                    </div>

                    <div className="flex justify-between text-slate-600 pt-0.5">
                      <span>Lexical Resource</span>
                      <span className="font-bold text-slate-800">7.5</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full w-[78%]" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/ai-tools/ielts-evaluator"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#16130F] hover:bg-[#DE5C2B] text-white font-bold text-xs shadow-sm transition-all"
                >
                  <span>Evaluate Essay Instantly</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 4: UNIVERSITY RADAR & SHORTLISTER (2-Col Wide with Split Image) ════ */}
          {(activeCategory === 'all' || activeCategory === 'admissions') && (
            <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left Content (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#DE5C2B] border border-orange-200/70 flex items-center justify-center shadow-2xs">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#DE5C2B] uppercase tracking-wider block">
                        Algorithmic Admissions Engine
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        University Finder & Shortlister
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Map your GPA, budget, and test scores across 1,500+ universities in USA, UK, Canada, Germany & Australia. Get a shortlist that fits your marks and budget, with your chance of getting in at each one.
                  </p>

                  {/* What the shortlist checks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    
                    <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 text-left space-y-0.5">
                      <span className="text-[10px] font-black text-emerald-800 uppercase block">Your marks</span>
                      <p className="text-xs font-bold text-slate-800">CGPA • IELTS • GRE</p>
                      <p className="text-[10px] text-slate-500">Checked against entry requirements</p>
                    </div>

                    <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-200/80 text-left space-y-0.5">
                      <span className="text-[10px] font-black text-[#C04A1D] uppercase block">Your budget</span>
                      <p className="text-xs font-bold text-slate-800">Tuition • Living costs</p>
                      <p className="text-[10px] text-slate-500">Options that fit what you can spend</p>
                    </div>

                    <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-200/80 text-left space-y-0.5">
                      <span className="text-[10px] font-black text-purple-800 uppercase block">Your goals</span>
                      <p className="text-xs font-bold text-slate-800">Course • Country • Intake</p>
                      <p className="text-[10px] text-slate-500">Matched to the programs you want</p>
                    </div>

                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Filters: Tuition, QS Rank, GPA, STEM OPT, Co-op
                    </span>
                    <Link
                      to="/search-programs"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16130F] hover:bg-[#DE5C2B] text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <span>Launch University Radar</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                </div>

                {/* Right visual: paper panel (5 cols) */}
                <div className="lg:col-span-5 relative h-[350px] lg:h-full min-h-[330px] rounded-2xl overflow-hidden border border-[#ECE6DA]">
                  <ShortlistRows />
                </div>

              </div>

            </div>
          )}

          {/* ════ CARD 5: SCHOLARSHIPS TRACKER (1-Col with Photo Header) ════ */}
          {(activeCategory === 'all' || activeCategory === 'admissions') && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
              
              <div className="space-y-3.5">
                
                {/* What the tool gives you */}
                <div className="relative h-44 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden border-b border-[#ECE6DA]">
                  <ScholarshipTickets />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Scholarships Tracker
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Discover merit and need-based international scholarships with live countdown timers and Google Calendar sync.
                  </p>
                </div>

                {/* Simulated Live Scholarship Card */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-900">DAAD Helmut-Schmidt</span>
                    <span className="text-[#DE5C2B] font-extrabold flex items-center gap-1">
                      <Clock size={11} /> 14d : 08h left
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">100% Tuition Fee Waiver + €934/mo</p>
                  <p className="text-[10px] text-slate-500">For Master’s in Public Policy & Tech Governance</p>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/search-programs?highlight=scholarship"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#16130F] hover:bg-[#DE5C2B] text-white font-bold text-xs shadow-sm transition-all"
                >
                  <span>Track 450+ Scholarships</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 6: 6-MONTH STRATEGIC ROADMAP (1-Col with Photo Header) ════ */}
          {(activeCategory === 'all' || activeCategory === 'documents') && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
              
              <div className="space-y-3.5">
                
                {/* What the tool gives you */}
                <div className="relative h-44 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden border-b border-[#ECE6DA]">
                  <MonthTrack />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    AI 6-Month Roadmap
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Personalized month-by-month timeline synchronizing test bookings, priority deadlines & embassy slots.
                  </p>
                </div>

                {/* Simulated Milestone Timeline */}
                <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9.5px] font-bold">1</span>
                    <span>Month 1: Diagnostic & Shortlisting</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#DE5C2B] font-bold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-orange-100 text-[#DE5C2B] flex items-center justify-center text-[9.5px] font-bold">2</span>
                    <span>Month 2-3: SOP & LOR Drafts (Active)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9.5px] font-bold">3</span>
                    <span>Month 4: Visa Prep & Financials</span>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/ai-tools/study-roadmap"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#16130F] hover:bg-[#DE5C2B] text-white font-bold text-xs shadow-sm transition-all"
                >
                  <span>Build Custom Timeline</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 7: ADMISSION & SCHOLARSHIP CALCULATOR (1-Col with Photo Header) ════ */}
          {(activeCategory === 'all' || activeCategory === 'admissions') && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden">
              
              <div className="space-y-3.5">
                
                {/* What the tool gives you */}
                <div className="relative h-44 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden border-b border-[#ECE6DA]">
                  <FitGauge />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Profile Fit Calculator
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Calculate your exact admission probability, expected scholarship aid percentage, and post-graduation ROI.
                  </p>
                </div>

                {/* Simulated Metric Sliders */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-slate-600 font-semibold">Admit Probability:</span>
                    <span className="text-emerald-700 font-extrabold">86% (High)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[86%]" />
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] pt-0.5 text-slate-600">
                    <span>Expected Aid:</span>
                    <span className="font-extrabold text-[#DE5C2B]">₹18.5 Lakhs ($22k)</span>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/eligibility-calculator"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#16130F] hover:bg-[#DE5C2B] text-white font-bold text-xs shadow-sm transition-all"
                >
                  <span>Check Admission Fit</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* ── 3. BOTTOM COUNSELING STRIP ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="uc-soft relative rounded-3xl overflow-hidden p-8 sm:p-12">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DE5C2B]/20 border border-orange-400/30 text-orange-300 text-xs font-bold">
              <Sparkles size={14} /> AI Analysis + Human Expertise
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Combine AI Intelligence with Certified Counselor Guidance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Use our AI tools to draft and analyze, then book a 1-on-1 session with our senior advisors to verify university shortlists, deadlines, and visa interview strategies.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openEligibilityModal('AI Tools Hub Bottom Banner')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <span>Book Free 1-on-1 Strategy Call</span>
                <ArrowRight size={16} />
              </button>

              <Link
                to="/search-programs"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all"
              >
                <span>Explore 1,500+ Universities</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AiToolsHubPage;
