/**
 * Sync German higher-education institutions with official sources.
 *
 *   node scripts/dataSync/germanySync.js                    # DRY RUN: fetch + match + report, writes nothing
 *   node scripts/dataSync/germanySync.js --apply            # write the creates/updates/deactivations of this run
 *   node scripts/dataSync/germanySync.js --revert <report.json>   # undo an applied run (refuses dry-run reports)
 *
 * Options: --refresh (ignore the 7-day page cache), --no-scrapedo, --max-scrapedo <n> (default 3 per run),
 *          --expect <dry-run report> (with --apply: the reviewed dry run; default = the newest germany-sync dry-run
 *          report that has a plan. --apply recomputes everything with that report's EUR→USD rate and refuses to write
 *          when its plan — every record/field it would write and the value — differs from that report's plan),
 *          --write-zero-fees (write tuitionFeeUSD / graduateTuitionUSD = 0 over an existing positive value; off by
 *          default because the website currently reads 0 as "fee unknown" and substitutes US$25,000 — see
 *          ZERO_FEE_CONSUMERS — so such fee updates are held back and listed in the report).
 *
 * Website labelling: dataSource.provider/syncedAt (the "Official government & university data" badge) are written only
 * when dataSource.fields names a fee field; other written records carry dataSource.sourceNames/checkedAt instead.
 *
 * Sources (all official):
 *  - HRK Hochschulkompass "alle Hochschulen als TXT-Datei" (hs-kompass.de/kompass/xml/download/hs_liste.txt): every
 *    state / state-recognised higher education institution with official name, type (Universitäten, Fachhochschulen /
 *    HAW, Künstlerische Hochschulen, Hochschulen eigenen Typs, Verwaltungshochschule), sponsorship (öffentlich-rechtlich,
 *    privat / kirchlich staatlich anerkannt), seat and home page → name, city, website, type; duplicates and entries
 *    that are not state-recognised HEIs are hidden (isActive:false, never deleted).
 *  - HRK "Hochschultypen" page: the ~30 public-administration colleges "nur von Beamt:innen des Öffentlichen Dienstes
 *    besucht werden können" (civil servants only) → those records are hidden as well.
 *  - DAAD International Programmes database (the DAAD's own JSON search API; www2.daad.de blocks direct requests, so it
 *    is fetched once through scrape.do and cached): English-taught/international Bachelor's, Master's and PhD
 *    programmes → courses + degreeLevels. Tuition, languages and deadlines from DAAD go to the report only.
 *  - Fees: each university's own page (curated URL + verbatim quote that must still be on the page at run time), the
 *    Baden-Württemberg Ministry of Science page (EUR 1,500 per semester for non-EU students at state universities),
 *    and the pages of Bavarian institutions that charge non-EU tuition (TUM, FAU, THI, TH Nürnberg, TH Rosenheim).
 *  - ECB EUR→USD rate (api.frankfurter.app); no fallback rate.
 *
 * Never touches ranking fields (rank, rankingNum, rankingSource) or admission-requirement fields on existing records.
 * Reports and the page cache go to backend/reports/ (git-ignored), so re-runs spend no scrape.do credits.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dns = require('dns');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');
const REFRESH = ARGS.includes('--refresh');
const NO_SCRAPEDO = ARGS.includes('--no-scrapedo');
const argValue = (flag) => { const i = ARGS.indexOf(flag); return i !== -1 ? ARGS[i + 1] : undefined; };
const MAX_SCRAPEDO = Number(argValue('--max-scrapedo') || 3);
const WRITE_ZERO_FEES = ARGS.includes('--write-zero-fees');
const EXPECT_FILE = argValue('--expect');
const SCRIPT_ID = 'germanySync';
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const CACHE_DIR = path.join(REPORT_DIR, '.cache', 'germany', 'pages');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const { SCRAPE_DO_TOKEN } = process.env;
// The run id carries the start second plus a random suffix and is also the report file name (reports/<RUN_ID>.json);
// the report is first written with flag 'wx' (fails instead of overwriting), so no later run — dry run included — can
// replace an --apply report (the only record of the previous values). Only this run's own post-apply rewrite reuses it.
const RUN_STARTED = new Date().toISOString();
const RUN_SUFFIX = crypto.randomBytes(3).toString('hex');
const RUN_ID = `germany-sync-${RUN_STARTED.replace(/[-:.TZ]/g, '').slice(0, 14)}-${RUN_SUFFIX}`;
const isOwnRun = (ds) => Boolean(ds && typeof ds === 'object' && /^germany-sync-/.test(String(ds.runId || '')));
const PROVIDER = 'HRK Hochschulkompass + DAAD International Programmes + official university/ministry fee pages';
const COURSE_CAP = 150;
// The website shows "Official government & university data" (badge, source label next to fees) for any record with
// dataSource.provider, and treats the fee as official when dataSource.fields names one of these: provider/syncedAt are
// therefore written only when a fee field is official; other records get sourceNames/checkedAt (as ukSync.js does).
const FEE_FIELDS = ['tuition', 'tuitionFeeUSD', 'graduateTuitionUSD'];
const LABEL_WITHHELD = 'provider/syncedAt deliberately not set: no fee field of this record is from an official source, and the website shows the "Official government & university data" label for any record with a provider';
const labelDataSource = (ds, at) => {
  const { provider, syncedAt, sourceNames, checkedAt, labelWithheld, ...rest } = ds;
  return (rest.fields || []).some((k) => FEE_FIELDS.includes(k))
    ? { provider: PROVIDER, syncedAt: at, ...rest }
    : { sourceNames: PROVIDER, checkedAt: at, ...rest, labelWithheld: LABEL_WITHHELD };
};
// Website code that reads a 0 fee as "unknown" (→ US$25,000 in filters, budget scores and the detail page) — a 0 that
// would replace an existing positive value is held back unless --write-zero-fees is given (after these are fixed)
const ZERO_FEE_CONSUMERS = [
  'backend/controllers/shortlistController.js: `uni.graduateTuitionUSD > 0` / `return uni.tuitionFeeUSD || 25000` (fee used by the max-tuition filter and the budget score)',
  'backend/controllers/shortlistController.js: `hasFee = uni.tuitionFeeUSD > 0 || uni.graduateTuitionUSD > 0` (a 0 fee is hidden)',
  'backend/controllers/shortlistController.js: `fees.push(uni.tuitionFeeUSD || 25000)`',
  'frontend/src/components/UniversityShortlister.jsx: `const feeUSD = uni.tuitionFeeUSD || 25000`',
  "frontend/src/app/study-abroad/DynamicUniversityPage.jsx and frontend/src/components/UniversityDetailsModal.jsx: `university.tuitionFeeUSD ? … : '$25,000 USD/yr'`",
];
const COURSES_SCOPE = 'DAAD International Programmes only (international / mostly English-taught programmes); German-taught programmes of the institution are not listed';
const counters = { directRequests: 0, scrapeDoRequests: 0, cacheHits: 0, groqCalls: 0, failedRequests: 0 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- sources ----------
const HRK_LIST_URL = 'https://hs-kompass.de/kompass/xml/download/hs_liste.txt';
const HRK_DOWNLOADS_PAGE = 'https://www.hochschulkompass.de/hochschulen/downloads.html';
const HRK_DOWNLOADS_QUOTE = 'alle Hochschulen als TXT-Datei';
const HRK_LICENCE_QUOTE = 'ausschließlich für den persönlichen Gebrauch kostenfrei';
const HRK_TYPES_PAGE = 'https://www.hochschulkompass.de/hochschulen/hochschullandschaft/hochschultypen.html';
const HRK_CIVIL_SERVICE_QUOTE = 'In Deutschland gibt es zudem rund 30 Fachhochschulen für die öffentliche Verwaltung des Bundes und der Länder, die für die Laufbahn des gehobenen Dienstes ausbilden und nur von Beamt:innen des Öffentlichen Dienstes besucht werden können.';
const DAAD_API = 'https://www2.daad.de/deutschland/studienangebote/international-programmes/api/solr/en/search.json?q=&limit=3000&offset=0&display=list&sort=4';
const DAAD_SEARCH_PAGE = 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/result/';
const BW_MWK_URL = 'https://mwk.baden-wuerttemberg.de/de/hochschulen-studium/studieren-in-bw/studienfinanzierung/gebuehren-fuer-internationale-studierende-und-zweitstudium/tuition-fees-for-international-students';
const BW_MWK_DE_URL = 'https://mwk.baden-wuerttemberg.de/de/hochschulen-studium/studieren-in-bw/studienfinanzierung/gebuehren-fuer-internationale-studierende-und-zweitstudium';
const BW_QUOTES = {
  en: 'Starting winter semester 2017/18, universities in Baden-Württemberg will begin charging moderate tuition fees for non-EU international students.',
  amount: 'These fees amount to 1,500 euros per semester.',
  de: 'auf der Grundlage des Landeshochschulgebührengesetzes (LHGebG) einen Eigenbeitrag von 1.500 Euro pro Semester zu leisten',
};
const FX_URL = 'https://api.frankfurter.app/latest?from=EUR&to=USD';

// ---------------------------------------------------------------- curated mappings ----------
// DB record name → HRK Hs-Nr. where the name/website no longer matches the register (renamed or merged institutions).
// `redirect` = the record's old website must redirect to this registered domain (checked live, recorded as evidence).
const DB_ALIASES = {
  'Technical University of Berlin': { nr: '13', note: 'English name of Technische Universität Berlin' },
  'Technical University of Munich': { nr: '184', note: 'English name of Technische Universität München' },
  'Ludwig Maximilian University of Munich': { nr: '183', note: 'English name of Ludwig-Maximilians-Universität München' },
  // ownName: the institution itself uses this English name on its website (it is also the QS name, which the QS import
  // matches only by exact name) → this record is the kept record and its name is not changed. The curation decides on its
  // own; the quote is checked as evidence only, so a failed page fetch never changes which record is hidden.
  'RWTH Aachen University': {
    nr: '1', note: 'English name of Rheinisch-Westfälische Technische Hochschule Aachen',
    ownName: { url: 'https://www.rwth-aachen.de/go/id/bqmn/lidx/1', quote: 'RWTH Aachen University continues its policy of not charging additional tuition fees' },
  },
  'Rheinische Fachhochschule Köln': { nr: '150', redirect: 'rh-koeln.de', note: 'renamed Rheinische Hochschule Köln' },
  'SRH Hochschule Heidelberg': { nr: '122', redirect: 'srh-university.de', note: 'now SRH University of Applied Sciences Heidelberg' },
  'SRH Hochschule in Nordrhein-Westfalen': { nr: '122', redirect: 'srh-university.de', note: 'merged into SRH University of Applied Sciences Heidelberg' },
  'SRH Berlin University of Applied Sciences': { nr: '122', redirect: 'srh-university.de', note: 'merged into SRH University of Applied Sciences Heidelberg' },
  'SRH Wilhelm Löhe Hochschule': { nr: '122', redirect: 'srh-university.de', note: 'merged into SRH University of Applied Sciences Heidelberg' },
  'SRH Fernhochschule': { nr: '313', redirect: 'mobile-university.de', note: 'SRH Fernhochschule - The Mobile University' },
  'Fachhochschule Kiel': { nr: '145', redirect: 'haw-kiel.de', note: 'renamed Hochschule für Angewandte Wissenschaften Kiel' },
  'Hochschule Mannheim': { nr: '177', titleRe: /Technische Hochschule Mannheim/i, note: 'renamed Technische Hochschule Mannheim' },
  'Hochschule Macromedia Stuttgart': { nr: '366', note: 'Macromedia University of Applied Sciences (Stuttgart is one of its campuses)' },
  'IU International University of Applied Sciences': { nr: '329', note: 'English name of IU Internationale Hochschule' },
  'GU Deutsche Hochschule': { nr: '591', note: 'GU = German University: "Deutsche Hochschule für Angewandte Wissenschaften - German University of Applied Sciences"' },
  'Berlin International University of Applied Sciences': { nr: '462', redirect: 'whitecliffe.de', note: 'renamed Whitecliffe University of Applied Sciences' },
  'HMKW Hochschule für Medien, Kommunikation und Wirtschaft': { nr: '420', redirect: 'media-university.de', note: 'renamed MU Media University of Applied Sciences' },
  'Hochschule für Gesundheit - University of Applied Sciences': { nr: '30', redirect: 'hochschule-bochum.de', note: 'merged into Hochschule Bochum (Gesundheitscampus)' },
  'Fachhochschule für öffentliche Verwaltung, Polizei und Rechtspflege Mecklenburg-Vorpommern': { nr: '479', note: 'register name adds "des Landes"' },
  // same name exists twice in the register (Erfurt, Hs-Nr. 517, and Potsdam, 729); our record is the Potsdam one
  'HMU Health and Medical University': { nr: '729', note: 'HMU Health and Medical University Potsdam (website health-and-medical-university.de)' },
};
// Website-domain matches that are wrong (the stored website belongs to another institution)
const DOMAIN_MATCH_REJECT = new Set(['medienakademie - Hochschule Stuttgart']);
// Records not in the HRK list that are hidden with extra, positive evidence checked on every run (absence from the list
// alone is never enough; if the evidence is not confirmed the record is left unchanged and listed as an uncertainty):
//   quote       — a verbatim statement on the institution's own site (foreign-degree provider, closure)
//   expectDead  — DNS lookup of the domain answers ENOTFOUND (timeouts / EAI_AGAIN / resolver failures never count)
//   websiteOfNr — the record's stored website is on the register domain of another HRK institution and its page title
//                 matches `titleRe`, and that institution has (or gets in this run) its own active record
// Everything else not in the list is only flagged. `checkUrl` = the institution's own site, looked up for the flag note.
const NOT_IN_REGISTER = {
  'Berlin School of Business and Innovation': { action: 'deactivate', url: 'https://www.berlinsbi.com/', quote: 'Degrees awarded by internationally recognised UK and US university partners', why: 'private provider of foreign (UK/US partner) degrees, not a German state-recognised higher education institution' },
  'Hochschule Clara Hoffbauer Potsdam (HCHP)': { action: 'deactivate', url: 'https://www.clara-hoffbauer-hochschule.de/', expectDead: true, why: 'not in the HRK list and its website domain no longer exists (DNS: ENOTFOUND)' },
  // its own (live) website announces the closure
  'Fachhochschule für Interkulturelle Theologie Hermannsburg': { action: 'deactivate', url: 'https://www.fh-hermannsburg.de/', quote: 'die im Jahr 2012 gegründete Fachhochschule für Interkulturelle Theologie Hermannsburg (FIT) hat im September 2025 den Hochschulbetrieb eingestellt', why: 'not in the HRK list; its own website states that it ceased operating in September 2025' },
  // the only verifiable attribute of this record, its website, is the site of Hochschule der Medien Stuttgart (HRK 250):
  // hidden so that two active records do not show the same institution's website (reason completed at run time)
  'medienakademie - Hochschule Stuttgart': { action: 'deactivate', websiteOfNr: '250', titleRe: /Hochschule der Medien/i, why: 'not in the HRK list; its recorded website is not its own but the site of Hochschule der Medien Stuttgart (HRK 250) — duplicate / invalid record' },
  // flagged only: not in the HRK list, but nothing proves it is not a (former) state-recognised institution
  'Hochschule für Kommunikation und Gestaltung': { action: 'flag', checkUrl: 'https://www.hfk-bw.de/' },
};
// Degree levels proven on the institution's own site (verbatim quote checked at run time) where DAAD's international
// list lacks a level the institution offers — used when the kept record lacks that level (RWTH: our English-named record,
// the one QS uses, has no Bachelor's level; DAAD lists no RWTH Bachelor's programme)
const LEVEL_EVIDENCE = {
  1: [{ level: "Bachelor's", url: 'https://www.rwth-aachen.de/go/id/bkuk/?lidx=1', quote: 'Electrical Engineering and Information Technology B.Sc. Key Info Basic Information Degree Bachelor of Science', note: 'an RWTH Bachelor of Science programme page (German-taught programmes are not in the DAAD international list)' }],
};
// Civil-service colleges (police, tax, justice, public administration) that are not in the HRK list
const CIVIL_SERVICE_RE = /polizei|rechtspflege|öffentliche[nr]?\s+(?:verwaltung|dienst)|verwaltung und dienstleistung|finanzen|steuer|bundesbank|archivschule/i;

// DAAD "academy" (English institution name) → HRK Hs-Nr.; null = research institute / not a degree-awarding HEI
const DAAD_ACADEMY_MAP = {
  'Technical University of Munich': '184', 'University of Bonn': '32', 'University of Göttingen': '98', 'SRH University': '122',
  'RWTH Aachen University': '1', 'University of Tübingen': '258', 'FAU Erlangen-Nürnberg': '70', 'Dresden University of Technology': '53',
  'University of Potsdam': '221', 'Ludwig-Maximilians-Universität München': '183', 'Julius-Maximilians-Universität Würzburg': '276',
  'Hochschule Fresenius - University of Applied Sciences': '271', 'Ruhr-Universität Bochum': '29', 'Saarland University': '235',
  'Leuphana University Lüneburg': '171', 'University of Bayreuth': '9', 'Technische Hochschule Ingolstadt': '288', 'University of Hamburg': '104',
  'Deggendorf Institute of Technology': '284', 'Friedrich Schiller University Jena': '133', 'Otto von Guericke University Magdeburg': '172',
  'Freie Universität Berlin': '11', 'University of Cologne': '147', 'RPTU University Kaiserslautern-Landau': '135',
  'Johannes Gutenberg University Mainz': '174', 'Rhine-Waal University of Applied Sciences': '400', 'University of Bremen': '38',
  'University of Münster': '191', 'Bielefeld University': '27', 'Heilbronn University of Applied Sciences': '125',
  'University of Regensburg': '225', 'Justus Liebig University Giessen': '96', 'Leipzig University': '159',
  'Brandenburg University of Technology Cottbus-Senftenberg': '45', 'University of Freiburg': '86', 'Leibniz University Hannover': '114',
  'Technical University of Applied Sciences Würzburg-Schweinfurt (THWS)': '277', 'University of Konstanz': '154', 'University of Hohenheim': '129',
  'University of Stuttgart': '248', 'TU Dortmund University': '51', 'HWR Berlin (Berlin School of Economics and Law)': '17',
  'Karlsruhe Institute of Technology': '136', 'Marburg University': '179', 'University of Passau': '218', 'Ulm University': '259',
  'Kiel University': '144', 'University of Kassel': '142', 'Hof University of Applied Sciences': '287', 'University of Duisburg-Essen': '71',
  'Heidelberg University': '119', 'Humboldt-Universität zu Berlin': '12', 'Chemnitz University of Technology': '42',
  'TU Bergakademie Freiberg': '85', 'Technische Universität Ilmenau': '130', 'University of Siegen': '245',
  'Frankfurt School of Finance & Management': '83', 'Technical University of Darmstadt': '46', 'Anhalt University of Applied Sciences': '5',
  'Fulda University of Applied Sciences': '92', 'Bremen University of Applied Sciences': '40', 'Paderborn University': '215',
  'Rosenheim Technical University of Applied Sciences': '232', 'Technische Hochschule Köln - University of Applied Sciences': '149',
  'Technische Universität Berlin': '13', 'European University Viadrina': '84', 'Trier University': '255',
  'International School of Management (ISM)': '285', 'Aalen University': '3', 'Technische Hochschule Mittelhessen University of Applied Sciences': '97',
  'Hamburg University of Technology': '105', 'University of Augsburg': '6', 'Goethe University Frankfurt': '78', 'University of Oldenburg': '209',
  'Heinrich Heine University Düsseldorf': '59', 'Ostbayerische Technische Hochschule Amberg-Weiden (OTH)': '280',
  'Technische Universität Braunschweig': '35', 'Osnabrück University': '211', 'Furtwangen University': '94',
  'Technische Hochschule Nürnberg Georg Simon Ohm': '200', 'Kaiserslautern University of Applied Sciences': '306', 'Hochschule Bonn-Rhein-Sieg': '294',
  'Weihenstephan-Triesdorf University of Applied Sciences': '264', 'Neu-Ulm University of Applied Sciences': '319', 'Europa-Universität Flensburg': '76',
  'EBS Universität für Wirtschaft und Recht': '206', 'University of Bamberg': '8', 'HTW Berlin University of Applied Sciences': '16',
  'Catholic University of Eichstätt-Ingolstadt': '65', 'Osnabrück University of Applied Sciences': '214', 'Offenburg University of Applied Sciences': '208',
  'Coburg University of Applied Sciences and Arts': '44', 'Ansbach University of Applied Sciences': '312', 'Hamburg University of Applied Sciences': '107',
  'Bauhaus-Universität Weimar': '266', 'OTH Regensburg': '226', 'WHU - Otto Beisheim School of Management': '261',
  'Eberswalde University for Sustainable Development': '64', 'University of Applied Sciences Emden/Leer': '405', 'Hannover Medical School': '112',
  'Dortmund University of Applied Sciences and Arts': '52', 'University of Mannheim': '176', 'Dresden International University': '394',
  'Stralsund University of Applied Sciences': '247', 'Pforzheim University': '219', 'FH Aachen University of Applied Sciences': '2',
  'University of Koblenz': '146', 'Hochschule München University of Applied Sciences': '291', 'Albstadt-Sigmaringen University': '4',
  'University of Applied Sciences Ravensburg-Weingarten': '224', 'HHL Leipzig Graduate School of Management': '295',
  'OWL University of Applied Sciences and Arts': '165', 'FH Münster University of Applied Sciences': '192',
  'Westsächsische Hochschule Zwickau - University of Applied Sciences Zwickau': '283', 'Darmstadt University of Applied Sciences': '47',
  'Technische Hochschule Mannheim': '177', 'Hochschule Hannover - University of Applied Sciences and Arts': '115', 'Kühne Logistics University': '429',
  'University of Education Freiburg': '87', 'ESCP Berlin Campus': '14', 'Technische Hochschule Lübeck': '169', 'Mainz University of Applied Sciences': '310',
  'SRH Distance Learning University': '313', 'University of Rostock': '233', 'University of Hildesheim': '127', 'International University SDI München': '376',
  'Hertie School': '384', 'University of Greifswald': '99', 'HTWG Konstanz - University of Applied Sciences': '155',
  'Technical University of Applied Sciences Wildau': '272', 'Frankfurt University of Applied Sciences': '79',
  'Hochschule Wismar - University of Applied Sciences, Technology, Business and Design': '274', 'University of Fine Arts Hamburg': '109',
  'Kiel University of Applied Sciences': '145', 'South Westphalia University of Applied Sciences': '343', 'bbw Hochschule - University of Applied Sciences': '389',
  'Nordhausen University of Applied Sciences': '315', 'Bavarian University of Business and Technology (HDBW)': '467', 'Nürtingen-Geislingen University': '203',
  'Technical University of Applied Sciences Augsburg': '7', 'Kempten University of Applied Sciences': '143', 'Bremerhaven University of Applied Sciences': '41',
  'accadis Hochschule Bad Homburg | University of Applied Sciences': '354', 'htw saar - University of Applied Sciences': '236',
  'Stuttgart Technical University of Applied Sciences': '251', 'Mittweida University of Applied Sciences': '181', 'RheinMain University of Applied Sciences': '270',
  'Esslingen University of Applied Sciences': '73', 'Worms University of Applied Sciences': '309', 'Bard College Berlin, a Liberal Arts University': '437',
  'Hochschule Bielefeld – University of Applied Sciences and Arts (HSBI)': '28', 'Ulm University of Applied Sciences': '260', 'University of Wuppertal': '279',
  'Karlsruhe University of Applied Sciences': '138', 'Magdeburg-Stendal University of Applied Sciences': '173', 'International Psychoanalytic University Berlin': '401',
  'Reutlingen University': '227', 'Aschaffenburg University of Applied Sciences': '333', 'Bochum University of Applied Sciences': '30',
  'University of Erfurt': '66', 'Trier University of Applied Sciences': '308', 'Friedensau Adventist University': '91', 'Hochschule Geisenheim University': '446',
  'Bingen University of Applied Sciences': '304', 'University of Technology Nuremberg': '691', 'University of Applied Sciences Jena': '134',
  'Hochschule für Technik und Wirtschaft Dresden – University of Applied Sciences': '54', 'Baden-Wuerttemberg Cooperative State University': '398',
  'Hamm-Lippstadt University of Applied Sciences': '399', 'Merseburg University of Applied Sciences': '180',
  'Jade University of Applied Sciences Wilhelmshaven/Oldenburg/Elsfleth': '406', 'Ludwigshafen University of Business and Society': '307',
  'University of Applied Sciences Potsdam': '222', 'Witten/Herdecke University': '275', 'University of Applied Sciences Koblenz': '305',
  'Hochschule der Medien Stuttgart': '250', 'Landshut University of Applied Sciences': '157', 'University of Applied Sciences Erfurt': '67',
  'Universität zu Lübeck': '168', 'Ostfalia University of Applied Sciences - Hochschule Braunschweig/Wolfenbüttel': '36',
  'Internationale Hochschule Liebenzell': '434', 'Biberach University of Applied Sciences': '26', 'Folkwang University of the Arts': '72',
  'Neubrandenburg University of Applied Sciences': '195', 'University of Education Schwäbisch Gmünd': '243', 'FH Westküste University of Applied Sciences': '269',
  'Fachhochschule Wedel University of Applied Sciences': '263', 'Zeppelin University': '351', 'Berliner Hochschule für Technik': '15',
  'University of Veterinary Medicine Hannover': '113', 'HafenCity University Hamburg': '362', 'Detmold University of Music': '49',
  'Merz Akademie, University of Applied Arts, Design and Media Stuttgart': '252', 'Harz University of Applied Sciences': '118',
  'Flensburg University of Applied Sciences': '77',
  // not degree-awarding higher education institutions (programmes are run jointly with a university)
  'Charité - Universitätsmedizin Berlin': null, 'ifs Internationale Filmschule Köln': null,
};
const DAAD_RESEARCH_INSTITUTE_RE = /max[- ]planck|helmholtz|leibniz institute|desy|elektronen-synchrotron|german institute for economic research|cancer research center|institute of molecular biology|caesar/i;
const DAAD_CITY_OVERRIDE = { 'Hochschule Fresenius - University of Applied Sciences|Heidelberg': '440' };
const FOREIGN_CAMPUS_RE = /singapore|vietnam|gabon|ho chi minh/i;

// ---------------------------------------------------------------- fee evidence (curated URL + verbatim quote) ----------
// kind 'free': the institution's own page states that it charges no (general) tuition fees. Every quote must still be on
// the page at run time. Each `noTuition` quote says what it covers:
//   covers 'all' (default)   — an institution-wide (or state-wide) statement: Bachelor's and Master's
//   covers 'consecutive'     — first degree and consecutive Master's only (continuing-education Master's may charge)
//   covers 'bachelor'        — first degree only, or the fact box of one Bachelor programme page: Bachelor's only
// `exceptions` = the page's own limitation (verbatim quote + display text), `lead` / `qualifier` = the page's wording
// ("no general tuition fees", "most programmes"), `semester` = the quote that ends with the semester contribution
// (taken from a central semester-fee page wherever one exists), `sourceNote` = what kind of page the statement is on
// when it is not a fees page, `caveat` = something on the page a reviewer should see (goes to the report).
// Statements are institution-wide (or state-wide) ones on central pages; a single programme's fact box is not used.
// tuitionFeeUSD / graduateTuitionUSD are set to 0 only for a level the quotes cover AND for which fewer than one third
// of the institution's programmes in the DAAD International Programmes list charge tuition (a level DAAD does not list
// keeps the page's statement). If DAAD is unavailable in a run, no 0 is set at all (see feeFor). A 0 that would replace
// an existing positive value is held back unless --write-zero-fees is given (see ZERO_FEE_CONSUMERS).
const FREE = (noTuition, semester, extra = {}) => ({ kind: 'free', noTuition: [].concat(noTuition), semester, ...extra });
const FEE_EVIDENCE = {
  11: FREE({ url: 'https://www.fu-berlin.de/en/studium/studieren/studienorganisation/gebuehren/index.html', quote: 'Freie Universität Berlin does not charge any tuition fees (except for continuing education programs)' },
    { url: 'https://www.fu-berlin.de/en/studium/studieren/studienorganisation/gebuehren/index.html', quote: 'Fees for new enrollments for winter semester 2026/27 A total of €376,80' },
    { exceptions: [{ url: 'https://www.fu-berlin.de/en/studium/studieren/studienorganisation/gebuehren/index.html', quote: '(except for continuing education programs)', text: 'continuing-education programmes charge tuition' }] }),
  84: FREE({ url: 'https://www.europa-uni.de/en/studium/informieren-orientieren/faq/index.html', quote: "The Viadrina is a state university, therefore, in principle, no tuition fees are charged for the Bachelor's and Master's programmes." }, null,
    { exceptions: [{ url: 'https://www.europa-uni.de/en/studium/informieren-orientieren/faq/index.html', quote: "The exception is continuing education master's programmes, which are subject to tuition fees.", text: "continuing-education Master's programmes charge tuition" }] }),
  13: FREE({ url: 'https://www.tu.berlin/en/studying/organizing-your-studies/financing-your-studies', quote: 'There are no tuition fees to pay at TU Berlin.' }, null,
    { exceptions: [{ url: 'https://www.tu.berlin/en/studying/organizing-your-studies/financing-your-studies', quote: 'The only exceptions to this are continuing education master’s programs.', text: "continuing-education Master's programmes charge tuition" }] }),
  293: FREE({ url: 'https://www.uni-vechta.de/en/studies/organisation-of-studies/semester-fees-/-leave-of-absence-/-tuition-fees-for-long-term-students', quote: 'In principle, no fees are charged for studying at the University of Vechta (tuition fees).' },
    { url: 'https://www.uni-vechta.de/en/studies/organisation-of-studies/semester-fees-/-leave-of-absence-/-tuition-fees-for-long-term-students', quote: 'semester fees for the winter semester 2026/27 at the University of Vechta are EUR 456.36' }),
  32: FREE({ url: 'https://www.uni-bonn.de/en/studying/international-students/costs-and-financing-for-international-students/costs-and-financing', quote: 'The University of Bonn does not charge tuition fees.' }, null,
    { exceptions: [{ url: 'https://www.uni-bonn.de/en/studying/international-students/costs-and-financing-for-international-students/costs-and-financing', quote: 'Studying at the University of Bonn is free of charge, unless you are taking one of a handful of degree programs for continuing education.', text: 'a handful of continuing-education programmes charge tuition' }] }),
  // Leuphana College = its Bachelor's school ("College: Interdisciplinary Bachelor Programmes"); central College fees page.
  // Its semester total is printed as "TOTAL: 484,244 €" (a typo), so no amount is taken from it.
  171: FREE({ url: 'https://www.leuphana.de/en/college/studies/fees.html', quote: 'At Leuphana College you pay a semester contribution for enrolment, re-registration and, to a lesser extent, during a leave of absence. If you complete your studies within the standard period of study plus six additional semesters, there will be no additional fees.', covers: 'bachelor', note: 'central fees page of Leuphana College (Leuphana\'s Bachelor\'s school): only the semester contribution is payable — says nothing about Graduate School (Master\'s) programmes' },
    null,
    { caveat: { url: 'https://www.leuphana.de/en/college/studies/fees.html', quote: 'Since the winter semester 2014/2015, the state of Lower Saxony has charged all students tuition fees for undergraduate or consecutive Master studies from the first semester.', text: 'the same Leuphana College fees page has this garbled English sentence under "University fees and fees for long-term students" (it is followed only by the long-term-student fee rules of § 11 NHG; TU Braunschweig states that Lower Saxony abolished tuition fees for winter semester 2014/2015) — reviewer check' } }),
  35: FREE({ url: 'https://www.tu-braunschweig.de/en/study-teaching/during-your-studies/financing-and-costs', quote: 'These tuition fees were abolished by the Lower Saxony State Parliament by law of 11 December 2013 for the winter semester 2014/2015.' }, null,
    { exceptions: [{ url: 'https://www.tu-braunschweig.de/en/study-teaching/during-your-studies/financing-and-costs', quote: 'In some further education programmes , you pay tuition fees', text: 'some further-education programmes charge tuition' }] }),
  98: FREE({ url: 'https://www.uni-goettingen.de/en/575849.html', quote: 'There are no tuition fees, instead students only pay for administrative expenses.' }),
  133: FREE({ url: 'https://www.uni-jena.de/en/27755/faq', quote: 'The University of Jena does not charge any tuition fees.' },
    { url: 'https://www.uni-jena.de/en/575/semester-fee', quote: 'In the winter semester 2026/27, the semester fee amounts to €333.05.' }),
  // no central TU Darmstadt page states the tuition rule; the statement is on TU Darmstadt's own #studentsofTUdarmstadt
  // pages (tu-darmstadt.de), and the central semester-fee page lists the full per-semester amount (semester fees +
  // administrative fee, no tuition component)
  46: FREE({ url: 'https://www.tu-darmstadt.de/studentsoftudarmstadt/home/studileben/studienkosten_und_finanzierung.en.jsp', quote: 'Studying at TU Darmstadt comes with a major advantage: most programmes are tuition-free, thanks to Germany’s state-funded higher education system.', note: 'TU Darmstadt\'s own student-life pages (#studentsofTUdarmstadt) on tu-darmstadt.de, not a fees page' },
    { url: 'https://www.tu-darmstadt.de/studieren/studieren_von_a_bis_z/artikel_details_de_en_286144.en.jsp', quote: 'Amount for WiSe 2026/27 (including Medizintechnik) 402,68 €' },
    { qualifier: 'most programmes', sourceNote: 'tuition statement from its #studentsofTUdarmstadt student-life pages' }),
  147: FREE({ url: 'https://uni-koeln.de/en/studying-teaching/international/study-in-cologne/costs-financing', quote: 'The University of Cologne does not charge any tuition fees' }),
  172: FREE({ url: 'https://www.ovgu.de/unimagdeburg/en/International/Incoming+_+Ways+to+the+University/International+Students/Organizing+Your+Stay/Finance-p-48630.html', quote: 'There are no tuition fees and the semester fee already includes the Deutschland-Ticket.' },
    { url: 'https://www.ovgu.de/unimagdeburg/en/International/Incoming+_+Ways+to+the+University/International+Students/Organizing+Your+Stay/Finance-p-48630.html', quote: 'Semester fee 329.30€' }),
  130: FREE({ url: 'https://www.tu-ilmenau.de/en/study/before-the-study/before-the-study/faq', quote: 'The Technical University of Ilmenau does not charge general tuition fees.' },
    { url: 'https://www.tu-ilmenau.de/en/study/before-the-study/before-the-study/faq', quote: 'semester fee of approximately € 300', approx: true }, { lead: 'No general tuition fees' }),
  42: FREE({ url: 'https://www.tu-chemnitz.de/international/digiassist/Digi_FAQs.php.en', quote: 'TU Chemnitz is a university financed by the state (staatliche Hochschule). That is why you do not need to pay any tuition fees.' },
    { url: 'https://www.tu-chemnitz.de/studierendenservice/studserv/sembeitrag.php.en', quote: 'The semester contribution from winter term 2026/2027 in the amount of 341,40 Euro' }),
  174: FREE({ url: 'https://www.studium.uni-mainz.de/en/starting-your-studies/student-life/', quote: 'At JGU, your first degree is tuition-free.', covers: 'bachelor', note: 'covers the first degree only' },
    { url: 'https://www.studium.uni-mainz.de/en/starting-your-studies/student-life/', quote: 'For the summer semester 2026: Mainz campus: €349.10' }),
  159: FREE({ url: 'https://www.uni-leipzig.de/en/international/studying-at-leipzig-university/getting-started-with-studies-and-life-in-leipzig', quote: 'Beside the semester fee, which all students have to pay, there are no general tuition fees at Leipzig University.' },
    { url: 'https://www.uni-leipzig.de/en/international/studying-at-leipzig-university/getting-started-with-studies-and-life-in-leipzig', quote: 'Amount €342,30' },
    { lead: 'No general tuition fees', exceptions: [{ url: 'https://www.uni-leipzig.de/en/international/studying-at-leipzig-university/getting-started-with-studies-and-life-in-leipzig', quote: 'Tuition fees are also charged for some master’s degree programmes.', text: "some Master's programmes charge tuition" }] }),
  71: FREE({ url: 'https://www.uni-due.de/international/international-admissions-en.php', quote: 'The University of Duisburg-Essen does not charge tuition fees.' }),
  38: FREE({ url: 'https://www.uni-bremen.de/en/studies/orientation-application/offered-study-program/international-degree-programs', quote: 'There are no tuition fees beyond the semester fee.', note: 'stated for the international Bachelor\'s and Master\'s programmes listed on the page' }),
  51: FREE({ url: 'https://international.tu-dortmund.de/en/international-students/offers-for-refugees/scholarship-programs-and-study-financing/', quote: 'Although there are currently no tuition fees in North Rhine-Westphalia, studying is not free of charge.', note: 'state-wide statement on a TU Dortmund page' }),
  191: FREE({ url: 'https://www.uni-muenster.de/international/en/studierende/general-information/cost-and-funding.html', quote: 'There are no tuition fees charged for regular degree programmes at the University of Münster' }, null,
    { exceptions: [{ url: 'https://www.uni-muenster.de/international/en/studierende/general-information/cost-and-funding.html', quote: 'the only exception applies to in-service continuing education programmes', text: 'in-service continuing-education programmes charge tuition' }] }),
  104: FREE({ url: 'https://www.uni-hamburg.de/en/studium/campus-leben/finanzen.html', quote: 'in October 2012 the University of Hamburg abolished tuition fees.' },
    { url: 'https://www.uni-hamburg.de/en/piasta/welcome-buddy/to-dos/universitaet.html', quote: 'The semester contribution for winter semester 2026/27 is €402' }),
  105: FREE({ url: 'https://www.tuhh.de/tuhh/en/education/students/faqs', quote: 'Since winter semester 2012/2013 there aren’t any longer general tuition fees.' },
    { url: 'https://www.tuhh.de/tuhh/en/education/students/organisational-details-about-your-studies/financing-your-studies/costs/semester-contribution', quote: 'The fee for the winter semester 2026/2027 is therefore € 400' }, { lead: 'No general tuition fees' }),
  // university-wide page (the earlier source, a Bachelor minor-subject fact box, said nothing about Master's programmes)
  66: FREE({ url: 'https://www.uni-erfurt.de/en/studies/before-studies/costs-financing', quote: 'Even though there are no general tuition fees in Thuringia', note: 'state-wide statement on the University of Erfurt costs page' },
    { url: 'https://www.uni-erfurt.de/en/brandtschool/studies/admissions/tuition-financing', quote: 'A student semester contribution, which currently totals EUR 340' },
    { lead: 'No general tuition fees', exceptions: [{ url: 'https://www.uni-erfurt.de/en/brandtschool/studies/admissions/tuition-financing', quote: 'The MPP tuition fee for students taking up their studies in 2026 is: EUR 2,100 per semester for the academic year 2026/27', text: 'the Master of Public Policy (Willy Brandt School) charges EUR 2,100 per semester (2026/27)' }] }),
  135: FREE({ url: 'https://rptu.de/en/international/master/prospective-students/application-admission/fees-finances', quote: "The Bachelor's degree and the consecutive Master's degree remain free of charge.", covers: 'consecutive' }, null,
    { exceptions: [{ url: 'https://rptu.de/en/international/master/prospective-students/application-admission/fees-finances', quote: "Continuing education programs are established as Master's degree study programs. University fees could be charged.", text: "continuing-education Master's programmes may charge fees" }] }),
  // Europa-Universität Flensburg (76): removed — the only statement found is the fact box of one BA programme page; its
  // central "Financing" pages state no tuition rule, so its fees stay unverified (no institution-level claim).
  266: FREE({ url: 'https://www.uni-weimar.de/en/university/international/to-weimar/exchange-studies/semester-contribution/', quote: 'There are no tuition fees at the Bauhaus-Universität Weimar.' }),
  235: FREE({ url: 'https://www.uni-saarland.de/en/study/organisation/fees.html', quote: "If you are studying for a first degree or you are on a consecutive Master's degree programme, there are no tuition fees", covers: 'consecutive' }),
  27: FREE({ url: 'https://www.uni-bielefeld.de/international/come-in/organisation/finanzierung/', quote: 'Since tuition fees are no longer charged, only a social fee, the so-called semester fee, is to be paid.' }),
  1: FREE({ url: 'https://www.rwth-aachen.de/go/id/bqmn/lidx/1', quote: 'RWTH Aachen University continues its policy of not charging additional tuition fees for international students from non-EU countries. All students, regardless of citizenship, are responsible only for the standard semester fee.' }),
  53: FREE({ url: 'https://tu-dresden.de/studium/vor-dem-studium/darum-die-tu-dresden?set_language=en', quote: "As a state university, the TUD is a safe part of Saxony's higher education landscape and allows you to study without tuition fees." },
    { url: 'https://tu-dresden.de/studium/vor-dem-studium/internationales/faq?set_language=en', quote: 'The semester contribution costs approx. 360 € for direct study students', approx: true }),
  221: FREE([{ url: 'https://www.uni-potsdam.de/en/studium/studying/financing-funding-housing/costs-at-a-glance', quote: 'At the University of Potsdam, we do not charge any tuition fees for all undergraduate programs', covers: 'bachelor' },
    { url: 'https://www.uni-potsdam.de/en/studium/studying/financing-funding-housing/costs-at-a-glance', quote: "There are also no tuition fees for all consecutive master's degree programs.", covers: 'consecutive' }],
  { url: 'https://www.uni-potsdam.de/en/studium/studying/financing-funding-housing/costs-at-a-glance', quote: 'Semester fee at the University of Potsdam (currently a total of € 372,80' },
  { exceptions: [{ url: 'https://www.uni-potsdam.de/en/studium/studying/financing-funding-housing/costs-at-a-glance', quote: 'The only exception to this are some of the continuing education programs', text: 'some continuing-education programmes charge tuition' }] }),
  96: FREE({ url: 'https://www.uni-giessen.de/en/study/courses/fees', quote: "As a public university, JLU Giessen does not charge tuition fees (except for the Master's course in Global Change, taught in English)" },
    { url: 'https://www.uni-giessen.de/en/org/admin/departments/b/5/studoffice/sc', quote: '€ 421.43 for the winter semester 2026/2027' },
    { exceptions: [{ url: 'https://www.uni-giessen.de/en/study/courses/fees', quote: "(except for the Master's course in Global Change, taught in English)", text: "the Master's in Global Change charges tuition" }] }),
  215: FREE({ url: 'https://www.uni-paderborn.de/en/studies/international-office/degree-students/live-in-paderborn-and-on-campus/finances', quote: 'You do not pay tuition fees at Paderborn University!' },
    { url: 'https://www.uni-paderborn.de/en/studies/international-office/degree-students/live-in-paderborn-and-on-campus/finances', quote: 'The semester fee of around €300 euros', approx: true }),
  209: FREE({ url: 'https://uol.de/en/io/study/international-degree-students/tuition-costs-scholarships', quote: 'The University of Oldenburg is a state financed institution, and most courses of study do not require tuition fees.' }, null, { qualifier: 'most programmes' }),
  144: FREE({ url: 'https://www.uni-kiel.de/en/wiso/studying/master/economics/students/faq', quote: 'There are currently no tuition fees at Kiel University.', note: 'university-wide statement in the FAQ of a Kiel University programme' },
    { url: 'https://www.international.uni-kiel.de/en/incomings/during-your-studies/re-registration-international_students/semesterfee', quote: 'The total amount for the winter semester of 2026-2027 is: € 403' }),
  233: FREE({ url: 'https://www.uni-rostock.de/en/study/study-organization/during-studies/rueckmeldung/', quote: 'There are no tuition fees at the University of Rostock (with the exception of continuing education courses).' },
    { url: 'https://www.uni-rostock.de/en/study/study-organization/during-studies/rueckmeldung/', quote: 'For re-registration for the winter semester 2026/27 a semester fee of 352,00 Euro' },
    { exceptions: [{ url: 'https://www.uni-rostock.de/en/study/study-organization/during-studies/rueckmeldung/', quote: '(with the exception of continuing education courses)', text: 'continuing-education courses charge tuition' }] }),
  85: FREE({ url: 'https://tu-freiberg.de/en/study/your-studies/central-student-advisory-services/frequently-asked-questions', quote: 'There are no tuition fees at our university' },
    { url: 'https://tu-freiberg.de/en/study/study/study-organization/semester-fees-and-re-registration-studies', quote: 'Current semester fee: EUR 107,00' }),
  // state-wide statement; its International Graduate Center (MBA and most international Master's programmes) charges
  40: FREE({ url: 'https://www.hs-bremen.de/en/study/advice-and-support/finances/', quote: 'The good news is that there are no tuition fees in the state of Bremen.', note: 'state-wide statement on a Hochschule Bremen page' },
    { url: 'https://www.hs-bremen.de/en/study/during-your-studies/formalities/', quote: 'For re-registration for the winter semester 2026/2027, the semester fee is 442.40 €' },
    { exceptions: [{ url: 'https://www.graduatecenter.org/en/study-at-igc/before-you-start/tuition-fees.html', quote: 'At German public universities, MBA programs are typically offered as continuing education programs and therefore charge tuition fees.', text: "MBA and other continuing-education Master's programmes of its International Graduate Center charge tuition", affiliation: 'Hochschule Bremen ∙ International Graduate Center' }] }),
  // Bavarian institutions that charge non-EU tuition (Bavarian Higher Education Innovation Act, Art. 13 (3))
  184: {
    kind: 'charges', label: 'TUM', year: 'non-EU students enrolling since winter semester 2024/25',
    pages: [{ url: 'https://www.tum.de/en/studies/fees/tuition' }],
    levels: {
      bachelor: { perSemester: [2000, 3000], quote: 'For bachelor’s degree programs, tuition fees are usually 2,000 or 3,000 euros per semester.', approx: true },
      master: { perSemester: [4000, 6000], quote: 'For master’s degree programs, they are usually 4,000 or 6,000 euros per semester.', approx: true },
    },
    extraQuotes: ['From the winter semester 2024/25, tuition fees for international students from third countries will only be charged for newly enrolled students in Bachelor\'s and Master\'s degree programs.'],
  },
  70: {
    kind: 'charges', label: 'FAU', year: 'non-EU students enrolling from summer semester 2027', scrapeDo: true,
    pages: [{ url: 'https://www.fau.de/studium/international-studierende/bewerbung-und-einschreibung-fuer-internationale/studiengebuehren-fuer-studierende-aus-nicht-eu-staaten/' }],
    levels: { any: { perSemester: [1000, 6000], quote: 'Die Höhe der Studiengebühren reicht je nach Studiengang und Abschluss von 1.000 bis 6.000 Euro pro Semester.', range: true } },
    // the page lists the fee of every programme (Studiengang | Abschluss | ja/nein | Gebührenhöhe pro Semester):
    // per-level range + median of the fee-charging Bachelor's / Master's programmes are computed from that table
    table: true,
    extraQuotes: ['erhebt die FAU Studiengebühren pro Semester', 'Für Studierende aus Nicht-EU-Staaten, die sich ab Sommersemester 2027 neu einschreiben oder einen Fachwechsel durchführen'],
  },
  288: {
    kind: 'charges', label: 'THI', year: 'non-EU students starting from summer term 2026',
    pages: [{ url: 'https://www.thi.de/en/studies/international-degree-students/tuition-fees/' }],
    levels: {
      bachelor: { perSemester: [800], quote: 'From summer term 2026, Technische Hochschule Ingolstadt (THI) charges tuition fees of 800 euros per semester for Bachelor and 1.200 euros per semester for Master students from third countries' },
      master: { perSemester: [1200], quote: 'From summer term 2026, Technische Hochschule Ingolstadt (THI) charges tuition fees of 800 euros per semester for Bachelor and 1.200 euros per semester for Master students from third countries' },
    },
  },
  200: {
    kind: 'charges', label: 'TH Nürnberg', year: 'non-EEA students enrolling from winter semester 2026/27; some programmes exempt',
    pages: [{ url: 'https://www.th-nuernberg.de/internationales/ohm-international-school/internationale-semesterbeitraege/' }],
    levels: { any: { perSemester: [1000], quote: 'eine Studiengebühr in Höhe von 1.000,00 Euro pro Semester für Internationale Studierende aus Nicht-EWR-Ländern' } },
  },
  232: {
    kind: 'charges', label: 'TH Rosenheim', year: 'non-EU students since summer semester 2026',
    pages: [{ url: 'https://www.th-rosenheim.de/studium-und-weiterbildung/vor-dem-studium/was-kostet-das-studium-studierendenwerksbeitrag-und-studiengebuehren' }],
    levels: { any: { perSemester: [500], quote: 'Für internationale Studierende aus Drittstaaten fallen seit dem Sommersemester 2026 Studiengebühren in Höhe von 500 € pro immatrikuliertes Semester an.' } },
  },
};

// ---------------------------------------------------------------- text helpers ----------
const squash = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
const norm = (s) => fold(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const money = (n) => Math.round(n).toLocaleString('en-US');
const eur2 = (n) => n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
const regDomain = (url) => {
  if (!url) return '';
  const host = String(url).trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\d?\./, '');
  return host.split('.').filter(Boolean).slice(-2).join('.');
};
const origin = (url) => {
  const u = String(url || '').trim();
  if (!u) return null;
  try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).origin.toLowerCase(); } catch (_) { return null; }
};
const TRACKING_HOST_RE = /(^|\.)prf\.hn$/i; // affiliate redirect links used as "home page" in the register

function textOf(page) {
  if (page._text === undefined) {
    const $ = cheerio.load(String(page.body).replace(/>/g, '> '));
    $('head,script,style,noscript,svg,iframe,nav,footer').remove();
    page._text = squash($.root().text());
    page._norm = norm(page._text);
  }
  return page._text;
}
const inPage = (page, quote) => { textOf(page); return Boolean(quote) && page._norm.includes(norm(quote)); };
// whole page text including header/nav/footer (e.g. the operator named in a site footer)
const inPageFull = (page, quote) => {
  if (page._fullNorm === undefined) {
    const $ = cheerio.load(String(page.body).replace(/>/g, '> '));
    $('script,style,noscript,svg').remove();
    page._fullNorm = norm($.root().text());
  }
  return Boolean(quote) && page._fullNorm.includes(norm(quote));
};
const titleOf = (page) => squash(cheerio.load(String(page.body))('title').first().text());

// Amounts written as €376,80 / 376.80 Euro / EUR 1.500 / 1,500 euros / 1.000,00 Euro
const AMOUNT_RE = /(?:€|EUR|Euro)\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)(?!\d)|(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\s?(?:€|EUR\b|Euro\b|euros?\b)/gi;
function parseAmount(raw) {
  const s = String(raw);
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s)) return Number(s.replace(/\./g, '').replace(',', '.'));
  if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(s)) return Number(s.replace(/,/g, ''));
  if (/^\d+,\d{1,2}$/.test(s)) return Number(s.replace(',', '.'));
  return Number(s);
}
// every number in a quote ("2,000 or 3,000 euros", "von 1.000 bis 6.000 Euro")
const numbersIn = (quote) => [...String(quote).matchAll(/\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?/g)].map((m) => parseAmount(m[0]));
const amountsIn = (quote) => [...String(quote).matchAll(AMOUNT_RE)].map((m) => parseAmount(m[1] || m[2])).filter((n) => Number.isFinite(n));
// "winter semester 2026/27", "wintersemester 2026/2027", "winter semester of 2026-2027", "winterterm 26/27", "summer semester 2026"
const SEM_LABEL_RE = /(winter\s?(?:semester|term)|wintersemester|wise)(?:\s+of)?\s*((?:20)?\d\d)(?:\s*[/–-]\s*(?:20)?(\d\d))?|(summer\s?(?:semester|term)|sommersemester|sose)(?:\s+of)?\s*(20\d\d)/i;
function semesterLabel(quote) {
  const m = String(quote).match(SEM_LABEL_RE);
  if (!m) return null;
  if (m[2]) {
    const y = m[2].length === 2 ? `20${m[2]}` : m[2];
    return `winter semester ${y}/${m[3] ? m[3].slice(-2) : String(Number(y) + 1).slice(-2)}`;
  }
  return `summer semester ${m[5]}`;
}

// ---------------------------------------------------------------- HTTP with cache + scrape.do fallback ----------
const isBlocked = (status, body) => status === 403 || status === 429 || status === 503
  || /<title>\s*(Just a moment|Attention Required|Enodia Verification)/i.test(String(body).slice(0, 20000));

function decodeBody(buf, contentType, encoding) {
  let charset = encoding || (String(contentType || '').match(/charset=([\w-]+)/i) || [])[1];
  if (!charset) {
    const head = Buffer.from(buf).subarray(0, 4000).toString('latin1');
    charset = (head.match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1];
  }
  charset = String(charset || 'utf-8').toLowerCase();
  if (/^(iso-8859-1|latin-?1|windows-1252|cp1252|us-ascii)$/.test(charset)) {
    // Node decodes these labels as plain Latin-1 (0x80–0x9F → control characters); map them as Windows-1252
    return Buffer.from(buf).toString('latin1').replace(/[\x80-\x9f]/g, (c) => CP1252_C1[c.charCodeAt(0) - 0x80] || c);
  }
  try { return new TextDecoder(charset).decode(buf); } catch (_) { return new TextDecoder('utf-8').decode(buf); }
}
const CP1252_C1 = ['€', '', '‚', 'ƒ', '„', '…', '†', '‡', 'ˆ', '‰', 'Š', '‹', 'Œ', '', 'Ž', '', '', '‘', '’', '“', '”', '•', '–', '—', '˜', '™', 'š', '›', 'œ', '', 'ž', 'Ÿ'];

async function getPage(url, { scrapeDo = false, encoding = null } = {}) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${crypto.createHash('sha1').update(url).digest('hex')}.json`);
  if (!REFRESH && fs.existsSync(file)) {
    const cached = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) { counters.cacheHits += 1; return cached; }
  }
  let status = 0;
  let body = '';
  let finalUrl = url;
  let via = 'direct';
  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8', 'Accept-Language': 'en,de;q=0.8' },
        redirect: 'follow',
        signal: AbortSignal.timeout(45000),
      });
      counters.directRequests += 1;
      status = res.status;
      finalUrl = res.url || url;
      body = decodeBody(new Uint8Array(await res.arrayBuffer()), res.headers.get('content-type'), encoding);
      lastError = '';
      break;
    } catch (err) {
      lastError = err.cause?.code || err.message;
      if (attempt < 2) await sleep(2000);
    }
  }
  const unreachable = Boolean(lastError) && !status;
  if (isBlocked(status, body) || (unreachable && scrapeDo)) {
    if (!scrapeDo || NO_SCRAPEDO) { counters.failedRequests += 1; throw new Error(`${url} ${unreachable ? `unreachable (${lastError})` : `blocks direct requests (HTTP ${status})`}`); }
    if (!SCRAPE_DO_TOKEN) throw new Error('SCRAPE_DO_TOKEN missing in .env');
    if (counters.scrapeDoRequests >= MAX_SCRAPEDO) throw new Error(`scrape.do budget for this run (${MAX_SCRAPEDO}) reached before ${url}`);
    counters.scrapeDoRequests += 1;
    try {
      const res = await fetch(`https://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(180000) });
      status = res.status;
      body = decodeBody(new Uint8Array(await res.arrayBuffer()), res.headers.get('content-type'), encoding);
    } catch (err) {
      throw new Error(`scrape.do request failed for ${url} (${err.cause?.code || 'network error'})`); // never echo the API URL (token)
    }
    via = 'scrape.do';
    finalUrl = url;
    if (isBlocked(status, body)) throw new Error(`${url} still blocked via scrape.do (HTTP ${status})`);
  } else if (unreachable) {
    counters.failedRequests += 1;
    const err = new Error(`${url} unreachable (${lastError})`);
    err.code = lastError;
    throw err;
  }
  if (status < 200 || status >= 300) { counters.failedRequests += 1; throw new Error(`HTTP ${status} for ${url}`); }
  const entry = { url, finalUrl, via, status, fetchedAt: new Date().toISOString(), body };
  fs.writeFileSync(file, JSON.stringify(entry));
  return entry;
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

// A domain counts as gone only when the resolver answers ENOTFOUND for both its www host and its bare domain, and a
// control lookup of a register host works (so a resolver outage is never read as a dead domain). Timeouts, EAI_AGAIN
// and any other error leave it unconfirmed.
const DNS_CONTROL_HOST = 'www.hochschulkompass.de';
async function domainGone(url) {
  const o = origin(url);
  if (!o) return { gone: false, quote: 'no valid host' };
  const host = new URL(o).hostname;
  const hosts = [...new Set([host, regDomain(o)])];
  try { await dns.promises.lookup(DNS_CONTROL_HOST); } catch (err) {
    return { gone: false, hosts, code: err.code || null, quote: `DNS control lookup of ${DNS_CONTROL_HOST} failed (${err.code || err.message}) — resolver not usable in this run` };
  }
  const results = [];
  for (const hn of hosts) {
    try { const r = await dns.promises.lookup(hn); results.push({ host: hn, code: null, text: `${hn} resolves (${r.address})` }); } catch (err) { results.push({ host: hn, code: err.code || err.message, text: `${hn}: ${err.code || err.message}` }); }
  }
  const gone = results.every((r) => r.code === 'ENOTFOUND');
  return { gone, hosts, codes: results.map((r) => r.code), quote: `DNS lookup — ${results.map((r) => r.text).join('; ')} (control ${DNS_CONTROL_HOST} resolves)` };
}

// The register's home page, loaded to confirm it works: a move to another domain is followed; on the same domain the
// register host is kept (with the protocol the site actually uses). Affiliate links / hosts without a TLD are unusable.
async function registerWebsite(h) {
  const listed = origin(h.homepage);
  if (!listed || !validHost(listed) || TRACKING_HOST_RE.test(new URL(listed).hostname)) {
    return { site: null, reachable: false, evidence: { what: 'register home page unusable (no valid host, or an affiliate redirect link)', url: HRK_LIST_URL, quote: h.homepage || null, verified: false } };
  }
  // a campaign link (utm_… parameters) to a sub-site, e.g. meine.uni-paderborn.de: use the main www host of that domain
  // when it loads and stays on the same domain
  if (/[?&]utm_/i.test(h.homepage) && !/^https?:\/\/www\./i.test(listed)) {
    const main = `https://www.${regDomain(listed)}`;
    try {
      const p = await getPage(`${main}/`);
      if (regDomain(p.finalUrl) === regDomain(listed)) {
        return { site: main, reachable: true, evidence: { what: `register home page is a campaign link (${listed}); main site of the same domain loaded`, url: h.homepage, quote: `${p.finalUrl} — ${titleOf(p)}`, verified: true } };
      }
    } catch (_) { /* fall back to the listed host */ }
  }
  try {
    const p = await getPage(`${listed}/`);
    const fin = origin(p.finalUrl);
    let site = listed;
    if (fin && validHost(fin) && !TRACKING_HOST_RE.test(new URL(fin).hostname)) {
      site = regDomain(fin) !== regDomain(listed) ? fin : `${new URL(fin).protocol}//${new URL(listed).hostname}`;
    }
    return { site, reachable: true, evidence: { what: 'register home page (loaded)', url: h.homepage, quote: `${p.finalUrl} — ${titleOf(p)}`, verified: true } };
  } catch (err) {
    return { site: listed, reachable: false, evidence: { what: 'register home page (not reachable directly)', url: h.homepage, quote: err.message, verified: false } };
  }
}

