import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    ChevronDown,
    Sparkles,
    FileText,
    ArrowRight,
    PenTool,
    Briefcase
} from 'lucide-react';
import { PostageStamp } from '../../../../components/desi/DesiPop';
import { JourneyPills } from '../../../../components/ui/BrandElements';
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

const LORBlogPage = () => {
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
        <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F] overflow-x-clip">
            {/* ── HERO: mustard poster band ── */}
            <DesiHero
                tone="mustard"
                sign={{ hi: 'सिफ़ारिश पत्र', en: 'LOR DESK' }}
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'LOR' }, { label: 'General LOR Guide' }]}
                title="Letter of Recommendation (LOR) Samples & Formats"
                subtitle="Comprehensive guidelines, interactive draft builders, and sample templates to craft the perfect endorsement for 2025."
                stickers={(
                    <Sticker tilt={-2}><Sparkles size={14} className="text-[#D0362E]" />Recommendation Guides</Sticker>
                )}
                aside={(
                    // postage stamp with the length rule from the tone tips, large screens only
                    <div className="hidden lg:flex justify-center pointer-events-none">
                        <PostageStamp value="1–2" title="Pages max" hi="सिफ़ारिश" note="LOR length" className="w-[170px] rotate-6" />
                    </div>
                )}
            />

            {/* ── LOR PICKER (phones and tablets) ── */}
            <div className="lg:hidden max-w-[1240px] mx-auto px-4 -mt-6 mb-8 relative z-10">
                <InkCard className="p-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B544A] leading-none px-1 mb-2">LOR Directory</p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {lorList.map((lor) => {
                            const isCurrent = lor.key === 'lor-blog';
                            return (
                                <Link
                                    key={lor.key}
                                    to={lor.path}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isCurrent ? 'border-[#16130F] bg-[#F2B705] text-[#16130F] shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
                                >
                                    <FileText size={13} />
                                    <span>{lor.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </InkCard>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-[1240px] mx-auto px-4 md:px-8 lg:pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                    {/* Left Sticky Sidebar (desktop) */}
                    <aside className="hidden lg:block lg:col-span-1 sticky top-28">
                        <InkCard className="p-4">
                            <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Recommendation letters</p>
                            <h3 className="mt-1 mb-3 font-urbanist font-black text-[17px]">LOR Directory</h3>
                            <nav className="flex flex-col gap-2">
                                {lorList.map((lor) => {
                                    const isCurrent = lor.key === 'lor-blog';
                                    return (
                                        <Link
                                            key={lor.key}
                                            to={lor.path}
                                            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border-2 text-[14px] font-bold transition-transform ${isCurrent ? 'border-[#16130F] bg-[#F2B705] text-[#16130F] shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
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

                    {/* Right Content */}
                    <div className="lg:col-span-3 space-y-10 min-w-0">

                        {/* What is LOR */}
                        <InkCard className="p-6 md:p-8 space-y-4" shadow="#F2B705">
                            <DesiHeading hi="LOR kya hai?">What is a Letter of Recommendation (LOR)?</DesiHeading>
                            <p className="text-[#5B544A] leading-relaxed text-[15px]">
                                A Letter of Recommendation (LOR) is a crucial document that provides a personal endorsement of an individual’s skills, qualifications, and character. Typically written by professors, mentors, or supervisors, an LOR offers an objective assessment of a candidate’s academic or professional abilities. This document is essential in various application processes, including those for Master’s and PhD programs, as it highlights the candidate’s strengths, achievements, and potential for success.
                            </p>
                            <p className="text-[#5B544A] leading-relaxed text-[15px]">
                                A well-written LOR can significantly enhance an applicant’s profile, providing a compelling narrative that supports their application and sets them apart from other candidates in the admission committees' stacks.
                            </p>
                        </InkCard>

                        {/* Types of LOR */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InkCard className="overflow-hidden md:-rotate-[0.6deg]">
                                <div className="flex items-center gap-2.5 px-5 py-3 border-b-[3px] border-[#16130F] bg-[#D0362E] text-white">
                                    <span className="w-9 h-9 rounded-full bg-white text-[#16130F] border-2 border-[#16130F] grid place-items-center shrink-0">
                                        <BookOpen size={17} />
                                    </span>
                                    <h3 className="font-urbanist font-black text-[18px] leading-tight">Academic LOR</h3>
                                </div>
                                <p className="p-5 text-[#5B544A] text-[14px] leading-relaxed">
                                    Written by professors, teachers, or advisors who closely observed your academic performance. These letters emphasize intellectual capacity, research skills, GPA standing, and classroom engagement.
                                </p>
                            </InkCard>
                            <InkCard className="overflow-hidden md:rotate-[0.6deg]">
                                <div className="flex items-center gap-2.5 px-5 py-3 border-b-[3px] border-[#16130F] bg-[#14837E] text-white">
                                    <span className="w-9 h-9 rounded-full bg-white text-[#16130F] border-2 border-[#16130F] grid place-items-center shrink-0">
                                        <Briefcase size={17} />
                                    </span>
                                    <h3 className="font-urbanist font-black text-[18px] leading-tight">Character Reference LOR</h3>
                                </div>
                                <p className="p-5 text-[#5B544A] text-[14px] leading-relaxed">
                                    Focuses on personal values, leadership, soft skills, and integrity. Typically authored by mentors, coaches, or community leaders who can verify your behavior, ethics, and team contributions.
                                </p>
                            </InkCard>
                        </div>

                        {/* Format & Structure Table */}
                        <InkCard className="p-6 md:p-8 space-y-5">
                            <DesiHeading hi="Letter ka structure">Structure and Paragraph-wise LOR Format</DesiHeading>
                            <JourneyPills
                                steps={[
                                    { label: 'Intro', sub: 'Relationship' },
                                    { label: 'Strengths', sub: 'Skills shown' },
                                    { label: 'Anecdote', sub: 'One real story' },
                                    { label: 'Closing', sub: 'Sign off' },
                                ]}
                                className="w-fit max-w-full"
                            />
                            <div className="overflow-x-auto border-[3px] border-[#16130F] rounded-xl">
                                <table className="w-full text-left border-collapse text-[13px] md:text-[14px]">
                                    <thead>
                                        <tr className="bg-[#F2B705] text-[#16130F] font-extrabold uppercase text-[11.5px] tracking-wider border-b-[3px] border-[#16130F]">
                                            <th className="p-3">Section</th>
                                            <th className="p-3">Primary Focus & Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[#5B544A] bg-white">
                                        <tr className="border-b-2 border-dashed border-[#16130F33]">
                                            <td className="p-3 font-bold text-[#16130F] align-top">Introduction</td>
                                            <td className="p-3">State relationship duration, designation of the recommender, and specific program targeting.</td>
                                        </tr>
                                        <tr className="border-b-2 border-dashed border-[#16130F33]">
                                            <td className="p-3 font-bold text-[#16130F] align-top">Candidate Strengths</td>
                                            <td className="p-3">Meticulousness, analytical capacity, initiative-taking, and technical mastery (e.g. coding).</td>
                                        </tr>
                                        <tr className="border-b-2 border-dashed border-[#16130F33]">
                                            <td className="p-3 font-bold text-[#16130F] align-top">Personal Anecdote</td>
                                            <td className="p-3">Detail a small story where the candidate overcame a project roadblock or suggested a novel solution.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-bold text-[#16130F] align-top">Closing & Sign Off</td>
                                            <td className="p-3">Reaffirm support, clarify willingness to be contacted, and provide name, phone, and professional email ID.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </InkCard>

                        {/* Interactive Widget */}
                        <InkCard as="section" className="p-6 md:p-8 space-y-6" shadow="#D0362E">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <DesiHeading hi="Apna draft banao">
                                    <span className="inline-flex items-center gap-2">
                                        <PenTool className="text-[#D0362E] shrink-0" size={24} />
                                        Interactive LOR Draft Builder
                                    </span>
                                </DesiHeading>
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
                                    className="no-shine shrink-0 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#16130F] bg-white hover:bg-[#FCE38A] px-4 py-2 rounded-full border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] transition-colors cursor-pointer w-fit"
                                >
                                    <Sparkles size={14} className="text-[#D0362E]" /> Auto-Fill Sample Data
                                </button>
                            </div>
                            <p className="text-[#5B544A] text-[14px] leading-relaxed">
                                Provide your recommender details and core accomplishments to assemble a highly professional recommendation structure.
                            </p>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Recommender Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.recommenderName}
                                        onChange={e => setDraftInput({...draftInput, recommenderName: e.target.value})}
                                        placeholder="e.g. Dr. Karen Sebastian"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Recommender Title</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.recommenderTitle}
                                        onChange={e => setDraftInput({...draftInput, recommenderTitle: e.target.value})}
                                        placeholder="e.g. Professor of Computer Science"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Recommender Organization</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.recommenderOrg}
                                        onChange={e => setDraftInput({...draftInput, recommenderOrg: e.target.value})}
                                        placeholder="e.g. University of Calgary"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Student Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.studentName}
                                        onChange={e => setDraftInput({...draftInput, studentName: e.target.value})}
                                        placeholder="e.g. Lydia Roy"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Relationship Duration</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.relationshipDuration}
                                        onChange={e => setDraftInput({...draftInput, relationshipDuration: e.target.value})}
                                        placeholder="e.g. 4 years"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Core Strength</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.strength}
                                        onChange={e => setDraftInput({...draftInput, strength: e.target.value})}
                                        placeholder="e.g. exceptional cloud programming abilities"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Target University</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.targetUni}
                                        onChange={e => setDraftInput({...draftInput, targetUni: e.target.value})}
                                        placeholder="e.g. University of Toronto"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Target Program</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.targetProgram}
                                        onChange={e => setDraftInput({...draftInput, targetProgram: e.target.value})}
                                        placeholder="e.g. Master's in Computer Science"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1.5 min-w-0">
                                    <label className={LABEL}>Anecdotal Project / Core Achievement</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.project}
                                        onChange={e => setDraftInput({...draftInput, project: e.target.value})}
                                        placeholder="e.g. final year project resolving network bottlenecks using edge servers"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="no-shine col-span-1 md:col-span-2 py-3.5 rounded-full border-2 border-[#16130F] bg-[#D0362E] hover:bg-[#B52A23] text-white font-bold text-[14px] shadow-[3px_3px_0_#16130F] transition-colors cursor-pointer text-center"
                                >
                                    Generate Draft Framework
                                </button>
                            </form>

                            {generatedDraft && (
                                <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
                                    <h4 className="text-[11.5px] font-extrabold text-[#5B544A] uppercase tracking-widest">Generated Outline Draft</h4>
                                    <div className="space-y-3">
                                        {generatedDraft.map((item, idx) => (
                                            <div key={idx} className="bg-[#FFF6E5] border-2 border-[#16130F] border-l-[8px] p-4 rounded-xl space-y-1.5" style={{ borderLeftColor: TONES[idx % TONES.length].c }}>
                                                <span className="block text-[12.5px] font-extrabold text-[#16130F]">{item.title}</span>
                                                <p className="text-[13.5px] text-[#5B544A] leading-relaxed whitespace-pre-line break-words">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </InkCard>

                        {/* Calgary to Toronto Sample Transcript: rani poster band with the letter on paper */}
                        <section className="bg-[#B8285B] border-[3px] border-[#16130F] p-5 sm:p-6 md:p-8 shadow-[6px_6px_0_#16130F]" style={{ borderRadius: 18 }}>
                            <DesiHeading hi="Sample letter" light>Sample LOR: University Professor Recommending to Master's Program</DesiHeading>

                            <div className="mt-6 bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#6E1436] sm:-rotate-[0.4deg]" style={{ borderRadius: 6 }}>
                                <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-3 border-b-2 border-dashed border-[#16130F33]">
                                    <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8A7F70]">Letter of Recommendation</span>
                                    <span className="shrink-0 inline-flex flex-col items-center px-2.5 py-1 border-[3px] border-double border-[#D0362E] text-[#D0362E] rotate-[-6deg] leading-none" style={{ borderRadius: 6 }}>
                                        <span className="font-urbanist font-extrabold text-[13px]">Sample</span>
                                        <span className="font-['Anton',sans-serif] text-[10.5px] tracking-[0.14em] mt-0.5">SAMPLE</span>
                                    </span>
                                </div>
                                <div className="px-5 sm:px-7 py-6 text-[13.5px] md:text-[14.5px] text-[#2A251F] leading-relaxed whitespace-pre-wrap break-words">
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
                        </section>

                        {/* Tone & Length Tips: teal poster band */}
                        <section className="bg-[#14837E] border-[3px] border-[#16130F] p-5 sm:p-6 md:p-8 shadow-[6px_6px_0_#16130F]" style={{ borderRadius: 18 }}>
                            <DesiHeading hi="Tone aur length" light>Professional Tone Guidelines</DesiHeading>
                            <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
                                {[
                                    { b: 'Objective Endorsement:', t: 'Maintain a formal, objective, and respectful tone throughout. Avoid hyperbole; instead, justify praise with real data or events.' },
                                    { b: 'Concise Delivery:', t: "Keep the letter within 1 to 2 pages maximum. A long, repetitive letter risks losing the committee's interest." },
                                    { b: 'Academic Grammar:', t: 'Eliminate personal bias or colloquial terms, opting for clear academic and professional phrasing.' },
                                    { b: 'Relevance:', t: 'Direct strengths toward the target course requirements. If applying for CS, highlight computational logic and project breakthroughs.' },
                                ].map((tip, idx) => (
                                    <li key={tip.b} className="flex gap-3 bg-white p-4 border-[3px] border-[#16130F] shadow-[4px_4px_0_#0B4F4C]"
                                        style={{ borderRadius: 12, transform: `rotate(${idx % 2 ? 0.6 : -0.6}deg)` }}>
                                        <span className="w-8 h-8 rounded-full border-2 border-[#16130F] font-urbanist font-black text-[14px] grid place-items-center shrink-0"
                                            style={{ background: TONES[idx % TONES.length].c, color: TONES[idx % TONES.length].fg }}>
                                            {idx + 1}
                                        </span>
                                        <p className="text-[#3D362E] text-[13.5px] leading-relaxed m-0"><strong className="text-[#16130F]">{tip.b}</strong> {tip.t}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>

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

                        {/* Expert Consultation CTA */}
                        <BookOkCta
                            hi="LOR check"
                            text="LOR ka draft ready? Free 1:1 call mein mentor se check karwao."
                            cta="Connect with Experts"
                        />

                    </div>

                </div>
            </div>
        </main>
    );
};

export default LORBlogPage;
