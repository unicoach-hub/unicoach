import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://unicoach.com';

const routes = [
  // Main
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/blogs', changefreq: 'weekly', priority: '0.8' },
  { loc: '/unicoach-digest', changefreq: 'weekly', priority: '0.8' },
  { loc: '/events', changefreq: 'weekly', priority: '0.8' },
  { loc: '/newsroom', changefreq: 'weekly', priority: '0.7' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
  { loc: '/book-consultation', changefreq: 'monthly', priority: '0.8' },

  // Destinations
  { loc: '/study-abroad/usa', changefreq: 'weekly', priority: '0.9' },
  { loc: '/study-abroad/uk', changefreq: 'weekly', priority: '0.9' },
  { loc: '/study-abroad/canada', changefreq: 'weekly', priority: '0.9' },
  { loc: '/study-abroad/germany', changefreq: 'weekly', priority: '0.9' },
  { loc: '/study-abroad/france', changefreq: 'weekly', priority: '0.9' },
  { loc: '/study-abroad/new-zealand', changefreq: 'weekly', priority: '0.9' },
  { loc: '/study-abroad/australia', changefreq: 'weekly', priority: '0.9' },
  { loc: '/study-abroad/italy', changefreq: 'weekly', priority: '0.9' },

  // USA Sub-pages
  { loc: '/study-abroad/usa/courses/masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/usa/courses/computer-science', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/usa/courses/data-science', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/usa/chicago', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/usa/boston', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/usa/philadelphia', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/usa/los-angeles', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/usa/atlanta', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/usa/universities/harvard', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/usa/universities/stanford', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/usa/universities/columbia', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/usa/universities/northeastern', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/usa/universities/yale', changefreq: 'monthly', priority: '0.75' },

  // UK Sub-pages
  { loc: '/study-abroad/uk/courses/masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/uk/courses/computer-science', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/uk/courses/physiotherapy', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/uk/london', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/uk/glasgow', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/uk/leeds', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/uk/birmingham', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/uk/edinburgh', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/uk/universities/oxford', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/uk/universities/cambridge', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/uk/universities/coventry', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/uk/universities/leeds-university', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/uk/universities/east-london', changefreq: 'monthly', priority: '0.75' },

  // Canada Sub-pages
  { loc: '/study-abroad/canada/courses/masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/canada/courses/phd', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/canada/courses/computer-science', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/canada/halifax', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/canada/montreal', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/canada/toronto', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/canada/edmonton', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/canada/london-canada', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/canada/universities/conestoga', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/canada/universities/toronto-university', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/canada/universities/lambton', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/canada/universities/humber', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/canada/universities/centennial', changefreq: 'monthly', priority: '0.75' },

  // Germany Sub-pages
  { loc: '/study-abroad/germany/intakes', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/summer-intake', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/winter-intake', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/visa', changefreq: 'monthly', priority: '0.8' },
  { loc: '/study-abroad/germany/why-study', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/universities/best', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/universities/top-masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/universities/affordable', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/universities/public', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/universities/engineering', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/courses/masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/courses/mba', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/courses/bachelors', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/courses/best-courses', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/germany/courses/phd', changefreq: 'monthly', priority: '0.75' },

  // France Sub-pages
  { loc: '/study-abroad/france/intakes', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/france/visa', changefreq: 'monthly', priority: '0.8' },
  { loc: '/study-abroad/france/why-study', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/france/universities/top', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/france/universities/affordable', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/france/universities/public', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/france/courses/masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/france/courses/mba', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/france/courses/mbbs', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/france/courses/mim', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/france/courses/ma', changefreq: 'monthly', priority: '0.75' },

  // New Zealand Sub-pages
  { loc: '/study-abroad/new-zealand/intakes', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/new-zealand/july-intake', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/new-zealand/visa', changefreq: 'monthly', priority: '0.8' },
  { loc: '/study-abroad/new-zealand/universities/top', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/new-zealand/universities/best', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/new-zealand/universities/affordable', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/new-zealand/universities/public', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/new-zealand/courses/masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/new-zealand/courses/mba', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/new-zealand/courses/mbbs', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/new-zealand/courses/mph', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/new-zealand/courses/ma', changefreq: 'monthly', priority: '0.75' },

  // Australia Sub-pages
  { loc: '/study-abroad/australia/courses/masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/australia/courses/business-analytics', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/australia/courses/public-health', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/australia/adelaide', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/australia/brisbane', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/australia/melbourne', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/australia/perth', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/australia/sydney', changefreq: 'monthly', priority: '0.7' },
  { loc: '/study-abroad/australia/universities/carnegie-mellon', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/australia/universities/deakin', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/australia/universities/monash', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/australia/universities/queensland', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/australia/universities/rmit', changefreq: 'monthly', priority: '0.75' },

  // Italy Sub-pages
  { loc: '/study-abroad/italy/intakes', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/italy/visa', changefreq: 'monthly', priority: '0.8' },
  { loc: '/study-abroad/italy/free', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/italy/universities/top', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/italy/universities/public', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/italy/courses/masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/italy/courses/mba', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/italy/courses/ma', changefreq: 'monthly', priority: '0.75' },
  { loc: '/study-abroad/italy/courses/mbbs', changefreq: 'monthly', priority: '0.75' },

  // Exams
  { loc: '/exams/ielts', changefreq: 'weekly', priority: '0.85' },
  { loc: '/exams/ielts/masterclass', changefreq: 'weekly', priority: '0.8' },
  { loc: '/exams/ielts/overview', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/types', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/eligibility', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/fees', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/dates', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/registration', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/slot-booking', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/coaching-centres', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/results', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/listening', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/reading', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/writing', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/ielts/speaking', changefreq: 'monthly', priority: '0.75' },

  { loc: '/exams/gre', changefreq: 'weekly', priority: '0.85' },
  { loc: '/exams/gre/overview', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gre/syllabus', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gre/fees', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gre/dates', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gre/registration', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gre/results', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gre/slot-booking', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gre/preparation', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gre/practice-test', changefreq: 'monthly', priority: '0.75' },

  { loc: '/exams/gmat', changefreq: 'weekly', priority: '0.85' },
  { loc: '/exams/gmat/overview', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gmat/syllabus', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gmat/fees', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gmat/dates', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gmat/registration', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gmat/results', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gmat/preparation', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/gmat/sample-papers', changefreq: 'monthly', priority: '0.75' },

  { loc: '/exams/toefl', changefreq: 'weekly', priority: '0.85' },
  { loc: '/exams/toefl/overview', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/toefl/syllabus', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/toefl/fees', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/toefl/dates', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/toefl/registration', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/toefl/results', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/toefl/preparation', changefreq: 'monthly', priority: '0.75' },

  { loc: '/exams/pte', changefreq: 'weekly', priority: '0.85' },
  { loc: '/exams/pte/overview', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/pte/syllabus', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/pte/fees', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/pte/dates', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/pte/registration', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/pte/centres', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/pte/results', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/pte/slot-booking', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/pte/preparation', changefreq: 'monthly', priority: '0.75' },

  { loc: '/exams/sat', changefreq: 'weekly', priority: '0.85' },
  { loc: '/exams/sat/overview', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/sat/syllabus', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/sat/fees', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/sat/dates', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/sat/registration', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/sat/results', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/sat/preparation', changefreq: 'monthly', priority: '0.75' },

  { loc: '/exams/duolingo', changefreq: 'weekly', priority: '0.85' },
  { loc: '/exams/duolingo/overview', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/duolingo/syllabus', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/duolingo/fees', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/duolingo/registration', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/duolingo/results', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/duolingo/preparation', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/duolingo/sample-questions', changefreq: 'monthly', priority: '0.75' },
  { loc: '/exams/duolingo/australia', changefreq: 'monthly', priority: '0.7' },
  { loc: '/exams/duolingo/canada', changefreq: 'monthly', priority: '0.7' },
  { loc: '/exams/duolingo/uk', changefreq: 'monthly', priority: '0.7' },
  { loc: '/exams/duolingo/ireland', changefreq: 'monthly', priority: '0.7' },
  { loc: '/exams/duolingo/germany', changefreq: 'monthly', priority: '0.7' },

  // Resources
  { loc: '/resources/books/ielts-books', changefreq: 'monthly', priority: '0.75' },
  { loc: '/resources/books/sat-books', changefreq: 'monthly', priority: '0.75' },
  { loc: '/resources/books/pte-books', changefreq: 'monthly', priority: '0.75' },
  { loc: '/resources/books/toefl-books', changefreq: 'monthly', priority: '0.75' },
  { loc: '/resources/books/gre-books', changefreq: 'monthly', priority: '0.75' },
  { loc: '/resources/books/gmat-books', changefreq: 'monthly', priority: '0.75' },

  { loc: '/resources/calculators/cgpa-to-gpa', changefreq: 'monthly', priority: '0.8' },
  { loc: '/resources/calculators/cgpa-to-percentage', changefreq: 'monthly', priority: '0.8' },
  { loc: '/resources/calculators/cgpa-to-marks', changefreq: 'monthly', priority: '0.8' },

  { loc: '/resources/sop/statement-of-purpose', changefreq: 'monthly', priority: '0.75' },
  { loc: '/resources/sop/sop-masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/resources/sop/sop-mba', changefreq: 'monthly', priority: '0.75' },
  { loc: '/resources/sop/sop-phd', changefreq: 'monthly', priority: '0.75' },

  { loc: '/resources/lor/lor-blog', changefreq: 'monthly', priority: '0.75' },
  { loc: '/resources/lor/lor-masters', changefreq: 'monthly', priority: '0.75' },
  { loc: '/resources/lor/lor-phd', changefreq: 'monthly', priority: '0.75' },
];

const generateSitemap = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  routes.forEach((route) => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route.loc}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  const destPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(destPath, xml, 'utf8');
  console.log(`Sitemap successfully written to ${destPath}`);
};

generateSitemap();
