import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const dcuData = {
  name: "Dublin City University",
  country: "Ireland",
  location: "Dublin, Leinster, Ireland",
  city: "Dublin",
  established: 1975,
  totalStudents: 17400,
  intlStudents: 3828,
  type: "PUBLIC",
  studentFacultyRatio: "18:1",
  acceptanceRate: "55%",
  accreditation: "Engineers Ireland",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 4.00 L",
  logo: "https://logo.clearbit.com/dcu.ie",
  heroImage: "https://images.unsplash.com/photo-1564959130747-897a8e11c2b1?w=1200",
  topCourses: [
    { name: "Accounting", count: 2 },
    { name: "Artificial Intelligence / Machine Learning", count: 1 },
    { name: "Astronomy", count: 1 },
    { name: "Banking and Finance", count: 5 },
    { name: "Business Administration", count: 4 }
  ],
  featuredCourse: {
    name: "MSc in International Accounting and Business",
    duration: "12 Months",
    tuition: 19.45
  },
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.5 minimum overall band, with no individual component below 6.0." },
    { title: "TOEFL iBT Score", detail: "90+ overall score required for most postgraduate programmes." },
    { title: "Undergraduate Degree", detail: "Second-class Honours grade 1 (2:1) or equivalent undergraduate qualification." }
  ],
  rankings: {
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "401 - 500" },
      { category: "Best World Ranking Schools - 2022", rank: "501 - 600" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "421" },
      { category: "Best World Ranking Schools - 2024", rank: "421 - 1500" },
      { category: "Best World Ranking Schools - 2023", rank: "471" },
      { category: "Best World Ranking Schools - 2022", rank: "490" }
    ],
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "917" },
      { category: "Best World Ranking Schools - 2022", rank: "861" }
    ],
    "Complete University Guide": [
      { category: "Best National Schools - 2025", rank: "4" }
    ]
  },
  coursesFees: [
    { name: "MSc in International Accounting and Business", duration: "12 Months", tuition: 19.45 },
    { name: "MSc in Accounting", duration: "12 Months", tuition: 19.45 },
    { name: "MSc in Data Analytics", duration: "12 Months", tuition: 16.80 },
    { name: "MSc in Computer Science", duration: "12 Months", tuition: 17.50 },
    { name: "MSc in Cyber Security", duration: "12 Months", tuition: 16.00 }
  ],
  description: "Dublin City University (DCU), established in 1975, is one of Ireland's most dynamic and innovative universities. Located on the northside of Dublin, DCU is renowned for its industry partnerships, enterprise culture, and strong focus on transforming lives through education.",
  longDescription: "Dublin City University (DCU) was established in 1975 and has rapidly grown to become one of Ireland's most innovative and forward-thinking universities. Located in Dublin, Ireland's capital and tech hub, DCU has a total student population of 17,400 including 3,828 international students.\n\nDCU is globally recognised for its applied research, enterprise culture, and close relationships with the technology and business sectors. The university has campuses across Dublin and is Ireland's #4 nationally ranked university.\n\nKey campus highlights include:\n- State-of-the-art engineering and computing labs\n- The DCU Business School, among the most modern in Ireland\n- The Helix — a world-class performing arts venue\n- Sports facilities including an Olympic-size pool\n\nDCU's programmes span business, computing, engineering, communications, science, and education. Its entrepreneurship hub, DCU Ryan Academy, is one of Ireland's leading centres for start-up development.\n\nWith intakes in January and September, DCU offers flexibility for international students. The university's Career Services and International Office provide comprehensive support from admission to graduation.",
  studentLife: [
    "Student Groups and Organizations",
    "Libraries and Study Resources",
    "Labs and Research Facilities",
    "Athletic Facilities and Grounds",
    "Housing",
    "Social and Recreational Spots",
    "Special Attractions"
  ],
  alumni: [
    { name: "Pat Rabbitte", profession: "Irish Politician" },
    { name: "Eleanor McEvoy", profession: "Singer-Songwriter" },
    { name: "Ursula Halligan", profession: "Broadcast Journalist" },
    { name: "David McWilliams", profession: "Economist and Author" }
  ],
  costOfLiving: {
    description: "Dublin is a vibrant European capital with a range of living options for students. While costs have risen in recent years, DCU's northside campus location offers slightly more affordable options compared to the city centre. Students should plan for housing, food, transportation, and social activities.",
    inr: "9.00 L",
    usd: "USD 10,588",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 4.80 L" },
      { name: "Food & Groceries", value: "INR 1.80 L" },
      { name: "Books & Supplies", value: "INR 0.50 L" },
      { name: "Transportation", value: "INR 0.90 L" },
      { name: "Personal & Misc", value: "INR 1.00 L" }
    ]
  },
  placements: {
    description: "DCU's Careers Service supports students throughout their academic journey with career counselling, employer engagement events, and access to its extensive employer network. DCU graduates are highly sought after by multinational companies across technology, finance, and media sectors based in Dublin.",
    services: [
      "Career Counselling and Development",
      "Internship and Placement Support",
      "Online Job Portal",
      "Networking and Employer Engagement",
      "Graduate Employment Statistics"
    ],
    recruiters: [
      "Google", "Microsoft", "Meta", "LinkedIn", "Accenture",
      "Deloitte", "EY", "PwC", "Bank of Ireland", "AIB"
    ]
  },
  faqs: [
    { question: "What is DCU's current QS ranking?", answer: "Dublin City University is ranked #421 globally in the 2025 QS World University Rankings." },
    { question: "What programmes is DCU best known for?", answer: "DCU is particularly well-known for Accounting, Business Analytics, Computer Science, Communications, and Engineering programmes." },
    { question: "What are the English language requirements at DCU?", answer: "Most programmes require IELTS 6.5 or TOEFL iBT 90+ for international students." },
    { question: "Does DCU offer scholarships to international students?", answer: "Yes, DCU offers the DCU Excellence Scholarship and several subject-specific awards for high-achieving international applicants." },
    { question: "Is DCU a public or private university?", answer: "Dublin City University is a public research university funded by the Irish government." },
    { question: "What career support does DCU offer?", answer: "DCU's Careers Service provides counselling, workshops, employer events, and access to a broad network of multinational recruiters." }
  ],
  blogs: [
    { title: "Part-Time Jobs in Ireland for Students: Top Opportunities & Salary", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs in Ireland for Indians: Complete Details!", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Jobs in Ireland for Indians: How to find out job opportunities in 2024-2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ]
};

const DCUPage = () => {
  return <UniversityDetailTemplate 
      uniData={dcuData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default DCUPage;
