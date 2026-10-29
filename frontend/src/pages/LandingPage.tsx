import React from 'react';
import { useData } from '../context/DataContext';
import {
  Sparkles,
  Upload,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  FileText,
  Database,
  ArrowRight,
  BrainCircuit,
  Lock,
  Layers,
  GraduationCap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, loadDemo, isLoading } = useData();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-8 sm:p-14 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CSE Capstone Project • AI-Assisted EDA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Turn Raw Data Into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Verified Insights.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            DataLens AI empowers CSE students and data analysts to clean open datasets, compute real
            mathematical statistics, generate five publication-grade visualizations, and rigorously verify AI-generated claims against ground-truth code.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" />
              <span>Start Analyzing</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => loadDemo()}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>{isLoading ? 'Loading Benchmark Data...' : 'Explore Demo Dataset'}</span>
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real NumPy/Pandas Calculations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dual-Engine Verification
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Hallucinated Citations
            </span>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:block bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
      </section>

      {/* Workflow Section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Systematic EDA Workflow
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            From raw, unvalidated CSV records to mathematically verified report dissemination.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { step: '01', title: 'Upload', desc: 'Drag-and-drop CSV validation & schema inference' },
            { step: '02', title: 'Clean', desc: 'Impute missing values, remove dups & outliers' },
            { step: '03', title: 'Analyze', desc: 'Compute mean, std, median, IQR, skew & mode' },
            { step: '04', title: 'Visualize', desc: 'Histograms, box plots, scatter & heatmap' },
            { step: '05', title: 'Verify', desc: 'Dual-engine cross-validation (Pandas vs NumPy)' },
            { step: '06', title: 'Report', desc: 'Export publication PDF, HTML & cleaned CSV' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center relative overflow-hidden group hover:border-sky-400/50 transition-all"
            >
              <div className="text-2xl font-extrabold text-slate-200 dark:text-slate-800 font-mono mb-1 group-hover:text-sky-500/20 transition-colors">
                {item.step}
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Capstone Features */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pillars of DataLens AI
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Engineered to overcome the fatal limitation of LLMs inventing numbers during statistical analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Data Cleaning Studio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Detects duplicates, missing attributes, and IQR outliers. Offers safe preview transformations, full audit logs, and complete undo/reset capability.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Five EDA Visualizations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Interactive histograms, categorical bar charts, Tukey box plots with outlier markers, bivariate scatter plots, and Pearson correlation heatmaps.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              AI Insights Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Translates complex distributions into simple English. Strict ground-truth constraints ensure zero hallucinated numbers and clear warnings that correlation ≠ causation.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 border-indigo-500/30">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Verification Center
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our capstone centerpiece: Independently recomputes every statistical claim using Pandas and raw NumPy to flag rounding errors or hallucinated statistics.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack & Responsible AI */}
      <section className="rounded-2xl bg-slate-100 dark:bg-slate-900/60 p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Technology Stack Architecture
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              DataLens AI unites modern web engineering with proven scientific computing runtimes:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong className="block text-slate-900 dark:text-white">Frontend</strong>
                <span className="text-slate-500">React 18 • TypeScript • Tailwind CSS • Recharts</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong className="block text-slate-900 dark:text-white">Backend Server</strong>
                <span className="text-slate-500">Python 3.13 • FastAPI • Uvicorn • Pydantic</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong className="block text-slate-900 dark:text-white">Math Runtimes</strong>
                <span className="text-slate-500">Pandas 3.1 • NumPy 2.5 • Dual-Engine Recomputation</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong className="block text-slate-900 dark:text-white">Reporting Engine</strong>
                <span className="text-slate-500">ReportLab Multi-Page PDF • CSV Streaming</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-6 md:pt-0 md:pl-8">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Lock className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Responsible AI & Ethical Data Pledge
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-4">
              <li>
                <strong>No Phantom Numbers:</strong> AI assistant queries are ground-checked against real pandas/numpy matrix math.
              </li>
              <li>
                <strong>Correlation ≠ Causality:</strong> Statistical relationships are labeled as observational associations rather than causation.
              </li>
              <li>
                <strong>Session Isolation:</strong> Uploaded datasets reside exclusively in temporary session memory and are never harvested for training.
              </li>
              <li>
                <strong>Synthetic Benchmark:</strong> Built-in student study habits dataset is 100% synthetic to protect student privacy and adhere to FERPA/ethical standards.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          DataLens AI — CSE Capstone Project by Antigravity IDE
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('capstone')} className="hover:underline flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> Project Overview
          </button>
          <button onClick={() => setActiveTab('settings')} className="hover:underline">
            Methodology & API Docs
          </button>
          <button onClick={() => setActiveTab('catalog')} className="hover:underline">
            Open Dataset Catalog
          </button>
        </div>
      </footer>
    </div>
  );
};
