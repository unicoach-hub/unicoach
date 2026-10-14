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
    const st = await db.stats();
    console.log(`\nDB "${d.name}" (sizeOnDisk ${(d.sizeOnDisk/1048576).toFixed(1)}MB) — ${cols.length} collections`);
    console.log(`   stats: dataSize ${(st.dataSize/1048576).toFixed(1)}MB | storageSize ${(st.storageSize/1048576).toFixed(1)}MB | indexSize ${(st.indexSize/1048576).toFixed(1)}MB | total ${((st.storageSize+st.indexSize)/1048576).toFixed(1)}MB`);
    const rows = [];
    for (const col of cols) {
      try {
        const cs = await db.command({ collStats: col.name });
        rows.push({ name: col.name, count: cs.count || 0, store: (cs.storageSize||0)/1048576, idx: (cs.totalIndexSize||0)/1048576 });
      } catch (e) { rows.push({ name: col.name, count: '?', store: 0, idx: 0, err: e.message }); }
    }
    rows.sort((a,b) => (b.store+b.idx) - (a.store+a.idx));
    for (const r of rows) console.log(`   ${r.name}: ${r.count} docs | store ${r.store.toFixed(1)}MB + idx ${r.idx.toFixed(1)}MB = ${(r.store+r.idx).toFixed(1)}MB`);
  }
  await c.close();
})().catch(e => { console.error('DIAG FAILED:', e.message); process.exit(1); });
