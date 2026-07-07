import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DraftReport } from '../../types/domain';
import { IssueSubmitResponse } from '../../types/api';

interface ReportContextProps {
  draft: DraftReport;
  updateDraft: (updates: Partial<DraftReport>) => void;
  resetDraft: () => void;
  backendResponse: IssueSubmitResponse | null;
  setBackendResponse: (resp: IssueSubmitResponse | null) => void;
}

const defaultDraft: DraftReport = {
  text: '',
  language: 'en'
};

const ReportContext = createContext<ReportContextProps | null>(null);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraft] = useState<DraftReport>(defaultDraft);
  const [backendResponse, setBackendResponse] = useState<IssueSubmitResponse | null>(null);

  const updateDraft = (updates: Partial<DraftReport>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const resetDraft = () => {
    setDraft(defaultDraft);
    setBackendResponse(null);
  };

  return (
    <ReportContext.Provider value={{ draft, updateDraft, resetDraft, backendResponse, setBackendResponse }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) throw new Error('useReport must be used within ReportProvider');
  return context;
};
