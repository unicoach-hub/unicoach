// One-off: reclaim M0 space by dropping MongoDB's bundled sample_* databases
// (sample_mflix etc.) that were auto-loaded at cluster creation and are unused by
// UniCoach. Safe — only drops databases whose name starts with "sample_".
//   MONGO_URI=... node scripts/coursefinder/free_space.js
const { MongoClient } = require('mongodb');
(async () => {
  const c = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  await c.connect();
  const admin = c.db().admin();
  const { databases } = await admin.listDatabases();
  let freed = 0;
  for (const d of databases) {
    if (/^sample_/i.test(d.name)) {
      console.log(`dropping "${d.name}" (${(d.sizeOnDisk/1048576).toFixed(1)}MB on disk)…`);
      await c.db(d.name).dropDatabase();
      freed += d.sizeOnDisk;
    }
  }
  console.log(`freed ~${(freed/1048576).toFixed(1)}MB on disk from sample databases`);
  // report remaining
  const after = await admin.listDatabases();
  for (const d of after.databases) {
    if (['admin','local','config'].includes(d.name)) continue;
    console.log(`  remaining DB "${d.name}": ${(d.sizeOnDisk/1048576).toFixed(1)}MB`);
  }
  await c.close();
})().catch(e => { console.error('FREE_SPACE FAILED:', e.message); process.exit(1); });
