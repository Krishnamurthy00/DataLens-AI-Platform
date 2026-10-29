import React, { useState } from 'react';
import { DataQualityScore } from '../../types';
import { ShieldCheck, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface QualityGaugeProps {
  quality: DataQualityScore;
}

export const QualityGauge: React.FC<QualityGaugeProps> = ({ quality }) => {
  const [showFormula, setShowFormula] = useState(false);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
      case 'B': return 'text-sky-600 dark:text-sky-400 border-sky-500 bg-sky-50 dark:bg-sky-950/40';
      case 'C': return 'text-amber-600 dark:text-amber-400 border-amber-500 bg-amber-50 dark:bg-amber-950/40';
      case 'D': return 'text-orange-600 dark:text-orange-400 border-orange-500 bg-orange-50 dark:bg-orange-950/40';
      default: return 'text-rose-600 dark:text-rose-400 border-rose-500 bg-rose-50 dark:bg-rose-950/40';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'stroke-emerald-500 text-emerald-500';
    if (score >= 80) return 'stroke-sky-500 text-sky-500';
    if (score >= 70) return 'stroke-amber-500 text-amber-500';
    if (score >= 60) return 'stroke-orange-500 text-orange-500';
    return 'stroke-rose-500 text-rose-500';
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (quality.score / 100) * circumference;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Data Quality Health Score
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-dimensional algorithmic hygiene index
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Formula Details</span>
          {showFormula ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
        {/* Radial Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3">
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="40"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="40"
                className={`${getScoreColor(quality.score)} transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {quality.score}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                / 100
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getGradeColor(quality.grade)}`}>
              Grade {quality.grade}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {quality.score >= 80 ? 'Optimal for EDA' : quality.score >= 60 ? 'Requires Cleaning' : 'High Defect Density'}
            </span>
          </div>
        </div>

        {/* Metric Pillars */}
        <div className="md:col-span-8 space-y-3">
          {quality.calculation_breakdown.map((item, idx) => {
            const pct = Math.min(100, Math.round((item.achieved / item.max) * 100));
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.metric}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    {item.achieved} / {item.max} pts ({item.details})
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 85 ? 'bg-emerald-500' : pct >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Formula Explanation */}
      {showFormula && (
        <div className="mt-5 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Mathematical Hygiene Index Formulation:
          </p>
          <p className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
            Total Score = Completeness(30%) + Uniqueness(20%) + Validity(20%) + OutlierStability(15%) + FeatureUsability(15%)
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
            <li><strong>Completeness:</strong> Evaluates missing cell ratio: <code>(1 - missing_cells / total_cells) × 30</code></li>
            <li><strong>Uniqueness:</strong> Evaluates duplicate rows: <code>(1 - duplicate_rows / total_rows) × 20</code></li>
            <li><strong>Outliers:</strong> Evaluates Tukey's Fences <code>[Q1 - 1.5×IQR, Q3 + 1.5×IQR]</code> across numerical columns.</li>
            <li><strong>Zero Hallucination:</strong> Calculated strictly on server data matrices without subjective LLM bias.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
