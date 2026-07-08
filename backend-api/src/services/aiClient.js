/**
 * aiClient
 *
 * Wraps the ai-services `enrichIssue` function with timeouts, logging, and
 * safe fallbacks so the backend remains responsive if AI enrichment fails.
 *
 * TODO: The relative import path below is fragile. Once the monorepo adopts
 * npm workspaces or a bundler, replace with a proper package reference
 * (e.g. `require("civora-ai-services")`).
 */

const { env } = require("../config/env");

let enrichIssueImpl;
try {
  enrichIssueImpl = require("../../../ai-services/src/enrichIssue").enrichIssue;
} catch (err) {
  console.warn("aiClient: could not load ai-services/enrichIssue, using built-in fallback.", err.message);
  enrichIssueImpl = null;
}

const DEFAULT_TIMEOUT_MS = env.AI_ENRICHMENT_TIMEOUT_MS || 3000;

function makeClassification(rawIssue) {
  const category = rawIssue && rawIssue.categoryHint ? rawIssue.categoryHint : "roads";

  return {
    category,
    subcategory: "general",
    severity: "medium",
    summary: DEFAULT_PROJECT_TITLE[category] || DEFAULT_PROJECT_TITLE.other,
    confidence: 0,
  };
}

const DEFAULT_PROJECT_TITLE = {
  roads: "Road repair request",
  schools: "School infrastructure request",
  health: "Health service improvement request",
  sanitation: "Sanitation improvement request",
  livelihood: "Livelihood support request",
  other: "Civic improvement request",
};

function deriveProjectTitle(text, category) {
  if (typeof text === "string") {
    const lower = text.toLowerCase();
    if (lower.includes("pothole")) return "Repair pothole near reported location";
    if (lower.includes("streetlight") || lower.includes("street light")) return "Restore streetlights near reported location";
    if (lower.includes("water")) return "Restore local water supply";
  }
  return DEFAULT_PROJECT_TITLE[category] || DEFAULT_PROJECT_TITLE.other;
}

function deriveClusterSummary(text) {
  if (typeof text === "string" && text.trim()) {
    const short = text.trim().substring(0, 80);
    return `Citizen report highlights: ${short}`;
  }
  return "Report submitted successfully.";
}

function makeFallback(rawIssue, meta = {}) {
  const classification = makeClassification(rawIssue);
  const category = classification.category;
  const text = rawIssue && typeof rawIssue.text === "string" ? rawIssue.text : "";

  return {
    finalCategory: category,
    severity: classification.severity,
    projectTitle: deriveProjectTitle(text, category),
    issueTheme: deriveThemeFromCategory(category),
    recommendedDepartment: deriveDepartmentFromCategory(category),
    clusterSummary: deriveClusterSummary(text),
    priorityScore: 0.5,
    wardId: (rawIssue && rawIssue.wardId) || "15",
    classification,
    aiSignals: {
      speechTranscript: "",
      speechLanguage: (rawIssue && rawIssue.language) || "unknown",
      speechConfidence: 0,
      translatedText: "",
      detectedLanguage: (rawIssue && rawIssue.language) || "unknown",
      imageSummary: "",
      imageObjects: [],
      imagePossibleIssue: "",
      imageConfidence: 0,
      photoFindings: [],
      classificationConfidence: 0,
      modelProvider: "fallback",
      _meta: meta,
    },
  };
}

function deriveThemeFromCategory(category) {
  switch (category) {
    case "roads": return "Road Repair";
    case "schools": return "School Infrastructure";
    case "health": return "Health Access";
    case "sanitation": return "Sanitation";
    case "livelihood": return "Livelihood Support";
    default: return "Civic Improvement";
  }
}

function deriveDepartmentFromCategory(category) {
  switch (category) {
    case "roads": return "Public Works Department";
    case "schools": return "Education Department";
    case "health": return "Health Department";
    case "sanitation": return "Sanitation Department";
    case "livelihood": return "Local Development Office";
    default: return "Constituency Development Office";
  }
}

