const assert = require("assert");

process.chdir(__dirname + "/../");
const { classifyIssueWithGemini } = require("../src/adapters/geminiAdapter");

async function run() {
  let failures = 0;

  process.env.AI_GEMINI_MOCK = "1";

  // Normal scenario
  process.env.TEST_SCENARIO = "normal";
  const normal = await classifyIssueWithGemini({
    translatedText: "The road has a large pothole near the school.",
    imageSummary: "Image shows a pothole on a damaged road.",
    categoryHint: "roads",
  });
  try {
    assert.strictEqual(normal.category, "roads", "normal: category mismatch");
    assert.strictEqual(normal.subcategory, "pothole", "normal: subcategory mismatch");
    assert.strictEqual(normal.severity, "high", "normal: severity mismatch");
    assert.strictEqual(normal.summary, "Damaged road surface with a visible pothole", "normal: summary mismatch");
    assert.strictEqual(normal.confidence, 0.91, "normal: confidence mismatch");
    assert.strictEqual(normal.projectTitle, "Repair Pothole Near School", "normal: projectTitle mismatch");
    assert.strictEqual(normal.issueTheme, "Road Repair", "normal: issueTheme mismatch");
    console.log("[PASS] gemini normal scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] gemini normal scenario:", err.message);
  }

  // Malformed JSON
  process.env.TEST_SCENARIO = "malformed_json";
  const malformed = await classifyIssueWithGemini({
    translatedText: "Text describing a sanitation issue.",
    imageSummary: "Trash pile near the drain.",
    categoryHint: "sanitation",
  });
  try {
    assert.strictEqual(malformed.category, "sanitation", "malformed: category fallback mismatch");
    assert.strictEqual(malformed.subcategory, "general", "malformed: subcategory fallback mismatch");
    assert.strictEqual(malformed.severity, "medium", "malformed: severity fallback mismatch");
    assert.strictEqual(malformed.summary, "Classification unavailable", "malformed: summary fallback mismatch");
    assert.strictEqual(malformed.projectTitle, "Classification unavailable", "malformed: projectTitle fallback mismatch");
    assert.strictEqual(malformed.confidence, 0, "malformed: confidence fallback mismatch");
    assert.strictEqual(malformed.issueTheme, "Sanitation", "malformed: issueTheme fallback mismatch");
    console.log("[PASS] gemini malformed_json scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] gemini malformed_json scenario:", err.message);
  }

  // Invalid schema
  process.env.TEST_SCENARIO = "invalid_schema";
  const invalidSchema = await classifyIssueWithGemini({
    translatedText: "Health center roof is leaking.",
    imageSummary: "Water damage visible on ceiling.",
    categoryHint: "health",
  });
  try {
    assert.strictEqual(invalidSchema.category, "health", "invalid_schema: category fallback mismatch");
    assert.strictEqual(invalidSchema.subcategory, "general", "invalid_schema: subcategory fallback mismatch");
    assert.strictEqual(invalidSchema.summary, "Classification unavailable", "invalid_schema: summary fallback mismatch");
    assert.strictEqual(invalidSchema.projectTitle, "Classification unavailable", "invalid_schema: projectTitle fallback mismatch");
    assert.strictEqual(invalidSchema.confidence, 0, "invalid_schema: confidence fallback mismatch");
    assert.strictEqual(invalidSchema.issueTheme, "Primary Healthcare", "invalid_schema: issueTheme fallback mismatch");
    console.log("[PASS] gemini invalid_schema scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] gemini invalid_schema scenario:", err.message);
  }

  // API failure
  process.env.TEST_SCENARIO = "api_failure";
  const apiFailure = await classifyIssueWithGemini({
    translatedText: "Road collapse reported by residents.",
    imageSummary: "Collapsed shoulder near the intersection.",
    categoryHint: "roads",
  });
  try {
    assert.strictEqual(apiFailure.category, "roads", "api_failure: category fallback mismatch");
    assert.strictEqual(apiFailure.subcategory, "general", "api_failure: subcategory fallback mismatch");
    assert.strictEqual(apiFailure.summary, "Classification unavailable", "api_failure: summary fallback mismatch");
    assert.strictEqual(apiFailure.projectTitle, "Classification unavailable", "api_failure: projectTitle fallback mismatch");
    assert.strictEqual(apiFailure.confidence, 0, "api_failure: confidence fallback mismatch");
    assert.strictEqual(apiFailure.issueTheme, "Road Repair", "api_failure: issueTheme fallback mismatch");
    console.log("[PASS] gemini api_failure scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] gemini api_failure scenario:", err.message);
  }

  if (failures > 0) {
    console.error(`${failures} gemini test(s) failed`);
    process.exit(1);
  }

  console.log("All gemini tests passed");
  process.exit(0);
}

run().catch((err) => {
  console.error("Gemini test runner error:", err && err.message ? err.message : err);
  process.exit(2);
});
