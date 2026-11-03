import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/*
 * Homepage study destinations as straight postage stamps on teal (the Desi Pop stamp look from /career-counselling):
 * ink-bordered stamps, a Roman-Hinglish kicker over the heading.
 * Same countries and facts as the older card carousel in Destinations.jsx.
 */

const STAMPS = [
  { id: 'usa', name: 'USA', hi: 'अमेरिका', tint: '#FBD9E6', universities: '4,500+', stay: '1–3 yrs' },
  { id: 'uk', name: 'UK', hi: 'ब्रिटेन', tint: '#DCE6FB', universities: '150+', stay: '18 months' }, // Graduate Route from Jan 2027
  { id: 'canada', name: 'Canada', hi: 'कनाडा', tint: '#FCDCD2', universities: '100+', stay: 'Up to 3 yrs' },
  { id: 'australia', name: 'Australia', hi: 'ऑस्ट्रेलिया', tint: '#FDE7C8', universities: '40+', stay: '2–4 yrs' },
  { id: 'germany', name: 'Germany', hi: 'जर्मनी', tint: '#FFF1B8', universities: '300+', stay: '18 months' },
  { id: 'ireland', name: 'Ireland', hi: 'आयरलैंड', tint: '#DDF3E4', universities: '35+', stay: '1–2 yrs' },
];

const DestinationStamps = () => (
  <section id="destinations" className="bg-[#14837E] px-4 sm:px-6 py-14 sm:py-16">
    <div className="max-w-[1240px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-urbanist font-extrabold text-[16px] leading-none text-[#F2B705]">Saat samundar paar, ab tumhari baari</p>
          <h2 className="mt-2 font-urbanist font-black text-[30px] sm:text-[40px] tracking-[-0.03em] leading-[1.05] text-white">Explore top study destinations</h2>
          <p className="mt-2 text-[15px] sm:text-[16px] text-white/90">Fees, jobs after study and visa rules differ a lot. Compare before you choose.</p>
        </div>
        <Link to="/study-abroad" className="no-shine inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-[#F2B705] text-[#16130F] text-[14.5px] font-bold border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] transition-transform hover:-translate-y-0.5">
          All countries <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mt-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {STAMPS.map((s) => (
          <Link
            key={s.id}
            to={`/study-abroad/${s.id}`}
            className="group block min-w-0 bg-white p-2.5 border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] transition-transform duration-300 hover:-translate-y-1.5"
            style={{ borderRadius: 6, outline: '2px dashed rgba(22,19,15,0.25)', outlineOffset: '-8px' }}
          >
            <div className="aspect-square grid place-items-center border-2 border-[#16130F]" style={{ background: s.tint, borderRadius: 3 }}>
              <img src={`/images/destinations-3d/${s.id}.webp`} alt="" loading="lazy" width="480" height="480" className="w-[80%] h-auto transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="mt-2 px-1 flex items-baseline justify-between gap-2">
              <span className="font-urbanist font-black text-[16px] text-[#16130F]">{s.name}</span>
              <span className="text-[12.5px] font-semibold text-[#14837E] truncate">{s.hi}</span>
            </div>
            <dl className="mt-1.5 px-1 pb-1 pt-1.5 border-t-2 border-[#16130F] text-[12.5px] sm:text-[13px] leading-[1.6] text-[#5B544A]">
              <div className="flex justify-between gap-2"><dt>Universities</dt><dd className="font-bold text-[#16130F]">{s.universities}</dd></div>
              <div className="flex justify-between gap-2"><dt className="whitespace-nowrap">Stay to work</dt><dd className="font-bold text-[#16130F] text-right sm:whitespace-nowrap">{s.stay}</dd></div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default DestinationStamps;
