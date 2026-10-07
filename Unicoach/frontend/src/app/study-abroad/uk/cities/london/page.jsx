'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';
import { getByCity } from '@/data/universities';

// University Data for London imported from central master dataset
const universitiesData = getByCity('uk', 'London');

// Filter Categories
const filterCategories = {
    fees: [
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
        { label: "MAY", value: "may" },
        { label: "AUG", value: "aug" },
        { label: "SEP", value: "sep" }
    ]
};

// All courses for filter
const allCourses = [
    "Computer Science", "Data Science", "Artificial Intelligence / Machine Learning",
    "Software Engineering", "Business Administration", "Banking and Finance", "Management",
    "Physiotherapy", "Law", "Medicine and Medical Studies", "Public Health", "Music",
    "Arts / Fine Art", "Product Design", "Fashion Design", "Graphic and Design Studies",
    "International Relations", "Anthropology", "History", "Media & Communication",
    "Creative Writing", "Journalism", "Construction Management", "General Engineering And Technology",
    "Biomedical Engineering", "Mechanical Engineering", "Civil Engineering", "Tourism"
];

export default function LondonPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="London"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">London</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in London, United Kingdom"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}
