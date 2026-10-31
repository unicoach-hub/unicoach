import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    FileText,
    ArrowRight,
    PenTool
} from 'lucide-react';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../../components/desi/desiTokens';
import { BookOkCta } from '../../../../components/desi/BookOkCta';

// Paragraph plan from the breakdown below, shown in the hero
const PARA_PLAN = [
    { label: '¶ 1', sub: 'The hook' },
    { label: '¶ 2–3', sub: 'Background' },
    { label: '¶ 4–5', sub: 'Why this course' },
    { label: '¶ 6–7', sub: 'Goals & conclusion' },
];

const inputCls = "w-full bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg px-4 py-2.5 text-[14px] font-semibold text-[#16130F] placeholder:text-[#8A7F70] outline-none focus:bg-white focus:shadow-[3px_3px_0_#F2B705] transition-shadow";
const labelCls = "text-[11px] font-extrabold uppercase text-[#5B544A] tracking-wider";

const StatementOfPurposePage = () => {
    const [faqOpen, setFaqOpen] = useState({});
    const [draftInput, setDraftInput] = useState({ name: '', field: '', university: '', project: '', goal: '' });
    const [generatedOutline, setGeneratedOutline] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        const { name, field, university, project, goal } = draftInput;
        setGeneratedOutline([
            {
                title: "Paragraph 1: The Hook & Introduction",
                text: `My fascination with ${field || 'my chosen field'} began not merely in the lecture halls of my undergraduate studies, but during hands-on exploration. I, ${name || 'an aspiring scholar'}, am seeking admission to ${university || 'my dream university'} to leverage the advanced research facilities and align my career objectives.`
            },
            {
                title: "Paragraph 2 & 3: Academic Background & Project Details",
                text: `During my bachelor's program, I built a strong analytical base. My core project on '${project || 'my major project'}' allowed me to implement theoretical frameworks to solve complex problems, cementing my desire to specialize further.`
            },
            {
                title: "Paragraph 4 & 5: Why This University & Fit",
                text: `I am drawn to the specific curriculum modules at ${university || 'the university'}. The chance to participate in research and work under the faculty's guidance is the ideal next step for my academic growth.`
            },
            {
                title: "Paragraph 6: Long-term Career Goals",
                text: `Post-graduation, I aim to work in a leadership capacity, focusing on high-impact projects. My ultimate goal is to lead innovation in the industry, specifically targeting '${goal || 'my career vision'}' in global settings.`
            }
        ]);
    };

    const sopList = [
        { key: 'sop-general', name: 'General SOP Guide', path: '/resources/sop/statement-of-purpose' },
        { key: 'sop-masters', name: 'SOP for Masters', path: '/resources/sop/sop-masters' },
        { key: 'sop-mba', name: 'SOP for MBA', path: '/resources/sop/sop-mba' },
        { key: 'sop-phd', name: 'SOP for PhD', path: '/resources/sop/sop-phd' }
    ];
    const currentKey = 'sop-general';

    return (
        <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">
            {/* ── HERO: mustard poster band ── */}
            <DesiHero
                tone="mustard"
                sign={{ hi: 'SOP adda', en: 'SOP ADDA' }}
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'SOP Guides' }, { label: 'Statement of Purpose' }]}
                title="Statement of Purpose (SOP) Guidelines"
                subtitle="Format, paragraph breakdowns, templates, and successful samples for Indian study abroad applicants."
                stickers={(
                    <Sticker tilt={-2}><FileText size={14} />Admissions Guides</Sticker>
                )}
                aside={(
                    <InkCard className="p-5 sm:p-6 max-w-[460px] lg:ml-auto" style={{ transform: 'rotate(1.2deg)' }}>
                        <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Paragraph plan</p>
                        <ol className="mt-4 space-y-2.5 list-none p-0 m-0">
                            {PARA_PLAN.map((step, i) => {
                                const tone = DESI_TONES[i % DESI_TONES.length];
                                return (
                                    <li key={step.label} className="flex items-center gap-3">
                                        <span className="shrink-0 min-w-[64px] text-center px-2.5 py-1 rounded-full border-2 border-[#16130F] font-urbanist font-black text-[14px] shadow-[2px_2px_0_#16130F]"
                                            style={{ background: tone.c, color: tone.fg }}>
                                            {step.label}
                                        </span>
                                        <span className="text-[14.5px] font-bold">{step.sub}</span>
                                    </li>
                                );
                            })}
                        </ol>
                    </InkCard>
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

                        {/* Intro Summary */}
                        <InkCard className="p-6 md:p-8" shadow="#F2B705">
                            <DesiHeading hi="SOP kya hai">What is a Statement of Purpose (SOP)?</DesiHeading>
                            <p className="mt-3 text-[#5B544A] leading-relaxed text-[15px]">
                                For every Indian student dreaming of walking the halls of a global university, the Statement of Purpose (SOP) is the most crucial document you will write. It's more than just an essay; it's your voice in a stack of applications, your chance to tell the admissions committee who you are beyond your marksheets and test scores. As you prepare for the 2025-2026 intake, your SOP will be the bridge between your aspirations in India and your acceptance letter from universities in the USA, UK, Canada, or Australia.
                            </p>
                        </InkCard>

                        {/* SOP vs Personal Statement Table */}
                        <section>
                            <DesiHeading hi="Kaunsa document">SOP vs. Personal Statement vs. Letter of Motivation</DesiHeading>
                            <InkCard className="mt-5 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[520px] text-left border-collapse text-[13px] md:text-[14px]">
                                        <thead>
                                            <tr className="bg-[#F2B705] text-[#16130F] font-extrabold uppercase text-[11.5px] tracking-wider border-b-[3px] border-[#16130F]">
                                                <th className="p-3">Document</th>
                                                <th className="p-3">Primary Focus</th>
                                                <th className="p-3">Common Usage</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[#3D362E] font-medium">
                                            <tr className="border-b-2 border-dashed border-[#16130F33]">
                                                <td className="p-3 font-black text-[#16130F]">Statement of Purpose</td>
                                                <td className="p-3">Your future goals and how the program helps you achieve them. Purpose-focused.</td>
                                                <td className="p-3">USA, Canada, India (Masters/PhD)</td>
                                            </tr>
                                            <tr className="border-b-2 border-dashed border-[#16130F33] bg-[#FFF6E5]">
                                                <td className="p-3 font-black text-[#16130F]">Personal Statement</td>
                                                <td className="p-3">Your past journey and personal story-based motivations.</td>
                                                <td className="p-3">UK (UCAS undergraduate), USA</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 font-black text-[#16130F]">Letter of Motivation</td>
                                                <td className="p-3">Your enthusiasm and suitability for a research lab or curriculum.</td>
                                                <td className="p-3">Germany and European Union</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </InkCard>
                        </section>

                        {/* Interactive SOP Outline Generator Tool */}
                        <InkCard as="section" className="p-6 md:p-8 space-y-6" shadow="#D0362E">
                            <div className="flex items-start gap-3">
                                <span className="w-10 h-10 rounded-full border-2 border-[#16130F] bg-[#F2B705] grid place-items-center shrink-0 shadow-[2px_2px_0_#16130F]">
                                    <PenTool size={18} />
                                </span>
                                <DesiHeading hi="Outline banao">Interactive SOP Outline Generator</DesiHeading>
                            </div>
                            <p className="text-[#5B544A] text-[14px] font-medium">
                                Fill in your details below to generate a tailored structural outline draft for your Statement of Purpose.
                            </p>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Your Name</label>
                                    <input
                                        type="text"
                                        value={draftInput.name}
                                        onChange={e => setDraftInput({...draftInput, name: e.target.value})}
                                        placeholder="e.g. Rahul Sharma"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Target Course / Field</label>
                                    <input
                                        type="text"
                                        value={draftInput.field}
                                        onChange={e => setDraftInput({...draftInput, field: e.target.value})}
                                        placeholder="e.g. Computer Science"
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
                                        placeholder="e.g. Stanford University"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Core Project / Internship</label>
                                    <input
                                        type="text"
                                        value={draftInput.project}
                                        onChange={e => setDraftInput({...draftInput, project: e.target.value})}
                                        placeholder="e.g. Crop yield predictions using AI"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1.5">
                                    <label className={labelCls}>Long-term Career Goal</label>
                                    <input
                                        type="text"
                                        value={draftInput.goal}
                                        onChange={e => setDraftInput({...draftInput, goal: e.target.value})}
                                        placeholder="e.g. Building circular economy logistics startups in India"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="no-shine col-span-1 md:col-span-2 justify-self-start inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#16130F] bg-[#D0362E] hover:bg-[#B52A23] text-white font-bold text-[14px] shadow-[3px_3px_0_#16130F] transition-transform hover:-translate-y-0.5 cursor-pointer"
                                >
                                    <span className="relative z-10">Generate Outline Structure</span>
                                    <ArrowRight size={15} />
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
                                    <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Tumhara outline</p>
                                    <h4 className="-mt-2 font-urbanist font-black text-[18px]">Generated Outline Draft</h4>
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

                        {/* Formatting Breakdown: teal poster band */}
                        <section className="bg-[#14837E] border-[3px] border-[#16130F] p-6 md:p-8 shadow-[6px_6px_0_#16130F]" style={{ borderRadius: 18 }}>
                            <DesiHeading hi="Paragraph ka naksha" light>The 2025 SOP Paragraph Breakdown</DesiHeading>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: 'Paragraph 1: The Hook', text: 'Introduce your passion through a specific real-world incident or project instead of generic clichés.' },
                                    { title: 'Paragraph 2 & 3: Background', text: 'Connect NIT/IIT/University degrees, research papers, work history, and lessons learned.' },
                                    { title: 'Paragraph 4 & 5: Why this Course/Uni', text: 'Detail course modules, specific faculty labs, and campus culture alignment.' },
                                    { title: 'Paragraph 6 & 7: Goals & Conclusion', text: 'Explain short-term and long-term career aspirations, and summary fit.' },
                                ].map((p, idx) => {
                                    const tone = DESI_TONES[idx % DESI_TONES.length];
                                    return (
                                        <div key={p.title} className="flex gap-3 bg-white p-4 border-[3px] border-[#16130F] shadow-[4px_4px_0_#0B4F4C]"
                                            style={{ borderRadius: 12, transform: `rotate(${idx % 2 ? 0.6 : -0.6}deg)` }}>
                                            <span className="w-8 h-8 rounded-full border-2 border-[#16130F] font-urbanist font-black text-[14px] grid place-items-center shrink-0"
                                                style={{ background: tone.c, color: tone.fg }}>
                                                {idx + 1}
                                            </span>
                                            <p className="text-[#3D362E] text-[13.5px] leading-relaxed">
                                                <strong className="text-[#16130F]">{p.title}</strong> - {p.text}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* FAQs Section */}
                        <section>
                            <DesiHeading hi="Sabke sawaal">Frequently Asked Questions</DesiHeading>
                            <div className="mt-5 space-y-3">
                                {[
                                    {
                                        q: "Can I use the same SOP for multiple universities?",
                                        a: "No, you should customize at least 20-30% of your SOP for each university. Custom elements must outline why you chose their specific professors, labs, and curricula."
                                    },
                                    {
                                        q: "How do I explain a gap year in my SOP?",
                                        a: "Be honest. Address it briefly and focus on the skills you built during the gap, such as certificate courses, volunteering, or project work."
                                    },
                                    {
                                        q: "What is the best font and formatting for an SOP?",
                                        a: "Use standard readable fonts like Arial, Times New Roman, or Calibri in size 11 or 12. Use 1.5 line spacing and 1-inch margins on all sides."
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
                            text="SOP likh liya? Free 1:1 call mein mentor se check karwao."
                            cta="Book Free Counselling"
                        />

                    </div>

                </div>
            </div>
        </main>
    );
};

export default StatementOfPurposePage;
