# Frontend Integration Handoff

This is the **single source of truth** for frontend-backend integration. All integration details are in one place.

---

## Backend Base URL

```js
const API_BASE_URL = "http://localhost:5001";
```

---

## Frontend Responsibilities

Frontend should call **only** these backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/issues` | POST | Submit a new civic issue |
| `/summary` | GET | Get dashboard statistics |
| `/hotspots` | GET | Get map-ready hotspot data |

Frontend should **never** directly access:

- Firestore
- BigQuery
- Gemini
- Speech-to-Text
- Translation API
- Vision APIs

All AI and database operations happen on the backend.

---

## Submit Issue

### `POST /issues`

**Request body:**

```json
{
  "text": "Large pothole near the bus stop causing traffic issues",
  "language": "en",
  "photoUrl": "https://example.com/photo.jpg",
  "audioUrl": "",
  "latitude": 8.5241,
  "longitude": 76.9366,
  "createdAt": "2026-07-06T12:00:00Z",
  "categoryHint": "roads"
}
```

**Field requirements:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `text` | string | yes | Minimum 5 characters |
| `language` | string | yes | ISO code: `en`, `ml`, `hi`, `ta`, `te` |
| `latitude` | number | yes | Between -90 and 90 |
| `longitude` | number | yes | Between -180 and 180 |
| `createdAt` | string | yes | ISO timestamp |
| `photoUrl` | string | no | URL to uploaded photo |
| `audioUrl` | string | no | URL to uploaded audio |
| `categoryHint` | string | no | `roads`, `schools`, `health`, `sanitation`, `livelihood`, `other` |

**Success response (201):**

```json
{
  "ok": true,
  "issueId": "issue_1",
  "priorityScore": 0.82,
  "clusterId": "cluster_1"
}
```

**Validation error response (400):**

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid issue payload",
    "details": [
      { "field": "text", "message": "text must be at least 5 characters" }
    ]
  }
}
```

---

## Get Summary

### `GET /summary`

**Response:**

```json
{
  "totalIssues": 10,
  "highPriorityIssues": 3,
  "byCategory": [
    { "category": "roads", "count": 4 },
    { "category": "sanitation", "count": 2 },
    { "category": "health", "count": 1 },
    { "category": "schools", "count": 2 },
    { "category": "livelihood", "count": 1 }
  ],
  "bySeverity": [
    { "severity": "medium", "count": 6 },
    { "severity": "high", "count": 3 },
    { "severity": "low", "count": 1 }
  ],
  "topWards": [
    { "wardId": "15", "issues": 5 },
    { "wardId": "7", "issues": 3 }
  ],
  "topProjects": [
    {
      "clusterId": "cluster_1",
      "projectTitle": "Road repair request near reported location",
      "category": "roads",
      "wardId": "15",
      "priorityScore": 0.82,
      "issueCount": 3
    }
  ]
}
```

**Use for:**

- Dashboard summary cards (totalIssues, highPriorityIssues)
- Category breakdown chart (byCategory)
- Severity breakdown chart (bySeverity)
- Top wards list (topWards)
- Priority projects list (topProjects)

---

## Get Hotspots

### `GET /hotspots`

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
      "count": 3,
      "priorityScore": 0.82,
      "projectTitle": "Road repair request near reported location",
      "explanation": [
        "Severity is marked as medium",
        "Multiple similar reports were found nearby",
        "Ward population impact is considered"
      ]
    }
  ]
}
```

**Use for:**

- Google Maps markers or heatmap clusters
- Each hotspot = one map marker/cluster
- `latitude`/`longitude` = marker position
- `priorityScore` = marker color/size
- `explanation` = popup/tooltip content
- `count` = number of similar issues in that area

---

## React/Vite Fetch Examples

### `src/api.js`

```js
const API_BASE_URL = "http://localhost:5001";

