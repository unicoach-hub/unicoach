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
    PenTool,
    Atom,
    GitBranch,
    Lightbulb
} from 'lucide-react';

const LORPhdPage = () => {
    const navigate = useNavigate();
    const [faqOpen, setFaqOpen] = useState({});
    const [draftInput, setDraftInput] = useState({
        studentName: '',
        researchField: '',
        thesisSubject: '',
        recommenderName: '',
        recommenderTitle: '',
        recommenderLab: '',
        keyPublication: '',
        masteryMethod: ''
    });
    const [generatedOutline, setGeneratedOutline] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        const { studentName, researchField, thesisSubject, recommenderName, recommenderTitle, recommenderLab, keyPublication, masteryMethod } = draftInput;

        const sName = studentName || 'Priyanshu Gupta';
        const rField = researchField || 'Quantum Computing';
        const tSubj = thesisSubject || 'error correction protocols in silicon spin qubits';
        const rName = recommenderName || 'Dr. Arthur Pendelton';
        const rTitle = recommenderTitle || 'Principal Investigator';
        const rLab = recommenderLab || 'Quantum Systems Laboratory, IISc Bangalore';
        const pub = keyPublication || 'IEEE Transactions on Quantum Engineering 2025';
        const method = masteryMethod || 'low-temperature cryogenics measurements and RF reflectometry';

        setGeneratedOutline([
            {
                title: "Paragraph 1: Research Context & Academic Scope",
                text: `State that Dr. ${rName} (${rTitle} of the ${rLab}) is writing to endorse ${sName} for a PhD position. Clarify that ${sName} worked as a research assistant under their direct supervision, focusing specifically on ${rField}.`
            },
            {
                title: "Paragraph 2: Technical Mastery & Methodologies",
                text: `Elaborate on ${sName}'s hands-on laboratory capabilities. Specify their expertise in ${method}. Highlight their meticulous design of experimental setups and cleanroom fabrications.`
            },
            {
                title: "Paragraph 3: Autonomy, publications, & road-blocks",
                text: `Describe a specific research breakthrough. Highlight that the student co-authored the paper titled "${pub}" which was published in a peer-reviewed journal. Detail their capability to troubleshoot equipment and mathematical models independently when initial results failed.`
            },
            {
                title: "Paragraph 4: Academic Maturity & Graduate Potential",
                text: `Discuss ${sName}'s stamina, capacity for independent literature review, and collaboration within the laboratory. Confirm that their deep work in ${tSubj} represents a substantial foundational skill set for a PhD candidate.`
            },
            {
                title: "Paragraph 5: Reaffirmation & Project Alignment",
                text: `Strongly recommend ${sName} for admission. Note that they possess the intellectual stamina and research ethics required for doctoral studies. State availability for phone or video follow-up.`
            }
        ]);
    };

    const lorList = [
        { key: 'lor-blog', name: 'General LOR Guide', path: '/resources/lor/lor-blog' },
        { key: 'lor-masters', name: 'LOR for Masters', path: '/resources/lor/lor-masters' },
        { key: 'lor-phd', name: 'LOR for PhD', path: '/resources/lor/lor-phd' }
    ];

    const faqs = [
        {
            q: "What makes a PhD recommendation letter different from a Masters LOR?",
            a: "A PhD LOR focuses heavily on independent research capabilities, intellectual stamina, and laboratory competency rather than just coursework grades. Recommenders must evaluate your ability to handle research setbacks, formulate hypotheses, write papers, and work autonomously."
        },
        {
            q: "Can I use a professional LOR from a corporate manager for a PhD application?",
            a: "Generally, academic references from research supervisors are highly preferred. However, a professional reference is acceptable if you worked in a research-and-development (R&D) lab or an industrial tech role where you published patents, white papers, or developed novel algorithms."
        },
        {
            q: "How important is the recommender's academic profile (h-index)?",
            a: "A recommender with an active publishing record and recognized name in your field adds significant weight to the endorsement. However, a highly detailed, personalized letter from an assistant professor who worked closely with you is better than a generic letter from a famous professor who barely knows you."
        },
        {
            q: "Do PhD admission committees contact recommenders directly?",
            a: "Yes. In doctoral admissions, committees often review letters very carefully and may contact your supervisor directly via email or phone to discuss your research achievements and laboratory habits before final selection."
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50/50 pt-24 pb-16">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden py-12 md:py-16 px-6 md:px-12 mb-12 shadow-md">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#DE5C2B_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="max-w-[1240px] mx-auto relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                        <Sparkles size={12} className="text-indigo-400" />
                        <span>Doctoral Admissions</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl">
                        Letter of Recommendation (LOR) for PhD
                    </h1>
                    <p className="text-slate-350 text-base md:text-lg mt-3 max-w-2xl font-medium">
                        Highlighting independent research capabilities, thesis advisor alignments, publication records, and laboratory expertise.
                    </p>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="max-w-[1240px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Left Sticky Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-2">
                                LOR Directory
                            </h3>
                            <nav className="flex flex-col gap-1">
                                {lorList.map((lor) => {
                                    const isCurrent = lor.key === 'lor-phd';
                                    return (
                                        <Link
                                            key={lor.key}
                                            to={lor.path}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-[0.88rem] font-bold transition-all duration-200
                                                ${isCurrent 
                                                    ? 'bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white shadow-md shadow-indigo-600/15'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className={isCurrent ? 'text-white' : 'text-slate-400'} />
                                                <span>{lor.name}</span>
                                            </div>
                                            <ArrowRight size={14} className={`opacity-80 transition-transform ${isCurrent ? 'translate-x-0.5' : 'text-slate-300'}`} />
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Right Content Column */}
                    <div className="lg:col-span-3 space-y-10">
                        
                        {/* Overview Section */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm space-y-4">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                Writing a PhD LOR: Key Differences
                            </h2>
                            <p className="text-slate-650 leading-relaxed text-[0.96rem] font-medium">
                                A doctoral degree is a test of research endurance and autonomy. Admissions committees for PhD programs want to see evidence that the candidate can formulate original scientific questions, design experimental configurations, publish research in respected journals, and troubleshoot model failures independently.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                                    <Atom className="text-indigo-600" size={20} />
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Technical Mastery</h4>
                                    <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">Detailed descriptions of instrument setups, coding libraries, computational algorithms, and methodologies mastered.</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                                    <GitBranch className="text-indigo-600" size={20} />
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Publications & Patents</h4>
                                    <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">Excerpts mentioning co-authored research papers, presentation files, conference proceedings, or workshop drafts.</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                                    <Lightbulb className="text-indigo-600" size={20} />
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Intellectual Autonomy</h4>
                                    <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">Accounts of the student overcoming failed trials, fixing experimental design flaws, and carrying out solo literature reviews.</p>
                                </div>
                            </div>
                        </div>

                        {/* PhD LOR Builder Widget */}
                        <section className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-2">
                                <PenTool className="text-[#DE5C2B]" size={22} />
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                    PhD Research LOR Builder
                                </h3>
                            </div>
                            <p className="text-slate-500 text-xs font-semibold">
                                Input research parameters to construct a structured recommendation template designed for thesis advisors and PIs.
                            </p>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Candidate Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.studentName}
                                        onChange={e => setDraftInput({...draftInput, studentName: e.target.value})}
                                        placeholder="e.g. Priyanshu Gupta"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Research Field</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.researchField}
                                        onChange={e => setDraftInput({...draftInput, researchField: e.target.value})}
                                        placeholder="e.g. Quantum Computing"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Recommender / PI Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.recommenderName}
                                        onChange={e => setDraftInput({...draftInput, recommenderName: e.target.value})}
                                        placeholder="e.g. Dr. Arthur Pendelton"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Recommender Title</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.recommenderTitle}
                                        onChange={e => setDraftInput({...draftInput, recommenderTitle: e.target.value})}
                                        placeholder="e.g. Principal Investigator / Senior Professor"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Laboratory Name & Institution</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.recommenderLab}
                                        onChange={e => setDraftInput({...draftInput, recommenderLab: e.target.value})}
                                        placeholder="e.g. Quantum Systems Laboratory, IISc Bangalore"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Thesis / Dissertation Subject</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.thesisSubject}
                                        onChange={e => setDraftInput({...draftInput, thesisSubject: e.target.value})}
                                        placeholder="e.g. error correction protocols in silicon spin qubits"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Key Publication Reference</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.keyPublication}
                                        onChange={e => setDraftInput({...draftInput, keyPublication: e.target.value})}
                                        placeholder="e.g. Nature Physics 2025"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Core Research Methodology / Instrument Mastery</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.masteryMethod}
                                        onChange={e => setDraftInput({...draftInput, masteryMethod: e.target.value})}
                                        placeholder="e.g. low-temperature cryogenics measurements and RF reflectometry"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="col-span-1 md:col-span-2 py-3.5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg transition-all cursor-pointer text-center"
                                >
                                    Build PhD Outline Draft
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">PhD Outline Draft Framework</h4>
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

                        {/* PhD Sample Transcript */}
                        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                                <Award className="text-yellow-600" size={24} />
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                    Sample PhD Recommendation Letter
                                </h3>
                            </div>
                            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 font-semibold text-xs md:text-sm text-slate-700 space-y-4 leading-relaxed font-mono whitespace-pre-wrap">
{`Dear Doctoral Admissions Committee,

I am writing this letter of recommendation to express my strongest endorsement of Priyanshu Gupta for admission into your PhD program. I serve as the Principal Investigator of the Quantum Systems Laboratory at IISc Bangalore, and have supervised Priyanshu for the past two and a half years during his tenure as a Research Assistant.

During his association with our lab, Priyanshu worked extensively on error correction protocols in silicon spin qubits. He demonstrated a remarkable grasp of technical methodologies, particularly in low-temperature cryogenics measurements and RF reflectometry. Priyanshu is not merely a technician who follows orders; he is a deep thinker who designs and debugs his own experimental setups.

What sets Priyanshu apart is his intellectual stamina and resilience. When working on our spin-qubit coherence trials last winter, we hit a major wall due to high-frequency phase noise. Priyanshu spent weeks carrying out an exhaustive literature review, ultimately developing a software-defined filtering scheme that mitigated the noise by 18dB. This breakthrough allowed us to submit a co-authored paper to Nature Physics in 2025, where he was listed as second author.

In addition to his laboratory competence, Priyanshu is an excellent communicator and collaborator. He was frequently requested to train junior interns on the dilution refrigerator protocols, displaying patience and pedagogical clarity. He possesses the intellectual autonomy, maturity, and ethics necessary to excel in a demanding doctoral program.

I highly recommend Priyanshu Gupta for your PhD program without reservation. I am confident he will make significant contributions to your laboratory and the wider scientific field. Please feel free to contact me directly at my IISc coordinates if you require any additional insights.

Sincerely,

Dr. Arthur Pendelton
Principal Investigator, Quantum Systems Lab
Indian Institute of Science (IISc), Bangalore
a.pendelton@iisc.ac.in
+91-80-XXXX-XXXX`}
                            </div>
                        </div>

                        {/* FAQs Section */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                                <HelpCircle className="text-indigo-600" size={20} />
                                PhD Recommendation FAQs
                            </h3>
                            <div className="space-y-3">
                                {faqs.map((faq, idx) => {
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
                                                <div className="px-5 pb-5 pt-1 text-slate-650 text-xs md:text-sm border-t border-slate-50 leading-relaxed font-semibold">
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

export default LORPhdPage;
