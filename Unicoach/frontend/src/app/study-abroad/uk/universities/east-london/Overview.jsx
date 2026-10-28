import React from 'react';
import OverviewSection from '@/components/university-sections/OverviewSection';
import { StatStrip } from '@/components/ui/Infographics';

const Overview = ({ data, uniData }) => {
  const uni = data || uniData;
  const stats = [
    uni?.totalStudents && { value: Number(uni.totalStudents).toLocaleString('en-IN'), label: 'Total students' },
    uni?.intlStudents && { value: Number(uni.intlStudents).toLocaleString('en-IN'), label: 'International students' },
    uni?.studentFacultyRatio && { value: uni.studentFacultyRatio, label: 'Student to faculty ratio' },
    uni?.acceptanceRate && { value: uni.acceptanceRate, label: 'Acceptance rate' },
    uni?.established && { value: uni.established, label: 'Year founded' },
  ].filter(Boolean).slice(0, 4);
  return (
    <>
      {stats.length >= 3 && <StatStrip stats={stats} className="mb-8" />}
      <OverviewSection uniData={uni} />
    </>
  );
};

export default Overview;
