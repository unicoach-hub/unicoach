#!/usr/bin/env bash
# Runs ON the VPS. Applies cfId->studyAreaIds (shipped gzipped as /tmp/studyareas.json.gz)
# to the LIVE local Mongo cf_courses via the app container. Bulk \$set + index.
# Env in: APP_UUID.
set -e
APP=$(docker ps --filter "name=$APP_UUID" --format '{{.Names}}' | head -1)
if [ -z "$APP" ]; then echo "app container not found"; exit 1; fi
echo "APP=$APP"

docker exec "$APP" rm -f /tmp/studyareas.json.gz 2>/dev/null || true
docker cp /tmp/studyareas.json.gz "$APP:/tmp/studyareas.json.gz"

docker exec "$APP" node -e "
const fs=require('fs');const zlib=require('zlib');const {MongoClient}=require('mongodb');
(async()=>{
  const rows=JSON.parse(zlib.gunzipSync(fs.readFileSync('/tmp/studyareas.json.gz')).toString('utf8'));
  const c=new MongoClient(process.env.MONGO_URI,{serverSelectionTimeoutMS:20000});await c.connect();
  const col=c.db().collection('cf_courses');
  console.log('db:',c.db().databaseName,'| applying studyAreaIds to',rows.length,'courses');
  let n=0,batch=[];
  for(const r of rows){batch.push({updateOne:{filter:{cfId:r.cfId},update:{\$set:{studyAreaIds:r.studyAreaIds}}}});
    if(batch.length>=2000){await col.bulkWrite(batch,{ordered:false});n+=batch.length;batch=[];if(n%20000===0)console.log('  applied',n);}}
  if(batch.length){await col.bulkWrite(batch,{ordered:false});n+=batch.length;}
  await col.createIndex({studyAreaIds:1});
  const total=await col.countDocuments();
  const withSA=await col.countDocuments({studyAreaIds:{\$exists:true,\$ne:[]}});
  console.log('applied',n,'| cf_courses:',total,'| studyArea coverage:',withSA,'('+(100*withSA/total).toFixed(1)+'%)');
  await c.close();
})().catch(e=>{console.error('APPLY ERR',e.message);process.exit(1);});
"
docker exec "$APP" rm -f /tmp/studyareas.json.gz 2>/dev/null || true
rm -f /tmp/studyareas.json.gz
echo "=== done ==="
