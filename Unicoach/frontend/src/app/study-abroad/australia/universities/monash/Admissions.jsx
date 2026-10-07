import React from 'react';
import AdmissionsSection from '@/components/university-sections/AdmissionsSection';

const Admissions = ({ data, uniData }) => {
  return <AdmissionsSection uniData={data || uniData} />;
};

export default Admissions;
