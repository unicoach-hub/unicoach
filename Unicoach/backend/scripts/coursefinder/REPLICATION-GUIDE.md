# UniCoach × CourseFinder — Replication Guide

How UniCoach's program-search was built to replicate **coursefinder.ai** (KC Overseas
Education's B2B study-abroad portal) **1:1** — the catalogue data, the search engine, the
course-detail pages, eligibility, compare, Excel export, and the full left-sidebar filter UI.

> This is the engineering "how we did it" doc. It contains **no production secrets** — only
> the *names* of GitHub Actions secrets. Rotate/keep those in GitHub → Settings → Secrets.

---

## 1. What was built

- **Program search portal** at `/search-programs` — CourseFinder-styled (blue `#226CF5`,
  Poppins/DM Sans, 4px radii), login-gated, shows the full 98,977-program catalogue by default.
- **Course detail** at `/program/:cfId` — fees, intakes, English/standardized requirements, rankings.
- **Search engine** at `/api/search/*` — retrieve + server-side filter/facet/paginate, mirroring CourseFinder semantics.
- **Eligibility checker**, **Compare** (up to 5, full table), **Download to Excel**.
- **KC-style left filter sidebar**: Eligibility (inline), Universities (searchable, faceted
  counts), Program Level, Study Area, Requirements, Tuition Fees slider; top bar with
  search + multi-intake + Year + Student's Nationality.

---

## 2. Architecture & topology

```
Browser ──► www.unicoach.com (Vercel, React/Vite)  ──► api.unicoach.com (Express, Coolify on VPS)
                                                            │
                                                            ▼
                                            LOCAL MongoDB (mongo:7 container on the VPS)
                                                    db: `default`   (THE production DB)

   Atlas cluster unicoach.6vrz3lg.mongodb.net / db `unicoach`  = build/test copy ONLY
```

### 🔴 The single most important fact
**Production reads a *local* MongoDB on the VPS — NOT Atlas.**
- Live backend `MONGO_URI` = `mongodb://root:…@<mongo-container>:27017/default?authSource=admin`.
- Atlas (`unicoach` db) is a separate copy we used while building; writing there does **not**
  affect the live site.
- To change live data you must write to the VPS local Mongo. Easiest: `docker exec` the app
  container (it already has node + the `mongodb` driver + these scripts + the correct `MONGO_URI`).

Deploys are automatic on push to `main`:
- **Vercel** rebuilds the frontend (~2–3 min).
- **Coolify** rebuilds the backend container from the pushed commit (~3–5 min). A manual
  force-deploy is available via `vps-redeploy.yml` if needed.

---

## 3. Data pipeline (harvest → transform → ingest)

Scripts live in `Unicoach/backend/scripts/coursefinder/`:

| Script | Purpose |
|---|---|
| `cf_harvest.js` | Pulls the full CourseFinder catalogue (per-country) using a CF bearer token → `.cfdata/raw/country-*.json` |
| `cf_transform.js` | Maps raw CF payload → UniCoach docs (`cf_courses` shape) + derived fields (`discipline`, `disciplines`, `studyAreaIds`) → `.cfdata/out/courses.ndjson` |
| `cf_ingest.js` | Streams the NDJSON into Mongo (`SLIM=1` drops heavy long-text to fit small clusters; `RESET=1` drops collections first; default upserts by `cfId`) |
| `db_diag.js` | Per-DB / per-collection storage + index size report |
| `free_space.js` | Reclaims space (drops the unused `$text` index; best-effort drops `sample_*` demo DBs) |
| `verify_engine.js` | Sanity checks on the loaded data |

Collections: `cf_courses` (98,977), `cf_universities` (1,325), `cf_highlights`, `cf_countries`.

### Why everything runs in GitHub Actions
The office network's DPI firewall **blocks MongoDB TLS (27017) and SSH (22)**. GitHub-hosted
runners have a clean network path, so **all DB/VPS operations run as workflows** (`.github/workflows/`),
never from a local machine.

---

## 4. Search accuracy: Tier 1 & Tier 2

Broad single-word discipline searches (e.g. "Law") originally returned fewer results than
CourseFinder. Root cause: the engine matched only `courseName / universityName / discipline`,
and `discipline` was just the *first* `Concentration` tag.

### Tier 1 — `disciplines` (all concentration tags)
- `cf_transform.js` now emits `disciplines` = **all** `Concentration` tags (deduped).
- Engine matches `disciplines` in free-text search.
- **Limitation:** CF's `Concentration` is sparse (~7.2% coverage) → only a partial lift
  (Law 3,014 → 3,194).

### Tier 2 — `studyAreaIds` (the real signal)
- CF's `CategoryId` is a **comma-separated list of study-area taxonomy ids (1..22)** —
  e.g. Law = 12 — with **~100% coverage**. This is how CourseFinder's broad search actually works.
- `cf_transform.js` emits `studyAreaIds` (parsed from `CategoryId`); engine indexes + filters it.
- **Key UX lesson:** do **not** auto-expand free text to a whole study area — typing "Nursing"
  must not return the entire Health area (8,041). Instead, **Study Area is an explicit filter**
  (the 22-area dropdown), exactly like CourseFinder. Free-text stays precise.

### Applying data without a fresh CF token
The CF harvest token (`CF_CREDS`) expires ~24h. For **field-only** updates we don't re-harvest —
we compute the field from the cached raw harvest (or Atlas) and sync it straight to the live VPS
Mongo via the app container. See `coursefinder-sync-disciplines.yml` and
`coursefinder-sync-studyareas.yml` (+ `vps_apply_*.sh`, `studyareas.json.gz`).

