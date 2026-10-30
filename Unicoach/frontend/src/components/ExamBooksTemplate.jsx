import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, ChevronDown, ArrowRight, ExternalLink } from 'lucide-react';
import { BarCompare, Donut } from './ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from './desi/DesiKit';
import { DESI_TONES } from './desi/desiTokens';
import { BookOkCta } from './desi/BookOkCta';

const examsList = [
  { key: 'ielts', name: 'IELTS Books', path: '/resources/books/ielts-books', tag: 'Academic & GT' },
  { key: 'sat', name: 'SAT Books', path: '/resources/books/sat-books', tag: 'Digital SAT' },
  { key: 'pte', name: 'PTE Books', path: '/resources/books/pte-books', tag: 'PTE Academic' },
  { key: 'toefl', name: 'TOEFL Books', path: '/resources/books/toefl-books', tag: 'TOEFL iBT' },
  { key: 'gre', name: 'GRE Books', path: '/resources/books/gre-books', tag: 'General Test' },
  { key: 'gmat', name: 'GMAT Books', path: '/resources/books/gmat-books', tag: 'Focus Edition' }
];

// Hero colour per exam, so the six pages don't all look the same
const HERO_TONE = { ielts: 'mustard', sat: 'teal', pte: 'rani', toefl: 'mustard', gre: 'teal', gmat: 'rani' };

// Sidebar ad: the IELTS evaluator ad on the IELTS page, the counselling ad elsewhere
const SIDE_AD = {
  ielts: { src: '/images/ads/ad-ielts.jpg', to: '/ielts-evaluator', alt: 'IELTS writing likh liya? AI se band score check karo' },
  default: { src: '/images/ads/ad-counselling.jpg', to: '/book-consultation', alt: 'Confused ho? Mentor se pucho: free 1:1 counselling' },
};

const getBookCategory = (book) => (
  typeof book.category === 'string' && book.category.trim()
    ? book.category.trim()
    : 'Comprehensive'
);

