import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Sydney, Australia
const universitiesData = getByCity('australia', 'Sydney');

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
    { label: "Postgraduate", value: "postgraduate" }
  ],
  intake: [
    { label: "FEB", value: "feb" },
    { label: "JUL", value: "jul" },
    { label: "SEP", value: "sep" }
  ]
};

// All courses for filter
const allCourses = [
  "Industrial Engineering", "Engineering Design", "Industrial Design", "Physiotherapy",
  "Astronomy", "Speech Pathology", "Interior Design", "Social Work", "Dental Studies",
  "Animal and Veterinary Studies", "Materials and Mineral Engineering",
  "General Engineering And Technology", "Electronics", "Cyber Security",
  "Physical Sciences", "Biochemistry", "Information Systems",
  "Philosophy and Religious Studies", "History", "Media & Communication", "Commerce",
  "Public Health", "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
  "Biomedical Engineering", "Aerospace Engineering", "Mining Engineering",
  "Geomatic Engineering", "Engineering Science", "Petroleum Engineering", "Legal Studies",
  "Law", "Music", "Archaeology", "Banking and Finance", "Teaching / Education studies",
  "Risk Management", "Language and Literature", "Social and Cultural Courses",
  "Film and TV production", "Journalism", "Creative Writing", "Advertising", "Sociology",
  "Political Science", "Nursing and midwifery", "Chemical Engineering", "Mathematics",
  "Statistics", "Linguistic", "English language", "International Relations",
  "Behavioural Science", "Geography", "Psychology", "Sport / Exercise Science",
  "Business Analytics", "Physics", "Data Science", "Food / Agricultural Science",
  "Accounting", "Earth Sciences / Geoscience", "Geology",
  "Environmental science / management", "Marine science", "Human Geography",
  "Arts / Fine Art", "Graphic and Design Studies", "Creative Arts", "Fashion Design",
  "Biological Sciences", "Genetics", "Biotechnology", "Botany", "Architecture",
  "Construction Management", "Landscape design and architecture", "Planning", "Surveying",
  "International / Global Business", "Sales And Marketing", "Human resource Management",
  "Business Administration", "Project Management", "Innovation / Entrepreneurship",
  "Organisation Management", "Chemistry", "Data Analytics", "Pharmacology / Pharmacy",
  "Business Management", "Leadership Development", "Anthropology",
  "Medicine and Medical Studies", "Economics", "Computer Science",
  "Artificial Intelligence / Machine Learning", "Health Sciences / Administration",
  "Information technology", "Computer Engineering", "Environmental Engineering",
  "Software Engineering", "Management"
];

export default function SydneyPage() {
  return (
    <CityUniversitiesTemplate
      cityName="Sydney"
      // 👇 Page Header Texts — Customize anytime directly here:
      title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Sydney</span></>}
      subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
      badgeText="Study in Sydney, New South Wales"
      universitiesData={universitiesData}
      filterCategories={filterCategories}
      allCourses={allCourses}
    />
  );
}
