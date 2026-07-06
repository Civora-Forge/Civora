const express = require("express");
const router = express.Router();
const { buildSummary } = require("../services/summaryService");

router.get("/", async (req, res) => {
  const summary = await buildSummary();
  return res.json(summary);
});

module.exports = router;
