const assert = require("assert");

process.chdir(__dirname + "/../");

function loadEnrichIssueWithStubs(stubs) {
  const modulePath = require.resolve("../src/enrichIssue");
  const geminiPath = require.resolve("../src/adapters/geminiAdapter");
  const translationPath = require.resolve("../src/adapters/translationAdapter");
  const speechPath = require.resolve("../src/adapters/speechToTextAdapter");
  const visionPath = require.resolve("../src/adapters/visionAdapter");

  delete require.cache[modulePath];
  delete require.cache[geminiPath];
  delete require.cache[translationPath];
  delete require.cache[speechPath];
  delete require.cache[visionPath];

  require.cache[geminiPath] = { id: geminiPath, filename: geminiPath, loaded: true, exports: { classifyIssueWithGemini: stubs.classifyIssueWithGemini } };
  require.cache[translationPath] = { id: translationPath, filename: translationPath, loaded: true, exports: { translateToEnglish: stubs.translateToEnglish } };
  require.cache[speechPath] = { id: speechPath, filename: speechPath, loaded: true, exports: { transcribeAudio: stubs.transcribeAudio } };
  require.cache[visionPath] = { id: visionPath, filename: visionPath, loaded: true, exports: { analyzeIssuePhoto: stubs.analyzeIssuePhoto } };

  return require("../src/enrichIssue").enrichIssue;
}

async function run() {
  let failures = 0;

  const callCounts = { speech: 0, translation: 0, vision: 0, gemini: 0 };
  const enrichIssue = loadEnrichIssueWithStubs({
    transcribeAudio: async (audioUrl, language) => {
      callCounts.speech += 1;
      return { transcript: "voice note", language, confidence: 0.88 };
    },
    translateToEnglish: async (text, language) => {
      callCounts.translation += 1;
      return { language: "ml", translatedText: "translated text", originalText: text };
    },
    analyzeIssuePhoto: async (photoUrl) => {
      callCounts.vision += 1;
      return {
        summary: "Pothole on the road near a drain",
        objects: ["road", "pothole", "drain"],
        possibleIssue: "pothole",
        confidence: 0.91,
        findings: ["road", "pothole", "drain"],
      };
    },
    classifyIssueWithGemini: async (input) => {
      callCounts.gemini += 1;
      return {
        category: input.categoryHint || "roads",
        subcategory: input.imageSummary ? "pothole" : "general",
        severity: "high",
        summary: input.imageSummary || input.translatedText,
        confidence: 0.94,
      };
    },
  });

  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => {
    logs.push(args.map((value) => (typeof value === "string" ? value : JSON.stringify(value))).join(" "));
  };

  try {
    // No audio, no image: skip speech and vision; skip translation for English text.
    const noMedia = await enrichIssue({
      text: "Street light is broken",
      language: "en",
      audioUrl: "",
      photoUrl: "",
      categoryHint: "roads",
      wardId: "21",
    });

    try {
      assert.strictEqual(callCounts.speech, 0, "noMedia: speech should be skipped");
      assert.strictEqual(callCounts.translation, 0, "noMedia: translation should be skipped");
      assert.strictEqual(callCounts.vision, 0, "noMedia: vision should be skipped");
      assert.strictEqual(callCounts.gemini, 1, "noMedia: classification should run once");
      assert.strictEqual(noMedia.finalCategory, "roads", "noMedia: finalCategory mismatch");
      assert.strictEqual(noMedia.projectTitle, "Street light is broken", "noMedia: projectTitle should come from classification summary");
      assert.strictEqual(noMedia.aiSignals.imageSummary, "", "noMedia: imageSummary should be empty");
      console.log("[PASS] enrichIssue no-media scenario");
    } catch (err) {
      failures += 1;
      console.error("[FAIL] enrichIssue no-media scenario:", err.message);
    }

    // Audio and image present: all stages except translation should run for English audio.
    callCounts.speech = 0;
    callCounts.translation = 0;
    callCounts.vision = 0;
    callCounts.gemini = 0;

    const full = await enrichIssue({
      text: "",
      language: "en",
      audioUrl: "https://example.com/audio.wav",
      photoUrl: "https://example.com/image.jpg",
      categoryHint: "roads",
      wardId: "15",
    });

    try {
      assert.strictEqual(callCounts.speech, 1, "full: speech should run");
      assert.strictEqual(callCounts.translation, 0, "full: translation should be skipped for English");
      assert.strictEqual(callCounts.vision, 1, "full: vision should run");
      assert.strictEqual(callCounts.gemini, 1, "full: classification should run once");
      assert.strictEqual(full.finalCategory, "roads", "full: finalCategory mismatch");
      assert.strictEqual(full.aiSignals.speechTranscript, "voice note", "full: speech transcript mismatch");
      assert.strictEqual(full.aiSignals.imageSummary, "Pothole on the road near a drain", "full: image summary mismatch");
      assert.strictEqual(full.aiSignals.photoFindings.length, 3, "full: photo findings mismatch");
      assert.strictEqual(full.classification.subcategory, "pothole", "full: subcategory mismatch");
      console.log("[PASS] enrichIssue full pipeline scenario");
    } catch (err) {
      failures += 1;
      console.error("[FAIL] enrichIssue full pipeline scenario:", err.message);
    }

    // Non-English text: translation should run when there is content.
    callCounts.speech = 0;
    callCounts.translation = 0;
    callCounts.vision = 0;
    callCounts.gemini = 0;

    const translated = await enrichIssue({
      text: "ഒരു കുഴി",
      language: "ml",
      audioUrl: "",
      photoUrl: "",
      categoryHint: "roads",
      wardId: "7",
    });

    try {
      assert.strictEqual(callCounts.speech, 0, "translated: speech should be skipped");
      assert.strictEqual(callCounts.translation, 1, "translated: translation should run");
      assert.strictEqual(callCounts.vision, 0, "translated: vision should be skipped");
      assert.strictEqual(callCounts.gemini, 1, "translated: classification should run once");
      assert.strictEqual(translated.aiSignals.translatedText, "translated text", "translated: translatedText mismatch");
      console.log("[PASS] enrichIssue translation scenario");
    } catch (err) {
      failures += 1;
      console.error("[FAIL] enrichIssue translation scenario:", err.message);
    }
  } finally {
    console.log = originalLog;
  }

  try {
    assert(logs.some((line) => line.includes("speech step skipped (no audio)")), "expected speech skip log");
    assert(logs.some((line) => line.includes("vision step skipped (no image)")), "expected vision skip log");
    assert(logs.some((line) => line.includes("pipeline completed")), "expected completion log");
    console.log("[PASS] enrichIssue logging");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] enrichIssue logging:", err.message);
  }

  if (failures > 0) {
    console.error(`${failures} enrichIssue test(s) failed`);
    process.exit(1);
  }

  console.log("All enrichIssue tests passed");
  process.exit(0);
}

run().catch((err) => {
  console.error("enrichIssue test runner error:", err && err.message ? err.message : err);
  process.exit(2);
});
