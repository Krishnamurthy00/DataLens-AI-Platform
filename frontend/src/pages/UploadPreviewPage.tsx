import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { api } from '../services/api';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';

export const UploadPreviewPage: React.FC = () => {
  const { dataset, uploadCsv, loadDemo, isLoading, selectedColumns, setSelectedColumns, setActiveTab } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [tableData, setTableData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch paginated table data
  useEffect(() => {
    if (!dataset?.session_id) return;
    const fetchTable = async () => {
      setIsTableLoading(true);
      try {
        const res = await api.getTable(dataset.session_id, page, 12, searchTerm);
        setTableData(res.data);
        setTotalPages(res.total_pages);
      } catch (err) {
        console.error('Table fetch error:', err);
      } finally {
        setIsTableLoading(false);
      }
    };
    fetchTable();
  }, [dataset?.session_id, page, searchTerm]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid .csv file.');
      return;
    }
    await uploadCsv(file);
  };

  const toggleColumn = (colName: string) => {
    setSelectedColumns(prev =>
      prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
    );
  };

  const toggleAllColumns = () => {
    if (!dataset) return;
    if (selectedColumns.length === dataset.columns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(dataset.columns.map(c => c.name));
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Drop Zone Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
            accept=".csv"
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Click to browse or drag & drop CSV
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports standard comma-separated files up to 25MB. UTF-8 or Latin-1 encoded.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-4 text-xs">
              <span className="text-slate-400">First time here?</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadDemo();
                }}
                disabled={isLoading}
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Synthetic Student Performance Dataset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Preview & Schema Studio */}
      {dataset && (
        <div className="space-y-6">
          {/* Metadata Highlights Bar */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-sky-500" />
                <span className="font-semibold text-slate-900 dark:text-white">{dataset.filename}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-600 dark:text-slate-300">
                <strong>{dataset.total_rows.toLocaleString()}</strong> rows
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-600 dark:text-slate-300">
                <strong>{dataset.total_columns}</strong> columns
              </span>
              {dataset.file_size_bytes && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {(dataset.file_size_bytes / 1024).toFixed(1)} KB
                  </span>
                </>
              )}
            </div>

            <button
              onClick={() => setActiveTab('cleaning')}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Proceed to Cleaning Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Column Feature Selector Pill Cloud */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Feature Matrix Selection</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which attributes to include in visualizations, reports, and AI analyses ({selectedColumns.length}/{dataset.columns.length} active)
                </p>
              </div>

              <button
                onClick={toggleAllColumns}
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                {selectedColumns.length === dataset.columns.length ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Select All</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {dataset.columns.map((col, idx) => {
                const isSelected = selectedColumns.includes(col.name);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleColumn(col.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 border transition-all ${
                      isSelected
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800 shadow-sm'
                        : 'bg-slate-50 text-slate-400 dark:bg-slate-800/40 dark:text-slate-500 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <span>{col.name}</span>
                    <span className="text-[10px] px-1 rounded bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700">
                      {col.inferred_type}
                    </span>
                    {col.missing_count > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title={`${col.missing_count} missing cells`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Searchable, Scrollable Paginated Table */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search dataset rows..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="min-w-full text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950/70 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 text-left font-medium text-slate-400">#</th>
                    {dataset.columns
                      .filter(c => selectedColumns.includes(c.name))
                      .map((c, idx) => (
                        <th key={idx} className="py-2.5 px-3 text-left font-semibold text-slate-700 dark:text-slate-200 font-mono">
                          {c.name}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {isTableLoading ? (
                    <tr>
                      <td colSpan={selectedColumns.length + 1} className="py-8 text-center text-slate-400">
                        Loading records...
                      </td>
                    </tr>
                  ) : tableData.length === 0 ? (
                    <tr>
                      <td colSpan={selectedColumns.length + 1} className="py-8 text-center text-slate-400">
                        No rows matching "{searchTerm}".
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {(page - 1) * 12 + rIdx + 1}
                        </td>
                        {dataset.columns
                          .filter(c => selectedColumns.includes(c.name))
                          .map((c, cIdx) => {
                            const val = row[c.name];
                            return (
                              <td key={cIdx} className="py-2 px-3 text-slate-800 dark:text-slate-200">
                                {val === null || val === undefined || val === '' ? (
                                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 italic font-sans">
                                    null
                                  </span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
