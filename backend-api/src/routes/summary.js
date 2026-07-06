const express = require("express");
const router = express.Router();
const { buildSummary } = require("../services/summaryService");

router.get("/", (req, res) => {
  const summary = buildSummary();
  return res.json(summary);
});

module.exports = router;
