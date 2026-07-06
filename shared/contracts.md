This file is the single source of truth for shared schemas and API shapes. Edit only after team sync.

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
| `severity` | string | Estimated severity level |
| `projectTitle` | string | Auto-generated project title |
| `wardId` | string | Mapped ward identifier |
| `aiPriorityScore` | number | AI-assigned priority (0.0–1.0) |
| `backendPriorityScore` | number | Backend-calculated priority (0.0–1.0) |
| `priorityScore` | number | Final priority score (0.0–1.0) |
| `clusterId` | string | Geo-cluster identifier |
| `duplicateCount` | number | Number of similar issues in cluster |
| `priorityExplanation` | array | Human-readable priority reasons |

### AI Signals

| Field | Type | Description |
|-------|------|-------------|
| `aiSignals.translatedText` | string | Translated text (if applicable) |
| `aiSignals.detectedLanguage` | string | Detected language code |
| `aiSignals.photoFindings` | array | Photo analysis results |
| `aiSignals.classificationConfidence` | number | AI classification confidence |
| `aiSignals.modelProvider` | string | `stub` / `gemini` / `vertex` |

### System Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated unique ID |

### Full Issue JSON Example

```json
{
  "id": "issue_1",
  "text": "Road is damaged near the bus stop",
  "language": "en",
  "photoUrl": "https://example.com/photo.jpg",
  "audioUrl": "",
  "latitude": 8.5241,
  "longitude": 76.9366,
  "createdAt": "2026-07-06T12:00:00Z",
  "categoryHint": "roads",
  "finalCategory": "roads",
  "severity": "medium",
  "projectTitle": "Road repair request near reported location",
  "aiPriorityScore": 0.72,
  "backendPriorityScore": 0.82,
  "priorityScore": 0.82,
  "wardId": "15",
  "clusterId": "cluster_1",
  "duplicateCount": 2,
  "priorityExplanation": ["Severity is marked as medium", "Multiple similar reports were found nearby"],
  "aiSignals": {
    "translatedText": "",
    "detectedLanguage": "en",
    "photoFindings": [],
    "classificationConfidence": 0.78,
    "modelProvider": "stub"
  }
}
```

## Shared Enums

```
category = roads | schools | health | sanitation | livelihood | other
severity = low | medium | high
```

## API Contracts

### POST /issues

Submit a new civic issue.

**Request:**

```json
{
  "text": "Road is damaged near the bus stop",
  "language": "en",
  "photoUrl": "https://example.com/photo.jpg",
  "audioUrl": "",
  "latitude": 8.5241,
  "longitude": 76.9366,
  "createdAt": "2026-07-06T12:00:00Z",
  "categoryHint": "roads"
}
```

**Response:**

```json
{
  "ok": true,
  "issueId": "issue_1",
  "priorityScore": 0.82,
  "clusterId": "cluster_1"
}
```

---

### GET /summary

Get aggregated issue statistics for the MP dashboard.

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

Get map-ready hotspot data for the MP dashboard.

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
