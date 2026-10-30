import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const oxfordData = {
  name: "University of Oxford",
  location: "Oxford, England, UK",
  city: "Oxford",
  established: 1096,
  type: "PUBLIC",
  logo: "/logos/University of Oxford.png",
  heroImage: "/images/universities/oxford.jpg",
  description: "The University of Oxford is the oldest university in the English-speaking world; there is evidence of teaching there from 1096. It is a collegiate university, with teaching and student life organised across its colleges and departments.\n\nThe city of Oxford is home to the university's historic buildings and facilities, including the Bodleian Libraries and the Ashmolean Museum.\n\nOxford offers taught and research postgraduate courses across Humanities, Mathematical, Physical and Life Sciences, Medical Sciences and Social Sciences. Most postgraduate courses start in October, and each course has its own fixed application deadlines.\n\nOxford is ranked 4th in the world in the QS World University Rankings 2027.",
  topCourses: [
    { name: "Banking and Finance", count: 3 },
    { name: "Biochemistry", count: 1 },
    { name: "Business Administration", count: 1 },
    { name: "Data Science", count: 1 },
    { name: "Engineering Science", count: 1 }
  ],
  intakeDeadlines: [
    { name: "OCT'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "English Language", detail: "IELTS, TOEFL or another accepted test; each course sets either Oxford's standard or higher English level. Check the course page." },
    { title: "Undergraduate Degree", detail: "Typically a first-class or strong upper second-class UK degree, or the international equivalent; the exact requirement varies by course." },
    { title: "Course-specific Requirements", detail: "Some courses ask for GRE/GMAT scores, written work or a research proposal. Check the course page." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "QS World University Rankings 2027", rank: "4" }
    ],
    "Times Higher Education": [
      { category: "THE World University Rankings 2026", rank: "1" }
    ]
  },
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
    { name: "Indira Gandhi", profession: "Politician (studied at Somerville College)" },
    { name: "J.R.R. Tolkien", profession: "Author" },
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
