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
                        SOP for Masters Guide
                    </h1>
                    <p className="text-slate-350 text-base md:text-lg mt-3 max-w-2xl font-medium">
                        Writing guidelines, samples for engineering & nursing, and outline drafting tools for MS applicants.
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
                                    const isCurrent = sop.key === 'sop-masters';
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
                                Writing an SOP for Masters (MS)
                            </h2>
                            <p className="text-slate-650 leading-relaxed text-[0.96rem] font-medium">
                                Dreaming of a master's degree from a top university in the USA, UK, or Canada? Your academic scores and project list are ready, but there's one crucial document that can make or break your application: the Statement of Purpose (SOP). For thousands of Indian students every year, the SOP is the single most important part of their application package. It’s your chance to speak directly to the admissions committee and tell them who you are beyond the marksheets.
                            </p>
                        </div>

                        {/* Interactive Outline Generator */}
                        <section className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-2">
                                <PenTool className="text-[#DE5C2B]" size={22} />
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                    Masters SOP Outline Builder
                                </h3>
                            </div>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Your Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.name}
                                        onChange={e => setDraftInput({...draftInput, name: e.target.value})}
                                        placeholder="e.g. Aditi Sen"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Bachelor Degree</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.degree}
                                        onChange={e => setDraftInput({...draftInput, degree: e.target.value})}
                                        placeholder="e.g. B.E. Electrical Engineering"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Motivation / Key Concept</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.motivation}
                                        onChange={e => setDraftInput({...draftInput, motivation: e.target.value})}
                                        placeholder="e.g. Sustainable electronic drives"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Core Skill Built</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.skill}
                                        onChange={e => setDraftInput({...draftInput, skill: e.target.value})}
                                        placeholder="e.g. MATLAB & Simulink scripting"
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
                                        placeholder="e.g. University of Glasgow"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Major Project Title</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.project}
                                        onChange={e => setDraftInput({...draftInput, project: e.target.value})}
                                        placeholder="e.g. Co-Simulation of electric traction drive"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="col-span-1 md:col-span-2 py-3.5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg transition-all cursor-pointer text-center"
                                >
                                    Build Masters Outlines
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Outline Result</h4>
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

                        {/* Real Samples Excerpts */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                Successful Masters SOP Samples
                            </h3>

                            {/* Sample 1: Electronics Glasgow */}
                            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#DE5C2B]">
                                    Admit: MSc Electronics & Electrical Engineering, Glasgow (UK)
                                </span>
                                <h4 className="font-bold text-slate-800 text-[0.98rem]">Engineering SOP Excerpt</h4>
                                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold">
                                    "I completed an internship at VI SOLUTIONS in the department of designing electric vehicles... Apart from industrial visits, I have done a project on the Co-Simulation of an electric traction drive, which is a combination of three domains, from where I learned many basic and advanced things in system and control areas... At this juncture, I have decided to pursue a master's degree in MSc Electronics & Electrical Engineering at the University of Glasgow because, after working at General Electric, I realized my knowledge needs advancement."
                                </p>
                            </div>

                            {/* Sample 2: Nursing GCU */}
                            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                                    Admit: MSc Nursing, Glasgow Caledonian (UK)
                                </span>
                                <h4 className="font-bold text-slate-800 text-[0.98rem]">Nursing SOP Excerpt</h4>
                                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold">
                                    "My college education helped me develop a strong intellectual foundation, strengthened my communication, and helped me explore nursing skills... Shadowing healthcare professionals on their daily duties showed me how strenuous and challenging the role of a nurse is. However, it also allowed me to work closely with patients and their families, and that became my inspiration for showing up to work each morning."
                                </p>
                            </div>
                        </section>

                        {/* FAQs */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight pl-1">Frequently Asked Questions</h3>
                            <div className="space-y-3">
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

export default SOPMastersPage;
