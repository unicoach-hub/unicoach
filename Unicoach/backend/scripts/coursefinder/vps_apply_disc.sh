#!/usr/bin/env bash
# Runs ON the VPS. Applies cfId->disciplines (shipped as /tmp/disc.json) to the LIVE
# local Mongo cf_courses, by exec'ing a small updater inside the app container.
# Env in: APP_UUID.
set -e
APP=$(docker ps --filter "name=$APP_UUID" --format '{{.Names}}' | head -1)
if [ -z "$APP" ]; then echo "app container not found"; exit 1; fi
echo "APP=$APP"

docker exec "$APP" rm -f /tmp/disc.json 2>/dev/null || true
docker cp /tmp/disc.json "$APP:/tmp/disc.json"

docker exec "$APP" node -e "
const fs=require('fs');const {MongoClient}=require('mongodb');
(async()=>{
  const rows=JSON.parse(fs.readFileSync('/tmp/disc.json','utf8'));
  const c=new MongoClient(process.env.MONGO_URI,{serverSelectionTimeoutMS:20000});await c.connect();
  const col=c.db().collection('cf_courses');
  console.log('db:',c.db().databaseName,'| applying disciplines to',rows.length,'courses');
  let n=0,batch=[];
  for(const r of rows){batch.push({updateOne:{filter:{cfId:r.cfId},update:{\$set:{disciplines:r.disciplines}}}});
    if(batch.length>=1000){await col.bulkWrite(batch,{ordered:false});n+=batch.length;batch=[];}}
  if(batch.length){await col.bulkWrite(batch,{ordered:false});n+=batch.length;}
  await col.createIndex({disciplines:1});
  const total=await col.countDocuments();
  const withDisc=await col.countDocuments({disciplines:{\$exists:true,\$ne:[]}});
  console.log('applied',n,'| cf_courses:',total,'| disciplines coverage:',withDisc,'('+(100*withDisc/total).toFixed(1)+'%)');
  const bterm=async t=>{const rx=new RegExp(t,'i');return col.countDocuments({\$or:[{courseName:rx},{universityName:rx},{discipline:rx},{disciplines:rx}]});};
  for(const t of ['Law','Nursing','Business','Data Science','Computer Science','Psychology'])console.log('  ',t,'=>',await bterm(t));
  await c.close();
})().catch(e=>{console.error('APPLY ERR',e.message);process.exit(1);});
"
docker exec "$APP" rm -f /tmp/disc.json 2>/dev/null || true
rm -f /tmp/disc.json
echo "=== done ==="
