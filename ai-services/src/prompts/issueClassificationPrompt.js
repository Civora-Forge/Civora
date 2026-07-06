/**
 * Issue Classification Prompt for Gemini
 *
 * This prompt template is used to classify civic issues into categories
 * and estimate severity using Gemini or Vertex AI.
 */

function buildClassificationPrompt(issueText) {
  return `You are a civic issue classifier for a local government system.

Classify the following citizen report into one of these categories:
- roads: road damage, potholes, street lighting, traffic
- schools: school infrastructure, education facilities
- health: health centers, medical facilities, public health
- sanitation: waste management, drainage, water supply
- livelihood: employment, markets, agriculture, fisheries
- other: anything else

Also estimate severity (low, medium, high) and generate a concise project title.

Return ONLY valid JSON with this exact structure:
{
  "finalCategory": "roads",
  "severity": "medium",
  "projectTitle": "Repair damaged road near bus stop",
  "confidence": 0.85,
  "reasoning": "Brief explanation of classification."
}

Do not include chain-of-thought. Only return the JSON.

Citizen report:
"${issueText}"`;
}

module.exports = { buildClassificationPrompt };
