import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Lock, Eye, Server, UserCheck, 
  FileText, CheckCircle2, Phone, Mail, ArrowRight, 
  ChevronRight, Database, Cookie, RefreshCw
} from 'lucide-react';

const sections = [
  { id: 'introduction', title: '1. Introduction & Overview' },
  { id: 'collection', title: '2. Information We Collect' },
  { id: 'usage', title: '3. How We Use Your Data' },
  { id: 'communication-consent', title: '4. Communication Channels (Calls/SMS/WhatsApp)' },
  { id: 'sharing', title: '5. Sharing with Universities & Partners' },
  { id: 'security', title: '6. Data Security & Storage' },
  { id: 'cookies', title: '7. Cookies & Tracking Technologies' },
  { id: 'user-rights', title: '8. Your Rights & Data Choices' },
  { id: 'children', title: '9. Children & Minors' },
  { id: 'contact', title: '10. Data Protection Officer & Contact' },
];

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('introduction');

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
      <section className="bg-gradient-to-b from-white via-indigo-50/20 to-slate-50 border-b border-slate-200/80 pt-10 pb-12 md:pt-14 md:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-3 uppercase tracking-wider">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-slate-500">Legal</span>
            <ChevronRight size={13} className="text-slate-400" />
            <span>Privacy Policy</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/70 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-4">
            <ShieldCheck size={14} />
            <span>Privacy Commitment & Data Protection</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Your trust is our cornerstone. This policy explains how UniCoach collects, stores, protects, and handles your personal information, academic credentials, and communications.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <span>Last Updated: January 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>GDPR & DPDP Act Aligned</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={13} /> 256-Bit SSL Encrypted
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
                        ? 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <p className="font-bold text-slate-800">Data Concerns?</p>
                  <p className="text-slate-500 mt-1 text-[11.5px]">Request data export, review privacy rights, or request removal.</p>
                  <a
                    href="mailto:privacy@unicoach.com"
                    className="mt-2.5 inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 text-xs"
                  >
                    <span>privacy@unicoach.com</span>
                    <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Body Content */}
          <main className="lg:col-span-8 space-y-10">

            {/* Section 1 */}
            <section id="introduction" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                1. Introduction & Overview
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  UniCoach Education ("UniCoach", "we", "us", or "our") respects your privacy and is dedicated to safeguarding student and user personal information. We operate our platform and study abroad advisory services under international privacy principles, including the Digital Personal Data Protection Act (DPDP) and GDPR standards where applicable.
                </p>
                <p>
                  This Privacy Policy applies to information collected through our website, AI tools, mobile interfaces, consultation forms, and direct interactions with our counselors.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="collection" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                2. Information We Collect
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  Depending on your interaction with UniCoach, we collect:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
                  <li><strong>Identity & Contact Details:</strong> Full name, email address, mobile phone number, WhatsApp contact, city/country of residence.</li>
                  <li><strong>Academic & Profile Data:</strong> Degree history, GPA/percentage, graduation year, target intake, preferred study destinations (USA, UK, Canada, Germany, etc.), target budget, and course interests.</li>
                  <li><strong>Test Scores & Verification:</strong> Standardized test scores (IELTS, TOEFL, GRE, GMAT, PTE, SAT), English proficiency levels, and exam schedules.</li>
                  <li><strong>Application Documents:</strong> Resumes, draft SOPs, LORs, academic transcripts, and passport details when submitted for direct university application processing.</li>
                  <li><strong>Technical Telemetry:</strong> Device type, browser user-agent, IP address, and platform usage metrics to improve application responsiveness.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="usage" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                3. How We Use Your Data
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>We process your data strictly to facilitate your study abroad journey:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs">
                    <p className="font-bold text-slate-800">University Matching</p>
                    <p className="text-slate-500 mt-0.5">Evaluating your academic profile against real institutional admission criteria.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs">
                    <p className="font-bold text-slate-800">Application Dispatch</p>
                    <p className="text-slate-500 mt-0.5">Facilitating university enrollments, document verification, and scholarship queries.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs">
                    <p className="font-bold text-slate-800">AI Personalization</p>
                    <p className="text-slate-500 mt-0.5">Tailoring SOP generation, IELTS band rubrics, and visa consular mock interviews.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs">
                    <p className="font-bold text-slate-800">Counselor Advisory</p>
                    <p className="text-slate-500 mt-0.5">Enabling our certified counselors to review milestones and guide your visa prep.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="communication-consent" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Phone size={14} />
                <span>Explicit User Consent</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                4. Communication Channels (Calls, WhatsApp, Emails & SMS)
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  By submitting your mobile number or email address on UniCoach (such as when calculating eligibility, requesting a callback, or registering for a webinar), <strong>you explicitly authorize UniCoach to communicate with you</strong>:
                </p>
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 leading-relaxed font-medium">
                  "By submitting this form, you consent to our Terms of service and Privacy policy and to be contacted by us via Call/Email/WhatsApp/SMS."
                </div>
                <p>
                  These communications may include admissions counseling calls, application deadline reminders, visa interview slots, and personalized scholarship updates. We never send unsolicited spam. You may opt out or pause communications at any time by messaging "STOP" or notifying your dedicated counselor.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="sharing" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                5. Data Sharing with Universities & Partners
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 font-bold flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>Strict No-Sale Guarantee: UniCoach never sells, rents, or monetizes student data to third-party marketing companies.</span>
                </div>
                <p>
                  We share student information strictly in the following authorized circumstances:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
                  <li><strong>Target Universities & Colleges:</strong> Submitting your application dossier, transcripts, and credentials to universities you have chosen to apply to.</li>
                  <li><strong>Accredited Service Vendors:</strong> Verified cloud service providers (AWS, Google Cloud) and transactional communication gateways (WhatsApp Cloud API, SendGrid) under strict confidentiality agreements.</li>
                  <li><strong>Legal Compliance:</strong> When required by lawful government subpoena, visa consular verification, or statutory regulations.</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section id="security" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                6. Data Security & Storage
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  UniCoach employs modern enterprise-grade security protocols:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
                  <li><strong>Encryption in Transit:</strong> 256-bit TLS/SSL encryption for all data traversing between your device and our servers.</li>
                  <li><strong>Encryption at Rest:</strong> AES-256 standard encryption for stored databases and student document vaults.</li>
                  <li><strong>Role-Based Access:</strong> Access to student transcripts and personal files is restricted strictly to assigned certified counselors and admissions processing officers.</li>
                </ul>
              </div>
            </section>

            {/* Section 7, 8, 9, 10 */}
            <section id="cookies" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                7. Cookies & Tracking Technologies
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  We use essential session cookies to remember your login state, study program bookmarks, and application form progress. We also utilize anonymized analytics to gauge platform speed and optimize page loading times. You can manage cookie preferences directly through your browser settings.
                </p>
              </div>
            </section>

            <section id="user-rights" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                8. Your Rights & Data Choices
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>You have the right at any time to:</p>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
                  <li>Request a copy of your personal data held by UniCoach.</li>
                  <li>Request correction of inaccurate or outdated academic records.</li>
                  <li>Request deletion of your profile and uploaded documents (subject to retention rules for active university applications).</li>
                  <li>Withdraw communication consent for marketing updates.</li>
                </ul>
              </div>
            </section>

            <section id="children" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                9. Children & Minors
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  Our services are designed for students preparing for undergraduate, master's, or doctoral programs. If an applicant is under the age of 18, parental or legal guardian consent is required during consultation and application submission.
                </p>
              </div>
            </section>

            <section id="contact" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                10. Data Protection Officer & Contact
              </h2>
              <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
                <p>
                  If you have questions, concerns, or requests regarding this Privacy Policy, please reach out to our dedicated Data Protection Officer:
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 text-sm">UniCoach Privacy & Data Compliance Desk</p>
                  <p>Email: <a href="mailto:privacy@unicoach.com" className="text-[#DE5C2B] font-bold hover:underline">privacy@unicoach.com</a></p>
                  <p>Support: <a href="mailto:support@unicoach.com" className="text-[#DE5C2B] font-bold hover:underline">support@unicoach.com</a></p>
                  <p>Office: UniCoach Education Advisory, New Delhi, India</p>
                </div>
              </div>
            </section>

            {/* Footer Support Callout */}
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-500/20">
              <div>
                <h3 className="text-lg font-black">Need more details on user terms?</h3>
                <p className="text-xs text-indigo-100 mt-1">Review our comprehensive Terms of Service agreement.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/terms"
                  className="px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white transition-all"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/contact"
                  className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all"
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

export default PrivacyPolicyPage;
