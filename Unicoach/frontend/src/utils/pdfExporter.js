import { STANDARD_DOWNLOAD_FIELDS, programToExportRow } from './excelExporter';

// Calm UniCoach palette (matches the site theme): ink header, brand orange accents, paper cards.
const INK = [22, 19, 15];
const MUTED = [91, 84, 74];
const ORANGE = [222, 92, 43];
const PAPER = [248, 245, 239];
const LINE = [230, 224, 212];
const ZEBRA = [251, 249, 245];

// Program sheets are added for up to this many programs; bigger exports get the overview only.
const MAX_SHEETS = 50;

// Fields shown in the card header, so they are not repeated in the grid.
const HEADER_KEYS = ['Program Name', 'University', 'Campus', 'Country', 'Website URL'];

// Placeholder values from the row mapper that carry no information in a PDF.
const EMPTY_RE = /^(check official site|n\/a|na|varies by program|main campus|—|-|)$/i;
const isEmpty = (v) => v === undefined || v === null || EMPTY_RE.test(String(v).trim());

// Built-in PDF fonts only cover Latin-1 (+ a few extras); swap the characters they can't draw.
// Line breaks are kept (e.g. one ranking body per line).
const cleanLine = (t) => t
  .replace(/₹/g, 'INR ')
  .replace(/[‘’]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/→/g, '->')
  .replace(/\s+/g, ' ')
  .replace(/[^ -~\xA0-\xFF€–—•]/g, '')
  .trim();
const clean = (v) => String(v ?? '').split(/\r?\n/).map(cleanLine).filter(Boolean).join('\n');

const isRealUrl = (u) => /^https?:\/\//i.test(u || '') && !/google\.com\/search/i.test(u);