const ExamBooksTemplate = ({ currentExamKey, data }) => {
  const [faqOpen, setFaqOpen] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Book prices as listed on each card ("Approx. ₹2,200"), for the price comparison bars
  const priceBars = data.booksList
    .map((b) => {
      const m = /₹\s?([\d,]+)/.exec(b.price || '');
      return m ? { label: b.name, value: Number(m[1].replace(/,/g, '')), display: b.price.replace(/^Approx\.\s*/i, '') } : null;
    })
    .filter(Boolean);
  const cheapest = priceBars.length ? priceBars.reduce((a, b) => (b.value < a.value ? b : a)).label : undefined;
  const categories = ['all', ...new Set(data.booksList.map(getBookCategory))];

  const filteredBooks = selectedCategory === 'all'
    ? data.booksList
    : data.booksList.filter(b => getBookCategory(b) === selectedCategory);

  const ad = SIDE_AD[currentExamKey] || SIDE_AD.default;
  const examName = data.examShortName || data.title;

  return (
    <main className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">

      {/* ── HERO: poster band with the page's own infographic ── */}
      <DesiHero
        tone={HERO_TONE[currentExamKey] || 'mustard'}
        sign={{ hi: 'किताब घर', en: 'KITAB GHAR' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }, { label: 'Prep Books' }, { label: examName }]}
        title={data.title}
        subtitle={data.subtitle}
        stickers={(
          <>
            <Sticker tilt={-2}><span className="w-2 h-2 rounded-full bg-[#3F9A5C]" />{data.updatedDate}</Sticker>
            <Sticker bg="#FCE38A" tilt={1.5}><BookOpen size={14} />{data.booksList.length} books reviewed</Sticker>
            <Sticker tilt={-1}><Star size={14} style={{ color: '#E89400', fill: '#FFB400' }} />Test-taker ratings</Sticker>
          </>
        )}
        aside={(
          <div className="shadow-[6px_6px_0_#16130F] rounded-[18px]">
            {data.timeSplit ? (
              <Donut
                kicker={data.timeSplit.kicker}
                title={data.timeSplit.title}
                segments={data.timeSplit.segments}
                centerValue={data.timeSplit.centerValue}
                centerLabel={data.timeSplit.centerLabel}
              />
            ) : priceBars.length >= 3 && (
              <BarCompare kicker="Approx. prices" title="What these books cost" items={priceBars} highlight={cheapest} />
            )}
          </div>
        )}
      />

      {/* ── EXAM PICKER (phones and tablets) ── */}
      <div className="lg:hidden max-w-[1240px] mx-auto px-4 -mt-6 mb-8 relative z-10">
        <InkCard className="p-3">
          <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">Aur books</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {examsList.map((exam, ei) => {
              const isCurrent = exam.key === currentExamKey;
              const tone = DESI_TONES[ei % DESI_TONES.length];
              return (
                <Link
                  key={exam.key}
                  to={exam.path}
                  style={isCurrent ? { background: tone.c, color: tone.fg } : undefined}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isCurrent ? 'border-[#16130F] shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
                >
                  <BookOpen size={13} />
                  <span>{exam.name.replace(' Books', '')}</span>
                </Link>
              );
            })}
          </div>
        </InkCard>
      </div>

      {/* ── MAIN 2-COLUMN GRID ── */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* ── DESKTOP STICKY SIDEBAR ── */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-28 space-y-5">
            <InkCard className="p-4">
              <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Aur books</p>
              <h3 className="mt-1 mb-3 font-urbanist font-black text-[17px]">Prep books by exam</h3>
              <nav className="flex flex-col gap-2">
                {examsList.map((exam, ei) => {
                  const isCurrent = exam.key === currentExamKey;
                  const tone = DESI_TONES[ei % DESI_TONES.length];
                  return (
                    <Link
                      key={exam.key}
                      to={exam.path}
                      style={isCurrent ? { background: tone.c, color: tone.fg } : undefined}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border-2 text-[14px] font-bold transition-transform ${isCurrent ? 'border-[#16130F] shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-[#16130F]" style={{ background: tone.c }} />
                        {exam.name}
                      </span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </nav>
            </InkCard>

            {/* Our ad creative: the whole card is the link */}
            <Link to={ad.to} className="block rounded-2xl overflow-hidden border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] transition-transform hover:-translate-y-0.5">
              <img src={ad.src} alt={ad.alt} width="640" height="800" loading="lazy" className="block w-full h-auto" />
            </Link>
          </aside>

          {/* ── CORE CONTENT COLUMN ── */}
          <div className="lg:col-span-3 space-y-10">

            {/* Why the right books matter */}
            <InkCard className="p-6 md:p-7 relative" shadow="#F2B705">
              <DesiHeading hi="Sahi book, aadhi taiyari">Why the right prep books matter</DesiHeading>
              <p className="mt-3 text-[#5B544A] text-[14.5px] leading-relaxed">{data.description}</p>
            </InkCard>

            {/* Recommended books with a category filter */}
            <section>
              <div className="flex flex-col gap-4 mb-6">
                <DesiHeading hi="Mentor ki pasand">Recommended books, reviewed</DesiHeading>
                {categories.length > 2 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        aria-pressed={selectedCategory === cat}
                        className={`no-shine px-3 py-1.5 rounded-lg border-2 text-xs font-bold capitalize cursor-pointer whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-[#16130F] border-[#16130F] text-white' : 'bg-white border-[#16130F] text-[#16130F] hover:bg-[#FCE38A]'}`}
                      >
                        {cat === 'all' ? 'All books' : cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBooks.map((book, idx) => {
                  const tone = DESI_TONES[idx % DESI_TONES.length];
                  const amazonSearchUrl = book.link && book.link.startsWith('http') && !book.link.includes('amazon.in/s?')
                    ? book.link
                    : `https://www.amazon.in/s?k=${encodeURIComponent(book.name)}`;

                  return (
                    <InkCard key={book.name} className="flex flex-col overflow-hidden transition-transform hover:-translate-y-1">
                      {/* coloured spine with the "best for" label and a price tag */}
                      <div className="flex items-center justify-between gap-2 px-5 py-3 border-b-[3px] border-[#16130F]" style={{ background: tone.c, color: tone.fg }}>
                        <span className="text-[12.5px] font-extrabold">{book.bestFor || 'Comprehensive prep'}</span>
                        <span className="shrink-0 px-2 py-0.5 bg-white text-[#16130F] border-2 border-[#16130F] text-[12px] font-black rotate-2" style={{ borderRadius: 6 }}>
                          {book.price}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-urbanist text-[18px] font-black leading-snug">{book.name}</h3>
                        {book.publisher && <p className="mt-0.5 text-[12.5px] text-[#8A7F70] font-semibold">By {book.publisher}</p>}
                        <div className="mt-2 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={14} strokeWidth={1.5} style={{ color: '#E89400', fill: '#FFB400' }} />
                          ))}
                          <span className="text-[12.5px] font-bold text-[#5B544A] ml-1">{book.rating || '4.8'} / 5</span>
                        </div>
                        <p className="mt-3 text-[#5B544A] text-[13.5px] leading-relaxed flex-1">{book.description}</p>
                        <div className="mt-4 pt-3 border-t-2 border-dashed border-[#16130F33]">
                          <span className="text-[10.5px] uppercase tracking-wider font-extrabold text-[#8A7F70] block">Best for</span>
                          <span className="text-[13px] font-bold">{book.sectionalStrength}</span>
                        </div>
                        <a
                          href={amazonSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-shine mt-4 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border-2 border-[#16130F] bg-[#16130F] text-white text-[13px] font-bold shadow-[3px_3px_0_#F2B705] transition-transform hover:-translate-y-0.5"
                        >
                          Check price <ExternalLink size={13} />
                        </a>
                      </div>
                    </InkCard>
                  );
                })}
              </div>
            </section>

            {/* Phones have no sidebar: the same ad sits under the books */}
            <Link to={ad.to} className="lg:hidden block max-w-[360px] mx-auto rounded-2xl overflow-hidden border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F]">
              <img src={ad.src} alt={ad.alt} width="640" height="800" loading="lazy" className="block w-full h-auto" />
            </Link>

            {/* Price comparison of the books above (approximate prices from each card) */}
            {data.timeSplit && priceBars.length >= 3 && (
              <div className="shadow-[6px_6px_0_#16130F] rounded-[18px]">
                <BarCompare kicker="Approx. prices" title="What these books cost" items={priceBars} highlight={cheapest} />
              </div>
            )}

            {/* Preparation strategy: teal poster band */}
            <section className="bg-[#14837E] border-[3px] border-[#16130F] p-6 md:p-8 shadow-[6px_6px_0_#16130F]" style={{ borderRadius: 18 }}>
              <DesiHeading hi="Taiyari ka tareeka" light>Mentor-approved prep plan</DesiHeading>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.prepTips.map((tip, idx) => (
                  <div key={tip} className="flex gap-3 bg-white p-4 border-[3px] border-[#16130F] shadow-[4px_4px_0_#0B4F4C]"
                    style={{ borderRadius: 12, transform: `rotate(${idx % 2 ? 0.6 : -0.6}deg)` }}>
                    <span className="w-8 h-8 rounded-full border-2 border-[#16130F] font-urbanist font-black text-[14px] grid place-items-center shrink-0"
                      style={{ background: DESI_TONES[idx % DESI_TONES.length].c, color: DESI_TONES[idx % DESI_TONES.length].fg }}>
                      {idx + 1}
                    </span>
                    <p className="text-[#3D362E] text-[13.5px] leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQs */}
            <section>
              <DesiHeading hi="Sabke sawaal">Frequently asked questions</DesiHeading>
              <div className="mt-5 space-y-3">
                {data.faqs.map((faq, idx) => {
                  const isOpen = !!faqOpen[idx];
                  return (
                    <div key={faq.q} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: isOpen ? '4px 4px 0 #D0362E' : '4px 4px 0 #16130F' }}>
                      <button
                        onClick={() => toggleFaq(idx)}
                        aria-expanded={isOpen}
                        className="no-shine w-full flex items-center justify-between gap-3 p-4 text-left font-bold text-[14.5px] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span className={`w-7 h-7 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#F2B705]' : 'bg-white'}`}>
                          <ChevronDown size={15} />
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-3 text-[#5B544A] text-[14px] border-t-2 border-dashed border-[#16130F33] leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Closing CTA */}
            <BookOkCta
              hi="Book ke saath mentor bhi"
              title="Book OK Please."
              text={`Kaunsi ${examName} book pehle? Free 1:1 call mein mentor se poocho.`}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ExamBooksTemplate;
