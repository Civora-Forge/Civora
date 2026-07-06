/**
 * Translation Adapter
 *
 * Provides text translation using Google Cloud Translation API.
 * Runs in stub mode by default.
 */

async function translateToEnglish(text, sourceLanguage) {
  if (!text) {
    return {
      translatedText: "",
      detectedLanguage: sourceLanguage || "unknown",
      provider: "stub",
    };
  }

  if (sourceLanguage === "en") {
    return {
      translatedText: text,
      detectedLanguage: "en",
      provider: "stub",
    };
  }

  // TODO: Implement Google Cloud Translation API
  // const { TranslationServiceClient } = require("@google-cloud/translate");
  // const client = new TranslationServiceClient();
  // const [response] = await client.translateText({
  //   contents: [text],
  //   targetLanguageCode: "en",
  //   sourceLanguageCode: sourceLanguage,
  // });

  return {
    translatedText: text,
    detectedLanguage: sourceLanguage || "unknown",
    provider: "stub",
  };
}

module.exports = { translateToEnglish };
