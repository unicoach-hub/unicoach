import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const oxfordData = {
  name: "University of Oxford",
  location: "Oxford - Mississippi, UK", // Matches user prompt's specific location string
  city: "Oxford",
  established: 1096,
  totalStudents: 26455,
  intlStudents: 11500,
  studentFacultyRatio: "11:1",
  acceptanceRate: "17%",
  accreditation: "Association of MBAs (AMBA)",
  avgStudyCost: "INR 1.50 L",
  avgCostOfLiving: "INR 0.80 L",
  logo: "/logos/University of Oxford.png",
  heroImage: "/images/universities/oxford.jpg",
  description: "Welcome to the University of Oxford, established in 1096, making it one of the oldest and most prestigious institutions in the world. Over the centuries, Oxford has grown into a vibrant community of 24,000 students, with 8000 international students contributing to its diverse and inclusive environment.\n\nThe university's historic campus is renowned for its stunning architecture and picturesque surroundings. Notable facilities include the Bodleian Library, Ashmolean Museum, and numerous colleges scattered throughout the city of Oxford.\n\nAt Oxford, you can choose from a wide range of programmes, with a focus on academic excellence and industry relevance. Popular areas of study include Humanities, Sciences, Social Sciences, and Business.\n\nIntake Periods: The university offers multiple intake periods throughout the year, providing flexibility for international students.\nSupport Services: International students can benefit from a range of support services, including language classes, cultural integration programs, and academic advising.\n\nThe University of Oxford holds Association of MBAs (AMBA) from the Association of MBAs (AMBA), ensuring the highest standards of education and professional development.",
  topCourses: [
    { name: "Banking and Finance", count: 3 },
    { name: "Biochemistry", count: 1 },
    { name: "Business Administration", count: 1 },
    { name: "Data Science", count: 1 },
    { name: "Engineering Science", count: 1 }
  ],
  intakeDeadlines: [
    { name: "MAY'2025", status: "Intake Open" },
    { name: "JUN'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" },
    { name: "OCT'2025", status: "Intake Open" },
    { name: "NOV'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "TOEFL iBT Score", detail: "110+ minimum cutoff required for English proficiency verification." },
    { title: "IELTS Academic Band", detail: "7.5+ minimum band required for admission, with no band less than 7.0." },
    { title: "GRE General Score", detail: "Recommended for all computational, economic, and scientific streams." },
    { title: "Undergraduate Degree", detail: "First-class honors degree expected (minimum equivalent of 3.8+ GPA)." }
  ],
  rankings: {
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "1" },
      { category: "Best University Ranking Schools - 2022", rank: "1" }
    ],
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "5" },
      { category: "Best World Ranking Schools - 2022", rank: "5" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "5" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2023", rank: "4" },
      { category: "Best World Ranking Schools - 2022", rank: "4" }
    ]
  },
  coursesFees: [
    { name: "MSc in Law and Finance", duration: "10 Months", tuition: 52.77 },
    { name: "MSc in Mathematical and Computational Finance", duration: "10 Months", tuition: 41.47 },
    { name: "MSc in Financial Economics", duration: "9 Months", tuition: 58.72 }
  ],
  placements: {
    description: "The University of Oxford provides comprehensive placement assistance for international students to help them transition into the workforce. The Career Service at Oxford offers career counseling sessions to guide students in making informed decisions about their career paths. They also conduct various workshops and seminars on topics such as resume writing, interview skills, and job search strategies to enhance students' employability skills. Additionally, the university organizes job fairs and networking events where students can connect with potential employers from various industries.",
    services: [
      "Internships and Placement Support",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Goldman Sachs", "McKinsey & Company", "Boston Consulting Group",
      "Barclays", "J.P. Morgan", "Google", "Amazon", "Microsoft",
      "Deloitte", "Ernst & Young", "PwC", "IBM", "Accenture"
    ]
  },
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
    { name: "Stephen Hawking", profession: "Physicist" },
    { name: "Indira Gandhi", profession: "Politician" },
    { name: "J.R.R. Tolkien", profession: "Author" },
    { name: "Emma Watson", profession: "Actress" },
    { name: "Malala Yousafzai", profession: "Activist" }
  ],
  blogs: [
    { title: "How To Get Jobs In UK In 2025: Process, Eligibility & Visa", readTime: "11 mins read", date: "Mar 15, 2025" },
    { title: "Part Time Job Vacancies in the United Kingdom 2025", readTime: "14 mins read", date: "Mar 15, 2025" },
    { title: "How to Get Job in UK from India in 2024: Student Guide", readTime: "11 mins read", date: "Mar 15, 2025" },
    { title: "List Of 5 Demanding Jobs In UK For 2024: Salary & Work Visa", readTime: "7 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs In UK for Indian Students 2025", readTime: "9 mins read", date: "Mar 15, 2025" },
    { title: "Best Internships in UK for International Students 2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ]
};

const OxfordPage = () => {
  return <UniversityDetailTemplate 
      uniData={oxfordData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default OxfordPage;
