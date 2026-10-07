import React from 'react';
import OverviewSection from '@/components/university-sections/OverviewSection';

const Overview = ({ data, uniData }) => {
  return <OverviewSection uniData={data || uniData} />;
};

export default Overview;
