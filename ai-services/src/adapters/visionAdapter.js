/**
 * Vision Adapter
 *
 * Provides photo analysis using Gemini Multimodal or Vertex AI Vision.
 * Runs in stub mode by default.
 */

async function analyzeIssuePhoto(photoUrl) {
  if (!photoUrl) {
    return {
      findings: [],
      provider: "stub",
      skipped: true,
    };
  }

  // TODO: Implement Gemini multimodal or Vertex AI Vision
  // const { GoogleGenerativeAI } = require("@google/generative-ai");
  // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  // const result = await model.generateContent([
  //   "Analyze this civic issue photo. Identify the issue type, severity, and any visible damage.",
  //   { inlineData: { mimeType: "image/jpeg", data: base64Image } }
  // ]);

  return {
    findings: [],
    provider: "stub",
    skipped: true,
  };
}

module.exports = { analyzeIssuePhoto };
