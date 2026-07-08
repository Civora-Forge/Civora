import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const SubmissionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const issueId = searchParams.get("id") || "UNKNOWN";
  const isOffline = searchParams.get("offline") === "true";

  return (
    <div className="min-h-screen bg-teal-600 flex flex-col justify-between p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <CheckCircle2 size={56} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
          Your need has been recorded
        </h1>

        {isOffline ? (
          <div className="bg-yellow-400 text-yellow-900 px-4 py-3 rounded-lg font-medium text-sm mb-6 shadow-md">
            Saved on this device — will send when connected
          </div>
        ) : (
          <p className="text-teal-100 text-lg mb-8 max-w-xs">
            Tracking ID:{" "}
            <span className="font-mono font-bold bg-teal-800/50 px-2 py-1 rounded ml-1">
              {issueId}
            </span>
          </p>
        )}

        <p className="text-teal-50 text-sm leading-relaxed max-w-xs mx-auto opacity-90">
          Similar requests from your area may be grouped together to help
          identify development priorities.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        <button
          onClick={() => navigate("/submissions")}
          className="w-full bg-white text-teal-700 py-4 rounded-xl text-lg font-bold shadow-lg transition-transform active:scale-95"
        >
          View My Submissions
        </button>
        <button
          onClick={() => navigate("/home")}
          className="w-full bg-transparent border-2 border-teal-400 text-teal-50 hover:bg-teal-500/50 py-4 rounded-xl font-semibold transition-transform active:scale-95 flex items-center justify-center"
        >
          Report Another Need
          <ArrowRight size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
};
