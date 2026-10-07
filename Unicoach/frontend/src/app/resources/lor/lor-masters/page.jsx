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
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

const LORMastersPage = () => {
    const navigate = useNavigate();
    const [faqOpen, setFaqOpen] = useState({});
    const [recommenderType, setRecommenderType] = useState('academic'); // 'academic' or 'professional'
    const [draftInput, setDraftInput] = useState({
        studentName: '',
        degreeName: '',
        subjectName: '',
        targetProgram: '',
        strengthQuality: '',
        keyAchievement: '',
        writerName: '',
        writerTitle: '',
        companyOrUni: ''
    });
    const [generatedOutline, setGeneratedOutline] = useState(null);

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        const { studentName, degreeName, subjectName, targetProgram, strengthQuality, keyAchievement, writerName, writerTitle, companyOrUni } = draftInput;

        const sName = studentName || '[Student Name]';
        const dName = degreeName || 'Bachelor of Science';
        const subj = subjectName || 'Data Science';
        const tProg = targetProgram || 'Master of Science in Analytics';
        const strength = strengthQuality || 'independent research ability and analytical rigor';
        const achieve = keyAchievement || 'ranking in the top 5% of the graduating cohort';
        const wName = writerName || 'Dr. January Jones';
        const wTitle = writerTitle || 'Associate Professor';
        const org = companyOrUni || 'University of Calgary';

        if (recommenderType === 'academic') {
            setGeneratedOutline([
                {
                    title: "Paragraph 1: Academic Association Details",
                    text: `State that Dr. ${wName} (${wTitle} at ${org}) has known ${sName} for the past few years in the capacity of course instructor and academic project guide. Emphasize that the student was a standout performer in ${subj} coursework.`
                },
                {
                    title: "Paragraph 2: Academic Strengths & Class Standing",
                    text: `Detail ${sName}'s intellectual qualities, highlighting ${strength}. Explicitly mention the key academic milestone: ${achieve}. Connect this standing to the requirements of the ${tProg} program.`
                },
                {
                    title: "Paragraph 3: Class Project & Collaborative Spirit",
                    text: `Describe a collaborative coursework project or lab work. Highlight how ${sName} took proactive steps to lead colleagues, explaining complex analytical steps and demonstrating a natural flair for peer training.`
                },
                {
                    title: "Paragraph 4: Research Intent & Reaffirmation",
                    text: `Endorse ${sName} with high confidence, stating that the student has the academic maturity and dedication necessary to excel in a rigorous Master's program like ${tProg} at your institution.`
                }
            ]);
        } else {
            setGeneratedOutline([
                {
                    title: "Paragraph 1: Employment Context",
                    text: `State that ${wName} (${wTitle} at ${org}) supervised ${sName} during their employment tenure. Clarify their role, duration of employment, and immediate work-related responsibilities.`
                },
                {
                    title: "Paragraph 2: Professional Competency & Work Ethic",
                    text: `Detail ${sName}'s performance, outlining their attention to detail, commitment to quality, and capability to work under tight sprint deadlines. Highlight their core skill: ${strength}.`
                },
                {
                    title: "Paragraph 3: Workplace Project Milestone",
                    text: `Mention the specific professional contribution: ${achieve}. Describe how the candidate's proactive suggestions for process improvements directly improved team outcomes.`
                },
                {
                    title: "Paragraph 4: Corporate Endorsement & Master's Fit",
                    text: `Express that ${sName} possesses a valuable mix of practical industry experience and academic foundations (Bachelors in ${dName}), making them a robust fit for ${tProg}.`
                }
            ]);
        }
    };

    const lorList = [
        { key: 'lor-blog', name: 'General LOR Guide', path: '/resources/lor/lor-blog' },
        { key: 'lor-masters', name: 'LOR for Masters', path: '/resources/lor/lor-masters' },
        { key: 'lor-phd', name: 'LOR for PhD', path: '/resources/lor/lor-phd' }
    ];

    const faqs = [
        {
            q: "How many LORs are typically required for a Master's application?",
            a: "Most international universities require 2 to 3 Letters of Recommendation. Depending on the university guidelines, this typically consists of either two academic letters, or two academic plus one professional letter if you have work experience."
        },
        {
            q: "Can I submit a professional LOR if I graduated several years ago?",
            a: "Yes. If you have been working for more than 2-3 years, universities actually prefer receiving a mix of academic and professional LORs, as professional supervisors can better comment on your current skills, work ethic, and maturity."
        },
        {
            q: "What is the waiver of right to access LOR (FERPA)?",
            a: "When submitting applications (especially to US universities), you will be asked if you waive your right to view the recommendation. It is highly recommended to select 'Yes' (waive access). Admissions committees place far more trust in confidential letters that the applicant has not read."
        },
        {
            q: "How does the university verify the recommendation letters?",
            a: "Universities verify LORs by sending automated links to the recommenders' official academic or corporate email IDs. Recommenders must upload the letter or fill a questionnaire directly. Standard Gmail/Yahoo addresses are usually discouraged."
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
                        <span>Masters Admissions</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl">
                        Letter of Recommendation (LOR) for Masters
                    </h1>
                    <p className="text-slate-350 text-base md:text-lg mt-3 max-w-2xl font-medium">
                        Detailed formatting structures, academic & professional sample templates, and submission workflows for postgraduate applicants.
                    </p>
                </div>
            </div>

            {/* Split Layout */}
            <div className="max-w-[1240px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Left Navigation Menu */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-2">
                                LOR Directory
                            </h3>
                            <nav className="flex flex-col gap-1">
                                {lorList.map((lor) => {
                                    const isCurrent = lor.key === 'lor-masters';
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

                    {/* Right Core Content */}
                    <div className="lg:col-span-3 space-y-10">
                        
                        {/* Importance Section */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm space-y-4">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                Why is an LOR Critical for Master's Programs?
                            </h2>
                            <p className="text-slate-650 leading-relaxed text-[0.96rem] font-medium">
                                Graduate schools evaluate candidates holistically. While GRE scores and GPAs show academic aptitude, they do not depict classroom behavior, research curiosity, or project execution under stress. Recommenders offer an external, credible validation of your potential to complete complex postgraduate study.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-1 bg-indigo-50 text-indigo-600 p-1.5 rounded-lg h-fit">
                                        <Check size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Credibility & Endorsement</h4>
                                        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-semibold">Vouches for your academic maturity and work ethic directly from established academic or industry figures.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-1 bg-indigo-50 text-indigo-600 p-1.5 rounded-lg h-fit">
                                        <Check size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">In-Depth Perspective</h4>
                                        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-semibold">Tells the admissions committee about your growth trajectory, project hurdles faced, and leadership roles.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-1 bg-indigo-50 text-indigo-600 p-1.5 rounded-lg h-fit">
                                        <Check size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Complementing Profile</h4>
                                        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-semibold">Provides a personal and qualitative dimension to your application files, going beyond grades.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-1 bg-indigo-50 text-indigo-600 p-1.5 rounded-lg h-fit">
                                        <Check size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Competitive Edge</h4>
                                        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-semibold">Differentiates you from thousands of applicants with similar GPA profiles through unique stories.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Widget - Postgrad LOR outline builder */}
                        <section className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <PenTool className="text-[#DE5C2B]" size={22} />
                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                        Postgrad LOR Outline Generator
                                    </h3>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                                    <button 
                                        type="button"
                                        onClick={() => { setRecommenderType('academic'); setGeneratedOutline(null); }}
                                        className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${recommenderType === 'academic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                                    >
                                        Academic LOR
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setRecommenderType('professional'); setGeneratedOutline(null); }}
                                        className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${recommenderType === 'professional' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                                    >
                                        Professional LOR
                                    </button>
                                </div>
                            </div>
                            <p className="text-slate-500 text-xs font-semibold">
                                Complete the parameters below to generate a tailored outline structured specifically for {recommenderType === 'academic' ? 'Academic Professors' : 'Professional Workplace Supervisors'}.
                            </p>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Recommender Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.writerName}
                                        onChange={e => setDraftInput({...draftInput, writerName: e.target.value})}
                                        placeholder="e.g. Dr. Jane Doe"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Recommender Designation</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.writerTitle}
                                        onChange={e => setDraftInput({...draftInput, writerTitle: e.target.value})}
                                        placeholder={recommenderType === 'academic' ? "e.g. Head of Computer Science Dept" : "e.g. Senior Engineering Manager"}
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">{recommenderType === 'academic' ? 'University / Department' : 'Company Name'}</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.companyOrUni}
                                        onChange={e => setDraftInput({...draftInput, companyOrUni: e.target.value})}
                                        placeholder={recommenderType === 'academic' ? "e.g. IIT Madras" : "e.g. Infosys Ltd."}
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Applicant's Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.studentName}
                                        onChange={e => setDraftInput({...draftInput, studentName: e.target.value})}
                                        placeholder="e.g. Amit Patel"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Current Degree</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.degreeName}
                                        onChange={e => setDraftInput({...draftInput, degreeName: e.target.value})}
                                        placeholder="e.g. Bachelor of Technology"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">{recommenderType === 'academic' ? 'Core Course Subject' : 'Work Role Domain'}</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.subjectName}
                                        onChange={e => setDraftInput({...draftInput, subjectName: e.target.value})}
                                        placeholder={recommenderType === 'academic' ? "e.g. Database Management Systems" : "e.g. Cloud Backend Engineering"}
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Target Master's Program</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.targetProgram}
                                        onChange={e => setDraftInput({...draftInput, targetProgram: e.target.value})}
                                        placeholder="e.g. MS in Data Science"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Core Quality / Strength</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.strengthQuality}
                                        onChange={e => setDraftInput({...draftInput, strengthQuality: e.target.value})}
                                        placeholder="e.g. exceptional analytical reasoning and algorithm skills"
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Key Project / Key Achievement Story</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.keyAchievement}
                                        onChange={e => setDraftInput({...draftInput, keyAchievement: e.target.value})}
                                        placeholder={recommenderType === 'academic' ? "e.g. standing in top 5% of class in term projects" : "e.g. scaling server responsiveness by 30% through caching layer design"}
                                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="col-span-1 md:col-span-2 py-3.5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg transition-all cursor-pointer text-center"
                                >
                                    Build {recommenderType === 'academic' ? 'Academic' : 'Professional'} Blueprint
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Structural Outline Blueprint</h4>
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

                        {/* Dual Transcripts - Tabbed Samples */}
                        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                                <Award className="text-yellow-600" size={24} />
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                    Real Masters LOR Transcripts
                                </h3>
                            </div>
                            
                            {/* Academic Template */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-extrabold text-indigo-600 uppercase tracking-wide">Sample 1: Academic Recommendation Letter</h4>
                                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 font-semibold text-xs md:text-sm text-slate-700 space-y-4 leading-relaxed font-mono whitespace-pre-wrap">
{`Dear Admissions Team,

I am pleased to write this Letter of Recommendation for Amit Patel, who has been a student at our institution for the past three years. I have worked closely with him and observed his academic performance and work ethic during this time.

From the very beginning, Amit has shown a strong inclination towards research and has consistently demonstrated his ability to think critically and analyse complex academic problems. He has always been proactive in his approach and has shown a genuine interest in learning new things.

One of the most impressive aspects of Amit’s academic profile is his ability to work collaboratively with his peers and instructors. He is an excellent team player and has always been willing to go the extra mile to achieve team goals. His ability to communicate effectively and articulate his ideas has been an asset to his team.

During his academic tenure, Amit has taken several courses across multiple disciplines, including history, political science, and economics. His performance in these courses has been exemplary, and he has consistently demonstrated his ability to apply theoretical concepts to real-world problems. I have had the opportunity to work with Amit on several research projects, and I can confidently say that he has a natural flair for research. His research work has been thoughtful and well-structured, and he has consistently demonstrated a good understanding of the research question and the methodology required to answer it.

In conclusion, I wholeheartedly recommend Amit for admission to your Masters program. He has all the qualities of an excellent student, including academic excellence, strong work ethic, and a passion for learning. Please feel free to contact me if you require any further information.

Sincerely,

Dr. Jane Doe
Professor, Dept of Computer Science
IIT Madras, Chennai
j.doe@iitm.ac.in`}
                                </div>
                            </div>

                            {/* Professional Template */}
                            <div className="space-y-2 pt-4">
                                <h4 className="text-xs font-extrabold text-indigo-600 uppercase tracking-wide">Sample 2: Professional Recommendation Letter</h4>
                                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 font-semibold text-xs md:text-sm text-slate-700 space-y-4 leading-relaxed font-mono whitespace-pre-wrap">
{`To Whom It May Concern,

I am writing this letter of recommendation for Amit Patel, who was employed at Infosys Ltd. as a Software Developer from June 12, 2022 to May 10, 2025. I enjoyed working closely with Amit during this time and can attest to his exceptional work ethic, skills, and abilities.

As an employee, Amit consistently demonstrated a strong commitment to his work, paying meticulous attention to detail and delivering high-quality results. He was proactive in identifying opportunities for process improvements and always willing to take on new challenges. Amit was an integral team member, and his contributions were instrumental in our success.

Amit holds a Bachelor’s degree in Technology from IIT Madras. Throughout his studies, he exhibited a passion for his field of study, demonstrating a deep understanding of the subject matter and a keen ability to apply his knowledge in practical settings. Based on my experience working with Amit, I do not doubt he would excel in a Master’s program. He possesses a unique combination of academic knowledge, practical skills, and a strong work ethic, making him a valuable addition to any program.

I highly recommend Amit for admission to the Master’s program he is applying for. I am confident he will continue to impress with his dedication, hard work, and ability to deliver exceptional results.

Please feel free to contact me if you require any further information.

Sincerely,

Mr. Rajesh Kumar
Senior Project Manager
Infosys Ltd.
rajesh.k@infosys.com`}
                                </div>
                            </div>
                        </div>

                        {/* Submission workflow */}
                        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                                Submission Process for Postgraduate Applications
                            </h3>
                            <p className="text-slate-500 text-xs font-semibold">
                                Recommendation letter delivery varies depending on the university. Familiarize yourself with the 3 common pathways:
                            </p>
                            <div className="space-y-3 pt-2">
                                <div className="bg-slate-50 border border-slate-200/40 p-4 rounded-xl">
                                    <strong className="block text-xs font-bold text-slate-800">1. Online Application Portals (Most Common)</strong>
                                    <p className="text-slate-600 text-xs mt-1 leading-relaxed font-semibold">
                                        You enter your recommender's details (Name, Designation, Official Email) in the university portal. The system automatically triggers an email containing a secure link where they fill questionnaire ratings and upload the LOR PDF directly.
                                    </p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200/40 p-4 rounded-xl">
                                    <strong className="block text-xs font-bold text-slate-800">2. Direct Email Submission</strong>
                                    <p className="text-slate-600 text-xs mt-1 leading-relaxed font-semibold">
                                        Some institutions request the recommender to email the letter directly to the graduate admissions coordinator from their official domain (e.g. recommender@university.edu) mentioning your application ID.
                                    </p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200/40 p-4 rounded-xl">
                                    <strong className="block text-xs font-bold text-slate-800">3. Sealed Physical Mail (Post)</strong>
                                    <p className="text-slate-600 text-xs mt-1 leading-relaxed font-semibold">
                                        The recommender prints the letter on official letterhead, signs it, puts it in an envelope, seals it, and stamps their official signature across the envelope flap. The student compiles these sealed packets and posts them to the admissions office.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Common Mistakes */}
                        <div className="bg-rose-50/60 border border-rose-100 text-slate-750 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-rose-800">
                                <AlertTriangle size={24} />
                                <h3 className="text-lg font-bold tracking-tight">Common LOR Mistakes to Avoid</h3>
                            </div>
                            <ul className="space-y-2 text-xs font-semibold leading-relaxed text-slate-600">
                                <li className="flex items-start gap-1.5">
                                    <span className="text-rose-600 font-bold">•</span>
                                    <span><strong>Submitting Generic Duplicates:</strong> Using the exact same letter template for 5 different programs. Recommenders must adjust the specific school name and target program fit.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-rose-600 font-bold">•</span>
                                    <span><strong>Standard Webmail Accounts:</strong> Using personal @gmail.com or @yahoo.com accounts for recommenders without verification documentation. Official institutional domains are always preferred.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-rose-600 font-bold">•</span>
                                    <span><strong>Lack of Depth:</strong> Letters that only state GPA stats without describing projects, hurdles, or behavioral competencies. The transcript already contains the GPA; the LOR must tell a story.</span>
                                </li>
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

                    </div>

                </div>
            </div>
        </main>
    );
};

export default LORMastersPage;
