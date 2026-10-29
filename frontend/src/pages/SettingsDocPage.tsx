import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Settings,
  Sun,
  Moon,
  Shield,
  FileCode,
  Terminal,
  Info,
  HelpCircle,
  CheckCircle2,
  Lock,
  Layers,
  BookOpen
} from 'lucide-react';

export const SettingsDocPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const [iqrMultiplier, setIqrMultiplier] = useState<number>(1.5);
  const [maxPreviewRows, setMaxPreviewRows] = useState<number>(15);
  const [tolerance, setTolerance] = useState<number>(0.05);

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-12">
      {/* Settings Header */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            System Settings & Technical Documentation
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure analytical tolerances, review privacy guarantees, and explore local execution instructions.
        </p>
      </div>

      {/* Preferences Section */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          Analytical Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Theme Preference */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Interface Color Theme
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium hover:border-sky-400 transition-colors"
              >
                {theme === 'light' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light Mode Active</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-sky-400" />
                    <span>Dark Mode Active</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Adapts system color tokens, chart backgrounds, and text contrast.
            </p>
          </div>

          {/* Outlier IQR Multiplier */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Tukey's IQR Multiplier Fence
            </label>
            <div className="flex items-center gap-3">
              <select
                value={iqrMultiplier}
                onChange={(e) => setIqrMultiplier(parseFloat(e.target.value))}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
              >
                <option value={1.5}>1.5 (Standard Outlier Bound)</option>
                <option value={2.0}>2.0 (Moderate Outlier Bound)</option>
                <option value={3.0}>3.0 (Extreme Outlier Bound)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Threshold formula: [Q1 - k×IQR, Q3 + k×IQR].
            </p>
          </div>

          {/* Verification Numerical Tolerance */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Numerical Verification Tolerance
            </label>
            <input
              type="number"
              step="0.01"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value))}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs w-36"
            />
            <p className="text-[11px] text-slate-400">
              Allowed absolute floating point delta between Pandas & NumPy evaluations.
            </p>
          </div>

          {/* Preview rows */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Default Table Preview Rows
            </label>
            <select
              value={maxPreviewRows}
              onChange={(e) => setMaxPreviewRows(parseInt(e.target.value))}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
            >
              <option value={10}>10 records</option>
              <option value={15}>15 records</option>
              <option value={25}>25 records</option>
              <option value={50}>50 records</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Number of records loaded per pagination request.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice & Security Section */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Shield className="w-5 h-5" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Privacy Policy & Zero Permanent Storage Guarantee
          </h3>
        </div>
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            DataLens AI is designed strictly as a stateless, session-oriented educational platform.
            When you upload a dataset:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Datasets are held in ephemeral server memory keyed by an anonymous UUID session ID.</li>
            <li>No database persistence or permanent disk archiving occurs without explicit user consent.</li>
            <li>Uploaded CSV rows are never transmitted to third-party language models for model training.</li>
            <li>All computations are performed locally in Python using Pandas and NumPy.</li>
          </ul>
        </div>
      </div>

      {/* Local Execution Instructions */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
          <Terminal className="w-5 h-5" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            How to Run DataLens AI Locally
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            To run the complete full-stack project on your local machine for evaluation:
          </p>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-3 rounded-lg bg-slate-900 text-slate-200">
              <span className="text-slate-500"># 1. Start Python Backend (FastAPI + Uvicorn)</span>
              <br />
              <span className="text-emerald-400">py -m pip install -r backend/requirements.txt</span>
              <br />
              <span className="text-sky-400">py backend/run_backend.py</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 text-slate-200">
              <span className="text-slate-500"># 2. Start Frontend Development Server (Vite + React)</span>
              <br />
              <span className="text-emerald-400">cd frontend</span>
              <br />
              <span className="text-emerald-400">npm install</span>
              <br />
              <span className="text-sky-400">npm run dev</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 text-slate-200">
              <span className="text-slate-500"># 3. Execute Automated Unit Tests</span>
              <br />
              <span className="text-sky-400">py backend/run_tests.py</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
