const assert = require("assert");

process.chdir(__dirname + "/../");

const { transcribeAudio } = require("../src/adapters/speechToTextAdapter");

async function run() {
  let failures = 0;

  // Normal scenario
  process.env.AI_SPEECH_MOCK = "1";
  process.env.TEST_SCENARIO = "normal";
  process.env.SPEECH_TO_TEXT_TIMEOUT_MS = "2000";
  const normal = await transcribeAudio(Buffer.from("fakeaudio"), "en-US");
  try {
    assert.strictEqual(normal.transcript, "hello world", "normal: transcript mismatch");
    assert.strictEqual(normal.language, "en-US", "normal: language mismatch");
    if (typeof normal.confidence !== "number" || normal.confidence <= 0) throw new Error("normal: confidence invalid");
    console.log("[PASS] normal scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] normal scenario:", err.message);
  }

  // Invalid audio
  process.env.TEST_SCENARIO = "invalid";
  const invalid = await transcribeAudio(Buffer.from("bad"), "en-US");
  try {
    assert.strictEqual(invalid.transcript, "", "invalid: expected empty transcript");
    assert.strictEqual(invalid.confidence, 0.0, "invalid: expected zero confidence");
    console.log("[PASS] invalid audio scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] invalid audio scenario:", err.message);
  }

  // Timeout
  process.env.TEST_SCENARIO = "timeout";
  process.env.SPEECH_TO_TEXT_TIMEOUT_MS = "50"; // small to force timeout
  const start = Date.now();
  const timed = await transcribeAudio(Buffer.from("slow"), "en-US");
  const elapsed = Date.now() - start;
  try {
    assert.strictEqual(timed.transcript, "", "timeout: expected empty transcript");
    assert(elapsed < 5000, "timeout: handler took too long");
    console.log("[PASS] timeout scenario (elapsed=" + elapsed + "ms)");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] timeout scenario:", err.message);
  }

  // API failure
  process.env.TEST_SCENARIO = "api_failure";
  process.env.SPEECH_TO_TEXT_TIMEOUT_MS = "2000";
  const apifail = await transcribeAudio(Buffer.from("apierr"), "en-US");
  try {
    assert.strictEqual(apifail.transcript, "", "api_failure: expected empty transcript");
    assert.strictEqual(apifail.confidence, 0.0, "api_failure: expected zero confidence");
    console.log("[PASS] api_failure scenario");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] api_failure scenario:", err.message);
  }

  if (failures > 0) {
    console.error(`${failures} test(s) failed`);
    process.exit(1);
  }

  console.log("All tests passed");
  process.exit(0);
}

run().catch((err) => {
  console.error("Test runner error:", err && err.message ? err.message : err);
  process.exit(2);
});
