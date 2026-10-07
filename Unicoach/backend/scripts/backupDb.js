// backend/scripts/backupDb.js - Database Export & Safety Snapshot Tool
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const COLLECTIONS_TO_BACKUP = [
  'universities',
  'leads',
  'users',
  'scholarships',
  'countries',
  'settings',
  'templates',
  'pipelines',
  'customforms'
];

async function backupDatabase() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('❌ FATAL: MONGO_URI is not defined in .env');
    process.exit(1);
  }

  console.log('================================================================');
  console.log('       💾 UNICOACH PRODUCTION DATABASE SNAPSHOT TOOL            ');
  console.log('================================================================\n');

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected successfully to database.\n');

    const db = mongoose.connection.db;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups', `snapshot_${timestamp}`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`📁 Target Backup Directory: ${backupDir}\n`);

    let totalRecords = 0;
    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);

    for (const colName of COLLECTIONS_TO_BACKUP) {
      if (!existingCollections.includes(colName)) {
        console.log(`- ⚠️ Collection [${colName}] does not exist in DB yet, skipping.`);
        continue;
      }

      const collection = db.collection(colName);
      const docs = await collection.find({}).toArray();
      const filePath = path.join(backupDir, `${colName}.json`);

      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
      console.log(`- ✅ Backed up [${colName}]: ${docs.length} documents -> ${colName}.json`);
      totalRecords += docs.length;
    }

    console.log(`\n🎉 SUCCESS: Database snapshot complete! Total documents backed up: ${totalRecords}`);
    console.log(`📦 Stored safely in: ${backupDir}\n`);
  } catch (err) {
    console.error('❌ Backup failed with error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

backupDatabase();
