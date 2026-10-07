import { motion } from 'framer-motion';

/**
 * UnicoachFeatureBentoGrid
 * Pixel-perfect UniCoach-style Bento Grid graphics showcase
 * Highlighting 6 core creator monetization pillars:
 * 1. 2X convert better with localised currency
 * 2. 40% increase in conversion with testimonial showcase
 * 3. upto 4X your earnings with country based pricing
 * 4. Instant payouts (PayPal / Bank transfer)
 * 5. 13% uplift in bookings with abandon cart emails
 * 6. Get Discovered (Automated funnels)
 */
export const UnicoachFeatureBentoGrid = ({ className = "" }) => {
  return (
    <div className={`w-full max-w-[1240px] mx-auto ${className}`}>
      
      {/* 3x2 Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

        {/* ════════ CARD 1: PEACH (Localised Currency) ════════ */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[280px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(254,215,206,0.6)] transition-all relative overflow-hidden"
          style={{ backgroundColor: '#FED7CE' }}
        >
          {/* Top row: Shopping Bag vector + 2X Metric */}
          <div className="flex items-start justify-between">
            {/* Custom SVG Shopping Bag with Lightning Bolt */}
            <div className="w-14 h-14 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="w-13 h-13 text-[#111827]">
                {/* Bag handles */}
                <path
                  d="M18 16V12C18 8.68629 20.6863 6 24 6C27.3137 6 30 8.68629 30 12V16"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                {/* Bag body */}
                <path
                  d="M11 16H37L39.5 41H8.5L11 16Z"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
                {/* Lightning symbol cutout */}
                <path
                  d="M25.5 20L19.5 29.5H25.5L23.5 37.5L30.5 27.5H24.5L26.5 20H25.5Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Huge 2X Metric */}
            <div className="font-outfit text-5xl sm:text-6xl font-black text-[#111827] tracking-tight leading-none">
              2X
            </div>
          </div>

          {/* Bottom text */}
          <div className="mt-8 text-right">
            <p className="font-outfit text-base sm:text-lg text-[#111827] leading-snug">
              convert better with <br />
              <strong className="font-black text-[#111827]">localised currency</strong>
            </p>
          </div>
        </motion.div>

        {/* ════════ CARD 2: LILAC (Testimonial Showcase) ════════ */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[280px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(226,220,254,0.6)] transition-all relative overflow-hidden"
          style={{ backgroundColor: '#E2DCFE' }}
        >
          {/* Top row: Floating Testimonial Speech Pills + 40% Metric */}
          <div className="flex items-start justify-between gap-2">
            {/* Diagonal Floating Review Badges */}
            <div className="space-y-2.5 pt-1">
              {/* Badge 1 */}
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] inline-flex items-center gap-2 border border-white/80 transform -rotate-3 hover:rotate-0 transition-transform">
                <img
                  src="/speaker_tanisha.webp"
                  alt="Student reviewer"
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80";
                  }}
                />
                <span className="text-[11.5px] font-semibold text-slate-800 whitespace-nowrap">
                  5/5 &ldquo;Loved the session&rdquo;
                </span>
              </div>

              {/* Badge 2 */}
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] inline-flex items-center gap-2 border border-white/80 transform rotate-2 hover:rotate-0 transition-transform ml-3">
                <img
                  src="/speaker_hardik.webp"
                  alt="Student reviewer"
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80";
                  }}
                />
                <span className="text-[11.5px] font-semibold text-slate-800 whitespace-nowrap">
                  5/5 &ldquo;Best advice ever&rdquo;
                </span>
              </div>
            </div>

            {/* 40% Metric */}
            <div className="font-outfit text-5xl sm:text-6xl font-black text-[#111827] tracking-tight leading-none flex-shrink-0">
              40%
            </div>
          </div>

          {/* Bottom text */}
          <div className="mt-8 text-right">
            <p className="font-outfit text-base sm:text-lg text-[#111827] leading-snug">
              increase in conversion <br />
              with <strong className="font-black text-[#111827]">testimonial showcase</strong>
            </p>
          </div>
        </motion.div>

        {/* ════════ CARD 3: LIME GREEN (Country Based Pricing) ════════ */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[280px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(159,211,104,0.6)] transition-all relative overflow-hidden"
          style={{ backgroundColor: '#9FD368' }}
        >
          {/* Subtle continent contour silhouettes in dark translucent green */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg viewBox="0 0 400 300" className="w-full h-full object-cover">
              <path
                d="M-20 60 C40 20, 100 80, 140 40 C180 0, 240 70, 300 30 C360 -10, 420 50, 440 20 L440 200 C380 240, 320 180, 260 220 C200 260, 140 190, 80 230 L-20 200 Z"
                fill="#15803D"
              />
            </svg>
          </div>

          {/* Top row: Floating Pricing Tags with Flags */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              {/* USA 400$ tag */}
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md inline-flex items-center gap-2 border border-white/90">
                {/* US SVG Flag */}
                <svg viewBox="0 0 24 16" className="w-5 h-3.5 rounded-[2px] shadow-2xs overflow-hidden flex-shrink-0">
                  <rect width="24" height="16" fill="#B22234" />
                  <path d="M0 2.46h24v2.46H0zM0 7.38h24v2.46H0zM0 12.3h24v2.46H0z" fill="#FFF" />
                  <rect width="9.6" height="8.6" fill="#3C3B6E" />
                </svg>
                <span className="font-outfit font-black text-sm text-[#111827]">
                  400$
                </span>
              </div>

              {/* India 100$ tag */}
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md inline-flex items-center gap-2 border border-white/90">
                {/* Indian SVG Flag */}
                <svg viewBox="0 0 24 16" className="w-5 h-3.5 rounded-[2px] shadow-2xs overflow-hidden flex-shrink-0">
                  <rect width="24" height="5.33" fill="#FF9933" />
                  <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
                  <rect y="10.66" width="24" height="5.33" fill="#128807" />
                  <circle cx="12" cy="8" r="1.8" fill="#000080" />
                </svg>
                <span className="font-outfit font-black text-sm text-[#111827]">
                  100$
                </span>
              </div>
            </div>
          </div>

          {/* Center & Bottom: upto 4X Metric & Label */}
          <div className="relative z-10 mt-6 text-right">
            <div className="font-outfit text-4xl sm:text-5xl font-black text-[#111827] tracking-tight leading-none mb-2">
              upto 4X
            </div>
            <p className="font-outfit text-base sm:text-lg text-[#111827] leading-snug">
              your earnings with <strong className="font-black text-[#111827]">country</strong> <br />
              <strong className="font-black text-[#111827]">based pricing</strong>
            </p>
          </div>
        </motion.div>

        {/* ════════ CARD 4: SKY BLUE (Instant Payouts) ════════ */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[280px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(112,182,237,0.6)] transition-all relative overflow-hidden"
          style={{ backgroundColor: '#70B6ED' }}
        >
          {/* Top row: PayPal + Bank transfer badges */}
          <div className="space-y-2.5">
            {/* PayPal Badge */}
            <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-md inline-flex items-center gap-1.5 border border-white/90">
              <svg viewBox="0 0 85 22" className="h-4.5 w-auto">
                <path d="M9.5 2.2C8.9 1.4 7.8 1 6.5 1H2C1.6 1 1.2 1.3 1.1 1.7L0 17.5C0 17.8 0.3 18.1 0.6 18.1H4L4.8 12.5C4.9 12.1 5.2 11.8 5.6 11.8H7.3C10.2 11.8 12.3 10.5 12.9 7.4C13.2 5.7 12.8 4.4 11.9 3.5C11.3 2.8 10.4 2.4 9.5 2.2Z" fill="#003087" />
                <path d="M10.3 6.6C9.8 9 8.1 10 5.7 10H4.3L3.3 16.3C3.2 16.6 3.5 16.9 3.8 16.9H6.9C7.3 16.9 7.6 16.6 7.7 16.2L8.4 11.6C8.5 11.2 8.8 10.9 9.2 10.9H10.1C12.7 10.9 14.6 9.8 15.2 6.9C15.4 5.7 15.2 4.7 14.7 3.9C13.8 5 12.3 6.3 10.3 6.6Z" fill="#0079C1" />
                <text x="21" y="15" fontFamily="Arial, sans-serif" fontStyle="italic" fontWeight="900" fontSize="14.5" fill="#003087">Pay</text>
                <text x="47" y="15" fontFamily="Arial, sans-serif" fontStyle="italic" fontWeight="900" fontSize="14.5" fill="#0079C1">Pal</text>
              </svg>
            </div>

            {/* Bank Transfer Badge */}
            <div className="block">
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md inline-flex items-center gap-2 border border-white/90">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#111827]">
                  <path d="M12 2L1 7V9H23V7L12 2ZM4 11H7V18H4V11ZM10.5 11H13.5V18H10.5V11ZM17 11H20V18H17V11ZM1 20V22H23V20H1Z" />
                </svg>
                <span className="font-outfit text-xs font-black text-[#111827]">
                  Bank transfer
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Heading & Subtitle */}
          <div className="mt-8">
            <h3 className="font-outfit text-3xl sm:text-4xl font-black text-[#111827] tracking-tight leading-tight mb-2">
              Instant payouts
            </h3>
            <p className="font-outfit text-sm sm:text-base text-[#111827]/90 leading-snug font-normal">
              No payment cycle, no fuss, withdraw directly to bank account
            </p>
          </div>
        </motion.div>

        {/* ════════ CARD 5: WARM CREAM (Abandon Cart Emails) ════════ */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[280px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(244,235,209,0.7)] transition-all relative overflow-hidden"
          style={{ backgroundColor: '#F6EBD3' }}
        >
          {/* Top row: Shopping Cart with Checkmark + 13% Metric */}
          <div className="flex items-start justify-between">
            {/* Custom SVG Shopping Cart with Checkmark in Warm Caramel */}
            <div className="w-14 h-14 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="w-13 h-13 text-[#C29547]">
                {/* Cart Body */}
                <path
                  d="M6 8H12L16 27H36L39.5 13H14"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Wheels */}
                <circle cx="18" cy="35" r="3" fill="currentColor" />
                <circle cx="34" cy="35" r="3" fill="currentColor" />
                {/* Checkmark in cart */}
                <path
                  d="M23 19L27 23L34 16"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* 13% Metric */}
            <div className="font-outfit text-5xl sm:text-6xl font-black text-[#111827] tracking-tight leading-none">
              13%
            </div>
          </div>

          {/* Bottom text */}
          <div className="mt-8 text-right">
            <p className="font-outfit text-base sm:text-lg text-[#111827] leading-snug">
              uplift in bookings with <br />
              <strong className="font-black text-[#111827]">abandon cart emails</strong>
            </p>
          </div>
        </motion.div>

        {/* ════════ CARD 6: MINT TEAL (Get Discovered / Funnels) ════════ */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[260px] sm:min-h-[280px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(157,227,220,0.6)] transition-all relative overflow-hidden"
          style={{ backgroundColor: '#9DE3DC' }}
        >
          {/* Top row: Interactive Flow Funnel Diagram */}
          <div className="flex flex-col items-center pt-1">
            {/* Step 1: User Node */}
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm inline-flex items-center gap-1.5 border border-white/90">
              <img
                src="/speaker_prateek.webp"
                alt="Student user"
                className="w-4 h-4 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80";
                }}
              />
              <span className="font-outfit text-[11.5px] font-bold text-[#111827]">User</span>
            </div>

            {/* Vertical connector arrow */}
            <div className="text-[#111827] font-bold text-xs my-1 leading-none">
              ↓
            </div>

            {/* Step 2: unicoach.com ──> Your Booking */}
            <div className="flex items-center gap-2">
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-white/90 font-outfit text-xs font-black text-[#111827]">
                unicoach.com
              </div>
              <div className="text-[#111827] font-bold text-xs">
                →
              </div>
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm inline-flex items-center gap-1.5 border border-white/90">
                <img
                  src="/speaker_tanisha.webp"
                  alt="Mentor booking"
                  className="w-4 h-4 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80";
                  }}
                />
                <span className="font-outfit text-[11.5px] font-bold text-[#111827] whitespace-nowrap">
                  Your Booking
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Heading & Subtitle */}
          <div className="mt-8">
            <h3 className="font-outfit text-3xl sm:text-4xl font-black text-[#111827] tracking-tight leading-tight mb-2">
              Get Discovered
            </h3>
            <p className="font-outfit text-sm sm:text-base text-[#111827]/90 leading-snug font-normal">
              <strong className="font-black text-[#111827]">Automated funnels</strong> that bring you new bookings regularly
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default UnicoachFeatureBentoGrid;
