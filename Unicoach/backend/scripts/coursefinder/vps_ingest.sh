#!/usr/bin/env bash
# Runs ON the VPS. Loads the transformed CourseFinder output (shipped as /tmp/cfout.tgz)
# into the LIVE local Mongo by exec'ing cf_ingest inside the app container (which already
# holds the correct MONGO_URI -> local mongo db `default`). Upsert in place (RESET=0), no gap.
# Env in: APP_UUID.
set -e
APP=$(docker ps --filter "name=$APP_UUID" --format '{{.Names}}' | head -1)
if [ -z "$APP" ]; then echo "app container not found"; exit 1; fi
echo "APP=$APP"

echo "=== extract shipped output ==="
rm -rf /tmp/cfout && mkdir -p /tmp/cfout
tar xzf /tmp/cfout.tgz -C /tmp/cfout
ls -la /tmp/cfout/out | head

echo "=== copy output into app container ==="
docker exec "$APP" rm -rf /tmp/cfout_out 2>/dev/null || true
docker cp /tmp/cfout/out "$APP:/tmp/cfout_out"

echo "=== run cf_ingest in container (SLIM=1 RESET=0 -> upsert disciplines in place) ==="
docker exec -e CF_OUT_DIR=/tmp/cfout_out -e SLIM=1 -e RESET=0 "$APP" node scripts/coursefinder/cf_ingest.js

echo "=== verify: disciplines coverage + broad-term counts (live local mongo) ==="
docker exec "$APP" node -e "
const {MongoClient}=require('mongodb');
(async()=>{const c=new MongoClient(process.env.MONGO_URI,{serverSelectionTimeoutMS:15000});await c.connect();
const db=c.db();const col=db.collection('cf_courses');
const total=await col.countDocuments();
const withDisc=await col.countDocuments({disciplines:{\$exists:true,\$ne:[]}});
console.log('db:',db.databaseName,'cf_courses:',total,'| disciplines coverage:',withDisc,'('+(100*withDisc/total).toFixed(1)+'%)');
const bterm=async t=>{const rx=new RegExp(t,'i');return col.countDocuments({\$or:[{courseName:rx},{universityName:rx},{discipline:rx},{disciplines:rx}]});};
for(const t of ['Law','Nursing','Business','Data Science','Computer Science','Psychology'])console.log('  ',t,'=>',await bterm(t));
await c.close();})().catch(e=>{console.error('VERIFY ERR',e.message);process.exit(1);});
"
echo "=== cleanup ==="
docker exec "$APP" rm -rf /tmp/cfout_out 2>/dev/null || true
rm -rf /tmp/cfout /tmp/cfout.tgz
echo "=== done ==="
