import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// Import local logo assets
import GeorgiaTechLogo from '@/assets/usa/Atlanta/Georgia Institute of Technology.png';
import EmoryLogo from '@/assets/usa/Atlanta/Emory University.png';
import GeorgiaStateLogo from '@/assets/usa/Atlanta/Georgia State University.png';

// University Data for Atlanta
const universitiesData = getByCity('usa', 'Atlanta');

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
        { label: "UG Diploma / Certificate / Associate Degree", value: "diploma" },
        { label: "Postgraduate", value: "postgraduate" }
    ],
    intake: [
        { label: "JAN", value: "jan" },
        { label: "AUG", value: "aug" }
    ]
};

// All courses for filter
const allCourses = [
    "Industrial Engineering", "Engineering Design", "Industrial Design",
    "Astronomy", "Theatre", "Social Work", "Materials and Mineral Engineering",
    "Manufacturing Engineering", "General Engineering And Technology",
    "Electronics", "Systems Engineering", "Cyber Security", "Robotics",
    "Physical Sciences", "Biochemistry", "Information Systems",
    "Philosophy and Religious Studies", "History", "Media & Communication",
    "Public Health", "Civil Engineering", "Mechanical Engineering",
    "Electrical Engineering", "Biomedical Engineering", "Aerospace Engineering",
    "Engineering Science", "Law", "Music", "Archaeology", "Dance",
    "Banking and Finance", "Teaching / Education Studies",
    "Language and Literature", "Social and Cultural Courses", "Journalism",
    "Creative Writing", "Sociology", "Political Science", "Nursing and Midwifery",
    "Chemical Engineering", "Mathematics", "Statistics", "English Language",
    "International Relations", "Behavioural Science", "Geography", "Psychology",
    "Business Analytics", "Physics", "Data Science", "Accounting",
    "Earth Sciences / Geoscience", "Environmental Science / Management",
    "Arts / Fine Art", "Biological Sciences", "Biotechnology", "Architecture",
    "Construction Management", "International / Global Business",
    "Sales And Marketing", "Human Resource Management", "Business Administration",
    "Project Management", "Innovation / Entrepreneurship", "Chemistry",
    "Business Management", "Leadership Development",
    "Medicine and Medical Studies", "Economics", "Computer Science",
    "Artificial Intelligence / Machine Learning", "Information Technology",
    "Computer Engineering", "Environmental Engineering", "Software Engineering",
    "Management", "Biochemical Engineering"
];

export default function AtlantaPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Atlanta"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Atlanta</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Atlanta, Georgia"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}