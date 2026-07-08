const express = require("express");
const cors = require("cors");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const { env } = require("./config/env");

const issuesRouter = require("./routes/issues");
const summaryRouter = require("./routes/summary");
const hotspotsRouter = require("./routes/hotspots");
const wardsRouter = require("./routes/wards");

const app = express();

// CORS configuration
// In development: allow localhost origins
// In production: allow the Vercel frontend and any origin (hackathon demo)
const isDev = env.NODE_ENV !== "production";
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
];
if (!isDev) {
  // Allow Vercel deployments (any subdomain) and the custom domain
  allowedOrigins.push(/^https:\/\/.*\.vercel\.app$/);
}
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server, mobile apps)
    if (!origin) return callback(null, true);
    // In dev, allow all localhost
    if (isDev && /^https?:\/\/localhost/.test(origin)) return callback(null, true);
    // Check exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Check regex patterns (for Vercel subdomains)
    if (allowedOrigins.some((pattern) => pattern instanceof RegExp && pattern.test(origin))) {
      return callback(null, true);
    }
    // In production, allow all origins for hackathon demo flexibility
    if (!isDev) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
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
    endpoints: ["POST /issues", "GET /summary", "GET /hotspots", "GET /wards"],
  });
});

// Mount routes
app.use("/issues", issuesRouter);
app.use("/summary", summaryRouter);
app.use("/hotspots", hotspotsRouter);
app.use("/wards", wardsRouter);

// Dev routes (seed/clear) — available in development OR when ENABLE_DEV_ROUTES=true
if (env.NODE_ENV !== "production" || env.ENABLE_DEV_ROUTES) {
  const devRouter = require("./routes/dev");
  app.use("/dev", devRouter);
}

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Civora backend running on http://localhost:${env.PORT}`);
  console.log(`Repository mode: ${env.ISSUE_REPOSITORY}`);
  console.log(`AI enrichment: ${env.ENABLE_AI_ENRICHMENT ? "enabled" : "stub"}`);
  if (env.NODE_ENV !== "production" || env.ENABLE_DEV_ROUTES) {
    console.log("Dev routes enabled: POST /dev/seed, DELETE /dev/clear");
  }
});
