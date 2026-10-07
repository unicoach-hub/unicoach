import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { STANDARD_DOWNLOAD_FIELDS } from '../utils/excelExporter';

/**
 * Clean & Simple "Select Fields To Download" Checklist Modal
 * Exact visual match to the standard study-abroad export checklist.
 */
const ExcelColumnExportModal = ({
  isOpen = false,
  onClose,
  onConfirmExport,
  exportType = 'universities',
  itemsCount = 0,
  availableColumns = []
}) => {
  // Use passed availableColumns if they match, or fallback to the 35 standard checklist fields
  const fields = useMemo(() => {
    if (Array.isArray(availableColumns) && availableColumns.length > 0) {
      // If caller provided fields, check if they map to standard or custom
      return availableColumns;
    }
    return STANDARD_DOWNLOAD_FIELDS;
  }, [availableColumns]);

  const allFieldIds = useMemo(() => fields.map(f => f.id), [fields]);

  const [selectedKeys, setSelectedKeys] = useState(() => {
    return fields.filter(f => f.defaultChecked !== false).map(f => f.id);
  });

  // Re-sync when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = fields.filter(f => f.defaultChecked !== false).map(f => f.id);
      setSelectedKeys(initial.length > 0 ? initial : allFieldIds);
    }
  }, [isOpen, fields, allFieldIds]);

  // Handle escape key & scroll locking
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Split into 3 columns (matching user reference screenshot)
  const total = fields.length;
  const colSize = Math.ceil(total / 3);
  const col1 = fields.slice(0, colSize);
  const col2 = fields.slice(colSize, colSize * 2);
  const col3 = fields.slice(colSize * 2);

  const handleToggle = (id) => {
    setSelectedKeys(prev => 
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedKeys(allFieldIds);
  };

  const handleRemoveAll = () => {
    setSelectedKeys([]);
  };

  const handleDownload = () => {
    if (selectedKeys.length === 0) return;
    onConfirmExport(selectedKeys);
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto w-screen h-screen min-h-[100dvh]">
        {/* Semi-transparent backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 w-screen h-screen min-h-[100dvh] bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] my-auto"
        >
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Select Fields To Download
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body: Clean 3-Column Checklist Grid */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
              {/* Column 1 */}
              <div className="flex flex-col gap-3.5">
                {col1.map(field => {
                  const isChecked = selectedKeys.includes(field.id);
                  return (
                    <label 
                      key={field.id}
                      className="flex items-center gap-3 cursor-pointer select-none group text-left"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(field.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400 cursor-pointer accent-[#5B9BD5]"
                      />
                      <span className={`text-[13px] leading-tight transition-colors ${
                        isChecked ? 'text-slate-800 font-medium' : 'text-slate-600 group-hover:text-slate-900'
                      }`}>
                        {field.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-3.5">
                {col2.map(field => {
                  const isChecked = selectedKeys.includes(field.id);
                  return (
                    <label 
                      key={field.id}
                      className="flex items-center gap-3 cursor-pointer select-none group text-left"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(field.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400 cursor-pointer accent-[#5B9BD5]"
                      />
                      <span className={`text-[13px] leading-tight transition-colors ${
                        isChecked ? 'text-slate-800 font-medium' : 'text-slate-600 group-hover:text-slate-900'
                      }`}>
                        {field.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-3.5">
                {col3.map(field => {
                  const isChecked = selectedKeys.includes(field.id);
                  return (
                    <label 
                      key={field.id}
                      className="flex items-center gap-3 cursor-pointer select-none group text-left"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(field.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400 cursor-pointer accent-[#5B9BD5]"
                      />
                      <span className={`text-[13px] leading-tight transition-colors ${
                        isChecked ? 'text-slate-800 font-medium' : 'text-slate-600 group-hover:text-slate-900'
                      }`}>
                        {field.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            {/* Left: Remove All Button */}
            <button
              type="button"
              onClick={handleRemoveAll}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[#DE5C2B] text-[#DE5C2B] hover:bg-orange-50/80 text-sm font-semibold transition cursor-pointer text-center"
            >
              Remove All
            </button>

            {/* Right: Select All & Download Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-[#DE5C2B] text-[#DE5C2B] hover:bg-orange-50/80 text-sm font-semibold transition cursor-pointer text-center"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={selectedKeys.length === 0}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
                  selectedKeys.length === 0
                    ? 'bg-slate-300 cursor-not-allowed opacity-70'
                    : 'bg-[#5B9BD5] hover:bg-[#4A8AC4] active:scale-[0.98]'
                }`}
              >
                <span>Download as Excel</span>
                <Download size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ExcelColumnExportModal;
