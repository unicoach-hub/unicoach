import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, FileText, CheckCircle2, AlertCircle, 
  HelpCircle, Phone, Mail, ArrowRight, ChevronRight,
  Scale, Lock, Sparkles, BookOpen
} from 'lucide-react';

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'services', title: '2. Scope of Educational Services' },
  { id: 'ai-tools', title: '3. AI Tools & Automated Evaluations' },
  { id: 'user-obligations', title: '4. User Obligations & Accuracy' },
  { id: 'communications', title: '5. Communications (Calls/WhatsApp/SMS)' },
  { id: 'payments-refunds', title: '6. Service Fees & Refund Policy' },
  { id: 'no-guarantee', title: '7. Admission & Visa Disclaimer' },
  { id: 'intellectual-property', title: '8. Intellectual Property' },
  { id: 'liability', title: '9. Limitation of Liability' },
  { id: 'termination', title: '10. Termination & Governing Law' },
];

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pt-[80px]">
      {/* ── Top Hero Header ── */}
      <section className="bg-gradient-to-b from-white via-blue-50/20 to-slate-50 border-b border-slate-200/80 pt-10 pb-12 md:pt-14 md:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#DE5C2B] mb-3 uppercase tracking-wider">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-slate-500">Legal</span>
            <ChevronRight size={13} className="text-slate-400" />
            <span>Terms of Service</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/70 border border-orange-200/80 text-[#C04A1D] text-xs font-bold mb-4">
            <Scale size={14} />
            <span>Legal Agreement & User Terms</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Terms of Service
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Please read these terms carefully. By accessing UniCoach, registering an account, or submitting any eligibility form, you agree to be bound by the terms outlined below.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <span>Last Updated: January 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>Effective Immediately</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={13} /> Fully Compliant
            </span>
          </div>
        </div>
      </section>

      {/* ── Main Content Layout ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Quick Nav Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-[105px] bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                Contents
              </p>
              <nav className="space-y-1 text-xs font-semibold">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer truncate ${
                      activeSection === s.id
                        ? 'bg-orange-50 text-[#C04A1D] font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:text-[#DE5C2B] hover:bg-slate-50'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <p className="font-bold text-slate-800">Need Clarification?</p>
                  <p className="text-slate-500 mt-1 text-[11.5px]">Our student support team is here to assist with any legal or advisory inquiries.</p>
                  <Link
                    to="/contact"
                    className="mt-2.5 inline-flex items-center gap-1 font-bold text-[#DE5C2B] hover:text-[#C04A1D] text-xs"
                  >
                    <span>Contact Support</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Body Content */}
          <main className="lg:col-span-8 space-y-10">

            {/* Section 1 */}
            <section id="acceptance" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  Welcome to <strong>UniCoach</strong> ("Company", "we", "our", or "us"). By accessing our website, platform, AI application tools, advisory consultations, or mobile services, you ("User", "Student", or "Customer") agree to be bound by these Terms of Service.
                </p>
                <p>
                  If you are registering or submitting details on behalf of another individual (such as a child or dependent), you represent and warrant that you possess appropriate legal authority to bind that individual to these terms. If you do not agree with any part of these terms, you must refrain from using our services.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="services" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                2. Scope of Educational & Consulting Services
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  UniCoach operates as an educational consultancy and student enablement platform facilitating study abroad pathways, including:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
                  <li>Global university and course recommendation engines.</li>
                  <li>Profile fitment, eligibility calculation, and scholarship matching.</li>
                  <li>Admissions counseling, document preparation review (SOPs, LORs, CVs), and university application facilitation.</li>
                  <li>Visa interview preparation, visa mock sessions, and consular guidance.</li>
                  <li>Standardized test resources (IELTS, TOEFL, GRE, GMAT, PTE).</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="ai-tools" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 text-[#DE5C2B] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                <span>Proprietary Technology</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                3. AI Tools & Automated Evaluations
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  UniCoach offers automated artificial intelligence features, including the <em>AI SOP Generator</em>, <em>AI Study Roadmap Planner</em>, <em>AI IELTS Evaluator</em>, and <em>Consular AI Visa Mock Simulation</em>.
                </p>
                <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-xl text-xs text-blue-900 leading-relaxed font-medium">
                  <strong>Informational Notice:</strong> AI evaluations, predictive scores, and draft generations are assistive guidance tools designed to optimize student preparedness. They do not constitute official academic credentials, government certifications, or visa authorizations. Final evaluation is always subject to human academic assessors and university admission committees.
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="user-obligations" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                4. User Obligations & Document Authenticity
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  By creating an account or engaging our advisors, you commit that:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
                  <li>All personal, financial, and academic information submitted is accurate, complete, and authentic.</li>
                  <li>You will not upload fraudulent, forged, or misrepresented documentation (such as fake marksheets, forged financial sponsor letters, or altered test scores).</li>
                  <li>Submission of deceptive or fabricated documentation will result in immediate termination of services without refund, and may be reported to relevant credential evaluation agencies and institutions.</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="communications" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                5. Communications Consent (Calls, WhatsApp, Emails & SMS)
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  When you submit your phone number or email address on UniCoach (such as via eligibility quizzes, consultation bookings, event registrations, or resource downloads), <strong>you explicitly consent to be contacted by UniCoach and our certified educational counselors</strong> via:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                    <Phone size={16} className="text-[#DE5C2B] flex-shrink-0" />
                    <span>Phone Calls regarding your shortlisted programs</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                    <Mail size={16} className="text-indigo-600 flex-shrink-0" />
                    <span>Email updates, application deadlines & roadmaps</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>WhatsApp notifications & counselor chats</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                    <ShieldCheck size={16} className="text-purple-600 flex-shrink-0" />
                    <span>SMS reminders for sessions & deadlines</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 pt-2">
                  This consent overrides National Do Not Call (NDNC) registrations strictly for service fulfillment and educational counseling purposes. You may opt out or modify notification preferences at any time by contacting our privacy team.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="payments-refunds" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                6. Service Fees & Refund Policy
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  While initial university search, exploratory tool access, and standard discovery on UniCoach are free, specialized premium services (such as Priority 1-on-1 Visa Coaching, comprehensive application dispatch, or expedited SOP writing) are subject to published service fees.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
                  <li><strong>Third-Party Fees:</strong> University application fees, embassy visa fees, courier charges, and third-party standardized test fees are paid directly to those respective organizations and are non-refundable by UniCoach.</li>
                  <li><strong>Consulting Fees:</strong> Customized consulting packages are governed by individual service schedules provided at enrollment.</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section id="no-guarantee" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
                <AlertCircle size={14} />
                <span>Important Admissions Disclaimer</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                7. Admission & Visa Grant Disclaimer
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  UniCoach counselors and AI algorithms utilize historic admission statistics, institutional benchmarks, and visa trends to maximize applicant success. 
                </p>
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed font-semibold">
                  Disclaimer: Final decisions regarding university admissions, scholarships, and student visas rest exclusively with the respective university admissions committees, scholarship granting bodies, and national embassies/consulates. UniCoach does not sell or guarantee admissions or visa issuance.
                </div>
              </div>
            </section>

            {/* Section 8, 9, 10 */}
            <section id="intellectual-property" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                8. Intellectual Property
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  All proprietary algorithms, AI models, website design, trademarks, course guides, and curriculum materials are the exclusive intellectual property of UniCoach Education. Unauthorized reproduction, scraping, reverse-engineering, or redistribution is strictly prohibited.
                </p>
              </div>
            </section>

            <section id="liability" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                9. Limitation of Liability
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  To the maximum extent permitted by applicable law, UniCoach shall not be liable for any indirect, incidental, consequential, or punitive damages arising from university policy changes, embassy processing delays, or user failure to adhere to specified deadlines.
                </p>
              </div>
            </section>

            <section id="termination" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                10. Termination & Governing Law
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
                </p>
              </div>
            </section>

            {/* Footer Support Callout */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-orange-500/20">
              <div>
                <h3 className="text-lg font-black">Questions about our Terms?</h3>
                <p className="text-xs text-blue-100 mt-1">Read our companion Privacy Policy or speak with our legal compliance desk.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/privacy-policy"
                  className="px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white transition-all"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/contact"
                  className="px-4 py-2.5 bg-white text-[#C04A1D] hover:bg-orange-50 rounded-xl text-xs font-bold transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
