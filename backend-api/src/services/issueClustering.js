const { haversineDistanceMeters } = require("../utils/geo");

const CLUSTER_RADIUS_METERS = 300;

function buildClusters(issues) {
  const clusters = [];
  const assigned = new Set();

  for (let i = 0; i < issues.length; i++) {
    if (assigned.has(i)) continue;

    const base = issues[i];
    const cluster = {
      clusterId: `cluster_${clusters.length + 1}`,
      issues: [base],
    };
    assigned.add(i);

    for (let j = i + 1; j < issues.length; j++) {
      if (assigned.has(j)) continue;
      const other = issues[j];

      const sameCategory = (base.finalCategory || base.categoryHint) ===
        (other.finalCategory || other.categoryHint);
      const sameWard = (base.wardId || "unknown") === (other.wardId || "unknown");

      if (!sameCategory || !sameWard) continue;

      const dist = haversineDistanceMeters(
        base.latitude, base.longitude,
        other.latitude, other.longitude
      );

      if (dist <= CLUSTER_RADIUS_METERS) {
        cluster.issues.push(other);
        assigned.add(j);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

function assignClusterIds(issues) {
  const clusters = buildClusters(issues);
  const issueClusterMap = {};

  for (const cluster of clusters) {
    for (const issue of cluster.issues) {
      issueClusterMap[issue.id] = {
        clusterId: cluster.clusterId,
        duplicateCount: cluster.issues.length,
      };
    }
  }

  return { clusters, issueClusterMap };
}

module.exports = { buildClusters, assignClusterIds };
