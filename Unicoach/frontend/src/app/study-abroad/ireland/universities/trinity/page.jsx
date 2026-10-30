import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const trinityData = {
  name: "Trinity College Dublin, The University of Dublin",
  country: "Ireland",
  location: "Dublin, Leinster, Ireland",
  city: "Dublin",
  established: 1592,
  totalStudents: null,
  intlStudents: null,
  type: "PUBLIC",
  studentFacultyRatio: "25:1",
  acceptanceRate: null,
  accreditation: "AACSB",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 7.20 L",
  logo: "/logos/verified-Trinity College Dublin.png",
  heroImage: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=1200",
  topCourses: [
    { name: "Accounting", count: 1 },
    { name: "Archaeology", count: 1 },
    { name: "Architecture", count: 1 },
    { name: "Artificial Intelligence / Machine Learning", count: 1 },
    { name: "Arts / Fine Art", count: 4 }
  ],
  featuredCourse: {
    name: "Masters in Computer Science",
    duration: "12 Months",
    tuition: 31
  },
  intakeDeadlines: [
    { name: "SEP'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "Most postgraduate courses ask for IELTS 6.5 overall with at least 6.0 in each band; some courses ask for more." },
    { title: "Other English Tests", detail: "TOEFL iBT and other tests are accepted; the minimum score depends on the course." },
    { title: "Undergraduate Degree", detail: "Usually an upper second-class honours degree (2.1) or equivalent; check the course page." }
  ],
  rankings: {
    "QS World University Rankings": [
      { category: "World University Rankings - 2027", rank: "75" }
    ]
  },
  coursesFees: [
    { name: "Masters in Computer Science", duration: "12 Months", tuition: 31 }
  ],
  description: "Trinity College Dublin, founded in 1592 under a charter from Queen Elizabeth I, is Ireland's oldest university and its highest-ranked in the QS World University Rankings 2027 (75th). Its city-centre campus is home to the Book of Kells.",
  longDescription: "Trinity College Dublin, founded in 1592, is Ireland's oldest university and consistently ranked as Ireland's #1 institution. Located in the heart of Dublin city, Trinity is a member of the League of European Research Universities and is internationally recognised for its research excellence.\n\nWith a total student community of 18,000, including significant international representation, Trinity offers a uniquely diverse and cosmopolitan campus experience. The historic campus features stunning Georgian architecture, cobblestone squares, and cutting-edge research facilities side by side.\n\nKey campus facilities include:\n- The world-famous Long Room Library housing the Book of Kells\n- Modern science laboratories and research centres\n- State-of-the-art sports complex\n- Student accommodation within the campus\n\nTrinity offers programmes across all disciplines including Arts, Humanities, Business, Engineering, Science, and Medicine. The university's strong connections with top global employers ensure excellent graduate outcomes.\n\nWith an acceptance rate of 33.5%, Trinity is selective and competitive. The university provides comprehensive international student support services from pre-arrival to graduation.",
  studentLife: [
    "Campus Facilities",
    "Student Accommodation",
    "Extracurricular Activities",
    "Support Services",
    "Healthcare and Health Insurance",
    "Working in Ireland",
    "Social Life",
    "Health and Wellbeing"
  ],
  alumni: [
    { name: "Jonathan Swift", profession: "Author of Gulliver's Travels and satirist" },
    { name: "Samuel Beckett", profession: "Nobel Prize-winning playwright" },
    { name: "Mary Robinson", profession: "Former President of Ireland" },
    { name: "Douglas Hyde", profession: "First President of Ireland" },
    { name: "Eavan Boland", profession: "Acclaimed poet and professor" }
  ],
  alumniPerks: [
    "Alumni Room: Access to a dedicated alumni space on campus",
    "Campus Wifi: Wifi access across the campus",
    "Library Access: Continued use of the university library facilities",
    "Affinity Card: Discounts and special offers through the alumni affinity card",
    "Reunions: Opportunities to reconnect through organised reunions",
    "Book Club: Participation in alumni book club events",
    "Careers Support: Ongoing career advice and support services"
  ],
  costOfLiving: {
    description: "Understanding the cost of living is crucial for budgeting while studying at Trinity College Dublin. Dublin is a vibrant European capital with a range of living options. Housing is typically the largest cost, with both on-campus and private accommodation available. Students should plan carefully to manage everyday expenses alongside tuition.",
    inr: "0.60 L",
    usd: "USD 706",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 3.50 L" },
      { name: "Food & Groceries", value: "INR 1.80 L" },
      { name: "Books & Supplies", value: "INR 0.50 L" },
      { name: "Transportation", value: "INR 0.80 L" },
      { name: "Personal & Misc", value: "INR 0.60 L" }
    ]
  },
  placements: {
    description: "According to the QS Graduate Employability Ranking, Trinity College Dublin is ranked 91st in the world for graduate employability. Trinity's Careers Service offers comprehensive career development support including one-on-one counselling, employer networking events, internship placement, and access to the MyCareer portal.",
    services: [
      "Career Development Support",
      "Internship and Job Placement Opportunities",
      "Networking and Employer Engagement",
      "Employment Statistics and Outcomes",
      "Global Opportunities",
      "MyCareer Portal",
      "Mentoring Programs"
    ],
    recruiters: [
      "Google",
      "Amazon",
      "EY (Ernst & Young)",
      "Microsoft",
      "Bank of Ireland",
      "McKinsey & Company",
      "Deloitte",
      "Facebook (Meta)",
      "LinkedIn",
      "IBM"
    ]
  },
  faqs: [
    { question: "What is Trinity College Dublin's current ranking?", answer: "Trinity is ranked 75th in the QS World University Rankings 2027, the highest of any Irish university." },
    { question: "What is the Trinity College Dublin fees for international students?", answer: "Fees depend on the programme. For example, the Masters in Computer Science costs €27,790 for non-EU students in 2026/27 (about ₹31 lakh at ₹110 per euro). Check the course's fee page for your programme." },
    { question: "What courses are offered at Trinity College Dublin?", answer: "Trinity offers programmes in Arts, Humanities, Business, Engineering, Science, Law, Medicine, and Computer Science." },
    { question: "Who are Trinity College Dublin Notable Alumni?", answer: "Notable alumni include Jonathan Swift, Samuel Beckett, Mary Robinson, and Douglas Hyde." },
    { question: "What are the English language requirements at Trinity?", answer: "Most postgraduate courses ask for IELTS 6.5 overall with at least 6.0 in each band; some ask for more." },
    { question: "How's Trinity College Dublin On-Campus Housing?", answer: "Trinity offers on-campus accommodation, including rooms in its city-centre campus residences; places are limited, so apply early." },
    { question: "How does Trinity College Dublin support student placements?", answer: "Through its Careers Service, employer events, internship opportunities, and mentoring programmes." },
    { question: "Which scholarships can international postgraduates apply for?", answer: "Trinity offers some scholarships for non-EU students, and the Government of Ireland International Education Scholarships are open to students at Irish universities. Check eligibility on each scholarship page." },
    { question: "How's the Trinity College Dublin Student Life?", answer: "Student life includes a wide range of clubs and societies, sports teams and arts events on a historic city-centre campus." }
  ],
  blogs: [
    { title: "Part-Time Jobs in Ireland for Students: Top Opportunities & Salary", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs in Ireland for Indians: Complete Details!", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Jobs in Ireland for Indians: How to find out job opportunities in 2024-2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ],
  rank: "#75 in QS World University Rankings 2027"
};

const TrinityPage = () => {
  return <UniversityDetailTemplate 
      uniData={trinityData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default TrinityPage;
