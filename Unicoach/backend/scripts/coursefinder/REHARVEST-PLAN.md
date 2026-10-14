# CourseFinder Re-Harvest Plan — closing the broad-search gap

**Status:** PLAN (needs go-ahead; Tier 1 is free, Tier 2 needs a paid Atlas tier).
**Owner pickup:** run from GitHub Actions (office DPI blocks Mongo 27017 + harvest).

## The gap (measured)
Broad single-word discipline searches return fewer results than coursefinder.ai:

| query | UniCoach | CourseFinder | delta |
|-------|---------:|-------------:|------:|
| Law   | ~3,014   | ~3,453       | ~13% narrower |
| (structural filters: country/level/intake/fee = byte-exact match) | | | |

Narrow/specific and filtered searches already match 1:1. Only broad free-text
discipline terms are short.

## Root cause (confirmed in code)
- Engine `buildMatch` regex-matches free text against **courseName / universityName / discipline** only (`controllers/cfSearchController.js`).
- `cf_transform.js:41` sets `discipline: firstConcentration(c.Concentration)` — it keeps **only the first** concentration token and **drops the rest**; courses with an empty `Concentration` get no discipline at all.
- SLIM ingest (`cf_ingest.js` CF_KEEP) additionally drops the raw `Concentration`, `EntryRequirement*`, `Remarks`, `ScholarshipDeatil` long-text to fit the **M0 512MB free tier** (live DB ~314MB).
- CourseFinder matches across its full study-area taxonomy, so courses tagged (not named) under a discipline match on CF but not here.

## Tier 1 — FREE, stays on M0 (try first)
Keep the full concentration/study-area tags (short strings), not the prose.

1. `cf_transform.js`: replace `discipline: firstConcentration(...)` with
   `disciplines: splitAllConcentrations(c.Concentration)` → a **string array** of
   every concentration token (keep `discipline` too for back-compat = first token).
2. `controllers/cfSearchController.js` `buildMatch`: add `disciplines` to the
   regex `$or` (array regex match works in Mongo).
3. Add index: `cf_courses.createIndex({ disciplines: 1 })`.
4. Re-run transform + ingest (SLIM=1, **no RESET** — upsert by cfId is idempotent).
   - Storage impact: concentration tokens are a few words/course → est. +10–40MB.
     Watch the 512MB cap (`db_diag.js`); abort to Tier 2 if it bumps the ceiling.
5. Verify with `verify_engine.js` + re-measure Law / Nursing / Business / Law counts vs CF.

**Expected:** closes most of the gap. Does NOT populate detail-page Entry
Requirements / Remarks (still "refer to university") — that needs Tier 2.

## Tier 2 — PAID Atlas (if Tier 1 insufficient or cap-bound)
Re-harvest full fields; fixes BOTH the search gap and detail completeness.

1. Upgrade Atlas: M2 (~$9/mo) or M5 (~$25/mo) shared, or M10 (~$57/mo) dedicated.
   M2/M5 lift the storage cap (2GB/5GB) — enough for full prose.
2. `cf_ingest.js`: run **without** SLIM (full `cf` payload) OR extend CF_KEEP with
   `Concentration, EntryRequirement, Remarks, ScholarshipDeatil, TutionFee` text.
3. `cf_transform.js`: populate `academicRequirement` (`c.EntryRequirement`) and
   `remarks` (`c.Remarks`) on the doc; map full concentration list.
4. Full re-harvest: `cf_harvest.js` (CF creds) → `cf_transform.js` → `cf_ingest.js`
   (RESET=1 for a clean load), all via the `coursefinder-ingest.yml` workflow.
5. `ProgramDetailPage.jsx` already renders `entryRequirements` / `remarks` when
   present — no frontend change needed, the fallbacks just disappear.
6. Verify counts + spot-check detail pages vs CF.

## Recommendation
Do **Tier 1 first** (free, ~1 CI run). Measure. If the gap closes acceptably and
storage holds, stop. Only go **Tier 2** if broad counts are still short OR the
detail-page Entry Requirements / Remarks completeness is wanted — that's the only
part that truly needs paid storage.

## Execution notes
- All DB/harvest ops run via `.github/workflows/coursefinder-ingest.yml`
  (workflow_dispatch) — office network DPI blocks direct Mongo/HTTP.
- Secrets already set: `MONGO_URI`, `CF_CREDS`.
- Commit identity: rishigandhi57@gmail.com. `git checkout --` sitemap/robots before staging.
