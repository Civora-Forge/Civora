/**
 * Gemini Adapter
 *
 * Provides issue classification using Gemini or Vertex AI.
 * Runs in stub mode by default. Set GEMINI_API_KEY to enable real calls.
 */

const fetch = require("node-fetch");
const { buildClassificationPrompt } = require("../prompts/issueClassificationPrompt");

const DEFAULT_MODEL = process.env.GEMINI_CLASSIFICATION_MODEL || "gemini-1.5-flash";
const ALLOWED_CATEGORIES = new Set(["roads", "schools", "health", "sanitation", "livelihood", "other"]);
const ALLOWED_SEVERITIES = new Set(["low", "medium", "high"]);
const ALLOWED_THEMES = new Set([
  "road repair",
  "school infrastructure",
  "primary healthcare",
  "water supply",
  "drainage improvement",
  "street lighting",
  "waste management",
  "sanitation",
  "public health",
  "livelihood support",
  "traffic management",
  "other",
]);

const CATEGORY_THEME_MAP = {
  roads: "Road Repair",
  schools: "School Infrastructure",
  health: "Primary Healthcare",
  sanitation: "Sanitation",
  livelihood: "Livelihood Support",
};

function makeFallback(input) {
  return {
    category: normalizeCategory(input && input.categoryHint, "other"),
    subcategory: "general",
    severity: "medium",
    summary: "Classification unavailable",
    confidence: 0,
    issueTheme: deriveThemeFromCategory(input && input.categoryHint),
  };
}

function deriveThemeFromCategory(category) {
  if (typeof category !== "string") return "Other";
  const normalized = category.trim().toLowerCase();
  return CATEGORY_THEME_MAP[normalized] || "Other";
}

function normalizeCategory(value, fallback) {
  const candidates = [value, fallback, "other"];
  for (const candidate of candidates) {
    if (typeof candidate !== "string") {
      continue;
    }

    const normalized = candidate.trim().toLowerCase();
    if (ALLOWED_CATEGORIES.has(normalized)) {
      return normalized;
    }
  }

  return "other";
}

function normalizeSubcategory(value) {
  if (typeof value !== "string") {
    return "general";
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : "general";
}

function normalizeSeverity(value) {
  if (typeof value !== "string") {
    return "medium";
  }

  const normalized = value.trim().toLowerCase();
  return ALLOWED_SEVERITIES.has(normalized) ? normalized : "medium";
}

function normalizeSummary(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function toTitleCase(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeTheme(value, category) {
  if (typeof value !== "string") {
    return deriveThemeFromCategory(category);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return deriveThemeFromCategory(category);
  }

  const lowered = trimmed.toLowerCase();
  for (const theme of ALLOWED_THEMES) {
    if (theme === lowered) {
      return toTitleCase(theme);
    }
  }

  return toTitleCase(trimmed);
}

function parseJsonText(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch (err) {
    return null;
  }
}

function extractResponseText(payload) {
  const candidate = payload && payload.candidates && payload.candidates[0];
  const parts = candidate && candidate.content && Array.isArray(candidate.content.parts)
    ? candidate.content.parts
    : [];

  return parts.map((part) => (typeof part.text === "string" ? part.text : "")).join("");
}

function validateAndNormalizeResponse(parsed, input) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const category = normalizeCategory(parsed.category || parsed.finalCategory, input && input.categoryHint);
  const subcategory = normalizeSubcategory(parsed.subcategory || parsed.issueType || parsed.projectTitle);
  const severity = normalizeSeverity(parsed.severity);
  const summary = normalizeSummary(parsed.summary || parsed.projectTitle || parsed.reasoning);
  const confidence = typeof parsed.confidence === "number" ? parsed.confidence : Number(parsed.confidence);
  const issueTheme = normalizeTheme(parsed.issueTheme, category);

  if (!summary) {
    return null;
  }

  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    return null;
  }

  return {
    category,
    subcategory,
    severity,
    summary,
    confidence,
    issueTheme,
  };
}

async function fetchGeminiClassification(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`gemini_http_${response.status}${body ? `:${body}` : ""}`);
  }

  const payload = await response.json();
  return extractResponseText(payload);
}

async function classifyIssueWithGemini(input) {
  const normalizedInput = {
    translatedText: input && typeof input.translatedText === "string" ? input.translatedText : (input && typeof input.text === "string" ? input.text : ""),
    imageSummary: input && typeof input.imageSummary === "string" ? input.imageSummary : "",
    categoryHint: input && typeof input.categoryHint === "string" ? input.categoryHint : "",
  };

  const prompt = buildClassificationPrompt(
    normalizedInput.translatedText,
    normalizedInput.imageSummary,
    normalizedInput.categoryHint,
  );

  if (process.env.AI_GEMINI_MOCK === "1") {
    let Mock;
    try {
      // eslint-disable-next-line global-require
      Mock = require("../../test/mocks/mockGeminiClient");
    } catch (err) {
      console.warn("classifyIssueWithGemini: mock requested but unavailable", err && err.message ? err.message : err);
      return makeFallback(normalizedInput);
    }

    try {
      const rawText = await Mock.generateGeminiClassificationText(normalizedInput, prompt);
      const parsed = parseJsonText(rawText);
      const validated = validateAndNormalizeResponse(parsed, normalizedInput);
      return validated || makeFallback(normalizedInput);
    } catch (err) {
      console.error("classifyIssueWithGemini: mock failed:", err && err.message ? err.message : err);
      return makeFallback(normalizedInput);
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return makeFallback(normalizedInput);
  }

  try {
    const rawText = await fetchGeminiClassification(apiKey, prompt);
    const parsed = parseJsonText(rawText);
    const validated = validateAndNormalizeResponse(parsed, normalizedInput);

    if (!validated) {
      console.warn("classifyIssueWithGemini: invalid Gemini response, using fallback");
      return makeFallback(normalizedInput);
    }

    return validated;
  } catch (err) {
    console.error("classifyIssueWithGemini: Gemini API failed:", err && err.message ? err.message : err);
    return makeFallback(normalizedInput);
  }
}

module.exports = { classifyIssueWithGemini };
