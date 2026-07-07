import React from 'react';

export const StatusChip = ({ status }: { status: string }) => {
  const getColors = (s: string) => {
    switch (s.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under analysis':
        return 'bg-purple-100 text-purple-800';
      case 'priority identified':
        return 'bg-yellow-100 text-yellow-800';
      case 'forwarded for review':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColors(status)}`}>
      {status}
    </span>
  );
};
