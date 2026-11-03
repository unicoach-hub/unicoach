import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Percent } from 'lucide-react';

// Desi Pop: flat mustard poster card with ink border, hard shadow and coloured fact tiles
const TILES = [
  { value: '0%', label: 'Platform Commission', note: 'No hidden cuts or subscriptions', bg: '#14837E', fg: '#FFFFFF' },
  { value: '100%', label: 'Direct Payout', note: 'Escrow secured to your bank/UPI', bg: '#FFFFFF', fg: '#16130F' },
  { value: 'Instant', label: 'Calendar & Video', note: 'Google Meet & Zoom automated', bg: '#B8285B', fg: '#FFFFFF' },
];

export const ZeroFeeBanner = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-[#FFF6E5] select-none">
      <div className="max-w-[1340px] mx-auto">

        <div className="rounded-[28px] bg-[#F2B705] p-6 sm:p-12 lg:p-16 text-[#16130F] relative overflow-hidden border-[3px] border-[#16130F] shadow-[8px_8px_0_#16130F]">

          {/* Halftone dots */}
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,19,15,.09)_1.3px,transparent_1.7px)] [background-size:12px_12px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Content */}
            <div className="lg:col-span-8 text-left min-w-0">

              <p className="font-urbanist font-extrabold text-[16px] leading-none text-[#D0362E]">Kamai poori, cut zero</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] text-[#16130F] text-[12.5px] font-extrabold tracking-[0.08em] mb-5 -rotate-1">
                <Percent className="w-3.5 h-3.5 text-[#14837E]" strokeWidth={3} />
                <span>COMMISSION-FREE MENTORSHIP PLATFORM</span>
              </div>

              <h3 className="font-urbanist text-[32px] sm:text-[44px] lg:text-[52px] font-black leading-[1.04] tracking-[-0.04em] mb-5">
                0% Platform Fee on All Services.{' '}
                <span className="inline-block mt-2 px-3 py-1 bg-[#16130F] text-white rotate-[-0.6deg]" style={{ borderRadius: 10 }}>
                  Keep 100% of your earnings.
                </span>
              </h3>

              <p className="text-[#2A251E] text-[15.5px] sm:text-[17px] leading-relaxed max-w-2xl font-medium mb-8">
                Unlike traditional agencies that take 20% to 40% cuts, UniCoach charges <strong>zero platform fee</strong>.
                Whether you host 1:1 calls, review SOPs, or sell digital checklists — you receive 100% of your listed price (only standard payment gateway charges like PayPal/Razorpay apply).
              </p>

              {/* Three fact tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TILES.map((t) => (
                  <div
                    key={t.label}
                    className="rounded-[16px] p-4 border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F]"
                    style={{ background: t.bg, color: t.fg }}
                  >
                    <div className="font-urbanist text-[30px] font-black leading-none mb-1.5">{t.value}</div>
                    <div className="text-[15px] font-extrabold">{t.label}</div>
                    <div className="text-[13.5px] font-medium opacity-90 mt-1">{t.note}</div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Action Box */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-center text-left lg:text-center justify-center p-6 sm:p-8 bg-white rounded-[20px] border-[3px] border-[#16130F] shadow-[6px_6px_0_#DE5C2B] min-w-0">
              <div className="w-16 h-16 rounded-[16px] bg-[#DE5C2B] text-white flex items-center justify-center border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] mb-4 rotate-[-4deg]">
                <Zap className="w-8 h-8 fill-white text-white" />
              </div>

              <div className="font-urbanist text-[24px] font-black leading-tight text-[#16130F] mb-2">
                Ready to mentor juniors?
              </div>
              <p className="text-[15px] leading-relaxed text-[#3D3830] mb-6">
                Takes less than 2 minutes to create your public storefront and start accepting bookings.
              </p>

              <Link
                to="/unicoach/apply"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#16130F] text-white font-bold text-[15px] border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Create Your Storefront</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
