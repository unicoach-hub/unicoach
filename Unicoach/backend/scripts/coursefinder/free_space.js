// Reclaim M0 space (Atlas free-tier quota = dataSize + indexSize, cluster-wide).
// 1) try to drop MongoDB's bundled sample_* databases (unused demo data) — may lack
//    permission on a scoped DB user; tolerated.
// 2) drop the obsolete full-text index on cf_courses — the engine matches by regex,
//    not $text, so that index is dead weight (~tens of MB on 99k docs).
//   MONGO_URI=... node scripts/coursefinder/free_space.js
const { MongoClient } = require('mongodb');
(async () => {
  const c = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  await c.connect();
  const admin = c.db().admin();

  // 1) sample_* databases (best-effort — needs cross-db drop rights)
  try {
    const { databases } = await admin.listDatabases();
    for (const d of databases) {
      if (/^sample_/i.test(d.name)) {
        try { await c.db(d.name).dropDatabase(); console.log(`dropped sample DB "${d.name}" (~${(d.sizeOnDisk/1048576).toFixed(1)}MB disk)`); }
        catch (e) { console.log(`skip "${d.name}": ${e.message}`); }
      }
    }
  } catch (e) { console.log('listDatabases skipped:', e.message); }

  // 2) obsolete text index on cf_courses (engine uses regex, not $text)
  const courses = c.db().collection('cf_courses');
  const idx = await courses.indexes();
  for (const ix of idx) {
    const isText = ix.key && Object.values(ix.key).includes('text');
    if (isText) { await courses.dropIndex(ix.name); console.log(`dropped unused text index "${ix.name}" on cf_courses`); }
  }

  const st = await c.db().stats();
  console.log(`unicoach now: dataSize ${(st.dataSize/1048576).toFixed(1)}MB + indexSize ${(st.indexSize/1048576).toFixed(1)}MB = ${((st.dataSize+st.indexSize)/1048576).toFixed(1)}MB`);
  await c.close();
})().catch(e => { console.error('FREE_SPACE FAILED:', e.message); process.exit(1); });
