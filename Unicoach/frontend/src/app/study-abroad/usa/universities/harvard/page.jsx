import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';

export const harvardData = {
  name: "Harvard University",
  location: "Cambridge - Massachusetts, Massachusetts, USA",
  city: "Cambridge",
  established: 1636,
  totalStudents: 57786,
  intlStudents: 7274,
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
    { name: "JAN'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "TOEFL iBT Score", detail: "100+ minimum cutoff required for English proficiency verification." },
    { title: "IELTS Academic Band", detail: "7.5+ minimum band required for admission." },
    { title: "GRE General Score", detail: "Recommended for all engineering and scientific computational streams." },
    { title: "Undergraduate Degree", detail: "16 years of prior education expected with a GPA of 3.8+." }
  ],
  rankings: {
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "2" },
      { category: "Best University Ranking Schools - 2022", rank: "2" }
    ],
    "US News": [
      { category: "Best National Schools - 2025", rank: "3" },
      { category: "Best World Ranking Schools - 2023", rank: "1" },
      { category: "Best University Ranking Schools - 2022", rank: "2" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "4" },
      { category: "Best World Ranking Schools - 2023", rank: "5" },
      { category: "Best World Ranking Schools - 2022", rank: "5" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "1" }
    ]
  },
  coursesFees: [
    { name: "Master Of Architecture I", duration: "42 Months", tuition: 44 },
    { name: "MS in Computer Science", duration: "24 Months", tuition: 52 },
    { name: "MS in Data Science", duration: "18 Months", tuition: 52 }
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
