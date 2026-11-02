import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, GraduationCap, ArrowRight, ShieldCheck, Clock, CheckCircle2, Check, Mic, Award, Compass, Calculator,
} from 'lucide-react';
import { useLead } from '../context/LeadContext';
import { HeroBackButton } from '../components/ui/BackButton';
import { StdSign } from '../components/desi/DesiPop';
import { HookBand } from '../components/ui/Infographics';
import { StationSign, Sticker } from '../components/desi/DesiKit';

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
      <div className="w-full max-w-[300px] bg-white rounded-xl border-2 border-[#16130F] shadow-[4px_4px_0_#16130F] p-4 -rotate-[1.5deg] group-hover:rotate-0 transition-transform duration-500">
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
    <div className="self-start max-w-[82%] bg-white rounded-2xl rounded-tl-sm px-3 py-2 border-2 border-[#16130F]">
      <p className="text-[9.5px] font-bold text-[#2F5BFF] mb-0.5">Visa officer</p>
      <p className="text-[11.5px] leading-snug" style={{ color: INK }}>Why this university?</p>
    </div>
    <div className="self-end max-w-[82%] rounded-2xl rounded-tr-sm px-3 py-2 border-2 border-[#16130F]" style={{ background: '#2F5BFF' }}>
      <p className="text-[11.5px] leading-snug text-white">Its co-op term fits my plan to work in data at home.</p>
    </div>
    <div className="self-end inline-flex items-center gap-1.5 bg-white rounded-full px-2.5 py-1 text-[10px] font-bold border-2 border-[#16130F]" style={{ color: '#0F9F8F' }}>
      <Check size={11} strokeWidth={3} /> Clear and specific · add one career detail
    </div>
  </div>
);

