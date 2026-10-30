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
  totalStudents: 35173, // NCES College Navigator, Fall 2024
  studentFacultyRatio: "6:1",
  acceptanceRate: "4%", // undergraduate, Fall 2024
  accreditation: "Middle States Commission on Higher Education (MSCHE)",
  avgStudyCost: "INR 62 L", // Columbia Engineering MS 2025-26: $2,700/point x 24 points at 1 USD = ₹95
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
    { name: "SEP'2027", status: "Fall entry; deadlines vary by program" }
  ],
  requirements: [
    { 
      title: "Exams Required", 
      detail: "TOEFL iBT / IELTS Academic / PTE Academic for English proficiency proof. GRE/GMAT score is optional or required depending on the course." 
    }
  ],
  rankings: {
    "QS Rankings": [
      { category: "World University Rankings - 2027", rank: "43" }
    ]
  },
  coursesFees: [
    { name: "MS in Financial Engineering", duration: "24 Months", tuition: 46 } // 36 points x $2,700 (2025-26) = $97,200 for the program, about $48,600 a year at 1 USD = ₹95
  ],
  longDescription: `Columbia University, established in 1754, has a rich history as one of the oldest institutions of higher education in the United States. Over the years, it has grown into a prestigious university known for its rigorous academic standards and commitment to research and innovation.

With a total enrollment of about 35,000 students (Fall 2024), you will find a vibrant and diverse student body, with a large share of international students that creates a multicultural environment.

Located in the heart of New York City, Columbia's campus features a blend of historic and modern architecture. Key facilities include:
• The Butler Library, one of the largest university libraries in the country
• The Lenfest Center for the Arts, showcasing contemporary art and performances
• The Columbia University Medical Center, a leader in medical research and education

Columbia offers a wide range of programs that align with industry demands. Some popular programs include:
• Business Administration
• Engineering and Applied Science
• Journalism
• International and Public Affairs

Admission is highly selective: Columbia admitted about 4% of undergraduate applicants for Fall 2024. Most graduate programs admit students for the fall term. Columbia provides robust support services for international students, ensuring a smooth transition and a fulfilling academic journey.

Columbia University is accredited by the following bodies:
• Middle States Commission on Higher Education
• Program-level accreditors such as ABET (engineering) and AACSB (business)

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
      "Meta",
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
    { name: "Madeleine Albright", profession: "U.S. Secretary of State" },
    { name: "Ruth Bader Ginsburg", profession: "Supreme Court Justice" },
    { name: "Kathryn Bigelow", profession: "Film Director" }
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
      answer: "Yes, Columbia University is one of the world's most prestigious Ivy League research universities, ranked #43 in the QS World University Rankings 2027."
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
      answer: "Yes, it enrols a large international student body, and its International Students and Scholars Office provides visa, CPT and OPT guidance."
    },
    {
      question: "What is the ranking of Columbia University?",
      answer: "Columbia is ranked #43 in the QS World University Rankings 2027."
    },
    {
      question: "What is the pass rate for Columbia University?",
      answer: "Columbia's six-year graduation rate is 96% (students who began in Fall 2018), and about 4% of undergraduate applicants were admitted for Fall 2024."
    },
    {
      question: "How many students are at Columbia University?",
      answer: "Columbia had a total enrollment of about 35,173 students in Fall 2024 (9,164 undergraduate and 26,009 graduate)."
    },
    {
      question: "How hard is it to get into Columbia University?",
      answer: "With only about 4% of undergraduate applicants admitted, getting into Columbia is extremely competitive, requiring exceptional academic merit and outstanding extracurricular leadership."
    },
    {
      question: "Is Columbia University accredited?",
      answer: "Yes, it is accredited by the Middle States Commission on Higher Education (MSCHE)."
    },
    {
      question: "Who are the notable alumni of Columbia University and what are their professions?",
      answer: "Notable alumni include Barack Obama (former US President), Warren Buffett (investor), Madeleine Albright (U.S. Secretary of State), Ruth Bader Ginsburg (Supreme Court Justice), and Kathryn Bigelow (film director)."
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
