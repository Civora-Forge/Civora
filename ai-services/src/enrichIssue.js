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

function logStep(message, details) {
  if (details) {
    console.log(`[enrichIssue] ${message}`, details);
    return;
  }

  console.log(`[enrichIssue] ${message}`);
}

function makeEmptySpeechResult(language) {
  return {
    transcript: "",
    language: language || "en",
    confidence: 0,
  };
}

function makeEmptyTranslationResult(text, language) {
  return {
    language: language || "en",
    translatedText: text || "",
    originalText: text || "",
  };
}

function makeEmptyVisionResult() {
  return {
    summary: "",
    objects: [],
    possibleIssue: "",
    confidence: 0,
    findings: [],
    provider: "stub",
    skipped: true,
  };
}

async function enrichIssue(rawIssue) {
  const safeIssue = rawIssue && typeof rawIssue === "object" ? rawIssue : {};
  const text = typeof safeIssue.text === "string" ? safeIssue.text : "";
  const language = typeof safeIssue.language === "string" ? safeIssue.language : "en";
  const photoUrl = typeof safeIssue.photoUrl === "string" ? safeIssue.photoUrl : "";
  const audioUrl = typeof safeIssue.audioUrl === "string" ? safeIssue.audioUrl : "";
  const categoryHint = typeof safeIssue.categoryHint === "string" ? safeIssue.categoryHint : "";

  logStep(`starting pipeline (audio=${audioUrl ? "yes" : "no"}, image=${photoUrl ? "yes" : "no"}, language=${language || "unknown"})`);

  let speechResult = makeEmptySpeechResult(language);
  let enrichedText = text;

  if (audioUrl) {
    logStep("speech step starting");
    speechResult = await transcribeAudio(audioUrl, language);
    if (speechResult.transcript) {
      enrichedText = `${text} ${speechResult.transcript}`.trim();
    }
    logStep("speech step completed", { hasTranscript: Boolean(speechResult.transcript) });
  } else {
    logStep("speech step skipped (no audio)");
  }

  let translationResult = makeEmptyTranslationResult(enrichedText, language);
  const shouldTranslate = Boolean(enrichedText.trim()) && language.toLowerCase() !== "en";

  if (shouldTranslate) {
    logStep("translation step starting");
    translationResult = await translateToEnglish(enrichedText, language);
    logStep("translation step completed", { detectedLanguage: translationResult.language || language });
  } else {
    logStep("translation step skipped", { reason: !enrichedText.trim() ? "no_text" : "already_english" });
  }

  const textForClassification = translationResult.translatedText || enrichedText;

  let visionResult = makeEmptyVisionResult();
  if (photoUrl) {
    logStep("vision step starting");
    visionResult = await analyzeIssuePhoto(photoUrl);
    logStep("vision step completed", { hasSummary: Boolean(visionResult.summary), objectCount: (visionResult.objects || []).length });
  } else {
    logStep("vision step skipped (no image)");
  }

  logStep("classification step starting");
  const classificationInput = {
    translatedText: textForClassification,
    imageSummary: visionResult.summary || "",
    categoryHint,
  };
  const classificationResult = await classifyIssueWithGemini(classificationInput);
  logStep("classification step completed", {
    category: classificationResult.category || classificationResult.finalCategory || categoryHint || "roads",
    confidence: classificationResult.confidence || 0,
  });

  const finalCategory = classificationResult.category || classificationResult.finalCategory || categoryHint || "roads";
  const finalSummary = classificationResult.summary || classificationResult.projectTitle || "Civic improvement project";
  const finalTheme = classificationResult.issueTheme || "";

  const enrichedIssue = {
    finalCategory,
    severity: classificationResult.severity || "medium",
    projectTitle: finalSummary,
    issueTheme: finalTheme,
    priorityScore: 0.5,
    wardId: safeIssue.wardId || "15",
    aiSignals: {
      speechTranscript: speechResult.transcript || "",
      speechLanguage: speechResult.language || language,
      speechConfidence: speechResult.confidence || 0,
      translatedText: translationResult.translatedText !== enrichedText ? translationResult.translatedText : "",
      detectedLanguage: translationResult.detectedLanguage || language,
      imageSummary: visionResult.summary || "",
      imageObjects: visionResult.objects || [],
      imagePossibleIssue: visionResult.possibleIssue || "",
      imageConfidence: visionResult.confidence || 0,
      photoFindings: visionResult.findings || [],
      classificationConfidence: classificationResult.confidence || 0,
      modelProvider: classificationResult.provider || "stub",
    },
    classification: {
      category: finalCategory,
      subcategory: classificationResult.subcategory || "general",
      severity: classificationResult.severity || "medium",
      summary: finalSummary,
      confidence: classificationResult.confidence || 0,
      issueTheme: finalTheme,
    },
  };

  logStep("pipeline completed", { finalCategory, severity: enrichedIssue.severity });
  return enrichedIssue;
}

module.exports = { enrichIssue };
