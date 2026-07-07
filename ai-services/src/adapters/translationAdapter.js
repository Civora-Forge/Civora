/**
 * Translation Adapter
 *
 * Provides text translation using Google Cloud Translation API.
 * Runs in stub mode by default. The Google Cloud dependency is lazy-loaded
 * only when real translation mode is enabled via GEMINI_API_KEY.
 */
const DEFAULT_TIMEOUT_MS = process.env.TRANSLATION_TIMEOUT_MS
  ? parseInt(process.env.TRANSLATION_TIMEOUT_MS, 10)
  : 8000;
const DEFAULT_RETRIES = process.env.TRANSLATION_RETRIES
  ? parseInt(process.env.TRANSLATION_RETRIES, 10)
  : 1;

function timeoutPromise(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout_${ms}`)), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((err) => {
        clearTimeout(t);
        reject(err);
      });
  });
}

function makeResult(language, translatedText, originalText) {
  return {
    language: language || "",
    translatedText: translatedText || "",
    originalText: originalText || "",
  };
}

// Lazy-load the Google Cloud Translate client only when real mode is active.
// In stub mode (no GEMINI_API_KEY), this is never called.
let translateClientSingleton = null;
function getTranslateClient() {
  if (translateClientSingleton) return translateClientSingleton;
  try {
    // eslint-disable-next-line global-require
    const { Translate } = require("@google-cloud/translate").v2;
    translateClientSingleton = new Translate();
    return translateClientSingleton;
  } catch (err) {
    throw new Error("google_translate_client_unavailable");
  }
}

async function callGoogleTranslate(text, sourceLanguage, client) {
  const translateClient = client || getTranslateClient();

  let detectedLanguage = sourceLanguage || "";
  if (!sourceLanguage) {
    const [detection] = await translateClient.detect(text);
    if (Array.isArray(detection)) {
      detectedLanguage = detection[0] && detection[0].language ? detection[0].language : "";
    } else if (detection && detection.language) {
      detectedLanguage = detection.language;
    }
  }

  if (!detectedLanguage) detectedLanguage = "";

  if (detectedLanguage.toLowerCase() === "en" || detectedLanguage.toLowerCase().startsWith("en")) {
    return makeResult("en", text, text);
  }

  const [translation] = await translateClient.translate(text, "en");
  const translatedText = typeof translation === "string" ? translation : (translation && translation[0]) || "";

  return makeResult(detectedLanguage, translatedText, text);
}

async function translateToEnglish(text, sourceLanguage) {
  if (!text) return makeResult(sourceLanguage || "", "", "");

  if (sourceLanguage && sourceLanguage.toLowerCase() === "en") {
    return makeResult("en", text, text);
  }

  const maxAttempts = DEFAULT_RETRIES + 1;
  let attempt = 0;
  let lastError = null;

  // allow mock injection for tests
  let mockClient = null;
  if (process.env.AI_TRANSLATION_MOCK === "1") {
    try {
      // eslint-disable-next-line global-require
      const Mock = require("../../test/mocks/mockTranslationClient");
      mockClient = new Mock.MockTranslateClient();
    } catch (err) {
      console.warn("translateToEnglish: mock requested but unavailable", err && err.message);
    }
  }

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const work = callGoogleTranslate(text, sourceLanguage, mockClient);
      const result = await timeoutPromise(work, DEFAULT_TIMEOUT_MS);
      return result;
    } catch (err) {
      lastError = err;
      if (err && err.message && err.message.startsWith("timeout_")) {
        console.warn(`translateToEnglish: attempt=${attempt} timed out (${err.message})`);
      } else if (err && err.message === "google_translate_client_unavailable") {
        console.warn("translateToEnglish: Google Translate client unavailable, returning original text");
        return makeResult(sourceLanguage || "", text, text);
      } else {
        console.warn(`translateToEnglish: attempt=${attempt} failed: ${err && err.message}`);
      }

      if (attempt < maxAttempts) {
        const backoff = 150 * Math.pow(2, attempt - 1);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
    }
  }

  console.error("translateToEnglish: all attempts failed", lastError && lastError.message ? lastError.message : lastError);
  return makeResult(sourceLanguage || "", text, text);
}

module.exports = { translateToEnglish };
