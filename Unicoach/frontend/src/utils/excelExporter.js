import XLSX from 'xlsx-js-style';
import { getVerifiedRanking } from './ranking';
import { getOfficialRequirements, getGreText, CHECK_SITE } from './requirements';

/**
 * Standard Available Fields for Download Checklist Modal (35 Fields, 3-Column Layout)
 * Matches the CourseFinder & UniCoach standard study-abroad export checklist.
 */
export const STANDARD_DOWNLOAD_FIELDS = [
  // Column 1 (12 items)
  { id: 'University', label: 'University', defaultChecked: true },
  { id: 'Website URL', label: 'Website URL', defaultChecked: true },
  { id: 'Study Level', label: 'Study Level', defaultChecked: true },
  { id: 'Entry Requirements', label: 'Entry Requirements', defaultChecked: true },
  { id: 'TOEFL Score', label: 'TOEFL Score', defaultChecked: true },
  { id: 'PTE No Band Less Than', label: 'PTE No Band Less Than', defaultChecked: false },
  { id: 'GRE Score', label: 'GRE Score', defaultChecked: true },
  { id: 'Application Fee', label: 'Application Fee', defaultChecked: true },
  { id: 'Scholarship Detail', label: 'Scholarship Detail', defaultChecked: true },
  { id: 'ESL/ELP Detail', label: 'ESL/ELP Detail', defaultChecked: false },
  { id: 'Program Name', label: 'Program Name', defaultChecked: true },
  { id: 'Campus', label: 'Campus', defaultChecked: true },

  // Column 2 (12 items)
  { id: 'Duration', label: 'Duration', defaultChecked: true },
  { id: 'IELTS Score', label: 'IELTS Score', defaultChecked: true },
  { id: 'TOEFL No Band Less Than', label: 'TOEFL No Band Less Than', defaultChecked: false },
  { id: 'SAT Score', label: 'SAT Score', defaultChecked: false },
  { id: 'GMAT Score', label: 'GMAT Score', defaultChecked: false },
  { id: 'Yearly Tuition Fee', label: 'Yearly Tuition Fee', defaultChecked: true },
  { id: 'Deposit', label: 'Deposit', defaultChecked: true },
  { id: 'Backlog Range', label: 'Backlog Range', defaultChecked: false },
  { id: 'Concentration', label: 'Concentration', defaultChecked: true },
  { id: 'Country', label: 'Country', defaultChecked: true },
  { id: 'Open Intakes', label: 'Open Intakes', defaultChecked: true },
  { id: 'Intake Year', label: 'Intake Year', defaultChecked: true },

  // Column 3 (11 items)
  { id: 'IELTS No Band Less Than', label: 'IELTS No Band Less Than', defaultChecked: true },
  { id: 'PTE Score', label: 'PTE Score', defaultChecked: false },
  { id: 'DET Score', label: 'DET Score', defaultChecked: false },
  { id: 'ACT Score', label: 'ACT Score', defaultChecked: false },
  { id: 'Application Deadline', label: 'Application Deadline', defaultChecked: true },
  { id: 'Scholarship Available', label: 'Scholarship Available', defaultChecked: true },
  { id: 'Average Scholarship', label: 'Average Scholarship', defaultChecked: true },
  { id: 'Remarks', label: 'Remarks', defaultChecked: true },
  { id: 'Application Mode', label: 'Application Mode', defaultChecked: false },
  { id: 'English Proficiency Exam Waiver', label: 'English Proficiency Exam Waiver', defaultChecked: true },
  { id: 'University Ranking', label: 'University Ranking', defaultChecked: true },
];

/**
 * Standard Available Columns for Degree Programs Export (Backward compatibility)
 */
export const DEFAULT_PROGRAM_COLUMNS = STANDARD_DOWNLOAD_FIELDS;

/**
 * Standard Available Columns for Universities Shortlist Export (Backward compatibility)
 */
export const DEFAULT_UNIVERSITY_COLUMNS = STANDARD_DOWNLOAD_FIELDS;

/**
 * Format university rankings cleanly across multiple ranking bodies
 * Guarantees zero "null" values (fixes "US News Ranking - null" bug)
 */
