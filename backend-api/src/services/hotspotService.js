const { getAllIssues } = require("../repositories/inMemoryIssueRepository");
const { buildClusters } = require("./issueClustering");

async function buildHotspots() {
  const issues = await getAllIssues();
  const clusters = buildClusters(issues);

  const hotspots = clusters.map((cluster) => {
    const rep = cluster.issues[0];
    const avgPriority =
      cluster.issues.reduce((sum, i) => sum + (i.priorityScore || 0), 0) /
      cluster.issues.length;

    const allExplanations = cluster.issues
      .flatMap((i) => i.priorityExplanation || i.explanation || [])
      .filter((v, idx, arr) => arr.indexOf(v) === idx);

    return {
      clusterId: cluster.clusterId,
      wardId: rep.wardId || "unknown",
      latitude: rep.latitude,
      longitude: rep.longitude,
      category: rep.finalCategory || rep.categoryHint || "other",
      severity: rep.severity || "medium",
      count: cluster.issues.length,
      priorityScore: Math.round(avgPriority * 100) / 100,
      projectTitle: rep.projectTitle || "Civic improvement project",
      explanation: allExplanations,
    };
  });

  hotspots.sort((a, b) => b.priorityScore - a.priorityScore);

  return { hotspots };
}

module.exports = { buildHotspots };
