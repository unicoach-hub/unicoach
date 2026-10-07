import React from 'react';
import { useParams } from 'react-router-dom';
import CityUniversitiesTemplate from '../../components/CityUniversitiesTemplate';

export default function DynamicCityPage() {
    const { countryCode, city } = useParams();

    // Format city name from URL slug (e.g. "london-canada" -> "London Canada" or "los-angeles" -> "Los Angeles")
    const formatCityName = (slug) => {
        if (!slug) return '';
        
        // Custom match for "london-canada" to show "London, Canada"
        if (slug === 'london-canada') return 'London, Canada';
        
        return slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const cityName = formatCityName(city);

    return (
        <CityUniversitiesTemplate 
            cityName={cityName}
            universitiesData={[]} // passes empty array so it automatically queries the public API for this city
            filterCategories={{
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
            }}
            allCourses={[]}
        />
    );
}
