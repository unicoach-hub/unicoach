require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Country = require('../models/Country');
const University = require('../models/University');

const countriesData = [
  { name: 'USA', code: 'usa', cities: ['Chicago', 'Boston', 'Philadelphia', 'Los Angeles', 'Atlanta', 'New York', 'Seattle', 'San Jose'] },
  { name: 'UK', code: 'uk', cities: ['London', 'Glasgow', 'Leeds', 'Birmingham', 'Edinburgh', 'Manchester', 'Oxford', 'Cambridge'] },
  { name: 'Canada', code: 'canada', cities: ['Halifax', 'Montreal', 'Toronto', 'Edmonton', 'Vancouver', 'Ottawa'] },
  { name: 'Ireland', code: 'ireland', cities: ['Dublin', 'Cork', 'Galway', 'Limerick'] },
  { name: 'Australia', code: 'australia', cities: ['Melbourne', 'Sydney', 'Adelaide', 'Perth', 'Brisbane', 'Canberra'] },
  { name: 'Germany', code: 'germany', cities: ['Munich', 'Berlin', 'Heidelberg', 'Aachen', 'Karlsruhe', 'Hamburg', 'Freiburg', 'Stuttgart'] },
  { name: 'France', code: 'france', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'] },
  { name: 'New Zealand', code: 'new-zealand', cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton'] },
  { name: 'Italy', code: 'italy', cities: ['Rome', 'Milan', 'Florence', 'Venice', 'Bologna'] }
];

const universitiesData = [
  // --- USA ---
  {
    name: "Northeastern University",
    countryCode: "usa",
    city: "Boston",
    rank: "Rank 375 QS Rankings",
    rankingNum: 375,
    tuition: "$36,000 / yr",
    tuitionFeeUSD: 36000,
    minGpaPercent: 70,
    minIeltsScore: 6.5,
    minGreScore: 300,
    greRequired: false,
    acceptanceRate: 50,
    type: "PRIVATE",
    logo: "https://logo.clearbit.com/northeastern.edu",
    website: "https://www.northeastern.edu",
    description: "Renowned for top-tier Co-op experiential learning programs and strong industry links in Boston.",
    eligibility: "GPA 70%+, IELTS 6.5+, GRE optional",
    courses: ["Computer Science", "Data Science", "Information Systems", "Business Analytics", "Biotechnology", "Finance"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "University of Illinois Chicago (UIC)",
    countryCode: "usa",
    city: "Chicago",
    rank: "Rank 250 QS Rankings",
    rankingNum: 250,
    tuition: "$31,000 / yr",
    tuitionFeeUSD: 31000,
    minGpaPercent: 65,
    minIeltsScore: 6.5,
    minGreScore: 305,
    greRequired: false,
    acceptanceRate: 72,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/uic.edu",
    website: "https://www.uic.edu",
    description: "Leading public research university in central Chicago with top STEM and Healthcare programs.",
    eligibility: "GPA 65%+, IELTS 6.5+",
    courses: ["Computer Science", "Electrical Engineering", "Health Informatics", "MBA", "Finance"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "University of Southern California (USC)",
    countryCode: "usa",
    city: "Los Angeles",
    rank: "Rank 116 QS Rankings",
    rankingNum: 116,
    tuition: "$48,000 / yr",
    tuitionFeeUSD: 48000,
    minGpaPercent: 80,
    minIeltsScore: 7.0,
    minGreScore: 315,
    greRequired: true,
    acceptanceRate: 12,
    type: "PRIVATE",
    logo: "https://logo.clearbit.com/usc.edu",
    website: "https://www.usc.edu",
    description: "World-class institution in LA known for Cinematic Arts, Viterbi School of Engineering, and alumni network.",
    eligibility: "GPA 80%+, IELTS 7.0+, GRE 315+",
    courses: ["Computer Science", "Data Science", "Cinematic Arts", "Electrical Engineering", "MBA"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "Georgia Institute of Technology",
    countryCode: "usa",
    city: "Atlanta",
    rank: "Rank 97 QS Rankings",
    rankingNum: 97,
    tuition: "$33,000 / yr",
    tuitionFeeUSD: 33000,
    minGpaPercent: 85,
    minIeltsScore: 7.5,
    minGreScore: 320,
    greRequired: true,
    acceptanceRate: 16,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/gatech.edu",
    website: "https://www.gatech.edu",
    description: "Top 10 public university in the US specializing in Engineering, CS, and technology research.",
    eligibility: "GPA 85%+, IELTS 7.5+, GRE 320+",
    courses: ["Computer Science", "Cybersecurity", "Mechanical Engineering", "Aerospace Engineering", "Data Analytics"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "San Jose State University",
    countryCode: "usa",
    city: "San Jose",
    rank: "Rank 800 QS Rankings",
    rankingNum: 800,
    tuition: "$22,000 / yr",
    tuitionFeeUSD: 22000,
    minGpaPercent: 60,
    minIeltsScore: 6.0,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 75,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/sjsu.edu",
    website: "https://www.sjsu.edu",
    description: "Located in Silicon Valley, sending more graduates to Tech Giants than almost any other university.",
    eligibility: "GPA 60%+, IELTS 6.0+",
    courses: ["Software Engineering", "Computer Science", "Data Analytics", "Electrical Engineering", "Business Administration"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: false
  },

  // --- UK ---
  {
    name: "University of Manchester",
    countryCode: "uk",
    city: "Manchester",
    rank: "Rank 32 QS Rankings",
    rankingNum: 32,
    tuition: "£27,000 / yr",
    tuitionFeeUSD: 34000,
    minGpaPercent: 75,
    minIeltsScore: 6.5,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 56,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/manchester.ac.uk",
    website: "https://www.manchester.ac.uk",
    description: "Prestigious Russell Group university famous for science, artificial intelligence, and business.",
    eligibility: "GPA 75%+, IELTS 6.5+",
    courses: ["Computer Science", "Artificial Intelligence", "Finance", "Management", "Biotechnology"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "Imperial College London",
    countryCode: "uk",
    city: "London",
    rank: "Rank 6 QS Rankings",
    rankingNum: 6,
    tuition: "£36,000 / yr",
    tuitionFeeUSD: 45000,
    minGpaPercent: 85,
    minIeltsScore: 7.0,
    minGreScore: 320,
    greRequired: false,
    acceptanceRate: 14,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/imperial.ac.uk",
    website: "https://www.imperial.ac.uk",
    description: "World leader in STEM & Business education located in South Kensington, London.",
    eligibility: "GPA 85%+, IELTS 7.0+",
    courses: ["Computing", "Computing (Machine Learning)", "Finance", "Mechanical Engineering", "Biomedical Engineering"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "University of Birmingham",
    countryCode: "uk",
    city: "Birmingham",
    rank: "Rank 84 QS Rankings",
    rankingNum: 84,
    tuition: "£24,000 / yr",
    tuitionFeeUSD: 30000,
    minGpaPercent: 65,
    minIeltsScore: 6.5,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 70,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/birmingham.ac.uk",
    website: "https://www.birmingham.ac.uk",
    description: "Red brick Russell Group university offering rich campus life and strong employability.",
    eligibility: "GPA 65%+, IELTS 6.5+",
    courses: ["Computer Science", "Data Science", "International Business", "Engineering Management"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },

  // --- CANADA ---
  {
    name: "University of Toronto",
    countryCode: "canada",
    city: "Toronto",
    rank: "Rank 21 QS Rankings",
    rankingNum: 21,
    tuition: "CAD $42,000 / yr",
    tuitionFeeUSD: 31000,
    minGpaPercent: 82,
    minIeltsScore: 7.0,
    minGreScore: 310,
    greRequired: false,
    acceptanceRate: 43,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/utoronto.ca",
    website: "https://www.utoronto.ca",
    description: "Canada's top university, globally recognized for AI, Medicine, Law, and Engineering.",
    eligibility: "GPA 82%+, IELTS 7.0+",
    courses: ["Applied Computing", "Computer Science", "MBA", "Data Science", "Civil Engineering"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "University of British Columbia (UBC)",
    countryCode: "canada",
    city: "Vancouver",
    rank: "Rank 34 QS Rankings",
    rankingNum: 34,
    tuition: "CAD $38,000 / yr",
    tuitionFeeUSD: 28000,
    minGpaPercent: 78,
    minIeltsScore: 6.5,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 50,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ubc.ca",
    website: "https://www.ubc.ca",
    description: "Global center for research and teaching, surrounded by Pacific Ocean and mountains in Vancouver.",
    eligibility: "GPA 78%+, IELTS 6.5+",
    courses: ["Computer Science", "Business Analytics", "Environmental Studies", "Electrical Engineering"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "Concordia University",
    countryCode: "canada",
    city: "Montreal",
    rank: "Rank 450 QS Rankings",
    rankingNum: 450,
    tuition: "CAD $24,000 / yr",
    tuitionFeeUSD: 18000,
    minGpaPercent: 65,
    minIeltsScore: 6.5,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 78,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/concordia.ca",
    website: "https://www.concordia.ca",
    description: "Vibrant English-language public research university in heart of Montreal with great affordable options.",
    eligibility: "GPA 65%+, IELTS 6.5+",
    courses: ["Software Engineering", "Computer Science", "Information Systems Security", "MBA"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },

  // --- GERMANY ---
  {
    name: "Technical University of Munich (TUM)",
    countryCode: "germany",
    city: "Munich",
    rank: "Rank 37 QS Rankings",
    rankingNum: 37,
    tuition: "€6,000 / yr",
    tuitionFeeUSD: 6500,
    minGpaPercent: 80,
    minIeltsScore: 6.5,
    minGreScore: 315,
    greRequired: true,
    acceptanceRate: 8,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/tum.de",
    website: "https://www.tum.de",
    description: "Germany's premier technical university known for innovation, robotics, engineering, and CS.",
    eligibility: "GPA 80%+, IELTS 6.5+, GRE (for CS)",
    courses: ["Informatics (CS)", "Data Engineering & Analytics", "Robotics", "Management & Tech"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "RWTH Aachen University",
    countryCode: "germany",
    city: "Aachen",
    rank: "Rank 106 QS Rankings",
    rankingNum: 106,
    tuition: "€0 (Free Tuition, €300 Semester Fee)",
    tuitionFeeUSD: 700,
    minGpaPercent: 75,
    minIeltsScore: 6.5,
    minGreScore: 310,
    greRequired: true,
    acceptanceRate: 25,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/rwth-aachen.de",
    website: "https://www.rwth-aachen.de",
    description: "Largest technical university in Germany with top-ranking engineering and computer science faculties.",
    eligibility: "GPA 75%+, IELTS 6.5+, GRE 310+",
    courses: ["Computer Science", "Automotive Engineering", "Electrical Engineering", "Software Systems"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "IU International University of Applied Sciences",
    countryCode: "germany",
    city: "Berlin",
    rank: "Unranked",
    rankingNum: 999,
    tuition: "€12,000 / yr",
    tuitionFeeUSD: 13000,
    minGpaPercent: 55,
    minIeltsScore: 6.0,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 90,
    type: "PRIVATE",
    logo: "https://logo.clearbit.com/iu.org",
    website: "https://www.iu.org",
    description: "Flexible German private university offering English programs, flexible intakes, and high visa success.",
    eligibility: "GPA 55%+, IELTS 6.0+",
    courses: ["Data Science", "Artificial Intelligence", "MBA", "Cyber Security", "Engineering Management"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },

  // --- AUSTRALIA ---
  {
    name: "University of Melbourne",
    countryCode: "australia",
    city: "Melbourne",
    rank: "Rank 14 QS Rankings",
    rankingNum: 14,
    tuition: "AUD $48,000 / yr",
    tuitionFeeUSD: 32000,
    minGpaPercent: 75,
    minIeltsScore: 6.5,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 70,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/unimelb.edu.au",
    website: "https://www.unimelb.edu.au",
    description: "Australia's #1 ranked university, known for high academic standards and cultural campus in Melbourne.",
    eligibility: "GPA 75%+, IELTS 6.5+",
    courses: ["Computer Science", "Information Technology", "Master of Management", "Data Science"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "University of Sydney",
    countryCode: "australia",
    city: "Sydney",
    rank: "Rank 19 QS Rankings",
    rankingNum: 19,
    tuition: "AUD $50,000 / yr",
    tuitionFeeUSD: 33000,
    minGpaPercent: 72,
    minIeltsScore: 6.5,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 30,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/sydney.edu.au",
    website: "https://www.sydney.edu.au",
    description: "Australia's first university, renowned globally for law, medicine, engineering, and business.",
    eligibility: "GPA 72%+, IELTS 6.5+",
    courses: ["Information Technology", "Cybersecurity", "Data Science", "Project Management"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "RMIT University",
    countryCode: "australia",
    city: "Melbourne",
    rank: "Rank 140 QS Rankings",
    rankingNum: 140,
    tuition: "AUD $36,000 / yr",
    tuitionFeeUSD: 24000,
    minGpaPercent: 60,
    minIeltsScore: 6.0,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 85,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/rmit.edu.au",
    website: "https://www.rmit.edu.au",
    description: "Global university of technology, design, and enterprise with strong industry ties.",
    eligibility: "GPA 60%+, IELTS 6.0+",
    courses: ["Information Technology", "Data Science", "Cyber Security", "Master of Commerce"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },

  // --- IRELAND ---
  {
    name: "Trinity College Dublin",
    countryCode: "ireland",
    city: "Dublin",
    rank: "Rank 98 QS Rankings",
    rankingNum: 98,
    tuition: "€24,000 / yr",
    tuitionFeeUSD: 26000,
    minGpaPercent: 75,
    minIeltsScore: 6.5,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 34,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/tcd.ie",
    website: "https://www.tcd.ie",
    description: "Ireland's oldest university with world-leading CS, Business, and Humanities research.",
    eligibility: "GPA 75%+, IELTS 6.5+",
    courses: ["Computer Science", "High Performance Computing", "Financial Risk Management", "MBA"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "University College Dublin (UCD)",
    countryCode: "ireland",
    city: "Dublin",
    rank: "Rank 171 QS Rankings",
    rankingNum: 171,
    tuition: "€22,000 / yr",
    tuitionFeeUSD: 24000,
    minGpaPercent: 70,
    minIeltsScore: 6.5,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 50,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ucd.ie",
    website: "https://www.ucd.ie",
    description: "Ireland's largest university, offering top Smurfit Business School & Tech master's.",
    eligibility: "GPA 70%+, IELTS 6.5+",
    courses: ["Computer Science (Negotiated Learning)", "Data & Computational Science", "Business Analytics"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  },
  {
    name: "Dublin City University (DCU)",
    countryCode: "ireland",
    city: "Dublin",
    rank: "Rank 436 QS Rankings",
    rankingNum: 436,
    tuition: "€16,000 / yr",
    tuitionFeeUSD: 17500,
    minGpaPercent: 60,
    minIeltsScore: 6.5,
    minGreScore: 0,
    greRequired: false,
    acceptanceRate: 70,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/dcu.ie",
    website: "https://www.dcu.ie",
    description: "Dynamic university known for strong employer connections in Dublin's tech hub.",
    eligibility: "GPA 60%+, IELTS 6.5+",
    courses: ["Computing", "Electronic & Computer Engineering", "Data Analytics"],
    degreeLevels: ["Master's", "Bachelor's"],
    scholarshipAvailable: true
  }
];

async function seedUniversitiesWithShortlisting() {
  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected!');

    console.log('Upserting Countries...');
    const countryMap = {};
    for (const cData of countriesData) {
      let countryDoc = await Country.findOne({ code: cData.code });
      if (!countryDoc) {
        countryDoc = await Country.create({
          name: cData.name,
          code: cData.code,
          cities: cData.cities
        });
      } else {
        countryDoc.cities = [...new Set([...countryDoc.cities, ...cData.cities])];
        await countryDoc.save();
      }
      countryMap[cData.code] = countryDoc._id;
    }

    console.log('Upserting Universities with Shortlisting Criteria...');
    let seededCount = 0;

    for (const uniData of universitiesData) {
      const countryId = countryMap[uniData.countryCode];
      if (!countryId) continue;

      const updatePayload = {
        name: uniData.name,
        country: countryId,
        city: uniData.city,
        rank: uniData.rank,
        rankingNum: uniData.rankingNum || 500,
        tuition: uniData.tuition,
        tuitionFeeUSD: uniData.tuitionFeeUSD,
        minGpaPercent: uniData.minGpaPercent,
        minIeltsScore: uniData.minIeltsScore,
        minGreScore: uniData.minGreScore || 0,
        greRequired: uniData.greRequired || false,
        acceptanceRate: uniData.acceptanceRate || 60,
        type: uniData.type,
        logo: uniData.logo,
        website: uniData.website,
        description: uniData.description,
        eligibility: uniData.eligibility,
        courses: uniData.courses || ["Computer Science", "Data Science", "MBA"],
        degreeLevels: uniData.degreeLevels || ["Master's", "Bachelor's"],
        scholarshipAvailable: uniData.scholarshipAvailable !== undefined ? uniData.scholarshipAvailable : true,
        categoryTags: [uniData.countryCode.toUpperCase(), uniData.type]
      };

      await University.findOneAndUpdate(
        { name: uniData.name, country: countryId },
        updatePayload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededCount++;
    }

    console.log(`Successfully seeded/updated ${seededCount} universities with complete shortlisting criteria!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding universities:', err);
    process.exit(1);
  }
}

seedUniversitiesWithShortlisting();
