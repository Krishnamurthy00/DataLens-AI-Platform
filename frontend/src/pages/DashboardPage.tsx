import React from 'react';
import { useData } from '../context/DataContext';
import { MetricCard } from '../components/common/MetricCard';
import { QualityGauge } from '../components/common/QualityGauge';
import {
  Database,
  Layers,
  AlertTriangle,
  Copy,
  Sparkles,
  Upload,
  FileText,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { dataset, setActiveTab, loadDemo, isLoading } = useData();

  if (!dataset) {
    return (
      <div className="py-16 text-center space-y-6 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
          <Database className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No Active Dataset Selected
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload your CSV dataset or explore the synthetic student exam benchmark dataset to unlock live statistical dashboards.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('upload')}
            className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={() => loadDemo()}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>{isLoading ? 'Loading Demo...' : 'Load Synthetic Demo'}</span>
          </button>
        </div>
      </div>
    );
  }

  const { quality } = dataset;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Dataset Dashboard: {dataset.filename}
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Active Session
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real statistics computed on the active dataframe with dual-engine verification ready.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('cleaning')}
            className="px-3.5 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 font-medium text-xs flex items-center gap-1.5 border border-brand-200 dark:border-brand-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clean Data</span>
          </button>
          <button
            onClick={() => setActiveTab('eda')}
            className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Open Charts</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Live Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Observations"
          value={dataset.total_rows.toLocaleString()}
          subtitle="Total rows in active matrix"
          icon={Database}
          accent="brand"
        />
        <MetricCard
          title="Attributes / Features"
          value={dataset.total_columns}
          subtitle={`${dataset.columns.filter(c => c.inferred_type === 'numerical').length} numerical, ${dataset.columns.filter(c => c.inferred_type !== 'numerical').length} categorical`}
          icon={Layers}
          accent="indigo"
        />
        <MetricCard
          title="Missing Cells"
          value={`${quality.missing_percentage}%`}
          subtitle={`${quality.total_missing_cells} of ${quality.total_cells} total cells empty`}
          icon={AlertTriangle}
          accent={quality.missing_percentage > 5 ? 'amber' : 'teal'}
          badge={quality.missing_percentage > 0 ? { text: 'Cleaning Advised', variant: 'warning' } : { text: '100% Complete', variant: 'success' }}
        />
        <MetricCard
          title="Duplicate Records"
          value={quality.total_duplicates}
          subtitle={`${quality.duplicate_percentage}% redundant rows`}
          icon={Copy}
          accent={quality.total_duplicates > 0 ? 'rose' : 'teal'}
          badge={quality.total_duplicates > 0 ? { text: `${quality.total_duplicates} To Deduplicate`, variant: 'danger' } : { text: 'Zero Duplicates', variant: 'success' }}
          onClick={() => setActiveTab('cleaning')}
        />
      </div>

      {/* Quality Score Gauge */}
      <QualityGauge quality={quality} />

      {/* Two Column Layout: Feature Breakdown & Recent Transformation Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Breakdown Table Preview */}
        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Features Inferred Schema ({dataset.columns.length})
            </h3>
            <button
              onClick={() => setActiveTab('eda')}
              className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Explore EDA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-left">
                  <th className="pb-2 font-medium">Feature</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Missing</th>
                  <th className="pb-2 font-medium">Mean / Mode</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {dataset.columns.slice(0, 6).map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-medium text-slate-900 dark:text-slate-100 font-mono">
                      {col.name}
                    </td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {col.inferred_type}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={col.missing_count > 0 ? 'text-amber-600 font-medium' : 'text-slate-500'}>
                        {col.missing_count} ({col.missing_percentage}%)
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-600 dark:text-slate-300">
                      {col.mean !== undefined ? col.mean : (col.mode || '-')}
                    </td>
                    <td className="py-2.5">
                      {col.missing_count === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Clean
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missing
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log / History */}
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Transformation Audit Log
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {dataset.audit_logs?.length || 0} event{dataset.audit_logs?.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {dataset.audit_logs && dataset.audit_logs.length > 0 ? (
              dataset.audit_logs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="p-1 rounded bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 mt-0.5 font-mono font-bold text-[10px]">
                    #{log.step}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {log.description}
                    </p>
                    {log.quality_score && (
                      <p className="text-[11px] text-slate-400">
                        Resulting Quality Score: <strong className="text-emerald-500">{log.quality_score}</strong>
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No cleaning actions performed yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
