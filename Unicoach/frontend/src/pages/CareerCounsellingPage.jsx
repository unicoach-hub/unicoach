import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BookOkCta } from '../components/desi/BookOkCta';

/*
 * Career counselling landing page in the "railway station" Desi Pop look:
 * station board + departures, ticket cards, mentor-country stamps, a chai-length plan and a truck-art CTA.
 */

const INK = '#16130F';
const BOOK = '/book-consultation';

// Departures board: every row is a real route on the site
const DEPARTURES = [
  { train: 'Career Express', to: 'Kaunsi stream?', platform: 1, status: 'Boarding now', tone: '#3DDC84', link: BOOK },
  { train: 'Dublin Mail', to: 'Masters, Ireland', platform: 2, status: 'On time', tone: '#F2B705', link: '/study-abroad/ireland' },
  { train: 'Melbourne Rajdhani', to: 'Go8 and PR routes', platform: 3, status: 'On time', tone: '#F2B705', link: '/study-abroad/australia' },
  { train: 'Berlin Shatabdi', to: 'Low tuition Europe', platform: 4, status: 'Seats open', tone: '#3DDC84', link: '/study-abroad/germany' },
  { train: 'Course Local', to: '98,000+ programs', platform: 5, status: 'Daily', tone: '#F2B705', link: '/search-programs' },
];

const TICKETS = [
  { hi: 'कक्षा 12 के बाद', title: 'Class 12 ke baad', text: 'Stream, course aur college. Engineering ke alawa bhi duniya hai.', bg: '#FCE38A', fg: INK },
  { hi: 'ग्रेजुएशन के बाद', title: 'Graduation ke baad', text: 'Job, Masters India mein, ya abroad. Teeno ko honestly compare karo.', bg: '#D0362E', fg: '#FFFFFF' },
  { hi: 'विदेश का प्लान', title: 'Abroad plan ready', text: 'Shortlist, tests, loan aur visa. Woh mentor jo wahan reh chuka hai.', bg: '#FFFFFF', fg: INK },
];

// Only countries where a UniCoach mentor actually lives and works
const STAMPS = [
  { name: 'Ireland', hi: 'आयरलैंड', img: '/images/destinations-3d/ireland.webp', tint: '#DDF3E4', link: '/study-abroad/ireland' },
  { name: 'Australia', hi: 'ऑस्ट्रेलिया', img: '/images/destinations-3d/australia.webp', tint: '#FDE7C8', link: '/study-abroad/australia' },
  { name: 'Germany', hi: 'जर्मनी', img: '/images/destinations-3d/germany.webp', tint: '#FFF1B8', link: '/study-abroad/germany' },
  { name: 'USA', hi: 'अमेरिका', img: '/images/destinations-3d/usa.webp', tint: '#FBD9E6', link: '/study-abroad/usa' },
];

const CHAI_POINTS = [
  { title: 'Stream ya course', text: 'Kaunsa tumhe fit hai, kaunsa sirf trend hai.' },
  { title: 'India ya abroad', text: 'Kharcha, job aur risk, saath mein.' },
  { title: 'Paisa kahan se', text: 'Scholarship, loan, ya dono.' },
  { title: 'Agla kadam', text: 'Call ke end tak saaf next steps.' },
];

const BookButton = ({ className = '' }) => (
  <Link to={BOOK} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#D0362E] hover:bg-[#B52A23] text-white text-[14px] font-bold shadow-[3px_3px_0_#16130F] transition-colors ${className}`}>
    Free call book karo <ArrowRight size={15} />
  </Link>
);

