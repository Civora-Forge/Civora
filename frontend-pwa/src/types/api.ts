// Exact structures per backend-api/docs/frontend-handoff.md

export interface IssueSubmitRequest {
  text: string;
  language: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  photoUrl?: string;
  audioUrl?: string;
  categoryHint?: string; // roads, schools, health, sanitation, livelihood, other
}

export interface IssueSubmitResponse {
  ok: boolean;
  issueId?: string;
  priorityScore?: number;
  clusterId?: string;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface SummaryCategory {
  category: string;
  count: number;
}

export interface SummarySeverity {
  severity: string;
  count: number;
}

export interface SummaryWard {
  wardId: string;
  issues: number;
}

export interface SummaryProject {
  clusterId: string;
  projectTitle: string;
  category: string;
  wardId: string;
  priorityScore: number;
  issueCount: number;
}

export interface SummaryResponse {
  totalIssues: number;
  highPriorityIssues: number;
  byCategory: SummaryCategory[];
  bySeverity: SummarySeverity[];
  topWards: SummaryWard[];
  topProjects: SummaryProject[];
}

export interface Hotspot {
  clusterId: string;
  wardId: string;
  latitude: number;
  longitude: number;
  category: string;
  severity: string;
  count: number;
  priorityScore: number;
  projectTitle: string;
  explanation: string[];
}

export interface HotspotsResponse {
  hotspots: Hotspot[];
}
