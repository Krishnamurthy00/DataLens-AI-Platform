import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatasetOverview, CleaningActionResult } from '../types';
import { api } from '../services/api';

export type NavTab = 
  | 'landing'
  | 'dashboard'
  | 'upload'
  | 'cleaning'
  | 'eda'
  | 'ai'
  | 'verification'
  | 'report'
  | 'catalog'
  | 'capstone'
  | 'settings';

interface DataContextType {
  dataset: DatasetOverview | null;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  loadDemo: () => Promise<void>;
  uploadCsv: (file: File) => Promise<void>;
  refreshOverview: () => Promise<void>;
  applyCleaning: (actionData: any) => Promise<CleaningActionResult>;
  undoCleaning: () => Promise<void>;
  resetCleaning: () => Promise<void>;
  selectedColumns: string[];
  setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataset, setDataset] = useState<DatasetOverview | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Auto-select all columns when new dataset loads
  useEffect(() => {
    if (dataset) {
      setSelectedColumns(dataset.columns.map(c => c.name));
    }
  }, [dataset]);

  const loadDemo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.loadDemoDataset();
      setDataset(data);
      setActiveTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to load demo dataset');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCsv = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.uploadCsv(file);
      setDataset(data);
      setActiveTab('upload');
    } catch (err: any) {
      setError(err.message || 'CSV upload failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOverview = async () => {
    if (!dataset?.session_id) return;
    try {
      const updated = await api.getOverview(dataset.session_id);
      setDataset(updated);
    } catch (err: any) {
      console.error('Refresh error:', err);
    }
  };

  const applyCleaning = async (actionData: any): Promise<CleaningActionResult> => {
    if (!dataset?.session_id) throw new Error('No active dataset');
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.applyCleaning(dataset.session_id, actionData);
      await refreshOverview();
      return res;
    } catch (err: any) {
      setError(err.message || 'Cleaning transformation failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const undoCleaning = async () => {
    if (!dataset?.session_id) return;
    setIsLoading(true);
    try {
      await api.undoCleaning(dataset.session_id);
      await refreshOverview();
    } catch (err: any) {
      setError(err.message || 'Undo failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCleaning = async () => {
    if (!dataset?.session_id) return;
    setIsLoading(true);
    try {
      await api.resetCleaning(dataset.session_id);
      await refreshOverview();
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        dataset,
        activeTab,
        setActiveTab,
        isLoading,
        error,
        setError,
        loadDemo,
        uploadCsv,
        refreshOverview,
        applyCleaning,
        undoCleaning,
        resetCleaning,
        selectedColumns,
        setSelectedColumns
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