function formatUniversityRankings(uni) {
  if (!uni) return 'N/A';
  const lines = [];
  const ranking = getVerifiedRanking(uni);
  const country = uni.countryName || uni.country || 'Global';

  // 1. World ranking, only when imported from an official ranking file (other records hold placeholder values)
  if (ranking) {
    lines.push(`${ranking.source} - ${ranking.label}`);
  }

  // 2. National Ranking (no longer guessed from the world rank)
  if (uni.nationalRank && !String(uni.nationalRank).toLowerCase().includes('null')) {
    lines.push(`${country} National Ranking - #${uni.nationalRank}`);
  }

  // 3. Times Higher Education or US News (ONLY if valid, never "null")
  if (uni.theRank && !String(uni.theRank).toLowerCase().includes('null')) {
    lines.push(`THE World Ranking - #${uni.theRank}`);
  } else if (uni.usNewsRank && !String(uni.usNewsRank).toLowerCase().includes('null')) {
    lines.push(`US News Ranking - #${uni.usNewsRank}`);
  }

  // 4. Webometrics World Ranking (no longer computed from the world rank)
  if (uni.webometricsRank && !String(uni.webometricsRank).toLowerCase().includes('null')) {
    lines.push(`Webometrics World Ranking - #${uni.webometricsRank}`);
  }

  return lines.length > 0 ? lines.join('\n') : 'N/A';
}

/**
 * Auto-fit column widths based on maximum string length per line
 */
function getColumnWidths(dataRows) {
  if (!dataRows || dataRows.length === 0) return [];
  const colKeys = Object.keys(dataRows[0]);
  return colKeys.map(key => {
    let maxLen = key.length;
    dataRows.forEach(row => {
      const val = row[key];
      if (val !== null && val !== undefined) {
        const lines = String(val).split('\n');
        lines.forEach(line => {
          if (line.length > maxLen) {
            maxLen = Math.min(line.length, 52);
          }
        });
      }
    });

    if (key === 'Serial No.' || key === 'S.No') return { wch: 10 };
    if (key === 'University' || key === 'Program Name') return { wch: Math.max(maxLen + 4, 30) };
    if (key === 'University Ranking') return { wch: Math.max(maxLen + 4, 32) };
    if (key === 'Website URL') return { wch: Math.max(maxLen + 4, 34) };
    return { wch: Math.max(maxLen + 4, 14) };
  });
}

/**
 * Apply UniCoach Brand Orange Headers, Crisp Cell Borders & Alternating Zebra Tint
 */
function applyUniCoachExcelStyles(ws, dataRows) {
  if (!ws || !ws['!ref'] || !dataRows || dataRows.length === 0) return;

  const range = XLSX.utils.decode_range(ws['!ref']);
  const rowHeights = [{ hpt: 32 }]; // Header row is 32pt height

  for (let R = range.s.r; R <= range.e.r; ++R) {
    let maxLinesInRow = 1;

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellAddr];
      if (!cell) continue;

      if (R === 0) {
        // ── UNICOACH BRAND ORANGE HEADER ROW ──
        cell.s = {
          font: {
            name: 'Calibri',
            sz: 11,
            bold: true,
            color: { rgb: 'FFFFFF' }
          },
          fill: {
            fgColor: { rgb: 'DE5C2B' } // UniCoach Primary Brand Orange (#DE5C2B)
          },
          alignment: {
            vertical: 'center',
            horizontal: 'center',
            wrapText: true
          },
          border: {
            top: { style: 'medium', color: { rgb: 'B8441A' } },
            bottom: { style: 'medium', color: { rgb: 'B8441A' } },
            left: { style: 'thin', color: { rgb: 'EA7E55' } },
            right: { style: 'thin', color: { rgb: 'EA7E55' } }
          }
        };
      } else {
        // ── CLEAN DATA CELLS WITH CRISP BORDERS ──
        const strVal = String(cell.v !== null && cell.v !== undefined ? cell.v : '');
        const lineCount = strVal.split('\n').length;
        if (lineCount > maxLinesInRow) {
          maxLinesInRow = lineCount;
        }

        const isEven = R % 2 === 0;
        const colHeader = ws[XLSX.utils.encode_cell({ r: 0, c: C })]?.v || '';
        const isCenterCol = C === 0 || 
          ['Serial No.', 'S.No', 'IELTS Score', 'TOEFL Score', 'Duration', 'Open Intakes', 'Intake Year', 'Scholarship Available'].includes(colHeader);

        cell.s = {
          font: {
            name: 'Calibri',
            sz: 10,
            color: { rgb: '1E293B' }
          },
          fill: {
            fgColor: { rgb: isEven ? 'F9FAFB' : 'FFFFFF' }
          },
          alignment: {
            vertical: 'center',
            horizontal: isCenterCol ? 'center' : 'left',
            wrapText: true
          },
          border: {
            top: { style: 'thin', color: { rgb: 'D1D5DB' } },
            bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
            left: { style: 'thin', color: { rgb: 'D1D5DB' } },
            right: { style: 'thin', color: { rgb: 'D1D5DB' } }
          }
        };
      }
    }

    if (R > 0) {
      // Dynamic row height: 24pt for single-line, extra 17pt per newline
      rowHeights.push({ hpt: Math.max(24, maxLinesInRow * 17 + 7) });
    }
  }

  ws['!rows'] = rowHeights;
}

