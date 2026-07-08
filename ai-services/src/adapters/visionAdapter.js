/**
 * Vision Adapter
 *
 * Provides photo analysis using Gemini Multimodal or Vertex AI Vision.
 * Runs in stub mode by default.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-1.5-flash";
const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function makeFallback(summary, possibleIssue, errorCode) {
  return {
    summary: summary || "",
    objects: [],
    possibleIssue: possibleIssue || "",
    confidence: 0,
    findings: [],
    provider: "stub",
    skipped: true,
    error: errorCode || "",
  };
}

function isBuffer(value) {
  return value && Buffer.isBuffer(value);
}

function normalizeMimeType(mimeType, filename) {
  if (mimeType) {
    const lower = String(mimeType).toLowerCase();
    if (lower === "image/jpg") return "image/jpeg";
    return lower;
  }

  if (!filename) {
    return "";
  }

  const ext = path.extname(String(filename)).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "";
}

function isSupportedMimeType(mimeType) {
  return SUPPORTED_MIME_TYPES.has(mimeType);
}

function extractBase64Data(dataUrl) {
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/i);
  if (!match) {
    return null;
  }

  return {
    mimeType: normalizeMimeType(match[1]),
    data: match[2],
  };
}

async function readRemoteImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`image_fetch_failed_${response.status}`);
  }

  const mimeType = normalizeMimeType(response.headers.get("content-type") || "", url);
  if (!isSupportedMimeType(mimeType)) {
    throw new Error("unsupported_image_type");
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    mimeType,
    data: Buffer.from(arrayBuffer).toString("base64"),
    source: "remote_url",
  };
}

async function normalizeImageInput(imageInput) {
  if (!imageInput) {
    return { error: "missing_image_input" };
  }

  if (isBuffer(imageInput)) {
    return {
      mimeType: "image/jpeg",
      data: imageInput.toString("base64"),
      source: "buffer",
    };
  }

  if (typeof imageInput === "string") {
    if (imageInput.startsWith("data:")) {
      const parsed = extractBase64Data(imageInput);
      if (!parsed) {
        return { error: "unsupported_image_input" };
      }

      if (!isSupportedMimeType(parsed.mimeType)) {
        return { error: "unsupported_image_type", mimeType: parsed.mimeType };
      }

      return {
        mimeType: parsed.mimeType,
        data: parsed.data,
        source: "data_url",
      };
    }

    if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
      try {
        return await readRemoteImage(imageInput);
      } catch (err) {
        const errorCode = err && err.message === "unsupported_image_type" ? "unsupported_image_type" : "remote_image_fetch_failed";
        return { error: errorCode };
      }
    }

    const fullPath = path.resolve(imageInput);
    if (!fs.existsSync(fullPath)) {
      return { error: "image_file_not_found" };
    }

    const mimeType = normalizeMimeType("", fullPath);
    if (!isSupportedMimeType(mimeType)) {
      return { error: "unsupported_image_type", mimeType };
    }

    return {
      mimeType,
      data: fs.readFileSync(fullPath).toString("base64"),
      source: "file",
    };
  }

  if (typeof imageInput === "object") {
    if (isBuffer(imageInput.buffer)) {
      const mimeType = normalizeMimeType(imageInput.mimeType, imageInput.filename || imageInput.name);
      if (!isSupportedMimeType(mimeType)) {
        return { error: "unsupported_image_type", mimeType };
      }

      return {
        mimeType,
        data: imageInput.buffer.toString("base64"),
        source: "buffer_object",
      };
    }

    if (typeof imageInput.dataUrl === "string") {
      return normalizeImageInput(imageInput.dataUrl);
    }

    if (typeof imageInput.path === "string") {
      return normalizeImageInput(imageInput.path);
    }
  }

  return { error: "unsupported_image_input" };
}

function parseJsonResponse(text) {
  if (!text) {
    return null;
  }

  const trimmed = String(text).trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch (err) {
    return null;
  }
}

function normalizeAnalysis(parsed, fallbackSummary) {
  const objects = Array.isArray(parsed && parsed.objects)
    ? parsed.objects.filter((item) => typeof item === "string" && item.trim())
    : [];

  const summary = typeof parsed.summary === "string" && parsed.summary.trim()
    ? parsed.summary.trim()
    : fallbackSummary;
  const possibleIssue = typeof parsed.possibleIssue === "string" && parsed.possibleIssue.trim()
    ? parsed.possibleIssue.trim()
    : "";
  const confidence = typeof parsed.confidence === "number"
    ? parsed.confidence
    : Number(parsed.confidence);

  const safeConfidence = Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0;

  return {
    summary,
    objects,
    possibleIssue,
    confidence: safeConfidence,
    findings: objects,
    provider: parsed.provider || "gemini",
  };
}

async function callGeminiVision(apiKey, image, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: image.mimeType, data: image.data } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`gemini_vision_http_${response.status}${errorText ? `:${errorText}` : ""}`);
  }

  const payload = await response.json();
  const text = payload && payload.candidates && payload.candidates[0] && payload.candidates[0].content && payload.candidates[0].content.parts
    ? payload.candidates[0].content.parts.map((part) => part.text || "").join("\n")
    : "";

  return parseJsonResponse(text);
}

async function analyzeIssuePhoto(photoUrl) {
  if (!photoUrl) {
    return makeFallback("", "", "missing_image_input");
  }

  const normalizedImage = await normalizeImageInput(photoUrl);
  if (normalizedImage.error) {
    return makeFallback("", "", normalizedImage.error);
  }

  if (process.env.AI_VISION_MOCK === "1") {
    let Mock;
    try {
      // eslint-disable-next-line global-require
      Mock = require("../../test/mocks/mockVisionClient");
    } catch (err) {
      return makeFallback("", "", "mock_vision_unavailable");
    }

    try {
      const result = await Mock.analyzeIssuePhotoMock(normalizedImage);
      return normalizeAnalysis(result, "Mock vision analysis");
    } catch (err) {
      console.error("analyzeIssuePhoto: mock vision failed:", err && err.message ? err.message : err);
      return makeFallback("Vision analysis unavailable", "", "gemini_vision_api_failure");
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return makeFallback("", "", "gemini_api_key_missing");
  }

  const prompt = [
    "Analyze the uploaded civic issue image.",
    "Return only JSON with these keys:",
    '{"summary":"short scene summary","objects":["visible object labels"],"possibleIssue":"likely civic issue or empty string","confidence":0.0}',
    "Keep confidence between 0 and 1.",
    "Be concise and focus on the issue-relevant objects.",
  ].join(" ");

  try {
    const parsed = await callGeminiVision(apiKey, normalizedImage, prompt);
    if (!parsed) {
      return makeFallback("Unable to parse Gemini Vision response", "", "invalid_vision_response");
    }

    return normalizeAnalysis(parsed, "Gemini Vision analysis");
  } catch (err) {
    console.error("analyzeIssuePhoto: Gemini Vision failed:", err && err.message ? err.message : err);
    return makeFallback("Vision analysis unavailable", "", "gemini_vision_api_failure");
  }
}

module.exports = { analyzeIssuePhoto };
