import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/Context';
import { useReport } from './ReportContext';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { PhotoUploader } from '../../components/PhotoUploader';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { ChevronRight } from 'lucide-react';

export const Step1Input = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { draft, updateDraft } = useReport();
  
  const audio = useAudioRecorder();

  const handleContinue = () => {
    // If there is audio, save it
    if (audio.audioBlob && audio.audioUrl) {
      updateDraft({ audioBlob: audio.audioBlob, audioUrl: audio.audioUrl, language });
    } else {
      updateDraft({ language });
    }
    navigate('/report/step2');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white px-5 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center">
        <h1 className="text-xl font-bold text-gray-900">{t('report.step1.title')}</h1>
      </div>

      <div className="flex-1 p-5 space-y-6 pb-24">
        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">1. Use Voice (Recommended)</h2>
          <VoiceRecorder
            isRecording={audio.isRecording}
            recordingDuration={audio.recordingDuration}
            audioUrl={audio.audioUrl || draft.audioUrl || null}
            onStart={audio.startRecording}
            onStop={audio.stopRecording}
            onReset={audio.resetRecording}
            onConfirm={() => {}}
          />
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">2. Type your need</h2>
          <textarea
            className="w-full bg-white border border-gray-300 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
            placeholder="Describe the development need in your own words..."
            value={draft.text}
            onChange={(e) => updateDraft({ text: e.target.value })}
          />
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">3. Add a photo (Optional)</h2>
          <PhotoUploader
            photoUrl={draft.photoUrl || null}
            onPhotoSelected={(blob, url) => updateDraft({ photoBlob: blob, photoUrl: url })}
            onRemove={() => updateDraft({ photoBlob: undefined, photoUrl: undefined })}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleContinue}
          disabled={!draft.text && !audio.audioBlob && !draft.audioBlob}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500 text-white py-4 rounded-xl text-lg font-semibold shadow-md flex items-center justify-center transition-all active:scale-[0.98]"
        >
          {t('lang.continue')}
          <ChevronRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};
