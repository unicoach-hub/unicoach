import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    BookOpen, 
    ChevronDown, 
    Sparkles, 
    Award, 
    Check, 
    FileText, 
    ArrowRight,
    HelpCircle,
    PenTool
} from 'lucide-react';

const SOPMbaPage = () => {
    const [faqOpen, setFaqOpen] = useState({});
    const [draftInput, setDraftInput] = useState({ name: '', targetRole: '', targetIndustry: '', achievement: '', gap: '', university: '' });
    const [generatedOutline, setGeneratedOutline] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        const { name, targetRole, targetIndustry, achievement, gap, university } = draftInput;
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

    return (
        <main className="min-h-screen bg-slate-50/50 pt-24 pb-16">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden py-12 md:py-16 px-6 md:px-12 mb-12 shadow-md">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#DE5C2B_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="max-w-[1240px] mx-auto relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                        <Sparkles size={12} className="text-indigo-400" />
                        <span>Admissions Guides</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl">
                        SOP for MBA Guide
                    </h1>
                    <p className="text-slate-350 text-base md:text-lg mt-3 max-w-2xl font-medium">
                        Structure approved by global business schools, outline generators, and samples for USA, Canada, and UK.
                    </p>
                </div>
            </div>

            {/* Split View */}
            <div className="max-w-[1240px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Left Sticky Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-2">
                                SOP Categories
                            </h3>
                            <nav className="flex flex-col gap-1">
                                {sopList.map((sop) => {
                                    const isCurrent = sop.key === 'sop-mba';
                                    return (
                                        <Link
                                            key={sop.key}
                                            to={sop.path}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-[0.88rem] font-bold transition-all duration-200
                                                ${isCurrent 
                                                    ? 'bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white shadow-md shadow-indigo-600/15'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className={isCurrent ? 'text-white' : 'text-slate-400'} />
                                                <span>{sop.name}</span>
                                            </div>
                                            <ArrowRight size={14} className={`opacity-80 transition-transform ${isCurrent ? 'translate-x-0.5' : 'text-slate-300'}`} />
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Right Core Content */}
                    <div className="lg:col-span-3 space-y-10">
                        
                        {/* Summary */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm space-y-4">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                Crafting a Premium MBA Statement of Purpose
                            </h2>
                            <p className="text-slate-650 leading-relaxed text-[0.96rem] font-medium">
                                Applying for an MBA abroad is a defining moment in your career. While your GMAT/GRE scores, academic transcripts, and work experience are crucial, the Statement of Purpose (SOP) is your only chance to speak directly to the admissions committee. It’s where the numbers on your resume transform into a compelling narrative of ambition, leadership, and potential. For Indian students aiming for top global B-schools in 2025, the competition is fiercer than ever.
                            </p>
                        </div>

                        {/* Interactive Outline Generator */}
                        <section className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-2">
                                <PenTool className="text-[#DE5C2B]" size={22} />
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                    MBA SOP Outline Generator
                                </h3>
                            </div>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Your Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.name}
                                        onChange={e => setDraftInput({...draftInput, name: e.target.value})}
                                        placeholder="e.g. Vikram Malhotra"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target Post-MBA Role</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.targetRole}
                                        onChange={e => setDraftInput({...draftInput, targetRole: e.target.value})}
                                        placeholder="e.g. Senior Consultant / Product Lead"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target Industry</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.targetIndustry}
                                        onChange={e => setDraftInput({...draftInput, targetIndustry: e.target.value})}
                                        placeholder="e.g. FinTech / Corporate Finance"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Key Professional Achievement</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.achievement}
                                        onChange={e => setDraftInput({...draftInput, achievement: e.target.value})}
                                        placeholder="e.g. Managed GTM strategy for SaaS product"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Business Skill Gap</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.gap}
                                        onChange={e => setDraftInput({...draftInput, gap: e.target.value})}
                                        placeholder="e.g. Global financial scaling strategies"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target B-School</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.university}
                                        onChange={e => setDraftInput({...draftInput, university: e.target.value})}
                                        placeholder="e.g. Ross School of Business (Michigan)"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="col-span-1 md:col-span-2 py-3.5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg transition-all cursor-pointer text-center"
                                >
                                    Build MBA Outline
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Outline Results</h4>
                                    <div className="space-y-3">
                                        {generatedOutline.map((item, idx) => (
                                            <div key={idx} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-1">
                                                <span className="block text-xs font-extrabold text-[#DE5C2B]">{item.title}</span>
                                                <p className="text-xs text-slate-650 font-semibold leading-relaxed">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Country Specific Highlights */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                Successful MBA SOP Excerpts
                            </h3>

                            {/* USA (Ross) */}
                            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#DE5C2B]">
                                    USA Emphasis: Ross School of Business (Michigan)
                                </span>
                                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold">
                                    "Leading a cross-functional team at a Bangalore-based SaaS startup, I successfully orchestrated the go-to-market strategy for a new analytics product, resulting in a 25% increase in user acquisition. This experience, however, exposed my limitations in scaling a product globally. I lacked the structured financial acumen to build a sustainable model. An MBA from Ross, with its Multidisciplinary Action Projects (MAP) program, will provide the strategic framework essential to transition to a global product leader."
                                </p>
                            </div>

                            {/* Canada (Rotman) */}
                            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-650">
                                    Canada Emphasis: Rotman School of Management (Toronto)
                                </span>
                                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold">
                                    "My four years as a civil engineer on large-scale projects in Delhi highlighted the sector's inefficiencies. To drive meaningful change, I need to complement technical skills with robust management. I am drawn to Rotman for its Creative Destruction Lab. Post-MBA, I aim to work in a strategic role at SNC-Lavalin, utilizing Canada's Post-Graduation Work Permit (PGWP) to deploy my learnings before returning to India."
                                </p>
                            </div>
                        </section>

                        {/* FAQs */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Frequently Asked Questions</h3>
                            <div className="space-y-3">
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
                                        <div key={idx} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm transition-all duration-200">
                                            <button
                                                onClick={() => toggleFaq(idx)}
                                                className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-755 hover:text-[#DE5C2B] transition-colors"
                                            >
                                                <span>{faq.q}</span>
                                                <ChevronDown 
                                                    size={16} 
                                                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} 
                                                />
                                            </button>
                                            
                                            {isOpen && (
                                                <div className="px-5 pb-5 pt-1 text-slate-600 text-xs md:text-sm border-t border-slate-50 leading-relaxed font-semibold">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                    </div>

                </div>
            </div>
        </main>
    );
};

export default SOPMbaPage;
