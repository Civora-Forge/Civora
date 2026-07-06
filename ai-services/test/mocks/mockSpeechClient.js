/**
 * Mock Speech Client for unit tests.
 * Behavior controlled by environment variable TEST_SCENARIO:
 *  - normal: returns a simple transcript
 *  - invalid: simulates invalid audio error
 *  - timeout: returns a promise that never resolves (to trigger adapter timeout)
 *  - api_failure: rejects with an API error
 */

class MockSpeechClient {
  constructor() {}

  async recognize(request) {
    const scenario = process.env.TEST_SCENARIO || "normal";

    if (scenario === "timeout") {
      // never resolve
      return new Promise(() => {});
    }

    if (scenario === "invalid") {
      // simulate API returning no results
      return [{}];
    }

    if (scenario === "api_failure") {
      throw new Error("mock_api_failure");
    }

    // normal
    return [
      {
        results: [
          {
            alternatives: [
              {
                transcript: "hello world",
                confidence: 0.92,
              },
            ],
          },
        ],
      },
    ];
  }
}

module.exports = { MockSpeechClient };
