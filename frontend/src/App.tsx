import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { QuickStatsBar } from './components/layout/QuickStatsBar';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPreviewPage } from './pages/UploadPreviewPage';
import { DataCleaningStudio } from './pages/DataCleaningStudio';
import { EDAAnalyticsPage } from './pages/EDAAnalyticsPage';
import { AIInsightsAssistant } from './pages/AIInsightsAssistant';
import { VerificationCenter } from './pages/VerificationCenter';
import { ReportGeneratorPage } from './pages/ReportGeneratorPage';
import { DatasetSourcesCatalog } from './pages/DatasetSourcesCatalog';
import { AcademicPresentationPage } from './pages/AcademicPresentationPage';
import { SettingsDocPage } from './pages/SettingsDocPage';

const MainContent: React.FC = () => {
  const { activeTab } = useData();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'upload':
        return <UploadPreviewPage />;
      case 'cleaning':
        return <DataCleaningStudio />;
      case 'eda':
        return <EDAAnalyticsPage />;
      case 'ai':
        return <AIInsightsAssistant />;
      case 'verification':
        return <VerificationCenter />;
      case 'report':
        return <ReportGeneratorPage />;
      case 'catalog':
        return <DatasetSourcesCatalog />;
      case 'capstone':
        return <AcademicPresentationPage />;
      case 'settings':
        return <SettingsDocPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Dark Navy Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <QuickStatsBar />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <MainContent />
      </DataProvider>
    </ThemeProvider>
  );
}
