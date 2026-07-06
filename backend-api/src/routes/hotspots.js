const express = require("express");
const router = express.Router();
const { buildHotspots } = require("../services/hotspotService");

router.get("/", async (req, res) => {
  const hotspots = await buildHotspots();
  return res.json(hotspots);
});

module.exports = router;
