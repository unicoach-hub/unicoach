/**
 * Master University Data Generator Script (Modular Country & City Organization)
 * 
 * Run: node scripts/generateUniversityData.cjs
 * Output: 
 *   - src/data/universities/usa.js
 *   - src/data/universities/uk.js
 *   - src/data/universities/australia.js
 *   - src/data/universities/canada.js
 *   - src/data/universities/germany.js
 *   - src/data/universities/ireland.js
 *   - src/data/universities/italy.js
 *   - src/data/universities/france.js
 *   - src/data/universities/newZealand.js
 *   - src/data/universities/index.js
 *   - src/data/universities.js (Main re-export entrypoint)
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: USA — Read existing JSON (1,484 entries) + normalize
// ═══════════════════════════════════════════════════════════════════

function loadUSAJsonData() {
  const jsonPath = path.join(__dirname, '../src/assets/usa/master_in_usa/all_universities_data.json');
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  return raw.map((u, i) => {
    const gpaMatch = u.eligibility?.match(/([\d.]+)\+?\s*GPA/i) || u.eligibility?.match(/GPA\s*([\d.]+)/i);
    const gpa = gpaMatch ? parseFloat(gpaMatch[1]) : 3.0;
    const minGpaPercent = Math.round(gpa * 25);

    const ieltsMatch = u.eligibility?.match(/IELTS\s*([\d.]+)/i);
    const minIeltsScore = ieltsMatch ? parseFloat(ieltsMatch[1]) : 6.5;

    const toeflMatch = u.eligibility?.match(/TOEFL\s*([\d]+)/i);
    const minToeflScore = toeflMatch ? parseInt(toeflMatch[1]) : 80;

    const greRequired = /GRE.*required/i.test(u.eligibility || '') || /GRE\/GMAT\s*required/i.test(u.eligibility || '');
    const greMatch = u.eligibility?.match(/GRE\s*([\d]+)/i);
    const minGreScore = greMatch ? parseInt(greMatch[1]) : (greRequired ? 310 : 0);

    const rankMatch = (u.rank || '').match(/(\d+)/);
    const rankingNum = rankMatch ? parseInt(rankMatch[1]) : 999;

    let tuitionFeeUSD = 35000;
    if (u.tuition) {
      const lakhMatch = u.tuition.match(/([\d.]+)\s*Lakh/i);
      if (lakhMatch) {
        tuitionFeeUSD = Math.round(parseFloat(lakhMatch[1]) * 100000 / 85);
      }
    }

    const locationParts = (u.location || '').split(',').map(s => s.trim());
    const city = locationParts[0] || 'Unknown';
    const state = locationParts[1] || '';

    let acceptanceRate = 65;
    if (rankingNum <= 20) acceptanceRate = Math.floor(Math.random() * 10) + 5;
    else if (rankingNum <= 50) acceptanceRate = Math.floor(Math.random() * 15) + 15;
    else if (rankingNum <= 100) acceptanceRate = Math.floor(Math.random() * 20) + 25;
    else if (rankingNum <= 200) acceptanceRate = Math.floor(Math.random() * 20) + 35;
    else if (rankingNum <= 500) acceptanceRate = Math.floor(Math.random() * 20) + 45;
    else acceptanceRate = Math.floor(Math.random() * 20) + 55;

    return {
      _id: `usa-${i + 1}`,
      name: u.name,
      countryName: 'USA',
      country: 'usa',
      city,
      state,
      location: u.location || `${city}, ${state}, USA`,
      rank: u.rank ? `Rank ${u.rank}` : `Rank ${rankingNum} QS Rankings`,
      rankingNum,
      tuition: u.tuition || `$${Math.round(tuitionFeeUSD / 1000)}k / yr`,
      tuitionFeeUSD,
      minGpaPercent,
      minIeltsScore,
      minToeflScore,
      minGreScore,
      greRequired,
      acceptanceRate,
      type: u.type || 'PUBLIC',
      logo: u.logo ? `usa_masters_logos/${u.logo.replace('usa_masters_logos/', '')}` : `https://logo.clearbit.com/${u.name.toLowerCase().replace(/[^a-z]/g, '')}.edu`,
      website: u.website || '#',
      description: u.description || `A distinguished research university in the United States.`,
      eligibility: u.eligibility || `GPA ${gpa}+, IELTS ${minIeltsScore}+`,
      courses: assignCourses(u.name, 'USA'),
      degreeLevels: ['Masters', 'PhD'],
      scholarshipAvailable: rankingNum <= 300,
      intakes: ['Fall', 'Spring']
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COURSE ASSIGNMENT LOGIC
// ═══════════════════════════════════════════════════════════════════

function assignCourses(uniName, country) {
  const name = (uniName || '').toLowerCase();
  const baseCourses = ['Business Administration', 'Computer Science', 'Data Science'];
  
  if (name.includes('technology') || name.includes('tech') || name.includes('engineering')) {
    return [...baseCourses, 'Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Software Engineering', 'Artificial Intelligence'];
  }
  if (name.includes('business') || name.includes('commerce') || name.includes('management')) {
    return [...baseCourses, 'MBA', 'Finance', 'Marketing', 'Human Resource Management', 'Accounting'];
  }
  if (name.includes('art') || name.includes('design') || name.includes('creative')) {
    return ['Fine Arts', 'Graphic Design', 'Animation', 'Architecture', 'Interior Design', 'Media & Communication'];
  }
  if (name.includes('medical') || name.includes('health') || name.includes('medicine')) {
    return ['Medicine', 'Public Health', 'Nursing', 'Biomedical Engineering', 'Pharmacy', 'Health Sciences'];
  }
  if (name.includes('law')) {
    return ['Law', 'International Law', 'Business Law', 'Criminal Justice'];
  }
  
  return [...baseCourses, 'Engineering', 'MBA', 'Finance', 'Psychology', 'Mechanical Engineering'];
}

// ═══════════════════════════════════════════════════════════════════
// DATASETS
// ═══════════════════════════════════════════════════════════════════

const UK_UNIVERSITIES = [
  { name: "Imperial College London", city: "London", state: "England", rank: 2, tuitionGBP: 38000, gpa: 85, ielts: 7.0, type: "PUBLIC", domain: "imperial.ac.uk", desc: "World-leading science, engineering, medicine and business university in South Kensington." },
  { name: "University College London", city: "London", state: "England", rank: 9, tuitionGBP: 32000, gpa: 82, ielts: 7.0, type: "PUBLIC", domain: "ucl.ac.uk", desc: "London's leading multidisciplinary university with world-class research across arts, sciences and engineering." },
  { name: "King's College London", city: "London", state: "England", rank: 40, tuitionGBP: 28000, gpa: 80, ielts: 7.0, type: "PUBLIC", domain: "kcl.ac.uk", desc: "One of the oldest universities in England, renowned for health sciences, law and humanities." },
  { name: "London School of Economics", city: "London", state: "England", rank: 45, tuitionGBP: 30000, gpa: 85, ielts: 7.0, type: "PUBLIC", domain: "lse.ac.uk", desc: "The world's leading social science university, specialising in economics, politics and law." },
  { name: "London Business School", city: "London", state: "England", rank: 4, tuitionGBP: 95000, gpa: 85, ielts: 7.5, type: "PRIVATE", domain: "london.edu", desc: "Consistently ranked among the world's best business schools for MBA and finance programs." },
  { name: "Royal College of Art", city: "London", state: "England", rank: 1, tuitionGBP: 35000, gpa: 70, ielts: 6.5, type: "PUBLIC", domain: "rca.ac.uk", desc: "World's most influential postgraduate art and design institution." },
  { name: "University of the Arts London", city: "London", state: "England", rank: 2, tuitionGBP: 25000, gpa: 68, ielts: 6.5, type: "PUBLIC", domain: "arts.ac.uk", desc: "Leading specialist creative university for fashion, design and communication." },
  { name: "Queen Mary University of London", city: "London", state: "England", rank: 145, tuitionGBP: 22000, gpa: 75, ielts: 6.5, type: "PUBLIC", domain: "qmul.ac.uk", desc: "Russell Group university known for engineering, law and medicine research." },
  { name: "City University of London", city: "London", state: "England", rank: 328, tuitionGBP: 18000, gpa: 70, ielts: 6.5, type: "PUBLIC", domain: "city.ac.uk", desc: "Specialises in business, law, health sciences and engineering with strong industry links." },
  { name: "SOAS University of London", city: "London", state: "England", rank: 385, tuitionGBP: 20000, gpa: 72, ielts: 7.0, type: "PUBLIC", domain: "soas.ac.uk", desc: "Unique expertise in Asian, African and Middle Eastern studies." },
  { name: "Brunel University London", city: "London", state: "England", rank: 412, tuitionGBP: 17000, gpa: 65, ielts: 6.0, type: "PUBLIC", domain: "brunel.ac.uk", desc: "Known for engineering, design and health sciences with sandwich courses." },
  { name: "University of Westminster", city: "London", state: "England", rank: 540, tuitionGBP: 15000, gpa: 60, ielts: 6.0, type: "PUBLIC", domain: "westminster.ac.uk", desc: "Central London university strong in media, architecture and business." },
  { name: "Middlesex University London", city: "London", state: "England", rank: 650, tuitionGBP: 14500, gpa: 58, ielts: 6.0, type: "PUBLIC", domain: "mdx.ac.uk", desc: "Practice-based learning across business, arts, health and computing." },
  { name: "Kingston University London", city: "London", state: "England", rank: 601, tuitionGBP: 15000, gpa: 60, ielts: 6.0, type: "PUBLIC", domain: "kingston.ac.uk", desc: "Known for creative industries, engineering and business education." },
  { name: "University of Greenwich", city: "London", state: "England", rank: 701, tuitionGBP: 14000, gpa: 58, ielts: 6.0, type: "PUBLIC", domain: "greenwich.ac.uk", desc: "Historic campus university offering programs in engineering, business and education." },
  { name: "Goldsmiths University of London", city: "London", state: "England", rank: 461, tuitionGBP: 18000, gpa: 68, ielts: 6.5, type: "PUBLIC", domain: "gold.ac.uk", desc: "Creative and cultural university specialising in arts, humanities and social sciences." },
  { name: "Birkbeck University of London", city: "London", state: "England", rank: 500, tuitionGBP: 16000, gpa: 65, ielts: 6.5, type: "PUBLIC", domain: "bbk.ac.uk", desc: "Specialist evening study university offering research-led teaching." },
  { name: "Royal Holloway University of London", city: "London", state: "England", rank: 367, tuitionGBP: 20000, gpa: 72, ielts: 6.5, type: "PUBLIC", domain: "royalholloway.ac.uk", desc: "Beautiful campus university strong in cybersecurity, media and creative arts." },
  { name: "London South Bank University", city: "London", state: "England", rank: 801, tuitionGBP: 13000, gpa: 55, ielts: 6.0, type: "PUBLIC", domain: "lsbu.ac.uk", desc: "Career-focused university with strong links to London businesses." },
  { name: "University of East London", city: "London", state: "England", rank: 801, tuitionGBP: 13500, gpa: 55, ielts: 6.0, type: "PUBLIC", domain: "uel.ac.uk", desc: "Diverse and inclusive university with practical, career-oriented programs." },
  { name: "University of Oxford", city: "Oxford", state: "England", rank: 3, tuitionGBP: 35000, gpa: 90, ielts: 7.5, type: "PUBLIC", domain: "ox.ac.uk", desc: "The oldest university in the English-speaking world, consistently ranked among the world's top 5." },
  { name: "University of Cambridge", city: "Cambridge", state: "England", rank: 5, tuitionGBP: 35000, gpa: 90, ielts: 7.5, type: "PUBLIC", domain: "cam.ac.uk", desc: "One of the world's leading academic institutions with 800+ years of excellence." },
  { name: "Oxford Brookes University", city: "Oxford", state: "England", rank: 438, tuitionGBP: 15000, gpa: 65, ielts: 6.0, type: "PUBLIC", domain: "brookes.ac.uk", desc: "Modern university known for architecture, business and hospitality management." },
  { name: "Anglia Ruskin University", city: "Cambridge", state: "England", rank: 651, tuitionGBP: 14000, gpa: 58, ielts: 6.0, type: "PUBLIC", domain: "aru.ac.uk", desc: "Dynamic university offering career-focused education across health, business and arts." },
  { name: "University of Edinburgh", city: "Edinburgh", state: "Scotland", rank: 22, tuitionGBP: 30000, gpa: 82, ielts: 7.0, type: "PUBLIC", domain: "ed.ac.uk", desc: "Scotland's leading university and a global centre for research and innovation." },
  { name: "Heriot-Watt University", city: "Edinburgh", state: "Scotland", rank: 235, tuitionGBP: 17000, gpa: 70, ielts: 6.0, type: "PUBLIC", domain: "hw.ac.uk", desc: "Specialist in engineering, business and science with global campuses." },
  { name: "Edinburgh Napier University", city: "Edinburgh", state: "Scotland", rank: 551, tuitionGBP: 15000, gpa: 62, ielts: 6.0, type: "PUBLIC", domain: "napier.ac.uk", desc: "Modern university with strong industry links in computing, engineering and business." },
  { name: "University of Glasgow", city: "Glasgow", state: "Scotland", rank: 76, tuitionGBP: 24000, gpa: 78, ielts: 6.5, type: "PUBLIC", domain: "gla.ac.uk", desc: "One of the UK's oldest universities, renowned for engineering, medicine and humanities." },
  { name: "University of Strathclyde", city: "Glasgow", state: "Scotland", rank: 304, tuitionGBP: 18000, gpa: 70, ielts: 6.5, type: "PUBLIC", domain: "strath.ac.uk", desc: "Leading technological university with top business school and engineering programs." },
  { name: "Glasgow Caledonian University", city: "Glasgow", state: "Scotland", rank: 701, tuitionGBP: 13000, gpa: 58, ielts: 6.0, type: "PUBLIC", domain: "gcu.ac.uk", desc: "Career-focused university specialising in health, business and society." },
  { name: "University of Birmingham", city: "Birmingham", state: "England", rank: 84, tuitionGBP: 23000, gpa: 78, ielts: 6.5, type: "PUBLIC", domain: "bham.ac.uk", desc: "Russell Group university known for engineering, medicine and social sciences." },
  { name: "Aston University", city: "Birmingham", state: "England", rank: 446, tuitionGBP: 16000, gpa: 65, ielts: 6.5, type: "PUBLIC", domain: "aston.ac.uk", desc: "Top business school and engineering programs with industry placements." },
  { name: "Birmingham City University", city: "Birmingham", state: "England", rank: 601, tuitionGBP: 14000, gpa: 58, ielts: 6.0, type: "PUBLIC", domain: "bcu.ac.uk", desc: "Modern university strong in creative arts, business and engineering." },
  { name: "University of Leeds", city: "Leeds", state: "England", rank: 75, tuitionGBP: 24000, gpa: 78, ielts: 6.5, type: "PUBLIC", domain: "leeds.ac.uk", desc: "Russell Group university renowned for engineering, business and social sciences." },
  { name: "Leeds Beckett University", city: "Leeds", state: "England", rank: 701, tuitionGBP: 14000, gpa: 58, ielts: 6.0, type: "PUBLIC", domain: "leedsbeckett.ac.uk", desc: "Modern university with strengths in sports, business and built environment." },
  { name: "University of Manchester", city: "Manchester", state: "England", rank: 32, tuitionGBP: 28000, gpa: 82, ielts: 7.0, type: "PUBLIC", domain: "manchester.ac.uk", desc: "One of the UK's largest universities, a global leader in research and innovation." },
  { name: "University of Warwick", city: "Coventry", state: "England", rank: 67, tuitionGBP: 28000, gpa: 82, ielts: 7.0, type: "PUBLIC", domain: "warwick.ac.uk", desc: "Leading Russell Group university with world-class business school and engineering." },
  { name: "Coventry University", city: "Coventry", state: "England", rank: 556, tuitionGBP: 15000, gpa: 60, ielts: 6.0, type: "PUBLIC", domain: "coventry.ac.uk", desc: "Known for engineering, automotive design and health sciences with strong industry links." },
];

const AUSTRALIA_UNIVERSITIES = [
  { name: "University of Melbourne", city: "Melbourne", state: "Victoria", rank: 14, tuitionAUD: 45000, gpa: 82, ielts: 6.5, type: "PUBLIC", domain: "unimelb.edu.au", desc: "Australia's #1 ranked university known for medicine, engineering and arts." },
  { name: "Monash University", city: "Melbourne", state: "Victoria", rank: 42, tuitionAUD: 44000, gpa: 78, ielts: 6.5, type: "PUBLIC", domain: "monash.edu", desc: "Group of Eight university with top engineering, pharmacy and education programs." },
  { name: "RMIT University", city: "Melbourne", state: "Victoria", rank: 123, tuitionAUD: 35000, gpa: 68, ielts: 6.5, type: "PUBLIC", domain: "rmit.edu.au", desc: "Australia's largest tertiary institution, known for design, engineering and business." },
  { name: "Deakin University", city: "Melbourne", state: "Victoria", rank: 233, tuitionAUD: 33000, gpa: 68, ielts: 6.0, type: "PUBLIC", domain: "deakin.edu.au", desc: "Innovative university known for nursing, sports science and cybersecurity." },
  { name: "Swinburne University of Technology", city: "Melbourne", state: "Victoria", rank: 296, tuitionAUD: 31000, gpa: 65, ielts: 6.0, type: "PUBLIC", domain: "swinburne.edu.au", desc: "Strong in engineering, IT, design and business with industry partnerships." },
  { name: "La Trobe University", city: "Melbourne", state: "Victoria", rank: 242, tuitionAUD: 32000, gpa: 65, ielts: 6.0, type: "PUBLIC", domain: "latrobe.edu.au", desc: "Known for health sciences, social work and agriculture." },
  { name: "University of Sydney", city: "Sydney", state: "New South Wales", rank: 19, tuitionAUD: 48000, gpa: 82, ielts: 7.0, type: "PUBLIC", domain: "sydney.edu.au", desc: "Australia's oldest university, a global leader in health, engineering and business." },
  { name: "University of New South Wales", city: "Sydney", state: "New South Wales", rank: 19, tuitionAUD: 47000, gpa: 80, ielts: 6.5, type: "PUBLIC", domain: "unsw.edu.au", desc: "Leading Australian university for engineering, business and technology." },
  { name: "University of Technology Sydney", city: "Sydney", state: "New South Wales", rank: 88, tuitionAUD: 38000, gpa: 72, ielts: 6.5, type: "PUBLIC", domain: "uts.edu.au", desc: "Leading technology university with industry-connected programs in IT, design and business." },
  { name: "Macquarie University", city: "Sydney", state: "New South Wales", rank: 130, tuitionAUD: 36000, gpa: 72, ielts: 6.5, type: "PUBLIC", domain: "mq.edu.au", desc: "Known for linguistics, business and environmental sciences." },
  { name: "University of Queensland", city: "Brisbane", state: "Queensland", rank: 43, tuitionAUD: 42000, gpa: 78, ielts: 6.5, type: "PUBLIC", domain: "uq.edu.au", desc: "Leading research university in biosciences, engineering and environmental sciences." },
  { name: "Queensland University of Technology", city: "Brisbane", state: "Queensland", rank: 189, tuitionAUD: 34000, gpa: 70, ielts: 6.5, type: "PUBLIC", domain: "qut.edu.au", desc: "Leading technology university with strong business, creative and health programs." },
  { name: "Griffith University", city: "Brisbane", state: "Queensland", rank: 243, tuitionAUD: 32000, gpa: 68, ielts: 6.5, type: "PUBLIC", domain: "griffith.edu.au", desc: "Innovative university known for criminology, tourism and environmental science." },
  { name: "University of Western Australia", city: "Perth", state: "Western Australia", rank: 72, tuitionAUD: 40000, gpa: 78, ielts: 6.5, type: "PUBLIC", domain: "uwa.edu.au", desc: "Group of Eight university known for mining, marine science and medicine." },
  { name: "Curtin University", city: "Perth", state: "Western Australia", rank: 183, tuitionAUD: 34000, gpa: 70, ielts: 6.5, type: "PUBLIC", domain: "curtin.edu.au", desc: "WA's largest university, strong in mining, engineering and health sciences." },
  { name: "Murdoch University", city: "Perth", state: "Western Australia", rank: 431, tuitionAUD: 28000, gpa: 62, ielts: 6.0, type: "PUBLIC", domain: "murdoch.edu.au", desc: "Known for veterinary science, environmental science and IT." },
  { name: "Edith Cowan University", city: "Perth", state: "Western Australia", rank: 541, tuitionAUD: 27000, gpa: 60, ielts: 6.0, type: "PUBLIC", domain: "ecu.edu.au", desc: "Modern university with strong education, cybersecurity and nursing programs." },
  { name: "University of Adelaide", city: "Adelaide", state: "South Australia", rank: 89, tuitionAUD: 42000, gpa: 78, ielts: 6.5, type: "PUBLIC", domain: "adelaide.edu.au", desc: "Group of Eight research university renowned for agriculture, medicine and engineering." },
  { name: "University of South Australia", city: "Adelaide", state: "South Australia", rank: 326, tuitionAUD: 30000, gpa: 65, ielts: 6.0, type: "PUBLIC", domain: "unisa.edu.au", desc: "South Australia's largest university focused on applied research and industry partnerships." },
  { name: "Flinders University", city: "Adelaide", state: "South Australia", rank: 431, tuitionAUD: 28000, gpa: 62, ielts: 6.0, type: "PUBLIC", domain: "flinders.edu.au", desc: "Forward-thinking university offering affordable education in health, law and science." },
  { name: "Torrens University Australia", city: "Adelaide", state: "South Australia", rank: 801, tuitionAUD: 24000, gpa: 55, ielts: 6.0, type: "PRIVATE", domain: "torrens.edu.au", desc: "Dynamic student-centred university specialising in creative industries and hospitality." },
  { name: "Australian National University", city: "Canberra", state: "ACT", rank: 30, tuitionAUD: 46000, gpa: 82, ielts: 6.5, type: "PUBLIC", domain: "anu.edu.au", desc: "Australia's national research university, top-ranked for political science and international relations." },
];

const CANADA_UNIVERSITIES = [
  { name: "University of Toronto", city: "Toronto", state: "Ontario", rank: 21, tuitionCAD: 55000, gpa: 85, ielts: 7.0, type: "PUBLIC", domain: "utoronto.ca", desc: "Canada's #1 university, world-leader in AI, medicine, business and engineering." },
  { name: "York University", city: "Toronto", state: "Ontario", rank: 456, tuitionCAD: 28000, gpa: 68, ielts: 6.5, type: "PUBLIC", domain: "yorku.ca", desc: "Large research university with Schulich School of Business and Osgoode Hall Law." },
  { name: "Ryerson University (TMU)", city: "Toronto", state: "Ontario", rank: 801, tuitionCAD: 25000, gpa: 65, ielts: 6.5, type: "PUBLIC", domain: "torontomu.ca", desc: "Career-focused university in downtown Toronto, strong in media, business and engineering." },
  { name: "Humber College", city: "Toronto", state: "Ontario", rank: 999, tuitionCAD: 16000, gpa: 58, ielts: 6.0, type: "PUBLIC", domain: "humber.ca", desc: "Leading polytechnic with programs in media, IT, business and health." },
  { name: "Centennial College", city: "Toronto", state: "Ontario", rank: 999, tuitionCAD: 15000, gpa: 55, ielts: 6.0, type: "PUBLIC", domain: "centennialcollege.ca", desc: "Diverse college offering programs in engineering, health and communications." },
  { name: "McGill University", city: "Montreal", state: "Quebec", rank: 29, tuitionCAD: 50000, gpa: 85, ielts: 7.0, type: "PUBLIC", domain: "mcgill.ca", desc: "Canada's most international university known for medicine, law and engineering." },
  { name: "University of Montreal", city: "Montreal", state: "Quebec", rank: 116, tuitionCAD: 30000, gpa: 75, ielts: 6.5, type: "PUBLIC", domain: "umontreal.ca", desc: "Leading francophone university known for AI research and health sciences." },
  { name: "Concordia University", city: "Montreal", state: "Quebec", rank: 601, tuitionCAD: 25000, gpa: 68, ielts: 6.5, type: "PUBLIC", domain: "concordia.ca", desc: "Known for John Molson School of Business, fine arts and engineering." },
  { name: "University of Alberta", city: "Edmonton", state: "Alberta", rank: 111, tuitionCAD: 35000, gpa: 75, ielts: 6.5, type: "PUBLIC", domain: "ualberta.ca", desc: "Top Canadian university for AI, petroleum engineering and health sciences." },
  { name: "Dalhousie University", city: "Halifax", state: "Nova Scotia", rank: 298, tuitionCAD: 28000, gpa: 72, ielts: 6.5, type: "PUBLIC", domain: "dal.ca", desc: "Atlantic Canada's leading research university with ocean and marine science expertise." },
  { name: "Western University", city: "London", state: "Ontario", rank: 114, tuitionCAD: 38000, gpa: 78, ielts: 6.5, type: "PUBLIC", domain: "uwo.ca", desc: "Known for Ivey Business School, medicine and engineering." },
  { name: "Fanshawe College", city: "London", state: "Ontario", rank: 999, tuitionCAD: 14000, gpa: 55, ielts: 6.0, type: "PUBLIC", domain: "fanshawec.ca", desc: "Large college offering practical programs in health, business and trades." },
];

const GERMANY_UNIVERSITIES = [
  { name: "Technical University of Munich", city: "Munich", state: "Bavaria", rank: 37, tuitionEUR: 300, gpa: 82, ielts: 6.5, gre: true, greScore: 315, type: "PUBLIC", domain: "tum.de", desc: "Germany's top technical university for innovation, CS, and robotics." },
  { name: "Ludwig Maximilian University of Munich", city: "Munich", state: "Bavaria", rank: 54, tuitionEUR: 300, gpa: 80, ielts: 6.5, gre: false, greScore: 0, type: "PUBLIC", domain: "lmu.de", desc: "One of Europe's leading research universities known for humanities and sciences." },
  { name: "Freie Universität Berlin", city: "Berlin", state: "Berlin", rank: 98, tuitionEUR: 300, gpa: 78, ielts: 6.5, gre: false, greScore: 0, type: "PUBLIC", domain: "fu-berlin.de", desc: "Leading Berlin university known for humanities, social and political sciences." },
  { name: "Technical University of Berlin", city: "Berlin", state: "Berlin", rank: 154, tuitionEUR: 300, gpa: 75, ielts: 6.5, gre: false, greScore: 0, type: "PUBLIC", domain: "tu-berlin.de", desc: "Major technical university in Berlin's capital, strong in engineering and CS." },
  { name: "RWTH Aachen University", city: "Aachen", state: "North Rhine-Westphalia", rank: 106, tuitionEUR: 300, gpa: 80, ielts: 6.5, gre: false, greScore: 0, type: "PUBLIC", domain: "rwth-aachen.de", desc: "Germany's largest technical university, top for mechanical and electrical engineering." },
];

const IRELAND_UNIVERSITIES = [
  { name: "Trinity College Dublin", city: "Dublin", state: "Leinster", rank: 81, tuitionEUR: 25000, gpa: 80, ielts: 6.5, type: "PUBLIC", domain: "tcd.ie", desc: "Ireland's oldest university with world-leading CS and business programs." },
  { name: "University College Dublin", city: "Dublin", state: "Leinster", rank: 126, tuitionEUR: 23000, gpa: 78, ielts: 6.5, type: "PUBLIC", domain: "ucd.ie", desc: "Ireland's largest university with strong business, law and veterinary programs." },
  { name: "Dublin City University", city: "Dublin", state: "Leinster", rank: 436, tuitionEUR: 16000, gpa: 68, ielts: 6.5, type: "PUBLIC", domain: "dcu.ie", desc: "Enterprise university known for communications, computing and biotechnology." },
];

const ITALY_UNIVERSITIES = [
  { name: "Politecnico di Milano", city: "Milan", state: "Lombardy", rank: 123, tuitionEUR: 4000, gpa: 80, ielts: 6.5, type: "PUBLIC", domain: "polimi.it", desc: "Italy's leading technical university for engineering, architecture and design." },
  { name: "University of Bologna", city: "Bologna", state: "Emilia-Romagna", rank: 133, tuitionEUR: 3000, gpa: 78, ielts: 6.0, type: "PUBLIC", domain: "unibo.it", desc: "The world's oldest university, strong in law, medicine and humanities." },
];

const FRANCE_UNIVERSITIES = [
  { name: "Paris Sciences et Lettres University", city: "Paris", state: "Île-de-France", rank: 24, tuitionEUR: 500, gpa: 85, ielts: 7.0, type: "PUBLIC", domain: "psl.eu", desc: "France's highest-ranked university bringing together elite institutions in Paris." },
  { name: "Sorbonne University", city: "Paris", state: "Île-de-France", rank: 59, tuitionEUR: 400, gpa: 82, ielts: 6.5, type: "PUBLIC", domain: "sorbonne-universite.fr", desc: "Historic French university excelling in sciences, humanities and medicine." },
];

const NZ_UNIVERSITIES = [
  { name: "University of Auckland", city: "Auckland", state: "Auckland", rank: 68, tuitionNZD: 38000, gpa: 78, ielts: 6.5, type: "PUBLIC", domain: "auckland.ac.nz", desc: "New Zealand's highest-ranked university, leading in engineering, medicine and business." },
  { name: "University of Otago", city: "Dunedin", state: "Otago", rank: 206, tuitionNZD: 32000, gpa: 72, ielts: 6.0, type: "PUBLIC", domain: "otago.ac.nz", desc: "NZ's oldest university, renowned for health sciences and biomedical research." },
];

// Helper to format country lists
function generateCountryUniversities(universities, countryName, countrySlug, currencyKey, usdRate) {
  return universities.map((u, i) => {
    const tuitionUSD = Math.round((u[currencyKey] || 20000) / usdRate);
    const gpa = u.gpa || 70;
    const gpaDecimal = (gpa / 25).toFixed(1);
    
    return {
      _id: `${countrySlug}-${i + 1}`,
      name: u.name,
      countryName,
      country: countrySlug,
      city: u.city,
      state: u.state || '',
      location: `${u.city}, ${u.state || ''}, ${countryName}`.replace(', ,', ','),
      rank: `Rank ${u.rank} QS Rankings`,
      rankingNum: u.rank,
      tuition: countrySlug === 'germany' ? `€${u[currencyKey]?.toLocaleString()} / yr` : `₹${Math.round(tuitionUSD * 85 / 100000)} Lakh INR/yr`,
      tuitionFeeUSD: tuitionUSD,
      minGpaPercent: gpa,
      minIeltsScore: u.ielts || 6.0,
      minToeflScore: u.ielts >= 7.0 ? 100 : (u.ielts >= 6.5 ? 85 : 70),
      minGreScore: u.greScore || 0,
      greRequired: u.gre || false,
      acceptanceRate: u.rank <= 50 ? Math.floor(Math.random() * 15) + 10 :
                      u.rank <= 100 ? Math.floor(Math.random() * 15) + 25 : 50,
      type: u.type || 'PUBLIC',
      logo: `https://logo.clearbit.com/${u.domain}`,
      website: `https://www.${u.domain}`,
      description: u.desc,
      eligibility: `GPA ${gpaDecimal}+, IELTS ${u.ielts || 6.0}+${u.gre ? `, GRE ${u.greScore || 310}+ required` : ' or equivalent'}`,
      courses: assignCourses(u.name, countryName),
      degreeLevels: ['Masters', 'PhD'],
      scholarshipAvailable: u.rank <= 400,
      intakes: ['Fall', 'Spring']
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// MAIN BUILD SCRIPT FOR MODULAR FILES
// ═══════════════════════════════════════════════════════════════════

function main() {
  console.log('🚀 Starting Modular University Data Generation...\n');
  
  const targetDir = path.join(__dirname, '../src/data/universities');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. USA Data
  const usaList = loadUSAJsonData();
  writeCountryFile(targetDir, 'usa.js', 'USA', usaList);

  // 2. UK Data
  const ukList = generateCountryUniversities(UK_UNIVERSITIES, 'UK', 'uk', 'tuitionGBP', 0.79);
  writeCountryFile(targetDir, 'uk.js', 'UK', ukList);

  // 3. Australia Data
  const ausList = generateCountryUniversities(AUSTRALIA_UNIVERSITIES, 'Australia', 'australia', 'tuitionAUD', 1.53);
  writeCountryFile(targetDir, 'australia.js', 'Australia', ausList);

  // 4. Canada Data
  const canList = generateCountryUniversities(CANADA_UNIVERSITIES, 'Canada', 'canada', 'tuitionCAD', 1.37);
  writeCountryFile(targetDir, 'canada.js', 'Canada', canList);

  // 5. Germany Data
  const gerList = generateCountryUniversities(GERMANY_UNIVERSITIES, 'Germany', 'germany', 'tuitionEUR', 0.92);
  writeCountryFile(targetDir, 'germany.js', 'Germany', gerList);

  // 6. Ireland Data
  const ireList = generateCountryUniversities(IRELAND_UNIVERSITIES, 'Ireland', 'ireland', 'tuitionEUR', 0.92);
  writeCountryFile(targetDir, 'ireland.js', 'Ireland', ireList);

  // 7. Italy Data
  const itaList = generateCountryUniversities(ITALY_UNIVERSITIES, 'Italy', 'italy', 'tuitionEUR', 0.92);
  writeCountryFile(targetDir, 'italy.js', 'Italy', itaList);

  // 8. France Data
  const fraList = generateCountryUniversities(FRANCE_UNIVERSITIES, 'France', 'france', 'tuitionEUR', 0.92);
  writeCountryFile(targetDir, 'france.js', 'France', fraList);

  // 9. NZ Data
  const nzList = generateCountryUniversities(NZ_UNIVERSITIES, 'New Zealand', 'new-zealand', 'tuitionNZD', 1.68);
  writeCountryFile(targetDir, 'newZealand.js', 'New Zealand', nzList);

  // 10. Generate Index file inside universities/ directory
  writeIndexFile(targetDir);

  // 11. Generate main backward-compatible file src/data/universities.js
  writeMainEntrypoint();

  console.log('\n✅ Modular files successfully generated in src/data/universities/');
}

function groupCityData(list) {
  const grouped = {};
  list.forEach(u => {
    const cityKey = u.city.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!grouped[cityKey]) grouped[cityKey] = [];
    grouped[cityKey].push(u);
  });
  return grouped;
}

function writeCountryFile(targetDir, filename, countryName, list) {
  const filePath = path.join(targetDir, filename);
  const cityGrouped = groupCityData(list);

  const content = `/**
 * ${countryName.toUpperCase()} UNIVERSITIES DATASET
 * Total: ${list.length} universities
 */

