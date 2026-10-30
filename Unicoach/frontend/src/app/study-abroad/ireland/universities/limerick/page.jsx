import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const limerickData = {
  name: "University of Limerick",
  country: "Ireland",
  location: "Limerick, Munster, Ireland",
  city: "Limerick",
  established: 1972,
  totalStudents: null,
  intlStudents: null,
  type: "PUBLIC",
  studentFacultyRatio: "20:1",
  acceptanceRate: null,
  accreditation: "Association to Advance Collegiate Schools of Business (AACSB)",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 3.00 L",
  logo: "/logos/University of Limerick.webp",
  heroImage: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1200",
  topCourses: [
    { name: "Accounting", count: 2 },
    { name: "Aerospace Engineering", count: 2 },
    { name: "Animal Husbandry", count: 1 },
    { name: "Architecture", count: 2 },
    { name: "Artificial Intelligence / Machine Learning", count: 3 }
  ],
  featuredCourse: {
    name: "MSc in Software Engineering",
    duration: "12 Months",
    tuition: 24
  },
  intakeDeadlines: [
    { name: "SEP'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "IELTS 6.5 overall with no band below 6.0 for postgraduate programmes." },
    { title: "Other English Tests", detail: "TOEFL iBT and other tests are accepted; check the minimum score for your programme." },
    { title: "Undergraduate Degree", detail: "An honours bachelor's degree or equivalent; the required grade varies by programme." }
  ],
  rankings: {
    "QS World University Rankings": [
      { category: "World University Rankings - 2027", rank: "388" }
    ]
  },
  coursesFees: [
    { name: "MSc in Software Engineering", duration: "12 Months", tuition: 24 }
  ],
  description: "The University of Limerick (UL), founded in 1972 and a university since 1989, has a riverside campus on the Shannon. It is known for engineering, business, health sciences and its cooperative education (work placement) programme.",
  longDescription: "Welcome to the University of Limerick!\n\nFounded in 1972, the University of Limerick has grown steadily over the years, becoming a leading institution in higher education. With a total student enrolment of 16,500, including 2,000 international students, you will find a diverse and vibrant community at UL.\n\nThe campus is set in scenic surroundings along the River Shannon, offering a conducive environment for learning and growth. UL boasts outstanding facilities including:\n- State-of-the-art research laboratories and innovation hubs\n- The Glucksman Library — one of Ireland's finest academic libraries\n- UL Arena — a world-class indoor sports venue\n- On-campus village accommodation for students\n\nAt UL, we offer a wide range of popular programmes in:\n- Business Studies (AACSB-accredited)\n- Engineering and Science\n- Health Sciences and Nursing\n- Arts, Humanities, and Social Sciences\n\nOur acceptance rate is 65%, and we have intake periods throughout the year, providing flexibility for prospective students. The university provides robust international student support services.\n\nWe are proudly accredited by the Association to Advance Collegiate Schools of Business (AACSB), a testament to our commitment to academic excellence.",
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
    description: "Limerick is significantly more affordable than Dublin, making it one of the best-value student cities in Ireland. UL's on-campus village accommodation provides convenient and cost-effective options for international students. The city offers great transport links, dining options, and social activities.",
    inr: "8.00 L",
    usd: "USD 9,412",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 4.00 L" },
      { name: "Food & Groceries", value: "INR 1.80 L" },
      { name: "Books & Supplies", value: "INR 0.50 L" },
      { name: "Transportation", value: "INR 0.70 L" },
      { name: "Personal & Misc", value: "INR 1.00 L" }
    ]
  },
  placements: {
    description: "The University of Limerick offers comprehensive placement assistance to international students. The Career Services department provides career counselling, workshops on resume writing, interview skills, and job search strategies, as well as job fairs and networking events. UL's strong relationships with multinational companies in Limerick's Shannon region ensure excellent career opportunities.",
    services: [
      "Internships and Placement Support",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Dell Technologies",
      "Johnson & Johnson",
      "Regeneron",
      "Cook Medical",
      "Stryker",
      "UL Hospitals Group",
      "Limerick City Council",
      "CPC Logistics",
      "Shannon Aviation",
      "Analog Devices"
    ]
  },
  faqs: [
    { question: "What is the ranking of the University of Limerick?", answer: "The University of Limerick is ranked 388th in the QS World University Rankings 2027." },
    { question: "How do I get admission to the University of Limerick?", answer: "You need an honours bachelor's degree or equivalent, IELTS 6.5 overall (no band below 6.0) or an accepted equivalent, and an application through UL's online system." },
    { question: "Is the University of Limerick public or private?", answer: "The University of Limerick is a public university funded by the Irish state." },
    { question: "How much is a master's at UL?", answer: "Fees vary by programme. For example, the MSc in Software Engineering costs €21,500 for non-EU students (about ₹24 lakh at ₹110 per euro)." },
    { question: "Why choose the University of Limerick?", answer: "UL offers a riverside campus, a cooperative education (work placement) model and a lower cost of living than Dublin." }
  ],
  blogs: [
    { title: "Part-Time Jobs in Ireland for Students: Top Opportunities & Salary", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs in Ireland for Indians: Complete Details!", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Jobs in Ireland for Indians: How to find out job opportunities in 2024-2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ],
  state: "Munster",
  rank: "#388 in QS World University Rankings 2027"
};

const LimerickPage = () => {
  return <UniversityDetailTemplate 
      uniData={limerickData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default LimerickPage;