const CareerCounsellingPage = () => {
  useEffect(() => {
    document.title = 'Free Career Counselling: Stream, Course, India or Abroad | UniCoach';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-[76px] font-['Onest',sans-serif] text-[#16130F]">
      {/* 1. Station board + departures */}
      <section className="bg-[#F2B705] px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-[1180px] mx-auto">
          <div className="inline-flex flex-col items-center px-4 py-2 bg-[#FFF6D6] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F]" style={{ borderRadius: 6 }}>
            <span className="font-['Rozha_One',serif] text-[18px] leading-none">यूनिकोच जंक्शन</span>
            <span className="mt-1 font-['Anton',sans-serif] tracking-[0.12em] text-[13px] leading-none">UNICOACH JN.</span>
          </div>
          <div className="mt-6 grid lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-12 items-end">
            <h1 className="font-urbanist font-black text-[44px] sm:text-[64px] leading-[0.95] tracking-[-0.04em]">Agla station: tumhara career.</h1>
            <div>
              <p className="text-[15px] sm:text-[16px] font-medium max-w-md">Kaunsi train pakadni hai, ye platform pe khade hokar mat socho. Ek mentor se free mein poocho, phir ticket lo.</p>
              <BookButton className="mt-4" />
            </div>
          </div>

          <div className="mt-10 bg-[#16130F] border-[3px] border-[#16130F] shadow-[6px_6px_0_#D0362E] overflow-x-auto" style={{ borderRadius: 14 }}>
            {/* a grid, not a <table>: global table styles force grey text */}
            <div role="table" aria-label="Departures" className="min-w-[560px] font-['Khand',sans-serif]">
              <div role="row" className="grid grid-cols-[1.3fr_1.3fr_0.6fr_0.9fr] text-[13px] tracking-wide text-[#B9B2A6] border-b border-white/10">
                {['Gaadi / Train', 'Kahan se / To', 'Platform', 'Status'].map((h) => <span key={h} role="columnheader" className="px-5 py-3 font-semibold">{h}</span>)}
              </div>
              {DEPARTURES.map((d) => (
                <Link key={d.train} to={d.link} role="row" className="grid grid-cols-[1.3fr_1.3fr_0.6fr_0.9fr] items-center border-b border-white/5 last:border-0 hover:bg-white/5 text-[17px]">
                  <span role="cell" className="px-5 py-3 font-bold text-[#F2B705]">{d.train}</span>
                  <span role="cell" className="px-5 py-3 font-semibold text-white">{d.to}</span>
                  <span role="cell" className="px-5 py-3 font-semibold text-white">{d.platform}</span>
                  <span role="cell" className="px-5 py-3 font-bold" style={{ color: d.tone }}>{d.status}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Ticket cards: which counselling call fits you */}
      <section className="bg-[#FFF6E5] px-4 sm:px-6 py-14">
        <div className="max-w-[1180px] mx-auto">
          <h2 className="font-urbanist font-black text-[30px] sm:text-[38px] tracking-[-0.03em]">Apna ticket chuno</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-5">
            {TICKETS.map((t) => (
              <article key={t.title} className="relative flex flex-col p-5 border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F]" style={{ background: t.bg, color: t.fg, borderRadius: 14 }}>
                <span className="absolute -top-3 right-4 w-14 h-14 grid place-items-center rotate-12 rounded-full border-[3px] border-[#16130F] bg-white text-[#16130F] font-['Anton',sans-serif] text-[14px]">FREE</span>
                <span className="font-['Rozha_One',serif] text-[15px] leading-none opacity-90">{t.hi}</span>
                <h3 className="mt-1.5 font-urbanist font-black text-[22px] tracking-tight">{t.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed flex-1 opacity-90">{t.text}</p>
                <div className="mt-5 pt-3 border-t-2 border-dashed flex items-center justify-between" style={{ borderColor: t.fg === INK ? '#16130F55' : '#FFFFFF66' }}>
                  <span className="font-['Khand',sans-serif] text-[17px] font-bold">Kiraya: ₹0</span>
                  <Link to={BOOK} className="px-3.5 py-1.5 rounded-full bg-[#16130F] text-white text-[12.5px] font-bold hover:bg-black">Ye ticket lo</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Mentor countries as postage stamps */}
      <section className="bg-[#14837E] px-4 sm:px-6 py-14">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-urbanist font-black text-[30px] sm:text-[38px] tracking-[-0.03em] text-white">Jahan hamare mentor rehte hain</h2>
            <span className="font-['Rozha_One',serif] text-[18px] text-[#F2B705]">सात समंदर पार, अपने लोग</span>
          </div>
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-[820px]">
            {STAMPS.map((s, i) => (
              <Link key={s.name} to={s.link} className="group block bg-white p-2.5 shadow-[4px_4px_0_#0B4F4C] transition-transform hover:-translate-y-1"
                style={{ transform: `rotate(${[-3, 2, -2, 3][i % 4]}deg)`, borderRadius: 4, outline: '3px dashed #FFF6E5', outlineOffset: '-7px' }}>
                <div className="aspect-[4/3] grid place-items-center" style={{ background: s.tint }}>
                  <img src={s.img} alt="" loading="lazy" className="h-[78%] w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
                </div>
                <div className="mt-2 px-1 flex items-baseline justify-between">
                  <span className="font-urbanist font-extrabold text-[14px] text-[#16130F]">{s.name}</span>
                  <span className="font-['Rozha_One',serif] text-[13px] text-[#14837E]">{s.hi}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. What one call covers */}
      <section className="bg-[#B8285B] px-4 sm:px-6 py-14">
        <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center">
          <h2 className="font-urbanist font-black text-[32px] sm:text-[42px] leading-[1.05] tracking-[-0.03em] text-white">Ek cutting chai jitni baat. Saal bhar ka plan.</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {CHAI_POINTS.map((p, i) => (
              <div key={p.title} className="bg-white p-4 border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F]" style={{ borderRadius: 12, transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
                <h3 className="font-urbanist font-black text-[16px]">{p.title}</h3>
                <p className="mt-1 text-[13.5px] text-[#5B544A] leading-snug">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Truck-art CTA */}
      <section className="bg-[#FFF6E5] px-4 sm:px-6 py-14">
        <div className="max-w-[1180px] mx-auto">
          <BookOkCta to={BOOK} />
        </div>
      </section>
    </main>
  );
};

export default CareerCounsellingPage;
