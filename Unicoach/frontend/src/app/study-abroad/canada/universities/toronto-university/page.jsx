import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const torontoData = {
  name: "University of Toronto",
  country: "Canada",
  location: "Toronto, Ontario, Canada",
  city: "Toronto",
  established: 1827,
  totalStudents: 84000,
  intlStudents: 20160,
  type: "PUBLIC",
  studentFacultyRatio: "16:1",
  acceptanceRate: "43%",
  accreditation: "Association of Universities and Colleges of Canada (AUCC)",
  avgStudyCost: "INR 6.00 L",
  avgCostOfLiving: "INR 3.00 L",
  logo: "https://logo.clearbit.com/utoronto.ca",
  heroImage: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1200",
  topCourses: [
    { name: "Aerospace Engineering", count: 1 },
    { name: "Architecture", count: 1 },
    { name: "Banking and Finance", count: 1 },
    { name: "Biomedical Engineering", count: 1 },
    { name: "Business Administration", count: 4 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "MAR'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "7.0 minimum band required for admission, with no band less than 6.5." },
    { title: "TOEFL iBT Score", detail: "100+ minimum cutoff required for English proficiency verification." },
    { title: "Undergraduate Degree", detail: "Four-year bachelor's degree with a minimum GPA of B+ or equivalent." }
  ],
  rankings: {
    "Webometrics - National": [
      { category: "Best Schools - 2023", rank: "1" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "25" },
      { category: "Best World Ranking Schools - 2024", rank: "21" },
      { category: "Best World Ranking Schools - 2023", rank: "34" },
      { category: "Best World Ranking Schools - 2022", rank: "26" }
    ],
    "Times Higher Ranking": [
      { category: "Best National Schools - 2025", rank: "1" }
    ]
  },
  coursesFees: [
    { name: "Master of Applied Science (MASc) Aerospace Engineering", duration: "20 Months", tuition: 38.23 }
  ],
  description: "The University of Toronto, established in 1827, has grown into one of the leading institutions of higher education in Canada and the world. With a rich history that spans over a century, it has evolved into a vibrant academic community known for its research excellence and diverse programs.",
  longDescription: "The University of Toronto, established in 1827, has grown into one of the leading institutions of higher education in Canada and the world. With a rich history that spans over a century, it has evolved into a vibrant academic community known for its research excellence and diverse programs.\n\nWith a total enrollment of 84000, you will find a dynamic student body that includes 20160 international students from various countries. This diversity enriches the campus experience, fostering a global perspective among students.\n\nThe university is located in Toronto, offering a beautiful and urban campus environment. Key facilities include:\n- State-of-the-art libraries\n- Research centers\n- Modern classrooms and laboratories\n- Student recreation and wellness centers\n\nThe University of Toronto offers a wide range of programs that are aligned with industry needs. Some popular programs include:\n- Engineering\n- Business Administration\n- Computer Science\n- Health Sciences\n\nThe acceptance rate stands at 43%, with multiple intake periods throughout the year. The university provides extensive support services for international students, ensuring a smooth transition and a successful academic journey.\n\nIn conclusion, the University of Toronto stands out for its commitment to quality education and career readiness, preparing you to excel in your chosen field.",
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
    { name: "Margaret Atwood", profession: "Author" },
    { name: "Lester B. Pearson", profession: "Prime Minister" },
    { name: "Donald Sutherland", profession: "Actor" },
    { name: "Roberta Bondar", profession: "Astronaut" },
    { name: "David Suzuki", profession: "Environmental Activist" }
  ],
  costOfLiving: {
    description: "The estimated yearly cost of living for an international student attending the University of Toronto is a crucial factor to consider when planning your education abroad. Toronto, being a vibrant and multicultural city, offers a range of living experiences, but it also comes with its costs. Housing is one of the most significant expenses, with options ranging from on-campus residences to off-campus apartments. Books and supplies are another essential cost, as academic materials are necessary for success in your studies. Transportation costs can vary depending on your proximity to the campus and your preferred mode of travel. Personal expenses include daily necessities and leisure activities, which are vital for a balanced student life. Miscellaneous expenses cover unexpected costs that may arise during your stay. Overall, the cost of living in Toronto requires careful budgeting to ensure a comfortable and fulfilling student experience.",
    inr: "10.08 L",
    usd: "USD 11,859",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 5.50 L" },
      { name: "Food & Groceries", value: "INR 2.00 L" },
      { name: "Books & Supplies", value: "INR 0.80 L" },
      { name: "Transportation", value: "INR 0.60 L" },
      { name: "Personal & Misc", value: "INR 1.18 L" }
    ]
  },
  placements: {
    description: "The University of Toronto provides extensive placement assistance for international students to help them transition into the workforce. The university offers career counselling services to assist students in exploring various career paths and developing their job search strategies. Additionally, the university organizes workshops and seminars on topics such as resume writing, interview skills, and networking. Recent examples include a virtual career fair featuring top employers and a workshop on navigating the job market during the pandemic.",
    services: [
      "Internships and Placement Support",
      "Online Job Portal",
      "OPT and CPT Guidance",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Google", "Amazon", "Royal Bank of Canada", "Deloitte", "IBM",
      "McKinsey & Company", "Bell", "CIBC", "Toronto-Dominion Bank", "Scotiabank",
      "RevOps", "Accenture", "BMO Financial Group", "Manulife", "Shopify",
      "PwC", "Microsoft", "Sun Life Financial", "Rogers Communications", "Canadian Tire Corporation"
    ]
  },
  faqs: [
    { question: "Is University of Toronto a good university?", answer: "Yes, the University of Toronto is consistently ranked as the top university in Canada and one of the top public universities in the world." },
    { question: "How do I get admission to University of Toronto?", answer: "Admission is highly competitive and is based on excellent academic standing, specific course requirements, and proof of English proficiency." },
    { question: "Is University of Toronto public or private?", answer: "The University of Toronto is a public research university funded by the province of Ontario." },
    { question: "Why choose University of Toronto?", answer: "It offers world-class research opportunities, a prestigious global reputation, top-tier faculty, and a vibrant location in downtown Toronto." },
    { question: "Is University of Toronto good for international students?", answer: "Yes, it hosts over 20,000 international students and provides extensive academic, career, and personal support systems." },
    { question: "What is the ranking of University of Toronto?", answer: "It is ranked #1 in Canada by Webometrics and Times Higher Education, and #25 globally in the 2025 QS World University Rankings." },
    { question: "What is the pass rate for University of Toronto?", answer: "The graduation and success rates are extremely high, with graduates highly sought after by top global employers." },
    { question: "How many students are at University of Toronto?", answer: "It has a total enrollment of approximately 84,000 students, including over 20,160 international students." },
    { question: "How hard is it to get into University of Toronto?", answer: "With an acceptance rate of 43%, admission is competitive, particularly for popular programs like Engineering and Computer Science." },
    { question: "Is University of Toronto accredited?", answer: "Yes, it is accredited by the Association of Universities and Colleges of Canada (AUCC) and the Association of American Universities (AAU)." },
    { question: "Who are the notable alumni of University of Toronto and what are their professions?", answer: "Notable alumni include Margaret Atwood (Author), Lester B. Pearson (Prime Minister), Donald Sutherland (Actor), Roberta Bondar (Astronaut), and David Suzuki (Environmental Activist)." }
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

const TorontoPage = () => {
  return <UniversityDetailTemplate 
      uniData={torontoData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default TorontoPage;
