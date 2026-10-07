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
  totalStudents: 18000,
  intlStudents: 34998,
  type: "PUBLIC",
  studentFacultyRatio: "25:1",
  acceptanceRate: "33.5%",
  accreditation: "AACSB",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 7.20 L",
  logo: "https://logo.clearbit.com/tcd.ie",
  heroImage: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=1200",
  topCourses: [
    { name: "Accounting", count: 1 },
    { name: "Archaeology", count: 1 },
    { name: "Architecture", count: 1 },
    { name: "Artificial Intelligence / Machine Learning", count: 1 },
    { name: "Arts / Fine Art", count: 4 }
  ],
  featuredCourse: {
    name: "PG Diploma in Accounting",
    duration: "12 Months",
    tuition: 17.23
  },
  intakeDeadlines: [
    { name: "JAN'2025", status: "Closed" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Closed" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.5 minimum overall band required, with no individual band less than 6.0." },
    { title: "TOEFL iBT Score", detail: "90+ minimum cutoff required for undergraduate and postgraduate programmes." },
    { title: "Undergraduate Degree", detail: "Upper second-class Honours degree (2:1) or equivalent from a recognised institution." }
  ],
  rankings: {
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "161" },
      { category: "Best University Ranking Schools - 2020", rank: "164" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "87" },
      { category: "Best World Ranking Schools - 2024", rank: "87 - 1500" },
      { category: "Best National Schools - 2024", rank: "26 - 1500" },
      { category: "Best World Ranking Schools - 2023", rank: "98" },
      { category: "Best World Ranking Schools - 2022", rank: "101" },
      { category: "Best World Ranking Schools - 2020", rank: "108" }
    ],
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "215" }
    ]
  },
  coursesFees: [
    { name: "PG Diploma in Accounting", duration: "12 Months", tuition: 17.23 },
    { name: "MSc Computer Science", duration: "12 Months", tuition: 23.50 },
    { name: "MSc Business Analytics", duration: "12 Months", tuition: 22.00 },
    { name: "LLM in International Law", duration: "12 Months", tuition: 19.00 }
  ],
  description: "Trinity College Dublin, founded in 1592 by Queen Elizabeth I, is Ireland's oldest and most prestigious university. Located in the heart of Dublin, it is a place of extraordinary academic heritage, home to the Book of Kells and world-class research.",
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
      "Google", "Amazon", "EY (Ernst & Young)", "Microsoft", "Bank of Ireland",
      "McKinsey & Company", "Deloitte", "Facebook (Meta)", "LinkedIn", "IBM"
    ]
  },
  faqs: [
    { question: "What is Trinity College Dublin's current ranking?", answer: "Trinity College Dublin is ranked #87 globally in the 2025 QS World University Rankings, making it Ireland's #1 ranked university." },
    { question: "What is the Trinity College Dublin fees for international students?", answer: "Tuition fees range from approximately INR 17 Lakh to INR 25 Lakh per year depending on the programme." },
    { question: "What courses are offered at Trinity College Dublin?", answer: "Trinity offers programmes in Arts, Humanities, Business, Engineering, Science, Law, Medicine, and Computer Science." },
    { question: "Who are Trinity College Dublin Notable Alumni?", answer: "Notable alumni include Jonathan Swift, Samuel Beckett, Mary Robinson, and Douglas Hyde." },
    { question: "What are the top Trinity College Dublin Graduate Programs?", answer: "Top postgraduate programmes include Computer Science, Business Analytics, Law, and International Relations." },
    { question: "What is the Trinity College Dublin Average Salary?", answer: "Trinity graduates earn an average salary of approximately INR 45-60 Lakh per annum in Ireland." },
    { question: "How's Trinity College Dublin On-Campus Housing?", answer: "Trinity offers on-campus accommodation within its historic grounds, including rooms in various campus residences." },
    { question: "How does Trinity College Dublin support student placements?", answer: "Through its Careers Service, MyCareer portal, employer partnerships, internship opportunities, and mentoring programmes." },
    { question: "Which are the top Trinity College Dublin Postgraduate Scholarships?", answer: "Key scholarships include the Provost's PhD Project Awards, the DF Moore Scholarships, and the Government of Ireland Scholarships." },
    { question: "How's the Trinity College Dublin Student Life?", answer: "Student life is rich and vibrant, with over 170 student clubs and societies, sports teams, arts events, and a historic campus setting." }
  ],
  blogs: [
    { title: "Part-Time Jobs in Ireland for Students: Top Opportunities & Salary", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs in Ireland for Indians: Complete Details!", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Jobs in Ireland for Indians: How to find out job opportunities in 2024-2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ]
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