/**
 * Export university list to formatted Excel (.xlsx) file
 * 
 * @param {Array} universities - List of university objects
 * @param {Object} options - Custom options (filename, sheetName, studentProfile, title, selectedColumnKeys)
 */
export function exportUniversitiesToExcel(universities = [], options = {}) {
  try {
    if (!universities || universities.length === 0) {
      alert('No universities found to export.');
      return false;
    }

    const {
      filename = `CourseFinder_Universities_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName = 'Universities',
      studentProfile = null,
      categoryFilter = 'All'
    } = options;

    // Transform universities to 35-field standard columns
    const excelRows = universities.map((uni, idx) => {
      const rankingStr = formatUniversityRankings(uni);

      const tuitionUSD = uni.tuitionFeeUSD ? `$${uni.tuitionFeeUSD.toLocaleString()}/year` : (uni.tuition || 'N/A');
      const degreesStr = Array.isArray(uni.degreeLevels) 
        ? uni.degreeLevels.join(', ') 
        : (uni.degreeLevels || "Postgraduate, Bachelor's");

      const coursesStr = Array.isArray(uni.courses) 
        ? uni.courses.join('; ') 
        : (uni.courses || 'Computer Science, Data Analytics, MBA, Engineering');

      const primaryProgram = (Array.isArray(uni.courses) && uni.courses.length > 0)
        ? uni.courses[0]
        : (uni.streamMajor || 'Computer Science');

      const intakesStr = Array.isArray(uni.intakes) 
        ? uni.intakes.join(', ') 
        : 'September / Fall, January / Spring';

      const websiteUrl = uni.website || (uni.name ? `https://www.google.com/search?q=${encodeURIComponent(uni.name + ' official portal')}` : 'N/A');
      const countryStr = uni.countryName || uni.country || 'Global';
      // Requirements only when taken from the university's official page (other records hold defaults)
      const req = getOfficialRequirements(uni);

      return {
        'Serial No.': idx + 1,
        // Column 1
        'University': uni.name || uni.title || 'N/A',
        'Website URL': websiteUrl,
        'Study Level': degreesStr,
        'Entry Requirements': req.eligibilityText || req.minScoreText || (req.gpaPercent ? `${req.gpaPercent}%` : CHECK_SITE),
        'TOEFL Score': req.source && uni.minToeflScore ? `${uni.minToeflScore} iBT` : CHECK_SITE,
        'PTE No Band Less Than': 'Check official site',
        'GRE Score': getGreText(req) || CHECK_SITE,
        'Application Fee': uni.applicationFee || 'Check official site',
        'Scholarship Detail': 'Check official site',
        'ESL/ELP Detail': 'Check official site',
        'Program Name': primaryProgram,
        'Campus': uni.city ? `${uni.city}${uni.state ? ', ' + uni.state : ''}` : (uni.state || 'Main Campus'),

        // Column 2
        'Duration': uni.durationText || 'Varies by program',
        'IELTS Score': req.ielts ? `${req.ielts} Band` : (req.ieltsText || CHECK_SITE),
        'TOEFL No Band Less Than': 'Check official site',
        'SAT Score': 'Check official site',
        'GMAT Score': 'Check official site',
        'Yearly Tuition Fee': tuitionUSD,
        'Deposit': 'Check official site',
        'Backlog Range': 'Check official site',
        'Concentration': 'Check official site',
        'Country': countryStr,
        'Open Intakes': intakesStr,
        'Intake Year': '2026 - 2027',

        // Column 3
        'IELTS No Band Less Than': 'Check official site',
        'PTE Score': 'Check official site',
        'DET Score': 'Check official site',
        'ACT Score': 'Check official site',
        'Application Deadline': 'Check official site',
        'Scholarship Available': 'Check official site',
        'Average Scholarship': uni.avgScholarship || 'Check official site',
        'Remarks': uni.categoryTag ? `${uni.categoryTag.toUpperCase()} match based on profile` : '',
        'Application Mode': 'Apply through UniCoach or the official portal',
        'English Proficiency Exam Waiver': 'Check official site',
        'University Ranking': rankingStr
      };
    });

    // Filter columns if selectedColumnKeys provided (Serial No. always first)
    let finalRows = excelRows;
    if (Array.isArray(options.selectedColumnKeys) && options.selectedColumnKeys.length > 0) {
      finalRows = excelRows.map((row, idx) => {
        const filtered = { 'Serial No.': idx + 1 };
        options.selectedColumnKeys.forEach(colKey => {
          if (row[colKey] !== undefined) {
            filtered[colKey] = row[colKey];
          }
        });
        return filtered;
      });
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Universities List
    const wsUnis = XLSX.utils.json_to_sheet(finalRows);
    wsUnis['!cols'] = getColumnWidths(finalRows);
    applyUniCoachExcelStyles(wsUnis, finalRows);
    XLSX.utils.book_append_sheet(wb, wsUnis, sheetName.substring(0, 31));

    // Sheet 2: Student Profile Parameters (if available)
    if (studentProfile) {
      const profileRows = [
        { 'Profile Parameter': 'Target Field / Major', 'Value': studentProfile.streamMajor || 'N/A' },
        { 'Profile Parameter': 'Target Destination Country', 'Value': studentProfile.targetCountry || 'All Destinations' },
        { 'Profile Parameter': 'Target Degree Level', 'Value': studentProfile.targetDegree || "Master's" },
        { 'Profile Parameter': 'Current Academic Score', 'Value': studentProfile.gpaPercent ? `${studentProfile.gpaPercent}%` : 'N/A' },
        { 'Profile Parameter': 'English Test Score (IELTS)', 'Value': studentProfile.ieltsScore ? `${studentProfile.ieltsScore} Band` : 'N/A' },
        { 'Profile Parameter': 'GRE Exam Score', 'Value': studentProfile.greScore ? String(studentProfile.greScore) : 'Not Taken / Waived' },
        { 'Profile Parameter': 'Maximum Annual Budget', 'Value': studentProfile.maxBudgetUSD ? `$${Number(studentProfile.maxBudgetUSD).toLocaleString()} USD` : 'N/A' },
        { 'Profile Parameter': 'Preferred Intake Season', 'Value': studentProfile.intake || 'Fall 2026' },
        { 'Profile Parameter': 'Work Experience', 'Value': studentProfile.workExpYears ? `${studentProfile.workExpYears} Year(s)` : 'Fresher' },
        { 'Profile Parameter': 'Category Filter Exported', 'Value': categoryFilter },
        { 'Profile Parameter': 'Total Universities Exported', 'Value': String(universities.length) },
        { 'Profile Parameter': 'Generated By', 'Value': 'UniCoach CourseFinder AI Platform' },
        { 'Profile Parameter': 'Generated Date & Time', 'Value': new Date().toLocaleString() }
      ];

      const wsProfile = XLSX.utils.json_to_sheet(profileRows);
      wsProfile['!cols'] = [{ wch: 30 }, { wch: 45 }];
      applyUniCoachExcelStyles(wsProfile, profileRows);
      XLSX.utils.book_append_sheet(wb, wsProfile, 'Student Profile & Filters');
    }

    // Trigger download in browser
    XLSX.writeFile(wb, filename);
    return true;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    exportToCsvFallback(universities, options.filename || 'CourseFinder_Universities.csv');
    return false;
  }
}

