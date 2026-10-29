import React from 'react';
import { useData } from '../../context/DataContext';
import { Undo2, RotateCcw, ShieldCheck, Database, Layers, AlertTriangle } from 'lucide-react';

export const QuickStatsBar: React.FC = () => {
  const { dataset, undoCleaning, resetCleaning, isLoading } = useData();

  if (!dataset) return null;

  const { quality } = dataset;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400">Rows:</span>
          <strong className="text-slate-900 dark:text-white font-mono">{dataset.total_rows}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400">Columns:</span>
          <strong className="text-slate-900 dark:text-white font-mono">{dataset.total_columns}</strong>
        </div>

        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-3.5 h-3.5 ${quality.missing_percentage > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          <span className="text-slate-500 dark:text-slate-400">Missing Cells:</span>
          <strong className={`font-mono ${quality.missing_percentage > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
            {quality.total_missing_cells} ({quality.missing_percentage}%)
          </strong>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Duplicates:</span>
          <strong className={`font-mono ${quality.total_duplicates > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {quality.total_duplicates}
          </strong>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-slate-500 dark:text-slate-400">Quality:</span>
          <strong className="font-mono text-emerald-600 dark:text-emerald-400">
            {quality.score} / 100 (Grade {quality.grade})
          </strong>
        </div>
      </div>

      {/* Undo / Reset quick controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => undoCleaning()}
          disabled={isLoading || !dataset.audit_logs || dataset.audit_logs.length <= 1}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[11px]"
          title="Undo last cleaning operation"
        >
          <Undo2 className="w-3 h-3" />
          <span>Undo</span>
        </button>

        <button
          onClick={() => resetCleaning()}
          disabled={isLoading || !dataset.audit_logs || dataset.audit_logs.length <= 1}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[11px]"
          title="Reset to raw uploaded state"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Raw</span>
        </button>
      </div>
    </div>
  );
};
