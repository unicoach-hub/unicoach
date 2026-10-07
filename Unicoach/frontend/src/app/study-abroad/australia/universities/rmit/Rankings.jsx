import React from 'react';
import RankingsSection from '@/components/university-sections/RankingsSection';

const Rankings = ({ data, uniData }) => {
  return <RankingsSection uniData={data || uniData} />;
};

export default Rankings;
