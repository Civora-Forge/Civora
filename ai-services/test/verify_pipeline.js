const assert = require("assert");

process.env.AI_GEMINI_MOCK = "1";

const { enrichIssue } = require("../src/enrichIssue");

const TOP_LEVEL_FIELDS = [
  "finalCategory",
  "severity",
  "issueTheme",
  "projectTitle",
  "recommendedDepartment",
  "justification",
];

const CLASSIFICATION_FIELDS = [
  "category",
  "subcategory",
  "severity",
  "summary",
  "issueTheme",
  "projectTitle",
  "recommendedDepartment",
  "justification",
  "confidence",
];

const TEST_ISSUES = [
  {
    name: "Road Repair",
    issue: {
      text: "Large pothole near the bus stop on the main road causing traffic jams and accidents",
      language: "en",
      photoUrl: "",
      audioUrl: "",
      latitude: 8.5241,
      longitude: 76.9366,
      createdAt: new Date().toISOString(),
      categoryHint: "roads",
      wardId: "15",
    },
  },
  {
    name: "School Upgrade",
    issue: {
      text: "Government school building has leaking roof and broken benches in three classrooms",
      language: "en",
      photoUrl: "",
      audioUrl: "",
      latitude: 8.5280,
      longitude: 76.9400,
      createdAt: new Date().toISOString(),
      categoryHint: "schools",
      wardId: "21",
    },
  },
  {
    name: "PHC Improvement",
    issue: {
      text: "Primary health centre lacks essential medicines and there is no doctor available on weekends",
      language: "en",
      photoUrl: "",
      audioUrl: "",
      latitude: 8.5270,
      longitude: 76.9390,
      createdAt: new Date().toISOString(),
      categoryHint: "health",
      wardId: "7",
    },
  },
  {
    name: "Water Supply",
    issue: {
      text: "No piped water supply in ward 15 for the past one week, residents are buying water from tankers",
      language: "en",
      photoUrl: "",
      audioUrl: "",
      latitude: 8.5300,
      longitude: 76.9420,
      createdAt: new Date().toISOString(),
      categoryHint: "sanitation",
      wardId: "15",
    },
  },
  {
    name: "Drainage",
    issue: {
      text: "Drainage overflow during rain causing waterlogging and foul smell near the market area",
      language: "en",
      photoUrl: "",
      audioUrl: "",
      latitude: 8.5262,
      longitude: 76.9382,
      createdAt: new Date().toISOString(),
      categoryHint: "sanitation",
      wardId: "21",
    },
  },
  {
    name: "Street Lighting",
    issue: {
      text: "Street light not working on the main road near the school for the last 15 days",
      language: "en",
      photoUrl: "",
      audioUrl: "",
      latitude: 8.5250,
      longitude: 76.9375,
      createdAt: new Date().toISOString(),
      categoryHint: "roads",
      wardId: "7",
    },
  },
];

function checkField(label, value, fieldName) {
  const isEmpty = value === undefined || value === null || value === "";
  if (isEmpty) {
    console.error(`  [FAIL] ${fieldName} is empty/missing`);
    return false;
  }
  if (typeof value === "number" && value === 0) {
    console.log(`  [WARN] ${fieldName} is 0 (stub mode)`);
    return true;
  }
  console.log(`  [PASS] ${fieldName}: "${String(value).substring(0, 80)}"`);
  return true;
}

async function verifySingleIssue(issueDef) {
  const { name, issue } = issueDef;
  console.log(`\n${"=".repeat(72)}`);
  console.log(`Issue: ${name}`);
  console.log(`Input text: "${issue.text}"`);
  console.log(`Category hint: ${issue.categoryHint}`);
  console.log(`Ward: ${issue.wardId}`);
  console.log(`-`.repeat(72));

  const result = await enrichIssue(issue);

  console.log("\nEnriched output:");
  console.log(JSON.stringify(result, null, 2));

  console.log("\nTop-level field verification:");
  let allPassed = true;

  for (const field of TOP_LEVEL_FIELDS) {
    const value = result[field];
    if (!checkField(name, value, field)) {
      allPassed = false;
    }
  }

  if (result.classification) {
    console.log("\nClassification sub-object verification:");
    for (const field of CLASSIFICATION_FIELDS) {
      const value = result.classification[field];
      if (value === undefined || value === null || value === "") {
        console.log(`  [FAIL] classification.${field} is empty/missing`);
        allPassed = false;
      } else if (typeof value === "number" && value === 0) {
        console.log(`  [WARN] classification.${field} is 0 (stub mode)`);
      } else {
        console.log(`  [PASS] classification.${field}: "${String(value).substring(0, 80)}"`);
      }
    }
  }

  return allPassed;
}

async function main() {
  console.log("Civora AI Pipeline Verification Script");
  console.log(`Mode: ${process.env.GEMINI_API_KEY ? "live (GEMINI_API_KEY set)" : "stub (AI_GEMINI_MOCK=1)"}`);
  console.log(`Test issues: ${TEST_ISSUES.length}`);

  let passed = 0;
  let failed = 0;

  for (const issueDef of TEST_ISSUES) {
    const ok = await verifySingleIssue(issueDef);
    if (ok) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n${"=".repeat(72)}`);
  console.log(`Results: ${passed}/${TEST_ISSUES.length} passed, ${failed} failed`);
  console.log(`\nPipeline verification ${failed === 0 ? "SUCCEEDED" : "FAILED"}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(2);
});