function normalizeResult(result, rawIssue) {
  const classification = result && result.classification ? result.classification : makeClassification(rawIssue);
  const category = rawIssue && rawIssue.categoryHint ? rawIssue.categoryHint : "roads";
  const text = rawIssue && typeof rawIssue.text === "string" ? rawIssue.text : "";
  const finalCategory = result && (result.finalCategory || result.category) ? (result.finalCategory || result.category) : classification.category;
  const severity = result && result.severity ? result.severity : classification.severity;

  const rawTitle = result && (result.projectTitle || result.summary) ? (result.projectTitle || result.summary) : "";
  const projectTitle = rawTitle && rawTitle !== "Classification unavailable"
    ? rawTitle
    : deriveProjectTitle(text, finalCategory || category);

  const rawSummary = result && result.clusterSummary ? result.clusterSummary : "";
  const clusterSummary = rawSummary && rawSummary !== "Classification unavailable"
    ? rawSummary
    : deriveClusterSummary(text);

  const normalized = {
    ...result,
    finalCategory,
    severity,
    projectTitle,
    clusterSummary,
    issueTheme: (result && result.issueTheme) || deriveThemeFromCategory(finalCategory || category),
    recommendedDepartment: (result && result.recommendedDepartment) || deriveDepartmentFromCategory(finalCategory || category),
    classification: {
      category: classification.category || finalCategory || "roads",
      subcategory: classification.subcategory || (result && result.subcategory) || "general",
      severity: classification.severity || severity || "medium",
      summary: classification.summary || projectTitle || "Civic improvement project",
      confidence: typeof classification.confidence === "number" ? classification.confidence : Number(classification.confidence) || 0,
    },
  };

  if (!normalized.aiSignals) {
    normalized.aiSignals = {};
  }

  normalized.aiSignals.speechTranscript = normalized.aiSignals.speechTranscript || "";
  normalized.aiSignals.speechLanguage = normalized.aiSignals.speechLanguage || (rawIssue && rawIssue.language) || "unknown";
  normalized.aiSignals.speechConfidence = typeof normalized.aiSignals.speechConfidence === "number" ? normalized.aiSignals.speechConfidence : 0;
  normalized.aiSignals.imageSummary = normalized.aiSignals.imageSummary || "";
  normalized.aiSignals.imageObjects = Array.isArray(normalized.aiSignals.imageObjects) ? normalized.aiSignals.imageObjects : [];
  normalized.aiSignals.imagePossibleIssue = normalized.aiSignals.imagePossibleIssue || "";
  normalized.aiSignals.imageConfidence = typeof normalized.aiSignals.imageConfidence === "number" ? normalized.aiSignals.imageConfidence : 0;
  normalized.aiSignals.photoFindings = Array.isArray(normalized.aiSignals.photoFindings) ? normalized.aiSignals.photoFindings : [];
  normalized.aiSignals.classificationConfidence = typeof normalized.aiSignals.classificationConfidence === "number"
    ? normalized.aiSignals.classificationConfidence
    : normalized.classification.confidence || 0;

  return normalized;
}

async function enrichIssue(rawIssue) {
  const start = Date.now();

  if (!rawIssue || typeof rawIssue !== "object") {
    console.warn("aiClient.enrichIssue called without a valid rawIssue, returning fallback");
    return makeFallback(rawIssue, { reason: "invalid_input" });
  }

  if (!enrichIssueImpl) {
    return makeFallback(rawIssue, { reason: "ai_services_unavailable" });
  }

  try {
    // Race enrichment against a timeout.
    const enrichPromise = enrichIssueImpl(rawIssue);

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ __ai_timeout: true }), DEFAULT_TIMEOUT_MS);
    });

    const result = await Promise.race([enrichPromise, timeoutPromise]);
    const duration = Date.now() - start;

    if (result && result.__ai_timeout) {
      console.warn(`AI enrichment timed out after ${DEFAULT_TIMEOUT_MS}ms`);
      return makeFallback(rawIssue, { reason: "timeout", timeoutMs: DEFAULT_TIMEOUT_MS, durationMs: duration });
    }

    if (result && typeof result === "object") {
      const normalized = normalizeResult(result, rawIssue);
      normalized.aiSignals._elapsedMs = duration;
      normalized.aiSignals._provider = normalized.aiSignals.modelProvider || normalized.provider || normalized.aiSignals._provider || "unknown";
      normalized.aiSignals.modelProvider = normalized.aiSignals.modelProvider || normalized.aiSignals._provider;
      console.log(`AI enrichment completed in ${duration}ms (provider=${normalized.aiSignals._provider})`);
      return normalized;
    }

    console.log(`AI enrichment completed in ${duration}ms (provider=${result && result.aiSignals ? result.aiSignals._provider : 'unknown'})`);
    return makeFallback(rawIssue, { reason: "invalid_result" });
  } catch (err) {
    console.error("AI enrichment error:", err && err.message ? err.message : err);
    return makeFallback(rawIssue, { reason: "error", message: err && err.message });
  }
}

module.exports = { enrichIssue };
