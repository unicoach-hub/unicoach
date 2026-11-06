import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Clock, UserX, FileText, MessageSquare, Gift, Mail } from 'lucide-react';

const UPDATED = '5 November 2026';

const Section = ({ id, icon: Icon, title, children }) => (
  <section id={id} className="scroll-mt-28 border-t border-slate-200 pt-8 mt-8 first:border-0 first:pt-0 first:mt-0">
    <h2 className="flex items-center gap-3 text-[22px] font-bold text-slate-900">
      <span className="w-9 h-9 rounded-xl bg-orange-50 text-[#DE5C2B] grid place-items-center shrink-0"><Icon size={18} /></span>
      {title}
    </h2>
    <div className="mt-4 space-y-3 text-[15.5px] leading-relaxed text-slate-700">{children}</div>
  </section>
);

// Refund & cancellation rules for paid mentor services booked on UniCoach (payments via Razorpay).
const RefundPolicyPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F6] pt-[132px] pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-[13px] font-semibold text-[#DE5C2B]">Legal</p>
        <h1 className="mt-2 text-[36px] sm:text-[44px] font-bold text-slate-900 leading-tight">Refund &amp; Cancellation Policy</h1>
        <p className="mt-2 text-[14px] text-slate-500">Last updated: {UPDATED}</p>

        <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-5 text-[15px] text-slate-700 leading-relaxed">
          UniCoach is a platform where students book paid services (1:1 video calls, SOP / resume reviews and Priority DMs)
          with verified mentors. Payments are collected securely through Razorpay. <b>All payments are final and non-refundable once
          you pay.</b> You get your money back only if the service is not delivered at all, as listed below. Free counselling with the
          UniCoach team has no charge, so no refund applies.
        </div>

        <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8">
          <Section id="summary" icon={RefreshCw} title="Summary">
            <div className="overflow-x-auto">
              <table className="w-full text-[14.5px] border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-left">
                  <tr><th className="p-3 font-semibold">Situation</th><th className="p-3 font-semibold">What you get</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr><td className="p-3">You cancel a 1:1 call, at any time</td><td className="p-3">No refund (one reschedule if you ask 24 hours or more before and the mentor agrees)</td></tr>
                  <tr><td className="p-3">You don't join the call</td><td className="p-3">No refund</td></tr>
                  <tr><td className="p-3">You change your mind or are unhappy after the service</td><td className="p-3">No refund (one revision for SOP / resume reviews)</td></tr>
                  <tr><td className="p-3">The mentor cancels or doesn't join within 15 minutes</td><td className="p-3">Full refund, or a free reschedule if you prefer</td></tr>
                  <tr><td className="p-3">SOP / resume review not delivered in the promised time</td><td className="p-3">Full refund</td></tr>
                  <tr><td className="p-3">Priority DM not answered within 24 hours</td><td className="p-3">Full refund</td></tr>
                  <tr><td className="p-3">Payment deducted but booking not confirmed</td><td className="p-3">Automatic full refund</td></tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="calls" icon={Clock} title="1:1 video calls">
            <p>Once you book and pay, the mentor keeps that time for you, so <b>cancellations are not refunded</b>, whenever you cancel.</p>
            <p>If you can't make it, ask for a reschedule from your dashboard or by writing to us <b>24 hours or more</b> before the session. You get one reschedule, if the mentor agrees. If you do not join, the session is treated as used.</p>
          </Section>

          <Section id="mentor" icon={UserX} title="If the mentor cancels or misses the session">
            <p>If the mentor cancels, or does not join within 15 minutes of the start time, you get a <b>full refund</b>. You can choose a free reschedule instead. The mentor is not paid for that booking.</p>
          </Section>

          <Section id="reviews" icon={FileText} title="SOP / resume reviews">
            <p>Once you pay, the review cannot be cancelled. If the review is not delivered within the time shown on the mentor's page (usually 48 hours), you get a full refund.</p>
            <p>If you are unhappy with the quality, write to us within 7 days and we will ask the mentor for one revision. A delivered review is not refunded.</p>
          </Section>

          <Section id="dm" icon={MessageSquare} title="Priority DMs">
            <p>A Priority DM is complete once the mentor replies. If the mentor does not reply within 24 hours, you get a full refund.</p>
          </Section>

          <Section id="free" icon={Gift} title="Free services">
            <p>Free counselling, free events, the university shortlister, scholarship tools and other free features have no charge, so nothing is refunded.</p>
          </Section>

          <Section id="how" icon={RefreshCw} title="How refunds are paid">
            <p>Refunds happen only in the cases above. They go back to the <b>original payment method</b> (UPI, card, net banking or wallet) through Razorpay. We start the refund within 2 working days of approval; your bank usually takes <b>5 to 7 working days</b> to show it.</p>
            <p>Payment gateway charges are not deducted from refunds that are due to a cancellation by the mentor or by UniCoach.</p>
          </Section>

          <Section id="contact" icon={Mail} title="Request a refund">
            <p>Write to <a className="text-[#DE5C2B] font-semibold hover:underline" href="mailto:support@unicoach.com">support@unicoach.com</a> with your booking details (name, email, mentor, date and payment ID). We reply within 2 working days.</p>
            <p>You can also reach us through the <Link to="/contact" className="text-[#DE5C2B] font-semibold hover:underline">contact page</Link>. See also our <Link to="/terms" className="text-[#DE5C2B] font-semibold hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-[#DE5C2B] font-semibold hover:underline">Privacy Policy</Link>.</p>
          </Section>
        </div>
      </div>
    </main>
  );
};

export default RefundPolicyPage;
