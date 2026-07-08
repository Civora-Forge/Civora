import { apiClient } from "./client";

export async function submitIssue(issue) {
  return apiClient("/issues", {
    method: "POST",
    body: JSON.stringify(issue),
  });
}

export async function getSummary() {
  return apiClient("/summary");
}

export async function getHotspots() {
  return apiClient("/hotspots");
}
