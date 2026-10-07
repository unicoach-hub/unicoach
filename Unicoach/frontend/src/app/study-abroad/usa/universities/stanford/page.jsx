import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


// Import local logo asset
import StanfordLogo from '@/assets/usa/Stanford/Stanford University.svg';

const stanfordData = {
  name: "Stanford University",
  location: "Stanford, California, USA",
  city: "Stanford",
  established: 1885,
  totalStudents: 15424,
  intlStudents: 2005,
  type: "PUBLIC",
  logo: StanfordLogo,
  heroImage: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=1200",
  topCourses: [
    { name: "Banking and Finance", count: 1 },
    { name: "Business Administration", count: 2 },
    { name: "Civil Engineering", count: 1 },
    { name: "Computer Science", count: 1 },
    { name: "Economics", count: 1 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "APR'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "TOEFL iBT Score", detail: "100+ minimum cutoff required for admissions." },
    { title: "IELTS Academic Band", detail: "7.5+ minimum band required for English proficiency." },
    { title: "GRE General Score", detail: "Required for Engineering and MS program admissions." },
    { title: "Undergraduate GPA", detail: "3.85+ on a 4.0 scale represents average target scores." }
  ],
  rankings: {
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "59" },
      { category: "Best World Ranking Schools - 2022", rank: "2" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "6" },
      { category: "Best World Ranking Schools - 2024", rank: "5" },
      { category: "Best World Ranking Schools - 2023", rank: "6" },
      { category: "Best World Ranking Schools - 2022", rank: "3" }
    ],
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "6" },
      { category: "Best World Ranking Schools - 2022", rank: "4" }
    ],
    "US News": [
      { category: "Best National Schools - 2025", rank: "4" },
      { category: "Best World Ranking Schools - 2023", rank: "9" }
    ],
    "Webometrics - National": [
      { category: "Best University Ranking Schools - 2022", rank: "2" }
    ]
  },
  coursesFees: [
    { name: "Msc Finance", duration: "18 Months", tuition: 60 },
    { name: "MS in Computer Science", duration: "24 Months", tuition: 60 }
  ],
  description: "Stanford University is one of the world's leading research institutions. Located in Stanford, California, it is known for its academic strength, close proximity to Silicon Valley tech giants, and exceptionally high rate of startup incubation.",
  blogs: [
    {
      title: "Fresher Jobs In USA For Indians In 2024: Top Roles, Salary & More",
      readTime: "11 mins read",
      date: "Mar 15, 2025"
    },
    {
      title: "How to Get into Stanford University from India?: Complete Guide!",
      readTime: "12 mins read",
      date: "Mar 15, 2025"
    },
    {
      title: "How to Get Job in USA for Indians in 2024: Easy Job Search Hurdles!",
      readTime: "11 mins read",
      date: "Mar 13, 2025"
    },
    {
      title: "Stanford University Scholarship For Indian Students 2025: Eligibility & Costs",
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
  ]
};

const StanfordPage = () => {
  return <UniversityDetailTemplate 
      uniData={stanfordData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default StanfordPage;
