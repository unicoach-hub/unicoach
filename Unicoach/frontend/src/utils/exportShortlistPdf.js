import { generateUniversityPrograms } from './courseFinderHelper';

const MAX_ROWS = 2000;

// Builds a branded A4-landscape PDF of the course list. jspdf is loaded on demand
// so it stays out of the main bundle.
export async function exportShortlistPdf(universities, { title = 'Course list', country, searchQuery = '', programLevel = 'all' } = {}) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const applyPlugin = autoTableModule.applyPlugin || autoTableModule.default?.applyPlugin;
  applyPlugin(jsPDF);

  const rows = [];
  for (const uni of universities || []) {
    const programs = generateUniversityPrograms(uni, { searchQuery, programLevel }) || [];
    const location = [uni.city, uni.countryName || uni.country].filter(Boolean).join(', ');
    const rank = uni.qsRank || uni.ranking || uni.worldRank || '';
    if (!programs.length) {
      rows.push([uni.name, '—', '', location, rank, '', '', 'See official site']);
    }
    for (const p of programs) {
      rows.push([
        uni.name,
        p.title || '—',
        p.degreeLevel || '',
        location,
        rank,
        p.intake || '',
        p.durationText || '',
        p.tuitionPerYear || 'See official site',
      ]);
      if (rows.length >= MAX_ROWS) break;
    }
    if (rows.length >= MAX_ROWS) break;
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  doc.setFillColor(222, 92, 43);
  doc.rect(0, 0, pageW, 54, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('UniCoach', 32, 34);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${title}${country && country !== 'All' ? ` · ${country}` : ''}`, 130, 34);
  doc.text(date, pageW - 32, 34, { align: 'right' });

  doc.setTextColor(90, 90, 90);
  doc.setFontSize(9);
  doc.text(
    `${universities.length} universities · ${rows.length} rows${rows.length >= MAX_ROWS ? ' (first 2,000 shown)' : ''}. Fees are per year in local currency; always confirm on the official university page.`,
    32, 72
  );

  doc.autoTable({
    startY: 82,
    head: [['University', 'Program', 'Level', 'Location', 'Rank', 'Intake', 'Duration', 'Tuition / year']],
    body: rows,
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, overflow: 'linebreak', textColor: [40, 40, 40] },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 246, 242] },
    columnStyles: {
      0: { cellWidth: 150, fontStyle: 'bold' },
      1: { cellWidth: 190 },
      2: { cellWidth: 40 },
      3: { cellWidth: 95 },
      4: { cellWidth: 40 },
      5: { cellWidth: 85 },
      6: { cellWidth: 60 },
    },
    margin: { left: 32, right: 32 },
    didDrawPage: () => {
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`www.unicoach.com · Page ${doc.internal.getNumberOfPages()}`, pageW - 32, h - 16, { align: 'right' });
    },
  });

  const safeCountry = String(country || 'All').replace(/[^a-z0-9]+/gi, '_');
  doc.save(`UniCoach_${safeCountry}_Courses_${new Date().toISOString().slice(0, 10)}.pdf`);
  return rows.length;
}
