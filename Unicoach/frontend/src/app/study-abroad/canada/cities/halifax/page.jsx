import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Halifax
const universitiesData = getByCity('canada', 'Halifax');

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
    "Industrial Engineering", "Industrial Design", "Astronomy", "Interior Design", "Theatre",
    "Social Work", "Dental Studies", "Materials and Mineral Engineering", "Biochemistry",
    "Philosophy and Religious Studies", "History", "Public Health", "Civil Engineering",
    "Mechanical Engineering", "Electrical Engineering", "Engineering Science", "Law", "Music",
    "Banking and Finance", "Teaching / Education studies", "Language and Literature",
    "Social and Cultural Courses", "Film and TV production", "Journalism", "Creative Writing",
    "Sociology", "Political Science", "Nursing and midwifery", "Chemical Engineering",
    "Mathematics", "Statistics", "English language", "Photography", "Animation",
    "International Relations", "Geography", "Psychology", "Physics", "Accounting",
    "Earth Sciences / Geoscience", "Geology", "Environmental science / management",
    "Marine science", "Arts / Fine Art", "Graphic and Design Studies", "Creative Arts",
    "Fashion Design", "Crafts and textiles", "Product Design", "Biological Sciences",
    "Architecture", "Planning", "Sales And Marketing", "Human resource Management",
    "Business Administration", "Chemistry", "Pharmacology / Pharmacy", "Anthropology",
    "Medicine and Medical Studies", "Economics", "Computer Science", "Information technology",
    "Computer Engineering", "Environmental Engineering", "Management"
];

export default function HalifaxPage() {
    return (
        <CityUniversitiesTemplate
            cityName="Halifax"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Halifax</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Halifax, Nova Scotia"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}
