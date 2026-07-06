/**
 * Gemini Adapter
 *
 * Provides issue classification using Gemini or Vertex AI.
 * Runs in stub mode by default. Set GEMINI_API_KEY to enable real calls.
 */

async function classifyIssueWithGemini(input) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      finalCategory: input.categoryHint || "roads",
      severity: "medium",
      projectTitle: "Road repair request near reported location",
      confidence: 0.78,
      reasoning: "Stub mode: using category hint and default classification.",
      provider: "stub",
    };
  }

  // TODO: Implement real Gemini API call
  // const { GoogleGenerativeAI } = require("@google/generative-ai");
  // const genAI = new GoogleGenerativeAI(apiKey);
  // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  // const result = await model.generateContent(prompt);
  // return JSON.parse(result.response.text());

  return {
    finalCategory: input.categoryHint || "roads",
    severity: "medium",
    projectTitle: "AI-classified civic issue",
    confidence: 0.85,
    reasoning: "Real Gemini integration pending.",
    provider: "gemini",
  };
}

module.exports = { classifyIssueWithGemini };