// IELTS: the essay comes back with marked fixes
const EssayMarks = () => (
  <div className="absolute inset-0 px-4 pt-7 pb-3 flex flex-col justify-center" style={{ background: '#E9F7F4' }}>
    <Sample />
    <div className="bg-white rounded-xl border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] p-3">
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
        <div key={r.u} className="bg-white rounded-xl border-2 border-[#16130F] px-3 py-2.5">
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
        <div key={x.n} className="flex items-center gap-2.5 bg-white rounded-lg border-2 border-[#16130F] pl-0 pr-2.5 py-1.5 overflow-hidden">
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

// Desi Pop pieces shared by the tool cards (same look as the Toolkit menu)
const CARD = 'bg-white rounded-[20px] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] hover:-translate-y-1 hover:shadow-[7px_7px_0_#16130F] transition-all duration-200 flex flex-col justify-between group overflow-hidden';
const CARD_PAD = `${CARD} p-5 sm:p-6`;
const CTA = 'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#16130F] text-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] font-bold text-[14px] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#DE5C2B] transition-all';
const PANEL = 'bg-[#FFF6E5] rounded-xl border-2 border-[#16130F]';
const PREVIEW = 'relative h-44 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-1 overflow-hidden border-b-[3px] border-[#16130F]';

// Coloured, ink-bordered icon tile
const ToolTile = ({ icon: Icon, bg, fg = '#FFFFFF', size = 'lg' }) => (
  <span className={`${size === 'lg' ? 'w-12 h-12 rounded-xl' : 'w-10 h-10 rounded-lg'} border-2 border-[#16130F] grid place-items-center shrink-0`} style={{ background: bg, color: fg }}>
    <Icon size={size === 'lg' ? 24 : 20} strokeWidth={2} />
  </span>
);

// Hinglish kicker in red over the tool name
const ToolKicker = ({ children }) => (
  <p className="font-urbanist font-extrabold text-[14px] leading-none text-[#D0362E]">{children}</p>
);

const AiToolsHubPage = () => {
  const { openEligibilityModal } = useLead();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sopTopic, setSopTopic] = useState('cs');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI Study Abroad Suite | SOP Writer, Visa Prep, University Radar | UniCoach';
  }, []);

  return (
    <div className="min-h-screen pt-[76px] pb-24 text-[#16130F] font-['Onest',sans-serif] bg-[#FFF6E5] bg-[radial-gradient(circle,rgba(22,19,15,.06)_1.3px,transparent_1.7px)] [background-size:12px_12px]">

      {/* ── 1. HERO ── */}
      <section className="relative pt-10 pb-14 md:pt-14 md:pb-16 px-4 sm:px-6 lg:px-8 border-b-[3px] border-[#16130F] overflow-hidden">
        <HeroBackButton fallback="/" />
        {/* Desi Pop: STD booth style sign, wide screens only */}
        <div className="hidden 2xl:block absolute left-8 2xl:left-20 top-1/2 -translate-y-1/2 -rotate-6 z-0 pointer-events-none">
          <StdSign words={['SOP', 'VISA', 'IELTS']} hi="Auzaar" className="w-[180px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">

          <StationSign hi="Saare tools ek jagah" en="UNICOACH TOOLKIT" className="-rotate-2" />

          {/* Heading */}
          <h1 className="mt-6 font-urbanist font-black text-[34px] sm:text-[46px] md:text-[54px] lg:text-[60px] text-[#16130F] tracking-[-0.045em] leading-[1.15]">
            Intelligent Tools Built for <br className="hidden sm:inline" />
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#F2B705] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] -rotate-1" style={{ borderRadius: 10 }}>
              Global University Aspirants
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl mx-auto text-[15px] sm:text-[17px] text-[#3D3830] font-medium leading-relaxed">
            Replace guesswork with algorithmic accuracy. From university shortlists and live scholarship radars to AI SOP drafting and voice-powered consular visa simulations.
          </p>

          {/* Key facts as stickers */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <Sticker bg="#FFFFFF" tilt={-2}><Sparkles size={15} className="text-[#DE5C2B]" /> 7 Specialized AI Tools</Sticker>
            <Sticker bg="#DDF3EF" tilt={1}><CheckCircle2 size={15} className="text-[#14837E]" /> 50,000+ Profiles Processed</Sticker>
            <Sticker bg="#F2B705" tilt={-1}><ShieldCheck size={15} /> 100% Free Access</Sticker>
          </div>

          {/* Filter Pills */}
          <div className="mt-8">
            <p className="font-urbanist font-extrabold text-[14px] leading-none text-[#D0362E]">Kya chahiye aaj?</p>
            <div className="mt-3 flex items-center justify-center flex-wrap gap-2.5">
              {FILTER_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`no-shine px-4 h-10 rounded-full border-2 border-[#16130F] text-[14px] font-bold transition-all duration-200 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#16130F] text-white shadow-[3px_3px_0_#DE5C2B]'
                      : 'bg-white text-[#16130F] shadow-[2px_2px_0_#16130F] hover:bg-[#FFF1B8] hover:-translate-y-0.5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. TOOL CARDS ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <HookBand
          value="7"
          label="Specialized AI tools, from university shortlists to SOP drafts and visa interview practice. 100% free access."
          hi="Muft"
          className="mb-8 border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F]"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">

          {/* ════ CARD 1: AI SOP WRITER (wide) ════ */}
          {(activeCategory === 'all' || activeCategory === 'documents') && (
            <div className={`md:col-span-2 ${CARD} p-6 sm:p-8 relative`}>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

                {/* Left content (7 cols) */}
                <div className="lg:col-span-7 space-y-4">

                  {/* Header Row */}
                  <div className="flex items-center gap-3.5">
                    <ToolTile icon={FileText} bg="#B8285B" />
                    <div>
                      <ToolKicker>Apni kahani likho</ToolKicker>
                      <span className="mt-1 text-[11.5px] font-black text-[#16130F] uppercase tracking-[0.12em] block">
                        Admissions Committee Standard
                      </span>
                      <h2 className="mt-0.5 font-urbanist text-xl sm:text-2xl font-black text-[#16130F] tracking-tight">
                        AI Statement of Purpose (SOP) Writer
                      </h2>
                    </div>
                  </div>

                  <p className="text-[14px] sm:text-[15px] text-[#3D3830] leading-relaxed">
                    Generates committee-ready, university-tailored Statements of Purpose with precise academic hooks, project research alignments, and career trajectory mapping.
                  </p>

                  {/* Interactive Simulated UI Preview */}
                  <div className={`${PANEL} p-4 text-[#16130F] space-y-2.5`}>
                    <div className="flex items-center justify-between border-b-2 border-[#16130F] pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#D0362E] border border-[#16130F]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F2B705] border border-[#16130F]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#14837E] border border-[#16130F]" />
                        <span className="text-[11px] text-[#5B544A] ml-1.5 font-sans font-semibold">Opening, drafted for you</span>
                      </div>
                      <div className="flex gap-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => setSopTopic('cs')}
                          className={`no-shine text-[10px] font-bold px-2 py-0.5 rounded border-2 border-[#16130F] cursor-pointer transition-colors ${sopTopic === 'cs' ? 'bg-[#B8285B] text-white' : 'bg-white text-[#16130F] hover:bg-[#FFF1B8]'}`}
                        >
                          MS CS
                        </button>
                        <button
                          type="button"
                          onClick={() => setSopTopic('mba')}
                          className={`no-shine text-[10px] font-bold px-2 py-0.5 rounded border-2 border-[#16130F] cursor-pointer transition-colors ${sopTopic === 'mba' ? 'bg-[#B8285B] text-white' : 'bg-white text-[#16130F] hover:bg-[#FFF1B8]'}`}
                        >
                          Global MBA
                        </button>
                      </div>
                    </div>

                    <div className="text-[11.5px] sm:text-[12.5px] text-[#16130F] leading-relaxed font-sans">
                      {sopTopic === 'cs' ? (
                        <>
                          <p className="text-[#B8285B] font-semibold mb-0.5">
                            "Bridging Distributed Systems & Scalable Machine Learning Architectures"
                          </p>
                          <p className="text-[#5B544A] text-xs line-clamp-2">
                            Having engineered streaming pipelines processing 1.4M events/sec, my aspiration at
                            <span className="text-[#16130F] font-semibold"> Northeastern University</span> is to deepen research under Dr. Walker's Distributed AI Lab...
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[#B8285B] font-semibold mb-0.5">
                            "Strategic Scaling & Venture Capital in Cross-Border Tech"
                          </p>
                          <p className="text-[#5B544A] text-xs line-clamp-2">
                            Leading product operations across 4 Southeast Asian markets exposed the critical gap in tech unit economics. My goal at
                            <span className="text-[#16130F] font-semibold"> INSEAD</span> is to synthesize venture valuation models...
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] text-[#5B544A] pt-1 font-sans border-t-2 border-dashed border-[#16130F]/30">
                      <span className="flex items-center gap-1.5 text-[#14837E] font-semibold">
                        <CheckCircle2 size={12} /> 100% Unique • Plagiarism Free
                      </span>
                      <span className="text-[#5B544A]">About 850 words</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[14px] font-semibold text-[#5B544A]">
                      ✓ Instant Word & PDF Copy
                    </span>
                    <Link to="/ai-tools/sop-generator" className={CTA}>
                      <span>Launch AI SOP Writer</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                </div>

                {/* Right visual: paper panel (5 cols) */}
                <div className="lg:col-span-5 relative h-[350px] lg:h-full min-h-[330px] rounded-xl overflow-hidden border-2 border-[#16130F] bg-[#FBD9E6]">
                  <SopSheet />
                </div>

              </div>

            </div>
          )}

          {/* ════ CARD 2: AI VISA MOCK INTERVIEW ════ */}
          {(activeCategory === 'all' || activeCategory === 'interview-exams') && (
            <div className={CARD_PAD}>

              <div className="space-y-3.5">

                {/* What the tool gives you */}
                <div className={PREVIEW}>
                  <VisaChat />
                </div>

                <div className="flex items-start gap-3">
                  <ToolTile icon={Mic} bg="#14837E" size="sm" />
                  <div>
                    <ToolKicker>Interview ki practice</ToolKicker>
                    <h2 className="mt-1 font-urbanist text-lg font-black text-[#16130F] tracking-tight">
                      AI Visa Mock Interview
                    </h2>
                  </div>
                </div>
                <p className="text-[14px] text-[#5B544A] leading-relaxed">
                  Practice real consular questions with instant scoring on confidence, financial proof, and return-intent.
                </p>

                {/* Simulated Consular Voice UI */}
                <div className={`${PANEL} p-3.5 text-[#16130F] space-y-2.5`}>
                  <div className="flex items-center justify-between text-[11px] text-[#5B544A]">
                    <span className="flex items-center gap-1.5 text-[#14837E] font-bold text-[10.5px]">
                      <span className="w-2 h-2 rounded-full bg-[#14837E]" /> After each answer you get
                    </span>
                    <span className="text-[10.5px] bg-white border-2 border-[#16130F] px-1.5 py-0.5 rounded font-bold text-[#16130F]">USA F-1</span>
                  </div>

                  {/* Simulated Metrics Card */}
                  <div className="grid grid-cols-3 gap-1.5 bg-white border-2 border-[#16130F] p-2 rounded-lg text-center text-[10px]">
                    <div>
                      <span className="block text-[#5B544A] text-[9px] font-bold">Clarity</span>
                      <span className="font-extrabold text-[#14837E] text-xs">Score</span>
                    </div>
                    <div>
                      <span className="block text-[#5B544A] text-[9px] font-bold">Red flags</span>
                      <span className="font-extrabold text-[#D0362E] text-xs">Spotted</span>
                    </div>
                    <div>
                      <span className="block text-[#5B544A] text-[9px] font-bold">Better answer</span>
                      <span className="font-extrabold text-[#B8285B] text-xs">Suggested</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-5">
                <Link to="/ai-tools/visa-prep" className={`w-full ${CTA}`}>
                  <span>Start Mock Interview</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 3: IELTS AI EXAMINER ════ */}
          {(activeCategory === 'all' || activeCategory === 'interview-exams') && (
            <div className={CARD_PAD}>

              <div className="space-y-3.5">

                {/* What the tool gives you */}
                <div className={PREVIEW}>
                  <EssayMarks />
                </div>

                <div className="flex items-start gap-3">
                  <ToolTile icon={Sparkles} bg="#F2B705" fg="#16130F" size="sm" />
                  <div>
                    <ToolKicker>Essay check karao</ToolKicker>
                    <h2 className="mt-1 font-urbanist text-lg font-black text-[#16130F] tracking-tight">
                      IELTS Writing AI Examiner
                    </h2>
                  </div>
                </div>
                <p className="text-[14px] text-[#5B544A] leading-relaxed">
                  Evaluate essays instantly against official Cambridge descriptors: Task Response, Cohesion, Lexical Resource & Grammar.
                </p>

                {/* Simulated Band Score Card */}
                <div className={`${PANEL} p-3.5 space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#16130F]">Predicted Score:</span>
                    <span className="text-xs font-black text-[#16130F] bg-[#F2B705] px-2 py-0.5 rounded-md border-2 border-[#16130F]">
                      Band 7.5
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[10.5px]">
                    <div className="flex justify-between text-[#5B544A]">
                      <span>Task Response</span>
                      <span className="font-bold text-[#16130F]">8.0</span>
                    </div>
                    <div className="w-full bg-white border border-[#16130F] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#14837E] h-full w-[88%]" />
                    </div>

                    <div className="flex justify-between text-[#5B544A] pt-0.5">
                      <span>Lexical Resource</span>
                      <span className="font-bold text-[#16130F]">7.5</span>
                    </div>
                    <div className="w-full bg-white border border-[#16130F] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#14837E] h-full w-[78%]" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-5">
                <Link to="/ai-tools/ielts-evaluator" className={`w-full ${CTA}`}>
                  <span>Evaluate Essay Instantly</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 4: UNIVERSITY RADAR & SHORTLISTER (wide) ════ */}
          {(activeCategory === 'all' || activeCategory === 'admissions') && (
            <div className={`md:col-span-2 ${CARD} p-6 sm:p-8 relative`}>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

                {/* Left Content (7 cols) */}
                <div className="lg:col-span-7 space-y-4">

                  <div className="flex items-center gap-3.5">
                    <ToolTile icon={GraduationCap} bg="#D0362E" />
                    <div>
                      <ToolKicker>Sahi university chuno</ToolKicker>
                      <span className="mt-1 text-[11.5px] font-black text-[#16130F] uppercase tracking-[0.12em] block">
                        Algorithmic Admissions Engine
                      </span>
                      <h2 className="mt-0.5 font-urbanist text-xl sm:text-2xl font-black text-[#16130F] tracking-tight">
                        University Finder & Shortlister
                      </h2>
                    </div>
                  </div>

                  <p className="text-[14px] sm:text-[15px] text-[#3D3830] leading-relaxed">
                    Map your GPA, budget, and test scores across 1,500+ universities in USA, UK, Canada, Germany & Australia. Get a shortlist that fits your marks and budget, with your chance of getting in at each one.
                  </p>

                  {/* What the shortlist checks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">

                    <div className="bg-[#DDF3EF] p-3 rounded-xl border-2 border-[#16130F] text-left space-y-0.5">
                      <span className="text-[10px] font-black text-[#14837E] uppercase block">Your marks</span>
                      <p className="text-xs font-bold text-[#16130F]">CGPA • IELTS • GRE</p>
                      <p className="text-[10px] text-[#5B544A]">Checked against entry requirements</p>
                    </div>

                    <div className="bg-[#FCE3DA] p-3 rounded-xl border-2 border-[#16130F] text-left space-y-0.5">
                      <span className="text-[10px] font-black text-[#D0362E] uppercase block">Your budget</span>
                      <p className="text-xs font-bold text-[#16130F]">Tuition • Living costs</p>
                      <p className="text-[10px] text-[#5B544A]">Options that fit what you can spend</p>
                    </div>

                    <div className="bg-[#FBD9E6] p-3 rounded-xl border-2 border-[#16130F] text-left space-y-0.5">
                      <span className="text-[10px] font-black text-[#B8285B] uppercase block">Your goals</span>
                      <p className="text-xs font-bold text-[#16130F]">Course • Country • Intake</p>
                      <p className="text-[10px] text-[#5B544A]">Matched to the programs you want</p>
                    </div>

                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[14px] font-medium text-[#5B544A]">
                      Filters: Tuition, QS Rank, GPA, STEM OPT, Co-op
                    </span>
                    <Link to="/search-programs" className={CTA}>
                      <span>Launch University Radar</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                </div>

                {/* Right visual: paper panel (5 cols) */}
                <div className="lg:col-span-5 relative h-[350px] lg:h-full min-h-[330px] rounded-xl overflow-hidden border-2 border-[#16130F]">
                  <ShortlistRows />
                </div>

              </div>

            </div>
          )}

          {/* ════ CARD 5: SCHOLARSHIPS TRACKER ════ */}
          {(activeCategory === 'all' || activeCategory === 'admissions') && (
            <div className={CARD_PAD}>

              <div className="space-y-3.5">

                {/* What the tool gives you */}
                <div className={PREVIEW}>
                  <ScholarshipTickets />
                </div>

                <div className="flex items-start gap-3">
                  <ToolTile icon={Award} bg="#DE5C2B" size="sm" />
                  <div>
                    <ToolKicker>Paisa bachao</ToolKicker>
                    <h2 className="mt-1 font-urbanist text-lg font-black text-[#16130F] tracking-tight">
                      Scholarships Tracker
                    </h2>
                  </div>
                </div>
                <p className="text-[14px] text-[#5B544A] leading-relaxed">
                  Discover merit and need-based international scholarships with live countdown timers and Google Calendar sync.
                </p>

                {/* Simulated Live Scholarship Card */}
                <div className={`${PANEL} p-3 space-y-1.5`}>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[#16130F]">DAAD Helmut-Schmidt</span>
                    <span className="text-[#D0362E] font-extrabold flex items-center gap-1">
                      <Clock size={11} /> 14d : 08h left
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#16130F]">100% Tuition Fee Waiver + €934/mo</p>
                  <p className="text-[10px] text-[#5B544A]">For Master’s in Public Policy & Tech Governance</p>
                </div>

              </div>

              <div className="pt-5">
                <Link to="/search-programs?highlight=scholarship" className={`w-full ${CTA}`}>
                  <span>Track 450+ Scholarships</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 6: 6-MONTH STRATEGIC ROADMAP ════ */}
          {(activeCategory === 'all' || activeCategory === 'documents') && (
            <div className={CARD_PAD}>

              <div className="space-y-3.5">

                {/* What the tool gives you */}
                <div className={PREVIEW}>
                  <MonthTrack />
                </div>

                <div className="flex items-start gap-3">
                  <ToolTile icon={Compass} bg="#B8285B" size="sm" />
                  <div>
                    <ToolKicker>Mahine-dar-mahine plan</ToolKicker>
                    <h2 className="mt-1 font-urbanist text-lg font-black text-[#16130F] tracking-tight">
                      AI 6-Month Roadmap
                    </h2>
                  </div>
                </div>
                <p className="text-[14px] text-[#5B544A] leading-relaxed">
                  Personalized month-by-month timeline synchronizing test bookings, priority deadlines & embassy slots.
                </p>

                {/* Simulated Milestone Timeline */}
                <div className={`${PANEL} space-y-1.5 text-xs p-2.5`}>
                  <div className="flex items-center gap-2 text-[#16130F] font-semibold text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-[#14837E] text-white border-2 border-[#16130F] flex items-center justify-center text-[9.5px] font-bold">1</span>
                    <span>Month 1: Diagnostic & Shortlisting</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#B8285B] font-bold text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] flex items-center justify-center text-[9.5px] font-bold">2</span>
                    <span>Month 2-3: SOP & LOR Drafts (Active)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5B544A] text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-white text-[#16130F] border-2 border-[#16130F] flex items-center justify-center text-[9.5px] font-bold">3</span>
                    <span>Month 4: Visa Prep & Financials</span>
                  </div>
                </div>

              </div>

              <div className="pt-5">
                <Link to="/ai-tools/study-roadmap" className={`w-full ${CTA}`}>
                  <span>Build Custom Timeline</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

            </div>
          )}

          {/* ════ CARD 7: ADMISSION & SCHOLARSHIP CALCULATOR ════ */}
          {(activeCategory === 'all' || activeCategory === 'admissions') && (
            <div className={CARD_PAD}>

              <div className="space-y-3.5">

                {/* What the tool gives you */}
                <div className={PREVIEW}>
                  <FitGauge />
                </div>

                <div className="flex items-start gap-3">
                  <ToolTile icon={Calculator} bg="#14837E" size="sm" />
                  <div>
                    <ToolKicker>Chance kitna hai?</ToolKicker>
                    <h2 className="mt-1 font-urbanist text-lg font-black text-[#16130F] tracking-tight">
                      Profile Fit Calculator
                    </h2>
                  </div>
                </div>
                <p className="text-[14px] text-[#5B544A] leading-relaxed">
                  Calculate your exact admission probability, expected scholarship aid percentage, and post-graduation ROI.
                </p>

                {/* Simulated Metric Sliders */}
                <div className={`${PANEL} p-3 space-y-1.5`}>
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-[#5B544A] font-semibold">Admit Probability:</span>
                    <span className="text-[#14837E] font-extrabold">86% (High)</span>
                  </div>
                  <div className="w-full bg-white border border-[#16130F] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#14837E] h-full w-[86%]" />
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] pt-0.5 text-[#5B544A]">
                    <span>Expected Aid:</span>
                    <span className="font-extrabold text-[#D0362E]">₹18.5 Lakhs ($22k)</span>
                  </div>
                </div>

              </div>

              <div className="pt-5">
                <Link to="/eligibility-calculator" className={`w-full ${CTA}`}>
                  <span>Check Admission Fit</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* ── 3. BOTTOM COUNSELING STRIP ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="relative rounded-[22px] overflow-hidden p-8 sm:p-12 bg-[#F2B705] border-[3px] border-[#16130F] shadow-[7px_7px_0_#16130F]">
          <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,19,15,.12)_1.3px,transparent_1.7px)] [background-size:10px_10px]" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] text-[#16130F] text-[13px] font-bold -rotate-1">
              <Sparkles size={14} className="text-[#D0362E]" /> AI Analysis + Human Expertise
            </span>
            <p className="font-urbanist font-extrabold text-[15px] leading-none text-[#D0362E]">Tool ke baad, counsellor se baat</p>
            <h2 className="font-urbanist text-2xl sm:text-3xl lg:text-4xl font-black text-[#16130F] tracking-tight leading-tight">
              Combine AI Intelligence with Certified Counselor Guidance
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#3D3830] leading-relaxed">
              Use our AI tools to draft and analyze, then book a 1-on-1 session with our senior advisors to verify university shortlists, deadlines, and visa interview strategies.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openEligibilityModal('AI Tools Hub Bottom Banner')}
                className="no-shine inline-flex items-center gap-2 px-6 h-12 rounded-full bg-[#16130F] text-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] font-bold text-[14px] sm:text-[15px] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Book Free 1-on-1 Strategy Call</span>
                <ArrowRight size={16} />
              </button>

              <Link
                to="/search-programs"
                className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-white text-[#16130F] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] font-bold text-[14px] sm:text-[15px] hover:-translate-y-0.5 transition-all"
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
