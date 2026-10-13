# CourseFinder data pipeline + engine

Loads the accurate CourseFinder catalogue (98k+ courses / 1,300+ universities across 49 destination countries) into UniCoach, and powers the 1:1 search + eligibility engine mounted at `/api/search`.

## Why
UniCoach's existing course/university data was incomplete/inaccurate. This pipeline replicates CourseFinder's catalogue exactly (every course keeps its full CourseFinder payload under `cf`), and the engine (`controllers/cfSearchController.js`) reproduces CourseFinder's search, highlight filters and Eligible/Non-Eligible matching — with server-side paging/faceting so there are no multi-MB payloads.

## Collections (separate from legacy data, non-destructive)
- `cf_courses`      — model `models/CfCourse.js`
- `cf_universities` — model `models/CfUniversity.js`
- `cf_highlights`, `cf_countries`

## Pipeline (3 steps)
All scripts read/write a working dir: `CF_DATA_DIR` (default `scripts/coursefinder/.cfdata`, gitignored).

1. **Harvest** — pulls the full catalogue from the CourseFinder API. Requires a logged-in partner token.
   Put `{ "token": "<bearer>", "userId": "<uuid>" }` in `$CF_DATA_DIR/.cf_creds.json` (get both from the app's `/api/auth/session` while logged in; the token is valid ~24h).
   ```bash
   CF_DATA_DIR=./.cfdata node scripts/coursefinder/cf_harvest.js
   ```
2. **Transform** — maps raw payloads → UniCoach docs (dedupes by course id):
   ```bash
   node --max-old-space-size=6144 scripts/coursefinder/cf_transform.js
   ```
3. **Ingest** — idempotent upsert into MongoDB (safe to re-run):
   ```bash
   MONGO_URI="mongodb+srv://..." CF_OUT_DIR=./.cfdata/out node scripts/coursefinder/cf_ingest.js
   # SLIM=1 drops the heavy raw cf payload (~fits a 512MB free Atlas); engine still works.
   ```

## Engine API (mounted at `/api/search`)
| Method | Path | Purpose |
|---|---|---|
| GET  | `/config` | filter taxonomy (levels, study areas, requirements, countries) + highlights |
| GET  | `/highlights` | the 20 CourseFinder quick-filter tags |
| GET  | `/suggest?keyword=` | typeahead (course/university) |
| POST | `/courses` | faceted search → `{data, total, totalPages, universitiesCount, highlightCounts}` |
| GET  | `/courses/:cfId` | course detail (nested, CourseFinder-shaped) |
| POST | `/eligibility` | `{filters, profile, bucket:'eligible'|'non-eligible', page}` → segmented results + reasons |

### `POST /api/search/courses` body
```json
{ "filters": { "searchText":"data science", "country":[4], "programLevel":[2],
  "intake":["Sep"], "requirements":[102], "highlights":[2], "duration":[2] },
  "sort":"featured", "page":1, "pageSize":20 }
```
Filter semantics mirror CourseFinder (highlight ids, requirement ids, program-level ids, destination-country ids per `data/coursefinder/filters-data.json`).

### `POST /api/search/eligibility` profile
```json
{ "profile": { "nationalityId":99, "stateId":1592, "highestQualificationId":8,
  "gradingSystem":"OutOf100", "score":75, "englishExam":"later",
  "backlogs":0, "workExperience":0 }, "filters": {...}, "bucket":"eligible", "page":1 }
```
Returns `{counts:{eligible,nonEligible}, data:[...], total}` — each row carries `eligible` + `reasons[]` (so Non-Eligible cards can show why), exactly like CourseFinder.

## Refreshing data
Re-run the 3 steps on a schedule (or wire `cf_harvest`→`cf_ingest` into `services/courseUpdateSchedulerService.js`). Ingest is upsert-by-id, so it only changes what changed.
