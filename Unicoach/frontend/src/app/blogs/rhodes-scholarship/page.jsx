import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    Clock, 
    Sparkles, 
    ArrowRight, 
    Award, 
    HelpCircle, 
    ChevronDown, 
    Check, 
    DollarSign,
    MapPin,
    GraduationCap,
    BookOpen
} from 'lucide-react';

import Interactive3DGrid from '@/components/Interactive3DGrid';

const RhodesScholarshipBlogPage = () => {
    const navigate = useNavigate();
    const [faqOpen, setFaqOpen] = useState({});

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const quickReads = [
        "India receives five Rhodes Scholarships at Oxford each year.",
        "India applications open 1 June and close 23 July 2026.",
        "Only Indian citizens are eligible; OCI and PIO holders do not qualify.",
        "The 2025-26 stipend is £20,400 yearly and covers living costs.",
        "Scholars selected in 2026 begin Oxford studies in October 2027.",
        "A first-class undergraduate degree is the minimum academic bar."
    ];

    const faqs = [
        {
            q: "What happens if I miss the deadline or am not selected?",
            a: "A missed deadline means waiting for the next cycle, as no late applications are accepted. If you are not selected, you may reapply only once more, and only in the same constituency. Treat each attempt deliberately, since your reapplication is limited to a single additional try."
        },
        {
            q: "Rhodes or Chevening: Which suits Indian students better?",
            a: "Rhodes suits younger applicants, typically final-year students or very recent graduates, and asks for no work experience. Chevening expects about 2,800 hours of work experience and a clear leadership track record. If you are still studying, target Rhodes; if you have two-plus years of work behind you, Chevening is the better fit."
        },
        {
            q: "What percentage or class do I need for the Rhodes Scholarship for India?",
            a: "You must at least meet the entry requirements of your chosen Oxford course, and a first-class honors degree or equivalent gives a much stronger chance of admission. There is no single cut-off percentage, but for Indian degrees the equivalent usually means a first-class result, often 65 to 70 percent or higher depending on the course."
        },
        {
            q: "What is the Rhodes Scholarship for India deadline for 2026?",
            a: "Applications open at 00:01 IST on 1 June 2026 and close at 23:59 IST on 23 July 2026. Your four references must be submitted by 23:59 IST on 6 August 2026. Submit early, because the portal does not accept late applications."
        },
        {
            q: "Is the Rhodes Scholarship for India fully funded?",
            a: "The award is fully funded for the length of your course. It covers Oxford fees in full, a yearly living stipend, the Oxford application fee, the UK visa fee and Immigration Health Surcharge, two economy flights, and a settling-in allowance. It does not cover partners or dependents."
        },
        {
            q: "How much is the Rhodes Scholarship stipend in Indian rupees?",
            a: "For 2025-26 the stipend is £20,400 a year, which is about Rs.25,47,960 at Rs.124.90 per pound, paid as roughly Rs.2,12,330 a month. This sits alongside full Oxford fees, visa and health-surcharge costs, and two flights, so your tuition is separately covered."
        },
        {
            q: "How many Rhodes Scholarships does India get every year?",
            a: "India receives five Rhodes Scholarships a year. The first Indian scholars took up residence at Oxford in 1947, and more than 200 Indians have received the award since. Globally, the Rhodes Trust selected 104 scholars across 29 nationalities for the 2025 class."
        },
        {
            q: "What is the age limit for the Rhodes Scholarship for India?",
            a: "For the India constituency, you must be aged 18 to 23 on 1 October 2026 or under 27 on that date if you completed your first undergraduate degree on or after 1 October 2025. The 'extended to 25 for engineering and medicine' rule applies to other constituencies, not India."
        },
        {
            q: "Can I apply for the Rhodes Scholarship for India with an OCI card?",
            a: "OCI and PIO cardholders cannot apply through the Indian constituency, because the Rhodes Trust requires Indian citizenship with an Indian passport or equivalent proof. Refugees and asylum seekers in India are considered. If you hold an OCI card, look at the Global Rhodes Scholarship or interjurisdictional consideration instead."
        }
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC] pt-20 pb-16">
            
            {/* Header Area */}
            <div className="relative pt-12 pb-16 px-6 md:px-12 mb-12 bg-gradient-to-b from-[#E9F1FE] via-[#F3F6FD] to-[#F8FAFC] overflow-hidden">
                <Interactive3DGrid gridSize={56} />
                <div className="max-w-[1240px] mx-auto relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-orange-200/80 rounded-full text-[#DE5C2B] text-xs font-bold uppercase tracking-wider shadow-xs">
                        <Sparkles size={12} className="text-[#DE5C2B]" />
                        <span>Scholarships & Funding</span>
                    </div>
                    <h1 className="text-3xl md:text-[2.6rem] font-black tracking-tight leading-tight max-w-4xl text-[#0F172A]">
                        The Rhodes Scholarship for India 2026-27: <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D]">Eligibility, Stipend and How to Apply</span>
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#DE5C2B]" />
                            <span>Last Updated On June 22, 2026</span>
                        </div>
                        <span>|</span>
                        <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-[#DE5C2B]" />
                            <span>12 min read</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Page view */}
            <div className="max-w-[1240px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Core content (8 columns) */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* Quick read box */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 text-slate-800 rounded-3xl p-6 md:p-8 shadow-xs border border-orange-200/80 space-y-4 relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                <Sparkles className="text-[#DE5C2B]" size={20} />
                                <h3 className="text-lg font-black tracking-tight text-[#0F172A]">⚡ Quick Read</h3>
                            </div>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-bold text-slate-700 relative z-10">
                                {quickReads.map((qr, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <Check size={14} className="text-[#DE5C2B] flex-shrink-0 mt-0.5" />
                                        <span>{qr}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-2 text-[11px] font-extrabold text-[#C04A1D] tracking-wide uppercase">
                                👉 Best for: Indian undergraduates aiming for the Rhodes scholarship for India for fully funded Oxford study.
                            </div>
                        </div>

                        {/* What covers */}
                        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                What the Rhodes Scholarship for India covers
                            </h3>
                            <p className="text-slate-650 text-xs md:text-sm leading-relaxed font-semibold">
                                The Rhodes Scholarship for India pays for full-time postgraduate study at the University of Oxford, plus a living stipend and travel. It is one of five places set aside for India each year, and it is fully funded for the length of your course.
                            </p>
                            <p className="text-slate-650 text-xs md:text-sm leading-relaxed font-semibold">
                                Here is precisely what the award covers, per the Rhodes Trust:
                            </p>
                            <ul className="space-y-2 text-xs font-semibold text-slate-600 list-disc list-inside bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                                <li>Oxford course fees in full for the duration of your degree.</li>
                                <li>A living stipend of <strong>£20,400 a year (Rs.25,47,960)</strong> for 2025-26, paid as £1,700 a month (Rs.2,12,330).</li>
                                <li>The Oxford application fee.</li>
                                <li>The UK student visa fee and the Immigration Health Surcharge (IHS), which gives you NHS access.</li>
                                <li>Two economy flights, to Oxford at the start and home at the end.</li>
                                <li>A settling-in allowance on arrival.</li>
                            </ul>
                            <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wide">
                                Exchange rate used: Rs.124.90 per £1 as of June 2026. Verify the current rate before finalizing your budget.
                            </p>
                            <div className="bg-amber-50 border border-amber-100 p-4.5 rounded-2xl text-xs text-amber-900 font-bold leading-relaxed">
                                💡 <strong>Counsellor insight:</strong> The stipend is calculated for a single student. The Rhodes Trust states plainly that it does not cover partners or dependents. If you are married or planning to bring family, build that cost into your plan separately, because the award will not stretch to it.
                            </div>
                        </div>

                        {/* Eligibility section */}
                        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                Rhodes Scholarship for India Eligibility: Who Can Actually Apply
                            </h3>
                            <p className="text-slate-650 text-xs md:text-sm leading-relaxed font-semibold">
                                Eligibility for the Rhodes Scholarship for India is precise, and a few criteria quietly disqualify strong students every year. Check each one against your situation before you invest months in an application.
                            </p>
                            
                            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl">
                                <table className="w-full text-left border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                                            <th className="p-3">Criterion</th>
                                            <th className="p-3">Requirement</th>
                                            <th className="p-3">What it means for Indian applicants</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-600 font-medium">
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-750">Citizenship</td>
                                            <td className="p-3">Indian citizen with an Indian passport or equivalent proof</td>
                                            <td className="p-3">OCI and PIO cardholders do not qualify through India.</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-750">Residency</td>
                                            <td className="p-3">Formal study in India for 4 of the last 10 years</td>
                                            <td className="p-3">Counted by school academic year, not calendar year.</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-750">Schooling/degree</td>
                                            <td className="p-3">10th/12th boards in India OR in final year of UG degree in India</td>
                                            <td className="p-3">Standard CBSE, ICSE, ISC, and State boards qualify.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-bold text-slate-750">Academic record</td>
                                            <td className="p-3">Undergraduate degree completed by July 2027</td>
                                            <td className="p-3">First-class honors (or equivalent) is the minimum bar.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Age limits */}
                        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                The Rhodes Scholarship for India Age limit, Explained
                            </h3>
                            <p className="text-slate-650 text-xs md:text-sm leading-relaxed font-semibold">
                                The Rhodes Scholarship for India age limit is one of the most searched and most misreported details. For the India constituency, the official criteria are:
                            </p>
                            <ul className="space-y-2 text-xs font-semibold text-slate-600 list-disc list-inside bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                                <li><strong>Standard route:</strong> Aged 18 to 23 on 1 October 2026 (born after 1 October 2002 and before 2 October 2008).</li>
                                <li><strong>Older-candidate route:</strong> You must be under 27 on 1 October 2026 (born after 1 October 1999), AND you must have completed the academic requirements for your first undergraduate degree on or after 1 October 2025.</li>
                            </ul>
                        </div>

                        {/* How to Apply */}
                        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                How to Apply for the Rhodes Scholarship for India: Step by Step
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { step: "1", title: "Read the official constituency guides", desc: "Download the India Information for Candidates. Verify which Oxford courses are covered before starting." },
                                    { step: "2", title: "Shortlist your Oxford courses", desc: "You apply for the Rhodes Scholarship before applying to Oxford. Select a primary course and a strong second choice." },
                                    { step: "3", title: "Register four referees early", desc: "You need three academic referees who have taught and graded you, plus one character referee." },
                                    { step: "4", title: "Write your statements", desc: "A personal statement of up to 1,000 words and an academic statement of up to 450 words." },
                                    { step: "5", title: "Upload your documents and submit", desc: "Register transcripts, passports, and school-leaving marksheets. Submit before 23:59 IST, 23 July 2026." }
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                                        <div className="w-8 h-8 rounded-full bg-indigo-650 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                                            {s.step}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{s.title}</h4>
                                            <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comparison section */}
                        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                Rhodes Scholarship vs. Other UK Funding Routes
                            </h3>
                            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl">
                                <table className="w-full text-left border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                                            <th className="p-3">Scholarship</th>
                                            <th className="p-3">Tenable Locations</th>
                                            <th className="p-3">Work Experience</th>
                                            <th className="p-3">Best-fit India profile</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-600 font-medium">
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-755">Rhodes</td>
                                            <td className="p-3">Oxford only</td>
                                            <td className="p-3">No</td>
                                            <td className="p-3">Young high-achievers (18-23) with leadership focus.</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-755">Chevening</td>
                                            <td className="p-3">Any eligible UK university</td>
                                            <td className="p-3">Yes, ~2,800 hours</td>
                                            <td className="p-3">Working professionals with post-study return plans.</td>
                                        </tr>
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-bold text-slate-755">Inlaks</td>
                                            <td className="p-3">Top US/UK/Europe unis</td>
                                            <td className="p-3">No</td>
                                            <td className="p-3">Indians under 30 in arts, humanities and sciences.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-bold text-slate-755">Felix / Clarendon</td>
                                            <td className="p-3">Oxford and partners</td>
                                            <td className="p-3">No</td>
                                            <td className="p-3">First-class Indian students with financial need.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* FAQs Accordion */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                                <HelpCircle className="text-indigo-650" size={20} />
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

                    {/* Right Column: Author Bio / Sidebar (4 columns) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Author Bio Card */}
                        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-inner">
                                    SB
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm leading-snug">Swathi Boppana</h4>
                                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Senior UK Counsellor</span>
                                </div>
                            </div>
                            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                                Swathi Boppana has over 6 years of study-abroad counselling experience, specializing in UK undergraduate, master's, and PhD pathways. Before UniCoach, she served as a Senior UK Counsellor at IDP Education, earning the Service Recognition Award in 2023. She has guided over 400 Indian students into top-tier UK institutions like Leeds, Sheffield, and Nottingham.
                            </p>
                            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-100">
                                Verified by UniCoach UK Team
                            </div>
                        </div>

                        {/* Related Guides / CTAs */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-150 rounded-3xl p-6 shadow-sm space-y-4">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Counselling Support</h4>
                            <h3 className="text-sm font-bold text-slate-800 leading-snug">
                                Speak with Swathi or other expert UK counsellors today for free.
                            </h3>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                Get direct roadmap support, profile building checklists, and IELTS waivers.
                            </p>
                            <button
                                onClick={() => navigate('/book-consultation')}
                                className="w-full py-3.5 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-orange-500 to-[#DE5C2B] hover:shadow-lg transition-all cursor-pointer text-center block"
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

export default RhodesScholarshipBlogPage;
