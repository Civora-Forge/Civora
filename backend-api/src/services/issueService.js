const { getRepository } = require("../repositories/issueRepository");
const { enrichIssue } = require("../../../ai-services/src/enrichIssue");
const { calculatePriorityScore } = require("./priorityScoring");
const { assignClusterIds } = require("./issueClustering");
const { buildPriorityExplanation } = require("./priorityExplanation");
const { daysSince } = require("../utils/dates");

const WARD_DATA = {
  "15": { population: 25000, numSchools: 5, numPHCs: 2 },
  "7": { population: 18000, numSchools: 3, numPHCs: 1 },
  "21": { population: 32000, numSchools: 4, numPHCs: 2 },
};

function getWardContext(wardId) {
  return WARD_DATA[wardId] || {};
}

async function submitIssue(rawIssue) {
  const repo = getRepository();

  const enrichedFields = await enrichIssue(rawIssue);

  const issue = {
    ...rawIssue,
    ...enrichedFields,
    aiPriorityScore: enrichedFields.priorityScore || 0.5,
    backendPriorityScore: 0,
    priorityScore: 0,
    clusterId: "",
    duplicateCount: 1,
    priorityExplanation: [],
    aiSignals: enrichedFields.aiSignals || {
      translatedText: "",
      detectedLanguage: rawIssue.language || "unknown",
      photoFindings: [],
      classificationConfidence: 0,
      modelProvider: "stub",
    },
  };

  const stored = await repo.addIssue(issue);

  const allIssues = await repo.getAllIssues();
  const { clusters, issueClusterMap } = assignClusterIds(allIssues);
  const clusterInfo = issueClusterMap[stored.id] || { clusterId: "cluster_0", duplicateCount: 1 };

  const wardCtx = getWardContext(stored.wardId);
  const context = {
    duplicateCount: clusterInfo.duplicateCount,
    wardPopulation: wardCtx.population,
    numSchools: wardCtx.numSchools,
    numPHCs: wardCtx.numPHCs,
    daysSinceCreation: daysSince(stored.createdAt),
  };

  const backendPriorityScore = calculatePriorityScore(stored, context);
  const explanation = buildPriorityExplanation(stored, context);

  stored.backendPriorityScore = backendPriorityScore;
  stored.priorityScore = backendPriorityScore;
  stored.clusterId = clusterInfo.clusterId;
  stored.duplicateCount = clusterInfo.duplicateCount;
  stored.priorityExplanation = explanation;

  await repo.addIssue(stored);

  return {
    issueId: stored.id,
    priorityScore: stored.priorityScore,
    clusterId: clusterInfo.clusterId,
    explanation,
  };
}

module.exports = { submitIssue, getWardContext };
