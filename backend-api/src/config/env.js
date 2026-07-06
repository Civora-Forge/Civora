const env = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || "development",
  ISSUE_REPOSITORY: process.env.ISSUE_REPOSITORY || "memory",
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT || "",
  FIRESTORE_DATABASE_ID: process.env.FIRESTORE_DATABASE_ID || "(default)",
  ENABLE_AI_ENRICHMENT: process.env.ENABLE_AI_ENRICHMENT === "true",
  ENABLE_BIGQUERY_EXPORT: process.env.ENABLE_BIGQUERY_EXPORT === "true",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  AI_ENRICHMENT_TIMEOUT_MS: process.env.AI_ENRICHMENT_TIMEOUT_MS
    ? parseInt(process.env.AI_ENRICHMENT_TIMEOUT_MS, 10)
    : 3000,
};

module.exports = { env };
