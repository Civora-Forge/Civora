Single source of truth for shared schemas and API shapes. Edit only after team sync.

---

## Issue Schema

### Raw Fields (submitted by citizen)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | yes | Citizen description of the issue |
| `language` | string | yes | ISO language code (e.g., `en`, `ml`) |
| `photoUrl` | string | no | URL to uploaded photo |
| `audioUrl` | string | no | URL to uploaded audio |
| `latitude` | number | yes | GPS latitude |
| `longitude` | number | yes | GPS longitude |
| `createdAt` | string | yes | ISO timestamp |
| `categoryHint` | string | no | Citizen-suggested category |

### AI-Enriched Fields (added by backend)

| Field | Type | Description |
|-------|------|-------------|
| `finalCategory` | string | AI-determined category |
| `severity` | string | `low` / `medium` / `high` |
| `projectTitle` | string | Auto-generated project title |
| `issueTheme` | string | e.g. "Road Repair", "Primary Healthcare" |
| `recommendedDepartment` | string | e.g. "Public Works Department" |
| `justification` | string | AI justification for classification |
| `wardId` | string | Mapped ward identifier |
| `aiPriorityScore` | number | AI-assigned priority (0.0-1.0) |
| `backendPriorityScore` | number | Backend-calculated priority (0.0-1.0) |
| `priorityScore` | number | Final priority score (0.0-1.0) |
| `clusterId` | string | Geo-cluster identifier |
| `clusterSummary` | string | Human-readable cluster description |
| `duplicateCount` | number | Number of similar issues in cluster |
| `priorityExplanation` | string[] | Human-readable priority reasons |

### AI Signals

| Field | Type | Description |
|-------|------|-------------|
| `aiSignals.speechTranscript` | string | Transcribed audio text |
| `aiSignals.speechLanguage` | string | Detected speech language |
| `aiSignals.speechConfidence` | number | Speech transcription confidence |
| `aiSignals.translatedText` | string | Translated text (if applicable) |
| `aiSignals.detectedLanguage` | string | Detected language code |
| `aiSignals.imageSummary` | string | Photo analysis summary |
| `aiSignals.imageObjects` | string[] | Detected objects in photo |
| `aiSignals.imagePossibleIssue` | string | AI-detected issue from photo |
| `aiSignals.imageConfidence` | number | Image analysis confidence |
| `aiSignals.photoFindings` | string[] | Photo analysis results |
| `aiSignals.classificationConfidence` | number | Classification confidence |
| `aiSignals.modelProvider` | string | `stub` / `gemini` / `vertex` |

### Classification Object

| Field | Type | Description |
|-------|------|-------------|
| `classification.category` | string | Classified category |
| `classification.subcategory` | string | Subcategory |
| `classification.severity` | string | Severity level |
| `classification.summary` | string | Classification summary |
| `classification.confidence` | number | Confidence score |
| `classification.issueTheme` | string | Issue theme |
| `classification.recommendedDepartment` | string | Recommended department |
| `classification.justification` | string | Classification justification |

---

## Shared Enums

```
category = roads | schools | health | sanitation | livelihood | other
severity = low | medium | high
```

---

## API Contracts

Base URL: `http://localhost:5001`

### Authentication

Firebase Auth is **optional**. When `ENABLE_FIREBASE_AUTH=false` (default):
- POST /issues accepts anonymous submissions (no token required)
- GET /issues/my returns 401 with `AUTH_DISABLED` error

When `ENABLE_FIREBASE_AUTH=true`:
- POST /issues still works without a token (anonymous)
- POST /issues with `Authorization: Bearer <Firebase ID token>` attaches userId
- GET /issues/my requires a valid Firebase ID token
- Invalid tokens are silently ignored on POST /issues (no rejection)

Frontend should send: `Authorization: Bearer <Firebase ID token>`

---

### GET /

Health check.

```json
{
  "ok": true,
  "service": "Civora backend API",
  "version": "0.3.0",
  "environment": "development",
  "repository": "memory",
  "aiEnrichment": "stub",
  "bigqueryExport": "disabled",
  "endpoints": ["POST /issues", "GET /issues/my", "GET /summary", "GET /hotspots", "GET /wards"]
}
```

