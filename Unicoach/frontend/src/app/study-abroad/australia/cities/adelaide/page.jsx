'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';
import { getByCity } from '@/data/universities';

// University Data for Adelaide, Australia imported from central master dataset
const universitiesData = getByCity('australia', 'Adelaide');

// Filter Categories
const filterCategories = {
  fees: [
    { label: "Max ₹10 Lacs", value: "10" },
    { label: "Max ₹20 Lacs", value: "20" },
    { label: "Max ₹30 Lacs", value: "30" },
    { label: "Max ₹40 Lacs", value: "40" },
    { label: "₹40 Lacs +", value: "40+" }
  ],
  degree: [
    { label: "Ph.D.", value: "phd" },
    { label: "PG Diploma / Certificate", value: "pg-diploma" },
    { label: "Undergraduate", value: "undergraduate" },
    { label: "UG Diploma / Certificate / Associate Degree", value: "ug-diploma" },
    { label: "Postgraduate", value: "postgraduate" }
  ],
  intake: [
    { label: "FEB", value: "feb" },
    { label: "MAR", value: "mar" },
    { label: "MAY", value: "may" },
    { label: "JUL", value: "jul" },
    { label: "SEP", value: "sep" }
  ]
};

// All courses for filter
const allCourses = [
  "Industrial Design", "Physiotherapy", "Speech Pathology", "Interior Design",
  "Social Work", "Dental Studies", "Animal and Veterinary Studies", "Cyber Security",
  "Philosophy and Religious Studies", "History", "Media & Communication", "Commerce",
  "Public Health", "Game Development", "Civil Engineering", "Mechanical Engineering",
  "Electrical Engineering", "Biomedical Engineering", "Aerospace Engineering",
  "Mining Engineering", "Petroleum Engineering", "Legal Studies", "Law", "Music",
  "Banking and Finance", "Teaching / Education studies", "Language and Literature",
  "Social and Cultural Courses", "Journalism", "Sociology", "Political Science",
  "Nursing and midwifery", "Chemical Engineering", "Mathematics", "Animation",
  "International Relations", "Behavioural Science", "Geography", "Psychology",
  "Sport / Exercise Science", "Business Analytics", "Physics", "Data Science",
  "Food / Agricultural Science", "Accounting", "Earth Sciences / Geoscience",
  "Environmental science / management", "Arts / Fine Art", "Graphic and Design Studies",
  "Creative Arts", "Biological Sciences", "Biotechnology", "Architecture",
  "Landscape design and architecture", "Planning", "Sales And Marketing",
  "Human resource Management", "Business Administration", "Chemistry", "Food And Hospitality",
  "Pharmacology / Pharmacy", "Business Management", "Tourism", "Anthropology",
  "Medicine and Medical Studies", "Economics", "Computer Science",
  "Artificial Intelligence / Machine Learning", "Health Sciences / Administration",
  "Information technology", "Environmental Engineering", "Software Engineering"
];

export default function AdelaidePage() {
  return (
    <CityUniversitiesTemplate
      cityName="Adelaide"
      // 👇 Page Header Texts — Customize anytime directly here:
      title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Adelaide</span></>}
      subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
      badgeText="Study in Adelaide, South Australia"
      universitiesData={universitiesData}
      filterCategories={filterCategories}
      allCourses={allCourses}
    />
  );
}
