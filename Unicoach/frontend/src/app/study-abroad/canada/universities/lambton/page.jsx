import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const lambtonData = {
  name: "Lambton College - Toronto",
  country: "Canada",
  location: "Toronto, Ontario, Canada",
  city: "Toronto",
  established: 1969,
  totalStudents: 13000,
  intlStudents: 3500,
  type: "PUBLIC",
  studentFacultyRatio: "22:1",
  acceptanceRate: "70%",
  accreditation: "Ontario Ministry of Colleges and Universities",
  avgStudyCost: "INR 9.58 L",
  avgCostOfLiving: "INR 9.10 L",
  logo: "https://logo.clearbit.com/lambtoncollege.ca",
  heroImage: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200",
  topCourses: [
    { name: "Accounting", count: 1 },
    { name: "Artificial Intelligence / Machine Learning", count: 2 },
    { name: "Banking and Finance", count: 1 },
    { name: "Beauty", count: 1 },
    { name: "Business Administration", count: 2 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.0 minimum band required for admission, with no band less than 5.5." },
    { title: "TOEFL iBT Score", detail: "79+ minimum cutoff required for English proficiency verification." },
    { title: "Undergraduate/Secondary School Certificate", detail: "Successful graduation from secondary school or equivalent post-secondary studies." }
  ],
  rankings: {
    "Webometrics - National": [
      { category: "Best University Ranking Schools - 2023", rank: "108" },
      { category: "Best University Ranking Schools - 2022", rank: "119" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "8308" },
      { category: "Best World Ranking Schools - 2022", rank: "8712" }
    ]
  },
  coursesFees: [
    { name: "Advanced Diploma in Business Administration - Accounting", duration: "24 Months", tuition: 9.58 }
  ],
  description: "Living in Toronto as an international student attending Lambton College can be a rewarding experience, but it comes with its financial considerations. Housing is typically the largest expense, with options ranging from shared accommodations to private apartments.",
  longDescription: "Living in Toronto as an international student attending Lambton College can be a rewarding experience, but it comes with its financial considerations. Housing is typically the largest expense, with options ranging from shared accommodations to private apartments. On average, students can expect to spend a significant portion of their budget on rent and utilities.\n\nBooks and supplies are another necessary expense, although costs can vary depending on the program of study. Transportation costs are relatively manageable, thanks to Toronto's extensive public transit system. Personal expenses, including food, clothing, and entertainment, can add up, so budgeting is essential. Miscellaneous expenses might include health insurance, phone bills, and other unexpected costs.\n\nOverall, the cost of living in Toronto requires careful financial planning to ensure a comfortable and enjoyable stay.",
  studentLife: [
    "Student Groups and Organizations",
    "Libraries and Study Resources",
    "Labs and Research Facilities",
    "Athletic Facilities and Grounds",
    "Housing",
    "Social and Recreational Spots"
  ],
  alumni: [
    { name: "Sarah Taylor", profession: "Entrepreneur" },
    { name: "Michael Chang", profession: "Award-winning Chef" },
    { name: "Emily Patel", profession: "Humanitarian" }
  ],
  costOfLiving: {
    description: "Living in Toronto as an international student attending Lambton College can be a rewarding experience, but it comes with its financial considerations. Housing is typically the largest expense, with options ranging from shared accommodations to private apartments. On average, students can expect to spend a significant portion of their budget on rent and utilities. Books and supplies are another necessary expense, although costs can vary depending on the program of study. Transportation costs are relatively manageable, thanks to Toronto's extensive public transit system. Personal expenses, including food, clothing, and entertainment, can add up, so budgeting is essential. Miscellaneous expenses might include health insurance, phone bills, and other unexpected costs.",
    inr: "9.10 L",
    usd: "USD 10,706",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 5.00 L" },
      { name: "Food & Groceries", value: "INR 1.80 L" },
      { name: "Books & Supplies", value: "INR 0.60 L" },
      { name: "Transportation", value: "INR 0.50 L" },
      { name: "Personal Expenses", value: "INR 1.20 L" }
    ]
  },
  placements: {
    description: "Lambton College offers comprehensive placement and career services to help students get ready for the job market. They organize career fairs, workshops, resume writing classes, and interview preparation sessions. The college has strong ties with local employers in Toronto, facilitating internships, co-ops, and post-graduation employment opportunities.",
    services: [
      "Internships and Placement Support",
      "Online Job Portal",
      "OPT and CPT Guidance",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "IBM", "RBC", "Rogers", "Sun Life Financial", "Desire2Learn", "CGI Inc."
    ]
  },
  faqs: [
    { question: "Is Lambton College - Toronto a good university?", answer: "Yes, Lambton College - Toronto is a highly chosen institution for international students seeking post-secondary diplomas, advanced diplomas, and post-graduate certificates." },
    { question: "How do I get admission to Lambton College - Toronto?", answer: "Admission requires submitting an online application with transcripts, proof of high school graduation, and proof of English proficiency (like IELTS)." },
    { question: "Is Lambton College - Toronto public or private?", answer: "Lambton College is a public college. Its programs in Toronto are offered in partnership, making it a great destination for international students looking for public college credentials." },
    { question: "Why choose Lambton College - Toronto?", answer: "It offers public college programs in the heart of Toronto, providing students with access to key employment opportunities, transit, and city life." },
    { question: "Is Lambton College - Toronto good for international students?", answer: "Yes, the campus is tailored to international students, offering excellent support networks, immigration consulting assistance, and employment workshops." },
    { question: "What is the ranking of Lambton College - Toronto?", answer: "Lambton College ranks #108 nationally and #8308 globally in the Webometrics lists for 2023." },
    { question: "What is the pass rate for Lambton College - Toronto?", answer: "The college has strong graduation and student satisfaction rates, leading to outstanding post-graduation work opportunities." },
    { question: "How many students are at Lambton College - Toronto?", answer: "It has a total enrollment of approximately 13,000 students, including a vibrant international student population of 3,500." },
    { question: "How hard is it to get into Lambton College - Toronto?", answer: "The acceptance rate is around 70%, which makes it accessible for eligible international applicants." },
    { question: "Is Lambton College - Toronto accredited?", answer: "Yes, all programs are approved and accredited by the Ontario Ministry of Colleges and Universities." },
    { question: "Who are the notable alumni of Lambton College - Toronto and what are their professions?", answer: "Notable alumni are successful leaders in their fields, including Sarah Taylor (Entrepreneur), Michael Chang (Chef), and Emily Patel (Humanitarian)." }
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

const LambtonPage = () => {
  return <UniversityDetailTemplate 
      uniData={lambtonData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default LambtonPage;
