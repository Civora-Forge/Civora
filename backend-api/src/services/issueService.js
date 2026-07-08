const { getRepository } = require("../repositories/issueRepository");
const { enrichIssue } = require("./aiClient");
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
    clusterSummary: enrichedFields.clusterSummary || "",
    aiPriorityScore: enrichedFields.priorityScore || 0.5,
    backendPriorityScore: 0,
    priorityScore: 0,
    clusterId: "",
    duplicateCount: 1,
    priorityExplanation: [],
    aiSignals: enrichedFields.aiSignals || {
      speechTranscript: "",
      speechLanguage: rawIssue.language || "unknown",
      speechConfidence: 0,
      translatedText: "",
      detectedLanguage: rawIssue.language || "unknown",
      imageSummary: "",
      imageObjects: [],
      imagePossibleIssue: "",
      imageConfidence: 0,
      photoFindings: [],
      classificationConfidence: 0,
      modelProvider: "stub",
    },
  };

  const stored = await repo.addIssue(issue);

  const allIssues = await repo.getAllIssues();
  const { issueClusterMap } = assignClusterIds(allIssues, {
    similarityThreshold: process.env.ISSUE_CLUSTER_SIMILARITY_THRESHOLD
      ? parseFloat(process.env.ISSUE_CLUSTER_SIMILARITY_THRESHOLD)
      : undefined,
  });
  const clusterInfo = issueClusterMap[stored.id] || {
    clusterId: "cluster_0",
    duplicateCount: 1,
    clusterSummary: issue.clusterSummary || issue.projectTitle || "Civic improvement project",
  };

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

  const updatedIssue = {
    backendPriorityScore: backendPriorityScore,
    priorityScore: backendPriorityScore,
    clusterId: clusterInfo.clusterId,
    clusterSummary: clusterInfo.clusterSummary || issue.clusterSummary || issue.projectTitle || "Civic improvement project",
    duplicateCount: clusterInfo.duplicateCount,
    priorityExplanation: explanation,
  };

  const persisted = repo.updateIssue ? await repo.updateIssue(stored.id, updatedIssue) : null;
  const finalStored = persisted || { ...stored, ...updatedIssue };

  return {
    issueId: finalStored.id,
    priorityScore: finalStored.priorityScore,
    clusterId: clusterInfo.clusterId,
    clusterSummary: clusterInfo.clusterSummary || issue.clusterSummary || issue.projectTitle || "Civic improvement project",
    explanation,
    projectTitle: finalStored.projectTitle || "",
    issueTheme: finalStored.issueTheme || "",
    recommendedDepartment: finalStored.recommendedDepartment || "",
    finalCategory: finalStored.finalCategory || "",
    severity: finalStored.severity || "",
  };
}

module.exports = { submitIssue, getWardContext };
