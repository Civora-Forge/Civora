import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/Context';
import { IssueCard } from '../components/IssueCard';
import { getPendingSubmissions } from '../services/offlineStore';
import { PendingSubmission } from '../types/domain';
import { CloudOff } from 'lucide-react';

export const MySubmissions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingSubmission[]>([]);

  useEffect(() => {
    getPendingSubmissions().then(setPending);
  }, []);

  // Demo data since no backend endpoint exists for 'My Submissions'
  const demoSubmissions = [
    { id: 'issue_1', title: "Road repair near Government School", category: "Roads & Transport", locationName: "Ward 7", date: "2026-07-05T10:00:00Z", status: "Priority Identified" },
    { id: 'issue_2', title: "Drinking water shortage", category: "Water", locationName: "Kalyan Nagar", date: "2026-07-02T14:30:00Z", status: "Under Analysis" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-5 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{t('nav.submissions')}</h1>
      </div>

      <div className="p-5 space-y-6">
        {pending.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              <CloudOff size={16} className="mr-2" /> Pending (Offline)
            </h2>
            <div className="space-y-4">
              {pending.map(p => (
                <IssueCard
                  key={p.id}
                  title={p.payload.text ? (p.payload.text.substring(0, 40) + '...') : "Audio/Photo Submission"}
                  category={p.payload.categoryHint || 'Unknown'}
                  locationName={p.payload.location?.localityName || 'Current Location'}
                  date={p.payload.createdAt || new Date().toISOString()}
                  status="Pending Sync"
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Reports</h2>
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 border border-blue-100">
            Note: This is demo data. Backend does not yet provide a GET /issues/my endpoint.
          </div>
          <div className="space-y-4">
            {demoSubmissions.map(issue => (
              <IssueCard
                key={issue.id}
                title={issue.title}
                category={issue.category}
                locationName={issue.locationName}
                date={issue.date}
                status={issue.status}
                onClick={() => navigate(`/issue/${issue.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
