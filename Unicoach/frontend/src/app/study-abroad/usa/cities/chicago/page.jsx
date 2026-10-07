import { getByCity } from '@/data/universities';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// Import local logo assets
import UChicagoLogo from '@/assets/usa/Chicago/Chicago.png';
import LoyolaLogo from '@/assets/usa/Chicago/Loyola.png';
import UICLogo from '@/assets/usa/Chicago/Illinois.png';
import DePaulLogo from '@/assets/usa/Chicago/DePaul.png';
import NortheasternLogo from '@/assets/usa/Chicago/Northeastern.png';
import RooseveltLogo from '@/assets/usa/Chicago/Roosevelt.png';
import SaintXavierLogo from '@/assets/usa/Chicago/Saint Xavier.png';
import ChicagoStateLogo from '@/assets/usa/Chicago/Chicago State.png';
import AdlerLogo from '@/assets/usa/Chicago/Adler.png';
import ColumbiaLogo from '@/assets/usa/Chicago/Columbia.png';
import RushLogo from '@/assets/usa/Chicago/Rush.png';
import NationalLouisLogo from '@/assets/usa/Chicago/National Louis.png';
import NorthParkLogo from '@/assets/usa/Chicago/North Park.png';

// University Data
const universitiesData = getByCity('usa', 'Chicago');

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
    "Speech Pathology", "Interior Design", "Theatre", "Social Work", "Dental Studies",
    "Justice Studies", "Cyber Security", "Biochemistry", "Information Systems",
    "Philosophy and Religious Studies", "History", "Media & Communication",
    "Public Health", "Game Development", "Civil Engineering", "Mechanical Engineering",
    "Electrical Engineering", "Biomedical Engineering", "Aerospace Engineering",
    "Legal Studies", "Law", "Music", "Dance", "Banking and Finance",
    "Teaching / Education Studies", "Language and Literature",
    "Social and Cultural Courses", "Film and TV Production", "Journalism",
    "Creative Writing", "Advertising", "Audio Visual Studies", "Sociology",
    "Political Science", "Nursing and Midwifery", "Radiography",
    "Paramedical Studies", "Chemical Engineering", "Mathematics", "Statistics",
    "English Language", "Photography", "Animation", "International Relations",
    "Behavioural Science", "Geography", "Psychology", "Physics", "Data Science",
    "Accounting", "Earth Sciences / Geoscience", "Arts / Fine Art",
    "Graphic and Design Studies", "Creative Arts", "Fashion Design",
    "Crafts and Textiles", "Product Design", "Biological Sciences", "Architecture",
    "Sales And Marketing", "Human Resource Management", "Business Administration",
    "Chemistry", "Pharmacology / Pharmacy", "Business Management",
    "Leadership Development", "Anthropology", "Medicine and Medical Studies",
    "Economics", "Computer Science", "Artificial Intelligence / Machine Learning",
    "Health Sciences / Administration", "Information Technology",
    "Computer Engineering", "Environmental Engineering", "Software Engineering",
    "Management", "Laboratory Technology"
];

export default function ChicagoPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Chicago"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Chicago</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Chicago, Illinois"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}