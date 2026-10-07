/**
 * Sync French higher-education institutions with official sources.
 *
 *   node scripts/dataSync/franceSync.js                    # DRY RUN: fetch + match + report, writes nothing
 *   node scripts/dataSync/franceSync.js --apply --expect <reviewed dry-run report.json>
 *                                                          # write the creates/updates/deactivations of this run, but only
 *                                                          # if they are exactly the plan of the reviewed dry run (plan.hash)
 *   node scripts/dataSync/franceSync.js --apply            # same without the plan check (prints a warning)
 *   node scripts/dataSync/franceSync.js --revert <report.json>   # undo an APPLIED (or half-applied) run (refuses dry-run reports)
 *
 * Options: --refresh (ignore the 7-day page cache, incl. remembered failures), --max-scrapedo <n> (default 6 per run;
 *          a page that still fails through scrape.do is remembered for 7 days so re-runs do not spend it again),
 *          --no-llm (deterministic fee parsing only), --max-llm <n> (default 60 Groq calls per run; answers are cached).
 *
 * --apply is refused (mode "apply-refused", report written, nothing written to the DB) when the inputs of this run are
 * incomplete — an official dataset returned fewer rows than its sanity floor, the Groq or scrape.do cap was reached (or the
 * LLM was unavailable) so a fee page was skipped, or a Campus France programme request failed — or, with --expect, when the
 * recomputed plan differs from the reviewed dry run. A cold cache needs 2–3 dry runs to settle; apply after a dry run that
 * reports applyReadiness.ok = true, with --expect <that report>. An institution whose fee rows are incomplete for a
 * page-level reason (network / 5xx) gets no fee proposal in that run (listed in applyReadiness.feeProposalsDropped).
 * Every run writes its own report <runId>-<mode>.json (never overwritten); an apply run saves it with applyStartedAt
 * BEFORE its first write and again after every write, so a run that stops half-way can be reverted.
 *
 * Sources (all official):
 *  - French Ministry of Higher Education (MESR) open data, data.enseignementsup-recherche.gouv.fr (Opendatasoft API):
 *      · "Principaux établissements d'enseignement supérieur" — official name, type, public/private sector, commune,
 *        urban unit, website, UAI code, legal status, founding decree (renamed/merged universities);
 *      · "Statistiques sur les effectifs d'étudiants inscrits par établissement public sous tutelle du ministère" —
 *        public institutions under the Ministry (so the national fee order applies) and their Licence / Master /
 *        Doctorate enrolments (→ degree levels); also identifies CentraleSupélec and ENS Paris-Saclay;
 *      · "Effectifs d'étudiants inscrits … détail par établissements" — identifies emlyon business school (private);
 *      · "MonMaster" (latest session) — every national Master's degree (mention) each institution offers;
 *      · "Trouver mon master — mentions" — official spelling (accents) of the Master's mention names;
 *      · "Cartographie des formations Parcoursup" (latest session) — first-year Bachelor-level programmes (Licence, BUT,
 *        school bachelors) per institution.
 *  - Campus France (French state agency for international students): the "Programs Taught in English" catalogue
 *    (tie-api.campusfrance.org; programme names, levels, links to each programme page on the institution's own site)
 *    and the official national tuition page (campusfrance.org/en/tuition-fees-France): non-EU "differentiated"
 *    registration fees set by the Arrêté du 19 avril 2019 (amounts for the current academic year).
 *  - Grandes écoles and private schools: their own programme / fee pages (linked from the Campus France catalogue),
 *    Sciences Po's tuition page and Institut Polytechnique de Paris's Master's fee schedule (PDF).
 *  - ECB EUR→USD reference rate (api.frankfurter.app). No fallback rate: without it USD fields are not proposed.
 *
 * Fee values read from a web page are kept only when their verbatim quote is found in the fetched page text. Pages a
 * deterministic parser cannot read go to a Groq LLM fallback whose answer is kept only if its quote is in the page and
 * contains the amount (answers are cached in backend/reports/.cache/france/llm, so re-runs cost nothing).
 *
 * Fee fields are proposed only when they are representative and cannot sit next to an unverified value: a level's USD
 * field needs an institution-wide fee schedule or ≥ MIN_LEVEL_ROWS programme fees; and when the record already holds an
 * unverified USD value for a level this run cannot set, NO fee field is proposed (the website shows both USD fields as
 * official as soon as dataSource.fields names any fee field). Public universities whose own fee page states a blanket
 * exemption from the national non-EU fee (UNIVERSITY_FEE_PAGES) get no fee proposal.
 * Course lists with fewer than MIN_COURSES official programmes are not proposed (existing list kept and reported).
 * Degree levels are never removed; dataSource.fields lists 'degreeLevels' only when every proposed level has official
 * evidence this run (MESR / Campus France lists, or the institution's own website), else dataSource.partialFields says which
 * levels are unverified.
 *
 * Never deletes. Duplicate records get isActive:false. Ranking fields (rank, rankingNum, rankingSource) and admission
 * requirement fields are never touched on existing records. New records get every fabricating schema default set
 * explicitly to the official value or null. Reports + page cache go to backend/reports/ (git-ignored).
 * Needs MONGO_URI; GROQ_API_KEY optional (fee fallback); SCRAPE_DO_TOKEN only for pages that block direct requests.
 * `pdftotext` (poppler, ships with Git for Windows) reads the IP Paris fee PDF; without it that value stays null.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');
const REFRESH = ARGS.includes('--refresh');
const NO_LLM = ARGS.includes('--no-llm');
const argValue = (flag) => { const i = ARGS.indexOf(flag); return i !== -1 ? ARGS[i + 1] : undefined; };
const MAX_SCRAPEDO = Number(argValue('--max-scrapedo') ?? 6);
const MAX_LLM = Number(argValue('--max-llm') ?? 60);
const EXPECT = argValue('--expect'); // reviewed dry-run report whose plan --apply must reproduce exactly
const SYNC_ID = 'franceSync';
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const CACHE_DIR = path.join(REPORT_DIR, '.cache', 'france');
const LLM_CACHE_DIR = path.join(CACHE_DIR, 'llm');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const { SCRAPE_DO_TOKEN, GROQ_API_KEY } = process.env;
const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const RUN_ID = `france-sync-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const PROVIDER = 'MESR open data (France) + Campus France + official institution fee pages';
const counters = { directRequests: 0, scrapeDoRequests: 0, cacheHits: 0, groqCalls: 0, llmCacheHits: 0, llmSkippedByCap: 0, llmUnavailable: 0, scrapeDoSkippedByCap: 0, cfDetailFailures: 0 };
// The website treats a record's fee as official as soon as dataSource.fields names ANY of these (frontend
// utils/dataSourceLabel.js hasOfficialFee) and then shows BOTH USD fields as official ("Master's X · Bachelor's Y").
const FEE_FIELDS = ['tuitionFeeUSD', 'graduateTuitionUSD', 'tuition'];
// A level's USD field (tuitionFeeUSD / graduateTuitionUSD) is the school-wide default used for budget filters and shown on
// every course; from programme-level fees it needs at least this many programmes (an institution-wide fee schedule —
// national fee order, Sciences Po's tuition page, IP Paris's fee PDF — counts on its own)
const MIN_LEVEL_ROWS = 3;
// An official course list shorter than this does not represent the institution (e.g. two old Campus France entries of a
// school whose flagship programmes are not in the catalogue): not proposed, existing list kept and reported
const MIN_COURSES = 5;
// Course name for the 5-year engineering degree (Parcoursup "Formation d'ingénieur Bac + 5", engineering-cycle fee pages)
const ENGINEERING_DEGREE = "Engineering degree (Diplôme d'ingénieur)";
// Sanity floors for the official datasets (rows this run must at least get back; below → --apply refused)
const DATASET_FLOORS = { register: 200, sise: 120, monMaster: 6000, tmmMentions: 250, campusFrance: 1000, parcoursup: 1000 };
// A preparatory / pre-Master's year is not part of the Master's tuition
const PREP_RE = /pre-?master|pr[ée]-?master|ann[ée]e pr[ée]paratoire|preparatory year|foundation year/i;
// An institution's own page saying that its two-year MSc route starts with a pre-Master year (NEOMA: "complete this MSc in
// two years by joining our 12-month International Pre-Master programme"): its catalogue "2-year course" totals then
// include that preparatory year, so only the one-year track is used
const PRE_MASTER_TRACK_RE = /\b(?:two|2)[- ]years?\b[^.]{0,120}?\bpre-?master\b|\bfirst year of study in the (?:International )?Pre-?Master\b/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- official sources ----------
const MESR_API = 'https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets';
const DS = {
  register: 'fr-esr-principaux-etablissements-enseignement-superieur',
  sise: 'fr-esr-statistiques-sur-les-effectifs-d-etudiants-inscrits-par-etablissement',
  atlas: 'fr-esr-atlas_regional-effectifs-d-etudiants-inscrits-detail_etablissements',
  monMaster: 'fr-esr-mon_master',
  tmmMentions: 'fr-esr-tmm-donnees-du-portail-dinformation-trouver-mon-master-mentions-de-master',
  parcoursup: 'fr-esr-cartographie_formations_parcoursup',
};
const dsPage = (id) => `https://data.enseignementsup-recherche.gouv.fr/explore/dataset/${id}/`;
const CF_API = 'https://tie-api.campusfrance.org/';
const CF_CATALOGUE = 'https://taughtie.campusfrance.org/tiesearch/';
const CF_FEES_PAGE = 'https://www.campusfrance.org/en/tuition-fees-France';
const FEE_ORDER_URL = 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000038396885'; // Arrêté du 19 avril 2019 (cited by Campus France)
const SCIENCESPO_FEES = 'https://www.sciencespo.fr/students/en/fees-funding/tuition-fees';
const IPPARIS_FAQ = 'https://www.ip-paris.fr/en/education/masters/faqs';
// CentraleSupélec engineering-cycle fee schedule (official enrolment site; its https host serves an incomplete certificate
// chain, so the page is read over http — same page, same host)
const CS_ENGINEERING_FEES = 'http://rentree.centralesupelec.fr/en/droits-ingenieurs-EN';
const FX_URL = 'https://api.frankfurter.app/latest?from=EUR&to=USD';

// Public institutions' OWN 2026-27 fee pages, checked against the national non-EU fee. A page that states a blanket
// (partial) exemption bringing non-EU students to the domestic fee contradicts the national amount → no fee proposal for
// that institution (existing values unchanged, reported). `confirm` = the sentence by which the page confirms the national
// differentiated fee (supporting evidence only). Universities not listed here were not checked against their own page.
const UNIVERSITY_FEE_PAGES = {
  saclay: { url: 'https://www.universite-paris-saclay.fr/en/admission/tuition-fees' },
  caen: { url: 'https://www.unicaen.fr/formation/candidater-sinscrire/informations-pratiques/droits-dinscription-differencies-et-exonerations/', confirm: /droits d.inscription différenciés appliqués en 2026-2027 sont les suivants\s*:[^€]{0,200}?2\s?902\s?€[^€]{0,160}?3\s?950\s?€/i },
  montpellier: { url: 'https://www.umontpellier.fr/articles/etudiantes-et-etudiants-internationaux-ce-qui-change-concernant-les-droits-dinscription-a-la-rentree-2026', confirm: /À compter de la rentrée universitaire 2026, les droits d.inscription différenciés s.appliqueront[^.]*\./i },
  'ens-lyon': { url: 'https://www.ens-lyon.fr/formation/inscription-scolarite/inscription-et-reinscription-lens-de-lyon/droits-dinscription', confirm: /Pour les étudiants internationaux qui ne relèvent d.aucune des situations citées ci-dessus\s*:\s*Master\s*:\s*3\s?950\s?€/i },
};
// "non-EU students … are eligible for a partial exemption, which brings the differentiated registration fees in line with
// the fees applicable to domestic students" (EN) / "exonération partielle … alignés sur … nationaux" (FR)
const BLANKET_EXEMPTION_RE = /(?:non-EU|international|extra-?communautaires?)[^.]{0,120}(?:partial exemption|exon[ée]ration partielle)[^.]{0,160}(?:in line with|aligned with|same as|equal to|align[ée]s? sur|identiques? (?:à|aux))[^.]{0,80}(?:domestic|French|EU|nationaux|fran[çc]ais|communautaires)(?:[^.]|\.(?=\s?[A-Z]{2}-\d))*\./i;

// Campus France catalogue levels (levelObtainedId, from the catalogue's own label list)
const CF_LEVEL = { 10: 'Licence L1', 11: 'Licence L2', 12: 'Licence L3/Bachelor', 25: 'Master 1', 26: 'Master 2', 21: 'Master of Science', 22: 'Specialized Mastère', 23: 'MBA', 40: 'Short course', 41: 'Summer course' };
const CF_MASTER = new Set([21, 22, 23, 25, 26]);
const CF_BACHELOR = new Set([10, 11, 12]);

// ---------------------------------------------------------------- our records ↔ official register ----------
// Curated mapping of the 45 existing France records. Every proposed value is read from the official sources at run
// time; the mapping only says which register entry / catalogue institution a record is. `rename` is applied only when
// it equals the register's official name (renamed or merged universities). `dups` = other records of the same
// institution (hidden). kind: university → national fee order; national-master → Master's national fee only;
// own → programme fees from the institution's own pages; sciencespo / ipparis → dedicated official fee pages.
const REGISTRY = [
  // Business schools (private; fees from their own programme pages)
  { key: 'escp', db: ['ESCP Business School'], uai: '0753547Y', kind: 'business', fee: 'own', cf: [115], ownDomains: ['escp.eu', 'escpeurope.eu'] },
  { key: 'hec', db: ['HEC Paris'], uai: '0783054W', kind: 'business', fee: 'own', cf: [134] },
  { key: 'essec', db: ['ESSEC Business School'], uai: '0951214D', kind: 'business', fee: 'own', cf: [133] },
  { key: 'edhec', db: ['EDHEC Business School'], uai: '0590350K', kind: 'business', fee: 'own', cf: [368] },
  { key: 'skema', db: ['SKEMA Business School'], uai: '0590346F', kind: 'business', fee: 'own', cf: [110], ownDomains: ['skema.edu', 'skema-bs.fr'] },
  { key: 'neoma', db: ['NEOMA Business School'], uai: '0760167U', kind: 'business', fee: 'own', cf: [5261] },
  { key: 'emlyon', db: ['EMLYON Business School'], uai: '0690197P', idSource: 'atlas', kind: 'business', fee: 'own', cf: [113] },
  // Grandes écoles
  { key: 'sciencespo', db: ['Sciences Po'], uai: '0753431X', kind: 'grande-ecole', fee: 'sciencespo', cf: [486] },
  { key: 'ipparis', db: ['Institut Polytechnique de Paris'], uai: '0912403T', kind: 'grande-ecole', fee: 'ipparis', cf: [5327, 86, 507, 5091, 532], ownDomains: ['ip-paris.fr', 'polytechnique.edu', 'ensae.fr', 'telecom-paris.fr', 'telecom-sudparis.eu'] },
  { key: 'enpc', db: ['École des Ponts ParisTech'], uai: '0772517T', kind: 'grande-ecole', fee: 'own', cf: [5219], ownDomains: ['ecoledesponts.fr', 'enpc.fr'] },
  { key: 'centralesupelec', db: ['CentraleSupélec'], uai: '0912341A', idSource: 'sise', kind: 'grande-ecole', fee: 'own', cf: [5322], feeSchedule: 'centralesupelec' },
  // INSA Lyon: public, under the Ministry (SISE), lists national Master's mentions in MonMaster → national Master's fee;
  // its undergraduate route is its own engineering programme, so the national Licence fee is not applied
  { key: 'insa-lyon', db: ['INSA Lyon'], uai: '0690192J', kind: 'grande-ecole', fee: 'national-master', nationalLevels: ['master'], cf: [107] },
  // ENS de Lyon: its own 2026-27 fee page lists the non-EU Master's fee (3 950 €) and no Licence fee (its L3 students are
  // not charged a Licence fee by the ENS) → national Master's fee only
  { key: 'ens-lyon', db: ['École Normale Supérieure de Lyon'], uai: '0694123G', kind: 'grande-ecole', fee: 'national-master', nationalLevels: ['master'], cf: [] },
  { key: 'ens-ps', db: ['École Normale Supérieure Paris-Saclay'], uai: '0912423P', idSource: 'sise', kind: 'grande-ecole', fee: 'national-master', cf: [636] },
  // Universities (public, under the Ministry → national registration fees)
  { key: 'lorraine', db: ['Université de Lorraine'], uai: '0542493S', cf: [5244] },
  { key: 'ube', db: ['Université de Bourgogne (uB)'], uai: '0212296G', cf: [21, 5251], rename: 'Université Bourgogne Europe' },
  { key: 'psl', db: ['Université PSL (Paris Sciences & Lettres)'], dups: ['Paris Sciences et Lettres University'], uai: '0756036D', cf: [5278] },
  { key: 'orleans', db: ['Université de Orléans'], uai: '0450855K', cf: [44], rename: "Université d'Orléans" },
  { key: 'lehavre', db: ['Université Le Havre Normandie'], uai: '0762762P', cf: [236] },
  { key: 'assas', db: ['Université Paris-Panthéon-Assas'], uai: '0756305W', cf: [400] },
  { key: 'caen', db: ['Université de Caen Normandie'], uai: '0141408E', cf: [16] },
  { key: 'rouen', db: ['Université de Rouen Normandie'], uai: '0761904G', cf: [61] },
  { key: 'utcapitole', db: ['Université Toulouse 1 Capitole'], uai: '0313124C', cf: [481], rename: 'Université Toulouse Capitole' },
  { key: 'limoges', db: ['Université de Limoges'], uai: '0870669E', cf: [546] },
  { key: 'poitiers', db: ['Université de Poitiers'], uai: '0860856N', cf: [] },
  { key: 'uca', db: ['Université Clermont Auvergne'], uai: '0632084Y', cf: [5303, 5329] },
  { key: 'nantes', db: ['Université de Nantes'], uai: '0442953W', cf: [42, 339], rename: 'Nantes Université' },
  { key: 'eiffel', db: ['Université Gustave Eiffel'], uai: '0772894C', cf: [35, 96] },
  { key: 'umlp', db: ['Université de Franche-Comté'], uai: '0252044L', cf: [10], rename: 'Université Marie et Louis Pasteur' },
  { key: 'uvsq', db: ['Université de Versailles Saint-Quentin-en-Yvelines (UVSQ)'], uai: '0781944P', cf: [] },
  { key: 'usmb', db: ['Université de Savoie Mont Blanc'], uai: '0730858L', cf: [18], rename: 'Université Savoie Mont Blanc' },
  { key: 'rennes', db: ['Université de Rennes 1'], uai: '0353074B', cf: [59, 5210], rename: 'Université de Rennes' },
  { key: 'sorbonne', db: ['Sorbonne Université'], dups: ['Sorbonne University'], uai: '0755890V', cf: [5268] },
  { key: 'saclay', db: ['Université Paris-Saclay'], uai: '0912408Y', cf: [5262] },
  { key: 'upcite', db: ['Université Paris Cité'], uai: '0755976N', cf: [409, 49] },
  { key: 'uga', db: ['Université Grenoble Alpes (UGA)'], uai: '0383546Y', cf: [166, 5315] },
  { key: 'amu', db: ['Aix-Marseille Université'], uai: '0134009M', cf: [3, 330] },
  { key: 'lyon1', db: ['Université Claude Bernard Lyon 1'], uai: '0691774D', cf: [32] },
  { key: 'unistra', db: ['Université de Strasbourg'], uai: '0673021V', cf: [5211, 5004] },
  { key: 'montpellier', db: ['Université de Montpellier'], uai: '0342490X', cf: [5279, 5207] },
  { key: 'bordeaux', db: ['Université de Bordeaux'], uai: '0333298F', cf: [11] },
  { key: 'lille', db: ['Université de Lille'], uai: '0597239Y', cf: [5316, 5293] },
  { key: 'toulouse', db: ['Université Paul Sabatier Toulouse III'], uai: '0313218E', cf: [], rename: 'Université de Toulouse' },
].map((e) => ({ kind: 'university', fee: 'national', idSource: 'register', ...e }));

// Register universities that are not in our DB, with their Campus France catalogue ids. One is created when it is a
// public university under the Ministry AND lists at least CREATE_MIN_CF English-taught degree programmes in the
// Campus France catalogue (i.e. it actively recruits international students in English); the rest are reported.
const CF_OTHER_UNIVERSITIES = {
  '0941111X': [54], '0751717J': [45], '0062205P': [5297], '0640251A': [55], '0421095M': [62], '0692437Z': [34],
  '0490970N': [5, 5330], '0830766G': [66], '0840685N': [8], '0720916E': [27], '0311383K': [67], '0331766R': [13],
  '0595964M': [5312], '0623957P': [7], '0290346U': [15], '0561718N': [652],
};
const CREATE_MIN_CF = 10;

// ---------------------------------------------------------------- text helpers ----------
const squash = (s) => String(s ?? '').replace(/[\s\u00a0\u202f]+/g, ' ').trim();
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const norm = (s) => fold(s).toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9.€]+/g, ' ').replace(/\s+/g, ' ').trim();
const key = (s) => fold(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
const digits = (s) => String(s ?? '').replace(/[^0-9]/g, '');
const money = (n) => Math.round(n).toLocaleString('en-US');
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');
const median = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const percentile = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))];
};
const regDomain = (url) => {
  if (!url) return '';
  const host = String(url).trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
  const parts = host.split('.').filter(Boolean);
  return parts.length >= 3 && /^(ac|co|gouv|asso)$/.test(parts[parts.length - 2]) ? parts.slice(-3).join('.') : parts.slice(-2).join('.');
};
const cleanUrl = (u) => {
  if (!u) return null;
  try {
    const x = new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`);
    for (const k of [...x.searchParams.keys()]) if (/^(utm_|channel$|gclid|fbclid)/i.test(k)) x.searchParams.delete(k);
    return x.toString();
  } catch (_) { return null; }
};
// "Paris 7e" / "Paris  6e" / "Lyon 1er" → "Paris" / "Lyon"; "Lille (partie française)" → "Lille"
const cityName = (s) => squash(String(s ?? '').replace(/\(.*?\)/g, '').replace(/\s+\d+(?:e|er|ème)\b.*$/i, ''));
const isoDay = (d) => new Date(d).toISOString().slice(0, 10);

function textOf(page) {
  if (page._text === undefined) {
    if (page.contentType === 'pdf') page._text = squash(page.pdfText || '');
    else if (/^\s*[[{]/.test(String(page.body).slice(0, 5))) page._text = squash(page.body);
    else {
      const $ = cheerio.load(String(page.body).replace(/>/g, '> '));
      $('head,script,style,noscript,svg,iframe').remove();
      page._text = squash($.root().text());
    }
    page._norm = norm(page._text);
  }
  return page._text;
}
const inPage = (page, quote) => { textOf(page); return Boolean(quote) && page._norm.includes(norm(quote)); };

// ---------------------------------------------------------------- HTTP with cache + scrape.do fallback ----------
const isBlocked = (status, body) => status === 403 || status === 429 || status === 503
  || /<title>\s*(Just a moment|Attention Required)/i.test(String(body).slice(0, 20000));

async function getPage(url, { scrapeDo = false, binary = false, headers = {} } = {}) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${sha1(url)}.json`);
  const failFile = path.join(CACHE_DIR, `${sha1(url)}.fail.json`);
  if (!REFRESH && fs.existsSync(file)) {
    const cached = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) { counters.cacheHits += 1; return cached; }
  }
  // A page that already failed after a scrape.do attempt is not retried within the cache period (re-runs cost 0 scrape.do)
  if (!REFRESH && fs.existsSync(failFile)) {
    const failed = JSON.parse(fs.readFileSync(failFile, 'utf8'));
    if (Date.now() - new Date(failed.fetchedAt).getTime() < CACHE_TTL_MS) { counters.cacheHits += 1; throw new Error(`${failed.error} (cached failure from ${failed.fetchedAt.slice(0, 10)})`); }
  }
  const remember = (error) => { fs.writeFileSync(failFile, JSON.stringify({ url, error, fetchedAt: new Date().toISOString() })); return new Error(error); };
  let status = 0;
  let body = '';
  let finalUrl = url;
  let via = 'direct';
  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-GB,en;q=0.9,fr;q=0.8', ...headers },
        redirect: 'follow',
        signal: AbortSignal.timeout(60000),
      });
      counters.directRequests += 1;
      status = res.status;
      finalUrl = res.url || url;
      body = binary ? Buffer.from(await res.arrayBuffer()).toString('base64') : await res.text();
      break;
    } catch (err) {
      lastError = err.cause?.code || err.message;
      if (attempt < 2) await sleep(2000);
    }
  }
  // err.incomplete marks failures a later run may not have (budget cap, network error, 429/5xx): the input is then
  // incomplete rather than "page has no fee"
  const tagged = (msg, extra) => Object.assign(new Error(msg), extra);
  if (!binary && isBlocked(status, body)) {
    if (!scrapeDo) throw tagged(`${url} blocks direct requests (HTTP ${status})`, { incomplete: status === 429 || status === 503 });
    if (!SCRAPE_DO_TOKEN) throw tagged('SCRAPE_DO_TOKEN missing in .env', { incomplete: true });
    if (counters.scrapeDoRequests >= MAX_SCRAPEDO) {
      counters.scrapeDoSkippedByCap += 1;
      throw tagged(`scrape.do budget for this run (${MAX_SCRAPEDO}) reached before ${url}`, { incomplete: true, budget: true });
    }
    counters.scrapeDoRequests += 1;
    try {
      const res = await fetch(`https://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(120000) });
      status = res.status;
      body = await res.text();
    } catch (err) {
      throw remember(`scrape.do request failed for ${url} (${err.cause?.code || 'network error'})`); // never echo the API URL (token)
    }
    via = 'scrape.do';
    finalUrl = url;
    if (isBlocked(status, body)) throw remember(`${url} still blocked via scrape.do (HTTP ${status})`);
    if (status < 200 || status >= 300) throw remember(`HTTP ${status} for ${url} (via scrape.do)`);
  }
  if (status < 200 || status >= 300) throw tagged(`HTTP ${status || lastError || 'error'} for ${url}`, { incomplete: !status || status === 429 || status >= 500 });
  const entry = { url, finalUrl, via, status, fetchedAt: new Date().toISOString(), binary, body };
  fs.writeFileSync(file, JSON.stringify(entry));
  return entry;
}
const getJson = async (url, opts) => { const p = await getPage(url, opts); return { page: p, data: JSON.parse(p.body) }; };

async function pdfPage(url) {
  const page = await getPage(url, { binary: true });
  const tmp = path.join(os.tmpdir(), `franceSync-${sha1(url)}.pdf`);
  fs.writeFileSync(tmp, Buffer.from(page.body, 'base64'));
  let text = null;
  // -table (xpdf, Git for Windows) keeps table rows on one line; poppler builds fall back to -layout
  outer: for (const exe of ['pdftotext', 'C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe']) {
    for (const mode of ['-table', '-layout']) {
      try { text = execFileSync(exe, [mode, '-enc', 'UTF-8', tmp, '-'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }); break outer; } catch (_) { /* try next */ }
    }
  }
  try { fs.unlinkSync(tmp); } catch (_) { /* ignore */ }
  if (text === null) throw new Error('pdftotext is not available (poppler; ships with Git for Windows)');
  return { ...page, contentType: 'pdf', pdfText: text };
}

