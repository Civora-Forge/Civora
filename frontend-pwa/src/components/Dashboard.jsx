import React, { useEffect, useMemo, useState } from "react";
import LeafletMapPanel from "./LeafletMapPanel.jsx";

const API_BASE_URL = "http://localhost:5001";

const MOCK_PROJECTS = [
  {
    projectId: "1",
    title: "Repair & Reconstruct Main Road",
    category: "roads",
    priorityScore: 0.96,
    wardId: "12",
    severity: "high",
    citizenReports: 213,
    affectedPopulation: 18200,
  },
  {
    projectId: "2",
    title: "Upgrade Primary Health Center",
    category: "health",
    priorityScore: 0.92,
    wardId: "8",
    severity: "high",
    citizenReports: 181,
    affectedPopulation: 14500,
  },
  {
    projectId: "3",
    title: "Improve Drainage System",
    category: "sanitation",
    priorityScore: 0.88,
    wardId: "5",
    severity: "medium",
    citizenReports: 132,
    affectedPopulation: 10800,
  },
  {
    projectId: "4",
    title: "Build Girls' Toilet in School",
    category: "schools",
    priorityScore: 0.85,
    wardId: "3",
    severity: "medium",
    citizenReports: 98,
    affectedPopulation: 7600,
  },
  {
    projectId: "5",
    title: "Street Light Installation",
    category: "livelihood",
    priorityScore: 0.78,
    wardId: "7",
    severity: "low",
    citizenReports: 87,
    affectedPopulation: 6900,
  },
];

const WARD_META = {
  3: { name: "Ward 3", lat: 8.538, lng: 76.93, population: 7600 },
  5: { name: "Ward 5", lat: 8.529, lng: 76.942, population: 10800 },
  7: { name: "Ward 7", lat: 8.55, lng: 76.95, population: 6900 },
  8: { name: "Ward 8", lat: 8.545, lng: 76.935, population: 14500 },
  12: { name: "Ward 12", lat: 8.522, lng: 76.926, population: 18200 },
  15: { name: "Central Ward", lat: 8.5241, lng: 76.9366, population: 25000 },
  21: { name: "Coastal Ward", lat: 8.5, lng: 76.9, population: 32000 },
};

