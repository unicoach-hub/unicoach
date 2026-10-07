require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Country = require('../models/Country');
const University = require('../models/University');

const countriesData = [
  {
    name: 'USA',
    code: 'usa',
    cities: ['Chicago', 'Boston', 'Philadelphia', 'Los Angeles', 'Atlanta']
  },
  {
    name: 'UK',
    code: 'uk',
    cities: ['London', 'Glasgow', 'Leeds', 'Birmingham', 'Edinburgh']
  },
  {
    name: 'Canada',
    code: 'canada',
    cities: ['Halifax', 'Montreal', 'Toronto', 'Edmonton', 'London, Canada']
  },
  {
    name: 'Ireland',
    code: 'ireland',
    cities: ['Dublin']
  },
  {
    name: 'Australia',
    code: 'australia',
    cities: ['Melbourne', 'Sydney', 'Adelaide', 'Perth', 'Brisbane']
  },
  {
    name: 'Germany',
    code: 'germany',
    cities: ['Munich', 'Berlin', 'Heidelberg', 'Aachen', 'Karlsruhe', 'Hamburg', 'Freiburg']
  },
  {
    name: 'France',
    code: 'france',
    cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice']
  },
  {
    name: 'New Zealand',
    code: 'new-zealand',
    cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton']
  },
  {
    name: 'Italy',
    code: 'italy',
    cities: ['Rome', 'Milan', 'Florence', 'Venice', 'Bologna']
  }
];

const universitiesData = [
  // Dublin (Ireland) Universities
  {
    name: "Trinity College Dublin",
    countryCode: "ireland",
    city: "Dublin",
    rank: "Rank 98 QS Rankings",
    tuition: "₹23 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/tcd.ie",
    website: "https://www.tcd.ie",
    description: "Ireland's oldest and most prestigious university, founded in 1592, renowned for world-class research, law, business, and STEM programmes.",
    eligibility: "GPA 3.5+, IELTS 6.5+ or equivalent"
  },
  {
    name: "University College Dublin (UCD)",
    countryCode: "ireland",
    city: "Dublin",
    rank: "Rank 171 QS Rankings",
    tuition: "₹21 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ucd.ie",
    website: "https://www.ucd.ie",
    description: "Ireland's largest and most globally connected university, consistently ranked among the top 200 institutions worldwide, excelling in business, engineering, and sciences.",
    eligibility: "GPA 3.3+, IELTS 6.5+ or equivalent"
  },
  {
    name: "Dublin City University (DCU)",
    countryCode: "ireland",
    city: "Dublin",
    rank: "Rank 436 QS Rankings",
    tuition: "₹13 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/dcu.ie",
    website: "https://www.dcu.ie",
    description: "A dynamic, industry-focused university known for innovation, computing, communications, and strong employer partnerships in the heart of Dublin.",
    eligibility: "GPA 3.0+, IELTS 6.5+ or equivalent"
  },
  {
    name: "Technological University Dublin (TU Dublin)",
    countryCode: "ireland",
    city: "Dublin",
    rank: "Rank --",
    tuition: "₹12 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/tudublin.ie",
    website: "https://www.tudublin.ie",
    description: "Ireland's first technological university, offering career-focused programmes across engineering, science, business, arts, and built environment.",
    eligibility: "GPA 2.8+, IELTS 6.0+ or equivalent"
  },

  // Boston (USA) Universities
  {
    name: "Boston University",
    countryCode: "usa",
    city: "Boston",
    rank: "108 QS Rankings",
    tuition: "₹62 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/bu.edu",
    website: "https://www.bu.edu",
    description: "One of the largest private research universities in the US, known for its diverse programs and global impact.",
    eligibility: "Bachelor's degree with 3.5+ GPA, IELTS 7.0+, TOEFL 90+, GRE required"
  },
  {
    name: "Northeastern University",
    countryCode: "usa",
    city: "Boston",
    rank: "375 QS Rankings",
    tuition: "₹59 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/northeastern.edu",
    website: "https://www.northeastern.edu",
    description: "Known for its cooperative education program and experiential learning opportunities.",
    eligibility: "Bachelor's degree with 3.3+ GPA, IELTS 6.5+, TOEFL 80+, GRE required"
  },
  {
    name: "Boston Architectural College",
    countryCode: "usa",
    city: "Boston",
    rank: "--",
    tuition: "₹14 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/the-bac.edu",
    website: "https://www.the-bac.edu",
    description: "Specialized college focusing on architecture, design, and urban planning.",
    eligibility: "Bachelor's degree with 2.5+ GPA, IELTS 6.0+, Portfolio required"
  },
  {
    name: "Massachusetts College of Art and Design",
    countryCode: "usa",
    city: "Boston",
    rank: "--",
    tuition: "₹39 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/massart.edu",
    website: "https://www.massart.edu",
    description: "Leading public college of art and design in the US.",
    eligibility: "Bachelor's degree with 2.5+ GPA, IELTS 6.0+, Portfolio required"
  },
  {
    name: "Simmons University",
    countryCode: "usa",
    city: "Boston",
    rank: "--",
    tuition: "₹43 Lakh INR/yr",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/simmons.edu",
    website: "https://www.simmons.edu",
    description: "Private women's college known for its nursing, business, and social work programs.",
    eligibility: "Bachelor's degree with 3.0+ GPA, IELTS 6.5+, TOEFL 80+"
  },

  // Germany Best Universities (Category tags)
  {
    name: "Technical University of Munich (TUM)",
    countryCode: "germany",
    city: "Munich",
    rank: "22nd Global",
    tuition: "Free (Some state fees may apply)",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/tum.de",
    website: "https://www.tum.de",
    description: "Consistently ranked as Germany's number 1 university. It features in the Global Top 30 and has deep integration with Munich's high-tech industry.",
    eligibility: "Acceptance: 8% - 15%, Top CS & Engineering",
    categoryTags: ["best", "public", "engineering"]
  },
  {
    name: "Ludwig Maximilian University (LMU) Munich",
    countryCode: "germany",
    city: "Munich",
    rank: "58th Global",
    tuition: "Free (€300 semester fee)",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/lmu.de",
    website: "https://www.lmu.de",
    description: "One of Europe's oldest and most prestigious research universities, leading major clusters of excellence in the heart of Bavaria.",
    eligibility: "Acceptance: 10% - 18%, Top Data Science & Medicine",
    categoryTags: ["best", "public"]
  },
  {
    name: "Heidelberg University",
    countryCode: "germany",
    city: "Heidelberg",
    rank: "80th Global",
    tuition: "€1,500 / semester (non-EU)",
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/uni-heidelberg.de",
    website: "https://www.uni-heidelberg.de",
    description: "Germany's oldest university (established in 1386) and a world-renowned research powerhouse, highly sought-after for life sciences.",
    eligibility: "Acceptance: 15% - 25%",
    categoryTags: ["best", "public", "affordable"]
  }
];

