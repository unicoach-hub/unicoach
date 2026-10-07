import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    BookOpen, 
    ChevronDown, 
    Sparkles, 
    Award, 
    Check, 
    FileText, 
    ArrowRight,
    HelpCircle,
    User,
    PenTool
} from 'lucide-react';

const StatementOfPurposePage = () => {
    const navigate = useNavigate();
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
                        Statement of Purpose (SOP) Guidelines
                    </h1>
                    <p className="text-slate-350 text-base md:text-lg mt-3 max-w-2xl font-medium">
                        Format, paragraph breakdowns, templates, and successful samples for Indian study abroad applicants.
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
                                    const isCurrent = sop.key === 'sop-general';
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
                        
                        {/* Intro Summary */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm space-y-4">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                What is a Statement of Purpose (SOP)?
                            </h2>
                            <p className="text-slate-650 leading-relaxed text-[0.96rem] font-medium">
                                For every Indian student dreaming of walking the halls of a global university, the Statement of Purpose (SOP) is the most crucial document you will write. It's more than just an essay; it's your voice in a stack of applications, your chance to tell the admissions committee who you are beyond your marksheets and test scores. As you prepare for the 2025-2026 intake, your SOP will be the bridge between your aspirations in India and your acceptance letter from universities in the USA, UK, Canada, or Australia.
                            </p>
                        </div>

                        {/* SOP vs Personal Statement Table */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-6 space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                SOP vs. Personal Statement vs. Letter of Motivation
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                                            <th className="p-3">Document</th>
                                            <th className="p-3">Primary Focus</th>
                                            <th className="p-3">Common Usage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-600 font-medium">
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-750">Statement of Purpose</td>
                                            <td className="p-3">Your future goals and how the program helps you achieve them. Purpose-focused.</td>
                                            <td className="p-3">USA, Canada, India (Masters/PhD)</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-750">Personal Statement</td>
                                            <td className="p-3">Your past journey and personal story-based motivations.</td>
                                            <td className="p-3">UK (UCAS undergraduate), USA</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-bold text-slate-750">Letter of Motivation</td>
                                            <td className="p-3">Your enthusiasm and suitability for a research lab or curriculum.</td>
                                            <td className="p-3">Germany and European Union</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Interactive SOP Outline Generator Tool */}
                        <section className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-2">
                                <PenTool className="text-[#DE5C2B]" size={22} />
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                    Interactive SOP Outline Generator
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-semibold">
                                Fill in your details below to generate a tailored structural outline draft for your Statement of Purpose.
                            </p>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Your Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.name}
                                        onChange={e => setDraftInput({...draftInput, name: e.target.value})}
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target Course / Field</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.field}
                                        onChange={e => setDraftInput({...draftInput, field: e.target.value})}
                                        placeholder="e.g. Computer Science"
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
                                        placeholder="e.g. Stanford University"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Core Project / Internship</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.project}
                                        onChange={e => setDraftInput({...draftInput, project: e.target.value})}
                                        placeholder="e.g. Crop yield predictions using AI"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Long-term Career Goal</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.goal}
                                        onChange={e => setDraftInput({...draftInput, goal: e.target.value})}
                                        placeholder="e.g. Building circular economy logistics startups in India"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="col-span-1 md:col-span-2 py-3.5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg transition-all cursor-pointer text-center"
                                >
                                    Generate Outline Structure
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Generated Outline Draft</h4>
                                    <div className="space-y-3">
                                        {generatedOutline.map((item, idx) => (
                                            <div key={idx} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-1">
                                                <span className="block text-xs font-extrabold text-indigo-600">{item.title}</span>
                                                <p className="text-xs text-slate-600 font-semibold leading-relaxed">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Formatting Breakdown */}
                        <div className="bg-indigo-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
                            <div className="flex items-center gap-2 mb-6">
                                <BookOpen className="text-indigo-300" size={24} />
                                <h3 className="text-xl font-bold tracking-tight">The 2025 SOP Paragraph Breakdown</h3>
                            </div>
                            <div className="space-y-4 text-xs font-bold text-slate-200">
                                <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-800/40">
                                    <strong>Paragraph 1: The Hook</strong> - Introduce your passion through a specific real-world incident or project instead of generic clichés.
                                </div>
                                <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-800/40">
                                    <strong>Paragraph 2 & 3: Background</strong> - Connect NIT/IIT/University degrees, research papers, work history, and lessons learned.
                                </div>
                                <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-800/40">
                                    <strong>Paragraph 4 & 5: Why this Course/Uni</strong> - Detail course modules, specific faculty labs, and campus culture alignment.
                                </div>
                                <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-800/40">
                                    <strong>Paragraph 6 & 7: Goals & Conclusion</strong> - Explain short-term and long-term career aspirations, and summary fit.
                                </div>
                            </div>
                        </div>

                        {/* FAQs Section */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                Frequently Asked Questions
                            </h3>
                            <div className="space-y-3">
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
                                        <div key={idx} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm transition-all duration-200">
                                            <button
                                                onClick={() => toggleFaq(idx)}
                                                className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-750 hover:text-indigo-600 transition-colors"
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

                        {/* Professional Guidance Card */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-150 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
                                    Need Expert Help with your SOP?
                                </h3>
                                <p className="text-slate-600 text-xs mt-1 max-w-xl font-semibold leading-relaxed">
                                    Get personalized 1-on-1 reviews, structural changes, and grammar edits from Ivy League alumni and study abroad mentors.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/book-consultation')}
                                className="px-6 py-3 rounded-full text-white font-bold text-xs bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg transition-all cursor-pointer flex-shrink-0"
                            >
                                Book Free Counselling
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </main>
    );
};

export default StatementOfPurposePage;
