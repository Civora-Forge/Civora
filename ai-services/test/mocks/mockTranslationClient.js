/**
 * Mock Translate Client for unit tests.
 * Scenarios controlled by TEST_SCENARIO:
 * - normal: detect returns 'ml' and translate returns 'hello'
 * - detect_failure: detect returns unexpected structure
 * - translate_failure: translate throws
 * - timeout: detect/translate never resolve
 */

class MockTranslateClient {
  constructor() {}

  async detect(text) {
    const scenario = process.env.TEST_SCENARIO || "normal";
    if (scenario === "timeout") return new Promise(() => {});
    if (scenario === "detect_failure") return [{}];
    return [
      {
        language: "ml",
        confidence: 0.99,
      },
    ];
  }

  async translate(text, target) {
    const scenario = process.env.TEST_SCENARIO || "normal";
    if (scenario === "timeout") return new Promise(() => {});
    if (scenario === "translate_failure") throw new Error("mock_translate_error");
    if (scenario === "detect_failure") return [text];
    return ["hello"];
  }
}

module.exports = { MockTranslateClient };
