const assert = require("assert");

process.chdir(__dirname + "/../");

function loadClusteringModule() {
  const modulePath = require.resolve("../src/services/issueClustering");
  delete require.cache[modulePath];
  return require("../src/services/issueClustering");
}

async function run() {
  let failures = 0;
  const { assignClusterIds, cosineSimilarity, summarizeCluster } = loadClusteringModule();

  try {
    const similar = cosineSimilarity("Large pothole in road near school", "Road pothole beside the school gate");
    const different = cosineSimilarity("Blocked drainage causing flooding", "Broken classroom window at school");
    assert(similar > different, "semantic similarity should be higher for related summaries");
    console.log("[PASS] clustering similarity scoring");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] clustering similarity scoring:", err.message);
  }

  try {
    const issues = [
      { id: "1", createdAt: "2026-07-07T00:00:00Z", text: "Road pothole near market", projectTitle: "Road pothole near market", wardId: "15" },
      { id: "2", createdAt: "2026-07-07T00:01:00Z", text: "Another pothole on the road by market", projectTitle: "Another pothole on the road by market", wardId: "15" },
      { id: "3", createdAt: "2026-07-07T00:02:00Z", text: "Broken classroom bench", projectTitle: "Broken classroom bench", wardId: "15" },
    ];

    const { issueClusterMap, clusters } = assignClusterIds(issues, { similarityThreshold: 0.2 });
    assert.strictEqual(issueClusterMap["1"].clusterId, issueClusterMap["2"].clusterId, "similar issues should cluster together");
    assert.notStrictEqual(issueClusterMap["1"].clusterId, issueClusterMap["3"].clusterId, "different issues should not cluster together");
    assert(issueClusterMap["1"].clusterSummary.length > 0, "cluster summary should be present");
    assert(clusters[0].clusterSummary.length > 0, "cluster summary should be generated on clusters");
    console.log("[PASS] clustering groups similar issues");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] clustering groups similar issues:", err.message);
  }

  try {
    const summary = summarizeCluster([
      { text: "Road pothole near market" },
      { text: "Road pothole by the market" },
    ]);
    assert(summary.includes("pothole"), "cluster summary should include shared topic terms");
    console.log("[PASS] clustering summary generation");
  } catch (err) {
    failures += 1;
    console.error("[FAIL] clustering summary generation:", err.message);
  }

  if (failures > 0) {
    console.error(`${failures} clustering test(s) failed`);
    process.exit(1);
  }

  console.log("All clustering tests passed");
  process.exit(0);
}

run().catch((err) => {
  console.error("Clustering test runner error:", err && err.message ? err.message : err);
  process.exit(2);
});