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
                        SOP for PhD Guide
                    </h1>
                    <p className="text-slate-350 text-base md:text-lg mt-3 max-w-2xl font-medium">
                        Research proposals format, literature reviews mapping, and faculty alignment tips for doctoral candidates.
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
                                    const isCurrent = sop.key === 'sop-phd';
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
                                Writing a PhD Statement of Purpose
                            </h2>
                            <p className="text-slate-650 leading-relaxed text-[0.96rem] font-medium">
                                A PhD Statement of Purpose is significantly different from a Master's or MBA SOP. Instead of focusing heavily on career pivot stories, a doctoral SOP must demonstrate deep research potential, familiarity with modern academic literature, and clear alignment with specific faculty members at the target university. It is a technical research statement rather than a general essay.
                            </p>
                        </div>

                        {/* Interactive Outline Generator */}
                        <section className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-2">
                                <PenTool className="text-[#DE5C2B]" size={22} />
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                    PhD Research Outline Builder
                                </h3>
                            </div>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Your Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.name}
                                        onChange={e => setDraftInput({...draftInput, name: e.target.value})}
                                        placeholder="e.g. Dr. Pooja Iyer"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Academic Field</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.academicField}
                                        onChange={e => setDraftInput({...draftInput, academicField: e.target.value})}
                                        placeholder="e.g. Materials Engineering"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Research Proposal Topic</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.researchTopic}
                                        onChange={e => setDraftInput({...draftInput, researchTopic: e.target.value})}
                                        placeholder="e.g. Perovskite solar cell degradation kinetics"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Prior Thesis / Publications</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.priorResearch}
                                        onChange={e => setDraftInput({...draftInput, priorResearch: e.target.value})}
                                        placeholder="e.g. Synthesis of lead-free halides in M.Tech"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target Professor</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.targetProfessor}
                                        onChange={e => setDraftInput({...draftInput, targetProfessor: e.target.value})}
                                        placeholder="e.g. Dr. Emily Carter"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target University</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.university}
                                        onChange={e => setDraftInput({...draftInput, university: e.target.value})}
                                        placeholder="e.g. Princeton University"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="col-span-1 md:col-span-2 py-3.5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg transition-all cursor-pointer text-center"
                                >
                                    Build PhD Outline
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

                        {/* Critical Steps for PhD SOP */}
                        <div className="bg-indigo-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md space-y-4">
                            <div className="flex items-center gap-2">
                                <Award className="text-indigo-300" size={24} />
                                <h3 className="text-xl font-bold tracking-tight">Key Writing Checklist for PhD SOPs</h3>
                            </div>
                            <ul className="space-y-3 text-xs text-slate-250 font-bold">
                                <li className="flex gap-2">
                                    <Check size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                    <span>Establish research gaps in the literature immediately in Paragraph 1 or 2.</span>
                                </li>
                                <li className="flex gap-2">
                                    <Check size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                    <span>Cite 1-2 research papers authored by your target supervisor at the university.</span>
                                </li>
                                <li className="flex gap-2">
                                    <Check size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                    <span>Demonstrate laboratory experience, instrument usage, or quantitative analysis coding.</span>
                                </li>
                            </ul>
                        </div>

                        {/* FAQs */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Frequently Asked Questions</h3>
                            <div className="space-y-3">
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

export default SOPPhdPage;
