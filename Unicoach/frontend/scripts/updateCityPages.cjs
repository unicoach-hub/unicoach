const fs = require('fs');
const path = require('path');

const cityPages = [
  { path: 'australia/cities/brisbane/page.jsx', country: 'australia', city: 'Brisbane' },
  { path: 'australia/cities/melbourne/page.jsx', country: 'australia', city: 'Melbourne' },
  { path: 'australia/cities/perth/page.jsx', country: 'australia', city: 'Perth' },
  { path: 'australia/cities/sydney/page.jsx', country: 'australia', city: 'Sydney' },
  
  { path: 'canada/cities/edmonton/page.jsx', country: 'canada', city: 'Edmonton' },
  { path: 'canada/cities/halifax/page.jsx', country: 'canada', city: 'Halifax' },
  { path: 'canada/cities/london-canada/page.jsx', country: 'canada', city: 'London' },
  { path: 'canada/cities/montreal/page.jsx', country: 'canada', city: 'Montreal' },
  { path: 'canada/cities/toronto/page.jsx', country: 'canada', city: 'Toronto' },

  { path: 'ireland/cities/dublin/page.jsx', country: 'ireland', city: 'Dublin' },

  { path: 'uk/cities/birmingham/page.jsx', country: 'uk', city: 'Birmingham' },
  { path: 'uk/cities/edinburgh/page.jsx', country: 'uk', city: 'Edinburgh' },
  { path: 'uk/cities/glasgow/page.jsx', country: 'uk', city: 'Glasgow' },
  { path: 'uk/cities/leeds/page.jsx', country: 'uk', city: 'Leeds' },
  { path: 'uk/cities/london/page.jsx', country: 'uk', city: 'London' },

  { path: 'usa/cities/atlanta/page.jsx', country: 'usa', city: 'Atlanta' },
  { path: 'usa/cities/boston/page.jsx', country: 'usa', city: 'Boston' },
  { path: 'usa/cities/chicago/page.jsx', country: 'usa', city: 'Chicago' },
  { path: 'usa/cities/los-angeles/page.jsx', country: 'usa', city: 'Los Angeles' },
  { path: 'usa/cities/philadelphia/page.jsx', country: 'usa', city: 'Philadelphia' }
];

const basePath = path.join(__dirname, '../src/app/study-abroad');

cityPages.forEach(cp => {
  const fullPath = path.join(basePath, cp.path);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping non-existent: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Regex to match from `const universitiesData = [` down to `];`
  const regex = /const universitiesData = \[\s*[\s\S]*?\n\];/;

  if (regex.test(content)) {
    let importStatement = "import { getByCity } from '@/data/universities';\n\n";
    if (!content.includes("import { getByCity }")) {
      content = importStatement + content;
    }
    const replacement = `const universitiesData = getByCity('${cp.country}', '${cp.city}');`;
    content = content.replace(regex, replacement);

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${cp.path} to use getByCity('${cp.country}', '${cp.city}')`);
  } else {
    console.log(`⚠️ Regex match failed for ${cp.path}`);
  }
});
