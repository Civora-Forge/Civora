/**
 * Speech-to-Text Adapter
 *
 * Provides audio transcription using Google Cloud Speech-to-Text.
 * Runs in stub mode by default.
 */
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const DEFAULT_TIMEOUT_MS = process.env.SPEECH_TO_TEXT_TIMEOUT_MS
  ? parseInt(process.env.SPEECH_TO_TEXT_TIMEOUT_MS, 10)
  : 10000;
const DEFAULT_RETRIES = process.env.SPEECH_TO_TEXT_RETRIES
  ? parseInt(process.env.SPEECH_TO_TEXT_RETRIES, 10)
  : 2;

function isBuffer(obj) {
  return obj && Buffer.isBuffer(obj);
}

async function readRemoteToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function timeoutPromise(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout_${ms}`)), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((err) => {
        clearTimeout(t);
        reject(err);
      });
  });
}

function makeResult(transcript, languageOut, confidence) {
  return {
    transcript: transcript || "",
    language: languageOut || "",
    confidence: typeof confidence === "number" ? confidence : 0.0,
  };
}

async function callGoogleSpeech(buffer, language, speechClient) {
  // Use the Google Cloud Speech client if available
  // We avoid hard dependency in dev by supporting a mock client via env for tests
  const client = speechClient || (() => {
    try {
      // eslint-disable-next-line global-require
      const Speech = require("@google-cloud/speech");
      return new Speech.SpeechClient();
    } catch (err) {
      throw new Error("google_speech_client_unavailable");
    }
  })();

  // Prepare request
  const audioBytes = buffer.toString("base64");
  const request = {
    audio: { content: audioBytes },
    config: {
      languageCode: language || "en-US",
      enableAutomaticPunctuation: true,
      // Let service auto-detect encoding/sample rate
      // If needed, callers can extend this adapter to provide specifics
    },
  };

  // call recognize
  const [response] = await client.recognize(request);

  if (!response || !response.results) {
    return makeResult("", language, 0.0);
  }

  const transcript = response.results
    .map((r) => (r.alternatives && r.alternatives[0] ? r.alternatives[0].transcript : ""))
    .join("\n");
  const confs = response.results
    .map((r) => (r.alternatives && r.alternatives[0] ? r.alternatives[0].confidence || 0 : 0));
  const avgConf = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0;

  return makeResult(transcript, language || "", avgConf);
}

async function transcribeAudio(audioInput, language) {
  // Accepts: Buffer, local file path, http(s) URL, gs:// GCS URI
  if (!audioInput) {
    return makeResult("", language || "", 0.0);
  }

  let buffer;

  try {
    if (isBuffer(audioInput)) {
      buffer = audioInput;
    } else if (typeof audioInput === "string") {
      const s = audioInput;
      if (s.startsWith("gs://")) {
        // Long-running recognition for GCS URIs is more appropriate, but for
        // simplicity we'll signal that direct GCS URIs are not supported in this
        // runtime adapter unless the project uses the official client directly.
        throw new Error("gcs_uri_not_supported_in_local_mode");
      }

      if (s.startsWith("http://") || s.startsWith("https://")) {
        buffer = await readRemoteToBuffer(s);
      } else {
        // local file path
        const full = path.resolve(s);
        buffer = fs.readFileSync(full);
      }
    } else {
      throw new Error("unsupported_audio_input_type");
    }
  } catch (err) {
    console.error("transcribeAudio: failed to read audio input:", err && err.message ? err.message : err);
    return makeResult("", language || "", 0.0);
  }

  const maxAttempts = DEFAULT_RETRIES + 1;
  let attempt = 0;
  let lastError = null;

  // Allow tests to inject a mock client from a test path
  let mockClient = null;
  if (process.env.AI_SPEECH_MOCK === "1") {
    try {
      // require test mock relative to ai-services/src/adapters
      // path: ai-services/test/mocks/mockSpeechClient.js
      // eslint-disable-next-line global-require
      const Mock = require("../../test/mocks/mockSpeechClient");
      mockClient = new Mock.MockSpeechClient();
    } catch (err) {
      console.warn("transcribeAudio: mock requested but unavailable", err && err.message);
    }
  }

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const work = callGoogleSpeech(buffer, language, mockClient);
      const result = await timeoutPromise(work, DEFAULT_TIMEOUT_MS);
      return result;
    } catch (err) {
      lastError = err;
      // If timeout, break early
      if (err && err.message && err.message.startsWith("timeout_")) {
        console.warn(`transcribeAudio: attempt=${attempt} timed out (${err.message})`);
        // continue to retry unless we've exhausted attempts
      } else if (err && err.message === "google_speech_client_unavailable") {
        console.warn("transcribeAudio: Google Speech client unavailable, running in stub mode");
        return makeResult("", language || "", 0.0);
      } else {
        console.warn(`transcribeAudio: attempt=${attempt} failed: ${err && err.message}`);
      }

      if (attempt < maxAttempts) {
        // exponential backoff
        const backoff = 200 * Math.pow(2, attempt - 1);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
    }
  }

  console.error("transcribeAudio: all attempts failed", lastError && lastError.message ? lastError.message : lastError);
  return makeResult("", language || "", 0.0);
}

module.exports = { transcribeAudio };

module.exports = { transcribeAudio };
