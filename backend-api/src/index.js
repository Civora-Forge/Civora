const express = require("express");
const cors = require("cors");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const { env } = require("./config/env");

const issuesRouter = require("./routes/issues");
const summaryRouter = require("./routes/summary");
const hotspotsRouter = require("./routes/hotspots");

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health route
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Civora backend API",
    version: "0.2.0",
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

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Civora backend running on http://localhost:${env.PORT}`);
  console.log(`Repository mode: ${env.ISSUE_REPOSITORY}`);
  console.log(`AI enrichment: ${env.ENABLE_AI_ENRICHMENT ? "enabled" : "stub"}`);
});
