import { useState } from 'react';
import CourseFinderComparisonBar from './CourseFinderComparisonBar';
import ExcelColumnExportModal from './ExcelColumnExportModal';
import { exportSelectedProgramsToExcel, DEFAULT_PROGRAM_COLUMNS } from '../utils/excelExporter';

/**
 * Floating "N programs selected" bar for CourseFinder cards: compare side by side and
 * download the ticked programs as Excel (columns chosen in the export modal).
 * The Shortlist buttons only appear when the page can save to a shortlist.
 */
const ProgramSelectionTools = ({ selectedPrograms, onClearSelection, onSaveSelectedToShortlist }) => {
  const [exportOpen, setExportOpen] = useState(false);

  const handleConfirmExport = (selectedKeys) => {
    exportSelectedProgramsToExcel(selectedPrograms, {
      filename: `UniCoach_Selected_Programs_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: 'Selected Programs',
      selectedColumnKeys: selectedKeys,
    });
    setExportOpen(false);
  };

  return (
    <>
      <CourseFinderComparisonBar
        selectedPrograms={selectedPrograms}
        onClearSelection={onClearSelection}
        onSaveSelectedToShortlist={onSaveSelectedToShortlist}
        onExportExcel={() => setExportOpen(true)}
      />
      <ExcelColumnExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onConfirmExport={handleConfirmExport}
        exportType="programs"
        itemsCount={selectedPrograms.length}
        availableColumns={DEFAULT_PROGRAM_COLUMNS}
      />
    </>
  );
};

export default ProgramSelectionTools;
