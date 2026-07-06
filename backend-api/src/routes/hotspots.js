const express = require("express");
const router = express.Router();
const { buildHotspots } = require("../services/hotspotService");

router.get("/", (req, res) => {
  const hotspots = buildHotspots();
  return res.json(hotspots);
});

module.exports = router;
