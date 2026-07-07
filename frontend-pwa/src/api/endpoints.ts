import { apiClient } from "./client";
import {
  IssueSubmitRequest,
  IssueSubmitResponse,
  SummaryResponse,
  HotspotsResponse,
  SeedResponse,
  ClearResponse,
} from "../types/api";

export async function submitIssue(issue: IssueSubmitRequest): Promise<IssueSubmitResponse> {
  return apiClient<IssueSubmitResponse>("/issues", {
    method: "POST",
    body: JSON.stringify(issue),
  });
}

export async function getSummary(): Promise<SummaryResponse> {
  return apiClient<SummaryResponse>("/summary");
}

export async function getHotspots(): Promise<HotspotsResponse> {
  return apiClient<HotspotsResponse>("/hotspots");
}

export async function seedDemoIssues(): Promise<SeedResponse> {
  return apiClient<SeedResponse>("/dev/seed", { method: "POST" });
}

export async function clearDemoIssues(): Promise<ClearResponse> {
  return apiClient<ClearResponse>("/dev/clear", { method: "DELETE" });
}
