const express = require("express");
const router = express.Router();
const { insertSeedIssue } = require("../services/issueService");
const { getRepository } = require("../repositories/issueRepository");

// Demo seed data is pre-enriched to avoid consuming Gemini quota.
// Real citizen submissions still use AI enrichment.
const SEED_ISSUES = [
  // Roads cluster — 5 issues near the same location for a clear hotspot
  {
    text: "Large pothole near the bus stop causing traffic issues",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5241,
    longitude: 76.9366,
    createdAt: "2026-07-06T08:00:00Z",
    categoryHint: "roads",
    finalCategory: "roads",
    severity: "high",
    projectTitle: "Repair damaged bus-stop road stretch",
    issueTheme: "Road Repair",
    recommendedDepartment: "Public Works Department",
  },
  {
    text: "Road broken near bus stop, difficult for vehicles",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5243,
    longitude: 76.9368,
    createdAt: "2026-07-06T09:00:00Z",
    categoryHint: "roads",
    finalCategory: "roads",
    severity: "high",
    projectTitle: "Repair damaged bus-stop road stretch",
    issueTheme: "Road Repair",
    recommendedDepartment: "Public Works Department",
  },
  {
    text: "Deep pothole on main road near school entrance",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5245,
    longitude: 76.9370,
    createdAt: "2026-07-06T10:00:00Z",
    categoryHint: "roads",
    finalCategory: "roads",
    severity: "high",
    projectTitle: "Repair damaged bus-stop road stretch",
    issueTheme: "Road Repair",
    recommendedDepartment: "Public Works Department",
  },
  {
    text: "Another pothole reported on the same road near market",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5242,
    longitude: 76.9367,
    createdAt: "2026-07-06T11:30:00Z",
    categoryHint: "roads",
    finalCategory: "roads",
    severity: "medium",
    projectTitle: "Repair damaged bus-stop road stretch",
    issueTheme: "Road Repair",
    recommendedDepartment: "Public Works Department",
  },
  {
    text: "Street light not working on main road near bus stop",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5250,
    longitude: 76.9375,
    createdAt: "2026-07-05T14:00:00Z",
    categoryHint: "roads",
    finalCategory: "roads",
    severity: "medium",
    projectTitle: "Install streetlights near public walkway",
    issueTheme: "Street Lighting",
    recommendedDepartment: "Electricity Department",
  },

  // Sanitation — 2 issues
  {
    text: "Garbage dumping near the market area causing health hazards",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5260,
    longitude: 76.9380,
    createdAt: "2026-07-06T07:00:00Z",
    categoryHint: "sanitation",
    finalCategory: "sanitation",
    severity: "high",
    projectTitle: "Clear clogged drainage near market road",
    issueTheme: "Sanitation",
    recommendedDepartment: "Municipality",
  },
  {
    text: "Drainage overflow during rain causing waterlogging",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5262,
    longitude: 76.9382,
    createdAt: "2026-07-05T18:00:00Z",
    categoryHint: "sanitation",
    finalCategory: "sanitation",
    severity: "medium",
    projectTitle: "Clear clogged drainage near market road",
    issueTheme: "Drainage Improvement",
    recommendedDepartment: "Municipality",
  },

  // Health — 1 issue
  {
    text: "Primary health center needs more medicines and staff",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5270,
    longitude: 76.9390,
    createdAt: "2026-07-04T11:00:00Z",
    categoryHint: "health",
    finalCategory: "health",
    severity: "medium",
    projectTitle: "Improve PHC medicine availability",
    issueTheme: "Primary Healthcare",
    recommendedDepartment: "Health Department",
  },

  // Schools — 2 issues
  {
    text: "School building roof is leaking during monsoon",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5280,
    longitude: 76.9400,
    createdAt: "2026-07-03T09:30:00Z",
    categoryHint: "schools",
    finalCategory: "schools",
    severity: "high",
    projectTitle: "Repair school toilet and sanitation facilities",
    issueTheme: "School Infrastructure",
    recommendedDepartment: "Education Department",
  },
  {
    text: "No clean drinking water available in the school",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5282,
    longitude: 76.9402,
    createdAt: "2026-07-02T10:00:00Z",
    categoryHint: "schools",
    finalCategory: "schools",
    severity: "medium",
    projectTitle: "Restore drinking water supply in Central Ward",
    issueTheme: "Water Supply",
    recommendedDepartment: "Water Authority",
  },

  // Water — 1 issue
  {
    text: "No clean drinking water available in the school",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5283,
    longitude: 76.9403,
    createdAt: "2026-07-01T10:00:00Z",
    categoryHint: "water",
    finalCategory: "water",
    severity: "medium",
    projectTitle: "Restore drinking water supply in Central Ward",
    issueTheme: "Water Supply",
    recommendedDepartment: "Water Authority",
  },

  // Livelihood — 1 issue
  {
    text: "Fishermen need better landing facility and cold storage",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5290,
    longitude: 76.9410,
    createdAt: "2026-07-01T16:00:00Z",
    categoryHint: "livelihood",
    finalCategory: "livelihood",
    severity: "medium",
    projectTitle: "Improve fisheries landing and cold storage facility",
    issueTheme: "Livelihood Support",
    recommendedDepartment: "Fisheries Department",
  },
];

// POST /dev/seed — insert pre-enriched demo issues without AI calls
router.post("/seed", async (req, res) => {
  try {
    console.log("Dev seed: inserting pre-enriched demo issues without AI calls");
    let inserted = 0;
    for (const issue of SEED_ISSUES) {
      await insertSeedIssue(issue);
      inserted++;
    }
    console.log(`Dev seed: ${inserted} issues seeded successfully`);
    return res.json({
      ok: true,
      inserted,
      message: "Demo issues seeded successfully",
    });
  } catch (err) {
    console.error("Seed error:", err);
    return res.status(500).json({ ok: false, message: "Seed failed" });
  }
});

// DELETE /dev/clear — clear all issues
router.delete("/clear", async (req, res) => {
  try {
    const repo = getRepository();
    if (typeof repo.clearIssues !== "function") {
      return res.json({
        ok: false,
        message: "Clear operation is not supported by the active repository",
      });
    }
    await repo.clearIssues();
    return res.json({
      ok: true,
      message: "Demo issues cleared successfully",
    });
  } catch (err) {
    console.error("Clear error:", err);
    return res.status(500).json({ ok: false, message: "Clear failed" });
  }
});

module.exports = router;
