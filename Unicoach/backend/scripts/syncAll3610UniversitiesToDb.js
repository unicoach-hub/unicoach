/**
 * SYNC ALL 3,610 UNIVERSITIES TO MONGODB DATABASE
 * ===============================================
 * Synchronizes the complete audited 3,610 university master dataset
 * from master_all_universities.json into MongoDB.
 * 
 * - Ensures all countries (USA, UK, Canada, Germany, Australia, Ireland, France, Italy, New Zealand) are registered.
 * - Imports all 3,610 universities with structured fees, ranks, acceptance rates, and courses.
 * - Collects and registers all distinct cities per country for admin dropdown filters.
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Country = require('../models/Country');
const University = require('../models/University');
const masterData = require('../../master_all_universities.json');

const COUNTRY_MAP = {
  'USA': { code: 'usa', name: 'USA' },
  'UK': { code: 'uk', name: 'UK' },
  'Canada': { code: 'canada', name: 'Canada' },
  'Germany': { code: 'germany', name: 'Germany' },
  'Australia': { code: 'australia', name: 'Australia' },
  'Ireland': { code: 'ireland', name: 'Ireland' },
  'France': { code: 'france', name: 'France' },
  'Italy': { code: 'italy', name: 'Italy' },
  'New Zealand': { code: 'new-zealand', name: 'New Zealand' }
};

async function syncAllToMongo() {
  console.log('🚀 Starting Full MongoDB Sync of 3,610 Universities...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Ensure Countries Exist and Build Lookup Map
    const countryLookup = {};
    for (const [countryName, config] of Object.entries(COUNTRY_MAP)) {
      let doc = await Country.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${countryName}$`, 'i') } },
          { code: config.code }
        ]
      });

      if (!doc) {
        doc = new Country({
          name: config.name,
          code: config.code,
          cities: [],
          visaLinks: [`${config.name} Student Visa`, `${config.name} Intakes`],
          courseLinks: [`Masters in ${config.name}`, `MBA in ${config.name}`]
        });
        await doc.save();
        console.log(`✨ Created Country: ${config.name} (${config.code})`);
      } else {
        doc.name = config.name;
        doc.code = config.code;
        await doc.save();
      }

      countryLookup[countryName] = doc;
      countryLookup[countryName.toLowerCase()] = doc;
      countryLookup[config.code] = doc;
    }

    // 2. Clear Existing Universities to Ensure 100% Data Parity with Master Dataset
    console.log('🗑️ Resetting existing University collection for fresh, clean import...');
    await University.deleteMany({});

    // 3. Process & Prepare All Records
    console.log(`📦 Preparing ${masterData.length} university records...`);

    const countryCitiesMap = {};
    Object.keys(COUNTRY_MAP).forEach(k => { countryCitiesMap[k] = new Set(); });

    const universitiesToInsert = [];

    for (let i = 0; i < masterData.length; i++) {
      const u = masterData[i];
      const countryStr = u.country || 'USA';
      const countryDoc = countryLookup[countryStr] || countryLookup['USA'];

      const cityName = u.city || 'Central City';
      if (countryCitiesMap[countryDoc.name]) {
        countryCitiesMap[countryDoc.name].add(cityName);
      }

      const cleanType = (u.type && String(u.type).toUpperCase() === 'PRIVATE') ? 'PRIVATE' : 'PUBLIC';
      const tuitionVal = u.tuitionFeeUSD || 25000;
      const rankingNumVal = u.rankingNum || (u.rank && u.rank !== 'Unranked' ? parseInt(String(u.rank).replace(/\D/g, '')) || null : null);

      universitiesToInsert.push({
        name: u.name,
        country: countryDoc._id,
        city: cityName,
        logo: u.logo || '',
        website: u.website || '',
        rank: u.rank || 'Unranked',
        rankingNum: rankingNumVal,
        tuition: u.tuition || `$${tuitionVal.toLocaleString()} USD / yr`,
        tuitionFeeUSD: tuitionVal,
        type: cleanType,
        description: u.description || `${u.name} is a premier accredited institution located in ${cityName}, ${countryDoc.name}.`,
        eligibility: u.eligibility || 'GPA 2.8+ (60%+), IELTS 6.0+ / TOEFL 75+',
        acceptanceRate: u.acceptanceRate || 65,
        minGpaPercent: u.minGpaPercent || 60,
        minIeltsScore: u.minIeltsScore || 6.5,
        minGreScore: u.minGreScore || 0,
        greRequired: u.greRequired || false,
        courses: Array.isArray(u.courses) && u.courses.length > 0 ? u.courses : ["Computer Science", "Business Administration", "Engineering", "Data Science"],
        degreeLevels: Array.isArray(u.degreeLevels) && u.degreeLevels.length > 0 ? u.degreeLevels : ["Bachelor's", "Master's"],
        scholarshipAvailable: u.scholarshipAvailable !== false
      });
    }

    // 4. Batch Insert in Chunks of 500
    const chunkSize = 500;
    let insertedCount = 0;
    for (let i = 0; i < universitiesToInsert.length; i += chunkSize) {
      const chunk = universitiesToInsert.slice(i, i + chunkSize);
      await University.insertMany(chunk, { ordered: false });
      insertedCount += chunk.length;
      console.log(`⏳ Inserted ${insertedCount} / ${universitiesToInsert.length} universities...`);
    }

    // 5. Update Country Cities in Database
    console.log('🏙️ Updating Country Cities lists...');
    for (const [countryName, citySet] of Object.entries(countryCitiesMap)) {
      const countryDoc = countryLookup[countryName];
      if (countryDoc) {
        const sortedCities = Array.from(citySet).filter(Boolean).sort();
        countryDoc.cities = sortedCities;
        await countryDoc.save();
        console.log(`- ${countryName}: ${sortedCities.length} distinct cities registered`);
      }
    }

    // 6. Verify Final Count
    const finalCount = await University.countDocuments();
    console.log('\n────────────────────────────────────────────────────────');
    console.log('🎉 SYNC COMPLETE!');
    console.log(`• Total Universities now in MongoDB: ${finalCount} / 3610`);
    console.log('────────────────────────────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Error during sync:', err);
  } finally {
    process.exit();
  }
}

syncAllToMongo();
