require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Country = require('../models/Country');
const University = require('../models/University');

// Smart Importer for Apify Google Maps JSON output
async function importApifyData(jsonArray) {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");

    // Valid educational categories
    const validCategories = [
      'university', 
      'public university', 
      'private university', 
      'college', 
      'community college',
      'academic department',
      'educational institution'
    ];

    let importedCount = 0;
    let skippedCount = 0;

    for (const item of jsonArray) {
      if (!item.title) continue;

      // Category filter: ensure it's a real university/college, not a park, studio or club
      const catName = (item.categoryName || '').toLowerCase();
      const categories = (item.categories || []).map(c => c.toLowerCase());
      
      const isEdu = validCategories.some(vc => catName.includes(vc) || categories.some(c => c.includes(vc)));

      // Additional blacklist check for title keywords
      const titleLower = item.title.toLowerCase();
      const isBlacklisted = titleLower.includes('park') || 
                            titleLower.includes('studio') || 
                            titleLower.includes('club') || 
                            titleLower.includes('place') || 
                            titleLower.includes('care center');

      if (!isEdu || isBlacklisted) {
        console.log(`[SKIPPED non-university]: ${item.title} (${item.categoryName})`);
        skippedCount++;
        continue;
      }

      // Determine Country
      const countryCode = (item.countryCode || 'US').toLowerCase() === 'us' ? 'usa' : (item.countryCode || 'usa').toLowerCase();
      const countryName = countryCode === 'usa' ? 'USA' : countryCode.toUpperCase();
      const cityName = item.city || 'New York';

      let countryDoc = await Country.findOne({
        $or: [
          { name: new RegExp(`^${countryName}$`, 'i') },
          { code: countryCode }
        ]
      });

      if (!countryDoc) {
        countryDoc = await Country.create({
          name: countryName,
          code: countryCode,
          cities: [cityName]
        });
      }

      // Determine type (Public vs Private vs Community College)
      let type = 'PUBLIC';
      if (catName.includes('private') || titleLower.includes('private')) {
        type = 'PRIVATE';
      }

      // Smart Defaults for Eligibility & Tuition based on university type
      let tuitionFeeUSD = 28000;
      let tuitionStr = "$28,000 / yr";
      let minGpaPercent = 65;
      let minIeltsScore = 6.5;
      let minGreScore = 0;
      let greRequired = false;

      if (catName.includes('community') || titleLower.includes('community')) {
        tuitionFeeUSD = 12000;
        tuitionStr = "$12,000 / yr";
        minGpaPercent = 55;
        minIeltsScore = 5.5;
      } else if (type === 'PRIVATE') {
        tuitionFeeUSD = 38000;
        tuitionStr = "$38,000 / yr";
        minGpaPercent = 75;
        minIeltsScore = 6.5;
        minGreScore = 305;
      }

      const updateData = {
        name: item.title,
        country: countryDoc._id,
        city: cityName,
        rank: item.totalScore ? `Rated ${item.totalScore}★ on Google` : "Recognized University",
        rankingNum: 400,
        tuition: tuitionStr,
        tuitionFeeUSD: tuitionFeeUSD,
        minGpaPercent: minGpaPercent,
        minIeltsScore: minIeltsScore,
        minGreScore: minGreScore,
        greRequired: greRequired,
        acceptanceRate: 65,
        type: type,
        logo: item.website ? `https://logo.clearbit.com/${new URL(item.website.startsWith('http') ? item.website : 'http://' + item.website).hostname}` : '',
        website: item.website || item.url,
        description: `Located at ${item.street || cityName}, ${cityName}. Phone: ${item.phone || 'N/A'}. Rated ${item.totalScore || '4.0'}★ (${item.reviewsCount || 50}+ reviews).`,
        eligibility: `Minimum GPA ${minGpaPercent}%+, IELTS ${minIeltsScore}+ required for international admissions.`,
        courses: ["Computer Science", "Data Science", "Business Administration", "Healthcare Management"],
        degreeLevels: ["Bachelor's", "Master's"],
        scholarshipAvailable: true
      };

      await University.findOneAndUpdate(
        { name: item.title },
        updateData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      console.log(`[IMPORTED UNIVERSITY]: ${item.title} in ${cityName} (${type})`);
      importedCount++;
    }

    console.log(`\nImport Summary: Successfully imported ${importedCount} universities! Skipped ${skippedCount} non-university items.`);
    process.exit(0);
  } catch (err) {
    console.error("Import failed:", err);
    process.exit(1);
  }
}

// Sample JSON data passed directly
const sampleApifyData = [
  {
    "title": "Bronx Community College",
    "totalScore": 4.1,
    "reviewsCount": 441,
    "street": "2155 University Ave",
    "city": "Bronx",
    "state": "New York",
    "countryCode": "US",
    "website": "http://www.bcc.cuny.edu/",
    "phone": "(718) 289-5100",
    "categories": ["Community college"],
    "categoryName": "Community college"
  },
  {
    "title": "Ciiddii Univercity",
    "categories": ["Adult day care center"],
    "categoryName": "Adult day care center"
  },
  {
    "title": "Univercity Place",
    "categories": ["State office of education"],
    "categoryName": "State office of education"
  },
  {
    "title": "City University of New York",
    "totalScore": 4.1,
    "reviewsCount": 9,
    "street": "31-10 Thomson Ave",
    "city": "Long Island City",
    "state": "New York",
    "countryCode": "US",
    "website": "http://www.cuny.edu/index.html",
    "phone": "(718) 482-7200",
    "categories": ["University"],
    "categoryName": "University"
  },
  {
    "title": "CUNY, The City University of New York",
    "totalScore": 4,
    "reviewsCount": 81,
    "street": "205 E 42nd St",
    "city": "New York",
    "state": "New York",
    "countryCode": "US",
    "website": "https://www.cuny.edu/",
    "phone": "(800) 286-9937",
    "categories": ["University", "Public university"],
    "categoryName": "University"
  },
  {
    "title": "Long Island University Brooklyn",
    "totalScore": 4,
    "reviewsCount": 312,
    "street": "1 University Plz",
    "city": "Brooklyn",
    "state": "New York",
    "countryCode": "US",
    "website": "http://www.liu.edu/Brooklyn",
    "phone": "(718) 488-1000",
    "categories": ["Private university", "University"],
    "categoryName": "Private university"
  },
  {
    "title": "The Univerxity",
    "categories": ["Photography studio"],
    "categoryName": "Photography studio"
  },
  {
    "title": "The University Club of New York",
    "categories": ["Club"],
    "categoryName": "Club"
  },
  {
    "title": "University Malls",
    "categories": ["Park"],
    "categoryName": "Park"
  }
];

importApifyData(sampleApifyData);
