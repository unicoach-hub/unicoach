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
  totalStudents: 27280,
  intlStudents: 8200,
  type: "PUBLIC",
  logo: "/assets/usa/northeastern/logo.png",
  heroImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200",
  topCourses: [
    { name: "Computer Science", count: 1 },
    { name: "Information Systems", count: 1 },
    { name: "Data Science", count: 1 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "TOEFL iBT Score", detail: "90+ minimum cutoff required for admissions." },
    { title: "IELTS Academic Band", detail: "6.5+ minimum band required for English proficiency." },
    { title: "GRE General Score", detail: "Optional / waived for students with strong GPA or relevant work history." },
    { title: "Undergraduate GPA", detail: "3.2+ on a 4.0 scale represents average target scores." }
  ],
  rankings: {
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "168" }
    ],
    "US News": [
      { category: "Best National Schools - 2025", rank: "53" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "375" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "185" }
    ]
  },
  coursesFees: [
    { name: "MS in Computer Science", duration: "24 Months", tuition: 48 },
    { name: "MS in Data Science", duration: "24 Months", tuition: 48 },
    { name: "MS in Information Systems", duration: "24 Months", tuition: 46 }
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
