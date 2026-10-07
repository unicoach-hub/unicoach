import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Edinburgh
const universitiesData = getByCity('uk', 'Edinburgh');

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
        { label: "JAN", value: "jan" },
        { label: "SEP", value: "sep" }
    ]
};

// All courses for filter
const allCourses = [
    "Physiotherapy", "Astronomy", "Speech Pathology", "Theatre", "Dental Studies",
    "Animal and Veterinary Studies", "Electronics", "Cyber Security", "Biochemistry",
    "Information Systems", "Philosophy and Religious Studies", "History", "Media & Communication",
    "Public Health", "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
    "Petroleum Engineering", "Law", "Music", "Banking and Finance", "Risk Management",
    "Language and Literature", "Film and TV production", "Journalism", "Sociology",
    "Political Science", "Nursing and midwifery", "Radiography", "Chemical Engineering",
    "Mathematics", "Photography", "International Relations", "Geography", "Psychology",
    "Sport / Exercise Science", "Physics", "Data Science", "Food / Agricultural Science",
    "Animal Husbandry", "Accounting", "Earth Sciences / Geoscience", "Geology",
    "Environmental science / management", "Arts / Fine Art", "Graphic and Design Studies",
    "Biological Sciences", "Genetics", "Biotechnology", "Architecture", "Construction Management",
    "International / Global Business", "Sales And Marketing", "Human resource Management",
    "Business Administration", "Project Management", "Farm and Agribusiness", "Chemistry",
    "Food And Hospitality", "Pharmacology / Pharmacy", "Business Management", "Tourism",
    "Medicine and Medical Studies", "Economics", "Computer Science", "Artificial Intelligence / Machine Learning",
    "Health Sciences / Administration", "Information technology", "Software Engineering", "Management"
];

export default function EdinburghPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Edinburgh"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Edinburgh</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Edinburgh, Scotland"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}
