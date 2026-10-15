import { getVerifiedRanking } from './ranking';

// CF-blue used across the search portal (matches excelExporter brand + SearchProgramsPage BLUE)
const BRAND_RGB = [34, 108, 245];
const ZEBRA_RGB = [244, 247, 252];

function rankingText(u) {
  if (!u) return 'N/A';
  const r = getVerifiedRanking(u);
  return r ? `${r.source} ${r.label}` : 'N/A';
}

/**
 * Export a list of programs to a branded landscape PDF table.
 * Mirrors the key columns from the Excel export in a reader-friendly format.
 * jspdf is loaded on demand so it stays out of the main bundle.
 *
 * @param {Array}  programs  list of program objects (same shape as the Excel exporter)
 * @param {Object} options   { filename, title }
 */
export async function exportSelectedProgramsToPdf(programs = [], options = {}) {
  try {
    if (!programs || programs.length === 0) {
      alert('No programs to export.');
      return false;
    }

    const {
      filename = `UniCoach_Programs_${new Date().toISOString().slice(0, 10)}.pdf`,
      title = 'Program Shortlist',
    } = options;

    const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const applyPlugin = autoTableModule.applyPlugin || autoTableModule.default?.applyPlugin;
    applyPlugin(jsPDF);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // --- Branded header band ---
    doc.setFillColor(...BRAND_RGB);
    doc.rect(0, 0, pageW, 54, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('UniCoach', 40, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(title, 142, 35);
    doc.setFontSize(8);
    doc.text(
      `${programs.length} program${programs.length !== 1 ? 's' : ''}  ·  ${new Date().toLocaleString()}`,
      pageW - 40, 35, { align: 'right' }
    );

    const head = [[
      '#', 'University', 'Program', 'Country', 'Level', 'Duration',
      'Tuition / yr', 'IELTS', 'App Fee', 'Ranking',
    ]];

    const body = programs.map((prog, idx) => {
      const u = prog.university || {};
      return [
        idx + 1,
        u.name || prog.universityName || 'N/A',
        prog.title || 'N/A',
        u.countryName || u.country || 'Global',
        prog.degreeLevel || prog.level || "Master's",
        prog.durationText || (prog.durationMonths ? `${prog.durationMonths} mo` : 'Varies'),
        prog.tuitionPerYear || (u.tuitionFeeUSD ? `$${u.tuitionFeeUSD.toLocaleString()}/yr` : (u.tuition || 'N/A')),
        prog.minIeltsScore ? `${prog.minIeltsScore}` : '—',
        prog.applicationFee || u.applicationFee || '—',
        rankingText(u),
      ];
    });

    doc.autoTable({
      head,
      body,
      startY: 68,
      margin: { left: 40, right: 40 },
      styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 4, overflow: 'linebreak', valign: 'middle', textColor: [40, 51, 69] },
      headStyles: { fillColor: BRAND_RGB, textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: ZEBRA_RGB },
      columnStyles: {
        0: { cellWidth: 24, halign: 'center' },
        1: { cellWidth: 130, fontStyle: 'bold', textColor: BRAND_RGB },
        2: { cellWidth: 150 },
        3: { cellWidth: 70 },
        7: { halign: 'center' },
        8: { halign: 'center' },
      },
      didDrawPage: (data) => {
        const total = doc.internal.getNumberOfPages();
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `www.unicoach.com  ·  Page ${data.pageNumber} of ${total}`,
          pageW - 40, pageH - 16, { align: 'right' }
        );
      },
    });

    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating Programs PDF file:', error);
    alert('PDF export failed. Please try again.');
    return false;
  }
}
