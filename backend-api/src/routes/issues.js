const express = require("express");
const router = express.Router();

// POST /issues - placeholder route
router.post("/", (req, res) => {
  res.status(501).json({ ok: false, error: "Not yet implemented" });
});

module.exports = router;
