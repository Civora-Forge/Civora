/**
 * aiClient
 *
 * Wraps the ai-services `enrichIssue` function with timeouts, logging, and
 * safe fallbacks so the backend remains responsive if AI enrichment fails.
 */

const { env } = require("../config/env");
const { enrichIssue: enrichIssueImpl } = require("../../../ai-services/src/enrichIssue");

const DEFAULT_TIMEOUT_MS = env.AI_ENRICHMENT_TIMEOUT_MS || 3000;

function makeFallback(rawIssue, meta = {}) {
  return {
    finalCategory: rawIssue && rawIssue.categoryHint ? rawIssue.categoryHint : "roads",
    severity: "medium",
    projectTitle: "Civic improvement project",
    priorityScore: 0.5,
    wardId: (rawIssue && rawIssue.wardId) || "15",
    aiSignals: {
      translatedText: "",
      detectedLanguage: (rawIssue && rawIssue.language) || "unknown",
      photoFindings: [],
      classificationConfidence: 0,
      modelProvider: "fallback",
      _meta: meta,
    },
  };
}

async function enrichIssue(rawIssue) {
  const start = Date.now();

  if (!rawIssue || typeof rawIssue !== "object") {
    console.warn("aiClient.enrichIssue called without a valid rawIssue, returning fallback");
    return makeFallback(rawIssue, { reason: "invalid_input" });
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

    // Successful result — attach timing info to aiSignals if present.
    if (result && typeof result === "object") {
      if (!result.aiSignals) result.aiSignals = {};
      result.aiSignals._elapsedMs = duration;
      result.aiSignals._provider = result.aiSignals.modelProvider || result.provider || result.aiSignals._provider || "unknown";
    }

    console.log(`AI enrichment completed in ${duration}ms (provider=${result.aiSignals?result.aiSignals._provider:'unknown'})`);
    return result;
  } catch (err) {
    console.error("AI enrichment error:", err && err.message ? err.message : err);
    return makeFallback(rawIssue, { reason: "error", message: err && err.message });
  }
}

module.exports = { enrichIssue };
