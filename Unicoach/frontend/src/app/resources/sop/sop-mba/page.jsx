import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    FileText,
    ArrowRight,
    PenTool
} from 'lucide-react';
import { VersusCard } from '../../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../../components/desi/desiTokens';
import { BookOkCta } from '../../../../components/desi/BookOkCta';

const inputCls = "w-full bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg px-4 py-2.5 text-[14px] font-semibold text-[#16130F] placeholder:text-[#8A7F70] outline-none focus:bg-white focus:shadow-[3px_3px_0_#B8285B] transition-shadow";
const labelCls = "text-[11px] font-extrabold uppercase text-[#5B544A] tracking-wider";

const SOPMbaPage = () => {
    const [faqOpen, setFaqOpen] = useState({});
    const [draftInput, setDraftInput] = useState({ name: '', targetRole: '', targetIndustry: '', achievement: '', gap: '', university: '' });
    const [generatedOutline, setGeneratedOutline] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        const { targetRole, targetIndustry, achievement, gap, university } = draftInput;
        setGeneratedOutline([
            {
                title: "Section 1: The Hook & Career Catalyst",
                text: `Having spent several years executing strategies, I realized my long-term vision requires advanced business skills. For instance, while I managed '${achievement || 'my key project'}', I identified a gap in my knowledge regarding '${gap || 'my business skill gap'}'.`
            },
            {
                title: "Section 2: Why an MBA & Why Now?",
                text: `An MBA from ${university || 'the business school'} is the ideal catalyst for me at this point. It will help me transition into the role of ${targetRole || 'Product Manager'} in the ${targetIndustry || 'tech'} sector, bridging the gap between my engineering background and management requirements.`
            },
            {
                title: "Section 3: Professional Journey & Quantifiable Results",
                text: `In my previous role, I demonstrated leadership by coordinating cross-functional teams, resulting in measurable optimizations. Leveraging these skills, I hope to actively contribute to the student cohort at ${university || 'the university'}.`
            }
        ]);
    };

    const sopList = [
        { key: 'sop-general', name: 'General SOP Guide', path: '/resources/sop/statement-of-purpose' },
        { key: 'sop-masters', name: 'SOP for Masters', path: '/resources/sop/sop-masters' },
        { key: 'sop-mba', name: 'SOP for MBA', path: '/resources/sop/sop-mba' },
        { key: 'sop-phd', name: 'SOP for PhD', path: '/resources/sop/sop-phd' }
    ];
    const currentKey = 'sop-mba';

    return (
        <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">
            {/* ── HERO: rani poster band, with the two excerpts below side by side ── */}
            <DesiHero
                tone="rani"
                sign={{ hi: 'एमबीए एसओपी', en: 'MBA SOP' }}
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'SOP Guides' }, { label: 'SOP for MBA' }]}
                title="SOP for MBA Guide"
                subtitle="Structure approved by global business schools, outline generators, and samples for USA, Canada, and UK."
                stickers={(
                    <>
                        <Sticker tilt={-2}><FileText size={14} />Admissions Guides</Sticker>
                        <Sticker bg="#FCE38A" tilt={1.5}>USA</Sticker>
                        <Sticker tilt={-1}>Canada</Sticker>
                        <Sticker bg="#DDF3EF" tilt={1}>UK</Sticker>
                    </>
                )}
                aside={(
                    <div className="text-[#16130F] shadow-[6px_6px_0_#16130F] rounded-[18px]">
                        <VersusCard
                            kicker="Two admits, two angles"
                            title="Ross (USA) vs Rotman (Canada)"
                            left={{ title: 'Ross, Michigan', tag: 'USA', points: ['Led a team at a Bangalore SaaS startup', '25% increase in user acquisition', 'Draws on the MAP program'] }}
                            right={{ title: 'Rotman, Toronto', tag: 'Canada', points: ['Four years as a civil engineer in Delhi', 'Drawn to the Creative Destruction Lab', 'Plans to use the PGWP before returning to India'] }}
                        />
                    </div>
                )}
            />

            {/* ── SOP PICKER (phones and tablets) ── */}
            <div className="lg:hidden max-w-[1240px] mx-auto px-4 -mt-6 mb-8 relative z-10">
                <InkCard className="p-3">
                    <p className="font-['Rozha_One',serif] text-[14px] text-[#D0362E] leading-none px-1 mb-2">एसओपी गाइड</p>
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
                            <p className="font-['Rozha_One',serif] text-[15px] text-[#D0362E] leading-none">एसओपी गाइड</p>
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
                        <InkCard className="p-6 md:p-8" shadow="#B8285B">
                            <DesiHeading hi="बी-स्कूल का एसओपी">Crafting a Premium MBA Statement of Purpose</DesiHeading>
                            <p className="mt-3 text-[#5B544A] leading-relaxed text-[15px]">
                                Applying for an MBA abroad is a defining moment in your career. While your GMAT/GRE scores, academic transcripts, and work experience are crucial, the Statement of Purpose (SOP) is your only chance to speak directly to the admissions committee. It’s where the numbers on your resume transform into a compelling narrative of ambition, leadership, and potential. For Indian students aiming for top global B-schools in 2025, the competition is fiercer than ever.
                            </p>
                        </InkCard>

                        {/* Interactive Outline Generator */}
                        <InkCard as="section" className="p-6 md:p-8 space-y-6" shadow="#F2B705">
                            <div className="flex items-start gap-3">
                                <span className="w-10 h-10 rounded-full border-2 border-[#16130F] bg-[#B8285B] text-white grid place-items-center shrink-0 shadow-[2px_2px_0_#16130F]">
                                    <PenTool size={18} />
                                </span>
                                <DesiHeading hi="खाका बनाओ">MBA SOP Outline Generator</DesiHeading>
                            </div>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Your Name</label>
                                    <input
                                        type="text"
                                        value={draftInput.name}
                                        onChange={e => setDraftInput({...draftInput, name: e.target.value})}
                                        placeholder="e.g. Vikram Malhotra"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Target Post-MBA Role</label>
                                    <input
                                        type="text"
                                        value={draftInput.targetRole}
                                        onChange={e => setDraftInput({...draftInput, targetRole: e.target.value})}
                                        placeholder="e.g. Senior Consultant / Product Lead"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Target Industry</label>
                                    <input
                                        type="text"
                                        value={draftInput.targetIndustry}
                                        onChange={e => setDraftInput({...draftInput, targetIndustry: e.target.value})}
                                        placeholder="e.g. FinTech / Corporate Finance"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Key Professional Achievement</label>
                                    <input
                                        type="text"
                                        value={draftInput.achievement}
                                        onChange={e => setDraftInput({...draftInput, achievement: e.target.value})}
                                        placeholder="e.g. Managed GTM strategy for SaaS product"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Business Skill Gap</label>
                                    <input
                                        type="text"
                                        value={draftInput.gap}
                                        onChange={e => setDraftInput({...draftInput, gap: e.target.value})}
                                        placeholder="e.g. Global financial scaling strategies"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Target B-School</label>
                                    <input
                                        type="text"
                                        value={draftInput.university}
                                        onChange={e => setDraftInput({...draftInput, university: e.target.value})}
                                        placeholder="e.g. Ross School of Business (Michigan)"
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="no-shine col-span-1 md:col-span-2 justify-self-start inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#16130F] bg-[#D0362E] hover:bg-[#B52A23] text-white font-bold text-[14px] shadow-[3px_3px_0_#16130F] transition-transform hover:-translate-y-0.5 cursor-pointer"
                                >
                                    Build MBA Outline
                                    <ArrowRight size={15} />
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
                                    <p className="font-['Rozha_One',serif] text-[15px] text-[#D0362E] leading-none">आपका खाका</p>
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

                        {/* Country Specific Highlights: teal poster band */}
                        <section className="bg-[#14837E] border-[3px] border-[#16130F] p-6 md:p-8 shadow-[6px_6px_0_#16130F]" style={{ borderRadius: 18 }}>
                            <DesiHeading hi="असली नमूने" light>Successful MBA SOP Excerpts</DesiHeading>

                            <div className="mt-6 space-y-5">
                                {/* USA (Ross) */}
                                <div className="bg-white p-5 md:p-6 border-[3px] border-[#16130F] shadow-[4px_4px_0_#0B4F4C] space-y-3"
                                    style={{ borderRadius: 12, transform: 'rotate(-0.5deg)' }}>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md border-2 border-[#16130F] text-[12px] font-extrabold bg-[#F2B705] text-[#16130F]">
                                        USA Emphasis: Ross School of Business (Michigan)
                                    </span>
                                    <p className="text-[#3D362E] text-[14px] leading-relaxed border-l-[4px] border-[#F2B705] pl-4">
                                        "Leading a cross-functional team at a Bangalore-based SaaS startup, I successfully orchestrated the go-to-market strategy for a new analytics product, resulting in a 25% increase in user acquisition. This experience, however, exposed my limitations in scaling a product globally. I lacked the structured financial acumen to build a sustainable model. An MBA from Ross, with its Multidisciplinary Action Projects (MAP) program, will provide the strategic framework essential to transition to a global product leader."
                                    </p>
                                </div>

                                {/* Canada (Rotman) */}
                                <div className="bg-white p-5 md:p-6 border-[3px] border-[#16130F] shadow-[4px_4px_0_#0B4F4C] space-y-3"
                                    style={{ borderRadius: 12, transform: 'rotate(0.5deg)' }}>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md border-2 border-[#16130F] text-[12px] font-extrabold bg-[#B8285B] text-white">
                                        Canada Emphasis: Rotman School of Management (Toronto)
                                    </span>
                                    <p className="text-[#3D362E] text-[14px] leading-relaxed border-l-[4px] border-[#B8285B] pl-4">
                                        "My four years as a civil engineer on large-scale projects in Delhi highlighted the sector's inefficiencies. To drive meaningful change, I need to complement technical skills with robust management. I am drawn to Rotman for its Creative Destruction Lab. Post-MBA, I aim to work in a strategic role at SNC-Lavalin, utilizing Canada's Post-Graduation Work Permit (PGWP) to deploy my learnings before returning to India."
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* FAQs */}
                        <section>
                            <DesiHeading hi="अक्सर पूछे सवाल">Frequently Asked Questions</DesiHeading>
                            <div className="mt-5 space-y-3">
                                {[
                                    {
                                        q: "Can freshers apply for global MBA programs?",
                                        a: "While some universities admit freshers, top-tier B-schools generally require 2-5 years of post-qualification work experience. Freshers should emphasize university leadership, case study wins, and student festival coordination."
                                    },
                                    {
                                        q: "How long should an MBA SOP be?",
                                        a: "The standard word limit is between 800 and 1000 words. Always check specific B-school essay prompts since many require shorter answers to multiple prompt questions."
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
                            hi="एसओपी चेक करवाओ"
                            text="MBA essay likh liya? Free 1:1 call mein mentor se check karwao."
                        />

                    </div>

                </div>
            </div>
        </main>
    );
};

export default SOPMbaPage;
