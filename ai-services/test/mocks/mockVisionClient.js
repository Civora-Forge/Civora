/**
 * Mock Vision Client for unit tests.
 * Behavior controlled by TEST_SCENARIO:
 *  - normal: returns a simple analysis
 *  - api_failure: throws an API error
 */

async function analyzeIssuePhotoMock(image) {
  const scenario = process.env.TEST_SCENARIO || "normal";

  if (scenario === "api_failure") {
    throw new Error("mock_vision_api_failure");
  }

  return {
    summary: "A damaged road with a pothole near the curb.",
    objects: ["road", "pothole", "curb"],
    possibleIssue: "pothole",
    confidence: 0.93,
    provider: "mock",
    findings: ["road", "pothole", "curb"],
    imageSource: image && image.source ? image.source : "unknown",
  };
}

module.exports = { analyzeIssuePhotoMock };
