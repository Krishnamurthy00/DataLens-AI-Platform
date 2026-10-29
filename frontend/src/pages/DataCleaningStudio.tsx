import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { api } from '../services/api';
import { CleaningActionResult } from '../types';
import {
  Sparkles,
  Copy,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Undo2,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Eye,
  Sliders,
  Filter
} from 'lucide-react';

export const DataCleaningStudio: React.FC = () => {
  const { dataset, applyCleaning, undoCleaning, resetCleaning, isLoading, setActiveTab } = useData();

  const [selectedAction, setSelectedAction] = useState<string>('remove_duplicates');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [fillMethod, setFillMethod] = useState<string>('mean');
  const [customValue, setCustomValue] = useState<string>('');
  const [targetType, setTargetType] = useState<string>('float');
  const [previewResult, setPreviewResult] = useState<CleaningActionResult | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!dataset) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-slate-500 text-sm">Please upload or load a dataset first.</p>
        <button
          onClick={() => setActiveTab('upload')}
          className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  // Set default column if empty
  const activeCol = selectedColumn || dataset.columns[0]?.name || '';

  const handlePreview = async () => {
    setIsPreviewLoading(true);
    setStatusMessage(null);
    try {
      const payload = {
        action: selectedAction,
        column: selectedAction !== 'remove_duplicates' ? activeCol : undefined,
        method: selectedAction === 'fill_missing' ? fillMethod : undefined,
        custom_value: customValue || undefined,
        target_type: selectedAction === 'convert_type' ? targetType : undefined
      };
      const preview = await api.previewCleaning(dataset.session_id, payload);
      setPreviewResult(preview);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Preview generation failed', type: 'error' });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleApply = async () => {
    setStatusMessage(null);
    try {
      const payload = {
        action: selectedAction,
        column: selectedAction !== 'remove_duplicates' ? activeCol : undefined,
        method: selectedAction === 'fill_missing' ? fillMethod : undefined,
        custom_value: customValue || undefined,
        target_type: selectedAction === 'convert_type' ? targetType : undefined
      };
      const res = await applyCleaning(payload);
      setPreviewResult(null);
      setStatusMessage({ text: `Success: ${res.description}`, type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Cleaning execution failed', type: 'error' });
    }
  };

  const { quality } = dataset;

  // Identify columns with missing values and outliers
  const missingCols = dataset.columns.filter(c => c.missing_count > 0);
  const outlierCols = dataset.columns.filter(c => (c.outliers_count || 0) > 0);

  return (
    <div className="space-y-8">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Data Cleaning Studio
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800">
              Audit-Protected
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive defect identification, transformation previews, non-destructive undo/reset, and audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => undoCleaning()}
            disabled={isLoading || dataset.audit_logs?.length <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium disabled:opacity-40 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo Step</span>
          </button>
          <button
            onClick={() => resetCleaning()}
            disabled={isLoading || dataset.audit_logs?.length <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Raw</span>
          </button>
        </div>
      </div>

      {/* Detected Defects Summary Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Duplicates Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Copy className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Duplicate Rows
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {quality.total_duplicates}
            </div>
            <p className="text-[11px] text-slate-500">
              {quality.total_duplicates > 0 ? 'Exact duplicates detected across features' : 'Zero duplicate rows detected'}
            </p>
          </div>
          {quality.total_duplicates > 0 && (
            <button
              onClick={() => {
                setSelectedAction('remove_duplicates');
                handlePreview();
              }}
              className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline mt-1"
            >
              Fix
            </button>
          )}
        </div>

        {/* Missing Values Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Missing Values
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {quality.total_missing_cells} <span className="text-xs font-normal text-slate-400">({quality.missing_percentage}%)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {missingCols.length > 0 ? `${missingCols.length} columns contain missing records` : 'No missing cells in dataset'}
            </p>
          </div>
          {missingCols.length > 0 && (
            <button
              onClick={() => {
                setSelectedAction('fill_missing');
                setSelectedColumn(missingCols[0].name);
              }}
              className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline mt-1"
            >
              Fix
            </button>
          )}
        </div>

        {/* Outliers Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Tukey IQR Outliers
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {outlierCols.reduce((acc, c) => acc + (c.outliers_count || 0), 0)}
            </div>
            <p className="text-[11px] text-slate-500">
              {outlierCols.length > 0 ? `Values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR]` : 'Zero extreme outliers detected'}
            </p>
          </div>
          {outlierCols.length > 0 && (
            <button
              onClick={() => {
                setSelectedAction('remove_outliers');
                setSelectedColumn(outlierCols[0].name);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline mt-1"
            >
              Fix
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Operation Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Action Configuration Panel */}
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Transformation Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure deterministic pandas cleaning transformation.
            </p>
          </div>

          {/* Action Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Cleaning Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPreviewResult(null);
              }}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100"
            >
              <option value="remove_duplicates">Remove Duplicate Rows (drop_duplicates)</option>
              <option value="fill_missing">Fill Missing Values (Imputation)</option>
              <option value="drop_missing_rows">Drop Rows with Missing Values</option>
              <option value="remove_outliers">Filter Outliers via Tukey IQR Bounds</option>
              <option value="convert_type">Convert Column Data Type</option>
              <option value="drop_column">Drop Column Feature</option>
            </select>
          </div>

          {/* Column Selector (if required) */}
          {selectedAction !== 'remove_duplicates' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Target Feature Column
              </label>
              <select
                value={activeCol}
                onChange={(e) => {
                  setSelectedColumn(e.target.value);
                  setPreviewResult(null);
                }}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 font-mono text-slate-900 dark:text-slate-100"
              >
                {dataset.columns.map((c, idx) => (
                  <option key={idx} value={c.name}>
                    {c.name} ({c.inferred_type}{c.missing_count > 0 ? ` • ${c.missing_count} missing` : ''})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sub-parameters for Imputation */}
          {selectedAction === 'fill_missing' && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Imputation Strategy
                </label>
                <select
                  value={fillMethod}
                  onChange={(e) => {
                    setFillMethod(e.target.value);
                    setPreviewResult(null);
                  }}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100"
                >
                  <option value="mean">Mean (Numerical average)</option>
                  <option value="median">Median (Outlier-resistant numerical center)</option>
                  <option value="mode">Mode (Most frequent category/value)</option>
                  <option value="constant">Custom Constant Value</option>
                </select>
              </div>

              {fillMethod === 'constant' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Custom Constant Replacement
                  </label>
                  <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="e.g. Unknown, 0, or NA"
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* Sub-parameters for Convert Type */}
          {selectedAction === 'convert_type' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Target Data Type
              </label>
              <select
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value);
                  setPreviewResult(null);
                }}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100"
              >
                <option value="float">Float (Floating point numeric)</option>
                <option value="int">Integer (Whole numbers)</option>
                <option value="str">String / Text</option>
                <option value="datetime">Datetime</option>
              </select>
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              onClick={handlePreview}
              disabled={isPreviewLoading || isLoading}
              className="flex-1 py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>{isPreviewLoading ? 'Generating Preview...' : 'Preview Transformation'}</span>
            </button>

            <button
              onClick={handleApply}
              disabled={isLoading}
              className="flex-1 py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply & Log</span>
            </button>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Transformation Preview & Impact Evaluation */}
        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Transformation Preview & Quality Impact
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect changes before committing to preserve ground-truth integrity.
              </p>
            </div>
            {previewResult && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Preview Validated
              </span>
            )}
          </div>

          {previewResult ? (
            <div className="space-y-4">
              {/* Quality Impact Delta */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Quality Before</span>
                  <strong className="text-slate-700 dark:text-slate-300 font-mono text-sm">
                    {previewResult.quality_before}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Quality After</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    {previewResult.quality_after}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Rows Affected</span>
                  <strong className="text-sky-600 dark:text-sky-400 font-mono text-sm">
                    {previewResult.rows_affected}
                  </strong>
                </div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {previewResult.description}
              </div>

              {/* Sample Rows Preview */}
              <div className="overflow-x-auto max-h-56 rounded border border-slate-200 dark:border-slate-800 text-xs">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      {dataset.columns.map((c, idx) => (
                        <th key={idx} className="p-2 text-left text-slate-700 dark:text-slate-300">
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {previewResult.preview_rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        {dataset.columns.map((c, cIdx) => (
                          <td key={cIdx} className="p-2 text-slate-700 dark:text-slate-300">
                            {row[c.name] ?? <span className="text-amber-500 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
              <Eye className="w-6 h-6 mx-auto opacity-50" />
              <p>Select a cleaning operation on the left and click "Preview Transformation".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
