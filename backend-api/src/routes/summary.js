const express = require("express");
const router = express.Router();
const { getAllIssues } = require("../services/issueStore");

router.get("/", (req, res) => {
  const issues = getAllIssues();

  const totalIssues = issues.length;

  const categoryCounts = {};
  const wardCounts = {};

  for (const issue of issues) {
    const category = issue.finalCategory || issue.categoryHint || "other";
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    const wardId = issue.wardId || "unknown";
    wardCounts[wardId] = (wardCounts[wardId] || 0) + 1;
  }

  const byCategory = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const topWards = Object.entries(wardCounts)
    .map(([wardId, issues]) => ({ wardId, issues }))
    .sort((a, b) => b.issues - a.issues);

  return res.json({
    totalIssues,
    byCategory,
    topWards,
  });
});

module.exports = router;
