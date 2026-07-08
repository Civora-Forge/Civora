import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../i18n/Context";
import { useReport } from "./ReportContext";
import { Mic, Type, MapPin, Tag, ChevronLeft } from "lucide-react";

export const Step4Review = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { draft } = useReport();

  const handleAnalyze = () => {
    // In real app, we would transition to AIProcessing page which handles the submission
    navigate("/ai-processing");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-5 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {t("report.step4.title")}
        </h1>
      </div>

      <div className="flex-1 p-5 pb-24 space-y-4">
        {/* Input Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <Type size={18} className="mr-2 text-gray-500" /> Description
            </h2>
            <button
              onClick={() => navigate("/report/step1")}
              className="text-sm font-medium text-teal-600"
            >
              Edit
            </button>
          </div>
          <div className="p-4">
            {draft.audioUrl && (
              <div className="flex items-center gap-2 mb-3 bg-teal-50 text-teal-800 px-3 py-2 rounded-lg text-sm font-medium">
                <Mic size={16} /> Audio provided
              </div>
            )}
            {draft.text ? (
              <p className="text-gray-700 whitespace-pre-wrap">{draft.text}</p>
            ) : (
              <p className="text-gray-400 italic">No text provided.</p>
            )}

            {draft.photoUrl && (
              <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={draft.photoUrl}
                  alt="Reported issue"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <MapPin size={18} className="mr-2 text-gray-500" /> Location
            </h2>
            <button
              onClick={() => navigate("/report/step2")}
              className="text-sm font-medium text-teal-600"
            >
              Edit
            </button>
          </div>
          <div className="p-4">
            {draft.location ? (
              <div>
                {draft.location.localityName && (
                  <p className="font-medium text-gray-900">
                    {draft.location.localityName}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Lat: {draft.location.latitude.toFixed(4)}, Lng:{" "}
                  {draft.location.longitude.toFixed(4)}
                </p>
              </div>
            ) : (
              <p className="text-red-500 text-sm">Location is required.</p>
            )}
          </div>
        </div>

        {/* Category Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center">
              <Tag size={18} className="mr-2 text-gray-500" /> Category
            </h2>
            <button
              onClick={() => navigate("/report/step3")}
              className="text-sm font-medium text-teal-600"
            >
              Edit
            </button>
          </div>
          <div className="p-4">
            {draft.categoryHint ? (
              <p className="font-medium text-gray-900 capitalize">
                {draft.categoryHint.replace("_", " ")}
              </p>
            ) : (
              <p className="text-gray-500 italic">
                Not selected (Civora will auto-identify)
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleAnalyze}
          disabled={!draft.location || (!draft.text && !draft.audioBlob)}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white py-4 rounded-xl text-lg font-semibold shadow-md flex items-center justify-center transition-all active:scale-[0.98]"
        >
          {t("btn.analyze")}
        </button>
      </div>
    </div>
  );
};
