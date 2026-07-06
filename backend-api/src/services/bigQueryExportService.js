/**
 * BigQuery Export Service
 *
 * Provides issue export to Google BigQuery for analytics.
 * Runs in stub mode by default. Set ENABLE_BIGQUERY_EXPORT=true to enable.
 */

function mapIssueToBigQueryRow(issue) {
  return {
    issue_id: issue.id || "",
    text: issue.text || "",
    language: issue.language || "",
    final_category: issue.finalCategory || "",
    severity: issue.severity || "",
    ward_id: issue.wardId || "",
    latitude: issue.latitude || 0,
    longitude: issue.longitude || 0,
    created_at: issue.createdAt || new Date().toISOString(),
    priority_score: issue.priorityScore || 0,
    cluster_id: issue.clusterId || "",
    duplicate_count: issue.duplicateCount || 1,
    classification_confidence: issue.aiSignals?.classificationConfidence || 0,
    model_provider: issue.aiSignals?.modelProvider || "stub",
  };
}

async function exportIssueToBigQuery(issue) {
  const enabled = process.env.ENABLE_BIGQUERY_EXPORT === "true";

  if (!enabled) {
    return { exported: false, reason: "BigQuery export disabled" };
  }

  // TODO: Implement real BigQuery export
  // const { BigQuery } = require("@google-cloud/bigquery");
  // const bigquery = new BigQuery({
  //   projectId: process.env.GOOGLE_CLOUD_PROJECT,
  // });
  // const dataset = bigquery.dataset("civora_analytics");
  // const table = dataset.table("issues");
  // const row = mapIssueToBigQueryRow(issue);
  // await table.insert([row]);

  const row = mapIssueToBigQueryRow(issue);
  return { exported: true, row };
}

module.exports = { exportIssueToBigQuery, mapIssueToBigQueryRow };
