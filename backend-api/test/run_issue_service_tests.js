const assert = require("assert");

process.chdir(__dirname + "/../");

function loadModuleWithStubs(stubs) {
  const issueServicePath = require.resolve("../src/services/issueService");
  const aiClientPath = require.resolve("../src/services/aiClient");
  const repositoryPath = require.resolve("../src/repositories/issueRepository");

  delete require.cache[issueServicePath];
  delete require.cache[aiClientPath];
  delete require.cache[repositoryPath];

  if (stubs.aiClient) {
    require.cache[aiClientPath] = {
      id: aiClientPath,
      filename: aiClientPath,
      loaded: true,
      exports: { enrichIssue: stubs.aiClient },
    };
  }

  if (stubs.repository) {
    require.cache[repositoryPath] = {
      id: repositoryPath,
      filename: repositoryPath,
      loaded: true,
      exports: { getRepository: () => stubs.repository },
    };
  }

  return require("../src/services/issueService");
}

function createFakeRepository() {
  const issues = [];
  let nextId = 1;

  return {
    issues,
    async addIssue(issue) {
      const stored = { id: issue.id || `issue_${nextId++}`, ...issue };
      issues.push(stored);
      return stored;
    },
    async getAllIssues() {
      return issues;
    },
    async getIssueById(id) {
      return issues.find((issue) => issue.id === id);
    },
    async clearIssues() {
      issues.length = 0;
      nextId = 1;
    },
  };
}

async function testAiClientNormalization() {
  const aiClientPath = require.resolve("../src/services/aiClient");
  const aiServicesPath = require.resolve("../../ai-services/src/enrichIssue");

  delete require.cache[aiClientPath];
  delete require.cache[aiServicesPath];

  require.cache[aiServicesPath] = {
    id: aiServicesPath,
    filename: aiServicesPath,
    loaded: true,
    exports: {
      enrichIssue: async () => ({
        finalCategory: "roads",
        severity: "high",
        projectTitle: "Repair damaged road",
        priorityScore: 0.88,
        wardId: "15",
        classification: {
          category: "roads",
          subcategory: "pothole",
          severity: "high",
          summary: "Repair damaged road",
          confidence: 0.88,
        },
        aiSignals: {
          speechTranscript: "voice note",
          speechLanguage: "ml",
          speechConfidence: 0.91,
          translatedText: "translated text",
          detectedLanguage: "ml",
          imageSummary: "Damaged road surface",
          imageObjects: ["road", "pothole"],
          imagePossibleIssue: "pothole",
          imageConfidence: 0.9,
          photoFindings: ["road", "pothole"],
          classificationConfidence: 0.88,
          modelProvider: "gemini",
        },
      }),
    },
  };

  const { enrichIssue } = require("../src/services/aiClient");
  const result = await enrichIssue({ text: "Road damage", language: "ml", categoryHint: "roads", wardId: "15" });

  assert.strictEqual(result.finalCategory, "roads", "aiClient: finalCategory mismatch");
  assert.strictEqual(result.classification.subcategory, "pothole", "aiClient: subcategory mismatch");
  assert.strictEqual(result.aiSignals._provider, "gemini", "aiClient: provider mismatch");
  assert(typeof result.aiSignals._elapsedMs === "number", "aiClient: elapsedMs should be a number");
}

async function testIssueSubmissionPreservesFields() {
  const fakeRepo = createFakeRepository();
  const service = loadModuleWithStubs({
    repository: fakeRepo,
    aiClient: async (rawIssue) => ({
      finalCategory: "sanitation",
      severity: "high",
      projectTitle: "Clear blocked drain",
      priorityScore: 0.73,
      wardId: rawIssue.wardId,
      classification: {
        category: "sanitation",
        subcategory: "drain",
        severity: "high",
        summary: "Clear blocked drain",
        confidence: 0.93,
      },
      aiSignals: {
        speechTranscript: "",
        speechLanguage: rawIssue.language,
        speechConfidence: 0,
        translatedText: "blockage in drain",
        detectedLanguage: rawIssue.language,
        imageSummary: "Drain blocked by waste",
        imageObjects: ["drain", "trash"],
        imagePossibleIssue: "blocked drain",
        imageConfidence: 0.93,
        photoFindings: ["drain", "trash"],
        classificationConfidence: 0.93,
        modelProvider: "gemini",
      },
    }),
  });

  const rawIssue = {
    text: "Drain is blocked near the market",
    language: "en",
    photoUrl: "https://example.com/photo.jpg",
    audioUrl: "",
    latitude: 8.5241,
    longitude: 76.9366,
    createdAt: new Date().toISOString(),
    categoryHint: "sanitation",
    wardId: "21",
  };

  const response = await service.submitIssue(rawIssue);
  const stored = fakeRepo.issues[fakeRepo.issues.length - 1];

  assert.strictEqual(response.issueId, stored.id, "submitIssue: issueId mismatch");
  assert.strictEqual(stored.text, rawIssue.text, "submitIssue: text should be preserved");
  assert.strictEqual(stored.photoUrl, rawIssue.photoUrl, "submitIssue: photoUrl should be preserved");
  assert.strictEqual(stored.audioUrl, rawIssue.audioUrl, "submitIssue: audioUrl should be preserved");
  assert.strictEqual(stored.finalCategory, "sanitation", "submitIssue: finalCategory mismatch");
  assert.strictEqual(stored.projectTitle, "Clear blocked drain", "submitIssue: projectTitle mismatch");
  assert.strictEqual(stored.classification.subcategory, "drain", "submitIssue: classification should be stored");
  assert.strictEqual(stored.aiSignals.imageSummary, "Drain blocked by waste", "submitIssue: aiSignals should be stored");
  assert.strictEqual(stored.aiPriorityScore, 0.73, "submitIssue: aiPriorityScore should use AI score");
  assert.strictEqual(typeof stored.priorityScore, "number", "submitIssue: priorityScore should be calculated");
}

async function run() {
  let failures = 0;

  try {
    await testAiClientNormalization();
    console.log("[PASS] backend aiClient normalization");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] backend aiClient normalization:", err.message);
  }

  try {
    await testIssueSubmissionPreservesFields();
    console.log("[PASS] backend issue submission preserves fields");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] backend issue submission preserves fields:", err.message);
  }

  if (failures > 0) {
    console.error(`${failures} backend test(s) failed`);
    process.exit(1);
  }

  console.log("All backend tests passed");
  process.exit(0);
}

run().catch((err) => {
  console.error("Backend test runner error:", err && err.message ? err.message : err);
  process.exit(2);
});