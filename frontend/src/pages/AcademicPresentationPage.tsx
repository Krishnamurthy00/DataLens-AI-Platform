import React from 'react';
import { useData } from '../context/DataContext';
import {
  GraduationCap,
  Target,
  FileQuestion,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  PlayCircle
} from 'lucide-react';

export const AcademicPresentationPage: React.FC = () => {
  const { setActiveTab, loadDemo } = useData();

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Capstone Hero Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
          <GraduationCap className="w-4 h-4" />
          <span>Computer Science & Engineering • Final Year Capstone Project</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">
          AI-Assisted Exploratory Data Analysis on Open Datasets
        </h1>

        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          An intelligent, non-hallucinating web platform combining deterministic Python/Pandas mathematical computing
          with dual-engine statistical claim verification for computer science and data science education.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
          <span>Domain: <strong>Applied AI / Data Science</strong></span>
          <span>•</span>
          <span>Evaluation Target: <strong>CSE Capstone Defense</strong></span>
          <span>•</span>
          <span>Dual-Engine: <strong>Pandas 3.1 + NumPy 2.5</strong></span>
        </div>
      </div>

      {/* Live Capstone Demonstration Script Walkthrough */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 border border-sky-200 dark:border-indigo-900/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
            <PlayCircle className="w-5 h-5" />
            <h3 className="font-bold text-base">Live Faculty Evaluation Walkthrough Script</h3>
          </div>
          <button
            onClick={() => {
              loadDemo();
              setActiveTab('dashboard');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Live Demo Flow</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Follow this 5-minute live sequence when demonstrating to faculty evaluators:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <strong className="text-sky-600 block">Step 1: Benchmark</strong>
            <p className="text-slate-500 text-[11px]">Load synthetic student performance dataset. Show raw preview & inferred types.</p>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <strong className="text-sky-600 block">Step 2: Clean</strong>
            <p className="text-slate-500 text-[11px]">Navigate to Cleaning Studio. Demonstrate duplicate detection, preview imputation, and Undo.</p>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <strong className="text-sky-600 block">Step 3: Visuals</strong>
            <p className="text-slate-500 text-[11px]">Open EDA Charts. Switch between Histogram, Box Plot (outliers), Scatter, and Heatmap.</p>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <strong className="text-sky-600 block">Step 4: AI & Verify</strong>
            <p className="text-slate-500 text-[11px]">Ask AI a question. Click "Audit in Verification Center" to prove zero hallucinated numbers.</p>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <strong className="text-sky-600 block">Step 5: Disseminate</strong>
            <p className="text-slate-500 text-[11px]">Generate multi-page PDF report and export cleaned CSV with audit history.</p>
          </div>
        </div>
      </div>

      {/* Academic Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Problem Statement */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <FileQuestion className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">1. Problem Statement</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Data science students frequently rely on Generative AI assistants to interpret exploratory statistics.
            However, current LLMs are inherently stochastic token predictors prone to "hallucinating" plausible-sounding
            yet mathematically false averages, p-values, and dataset sources. In academic and scientific research, unverified
            statistical outputs can invalidate entire study conclusions.
          </p>
        </div>

        {/* 2. Objectives */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <Target className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">2. Project Objectives</h3>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>Build an interactive platform to upload, clean, and visualize tabular datasets.</li>
            <li>Enforce absolute computational grounding by executing real Pandas/NumPy calculations.</li>
            <li>Design a novel Verification Center that recomputes claims independently to flag deviations.</li>
            <li>Educate students on ethical data science, outlier sensitivity, and correlation vs causation.</li>
          </ul>
        </div>

        {/* 3. Methodology */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">3. Methodology & System Architecture</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Our pipeline enforces a strict separation of concerns:
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
            <li><strong>Ingestion:</strong> Session-based temporary matrix allocation without permanent PII retention.</li>
            <li><strong>Tukey's IQR:</strong> Outlier fences computed via $Q_1 - 1.5\times IQR$ and $Q_3 + 1.5\times IQR$.</li>
            <li><strong>Dual-Engine Verification:</strong> Claims are validated by executing parallel independent algorithms across Pandas and raw NumPy.</li>
          </ul>
        </div>

        {/* 4. Tools & Technologies */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Cpu className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">4. Tools & Technologies</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <strong>Frontend UI:</strong> React 18, TypeScript, Vite, Tailwind CSS, Recharts
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <strong>Backend Engine:</strong> Python 3.13, FastAPI, Uvicorn, Pydantic
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <strong>Mathematical Runtimes:</strong> Pandas 3.1, NumPy 2.5
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <strong>Dissemination:</strong> ReportLab PDF, Streaming CSV, HTML5
            </div>
          </div>
        </div>

        {/* 5. Expected Outcomes */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">5. Expected Outcomes</h3>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>Reduction of statistical error rates in student exploratory data analysis reports.</li>
            <li>Instant audit trails recording every row deletion, imputation, and type coercion.</li>
            <li>Democratization of data quality scoring through a transparent 5-pillar mathematical index.</li>
          </ul>
        </div>

        {/* 6. Limitations & Future Enhancements */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">6. Limitations & Future Work</h3>
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li><strong>Current Scope:</strong> Tabular 2D CSV data formats up to 25MB.</li>
            <li><strong>Future Enhancement:</strong> Parquet / SQL database connector support.</li>
            <li><strong>Future Enhancement:</strong> Automated hypothesis testing (ANOVA, t-test, Chi-square p-values).</li>
            <li><strong>Future Enhancement:</strong> Exportable Jupyter Notebook code generator.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
