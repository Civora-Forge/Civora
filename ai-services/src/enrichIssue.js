/**
 * Civora AI Enrichment Service
 *
 * Pure functions for issue enrichment.
 * No API routes, no database access, no frontend logic.
 */

/**
 * Enriches a raw issue with AI-derived fields.
 * @param {object} rawIssue - The raw issue from the citizen
 * @returns {object} Enriched fields: finalCategory, severity, projectTitle, priorityScore, wardId
 */
async function enrichIssue(rawIssue) {
  // TODO: Implement Google Speech-to-Text
  //   - If rawIssue.audioUrl is provided, transcribe audio to text
  //   - Append transcribed text to rawIssue.text

  // TODO: Implement Google Translation API
  //   - If rawIssue.language is not "en", translate text to English
  //   - Store original language text separately

  // TODO: Implement Gemini/Vertex AI classification
  //   - Use rawIssue.text to determine finalCategory
  //   - Generate projectTitle from classification

  // TODO: Implement severity estimation
  //   - Use text analysis, category, and location data
  //   - Return "low", "medium", or "high"

  // TODO: Implement priority scoring model
  //   - Score based on severity, frequency in area, infrastructure needs
  //   - Return float between 0.0 and 1.0

  // TODO: Implement ward mapping
  //   - Use latitude/longitude to map to wardId
  //   - Reference data-infra/firestore/schema.md for ward data

  // Stub: Return hardcoded enriched fields
  return {
    finalCategory: rawIssue.categoryHint || "roads",
    severity: "medium",
    projectTitle: "Road repair request near reported location",
    priorityScore: 0.72,
    wardId: "15",
  };
}

module.exports = { enrichIssue };
