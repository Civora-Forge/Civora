import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ReportCategory } from '../types/domain';

interface CategoryCardProps {
  id: ReportCategory;
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: (id: ReportCategory) => void;
}

export const CategoryCard = ({ id, label, icon: Icon, selected, onClick }: CategoryCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center
        ${selected 
          ? 'bg-teal-50 border-teal-500 shadow-sm text-teal-800' 
          : 'bg-white border-gray-200 text-gray-600 hover:border-teal-200 hover:bg-teal-50/50'
        }`}
    >
      <Icon size={28} className={`mb-2 ${selected ? 'text-teal-600' : 'text-gray-400'}`} />
      <span className="text-sm font-medium leading-tight">{label}</span>
    </button>
  );
};