// ---------------------------------------------------------------- HRK list ----------
function parseTsv(t) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < t.length; i += 1) {
    const ch = t[i];
    if (quoted) {
      if (ch === '"') { if (t[i + 1] === '"') { cell += '"'; i += 1; } else quoted = false; } else cell += ch;
      continue;
    }
    if (ch === '"' && cell === '') { quoted = true; continue; }
    if (ch === '\t') { row.push(cell); cell = ''; continue; }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && t[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
      continue;
    }
    cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.length > 1);
}

// The register file is Windows-1252; a C1 byte left undecoded (e.g. 0x96 en dash in an older cache entry) is mapped here
const fixC1 = (s) => String(s).replace(/[\x80-\x9f]/g, (c) => CP1252_C1[c.charCodeAt(0) - 0x80] || c);
function loadHrk(page) {
  const body = fixC1(page.body);
  const rows = parseTsv(body);
  const header = rows[0];
  const col = (name) => header.indexOf(name);
  const need = ['Hs-Nr.', 'Hochschulname', 'Adressname der Hochschule', 'Hochschultyp', 'Trägerschaft', 'Bundesland', 'Ort (Hausanschrift)', 'Home Page'];
  const missing = need.filter((n) => col(n) < 0);
  if (missing.length) throw new Error(`HRK list: columns missing (${missing.join(', ')})`);
  return rows.slice(1).map((r) => {
    const get = (n) => squash(r[col(n)] || '');
    const e = {
      nr: get('Hs-Nr.'), shortName: get('Hochschulkurzname'), name: get('Hochschulname'), addressName: get('Adressname der Hochschule'),
      type: get('Hochschultyp'), sponsorship: get('Trägerschaft'), state: get('Bundesland'), city: get('Ort (Hausanschrift)'),
      homepage: get('Home Page'), students: Number(get('Anzahl Studierende')) || null, doctorate: get('Promotionsrecht'),
    };
    // verbatim evidence: the register row's own cells, as they appear (tab-separated) in the downloaded file
    e.quote = [r[col('Hochschulname')], r[col('Adressname der Hochschule')], r[col('Hochschultyp')], r[col('Trägerschaft')], r[col('Bundesland')]].join('\t');
    // cells that the file wraps in "…" (names with line breaks or runs of spaces) are checked cell by cell
    e.quoteVerified = body.includes(e.quote) || e.quote.split('\t').every((c) => body.includes(c));
    // doctoral-degree rights: the row's adjacent cells Bundesland | Anzahl Studierende | Gründungsjahr | Promotionsrecht | Habilitationsrecht
    if (col('Promotionsrecht') >= 0) {
      e.doctorateQuote = ['Bundesland', 'Anzahl Studierende', 'Gründungsjahr', 'Promotionsrecht', 'Habilitationsrecht'].map((n) => r[col(n)] ?? '').join('\t');
      e.doctorateVerified = body.includes(e.doctorateQuote);
    }
    return e;
  }).filter((e) => e.nr && e.name);
}

