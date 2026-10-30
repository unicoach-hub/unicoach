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
  totalStudents: null,
  intlStudents: null,
  type: "PUBLIC",
  studentFacultyRatio: "18:1",
  acceptanceRate: null,
  accreditation: "Engineers Ireland",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 4.00 L",
  logo: "/logos/Dublin City University.webp",
  heroImage: "https://images.unsplash.com/photo-1564959130747-897a8e11c2b1?w=1200",
  topCourses: [
    { name: "Accounting", count: 2 },
    { name: "Artificial Intelligence / Machine Learning", count: 1 },
    { name: "Astronomy", count: 1 },
    { name: "Banking and Finance", count: 5 },
    { name: "Business Administration", count: 4 }
  ],
  featuredCourse: {
    name: "MSc in Computing",
    duration: "12 Months",
    tuition: 28
  },
  intakeDeadlines: [
    { name: "JAN'2026", status: "Intake Open" },
    { name: "SEP'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "IELTS 6.5 overall with at least 6.0 in each band for most postgraduate programmes." },
    { title: "Other English Tests", detail: "TOEFL iBT and other tests are accepted; check the minimum score for your programme." },
    { title: "Undergraduate Degree", detail: "An honours bachelor's degree or equivalent; the required grade varies by programme." }
  ],
  rankings: {
    "QS World University Rankings": [
      { category: "World University Rankings - 2027", rank: "408" }
    ]
  },
  coursesFees: [
    { name: "MSc in Computing", duration: "12 Months", tuition: 28 }
  ],
  description: "Dublin City University (DCU), founded in 1975 and a university since 1989, is based in Glasnevin on Dublin's northside. It is known for computing, business, communications and engineering, and for close links with industry.",
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
  alumni: null,
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
      "Google",
      "Microsoft",
      "Meta",
      "LinkedIn",
      "Accenture",
      "Deloitte",
      "EY",
      "PwC",
      "Bank of Ireland",
      "AIB"
    ]
  },
  faqs: [
    { question: "What is DCU's current QS ranking?", answer: "Dublin City University is ranked 408th in the QS World University Rankings 2027." },
    { question: "What programmes is DCU best known for?", answer: "DCU is well known for computing, business, communications and engineering programmes." },
    { question: "What are the English language requirements at DCU?", answer: "Most postgraduate programmes require IELTS 6.5 overall with at least 6.0 in each band, or an accepted equivalent." },
    { question: "How much is the MSc in Computing at DCU?", answer: "The non-EU fee for the MSc in Computing is €25,000 for 2027/28 (about ₹28 lakh at ₹110 per euro). It has September and January intakes." },
    { question: "Is DCU a public or private university?", answer: "Dublin City University is a public university funded by the Irish state." },
    { question: "What career support does DCU offer?", answer: "DCU's Careers Service provides guidance, workshops, employer events and job listings." }
  ],
  blogs: [
    { title: "Part-Time Jobs in Ireland for Students: Top Opportunities & Salary", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs in Ireland for Indians: Complete Details!", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Jobs in Ireland for Indians: How to find out job opportunities in 2024-2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ],
  rank: "#408 in QS World University Rankings 2027"
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
