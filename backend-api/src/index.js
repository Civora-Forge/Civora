const express = require("express");
const cors = require("cors");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const { env } = require("./config/env");

const issuesRouter = require("./routes/issues");
const summaryRouter = require("./routes/summary");
const hotspotsRouter = require("./routes/hotspots");

const app = express();

// CORS configuration for local development
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(requestLogger);

// Health route
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Civora backend API",
    version: "0.3.0",
    environment: env.NODE_ENV,
    repository: env.ISSUE_REPOSITORY,
    aiEnrichment: env.ENABLE_AI_ENRICHMENT ? "enabled" : "stub",
    bigqueryExport: env.ENABLE_BIGQUERY_EXPORT ? "enabled" : "disabled",
    endpoints: ["POST /issues", "GET /summary", "GET /hotspots"],
  });
});

// Mount routes
app.use("/issues", issuesRouter);
app.use("/summary", summaryRouter);
app.use("/hotspots", hotspotsRouter);

// Dev-only routes (seed/clear)
if (env.NODE_ENV !== "production") {
  const devRouter = require("./routes/dev");
  app.use("/dev", devRouter);
}

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Civora backend running on http://localhost:${env.PORT}`);
  console.log(`Repository mode: ${env.ISSUE_REPOSITORY}`);
  console.log(`AI enrichment: ${env.ENABLE_AI_ENRICHMENT ? "enabled" : "stub"}`);
  if (env.NODE_ENV !== "production") {
    console.log("Dev routes enabled: POST /dev/seed, DELETE /dev/clear");
  }
});
