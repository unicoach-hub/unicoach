import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, ArrowRight, HeartHandshake, Percent } from 'lucide-react';

export const ZeroFeeBanner = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white select-none">
      <div className="max-w-[1340px] mx-auto">
        
        <div className="rounded-[36px] bg-gradient-to-br from-[#111111] via-[#1E293B] to-[#0F172A] p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-[#DE5C2B]/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-emerald-500/15 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-4">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                <span>COMMISSION-FREE MENTORSHIP PLATFORM</span>
              </div>

              <h3 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                0% Platform Fee on All Services. <br />
                <span className="text-[#DE5C2B]">Keep 100% of your earnings.</span>
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal mb-8">
                Unlike traditional agencies that take 20% to 40% cuts, UniCoach charges <strong>zero platform fee</strong>. 
                Whether you host 1:1 calls, review SOPs, or sell digital checklists — you receive 100% of your listed price (only standard payment gateway charges like PayPal/Razorpay apply).
              </p>

              {/* Three Pill Advantages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="font-outfit text-2xl font-black text-emerald-400 mb-0.5">
                    0%
                  </div>
                  <div className="text-xs font-bold text-white">
                    Platform Commission
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    No hidden cuts or subscriptions
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="font-outfit text-2xl font-black text-white mb-0.5">
                    100%
                  </div>
                  <div className="text-xs font-bold text-white">
                    Direct Payout
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Escrow secured to your bank/UPI
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="font-outfit text-2xl font-black text-amber-400 mb-0.5">
                    Instant
                  </div>
                  <div className="text-xs font-bold text-white">
                    Calendar & Video
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Google Meet & Zoom automated
                  </div>
                </div>
              </div>

            </div>

            {/* Right Action Box */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-center text-left lg:text-center justify-center p-6 sm:p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#DE5C2B] text-white flex items-center justify-center text-3xl font-black shadow-lg mb-4">
                <Zap className="w-8 h-8 fill-white text-white" />
              </div>

              <div className="font-outfit text-xl font-bold text-white mb-2">
                Ready to mentor juniors?
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Takes less than 2 minutes to create your public storefront and start accepting bookings.
              </p>

              <Link
                to="/unicoach/apply"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <span>Create Your Storefront</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
