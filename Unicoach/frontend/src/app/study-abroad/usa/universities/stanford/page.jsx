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
  totalStudents: 18625, // NCES College Navigator, Fall 2024
  studentFacultyRatio: "6:1",
  acceptanceRate: "4%", // undergraduate, Fall 2024
  type: "PRIVATE",
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
    { name: "SEP'2027", status: "Autumn quarter entry" }
  ],
  requirements: [
    { title: "English Proficiency", detail: "An English test (TOEFL iBT) is required for most international applicants unless waived. Check Stanford Graduate Admissions for the current minimum and accepted tests." },
    { title: "GRE General Score", detail: "Requirement varies by department. Check your program's admissions page." },
    { title: "Undergraduate Degree", detail: "A bachelor's degree equivalent to a U.S. four-year degree. No university-wide GPA cutoff is published." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "World University Rankings - 2027", rank: "2" }
    ]
  },
  coursesFees: [
    // Engineering graduate tuition 2026-27: $23,239 x 3 quarters = $69,717 = ₹66 Lakh at 1 USD = ₹95
    { name: "MS in Computer Science", duration: "24 Months", tuition: 66 }
  ],
  description: "Stanford University is one of the world's leading research institutions. Located in Stanford, California, it is known for its academic strength and its close ties to Silicon Valley's technology companies and startups.",
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
