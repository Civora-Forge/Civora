import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { StatusChip } from "../components/StatusChip";
import { getCompletedSubmissions } from "../services/offlineStore";

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

  const resolvedSummary =
    (sub.clusterSummary && sub.clusterSummary !== "Classification unavailable"
      ? sub.clusterSummary
      : null) ||
    sub.text ||
    "Report submitted successfully.";

  return {
    ...sub,
    projectTitle: resolvedTitle,
    finalCategory: resolvedCategory,
    clusterSummary: resolvedSummary,
  };
}

export const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCompletedSubmissions().then((list) => {
      if (cancelled) return;
      const found = list.find(
        (sub) =>
          sub.backendIssueId === id ||
          sub.issueId === id ||
          sub.localId === id,
      );
      setIssue(found ? normalizeSubmission(found) : null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="bg-white px-5 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Issue Detail</h1>
        </div>
        <div className="p-5 flex items-center justify-center py-20">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="bg-white px-5 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Issue Detail</h1>
        </div>
        <div className="p-5 flex flex-col items-center justify-center py-20 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-6">
            This report is not saved on this device.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => navigate("/submissions")}
              className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all"
            >
              Back to submissions
            </button>
            <button
              onClick={() => navigate("/report/step1")}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98]"
            >
              Report an issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timeline = [
    { label: "Submitted", status: "completed" },
    { label: "Analysed", status: "completed" },
    {
      label: issue.status || "Under Analysis",
      status: issue.status === "Priority Identified" ? "current" : "completed",
    },
    { label: "Forwarded for Review", status: "upcoming" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white px-5 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Issue Detail</h1>
        </div>
        <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          #{(issue.backendIssueId || issue.localId || id)?.substring(0, 8)}
        </span>
      </div>

      <div className="p-5 space-y-6">
        <p className="text-xs text-gray-400">
          Showing report saved on this device.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-start mb-3">
            <StatusChip status={issue.status || "Under Analysis"} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {issue.projectTitle}
          </h2>

          <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6">
            {issue.locality && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-2 text-gray-400 shrink-0" />
                <span>{issue.locality}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-gray-400 shrink-0" />
              <span>
                {new Date(issue.createdAt).toLocaleDateString()} at{" "}
                {new Date(issue.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center">
              <Tag size={16} className="mr-2 text-gray-400 shrink-0" />
              <span className="capitalize">{issue.finalCategory}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Summary
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {issue.clusterSummary}
            </p>
          </div>
        </div>

        {(issue.severity || typeof issue.priorityScore === "number") && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              {issue.severity && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
                    Severity
                  </div>
                  <div className="text-teal-900 font-bold text-lg capitalize">
                    {issue.severity}
                  </div>
                </div>
              )}
              {typeof issue.priorityScore === "number" && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
                    Priority Score
                  </div>
                  <div className="text-teal-900 font-bold text-lg">
                    {(issue.priorityScore * 100).toFixed(0)}
                    <span className="text-sm font-normal text-teal-600 ml-1">
                      / 100
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {issue.recommendedDepartment &&
          issue.recommendedDepartment !== "Department review required" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Recommended Department
              </h3>
              <p className="text-gray-900 font-medium">
                {issue.recommendedDepartment}
              </p>
            </div>
          )}

        <p className="text-xs text-gray-500 text-center px-4">
          Civora groups similar community needs to help officials understand
          recurring local priorities.
        </p>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mt-6">
          <h3 className="font-bold text-gray-900 mb-5">Status Timeline</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {timeline.map((step, idx) => (
              <div
                key={idx}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white z-10 shrink-0 
                  ${
                    step.status === "completed"
                      ? "border-teal-500 text-teal-500"
                      : step.status === "current"
                        ? "border-teal-500 bg-teal-50 text-teal-600 ring-4 ring-teal-50"
                        : "border-gray-300 text-gray-300"
                  }`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle2 size={16} />
                  ) : step.status === "current" ? (
                    <Clock size={16} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-lg shadow-sm border border-gray-100 bg-white ml-4">
                  <h4
                    className={`font-semibold text-sm ${step.status === "upcoming" ? "text-gray-400" : "text-gray-900"}`}
                  >
                    {step.label}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
