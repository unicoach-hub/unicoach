require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Country = require('../models/Country');
const University = require('../models/University');

// Helper to convert tuition text to USD
function parseTuitionToUSD(tuitionStr) {
  if (!tuitionStr) return 25000;
  const str = tuitionStr.toString().toLowerCase();
  
  if (str.includes('free') || str.includes('€0')) return 500;
  
  // Extract INR Lakh (e.g. "₹28 Lakh INR/yr")
  const inrMatch = str.match(/₹?\s*(\d+(?:\.\d+)?)\s*lakh/i);
  if (inrMatch) {
    const lakh = parseFloat(inrMatch[1]);
    return Math.round((lakh * 100000) / 85); // 1 USD ≈ 85 INR
  }

  // Extract USD (e.g. "$36,000")
  const usdMatch = str.match(/\$\s*([\d,]+)/);
  if (usdMatch) {
    return parseInt(usdMatch[1].replace(/,/g, ''), 10);
  }

  // Extract GBP (e.g. "£27,000")
  const gbpMatch = str.match(/£\s*([\d,]+)/);
  if (gbpMatch) {
    return Math.round(parseInt(gbpMatch[1].replace(/,/g, ''), 10) * 1.25);
  }

  // Extract CAD / AUD / EUR
  const numMatch = str.match(/([\d,]{4,})/);
  if (numMatch) {
    return Math.round(parseInt(numMatch[1].replace(/,/g, ''), 10) * 0.75);
  }

  return 25000;
}

// Helper to convert eligibility string to GPA & IELTS
function parseEligibility(eligibilityStr) {
  let minGpaPercent = 65;
  let minIeltsScore = 6.5;
  let minGreScore = 0;
  let greRequired = false;

  if (!eligibilityStr) {
    return { minGpaPercent, minIeltsScore, minGreScore, greRequired };
  }

  const str = eligibilityStr.toString();

  // GRE check
  if (str.toLowerCase().includes('gre required') || str.toLowerCase().includes('gre 3')) {
    greRequired = true;
    const greMatch = str.match(/gre\s*(\d{3})/i);
    minGreScore = greMatch ? parseInt(greMatch[1], 10) : 310;
  }

  // GPA 4.0 scale check (e.g. 3.5+, 3.3+, 3.0+, 2.5+)
  const gpaMatch = str.match(/gpa\s*(\d(?:\.\d+)?)/i) || str.match(/(\d(?:\.\d+)?)\+\s*gpa/i);
  if (gpaMatch) {
    const gpa = parseFloat(gpaMatch[1]);
    if (gpa >= 3.7) minGpaPercent = 88;
    else if (gpa >= 3.5) minGpaPercent = 82;
    else if (gpa >= 3.3) minGpaPercent = 78;
    else if (gpa >= 3.0) minGpaPercent = 72;
    else if (gpa >= 2.8) minGpaPercent = 68;
    else if (gpa >= 2.5) minGpaPercent = 60;
  } else {
    // Percentage check e.g. 70%+
    const pctMatch = str.match(/(\d{2})%/);
    if (pctMatch) {
      minGpaPercent = parseInt(pctMatch[1], 10);
    }
  }

  // IELTS check e.g. IELTS 6.5+ or IELTS 7.0+
  const ieltsMatch = str.match(/ielts\s*(\d(?:\.\d+)?)/i);
  if (ieltsMatch) {
    minIeltsScore = parseFloat(ieltsMatch[1]);
  }

  return { minGpaPercent, minIeltsScore, minGreScore, greRequired };
}

