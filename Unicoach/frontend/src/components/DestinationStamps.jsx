import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/*
 * Homepage study destinations as tilted postage stamps on teal (the Desi Pop stamp look from /career-counselling).
 * Same countries and facts as the older card carousel in Destinations.jsx.
 */

const STAMPS = [
  { id: 'usa', name: 'USA', hi: 'अमेरिका', tint: '#FBD9E6', universities: '4,500+', stay: '1–3 yrs' },
  { id: 'uk', name: 'UK', hi: 'ब्रिटेन', tint: '#DCE6FB', universities: '150+', stay: 'Up to 2 yrs' },
  { id: 'canada', name: 'Canada', hi: 'कनाडा', tint: '#FCDCD2', universities: '100+', stay: 'Up to 3 yrs' },
  { id: 'australia', name: 'Australia', hi: 'ऑस्ट्रेलिया', tint: '#FDE7C8', universities: '40+', stay: '2–4 yrs' },
  { id: 'germany', name: 'Germany', hi: 'जर्मनी', tint: '#FFF1B8', universities: '300+', stay: '18 months' },
  { id: 'ireland', name: 'Ireland', hi: 'आयरलैंड', tint: '#DDF3E4', universities: '35+', stay: '1–2 yrs' },
];
const TILT = [-3, 2, -2, 3, -1.5, 2.5];

const DestinationStamps = () => (
  <section id="destinations" className="bg-[#14837E] px-4 sm:px-6 py-14 sm:py-16">
    <div className="max-w-[1240px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-urbanist font-black text-[30px] sm:text-[40px] tracking-[-0.03em] leading-[1.05] text-white">Explore top study destinations</h2>
          <p className="mt-2 text-[14.5px] text-white/80">Fees, jobs after study and visa rules differ a lot. Compare before you choose.</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <span className="font-['Rozha_One',serif] text-[18px] text-[#F2B705]">सात समंदर पार, अब तुम्हारी बारी</span>
          <Link to="/study-abroad" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-white hover:text-[#F2B705]">
            All countries <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="mt-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 sm:gap-6">
        {STAMPS.map((s, i) => (
          <Link
            key={s.id}
            to={`/study-abroad/${s.id}`}
            className="group block bg-white p-2.5 shadow-[4px_4px_0_#0B4F4C] transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-0"
            style={{ transform: `rotate(${TILT[i]}deg)`, borderRadius: 4, outline: '3px dashed #FFF6E5', outlineOffset: '-7px' }}
          >
            <div className="aspect-square grid place-items-center" style={{ background: s.tint }}>
              <img src={`/images/destinations-3d/${s.id}.webp`} alt="" loading="lazy" width="480" height="480" className="w-[80%] h-auto drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="mt-2 px-1 flex items-baseline justify-between gap-2">
              <span className="font-urbanist font-extrabold text-[15px] text-[#16130F]">{s.name}</span>
              <span className="font-['Rozha_One',serif] text-[13px] text-[#14837E]">{s.hi}</span>
            </div>
            <dl className="mt-1.5 px-1 pb-1 text-[11.5px] leading-[1.7] text-[#5B544A]">
              <div className="flex justify-between gap-2"><dt>Universities</dt><dd className="font-semibold text-[#16130F]">{s.universities}</dd></div>
              <div className="flex justify-between gap-2"><dt className="whitespace-nowrap">Stay to work</dt><dd className="font-semibold text-[#16130F] whitespace-nowrap">{s.stay}</dd></div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default DestinationStamps;
