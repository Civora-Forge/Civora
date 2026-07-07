const DEFAULT_SIMILARITY_THRESHOLD = process.env.ISSUE_CLUSTER_SIMILARITY_THRESHOLD
  ? parseFloat(process.env.ISSUE_CLUSTER_SIMILARITY_THRESHOLD)
  : 0.58;

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
  "in", "is", "it", "near", "of", "on", "or", "the", "to", "was", "with", "this",
  "that", "there", "report", "issue", "problem", "street", "road",
]);

function getIssueSummary(issue) {
  if (!issue || typeof issue !== "object") {
    return "";
  }

  return (
    issue.classification?.summary ||
    issue.clusterSummary ||
    issue.projectTitle ||
    issue.summary ||
    issue.text ||
    issue.categoryHint ||
    ""
  );
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  return normalized
    .split(" ")
    .map((token) => token.replace(/(ing|ed|es|s)$/u, ""))
    .filter((token) => token && token.length > 1 && !STOP_WORDS.has(token));
}

function cosineSimilarity(leftText, rightText) {
  const leftTokens = tokenize(leftText);
  const rightTokens = tokenize(rightText);

  if (!leftTokens.length || !rightTokens.length) {
    return 0;
  }

  const leftFreq = new Map();
  const rightFreq = new Map();

  for (const token of leftTokens) leftFreq.set(token, (leftFreq.get(token) || 0) + 1);
  for (const token of rightTokens) rightFreq.set(token, (rightFreq.get(token) || 0) + 1);

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (const value of leftFreq.values()) leftNorm += value * value;
  for (const value of rightFreq.values()) rightNorm += value * value;

  for (const [token, leftValue] of leftFreq.entries()) {
    const rightValue = rightFreq.get(token) || 0;
    dot += leftValue * rightValue;
  }

  if (!leftNorm || !rightNorm) {
    return 0;
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

function summarizeCluster(issues) {
  if (!issues.length) {
    return "";
  }

  if (issues.length === 1) {
    return getIssueSummary(issues[0]);
  }

  const tokenCounts = new Map();
  for (const issue of issues) {
    for (const token of tokenize(getIssueSummary(issue))) {
      tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
    }
  }

  const keyTerms = [...tokenCounts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([token]) => token);

  if (!keyTerms.length) {
    return getIssueSummary(issues[0]);
  }

  const plural = issues.length === 2 ? "reports" : "reports";
  return `${issues.length} similar ${plural} about ${keyTerms.join(", ")}`;
}

function sortIssuesForClustering(issues) {
  return [...issues].sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || 0) || 0;
    const rightTime = Date.parse(right.createdAt || 0) || 0;

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return String(left.id || "").localeCompare(String(right.id || ""));
  });
}

function buildClusters(issues, options = {}) {
  const similarityThreshold = typeof options.similarityThreshold === "number"
    ? options.similarityThreshold
    : DEFAULT_SIMILARITY_THRESHOLD;

  const clusters = [];
  const orderedIssues = sortIssuesForClustering(issues);

  for (const issue of orderedIssues) {
    const issueSummary = getIssueSummary(issue);
    let bestClusterIndex = -1;
    let bestScore = 0;

    for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex++) {
      const cluster = clusters[clusterIndex];
      let clusterScore = 0;

      for (const member of cluster.issues) {
        const score = cosineSimilarity(issueSummary, getIssueSummary(member));
        if (score > clusterScore) {
          clusterScore = score;
        }
      }

      if (clusterScore > bestScore) {
        bestScore = clusterScore;
        bestClusterIndex = clusterIndex;
      }
    }

    if (bestClusterIndex !== -1 && bestScore >= similarityThreshold) {
      clusters[bestClusterIndex].issues.push(issue);
      clusters[bestClusterIndex].bestMatchScore = Math.max(clusters[bestClusterIndex].bestMatchScore || 0, bestScore);
      continue;
    }

    clusters.push({
      clusterId: `cluster_${clusters.length + 1}`,
      issues: [issue],
      bestMatchScore: 1,
    });
  }

  return clusters.map((cluster) => ({
    ...cluster,
    clusterSummary: summarizeCluster(cluster.issues),
  }));
}

function assignClusterIds(issues, options = {}) {
  const clusters = buildClusters(issues, options);
  const issueClusterMap = {};

  for (const cluster of clusters) {
    for (const issue of cluster.issues) {
      issueClusterMap[issue.id] = {
        clusterId: cluster.clusterId,
        duplicateCount: cluster.issues.length,
        clusterSummary: cluster.clusterSummary,
        similarityThreshold: typeof options.similarityThreshold === "number"
          ? options.similarityThreshold
          : DEFAULT_SIMILARITY_THRESHOLD,
      };
    }
  }

  return { clusters, issueClusterMap };
}

module.exports = {
  DEFAULT_SIMILARITY_THRESHOLD,
  buildClusters,
  assignClusterIds,
  cosineSimilarity,
  getIssueSummary,
  summarizeCluster,
};
