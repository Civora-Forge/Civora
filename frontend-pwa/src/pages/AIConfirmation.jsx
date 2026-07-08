import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useReport } from "./ReportNeed/ReportContext";
import { submitIssue } from "../api/endpoints";
import { MapPin, Check, ChevronLeft, AlertCircle } from "lucide-react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { savePendingSubmission } from "../services/offlineStore";

export const AIConfirmation = () => {
  const { draft, resetDraft } = useReport();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isOnline = useNetworkStatus();

  // Mocking interpretation as the backend does not provide an /analyze endpoint before submission.
  const interpretation = {
    title: draft.text
      ? draft.text.length > 40
        ? draft.text.substring(0, 40) + "..."
        : draft.text
      : "Need reported via Audio/Photo",
    summary:
      draft.text ||
      "The citizen provided audio or visual evidence of a local development need.",
    category: draft.categoryHint || "other",
    locationName:
      draft.location?.localityName ||
      `Lat: ${draft.location?.latitude.toFixed(3)}, Lng: ${draft.location?.longitude.toFixed(3)}`,
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

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

    if (!isOnline) {
      // Save offline
      const pendingId = `pending_${Date.now()}`;
      await savePendingSubmission({
        id: pendingId,
        payload: draft,
        status: "pending",
      });
      setIsSubmitting(false);
      navigate(`/success?offline=true&id=${pendingId}`);
      resetDraft();
      return;
    }

    try {
      const res = await submitIssue(payload);
      if (res.ok) {
        setIsSubmitting(false);
        navigate(`/success?id=${res.issueId}`);
        resetDraft();
      } else {
        throw new Error(res.error?.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      setError(
        "Civora couldn't process your request right now. Please try again or wait for connectivity.",
      );
      setIsSubmitting(false);
    }
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
          Is this what you meant?
        </h1>
      </div>

      <div className="flex-1 p-5 pb-32">
        <p className="text-gray-600 mb-6">
          Please check how Civora understood your request.
        </p>

        {error && (
          <div className="bg-red-50 p-4 rounded-xl flex items-start mb-6 border border-red-100">
            <AlertCircle className="text-red-600 mr-3 shrink-0" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2">
              {interpretation.title}
            </h2>
            <div className="flex gap-2 items-center text-sm">
              <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded capitalize font-medium">
                {interpretation.category.replace("_", " ")}
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center text-gray-600">
                <MapPin size={14} className="mr-1" />{" "}
                {interpretation.locationName}
              </span>
            </div>
          </div>
          <div className="p-5 bg-gray-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Summary
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {interpretation.summary}
            </p>
          </div>

          {(draft.audioUrl || draft.photoUrl) && (
            <div className="p-5 border-t border-gray-100 flex gap-3 overflow-x-auto">
              {draft.audioUrl && (
                <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap">
                  🎤 Submitted by voice
                </div>
              )}
              {draft.photoUrl && (
                <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap">
                  📷 Photo included
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white py-4 rounded-xl text-lg font-semibold shadow-md flex items-center justify-center transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Check size={20} className="mr-2" />
                Yes, Submit This Need
              </>
            )}
          </button>
          <button
            onClick={() => navigate("/report/step4")}
            disabled={isSubmitting}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-medium transition-all active:scale-[0.98]"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
