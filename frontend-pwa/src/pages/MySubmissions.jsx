import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/Context";
import { IssueCard } from "../components/IssueCard";
import {
  getPendingSubmissions,
  getCompletedSubmissions,
} from "../services/offlineStore";

import { CloudOff, FileText } from "lucide-react";

function normalizeSubmission(sub) {
  const isBadTitle =
    !sub.projectTitle ||
    sub.projectTitle === "Classification unavailable" ||
    sub.projectTitle === "";
  const resolvedTitle = isBadTitle
    ? sub.clusterSummary ||
      sub.issueTheme ||
      (sub.text ? sub.text.substring(0, 60) : null) ||
      "Submitted civic issue"
    : sub.projectTitle;

  const resolvedCategory =
    (sub.finalCategory && sub.finalCategory !== "Classification unavailable"
      ? sub.finalCategory
      : null) ||
    sub.category ||
    "other";

  return { ...sub, projectTitle: resolvedTitle, finalCategory: resolvedCategory };
}

export const MySubmissions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    getPendingSubmissions().then(setPending);
    getCompletedSubmissions().then((list) => {
      const normalized = list.map(normalizeSubmission);
      normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSubmissions(normalized);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-5 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Reports from this device
        </h1>
      </div>

      <div className="p-5 space-y-6">
        <p className="text-sm text-gray-500">
          Reports submitted from this browser are shown here. Account-based
          tracking can be enabled during official deployment.
        </p>

        {pending.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              <CloudOff size={16} className="mr-2" /> Pending (Offline)
            </h2>
            <div className="space-y-4">
              {pending.map((p) => (
                <IssueCard
                  key={p.id}
                  title={
                    p.payload.text
                      ? p.payload.text.substring(0, 40) + "..."
                      : "Audio/Photo Submission"
                  }
                  category={p.payload.categoryHint || "Unknown"}
                  locationName={
                    p.payload.location?.localityName || "Current Location"
                  }
                  date={p.payload.createdAt || new Date().toISOString()}
                  status="Pending Sync"
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
            Recent Reports
          </h2>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText
                size={48}
                className="mx-auto text-gray-300 mb-4"
              />
              <p className="text-gray-500 mb-4">
                No reports submitted from this device yet.
              </p>
              <button
                onClick={() => navigate("/report/step1")}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                Report an issue
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <IssueCard
                  key={sub.localId}
                  title={sub.projectTitle}
                  category={sub.finalCategory}
                  locationName={sub.locality || "Location not set"}
                  date={sub.createdAt}
                  status={sub.status}
                  onClick={() =>
                    navigate(
                      `/issue/${sub.backendIssueId || sub.localId}`,
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
