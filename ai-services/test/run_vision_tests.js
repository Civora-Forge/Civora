const assert = require("assert");

process.chdir(__dirname + "/../");
const { analyzeIssuePhoto } = require("../src/adapters/visionAdapter");

async function run() {
  let failures = 0;

  process.env.AI_VISION_MOCK = "1";

  // Normal upload buffer
  process.env.TEST_SCENARIO = "normal";
  const normal = await analyzeIssuePhoto(Buffer.from("fakeimage"));
  try {
    assert.strictEqual(normal.summary, "A damaged road with a pothole near the curb.", "normal: summary mismatch");
    assert.deepStrictEqual(normal.objects, ["road", "pothole", "curb"], "normal: objects mismatch");
    assert.strictEqual(normal.possibleIssue, "pothole", "normal: possibleIssue mismatch");
    assert.strictEqual(normal.confidence, 0.93, "normal: confidence mismatch");
    assert.deepStrictEqual(normal.findings, ["road", "pothole", "curb"], "normal: findings mismatch");
    console.log("[PASS] vision normal scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] vision normal scenario:", err.message);
  }

  // Data URL upload
  const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2eP0EAAAAASUVORK5CYII=";
  const dataUrlResult = await analyzeIssuePhoto(dataUrl);
  try {
    assert.strictEqual(dataUrlResult.summary, "A damaged road with a pothole near the curb.", "data_url: summary mismatch");
    assert.deepStrictEqual(dataUrlResult.objects, ["road", "pothole", "curb"], "data_url: objects mismatch");
    assert.strictEqual(dataUrlResult.possibleIssue, "pothole", "data_url: possibleIssue mismatch");
    console.log("[PASS] vision data URL scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] vision data URL scenario:", err.message);
  }

  // Unsupported image type
  const unsupported = await analyzeIssuePhoto({ buffer: Buffer.from("fakeimage"), mimeType: "application/pdf", filename: "report.pdf" });
  try {
    assert.strictEqual(unsupported.error, "unsupported_image_type", "unsupported: expected unsupported_image_type");
    assert.strictEqual(unsupported.confidence, 0, "unsupported: expected zero confidence");
    assert.deepStrictEqual(unsupported.objects, [], "unsupported: expected no objects");
    console.log("[PASS] vision unsupported image scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] vision unsupported image scenario:", err.message);
  }

  // API failure
  process.env.TEST_SCENARIO = "api_failure";
  const apiFailure = await analyzeIssuePhoto(Buffer.from("fakeimage"));
  try {
    assert.strictEqual(apiFailure.error, "gemini_vision_api_failure", "api_failure: expected gemini_vision_api_failure");
    assert.strictEqual(apiFailure.confidence, 0, "api_failure: expected zero confidence");
    assert.deepStrictEqual(apiFailure.objects, [], "api_failure: expected no objects");
    console.log("[PASS] vision api_failure scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] vision api_failure scenario:", err.message);
  }

  // Missing input
  const missing = await analyzeIssuePhoto(null);
  try {
    assert.strictEqual(missing.error, "missing_image_input", "missing: expected missing_image_input");
    assert.strictEqual(missing.confidence, 0, "missing: expected zero confidence");
    console.log("[PASS] vision missing input scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] vision missing input scenario:", err.message);
  }

  if (failures > 0) {
    console.error(`${failures} vision test(s) failed`);
    process.exit(1);
  }

  console.log("All vision tests passed");
  process.exit(0);
}

run().catch((err) => {
  console.error("Vision test runner error:", err && err.message ? err.message : err);
  process.exit(2);
});
