import React from "react";
import { Mic, Square, RotateCcw, Check } from "lucide-react";

export const VoiceRecorder = ({
  isRecording,
  recordingDuration,
  audioUrl,
  onStart,
  onStop,
  onReset,
  onConfirm,
}) => {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center bg-teal-50 rounded-xl p-6 border border-teal-100">
      {!audioUrl && !isRecording && (
        <div className="text-center">
          <p className="text-teal-800 font-medium mb-4">
            Tap to speak in your language
          </p>
          <button
            type="button"
            onClick={onStart}
            className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-lg mx-auto active:scale-95 transition-transform"
          >
            <Mic size={32} />
          </button>
        </div>
      )}

      {isRecording && (
        <div className="text-center w-full">
          <p className="text-teal-800 font-medium mb-2">Recording...</p>
          <div className="text-3xl font-mono text-teal-900 mb-6">
            {formatTime(recordingDuration)}
          </div>
          <button
            type="button"
            onClick={onStop}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg mx-auto active:scale-95 transition-transform animate-pulse"
          >
            <Square size={24} fill="currentColor" />
          </button>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="w-full">
          <div className="bg-white rounded-lg p-3 mb-6 shadow-sm flex items-center justify-between">
            <audio src={audioUrl} controls className="w-full h-10" />
          </div>
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 py-3 px-4 border border-teal-600 text-teal-700 rounded-lg font-medium flex items-center justify-center bg-white"
            >
              <RotateCcw size={18} className="mr-2" /> Record Again
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-3 px-4 bg-teal-600 text-white rounded-lg font-medium flex items-center justify-center shadow-md"
            >
              <Check size={18} className="mr-2" /> Use Recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
