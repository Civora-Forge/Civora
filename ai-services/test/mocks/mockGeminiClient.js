/**
 * Mock Gemini Client for unit tests.
 * Scenarios controlled by TEST_SCENARIO:
 * - normal: returns valid JSON wrapped in code fences
 * - malformed_json: returns non-JSON text
 * - invalid_schema: returns JSON missing required fields
 * - api_failure: throws an API error
 */

async function generateGeminiClassificationText(input, prompt) {
  const scenario = process.env.TEST_SCENARIO || "normal";

  if (scenario === "api_failure") {
    throw new Error("mock_gemini_api_failure");
  }

  if (scenario === "malformed_json") {
    return "Category is roads and this looks like a pothole.";
  }

  if (scenario === "invalid_schema") {
    return JSON.stringify({
      category: "roads",
      severity: "medium",
      summary: "Damaged road surface",
      confidence: "high",
    });
  }

  return [
    "```json",
    JSON.stringify({
      category: input && input.categoryHint ? input.categoryHint : "roads",
      subcategory: "pothole",
      severity: "high",
      summary: "Damaged road surface with a visible pothole",
      projectTitle: "Repair Pothole Near School",
      confidence: 0.91,
      issueTheme: "Road Repair",
      recommendedDepartment: "Public Works Department",
      justification: "The pothole is on a frequently used road near a school, creating a safety hazard for children and commuters. Repairing it will prevent accidents and reduce vehicle damage.",
    }),
    "```",
  ].join("\n");
}

module.exports = { generateGeminiClassificationText };