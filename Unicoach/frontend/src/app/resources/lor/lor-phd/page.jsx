import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronDown,
    Sparkles,
    FileText,
    ArrowRight,
    PenTool,
    Atom,
    GitBranch,
    Lightbulb
} from 'lucide-react';
import { PostageStamp } from '../../../../components/desi/DesiPop';
import { VersusCard } from '../../../../components/ui/Infographics';
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

const LORPhdPage = () => {
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
        <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F] overflow-x-clip">
            {/* ── HERO: rani poster band ── */}
            <DesiHero
                tone="rani"
                sign={{ hi: 'शोध सिफ़ारिश', en: 'PHD LOR' }}
                crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'LOR' }, { label: 'LOR for PhD' }]}
                title="Letter of Recommendation (LOR) for PhD"
                subtitle="Highlighting independent research capabilities, thesis advisor alignments, publication records, and laboratory expertise."
                stickers={(
                    <Sticker bg="#F2B705" tilt={-2}><Sparkles size={14} />Doctoral Admissions</Sticker>
                )}
                aside={(
                    // postage stamp, large screens only
                    <div className="hidden lg:flex justify-center pointer-events-none">
                        <PostageStamp title="Research" hi="शोध" note="Doctoral LOR" className="w-[170px] rotate-6" />
                    </div>
                )}
            />

            {/* ── LOR PICKER (phones and tablets) ── */}
            <div className="lg:hidden max-w-[1240px] mx-auto px-4 -mt-6 mb-8 relative z-10">
                <InkCard className="p-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B544A] leading-none px-1 mb-2">LOR Directory</p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {lorList.map((lor) => {
                            const isCurrent = lor.key === 'lor-phd';
                            return (
                                <Link
                                    key={lor.key}
                                    to={lor.path}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isCurrent ? 'border-[#16130F] bg-[#B8285B] text-white shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
                                >
                                    <FileText size={13} />
                                    <span>{lor.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </InkCard>
            </div>

            {/* Layout Grid */}
            <div className="max-w-[1240px] mx-auto px-4 md:px-8 lg:pt-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                    {/* Left Sticky Navigation (desktop) */}
                    <aside className="hidden lg:block lg:col-span-1 sticky top-28">
                        <InkCard className="p-4">
                            <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Recommendation letters</p>
                            <h3 className="mt-1 mb-3 font-urbanist font-black text-[17px]">LOR Directory</h3>
                            <nav className="flex flex-col gap-2">
                                {lorList.map((lor) => {
                                    const isCurrent = lor.key === 'lor-phd';
                                    return (
                                        <Link
                                            key={lor.key}
                                            to={lor.path}
                                            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border-2 text-[14px] font-bold transition-transform ${isCurrent ? 'border-[#16130F] bg-[#B8285B] text-white shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
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

                    {/* Right Content Column */}
                    <div className="lg:col-span-3 space-y-10 min-w-0">

                        {/* Overview Section */}
                        <InkCard className="p-6 md:p-8 space-y-4" shadow="#B8285B">
                            <DesiHeading hi="PhD mein kya alag">Writing a PhD LOR: Key Differences</DesiHeading>
                            <p className="text-[#5B544A] leading-relaxed text-[15px]">
                                A doctoral degree is a test of research endurance and autonomy. Admissions committees for PhD programs want to see evidence that the candidate can formulate original scientific questions, design experimental configurations, publish research in respected journals, and troubleshoot model failures independently.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                                <div className="bg-[#FFF6E5] border-[3px] border-[#16130F] p-4 rounded-xl space-y-2 shadow-[3px_3px_0_#16130F] md:-rotate-[0.8deg]">
                                    <span className="w-9 h-9 rounded-full border-2 border-[#16130F] grid place-items-center" style={{ background: TONES[0].c, color: TONES[0].fg }}>
                                        <Atom size={18} />
                                    </span>
                                    <h4 className="text-[12.5px] font-extrabold text-[#16130F] uppercase tracking-wider">Technical Mastery</h4>
                                    <p className="text-[#5B544A] text-[13px] leading-relaxed">Detailed descriptions of instrument setups, coding libraries, computational algorithms, and methodologies mastered.</p>
                                </div>
                                <div className="bg-[#FFF6E5] border-[3px] border-[#16130F] p-4 rounded-xl space-y-2 shadow-[3px_3px_0_#16130F] md:rotate-[0.6deg]">
                                    <span className="w-9 h-9 rounded-full border-2 border-[#16130F] grid place-items-center" style={{ background: TONES[2].c, color: TONES[2].fg }}>
                                        <GitBranch size={18} />
                                    </span>
                                    <h4 className="text-[12.5px] font-extrabold text-[#16130F] uppercase tracking-wider">Publications & Patents</h4>
                                    <p className="text-[#5B544A] text-[13px] leading-relaxed">Excerpts mentioning co-authored research papers, presentation files, conference proceedings, or workshop drafts.</p>
                                </div>
                                <div className="bg-[#FFF6E5] border-[3px] border-[#16130F] p-4 rounded-xl space-y-2 shadow-[3px_3px_0_#16130F] md:-rotate-[0.4deg]">
                                    <span className="w-9 h-9 rounded-full border-2 border-[#16130F] grid place-items-center" style={{ background: TONES[3].c, color: TONES[3].fg }}>
                                        <Lightbulb size={18} />
                                    </span>
                                    <h4 className="text-[12.5px] font-extrabold text-[#16130F] uppercase tracking-wider">Intellectual Autonomy</h4>
                                    <p className="text-[#5B544A] text-[13px] leading-relaxed">Accounts of the student overcoming failed trials, fixing experimental design flaws, and carrying out solo literature reviews.</p>
                                </div>
                            </div>
                        </InkCard>

                        {/* Who should write it: from the h-index FAQ below */}
                        <div className="shadow-[6px_6px_0_#16130F] rounded-[18px]">
                        <VersusCard
                            kicker="Choosing a recommender"
                            title="Famous name vs close supervisor"
                            left={{ title: 'Famous professor', tag: 'Generic', points: ['Recognized name in your field', 'Barely knows you, so the letter stays generic'] }}
                            right={{ title: 'Close supervisor', tag: 'Better', points: ['Worked closely with you', 'Highly detailed, personalized letter'] }}
                        />
                        </div>

                        {/* PhD LOR Builder Widget */}
                        <InkCard as="section" className="p-6 md:p-8 space-y-6" shadow="#D0362E">
                            <DesiHeading hi="Apna structure banao">
                                <span className="inline-flex items-center gap-2">
                                    <PenTool className="text-[#D0362E] shrink-0" size={24} />
                                    PhD Research LOR Builder
                                </span>
                            </DesiHeading>
                            <p className="text-[#5B544A] text-[14px] leading-relaxed">
                                Input research parameters to construct a structured recommendation template designed for thesis advisors and PIs.
                            </p>

                            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Candidate Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.studentName}
                                        onChange={e => setDraftInput({...draftInput, studentName: e.target.value})}
                                        placeholder="e.g. Priyanshu Gupta"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Research Field</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.researchField}
                                        onChange={e => setDraftInput({...draftInput, researchField: e.target.value})}
                                        placeholder="e.g. Quantum Computing"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Recommender / PI Name</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.recommenderName}
                                        onChange={e => setDraftInput({...draftInput, recommenderName: e.target.value})}
                                        placeholder="e.g. Dr. Arthur Pendelton"
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
                                        placeholder="e.g. Principal Investigator / Senior Professor"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1.5 min-w-0">
                                    <label className={LABEL}>Laboratory Name & Institution</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.recommenderLab}
                                        onChange={e => setDraftInput({...draftInput, recommenderLab: e.target.value})}
                                        placeholder="e.g. Quantum Systems Laboratory, IISc Bangalore"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Thesis / Dissertation Subject</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.thesisSubject}
                                        onChange={e => setDraftInput({...draftInput, thesisSubject: e.target.value})}
                                        placeholder="e.g. error correction protocols in silicon spin qubits"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <label className={LABEL}>Key Publication Reference</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.keyPublication}
                                        onChange={e => setDraftInput({...draftInput, keyPublication: e.target.value})}
                                        placeholder="e.g. Nature Physics 2025"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1.5 min-w-0">
                                    <label className={LABEL}>Core Research Methodology / Instrument Mastery</label>
                                    <input 
                                        type="text" 
                                        value={draftInput.masteryMethod}
                                        onChange={e => setDraftInput({...draftInput, masteryMethod: e.target.value})}
                                        placeholder="e.g. low-temperature cryogenics measurements and RF reflectometry"
                                        className={FIELD}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="no-shine col-span-1 md:col-span-2 py-3.5 rounded-full border-2 border-[#16130F] bg-[#D0362E] hover:bg-[#B52A23] text-white font-bold text-[14px] shadow-[3px_3px_0_#16130F] transition-colors cursor-pointer text-center"
                                >
                                    Build PhD Outline Draft
                                </button>
                            </form>

                            {generatedOutline && (
                                <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
                                    <h4 className="text-[11.5px] font-extrabold text-[#5B544A] uppercase tracking-widest">PhD Outline Draft Framework</h4>
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

                        {/* PhD Sample Transcript: teal poster band with the letter on paper */}
                        <section className="bg-[#14837E] border-[3px] border-[#16130F] p-5 sm:p-6 md:p-8 shadow-[6px_6px_0_#16130F]" style={{ borderRadius: 18 }}>
                            <DesiHeading hi="Sample letter" light>Sample PhD Recommendation Letter</DesiHeading>
                            <div className="mt-6 bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#0B4F4C] sm:-rotate-[0.4deg]" style={{ borderRadius: 6 }}>
                                <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-3 border-b-2 border-dashed border-[#16130F33]">
                                    <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8A7F70] min-w-0">Doctoral LOR</span>
                                    <span className="shrink-0 inline-flex flex-col items-center px-2.5 py-1 border-[3px] border-double border-[#D0362E] text-[#D0362E] rotate-[-6deg] leading-none" style={{ borderRadius: 6 }}>
                                        <span className="font-urbanist font-extrabold text-[13px]">Sample</span>
                                        <span className="font-['Anton',sans-serif] text-[10.5px] tracking-[0.14em] mt-0.5">SAMPLE</span>
                                    </span>
                                </div>
                                <div className="px-5 sm:px-7 py-6 text-[13.5px] md:text-[14.5px] text-[#2A251F] leading-relaxed whitespace-pre-wrap break-words">
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
                        </section>

                        {/* FAQs Section */}
                        <section>
                            <DesiHeading hi="Sabke sawaal">PhD Recommendation FAQs</DesiHeading>
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
                            text="PhD LOR ka draft ready? Free 1:1 call mein mentor se check karwao."
                        />

                    </div>

                </div>
            </div>
        </main>
    );
};

export default LORPhdPage;
