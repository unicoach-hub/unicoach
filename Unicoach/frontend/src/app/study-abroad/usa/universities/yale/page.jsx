import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const yaleData = {
  name: "Yale University",
  location: "New Haven, Connecticut, USA",
  city: "New Haven",
  established: 1701,
  totalStudents: 12060,
  intlStudents: 2533,
  studentFacultyRatio: "6:1",
  acceptanceRate: "6%",
  accreditation: "New England Association of Schools and Colleges (NEASC)",
  avgStudyCost: "INR 8.00 L",
  avgCostOfLiving: "INR 4.00 L",
  type: "PRIVATE",
  logo: "/assets/usa/yale/logo.png",
  heroImage: "/assets/usa/yale/banner.jpg",
  topCourses: [
    { name: "Architecture", count: 1 },
    { name: "Biological Sciences", count: 1 },
    { name: "Business Administration", count: 1 },
    { name: "Computer Science", count: 1 },
    { name: "Law", count: 1 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" }
  ],
  requirements: [
    { 
      title: "Exams Required", 
      detail: "TOEFL iBT / IELTS Academic / PTE Academic for English proficiency proof. GRE/GMAT score is optional or required depending on the course." 
    }
  ],
  rankings: {
    "US News": [
      { category: "Best National Schools - 2025", rank: "5" },
      { category: "Best World Ranking Schools - 2023", rank: "11" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "23" },
      { category: "Best World Ranking Schools - 2023", rank: "18" },
      { category: "Best World Ranking Schools - 2022", rank: "14" }
    ],
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "9" },
      { category: "Best University Ranking Schools - 2022", rank: "9" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "14" }
    ]
  },
  coursesFees: [
    { name: "MArch I", duration: "36 Months", tuition: 8.00 }
  ],
  longDescription: `Yale University, established in 1701, has a rich history that dates back to its founding. Over the years, it has grown into one of the most prestigious institutions in the world, known for its commitment to excellence in education and research.

The student body at Yale is diverse and vibrant, with a total enrollment of 12060 students. Among them, 2533 are international students, representing a wide array of cultures and backgrounds. This diversity enriches the learning environment and fosters global perspectives.

Located in New Haven, Yale's campus is a blend of historic architecture and modern facilities. Key facilities include:
• Yale University Library, one of the largest academic libraries in the world
• The Yale Center for British Art, housing an extensive collection of British art
• State-of-the-art laboratories and research centers
• Beautiful green spaces and residential colleges that promote community

Yale offers a wide range of programs that are both popular and aligned with industry needs. Some of the notable programs include:
• Law
• Business Administration
• Environmental Studies
• Political Science
• Engineering

The university has an acceptance rate of 6%, making it competitive yet accessible. Yale supports international students with various services, including orientation programs, visa assistance, and cultural integration activities.

Yale University is accredited by the following bodies:
• New England Commission of Higher Education
• American Bar Association
• Association to Advance Collegiate Schools of Business

In conclusion, Yale University stands out for its quality education, commitment to research, and preparation of students for successful careers in a global society.`,
  costOfLiving: {
    description: "Attending Yale University in New Haven, Connecticut, offers a prestigious education, but international students should be prepared for the associated living costs. Housing is typically the largest expense, with options ranging from on-campus dormitories to off-campus apartments. Books and supplies are necessary for academic success, while transportation costs include public transit and occasional travel. Personal expenses cover daily necessities and leisure activities, and miscellaneous costs account for unexpected expenses. Overall, the cost of living in New Haven is moderate compared to other major U.S. cities, but students should budget carefully to manage their finances effectively.",
    inr: "15.45L",
    usd: "$18,176",
    breakdown: [
      { name: "Housing & Accommodation", value: "Moderate to High" },
      { name: "Food & Meal Plans", value: "Moderate" },
      { name: "Books & Supplies", value: "Variable" },
      { name: "Transportation", value: "Variable" },
      { name: "Personal & Miscellaneous", value: "Variable" }
    ]
  },
  placements: {
    description: "Yale University offers comprehensive placement assistance for international students to help them transition into the workforce. The university's Career Services office provides career counseling, workshops, job fairs, and networking events to connect students with potential employers. They also offer support for internships and job placements, with a high percentage of students successfully securing internships each year. Eligibility for internships is typically based on academic performance and relevant experience. Yale also has an online job portal where students can access job listings and career resources. The university provides guidance on Optional Practical Training (OPT) and Curricular Practical Training (CPT) for students seeking work experience in the United States. Visa and work authorization guidance is available to help students understand the process of obtaining a visa and authorization to work in the country. Additionally, Yale University offers support for cultural adjustment to help international students adapt to the new environment.",
    services: [
      "Recent Workshops and Seminars",
      "Job Fairs and Networking Events"
    ],
    recruiters: [
      "McKinsey & Company",
      "Goldman Sachs",
      "Google",
      "Microsoft",
      "Bain & Company",
      "Boston Consulting Group (BCG)",
      "JP Morgan Chase & Co.",
      "Amazon",
      "IBM",
      "Citi"
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
    { name: "Bill Clinton", profession: "U.S. President" },
    { name: "Meryl Streep", profession: "Actress" },
    { name: "Paul Krugman", profession: "Nobel Laureate Economist" },
    { name: "Indra Nooyi", profession: "CEO of PepsiCo" },
    { name: "Jodie Foster", profession: "Actress & Director" }
  ],
  blogs: [
    {
      title: "Fresher Jobs In USA For Indians In 2024: Top Roles, Salary & More",
      readTime: "11 mins read",
      date: "Mar 15, 2025"
    },
    {
      title: "How to Get Job in USA for Indians in 2024: Easy Job Search Hurdles!",
      readTime: "11 mins read",
      date: "Mar 13, 2025"
    },
    {
      title: "Highest Paying Jobs in USA for Indian Students 2025",
      readTime: "10 mins read",
      date: "Mar 13, 2025"
    },
    {
      title: "How To Work in USA 2024: Tips & Tricks to Find A Good Job",
      readTime: "15 mins read",
      date: "Mar 15, 2025"
    },
    {
      title: "Minimum Wages in USA 2024: State-wise Comparison",
      readTime: "10 mins read",
      date: "Mar 15, 2025"
    }
  ],
  faqs: [
    {
      question: "Is Yale University a good university?",
      answer: "Yes, Yale University is one of the world's most prestigious Ivy League research universities, ranked #5 in Best National Schools (US News 2025) and #9 in Times Higher Education (2023)."
    },
    {
      question: "How do I get admission to Yale University?",
      answer: "Admissions require a highly competitive profile with high GPA/scores, English proficiency test scores (TOEFL/IELTS), letters of recommendation, and statements of purpose."
    },
    {
      question: "Is Yale University public or private?",
      answer: "Yale University is a private Ivy League research university founded in 1701."
    },
    {
      question: "Why choose Yale University?",
      answer: "Yale is renowned for its academic excellence, unique residential college system, world-class library collections, and exceptional career outcomes across business, law, and STEM fields."
    },
    {
      question: "Is Yale University good for international students?",
      answer: "Yes, Yale hosts over 2,500 international students from 120+ countries and offers dedicated support including visa, OPT/CPT, and cultural adjustment services."
    },
    {
      question: "What is the ranking of Yale University?",
      answer: "Yale is ranked #5 in Best National Schools (US News 2025), #23 in QS Rankings (2025), and #9 in Times Higher Education (2023)."
    },
    {
      question: "What is the pass rate for Yale University?",
      answer: "Yale has an average graduation rate of over 97% and selective admission with a 6% acceptance rate."
    },
    {
      question: "How many students are at Yale University?",
      answer: "Yale has a total enrollment of approximately 12,060 students, representing a tight-knit scholarly community."
    },
    {
      question: "How hard is it to get into Yale University?",
      answer: "With a 6% acceptance rate, admission to Yale is highly selective, evaluating academic achievements, extracurricular highlights, and essays."
    },
    {
      question: "Is Yale University accredited?",
      answer: "Yes, Yale is accredited by the New England Commission of Higher Education (NECHE) and other specific professional accrediting bodies."
    },
    {
      question: "Who are the notable alumni of Yale University and what are their professions?",
      answer: "Notable alumni include Bill Clinton (U.S. President), Meryl Streep (Actress), Paul Krugman (Nobel Laureate Economist), Indra Nooyi (CEO of PepsiCo), and Jodie Foster (Actress & Director)."
    }
  ]
};

const YalePage = () => {
  return <UniversityDetailTemplate 
      uniData={yaleData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default YalePage;
