import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const limerickData = {
  name: "University of Limerick",
  country: "Ireland",
  location: "Limerick, Limerick, Ireland",
  city: "Limerick",
  established: 1972,
  totalStudents: 16500,
  intlStudents: 2000,
  type: "PUBLIC",
  studentFacultyRatio: "20:1",
  acceptanceRate: "65%",
  accreditation: "Association to Advance Collegiate Schools of Business (AACSB)",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 3.00 L",
  logo: "https://logo.clearbit.com/ul.ie",
  heroImage: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1200",
  topCourses: [
    { name: "Accounting", count: 2 },
    { name: "Aerospace Engineering", count: 2 },
    { name: "Animal Husbandry", count: 1 },
    { name: "Architecture", count: 2 },
    { name: "Artificial Intelligence / Machine Learning", count: 3 }
  ],
  featuredCourse: {
    name: "MSc in Accounting",
    duration: "12 Months",
    tuition: 19.06
  },
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.5 minimum overall band, with no individual component below 6.0." },
    { title: "TOEFL iBT Score", detail: "90+ minimum score for most postgraduate programmes." },
    { title: "Undergraduate Degree", detail: "Second-class Honours grade 1 (2:1) or equivalent from a recognised institution." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "421" },
      { category: "Best National Schools - 2024", rank: "145 - 1500" },
      { category: "Best World Ranking Schools - 2024", rank: "421 - 1500" },
      { category: "Best World Ranking Schools - 2023", rank: "531 - 540" },
      { category: "Best World Ranking Schools - 2022", rank: "501 - 510" }
    ],
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "601 - 800" }
    ],
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "889" },
      { category: "Best World Ranking Schools - 2021", rank: "861" }
    ],
    "Complete University Guide": [
      { category: "Best National Schools - 2025", rank: "7" }
    ]
  },
  coursesFees: [
    { name: "Bachelor of Arts in Law and Accounting", duration: "48 Months", tuition: 17.23 },
    { name: "MSc in Accounting", duration: "12 Months", tuition: 19.06 },
    { name: "MSc in Computer Science", duration: "12 Months", tuition: 17.50 },
    { name: "MSc in Artificial Intelligence", duration: "12 Months", tuition: 18.00 },
    { name: "MSc in Engineering Management", duration: "12 Months", tuition: 16.50 }
  ],
  description: "The University of Limerick (UL), founded in 1972, is a vibrant and innovative institution situated on a beautiful 130-hectare riverside campus. AACSB-accredited and internationally recognised, UL is known for its world-class research, enterprise culture, and cooperative education model.",
  longDescription: "Welcome to the University of Limerick!\n\nFounded in 1972, the University of Limerick has grown steadily over the years, becoming a leading institution in higher education. With a total student enrolment of 16,500, including 2,000 international students, you will find a diverse and vibrant community at UL.\n\nThe campus is set in scenic surroundings along the River Shannon, offering a conducive environment for learning and growth. UL boasts outstanding facilities including:\n- State-of-the-art research laboratories and innovation hubs\n- The Glucksman Library — one of Ireland's finest academic libraries\n- UL Arena — a world-class indoor sports venue\n- On-campus village accommodation for students\n\nAt UL, we offer a wide range of popular programmes in:\n- Business Studies (AACSB-accredited)\n- Engineering and Science\n- Health Sciences and Nursing\n- Arts, Humanities, and Social Sciences\n\nOur acceptance rate is 65%, and we have intake periods throughout the year, providing flexibility for prospective students. The university provides robust international student support services.\n\nWe are proudly accredited by the Association to Advance Collegiate Schools of Business (AACSB), a testament to our commitment to academic excellence.",
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
    { name: "Michael Noonan", profession: "Politician" },
    { name: "Anne Enright", profession: "Author" },
    { name: "Martin Naughton", profession: "Business Leader" },
    { name: "James Lawless", profession: "Inventor" }
  ],
  costOfLiving: {
    description: "Limerick is significantly more affordable than Dublin, making it one of the best-value student cities in Ireland. UL's on-campus village accommodation provides convenient and cost-effective options for international students. The city offers great transport links, dining options, and social activities.",
    inr: "8.00 L",
    usd: "USD 9,412",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 4.00 L" },
      { name: "Food & Groceries", value: "INR 1.80 L" },
      { name: "Books & Supplies", value: "INR 0.50 L" },
      { name: "Transportation", value: "INR 0.70 L" },
      { name: "Personal & Misc", value: "INR 1.00 L" }
    ]
  },
  placements: {
    description: "The University of Limerick offers comprehensive placement assistance to international students. The Career Services department provides career counselling, workshops on resume writing, interview skills, and job search strategies, as well as job fairs and networking events. UL's strong relationships with multinational companies in Limerick's Shannon region ensure excellent career opportunities.",
    services: [
      "Internships and Placement Support",
      "OPT and CPT Guidance",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Dell Technologies", "Johnson & Johnson", "Regeneron", "Cook Medical", "Stryker",
      "UL Hospitals Group", "Limerick City Council", "CPC Logistics", "Shannon Aviation", "Analog Devices"
    ]
  },
  faqs: [
    { question: "Is the University of Limerick a good university?", answer: "Yes, UL is nationally ranked #7 and is among the top 421 universities in the world (QS 2025), particularly strong in engineering, business, and health sciences." },
    { question: "How do I get admission to the University of Limerick?", answer: "International applicants need a 2:1 Honours degree or equivalent, IELTS 6.5+, and must apply through the UL online application system." },
    { question: "Is the University of Limerick public or private?", answer: "The University of Limerick is a public university funded by the Irish government and Higher Education Authority." },
    { question: "Why choose the University of Limerick?", answer: "UL offers AACSB-accredited business programmes, a stunning riverside campus, strong co-operative placement programmes, and a more affordable cost of living than Dublin." },
    { question: "Is the University of Limerick good for international students?", answer: "Yes, UL has a dedicated International Education Division providing housing support, orientation programmes, and ongoing student welfare services." },
    { question: "What is the ranking of the University of Limerick?", answer: "The University of Limerick is ranked #421 in the QS World University Rankings 2025 and #7 in Ireland by the Complete University Guide 2025." },
    { question: "How many students are at the University of Limerick?", answer: "UL has approximately 16,500 students including 2,000 international students from across the world." },
    { question: "How hard is it to get into the University of Limerick?", answer: "With an acceptance rate of 65%, UL is reasonably accessible for qualified applicants while maintaining strong academic standards." }
  ],
  blogs: [
    { title: "Part-Time Jobs in Ireland for Students: Top Opportunities & Salary", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs in Ireland for Indians: Complete Details!", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Jobs in Ireland for Indians: How to find out job opportunities in 2024-2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ]
};

const LimerickPage = () => {
  return <UniversityDetailTemplate 
      uniData={limerickData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default LimerickPage;
