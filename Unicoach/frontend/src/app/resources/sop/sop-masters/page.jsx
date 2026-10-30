import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    FileText,
    ArrowRight,
    PenTool
} from 'lucide-react';
import { RailwayBoard } from '../../../../components/desi/DesiPop';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../../components/desi/desiTokens';
import { BookOkCta } from '../../../../components/desi/BookOkCta';

const inputCls = "w-full bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg px-4 py-2.5 text-[14px] font-semibold text-[#16130F] placeholder:text-[#8A7F70] outline-none focus:bg-white focus:shadow-[3px_3px_0_#14837E] transition-shadow";
const labelCls = "text-[11px] font-extrabold uppercase text-[#5B544A] tracking-wider";

const SOPMastersPage = () => {
    const [faqOpen, setFaqOpen] = useState({});
    const [draftInput, setDraftInput] = useState({ name: '', degree: '', university: '', project: '', skill: '', motivation: '' });
    const [generatedOutline, setGeneratedOutline] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        const { name, degree, university, project, skill, motivation } = draftInput;
        setGeneratedOutline([
            {
                title: "Introduction & Motivation Hook",
                text: `My interest in pursuing a master's program was sparked during my undergraduate studies in ${degree || 'my bachelor degree'}, specifically when I realized the potential of ${motivation || 'this technical field'}. I, ${name || 'an aspiring student'}, wish to advance my knowledge at ${university || 'the university'}.`
            },
            {
                title: "Technical Background & STAR Project Method",
                text: `During my academic projects, I focused on '${project || 'my major project'}' which required me to master ${skill || 'my key skill'}. This project refined my analysis, testing, and troubleshooting abilities, laying a solid foundation for research.`
            },
            {
                title: "University Alignment",
                text: `I chose ${university || 'the university'} because of its curriculum offerings and the specific work of faculty members in advanced controls and drives, which matches my career goal.`
            }
        ]);
    };

    const sopList = [
        { key: 'sop-general', name: 'General SOP Guide', path: '/resources/sop/statement-of-purpose' },
        { key: 'sop-masters', name: 'SOP for Masters', path: '/resources/sop/sop-masters' },
        { key: 'sop-mba', name: 'SOP for MBA', path: '/resources/sop/sop-mba' },
        { key: 'sop-phd', name: 'SOP for PhD', path: '/resources/sop/sop-phd' }
    ];
    const currentKey = 'sop-masters';

    return (
        <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">
            {/* ── HERO: teal poster band ── */}
            <DesiHero
                tone="teal"
                sign={{ hi: 'मास्टर्स एसओपी', en: 'MASTERS SOP' }}
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'SOP Guides' }, { label: 'SOP for Masters' }]}
                title="SOP for Masters Guide"
                subtitle="Writing guidelines, samples for engineering & nursing, and outline drafting tools for MS applicants."
                stickers={(
                    <Sticker tilt={-2}><FileText size={14} />Admissions Guides</Sticker>
                )}
                aside={(
                    /* Railway board for the Glasgow admits in the samples below, wide screens only */
                    <div className="hidden lg:flex justify-end pointer-events-none">
                        <RailwayBoard hi="ग्लासगो" en="GLASGOW" codeLeft="MSc" codeRight="UK" className="w-[300px]" />
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
                        <InkCard className="p-6 md:p-8" shadow="#14837E">
                            <DesiHeading hi="Masters ka SOP">Writing an SOP for Masters (MS)</DesiHeading>
                            <p className="mt-3 text-[#5B544A] leading-relaxed text-[15px]">
                                Dreaming of a master's degree from a top university in the USA, UK, or Canada? Your academic scores and project list are ready, but there's one crucial document that can make or break your application: the Statement of Purpose (SOP). For thousands of Indian students every year, the SOP is the single most important part of their application package. It’s your chance to speak directly to the admissions committee and tell them who you are beyond the marksheets.
                            </p>
                        </InkCard>

                        {/* Interactive Outline Generator */}
                        <InkCard as="section" className="p-6 md:p-8 space-y-6" shadow="#D0362E">
                            <div className="flex items-start gap-3">
                                <span className="w-10 h-10 rounded-full border-2 border-[#16130F] bg-[#F2B705] grid place-items-center shrink-0 shadow-[2px_2px_0_#16130F]">
                                    <PenTool size={18} />
                                </span>
                                <DesiHeading hi="Outline banao">Masters SOP Outline Builder</DesiHeading>
                            </div>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Your Name</label>
                                    <input
                                        type="text"
                                        value={draftInput.name}
                                        onChange={e => setDraftInput({...draftInput, name: e.target.value})}
                                        placeholder="e.g. Aditi Sen"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Bachelor Degree</label>
                                    <input
                                        type="text"
                                        value={draftInput.degree}
                                        onChange={e => setDraftInput({...draftInput, degree: e.target.value})}
                                        placeholder="e.g. B.E. Electrical Engineering"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Motivation / Key Concept</label>
                                    <input
                                        type="text"
                                        value={draftInput.motivation}
                                        onChange={e => setDraftInput({...draftInput, motivation: e.target.value})}
                                        placeholder="e.g. Sustainable electronic drives"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Core Skill Built</label>
                                    <input
                                        type="text"
                                        value={draftInput.skill}
                                        onChange={e => setDraftInput({...draftInput, skill: e.target.value})}
                                        placeholder="e.g. MATLAB & Simulink scripting"
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
                                        placeholder="e.g. University of Glasgow"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Major Project Title</label>
                                    <input
                                        type="text"
                                        value={draftInput.project}
                                        onChange={e => setDraftInput({...draftInput, project: e.target.value})}
                                        placeholder="e.g. Co-Simulation of electric traction drive"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="no-shine col-span-1 md:col-span-2 justify-self-start inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#16130F] bg-[#D0362E] hover:bg-[#B52A23] text-white font-bold text-[14px] shadow-[3px_3px_0_#16130F] transition-transform hover:-translate-y-0.5 cursor-pointer"
                                >
                                    Build Masters Outlines
                                    <ArrowRight size={15} />
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
                                    <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Tumhara outline</p>
                                    <h4 className="-mt-2 font-urbanist font-black text-[18px]">Outline Result</h4>
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

                        {/* Real Samples Excerpts: rani poster band */}
                        <section className="bg-[#B8285B] border-[3px] border-[#16130F] p-6 md:p-8 shadow-[6px_6px_0_#16130F]" style={{ borderRadius: 18 }}>
                            <DesiHeading hi="Asli samples" light>Successful Masters SOP Samples</DesiHeading>

                            <div className="mt-6 space-y-5">
                                {/* Sample 1: Electronics Glasgow */}
                                <div className="bg-white p-5 md:p-6 border-[3px] border-[#16130F] shadow-[4px_4px_0_#6E1436] space-y-3"
                                    style={{ borderRadius: 12, transform: 'rotate(-0.5deg)' }}>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md border-2 border-[#16130F] text-[12px] font-extrabold bg-[#F2B705] text-[#16130F]">
                                        Admit: MSc Electronics & Electrical Engineering, Glasgow (UK)
                                    </span>
                                    <h4 className="font-urbanist font-black text-[18px]">Engineering SOP Excerpt</h4>
                                    <p className="text-[#3D362E] text-[14px] leading-relaxed border-l-[4px] border-[#F2B705] pl-4">
                                        "I completed an internship at VI SOLUTIONS in the department of designing electric vehicles... Apart from industrial visits, I have done a project on the Co-Simulation of an electric traction drive, which is a combination of three domains, from where I learned many basic and advanced things in system and control areas... At this juncture, I have decided to pursue a master's degree in MSc Electronics & Electrical Engineering at the University of Glasgow because, after working at General Electric, I realized my knowledge needs advancement."
                                    </p>
                                </div>

                                {/* Sample 2: Nursing GCU */}
                                <div className="bg-white p-5 md:p-6 border-[3px] border-[#16130F] shadow-[4px_4px_0_#6E1436] space-y-3"
                                    style={{ borderRadius: 12, transform: 'rotate(0.5deg)' }}>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md border-2 border-[#16130F] text-[12px] font-extrabold bg-[#14837E] text-white">
                                        Admit: MSc Nursing, Glasgow Caledonian (UK)
                                    </span>
                                    <h4 className="font-urbanist font-black text-[18px]">Nursing SOP Excerpt</h4>
                                    <p className="text-[#3D362E] text-[14px] leading-relaxed border-l-[4px] border-[#14837E] pl-4">
                                        "My college education helped me develop a strong intellectual foundation, strengthened my communication, and helped me explore nursing skills... Shadowing healthcare professionals on their daily duties showed me how strenuous and challenging the role of a nurse is. However, it also allowed me to work closely with patients and their families, and that became my inspiration for showing up to work each morning."
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* FAQs */}
                        <section>
                            <DesiHeading hi="Sabke sawaal">Frequently Asked Questions</DesiHeading>
                            <div className="mt-5 space-y-3">
                                {[
                                    {
                                        q: "Can a strong SOP compensate for a lower B.Tech CGPA?",
                                        a: "Yes, absolutely. A well-written SOP explaining what you learned during B.Tech, what research projects or internships you took up, and how you recovered academically is a huge differentiator for AdComs."
                                    },
                                    {
                                        q: "Should I include details of all undergraduate modules?",
                                        a: "No. Focus only on 2-3 modules or final-year projects that are directly related to the specialization you are applying for in your master's degree."
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
                            text="Masters SOP likh liya? Free 1:1 call mein mentor se check karwao."
                        />

                    </div>

                </div>
            </div>
        </main>
    );
};

export default SOPMastersPage;