async function seed() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error("Error: MONGO_URI is not set in environment.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected successfully!");

    // Seed Countries
    console.log("Seeding Countries...");
    const seededCountries = [];
    for (const c of countriesData) {
      let country = await Country.findOne({ code: c.code });
      if (!country) {
        country = new Country(c);
        await country.save();
        console.log(`Created Country: ${c.name}`);
      } else {
        // Update cities if list is different
        country.cities = c.cities;
        await country.save();
        console.log(`Updated Country: ${c.name}`);
      }
      seededCountries.push(country);
    }

    // Seed Universities
    console.log("Seeding Universities...");
    for (const u of universitiesData) {
      const country = seededCountries.find(c => c.code === u.countryCode);
      if (!country) {
        console.log(`Warning: Country code ${u.countryCode} not found for university ${u.name}`);
        continue;
      }

      // Check if university already exists
      const existing = await University.findOne({
        name: u.name,
        country: country._id,
        city: u.city
      });

      if (!existing) {
        const uni = new University({
          name: u.name,
          country: country._id,
          city: u.city,
          logo: u.logo,
          website: u.website,
          rank: u.rank,
          tuition: u.tuition,
          type: u.type,
          description: u.description,
          eligibility: u.eligibility,
          categoryTags: u.categoryTags || []
        });
        await uni.save();
        console.log(`Created University: ${u.name} in ${u.city}`);
      } else {
        console.log(`Skipped existing University: ${u.name}`);
      }
    }

    console.log("Seeding finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