const NAME_NOISE_RE = /\s*(?:,\s*gemeinnützige GmbH|gemeinnützige Betriebsgesellschaft mbH|\bg?GmbH\b|\be\.\s?V\.|\s+[-–]\s+staatlich anerkannt\b.*|\s+staatlich anerkannte?\b.*)$/i;
// the part after " - " is dropped when it is a tagline / English name ("Hochschule Anhalt - Anhalt University of Applied
// Sciences", "Hochschule Aalen - Technik, Wirtschaft und Gesundheit"), not when it is part of the name ("Eichstätt - Ingolstadt")
const TAGLINE_RE = /,|universit|hochschule|college|school|applied|technolog|staatlich|wissenschaft/i;
function officialName(h) {
  let n = squash(h.name).replace(/^"|"$/g, '');
  n = n.replace(NAME_NOISE_RE, '');
  const dash = n.split(/\s+[-–]\s+/);
  if (dash.length > 1 && dash[0].split(' ').length >= 2 && TAGLINE_RE.test(dash.slice(1).join(' - '))) n = dash[0];
  n = n.replace(/,\s+(?:Hochschule für|University of)\b.*$/i, ''); // "Hochschule Reutlingen, Hochschule für Technik-…"
  return squash(n.replace(NAME_NOISE_RE, '')).replace(/[\s,]*[-–,]\s*$/, ''); // "Hochschule Fresenius Heidelberg –"
}
const nameVariants = (h) => [...new Set([h.name, h.addressName, officialName(h), squash(h.name).split(/\s+[-–]\s+/)[0]].map(norm).filter(Boolean))];
const isPublic = (h) => /öffentlich-rechtlich/i.test(h.sponsorship);
const typeOf = (h) => (isPublic(h) ? 'PUBLIC' : 'PRIVATE');
const TYPE_LABEL = { 'Universitäten': 'university', 'Fachhochschulen / HAW': 'university of applied sciences (Fachhochschule / HAW)', 'Künstlerische Hochschulen': 'university of art / music', 'Hochschulen eigenen Typs': 'higher education institution of its own type', 'Verwaltungshochschule': 'public-administration college' };
const SPONSOR_LABEL = { 'öffentlich-rechtlich': 'public', 'privat, staatlich anerkannt': 'private, state-recognised', 'kirchlich, staatlich anerkannt': 'church-run, state-recognised' };

