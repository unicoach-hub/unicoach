import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Award,
  Star,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Check,
  Target,
  ShieldCheck,
  Zap,
  TrendingUp,
  Bookmark
} from 'lucide-react';

const examsList = [
  { key: 'ielts', name: 'IELTS Books', path: '/resources/books/ielts-books', tag: 'Academic & GT' },
  { key: 'sat', name: 'SAT Books', path: '/resources/books/sat-books', tag: 'Digital SAT' },
  { key: 'pte', name: 'PTE Books', path: '/resources/books/pte-books', tag: 'PTE Academic' },
  { key: 'toefl', name: 'TOEFL Books', path: '/resources/books/toefl-books', tag: 'TOEFL iBT' },
  { key: 'gre', name: 'GRE Books', path: '/resources/books/gre-books', tag: 'General Test' },
  { key: 'gmat', name: 'GMAT Books', path: '/resources/books/gmat-books', tag: 'Focus Edition' }
];

const ExamBooksTemplate = ({ currentExamKey, data }) => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Derive unique categories from books
  const categories = ['all', ...new Set(data.booksList.map(b => b.category || 'Comprehensive'))];

  const filteredBooks = selectedCategory === 'all'
    ? data.booksList
    : data.booksList.filter(b => (b.category || 'Comprehensive') === selectedCategory);

  return (
    <main className="min-h-screen bg-slate-50/60 pt-20 md:pt-24 pb-16">
      
      {/* ── BREADCRUMBS & TOP NAV ── */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-500">Resources</span>
          <span>/</span>
          <span className="text-slate-500">Prep Books</span>
          <span>/</span>
          <span className="text-indigo-600 font-bold">{data.examShortName || data.title}</span>
        </nav>
      </div>

      {/* ── HERO BANNER (UniCoach Brand Blue #111111) ── */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 mt-3 mb-8">
        <div className="bg-gradient-to-r from-[#111111] via-[#10319E] to-[#111111] text-white rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-xl shadow-[#111111]/25 border border-[#1B3FA8]/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full text-orange-200 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Sparkles size={13} className="text-orange-300" />
              <span>Mentor-Curated Study Guides (2025–2026)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight leading-tight text-white mb-3 drop-shadow-sm">
              {data.title}
            </h1>

            <p className="text-blue-100/90 text-sm md:text-base leading-relaxed mb-6 font-normal">
              {data.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">{data.updatedDate}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
                <ShieldCheck size={15} className="text-orange-300" />
                <span className="font-semibold text-white">{data.booksList.length} Books Reviewed</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
                <Star size={14} className="text-amber-300 fill-amber-300" />
                <span className="font-semibold text-white">Verified Test-Taker Ratings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE / TABLET EXAM SELECTOR BAR ── */}
      <div className="lg:hidden max-w-[1240px] mx-auto px-4 mb-6">
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Choose Exam Books
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {examsList.map((exam) => {
              const isCurrent = exam.key === currentExamKey;
              return (
                <Link
                  key={exam.key}
                  to={exam.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen size={13} className={isCurrent ? 'text-white' : 'text-slate-400'} />
                  <span>{exam.name.replace(' Books', '')}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN GRID ── */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* ── DESKTOP STICKY SIDEBAR ── */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-28 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Bookmark size={16} className="text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Prep Exam Books
                </h3>
              </div>
              <nav className="flex flex-col gap-1.5">
                {examsList.map((exam) => {
                  const isCurrent = exam.key === currentExamKey;
                  return (
                    <Link
                      key={exam.key}
                      to={exam.path}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-extrabold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen size={15} className={isCurrent ? 'text-white' : 'text-slate-400'} />
                        <span>{exam.name}</span>
                      </div>
                      <ArrowRight size={13} className={isCurrent ? 'text-white' : 'text-slate-300'} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Free Practice Test CTA Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100 text-slate-800">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md shadow-indigo-600/20">
                <Zap size={18} />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 mb-1">Need Free Evaluation?</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3 font-medium">
                Book a 1-on-1 diagnostic evaluation with our certified master mentor.
              </p>
              <button
                onClick={() => navigate('/book-consultation')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow transition-all cursor-pointer"
              >
                Book Free Counselling
              </button>
            </div>
          </aside>

          {/* ── CORE CONTENT COLUMN ── */}
          <div className="lg:col-span-3 space-y-8">

            {/* Summary Overview Card */}
            <div className="bg-white rounded-2xl p-6 md:p-7 border border-slate-200 shadow-sm">
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <Target size={18} className="text-indigo-600" />
                Why Choosing the Right Prep Books Matters in 2026
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                {data.description}
              </p>
            </div>

            {/* Recommended Books Section with Category Filter */}
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-indigo-600" size={20} />
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    Recommended Books & Detailed Reviews
                  </h2>
                </div>
                
                {/* Category Pills */}
                {categories.length > 2 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                          selectedCategory === cat
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'all' ? 'All Books' : cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Book Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredBooks.map((book, idx) => {
                  const amazonSearchUrl = book.link && book.link.startsWith('http') && !book.link.includes('amazon.in/s?')
                    ? book.link
                    : `https://www.amazon.in/s?k=${encodeURIComponent(book.name)}`;

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header Badge Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {book.bestFor || 'Comprehensive Prep'}
                          </span>
                          <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                            {book.price}
                          </span>
                        </div>

                        {/* Title & Author/Publisher */}
                        <h3 className="text-base md:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1">
                          {book.name}
                        </h3>
                        {book.publisher && (
                          <div className="text-xs text-slate-400 font-semibold mb-2">
                            By {book.publisher}
                          </div>
                        )}

                        {/* Rating & Review */}
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={13} className="text-amber-400 fill-amber-400" />
                          ))}
                          <span className="text-xs font-bold text-slate-600 ml-1">
                            {book.rating || '4.8'} / 5.0
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 font-medium">
                          {book.description}
                        </p>
                      </div>

                      {/* Footer: Strength & Buy Button */}
                      <div className="pt-3 border-t border-slate-100 mt-2">
                        <div className="mb-3">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">
                            Target Band / Key Strength
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {book.sectionalStrength}
                          </span>
                        </div>

                        <a
                          href={amazonSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-indigo-600 shadow-sm transition-all"
                        >
                          <span>Check Price</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Preparation Tips Section */}
            <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-indigo-600" size={22} />
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Mentor-Approved Preparation Strategy
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {data.prepTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3 bg-slate-50 border border-slate-200/70 p-4 rounded-xl">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQs Section */}
            <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {data.faqs.map((faq, idx) => {
                  const isOpen = !!faqOpen[idx];
                  return (
                    <div key={idx} className="border border-slate-200/80 rounded-xl overflow-hidden transition-all">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 hover:text-indigo-600 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                            isOpen ? 'rotate-180 text-indigo-600' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-slate-600 text-xs sm:text-sm border-t border-slate-100 leading-relaxed font-medium">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CTA Banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-indigo-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles size={12} className="text-indigo-400" />
                  <span>Free Mentorship</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white mb-2">
                  Accelerate Your Preparation with UniCoach
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                  Attend free live classes, access full-length mock tests, and get real-time band evaluation from certified global trainers.
                </p>
                <div className="flex flex-wrap gap-4 mt-4 text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-400" />
                    <span>125,000+ Enrolled Students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span>2,411 5-Star Reviews</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/book-consultation')}
                className="w-full md:w-auto px-6 py-3.5 rounded-full text-white font-bold text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 transition-all flex-shrink-0 cursor-pointer text-center"
              >
                Book Free Counselling
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default ExamBooksTemplate;
