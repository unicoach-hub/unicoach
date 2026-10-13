// Diagnostic: on the cluster MONGO_URI points to, list all databases, their key
// collections and counts, so we can see where the app's legacy data lives vs cf_courses.
const { MongoClient } = require('mongodb');
(async () => {
  const c = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  await c.connect();
  console.log('URI db (default):', c.db().databaseName);
  const admin = c.db().admin();
  const { databases } = await admin.listDatabases();
  for (const d of databases) {
    if (['admin', 'local', 'config'].includes(d.name)) continue;
    const db = c.db(d.name);
    const cols = await db.listCollections().toArray();
    const interesting = cols.map(x => x.name).filter(n => /course|universit|countr|cf_|lead|user|scholar|blog/i.test(n));
    console.log(`\nDB "${d.name}" (${(d.sizeOnDisk/1048576).toFixed(1)}MB) — ${cols.length} collections`);
    for (const name of interesting.slice(0, 20)) {
      const n = await db.collection(name).estimatedDocumentCount();
      console.log(`   ${name}: ${n}`);
    }
  }
  await c.close();
})().catch(e => { console.error('DIAG FAILED:', e.message); process.exit(1); });
