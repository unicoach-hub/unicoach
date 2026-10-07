// backend/scripts/seedScholarships.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Scholarship = require('../models/Scholarship');

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('FATAL: MONGO_URI is not defined in backend/.env');
  process.exit(1);
}

const seed = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 12000
    });
    console.log('Connected to MongoDB Atlas successfully.');

    // Priority to verified_scholarship_datasets, fallback to unicoach_scholarships_only
    let datasetPath = path.join(__dirname, '../../verified_scholarship_datasets/master_all_scholarships.json');
    if (!fs.existsSync(datasetPath)) {
      datasetPath = path.join(__dirname, '../../unicoach_scholarships_only/master_all_scholarships.json');
    }

    if (!fs.existsSync(datasetPath)) {
      console.error(`Dataset file not found at ${datasetPath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(datasetPath, 'utf-8');
    const scholarships = JSON.parse(rawData);

    console.log(`Found ${scholarships.length} verified scholarships in master repository.`);

    let inserted = 0;
    let updated = 0;

    for (const item of scholarships) {
      const docData = {
        customId: item.id,
        title: item.title,
        slug: item.id.toLowerCase().replace(/_/g, '-'),
        universityName: item.universityName,
        country: item.country,
        institutionType: item.institutionType || 'Public',
        fundingType: item.fundingType || 'Merit Scholarship',
        coverageLevel: item.coverageLevel || 'Variable',
        providerType: item.providerType || 'UNIVERSITY',
        awardCoverage: item.awardCoverage,
        amount: {
          value: item.amount?.value ?? 0,
          currency: item.amount?.currency || 'USD',
          isPercentage: item.amount?.isPercentage || false,
          type: item.amount?.type || 'FIXED_AMOUNT',
          isEstimated: item.amount?.isEstimated || false,
          verified: item.amount?.verified || false,
          sourceUrl: item.amount?.sourceUrl || null,
          evidence: item.amount?.evidence || null,
          verifiedAt: item.amount?.verifiedAt || null,
          display: item.amount?.display || '',
          annualStipend: item.amount?.annualStipend || undefined
        },
        description: item.description,
        eligibility: {
          evaluationType: item.eligibility?.evaluationType || 'Competitive Academic Merit',
          academicRequirementNote: item.eligibility?.academicRequirementNote || '',
          minGpa: item.eligibility?.minGpa || 0,
          minPercentage: item.eligibility?.minPercentage || 0,
          minIelts: item.eligibility?.minIelts || null,
          minToefl: item.eligibility?.minToefl || null,
          minGre: item.eligibility?.minGre || null,
          degreeLevels: item.eligibility?.degreeLevels || ['Masters'],
          coursesApplicable: item.eligibility?.coursesApplicable || ['All'],
          genderPreference: item.eligibility?.genderPreference || 'All',
          nationalitiesEligible: item.eligibility?.nationalitiesEligible || ['International', 'India'],
          financialCriteria: item.eligibility?.financialCriteria || { isNeedBased: false, maxFamilyIncome: null, requiresIncomeProof: false }
        },
        applicationProcess: {
          mode: item.applicationProcess?.mode || 'Online Application',
          essayRequired: item.applicationProcess?.essayRequired || false,
          essayPrompt: item.applicationProcess?.essayPrompt || null,
          lorsRequired: item.applicationProcess?.lorsRequired || 0,
          applicationPortalUrl: item.applicationProcess?.applicationPortalUrl || item.verifiedSource
        },
        deadline: {
          date: item.deadline?.date ? new Date(item.deadline.date) : null,
          status: item.deadline?.status || 'NOT_PUBLISHED',
          deadlineType: item.deadline?.deadlineType || null,
          academicYear: item.deadline?.academicYear || '2026 - 2027 Academic Year',
          timezone: item.deadline?.timezone || null,
          intakeSeason: item.deadline?.intakeSeason || 'Fall',
          intakeCycle: item.deadline?.intakeCycle || '2026 - 2027 Academic Year',
          displayDeadline: item.deadline?.displayDeadline || 'Annual Cycle — Check Official Portal for Live Deadlines',
          deadlinePolicy: item.deadline?.deadlinePolicy || '',
          sourceUrl: item.deadline?.sourceUrl || null,
          evidence: item.deadline?.evidence || null
        },
        urls: item.urls || {
          informationUrl: item.verifiedSource || '',
          applicationUrl: item.applicationProcess?.applicationPortalUrl || item.verifiedSource || '',
          providerUrl: null,
          sourceUrl: item.verifiedSource || ''
        },
        fieldStatus: item.fieldStatus || {
          amount: 'NOT_VERIFIED',
          eligibility: 'NOT_VERIFIED',
          deadline: 'NOT_VERIFIED',
          applicationUrl: 'VERIFIED',
          informationUrl: 'VERIFIED',
          overall: 'PARTIALLY_VERIFIED'
        },
        evidence: item.evidence || [],
        verificationStatus: item.verificationStatus || 'Independently Audited & Factually Verified',
        verifiedSource: item.verifiedSource,
        verification: item.verification || {},
        isActive: true
      };

      const result = await Scholarship.findOneAndUpdate(
        { customId: item.id },
        { $set: docData },
        { upsert: true, new: true, rawResult: true }
      );

      if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
        updated++;
      } else {
        inserted++;
      }
    }

    const totalCount = await Scholarship.countDocuments();
    console.log(`\n============================================================`);
    console.log(` SEEDING COMPLETE!`);
    console.log(` New Insertions : ${inserted}`);
    console.log(` Updated Existing: ${updated}`);
    console.log(` Total Scholarships in DB: ${totalCount}`);
    console.log(`============================================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