// Master list of universities directly extracted from city pages & datasets
const allCityUniversities = [
  // --- AUSTRALIA - ADELAIDE ---
  {
    name: "University of Adelaide",
    countryCode: "australia",
    city: "Adelaide",
    rank: "Rank 89 QS Rankings",
    rankingNum: 89,
    tuition: "₹28 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/adelaide.edu.au",
    website: "https://www.adelaide.edu.au",
    description: "A prestigious member of Australia's Group of Eight research universities, renowned for agriculture, medicine, engineering, and wine science.",
    eligibility: "GPA 3.5+, IELTS 6.5+ or equivalent"
  },
  {
    name: "University of South Australia",
    countryCode: "australia",
    city: "Adelaide",
    rank: "Rank 326 QS Rankings",
    rankingNum: 326,
    tuition: "₹22 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/unisa.edu.au",
    website: "https://www.unisa.edu.au",
    description: "Australia's university of enterprise, globally connected and industry-informed.",
    eligibility: "GPA 3.0+, IELTS 6.0+ or equivalent"
  },
  {
    name: "Flinders University",
    countryCode: "australia",
    city: "Adelaide",
    rank: "Rank 380 QS Rankings",
    rankingNum: 380,
    tuition: "₹20 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/flinders.edu.au",
    website: "https://www.flinders.edu.au",
    description: "Innovative institution offering student-centered learning with strong medicine and tech programs.",
    eligibility: "GPA 2.8+, IELTS 6.0+ or equivalent"
  },
  {
    name: "Carnegie Mellon University Australia",
    countryCode: "australia",
    city: "Adelaide",
    rank: "Rank 52 QS Rankings",
    rankingNum: 52,
    tuition: "₹34 Lakh INR/yr",
    type: "PRIVATE",
    logo: "https://logo.clearbit.com/cmu.edu",
    website: "https://www.australia.cmu.edu",
    description: "US degree offered in Australia focusing on Information Technology and Public Policy.",
    eligibility: "GPA 3.5+, IELTS 7.0+, GRE required"
  },

  // --- AUSTRALIA - MELBOURNE ---
  {
    name: "University of Melbourne",
    countryCode: "australia",
    city: "Melbourne",
    rank: "Rank 14 QS Rankings",
    rankingNum: 14,
    tuition: "₹32 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/unimelb.edu.au",
    website: "https://www.unimelb.edu.au",
    description: "Australia's #1 ranked university, known for high academic standards and vibrant campus life.",
    eligibility: "GPA 3.6+, IELTS 6.5+ or equivalent"
  },
  {
    name: "Monash University",
    countryCode: "australia",
    city: "Melbourne",
    rank: "Rank 42 QS Rankings",
    rankingNum: 42,
    tuition: "₹30 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/monash.edu",
    website: "https://www.monash.edu",
    description: "Largest university in Australia and Group of Eight member with top pharmacy & engineering schools.",
    eligibility: "GPA 3.3+, IELTS 6.5+ or equivalent"
  },
  {
    name: "Deakin University",
    countryCode: "australia",
    city: "Melbourne",
    rank: "Rank 233 QS Rankings",
    rankingNum: 233,
    tuition: "₹21 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/deakin.edu.au",
    website: "https://www.deakin.edu.au",
    description: "Multi-award-winning university known for practical learning, IT, and sports science.",
    eligibility: "GPA 2.8+, IELTS 6.0+ or equivalent"
  },

  // --- AUSTRALIA - SYDNEY ---
  {
    name: "University of Sydney",
    countryCode: "australia",
    city: "Sydney",
    rank: "Rank 19 QS Rankings",
    rankingNum: 19,
    tuition: "₹33 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/sydney.edu.au",
    website: "https://www.sydney.edu.au",
    description: "Australia's first university, renowned globally for medicine, law, and business.",
    eligibility: "GPA 3.5+, IELTS 6.5+ or equivalent"
  },
  {
    name: "UNSW Sydney",
    countryCode: "australia",
    city: "Sydney",
    rank: "Rank 19 QS Rankings",
    rankingNum: 19,
    tuition: "₹32 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/unsw.edu.au",
    website: "https://www.unsw.edu.au",
    description: "Leading Group of Eight university famed for tech startups, engineering, and commerce.",
    eligibility: "GPA 3.4+, IELTS 6.5+ or equivalent"
  },
  {
    name: "University of Technology Sydney (UTS)",
    countryCode: "australia",
    city: "Sydney",
    rank: "Rank 90 QS Rankings",
    rankingNum: 90,
    tuition: "₹26 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/uts.edu.au",
    website: "https://www.uts.edu.au",
    description: "Top-ranked young university in Australia focused on technology, design, and innovation.",
    eligibility: "GPA 3.0+, IELTS 6.5+ or equivalent"
  },

  // --- USA - BOSTON ---
  {
    name: "Harvard University",
    countryCode: "usa",
    city: "Boston",
    rank: "Rank 4 QS Rankings",
    rankingNum: 4,
    tuition: "₹65 Lakh INR/yr",
    type: "PRIVATE",
    logo: "https://logo.clearbit.com/harvard.edu",
    website: "https://www.harvard.edu",
    description: "Ivy League institution, globally famous for law, medicine, business, and computer science.",
    eligibility: "GPA 3.8+, IELTS 7.5+, GRE required"
  },
  {
    name: "MIT (Massachusetts Institute of Technology)",
    countryCode: "usa",
    city: "Boston",
    rank: "Rank 1 QS Rankings",
    rankingNum: 1,
    tuition: "₹62 Lakh INR/yr",
    type: "PRIVATE",
    logo: "https://logo.clearbit.com/mit.edu",
    website: "https://www.mit.edu",
    description: "World's #1 university for technology, artificial intelligence, and engineering.",
    eligibility: "GPA 3.9+, IELTS 7.5+, GRE 325+"
  },
  {
    name: "Boston University",
    countryCode: "usa",
    city: "Boston",
    rank: "Rank 108 QS Rankings",
    rankingNum: 108,
    tuition: "₹62 Lakh INR/yr",
    type: "PRIVATE",
    logo: "https://logo.clearbit.com/bu.edu",
    website: "https://www.bu.edu",
    description: "Major research university offering diverse undergraduate & graduate programs.",
    eligibility: "GPA 3.5+, IELTS 7.0+, GRE required"
  },

  // --- UK - LONDON ---
  {
    name: "Imperial College London",
    countryCode: "uk",
    city: "London",
    rank: "Rank 6 QS Rankings",
    rankingNum: 6,
    tuition: "₹38 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/imperial.ac.uk",
    website: "https://www.imperial.ac.uk",
    description: "World leader in science, engineering, medicine, and business in London.",
    eligibility: "GPA 3.7+, IELTS 7.0+"
  },
  {
    name: "University College London (UCL)",
    countryCode: "uk",
    city: "London",
    rank: "Rank 9 QS Rankings",
    rankingNum: 9,
    tuition: "₹35 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ucl.ac.uk",
    website: "https://www.ucl.ac.uk",
    description: "London's global university, excelling in multidisciplinary research and computer science.",
    eligibility: "GPA 3.5+, IELTS 7.0+"
  },
  {
    name: "King's College London",
    countryCode: "uk",
    city: "London",
    rank: "Rank 40 QS Rankings",
    rankingNum: 40,
    tuition: "₹31 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/kcl.ac.uk",
    website: "https://www.kcl.ac.uk",
    description: "Historic research university in the center of London known for health, law, and humanities.",
    eligibility: "GPA 3.3+, IELTS 6.5+"
  },

  // --- CANADA - TORONTO ---
  {
    name: "University of Toronto",
    countryCode: "canada",
    city: "Toronto",
    rank: "Rank 21 QS Rankings",
    rankingNum: 21,
    tuition: "₹32 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/utoronto.ca",
    website: "https://www.utoronto.ca",
    description: "Canada's top university, famous for artificial intelligence, computer science, and medicine.",
    eligibility: "GPA 3.6+, IELTS 7.0+"
  },
  {
    name: "York University",
    countryCode: "canada",
    city: "Toronto",
    rank: "Rank 353 QS Rankings",
    rankingNum: 353,
    tuition: "₹22 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/yorku.ca",
    website: "https://www.yorku.ca",
    description: "Vibrant university in Toronto offering renowned Schulich School of Business and Lassonde Engineering.",
    eligibility: "GPA 3.0+, IELTS 6.5+"
  },
  {
    name: "Toronto Metropolitan University (Ryerson)",
    countryCode: "canada",
    city: "Toronto",
    rank: "Rank 801 QS Rankings",
    rankingNum: 801,
    tuition: "₹20 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/torontomu.ca",
    website: "https://www.torontomu.ca",
    description: "Downtown Toronto university known for media, engineering, and innovation hubs.",
    eligibility: "GPA 2.8+, IELTS 6.5+"
  }
];

