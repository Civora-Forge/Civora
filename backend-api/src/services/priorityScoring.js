const { daysSince } = require("../utils/dates");

const SEVERITY_SCORES = { low: 0.3, medium: 0.6, high: 1.0 };

function severityScore(severity) {
  return SEVERITY_SCORES[severity] || 0.5;
}

function duplicateClusterScore(duplicateCount) {
  if (duplicateCount <= 1) return 0.2;
  if (duplicateCount <= 4) return 0.5;
  if (duplicateCount <= 9) return 0.8;
  return 1.0;
}

function populationImpactScore(wardPopulation) {
  if (!wardPopulation || typeof wardPopulation !== "number") return 0.5;
  if (wardPopulation >= 30000) return 1.0;
  if (wardPopulation >= 20000) return 0.8;
  if (wardPopulation >= 10000) return 0.6;
  return 0.4;
}

function infraScarcityScore(numSchools, numPHCs) {
  if (typeof numSchools !== "number" || typeof numPHCs !== "number") return 0.5;
  const totalInfra = numSchools + numPHCs;
  if (totalInfra <= 2) return 1.0;
  if (totalInfra <= 4) return 0.7;
  return 0.4;
}

function recencyScore(createdAt) {
  const days = daysSince(createdAt);
  if (days <= 1) return 1.0;
  if (days <= 7) return 0.7;
  return 0.4;
}

function calculatePriorityScore(issue, context) {
  const sev = severityScore(issue.severity);
  const dup = duplicateClusterScore(context.duplicateCount || 1);
  const pop = populationImpactScore(context.wardPopulation);
  const infra = infraScarcityScore(context.numSchools, context.numPHCs);
  const rec = recencyScore(issue.createdAt);

  const score = 0.35 * sev + 0.25 * dup + 0.20 * pop + 0.10 * infra + 0.10 * rec;
  return Math.round(score * 100) / 100;
}

module.exports = { calculatePriorityScore };
