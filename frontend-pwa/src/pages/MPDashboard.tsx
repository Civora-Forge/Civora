import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { RefreshCw, AlertCircle, BarChart3, MapPin, Building2, AlertTriangle } from 'lucide-react';
import { getSummary, getHotspots, seedDemoIssues } from '../api/endpoints';
import { SummaryResponse, HotspotsResponse } from '../types/api';

const MAP_CENTER: [number, number] = [8.5241, 76.9366];
const MAP_ZOOM = 13;

const CATEGORY_COLORS: Record<string, string> = {
  roads: '#f59e0b',
  schools: '#3b82f6',
  health: '#ef4444',
  sanitation: '#8b5cf6',
  livelihood: '#10b981',
  other: '#6b7280',
};

export const MPDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [hotspots, setHotspots] = useState<HotspotsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, h] = await Promise.all([getSummary(), getHotspots()]);
      setSummary(s);
      setHotspots(h);
    } catch (err: any) {
      setError(err?.error?.message || err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDemoIssues();
      await fetchData();
    } catch {
      // ignore
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-teal-700 text-white px-5 pt-10 pb-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">MP Dashboard</h1>
          <button onClick={fetchData} className="p-2 rounded-full hover:bg-teal-600 transition-colors">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <p className="text-teal-100 text-sm">Real-time civic issue overview from Civora backend</p>
      </div>

      {error && (
        <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 font-medium">{error}</p>
            <button onClick={fetchData} className="text-xs text-red-600 underline mt-1">Retry</button>
          </div>
        </div>
      )}

      {loading && !summary && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={32} className="animate-spin text-teal-600" />
        </div>
      )}

      {summary && (
        <div className="px-5 mt-6 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<BarChart3 size={20} className="text-teal-600" />}
              label="Total Issues"
              value={summary.totalIssues}
            />
            <StatCard
              icon={<AlertTriangle size={20} className="text-red-500" />}
              label="High Priority"
              value={summary.highPriorityIssues}
            />
          </div>

          {/* Category breakdown */}
          {summary.byCategory.length > 0 && (
            <Section title="By Category">
              <div className="space-y-2">
                {summary.byCategory.map((c) => (
                  <div key={c.category} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[c.category] || '#6b7280' }}
                    />
                    <span className="text-sm text-gray-700 flex-1 capitalize">{c.category}</span>
                    <span className="text-sm font-bold text-gray-900">{c.count}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Severity breakdown */}
          {summary.bySeverity.length > 0 && (
            <Section title="By Severity">
              <div className="space-y-2">
                {summary.bySeverity.map((s) => (
                  <div key={s.severity} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{s.severity}</span>
                    <span className="text-sm font-bold text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Top wards */}
          {summary.topWards.length > 0 && (
            <Section title="Top Wards">
              <div className="space-y-2">
                {summary.topWards.slice(0, 5).map((w) => (
                  <div key={w.wardId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Ward {w.wardId}</span>
                    <span className="text-sm font-bold text-gray-900">{w.issues} issues</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Top projects */}
          {summary.topProjects.length > 0 && (
            <Section title="Top Projects">
              <div className="space-y-3">
                {summary.topProjects.slice(0, 5).map((p) => (
                  <div key={p.clusterId} className="bg-white rounded-lg border border-gray-100 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.projectTitle}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="capitalize">{p.category}</span>
                          <span>&bull;</span>
                          <span>Ward {p.wardId}</span>
                          <span>&bull;</span>
                          <span>{p.issueCount} reports</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded ml-2 shrink-0">
                        {(p.priorityScore * 100).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Map */}
          {hotspots && hotspots.hotspots.length > 0 && (
            <Section title="Hotspot Map">
              <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 300 }}>
                <MapContainer
                  center={MAP_CENTER}
                  zoom={MAP_ZOOM}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {hotspots.hotspots.map((h) => (
                    <CircleMarker
                      key={h.clusterId}
                      center={[h.latitude, h.longitude]}
                      radius={Math.max(6, Math.min(20, h.count * 3))}
                      fillColor={CATEGORY_COLORS[h.category] || '#6b7280'}
                      color="#fff"
                      weight={2}
                      fillOpacity={0.8}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{h.projectTitle}</p>
                          <p className="text-gray-600 capitalize">{h.category} &bull; {h.count} issues</p>
                          <p className="text-gray-600">Ward {h.wardId}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </Section>
          )}

          {/* Empty state */}
          {summary.totalIssues === 0 && (
            <div className="text-center py-10">
              <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No issues in the system yet.</p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                {seeding ? "Seeding..." : "Load Demo Data"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">{title}</h3>
      {children}
    </div>
  );
}