async function syncAll() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");

    let synced = 0;
    for (const uni of allCityUniversities) {
      let countryDoc = await Country.findOne({
        $or: [
          { name: new RegExp(`^${uni.countryCode}$`, 'i') },
          { code: uni.countryCode.toLowerCase() }
        ]
      });

      if (!countryDoc) {
        countryDoc = await Country.create({
          name: uni.countryCode.toUpperCase(),
          code: uni.countryCode.toLowerCase(),
          cities: [uni.city]
        });
      }

      const parsedTuitionUSD = parseTuitionToUSD(uni.tuition);
      const { minGpaPercent, minIeltsScore, minGreScore, greRequired } = parseEligibility(uni.eligibility);

      const updateData = {
        name: uni.name,
        country: countryDoc._id,
        city: uni.city,
        rank: uni.rank,
        rankingNum: uni.rankingNum || 500,
        tuition: uni.tuition,
        tuitionFeeUSD: parsedTuitionUSD,
        minGpaPercent,
        minIeltsScore,
        minGreScore,
        greRequired,
        acceptanceRate: uni.rankingNum < 50 ? 15 : uni.rankingNum < 200 ? 45 : 70,
        type: uni.type || 'PUBLIC',
        logo: uni.logo,
        website: uni.website,
        description: uni.description,
        eligibility: uni.eligibility,
        courses: ["Computer Science", "Data Science", "Business Analytics", "MBA", "Software Engineering", "Finance", "Mechanical Engineering"],
        degreeLevels: ["Bachelor's", "Master's"],
        scholarshipAvailable: true
      };

      await University.findOneAndUpdate(
        { name: uni.name },
        updateData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      synced++;
    }

    console.log(`Successfully synced ${synced} universities into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to sync universities:", err);
    process.exit(1);
  }
}

syncAll();
