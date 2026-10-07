import * as XLSX from 'xlsx';

function getColumnWidths(dataRows) {
  if (!dataRows || dataRows.length === 0) return [];
  const colKeys = Object.keys(dataRows[0]);
  return colKeys.map(key => {
    let maxLen = key.length;
    dataRows.forEach(row => {
      const val = row[key];
      if (val !== null && val !== undefined) {
        const strVal = String(val);
        if (strVal.length > maxLen) {
          maxLen = Math.min(strVal.length, 50);
        }
      }
    });
    return { wch: Math.max(maxLen + 3, 12) };
  });
}

export function exportUniversitiesToExcel(universities = [], filename = `UniCoach_Universities_Master_${new Date().toISOString().slice(0, 10)}.xlsx`) {
  try {
    if (!universities || universities.length === 0) {
      alert('No universities to export.');
      return false;
    }

    const excelRows = universities.map((uni, idx) => ({
      'S.No': idx + 1,
      'University Name': uni.name || uni.title || 'N/A',
      'Country': uni.countryName || uni.country || 'N/A',
      'City': uni.city || 'N/A',
      // Only ranks imported from an official ranking file
      'World Ranking': uni.rankingSource && uni.rankingNum ? `#${String(uni.rank || uni.rankingNum).replace(/^=/, '')} (${uni.rankingSource})` : 'N/A',
      'Tuition Fee (USD)': uni.tuitionFeeUSD ? `$${uni.tuitionFeeUSD.toLocaleString()}` : (uni.tuition || 'N/A'),
      'Acceptance Rate': uni.acceptanceRate ? `${uni.acceptanceRate}%` : 'N/A',
      'Min GPA (%)': uni.minGpaPercent ? `${uni.minGpaPercent}%` : 'N/A',
      'Min IELTS': uni.minIeltsScore ? `${uni.minIeltsScore} Band` : 'N/A',
      'Min GRE': uni.minGreScore ? `${uni.minGreScore}` : (uni.greRequired ? 'Required' : 'Waived'),
      'Popular Programs': Array.isArray(uni.courses) ? uni.courses.join(', ') : (uni.courses || 'N/A'),
      'Degree Levels': Array.isArray(uni.degreeLevels) ? uni.degreeLevels.join(', ') : (uni.degreeLevels || 'N/A'),
      'Intakes': Array.isArray(uni.intakes) ? uni.intakes.join(', ') : 'Fall, Spring',
      'Website': uni.website || 'N/A'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelRows);
    ws['!cols'] = getColumnWidths(excelRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Universities');
    XLSX.writeFile(wb, filename);
    return true;
  } catch (err) {
    console.error('Failed to export universities to Excel:', err);
    return false;
  }
}

export function exportScholarshipsToExcel(scholarships = [], filename = `UniCoach_Scholarships_Master_${new Date().toISOString().slice(0, 10)}.xlsx`) {
  try {
    if (!scholarships || scholarships.length === 0) {
      alert('No scholarships to export.');
      return false;
    }

    const excelRows = scholarships.map((s, idx) => ({
      'S.No': idx + 1,
      'Title': s.title || 'N/A',
      'University / Organization': s.universityName || 'Global',
      'Country': s.country || 'Global',
      'Funding Type': s.fundingType || 'N/A',
      'Amount / Coverage': s.awardCoverage || (s.amount?.value ? `${s.amount.value} ${s.amount.currency || 'USD'}` : 'Varies'),
      'Deadline': s.deadline?.date ? new Date(s.deadline.date).toLocaleDateString() : (s.deadlineDate || 'Rolling'),
      'Min GPA': s.eligibility?.minGpa || 'N/A',
      'Min IELTS': s.eligibility?.minIelts || 'N/A',
      'Degrees': Array.isArray(s.eligibility?.degreeLevels) ? s.eligibility.degreeLevels.join(', ') : 'All',
      'Portal Link': s.applicationRequirements?.applicationPortalUrl || s.verifiedSource || 'N/A'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelRows);
    ws['!cols'] = getColumnWidths(excelRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Scholarships');
    XLSX.writeFile(wb, filename);
    return true;
  } catch (err) {
    console.error('Failed to export scholarships to Excel:', err);
    return false;
  }
}
