require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Country = require('../models/Country');
const University = require('../models/University');

const deepseekUniversitiesData = [
  {
    "name": "Massachusetts Institute of Technology",
    "countryCode": "usa",
    "city": "Cambridge",
    "rank": "Rank 1 QS Rankings",
    "rankingNum": 1,
    "tuition": "$57,590 / yr",
    "tuitionFeeUSD": 57590,
    "minGpaPercent": 90,
    "minIeltsScore": 7.0,
    "minGreScore": 325,
    "greRequired": true,
    "acceptanceRate": 4,
    "type": "PRIVATE",
    "logo": "https://logo.clearbit.com/mit.edu",
    "website": "https://www.mit.edu",
    "description": "World leader in STEM fields, innovation, and cutting-edge research with a fiercely competitive admissions process.",
    "eligibility": "GPA 90%+, IELTS 7.0+, GRE required for most grad programs",
    "courses": ["Computer Science", "Mechanical Engineering", "Aerospace Engineering", "Electrical Engineering", "Business Analytics"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "Stanford University",
    "countryCode": "usa",
    "city": "Stanford",
    "rank": "Rank 6 QS Rankings",
    "rankingNum": 6,
    "tuition": "$58,416 / yr",
    "tuitionFeeUSD": 58416,
    "minGpaPercent": 88,
    "minIeltsScore": 7.0,
    "minGreScore": 328,
    "greRequired": true,
    "acceptanceRate": 4,
    "type": "PRIVATE",
    "logo": "https://logo.clearbit.com/stanford.edu",
    "website": "https://www.stanford.edu",
    "description": "Silicon Valley hub renowned for entrepreneurship, engineering, and business programs.",
    "eligibility": "GPA 88%+, IELTS 7.0+, GRE required for most grad programs",
    "courses": ["Computer Science", "Electrical Engineering", "MBA", "Mechanical Engineering", "Data Science"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "Harvard University",
    "countryCode": "usa",
    "city": "Cambridge",
    "rank": "Rank 4 QS Rankings",
    "rankingNum": 4,
    "tuition": "$56,550 / yr",
    "tuitionFeeUSD": 56550,
    "minGpaPercent": 88,
    "minIeltsScore": 7.0,
    "minGreScore": 325,
    "greRequired": true,
    "acceptanceRate": 3,
    "type": "PRIVATE",
    "logo": "https://logo.clearbit.com/harvard.edu",
    "website": "https://www.harvard.edu",
    "description": "Ivy League prestige with top law, business, medical, and arts & sciences programs.",
    "eligibility": "GPA 88%+, IELTS 7.0+, GRE required for most grad programs",
    "courses": ["MBA", "Law", "Public Policy", "Data Science", "Biological Sciences"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "California Institute of Technology",
    "countryCode": "usa",
    "city": "Pasadena",
    "rank": "Rank 10 QS Rankings",
    "rankingNum": 10,
    "tuition": "$60,864 / yr",
    "tuitionFeeUSD": 60864,
    "minGpaPercent": 90,
    "minIeltsScore": 7.0,
    "minGreScore": 330,
    "greRequired": true,
    "acceptanceRate": 3,
    "type": "PRIVATE",
    "logo": "https://logo.clearbit.com/caltech.edu",
    "website": "https://www.caltech.edu",
    "description": "Elite science and engineering powerhouse with a focus on research intensity and low student-to-faculty ratio.",
    "eligibility": "GPA 90%+, IELTS 7.0+, GRE required for grad programs",
    "courses": ["Physics", "Computer Science", "Aerospace Engineering", "Chemistry", "Biology"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "University of California, Berkeley",
    "countryCode": "usa",
    "city": "Berkeley",
    "rank": "Rank 12 QS Rankings",
    "rankingNum": 12,
    "tuition": "$45,627 / yr",
    "tuitionFeeUSD": 45627,
    "minGpaPercent": 80,
    "minIeltsScore": 6.5,
    "minGreScore": 315,
    "greRequired": true,
    "acceptanceRate": 11,
    "type": "PUBLIC",
    "logo": "https://logo.clearbit.com/berkeley.edu",
    "website": "https://www.berkeley.edu",
    "description": "Top-ranked public university known for engineering, computer science, and social activism.",
    "eligibility": "GPA 80%+, IELTS 6.5+, GRE required for most grad programs",
    "courses": ["Computer Science", "Data Science", "Mechanical Engineering", "Economics", "Molecular Biology"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "University of Chicago",
    "countryCode": "usa",
    "city": "Chicago",
    "rank": "Rank 21 QS Rankings",
    "rankingNum": 21,
    "tuition": "$64,656 / yr",
    "tuitionFeeUSD": 64656,
    "minGpaPercent": 85,
    "minIeltsScore": 7.0,
    "minGreScore": 320,
    "greRequired": true,
    "acceptanceRate": 5,
    "type": "PRIVATE",
    "logo": "https://logo.clearbit.com/uchicago.edu",
    "website": "https://www.uchicago.edu",
    "description": "Renowned for economics, political science, and its distinctive core curriculum and research output.",
    "eligibility": "GPA 85%+, IELTS 7.0+, GRE required for most grad programs",
    "courses": ["Economics", "Political Science", "MBA", "Data Science", "Law"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "Columbia University",
    "countryCode": "usa",
    "city": "New York",
    "rank": "Rank 34 QS Rankings",
    "rankingNum": 34,
    "tuition": "$65,340 / yr",
    "tuitionFeeUSD": 65340,
    "minGpaPercent": 85,
    "minIeltsScore": 7.0,
    "minGreScore": 318,
    "greRequired": true,
    "acceptanceRate": 4,
    "type": "PRIVATE",
    "logo": "https://logo.clearbit.com/columbia.edu",
    "website": "https://www.columbia.edu",
    "description": "Ivy League institution in NYC with exceptional journalism, business, and law programs.",
    "eligibility": "GPA 85%+, IELTS 7.0+, GRE required for most grad programs",
    "courses": ["Journalism", "MBA", "Law", "Computer Science", "Data Science"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "University of California, Los Angeles",
    "countryCode": "usa",
    "city": "Los Angeles",
    "rank": "Rank 42 QS Rankings",
    "rankingNum": 42,
    "tuition": "$44,217 / yr",
    "tuitionFeeUSD": 44217,
    "minGpaPercent": 80,
    "minIeltsScore": 6.5,
    "minGreScore": 312,
    "greRequired": true,
    "acceptanceRate": 9,
    "type": "PUBLIC",
    "logo": "https://logo.clearbit.com/ucla.edu",
    "website": "https://www.ucla.edu",
    "description": "Premier public university with strong film, medical, engineering, and social science programs.",
    "eligibility": "GPA 80%+, IELTS 6.5+, GRE required for most grad programs",
    "courses": ["Film & Media", "Computer Science", "Business Economics", "Psychology", "Electrical Engineering"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "Georgia Institute of Technology",
    "countryCode": "usa",
    "city": "Atlanta",
    "rank": "Rank 114 QS Rankings",
    "rankingNum": 114,
    "tuition": "$32,876 / yr",
    "tuitionFeeUSD": 32876,
    "minGpaPercent": 80,
    "minIeltsScore": 6.5,
    "minGreScore": 308,
    "greRequired": false,
    "acceptanceRate": 17,
    "type": "PUBLIC",
    "logo": "https://logo.clearbit.com/gatech.edu",
    "website": "https://www.gatech.edu",
    "description": "Top-tier public tech school known for engineering, CS, and exceptional ROI for international students.",
    "eligibility": "GPA 80%+, IELTS 6.5+, GRE optional for many programs",
    "courses": ["Computer Science", "Mechanical Engineering", "Data Science", "Cybersecurity", "Business Analytics"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "University of Illinois Urbana-Champaign",
    "countryCode": "usa",
    "city": "Champaign",
    "rank": "Rank 69 QS Rankings",
    "rankingNum": 69,
    "tuition": "$36,760 / yr",
    "tuitionFeeUSD": 36760,
    "minGpaPercent": 75,
    "minIeltsScore": 6.5,
    "minGreScore": 310,
    "greRequired": false,
    "acceptanceRate": 45,
    "type": "PUBLIC",
    "logo": "https://logo.clearbit.com/illinois.edu",
    "website": "https://www.illinois.edu",
    "description": "Elite public research university with legendary computer science and engineering departments.",
    "eligibility": "GPA 75%+, IELTS 6.5+, GRE optional for many programs",
    "courses": ["Computer Science", "Electrical Engineering", "Accounting", "Data Science", "Civil Engineering"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "University of Texas at Austin",
    "countryCode": "usa",
    "city": "Austin",
    "rank": "Rank 66 QS Rankings",
    "rankingNum": 66,
    "tuition": "$40,582 / yr",
    "tuitionFeeUSD": 40582,
    "minGpaPercent": 75,
    "minIeltsScore": 6.5,
    "minGreScore": 305,
    "greRequired": false,
    "acceptanceRate": 29,
    "type": "PUBLIC",
    "logo": "https://logo.clearbit.com/utexas.edu",
    "website": "https://www.utexas.edu",
    "description": "Major public university in booming tech city with top-ranked business, engineering, and communications.",
    "eligibility": "GPA 75%+, IELTS 6.5+, GRE optional for some programs",
    "courses": ["MBA", "Computer Science", "Petroleum Engineering", "Data Science", "Information Systems"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "Purdue University",
    "countryCode": "usa",
    "city": "West Lafayette",
    "rank": "Rank 89 QS Rankings",
    "rankingNum": 89,
    "tuition": "$31,104 / yr",
    "tuitionFeeUSD": 31104,
    "minGpaPercent": 70,
    "minIeltsScore": 6.5,
    "minGreScore": 300,
    "greRequired": false,
    "acceptanceRate": 50,
    "type": "PUBLIC",
    "logo": "https://logo.clearbit.com/purdue.edu",
    "website": "https://www.purdue.edu",
    "description": "High-value STEM powerhouse with deep industry ties and a massive international student community.",
    "eligibility": "GPA 70%+, IELTS 6.5+, GRE optional for many programs",
    "courses": ["Mechanical Engineering", "Computer Science", "Aerospace Engineering", "Data Science", "Business Analytics"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "New York University",
    "countryCode": "usa",
    "city": "New York",
    "rank": "Rank 43 QS Rankings",
    "rankingNum": 43,
    "tuition": "$60,438 / yr",
    "tuitionFeeUSD": 60438,
    "minGpaPercent": 80,
    "minIeltsScore": 7.0,
    "minGreScore": 310,
    "greRequired": false,
    "acceptanceRate": 8,
    "type": "PRIVATE",
    "logo": "https://logo.clearbit.com/nyu.edu",
    "website": "https://www.nyu.edu",
    "description": "Global hub in the heart of Manhattan with top arts, business, law, and media programs.",
    "eligibility": "GPA 80%+, IELTS 7.0+, GRE optional for many programs",
    "courses": ["Integrated Marketing", "MBA", "Computer Science", "Data Science", "Law"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  },
  {
    "name": "Northeastern University",
    "countryCode": "usa",
    "city": "Boston",
    "rank": "Rank 375 QS Rankings",
    "rankingNum": 375,
    "tuition": "$36,000 / yr",
    "tuitionFeeUSD": 36000,
    "minGpaPercent": 70,
    "minIeltsScore": 6.5,
    "minGreScore": 300,
    "greRequired": false,
    "acceptanceRate": 50,
    "type": "PRIVATE",
    "logo": "https://logo.clearbit.com/northeastern.edu",
    "website": "https://www.northeastern.edu",
    "description": "Renowned for top-tier Co-op experiential learning programs and strong industry links in Boston.",
    "eligibility": "GPA 70%+, IELTS 6.5+, GRE optional",
    "courses": ["Computer Science", "Data Science", "Information Systems", "Business Analytics", "Biotechnology"],
    "degreeLevels": ["Master's", "Bachelor's"]
  },
  {
    "name": "University of Southern California",
    "countryCode": "usa",
    "city": "Los Angeles",
    "rank": "Rank 125 QS Rankings",
    "rankingNum": 125,
    "tuition": "$64,726 / yr",
    "tuitionFeeUSD": 64726,
    "minGpaPercent": 80,
    "minIeltsScore": 7.0,
    "minGreScore": 312,
    "greRequired": false,
    "acceptanceRate": 10,
    "type": "PRIVATE",
    "logo": "https://logo.clearbit.com/usc.edu",
    "website": "https://www.usc.edu",
    "description": "Private LA powerhouse with world-renowned film, engineering, and business schools and vast alumni network.",
    "eligibility": "GPA 80%+, IELTS 7.0+, GRE optional for many programs",
    "courses": ["Computer Science", "MBA", "Film Production", "Data Science", "Electrical Engineering"],
    "degreeLevels": ["Master's", "Bachelor's", "PhD"]
  }
];

async function importDeepseek() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");

    let importedCount = 0;
    for (const uni of deepseekUniversitiesData) {
      let countryDoc = await Country.findOne({
        $or: [
          { name: new RegExp('^USA$', 'i') },
          { code: 'usa' }
        ]
      });

      if (!countryDoc) {
        countryDoc = await Country.create({
          name: 'USA',
          code: 'usa',
          cities: [uni.city]
        });
      } else {
        if (!countryDoc.cities.includes(uni.city)) {
          countryDoc.cities.push(uni.city);
          await countryDoc.save();
        }
      }

      const updatePayload = {
        name: uni.name,
        country: countryDoc._id,
        city: uni.city,
        rank: uni.rank,
        rankingNum: uni.rankingNum || 500,
        tuition: uni.tuition,
        tuitionFeeUSD: uni.tuitionFeeUSD,
        minGpaPercent: uni.minGpaPercent,
        minIeltsScore: uni.minIeltsScore,
        minGreScore: uni.minGreScore || 0,
        greRequired: uni.greRequired || false,
        acceptanceRate: uni.acceptanceRate || 50,
        type: uni.type,
        logo: uni.logo,
        website: uni.website,
        description: uni.description,
        eligibility: uni.eligibility,
        courses: uni.courses,
        degreeLevels: uni.degreeLevels,
        scholarshipAvailable: true
      };

      await University.findOneAndUpdate(
        { name: uni.name },
        updatePayload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[IMPORTED]: ${uni.name} (${uni.city}, USA)`);
      importedCount++;
    }

    console.log(`\nSuccessfully imported ${importedCount} top US Universities from DeepSeek into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to import DeepSeek data:", err);
    process.exit(1);
  }
}

importDeepseek();
