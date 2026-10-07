import { getByCity } from '@/data/universities';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// Import local logo assets
import BostonUniversityLogo from '@/assets/usa/Boston/Boston University.png';
import NortheasternUniversityLogo from '@/assets/usa/Boston/Northeastern University.png';
import BostonArchitecturalCollegeLogo from '@/assets/usa/Boston/Boston Architectural College.png';
import SimmonsUniversityLogo from '@/assets/usa/Boston/Simmons University.png';
import SuffolkUniversityLogo from '@/assets/usa/Boston/Suffolk University.png';
import NECOLogo from '@/assets/usa/Boston/New England College of Optometry.png';
import CambridgeCollegeLogo from '@/assets/usa/Boston/Cambridge College.png';
import MCPHSLogo from '@/assets/usa/Boston/MCPHS University.png';
import FisherCollegeLogo from '@/assets/usa/Boston/Fisher College.png';
import UMassBostonLogo from '@/assets/usa/Boston/University of Massachusetts Boston.png';

// University Data for Boston
const universitiesData = getByCity('usa', 'Boston');

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
        { label: "MAY", value: "may" },
        { label: "AUG", value: "aug" },
        { label: "SEP", value: "sep" }
    ]
};

// All courses for filter
const allCourses = [
    "Industrial Engineering", "Broadcast Media", "Industrial Design", "Physiotherapy",
    "Astronomy", "Speech Pathology", "Interior Design", "Theatre", "Social Work",
    "Dental Studies", "Justice Studies", "Electronics", "Cyber Security",
    "Physical Sciences", "Biochemistry", "Information Systems",
    "Philosophy and Religious Studies", "History", "Media & Communication",
    "Public Health", "Game Development", "Civil Engineering", "Mechanical Engineering",
    "Electrical Engineering", "Biomedical Engineering", "Aerospace Engineering",
    "Engineering Science", "Legal Studies", "Law", "Music", "Archaeology",
    "Banking and Finance", "Teaching / Education Studies", "Language and Literature",
    "Social and Cultural Courses", "Film and TV Production", "Journalism",
    "Creative Writing", "Advertising", "Audio Visual Studies", "Publishing",
    "Sociology", "Political Science", "Nursing and Midwifery", "Chemical Engineering",
    "Mathematics", "Statistics", "English Language", "Photography", "Animation",
    "International Relations", "Behavioural Science", "Geography", "Psychology",
    "Business Analytics", "Physics", "Data Science", "Accounting",
    "Earth Sciences / Geoscience", "Environmental Science / Management",
    "Arts / Fine Art", "Graphic and Design Studies", "Creative Arts",
    "Fashion Design", "Crafts and Textiles", "Product Design", "Biological Sciences",
    "Genetics", "Forensics", "Biotechnology", "Architecture", "Construction Management",
    "Landscape Design and Architecture", "International / Global Business",
    "Sales And Marketing", "Human Resource Management", "Business Administration",
    "Project Management", "Innovation / Entrepreneurship", "Chemistry",
    "Food And Hospitality", "Pharmacology / Pharmacy", "Business Management",
    "Anthropology", "Medicine and Medical Studies", "Economics", "Computer Science",
    "Artificial Intelligence / Machine Learning", "Health Sciences / Administration",
    "Information Technology", "Computer Engineering", "Environmental Engineering",
    "Software Engineering", "Management", "Laboratory Technology"
];

export default function BostonPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Boston"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Boston</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Boston, Massachusetts"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}