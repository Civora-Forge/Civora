const express = require("express");
const router = express.Router();
const { getAllIssues } = require("../services/issueStore");

router.get("/", (req, res) => {
  const issues = getAllIssues();

  const groups = {};

  for (const issue of issues) {
    const wardId = issue.wardId || "unknown";
    const category = issue.finalCategory || issue.categoryHint || "other";
    const key = `${wardId}|${category}`;

    if (!groups[key]) {
      groups[key] = {
        wardId,
        latitude: issue.latitude,
        longitude: issue.longitude,
        category,
        count: 0,
      };
    }

    groups[key].count += 1;
  }

  const hotspots = Object.values(groups);

  return res.json({ hotspots });
});

module.exports = router;