---

### POST /issues (optional auth)

Submit a new civic issue. Returns enriched result with AI classification, priority scoring, and clustering.

**Authentication (optional):**
- Anonymous submissions work without any `Authorization` header.
- If `ENABLE_FIREBASE_AUTH=true` and `Authorization: Bearer <Firebase ID token>` is provided, the token is verified and `userId` is attached to the stored issue.
- Invalid tokens are silently ignored — the request proceeds anonymously (no 401).

**Request (anonymous):**

```json
{
  "text": "Road is damaged near the bus stop",
  "language": "en",
  "photoUrl": "",
  "audioUrl": "",
  "latitude": 8.5241,
  "longitude": 76.9366,
  "createdAt": "2026-07-06T12:00:00Z",
  "categoryHint": "roads"
}
```

**Request (authenticated):**

Same body, plus header:
```
Authorization: Bearer <Firebase ID token>
```

**Response (201):**

```json
{
  "ok": true,
  "issueId": "issue_1",
  "priorityScore": 0.82,
  "clusterId": "cluster_1",
  "clusterSummary": "Road repair request near reported location",
  "explanation": ["Severity is marked as medium", "Multiple similar reports were found nearby"],
  "projectTitle": "Road repair request near reported location",
  "issueTheme": "Road Repair",
  "recommendedDepartment": "Public Works Department",
  "finalCategory": "roads",
  "severity": "medium"
}
```

**Error Response (400):**

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid issue payload",
    "details": [...]
  }
}
```

---

### GET /issues/my (requires auth)

Returns all issues submitted by the authenticated user.

**Authentication:** Required. Must include `Authorization: Bearer <Firebase ID token>`.

**Response (200):**

```json
{
  "ok": true,
  "count": 3,
  "issues": [
    {
      "issueId": "issue_1",
      "text": "Road is damaged near the bus stop",
      "finalCategory": "roads",
      "projectTitle": "Road repair request near reported location",
      "issueTheme": "Road Repair",
      "recommendedDepartment": "Public Works Department",
      "severity": "medium",
      "priorityScore": 0.82,
      "clusterId": "cluster_1",
      "createdAt": "2026-07-06T12:00:00Z"
    }
  ]
}
```

**Error Response (401) — auth disabled:**

```json
{
  "ok": false,
  "error": {
    "code": "AUTH_DISABLED",
    "message": "Authentication is not enabled on this server"
  }
}
```

**Error Response (401) — no token:**

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Valid Firebase ID token required"
  }
}
```

---

### GET /summary

Aggregated issue statistics for the MP dashboard.

**Response:**

```json
{
  "totalIssues": 123,
  "highPriorityIssues": 15,
  "byCategory": [
    { "category": "roads", "count": 50 },
    { "category": "schools", "count": 30 }
  ],
  "bySeverity": [
    { "severity": "high", "count": 15 },
    { "severity": "medium", "count": 60 }
  ],
  "topWards": [
    { "wardId": "15", "issues": 20 },
    { "wardId": "7", "issues": 18 }
  ],
  "topProjects": [
    {
      "clusterId": "cluster_1",
      "projectTitle": "Road repair request near reported location",
      "category": "roads",
      "wardId": "15",
      "priorityScore": 0.82,
      "issueCount": 5
    }
  ]
}
```

---

### GET /hotspots

Map-ready hotspot data for the MP dashboard.

**Response:**

```json
{
  "hotspots": [
    {
      "clusterId": "cluster_1",
      "wardId": "15",
      "latitude": 8.5241,
      "longitude": 76.9366,
      "category": "roads",
      "severity": "medium",
      "count": 5,
      "priorityScore": 0.82,
      "projectTitle": "Road repair request near reported location",
      "explanation": ["Severity is marked as medium", "Multiple similar reports were found nearby"]
    }
  ]
}
```

---

### POST /dev/seed (dev only)

Seed 10 demo issues.

**Response:**

```json
{
  "ok": true,
  "inserted": 10,
  "message": "Demo issues seeded successfully"
}
```

---

### DELETE /dev/clear (dev only)

Clear all issues from memory.

**Response:**

```json
{
  "ok": true,
  "message": "Demo issues cleared successfully"
}
```
