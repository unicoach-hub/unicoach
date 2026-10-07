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
    Briefcase,
    FileCheck
} from 'lucide-react';

const LORBlogPage = () => {
    const navigate = useNavigate();
    const [faqOpen, setFaqOpen] = useState({});
    const [draftInput, setDraftInput] = useState({
        recommenderName: '',
        recommenderTitle: '',
        recommenderOrg: '',
        studentName: '',
        relationshipDuration: '',
        strength: '',
        project: '',
        targetUni: '',
        targetProgram: ''
    });
    const [generatedDraft, setGeneratedDraft] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        const { recommenderName, recommenderTitle, recommenderOrg, studentName, relationshipDuration, strength, project, targetUni, targetProgram } = draftInput;
        
        const rName = recommenderName || 'Dr. Karen Sebastian';
        const rTitle = recommenderTitle || 'Professor of Computer Science';
        const rOrg = recommenderOrg || 'University of Calgary';
        const sName = studentName || 'Lydia Roy';
        const duration = relationshipDuration || '4 years';
        const mainStrength = strength || 'exceptional analytical depth and diligent work ethic';
        const projectDesc = project || 'final year project on Cloud-assisted Data Analytics';
        const tUni = targetUni || 'University of Toronto';
        const tProg = targetProgram || 'Master’s in Computer Science';

        setGeneratedDraft([
            {
                title: "Salutation",
                text: `Dear Admissions Committee / Professor Jones,`
            },
            {
                title: "Paragraph 1: Introduction & Writer Context",
                text: `I am pleased to write this Letter of Recommendation for Miss ${sName} for a position in your ${tProg} program at ${tUni}. As a ${rTitle} at ${rOrg} with extensive research and teaching experience, I have trained many scholars. I have known ${sName} for ${duration}, during which she took courses under my supervision and completed research work under my guidance.`
            },
            {
                title: "Paragraph 2: Academic Capabilities & Strengths",
                text: `${sName} has consistently demonstrated ${mainStrength}. She has shown a natural flair for intellectual exploration and has the rare ability to remain meticulous under complex constraints. Her dedication to understanding theoretical concepts and translating them into practical solutions is highly commendable.`
            },
            {
                title: "Paragraph 3: Anecdote / The Breakthrough Story",
                text: `I witnessed her true potential during our work on the '${projectDesc}'. When our research team hit a major roadblock trying to optimize system parameters, ${sName} formulated an innovative solution. Her coding skills and willingness to tackle challenges independently opened up an entirely new pathway for the project.`
            },
            {
                title: "Paragraph 4: Conclusion & Strong Endorsement",
                text: `Given her remarkable credentials, code writing proficiency, and team spirit, I wholeheartedly endorse ${sName} for admission. She represents a valuable asset to any research community, particularly your program at ${tUni}. Feel free to contact me at my academic coordinates for further details.`
            },
            {
                title: "Sign Off",
                text: `Sincerely,\n\n${rName}\n${rTitle}\n${rOrg}`
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
            q: "Why are letters of recommendation important for studying abroad?",
            a: "LORs are crucial because they provide admissions committees with an objective, external assessment of your academic abilities, personal qualities, work ethic, and potential to succeed in a new international academic and cultural environment."
        },
        {
            q: "Who should write my LOR samples for studying abroad?",
            a: "Ideally, academic professors, advisors, or professional supervisors who have worked closely with you and can provide a credible, detailed evaluation of your achievements and character."
        },
        {
            q: "What is the use of LOR samples?",
            a: "LOR samples serve as structural and styling guides to show you the appropriate professional tone, spacing, paragraph structures, and details to include so that your recommenders can easily write a compelling letter."
        },
        {
            q: "Can family members or friends write my LOR samples?",
            a: "No, admissions committees expect recommendation letters to come from independent academic or professional sources to guarantee an unbiased, objective evaluation of your qualifications."
        },
        {
            q: "What information should be included in LOR samples for studying abroad?",
            a: "It should detail academic achievements, research publications, project details, personal qualities (e.g. teamwork, communication), and cross-cultural adaptability, backed up by real examples."
        },
        {
            q: "How far in advance should I ask for a letter of recommendation?",
            a: "You should approach your recommenders at least one month before the application deadline to give them adequate time to draft a polished and personalized letter."
        },
        {
            q: "Can I use the same LOR Samples for multiple study abroad programs?",
            a: "While the core content can remain similar, it is highly recommended to customize each letter's target university name and program fit to demonstrate genuine intent."
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
                        <span>Recommendation Guides</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl">
                        Letter of Recommendation (LOR) Samples & Formats
                    </h1>
                    <p className="text-slate-350 text-base md:text-lg mt-3 max-w-2xl font-medium">
                        Comprehensive guidelines, interactive draft builders, and sample templates to craft the perfect endorsement for 2025.
                    </p>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-[1240px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Left Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-2">
                                LOR Directory
                            </h3>
                            <nav className="flex flex-col gap-1">
                                {lorList.map((lor) => {
                                    const isCurrent = lor.key === 'lor-blog';
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

                    {/* Right Content */}
                    <div className="lg:col-span-3 space-y-10">
                        
                        {/* What is LOR */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm space-y-4">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                What is a Letter of Recommendation (LOR)?
                            </h2>
                            <p className="text-slate-650 leading-relaxed text-[0.96rem] font-medium">
                                A Letter of Recommendation (LOR) is a crucial document that provides a personal endorsement of an individual’s skills, qualifications, and character. Typically written by professors, mentors, or supervisors, an LOR offers an objective assessment of a candidate’s academic or professional abilities. This document is essential in various application processes, including those for Master’s and PhD programs, as it highlights the candidate’s strengths, achievements, and potential for success.
                            </p>
                            <p className="text-slate-650 leading-relaxed text-[0.96rem] font-medium">
                                A well-written LOR can significantly enhance an applicant’s profile, providing a compelling narrative that supports their application and sets them apart from other candidates in the admission committees' stacks.
                            </p>
                        </div>

                        {/* Types of LOR */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-3">
                                <div className="p-2.5 bg-orange-50 text-[#DE5C2B] rounded-xl w-fit">
                                    <BookOpen size={20} />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">Academic LOR</h3>
                                <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                                    Written by professors, teachers, or advisors who closely observed your academic performance. These letters emphasize intellectual capacity, research skills, GPA standing, and classroom engagement.
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-3">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                                    <Briefcase size={20} />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">Character Reference LOR</h3>
                                <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                                    Focuses on personal values, leadership, soft skills, and integrity. Typically authored by mentors, coaches, or community leaders who can verify your behavior, ethics, and team contributions.
                                </p>
                            </div>
                        </div>

                        {/* Format & Structure Table */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-6 space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                Structure and Paragraph-wise LOR Format
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                                            <th className="p-3">Section</th>
                                            <th className="p-3">Primary Focus & Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-600 font-medium">
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-750">Introduction</td>
                                            <td className="p-3">State relationship duration, designation of the recommender, and specific program targeting.</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-750">Candidate Strengths</td>
                                            <td className="p-3">Meticulousness, analytical capacity, initiative-taking, and technical mastery (e.g. coding).</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-750">Personal Anecdote</td>
                                            <td className="p-3">Detail a small story where the candidate overcame a project roadblock or suggested a novel solution.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-bold text-slate-750">Closing & Sign Off</td>
                                            <td className="p-3">Reaffirm support, clarify willingness to be contacted, and provide name, phone, and professional email ID.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Interactive Widget */}
                        <section className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <PenTool className="text-[#DE5C2B]" size={22} />
                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                        Interactive LOR Draft Builder
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDraftInput({
                                        recommenderName: "Dr. Karen Sebastian",
                                        recommenderTitle: "Professor of Computer Science",
                                        recommenderOrg: "University of Calgary",
                                        studentName: "Lydia Roy",
                                        relationshipDuration: "4 years",
                                        strength: "exceptional cloud programming abilities",
                                        targetUni: "University of Toronto",
                                        targetProgram: "Master's in Computer Science",
                                        project: "final year project resolving network bottlenecks using edge servers"
                                    })}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer w-fit border border-indigo-100"
                                >
                                    ✨ Auto-Fill Sample Data
                                </button>
                            </div>
                            <p className="text-slate-500 text-xs font-normal">
                                Provide your recommender details and core accomplishments to assemble a highly professional recommendation structure.
                            </p>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Recommender Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.recommenderName}
                                        onChange={e => setDraftInput({...draftInput, recommenderName: e.target.value})}
                                        placeholder="e.g. Dr. Karen Sebastian"
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
                                        placeholder="e.g. Professor of Computer Science"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Recommender Organization</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.recommenderOrg}
                                        onChange={e => setDraftInput({...draftInput, recommenderOrg: e.target.value})}
                                        placeholder="e.g. University of Calgary"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Student Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.studentName}
                                        onChange={e => setDraftInput({...draftInput, studentName: e.target.value})}
                                        placeholder="e.g. Lydia Roy"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Relationship Duration</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.relationshipDuration}
                                        onChange={e => setDraftInput({...draftInput, relationshipDuration: e.target.value})}
                                        placeholder="e.g. 4 years"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Core Strength</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.strength}
                                        onChange={e => setDraftInput({...draftInput, strength: e.target.value})}
                                        placeholder="e.g. exceptional cloud programming abilities"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target University</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.targetUni}
                                        onChange={e => setDraftInput({...draftInput, targetUni: e.target.value})}
                                        placeholder="e.g. University of Toronto"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target Program</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.targetProgram}
                                        onChange={e => setDraftInput({...draftInput, targetProgram: e.target.value})}
                                        placeholder="e.g. Master's in Computer Science"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Anecdotal Project / Core Achievement</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.project}
                                        onChange={e => setDraftInput({...draftInput, project: e.target.value})}
                                        placeholder="e.g. final year project resolving network bottlenecks using edge servers"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="col-span-1 md:col-span-2 py-3.5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg transition-all cursor-pointer text-center"
                                >
                                    Generate Draft Framework
                                </button>
                            </form>

                            {generatedDraft && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Generated Outline Draft</h4>
                                    <div className="space-y-3">
                                        {generatedDraft.map((item, idx) => (
                                            <div key={idx} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-1">
                                                <span className="block text-xs font-extrabold text-indigo-600">{item.title}</span>
                                                <p className="text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-line">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Calgary to Toronto Sample Transcript */}
                        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                                <Award className="text-yellow-600" size={24} />
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                    Sample LOR: University Professor Recommending to Master's Program
                                </h3>
                            </div>
                            
                            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 font-semibold text-xs md:text-sm text-slate-700 space-y-4 leading-relaxed font-mono whitespace-pre-wrap">
{`Karen Sebastian
Department of Computer Science, University of Calgary.
karen.sebastian@ucalgary.ca

Dear Professor Jones,

I am pleased to recommend Miss Lydia Roy for a position in your Master’s program at the University of Toronto. I have known Lydia for six years, since her undergraduate days at the University of Calgary. Our association started when she took a Data Science course under my supervision for six months.

After that, we became friends through our shared love for computer science, and she again took up work under me for her final year project. After these four years of undergraduate work, we continued to remain associated, even when she went to work for Google in the spring of 2019. After two years, she wanted to switch to academics again, so she began applying for Master’s programs. The University of Toronto was her top choice. As a twenty-year professor with hundreds of students trained under me, I believe I have the right to write a suitable recommendation letter to you.

Even when she was at the University of Calgary, I noticed she possessed a keen insight into people. She was an excellent people person, a close confidante of many friends and a class leader. At one time, she also ran for the student union president but had to be content with the Treasurer’s role. Her love for mixing technology with people turned her interest in social media and digital marketing. She often discussed with me how the digital platform could be harnessed to make a common marketplace for the world. Her desire to unite people and create a virtual world where people could fairly earn their money challenges the trickle-down economics of the present day.

Apart from her interests, she is also a diligent worker and an excellent computer programmer. She has worked in several domains, including cloud computing, networking and data science. Her field knowledge is extensive, and she retains it remarkably well. Her many varied interests make her a valuable asset in the research field. Since she intends to pursue building a digital marketplace, I highly recommend her to your program as you, too, are interested in bridging the human-computer divide. It is with great pleasure and satisfaction that I give my sincere recommendation.

Sincerely, 
Karen Sebastian`}
                            </div>
                        </div>

                        {/* Tone & Length Tips */}
                        <div className="bg-indigo-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
                            <div className="flex items-center gap-2 mb-4">
                                <FileCheck className="text-indigo-300" size={24} />
                                <h3 className="text-lg font-bold tracking-tight">Professional Tone Guidelines</h3>
                            </div>
                            <ul className="space-y-3 text-xs font-bold text-slate-200 list-disc list-inside">
                                <li><strong>Objective Endorsement:</strong> Maintain a formal, objective, and respectful tone throughout. Avoid hyperbole; instead, justify praise with real data or events.</li>
                                <li><strong>Concise Delivery:</strong> Keep the letter within 1 to 2 pages maximum. A long, repetitive letter risks losing the committee's interest.</li>
                                <li><strong>Academic Grammar:</strong> Eliminate personal bias or colloquial terms, opting for clear academic and professional phrasing.</li>
                                <li><strong>Relevance:</strong> Direct strengths toward the target course requirements. If applying for CS, highlight computational logic and project breakthroughs.</li>
                            </ul>
                        </div>

                        {/* FAQs Section */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                                <HelpCircle className="text-indigo-600" size={20} />
                                Frequently Asked Questions
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

                        {/* Expert Consultation CTA */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-150 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
                                    Confused about getting your LOR verified?
                                </h3>
                                <p className="text-slate-600 text-xs mt-1 max-w-xl font-semibold leading-relaxed">
                                    UniCoach experts help you short-list recommenders, review templates, and coordinate submissions with international universities.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/book-consultation')}
                                className="px-6 py-3 rounded-full text-white font-bold text-xs bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg transition-all cursor-pointer flex-shrink-0"
                            >
                                Connect with Experts
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </main>
    );
};

export default LORBlogPage;
