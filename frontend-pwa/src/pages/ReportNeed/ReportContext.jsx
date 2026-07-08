import React, { createContext, useContext, useState } from "react";

const defaultDraft = {
  text: "",
  language: "en",
};

const ReportContext = createContext(null);

export const ReportProvider = ({ children }) => {
  const [draft, setDraft] = useState(defaultDraft);

  const updateDraft = (updates) => {
    setDraft((prev) => ({ ...prev, ...updates }));
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
  if (!context) throw new Error("useReport must be used within ReportProvider");
  return context;
};
