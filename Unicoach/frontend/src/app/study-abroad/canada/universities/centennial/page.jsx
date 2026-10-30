import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const centennialData = {
  name: "Centennial College",
  country: "Canada",
  location: "Scarborough, Ontario, Canada",
  city: "Scarborough",
  established: 1966,
  totalStudents: 45000,
  type: "PUBLIC",
  accreditation: "Public college of applied arts and technology, Ontario",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 2.00 L",
  logo: "/logos/verified-Centennial College.png",
  heroImage: "https://images.unsplash.com/photo-1519832979-6fa011b87667?w=1200",
  topCourses: [
    { name: "Accounting", count: 6 },
    { name: "Advertising", count: 3 },
    { name: "Aerospace Engineering", count: 7 },
    { name: "Animation", count: 2 },
    { name: "Architecture", count: 6 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.0 - 6.5 minimum band required for admission, with no band less than 5.5 - 6.0." },
    { title: "TOEFL iBT Score", detail: "80 - 88 minimum cutoff required for English proficiency verification." },
    { title: "Academic Credentials", detail: "Graduation certificate/diploma transcripts indicating relevant coursework for the program of choice." }
  ],
  rankings: {
    "Webometrics - National": [
      { category: "Best Schools - 2023", rank: "76" }
    ]
  },
  coursesFees: [],
  description: "Centennial College, founded in 1966, is Ontario's first public college. Its largest campus, Progress, is in Scarborough in east Toronto, and it offers diplomas, graduate certificates and degrees, including joint programs with the University of Toronto Scarborough.",
  longDescription: "Centennial College, founded in 1966, is Ontario's first public college. Its largest campus, Progress, is in Scarborough in east Toronto, and it offers diplomas, graduate certificates and degrees, including joint programs with the University of Toronto Scarborough.",
  studentLife: [
    "Student Groups and Organizations",
    "Libraries and Study Resources",
    "Labs and Research Facilities",
    "Athletic Facilities and Grounds",
    "Housing",
    "Social and Recreational Spots"
  ],
  // Alumni removed until each name can be checked against a reliable source
  alumni: null,
  costOfLiving: {
    description: "Living in Scarborough as an international student attending Centennial College involves several key expenses. Housing and food typically represent the largest portion of the budget, with costs varying based on accommodation type and lifestyle choices. Books and supplies are essential for academic success, while transportation costs depend on the distance from campus and the chosen mode of travel. Personal expenses cover a range of necessities, from clothing to mobile phone plans. Miscellaneous expenses account for unexpected costs or leisure activities. Overall, students should plan their finances carefully to ensure a comfortable and successful academic experience.",
    inr: "8.40 L",
    usd: "USD 9,882",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 4.50 L" },
      { name: "Food & Groceries", value: "INR 1.80 L" },
      { name: "Books & Supplies", value: "INR 0.60 L" },
      { name: "Transportation", value: "INR 0.50 L" },
      { name: "Personal Expenses", value: "INR 1.00 L" }
    ]
  },
  placements: {
    description: "Centennial College provides comprehensive placement assistance for international students to help them secure job opportunities in their field of study. The college offers career counselling services to assist students in exploring career paths, resume writing, and interview preparation. Workshops and seminars are regularly organized to enhance students' employability skills, with topics covering job search strategies, networking, and professional development. Job fairs and networking events are held throughout the year, connecting students with potential employers and industry professionals. Centennial College facilitates internships for eligible students, with a significant number of students securing internship opportunities each year. The college also offers an online job portal for students to access job listings and recruitment information. Visa and work authorization guidance is provided to students who are eligible based on their program of study and country of origin. Additionally, Centennial College offers support for cultural adjustment to help international students adapt to the new environment and thrive in their academic and professional pursuits.",
    services: [
      "Recent Workshops and Seminars",
      "Internship Support",
      "Job Fairs and Networking Events",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "IBM", "Bell Canada", "BMO Financial Group", "Scotiabank", "Royal Bank of Canada",
      "Sun Life", "Canadian Tire", "CIBC", "TD Bank", "Rogers Communications"
    ]
  },
  faqs: [
    { question: "Is Centennial College a good college?", answer: "Centennial is Ontario's first public college, founded in 1966, and offers career-focused programs across several Toronto campuses." },
    { question: "How do I get admission to Centennial College?", answer: "To apply, submit high school or post-secondary transcripts, standard personal identification, and proof of English proficiency (e.g. IELTS, TOEFL) via the international application portal." },
    { question: "Is Centennial College public or private?", answer: "Centennial College is a public college established in 1966 in Toronto (Scarborough), Ontario." },
    { question: "Why choose Centennial College?", answer: "It offers hands-on laboratory experiences, highly relevant internships/co-ops, and is located in the multicultural hub of Scarborough." },
    { question: "Is Centennial College good for international students?", answer: "Centennial has a large international student community and provides settlement, language and transition support." },
    { question: "What is the ranking of Centennial College?", answer: "Colleges such as Centennial are not ranked by QS. Webometrics placed it #76 in Canada in 2023." },
    { question: "How many students are at Centennial College?", answer: "Centennial has roughly 26,000 full-time and 19,000 part-time students." },
    { question: "Is Centennial College recognised?", answer: "Yes. Centennial is a public college under Ontario law. Some programs also hold accreditation from professional bodies; check the program page." },
  ],
  blogs: [
    { title: "Steps to get a job in Canada from India", readTime: "19 mins read", date: "Mar 15, 2025" },
    { title: "Part Time Jobs in Canada for Indian Graduates 2024: Simplified!", readTime: "11 mins read", date: "Mar 15, 2025" },
    { title: "CPA Canada Course: Overview, Process, Top Colleges & Scope For Jobs", readTime: "10 mins read", date: "Mar 15, 2025" },
    { title: "Top Highest-Paying Jobs in Canada in 2025 for International Students", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Average Salary In Canada 2024 for Indian Students", readTime: "9 mins read", date: "Mar 15, 2025" },
    { title: "List of Occupations In Demand In Canada For 2024: Top 10 High-Paying Jobs with Promising Salary", readTime: "12 mins read", date: "Mar 15, 2025" }
  ]
};

const CentennialPage = () => {
  return <UniversityDetailTemplate 
      uniData={centennialData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default CentennialPage;
