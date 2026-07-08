import React from "react";
import { useNavigate } from "react-router-dom";
import { useReport } from "./ReportNeed/ReportContext";
import {
  MapPin,
  Check,
  ChevronLeft,
  AlertCircle,
  BarChart3,
  Layers,
} from "lucide-react";

export const AIConfirmation = () => {
  const { draft, resetDraft, backendResponse } = useReport();
  const navigate = useNavigate();

  const handleDone = () => {
    const issueId = backendResponse?.issueId || "unknown";
    resetDraft();
    navigate(`/success?id=${issueId}`);
  };

  if (!backendResponse) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white px-5 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Issue Summary</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 border border-red-100 max-w-sm">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-red-800 font-medium">
                No response data available.
              </p>
              <button
                onClick={() => navigate("/report/step4")}
                className="mt-2 text-sm text-red-600 underline"
              >
                Go back and try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryDisplay = backendResponse.finalCategory || draft.categoryHint || "other";

  const projectTitle =
    backendResponse.projectTitle || draft.text || "Civic improvement need";

  const locationName =
    draft.location?.localityName ||
    `Lat: ${(draft.location?.latitude || 0).toFixed(3)}, Lng: ${(draft.location?.longitude || 0).toFixed(3)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-5 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Issue Processed</h1>
      </div>

      <div className="flex-1 p-5 pb-32 space-y-4">
        <p className="text-gray-600 text-sm">
          Civora has analysed your submission and assigned a priority.
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2">
              {projectTitle}
            </h2>
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded capitalize font-medium">
                {categoryDisplay.replace("_", " ")}
              </span>
              <span className="text-gray-400">&bull;</span>
              <span className="flex items-center text-gray-600">
                <MapPin size={14} className="mr-1" /> {locationName}
              </span>
            </div>
          </div>

          <div className="p-5 bg-gray-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Description
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {draft.text || "Submitted via voice or photo."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Priority
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {typeof backendResponse.priorityScore === "number"
                ? (backendResponse.priorityScore * 100).toFixed(0)
                : "--"}
              <span className="text-sm font-normal text-gray-400 ml-1">/ 100</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={16} className="text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Cluster
              </span>
            </div>
            <p className="text-sm font-mono text-gray-700 truncate">
              {backendResponse.clusterId || "N/A"}
            </p>
            {backendResponse.clusterSummary && (
              <p
                className="text-xs text-gray-500 mt-1 truncate"
                title={backendResponse.clusterSummary}
              >
                {backendResponse.clusterSummary}
              </p>
            )}
          </div>
        </div>

        {backendResponse.issueTheme && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Theme
            </span>
            <p className="text-sm text-gray-800 mt-1">{backendResponse.issueTheme}</p>
          </div>
        )}

        {backendResponse.recommendedDepartment && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Recommended Department
            </span>
            <p className="text-sm text-gray-800 mt-1">
              {backendResponse.recommendedDepartment}
            </p>
          </div>
        )}

        {backendResponse.explanation && backendResponse.explanation.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Priority Reasoning
            </span>
            <ul className="mt-2 space-y-1">
              {backendResponse.explanation.map((reason, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-teal-500 mt-1">&#8226;</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(draft.audioUrl || draft.photoUrl) && (
          <div className="flex gap-3 overflow-x-auto">
            {draft.audioUrl && (
              <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap">
                Voice submitted
              </div>
            )}
            {draft.photoUrl && (
              <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap">
                Photo included
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleDone}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-lg font-semibold shadow-md flex items-center justify-center transition-all active:scale-[0.98]"
        >
          <Check size={20} className="mr-2" />
          Done
        </button>
      </div>
    </div>
  );
};
