import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/Context";

export const LanguageSelection = () => {
  const { setLanguage, t, language } = useTranslation();
  const navigate = useNavigate();

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "ml", name: "മലയാളം" },
    { code: "te", name: "తెలుగు" },
    { code: "ta", name: "தமிழ்" },
  ];

  const handleContinue = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
            C
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Civora
          </h1>
          <p className="text-gray-500">Choose your preferred language</p>
        </div>

        <div className="space-y-3 mb-10">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full py-4 px-6 rounded-xl border-2 text-left font-medium text-lg transition-all
                ${
                  language === lang.code
                    ? "border-teal-500 bg-teal-50 text-teal-800 shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:border-teal-200 hover:bg-teal-50/30"
                }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-lg font-semibold shadow-md active:scale-[0.98] transition-transform"
        >
          {t("lang.continue")}
        </button>
      </div>
    </div>
  );
};
