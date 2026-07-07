import React from 'react';
import { Mic, Edit3, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/Context';

export const CitizenHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Area */}
      <div className="bg-teal-700 text-white rounded-b-3xl pt-12 pb-8 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white text-teal-700 rounded-full flex items-center justify-center font-bold">C</div>
              <span className="font-bold text-lg tracking-wide">Civora</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            {t('home.title')}
          </h1>
          <p className="text-teal-100 text-sm leading-relaxed max-w-sm">
            {t('home.subtitle')}
          </p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="px-5 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 mb-6 flex flex-col gap-4">
          <button 
            onClick={() => navigate('/report/step1')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-xl shadow-md flex items-center justify-center font-semibold text-lg transition-all active:scale-[0.98]"
          >
            <Mic size={24} className="mr-3" />
            {t('home.btn.speak')}
          </button>
          
          <button 
            onClick={() => navigate('/report/step1')}
            className="w-full bg-white border-2 border-teal-100 hover:bg-teal-50 text-teal-700 py-4 rounded-xl flex items-center justify-center font-medium transition-all active:scale-[0.98]"
          >
            <Edit3 size={20} className="mr-3" />
            {t('home.btn.report')}
          </button>
        </div>
      </div>

      {/* Quick Categories */}
      <div className="px-5 mb-8">
        <div className="grid grid-cols-4 gap-3">
          {[
            { id: 'roads', icon: '🛣️', label: 'Roads' },
            { id: 'water', icon: '💧', label: 'Water' },
            { id: 'health', icon: '🏥', label: 'Health' },
            { id: 'more', icon: '⋯', label: 'More' }
          ].map(cat => (
            <button 
              key={cat.id} 
              onClick={() => navigate('/report/step1')}
              className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-600">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Near You */}
      <div className="px-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Needs reported near you</h2>
        <div className="space-y-4">
          {[
            { title: "Road repair near Government School", cat: "Roads & Transport", loc: "Ward 7", time: "2 days ago" },
            { title: "Drinking water shortage", cat: "Water", loc: "Kalyan Nagar", time: "1 week ago" },
            { title: "PHC facility improvement", cat: "Healthcare", loc: "Sector 4", time: "2 weeks ago" }
          ].map((issue, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">{issue.title}</h3>
                <div className="text-xs text-gray-500 flex gap-2 items-center">
                  <span className="text-teal-600 font-medium">{issue.cat}</span>
                  <span>•</span>
                  <span>{issue.loc}</span>
                  <span>•</span>
                  <span>{issue.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
