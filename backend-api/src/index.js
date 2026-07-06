const express = require("express");
const cors = require("cors");
const { enrichIssue } = require("./enrichIssue");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// In-memory issue store (placeholder for Firestore)
const issues = [];
let nextId = 1;

/**
 * POST /issues
 * Submit a new civic issue.
 */
app.post("/issues", async (req, res) => {
  try {
    const { text, language, photoUrl, audioUrl, latitude, longitude, createdAt, categoryHint } = req.body;

    // Simple validation
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ ok: false, error: "text is required" });
    }
    if (!language || typeof language !== "string") {
      return res.status(400).json({ ok: false, error: "language is required" });
    }
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ ok: false, error: "latitude and longitude must be numbers" });
    }

    const rawIssue = {
      text: text.trim(),
      language,
      photoUrl: photoUrl || "",
      audioUrl: audioUrl || "",
      latitude,
      longitude,
      createdAt: createdAt || new Date().toISOString(),
      categoryHint: categoryHint || "",
    };

    // Call AI enrichment
    const enriched = await enrichIssue(rawIssue);

    // Create final issue object
    const issue = {
      id: `issue_${nextId++}`,
      ...rawIssue,
      ...enriched,
    };

    // TODO: Store in Firestore instead of memory
    // await admin.firestore().collection("issues").doc(issue.id).set(issue);
    issues.push(issue);

    return res.status(201).json({ ok: true, issueId: issue.id });
  } catch (err) {
    console.error("POST /issues error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

/**
 * GET /summary
 * Get aggregated issue statistics.
 */
app.get("/summary", (req, res) => {
  // TODO: Query Firestore or BigQuery for real aggregation
  return res.json({
    totalIssues: 123,
    byCategory: [
      { category: "roads", count: 50 },
      { category: "schools", count: 30 },
    ],
    topWards: [
      { wardId: "15", issues: 20 },
      { wardId: "7", issues: 18 },
    ],
  });
});

/**
 * GET /hotspots
 * Get geographic hotspots of high-priority issues.
 */
app.get("/hotspots", (req, res) => {
  // TODO: Query Firestore or BigQuery for real hotspot data
  return res.json({
    hotspots: [
      {
        wardId: "15",
        latitude: 8.5241,
        longitude: 76.9366,
        category: "roads",
        count: 10,
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Civora backend running on http://localhost:${PORT}`);
});
