import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "./i18n/Context";
import { ReportProvider } from "./pages/ReportNeed/ReportContext";
import { BottomNavigation } from "./components/BottomNavigation";
import { OfflineBanner } from "./components/OfflineBanner";

import { LanguageSelection } from "./pages/LanguageSelection";
import { CitizenHome } from "./pages/CitizenHome";
import { Step1Input } from "./pages/ReportNeed/Step1Input";
import { Step2Location } from "./pages/ReportNeed/Step2Location";
import { Step3Category } from "./pages/ReportNeed/Step3Category";
import { Step4Review } from "./pages/ReportNeed/Step4Review";
import { AIProcessing } from "./pages/AIProcessing";
import { AIConfirmation } from "./pages/AIConfirmation";
import { SubmissionSuccess } from "./pages/SubmissionSuccess";
import { MySubmissions } from "./pages/MySubmissions";
import { IssueDetail } from "./pages/IssueDetail";

function App() {
  return (
    <I18nProvider>
      <ReportProvider>
        <BrowserRouter>
          <div className="app-shell flex flex-col min-h-screen bg-gray-50 font-sans">
            <OfflineBanner />
            <main className="flex-1 w-full max-w-md mx-auto bg-white shadow-xl min-h-screen relative overflow-x-hidden">
              <Routes>
                <Route path="/" element={<LanguageSelection />} />
                <Route path="/home" element={<CitizenHome />} />
                <Route path="/report/step1" element={<Step1Input />} />
                <Route path="/report/step2" element={<Step2Location />} />
                <Route path="/report/step3" element={<Step3Category />} />
                <Route path="/report/step4" element={<Step4Review />} />
                <Route path="/ai-processing" element={<AIProcessing />} />
                <Route path="/ai-confirmation" element={<AIConfirmation />} />
                <Route path="/success" element={<SubmissionSuccess />} />
                <Route path="/submissions" element={<MySubmissions />} />
                <Route path="/issue/:id" element={<IssueDetail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <BottomNavigation />
            </main>
          </div>
        </BrowserRouter>
      </ReportProvider>
    </I18nProvider>
  );
}

export default App;
