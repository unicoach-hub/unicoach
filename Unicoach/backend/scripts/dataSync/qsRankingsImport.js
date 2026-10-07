/**
 * Import official QS World University Rankings from the results file QS publishes on topuniversities.com
 * (download it yourself with a free account; .xlsx or "Save As CSV" both work).
 *
 *   node scripts/dataSync/qsRankingsImport.js <qs-file.xlsx|csv>                  # DRY RUN: match + report
 *   node scripts/dataSync/qsRankingsImport.js <qs-file.xlsx|csv> --apply          # write the changes
 *   node scripts/dataSync/qsRankingsImport.js --revert <report.json>
 *
 * Options: --year 2027 (otherwise read from the "2027 Rank" header or the file name)
 *          --keep-unverified (don't clear ranks on records QS doesn't list)
 *
 * Sets on every matched university: rankingNum (number, lower bound of a band, for sorting), rank (QS's own
 * text, e.g. "=24", "601-610", "1401+") and rankingSource ("QS World University Rankings 2027"). The site only
 * shows a rank when rankingSource is present. Records QS doesn't list get their old (unverified) rank cleared.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const mongoose = require('mongoose');

const APPLY = process.argv.includes('--apply');
const KEEP_UNVERIFIED = process.argv.includes('--keep-unverified');
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');

// QS country/territory name → our Country.name, where they differ
const COUNTRY_ALIASES = {
  'united states': 'USA',
  'united states of america': 'USA',
  'united kingdom': 'UK',
  'hong kong sar': 'Hong Kong',
  'hong kong sar, china': 'Hong Kong',
  'china (mainland)': 'China',
  'korea, republic of': 'South Korea',
  'south korea': 'South Korea',
};

// QS institution name → our university name, for names that normalising can't reconcile
const NAME_ALIASES = {
  'technical university of munich': 'Technische Universität München',
};

/* ---------- minimal .xlsx reader (zip + XML), no dependencies ---------- */

