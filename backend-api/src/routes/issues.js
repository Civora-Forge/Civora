const express = require("express");
const router = express.Router();
const { validateRawIssue } = require("../validators/issueValidator");
const { addIssue, getAllIssues } = require("../services/issueStore");
const { enrichIssue } = require("../../../ai-services/src/enrichIssue");

router.post("/", async (req, res) => {
  const validation = validateRawIssue(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid issue payload",
        details: validation.error,
      },
    });
  }

  const rawIssue = {
    text: validation.data.text.trim(),
    language: validation.data.language,
    photoUrl: validation.data.photoUrl || "",
    audioUrl: validation.data.audioUrl || "",
    latitude: validation.data.latitude,
    longitude: validation.data.longitude,
    createdAt: validation.data.createdAt,
    categoryHint: validation.data.categoryHint || "",
  };

  const enrichedFields = await enrichIssue(rawIssue);

  const issue = {
    ...rawIssue,
    ...enrichedFields,
  };

  const stored = addIssue(issue);

  return res.status(201).json({ ok: true, issueId: stored.id });
});

module.exports = router;
