import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../i18n/Context";
import { useReport } from "./ReportContext";
import { CategoryCard } from "../../components/CategoryCard";

import {
  Bus,
  Droplet,
  Activity,
  BookOpen,
  Trash2,
  ShieldAlert,
  GripHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const Step3Category = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { draft, updateDraft } = useReport();

  const categories = [
    { id: "roads", label: "Roads & Transport", icon: Bus },
    { id: "water", label: "Water", icon: Droplet },
    { id: "health", label: "Healthcare", icon: Activity },
    { id: "schools", label: "Education", icon: BookOpen },
    { id: "sanitation", label: "Sanitation", icon: Trash2 },
    { id: "public_safety", label: "Public Safety", icon: ShieldAlert },
    { id: "other", label: "Other", icon: GripHorizontal },
  ];

  const handleSelect = (id) => {
    updateDraft({ categoryHint: id });
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
          {t("report.step3.title")}
        </h1>
      </div>

      <div className="flex-1 p-5 pb-32">
        <p className="text-gray-600 mb-6">
          Select a category that best describes the need.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              id={cat.id}
              label={cat.label}
              icon={cat.icon}
              selected={draft.categoryHint === cat.id}
              onClick={handleSelect}
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <p className="text-center text-sm text-gray-500 mb-3">
          Not sure? You can skip this. Civora will identify the category.
        </p>
        <button
          onClick={() => navigate("/report/step4")}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl text-lg font-semibold shadow-md flex items-center justify-center transition-all active:scale-[0.98]"
        >
          {draft.categoryHint ? t("lang.continue") : "Skip and Continue"}
          <ChevronRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};
