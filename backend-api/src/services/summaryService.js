const { getAllIssues } = require("../repositories/inMemoryIssueRepository");
const { buildClusters } = require("./issueClustering");
const { getWardProfiles } = require("../data/wardProfiles");

async function buildSummary() {
  const issues = await getAllIssues();
  const totalIssues = issues.length;
  const highPriorityIssues = issues.filter((i) => i.severity === "high").length;

  const categoryCounts = {};
  const severityCounts = {};
  const wardCounts = {};

  for (const issue of issues) {
    const category = issue.finalCategory || issue.categoryHint || "other";
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    const severity = issue.severity || "medium";
    severityCounts[severity] = (severityCounts[severity] || 0) + 1;

    const wardId = issue.wardId || "unknown";
    wardCounts[wardId] = (wardCounts[wardId] || 0) + 1;
  }

  const byCategory = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const bySeverity = Object.entries(severityCounts)
    .map(([severity, count]) => ({ severity, count }))
    .sort((a, b) => b.count - a.count);

  const topWards = Object.entries(wardCounts)
    .map(([wardId, issues]) => ({ wardId, issues }))
    .sort((a, b) => b.issues - a.issues);

  const clusters = buildClusters(issues);
  const topProjects = clusters
    .filter((c) => c.issues.length > 1)
    .map((cluster) => {
      const rep = cluster.issues[0];
      const avgPriority =
        cluster.issues.reduce((sum, i) => sum + (i.priorityScore || 0), 0) /
        cluster.issues.length;
      return {
        clusterId: cluster.clusterId,
        projectTitle: rep.projectTitle || "Civic improvement project",
        category: rep.finalCategory || rep.categoryHint || "other",
        wardId: rep.wardId || "unknown",
        priorityScore: Math.round(avgPriority * 100) / 100,
        issueCount: cluster.issues.length,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    totalIssues,
    highPriorityIssues,
    byCategory,
    bySeverity,
    topWards,
    topProjects,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildSummary };
