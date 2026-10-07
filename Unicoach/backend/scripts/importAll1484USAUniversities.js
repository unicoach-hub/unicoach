require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Country = require('../models/Country');
const University = require('../models/University');

async function importAll1484() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");

    let countryDoc = await Country.findOne({ code: 'usa' });
    if (!countryDoc) {
      countryDoc = await Country.create({ name: 'USA', code: 'usa', cities: [] });
    }

    // Read list.js file
    const listFilePath = path.join(__dirname, '../../frontend/src/data/countries/usa/universities/list.js');
    console.log("Reading 1,484 USA Universities from list.js...");
    const rawContent = fs.readFileSync(listFilePath, 'utf8');

    // Extract JSON array string
    const arrayMatch = rawContent.match(/export const UNIVERSITIES_USA = (\[[\s\S]*\]);/);
    if (!arrayMatch) {
      throw new Error("Could not parse UNIVERSITIES_USA array from list.js");
    }

    const universitiesList = JSON.parse(arrayMatch[1]);
    console.log(`Loaded ${universitiesList.length} universities from list.js dataset!`);

    console.log("Bulk importing/upserting into MongoDB in batches of 200...");
    let imported = 0;
    const batchSize = 200;

    for (let i = 0; i < universitiesList.length; i += batchSize) {
      const batch = universitiesList.slice(i, i + batchSize);
      const bulkOps = batch.map(uni => ({
        updateOne: {
          filter: { name: uni.name },
          update: {
            $set: {
              name: uni.name,
              country: countryDoc._id,
              city: uni.city || 'New York',
              rank: uni.rank || 'Recognized University',
              rankingNum: uni.rankingNum || 500,
              tuition: uni.tuition && uni.tuition !== 'N/A' ? uni.tuition : `$${(uni.tuitionFeeUSD || 25000).toLocaleString()} / yr`,
              tuitionFeeUSD: uni.tuitionFeeUSD || 25000,
              minGpaPercent: uni.minGpaPercent || 65,
              minIeltsScore: uni.minIeltsScore || 6.5,
              minGreScore: uni.minGreScore || 0,
              greRequired: !!uni.greRequired,
              acceptanceRate: uni.acceptanceRate || 60,
              type: uni.type || 'PUBLIC',
              logo: uni.logo ? `https://logo.clearbit.com/${uni.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu` : '',
              website: uni.website || `https://${uni.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu`,
              description: uni.description || `${uni.name} is a leading institution offering undergraduate and graduate programs.`,
              eligibility: uni.eligibility || `GPA ${uni.minGpaPercent || 65}%+, IELTS ${uni.minIeltsScore || 6.5}+ required.`,
              courses: uni.courses || ["Computer Science", "Data Science", "Business Administration"],
              degreeLevels: uni.degreeLevels || ["Master's", "Bachelor's"],
              scholarshipAvailable: true
            }
          },
          upsert: true
        }
      }));

      await University.bulkWrite(bulkOps);
      imported += batch.length;
      console.log(`Processed ${imported}/${universitiesList.length} universities...`);
    }

    console.log(`\n🎉 SUCCESS! Fully imported/upserted ALL ${imported} USA Universities with eligibility criteria into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error("Bulk import failed:", err);
    process.exit(1);
  }
}

importAll1484();
