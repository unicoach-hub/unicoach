import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    Check,
    FileText,
    ArrowRight,
    PenTool
} from 'lucide-react';
import { PuffyWord } from '../../../../components/desi/DesiPop';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../../components/desi/desiTokens';
import { BookOkCta } from '../../../../components/desi/BookOkCta';

const inputCls = "w-full bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg px-4 py-2.5 text-[14px] font-semibold text-[#16130F] placeholder:text-[#8A7F70] outline-none focus:bg-white focus:shadow-[3px_3px_0_#D0362E] transition-shadow";
const labelCls = "text-[11px] font-extrabold uppercase text-[#5B544A] tracking-wider";

const SOPPhdPage = () => {
    const [faqOpen, setFaqOpen] = useState({});
    const [draftInput, setDraftInput] = useState({ name: '', academicField: '', researchTopic: '', priorResearch: '', targetProfessor: '', university: '' });
    const [generatedOutline, setGeneratedOutline] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        const { name, academicField, researchTopic, priorResearch, targetProfessor, university } = draftInput;
        setGeneratedOutline([
            {
                title: "Section 1: Specific Research Statement",
                text: `My primary academic interest lies in the field of ${academicField || 'my academic field'}, focusing on the analysis of '${researchTopic || 'my specific research proposal'}'. I, ${name || 'an academic applicant'}, seek to pursue a PhD at ${university || 'the institution'}.`
            },
            {
                title: "Section 2: Prior Research Experience & Literature Review",
                text: `During my postgraduate research, I conducted study on '${priorResearch || 'my prior publication/research'}'. This study developed my research methods and data modeling capability, preparing me to handle doctoral rigor.`
            },
            {
                title: "Section 3: Faculty Alignment & Thesis Scope",
                text: `I am highly motivated to work under the supervision of Professor ${targetProfessor || 'the faculty member'} at ${university || 'the university'}, as their recent work on this topic directly maps to my planned thesis scope.`
            }
        ]);
    };

    const sopList = [
        { key: 'sop-general', name: 'General SOP Guide', path: '/resources/sop/statement-of-purpose' },
        { key: 'sop-masters', name: 'SOP for Masters', path: '/resources/sop/sop-masters' },
        { key: 'sop-mba', name: 'SOP for MBA', path: '/resources/sop/sop-mba' },
        { key: 'sop-phd', name: 'SOP for PhD', path: '/resources/sop/sop-phd' }
    ];
    const currentKey = 'sop-phd';

    return (
        <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">
            {/* ── HERO: peach poster band ── */}
            <DesiHero
                tone="peach"
                sign={{ hi: 'शोध एसओपी', en: 'PHD SOP' }}
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'SOP Guides' }, { label: 'SOP for PhD' }]}
                title="SOP for PhD Guide"
                subtitle="Research proposals format, literature reviews mapping, and faculty alignment tips for doctoral candidates."
                stickers={(
                    <Sticker tilt={-2}><FileText size={14} />Admissions Guides</Sticker>
                )}
                aside={(
                    /* Puffy Hindi word for research, wide screens only */
                    <div className="hidden lg:flex justify-end pointer-events-none">
                        <div className="w-[240px] rotate-3 border-[3px] border-[#16130F] rounded-[22px] shadow-[6px_6px_0_#16130F] overflow-hidden">
                            <PuffyWord>शोध</PuffyWord>
                        </div>
                    </div>
                )}
            />

            {/* ── SOP PICKER (phones and tablets) ── */}
            <div className="lg:hidden max-w-[1240px] mx-auto px-4 -mt-6 mb-8 relative z-10">
                <InkCard className="p-3">
                    <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">SOP guides</p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {sopList.map((sop, si) => {
                            const isCurrent = sop.key === currentKey;
                            const tone = DESI_TONES[si % DESI_TONES.length];
                            return (
                                <Link
                                    key={sop.key}
                                    to={sop.path}
                                    style={isCurrent ? { background: tone.c, color: tone.fg } : undefined}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isCurrent ? 'border-[#16130F] shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
                                >
                                    <FileText size={13} />
                                    <span>{sop.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </InkCard>
            </div>

            {/* ── MAIN 2-COLUMN GRID ── */}
            <div className="max-w-[1240px] mx-auto px-4 md:px-8 lg:pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                    {/* ── DESKTOP STICKY SIDEBAR ── */}
                    <aside className="hidden lg:block lg:col-span-1 sticky top-28">
                        <InkCard className="p-4">
                            <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">SOP guides</p>
                            <h3 className="mt-1 mb-3 font-urbanist font-black text-[17px]">SOP Categories</h3>
                            <nav className="flex flex-col gap-2">
                                {sopList.map((sop, si) => {
                                    const isCurrent = sop.key === currentKey;
                                    const tone = DESI_TONES[si % DESI_TONES.length];
                                    return (
                                        <Link
                                            key={sop.key}
                                            to={sop.path}
                                            style={isCurrent ? { background: tone.c, color: tone.fg } : undefined}
                                            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border-2 text-[14px] font-bold transition-transform ${isCurrent ? 'border-[#16130F] shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <span className="w-2.5 h-2.5 rounded-full border-2 border-[#16130F]" style={{ background: tone.c }} />
                                                {sop.name}
                                            </span>
                                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    );
                                })}
                            </nav>
                        </InkCard>
                    </aside>

                    {/* ── CORE CONTENT COLUMN ── */}
                    <div className="lg:col-span-3 space-y-10 min-w-0">

                        {/* Summary */}
                        <InkCard className="p-6 md:p-8" shadow="#D0362E">
                            <DesiHeading hi="PhD ka SOP">Writing a PhD Statement of Purpose</DesiHeading>
                            <p className="mt-3 text-[#5B544A] leading-relaxed text-[15px]">
                                A PhD Statement of Purpose is significantly different from a Master's or MBA SOP. Instead of focusing heavily on career pivot stories, a doctoral SOP must demonstrate deep research potential, familiarity with modern academic literature, and clear alignment with specific faculty members at the target university. It is a technical research statement rather than a general essay.
                            </p>
                        </InkCard>

                        {/* Interactive Outline Generator */}
                        <InkCard as="section" className="p-6 md:p-8 space-y-6" shadow="#14837E">
                            <div className="flex items-start gap-3">
                                <span className="w-10 h-10 rounded-full border-2 border-[#16130F] bg-[#F2B705] grid place-items-center shrink-0 shadow-[2px_2px_0_#16130F]">
                                    <PenTool size={18} />
                                </span>
                                <DesiHeading hi="Outline banao">PhD Research Outline Builder</DesiHeading>
                            </div>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Your Name</label>
                                    <input
                                        type="text"
                                        value={draftInput.name}
                                        onChange={e => setDraftInput({...draftInput, name: e.target.value})}
                                        placeholder="e.g. Dr. Pooja Iyer"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Academic Field</label>
                                    <input
                                        type="text"
                                        value={draftInput.academicField}
                                        onChange={e => setDraftInput({...draftInput, academicField: e.target.value})}
                                        placeholder="e.g. Materials Engineering"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Research Proposal Topic</label>
                                    <input
                                        type="text"
                                        value={draftInput.researchTopic}
                                        onChange={e => setDraftInput({...draftInput, researchTopic: e.target.value})}
                                        placeholder="e.g. Perovskite solar cell degradation kinetics"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Prior Thesis / Publications</label>
                                    <input
                                        type="text"
                                        value={draftInput.priorResearch}
                                        onChange={e => setDraftInput({...draftInput, priorResearch: e.target.value})}
                                        placeholder="e.g. Synthesis of lead-free halides in M.Tech"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Target Professor</label>
                                    <input
                                        type="text"
                                        value={draftInput.targetProfessor}
                                        onChange={e => setDraftInput({...draftInput, targetProfessor: e.target.value})}
                                        placeholder="e.g. Dr. Emily Carter"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Target University</label>
                                    <input
                                        type="text"
                                        value={draftInput.university}
                                        onChange={e => setDraftInput({...draftInput, university: e.target.value})}
                                        placeholder="e.g. Princeton University"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="no-shine col-span-1 md:col-span-2 justify-self-start inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#16130F] bg-[#D0362E] hover:bg-[#B52A23] text-white font-bold text-[14px] shadow-[3px_3px_0_#16130F] transition-transform hover:-translate-y-0.5 cursor-pointer"
                                >
                                    Build PhD Outline
                                    <ArrowRight size={15} />
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
                                    <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Tumhara outline</p>
                                    <h4 className="-mt-2 font-urbanist font-black text-[18px]">Outline Results</h4>
                                    <div className="space-y-3">
                                        {generatedOutline.map((item, idx) => {
                                            const tone = DESI_TONES[idx % DESI_TONES.length];
                                            return (
                                                <div key={idx} className="bg-[#FFF6E5] border-2 border-[#16130F] p-4 rounded-xl flex gap-3">
                                                    <span className="w-7 h-7 rounded-full border-2 border-[#16130F] font-urbanist font-black text-[13px] grid place-items-center shrink-0"
                                                        style={{ background: tone.c, color: tone.fg }}>
                                                        {idx + 1}
                                                    </span>
                                                    <div className="min-w-0 space-y-1">
                                                        <span className="block text-[13.5px] font-extrabold">{item.title}</span>
                                                        <p className="text-[13.5px] text-[#5B544A] leading-relaxed">{item.text}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </InkCard>

                        {/* Critical Steps for PhD SOP: teal poster band */}
                        <section className="bg-[#14837E] border-[3px] border-[#16130F] p-6 md:p-8 shadow-[6px_6px_0_#16130F]" style={{ borderRadius: 18 }}>
                            <DesiHeading hi="Zaroori baatein" light>Key Writing Checklist for PhD SOPs</DesiHeading>
                            <ul className="mt-6 space-y-3 list-none p-0 m-0">
                                {[
                                    'Establish research gaps in the literature immediately in Paragraph 1 or 2.',
                                    'Cite 1-2 research papers authored by your target supervisor at the university.',
                                    'Demonstrate laboratory experience, instrument usage, or quantitative analysis coding.',
                                ].map((item, idx) => (
                                    <li key={item} className="flex gap-3 items-start bg-white p-4 border-[3px] border-[#16130F] shadow-[4px_4px_0_#0B4F4C]"
                                        style={{ borderRadius: 12, transform: `rotate(${idx % 2 ? 0.5 : -0.5}deg)` }}>
                                        <span className="w-7 h-7 rounded-full border-2 border-[#16130F] bg-[#F2B705] grid place-items-center shrink-0">
                                            <Check size={15} strokeWidth={3} />
                                        </span>
                                        <span className="text-[#3D362E] text-[14px] font-semibold leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* FAQs */}
                        <section>
                            <DesiHeading hi="Sabke sawaal">Frequently Asked Questions</DesiHeading>
                            <div className="mt-5 space-y-3">
                                {[
                                    {
                                        q: "Do I need to contact a professor before writing my PhD SOP?",
                                        a: "In most cases, yes. Having a prior positive email exchange with a prospective advisor enables you to reference their encouragement directly in your SOP, which dramatically boosts admission chances."
                                    },
                                    {
                                        q: "Should I include details of my Master's thesis?",
                                        a: "Yes. Your Master's thesis methodology and outcomes are the single most important evidence of your research competence."
                                    }
                                ].map((faq, idx) => {
                                    const isOpen = !!faqOpen[idx];
                                    return (
                                        <div key={idx} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: isOpen ? '4px 4px 0 #D0362E' : '4px 4px 0 #16130F' }}>
                                            <button
                                                onClick={() => toggleFaq(idx)}
                                                aria-expanded={isOpen}
                                                className="no-shine w-full flex items-center justify-between gap-3 p-4 text-left font-bold text-[14.5px] cursor-pointer"
                                            >
                                                <span>{faq.q}</span>
                                                <span className={`w-7 h-7 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#F2B705]' : 'bg-white'}`}>
                                                    <ChevronDown size={15} />
                                                </span>
                                            </button>

                                            {isOpen && (
                                                <div className="px-4 pb-4 pt-3 text-[#5B544A] text-[14px] border-t-2 border-dashed border-[#16130F33] leading-relaxed">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Closing CTA */}
                        <BookOkCta
                            hi="SOP check karwao"
                            text="PhD SOP likh liya? Free 1:1 call mein mentor se check karwao."
                        />

                    </div>

                </div>
            </div>
        </main>
    );
};

export default SOPPhdPage;
