const assert = require("assert");

process.chdir(__dirname + "/../");
const { translateToEnglish } = require("../src/adapters/translationAdapter");

async function run() {
  let failures = 0;

  process.env.AI_TRANSLATION_MOCK = "1";

  // Normal
  process.env.TEST_SCENARIO = "normal";
  const normal = await translateToEnglish("ഒരു പരീക്ഷണ വാചകം", null);
  try {
    assert.strictEqual(normal.language, "ml", "normal: detected language");
    assert.strictEqual(normal.translatedText, "hello", "normal: translated text");
    assert.strictEqual(normal.originalText, "ഒരു പരീക്ഷണ വാചകം", "normal: original text");
    console.log("[PASS] translation normal");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] translation normal:", err.message);
  }

  // Detect failure
  process.env.TEST_SCENARIO = "detect_failure";
  const detectFail = await translateToEnglish("text", null);
  try {
    // should fall back to returning original text
    assert.strictEqual(detectFail.translatedText, "text", "detect_failure: fallback to original");
    console.log("[PASS] translation detect_failure");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] translation detect_failure:", err.message);
  }

  // Translate failure
  process.env.TEST_SCENARIO = "translate_failure";
  const transFail = await translateToEnglish("texto", null);
  try {
    assert.strictEqual(transFail.translatedText, "texto", "translate_failure: fallback to original");
    console.log("[PASS] translation translate_failure");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] translation translate_failure:", err.message);
  }

  // Timeout
  process.env.TEST_SCENARIO = "timeout";
  process.env.TRANSLATION_TIMEOUT_MS = "50";
  const start = Date.now();
  const timed = await translateToEnglish("hola", null);
  const elapsed = Date.now() - start;
  try {
    assert.strictEqual(timed.translatedText, "hola", "timeout: fallback to original");
    assert(elapsed < 5000, "timeout: took too long");
    console.log("[PASS] translation timeout (elapsed=" + elapsed + "ms)");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] translation timeout:", err.message);
  }

  if (failures > 0) {
    console.error(`${failures} translation test(s) failed`);
    process.exit(1);
  }

  console.log("All translation tests passed");
  process.exit(0);
}

run().catch((err) => {
  console.error("Translation test runner error:", err && err.message ? err.message : err);
  process.exit(2);
});
