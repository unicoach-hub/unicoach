import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Edmonton
const universitiesData = getByCity('canada', 'Edmonton');

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
        { label: "MAY", value: "may" },
        { label: "SEP", value: "sep" }
    ]
};

// All courses for filter
const allCourses = [
    "Industrial Engineering", "Physiotherapy", "Astronomy", "Speech Pathology", "Interior Design",
    "Theatre", "Social Work", "Dental Studies", "Animal and Veterinary Studies", "Materials and Mineral Engineering",
    "General Engineering And Technology", "Electronics", "Cyber Security", "Physical Sciences",
    "Biochemistry", "Information Systems", "Philosophy and Religious Studies", "History",
    "Media & Communication", "Commerce", "Public Health", "Civil Engineering", "Mechanical Engineering",
    "Electrical Engineering", "Biomedical Engineering", "Mining Engineering", "Engineering Science",
    "Petroleum Engineering", "Law", "Music", "Archaeology", "Banking and Finance",
    "Teaching / Education studies", "Language and Literature", "Social and Cultural Courses",
    "Journalism", "Creative Writing", "Sociology", "Political Science", "Nursing and midwifery",
    "Chemical Engineering", "Mathematics", "Statistics", "Linguistic", "English language",
    "International Relations", "Behavioural Science", "Geography", "Psychology", "Sport / Exercise Science",
    "Business Analytics", "Physics", "Food / Agricultural Science", "Forestry Studies", "Accounting",
    "Earth Sciences / Geoscience", "Geology", "Environmental science / management", "Human Geography",
    "Arts / Fine Art", "Graphic and Design Studies", "Creative Arts", "Biological Sciences",
    "Genetics", "Zoology", "Biotechnology", "Botany", "Architecture", "Landscape design and architecture",
    "Planning", "International / Global Business", "Sales And Marketing", "Human resource Management",
    "Business Administration", "Innovation / Entrepreneurship", "Organisation Management", "Chemistry",
    "Food And Hospitality", "Pharmacology / Pharmacy", "Business Management", "Anthropology",
    "Medicine and Medical Studies", "Economics", "Computer Science", "Health Sciences / Administration",
    "Information technology", "Computer Engineering", "Environmental Engineering", "Software Engineering",
    "Management"
];

export default function EdmontonPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Edmonton"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Edmonton</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Edmonton, Alberta"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}
