/**
 * Civora AI Enrichment Service
 *
 * Orchestrates issue enrichment through adapter layers.
 * Supports stub mode (default) and real Google AI when configured.
 */

const { classifyIssueWithGemini } = require("./adapters/geminiAdapter");
const { translateToEnglish } = require("./adapters/translationAdapter");
const { transcribeAudio } = require("./adapters/speechToTextAdapter");
const { analyzeIssuePhoto } = require("./adapters/visionAdapter");

async function enrichIssue(rawIssue) {
  const text = rawIssue.text || "";
  const language = rawIssue.language || "en";
  const photoUrl = rawIssue.photoUrl || "";
  const audioUrl = rawIssue.audioUrl || "";
  const categoryHint = rawIssue.categoryHint || "";

  // Step 1: Transcribe audio if provided
  const audioResult = await transcribeAudio(audioUrl, language);
  let enrichedText = text;
  if (audioResult.transcript) {
    enrichedText = `${text} ${audioResult.transcript}`.trim();
  }

  // Step 2: Translate to English if needed
  const translationResult = await translateToEnglish(enrichedText, language);
  const textForClassification = translationResult.translatedText || enrichedText;

  // Step 3: Analyze photo if provided
  const visionResult = await analyzeIssuePhoto(photoUrl);

  // Step 4: Classify using Gemini
  const classificationInput = {
    translatedText: textForClassification,
    imageSummary: visionResult.summary || "",
    categoryHint,
  };
  const classificationResult = await classifyIssueWithGemini(classificationInput);

  return {
    finalCategory: classificationResult.category || classificationResult.finalCategory || categoryHint || "roads",
    severity: classificationResult.severity || "medium",
    projectTitle: classificationResult.summary || classificationResult.projectTitle || "Civic improvement project",
    priorityScore: 0.5,
    wardId: rawIssue.wardId || "15",
    aiSignals: {
      translatedText: translationResult.translatedText !== enrichedText ? translationResult.translatedText : "",
      detectedLanguage: translationResult.detectedLanguage || language,
      photoFindings: visionResult.findings || [],
      classificationConfidence: classificationResult.confidence || 0,
      modelProvider: classificationResult.provider || (process.env.GEMINI_API_KEY ? "gemini" : "stub"),
    },
  };
}

module.exports = { enrichIssue };
