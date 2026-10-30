import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const conestogaData = {
  name: "Conestoga College",
  country: "Canada",
  location: "Kitchener, Ontario, Canada",
  city: "Kitchener",
  established: 1967,
  type: "PUBLIC",
  accreditation: "Public college of applied arts and technology, Ontario",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 3.00 L",
  logo: "/logos/verified-Conestoga College.png",
  heroImage: "https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=1200",
  topCourses: [
    { name: "Accounting", count: 8 },
    { name: "Advertising", count: 2 },
    { name: "Aerospace Engineering", count: 3 },
    { name: "Animal Husbandry", count: 1 },
    { name: "Animal and Veterinary Studies", count: 1 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Closed" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.0 - 6.5 minimum band required for admission, with no band less than 5.5 - 6.0." },
    { title: "TOEFL iBT Score", detail: "80+ minimum cutoff required for English proficiency verification." },
    { title: "Undergraduate Degree", detail: "Relevant academic background or equivalent with good academic standing." }
  ],
  rankings: {
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "6008" },
      { category: "Best World Ranking Schools - 2022", rank: "6003" }
    ],
    "Webometrics - National": [
      { category: "Best University Ranking Schools - 2023", rank: "77" },
      { category: "Best University Ranking Schools - 2022", rank: "79" }
    ]
  },
  coursesFees: [],
  description: "Conestoga College is a public college founded by the Government of Ontario in 1967. Its main campus, Doon, is in Kitchener, and it has several other locations in the region. It is known for practical, career-focused diplomas, graduate certificates and degrees.",
  longDescription: "Conestoga College is a public college founded by the Government of Ontario in 1967. Its main campus, Doon, is in Kitchener, and it has several other locations in the region. It is known for practical, career-focused diplomas, graduate certificates and degrees.",
  studentLife: [
    "Student Groups and Organizations",
    "Libraries and Study Resources",
    "Labs and Research Facilities",
    "Athletic Facilities and Grounds",
    "Housing",
    "Social and Recreational Spots",
    "Special Attractions"
  ],
  // Alumni removed until each name can be checked against a reliable source
  alumni: null,
  costOfLiving: {
    description: "Attending Conestoga College in Kitchener as an international student involves several living expenses. Housing is often the most significant cost, with options ranging from on-campus residences to off-campus apartments. Students should budget for books and supplies, which are essential for academic success. Transportation costs can vary depending on whether students use public transit or have a personal vehicle. Personal expenses, including clothing, entertainment, and dining out, should also be considered. Miscellaneous expenses might include health insurance, phone bills, and other unexpected costs. Overall, the cost of living in Kitchener is moderate compared to larger Canadian cities, but students should plan carefully to ensure they can cover all necessary expenses while studying.",
    inr: "8.20 L",
    usd: "USD 9,647",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 4.50 L" },
      { name: "Food & Groceries", value: "INR 1.80 L" },
      { name: "Books & Supplies", value: "INR 0.60 L" },
      { name: "Transportation", value: "INR 0.50 L" },
      { name: "Personal Expenses", value: "INR 0.80 L" }
    ]
  },
  placements: {
    description: "Conestoga College offers a comprehensive range of placement assistance services for international students to help them transition into the workforce. Career counselling is available to guide students in exploring career options, developing job search strategies, and enhancing their employability skills. Workshops and seminars are regularly conducted on topics such as resume writing, interview skills, and job search techniques. Recent examples include a LinkedIn networking workshop and a virtual job fair preparation seminar. Conestoga College organizes job fairs and networking events throughout the year, connecting students with potential employers. Some of the job fairs listed on the website include the Career and Summer Job Fair and the Tech Talent job fair.",
    services: [
      "Internships and Placement Support",
      "Online Job Portal",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "BlackBerry",
      "Manulife",
      "Sun Life Financial",
      "CGI Inc.",
      "Desire2Learn",
      "Toyota Motor Manufacturing Canada",
      "Google",
      "RBC",
      "OpenText",
      "The Economical Insurance Group"
    ]
  },
  faqs: [
    { question: "Is Conestoga College a good college?", answer: "Conestoga is a large public college in Ontario, known for practical training and industry partnerships." },
    { question: "How do I get admission to Conestoga College?", answer: "Admission requires submitting an online application, transcripts, and proof of English proficiency (like IELTS or TOEFL). Criteria vary by program." },
    { question: "Is Conestoga College public or private?", answer: "Conestoga College is a public college established in 1967, funded by the Ontario provincial government." },
    { question: "Why choose Conestoga College?", answer: "Students choose Conestoga College for its modern campuses, industry-aligned programs, career support, and lower cost of living compared to larger metropolitan areas." },
    { question: "Is Conestoga College good for international students?", answer: "Conestoga has one of the largest international student populations among Canadian colleges and offers orientation and support services for international students." },
    { question: "What is the ranking of Conestoga College?", answer: "Colleges such as Conestoga are not ranked by QS. Webometrics placed it #77 in Canada and #6008 globally in 2023." },
    { question: "Is Conestoga College recognised?", answer: "Yes. Conestoga is a public college under Ontario law. Some programs also hold accreditation from professional bodies; check the program page." },
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

const ConestogaPage = () => {
  return <UniversityDetailTemplate 
      uniData={conestogaData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default ConestogaPage;
