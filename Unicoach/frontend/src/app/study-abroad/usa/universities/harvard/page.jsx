import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';

export const harvardData = {
  name: "Harvard University",
  location: "Cambridge, Massachusetts, USA",
  city: "Cambridge",
  established: 1636,
  totalStudents: 24317, // harvard.edu/about (undergraduate + graduate)
  intlStudents: 6800, // approx., Harvard figure reported in 2025
  type: "PRIVATE",
  logo: "/assets/usa/harvard/logo_icon.png",
  heroImage: "/assets/usa/harvard/banner.jpg",
  topCourses: [
    { name: "Architecture", count: 1 },
    { name: "Data Science", count: 1 },
    { name: "Engineering Science", count: 1 },
    { name: "Political Science", count: 2 },
    { name: "Teaching / Education studies", count: 1 }
  ],
  intakeDeadlines: [
    { name: "AUG'2027", status: "Fall entry; deadlines vary by program" }
  ],
  requirements: [
    { title: "English Proficiency", detail: "TOEFL iBT or IELTS Academic required unless you qualify for a waiver; minimum scores vary by program." },
    { title: "GRE / GMAT", detail: "Required, optional or not accepted depending on the program. Check the department's admissions page." },
    { title: "Undergraduate Degree", detail: "A bachelor's degree equivalent to a U.S. four-year degree is generally expected. No single university-wide GPA cutoff is published." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "World University Rankings - 2027", rank: "5" }
    ]
  },
  coursesFees: [
    // ₹ Lakh/yr at 1 USD = ₹95. GSD Master's tuition 2026-27 $64,000; SEAS SM Data Science first year 2026-27 $67,504
    { name: "Master Of Architecture I", duration: "42 Months", tuition: 61 },
    { name: "SM in Data Science", duration: "18 Months", tuition: 64 }
  ],
  description: "Harvard is the oldest institution of higher learning in the United States. Founded in 1636, it is devoted to excellence in teaching, learning, and research, and to developing leaders in many disciplines who make a difference globally."
};

const HarvardPage = () => {
  return (
    <UniversityDetailTemplate 
      uniData={harvardData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />
  );
};

export default HarvardPage;