function unzip(buf) {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd -= 1;
  if (eocd < 0) throw new Error('Not a valid .xlsx (zip) file');
  const count = buf.readUInt16LE(eocd + 10);
  let ptr = buf.readUInt32LE(eocd + 16);
  const files = {};
  for (let i = 0; i < count; i += 1) {
    const method = buf.readUInt16LE(ptr + 10);
    const compressedSize = buf.readUInt32LE(ptr + 20);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localOffset = buf.readUInt32LE(ptr + 42);
    const name = buf.toString('utf8', ptr + 46, ptr + 46 + nameLen).replace(/\\/g, '/');
    const dataStart = localOffset + 30 + buf.readUInt16LE(localOffset + 26) + buf.readUInt16LE(localOffset + 28);
    const data = buf.subarray(dataStart, dataStart + compressedSize);
    files[name] = () => (method === 0 ? data : zlib.inflateRawSync(data)).toString('utf8');
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const decodeXml = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, '&');
const xmlText = (fragment) => decodeXml([...fragment.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join(''));
const colIndex = (letters) => [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;

function readXlsxSheets(file) {
  const zip = unzip(fs.readFileSync(file));
  const shared = zip['xl/sharedStrings.xml']
    ? [...zip['xl/sharedStrings.xml']().matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => xmlText(m[1]))
    : [];
  return Object.keys(zip)
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
    .map((name) => {
      const rows = [];
      for (const rowMatch of zip[name]().matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
        const row = [];
        for (const c of rowMatch[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
          const [, col, attrs, inner = ''] = c;
          const type = (attrs.match(/t="(\w+)"/) || [])[1];
          const v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
          let value = '';
          if (type === 's') value = shared[Number(v)] || '';
          else if (type === 'inlineStr') value = xmlText(inner);
          else if (v !== undefined) value = decodeXml(v);
          row[colIndex(col)] = String(value).trim();
        }
        rows.push(Array.from(row, (x) => x || ''));
      }
      return rows;
    });
}

// RFC 4180 CSV → rows of cells
function readCsv(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field.trim()); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field.trim()); field = '';
      rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  return rows;
}

/* ---------- QS table → entries ---------- */

// Find the header row and the columns we need, in whichever sheet has them
function extractEntries(sheets, yearArg) {
  for (const rows of sheets) {
    for (let h = 0; h < Math.min(rows.length, 30); h += 1) {
      const header = rows[h].map((x) => x.toLowerCase());
      const nameCol = header.findIndex((x) => /institution/.test(x));
      if (nameCol < 0) continue;
      const rankCols = header
        .map((x, i) => ({ i, year: Number((x.match(/(20\d\d)/) || [])[1]) || 0, isRank: /rank/.test(x) }))
        .filter((c) => c.isRank && c.i !== nameCol);
      if (!rankCols.length) continue;
      // Current edition = highest year in a "YYYY Rank" header (older-year columns are previous editions)
      const rankCol = rankCols.sort((a, b) => b.year - a.year)[0];
      const countryCol = header.findIndex((x) => /country|territory|location/.test(x));
      if (countryCol < 0) continue;
      const year = yearArg || rankCol.year || null;
      const entries = [];
      for (const r of rows.slice(h + 1)) {
        const name = r[nameCol];
        const rankText = (r[rankCol.i] || '').replace(/\s+/g, '');
        const rankingNum = Number((rankText.match(/\d+/) || [])[0]);
        if (!name || !rankingNum) continue;
        entries.push({ name, country: r[countryCol] || '', rank: rankText, rankingNum });
      }
      if (entries.length) return { year, entries, header: rows[h] };
    }
  }
  throw new Error('Could not find a header row with "Institution", "Rank" and "Country" columns');
}

/* ---------- name matching ---------- */

const baseNorm = (s) => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/\(.*?\)/g, ' ')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\bthe\b/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
// German transliteration ("Universitaet" = "Universität")
const germanNorm = (s) => baseNorm(s).replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');

async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  await mongoose.connect(process.env.MONGO_URI);
  const University = require('../../models/University');
  const ops = report.changes.map((c) => {
    const $set = {};
    const $unset = {};
    for (const key of ['rankingNum', 'rank', 'rankingSource']) {
      if (c.before[key] === undefined) $unset[key] = '';
      else $set[key] = c.before[key];
    }
    return { updateOne: { filter: { _id: c._id }, update: { ...(Object.keys($set).length && { $set }), ...(Object.keys($unset).length && { $unset }) } } };
  });
  for (let i = 0; i < ops.length; i += 500) await University.bulkWrite(ops.slice(i, i + 500));
  console.log(`Reverted ${ops.length} universities from ${path.basename(reportFile)}`);
  await mongoose.disconnect();
}

