import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { StatusChip } from './StatusChip';

interface IssueCardProps {
  title: string;
  category: string;
  locationName: string;
  date: string;
  status: string;
  onClick?: () => void;
}

export const IssueCard = ({ title, category, locationName, date, status, onClick }: IssueCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 overflow-hidden ${onClick ? 'cursor-pointer hover:border-teal-200 transition-colors' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">{category}</span>
        <StatusChip status={status} />
      </div>
      <h3 className="font-semibold text-gray-900 text-lg mb-3 leading-tight">{title}</h3>
      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        <div className="flex items-center">
          <MapPin size={14} className="mr-2 text-gray-400 shrink-0" />
          <span className="truncate">{locationName}</span>
        </div>
        <div className="flex items-center">
          <Calendar size={14} className="mr-2 text-gray-400 shrink-0" />
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
