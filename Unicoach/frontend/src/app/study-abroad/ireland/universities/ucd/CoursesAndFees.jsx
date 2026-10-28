import React from 'react';
import CoursesFeesSection from '@/components/university-sections/CoursesFeesSection';
import { BarCompare } from '@/components/ui/Infographics';

const CoursesAndFees = ({ data, uniData }) => {
  const uni = data || uniData;
  const fees = (uni?.coursesFees || []).filter((c) => typeof c.tuition === 'number');
  return (
    <>
      {fees.length >= 2 && (
        <BarCompare
          kicker="Tuition at a glance"
          title={`Annual tuition at ${uni.name}`}
          items={fees.map((c) => ({ label: c.name, value: c.tuition, display: `₹${c.tuition} L/yr` }))}
          highlight={fees.reduce((a, b) => (b.tuition > a.tuition ? b : a)).name}
          className="mb-8"
        />
      )}
      <CoursesFeesSection uniData={uni} />
    </>
  );
};

export default CoursesAndFees;
