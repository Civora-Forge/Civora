import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../i18n/Context";
import { useReport } from "./ReportContext";
import { useGeolocation } from "../../hooks/useGeolocation";
import { MapPin, Navigation, ChevronRight, ChevronLeft } from "lucide-react";

export const Step2Location = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { draft, updateDraft } = useReport();
  const { location, isLocating, error, requestLocation } = useGeolocation();

  useEffect(() => {
    if (location) {
      updateDraft({ location });
    }
  }, [location, updateDraft]);

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
          {t("report.step2.title")}
        </h1>
      </div>

      <div className="flex-1 p-5 space-y-6">
        <button
          onClick={requestLocation}
          className="w-full bg-white border-2 border-teal-600 text-teal-700 py-4 rounded-xl flex items-center justify-center font-semibold text-lg shadow-sm active:scale-[0.98] transition-transform"
        >
          {isLocating ? (
            <span className="flex items-center">Locating...</span>
          ) : (
            <>
              <Navigation size={20} className="mr-3" />
              Use my current location
            </>
          )}
        </button>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        {draft.location && (
          <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex items-start">
            <MapPin size={24} className="text-teal-600 mr-3 shrink-0" />
            <div>
              <p className="font-semibold text-teal-900">Location Acquired</p>
              <p className="text-sm text-teal-700 mt-1">
                Lat: {draft.location.latitude.toFixed(4)}, Lng:{" "}
                {draft.location.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        )}

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">
            OR
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            Enter location manually
          </h2>
          <input
            type="text"
            className="w-full bg-white border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
            placeholder="Locality / Area / Landmark"
            value={draft.location?.localityName || ""}
            onChange={(e) =>
              updateDraft({
                location: {
                  latitude: draft.location?.latitude || 0,
                  longitude: draft.location?.longitude || 0,
                  localityName: e.target.value,
                },
              })
            }
          />

          <p className="text-xs text-gray-500 mt-2 ml-1">
            If you don't know the exact coordinates, you can just describe the
            area.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => navigate("/report/step3")}
          disabled={!draft.location && !draft.location?.localityName}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500 text-white py-4 rounded-xl text-lg font-semibold shadow-md flex items-center justify-center transition-all active:scale-[0.98]"
        >
          {t("lang.continue")}
          <ChevronRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};
