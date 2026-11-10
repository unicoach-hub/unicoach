#!/usr/bin/env node
/**
 * Restore a UniCoach database backup (services/dbBackup.js) into a MongoDB database.
 *
 *   node scripts/restoreBackup.js --list                              off-site backups on Cloudinary
 *   node scripts/restoreBackup.js --latest  --to <mongo-uri> [--drop]  newest Cloudinary backup
 *   node scripts/restoreBackup.js --stamp 20261110T210000Z --to <uri> [--drop]
 *   node scripts/restoreBackup.js ./unicoach-db-202611101530.jsonl.gz --to <uri> [--drop]
 *   node scripts/restoreBackup.js ./backup.bin --save ./backup.jsonl.gz   only decrypt, write a .jsonl.gz
 *
 * Encrypted (Cloudinary) backups need BACKUP_ENCRYPTION_KEY in the environment or backend/.env.
 * Cloudinary access uses CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET from the same place.
 * --drop empties each collection before inserting. Restoring into the live database (MONGO_URI)
 * is refused unless you add --into-live: restore into a new database first and check it.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const mongoose = require('mongoose');
const backup = require('../services/dbBackup');

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const value = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const file = args.find((a, i) => !a.startsWith('--') && !['--to', '--stamp', '--save'].includes(args[i - 1]));

const configureCloud = () => {
  const { CLOUDINARY_CLOUD_NAME: cloud_name, CLOUDINARY_API_KEY: api_key, CLOUDINARY_API_SECRET: api_secret } = process.env;
  if (!cloud_name || !api_key || !api_secret) throw new Error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET');
  require('cloudinary').v2.config({ cloud_name, api_key, api_secret, secure: true });
};

(async () => {
  if (flag('--list')) {
    configureCloud();
    const list = await backup.listOffsite();
    if (!list.length) console.log('No off-site backups yet.');
    list.forEach((b) => console.log(`${b.stamp}  ${(b.bytes / 1048576).toFixed(1)} MB  ${b.parts} part(s)  ${b.createdAt}`));
    return;
  }

  let buf;
  if (file) {
    buf = fs.readFileSync(file);
  } else if (flag('--latest') || value('--stamp')) {
    configureCloud();
    const stamp = value('--stamp') || (await backup.listOffsite())[0]?.stamp;
    if (!stamp) throw new Error('No off-site backups found');
    console.log(`Downloading ${stamp} from Cloudinary…`);
    buf = await backup.downloadOffsite(stamp);
  } else {
    throw new Error('Give a backup file, --latest, --stamp <stamp> or --list. See the top of this file.');
  }

  const passphrase = process.env.BACKUP_ENCRYPTION_KEY || '';
  if (backup.isEncrypted(buf) && !passphrase) throw new Error('This backup is encrypted: set BACKUP_ENCRYPTION_KEY');

  if (value('--save')) {
    fs.writeFileSync(value('--save'), backup.isEncrypted(buf) ? backup.decryptBuffer(buf, passphrase) : buf);
    console.log(`Saved ${value('--save')}`);
    return;
  }

  const to = value('--to');
  if (!to) throw new Error('Say where to restore: --to <mongodb-uri>');
  const sameAsLive = process.env.MONGO_URI && to.replace(/\/+$/, '') === process.env.MONGO_URI.replace(/\/+$/, '');
  if (sameAsLive && !flag('--into-live')) {
    throw new Error('--to is the live database (MONGO_URI). Restore into a new database first; add --into-live only if you really mean it.');
  }

  const data = backup.readBackup(buf, passphrase);
  const total = Object.values(data).reduce((t, c) => t + c.docs.length, 0);
  console.log(`Backup has ${Object.keys(data).length} collections, ${total} documents. Restoring${flag('--drop') ? ' (dropping existing data first)' : ''}…`);
  const conn = await mongoose.createConnection(to).asPromise();
  try {
    await backup.restoreInto(conn.db, data, { drop: flag('--drop'), log: console.log });
  } finally {
    await conn.close();
  }
  console.log('Done.');
})().catch((err) => {
  console.error(`Restore failed: ${err.message}`);
  process.exit(1);
}).then(() => process.exit(0));
