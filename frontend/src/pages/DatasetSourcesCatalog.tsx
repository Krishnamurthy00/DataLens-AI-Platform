import React from 'react';
import { useData } from '../context/DataContext';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Scale,
  Sparkles
} from 'lucide-react';
import { DatasetSourceItem } from '../types';

export const DatasetSourcesCatalog: React.FC = () => {
  const { loadDemo, isLoading } = useData();

  const sources: DatasetSourceItem[] = [
    {
      name: 'Synthetic Student Study Habits & Exam Performance',
      category: 'Education / Academic Benchmark',
      description: 'Carefully curated benchmark dataset with 100+ records containing intentional duplicates, missing values, and statistical outliers designed for live EDA evaluation.',
      provider: 'DataLens AI Research Benchmark',
      url: 'Local Benchmark Suite',
      license: 'Creative Commons CC-BY-4.0 (Synthetic Non-PII)',
      rows_approx: '100+ rows',
      attributes_approx: '9 features',
      limitations: 'Fully synthetic data generated strictly for academic demonstration. Does not reflect personal student records.',
      verified_provenance: true
    },
    {
      name: 'Open Government Data (OGD) Platform India',
      category: 'Public Policy & Demographics',
      description: 'Single-point access to open datasets published by Ministries, Departments, and organizations of the Government of India.',
      provider: 'National Informatics Centre (NIC)',
      url: 'https://data.gov.in',
      license: 'Government Open Data License - India (GODL)',
      rows_approx: 'Millions of records',
      attributes_approx: 'Varied tabular formats',
      limitations: 'Requires validation for missing geographic codes and seasonal aggregation intervals.',
      verified_provenance: true
    },
    {
      name: 'Data.gov (U.S. Federal Open Data)',
      category: 'Economics, Climate, Healthcare',
      description: 'The home of the U.S. Government’s open data, offering high-value datasets across agriculture, education, and finance.',
      provider: 'U.S. General Services Administration',
      url: 'https://data.gov',
      license: 'U.S. Public Domain (U.S. Government Work)',
      rows_approx: '300,000+ datasets',
      attributes_approx: 'CSV, JSON, GeoJSON',
      limitations: 'Federal data formats may contain mixed-type historical records.',
      verified_provenance: true
    },
    {
      name: 'Kaggle Verified Open Datasets',
      category: 'Machine Learning & Data Science',
      description: 'Open datasets published with explicit licensing for exploratory data analysis, benchmarking, and predictive modeling.',
      provider: 'Kaggle / Google LLC',
      url: 'https://www.kaggle.com/datasets',
      license: 'CC0: Public Domain / CC-BY-SA 4.0',
      rows_approx: 'Over 250,000 datasets',
      attributes_approx: 'Tabular CSV / Parquet',
      limitations: 'User-uploaded datasets require license verification prior to commercial utilization.',
      verified_provenance: true
    },
    {
      name: 'UCI Machine Learning Repository',
      category: 'Statistical Learning Benchmarks',
      description: 'Long-standing canonical archive of empirical datasets used across academic research for benchmarking statistical methods.',
      provider: 'University of California, Irvine',
      url: 'https://archive.ics.uci.edu',
      license: 'Open for Academic & Educational Research',
      rows_approx: '600+ curated datasets',
      attributes_approx: 'Tabular numerical & categorical',
      limitations: 'Many classic datasets contain vintage encoding formats.',
      verified_provenance: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Catalog Header */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-sky-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Trustworthy Open Dataset Catalog
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Responsible data science begins with verified provenance. Every dataset analyzed in DataLens AI must adhere to ethical standards, explicit licensing permissions, and transparent limitations.
        </p>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:border-sky-400/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800">
                  {src.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {src.name}
                </h3>
              </div>

              {src.verified_provenance && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex-shrink-0 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {src.description}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Provider:</span>
                <strong className="text-slate-700 dark:text-slate-300">{src.provider}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">License:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">{src.license}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Scale:</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{src.rows_approx}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span>Known Limitations & Ethics:</span>
              </div>
              <p>{src.limitations}</p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {src.url.startsWith('http') ? (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>Visit Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  onClick={() => loadDemo()}
                  disabled={isLoading}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Load Into Active Session</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
