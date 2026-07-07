import React from 'react';
import { Home, PlusCircle, FileText, BarChart3 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/Context';

export const BottomNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/home', icon: Home, label: t('nav.home') },
    { path: '/report', icon: PlusCircle, label: t('nav.report') },
    { path: '/submissions', icon: FileText, label: t('nav.submissions') },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  ];

  if (location.pathname === '/' || location.pathname.startsWith('/report/step')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center py-3 px-4 flex-1 ${isActive ? 'text-teal-700' : 'text-gray-500'}`}
          >
            <Icon size={24} className="mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
