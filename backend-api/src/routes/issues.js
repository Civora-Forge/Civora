const express = require("express");
const router = express.Router();
const { validateRawIssue } = require("../validators/issueValidator");
const { addIssue } = require("../services/issueStore");
const { enrichIssue } = require("../../../ai-services/src/enrichIssue");

router.post("/", async (req, res) => {
  try {
    const validation = validateRawIssue(req.body);
    if (!validation.valid) {
      return res.status(400).json({ ok: false, error: validation.error });
    }

    const rawIssue = {
      text: req.body.text.trim(),
      language: req.body.language,
      photoUrl: req.body.photoUrl || "",
      audioUrl: req.body.audioUrl || "",
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      createdAt: req.body.createdAt,
      categoryHint: req.body.categoryHint || "",
    };

    const enrichedFields = await enrichIssue(rawIssue);

    const issue = {
      ...rawIssue,
      ...enrichedFields,
    };

    const stored = addIssue(issue);

    return res.status(201).json({ ok: true, issueId: stored.id });
  } catch (err) {
    console.error("POST /issues error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

module.exports = router;
