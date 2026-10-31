import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    Sparkles,
    Check,
    FileText,
    ArrowRight,
    PenTool,
    AlertTriangle
} from 'lucide-react';
import { StdSign } from '../../../../components/desi/DesiPop';
import { TapeHeadline } from '../../../../components/ui/BrandElements';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../../components/desi/DesiKit';
import { BookOkCta } from '../../../../components/desi/BookOkCta';

// Desi Pop form styling (ink borders, cream fields)
const FIELD = 'w-full bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-[#16130F] placeholder:text-[#8A7F70] outline-none transition-shadow focus:bg-white focus:shadow-[3px_3px_0_#F2B705]';
const LABEL = 'text-[11px] font-extrabold uppercase text-[#5B544A] tracking-wider';

// Poster colours for numbered chips and card strips (no blue)
const TONES = [
    { c: '#D0362E', fg: '#FFFFFF' },
    { c: '#F2B705', fg: '#16130F' },
    { c: '#14837E', fg: '#FFFFFF' },
    { c: '#B8285B', fg: '#FFFFFF' },
];

// Sample LOR shown as a letter on paper, with a stamp-like label
const LetterPaper = ({ label, children }) => (
    <div className="bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#6E1436]" style={{ borderRadius: 6 }}>
        <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-3 border-b-2 border-dashed border-[#16130F33]">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8A7F70] min-w-0">{label}</span>
            <span className="shrink-0 inline-flex flex-col items-center px-2.5 py-1 border-[3px] border-double border-[#D0362E] text-[#D0362E] rotate-[-6deg] leading-none" style={{ borderRadius: 6 }}>
                <span className="font-urbanist font-extrabold text-[13px]">Sample</span>
                <span className="font-['Anton',sans-serif] text-[10.5px] tracking-[0.14em] mt-0.5">SAMPLE</span>
            </span>
        </div>
        <div className="px-5 sm:px-7 py-6 text-[13.5px] md:text-[14.5px] text-[#2A251F] leading-relaxed whitespace-pre-wrap break-words">
            {children}
        </div>
    </div>
);

const LORMastersPage = () => {
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
        <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F] overflow-x-clip">
            {/* ── HERO: teal poster band ── */}
            <DesiHero
                tone="teal"
                sign={{ hi: 'Sifarish patra', en: 'MASTERS LOR' }}
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'LOR' }, { label: 'LOR for Masters' }]}
                title="Letter of Recommendation (LOR) for Masters"
                subtitle="Detailed formatting structures, academic & professional sample templates, and submission workflows for postgraduate applicants."
                stickers={(
                    <Sticker bg="#F2B705" tilt={-2}><Sparkles size={14} />Masters Admissions</Sticker>
                )}
                aside={(
                    // STD booth style sign with the 3 submission pathways, large screens only
                    <div className="hidden lg:flex justify-center pointer-events-none">
                        <StdSign words={['PORTAL', 'EMAIL', 'POST']} hi="Sifarish" className="w-[210px] rotate-3" />
                    </div>
                )}
            />

            {/* ── LOR PICKER (phones and tablets) ── */}
            <div className="lg:hidden max-w-[1240px] mx-auto px-4 -mt-6 mb-8 relative z-10">
                <InkCard className="p-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B544A] leading-none px-1 mb-2">LOR Directory</p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {lorList.map((lor) => {
                            const isCurrent = lor.key === 'lor-masters';
                            return (
                                <Link
                                    key={lor.key}
                                    to={lor.path}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isCurrent ? 'border-[#16130F] bg-[#14837E] text-white shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
                                >
                                    <FileText size={13} />
                                    <span>{lor.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </InkCard>
            </div>

            {/* Split Layout */}
            <div className="max-w-[1240px] mx-auto px-4 md:px-8 lg:pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                    {/* Left Navigation Menu (desktop) */}
                    <aside className="hidden lg:block lg:col-span-1 sticky top-28">
                        <InkCard className="p-4">
                            <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Recommendation letters</p>
                            <h3 className="mt-1 mb-3 font-urbanist font-black text-[17px]">LOR Directory</h3>
                            <nav className="flex flex-col gap-2">
                                {lorList.map((lor) => {
                                    const isCurrent = lor.key === 'lor-masters';
                                    return (
                                        <Link
                                            key={lor.key}
                                            to={lor.path}
                                            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border-2 text-[14px] font-bold transition-transform ${isCurrent ? 'border-[#16130F] bg-[#14837E] text-white shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <FileText size={16} />
                                                {lor.name}
                                            </span>
                                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    );
                                })}
                            </nav>
                        </InkCard>
                    </aside>

                    {/* Right Core Content */}
                    <div className="lg:col-span-3 space-y-10 min-w-0">

                        {/* Importance Section */}
                        <InkCard className="p-6 md:p-8 space-y-4" shadow="#14837E">
                            <DesiHeading hi="LOR kyun zaroori">Why is an LOR Critical for Master's Programs?</DesiHeading>
                            <p className="text-[#5B544A] leading-relaxed text-[15px]">
                                Graduate schools evaluate candidates holistically. While GRE scores and GPAs show academic aptitude, they do not depict classroom behavior, research curiosity, or project execution under stress. Recommenders offer an external, credible validation of your potential to complete complex postgraduate study.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="flex gap-3 bg-[#FFF6E5] border-2 border-[#16130F] rounded-xl p-3.5">
                                    <div className="flex-shrink-0 mt-0.5 bg-[#14837E] text-white border-2 border-[#16130F] w-7 h-7 rounded-full grid place-items-center">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-[12.5px] font-extrabold text-[#16130F] uppercase tracking-wide">Credibility & Endorsement</h4>
                                        <p className="text-[#5B544A] text-[13px] mt-1 leading-relaxed">Vouches for your academic maturity and work ethic directly from established academic or industry figures.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 bg-[#FFF6E5] border-2 border-[#16130F] rounded-xl p-3.5">
                                    <div className="flex-shrink-0 mt-0.5 bg-[#14837E] text-white border-2 border-[#16130F] w-7 h-7 rounded-full grid place-items-center">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-[12.5px] font-extrabold text-[#16130F] uppercase tracking-wide">In-Depth Perspective</h4>
                                        <p className="text-[#5B544A] text-[13px] mt-1 leading-relaxed">Tells the admissions committee about your growth trajectory, project hurdles faced, and leadership roles.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 bg-[#FFF6E5] border-2 border-[#16130F] rounded-xl p-3.5">
                                    <div className="flex-shrink-0 mt-0.5 bg-[#14837E] text-white border-2 border-[#16130F] w-7 h-7 rounded-full grid place-items-center">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-[12.5px] font-extrabold text-[#16130F] uppercase tracking-wide">Complementing Profile</h4>
                                        <p className="text-[#5B544A] text-[13px] mt-1 leading-relaxed">Provides a personal and qualitative dimension to your application files, going beyond grades.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 bg-[#FFF6E5] border-2 border-[#16130F] rounded-xl p-3.5">
                                    <div className="flex-shrink-0 mt-0.5 bg-[#14837E] text-white border-2 border-[#16130F] w-7 h-7 rounded-full grid place-items-center">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-[12.5px] font-extrabold text-[#16130F] uppercase tracking-wide">Competitive Edge</h4>
                                        <p className="text-[#5B544A] text-[13px] mt-1 leading-relaxed">Differentiates you from thousands of applicants with similar GPA profiles through unique stories.</p>
                                    </div>
                                </div>
                            </div>
                        </InkCard>

                        {/* Interactive Widget - Postgrad LOR outline builder */}
                        <InkCard as="section" className="p-6 md:p-8 space-y-6" shadow="#D0362E">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <DesiHeading hi="Apna structure banao">
                                    <span className="inline-flex items-center gap-2">
                                        <PenTool className="text-[#D0362E] shrink-0" size={24} />
                                        Postgrad LOR Outline Generator
                                    </span>
                                </DesiHeading>
                                <div className="flex w-fit bg-[#FFF6E5] p-1 rounded-full border-2 border-[#16130F] text-[12.5px] font-bold shrink-0">
                                    <button 
                                        type="button"
                                        onClick={() => { setRecommenderType('academic'); setGeneratedOutline(null); }}
                                        className={`no-shine px-4 py-2 rounded-full cursor-pointer transition-colors whitespace-nowrap ${recommenderType === 'academic' ? 'bg-[#16130F] text-white' : 'text-[#5B544A] hover:text-[#16130F]'}`}
                                    >
                                        Academic LOR
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setRecommenderType('professional'); setGeneratedOutline(null); }}
                                        className={`no-shine px-4 py-2 rounded-full cursor-pointer transition-colors whitespace-nowrap ${recommenderType === 'professional' ? 'bg-[#16130F] text-white' : 'text-[#5B544A] hover:text-[#16130F]'}`}
                                    >
                                        Professional LOR
                                    </button>
                                </div>
                            </div>
                            <p className="text-[#5B544A] text-[14px] leading-relaxed">
                                Complete the parameters below to generate a tailored outline structured specifically for {recommenderType === 'academic' ? 'Academic Professors' : 'Professional Workplace Supervisors'}.
                            </p>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Recommender Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.writerName}
                                        onChange={e => setDraftInput({...draftInput, writerName: e.target.value})}
                                        placeholder="e.g. Dr. Jane Doe"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Recommender Designation</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.writerTitle}
                                        onChange={e => setDraftInput({...draftInput, writerTitle: e.target.value})}
                                        placeholder={recommenderType === 'academic' ? "e.g. Head of Computer Science Dept" : "e.g. Senior Engineering Manager"}
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>{recommenderType === 'academic' ? 'University / Department' : 'Company Name'}</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.companyOrUni}
                                        onChange={e => setDraftInput({...draftInput, companyOrUni: e.target.value})}
                                        placeholder={recommenderType === 'academic' ? "e.g. IIT Madras" : "e.g. Infosys Ltd."}
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Applicant's Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.studentName}
                                        onChange={e => setDraftInput({...draftInput, studentName: e.target.value})}
                                        placeholder="e.g. Amit Patel"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Current Degree</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.degreeName}
                                        onChange={e => setDraftInput({...draftInput, degreeName: e.target.value})}
                                        placeholder="e.g. Bachelor of Technology"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>{recommenderType === 'academic' ? 'Core Course Subject' : 'Work Role Domain'}</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.subjectName}
                                        onChange={e => setDraftInput({...draftInput, subjectName: e.target.value})}
                                        placeholder={recommenderType === 'academic' ? "e.g. Database Management Systems" : "e.g. Cloud Backend Engineering"}
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Target Master's Program</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.targetProgram}
                                        onChange={e => setDraftInput({...draftInput, targetProgram: e.target.value})}
                                        placeholder="e.g. MS in Data Science"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Core Quality / Strength</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.strengthQuality}
                                        onChange={e => setDraftInput({...draftInput, strengthQuality: e.target.value})}
                                        placeholder="e.g. exceptional analytical reasoning and algorithm skills"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1.5 min-w-0">
                                    <label className={LABEL}>Key Project / Key Achievement Story</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.keyAchievement}
                                        onChange={e => setDraftInput({...draftInput, keyAchievement: e.target.value})}
                                        placeholder={recommenderType === 'academic' ? "e.g. standing in top 5% of class in term projects" : "e.g. scaling server responsiveness by 30% through caching layer design"}
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="no-shine col-span-1 md:col-span-2 py-3.5 rounded-full border-2 border-[#16130F] bg-[#D0362E] hover:bg-[#B52A23] text-white font-bold text-[14px] shadow-[3px_3px_0_#16130F] transition-colors cursor-pointer text-center"
                                >
                                    Build {recommenderType === 'academic' ? 'Academic' : 'Professional'} Blueprint
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
                                    <h4 className="text-[11.5px] font-extrabold text-[#5B544A] uppercase tracking-widest">Structural Outline Blueprint</h4>
                                    <div className="space-y-3">
                                        {generatedOutline.map((item, idx) => (
                                            <div key={idx} className="bg-[#FFF6E5] border-2 border-[#16130F] border-l-[8px] p-4 rounded-xl space-y-1.5" style={{ borderLeftColor: TONES[idx % TONES.length].c }}>
                                                <span className="block text-[12.5px] font-extrabold text-[#16130F]">{item.title}</span>
                                                <p className="text-[13.5px] text-[#5B544A] leading-relaxed break-words">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </InkCard>

                        {/* Dual Transcripts: rani poster band with the letters on paper */}
                        <section className="bg-[#B8285B] border-[3px] border-[#16130F] p-5 sm:p-6 md:p-8 shadow-[6px_6px_0_#16130F] space-y-8" style={{ borderRadius: 18 }}>
                            <DesiHeading hi="Sample letter" light>Real Masters LOR Transcripts</DesiHeading>

                            {/* Academic Template */}
                            <div className="space-y-3">
                                <h4 className="inline-block text-[12px] font-extrabold uppercase tracking-wide bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] px-3 py-1 shadow-[2px_2px_0_#16130F] -rotate-1" style={{ borderRadius: 8 }}>Sample 1: Academic Recommendation Letter</h4>
                                <LetterPaper label="Academic LOR">
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
                                </LetterPaper>
                            </div>

                            {/* Professional Template */}
                            <div className="space-y-3">
                                <h4 className="inline-block text-[12px] font-extrabold uppercase tracking-wide bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] px-3 py-1 shadow-[2px_2px_0_#16130F] rotate-1" style={{ borderRadius: 8 }}>Sample 2: Professional Recommendation Letter</h4>
                                <LetterPaper label="Professional LOR">
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
                                </LetterPaper>
                            </div>
                        </section>

                        {/* Submission workflow: mustard poster band with ticket cards */}
                        <section className="bg-[#F2B705] border-[3px] border-[#16130F] p-5 sm:p-6 md:p-8 shadow-[6px_6px_0_#16130F] space-y-4" style={{ borderRadius: 18 }}>
                            <DesiHeading hi="Letter kaise pahunche">Submission Process for Postgraduate Applications</DesiHeading>
                            <p className="text-[#3D362E] text-[14.5px] font-medium">
                                Recommendation letter delivery varies depending on the university. Familiarize yourself with the 3 common pathways:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                <div className="bg-white border-[3px] border-[#16130F] p-4 rounded-xl shadow-[4px_4px_0_#16130F] md:-rotate-[0.8deg]">
                                    <strong className="block font-urbanist font-black text-[15.5px] leading-snug text-[#16130F] pb-2 mb-2 border-b-2 border-dashed border-[#16130F33]">1. Online Application Portals (Most Common)</strong>
                                    <p className="text-[#5B544A] text-[13.5px] leading-relaxed">
                                        You enter your recommender's details (Name, Designation, Official Email) in the university portal. The system automatically triggers an email containing a secure link where they fill questionnaire ratings and upload the LOR PDF directly.
                                    </p>
                                </div>
                                <div className="bg-white border-[3px] border-[#16130F] p-4 rounded-xl shadow-[4px_4px_0_#16130F] md:rotate-[0.6deg]">
                                    <strong className="block font-urbanist font-black text-[15.5px] leading-snug text-[#16130F] pb-2 mb-2 border-b-2 border-dashed border-[#16130F33]">2. Direct Email Submission</strong>
                                    <p className="text-[#5B544A] text-[13.5px] leading-relaxed">
                                        Some institutions request the recommender to email the letter directly to the graduate admissions coordinator from their official domain (e.g. recommender@university.edu) mentioning your application ID.
                                    </p>
                                </div>
                                <div className="bg-white border-[3px] border-[#16130F] p-4 rounded-xl shadow-[4px_4px_0_#16130F] md:-rotate-[0.4deg]">
                                    <strong className="block font-urbanist font-black text-[15.5px] leading-snug text-[#16130F] pb-2 mb-2 border-b-2 border-dashed border-[#16130F33]">3. Sealed Physical Mail (Post)</strong>
                                    <p className="text-[#5B544A] text-[13.5px] leading-relaxed">
                                        The recommender prints the letter on official letterhead, signs it, puts it in an envelope, seals it, and stamps their official signature across the envelope flap. The student compiles these sealed packets and posts them to the admissions office.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Common Mistakes */}
                        <InkCard className="p-6 md:p-8 space-y-5" shadow="#D0362E">
                            <div className="flex items-start gap-3">
                                <span className="mt-1 w-10 h-10 rounded-full bg-[#D0362E] text-white border-2 border-[#16130F] grid place-items-center shrink-0">
                                    <AlertTriangle size={20} />
                                </span>
                                <TapeHeadline as="h3" lines={[{ text: 'Common LOR mistakes' }, { text: 'to avoid' }]} />
                            </div>
                            <ul className="space-y-3 text-[14px] leading-relaxed text-[#5B544A] list-none p-0 m-0">
                                <li className="flex items-start gap-2.5">
                                    <span aria-hidden="true" className="mt-[7px] w-2.5 h-2.5 bg-[#D0362E] border-2 border-[#16130F] rotate-45 shrink-0" />
                                    <span><strong className="text-[#16130F]">Submitting Generic Duplicates:</strong> Using the exact same letter template for 5 different programs. Recommenders must adjust the specific school name and target program fit.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span aria-hidden="true" className="mt-[7px] w-2.5 h-2.5 bg-[#D0362E] border-2 border-[#16130F] rotate-45 shrink-0" />
                                    <span><strong className="text-[#16130F]">Standard Webmail Accounts:</strong> Using personal @gmail.com or @yahoo.com accounts for recommenders without verification documentation. Official institutional domains are always preferred.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span aria-hidden="true" className="mt-[7px] w-2.5 h-2.5 bg-[#D0362E] border-2 border-[#16130F] rotate-45 shrink-0" />
                                    <span><strong className="text-[#16130F]">Lack of Depth:</strong> Letters that only state GPA stats without describing projects, hurdles, or behavioral competencies. The transcript already contains the GPA; the LOR must tell a story.</span>
                                </li>
                            </ul>
                        </InkCard>

                        {/* FAQs Section */}
                        <section>
                            <DesiHeading hi="Sabke sawaal">Frequently Asked Questions</DesiHeading>
                            <div className="mt-5 space-y-3">
                                {faqs.map((faq, idx) => {
                                    const isOpen = !!faqOpen[idx];
                                    return (
                                        <div key={faq.q} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: isOpen ? '4px 4px 0 #D0362E' : '4px 4px 0 #16130F' }}>
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
                            hi="LOR check"
                            text="Masters ke LOR ka draft ready? Free 1:1 call mein mentor se check karwao."
                        />

                    </div>

                </div>
            </div>
        </main>
    );
};

export default LORMastersPage;
