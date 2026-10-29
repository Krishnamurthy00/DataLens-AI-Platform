import React from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sun,
  Moon,
  Sparkles,
  Upload,
  Download,
  AlertCircle,
  FileCheck,
  RefreshCw
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, dataset, loadDemo, isLoading, error, setError, refreshOverview } = useData();
  const { theme, toggleTheme } = useTheme();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'landing': return 'Welcome to DataLens AI';
      case 'dashboard': return 'Exploratory Overview Dashboard';
      case 'upload': return 'Dataset Upload & Schema Inspection';
      case 'cleaning': return 'Data Cleaning Studio';
      case 'eda': return 'Exploratory Data Analysis & Visualizations';
      case 'ai': return 'AI Statistical Insights Assistant';
      case 'verification': return 'Mathematical Verification Center';
      case 'report': return 'Automated Report Generator';
      case 'catalog': return 'Open Dataset Provenance Catalog';
      case 'capstone': return 'CSE Capstone Project Presentation';
      case 'settings': return 'System Settings & Methodology Documentation';
      default: return 'DataLens AI';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {getPageTitle()}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {dataset ? (
              <span className="flex items-center gap-1.5">
                <span>Working on: <strong className="text-slate-700 dark:text-slate-200">{dataset.filename}</strong></span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="font-mono text-[11px] text-brand-600 dark:text-brand-400">
                  {dataset.total_rows} rows × {dataset.total_columns} columns
                </span>
              </span>
            ) : (
              'Upload a CSV dataset or explore synthetic benchmark data'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button if dataset exists */}
          {dataset && (
            <button
              onClick={() => refreshOverview()}
              disabled={isLoading}
              title="Refresh dataset state"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Quick Demo button */}
          {!dataset && (
            <button
              onClick={() => loadDemo()}
              disabled={isLoading}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Demo</span>
            </button>
          )}

          {/* Upload Button */}
          <button
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>

          {/* Verification Shortcut */}
          {dataset && (
            <button
              onClick={() => setActiveTab('verification')}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Verify Insights</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mt-2.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="font-bold hover:underline px-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
};
