/**
 * Speech-to-Text Adapter
 *
 * Provides audio transcription using Google Cloud Speech-to-Text.
 * Runs in stub mode by default.
 */

async function transcribeAudio(audioUrl, language) {
  if (!audioUrl) {
    return {
      transcript: "",
      provider: "stub",
      skipped: true,
    };
  }

  // TODO: Implement Google Cloud Speech-to-Text
  // const speech = require("@google-cloud/speech");
  // const client = new speech.SpeechClient();
  // const [response] = await client.recognize({
  //   config: { languageCode: language || "en-US" },
  //   audio: { uri: audioUrl },
  // });
  // const transcript = response.results
  //   .map(r => r.alternatives[0].transcript)
  //   .join("\n");

  return {
    transcript: "",
    provider: "stub",
    skipped: true,
  };
}

module.exports = { transcribeAudio };
