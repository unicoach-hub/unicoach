import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from '../config';

// Account / transactional pages that should never show up in Google
const NOINDEX_PREFIXES = ['/dashboard', '/login', '/signin', '/register', '/signup', '/reset-password', '/unicoach/dashboard', '/priority-dm'];

const upsertHeadTag = (selector, create) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Disable browser automatic scroll restoration on navigation
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // 1. Scroll to top of the page immediately when route changes
    const resetScroll = () => {
      if (typeof window !== 'undefined') {
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true });
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    resetScroll();
    const rafId = requestAnimationFrame(resetScroll);
    const timerId = setTimeout(resetScroll, 20);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [pathname, search]);

  useEffect(() => {
    // 2. Dynamic SEO On-Page Optimization (Title and Meta Description)
    let title = 'UniCoach | Premium Study Abroad Counselling & Test Prep';
    let description = 'Empowering students globally to identify and navigate world-class education options. Get premium study abroad counselling, visa services, and test preparation.';

    const path = pathname.toLowerCase().replace(/\/$/, ''); // strip trailing slash

    if (path === '' || path === '/') {
      title = 'UniCoach | Premium Study Abroad Counselling & Test Prep';
      description = 'Empowering students globally to identify and navigate world-class education options. Get premium study abroad counselling, visa services, and test preparation.';
    } else if (path.startsWith('/study-abroad/usa')) {
      title = 'Study in USA | Top Universities, Cost & Visa Guide | UniCoach';
      description = 'Planning to study in USA? Find best universities, admission processes, tuition fees, cost of living, scholarships, and student visa guides.';
      if (path.includes('/courses/masters')) {
        title = 'Masters in USA | MS Admissions, Fees & Requirements | UniCoach';
        description = 'Explore top universities for MS / Masters in USA, application deadlines, GRE scores, tuition fee ranges, and post-study work options.';
      } else if (path.includes('/courses/computer-science')) {
        title = 'MS in Computer Science in USA | Top Universities & Fees | UniCoach';
        description = 'Get complete details on Masters in CS in USA: top universities, tuition fees, eligibility criteria, and job prospects.';
      } else if (path.includes('/courses/data-science')) {
        title = 'MS in Data Science in USA | Top Universities & Jobs | UniCoach';
        description = 'Guide to studying Masters in Data Science in USA: top schools, eligibility, average salary, and curriculum.';
      } else if (path.includes('/universities/harvard')) {
        title = 'Harvard University Admissions | Rankings, Fees & Courses | UniCoach';
        description = 'Check Harvard University admissions guide: entry requirements, tuition fees, popular courses, and scholarship opportunities.';
      } else if (path.includes('/universities/stanford')) {
        title = 'Stanford University Admissions | Fees, Courses & Rankings | UniCoach';
        description = 'Get Stanford University entry requirements, academic programs, tuition fees, and campus information.';
      } else if (path.includes('/universities/columbia')) {
        title = 'Columbia University Admissions | Fees & Requirements | UniCoach';
        description = 'Complete details on Columbia University: rankings, course fee structures, admissions deadlines, and campus life.';
      } else if (path.includes('/universities/northeastern')) {
        title = 'Northeastern University Admissions | Fees & Courses | UniCoach';
        description = 'Explore Northeastern University: co-op programs, MS courses, tuition fees, and admission criteria.';
      } else if (path.includes('/universities/yale')) {
        title = 'Yale University Admissions | Course Fees & Rankings | UniCoach';
        description = 'Guide to Yale University admissions: entry requirements, fees, rankings, and undergraduate/postgraduate programs.';
      } else if (path.includes('/chicago')) {
        title = 'Universities in Chicago | Study in Chicago USA | UniCoach';
        description = 'Find top universities and colleges in Chicago, living costs, student life, and career opportunities.';
      } else if (path.includes('/boston')) {
        title = 'Universities in Boston | Higher Education Guide | UniCoach';
        description = 'Explore universities in Boston (Harvard, MIT, Northeastern, BU), student living costs, and visa tips.';
      } else if (path.includes('/philadelphia')) {
        title = 'Universities in Philadelphia | Top Colleges & Costs | UniCoach';
        description = 'Guide to studying in Philadelphia: top schools, living costs, and student culture.';
      } else if (path.includes('/los-angeles')) {
        title = 'Universities in Los Angeles | Study in LA California | UniCoach';
        description = 'Check top universities in Los Angeles, average tuition fees, cost of living, and employment prospects.';
      } else if (path.includes('/atlanta')) {
        title = 'Universities in Atlanta | Top Colleges & Student Life | UniCoach';
        description = 'Explore Atlanta higher education options: top universities, cost of living, and post-study opportunities.';
      }
    } else if (path.startsWith('/study-abroad/uk')) {
      title = 'Study in UK | Universities, Intakes & Student Visa | UniCoach';
      description = 'Explore top UK universities, masters courses, intakes (January/September), cost of living, scholarships, and post-study work visa rules.';
      if (path.includes('/courses/masters')) {
        title = 'Masters in UK | MSc Course Fees & Requirements | UniCoach';
        description = 'Learn about studying Masters (MSc/MA) in the UK: top universities, tuition fees, eligibility, and job scope.';
      } else if (path.includes('/courses/computer-science')) {
        title = 'MS in Computer Science in UK | Top Schools & Fees | UniCoach';
        description = 'Complete details on Masters in Computer Science in the UK: rankings, costs, and eligibility criteria.';
      } else if (path.includes('/courses/physiotherapy')) {
        title = 'Masters in Physiotherapy in UK | Top Courses & Fees | UniCoach';
        description = 'Study MSc Physiotherapy in the UK: list of top universities, tuition fees, and HCPC registration requirements.';
      } else if (path.includes('/universities/oxford')) {
        title = 'University of Oxford Admissions | Rankings, Fees & Courses | UniCoach';
        description = 'Get Oxford University admissions guide, entry requirements, tuition fees, popular courses, and scholarship details.';
      } else if (path.includes('/universities/cambridge')) {
        title = 'University of Cambridge Admissions | Fees & Requirements | UniCoach';
        description = 'Complete details on University of Cambridge: entry requirements, fees, rankings, and postgraduate programs.';
      } else if (path.includes('/universities/coventry')) {
        title = 'Coventry University Admissions | Courses & Fees | UniCoach';
        description = 'Explore Coventry University: popular undergraduate/postgraduate courses, tuition fees, and admission criteria.';
      } else if (path.includes('/universities/leeds-university')) {
        title = 'University of Leeds Admissions | Rankings, Fees & Courses | UniCoach';
        description = 'Admissions guide to University of Leeds: course fee structures, entry requirements, and scholarships.';
      } else if (path.includes('/universities/east-london')) {
        title = 'University of East London (UEL) Admissions & Fees | UniCoach';
        description = 'Explore UEL: study programs, entry requirements, tuition fees, and location advantages.';
      } else if (path.includes('/london')) {
        title = 'Universities in London | Study in London UK | UniCoach';
        description = 'Find top universities in London, student living costs, accommodation tips, and post-study career scope.';
      } else if (path.includes('/glasgow')) {
        title = 'Universities in Glasgow | Study in Scotland UK | UniCoach';
        description = 'Explore Glasgow higher education options: top universities, living costs, and student culture.';
      } else if (path.includes('/leeds')) {
        title = 'Universities in Leeds | Top Colleges & Costs | UniCoach';
        description = 'Check top colleges and universities in Leeds, living expenses, and student accommodation options.';
      } else if (path.includes('/birmingham')) {
        title = 'Universities in Birmingham | Higher Education Guide | UniCoach';
        description = 'Guide to studying in Birmingham: top schools, cost of living, and employment prospects.';
      } else if (path.includes('/edinburgh')) {
        title = 'Universities in Edinburgh | Study in Scotland | UniCoach';
        description = 'Find top universities and colleges in Edinburgh, living costs, student life, and career opportunities.';
      }
    } else if (path.startsWith('/study-abroad/canada')) {
      title = 'Study in Canada | Top Colleges, Fees & PGWP Guide | UniCoach';
      description = 'Guide to study in Canada: top universities/colleges, tuition fees, SDS visa requirements, cost of living, and Post-Graduation Work Permit (PGWP).';
      if (path.includes('/courses/masters')) {
        title = 'Masters in Canada | MS Course Fees & Eligibility | UniCoach';
        description = 'Learn about studying Masters (MS) in Canada: top universities, tuition fees, eligibility, and PGWP prospects.';
      } else if (path.includes('/courses/phd')) {
        title = 'PhD in Canada | Fully Funded Doctoral Programs | UniCoach';
        description = 'Explore PhD programs in Canada: admissions process, scholarships, stipends, and research opportunities.';
      } else if (path.includes('/courses/computer-science')) {
        title = 'MS in Computer Science in Canada | Top Schools & Fees | UniCoach';
        description = 'Complete details on Masters in Computer Science in Canada: rankings, costs, and eligibility.';
      } else if (path.includes('/universities/conestoga')) {
        title = 'Conestoga College Admissions | Courses, Fees & Visas | UniCoach';
        description = 'Get Conestoga College admissions guide: course options, tuition fees, campus locations, and PGWP rules.';
      } else if (path.includes('/universities/toronto-university')) {
        title = 'University of Toronto Admissions | Rankings, Fees & Courses | UniCoach';
        description = 'Check University of Toronto admissions guide: entry requirements, fees, rankings, and postgraduate programs.';
      } else if (path.includes('/universities/lambton')) {
        title = 'Lambton College Admissions | Courses & Tuition Fees | UniCoach';
        description = 'Explore Lambton College: study programs, entry requirements, tuition fees, and PGWP eligibility.';
      } else if (path.includes('/universities/humber')) {
        title = 'Humber College Admissions | Course Fees & Requirements | UniCoach';
        description = 'Admissions guide to Humber College: popular diploma and degree courses, fees, and requirements.';
      } else if (path.includes('/universities/centennial')) {
        title = 'Centennial College Admissions | Courses, Fees & PGWP | UniCoach';
        description = 'Explore Centennial College: study programs, entry requirements, tuition fees, and campus locations.';
      } else if (path.includes('/halifax')) {
        title = 'Universities in Halifax | Study in Nova Scotia Canada | UniCoach';
        description = 'Find top universities and colleges in Halifax, living costs, student life, and career opportunities.';
      } else if (path.includes('/montreal')) {
        title = 'Universities in Montreal | Study in Quebec Canada | UniCoach';
        description = 'Explore Montreal higher education options: top universities, living costs, and student culture.';
      } else if (path.includes('/toronto')) {
        title = 'Universities in Toronto | Study in Ontario Canada | UniCoach';
        description = 'Check top universities in Toronto, average tuition fees, cost of living, and employment prospects.';
      } else if (path.includes('/edmonton')) {
        title = 'Universities in Edmonton | Study in Alberta Canada | UniCoach';
        description = 'Guide to studying in Edmonton: top schools, living costs, and student culture.';
      } else if (path.includes('/london-canada')) {
        title = 'Universities in London, Ontario | Higher Education Guide | UniCoach';
        description = 'Explore universities in London, Canada (Western University, Fanshawe), student living costs, and visa tips.';
      }
    } else if (path.startsWith('/study-abroad/germany')) {
      title = 'Study in Germany | Free Tuition Public Universities | UniCoach';
      description = 'Study in Germany with €0 tuition fees. Find public universities, APS certificate guide, block account costs, and 18-month job seeker visa.';
      if (path.includes('/intakes') || path.includes('/summer-intake') || path.includes('/winter-intake')) {
        title = 'Germany University Intakes | Summer & Winter Timelines | UniCoach';
        description = 'Complete timeline for Summer and Winter intakes in Germany: deadlines, admission cycles, and checklist.';
      } else if (path.includes('/visa')) {
        title = 'Germany Student Visa Guide | APS & Blocked Account | UniCoach';
        description = 'Step-by-step guide to Germany study visa: APS requirements, blocked account setup, health insurance, and embassy checklist.';
      } else if (path.includes('/why-study')) {
        title = 'Why Study in Germany? | Top Benefits & Career Scope | UniCoach';
        description = 'Discover the benefits of studying in Germany: world-class education, low costs, post-study work visa, and economic stability.';
      } else if (path.includes('/universities/best')) {
        title = 'Best Universities in Germany | Top Rankings & Courses | UniCoach';
        description = 'Find the top ranked universities in Germany, tuition fee structures, and popular courses.';
      } else if (path.includes('/universities/top-masters')) {
        title = 'Top Universities in Germany for Masters | MS Guides | UniCoach';
        description = 'Complete details on Masters in Germany: top public and private universities, tuition fees, and eligibility.';
      } else if (path.includes('/universities/affordable')) {
        title = 'Affordable Universities in Germany | Low Tuition Fees | UniCoach';
        description = 'List of low tuition fee and affordable universities in Germany for international students.';
      } else if (path.includes('/universities/public')) {
        title = 'Public Universities in Germany | List & Fee Details | UniCoach';
        description = 'Check public universities in Germany offering zero tuition fee courses for global students.';
      } else if (path.includes('/universities/engineering')) {
        title = 'Top Universities in Germany for Engineering | TU9 List | UniCoach';
        description = 'Study engineering in Germany: top TU9 universities, admission criteria, and job prospects.';
      } else if (path.includes('/courses/masters')) {
        title = 'Masters (MS) in Germany | Course Fees & Requirements | UniCoach';
        description = 'Learn about studying Masters (MS) in Germany: top public universities, courses, and eligibility.';
      } else if (path.includes('/courses/mba')) {
        title = 'MBA in Germany | Top Business Schools, Costs & GMAT | UniCoach';
        description = 'Complete guide to studying MBA in Germany: top business schools, GMAT/GRE scores, tuition fees, and career scope.';
      } else if (path.includes('/courses/bachelors')) {
        title = 'Bachelors in Germany | Programs, Fees & Pathways | UniCoach';
        description = 'Check undergraduate bachelor programs in Germany: requirements, public university options, and pathway programs.';
      } else if (path.includes('/courses/best-courses')) {
        title = 'Best Courses to Study in Germany | High Salary Fields | UniCoach';
        description = 'Find the best and most high-paying fields to study in Germany for international students.';
      } else if (path.includes('/courses/phd')) {
        title = 'PhD in Germany | Fully Funded Doctoral Positions | UniCoach';
        description = 'Guide to doctoral studies in Germany: fully funded PhD roles, research pathways, and requirements.';
      }
    } else if (path.startsWith('/study-abroad/france')) {
      title = 'Study in France | Top Business Schools & Universities | UniCoach';
      description = 'Learn about studying in France: top universities, affordable public institutions, intakes, MIM/MBA/MBBS courses, and visa guidance.';
      if (path.includes('/intakes')) {
        title = 'France Intakes | September & February Timelines | UniCoach';
        description = 'Admissions timelines and deadlines for France: September and February intakes.';
      } else if (path.includes('/visa')) {
        title = 'France Student Visa | VLS-TS Requirements & Process | UniCoach';
        description = 'Step-by-step guide to France student visa: VLS-TS registration, Campus France process, and financial requirements.';
      } else if (path.includes('/why-study')) {
        title = 'Why Study in France? | Global Benefits & Post-Study Work | UniCoach';
        description = 'Key reasons to study in France: top universities, high-quality life, internship opportunities, and post-study work visa.';
      } else if (path.includes('/universities/top')) {
        title = 'Top Universities in France | QS Rankings & Fees | UniCoach';
        description = 'Find top universities and business schools in France, fees, rankings, and programs.';
      } else if (path.includes('/universities/affordable')) {
        title = 'Affordable Universities in France | Low Tuition Fees | UniCoach';
        description = 'List of low tuition fee and affordable universities in France for global students.';
      } else if (path.includes('/universities/public')) {
        title = 'Public Universities in France | Course Fees & List | UniCoach';
        description = 'Check public universities in France offering affordable education for international students.';
      } else if (path.includes('/courses/masters')) {
        title = 'Masters in France | MSc Course Fees & Eligibility | UniCoach';
        description = 'Learn about studying Masters in France: top universities, fees, eligibility, and post-study options.';
      } else if (path.includes('/courses/mba')) {
        title = 'MBA in France | Top Business Schools & Fees | UniCoach';
        description = 'Check top business schools in France (INSEAD, HEC) for MBA courses, fees, and requirements.';
      } else if (path.includes('/courses/mbbs')) {
        title = 'MBBS in France | Tuition Fees & Admissions Guide | UniCoach';
        description = 'Study medical degrees in France: top universities, tuition fees, and admission criteria.';
      } else if (path.includes('/courses/mim')) {
        title = 'Masters in Management (MIM) in France | Top Schools | UniCoach';
        description = 'Complete details on MIM in France: top schools, tuition fees, eligibility, and career options.';
      } else if (path.includes('/courses/ma')) {
        title = 'MA in France | Popular Postgraduate Arts Courses | UniCoach';
        description = 'Explore Master of Arts (MA) courses in France: entry requirements, fees, and top universities.';
      }
    } else if (path.startsWith('/study-abroad/new-zealand')) {
      title = 'Study in New Zealand | Universities, Intakes & Visa | UniCoach';
      description = 'Discover study options in New Zealand. Check out top universities, July/February intakes, student visa requirements, and work rights.';
      if (path.includes('/intakes') || path.includes('/july-intake')) {
        title = 'New Zealand Intakes | July & February Cycles | UniCoach';
        description = 'Timelines, deadlines, and requirements for New Zealand university intakes (July & February).';
      } else if (path.includes('/visa')) {
        title = 'New Zealand Student Visa | Fee & Document Checklist | UniCoach';
        description = 'Step-by-step guide to New Zealand study visa: financial requirements, medical checks, and visa processing times.';
      } else if (path.includes('/universities/top') || path.includes('/universities/best')) {
        title = 'Top Universities in New Zealand | Rankings & Fees | UniCoach';
        description = 'Find top universities in New Zealand, tuition fee structures, and popular courses.';
      } else if (path.includes('/universities/affordable')) {
        title = 'Affordable Universities in New Zealand | Low Fees | UniCoach';
        description = 'List of low-cost and affordable universities in New Zealand for international students.';
      } else if (path.includes('/universities/public')) {
        title = 'Public Universities in New Zealand | Admissions Guide | UniCoach';
        description = 'Check public universities in New Zealand offering quality higher education.';
      } else if (path.includes('/courses/masters')) {
        title = 'Masters in New Zealand | Postgrad Course Fees | UniCoach';
        description = 'Learn about studying postgraduate Masters in New Zealand: top universities, fees, and eligibility.';
      } else if (path.includes('/courses/mba')) {
        title = 'MBA in New Zealand | Top Business Schools & Costs | UniCoach';
        description = 'Complete guide to studying MBA in New Zealand: rankings, fees, and career scope.';
      } else if (path.includes('/courses/mbbs')) {
        title = 'MBBS in New Zealand | Medical Admissions Guide | UniCoach';
        description = 'Study medical courses in New Zealand: top universities, tuition fees, and admission criteria.';
      } else if (path.includes('/courses/mph')) {
        title = 'MPH in New Zealand | Master of Public Health | UniCoach';
        description = 'Get complete details on Master of Public Health in New Zealand: top universities, fees, and requirements.';
      } else if (path.includes('/courses/ma')) {
        title = 'MA in New Zealand | Postgraduate Arts Courses | UniCoach';
        description = 'Explore Master of Arts (MA) courses in New Zealand: entry requirements, fees, and top schools.';
      }
    } else if (path.startsWith('/study-abroad/australia')) {
      title = 'Study in Australia | Top Universities, Cost & Visa | UniCoach';
      description = 'Study abroad in Australia: check top Group of Eight universities, masters courses, tuition fees, living costs, and post-study work visa.';
      if (path.includes('/courses/masters')) {
        title = 'Masters in Australia | MS Course Fees & Eligibility | UniCoach';
        description = 'Learn about studying Masters (MS) in Australia: top universities, tuition fees, eligibility, and post-study visa.';
      } else if (path.includes('/courses/business-analytics')) {
        title = 'Masters in Business Analytics in Australia | Top Schools | UniCoach';
        description = 'Complete details on Masters in Business Analytics in Australia: rankings, costs, and eligibility.';
      } else if (path.includes('/courses/public-health')) {
        title = 'Masters in Public Health in Australia | Top Programs | UniCoach';
        description = 'Check top universities in Australia offering Master of Public Health, fees, and requirements.';
      } else if (path.includes('/universities/carnegie-mellon')) {
        title = 'Carnegie Mellon University Australia | Fees & Admissions | UniCoach';
        description = 'Check Carnegie Mellon University (CMU) Australia admissions guide: entry requirements, fees, and courses.';
      } else if (path.includes('/universities/deakin')) {
        title = 'Deakin University Admissions | Courses, Fees & Visas | UniCoach';
        description = 'Get Deakin University admissions guide: course options, tuition fees, and scholarship options.';
      } else if (path.includes('/universities/monash')) {
        title = 'Monash University Admissions | Rankings, Fees & Courses | UniCoach';
        description = 'Check Monash University admissions guide: entry requirements, fees, rankings, and postgraduate programs.';
      } else if (path.includes('/universities/queensland')) {
        title = 'The University of Queensland Admissions | Courses & Fees | UniCoach';
        description = 'Explore University of Queensland: study programs, entry requirements, tuition fees, and scholarships.';
      } else if (path.includes('/universities/rmit')) {
        title = 'RMIT University Admissions | Course Fees & Requirements | UniCoach';
        description = 'Explore RMIT University: popular undergraduate/postgraduate courses, tuition fees, and admission criteria.';
      } else if (path.includes('/adelaide')) {
        title = 'Universities in Adelaide | Study in Adelaide Australia | UniCoach';
        description = 'Find top universities and colleges in Adelaide, living costs, student life, and career opportunities.';
      } else if (path.includes('/brisbane')) {
        title = 'Universities in Brisbane | Study in Queensland | UniCoach';
        description = 'Explore Brisbane higher education options: top universities, living costs, and student culture.';
      } else if (path.includes('/melbourne')) {
        title = 'Universities in Melbourne | Study in Melbourne Australia | UniCoach';
        description = 'Check top universities in Melbourne, average tuition fees, cost of living, and employment prospects.';
      } else if (path.includes('/perth')) {
        title = 'Universities in Perth | Higher Education Guide | UniCoach';
        description = 'Explore universities in Perth, student living costs, and post-study opportunities.';
      } else if (path.includes('/sydney')) {
        title = 'Universities in Sydney | Study in Sydney Australia | UniCoach';
        description = 'Check top universities in Sydney, average tuition fees, cost of living, and employment prospects.';
      }
    } else if (path.startsWith('/study-abroad/italy')) {
      title = 'Study in Italy | Tuition Free Universities & Visa | UniCoach';
      description = 'Your complete guide to study in Italy: top public universities, free tuition options, regional scholarships (DSU), intakes, and visa.';
      if (path.includes('/intakes')) {
        title = 'Italy Intakes | September & February Timelines | UniCoach';
        description = 'Admissions timelines and deadlines for Italy: September and February intakes.';
      } else if (path.includes('/visa')) {
        title = 'Italy Student Visa | Document Checklist & Process | UniCoach';
        description = 'Step-by-step guide to Italy student visa: financial requirements, enrollment at Universitaly portal, and check list.';
      } else if (path.includes('/free')) {
        title = 'Study in Italy for Free | DSU & Regional Scholarships | UniCoach';
        description = 'How to study in Italy for free: get regional scholarships (DSU, Laziodisco), tuition waivers, and stipends.';
      } else if (path.includes('/universities/top')) {
        title = 'Top Universities in Italy | Rankings & Tuition Fees | UniCoach';
        description = 'Find top universities in Italy, fees, rankings, and study programs.';
      } else if (path.includes('/universities/public')) {
        title = 'Public Universities in Italy | Course Fees & List | UniCoach';
        description = 'Check public universities in Italy offering affordable education for international students.';
      } else if (path.includes('/courses/masters')) {
        title = 'Masters in Italy | Postgraduate Course Fees & List | UniCoach';
        description = 'Learn about studying postgraduate Masters in Italy: top universities, fees, and eligibility.';
      } else if (path.includes('/courses/mba')) {
        title = 'MBA in Italy | Top Business Schools & Course Fees | UniCoach';
        description = 'Check top business schools in Italy for MBA courses, fees, and requirements.';
      } else if (path.includes('/courses/ma')) {
        title = 'MA in Italy | Master of Arts Course Fees & List | UniCoach';
        description = 'Explore Master of Arts (MA) courses in Italy: entry requirements, fees, and top universities.';
      } else if (path.includes('/courses/mbbs')) {
        title = 'MBBS in Italy | Medical Course Admissions & Fees | UniCoach';
        description = 'Study medical courses in Italy: IMAT exam, public universities, tuition fees, and admissions criteria.';
      }
    } else if (path.startsWith('/exams/ielts')) {
      title = 'IELTS Exam Preparation | Syllabus, Registration & Fees | UniCoach';
      description = 'Prepare for the IELTS test. Check exam overview, syllabus, fees, registration process, slot booking, test centers, and preparation classes.';
      if (path.includes('/masterclass')) {
        title = 'Free IELTS Masterclass | Expert Tips & Mock Tests | UniCoach';
        description = 'Join our free IELTS masterclass. Get expert tips, practice mock tests, band strategies, and learning guides.';
      } else if (path.includes('/overview')) {
        title = 'IELTS Exam Overview | What is IELTS Test? | UniCoach';
        description = 'Understand the IELTS exam: format, scoring system, difference between Academic and General Training.';
      } else if (path.includes('/types')) {
        title = 'IELTS Exam Types | Academic vs General Training | UniCoach';
        description = 'Which IELTS exam type is right for you? Compare Academic and General Training tests.';
      } else if (path.includes('/eligibility')) {
        title = 'IELTS Eligibility Criteria | Age Limit & Score Minimums | UniCoach';
        description = 'Check IELTS test eligibility requirements: age guidelines, educational qualifications, and scoring rules.';
      } else if (path.includes('/fees')) {
        title = 'IELTS Exam Fees | Registration Cost & Retake Fees | UniCoach';
        description = 'Get complete details on IELTS test registration fee, cancellation policy, and reschedule charges.';
      } else if (path.includes('/dates')) {
        title = 'IELTS Exam Dates 2026 | Check Test Date Availability | UniCoach';
        description = 'Check available dates for paper-based and computer-delivered IELTS tests.';
      } else if (path.includes('/registration')) {
        title = 'IELTS Registration Online | How to Book IELTS Test | UniCoach';
        description = 'Step-by-step guide to IELTS test registration online. Necessary documents, photo size, and payment modes.';
      } else if (path.includes('/slot-booking')) {
        title = 'IELTS Slot Booking | Choose Exam Center & Slot | UniCoach';
        description = 'Book your IELTS exam slot: select center, dates, speaking slot preferences, and verify details.';
      } else if (path.includes('/coaching-centres')) {
        title = 'IELTS Coaching Centres | Best Prep Institutes | UniCoach';
        description = 'Find top-rated IELTS coaching centers and online preparation classes with expert faculties.';
      } else if (path.includes('/results')) {
        title = 'IELTS Results | Check Scores Online & TRF Guide | UniCoach';
        description = 'How to check your IELTS scores online. Get detailed info on Band Scale, TRF, and EOR processing.';
      } else if (path.includes('/listening')) {
        title = 'IELTS Listening Test | Format, Practice & Tips | UniCoach';
        description = 'Prepare for IELTS Listening: check test section format, types of questions, mock tests, and band tips.';
      } else if (path.includes('/reading')) {
        title = 'IELTS Reading Test | Academic & General Practice | UniCoach';
        description = 'Maximize your IELTS Reading score: practice academic and general reading mock papers and learn key tips.';
      } else if (path.includes('/writing')) {
        title = 'IELTS Writing Test | Task 1 & Task 2 Practice | UniCoach';
        description = 'IELTS Writing Task 1 and Task 2 strategies: templates, band descriptors, and solved samples.';
      } else if (path.includes('/speaking')) {
        title = 'IELTS Speaking Test | Interview Prep & Cue Cards | UniCoach';
        description = 'Ace your IELTS Speaking test: cue cards list, model answers, and mock interview tips.';
      }
    } else if (path.startsWith('/exams/gre')) {
      title = 'GRE General Test Prep | Syllabus, Pattern & Registration | UniCoach';
      description = 'Free GRE prep resources, syllabus, fees, dates, registration, slot booking, mock tests, and scores scale details.';
    } else if (path.startsWith('/exams/gmat')) {
      title = 'GMAT Focus Edition Prep | Syllabus, Dates & Fees | UniCoach';
      description = 'Learn about the GMAT Focus Edition exam. Get syllabus, registration, slot booking, fees, results, and sample papers.';
    } else if (path.startsWith('/exams/toefl')) {
      title = 'TOEFL iBT Exam Details | Registration, Fees & Prep | UniCoach';
      description = 'Comprehensive TOEFL iBT test guide: syllabus, dates, fees, registration, results, mock tests, and section-wise preparation.';
    } else if (path.startsWith('/exams/pte')) {
      title = 'PTE Academic Test | Registration, Centres & Practice | UniCoach';
      description = 'Get details about the PTE Academic exam: syllabus, dates, fees, test centers in India, slot booking, and free preparation guides.';
    } else if (path.startsWith('/exams/sat')) {
      title = 'SAT Prep | Exam Syllabus, Registration & Results | UniCoach';
      description = 'Information on the Digital SAT exam: syllabus, registration, dates, fees, preparation classes, mock tests, and score results.';
    } else if (path.startsWith('/exams/duolingo')) {
      title = 'Duolingo English Test (DET) | Accepted Countries & Prep | UniCoach';
      description = 'Prepare for Duolingo English Test. Find accepted countries (USA, UK, Canada, Australia, Ireland), mock tests, and sample questions.';
    } else if (path.startsWith('/resources/books/')) {
      title = 'Recommended Exam Prep Books & Materials | UniCoach';
      description = 'Best books and preparation guides recommended by experts for IELTS, GRE, GMAT, TOEFL, PTE, and SAT preparation.';
    } else if (path === '/resources/calculators/cgpa-to-gpa') {
      title = 'CGPA to GPA Calculator (U.S. 4.0 Scale) | UniCoach';
      description = 'Convert your Indian CGPA or percentage to the U.S. 4.0 GPA scale. Accurate, free online calculator for university applications.';
    } else if (path === '/resources/calculators/cgpa-to-percentage') {
      title = 'CGPA to Percentage Calculator | Online Converter | UniCoach';
      description = 'Convert your university CGPA to percentage instantly. Supports major Indian university formulas and guidelines.';
    } else if (path === '/resources/calculators/cgpa-to-marks') {
      title = 'CGPA to Marks Calculator | Convert GPA to Percentage | UniCoach';
      description = 'Convert CGPA to marks and percentage for major university admissions and eligibility checks.';
    } else if (path.startsWith('/resources/sop/')) {
      title = 'Statement of Purpose (SOP) Guide & Samples | UniCoach';
      description = 'How to write a winning Statement of Purpose (SOP) for Masters, MBA, and PhD. Free samples, formats, and checklist.';
    } else if (path.startsWith('/resources/lor/')) {
      title = 'Letter of Recommendation (LOR) Guide & Samples | UniCoach';
      description = 'Everything about Letters of Recommendation (LOR) for study abroad. Academic and professional LOR formats and samples.';
    } else if (path === '/blogs') {
      title = 'Latest Study Abroad Blogs, Guides & Articles | UniCoach';
      description = 'Read recent student articles, scholarship updates, country visa policies, university guides, and test-taking tips.';
    } else if (path === '/unicoach-digest') {
      title = 'UniCoach Digest | Latest Global Education News | UniCoach';
      description = 'Stay updated with top study abroad news, changing immigration rules, intake deadlines, and scholarship announcements.';
    } else if (path === '/events') {
      title = 'Global Education Fairs & Upcoming Events | UniCoach';
      description = 'Register for upcoming study abroad fairs, university virtual webinars, and free counselling sessions by UniCoach.';
    } else if (path === '/newsroom') {
      title = 'UniCoach Newsroom | Corporate News & Press | UniCoach';
      description = 'Press releases, corporate updates, and media announcements from UniCoach Education.';
    } else if (path === '/study-abroad') {
      title = 'Explore Study Abroad Destinations | Universities, Visas & Fees | UniCoach';
      description = 'Compare top study abroad destinations (USA, UK, Canada, Australia, Germany, Ireland). Check tuition fees, post-study work visas, and top universities.';
    } else if (path === '/exams') {
      title = 'Study Abroad Exams Hub | IELTS, PTE, TOEFL, GRE, GMAT, SAT | UniCoach';
      description = 'Complete syllabus, scoring cutoffs, exam dates, fees, and AI practice tools for IELTS, PTE, TOEFL, GRE, GMAT, and SAT.';
    } else if (path === '/resources') {
      title = 'Study Abroad Resources, Toolkits & Calculators | UniCoach';
      description = 'Free SOP formats, LOR guidelines, GPA calculators, visa checklists, and official exam preparation books.';
    } else if (path === '/contact' || path === '/book-consultation') {
      title = 'Book Free Study Abroad Counselling | Contact UniCoach';
      description = 'Contact UniCoach. Get in touch with our certified education advisors for profile evaluation, university shortlists, and visa guidance.';
    }

    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // One canonical URL per page on the main domain (no trailing slash, no query string), so Google
    // never treats every route as a copy of the home page or indexes a preview/staging host
    const canonicalPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    upsertHeadTag('link[rel="canonical"]', () => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      return link;
    }).setAttribute('href', canonicalUrl);
    upsertHeadTag('meta[property="og:url"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      return meta;
    }).setAttribute('content', canonicalUrl);

    const isPrivate = NOINDEX_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
    upsertHeadTag('meta[name="robots"]', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      return meta;
    }).setAttribute('content', isPrivate ? 'noindex, nofollow' : 'index, follow');
  }, [pathname]);

  return null;
};

export default ScrollToTop;