---

## 5. The engine (`controllers/cfSearchController.js`)

- `buildMatch(filters)` composes the Mongo query. Supported filters: `searchText` (regex on
  name/university/discipline/disciplines + degree-acronym expansion e.g. MBA→"Master of Business
  Administration"), `country`, `programLevel`, `intake` (multi), `highlights`, `requirements`,
  `duration`, `studyArea` (taxonomy ids 1..22), `university` (cfUniversityId), `tuitionMin/Max`.
- Routes (`routes/cfSearch.js`, mounted at `/api/search`):
  `config`, `highlights`, `suggest`, `courses` (POST faceted), `universities` (POST facet),
  `export` (POST), `courses/:cfId` (detail), `eligibility` (POST).
- `matchedStudyAreas(text)` maps discipline words → taxonomy ids (used by the Study Area filter's
  text path only, never auto-applied to free text).

---

## 6. Filter sidebar (1:1 with CourseFinder)

`frontend/src/pages/SearchProgramsPage.jsx` + `components/CfSidebar.jsx`:
- **Top bar:** Search · multi-select Intake · Year · Student's Nationality · Search · Clear All.
- **Left sidebar (Accordion sections):** Eligibility (inline form → Eligible/Non-Eligible),
  Universities (searchable, live faceted counts via `/api/search/universities`), Program Level
  (17), Study Area (22), Requirements (17), Tuition Fees slider.
- **Right:** quick-filter pills (highlights) with counts, Universities/Programs toggle, Sort,
  grouped results, pagination, fixed bulk bar (Compare / Download Selected / Excel / Top 25).
- The far-left **icon rail** (`CfSidebar`) mirrors CF but omits KC's B2B-only icons
  (Wallet/Commission/Allied Services) since UniCoach has no equivalent.

Minor intentional deviations: **Year** is cosmetic (catalogue is a single intake year); broad
counts run slightly higher than CF because CF applies a default nationality-eligibility filter
and UniCoach shows all nationalities.

---

## 7. CI / workflows (`.github/workflows/`)

| Workflow | What it does |
|---|---|
| `coursefinder-ingest.yml` | Harvest → transform → ingest into **Atlas** (SLIM, optional RESET) |
| `coursefinder-ingest-vps.yml` | Harvest → transform → ship → `docker exec cf_ingest` into the **live VPS Mongo** |
| `coursefinder-sync-disciplines.yml` | Copy `cfId→disciplines` Atlas → live VPS Mongo (no CF token) |
| `coursefinder-sync-studyareas.yml` | Ship `studyareas.json.gz` → apply to live VPS Mongo |
| `coursefinder-verify.yml` / `coursefinder-diag.yml` | Engine checks / storage diagnostics |
| `db-free-space.yml` | Drop unused `$text` index (+ best-effort `sample_*` DBs) |
| `vps-recon.yml` / `vps-status.yml` | Inspect app container, mongo DBs, deployment status |
| `vps-redeploy.yml` | Force a Coolify redeploy of the backend |
| `vps-coolify-fix.yml` | Update the backend `MONGO_URI` env + redeploy |

Required GitHub Actions **secrets** (values not stored here): `MONGO_URI` (Atlas),
`CF_CREDS` (CourseFinder bearer token JSON), `VPS_SSH_KEY_B64`, `VPS_HOST`.

---

## 8. Gotchas & lessons (hard-won)

- **Prod = local VPS Mongo, not Atlas** (§2). The number-one source of "why didn't my change go live".
- **Office DPI blocks Mongo 27017 + SSH 22** → run DB/VPS ops from GitHub Actions. Workflows must
  live at the **repo root** `.github/workflows/` (project is nested under `Unicoach/`) and be on `main`.
- **Atlas M0 free tier** quota = `dataSize + indexSize` across the whole cluster = 512MB. The bundled
  `sample_mflix` demo DB wastes ~140MB (can't drop without broader DB-user perms). We freed space by
  dropping the unused **`$text` index** — the engine matches by **regex, not `$text`**.
- **Commit identity:** commit as `rishigandhi57@gmail.com`; the machine's global git uses a work email
  that makes Vercel builds hang. Verify `git log` author before any deploy push.
- **Build artifacts:** `sitemap.xml` / `robots.txt` regenerate on build → `git checkout --` them before staging.
- **Multi-machine:** `git fetch origin` + rebase before pushing; other machines push to `main` concurrently.
- **CF token** (`CF_CREDS`) expires ~24h → a full re-harvest needs a fresh token (grab from
  `app.coursefinder.ai` → `/api/auth/session` while logged in). Field-only updates skip the token (§4).

---

## 9. Testing

- **Start:** https://www.unicoach.com/search-programs
- **QA login (throwaway):** `cfqa.unicoach.1013@gmail.com` / `qa1234`
- **Course detail example:** https://www.unicoach.com/program/33411
- **Eligibility deep-link:** https://www.unicoach.com/search-programs?check=eligibility

---

## 10. Maintenance

- **Refresh the catalogue:** update the `CF_CREDS` secret with a fresh token, run
  `coursefinder-ingest-vps.yml` (writes the live DB). `coursefinder-ingest.yml` refreshes the
  Atlas copy.
- **Change a single derived field** (no token): compute it from cached raw / Atlas and sync via a
  `*-sync-*.yml` workflow + `vps_apply_*.sh`.
- **Security housekeeping (pending):** rotate the production secrets exposed during the build —
  Atlas user(s), the Coolify root + any `claude-deploy` token, the VPS root SSH key, and remove any
  Atlas `0.0.0.0/0` network allow rule.
