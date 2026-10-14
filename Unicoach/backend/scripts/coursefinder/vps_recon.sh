#!/usr/bin/env bash
# Runs ON the VPS. Recon for ingesting Tier 1 into the live local Mongo.
# Env in: APP_UUID.
set +e
echo "=== app containers (uuid $APP_UUID) ==="
docker ps --filter "name=$APP_UUID" --format '{{.Names}} | {{.Status}}' | head
APP=$(docker ps --filter "name=$APP_UUID" --format '{{.Names}}' | head -1)
echo "APP=$APP"
echo
echo "=== app: ingest script present? ==="
docker exec "$APP" sh -lc 'ls -la scripts/coursefinder/cf_ingest.js 2>&1 | head; echo PWD=$(pwd)' 2>&1 | head
echo "=== app: mongodb driver present? ==="
docker exec "$APP" sh -lc 'node -e "console.log(require(\"mongodb/package.json\").version)" 2>&1' 2>&1 | head
echo "=== app: MONGO_URI (full) ==="
docker exec "$APP" printenv MONGO_URI 2>&1 | head
echo
echo "=== mongo containers ==="
docker ps --format '{{.Names}} | {{.Image}}' | grep -i mongo | head
echo "=== local mongo: dbs + cf_courses counts ==="
MURI=$(docker exec "$APP" printenv MONGO_URI 2>/dev/null)
docker exec "$APP" node -e "
const {MongoClient}=require('mongodb');
(async()=>{const c=new MongoClient(process.env.MONGO_URI,{serverSelectionTimeoutMS:15000});await c.connect();
const {databases}=await c.db().admin().listDatabases();
for(const d of databases){if(['admin','local','config'].includes(d.name))continue;
const db=c.db(d.name);const cols=(await db.listCollections().toArray()).map(x=>x.name);
const has=cols.includes('cf_courses');const n=has?await db.collection('cf_courses').countDocuments():0;
console.log('DB',d.name,'(',(d.sizeOnDisk/1048576).toFixed(1),'MB) cf_courses=',has?n:'-','collections=',cols.length);}
console.log('URI default db:', c.db().databaseName);
await c.close();})().catch(e=>console.error('ERR',e.message));
" 2>&1 | head -30