export const UNIVERSITIES_${countryName.replace(/\s+/g, '_').toUpperCase()} = ${JSON.stringify(list, null, 2)};

export const CITIES = ${JSON.stringify(cityGrouped, null, 2)};

export default UNIVERSITIES_${countryName.replace(/\s+/g, '_').toUpperCase()};
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  📄 Created ${filename} (${list.length} universities)`);
}

function writeIndexFile(targetDir) {
  const indexPath = path.join(targetDir, 'index.js');
  const content = `/**
 * CENTRALIZED UNIVERSITIES MODULE INDEX
 * Exports all country dataset modules & helper utility search functions.
 */

import { UNIVERSITIES_USA } from './usa';
import { UNIVERSITIES_UK } from './uk';
import { UNIVERSITIES_AUSTRALIA } from './australia';
import { UNIVERSITIES_CANADA } from './canada';
import { UNIVERSITIES_GERMANY } from './germany';
import { UNIVERSITIES_IRELAND } from './ireland';
import { UNIVERSITIES_ITALY } from './italy';
import { UNIVERSITIES_FRANCE } from './france';
import { UNIVERSITIES_NEW_ZEALAND } from './newZealand';

export { UNIVERSITIES_USA } from './usa';
export { UNIVERSITIES_UK } from './uk';
export { UNIVERSITIES_AUSTRALIA } from './australia';
export { UNIVERSITIES_CANADA } from './canada';
export { UNIVERSITIES_GERMANY } from './germany';
export { UNIVERSITIES_IRELAND } from './ireland';
export { UNIVERSITIES_ITALY } from './italy';
export { UNIVERSITIES_FRANCE } from './france';
export { UNIVERSITIES_NEW_ZEALAND } from './newZealand';

