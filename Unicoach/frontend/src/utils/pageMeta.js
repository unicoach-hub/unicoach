// Page titles and descriptions for routes that used to share one generic title (every exam
// sub-page, the Ireland section, policies, tools). Unique titles tell Google which page answers
// which search. ScrollToTop applies these, and the build prerenders them into the static HTML.

const EXAMS = {
  ielts: 'IELTS',
  pte: 'PTE Academic',
  gre: 'GRE',
  gmat: 'GMAT Focus Edition',
  toefl: 'TOEFL iBT',
  sat: 'SAT',
  duolingo: 'Duolingo English Test',
};

const EXAM_PAGES = {
  overview: (n) => [`${n} Exam Overview: Pattern, Scoring & Validity | UniCoach`, `What the ${n} is, who accepts it, test pattern, scoring, score validity and how Indian students should plan for it.`],
  syllabus: (n) => [`${n} Syllabus & Exam Pattern 2026 | UniCoach`, `Complete ${n} syllabus and exam pattern: sections, question types, timing and marking, explained for Indian students.`],
  dates: (n) => [`${n} Exam Dates 2026 in India | UniCoach`, `Upcoming ${n} test dates in India, how far ahead to book, and how to match your test date to university deadlines.`],
  fees: (n) => [`${n} Fee in India 2026: Test, Reschedule & Score Fees | UniCoach`, `Current ${n} fee in India, plus rescheduling, cancellation and additional score report charges.`],
  registration: (n) => [`${n} Registration 2026: How to Book Your Test in India | UniCoach`, `Step-by-step ${n} registration for Indian students: account setup, documents, payment and booking your slot.`],
  results: (n) => [`${n} Results: How to Check and Send Your Scores | UniCoach`, `When ${n} results come out, how to check your scores, and how to send them to universities.`],
  preparation: (n) => [`${n} Preparation: Study Plan & Tips for Indian Students | UniCoach`, `How to prepare for the ${n}: study plan, section-wise tips, resources and mistakes to avoid.`],
  'practice-test': (n) => [`${n} Practice Test & Sample Questions | UniCoach`, `Practise for the ${n} with sample questions and mock tests, and learn how to review your answers.`],
  'slot-booking': (n) => [`${n} Slot Booking in India: Dates & Availability | UniCoach`, `How to find and book a ${n} slot in India, when slots fill up, and how to reschedule.`],
  centres: (n) => [`${n} Test Centres in India | UniCoach`, `${n} test centres across Indian cities and how to choose and book the right centre.`],
  'score-scale': (n) => [`${n} Score Scale & Score Chart Explained | UniCoach`, `How the ${n} score scale works, what each score band means, and what scores top universities expect.`],
  'sample-papers': (n) => [`${n} Sample Papers & Practice Questions | UniCoach`, `${n} sample papers and practice questions with tips on how to use them in your preparation.`],
  'sample-questions': (n) => [`${n} Sample Questions with Answers | UniCoach`, `Sample ${n} questions for every section with answers and tips for each question type.`],
};

const COUNTRY_NAMES = { australia: 'Australia', canada: 'Canada', uk: 'the UK', ireland: 'Ireland', germany: 'Germany' };

