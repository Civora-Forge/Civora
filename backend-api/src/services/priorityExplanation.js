function buildPriorityExplanation(issue, context) {
  const reasons = [];

  const severity = issue.severity;
  if (severity === "high") {
    reasons.push("Severity is marked as high");
  } else if (severity === "medium") {
    reasons.push("Severity is marked as medium");
  }

  if (context.duplicateCount > 1) {
    reasons.push("Multiple similar reports were found nearby");
  }

  if (context.wardPopulation && context.wardPopulation >= 20000) {
    reasons.push("Ward population impact is considered");
  }

  if (context.numSchools !== undefined && context.numPHCs !== undefined) {
    const totalInfra = context.numSchools + context.numPHCs;
    if (totalInfra <= 3) {
      reasons.push("Limited infrastructure in this ward");
    }
  }

  const days = context.daysSinceCreation;
  if (days !== undefined) {
    if (days <= 1) {
      reasons.push("Recent citizen report");
    } else if (days <= 7) {
      reasons.push("Report submitted within the past week");
    }
  }

  if (reasons.length === 0) {
    reasons.push("Standard priority based on submission data");
  }

  return reasons;
}

module.exports = { buildPriorityExplanation };
