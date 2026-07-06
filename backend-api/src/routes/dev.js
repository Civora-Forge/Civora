const express = require("express");
const router = express.Router();
const { submitIssue } = require("../services/issueService");
const { getRepository } = require("../repositories/issueRepository");

const SEED_ISSUES = [
  {
    text: "Large pothole near the bus stop causing traffic issues",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5241,
    longitude: 76.9366,
    createdAt: "2026-07-06T08:00:00Z",
    categoryHint: "roads",
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
  },
  {
    text: "Street light not working on main road",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5250,
    longitude: 76.9375,
    createdAt: "2026-07-05T14:00:00Z",
    categoryHint: "roads",
  },
  {
    text: "Garbage dumping near the market area causing health hazards",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5260,
    longitude: 76.9380,
    createdAt: "2026-07-06T07:00:00Z",
    categoryHint: "sanitation",
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
  },
  {
    text: "Primary health center needs more medicines and staff",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5270,
    longitude: 76.9390,
    createdAt: "2026-07-04T11:00:00Z",
    categoryHint: "health",
  },
  {
    text: "School building roof is leaking during monsoon",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5280,
    longitude: 76.9400,
    createdAt: "2026-07-03T09:30:00Z",
    categoryHint: "schools",
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
  },
  {
    text: "Fishermen need better landing facility and cold storage",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5290,
    longitude: 76.9410,
    createdAt: "2026-07-01T16:00:00Z",
    categoryHint: "livelihood",
  },
];

// POST /dev/seed — insert demo issues
router.post("/seed", async (req, res) => {
  try {
    let inserted = 0;
    for (const issue of SEED_ISSUES) {
      await submitIssue(issue);
      inserted++;
    }
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
