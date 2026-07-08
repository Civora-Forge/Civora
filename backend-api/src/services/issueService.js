const { getRepository } = require("../repositories/issueRepository");
const { enrichIssue } = require("./aiClient");
const { calculatePriorityScore } = require("./priorityScoring");
const { assignClusterIds } = require("./issueClustering");
const { buildPriorityExplanation } = require("./priorityExplanation");
const { daysSince } = require("../utils/dates");
const { getWardProfile } = require("../data/wardProfiles");

function getWardContext(wardId) {
  const profile = getWardProfile(wardId);
  if (!profile) return {};
  return {
    population: profile.population,
    numSchools: profile.numSchools,
    numPHCs: profile.numPHCs,
  };
}

// Demo seed data is pre-enriched to avoid consuming Gemini quota.
// Real citizen submissions still use AI enrichment.
async function submitIssue(rawIssue, options = {}) {
  const repo = getRepository();
  const userId = options.userId || null;

  const enrichedFields = options.skipAI
    ? {
        finalCategory: rawIssue.categoryHint || rawIssue.finalCategory || "other",
        severity: rawIssue.severity || "medium",
        projectTitle: rawIssue.projectTitle || rawIssue.text,
        issueTheme: rawIssue.issueTheme || "",
        recommendedDepartment: rawIssue.recommendedDepartment || "",
        priorityScore: rawIssue.priorityScore || 0.5,
        clusterSummary: rawIssue.clusterSummary || rawIssue.projectTitle || "",
        wardId: rawIssue.wardId || "15",
        aiSignals: rawIssue.aiSignals || {
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
          modelProvider: "seed",
        },
      }
    : await enrichIssue(rawIssue);

  const issue = {
    ...rawIssue,
    ...enrichedFields,
    userId,
    clusterSummary: enrichedFields.clusterSummary || "",
    aiPriorityScore: enrichedFields.priorityScore || 0.5,
    backendPriorityScore: 0,
    priorityScore: enrichedFields.priorityScore || 0.5,
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

async function insertSeedIssue(seedIssue) {
  return submitIssue(seedIssue, { skipAI: true });
}

async function getIssuesByUserId(userId) {
  const repo = getRepository();
  if (typeof repo.getIssuesByUserId !== "function") {
    // Fallback: filter from all issues
    const all = await repo.getAllIssues();
    return all.filter((i) => i.userId === userId);
  }
  return repo.getIssuesByUserId(userId);
}

module.exports = { submitIssue, insertSeedIssue, getWardContext, getIssuesByUserId };
