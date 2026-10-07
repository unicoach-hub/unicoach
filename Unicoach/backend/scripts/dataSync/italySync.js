/**
 * Sync Italian universities with official sources (MUR open data + each university's own fee pages).
 *
 *   node scripts/dataSync/italySync.js                    # DRY RUN: fetch + match + report, writes nothing
 *   node scripts/dataSync/italySync.js --apply            # write the creates/updates/deactivations of this run
 *   node scripts/dataSync/italySync.js --revert <report.json>
 *
 * Options: --refresh (ignore the 7-day page cache), --no-scrapedo, --max-scrapedo <n> (default 8 per run),
 *          --assume-applied <report.json> (dry run only: overlay that report's updates/creates on the records in memory
 *          to see what a re-run after applying it would do; nothing is written).
 *
 * Sources (all official):
 *  - MUR / USTAT open data (Ministero dell'Università e della Ricerca, Ufficio Statistica e Studi), dataset "Metadati":
 *    "Atenei" (01_atenei.csv: every university, status, statale/non statale, type incl. telematica, seat city) and
 *    "Offerta formativa" (03_offertaformativa-corsidilaurea_*.csv: every degree course per university and academic year,
 *    with course type Laurea / Laurea Magistrale / Ciclo Unico and teaching language). The resource links are read from
 *    the national open-data catalogue (dati.gov.it, which harvests the USTAT CKAN) with the current editions as fallback.
 *  - USTAT dataset "Formazione Post Laurea": PhD enrolments per course (08_1-dottorati_iscritti_corso_*.csv) → "PhD" level,
 *    and the PhD programme list for the two Pisa "Scuole superiori" that award no first/second-cycle degree themselves.
 *  - USTAT portal page of each university (ustat.mur.gov.it/dati/didattica/italia/...): official name + "Sito web ateneo".
 *  - Each university's own fee page/regulation for non-EU students (HTML or PDF; PDF text is read with the fonts'
 *    ToUnicode maps). Values are kept only when every configured verbatim quote is found in the fetched page text at run
 *    time and each amount appears in a quote as a whole money figure next to a currency sign/word (deterministic check).
 *    If a page changes and a quote is no longer found, a Groq LLM fallback may suggest amounts: those are only REPORTED
 *    (llmCandidates) for a reviewed config update and are never written.
 *  - ECB EUR→USD reference rate via api.frankfurter.app (no fallback rate: if unavailable, USD fields are not proposed).
 *
 * Never deletes: duplicates get isActive:false. Ranking fields (rank, rankingNum, rankingSource) and admission
 * requirement fields are never touched on existing records. A record whose stored fee for one level cannot be replaced
 * by an official figure gets no fee fields at all (the website would otherwise show the unverified value as official);
 * the official figures are then listed in the report (feesNotProposed). Universities created by an earlier run are found
 * again by their USTAT code / official name / website domain and updated, never created twice. An --apply run saves its
 * report before the first write and after every write, so a run that stops half-way can still be reverted.
 * Reports and the page cache go to backend/reports/ (git-ignored), so re-runs do not spend scrape.do credits; scrape.do
 * is used only for hosts that block direct requests (the USTAT CKAN file host, and a few protected university pages).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');
const REFRESH = ARGS.includes('--refresh');
const NO_SCRAPEDO = ARGS.includes('--no-scrapedo');
const argValue = (flag) => { const i = ARGS.indexOf(flag); return i !== -1 ? ARGS[i + 1] : undefined; };
// a cold cache needs at most 8 scrape.do pages: 3 USTAT files + the 5 fee pages marked scrapeDo (Unimi, Turin, Pavia, 2 x Trento)
const MAX_SCRAPEDO = Number(argValue('--max-scrapedo') || 8);
const ASSUME_APPLIED = argValue('--assume-applied');
const SYNC_ID = 'italySync';
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const CACHE_DIR = path.join(REPORT_DIR, '.cache', 'italy');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const FX_URL = 'https://api.frankfurter.app/latest?from=EUR&to=USD';
const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const { SCRAPE_DO_TOKEN, GROQ_API_KEY } = process.env;
const RUN_ID = `italy-sync-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const PROVIDER = 'MUR/USTAT open data (atenei, offerta formativa, dottorati) + official university fee pages';
const COURSE_CAP = 150;
const COURSE_YEAR = '2025'; // USTAT "ANNO" 2025 = academic year 2025/26, the latest edition of the offerta formativa file
const counters = { directRequests: 0, scrapeDoRequests: 0, cacheHits: 0, groqCalls: 0 };
const fetchLog = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Official open-data resources (current editions; refreshed from the dati.gov.it catalogue at run time when possible)
const CATALOGUE = 'https://www.dati.gov.it/opendata/api/3/action/package_show?id=';
const USTAT_FALLBACK = {
  atenei: 'https://dati-ustat.mur.gov.it/dataset/bed0c71e-9f86-4a0f-a266-963b6f7bbbd2/resource/820aefe6-0662-4656-84ec-d8859a2a3b7e/download/01_atenei.csv',
  offerta: 'https://dati-ustat.mur.gov.it/dataset/bed0c71e-9f86-4a0f-a266-963b6f7bbbd2/resource/c0e63906-7190-4568-892b-0cf399f56071/download/03_offertaformativa-corsidilaurea_2010-2025.csv',
  phd: 'https://dati-ustat.mur.gov.it/dataset/99c3fde2-d329-4e43-9116-9c8917680061/resource/dc36643d-3f1c-47ea-9748-79c4f2f174e1/download/08_1-dottorati_iscritti_corso_dal2015-16.csv',
};
const USTAT_PORTAL = 'https://ustat.mur.gov.it/dati/didattica/italia/';

// ---------------------------------------------------------------- registry (DB record ↔ MUR/USTAT university) ----------
// code = USTAT COD_Ateneo, slug = USTAT portal page. Every value proposed from it is verified against the official files.
// create:true → not in our DB; created because it is an active, non-telematic university that offers at least one degree
// programme taught fully in English in 2025/26 (USTAT LINGUA = "Inglese"). en = English name, used only when it is found
// on the university's own English page (enUrl or homepage); otherwise the official USTAT name is used.
const REGISTRY = [
  { key: 'bergamo', code: '01601', slug: 'atenei-statali/bergamo', dbNames: ['University of Bergamo'] },
  { key: 'messina', code: '08301', slug: 'atenei-statali/messina', dbNames: ['University of Messina'] },
  { key: 'bolzano', code: '02101', slug: 'atenei-non-statali/bolzano', dbNames: ['Free University of Bozen-Bolzano'] },
  { key: 'marche', code: '04201', slug: 'atenei-statali/marche', dbNames: ['Marche Polytechnic University'] },
  { key: 'foggia', code: '07101', slug: 'atenei-statali/foggia', dbNames: ['University of Foggia'] },
  { key: 'sanraffaele', code: '01508', slug: 'atenei-non-statali/milano-san-raffaele', dbNames: ['Vita-Salute San Raffaele University'] },
  { key: 'parthenope', code: '06302', slug: 'atenei-statali/napoli-parthenope', dbNames: ['Parthenope University of Naples'] },
  { key: 'siena', code: '05201', slug: 'atenei-statali/siena', dbNames: ['University of Siena'] },
  { key: 'cagliari', code: '09201', slug: 'atenei-statali/cagliari', dbNames: ['University of Cagliari'] },
  { key: 'insubria', code: '01202', slug: 'atenei-statali/insubria', dbNames: ['University of Insubria'] },
  { key: 'ferrara', code: '03801', slug: 'atenei-statali/ferrara', dbNames: ['University of Ferrara'] },
  { key: 'sns', code: '05002', slug: 'atenei-statali/pisa-normale', dbNames: ['Scuola Normale Superiore di Pisa'], phdOnly: true },
  { key: 'link', code: '05817', slug: 'atenei-non-statali/roma-link-campus', dbNames: ['Link Campus University'] },
  { key: 'salerno', code: '06501', slug: 'atenei-statali/salerno', dbNames: ['University of Salerno'] },
  { key: 'udine', code: '03001', slug: 'atenei-statali/udine', dbNames: ['University of Udine'] },
  { key: 'calabria', code: '07801', slug: 'atenei-statali/calabria', dbNames: ['University of Calabria'] },
  { key: 'catania', code: '08701', slug: 'atenei-statali/catania', dbNames: ['University of Catania'] },
  { key: 'palermo', code: '08201', slug: 'atenei-statali/palermo', dbNames: ['University of Palermo'] },
  { key: 'perugia-stranieri', code: '05403', slug: 'atenei-statali/perugia-stranieri', dbNames: ['University for Foreigners of Perugia'] },
  { key: 'verona', code: '02301', slug: 'atenei-statali/verona', dbNames: ['University of Verona'] },
  { key: 'brescia', code: '01701', slug: 'atenei-statali/brescia', dbNames: ['University of Brescia'] },
  { key: 'perugia', code: '05401', slug: 'atenei-statali/perugia', dbNames: ['University of Perugia'] },
  { key: 'sassari', code: '09001', slug: 'atenei-statali/sassari', dbNames: ['University of Sassari'] },
  { key: 'santanna', code: '05003', slug: 'atenei-statali/pisa-s-anna', dbNames: ["Sant'Anna School of Advanced Studies"], phdOnly: true },
  { key: 'modena', code: '03601', slug: 'atenei-statali/modena-e-reggio-emilia', dbNames: ['University of Modena and Reggio Emilia'] },
  { key: 'laquila', code: '06601', slug: 'atenei-statali/l-aquila', dbNames: ["University of L'Aquila"] },
  { key: 'iuav', code: '02702', slug: 'atenei-statali/venezia-iuav', dbNames: ['IUAV University of Venice'] },
  { key: 'piemonte-orientale', code: '00201', slug: 'atenei-statali/piemonte-orientale', dbNames: ['University of Eastern Piedmont'] },
  { key: 'teramo', code: '06701', slug: 'atenei-statali/teramo', dbNames: ['University of Teramo'] },
  { key: 'siena-stranieri', code: '05202', slug: 'atenei-statali/siena-stranieri', dbNames: ['University for Foreigners of Siena'] },
  { key: 'polimi', code: '01502', slug: 'atenei-statali/milano-politecnico', dbNames: ['Politecnico di Milano'] },
  // Two records for the one university (USTAT 03701): the older record (official English name "Alma Mater Studiorum -
  // University of Bologna", working favicon logo) is kept, the later duplicate is hidden.
  { key: 'bologna', code: '03701', slug: 'atenei-statali/bologna', dbNames: ['Alma Mater Studiorum - University of Bologna', 'University of Bologna'], keepDbName: 'Alma Mater Studiorum - University of Bologna' },
  { key: 'sapienza', code: '05801', slug: 'atenei-statali/sapienza', dbNames: ['Sapienza University of Rome'] },
  { key: 'padova', code: '02801', slug: 'atenei-statali/padova', dbNames: ['University of Padua'] },
  { key: 'polito', code: '00102', slug: 'atenei-statali/torino-politecnico', dbNames: ['Polytechnic University of Turin'] },
  { key: 'unimi', code: '01501', slug: 'atenei-statali/milano', dbNames: ['University of Milan'] },
  { key: 'bocconi', code: '01503', slug: 'atenei-non-statali/milano-bocconi', dbNames: ['Bocconi University'] },
  { key: 'torino', code: '00101', slug: 'atenei-statali/torino', dbNames: ['University of Turin'] },
  { key: 'pisa', code: '05001', slug: 'atenei-statali/pisa', dbNames: ['University of Pisa'] },
  { key: 'trento', code: '02201', slug: 'atenei-statali/trento', dbNames: ['University of Trento'] },
  { key: 'federico2', code: '06301', slug: 'atenei-statali/napoli-federico-ii', dbNames: ['University of Naples Federico II'] },
  { key: 'firenze', code: '04801', slug: 'atenei-statali/firenze', dbNames: ['University of Florence'] },
  { key: 'genova', code: '01001', slug: 'atenei-statali/genova', dbNames: ['University of Genoa'] },
  { key: 'torvergata', code: '05802', slug: 'atenei-statali/roma-tor-vergata', dbNames: ['University of Rome Tor Vergata'] },
  { key: 'bicocca', code: '01509', slug: 'atenei-statali/milano-bicocca', dbNames: ['University of Milan-Bicocca'] },
  { key: 'romatre', code: '05807', slug: 'atenei-statali/roma-tre', dbNames: ['Roma Tre University'] },
  { key: 'pavia', code: '01801', slug: 'atenei-statali/pavia', dbNames: ['University of Pavia'] },
  { key: 'cafoscari', code: '02701', slug: 'atenei-statali/venezia-ca-foscari', dbNames: ["University of Venice Ca' Foscari"] },
  // ---- not in our DB: created
  { key: 'unisg', code: '00401', slug: 'atenei-non-statali/bra-scienze-gastronomiche', create: true, en: 'University of Gastronomic Sciences', city: 'Bra', enUrl: 'https://www.unisg.it/en/' },
  { key: 'cattolica', code: '01504', slug: 'atenei-non-statali/milano-cattolica', create: true, en: 'Università Cattolica del Sacro Cuore', city: 'Milan', cityCheck: 'MILANO', enUrl: 'https://international.unicatt.it/ucscinternational-admission-and-tuition-tuition-fees-and-scholarships-4480' },
  { key: 'iulm', code: '01505', slug: 'atenei-non-statali/milano-iulm', create: true, en: 'IULM University', city: 'Milan', cityCheck: 'MILANO', enUrl: 'https://www.iulm.it/en' },
  { key: 'humanitas', code: '01510', slug: 'atenei-non-statali/rozzano-mi-humanitas-university', create: true, en: 'Humanitas University', city: 'Pieve Emanuele' },
  { key: 'trieste', code: '03201', slug: 'atenei-statali/trieste', create: true, en: 'University of Trieste', city: 'Trieste', enUrl: 'https://portale.units.it/en' },
  { key: 'parma', code: '03401', slug: 'atenei-statali/parma', create: true, en: 'University of Parma', city: 'Parma', enUrl: 'https://en.unipr.it/' },
  { key: 'urbino', code: '04101', slug: 'atenei-statali/urbino-carlo-bo', create: true, en: 'University of Urbino Carlo Bo', city: 'Urbino', enUrl: 'https://www.uniurb.it/en' },
  { key: 'macerata', code: '04301', slug: 'atenei-statali/macerata', create: true, en: 'University of Macerata', city: 'Macerata', enUrl: 'https://www.unimc.it/en' },
  { key: 'camerino', code: '04302', slug: 'atenei-statali/camerino', create: true, en: 'University of Camerino', city: 'Camerino', enUrl: 'https://www.unicam.it/en' },
  { key: 'tuscia', code: '05601', slug: 'atenei-statali/tuscia', create: true, en: 'University of Tuscia', city: 'Viterbo', enUrl: 'https://www.unitus.it/en/' },
  { key: 'luiss', code: '05805', slug: 'atenei-non-statali/roma-luiss', create: true, en: 'Luiss Guido Carli University', city: 'Rome', cityCheck: 'ROMA', enUrl: 'https://www.luiss.it/en' },
  { key: 'foroitalico', code: '05806', slug: 'atenei-statali/roma-foro-italico', create: true, en: 'University of Rome Foro Italico', city: 'Rome', cityCheck: 'ROMA', enUrl: 'https://www.uniroma4.it/en/' },
  { key: 'campusbiomedico', code: '05808', slug: 'atenei-non-statali/roma-biomedico', create: true, en: 'Campus Bio-Medico University of Rome', city: 'Rome', cityCheck: 'ROMA', enUrl: 'https://www.unicampus.it/en/' },
  { key: 'cassino', code: '06001', slug: 'atenei-statali/cassino', create: true, en: 'University of Cassino and Southern Lazio', city: 'Cassino', enUrl: 'https://www.unicas.it/en/' },
  { key: 'sannio', code: '06201', slug: 'atenei-statali/sannio', create: true, en: 'University of Sannio', city: 'Benevento', enUrl: 'https://www.unisannio.it/en' },
  // MUR still lists the former domain unina2.it, which no longer serves the site; the current one is accepted only if its
  // page title names the institution
  { key: 'vanvitelli', code: '06306', slug: 'atenei-statali/napoli-ii', create: true, en: 'University of Campania Luigi Vanvitelli', city: 'Caserta', altWebsite: 'https://www.unicampania.it', altTitle: /Università degli studi della Campania Luigi Vanvitelli/i },
  { key: 'chieti', code: '06901', slug: 'atenei-statali/chieti-e-pescara', create: true, en: "G. d'Annunzio University of Chieti-Pescara", city: 'Chieti', enUrl: 'https://www.unich.it/en' },
  { key: 'molise', code: '07001', slug: 'atenei-statali/molise', create: true, en: 'University of Molise', city: 'Campobasso', enUrl: 'https://www.unimol.it/en/' },
  { key: 'bari', code: '07201', slug: 'atenei-statali/bari', create: true, en: 'University of Bari Aldo Moro', city: 'Bari', enUrl: 'https://www.uniba.it/en' },
  { key: 'poliba', code: '07202', slug: 'atenei-statali/bari-politecnico', create: true, en: 'Polytechnic University of Bari', city: 'Bari', enUrl: 'https://www.poliba.it/en' },
  { key: 'lum', code: '07203', slug: 'atenei-non-statali/casamassima-j-monnet', create: true, en: 'LUM University Giuseppe Degennaro', city: 'Casamassima', enUrl: 'https://www.lum.it/en/' },
  { key: 'salento', code: '07501', slug: 'atenei-statali/salento', create: true, en: 'University of Salento', city: 'Lecce', enUrl: 'https://www.unisalento.it/en' },
];

// ---------------------------------------------------------------- official fee sources (non-EU students) ----------
// Each entry: level 'bachelor' | 'master' | 'both'; amount in EUR per year; parts = components that must each appear
// in the quote(s) as a money figure (e.g. tuition + regional tax); every quote must be found verbatim in the fetched page
// text; extQuotes = further verbatim quotes on another official page of the same university ({ url, quote }).
// basis: 'max' (fees vary by income / country group / programme group: USD fields use the highest non-EU amount, i.e.
// what a non-EU student pays at most; basisLabel overrides the label) or 'median' (fees listed per programme).
// upTo = page states only a maximum. excluded = shown in the text/report but kept out of ranges and USD (medicine,
// programme-specific higher maximums, later-year penalties). Source year overrides the institution year; checks = extra
// verbatim quotes (year, last-modified date, exceptions) recorded as evidence (an unverified check is reported).
const SAPIENZA_ART39 = { url: 'https://www.uniroma1.it/it/content/tassa-regionale-il-diritto-allo-studio-e-imposta-di-bollo', quote: 'Oltre al contributo di iscrizione al corso, insieme alla prima rata devi versare: la tassa regionale a favore della Regione Lazio pari a 140 euro (se non rientri nei casi di esenzione); l’imposta di bollo da 16 euro' };
const BOLOGNA_FIXED = { url: 'https://www.unibo.it/en/study/enrolment-fees-and-other-procedures/degree-programmes/tuition-fees-and-exemptions/fees-and-exemptions-amounts-deadlines', quote: 'for an amount equal to the maximum all-inclusive contribution set for the programme you enrolled on, plus the fixed fee of €157.04' };
const UNINA_EXEMPT = 'e. stranieri (cittadinanza in Paesi extra UE): sono esonerati totalmente dal pagamento del contributo di iscrizione; devono versare solo la tassa regionale per il diritto allo studio';
const UNINA_STAMP = 'l’ imposta di bollo di 16 €';
const TORVERGATA_156 = 'Please note: an additional regional tax and a stamp duty (156,00 € in total) will be added to these amounts';
const TRENTO_GROUP_A = "Tuition fees for the first year are based on the students' admission score: 90 or more: exemption from tuition fees for the first year; 70-89: €1.000; 60-69: €2.000; 50-59: €4.500";
const TRENTO_GROUP_B = "Tuition fees for the first year are based on the students' admission score: 90 or more: exemption from tuition fees for the first year 70-89: €1.000 60-69: €3.000 50-59: €6.500";
const FEES = {
  padova: {
    year: '2026/27', basis: 'max', note: 'fixed all-inclusive fee for non-EU citizens not resident in Italy, by programme group',
    sources: [{ url: 'https://www.unipd.it/en/contribuzione-studentesca', entries: [
      { level: 'both', amount: 2790, label: 'Group A (Humanities)', quotes: ['All-inclusive fee for students with citizenship of countries not belonging to the European Union and not resident in Italy (A1) € 2790'] },
      { level: 'both', amount: 2990, label: 'Group B (Scientific + Primary Teacher Education)', quotes: ['All-inclusive fee for students with citizenship of countries not belonging to the European Union and not resident in Italy (B1) € 2990'] },
    ], yearQuote: 'academic year 2026/27' }],
  },
  bocconi: {
    year: '2026/27', basis: 'max', note: 'same fee for EU and non-EU students; first-year tuition and fees',
    sources: [
      { url: 'https://www.unibocconi.it/en/applying-bocconi/bachelor-and-law-programs/fees', entries: [
        { level: 'bachelor', amount: 17000, label: 'Bachelor of Science / Law programmes', quotes: ['For 2026-27 a.y., for students enrolled to their first year in a Bachelor of Science or Law programme, tuition and fees at Bocconi are set at € 17,000 per year'] },
      ] },
      { url: 'https://www.unibocconi.it/en/applying-bocconi/master-science-programs/fees', entries: [
        { level: 'master', amount: 18550, label: 'Master of Science programmes', quotes: ['For 2026-27 a.y., for students enrolled to their first year in a Master of Science programme, tuition and fees at Bocconi are set at € 18,550 per year'] },
      ] },
    ],
  },
  sapienza: {
    // Italian pages of the 2026-2027 student regulation (Art. 38 amounts, Art. 39 regional tax + stamp duty); the English
    // page still shows 2025/26 payment dates
    year: '2026/27', basis: 'max', note: 'fixed contribution for students whose income is produced abroad, by GDP (PPP) band of the country, plus EUR 140 regional tax and EUR 16 stamp duty',
    sources: [{
      url: 'https://www.uniroma1.it/it/content/importi-ordinari-dei-contributi-di-iscrizione',
      checks: [{ what: 'year (regulation the page belongs to)', url: 'https://www.uniroma1.it/it/pagina/regolamento-studenti', quote: 'per l’anno accademico 2026-2027' }, { what: 'year (payment dates on the page)', quote: 'entro il 5 novembre 2026' }],
      entries: [
        { level: 'both', amount: 456, parts: [300, 140, 16], label: 'Band (Fascia) A countries', quotes: ['Paesi in Fascia A Totale €300'], extQuotes: [SAPIENZA_ART39] },
        { level: 'both', amount: 856, parts: [700, 140, 16], label: 'Band (Fascia) B countries', quotes: ['Paesi in Fascia B Totale €700'], extQuotes: [SAPIENZA_ART39] },
        { level: 'both', amount: 1656, parts: [1500, 140, 16], label: 'Band (Fascia) C countries', quotes: ['Paesi in Fascia C Totale €1500'], extQuotes: [SAPIENZA_ART39] },
      ],
    }],
  },
  bologna: {
    // The reduced fixed fee applies only to nationals of listed non-OECD countries; every other non-EU student pays an
    // income-based fee up to the maximum contribution of the programme (official 2026/27 table), plus EUR 157.04
    year: '2026/27', basis: 'max', basisLabel: 'standard max.',
    note: 'reduced fixed fee (lower amount) for nationals of non-OECD countries whose family income is only abroad; other non-EU students pay an income-based fee up to the maximum contribution of the programme; all amounts incl. the EUR 157.04 first instalment',
    sources: [
      { url: 'https://www.unibo.it/en/study/enrolment-fees-and-other-procedures/degree-programmes/tuition-fees-and-exemptions/reduced-fixed-fee-for-citizens-of-particularly-poor-and-developing-countries-or-non-eu-non-oecd-countries',
        checks: [{ what: 'year', quote: '2026/27: Reduced fixed fee' }, { what: 'other students pay the maximum', quote: 'you will be charged the maximum tuition fee amount' }],
        entries: [
          { level: 'bachelor', amount: 1157.04, parts: [1000, 157.04], label: 'reduced fixed fee, nationals of non-OECD countries (first- or single-cycle)', quotes: ['Reduced fixed fee for nationals of non-OECD countries Requirements Enrolled on a first- or single-cycle degree programme Enrolled in second-cycle programmes If you are a freshman or have the minimum number of credits € 1,000 + €157.04 € 1,200 + €157.04'] },
          { level: 'master', amount: 1357.04, parts: [1200, 157.04], label: 'reduced fixed fee, nationals of non-OECD countries (second cycle)', quotes: ['Reduced fixed fee for nationals of non-OECD countries Requirements Enrolled on a first- or single-cycle degree programme Enrolled in second-cycle programmes If you are a freshman or have the minimum number of credits € 1,000 + €157.04 € 1,200 + €157.04'] },
        ] },
      { url: 'https://www.unibo.it/en/attachments/Tabellaimportimassimi2627.pdf/@@download/file/Tabella importi massimi 2026-2027.pdf', pdf: true,
        checks: [{ what: 'year', quote: 'Importo massimo di contributo onnicomprensivo A.A. 202 6 /202 7' }],
        entries: [
          { level: 'bachelor', amount: 2197.04, parts: [2040, 157.04], label: 'maximum contribution, first-cycle programmes (standard amount)', quotes: ['Corsi di primo ciclo: 2.040,00 €'], extQuotes: [BOLOGNA_FIXED] },
          { level: 'master', amount: 2707.04, parts: [2550, 157.04], label: 'maximum contribution, second-cycle programmes (standard amount)', quotes: ['Corsi di secondo ciclo: 2.550,00 €'], extQuotes: [BOLOGNA_FIXED] },
          { level: 'bachelor', amount: 2962.04, parts: [2805, 157.04], excluded: true, label: 'higher maximum of some programmes (e.g. Genomics)', quotes: ['GENOMICS 2.805,00 €'], extQuotes: [BOLOGNA_FIXED] },
          { level: 'master', amount: 4237.04, parts: [4080, 157.04], excluded: true, label: 'higher maximum of some programmes (e.g. International Management)', quotes: ['INTERNATIONAL MANAGEMENT 4.080,00 €'], extQuotes: [BOLOGNA_FIXED] },
        ] },
    ],
  },
  polimi: {
    year: '2026/27', basis: 'max', note: "income-based (ISEE / ISEEU parificato for income abroad); non-EU Master's students with a foreign Bachelor's pay the maximum",
    sources: [{ url: 'https://www.polimi.it/en/prospective-students/how-much-does-it-cost/laurea-laurea-magistrale-and-single-cycle-programmes', entries: [
      { level: 'bachelor', amount: 157.04, label: 'minimum (ISEE up to EUR 22,000)', quotes: ['For a standard study plan of between 46 and 74 ECTS and an ISEE of up to € 22,000, the amount is € 157.04 ; for a higher-value ISEE, the amount gradually increases up to a maximum of € 3,943.04'] },
      { level: 'bachelor', amount: 3943.04, label: 'maximum', quotes: ['For a standard study plan of between 46 and 74 ECTS and an ISEE of up to € 22,000, the amount is € 157.04 ; for a higher-value ISEE, the amount gradually increases up to a maximum of € 3,943.04'] },
      { level: 'master', amount: 3943.04, label: "non-EU Master's students with a first-level qualification obtained abroad pay the maximum", quotes: [
        'for a higher-value ISEE, the amount gradually increases up to a maximum of € 3,943.04',
        "International students belonging to the reserved non-EU category (i.e. not equivalent to Italian students), who are admitted to Master's programmes with a first-level qualification obtained abroad",
      ] },
    ], yearQuote: 'Second instalment of the 2026/2027 academic year' }],
  },
  unimi: {
    year: '2026/27', basis: 'max', note: 'fixed amount for students whose household income is abroad, by country group and tuition area (second instalment + EUR 146 first instalment)',
    sources: [{ url: 'https://www.unimi.it/en/study/bachelor-and-master-study/fees-and-how-pay-them/fees-2026/2027', scrapeDo: true, entries: [
      { level: 'both', amount: 346, parts: [200, 146], label: 'Group A, tuition area A', quotes: ['Country group Programmes under tuition area A Programmes under tuition area B Group A €200.00 €256.00 Group B €910.00 €1,164.00 Group C €3,204.00 €4,101.12', 'all students are required to pay 146 euros'] },
      { level: 'both', amount: 4247.12, parts: [4101.12, 146], label: 'Group C, tuition area B', quotes: ['Country group Programmes under tuition area A Programmes under tuition area B Group A €200.00 €256.00 Group B €910.00 €1,164.00 Group C €3,204.00 €4,101.12', 'all students are required to pay 146 euros'] },
    ], yearQuote: 'Students enrolled from the academic year 2026/2027' }],
  },
  pisa: {
    year: '2026/27', basis: 'max', note: 'maximum annual all-inclusive fee within the standard duration; reductions on application',
    sources: [{ url: 'https://www.unipi.it/en/education/registration/enrolment-and-registration/enrolment-for-international-students/university-fees-and-scholarships/', entries: [
      { level: 'both', amount: 2900, upTo: true, label: 'maximum annual all-inclusive fee', quotes: ['For the 2026-2027 academic year , the maximum annual all-inclusive tuition fee for students enrolled within the standard duration of their programme is €2,900'] },
    ] }],
  },
  trento: {
    year: '2026/27', basis: 'max', note: 'English-taught programmes, non-EU students living abroad: first-year fee set by the admission score (exemption at 90+), later years by credits earned',
    sources: [
      { url: 'https://www.unitn.it/en/study/fees-scholarships-accommodation/tuition-fees/non-eu-citizens/degree-programmes-english', scrapeDo: true, year: '2025/26',
        checks: [{ what: 'year', quote: 'Academic year 2025/2026' }, { what: "Bachelor's page (3-year programmes)", quote: 'Third year Tuition fees for the third year are based on the number of credits earned during the first and second year' }],
        entries: [
          { level: 'bachelor', amount: 0, label: 'first year, admission score 90 or more (exemption)', quotes: ["Tuition fees for the first year are based on the students' admission score: 90 or more: exemption from tuition fees; 70-89: €1.000; 60-69: €2.000; 50-59: €4.500"] },
          { level: 'bachelor', amount: 4500, label: 'first year, admission score 50-59', quotes: ["Tuition fees for the first year are based on the students' admission score: 90 or more: exemption from tuition fees; 70-89: €1.000; 60-69: €2.000; 50-59: €4.500"] },
          { level: 'bachelor', amount: 6000, excluded: true, label: 'later years with too few credits (maximum)', quotes: ['24 to 35 credits: €2.000; 6 to 23 credits: €4.500; less than 6 credits: €6.000'] },
        ] },
      { url: 'https://www.unitn.it/en/study/fees-scholarships-accommodation/tuition-fees/non-eu-citizens/masters-degrees-english', scrapeDo: true, year: '2026/27',
        checks: [{ what: 'year', quote: 'Fees amount for 2026-2027' }],
        entries: [
          { level: 'master', amount: 0, label: 'first year, admission score 90 or more (exemption)', quotes: [TRENTO_GROUP_A] },
          { level: 'master', amount: 4500, label: 'Group A programmes, first year, admission score 50-59', quotes: [TRENTO_GROUP_A] },
          { level: 'master', amount: 6500, label: 'Group B programmes (e.g. International Management, Computer Science, Artificial Intelligence Systems), first year, admission score 50-59', quotes: ['These tuition fees apply to the following degree programmes: MIM - International Management MAIN - Innovation Management Information and Communication Engineering Computer Science', TRENTO_GROUP_B] },
          { level: 'master', amount: 10000, excluded: true, label: 'Group B, second year with fewer than 6 credits (maximum)', quotes: ['6 to 23: €6.500 less than 6c redits: €10.000'] },
        ] },
    ],
  },
  torino: {
    year: '2026/27', basis: 'max', note: 'fixed contribution for students resident abroad, by GDP per capita PPP of the country of residence, incl. EUR 156 first instalment',
    sources: [{ url: 'https://en.unito.it/studying-unito/tuition-fees/tuition-fees-international-students', scrapeDo: true, entries: [
      { level: 'both', amount: 656, parts: [500, 156], label: 'GDP per capita PPP up to EUR 26,000', quotes: ['GDP per capita PPP less or equal to Euro 26,000.00 Euro 500.00', 'the first instalment must be added (€ 156.00'] },
      { level: 'both', amount: 1656, parts: [1500, 156], label: 'GDP per capita PPP above EUR 60,000', quotes: ['GDP per capita PPP more than Euro 60,000.00 Euro 1,500.00', 'the first instalment must be added (€ 156.00'] },
    ], yearQuote: 'for the academic year 2026-2027' }],
  },
  federico2: {
    // Official 2026/27 student guide (Guida all'iscrizione): non-EU citizens are fully exempt from the enrolment
    // contribution and pay only the regional tax (by band) and stamp duty. Replaces the undated international-office page.
    year: '2026/27', basis: 'max', note: 'non-EU citizens are fully exempt from the enrolment contribution and pay only the regional tax (EUR 130, 151 or 173 by band; EUR 151 for students whose family is resident abroad) and EUR 16 stamp duty',
    sources: [{ url: 'https://www.unina.it/documents/20117/4260320/Guida_Studente_rapidA_26-27_10.7.2026.pdf', pdf: true,
      checks: [{ what: 'year', quote: 'Anno accademico 202 6 - 2 7' }],
      entries: [
        { level: 'both', amount: 146, parts: [130, 16], label: 'lowest regional-tax band (ISEEU up to EUR 25,500 or particularly poor countries) + stamp duty', quotes: [UNINA_EXEMPT, '130,00 euro per coloro che presentano un valore ISEEU inferiore o pari a 25.500,00 euro e per gli studenti appartenenti ai Paesi particolarmente poveri', UNINA_STAMP] },
        { level: 'both', amount: 167, parts: [151, 16], label: 'family resident abroad (middle band) + stamp duty', quotes: [UNINA_EXEMPT, '151,00 euro per coloro che presentano un valore ISEEU compreso tra 25.500,01 euro e 51.000,00 euro e per gli studenti con nucleo familiare residente all’estero', UNINA_STAMP] },
        { level: 'both', amount: 189, parts: [173, 16], label: 'highest band (ISEEU above EUR 51,000 or no ISEEU) + stamp duty', quotes: [UNINA_EXEMPT, '173,00 euro per coloro che presentano un valore ISEEU superiore a 51.000,00 euro e per coloro che non presentano attestazione ISEEU', UNINA_STAMP] },
      ] }],
  },
  polito: {
    year: '2025/26', basis: 'max', note: 'non-EU students enrolled for the first time from 2025/26: fee proportioned to GDP (PPP) of the country of citizenship, between Tmin and Tmax',
    sources: [{ url: 'https://www.polito.it/sites/default/files/2025-10/ENG_Regolamento%20contribuz_immatricolati_post%20CDA_from25-26.pdf', pdf: true, entries: [
      { level: 'both', amount: 600, label: 'Tmin', quotes: ['the amount of the yearly comprehensive fee due may not be less than €600.00 ( Tmin) and more than €3,600.00 (Tmax)'] },
      { level: 'both', amount: 3600, label: 'Tmax', quotes: ['the amount of the yearly comprehensive fee due may not be less than €600.00 ( Tmin) and more than €3,600.00 (Tmax)'] },
    ] }],
  },
  cafoscari: {
    year: '2026/27', basis: 'max', note: 'non-EU flat fee by citizenship group, incl. EUR 192 regional tax and EUR 16 stamp duty; Digital Management and Hospitality Innovation and e-Tourism charge their own course contribution instead (not included)',
    sources: [{ url: 'https://www.unive.it/pag/50473/',
      checks: [
        { what: 'year', quote: 'Tuition fees for BA and MA degrees - a.y. 2026/2027' },
        { what: 'amounts include regional tax and stamp duty', quote: 'All the amounts indicated above include regional tax for the right to study of 192.00 EUR as well as 16 EUR in stamp duty' },
        { what: 'exception', quote: 'Exception is made for Digital Management and Hospitality Innovation and e-Tourism, for which students should pay the contribution related to the attended course' },
      ],
      entries: [
        { level: 'bachelor', amount: 2100, label: 'OECD citizenship', quotes: ['you are subject to a flat tax of: 2,100 EUR if you are enrolled in a Bachelor’s degree course'] },
        { level: 'master', amount: 2300, label: 'OECD citizenship', quotes: ['2,300 EUR if you are enrolled in a Master’s Degree course'] },
        { level: 'both', amount: 1300, label: 'other non-EU citizenship (not OECD, not low human development)', quotes: ['you are subject to a flat tax of 1,300 EUR for the 2026/2027 academic year'] },
      ] }],
  },
  pavia: {
    year: 'year not stated on page', basis: 'max', note: 'optional flat rate for non-EU citizens by citizenship and area of study (three brackets)',
    sources: [{ url: 'https://en.unipv.it/en/education/bachelors-and-masters-degree-programs/fees-and-funding/fees/prospective-students/non-eu-students', scrapeDo: true, entries: [
      { level: 'both', amount: 390, label: 'lowest bracket', quotes: ['It ranges from €390 to €4.550 per year'] },
      { level: 'both', amount: 4550, label: 'highest bracket', quotes: ['It ranges from €390 to €4.550 per year'] },
    ] }],
  },
  bolzano: {
    year: '2026/27', basis: 'max', approx: true, note: 'approximate yearly fee stated on the programme pages',
    sources: [
      { url: 'https://www.unibz.it/en/faculties/engineering/bachelor-computer-science', entries: [
        { level: 'bachelor', amount: 1200, label: 'Bachelor in Computer Science', quotes: ['Tuition fees: ca. € 1200 per year'] },
      ] },
      { url: 'https://www.unibz.it/en/faculties/engineering/master-computing-data-science', entries: [
        { level: 'master', amount: 1200, label: 'Master in Computing for Data Science', quotes: ['Tuition fees: ca. € 1200 per year'] },
      ] },
    ],
  },
  cattolica: {
    // Programme fee pages of the international site: the Bachelor's flat rate is the same on two different Bachelor's
    // programmes; the Master's page states the flat rate for all 2-year Master's students
    year: '2026/27', basis: 'max', note: "flat rate for students whose family income is produced outside the EU and associated states (English-taught programmes' fee pages)",
    sources: [
      { url: 'https://international.unicatt.it/ucscinternational-admission-and-tuition-tuition-fees-and-scholarships-4480', checks: [{ what: 'year', quote: 'Payment Deadlines for 2026/27' }], entries: [
        { level: 'bachelor', amount: 8800, label: "Bachelor's (page of the BA in International Relations and Global Affairs)", quotes: ['What is the tuition fee for Bachelor’s students with family income produced in non-EU countries? The tuition fee is a flat rate of € 8,800 per year'] },
      ] },
      { url: 'https://international.unicatt.it/ucscinternational-admission-and-tuition-tuition-fees-and-scholarships-psychology', checks: [{ what: 'year', quote: 'Payment Deadlines for 2026/27' }], entries: [
        { level: 'bachelor', amount: 8800, label: "Bachelor's (page of the BSc in Psychology)", quotes: ["If your family's income is produced outside the European Union and associated states , the tuition fee is a flat rate of € 8,800 per year"] },
      ] },
      { url: 'https://international.unicatt.it/ucscinternational-admission-and-tuition-tuition-fees-and-scholarships-6608', checks: [{ what: 'year', quote: 'Payment Deadlines for 2026/27' }], entries: [
        { level: 'master', amount: 9370, label: "2-year Master's (page of the MSc in Data Analytics for Business; stated for all 2-year Master's students)", quotes: ['For 2-year Masters students whose family income is produced in non-EU countries, the tuition fee is a flat rate of € 9,370 per year'] },
      ] },
    ],
  },
  torvergata: {
    // The page states no academic year; its footer gives the last modification date, which is written into the text
    year: 'year not stated; page last modified 17/06/2024', basis: 'max', note: 'yearly flat-tax contribution for non-EU students whose family income is abroad, incl. EUR 156 regional tax and stamp duty',
    sources: [{ url: 'https://web.uniroma2.it/en/contenuto/non-eu_students_whose_family_generates_an_income_abroad',
      checks: [{ what: 'last modified', quote: 'Modificato il : 17/06/2024' }],
      entries: [
        { level: 'both', amount: 1156, parts: [1000, 156], label: 'most degree courses', quotes: ['a2 . - 1,000.00 €, if enroled to any other degree course', TORVERGATA_156] },
        { level: 'both', amount: 2656, parts: [2500, 156], label: 'economics / business programmes, pharmacy, medicine', quotes: ['a1 . - 2,500.00 €, if enrolled in the following degree courses (independently from the country of origin) : M.Sc. in Business Administration', TORVERGATA_156] },
        { level: 'bachelor', amount: 4656, parts: [4500, 156], label: 'B.A. in Global Governance', quotes: ['4,500 €if enrolled in the following degree course (independently from the country of origin): B.A. in Global Governance', TORVERGATA_156] },
      ] }],
  },
  sanraffaele: {
    year: '2026/27', basis: 'median', note: 'annual tuition per programme (first-year students 2026/27)',
    sources: [{ url: 'https://www.unisr.it/en/servizi/tasse-contributi/corsi-di-laurea-triennale-e-magistrale', entries: [
      { level: 'master', amount: 7890, label: "Master's Degree in Biotechnology for Innovative Therapeutics", quotes: ['Master’s Degree in Biotechnology for Innovative Therapeutics How much is the annual tuition fee? € 7.890'] },
      { level: 'master', amount: 6690, label: "Master's Degree in Health Informatics", quotes: ['Master’s Degree in Health Informatics How much is the annual tuition fee? € 6,690'] },
      { level: 'master', amount: 20690, excluded: true, label: 'International Medical Doctor Program (single-cycle Medicine)', quotes: ['International Medical Doctor Program How much is the annual tuition fee? € 20,690'] },
    ] }],
  },
};
// Institutions whose fee pages were checked but give no fixed non-EU amount (fee only computed from an Italian ISEE/ISEEU
// at a CAF after arrival, or amounts only in a dynamic calculator): fees left unchanged/null, listed in the report.
const FEES_NOT_PUBLISHED = {
  genova: { url: 'https://unige.it/en/iscrizione-studenti-non-eu-residenti-estero-con-titolo-studio-non-italiano', why: 'page states fees are calculated from the ISEEU after arrival in Italy; no amount published' },
  bicocca: { url: 'https://apply.unimib.it/en_GB/contents/content/10-fees-and-funding', why: 'fixed international fee depends on country group and contribution area; the amounts are not in the page text (calculator)' },
  luiss: { url: 'https://www.luiss.it/en/courses-and-masters-programmes/undergraduate-school/economics-and-business', why: 'programme pages did not show a fee amount in the fetched page text' },
};

// ---------------------------------------------------------------- text helpers ----------
const squash = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = (s) => fold(s).toLowerCase().replace(/[^a-z0-9.]+/g, ' ').replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2')
  .replace(/\s+/g, ' ').trim();
const nameKey = (s) => fold(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
// Money figures written in a text: whole number tokens next to a currency sign/word ("€ 1,000", "1.000,00 €", "2,100 EUR",
// "146 euros", "Euro 500.00"), read with the thousands/decimal separators of the token ("7.890" = 7890, "156,00" = 156,
// "4,101.12" = 4101.12). Years, scores and other numbers without a currency next to them are ignored.
function moneyValues(text) {
  const s = String(text ?? '');
  const out = [];
  for (const m of s.matchAll(/\d+(?:[.,]\d+)*/g)) {
    const before = s.slice(Math.max(0, m.index - 8), m.index);
    const after = s.slice(m.index + m[0].length, m.index + m[0].length + 8);
    if (!/(€|\bEUR|\beuros?|\bEuro)\s*$/i.test(before) && !/^\s*(€|EUR\b|euros?\b)/i.test(after)) continue;
    const t = m[0];
    if (/^\d+$/.test(t)) { out.push(Number(t)); continue; }
    const p = t.match(/^(\d{1,3}(?:([.,])\d{3})*)(?:([.,])(\d{1,2}))?$/);
    if (!p || (p[2] && p[3] && p[2] === p[3])) continue;
    out.push(Number(p[1].replace(/[.,]/g, '')) + (p[4] ? Number(`0.${p[4]}`) : 0));
  }
  return out;
}
const eur =(n) => `EUR ${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const money = (n) => Math.round(n).toLocaleString('en-US');
const median = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const regDomain = (url) => {
  if (!url) return '';
  const host = String(url).trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
  return host.split('.').filter(Boolean).slice(-2).join('.');
};
const origin = (url) => {
  const u = String(url || '').trim();
  if (!u) return null;
  try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).origin.toLowerCase(); } catch (_) { return null; }
};
const titleCaseCity = (s) => squash(s).toLowerCase().replace(/(^|[\s'-])([a-zà-ù])/g, (m, a, b) => a + b.toUpperCase());

// Windows-1252 decoding (USTAT CSVs are cp1252; Node's TextDecoder treats it as latin1)
const CP1252 = { 0x80: '€', 0x82: '‚', 0x84: '„', 0x85: '…', 0x8a: 'Š', 0x8c: 'Œ', 0x8e: 'Ž', 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—', 0x99: '™', 0x9a: 'š', 0x9c: 'œ', 0x9e: 'ž', 0x9f: 'Ÿ' };
const decodeCp1252 = (buf) => buf.toString('latin1').replace(/[\x80-\x9f]/g, (c) => CP1252[c.charCodeAt(0)] || ' ');

// Semicolon CSV with quoted fields (a quoted field may contain a line break)
function parseCsv(text) {
  const src = text.replace(/^﻿/, '');
  const rows = [];
  let cells = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (q) {
      if (ch === '"' && src[i + 1] === '"') { cur += '"'; i += 1; } else if (ch === '"') q = false; else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ';') { cells.push(cur); cur = ''; } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      cells.push(cur);
      if (cells.some((c) => c.trim())) rows.push(cells);
      cells = [];
      cur = '';
    } else cur += ch;
  }
  cells.push(cur);
  if (cells.some((c) => c.trim())) rows.push(cells);
  const header = rows.shift().map((h) => h.trim());
  return { header, rows: rows.map((r) => Object.fromEntries(header.map((h, i) => [h, squash(r[i] ?? '')]))), malformed: rows.filter((r) => r.length !== header.length).length };
}

// Minimal PDF text extraction (Flate streams + Tj/TJ string operators, WinAnsi fonts). Text in Identity-H fonts is
// dropped, never guessed: a quote that cannot be read is simply not verified.
function decodePdfLiteral(s) {
  let out = '';
  for (let i = 0; i < s.length; i += 1) {
    let ch = s[i];
    if (ch === '\\') {
      const nx = s[i + 1];
      if (/[0-7]/.test(nx)) {
        const oct = s.slice(i + 1, i + 4).match(/^[0-7]{1,3}/)[0];
        i += oct.length;
        const code = parseInt(oct, 8);
        ch = CP1252[code] || (code < 32 ? ' ' : String.fromCharCode(code));
      } else {
        i += 1;
        ch = { n: ' ', r: ' ', t: ' ', b: '', f: '' }[nx] ?? nx;
      }
    } else {
      const code = ch.charCodeAt(0);
      if (CP1252[code]) ch = CP1252[code];
      else if (code < 32) ch = ' ';
    }
    out += ch;
  }
  return out;
}
function pdfToText(buf) {
  const s = buf.toString('latin1');
  const parts = [];
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(s))) {
    const start = m.index + m[0].length;
    const end = s.indexOf('endstream', start);
    if (end < 0) break;
    let data;
    try { data = zlib.inflateSync(buf.subarray(start, end)).toString('latin1'); } catch (_) { continue; }
    if (!/T[Jj]/.test(data)) continue;
    const segs = [];
    for (const t of data.matchAll(/\[((?:[^\]\\]|\\.)*)\]\s*TJ|\(((?:[^)\\]|\\.)*)\)\s*Tj/g)) {
      if (t[1] !== undefined) {
        let str = '';
        for (const x of t[1].matchAll(/\(((?:[^)\\]|\\.)*)\)|(-?\d+(?:\.\d+)?)/g)) {
          if (x[1] !== undefined) str += decodePdfLiteral(x[1]);
          else if (Number(x[2]) < -150) str += ' ';
        }
        segs.push(str);
      } else segs.push(decodePdfLiteral(t[2]));
    }
    parts.push(segs.join(' '));
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// PDF text read page by page with each font's ToUnicode CMap (Type0 / Identity-H fonts included, e.g. the amount columns
// of fee tables), objects inside object streams included. A character code without a CMap entry is dropped, never
// guessed; a CID font without ToUnicode yields no text.
function pdfObjects(s, buf) {
  const objs = new Map();
  const re = /(\d+)\s+0\s+obj\b/g;
  let m;
  while ((m = re.exec(s))) {
    const end = s.indexOf('endobj', re.lastIndex);
    if (end < 0) break;
    objs.set(Number(m[1]), { start: re.lastIndex, end });
  }
  for (const [, o] of [...objs]) {
    const head = s.slice(o.start, Math.min(o.end, o.start + 400));
    if (!/\/Type\s*\/ObjStm/.test(head)) continue;
    const k = head.search(/stream\r?\n/);
    const first = Number((head.match(/\/First\s+(\d+)/) || [])[1]);
    const cnt = Number((head.match(/\/N\s+(\d+)/) || [])[1]);
    if (k < 0 || !first || !cnt) continue;
    const st = o.start + k + head.slice(k).match(/stream\r?\n/)[0].length;
    let data;
    try { data = zlib.inflateSync(buf.subarray(st, s.lastIndexOf('endstream', o.end))).toString('latin1'); } catch (_) { continue; }
    const nums = data.slice(0, first).trim().split(/\s+/).map(Number);
    for (let i = 0; i < cnt; i += 1) {
      const a = first + nums[2 * i + 1];
      const b = i + 1 < cnt ? first + nums[2 * i + 3] : data.length;
      if (!objs.has(nums[2 * i])) objs.set(nums[2 * i], { text: data.slice(a, b) });
    }
  }
  return objs;
}
function pdfToTextCmap(buf) {
  const s = buf.toString('latin1');
  const objs = pdfObjects(s, buf);
  const body = (n) => { const o = objs.get(n); return !o ? '' : o.text !== undefined ? o.text : s.slice(o.start, o.end); };
  const streamOf = (n) => {
    const o = objs.get(n);
    if (!o || o.text !== undefined) return null;
    const b = s.slice(o.start, o.end);
    const k = b.search(/stream\r?\n/);
    if (k < 0) return null;
    const raw = buf.subarray(o.start + k + b.slice(k).match(/stream\r?\n/)[0].length, s.lastIndexOf('endstream', o.end));
    if (/\/FlateDecode/.test(b.slice(0, k))) { try { return zlib.inflateSync(raw).toString('latin1'); } catch (_) { return null; } }
    return /\/Filter/.test(b.slice(0, k)) ? null : raw.toString('latin1');
  };
  const utf16 = (hex) => { let out = ''; for (let i = 0; i + 4 <= hex.length; i += 4) out += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16)); return out; };
  const fonts = new Map();
  const fontOf = (n) => {
    if (fonts.has(n)) return fonts.get(n);
    const d = body(n);
    const f = { map: null, bytes: /\/Subtype\s*\/Type0/.test(d) ? 2 : 1 };
    const tu = d.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    const cm = tu ? streamOf(Number(tu[1])) : null;
    if (cm) {
      f.map = new Map();
      for (const blk of cm.matchAll(/beginbfchar([^]*?)endbfchar/g)) {
        for (const p of blk[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/g)) f.map.set(parseInt(p[1], 16), utf16(p[2]));
      }
      for (const blk of cm.matchAll(/beginbfrange([^]*?)endbfrange/g)) {
        for (const p of blk[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(?:<([0-9A-Fa-f]*)>|\[([^\]]*)\])/g)) {
          const lo = parseInt(p[1], 16);
          const hi = parseInt(p[2], 16);
          if (hi - lo > 5000) continue;
          if (p[3] !== undefined) {
            const base = utf16(p[3]);
            for (let c = lo; c <= hi; c += 1) f.map.set(c, base.slice(0, -1) + String.fromCharCode(base.charCodeAt(base.length - 1) + (c - lo)));
          } else [...p[4].matchAll(/<([0-9A-Fa-f]*)>/g)].forEach((x, i) => f.map.set(lo + i, utf16(x[1])));
        }
      }
    }
    fonts.set(n, f);
    return f;
  };
  const resourcesOf = (n, depth = 0) => {
    const d = body(n);
    const ref = d.match(/\/Resources\s+(\d+)\s+0\s+R/);
    if (ref) return body(Number(ref[1]));
    const k = d.search(/\/Resources\s*<</);
    if (k >= 0) {
      const i = d.indexOf('<<', k);
      let lvl = 0;
      let j = i;
      for (; j < d.length; j += 1) {
        if (d.startsWith('<<', j)) { lvl += 1; j += 1; } else if (d.startsWith('>>', j)) { lvl -= 1; j += 1; if (!lvl) break; }
      }
      return d.slice(i, j + 1);
    }
    const parent = d.match(/\/Parent\s+(\d+)\s+0\s+R/);
    return parent && depth < 10 ? resourcesOf(Number(parent[1]), depth + 1) : '';
  };
  const fontDict = (res) => {
    const out = {};
    const inline = res.match(/\/Font\s*<<([^>]*)>>/);
    let txt = inline ? inline[1] : null;
    if (!txt) { const r = res.match(/\/Font\s+(\d+)\s+0\s+R/); if (r) txt = body(Number(r[1])); }
    if (txt) for (const p of txt.matchAll(/\/([^\s/<>[\]()]+)\s+(\d+)\s+0\s+R/g)) out[p[1]] = Number(p[2]);
    return out;
  };
  const decodeStr = (bytes, font) => {
    let out = '';
    if (font && font.map) {
      for (let i = 0; i + font.bytes <= bytes.length; i += font.bytes) {
        const u = font.map.get(font.bytes === 2 ? (bytes.charCodeAt(i) << 8) | bytes.charCodeAt(i + 1) : bytes.charCodeAt(i));
        if (u !== undefined) out += u;
      }
      return out;
    }
    if (font && font.bytes === 2) return '';
    for (const ch of bytes) { const c = ch.charCodeAt(0); out += CP1252[c] || (c < 32 ? ' ' : ch); }
    return out;
  };
  const unescape = (lit) => {
    let out = '';
    for (let i = 0; i < lit.length; i += 1) {
      if (lit[i] !== '\\') { out += lit[i]; continue; }
      const nx = lit[i + 1];
      if (/[0-7]/.test(nx)) { const oct = lit.slice(i + 1, i + 4).match(/^[0-7]{1,3}/)[0]; out += String.fromCharCode(parseInt(oct, 8) & 255); i += oct.length; } else { out += { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '\r': '', '\n': '' }[nx] ?? nx; i += 1; }
    }
    return out;
  };
  const hexBytes = (h) => { const x = h.replace(/[^0-9A-Fa-f]/g, ''); let out = ''; for (let i = 0; i < x.length; i += 2) out += String.fromCharCode(parseInt((x.slice(i, i + 2) + '0').slice(0, 2), 16)); return out; };
  const runContent = (content, fmap) => {
    const segs = [];
    const stack = [];
    let font = null;
    let i = 0;
    const n = content.length;
    while (i < n) {
      const ch = content[i];
      if (ch === '(') {
        let lvl = 1;
        let j = i + 1;
        let lit = '';
        while (j < n) {
          const c = content[j];
          if (c === '\\') { lit += c + content[j + 1]; j += 2; continue; }
          if (c === '(') lvl += 1; else if (c === ')') { lvl -= 1; if (!lvl) break; }
          lit += c;
          j += 1;
        }
        stack.push({ str: unescape(lit) });
        i = j + 1;
      } else if (ch === '<' && content[i + 1] !== '<') {
        const j = content.indexOf('>', i);
        stack.push({ str: hexBytes(content.slice(i + 1, j < 0 ? n : j)) });
        i = j < 0 ? n : j + 1;
      } else if (ch === '<' || ch === '>') i += 2;
      else if (ch === '[') { stack.push({ mark: true }); i += 1; } else if (ch === ']') {
        const arr = [];
        while (stack.length && !stack[stack.length - 1].mark) arr.unshift(stack.pop());
        stack.pop();
        stack.push({ arr });
        i += 1;
      } else if (ch === '%') { while (i < n && content[i] !== '\n' && content[i] !== '\r') i += 1; } else if (/\s/.test(ch)) i += 1;
      else {
        const m = content.slice(i, i + 64).match(/^(\/[^\s/<>[\]()%{}]*|[-+]?\d*\.?\d+|[A-Za-z'"*0-9]+|[{}])/);
        if (!m) { i += 1; continue; }
        const tok = m[1];
        i += tok.length;
        if (tok[0] === '/') { stack.push({ name: tok.slice(1) }); continue; }
        if (/^[-+]?\d*\.?\d+$/.test(tok)) { stack.push({ num: Number(tok) }); continue; }
        if (tok === 'Tf') { const nm = stack[stack.length - 2]; font = nm && nm.name && fmap[nm.name] !== undefined ? fontOf(fmap[nm.name]) : null; } else if (tok === 'Tj' || tok === "'" || tok === '"') {
          const t = stack[stack.length - 1];
          if (t && t.str !== undefined) segs.push(decodeStr(t.str, font));
        } else if (tok === 'TJ') {
          const t = stack[stack.length - 1];
          if (t && t.arr) segs.push(t.arr.map((el) => (el.str !== undefined ? decodeStr(el.str, font) : el.num !== undefined && el.num < -150 ? ' ' : '')).join(''));
        } else if (tok === 'BI') { const e = content.indexOf('EI', i); i = e < 0 ? n : e + 2; }
        stack.length = 0;
      }
    }
    return segs.join(' ');
  };
  const parts = [];
  for (const p of [...objs.keys()].filter((k) => /\/Type\s*\/Page(?![s\w])/.test(body(k).slice(0, 3000)))) {
    const cont = body(p).match(/\/Contents\s*(?:\[([^\]]*)\]|(\d+)\s+0\s+R)/);
    if (!cont) continue;
    const refs = cont[1] ? [...cont[1].matchAll(/(\d+)\s+0\s+R/g)].map((x) => Number(x[1])) : [Number(cont[2])];
    parts.push(runContent(refs.map((r) => streamOf(r) || '').join('\n'), fontDict(resourcesOf(p))));
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// Visible text of a fetched page (HTML or PDF), memoised. A PDF is read twice (fonts' ToUnicode maps; plain WinAnsi
// strings); a quote is found when it is in either text.
function textOf(page) {
  if (page._text === undefined) {
    const isPdf = /pdf/i.test(page.contentType || '') || page.buf.subarray(0, 4).toString() === '%PDF';
    page._norms = [];
    if (isPdf) {
      let cmapText = '';
      try { cmapText = pdfToTextCmap(page.buf); } catch (_) { cmapText = ''; }
      const plain = pdfToText(page.buf);
      page._text = cmapText || plain;
      if (cmapText && plain) page._norms.push(norm(plain));
    } else {
      const $ = cheerio.load(page.buf.toString('utf8').replace(/>/g, '> '));
      page._title = squash($('title').first().text());
      $('head,script,style,noscript,svg,iframe').remove();
      page._text = squash($.root().text());
    }
    page._norm = norm(page._text);
    page._norms.unshift(page._norm);
  }
  return page._text;
}
const titleOf = (page) => { textOf(page); return page._title || ''; };
const inPage = (page, quote) => { textOf(page); return Boolean(quote) && page._norms.some((t) => t.includes(norm(quote))); };

// ---------------------------------------------------------------- HTTP with cache + scrape.do fallback ----------
const isBlocked = (status, buf) => {
  const head = buf ? buf.subarray(0, 20000).toString('utf8') : '';
  return [403, 405, 429, 503].includes(status) || /<title>\s*(Just a moment|Attention Required|Human Verification)/i.test(head);
};

async function getPage(url, { scrapeDo = false } = {}) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${crypto.createHash('sha1').update(url).digest('hex')}.json`);
  if (!REFRESH && fs.existsSync(file)) {
    const c = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Date.now() - new Date(c.fetchedAt).getTime() < CACHE_TTL_MS) {
      counters.cacheHits += 1;
      fetchLog.push({ url, via: `cache (${c.via}, ${c.fetchedAt})` });
      return { ...c, buf: Buffer.from(c.bodyB64, 'base64') };
    }
  }
  let status = 0;
  let buf = Buffer.alloc(0);
  let finalUrl = url;
  let contentType = '';
  let via = 'direct';
  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml,application/pdf,text/csv,application/json;q=0.9,*/*;q=0.8', 'Accept-Language': 'en,it;q=0.8' },
        redirect: 'follow', signal: AbortSignal.timeout(60000),
      });
      counters.directRequests += 1;
      status = res.status;
      finalUrl = res.url || url;
      contentType = res.headers.get('content-type') || '';
      buf = Buffer.from(await res.arrayBuffer());
      break;
    } catch (err) {
      lastError = err.cause?.code || err.name || err.message;
      if (attempt < 2) await sleep(1500);
    }
  }
  if (!status || isBlocked(status, buf)) {
    const why = status ? `HTTP ${status}` : `no connection (${lastError})`;
    if (!scrapeDo || NO_SCRAPEDO) throw new Error(`${url}: direct request failed (${why})`);
    if (!SCRAPE_DO_TOKEN) throw new Error('SCRAPE_DO_TOKEN missing in .env');
    if (counters.scrapeDoRequests >= MAX_SCRAPEDO) throw new Error(`scrape.do budget for this run (${MAX_SCRAPEDO}) reached before ${url}`);
    counters.scrapeDoRequests += 1;
    try {
      const res = await fetch(`https://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(180000) });
      status = res.status;
      contentType = res.headers.get('content-type') || '';
      buf = Buffer.from(await res.arrayBuffer());
    } catch (err) {
      throw new Error(`scrape.do request failed for ${url} (${err.cause?.code || 'network error'})`); // never echo the API URL (token)
    }
    via = 'scrape.do';
    finalUrl = url;
    if (isBlocked(status, buf)) throw new Error(`${url} still blocked via scrape.do (HTTP ${status})`);
  }
  if (status < 200 || status >= 300) throw new Error(`HTTP ${status} for ${url}`);
  const entry = { url, finalUrl, via, status, contentType, fetchedAt: new Date().toISOString(), bodyB64: buf.toString('base64') };
  fs.writeFileSync(file, JSON.stringify(entry));
  fetchLog.push({ url, via, status });
  return { ...entry, buf };
}

async function eurToUsd() {
  let lastError = '';
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(FX_URL, { headers: { 'User-Agent': BROWSER_UA }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
      const j = await res.json();
      if (j?.rates?.USD) return { base: 'EUR', quote: 'USD', rate: j.rates.USD, date: j.date, source: 'ECB reference rate via api.frankfurter.app', url: FX_URL, servedBy: res.url };
      lastError = 'no EUR→USD rate in response';
    } catch (err) { lastError = err.cause?.code || err.message; }
    await sleep(2000 * attempt);
  }
  throw new Error(`frankfurter.app: ${lastError}`);
}

// ---------------------------------------------------------------- USTAT open data ----------
async function resourceUrls(uncertainties) {
  const out = { ...USTAT_FALLBACK, catalogue: {} };
  try {
    const meta = await getPage(`${CATALOGUE}metadati`);
    const res = JSON.parse(meta.buf.toString('utf8')).result.resources;
    const atenei = res.find((r) => /^Atenei$/i.test(squash(r.name)));
    const offerte = res.filter((r) => /^Offerta formativa (\d{4})-(\d{4})$/i.test(squash(r.name)))
      .sort((a, b) => Number(squash(b.name).slice(-4)) - Number(squash(a.name).slice(-4)));
    if (atenei) out.atenei = atenei.url;
    if (offerte[0]) out.offerta = offerte[0].url;
    out.catalogue.metadati = { url: `${CATALOGUE}metadati`, atenei: atenei?.name, offerta: offerte[0]?.name, modified: offerte[0]?.last_modified || offerte[0]?.created };
  } catch (err) { uncertainties.push(`dati.gov.it catalogue (metadati) not readable (${err.message}); current USTAT file links used`); }
  try {
    const pl = await getPage(`${CATALOGUE}formazione-post-laurea`);
    const res = JSON.parse(pl.buf.toString('utf8')).result.resources;
    const phd = res.find((r) => /dottorati_iscritti_corso_dal/i.test(r.url));
    if (phd) out.phd = phd.url;
    out.catalogue.postLaurea = { url: `${CATALOGUE}formazione-post-laurea`, phd: phd?.name };
  } catch (err) { uncertainties.push(`dati.gov.it catalogue (formazione-post-laurea) not readable (${err.message}); current USTAT file link used`); }
  return out;
}

async function loadUstat(urls) {
  const at = await getPage(urls.atenei, { scrapeDo: true });
  const atenei = parseCsv(at.buf.toString('utf8'));
  const of = await getPage(urls.offerta, { scrapeDo: true });
  const offerta = parseCsv(decodeCp1252(of.buf));
  const ph = await getPage(urls.phd, { scrapeDo: true });
  const phd = parseCsv(decodeCp1252(ph.buf));
  return { atenei, offerta, phd, via: { atenei: at.via, offerta: of.via, phd: ph.via } };
}

async function ustatPortal(slug) {
  const url = USTAT_PORTAL + slug;
  const page = await getPage(url);
  const $ = cheerio.load(page.buf.toString('utf8'));
  const site = squash($('a[title="Sito web ateneo"]').attr('href'));
  const heading = $('h1,h2').map((_, e) => squash($(e).text())).get().find((t) => t && !/Ministero|Portale/i.test(t)) || null;
  return { url, page, website: site || null, heading };
}

// ---------------------------------------------------------------- courses ----------
function cleanCourse(raw) {
  let t = String(raw || '').replace(/&#\d+;?/g, '').replace(/[​-‍﻿]/g, '').replace(/^"+|"+$/g, '');
  t = t.replace(/\s+REPLICA(?:\b|_).*$/i, ''); // same course replicated at another seat
  t = t.replace(/\s*\((?:abilitante|abilitanti)[^)]*\)/gi, '');
  t = squash(t).replace(/\s*[-–]\s*$/, '');
  if (t === t.toUpperCase() && /[A-Z]{4}/.test(t)) {
    // ALL CAPS in the source → sentence case, keeping short parenthesised acronyms
    t = t.toLowerCase().replace(/\(([a-z&.\s]{2,12})\)/g, (m, a) => `(${a.toUpperCase()})`);
  }
  return t.charAt(0).toUpperCase() + t.slice(1);
}
const COURSE_LEVEL = { Laurea: "Bachelor's", 'Laurea Magistrale': "Master's", 'Laurea Magistrale Ciclo Unico': "Master's" };
const KIND_ORDER = { 'Laurea Magistrale': 0, 'Laurea Magistrale Ciclo Unico': 1, Laurea: 2 };
const langRank = (l) => (l === 'Inglese' ? 0 : /Inglese/.test(l) ? 1 : 2);

function buildCourses(rows) {
  const sorted = [...rows].sort((a, b) => langRank(a.LINGUA) - langRank(b.LINGUA) || (KIND_ORDER[a.TipoCorso] ?? 9) - (KIND_ORDER[b.TipoCorso] ?? 9)
    || cleanCourse(a.Corso).localeCompare(cleanCourse(b.Corso)));
  const seen = new Set();
  const list = [];
  for (const r of sorted) {
    const name = cleanCourse(r.Corso);
    const k = nameKey(name);
    if (!name || seen.has(k)) continue;
    seen.add(k);
    list.push({ name, kind: r.TipoCorso, lang: r.LINGUA, classe: r.Classe });
  }
  const levels = new Set(rows.map((r) => COURSE_LEVEL[r.TipoCorso]).filter(Boolean));
  return {
    courses: list.slice(0, COURSE_CAP).map((c) => c.name),
    totalDistinct: list.length,
    englishTaught: list.filter((c) => c.lang === 'Inglese').length,
    partlyEnglish: list.filter((c) => /Inglese/.test(c.lang) && c.lang !== 'Inglese').length,
    byKind: Object.fromEntries(Object.keys(KIND_ORDER).map((k) => [k, rows.filter((r) => r.TipoCorso === k).length])),
    levels,
    sample: list.slice(0, 5),
  };
}
// PhD names in the USTAT file are lower case: sentence case, "PhD" restored, codes/qualifiers in brackets dropped
const sentence = (s) => {
  const t = squash(String(s).replace(/\[[^\]]*\]|\([^)]*\)/g, ' ')).replace(/\s+\/\s+/g, ' / ').replace(/[\s,;.-]+$/, '');
  return (t.charAt(0).toUpperCase() + t.slice(1)).replace(/^Phd\b/, 'PhD');
};
const LEVEL_ORDER = ["Bachelor's", "Master's", 'PhD'];

// ---------------------------------------------------------------- fees ----------
// Every quote must be verbatim on its page (extQuotes: on another page of the same university); every amount part must be
// a whole money figure in one of the quotes (see moneyValues), and the parts must add up to the amount.
function verifyEntry(page, e, ext = {}) {
  const extQ = e.extQuotes || [];
  const quotes = [
    ...e.quotes.map((q) => ({ url: page.url, quote: q, found: inPage(page, q) })),
    ...extQ.map((x) => {
      const p = ext[x.url];
      return { url: x.url, quote: x.quote, found: Boolean(p && !p.error && inPage(p, x.quote)), ...(p && p.error ? { error: p.error } : {}) };
    }),
  ];
  const values = moneyValues([...e.quotes, ...extQ.map((x) => x.quote)].join(' | '));
  const parts = e.parts || [e.amount];
  const sum = parts.reduce((a, b) => a + Number(b), 0);
  const amountsOk = Math.abs(sum - Number(e.amount)) < 0.005
    && parts.every((p) => Number(p) === 0 || values.some((v) => Math.abs(v - Number(p)) < 0.005));
  const zeroOk = e.amount !== 0 || e.quotes.some((q) => /exemption|exempt|free/i.test(q));
  return { ok: quotes.every((q) => q.found) && amountsOk && zeroOk, quotes, amountsOk, zeroOk };
}

// Groq fallback: only when a configured quote is no longer on the page (page changed). The rows it returns are only
// REPORTED as candidates (with a check of their quote and amount) for a reviewed update of FEES; they are never written.
const LLM_PLAUSIBLE_EUR = [50, 60000];
async function llmFees(uniName, page) {
  if (!GROQ_API_KEY) return [];
  const full = textOf(page);
  const first = full.search(/(non[- ]?EU|international|foreign|abroad)[^€]{0,300}€\s?\d/i);
  const text = full.slice(Math.max(0, first - 500), Math.max(0, first - 500) + 16000);
  const prompt = `You read an official Italian university web page about tuition fees.
University: ${uniName}
Page URL: ${page.url}
Wanted: the yearly fee amounts that apply to NON-EU students (fixed fees, flat rates, or the minimum/maximum of the range).
Return ONLY JSON: {"rows":[{"level":"bachelor"|"master"|"both","amountEUR":number,"label":string,"quote":string}]}
quote = a short contiguous snippet (max 30 words) copied EXACTLY from the page text that contains the amount. At most 12 rows.

PAGE TEXT:
${text}`;
  for (const model of GROQ_MODELS) {
    let res = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      counters.groqCalls += 1;
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
      }).catch(() => null);
      if (!res || res.status !== 429) break;
      const hint = (await res.text()).match(/try again in ([\d.]+)(ms|s)/);
      const wait = hint ? Number(hint[1]) / (hint[2] === 'ms' ? 1000 : 1) : 20;
      await sleep(Math.min(60, wait + 2) * 1000);
    }
    if (!res || !res.ok) continue;
    let data;
    try { data = JSON.parse((await res.json()).choices[0].message.content); } catch (_) { continue; }
    return (data.rows || []).filter((r) => ['bachelor', 'master', 'both'].includes(r.level) && Number(r.amountEUR) > 0).map((r) => {
      const e = { level: r.level, amount: Number(r.amountEUR), label: `${squash(r.label)} (LLM-extracted, ${model})`, quotes: [squash(r.quote)], llm: model };
      const v = verifyEntry(page, e);
      const plausible = e.amount >= LLM_PLAUSIBLE_EUR[0] && e.amount <= LLM_PLAUSIBLE_EUR[1];
      return { ...e, quoteFound: v.quotes[0].found, amountInQuote: v.amountsOk, plausible, written: false, note: 'LLM suggestion only: not used for any field; review and add it to FEES with its verbatim quote' };
    });
  }
  return [];
}

async function collectFees(key, uniName) {
  const cfg = FEES[key];
  if (!cfg) return null;
  const out = {
    year: cfg.year, basis: cfg.basis, basisLabel: cfg.basisLabel || (cfg.basis === 'median' ? 'median' : 'max.'), note: cfg.note,
    approx: Boolean(cfg.approx), sources: [], entries: [], errors: [], checks: [], llmCandidates: [],
  };
  for (const src of cfg.sources) {
    const s = { url: src.url, year: src.year || cfg.year, entries: [], via: null };
    out.sources.push(s);
    let page;
    try { page = await getPage(src.url, { scrapeDo: Boolean(src.scrapeDo) }); } catch (err) { s.error = err.message; out.errors.push(err.message); continue; }
    s.via = page.via;
    s.finalUrl = page.finalUrl;
    s.title = titleOf(page) || null;
    // other official pages of the same university that the quotes / checks of this source rely on
    const ext = {};
    const extUrls = new Set([...src.entries.flatMap((e) => (e.extQuotes || []).map((x) => x.url)), ...(src.checks || []).map((c) => c.url).filter(Boolean)]);
    for (const u of extUrls) {
      try { ext[u] = await getPage(u); } catch (err) { ext[u] = { error: err.message }; out.errors.push(err.message); }
    }
    const checks = [...(src.checks || []), ...(src.yearQuote ? [{ what: 'year', quote: src.yearQuote }] : [])];
    s.checks = checks.map((c) => {
      const p = c.url ? ext[c.url] : page;
      return { what: c.what, url: c.url || src.url, quote: c.quote, verified: Boolean(p && !p.error && inPage(p, c.quote)) };
    });
    out.checks.push(...s.checks);
    let failed = 0;
    for (const e of src.entries) {
      const v = verifyEntry(page, e, ext);
      const row = { ...e, url: src.url, year: s.year, verified: v.ok, quoteCheck: v.quotes, ...(v.ok ? {} : { amountsOk: v.amountsOk, zeroOk: v.zeroOk }) };
      if (!row.verified) failed += 1;
      s.entries.push(row);
    }
    if (failed && GROQ_API_KEY) {
      const llm = await llmFees(uniName, page);
      s.llmCandidates = llm.length;
      out.llmCandidates.push(...llm.map((r) => ({ ...r, url: src.url })));
    }
    out.entries.push(...s.entries);
  }
  const summary = (level) => {
    const rows = out.entries.filter((e) => e.verified && !e.excluded && (e.level === level || e.level === 'both'));
    if (!rows.length) return null;
    const vals = rows.map((e) => e.amount);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return {
      n: rows.length, min, max, median: median(vals), upTo: rows.every((e) => e.upTo), basisValue: cfg.basis === 'median' ? median(vals) : max,
      year: [...new Set(rows.map((e) => e.year))].join(' / '),
      rows: rows.map((e) => ({ amountEUR: e.amount, ...(e.parts ? { partsEUR: e.parts } : {}), label: e.label, year: e.year, url: e.url, quotes: e.quotes, ...(e.extQuotes ? { extQuotes: e.extQuotes } : {}) })),
    };
  };
  out.bachelor = summary('bachelor');
  out.master = summary('master');
  out.excludedFromRange = out.entries.filter((e) => e.excluded && e.verified).map((e) => ({ level: e.level, label: e.label, amountEUR: e.amount, url: e.url }));
  out.unverified = out.entries.filter((e) => !e.verified).map((e) => ({ level: e.level, label: e.label, amountEUR: e.amount, url: e.url, quoteCheck: e.quoteCheck, amountsOk: e.amountsOk }));
  out.unverifiedChecks = out.checks.filter((c) => !c.verified);
  return out;
}

const range = (s) => (s.upTo ? `up to ${eur(s.max)}` : s.min === s.max ? eur(s.min) : `${eur(s.min)}–${Number(s.max).toLocaleString('en-US', { maximumFractionDigits: 2 })}`);
const LEVEL_NAME = { bachelor: "Bachelor's", master: "Master's", both: "Bachelor's & Master's" };

// Display text + USD fields from the verified rows. USD = basis value (max. or median) of each level; ranges, years,
// approximations and the amounts kept out of the ranges are written into the text.
function feeProposal(f, fx, name) {
  const out = {};
  if (f.master) out.graduateTuitionUSD = Math.round(f.master.basisValue * fx.rate);
  if (f.bachelor) out.tuitionFeeUSD = Math.round(f.bachelor.basisValue * fx.rate);
  const levels = [f.master, f.bachelor].filter(Boolean);
  const oneYear = levels.every((x) => x.year === levels[0].year);
  const yr = (x) => (oneYear ? '' : ` (${x.year})`);
  const same = f.bachelor && f.master && oneYear && f.bachelor.min === f.master.min && f.bachelor.max === f.master.max && f.bachelor.upTo === f.master.upTo;
  const ranges = same ? [`Bachelor's & Master's ${range(f.bachelor)}`]
    : [...(f.master ? [`Master's ${range(f.master)}${yr(f.master)}`] : []), ...(f.bachelor ? [`Bachelor's ${range(f.bachelor)}${yr(f.bachelor)}`] : [])];
  const usd = [...(f.master ? [`Master's ${f.basisLabel} ≈ US$${money(out.graduateTuitionUSD)}`] : []), ...(f.bachelor ? [`Bachelor's ${f.basisLabel} ≈ US$${money(out.tuitionFeeUSD)}`] : [])];
  const excl = f.excludedFromRange.length ? `; not in the range: ${f.excludedFromRange.map((e) => `${LEVEL_NAME[e.level]} ${e.label} ${eur(e.amountEUR)}`).join(', ')}` : '';
  const pages = new Set(levels.flatMap((x) => x.rows.map((r) => r.url))).size;
  out.tuition = `${ranges.join(' · ')} per year (non-EU${oneYear ? `, ${levels[0].year}` : ''}${f.approx ? ', approx.' : ''}; ${f.note}; ${usd.join(', ')}${excl}) — official ${name} fee page${pages > 1 ? 's' : ''}`;
  return out;
}

// ---------------------------------------------------------------- revert ----------
async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  // An apply run saves applyStartedAt before its first write, so a run that stopped half-way is revertible too
  if (report.summary?.mode !== 'apply' || !(report.appliedAt || report.applyStartedAt)) {
    console.error(`REFUSED: ${reportFile} is a dry-run report (nothing was written by that run). Pass the report of an --apply run.`);
    process.exit(1);
  }
  if (!/^italy-sync-\d{14}$/.test(String(report.runId || ''))) {
    console.error(`REFUSED: ${reportFile} has no italySync runId.`);
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  let restored = 0;
  // Only records still carrying this run's runId are restored (a later run's write is not undone)
  for (const c of report.changes || []) {
    const set = {};
    const unset = {};
    for (const [k, v] of Object.entries(c.diff)) {
      if (v.from === undefined || (v.from === null && k === 'dataSource')) unset[k] = ''; else set[k] = v.from;
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    if (!Object.keys(update).length) continue;
    const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id), 'dataSource.runId': report.runId }, update);
    restored += r.modifiedCount;
  }
  // Records created by this run are hidden (isActive:false), never deleted. Found by runId + createdBySync, so a create
  // whose insertedId never reached the report (run stopped right after the insert) is hidden as well.
  const r = await col.updateMany({ 'dataSource.runId': report.runId, 'dataSource.createdBySync': SYNC_ID, isActive: { $ne: false } }, { $set: { isActive: false } });
  const hidden = r.modifiedCount;
  console.log(`REVERTED: ${restored} records restored, ${hidden} created records hidden (isActive:false) from ${reportFile}`);
  await mongoose.disconnect();
}

// ---------------------------------------------------------------- main ----------
(async () => {
  const revertIdx = ARGS.indexOf('--revert');
  if (revertIdx !== -1) return revert(ARGS[revertIdx + 1]);
  console.log(`MUR/USTAT + university fee pages → Italian universities (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);
  const uncertainties = [];
  const nulls = [];

  let fx = null;
  try { fx = await eurToUsd(); } catch (err) { uncertainties.push(`FX rate unavailable (${err.message}); USD fields not proposed`); }
  console.log(`  EUR→USD ${fx ? `${fx.rate} (${fx.date})` : 'n/a'}`);

  // 1) Official open data
  const urls = await resourceUrls(uncertainties);
  const ustat = await loadUstat(urls);
  const ateneoByCode = new Map(ustat.atenei.rows.map((a) => [a.COD_Ateneo, a]));
  const courseYear = ustat.offerta.rows.filter((r) => r.ANNO === COURSE_YEAR);
  const latestCourseYear = Math.max(...ustat.offerta.rows.map((r) => Number(r.ANNO) || 0));
  if (String(latestCourseYear) !== COURSE_YEAR) uncertainties.push(`USTAT offerta formativa now has year ${latestCourseYear}; this run still uses ${COURSE_YEAR} — update COURSE_YEAR`);
  const coursesOf = (a) => courseYear.filter((r) => nameKey(r.Ateneo) === nameKey(a.NomeOperativo));
  const phdYear = [...new Set(ustat.phd.rows.map((r) => r.AnnoA))].sort().pop();
  const phdRowsOf = (code) => ustat.phd.rows.filter((r) => r.AnnoA === phdYear && Number(r.AteneoCOD) === Number(code) && Number(r.Isc) > 0);
  console.log(`  USTAT atenei: ${ustat.atenei.rows.length}; degree courses ${COURSE_YEAR}/${Number(COURSE_YEAR) + 1 - 2000}: ${courseYear.length}; PhD rows ${phdYear}: ${ustat.phd.rows.filter((r) => r.AnnoA === phdYear).length}`);

  // 2) DB (read-only here)
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const italy = await db.collection('countries').findOne({ name: 'Italy' });
  if (!italy) throw new Error('Country "Italy" not found');
  const ours = await db.collection('universities').find({ country: italy._id }).toArray();
  console.log(`  our Italy records: ${ours.length}`);
  // --assume-applied <report.json> (dry run only): overlay that report's updates and creates on the records IN MEMORY,
  // to check what a re-run after an --apply of it would do (expected: no creates, no further writes). Nothing is written.
  if (ASSUME_APPLIED) {
    if (APPLY) throw new Error('--assume-applied is a dry-run check and cannot be combined with --apply');
    const prev = JSON.parse(fs.readFileSync(path.resolve(ASSUME_APPLIED), 'utf8'));
    for (const c of prev.changes || []) {
      const u = ours.find((x) => String(x._id) === String(c.id));
      if (u) for (const [k, v] of Object.entries(c.diff)) u[k] = JSON.parse(JSON.stringify(v.to ?? null));
    }
    for (const c of prev.creates || []) ours.push({ ...JSON.parse(JSON.stringify(c.doc)), _id: new mongoose.Types.ObjectId(c.id), country: italy._id, createdAt: new Date(prev.generatedAt) });
    uncertainties.push(`SIMULATION: records overlaid in memory with the updates and creates of ${path.basename(ASSUME_APPLIED)} (--assume-applied); this report shows what a re-run after applying it would do`);
    console.log(`  --assume-applied ${path.basename(ASSUME_APPLIED)}: ${(prev.changes || []).length} updates and ${(prev.creates || []).length} creates overlaid in memory`);
  }
  // A registry entry's records: its listed DB names, plus any record an earlier run of this script tagged with the same
  // USTAT code (dataSource.ustatCode). A record named by one entry's dbNames belongs to that entry only.
  const ustatOf = (u) => String(u?.dataSource?.ustatCode || '');
  const claimed = new Map();
  for (const e of REGISTRY) for (const u of ours) if ((e.dbNames || []).includes(u.name)) claimed.set(String(u._id), e.key);
  const free = (u, key) => !claimed.has(String(u._id)) || claimed.get(String(u._id)) === key;
  const findDb = (entry) => ours.filter((u) => (entry.dbNames || []).includes(u.name) || (ustatOf(u) === entry.code && free(u, entry.key)));
  // A university to create may already be in the DB (created by an earlier --apply, or added since): it is recognised by
  // its USTAT code, its English or official name, or its website domain, and is then updated instead of created again
  const createMatchKeys = (entry, a, website) => ({
    names: [...new Set([entry.en, squash(String(a.NomeEsteso).replace(/"/g, ''))].filter(Boolean).map(nameKey))],
    domains: [...new Set([website.listed, website.proposed, entry.altWebsite].filter(Boolean).map(regDomain).filter(Boolean))],
  });
  const findExistingForCreate = (entry, keys) => ours.filter((u) => free(u, entry.key)
    && (ustatOf(u) === entry.code || keys.names.includes(nameKey(u.name)) || (u.website && keys.domains.includes(regDomain(u.website)))));
  const createdBySyncOf = (u) => (u?.dataSource?.createdBySync === SYNC_ID ? { sync: SYNC_ID, runId: u.dataSource.runId }
    : u?.dataSource?.originallyCreatedBy?.sync === SYNC_ID ? u.dataSource.originallyCreatedBy : null);
  const FEE_FIELDS = ['tuition', 'tuitionFeeUSD', 'graduateTuitionUSD'];
  const matchedIds = new Set();

  // 3) Per institution
  const syncedAt = new Date();
  const changes = [];
  const creates = [];
  const institutions = [];
  const feeReport = {};
  const feesNotProposed = [];
  const fieldsKeptFromEarlierSync = [];
  const feeOfficialIds = new Set();
  const feeBlockedIds = new Set();
  for (const entry of REGISTRY) {
    const a = ateneoByCode.get(entry.code);
    let docs = findDb(entry);
    const row = { key: entry.key, ustatCode: entry.code, dbRecords: docs.map((d) => d.name), decision: null };
    institutions.push(row);
    process.stdout.write(`  · ${docs[0]?.name || entry.en || entry.key} … `);
    if (!a || a.Status !== 'A') {
      docs.forEach((d) => matchedIds.add(String(d._id)));
      row.decision = 'no change (not an active university in the USTAT list)';
      uncertainties.push(`${entry.key}: USTAT code ${entry.code} ${a ? `has status ${a.Status}` : 'not found'}; nothing proposed`);
      console.log(row.decision);
      continue;
    }
    const officialName = squash(a.NomeEsteso);
    row.officialName = officialName;
    const type = a.StataleLibera === 'S' ? 'PUBLIC' : a.StataleLibera === 'L' ? 'PRIVATE' : null;
    const typeEvidence = { url: urls.atenei, quote: `${a.COD_Ateneo};${a.NomeEsteso};${a.NomeOperativo};${a.Status};${a.Descrizione};${a.StataleLibera}`, meaning: 'StataleLibera S = statale (state university) → PUBLIC, L = non statale (legally recognised non-state university) → PRIVATE' };

    // USTAT portal page → official website, followed to its current domain
    let portal = null;
    try { portal = await ustatPortal(entry.slug); } catch (err) { uncertainties.push(`${officialName}: USTAT portal page not readable (${err.message})`); }
    const listed = origin(portal?.website);
    const website = { listed, proposed: listed, portalUrl: portal?.url || null };
    let home = null;
    if (listed) {
      try {
        home = await getPage(`${listed}/`);
        website.finalUrl = home.finalUrl;
        website.title = titleOf(home);
        website.proposed = origin(home.finalUrl); // current scheme/host after redirects
      } catch (err) { website.check = `homepage not reachable directly (${err.message}); MUR-listed website kept`; }
    }
    if (!home && entry.altWebsite) {
      try {
        const alt = await getPage(`${entry.altWebsite}/`);
        const title = titleOf(alt);
        if (entry.altTitle.test(title)) {
          home = alt;
          website.check = `MUR-listed ${listed} does not load (${website.check}); the university's current site ${entry.altWebsite} was used because its title names the institution`;
          website.proposed = origin(alt.finalUrl);
          website.finalUrl = alt.finalUrl;
          website.title = title;
        }
      } catch (err) { website.check = `${website.check || ''}; ${entry.altWebsite}: ${err.message}`; }
    }

    // A university to create that is already in the DB → update it instead
    let matchKeys = null;
    if (entry.create) {
      matchKeys = createMatchKeys(entry, a, website);
      if (!docs.length) docs = findExistingForCreate(entry, matchKeys);
      if (docs.length) {
        row.dbRecords = docs.map((d) => d.name);
        row.createMatchedExisting = docs.map((d) => ({ id: String(d._id), name: d.name, website: d.website || null, ustatCode: ustatOf(d) || null, createdBy: createdBySyncOf(d) }));
      }
    }
    docs.forEach((d) => matchedIds.add(String(d._id)));
    let keepDocs = docs;
    if (docs.length > 1) {
      keepDocs = entry.keepDbName ? docs.filter((d) => d.name === entry.keepDbName)
        : [...docs].sort((x, y) => new Date(x.createdAt || 0) - new Date(y.createdAt || 0)).slice(0, 1);
    }
    const doc0 = keepDocs[0] || null;
    const willCreate = Boolean(entry.create && !docs.length);

    // Name of a university to create: the English name only when it is found on the university's own website, else the
    // official Italian name (MUR/USTAT)
    let createName = null;
    let nameEvidence = null;
    if (willCreate) {
      createName = squash(officialName.replace(/"/g, ''));
      nameEvidence = { source: 'USTAT NomeEsteso', url: urls.atenei, quote: officialName };
      if (entry.en) {
        const pagesToCheck = [];
        if (entry.enUrl) { try { pagesToCheck.push(await getPage(entry.enUrl)); } catch (err) { nameEvidence.enCheck = `${entry.enUrl}: ${err.message}`; } }
        if (home) pagesToCheck.push(home);
        const hit = pagesToCheck.find((p) => inPage(p, entry.en) || norm(titleOf(p)).includes(norm(entry.en)));
        if (hit) { createName = entry.en; nameEvidence = { source: "university's own website (English name)", url: hit.finalUrl || hit.url, quote: entry.en, verified: true, officialItalianName: officialName }; } else nameEvidence.enNameNotFound = entry.en;
      }
    }

    // Courses (USTAT offerta formativa) and PhD
    const cRows = coursesOf(a);
    const built = buildCourses(cRows);
    const phdRows = phdRowsOf(a.COD_Ateneo);
    const levels = new Set(built.levels);
    if (phdRows.length) levels.add('PhD');
    let courses = built.courses;
    let courseSource = { url: urls.offerta, academicYear: `${COURSE_YEAR}/${Number(COURSE_YEAR) + 1}`, ustatAteneo: a.NomeOperativo, rows: cRows.length, distinctCourses: built.totalDistinct, kept: courses.length, englishTaught: built.englishTaught, partlyEnglish: built.partlyEnglish, byKind: built.byKind, sample: built.sample };
    if (!courses.length && entry.phdOnly && phdRows.length) {
      const seen = new Set();
      courses = phdRows.map((r) => sentence(r.CorsoNOME)).filter((n) => { const k = nameKey(n); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, COURSE_CAP);
      courseSource = { url: urls.phd, academicYear: phdYear, ustatAteneo: a.NomeOperativo, note: 'no first/second-cycle degree courses under this institution in the USTAT offerta formativa; its PhD programmes (enrolments > 0) are listed instead', kept: courses.length, sample: courses.slice(0, 5) };
    }
    const degreeLevels = LEVEL_ORDER.filter((l) => levels.has(l));

    // Fees
    const name = doc0?.name || createName || officialName;
    const f = await collectFees(entry.key, name);
    if (f) feeReport[entry.key] = f;
    const proposed = {};
    if (courses.length) { proposed.courses = courses; proposed.degreeLevels = degreeLevels; }
    const feeUrls = f ? [...new Set(f.entries.filter((e) => e.verified && !e.excluded).flatMap((e) => [e.url, ...(e.extQuotes || []).map((x) => x.url)]))] : [];
    const feeYear = f ? [...new Set([f.bachelor?.year, f.master?.year].filter(Boolean))].join(' / ') : null;
    let feeBlocked = null;
    if (f && fx && (f.bachelor || f.master)) {
      const fp = feeProposal(f, fx, name);
      // A level without an official figure must not leave an unverified value in its USD field: once dataSource.fields
      // names any fee field, the website shows both USD fields and the text as official (frontend hasOfficialFee)
      const blocked = [];
      if (doc0 && fp.tuitionFeeUSD == null && Number(doc0.tuitionFeeUSD) > 0) blocked.push(`no official Bachelor's figure, and the unverified tuitionFeeUSD ${doc0.tuitionFeeUSD} would then be shown as official`);
      if (doc0 && fp.graduateTuitionUSD == null && Number(doc0.graduateTuitionUSD) > 0) blocked.push(`no official Master's figure, and the unverified graduateTuitionUSD ${doc0.graduateTuitionUSD} would then be shown as official`);
      if (blocked.length) {
        feeBlocked = blocked.join('; ');
        feeBlockedIds.add(String(doc0._id));
        feesNotProposed.push({
          name: doc0.name, ustatCode: a.COD_Ateneo, reason: feeBlocked,
          officialFiguresNotWritten: { tuition: fp.tuition, tuitionFeeUSD: fp.tuitionFeeUSD ?? null, graduateTuitionUSD: fp.graduateTuitionUSD ?? null, sources: feeUrls },
          keptUnchanged: { tuition: doc0.tuition ?? null, tuitionFeeUSD: doc0.tuitionFeeUSD ?? null, graduateTuitionUSD: doc0.graduateTuitionUSD ?? null },
        });
        uncertainties.push(`${doc0.name}: official fee rows found but no fee field proposed (${feeBlocked}); existing values left unchanged (official figures in feesNotProposed)`);
      } else {
        Object.assign(proposed, fp);
        if (doc0) feeOfficialIds.add(String(doc0._id));
      }
    }
    const missingFee = [];
    const missingWhy = (lvl) => FEES_NOT_PUBLISHED[entry.key]?.why || (feeBlocked ? `official figures found but not written (${feeBlocked})`
      : f ? (f.errors.join('; ') || `no verified ${lvl} amount on the configured official page(s)`) : 'no official non-EU fee page configured/verified in this run');
    if (proposed.tuitionFeeUSD == null) missingFee.push(`tuitionFeeUSD (Bachelor's): ${missingWhy("Bachelor's")}`);
    if (proposed.graduateTuitionUSD == null) missingFee.push(`graduateTuitionUSD (Master's): ${missingWhy("Master's")}`);
    if (f && f.unverified.length) uncertainties.push(`${name}: ${f.unverified.length} configured fee row(s) not verified this run (quote not found on the page, or amount not a money figure in the quote) — those amounts were dropped`);
    if (f && f.errors.length) uncertainties.push(`${name}: fee source failed (${f.errors.join('; ')})`);
    if (f && f.unverifiedChecks.length) uncertainties.push(`${name}: fee page check(s) not found this run: ${f.unverifiedChecks.map((c) => `${c.what} "${c.quote}" (${c.url})`).join('; ')}`);
    if (f && f.llmCandidates.length) uncertainties.push(`${name}: ${f.llmCandidates.length} LLM-suggested fee row(s) in fees.${entry.key}.llmCandidates — NOT written; review them and update FEES with verbatim quotes`);

    row.website = website.proposed;
    row.type = type;
    row.courses = courses.length;
    row.englishTaught = built.englishTaught;
    row.degreeLevels = degreeLevels;
    row.fees = proposed.tuition || null;
    row.feesUSD = { bachelorUSD: proposed.tuitionFeeUSD ?? null, masterUSD: proposed.graduateTuitionUSD ?? null };
    row.feeSource = FEES_NOT_PUBLISHED[entry.key] ? [FEES_NOT_PUBLISHED[entry.key].url] : feeUrls;
    if (feeBlocked) row.feesNotProposed = feeBlocked;

    const evidence = [
      { what: 'MUR/USTAT list of universities (01_atenei.csv)', ...typeEvidence },
      ...(portal ? [{ what: 'USTAT portal page: official name + "Sito web ateneo"', url: portal.url, quote: `${portal.heading} — Sito web ateneo ${portal.website}`, verified: Boolean(portal.website) }] : []),
      ...(website.title
        ? [{ what: 'official website check (homepage loads)', url: listed, quote: `${website.finalUrl} — ${website.title}`, verified: true, ...(website.check ? { note: website.check } : {}) }]
        : [{ what: 'official website check', url: listed, quote: website.check || null, verified: false }]),
      { what: 'courses', ...courseSource },
      ...(phdRows.length ? [{ what: 'PhD level (USTAT dottorati, enrolments per course)', url: urls.phd, academicYear: phdYear, phdCourses: phdRows.length, sample: phdRows.slice(0, 3).map((r) => `${r.AnnoA};${r.AteneoCOD};${r.AteneoNOME};${r.CorsoTIPO};${r.CorsoNOME};${r.Isc}`) }] : []),
      ...(f ? [{
        what: 'tuition (non-EU)', year: feeYear, basis: f.basis, basisLabel: f.basisLabel, fx, bachelor: f.bachelor, master: f.master, excludedFromRange: f.excludedFromRange, checks: f.checks,
        ...(feeBlocked ? { notWritten: feeBlocked } : {}),
        sources: f.sources.map((s) => ({ url: s.url, year: s.year, via: s.via, title: s.title, error: s.error, llmCandidates: s.llmCandidates })),
      }] : []),
    ];

    // --- create (missing university)
    if (willCreate) {
      const cityOk = entry.city && new RegExp(`\\b${fold(entry.cityCheck || entry.city).toUpperCase()}\\b`).test(fold(a.CITTA).toUpperCase());
      if (!cityOk) uncertainties.push(`${officialName}: city "${entry.city}" not confirmed by USTAT seat "${a.CITTA}"`);
      const city = cityOk ? entry.city : titleCaseCity(a.CITTA);
      const site = website.proposed;
      if (!website.title) uncertainties.push(`${createName}: website ${site} is the one MUR lists, but it could not be loaded directly in this run (${website.check})`);
      if (nameEvidence.source === 'USTAT NomeEsteso') uncertainties.push(`${createName}: created under its official Italian name (MUR/USTAT); the English name "${entry.en}" was not found on its own website in this run`);
      const fields = ['name', 'city', 'type', 'description', ...(site ? ['website'] : []), ...Object.keys(proposed)];
      const id = new mongoose.Types.ObjectId();
      const kind = a.Descrizione === 'Politecnico' ? 'polytechnic university' : 'university';
      const doc = {
        _id: String(id), name: createName, country: String(italy._id), city, website: site,
        logo: site ? `https://www.google.com/s2/favicons?domain=${site.replace(/^https?:\/\//, '')}&sz=128` : null,
        type,
        description: `${createName}${nameKey(createName) === nameKey(officialName) ? '' : ` (${officialName.replace(/"/g, '')})`} is a${type === 'PUBLIC' ? ' state' : ' legally recognised non-state'} ${kind} in ${city}, Italy, listed by the Italian Ministry of University and Research (MUR). In ${COURSE_YEAR}/${Number(COURSE_YEAR) + 1 - 2000} it offered ${built.totalDistinct} degree programmes, ${built.englishTaught} of them taught in English (MUR/USTAT open data).`,
        eligibility: null, categoryTags: [],
        tuition: proposed.tuition ?? null, tuitionFeeUSD: proposed.tuitionFeeUSD ?? null, graduateTuitionUSD: proposed.graduateTuitionUSD ?? null,
        // schema defaults would invent these — set explicitly to "unknown"
        minGpaPercent: null, minIeltsScore: null, minGreScore: null, greRequired: null, acceptanceRate: null,
        minScore: null, ieltsScore: null, greExam: null, workExp: null, scholarshipAvailable: null, rankingNum: null,
        courses: proposed.courses || [], degreeLevels: proposed.degreeLevels || [],
        isActive: true,
        dataSource: {
          provider: PROVIDER, runId: RUN_ID, createdBySync: SYNC_ID, ustatCode: a.COD_Ateneo,
          urls: [...new Set([urls.atenei, portal?.url, urls.offerta, phdRows.length ? urls.phd : null, ...(proposed.tuition ? feeUrls : [])].filter(Boolean))],
          syncedAt, fields, ...(proposed.tuition ? { fx, feeYear, feeBasis: f.basis } : {}),
        },
      };
      creates.push({ id: String(id), name: createName, doc, nameEvidence, matchKeys, evidence });
      row.decision = 'create';
      row.dbName = createName;
      if (missingFee.length) nulls.push({ institution: createName, fields: missingFee.map((m) => `${m} → null`) });
      console.log(`create: ${courses.length} courses (${built.englishTaught} English-taught), levels [${degreeLevels.join(', ')}]${proposed.tuition ? ', official fee' : ''}`);
      continue;
    }

    if (!docs.length) { row.decision = 'not in DB'; console.log(row.decision); continue; }

    // --- duplicates (several DB records for one USTAT university)
    if (docs.length > 1) {
      if (!entry.keepDbName) {
        uncertainties.push(`${officialName}: several of our records match USTAT ${a.COD_Ateneo} (${docs.map((d) => `"${d.name}"`).join(', ')}); the oldest ("${doc0.name}") is updated, the others are not changed automatically — review`);
      } else {
        for (const dup of docs.filter((d) => d.name !== entry.keepDbName)) {
          if (dup.isActive === false) continue;
          const reason = `duplicate: same MUR/USTAT university ${a.COD_Ateneo} ("${officialName}") as our record "${entry.keepDbName}"; same official website domain ${regDomain(dup.website)}`;
          const dataSource = { provider: PROVIDER, urls: [urls.atenei, portal?.url].filter(Boolean), syncedAt, fields: ['isActive'], runId: RUN_ID, reason };
          changes.push({
            id: String(dup._id), name: dup.name, action: 'deactivate', reason,
            diff: { isActive: { from: dup.isActive, to: false }, dataSource: { from: dup.dataSource, to: dataSource } },
            evidence: [evidence[0], evidence[1], { what: 'kept record', name: entry.keepDbName, website: doc0?.website, createdAt: doc0?.createdAt }, { what: 'hidden record', name: dup.name, website: dup.website, createdAt: dup.createdAt }],
          });
        }
      }
    }
    const doc = doc0;
    const diff = {};
    // Website changed only when the MUR-listed site was confirmed to load (its final domain is then used)
    if (website.proposed && website.title && regDomain(doc.website) !== regDomain(website.proposed)) diff.website = { from: doc.website, to: website.proposed };
    else if (website.proposed && !website.title && regDomain(doc.website) !== regDomain(website.proposed)) {
      uncertainties.push(`${doc.name}: MUR lists ${website.listed} but our record has ${doc.website}; the MUR site could not be checked directly (${website.check}), so the website was left unchanged`);
    }
    if (diff.website && doc.logo) diff.logo = { from: doc.logo, to: `https://www.google.com/s2/favicons?domain=${website.proposed.replace(/^https?:\/\//, '')}&sz=128` };
    if (type && String(doc.type || '').toUpperCase() !== type) diff.type = { from: doc.type, to: type };
    if (!doc.city) diff.city = { from: doc.city, to: titleCaseCity(a.CITTA) };
    for (const [k, val] of Object.entries(proposed)) {
      if (JSON.stringify(doc[k]) !== JSON.stringify(val)) diff[k] = { from: doc[k], to: val };
    }
    row.dbName = doc.name;
    if (row.createMatchedExisting) row.note = 'university of the "create" list that is already in our DB (created by an earlier run or added since): updated, not created again';
    if (missingFee.length) nulls.push({ institution: doc.name, fields: missingFee.map((m) => `${m} → existing value ${m.startsWith('tuitionFeeUSD') ? doc.tuitionFeeUSD ?? 'none' : doc.graduateTuitionUSD ?? 'none'} left unchanged (unverified)`) });

    // dataSource.fields = every field whose stored value (after this write) is this run's official value: the fields
    // changed now plus official values already stored (an earlier run's markers are thereby kept while re-verified).
    // logo is derived from the website (not an official value) and is never listed.
    const officialKeys = Object.keys(proposed).filter((k) => diff[k] || JSON.stringify(doc[k]) === JSON.stringify(proposed[k]));
    if (type && (diff.type || String(doc.type || '').toUpperCase() === type)) officialKeys.push('type');
    // website: the stored site is the one MUR lists (or its verified current domain); a site that does not load is still
    // the MUR-listed one, as on created records, but is only ever changed after it was seen to load
    if (diff.website || (doc.website && [website.proposed, website.listed].filter(Boolean).some((w) => regDomain(doc.website) === regDomain(w)))) officialKeys.push('website');
    if (diff.city) officialKeys.push('city');
    const prevDs = doc.dataSource && /^italy-sync-/.test(String(doc.dataSource.runId || '')) ? doc.dataSource : null;
    const createdBy = createdBySyncOf(doc);
    // values a create of this script set from the official sources and later runs never change
    const stableFromCreate = createdBy ? ['name', 'description', 'city'].filter((k) => !diff[k]) : [];
    const prevFields = Array.isArray(prevDs?.fields) ? prevDs.fields.filter((k) => k !== 'isActive') : [];
    const carried = prevFields.filter((k) => !diff[k] && (officialKeys.includes(k) || stableFromCreate.includes(k)));
    const notReverified = prevFields.filter((k) => !officialKeys.includes(k) && !stableFromCreate.includes(k));
    if (!Object.keys(diff).length) {
      row.decision = prevDs ? `keep (no change; matches the official sources; earlier sync ${prevDs.runId} kept)` : 'keep (no change)';
      if (notReverified.length) uncertainties.push(`${doc.name}: ${notReverified.join(', ')} marked official by ${prevDs.runId} could not be re-verified in this run (no write, markers left as they are)`);
    } else {
      row.decision = row.createMatchedExisting ? 'update (already in DB; not created again)' : 'update';
      if (notReverified.length) uncertainties.push(`${doc.name}: ${notReverified.join(', ')} marked official by ${prevDs.runId} could not be re-verified in this run; dropped from dataSource.fields (values unchanged)`);
      if (carried.length) fieldsKeptFromEarlierSync.push({ name: doc.name, earlierRunId: prevDs.runId, fields: carried });
      const fields = [...new Set([...carried.filter((k) => stableFromCreate.includes(k)), ...officialKeys])];
      const feeFields = fields.filter((k) => FEE_FIELDS.includes(k));
      const dataSource = {
        provider: PROVIDER, runId: RUN_ID, ustatCode: a.COD_Ateneo,
        urls: [...new Set([urls.atenei, portal?.url, fields.includes('courses') || fields.includes('degreeLevels') ? courseSource.url : null, fields.includes('degreeLevels') && phdRows.length ? urls.phd : null, ...(feeFields.length ? feeUrls : [])].filter(Boolean))],
        syncedAt, fields,
        ...(feeFields.length ? { fx, feeYear, feeBasis: f.basis } : {}),
        // never createdBySync here: --revert of THIS run must not hide a record an earlier run created
        ...(createdBy ? { originallyCreatedBy: createdBy } : {}),
      };
      diff.dataSource = { from: doc.dataSource, to: dataSource };
      changes.push({ id: String(doc._id), name: doc.name, action: 'update', diff, evidence });
    }
    console.log(`${row.decision}: ${courses.length} courses (${built.englishTaught} English-taught), levels [${degreeLevels.join(', ')}]${proposed.tuition ? ', official fee' : ''}${feeBlocked ? ', fee NOT proposed (see feesNotProposed)' : ''}`);
  }

  // 4) Reviewer lists (nothing is changed for these)
  const deactivatedIds = new Set(changes.filter((c) => c.action === 'deactivate').map((c) => String(c.id)));
  const DEFAULTISH = { minIeltsScore: 6.5, minGpaPercent: 60, ieltsScore: 'IELTS 6.0+', minScore: 'GPA 3.0+', greExam: 'GRE Waived', workExp: 'Freshers Eligible', scholarshipAvailable: true };
  const unverifiedFields = ours.filter((u) => !deactivatedIds.has(String(u._id))).map((u) => {
    const id = String(u._id);
    const fields = Object.entries(DEFAULTISH).filter(([k, val]) => u[k] === val).map(([k]) => k);
    if (u.acceptanceRate != null) fields.push('acceptanceRate');
    if (feeBlockedIds.has(id)) fields.push(`tuition/tuitionFeeUSD/graduateTuitionUSD (kept unchanged: tuitionFeeUSD ${u.tuitionFeeUSD ?? 'none'}, graduateTuitionUSD ${u.graduateTuitionUSD ?? 'none'}; official figures for one level only — see feesNotProposed)`);
    else if (!feeOfficialIds.has(id) && (u.tuition || u.tuitionFeeUSD != null)) fields.push('tuition/tuitionFeeUSD (no official non-EU fee verified in this run)');
    if (u.rankingNum != null && !u.rankingSource) fields.push('rankingNum (no rankingSource; left to the QS import)');
    if (u.description && /premier accredited institution/i.test(u.description)) fields.push('description (template text)');
    return { name: u.name, fields, current: { tuition: u.tuition, tuitionFeeUSD: u.tuitionFeeUSD, graduateTuitionUSD: u.graduateTuitionUSD, acceptanceRate: u.acceptanceRate, minIeltsScore: u.minIeltsScore, minGpaPercent: u.minGpaPercent, rankingNum: u.rankingNum } };
  }).filter((x) => x.fields.length);
  const unmatched = ours.filter((u) => !matchedIds.has(String(u._id))).map((u) => u.name);
  for (const n of unmatched) uncertainties.push(`${n}: our record is not mapped to a USTAT university in this script — no change proposed`);

  const registryCodes = new Set(REGISTRY.map((e) => e.code));
  const eligibleNotInDb = ustat.atenei.rows.filter((a) => a.Status === 'A' && !registryCodes.has(a.COD_Ateneo)).map((a) => {
    const rs = coursesOf(a);
    const en = rs.filter((r) => r.LINGUA === 'Inglese').length;
    const why = /Telematica/i.test(a.Descrizione) ? 'online (telematic) university — not created'
      : /Scuola Superiore/i.test(a.Descrizione) ? 'special-statute graduate school (PhD level, no own first/second-cycle degrees) — not created'
        : /Ente di Ricerca/i.test(a.Descrizione) ? 'research institute (PhD only) — not created'
          : !rs.length ? `no degree courses in ${COURSE_YEAR}/${Number(COURSE_YEAR) + 1 - 2000} — not created`
            : en ? 'offers English-taught degrees — add to the registry to create'
              : `no degree programme taught fully in English in ${COURSE_YEAR}/${Number(COURSE_YEAR) + 1 - 2000} — not created`;
    return { ustatCode: a.COD_Ateneo, name: squash(a.NomeEsteso), type: a.Descrizione, statale: a.StataleLibera === 'S', city: a.CITTA, courses2025: rs.length, englishTaught: en, note: why };
  });

  const feeYears = Object.entries(feeReport).map(([k, f]) => `${k} ${[...new Set(f.sources.map((s) => s.year))].join(' + ')}`).join('; ');
  uncertainties.push(
    'Italian public universities charge income-based fees (ISEE / "ISEE parificato" for income abroad) or fixed non-EU amounts that depend on citizenship / country group / programme group. The display text gives the official non-EU range (its lower amounts are country- or income-group rates that only some non-EU students get) and the USD fields use the highest amount ("max.": what a non-EU student pays at most), except Bologna ("standard max.": highest amount of standard programmes; programme-specific higher maximums are written in the text as "not in the range") and San Raffaele ("median" of programme fees). Medicine and later-year penalty amounts are kept out of the ranges and written in the text.',
    `Fee years by page: ${feeYears}. The year (or, for Tor Vergata, the page's last-modified date) is written in each tuition text.`,
    `Courses = MUR/USTAT offerta formativa ${COURSE_YEAR}/${Number(COURSE_YEAR) + 1 - 2000} (latest edition): official course names (mostly Italian; English-taught programmes have English names), English-taught first, then partly English, then Italian; Master's (incl. single-cycle) before Bachelor's within each group; replicas at other seats merged; capped at ${COURSE_CAP}.`,
    `degreeLevels: Laurea → Bachelor's, Laurea Magistrale and Laurea Magistrale a Ciclo Unico → Master's, PhD when USTAT lists PhD enrolments for ${phdYear}.`,
    'Type: MUR "statale" → PUBLIC, "non statale" → PRIVATE (the Free University of Bozen-Bolzano is non-state although funded by the Province of Bolzano).',
  );

  const count = (fld) => changes.filter((c) => c.diff[fld]).length;
  const summary = {
    runId: RUN_ID, mode: APPLY ? 'apply' : 'dry-run', ...(ASSUME_APPLIED ? { simulation: `records overlaid in memory with ${path.basename(ASSUME_APPLIED)}` } : {}), ourItalyRecords: ours.length,
    creates: creates.length, updates: changes.filter((c) => c.action === 'update').length,
    deactivations: changes.filter((c) => c.action === 'deactivate').length,
    unchanged: institutions.filter((i) => /^keep/.test(i.decision || '')).length,
    createListAlreadyInDb: institutions.filter((i) => i.createMatchedExisting).map((i) => i.dbName),
    fieldsChanged: Object.fromEntries(['website', 'logo', 'type', 'city', 'courses', 'degreeLevels', 'tuition', 'tuitionFeeUSD', 'graduateTuitionUSD', 'isActive'].map((fld) => [fld, count(fld)])),
    officialFeesFor: Object.entries(feeReport).filter(([, f]) => f.bachelor || f.master).map(([k]) => k),
    feesNotProposed: feesNotProposed.map((x) => x.name),
    llmCandidates: Object.values(feeReport).reduce((n, f) => n + f.llmCandidates.length, 0),
    eligibleNotInDb: eligibleNotInDb.length, unmatchedDbRecords: unmatched, requests: counters, fx,
    sources: { atenei: urls.atenei, offerta: urls.offerta, phd: urls.phd, catalogue: urls.catalogue, portal: USTAT_PORTAL, fetchedVia: ustat.via },
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `italy-sync-${ASSUME_APPLIED ? 'simulated-' : ''}${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
  const report = {
    summary, runId: RUN_ID, generatedAt: syncedAt, institutions, creates, changes, fees: feeReport,
    feesNotPublished: FEES_NOT_PUBLISHED, feesNotProposed, fieldsKeptFromEarlierSync, nulls, unverifiedFields, eligibleNotInDb, uncertainties, fetchLog,
  };
  const save = () => fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  save();

  console.log(JSON.stringify({ ...summary, sources: undefined }, null, 2));
  console.table(institutions.map((i) => ({ institution: i.dbName || i.dbRecords[0] || i.key, decision: i.decision, type: i.type || '', courses: i.courses ?? '', en: i.englishTaught ?? '', usd: i.feesUSD && (i.feesUSD.bachelorUSD != null || i.feesUSD.masterUSD != null) ? `${i.feesUSD.bachelorUSD ?? '-'} / ${i.feesUSD.masterUSD ?? '-'}` : (i.feesNotProposed ? 'not proposed' : '') })));
  console.log(`full report: ${reportPath}`);

  if (APPLY) {
    // The report is saved BEFORE the first write (applyStartedAt) and after every write, so a run that stops half-way
    // can still be reverted (--revert accepts it; every written record carries dataSource.runId)
    const col = db.collection('universities');
    let written = 0;
    report.applyStartedAt = new Date();
    save();
    try {
      for (const c of changes) {
        const set = {};
        for (const [k, val] of Object.entries(c.diff)) set[k] = val.to;
        set.updatedAt = new Date();
        await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, { $set: set });
        c.writtenAt = new Date();
        written += 1;
        save();
      }
      // Italy records re-read right before inserting: a university that exists by now (same USTAT code, English or
      // official name, website domain, or the unique name/country/city) is not inserted again
      const existing = await col.find({ country: italy._id }).project({ name: 1, city: 1, website: 1, dataSource: 1 }).toArray();
      for (const c of creates) {
        const d = c.doc;
        const clash = existing.find((u) => (nameKey(u.name) === nameKey(d.name) && u.city === d.city) || ustatOf(u) === d.dataSource.ustatCode
          || c.matchKeys.names.includes(nameKey(u.name)) || (u.website && c.matchKeys.domains.includes(regDomain(u.website))));
        if (clash) { c.skipped = `an Italy record of this university already exists ("${clash.name}", ${clash._id}); not inserted`; save(); continue; }
        const docToInsert = { ...d, _id: new mongoose.Types.ObjectId(c.id), country: italy._id, createdAt: new Date(), updatedAt: new Date() };
        await col.insertOne(docToInsert);
        c.insertedId = c.id;
        existing.push(docToInsert);
        save();
      }
      report.appliedAt = new Date();
    } catch (err) {
      report.applyError = `${err.message} (after ${written} of ${changes.length} updates and ${creates.filter((c) => c.insertedId).length} inserts); revert with --revert ${reportPath}`;
      throw err;
    } finally {
      save();
    }
    console.log(`APPLIED: ${written} updated/deactivated, ${creates.filter((c) => c.insertedId).length} created (revert: --revert ${reportPath})`);
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.stack || err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
