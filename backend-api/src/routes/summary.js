const express = require("express");
const router = express.Router();

// GET /summary - placeholder route
router.get("/", (req, res) => {
  res.status(501).json({ ok: false, error: "Not yet implemented" });
});

module.exports = router;
