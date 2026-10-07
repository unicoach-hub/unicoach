import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import StudyAbroadCTA from '../../../components/StudyAbroadCTA';

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
      title: "Duolingo Accepted Universities in Australia 2026",
      subtitle: "List of top Australian universities accepting Duolingo scores, UG & PG requirements, and visa details.",
      highlights: [
        { label: "Top Accepted Universities", value: "Uni of Melbourne, UNSW, Uni of Sydney, Monash Uni" },
        { label: "Average Tuition Fees", value: "₹22 L – ₹28 L (AUD 39,000 – 50,000) per year" },
        { label: "Minimum Score Range", value: "100 – 120 (UG & PG)" },
        { label: "Visa Pathway", value: "Student Visa (Subclass 500) accepted with LOA" }
      ],
      description: "The Duolingo English Test (DET) has become a trusted alternative to IELTS and TOEFL for Australian university admissions. In 2026, more than 100 universities in Australia accept Duolingo scores, offering a flexible and accessible English proficiency option for international students.",
      universities: [
        { name: "University of Melbourne", rank: "19", score: "120 (130+ for Law/Med)" },
        { name: "University of New South Wales (UNSW)", rank: "20", score: "110 (125+ for Eng/Law)" },
        { name: "University of Sydney", rank: "25", score: "115 (125+ for Medicine)" },
        { name: "Australian National University (ANU)", rank: "32", score: "110" },
        { name: "Monash University", rank: "36", score: "115" },
        { name: "University of Queensland (UQ)", rank: "42", score: "105" },
        { name: "University of Western Australia (UWA)", rank: "77", score: "100" },
        { name: "University of Adelaide", rank: "82", score: "105" },
        { name: "University of Technology Sydney (UTS)", rank: "96", score: "100" },
        { name: "RMIT University", rank: "125", score: "100" }
      ],
      programScores: {
        ug: [
          { range: "115+", courses: "Medicine, Engineering, Law" },
          { range: "110–114", courses: "Business, Computer Science, Psychology" },
          { range: "105–109", courses: "Humanities, Social Sciences, Education" }
        ],
        pg: [
          { range: "120+", courses: "MBA, MS Computer Science" },
          { range: "115–119", courses: "Engineering, Medicine, Law" },
          { range: "110–114", courses: "Business, Psychology, Data Science" }
        ]
      },
      visa: {
        type: "Student Visa (Subclass 500)",
        fee: "AUD 630 (~₹35,000)",
        time: "Around 4 weeks",
        proof: "AUD 42,000 (~₹23 L) annually",
        insurance: "Overseas Student Health Cover (OSHC) mandatory",
        note: "Ensure your chosen university's confirmation letter explicitly lists DET acceptance before applying."
      },
      faqs: [
        { q: "Is Duolingo accepted for Australian student visas?", a: "Yes. Many Australian universities accepting the DET allow it for visa language requirements when paired with a university-issued confirmation." },
        { q: "Can I get conditional admission with DET in Australia?", a: "Yes, some universities accepting the DET in Australia may grant conditional admission, allowing you to complete additional English language support courses." }
      ]
    },
    canada: {
      title: "Duolingo Accepted Universities in Canada 2026",
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

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-655 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-slate-405" />
          <Link to="/exams/duolingo" className="hover:text-indigo-655 transition-colors">Duolingo</Link>
          <ChevronRight size={12} className="text-slate-405" />
          <span className="text-slate-600 font-black">{activeData.title}</span>
        </div>

        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Compass size={14} />
              Country-Specific Duolingo Guide 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              {activeData.title}
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              {activeData.subtitle}
            </p>
          </div>
        </div>

        {/* Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {activeData.highlights.map((h, idx) => (
            <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">{h.label}</span>
              <span className="text-xs font-black text-slate-800 leading-snug">{h.value}</span>
            </div>
          ))}
        </div>

        {/* Overview Box */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 md:p-10 mb-12 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="text-indigo-650" size={18} />
            <span>Overview & Growing Acceptance</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-655 font-semibold leading-relaxed">
            {activeData.description}
          </p>
        </div>

        {/* Tables and Requirements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Universities Table */}
          <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-6">Top Duolingo Accepted Universities</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">University</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">QS Ranking 2026</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Minimum DET Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-xs">
                  {activeData.universities.map((uni, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-black">{uni.name}</td>
                      <td className="py-3 px-4 text-slate-500 font-bold text-center">{uni.rank}</td>
                      <td className="py-3 px-4 text-indigo-700 font-black text-center">{uni.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Program requirements & Visa Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Program Requirements */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs space-y-4">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Score Range by Course Level</h4>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Undergraduate (UG)</span>
                  <div className="space-y-2">
                    {activeData.programScores.ug.map((score, sIdx) => (
                      <div key={sIdx} className="flex justify-between items-center text-[11px] font-semibold">
                        <span className="text-slate-600">{score.courses}</span>
                        <span className="bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded-md font-black">{score.range}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Postgraduate (PG)</span>
                  <div className="space-y-2">
                    {activeData.programScores.pg.map((score, sIdx) => (
                      <div key={sIdx} className="flex justify-between items-center text-[11px] font-semibold">
                        <span className="text-slate-600">{score.courses}</span>
                        <span className="bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded-md font-black">{score.range}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Visa Card */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs space-y-4">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Visa Requirements</h4>
              <div className="space-y-2.5 text-[11px] font-semibold text-slate-655">
                <div className="flex justify-between"><span className="text-slate-400 font-bold">Visa Type:</span><span className="font-black text-slate-800">{activeData.visa.type}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold">Embassy Fee:</span><span className="font-black text-slate-800">{activeData.visa.fee}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold">Processing Time:</span><span className="font-black text-slate-800">{activeData.visa.time}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold">Financial Proof:</span><span className="font-black text-slate-800">{activeData.visa.proof}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold">Health Insurance:</span><span className="font-black text-slate-800">{activeData.visa.insurance}</span></div>
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-[10px] leading-relaxed text-amber-800 font-bold mt-2">
                  {activeData.visa.note}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {activeData.faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-black text-xs text-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {openFaq[idx] && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="p-5 text-xs text-slate-500 font-semibold border-t border-slate-100 leading-relaxed bg-slate-50/30">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Study Abroad CTA */}
        <StudyAbroadCTA country={country === 'usa' ? 'USA' : country === 'uk' ? 'UK' : country.charAt(0).toUpperCase() + country.slice(1)} />

      </div>
    </div>
  );
};

export default DuolingoAcceptedCountry;