export async function submitIssue(issue) {
  const res = await fetch(`${API_BASE_URL}/issues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(issue),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function getSummary() {
  const res = await fetch(`${API_BASE_URL}/summary`);
  return res.json();
}

export async function getHotspots() {
  const res = await fetch(`${API_BASE_URL}/hotspots`);
  return res.json();
}
```

### Usage in React component

```jsx
import { submitIssue, getSummary, getHotspots } from "./api";

// Submit an issue
async function handleSubmit(formData) {
  try {
    const result = await submitIssue({
      text: formData.text,
      language: formData.language,
      photoUrl: formData.photoUrl || "",
      audioUrl: formData.audioUrl || "",
      latitude: formData.latitude,
      longitude: formData.longitude,
      createdAt: new Date().toISOString(),
      categoryHint: formData.categoryHint || "",
    });
    console.log("Issue submitted:", result.issueId);
  } catch (err) {
    console.error("Submission failed:", err.error?.message);
  }
}

// Load summary for dashboard
async function loadDashboard() {
  const summary = await getSummary();
  // summary.totalIssues, summary.byCategory, summary.topProjects, etc.
}

// Load hotspots for map
async function loadMapMarkers() {
  const data = await getHotspots();
  // data.hotspots.forEach(h => createMarker(h.latitude, h.longitude, h))
}
```

---

## Demo Seed Routes

Development-only routes for testing without manual issue submission.

### `POST /dev/seed`

Inserts 10 realistic demo issues across multiple categories.

**PowerShell:**

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5001/dev/seed"
```

**Response:**

```json
{
  "ok": true,
  "inserted": 10,
  "message": "Demo issues seeded successfully"
}
```

### `DELETE /dev/clear`

Clears all demo issues from memory.

**PowerShell:**

```powershell
Invoke-RestMethod -Method Delete -Uri "http://localhost:5001/dev/clear"
```

**Response:**

```json
{
  "ok": true,
  "message": "Demo issues cleared successfully"
}
```

**Note:** These routes are only available when `NODE_ENV !== "production"`.

---

## Frontend Integration Checklist

```
[ ] Set API_BASE_URL to http://localhost:5001
[ ] Submit form calls POST /issues
[ ] Dashboard cards call GET /summary
[ ] Map markers call GET /hotspots
[ ] Run POST /dev/seed before dashboard testing
[ ] Do not hardcode fake dashboard data once backend is running
[ ] Do not directly call Firebase/Gemini/BigQuery from frontend
```

---

## Where Google Tools Fit in Civora

### Firebase / Firestore

**Used for:** Persistent issue storage

**Current status:**
- Repository abstraction is prepared
- Memory mode works locally
- Firestore mode requires Firebase Admin credentials or emulator setup

**Frontend note:** Frontend should not directly write to Firestore. Frontend sends to backend; backend writes to Firestore.

### Gemini API / Vertex AI

**Used for:** Issue classification and enrichment

**Purpose:**
```
citizen text/photo context → category, severity, project title, confidence
```

**Current status:**
- Adapter layer is prepared
- Stub mode is active by default
- Real Gemini/Vertex call can be enabled later with credentials

### Cloud Translation API

**Used for:** Multilingual reports

**Purpose:**
```
Malayalam/Hindi/other language report → normalized English text for classification
```

**Current status:**
- Translation adapter is prepared
- Stub mode currently returns original text

### Cloud Speech-to-Text

**Used for:** Voice-based issue reporting

**Purpose:**
```
citizen audio report → text transcript → normal issue pipeline
```

**Current status:**
- Speech adapter is prepared
- Stub mode currently skips transcription unless real API is configured

### Gemini Multimodal / Vertex AI Vision

**Used for:** Citizen-uploaded photos

**Purpose:**
```
photo of pothole/garbage/smoke/damaged infrastructure → visual findings → better classification/severity
```

**Current status:**
- Vision adapter is prepared
- Stub mode currently returns empty findings

### BigQuery

**Used for:** Analytics and reporting

**Purpose:**
```
ward-level trends, category trends, priority trends, public dataset joins
```

**Current status:**
- BigQuery row mapping/export helper is prepared
- Export is disabled by default

### Google Maps Platform

**Used by:** Frontend / MP dashboard

**Purpose:**
```
render GET /hotspots output as map markers or heatmap clusters
```

**Current status:**
- Backend already returns Maps-ready hotspot payload
- Frontend should consume GET /hotspots and render markers

---

## Google Tools Summary

| Tool | Civora Use | Current Status | Owner |
|------|-----------|----------------|-------|
| Firebase/Firestore | Persistent issue storage | Prepared, not enabled | backend |
| Gemini/Vertex AI | Issue classification | Adapter-ready | ai-services |
| Translation API | Multilingual text normalization | Adapter-ready | ai-services |
| Speech-to-Text | Voice intake | Adapter-ready | ai-services |
| Vision/Gemini multimodal | Photo understanding | Adapter-ready | ai-services |
| BigQuery | Analytics/reporting | Export mapping ready | backend/data |
| Google Maps | Hotspot display | Backend payload ready | frontend |