async function eurToUsd() {
  let lastError = '';
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(FX_URL, { headers: { 'User-Agent': BROWSER_UA }, signal: AbortSignal.timeout(30000) });
      const j = await res.json();
      if (j?.rates?.USD) return { base: 'EUR', quote: 'USD', rate: j.rates.USD, date: j.date, source: 'ECB reference rate via api.frankfurter.app', url: FX_URL };
      lastError = 'no EUR→USD rate in response';
    } catch (err) { lastError = err.cause?.code || err.message; }
    await sleep(3000 * attempt);
  }
  throw new Error(`frankfurter.app: ${lastError}`);
}

// ---------------------------------------------------------------- MESR open data ----------
const odsUrl = (ds, kind, params) => `${MESR_API}/${ds}/${kind}?${new URLSearchParams(params).toString()}`;
async function odsLatest(ds, field) {
  const { data } = await getJson(odsUrl(ds, 'records', { select: `${field},count(*) as n`, group_by: field, order_by: `${field} desc`, limit: '1' }));
  return data.results?.[0]?.[field] || null;
}
const odsIn = (field, values) => `${field} in (${values.map((v) => `"${v}"`).join(',')})`;

// ---------------------------------------------------------------- course helpers ----------
const SMALL_WORDS = new Set(['de', 'des', 'du', 'la', 'le', 'les', 'et', 'en', 'a', 'au', 'aux', 'l', 'd', 'pour', 'sur', 'dans', 'ou']);
const ACRONYMS = /^(AI|MEEF|STAPS|MIAGE|PME|PMI|RH|TIC|BTP|NBIC|IAE|SHS|LLCER|LEA|MIASHS|SVT|SVTU|STS|EEA|AES|MASS|ISTE|IHM|IA|UE|TAL|TIG|SIG|GSI|QHSE|HSE|DD|BIM|NTIC|ESR|FLE)$/;
// Mon Master prints mentions in capitals without accents; the official spelling comes from the TMM mention list
function mentionName(upper, casing) {
  const hit = casing.get(key(upper));
  // official spelling, with lower-case acronyms restored ("… des entreprises - miage" → "… - MIAGE")
  if (hit) return { name: hit.split(' ').map((w) => (w === w.toLowerCase() && ACRONYMS.test(w.toUpperCase()) ? w.toUpperCase() : w)).join(' '), accents: true };
  const words = squash(upper).toLowerCase().split(' ').map((w, i) => {
    const bare = w.replace(/[^a-z0-9]/gi, '').toUpperCase();
    if (ACRONYMS.test(bare)) return w.toUpperCase();
    if (i === 0) return w.charAt(0).toUpperCase() + w.slice(1);
    return w;
  });
  return { name: words.join(' '), accents: false };
}
const cleanCfLabel = (s) => squash(String(s).replace(/#PR\d+/gi, '').replace(/\s+:\s+/g, ': ')).replace(/[\s\-–:#]+$/, '');
// Course-list form of a catalogue name: the year of study (M1 / M2) and the campus site are dropped so that
// "Master 1 X (Orsay Site)" and "Master 2 X" become one course "Master in X"
const courseFromCf = (s) => cleanCfLabel(cleanCfLabel(s)
  .replace(/^Master\s+['’]s\b/i, "Master's")
  // "Master 2/L.L.M. in X", "Master's degree (M2)/L.L.M. in X" → "Master/L.L.M. in X"
  .replace(/^(?:Master\s*[12]|Master['’]?s?(?: degree)?\s*\((?:M1|M2)\))\s*\//i, 'Master/')
  .replace(/^Master['’]?s?(?: degree)?\s*\((?:M1|M2)\)\s*(?:[-–:]\s*)?(?:in\s+)?/i, 'Master in ')
  .replace(/^Master\s*[12](?!\d)\s*(?:[-–:]\s*)?(?:in\s+)?/i, 'Master in ')
  .replace(/^M[12]\s+(?:[-–:]\s*)?(?:in\s+)?/, 'Master in ')
  .replace(/^Master in (?:Master(?:['’]s)?(?: Degree)?(?: of Science)?\s+(?:in\s+)?)/i, 'Master in ')
  .replace(/^Master['’]s degree\s+(?:in\s+)?/i, 'Master in ')
  .replace(/^Master in\s*[-–:]\s*/i, 'Master in ') // "Master's Degree - Management of X"
  .replace(/^Master in\s*\/\s*/i, 'Master / ') // "Master's Degree / Double Degree - X"
  .replace(/\s*\((?:L[123]|M[12])\)/g, '') // year of study: "Licence (L2) X" and "Licence (L3) X" are one course
  .replace(/\s*[-–]?\s*\b(?:1st|2nd|first|second) year\b/gi, '')
  .replace(/\s*\((?:[A-Z][\w-]*\s+site|site\s+(?:d['e]\s*)?[\w-]+)\)\s*$/i, '')
  .replace(/\s*[-–]\s*(?:site\s+(?:d['e]\s*)?[\w-]+|[\w-]+\s+site)\s*$/i, '')
  .replace(/\.\s*$/, ''));

function parcoursupCourses(rows, kind) {
  const out = [];
  for (const r of rows) {
    const nm = squash([].concat(r.nm || []).join(' '));
    if (/double (?:dipl[oô]me|licence)|\bPASS\b|Acc[eè]s Sant[eé]|\bLAS\b|DEUST|CUPGE|Dipl[oô]me d.universit|pr[ée]paratoire|CPGE|Cycle pluridisciplinaire|distanciel/i.test(nm)) continue;
    for (const f of [].concat(r.fl || [])) {
      let m = String(f).match(/^L1 - (.+)$/);
      if (m) { out.push(`Licence ${squash(m[1])}`); continue; }
      m = String(f).match(/^BUT - (.+)$/);
      if (m) out.push(`BUT ${squash(m[1])}`);
    }
    if (kind !== 'university') {
      // school bachelors: the programme name after "Formation … Bac + n - ", else the name inside the institution label
      const re = /\b((?:International |Global )?BBA\b[^()]*?|Bachelor\b[^()]*?)(?=\s+-\s+(?:Campus|Voie|Parcours Talents|Entièrement|Bac)|\s*\(|$)/i;
      const m2 = nm.replace(/^.*?Bac \+ \d\s*-\s*/i, '').match(re) || squash(r.etab_nom).match(re);
      if (m2) out.push(squash(m2[1]).replace(/[\s\-–]+$/, ''));
    }
  }
  return out;
}
// The 5-year post-baccalaureate engineering degree of a school (Parcoursup "Formation d'ingénieur Bac + 5", type FI-BAC5):
// a Master's-level degree (grade de master), listed as one course
const parcoursupEngineering = (rows) => rows.map((r) => squash([].concat(r.nm || []).join(' '))).find((nm) => /^Formation d.ing[ée]nieur Bac \+ 5\b/i.test(nm)) || null;

// "Master in Neurosciences" (Campus France) and "Master Neurosciences" (MonMaster mention) are one course; the first
// one listed (English-taught catalogue name) is kept
const courseKey = (c) => key(String(c).replace(/^Master\s+(?:in\s+)?/i, 'Master '));
function dedupe(list) {
  const seen = new Set();
  const out = [];
  for (const c of list) {
    const k = courseKey(c);
    if (!c || seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

// ---------------------------------------------------------------- fee parsing ----------
const AMOUNT_RE = /(?:€\s?|EUR\s?)(\d{1,3}(?:[ ,.\u202f\u00a0]\d{3})+|\d{4,6})(?!\d)|(?<![\d,.])(\d{1,3}(?:[ ,.\u202f\u00a0]\d{3})+|\d{4,6})\s?(?:€|euros?\b|EUR\b)/gi;
const NOT_TUITION_RE = /applica|deposit|acompte|gap year|c[ée]sure|alumni|membership|service|administrative|admin\.? fee|registration|inscription|insurance|housing|accommodation|living|scholarship|bourse|discount|r[ée]duction|up to|jusqu|supplement|additional|per module|par module|\bmodule|ECTS|travel|CVEC|optional|deducted|d[ée]duit|pre-?master|year 1 \(|deposit/i;
const TUITION_LABEL_RE = /tuition|fees?\s*:|fees? (?:is|are|of)\b|frais de scolarit|programme fee|program fee|total (?:cost|tuition|fee)|price|tarif|co[uû]t|fees?\s*\*?\s*$/i;
const NON_EU_RE = /non[- ]?(?:EU|E\.U\.|European|EEA|UE|europ[ée]ens?)|outside (?:the )?(?:EU|EEA|European)|international students|extra-?(?:EU|communautaires?)|hors (?:UE|Union)|partner[- ]country/i;
const EU_RE = /\b(?:EU|EEA|UE)\b|European|europ[ée]ens?|programme[- ]country/i;
const PER_YEAR_RE = /per (?:academic )?year|\/\s?(?:academic )?year|a year\b|par an\b|\/\s?an\b|annual|yearly|per annum|each year|par ann[ée]e/i;
const FEE_MIN = 2000;
const FEE_MAX = 120000;
const SPECIAL_RE = /\bMBA\b|executive|EMBA|m[ée]decine|medicine|dentist|v[ée]t[ée]rinaire|veterinary|pilot/i;

// Programme length in years from catalogue text ("18 months - including…", "2-year programme + …", "1 academic year")
function programmeYears(lengthText) {
  const t = squash(lengthText).toLowerCase();
  if (!t) return null;
  if (/\b\d\s*(?:to|or|-)\s*\d\s*(?:academic )?years?\b|depending/.test(t) && !/\d+\s*months?/.test(t)) return null; // "1 or 2 years", "2 to 4 years"
  let m = t.match(/(\d+)\s*(?:(?:-|to|or)\s*\d+\s*)?months?/);
  if (m && !/\d[- ](?:academic )?years?/.test(t.slice(0, m.index))) return Number(m[1]) <= 18 ? 1 : (Number(m[1]) <= 30 ? 2 : null);
  m = t.match(/(\d)[- ]?(?:academic )?years?\b/);
  if (m) return Number(m[1]);
  if (/\bone(?:[- ]academic)? year\b/.test(t)) return 1;
  if (/\btwo(?:[- ]academic)? years?\b/.test(t)) return 2;
  return null;
}

function amountsIn(text) {
  const out = [];
  for (const m of String(text).matchAll(AMOUNT_RE)) {
    const value = Number(digits(m[1] || m[2]));
    if (!value) continue;
    out.push({ value, index: m.index, end: m.index + m[0].length, raw: m[0] });
  }
  return out;
}

// Non-EU labels ("Non-European", "Non-EU/EEA") blanked out with spaces (positions kept), so that what is left shows an
// EU-only label
const NON_EU_STRIP_RE = new RegExp(`(?:${NON_EU_RE.source})(?:\\s*[/,&]\\s*(?:EU|EEA|UE|Swiss|Switzerland|EFTA))*`, 'gi');
const blankNonEu = (s) => String(s).replace(NON_EU_STRIP_RE, (m) => ' '.repeat(m.length));
// "per year" stated for the whole fee sentence or table heading ("The annual fees for students enrolling in the three-year
// programme … are as follows: European Students | Non-European Students Tuition: €17,900 … Tuition: €23,900")
const ANNUAL_HEAD_RE = /\b(?:annual|yearly) (?:tuition )?fees?\b|\b(?:tuition|fees?) (?:per|a|each) (?:academic )?year\b|\bfrais (?:de scolarit[ée] )?annuels\b/i;
// The sentence the amount at `index` belongs to (from the previous sentence end, at most `max` characters back)
function sentenceBefore(t, index, max = 260) {
  const s = t.slice(Math.max(0, index - max), index);
  const end = [...s.matchAll(/[.!?]\s/g)].pop();
  return end ? s.slice(end.index + 2) : s;
}
// The sentence says the amounts are yearly, and nothing between that phrase and the amount says "total / whole programme"
function sentenceSaysPerYear(t, index) {
  const s = sentenceBefore(t, index);
  const m = s.match(ANNUAL_HEAD_RE);
  return Boolean(m) && !/\btotal\b|\bwhole\b|\bentire\b|\bfull (?:programme|program|course)\b/i.test(s.slice(m.index + m[0].length));
}

// Deterministic: one clearly labelled tuition amount (non-EU when the page distinguishes), or a one-year / two-year
// track pair. Returns { ambiguous } when the page is not clear-cut (several amounts, tuition printed in parts, …) so
// the LLM fallback can read it. Multi-year programme fees are divided by the years (marked approx).
// Column tables ("European Students | Non-European Students" headers printed BEFORE both amounts) are read by column
// position; an EU / non-EU table the parser cannot map is left to the LLM.
function parseFeeDeterministic(text, lengthText, { allTuition = false } = {}) {
  const t = squash(text);
  const cands = [];
  const all = amountsIn(t);
  for (const [i, a] of all.entries()) {
    if (a.value < FEE_MIN || a.value > FEE_MAX) continue;
    // text since the previous amount: EU AND non-EU labels both printed there = column headers of a fee table
    const head = t.slice(Math.max(i ? all[i - 1].end : 0, a.index - 200), a.index);
    const nonEuAt = head.search(NON_EU_RE);
    const euAt = blankNonEu(head).search(EU_RE);
    const columnOrder = nonEuAt >= 0 && euAt >= 0 ? (euAt < nonEuAt ? ['eu', 'noneu'] : ['noneu', 'eu']) : null;
    const before = t.slice(Math.max(0, a.index - 70), a.index);
    const wideBefore = t.slice(Math.max(0, a.index - 160), a.index);
    const afterFull = t.slice(a.end, a.end + 70);
    const after = afterFull.split(/[;|]|\.\s|\s[-–]\s/)[0]; // up to the next list separator
    // the words after the amount that still describe it: a following "Label: €n" item ("Tuition: €19,000 Administrative
    // fee: €500") describes the NEXT amount, not this one
    const afterOwn = after.replace(/\s+[A-Z][A-Za-z()' -]{1,40}:\s*(?:€|EUR)?\s?\d[\s\S]*$/, '');
    if (/[£$]\s?$/.test(before) || /^\s?(?:HK|\$|£)/.test(afterFull)) continue;
    if (NOT_TUITION_RE.test(before.slice(-40)) || NOT_TUITION_RE.test(afterOwn.slice(0, 28))) continue;
    const tuitionOnly = /^\*?\s*(?:in )?tuition/i.test(afterFull) || /tuition(?: fees?)?\s*:?\s*$/i.test(before);
    const lab = before.slice(-45);
    const tm = [...lab.matchAll(/\b(one|two|1|2)[- ]?(?:year|yr)/gi)].pop(); // the track label closest to the amount
    // labelled: "Tuition fees: €X", or a track amount ("2-year course: €Y") under a tuition heading just before
    const labelled = allTuition || tuitionOnly || TUITION_LABEL_RE.test(before.slice(-55)) || (tm && /tuition|frais de scolarit/i.test(wideBefore));
    if (!labelled) continue;
    let region = 'all';
    const a22 = after.slice(0, 22);
    if (NON_EU_RE.test(a22)) region = 'noneu';
    else if (EU_RE.test(a22)) region = 'eu';
    else if (NON_EU_RE.test(before.slice(-35))) region = 'noneu';
    else if (EU_RE.test(before.slice(-35))) region = 'eu';
    cands.push({
      ...a, region, tuitionOnly, columnOrder, ownLabel: nonEuAt >= 0 || euAt >= 0,
      // "per year" printed right next to the amount (a wider window caught "25 students / academic year Tuition Fees: €X"),
      // or stated by the amount's own sentence ("The annual fees … are as follows: … €X")
      perYear: PER_YEAR_RE.test(`${before.slice(-25)} ${after.slice(0, 40)}`) || sentenceSaysPerYear(t, a.index),
      split: /^[^.;€]{0,45}\b(?:and|et|plus)\s+€?\s?\d/i.test(afterFull) || /^\s*\(?\s*\+\s*€?\s?\d/.test(afterFull),
      track: tm ? (/^(?:one|1)$/i.test(tm[1]) ? 1 : 2) : null,
      quote: squash(t.slice(Math.max(0, a.index - 45), Math.min(t.length, a.end + 30))),
    });
  }
  if (cands.some((c) => c.split)) return { ambiguous: true, candidates: cands.length, reason: 'tuition printed in parts' };
  // Column table: the candidate after the two headers and the following candidates without labels of their own are the
  // columns, in header order. Exactly one amount per column → regions by position, "per year" from the heading sentence,
  // quote = heading through the non-EU amount. Anything else (more amounts, track labels) → LLM.
  for (const [k, c] of cands.entries()) {
    if (!c.columnOrder) continue;
    const group = [c];
    for (const d of cands.slice(k + 1)) { if (d.ownLabel || d.index - group[group.length - 1].end > 300) break; group.push(d); }
    const cols = group.some((g) => g.tuitionOnly) ? group.filter((g) => g.tuitionOnly) : group;
    if (cols.length === 1) continue; // one amount after both labels ("fees for EU and non-EU students: €X"): not a table
    if (cols.length !== c.columnOrder.length || cols.some((g) => g.track)) return { ambiguous: true, candidates: cands.length, reason: 'EU / non-EU fee table with columns the parser cannot map' };
    const headStart = c.index - sentenceBefore(t, c.index).length;
    const perYear = cols.some((g) => g.perYear) || sentenceSaysPerYear(t, c.index);
    cols.forEach((g, j) => {
      g.region = c.columnOrder[j];
      g.perYear = perYear;
      g.column = true;
      if (g.end - headStart <= 420) g.quote = squash(t.slice(headStart, g.end));
    });
    for (const d of group) if (!cols.includes(d)) d.region = 'column-other'; // totals etc. printed in the same table
  }
  const fromColumns = cands.some((c) => c.column && c.region === 'noneu');
  let pool = cands.some((c) => c.region === 'noneu') ? cands.filter((c) => c.region === 'noneu') : cands.filter((c) => c.region === 'all');
  // When the page prints a one-year AND a two-year track fee, both tracks count (a key-facts header "Tuition fees: €39,900"
  // that repeats the two-year total must not hide the one-year track printed further down)
  const printsTracks = pool.some((c) => c.track === 1) && pool.some((c) => c.track === 2) && new Set(pool.filter((c) => c.track).map((c) => c.value)).size >= 2;
  if (!printsTracks && pool.some((c) => c.tuitionOnly)) pool = pool.filter((c) => c.tuitionOnly);
  const values = [...new Set(pool.map((c) => c.value))];
  const lengthYears = programmeYears(lengthText);
  if (values.length === 2 && pool.some((c) => c.track === 1) && pool.some((c) => c.track === 2)) {
    const one = pool.find((c) => c.track === 1);
    const two = pool.find((c) => c.track === 2);
    const a = Math.min(one.index, two.index);
    const b = Math.max(one.end, two.end);
    const quote = b - a < 260 ? squash(t.slice(Math.max(0, a - 45), b + 5)) : `${one.quote} … ${two.quote}`;
    return { annualValues: [one.value, two.perYear ? two.value : Math.round(two.value / 2)], trackYears: [1, 2], amount: [one.value, two.value], approx: true, quote, region: one.region, basis: 'one-year track fee, and two-year track fee ÷ 2' };
  }
  if (values.length !== 1) return { ambiguous: cands.length > 0, candidates: cands.length };
  const c = pool[0];
  if (c.perYear) return { annualValues: [c.value], amount: c.value, basis: fromColumns && c.column ? 'per year (as printed: yearly fees, non-EU column of an EU / non-EU fee table)' : 'per year (as printed)', approx: false, quote: c.quote, region: c.region };
  const years = c.track || lengthYears;
  if (!years || years > 3) return { ambiguous: true, candidates: cands.length, reason: 'programme length unknown' };
  return {
    annualValues: [Math.round(c.value / years)], amount: c.value, approx: true, quote: c.quote, region: c.region,
    basis: years === 1 ? `programme fee for a one-year programme / programme of up to 18 months ("${squash(lengthText)}"), taken as one year` : `programme fee divided by ${years} years (${c.track ? 'printed track length' : `"${squash(lengthText)}"`})`,
  };
}
const quoteIn = (page, quote) => String(quote || '').split(' … ').every((q) => inPage(page, q));

// Text windows around fee words (keeps the LLM prompt small)
function feeWindow(text, max = 3500) {
  const t = squash(text);
  const spans = [];
  for (const m of t.matchAll(/tuition|fees?\b|frais de scolarit|total cost|co[uû]t total|price/gi)) spans.push([Math.max(0, m.index - 250), Math.min(t.length, m.index + 400)]);
  spans.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const s of spans) { if (merged.length && s[0] <= merged[merged.length - 1][1]) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], s[1]); else merged.push([...s]); }
  return merged.map(([a, b]) => t.slice(a, b)).filter((s) => /€|EUR|euro/i.test(s)).join(' … ').slice(0, max);
}

async function groqJson(prompt) {
  fs.mkdirSync(LLM_CACHE_DIR, { recursive: true });
  const file = path.join(LLM_CACHE_DIR, `${sha1(prompt)}.json`);
  if (fs.existsSync(file)) { counters.llmCacheHits += 1; return JSON.parse(fs.readFileSync(file, 'utf8')); }
  // Not asked (cap / no key / --no-llm) or failed: the page is NOT "without a fee" — the caller marks the input incomplete
  if (!GROQ_API_KEY || NO_LLM) { counters.llmUnavailable += 1; return { unavailable: NO_LLM ? '--no-llm' : 'GROQ_API_KEY missing' }; }
  if (counters.groqCalls >= MAX_LLM) { counters.llmSkippedByCap += 1; return { unavailable: `Groq cap for this run (${MAX_LLM}) reached` }; }
  for (const model of GROQ_MODELS) {
    let res = null;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      counters.groqCalls += 1;
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
        signal: AbortSignal.timeout(90000),
      }).catch(() => null);
      if (!res || res.status !== 429) break;
      const hint = (await res.text()).match(/try again in ([\d.]+)(ms|s)/);
      const wait = hint ? Number(hint[1]) / (hint[2] === 'ms' ? 1000 : 1) : 20;
      await sleep(Math.min(60, wait + 2) * 1000); // shared tokens-per-minute limit
    }
    if (!res || !res.ok) continue;
    let data;
    try { data = JSON.parse((await res.json()).choices[0].message.content); } catch (_) { continue; }
    const out = { model, data };
    fs.writeFileSync(file, JSON.stringify(out));
    return out;
  }
  counters.llmUnavailable += 1;
  return { unavailable: 'Groq API request failed' };
}

async function parseFeeLlm({ institution, programme, url, text, lengthText, source }) {
  const window = feeWindow(text);
  if (!window) return null;
  const prompt = `You read an official French higher-education ${source} about ONE programme and extract its yearly TUITION FEE for a full-time NON-EU (international) student.
Institution: ${institution}
Programme: ${programme}
Programme length (Campus France catalogue): ${lengthText || 'not stated'}
URL: ${url}

Return ONLY JSON: {"found":boolean,"appliesTo":"non-EU"|"all students"|"EU only"|null,"tracks":[{"amountEUR":number,"basis":"per year"|"whole programme","programmeYears":number|null}],"quote":string|null,"intake":string|null}
Rules:
- amountEUR = the tuition fee in euros as printed (digits only). Exclude application fees, deposits, alumni/service/administrative/registration fees, gap-year fees, housing, insurance, scholarships and discounts.
- If separate EU and non-EU fees are printed, use the non-EU ones. If the tuition is printed in parts that add up (e.g. core courses + specialisation), return their sum as one amount.
- One entry in "tracks" per admission track printed with its own fee (e.g. a one-year and a two-year track); otherwise a single entry.
- If the fee is printed per year of study (e.g. "M1: €X … M2: €Y", "Year 1 … Year 2 …"), return one entry per year of study, each with basis "per year" (the non-EU amount for each year). Never add amounts of different years together.
- basis = "per year" only if the text says the amount is per year / annual; otherwise "whole programme". programmeYears = that track's duration in years if stated in the text or the length above, else null.
- quote = one short contiguous snippet (max 40 words) copied EXACTLY from the text that contains the amount(s).
- intake = the intake or academic year the fee is for, if printed (e.g. "September 2027", "2026-2027"), else null.
- If no tuition fee is printed, return {"found":false}.

TEXT:
${window}`;
  const out = await groqJson(prompt);
  if (out?.unavailable) return { unavailable: out.unavailable };
  const d = out?.data;
  if (!d || !d.found) return out ? { llm: out.model, found: false } : null;
  let tracks = (Array.isArray(d.tracks) ? d.tracks : []).slice(0, 3);
  if (!tracks.length || d.appliesTo === 'EU only' || !d.quote) return { llm: out.model, found: false, rejected: 'no track / EU-only / no quote' };
  if (!norm(text).includes(norm(d.quote))) return { llm: out.model, found: false, rejected: 'quote not in page' };
  const quoteAmounts = amountsIn(d.quote);
  const nums = quoteAmounts.map((a) => a.value);
  const notes = [];
  // A preparatory year ("Year 1 (International Pre-Master) Tuition: €10,500") is a separate non-degree programme: an
  // amount printed ONLY under such a label is dropped (one printed elsewhere, e.g. the same amount for the MSc year, stays)
  const occurrences = quoteAmounts.map((a, i) => ({ value: a.value, prep: PREP_RE.test(d.quote.slice(i ? quoteAmounts[i - 1].end : 0, a.index)) }));
  const usedOcc = new Map();
  tracks = tracks.filter((tr) => {
    const amount = Number(tr.amountEUR);
    const plain = occurrences.filter((o) => o.value === amount && !o.prep).length;
    const prep = occurrences.filter((o) => o.value === amount && o.prep).length;
    const used = usedOcc.get(amount) || 0;
    usedOcc.set(amount, used + 1);
    if (prep && used >= plain) { notes.push(`${money(amount)} preparatory (pre-Master) year excluded`); return false; }
    return true;
  });
  if (!tracks.length) return { llm: out.model, found: false, rejected: 'only a preparatory-year fee' };
  // Years of ONE track printed separately ("2-year course: €32,900 … Y1: €12,300 Y2: €20,600") form one yearly value
  // (their sum ÷ 2) before the tracks are averaged; recognised when the page prints their sum as that track's total
  const merged = [];
  for (let i = 0; i < tracks.length; i += 1) {
    const a = tracks[i];
    const b = tracks[i + 1];
    const sum = b ? Number(a.amountEUR) + Number(b.amountEUR) : null;
    if (b && a.basis === 'per year' && b.basis === 'per year' && nums.includes(sum) && nums.includes(Number(a.amountEUR)) && nums.includes(Number(b.amountEUR))) {
      merged.push({ amountEUR: sum, basis: 'whole programme', programmeYears: 2, mergedFrom: [Number(a.amountEUR), Number(b.amountEUR)] });
      i += 1;
    } else merged.push(a);
  }
  tracks = merged;
  const annualValues = [];
  const trackYears = []; // length of each track (null when not known), aligned with annualValues
  for (const tr of tracks) {
    const amount = Number(tr.amountEUR);
    if (!(amount >= FEE_MIN && amount <= FEE_MAX)) return { llm: out.model, found: false, rejected: `amount ${amount} out of range` };
    const summed = !nums.includes(amount) && nums.some((a, i) => nums.some((b, j) => i !== j && a + b === amount));
    if (!nums.includes(amount) && !summed) return { llm: out.model, found: false, rejected: `amount ${amount} not in quote` };
    const perYear = tr.basis === 'per year';
    // single-track programme: the institution's declared length (Campus France) wins over the model's guess, so that
    // "2-year programme + 1 professional immersion year" is divided by 2 here exactly as in the deterministic parser
    const catalogueYears = programmeYears(lengthText);
    const years = tr.mergedFrom ? 2 : (perYear ? 1 : ((tracks.length === 1 && catalogueYears) || Number(tr.programmeYears) || catalogueYears));
    if (!years || years > 3) return { llm: out.model, found: false, rejected: 'programme length unknown' };
    annualValues.push(Math.round(amount / (perYear || years <= 1.5 ? 1 : years)));
    trackYears.push(tr.mergedFrom ? 2 : (perYear ? (Number(tr.programmeYears) || null) : years));
    if (tr.mergedFrom) notes.push(`two-year track: year 1 ${money(tr.mergedFrom[0])} + year 2 ${money(tr.mergedFrom[1])} = ${money(amount)} (printed total) ÷ 2`);
    else notes.push(`${money(amount)}${summed ? ' (sum of printed parts)' : ''} ${perYear ? 'per year' : (years <= 1.5 ? 'for a ≤18-month programme, taken as one year' : `÷ ${years} years`)}`);
  }
  if (annualValues.length > 1) notes.push('programme value = mean of its tracks');
  return {
    annualValues, trackYears, amount: tracks.map((x) => Number(x.amountEUR)), approx: true, quote: squash(d.quote), region: d.appliesTo === 'non-EU' ? 'noneu' : 'all',
    basis: `${notes.join('; ')} (LLM-read, ${out.model}; quote verified in page)`, intake: d.intake || null, llm: out.model,
  };
}

// Year(s) the fee is for, as printed next to it (short strings: the fee quote, the LLM's "intake", a catalogue fee field)
const acadYear = (y1, y2) => (y2 ? `${y1}/${String(y2).slice(-2)}` : `${y1}/${String(Number(y1) + 1).slice(-2)}`); // autumn intake → academic year
const feeYearIn = (s) => {
  const m = String(s || '').match(/\b(20[2-3]\d)\s*[–\-/]\s*(20[2-3]\d|[2-3]\d)\b/) || String(s || '').match(/(?:intake|rentr[ée]e|september|entering|for)\D{0,25}(20[2-3]\d)/i);
  return m ? acadYear(m[1], m[2]) : null;
};
// Intake / academic year printed with an anchoring phrase in the page text around the fee ("Registrations for
// 2026-2027", "Courses start on September 1st, 2026", "Next intake date: September 2027", "(2027–2028 academic year)").
// Bare years ("Cohort 2023-2024", "Ranking 2026", application-round dates) are not used. Kept only when unambiguous.
const ANCHORED_YEAR_RES = [
  /\b(20[2-3]\d)\s*[–\-/]\s*(20[2-3]\d)\s*\)?\s*(?:academic year|ann[ée]e (?:universitaire|acad[ée]mique))/gi,
  /(?:academic year|ann[ée]e (?:universitaire|acad[ée]mique)|registrations? (?:for|open for)|intake(?: date)?|rentr[ée]e|valid for|fees? for(?: the)?(?: academic year)?)\s*:?\s*(?:the\s+)?(?:[A-Z][a-z]+\s+)?(20[2-3]\d)(?:\s*[–\-/]\s*(20[2-3]\d|[2-3]\d))?\b/gi,
  /(?:courses|classes|programme|program|lectures) (?:start|begin)s?(?: on| in)?\s+(?:[A-Za-z]+\s+){0,2}(?:\d{1,2}(?:st|nd|rd|th)?,?\s+)?(20[2-3]\d)\b/gi,
  /start date\s*:?\s*(?:[A-Za-z]+\s+){0,2}(20[2-3]\d)\b/gi,
];
function feeYearNear(page, quote) {
  if (!page) return null;
  const t = textOf(page);
  const q = squash(String(quote || '').split(' … ')[0]);
  if (!q) return null;
  let at = t.indexOf(q);
  if (at < 0) at = t.toLowerCase().indexOf(q.slice(0, 40).toLowerCase());
  if (at < 0) return null;
  const win = t.slice(Math.max(0, at - 600), Math.min(t.length, at + q.length + 300));
  const years = new Set();
  for (const re of ANCHORED_YEAR_RES) for (const m of win.matchAll(re)) years.add(acadYear(m[1], m[2]));
  return years.size === 1 ? [...years][0] : null;
}
// Methods whose single row is an institution-wide fee schedule (not one programme's fee)
const isSchedule = (r) => /^(?:national fee order|own fee page|own fee schedule)/.test(r.method || '');
// Display label of the fee year(s): every year with its programme count, catalogue entries with their date, and undated rows
function feeYearLabel(...summaries) {
  const counts = {};
  for (const s of summaries.filter(Boolean)) for (const [k, n] of Object.entries(s.yearCounts || {})) counts[k] = (counts[k] || 0) + n;
  const keys = Object.keys(counts);
  if (!keys.length) return 'year not stated';
  if (keys.length === 1 && /^20/.test(keys[0])) return keys[0];
  const plural = (n) => `${n} programme${n > 1 ? 's' : ''}`;
  const parts = keys.filter((k) => /^20/.test(k)).sort().map((k) => `${k} for ${plural(counts[k])}`);
  const cf = keys.filter((k) => /^catalogue /.test(k)).sort();
  if (cf.length) {
    const n = cf.reduce((a, k) => a + counts[k], 0);
    const d = cf.map((k) => k.slice(10));
    parts.push(`Campus France catalogue entries dated ${d[0] === d[d.length - 1] ? d[0] : `${d[0]}–${d[d.length - 1]}`}, intake year not stated, for ${plural(n)}`);
  }
  if (counts['not stated']) parts.push(`year not stated on the page for ${plural(counts['not stated'])}`);
  return parts.join('; ');
}

// Per level: range (10th–90th percentile of programme fees when ≥10 programmes, else min–max) and median of the
// programme means. A programme with two tracks contributes the mean of its yearly track fees.
function summariseFees(rows, level) {
  const seen = new Set();
  const used = [];
  const excluded = [];
  for (const r of rows) {
    if (r.level !== level || !r.verified || !r.annualEUR) continue;
    const k = `${key(r.programme)}|${r.annualEUR}`;
    if (seen.has(k)) continue;
    seen.add(k);
    (r.special ? excluded : used).push(r);
  }
  if (!used.length) return null;
  const all = used.flatMap((r) => r.annualValues || [r.annualEUR]);
  const mids = used.map((r) => r.annualEUR);
  const yearCounts = {};
  for (const r of used) {
    const k = !r.feeYear ? 'not stated' : (/^as of/.test(r.feeYear) ? `catalogue ${r.feeYear.slice(6, 13)}` : r.feeYear);
    yearCounts[k] = (yearCounts[k] || 0) + 1;
  }
  return {
    programmes: used.length, scheduleOnly: used.every(isSchedule), scheduleRows: used.filter(isSchedule).length, programmeRows: used.filter((r) => !isSchedule(r)).length, yearCounts,
    min: Math.min(...all), max: Math.max(...all), median: median(mids),
    typicalLow: used.length >= 10 ? percentile(mids, 0.1) : Math.min(...all),
    typicalHigh: used.length >= 10 ? percentile(mids, 0.9) : Math.max(...all),
    approxRows: used.filter((r) => r.approx).length, excludedFromRange: excluded.map((r) => `${r.programme} (EUR ${money(r.annualEUR)})`),
    feeYears: [...new Set(used.map((r) => r.feeYear).filter((y) => y && !/^as of/.test(y)))].sort(),
    catalogueDates: [...new Set(used.map((r) => r.feeYear).filter((y) => /^as of/.test(y || '')).map((y) => y.slice(6, 13)))].sort(),
  };
}
// A level's USD field (the school-wide default for budget filters) is set only from an institution-wide fee schedule or
// from at least MIN_LEVEL_ROWS programme fees
const levelUsable = (s) => Boolean(s) && (s.scheduleRows > 0 || s.programmeRows >= MIN_LEVEL_ROWS);
const isNationalFee = (entry) => entry.fee === 'national' || entry.fee === 'national-master';
const levelUnusableReason = (s) => (!s ? 'no official fee read' : `only ${s.programmeRows} programme fee${s.programmeRows === 1 ? '' : 's'} read (needs ≥${MIN_LEVEL_ROWS} or an institution-wide fee schedule)`);

// ---------------------------------------------------------------- dedicated fee sources ----------
async function nationalFees() {
  const page = await getPage(CF_FEES_PAGE);
  const t = textOf(page);
  const from = t.indexOf('Students from outside the European Union');
  const sect = from >= 0 ? t.slice(from, from + 1500) : '';
  const m = sect.match(/For the (\d{4})[–-](\d{4}) academic year, tuition fees are: ?€([\d,]+) per year for a Bachelor['’]s degree program; ?€([\d,]+) per year for a Master['’]s degree program;/);
  if (!m) throw new Error(`national non-EU fee sentence not found on ${CF_FEES_PAGE}`);
  const updated = (t.match(/Updated on (\d{1,2} \w+ \d{4})/) || [])[1] || null;
  const decree = (t.match(/Decree No\. 2026-385 of May 19, 2026, amended the rules governing tuition fee waivers[^.]*\./) || [])[0] || null;
  return {
    year: `${m[1]}/${m[2].slice(-2)}`, bachelorEUR: Number(digits(m[3])), masterEUR: Number(digits(m[4])),
    url: CF_FEES_PAGE, pageUpdated: updated, quote: m[0], verified: inPage(page, m[0]),
    scopeQuote: (sect.match(/Students who are not nationals[^.]*\./) || [])[0] || null,
    waiverNote: decree, legalBasis: { text: 'Arrêté du 19 avril 2019 relatif aux droits d\'inscription dans les établissements publics d\'enseignement supérieur', url: FEE_ORDER_URL, note: 'cited on the Campus France page; Légifrance blocks automated requests, so not fetched' },
  };
}

async function sciencesPoFees() {
  const page = await getPage(SCIENCESPO_FEES);
  const t = textOf(page);
  const title = squash(cheerio.load(page.body)('title').first().text());
  const pick = (heading) => {
    const i = t.indexOf(heading);
    if (i < 0) return null;
    const m = t.slice(i, i + 1200).match(/Fiscal residence outside the European Economic Area Tuition fees are €([\d,]+) per academic year\./);
    return m ? { value: Number(digits(m[1])), quote: m[0] } : null;
  };
  const ug = pick('Undergraduate students First enrolment');
  const pg = pick('Graduate students First enrolment');
  const year = (title.match(/(\d{4})-(\d{4})/) || []);
  const feeYear = year[1] ? `${year[1]}/${year[2].slice(-2)}` : null;
  const rows = [];
  if (ug) rows.push({ level: 'bachelor', programme: 'Undergraduate (Bachelor) — first enrolment, fiscal residence outside the EEA', annualEUR: ug.value, basis: 'per academic year (as printed)', approx: false, url: SCIENCESPO_FEES, quote: ug.quote, verified: inPage(page, ug.quote), method: 'own fee page', feeYear });
  if (pg) rows.push({ level: 'master', programme: 'Graduate (Master) — first enrolment, fiscal residence outside the EEA', annualEUR: pg.value, basis: 'per academic year (as printed)', approx: false, url: SCIENCESPO_FEES, quote: pg.quote, verified: inPage(page, pg.quote), method: 'own fee page', feeYear });
  return { rows, pages: [page], note: `${title}; EEA students pay an income-based fee up to the same amount` };
}

async function ipParisFees() {
  const faq = await getPage(IPPARIS_FAQ);
  const $ = cheerio.load(faq.body);
  const href = $('a').filter((_, a) => /registration fees/i.test($(a).text())).first().attr('href');
  if (!href) throw new Error('link to the Master\'s registration fee PDF not found on the IP Paris FAQ page');
  const pdfUrl = new URL(href, faq.finalUrl).toString();
  const pdf = await pdfPage(pdfUrl);
  const lines = pdf.pdfText.split(/\r?\n/);
  const title = squash(lines.find((l) => /Tuition Fees \d{4}-\d{4}/.test(l)) || '');
  // Table columns: national-track tuition, gap year, international-track tuition, gap year, Master Nuclear Energy
  const line = lines.find((l) => /^\s*Non-EU\/EEA\//.test(l) && /\d/.test(l));
  const nums = line ? [...line.matchAll(/(\d{1,3}(?: \d{3})?)\s?€/g)].map((m) => Number(digits(m[1]))) : [];
  if (!line || nums.length < 4 || !(nums[0] > 1000)) throw new Error('row "Non-EU/EEA/Switzerland*" not found in the IP Paris fee PDF');
  const row = { nums };
  const year = (title.match(/(\d{4})-(\d{4})/) || []);
  const feeYear = year[1] ? `${year[1]}/${year[2].slice(-2)}` : null;
  const quote = squash(line); // "Non-EU/EEA/ 4 327 € 2 884 € 7 166 € 4 303 € 6 255 €"
  const verified = inPage(pdf, quote) && inPage(pdf, 'Each amount applies to an entire academic year');
  return {
    pages: [faq, pdf], pdfUrl, note: `${title}: row "Non-EU/EEA/Switzerland" — national-track Master's ${money(row.nums[0])}, international-track Master's ${money(row.nums[2])} (gap-year amounts excluded)`,
    rows: [
      { level: 'master', programme: 'Master — national-track programmes (non-EU/EEA/Switzerland)', annualEUR: row.nums[0], basis: 'per academic year ("Each amount applies to an entire academic year")', approx: false, url: pdfUrl, quote, verified, method: 'own fee schedule (PDF)', feeYear },
      { level: 'master', programme: 'Master — international-track programmes (non-EU/EEA/Switzerland)', annualEUR: row.nums[2], basis: 'per academic year ("Each amount applies to an entire academic year")', approx: false, url: pdfUrl, quote, verified, method: 'own fee schedule (PDF)', feeYear },
    ],
  };
}

// CentraleSupélec engineering cycle (Diplôme d'ingénieur, a Master's-level degree): one yearly non-EU fee for the 1st, 2nd
// and 3rd years of students entering from September <year>
async function centraleSupelecFees() {
  const page = await getPage(CS_ENGINEERING_FEES);
  const t = textOf(page);
  const m = t.match(/Engineering Cycle\s*[—–-]\s*students entering from September (20\d\d) EU Non EU 1st year (?:From )?€\s?[\d ]+ to €\s?[\d ]+ [—–-] Tuition fees modulated according to reference taxable income (\d{4,5})\s?€ 2nd and 3rd years (?:From )?€\s?[\d ]+ to €\s?[\d ]+ [—–-] Tuition fees modulated according to reference taxable income (\d{4,5})\s?€/i);
  if (!m) throw new Error(`engineering-cycle non-EU fee row not found on ${CS_ENGINEERING_FEES}`);
  if (m[2] !== m[3]) throw new Error(`engineering-cycle non-EU fee differs by year (${m[2]} / ${m[3]}) on ${CS_ENGINEERING_FEES}`);
  const quote = m[0];
  return {
    page,
    rows: [{ level: 'master', programme: `Engineering cycle (Diplôme d'ingénieur, Master's-level) — non-EU, students entering from September ${m[1]}`, annualEUR: Number(m[2]), annualValues: [Number(m[2])], basis: 'per year (1st, 2nd and 3rd years, as printed)', approx: false, url: CS_ENGINEERING_FEES, quote, verified: inPage(page, quote), method: 'own fee schedule (engineering cycle)', feeYear: acadYear(m[1]) }],
    note: `CentraleSupélec engineering cycle, students entering from September ${m[1]}: non-EU ${money(Number(m[2]))} € per year (1st, 2nd and 3rd years)`,
  };
}

// A public institution's own fee page (UNIVERSITY_FEE_PAGES): blanket exemption → the national fee is not applied;
// `confirm` sentence found → supporting evidence. Direct request only (no scrape.do).
async function ownFeePageCheck(key) {
  const cfg = UNIVERSITY_FEE_PAGES[key];
  if (!cfg) return null;
  let page;
  try { page = await getPage(cfg.url); } catch (err) { return { url: cfg.url, error: err.message, incomplete: Boolean(err.incomplete) }; }
  const t = textOf(page);
  const ex = t.match(BLANKET_EXEMPTION_RE);
  if (ex) return { url: cfg.url, exemption: { quote: squash(ex[0]), verified: inPage(page, ex[0]) } };
  const c = cfg.confirm ? t.match(cfg.confirm) : null;
  return { url: cfg.url, confirms: c ? { quote: squash(c[0]), verified: inPage(page, c[0]) } : null, ...(cfg.confirm && !c ? { note: 'confirming sentence not found (page changed?)' } : {}) };
}

// Degree levels shown on an institution's own home page (navigation / programme menu): "Bachelor Programs", "Bachelor in
// Management", "PhD Program", "Doctoral Programmes", "For a PhD". Used only as evidence for levels; direct request only.
const SITE_LEVEL_RES = {
  "Bachelor's": /\bBachelor(?:['’]s)? (?:Programs?|Programmes?|Degrees? Programs?)\b|\bBachelor (?:in|of) [A-Z][a-z]+|\b(?:Global |International )?BBA\b/,
  "Master's": /\bMaster(?:['’]s)? (?:Programs?|Programmes?)\b|\bMasters? of Science\b|\bMaster in Management\b|\bMSc (?:in )?[A-Z][a-z]+/,
  PhD: /\b(?:Ph\.?\s?D\.?|PHD|Doctoral)\s+(?:[Pp]rograms?|[Pp]rogrammes?|[Tt]racks?|[Ss]chools?)\b|\bFor a PhD\b|\b[Pp]rogrammes? doctora(?:l|ux)\b|\b[ÉE]coles? [Dd]octorales?\b|\bDoctorat\b/,
};
async function siteLevels(url) {
  const page = await getPage(url);
  const t = textOf(page);
  const out = {};
  for (const [level, re] of Object.entries(SITE_LEVEL_RES)) {
    const m = t.match(re);
    if (!m) continue;
    const quote = squash(t.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40));
    if (inPage(page, quote)) out[level] = { url: page.finalUrl || url, quote };
  }
  return out;
}

// Programme fees of a grande école / private school: its own programme page (linked from the Campus France catalogue);
// falls back to the catalogue's fee text when the own page has no readable fee and the catalogue entry is recent.
async function ownProgrammeFees(entry, programmes, instName, allowedDomains) {
  const rows = [];
  const pages = [];
  const freshSince = new Date(Date.now() - 18 * 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  for (const p of programmes) {
    const level = CF_MASTER.has(p.levelObtainedId) ? 'master' : (CF_BACHELOR.has(p.levelObtainedId) ? 'bachelor' : null);
    if (!level) continue;
    const programme = cleanCfLabel(p.diplomaEn || p.programLabel);
    // MBAs, executive and post-Master's (Mastère spécialisé) programmes: listed, kept out of the range and median
    const special = p.levelObtainedId === 23 || p.levelObtainedId === 22 || SPECIAL_RE.test(programme);
    const own = cleanUrl(p.webdiploma);
    const row = { level, programme, cfProgramId: p.programId, cfLevel: CF_LEVEL[p.levelObtainedId], special, annualEUR: null, verified: false, approx: false, url: null, quote: null, method: null, attempts: [] };
    let got = null;
    // reasons this row may be missing only because of this run (cap reached, LLM / network unavailable)
    const incomplete = [];
    if (own && allowedDomains.includes(regDomain(own))) {
      try {
        const page = await getPage(own, { scrapeDo: true });
        pages.push(page);
        const text = textOf(page);
        got = parseFeeDeterministic(text, p.lengthProgram);
        if (got?.annualValues) { got.method = 'own programme page'; got.page = page; }
        else if (text.length > 500) {
          const llm = await parseFeeLlm({ institution: instName, programme, url: own, text, lengthText: p.lengthProgram, source: 'programme web page' });
          if (llm?.annualValues) { got = { ...llm, method: 'own programme page (LLM fallback)', page }; } else {
            if (llm?.unavailable) incomplete.push(`LLM fallback not run for ${own}: ${llm.unavailable}`);
            row.attempts.push({ url: own, result: llm?.unavailable ? `LLM fallback not run (${llm.unavailable}); deterministic parser: ${got?.candidates || 0} candidates${got?.reason ? `, ${got.reason}` : ''}` : (llm?.rejected || (llm ? 'no fee found (LLM)' : `no unambiguous fee (${got?.candidates || 0} candidates${got?.reason ? `, ${got.reason}` : ''})`)) });
            got = null;
          }
        } else { row.attempts.push({ url: own, result: 'page has no server-rendered text' }); got = null; }
      } catch (err) {
        if (err.incomplete) incomplete.push(err.message);
        row.attempts.push({ url: own, result: err.message, ...(err.incomplete ? { incomplete: true } : {}) });
        got = null;
      }
    } else if (own) row.attempts.push({ url: own, result: `not on the institution's own domain (${allowedDomains.join(', ')})` });
    if (!got?.annualValues && p.fee && String(p.updatedAt || '') >= freshSince) {
      // Campus France entry (declared by the institution); the parser sees "Tuition fees: <text>", the quote is
      // checked against the catalogue's own fee text
      const cfUrl = `${CF_API}sgetprogram/${p.programId}`;
      const cfText = squash(p.fee);
      // the catalogue field is the programme's tuition-fee field, so every amount in it is tuition-labelled
      let cf = parseFeeDeterministic(cfText, p.lengthProgram, { allTuition: true });
      if (cf?.annualValues) cf.method = 'Campus France catalogue fee (institution-declared)';
      else {
        cf = await parseFeeLlm({ institution: instName, programme, url: cfUrl, text: cfText, lengthText: p.lengthProgram, source: 'catalogue entry (Campus France "tuition fees" field)' });
        if (cf?.annualValues) cf.method = 'Campus France catalogue fee (institution-declared, LLM fallback)';
        else if (cf?.unavailable) incomplete.push(`LLM fallback not run for ${cfUrl}: ${cf.unavailable}`);
      }
      if (cf?.annualValues) {
        got = { ...cf, page: { url: cfUrl, body: cfText, _text: cfText, _norm: norm(cfText) }, feeYear: feeYearIn(cfText) || `as of ${p.updatedAt}` };
      } else row.attempts.push({ url: cfUrl, result: cf?.unavailable ? `LLM fallback not run (${cf.unavailable})` : `catalogue fee text not readable: "${cfText.slice(0, 80)}"` });
    } else if (!got?.annualValues && p.fee) row.attempts.push({ url: `${CF_API}sgetprogram/${p.programId}`, result: `catalogue fee text too old (updated ${p.updatedAt})` });
    if (got?.annualValues) {
      const feeYear = got.feeYear || feeYearIn(got.intake) || feeYearIn(got.quote) || feeYearNear(got.page, got.quote) || null;
      Object.assign(row, {
        annualEUR: Math.round(got.annualValues.reduce((x, y) => x + y, 0) / got.annualValues.length), annualValues: got.annualValues, trackYears: got.trackYears || null,
        amountPrinted: got.amount, basis: /^Campus France/.test(got.method) ? `${got.basis}; catalogue fee text may include compulsory school fees` : got.basis, approx: got.approx, url: got.page.url, quote: got.quote, method: got.method,
        region: got.region === 'noneu' ? 'non-EU fee' : 'same fee for all students', llm: got.llm || null,
        feeYear, feeYearFrom: feeYear ? (got.feeYear ? (/^as of/.test(got.feeYear) ? 'catalogue entry date (no intake year printed)' : 'catalogue fee text') : 'printed next to the fee / intake text on the page') : 'not printed on the page',
        verified: quoteIn(got.page, got.quote),
      });
    } else if (incomplete.length) row.incomplete = incomplete;
    rows.push(row);
  }
  // The institution's own pages say its two-year MSc route starts with a (non-degree) pre-Master year: a catalogue
  // "2-year course" total then includes that year, so a catalogue row keeps only its one-year track
  const preMasterPage = pages.find((pg) => PRE_MASTER_TRACK_RE.test(textOf(pg)));
  const preMaster = preMasterPage ? { url: preMasterPage.url, quote: squash(textOf(preMasterPage).match(PRE_MASTER_TRACK_RE)[0]) } : null;
  if (preMaster) {
    for (const row of rows) {
      if (!/^Campus France/.test(row.method || '') || !(row.annualValues?.length > 1) || !row.trackYears) continue;
      const keep = row.annualValues.filter((_, i) => row.trackYears[i] != null && row.trackYears[i] <= 1.5);
      if (!keep.length || keep.length === row.annualValues.length) continue;
      row.annualValuesBeforePreMasterRule = row.annualValues;
      row.annualValues = keep;
      row.annualEUR = Math.round(keep.reduce((x, y) => x + y, 0) / keep.length);
      row.basis = `${row.basis}; one-year track only — the two-year track starts with a pre-Master year (own page: "${preMaster.quote}")`;
    }
  }
  return { rows, pages, preMaster };
}

// ---------------------------------------------------------------- plan (for --apply --expect) ----------
// Stamps that differ between two runs of the same plan; everything else that would be written is part of the plan
const VOLATILE_KEYS = new Set(['syncedAt', 'runId', 'createdByRunId', 'createdAt', 'updatedAt', '_id']);
const canon = (v) => {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object' && typeof v.toHexString === 'function') return v.toHexString();
  if (Array.isArray(v)) return v.map(canon);
  if (typeof v === 'object') return Object.fromEntries(Object.keys(v).filter((k) => !VOLATILE_KEYS.has(k)).sort().map((k) => [k, canon(v[k])]));
  return v;
};
const sha256 = (x, n = 64) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, n);
function buildPlan(changes, creates) {
  const entries = [
    ...changes.map((c) => ({ key: `${c.action}:${c.id}`, name: c.name, fields: Object.fromEntries(Object.keys(c.diff).sort().map((k) => [k, sha256(canon(c.diff[k].to), 16)])) })),
    ...creates.map((c) => ({ key: `create:${c.doc.dataSource?.uai || norm(c.doc.name)}`, name: c.doc.name, fields: Object.fromEntries(Object.keys(c.doc).filter((k) => !VOLATILE_KEYS.has(k)).sort().map((k) => [k, sha256(canon(c.doc[k]), 16)])) })),
  ].sort((a, b) => a.key.localeCompare(b.key));
  return { hash: sha256(entries), entries, note: 'one entry per record this run would write: field -> hash of the value written (syncedAt/runId/createdByRunId/createdAt/updatedAt/_id excluded). --apply --expect <this report> writes only when its own plan is identical.' };
}
function comparePlans(expectedPlan, actualPlan) {
  const exp = new Map(expectedPlan.entries.map((x) => [x.key, x]));
  const act = new Map(actualPlan.entries.map((x) => [x.key, x]));
  const out = [];
  for (const [k, a] of act) {
    const e = exp.get(k);
    if (!e) { out.push(`not in the reviewed plan: ${k} (${a.name})`); continue; }
    const fields = [...new Set([...Object.keys(a.fields), ...Object.keys(e.fields)])].filter((f) => a.fields[f] !== e.fields[f]);
    if (fields.length) out.push(`${k} (${a.name}): ${fields.join(', ')} differ from the reviewed plan`);
  }
  for (const [k, e] of exp) if (!act.has(k)) out.push(`in the reviewed plan but not in this run: ${k} (${e.name})`);
  return out;
}

// ---------------------------------------------------------------- revert ----------
async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  // An apply run saves applyStartedAt BEFORE its first write, so a run that stopped half-way is revertible too
  if (report.summary?.mode !== 'apply' || !(report.appliedAt || report.applyStartedAt)) throw new Error(`${reportFile} is from a dry run or a refused apply (nothing was written); refusing to revert`);
  if (!/^france-sync-\d{14}$/.test(String(report.runId || ''))) throw new Error(`${reportFile} has no franceSync runId; refusing to revert`);
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  let restored = 0;
  // Only records still stamped with this run's id are restored (a later run's values are never overwritten)
  for (const c of report.changes || []) {
    const set = {};
    const unset = {};
    for (const [k, v] of Object.entries(c.diff)) {
      if (v.from === undefined) unset[k] = ''; else set[k] = v.from;
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    if (!Object.keys(update).length) continue;
    const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id), 'dataSource.runId': report.runId }, update);
    restored += r.modifiedCount;
  }
  // Records CREATED by this run are hidden (isActive:false), never deleted. Found by createdBySync + the creating run's id
  // (not by the report's insert flags), so a create whose flag never reached the report is hidden as well, and a record
  // that a later run of this script updated (runId changed, createdByRunId kept) is still found.
  const r = await col.updateMany({
    'dataSource.createdBySync': SYNC_ID,
    $or: [{ 'dataSource.createdByRunId': report.runId }, { 'dataSource.runId': report.runId, 'dataSource.createdByRunId': { $exists: false } }],
    isActive: { $ne: false },
  }, { $set: { isActive: false } });
  console.log(`REVERTED: ${restored} records restored, ${r.modifiedCount} created records hidden (isActive:false) from ${reportFile}`);
  await mongoose.disconnect();
}

// ---------------------------------------------------------------- main ----------
(async () => {
  const revertIdx = ARGS.indexOf('--revert');
  if (revertIdx !== -1) return revert(ARGS[revertIdx + 1]);
  console.log(`MESR open data + Campus France + institution fee pages → French institutions (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);
  const uncertainties = [];
  const errors = [];
  const sources = new Map(); // url → what
  const addSource = (url, what) => { if (url && !sources.has(url)) sources.set(url, what); };

  // --apply --expect <reviewed dry-run report>: this run's plan must reproduce that report exactly; its EUR→USD rate is reused
  let expected = null;
  if (ARGS.includes('--expect') && !APPLY) throw new Error('--expect is only used together with --apply');
  if (APPLY && ARGS.includes('--expect')) {
    if (!EXPECT || !fs.existsSync(path.resolve(EXPECT))) throw new Error(`--expect: report "${EXPECT || ''}" not found`);
    expected = JSON.parse(fs.readFileSync(path.resolve(EXPECT), 'utf8'));
    if (expected.script !== 'scripts/dataSync/franceSync.js' || expected.summary?.mode !== 'dry-run') throw new Error(`--expect ${EXPECT}: not a franceSync dry-run report`);
    if (!/^[0-9a-f]{64}$/.test(String(expected.plan?.hash || '')) || !Array.isArray(expected.plan?.entries)) throw new Error(`--expect ${EXPECT}: report has no plan (made by an older version of this script); run a new dry run and review it`);
    if (expected.summary.fx && !(Number(expected.summary.fx.rate) > 0 && expected.summary.fx.date)) throw new Error(`--expect ${EXPECT}: report has an unusable FX rate`);
  } else if (APPLY) {
    console.warn('  WARNING: --apply without --expect <reviewed dry-run report>: the plan is recomputed now and is NOT checked against a reviewed dry run');
  }

  let fx = null;
  if (expected) {
    fx = expected.summary.fx || null; // same object as in the reviewed report (rate + ECB date)
    if (!fx) uncertainties.push(`FX rate unavailable in the reviewed report ${EXPECT}; USD fields not proposed`);
  } else {
    try { fx = await eurToUsd(); } catch (err) { uncertainties.push(`FX rate unavailable (${err.message}); USD fields not proposed`); }
  }
  console.log(`  EUR→USD ${fx ? `${fx.rate} (${fx.date})${expected ? ` (pinned to ${path.basename(EXPECT)})` : ''}` : 'n/a'}`);
  if (fx) addSource(FX_URL, 'ECB EUR→USD reference rate');

  // 1) MESR register + SISE (public establishments under the Ministry) + MonMaster + TMM mention spellings
  const reg = await getJson(odsUrl(DS.register, 'exports/json', {}));
  addSource(dsPage(DS.register), 'MESR register of higher-education institutions');
  const register = reg.data;
  const regByUai = new Map();
  for (const r of register) for (const u of String(r.uai || '').split(';').map((x) => x.trim()).filter(Boolean)) regByUai.set(u, r);

  const siseYear = await odsLatest(DS.sise, 'rentree');
  const sise = await getJson(odsUrl(DS.sise, 'exports/json', { where: `rentree="${siseYear}"`, select: 'annee_universitaire,etablissement_lib,etablissement_id_uai,etablissement_type,etablissement_id_paysage,cursus_lmdl,cursus_lmdm,cursus_lmdd,etablissement_commune,etablissement_uucr' }));
  addSource(dsPage(DS.sise), `MESR enrolment statistics by public institution (${siseYear})`);
  const siseByUai = new Map();
  for (const r of sise.data) for (const u of [].concat(r.etablissement_id_uai || [])) siseByUai.set(u, r);

  const mmSession = await odsLatest(DS.monMaster, 'session');
  const mm = await getJson(odsUrl(DS.monMaster, 'exports/json', { where: `session="${mmSession}"`, select: 'eta_uai,eta_nom,mention,parcours' }));
  addSource(dsPage(DS.monMaster), `MonMaster ${mmSession} national Master's offer`);
  const mmByUai = new Map();
  for (const r of mm.data) { if (!mmByUai.has(r.eta_uai)) mmByUai.set(r.eta_uai, []); mmByUai.get(r.eta_uai).push(r); }
  const tmm = await getJson(odsUrl(DS.tmmMentions, 'exports/json', { select: 'for_intitule', group_by: 'for_intitule' }));
  addSource(dsPage(DS.tmmMentions), 'official Master\'s mention names (spelling)');
  const casing = new Map(tmm.data.map((r) => [key(r.for_intitule), squash(r.for_intitule)]));

  // 2) Campus France catalogue
  const cfList = await getJson(`${CF_API}sgetprograms/1`, { headers: { Referer: CF_CATALOGUE } });
  addSource(CF_CATALOGUE, 'Campus France "Programs Taught in English" catalogue (tie-api.campusfrance.org)');
  const cfPrograms = cfList.data.programs || [];
  const cfByEtab = new Map();
  for (const p of cfPrograms) { if (!cfByEtab.has(p.etabId)) cfByEtab.set(p.etabId, []); cfByEtab.get(p.etabId).push(p); }
  const cfDegree = (ids) => ids.flatMap((id) => cfByEtab.get(id) || []).filter((p) => CF_MASTER.has(p.levelObtainedId) || CF_BACHELOR.has(p.levelObtainedId));
  const cfDetail = async (id) => (await getJson(`${CF_API}sgetprogram/${id}`, { headers: { Referer: CF_CATALOGUE } })).data;
  console.log(`  register ${register.length} institutions · SISE ${siseYear}: ${sise.data.length} public institutions · MonMaster ${mmSession}: ${mm.data.length} programmes · Campus France: ${cfPrograms.length} programmes`);
  // Inputs that make this run's proposals partial; any of them → --apply refused (see applyReadiness in the report)
  const inputProblems = [];
  const datasetCounts = {};
  const checkFloor = (name, n) => {
    datasetCounts[name] = { rows: n, floor: DATASET_FLOORS[name] };
    if (!(n >= DATASET_FLOORS[name])) inputProblems.push(`dataset "${name}" returned ${n} rows (sanity floor ${DATASET_FLOORS[name]}); course lists / levels / fees would rest on partial data`);
  };
  checkFloor('register', register.length);
  checkFloor('sise', sise.data.length);
  checkFloor('monMaster', mm.data.length);
  checkFloor('tmmMentions', tmm.data.length);
  checkFloor('campusFrance', cfPrograms.length);

  // 3) National fee order (non-EU differentiated fees)
  let national = null;
  try { national = await nationalFees(); addSource(CF_FEES_PAGE, `Campus France — national tuition fees ${national.year}`); } catch (err) { errors.push({ key: 'national-fees', problems: [err.message] }); uncertainties.push(`national fee amounts not verifiable this run: ${err.message}`); }
  if (national) console.log(`  national non-EU fees ${national.year}: Bachelor's EUR ${money(national.bachelorEUR)}, Master's EUR ${money(national.masterEUR)} (verified: ${national.verified})`);

  // 4) DB
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const france = await db.collection('countries').findOne({ name: 'France' });
  if (!france) throw new Error('Country "France" not found');
  const ours = await db.collection('universities').find({ country: france._id }).toArray();
  console.log(`  our France records: ${ours.length}`);

  // 5) Entries to process: our records + create candidates
  // Records this script wrote before carry dataSource.uai: they are matched by it first (so renamed records and records
  // created by an earlier run are found again), then by their current or official name
  const oursByUai = new Map();
  for (const u of ours) {
    const uai = u.dataSource && /^france-sync-/.test(String(u.dataSource.runId || u.dataSource.createdByRunId || '')) ? u.dataSource.uai : null;
    if (!uai) continue;
    const prev = oursByUai.get(uai);
    if (!prev || (prev.isActive === false && u.isActive !== false)) oursByUai.set(uai, u);
  }
  const ourUais = new Set(REGISTRY.map((e) => e.uai));
  const createCandidates = [];
  const candidatesNotInDb = [];
  for (const r of register) {
    if (!r.typologie_d_universites_et_assimiles) continue;
    const uais = String(r.uai || '').split(';').map((x) => x.trim());
    if (uais.some((u) => ourUais.has(u))) continue;
    const uai = uais[0];
    const cfIds = CF_OTHER_UNIVERSITIES[uai] || [];
    const cfCount = cfDegree(cfIds).length;
    const underMinistry = uais.some((u) => siseByUai.has(u));
    if (oursByUai.has(uai)) {
      // created (or written) by an earlier run of this script: kept in sync through the UPDATE path (found by dataSource.uai,
      // never created twice); a later change of the register's official name is followed (rename = register name)
      createCandidates.push({ key: `new-${uai}`, db: [], uai, cf: cfIds, kind: 'university', fee: 'national', idSource: 'register', rename: r.uo_lib, syncedEarlier: true });
      continue;
    }
    const row = { name: r.uo_lib, uai, city: cityName(r.com_nom), website: r.url_en || r.url, type: r.secteur_d_etablissement, englishTaughtDegreeProgrammes: cfCount, nationalMasters: (mmByUai.get(uai) || []).length, url: dsPage(DS.register) };
    if (cfCount >= CREATE_MIN_CF && underMinistry && r.secteur_d_etablissement === 'public') {
      createCandidates.push({ key: `new-${uai}`, db: [], uai, cf: cfIds, kind: 'university', fee: 'national', idSource: 'register', create: true });
      row.decision = 'create';
    } else row.decision = `not created (${cfCount} English-taught degree programmes on Campus France; threshold ${CREATE_MIN_CF})`;
    candidatesNotInDb.push(row);
  }
  const ENTRIES = [...REGISTRY, ...createCandidates];

  // Parcoursup (latest session) for all UAIs we process
  const psYear = await odsLatest(DS.parcoursup, 'annee');
  const allUais = [...new Set(ENTRIES.flatMap((e) => String(e.uai).split(';')))];
  const ps = await getJson(odsUrl(DS.parcoursup, 'exports/json', { where: `annee="${psYear}" and ${odsIn('etab_uai', allUais)}`, select: 'etab_uai,etab_nom,tc,tf,nm,fl,etab_url' }));
  addSource(dsPage(DS.parcoursup), `Parcoursup ${psYear} programme map`);
  checkFloor('parcoursup', ps.data.length);
  const psByUai = new Map();
  for (const r of ps.data) { if (!psByUai.has(r.etab_uai)) psByUai.set(r.etab_uai, []); psByUai.get(r.etab_uai).push(r); }

  // Atlas (private institutions not in the main register)
  const atlasUais = ENTRIES.filter((e) => e.idSource === 'atlas').map((e) => e.uai);
  let atlasByUai = new Map();
  if (atlasUais.length) {
    const atlasYear = await odsLatest(DS.atlas, 'rentree');
    const at = await getJson(odsUrl(DS.atlas, 'records', { where: `rentree="${atlasYear}" and ${odsIn('id_etablissement', atlasUais)}`, select: 'rentree,categorie_etablissement,secteur_etablissement,id_etablissement,libelle_etablissement_1,libelle_etablissement_2,com_nom,uucr_nom,count(*) as n', group_by: 'rentree,categorie_etablissement,secteur_etablissement,id_etablissement,libelle_etablissement_1,libelle_etablissement_2,com_nom,uucr_nom', limit: '50' }));
    addSource(dsPage(DS.atlas), `MESR enrolment atlas — detail by institution (${atlasYear})`);
    atlasByUai = new Map();
    for (const r of at.data.results || []) { if (!atlasByUai.has(r.id_etablissement)) atlasByUai.set(r.id_etablissement, []); atlasByUai.get(r.id_etablissement).push(r); }
  }

  const byName = new Map(ours.map((u) => [u.name, u]));
  const matchedIds = new Set();
  const syncedAt = new Date();
  const changes = [];
  const creates = [];
  const institutions = [];
  const fees = {};
  const nulls = [];
  const blockedFees = [];
  const levelNotes = new Map(); // doc id → degree levels kept without official evidence this run
  const renamedForQs = [];
  const nationalFeeNotCheckedOnOwnPage = []; // public institutions given the national fee without a check of their own fee page

  for (const entry of ENTRIES) {
    // by dataSource.uai (written by an earlier run), then by the curated current name, then by the official (renamed) name
    const docs = [...new Set([oursByUai.get(entry.uai), ...entry.db.map((n) => byName.get(n)), entry.rename && byName.get(entry.rename)].filter(Boolean))];
    const dupDocs = (entry.dups || []).map((n) => byName.get(n)).filter((d) => d && !docs.includes(d));
    [...docs, ...dupDocs].forEach((d) => matchedIds.add(String(d._id)));
    const doc = docs[0] || null;
    const row = { key: entry.key, dbName: doc?.name || null, action: null, problems: [], ...(doc && oursByUai.get(entry.uai) === doc ? { matchedBy: 'dataSource.uai' } : {}) };
    institutions.push(row);
    if (docs.length > 1) uncertainties.push(`${entry.key}: several records match (${docs.map((d) => `"${d.name}"`).join(', ')}); only "${doc.name}" is synced, the others are left unchanged — check for a duplicate`);
    if (!entry.create && !doc) { row.action = 'not in DB'; row.problems.push(`DB record "${entry.db[0]}" not found`); errors.push({ key: entry.key, problems: row.problems }); continue; }

    // --- identity from the official register
    const r = regByUai.get(entry.uai);
    const s = siseByUai.get(entry.uai);
    const at = atlasByUai.get(entry.uai) || [];
    const ident = { evidence: [] };
    if (entry.idSource === 'register') {
      if (!r) { row.action = 'no change (not found in register)'; row.problems.push(`UAI ${entry.uai} not in the MESR register`); errors.push({ key: entry.key, problems: row.problems }); continue; }
      Object.assign(ident, {
        officialName: r.uo_lib, shortName: r.nom_court, names: [r.uo_lib, r.uo_lib_officiel, r.nom_court, r.sigle, r.uo_lib_en].filter(Boolean),
        sector: r.secteur_d_etablissement, types: [].concat(r.type_d_etablissement || []), typology: r.typologie_d_universites_et_assimiles,
        commune: cityName(r.com_nom), urbanUnit: cityName(r.uucr_nom), websites: [r.url, r.url_en].filter(Boolean), website: r.url_en || r.url,
        created: r.date_creation, decree: r.texte_de_ref_creation_lib, formerUai: r.anciens_codes_uai, legalStatus: r.statut_juridique_long,
      });
      ident.evidence.push({ what: 'MESR register entry', url: dsPage(DS.register), quote: `uai: ${r.uai}; uo_lib: ${r.uo_lib}; secteur_d_etablissement: ${r.secteur_d_etablissement}; type: ${ident.types.join('/')}; com_nom: ${r.com_nom}; url: ${r.url || '-'}; url_en: ${r.url_en || '-'}${r.texte_de_ref_creation_lib ? `; texte_de_ref_creation_lib: ${r.texte_de_ref_creation_lib}` : ''}`, verified: reg.page.body.includes(r.uai) });
    } else if (entry.idSource === 'sise') {
      if (!s) { row.action = 'no change (not found in SISE)'; row.problems.push(`UAI ${entry.uai} not in MESR SISE ${siseYear}`); errors.push({ key: entry.key, problems: row.problems }); continue; }
      Object.assign(ident, { officialName: s.etablissement_lib, names: [s.etablissement_lib], sector: 'public', types: [s.etablissement_type], commune: cityName(s.etablissement_commune), urbanUnit: cityName(s.etablissement_uucr), websites: [], website: null });
      ident.evidence.push({ what: `MESR SISE ${siseYear} (public institution under the Ministry)`, url: dsPage(DS.sise), quote: `etablissement_lib: ${s.etablissement_lib}; etablissement_id_uai: ${entry.uai}; etablissement_type: ${s.etablissement_type}; etablissement_commune: ${s.etablissement_commune}`, verified: sise.page.body.includes(entry.uai) });
    } else if (entry.idSource === 'atlas') {
      if (!at.length) { row.action = 'no change (not found in atlas)'; row.problems.push(`UAI ${entry.uai} not in MESR atlas`); errors.push({ key: entry.key, problems: row.problems }); continue; }
      const main = at.sort((a, b) => b.n - a.n)[0];
      Object.assign(ident, { officialName: squash(main.libelle_etablissement_2 !== 'nan' ? main.libelle_etablissement_2 : main.libelle_etablissement_1), names: [main.libelle_etablissement_1, main.libelle_etablissement_2], sector: /priv/i.test(main.secteur_etablissement) ? 'privé' : 'public', types: [main.categorie_etablissement], commune: cityName(main.com_nom), urbanUnit: cityName(main.uucr_nom), websites: [], website: null });
      ident.evidence.push({ what: `MESR enrolment atlas ${main.rentree}`, url: dsPage(DS.atlas), quote: `id_etablissement: ${entry.uai}; libelle: ${main.libelle_etablissement_1} / ${main.libelle_etablissement_2}; secteur_etablissement: ${main.secteur_etablissement}; categorie: ${main.categorie_etablissement}; com_nom: ${main.com_nom}`, verified: true });
    }
    const type = /priv/i.test(ident.sector) ? 'PRIVATE' : 'PUBLIC';
    const underMinistry = Boolean(s);

    // --- Campus France programmes (names + levels; details for fee pages / website)
    const cfProgs = cfDegree(entry.cf);
    const needDetails = entry.fee === 'own' || entry.fee === 'ipparis' || (!ident.websites.length && cfProgs.length);
    const details = [];
    if (needDetails) {
      const queue = entry.fee === 'own' || entry.fee === 'ipparis' ? [...cfProgs] : cfProgs.slice(0, 1);
      const worker = async () => {
        while (queue.length) {
          const p = queue.shift();
          try { details.push(await cfDetail(p.programId)); } catch (err) {
            counters.cfDetailFailures += 1;
            row.problems.push(`Campus France programme ${p.programId}: ${err.message}`);
            inputProblems.push(`${entry.key}: Campus France programme ${p.programId} could not be read (${err.message}); its fee would be missing from the median`);
          }
          await sleep(120);
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      details.sort((a, b) => a.programId - b.programId);
    }
    if (!ident.websites.length) {
      const w = details.map((d) => d.website).find(Boolean) || [].concat(psByUai.get(entry.uai) || []).map((x) => x.etab_url).find(Boolean);
      if (w) {
        ident.website = cleanUrl(w).replace(/\/$/, '');
        ident.websites = [ident.website];
        ident.evidence.push({ what: details.some((d) => d.website) ? 'institution website listed in the Campus France catalogue' : 'institution website listed in Parcoursup', url: details.some((d) => d.website) ? `${CF_API}sgetprogram/${details[0].programId}` : dsPage(DS.parcoursup), quote: `website: ${w}`, verified: true });
      }
    }

    // --- courses + degree levels
    const cfMasters = dedupe(cfProgs.filter((p) => CF_MASTER.has(p.levelObtainedId)).map((p) => courseFromCf(p.programLabel)).sort((a, b) => a.localeCompare(b, 'fr')));
    const cfBachelors = dedupe(cfProgs.filter((p) => CF_BACHELOR.has(p.levelObtainedId)).map((p) => courseFromCf(p.programLabel)).sort((a, b) => a.localeCompare(b, 'fr')));
    const mmRows = mmByUai.get(entry.uai) || [];
    const mentions = dedupe([...new Set(mmRows.map((x) => x.mention))].map((m) => mentionName(m, casing)).map((m) => `Master ${m.name}`)).sort((a, b) => a.localeCompare(b, 'fr'));
    const unaccented = [...new Set(mmRows.map((x) => x.mention))].filter((m) => !casing.get(key(m))).length;
    const psRows = psByUai.get(entry.uai) || [];
    const psBachelors = dedupe(parcoursupCourses(psRows, entry.kind)).sort((a, b) => a.localeCompare(b, 'fr'));
    const psEngineering = parcoursupEngineering(psRows);
    // Master's-level group first: English-taught catalogue Master's, the 5-year engineering degree (Parcoursup FI-BAC5, or
    // the school's own engineering-cycle fee page — known after the fees below), national Master's mentions; then Bachelor's
    const courseList = (engineering) => dedupe([...cfMasters, ...(engineering ? [ENGINEERING_DEGREE] : []), ...mentions, ...cfBachelors, ...psBachelors]);
    const hasMaster = cfMasters.length || mentions.length || psEngineering || (s && s.cursus_lmdm > 0);
    const hasBachelor = cfBachelors.length || psBachelors.length || (entry.kind === 'university' && s && s.cursus_lmdl > 0);
    // Levels these sources SHOW. They cannot show that a level is absent (SISE counts are null for some schools, private
    // schools are not in SISE at all, Campus France lists English-taught programmes only, doctorates appear only in SISE),
    // so existing levels are never removed: the proposal is the union, and existing levels without evidence are reported.
    const officialLevels = [hasBachelor && "Bachelor's", hasMaster && "Master's", s && s.cursus_lmdd > 0 && 'PhD'].filter(Boolean);
    const LEVEL_ORDER = ["Bachelor's", "Master's", 'PhD'];
    const canonLevel = (l) => (/bachelor|undergrad|licence/i.test(l) ? "Bachelor's" : (/master|postgrad/i.test(l) ? "Master's" : (/ph\.?\s?d|doctor/i.test(l) ? 'PhD' : l)));
    const existingLevels = [...new Set((Array.isArray(doc?.degreeLevels) ? doc.degreeLevels : []).map(canonLevel))];
    const unionLevels = [...new Set([...officialLevels, ...existingLevels])].sort((a, b) => (LEVEL_ORDER.indexOf(a) + 1 || 99) - (LEVEL_ORDER.indexOf(b) + 1 || 99));
    // Existing levels the lists above do not show: checked against the institution's own home page (programme menu)
    let siteLevelCheck = null;
    const listMissing = unionLevels.filter((l) => !officialLevels.includes(l));
    if (listMissing.length) {
      // our website when it is on an official domain, then the official (English) site from the register / catalogue
      const siteUrls = [...new Set([doc?.website && ident.websites.map(regDomain).includes(regDomain(doc.website)) ? cleanUrl(doc.website) : null, cleanUrl(ident.website)].filter(Boolean))];
      for (const siteUrl of siteUrls) {
        if (siteLevelCheck && listMissing.every((l) => siteLevelCheck.confirmed?.[l])) break;
        try {
          const found = await siteLevels(siteUrl);
          const confirmed = { ...(siteLevelCheck?.confirmed || {}), ...Object.fromEntries(listMissing.filter((l) => found[l] && !siteLevelCheck?.confirmed?.[l]).map((l) => [l, found[l]])) };
          siteLevelCheck = { urls: [...(siteLevelCheck?.urls || []), siteUrl], confirmed, ...(siteLevelCheck?.errors ? { errors: siteLevelCheck.errors } : {}) };
        } catch (err) { siteLevelCheck = { urls: [...(siteLevelCheck?.urls || []), siteUrl], confirmed: siteLevelCheck?.confirmed || {}, errors: [...(siteLevelCheck?.errors || []), err.message] }; }
      }
    }
    const siteConfirmed = Object.keys(siteLevelCheck?.confirmed || {});
    const levelsWithoutEvidence = listMissing.filter((l) => !siteConfirmed.includes(l));
    const degreeLevels = unionLevels;
    const levelEvidence = {
      degreeLevelsFrom: s ? { url: dsPage(DS.sise), year: s.annee_universitaire, licence: s.cursus_lmdl, master: s.cursus_lmdm, doctorate: s.cursus_lmdd } : 'programme lists only (not in SISE: private or other ministry)',
      degreeLevelsShownByOfficialSources: officialLevels,
      ...(siteLevelCheck ? { degreeLevelsConfirmedByOwnWebsite: siteLevelCheck } : {}),
      existingLevelsKeptWithoutOfficialEvidence: levelsWithoutEvidence,
    };

    // --- fees
    const f = { rule: entry.fee, rows: [], urls: [], notes: [] };
    fees[entry.key] = f;
    const name = ident.officialName;
    try {
      if ((entry.fee === 'national' || entry.fee === 'national-master') && national) {
        if (!underMinistry) f.notes.push('not in SISE (not a public institution under the Ministry) — national fee order not applied');
        else {
          if (s.cursus_lmdm > 0 && (!entry.nationalLevels || entry.nationalLevels.includes('master'))) f.rows.push({ level: 'master', programme: "National Master's degree — non-EU differentiated fee", annualEUR: national.masterEUR, basis: 'per year (national fee order)', approx: false, url: national.url, quote: national.quote, verified: national.verified, method: 'national fee order (Campus France)', feeYear: national.year });
          if (s.cursus_lmdl > 0 && (entry.kind === 'university' || entry.fee === 'national-master') && (!entry.nationalLevels || entry.nationalLevels.includes('bachelor'))) f.rows.push({ level: 'bachelor', programme: 'Licence (national Bachelor\'s degree) — non-EU differentiated fee', annualEUR: national.bachelorEUR, basis: 'per year (national fee order)', approx: false, url: national.url, quote: national.quote, verified: national.verified, method: 'national fee order (Campus France)', feeYear: national.year });
          f.urls.push(national.url);
          // the institution's own fee page, where checked: a blanket exemption contradicts the national amount
          if (!UNIVERSITY_FEE_PAGES[entry.key]) nationalFeeNotCheckedOnOwnPage.push(doc?.name || ident.officialName);
          else {
            const chk = await ownFeePageCheck(entry.key);
            f.ownFeePage = chk;
            if (chk.exemption) {
              f.withheld = `the institution's own fee page states a blanket exemption from the national non-EU fee — "${chk.exemption.quote}" (${chk.url}); the national amount is not what a new non-EU student pays there, and Campus France says waivers granted for 2026–27 before Décret 2026-385 are kept`;
              addSource(chk.url, 'institution fee page (blanket exemption from the national non-EU fee)');
            } else if (chk.confirms) {
              f.urls.push(chk.url);
              addSource(chk.url, 'institution fee page (confirms the national non-EU fee)');
            } else if (chk.error) {
              f.notes.push(`own fee page not read: ${chk.error}`);
              // cannot tell whether the institution exempts non-EU students: no fee proposal this run
              f.incomplete = [...(f.incomplete || []), `own fee page ${chk.url}: ${chk.error}`];
            }
            if (chk.note) uncertainties.push(`${entry.key}: own fee page ${chk.url}: ${chk.note}`);
          }
        }
      } else if (entry.fee === 'sciencespo') {
        const sp = await sciencesPoFees();
        f.rows.push(...sp.rows); f.urls.push(SCIENCESPO_FEES); f.notes.push(sp.note); addSource(SCIENCESPO_FEES, 'Sciences Po tuition fees page');
      } else if (entry.fee === 'ipparis') {
        try {
          const ip = await ipParisFees();
          f.rows.push(...ip.rows); f.urls.push(ip.pdfUrl); f.notes.push(ip.note); addSource(ip.pdfUrl, 'IP Paris Master\'s tuition fee schedule (PDF)');
        } catch (err) { f.notes.push(`IP Paris fee PDF: ${err.message}`); }
        const bach = details.filter((d) => CF_BACHELOR.has(d.levelObtainedId));
        const own = await ownProgrammeFees(entry, bach, name, entry.ownDomains);
        f.rows.push(...own.rows.filter((x) => x.annualEUR)); f.attempts = own.rows.filter((x) => !x.annualEUR).map((x) => ({ programme: x.programme, attempts: x.attempts }));
        f.incomplete = own.rows.filter((x) => !x.annualEUR && x.incomplete && !x.special).map((x) => `${x.programme}: ${x.incomplete.join('; ')}`);
      } else if (entry.fee === 'own') {
        const allowed = [...new Set([...(entry.ownDomains || []), ...ident.websites.map(regDomain), ...(doc?.website ? [regDomain(doc.website)] : [])].filter(Boolean))];
        const own = await ownProgrammeFees(entry, details, name, allowed);
        f.rows.push(...own.rows.filter((x) => x.annualEUR));
        f.attempts = own.rows.filter((x) => !x.annualEUR).map((x) => ({ programme: x.programme, attempts: x.attempts }));
        // programmes (in the range / median) whose fee is missing only because of this run (cap, LLM / network down)
        f.incomplete = own.rows.filter((x) => !x.annualEUR && x.incomplete && !x.special).map((x) => `${x.programme}: ${x.incomplete.join('; ')}`);
        if (own.preMaster) f.preMasterTrack = own.preMaster;
        if (entry.feeSchedule === 'centralesupelec') {
          try {
            const cs = await centraleSupelecFees();
            f.rows.push(...cs.rows); f.notes.push(cs.note); addSource(CS_ENGINEERING_FEES, 'CentraleSupélec engineering-cycle fee schedule');
          } catch (err) {
            f.notes.push(`CentraleSupélec engineering-cycle fee page: ${err.message}`);
            if (err.incomplete) f.incomplete = [...(f.incomplete || []), `engineering-cycle fee page: ${err.message}`];
          }
        }
      }
    } catch (err) {
      f.notes.push(`fee source failed: ${err.message}`);
      if (err.incomplete) f.incomplete = [...(f.incomplete || []), `fee source: ${err.message}`];
    }
    if (row.problems.some((p) => /^Campus France programme/.test(p)) && (entry.fee === 'own' || entry.fee === 'ipparis')) f.incomplete = [...(f.incomplete || []), 'one or more Campus France programme entries could not be read'];
    f.urls = [...new Set([...f.urls, ...f.rows.map((x) => x.url)].filter(Boolean))];
    f.rows.forEach((x) => addSource(x.url.startsWith(CF_API) ? CF_CATALOGUE : x.url, x.method));
    f.bachelor = summariseFees(f.rows, 'bachelor');
    f.master = summariseFees(f.rows, 'master');
    if (f.bachelor || f.master) f.yearLabel = isNationalFee(entry) ? national?.year || null : feeYearLabel(f.master, f.bachelor);

    // --- courses (the engineering degree is known only now: Parcoursup FI-BAC5, or the school's engineering-cycle fee page)
    const csEngineering = f.rows.find((x) => /^own fee schedule \(engineering cycle\)/.test(x.method || '') && x.verified);
    const engineeringFrom = psEngineering
      ? { source: `Parcoursup ${psYear} (Formation d'ingénieur Bac + 5)`, url: dsPage(DS.parcoursup), quote: `etab_uai: ${entry.uai}; nm: ${psEngineering}` }
      : (csEngineering ? { source: "the school's own engineering-cycle fee page", url: csEngineering.url, quote: csEngineering.quote } : null);
    const allCourses = courseList(engineeringFrom);
    const courses = allCourses.slice(0, 150);
    const courseEvidence = {
      campusFranceEnglishTaught: { url: CF_CATALOGUE, etabIds: entry.cf, masters: cfMasters.length, bachelors: cfBachelors.length },
      monMaster: { url: dsPage(DS.monMaster), session: mmSession, uai: entry.uai, mentions: mentions.length, programmes: mmRows.length, mentionsWithoutOfficialSpelling: unaccented },
      parcoursup: { url: dsPage(DS.parcoursup), session: psYear, bachelorLevelProgrammes: psBachelors.length },
      ...(engineeringFrom ? { engineeringDegree: engineeringFrom } : {}),
      ...levelEvidence,
      totalBeforeCap: allCourses.length,
    };
    console.log(`  · ${squash(name).slice(0, 48).padEnd(48)} ${entry.fee.padEnd(15)} courses ${String(courses.length).padStart(3)}  B ${f.bachelor ? `${money(f.bachelor.typicalLow)}–${money(f.bachelor.typicalHigh)} (${f.bachelor.programmes})` : '—'}  M ${f.master ? `${money(f.master.typicalLow)}–${money(f.master.typicalHigh)} (${f.master.programmes})` : '—'}`);

    // --- proposed values
    const proposed = {};
    const fieldEvidence = {};
    const leftUnchanged = []; // fields this run does not propose, and why (→ valuesLeftNull)
    if (courses.length >= MIN_COURSES) { proposed.courses = courses; fieldEvidence.courses = courseEvidence; }
    else if (courses.length) leftUnchanged.push(`courses: the official sources list only ${courses.length} programme${courses.length > 1 ? 's' : ''} (${courses.join('; ')}) — fewer than ${MIN_COURSES}, not representative of the institution; existing list left unchanged`);
    if (degreeLevels.length) proposed.degreeLevels = degreeLevels;
    const isNational = entry.fee === 'national' || entry.fee === 'national-master';
    // dataSource.fields of an earlier run of this script: a value it marked official is not "unverified"
    const prevDs = doc?.dataSource && /^france-sync-/.test(String(doc.dataSource.runId || '')) ? doc.dataSource : null;
    const prevOfficial = new Set(Array.isArray(prevDs?.fields) ? prevDs.fields : []);
    // a stored USD value this run cannot (re-)confirm — unverified, or marked official by an earlier run but not confirmed now
    const unverifiedUsd = (k) => Boolean(doc) && doc[k] != null;
    let feeBlocked = null;
    let feeInputIncomplete = false; // no verdict on the fee this run: an earlier run's official fee marks are kept
    const usable = { master: levelUsable(f.master), bachelor: levelUsable(f.bachelor) };
    if (f.incomplete?.length) {
      feeInputIncomplete = true;
      feeBlocked = `fee input incomplete in this run (${f.incomplete.length} item${f.incomplete.length > 1 ? 's' : ''}: ${f.incomplete.slice(0, 3).join(' | ')}${f.incomplete.length > 3 ? ' | …' : ''}) — no fee proposal`;
    } else if (f.withheld) feeBlocked = f.withheld;
    else if ((f.bachelor || f.master) && !fx) feeBlocked = 'ECB FX rate unavailable';
    else if (f.bachelor || f.master) {
      const blocked = [];
      if (!usable.master && !usable.bachelor) blocked.push(`no level has a representative official fee (Master's: ${levelUnusableReason(f.master)}; Bachelor's: ${levelUnusableReason(f.bachelor)})`);
      else {
        // once dataSource.fields names a fee field the website shows BOTH USD fields as official: an unverified value must
        // not remain in the other level's field
        if (!usable.bachelor && unverifiedUsd('tuitionFeeUSD')) blocked.push(`no official Bachelor's figure (${levelUnusableReason(f.bachelor)}), and the stored tuitionFeeUSD ${doc.tuitionFeeUSD} (${prevOfficial.has('tuitionFeeUSD') ? 'official in an earlier run, not re-confirmed now' : 'unverified'}) would then be shown as official next to the official fee`);
        if (!usable.master && unverifiedUsd('graduateTuitionUSD')) blocked.push(`no official Master's figure (${levelUnusableReason(f.master)}), and the stored graduateTuitionUSD ${doc.graduateTuitionUSD} (${prevOfficial.has('graduateTuitionUSD') ? 'official in an earlier run, not re-confirmed now' : 'unverified'}) would then be shown as official next to the official fee`);
      }
      if (blocked.length) feeBlocked = blocked.join('; ');
    }
    if (!feeBlocked && fx && (f.bachelor || f.master)) {
      const range = (x) => (x.typicalLow === x.typicalHigh ? `EUR ${money(x.typicalLow)}` : `EUR ${money(x.typicalLow)}–${money(x.typicalHigh)}`);
      // a single programme is named, so a one-programme range is never read as the school-wide fee
      const oneName = (lvl) => f.rows.find((r) => r.level === lvl && r.verified && r.annualEUR && !r.special)?.programme;
      const count = (x, lvl) => (isNational || entry.fee === 'sciencespo' || x.scheduleOnly ? '' : ` (${x.programmes === 1 ? `1 programme: ${oneName(lvl)}` : `${x.programmes} programmes`})`);
      const parts = [];
      if (f.master) { if (usable.master) proposed.graduateTuitionUSD = Math.round(f.master.median * fx.rate); parts.push(`Master's ${range(f.master)}${count(f.master, 'master')}`); }
      if (f.bachelor) { if (usable.bachelor) proposed.tuitionFeeUSD = Math.round(f.bachelor.median * fx.rate); parts.push(`${isNational ? "Bachelor's (Licence)" : "Bachelor's"} ${range(f.bachelor)}${count(f.bachelor, 'bachelor')}`); }
      const usd = [proposed.graduateTuitionUSD != null && `Master's ≈ US$${money(proposed.graduateTuitionUSD)}`, proposed.tuitionFeeUSD != null && `Bachelor's ≈ US$${money(proposed.tuitionFeeUSD)}`].filter(Boolean).join(', ');
      // fee year(s) as printed, with the number of programmes per year and the undated ones (never one year for all)
      const yearLabel = feeYearLabel(f.master, f.bachelor);
      const anyApprox = (f.master?.approxRows || 0) + (f.bachelor?.approxRows || 0) > 0 || (f.master?.programmes || 0) > 1 || (f.bachelor?.programmes || 0) > 1;
      const excl = [...(f.master?.excludedFromRange || []), ...(f.bachelor?.excludedFromRange || [])].length ? '; MBA, executive and post-Master\'s programmes excluded' : '';
      if (isNational) {
        proposed.tuition = `${parts.join(' · ')} per year (non-EU national "differentiated" registration fees, ${national.year}; set by ministerial order, individual exemptions possible${f.ownFeePage?.confirms ? '; confirmed on the institution\'s own fee page' : ''}; ${usd}) — Campus France / French Ministry of Higher Education`;
      } else {
        // name the sources the range actually rests on
        const inRange = f.rows.filter((x) => x.verified && x.annualEUR && !x.special);
        const instLabel = squash(doc?.name || name);
        const fromOwn = inRange.filter((x) => /^own programme page/.test(x.method)).length;
        const fromCf = inRange.filter((x) => /^Campus France/.test(x.method)).length;
        const fromSchedule = inRange.some((x) => /^own fee schedule/.test(x.method));
        const ownBits = [fromOwn && 'programme pages', fromSchedule && 'fee schedule'].filter(Boolean).join(' and ');
        let src;
        if (entry.fee === 'sciencespo') src = 'official Sciences Po tuition page';
        else if (entry.fee === 'ipparis') src = `official IP Paris Master's fee schedule${fromOwn ? ' and programme pages' : ''}`;
        else if (!fromCf) src = `official ${instLabel} ${ownBits}`;
        else if (!ownBits) src = `Campus France catalogue (fees declared by ${instLabel})`;
        else src = `official ${instLabel} ${ownBits} and Campus France catalogue (fees declared by the school)`;
        proposed.tuition = `${parts.join(' · ')} per year (non-EU, ${yearLabel}${anyApprox ? ', approx.' : ''}; ${f.master?.programmes > 1 || f.bachelor?.programmes > 1 ? 'medians ' : ''}${usd}${excl}) — ${src}`;
      }
      fieldEvidence.tuition = { rule: entry.fee, urls: f.urls, fx, feeYear: isNational ? national.year : yearLabel, bachelor: f.bachelor, master: f.master };
    }
    if (feeBlocked && (f.bachelor || f.master)) uncertainties.push(`${doc?.name || name}: official fee rows read but no fee field proposed (${feeBlocked}); existing values left unchanged`);
    // Levels the institution teaches (per the lists above) but for which no official fee field is proposed, and why
    const missingFee = [];
    if (feeBlocked) missingFee.push(`tuition, tuitionFeeUSD, graduateTuitionUSD: not proposed — ${feeBlocked}; existing values left unchanged`);
    else {
      if (hasBachelor && proposed.tuitionFeeUSD == null) missingFee.push(f.bachelor ? `tuitionFeeUSD: ${levelUnusableReason(f.bachelor)}; the Bachelor's range is given in the tuition text only` : `tuitionFeeUSD + Bachelor's part of tuition: ${isNational ? (!underMinistry ? 'not a public institution under the Ministry' : (entry.nationalLevels && !entry.nationalLevels.includes('bachelor') ? 'school-specific undergraduate programmes (national Licence fee not applied); no official fee read' : 'national fee applies to Licence enrolment only (none in SISE)')) : 'no readable non-EU fee on the official programme pages or recent Campus France entries'}`);
      if (hasMaster && proposed.graduateTuitionUSD == null) missingFee.push(f.master ? `graduateTuitionUSD: ${levelUnusableReason(f.master)}; the Master's range is given in the tuition text only` : `graduateTuitionUSD + Master's part of tuition: ${isNational ? 'national fee order not applicable' : 'no readable non-EU fee on the official programme pages or recent Campus France entries'}`);
    }
    missingFee.push(...leftUnchanged);
    if (missingFee.length) nulls.push({ institution: name, dbName: doc?.name || null, fields: missingFee });

    // Website: keep ours when it is on an official domain; else the register's (English) site
    const officialSite = ident.website ? cleanUrl(ident.website) : null;
    const officialDomains = new Set(ident.websites.map(regDomain).filter(Boolean));
    // City: keep ours when it is the official commune or its urban area; else the commune
    const cityOk = (c) => c && [ident.commune, ident.urbanUnit].some((x) => x && key(x) === key(c));
    // Name: only curated renames that equal the register's official name
    let rename = null;
    if (entry.rename) {
      if (ident.names.some((n) => key(n) === key(entry.rename))) {
        rename = entry.rename;
        ident.evidence.push({ what: 'official name in the register', url: dsPage(DS.register), quote: `uo_lib: ${ident.officialName}${ident.decree ? `; texte_de_ref_creation_lib: ${ident.decree}` : ''}${ident.formerUai ? `; anciens_codes_uai: ${[].concat(ident.formerUai).join(',')}` : ''}`, verified: true });
      } else uncertainties.push(`${entry.db[0]}: curated rename "${entry.rename}" not confirmed by the register (${ident.names.join(' / ')}); name kept`);
    }

    row.type = type; row.website = officialSite; row.courses = proposed.courses ? courses.length : `${courses.length} (not proposed)`; row.degreeLevels = degreeLevels; row.officialName = name;
    row.fee = { rule: entry.fee, bachelorEUR: f.bachelor ? [f.bachelor.typicalLow, f.bachelor.typicalHigh, f.bachelor.median] : null, masterEUR: f.master ? [f.master.typicalLow, f.master.typicalHigh, f.master.median] : null, bachelorUSD: proposed.tuitionFeeUSD ?? null, masterUSD: proposed.graduateTuitionUSD ?? null, source: f.urls.length ? (isNational ? 'national fee order (Campus France)' : [...new Set(f.rows.map((x) => x.method))].join(' + ')) : null };

    // --- duplicates → hidden
    for (const d of dupDocs) {
      if (d.isActive === false) continue;
      const reason = `duplicate of "${doc.name}" (same institution: register UAI ${entry.uai}, ${ident.officialName})`;
      const dataSource = { provider: PROVIDER, urls: [dsPage(DS.register)], syncedAt, fields: ['isActive'], runId: RUN_ID, reason };
      changes.push({ id: String(d._id), name: d.name, action: 'deactivate', reason, diff: { isActive: { from: d.isActive, to: false }, dataSource: { from: d.dataSource, to: dataSource } }, evidence: [...ident.evidence, { what: 'kept record', quote: `${doc.name} (${doc._id}) website ${doc.website}; duplicate website ${d.website}`, verified: regDomain(doc.website) === regDomain(d.website) }] });
    }

    // --- create
    if (entry.create) {
      const city = ident.commune;
      if (ours.some((o) => o.name === name && o.city === city)) { row.action = 'not created (name/city exists)'; continue; }
      if (ours.some((o) => o.dataSource?.uai === entry.uai)) { row.action = `not created (a record with dataSource.uai ${entry.uai} exists)`; continue; }
      const website = officialSite ? officialSite.replace(/\/$/, '') : null;
      const fields = ['name', 'city', ...(officialSite ? ['website'] : []), 'type', 'description', ...Object.keys(proposed)];
      if (website) fields.push('logo');
      const id = new mongoose.Types.ObjectId();
      const newDoc = {
        _id: String(id), name, country: String(france._id), city, website,
        logo: website ? `https://www.google.com/s2/favicons?domain=${website.replace(/^https?:\/\//, '').split('/')[0]}&sz=128` : null,
        type,
        description: `${name} is a French public university (${ident.typology}) in ${city}, listed in the French Ministry of Higher Education's register of higher-education institutions${ident.decree ? ` (${ident.decree})` : ''}. It offers ${cfProgs.length} English-taught degree programmes in the Campus France catalogue.`,
        eligibility: null, categoryTags: [],
        tuition: proposed.tuition ?? null, tuitionFeeUSD: proposed.tuitionFeeUSD ?? null, graduateTuitionUSD: proposed.graduateTuitionUSD ?? null,
        // schema defaults would invent these — set explicitly to "unknown"
        minGpaPercent: null, minIeltsScore: null, minGreScore: null, greRequired: null, acceptanceRate: null,
        minScore: null, ieltsScore: null, greExam: null, workExp: null, scholarshipAvailable: null, rankingNum: null,
        courses: proposed.courses || [], degreeLevels: proposed.degreeLevels || [],
        isActive: true,
        dataSource: { provider: PROVIDER, urls: [...new Set([dsPage(DS.register), dsPage(DS.sise), dsPage(DS.monMaster), dsPage(DS.parcoursup), CF_CATALOGUE, ...(proposed.tuition ? f.urls : [])])], syncedAt, fields, runId: RUN_ID, createdBySync: SYNC_ID, createdByRunId: RUN_ID, uai: entry.uai, ...(proposed.tuition ? { fx, feeYear: fieldEvidence.tuition.feeYear, feeRule: entry.fee, feeUrls: f.urls } : {}) },
      };
      creates.push({ id: String(id), name, doc: newDoc, evidence: { identity: ident.evidence, courses: fieldEvidence.courses, tuition: fieldEvidence.tuition } });
      row.action = 'create';
      row.dbName = name;
      continue;
    }

    // --- update the kept record
    const diff = {};
    if (rename && doc.name !== rename) diff.name = { from: doc.name, to: rename };
    if (officialSite && !officialDomains.has(regDomain(doc.website))) {
      diff.website = { from: doc.website, to: officialSite.replace(/\/$/, '') };
      if (doc.logo) diff.logo = { from: doc.logo, to: `https://www.google.com/s2/favicons?domain=${diff.website.to.replace(/^https?:\/\//, '').split('/')[0]}&sz=128` };
    }
    if (String(doc.type || '').toUpperCase() !== type) diff.type = { from: doc.type, to: type };
    if (!cityOk(doc.city) && ident.commune) diff.city = { from: doc.city, to: ident.commune };
    for (const [k, val] of Object.entries(proposed)) {
      if (JSON.stringify(doc[k]) !== JSON.stringify(val)) diff[k] = { from: doc[k], to: val };
    }
    const newName = diff.name ? diff.name.to : doc.name;
    const newCity = diff.city ? diff.city.to : doc.city;
    const identityUnconfirmed = new Set();
    if ((diff.name || diff.city) && ours.some((o) => o !== doc && o.name === newName && o.city === newCity)) {
      uncertainties.push(`${doc.name}: name/city change would clash with the unique index; name/city change skipped`);
      if (diff.name) identityUnconfirmed.add('name');
      if (diff.city) identityUnconfirmed.add('city');
      delete diff.name; delete diff.city;
    }
    if (doc.isActive === false) diff.isActive = { from: false, to: true };

    // dataSource.fields = exactly the fields whose stored value (after this write) comes from an official source:
    //  · every value this run proposes (changed or already equal), except degreeLevels while a level lacks evidence
    //    (then dataSource.partialFields.degreeLevels names the unverified levels);
    //  · changed identity fields (name / website / logo / type / city / isActive), and those an earlier run of this script
    //    marked official that this run did not contradict;
    //  · fee fields an earlier run marked official, when this run's fee input was incomplete (no verdict this run; their
    //    fx / feeYear / feeUrls are carried over). Fee marks this run withheld or could not confirm are withdrawn.
    const partialFields = proposed.degreeLevels && levelsWithoutEvidence.length
      ? { degreeLevels: { unverifiedLevels: levelsWithoutEvidence, note: 'existing levels kept (never removed) without official evidence in this run' } } : null;
    const fieldsNow = new Set([...Object.keys(proposed), ...Object.keys(diff)].filter((k) => !(k === 'degreeLevels' && partialFields)));
    const IDENTITY_FIELDS = ['name', 'website', 'logo', 'type', 'city', 'isActive'];
    const carriedFee = [];
    for (const k of prevOfficial) {
      if (fieldsNow.has(k) || k in proposed) continue;
      if (IDENTITY_FIELDS.includes(k) && !identityUnconfirmed.has(k)) fieldsNow.add(k);
      else if (FEE_FIELDS.includes(k) && feeInputIncomplete && doc[k] != null) { fieldsNow.add(k); carriedFee.push(k); }
    }
    const fieldsList = [...fieldsNow].sort();
    const prevFieldsList = [...prevOfficial].sort();
    const feeNow = FEE_FIELDS.some((k) => k in proposed);
    const dataSourceChanged = !prevDs || JSON.stringify(fieldsList) !== JSON.stringify(prevFieldsList) || JSON.stringify(prevDs.partialFields || null) !== JSON.stringify(partialFields);
    // Nothing official to record (e.g. only the spelling of unverified degree levels would change): no write at all — a
    // dataSource without official fields would still label the record as official data on the website
    if (!fieldsList.length && Object.keys(diff).length) {
      uncertainties.push(`${doc.name}: no value of this run is official (${Object.keys(diff).join(', ')} would change only by normalisation / unverified levels); record not written`);
      for (const k of Object.keys(diff)) delete diff[k];
    }
    row.action = Object.keys(diff).length ? 'update' : (dataSourceChanged && fieldsList.length ? 'update (dataSource only)' : 'unchanged');
    if (Object.keys(diff).length || (dataSourceChanged && fieldsList.length)) {
      const coursesOrLevels = fieldsNow.has('courses') || fieldsNow.has('degreeLevels') || Boolean(partialFields);
      const dataSource = {
        provider: PROVIDER,
        urls: [...new Set([dsPage(entry.idSource === 'register' ? DS.register : (entry.idSource === 'sise' ? DS.sise : DS.atlas)), ...(coursesOrLevels ? [dsPage(DS.monMaster), dsPage(DS.parcoursup), CF_CATALOGUE, ...(s ? [dsPage(DS.sise)] : [])] : []), ...(siteConfirmed.length ? [...new Set(Object.values(siteLevelCheck.confirmed).map((x) => x.url))] : []), ...(feeNow ? f.urls : (carriedFee.length ? (prevDs.feeUrls || []) : []))])],
        syncedAt, fields: fieldsList, runId: RUN_ID, uai: entry.uai,
        ...(partialFields ? { partialFields } : {}),
        ...(feeNow ? { fx, feeRule: entry.fee, feeYear: fieldEvidence.tuition.feeYear, feeUrls: f.urls } : {}),
        ...(!feeNow && carriedFee.length ? { fx: prevDs.fx, feeRule: prevDs.feeRule, feeYear: prevDs.feeYear, feeUrls: prevDs.feeUrls, feeCarriedFromRunId: prevDs.feeCarriedFromRunId || prevDs.runId } : {}),
        // a record this script created keeps its creation stamps (revert of the creating run finds it by createdByRunId)
        ...(doc.dataSource?.createdBySync === SYNC_ID ? { createdBySync: SYNC_ID, createdByRunId: doc.dataSource.createdByRunId || doc.dataSource.runId } : {}),
      };
      diff.dataSource = { from: doc.dataSource, to: dataSource };
      changes.push({ id: String(doc._id), name: doc.name, action: 'update', diff, evidence: { identity: ident.evidence, courses: fieldEvidence.courses || null, degreeLevels: levelEvidence, tuition: fieldEvidence.tuition || null } });
    }
  }

  const feeWritten = new Set([...changes.filter((c) => FEE_FIELDS.some((k) => c.diff[k])).map((c) => c.name), ...creates.filter((c) => c.doc.tuition).map((c) => c.name)]);
  const notChecked = nationalFeeNotCheckedOnOwnPage.filter((n) => feeWritten.has(n));
  if (notChecked.length) {
    uncertainties.push(`National non-EU fee proposed from the Campus France / ministerial schedule without checking the institution's own 2026-27 fee page (a university may have granted a blanket exemption before Décret 2026-385, as Université Paris-Saclay did): ${notChecked.join('; ')}`);
  }

  // 6) Reviewer flags (nothing is changed for these)
  const deactivated = new Set(changes.filter((c) => c.action === 'deactivate').map((c) => c.id));
  const DEFAULTISH = { minIeltsScore: 6.5, minGpaPercent: 60, ieltsScore: 'IELTS 6.0+', minScore: 'GPA 3.0+', greExam: 'GRE Waived', workExp: 'Freshers Eligible', scholarshipAvailable: true };
  const unverifiedFields = ours.filter((u) => !deactivated.has(String(u._id))).map((u) => {
    const ch = changes.find((c) => c.id === String(u._id));
    // fields that would be official after this run (the planned dataSource, else the stored one of an earlier run)
    const ds = ch ? ch.diff.dataSource?.to : (/^france-sync-/.test(String(u.dataSource?.runId || '')) ? u.dataSource : null);
    const official = new Set(ds?.fields || []);
    const fields = Object.entries(DEFAULTISH).filter(([k, val]) => u[k] === val).map(([k]) => `${k} (schema default)`);
    if (u.acceptanceRate != null) fields.push(`acceptanceRate ${u.acceptanceRate}`);
    if (u.eligibility) fields.push('eligibility (free text, unverified)');
    if (u.description) fields.push('description (unverified)');
    if ((u.rankingNum != null || u.rank) && !u.rankingSource) fields.push(`rankingNum ${u.rankingNum} / rank "${u.rank || ''}" without rankingSource (not touched — QS import)`);
    if (!official.has('tuitionFeeUSD') && u.tuitionFeeUSD != null) fields.push(`tuitionFeeUSD ${u.tuitionFeeUSD} (no official replacement this run; left unchanged)`);
    if (!official.has('graduateTuitionUSD') && u.graduateTuitionUSD != null) fields.push(`graduateTuitionUSD ${u.graduateTuitionUSD} (no official replacement this run; left unchanged)`);
    if (!official.has('tuition') && u.tuition) fields.push(`tuition "${u.tuition}" (no official replacement this run; left unchanged)`);
    if (!official.has('courses') && (u.courses || []).length) fields.push(`courses (${u.courses.length} names, no representative official list this run; left unchanged)`);
    if (ds?.partialFields?.degreeLevels) fields.push(`degreeLevels: ${ds.partialFields.degreeLevels.unverifiedLevels.join(', ')} kept without official evidence (not in dataSource.fields)`);
    return { name: u.name, fields };
  }).filter((x) => x.fields.length);
  const unmatched = ours.filter((u) => !matchedIds.has(String(u._id))).map((u) => u.name);
  if (unmatched.length) uncertainties.push(`DB records not mapped to an official entry (no change proposed): ${unmatched.join(', ')}`);

  // Apply readiness: every input this run's proposals rest on was complete (see the header)
  const readinessProblems = [...new Set(inputProblems)];
  if (counters.llmSkippedByCap) readinessProblems.push(`${counters.llmSkippedByCap} fee page(s) not read by the LLM fallback: Groq cap for this run (${MAX_LLM}) reached`);
  if (counters.llmUnavailable) readinessProblems.push(`${counters.llmUnavailable} fee page(s) not read by the LLM fallback: LLM unavailable (${NO_LLM ? '--no-llm' : (GROQ_API_KEY ? 'Groq request failed' : 'GROQ_API_KEY missing')})`);
  if (counters.scrapeDoSkippedByCap) readinessProblems.push(`${counters.scrapeDoSkippedByCap} page(s) not fetched: scrape.do budget for this run (${MAX_SCRAPEDO}) reached`);
  const applyReadiness = {
    ok: readinessProblems.length === 0,
    problems: readinessProblems,
    feeProposalsDropped: Object.entries(fees).filter(([, f]) => f.incomplete?.length).map(([k, f]) => ({ key: k, reasons: f.incomplete })),
    datasetCounts,
    note: '--apply refuses (nothing written) unless ok is true; institutions in feeProposalsDropped get no fee change in this run (page-level failures).',
  };

  // The plan = every record/field this run would write and the value it would write (volatile stamps excluded).
  // --apply --expect compares it entry by entry with the reviewed dry run and writes nothing on any difference.
  const plan = buildPlan(changes, creates);
  let mode = APPLY ? 'apply' : 'dry-run';
  let expectCheck = null;
  if (expected) {
    const differences = comparePlans(expected.plan, plan);
    expectCheck = { report: path.resolve(EXPECT), reviewedRunId: expected.runId, expectedHash: expected.plan.hash, actualHash: plan.hash, match: !differences.length && expected.plan.hash === plan.hash, differences: differences.slice(0, 300) };
    if (!expectCheck.match) mode = 'apply-refused';
  }
  if (APPLY && !applyReadiness.ok) mode = 'apply-refused';

  const count = (fld) => changes.filter((c) => c.diff[fld]).length;
  const summary = {
    runId: RUN_ID, mode, planHash: plan.hash, applyReady: applyReadiness.ok,
    ...(expectCheck ? { expectCheck: { report: expectCheck.report, match: expectCheck.match, differences: expectCheck.differences.length } } : {}),
    ourFranceRecords: ours.length,
    creates: creates.length, updates: changes.filter((c) => c.action === 'update').length,
    deactivations: changes.filter((c) => c.action === 'deactivate').length,
    unchanged: institutions.filter((i) => i.action === 'unchanged').length,
    fieldsChanged: Object.fromEntries(['name', 'city', 'website', 'type', 'courses', 'degreeLevels', 'tuition', 'tuitionFeeUSD', 'graduateTuitionUSD', 'isActive', 'dataSource'].map((x) => [x, count(x)])),
    feeFieldsProposed: changes.filter((c) => FEE_FIELDS.some((k) => (c.diff.dataSource?.to?.fields || []).includes(k))).map((c) => c.name),
    nationalFees: national ? { year: national.year, bachelorEUR: national.bachelorEUR, masterEUR: national.masterEUR, verified: national.verified } : null,
    datasets: { siseYear, monMasterSession: mmSession, parcoursupSession: psYear, campusFranceProgrammes: cfPrograms.length },
    unmatchedDbRecords: unmatched, verificationProblems: errors, requests: counters, fx,
  };
  const methodNotes = [
    `Public universities (and ENS de Lyon / ENS Paris-Saclay / INSA Lyon for their national Master's; INSA Lyon and ENS de Lyon Master's level only — INSA's undergraduate route is its own engineering programme, and ENS de Lyon's own 2026-27 fee page lists a Master's fee and no Licence fee) are public institutions under the Ministry (MESR SISE). Non-EU students pay the national "differentiated" registration fees set by the Arrêté du 19 avril 2019 — amounts for ${national?.year || 'the current year'} read from Campus France's official tuition page. Doctorates are not subject to differentiated fees. Universities may still exempt individual students (rules tightened by Décret n° 2026-385 of 19 May 2026; waivers granted for 2026–27 before the decree are kept); the national amount is the default a new non-EU student pays. Own fee pages checked: ${Object.keys(UNIVERSITY_FEE_PAGES).join(', ')} — a page stating a blanket exemption (Université Paris-Saclay, Board resolution CA-2026-013) means no fee is proposed for that institution; the others confirm the national amount. Other universities were not checked against their own page.`,
    'Grandes écoles and private schools: yearly non-EU tuition read from each programme page on the institution\'s own website (links from the Campus France catalogue). A programme fee for a programme of up to 18 months is taken as one year; a fee printed for a 2-year programme is divided by 2 (marked approx), unless the page says the fees are annual. EU / non-EU column tables are read by column position (else by the LLM). A preparatory pre-Master year is never part of a Master\'s fee; when the school\'s own pages say its two-year MSc route starts with a pre-Master year, catalogue two-year totals are left out (one-year track only). If the own page has no readable fee, the Campus France catalogue fee text (declared by the institution, may include compulsory school fees) is used only when updated in the last 18 months. CentraleSupélec: also its engineering-cycle fee schedule (Master\'s-level Diplôme d\'ingénieur, students entering from September 2026).',
    'Sciences Po: first-enrolment fee for students with fiscal residence outside the EEA (official tuition page). IP Paris: Master\'s national-track and international-track fees for non-EU students from its 2026-2027 fee schedule (PDF); the Bachelor fee of École polytechnique (an IP Paris school) from its programme page.',
    `Ranges: 10th–90th percentile of programme fees when ≥10 programmes, else min–max; MBA / executive programmes are listed but kept out of the range and median. tuitionFeeUSD / graduateTuitionUSD = median × ECB EUR→USD, set only for a level with an institution-wide fee schedule or ≥${MIN_LEVEL_ROWS} programme fees (a single programme's fee is named in the tuition text only). No fee field at all is proposed when the record would keep an unverified USD value in the other level's field (the website shows both USD fields as official once dataSource.fields names a fee field), when the fee input of this run is incomplete, or when the institution's own page contradicts the national fee; existing values then stay unchanged (valuesLeftNull / unverifiedFields). The fee year in the tuition text lists every printed year with its programme count and the undated programmes.`,
    `Courses: Master's first — English-taught Master's programmes from the Campus France catalogue, the 5-year engineering degree (Parcoursup ${psYear} "Formation d'ingénieur Bac + 5", or the school's own engineering-cycle fee page), then national Master's mentions from MonMaster ${mmSession} (official spelling from the Trouver mon master mention list), then English-taught Bachelor's and Parcoursup ${psYear} Licence / BUT / school bachelor programmes; deduplicated, capped at 150. A list of fewer than ${MIN_COURSES} official programmes is not proposed (existing list kept, reported). Degree levels: from those lists plus MESR SISE ${siseYear} enrolments by cycle (Licence / Master / Doctorat → PhD) and, for existing levels these do not show, the institution's own home page (programme menu); existing levels are never removed, and 'degreeLevels' is in dataSource.fields only when every level has evidence (else dataSource.partialFields.degreeLevels).`,
    'dataSource.fields = every field whose stored value after the write comes from an official source in this run (proposed values, changed identity fields), plus identity fields an earlier run of this script marked official and this run did not contradict, plus an earlier run\'s fee fields when this run\'s fee input was incomplete (their fx / feeYear / feeUrls carried over). Records this script created keep createdBySync / createdByRunId. Records found by dataSource.uai (written by an earlier run) are always updated, never created again.',
    'Every run writes its own report <runId>-<mode>.json and never overwrites an existing one. plan.entries lists every record/field the run would write with a hash of the value; --apply --expect <reviewed dry-run report> reuses that report\'s FX rate and aborts before the first write unless its plan is identical, and --apply is refused unless applyReadiness.ok (mode "apply-refused").',
    `City: our city is kept when it is the official commune or its urban area (unité urbaine); otherwise the register commune is proposed. Website: ours is kept when it is on an official domain listed in the register (or Campus France catalogue for institutions not in the register).`,
    `New records: register universities not in our DB are created only when public, under the Ministry and listing ≥${CREATE_MIN_CF} English-taught degree programmes on Campus France; the others are listed in candidatesNotInDb.`,
  ];

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  // One file per run and mode (runId has second precision); 'wx' never overwrites an existing report — an apply report is
  // the only record of the previous values that --revert restores
  const reportPath = path.join(REPORT_DIR, `${RUN_ID}-${mode}.json`);
  const report = {
    summary, runId: RUN_ID, generatedAt: syncedAt, script: 'scripts/dataSync/franceSync.js',
    applyReadiness, ...(expectCheck ? { expectCheck } : {}), ...(expected ? { fxPinnedFrom: path.resolve(EXPECT) } : {}),
    sources: [...sources.entries()].map(([url, what]) => ({ url, what })), nationalFees: national,
    institutions, creates, changes, fees, valuesLeftNull: nulls, unverifiedFields, candidatesNotInDb, uncertainties, methodNotes,
    plan,
  };
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), { flag: 'wx' });
  } catch (err) {
    if (err.code === 'EEXIST') throw new Error(`report ${reportPath} already exists; refusing to overwrite it (nothing was written to the DB)`);
    throw err;
  }

  console.log(JSON.stringify({ ...summary, verificationProblems: errors.length, unmatchedDbRecords: unmatched.length, applyReadiness: { ok: applyReadiness.ok, problems: applyReadiness.problems.length, feeProposalsDropped: applyReadiness.feeProposalsDropped.length } }, null, 2));
  console.table(institutions.map((i) => ({ institution: (i.dbName || i.officialName || i.key).slice(0, 44), action: i.action, type: i.type || '', courses: i.courses ?? '', bachelorUSD: i.fee?.bachelorUSD ?? '', masterUSD: i.fee?.masterUSD ?? '' })));
  console.log(`full report: ${reportPath}`);

  if (mode === 'apply-refused') {
    if (expectCheck && !expectCheck.match) {
      console.error(`PLAN MISMATCH with ${EXPECT} (${expectCheck.differences.length} difference(s)); nothing was written:`);
      for (const d of expectCheck.differences.slice(0, 40)) console.error(`  - ${d}`);
    }
    if (!applyReadiness.ok) {
      console.error('INPUTS INCOMPLETE; nothing was written:');
      for (const p of applyReadiness.problems.slice(0, 40)) console.error(`  - ${p}`);
    }
    throw new Error(`--apply refused (see ${reportPath}); nothing was written`);
  }
  if (APPLY) {
    // The report is saved BEFORE the first write (applyStartedAt) and after every write, so a run that stops half-way can
    // still be reverted (--revert accepts it; every written record carries dataSource.runId).
    const col = db.collection('universities');
    const save = () => fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    let written = 0;
    report.applyStartedAt = new Date();
    save();
    try {
      for (const c of changes) {
        const set = {};
        const unset = {};
        for (const [k, val] of Object.entries(c.diff)) { if (val.to === undefined) unset[k] = ''; else set[k] = val.to; }
        set.updatedAt = new Date();
        await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
        c.writtenAt = new Date();
        written += 1;
        save();
      }
      for (const c of creates) {
        const d = { ...c.doc, _id: new mongoose.Types.ObjectId(c.id), country: france._id, createdAt: syncedAt, updatedAt: syncedAt };
        const clash = await col.findOne({ $or: [{ name: d.name, country: d.country, city: d.city }, { country: d.country, 'dataSource.uai': d.dataSource.uai }] });
        if (clash) { c.skipped = `a record with the same name/country/city or dataSource.uai exists (${clash._id})`; save(); continue; }
        await col.insertOne(d);
        c.inserted = true;
        c.writtenAt = new Date();
        save();
      }
      report.appliedAt = new Date();
    } catch (err) {
      report.applyError = `${err.message} (after ${written} of ${changes.length} updates and ${creates.filter((c) => c.inserted).length} creates); revert with --revert ${reportPath}`;
      throw err;
    } finally {
      save();
    }
    console.log(`APPLIED: ${written} updated/deactivated, ${creates.filter((c) => c.inserted).length} created (revert: --revert ${reportPath})`);
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.stack || err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
