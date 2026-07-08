const env = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || "development",
  ISSUE_REPOSITORY: process.env.ISSUE_REPOSITORY || "memory",
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT || "",
  FIRESTORE_DATABASE_ID: process.env.FIRESTORE_DATABASE_ID || "(default)",
  ENABLE_AI_ENRICHMENT: process.env.ENABLE_AI_ENRICHMENT === "true",
  ENABLE_BIGQUERY_EXPORT: process.env.ENABLE_BIGQUERY_EXPORT === "true",
  ENABLE_DEV_ROUTES: process.env.ENABLE_DEV_ROUTES === "true",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  AI_ENRICHMENT_TIMEOUT_MS: process.env.AI_ENRICHMENT_TIMEOUT_MS
    ? parseInt(process.env.AI_ENRICHMENT_TIMEOUT_MS, 10)
    : 8000,
  ENABLE_FIREBASE_AUTH: process.env.ENABLE_FIREBASE_AUTH === "true",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
};

module.exports = { env };