// City: keep our value when it is the register seat (or its English name), a city where the institution runs DAAD-listed
// programmes, or a German city named in the record's own (or former) name (a campus); otherwise propose the register
// seat. "German city" = a seat in the HRK register or a DAAD programme city (filled in main), so a word of the name
// that is not a German city ("Charlotte" in "Charlotte Fresenius Hochschule") does not count.
const CITY_EN = { münchen: 'Munich', köln: 'Cologne', nürnberg: 'Nuremberg' }; // as already used in our Germany records
const CITY_ALT = { hannover: ['hanover'], 'frankfurt am main': ['frankfurt'] };
const KNOWN_CITIES = new Set();
const addKnownCity = (c) => { const k = norm(c).split(' ')[0]; if (k && k.length > 3) KNOWN_CITIES.add(k); };
function cityMatches(dbCity, hrkCity, extraCities = [], recordNames = []) {
  if (!dbCity) return false;
  const a = norm(dbCity);
  if (!a || /^(germany|deutschland)$/.test(a)) return false;
  const candidates = [hrkCity, ...extraCities].filter(Boolean);
  for (const c of candidates) {
    const b = norm(c);
    if (!b) continue;
    const alts = [b, norm(CITY_EN[String(c).toLowerCase()] || ''), ...(CITY_ALT[String(c).toLowerCase()] || [])].filter(Boolean);
    if (alts.includes(a)) return true;
    const bFirst = b.split(' ')[0];
    if (a.split(' ')[0] === bFirst || a.split(/[\s/]+/).includes(bFirst)) return true;
  }
  const first = a.split(' ')[0];
  return a.length > 3 && KNOWN_CITIES.has(first) && [].concat(recordNames).some((n) => norm(n).split(' ').includes(first));
}
const validHost = (u) => { try { return /\.[a-z]{2,}$/i.test(new URL(u).hostname); } catch (_) { return false; } };

