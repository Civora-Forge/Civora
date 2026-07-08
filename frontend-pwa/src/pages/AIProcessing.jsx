import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useReport } from "./ReportNeed/ReportContext";
import { submitIssue } from "../api/endpoints";
import { saveCompletedSubmission } from "../services/offlineStore";

const STEPS = [
  "Understanding your request...",
  "Identifying the development need...",
  "Analyzing location context...",
  "Preparing your request for review...",
];

const CATEGORY_MAP = {
  roads: "roads",
  pothole: "roads",
  streetlights: "roads",
  schools: "schools",
  education: "schools",
  health: "health",
  sanitation: "sanitation",
  drainage: "sanitation",
  waste: "sanitation",
  livelihood: "livelihood",
  jobs: "livelihood",
  water: "other",
  public_safety: "other",
  electricity: "other",
  other: "other",
};

const SAFE_CATEGORIES = new Set(["roads", "schools", "health", "sanitation", "livelihood", "other"]);

function normalizeCategoryHint(raw) {
  if (!raw || typeof raw !== "string") return "";
  const lower = raw.toLowerCase().trim();
  const mapped = CATEGORY_MAP[lower];
  if (mapped && SAFE_CATEGORIES.has(mapped)) return mapped;
  return "";
}

export const AIProcessing = () => {
  const navigate = useNavigate();
  const { draft, setBackendResponse } = useReport();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let stepTimer;
    let completeTimer;

    const run = async () => {
      const interval = 4000 / STEPS.length;
      stepTimer = setInterval(() => {
        setStepIndex((prev) => {
          if (prev < STEPS.length - 1) return prev + 1;
          clearInterval(stepTimer);
          return prev;
        });
      }, interval);

      try {
        const photoUrl =
          draft.photoUrl && !draft.photoUrl.startsWith("blob:")
            ? draft.photoUrl
            : "";
        const audioUrl =
          draft.audioUrl && !draft.audioUrl.startsWith("blob:")
            ? draft.audioUrl
            : "";

        const payload = {
          text: (draft.text || "").trim() || "Voice/Photo submission without text",
          language: draft.language || "en",
          latitude: Number(draft.location?.latitude) || 0,
          longitude: Number(draft.location?.longitude) || 0,
          createdAt: new Date().toISOString(),
          photoUrl,
          audioUrl,
          categoryHint: normalizeCategoryHint(draft.categoryHint),
        };

        if (import.meta.env.DEV) {
          console.log("Submitting issue payload", payload);
        }

        const res = await submitIssue(payload);

        if (cancelled) return;

        clearInterval(stepTimer);
        setBackendResponse(res);

        const severity = res.severity || "medium";
        const priorityScore =
          typeof res.priorityScore === "number" ? res.priorityScore : 0;
        const status =
          severity === "high" || priorityScore >= 0.7
            ? "Priority Identified"
            : "Under Analysis";

        const resolvedProjectTitle =
          (res.projectTitle && res.projectTitle !== "Classification unavailable"
            ? res.projectTitle
            : null) ||
          res.issueTheme ||
          (payload.text ? payload.text.substring(0, 60) : null) ||
          "Submitted civic issue";

        const resolvedCategory =
          (res.finalCategory && res.finalCategory !== "Classification unavailable"
            ? res.finalCategory
            : null) ||
          normalizeCategoryHint(draft.categoryHint) ||
          "other";

        const resolvedClusterSummary =
          (res.clusterSummary && res.clusterSummary !== "Classification unavailable"
            ? res.clusterSummary
            : null) ||
          payload.text ||
          "Report submitted successfully.";

        const resolvedDepartment =
          (res.recommendedDepartment &&
          res.recommendedDepartment !== "Classification unavailable"
            ? res.recommendedDepartment
            : null) ||
          "Department review required";

        const localSubmission = {
          localId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          backendIssueId: res.issueId || "",
          text: payload.text,
          category: payload.categoryHint || "",
          finalCategory: resolvedCategory,
          projectTitle: resolvedProjectTitle,
          clusterSummary: resolvedClusterSummary,
          issueTheme: res.issueTheme || "",
          recommendedDepartment: resolvedDepartment,
          severity,
          priorityScore,
          ward: "",
          locality: draft.location?.localityName || "",
          createdAt: payload.createdAt,
          status,
        };

        await saveCompletedSubmission(localSubmission);

        completeTimer = setTimeout(() => {
          navigate("/ai-confirmation");
        }, 600);
      } catch (err) {
        if (cancelled) return;
        clearInterval(stepTimer);
        const message =
          err?.error?.message ||
          err?.message ||
          "Could not reach the Civora backend. Please check your connection and try again.";
        setError(message);
      }
    };

    run();

    return () => {
      cancelled = true;
      clearInterval(stepTimer);
      clearTimeout(completeTimer);
    };
  }, [draft, navigate, setBackendResponse]);

  return (
    <div className="min-h-screen bg-teal-700 flex flex-col items-center justify-center p-6 text-white text-center transition-colors">
      <Loader2 size={64} className="animate-spin text-teal-300 mb-8" />

      <div className="h-16">
        <h2 className="text-xl font-medium animate-pulse">
          {error ? "Something went wrong" : STEPS[stepIndex]}
        </h2>
      </div>

      {error ? (
        <div className="mt-8 max-w-sm w-full">
          <div className="bg-red-500/20 border border-red-300/40 rounded-xl p-4 flex items-start gap-3 text-left">
            <AlertCircle size={20} className="text-red-200 shrink-0 mt-0.5" />
            <p className="text-sm text-red-100 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => navigate("/report/step4")}
            className="mt-6 w-full bg-white text-teal-700 py-3 rounded-xl font-semibold shadow-md active:scale-[0.98]"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xs bg-teal-800 rounded-full h-2 mt-8 overflow-hidden">
          <div
            className="bg-teal-300 h-full transition-all duration-500 ease-out"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