/**
 * Export selected degree programs list to formatted Excel (.xlsx) file
 * 
 * @param {Array} programs - List of selected program objects with nested university details
 * @param {Object} options - Custom options (filename, sheetName, studentProfile, selectedColumnKeys)
 */
export function exportSelectedProgramsToExcel(programs = [], options = {}) {
  try {
    if (!programs || programs.length === 0) {
      alert('No programs selected to export.');
      return false;
    }

    const {
      filename = `CourseFinder_Programs_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName = 'Programs',
      studentProfile = null
    } = options;

    const excelRows = programs.map((prog, idx) => {
      const u = prog.university || {};
      const rankingStr = formatUniversityRankings(u);
      const websiteUrl = u.website || (u.name ? `https://www.google.com/search?q=${encodeURIComponent(u.name + ' official portal')}` : 'N/A');
      const countryStr = u.countryName || u.country || 'Global';
      const req = getOfficialRequirements(u);

      return {
        'Serial No.': idx + 1,
        // Column 1
        'University': u.name || prog.universityName || 'N/A',
        'Website URL': websiteUrl,
        'Study Level': prog.degreeLevel || prog.level || u.degreeLevels || "Postgraduate (Master's)",
        'Entry Requirements': prog.requirements || 'Check official site',
        'TOEFL Score': req.source && u.minToeflScore ? `${u.minToeflScore} iBT` : CHECK_SITE,
        'PTE No Band Less Than': prog.pteSubscore || 'Check official site',
        'GRE Score': getGreText(req) || CHECK_SITE,
        'Application Fee': prog.applicationFee || u.applicationFee || 'Check official site',
        'Scholarship Detail': prog.avgScholarship ? `Scholarship: ${prog.avgScholarship}` : 'Check official site',
        'ESL/ELP Detail': 'Check official site',
        'Program Name': prog.title || 'N/A',
        'Campus': u.city ? `${u.city}${u.state ? ', ' + u.state : ''}` : (u.state || 'Main Campus'),

        // Column 2
        'Duration': prog.durationText || (prog.durationMonths ? `${prog.durationMonths} Months` : 'Varies by program'),
        'IELTS Score': prog.minIeltsScore ? `${prog.minIeltsScore} Band` : 'Check official site',
        'TOEFL No Band Less Than': 'Check official site',
        'SAT Score': 'Check official site',
        'GMAT Score': prog.gmatScore || 'Check official site',
        'Yearly Tuition Fee': prog.tuitionPerYear || (u.tuitionFeeUSD ? `$${u.tuitionFeeUSD.toLocaleString()}/yr` : (u.tuition || 'N/A')),
        'Deposit': prog.initialDeposit || 'Check official site',
        'Backlog Range': 'Check official site',
        'Concentration': prog.concentration || 'Check official site',
        'Country': countryStr,
        'Open Intakes': prog.intake || (Array.isArray(u.intakes) ? u.intakes.join(', ') : 'Check official site'),
        'Intake Year': prog.intakeYear || '2026 - 2027',

        // Column 3
        'IELTS No Band Less Than': 'Check official site',
        'PTE Score': prog.minPteScore || 'Check official site',
        'DET Score': prog.minDetScore || 'Check official site',
        'ACT Score': 'Check official site',
        'Application Deadline': prog.deadline || 'Check official site',
        'Scholarship Available': 'Check official site',
        'Average Scholarship': prog.avgScholarship || u.avgScholarship || 'Check official site',
        'Remarks': prog.isStem ? 'STEM designated' : (prog.status ? `Status: ${prog.status}` : ''),
        'Application Mode': 'Apply through UniCoach or the official portal',
        'English Proficiency Exam Waiver': 'Check official site',
        'University Ranking': rankingStr
      };
    });

    // Filter columns if selectedColumnKeys provided (Serial No. always first)
    let finalRows = excelRows;
    if (Array.isArray(options.selectedColumnKeys) && options.selectedColumnKeys.length > 0) {
      finalRows = excelRows.map((row, idx) => {
        const filtered = { 'Serial No.': idx + 1 };
        options.selectedColumnKeys.forEach(colKey => {
          if (row[colKey] !== undefined) {
            filtered[colKey] = row[colKey];
          }
        });
        return filtered;
      });
    }

    const wb = XLSX.utils.book_new();

    const wsPrograms = XLSX.utils.json_to_sheet(finalRows);
    wsPrograms['!cols'] = getColumnWidths(finalRows);
    applyUniCoachExcelStyles(wsPrograms, finalRows);
    XLSX.utils.book_append_sheet(wb, wsPrograms, sheetName.substring(0, 31));

    if (studentProfile) {
      const profileRows = [
        { 'Profile Parameter': 'Target Field / Major', 'Value': studentProfile.streamMajor || 'N/A' },
        { 'Profile Parameter': 'Target Country', 'Value': studentProfile.targetCountry || 'All Destinations' },
        { 'Profile Parameter': 'Target Degree Level', 'Value': studentProfile.targetDegree || "Master's" },
        { 'Profile Parameter': 'Academic Score (%/GPA)', 'Value': studentProfile.gpaPercent ? `${studentProfile.gpaPercent}%` : 'N/A' },
        { 'Profile Parameter': 'IELTS Score', 'Value': studentProfile.ieltsScore ? `${studentProfile.ieltsScore} Band` : 'N/A' },
        { 'Profile Parameter': 'Annual Budget', 'Value': studentProfile.maxBudgetUSD ? `$${Number(studentProfile.maxBudgetUSD).toLocaleString()}` : 'N/A' },
        { 'Profile Parameter': 'Total Programs Selected', 'Value': String(programs.length) },
        { 'Profile Parameter': 'Generated By', 'Value': 'UniCoach CourseFinder Program Evaluator' },
        { 'Profile Parameter': 'Generated Date & Time', 'Value': new Date().toLocaleString() }
      ];

      const wsProfile = XLSX.utils.json_to_sheet(profileRows);
      wsProfile['!cols'] = [{ wch: 30 }, { wch: 45 }];
      applyUniCoachExcelStyles(wsProfile, profileRows);
      XLSX.utils.book_append_sheet(wb, wsProfile, 'Student Criteria');
    }

    XLSX.writeFile(wb, filename);
    return true;
  } catch (error) {
    console.error('Error generating Selected Programs Excel file:', error);
    exportToCsvFallback(programs, options.filename || 'CourseFinder_Programs.csv');
    return false;
  }
}

