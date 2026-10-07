import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const columbiaData = {
  name: "Columbia University",
  location: "New York City, New York, USA",
  city: "New York City",
  established: 1754,
  totalStudents: 32000,
  intlStudents: 11600,
  studentFacultyRatio: "6:1",
  acceptanceRate: "6%",
  accreditation: "Middle States Commission on Higher Education (MSCHE)",
  avgStudyCost: "INR 1.50 L",
  avgCostOfLiving: "INR 0.75 L",
  type: "PRIVATE",
  logo: "/assets/usa/columbia/logo.png",
  heroImage: "/assets/usa/columbia/banner.jpg",
  topCourses: [
    { name: "Banking and Finance", count: 1 },
    { name: "Biomedical Engineering", count: 1 },
    { name: "Business Administration", count: 1 },
    { name: "Civil Engineering", count: 1 },
    { name: "Computer Science", count: 1 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { 
      title: "Exams Required", 
      detail: "TOEFL iBT / IELTS Academic / PTE Academic for English proficiency proof. GRE/GMAT score is optional or required depending on the course." 
    }
  ],
  rankings: {
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "11" },
      { category: "Best University Ranking Schools - 2022", rank: "16" },
      { category: "Best World Ranking Schools - 2022", rank: "11" }
    ],
    "US News": [
      { category: "Best National Schools - 2025", rank: "13" },
      { category: "Best World Ranking Schools - 2023", rank: "7" },
      { category: "Best University Ranking Schools - 2022", rank: "6" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "34" },
      { category: "Best World Ranking Schools - 2024", rank: "23" },
      { category: "Best World Ranking Schools - 2023", rank: "22" },
      { category: "Best World Ranking Schools - 2022", rank: "19" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "9" },
      { category: "Best World Ranking Schools - 2022", rank: "9" }
    ],
    "Webometrics - National": [
      { category: "Best University Ranking Schools - 2022", rank: "8" }
    ]
  },
  coursesFees: [
    { name: "MS in Financial Engineering", duration: "24 Months", tuition: 38.39 }
  ],
  longDescription: `Columbia University, established in 1754, has a rich history as one of the oldest institutions of higher education in the United States. Over the years, it has grown into a prestigious university known for its rigorous academic standards and commitment to research and innovation.

With a total enrollment of 32000, you will find a vibrant and diverse student body. The university prides itself on its international representation, with 11600 students from various countries, creating a multicultural environment that enhances your educational experience.

Located in the heart of New York City, Columbia's campus features a blend of historic and modern architecture. Key facilities include:
• The Butler Library, one of the largest university libraries in the country
• The Lenfest Center for the Arts, showcasing contemporary art and performances
• The Columbia University Medical Center, a leader in medical research and education

Columbia offers a wide range of programs that align with industry demands. Some popular programs include:
• Business Administration
• Engineering and Applied Science
• Journalism
• International and Public Affairs

The university has an acceptance rate of 6%, with multiple intake periods throughout the year. Columbia provides robust support services for international students, ensuring a smooth transition and a fulfilling academic journey.

Columbia University is accredited by the following bodies:
• Middle States Commission on Higher Education
• Association of American Universities

In conclusion, Columbia University stands out for its quality education and commitment to preparing you for a successful career in a globalized world.`,
  costOfLiving: {
    description: "Living in New York City as an international student attending Columbia University can be a rewarding yet costly experience. The vibrant city offers a diverse range of cultural and social activities, but it also comes with a high cost of living. Housing is the most significant expense, with options ranging from university dormitories to private apartments. Books and supplies are essential for academic success, and students should budget accordingly. Transportation costs can vary depending on the distance from campus and the mode of transport chosen. Personal expenses, including dining, entertainment, and healthcare, should also be considered. Miscellaneous expenses cover unforeseen costs that may arise during the academic year. Overall, students should plan their finances carefully to ensure a comfortable and enriching stay in New York City.",
    inr: "19.25L",
    usd: "$22,647",
    breakdown: [
      { name: "Housing & Accommodation", value: "Very High (NYC average)" },
      { name: "Food & Meals", value: "High" },
      { name: "Books & Supplies", value: "Variable" },
      { name: "Transportation (MTA Subway)", value: "Variable" },
      { name: "Personal & Miscellaneous", value: "Variable" }
    ]
  },
  placements: {
    description: "Columbia University offers a range of placement assistance services for international students to help them navigate the job market in the United States. The university's Career Counseling Center provides personalized career advising sessions to help students explore career paths, develop job search strategies, and improve their networking skills. Additionally, the center conducts workshops and seminars on topics such as resume writing, interview preparation, and job search techniques. Recent examples include a workshop on virtual networking during the pandemic and a seminar on navigating the US job market as an international student.",
    services: [
      "Job Fairs and Networking Events",
      "Internships and Placement Support",
      "Online Job Portal",
      "OPT and CPT Guidance",
      "Visa and Work Authorization Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "McKinsey & Company",
      "Bain & Company",
      "Boston Consulting Group",
      "Goldman Sachs",
      "JPMorgan Chase & Co.",
      "Morgan Stanley",
      "Google",
      "Microsoft",
      "Amazon",
      "Facebook",
      "Apple"
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
    { name: "Barack Obama", profession: "President" },
    { name: "Warren Buffett", profession: "Investor" },
    { name: "Spike Lee", profession: "Filmmaker" },
    { name: "Ruth Bader Ginsburg", profession: "Supreme Court Justice" },
    { name: "Alicia Keys", profession: "Singer" }
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
      title: "Columbia University SAT Scores for Indian Students in 2025: Everything You Need To Know!",
      readTime: "9 mins read",
      date: "Mar 15, 2025"
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
      question: "Is Columbia University a good university?",
      answer: "Yes, Columbia University is one of the world's most prestigious Ivy League research universities, ranked #13 nationally by US News (2025) and #11 globally by Times Higher Education (2023)."
    },
    {
      question: "How do I get admission to Columbia University?",
      answer: "Admissions require a competitive application including high academic records, standardized test scores (SAT/ACT or GRE/GMAT if applicable), English proficiency proof, letters of recommendation, and strong essays."
    },
    {
      question: "Is Columbia University public or private?",
      answer: "Columbia University is a private research university founded in 1754."
    },
    {
      question: "Why choose Columbia University?",
      answer: "It offers world-class programs in the center of New York City, providing unparalleled networking, internship, and placement opportunities with top global firms."
    },
    {
      question: "Is Columbia University good for international students?",
      answer: "Yes, it is highly diverse, hosting over 11,600 international students from more than 150 countries with dedicated counseling and CPT/OPT placement support."
    },
    {
      question: "What is the ranking of Columbia University?",
      answer: "Columbia is ranked #34 globally in QS Rankings (2025), #11 in Times Higher Education (2023), and #13 in US National Universities (2025)."
    },
    {
      question: "What is the pass rate for Columbia University?",
      answer: "Columbia has a graduation rate of 96% and an extremely selective acceptance rate of 6%."
    },
    {
      question: "How many students are at Columbia University?",
      answer: "Columbia University has a total student population of approximately 32,000 students."
    },
    {
      question: "How hard is it to get into Columbia University?",
      answer: "With an acceptance rate of only 6%, getting into Columbia is extremely competitive, requiring exceptional academic merit and outstanding extracurricular leadership."
    },
    {
      question: "Is Columbia University accredited?",
      answer: "Yes, it is accredited by the Middle States Commission on Higher Education (MSCHE)."
    },
    {
      question: "Who are the notable alumni of Columbia University and what are their professions?",
      answer: "Notable alumni include Barack Obama (former US President), Warren Buffett (legendary Investor), Spike Lee (renowned Filmmaker), Ruth Bader Ginsburg (Supreme Court Justice), and Alicia Keys (Grammy-winning Singer)."
    }
  ]
};

const ColumbiaPage = () => {
  return <UniversityDetailTemplate 
      uniData={columbiaData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default ColumbiaPage;
