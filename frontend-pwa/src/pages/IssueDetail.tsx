import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Calendar, Tag, CheckCircle2, Clock } from 'lucide-react';
import { StatusChip } from '../components/StatusChip';

export const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data as no GET /issues/:id endpoint exists yet
  const issue = {
    id,
    title: "Road repair near Government School",
    summary: "Residents are requesting repairs to the damaged road leading to the Government School because poor road conditions are affecting daily travel and student access.",
    category: "Roads & Transport",
    locationName: "Ward 7, Sample Locality",
    date: "2026-07-05T10:00:00Z",
    status: "Priority Identified",
    similarCount: 23,
    hasVoice: true,
    hasPhoto: false
  };

  const timeline = [
    { label: "Submitted", status: "completed" },
    { label: "Analysed", status: "completed" },
    { label: "Priority Identified", status: "current" },
    { label: "Forwarded for Review", status: "upcoming" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white px-5 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Issue Detail</h1>
        </div>
        <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">#{issue.id?.substring(0, 6)}</span>
      </div>

      <div className="p-5 space-y-6">
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100">
          Note: This is demo data. Backend does not yet provide a GET /issues/:id endpoint.
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-start mb-3">
            <StatusChip status={issue.status} />
            <div className="flex gap-2">
              {issue.hasVoice && <span className="text-xl" title="Voice submitted">🎤</span>}
              {issue.hasPhoto && <span className="text-xl" title="Photo submitted">📷</span>}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{issue.title}</h2>
          
          <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <MapPin size={16} className="mr-2 text-gray-400 shrink-0" />
              <span>{issue.locationName}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-gray-400 shrink-0" />
              <span>{new Date(issue.date).toLocaleDateString()} at {new Date(issue.date).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center">
              <Tag size={16} className="mr-2 text-gray-400 shrink-0" />
              <span>{issue.category}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Summary</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{issue.summary}</p>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-teal-900 font-bold text-lg">{issue.similarCount} similar needs</div>
            <div className="text-teal-700 text-sm">identified in this area</div>
          </div>
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center px-4">
          Civora groups similar community needs to help officials understand recurring local priorities.
        </p>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mt-6">
          <h3 className="font-bold text-gray-900 mb-5">Status Timeline</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {timeline.map((step, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white z-10 shrink-0 
                  ${step.status === 'completed' ? 'border-teal-500 text-teal-500' : 
                    step.status === 'current' ? 'border-teal-500 bg-teal-50 text-teal-600 ring-4 ring-teal-50' : 
                    'border-gray-300 text-gray-300'}`}>
                  {step.status === 'completed' ? <CheckCircle2 size={16} /> : 
                   step.status === 'current' ? <Clock size={16} /> : 
                   <div className="w-2 h-2 rounded-full bg-gray-300" />}
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-lg shadow-sm border border-gray-100 bg-white ml-4">
                  <h4 className={`font-semibold text-sm ${step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>
                    {step.label}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
