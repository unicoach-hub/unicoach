import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';
import { BarCompare, HookBand } from '../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

// UG / PG score bands with a coloured range chip
const ScoreList = ({ label, items, chip }) => (
  <div>
    <span className="text-[11px] text-[#5B544A] font-extrabold uppercase tracking-wider block mb-2">{label}</span>
    <div className="space-y-2">
      {items.map((score) => (
        <div key={score.range + score.courses} className="flex justify-between items-start gap-3 text-[13px]">
          <span className="text-[#3D362E] min-w-0">{score.courses}</span>
          <span className="px-2 py-0.5 rounded-md border-2 border-[#16130F] font-urbanist font-black text-[12.5px] whitespace-nowrap shrink-0" style={{ background: chip.c, color: chip.fg }}>{score.range}</span>
        </div>
      ))}
    </div>
  </div>
);

const DuolingoAcceptedCountry = ({ country }) => {
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const countryData = {
    australia: {
      // Checked 10 Nov 2026 against each university's official English-requirements page and the
      // Home Affairs instrument F2025L00906 (Subclass 500 English tests, in force from 7 Aug 2025).
      title: "Is Duolingo Accepted in Australia? (2027 Check)",
      overviewTitle: { hi: "Sach kya hai", en: "What this means for you" },
      tableTitle: "Do top Australian universities accept Duolingo?",
      scoreHeader: "Duolingo for degree entry?",
      quickAnswer: {
        q: "Is Duolingo accepted in Australia?",
        a: "Mostly no. Of the 10 top Australian universities we checked, only the University of Western Australia (UWA) lists the Duolingo English Test for degree entry (minimum 125). The others ask for IELTS, PTE, TOEFL iBT or similar. And Duolingo is never accepted for the Australian student visa (Subclass 500), so you need one of the tests below for the visa anyway.",
        table: {
          head: ["English test", "Student visa (Subclass 500)", "Minimum overall for the visa"],
          rows: [
            ["IELTS Academic / General", "Accepted", "6.0"],
            ["PTE Academic", "Accepted", "47"],
            ["TOEFL iBT", "Accepted", "67"],
            ["Cambridge C1 Advanced", "Accepted", "161"],
            ["OET", "Accepted", "1210"],
            ["LanguageCert Academic", "Accepted", "61"],
            ["Michigan English Test (MET)", "Accepted", "53"],
            ["CELPIP General", "Accepted", "7"],
            ["Duolingo English Test", "Not accepted", "–"]
          ]
        },
        source: "Visa scores: Migration (English Language Tests and Evidence Exemptions for Subclass 500 (Student) Visas) Instrument 2025, in force from 7 August 2025. Lower scores apply if you also take 10+ or 20+ weeks of ELICOS. Your university may ask for a higher score than the visa minimum."
      },
      hook: { value: "1 of 10", label: "top Australian universities we checked list Duolingo for degree entry (UWA, minimum 125). The student visa does not accept it at all.", hi: "Dhyaan do" },
      subtitle: "Which Australian universities accept the Duolingo English Test, which do not, and which English test you need for the Australian student visa.",
      highlights: [
        { label: "Accepts DET for degrees", value: "University of Western Australia (min 125)" },
        { label: "Do not list DET", value: "Melbourne, UNSW, Sydney, ANU, Monash, UQ, Adelaide, UTS, RMIT" },
        { label: "Visa minimum (IELTS / PTE)", value: "IELTS 6.0 or PTE 47 overall" },
        { label: "Student Visa (Subclass 500)", value: "DET NOT accepted for the visa" }
      ],
      description: "Duolingo is popular in India because it is cheap and taken from home, but Australia is one of the countries where it works least. Most leading Australian universities only accept tests taken at a test centre, such as IELTS, PTE Academic or TOEFL iBT, and the Department of Home Affairs never accepts Duolingo for the student visa. Some pathway and English-language programmes (for example Monash College and RMIT English courses) use DET for placement, but for a degree and the visa, plan on IELTS or PTE. If you already have a strong DET score, UWA is the main option to check, and you will still need an IELTS, PTE or TOEFL score for the visa.",
      universities: [
        { name: "University of Western Australia (UWA)", rank: "77", score: "Yes: 125 (coursework degrees)" },
        { name: "University of Melbourne", rank: "19", score: "No" },
        { name: "University of New South Wales (UNSW)", rank: "20", score: "No" },
        { name: "University of Sydney", rank: "25", score: "No" },
        { name: "Australian National University (ANU)", rank: "32", score: "Not listed" },
        { name: "Monash University", rank: "36", score: "No (only Monash College pathways)" },
        { name: "University of Queensland (UQ)", rank: "42", score: "No" },
        { name: "Adelaide University", rank: "82", score: "No" },
        { name: "University of Technology Sydney (UTS)", rank: "96", score: "No" },
        { name: "RMIT University", rank: "125", score: "No (only RMIT English courses)" }
      ],
      tableNote: "Checked on each university's official English language requirements page, November 2026. Rules change, so confirm on the course page before you apply.",
      programScores: null,
      visa: {
        type: "Student Visa (Subclass 500)",
        fee: "AUD 2,500 from 1 July 2026 (confirm on Home Affairs)",
        time: "Varies: check Home Affairs processing times",
        proof: "AUD 29,710 living costs + first-year tuition + travel",
        insurance: "Overseas Student Health Cover (OSHC) mandatory",
        note: "Duolingo is not an accepted English test for the Australian student visa. Minimum overall scores: IELTS 6.0, PTE Academic 47, TOEFL iBT 67 (lower if you add 10+ weeks of ELICOS). Tests must be less than 2 years old."
      },
      faqs: [
        { q: "Is Duolingo accepted for the Australian student visa?", a: "No. Duolingo is not on the Department of Home Affairs list of English tests for the Student visa (Subclass 500). Accepted tests include IELTS (6.0 overall), PTE Academic (47), TOEFL iBT (67), Cambridge C1 Advanced (161), OET, LanguageCert Academic, the Michigan English Test and CELPIP General." },
        { q: "Which universities in Australia accept Duolingo?", a: "Very few. Of the top 10 we checked, only the University of Western Australia (UWA) lists the Duolingo English Test for coursework degrees, with a minimum overall score of 125. Melbourne, UNSW, Sydney, ANU, Monash, UQ, Adelaide, UTS and RMIT do not list it for degree entry." },
        { q: "What Duolingo score is needed for Australia?", a: "At UWA the minimum is 125 overall (with sub-scores of 115 Speaking, 125 Writing, 115 Reading and 110 Listening). Even with that score, you still need IELTS, PTE, TOEFL iBT or another approved test for the student visa." },
        { q: "Should I take Duolingo or IELTS for Australia?", a: "For Australia, take IELTS Academic or PTE Academic. One test then covers both your university admission and your student visa. Duolingo would only cover admission at a few places and never the visa, so you would end up paying for two tests." },
        { q: "Is PTE or IELTS better for an Australian student visa?", a: "Both are accepted. The visa minimum is IELTS 6.0 or PTE Academic 47 overall, but most universities ask for more, often IELTS 6.5 or PTE 58 to 65. Pick the test you score better in on a practice test." }
      ]
    },
    canada: {
      title: "Duolingo Accepted Universities in Canada 2026",
      hook: { value: "400+", label: "universities and colleges in Canada accept the Duolingo English Test", hi: "Canada" },
      subtitle: "List of top Canadian universities accepting Duolingo scores, SDS updates, and PR planning.",
      highlights: [
        { label: "Top Accepted Universities", value: "Uni of Toronto, UBC, McGill, Waterloo" },
        { label: "Total Accepted Schools", value: "Over 400 Universities and Colleges" },
        { label: "Minimum Score Range", value: "95 – 125+ (UG & PG)" },
        { label: "Visa Stream Update", value: "SDS stream discontinued (Standard stream LOA applies)" }
      ],
      description: "The Duolingo English Test (DET) is a smart choice for Indian students wanting to study in Canada. It's convenient, highly affordable, and offers results in 48 hours. With the Student Direct Stream (SDS) permanently eliminated by the Canadian government, study permit pathways now rely on standard stream applications where a university-issued Letter of Acceptance (LOA) is sufficient proof of English proficiency.",
      universities: [
        { name: "University of Toronto", rank: "21", score: "125+ (requires 120 in Production)" },
        { name: "University of British Columbia (UBC)", rank: "34", score: "125+" },
        { name: "McGill University", rank: "30", score: "125+" },
        { name: "University of Waterloo", rank: "112", score: "120–125" },
        { name: "McMaster University", rank: "189", score: "120–125" },
        { name: "York University", rank: "350", score: "110–125" },
        { name: "Concordia University", rank: "387", score: "110–120" },
        { name: "Seneca College (Colleges)", rank: "N/A", score: "105–115" },
        { name: "Humber College (Colleges)", rank: "N/A", score: "105–115" },
        { name: "Niagara College (Pathways)", rank: "N/A", score: "95–105" }
      ],
      programScores: {
        ug: [
          { range: "125+", courses: "Top Tier (U of T, UBC, McGill)" },
          { range: "110–120", courses: "Mid-Tier Universities (York, Concordia)" },
          { range: "105–115", courses: "Colleges (Seneca, Humber, George Brown)" }
        ],
        pg: [
          { range: "130+", courses: "Competitive Master's / MBA programs" },
          { range: "115–125", courses: "Engineering & Applied Sciences" },
          { range: "110–115", courses: "Post-Graduate Certificates" }
        ]
      },
      visa: {
        type: "Standard Study Permit Stream",
        fee: "CAD 150 (~₹9,500)",
        time: "6 to 8 weeks",
        proof: "CAD 20,635 (~₹12.8 L) annually",
        insurance: "Provincial coverage varies",
        note: "The Student Direct Stream (SDS) was discontinued in late 2024. Your Letter of Acceptance (LOA) serves as proof of English capability for standard visa applications."
      },
      faqs: [
        { q: "Is the Duolingo English Test valid for Permanent Residency (PR) in Canada?", a: "No. The DET is strictly for academic admissions and study permits. For PR, you must take an approved immigration test like IELTS General Training or CELPIP." },
        { q: "Can I get a Canadian student visa with Duolingo?", a: "Yes. Since the SDS stream is gone, your Letter of Acceptance (LOA) from a Designated Learning Institution (DLI) is typically accepted as proof of English skills." }
      ]
    },
    uk: {
      title: "Duolingo Accepted Universities in UK 2026",
      hook: { value: "50+", label: "UK universities accept Duolingo for 2026-27 admissions. The UK student visa still needs a SELT.", hi: "Dhyaan do" },
      subtitle: "Admissions score lists, two-test strategy costs, and UKVI student visa SELT compliance.",
      highlights: [
        { label: "Top Accepting Universities", value: "Greenwich, Hertfordshire, Coventry, West London" },
        { label: "UKVI Student Visa Status", value: "DET is NOT accepted by UKVI (Requires SELT)" },
        { label: "MSc Minimum DET Score", value: "110 to 125 for taught programs" },
        { label: "Estimated Test Budget", value: "Rs 6,200 ($70) for DET + Rs 21,000+ for IELTS UKVI" }
      ],
      description: "Over 50 UK universities accept the Duolingo English Test (DET) for 2026-27 admissions, providing a convenient route for Indian applicants to secure academic offers in 48 hours. However, the UK student visa requires a Secure English Language Test (SELT) approved by the Home Office (like IELTS UKVI or PTE Academic UKVI). This creates a 'two-test strategy' where DET locks in admission, and a SELT secures your student visa.",
      universities: [
        { name: "University of Hertfordshire", rank: "N/A", score: "105 (IELTS 6.0 equiv)" },
        { name: "Coventry University", rank: "N/A", score: "110 (IELTS 6.0 equiv)" },
        { name: "University of Greenwich", rank: "N/A", score: "110 (IELTS 6.0 equiv)" },
        { name: "Anglia Ruskin University", rank: "N/A", score: "105 (IELTS 6.0 equiv)" },
        { name: "University of Northampton", rank: "N/A", score: "105 (IELTS 5.5-6.0 equiv)" },
        { name: "University of West London", rank: "N/A", score: "105 (IELTS 6.0 equiv)" },
        { name: "London South Bank University (LSBU)", rank: "N/A", score: "110 (IELTS 6.0 equiv)" },
        { name: "University of Bedfordshire", rank: "N/A", score: "105 (IELTS 5.5-6.0 equiv)" },
        { name: "University of Chester", rank: "N/A", score: "110 (IELTS 6.0 equiv)" },
        { name: "University of Derby", rank: "N/A", score: "110 (IELTS 6.0 equiv)" },
        { name: "University of Salford", rank: "N/A", score: "115 (IELTS 6.0-6.5 equiv)" },
        { name: "Sheffield Hallam University", rank: "N/A", score: "115 (IELTS 6.0-6.5 equiv)" },
        { name: "Northumbria University", rank: "N/A", score: "110 (IELTS 6.0 equiv)" },
        { name: "De Montfort University (DMU)", rank: "N/A", score: "110 (IELTS 6.0 equiv)" },
        { name: "Brunel University London", rank: "N/A", score: "120 (IELTS 6.5 equiv)" }
      ],
      programScores: {
        ug: [
          { range: "100–110", courses: "Undergraduate entry (select universities)" },
          { range: "90–100", courses: "Foundation / Pre-sessional pathways only" }
        ],
        pg: [
          { range: "120–130", courses: "Competitive MSc / 1-year MBA programs" },
          { range: "110–120", courses: "Taught MSc / PG programs (most accepting universities)" }
        ]
      },
      visa: {
        type: "UKVI Student Visa (Point-Based Route)",
        fee: "£490 (~₹52,000)",
        time: "3 to 4 weeks",
        proof: "£1,334/mo (London) or £1,023/mo (outside)",
        insurance: "IHS: ~£776 (~₹99,361) per year",
        note: "UK Visas and Immigration (UKVI) does not accept DET for the student visa. You must book and pass a SELT test like IELTS Academic for UKVI or PTE Academic UKVI to apply for the visa."
      },
      faqs: [
        { q: "Does the UK student visa accept the Duolingo English Test?", a: "No. The UK Home Office maintains a strict list of approved Secure English Language Tests (SELTs). The Duolingo English Test is not on this list. You will need to take a SELT like IELTS for UKVI or PTE Academic UKVI for your student visa application, even if your university accepted DET for academic admission." },
        { q: "Which Russell Group universities accept Duolingo in 2026?", a: "Most Russell Group universities (including Manchester, Edinburgh, UCL, and King's College) do not accept DET for standard admissions. A very small number may consider it on a case-by-case basis. It is safest to take a UKVI-approved SELT if you are targeting Russell Group institutions." },
        { q: "What happens if my DET score is below the university's minimum?", a: "You can retake the DET straight away (up to twice within a 30-day period), request admission to a pre-sessional English course, or pivot to preparing for IELTS Academic for UKVI." }
      ]
    },
    ireland: {
      title: "Duolingo Accepted Universities in Ireland (2026)",
      hook: { value: "130", label: "recommended overall DET target for Ireland (120 academic baseline)", hi: "Target" },
      subtitle: "Verified minimum scores, mandatory sub-score thresholds, accepted intakes, and student visa info.",
      highlights: [
        { label: "Top Accepted Universities", value: "Trinity College Dublin, UCD, UCC, DCU, UL" },
        { label: "Recommended DET Target", value: "130 overall (120 academic baseline)" },
        { label: "Test Cost", value: "USD 70 (~₹7,168)" },
        { label: "Ireland Intakes", value: "Autumn (September) & Spring (February)" }
      ],
      description: "Planning to study in Ireland for the 2026 intake but looking for an alternative to IELTS? Many top Irish universities accept the Duolingo English Test (DET) as proof of English proficiency. While Irish Immigration (INIS) sets the visa regulatory minimum at 75, top universities require an overall minimum of 120 with strict sectional sub-score thresholds (usually 100 or 110). Aiming for 130 or higher maximizes admission safety.",
      universities: [
        { name: "Trinity College Dublin (TCD)", rank: "75", score: "120 (requires 100 in each subscale)" },
        { name: "University College Dublin (UCD)", rank: "118", score: "120 (requires 110 in each subscale)" },
        { name: "University College Cork (UCC)", rank: "246", score: "120 (requires 110 in each subscale)" },
        { name: "Dublin City University (DCU)", rank: "410", score: "120 (requires 110 in all subscores)" },
        { name: "University of Limerick (UL)", rank: "401", score: "120 (no section below 110)" },
        { name: "Maynooth University", rank: "N/A", score: "110–120" },
        { name: "National College of Ireland (NCI)", rank: "N/A", score: "95–120" },
        { name: "Dublin Business School (DBS)", rank: "N/A", score: "95–120" },
        { name: "South East Technological University (SETU)", rank: "N/A", score: "90 (for UG entries)" },
        { name: "Technological University of the Shannon (TUS)", rank: "N/A", score: "90 (for Master's entries)" }
      ],
      programScores: {
        ug: [
          { range: "120+", courses: "Direct Entry (TCD, UCD, UCC)" },
          { range: "110–119", courses: "Maynooth / NCI Bachelor's programs" },
          { range: "90–109", courses: "SETU / TUS undergraduate programs" }
        ],
        pg: [
          { range: "130+", courses: "UCD / TCD Master's & PG Business" },
          { range: "120–129", courses: "DCU / Limerick PG engineering/science" },
          { range: "100–119", courses: "NCI / Atlantic Tech PG programs" }
        ]
      },
      visa: {
        type: "Irish Student Visa (D-Visa)",
        fee: "€60 (~₹6,150)",
        time: "4 to 6 weeks",
        proof: "€10,000 (~₹10.2 L) annually",
        insurance: "Private medical insurance mandatory",
        note: "Do not confuse the low INIS visa regulatory minimum of 75 with the higher university academic requirement of 120. Meet your university's score threshold first."
      },
      faqs: [
        { q: "Is Duolingo accepted for Ireland student visa applications?", a: "Yes. The Irish Immigration Service (INIS) officially accepts DET results for student visa applications (minimum score of 75), provided the test was taken within two years of your course start date." },
        { q: "What is the difference between TCD and UCD sub-score requirements?", a: "Trinity College (TCD) requires an overall 120 with a minimum of 100 in each subscore. University College Dublin (UCD) requires an overall 120 with a minimum of 110 in each subscore. Sub-score compliance is crucial for admission." },
        { q: "Which is better for Ireland: IELTS or Duolingo?", a: "Both are fully accepted. IELTS is universally accepted but more expensive (~Rs 16,250) and requires center travel. Duolingo is online, costs $70 (~Rs 7,168), and gives results in 48 hours, making it a faster and more flexible option if your university accepts it." }
      ]
    },
    germany: {
      title: "Duolingo Accepted Universities in Germany in 2026",
      hook: { value: "105", label: "average accepted Duolingo score out of 160 at German universities", hi: "Germany" },
      subtitle: "German private and public university admissions, course score bands, and student visa updates.",
      highlights: [
        { label: "Top Accepted Universities", value: "TUM, Heidelberg, Freie Berlin, Humboldt Berlin" },
        { label: "Ideal Duolingo Score", value: "105 or above (varies by program)" },
        { label: "Cost for Duolingo Test", value: "USD 70 (~₹6,000 / €65)" },
        { label: "Germany Intakes", value: "Winter (September) & Summer (April)" }
      ],
      description: "Germany now hosts over 458,000 international students, making it the third most popular study destination globally. For Indian students, several top-tier universities accept Duolingo English Test (DET) scores for admissions to selected English-taught courses. The average accepted score is 105 out of 160, and results are delivered online within just 48 hours.",
      universities: [
        { name: "Technical University of Munich (TUM)", rank: "22", score: "120" },
        { name: "Universität Heidelberg", rank: "80", score: "110–120 (varies by program)" },
        { name: "Freie Universität Berlin", rank: "88", score: "115–120" },
        { name: "Humboldt-Universität zu Berlin", rank: "130", score: "105–115" },
        { name: "University of Münster", rank: "350", score: "95–100" },
        { name: "Universität Konstanz", rank: "440", score: "100–105" },
        { name: "Jacobs University Bremen", rank: "N/A", score: "90–110" },
        { name: "IU Internationale Hochschule", rank: "N/A", score: "95+" },
        { name: "University of Passau", rank: "700+", score: "100" },
        { name: "SRH Hochschule Berlin", rank: "N/A", score: "100–105" }
      ],
      programScores: {
        ug: [
          { range: "115+", courses: "Medicine, Science, Law, Engineering" },
          { range: "110–114", courses: "Business Administration, Social Science" },
          { range: "105–109", courses: "Humanities & Preparatory Studies" }
        ],
        pg: [
          { range: "120+", courses: "Top Public Master's & MBA programs" },
          { range: "110–119", courses: "Heidelberg / Freie Berlin Master's" },
          { range: "100–110", courses: "Münster / Passau PG programs" }
        ]
      },
      visa: {
        type: "German National Visa (D-Visa)",
        fee: "€75 (~₹7,688)",
        time: "6 to 12 weeks",
        proof: "€11,904 block account (~₹11 L)",
        insurance: "Travel insurance + public health insurance",
        note: "Embassy rules for German student visas typically prefer IELTS or TOEFL. However, if your university grants direct admission based on your DET score, the official Letter of Acceptance is usually accepted as proof of English capability."
      },
      faqs: [
        { q: "Is Duolingo accepted for a German student visa?", a: "The DET is accepted by many German universities for admission, but it is not officially recognised by German embassies or consulates for student visa purposes. However, visa officers typically rely on the university's admission letter as proof of English proficiency." },
        { q: "Which university in Germany accepts a 90 Duolingo score?", a: "A 90 DET score is generally below standard entry requirements for master's programs. However, a few universities or applied science institutions may accept it for foundation, preparatory, or pathway courses (such as University of Münster preparatory classes)." },
        { q: "Can Duolingo get you to A1 German?", a: "No. The Duolingo English Test measures English proficiency only. To reach A1 level in German, you need to take a certified German language test such as Goethe-Zertifikat A1, TestDaF, or TELC." }
      ]
    }
  };

  const activeData = countryData[country] || countryData.australia;

  // Minimum DET score per university, read from the score strings above (e.g. "120 (130+ for Law/Med)" -> 120)
  const scoreBars = activeData.universities.slice(0, 6).map((uni) => ({
    label: uni.name.match(/\(([^)]+)\)$/)?.[1] || uni.name.replace(/^University of /, ''),
    value: parseInt(uni.score, 10),
    display: uni.score.match(/^[\d–+-]+/)?.[0] || uni.score,
  })).filter((b) => !Number.isNaN(b.value));

  // FAQPage structured data so Google can read the answers (the accordion hides them visually only)
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'duolingo-country-faq';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [...(activeData.quickAnswer ? [{ q: activeData.quickAnswer.q, a: activeData.quickAnswer.a }] : []), ...activeData.faqs].map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
    document.getElementById('duolingo-country-faq')?.remove();
    document.head.appendChild(script);
    return () => script.remove();
  // countryData is rebuilt every render, so key the effect on the country
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const countryName = country === 'usa' ? 'USA' : country === 'uk' ? 'UK' : country.charAt(0).toUpperCase() + country.slice(1);

  const visaRows = [
    { k: 'Visa Type:', v: activeData.visa.type },
    { k: 'Embassy Fee:', v: activeData.visa.fee },
    { k: 'Processing Time:', v: activeData.visa.time },
    { k: 'Financial Proof:', v: activeData.visa.proof },
    { k: 'Health Insurance:', v: activeData.visa.insurance }
  ];

  return (
    <main className="min-h-screen bg-[#FFF6E5] pb-20 select-none font-['Onest',sans-serif] text-[#16130F]">
      {/* ── HERO: teal poster band ── */}
      <DesiHero
        tone="teal"
        sign={{ hi: 'Duolingo', en: 'DUOLINGO DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Duolingo', to: '/exams/duolingo' }, { label: activeData.title }]}
        title={activeData.title}
        subtitle={activeData.subtitle}
        stickers={(
          <>
            <Sticker bg="#F2B705" tilt={-2}><Compass size={14} />Country-Specific Duolingo Guide 2026</Sticker>
            <Sticker tilt={1.5}>{countryName}</Sticker>
          </>
        )}
      />

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-10 sm:pt-12 space-y-12">

        {/* Direct answer first (AEO): question as heading, 2-line answer, then a small comparison table */}
        {activeData.quickAnswer && (
          <InkCard className="p-5 sm:p-8 space-y-4" shadow="#D0362E">
            <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none">Seedha jawab</p>
            <h2 className="font-urbanist font-black text-[22px] sm:text-[28px] text-[#16130F] leading-tight">{activeData.quickAnswer.q}</h2>
            <p className="text-[15px] sm:text-[16px] text-[#3D362E] leading-relaxed">{activeData.quickAnswer.a}</p>
            {activeData.quickAnswer.table && (
              <div className="overflow-x-auto border-[3px] border-[#16130F] bg-white" style={{ borderRadius: 12 }}>
                <table className="w-full min-w-[520px] text-left border-collapse">
                  <thead className="bg-[#FFF1B8]">
                    <tr>
                      {activeData.quickAnswer.table.head.map((h) => (
                        <th key={h} className="py-3 px-4 text-[11.5px] font-extrabold uppercase tracking-wider border-b-[3px] border-[#16130F]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[13.5px] text-[#3D362E]">
                    {activeData.quickAnswer.table.rows.map((row, idx) => (
                      <tr key={row[0]} className={`border-t-2 border-[#16130F1A] first:border-t-0 ${idx % 2 ? 'bg-[#FFF6E5]' : ''}`}>
                        {row.map((cell, ci) => (
                          <td key={ci} className={`py-3 px-4 ${ci === 0 ? 'font-extrabold text-[#16130F]' : ''}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeData.quickAnswer.source && (
              <p className="text-[12px] text-[#8A7F70]">{activeData.quickAnswer.source}</p>
            )}
          </InkCard>
        )}

        {/* Visual hook */}
        <HookBand value={activeData.hook.value} label={activeData.hook.label} hi={activeData.hook.hi} />

        {/* Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {activeData.highlights.map((h, idx) => {
            const tone = DESI_TONES[idx % 4];
            return (
              <div key={h.label} className="bg-white border-[3px] border-[#16130F] p-4 sm:p-5 shadow-[4px_4px_0_#16130F]" style={{ borderRadius: 12, borderTop: `8px solid ${tone.c}` }}>
                <span className="text-[10.5px] text-[#5B544A] font-extrabold uppercase tracking-wider block mb-1.5">{h.label}</span>
                <span className="font-urbanist text-[15px] font-black text-[#16130F] leading-snug">{h.value}</span>
              </div>
            );
          })}
        </div>

        {/* Overview Box */}
        <InkCard className="p-5 sm:p-8 md:p-10 space-y-4" shadow="#14837E">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full border-2 border-[#16130F] bg-[#14837E] text-white grid place-items-center shrink-0 shadow-[2px_2px_0_#16130F]">
              <Sparkles size={18} />
            </span>
            <DesiHeading hi={activeData.overviewTitle?.hi || 'Badhti acceptance'}>{activeData.overviewTitle?.en || 'Overview & Growing Acceptance'}</DesiHeading>
          </div>
          <p className="text-[14.5px] text-[#5B544A] leading-relaxed">
            {activeData.description}
          </p>
        </InkCard>

        {scoreBars.length >= 2 && (
          <BarCompare
            kicker="Score check"
            title="Minimum Duolingo score at top universities"
            items={scoreBars}
            highlight={scoreBars[0].label}
          />
        )}

        {/* Tables and Requirements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Universities Table */}
          <section className="lg:col-span-8 min-w-0">
            <DesiHeading hi="Kaunsi university">{activeData.tableTitle || 'Top Duolingo Accepted Universities'}</DesiHeading>
            <div className="mt-5 overflow-x-auto bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F]" style={{ borderRadius: 12 }}>
              <table className="w-full min-w-[520px] text-left border-collapse">
                <thead className="bg-[#14837E] text-white">
                  <tr>
                    <th className="py-3 px-4 text-[11.5px] font-extrabold uppercase tracking-wider border-b-[3px] border-[#16130F]">University</th>
                    <th className="py-3 px-4 text-[11.5px] font-extrabold uppercase tracking-wider border-b-[3px] border-[#16130F] text-center">QS Ranking 2026</th>
                    <th className="py-3 px-4 text-[11.5px] font-extrabold uppercase tracking-wider border-b-[3px] border-[#16130F] text-center">{activeData.scoreHeader || 'Minimum DET Score'}</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-[#3D362E]">
                  {activeData.universities.map((uni, idx) => (
                    <tr key={uni.name} className={`border-t-2 border-[#16130F1A] first:border-t-0 ${idx % 2 ? 'bg-[#FFF6E5]' : ''}`}>
                      <td className="py-3 px-4 font-extrabold text-[#16130F]">{uni.name}</td>
                      <td className="py-3 px-4 text-[#5B544A] font-bold text-center">{uni.rank}</td>
                      <td className="py-3 px-4 text-[#14837E] font-black text-center">{uni.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activeData.tableNote && <p className="mt-3 text-[12px] text-[#8A7F70]">{activeData.tableNote}</p>}
          </section>

          {/* Program requirements & Visa Info */}
          <div className="lg:col-span-4 space-y-6 min-w-0">

            {/* Program Requirements */}
            {activeData.programScores && (
            <InkCard className="p-5 sm:p-6 space-y-4">
              <div>
                <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none">Course ke hisaab se</p>
                <h4 className="mt-1 font-urbanist font-black text-[16px] text-[#16130F]">Score Range by Course Level</h4>
              </div>
              <ScoreList label="Undergraduate (UG)" items={activeData.programScores.ug} chip={DESI_TONES[1]} />
              <div className="border-t-2 border-dashed border-[#16130F33]" />
              <ScoreList label="Postgraduate (PG)" items={activeData.programScores.pg} chip={DESI_TONES[2]} />
            </InkCard>
            )}

            {/* Visa Card */}
            <InkCard className="p-5 sm:p-6 space-y-4" shadow="#B8285B">
              <div>
                <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none">Visa</p>
                <h4 className="mt-1 font-urbanist font-black text-[16px] text-[#16130F]">Visa Requirements</h4>
              </div>
              <div className="space-y-2.5 text-[13px]">
                {visaRows.map((r) => (
                  <div key={r.k} className="flex justify-between gap-3 pb-2 border-b border-dashed border-[#16130F26] last:border-b-0">
                    <span className="text-[#5B544A] font-bold shrink-0">{r.k}</span>
                    <span className="font-extrabold text-[#16130F] text-right min-w-0">{r.v}</span>
                  </div>
                ))}
                <div className="p-3 bg-[#FFF1B8] border-2 border-[#16130F] rounded-xl text-[12.5px] leading-relaxed text-[#3D362E] font-semibold mt-2 flex items-start gap-2">
                  <Info size={15} className="text-[#D0362E] shrink-0 mt-0.5" />
                  <span>{activeData.visa.note}</span>
                </div>
              </div>
            </InkCard>

          </div>

        </div>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto">
          <DesiHeading hi="Sabke sawaal" className="text-center">Frequently Asked Questions</DesiHeading>
          <div className="mt-6 space-y-3">
            {activeData.faqs.map((faq, idx) => {
              const isOpen = !!openFaq[idx];
              return (
                <div key={faq.q} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: isOpen ? '4px 4px 0 #14837E' : '4px 4px 0 #16130F' }}>
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="no-shine w-full flex items-center justify-between gap-3 p-4 text-left font-bold text-[14.5px] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className={`w-7 h-7 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#F2B705]' : 'bg-white'}`}>
                      <ChevronDown size={15} />
                    </span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0 }}
                    className="overflow-hidden"
                    aria-hidden={!isOpen}
                  >
                    <p className="px-4 pb-4 pt-3 text-[#5B544A] text-[14px] border-t-2 border-dashed border-[#16130F33] leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <BookOkCta
          to="/book-consultation"
          hi="Duolingo se admission"
          title="Book OK Please."
          text={`${countryName} ke liye DET chalega ya visa ke liye doosra test? Free 1:1 call mein mentor se poocho.`}
        />

      </div>
    </main>
  );
};

export default DuolingoAcceptedCountry;
