import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { api } from '../services/api';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Printer
} from 'lucide-react';

export const ReportGeneratorPage: React.FC = () => {
  const { dataset, setActiveTab } = useData();

  const [projectTitle, setProjectTitle] = useState<string>('CSE Capstone — Exploratory Data Analysis Report');
  const [analystName, setAnalystName] = useState<string>('CSE Data Science Scholar');
  const [datasetSource, setDatasetSource] = useState<string>('Government & Academic Open Data Portal');
  const [licenseType, setLicenseType] = useState<string>('Creative Commons CC-BY-4.0 (Open Research)');
  const [customNotes, setCustomNotes] = useState<string>(
    'All statistics have been independently verified through dual NumPy/Pandas verification engines with 0.05 tolerance.'
  );

  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState<boolean>(false);

  if (!dataset) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-slate-500 text-sm">Please upload or load a dataset first to generate reports.</p>
        <button
          onClick={() => setActiveTab('upload')}
          className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const handleGeneratePreview = async () => {
    setIsPreviewLoading(true);
    try {
      const html = await api.getReportHtml(dataset.session_id, {
        project_title: projectTitle,
        analyst_name: analystName,
        dataset_source: datasetSource,
        license_type: licenseType,
        custom_notes: customNotes
      });
      setHtmlPreview(html);
    } catch (err: any) {
      alert(`Preview failed: ${err.message}`);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsPdfDownloading(true);
    try {
      const res = await fetch(`/api/report/${dataset.session_id}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_title: projectTitle,
          analyst_name: analystName,
          dataset_source: datasetSource,
          license_type: licenseType,
          custom_notes: customNotes
        })
      });
      if (!res.ok) throw new Error('PDF generation failed on server');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DataLens_Report_${dataset.filename.replace('.csv', '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const handleDownloadCsv = () => {
    const url = api.getDownloadCsvUrl(dataset.session_id);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned_${dataset.filename}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Configuration Header Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Automated Report Dissemination
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Produce publication-ready PDF reports and download transformed CSV datasets with complete audit provenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">Project / Report Title</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">Lead Analyst / Author</label>
            <input
              type="text"
              value={analystName}
              onChange={(e) => setAnalystName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">Dataset Provenance / Source</label>
            <input
              type="text"
              value={datasetSource}
              onChange={(e) => setDatasetSource(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">License Classification</label>
            <input
              type="text"
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">Analyst Remarks & Limitations</label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleGeneratePreview}
            disabled={isPreviewLoading}
            className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>{isPreviewLoading ? 'Rendering Preview...' : 'Render Interactive HTML Preview'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isPdfDownloading}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isPdfDownloading ? 'Building PDF...' : 'Download Official PDF Report'}</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export Cleaned CSV Data</span>
          </button>
        </div>
      </div>

      {/* Interactive HTML Preview Box */}
      {htmlPreview ? (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-500" />
              <span>Report HTML Render Preview</span>
            </h3>
            <button
              onClick={() => {
                const win = window.open('', '_blank');
                if (win) {
                  win.document.write(htmlPreview);
                  win.document.close();
                }
              }}
              className="text-xs text-sky-600 dark:text-sky-400 font-medium hover:underline flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Open in New Tab / Print</span>
            </button>
          </div>

          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
            <iframe
              srcDoc={htmlPreview}
              title="Report Preview"
              className="w-full h-[650px] border-none"
            />
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs space-y-2">
          <FileText className="w-8 h-8 mx-auto opacity-40" />
          <p>Click "Render Interactive HTML Preview" or "Download Official PDF Report" above.</p>
        </div>
      )}
    </div>
  );
};