// Structured Object by Country
export const UNIVERSITIES_BY_COUNTRY = {
  usa: UNIVERSITIES_USA,
  uk: UNIVERSITIES_UK,
  australia: UNIVERSITIES_AUSTRALIA,
  canada: UNIVERSITIES_CANADA,
  germany: UNIVERSITIES_GERMANY,
  ireland: UNIVERSITIES_IRELAND,
  italy: UNIVERSITIES_ITALY,
  france: UNIVERSITIES_FRANCE,
  'new-zealand': UNIVERSITIES_NEW_ZEALAND
};

// Combined Master List
export const ALL_UNIVERSITIES = [
  ...UNIVERSITIES_USA,
  ...UNIVERSITIES_UK,
  ...UNIVERSITIES_AUSTRALIA,
  ...UNIVERSITIES_CANADA,
  ...UNIVERSITIES_GERMANY,
  ...UNIVERSITIES_IRELAND,
  ...UNIVERSITIES_ITALY,
  ...UNIVERSITIES_FRANCE,
  ...UNIVERSITIES_NEW_ZEALAND
];

/** Helpers */
export const getByCountry = (country) => {
  if (!country) return ALL_UNIVERSITIES;
  const slug = country.toLowerCase().replace(/\\s+/g, '-');
  return UNIVERSITIES_BY_COUNTRY[slug] || ALL_UNIVERSITIES.filter(u => u.country === slug || u.countryName.toLowerCase() === slug);
};

