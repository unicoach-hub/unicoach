import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const northeasternData = {
  name: "Northeastern University",
  location: "Boston, Massachusetts, USA",
  city: "Boston",
  established: 1898,
  totalStudents: 32553, // NCES College Navigator, Fall 2024 (Boston)
  type: "PRIVATE",
  logo: "/assets/usa/northeastern/logo.png",
  heroImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200",
  topCourses: [
    { name: "Computer Science", count: 1 },
    { name: "Information Systems", count: 1 },
    { name: "Data Science", count: 1 }
  ],
  intakeDeadlines: [
    { name: "JAN'2027", status: "Spring entry (many programs)" },
    { name: "SEP'2027", status: "Fall entry" }
  ],
  requirements: [
    { title: "English Proficiency", detail: "TOEFL iBT or IELTS Academic required unless you qualify for a waiver; minimum scores vary by program." },
    { title: "GRE / GMAT", detail: "Required, optional or not accepted depending on the program. Check the department's admissions page." },
    { title: "Undergraduate Degree", detail: "A bachelor's degree equivalent to a U.S. four-year degree is generally expected. No single university-wide GPA cutoff is published." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "World University Rankings - 2027", rank: "385" }
    ]
  },
  coursesFees: [
    // Khoury College 2026-27: $1,922 per credit x 16 credits a year = $30,752 = ₹29 Lakh at 1 USD = ₹95
    { name: "MS in Computer Science", duration: "24 Months", tuition: 29 },
    { name: "MS in Data Science", duration: "24 Months", tuition: 29 },
    { name: "MS in Information Systems", duration: "24 Months", tuition: 29 }
  ],
  description: "Northeastern University is a private research university with its main campus in Boston. Established in 1898, the university is renowned for its cooperative education program ('co-op'), which integrates classroom study with professional experience on seven continents."
};

const NortheasternPage = () => {
  return <UniversityDetailTemplate 
      uniData={northeasternData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default NortheasternPage;
