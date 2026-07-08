import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useReport } from "./ReportNeed/ReportContext";
import { submitIssue } from "../api/endpoints";

const STEPS = [
  "Understanding your request...",
  "Identifying the development need...",
  "Analyzing location context...",
  "Preparing your request for review...",
];

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
        const payload = {
          text: draft.text || "Voice/Photo submission without text",
          language: draft.language,
          latitude: draft.location?.latitude || 0,
          longitude: draft.location?.longitude || 0,
          createdAt: new Date().toISOString(),
          photoUrl: draft.photoUrl || "",
          audioUrl: draft.audioUrl || "",
          categoryHint: draft.categoryHint || "",
        };

        const res = await submitIssue(payload);

        if (cancelled) return;

        clearInterval(stepTimer);
        setBackendResponse(res);

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
