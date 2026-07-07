/**
 * Issue Classification Prompt for Gemini
 *
 * This prompt template is used to classify civic issues into categories
 * and estimate severity using Gemini or Vertex AI.
 */

function buildClassificationPrompt(translatedText, imageSummary = "", categoryHint = "") {
  return `You are a civic issue classifier for a local government system.

Classify the following citizen report into one of these categories:
- roads: road damage, potholes, street lighting, traffic
- schools: school infrastructure, education facilities
- health: health centers, medical facilities, public health
- sanitation: waste management, drainage, water supply
- livelihood: employment, markets, agriculture, fisheries
- other: anything else

Use the optional image summary as supporting evidence when present.
Use the category hint as a weak prior, not as a certainty.

Return ONLY valid JSON with this exact structure:
{
  "category": "roads",
  "subcategory": "pothole",
  "severity": "medium",
  "summary": "Road contains multiple potholes causing unsafe travel",
  "projectTitle": "Repair Road Near Bus Stand",
  "confidence": 0.85,
  "issueTheme": "Road Repair",
  "reasoning": "Brief explanation of classification."
}

The "summary" field is a brief description of the issue.
The "projectTitle" field is a short, actionable development work label (e.g. "Repair Road Near Bus Stand", "Install Street Lights on Main Road"). It must be different from summary.
The "issueTheme" field must be a short, normalized label representing the recurring development need. Choose from one of these standard themes or create a concise equivalent:
- Road Repair
- School Infrastructure
- Primary Healthcare
- Water Supply
- Drainage Improvement
- Street Lighting
- Waste Management
- Sanitation
- Public Health
- Livelihood Support
- Traffic Management
- Other

Do not include chain-of-thought. Do not include markdown or code fences. Only return the JSON.

Citizen report:
"${translatedText}"

Optional image summary:
"${imageSummary}"

Category hint:
"${categoryHint}"`;
}

module.exports = { buildClassificationPrompt };
