import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Dublin, Ireland
const universitiesData = getByCity('ireland', 'Dublin');

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
        { label: "JAN", value: "jan" },
        { label: "SEP", value: "sep" }
    ]
};

// All courses for filter
const allCourses = [
    "Physiotherapy", "Theatre", "Dental Studies", "Animal and Veterinary Studies",
    "Cyber Security", "Philosophy and Religious Studies", "History",
    "Media & Communication", "Civil Engineering", "Mechanical Engineering",
    "Electrical Engineering", "Biomedical Engineering", "Law", "Music",
    "Banking and Finance", "Teaching / Education studies", "Language and Literature",
    "Social and Cultural Courses", "Journalism", "Sociology", "Political Science",
    "Nursing and midwifery", "Chemical Engineering", "Mathematics",
    "International Relations", "Geography", "Psychology", "Physics",
    "Data Science", "Food / Agricultural Science", "Accounting", "Geology",
    "Environmental science / management", "Arts / Fine Art", "Graphic and Design Studies",
    "Biological Sciences", "Architecture", "Sales And Marketing",
    "Business Administration", "Chemistry", "Food And Hospitality", "Data Analytics",
    "Pharmacology / Pharmacy", "Business Management", "Tourism",
    "Medicine and Medical Studies", "Economics", "Computer Science",
    "Information technology", "Environmental Engineering", "Software Engineering",
    "Management", "Artificial Intelligence / Machine Learning", "Engineering Science",
    "Public Health", "Biotechnology", "Film and TV production", "Advertising"
];

export default function DublinPage() {
    return (
        <CityUniversitiesTemplate
            cityName="Dublin"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Dublin</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Dublin, Ireland"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}