// ---------------------------------------------------------------- DAAD ----------
const LEVEL_OF_TYPE = { 1: "Bachelor's", 2: "Master's", 3: 'PhD' };
const LEVEL_ORDER = ["Bachelor's", "Master's", 'PhD'];
// degree wrappers around the subject are dropped (the level is stored in degreeLevels): "Master of Science in
// Cartography" → "Cartography", "Aerospace (MSc)" / "Economics and Finance, MSc" / "… – MSc" → subject only
const DEGREE_PREFIX_RE = /^(?:(?:Master|Bachelor)(?:'s|’s)?\s+of\s+(?:Science|Arts|Engineering|Laws|Education|Business Administration|Fine Arts|Music|Public Health|Public Policy)\s+in\s+|(?:M|B)\.?\s?(?:Sc|A|Eng)\.?\s+(?:in\s+)?(?=[A-Z]))/;
const DEGREE_SUFFIX_RE = /(?:\s*\((?:M|B)\.?\s?(?:Sc|A|Eng|Ed|Mus|FA)\.?\)|,\s*(?:M|B)\.?\s?(?:Sc|A|Eng)\.?|\s+[-–—]\s*(?:M|B)\.?\s?(?:Sc|A|Eng)\.?|\s+(?:M|B)\.?\s?(?:Sc|A|Eng)\.?)\s*$/;
function cleanCourseName(name) {
  let t = squash(name);
  const a = t.replace(DEGREE_PREFIX_RE, '');
  if (a.length >= 3 && /^[A-Za-zÄÖÜäöü]/.test(a)) t = a;
  const b = t.replace(DEGREE_SUFFIX_RE, '');
  if (b.length >= 3) t = b;
  return squash(t);
}
function daadCourses(programmes) {
  const order = { "Master's": 0, "Bachelor's": 1, PhD: 2 };
  const sorted = [...programmes].sort((a, b) => order[a.level] - order[b.level] || a.name.localeCompare(b.name));
  const seen = new Set();
  const courses = [];
  for (const p of sorted) {
    const name = cleanCourseName(p.name);
    const k = norm(name);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    courses.push(name);
  }
  const levels = new Set(programmes.map((p) => p.level));
  return { courses: courses.slice(0, COURSE_CAP), totalAvailable: courses.length, degreeLevels: LEVEL_ORDER.filter((l) => levels.has(l)) };
}
// degreeLevels: a level is PROVEN when DAAD lists a programme of that level, or (PhD) when the HRK register gives the
// institution the right to award doctorates (Promotionsrecht = Ja). DAAD lists international programmes only, so a level
// missing from DAAD is never removed: existing records get the union of their levels and the proven ones, and the field
// is official (dataSource.fields) only when every level of the value is proven.
const LEVEL_CANON = (l) => {
  const s = String(l || '').toLowerCase();
  if (/bachelor|undergrad/.test(s)) return "Bachelor's";
  if (/master|postgrad/.test(s)) return "Master's";
  if (/phd|ph\.d|doctor/.test(s)) return 'PhD';
  return String(l);
};
function provenLevels(daadLevels, h, siteLevels = []) {
  const proven = new Set([...daadLevels, ...siteLevels]);
  if (/^ja$/i.test(h.doctorate || '') && h.doctorateVerified) proven.add('PhD');
  return LEVEL_ORDER.filter((l) => proven.has(l));
}
// curated LEVEL_EVIDENCE of an institution, checked on its page in this run → { levels, evidence }
async function siteLevelsFor(nr) {
  const levels = [];
  const evidence = [];
  for (const x of LEVEL_EVIDENCE[nr] || []) {
    let ok = false;
    let error = null;
    try { ok = inPage(await getPage(x.url), x.quote); } catch (err) { error = err.message; }
    evidence.push({ what: `${x.level} level offered (institution's own page)`, url: x.url, quote: x.quote, verified: ok, note: x.note, ...(error ? { error } : {}) });
    if (ok) levels.push(x.level);
  }
  return { levels, evidence };
}
// Home page of a NEW institution (created only when its levels are complete): DAAD lists international programmes
// only, so a Bachelor's / Master's level missing from DAAD may be shown by the institution's own home page (link or
// heading such as "Bachelorstudiengänge", "Master's programmes"). The matched text with its context is stored verbatim.
const HOME_LEVEL_RE = {
  "Bachelor's": /\bBachelor(?:studiengängen|studiengänge|studiengang|studium|-Studiengängen|-Studiengänge|-Studiengang|programmes|programme|['’]s degree programmes?|['’]s programmes?|['’]s programs?|['’]s degrees| degree programmes?| programmes?| programs)\b|\bBachelor of (?:Arts|Science|Engineering|Laws|Education|Music|Fine Arts)\b/i,
  "Master's": /\bMaster(?:studiengängen|studiengänge|studiengang|studium|-Studiengängen|-Studiengänge|-Studiengang|programmes|programme|['’]s degree programmes?|['’]s programmes?|['’]s programs?|['’]s degrees| degree programmes?| programmes?| programs)\b|\bMaster of (?:Arts|Science|Engineering|Laws|Education|Music|Fine Arts|Business Administration)\b/i,
};
async function homePageLevels(urls, need) {
  const levels = [];
  const evidence = [];
  for (const level of need) {
    for (const url of [...new Set(urls.filter(Boolean))]) {
      let page;
      try { page = await getPage(url); } catch (err) { evidence.push({ what: `${level} level offered (institution's home page)`, url, quote: null, verified: false, error: err.message }); continue; }
      const $ = cheerio.load(String(page.body).replace(/>/g, '> '));
      $('script,style,noscript,svg').remove();
      const text = squash($.root().text());
      const re = new RegExp(HOME_LEVEL_RE[level].source, 'gi');
      let found = null;
      for (const m of text.matchAll(re)) {
        // the match with up to ~50 characters of context on each side, cut at word boundaries
        const start = Math.max(0, m.index - 50);
        const end = Math.min(text.length, m.index + m[0].length + 50);
        let quote = text.slice(start, end);
        if (start > 0) quote = quote.replace(/^\S*\s/, '');
        if (end < text.length) quote = quote.replace(/\s\S*$/, '');
        quote = squash(quote);
        if (HOME_LEVEL_RE[level].test(quote) && inPageFull(page, quote)) { found = { term: m[0], quote }; break; }
      }
      if (!found) continue;
      evidence.push({ what: `${level} level offered (institution's home page: "${found.term}")`, url: page.finalUrl || url, quote: found.quote, verified: true });
      levels.push(level);
      break;
    }
  }
  return { levels, evidence };
}
function levelsProposal(existing, proven) {
  const ex = [...new Set((existing || []).map(LEVEL_CANON))];
  const union = [...LEVEL_ORDER.filter((l) => proven.includes(l) || ex.includes(l)), ...ex.filter((l) => !LEVEL_ORDER.includes(l))];
  // complete = Bachelor's, Master's and PhD all proven (nothing can be missing) and nothing unproven in the value
  const official = LEVEL_ORDER.every((l) => proven.includes(l)) && union.every((l) => proven.includes(l));
  const addsLevel = proven.some((l) => !ex.includes(l));
  // only a value that adds a proven level, or that is entirely proven, is proposed; otherwise the record keeps its value
  return { value: union, official, propose: addsLevel || official };
}
// fee status of the institution's DAAD-listed programmes per level (DAAD's own "tuitionFees" field)
function daadFeeTally(programmes) {
  const t = {};
  for (const p of programmes) {
    const k = /^no tuition/i.test(p.tuitionFees || '') ? 'free' : /varies/i.test(p.tuitionFees || '') ? 'varies' : /\d/.test(p.tuitionFees || '') ? 'paid' : 'notStated';
    t[p.level] ||= { free: 0, paid: 0, varies: 0, notStated: 0 };
    t[p.level][k] += 1;
  }
  return t;
}
function daadSummary(programmes) {
  const tally = (f) => programmes.reduce((acc, p) => { const k = f(p) ?? 'not stated'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  return {
    programmes: programmes.length,
    byLevel: tally((p) => p.level),
    tuitionAsListedByDaad: tally((p) => p.tuitionFees),
    languages: tally((p) => (p.languages || []).join(' + ') || null),
    examples: programmes.slice(0, 4).map((p) => ({ name: p.name, level: p.level, tuitionFees: p.tuitionFees, applicationDeadline: p.applicationDeadline, beginning: p.beginning, link: p.link })),
  };
}

// ---------------------------------------------------------------- fees ----------
const median = (arr) => { const s = [...arr].sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
// excluded from the per-level median (the convention of all sync scripts)
const MEDICAL_RE = /^(?:human|zahn|tier)?medizin$|^(?:human |veterinary )?medicine$|dentist|zahnheilkunde|veterin|pilot/i;
// Per-programme fee table (FAU): Studiengang | Abschluss | Studiengebühren Nicht-EU ja/nein | Gebührenhöhe pro Semester
function feeTableRows(page) {
  const $ = cheerio.load(String(page.body));
  const rows = [];
  $('table').each((_, t) => {
    const head = $(t).find('tr').first().find('th,td').map((i, e) => squash($(e).text())).get();
    const iDeg = head.findIndex((x) => /^Abschluss$/i.test(x));
    const iYes = head.findIndex((x) => /ja\s*\/\s*nein/i.test(x));
    const iAmt = head.findIndex((x) => /Gebührenhöhe pro Semester/i.test(x));
    if (iDeg < 0 || iYes < 0 || iAmt < 0) return;
    $(t).find('tr').slice(1).each((__, tr) => {
      const cells = $(tr).find('th,td').map((i, e) => squash($(e).text())).get();
      const degree = cells[iDeg] || '';
      const level = /^Bachelor/i.test(degree) ? 'bachelor' : /^(?:Master|Magister)/i.test(degree) ? 'master' : null;
      if (!level || !cells[0]) return;
      const charged = /^ja\b/i.test(cells[iYes] || '');
      const amounts = amountsIn(cells[iAmt] || '');
      rows.push({ programme: cells[0].replace(/\*+$/, ''), degree, level, charged: cells[iYes] || '', perSemester: charged && amounts.length ? amounts[0] : null, quote: cells.filter(Boolean).join(' ') });
    });
  });
  return rows;
}

// dprog = the institution's DAAD-listed programmes; daadOk = the DAAD list was loaded in this run (otherwise a 0 fee
// cannot be cross-checked and is never set)
async function feeFor(nr, h, fx, bwRule, dprog = [], daadOk = false) {
  const cfg = FEE_EVIDENCE[nr];
  if (cfg?.kind === 'free') {
    const out = { kind: 'free', evidence: [], problems: [], withheld: [], caveats: [] };
    // which levels the verified quotes cover: Bachelor's (first degree) and Master's ('all' or 'consecutive' only)
    const cover = { bachelor: false, master: null };
    for (const q of cfg.noTuition) {
      const covers = q.covers || 'all';
      try {
        const p = await getPage(q.url);
        const ok = inPage(p, q.quote);
        out.evidence.push({ what: 'no tuition fees', url: q.url, quote: q.quote, verified: ok, covers, note: q.note });
        if (!ok) out.problems.push(`no-tuition quote not found on ${q.url}`);
        else {
          cover.bachelor = true;
          if (covers === 'all') cover.master = 'all';
          else if (covers === 'consecutive' && cover.master !== 'all') cover.master = 'consecutive';
        }
      } catch (err) { out.problems.push(err.message); out.evidence.push({ what: 'no tuition fees', url: q.url, quote: q.quote, verified: false, error: err.message }); }
    }
    // the page's own exceptions must be verified too, otherwise the display would claim more than the page says
    const exceptions = [];
    for (const x of cfg.exceptions || []) {
      try {
        const p = await getPage(x.url);
        const ok = inPage(p, x.quote) && (!x.affiliation || inPageFull(p, x.affiliation));
        out.evidence.push({ what: 'exception stated by the institution', url: x.url, quote: x.quote, ...(x.affiliation ? { affiliationQuote: x.affiliation } : {}), verified: ok, display: x.text });
        if (ok) exceptions.push(x.text); else out.problems.push(`exception quote not found on ${x.url}`);
      } catch (err) { out.problems.push(err.message); out.evidence.push({ what: 'exception stated by the institution', url: x.url, quote: x.quote, verified: false, error: err.message }); }
    }
    if (cfg.semester) {
      try {
        const p = await getPage(cfg.semester.url);
        const ok = inPage(p, cfg.semester.quote);
        const amounts = amountsIn(cfg.semester.quote);
        const amount = amounts[amounts.length - 1];
        out.semester = ok && amount ? { amount, label: semesterLabel(cfg.semester.quote), approx: Boolean(cfg.semester.approx) } : null;
        out.evidence.push({ what: 'semester contribution', url: cfg.semester.url, quote: cfg.semester.quote, verified: ok, amountEUR: amount ?? null });
        if (!ok) out.problems.push(`semester-contribution quote not found on ${cfg.semester.url}`);
      } catch (err) { out.problems.push(err.message); }
    }
    // a caveat on the page goes to the report (it does not block the claim; the quote must still be on the page)
    if (cfg.caveat) {
      try {
        const p = await getPage(cfg.caveat.url);
        const ok = inPage(p, cfg.caveat.quote);
        out.evidence.push({ what: 'caveat (reviewer check)', url: cfg.caveat.url, quote: cfg.caveat.quote, verified: ok, note: cfg.caveat.text });
        if (ok) out.caveats.push(`${h.officialName}: ${cfg.caveat.text} — quote: "${cfg.caveat.quote}" (${cfg.caveat.url})`);
      } catch (err) { out.problems.push(err.message); }
    }
    const noTuitionEv = out.evidence.filter((e) => e.what === 'no tuition fees');
    out.ok = noTuitionEv.length > 0 && noTuitionEv.every((e) => e.verified) && exceptions.length === (cfg.exceptions || []).length;
    if (!out.ok) return out;

    // DAAD consistency check per level: 0 only when fewer than one third of the institution's DAAD-listed programmes of
    // that level charge tuition (DAAD "tuitionFees" with an amount; "tuition varies" counts in the total, not as
    // charging) — so the median is 0 AND no substantial share of the international programmes students see in the
    // course list charges. A level DAAD does not list keeps the page's statement; if DAAD is unavailable in this run
    // nothing can be cross-checked → no 0 at all.
    const tally = daadFeeTally(dprog);
    out.daadFeeTally = daadOk ? tally : null;
    const listed = (t) => t.paid + t.free + t.varies;
    const daadStatus = (lvl) => {
      if (!daadOk) return 'unknown';
      const t = tally[lvl];
      if (!t || !listed(t)) return 'not listed';
      return t.paid * 3 < listed(t) ? 'mostly free (under one third charge)' : 'one third or more charge';
    };
    const zeroOk = (lvl) => ['mostly free (under one third charge)', 'not listed'].includes(daadStatus(lvl));
    const daadReason = (lvl) => (daadStatus(lvl) === 'unknown'
      ? `DAAD International Programmes unavailable in this run — a 0 fee cannot be cross-checked against the institution's ${lvl} programmes, so it is not set`
      : `DAAD lists ${tally[lvl].paid} of ${listed(tally[lvl])} international ${lvl} programmes of this institution as charging tuition (one third or more); the page's no-tuition statement does not make the typical ${lvl} fee 0 — left open`);
    const values = {};
    if (cover.bachelor && zeroOk("Bachelor's")) values.tuitionFeeUSD = 0;
    else out.withheld.push({ field: 'tuitionFeeUSD', reason: cover.bachelor ? daadReason("Bachelor's") : "the quotes do not cover Bachelor's programmes" });
    if (cover.master && zeroOk("Master's")) values.graduateTuitionUSD = 0;
    else {
      out.withheld.push({
        field: 'graduateTuitionUSD',
        reason: cover.master ? daadReason("Master's") : `the quotes cover Bachelor's / first-degree programmes only (${noTuitionEv.map((e) => e.note || e.covers).join('; ')})`,
      });
    }
    out.daadCheck = { bachelor: daadStatus("Bachelor's"), master: daadStatus("Master's") };
    const lead = cfg.lead || 'No tuition fees';
    let head;
    if (cover.master === 'all') head = `${lead}${cfg.qualifier ? ` (${cfg.qualifier})` : ''}`;
    else if (cover.master === 'consecutive') head = `${lead} for Bachelor's (first degree) and consecutive Master's programmes`;
    else head = `${lead} for Bachelor's (first degree) programmes; Master's fees not verified`;
    const notes = [...exceptions];
    let daadUsed = false;
    for (const lvl of ["Master's", "Bachelor's"]) {
      const t = daadOk ? tally[lvl] : null;
      if (!t || !t.paid) continue;
      daadUsed = true;
      notes.push(`${t.paid} of ${listed(t)} international ${lvl} programmes listed by DAAD charge tuition${t.varies ? ` (${t.varies} listed as "tuition varies")` : ''}`);
    }
    const sc = out.semester;
    const scText = sc ? ` · semester contribution ${sc.approx ? 'approx. ' : ''}EUR ${eur2(sc.amount)} per semester (${sc.label || 'current'})` : ' · a semester contribution applies';
    out.urls = [...new Set(out.evidence.filter((e) => e.verified && e.what !== 'caveat (reviewer check)').map((e) => e.url))];
    values.tuition = `${head}${notes.map((n) => `; ${n}`).join('')}${scText} — official ${h.officialName} page${out.urls.length > 1 ? 's' : ''}${cfg.sourceNote ? ` (${cfg.sourceNote})` : ''}${daadUsed ? '; DAAD International Programmes' : ''}`;
    if (daadUsed) out.urls.push(DAAD_SEARCH_PAGE);
    out.values = values;
    return out;
  }
  if (cfg?.kind === 'charges') {
    const out = { kind: 'charges', evidence: [], problems: [] };
    let page = null;
    try { page = await getPage(cfg.pages[0].url, { scrapeDo: Boolean(cfg.scrapeDo) }); } catch (err) { out.problems.push(err.message); out.ok = false; return out; }
    const verifiedLevels = {};
    for (const [level, l] of Object.entries(cfg.levels)) {
      const ok = inPage(page, l.quote) && l.perSemester.every((n) => numbersIn(l.quote).includes(n));
      out.evidence.push({ what: `non-EU tuition (${level})`, url: page.url, quote: l.quote, verified: ok, perSemesterEUR: l.perSemester, via: page.via });
      if (ok) verifiedLevels[level] = l; else out.problems.push(`${level} tuition quote not verified on ${page.url}`);
    }
    for (const q of cfg.extraQuotes || []) out.evidence.push({ what: 'context', url: page.url, quote: q, verified: inPage(page, q) });
    out.ok = Object.keys(verifiedLevels).length > 0;
    if (!out.ok) return out;
    const yearly = (l) => l.perSemester.map((n) => n * 2);
    const span = (arr) => (arr.length > 1 && Math.min(...arr) !== Math.max(...arr) ? `EUR ${money(Math.min(...arr))}–${money(Math.max(...arr))}` : `EUR ${money(arr[0])}`);
    const mid = (arr) => (Math.min(...arr) + Math.max(...arr)) / 2;
    const values = {};

    // per-programme fee table → per-level range + median (fee-charging programmes; medicine etc. excluded)
    if (cfg.table) {
      const rows = feeTableRows(page);
      const stats = {};
      const range = verifiedLevels.any ? verifiedLevels.any.perSemester : null;
      for (const level of ['bachelor', 'master']) {
        const all = rows.filter((r) => r.level === level);
        const charged = all.filter((r) => r.perSemester && !MEDICAL_RE.test(r.programme) && inPage(page, r.quote));
        if (!charged.length) continue;
        const amounts = charged.map((r) => r.perSemester);
        if (range && amounts.some((a) => a < Math.min(...range) || a > Math.max(...range))) { out.problems.push(`${level}: table amounts outside the page's stated range`); continue; }
        const med = median(amounts);
        const pick = (v) => charged.find((r) => r.perSemester === v)?.quote;
        stats[level] = { programmes: all.length, feeCharging: charged.length, notChargedOrOther: all.length - charged.length, minPerSemester: Math.min(...amounts), maxPerSemester: Math.max(...amounts), medianPerSemester: med };
        out.evidence.push({ what: `non-EU tuition per programme (${level}, fee table on the page)`, url: page.url, verified: true, stats: stats[level], quotes: [...new Set([pick(Math.min(...amounts)), pick(med), pick(Math.max(...amounts))].filter(Boolean))] });
      }
      if (stats.bachelor || stats.master) {
        const parts = [];
        for (const [level, label] of [['master', "Master's"], ['bachelor', "Bachelor's"]]) {
          const s = stats[level];
          if (s) parts.push(`${label} ${span([s.minPerSemester * 2, s.maxPerSemester * 2])} per year (median EUR ${money(s.medianPerSemester * 2)}, ${s.feeCharging} programmes)`);
        }
        if (fx) {
          if (stats.bachelor) values.tuitionFeeUSD = Math.round(stats.bachelor.medianPerSemester * 2 * fx.rate);
          if (stats.master) values.graduateTuitionUSD = Math.round(stats.master.medianPerSemester * 2 * fx.rate);
        }
        const usd = [values.graduateTuitionUSD && `Master's ≈ US$${money(values.graduateTuitionUSD)}`, values.tuitionFeeUSD && `Bachelor's ≈ US$${money(values.tuitionFeeUSD)}`].filter(Boolean).join(', ');
        values.tuition = `${parts.join(' · ')} tuition for ${cfg.year} (amount set per programme)${usd ? `; ${usd} (medians)` : ''}; plus semester contribution — official ${cfg.label} page`;
        out.values = values;
        out.urls = [page.url];
        return out;
      }
    }

    const parts = [];
    const b = verifiedLevels.bachelor || verifiedLevels.any;
    const m = verifiedLevels.master || verifiedLevels.any;
    if (verifiedLevels.any) parts.push(`${span(yearly(verifiedLevels.any))} per year (${span(verifiedLevels.any.perSemester)} per semester)`);
    else {
      if (m) parts.push(`Master's ${span(yearly(m))}`);
      if (b) parts.push(`Bachelor's ${span(yearly(b))}`);
    }
    const wideRange = (l) => l && l.range;
    if (fx) {
      if (b && !wideRange(b)) values.tuitionFeeUSD = Math.round(mid(yearly(b)) * fx.rate);
      if (m && !wideRange(m)) values.graduateTuitionUSD = Math.round(mid(yearly(m)) * fx.rate);
    }
    const approx = Object.values(verifiedLevels).some((l) => l.approx);
    const perYear = verifiedLevels.any ? '' : ' per year';
    const usd = verifiedLevels.any
      ? (values.tuitionFeeUSD ? `≈ US$${money(values.tuitionFeeUSD)} per year` : '')
      : [values.graduateTuitionUSD && `Master's ≈ US$${money(values.graduateTuitionUSD)}`, values.tuitionFeeUSD && `Bachelor's ≈ US$${money(values.tuitionFeeUSD)}`].filter(Boolean).join(', ');
    values.tuition = `${parts.join(' · ')}${perYear} tuition for ${cfg.year}${approx ? ' (usual amounts; varies by programme)' : ''}${usd ? `; ${usd}` : ''}; plus semester contribution — official ${cfg.label} page`;
    if (!('tuitionFeeUSD' in values)) values.tuitionFeeUSD = null;
    if (!('graduateTuitionUSD' in values)) values.graduateTuitionUSD = null;
    out.values = values;
    out.urls = [page.url];
    return out;
  }
  if (bwRule && h.state === 'Baden-Württemberg' && isPublic(h) && h.type !== 'Verwaltungshochschule') {
    if (!bwRule.ok) return { kind: 'bw', ok: false, problems: ['Baden-Württemberg ministry quotes not verified'] };
    const usd = fx ? Math.round(3000 * fx.rate) : null;
    return {
      kind: 'bw', ok: true, evidence: bwRule.evidence, urls: bwRule.urls, problems: [],
      values: {
        tuition: `Non-EU students: EUR 3,000 per year (EUR 1,500 per semester)${usd ? ` ≈ US$${money(usd)}` : ''} tuition at Baden-Württemberg state universities (state law since winter semester 2017/18, exemptions apply; EU/EEA students pay none), plus semester contribution — Baden-Württemberg Ministry of Science (MWK)`,
        tuitionFeeUSD: usd, graduateTuitionUSD: usd,
      },
    };
  }
  return null;
}

// ---------------------------------------------------------------- revert ----------
async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  if (report.summary?.mode !== 'apply') {
    throw new Error('this report is from a dry run (nothing was written); only reports of an --apply run can be reverted');
  }
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  let restored = 0;
  for (const c of report.changes || []) {
    const set = {};
    const unset = {};
    for (const [k, v] of Object.entries(c.diff)) {
      if (v.from === undefined) unset[k] = ''; else set[k] = v.from;
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id), 'dataSource.runId': report.runId }, update);
    restored += r.modifiedCount;
  }
  // Records created by this sync are hidden (isActive:false), never deleted
  // (matched by runId + createdBySync, so inserts of a run that stopped before its report was rewritten are found too)
  // (createdRunId: a later run that updated such a record keeps the id of the run that created it)
  const r = await col.updateMany({ 'dataSource.createdBySync': SCRIPT_ID, $or: [{ 'dataSource.runId': report.runId }, { 'dataSource.createdRunId': report.runId }], isActive: { $ne: false } }, { $set: { isActive: false } });
  const hidden = r.modifiedCount;
  console.log(`REVERTED: ${restored} records restored, ${hidden} created records hidden (isActive:false) from ${reportFile}`);
  await mongoose.disconnect();
}

const METHOD_NOTES = [
  'Institutions = HRK Hochschulkompass list "alle Hochschulen als TXT-Datei" (hs_liste.txt). A DB record is matched by its name (official name, address name or the part before " - "), a curated alias (renamed/merged institutions, with website-redirect evidence checked live) or its website domain.',
  'One record is kept per HRK institution (a curated own-English-name alias first — e.g. "RWTH Aachen University", the QS name — independent of any page fetch; then the one whose name matches the register; else the one whose website matches); the others are hidden as duplicates. Kept records get the register name (legal-form suffixes and taglines after " - " dropped), the register home page when our domain differs, and type PUBLIC (öffentlich-rechtlich) or PRIVATE (privat or kirchlich, staatlich anerkannt). City: the register seat ("Ort (Hausanschrift)", the legal address) is filled in only when our city is missing/"Germany" or is merely a word of the institution\'s name that is not a German city known from the register or DAAD (e.g. "Charlotte"); any other city that differs from the seat (often a teaching campus — Berlin, Cologne, Bad Honnef…) is kept, flagged under unverifiedFields, and the seat is stored as dataSource.registerSeat.',
  'Hidden (isActive:false, never deleted): duplicates; public-administration colleges (HRK type "Verwaltungshochschule", or police/tax/justice/administration colleges not in the HRK list), which HRK says only civil servants can attend; and records not in the HRK list with positive evidence checked in this run (a verbatim statement on the institution\'s own site — foreign-degree provider, closure; a domain whose DNS lookup answers ENOTFOUND while a control lookup works; a stored website that is the register website of another HRK institution which has or gets its own record). Absence from the list alone never hides a record; other records not in the list are only flagged, and a stored website that redirects to another domain or belongs to another register institution is reported as such, not as the record\'s own live site.',
  'Courses = programme names from the DAAD International Programmes database (Bachelor/Master/PhD course types, mostly English-taught), degree wrappers removed ("Master of Science in X", "X (MSc)" → "X"), Master\'s first, deduplicated, capped at 150 (dataSource.coursesScope says so: German-taught programmes are not in the list). Records without DAAD programmes keep their (unverified) course list. degreeLevels: a level is proven by a DAAD-listed programme of that level, a curated quote on the institution\'s own page, (new institutions only) a Bachelor\'s/Master\'s programme link or heading on its home page (matched text stored verbatim), or (PhD) by HRK Promotionsrecht = Ja; DAAD lists international programmes only, so a level is never removed because DAAD lacks it — existing records get the union of their levels and the proven ones. A missing institution is created only when its levels are complete (Bachelor\'s and Master\'s proven, plus PhD where HRK Promotionsrecht = Ja), so that it does not drop out of the site\'s degree-level filter; the others are listed in missingFromDbNotCreated. degreeLevels is listed in dataSource.fields only when Bachelor\'s, Master\'s and PhD are all proven (dataSource.degreeLevelsProven records the proven set).',
  'dataSource.fields lists every field whose value in the record comes from this run\'s official sources (changed values, plus proposed values that already matched); fields proposed as null are not listed. Fee fields an earlier run of this script marked official are removed from dataSource.fields when this run cannot re-verify them (values unchanged; listed under uncertainties). dataSource.provider/syncedAt (the website\'s "Official government & university data" label) only when dataSource.fields names a fee field; otherwise sourceNames/checkedAt.',
  'Fees: tuition-free public universities get tuitionFeeUSD / graduateTuitionUSD = 0 only for a level that an institution-wide (or state-wide) statement on the university\'s own site covers (curated URL + verbatim quote, checked on every run; single-programme fact boxes are not used) AND for which fewer than one third of the institution\'s DAAD-listed international programmes charge tuition; a 0 that would replace an existing positive value is held back (whole fee update skipped, listed in zeroFeesHeldBack) unless --write-zero-fees is given, because the website reads 0 as "fee unknown" (US$25,000); the page\'s own limitation (first degree / consecutive Master\'s only, continuing-education exceptions) and the DAAD share of fee-charging programmes are shown in the text; if DAAD is unavailable no 0 is set. Semester contribution added when a (preferably central) page states the amount. Baden-Württemberg state institutions: EUR 1,500 per semester for non-EU students (Ministry of Science page). Bavarian institutions may charge non-EU students since the Bavarian Higher Education Innovation Act; only TUM, FAU, THI, TH Nürnberg and TH Rosenheim pages were verified, other Bavarian records are left unchanged. USD = EUR × ECB rate (frankfurter.app); ranges use the midpoint (marked "usual amounts").',
  'Not touched: rank, rankingNum, rankingSource, requirementsSource, IELTS/GPA/GRE/workExp/acceptanceRate fields, description and eligibility of existing records.',
];

// ---------------------------------------------------------------- plan (reviewed dry run → --apply) ----------
// Every record/field the run would write and a hash of the value (volatile stamps excluded). --apply recomputes with
// the current script, so it compares its own plan with the reviewed dry run's plan and writes nothing on any difference
// (a superseded report can never be "applied" by accident).
const VOLATILE_KEYS = new Set(['syncedAt', 'checkedAt', 'runId', 'createdAt', 'updatedAt', '_id']);
const canonValue = (v) => {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object' && typeof v.toHexString === 'function') return v.toHexString();
  if (Array.isArray(v)) return v.map(canonValue);
  if (typeof v === 'object') return Object.fromEntries(Object.keys(v).filter((k) => !VOLATILE_KEYS.has(k)).sort().map((k) => [k, canonValue(v[k])]));
  return v;
};
const sha = (x, n = 64) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, n);
function buildPlan(changes, creates) {
  const entries = [
    ...changes.map((c) => ({ key: `${c.action}:${c.id}`, name: c.name, fields: Object.fromEntries(Object.keys(c.diff).sort().map((k) => [k, sha(canonValue(c.diff[k].to), 16)])) })),
    ...creates.map((c) => ({ key: `create:${norm(c.doc.name)}|${norm(c.doc.city)}`, name: c.doc.name, fields: Object.fromEntries(Object.keys(c.doc).filter((k) => !VOLATILE_KEYS.has(k)).sort().map((k) => [k, sha(canonValue(c.doc[k]), 16)])) })),
  ].sort((a, b) => a.key.localeCompare(b.key));
  return { hash: sha(entries), entries, note: 'one entry per record this run would write: field -> hash of the value written (syncedAt/checkedAt/runId/createdAt/updatedAt/_id excluded). --apply writes only when its own plan is identical to the reviewed dry run\'s plan.' };
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
// --apply: the reviewed dry run (--expect <report>, default the newest germany-sync dry-run report that has a plan)
function loadExpectedReport() {
  let file = EXPECT_FILE ? path.resolve(EXPECT_FILE) : null;
  if (!file) {
    const candidates = fs.existsSync(REPORT_DIR) ? fs.readdirSync(REPORT_DIR).filter((f) => /^germany-sync-.*\.json$/.test(f))
      .map((f) => path.join(REPORT_DIR, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs) : [];
    for (const c of candidates) {
      try { const r = JSON.parse(fs.readFileSync(c, 'utf8')); if (r.summary?.mode === 'dry-run' && r.plan?.hash) { file = c; break; } } catch (_) { /* skip unreadable */ }
    }
    if (!file) throw new Error('--apply needs a reviewed dry-run report with a plan (none found in backend/reports); run a dry run, review it, then --apply [--expect <report>]');
  }
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (report.summary?.mode !== 'dry-run') throw new Error(`--expect ${file}: not a dry-run report`);
  if (!/^[0-9a-f]{64}$/.test(String(report.plan?.hash || '')) || !Array.isArray(report.plan?.entries)) throw new Error(`--expect ${file}: report has no plan (made by an older version of this script, e.g. germany-sync-2026-10-04-11-10.json); run a new dry run and review it`);
  return { file, report };
}

// ---------------------------------------------------------------- main ----------
(async () => {
  const revertIdx = ARGS.indexOf('--revert');
  if (revertIdx !== -1) return revert(ARGS[revertIdx + 1]);
  console.log(`HRK + DAAD + official fee pages → German institutions (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);
  const uncertainties = [];
  const verificationProblems = [];
  const syncedAt = new Date();
  // --apply reproduces a reviewed dry run: same FX rate (pinned from that report) and an identical plan
  const expected = APPLY ? loadExpectedReport() : null;
  if (expected) console.log(`  reviewed dry run: ${expected.file} (${expected.report.runId})`);

  let fx = null;
  if (expected) {
    fx = expected.report.summary?.fx || null; // same object as in the reviewed report (rate + ECB date)
    if (!fx) uncertainties.push(`FX rate unavailable in the reviewed report ${expected.file}; USD fee fields not proposed`);
  } else {
    try { fx = await eurToUsd(); } catch (err) { uncertainties.push(`FX rate unavailable (${err.message}); USD fee fields not proposed`); }
  }
  console.log(`  EUR→USD ${fx ? `${fx.rate} (${fx.date})${expected ? ' (pinned to the reviewed dry run)' : ''}` : 'n/a'}`);

  // 1) HRK list + context pages
  const hrkPage = await getPage(HRK_LIST_URL, { encoding: 'windows-1252' });
  const hrk = loadHrk(hrkPage);
  const byNr = new Map(hrk.map((h) => [h.nr, h]));
  hrk.forEach((h) => { h.officialName = officialName(h); addKnownCity(h.city); });
  Object.values(CITY_EN).forEach(addKnownCity);
  const hrkMeta = { url: HRK_LIST_URL, entries: hrk.length, rowsVerbatimVerified: hrk.filter((h) => h.quoteVerified).length };
  try {
    const dl = await getPage(HRK_DOWNLOADS_PAGE);
    hrkMeta.listedOn = { url: HRK_DOWNLOADS_PAGE, quote: HRK_DOWNLOADS_QUOTE, verified: inPage(dl, HRK_DOWNLOADS_QUOTE) };
    hrkMeta.licence = { url: HRK_DOWNLOADS_PAGE, quote: HRK_LICENCE_QUOTE, verified: inPage(dl, HRK_LICENCE_QUOTE) };
  } catch (err) { uncertainties.push(`HRK downloads page: ${err.message}`); }
  let civilRule = { url: HRK_TYPES_PAGE, quote: HRK_CIVIL_SERVICE_QUOTE, verified: false };
  try { civilRule.verified = inPage(await getPage(HRK_TYPES_PAGE), HRK_CIVIL_SERVICE_QUOTE); } catch (err) { civilRule.error = err.message; }
  if (!civilRule.verified) uncertainties.push('HRK civil-service quote not verified; public-administration colleges are NOT hidden in this run');
  console.log(`  HRK list: ${hrk.length} institutions (${hrkMeta.rowsVerbatimVerified} rows verified verbatim)`);

  // 2) DAAD International Programmes
  let daad = { programmes: [], unmapped: {}, foreignCampus: 0, ok: false };
  try {
    const p = await getPage(DAAD_API, { scrapeDo: true });
    const j = JSON.parse(p.body);
    daad.total = j.numResults;
    daad.fetchedVia = p.via;
    daad.fetchedAt = p.fetchedAt;
    for (const c of j.courses || []) {
      const level = LEVEL_OF_TYPE[c.courseType];
      if (!level) continue;
      if (FOREIGN_CAMPUS_RE.test(c.city || '')) { daad.foreignCampus += 1; continue; }
      addKnownCity(c.city);
      const nr = DAAD_CITY_OVERRIDE[`${c.academy}|${c.city}`] || DAAD_ACADEMY_MAP[c.academy];
      if (!nr) {
        if (nr === undefined) {
          const k = DAAD_RESEARCH_INSTITUTE_RE.test(c.academy) ? 'researchInstitutes' : 'unmappedHEIs';
          (daad.unmapped[k] ||= {})[c.academy] = (daad.unmapped[k][c.academy] || 0) + 1;
        } else (daad.unmapped.notAnHei ||= {})[c.academy] = (daad.unmapped.notAnHei[c.academy] || 0) + 1;
        continue;
      }
      daad.programmes.push({ nr, academy: c.academy, city: c.city, level, name: squash(c.courseName), tuitionFees: c.tuitionFees || null, languages: c.languages || [], applicationDeadline: c.applicationDeadline || null, beginning: c.beginning || null, link: c.link ? `https://www2.daad.de${c.link}` : null });
    }
    daad.ok = daad.programmes.length > 0;
    for (const nr of new Set(DAAD_ACADEMY_MAP ? Object.values(DAAD_ACADEMY_MAP).filter(Boolean) : [])) {
      if (!byNr.has(nr)) verificationProblems.push({ key: `daad-map-${nr}`, problems: [`DAAD academy map points to unknown HRK Hs-Nr. ${nr}`] });
    }
  } catch (err) { uncertainties.push(`DAAD International Programmes not available (${err.message}); courses not proposed, no degree level proven by DAAD, and no 0 tuition set for tuition-free institutions (the 0 cannot be cross-checked) — their fee updates are skipped where a USD value exists, or only the fee text is set`); }
  const daadByNr = new Map();
  for (const p of daad.programmes) { if (!daadByNr.has(p.nr)) daadByNr.set(p.nr, []); daadByNr.get(p.nr).push(p); }
  console.log(`  DAAD: ${daad.total ?? 'n/a'} programmes listed, ${daad.programmes.length} degree programmes mapped to ${daadByNr.size} HRK institutions (via ${daad.fetchedVia || 'n/a'})`);

  // 3) Baden-Württemberg rule
  const bwRule = { ok: false, evidence: [], urls: [BW_MWK_URL, BW_MWK_DE_URL] };
  try {
    const en = await getPage(BW_MWK_URL);
    const de = await getPage(BW_MWK_DE_URL);
    bwRule.evidence = [
      { what: 'BW non-EU tuition (EN)', url: BW_MWK_URL, quote: BW_QUOTES.en, verified: inPage(en, BW_QUOTES.en) },
      { what: 'BW non-EU tuition amount (EN)', url: BW_MWK_URL, quote: BW_QUOTES.amount, verified: inPage(en, BW_QUOTES.amount) },
      { what: 'BW non-EU tuition amount (DE)', url: BW_MWK_DE_URL, quote: BW_QUOTES.de, verified: inPage(de, BW_QUOTES.de) },
    ];
    bwRule.ok = bwRule.evidence.every((e) => e.verified);
  } catch (err) { uncertainties.push(`Baden-Württemberg ministry page: ${err.message}`); }

  // 4) DB (read-only here)
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const de = await db.collection('countries').findOne({ name: 'Germany' });
  if (!de) throw new Error('Country "Germany" not found');
  const ours = await db.collection('universities').find({ country: de._id }).toArray();
  console.log(`  our Germany records: ${ours.length}`);

  // 5) Match DB records → HRK
  const nameIndex = new Map();
  const domainIndex = new Map();
  for (const h of hrk) {
    for (const v of nameVariants(h)) { if (!nameIndex.has(v)) nameIndex.set(v, []); if (!nameIndex.get(v).includes(h)) nameIndex.get(v).push(h); }
    const d = regDomain(h.homepage);
    if (d && !TRACKING_HOST_RE.test(d)) { if (!domainIndex.has(d)) domainIndex.set(d, []); domainIndex.get(d).push(h); }
  }
  const matches = new Map(); // _id → { h, how }
  for (const u of ours) {
    const alias = DB_ALIASES[u.name]; // curated aliases win (renamed institutions, same name twice in the register)
    if (alias && byNr.has(alias.nr)) { matches.set(String(u._id), { h: byNr.get(alias.nr), how: 'alias', alias }); continue; }
    if (alias) verificationProblems.push({ key: `alias-${u.name}`, problems: [`alias points to unknown HRK Hs-Nr. ${alias.nr}`] });
    const byName = nameIndex.get(norm(u.name));
    if (byName && byName.length === 1) { matches.set(String(u._id), { h: byName[0], how: 'name' }); continue; }
    if (byName && byName.length > 1) uncertainties.push(`${u.name}: name matches several HRK entries (${byName.map((h) => h.nr).join(', ')}); not matched by name`);
    if (!DOMAIN_MATCH_REJECT.has(u.name)) {
      const byDomain = domainIndex.get(regDomain(u.website));
      if (byDomain && byDomain.length === 1) { matches.set(String(u._id), { h: byDomain[0], how: 'website domain' }); continue; }
    }
  }
  const groups = new Map();
  for (const u of ours) {
    const m = matches.get(String(u._id));
    if (!m) continue;
    if (!groups.has(m.h.nr)) groups.set(m.h.nr, []);
    groups.get(m.h.nr).push(u);
  }

  const changes = [];
  const creates = [];
  const institutions = [];
  const fees = {};
  const nulls = [];
  const qsAliasHints = [];
  const cityFlags = new Map(); // _id → note: our city differs from the register seat and is kept (campus not verified)
  const zeroFeesHeldBack = [];
  const missingNotCreated = [];
  const hrkEvidence =(h) => ({ what: 'HRK Hochschulkompass list row', url: HRK_LIST_URL, quote: h.quote, verified: h.quoteVerified, hsNr: h.nr });
  // dataSource of a record that a previous run of this script already wrote: it is not replaced wholesale — official
  // fields this run leaves untouched stay listed, urls are merged, creation provenance and former names are kept
  const mergeDataSource = (prev, next, notOfficial = []) => {
    if (!isOwnRun(prev)) return next;
    const drop = new Set(notOfficial);
    const fields = [...new Set([...next.fields, ...(prev.fields || []).filter((k) => !drop.has(k))])];
    const merged = { ...next, fields, urls: [...new Set([...(prev.urls || []), ...(next.urls || [])])], previousRunId: prev.runId };
    if (!merged.fx && prev.fx && fields.some((k) => /USD$/.test(k))) merged.fx = prev.fx;
    if (prev.createdBySync) { merged.createdBySync = prev.createdBySync; merged.createdRunId = prev.createdRunId || prev.runId; }
    const former = [...new Set([...(prev.formerNames || []), ...(next.formerNames || [])])];
    if (former.length) merged.formerNames = former;
    if (merged.degreeLevelsProven === undefined && prev.degreeLevelsProven !== undefined) merged.degreeLevelsProven = prev.degreeLevelsProven;
    return merged;
  };
  const deactivate = (doc, reason, evidence, extra = {}) => {
    if (doc.isActive === false) return false;
    const next = { urls: [...new Set(evidence.map((e) => e.url).filter(Boolean))], fields: ['isActive'], runId: RUN_ID, reason, ...extra };
    const dataSource = labelDataSource(mergeDataSource(doc.dataSource, next), syncedAt);
    changes.push({ id: String(doc._id), name: doc.name, action: 'deactivate', reason, diff: { isActive: { from: doc.isActive, to: false }, dataSource: { from: doc.dataSource, to: dataSource } }, evidence });
    return true;
  };

  // website check of an old domain that should redirect to the register's domain
  const redirectCheck = async (url, wantDomain, titleRe) => {
    const o = origin(url);
    if (!o) return { url, verified: false, error: 'no website on record' };
    try {
      const p = await getPage(`${o}/`);
      const title = titleOf(p);
      const verified = (wantDomain ? regDomain(p.finalUrl) === wantDomain : true) && (titleRe ? titleRe.test(title) : true);
      return { url: o, finalUrl: p.finalUrl, title, verified };
    } catch (err) { return { url: o, verified: false, error: err.message, code: err.code }; }
  };
  const isActiveDoc = (d) => d.isActive !== false;
  const doctorateEvidence = (h) => ({ what: 'doctoral-degree rights (HRK columns Bundesland | Anzahl Studierende | Gründungsjahr | Promotionsrecht | Habilitationsrecht)', url: HRK_LIST_URL, quote: h.doctorateQuote || null, verified: Boolean(h.doctorateVerified), promotionsrecht: h.doctorate || null, hsNr: h.nr });

  // 6) Institutions in our DB
  for (const [nr, docs] of groups) {
    const h = byNr.get(nr);
    const row = { hsNr: nr, institution: h.officialName, hrkType: h.type, sponsorship: h.sponsorship, state: h.state, dbRecords: docs.map((d) => d.name), decision: null };
    institutions.push(row);
    const ev0 = hrkEvidence(h);

    // civil-service college → hide every record
    if (h.type === 'Verwaltungshochschule') {
      if (civilRule.verified) {
        for (const d of docs) deactivate(d, `public-administration college (HRK type "Verwaltungshochschule"): only civil servants can attend, not open to international applicants`, [ev0, { what: 'HRK on public-administration colleges', url: civilRule.url, quote: civilRule.quote, verified: true }]);
        row.decision = 'deactivate';
        row.reason = 'civil-service college (HRK: Verwaltungshochschule)';
      } else { row.decision = 'no change (civil-service rule not verified)'; }
      continue;
    }

    if (/Bundeswehr/i.test(h.name)) uncertainties.push(`${h.officialName}: armed-forces university (officer candidates); HRK lists it as a public university, so it is kept — reviewer may hide it as not open to international applicants`);

    // a record whose curated alias is the institution's own English name is the kept record and keeps that name. The
    // curation alone decides (the QS import matches by exact name, so the choice must not flip with a network failure);
    // the quote on its website is checked as evidence only — an unverified quote is reported, it changes nothing.
    const ownName = new Map();
    for (const d of docs) {
      const q = matches.get(String(d._id)).alias?.ownName;
      if (!q) continue;
      let verified = false;
      let error = null;
      try { verified = inPage(await getPage(q.url), q.quote); } catch (err) { error = err.message; }
      ownName.set(String(d._id), { what: `name kept (curated alias): "${d.name}" is the institution's own English name on its website (also the name in the QS rankings)`, url: q.url, quote: q.quote, verified, ...(error ? { error } : {}) });
      if (!verified) {
        verificationProblems.push({ key: `own-name-${d.name}`, problems: [error || `quote not found on ${q.url}`] });
        uncertainties.push(`${d.name}: own-English-name quote not verified in this run (${error || `quote not found on ${q.url}`}); the record is still kept by its curated alias — the choice of kept record does not depend on a page fetch; reviewer check`);
      }
    }
    const hasOwnName = (d) => ownName.has(String(d._id));

    // keeper: active records first (a record hidden by hand is never chosen over an active one), then own English name >
    // register name > register website > register seat city > oldest
    const variants = nameVariants(h);
    const score = (d) => (hasOwnName(d) ? 8 : 0) + (variants.includes(norm(d.name)) ? 4 : 0)
      + (regDomain(d.website) && regDomain(d.website) === regDomain(h.homepage) ? 2 : 0) + (cityMatches(d.city, h.city) ? 1 : 0);
    const sorted = [...docs].sort((a, b) => Number(isActiveDoc(b)) - Number(isActiveDoc(a)) || score(b) - score(a) || new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    const keep = sorted[0];
    for (const d of sorted.slice(1)) {
      const m = matches.get(String(d._id));
      const ev = [ev0, { what: `kept record for the same HRK institution: "${keep.name}"`, url: null, quote: null, verified: true }];
      if (ownName.has(String(keep._id))) ev.push(ownName.get(String(keep._id)));
      if (m.alias?.redirect) {
        const r = await redirectCheck(d.website, m.alias.redirect, null);
        ev.push({ what: `its website now leads to ${m.alias.redirect}`, url: r.url, quote: r.finalUrl ? `${r.finalUrl} — ${r.title}` : r.error, verified: r.verified });
      }
      if (deactivate(d, `duplicate of "${keep.name}" (same HRK institution ${nr}: ${h.officialName}${m.alias ? `; ${m.alias.note}` : ''})`, ev, { hsNr: nr })) {
        qsAliasHints.push({ oldName: d.name, keptRecord: keep.name, newName: hasOwnName(keep) ? keep.name : h.officialName, why: 'duplicate hidden' });
      }
    }
    // every record of the institution is hidden (outside this sync, or by an earlier run): never re-activated here
    if (!isActiveDoc(keep)) {
      row.decision = 'no change (all records hidden — not re-activated; needs human check)';
      row.dbName = keep.name;
      uncertainties.push(`${keep.name}: in the HRK list (${nr}) but all our records of it are hidden (isActive:false, ${isOwnRun(keep.dataSource) ? `hidden by ${keep.dataSource.runId}` : 'hidden outside this sync'}); not re-activated and not updated — needs human check`);
      continue;
    }

    // proposed values from the register
    const proposed = {};
    const notOfficial = new Set(); // proposed fields whose value is not entirely from an official source
    const fieldEvidence = [ev0];
    const keepMatch = matches.get(String(keep._id));
    if (keepMatch.alias?.redirect || keepMatch.alias?.titleRe) {
      const r = await redirectCheck(keep.website, keepMatch.alias.redirect, keepMatch.alias.titleRe);
      fieldEvidence.push({ what: `renamed/merged: ${keepMatch.alias.note}`, url: r.url, quote: r.finalUrl ? `${r.finalUrl} — ${r.title}` : r.error, verified: r.verified });
    }
    if (hasOwnName(keep)) fieldEvidence.push(ownName.get(String(keep._id)));
    else if (!variants.includes(norm(keep.name))) proposed.name = h.officialName;
    const dprog = daadByNr.get(nr) || [];
    const daadCities = [...new Set(dprog.map((p) => p.city))];
    // names the record had: a campus city in an old name ("Hochschule Macromedia Stuttgart") still counts after a rename
    const knownNames = [keep.name, ...(isOwnRun(keep.dataSource) ? keep.dataSource.formerNames || [] : [])];
    // City: the register gives the legal seat ("Ort (Hausanschrift)"), which for multi-campus private institutions is
    // often not where students study (IU: Erfurt, GISMA / University of Europe: Potsdam, Steinbeis: Magdeburg). The seat
    // is filled in only when our city is missing / "Germany", or is merely a word of the institution's name that is not
    // a German city known from the register or DAAD ("Charlotte" in "Charlotte Fresenius Hochschule"); any other city
    // that differs from the seat is kept and flagged (dataSource.registerSeat records the seat).
    const cityNorm = norm(keep.city);
    const cityMissing = !cityNorm || /^(germany|deutschland)$/.test(cityNorm);
    const nameWordNotCity = !cityMissing && !KNOWN_CITIES.has(cityNorm.split(' ')[0])
      && [...knownNames, h.name, h.officialName].some((n) => ` ${norm(n)} `.includes(` ${cityNorm} `));
    if (cityMatches(keep.city, h.city, daadCities, knownNames)) {
      if (!cityMatches(keep.city, h.city, daadCities)) fieldEvidence.push({ what: `city "${keep.city}" kept: a German city named in the record's own (or former) name — a campus; the register seat is ${h.city}`, url: null, quote: null, verified: false, names: knownNames });
    } else if (cityMissing || nameWordNotCity) {
      proposed.city = CITY_EN[String(h.city).toLowerCase()] || h.city;
      fieldEvidence.push({ what: `city = register seat (Ort, Hausanschrift)${cityMissing ? ' — our city was missing / "Germany"' : ` — our city "${keep.city}" is only a word of the institution's name, not a German city known from the register or DAAD`}`, url: HRK_LIST_URL, quote: h.city, verified: true, previous: keep.city ?? null });
    } else {
      const note = `city "${keep.city}" differs from the HRK register seat "${h.city}" (legal address); kept — it may be a teaching campus, not verified`;
      cityFlags.set(String(keep._id), note);
      fieldEvidence.push({ what: `city kept: ${note}`, url: HRK_LIST_URL, quote: h.city, verified: true, registerSeat: h.city });
    }
    if (regDomain(keep.website) !== regDomain(h.homepage)) {
      const w = await registerWebsite(h);
      fieldEvidence.push(w.evidence);
      // a register home page that cannot be loaded is proposed only when we have no website at all
      if (w.site && regDomain(keep.website) !== regDomain(w.site) && (w.reachable || !keep.website)) proposed.website = w.site;
      if (w.site && !w.reachable && keep.website) uncertainties.push(`${keep.name}: register home page ${h.homepage} not reachable; our website ${keep.website} left unchanged`);
    }
    if (String(keep.type || '').toUpperCase() !== typeOf(h)) proposed.type = typeOf(h);

    const c = dprog.length ? daadCourses(dprog) : null;
    if (c) {
      proposed.courses = c.courses;
      fieldEvidence.push({ what: 'courses: DAAD International Programmes', url: DAAD_SEARCH_PAGE, apiUrl: DAAD_API, note: `${c.courses.length} of ${c.totalAvailable} programme names (${dprog.length} DAAD entries)`, sample: c.courses.slice(0, 3), daad: daadSummary(dprog) });
    }
    // degreeLevels: never narrowed by DAAD; only proven levels are added, official only when complete
    const sl = await siteLevelsFor(nr);
    for (const e of sl.evidence.filter((x) => !x.verified)) verificationProblems.push({ key: `levels-${nr}`, problems: [`${e.what}: quote not verified on ${e.url}${e.error ? ` (${e.error})` : ''}`] });
    const proven = provenLevels(c ? c.degreeLevels : [], h, sl.levels);
    const lv = levelsProposal(keep.degreeLevels, proven);
    if (lv.propose) {
      proposed.degreeLevels = lv.value;
      if (!lv.official) notOfficial.add('degreeLevels');
    }
    fieldEvidence.push({
      what: 'degreeLevels', proven, fromDaad: c ? c.degreeLevels : [], fromOwnSite: sl.levels, existing: keep.degreeLevels ?? null,
      result: lv.propose ? lv.value : 'unchanged', official: lv.propose && lv.official,
      note: 'a level is proven by a DAAD-listed programme of that level, a curated quote on the institution\'s own page, or (PhD) by HRK Promotionsrecht = Ja; levels missing from DAAD are never removed (DAAD lists international programmes only)',
      evidence: [...(proven.includes('PhD') && /^ja$/i.test(h.doctorate || '') ? [doctorateEvidence(h)] : []), ...(c ? [{ url: DAAD_SEARCH_PAGE, levels: c.degreeLevels }] : []), ...sl.evidence],
    });

    const f = await feeFor(nr, h, fx, bwRule, dprog, daad.ok);
    let feeApplied = false;
    if (f) {
      fees[nr] = { institution: h.officialName, ...f };
      if (f.problems?.length) verificationProblems.push({ key: `fees-${nr}`, problems: f.problems });
      for (const cv of f.caveats || []) uncertainties.push(cv);
      if (f.ok && f.values) {
        // values left open (null) are not written: an existing value stays as it is
        const vals = Object.fromEntries(Object.entries(f.values).filter(([, v]) => v !== null && v !== undefined));
        const stale = ['tuitionFeeUSD', 'graduateTuitionUSD'].filter((k) => !(k in vals) && keep[k] !== null && keep[k] !== undefined);
        // a 0 that would replace a positive value: the website reads 0 as "fee unknown" (US$25,000) — held back
        const zeroOverPositive = WRITE_ZERO_FEES ? [] : ['tuitionFeeUSD', 'graduateTuitionUSD'].filter((k) => vals[k] === 0 && typeof keep[k] === 'number' && keep[k] > 0);
        if (f.kind !== 'free' && !fx) {
          nulls.push({ institution: keep.name, fields: [`tuition/tuitionFeeUSD/graduateTuitionUSD: official fee verified, but no ECB rate this run — whole fee update skipped (an existing USD figure must not be shown as official next to an official fee text); existing values left unchanged`] });
        } else if (zeroOverPositive.length) {
          const what = zeroOverPositive.map((k) => `${k} ${keep[k]} → 0`).join(', ');
          zeroFeesHeldBack.push({
            institution: keep.name, hsNr: nr, heldBack: zeroOverPositive,
            current: { tuition: keep.tuition ?? null, tuitionFeeUSD: keep.tuitionFeeUSD ?? null, graduateTuitionUSD: keep.graduateTuitionUSD ?? null },
            proposed: f.values, withheld: f.withheld || [], urls: f.urls,
          });
          nulls.push({ institution: keep.name, fields: [`tuition/tuitionFeeUSD/graduateTuitionUSD: official no-tuition statement verified (${what}), but the website reads 0 as "fee unknown" and uses US$25,000 instead (ZERO_FEE_CONSUMERS) — whole fee update held back so the official label does not sit next to the old values; existing values left unchanged. Re-run with --write-zero-fees once the website treats 0 as a real fee (see zeroFeesHeldBack)`] });
        } else if (stale.length) {
          nulls.push({ institution: keep.name, fields: [`tuition/tuitionFeeUSD/graduateTuitionUSD: official fee text verified, but ${stale.map((k) => `${k} = ${keep[k]}`).join(', ')} cannot be replaced from an official source and would then be shown as official — whole fee update skipped; existing values left unchanged (${(f.withheld || []).map((w) => `${w.field}: ${w.reason}`).join('; ')})`] });
        } else {
          Object.assign(proposed, vals);
          feeApplied = true;
          fieldEvidence.push({ what: `fees (${f.kind})`, urls: f.urls, evidence: f.evidence, ...(f.daadFeeTally ? { daadFeeTally: f.daadFeeTally } : {}), fx });
          for (const w of f.withheld || []) nulls.push({ institution: keep.name, fields: [`${w.field}: left unchanged (${keep[w.field] ?? 'not set'}) — ${w.reason}`] });
        }
      }
    }
    if (!proposed.tuition && h.state === 'Bayern' && isPublic(h)) uncertainties.push(`${h.officialName}: Bavarian public institution — may charge non-EU tuition under the Bavarian Higher Education Innovation Act; not verified, fees left unchanged`);

    const diff = {};
    for (const [k, v] of Object.entries(proposed)) {
      if (JSON.stringify(keep[k]) !== JSON.stringify(v)) diff[k] = { from: keep[k], to: v };
    }
    if (diff.website && keep.logo !== undefined) diff.logo = { from: keep.logo, to: `https://www.google.com/s2/favicons?domain=${new URL(diff.website.to).hostname}&sz=128` };
    if (diff.name || diff.city) {
      const newName = diff.name?.to ?? keep.name;
      const newCity = diff.city?.to ?? keep.city;
      if (ours.some((o) => o !== keep && o.name === newName && o.city === newCity)) {
        uncertainties.push(`${keep.name}: rename/city change to "${newName}" (${newCity}) would clash with the unique index; skipped`);
        delete diff.name; delete diff.city;
      }
    }
    if (diff.name) qsAliasHints.push({ oldName: keep.name, keptRecord: keep.name, newName: diff.name.to, why: 'renamed' });
    // every field whose value now comes from the official sources of this run: the changed ones plus proposed values
    // that already matched (so the site treats them as official); nulled or partly unverified values are not listed
    const fromSource = (k) => !notOfficial.has(k) && (k in proposed ? proposed[k] !== null && proposed[k] !== undefined : diff[k].to !== null && diff[k].to !== undefined);
    const fields = [...new Set([...Object.keys(diff), ...Object.keys(proposed)])].filter(fromSource);
    // fee fields an earlier run of this script marked official but this run could not re-verify (quote gone, DAAD
    // share changed, fee update skipped / held back): the marker is retracted (values left as they are)
    const prevFeeOfficial = isOwnRun(keep.dataSource) ? (keep.dataSource.fields || []).filter((k) => FEE_FIELDS.includes(k)) : [];
    const retract = prevFeeOfficial.filter((k) => !fields.includes(k));
    if (retract.length) uncertainties.push(`${keep.name}: ${retract.join(', ')} marked official by ${keep.dataSource.runId} could not be re-verified in this run; dropped from dataSource.fields (values unchanged: ${retract.map((k) => `${k} = ${JSON.stringify(keep[k] ?? null)}`).join(', ')}) — reviewer check`);
    row.decision = Object.keys(diff).length ? 'keep + update' : retract.length ? 'keep + update (official fee marker retracted)' : 'keep (no change)';
    row.dbName = keep.name;
    row.matchedBy = keepMatch.how;
    row.website = diff.website?.to || keep.website;
    row.type = diff.type?.to || keep.type;
    row.courses = (diff.courses?.to || keep.courses || []).length;
    row.coursesFromDaad = Boolean(diff.courses || dprog.length);
    row.degreeLevels = { value: proposed.degreeLevels || keep.degreeLevels || null, proven, official: Boolean(lv.propose && lv.official) };
    row.fees = feeApplied ? proposed.tuition : null;
    row.feesUSD = feeApplied ? { bachelorUSD: proposed.tuitionFeeUSD ?? `unchanged (${keep.tuitionFeeUSD ?? 'not set'})`, masterUSD: proposed.graduateTuitionUSD ?? `unchanged (${keep.graduateTuitionUSD ?? 'not set'})` } : null;
    if (Object.keys(diff).length || retract.length) {
      const next = {
        urls: [...new Set([HRK_LIST_URL, ...(diff.courses || diff.degreeLevels ? [DAAD_SEARCH_PAGE] : []), ...(feeApplied && (diff.tuition || diff.tuitionFeeUSD || diff.graduateTuitionUSD) ? f?.urls || [] : [])])],
        fields, runId: RUN_ID, hsNr: nr, hrkType: h.type, sponsorship: h.sponsorship, registerSeat: h.city, degreeLevelsProven: proven,
        ...(fields.includes('courses') ? { coursesScope: COURSES_SCOPE } : {}),
        ...(diff.name ? { formerNames: [keep.name] } : {}),
        ...(fields.includes('tuitionFeeUSD') || fields.includes('graduateTuitionUSD') ? { fx } : {}),
        ...(retract.length ? { feeFieldsRetracted: retract } : {}),
      };
      // provider/syncedAt (official-data label on the website) only when dataSource.fields names a fee field
      const merged = mergeDataSource(keep.dataSource, next, [...notOfficial, ...Object.keys(diff).filter((k) => diff[k].to === null), ...retract]);
      diff.dataSource = { from: keep.dataSource, to: labelDataSource(merged, syncedAt) };
      const labelled = Boolean(diff.dataSource.to.provider);
      changes.push({ id: String(keep._id), name: keep.name, action: 'update', matchedBy: keepMatch.how, labelled, diff, evidence: fieldEvidence });
      row.officialDataLabel = labelled;
    }
    if (!f || !f.ok) nulls.push({ institution: keep.name, fields: [`tuition/tuitionFeeUSD/graduateTuitionUSD: ${f ? (f.problems || []).join('; ') || 'not verified' : 'no official fee page verified in this run'} — existing values left unchanged`] });
  }

  // 6b) HRK institutions missing from our DB that have DAAD programmes: degree levels decide whether they are created.
  // DAAD lists international programmes only, so a new record with only the DAAD levels would drop out of the site's
  // Bachelor's (or Master's) filter; it is created only when its levels are complete — Bachelor's and Master's proven
  // (DAAD, a curated quote, or a programme link/heading on its home page) and PhD where HRK Promotionsrecht = Ja.
  const createCandidates = new Map();
  for (const h of hrk) {
    if (groups.has(h.nr) || h.type === 'Verwaltungshochschule') continue;
    const dprog = daadByNr.get(h.nr) || [];
    if (!dprog.length) continue;
    const c = daadCourses(dprog);
    const w = await registerWebsite(h);
    const sl = await siteLevelsFor(h.nr);
    const required = ["Bachelor's", "Master's", ...(/^ja$/i.test(h.doctorate || '') && h.doctorateVerified ? ['PhD'] : [])];
    const needHome = ["Bachelor's", "Master's"].filter((l) => !provenLevels(c.degreeLevels, h, sl.levels).includes(l));
    const listed = origin(h.homepage);
    const homeUrls = w.site ? [listed && validHost(listed) && !TRACKING_HOST_RE.test(new URL(listed).hostname) ? `${listed}/` : null, `${w.site}/`] : [];
    const home = needHome.length && homeUrls.length ? await homePageLevels(homeUrls, needHome) : { levels: [], evidence: [] };
    const proven = provenLevels(c.degreeLevels, h, [...sl.levels, ...home.levels]);
    const missingLevels = required.filter((l) => !proven.includes(l));
    createCandidates.set(h.nr, { dprog, c, w, sl, home, proven, required, missingLevels, complete: !missingLevels.length });
  }

  // 7) DB records not in the HRK list
  // an HRK institution "has its own record" when it has an active DB record, or gets one created in step 8 (same rule)
  const willCreate = (nr) => Boolean(createCandidates.get(nr)?.complete);
  const ownRecordOf = (nr) => {
    if ((groups.get(nr) || []).some(isActiveDoc)) return `has its own active record in our DB ("${groups.get(nr).find(isActiveDoc).name}")`;
    if (willCreate(nr)) return 'gets its own record, created in this run';
    return null;
  };
  // which HRK institutions a website belongs to (by registered domain)
  const registerOwners = (...urls) => [...new Set(urls.map(regDomain).filter(Boolean))].flatMap((d) => domainIndex.get(d) || []);
  for (const u of ours.filter((x) => !matches.has(String(x._id)))) {
    const row = { hsNr: null, institution: u.name, dbRecords: [u.name], decision: null };
    institutions.push(row);
    const notInList = { what: 'not found in the HRK list of state and state-recognised higher education institutions', url: HRK_LIST_URL, quote: hrkMeta.listedOn?.quote || null, verified: Boolean(hrkMeta.listedOn?.verified) };
    const cfg = NOT_IN_REGISTER[u.name];
    if (!cfg && CIVIL_SERVICE_RE.test(u.name)) {
      if (civilRule.verified) {
        deactivate(u, 'public-administration / police / tax / justice college not in the HRK list; HRK: such colleges can only be attended by civil servants', [notInList, { what: 'HRK on public-administration colleges', url: civilRule.url, quote: civilRule.quote, verified: true }]);
        row.decision = 'deactivate';
        row.reason = 'civil-service college, not in HRK list';
      } else row.decision = 'no change (civil-service rule not verified)';
      continue;
    }
    if (cfg?.action === 'deactivate') {
      // positive evidence only: every configured check must be confirmed in this run (absence from the list never suffices)
      const ev = [notInList];
      let ok = Boolean(cfg.quote || cfg.expectDead || cfg.websiteOfNr);
      const failed = [];
      let why = cfg.why;
      if (cfg.quote) {
        try {
          const p = await getPage(cfg.url);
          const v = inPage(p, cfg.quote);
          ev.push({ what: 'own website', url: cfg.url, quote: cfg.quote, verified: v });
          if (!v) { ok = false; failed.push(`quote not found on ${cfg.url}`); }
        } catch (err) { ev.push({ what: 'own website', url: cfg.url, quote: err.message, verified: false }); ok = false; failed.push(err.message); }
      }
      if (cfg.expectDead) {
        const d = await domainGone(cfg.url);
        ev.push({ what: 'own website domain no longer exists (DNS lookup; only ENOTFOUND counts)', url: cfg.url, quote: d.quote, verified: d.gone, codes: d.codes || null });
        if (!d.gone) { ok = false; failed.push(d.quote); }
      }
      if (cfg.websiteOfNr) {
        const owner = byNr.get(cfg.websiteOfNr);
        const want = owner ? regDomain(owner.homepage) : null;
        const sameDomain = Boolean(want) && regDomain(u.website) === want;
        const r = sameDomain ? await redirectCheck(u.website, want, cfg.titleRe) : { url: u.website || null, verified: false, error: owner ? `recorded website "${u.website || ''}" is not on ${want}` : `HRK Hs-Nr. ${cfg.websiteOfNr} not in the register` };
        ev.push({ what: `recorded website is the site of ${owner ? owner.officialName : '?'} (HRK ${cfg.websiteOfNr}, register home page ${owner ? owner.homepage : '?'}): same registered domain, page loads there, title matches ${cfg.titleRe}`, url: r.url, quote: r.finalUrl ? `${r.finalUrl} — ${r.title}` : r.error, verified: Boolean(sameDomain && r.verified), registerRow: owner ? hrkEvidence(owner) : null });
        if (!(sameDomain && r.verified)) { ok = false; failed.push(`website check: ${r.finalUrl ? `${r.finalUrl} — ${r.title}` : r.error}`); }
        const own = owner ? ownRecordOf(cfg.websiteOfNr) : null;
        if (own) {
          why = `${cfg.why}; ${owner.officialName} ${own}`;
          ev.push({ what: `${owner.officialName} ${own}`, url: null, quote: null, verified: true });
        } else { ok = false; failed.push(`${owner ? owner.officialName : `HRK ${cfg.websiteOfNr}`} has no active record and none is created in this run — hiding this record would leave that institution without one`); }
      }
      if (ok) { deactivate(u, why, ev); row.decision = 'deactivate'; row.reason = why; } else { row.decision = 'no change (evidence not confirmed)'; uncertainties.push(`${u.name}: ${cfg.why} — evidence not confirmed this run (${failed.join('; ')}); left unchanged`); }
      continue;
    }
    row.decision = 'no change (not in HRK list — needs human check)';
    // the recorded website (or the curated own site when we have none) — reported as "own website live" only when the
    // page stays on the recorded domain and that domain is not the register domain of another HRK institution
    const checkUrl = u.website || cfg?.checkUrl || null;
    const site = checkUrl ? await redirectCheck(checkUrl, null, null) : null;
    row.website = u.website || null;
    const finalDomain = site?.finalUrl ? regDomain(site.finalUrl) : null;
    const owners = registerOwners(checkUrl, site?.finalUrl);
    let siteNote = u.website ? '' : '; no website on record';
    if (owners.length) {
      siteNote = `; its recorded website ${checkUrl} is the register website of ${owners.map((o) => `${o.officialName} (HRK ${o.nr}${ownRecordOf(o.nr) ? `, which ${ownRecordOf(o.nr)}` : ''})`).join(', ')} — not its own site (duplicate or invalid website)`;
    } else if (site?.finalUrl && finalDomain !== regDomain(checkUrl)) {
      const titleNamesIt = norm(site.title || '').includes(norm(u.name));
      siteNote = `; ${u.website ? 'its recorded website' : 'the site'} ${checkUrl} redirects to another domain (${site.finalUrl} — ${site.title})${titleNamesIt ? ' whose page title names the institution (moved site)' : ' — not confirmed as its own site'}`;
    } else if (site?.finalUrl) {
      siteNote = `, ${u.website ? 'own website' : `site ${checkUrl}`} live (${site.finalUrl} — ${site.title})`;
    } else if (site) {
      siteNote = `; ${u.website ? 'recorded website' : `site ${checkUrl}`} not reachable (${site.error})`;
    }
    row.websiteCheck = site ? { url: checkUrl, finalUrl: site.finalUrl || null, title: site.title || null, error: site.error || null, registerOwners: owners.map((o) => o.nr) } : null;
    uncertainties.push(`${u.name}: not in the HRK list${siteNote}; recognition not confirmed, left unchanged`);
  }

  // 8) Institutions in the HRK list (with DAAD programmes) that are missing from our DB → create
  const matchedNrs = new Set(groups.keys());
  const missing = [];
  for (const h of hrk) {
    if (matchedNrs.has(h.nr) || h.type === 'Verwaltungshochschule') continue;
    const dprog = daadByNr.get(h.nr) || [];
    if (!dprog.length) { missing.push({ hsNr: h.nr, name: h.officialName, type: h.type, sponsorship: h.sponsorship, city: h.city, daadProgrammes: 0 }); continue; }
    const cand = createCandidates.get(h.nr);
    const { c, w, sl, home, proven } = cand;
    if (!cand.complete) {
      // not created: a record with only these levels would be missing from the site's filter for the other levels
      missingNotCreated.push({
        hsNr: h.nr, name: h.officialName, type: h.type, sponsorship: h.sponsorship, city: h.city, website: w.site || h.homepage || null,
        daadProgrammes: dprog.length, provenLevels: proven, requiredLevels: cand.required, missingLevels: cand.missingLevels,
        promotionsrecht: h.doctorate || null,
        why: `degree levels incomplete: ${cand.missingLevels.join(', ')} not proven (DAAD lists international programmes only; no ${cand.missingLevels.join(' / ')} programme link or heading found on the home page) — a new record with only ${JSON.stringify(proven)} would be missing from the site's ${cand.missingLevels.join(' / ')} filter; not created, needs a human check or an official full programme list`,
        evidence: [hrkEvidence(h), { url: DAAD_SEARCH_PAGE, levels: c.degreeLevels }, ...sl.evidence, ...home.evidence],
      });
      continue;
    }
    const site = w.site;
    const ev = [hrkEvidence(h), w.evidence];
    // same DAAD fee cross-check as for existing records (the institution's DAAD programmes are passed in)
    const f = await feeFor(h.nr, h, fx, bwRule, dprog, daad.ok);
    if (f) {
      fees[h.nr] = { institution: h.officialName, ...f };
      if (f.problems?.length) verificationProblems.push({ key: `fees-${h.nr}`, problems: f.problems });
      for (const cv of f.caveats || []) uncertainties.push(cv);
    }
    const feeVals = f?.ok && f.values ? f.values : {};
    const city = CITY_EN[String(h.city).toLowerCase()] || h.city;
    // degreeLevels: the proven levels (DAAD-listed levels, curated quote, home-page programme link/heading, PhD from HRK
    // Promotionsrecht = Ja) — complete for this institution (checked above); official (listed in dataSource.fields)
    // only when all three levels are proven
    const lv = levelsProposal([], proven);
    const fields = ['name', 'city', 'website', 'type', 'description', 'courses', ...(lv.official ? ['degreeLevels'] : []), ...Object.keys(feeVals).filter((k) => feeVals[k] !== null && feeVals[k] !== undefined)];
    ev.push({
      what: 'degreeLevels', proven, fromDaad: c.degreeLevels, fromOwnSite: sl.levels, fromHomePage: home.levels, result: lv.value, official: lv.official,
      note: lv.official ? 'all three levels proven' : `Bachelor's and Master's proven${/^ja$/i.test(h.doctorate || '') ? '' : ` (no PhD: HRK Promotionsrecht = ${h.doctorate || 'n/a'})`}; not marked official (not in dataSource.fields) because PhD is not proven`,
      evidence: [...(proven.includes('PhD') && /^ja$/i.test(h.doctorate || '') ? [doctorateEvidence(h)] : []), { url: DAAD_SEARCH_PAGE, levels: c.degreeLevels }, ...sl.evidence, ...home.evidence],
    });
    const doc = {
      name: h.officialName, country: de._id, city, website: site,
      logo: site ? `https://www.google.com/s2/favicons?domain=${new URL(site).hostname}&sz=128` : null,
      type: typeOf(h),
      description: `${h.officialName} is a ${SPONSOR_LABEL[h.sponsorship] || h.sponsorship} ${TYPE_LABEL[h.type] || h.type} in ${h.city} (${h.state}), listed in the HRK Hochschulkompass register of German higher education institutions.`,
      eligibility: null, categoryTags: [],
      tuition: feeVals.tuition ?? null, tuitionFeeUSD: feeVals.tuitionFeeUSD ?? null, graduateTuitionUSD: feeVals.graduateTuitionUSD ?? null,
      // schema defaults would invent these — set explicitly to "unknown"
      minGpaPercent: null, minIeltsScore: null, minGreScore: null, greRequired: null, acceptanceRate: null,
      minScore: null, ieltsScore: null, greExam: null, workExp: null, scholarshipAvailable: null, rankingNum: null,
      courses: c.courses, degreeLevels: lv.value,
      isActive: true,
      // provider/syncedAt (official-data label on the website) only when a fee field is official
      dataSource: labelDataSource({
        urls: [...new Set([HRK_LIST_URL, DAAD_SEARCH_PAGE, ...home.evidence.filter((e) => e.verified).map((e) => e.url), ...(f?.ok ? f.urls || [] : [])])], fields, runId: RUN_ID,
        createdBySync: SCRIPT_ID, hsNr: h.nr, hrkType: h.type, sponsorship: h.sponsorship, registerSeat: h.city, degreeLevelsProven: proven, coursesScope: COURSES_SCOPE,
        ...(feeVals.tuitionFeeUSD > 0 || feeVals.graduateTuitionUSD > 0 ? { fx } : {}),
      }, syncedAt),
      createdAt: syncedAt, updatedAt: syncedAt,
    };
    creates.push({ name: doc.name, hsNr: h.nr, doc, evidence: [...ev, { what: 'courses: DAAD International Programmes', url: DAAD_SEARCH_PAGE, note: `${c.courses.length} programme names`, daad: daadSummary(dprog) }, ...(f?.ok ? [{ what: `fees (${f.kind})`, evidence: f.evidence, ...(f.daadFeeTally ? { daadFeeTally: f.daadFeeTally } : {}) }] : [])] });
    institutions.push({ hsNr: h.nr, institution: h.officialName, hrkType: h.type, sponsorship: h.sponsorship, state: h.state, dbRecords: [], decision: 'create', website: site, type: doc.type, courses: c.courses.length, degreeLevels: { value: lv.value, proven, official: lv.official }, fees: doc.tuition, feesUSD: f?.ok ? { bachelorUSD: doc.tuitionFeeUSD, masterUSD: doc.graduateTuitionUSD } : null });
    if (!f?.ok) nulls.push({ institution: h.officialName, fields: ['tuition, tuitionFeeUSD, graduateTuitionUSD: null (no official fee page verified in this run)'], create: true });
    for (const wh of f?.ok && f.values ? f.withheld || [] : []) nulls.push({ institution: h.officialName, fields: [`${wh.field}: null — ${wh.reason}`], create: true });
    if (!lv.official) nulls.push({ institution: h.officialName, fields: [`degreeLevels: ${JSON.stringify(lv.value)} stored (complete for this institution), not marked official (${LEVEL_ORDER.filter((l) => !proven.includes(l)).join(', ')} not proven)`], create: true });
    nulls.push({ institution: h.officialName, fields: [`courses: ${c.courses.length} international programme names from DAAD only — German-taught programmes are not in the list (dataSource.coursesScope)`], create: true });
    nulls.push({ institution: h.officialName, fields: ['minIeltsScore, ieltsScore, minGpaPercent, minScore, greExam, minGreScore, greRequired, workExp, acceptanceRate, scholarshipAvailable, rankingNum: null (not in the official sources used)'], create: true });
  }

  // 9) Reviewer flags (nothing changed for these)
  const deactivatedIds = new Set(changes.filter((c) => c.action === 'deactivate').map((c) => c.id));
  const changedFields = new Map(changes.filter((c) => c.action === 'update').map((c) => [c.id, new Set(Object.keys(c.diff))]));
  const DEFAULTISH = { minIeltsScore: 6.5, minGpaPercent: 60, ieltsScore: 'IELTS 6.0+', minScore: 'GPA 3.0+', greExam: 'GRE Waived', workExp: 'Freshers Eligible', scholarshipAvailable: true };
  const unverifiedFields = ours.filter((u) => !deactivatedIds.has(String(u._id))).map((u) => {
    const ch = changedFields.get(String(u._id)) || new Set();
    const fields = Object.entries(DEFAULTISH).filter(([k, val]) => u[k] === val).map(([k]) => k);
    if (u.acceptanceRate != null) fields.push('acceptanceRate');
    if (!ch.has('tuition') && (u.tuition || u.tuitionFeeUSD != null)) fields.push('tuition/tuitionFeeUSD (round-number values, no official source)');
    if (!ch.has('courses') && (u.courses || []).length) fields.push('courses/degreeLevels (generic list, not from an official source)');
    if (u.rankingNum != null && !u.rankingSource) fields.push('rankingNum/rank (sequential values without rankingSource; the separate QS import handles rankings)');
    if (/premier accredited institution/i.test(u.description || '')) fields.push('description (template text)');
    if (u.eligibility) fields.push('eligibility (unverified text)');
    if (cityFlags.has(String(u._id))) fields.push(cityFlags.get(String(u._id)));
    return { name: u.name, fields };
  }).filter((x) => x.fields.length);

  const count = (f) => changes.filter((c) => c.diff[f]).length;
  // plan of this run; --apply writes only when it equals the reviewed dry run's plan
  const plan = buildPlan(changes, creates);
  let expectCheck = null;
  if (expected) {
    const differences = comparePlans(expected.report.plan, plan);
    expectCheck = { report: expected.file, reviewedRunId: expected.report.runId, expectedHash: expected.report.plan.hash, actualHash: plan.hash, match: !differences.length && expected.report.plan.hash === plan.hash, differences: differences.slice(0, 300), differenceCount: differences.length };
  }
  const applyRefused = Boolean(expected && !expectCheck.match);
  const summary = {
    runId: RUN_ID, mode: APPLY ? (applyRefused ? 'apply-refused' : 'apply') : 'dry-run', script: 'scripts/dataSync/germanySync.js', ourGermanyRecords: ours.length,
    planHash: plan.hash, ...(expectCheck ? { expectCheck: { report: expectCheck.report, match: expectCheck.match, differences: expectCheck.differenceCount } } : {}),
    writeZeroFees: WRITE_ZERO_FEES,
    hrkInstitutions: hrk.length, hrkMatched: groups.size,
    creates: creates.length,
    updates: changes.filter((c) => c.action === 'update').length,
    updatesWithOfficialDataLabel: changes.filter((c) => c.action === 'update' && c.labelled).length,
    updatesWithoutLabel: changes.filter((c) => c.action === 'update' && !c.labelled).length,
    deactivations: changes.filter((c) => c.action === 'deactivate').length,
    unchanged: institutions.filter((i) => /^keep \(no change\)|^no change/.test(i.decision || '')).length,
    fieldsChanged: Object.fromEntries(['name', 'city', 'website', 'type', 'courses', 'degreeLevels', 'tuition', 'tuitionFeeUSD', 'graduateTuitionUSD', 'isActive'].map((f) => [f, count(f)])),
    feesVerified: Object.fromEntries(['free', 'bw', 'charges'].map((k) => [k, Object.values(fees).filter((f) => f.kind === k && f.ok).length])),
    zeroFeesHeldBack: zeroFeesHeldBack.length,
    citiesKeptDifferentFromRegisterSeat: cityFlags.size,
    missingFromDbNotCreated: missingNotCreated.length,
    daad: { programmesListed: daad.total ?? null, degreeProgrammesMapped: daad.programmes.length, institutions: daadByNr.size, fetchedVia: daad.fetchedVia || null, fetchedAt: daad.fetchedAt || null },
    fx, requests: counters,
  };
  const reviewNotes = [
    { topic: 'Official-data label', note: `Only records whose dataSource.fields name a fee field get dataSource.provider/syncedAt (the website shows "Official government & university data" for any record with a provider). ${summary.updatesWithoutLabel} updated records (name/city/website/type/courses/degreeLevels only) and all deactivations carry dataSource.sourceNames/checkedAt instead.` },
    {
      topic: 'Zero fees held back (website reads 0 as unknown)',
      note: WRITE_ZERO_FEES
        ? '--write-zero-fees given: 0 fees are written over existing positive values. Make sure the website code below treats 0 as a real fee first.'
        : `${zeroFeesHeldBack.length} tuition-free institution(s) would get tuitionFeeUSD/graduateTuitionUSD = 0 over an existing positive (unverified) value. The website reads 0 as "fee unknown" and uses US$25,000 (max-tuition filter, budget score, detail page), so these fee updates are held back (existing values unchanged). Fix the code below (e.g. \`Number.isFinite(x) ? x : 25000\`, \`hasFee = x != null\`), then re-run with --write-zero-fees. New records and records without a USD value do get 0 (the site treats null the same way).`,
      consumers: ZERO_FEE_CONSUMERS,
      records: zeroFeesHeldBack.map((z) => z.institution),
    },
    { topic: 'Cities kept that differ from the register seat', note: `${cityFlags.size} record(s) keep a city that differs from the HRK register seat (legal address); it may be a teaching campus. Listed under unverifiedFields; the seat is stored as dataSource.registerSeat on written records.`, records: [...cityFlags.values()] },
    { topic: 'Missing institutions not created', note: `${missingNotCreated.length} HRK institution(s) with DAAD programmes are not created because their degree levels are incomplete (see missingFromDbNotCreated).`, records: missingNotCreated.map((m) => `${m.name} (missing ${m.missingLevels.join(', ')})`) },
  ];

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  // file name = run id (start second + random suffix); first write with 'wx' so an existing report is never replaced
  const reportPath = path.join(REPORT_DIR, `${RUN_ID}.json`);
  const report = {
    summary, runId: RUN_ID, generatedAt: syncedAt,
    sources: {
      hrk: hrkMeta, civilServiceRule: civilRule, daad: { api: DAAD_API, searchPage: DAAD_SEARCH_PAGE, unmappedAcademies: daad.unmapped, foreignCampusProgrammesSkipped: daad.foreignCampus },
      badenWuerttemberg: bwRule, fx,
    },
    reviewNotes, ...(expectCheck ? { expectCheck } : {}),
    institutions, creates, changes, fees, zeroFeesHeldBack, missingFromDbNotCreated: missingNotCreated, missingFromDbWithoutDaadProgrammes: missing,
    nulls, unverifiedFields, qsAliasHints, verificationProblems, uncertainties, methodNotes: METHOD_NOTES, plan,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), { flag: 'wx' });

  console.log(JSON.stringify({ ...summary, requests: counters }, null, 2));
  console.table(institutions.filter((i) => i.decision !== 'keep (no change)').slice(0, 400).map((i) => ({ hsNr: i.hsNr || '', institution: (i.dbName || i.dbRecords[0] || i.institution || '').slice(0, 48), decision: i.decision, courses: i.courses ?? '', usd: i.feesUSD ? `${i.feesUSD.bachelorUSD ?? '-'} / ${i.feesUSD.masterUSD ?? '-'}` : '' })));
  console.log(`full report: ${reportPath}`);

  if (applyRefused) {
    throw new Error(`--apply refused: the plan differs from the reviewed dry run ${expected.file} (${expectCheck.differenceCount} difference(s), see expectCheck in ${reportPath}); review a new dry run and apply with --expect <that report>`);
  }
  if (APPLY) {
    const col = db.collection('universities');
    let written = 0;
    for (const c of changes) {
      const set = {};
      for (const [k, val] of Object.entries(c.diff)) set[k] = val.to;
      set.updatedAt = new Date();
      await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, { $set: set });
      written += 1;
    }
    for (const c of creates) {
      const clash = await col.findOne({ name: c.doc.name, country: c.doc.country, city: c.doc.city });
      if (clash) { c.skipped = 'a record with the same name/country/city exists'; continue; }
      const r = await col.insertOne(c.doc);
      c.insertedId = String(r.insertedId);
    }
    report.appliedAt = new Date();
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`APPLIED: ${written} updated/deactivated, ${creates.filter((c) => c.insertedId).length} created (revert: --revert ${reportPath})`);
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
