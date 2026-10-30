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
  established: 1966,
  type: "PUBLIC",
  accreditation: "Public college of applied arts and technology, Ontario (main campus: Sarnia)",
  avgStudyCost: "INR 9.58 L",
  avgCostOfLiving: "INR 9.10 L",
  logo: "/logos/verified-Lambton College.png",
  heroImage: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200",
  topCourses: [
    { name: "Accounting", count: 1 },
    { name: "Artificial Intelligence / Machine Learning", count: 2 },
    { name: "Banking and Finance", count: 1 },
    { name: "Beauty", count: 1 },
    { name: "Business Administration", count: 2 }
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
  coursesFees: [],
  description: "Lambton College is a public college based in Sarnia, Ontario. Its Toronto location, which delivered select programs through a public-private partnership campus, is no longer accepting new students; new applicants are directed to the main campus in Sarnia.",
  longDescription: "Important: Lambton College in Toronto is no longer accepting new students. Lambton College itself is a public college whose main campus is in Sarnia, Ontario, and new applicants are directed there.\n\nThe notes below describe living costs in Toronto for reference.\n\nLiving in Toronto as an international student attending Lambton College can be a rewarding experience, but it comes with its financial considerations. Housing is typically the largest expense, with options ranging from shared accommodations to private apartments. On average, students can expect to spend a significant portion of their budget on rent and utilities.\n\nBooks and supplies are another necessary expense, although costs can vary depending on the program of study. Transportation costs are relatively manageable, thanks to Toronto's extensive public transit system. Personal expenses, including food, clothing, and entertainment, can add up, so budgeting is essential. Miscellaneous expenses might include health insurance, phone bills, and other unexpected costs.\n\nOverall, the cost of living in Toronto requires careful financial planning to ensure a comfortable and enjoyable stay.",
  studentLife: [
    "Student Groups and Organizations",
    "Libraries and Study Resources",
    "Labs and Research Facilities",
    "Athletic Facilities and Grounds",
    "Housing",
    "Social and Recreational Spots"
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
      "Visa and Work Permit Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "IBM", "RBC", "Rogers", "Sun Life Financial", "Desire2Learn", "CGI Inc."
    ]
  },
  faqs: [
    { question: "Is Lambton College - Toronto still open to new students?", answer: "No. Lambton College's Toronto location is no longer accepting new students. Lambton College is a public college with its main campus in Sarnia, Ontario, and new applicants are directed there." },
    { question: "How do I get admission to Lambton College?", answer: "Apply to programs at the main Sarnia campus with your transcripts and proof of English proficiency (such as IELTS). Requirements vary by program." },
    { question: "Is Lambton College public or private?", answer: "Lambton College is a public college in Ontario. Its Toronto programs were delivered through a public-private partnership campus, which no longer takes new students. Since 1 September 2024, programs delivered through such curriculum-licensing partnerships do not qualify for a Post-Graduation Work Permit (PGWP)." },
    { question: "What happens to students already studying at Lambton College in Toronto?", answer: "Former and current students should contact Lambton College's Office of the Registrar for transcripts and academic records." },
    { question: "What is the ranking of Lambton College - Toronto?", answer: "Lambton College ranks #108 nationally and #8308 globally in the Webometrics lists for 2023." },
    { question: "Is Lambton College recognised?", answer: "Yes. Lambton College is a public college of applied arts and technology in Ontario." },
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