const SUBMISSIONS = [
  {
    category: "Road Damage",
    ward: "12",
    language: "Malayalam",
    summary: "Potholes and broken road near bus stop",
    status: "Grouped",
  },
  {
    category: "Drainage Issue",
    ward: "5",
    language: "Tamil",
    summary: "Waterlogging during rainy season",
    status: "Grouped",
  },
  {
    category: "PHC Upgrade",
    ward: "8",
    language: "Hindi",
    summary: "Need more doctors and medicines",
    status: "Processed",
  },
  {
    category: "School Facility",
    ward: "3",
    language: "Kannada",
    summary: "Request for girls' toilet in school",
    status: "Processed",
  },
  {
    category: "Water Problem",
    ward: "7",
    language: "English",
    summary: "Irregular water supply in area",
    status: "New",
  },
];

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [filters, setFilters] = useState({
    ward: "All Wards",
    category: "All Categories",
    priority: "All Priorities",
    dateRange: "01 May 2025 - 31 May 2025",
    language: "All Languages",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, hotspotsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/summary`),
          fetch(`${API_BASE_URL}/hotspots`),
        ]);

        if (summaryRes.ok) {
          setSummary(await summaryRes.json());
        }

        if (hotspotsRes.ok) {
          const hotspotsData = await hotspotsRes.json();
          setHotspots(hotspotsData.hotspots || []);
        }

        const projectsRes = await fetch(`${API_BASE_URL}/projects`);
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          if (data.projects?.length) setProjects(data.projects);
        }
      } catch {
        setError("Couldn't reach backend. Is it running on port 5001?");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const projectRows = useMemo(() => normalizeProjects(projects), [projects]);
  const totalReports =
    summary?.totalIssues ?? sum(projectRows, "citizenReports");
  const highPriorityProjects = projectRows.filter(
    (project) => project.priorityScore >= 0.9,
  ).length;
  const topProject = projectRows[0] || null;
  const affectedPopulation =
    summary?.affectedPopulation ?? sum(projectRows, "affectedPopulation");
  const resolvedHotspots = hotspots.length
    ? hotspots
    : buildHotspots(projectRows);
  const filteredProjects = projectRows;
  const topWards = buildWardComparison(projectRows);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "#c0392b" }}>{error}</p>;

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar card-surface">
        <div className="topbar-brand">
          <div className="brand-mark">MP</div>
          <div>
            <div className="eyebrow">Constituency Dashboard</div>
            <h1>MP Constituency Dashboard</h1>
            <p>Community Development Office</p>
          </div>
        </div>
        <div className="topbar-actions">
          <Pill label="Ward 12" icon="map-pin" />
          <Pill label="English" icon="globe" />
          <Pill label="Alerts" icon="bell" count={3} />
          <Pill label="MP Office" icon="user" />
        </div>
      </header>

      <section className="card-surface filter-bar">
        <div className="filter-bar-row">
          <FilterSelect
            label="Ward"
            value={filters.ward}
            onChange={(value) =>
              setFilters((current) => ({ ...current, ward: value }))
            }
            options={[
              "All Wards",
              "Ward 12",
              "Ward 8",
              "Ward 5",
              "Ward 3",
              "Ward 7",
            ]}
            compact
          />
          <FilterSelect
            label="Category"
            value={filters.category}
            onChange={(value) =>
              setFilters((current) => ({ ...current, category: value }))
            }
            options={[
              "All Categories",
              "Roads",
              "Health",
              "Education",
              "Sanitation",
              "Livelihood",
            ]}
            compact
          />
          <FilterSelect
            label="Priority"
            value={filters.priority}
            onChange={(value) =>
              setFilters((current) => ({ ...current, priority: value }))
            }
            options={["All Priorities", "High", "Medium", "Low"]}
            compact
          />
          <FilterSelect
            label="Date Range"
            value={filters.dateRange}
            onChange={(value) =>
              setFilters((current) => ({ ...current, dateRange: value }))
            }
            options={[
              "01 May 2025 - 31 May 2025",
              "Last 30 days",
              "This quarter",
            ]}
            compact
          />
          <FilterSelect
            label="Language"
            value={filters.language}
            onChange={(value) =>
              setFilters((current) => ({ ...current, language: value }))
            }
            options={[
              "All Languages",
              "English",
              "Malayalam",
              "Hindi",
              "Tamil",
              "Kannada",
            ]}
            compact
          />
          <div className="filter-actions">
            <button
              type="button"
              className="ghost-button compact"
              onClick={() =>
                setFilters({
                  ward: "All Wards",
                  category: "All Categories",
                  priority: "All Priorities",
                  dateRange: "01 May 2025 - 31 May 2025",
                  language: "All Languages",
                })
              }
            >
              Clear
            </button>
            <button type="button" className="primary-button compact">
              Apply
            </button>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <MetricCard
          title="Total Reports"
          value={formatNumber(totalReports)}
          delta="+13%"
          note="vs last month"
          accent="blue"
          icon="document"
        />
        <MetricCard
          title="High Priority Projects"
          value={String(highPriorityProjects)}
          delta="+21%"
          note="vs last month"
          accent="amber"
          icon="star"
        />
        <MetricCard
          title="Top Recommended Project"
          value={topProject?.title ?? "Repair Main Road"}
          delta={`Ward ${topProject?.wardId ?? "12"}`}
          note="Priority score"
          accent="teal"
          icon="trophy"
        />
        <MetricCard
          title="Affected Population"
          value={formatNumber(affectedPopulation)}
          delta="+15%"
          note="vs last month"
          accent="coral"
          icon="users"
        />
      </section>

      <section className="dashboard-grid executive-grid">
        <article className="card-surface hero-card">
          <div className="card-head">
            <div>
              <div className="card-kicker blue">
                AI Recommended Development Work
              </div>
              <h2>{topProject?.title ?? "Repair & Reconstruct Main Road"}</h2>
            </div>
            <span className="status-badge status-recommended">Recommended</span>
          </div>
          <div className="hero-body">
            <div>
              <p className="hero-meta">
                Ward {topProject?.wardId ?? "12"} · Roads · Infrastructure
              </p>
              <ul className="reason-list">
                <li>
                  {formatNumber(topProject?.citizenReports ?? 213)} citizen
                  reports on road damage
                </li>
                <li>High traffic area near school and market</li>
                <li>Poor road condition affecting daily commute</li>
                <li>
                  High impact on{" "}
                  {formatNumber(topProject?.affectedPopulation ?? 18200)}{" "}
                  residents
                </li>
              </ul>
            </div>
            <div
              className="score-ring"
              style={scoreRingStyle(topProject?.priorityScore ?? 0.96)}
            >
              <div>
                <strong>
                  {Math.round((topProject?.priorityScore ?? 0.96) * 100)}
                </strong>
                <span>/100</span>
              </div>
            </div>
          </div>
          <div className="hero-footer">
            <div>
              <div className="muted-label">Estimated Cost</div>
              <strong>₹25 Lakh - ₹40 Lakh</strong>
            </div>
            <button className="primary-button">View Project Details</button>
          </div>
        </article>

        <article className="card-surface hotspot-card">
          <div className="card-head">
            <div>
              <div className="card-kicker">Hotspot Map</div>
              <p className="card-subtitle">
                Largest issue concentrations by ward
              </p>
            </div>
          </div>
          <div className="hotspot-layout hotspot-layout-large">
            <div className="hotspot-map-shell">
              <LeafletMapPanel
                hotspots={resolvedHotspots}
                wardMeta={WARD_META}
                height={320}
                zoom={13}
              />
              <HotspotOverlay
                hotspots={resolvedHotspots}
                wardMeta={WARD_META}
              />
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-bottom-grid executive-bottom-grid">
        <article className="card-surface compare-card compact-panel">
          <div className="card-head">
            <div>
              <div className="card-kicker">Ward Comparison</div>
              <p className="card-subtitle">
                Population, reports, and score at a glance
              </p>
            </div>
            <span className="muted-label">Supporting view</span>
          </div>
          <div className="compare-list">
            {topWards.map((ward) => (
              <WardRow key={ward.wardId} {...ward} />
            ))}
          </div>
        </article>

        <article className="card-surface submissions-card compact-panel">
          <div className="card-head">
            <div>
              <div className="card-kicker">Recent Citizen Submissions</div>
              <p className="card-subtitle">
                Selected examples behind the recommendation
              </p>
            </div>
            <button className="ghost-button">View All</button>
          </div>
          <div className="submission-table-wrap">
            <table className="submission-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Ward</th>
                  <th>Summary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SUBMISSIONS.map((submission) => (
                  <tr key={`${submission.category}-${submission.ward}`}>
                    <td>{submission.category}</td>
                    <td>{submission.ward}</td>
                    <td>{submission.summary}</td>
                    <td>
                      <StatusBadge status={submission.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({ title, value, delta, note, accent, icon }) {
  return (
    <div className="card-surface metric-card">
      <div className={`metric-icon metric-${accent}`}>{metricGlyph(icon)}</div>
      <div className="metric-copy">
        <div className="metric-title">{title}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-footnote">
          <span className="metric-delta">{delta}</span>
          <span>{note}</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Recommended: "status-recommended",
    "In Review": "status-review",
    Planned: "status-planned",
    Grouped: "status-grouped",
    Processed: "status-processed",
    New: "status-new",
  };
  return (
    <span className={`status-badge ${colors[status] || "status-muted"}`}>
      {status}
    </span>
  );
}

function Pill({ label, icon, count }) {
  return (
    <div className="pill">
      <span className={`pill-icon pill-${icon}`}>{pillGlyph(icon)}</span>
      <span>{label}</span>
      {count ? <span className="pill-count">{count}</span> : null}
    </div>
  );
}
function HotspotOverlay({ hotspots, wardMeta }) {
  const visibleHotspot = hotspots[0];
  if (!visibleHotspot) return null;

  return (
    <div className="hotspot-overlay">
      <div className="hotspot-chip">Ward {visibleHotspot.wardId}</div>
      <strong>
        {wardMeta[visibleHotspot.wardId]?.name ??
          `Ward ${visibleHotspot.wardId}`}
      </strong>
      <p>
        {visibleHotspot.category} · {formatNumber(visibleHotspot.count)} reports
      </p>
      <button className="ghost-button compact">View Details</button>
    </div>
  );
}
function WardRow({ wardId, population, reports, score }) {
  return (
    <div className="ward-row">
      <div>
        <strong>Ward {wardId}</strong>
        <div className="table-secondary">
          Population {formatNumber(population)}
        </div>
      </div>
      <div className="ward-metrics">
        <span>{formatNumber(reports)} reports</span>
        <span className="ward-score-bar">
          <span style={{ width: `${score}%` }} />
        </span>
        <strong>{score}/100</strong>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange, compact = false }) {
  return (
    <label className={`filter-field ${compact ? "compact" : ""}`}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function scoreRingStyle(score) {
  const percent = Math.max(0, Math.min(100, Math.round(score * 100)));
  return {
    background: `conic-gradient(#2f6df6 ${percent}%, #d7e1f5 ${percent}% 100%)`,
  };
}

function normalizeProjects(list) {
  return [...list]
    .map((project, index) => ({
      projectId: project.projectId ?? String(index + 1),
      title: project.title ?? project.name ?? "Untitled Project",
      category: project.category ?? "other",
      priorityScore:
        typeof project.priorityScore === "number" ? project.priorityScore : 0,
      wardId: String(project.wardId ?? project.ward ?? "12"),
      severity: project.severity ?? severityFromScore(project.priorityScore),
      citizenReports: Number(
        project.citizenReports ??
          project.reports ??
          Math.round((project.priorityScore ?? 0.7) * 180),
      ),
      affectedPopulation: Number(
        project.affectedPopulation ??
          WARD_META[String(project.wardId ?? project.ward ?? "12")]
            ?.population ??
          0,
      ),
      status: project.status ?? statusFromScore(project.priorityScore),
    }))
    .sort((left, right) => right.priorityScore - left.priorityScore);
}

function severityFromScore(score = 0) {
  if (score >= 0.9) return "high";
  if (score >= 0.75) return "medium";
  return "low";
}

function statusFromScore(score = 0) {
  if (score >= 0.93) return "Recommended";
  if (score >= 0.84) return "In Review";
  return "Planned";
}

function buildHotspots(projects) {
  const byWard = {};
  projects.forEach((project) => {
    if (!byWard[project.wardId]) {
      byWard[project.wardId] = {
        wardId: project.wardId,
        category: project.category,
        count: 0,
      };
    }
    byWard[project.wardId].count += project.citizenReports
      ? Math.max(1, Math.round(project.citizenReports / 80))
      : 1;
  });
  return Object.values(byWard);
}

function buildWardComparison(projects) {
  return [3, 5, 8, 12, 7].map((wardId) => {
    const wardProjects = projects.filter(
      (project) => project.wardId === String(wardId),
    );
    const reports =
      wardProjects.reduce((sum, project) => sum + project.citizenReports, 0) ||
      Math.round((WARD_META[wardId]?.population ?? 0) / 100);
    const score = wardProjects.length
      ? Math.round(
          (wardProjects.reduce(
            (sum, project) => sum + project.priorityScore,
            0,
          ) /
            wardProjects.length) *
            100,
        )
      : Math.round((WARD_META[wardId]?.population ?? 0) / 350);
    return {
      wardId,
      population: WARD_META[wardId]?.population ?? 0,
      reports,
      score: Math.max(50, Math.min(99, score)),
    };
  });
}

function sum(list, key) {
  return list.reduce(
    (accumulator, item) => accumulator + (Number(item[key]) || 0),
    0,
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}

function metricGlyph(icon) {
  const glyphs = {
    document: "◫",
    star: "★",
    trophy: "T",
    users: "⟰",
  };
  return glyphs[icon] || "•";
}

function pillGlyph(icon) {
  const glyphs = {
    "map-pin": "⌖",
    globe: "◌",
    bell: "!",
    user: "◉",
  };
  return glyphs[icon] || "•";
}

export default Dashboard;
