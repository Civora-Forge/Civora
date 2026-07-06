# Civora Backend API

This folder contains Civora backend HTTP APIs. It owns request validation, Firestore/BigQuery access, and calls ai-services for issue enrichment.

## Responsibility

- Receive and validate incoming API requests (Zod-based validation)
- Call `ai-services` for issue enrichment (classification, severity, project title)
- Calculate transparent priority scores for each issue
- Detect nearby duplicate/similar issues via geo-clustering
- Generate human-readable explanations for priority scores
- Store enriched issues in memory
- Serve aggregated dashboard summaries and map hotspot data

## Project Structure

```
backend-api/
├── package.json
├── README.md
└── src/
    ├── index.js                    # Express app, health route, middleware, route mounting
    │
    ├── routes/
    │   ├── issues.js               # POST /issues handler
    │   ├── summary.js              # GET /summary handler
    │   └── hotspots.js             # GET /hotspots handler
    │
    ├── schemas/
    │   └── issueSchema.js          # Zod validation schema for issue input
    │
    ├── middleware/
    │   ├── errorHandler.js         # Global error handler
    │   └── requestLogger.js        # Request/response logging
    │
    ├── services/
    │   ├── issueService.js         # Issue submission orchestration
    │   ├── summaryService.js       # Dashboard summary aggregation
    │   ├── hotspotService.js       # Map hotspot aggregation
    │   ├── priorityScoring.js      # Weighted priority score calculation
    │   ├── issueClustering.js      # Geo-based duplicate detection
    │   └── priorityExplanation.js  # Human-readable priority reasons
    │
    ├── repositories/
    │   └── inMemoryIssueRepository.js  # In-memory issue storage
    │
    ├── utils/
    │   ├── geo.js                  # Haversine distance calculation
    │   ├── ids.js                  # ID generation
    │   └── dates.js                # Date utility functions
    │
    └── validators/
        └── issueValidator.js       # Validation adapter (wraps Zod schema)
```

## Setup

### Install dependencies

```bash
cd backend-api
npm install
```

### Run locally

```bash
npm run dev
```

Server starts at `http://localhost:5001`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/issues` | Submit a new civic issue with priority scoring |
| `GET` | `/summary` | Get aggregated dashboard statistics |
| `GET` | `/hotspots` | Get map-ready hotspot data with explanations |

## Priority Scoring

Each issue receives a priority score (0.0–1.0) calculated using a weighted formula:

```
priorityScore =
  0.35 * severityScore
+ 0.25 * duplicateClusterScore
+ 0.20 * populationImpactScore
+ 0.10 * infraScarcityScore
+ 0.10 * recencyScore
```

| Factor | Source |
|--------|--------|
| Severity | `low`=0.3, `medium`=0.6, `high`=1.0 |
| Duplicate cluster | 1 report=0.2, 2–4=0.5, 5–9=0.8, 10+=1.0 |
| Population impact | Ward population (from reference data) |
| Infrastructure scarcity | Lower schools/PHCs = higher score |
| Recency | Today=1.0, within 7 days=0.7, older=0.4 |

## Issue Clustering

Two issues are grouped into the same cluster if:

- Same `finalCategory`
- Same `wardId`
- Distance between coordinates ≤ 300 meters (Haversine formula)

## Manual Verification

### 1. Health check

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/"
```

Expected:

```json
{
  "ok": true,
  "service": "Civora backend API",
  "endpoints": ["POST /issues", "GET /summary", "GET /hotspots"]
}
```

### 2. Invalid payload

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"language":"en","latitude":8.5241,"longitude":76.9366,"createdAt":"2026-07-06T12:00:00Z"}'
```

Expected: `400` with validation error details

### 3. Submit first issue

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"text":"Road is damaged near the bus stop","language":"en","latitude":8.5241,"longitude":76.9366,"createdAt":"2026-07-06T12:00:00Z","categoryHint":"roads"}'
```

Expected:

```json
{
  "ok": true,
  "issueId": "issue_1",
  "priorityScore": 0.62,
  "clusterId": "cluster_1"
}
```

### 4. Submit nearby issue (same cluster)

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"text":"Pothole on main road near school","language":"en","latitude":8.5243,"longitude":76.9368,"createdAt":"2026-07-06T14:00:00Z","categoryHint":"roads"}'
```

Expected:

```json
{
  "ok": true,
  "issueId": "issue_2",
  "priorityScore": 0.77,
  "clusterId": "cluster_1"
}
```

### 5. Get summary

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/summary"
```

Expected: `totalIssues: 2`, `byCategory` includes `roads`, `topProjects` shows clustered issues

### 6. Get hotspots

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/hotspots"
```

Expected: `hotspots` array with cluster data, priority scores, and explanations

## Storage Note

Currently uses **in-memory storage**. Issues are lost when the server restarts. This is intentional for the hackathon MVP.

## Known Limitations

- In-memory storage does not persist across restarts
- Ward reference data is hardcoded (will use Firestore later)
- AI enrichment returns stub values (real Gemini/Vertex integration pending)
- No authentication or rate limiting yet
- No real photo/audio upload processing

## TODOs

- [ ] Replace in-memory storage with Firestore
- [ ] Add BigQuery analytics integration
- [ ] Implement real Gemini/Vertex AI classification
- [ ] Implement Google Speech-to-Text for audio
- [ ] Implement Google Translation API for multilingual
- [ ] Add Firebase Functions deployment config
- [ ] Add authentication and rate limiting
- [ ] Add real ward data from Firestore
