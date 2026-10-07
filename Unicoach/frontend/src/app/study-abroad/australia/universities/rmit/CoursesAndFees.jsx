import React from 'react';
import CoursesFeesSection from '@/components/university-sections/CoursesFeesSection';

const CoursesAndFees = ({ data, uniData }) => {
  return <CoursesFeesSection uniData={data || uniData} />;
};

export default CoursesAndFees;
