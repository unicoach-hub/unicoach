import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '..', 'src', 'app', 'study-abroad');

const overviewContent = `import React from 'react';
import OverviewSection from '@/components/university-sections/OverviewSection';

const Overview = ({ data, uniData }) => {
  return <OverviewSection uniData={data || uniData} />;
};

export default Overview;
`;

const admissionsContent = `import React from 'react';
import AdmissionsSection from '@/components/university-sections/AdmissionsSection';

const Admissions = ({ data, uniData }) => {
  return <AdmissionsSection uniData={data || uniData} />;
};

export default Admissions;
`;

const rankingsContent = `import React from 'react';
import RankingsSection from '@/components/university-sections/RankingsSection';

const Rankings = ({ data, uniData }) => {
  return <RankingsSection uniData={data || uniData} />;
};

export default Rankings;
`;

const coursesAndFeesContent = `import React from 'react';
import CoursesFeesSection from '@/components/university-sections/CoursesFeesSection';

const CoursesAndFees = ({ data, uniData }) => {
  return <CoursesFeesSection uniData={data || uniData} />;
};

export default CoursesAndFees;
`;

const countries = ['usa', 'uk', 'canada', 'australia', 'ireland'];

countries.forEach(country => {
  const unisDir = path.join(baseDir, country, 'universities');
  if (!fs.existsSync(unisDir)) return;

  const uniFolders = fs.readdirSync(unisDir, { withFileTypes: true });

  uniFolders.forEach(folder => {
    if (!folder.isDirectory()) return;
    const uniFolderPath = path.join(unisDir, folder.name);
    const pagePath = path.join(uniFolderPath, 'page.jsx');

    if (!fs.existsSync(pagePath)) return;

    // Create modular sub-components if missing
    const overviewPath = path.join(uniFolderPath, 'Overview.jsx');
    const admissionsPath = path.join(uniFolderPath, 'Admissions.jsx');
    const rankingsPath = path.join(uniFolderPath, 'Rankings.jsx');
    const coursesPath = path.join(uniFolderPath, 'CoursesAndFees.jsx');

    if (!fs.existsSync(overviewPath)) {
      fs.writeFileSync(overviewPath, overviewContent, 'utf8');
    }
    if (!fs.existsSync(admissionsPath)) {
      fs.writeFileSync(admissionsPath, admissionsContent, 'utf8');
    }
    if (!fs.existsSync(rankingsPath)) {
      fs.writeFileSync(rankingsPath, rankingsContent, 'utf8');
    }
    if (!fs.existsSync(coursesPath)) {
      fs.writeFileSync(coursesPath, coursesAndFeesContent, 'utf8');
    }

    // Update page.jsx
    let code = fs.readFileSync(pagePath, 'utf8');

    // Skip if page.jsx already imports Overview
    if (code.includes("import Overview from './Overview'")) {
      console.log(`Skipping already modularized page: ${country}/${folder.name}`);
      return;
    }

    // Insert modular imports after React/Template imports
    const importBlock = `import Overview from './Overview';\nimport Admissions from './Admissions';\nimport Rankings from './Rankings';\nimport CoursesAndFees from './CoursesAndFees';\n`;

    if (code.includes("import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';")) {
      code = code.replace(
        "import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';",
        "import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';\n" + importBlock
      );
    } else {
      code = importBlock + code;
    }

    // Replace the return statement of UniversityDetailTemplate
    // Pattern: <UniversityDetailTemplate uniData={xyzData} />
    const templateRegex = /<UniversityDetailTemplate\s+uniData=\{([a-zA-Z0-9_]+)\}\s*\/>/g;

    code = code.replace(templateRegex, (match, dataVar) => {
      return `<UniversityDetailTemplate 
      uniData={${dataVar}} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />`;
    });

    fs.writeFileSync(pagePath, code, 'utf8');
    console.log(`Successfully modularized: ${country}/${folder.name}`);
  });
});
