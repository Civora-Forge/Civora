import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DraftReport } from '../../types/domain';

interface ReportContextProps {
  draft: DraftReport;
  updateDraft: (updates: Partial<DraftReport>) => void;
  resetDraft: () => void;
}

const defaultDraft: DraftReport = {
  text: '',
  language: 'en'
};

const ReportContext = createContext<ReportContextProps | null>(null);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraft] = useState<DraftReport>(defaultDraft);

  const updateDraft = (updates: Partial<DraftReport>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const resetDraft = () => setDraft(defaultDraft);

  return (
    <ReportContext.Provider value={{ draft, updateDraft, resetDraft }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) throw new Error('useReport must be used within ReportProvider');
  return context;
};