/**
 * Export scholarships list to formatted Excel (.xlsx) file
 * 
 * @param {Array} scholarships - List of scholarship objects
 * @param {Object} options - Custom options (filename, sheetName, studentProfile)
 */
export function exportScholarshipsToExcel(scholarships = [], options = {}) {
  try {
    if (!scholarships || scholarships.length === 0) {
      alert('No scholarships found to export.');
      return false;
    }

    const {
      filename = `CourseFinder_Scholarships_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName = 'Scholarships',
      studentProfile = null
    } = options;

    const excelRows = scholarships.map((item, idx) => {
      const s = item.scholarship || item;
      const stage = item.applicationStage || 'Shortlisted';

      let matchCategoryLabel = 'Target Match';
      if (item.categoryTag || s.categoryTag) {
        const cat = String(item.categoryTag || s.categoryTag).toLowerCase();
        if (cat === 'safe') matchCategoryLabel = 'High Match (Safe)';
        else if (cat === 'target') matchCategoryLabel = 'Target Match';
        else if (cat === 'dream') matchCategoryLabel = 'Competitive Reach';
      }

      let coverageStr = s.awardCoverage || 'Varies';
      if (s.amount && s.amount.value) {
        coverageStr = s.amount.isPercentage ? `${s.amount.value}% Tuition Waiver` : `$${Number(s.amount.value).toLocaleString()} ${s.amount.currency || 'USD'}`;
      }

      let deadlineStr = 'Rolling / Check Portal';
      if (s.deadline?.date) {
        deadlineStr = new Date(s.deadline.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      } else if (s.deadlineDate) {
        deadlineStr = String(s.deadlineDate);
      }

      const degreesStr = Array.isArray(s.eligibility?.degreeLevels) 
        ? s.eligibility.degreeLevels.join(', ') 
        : (s.eligibility?.degreeLevels || 'All Degrees');

      const coursesStr = Array.isArray(s.eligibility?.coursesApplicable) 
        ? s.eligibility.coursesApplicable.join('; ') 
        : 'All Academic Disciplines';

      const needBasedStr = s.eligibility?.financialCriteria?.isNeedBased 
        ? (s.eligibility.financialCriteria.familyIncomeLimitINR ? `Need-Based (< ₹${s.eligibility.financialCriteria.familyIncomeLimitINR / 100000} Lakh/yr)` : 'Need-Based Aid')
        : 'Merit-Based (All Incomes Eligible)';

      const portalUrl = s.applicationRequirements?.applicationPortalUrl 
        || s.applicationProcess?.applicationPortalUrl 
        || s.verifiedSource 
        || s.portalUrl 
        || 'N/A';

      return {
        'Serial No.': idx + 1,
        'Scholarship Title': s.title || 'N/A',
        'Awarding University / Organization': s.universityName || 'Global / Government Body',
        'Country': s.country || 'Global',
        'Funding Type': s.fundingType || 'Check official site',
        'Award Value / Coverage': coverageStr,
        'Application Deadline': deadlineStr,
        'Target Intake Cycle': `${s.deadline?.intakeSeason || 'Fall'} ${s.deadline?.intakeYear || '2026'}`,
        'Match Fit Probability': item.matchScore || s.matchScore ? `${item.matchScore || s.matchScore}%` : 'N/A',
        'Match Category': matchCategoryLabel,
        'Min GPA Required': s.eligibility?.minGpa ? `${s.eligibility.minGpa}%` : 'Open / Holistic',
        'Min IELTS Band': s.eligibility?.minIelts ? `${s.eligibility.minIelts} Band` : 'Open / Waiver Allowed',
        'Eligible Degree Levels': degreesStr,
        'Applicable Courses / Majors': coursesStr,
        'Financial Need Criteria': needBasedStr,
        'Application Stage': stage,
        'Official Portal Link': portalUrl,
        'UniCoach Verified': 'Yes'
      };
    });

    const wb = XLSX.utils.book_new();

    const wsScholarships = XLSX.utils.json_to_sheet(excelRows);
    wsScholarships['!cols'] = getColumnWidths(excelRows);
    applyUniCoachExcelStyles(wsScholarships, excelRows);
    XLSX.utils.book_append_sheet(wb, wsScholarships, sheetName.substring(0, 31));

    if (studentProfile) {
      const profileRows = [
        { 'Profile Parameter': 'Target Field / Major', 'Value': studentProfile.streamMajor || 'N/A' },
        { 'Profile Parameter': 'Target Destination Country', 'Value': studentProfile.targetCountry || 'All Destinations' },
        { 'Profile Parameter': 'Target Degree Level', 'Value': studentProfile.targetDegree || 'Masters' },
        { 'Profile Parameter': 'Academic Score (%/GPA)', 'Value': studentProfile.gpaPercent ? `${studentProfile.gpaPercent}%` : 'N/A' },
        { 'Profile Parameter': 'IELTS Score', 'Value': studentProfile.ieltsScore ? `${studentProfile.ieltsScore} Band` : 'N/A' },
        { 'Profile Parameter': 'Annual Family Income', 'Value': studentProfile.familyIncome ? `₹${Number(studentProfile.familyIncome).toLocaleString()}` : 'N/A' },
        { 'Profile Parameter': 'Target Intake', 'Value': studentProfile.intake || 'Fall 2026' },
        { 'Profile Parameter': 'Total Scholarships Exported', 'Value': String(scholarships.length) },
        { 'Profile Parameter': 'Generated By', 'Value': 'UniCoach Scholarships & Live Deadline Tracker' },
        { 'Profile Parameter': 'Generated Date & Time', 'Value': new Date().toLocaleString() }
      ];

      const wsProfile = XLSX.utils.json_to_sheet(profileRows);
      wsProfile['!cols'] = [{ wch: 30 }, { wch: 45 }];
      applyUniCoachExcelStyles(wsProfile, profileRows);
      XLSX.utils.book_append_sheet(wb, wsProfile, 'Student Criteria');
    }

    XLSX.writeFile(wb, filename);
    return true;
  } catch (error) {
    console.error('Error generating Scholarships Excel file:', error);
    exportToCsvFallback(scholarships, options.filename || 'CourseFinder_Scholarships.csv');
    return false;
  }
}

/**
 * Universal CSV fallback using UTF-8 BOM encoding for seamless Excel compatibility
 */
function exportToCsvFallback(items, filename) {
  try {
    if (!items || items.length === 0) return;
    const flatRows = items.map((item, i) => {
      const u = item.scholarship || item.university || item;
      return {
        'Serial No.': i + 1,
        'Name': u.name || u.title || 'N/A',
        'Country': u.countryName || u.country || 'N/A',
        'Rank/Value': getVerifiedRanking(u)?.fullLabel || u.awardCoverage || 'N/A',
        'Tuition/Amount': u.tuitionFeeUSD ? `$${u.tuitionFeeUSD}` : (u.tuition || 'N/A'),
        // Scholarships keep their own eligibility value; universities only an official IELTS minimum
        'Min IELTS': u.eligibility?.minIelts || getOfficialRequirements(u).ielts || 'N/A',
        'Website/Portal': u.website || u.verifiedSource || 'N/A'
      };
    });

    const headers = Object.keys(flatRows[0]);
    const csvContent = [
      headers.join(','),
      ...flatRows.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('CSV fallback failed:', err);
  }
}
