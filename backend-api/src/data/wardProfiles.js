/**
 * Ward Profile Data
 *
 * Loads ward reference data from data-infra CSV if available,
 * otherwise falls back to hardcoded demo data.
 *
 * Each ward profile includes:
 * - wardId, wardName
 * - population
 * - numSchools, numPHCs (health centers)
 * - infrastructureGapScore (derived)
 */

const fs = require("fs");
const path = require("path");

const HARDCODED_WARDS = {
  "15": {
    wardId: "15",
    wardName: "Central Ward",
    population: 25000,
    numSchools: 5,
    numPHCs: 2,
  },
  "7": {
    wardId: "7",
    wardName: "North Ward",
    population: 18000,
    numSchools: 3,
    numPHCs: 1,
  },
  "21": {
    wardId: "21",
    wardName: "Coastal Ward",
    population: 32000,
    numSchools: 4,
    numPHCs: 2,
  },
};

function computeInfrastructureGapScore(numSchools, numPHCs) {
  const totalInfra = (numSchools || 0) + (numPHCs || 0);
  if (totalInfra <= 2) return 1.0;
  if (totalInfra <= 4) return 0.7;
  if (totalInfra <= 6) return 0.5;
  return 0.3;
}

let cachedProfiles = null;

function loadFromCsv() {
  try {
    // Try multiple possible paths (works both locally and when deployed)
    const possiblePaths = [
      path.join(__dirname, "../../../../data-infra/samples/ward_sample.csv"),
      path.join(__dirname, "../../../data-infra/samples/ward_sample.csv"),
    ];

    let csvPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) return null;

    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.trim().split("\n");
    if (lines.length < 2) return null;

    const headers = lines[0].split(",").map((h) => h.trim());
    const profiles = {};

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx];
      });

      const wardId = row.wardId;
      if (!wardId) continue;

      const population = parseInt(row.population, 10) || 10000;
      const numSchools = parseInt(row.numSchools, 10) || 2;
      const numPHCs = parseInt(row.numPHCs, 10) || 1;

      profiles[wardId] = {
        wardId,
        wardName: row.wardName || `Ward ${wardId}`,
        population,
        numSchools,
        numPHCs,
        infrastructureGapScore: computeInfrastructureGapScore(numSchools, numPHCs),
      };
    }

    return Object.keys(profiles).length > 0 ? profiles : null;
  } catch (err) {
    console.warn("wardProfiles: failed to load CSV:", err.message);
    return null;
  }
}

function getWardProfiles() {
  if (cachedProfiles) return cachedProfiles;

  const csvData = loadFromCsv();
  if (csvData) {
    console.log("wardProfiles: loaded from CSV");
    cachedProfiles = csvData;
  } else {
    console.log("wardProfiles: using hardcoded fallback");
    // Add infrastructureGapScore to hardcoded data
    cachedProfiles = {};
    for (const [id, ward] of Object.entries(HARDCODED_WARDS)) {
      cachedProfiles[id] = {
        ...ward,
        infrastructureGapScore: computeInfrastructureGapScore(ward.numSchools, ward.numPHCs),
      };
    }
  }

  return cachedProfiles;
}

function getWardProfile(wardId) {
  const profiles = getWardProfiles();
  return profiles[wardId] || null;
}

function getAllWardIds() {
  return Object.keys(getWardProfiles());
}

module.exports = {
  getWardProfile,
  getWardProfiles,
  getAllWardIds,
  computeInfrastructureGapScore,
};
