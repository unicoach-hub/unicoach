import { STANDARD_DOWNLOAD_FIELDS, programToExportRow } from './excelExporter';

// CF-blue used across the search portal (matches excelExporter brand + SearchProgramsPage BLUE)
const BRAND_RGB = [34, 108, 245];
const ZEBRA_RGB = [244, 247, 252];

// Curated default columns when the user hasn't picked a custom set (keeps the PDF readable).
const DEFAULT_PDF_KEYS = [
  'University', 'Program Name', 'Country', 'Study Level', 'Duration',
  'Yearly Tuition Fee', 'IELTS Score', 'Application Fee', 'University Ranking',
];

// Columns that need extra width when present (everything else auto-sizes).
const WIDE_KEYS = {
  'University': 120,
  'Program Name': 140,
  'Website URL': 120,
  'University Ranking': 110,
  'Entry Requirements': 120,
  'Scholarship Detail': 120,
};

/**
 * Export a list of programs to a branded landscape PDF table.
 * Honours the same column checklist as the Excel export via `options.selectedColumnKeys`.
 * jspdf is loaded on demand so it stays out of the main bundle.
 *
 * @param {Array}  programs  list of program objects (same shape as the Excel exporter)
 * @param {Object} options   { filename, title, selectedColumnKeys }
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
      selectedColumnKeys = null,
    } = options;

    // Resolve the ordered list of column keys (follow STANDARD field order for stable layout).
    const picked = Array.isArray(selectedColumnKeys) && selectedColumnKeys.length > 0
      ? STANDARD_DOWNLOAD_FIELDS.filter((f) => selectedColumnKeys.includes(f.id)).map((f) => f.id)
      : DEFAULT_PDF_KEYS;
    const labelFor = (id) => (STANDARD_DOWNLOAD_FIELDS.find((f) => f.id === id)?.label) || id;

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

    const head = [['#', ...picked.map(labelFor)]];
    const body = programs.map((prog, idx) => {
      const row = programToExportRow(prog, idx);
      return [idx + 1, ...picked.map((id) => {
        const v = row[id];
        return v === undefined || v === null || v === '' ? '—' : String(v);
      })];
    });

    // Per-column styling: serial col fixed, wide keys get more room, the rest auto-size.
    const columnStyles = { 0: { cellWidth: 22, halign: 'center' } };
    picked.forEach((id, i) => {
      const col = i + 1;
      if (WIDE_KEYS[id]) columnStyles[col] = { cellWidth: WIDE_KEYS[id] };
      if (id === 'University' || id === 'Program Name') columnStyles[col] = { ...columnStyles[col], fontStyle: 'bold', textColor: BRAND_RGB };
    });

    // Shrink the font as the column count grows so wide checklists still fit the page.
    const fontSize = picked.length <= 10 ? 7.5 : picked.length <= 16 ? 6.3 : 5.4;

    doc.autoTable({
      head,
      body,
      startY: 68,
      margin: { left: 40, right: 40 },
      tableWidth: 'auto',
      styles: { font: 'helvetica', fontSize, cellPadding: 3, overflow: 'linebreak', valign: 'middle', textColor: [40, 51, 69] },
      headStyles: { fillColor: BRAND_RGB, textColor: 255, fontStyle: 'bold', fontSize: Math.max(fontSize, 6) },
      alternateRowStyles: { fillColor: ZEBRA_RGB },
      columnStyles,
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
