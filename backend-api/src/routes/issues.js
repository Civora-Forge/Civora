const express = require("express");
const router = express.Router();
const { validateRawIssue } = require("../validators/issueValidator");
const { submitIssue, getIssuesByUserId } = require("../services/issueService");
const { optionalFirebaseAuth } = require("../middleware/optionalFirebaseAuth");
const { requireAuth } = require("../middleware/requireAuth");

// POST /issues — optional auth, accepts anonymous submissions
router.post("/", optionalFirebaseAuth, async (req, res) => {
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

  // If user is authenticated, attach userId
  const options = {};
  if (req.user && req.user.uid) {
    options.userId = req.user.uid;
  }

  const result = await submitIssue(rawIssue, options);

  return res.status(201).json({
    ok: true,
    issueId: result.issueId,
    priorityScore: result.priorityScore,
    clusterId: result.clusterId,
    clusterSummary: result.clusterSummary,
    explanation: result.explanation || [],
    projectTitle: result.projectTitle || "",
    issueTheme: result.issueTheme || "",
    recommendedDepartment: result.recommendedDepartment || "",
    finalCategory: result.finalCategory || "",
    severity: result.severity || "",
  });
});

// GET /issues/my — requires auth, returns issues for the authenticated user
router.get("/my", optionalFirebaseAuth, requireAuth, async (req, res) => {
  const issues = await getIssuesByUserId(req.user.uid);

  const result = issues.map((issue) => ({
    issueId: issue.id,
    text: issue.text || "",
    finalCategory: issue.finalCategory || "",
    projectTitle: issue.projectTitle || "",
    issueTheme: issue.issueTheme || "",
    recommendedDepartment: issue.recommendedDepartment || "",
    severity: issue.severity || "",
    priorityScore: issue.priorityScore || 0,
    clusterId: issue.clusterId || "",
    createdAt: issue.createdAt || null,
  }));

  return res.json({
    ok: true,
    count: result.length,
    issues: result,
  });
});

module.exports = router;
