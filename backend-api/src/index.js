const express = require("express");
const cors = require("cors");
const { requestLogger } = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");

const issuesRouter = require("./routes/issues");
const summaryRouter = require("./routes/summary");
const hotspotsRouter = require("./routes/hotspots");

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

const PORT = process.env.PORT || 5001;

// Health route
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Civora backend API",
    endpoints: ["POST /issues", "GET /summary", "GET /hotspots"],
  });
});

// Mount routes
app.use("/issues", issuesRouter);
app.use("/summary", summaryRouter);
app.use("/hotspots", hotspotsRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Civora backend running on http://localhost:${PORT}`);
});