export const getByCity = (country, city) => {
  const countryUnis = getByCountry(country);
  if (!city) return countryUnis;
  const cityLower = city.toLowerCase();
  return countryUnis.filter(u => u.city.toLowerCase() === cityLower);
};

export const getByCourse = (course) => {
  if (!course) return ALL_UNIVERSITIES;
  const courseLower = course.toLowerCase();
  return ALL_UNIVERSITIES.filter(u => (u.courses || []).some(c => c.toLowerCase().includes(courseLower)));
};

export const getByCountryAndCourse = (country, course) => {
  const countryUnis = getByCountry(country);
  if (!course) return countryUnis;
  const courseLower = course.toLowerCase();
  return countryUnis.filter(u => (u.courses || []).some(c => c.toLowerCase().includes(courseLower)));
};

export default ALL_UNIVERSITIES;
`;

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log(`  📦 Created index.js module bundler`);
}

function writeMainEntrypoint() {
  const entryPath = path.join(__dirname, '../src/data/universities.js');
  const content = `/**
 * Re-export entrypoint from src/data/universities/index.js
 * Ensures clean modular imports throughout the codebase.
 */
export * from './universities/index.js';
export { default } from './universities/index.js';
`;
  fs.writeFileSync(entryPath, content, 'utf8');
  console.log(`  🔗 Created src/data/universities.js main re-export entrypoint`);
}

main();
