const express = require("express");
const router = express.Router();
const { getWardProfiles, getWardProfile } = require("../data/wardProfiles");

// GET /wards — list all ward profiles
router.get("/", (req, res) => {
  const profiles = getWardProfiles();
  const wards = Object.values(profiles);
  return res.json({ wards });
});

// GET /wards/:id — get a single ward profile
router.get("/:id", (req, res) => {
  const profile = getWardProfile(req.params.id);
  if (!profile) {
    return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Ward not found" } });
  }
  return res.json(profile);
});

module.exports = router;