/**
 * Export programs to a readable A4 PDF: a short overview table, then one sheet per program
 * with the fields chosen in the column checklist (empty placeholders are left out).
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

    // Chosen columns in the standard order; default to the checklist defaults.
    const picked = Array.isArray(selectedColumnKeys) && selectedColumnKeys.length > 0
      ? STANDARD_DOWNLOAD_FIELDS.filter((f) => selectedColumnKeys.includes(f.id)).map((f) => f.id)
      : STANDARD_DOWNLOAD_FIELDS.filter((f) => f.defaultChecked).map((f) => f.id);
    const labelFor = (id) => (STANDARD_DOWNLOAD_FIELDS.find((f) => f.id === id)?.label) || id;
    const gridKeys = picked.filter((k) => !HEADER_KEYS.includes(k));

    const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const applyPlugin = autoTableModule.applyPlugin || autoTableModule.default?.applyPlugin;
    applyPlugin(jsPDF);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 40;                 // page margin
    const CW = W - M * 2;         // content width
    const BOTTOM = H - 44;        // keep clear of the footer

    const rows = programs.map((p, i) => programToExportRow(p, i));
    const stamp = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    // ── Header band (first page) ──
    doc.setFillColor(...INK);
    doc.rect(0, 0, W, 78, 'F');
    doc.setFillColor(...ORANGE);
    doc.rect(0, 78, W, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('UniCoach', M, 38);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(230, 224, 212);
    doc.text(clean(title), M, 58);
    doc.setFontSize(9);
    doc.text(`${programs.length} program${programs.length !== 1 ? 's' : ''}  ·  ${stamp}`, W - M, 38, { align: 'right' });
    doc.text('Course Finder', W - M, 58, { align: 'right' });

    // ── Overview table: always readable, six fixed columns ──
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Overview', M, 108);

    const val = (r, k) => (isEmpty(r[k]) ? '—' : clean(r[k]));
    doc.autoTable({
      startY: 118,
      margin: { left: M, right: M, bottom: 44 },
      head: [['#', 'Program', 'University', 'Country', 'Level', 'Duration', 'Tuition / year']],
      body: rows.map((r, i) => [i + 1, val(r, 'Program Name'), val(r, 'University'), val(r, 'Country'), val(r, 'Study Level'), val(r, 'Duration'), val(r, 'Yearly Tuition Fee')]),
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 5, textColor: INK, lineColor: LINE, lineWidth: 0.5, valign: 'top', overflow: 'linebreak' },
      headStyles: { fillColor: PAPER, textColor: MUTED, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: ZEBRA },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center', textColor: MUTED },
        1: { cellWidth: 130, fontStyle: 'bold' },
        2: { cellWidth: 112 },
        3: { cellWidth: 62 },
        4: { cellWidth: 70 },
        5: { cellWidth: 56 },
        6: { cellWidth: CW - 20 - 130 - 112 - 62 - 70 - 56 },
      },
    });

    // ── Program sheets ──
    const sheets = rows.slice(0, MAX_SHEETS);
    let y = doc.lastAutoTable.finalY + 26;

    if (rows.length > MAX_SHEETS) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text(`Detailed sheets are included for up to ${MAX_SHEETS} programs. Download the Excel file for every column of all ${rows.length}.`, M, y, { maxWidth: CW });
    } else {
      const newPage = () => { doc.addPage(); y = M; };
      if (y > BOTTOM - 120) newPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...INK);
      doc.text('Program details', M, y);
      y += 14;

      const COLS = 3;
      const PAD = 14;
      const colW = (CW - PAD * 2 - 12 * (COLS - 1)) / COLS;

      sheets.forEach((r, i) => {
        // Fields with real values, laid out three to a row (measured in the value font)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const fields = gridKeys.filter((k) => !isEmpty(r[k])).map((k) => ({
          label: labelFor(k).toUpperCase(),
          lines: doc.splitTextToSize(clean(r[k]), colW),
        }));
        const missing = gridKeys.filter((k) => isEmpty(r[k])).map(labelFor);
        const gridRows = [];
        for (let k = 0; k < fields.length; k += COLS) gridRows.push(fields.slice(k, k + COLS));
        const rowH = (cells) => 11 + Math.max(...cells.map((c) => c.lines.length)) * 10.5 + 8;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        const titleLines = doc.splitTextToSize(clean(r['Program Name']), CW - PAD * 2 - 30);
        const sub = [r['University'], !isEmpty(r['Campus']) && r['Campus'], r['Country']].filter((x) => x && !isEmpty(x)).map(clean).join('  ·  ');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const subLines = doc.splitTextToSize(sub, CW - PAD * 2 - 30);
        const missingLines = missing.length ? doc.splitTextToSize(`Check on the university site: ${missing.join(', ')}.`, CW - PAD * 2) : [];

        const headH = PAD + titleLines.length * 14 + subLines.length * 11 + 16;
        const gridH = gridRows.reduce((s, cells) => s + rowH(cells), 0);
        const cardH = headH + gridH + (missingLines.length ? missingLines.length * 9.5 + 8 : 0) + PAD - 4;

        if (y + cardH > BOTTOM) newPage();
        const top = y;

        // card
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.8);
        doc.roundedRect(M, top, CW, cardH, 6, 6, 'FD');
        doc.setFillColor(...ORANGE);
        doc.rect(M, top + 6, 3, cardH - 12, 'F');

        // number badge
        doc.setFillColor(...PAPER);
        doc.circle(W - M - PAD - 8, top + PAD + 6, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(String(i + 1), W - M - PAD - 8, top + PAD + 9, { align: 'center' });

        // title + university line
        let cy = top + PAD + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(...INK);
        doc.text(titleLines, M + PAD, cy);
        cy += titleLines.length * 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text(subLines, M + PAD, cy);
        cy += subLines.length * 11;

        // website link
        const url = r['Website URL'];
        if (picked.includes('Website URL') && url && !isEmpty(url)) {
          doc.setTextColor(...ORANGE);
          doc.textWithLink(isRealUrl(url) ? 'Official website' : 'Find official website', M + PAD, cy + 2, { url });
        }
        cy += 14;

        // divider
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.5);
        doc.line(M + PAD, cy - 4, W - M - PAD, cy - 4);

        // field grid
        gridRows.forEach((cells) => {
          cells.forEach((c, ci) => {
            const x = M + PAD + ci * (colW + 12);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(...MUTED);
            doc.text(c.label, x, cy + 6);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(...INK);
            doc.text(c.lines, x, cy + 17);
          });
          cy += rowH(cells);
        });

        if (missingLines.length) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7.5);
          doc.setTextColor(...MUTED);
          doc.text(missingLines, M + PAD, cy + 4);
        }

        y = top + cardH + 12;
      });
    }

    // ── Footer on every page ──
    const total = doc.internal.getNumberOfPages();
    for (let p = 1; p <= total; p += 1) {
      doc.setPage(p);
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.5);
      doc.line(M, H - 30, W - M, H - 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text('UniCoach Course Finder  ·  Details change often, confirm on the university website before applying.', M, H - 18);
      doc.text(`Page ${p} of ${total}`, W - M, H - 18, { align: 'right' });
    }

    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating Programs PDF file:', error);
    alert('PDF export failed. Please try again.');
    return false;
  }
}