const STATIC = {
  '/': ['UniCoach | Study Abroad Counselling & 1:1 Mentorship for Indian Students', 'Study abroad counselling, university shortlisting, scholarships, education loans and visa help, plus 1:1 sessions with verified seniors studying abroad.'],
  '/unicoach': ['UniCoach Mentors | Book 1:1 Sessions with Seniors Studying Abroad', 'Book 1:1 video calls, SOP reviews and visa guidance with verified seniors and alumni studying at universities abroad.'],
  '/unicoach/mentors': ['Browse Study Abroad Mentors | Verified Seniors & Alumni | UniCoach', 'Find a mentor by country, university or course and book a 1:1 session with a verified senior studying abroad.'],
  '/team': ['Our Team | UniCoach Study Abroad Experts', 'Meet the UniCoach team of study abroad counsellors and mentors helping Indian students get into universities abroad.'],
  '/scholarship-calculator': ['Scholarship Calculator for Study Abroad | UniCoach', 'Estimate the scholarships you could qualify for abroad based on your academics, test scores and target country.'],
  '/eligibility-calculator': ['Study Abroad Eligibility Calculator | Check Your Chances | UniCoach', 'Check your eligibility for universities abroad using your marks, test scores and target course.'],
  '/resources/calculators/admission-eligibility': ['University Admission Eligibility Calculator | UniCoach', 'See which universities abroad match your academic profile, English test score and budget.'],
  '/search-programs': ['Course Finder: Search Study Abroad Programs | UniCoach', 'Find and shortlist courses at universities abroad by subject, country, fees and intake. Free, no login needed to search.'],
  '/blogs/rhodes-scholarship': ['Rhodes Scholarship for Indian Students: Eligibility & Process | UniCoach', 'How Indian students can apply for the Rhodes Scholarship to Oxford: eligibility, selection process and tips.'],
  '/privacy-policy': ['Privacy Policy | UniCoach', 'How UniCoach collects, uses and protects your personal information.'],
  '/terms': ['Terms of Service | UniCoach', 'Terms that apply when you use UniCoach services, tools and mentorship sessions.'],
  '/refund-policy': ['Refund Policy | UniCoach', 'When and how UniCoach refunds payments for services and sessions.'],
  '/cancellation-policy': ['Cancellation Policy | UniCoach', 'How to cancel or reschedule a UniCoach session or service, and what charges apply.'],
  // Resources
  '/resources/sop/sop-masters': ['SOP for Masters: Format, Structure & Samples | UniCoach', 'How to write a Statement of Purpose for a master\'s abroad, with format, structure and sample paragraphs.'],
  '/resources/sop/sop-mba': ['SOP for MBA: Format & Sample for Business Schools | UniCoach', 'Write an MBA Statement of Purpose that business schools want to read, with format and sample content.'],
  '/resources/sop/sop-phd': ['SOP for PhD: Research Statement Format & Samples | UniCoach', 'How to write a PhD Statement of Purpose or research statement, with structure and examples.'],
  '/resources/lor/lor-masters': ['LOR for Masters: Format & Samples | UniCoach', 'Letter of Recommendation format for a master\'s abroad, with sample academic and professional LORs.'],
  '/resources/lor/lor-phd': ['LOR for PhD: Format & Samples from Professors | UniCoach', 'How a strong PhD Letter of Recommendation is written, with structure and samples.'],
  // Germany and New Zealand intake pages
  '/study-abroad/germany/summer-intake': ['Summer Intake in Germany: Deadlines, Courses & Universities | UniCoach', 'Summer semester intake in Germany for Indian students: application deadlines, courses on offer and universities.'],
  '/study-abroad/germany/winter-intake': ['Winter Intake in Germany: Deadlines, Courses & Universities | UniCoach', 'Winter semester intake in Germany for Indian students: application deadlines, courses on offer and universities.'],
  '/study-abroad/new-zealand/july-intake': ['July Intake in New Zealand: Deadlines & Universities | UniCoach', 'July intake in New Zealand for Indian students: deadlines, universities and courses open for July.'],
  '/study-abroad/new-zealand/universities/best': ['Best Universities in New Zealand for Indian Students | UniCoach', 'The best universities in New Zealand for Indian students by course, ranking, fees and job outcomes.'],
  // Ireland section
  '/study-abroad/ireland': ['Study in Ireland for Indian Students | Universities, Cost & Stamp 1G | UniCoach', 'Study in Ireland: top universities, tuition fees, cost of living, student visa and the 24-month Stamp 1G post-study work route.'],
  '/study-abroad/ireland/cities/dublin': ['Study in Dublin: Universities, Cost of Living & Jobs | UniCoach', 'Universities in Dublin, student cost of living, accommodation and job opportunities for international students.'],
  '/study-abroad/ireland/courses/data-science': ['MSc Data Science in Ireland: Universities & Fees | UniCoach', 'Masters in Data Science in Ireland: top universities, fees, entry requirements and career prospects.'],
  '/study-abroad/ireland/courses/masters': ['Masters in Ireland for Indian Students: Courses & Fees | UniCoach', 'One-year masters in Ireland: popular courses, fees, entry requirements and post-study work.'],
  '/study-abroad/ireland/courses/phd': ['PhD in Ireland: Funding, Universities & Process | UniCoach', 'How to do a PhD in Ireland: funded positions, universities, application process and stipends.'],
  '/study-abroad/ireland/universities/dcu': ['Dublin City University (DCU): Courses, Fees & Admissions | UniCoach', 'Dublin City University for Indian students: popular courses, tuition fees, entry requirements and rankings.'],
  '/study-abroad/ireland/universities/it-carlow': ['IT Carlow (SETU Carlow): Courses, Fees & Admissions | UniCoach', 'IT Carlow, now part of South East Technological University: courses, fees and admissions for Indian students.'],
  '/study-abroad/ireland/universities/limerick': ['University of Limerick: Courses, Fees & Admissions | UniCoach', 'University of Limerick for Indian students: courses, tuition fees, entry requirements and campus life.'],
  '/study-abroad/ireland/universities/trinity': ['Trinity College Dublin: Admissions, Fees & Courses | UniCoach', 'Trinity College Dublin for Indian students: admissions, tuition fees, popular courses and rankings.'],
  '/study-abroad/ireland/universities/ucd': ['University College Dublin (UCD): Admissions, Fees & Courses | UniCoach', 'University College Dublin for Indian students: admissions, tuition fees, popular courses and rankings.'],
};

export function getPageMeta(path) {
  if (STATIC[path]) {
    const [title, description] = STATIC[path];
    return { title, description };
  }

  const books = path.match(/^\/resources\/books\/([a-z]+)-books$/);
  if (books && EXAMS[books[1]]) {
    const n = EXAMS[books[1]];
    return { title: `Best ${n} Books for Preparation 2026 | UniCoach`, description: `The best ${n} preparation books and materials recommended for Indian students, with what each one is good for.` };
  }

  const exam = path.match(/^\/exams\/([a-z]+)\/([a-z-]+)$/);
  if (exam && EXAMS[exam[1]]) {
    const [, slug, page] = exam;
    if (slug === 'duolingo' && COUNTRY_NAMES[page]) {
      const c = COUNTRY_NAMES[page];
      return {
        title: `Is Duolingo Accepted in ${c}? Universities, Scores & Visa Rules | UniCoach`,
        description: `Universities in ${c} that accept the Duolingo English Test, minimum scores by course, and whether DET works for the student visa.`,
      };
    }
    if (EXAM_PAGES[page]) {
      const [title, description] = EXAM_PAGES[page](EXAMS[slug]);
      return { title, description };
    }
  }
  return null;
}