async function main() {
  const revertIdx = process.argv.indexOf('--revert');
  if (revertIdx > -1) return revert(process.argv[revertIdx + 1]);

  const file = process.argv.slice(2).find((a) => !a.startsWith('--') && process.argv[process.argv.indexOf(a) - 1] !== '--year');
  if (!file || !fs.existsSync(file)) throw new Error('Usage: node scripts/dataSync/qsRankingsImport.js <qs-file.xlsx|csv> [--apply]');
  const yearIdx = process.argv.indexOf('--year');
  const yearArg = yearIdx > -1 ? Number(process.argv[yearIdx + 1]) : Number((path.basename(file).match(/(20\d\d)/) || [])[1]) || null;

  const sheets = /\.xlsx$/i.test(file) ? readXlsxSheets(file) : [readCsv(file)];
  const { year, entries } = extractEntries(sheets, yearArg);
  if (!year) throw new Error('Could not tell the ranking year; pass --year 2027');
  const rankingSource = `QS World University Rankings ${year}`;
  console.log(`${entries.length} ranked institutions in ${path.basename(file)} (${rankingSource})`);

  await mongoose.connect(process.env.MONGO_URI);
  const University = require('../../models/University');
  const Country = require('../../models/Country');
  const countries = await Country.find({}).select('name').lean();
  const countryByName = new Map(countries.map((c) => [c.name.toLowerCase(), c]));
  const ourCountry = (qsCountry) => countryByName.get((COUNTRY_ALIASES[qsCountry.toLowerCase()] || qsCountry).toLowerCase());

  const unis = await University.find({ isActive: { $ne: false } }).select('name country rankingNum rank rankingSource').lean();
  const index = new Map(); // `${countryId}|${key}` → [uni]
  const add = (key, uni) => {
    const k = `${uni.country}|${key}`;
    if (!index.has(k)) index.set(k, []);
    if (!index.get(k).includes(uni)) index.get(k).push(uni);
  };
  for (const u of unis) {
    add(baseNorm(u.name), u);
    add(germanNorm(u.name), u);
  }

  const matched = new Map(); // uni _id → { uni, entry }
  const unmatched = [];
  const duplicates = [];
  for (const entry of entries) {
    const country = ourCountry(entry.country);
    if (!country) continue; // a country we don't cover
    // Union of matches on the QS name and its alias, so duplicate records (e.g. English + German name) all get the rank
    const hits = [];
    for (const name of [entry.name, NAME_ALIASES[baseNorm(entry.name)]].filter(Boolean)) {
      for (const key of [baseNorm(name), germanNorm(name)]) {
        for (const uni of index.get(`${country._id}|${key}`) || []) if (!hits.includes(uni)) hits.push(uni);
      }
    }
    if (!hits.length) {
      unmatched.push({ qsName: entry.name, country: country.name, rank: entry.rank });
      continue;
    }
    if (hits.length > 1) duplicates.push({ qsName: entry.name, dbNames: hits.map((h) => h.name) });
    for (const uni of hits) {
      const prev = matched.get(String(uni._id));
      if (!prev || entry.rankingNum < prev.entry.rankingNum) matched.set(String(uni._id), { uni, entry });
    }
  }

  const before = (u) => ({ rankingNum: u.rankingNum, rank: u.rank, rankingSource: u.rankingSource });
  const changes = [];
  for (const { uni, entry } of matched.values()) {
    const after = { rankingNum: entry.rankingNum, rank: entry.rank, rankingSource };
    if (uni.rankingNum === after.rankingNum && uni.rank === after.rank && uni.rankingSource === rankingSource) continue;
    changes.push({ _id: uni._id, name: uni.name, kind: 'ranked', before: before(uni), after });
  }
  if (!KEEP_UNVERIFIED) {
    for (const uni of unis) {
      if (matched.has(String(uni._id))) continue;
      if (uni.rankingNum == null && uni.rank == null && uni.rankingSource == null) continue;
      changes.push({ _id: uni._id, name: uni.name, kind: 'cleared', before: before(uni), after: { rankingNum: null, rank: null, rankingSource: null } });
    }
  }

  const countryName = new Map(countries.map((c) => [String(c._id), c.name]));
  const perCountry = {};
  for (const { uni } of matched.values()) {
    const name = countryName.get(String(uni.country)) || '?';
    perCountry[name] = (perCountry[name] || 0) + 1;
  }
  const summary = {
    rankingSource,
    qsEntries: entries.length,
    matchedUniversities: matched.size,
    matchedPerCountry: perCountry,
    unmatchedQsEntriesInOurCountries: unmatched.length,
    rankChanges: changes.filter((c) => c.kind === 'ranked').length,
    unverifiedRanksCleared: changes.filter((c) => c.kind === 'cleared').length,
  };
  console.log(summary);
  console.log('Sample:', changes.filter((c) => c.kind === 'ranked').slice(0, 8).map((c) => `${c.name}: ${c.before.rankingNum} → ${c.after.rank}`));

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const reportFile = path.join(REPORT_DIR, `qs-rankings-${stamp}${APPLY ? '' : '-dryrun'}.json`);
  fs.writeFileSync(reportFile, JSON.stringify({ generatedAt: new Date().toISOString(), applied: APPLY, source: path.basename(file), summary, unmatched, duplicates, changes }, null, 2));
  console.log(`Report: ${reportFile}`);

  if (APPLY) {
    const ops = changes.map((c) => ({
      updateOne: {
        filter: { _id: c._id },
        update: c.kind === 'ranked'
          ? { $set: c.after }
          : { $set: { rankingNum: null, rank: null }, $unset: { rankingSource: '' } },
      },
    }));
    for (let i = 0; i < ops.length; i += 500) await University.bulkWrite(ops.slice(i, i + 500));
    console.log(`Applied ${ops.length} changes. Undo with: node scripts/dataSync/qsRankingsImport.js --revert ${reportFile}`);
  } else {
    console.log('Dry run only. Re-run with --apply to write these changes.');
  }
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
